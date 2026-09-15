# USER FLOW — Fluxo Completo de Experiência do Site da Agência Upgrade

> Fase 4 do roadmap (revisão). Mapeia a experiência completa do usuário — navegação, decisões, estados
> e recuperação de erro — **usando como fonte de verdade das perguntas o Upgrade Builder já implementado
> na Fase 3** (`lib/builder/config/site.ts`, `lib/builder/config/trafego.ts`,
> `lib/builder/config/design.ts`, `lib/builder/BuilderContext.tsx`). Nenhuma página, componente, banco de
> dados ou animação é criado aqui — apenas o mapa de navegação e decisão.
>
> **Nota sobre `BUILDER-FLOWS.md` e `BUILDER-QUESTIONS.md` (Fase 3, versão conceitual)**: esses dois
> documentos foram escritos antes da implementação e descrevem um conjunto de perguntas mais amplo que
> **não é o que foi efetivamente implementado**. A versão realmente aprovada e construída em código é
> mais enxuta: 3 categorias de entrada, com "não sei" existindo apenas como uma opção dentro do fluxo de
> Site. Este documento segue o código para as perguntas. `BUILDER-FLOWS.md`/`BUILDER-QUESTIONS.md` ficam
> como registro histórico da primeira proposta, não como referência ativa.
>
> **Atualização (Fase 5, corrigida)**: uma primeira versão desta fase havia definido uma função auxiliar
> de diagnóstico ("Me ajude a descobrir") com pergunta e recomendação automática de categoria, além de
> um sistema de recomendações cruzadas entre serviços (Seção 11 antiga). Ambos foram **removidos** por
> tornar o Builder mais parecido com um consultor automático do que com a triagem curta que ele deve ser.
> A Seção 11 (Recomendações) e a Seção 12 (agora "Fale com a Upgrade") refletem a versão corrigida e
> definitiva.

---

## 1. Visão geral

O site da Upgrade tem duas portas de entrada igualmente válidas: a experiência institucional (Home) e o
Upgrade Builder em si, que pode ser acessado diretamente sem depender da Home. No Builder, o usuário
escolhe uma das **3 categorias de serviço**, responde um mini-fluxo curto — cada categoria tem apenas as
perguntas mínimas necessárias para uma triagem comercial útil daquela categoria, definidas e aprovadas na
Etapa 3 (e no alinhamento pré-Etapa 8, no caso de Tráfego Pago), sem que exista uma quantidade padrão
obrigatória entre categorias (hoje, 2 a 4 perguntas por mini-fluxo individual — ver Seção 5) — e o
serviço passa a fazer parte do "Meu Upgrade" assim que o mini-fluxo termina — sem
nenhuma etapa extra de confirmação separada. Ele pode repetir isso para outras categorias, editar ou
remover qualquer serviço já configurado, e finalizar quando quiser. Ao finalizar, revisa um resumo,
fornece dados de contato, e o projeto se torna oficialmente um lead. O Builder é deliberadamente curto:
a experiência inteira deve ser possível em poucos minutos, e nenhuma etapa deste fluxo pede informação de
briefing, prazo, detalhes técnicos ou orçamento do projeto/contrato com a Upgrade — isso fica para o
atendimento humano posterior. A única exceção, deliberada e delimitada, é `trafego_investimento` (Seção
5): não é orçamento do projeto, é o valor que o cliente pretende investir em mídia paga, informação
operacional específica do serviço de Tráfego Pago.

## 2. Pontos de entrada

O fluxo não depende de o usuário passar pela Home. Entradas previstas:

| Entrada | Destino |
|---|---|
| Home → CTA principal "Monte seu Upgrade" | Builder (seletor de categoria) |
| CTA no menu (fixo, em qualquer página institucional) | Builder |
| CTA em alguma seção da Home (ex.: seção de serviços) | Builder |
| Campanha de tráfego pago (link de anúncio) | Builder direto, sem passar pela Home |
| URL direta (`/builder`) | Builder direto |

Independentemente da entrada, o usuário sempre chega ao mesmo ponto de partida do Builder: a tela com as
3 categorias. A origem é registrada como metadado da sessão (para analytics/qualificação futura), não
como uma bifurcação de UX.

## 3. Fluxo principal

