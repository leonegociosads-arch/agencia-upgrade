# Segurança das dependências — o que foi encontrado e como acompanhar

Rodada de 08/10/2026. Origem: painel da Hostinger (25 alertas) e PR automático #1 do `hostinger[bot]`
(só trocava `next` 16.3.5 → 16.3.8 no `package.json`, sem atualizar o lockfile). Aproveitamos a mesma versão
do Next e completamos o resto. **Esse PR fica redundante: pode ser fechado sem mesclar.**

## Antes e depois (`npm audit`)

| | Total | Críticos | Altos | Moderados |
|---|---|---|---|---|
| Antes (tudo) | 15 | 3 | 9 | 3 |
| Antes (só produção) | 3 | 1 | 2 | 0 |
| **Depois (tudo)** | **5** | 0 | 5 | 0 |
| **Depois (só produção)** | **0** | 0 | 0 | 0 |

A Hostinger conta 25 porque soma cada aviso em cada caminho; o `npm audit` agrupa por pacote.
Os 5 que sobram são **uma única causa**: o pacote `braces` (aviso GHSA-vfj7-8cjw-p6xm) **ainda não tem versão
corrigida publicada** por quem o mantém. Vem só de `eslint-config-next → @next/eslint-plugin-next → fast-glob →
micromatch → braces`, é ferramenta de lint (não vai para o servidor nem para o navegador) e só reage a padrões
de arquivo escritos pelo próprio plugin. Mitigação: nenhuma necessária hoje; o Dependabot abre um PR quando
sair a correção.

## O que mudou

| Pacote | De → Para | Onde roda | Avisos |
|---|---|---|---|
| `next` + `eslint-config-next` | 16.3.5 → 16.3.8 (exato) | servidor | 7 avisos do Next |
| `sharp` (do Next) | 0.35.4 → 0.35.5 | servidor (imagens) | GHSA-wq5f-xc86-pv6w |
| `source-map-js` | 1.2.1 → 1.2.2 | build | GHSA-68fv-2mgg-jv7q |
| `brace-expansion` | 1.1.18 → 1.1.21 (e 5.0.12) | lint/build | 3 avisos |
| `vitest` | 2.1.9 → 4.1.11 | só testes | 2 do Vitest + tinypool (saiu) |
| `vite` (novo, explícito) | 5.4.21 → 7.3.7 | só testes | 3 do Vite + esbuild |

Vitest 4 em vez do 5: resolve todos os avisos e é um salto menor (o 5 exige Node ≥ 22.12 e é recém-lançado).
O `vite` ficou explícito para o Vitest não puxar o Vite 8 (outro compilador, mais novo). Nenhum teste foi
removido; os 693 continuam passando. Não foi usado `npm audit fix --force` nem `overrides`.

## Meu projeto estava exposto?

Evidência pelo código do projeto:

- **Next / `next/og` (RCE, crítico):** o risco exige colocar texto vindo de um visitante dentro de um SVG gerado
  por `ImageResponse`. Os três usos (`app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`) só usam a
  logo e um texto fixo, sem `searchParams`, `params` nem `request`. **Não exposto.**
- **Next / SSRF no otimizador de imagens:** só vale se existir `images.remotePatterns`. O `next.config.mjs` não tem.
  **Não exposto.**
- **Next / cache do Pages Router, rota "pega-tudo" na raiz, `use cache`:** o projeto só usa App Router, não tem
  `app/[...slug]`, nem `use cache`, nem Draft Mode. **Não exposto.**
- **Next / metadados com `dynamicParams`:** as imagens de metadados estão na raiz, sem segmento dinâmico. **Não exposto.**
- **Next / servidor de desenvolvimento:** só afeta `next dev` (máquina de quem desenvolve), não a produção.
- **`sharp` (librsvg):** só processa SVG; o otimizador do Next não otimiza SVG por padrão e o site só serve
  imagens próprias. **Improvável**, mas corrigido.
- **Vitest / Vite / esbuild / tinypool:** só existem nos testes. As falhas exigem interface do Vitest ligada, servidor
  exposto na rede ou código malicioso já dentro do projeto. O projeto não usa `@vitest/ui` nem `--host`.
  **Não exposto**, mas atualizados (uma máquina de desenvolvimento também é um alvo).
