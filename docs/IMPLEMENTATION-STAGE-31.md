# IMPLEMENTATION STAGE 31 — Testes Funcionais

> Ver `docs/FUNCTIONAL-TESTS.md` (estratégia/ambiente) e `docs/TEST-RESULTS-STAGE-31.md`
> (resultados desta execução) para os documentos complementares. Este documento é o resumo
> técnico: estrutura de testes, bugs corrigidos, decisões, limitações e pendências.

## 1. Estrutura de testes criada

- **Playwright** adicionado como dependência de desenvolvimento (`@playwright/test`) — primeiro
  framework E2E do projeto. `playwright.config.ts`: `webServer` sobe `next dev` com
  `E2E_TEST_MODE=true`; projeto `chromium` roda a suíte funcional completa; `firefox-smoke`/
  `webkit-smoke`/`mobile-chrome-smoke`/`mobile-safari-smoke` rodam só `e2e/core.smoke.spec.ts`.
- **`lib/testing/isE2ETestMode.ts`** + **`lib/testing/e2eStore.ts`** — backend em memória usado
  pelos repositórios/Server Actions de auth SÓ quando `E2E_TEST_MODE=true` (nunca em `next dev`/
  `next start`/produção reais). Ver `docs/FUNCTIONAL-TESTS.md`, Seção 3, para o racional completo
  (decisão tomada com o usuário: nunca gravar dados de teste no Supabase real).
- **11 arquivos de spec E2E** em `e2e/` (~64 testes) + 2 arquivos de helpers
  (`e2e/helpers/builder.ts`, `e2e/helpers/admin.ts`) — listados em
  `docs/FUNCTIONAL-TESTS.md`, Seção 6.
- Scripts novos: `test:e2e`, `test:e2e:ui`, `test:e2e:report`.

## 2. Bugs reais encontrados e corrigidos

Todos encontrados rodando os specs num navegador de verdade — nenhum visível nos 622 testes
unitários/integração já existentes (`jsdom` não calcula layout, sobreposição ou z-index reais, e
não roda contra múltiplos motores de navegador).

### 2.1 [CRITICAL] HSTS quebrava a aplicação inteira no WebKit/Safari em desenvolvimento

`next.config.ts` (Etapa 29) enviava `Strict-Transport-Security` e `upgrade-insecure-requests`
incondicionalmente, em todo ambiente. O WebKit aplica HSTS de forma mais estrita que Chromium/
Firefox mesmo em `localhost`: depois da primeira resposta com esse cabeçalho, toda requisição
seguinte era promovida para HTTPS — contra um `next dev` que só fala HTTP. Resultado: fontes, CSS e
chunks JS falhavam silenciosamente ("SSL connect error" no console), fazendo parecer que banner de
consentimento, login do admin e o próprio Builder estavam quebrados, quando a causa real era
puramente de transporte. **Não afeta usuários reais em produção** (lá o domínio já é servido por
HTTPS de verdade, exatamente o cenário em que HSTS deve valer) — mas teria impedido qualquer
desenvolvimento ou teste real no Safari. Só apareceu ao adicionar WebKit à suíte de fumaça (Seção
89 do briefing, "quando possível"); nunca reproduzido em Chromium/Firefox.

**Correção**: os dois cabeçalhos agora só são enviados quando `NODE_ENV !== "development"`
(`next.config.ts`). Teste de regressão adicionado em `next.config.test.ts`.

### 2.2 [HIGH] O painel "Meu Upgrade" bloqueava a interação com a tela por trás dele

`MyUpgrade.tsx`/`BuilderShell.tsx` documentavam explicitamente esse painel como "uma seção
persistente, não um modal" — o usuário pode editar um serviço ou voltar ao seletor com o painel
ainda visível (comportamento testado e confirmado correto em `MyUpgrade.test.tsx`, TESTES 5/6/7/13
e "+ Adicionar outro serviço"). O problema: o `Drawer` genérico usado por baixo desenhava um
overlay cobrindo a tela INTEIRA (`inset: 0`) que capturava todo clique — na prática, um usuário
real não conseguia interagir com a tela de edição atrás do painel, mesmo essa sendo exatamente a
experiência pretendida. `jsdom` nunca pegou isso porque não computa sobreposição/`pointer-events`
de verdade para despachar cliques.

