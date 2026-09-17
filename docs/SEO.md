# SEO — Técnico, Estrutural e On-Page

> Fase SEO. Princípio do briefing: "o site é altamente interativo, mas SEO não pode depender das
> animações" — clareza + semântica + performance + conteúdo real, nunca keyword stuffing ou texto
> criado só para robô. Ver `docs/IMPLEMENTATION-STAGE-27.md` para o resumo técnico da
> implementação, problemas encontrados e pendências.

## 1. Auditoria inicial (antes de qualquer mudança)

- **Rotas existentes**: `/`, `/projetos`, `/privacidade` (públicas), `/builder` (ferramenta),
  `/admin`, `/admin/login`, `/admin/leads/[id]` (privadas), `/design-system`,
  `/builder/experiencia` (ferramentas internas, já `notFound()` em produção desde suas próprias
  fases).
- **Metadata anterior**: só `title`/`description` genéricos no `app/layout.tsx` — nenhum
  `canonical`, Open Graph, Twitter Card, `robots` explícito, dados estruturados, `sitemap.xml` ou
  `robots.txt`. Favicon era o ícone padrão do `create-next-app` (nunca trocado).
- **Headings**: confirmado que a Home tem só um `<h1>` (`HeroSection`, `variant="display"`);
  encontrada uma inconsistência de hierarquia (ver Seção 4 abaixo) e corrigida.
- **Conteúdo**: confirmado via `curl` no HTML puro do servidor (sem JS) que o `<h1>`, os 3 pilares
  de serviço e o CTA principal já existiam no HTML — ver Seção 3.
- **Imagens**: `next/image` já usado com `width`/`height`/`priority` explícitos onde apropriado
  (logo no header/admin); `alt=""` já correto nos casos puramente decorativos/redundantes com
  texto adjacente — nada precisou mudar aqui.

## 2. Metadata por página

Central em `lib/seo/siteConfig.ts` (nome, URL, descrição, locale — nunca duplicado em outro
arquivo) e `app/layout.tsx` (`title.default`/`title.template`, `description`, `metadataBase`,
`robots` padrão, `openGraph`/`twitter` padrão). Cada página sobrescreve só o que precisa:

| Rota | `title` | `robots` | `canonical` |
| --- | --- | --- | --- |
| `/` | `Agência Upgrade — Sites, Tráfego Pago e Design` (padrão do layout) | `index, follow` | `/` |
| `/projetos` | `Projetos \| Agência Upgrade` | `index, follow` | `/projetos` |
| `/privacidade` | `Política de Privacidade \| Agência Upgrade` | `index, follow` | `/privacidade` |
| `/builder` | `Monte seu Upgrade \| Agência Upgrade` | **`noindex, follow`** | — |
| `/admin`, `/admin/leads/[id]` | herda do layout | **`noindex, nofollow`** | — |
| `/admin/login` | `Login \| Agência Upgrade` | **`noindex, nofollow`** | — |
| `/design-system`, `/builder/experiencia` | — | `noindex` automático (404 real em produção) | — |
| 404 (`not-found.tsx`) | `Página não encontrada \| Agência Upgrade` | `noindex` automático (Next.js injeta em toda resposta 404) | — |

Título/descrição nunca reescritos "para SEO" — sempre a mesma frase já usada no corpo real da
página (Seção 29 do briefing: "não reescrever tudo apenas por SEO").

## 3. Home: marca/serviços/proposta/CTA no HTML puro

Verificado com `curl http://localhost:3000/` (sem executar nenhum JS) que o HTML bruto do servidor
já contém:

```
Um upgrade real na presença digital da sua empresa.   (h1)
Criar um site / Atrair mais clientes / Fortalecer minha marca e conteúdo   (os 3 pilares, h3)
Monte seu Upgrade   (CTA principal, <a>)
```

Isso já era verdade ANTES desta fase — `app/page.tsx` é um Server Component, e as seções filhas
(`HeroSection`/`CapabilitiesSection`/etc.) são Client Components só por causa dos HOOKS de motion
(GSAP/ScrollTrigger), nunca porque o CONTEÚDO depende de JavaScript: o JSX de texto é sempre
renderizado no servidor; só a ANIMAÇÃO desse texto (opacity/transform via GSAP) acontece depois,
no cliente (briefing, Seções 6/7/46 — "Client Component por causa das animações" nunca significa
"conteúdo só existe depois de hidratar"). Nada precisou mudar aqui; esta seção documenta a
verificação, não uma correção.

