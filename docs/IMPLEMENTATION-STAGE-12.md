# IMPLEMENTATION STAGE 12 — Captura e Validação do Lead

> Fase 12 do roadmap. Constrói, sobre o Resumo do Projeto da Fase 11, o formulário de contato
> (WF-10): captura, validação, normalização, um Project Snapshot + Lead Data combinados num Lead
> Payload limpo e serializável, e um submit provisório (sem Supabase, sem WhatsApp/e-mail reais —
> Etapa 13) que leva a estados de sucesso e falha genuinamente navegáveis.

---

## 1. Objetivo

Dar ao visitante a continuação natural do Builder — não um formulário corporativo separado — para
informar seus dados de contato, associá-los ao projeto já montado, e concluir a experiência com uma
confirmação honesta sobre o que realmente aconteceu (nada de "salvo no banco" sem banco).

## 2. Campos

Exatamente os 5 já decididos em `docs/PROJECT-OVERVIEW.md`/`docs/USER-FLOW.md`/`docs/WIREFRAME.md`
(Seção 15) — nenhum campo de briefing, orçamento, prazo ou público-alvo:

| Campo | Obrigatório | Tipo de input | `autoComplete` |
|---|---|---|---|
| `name` (Nome) | sim | `text` | `name` |
| `company` (Empresa) | sim | `text` | `organization` |
| `whatsapp` (WhatsApp) | sim | `tel`, `inputMode="tel"` | `tel` |
| `email` (E-mail) | sim | `email` | `email` |
| `websiteOrInstagram` (Site ou Instagram) | não | `text` | `url` |

Nomenclatura: o briefing usou `websiteOrInstagram` (camelCase) na seção "Campos" e
`website_or_instagram` (snake_case) na seção "Identificadores internos" como dois exemplos
diferentes do mesmo princípio ("não usar o label exibido como chave"). Adotado camelCase em todo o
código — é a convenção já usada em todo o restante do projeto (`serviceId`, `confirmedServices`,
etc.), então manter os dois estilos ao mesmo tempo só criaria inconsistência sem ganho real.

## 3. Tipos

Três tipos em `features/lead/types.ts`, sem duplicação entre si:

```ts
interface LeadFormData { name: string; company: string; whatsapp: string; email: string; websiteOrInstagram: string; }
interface LeadContactData { name: string; company: string; whatsapp: string; email: string; websiteOrInstagram?: string; }
interface LeadPayload { contact: LeadContactData; project: ProjectSnapshot; meta: { createdAt: string } }
```

`LeadFormData` é o que o `<input>` produz (sempre string); `LeadContactData` é a mesma forma, já
validada e normalizada — a **saída** do schema Zod (`z.output<typeof leadFormSchema>`), nunca
construída à mão em nenhum outro lugar. Isso evita ter três definições de "que campos existem"
capazes de divergir.

## 4. Validação

React Hook Form + Zod (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 18 — decisão já aprovada na Fase 6,
especificamente para este formulário). `features/lead/logic/leadFormSchema.ts`:

- **Nome/Empresa**: `trim()` + mínimo 2 caracteres + máximo 120 — "não aceitar apenas espaços"
  cumprido pelo próprio `trim()` antes da checagem de tamanho.
- **WhatsApp**: obrigatório; `transform` chama `normalizeWhatsapp` (Seção 5) e usa
  `ctx.addIssue`/`z.NEVER` para reportar erro se não for reconhecível.
- **E-mail**: `trim()` + minúsculas + `z.email()` (validação de formato do próprio Zod — sem regex
  própria, "não usar regex absurda").
- **Site/Instagram**: opcional, sem nenhuma checagem de formato — só `trim()`. Deliberadamente
  permissivo (Seção 5).

