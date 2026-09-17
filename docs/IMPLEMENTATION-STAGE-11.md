# IMPLEMENTATION STAGE 11 — Resumo Final do Projeto

> Fase 11 do roadmap. Constrói, sobre o Meu Upgrade da Fase 10, a revisão final do projeto
> (PROJECT_REVIEW / WF-09) antes da captura de contato: resumo detalhado por serviço, edição e
> remoção a partir do resumo com retorno de contexto, um objeto de dados serializável do projeto
> (Project Snapshot), e a transição provisória para o estado `"contact"`. Não implementa o
> formulário de lead, Supabase, WhatsApp real, Lead Score, admin, analytics ou UI final.

---

## 1. Objetivo

Dar ao visitante uma revisão confiável e editável do que ele configurou, sem qualquer elemento de
orçamento (preço, subtotal, prazo fechado, diagnóstico ou recomendação automática —
`docs/PROJECT-OVERVIEW.md`; `docs/BUSINESS-RULES.md`), antes de avançar para a etapa de contato
(Etapa 12). A tela só compila o interesse já informado — nunca analisa, classifica ou sugere.

## 2. Estrutura do resumo

`ProjectReview` (rota `/builder`, `step: "reviewing"`) lista um `ProjectReviewService` por serviço
confirmado, na ordem em que cada um foi adicionado ao Meu Upgrade (Seção 6). Cada bloco mostra o
título do serviço e a lista completa de perguntas/respostas já traduzidas, com "Editar" (mais
destaque) e "Remover" (menos destaque, como pedido nesta fase). Rodapé com "Voltar" (ao Meu
Upgrade) e "Continuar" (para o estado de contato).

## 3. Resumo detalhado × `buildServiceSummary`

**Decisão central desta fase**: não foi criada uma segunda função de lógica
(`buildDetailedServiceSummary`) nem um parâmetro `mode` em `buildServiceSummary`. Analisando a
função existente (Etapa 9), a diferença entre "resumo curto" (Meu Upgrade, Etapa 10) e "resumo
detalhado" (Resumo do Projeto, Etapa 11) nunca foi uma diferença de **dados** — `buildServiceSummary`
já retornava, desde a Etapa 9, a lista completa de perguntas/respostas de um serviço. A Etapa 10
só cortava essa mesma lista em 3 itens (`MyUpgradeItem`, `MAX_VISIBLE_SUMMARY_ITEMS`) como decisão
de **exibição**. O Resumo do Projeto simplesmente usa a lista inteira, sem cortar. Ou seja: existe
uma única função de lógica; "curto" e "detalhado" são duas formas de renderizar o mesmo dado. Isso
evita exatamente o que o briefing pediu para evitar — "funções praticamente idênticas".

## 4. Project Snapshot

Duas funções novas e paralelas em `features/builder/logic/`, ambas puras, ambas iterando
`Object.entries(confirmedServices)` (a mesma fonte, na mesma ordem — Seção "Consistência"):

```ts
function buildProjectSummary(confirmedServices: MyUpgrade): ServiceReviewSummary[]   // DISPLAY SUMMARY
function buildProjectSnapshot(confirmedServices: MyUpgrade): ProjectSnapshot          // PROJECT SNAPSHOT
```

`buildProjectSummary` agrega `buildServiceSummary` por serviço num formato pronto para a tela
(`{ serviceId, title, items }[]`) — é o que `ProjectReview` consome.

`buildProjectSnapshot` produz `{ services: [{ serviceId, answers }] }` — dados puros, sem rótulos
humanos, sem funções, sem estado de componente, sem rascunho. `answers` é uma cópia segura
(`cloneAnswers`, Etapa 8): alterar o snapshot depois de gerado nunca afeta `confirmedServices`.
Serializável com `JSON.stringify` (testado explicitamente). Ainda sem dados pessoais do lead — isso
só entra na Etapa 12. Reservado para uso futuro: Supabase, WhatsApp, e-mail, admin, analytics.

**Consistência**: como as duas funções leem exatamente o mesmo `confirmedServices` e iteram na
mesma ordem, não existem duas implementações capazes de divergir — qualquer alteração salva
aparece igual nas duas (testado explicitamente, Seção 12).

## 5. Labels

