# BUILDER QUESTIONS — Especificação Estruturada das Perguntas

> Fase 3 do roadmap. Lista estruturada de cada pergunta do Upgrade Builder, complementar ao fluxo
> narrativo descrito em `docs/BUILDER-FLOWS.md`. Estrutura conceitual apenas — sem implementação,
> sem nomes de tabela/coluna de banco de dados.
>
> **Correção de escopo (Fase 5)**: a Seção 4 abaixo ("Ainda não sei o que preciso") descreve perguntas de
> uma função de diagnóstico avançado que foi avaliada e **descartada** na revisão final da Fase 5 — não
> existe quarta categoria, nem diagnóstico automático. A função oficial para o visitante indeciso é
> apenas um link simples ("Fale com a Upgrade", sem pergunta) — ver `docs/USER-FLOW.md`, Seção 12. A
> Seção 4 abaixo permanece só como registro histórico do rascunho original, não como especificação ativa.
>
> **Nota adicional**: assim como `BUILDER-FLOWS.md`, este documento é a proposta conceitual original da
> Fase 3. O Upgrade Builder realmente implementado usa um conjunto de perguntas mais enxuto — ver
> `lib/builder/config/*.ts` e `docs/USER-FLOW.md` para o comportamento real.

Campos de cada pergunta:

- **ID** — identificador interno estável (snake_case).
- **Categoria** — a qual entrada/mini-fluxo pertence.
- **Texto** — o que é exibido ao visitante, em linguagem simples.
- **Descrição** — texto de apoio opcional, exibido quando o termo puder gerar dúvida.
- **Tipo** — `single_choice`, `multi_choice` ou `short_text` (texto curto opcional, usado apenas para
  detalhar uma opção "outro").
- **Opções** — conjunto fechado de respostas possíveis.
- **Condição de exibição** — regra que determina se a pergunta aparece.
- **Dependências** — outras perguntas cuja resposta pode ser reaproveitada (evita repetição).
- **Impacto** — qual decisão essa resposta influencia (necessidade, solução, complexidade, escala,
  estratégia, investimento, qualificação comercial, ou próxima pergunta).
- **Obrigatória** — se o mini-fluxo pode avançar sem resposta.
- **Resposta padrão** — valor assumido se existir (normalmente nenhum, pois toda pergunta tem saída de
  incerteza própria em vez de valor padrão silencioso).

---

## 1. Sites e Desenvolvimento

#### `site_tipo`
- Categoria: Sites e Desenvolvimento (entrada)
- Texto: "Que tipo de site você precisa?"
- Descrição: —
- Tipo: single_choice
- Opções: `landing_page` (página única para uma oferta/campanha), `institucional` (site completo da
  empresa), `ecommerce` (loja virtual com pagamento), `sistema` (sistema/plataforma sob medida),
  `nao_sei`
- Condição de exibição: sempre (primeira pergunta da categoria)
- Dependências: nenhuma
- Impacto: necessidade; solução; próxima pergunta
- Obrigatória: sim
- Resposta padrão: nenhuma

#### `lp_objetivo`
- Categoria: Sites → Landing Page
- Texto: "Qual é o objetivo dessa página?"
- Descrição: —
- Tipo: single_choice
- Opções: `capturar_contato`, `vender_oferta_especifica`, `divulgar_evento_lancamento`, `outro`
- Condição de exibição: SE `site_tipo` = `landing_page`
- Dependências: nenhuma
- Impacto: solução; estratégia
- Obrigatória: sim

#### `lp_vai_anunciar`
- Categoria: Sites → Landing Page
- Texto: "Você já vai anunciar essa página, ou por enquanto só quer publicá-la?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim_vou_anunciar`, `ainda_nao`
- Condição de exibição: SE `site_tipo` = `landing_page`
- Dependências: nenhuma
- Impacto: qualificação comercial; recomendação (Tráfego Pago)
- Obrigatória: sim

#### `lp_integracao`
- Categoria: Sites → Landing Page
- Texto: "Essa página precisa se conectar com algo que você já usa (WhatsApp, planilha, e-mail, CRM)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `landing_page`
- Dependências: nenhuma
- Impacto: complexidade
- Obrigatória: sim