Todas as mensagens são específicas por campo e em português simples ("Informe seu nome.", "Digite
um e-mail válido.") — nunca um texto técnico de validação.

**Duas camadas** (pedido explícito do briefing): esta é a camada de cliente, para UX. A camada de
servidor (fronteira real de segurança) só existe a partir da Etapa 13, quando houver de fato um
servidor recebendo esses dados — o mesmo `leadFormSchema` já está pronto para ser reaproveitado lá
(`docs/TECHNICAL-ARCHITECTURE.md`, Seção 17).

## 5. Normalização

`features/lead/logic/normalizeWhatsapp.ts` — função pura e isolada (testável sem o schema):
remove tudo que não é dígito, reconhece e remove um "55" de código de país só quando o total já
tem 12/13 dígitos (nunca confunde com um DDD "55", que resultaria em só 10/11 dígitos), e valida
que sobrem 10 ou 11 dígitos (DDD + fixo/celular). Produz sempre `55DDNNNNNNNNN`. Testado com todos
os formatos do briefing — todos produzem `"5513999999999"`.

Nome/empresa: `trim()` (espaços externos removidos). E-mail: `trim()` + minúsculas. Nenhuma
normalização foi aplicada ao campo opcional (Seção 4) — normalizar demais um campo já permissivo
correria o risco de deturpar um handle do Instagram tentando parecer com URL, ou vice-versa.

## 6. `leadDraft`

**Decisão central desta fase**: um `LeadProvider` novo e completamente separado de `BuilderState`
(`features/lead/state/LeadContext.tsx`), montado ao lado de `BuilderProvider` em
`app/builder/page.tsx` — nunca dentro dele. `docs/FOLDER-STRUCTURE.md` (Fase 6) já reservava
`features/lead/` sem uma pasta `state/` própria, sugerindo que o lead não precisaria de reducer
disputado — mas ele PRECISA sobreviver à desmontagem do próprio formulário (`BuilderShell` troca de
tela com base em `state.step`, então o componente `LeadForm` é desmontado ao sair de "contact" e
remontado ao voltar) — daí um Provider próprio, montado uma vez, nunca dentro do componente que
troca de tela. `useState` simples (não um reducer): a única operação é "substituir o rascunho
inteiro" — não há ações distintas o bastante para justificar mais que isso.

`LeadForm` chama `updateLeadDraft(getValues())` só no momento de sair da tela ("Voltar ao
projeto") — não a cada tecla — porque essa é a única saída real do componente nesta fase (não
existe navegador "voltar" nativo no fluxo, `docs/USER-FLOW.md`, Seção 16).

## 7. Ligação com o Project Snapshot

`buildProjectSnapshot(state.confirmedServices)` (Fase 11) é recalculado no momento do submit — nunca
armazenado antes disso. Isso garante, por construção, "se o projeto tiver mudado desde a última
entrada no formulário, o payload usa a versão atual" (o briefing pediu isso explicitamente): não há
nenhum outro lugar guardando uma cópia antiga para desatualizar.

## 8. `LeadPayload`

`features/lead/logic/buildLeadPayload.ts`:

```ts
function buildLeadPayload(contact: LeadContactData, project: ProjectSnapshot): LeadPayload
```

Deliberadamente trivial — só monta `{ contact, project, meta: { createdAt } }`. Como `contact` já
chega normalizado (Seção 4, a saída do schema), esta função nunca repete lógica de normalização.
`meta` só tem `createdAt` — nenhuma UTM, IP, geolocalização ou fingerprint (nenhuma coleta disso
existe ainda). Serializável com `JSON.stringify` (testado); nunca mistura um campo pessoal dentro
de `project`, nem uma resposta de serviço dentro de `contact` (também testado).

## 9. Submit provisório

`features/lead/logic/submitLeadPayload.ts` — simula uma chamada de rede (um pequeno atraso) e
sempre resolve com sucesso, a menos que `options.simulateFailure` seja passado. Ainda não existe
Supabase/backend real (Etapa 13); nada aqui finge persistência.

Estado `SUBMITTING`: nova ação de reducer `START_SUBMIT_LEAD`, guardada por `step === "contact"` —
um segundo despacho enquanto já em "submitting" não faz nada (o mesmo padrão de defesa em
profundidade usado em todo o `builderReducer`). Na UI, o formulário inteiro fica dentro de um
`<fieldset disabled={isSubmitting}>` — trava campos e os dois botões ao mesmo tempo, sem lógica
duplicada por elemento; o botão de envio troca o texto para "Enviando...".

**Verificação manual da falha simulada**: como não existe gatilho real de falha nesta fase, o
próprio `LeadForm` lê `?simulateLeadFailure=1` da URL (só no momento do submit, client-side) para
permitir testar o estado de erro de ponta a ponta no navegador — uma conveniência de QA
explicitamente documentada aqui, nunca alcançável por um usuário real por acidente, e destinada a
ser removida quando a Etapa 13 acrescentar uma chamada de rede que pode falhar de verdade.

## 10. `SUCCESS`

`SubmissionSuccess` mostra "Projeto validado com sucesso." — não "Recebemos seu projeto." — porque
nenhum ambiente desta fase (nem produção) tem, ainda, um backend recebendo alguma coisa; o texto
não muda por `NODE_ENV`, porque a razão de não fingir sucesso completo não é sobre ambiente de
build, é sobre a integração real não existir ainda. Mostra o primeiro nome (de `leadDraft`, ainda
não confirmado por um servidor) e a lista de serviços (`buildProjectSummary`, reaproveitado, Fase
11) — mais uma nota explícita de que a integração comercial real chega em etapa futura.

## 11. `FAILURE`

`SubmissionError` (novo estado de reducer `"error"`, reaproveitando o mesmo campo `state.error` já
usado por `SAVE_SERVICE_DRAFT`) mostra a mensagem "Não conseguimos enviar agora. Seus dados
continuam preenchidos." com duas ações:

- **"Tentar novamente"** (`RETRY_SUBMIT`) — volta para `"contact"`; o rascunho do formulário
  (`LeadContext`, nunca tocado por esta tela) continua exatamente como estava.
- **"Voltar"** (`BACK_TO_REVIEW`, a mesma ação usada por "Voltar ao projeto" na tela de contato) —
  volta ao Resumo do Projeto; `confirmedServices` nunca é tocado por essas ações.

## 12. Preservação de dados

- **Erro de validação**: nenhum campo é apagado — RHF preserva os valores já digitados
  nativamente; só os campos inválidos ganham mensagem.
- **Voltar ao resumo e retornar**: `leadDraft` (Seção 6) sobrevive à desmontagem do `LeadForm`;
  `defaultValues={leadDraft}` na remontagem devolve exatamente o que estava preenchido.
- **Falha simulada**: nem os dados do formulário (`leadDraft`), nem o projeto
  (`confirmedServices`) são tocados por `SUBMIT_LEAD_FAILURE`/`RETRY_SUBMIT`/`BACK_TO_REVIEW`.

## 13. Acessibilidade

`LeadField` (novo) cobre o pedido: `<label htmlFor>` real por campo, erro associado via
`aria-describedby`, `aria-invalid` quando há erro, mensagem com `role="alert"`. Foco no primeiro
campo inválido ao tentar enviar é o comportamento padrão do `handleSubmit` do React Hook Form —
nenhum código extra foi necessário. Navegação/envio por teclado funcionam nativamente (é um
`<form>` HTML real, com um `<button type="submit">`).

**Descoberta real desta fase**: `mode: "onBlur"` + o `reValidateMode: "onChange"` padrão do RHF —
que deveriam bastar para "remover a mensagem assim que o valor fica válido" — não revalidavam de
forma confiável nesta combinação de versões (React Hook Form 7 + `@hookform/resolvers` + Zod 4),
reproduzido de forma isolada antes de assumir que era um bug do código deste projeto. Corrigido com
um padrão mais explícito e determinístico: cada campo revalida via `trigger(field)` no seu próprio
`onChange`, mas só quando aquele campo já tem um erro exibido (nunca antes da primeira interação).
Ver `docs/DECISIONS.md`.

## 14. Testes

40 testes novos (126 → **166**), em 6 arquivos novos:

| Arquivo | Testes | Cobertura |
|---|---|---|
| `normalizeWhatsapp.test.ts` | 4 | **TESTE 7** (formatos equivalentes), número fixo, DDD "55" não confundido com DDI, entradas inválidas |
| `leadFormSchema.test.ts` | 12 | **TESTE 1-6** (vazio, nome/empresa/whatsapp/email inválidos, campo opcional vazio), **TESTE 8/9** (trim, e-mail normalizado), mensagens nunca técnicas |
| `buildLeadPayload.test.ts` | 7 | **TESTE 11-15** (contact+project, sem serviceDraft/editingService, serializável, Site+Tráfego) |
| `builderReducer.test.ts` (+9) | 45 | **TESTE 18-20** (CONTACT→SUBMITTING→SUCCESS, duplo clique, erro preserva o projeto), BACK_TO_REVIEW/RETRY_SUBMIT nos dois sentidos |
| `LeadForm.test.tsx` (novo, componente) | 9 | Renderização dos 5 campos; **TESTE de validação** (vazio, foco no primeiro erro, WhatsApp inválido e sua correção ao vivo); **TESTE 10** (preservação ao voltar/retornar); submit feliz e duplo clique; falha simulada com preservação e "tentar de novo" |

Todos os 20 cenários obrigatórios do briefing estão cobertos.

## 15. Limitações

- O gatilho de falha (`?simulateLeadFailure=1`) é uma conveniência de QA, não uma simulação
  realista de erro de rede/timeout — a Etapa 13 deve substituí-lo por uma chamada real que falha
  por motivos reais.
- Nenhuma validação de servidor existe ainda (Seção 4) — o mesmo schema está pronto para ser
  reaproveitado quando houver um servidor de verdade.
- `SubmissionError`/`SubmissionSuccess` ainda usam a mesma estética simples das outras telas
  provisórias — UI final é fase futura.

## 16. Pendências para a Etapa 13

- Persistência real (Supabase): tabelas, RLS, e o ponto exato onde `buildLeadPayload`/
  `submitLeadPayload` passam a gravar de verdade.
- Prevenção de leads duplicados por reenvio (idempotência) — registrada como algo a considerar
  nesta fase, não implementada (nenhum identificador de idempotência existe ainda no payload).
- WhatsApp/e-mail reais, admin, Lead Score, analytics — continuam fora de escopo.

---

*Este documento registra o que foi construído nesta fase. Decisões formais entraram em
`docs/DECISIONS.md`, seção "Captura e Validação do Lead (Fase 12)".*
