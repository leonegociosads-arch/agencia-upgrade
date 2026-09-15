# SERVICES MAP — Mapa Oficial de Serviços da Agência Upgrade

> Fase 2 do roadmap (Mapa de Serviços). Este documento define o catálogo lógico de serviços que
> alimentará o Upgrade Builder nas próximas fases. Não contém perguntas, preços, páginas, componentes
> ou lógica de ramificação — isso pertence à Fase 3 (Perguntas e Ramificações) em diante.
> Este documento assume e depende dos princípios definidos em `docs/PROJECT-OVERVIEW.md` e das
> decisões registradas em `docs/DECISIONS.md`.

---

## 1. Visão geral dos serviços

A Agência Upgrade organiza sua oferta em **três grandes entradas**, compatíveis com seleção múltipla
(o visitante pode combinar quantas quiser na mesma sessão):

1. **Sites e Desenvolvimento**
2. **Tráfego Pago**
3. **Design / Social Media**

**Correção de escopo (Fase 5, revisada)**: "Ainda não sei o que preciso" **não é uma quarta entrada
principal** e **não é um diagnóstico automático**. Uma primeira correção desta fase havia criado uma
função auxiliar de diagnóstico com pergunta e recomendação de categoria — isso foi removido por deixar
o Builder parecido com um consultor automático. O que existe hoje, oficialmente, é apenas um link
simples e direto ("Fale com a Upgrade") para contato humano, acessível como opção secundária a partir da
tela de entrada do Builder — sem pergunta, sem recomendação, sem categoria própria. Ver
`docs/USER-FLOW.md`, Seção 12.

O catálogo foi deliberadamente mantido enxuto: variações pequenas de um mesmo serviço (formatos de
arte, plataformas de anúncio, abrangência geográfica de campanha) **não** viram categorias próprias —
elas se tornam perguntas dentro do serviço correspondente na Fase 3, ou permanecem como observações
registradas aqui apenas para dar continuidade lógica.

## 2. Categorias principais e subcategorias

```
Upgrade
├── Sites e Desenvolvimento
│   ├── Landing Page
│   ├── Site Institucional            (inclui foco "comercial" como variação de objetivo, não categoria própria)
│   ├── E-commerce
│   ├── Sistema / Plataforma
│   └── (tier transversal) Premium / Interativo — aplicável a qualquer um dos quatro acima
├── Tráfego Pago
│   └── Tráfego Pago (serviço único — variações tratadas por pergunta na Fase 3)
├── Design / Social Media
│   ├── Identidade Visual
│   ├── Design para Redes Sociais
│   ├── Gestão de Social Media
│   ├── Criativos para Anúncios
│   └── (complemento transversal) Vídeos / Reels — anexável aos itens acima
└── (link simples, fora da árvore de categorias) "Fale com a Upgrade" → contato humano direto
```

---

## 3. Sites e Desenvolvimento

### Análise da divisão original

A lista inicial (Landing Page, Site Institucional, Site Comercial, E-commerce, Sistema/Plataforma,
Site Premium/Interativo) foi ajustada em dois pontos:

- **"Site Institucional" e "Site Comercial" foram unificados** em uma única categoria. A diferença
  entre os dois não é estrutural (não muda a complexidade técnica de forma relevante), é de
  **objetivo** (existir com credibilidade vs. gerar contato comercial ativamente). Manter os dois como
  categorias separadas criaria sobreposição confusa para um visitante leigo. O objetivo (institucional
  vs. comercial) será uma variação capturada por pergunta na Fase 3, não uma categoria própria.
- **"Site Premium / Interativo" deixou de ser uma categoria própria** e passou a ser um **nível
  transversal de sofisticação** (mais motion design, mais interatividade, experiência diferenciada)
  aplicável a qualquer um dos quatro tipos de site abaixo. Tratá-lo como quinta categoria criaria
  sobreposição direta com todas as outras (um e-commerce também pode ser "premium/interativo").

### 3.1 Landing Page

