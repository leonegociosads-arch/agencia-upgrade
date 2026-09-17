/**
 * Configuração central de motion para GSAP (Fase GSAP e Transições — `docs/GSAP-TRANSITIONS.md`).
 * Espelha os tokens CSS de `styles/tokens.css` (Fase Motion Design) em valores que o GSAP entende
 * (segundos, não ms; nomes de ease do GSAP, não `cubic-bezier()`) — nenhuma duração/easing solta
 * é inventada aqui, cada valor tem uma correspondência 1:1 documentada com o token CSS de origem.
 * Toda animação GSAP do projeto importa deste arquivo — nunca `gsap.to(el, { duration: 0.3 })`
 * com um número solto (briefing, Seção 45: "centralizar durations/easings/stagger/distances").
 */

export const DURATION = {
  /** = `--ds-duration-instant` (80ms) — resposta a clique, nunca uma transição decorativa. */
  instant: 0.08,
  /** = `--ds-duration-fast` (120ms) — saída de cena, hover/press. */
  fast: 0.12,
  /** = `--ds-duration-normal` (200ms) — entrada de elemento simples. */
  normal: 0.2,
  /** = `--ds-duration-slow` (360ms) — drawers, painéis (Nível 2). */
  slow: 0.36,
  /** = `--ds-duration-scene` (480ms) — entrada de cena (Nível 3). */
  scene: 0.48,
} as const;

/**
 * Aproximações dos `cubic-bezier()` de `--ds-easing-*` usando os eases nativos do GSAP — sem o
 * plugin `CustomEase` (não instalado nesta fase; ver `docs/GSAP-TRANSITIONS.md`, "Por que não
 * CustomEase"). Poucos padrões, reaproveitados em todo lugar (Seção 46 do briefing).
 */
export const EASE = {
  /** ≈ `--ds-easing-standard`/`--ds-easing-base` — curva padrão, sem ênfase em nenhuma ponta. */
  standard: "power2.inOut",
  /** ≈ `--ds-easing-emphasized` — desaceleração forte, "chega com intenção". Entradas de cena. */
  emphasized: "expo.out",
  /** ≈ `--ds-easing-exit` — aceleração, elemento "sai correndo". Saídas de cena/card. */
  exit: "power2.in",
  /** ≈ `--ds-easing-smooth` — suave nas duas pontas. Cross-fades contínuos. */
  smooth: "sine.inOut",
} as const;

/** = `--ds-stagger-xs/sm/md`, em segundos. */
export const STAGGER = {
  xs: 0.04,
  sm: 0.08,
  md: 0.14,
} as const;

/**
 * Distâncias de translação em `px` — nunca um número soltos dentro de um `gsap.to`. Reduzidas no
 * mobile (Seção 34 do briefing: "menos deslocamento") via `getSceneDistance()`.
 */
export const DISTANCE = {
  /** Deslocamento da transição de cena do Builder (Nível 3). */
  scene: 32,
  /** Deslocamento pequeno de entrada de texto/blocos (título, cards). */
  reveal: 16,
} as const;

/** Abaixo deste `viewport width`, distâncias de motion são reduzidas (Seção 34: "mobile"). */
const MOBILE_BREAKPOINT_PX = 640;

/**
 * Deslocamento efetivo para a transição de cena, menor em telas estreitas — mesma lógica de
 * "mobile não é desktop reduzido" já aplicada ao layout (Fase 20), agora aplicada ao motion.
 */
export function getSceneDistance(): number {
  if (typeof window === "undefined") return DISTANCE.scene;
  return window.innerWidth < MOBILE_BREAKPOINT_PX ? Math.round(DISTANCE.scene * 0.6) : DISTANCE.scene;
}