```
HOME (opcional) → CTA "Monte seu Upgrade" → BUILDER: escolha de categoria
   ↓
Escolher uma das 3 categorias (ou, secundariamente, pedir ajuda para decidir):
   • Site (Criar um site)
   • Tráfego Pago (Atrair mais clientes)
   • Design + Social Media (Fortalecer minha marca e conteúdo)
   • [opção secundária, menor destaque] "Não sabe exatamente do que precisa? Fale com a Upgrade."
       → leva a um canal de contato direto, fora do Builder (Seção 12) — não abre pergunta nenhuma
   ↓
Configurar serviço (mini-fluxo de perguntas da categoria — Seção 5)
   ↓
Concluir mini-fluxo → serviço passa a fazer parte do "Meu Upgrade" automaticamente
   ↓
Tela de conclusão do serviço:
   CTA principal:   "Finalizar meu projeto"
   CTA secundário:  "Adicionar outro serviço"
   ↓ (se finalizar)
Resumo do projeto → Captura de contato → Envio → Lead criado → Confirmação final
```

Evento associado à entrada no Builder: `builder_started` (com metadado de origem: home, menu, seção,
campanha, url direta).

## 4. Fluxo de seleção de serviço

A tela de escolha de categoria mostra sempre as **3 categorias**, cada uma indicando se já foi
configurada no projeto atual:

```
Escolha de categoria
 ├── Site                       [Concluído, se já configurado]
 ├── Tráfego Pago                [Concluído, se já configurado]
 ├── Design + Social Media       [Concluído, se já configurado]
 └── (secundário, menor peso visual) Não sabe do que precisa? → Fale com a Upgrade (sai do Builder)
```

**Regra de uma configuração por categoria**: cada categoria aceita apenas **uma configuração
principal** por projeto. Clicar em uma categoria já configurada abre a edição dela (Seção 9), nunca cria
uma segunda instância. Isso evita, por exemplo, dois "Tráfego Pago" redundantes no mesmo projeto.

**"Fale com a Upgrade" nunca é uma quarta categoria nem um mini-fluxo** — é um link simples, com peso
visual menor que as 3 principais, que leva a um canal de contato direto fora do Builder (Seção 12). Não
abre pergunta alguma nem tenta recomendar uma categoria.

Não existe uma quarta categoria de entrada. A opção "Ainda não sei" **não é um item desta tela** — ela
existe apenas como uma das opções da primeira pergunta dentro do fluxo de Site (`site_tipo`, opção
`nao_sei`), conforme já implementado (Seção 5).

Evento: `category_selected` (categoria, se é primeira configuração ou edição).

## 5. Fluxo de configuração (mini-fluxo de perguntas)

As perguntas abaixo são exatamente as implementadas em `lib/builder/config/`. Nenhuma pergunta nova foi
criada ou alterada nesta revisão — este documento apenas descreve, em termos de fluxo, o que o código já
faz.

### Site (`lib/builder/config/site.ts`) — no máximo 3 perguntas

```
site_tipo — "Que tipo de site você precisa?"
   Landing Page | Site Institucional | Loja Virtual / E-commerce | Plataforma / Sistema | Ainda não sei
   ↓
SE site_tipo ≠ "Ainda não sei":
   site_recursos — "O que esse projeto precisa ter?" (múltipla escolha; opções variam conforme site_tipo)
   ↓
SE site_tipo = "Ainda não sei": pula site_recursos — nenhuma pergunta técnica extra é feita
   ↓
site_situacao — "Em que situação está esse projeto?"
   Vou criar do zero | Já tenho e quero refazer | Já tenho e quero melhorar/expandir
   ↓
Fim do mini-fluxo (2 perguntas se "Ainda não sei", 3 nos demais casos)
```

### Tráfego Pago (`lib/builder/config/trafego.ts`) — 4 perguntas fixas, sem ramificação

```
trafego_negocio — "O que você quer divulgar?"
   ↓
trafego_destino — "Onde você quer gerar o resultado?"
   ↓
trafego_experiencia — "Qual é sua situação atual com anúncios?"
   ↓
trafego_investimento — "Quanto pretende investir em anúncios por mês?"
   ↓
Fim do mini-fluxo (sempre 4 perguntas)
```