| Campo | Conteúdo |
|---|---|
| Descrição curta | Página única focada em uma oferta, produto, campanha ou lançamento específico. |
| Objetivo principal | Converter o visitante em contato ou venda para uma oferta pontual. |
| Cliente ideal | Quem vai rodar uma campanha específica (lançamento, evento, promoção, captação para tráfego pago). |
| Complexidade | Baixa a Média. |
| Fatores que aumentam complexidade | Formulário em múltiplas etapas; integração com CRM ou automação de e-mail; testes A/B; múltiplas versões (públicos/idiomas diferentes). |
| Integrações possíveis | WhatsApp; formulário/CRM; pixel de rastreamento (Meta/Google); ferramentas de e-mail marketing. |
| Complementares recomendados | Tráfego Pago (uso quase sempre conjunto); Criativos para Anúncios. |

### 3.2 Site Institucional

| Campo | Conteúdo |
|---|---|
| Descrição curta | Site completo que apresenta a empresa, seus serviços/produtos, diferenciais e canais de contato. Pode ter foco mais institucional (credibilidade) ou mais comercial (gerar contato ativamente) — isso é definido por pergunta, não por categoria. |
| Objetivo principal | Gerar presença digital confiável e/ou gerar contatos comerciais qualificados. |
| Cliente ideal | Empresas que precisam de presença oficial online, com ou sem foco comercial direto. |
| Complexidade | Média. |
| Fatores que aumentam complexidade | Número de páginas; catálogo de serviços/produtos sem checkout; blog/conteúdo; múltiplos idiomas; integração com CRM. |
| Integrações possíveis | WhatsApp; formulário de contato; Google Maps; redes sociais; CRM. |
| Complementares recomendados | Identidade Visual (se ainda não existir); Tráfego Pago; Gestão de Social Media. |

### 3.3 E-commerce

| Campo | Conteúdo |
|---|---|
| Descrição curta | Loja virtual com catálogo de produtos, carrinho de compras e pagamento online. |
| Objetivo principal | Vender produtos diretamente pela internet. |
| Cliente ideal | Negócios que vendem produtos físicos ou digitais em variedade ou volume relevante. |
| Complexidade | Alta. |
| Fatores que aumentam complexidade | Número de produtos/variações; integrações de pagamento e frete; controle de estoque; venda em marketplaces; múltiplas lojas. |
| Integrações possíveis | Gateways de pagamento; transportadoras/cálculo de frete; ERP; marketplaces. |
| Complementares recomendados | Tráfego Pago; Criativos para Anúncios; Gestão de Social Media. |

### 3.4 Sistema / Plataforma

| Campo | Conteúdo |
|---|---|
| Descrição curta | Aplicação sob medida além de um site comum — área de cliente, cadastro, automações internas, painel de gestão. |
| Objetivo principal | Resolver uma necessidade operacional ou funcional específica do negócio. |
| Cliente ideal | Empresas com um processo próprio que um site padrão não resolve. |
| Complexidade | Alta (a mais variável do catálogo — pode ir de moderada a muito alta). |
| Fatores que aumentam complexidade | Regras de negócio específicas; integrações externas; múltiplos perfis de usuário/autenticação; volume de dados. |
| Integrações possíveis | APIs externas; banco de dados dedicado; autenticação; pagamento. |
| Complementares recomendados | Site Institucional (para apresentar o sistema ao mercado); Tráfego Pago se o sistema for um produto/SaaS. |

### 3.5 Premium / Interativo (tier transversal, não é categoria própria)

Não é um tipo de site, é um **nível de experiência** que pode ser aplicado a qualquer uma das quatro
categorias acima (mais motion design, animações avançadas, interatividade diferenciada). Sua definição
detalhada (o que exatamente muda em cada tier) pertence à Fase 3/6, mas fica registrado aqui que ele
**não deve virar uma quinta opção de site** no catálogo.

---

## 4. Tráfego Pago

### Decisão de estrutura: A ou B?

Analisadas as duas opções propostas:

- **(A) Tipos de serviço separados** por tipo de negócio (negócio local, delivery, e-commerce, eventos)
  ou por abrangência (regional, estadual, nacional) — rejeitada. Criaria dezenas de combinações
  redundantes (ex.: "Tráfego Pago para negócio local regional" vs "Tráfego Pago para e-commerce
  nacional") sem diferença estrutural real no serviço entregue.
- **(B) Um único serviço "Tráfego Pago"**, com tipo de negócio, objetivo, plataforma e abrangência
  geográfica tratados como **respostas dentro do serviço** — adotada. Gera melhor UX (uma decisão de
  entrada simples: "quero Tráfego Pago"), catálogo mais limpo, e mantém a granularidade onde ela
  pertence: nas perguntas da Fase 3.

### 4.1 Tráfego Pago (serviço único)

| Campo | Conteúdo |
|---|---|
| Descrição curta | Anúncios pagos para atrair clientes até o negócio (Instagram, Facebook, Google e afins). |
| Objetivo principal | Variável — será refinado por pergunta: gerar leads, gerar vendas, gerar contato via WhatsApp, aumentar reconhecimento de marca, ou remarketing. |
| Cliente ideal | Negócios que já têm algo para oferecer (produto, serviço, site ou perfil) e precisam de mais alcance/demanda. |
| Complexidade | Baixa a Alta — depende do objetivo, da plataforma e da abrangência geográfica escolhidos nas respostas. |
| Fatores que aumentam complexidade | Múltiplos objetivos simultâneos; múltiplas plataformas (Meta + Google); abrangência nacional; necessidade de criativos novos; funil de remarketing. |
| Integrações possíveis | Meta Ads; Google Ads; WhatsApp Business; pixel de rastreamento; CRM para leads. |
| Complementares recomendados | Landing Page ou Site (destino do anúncio); Criativos para Anúncios; Gestão de Social Media. |

**Nota de continuidade para a Fase 3**: os seguintes eixos foram identificados como **futuras perguntas**
dentro do serviço único "Tráfego Pago" — registrados aqui apenas para não se perderem, sem virar
estrutura de catálogo:

- Tipo de negócio (local, prestação de serviço, delivery, e-commerce, eventos);
- Objetivo (geração de leads, vendas, WhatsApp, reconhecimento, remarketing);
- Plataforma (Meta Ads, Google Ads, ambas);
- Abrangência geográfica (regional, estadual, nacional).

---

## 5. Design / Social Media

### Análise da divisão original

A lista original (Identidade Visual, Design para Redes Sociais, Gestão de Social Media, Criativos para
Anúncios, Vídeos/Reels, Pacotes de Conteúdo) tinha duas fontes de sobreposição, resolvidas assim:

- **"Vídeos / Reels" deixou de ser categoria própria** e passou a ser um **complemento transversal**,
  anexável à Gestão de Social Media ou aos Criativos para Anúncios (vídeo é um formato, não um serviço
  com objetivo próprio diferente dos demais).
- **"Pacotes de Conteúdo" foi removido do catálogo lógico** — é uma forma de **empacotar
  comercialmente** os serviços abaixo (ex.: um pacote mensal com X artes + Y posts), não um serviço
  com identidade própria. Pertence a uma futura camada de precificação/empacotamento, não ao mapa de
  serviços.

### Diferença entre "Design para Redes Sociais" e "Gestão de Social Media"

Esta é a distinção mais importante da categoria, porque os dois nomes soam parecidos para um leigo:

- **Design para Redes Sociais** = a Upgrade **produz as artes** (posts, stories, banners, capas —
  tratados como formatos de um mesmo serviço, nunca como serviços separados), mas **o cliente publica
  e administra o perfil por conta própria**.
- **Gestão de Social Media** = a Upgrade **assume o perfil**: planejamento de conteúdo, produção das
  artes e **publicação recorrente**, de ponta a ponta. Já inclui o design como parte do escopo.

Consequência prática: **os dois normalmente não devem ser contratados juntos** (contratar Gestão já
inclui o design) — essa observação é registrada aqui para orientar a Fase 3, mas a regra de bloqueio
efetiva será implementada na lógica de ramificação, não nesta fase.

### Vídeo: categoria própria, complemento, ou opção dentro de Social Media?

Decisão: **complemento transversal**, não categoria própria e não uma opção "escondida" dentro de
Social Media apenas. Vídeo pode ser relevante tanto para conteúdo orgânico (Gestão de Social Media)
quanto para anúncios pagos (Criativos para Anúncios), então ele é modelado como um **formato anexável**
a qualquer um dos dois, evitando duplicar a lógica de "vídeo para social" e "vídeo para anúncio" como
categorias distintas.

### 5.1 Identidade Visual

| Campo | Conteúdo |
|---|---|
| Descrição curta | Construção da marca: logotipo, paleta de cores, tipografia e um guia básico de uso. |
| Objetivo principal | Dar uma base visual profissional e consistente para todo o resto (site, redes, anúncios). |
| Cliente ideal | Empresa nova, ou empresa que sente que "a marca parece amadora". |
| Complexidade | Baixa a Média. |
| Fatores que aumentam complexidade | Reposicionamento de marca já existente; múltiplas aplicações (embalagem, fachada, uniforme); manual de marca extenso. |
| Integrações possíveis | Não aplicável diretamente (entregável é a base visual, não um sistema). |
| Complementares recomendados | Site Institucional; Design para Redes Sociais ou Gestão de Social Media. |

### 5.2 Design para Redes Sociais

| Campo | Conteúdo |
|---|---|
| Descrição curta | Produção de artes para redes sociais (posts, stories, banners, capas, thumbnails — tratados como formatos, não serviços separados) sem gestão do perfil. |
| Objetivo principal | Dar consistência visual às redes sociais que o próprio cliente administra. |
| Cliente ideal | Quem já posta e administra suas redes, mas precisa de material visual profissional. |
| Complexidade | Baixa. |
| Fatores que aumentam complexidade | Volume mensal de artes; variedade de formatos exigidos; necessidade de vídeo. |
| Integrações possíveis | Não aplicável diretamente. |
| Complementares recomendados | Identidade Visual (se ainda não existir); Vídeos/Reels (como complemento). |

### 5.3 Gestão de Social Media

| Campo | Conteúdo |
|---|---|
| Descrição curta | A Upgrade assume o perfil: planejamento, produção de artes e publicação recorrente. |
| Objetivo principal | Manter as redes sociais ativas, consistentes e alinhadas à estratégia do negócio. |
| Cliente ideal | Quem sente que "as redes sociais estão paradas" ou não tem tempo/time para cuidar disso. |
| Complexidade | Média. |
| Fatores que aumentam complexidade | Número de redes geridas; frequência de publicação; necessidade de resposta a comentários/mensagens; vídeo incluso. |
| Integrações possíveis | Ferramentas de agendamento; Meta Business Suite. |
| Complementares recomendados | Identidade Visual (se ainda não existir); Criativos para Anúncios (se também houver Tráfego Pago); Vídeos/Reels. |

### 5.4 Criativos para Anúncios

| Campo | Conteúdo |
|---|---|
| Descrição curta | Artes e vídeos produzidos especificamente para uso em campanhas de tráfego pago. |
| Objetivo principal | Fornecer o material visual que os anúncios precisam para performar. |
| Cliente ideal | Quem já tem ou vai contratar Tráfego Pago e precisa de criativos (não confundir com posts orgânicos). |
| Complexidade | Baixa a Média. |
| Fatores que aumentam complexidade | Volume de variações para teste; necessidade de vídeo; múltiplas campanhas simultâneas. |
| Integrações possíveis | Formatos nativos de Meta Ads/Google Ads. |
| Complementares recomendados | Tráfego Pago (dependência natural); Vídeos/Reels. |

---

## 6. "Fale com a Upgrade" — saída simples para o visitante indeciso (histórico do diagnóstico avaliado e descartado)

**Correção de escopo (Fase 5, revisão final)**: esta seção descrevia uma função de diagnóstico com
perguntas sobre o problema do negócio e recomendação automática de categoria. Essa abordagem foi
avaliada e **descartada** por deixar o Builder parecido com um consultor automático, o que contraria o
objetivo do produto (o site deve impressionar e organizar interesse, não analisar automaticamente). A
função oficial hoje é apenas um link simples: **"Não sabe exatamente do que precisa? Fale com a
Upgrade"**, levando a um canal de contato direto, sem nenhuma pergunta ou recomendação (ver
`docs/USER-FLOW.md`, Seção 12). A tabela abaixo permanece só como registro histórico do raciocínio
problema → categoria que existiu nas Fases 2–5; não corresponde a nenhuma tela ou fluxo ativo.