Sem lógica nova: `buildServiceSummary` (Etapa 9) já traduz todo id/valor interno para texto humano
antes de chegar à tela — nem `ProjectReviewService` nem `ProjectReview` têm acesso aos ids brutos
(`site_tipo`, `institutional`, etc.), só a `{ question, answer }` já em português. Testado
explicitamente nesta fase (Seção 12, TESTE 4).

## 6. Filtragem

`buildServiceSummary` ganhou duas camadas defensivas nesta fase:

1. **Visibilidade**: agora também checa `isQuestionVisible(question, answers)`, não só
   `value !== undefined`. Em uso normal isso já era garantido pela invalidação em cascata da Etapa
   8 (uma resposta de pergunta invisível nunca deveria sobreviver no rascunho, muito menos ser
   salva) — a checagem extra é defesa em profundidade, não uma correção de um bug encontrado.
2. **Campos desconhecidos**: como o laço é dirigido pela lista de perguntas conhecidas do serviço
   (não pelas chaves de `answers`), um campo que não corresponde a nenhuma pergunta declarada
   nunca é visitado — já era seguro por construção. Em desenvolvimento (`NODE_ENV !== "production"`),
   um `console.warn` avisa quando isso acontece (útil para detectar uma configuração antiga/campo
   obsoleto cedo); em produção, o campo é apenas ignorado, sem nenhum aviso — nunca quebra a tela,
   nunca mostra JSON bruto ao usuário.

## 7. Edição a partir do resumo

`ProjectReviewService`'s "Editar" chama `startEditingService(serviceId, { returnStep: "reviewing" })`
— o mesmo fluxo de edição já existente (Etapa 8/9), sem nenhuma lógica de edição própria dentro do
Resumo. Nenhuma pergunta, tela ou regra de invalidação foi duplicada.

## 8. Remoção

`ProjectReviewService` reaproveita `RemoveServiceDialog` (Etapa 10) sem alterações — mesmo diálogo,
mesma acessibilidade (foco inicial, `role="alertdialog"`). Removido o serviço, `confirmedServices`
é atualizado e `ProjectReview` simplesmente re-renderiza com um bloco a menos.

**Remover o último serviço enquanto está no Resumo**: `REMOVE_SERVICE` (reducer) agora detecta esse
caso (`step === "reviewing"` e a lista de confirmados fica vazia) e sai de `"reviewing"` para
`"choosing_service"` — a opção mais simples entre as sugeridas no briefing ("mostrar resumo vazio"
ou "retornar ao Meu Upgrade vazio"), consistente com o estado vazio já existente do seletor/painel
(Etapa 10), sem precisar de uma tela de "resumo vazio" própria. `ProjectReview` mantém, mesmo assim,
um retorno defensivo para `summaries.length === 0` (reaproveitando `EmptyUpgradeState`) — não
deveria ser alcançável na prática, mas a tela não quebra se algum dia for.

## 9. Retorno de contexto (`returnStep`)

**Novo mecanismo, genuinamente necessário nesta fase** (a Etapa 10 havia decidido conscientemente
não precisar de um, porque o Meu Upgrade nunca saía da tela). O Resumo do Projeto é diferente: é uma
tela própria (`step: "reviewing"`), da qual se sai (ao editar) e para a qual se volta. Solução
mínima: um campo `returnStep: BuilderStep` em `BuilderState` (padrão `"choosing_service"`).
`startEditingService` ganhou um segundo parâmetro opcional, `{ returnStep }`; quando informado
como `"reviewing"`, `SAVE_SERVICE_DRAFT` e `CANCEL_SERVICE_DRAFT` devolvem `step` para lá em vez do
padrão da Etapa 8. Chamadas existentes (seletor, painel do Meu Upgrade) continuam sem passar essa
opção — comportamento inalterado, `"choosing_service"` continua sendo o padrão.

## 10. Descoberta do teste manual: o painel "Meu Upgrade" duplicava as ações do Resumo