`trafego_investimento` foi adicionada no alinhamento pré-Etapa 8 (ver `docs/DECISIONS.md`). **Não é** a
pergunta genérica de "orçamento do projeto" que a Seção 1 deste documento continua proibindo — é
especificamente o valor que o cliente pretende investir em mídia paga (Meta Ads/Google Ads), informação
operacional necessária para dimensionar a campanha de Tráfego Pago, assim como `site_recursos` dimensiona
um site. O sistema não calcula orçamento nem preço automaticamente a partir dela nesta fase.

### Design + Social Media (`lib/builder/config/design.ts`) — pergunta inicial + mini-fluxo curto do serviço escolhido

```
design_servico — "O que sua marca precisa?"
   Identidade Visual | Design para Redes Sociais | Gestão de Social Media |
   Criativos para Anúncios | Edição de Vídeo | Montar um pacote
   ↓
Identidade Visual        → identidade_situacao, identidade_escopo                 (2 perguntas)
Design para Redes Sociais → design_formato, marca_identidade                       (2 perguntas)
Gestão de Social Media    → social_necessidade, marca_identidade                   (2 perguntas)
Criativos para Anúncios   → criativos_formato, criativos_material                  (2 perguntas)
Edição de Vídeo           → video_material, video_destino                          (2 perguntas)
Montar um pacote          → lista de quais serviços incluir, depois encadeia o mini-fluxo de
                            cada um escolhido, sem repetir uma pergunta que já tenha
                            sido respondida noutro serviço combinado (ex.: marca_identidade
                            só é perguntada uma vez mesmo se pertencer a dois serviços)
```

"Montar um pacote" é o rótulo voltado ao cliente (atualizado no alinhamento pré-Etapa 8); o campo interno
continua sendo o mesmo `design_servico` com valor `quero_combinar_servicos` — só o texto exibido mudou.

"Edição de Vídeo" é edição a partir de materiais fornecidos pelo cliente (vídeos, fotos, materiais
gráficos do projeto) — a Upgrade não é apresentada como serviço de filmagem/captação presencial.

Cada mini-fluxo individual, do começo ao fim, tem entre 2 e 3 decisões — coerente com o propósito do
Builder: uma pré-configuração rápida, não um briefing. Tráfego Pago é a exceção com 4 (Seção acima) — não
existe uma quantidade padrão exigida entre as 3 categorias (ver `docs/DECISIONS.md`).

Eventos: `service_started` (ao entrar na categoria pela primeira vez), `question_answered` (a cada
resposta, com id da pergunta e categoria).

## 6. Conclusão de um serviço

```
Última pergunta do mini-fluxo respondida
   ↓
O serviço passa a fazer parte do "Meu Upgrade" automaticamente — não existe um clique
separado de "adicionar"; concluir as perguntas já é o que o adiciona.
   ↓
Tela de conclusão: resumo curto das respostas dessa categoria
   ↓
CTA principal:   "Finalizar meu projeto"
CTA secundário:  "Adicionar outro serviço"
```

**Hierarquia de CTA (correção desta revisão)**: "Finalizar meu projeto" é o CTA principal;
"Adicionar outro serviço" é secundário — visível e fácil de usar, mas não obrigatório nem forçado.
A experiência não deve pressionar o usuário a configurar mais serviços do que ele veio buscar; adicionar
outro serviço é um convite, não uma etapa que compete visualmente com finalizar. *(Isto substitui a
decisão da versão anterior deste documento, que dava mais destaque a "Adicionar outro serviço" — ver
`DECISIONS.md`.)*

O acesso ao "Meu Upgrade" (Seção 7) continua disponível a qualquer momento através do painel/indicador
persistente do Builder — não é uma das duas opções desta tela, é uma via paralela sempre acessível.

Evento: `service_completed` (categoria, resumo das respostas-chave).

## 7. "Meu Upgrade"

"Meu Upgrade" é a representação visual do projeto em construção. Ele mostra **somente serviços com o
mini-fluxo concluído** — nunca um serviço pela metade.

```
MEU UPGRADE

Site
  Loja Virtual / E-commerce
  Pagamento online, Área do cliente
  Projeto criado do zero
  [Editar]  [Remover]

Tráfego Pago
  Destino: Loja Virtual
  Já anuncia atualmente
  [Editar]  [Remover]

+ Adicionar serviço
Finalizar meu projeto
```

