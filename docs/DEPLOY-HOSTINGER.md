# Publicar na Hostinger (Node.js Web App)

Registro do que foi diagnosticado e validado. Origem: o deploy falhou com (1) dependências que pedem Node
mais novo que o 20, (2) o SWC do Next não carregar por falta de `GLIBC_2.29` e (3) `ERR_MODULE_NOT_FOUND`
ao carregar `next.config.ts`.

## Configuração recomendada no painel

| Item | Valor |
|---|---|
| Versão do Node | **22 ou superior** (o site declara `engines.node >= 22`) |
| Comando de build | `npm run build:webpack` |
| Comando de início | `npm run start` |
| Variáveis de ambiente | as mesmas da Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (opcionais: `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_RESPONSE_TIME`) |

O servidor precisa de acesso de saída ao registro do npm durante o build (veja "SWC" abaixo).

## Por que cada ajuste existe

### 1. `next.config.ts` → `next.config.mjs`
O Next compila um `next.config.ts` com o SWC **toda vez que inicia** (`next build` e `next start`). Sem
SWC, até o `next start` cai com `Failed to load next.config.ts … Failed to load SWC binary`. O `.mjs` é lido
direto pelo Node. As opções são idênticas; o tipo continua checado pelo `tsc` via JSDoc.
**Reproduzido localmente:** com o binário nativo do SWC corrompido, o `.ts` antigo não iniciava e o `.mjs`
respondia 200 com todos os cabeçalhos de segurança.

### 2. SWC e `GLIBC_2.29`
O binário nativo do Next 16.3.5 (`@next/swc-linux-x64-gnu`) usa símbolos de glibc até a **2.30** (medido no
arquivo publicado). Em um servidor com glibc menor, ele não carrega — isso **não é corrigível por
`package.json`**, é do sistema operacional. Nesse caso o Next cai sozinho para o SWC em WebAssembly
(`@next/swc-wasm-nodejs`, baixado do npm no primeiro uso). O WASM **não suporta o Turbopack**, que é o padrão
do `next build` no Next 16 — por isso o build precisa ser `next build --webpack` (`npm run build:webpack`).
O resultado é o mesmo site (mesmas rotas, mesmo comportamento; nada virou estático).

Se o servidor tiver glibc ≥ 2.30, `npm run build` (Turbopack) continua funcionando e é o que a Vercel usa.

### 3. Node 20 e o Supabase
`@supabase/supabase-js` (e seus pacotes) exigem Node >= 22. No Node 20 o `createClient` **lança erro**
(“Node.js 20 detected without native WebSocket support”). Efeito: as páginas públicas abrem, mas o envio do
lead, o rastreio interno e o `/admin` quebram. Fixar versões antigas do Supabase não resolve (testado com a
2.109.0); a saída é rodar em Node 22+.
As dependências de **desenvolvimento** (`jsdom` 30 etc.) também pedem Node mais novo, mas só geram avisos de
engine no `npm install`; não afetam build nem execução.

## O que foi validado localmente (Windows, Node 24 e Node 20.19.5)
- `tsc`, `eslint`, 693 testes unitários e 62 de navegador passam.
- `npm run build` (Turbopack) e `npm run build:webpack` passam com o SWC nativo.
- Build com o SWC nativo **quebrado de propósito**: cai para WASM e termina com `--webpack`; com Turbopack
  falha com a mensagem pedindo `--webpack`.
- Build + `next start` em Node 20.19.5: `/`, `/builder`, `/projetos`, `/privacidade` e `/sitemap.xml` = 200,
  com CSP e `X-Frame-Options`.

## O que só o servidor da Hostinger confirma
- A glibc real do servidor e se o binário nativo carrega (se carregar, nem precisa do WASM).
- Acesso de saída ao npm para baixar o SWC WASM, e gravação no diretório de cache.
- Se o painel permite escolher Node 22+.
- Memória disponível para o build com webpack (mais pesada que a do Turbopack).
