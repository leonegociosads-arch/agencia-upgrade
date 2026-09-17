# UX-TESTS — Metodologia de Testes de UX

> Etapa 32 do roadmap. Documenta como a experiência foi avaliada nesta fase — perfis, tarefas,
> critérios e checklist — não o que foi encontrado (isso é `docs/UX-FRICTION-MAP.md` e
> `docs/UX-TEST-RESULTS-STAGE-32.md`). Objetivo desta etapa: **observar, identificar fricção,
> simplificar, corrigir** — nunca redesenhar, trocar identidade visual ou adicionar feature nova
> (briefing, seção de restrições).

## 1. Pergunta que guia tudo

> "Uma pessoa que nunca viu o site entende o que fazer sem explicação?"

Toda avaliação nesta fase volta a essa pergunta, medida contra: clareza, orientação, esforço
mental, sensação de progresso, confiança, velocidade percebida, facilidade de decisão, facilidade
de correção (briefing, "Objetivo Principal").

## 2. Método usado nesta fase

Esta etapa foi executada como uma **auditoria heurística de código e copy** (leitura de todos os
componentes visíveis ao usuário final — Home, Builder completo, Meu Upgrade, Resumo, formulário,
sucesso/erro, admin, consentimento, 404 — cruzada com `docs/USER-FLOW.md`, `docs/UI-FINAL.md`,
`docs/MICROINTERACTIONS.md` e `docs/DECISIONS.md`), não uma sessão moderada com pessoas reais. Isso
é uma limitação reconhecida (Seção 7 abaixo) e coerente com o que uma etapa de código consegue
produzir sozinha: **testes com usuários reais (briefing Seções 92-97) exigem agendar e observar
pessoas de verdade, fora do escopo de uma sessão de desenvolvimento** — o que esta etapa entrega é
o roteiro pronto para isso (Seção 6) e uma auditoria rigorosa o suficiente para eliminar a fricção
óbvia antes de gastar o tempo de pessoas reais nela.

Cada tela foi lida como incorporando um dos 5 perfis abaixo, perguntando explicitamente "essa
pessoa entenderia isso sem ajuda?", e cada uma das 7 tarefas foi simulada mentalmente e depois
confirmada com os testes automatizados já existentes (Etapa 31: 622 testes unitários/integração +
~64 E2E cobrindo o mesmo caminho literal que essas tarefas descrevem).

## 3. Perfis simulados (briefing, Seção 1)

| Perfil | Descrição | Onde entra no fluxo |
| --- | --- | --- |
| A | Sabe exatamente o que quer ("Quero uma Landing Page") | `site_tipo = landing_page`, decisão rápida |
| B | Sabe a área, não os detalhes ("Preciso de tráfego pago") | Categoria clara, respostas do mini-fluxo exigem alguma reflexão |
| C | Interessado em vários serviços | Fluxo de "Adicionar outro serviço" + Meu Upgrade com 2+ itens |
| D | Pouco familiarizada com marketing digital | Linguagem das perguntas precisa ser lida sem jargão (Seção 12/13) |
| E | Usando celular | Toda a jornada revisitada nos viewports mobile já usados na Etapa 31 |

## 4. Tarefas testadas (briefing, Seções 66-73)

| # | Tarefa | Cobertura |
| --- | --- | --- |
| First click | "Quero criar um site" → onde clicaria primeiro? | `ServiceSelector`: 3 cartões, rótulos e descrições únicos — sem ambiguidade entre "Criar um site" e as outras 2 categorias |
| Task 1 | "Quero um site institucional" configurado sem ajuda | `e2e/builder-services.spec.ts` (fluxo completo do Site) |
| Task 2 | "Quero anunciar meu restaurante" → chega em Tráfego Pago naturalmente | Rótulo "Atrair mais clientes" + descrição "Gestão de tráfego pago e campanhas." |
| Task 3 | "Quero melhorar identidade e redes sociais" → entende Design/Social | Rótulo "Fortalecer minha marca e conteúdo" + descrição |
| Task 4 | "Quero Site + Tráfego" sem reiniciar | `e2e/builder-services.spec.ts` (múltiplos serviços) |
| Task 5 | "Marquei coisa errada" → corrige sem medo | `e2e/builder-navigation.spec.ts`, `e2e/builder-draft-confirmed.spec.ts` |
| Task 6 | "Fechei sem querer" → sessão recupera | `e2e/session-persistence.spec.ts` (Etapa 31) |
| Task 7 | "Quero revisar antes de enviar" | `ProjectReview` (Resumo) |

## 5. Five-second test / confiança (briefing, Seções 65, 74)