- **`source-map-js`, `brace-expansion`, `braces`:** só processam arquivos do próprio projeto, no build/lint.

Incerteza: não temos como saber se alguém explorou algo no passado; não há indício disso no repositório.

## Rotina no GitHub

- `.github/workflows/ci.yml`: a cada push/PR na `master` roda lint, testes, build e checagem de tipos; e a
  auditoria de segurança (também toda segunda-feira, sem precisar de commit). Produção: aviso **alto ou crítico**
  reprova. Todas as dependências: só **crítico** reprova (o `braces` hoje é alto e sem correção).
- `.github/dependabot.yml`: abre PRs semanais para atualizar dependências (Next e lint juntos; ferramentas de dev
  agrupadas) e mensais para as Actions.
- Para receber PRs de **correção de segurança** (diferentes dos semanais), ligue em GitHub → Settings → Advanced
  Security: *Dependency graph*, *Dependabot alerts* e *Dependabot security updates*.

Limites: o `npm audit` só conhece falhas **já publicadas**; não vê erros no código do projeto, configuração ruim,
senhas vazadas ou falhas do servidor/da Hostinger. Um PR do Dependabot nunca deve ser aceito sem o CI verde e
uma olhada nas mudanças. O CI não roda os testes de navegador (Playwright), só os de unidade e o build.

## Como evitar repetir

- Não deixar o `package-lock.json` desatualizado (PRs automáticos que só mexem no `package.json` deixam o
  lockfile para trás — sempre rodar `npm install` e commitar os dois).
- Rodar `npm audit --omit=dev` antes de publicar; olhar primeiro o que roda em produção.
- Aceitar os PRs do Dependabot com frequência: atualizações pequenas e constantes dão menos trabalho que um monte de uma vez.
- Nunca usar `npm audit fix --force` sem entender o que muda.


---

## Rodada de 24/10/2026 (alertas de 22 e 23/10)