O monograma 3D do Hero e o brilho procedural do CTA final (Fase 3D/WebGL) são 100% decorativos
(`aria-hidden`, `pointer-events: none`) e nunca a única fonte de nenhuma informação — exatamente
como pede a Seção 8 do briefing ("logo 3D, partículas, shaders não podem substituir conteúdo
textual").

## 4. Heading structure

Hierarquia da Home corrigida: `HeroSection` (`h1`) → `CapabilitiesSection` ("O que fazemos", `h2`)
→ `ProjectsTeaserSection` ("Projetos") → `FinalCtaSection` ("Pronto para dar o próximo passo?",
`h2`). `ProjectsTeaserSection` usava `variant="h3"` sem `as`, o que também gerava a tag `<h3>` —
uma seção IRMÃ de "O que fazemos"/CTA final (não uma subseção dela) deveria estar no mesmo nível.
Corrigido para `<Heading variant="h3" as="h2">` — o recurso que `Heading.tsx` já expõe
exatamente para isso (tag semântica separada da aparência visual): o card continua com o mesmo
tamanho de texto compacto de sempre, só a tag HTML virou `<h2>`.

`/projetos`/`/privacidade` já usavam um único `<h1>` correto; `/design-system` (ferramenta
interna, nunca indexada) não foi revisado por não ter relevância de SEO.

## 5. Sitemap

`app/sitemap.ts` — só as 3 URLs públicas/indexáveis: `/`, `/projetos`, `/privacidade`. Sem
`lastModified` (nenhuma data real de última modificação é rastreada — inventar `new Date()` a cada
build seria uma data falsa, Seção 77 do briefing). Testado (`app/sitemap.test.ts`).

## 6. Robots.txt

`app/robots.ts` — permite tudo, bloqueia só `/admin` (Seção 12: "obrigatoriamente... não aparecer
no sitemap" — nem `/admin` nem `/admin/login` estão no sitemap). `/builder`, embora `noindex`,
**não** é bloqueado no `robots.txt` — bloquear impediria o Google de sequer buscar a página para
LER a diretiva `noindex` (a combinação recomendada pelo próprio Google é: página rastreável +
`noindex` via meta tag, nunca as duas coisas juntas na mesma URL). `robots.txt` não substitui
autenticação (Seção 16) — `/admin` já é protegido de verdade por sessão
(`requireAdminSession`); a regra aqui só evita rastreamento desnecessário.

## 7. Canonical

`alternates.canonical` explícito em cada página pública (`/`, `/projetos`, `/privacidade`) —
sempre a URL limpa, nunca dependente de query string. Isso já resolve duplicação por UTM/query
params (Seção 18/59) sem nenhum código adicional: o `canonical` de uma página é o mesmo
independente de `?utm_source=...` estar presente ou não na URL visitada.

## 8. Open Graph e Twitter/X

Padrão herdado do `app/layout.tsx` (`openGraph`/`twitter`, `type: "website"`, `locale: "pt_BR"`,
`card: "summary_large_image"`) — nenhuma página desta fase precisou de um Open Graph próprio
(`/projetos`/`/privacidade` são institucionais simples; `/builder`/`/admin` são `noindex`, sem
necessidade de investir numa imagem de compartilhamento própria).

## 9. OG Image e ícones — gerados via código, nunca um asset novo

`next/og` (`ImageResponse`) permite gerar imagens via JSX/CSS em tempo de build — usado para os
3 arquivos de imagem que o site precisava e não tinha:

- `app/opengraph-image.tsx` (1200×630) — logo real + nome + descrição (a mesma frase de sempre),
  fundo preto da marca. Nunca cortada, texto sempre em tamanho legível (Seção 20 do briefing).
- `app/icon.tsx` (32×32) — favicon a partir do logo real. Substituiu o `app/favicon.ico` (o ícone
  padrão do `create-next-app`, nunca trocado desde o início do projeto — removido nesta fase).
- `app/apple-icon.tsx` (180×180) — ícone de tela inicial do iOS.

Nenhum arquivo de imagem novo foi adicionado ao repositório — os três lêem `public/logo-mark.png`
(o asset real da marca, já existente) e compõem a imagem em tempo de build; mesmo raciocínio de
"gerar em vez de inventar/buscar um asset" já usado no sound design (Web Audio) e no monograma 3D
procedural das fases anteriores.

## 10. Dados estruturados (schema.org)

Só dois tipos, ambos só na Home (`app/page.tsx`) — `lib/seo/structuredData.ts`:

- **`Organization`**: nome, URL, logo, descrição (todos reais) + `makesOffer` com os 3 serviços
  reais do Builder (`features/builder/data/services.ts` — a mesma fonte de dados que
  `CapabilitiesSection` já usa; nenhuma descrição nova). **Sem** `sameAs` (nenhum perfil de rede
  social oficial existe no projeto — `SiteFooter.tsx` já documenta isso), **sem**
  endereço/telefone (`LocalBusiness`/`ProfessionalService` avaliados e descartados — Seção 23 do
  briefing: "só adicionar se forem reais e públicos"; não são).
- **`WebSite`**: nome + URL. Sem `potentialAction`/`SearchAction` — o site não tem busca interna.

Deliberadamente mínimo (briefing, Seção 25: "não criar dezenas de schemas sem necessidade").
Testado (`lib/seo/structuredData.test.ts`), incluindo o escape de `<` no JSON embutido no
`<script type="application/ld+json">`.

## 11. Páginas de serviço

Avaliado (briefing, Seção 10) — **não criadas** nesta fase. O site hoje descreve os 3 serviços
via o Builder (interativo) e a seção "O que fazemos" da Home (estático) — não existem 3 páginas
de conteúdo próprias (`/servicos/sites`, `/servicos/trafego-pago`, `/servicos/design`) com copy
suficiente para justificar uma URL indexável individual ainda. **Oportunidade futura documentada**:
se/quando a Upgrade tiver conteúdo real e substancial por serviço (cases, FAQ genuíno, prova
social), 3 páginas de serviço com URLs limpas (`/servicos/sites`, etc.) seriam a estrutura natural
— não implementadas agora para não criar "páginas inúteis para captar palavra-chave" (Seção
"Objetivo" do briefing).

## 12. Builder

`noindex, follow` — ver Seção 2. Ferramenta de conversão, não uma landing page de conteúdo; todo
o conteúdo é dinâmico/dependente do estado do usuário, sem cópia estável para o Google indexar. A
Home (indexável) já é quem convence e linka para `/builder`.

## 13. Admin

`noindex, nofollow` em `/admin` (via `app/admin/(protected)/layout.tsx`, cobre também
`/admin/leads/[id]`) e em `/admin/login` (própria `metadata`, já que não está sob o mesmo layout —
login precisa funcionar sem sessão). Bloqueado também em `robots.txt`. Nunca no `sitemap.xml`.
Verificado que `/admin` sem sessão redireciona para `/admin/login` (nunca expõe conteúdo real a um
crawler não autenticado).

## 14. Core Web Vitals

Nenhuma mudança de arquitetura nesta fase — as fases anteriores já cobrem isso:

- **LCP**: `next/font` (Montserrat/Inter, auto-hospedadas, Fase 18/19) evita atraso de fonte;
  `three`/WebGL (Fase 3D/WebGL) isolado em chunk próprio via `next/dynamic({ssr:false})`, nunca no
  JS inicial; texto do Hero (candidato a LCP) é HTML puro, não depende de imagem/canvas.
- **CLS**: `next/image` com `width`/`height` explícitos onde usado; canvas WebGL sempre
  absolutamente posicionado dentro de um container com tamanho já definido por CSS (nunca
  redimensiona o layout ao montar).
- **INP**: GSAP/Lenis/Three.js já seguem os orçamentos de performance das fases anteriores
  (`gsap.quickTo`, RAF único do Lenis, pixel ratio limitado do WebGL) — nada bloqueia a thread
  principal por tempo suficiente para afetar interação.

Sem execução formal de Lighthouse nesta sessão (ferramenta não disponível no ambiente) — ver
pendências em `docs/IMPLEMENTATION-STAGE-27.md`.

## 15. Search Console (recomendação futura, não implementado)

Nenhum token de verificação foi inventado (briefing, Seção 61: "não inventar verification
token"). Quando o domínio de produção existir:

1. Definir `NEXT_PUBLIC_SITE_URL` (`.env.example`) com o domínio real.
2. Adicionar a propriedade no Google Search Console (verificação via DNS ou meta tag —
   `metadata.verification.google` em `app/layout.tsx`, com o token real fornecido pelo Google).
3. Submeter `sitemap.xml`.
4. Repetir o processo, se fizer sentido, para o Bing Webmaster Tools.

## 16. Google Business Profile / Local SEO

Não implementado — recomendação externa apenas (briefing, Seção 32: "documentar como recomendação
externa futura, não inventar integração"). A Upgrade não tem endereço/telefone públicos no
projeto hoje; se algum dia tiver atendimento presencial ou uma região de atuação clara, um perfil
no Google Business + `LocalBusiness`/`ProfessionalService` (com dados reais) passa a fazer
sentido — não antes disso.
