import { afterEach } from "vitest";

// A partir da Fase 14, BuilderShell lê/escreve localStorage (persistência de sessão). Arquivos de
// teste `jsdom` compartilham o mesmo `localStorage` entre todos os `it()` do arquivo — sem isto,
// uma sessão salva por um teste vazaria para o próximo. `typeof localStorage` (em vez de acessar
// direto) evita um ReferenceError nos muitos arquivos de teste que rodam em ambiente "node" puro,
// sem DOM.
afterEach(() => {
  if (typeof localStorage !== "undefined") {
    localStorage.clear();
  }
});

// A partir da Fase GSAP e Transições, `useReducedMotion` (`features/design-system/motion/
// useReducedMotion.ts`) chama `window.matchMedia` de verdade — jsdom não implementa essa API por
// padrão. Sem este polyfill, QUALQUER teste que renderize `SceneTransition`/`Drawer` (ou qualquer
// componente do Builder, que os usa) lançaria `TypeError: window.matchMedia is not a function`.
//
// Padrão AQUI é `matches: true` (motion reduzido "ligado") — de propósito, não por acaso: com
// `reduced-motion`, `SceneTransition`/`Drawer` resolvem a troca de cena/abertura de forma SÍNCRONA
// (`gsap.set`, sem `timeline`/`requestAnimationFrame`), porque jsdom não tem um loop de
// renderização real para avançar frames de uma animação de verdade. Isso bate exatamente com a
// filosofia de teste desta fase (briefing, Seção 47: "não testar frame a frame, testar
// comportamento") — os ~450 testes de integração do projeto continuam sincronamente
// determinísticos, exercitando o fluxo REAL do Builder, sem precisar simular tempo/`requestAnimationFrame`.
// Um teste que precise verificar especificamente o caminho de motion completo sobrescreve
// `window.matchMedia` localmente (ver `SceneTransition.test.tsx`).
if (typeof window !== "undefined") {
  window.matchMedia = (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// A partir da Fase Smooth Scroll, `Lenis` (integração real, `SmoothScrollProvider.tsx`) usa
// `ResizeObserver` internamente (`autoResize`) para recalcular dimensões — outra API que o jsdom
// não implementa, mesmo raciocínio do polyfill de `matchMedia` acima. Só é exercitada nos poucos
// testes que forçam o caminho de motion completo (`prefers-reduced-motion: reduce` = `false`);
// no restante do projeto, `useReducedMotion()` continua `true` por padrão e nenhuma instância de
// Lenis chega a ser criada.
if (typeof window !== "undefined" && typeof window.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
