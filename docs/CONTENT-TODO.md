# CONTENT-TODO — Conteúdo, assets e informações pendentes

> Rodada de **comunicação (copy)** da Home e do fluxo até o contato, feita com a skill `copychief`.
> Regra desta rodada: melhorar **como o que já foi definido é comunicado**, sem mexer em estratégia,
> modelo de negócio, Builder, categorias, perguntas ou funil. Nada foi inventado: tudo o que depende
> de material real está marcado no código com `[FUTURO …]` / `[PENDENTE …]` e listado aqui.

---

## 1. Como identificar pendências no código

- `[FUTURO CASE …]`, `[FUTURO MOCKUP …]` — comentários nos componentes que dizem onde entra a prova ou a
  imagem real (`ProjectsTeaserSection.tsx`, `HowItWorksSection.tsx`, `app/projetos/page.tsx`).
- `[PENDENTE — WHATSAPP OFICIAL]`, `[PENDENTE — PRAZO E WHATSAPP]` — pontos que só aparecem quando a Upgrade
  preencher a configuração (`lib/contact/siteContact.ts`).
- Variáveis de ambiente novas (documentadas em `.env.example`, **vazias de propósito**):
  - `NEXT_PUBLIC_WHATSAPP_NUMBER` — WhatsApp oficial, só dígitos, com DDI e DDD (ex.: `5511999999999`).
    Quando preenchida: o botão "Não sabe exatamente do que precisa? Fale com a Upgrade" (tela de serviços)
    vira link, e o rodapé e a tela de sucesso passam a mostrar o WhatsApp. Enquanto vazia, o botão fica
    desativado como antes.
  - `NEXT_PUBLIC_RESPONSE_TIME` — prazo **real** de retorno, já como trecho de frase (ex.: `em até 1 dia útil`
    é só o formato, não um prazo combinado). Quando preenchida: aparece na tela de sucesso e na FAQ.
    Enquanto vazia, nenhum prazo é prometido.

---

## 2. Assets pendentes

Nenhuma imagem foi escolhida, baixada ou criada. Cada item abaixo é um pedido de asset para você escolher
ou produzir. Formato recomendado para imagens: **WebP ou AVIF** (com PNG de reserva se necessário), com
versão para desktop e para mobile quando a proporção muda.

### IMAGEM NECESSÁRIA — Como funciona: demonstração do Builder
- **Seção:** Home → "Como funciona".
- **Tipo:** vídeo curto em loop (MP4/WebM, 8–15 s, sem áudio) **ou** 2–3 capturas reais do Builder.
- **Objetivo:** mostrar, em segundos, que o visitante monta o próprio Upgrade (diferencial do site).
- **Conteúdo ideal:** captura real da tela "Escolha o seu Upgrade" e do resumo "Seu Upgrade está quase
  pronto!", dentro de uma moldura de celular e/ou notebook. Sem dados de cliente real.
- **Proporção:** 16:10 no desktop (lado direito da seção ou abaixo dos passos); 4:5 ou 9:16 no mobile.
- **Prioridade:** alta.
- **Status:** aguardando decisão/produção.

### IMAGEM NECESSÁRIA — Case 01, 02 e 03 (Home)
- **Seção:** Home → "Projetos" (hoje um card de aviso).
- **Tipo:** mockup/screenshot real do projeto (notebook + celular) para cada case.
- **Objetivo:** prova visual de desenvolvimento web/design/campanha real da Upgrade.
- **Conteúdo ideal:** tela real do projeto no notebook e a versão mobile no celular; para tráfego, um painel
  real (sem expor dados sensíveis) ou o criativo da campanha.
- **Proporção:** 4:3 (desktop); 1:1 ou 4:3 (mobile).
- **Prioridade:** alta.
- **Status:** aguardando conteúdo real e autorização do cliente.

### IMAGEM NECESSÁRIA — Páginas de cada case (`/projetos`)
- **Tipo:** imagem principal 16:9 + galeria de 3–6 imagens 4:3; par antes/depois (4:3 cada) quando houver.
- **Objetivo:** contar o projeto: desafio → solução → resultado.
- **Prioridade:** alta.
- **Status:** aguardando conteúdo real.

