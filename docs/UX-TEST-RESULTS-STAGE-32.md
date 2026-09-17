# UX-TEST-RESULTS-STAGE-32 — Execução e Regressão

> Ver `docs/UX-TESTS.md` (metodologia) e `docs/UX-FRICTION-MAP.md` (achados completos) para os
> documentos complementares. Este documento registra o que foi executado, o que foi corrigido, e a
> reexecução completa da suíte de testes (Etapa 31) depois das correções — nenhuma melhoria de UX
> pode quebrar lógica (briefing, Seção 105).

## 1. O que foi executado

Auditoria heurística linha a linha de todas as telas voltadas ao usuário final e ao admin (Home,
`ServiceSelector`, `QuestionRenderer`, `ServiceComplete`, `MyUpgrade`/`MyUpgradeItem`,
`ProjectReview`, `LeadForm`, `SubmissionSuccess`/`SubmissionError`, `ConsentBanner`, 404,
`LeadDetail` e demais telas de admin), cruzada com os 105 pontos do briefing de UX e com
`docs/USER-FLOW.md`/`docs/UI-FINAL.md`/`docs/MICROINTERACTIONS.md`/`docs/DECISIONS.md`. As 7
tarefas e o teste de 5 segundos (`docs/UX-TESTS.md`, Seções 4-5) foram simulados contra o código e
confirmados pelos testes automatizados já existentes (Etapa 31) que cobrem o mesmo caminho.

## 2. Problemas encontrados e corrigidos

Ver `docs/UX-FRICTION-MAP.md` para a tabela completa com evidência. Resumo:

| # | Severidade | Tela | Problema | Correção |
| --- | --- | --- | --- | --- |
| 1 | HIGH | `ServiceComplete` | CTA principal prometia "Finalizar" mas só devolvia à tela de categorias (igual ao CTA secundário) | Renomeado para "Continuar" — sem promessa que o clique não cumpre |
| 2 | MEDIUM | `SubmissionSuccess` | Título "Projeto validado com sucesso." — redação de uma restrição (sem backend real) que não existe mais desde a Fase 13 | "Recebemos seu projeto." |
| 3 | MEDIUM | `ServiceSelector` | Sem "expectation setting" para quem entra direto no Builder | Subtítulo de uma linha adicionado |
| 4 | MEDIUM | `LeadDetail` (admin) | Score sem indicar que é indicador interno | Legenda de uma linha adicionada |

Uma tentativa de correção adicional para o item 1 (fazer o CTA abrir o drawer "Meu Upgrade"
automaticamente) foi **implementada e depois revertida** nesta mesma etapa, ao vivo, quando a
reexecução da suíte E2E completa (Seção 4 abaixo) mostrou 26 specs falhando por elemento coberto —
o drawer aberto automaticamente bloqueava a tela de categorias exatamente no momento em que a
pessoa mais provavelmente quer configurar um segundo serviço. Ver `docs/DECISIONS.md` para o
registro completo; a versão final manteve só a correção de texto, sem esse efeito colateral.

## 3. O que foi avaliado e não precisou de correção

Ver `docs/UX-FRICTION-MAP.md`, seção "Avaliados nesta etapa e mantidos como estão" — 8 pontos
avaliados e mantidos, incluindo dois que o briefing pede explicitamente para reconsiderar
(autoadvance de escolha única, copy "Continuar" do Resumo) e que foram mantidos por decisão
deliberada e já documentada em fases anteriores, sem evidência nova para justificar mudá-los.

## 4. Regressão completa (depois de todas as correções, incluindo a reversão da Seção 2)

```
lint:      0 erros, 0 avisos
typecheck: 0 erros
tests:     622/622 (Vitest)
E2E (Chromium, suíte completa): 58/60 PASS
  — as 2 falhas são as mesmas 2 flakinesses ambientais já documentadas e aceitas em
    docs/TEST-RESULTS-STAGE-31.md (Seção 90/91 — teclado; admin Seção 51 — status persiste),
    nunca reproduzíveis em isolamento, causadas pela infraestrutura de teste local (um único
    `next dev` + backend fake sem isolamento por worker) — não são regressões desta etapa.
E2E (fumaça cross-browser): Firefox 4/4, WebKit 4/4, Mobile Chrome 3/4, Mobile Safari 3/4 — ver Seção 5
build:     sucesso, 15 rotas inalteradas
```

Nenhuma correção desta etapa introduziu uma falha nova na suíte — os únicos 2 testes que falharam
na execução final são exatamente os mesmos 2 já catalogados como flakiness ambiental na Etapa
anterior, não uma consequência de nenhuma mudança desta etapa.

## 5. Fumaça cross-browser (Firefox/WebKit/Mobile Chrome/Mobile Safari)

Mesma suíte de 4 testes por navegador já usada na Etapa 31 (Home, jornada completa do Builder,
consentimento, login do admin), sem nenhuma mudança nela nesta etapa:

| Navegador | Resultado |
| --- | --- |
| Firefox | 4/4 PASS |
| WebKit | 4/4 PASS |
| Mobile Chrome | 3/4 PASS (1 flake — "login do admin" sob carga, mesma causa já documentada na Etapa 31) |
| Mobile Safari | 3/4 PASS (1 flake — mesma causa) |

Números idênticos, teste a teste, aos da baseline registrada em
`docs/TEST-RESULTS-STAGE-31.md` — nenhuma regressão nova introduzida por esta etapa.

## 6. Riscos remanescentes

- Nenhuma correção desta etapa foi validada com pessoas reais (ver `docs/UX-TESTS.md`, Seção 7) —
  o risco residual é que um problema de UX real só apareça numa sessão observada, não numa leitura
  de código.
- A tentativa revertida (Seção 2) reforça que qualquer futura mudança de comportamento do Builder
  (não só de copy) precisa rodar a suíte E2E completa antes de ser considerada concluída — uma
  melhoria isolada pode quebrar um fluxo maior que depende do estado anterior dela.
