# IMPLEMENTATION STAGE 08 — Estrutura Inicial em Next.js

> Fase 8 do roadmap. Primeira fase com implementação de código real (as Fases 1–7 foram só
> documentação/planejamento). Constrói a fundação técnica sobre a qual o motor completo do
> Upgrade Builder (Fase 9) será construído — não implementa o motor em si, nem UI final, nem
> Supabase, nem qualquer integração real.

---

## 1. O que foi implementado

- Migração física do código do Builder de `lib/builder/` e `components/builder/` (Etapa 3) para
  `features/builder/*`, exatamente a estrutura planejada em `docs/FOLDER-STRUCTURE.md` — a
  migração que aquele documento reservou explicitamente para esta fase.
- Separação real entre **estado confirmado** (`confirmedServices`) e **rascunho de edição**
  (`serviceDraft`/`editingService`) — a "pendência crítica" identificada nas Fases 4, 6 e 7 e
  nunca antes implementada.
- Perguntas de Site, Tráfego Pago e Design/Social Media reescritas como **dados declarativos**
  (`Question[]`, com `condition` para visibilidade), preservando exatamente os mesmos textos,
  opções e comportamento já aprovados — nenhuma pergunta foi criada, removida ou alterada.
- Funções de lógica pura: `isQuestionVisible`, `invalidateDependentAnswers`,
  `validateServiceDraft`, `buildServiceSummary`, além do dispatcher `getNextQuestion`/
  `estimateTotalSteps`/`isServiceComplete` (herdado do antigo `lib/builder/flow.ts`).
- Reducer puro do Builder (`builderReducer.ts`) com o modelo de rascunho completo.
- Componentes estruturais mínimos: `BuilderShell`, `ServiceSelector`, `QuestionRenderer`,
  `ServiceComplete`, `MyUpgrade`, `BuilderNavigation`.
- Rotas: `/` (Home provisória), `/builder` (Builder funcional), `/projetos` e `/privacidade`
  (placeholders). `/admin` **não foi criado** nesta fase (ver Seção 11).
- Ambiente de testes (Vitest) com 45 testes unitários da lógica e do reducer.
- Scripts `typecheck`, `test` e `test:watch` adicionados ao `package.json`.

## 2. Estrutura criada

```
features/builder/
  types.ts                      # tipos centrais (ServiceId, Question, BuilderState, ...)
  data/
    services.ts                 # ServiceDefinition (id/label/shortDescription) dos 3 serviços
    site.ts                     # perguntas de Site como dados + dispatcher local
    trafego.ts                  # perguntas de Tráfego Pago (4, fixas)
    design.ts                   # perguntas de Design/Social Media + resolveDesignSteps
    questionsByService.ts       # agregador: getServiceQuestions(serviceId)
  logic/
    isQuestionVisible.ts
    invalidateDependentAnswers.ts
    validateServiceDraft.ts
    buildServiceSummary.ts
    flow.ts                     # getNextQuestion / estimateTotalSteps / isServiceComplete
    *.test.ts                   # testes unitários colocados junto da função testada
  state/
    builderReducer.ts           # reducer puro + initialBuilderState (testável sem React)
    builderReducer.test.ts
    BuilderContext.tsx          # Provider/hook React (fino, delega tudo ao reducer)
  utils/
    cloneAnswers.ts             # cópia seguro de respostas (usada ao entrar em edição)
  components/
    BuilderShell.tsx(+.module.css)
    ServiceSelector.tsx(+.module.css)
    QuestionRenderer.tsx(+.module.css)
    ServiceComplete.tsx(+.module.css)
    MyUpgrade.tsx(+.module.css)
    BuilderNavigation.tsx(+.module.css)

app/
  page.tsx(+.module.css)        # Home provisória
  builder/page.tsx              # monta BuilderProvider + BuilderShell
  projetos/page.tsx             # placeholder
  privacidade/page.tsx          # placeholder

vitest.config.ts
```

`lib/builder/` e `components/builder/` (Etapa 3) foram removidos após a migração — nenhum código
duplicado ficou para trás.

## 3. State management

Mantido **React Context + `useReducer`**, decisão da Fase 6 (`docs/DECISIONS.md`) — nenhuma
biblioteca nova de estado foi adicionada. Novidade desta fase: o reducer (`builderReducer.ts`) foi
extraído para um arquivo próprio, **sem nenhuma dependência de React**, e `BuilderContext.tsx`
ficou reduzido a um Provider fino que só liga `useReducer` às funções que os componentes chamam.
Isso é o que permite testar todo o modelo de edição (7 testes obrigatórios + casos extras) sem
precisar renderizar nada.

## 4. Como o "confirmed state" funciona

`state.confirmedServices: Partial<Record<ServiceId, UpgradeItem>>` — no máximo um item por
categoria (reafirma a decisão da Fase 4/6 em nível de tipo). É a única fonte de verdade do "Meu
Upgrade". Nenhuma ação além de `SAVE_SERVICE_DRAFT` escreve nele.