**Correção**: `.upgradeOverlay` (`BuilderShell.module.css`) ganhou `pointer-events: none` (o
escurecido visual continua idêntico); `.upgradePanel` ganhou `pointer-events: auto` explícito para
continuar clicável. Efeito colateral aceito: clicar no fundo escurecido não fecha mais o painel
(nunca foi testado nem parte do contrato documentado) — fechar continua funcionando pelo "×" e por
Esc (Seção 2.4).

*Nota de processo*: a primeira tentativa de correção foi ERRADA — fechar o painel automaticamente
ao clicar "Editar"/"+ Adicionar outro serviço" (`onClose?.()`), o que quebrou 4 testes unitários
já existentes que confirmavam o comportamento oposto como intencional. Revertido antes de
prosseguir com a correção certa (CSS, não lógica) — ver `docs/DECISIONS.md`.

### 2.3 [HIGH] Um controle específico ficava geometricamente inatingível em telas ~1280px

Mesmo depois da correção 2.2, "Cancelar edição"/"← Voltar" (barra superior de
`QuestionRenderer.tsx`) caía, em telas por volta de 1280px de largura, dentro da faixa horizontal
de 420px que o painel "Meu Upgrade" sempre ocupa (ele é clicável de propósito, ver 2.2). Confirmado
via inspeção de `boundingBox()` antes de corrigir (não um chute): as caixas se sobrepunham em
~85px. Corrigido dando à barra (`.topRow`, `QuestionRenderer.module.css`) `position: relative` +
`z-index` acima do Drawer.

### 2.4 [MEDIUM] Nenhum componente fechava com Esc

Busca no projeto inteiro não encontrou nenhum tratamento de tecla Escape (briefing, Seção 93:
"fechar modal/drawer/menu quando apropriado"). Corrigido no `Drawer` genérico (prop `onClose`
opcional, usada pelo "Meu Upgrade") e no `RemoveServiceDialog`. Um segundo bug apareceu ao
implementar: como o diálogo de remoção vive DENTRO do drawer, os dois `document.addEventListener
("keydown", ...)` disparavam para o MESMO Esc — fechava o diálogo E o drawer inteiro junto.
Corrigido registrando o listener do diálogo em fase de CAPTURA + `stopPropagation()`, que sempre
roda antes de um listener em fase de bolha no mesmo alvo (`document`).

### 2.5 [MEDIUM] `clearProps` do GSAP não limpava nada em dois hooks de microinteração

`useTilt.ts` e `useAvoidCursor.ts` chamavam `gsap.set(el, { clearProps: "transform" })` depois de
animar propriedades como componentes individuais (`rotateX`/`rotateY`/`scale` via `quickTo`, não o
atalho `transform`) — o CSSPlugin do GSAP não reconhece essas propriedades pelo nome `"transform"`
e avisa "not eligible for reset" no console, sem limpar o estilo inline. Um bug puramente de
console (não afeta visualmente o resultado, já que as propriedades já tinham sido animadas para
seus valores neutros), mas real e nunca antes detectado — só aparece interagindo de verdade com o
mouse num navegador. Corrigido nomeando as propriedades pelo nome CANÔNICO do GSAP (`rotationX`/
`rotationY` para `useTilt`; `x`/`y`, que já eram canônicos, para `useAvoidCursor`).

### 2.6 Bugs de fixture/teste (não do código de produção)

- **IDs de lead não-UUID**: os 3 leads-fixture usavam ids como `"e2e-seed-1"` — a validação real
  de `updateLeadStatus`/`addLeadNote` (`z.uuid()`, Etapa 29) rejeitava qualquer alteração de status
  ou nota com "Identificador de projeto inválido.", silenciosamente do ponto de vista do teste (a
  UI mostrava o erro, mas o teste não estava olhando para ele). Corrigido com IDs em formato UUID
  de verdade.
- **Campos de resposta inventados na fixture**: `site_tipo: "institucional"` (deveria ser
  `"site_institucional"`), `trafego_objetivo` (não existe — o campo real é `trafego_negocio`),
  `design_escopo` (não existe — o campo real é `design_servico`). `buildServiceSummary` ignora
  campos desconhecidos silenciosamente (só um aviso no console) — não quebrava nada, mas violava a
  própria disciplina do projeto de nunca inventar dado. Corrigido usando ids reais de
  `features/builder/data/*.ts`.
