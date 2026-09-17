import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registro único do plugin ScrollTrigger (Fase ScrollTrigger e Storytelling — auditoria inicial,
 * `docs/SCROLL-STORYTELLING.md`, Seção 1: nenhum uso de ScrollTrigger existia antes desta fase).
 * Centralizado aqui para nenhum componente chamar `gsap.registerPlugin` por conta própria (briefing,
 * Seção 24: "não espalhar ScrollTrigger.create em qualquer arquivo" — o registro é só o primeiro
 * passo dessa organização).
 */
export function getScrollTrigger(): typeof ScrollTrigger {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return ScrollTrigger;
}
