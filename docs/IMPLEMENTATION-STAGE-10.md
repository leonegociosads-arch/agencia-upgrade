# IMPLEMENTATION STAGE 10 — Sistema "Meu Upgrade"

> Fase 10 do roadmap. Constrói, sobre o motor da Fase 9, o gerenciamento funcional dos serviços já
> confirmados: visualizar, editar, cancelar, salvar, remover, adicionar outro, impedir duplicidade,
> estado vazio, e uma primeira transição de "Finalizar projeto" para um estado provisório
> (`PROJECT_REVIEW`) que a Etapa 11 vai preencher de verdade. Não implementa resumo final completo,
> formulário de lead, Supabase, WhatsApp real, analytics ou admin.

---

## 1. Conceito do Meu Upgrade

"Meu Upgrade" representa **o projeto que o visitante está montando** — nunca um carrinho de
e-commerce. Nenhum preço, subtotal, frete, quantidade ou linguagem de checkout aparece em nenhum
componente desta fase (`docs/PROJECT-OVERVIEW.md`, Seção 7; `docs/DECISIONS.md`).

Decisão arquitetural mantida da Fase 8 e reforçada agora: o "Meu Upgrade" é uma **seção persistente
do próprio Builder** (WF-06), não uma rota nem um modal. Ele fica visível, ao ser aberto, ao mesmo
tempo que a tela de perguntas — nunca substitui a navegação. Essa decisão simplificou vários
requisitos desta fase (Seção 3).

## 2. Componentes

| Componente | Responsabilidade |
|---|---|
| `MyUpgrade.tsx` (reescrito) | Orquestra: lista os itens confirmados, decide estado vazio vs. lista, hospeda os diálogos de remoção e de rascunho pendente, e as duas ações do rodapé. |
| `MyUpgradeItem.tsx` (novo) | Um item — título do serviço, resumo curto (via `buildServiceSummary`, no máximo 3 linhas + "+N mais"), botões "Editar"/"Remover". |
| `EmptyUpgradeState.tsx` (novo) | WF-13 — mensagem de vazio + "Adicionar um serviço" (leva ao seletor, nunca inicia um serviço específico). |
| `RemoveServiceDialog.tsx` (novo) | WF-08 — confirmação de remoção, substitui o `window.confirm` provisório da Fase 8. |
| `ProjectReview.tsx` (novo) | Estado provisório `"reviewing"` (PROJECT_REVIEW) — confirma a transição e lista os serviços, sem duplicar o resumo completo (isso é a Etapa 11). |
| `BuilderShell.tsx` (alterado) | Passou a rotear também `state.step === "reviewing"` para `ProjectReview`. |
| `builderReducer.ts` (alterado) | Nova ação `FINALIZE_PROJECT`; correção em `REMOVE_SERVICE`; novos helpers `canFinalizeProject`/`hasPendingDraft`. |
| `BuilderContext.tsx` (alterado) | Expõe `finalizeProject`; ganhou um `initialState` opcional (só para testes). |

Nenhum componente novo além destes foi necessário — `UpgradeActions` (sugestão do briefing) não
virou arquivo próprio porque são apenas dois botões, já claros dentro de `MyUpgrade.tsx`; separar
teria sido fragmentação sem ganho real.

## 3. Fonte de verdade

`MyUpgrade`/`MyUpgradeItem` leem **exclusivamente** `state.confirmedServices` — nunca
`state.serviceDraft`. Isso não exigiu nenhuma lógica condicional nova: como o painel é uma seção
que nunca troca de conteúdo por causa de uma edição em outro lugar da tela (Seção 1), ele
simplesmente nunca teve, em nenhum momento, motivo para ler o rascunho. Enquanto uma edição está
aberta ao lado, o painel continua re-renderizando a partir do mesmo `confirmedServices`, que só
muda quando `SAVE_SERVICE_DRAFT` é despachado (Fase 8) — por isso "antes de salvar, o Meu Upgrade
mostra o valor antigo" é uma consequência direta da arquitetura já existente, não uma regra nova
implementada agora.

## 4. Estado vazio