Aplicado à Home (`HeroSection.tsx`) lendo só o que está visível acima da dobra, sem rolar:
"Estúdio digital de performance" (badge) + "Um upgrade real na presença digital da sua empresa."
(título) + "Sites, tráfego pago e design trabalhando juntos — com um processo claro do primeiro
clique ao projeto entregue." (subtítulo) + "Monte seu Upgrade" (CTA). As 3 perguntas do teste:

1. **O que essa empresa faz?** — sites, tráfego pago e design, juntos.
2. **Qual a ação principal?** — "Monte seu Upgrade" (único CTA com destaque de cor/magnetismo).
3. **Que impressão transmite?** — estúdio digital profissional, processo estruturado.

Nenhuma correção necessária na Home (ver `docs/UX-FRICTION-MAP.md`). O ponto real de confusão
encontrado nesta fase estava um passo depois — ao entrar no Builder em si (Seção 6.3 da mesma
tabela) — corrigido (ver Seção 8 abaixo).

## 6. Roteiro para teste com usuários reais (briefing, Seções 92-97) — preparado, não executado

Não executado nesta etapa (exige pessoas reais agendadas, fora do escopo de uma sessão de código).
Roteiro pronto para quando a Upgrade quiser rodar:

1. **Recrutamento**: 3 a 5 pessoas, não precisam ser especialistas em marketing/tecnologia
   (briefing, Seção 92) — de preferência incluindo ao menos uma pessoa do Perfil D (pouco
   familiarizada com marketing digital) e um teste em celular de verdade (Perfil E).
2. **Consentimento de gravação** (Seção 97): se a sessão for gravada, pedir permissão explícita
   antes, e nunca gravar sem isso.
3. **Tarefa única por vez, sem explicar onde clicar** (Seção 93): dar uma das 7 tarefas da Seção 4
   por vez, em silêncio, observando.
4. **Não ajudar cedo** (Seção 94): se a pessoa hesitar, registrar o momento e o motivo aparente,
   sem intervir, a menos que ela trave por completo.
5. **Perguntas pós-teste** (Seção 95, nunca "você gostou?" — Seção 96, comportamental):
   - O que você achou que ia acontecer quando clicou aqui?
   - Algo te confundiu em algum momento?
   - Alguma pergunta foi difícil de responder?
   - Em algum momento você teve medo de perder o que já tinha preenchido?
   - O processo pareceu longo?
6. **Registro**: cada hesitação/dúvida vira uma linha em `docs/UX-FRICTION-MAP.md`, com a mesma
   estrutura (Tela → Problema → Severidade → Evidência → Correção) — a evidência, neste caso, é a
   observação da sessão, não uma leitura de código.
7. **Cruzamento com analytics** (Seção 98): depois de rodado, cruzar com abandono/tempo por etapa/
   completude de serviço já capturados pela Fase 17 (`docs/ANALYTICS.md`) — nunca usar analytics
   sozinho como verdade (parte comportamental, parte numérica).

## 7. Limitações desta execução

- **Sem pessoas reais** (Seção 6 acima) — a auditoria desta etapa é heurística/especialista, o
  método mais rigoroso disponível sem agendar sessões reais, mas não substitui observação de
  comportamento real (hesitação, tempo de leitura, expressão de dúvida).
- **Sem gravação de tela/eye-tracking** — pelo mesmo motivo.
- **Motion/sound "sentido"** (briefing Seções 42-50, 99-101) foi avaliado por leitura de código e
  pelos testes automatizados de Etapa 24/31 (reduced motion, sem som, WebGL desativado,
  performance percebida), não por assistir a própria animação em tempo real com um cronômetro
  humano — mesma limitação já registrada em `docs/TEST-RESULTS-STAGE-31.md`.

## 8. Critério de correção (briefing, Seções 76-78, 102)

- **CRITICAL/HIGH**: corrigidos nesta própria etapa antes de fechar (Seção 77).
- **MEDIUM/LOW**: corrigidos quando o custo era de uma linha de copy (Seção 78: "não inventar
  problema" corta as duas formas — não inventar um problema que não existe, e não inflar a
  correção de um problema real pequeno em uma tarefa maior do que ele precisa).
- **Nenhuma correção desta etapa mudou uma pergunta, uma regra de ramificação, um cálculo de
  score, ou a identidade visual** — só copy e, num único caso (`ServiceComplete.tsx`), a ligação
  entre um botão que já existia e um painel que já existia (ver `docs/UX-FRICTION-MAP.md` e
  `docs/IMPLEMENTATION-STAGE-32.md`).
