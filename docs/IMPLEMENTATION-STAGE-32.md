# IMPLEMENTATION-STAGE-32 — Testes de UX

> Resumo técnico da Etapa 32. Ver `docs/UX-TESTS.md` (metodologia), `docs/UX-FRICTION-MAP.md`
> (achados completos, corrigidos e avaliados/mantidos) e `docs/UX-TEST-RESULTS-STAGE-32.md`
> (execução e regressão) para os documentos complementares.

## 1. Estrutura desta etapa

Etapa de auditoria e correção pontual, não de implementação de feature — por isso não há uma
"estrutura de testes nova" como na Etapa 31 (nenhum framework, nenhuma suíte nova). O trabalho foi:
ler todas as telas voltadas ao usuário final (Home, Builder completo, Meu Upgrade, Resumo,
formulário de contato, sucesso/erro, admin, consentimento, 404), confrontar cada uma com os 105
pontos do briefing de UX, corrigir o que era CRITICAL/HIGH/MEDIUM de baixo custo, documentar o
resto, e reexecutar a suíte de testes já existente (Etapa 31) para garantir que nada quebrou.

## 2. Mudanças realizadas

### 2.1 [HIGH] `ServiceComplete.tsx` — CTA principal não fazia o que dizia

**Achado**: os dois botões da tela de conclusão de serviço ("Ver Meu Upgrade / Finalizar" e
"Adicionar outro serviço") chamavam a mesma função (`handleContinue` → `goToEntry()`, que só
devolve à tela de categorias). O texto do botão principal prometia "Finalizar", mas nada era
finalizado ali — era preciso um segundo clique, num botão diferente ("Meu Upgrade", na barra de
navegação), que a pessoa tinha que notar sozinha, para só então chegar ao "Finalizar projeto" real.

**Primeira tentativa (revertida)**: fazer o botão principal abrir o drawer "Meu Upgrade" de verdade
(`onViewUpgrade` passado de `BuilderShell.tsx`), além de navegar. Ao rodar a suíte E2E completa,
**26 specs passaram a falhar** com erros de "elemento intercepta o clique" — esse mesmo botão é o
caminho compartilhado (`continueFromServiceComplete`, usado por praticamente todo teste) para
"voltar depois de concluir um serviço", inclusive para configurar um SEGUNDO serviço em seguida
(Cenário 2 de `docs/USER-FLOW.md`: Site + Tráfego). Abrir o drawer automaticamente aqui cobria a
tela de categorias bem no momento em que a pessoa mais provavelmente quer clicar num cartão por
baixo dele — pior para quem configura vários serviços (Perfil C) do que o problema original. A
suíte de testes pegou uma regressão de UX real antes que ela chegasse a qualquer ambiente.

**Correção final**: reverter a abertura automática do drawer; manter só a mudança de texto — botão
principal renomeado para "Continuar" (nem "Finalizar", nem "Ver Meu Upgrade" — nenhuma promessa que
o clique não cumpre). Comportamento (`goToEntry()`) idêntico ao de antes desta etapa. Ver
`docs/DECISIONS.md` para o registro completo da tentativa descartada — essa é a lição real desta
correção: uma mudança de UX que parece uma melhoria isolada pode quebrar um fluxo maior que depende
do estado anterior dela, e a suíte de regressão é o que evita que isso chegue a produção.

### 2.2 [MEDIUM] `SubmissionSuccess.tsx` — título com redação de uma restrição que não existe mais

**Achado**: "Projeto validado com sucesso." — "validado" soa como uma etapa de aprovação/triagem
ainda pendente. A redação vinha de uma decisão real da Fase 12 (`docs/DECISIONS.md`): "Recebemos"
foi evitado ali porque, naquela fase, não existia nenhuma persistência/integração real — dizer
"recebemos" seria falso. Essa razão não existe mais desde a Fase 13 (Supabase real): este
componente só é alcançado depois de `submitLeadSuccess()`, chamada em `LeadForm.tsx` apenas quando
a Server Action confirma a gravação no banco.

**Correção**: título alterado para "Recebemos seu projeto." — a redação que `docs/USER-FLOW.md`
(Seção 15) já previa desde a Fase 4, agora tecnicamente verdadeira. Nenhum outro texto da tela foi
alterado (a nota de "Próximo passo" já estava correta desde a Fase 19).

### 2.3 [MEDIUM] `ServiceSelector.tsx` — falta de "expectation setting" na entrada do Builder

**Achado**: quem entra direto no Builder (campanha, URL direta — `docs/USER-FLOW.md` Seção 2, um
ponto de entrada válido por si só) via só o título "Por onde você quer começar?" e 3 cartões, sem
nenhuma linha explicando que a experiência é uma sequência curta de perguntas terminando num
resumo — o "expectation setting" pedido pelo briefing (Seções 4/5) simplesmente não existia ali.

