# SESSION PERSISTENCE — Persistência de Sessão do Builder

> Fase 14 do roadmap. Documenta a persistência local (V1) do progresso do Builder — recuperação
> após refresh/fechar a aba, expiração, versionamento e o conceito (ainda não implementado) de
> abandono. Implementação em `lib/persistence/builderSession.ts` e
> `features/builder/state/useBuilderSessionPersistence.ts`.

---

## 1. Objetivo

Fazer o progresso do usuário sobreviver a um refresh, ao fechar a aba/navegador e voltar depois —
sem exigir login nem depender do Supabase (Fase 13) estar configurado. A persistência **nunca é a
fonte de verdade**: ela só espelha o `BuilderState` (`features/builder`) e o `leadDraft`
(`features/lead`) que já existem. Fluxo:

```
STATE → SERIALIZE → STORAGE          (saveBuilderSession)
STORAGE → VALIDATE → HYDRATE → STATE (loadBuilderSession)
```

## 2. `session_id`

Um UUID (`crypto.randomUUID()`, com fallback simples — `lib/utils/generateId.ts`) identifica uma
jornada anônima. Gerado uma única vez por sessão de navegador: na primeira visita, ou quando uma
sessão anterior expira/é descartada/é reiniciada ("Começar de novo"). Reutilizado em todo refresh
enquanto a sessão continuar válida — nunca gerado de novo só porque a página recarregou. Vive como
estado local do hook `useBuilderSessionPersistence` (não dentro de `BuilderState`; ver Seção 15
sobre essa escolha).

## 3. Storage escolhido

`localStorage`, sob a chave versionada `upgrade-builder:v1` — exatamente a estratégia já desenhada
em `docs/TECHNICAL-ARCHITECTURE.md`, Seção 23 ("V1... localStorage, sob uma chave versionada").
Preferido a `sessionStorage` porque o objetivo explícito desta fase é sobreviver a fechar a aba/o
navegador, não só a um refresh. Nenhuma sincronização remota (Supabase) foi adicionada — ver Seção
15, "Sessão anônima no Supabase".

## 4. Estrutura persistida

```ts
interface PersistedBuilderSession {
  version: 1;
  sessionId: string;
  updatedAt: string; // ISO
  builder: {
    step; activeService; editingService; serviceDraft; draftHistory;
    confirmedServices; returnStep;
  };
  lead: { leadDraft: LeadFormData };
}
```

Só respostas e estado — nunca o catálogo de perguntas (`features/builder/data/*`), que já existe no
código e é recalculado ao vivo a cada carregamento (Seção 10).

## 5. Campos NÃO persistidos

- `error` (`BuilderState.error`) — transitório por natureza (mensagem de uma falha pontual); nunca
  faria sentido reaparecer depois de um refresh sem o contexto que a gerou.
- Qualquer estado puramente visual (painel "Meu Upgrade" aberto/fechado, foco, hover, loading local
  de um componente) — vive em `useState` local dos próprios componentes, nunca chega perto deste
  módulo.
- `idempotencyKey` (Fase 13) — gerada por carregamento de página, não por sessão; ver Seção 15.

## 6. TTL

**7 dias**, contados a partir de `updatedAt` (a cada save, não só na criação). Prazo generoso o
bastante para alguém voltar depois de um fim de semana ou de "vou pensar melhor", mas curto o
bastante para nunca reviver dados de contato antigos por engano. Ao carregar, se
`Date.now() - Date.parse(updatedAt) > 7 dias`, a sessão é tratada como expirada: descartada e o
`localStorage` é limpo (nunca fica "quase expirada" pela metade).

## 7. Versionamento

`version: 1` (constante `BUILDER_SESSION_VERSION`). Ao carregar, uma versão diferente da atual
descarta a sessão inteira com segurança — sem tentativa de migração automática nesta fase (pedido
explícito do briefing: "não criar sistema complexo agora"). Quando o formato mudar de verdade
(ex.: novo campo obrigatório, formato de resposta diferente), a versão sobe para `2`; um
mecanismo de migração real só se justifica se/quando isso acontecer.

