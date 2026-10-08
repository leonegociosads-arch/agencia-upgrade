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