Ao testar manualmente o fluxo completo (Seção 14), ficou evidente um problema real: como o painel
"Meu Upgrade" (Etapa 10) é uma seção persistente que pode ficar visível em qualquer tela do Builder,
ele continuava aparecendo — com seus próprios botões "Editar"/"Remover" — ao mesmo tempo que a nova
tela de Resumo, que tem as mesmas ações para os mesmos serviços. Corrigido em `BuilderShell.tsx`:
o painel deixa de ser renderizado durante `"reviewing"` e `"contact"` — telas que já têm sua própria
forma de editar/remover/navegar. O estado local `showMyUpgrade` não é resetado, só a renderização é
condicionada; o painel volta a aparecer normalmente assim que "Voltar" retorna a
`"choosing_service"`. Este é exatamente o tipo de problema que o teste manual, e não os testes
automatizados, existe para pegar — os testes de componente não acusaram nada porque cada um
verificava seu próprio widget isoladamente.

## 11. Continuação para contato

Nova ação de reducer, `CONTINUE_TO_CONTACT`: só a partir de `step === "reviewing"` e com 1+
serviço confirmado (defesa redundante — chegar a `"reviewing"` já exige isso via
`FINALIZE_PROJECT`), avança `step` para `"contact"`. `BuilderShell` roteia esse estado para
`ContactPlaceholder` — uma tela mínima que só confirma a transição ("Quase lá..."), sem formulário
algum. O formulário de contato real (WF-10) é objetivo da Etapa 12.

## 12. Testes

30 testes novos (96 → **126**):

| Arquivo | Testes | Cobertura |
|---|---|---|
| `buildProjectSummary.test.ts` (novo) | 5 | **TESTE 1/2/3** (1, 2 e 3 serviços), ordem de inserção preservada, projeto vazio |
| `buildProjectSnapshot.test.ts` (novo) | 5 | **TESTE 11/12/13** (só confirmados; sem draft/estado/funções; serializável), cópia segura, projeto vazio |
| `buildServiceSummary.test.ts` (+3) | 7 | **TESTE 4** (label humana, nunca o id bruto), **TESTE 5** (resposta invisível não aparece), campo desconhecido não quebra |
| `builderReducer.test.ts` (+9) | 37 | `returnStep` volta para `"reviewing"` ao salvar/cancelar uma edição iniciada no Resumo; editar a partir do seletor continua voltando para `"choosing_service"`; remover o último serviço no Resumo sai para o Meu Upgrade vazio; remover um serviço (não o último) no Resumo permanece em `"reviewing"`; **TESTE 11/12** de `CONTINUE_TO_CONTACT` |
| `ProjectReview.test.tsx` (novo, componente) | 9 | Renderização com 1 e 2 serviços (ordem); **TESTE 6/7/8** (editar/cancelar/salvar retornando ao Resumo); **TESTE 9/10** (remover entre vários preserva os demais; remover o último sai da revisão); Continuar chega a `"contact"`; Voltar preserva o Meu Upgrade |

Todos os 15 cenários obrigatórios do briefing estão cobertos.

## 13. Limitações

- `ContactPlaceholder` não tem "Voltar" — a navegação de retorno a partir do contato pertence à
  Etapa 12, junto com o formulário real (WF-10 já prevê seu próprio "Voltar" para o Resumo).
- Nenhum tipo `boolean`/texto livre novo foi necessário (mesma conclusão da Etapa 9) — todas as
  perguntas do catálogo aprovado continuam sendo `single_choice`/`multi_choice`.
- O `console.warn` de campo desconhecido (Seção 6) só roda em desenvolvimento; não há, ainda, um
  mecanismo de telemetria para capturar isso em produção — aceitável, pois hoje não existe nenhum
  caminho de código real que produza um campo desconhecido (só é alcançável construindo `answers`
  manualmente, como nos testes).

## 14. Pendências para a Etapa 12

- Formulário real de captura de contato (nome, empresa, WhatsApp, e-mail, Instagram/site opcional —
  WF-10), com validação de dados pessoais.
- Envio do projeto (usando `buildProjectSnapshot` como base, acrescido dos dados de contato) —
  ainda sem Supabase, e-mail ou WhatsApp reais.
- Navegação de volta a partir do estado de contato para o Resumo.
- Persistência de sessão, Lead Score, analytics, admin — continuam fora de escopo.

---

*Este documento registra o que foi construído nesta fase. Decisões formais entraram em
`docs/DECISIONS.md`, seção "Resumo Final do Projeto (Fase 11)".*
