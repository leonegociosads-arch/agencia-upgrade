"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/trackEvent";

/**
 * Dispara `page_view` (Fase 17) — montado uma única vez em `app/layout.tsx`. Usa só `usePathname`
 * (não `useSearchParams`): a captura de UTM/referrer do first-touch já acontece dentro de
 * `lib/analytics/session.ts`, lendo `window.location.search` diretamente no momento em que a
 * sessão é criada — não precisa de um valor reativo de query string aqui. Isso evita a exigência
 * de `<Suspense>` que `useSearchParams` teria numa página estática (ver
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`,
 * "Prerendering"), então este componente pode ser montado direto em `app/layout.tsx` sem boundary
 * nenhum.
 *
 * Um único `useEffect` com `pathname` na lista de dependências cobre "página inicial" (roda uma
 * vez ao montar, com o pathname inicial) E "mudança de rota relevante" (roda de novo quando
 * `pathname` muda) sem duplicar o `page_view` do carregamento inicial nem precisar de dois efeitos
 * separados — exatamente o pedido do briefing ("garantir page_view em mudanças relevantes de
 * rota... não duplicar no carregamento inicial").
 */
export default function AnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