Funciona como um carrinho lógico, mas sem estética ou linguagem de e-commerce (sem "sacola",
"checkout", "produto"). Deve poder ser aberto a partir de qualquer momento da experiência dentro do
Builder — conceitualmente, um painel/atalho persistente (a forma visual muda entre desktop e mobile —
ver Seção 21).

A partir dele, o usuário pode: visualizar todos os serviços concluídos e um resumo curto de cada um,
editar qualquer um (Seção 9), remover qualquer um (Seção 10), adicionar um novo (Seção 8), ou finalizar
o projeto (Seção 13) — desde que exista ao menos um serviço.

Evento: `project_panel_opened` (a cada vez que o usuário abre o Meu Upgrade, com a etapa de origem).

## 8. Adicionar serviço

A partir de qualquer ponto (tela de conclusão, painel do Meu Upgrade), clicar em "Adicionar outro
serviço" / "+ Adicionar serviço" retorna à **tela de escolha de categoria** (Seção 4), que já reflete
quais categorias estão configuradas. Nenhum dado de outras categorias é afetado.

## 9. Editar

Clicar em "Editar [Serviço]" (a partir do Meu Upgrade ou do Resumo — Seção 13) abre um **modo de edição
temporária** daquela categoria:

```
Meu Upgrade ou Resumo
   ↓
Editar serviço
   ↓
Abre a configuração existente daquela categoria (respostas atuais visíveis/pré-preenchidas)
   ↓
Usuário altera uma ou mais respostas
   ↓
"Confirmar alterações" → substitui a configuração anterior por esta nova
   ou
"Cancelar edição" → descarta as alterações temporárias, mantém exatamente a configuração anterior
   ↓
Retorna para onde a edição foi iniciada:
   • se veio do Meu Upgrade → volta ao Meu Upgrade
   • se veio do Resumo → volta ao Resumo, já atualizado
```

Enquanto a edição está em andamento, as alterações **não sobrescrevem imediatamente** o estado
confirmado do serviço — elas ficam num rascunho temporário até "Confirmar alterações". Isso é o que
permite "Cancelar edição" devolver exatamente a configuração anterior, sem efeitos colaterais.

**Regra de invalidação (local e previsível)**: se uma resposta alterada tornar uma resposta posterior
incompatível, apenas as respostas dependentes daquela mesma ramificação são apagadas — nunca
configurações de outras categorias.

> Exemplo: o usuário tinha `site_tipo = ecommerce` e havia marcado, em `site_recursos`, opções
> específicas de e-commerce (ex.: "Pagamento online", "Área do cliente"). Ao editar e mudar `site_tipo`
> para `landing_page`, essas respostas de `site_recursos` deixam de fazer sentido (não pertencem às
> opções de Landing Page) e são removidas automaticamente; o fluxo passa a mostrar `site_recursos` com
> as opções corretas de Landing Page a partir dali. As configurações de Tráfego Pago e de Design não são
> tocadas.

Evento: `service_edit_started`, `service_edit_saved` ou `service_edit_cancelled`.

> **Nota de implementação (não decidida nesta fase)**: o Upgrade Builder já implementado usa
> `BuilderContext` com gravação imediata de cada resposta e um histórico linear de "voltar" (sem
> conceito de rascunho/cancelamento em lote). Para este modo de edição temporária funcionar exatamente
> como descrito acima, será necessário estender o `BuilderContext` existente com um mecanismo de
> rascunho por categoria — reaproveitando a mesma estrutura de estado, não criando um sistema paralelo.
> Isso está detalhado, sem ser implementado, na seção "Incompatibilidades identificadas com o código"
> ao final deste documento.

## 10. Remover

Remover um serviço exige uma confirmação curta, sem fricção adicional:

```
Usuário clica "Remover" em um serviço do Meu Upgrade
   ↓
"Remover [nome do serviço]?"     [Cancelar]  [Remover]
   ↓ (se confirmado)
• Remove somente aquele serviço — todos os outros permanecem intactos
• Meu Upgrade é atualizado imediatamente
• Lead Score será recalculado quando essa lógica existir (fora de escopo agora)
• Sistema verifica se ainda existe algum serviço no projeto
```

Se a remoção deixar o projeto **vazio**: "Finalizar projeto" fica indisponível, e o CTA principal do
Meu Upgrade passa a ser **"Adicionar um serviço"** (o projeto volta, na prática, ao estado `EMPTY` —
Seção 22).