#### `inst_objetivo`
- Categoria: Sites → Site Institucional
- Texto: "Qual é o principal objetivo desse site?"
- Descrição: "Passar credibilidade" = mostrar que a empresa existe e é confiável. "Gerar contatos
  ativamente" = fazer o site trabalhar para trazer clientes.
- Tipo: single_choice
- Opções: `passar_credibilidade`, `gerar_contatos_ativamente`, `ambos`
- Condição de exibição: SE `site_tipo` = `institucional`
- Dependências: nenhuma
- Impacto: solução; estratégia; próxima pergunta
- Obrigatória: sim

#### `inst_tamanho`
- Categoria: Sites → Site Institucional
- Texto: "Você tem ideia de quantas páginas ou seções esse site vai precisar?"
- Descrição: —
- Tipo: single_choice
- Opções: `poucas_ate_5`, `media_6_a_10`, `grande_mais_de_10_ou_catalogo`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `institucional`
- Dependências: nenhuma
- Impacto: complexidade; investimento
- Obrigatória: sim

#### `inst_venda_online`
- Categoria: Sites → Site Institucional
- Texto: "Você pretende vender produtos diretamente pelo site, com carrinho e pagamento?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`
- Condição de exibição: SE `site_tipo` = `institucional`
- Dependências: nenhuma
- Impacto: solução; recomendação (E-commerce)
- Obrigatória: sim

#### `inst_integracao`
- Categoria: Sites → Site Institucional
- Texto: "Esse site precisa se conectar com alguma ferramenta que você já usa (WhatsApp, agenda, CRM)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `institucional`
- Dependências: nenhuma
- Impacto: complexidade
- Obrigatória: sim

#### `ecom_qtd_produtos`
- Categoria: Sites → E-commerce
- Texto: "Quantos produtos você pretende vender, aproximadamente?"
- Descrição: —
- Tipo: single_choice
- Opções: `ate_20`, `20_a_100`, `100_a_500`, `mais_de_500`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `ecommerce`
- Dependências: nenhuma
- Impacto: complexidade; investimento; escala
- Obrigatória: sim

#### `ecom_pagamento`
- Categoria: Sites → E-commerce
- Texto: "Você já tem uma forma de receber pagamentos online, ou precisa de ajuda para definir isso?"
- Descrição: —
- Tipo: single_choice
- Opções: `ja_tenho`, `preciso_de_ajuda`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `ecommerce`
- Dependências: nenhuma
- Impacto: complexidade; integrações
- Obrigatória: sim

#### `ecom_frete`
- Categoria: Sites → E-commerce
- Texto: "Você trabalha com entrega/frete (Correios, transportadora, entrega própria)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao_produto_digital_ou_retirada`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `ecommerce`
- Dependências: nenhuma
- Impacto: complexidade; integrações
- Obrigatória: sim

#### `ecom_marketplace`
- Categoria: Sites → E-commerce
- Texto: "Além da sua loja, você já vende ou pretende vender em marketplaces (Shopee, Mercado Livre etc.)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `ecommerce`
- Dependências: nenhuma
- Impacto: complexidade; integrações; recomendação
- Obrigatória: sim

#### `sys_area_privada`
- Categoria: Sites → Sistema/Plataforma
- Texto: "Os usuários vão precisar acessar uma área privada (login)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`
- Condição de exibição: SE `site_tipo` = `sistema`
- Dependências: nenhuma
- Impacto: complexidade; próxima pergunta
- Obrigatória: sim

#### `sys_tipos_usuario`
- Categoria: Sites → Sistema/Plataforma
- Texto: "Existe mais de um tipo de usuário (por exemplo, cliente e administrador) com permissões diferentes?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`
- Condição de exibição: SE `sys_area_privada` = `sim`
- Dependências: `sys_area_privada`
- Impacto: complexidade
- Obrigatória: sim (quando exibida)

#### `sys_integracao`
- Categoria: Sites → Sistema/Plataforma
- Texto: "Esse sistema precisa se conectar com alguma outra ferramenta ou sistema que vocês já usam?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `site_tipo` = `sistema`
- Dependências: nenhuma
- Impacto: complexidade; integrações
- Obrigatória: sim

