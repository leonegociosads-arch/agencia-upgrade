# WIREFRAME — Wireframe Funcional do Site da Agência Upgrade

> Fase 7 do roadmap. Wireframe **funcional**, não visual: define telas, elementos, hierarquia, navegação
> e quantidade de informação — nunca cor, tipografia, tokens de design ou motion avançado. Usa como fonte
> de verdade tudo já decidido em `docs/USER-FLOW.md`, `docs/USER-FLOW-DIAGRAM.md`,
> `docs/BUSINESS-RULES.md` e `docs/TECHNICAL-ARCHITECTURE.md`. Nenhuma pergunta, regra ou categoria é
> criada, alterada ou removida aqui — este documento só decide *como as telas se organizam*, não *o que
> elas perguntam*. Nenhum código de produção foi alterado nesta fase.

---

## 1. Princípios

- **Uma decisão principal por tela.** Nenhuma tela do Builder acumula múltiplas perguntas simultâneas.
- **Parece montagem de projeto, não formulário.** Evitar tabelas longas, checklists gigantes, várias
  perguntas na mesma tela, aparência de software corporativo genérico.
- **"Meu Upgrade" nunca parece carrinho de e-commerce** — sem ícone de sacola, sem "checkout", sem
  "produto" (decisão já registrada em `DECISIONS.md`, Fase 1).
- **Reversibilidade sempre visível**: voltar, editar e remover são ações acessíveis em qualquer tela
  relevante, nunca escondidas.
- **Nenhuma informação interna é exibida ao cliente** (IDs, `complexity score`, `PRICE_SIGNAL`,
  `LEAD_SCORE_SIGNAL`) — essas informações existem só em `BUSINESS-RULES.md`, nunca em tela.
- **Textos são provisórios.** Este documento usa copy curta só para testar fluxo — nenhum texto aqui é
  definitivo (identidade de conteúdo pertence a fases futuras).
- **Foco desktop e mobile igualmente sérios** — nenhuma tela é "a versão mobile encolhida da desktop".

---

## 2. Home

A Home precisa ter ritmo, não ser institucional longa. Avaliando os blocos sugeridos, dois foram
fundidos para evitar excesso: "Demonstração/experiência" não vira uma seção própria — ela acontece dentro
do Hero (a própria interatividade do Hero já demonstra capacidade) e dentro do bloco de Prova. Estrutura
final de blocos (WF-01):

```
[ HERO ]                      — impacto + CTA principal (Seção 3)
[ POSICIONAMENTO ]            — 1 frase + 2-3 pilares curtos (o que a Upgrade faz e para quem)
[ SERVIÇOS / CAPACIDADES ]    — as 3 categorias do Builder, já com CTA de entrada direta em cada uma
[ PROVA DE CAPACIDADE ]       — projetos reais / produtos próprios / concepts, rotulados (Seção 5)
[ CTA BUILDER (repetido) ]    — reforço do CTA principal antes do rodapé, para quem rolou a página toda
[ CONTATO / FOOTER ]          — navegação institucional completa, contato direto, redes sociais
```

Nenhum bloco institucional extenso (ex.: "Sobre a agência" longo) faz parte da Home nesta fase — se
existir, é a página `/sobre`, não um scroll adicional na Home.

---

## 3. Hero

Função e hierarquia, sem decisão visual:

```
[ logo ]                                   [ menu institucional minimo ]

   Mensagem principal (headline curta)
   Texto de apoio (1-2 linhas)

   [ Monte seu Upgrade ]   ← CTA principal
   ( Ver projetos )        ← CTA secundário, peso visual bem menor
```

- CTA principal: **"Monte seu Upgrade"** (nomenclatura já usada em `USER-FLOW.md`).
- CTA secundário é opcional e nunca compete visualmente com o principal — leva a `/projetos` ou rola até
  a seção de prova, não abre o Builder.

---

## 4. Entrada do Builder (WF-02)