## 8. Hidratação

Lida **só depois do primeiro render no cliente**, dentro de um `useEffect` — nunca durante o
render, e nunca em Server Component (`localStorage` não existe lá). Isso é o que evita hydration
mismatch de SSR: o servidor (e o primeiro render do cliente, antes do efeito rodar) sempre produzem
o mesmo HTML "vazio", e só depois disso a sessão real é aplicada. Um estado curto `isHydrating`
(local ao hook, não um novo `BuilderStep`) cobre essa janela: `BuilderShell` mostra um placeholder
mínimo ("Carregando...") em vez de arriscar mostrar o seletor vazio por um instante e trocar de
figura logo em seguida.

## 9. Auto-save

Duas gravações independentes, deliberadamente com estratégias diferentes:

- **Builder** (`state`) — **imediato**, sem debounce, a cada mudança relevante (responder, salvar,
  cancelar, remover, mudar de etapa — qualquer dispatch no reducer já produz um `state` novo,
  então observar `state` inteiro cobre todos os gatilhos pedidos no briefing sem precisar listar
  cada tipo de ação).
- **`leadDraft`** — com um debounce curto (300ms), porque é o único campo realmente "digitado" que
  este hook observa; sem o debounce, cada tecla gravaria no `localStorage`.

**Por que não um único debounce cobrindo os dois** (a escolha original desta fase, corrigida ainda
durante o teste manual): um `setTimeout` agendado dentro de um efeito que só depende de `leadDraft`
fecha sobre o `state` de quando foi agendado, não o de quando dispara. Se `leadDraft` não mudasse de
novo nesse intervalo, o timer disparava 300ms depois com o `state` antigo — sobrescrevendo uma
gravação mais recente feita pelo efeito do Builder. Descoberto no Teste Manual C original
(cancelar uma edição e dar refresh logo em seguida às vezes "esquecia" o cancelamento). Corrigido
separando os dois efeitos e usando um `useRef` para o efeito do `leadDraft` sempre ler o `state`
mais atual, nunca um fechado por closure.

## 10. Recuperação

Ao encontrar uma sessão válida, o hook chama `hydrateSession(...)` (substitui o `BuilderState`
inteiro) e `updateLeadDraft(...)`, e mostra uma mensagem discreta ("Seu progresso foi recuperado."),
que some sozinha depois de alguns segundos — nunca um popup pedindo confirmação. A pergunta/tela
exibida nunca vem de uma lista salva: `QuestionRenderer` sempre recalcula a próxima pergunta visível
a partir de `serviceDraft` e do motor atual (`getNextQuestion`, `features/builder/logic/flow.ts`),
então uma pergunta removida ou alterada no código nunca deixa a UI presa a uma tela que não existe
mais.

**Recuperação de inconsistências** (nunca descarta a sessão inteira por causa de UM campo ruim):

- `confirmedServices`/`activeService`/`editingService` com um `serviceId` que não existe mais em
  `SERVICES` → removido/anulado, com aviso em desenvolvimento.
- `editingService` presente mas `serviceDraft` vazio (só possível via corrupção externa do
  storage — o reducer real nunca produz essa combinação) → a edição é cancelada, `confirmedServices`
  permanece intacto.
- `step` de `"configuring"`/`"service_complete"` sem `activeService`, ou de
  `"reviewing"`/`"contact"`/`"success"` sem nenhum serviço confirmado → volta para
  `"choosing_service"`.
- `step` de `"submitting"`/`"error"` → sempre vira `"contact"` (com serviços confirmados) ou
  `"choosing_service"` (sem nenhum) — o envio em voo não existe mais depois de um refresh, e a
  mensagem de erro nunca foi persistida (Seção 5), então a única continuação seva é devolver o
  formulário, intacto, para tentar de novo.

## 11. Reset

