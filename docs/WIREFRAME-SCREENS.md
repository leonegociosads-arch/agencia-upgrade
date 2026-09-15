# WIREFRAME SCREENS — Inventário de Telas e Estados

> Fase 7 do roadmap. Lista todas as telas/estados do wireframe funcional com ID único, para referência
> cruzada com `docs/WIREFRAME.md` (detalhamento) e `docs/WIREFRAME-FLOW.md` (sequência). Nenhuma tela
> aqui tem identidade visual — apenas objetivo, elementos, CTAs e transições.

---

## WF-01 — HOME

- **Objetivo**: causar impacto, comunicar posicionamento, provar capacidade, conduzir ao Builder.
- **Elementos**: Hero (headline, apoio, CTA), bloco de posicionamento, bloco de serviços/capacidades
  (as 3 categorias, com entrada direta), bloco de prova (projetos reais/próprios/concepts), CTA Builder
  repetido, footer/contato.
- **CTA principal**: "Monte seu Upgrade" (Hero).
- **CTA secundário**: "Ver projetos" / rolar até a prova.
- **Entradas possíveis**: acesso direto à URL raiz; retorno a partir de `/projetos`, `/sobre`.
- **Saídas possíveis**: WF-02/WF-03 (Builder); `/projetos`; `/sobre`; footer (contato institucional).

## WF-02 — BUILDER INTRO

- **Objetivo**: dar contexto curto antes de mostrar as categorias, sem reter o usuário.
- **Elementos**: mensagem curta ("Vamos montar seu projeto."), transição para a pergunta de entrada.
- **CTA principal**: continuar (implícito ou explícito, conforme decisão de implementação da Fase 8/21).
- **CTA secundário**: nenhum.
- **Entradas possíveis**: WF-01 (CTA "Monte seu Upgrade"); menu institucional; seção da Home; campanha de
  tráfego; URL direta (`/builder`).
- **Saídas possíveis**: WF-03 (Seletor de serviços).

## WF-03 — SERVICE SELECT

- **Objetivo**: permitir escolher uma das 3 categorias (ou sair para contato humano, se indeciso).
- **Elementos**: 3 cards/áreas de destaque (Site, Tráfego Pago, Design/Social Media), estado
  "Configurado"/"Começar" por categoria, link secundário "Fale com a Upgrade".
- **CTA principal**: "Começar" em cada card (ação por card, não um CTA único de tela).
- **CTA secundário**: "Fale com a Upgrade" (peso visual menor, leva a canal de contato humano fora do
  Builder).
