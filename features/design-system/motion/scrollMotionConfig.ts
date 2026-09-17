/**
 * Configuração específica de scroll storytelling (Fase ScrollTrigger e Storytelling —
 * `docs/SCROLL-STORYTELLING.md`). Reaproveita `DURATION`/`EASE`/`STAGGER`/`DISTANCE` de
 * `motionConfig.ts` (a base de motion do projeto, Fase GSAP e Transições) — aqui só o que é
 * específico de scroll: breakpoint do `gsap.matchMedia()` (Seção 28 do briefing) e o fator de
 * suavização do scrub (Seção 9: "scrub suave").
 */

/** Mesmo breakpoint de `getSceneDistance()` (`motionConfig.ts`) e do CSS da Home — um só limite
 * "mobile" em todo o projeto, nunca um segundo número solto por arquivo. */
export const DESKTOP_SCROLL_QUERY = "(min-width: 641px)";
export const MOBILE_SCROLL_QUERY = "(max-width: 640px)";

/**
 * Fator de scrub — nunca `true` (resposta rígida e instantânea ao pixel do scroll). Um número
 * introduz suavização: o GSAP persegue a posição alvo com esse tempo de atraso (em segundos), o
 * que evita a sensação "presa à roda do mouse" que o briefing pede para evitar (Seção 9).
 */
export const SCRUB = {
  /** Movimentos de acompanhamento simples (parallax, fade de saída do Hero). */
  smooth: 0.6,
  /** Sequências que precisam responder um pouco mais perto do scroll real (cards no pin). */
  responsive: 0.35,
} as const;

/** Escala do grafismo do Hero ao rolar (Seção 4: "logo/símbolo muda de escala"). */
export const HERO_GRAPHIC_SCALE = 1.15;