- **Rate limit de login bloqueando testes legítimos**: com login paralelo real e repetido contra a
  MESMA conta fixa (`admin@e2e.test`), o rate limit de 5 tentativas/5 minutos (Etapa 29) — correto
  e intencional em produção — passou a bloquear execuções de teste legítimas. Corrigido isentando
  especificamente essa conta fixa do rate limit SÓ quando `E2E_TEST_MODE=true`; o rate limit real
  continua testado com um e-mail exclusivo por execução em `security.spec.ts`.
- **Ambiguidade de seletor (`ServiceSelector` "Configurado X" coexistindo com "Meu Upgrade" no
  DOM)**: vários specs quebravam com "strict mode violation" ao buscar texto sem escopo — corrigido
  com um helper `myUpgradeText()` que escopa ao painel, e âncoras de regex mais específicas
  (`^(Configurado )?Label`) para os cards de serviço.
- **`<td>` da tabela desktop não é clicável** (`LeadsList.tsx` — só a última coluna, "Abrir", é um
  `<Link>` de verdade) — corrigido navegando pelo `href` do link em vez de clicar no texto do nome.

## 3. Decisões

Ver `docs/DECISIONS.md`, entradas `[TESTES]`, para o racional completo de cada uma: backend fake
por injeção de dependência (não mock de rede do navegador), `next dev` em vez de build+start no
`webServer`, isenção do rate limit só para a conta fixa de E2E, `workers: 2` + serialização do
arquivo de admin, e a correção HSTS.

## 4. Cobertura dos "testes obrigatórios" do briefing (Seção 104, herdada da Etapa 29)

Já coberta por testes unitários existentes (não duplicada em E2E): score do cliente ignorado,
payload/serviços grandes demais rejeitados, `service_id` inválido rejeitado, submission duplicada
tratada como sucesso (idempotência). Nova cobertura E2E nesta fase: público não acessa `/admin`
(Seção 46/72), não-admin (sem sessão) não altera status/cria nota (Seção 54), rate limit funciona
(Seção 74), honeypot rejeita (Seção 75), secrets não aparecem no client (garantido estruturalmente
por `import "server-only"`, não testável em runtime de navegador).

## 5. Revisão técnica final

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes unitários/integração**: 622/622 (eram 620 ao final da Etapa 30; +2 desta fase, testes
  de regressão do bug HSTS).
- **E2E**: 58/60 Chromium + 4/4 Firefox + 4/4 WebKit + 3/4 Mobile Chrome + 3/4 Mobile Safari — ver
  `docs/TEST-RESULTS-STAGE-31.md` para a análise completa da flakiness residual (ambiental, não
  de aplicação).
- **Build**: sucesso; tabela de rotas inalterada (15 rotas).

## 6. Limitações desta fase

- O backend fake de E2E não tem isolamento por worker/teste (Seção 3 de
  `docs/FUNCTIONAL-TESTS.md`) — mitigado, não eliminado.
- Nenhuma CI configurada (fora do escopo pedido nesta fase).
- Testes manuais listados em `docs/TEST-RESULTS-STAGE-31.md`, Seção 5, continuam manuais de
  propósito (qualidade subjetiva de motion, hardware físico real).

## 7. Pendências para a Etapa 32

- Se a suíte E2E crescer: considerar um backend de teste com isolamento real por worker (banco de
  teste efêmero, ou um store fake com namespace por `testInfo.workerIndex`).
- Configurar uma pipeline de CI simples (`npm run lint && npm run typecheck && npm run test &&
  npm run test:e2e -- --project=chromium`) quando fizer sentido para o fluxo da equipe.
- Reavaliar a flakiness residual (Seção 4 de `docs/TEST-RESULTS-STAGE-31.md`) se ela se tornar mais
  frequente ou incomodar o fluxo de trabalho.
- Pendências já registradas em fases anteriores (MFA do admin, backup/restore do Supabase, upgrade
  do Vitest, exclusão/exportação de lead) continuam de pé, não duplicadas aqui.