Ação "Começar de novo" (`BuilderNavigation`, discreta — sem destaque alto na UI, como pedido),
atrás de uma confirmação simples (`window.confirm`, sem modal customizado). Limpa
`confirmedServices`, `serviceDraft`, `leadDraft`, o `localStorage`, e gera um **novo** `sessionId`
(é uma jornada anônima diferente, não uma continuação).

## 12. SUCCESS e limpeza

Depois de um envio bem-sucedido, o `state.step === "success"` é persistido normalmente — um refresh
na tela de sucesso continua mostrando a confirmação e o resumo, nunca perde os dados enquanto essa
tela está visível (pedido explícito do briefing). A sessão só é limpa quando o usuário clica
"Iniciar novo projeto" (novo botão em `SubmissionSuccess`) — nunca automaticamente.

## 13. Privacidade

`leadDraft` pode conter dados pessoais (nome, WhatsApp, e-mail) mesmo antes de qualquer envio real —
esses dados ficam **somente no dispositivo do usuário** (`localStorage`, nunca enviados a lugar
nenhum enquanto não houver um `submit` explícito, Fase 12/13) e expiram no mesmo TTL de 7 dias que o
resto da sessão (Seção 6) — não há armazenamento indefinido.

## 14. Multi-tab

Sem sincronização entre abas nesta fase (`storage` events não implementados — o briefing marcou
isso como opcional). Estratégia: **a última gravação vence**. Duas abas editando o mesmo Builder ao
mesmo tempo podem se sobrescrever uma à outra; isso é uma limitação conhecida e aceitável para uma
jornada tipicamente feita numa aba só, não um caso de uso que o produto precisa suportar agora.

## 15. Limitações e decisões conscientemente adiadas

- **`sessionId` fora de `BuilderState`**: `docs/TECHNICAL-ARCHITECTURE.md` (Seção 7, Fase 6) já
  esboçava um campo `sessionId` dentro do estado do reducer — mas esse esboço é anterior à forma
  real que `BuilderState` tomou (Fase 8+, com `serviceDraft`/`confirmedServices`/`returnStep`, não
  `answers`/`upgrade`/`history`). Manter `sessionId` como estado local do hook de persistência (não
  no reducer) evita misturar uma preocupação de infraestrutura dentro do estado de negócio puro do
  Builder — nada na UI precisa ler `sessionId` reativamente hoje.
- **`idempotencyKey` (Fase 13) não é persistido/restaurado** — continua gerado uma vez por
  carregamento de página (`LeadProvider`). Como nada foi de fato enviado com a chave antiga antes de
  um refresh, gerar uma nova a cada carregamento não tem efeito colateral real e evita mais um campo
  no schema persistido.
- **Sessão anônima no Supabase**: avaliado e **não implementado** — o briefing pediu para só fazer
  isso "se houver grande benefício" e explicar antes. Não há hoje nenhuma tela ou fluxo que precise
  recuperar uma sessão em outro dispositivo, nem qualquer analytics real (Fase 17) para associar a
  ela; adicionar uma tabela/sincronização agora seria complexidade sem consumidor. Preparado
  conceitualmente via `lib/persistence/buildAbandonmentSnapshot.ts` (Seção seguinte).
- **Migração real entre versões do schema**: não implementada — uma incompatibilidade de versão
  simplesmente descarta a sessão (Seção 7). Se isso se tornar frequente/custoso, uma função de
  migração por versão pode ser adicionada depois sem mudar a interface pública deste módulo.
- **Multi-tab**: ver Seção 14.

## 16. Abandono (preparação conceitual, Fase 17)

`lib/persistence/buildAbandonmentSnapshot.ts` define `AbandonmentSnapshot` e uma função pura que a
deriva do `BuilderState` — `sessionId`, `lastStep`, `activeService`, `confirmedServiceCount`,
`contactStarted`, `submitted`, `updatedAt`. Não está conectada a nenhum destino real (sem evento
disparado, sem Supabase, sem chamada de rede) — só a estrutura e a lógica de derivação, prontas para
quando a Fase 17 (Analytics) precisar delas. Nenhum dado pessoal é incluído.
