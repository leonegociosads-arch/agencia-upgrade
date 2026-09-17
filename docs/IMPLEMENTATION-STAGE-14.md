# IMPLEMENTATION STAGE 14 — Salvamento de Sessões e Abandono

> Fase 14 do roadmap. Implementa persistência local (V1, `localStorage`) do progresso do Builder —
> recuperação após refresh/fechar a aba, expiração (TTL de 7 dias), versionamento de schema,
> hidratação sem hydration mismatch de SSR, auto-save, reset manual, e a estrutura conceitual (não
> conectada) de abandono para a Fase 17. Não implementa Lead Score, painel administrativo,
> analytics completo, e-mail/WhatsApp finais, UI premium nem motion.

---

## 1. Implementação

Camada isolada em `lib/persistence/builderSession.ts` (nunca `localStorage` direto num componente):
`saveBuilderSession`, `loadBuilderSession`, `clearBuilderSession`, `validateStoredSession`,
`sanitizeRestoredSession` — exatamente os nomes sugeridos no briefing. Orquestrada por um hook,
`features/builder/state/useBuilderSessionPersistence.ts`, chamado uma única vez em `BuilderShell`.
Ver `docs/SESSION-PERSISTENCE.md` para a documentação completa da estratégia.

## 2. Camada de persistência

Zod usado para a validação estrutural (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 17: já era a
ferramenta recomendada para a fronteira de persistência). Validação em duas etapas deliberadamente
separadas: `validateStoredSession` cuida de forma/version/TTL (descarta a sessão inteira só nesses
casos); `sanitizeRestoredSession` cuida de coerência de negócio (serviceId desconhecido,
`editingService` sem rascunho, `step` incoerente) — nunca descarta a sessão inteira por um campo
ruim, só neutraliza a parte afetada.

## 3. Session schema

```ts
interface PersistedBuilderSession {
  version: 1;
  sessionId: string;
  updatedAt: string;
  builder: { step; activeService; editingService; serviceDraft; draftHistory; confirmedServices; returnStep };
  lead: { leadDraft: LeadFormData };
}
```

Chave: `upgrade-builder:v1` (a mesma sugerida em `docs/TECHNICAL-ARCHITECTURE.md`, Seção 23). TTL de
7 dias. `error` nunca é persistido (Seção "O que NÃO persistir",
`docs/SESSION-PERSISTENCE.md`).

## 4. Hidratação

`useEffect` de montagem única em `useBuilderSessionPersistence`, nunca durante o render — evita
hydration mismatch de SSR (`/builder` é uma rota estática prerenderizada; o servidor não tem acesso
a `localStorage`, e o primeiro render do cliente precisa bater exatamente com o HTML prerenderizado
antes de qualquer leitura de storage acontecer). Um `isHydrating` local ao hook (não um novo
`BuilderStep`) cobre a janela curta entre montar e hidratar; `BuilderShell` mostra um placeholder
mínimo nesse meio-tempo.

Novas ações de reducer: `HYDRATE_SESSION` (substitui o estado inteiro por uma sessão já
saneada) e `RESET_BUILDER` (volta ao estado inicial). `LeadContext` ganhou `resetLeadDraft()`
(reset do formulário + nova `idempotencyKey`, já que reiniciar é uma jornada de envio diferente).

## 5. Drafts

