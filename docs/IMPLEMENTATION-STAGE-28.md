# IMPLEMENTATION STAGE 28 — LGPD e Privacidade

> Ver `docs/PRIVACY-LGPD.md` (racional completo, aviso de revisão jurídica) e
> `docs/PRIVACY-DATA-MAP.md` (inventário dado a dado) para os documentos principais desta fase.
> Este documento é o resumo técnico: mudanças, componentes, testes, performance e pendências.

## 1. Descoberta inicial

A auditoria encontrou que a Fase 17 (Analytics) já havia construído o MECANISMO de consentimento
(`lib/analytics/consent.ts`, `getConsent`/`setConsent`, gate em `trackEvent.ts` antes de cada
provider) e a captura de sessão/UTM (`lib/analytics/session.ts`) — deliberadamente sem UI de
banner, com uma nota explícita no código apontando para esta fase ("LGPD será aprofundada na
Etapa 28"). O trabalho desta fase, portanto, não foi "criar do zero", e sim: construir a UI real,
persistir a decisão, endurecer o padrão para privacy-by-default, e produzir toda a documentação de
conformidade que ainda não existia.

## 2. Arquivos novos

- `lib/privacy/privacyConfig.ts` — `PRIVACY_POLICY_VERSION`.
- `lib/privacy/consentStorage.ts` (+ implícito nos testes de `consent.ts`) — persistência
  versionada em `localStorage`.
- `features/privacy/state/useConsent.ts`, `useHasConsentDecision.ts`,
  `consentBannerVisibility.ts`, `useConsentBannerVisible.ts` — hooks reativos
  (`useSyncExternalStore`) e reabertura manual do banner.
- `features/privacy/components/ConsentBanner.tsx` + `.module.css` — a UI real (banner + painel
  "Configurar").
- `features/privacy/components/OpenConsentPreferencesButton.tsx` — fronteira mínima de Client
  Component para o link do footer (`SiteFooter.tsx` é Server Component).
- `features/privacy/components/PrivacyPreferencesButton.tsx` — versão estilizada (Design System
  `Button`) usada na própria página de Privacidade.
- Testes: `lib/analytics/consent.test.ts` (reescrito), `lib/analytics/trackEvent.test.ts`
  (reescrito), `features/privacy/state/consentBannerVisibility.test.ts`,
  `features/privacy/state/useConsent.test.tsx`, `features/privacy/components/ConsentBanner.test.tsx`
  — 27 testes novos/reescritos no total desta fase.

## 3. Arquivos alterados

- `lib/analytics/consent.ts` — padrão mudou de `{analytics:true, marketing:false}` para
  `{analytics:false, marketing:false}`; ganhou persistência, `CONSENT_CHANGE_EVENT`,
  `hasStoredConsentDecision()`, `withdrawConsent()`.
- `app/layout.tsx` — monta `<ConsentBanner />`.
- `features/site/components/SiteFooter.tsx` — link "Preferências de privacidade" (via
  `OpenConsentPreferencesButton`).
- `features/site/components/SiteFooter.module.css` — reset de `<button>` na classe `.link`
  (compartilhada com os `<a>` reais).
- `app/privacidade/page.tsx` + `.module.css` — política real, substituindo o placeholder da Etapa
  8 (12 seções — ver Seção 5 abaixo).
- `lib/repositories/leads.ts`, `leadNotes.ts` — logs de erro reduzidos a `code`/`message` (nunca o
  objeto de erro inteiro) nos dois pontos que gravam dado pessoal.

## 4. Consent Manager

Três categorias (essencial/analytics/marketing), padrão restritivo, persistido e versionado — ver
`docs/PRIVACY-LGPD.md`, Seção 8, para a arquitetura completa. Banner: barra fixa no rodapé (nunca
modal de tela cheia), três ações do mesmo tamanho ("Recusar não essenciais" tão acessível quanto
"Aceitar todos"), painel "Configurar" com checkboxes nunca pré-marcados.

## 5. Política de Privacidade

12 seções reais (`h2` cada): quem trata os dados, quais dados coletamos, para que usamos, base
legal, cookies/armazenamento local (com botão para reabrir as preferências), com quem
compartilhamos, retenção, segurança, decisões automatizadas, direitos do titular, como exercer
esses direitos, alterações da política. Nenhum CNPJ/endereço/DPO inventado — ver
`docs/PRIVACY-LGPD.md`, Seções 11-12, para as pendências/decisões correspondentes.

## 6. Integrações (analytics/marketing)

Nenhuma mudança de comportamento em `ga4.ts`/`metaPixel.ts` — os dois já eram gated por
`trackEvent.ts` desde a Fase 17. Confirmado (teste + Playwright) que, sem decisão de
consentimento, `window.gtag`/`window.fbq` nunca são definidos — os scripts de terceiro nunca
chegam a carregar.

## 7. Problemas encontrados

- **Bug real de `useSyncExternalStore`**: a primeira versão de `useConsent.ts` tinha
  `getServerSnapshot()` retornando um objeto literal novo a cada chamada — React lança "The
  result of getServerSnapshot should be cached to avoid an infinite loop". Reproduzido de verdade
  via Playwright (não um erro só em teste), corrigido com uma constante de módulo. Ver
  `docs/DECISIONS.md`.
- **Server Component + `onClick` direto**: a primeira versão de `SiteFooter.tsx` (Server
  Component) tinha um `<button onClick={...}>` inline — quebra o build ("Event handlers cannot be
  passed to Client Component props"), descoberto rodando `next build` (não aparece em `next dev`
  sem prerender). Corrigido extraindo `OpenConsentPreferencesButton` como fronteira de Client
  Component dedicada. Ver `docs/DECISIONS.md`.
- **Logs de erro com potencial de PII**: `createLead`/`addLeadNote` logavam o objeto de erro do
  Postgres inteiro — reduzido a `code`/`message`.

## 8. Testes

`npx vitest run` — ver `docs/PRIVACY-LGPD.md`, Seção 32, para a lista completa. Resumo: 27 testes
novos/reescritos, verificação manual via Playwright cobrindo os cenários da Seção 77 do briefing
(novo usuário, aceitar todos, recusar, configurar só analytics, alterar depois, reload, teclado,
360px, reduced motion).

## 9. Performance

Nenhum impacto novo relevante: o banner é um componente leve (sem GSAP/WebGL), montado
diretamente (não via `next/dynamic`) porque precisa aparecer imediatamente no primeiro carregamento
para quem ainda não decidiu — CSS puro para a animação de entrada (reaproveitando a regra global
de `prefers-reduced-motion` de `styles/tokens.css`).

## 10. Revisão técnica

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **593/593 passando** (eram 571 ao final da Fase SEO; 27 novos/reescritos nesta
  fase, líquido +22 no total do projeto após reescrever 2 arquivos existentes).
- **Build**: sucesso; tabela de rotas inalterada.

## 11. Pendências para a Etapa 29

- Função administrativa de exclusão/anonimização de lead (`docs/PRIVACY-LGPD.md`, Seção 14) —
  conceito preparado, implementação adiada até haver um pedido real ou uma decisão de negócio
  sobre excluir vs. anonimizar.
- Função administrativa de exportação/portabilidade (`docs/PRIVACY-LGPD.md`, Seção 15).
- Confirmar e documentar região/política de backup do projeto Supabase (`docs/PRIVACY-LGPD.md`,
  Seção 18) — configuração fora deste repositório.
- Adicionar CNPJ/endereço registrado da Upgrade à política pública assim que existirem
  (`docs/PRIVACY-LGPD.md`, Seção 11).
- Rotina de expurgo/retenção automática para leads antigos e eventos de analytics, se/quando fizer
  sentido — `lib/privacy/privacyConfig.ts` é o lugar natural para os prazos, quando existirem.
- Revisão jurídica profissional da Política de Privacidade e das bases legais aqui documentadas
  (aviso já fixado no topo de `docs/PRIVACY-LGPD.md`).