Mapa lógico problema → categoria(s) candidata(s) (referência para a Fase 3, sem lógica de perguntas
ainda):

| Problema relatado pelo cliente | Categoria(s) candidata(s) |
|---|---|
| "Preciso conseguir mais clientes" | Tráfego Pago; Site (se inadequado); Gestão de Social Media |
| "Minha empresa quase não aparece na internet" | Site Institucional; Identidade Visual; Tráfego Pago |
| "Minha marca parece amadora" | Identidade Visual; Design para Redes Sociais |
| "Minhas redes sociais estão paradas" | Gestão de Social Media; Criativos/Vídeos como complemento |
| "Meu site está ruim ou antigo" | Site Institucional (redesign); tier Premium/Interativo |
| "Não tenho site" | Site Institucional ou Landing Page (depende do objetivo) |
| "Recebo visitas mas poucas pessoas entram em contato" | Revisão de Site Institucional/Landing Page; Tráfego Pago (qualificação de público) |
| "Quero vender pela internet" | E-commerce ou Site Institucional com foco comercial; Tráfego Pago |
| "Quero profissionalizar minha empresa" | Identidade Visual; Site Institucional |
| "Quero crescer para outras regiões" | Tráfego Pago (abrangência geográfica) |

A relação é **muitos-para-muitos de propósito**: cada problema pode apontar para mais de uma categoria,
e cada categoria pode resolver mais de um problema. A lógica de priorização entre elas (o que perguntar
primeiro, como decidir a ordem de recomendação) é conteúdo da Fase 3, não desta fase.