`serviceDraft`/`editingService`/`confirmedServices` são persistidos e restaurados tal como estão —
o cenário do briefing ("confirmed = E-commerce, draft = Institucional, fecha a aba, volta: confirmed
continua E-commerce, draft continua Institucional") funciona porque a estrutura já mantinha essa
separação desde a Fase 8; esta fase só precisou serializar/desserializar sem misturar os dois. A
pergunta mostrada depois de restaurar nunca vem de uma lista salva: `QuestionRenderer` sempre
recalcula a próxima pergunta visível a partir de `serviceDraft` e do motor atual
(`getNextQuestion`), então perguntas alteradas/removidas no código nunca deixam a UI presa.

## 6. `leadDraft`

Sincronizado a cada tecla digitada (`LeadForm.tsx`, dentro do wrapper de `onChange` que já existia
para revalidação — `persistDraft()` agora roda ali também) para dentro do `LeadContext`; o auto-save
grava isso no `localStorage` com um pequeno debounce (300ms) — só ele, não o resto do Builder (ver
Seção 8).

## 7. Abandono

`lib/persistence/buildAbandonmentSnapshot.ts` — `AbandonmentSnapshot` e uma função pura que a deriva
do `BuilderState` (`sessionId`, `lastStep`, `activeService`, `confirmedServiceCount`,
`contactStarted`, `submitted`, `updatedAt`). Não conectada a nada real ainda (sem Supabase, sem
evento disparado) — só a estrutura, pronta para a Fase 17.

## 8. Associação futura com analytics

Avaliado explicitamente (o briefing pediu para "explicar antes" de sincronizar sessão anônima no
Supabase): **não implementado nesta fase**. Nenhum consumidor real existe ainda (analytics real é
Fase 17); a persistência local já resolve o requisito desta fase (sobreviver a refresh/fechar a
aba). `session_id` também não foi adicionado ao `LeadPayload`/tabela `upgrade_leads` (Fase 13) pelo
mesmo motivo — sem utilidade concreta ainda, fácil de acrescentar depois se/quando o mini-CRM (Fase
16) precisar ligar jornada anônima a lead convertido.

## 9. Testes

40 novos, cobrindo os 15 cenários obrigatórios do briefing:

- `lib/persistence/builderSession.test.ts` (17) — save/load, draft separado de confirmed, leadDraft,
  expiração (dentro e fora do TTL), versão (atual e incompatível), corrupção (JSON inválido,
  serviceId desconhecido, editingService sem rascunho, step "submitting" restaurado), `clear`,
  sessão vazia, `Storage.prototype.setItem` lançando (indisponível).
- `lib/persistence/buildAbandonmentSnapshot.test.ts` (5).
- `lib/utils/generateId.test.ts` (2).
- `features/builder/components/BuilderShell.sessionPersistence.test.tsx` (8) — os Testes Manuais
  A/B/C/D/G automatizados via desmontar/remontar `BuilderShell` sobre o mesmo `localStorage`
  (simula fechar/reabrir a aba), mais a mensagem de recuperação e "Começar de novo".

## 10. Limitações

Ver `docs/SESSION-PERSISTENCE.md`, Seção 15 (lista completa): sem sincronização multi-tab (última
gravação vence), sem sessão anônima no Supabase, sem migração real entre versões de schema,
`idempotencyKey` não persistida entre refreshes (gerada por carregamento de página).

**Descoberta real durante o teste manual** (documentada em detalhe em
`docs/SESSION-PERSISTENCE.md`, Seção 9): a primeira versão usava um único debounce cobrindo Builder
e `leadDraft`; um `setTimeout` agendado num efeito que só depende de `leadDraft` fecha sobre o
`state` de quando foi agendado, não o de quando dispara — um refresh rápido depois de uma ação
discreta (ex.: "Cancelar edição") podia perder exatamente essa mudança. Corrigido separando os dois
auto-saves (Builder imediato, `leadDraft` debounced) e usando um `useRef` para o efeito debounced
sempre ler o `state` mais atual.

## 11. Pendências para a Etapa 15 (Lead Score)

- Lead Score, painel administrativo, analytics completo, automação comercial avançada, e-mail,
  WhatsApp final, UI premium, GSAP/ScrollTrigger/Lenis, 3D/WebGL — todos fora de escopo desta fase,
  como explicitamente pedido.
- Conectar `buildAbandonmentSnapshot` a um destino real (evento/analytics) — Fase 17.
- Avaliar `session_id` em `upgrade_leads` se/quando o mini-CRM (Fase 16) precisar ligar sessão
  anônima a lead convertido.