- **Entradas possíveis**: WF-02; WF-05 ("Adicionar outro serviço"); WF-06 (Meu Upgrade, "+ Adicionar
  serviço"); volta a partir de WF-04 (primeira pergunta de um mini-fluxo).
- **Saídas possíveis**: WF-04 (nova configuração); WF-07 (categoria já configurada → edição); saída
  externa (contato humano, fora do Builder).

## WF-04 — QUESTION — sequência fixa do mini-fluxo aprovado

- **Objetivo**: coletar uma resposta por vez dentro do mini-fluxo de uma categoria.
- **Elementos**: contexto curto, pergunta principal, opções (single/multi choice), voltar, continuar
  (quando aplicável), indicador de progresso, acesso ao Meu Upgrade.
- **CTA principal**: avançar (automático em `single_choice`; botão "Continuar" em `multi_choice`).
- **CTA secundário**: "Voltar".
- **Entradas possíveis**: WF-03 (primeira pergunta); a própria WF-04 (pergunta seguinte do mesmo
  mini-fluxo); WF-07 (dentro de uma edição).
- **Saídas possíveis**: próxima WF-04 (mais perguntas); WF-05 (mini-fluxo concluído); WF-03 (voltar na
  primeira pergunta).
- **Quantidade de vezes que esta tela aparece por categoria**: fixa e pré-definida, nunca decidida em
  tempo de execução — **Site**: 3 (2 se `site_tipo = "Ainda não sei"`); **Tráfego Pago**: 4, sempre
  (inclui `trafego_investimento`, adicionada no alinhamento pré-Etapa 8);
  **Design/Social Media**: 3 por serviço individual, ou a concatenação determinística dos mini-fluxos
  fixos escolhidos manualmente pelo usuário em "Montar um pacote" (ver contagem exata e exemplo em
  `docs/WIREFRAME.md`, Seção 6). Esses números não são uma quantidade padrão exigida do Builder — são o
  mínimo aprovado individualmente para cada categoria; nada impede um serviço futuro de ter uma contagem
  diferente, desde que também seja o mínimo necessário e aprovado antes da programação.

## WF-05 — SERVICE COMPLETE

- **Objetivo**: confirmar que o serviço foi adicionado ao Meu Upgrade e decidir o próximo passo.
- **Elementos**: confirmação curta ("[Serviço] adicionado ao seu Upgrade"), resumo curto das respostas,
  CTA principal, CTA secundário.
- **CTA principal**: "Finalizar meu projeto".
- **CTA secundário**: "Adicionar outro serviço".
- **Entradas possíveis**: última WF-04 do mini-fluxo (primeira vez); WF-07 (ao confirmar uma edição,
  quando a origem foi a própria tela de conclusão — caso raro, normalmente edição retorna a WF-06/WF-09).
- **Saídas possíveis**: WF-09 (Resumo); WF-03 (Adicionar outro serviço); WF-06 (Meu Upgrade, via acesso
  paralelo sempre disponível).

## WF-06 — MY UPGRADE

- **Objetivo**: mostrar o estado agregado do projeto e permitir editar, remover, adicionar ou finalizar.
- **Elementos**: lista de serviços concluídos (resumo de 1 linha cada), ação Editar/Remover por item,
  "+ Adicionar serviço", CTA de finalizar (ou estado vazio — ver WF-13).
- **CTA principal**: "Finalizar meu projeto" (quando houver ao menos 1 serviço).
- **CTA secundário**: "+ Adicionar serviço".
- **Entradas possíveis**: acessível a partir de qualquer tela do Builder (WF-03, WF-04, WF-05, WF-09) via
  painel (desktop) ou botão fixo (mobile).
- **Saídas possíveis**: WF-07 (editar item); WF-08 (remover item); WF-03 (adicionar outro); WF-09
  (finalizar); permanece aberto/fechado sem navegar (painel/drawer).

## WF-07 — EDIT SERVICE

- **Objetivo**: permitir alterar respostas de um serviço já concluído, em modo de rascunho reversível.
- **Elementos**: banner "Editando [Serviço]", perguntas do mini-fluxo com respostas pré-preenchidas,
  "Confirmar alterações", "Cancelar edição" (sempre visível).
- **CTA principal**: "Confirmar alterações".
- **CTA secundário**: "Cancelar edição".
- **Entradas possíveis**: WF-06 (Editar); WF-09 (Editar, a partir do Resumo); WF-03 (clicar em categoria
  já configurada).
- **Saídas possíveis**: retorna para a origem (WF-06 ou WF-09), atualizado se confirmado, inalterado se
  cancelado.

## WF-08 — REMOVE CONFIRM

- **Objetivo**: confirmar a remoção de um serviço antes de executá-la.
- **Elementos**: pergunta de confirmação ("Remover [Serviço]?"), duas ações.
- **CTA principal**: "Remover".
- **CTA secundário**: "Cancelar".
- **Entradas possíveis**: WF-06 (Remover); WF-09 (Remover, a partir do Resumo).
- **Saídas possíveis**: retorna à origem (WF-06 ou WF-09) atualizada; se o projeto ficar vazio, retorna
  ao estado vazio (WF-13).

## WF-09 — SUMMARY

- **Objetivo**: revisar todos os serviços configurados antes de seguir para contato.
- **Elementos**: lista de serviços com respostas-chave (sem metadados internos), Editar/Remover por
  item, CTA principal.
- **CTA principal**: "Seguir para contato".
- **CTA secundário**: nenhum CTA de avanço alternativo — editar/remover são ações de item, não CTAs de
  tela.
- **Entradas possíveis**: WF-05 ("Finalizar meu projeto"); WF-06 ("Finalizar meu projeto"); WF-07/WF-08
  (retorno após editar/remover, quando a origem foi o Resumo); WF-10 (voltar).
- **Saídas possíveis**: WF-10 (Contato); WF-07 (editar item); WF-08 (remover item); WF-06 (reabrir Meu
  Upgrade).

## WF-10 — CONTACT

- **Objetivo**: capturar os dados de contato do lead.
- **Elementos**: campos Nome, Empresa, WhatsApp, E-mail, Instagram/site (opcional), texto de apoio.
- **CTA principal**: "Enviar meu projeto".
- **CTA secundário**: "Voltar" (retorna ao Resumo, dados de contato já digitados preservados).
- **Entradas possíveis**: WF-09 ("Seguir para contato"); WF-12 (retorno após erro de envio, dados
  mantidos).
- **Saídas possíveis**: WF-11 (sucesso); WF-12 (erro de validação ou de envio).

## WF-11 — SUCCESS

- **Objetivo**: confirmar o recebimento do projeto e encerrar a jornada principal.
- **Elementos**: confirmação ("Recebemos seu Upgrade"), resumo curto, mensagem de próximo passo humano,
  ação futura reservada (WhatsApp), ação secundária disponível.
- **CTA principal (futuro, não implementado)**: "Falar agora pelo WhatsApp".
- **CTA secundário**: "Voltar ao site".
- **Entradas possíveis**: WF-10 (envio bem-sucedido).
- **Saídas possíveis**: WF-01 (Home, via "Voltar ao site"); nenhuma saída de volta ao Builder (jornada
  encerrada).

## WF-12 — ERROR

- **Objetivo**: comunicar uma falha recuperável sem perder dados nem forçar reinício.
- **Elementos**: mensagem de erro específica ao contexto (campo inválido, falha de envio, sem internet,
  falha temporária), ação de recuperação.
- **CTA principal**: "Tentar novamente" (contexto de envio) ou correção pontual do campo (contexto de
  validação).
- **CTA secundário**: nenhum além do próprio retorno ao fluxo de origem.
- **Entradas possíveis**: WF-04 (pergunta obrigatória não respondida — bloqueio local, não uma tela
  própria); WF-10 (falha de validação/envio); WF-01 (falha ao carregar um bloco de conteúdo).
- **Saídas possíveis**: retorna à mesma tela de origem com os dados preservados (WF-04 ou WF-10).

## WF-13 — EMPTY

- **Objetivo**: comunicar claramente que não há serviços configurados, sem parecer erro.
- **Elementos**: mensagem ("Nenhum serviço adicionado ainda."), CTA de retomada.
- **CTA principal**: "Escolher um serviço".
- **CTA secundário**: nenhum.
- **Entradas possíveis**: WF-08 (remoção que esvazia o projeto); acesso direto ao Meu Upgrade/Resumo sem
  nenhum serviço configurado ainda.
- **Saídas possíveis**: WF-03 (Seletor de serviços).

---

## Resumo de cobertura

| ID | Tela/estado | Corresponde à Seção de `WIREFRAME.md` |
|---|---|---|
| WF-01 | Home | 2, 3 |
| WF-02 | Builder Intro | 4 |
| WF-03 | Service Select | 5, 11 |
| WF-04 | Question | 6, 7, 8 |
| WF-05 | Service Complete | 10 |
| WF-06 | My Upgrade | 9 |
| WF-07 | Edit Service | 12 |
| WF-08 | Remove Confirm | 13 |
| WF-09 | Summary | 14 |
| WF-10 | Contact | 15 |
| WF-11 | Success | 16 |
| WF-12 | Error | 17 |
| WF-13 | Empty | 18 |

Nenhuma tela adicional foi identificada como necessária além destas 13 — cobertura confirmada contra os
6 cenários da "Revisão obrigatória" em `docs/WIREFRAME.md`.