### IMAGEM NECESSÁRIA — Prova social (depoimentos e logos)
- **Seção:** Home (bloco novo depois de "Projetos", quando houver material).
- **Tipo:** depoimentos reais (texto, nome, cargo/empresa, foto opcional 1:1 de ~256 px) e/ou logos de
  clientes **autorizados** (SVG monocromático, ~32–40 px de altura).
- **Prioridade:** média/alta.
- **Status:** aguardando depoimentos e autorizações.

### IMAGEM NECESSÁRIA — Quem está por trás da Upgrade (autoridade)
- **Seção:** Home (bloco futuro, se você quiser).
- **Tipo:** foto real da equipe ou de bastidores do trabalho.
- **Proporção:** 3:2 (desktop), 4:5 (mobile).
- **Prioridade:** média. **Status:** aguardando decisão.

### Opcionais
- Ilustração/mockup por frente nos cards de "O que fazemos" (hoje usam ícone) — prioridade baixa.
- Arte própria para compartilhamento em redes (Open Graph 1200×630) — hoje é gerada por código
  (`app/opengraph-image.tsx`) — prioridade baixa.

---

## 3. Informações que ainda dependem de você

- **WhatsApp oficial** (e confirmar a mensagem inicial: "Olá! Vim pelo site da Upgrade e quero conversar
  sobre um projeto.").
- **Prazo médio de retorno** (só se existir um prazo real).
- **Projetos autorizados** para portfólio, com: cliente, segmento, desafio, solução, serviços usados e, se
  houver número verificável, o resultado. Mais: autorização de uso da imagem e do nome do cliente.
- **Resultados mensuráveis, depoimentos e logos autorizados.**
- **Localização / área de atendimento**, se for usada na comunicação.
- **Políticas comerciais ainda não definidas** (alimentam a FAQ, ver seção 4): contratação, tipos de projeto
  atendidos, prazos de entrega, preço.
- **Domínio de produção** (`NEXT_PUBLIC_SITE_URL`): o oficial é `https://somosupgrade.com.br` (sem www; o www redireciona). Falta só a variável estar com `https://` na Hostinger.
- **Confirmar textos** marcados como proposta: badge "Agência digital" (antes "Estúdio digital de
  performance"); a frase da FAQ "a equipe da Upgrade … continua a conversa com você".
- **Página de privacidade:** o link do formulário agora aponta para `/privacidade` (página existente). A
  revisão jurídica do conteúdo dela não faz parte desta rodada.

---

## 4. FAQ — aguardando definição

Já respondidas na Home (são fatos do produto): combinar serviços; "Ainda não sei"; quantidade de perguntas;
editar antes de enviar; o que acontece depois de enviar.

**Não publicadas** porque dependem de política sua. Responda e elas entram:
- A Upgrade atende quais tipos de projeto?
- Como funciona a contratação?
- Quanto custa / como é definido o valor?
- Qual o prazo de entrega de um projeto?

(Opcional depois: marcar a FAQ com dados estruturados `FAQPage` para SEO.)

---

## 5. Estrutura futura de `/projetos`

A rota fica e é parte do site final. Cada projeto poderá ter: imagem principal · cliente · segmento ·
problema/desafio · solução · serviços usados (Site / Tráfego Pago / Design e Social Media) · tecnologias
(só se relevante) · antes/depois (quando houver) · resultado real (só com número verificável) · galeria ·
CTA "Monte seu Upgrade". Nada disso é preenchido sem dado real.

**Experiência provisória identificada (não alterada):** enquanto não há projetos, estes pontos levam à página
ainda vazia: CTA secundário "Ver projetos" do hero, link "Projetos" no menu e no rodapé, botão do card
"Projetos" da Home e a entrada em `sitemap.xml`. Mantidos de propósito. O texto da própria `/projetos` foi
reescrito para ser honesto e oferecer o caminho "Monte seu Upgrade".

---

## 6. Observação (não alterada)

O aviso de cookies ocupa cerca de metade da tela no celular na primeira visita, sobre a Home e o Builder.
Não foi mexido por ser componente de privacidade; vale uma versão compacta no mobile numa próxima rodada.

---

## 7. Registro de copy (antes → depois → motivo)

| Onde | Antes | Depois | Motivo |
|---|---|---|---|
| Hero — headline | "Um upgrade real na presença digital da sua empresa." | **Mantida** | Funciona como frase de posicionamento da marca; a clareza passa a vir do subtítulo |
| Hero — subtítulo | "Sites, tráfego pago e design trabalhando juntos — com um processo claro do primeiro clique ao projeto entregue." | "Sites, tráfego pago, design e social media para a sua empresa. Escolha o que precisa, responda poucas perguntas e monte o seu Upgrade." | Clareza: o que faz, para quem e o que dá para fazer no site; o Builder vira o diferencial |
| Hero — selo | "Estúdio digital de performance" | "Agência digital" | Coerência com "Agência Upgrade"; "performance" promete resultado sem prova |
| Hero — microcopy do CTA | (não existia) | "Poucas perguntas · você revisa tudo antes de enviar" | Reduz incerteza antes do clique, só com fatos do fluxo |
| CTA principal | "Monte seu Upgrade" | **Mantido** em header, hero, "Como funciona" e CTA final | Conceito da marca |
| O que fazemos — apoio | "Três frentes, um projeto só — escolhida no Builder, configurada em poucos minutos." | "Três frentes que você pode contratar separadas ou combinar no mesmo projeto." | Clareza e concordância; fala da combinação |
| O que fazemos — cards | Lista de itens ("Sites, landing pages, lojas virtuais e sistemas.") | Nome da frente + o que fazemos + "Para quê" + "Quando faz sentido" | Benefício e momento de uso |
| Como funciona | (não existia) | 4 passos reais + frase sobre o Builder ("em vez de um formulário igual para todo mundo, você monta o seu Upgrade") | O Builder como diferencial; deixa o fluxo fácil de entender |
| Projetos (teaser) | "Os primeiros cases da Upgrade estão a caminho — em breve, projetos reais entregues pela agência aparecem aqui." | "Estamos organizando os primeiros projetos para publicar aqui, com o desafio de cada cliente e a solução da Upgrade." | Honesto, sem prometer data |
| FAQ | (não existia) | 5 perguntas respondidas com fatos do produto | Tira dúvidas que travam o clique |
| CTA final | "Pronto para dar o próximo passo?" | "Pronto para montar o seu Upgrade?" + frase de apoio | Diz qual é o passo |
| `/projetos` | "Página institucional provisória. …" | Texto honesto + botão "Monte seu Upgrade" | Tira o texto de bastidor e dá saída ao visitante |
| Formulário — título | "Deixe seus dados para analisarmos seu projeto." | "Falta pouco: deixe seus dados para a Upgrade analisar o seu projeto." | Progresso e clareza |
| Formulário — aviso | Sem link | Com link para a Política de Privacidade | Confiança; link funcional |
| Sucesso — próximo passo | "Próximo passo: nossa equipe vai analisar seu projeto e entrar em contato em breve." | "O que acontece agora: a equipe da Upgrade analisa o que você montou e entra em contato pelos dados que você informou" (+ prazo e WhatsApp só se configurados) | Expectativa clara sem prazo inventado |
| Opção "Outro" (Tráfego e Design) | só "Outro" | + "Algo diferente das opções acima. A Upgrade conversa com você sobre os detalhes." | Explica o que acontece com a resposta; ids e lógica intactos |
| Botão da tela de serviços | tooltip "Canal de contato — Etapa 9+" | "Canal de contato em breve" (botão preparado para o WhatsApp) | Remove texto de bastidor |
| SEO — description | Repetia o subtítulo antigo | "A Upgrade cria sites, gerencia tráfego pago e cuida de design e social media. Escolha o que a sua empresa precisa e monte o seu Upgrade." | Diz o que a agência faz |
| Menu | Início · Projetos | Início · **Como funciona** · Projetos | Orientação rápida |