#### `sys_pagamento`
- Categoria: Sites → Sistema/Plataforma
- Texto: "Esse sistema vai envolver pagamentos?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`
- Condição de exibição: SE `site_tipo` = `sistema`
- Dependências: nenhuma
- Impacto: complexidade
- Obrigatória: sim

#### `site_experiencia`
- Categoria: Sites (transversal — todos os tipos)
- Texto: "Você imagina algo mais simples e direto, ou uma experiência mais sofisticada, com animações e interatividade?"
- Descrição: "Sofisticada" é o nosso nível Premium/Interativo — mais indicado para marcas que querem se
  diferenciar visualmente.
- Tipo: single_choice
- Opções: `simples_direto`, `sofisticado_premium`, `nao_sei`
- Condição de exibição: sempre, como última pergunta de qualquer caminho de `site_tipo` (exceto `nao_sei`)
- Dependências: nenhuma
- Impacto: complexidade; investimento; solução (aplica o tier Premium/Interativo)
- Obrigatória: sim

---

## 2. Tráfego Pago

#### `traf_divulgar`
- Categoria: Tráfego Pago (entrada)
- Texto: "O que você quer divulgar?"
- Descrição: —
- Tipo: single_choice
- Opções: `servico`, `loja_fisica`, `delivery`, `produto_ecommerce`, `evento`, `outro`
- Condição de exibição: sempre (primeira pergunta da categoria)
- Dependências: nenhuma
- Impacto: necessidade; estratégia
- Obrigatória: sim

#### `traf_objetivo`
- Categoria: Tráfego Pago
- Texto: "Qual é o objetivo principal dos anúncios?"
- Descrição: —
- Tipo: single_choice
- Opções: `gerar_mensagens_whatsapp`, `gerar_leads`, `vender_online`, `levar_ate_estabelecimento`,
  `divulgar_evento`, `aumentar_reconhecimento`, `nao_sei`
- Condição de exibição: sempre (após `traf_divulgar`)
- Dependências: nenhuma
- Impacto: estratégia; solução; recomendação
- Obrigatória: sim

#### `traf_abrangencia`
- Categoria: Tráfego Pago
- Texto: "Em que região você quer alcançar pessoas?"
- Descrição: —
- Tipo: single_choice
- Opções: `minha_cidade`, `minha_regiao`, `meu_estado`, `brasil_todo`, `outros_paises`, `nao_sei`
- Condição de exibição: sempre
- Dependências: nenhuma
- Impacto: escala; investimento; complexidade
- Obrigatória: sim

#### `traf_ja_anuncia`
- Categoria: Tráfego Pago
- Texto: "Você já anuncia atualmente?"
- Descrição: —
- Tipo: single_choice
- Opções: `nao`, `sim_meta_ads`, `sim_google_ads`, `sim_ambos`, `sim_outro`
- Condição de exibição: sempre
- Dependências: nenhuma
- Impacto: qualificação comercial; complexidade (substitui a necessidade de uma pergunta separada sobre
  plataforma atual)
- Obrigatória: sim

#### `traf_investimento`
- Categoria: Tráfego Pago
- Texto: "Qual investimento mensal em anúncios você imagina inicialmente?"
- Descrição: —
- Tipo: single_choice
- Opções: `ate_1000`, `1000_a_3000`, `3000_a_10000`, `acima_de_10000`, `nao_defini`
- Condição de exibição: sempre
- Dependências: nenhuma
- Impacto: investimento; qualificação comercial; prioridade comercial
- Obrigatória: sim

---

## 3. Design / Social Media

#### `design_necessidade`
- Categoria: Design/Social Media (entrada)
- Texto: "O que você precisa?"
- Descrição: cada opção é exibida com uma frase curta de diferenciação (ex.: Design para Redes Sociais
  = "só as artes, você publica"; Gestão de Social Media = "cuidamos de tudo, incluindo publicação").
- Tipo: single_choice
- Opções: `identidade_visual`, `design_redes_sociais`, `gestao_social_media`, `criativos_anuncios`,
  `video_reels`, `pacote_completo`, `nao_sei`