Evento: `service_removed` (categoria removida, quantidade de serviços restantes).

## 11. Recomendações

**Removido nesta correção.** A versão anterior deste documento previa recomendações automáticas
entre serviços (ex.: sugerir Tráfego Pago após concluir Site) como um ponto do fluxo, a ser detalhado na
Fase 5. Essa direção foi revertida: o Upgrade Builder **não recomenda serviços automaticamente** em
nenhum momento. Se o cliente quiser configurar mais de um serviço, ele faz isso manualmente, através de
"Adicionar outro serviço" (Seção 8) — nunca por sugestão do sistema. A análise de quais serviços fariam
sentido juntos é trabalho do atendimento humano da Upgrade, depois que o lead é recebido (ver
`docs/BUSINESS-RULES.md`, Seção 13).

## 12. Indeciso: "Fale com a Upgrade"

**Simplificado nesta correção.** A versão anterior definia uma função auxiliar de diagnóstico com
pergunta sobre o principal desafio do negócio e recomendação determinística de categoria — isso foi
removido por tornar o Builder mais parecido com um consultor automático do que com uma triagem curta.

A única saída prevista para quem chega indeciso é um convite direto e simples, sem nenhuma árvore de
perguntas:

```
Tela de escolha de categoria
 ├── Sites e Desenvolvimento
 ├── Tráfego Pago
 ├── Design / Social Media
 └── (peso visual menor) "Não sabe exatamente do que precisa? Fale com a Upgrade."
       → leva a um canal de contato direto (ex.: WhatsApp), fora do Builder — não abre nenhum
         mini-fluxo, não faz nenhuma pergunta, não gera recomendação
```

`site_tipo = nao_sei` (dentro do fluxo de Site) continua existindo como já implementado — apenas pula a
pergunta `site_recursos` (Seção 5) e segue o mini-fluxo normalmente. Não deve ser confundido com o CTA
acima: um é uma resposta dentro do mini-fluxo de Site, o outro é uma saída da tela de escolha de
categoria para fora do Builder.

Se no futuro a Upgrade quiser um diagnóstico mais elaborado para indecisos, isso exige uma decisão
consciente e uma nova fase dedicada — não deve ser reintroduzido informalmente num documento de fluxo.

## 13. Resumo

O usuário só pode finalizar se existir **pelo menos um serviço** concluído no "Meu Upgrade".

```
"Finalizar meu projeto" (a partir da tela de conclusão ou do Meu Upgrade)
   ↓
RESUMO DO PROJETO — mostra de forma legível o que o cliente escolheu, sem explicar
tecnicamente o projeto:

  Site
    Loja Virtual / E-commerce
    Pagamento online, Área do cliente
    Projeto criado do zero

  Tráfego Pago
    Destino: Loja Virtual
    Já anuncia atualmente

  Design
    Criativos para Anúncios
    Imagens + vídeos

Ações: Editar | Remover | Voltar | Seguir para contato
```

Editar a partir daqui segue a Seção 9 e retorna para o Resumo (já atualizado) ao concluir ou cancelar.
Remover a partir daqui segue a Seção 10.

Evento: `project_summary_viewed`.

## 14. Captura de contato

Mapeada apenas conceitualmente nesta fase — sem banco de dados, Supabase, criação real de lead ou
integração externa (isso pertence às Fases 12/13).

```
Resumo → "Seguir para contato"
   ↓
CONTATO — Nome, Empresa, WhatsApp, E-mail, Instagram/site atual (opcional)
   ↓
Validação
   ↓ (se inválido) → erro pontual no campo, mantendo todos os dados já digitados
   ↓ (se válido) → Envio
   ↓ (se falhar) → erro de envio, dados preenchidos mantidos, projeto intacto, oferece tentar novamente
   ↓ (se sucesso) → Lead criado → Confirmação final (Seção 15)
```

Eventos: `contact_started`, `contact_validation_failed`, `contact_submit_error`, `lead_submitted`,
`lead_created`.

## 15. Sucesso (confirmação final)

```
"Seu Upgrade está pronto." (ou "Recebemos seu projeto.")
   ↓
Resumo curto do que foi configurado
   ↓
"Nossa equipe vai entrar em contato em breve."
```

