# IMPLEMENTATION STAGE 09 — Motor do Upgrade Builder

> Fase 9 do roadmap. Constrói, sobre a fundação da Fase 8 (`features/builder/*`, separação
> confirmado/rascunho), a lógica funcional completa do Builder: visibilidade de pergunta,
> navegação (avançar/voltar/recalcular), invalidação em cascata (incluindo cadeias), progresso,
> validação, prevenção de duplicidade, e um `QuestionRenderer` totalmente funcional para os tipos
> de pergunta realmente usados. Não implementa Resumo do projeto, Captura de contato, Supabase,
> Lead Score, admin, analytics real, GSAP/Lenis nem UI final — reservados às fases seguintes.

---

## 1. Motor implementado

A base da Fase 8 já era orientada a dados (`Question[]` declarativo com `condition`) combinada com
um dispatcher específico por serviço (`getNextSiteQuestion`/`getNextTrafegoQuestion`/
`getNextDesignQuestion`) para decidir "qual é a próxima pergunta" — decisão de engenharia já
registrada em `docs/DECISIONS.md` (Fase 8) por causa do combo de Design, que reaproveita o mesmo
campo (`design_servico`) em dois formatos diferentes (seleção única → depois lista de serviços) e
não é representável como uma única lista estática sem perder a ordem correta.

A Fase 9 **consolidou a introspecção sobre essa base** com uma função central nova,
`getVisibleQuestions`, e adicionou o que faltava para o motor "funcionar de verdade": progresso
motor-side, validação de resposta, invalidação testável isoladamente (inclusive em cadeia), e um
guard de desenvolvimento para a própria configuração de dados. Nenhuma pergunta, categoria ou regra
de conteúdo já aprovada foi alterada — apenas lógica.

## 2. Modelo de navegação

Continua **sem depender de `currentQuestionIndex` sobre a lista original** (já não dependia desde a
Fase 8): a cada renderização, `getNextQuestion(serviceId, draft)` recalcula, a partir das respostas
atuais, qual é a próxima pergunta ainda não respondida — se uma pergunta some ou aparece por causa
de uma resposta alterada, o motor simplesmente encontra outra "próxima" no lugar certo, sem exigir
nenhum ajuste de índice. "Voltar" (`BACK_DRAFT`) usa uma pilha própria (`draftHistory`, a ordem em
que os campos foram respondidos), removendo apenas o último campo respondido — nunca um índice
posicional na lista de perguntas.

## 3. Condições

Sem mudança de formato: `condition?: (answers: BuilderAnswers) => boolean` em cada `Question`
(Fase 8). Suporta as operações citadas no briefing (`equals`, `not_equals`, `includes`, `exists`)
como expressões dentro dessas funções — não foi criada uma linguagem de regras declarativa própria
(ex.: `{ field, equals }`) porque o projeto tem poucas dezenas de perguntas e a combinação de Design
já exige lógica (`resolveDesignSteps`) que uma linguagem simples de igualdade não cobriria sem
crescer em complexidade — manter funções simples continua sendo a opção mais enxuta.

## 4. Perguntas visíveis — `getVisibleQuestions`

Nova função pura, `features/builder/logic/getVisibleQuestions.ts`:

```ts
function getVisibleQuestions(serviceId: ServiceId, answers: BuilderAnswers): Question[]
```

Carrega as perguntas do serviço (`getServiceQuestions`), filtra pela condição de cada uma
(`isQuestionVisible`) e preserva a ordem declarada — sem alterar estado, sem decidir "a próxima"
(isso continua em `logic/flow.ts`, pelo motivo do combo de Design explicado acima). Usada em três
lugares: cálculo de progresso (`getProgress`), montagem da lista de revisão de uma edição em
`QuestionRenderer` (antes fazia um filtro parecido manualmente, sem checar visibilidade — agora usa
a função central), e nos testes de visibilidade/dev guard.

## 5. Validação

Nova função pura, `features/builder/logic/validateAnswer.ts`:

```ts
function validateAnswer(question: Question, value: AnswerValue | undefined): boolean
```

Cobre exatamente o que o briefing pediu — nada além disso: pergunta obrigatória sem resposta é
inválida; `multi_choice` exige ao menos uma opção marcada; pergunta opcional sem resposta é válida.
Os tipos hoje realmente usados são só `single_choice` e `multi_choice` — nenhuma pergunta do
catálogo aprovado (`docs/USER-FLOW.md`, Seção 5) precisa de `boolean` (perguntas sim/não já são
`single_choice` com opções "Sim"/"Não") nem de texto livre, então esses tipos não foram
implementados — teriam sido código morto. Usada no botão "Continuar" de `multi_choice` em
`QuestionRenderer` (antes a checagem de "pelo menos uma opção" estava hardcoded no componente).