- Condição de exibição: sempre (primeira pergunta da categoria)
- Dependências: nenhuma
- Impacto: necessidade; solução; próxima pergunta
- Obrigatória: sim

#### `iv_tem_marca`
- Categoria: Design → Identidade Visual
- Texto: "Sua empresa já tem uma marca (logo, cores) definida?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `tenho_mas_quero_mudar`
- Condição de exibição: SE `design_necessidade` = `identidade_visual` OU `pacote_completo`
- Dependências: nenhuma (mas é fonte de reaproveitamento para `drs_tem_identidade` e `gsm_tem_identidade`)
- Impacto: necessidade; complexidade; escala
- Obrigatória: sim

#### `iv_aplicacoes`
- Categoria: Design → Identidade Visual
- Texto: "Onde essa marca vai ser usada, além das redes sociais e do site? (pode marcar mais de uma)"
- Descrição: —
- Tipo: multi_choice
- Opções: `fachada`, `embalagem`, `uniforme`, `papelaria`, `nenhuma_por_enquanto`
- Condição de exibição: SE `design_necessidade` = `identidade_visual` OU `pacote_completo`
- Dependências: nenhuma
- Impacto: complexidade; escala
- Obrigatória: sim

#### `drs_tem_identidade`
- Categoria: Design → Design para Redes Sociais
- Texto: "Você já tem identidade visual definida (logo, cores)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `design_redes_sociais` E `iv_tem_marca` não foi
  respondida nesta sessão
- Dependências: `iv_tem_marca` (reaproveitada se já respondida — pula esta pergunta)
- Impacto: recomendação (Identidade Visual)
- Obrigatória: sim (quando exibida)

#### `drs_volume`
- Categoria: Design → Design para Redes Sociais
- Texto: "Quantas artes você imagina precisar por mês, aproximadamente?"
- Descrição: —
- Tipo: single_choice
- Opções: `poucas_ate_8`, `media_9_a_20`, `muitas_mais_de_20`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `design_redes_sociais`
- Dependências: nenhuma
- Impacto: complexidade; investimento
- Obrigatória: sim

#### `drs_formatos`
- Categoria: Design → Design para Redes Sociais
- Texto: "Que tipo de conteúdo você precisa? (pode marcar mais de um)"
- Descrição: —
- Tipo: multi_choice
- Opções: `posts_feed`, `stories`, `banners_materiais_pontuais`, `videos_curtos`
- Condição de exibição: SE `design_necessidade` = `design_redes_sociais`
- Dependências: nenhuma
- Impacto: complexidade; recomendação (Vídeos/Reels, se `videos_curtos` marcado)
- Obrigatória: sim

#### `gsm_tem_identidade`
- Categoria: Design → Gestão de Social Media
- Texto: "Você já tem identidade visual definida (logo, cores)?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `gestao_social_media` E `iv_tem_marca` não foi
  respondida nesta sessão
- Dependências: `iv_tem_marca` (reaproveitada se já respondida — pula esta pergunta)
- Impacto: recomendação (Identidade Visual)
- Obrigatória: sim (quando exibida)

#### `gsm_canais`
- Categoria: Design → Gestão de Social Media
- Texto: "Quais redes sociais você quer que a gente cuide?"
- Descrição: —
- Tipo: multi_choice
- Opções: `instagram`, `facebook`, `tiktok`, `outra`
- Condição de exibição: SE `design_necessidade` = `gestao_social_media`
- Dependências: nenhuma
- Impacto: complexidade; investimento
- Obrigatória: sim

#### `gsm_producao_conteudo`
- Categoria: Design → Gestão de Social Media
- Texto: "Você já produz fotos/vídeos do seu negócio, ou isso também precisa ser feito?"
- Descrição: —
- Tipo: single_choice
- Opções: `ja_produzo_e_envio`, `preciso_que_produzam`, `um_pouco_dos_dois`
- Condição de exibição: SE `design_necessidade` = `gestao_social_media`
- Dependências: nenhuma
- Impacto: complexidade; recomendação (Vídeos/Reels)
- Obrigatória: sim

