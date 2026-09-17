# IMPLEMENTATION STAGE 27 — SEO

> Ver `docs/SEO.md` para a explicação completa de cada decisão. Este documento é o resumo
> técnico: mudanças, páginas, decisões de indexação, schemas, performance e pendências.

## 1. Arquivos novos

- `lib/seo/siteConfig.ts` — `SITE_NAME`, `SITE_URL` (de `NEXT_PUBLIC_SITE_URL`, nunca um domínio
  inventado), `SITE_DESCRIPTION`, `SITE_TITLE`, `SITE_LOCALE`.
- `lib/seo/structuredData.ts` — `getOrganizationJsonLd()`, `getWebSiteJsonLd()`, `toJsonLd()`.
- `app/robots.ts`, `app/sitemap.ts` — geração programática (`MetadataRoute.Robots`/`.Sitemap`).
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` — gerados via `ImageResponse`
  (`next/og`) a partir de `public/logo-mark.png`, nenhum asset novo.
- `app/not-found.tsx` + `.module.css` — 404 institucional (header/footer reais, CTA de volta).
- Testes: `lib/seo/structuredData.test.ts`, `app/sitemap.test.ts`, `app/robots.test.ts` — 12
  testes novos.

## 2. Arquivos alterados

- `app/layout.tsx` — `metadataBase`, `title.default`/`title.template`, `robots` padrão,
  `openGraph`/`twitter` padrão.
- `app/page.tsx` — `metadata.alternates.canonical`, injeção dos dois `<script
  type="application/ld+json">`.
- `app/projetos/page.tsx`, `app/privacidade/page.tsx` — `metadata` (title/description/canonical).
- `app/builder/page.tsx` — `metadata.robots = { index: false, follow: true }`.
- `app/admin/(protected)/layout.tsx` — `metadata.robots = { index: false, follow: false }`.
- `app/admin/login/page.tsx` — mesma diretiva (rota fora do layout acima).
- `features/site/components/home/ProjectsTeaserSection.tsx` — `<Heading variant="h3" as="h2">`
  (hierarquia de heading — ver `docs/SEO.md`, Seção 4).
- `.env.example` — `NEXT_PUBLIC_SITE_URL` documentada.
- `app/favicon.ico` — **removido** (ícone padrão do `create-next-app`, nunca customizado).

## 3. Páginas — indexação

| Rota | Indexação |
| --- | --- |
| `/` | indexável |
| `/projetos` | indexável |
| `/privacidade` | indexável |
| `/builder` | `noindex, follow` |
| `/admin`, `/admin/leads/[id]`, `/admin/login` | `noindex, nofollow` |
| `/design-system`, `/builder/experiencia` | 404 real em produção (já existente; `noindex`
  automático do Next.js confirmado via `next start`) |
| 404 (qualquer rota) | `noindex` automático do Next.js |

## 4. Schemas implementados

`Organization` (com `makesOffer` dos 3 serviços reais) + `WebSite`, só na Home. Nenhum
`LocalBusiness`/`ProfessionalService` (sem endereço/telefone reais), nenhum `Service` schema
separado por página (evitado por excesso — Seção 25 do briefing).

## 5. Performance

Nenhuma mudança de arquitetura nesta fase — auditoria confirmou que LCP/CLS/INP já são cobertos
pelas fases anteriores (`next/font`, WebGL isolado em chunk `ssr:false`, Lenis com RAF único,
`next/image` com dimensões explícitas). Ver `docs/SEO.md`, Seção 14.

**Sem Lighthouse formal** — ferramenta não disponível no ambiente desta sessão (mesma limitação já
registrada na Fase 3D/WebGL).

## 6. Verificação manual

- `curl` no HTML puro do servidor (Home) confirmando que `<h1>`, os 3 pilares de serviço e o CTA
  principal existem sem executar nenhum JavaScript.
- `curl` de cada rota confirmando `<title>`, `<meta name="robots">`, `<link rel="canonical">`,
  Open Graph, Twitter Card, ícones — todos corretos por rota (ver tabela em `docs/SEO.md`, Seção
  2).
- `/robots.txt` e `/sitemap.xml` gerados corretamente, conteúdo validado.
- Build de produção real (`next build` + `next start`, não só `next dev`) confirmando que
  `/design-system` e `/builder/experiencia` retornam **404 de verdade** (status HTTP, não só uma
  mensagem de erro com status 200) com `noindex` automático — a checagem `NODE_ENV === "production"`
  dessas páginas (de fases anteriores) funciona exatamente como esperado no ambiente que realmente
  importa para SEO.
- `/admin` sem sessão confirmado redirecionando para `/admin/login` (nunca expõe conteúdo real a
  um crawler não autenticado).
- Os dois blocos `<script type="application/ld+json">` da Home validados como JSON bem-formado.

## 7. Problemas encontrados

- **Favicon nunca trocado** — `app/favicon.ico` era literalmente o ícone padrão do
  `create-next-app` (mesmo tamanho de arquivo do template, confirmado por hash) desde o início do
  projeto. Substituído por `app/icon.tsx` (gerado a partir do logo real).
- **Inconsistência de hierarquia de heading** — `ProjectsTeaserSection` usava `<h3>` sendo uma
  seção irmã de duas outras `<h2>` na Home. Corrigido sem alterar o visual (`as="h2"` mantendo
  `variant="h3"`).
- **`SITE_URL` sem domínio real** — nenhum domínio de produção existe no projeto ainda (confirmado
  via busca — nenhuma menção a um domínio real em nenhum lugar do código). `metadataBase`/sitemap/
  robots/structured data caem no fallback `http://localhost:3000` até `NEXT_PUBLIC_SITE_URL` ser
  definida — comportamento intencional e visível (nunca um domínio adivinhado silenciosamente).

## 8. Lint/typecheck/tests/build

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **571/571 passando** (eram 559 ao final da Fase 3D/WebGL; 12 novos nesta fase).
- **Build**: sucesso. Tabela de rotas cresceu de 10 para 15 (novas: `/_not-found`, `/apple-icon`,
  `/icon`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml` — todas geradas estaticamente).

## 9. Pendências para a Etapa 28

- Definir `NEXT_PUBLIC_SITE_URL` com o domínio real assim que ele existir — pré-requisito para
  `metadataBase`/sitemap/robots/OG apontarem para URLs corretas em produção.
- Google Search Console: adicionar propriedade e submeter sitemap quando o domínio real estiver
  no ar (nenhum token de verificação foi inventado — ver `docs/SEO.md`, Seção 15).
- Páginas de serviço individuais (`/servicos/...`) — avaliadas e adiadas por falta de conteúdo
  suficiente ainda (ver `docs/SEO.md`, Seção 11).
- Lighthouse formal (Performance/SEO/LCP/CLS/INP) quando a ferramenta estiver disponível.
- Dados estruturados de cases (`Article`/`CreativeWork` por projeto) — só quando cases reais
  existirem (mesma pendência já registrada na Fase 3D/WebGL para o shader de transição).
