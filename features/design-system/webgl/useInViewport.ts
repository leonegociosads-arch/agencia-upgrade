"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Monta o efeito WebGL só quando a seção está perto da viewport (Fase 3D/WebGL, Seções 20/22 do
 * briefing: "inicializar efeito apenas quando próximo da viewport"; "não carregar Three.js inteiro
 * no primeiro frame se o efeito estiver longe"). Também serve para PAUSAR (Seção 23: "se estiver
 * fora da viewport, pausar render loop quando possível") — o valor continua reativo depois da
 * primeira vez que fica `true`, então quem usa este hook pode parar o loop de renderização quando
 * `inViewport` volta a `false` (ex.: `ProceduralAura` na Home).
 *
 * `rootMargin` positivo (`"200px"` por padrão) começa a carregar um pouco ANTES do elemento entrar
 * de fato na tela — evita o usuário ver o "pop-in" do WebGL montando bem na hora em que a seção
 * aparece.
 *
 * Aceita um `externalRef` opcional para observar um nó que já tem outro uso (ex.: o mesmo
 * `sectionRef` de `useRevealScrollMotion` em `FinalCtaSection`) sem precisar de uma segunda `ref`
 * concorrente no mesmo elemento — React só permite uma `ref` por nó.
 */
export function useInViewport<T extends Element>(
  rootMargin = "200px",
  externalRef?: RefObject<T | null>,
): [RefObject<T | null>, boolean] {
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;
  // Sempre `false` no estado inicial — em AMBOS servidor e primeira renderização do cliente, nunca
  // calculado a partir de `typeof IntersectionObserver` (que existe no browser mas não no Node):
  // fazer essa checagem já no valor inicial do estado foi tentado e causava um hydration mismatch
  // de verdade (servidor sempre "sem suporte", cliente sempre "com suporte") — ver
  // `docs/DECISIONS.md`. Um navegador sem `IntersectionObserver` (praticamente inexistente hoje)
  // simplesmente nunca ativa o efeito avançado — o fallback CSS já presente continua funcionando
  // (Seção 31 do briefing), o que é uma degradação aceitável e mais segura do que arriscar SSR.
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, ref]);

  return [ref, inViewport];
}