---

## 7. Serviços complementares (visão consolidada)

| Serviço principal | Complementares mais naturais |
|---|---|
| Landing Page | Tráfego Pago; Criativos para Anúncios |
| Site Institucional | Identidade Visual; Tráfego Pago; Gestão de Social Media |
| E-commerce | Tráfego Pago; Criativos para Anúncios; Gestão de Social Media |
| Sistema / Plataforma | Site Institucional; Tráfego Pago |
| Tráfego Pago | Landing Page ou Site; Criativos para Anúncios |
| Identidade Visual | Site Institucional; Design para Redes Sociais ou Gestão de Social Media |
| Design para Redes Sociais | Identidade Visual; Vídeos/Reels |
| Gestão de Social Media | Identidade Visual; Criativos para Anúncios; Vídeos/Reels |
| Criativos para Anúncios | Tráfego Pago; Vídeos/Reels |

## 8. Possíveis combinações (exemplos válidos)

- Site Institucional + Tráfego Pago
- Identidade Visual + Site Institucional + Gestão de Social Media
- E-commerce + Tráfego Pago + Criativos para Anúncios
- Landing Page + Tráfego Pago (combinação clássica de campanha)
- Identidade Visual + Design para Redes Sociais (marca nova cuidando das próprias redes)

### Combinação atípica a sinalizar (não bloquear nesta fase)

- **Design para Redes Sociais + Gestão de Social Media**: tecnicamente selecionável, mas normalmente
  redundante (Gestão já inclui o design). Fica registrado como ponto de atenção para a lógica de
  ramificação da Fase 3 — não é uma combinação "impossível", apenas incomum e provavelmente merece um
  aviso ou confirmação no fluxo.

---

## 9. Serviços que NÃO devem virar categoria própria

- **Site Comercial** — absorvido por Site Institucional (diferença é de objetivo, não de categoria).
- **Site Premium / Interativo** — é um tier transversal, não um tipo de site.
- **Post, story, banner, flyer, capa, thumbnail** — são formatos dentro de "Design para Redes Sociais"
  ou "Criativos para Anúncios", nunca serviços individuais.