## 5. Como o `serviceDraft` funciona

`state.serviceDraft: Record<string, AnswerValue>` guarda as respostas do serviço **ativo agora**
(nova configuração ou edição) — nunca as de outro serviço. Toda resposta passa primeiro por
`invalidateDependentAnswers`, que remove do próprio rascunho qualquer resposta que deixou de fazer
sentido (ex.: mudar `site_tipo` derruba `site_recursos` se as opções não baterem mais). Ao entrar
em edição, o rascunho é uma **cópia profunda e segura** (`cloneAnswers`) das respostas confirmadas
— nunca a mesma referência, então alterar o rascunho nunca poderia corromper o item já salvo
mesmo por engano de implementação futura.

## 6. Como o `editingService` funciona

`state.editingService: ServiceId | null`. `null` = está configurando um serviço **novo**
(`activeService` setado, `editingService` não). Não-nulo = está editando aquele serviço já
confirmado. A UI usa esse flag para decidir duas coisas que mudam de comportamento entre os dois
modos:

- **Salvamento automático**: uma configuração nova salva sozinha assim que a última pergunta é
  respondida (regra de `docs/BUSINESS-RULES.md`, Seção 5). Isso é decidido fora do reducer, na
  camada de UI (`QuestionRenderer`, via `isDraftReadyToAutoSave(state)` exportado por
  `builderReducer.ts`) — o reducer nunca dispara ações sozinho, só reage a elas.
- **Edição sempre exige confirmação explícita** (`docs/USER-FLOW.md`, Seção 9): ao terminar de
  responder tudo em modo de edição, a tela de revisão aparece com "Confirmar alterações" — nunca
  salva sozinha, mesmo que todas as perguntas já tenham resposta.

## 7. Como o cancelamento funciona

`cancelServiceDraft()` → ação `CANCEL_SERVICE_DRAFT` → descarta `serviceDraft`/`editingService`
por completo; `confirmedServices` nunca é tocado por essa ação. Testado explicitamente (TESTE 3 e
TESTE 6 do briefing): editar E-commerce → Institucional → cancelar → o confirmado continua
E-commerce, com as respostas originais de `site_recursos` intactas.

## 8. Como o salvamento funciona

`saveServiceDraft()` → ação `SAVE_SERVICE_DRAFT` → valida com `validateServiceDraft` (reaproveita
`getNextQuestion`, nunca duplica a lógica de "o que falta"); se válido, substitui
`confirmedServices[serviceId]` pelo conteúdo do rascunho (respostas que deixaram de fazer sentido
já foram removidas do rascunho antes, pela invalidação em cascata — nunca sobrevivem ao salvar).
Testado explicitamente (TESTE 4 e TESTE 7): salvar aplica Institucional e **remove**
`site_recursos` de e-commerce do item confirmado.

Duas variações de destino após salvar:
- Serviço **novo**: mostra a tela de conclusão (`ServiceComplete`, WF-05).
- Serviço em **edição**: volta direto para onde a edição começou (Meu Upgrade) — nunca mostra a
  tela de "adicionado", porque o serviço já existia.

## 9. Funções de lógica criadas

| Função | Arquivo | Usada por |
|---|---|---|
| `isQuestionVisible(question, answers)` | `logic/isQuestionVisible.ts` | `invalidateDependentAnswers`, testes |
| `invalidateDependentAnswers(serviceId, changedFieldId, answers)` | `logic/invalidateDependentAnswers.ts` | reducer (`UPDATE_DRAFT_ANSWER`, `EDIT_DRAFT_FIELD`) |
| `validateServiceDraft(serviceId, answers)` | `logic/validateServiceDraft.ts` | reducer (`SAVE_SERVICE_DRAFT`) |
| `buildServiceSummary(serviceId, answers)` | `logic/buildServiceSummary.ts` | `ServiceComplete`, tela de revisão de edição |
| `getNextQuestion` / `estimateTotalSteps` / `isServiceComplete` | `logic/flow.ts` | `QuestionRenderer`, `validateServiceDraft`, `isDraftReadyToAutoSave` |
| `getServiceQuestions(serviceId)` | `data/questionsByService.ts` | as três funções acima, testes |

Todas são funções puras — sem React, sem DOM (docs/TECHNICAL-ARCHITECTURE.md, Seção 33).

## 10. Ambiente de testes

**Vitest** (única dependência nova de fato instalada). Justificativa: nativo em ESM/TypeScript,
não exige Babel nem `ts-jest`, roda em milissegundos para testes de lógica pura, e não havia
nenhuma solução de teste já presente no projeto para reaproveitar. `@testing-library/react` **não**
foi instalado — nenhum teste de componente foi escrito nesta fase (a lógica pura já cobre o que
importa: dados/estado); ambiente configurado como `"node"` (mais rápido, sem jsdom) por isso.