Elementos previstos para o futuro (fora de escopo agora): número/protocolo do projeto, envio de cópia
por e-mail, link de WhatsApp direto, link de acompanhamento do status.

Evento: `confirmation_viewed`.

## 16. Voltar

"Voltar" é sempre uma ação da própria interface do Builder — não depende do botão nativo do navegador.

| Onde | Comportamento |
|---|---|
| Dentro de uma pergunta (não a primeira do mini-fluxo) | Volta para a pergunta anterior daquela categoria; a resposta atual é descartada, as anteriores permanecem; outras categorias nunca são afetadas. |
| Na primeira pergunta de um mini-fluxo | Leva à tela de escolha de categoria; nada se perde, pois nada foi respondido ainda. |
| Na escolha de categoria | Leva à origem de entrada (Home, se veio de lá) ou permanece ali se a entrada foi direta. |
| No Resumo | Reabre o Meu Upgrade; editar um item a partir daqui retorna ao Resumo ao concluir (Seção 9). |
| Na captura de contato | Retorna ao Resumo, mantendo os dados de contato já digitados. |

Regra geral: voltar nunca apaga respostas de uma categoria diferente da que está sendo navegada, e nunca
remove um serviço já concluído (remover exige a ação explícita da Seção 10).

## 17. Abandono

| Ponto de abandono | Evento conceitual |
|---|---|
| Entrada do Builder, antes de escolher categoria | `builder_started` sem `category_selected` subsequente |
| Durante as perguntas de um mini-fluxo | `service_started` sem `service_completed` subsequente |
| Depois de concluir um serviço, sem adicionar outro nem finalizar | `service_completed` sem `project_summary_viewed` nem novo `service_started` |
| No Resumo, sem avançar para contato | `project_summary_viewed` sem `contact_started` |
| No formulário de contato, sem enviar | `contact_started` sem `lead_submitted` |

Base da Fase 17 (Analytics) — aqui apenas associados ao fluxo, sem implementação.

## 18. Recuperação

Nenhum erro ou interrupção deve forçar o usuário a recomeçar o projeto do zero, com a única exceção
estrutural desta fase: perda de sessão por fechamento do navegador antes de existir persistência real
(Seção 20). Mecanismos previstos: erros de validação/envio mantêm os dados preenchidos (Seção 14);
"Cancelar edição" nunca corrompe a configuração anterior (Seção 9); remover um serviço nunca afeta os
demais (Seção 10); voltar nunca apaga respostas de outra categoria (Seção 16).

## 19. Estados de erro

| Situação | Comportamento esperado |
|---|---|
| Tenta avançar sem responder pergunta obrigatória | Avançar fica indisponível até haver resposta. |
| Resposta deixa de ser válida (edição em cascata) | Removida automaticamente e o fluxo recalculado a partir dali (Seção 9). |
| Erro ao salvar (futuro, com back-end) | Aviso claro, dados mantidos em memória local, permite tentar novamente. |
| Erro ao enviar lead | Erro no formulário de contato, campos preenchidos mantidos, nova tentativa permitida. |
| Internet cai | Tratado como erro de envio/salvamento — o projeto em memória não é descartado. |
| Sessão expira (futuro) | Deve avisar antes de perder dados, nunca expirar silenciosamente no meio de um envio. |
| Projeto vazio ao tentar finalizar | "Finalizar projeto" simplesmente não fica disponível (Seção 10, Seção 22). |
| Serviço removido durante edição em andamento dele mesmo (ex.: duas abas) | Fora do escopo determinístico desta fase; a expectativa é que a edição detecte que o item não existe mais e devolva o usuário ao Meu Upgrade com aviso. |

## 20. Refresh / sessão

Expectativa de UX (implementação pertence à Fase 14 — Sessões, e Fase 13 — Supabase): ao atualizar a
página ou fechar o navegador no meio do processo, o usuário deveria encontrar a sessão em andamento ao
voltar, identificada por um id de sessão temporário e anônimo. **Estado atual real**: o Builder
implementado na Fase 3 mantém o estado apenas em memória local da página (`BuilderContext`); um refresh
hoje perde o progresso. Limitação conhecida, não o comportamento final aceito.

## 21. Diferenças conceituais entre desktop e mobile