`EmptyUpgradeState` (WF-13): "Seu Upgrade ainda está vazio." + botão "Adicionar um serviço" →
`goToEntry()` (leva ao seletor — **nunca** inicia um serviço específico sozinho). Isto corrige um
comportamento da Fase 8: o botão equivalente de então chamava `startNewService("site")`
diretamente, decidindo por conta própria qual serviço configurar. Corrigido nesta fase para
respeitar literalmente "o botão deve levar ao seletor principal".

## 5. Resumo curto

`MyUpgradeItem` usa `buildServiceSummary(serviceId, item.answers)` (Fase 9) como única fonte —
nenhuma lógica de tradução de resposta foi duplicada. Para não "mostrar 8 respostas de uma vez",
o item corta em no máximo 3 linhas e mostra "+ N mais" quando há mais — decisão de **apresentação**
(no componente), não uma mudança na função de lógica em si.

## 6. Edição

`onEdit` chama `startEditingService(serviceId)` (Fase 8/9), sem nenhuma lógica de edição própria
dentro do Meu Upgrade — exatamente como pedido ("Não criar nova lógica de edição específica dentro
do Meu Upgrade"). O retorno após editar (Seção 7 do briefing, "Retorno após edição") não precisou de
um mecanismo de `returnContext`: como o painel nunca sai da tela (Seção 1), ele já está "ali" antes,
durante e depois da edição — salvar ou cancelar apenas atualiza o que ele mostra, sem navegação
alguma para "voltar". Documentado aqui como uma decisão consciente de simplificação, não uma
omissão: um `returnContext` só faria sentido se o Meu Upgrade fosse uma tela/rota da qual se sai e
para a qual se volta, o que não é o caso desta arquitetura.

## 7. Cancelamento

Sem lógica nova: `cancelServiceDraft()` (Fase 8) descarta o rascunho; `confirmedServices` nunca é
tocado. Testado nesta fase a partir do próprio Meu Upgrade (TESTE 5/7, Seção 14).

## 8. Salvamento

Sem lógica nova: `saveServiceDraft()` (Fase 8) substitui `confirmedServices[serviceId]`. O Meu
Upgrade simplesmente re-renderiza a partir do novo valor — nenhum componente desta fase precisou
"saber" que um salvamento aconteceu; é uma consequência de sempre ler `confirmedServices` ao vivo.

## 9. Remoção

`RemoveServiceDialog` (WF-08) substitui o `window.confirm` provisório da Fase 8 por um diálogo real
(`role="alertdialog"`, foco inicial no botão "Cancelar") — necessário também para viabilizar testes
automatizados de remoção, que `window.confirm` não permite simular de forma confiável em ambiente de
teste. Fluxo: clicar "Remover" num item abre o diálogo (estado local `pendingRemoval` em
`MyUpgrade`, nunca no `BuilderState` global — é uma confirmação transitória de UI, exatamente como
`docs/TECHNICAL-ARCHITECTURE.md`, Seção 10, já classificava esse tipo de estado); confirmar despacha
`REMOVE_SERVICE`; cancelar só limpa o estado local.

**Correção real encontrada e corrigida nesta fase**: `REMOVE_SERVICE` (Fase 8) apagava o item de
`confirmedServices` mas nunca verificava se aquele serviço era o `activeService`/`editingService`
atual. Como o painel pode ficar visível ao mesmo tempo que uma edição em andamento (Seção 1), era
possível remover, pelo painel, o mesmo serviço que estava sendo editado na tela ao lado — deixando
`activeService`/`editingService` apontando para um item que não existe mais em
`confirmedServices`. Corrigido: `REMOVE_SERVICE` agora verifica isso e, quando é o caso, também
reseta `activeService`/`editingService`/`serviceDraft`/`draftHistory` e volta para
`"choosing_service"` — um estado seguro, sem rascunho órfão. Coberto por dois testes novos de
reducer (Seção 14).

**Limitação aceita, não corrigida por completo**: a própria UI ainda permite, na prática, abrir a
edição de um item e, ao mesmo tempo, ver o botão "Remover" daquele mesmo item no painel ao lado —
exatamente o cenário que o briefing pede para "idealmente" evitar por design. Reestruturar o Meu
Upgrade para nunca expor as duas ações do mesmo item simultaneamente exigiria transformá-lo num
modal/rota (abandonando a Seção 1), uma mudança de UI desproporcional para esta fase. A garantia
de **correção** (nunca ficar em estado inconsistente) está no reducer, não na UI — o que já cobre
o requisito funcional real.

## 10. Adição de outro serviço

Novo botão "+ Adicionar outro serviço" no rodapé do Meu Upgrade (só aparece com 1+ serviço já
configurado) → `goToEntry()`. **Gap real da Fase 8 corrigido aqui**: o footer de então só mostrava
esse botão quando a lista estava vazia (com texto "Adicionar um serviço") — não havia nenhuma forma
de reabrir o seletor a partir do painel quando já havia pelo menos 1 serviço, contrariando WF-06
("+ Adicionar serviço" como CTA secundário sempre visível). Corrigido.

## 11. Prevenção de duplicidade

Sem lógica nova: `ServiceSelector` (Fase 8/9) já decide `startEditingService` em vez de
`startNewService` quando o serviço já está em `confirmedServices`, e a própria estrutura de tipo de
`MyUpgrade` (`Partial<Record<ServiceId, UpgradeItem>>`, Fase 6) torna uma segunda instância da mesma
categoria impossível de representar. Testado de novo nesta fase a partir do fluxo real do Meu
Upgrade (TESTE 10, Seção 14).

## 12. Finalização

Nova ação de reducer, `FINALIZE_PROJECT`: exige `canFinalizeProject(state)` (pelo menos 1 serviço
confirmado) e ausência de rascunho pendente de verdade (`!hasPendingDraft(state)`, Seção 13); se
ambos forem satisfeitos, avança `step` para `"reviewing"` e limpa qualquer resquício de
`activeService`/`serviceDraft`. `BuilderShell` roteia esse `step` para `ProjectReview` — uma tela
provisória que só confirma a transição e lista os serviços (contagem + nomes), sem o resumo
detalhado por serviço (isso é o objetivo declarado da Etapa 11). Um botão "Voltar ao Meu Upgrade"
(`goToEntry()`) devolve ao Builder sem perder nada de `confirmedServices` (objetivo 12 desta fase).

## 13. Tratamento de draft pendente

`hasPendingDraft(state)` (novo, `builderReducer.ts`) decide se existe algo real a perder:

```ts
function hasPendingDraft(state: BuilderState): boolean {
  if (state.editingService !== null) return true;
  return state.activeService !== null && Object.keys(state.serviceDraft).length > 0;
}
```

Não é simplesmente `activeService !== null` — logo depois que uma configuração **nova** termina e
salva sozinha (Fase 8), `activeService` continua preenchido só para a tela de conclusão saber o que
mostrar, mas `serviceDraft` já está vazio (nada foi perdido, o serviço já foi salvo). Usar apenas
`activeService !== null` geraria um falso positivo exatamente nesse momento — descoberto ao escrever
o teste correspondente (Seção 14) antes de existir na implementação real, e corrigido antes de virar
bug em produção.

Comportamento na UI: o botão "Finalizar projeto" fica **habilitado** sempre que houver 1+ serviço
confirmado (`canFinalizeProject`), independentemente de `hasPendingDraft` — clicar nele com um
rascunho pendente **não finaliza silenciosamente**; em vez disso, abre um aviso inline (não é
`window.confirm`): "Você está configurando ou editando um serviço. Termine antes de finalizar o
projeto.", com duas ações — **Continuar edição** (fecha o aviso, nada muda) e **Descartar
alterações** (chama `cancelServiceDraft()`, a mesma ação já usada em qualquer cancelamento de
edição — nenhuma lógica de descarte paralela foi criada). O próprio reducer também recusa
`FINALIZE_PROJECT` nessas condições, então mesmo um clique fora desse fluxo normal (ou um bug futuro
na UI) nunca finalizaria silenciosamente.

## 14. Testes adicionados

25 testes novos (71 → **96**):

**Reducer** (`builderReducer.test.ts`, +8, novo describe "Meu Upgrade — finalização e remoção
durante edição"):
- `canFinalizeProject`/`FINALIZE_PROJECT`: projeto vazio recusa (**TESTE 11**); 1 serviço avança
  para `"reviewing"` (**TESTE 12**); edição em andamento recusa e não descarta nada (**TESTE 13**);
  configuração nova sem nenhuma resposta NÃO é tratada como pendente; configuração nova COM
  resposta parcial impede finalizar; logo após uma configuração nova salvar sozinha, não há mais
  nada pendente (o caso que motivou a Seção 13).
- `REMOVE_SERVICE`: remover o serviço que está sendo editado agora limpa o rascunho órfão e volta a
  um estado seguro (a correção real da Seção 9); remover um serviço diferente do que está em edição
  não afeta o rascunho em andamento.

**Componente** (`MyUpgrade.test.tsx`, novo, 17 testes, usa o novo `initialState` de
`BuilderProvider` para montar estados já confirmados sem precisar clicar por toda a árvore de
perguntas a cada teste):

| Teste | Cenário |
|---|---|
| TESTE 1 | Estado vazio: mensagem correta, sem "Finalizar projeto" |
| — | "Adicionar um serviço" leva ao seletor, nunca inicia Site sozinho |
| TESTE 2 | Um serviço: aparece com resumo correto |
| TESTE 3 | Múltiplos serviços: ambos aparecem, ordem de inserção preservada |
| TESTE 4 | Editar carrega o rascunho com os dados confirmados |
| TESTE 5 | Antes de salvar, o painel confirmado continua com o valor antigo |
| TESTE 6 | Salvar aplica a alteração ao painel |
| TESTE 7 | Cancelar mantém o valor antigo |
| TESTE 8 / 14 | Remover Site preserva o Tráfego, sem afetá-lo |
| TESTE 9 | Remover o último serviço mostra o estado vazio |
| — | Cancelar no diálogo de remoção não remove nada |
| TESTE 10 | Selecionar no seletor um serviço já configurado abre edição, nunca duplica |
| TESTE 11 | Projeto vazio não permite finalizar |
| TESTE 12 | Um serviço válido: finalizar avança para a revisão do projeto |
| TESTE 13 | Edição em andamento: finalizar não ignora a alteração pendente (mostra o aviso, "Descartar" resolve) |
| TESTE 15 | Remover um serviço do meio (de 3) preserva os demais |
| — | "+ Adicionar outro serviço" leva ao seletor sem perder o que já foi configurado |

Todos os 15 cenários obrigatórios do briefing estão cobertos.

## 15. Limitações

- `RemoveServiceDialog` e o aviso de rascunho pendente não têm foco/`Escape` totalmente
  equivalentes a uma modal completa (sem *focus trap*) — foco inicial correto (Seção 9), mas sem
  captura de tabulação nem fechamento por `Escape`. Suficiente para esta fase (não é UI final),
  registrado para revisão quando a UI final (Fase 19+) tratar diálogos de forma consistente em todo
  o site.
- Exposição simultânea de "Editar" e "Remover" do mesmo item em dois lugares da tela ao mesmo tempo
  — aceito por design (Seção 9); corrigido no nível de dados (reducer), não eliminado na UI.
- `ProjectReview` é deliberadamente mínimo (contagem + nomes) — o resumo por serviço, a
  possibilidade de editar/remover a partir dali, e o avanço para contato são objetivo declarado da
  Etapa 11, não desta fase.

## 16. Pendências para a Etapa 11

- Resumo completo do projeto (todos os serviços, respostas relevantes, ações de editar/remover a
  partir do próprio resumo — WF-09).
- Avanço de `"reviewing"` para a captura de contato (WF-10) — hoje `ProjectReview` só tem "Voltar ao
  Meu Upgrade".
- Persistência de sessão, `sessionId`, analytics, WhatsApp — continuam fora de escopo, como já
  registrado nas Fases 8/9.

---

*Este documento registra o que foi construído nesta fase. Decisões formais entraram em
`docs/DECISIONS.md`, seção "Sistema Meu Upgrade (Fase 10)".*