Origem: painel da Hostinger (6 alertas na captura de 23/10 às 17:03; a lista da API já tinha 9 depois, com os 3 do
`undici`, publicados na noite de 23/10). O site publicado era o commit `36b7df7` (Next 16.3.8). A correção foi feita
em cima dele, sem `overrides`, sem `npm audit fix --force`, sem tocar em teste algum e **sem usar o "Ajustar tudo"
da Hostinger** (o ajuste automático abre um PR que só mexe no `package.json`, como o PR #1 de 08/10 descrito acima).

### O que mudou

| Pacote | De → Para | Onde roda | Avisos que fecha |
|---|---|---|---|
| `next` + `eslint-config-next` | 16.3.8 → 16.4.2 (exato, como o projeto já fixava) | servidor | GHSA-673q-mjm6-r5xr (crítico), GHSA-2464-fhr4-w9xw (crítico), GHSA-p3m5-59mp-jv5r / CVE-2026-94482 (alto) |
| `zod` | 4.6.5 → ^4.6.7 | servidor | GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404 (alto) |
| `vitest` e a família `@vitest/*` | 4.1.11 → ^4.1.12 | só testes | `@vitest/mocker`: GHSA-qxg6-89mg-rqv8 e GHSA-xp26-3454-mjgp (moderados) |
| `undici` (do `jsdom`; só lockfile) | 8.10.2 → 8.12.3 | só testes | GHSA-xjj6-f33q-929c (alto), GHSA-4qv8-2p9j-2685 e GHSA-f72v-6w45-q472 (moderados) |

O lockfile mudou em 21 pacotes (mais o `undici`, em commit separado) e nenhum entrou ou saiu. O `sharp` ficou em 0.35.5 (já
era a versão corrigida). O `@vitest/mocker` não ganhou dependência direta nem `override`: vem do `vitest`, e o 4.1.12 já exige
o mocker 4.1.12. O `undici` também se resolve só no lockfile, porque o `jsdom` aceita `^8.9.0`.

### Por que essas versões
- **Next 16.4.2**: a 16.4.1 é a primeira corrigida. A 16.4.2 só traz correções do Turbopack e da documentação (o build de
  produção aqui é Webpack) e já tinha mais de 8 dias. A 16.4.3 (publicada em 23/10) só acrescenta correções de estabilidade
  e nenhuma de segurança; pode ser adotada depois.
- **Zod 4.6.7**: conteúdo idêntico ao do 4.6.6 (diferem só no número da versão). Foi republicado depois do aviso dos
  mantenedores sobre commits maliciosos que **nunca chegaram ao npm**.
- **Vitest 4.1.12**: a última da linha 4; o 5 é salto de versão maior (o PR #6 do Dependabot) e não é necessário.
- Assinaturas do registro conferidas com `npm audit signatures` na árvore dos pacotes alterados: 375 pacotes com assinatura
  verificada e 97 com proveniência verificada. (Na árvore inteira do projeto o comando para num 404 do registro em
  `whatwg-url@17.1.1`, que já estava no projeto antes; não é desta rodada.)

### Meu projeto estava exposto?
- **GHSA-673q (RCE em `use cache`)**: **não**. O projeto não tem `use cache` nem Cache Components.
- **GHSA-2464 (RCE no otimizador de imagens, com SVG)**: **improvável**. O `sharp` já era 0.35.5, a correção indicada pelo
  próprio aviso; nenhum `src` do `next/image` aponta para SVG (o único `.svg` do projeto é um fundo de CSS); não há `remotePatterns`; e a produção
  responde 400 a SVG (local ou remoto) no `/_next/image`.
- **GHSA-p3m5 (negação de serviço em Server Actions)**: **sim, estava exposto**. O site tem 6 Server Actions, 3 delas
  abertas a visitantes (envio de lead, registro de evento e login do admin). O efeito é só disponibilidade (uso excessivo de CPU). Sem contorno além de atualizar.
- **Zod (memória em coleções grandes)**: **exposto em tese**. O envio de lead é público e valida listas e mapas. O schema
  já tem `.max()`, mas, segundo o aviso, o zod 4.6.5 só conferia o limite depois de processar cada elemento. O limite
  padrão de 1 MB das Server Actions contém o pior caso.
- **Vitest / `@vitest/mocker`**: **não**. Só atinge quem expõe o servidor de desenvolvimento do Vite com o plugin do mocker;
  o projeto roda `vitest run`, sem servidor.
- **`undici`**: **não**. Só existe nos testes (via `jsdom`) e exige que um servidor malicioso responda a um `fetch` do teste.

### Resultado e testes (24/10/2026)

| | Antes (`36b7df7`) | Depois |
|---|---|---|
| `npm audit` (tudo) | 5 pacotes: 1 crítico, 2 altos, 2 moderados | **0** |
| `npm audit --omit=dev` (o que vai ao servidor) | 2 pacotes: `next` crítico e `zod` alto | **0** |
| Lint, tipos | ok | ok |
| Testes de unidade (Vitest) | — | 703 passando em 123 arquivos |
| Build (`next build --webpack`) | 15 rotas | as mesmas 15 rotas, sem aviso novo |
| Navegador (Playwright, Chromium, servidor de desenvolvimento, backend de teste em memória) | — | **62 de 62** |

Nenhum dado real foi gravado: o Playwright usa `E2E_TEST_MODE`, que troca o Supabase por uma memória descartável, e a
cópia de trabalho não tinha nenhum `.env` com credencial.

**Limite do teste de navegador:** contra o **build de produção** (`next start`) com esse mesmo backend em memória, o
teste "alterar o status persiste (sobrevive a um refresh)" falha e dois outros não rodam (59 passam, 1 falha, 2 não rodam).
O **commit publicado (Next 16.3.8) dá exatamente o mesmo resultado** nas mesmas condições. Portanto não é efeito desta
atualização: é limitação de usar a memória de teste com o build de produção, e por isso o projeto roda o Playwright no
servidor de desenvolvimento.

### Pendências conhecidas
- A CDN da Hostinger entrega as páginas com `s-maxage=31536000` (1 ano) e pode servir HTML antigo depois de um deploy.
  A correção já existe no commit local `1ad3b7e` (ISR de 5 min), que **não** foi publicado nesta rodada.
- PRs do Dependabot abertos que ficam redundantes com esta rodada: #8 (grupo `next`) e #6 (vitest 5, salto de versão maior).
