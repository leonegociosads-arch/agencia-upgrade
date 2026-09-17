import type Lenis from "lenis";

/**
 * Helper centralizado de scroll programático (Fase Smooth Scroll, Seção 31 do briefing: "criar
 * helper centralizado... evitar chamadas diferentes espalhadas"). Hoje nenhum link do site usa
 * âncora (`href="#secao"`) — este helper é infraestrutura preparada para quando isso existir (um
 * botão "voltar ao topo", um scroll programático que não passe por `<Link>`). Hash da URL no
 * carregamento da página já é resolvido pelo próprio Next.js 16 (`scrollIntoView()` nativo +
 * `scroll-padding-top`, ver `SmoothScrollProvider.tsx`) — este helper não duplica esse caminho.
 *
 * Sempre subtrai a altura real do header (`<header>` sticky — `SiteHeader.module.css`) medida em
 * tempo real via `getBoundingClientRect()`, nunca um número fixo: mais preciso que o
 * `scroll-padding-top` estático do CSS, útil quando o offset precisa refletir o header no exato
 * momento do clique (Seção 19 do briefing — "evitar parar com título escondido atrás do header").
 */
function getHeaderOffset(): number {
  const header = document.querySelector("header");
  return header ? header.getBoundingClientRect().height : 0;
}

export interface ScrollToSectionOptions {
  /** Instância ativa do Lenis, se houver (rotas fora do smooth scroll passam `null`). */
  lenis?: Lenis | null;
  /** Pula a animação — usado para pousar em `#hash` no carregamento (Seção 20: sem "salto" visível). */
  immediate?: boolean;
}

export function scrollToSection(id: string, { lenis, immediate = false }: ScrollToSectionOptions = {}): void {
  const target = document.getElementById(id);
  if (!target) return;

  const offset = -getHeaderOffset();

  if (lenis) {
    lenis.scrollTo(target, { offset, immediate });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}