#### `gsm_frequencia`
- Categoria: Design → Gestão de Social Media
- Texto: "Com que frequência você imagina publicar?"
- Descrição: —
- Tipo: single_choice
- Opções: `poucas_vezes_por_semana`, `quase_todo_dia`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `gestao_social_media`
- Dependências: nenhuma
- Impacto: investimento; complexidade
- Obrigatória: sim

#### `crt_uso_anuncios`
- Categoria: Design → Criativos para Anúncios
- Texto: "Esses criativos serão usados em anúncios pagos que vocês já rodam ou pretendem rodar?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `criativos_anuncios`
- Dependências: nenhuma
- Impacto: recomendação (Tráfego Pago); qualificação comercial
- Obrigatória: sim

#### `crt_formato`
- Categoria: Design → Criativos para Anúncios
- Texto: "Você precisa de imagens, vídeos, ou os dois?"
- Descrição: —
- Tipo: single_choice
- Opções: `imagens`, `videos`, `ambos`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `criativos_anuncios`
- Dependências: nenhuma
- Impacto: complexidade; recomendação (Vídeos/Reels, se `videos` ou `ambos`)
- Obrigatória: sim

#### `video_finalidade`
- Categoria: Design → Vídeos/Reels
- Texto: "Esses vídeos são principalmente para..."
- Descrição: —
- Tipo: single_choice
- Opções: `postar_nas_redes_organico`, `usar_em_anuncios_pagos`, `ambos`, `nao_sei`
- Condição de exibição: SE `design_necessidade` = `video_reels`
- Dependências: nenhuma
- Impacto: solução (determina se o vídeo é anexado a Gestão de Social Media, a Criativos para
  Anúncios, ou a ambos)
- Obrigatória: sim

#### `video_material_bruto`
- Categoria: Design → Vídeos/Reels
- Texto: "Você já tem material bruto gravado, ou também precisa de captação (filmagem)?"
- Descrição: —
- Tipo: single_choice
- Opções: `ja_tenho_material`, `preciso_de_captacao`, `um_pouco_dos_dois`
- Condição de exibição: SE `design_necessidade` = `video_reels`
- Dependências: nenhuma
- Impacto: complexidade; investimento
- Obrigatória: sim

---

## 4. "Me ajude a descobrir" (função auxiliar de diagnóstico, não categoria principal)

#### `diag_problema`
- Categoria: Diagnóstico (entrada)
- Texto: "Qual é o principal problema que você quer resolver?"
- Descrição: —
- Tipo: single_choice
- Opções: `mais_clientes`, `nao_aparece_internet`, `marca_amadora`, `redes_fracas`, `sem_site`,
  `site_antigo_ruim`, `visitas_sem_contato`, `quero_vender`, `profissionalizar`, `crescer_regioes`,
  `outro`
- Condição de exibição: sempre (primeira pergunta da categoria)
- Dependências: nenhuma
- Impacto: necessidade; próxima pergunta; recomendação
- Obrigatória: sim

#### `diag_tem_site`
- Categoria: Diagnóstico
- Texto: "Hoje sua empresa já tem site?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `tenho_mas_desatualizado`
- Condição de exibição: SE `diag_problema` ∈ {`mais_clientes`, `nao_aparece_internet`, `quero_vender`,
  `profissionalizar`}
- Dependências: reaproveitável por perguntas equivalentes dentro do fluxo de Sites, se o visitante
  aceitar a recomendação
- Impacto: recomendação; qualificação comercial
- Obrigatória: sim (quando exibida)

#### `diag_ja_anuncia`
- Categoria: Diagnóstico
- Texto: "Você já anuncia (Instagram, Facebook, Google) atualmente?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `nao_sei`
- Condição de exibição: SE `diag_problema` ∈ {`mais_clientes`, `visitas_sem_contato`}
- Dependências: reaproveitável por `traf_ja_anuncia`, se o visitante aceitar a recomendação de Tráfego
  Pago (a versão detalhada de plataforma é então perguntada lá, não aqui)
- Impacto: recomendação; qualificação comercial
- Obrigatória: sim (quando exibida)

