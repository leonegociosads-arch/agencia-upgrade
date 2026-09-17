"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useFinePointer } from "./pointerCapability";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Tilt 3D extremamente sutil para cards (briefing Microinterações, Seções 10/11: "amplitude
 * pequena... evitar aparência de template 3D genérico"). Gated por `useFinePointer()` (nunca em
 * touch — Seção 19 do briefing GSAP: "no mobile nada pode depender de hover") e por
 * `useReducedMotion()` (Seção 53: "sem tilt" com motion reduzido).
 *
 * Um `pointermove`/`pointerleave` POR CARD que usa o hook (nunca um listener global de mouse —
 * briefing Seção 56: "não criar listener de mouse global desnecessário para dezenas de
 * elementos") — cada instância limpa os próprios listeners e a própria timeline ao desmontar.
 */
export function useTilt<T extends HTMLElement>(maxDegrees = 3) {
  const ref = useRef<T | null>(null);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer || reducedMotion) return;

    gsap.set(el, { transformPerspective: 600 });
    const quickRotateX = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power2.out" });
    const quickRotateY = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power2.out" });
    const quickScale = gsap.quickTo(el, "scale", { duration: 0.15, ease: "power2.out" });

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      quickRotateY(relativeX * maxDegrees * 2);
      quickRotateX(-relativeY * maxDegrees * 2);
    }

    // Enquanto o ponteiro tilta o card, o GSAP passa a ser dono do `transform` inline dele — um
    // `transform` inline (mesmo "sem rotação") sempre vence qualquer regra de CSS para o mesmo
    // elemento, então o `:active { transform: scale(0.97) }` do próprio card (Motion Design,
    // Nível 1) nunca apareceria se ficasse só por conta do CSS. Por isso a compressão do clique
    // também é aplicada AQUI, na mesma propriedade que o tilt já controla — nunca as duas fontes
    // disputando o mesmo `transform` ao mesmo tempo.
    function handlePress() {
      quickScale(0.97);
    }

    function handleRelease() {
      quickScale(1);
    }

    function handleLeave() {
      quickScale(1);
      // Não só volta a rotação a 0 — LIMPA o `transform` inline por completo (`clearProps`) ao
      // terminar, para devolver o controle ao CSS assim que o ponteiro sai do card.
      gsap.to(el!, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        // Bug real encontrado via E2E (Etapa 31 — Testes Funcionais, um console warning que nenhum
        // teste `jsdom` pega, só um navegador de verdade): `clearProps: "transform"` não funciona
        // quando as propriedades foram animadas como componentes individuais (`rotateX`/`rotateY`/
        // `scale`, via `quickTo`) — o CSSPlugin do GSAP avisa "not eligible for reset" e a limpeza
        // não acontece. `transformPerspective` fica de fora de propósito (aplicado uma única vez no
        // `gsap.set` de montagem, não a cada `handleLeave` — limpá-lo aqui deixaria o próximo hover
        // "achatado", sem perspectiva); só o cleanup de desmontagem (`return` abaixo) o remove.
        onComplete: () => gsap.set(el!, { clearProps: "rotationX,rotationY,scale" }),
      });
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);
    el.addEventListener("pointerdown", handlePress);
    el.addEventListener("pointerup", handleRelease);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
      el.removeEventListener("pointerdown", handlePress);
      el.removeEventListener("pointerup", handleRelease);
      gsap.set(el, { clearProps: "rotationX,rotationY,scale,transformPerspective" });
    };
  }, [isFinePointer, reducedMotion, maxDegrees]);

  return ref;
}