## 6. Invalidação (e por que agora é testável em cadeia)

`invalidateDependentAnswers(serviceId, changedFieldId, answers)` continua com o mesmo
comportamento (Fase 8), mas seu algoritmo foi extraído para uma função genérica,
`invalidateAnswersForQuestions(questions, changedFieldId, answers)`, que opera sobre uma lista de
`Question[]` qualquer, não mais amarrada a `getServiceQuestions(serviceId)` internamente.
`invalidateDependentAnswers` virou um wrapper de uma linha que chama a genérica com as perguntas
reais do serviço — nunca toca em outro serviço, porque só recebe a lista daquele mesmo serviço.

Isso importa porque nenhum serviço real hoje tem uma cadeia de dependência de 3 níveis (A → B → C)
— cada pergunta específica de um mini-fluxo depende diretamente da pergunta de entrada da
categoria, não de outra pergunta intermediária. Extrair a função genérica permitiu escrever um
teste isolado com uma cadeia fabricada (A → B → C, três perguntas fictícias) sem inventar uma
pergunta real no catálogo só para ter algo para testar — o algoritmo é o mesmo, o teste é apenas
mais direto. Uma única passagem, na ordem declarada, resolve a cadeia inteira (quando o laço chega
em C, já processou e removeu B), então não há necessidade de repetir a passagem até estabilizar —
não há risco de loop infinito por construção, sem precisar de um contador de iterações máximo.

## 7. Progresso — `getProgress`

Nova função pura, `features/builder/logic/getProgress.ts`:

```ts
interface DraftProgress { current: number; total: number; percentage: number; }
function getProgress(serviceId: ServiceId, answers: BuilderAnswers): DraftProgress
```

Antes, `QuestionRenderer` calculava `current`/`total`/progresso diretamente no componente
(`draftHistory.length` vs. `estimateTotalSteps`) — regra de negócio dentro da camada de UI, o que
`docs/TECHNICAL-ARCHITECTURE.md` (Seção 6) já dizia para evitar. Agora o motor fornece os três
valores prontos; o componente só usa. `current` conta `Object.keys(answers).length`: como toda
escrita no rascunho já passa por `invalidateDependentAnswers`, o rascunho nunca guarda resposta de
pergunta que deixou de ser visível, então essa contagem já é exatamente "quantas perguntas
visíveis hoje foram respondidas", sem precisar de um histórico separado. `total` reaproveita
`estimateTotalSteps` (Fase 8) — que já recalcula corretamente quando uma resposta muda o número de
perguntas restantes (ex.: Site "Ainda não sei" tem 2 passos, não 3).

## 8. Conclusão de um serviço

Sem mudança de regra (Fase 8/`docs/BUSINESS-RULES.md`, Seção 5): `isServiceComplete` continua
verdadeiro quando `getNextQuestion` retorna `null` e há pelo menos uma resposta. Reforçado nesta
fase com dois testes explícitos obrigatórios (Seção 16): última pergunta respondida → completo;
pergunta obrigatória sem resposta → nunca completo.

## 9. Novo serviço

Sem mudança de fluxo. `startNewService(serviceId)` → `START_NEW_SERVICE` → rascunho vazio →
`QuestionRenderer` guia pergunta a pergunta usando `getNextQuestion` → ao ficar completo,
`isDraftReadyToAutoSave` (efeito do componente) dispara `saveServiceDraft()` sozinho — decisão já
tomada e documentada na Fase 8, mantida.

## 10. Edição

Sem mudança de fluxo (Fase 8): `startEditingService(serviceId)` clona as respostas confirmadas para
o rascunho (`cloneAnswers`) e nunca salva sozinho.

**Ponto do briefing desta fase resolvido conscientemente, não ignorado**: "Retomar edição na
pergunta certa" pedia, por padrão, abrir na primeira pergunta já respondida do serviço. A Fase 8 já
havia decidido e implementado algo mais completo — uma **tela de revisão com todas as respostas
confirmadas de uma vez**, cada uma com seu próprio "Alterar" (`EDIT_DRAFT_FIELD`), em vez de forçar
o visitante a navegar sequencialmente a partir de uma única pergunta (primeira ou última). Isso já
cumpre o objetivo real da recomendação — previsibilidade e controle da revisão — de forma mais
direta, e está formalmente registrado em `docs/DECISIONS.md` (Fase 8). Mantido como está;
`getVisibleQuestions` passou a alimentar essa lista (Seção 4), em vez de um filtro manual repetido.