Scripts adicionados: `npm run test` (roda uma vez), `npm run test:watch`, `npm run typecheck`.

## 11. Testes existentes (45 no total)

- `isQuestionVisible.test.ts` (4) — pergunta sem condição, condição satisfeita/não satisfeita,
  pergunta condicional de Design.
- `invalidateDependentAnswers.test.ts` (6) — Cenário 7 de `USER-FLOW.md` (e-commerce →
  institucional), nenhuma invalidação indevida, "Ainda não sei" limpa tudo, Tráfego nunca invalida
  nada, Design remove/preserva corretamente em combinações.
- `flow.test.ts` (10) — dispatcher das 3 categorias, incluindo o fluxo de "Montar um pacote".
- `validateServiceDraft.test.ts` (3) — vazio inválido, pendente inválido, completo válido.
- `buildServiceSummary.test.ts` (4) — resumo de um serviço, de Tráfego (com a nova pergunta), de
  uma combinação de Design, e que perguntas sem resposta não aparecem.
- `builderReducer.test.ts` (18) — os **7 testes obrigatórios do briefing** (1 a 7, edição com
  rascunho), mais: selecionar serviço novo, não duplicar categoria, projeto vazio, múltiplos
  serviços sem dado cruzado, remover sem afetar os demais, `EDIT_DRAFT_FIELD` com cascata, cópia
  seguro (rascunho não compartilha referência mutável), e salvar com pendência não altera nada.

**Resultado**: `npm run test` → **45/45 aprovados**, 6 arquivos de teste, ~1.2s.

## 12. Dependências adicionadas

| Dependência | Tipo | Por quê |
|---|---|---|
| `vitest` (`^2.1.9`) | devDependency | Único framework de teste ausente no projeto (Seção 10). |

Nenhuma outra dependência foi instalada. Zustand, Zod, React Hook Form, GSAP, Lenis, Three.js,
Supabase — nenhum foi necessário para esta fundação, consistente com as decisões da Fase 6.

## 13. Decisões alteradas ou reveladas durante a implementação

Ver `docs/DECISIONS.md`, seção "Estrutura inicial em Next.js (Fase 8)", para o registro formal.
Resumo:

- `CategoryId` foi renomeado para `ServiceId` (só o nome do tipo — os valores `site`/`trafego`/
  `design` não mudaram, conforme já fixado em `docs/TECHNICAL-ARCHITECTURE.md`, Seção 13).
- O salvamento automático de um serviço **novo** ao concluir o mini-fluxo foi implementado na
  camada de UI (efeito do `QuestionRenderer`), não no reducer — o reducer permanece uma máquina de
  estados explícita, sem decidir sozinha quando disparar outra ação.
- Foi necessário um mecanismo não detalhado nos documentos anteriores para a edição funcionar de
  verdade: uma tela de **revisão por campo**, com "Alterar" por pergunta já respondida (nova ação
  `EDIT_DRAFT_FIELD`). Sem isso, entrar em edição reabria um serviço já completo e não havia como
  chegar a uma pergunta específica para trocá-la. Está descrito e testado nesta fase; não contradiz
  nenhuma decisão anterior, apenas preenche um detalhe que ficara implícito em `docs/USER-FLOW.md`
  (Seção 9: "respostas atuais visíveis/pré-preenchidas").
- Remoção de serviço usa uma confirmação simples de navegador (`window.confirm`) nesta fase — a
  tela dedicada (WF-08) fica para quando a UI final for construída.
- `/admin` não foi criado — o briefing permitia isso ("caso faça sentido"); como não haveria
  nenhum conteúdo real nela ainda, criar a rota vazia seria código morto sem função.

## 14. Pendências deixadas propositalmente para a Etapa 9

- **Motor completo do Upgrade Builder**: o link "Fale com a Upgrade" (secundário, sai do Builder)
  está desabilitado; "Adicionar outro serviço"/"Finalizar meu projeto" a partir do Meu Upgrade
  estão desabilitados (sem Resumo/Contato ainda para levar).
- **Resumo do projeto (WF-09), Captura de contato (WF-10), Confirmação (WF-11)** — nenhuma dessas
  telas existe ainda; são o próprio objetivo da Fase 9/10.
- **Tela dedicada de remoção (WF-08)** — hoje é um `window.confirm`.
- Persistência de sessão (`localStorage`) — não implementada; o estado vive só em memória, como já
  documentado como limitação conhecida desde a Fase 4.
- `sessionId`, `contact`/`leadDraft`, analytics (`trackEvent`), WhatsApp — nenhum desses campos ou
  integrações foi adicionado ao estado; ficam para quando as fases correspondentes chegarem
  (evita "adicionar dezenas de estados preventivamente", conforme pedido nesta etapa).

---

*Este documento registra o que foi construído nesta fase. Decisões formais entraram em
`docs/DECISIONS.md`; nenhum outro documento de conteúdo/regra foi alterado.*