Tela de transição curta entre "decidiu explorar" e "está escolhendo categoria" — existe para dar
contexto, não para reter o usuário:

```
BUILDER INTRO

  "Vamos montar seu projeto."

  "Por onde você quer começar?"

  [ continuar → ]
```

Pode ser uma tela própria (transição de ~1-2s com o texto) ou o próprio topo da tela de seleção (WF-03) —
decisão de implementação (animada ou estática) fica para a Fase 8/21; aqui importa só que o usuário
recebe esse contexto antes de ver as 3 categorias.

---

## 5. Seletor de serviços (WF-03)

Mostra **exatamente 3 categorias**, nunca uma quarta. Cada categoria indica se já está configurada no
projeto atual (Seção 4 de `USER-FLOW.md`).

**Desktop** — três áreas de destaque lado a lado:

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Site           │   │ Tráfego Pago   │   │ Design/Social  │
│ Criar um site  │   │ Atrair clientes│   │ Fortalecer     │
│ que representa │   │ com anúncios   │   │ marca/conteúdo │
│ seu negócio    │   │                │   │                │
│                │   │                │   │                │
│ [ Começar ]    │   │ [ Começar ]    │   │ [ Começar ]    │
└───────────────┘   └───────────────┘   └───────────────┘

        Não sabe exatamente do que precisa? Fale com a Upgrade →
        (peso visual bem menor que os 3 cards — link, não card)
```

Cada card já configurado troca `[ Começar ]` por `✓ Configurado — [ Ver/Editar ]`.

**Mobile** — cards empilhados, largura total, alvo de toque grande:

```
[ Site                         ]
[ Criar um site que representa ]
[ seu negócio                  ]
[            Começar →         ]

[ Tráfego Pago                 ]
[ ...                          ]

[ Design / Social Media        ]
[ ...                          ]

  Não sabe do que precisa? Fale com a Upgrade →