## 11. Cancelamento

Sem mudança: `cancelServiceDraft()` → `CANCEL_SERVICE_DRAFT` descarta o rascunho por completo;
`confirmedServices` nunca é tocado. Verificado de novo, agora também via o passo manual do FLUXO C
(Seção 17).

## 12. Salvamento

Sem mudança: `saveServiceDraft()` valida com `validateServiceDraft` (que reaproveita
`getNextQuestion`) e substitui `confirmedServices[serviceId]` pelo conteúdo do rascunho já livre de
respostas inválidas (a invalidação em cascata já rodou a cada resposta, nunca no momento de salvar).

## 13. Prevenção de duplicidade

Sem mudança de regra: `ServiceSelector` decide `startEditingService` em vez de `startNewService`
quando `state.confirmedServices[serviceId]` já existe — a própria estrutura de `MyUpgrade`
(`Partial<Record<ServiceId, UpgradeItem>>`, Fase 6) torna uma segunda instância da mesma categoria
impossível sem mudar o tipo. Confirmado nesta fase com um teste de reducer (`TESTE 16`) e com o
FLUXO F do teste manual (Seção 17): clicar de novo em "Criar um site" já configurado abre a edição,
nunca uma segunda instância.

## 14. Dev guards

Nova função pura, `features/builder/logic/validateBuilderConfig.ts`, chamada uma vez em
desenvolvimento (efeito em `BuilderProvider`, `if (process.env.NODE_ENV !== "production")`) —
nunca roda em produção. Detecta:

- id de pergunta duplicado dentro do mesmo serviço;
- opção duplicada dentro da mesma pergunta (apenas listas estáticas de opções — uma lista gerada
  por função, como `siteRecursosOptions`, depende das respostas e não pode ser enumerada sem elas).

Se algo for encontrado, lança um erro claro (`throw`) em vez de um aviso silencioso — cumprindo "em
desenvolvimento: falhar de forma clara" sem usar `console.*` (regra de qualidade herdada da Fase
8). **Limitação conhecida, não implementada**: detecção de ciclo de dependência e de "condição
aponta para pergunta inexistente" — como `condition` é uma função arbitrária (`QuestionCondition`,
Fase 6), não uma referência declarativa a outro campo, não há como inspecioná-la estaticamente sem
executá-la para um conjunto de respostas. Registrado como pendência aceitável (Seção 18), não como
bug.

## 15. Componentes adicionados/alterados

Nenhum componente novo foi necessário — a Fase 8 já tinha `BuilderShell`, `ServiceSelector`,
`QuestionRenderer`, `ServiceComplete`, `MyUpgrade`, `BuilderNavigation` cobrindo os tipos de
pergunta realmente usados (`single_choice`, `multi_choice`) de forma genérica (`QuestionRenderer`
não conhece regra de nenhum serviço específico). Alterado apenas `QuestionRenderer.tsx`: passou a
chamar `getProgress`, `getVisibleQuestions` e `validateAnswer` em vez de calcular essas três coisas
inline — sem mudar nenhum texto, tela ou comportamento visível. `BuilderContext.tsx` ganhou o
efeito do dev guard (Seção 14).

## 16. Testes criados

71 testes no total (eram 45 ao final da Fase 8), em 11 arquivos:

| Arquivo | Testes | Cobertura |
|---|---|---|
| `getVisibleQuestions.test.ts` (novo) | 6 | **TESTE 1/2/3** (visibilidade simples, invisível para outro valor, cadeia recalculada de uma vez), ordem preservada, Site "Ainda não sei", Tráfego sempre visível |
| `validateAnswer.test.ts` (novo) | 4 | obrigatória sem resposta, resposta válida, multi_choice exige 1+, opcional sem resposta é válida |
| `getProgress.test.ts` (novo) | 3 | zero respostas, total recalculado (Site "Ainda não sei"), 100% ao completar |
| `validateBuilderConfig.test.ts` (novo) | 3 | configuração real sem duplicidade, detecta id duplicado (fixture), detecta opção duplicada (fixture) |
| `invalidateDependentAnswers.test.ts` (+1) | 7 | 6 já existentes da Fase 8 + **TESTE 8** (cadeia A→B→C fabricada, via `invalidateAnswersForQuestions`) |
| `flow.test.ts` (+3) | 13 | 10 já existentes + **TESTE 4** (avançar), **TESTE 9** (conclusão), **TESTE 10** (obrigatória sem resposta não conclui) |
| `builderReducer.test.ts` (+3) | 21 | 18 já existentes (TESTE 1–7 de edição, duplicidade, múltiplos serviços, `EDIT_DRAFT_FIELD`, cópia segura) + **TESTE 5** (voltar preserva), **TESTE 6** (alterar recalcula), **TESTE 16** (editar Site não afeta Tráfego) |
| `isQuestionVisible.test.ts` | 4 | sem mudança (Fase 8) |
| `buildServiceSummary.test.ts` | 4 | sem mudança (Fase 8) |
| `validateServiceDraft.test.ts` | 3 | sem mudança (Fase 8) |
| `BuilderShell.test.tsx` (novo, componente) | 3 | ServiceSelector inicia fluxo; QuestionRenderer avança ao responder; concluir adiciona ao Meu Upgrade |