O fluxo lógico é idêntico nas duas plataformas — mesmas perguntas, ramificações, regras de edição/
remoção e estados. Muda apenas a apresentação, a ser desenhada nas fases de UI:

| Elemento | Desktop (conceito) | Mobile (conceito) |
|---|---|---|
| "Meu Upgrade" | Painel lateral, visível ou expansível sem sair da tela de perguntas. | Botão fixo que abre um drawer/modal por cima da tela atual. |
| Navegação entre perguntas | Mais espaço para contexto adicional ao lado da pergunta. | Uma pergunta ocupa a tela inteira, foco total. |

Registrado como necessidade para a Fase 7 (Wireframe) e Fase 20 (Responsividade) — nenhuma solução
visual é desenhada aqui.

## 22. Estados do sistema

| Estado | Significado |
|---|---|
| `EMPTY` | Nenhum serviço configurado ainda; "Finalizar projeto" indisponível. |
| `CONFIGURING` | Usuário respondendo as perguntas de um serviço pela primeira vez. |
| `EDITING` | Usuário revisando/alterando um serviço já concluído (modo rascunho — Seção 9). |
| `SERVICE_COMPLETED` | Um mini-fluxo terminou; usuário decidindo o próximo passo (Seção 6). |
| `REVIEW` | Usuário visualizando o Resumo do projeto. |
| `CONTACT` | Usuário preenchendo os dados de contato. |
| `SUBMITTING` | Envio do lead em andamento. |
| `SUCCESS` | Lead criado; confirmação final exibida. |
| `ERROR` | Falha recuperável em qualquer etapa — sempre carrega uma referência de retorno. |

`MULTI_SERVICE` **não é um estado de etapa** — é uma condição derivada do projeto (verdadeira quando o
"Meu Upgrade" tem 2 ou mais serviços), podendo coexistir com qualquer um dos estados acima. Mantida a
lista original sem adicionar novos estados: os 9 acima continuam suficientes para descrever o fluxo.

Transições principais:

```
EMPTY ──(configura 1º serviço)──> CONFIGURING ──(termina mini-fluxo)──> SERVICE_COMPLETED
SERVICE_COMPLETED ──(adicionar outro)──> CONFIGURING (nova categoria)
SERVICE_COMPLETED ──(finalizar)──> REVIEW
CONFIGURING/EDITING ──(volta até esvaziar o projeto)──> EMPTY
REVIEW ──(seguir para contato)──> CONTACT ──(enviar)──> SUBMITTING ──(sucesso)──> SUCCESS
CONTACT/SUBMITTING ──(falha)──> ERROR ──(nova tentativa)──> CONTACT/SUBMITTING
qualquer estado com Meu Upgrade aberto ──(editar item)──> EDITING ──(salvar/cancelar)──> estado anterior
```

---

## Revisão obrigatória — cenários simulados

**Cenário 1** (configura apenas um Site e finaliza): sem becos sem saída. Site tem no máximo 3
perguntas; ao concluir, "Finalizar meu projeto" já está disponível com 1 serviço.

**Cenário 2** (Site + Tráfego): configurar Site conclui e mostra "Adicionar outro serviço" como
secundário; escolher Tráfego Pago roda as 4 perguntas fixas (incluindo `trafego_investimento`); ao
concluir, Meu Upgrade tem os dois, nenhum dado cruzado entre eles.

**Cenário 3** (Design + Social Media com dois serviços combinados): escolher "Montar um pacote"
em `design_servico`, marcar por exemplo Design para Redes Sociais + Gestão de Social Media; o fluxo
encadeia as perguntas de ambos, mas pergunta `marca_identidade` **uma única vez** (compartilhada pelos
dois), exatamente como implementado em `resolveDesignSteps`. Nenhuma pergunta duplicada, nenhum loop.

**Cenário 4** (configura um serviço, edita resposta anterior, cancela a edição): ao cancelar, a
configuração volta a ser exatamente a anterior — nenhuma alteração parcial fica salva. Depende do
mecanismo de rascunho descrito na Seção 9, que ainda **não existe no código atual** (ver
"Incompatibilidades identificadas com o código" abaixo) — o fluxo está corretamente mapeado, mas a
implementação de hoje não sustenta um cancelamento em lote ainda.