```

Cada card: nome, descrição curta (1 linha), indicador visual de estado (não configurado / configurado),
ação clara. Sem textos longos, sem lista de sub-serviços nesta tela.

---

## 6. Tela de pergunta — padrão reutilizável (WF-04 — sequência fixa do mini-fluxo aprovado)

Um único padrão de **tela** serve todas as perguntas das 3 categorias (o conteúdo muda, a estrutura
não) — mas a **sequência de perguntas que cada categoria percorre é fixa e pré-definida**, nunca decidida
em tempo de execução. WF-04 não é "uma tela repetida um número indefinido de vezes"; é o mesmo padrão
visual aplicado a uma árvore de perguntas já aprovada na Etapa 3 (`lib/builder/config/*.ts`).

```
[ ← voltar ]                    [ progresso discreto ]        [ Meu Upgrade (2) ]

  Sobre seu site                          ← contexto curto (rótulo da categoria/bloco)

  Que tipo de site você precisa?          ← pergunta principal

  [ Landing Page        ]
  [ Site Institucional  ]
  [ Loja Virtual        ]
  [ Sistema / Plataforma]
  [ Ainda não sei       ]

                                  [ Continuar → ]   ← só aparece/habilita quando aplicável
```

Elementos fixos do padrão: contexto curto, pergunta principal, opções, voltar, continuar (quando a
pergunta exigir confirmação explícita — ver Seção 7), indicador de progresso, acesso ao Meu Upgrade.
Nenhum desses elementos é opcional — omitir qualquer um quebra a consistência entre as 3 categorias.

### Quantidade exata de perguntas por mini-fluxo

**Não existe uma quantidade padrão de perguntas por serviço.** Cada mini-fluxo tem exatamente as
perguntas mínimas necessárias para gerar uma triagem comercial útil daquele serviço específico —
definidas e aprovadas individualmente (na Etapa 3, e no alinhamento pré-Etapa 8 no caso de Tráfego Pago),
não derivadas de uma meta numérica comum a todas as categorias. A prova mais clara disso é que, hoje,
**as três categorias têm quantidades diferentes**: Site tem 2 ou 3, Tráfego Pago tem 4, Design tem 3 por
mini-fluxo individual — cada um é o mínimo que o respectivo serviço aprovou, não uma meta compartilhada.
O que é uma regra de arquitetura, essa sim fixa e sem exceção, é: uma vez aprovado, o fluxo é executado
exatamente como definido — o Builder **não gera perguntas dinamicamente, não decide quantas perguntas
fará em tempo de execução e não inventa perguntas com base nas respostas**. A tabela abaixo é a contagem
real de hoje, lida diretamente de `lib/builder/config/*.ts` — um retrato do que já foi aprovado, não um
alvo a repetir:

| Categoria | Perguntas (nesta ordem, sempre) | Quantidade aprovada hoje |
|---|---|---|
| Site | 1. Que tipo de site você precisa? (`site_tipo`)<br>2. O que esse projeto precisa ter? (`site_recursos` — opções variam conforme `site_tipo`, a pergunta em si não muda de posição nem é opcional)<br>3. Em que situação está esse projeto? (`site_situacao`) | **3 perguntas.** Exceção única e já prevista: se `site_tipo = "Ainda não sei"`, a pergunta 2 (`site_recursos`) não é exibida — **2 perguntas** nesse caso específico, nunca uma quarta pergunta em nenhum caso. |
| Tráfego Pago | 1. O que você quer divulgar? (`trafego_negocio`)<br>2. Onde você quer gerar o resultado? (`trafego_destino`)<br>3. Qual é sua situação atual com anúncios? (`trafego_experiencia`)<br>4. Quanto pretende investir em anúncios por mês? (`trafego_investimento` — investimento em mídia paga, não orçamento do projeto; adicionada no alinhamento pré-Etapa 8) | **4 perguntas, sempre — sem exceção e sem ramificação.** |
| Design/Social Media — mini-fluxo de **um** serviço | 1. O que sua marca precisa? (`design_servico`)<br>2 e 3. as duas perguntas específicas do serviço escolhido (ex.: Identidade Visual → "Como está sua marca hoje?" + "O que você procura?"; Criativos para Anúncios → "Que tipo de material você precisa?" + "Você já possui os materiais da marca?") | **3 perguntas**, para qualquer um dos 5 serviços (Identidade Visual, Design para Redes Sociais, Gestão de Social Media, Criativos para Anúncios, Edição de Vídeo) — nenhum deles tem mais nem menos que 3 **hoje**, porque foi o que cada um aprovou individualmente na Etapa 3, não porque "3" seja exigido. |

**Combinação de serviços ("Montar um pacote")** — rótulo atualizado no alinhamento pré-Etapa 8 (antes
"Quero combinar serviços"; mesmo campo interno `design_servico`). Escolher essa opção **não** aciona um
número arbitrário de perguntas. O que acontece, de forma determinística:

1. Pergunta 1 (`design_servico`) é respondida com "Montar um pacote".
2. Uma segunda tela reaproveita o mesmo campo `design_servico`, agora como escolha múltipla: "Quais
   serviços você quer incluir no seu pacote?" — o usuário escolhe manualmente quais dos 5 mini-fluxos
   fixos combinar.
3. O sistema **concatena os mini-fluxos fixos dos serviços escolhidos**, na ordem do catálogo, pulando
   qualquer pergunta cujo campo já tenha sido respondido por um serviço anterior na mesma combinação (ex.:
   `marca_identidade` é compartilhada por até 3 dos 5 serviços e só é perguntada uma vez).

Exemplo concreto: combinar Identidade Visual + Design para Redes Sociais resulta em `design_servico`
(pergunta 1) + "Quais serviços você quer incluir no seu pacote?" (pergunta 1b) + `identidade_situacao` +
`identidade_escopo` (mini-fluxo de Identidade Visual) + `design_formato` (mini-fluxo de Design para Redes
Sociais) + `marca_identidade` (compartilhada, perguntada uma única vez) = **6 perguntas no total**, todas
já existentes em `lib/builder/config/design.ts` — nenhuma pergunta nova, nenhuma decisão tomada em tempo
de execução além de "quais mini-fluxos fixos concatenar e quais campos já foram respondidos". O total
varia apenas conforme **quantos e quais serviços o próprio usuário escolhe combinar manualmente** —
nunca por decisão do sistema.

---

## 7. Tipos de resposta

Tipos **realmente usados hoje** pelo Builder (`lib/builder/config/*.ts`):

**Escolha única** (`single_choice`) — cards clicáveis, seleção imediata avança (sem botão "Continuar"
extra), consistente com o comportamento já implementado:

```
[ Landing Page        ]
[ Site Institucional  ]
[ Loja Virtual        ]
```

**Escolha múltipla** (`multi_choice`) — cards com estado de selecionado (não depende só de cor — usa
também um indicador, ex.: "✓" ou borda + texto), exige um botão "Continuar" explícito, já que várias
opções podem ser marcadas antes de confirmar:

```
[ ✓ Pagamento online ]
[   Área do cliente   ]
[ ✓ Catálogo de produtos ]

                              [ Continuar → ]
```

**Opção "Ainda não sei"** — visualmente é apenas mais uma opção da lista (não um botão separado nem um
link diferenciado), para não sinalizar como "saída de emergência" — é uma resposta válida como qualquer
outra, conforme já implementado em `site_tipo`.

**Tipos definidos como padrão, mas não usados em nenhuma pergunta hoje** (registrados para o caso de uma
pergunta futura precisar):

- **Sim/não** — seguiria o mesmo padrão de escolha única, com exatamente 2 opções.
- **Faixa de valor como controle numérico livre** (ex.: slider) — não existe e não é necessária. A única
  pergunta com faixas monetárias, `trafego_investimento` (Tráfego Pago, adicionada no alinhamento
  pré-Etapa 8), usa o mesmo padrão de `single_choice` com bandas pré-definidas como opções — visualmente
  idêntica a qualquer outra pergunta de escolha única (Seção 6), não um tipo de resposta à parte. O
  Builder continua sem perguntar orçamento do projeto/contrato com a Upgrade; a exceção documentada é
  especificamente o investimento em mídia paga (ver `docs/USER-FLOW.md`, Seção 5, e `docs/DECISIONS.md`).
- **Texto curto** — não é usado em nenhuma pergunta do Builder (perguntas fechadas resolvem melhor,
  conforme princípio do briefing). O único lugar do site com texto livre é a **Captura de contato**
  (Seção 15) — nome, empresa, e-mail, WhatsApp, Instagram/site — que não é uma "pergunta do Builder", é o
  formulário final.

---

## 8. Progresso

Sem "Pergunta 3 de 17" (decisão já tomada na Fase 3). Direção conceitual escolhida: **rótulo contextual +
barra discreta não numérica**:

```
[ ▬▬▬▬▬▬▬▬▬░░░░░░░░ ]     "Sobre seu site"  →  "Mais alguns detalhes"  →  "Só mais uma coisa"
```

A barra preenche proporcionalmente às perguntas restantes do mini-fluxo. Esse total **não é uma
estimativa** — é um valor exato, já calculável a qualquer momento a partir da árvore fixa de perguntas
(o código já expõe isso via `estimateSiteTotalSteps`/`estimateTrafegoTotalSteps`/
`estimateDesignTotalSteps` em `lib/builder/config/*.ts`, e a Seção 6 acima lista a contagem exata por
categoria). A barra nunca mostra fração/número, só preenchimento proporcional. O rótulo textual muda
conforme o momento do mini-fluxo (início, meio, última pergunta), reforçando sensação de progresso sem
parecer formulário.

---

## 9. Meu Upgrade (WF-06)

Acessível durante todo o Builder, sem interromper a pergunta atual.

**Desktop** — painel lateral recolhível (aberto por padrão ou por clique, decisão de default fica para
Fase 20):

```
┌─────────────────────────┐
│ MEU UPGRADE          [x]│
├─────────────────────────┤
│ Site                    │
│  Loja Virtual           │
│  [ Editar ]  [ Remover ]│
│                         │
│ Tráfego Pago            │
│  Destino: Loja Virtual  │
│  [ Editar ]  [ Remover ]│
├─────────────────────────┤
│ + Adicionar serviço     │
│ [ Finalizar meu projeto]│
└─────────────────────────┘
```

**Mobile** — botão fixo (badge com contagem) que abre um bottom sheet/drawer por cima da tela atual:

```
                                   [ Meu Upgrade (2) ▲ ]   ← fixo, canto inferior

   ── abre por cima ──
   MEU UPGRADE
   Site — Loja Virtual         [Editar] [Remover]
   Tráfego Pago — ...          [Editar] [Remover]

   + Adicionar serviço
   [ Finalizar meu projeto ]
   [ fechar ]
```

Mostra: quantidade de serviços (badge), cada serviço com resumo de 1 linha, editar, remover, adicionar
outro, finalizar. Nunca mostra um serviço com o mini-fluxo pela metade (regra de `BUSINESS-RULES.md`,
Seção 5).

---

## 10. Serviço concluído (WF-05)

```
✓ Site adicionado ao seu Upgrade.

  Loja Virtual / E-commerce
  Pagamento online, Catálogo de produtos
  Projeto criado do zero

  [ Finalizar meu projeto ]      ← CTA principal
  ( Adicionar outro serviço )    ← CTA secundário
```

Hierarquia (decisão já tomada na correção da Fase 4, reafirmada aqui): **"Finalizar meu projeto" é
principal**; "Adicionar outro serviço" é secundário, visível mas sem competir visualmente. O acesso ao
Meu Upgrade continua disponível em paralelo (não é uma das duas opções desta tela).

---

## 11. Adicionar outro serviço

Reaproveita o **seletor de serviços** (Seção 5/WF-03) — não é uma tela nova. Único diferencial: categorias
já configuradas mostram o estado "Configurado" em vez de "Começar":

```
✓ Site
  Configurado                    [ Ver/Editar ]

  Tráfego Pago
                                  [ Começar ]

  Design / Social Media
                                  [ Começar ]
```

Clicar em uma categoria já configurada **entra em edição** (Seção 12) — nunca cria uma segunda
configuração da mesma categoria (regra confirmada em `TECHNICAL-ARCHITECTURE.md`, Seção 15 — `MyUpgrade`
é um registro por `ServiceId`).

---

## 12. Edição (WF-07)

O usuário precisa perceber claramente que está em modo de edição, não numa nova configuração:

```
[ ← cancelar edição ]                                    [ Meu Upgrade ]

  Editando Site                    ← banner de contexto, sempre visível durante a edição

  Que tipo de site você precisa?
  [ Landing Page        ]
  [ ✓ Loja Virtual      ]          ← resposta anterior já vem selecionada
  [ Sistema / Plataforma]

                                   [ Confirmar alterações ]
```

- Respostas anteriores permanecem preenchidas/selecionadas ao entrar.
- "Cancelar edição" está sempre acessível, não só na primeira tela do mini-fluxo.
- Ao confirmar: volta para onde a edição começou (Meu Upgrade ou Resumo), já atualizado.
- Ao cancelar: volta para o mesmo lugar, configuração anterior intacta.

> Nota de implementação (não resolvida nesta fase, apenas lembrada): este wireframe assume o mecanismo de
> rascunho/cancelamento descrito em `USER-FLOW.md` (Seção 9) e `TECHNICAL-ARCHITECTURE.md` (Seção 7,
> campos `editingService`/`draft`), que **ainda não existe** no `BuilderContext` implementado. O
> wireframe é o alvo funcional; a extensão de estado necessária para sustentá-lo é trabalho de código,
> não desta fase.

---

## 13. Remoção (WF-08)

Confirmação simples, sem modal dramático:

```
  Remover "Tráfego Pago" do seu Upgrade?

  [ Cancelar ]     [ Remover ]
```

Ao confirmar: remove só aquele serviço, os demais permanecem, Meu Upgrade atualiza imediatamente. Se
ficar vazio, ver Seção 18 (estado vazio).

---

## 14. Resumo (WF-09)

Tela mais importante da finalização — compila, não analisa (regra de `BUSINESS-RULES.md`, Seção 11):

```
SEU UPGRADE

Site
  Loja Virtual / E-commerce
  Pagamento online, Catálogo de produtos
  [ Editar ]  [ Remover ]

Tráfego Pago
  Destino: Loja Virtual
  Já anuncia atualmente
  [ Editar ]  [ Remover ]

                              [ Seguir para contato ]   ← CTA principal
```

- Nenhuma informação interna (`complexity score`, `PRICE_SIGNAL`, `LEAD_SCORE_SIGNAL`, IDs) aparece
  aqui — confirmado contra `BUSINESS-RULES.md`, Seção 11.
- CTA principal usa o texto já decidido em `USER-FLOW.md` (Seção 13): **"Seguir para contato"** — a
  captura de dados acontece imediatamente depois do resumo nesta arquitetura, então não há necessidade de
  um texto alternativo como "Receber retorno da Upgrade" neste ponto específico.
- Editar a partir daqui segue a Seção 12 e retorna ao Resumo atualizado; remover segue a Seção 13.

---

## 15. Captura do lead (WF-10)

```
  "Deixe seus dados para analisarmos seu projeto."

  Nome            [                    ]
  Empresa         [                    ]
  WhatsApp        [                    ]
  E-mail          [                    ]
  Instagram/site  [                    ]  (opcional)

                              [ Enviar meu projeto ]
```

Único ponto do site com campos de texto livre — aqui faz sentido (nome, e-mail e WhatsApp não têm um
conjunto fechado de opções). Nenhum campo além dos já decididos em `PROJECT-OVERVIEW.md`/`USER-FLOW.md`
(nome, empresa, WhatsApp, e-mail, Instagram/site opcional) — nenhuma pergunta de briefing, orçamento,
prazo ou público-alvo aparece aqui.

---

## 16. Confirmação (WF-11)

```
  Recebemos seu Upgrade.

  Site + Tráfego Pago

  "Vamos analisar suas respostas e entrar em contato."

  ( Falar agora pelo WhatsApp )     ← ação futura, só o ponto reservado nesta fase
  [ Voltar ao site ]                ← ação secundária disponível hoje
```

O CTA de WhatsApp aparece apenas como **ponto reservado** no wireframe — sem geração de link nem
integração nesta fase (a lógica de `generateWhatsAppMessage`, já desenhada em
`TECHNICAL-ARCHITECTURE.md`, Seção 25, permanece não implementada).

---

## 17. Erros (WF-12)

| Situação | Wireframe conceitual |
|---|---|
| Campo inválido | Erro inline abaixo do campo específico; demais campos preenchidos mantidos. |
| Pergunta obrigatória sem resposta | "Continuar" permanece indisponível; nenhuma mensagem de erro agressiva, só o botão desabilitado. |
| Falha ao enviar o lead | Mensagem no próprio formulário de contato: "Não conseguimos enviar agora. Suas respostas continuam salvas." + botão para tentar novamente. |
| Sem internet | Tratado como falha de envio (mesma tela/mensagem acima) — o projeto em memória não é descartado. |
| Falha temporária ao carregar conteúdo (ex.: seção da Home) | Bloco substituído por uma mensagem curta + opção de recarregar aquele bloco, sem quebrar o restante da página. |

Toda mensagem de erro permite recuperação — nenhuma força reinício do projeto (princípio já registrado em
`USER-FLOW.md`, Seção 18).

---

## 18. Estados vazios (WF-13)

| Estado | Wireframe conceitual |
|---|---|
| Meu Upgrade vazio | Painel/drawer mostra: "Nenhum serviço adicionado ainda." + `[ Escolher um serviço ]` no lugar de "Finalizar meu projeto". |
| Resumo sem serviço | Não deveria ser alcançável (Finalizar fica indisponível com projeto vazio) — se ocorrer por navegação direta, mostra o mesmo estado do Meu Upgrade vazio com CTA de volta ao seletor. |
| Nenhuma resposta ainda (primeira pergunta de um mini-fluxo) | Comportamento normal do padrão de pergunta (Seção 6) — não é um estado de erro, é o estado inicial. |
| Nenhum case disponível (bloco de prova na Home) | Mostra apenas as categorias que já têm conteúdo (real, próprio ou concept) — nunca um espaço vazio ou "case fictício". |
| Erro ao carregar conteúdo | Ver Seção 17, última linha. |

---

## 19. Desktop

Princípios aplicados a todas as telas do Builder:

- Largura confortável, área de respiro nas laterais — o conteúdo do Builder nunca ocupa 100% da largura
  da tela em telas grandes.
- Builder centralizado; Meu Upgrade como painel lateral, sempre acessível sem sair da pergunta atual.
- Navegação mínima durante o Builder (Seção 21) — o usuário foca em uma decisão por vez.
- Mais espaço permite contexto adicional ao lado da pergunta (ex.: pequena explicação do termo, quando
  necessário — ver Seção 24).

---

## 20. Mobile

Não é a desktop encolhida — decisões próprias:

- Botões grandes, área de toque generosa (uso com o polegar).
- Cards empilhados, uma pergunta ocupando a tela inteira (foco total, sem distração lateral).
- Meu Upgrade via botão fixo + drawer/bottom sheet (Seção 9) — nunca um painel lateral fixo competindo
  com o espaço da pergunta.
- Barra inferior reservada para ações relevantes quando útil (ex.: o próprio botão do Meu Upgrade).
- Textos mais curtos que a versão desktop quando o espaço exigir, nunca informação a mais.
- Teclado do formulário de contato não pode cobrir o campo em edição nem o botão de envio (rolagem
  automática até o campo ativo).

---

## 21. Navegação

Durante o Builder, a navegação fica deliberadamente mínima, sem menu tradicional chamando atenção:

```
[ logo ]     [ ← voltar ]     [ Meu Upgrade ]     [ fechar/sair ]
```

Na Home e páginas institucionais, a navegação pode ser completa (menu com todas as seções, links
institucionais) — a regra de "foco em uma decisão" vale só dentro do Builder.

---

## 22. Abandono

Wireframe conceitual, sem implementação de persistência real nesta fase:

```
Usuário tenta sair do Builder (fechar aba, navegar para outra página)
   ↓
Nenhum bloqueio agressivo, nenhum pop-up toda vez
   ↓
Se fizer sentido mostrar algo (ex.: primeira vez que o usuário tenta sair com progresso):
  "Seu progresso ficará salvo neste dispositivo."
   ↓
Usuário sai livremente
```

Não usar um pop-up de confirmação a cada tentativa de saída — no máximo uma vez, de forma informativa,
não como barreira.

---

## 23. Acessibilidade

Mesmo em wireframe, ficam definidos como requisitos estruturais (não visuais):

- Todo botão/card clicável tem alvo de toque grande e claramente identificável como interativo.
- Estado "selecionado" (Seção 7) nunca depende só de cor — usa também um indicador textual/de forma
  (ex.: "✓", borda, texto "Selecionado").
- Hierarquia de CTA principal vs. secundário é sempre clara em estrutura (ordem, destaque), não só em
  estilo.
- Navegação por teclado (tab, enter, esc para fechar Meu Upgrade/modais) deve ser possível — não
  implementada nesta fase, mas nenhuma decisão de wireframe a impede.

---

## 24. Conteúdo

Textos usados neste documento (ex.: "Vamos montar seu projeto.", "Enviar meu projeto") são **provisórios**
— existem só para validar fluxo e hierarquia, não são copy final. Nenhum texto institucional extenso
(cases, sobre a agência) foi escrito nesta fase — isso pertence à fase de conteúdo/copy definitivo.

---

## Revisão obrigatória — cenários simulados

**Caso 1** (Home → Site → 4 "decisões" [3 perguntas + tela de conclusão] → Finalizar → Resumo → Contato
→ Sucesso): sem telas extras — o fluxo passa por WF-01, WF-02/03, WF-04 (×3), WF-05, WF-09, WF-10, WF-11.
Nenhum passo redundante.

**Caso 2** (Site → conclui → adiciona Tráfego → conclui → Meu Upgrade → Finaliza): a tela de conclusão
(WF-05) leva de volta ao seletor (WF-03, agora com Site marcado "Configurado"); Tráfego roda seu
mini-fluxo (WF-04 ×3); Meu Upgrade (WF-06) mostra os dois; finalizar leva ao Resumo (WF-09). Nenhuma tela
nova precisou ser inventada.

**Caso 3** (Configura Site → abre Meu Upgrade → edita Site → salva → finaliza): Meu Upgrade (WF-06) →
Editar (WF-07, banner "Editando Site", respostas pré-preenchidas) → Confirmar → volta ao Meu Upgrade
atualizado → Finalizar → Resumo. Fluxo coberto sem telas extras — depende da extensão de estado já
sinalizada na Seção 12.

**Caso 4** (Configura Tráfego → remove → Meu Upgrade vazio): Remover (WF-08) → Meu Upgrade mostra o
estado vazio (Seção 18) com CTA "Escolher um serviço" no lugar de "Finalizar meu projeto". Nenhum beco
sem saída.

**Caso 5** (fluxo completo mobile): mesmas telas, apresentação mobile (Seção 20) — Meu Upgrade via
drawer, perguntas em tela cheia, campos de contato com rolagem para não ficar atrás do teclado. Nenhuma
tela exclusiva de mobile foi necessária — só a apresentação muda.

**Caso 6** (erro no envio do lead): Contato (WF-10) → envio falha → mensagem de erro (Seção 17, "Suas
respostas continuam salvas") permanece na mesma tela, campos preenchidos mantidos → usuário tenta
novamente → sucesso (WF-11). Nenhuma resposta é perdida, nenhum recomeço forçado.

## Perguntas para revisão (respondidas)

- **Existem telas desnecessárias?** Não — "Demonstração/experiência" da Home foi fundida no Hero/Prova
  em vez de virar bloco próprio (Seção 2); "adicionar outro serviço" reaproveita o seletor em vez de ser
  uma tela nova (Seção 11).
- **Existe algum passo que pode ser removido?** Não identificado — os passos restantes são os mínimos
  necessários para cumprir `USER-FLOW.md`.
- **O usuário sabe sempre o que fazer?** Sim — todo padrão de tela tem CTA principal explícito (Seções
  6, 10, 14).
- **O CTA principal está evidente?** Sim, e a hierarquia principal/secundário é reforçada em todas as
  telas de decisão (Seções 10, 14).
- **Meu Upgrade está acessível sem incomodar?** Sim — painel lateral discreto no desktop, botão fixo
  discreto no mobile, nunca um modal forçado.
- **O mobile continua simples?** Sim — mesma lógica, apresentação própria (Seção 20), sem tela extra.
- **Existe informação demais?** Não — Resumo e Meu Upgrade mostram só respostas-chave, nunca metadados
  internos (Seção 14, verificado contra `BUSINESS-RULES.md`).
- **Parece formulário ou experiência?** Cards clicáveis, uma decisão por vez, progresso não numérico —
  estrutura evita sensação de formulário (Seções 6-8).
- **Há algum beco sem saída?** Não — todos os 6 cenários da revisão obrigatória chegam a um estado
  estável, e a remoção total do projeto tem um estado vazio definido (Seção 18) que não bloqueia.

Nenhum problema foi encontrado que exigisse correção antes de finalizar este documento.