#### `diag_tem_marca`
- Categoria: Diagnóstico
- Texto: "Sua empresa já tem uma marca (logo, cores) definida?"
- Descrição: —
- Tipo: single_choice
- Opções: `sim`, `nao`, `tenho_mas_quero_mudar`
- Condição de exibição: SE `diag_problema` ∈ {`nao_aparece_internet`, `marca_amadora`, `profissionalizar`}
- Dependências: reaproveitável por `iv_tem_marca`, se o visitante aceitar a recomendação de Identidade
  Visual
- Impacto: recomendação
- Obrigatória: sim (quando exibida)

#### `diag_situacao_redes`
- Categoria: Diagnóstico
- Texto: "Você posta hoje, mas sente que falta consistência, ou praticamente não posta nada?"
- Descrição: —
- Tipo: single_choice
- Opções: `posto_mas_sem_consistencia`, `quase_nao_posto`, `nao_sei`
- Condição de exibição: SE `diag_problema` = `redes_fracas`
- Dependências: nenhuma
- Impacto: recomendação (Design para Redes Sociais vs. Gestão de Social Media)
- Obrigatória: sim

#### `diag_intencao_site`
- Categoria: Diagnóstico
- Texto: "Você pretende vender diretamente pelo site, ou principalmente atrair contato e mostrar seu trabalho?"
- Descrição: —
- Tipo: single_choice
- Opções: `vender_diretamente`, `atrair_contato_mostrar_trabalho`, `nao_sei`
- Condição de exibição: SE `diag_problema` = `sem_site`
- Dependências: nenhuma
- Impacto: recomendação (E-commerce vs. Site Institucional vs. Landing Page)
- Obrigatória: sim

#### `diag_natureza_problema_site`
- Categoria: Diagnóstico
- Texto: "O maior problema do seu site atual é a aparência, a facilidade de uso, ou ele simplesmente não traz resultado?"
- Descrição: —
- Tipo: single_choice
- Opções: `aparencia`, `facilidade_de_uso`, `nao_traz_resultado`, `nao_sei`
- Condição de exibição: SE `diag_problema` = `site_antigo_ruim`
- Dependências: nenhuma
- Impacto: recomendação (Site Institucional; tier Premium/Interativo se `aparencia`)
- Obrigatória: sim

#### `diag_qtd_produtos_intencao`
- Categoria: Diagnóstico
- Texto: "Quantos produtos você pretende vender, aproximadamente?"
- Descrição: —
- Tipo: single_choice
- Opções: `ate_20`, `20_a_100`, `mais_de_100`, `nao_sei`
- Condição de exibição: SE `diag_problema` = `quero_vender`
- Dependências: reaproveitável por `ecom_qtd_produtos`, se o visitante aceitar a recomendação de
  E-commerce
- Impacto: recomendação; complexidade
- Obrigatória: sim

#### `diag_abrangencia`
- Categoria: Diagnóstico
- Texto: "Para qual região você quer crescer?"
- Descrição: —
- Tipo: single_choice
- Opções: `minha_regiao`, `meu_estado`, `brasil_todo`, `outros_paises`, `nao_sei`
- Condição de exibição: SE `diag_problema` = `crescer_regioes`
- Dependências: reaproveitável por `traf_abrangencia`, se o visitante aceitar a recomendação de
  Tráfego Pago
- Impacto: recomendação; escala
- Obrigatória: sim

#### `diag_outro_texto`
- Categoria: Diagnóstico
- Texto: "Conte rapidamente qual é a situação (opcional)."
- Descrição: usado apenas para dar contexto mínimo à equipe comercial; não gera recomendação automática.
- Tipo: short_text
- Opções: campo livre curto (sem opções fechadas)
- Condição de exibição: SE `diag_problema` = `outro`
- Dependências: nenhuma
- Impacto: qualificação comercial (contexto manual, fora do motor de recomendação)
- Obrigatória: não

---

*Esta especificação é a base de conteúdo para a Fase 5 (Regras de Negócio) e a Fase 9 (Upgrade Builder).
Nenhum tipo de dado de banco, componente de formulário ou validação técnica foi definido aqui.*