**Correção**: subtítulo de uma linha adicionado entre o título e os cartões: "Escolha uma área e
responda algumas perguntas rápidas — no final, você tem um resumo do seu projeto para enviar para
a gente." Sem jargão, sem quebrar o limite de "não criar textos longos" (Seção 5).

### 2.4 [MEDIUM] `LeadDetail.tsx` (admin) — Score sem indicar que é um indicador interno

**Achado**: o número do score aparecia sozinho ("87 pontos — Prioridade"), sem nada comunicando que
é uma heurística interna de priorização (`docs/LEAD-SCORE.md`), não uma nota definitiva do lead —
exatamente o risco que o briefing (Seção 59) pede para evitar.

**Correção**: legenda de uma linha adicionada acima do valor: "Indicador interno de prioridade —
não é uma nota definitiva sobre o lead."

### 2.5 Blast radius das mudanças de copy (testes atualizados, não a aplicação)

Renomear/reescrever os textos das Seções 2.1/2.2 exigiu atualizar as referências literais a essas
strings em testes já existentes (nenhuma lógica de teste mudou, só o texto esperado):

- `"Ver Meu Upgrade / Finalizar"` → `"Continuar"`: `e2e/helpers/builder.ts`,
  `BuilderShell.test.tsx`, `BuilderShell.analytics.test.tsx`, `BuilderShell.sessionPersistence.test.tsx`
  (nestes últimos dois, o clique no botão `/Meu Upgrade/` da navegação — necessário para abrir o
  drawer manualmente, já que essa abertura automática foi revertida — permanece exatamente como
  estava antes desta etapa).
- `"Projeto validado com sucesso."` → `"Recebemos seu projeto."`: `e2e/core.smoke.spec.ts`,
  `e2e/lead-form.spec.ts`, `e2e/security.spec.ts`, `BuilderShell.analytics.test.tsx`,
  `BuilderShell.sessionPersistence.test.tsx`, `LeadForm.test.tsx`.
- A tentativa revertida da Seção 2.1 chegou a exigir (e depois desfazer) uma mudança adicional
  nesses mesmos testes unitários: como o drawer teria passado a abrir sozinho, o clique manual no
  botão `/Meu Upgrade/` da navegação virou redundante e ambíguo por um momento (esse regex passou a
  casar tanto o botão da navegação quanto o "×" de fechar do drawer já aberto, cujo `aria-label` é
  "Fechar Meu Upgrade") — removido e depois restaurado junto com a reversão da Seção 2.1.

## 3. O que NÃO foi alterado (avaliado e mantido)

Ver `docs/UX-FRICTION-MAP.md`, seção "Avaliados nesta etapa e mantidos como estão", para a lista
completa com a justificativa de cada um — em resumo: autoadvance de perguntas de escolha única
(decisão deliberada e testada desde a Etapa 22), copy "Continuar" do Resumo (já testado com 14
asserções, contexto já claro), banner de consentimento, 404, diálogo de remoção, formulário de
contato, comportamento mobile do Meu Upgrade. Nenhum redesenho, nenhuma mudança de identidade
visual, nenhuma pergunta nova ou removida.

## 4. Regressão

Ver `docs/UX-TEST-RESULTS-STAGE-32.md` para os números completos. Resumo: lint/typecheck limpos,
622/622 testes unitários/integração, suíte E2E completa (Chromium + fumaça cross-browser)
reexecutada sem regressão nova além da flakiness ambiental já documentada e aceita na Etapa 31, e
build de produção com sucesso.

## 5. Limitações desta etapa

- Auditoria heurística de código/copy, não sessão moderada com pessoas reais (briefing Seções
  92-97) — roteiro pronto em `docs/UX-TESTS.md` Seção 6, não executado (exige agendar pessoas,
  fora do escopo de uma sessão de código).
- Percepção subjetiva de motion/sound/velocidade sob interação humana real continua sem poder ser
  medida por este processo — mesma limitação já registrada na Etapa 30/31.
- O item LOW da tabela de friction map (rótulos internos de `ruleId` na composição do score do
  admin) foi documentado, não corrigido — custo desproporcional ao ganho para uma tela interna de
  baixo tráfego (briefing Seção 78/102).

## 6. Pendências para a Etapa 33

- Executar o roteiro de teste com usuários reais (`docs/UX-TESTS.md` Seção 6) com 3-5 pessoas,
  incluindo ao menos um teste em celular de verdade e uma pessoa do Perfil D.
- Cruzar os resultados desse teste com analytics de funil (`docs/ANALYTICS.md`) — abandono/tempo/
  completude por etapa — assim que houver volume real de uso.
- Reavaliar o rótulo de `ruleId` bruto no admin (LOW, Seção 5 do friction map) se a equipe da
  Upgrade sinalizar que isso já atrapalha o uso do dia a dia.
- Pendências já carregadas de fases anteriores (MFA, backup do Supabase, upgrade do Vitest,
  exclusão/exportação de lead — Etapa 29/31) continuam de pé, sem relação com esta etapa.