Os 16 cenários obrigatórios do briefing desta fase estão todos cobertos, com rótulo explícito
"TESTE N" no texto do teste (mesmo padrão de rastreabilidade já usado nos "TESTE 1–7" da Fase 8)
sempre que o teste foi escrito especificamente para aquele cenário — quando o cenário já estava
coberto por um teste da Fase 8 com outro nome, o teste antigo foi mantido como está (evitar reescrever
um teste que já passava e já tinha um propósito documentado).

## 17. Teste manual obrigatório (Playwright, navegador real)

Executados, em sequência, no fluxo real da aplicação (`npm run dev`), todos os 6 fluxos pedidos:

- **FLUXO A** — Site (E-commerce) do zero até "Meu Upgrade". ✅
- **FLUXO B** — E-commerce → resposta de `site_recursos` → voltar duas vezes → mudar para
  Institucional → a pergunta/resposta de E-commerce some, as opções de Institucional aparecem no
  lugar (isso tudo **antes** de salvar, com o rascunho ainda em memória). ✅
- **FLUXO C** — Site já configurado → editar → mudar para Institucional → **cancelar** → editar de
  novo → confirma que o original (E-commerce) permanece. ✅
- **FLUXO D** — editar de novo → mudar para Institucional → **salvar** → confirma que o item
  confirmado foi atualizado para Institucional, e que o Tráfego Pago (configurado antes, Fluxo E)
  permanece intocado. ✅
- **FLUXO E** — Site configurado → adicionar Tráfego Pago (4 perguntas) → os dois aparecem juntos
  no "Meu Upgrade". ✅
- **FLUXO F** — selecionar "Criar um site" de novo (já configurado) → abre edição diretamente,
  nunca uma segunda instância. ✅

**14 checagens, todas `OK`, nenhum `FAIL`.**

## 18. Limitações atuais

- Detecção de ciclo de dependência entre condições não é possível de forma estática (Seção 14) —
  `condition` é uma função opaca, não uma referência declarativa.
- Progresso (`getProgress`) usa a mesma estimativa de Tráfego/Design da Fase 8 para `total`; no
  caminho "Montar um pacote" de Design, antes de o visitante escolher quais serviços quer combinar,
  a estimativa é aproximada (2 passos) — já era assim na Fase 8 e continua correta assim que a
  combinação é escolhida (o total passa a refletir os serviços reais).
- Nenhum tipo `boolean`/texto livre foi implementado em `validateAnswer`/`QuestionRenderer` — não
  há, hoje, nenhuma pergunta aprovada que precise deles (Seção 5).
- `single_choice` já avança sozinho ao clicar numa opção (não existe um botão "Continuar"
  separado) — comportamento herdado da Fase 8, mantido porque já é simples, previsível e acessível
  (`<button>` nativo, sem necessidade de segunda confirmação); não foi adicionado nenhum mecanismo
  de configuração de auto-advance por pergunta além desse comportamento, por não haver necessidade
  real hoje (a recomendação do briefing era "se não for necessário, mantenha simples").

## 19. Pendências para a Etapa 10

- **Resumo do projeto** (todos os serviços juntos, `buildProjectSummary`) — hoje só existe
  `buildServiceSummary` por serviço; o "Meu Upgrade" ainda não tem uma tela de resumo consolidado
  com "Seguir para contato".
- **Captura de contato, envio, Lead** — nenhum desses existe ainda (Etapas 11/12).
- **Tela dedicada de remoção** — continua usando `window.confirm` (decisão já registrada na Fase
  8, mantida).
- Persistência de sessão (`localStorage`), `sessionId`, `contact`, analytics (`trackEvent`),
  WhatsApp — nenhum desses campos ou integrações foi adicionado; ficam para as fases
  correspondentes, como já registrado na Fase 8.

---

*Este documento registra o que foi construído nesta fase. Decisões formais entraram em
`docs/DECISIONS.md`, seção "Motor do Upgrade Builder (Fase 9)".*
