# IMPLEMENTATION STAGE 19 — UI Final do Site da Agência Upgrade

> Fase 19 do roadmap. Aplica o Design System (Fase 18) a todas as interfaces reais do projeto —
> Home, Builder completo, formulário/success/erro e admin. Sem GSAP/ScrollTrigger/Lenis/motion
> avançado (fases seguintes). Ver `docs/UI-FINAL.md` para o detalhamento visual completo.

---

## 1. Páginas alteradas

`app/page.tsx` (Home — reescrita completa), `app/projetos/page.tsx`, `app/privacidade/page.tsx`
(header/footer + visual aplicado, conteúdo placeholder mantido), `app/layout.tsx` (fontes Geist
removidas — sem mais nenhum uso —, `lang="pt-BR"`, `<title>`/`<meta description>` reais),
`app/globals.css` (tema escuro agora é o tema real do `body`, não só tokens disponíveis).

Novas: `app/design-system/` (Fase 18, inalterada), nenhuma rota nova criada nesta fase além das já
existentes.

## 2. Componentes alterados

**Builder**: `ServiceSelector`, `QuestionRenderer` (+ `QuestionOptions` interno), `ServiceComplete`,
`EmptyUpgradeState`, `RemoveServiceDialog`, `MyUpgrade`, `MyUpgradeItem`, `ProjectReview`,
`ProjectReviewService`, `BuilderNavigation`, `BuilderShell` (novo wrapper de drawer para o Meu
Upgrade).

**Lead**: `LeadField` (reescrito para usar `FormField`/`Input` do Design System), `LeadForm`,
`SubmissionSuccess` (copy do aviso desatualizado corrigida), `SubmissionError`.

**Admin**: `LoginForm`, `LeadsFilters`, `NoteForm`, `StatusSelect`, `EmptyState`, `ErrorState`,
`DashboardSummary`, `AnalyticsOverview`, `LeadsList`, `Pagination`, `NotesList`,
`StatusHistoryList`, `LeadDetail` (só CSS), `app/admin/(protected)/layout.tsx`.

Todos os arquivos `.module.css` correspondentes foram reescritos para usar exclusivamente tokens
`--ds-*` (Fase 18) — nenhum hex solto ficou nos componentes tocados.

## 3. Componentes novos

- `features/site/components/SiteHeader.tsx` (+ `.module.css`, + teste) — header institucional com
  navegação completa e menu mobile (hambúrguer).
- `features/site/components/SiteFooter.tsx` (+ `.module.css`, + teste) — footer enxuto.
- `features/design-system/components/LinkButton.tsx` (+ teste) — mesmo visual do `Button`
  (reaproveita `Button.module.css`), mas navega (`next/link`) em vez de disparar uma ação; usado
  para os CTAs "Monte seu Upgrade"/"Ver projetos" que são links de verdade.

## 4. Decisões visuais

Registradas formalmente em `docs/DECISIONS.md`, Fase 19 — resumo: tema escuro único (nunca dois
temas completos), placeholder geométrico para a logo (nenhum arquivo de logo real existe no
projeto — pendência para o usuário fornecer), badge "Seu Upgrade" adicionado ao Resumo sem trocar o
título já testado, menu mobile criado (gap descoberto durante a revisão visual manual desta
própria fase — os links de navegação simplesmente desapareciam abaixo de 768px), consolidação
`LeadField`→`FormField`/`Input` do Design System, `data-testid="my-upgrade-panel"` (o cabeçalho do
drawer ganhou uma estrutura própria, então o antigo `heading.closest("div")` dos testes deixou de
alcançar o painel inteiro).

## 5. Testes

**7 testes novos** (425 no total do projeto — eram 418 ao final da Fase 18): `SiteHeader.test.tsx`
(4, incluindo o menu mobile), `SiteFooter.test.tsx` (1), `LinkButton.test.tsx` (2). Os dois testes
que usavam `heading.closest("div")` para escopar o painel do Meu Upgrade
(`MyUpgrade.test.tsx`, `ProjectReview.test.tsx`) foram ajustados para `getByTestId`, pela razão
descrita acima — nenhuma cobertura foi perdida, só a forma de encontrar o mesmo elemento.

**Nenhum teste funcional existente foi removido ou enfraquecido** — todos os ~410 testes das fases
anteriores continuam passando sem alteração de asserção (só 2 ajustes de seletor, descritos acima).

## 6. Revisão técnica

- **Lint**: 0 erros.
- **Typecheck**: 0 erros.
- **Testes**: 425/425 passando.
- **Build**: sucesso; todas as rotas geram corretamente (`/design-system` continua 404 em
  produção, confirmado).

## 7. Teste visual manual

Capturado via Playwright em 6 viewports (1920/1440/1366 desktop, 360/414 mobile, 820 tablet) para
a Home, e em desktop (1440) + mobile (360) para o fluxo completo do Builder (seletor → pergunta →
conclusão → Meu Upgrade → resumo → formulário → success) e para o login do admin — nenhum overflow
horizontal, nenhum erro de JavaScript em nenhuma combinação. Revisão visual das capturas confirmou:
hierarquia tipográfica funcionando, contraste correto (inclusive checado via computed style, não só
visualmente), o drawer do Meu Upgrade funcionando como painel lateral no desktop e bottom sheet no
mobile, e o menu mobile do header abrindo/fechando corretamente. O dashboard/lista/detalhe do admin
foram restilizados com os mesmos tokens mas não puderam ser verificados visualmente ao vivo nesta
sessão (exige login como admin, sem credenciais disponíveis) — mesma limitação já registrada nas
Fases 16/17.

## 8. Pendências para responsividade/motion (próxima etapa)

- Logo oficial (arquivo real) — ver `docs/UI-FINAL.md`, Seção 2.
- GSAP, ScrollTrigger, Lenis, animações de entrada/scroll, microinterações reais — nenhuma foi
  implementada nesta fase (só as transições CSS pequenas já previstas: hover, focus, opacity).
- Biblioteca de ícones consistente (hoje só texto/CSS: ✓, ×, setas).
- Verificação visual ao vivo do admin (dashboard/lista/detalhe) com uma sessão autenticada real.
- CTA de WhatsApp no Success, se algum dia existir um número da própria Upgrade configurado.