- **Vídeos / Reels** — complemento transversal, não categoria própria.
- **Pacotes de Conteúdo** — é empacotamento comercial (pricing), não um serviço com identidade própria.
- **Meta Ads / Google Ads como serviços separados** — são plataformas dentro do serviço único
  "Tráfego Pago", não categorias.
- **Segmentações de Tráfego Pago por tipo de negócio ou abrangência geográfica** (negócio local,
  delivery, regional, estadual, nacional etc.) — são respostas/perguntas futuras, não categorias.

## 10. Terminologia recomendada para o cliente vs. terminologia interna

| Nome interno (equipe/documentação) | Termo recomendado para o cliente |
|---|---|
| Sites e Desenvolvimento | "Site" ou "Meu site" |
| Landing Page | "Página de conversão" ou manter "Landing Page" com explicação curta ("página única focada em uma oferta") |
| Site Institucional (com variação de objetivo) | "Site para minha empresa" |
| Sistema / Plataforma | "Sistema sob medida para minha empresa" |
| Tier Premium / Interativo | "Versão mais sofisticada e interativa" |
| Tráfego Pago | Manter "Tráfego Pago", mas sempre com subtítulo explicativo: "anúncios que trazem clientes até você" |
| Design para Redes Sociais | "Artes para minhas redes sociais" |
| Gestão de Social Media | "Cuidar das minhas redes sociais para mim" |
| Criativos para Anúncios | "Artes para meus anúncios" |
| Vídeos / Reels (complemento) | "Vídeos para redes sociais ou anúncios" |
| Identidade Visual | Manter "Identidade Visual" (termo já compreendido pelo público leigo) |

Princípio geral: qualquer nome interno com jargão de marketing/tecnologia (Landing Page, tráfego,
criativos) deve ser acompanhado, na interface futura, de uma explicação curta em linguagem simples —
isso é uma diretriz para a Fase 18/19 (Design System/UI), registrada aqui apenas como requisito de
terminologia, sem implementação.

---

## 11. Revisão final desta fase

Verificações realizadas antes de fechar o documento:

- **Serviços duplicados**: encontrados e corrigidos — Site Institucional/Site Comercial (unificados);
  Vídeos/Reels como categoria própria (rebaixado a complemento); Pacotes de Conteúdo (removido do
  catálogo lógico).
- **Categorias confusas**: "Design para Redes Sociais" vs. "Gestão de Social Media" — diferença
  explicitada na Seção 5.
- **Sobreposição**: Site Premium/Interativo sobrepunha todas as categorias de site — resolvido como
  tier transversal.
- **Opções técnicas demais**: nomes como "Landing Page" e "Tráfego Pago" mantidos (já comuns no
  mercado), mas com exigência de explicação simples registrada na Seção 10.
- **Quantidade excessiva de escolhas**: catálogo final tem **3 entradas de topo** (Fase 5), 9 serviços
  reais (4 de Sites + 1 de Tráfego + 4 de Design/Social) mais 2 elementos transversais (tier Premium,
  Vídeo) e 1 link simples para contato ("Fale com a Upgrade", fora da árvore de categorias) — considerado
  enxuto e compatível com o objetivo de não sobrecarregar o visitante. Depois da unificação
  (Institucional+Comercial e Premium como tier), Sites passou a ter oficialmente **4 categorias
  vendáveis** (Landing Page, Site Institucional, E-commerce, Sistema/Plataforma).
- **Combinações impossíveis**: nenhuma combinação foi bloqueada nesta fase; apenas uma combinação
  atípica foi sinalizada (Seção 8) para tratamento na Fase 3.
- **Serviços importantes sem lugar na estrutura**: nenhum identificado. Todos os itens citados no
  briefing (incluindo os problemas de diagnóstico) encontraram lugar em alguma categoria ou como
  observação transversal.

---

*Este documento é a base de conteúdo para a Fase 3 (Perguntas e Ramificações). Nenhuma pergunta,
fluxo de tela ou lógica de recomendação foi definida aqui — apenas a estrutura lógica do catálogo.*