**Cenário 5** (dois serviços, remove um, finaliza com o outro): remover um serviço não afeta o restante;
"Finalizar meu projeto" continua disponível com 1 serviço remanescente; resumo mostra só o que restou.

**Cenário 6** (remove todos os serviços): projeto volta ao estado `EMPTY`; "Finalizar projeto" fica
indisponível; CTA principal do Meu Upgrade passa a ser "Adicionar um serviço" — sem exigir recomeçar
nenhuma configuração do zero caso o usuário decida reconfigurar (basta escolher a categoria de novo).

**Cenário 7** (altera `site_tipo` e invalida `site_recursos` dependente): mudar de `ecommerce` para
`landing_page` remove as respostas de `site_recursos` específicas de e-commerce e reapresenta a pergunta
com as opções corretas de Landing Page; `site_situacao`, Tráfego Pago e Design não são afetados.

**Confirmações**: nenhum loop, nenhum beco sem saída, nenhuma resposta órfã, nenhuma categoria
duplicada, nenhuma exigência de recomeço total, e **nenhuma pergunta nova foi criada** — todas as
perguntas citadas neste documento já existem em `lib/builder/config/`.

---

## Incompatibilidades identificadas com o código

Nenhuma alteração de código foi feita nesta tarefa. As duas lacunas abaixo foram identificadas ao
comparar este User Flow com o `BuilderContext` e os componentes já implementados:

### 1. Modo de edição com rascunho e cancelamento (Seção 9)

- **O que o fluxo exige**: abrir "Editar", alterar respostas num rascunho temporário, e só substituir a
  configuração confirmada ao clicar "Confirmar alterações" — com "Cancelar edição" restaurando
  exatamente o estado anterior.
- **O que existe hoje**: `BuilderContext` grava cada resposta imediatamente no estado compartilhado
  (`ANSWER`) e mantém um histórico linear por categoria que só permite desfazer um passo de cada vez
  (`BACK`). Não existe um ponto de entrada de "Editar" que reabra a configuração inteira, nem um
  conceito de rascunho/cancelamento em lote.
- **Mudança necessária (não feita agora)**: estender `BuilderContext` com um snapshot da categoria ao
  entrar em modo de edição, aplicar as respostas alteradas a uma cópia de rascunho, e só então mesclar
  esse rascunho de volta em `data[category]` ao confirmar — descartando o rascunho ao cancelar. Também
  seria necessário um componente de "revisão" que liste as respostas atuais com acesso direto a cada
  campo (hoje só existe "Revisar última resposta", que desfaz um passo por vez).
- **Quando fazer**: não é bloqueante para iniciar a Fase 5 (Regras de Triagem, Resumo e Entrega
  Comercial), que trata de exibição de perguntas, validação e resumo, não do mecanismo de edição em si.
  Mas é necessária antes de qualquer implementação real do "Meu Upgrade" como painel (fases futuras de
  Upgrade Builder/Meu Upgrade em código), já que a Seção 9 depende dela para funcionar como descrito.

### 2. "Meu Upgrade", Resumo, remoção e captura de contato ainda não existem como componentes

- O código da Fase 3 implementou apenas o motor de perguntas/ramificações e uma tela de conclusão por
  categoria (`CompletionScreen`). Não há, ainda, um componente agregador "Meu Upgrade" mostrando todos
  os serviços juntos, nem ação de remover, nem tela de Resumo, nem formulário de contato.
- Isso **não é uma incompatibilidade** — está fora do escopo que foi definido para a Fase 3 (que tratou
  apenas de perguntas e ramificações). É apenas um lembrete de que este User Flow descreve telas que
  ainda precisam ser construídas nas fases correspondentes do roadmap (Fases 9–12).

---

## Ponto em aberto — resolvido na Fase 5

`docs/PROJECT-OVERVIEW.md` e `docs/SERVICES-MAP.md` (Fases 1 e 2) descreviam 4 grupos de serviço,
incluindo "Ainda não sei o que preciso" como entrada própria. A Fase 5 resolveu conscientemente esse
ponto: a arquitetura oficial tem **3 categorias principais** e um **link simples para contato direto**
("Fale com a Upgrade", Seção 12) para quem chega indeciso — nunca uma quarta categoria, e sem nenhum
diagnóstico automático. Os dois documentos de Fase 1/2 foram corrigidos nesse ponto específico.
