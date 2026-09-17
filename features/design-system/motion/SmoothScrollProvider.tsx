"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Lenis from "lenis";
import { getScrollTrigger } from "./scrollTrigger";
import { useReducedMotion } from "./useReducedMotion";
import { LENIS_OPTIONS, isSmoothScrollRoute } from "./smoothScrollConfig";

const SmoothScrollContext = createContext<Lenis | null>(null);

/** Instância ativa, se houver — só para consumidores fora da árvore React (nenhum hoje; ver
 * `docs/SMOOTH-SCROLL.md`, Seção "API preparada"). `useSmoothScroll()` é o caminho normal. */
export function useSmoothScroll(): Lenis | null {
  return useContext(SmoothScrollContext);
}

/**
 * Smooth scroll (Fase Smooth Scroll) — Lenis instanciado uma única vez por rota elegível
 * (`isSmoothScrollRoute`, Seção 3 do briefing: só Home/páginas institucionais; Builder e Admin
 * continuam 100% scroll nativo, nunca dependem deste provider para funcionar).
 *
 * Desabilitado por completo (nem instancia Lenis) quando `prefers-reduced-motion: reduce`
 * (Seções 17/64) — mesmo padrão de "desligar de vez", nunca "suavizar menos", já usado em
 * `useFinePointer`/`useTilt`/`CustomCursor` na Fase Microinterações.
 *
 * RAF único (Seções 6-8): nenhum loop próprio do Lenis — `lenis.raf` é chamado a partir do
 * `gsap.ticker`, e `lenis.on("scroll", ScrollTrigger.update)` garante que pins/scrub do
 * ScrollTrigger leiam a posição intermediária suavizada a cada frame, não só a posição final.
 *
 * Fallback (Seção 54): se a criação do Lenis lançar por qualquer motivo, o `catch` deixa a
 * instância como `null` — o scroll nativo do navegador nunca depende deste componente para
 * existir, só para ficar mais suave.
 *
 * Hash da URL (Seção 20) NÃO é tratado aqui de propósito: o Next.js 16 já resolve `#id` no
 * carregamento (e em navegação por `<Link>`) via `scrollIntoView()` nativo — ver
 * `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`. Duplicar essa
 * lógica aqui arriscaria os dois mecanismos brigarem pelo mesmo scroll (o "atraso"/"salto" que a
 * Seção 57 pede para nunca acontecer); `scroll-padding-top` em `app/globals.css` já compensa o
 * header sticky para esse caso nativo (Seção 19). `scrollToSection.ts` continua disponível para
 * um scroll programático que não passe por `<Link>` (ex.: um futuro botão "voltar ao topo").
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [activeInstance, setActiveInstance] = useState<Lenis | null>(null);

  const enabled = isSmoothScrollRoute(pathname) && !reducedMotion;
  // Derivado, nunca via `setState` numa rota desabilitada: não há nenhum sistema externo para
  // sincronizar nesse caso (Lenis nem chega a existir), então nada aqui pertence a um efeito —
  // só a instância REAL (criada/destruída, Seções 6/9) precisa de um efeito de verdade.
  const lenis = enabled ? activeInstance : null;

  useEffect(() => {
    if (!enabled) return;

    let instance: Lenis | null = null;
    try {
      instance = new Lenis(LENIS_OPTIONS);
    } catch {
      return;
    }

    const ScrollTrigger = getScrollTrigger();
    instance.on("scroll", ScrollTrigger.update);

    function onTick(time: number) {
      instance?.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    // Evita o "salto" de lagSmoothing do GSAP brigando com a interpolação própria do Lenis
    // (Seção 8: "evitar... GSAP ticker duplicado" — aqui os dois convivem, mas sem essa
    // compensação de atraso, que é para quando o GSAP É o próprio dono do RAF).
    gsap.ticker.lagSmoothing(0);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- captura um handle de sistema externo recém-criado (a instância real do Lenis), não um cálculo derivado redundante; mesmo caso de `Drawer.tsx` (Fase GSAP e Transições) capturando `document.activeElement`.
    setActiveInstance(instance);

    // Refresh do ScrollTrigger quando fontes/imagens terminam de carregar (Seção 25) — resize já
    // é tratado automaticamente pelo próprio ScrollTrigger.
    function refresh() {
      ScrollTrigger.refresh();
    }
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(1000, 33);
      instance?.destroy();
      setActiveInstance(null);
      ScrollTrigger.refresh();
    };
  }, [enabled]);

  return <SmoothScrollContext.Provider value={lenis}>{children}</SmoothScrollContext.Provider>;
}
