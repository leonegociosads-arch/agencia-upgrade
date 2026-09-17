"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useFinePointer } from "../motion/pointerCapability";
import { hasWebGL } from "./webglSupport";
import { getSafePixelRatio } from "./pixelRatio";
import { vertexShader, fragmentShader, AURA_COLOR_A, AURA_COLOR_B } from "./shaders/proceduralAura";
import styles from "./ProceduralAura.module.css";

/**
 * "Momento especial" do CTA final (Fase 3D/WebGL, Seções 12/60 do briefing — efeito 3 da lista de
 * prioridades: "fundo procedural... campo visual reagindo ao cursor"). Fundo shader sutil, atrás
 * do título/CTA (Seção 16: "não competir com texto"), nunca a estrutura principal da seção —
 * `.finalGraphic` (`FinalCtaSection.module.css`) continua com o mesmo gradiente CSS de sempre como
 * base/fallback; este canvas só cobre por cima quando WebGL está disponível.
 *
 * Arquitetura isolada (Seção 5), igual a `UpgradeLogo3D` — nenhuma lógica de shader/Three.js em
 * `FinalCtaSection.tsx`.
 */
export default function ProceduralAura() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [supported] = useState(hasWebGL);
  // Cobre `webglcontextlost` E uma possível falha na própria criação do `WebGLRenderer` (Seção
  // 42 do briefing) — mesmo raciocínio de `UpgradeLogo3D.tsx`.
  const [renderFailed, setRenderFailed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!supported || !canvas || !wrapper) return;

    let width = wrapper.clientWidth || 1;
    let height = wrapper.clientHeight || 1;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- falha real de um sistema externo (driver/GPU recusando o contexto WebGL), não um cálculo derivado; mesmo tipo de exceção já documentada em `Drawer.tsx`/`SmoothScrollProvider.tsx`.
      setRenderFailed(true);
      return;
    }
    renderer.setPixelRatio(getSafePixelRatio(!isFinePointer));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(...AURA_COLOR_A) },
      uColorB: { value: new THREE.Color(...AURA_COLOR_B) },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // Reação leve ao cursor (Seção 12: "campo visual reagindo ao cursor"), só desktop — mesmo
    // padrão de listener em `window` de `UpgradeLogo3D`/`useAvoidCursor`/`useMagneticHover`.
    function handlePointerMove(event: PointerEvent) {
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      uniforms.uMouse.value.set((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5);
    }
    if (isFinePointer && !reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      setRenderFailed(true);
    }
    canvas.addEventListener("webglcontextlost", handleContextLost);

    const resizeObserver = new ResizeObserver(() => {
      width = wrapper.clientWidth || 1;
      height = wrapper.clientHeight || 1;
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    });
    resizeObserver.observe(wrapper);

    // Seção 24 do briefing: pausa com a aba em segundo plano — flag atualizada por um listener
    // nativo (nunca o hook `usePageVisible` referenciado direto dentro do `tick`, que ficaria
    // "congelado" no valor de quando o efeito rodou — ver o mesmo raciocínio em `UpgradeLogo3D`).
    let isPageVisible = !document.hidden;
    function handleVisibilityChange() {
      isPageVisible = !document.hidden;
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let rafId = 0;

    function renderFrame(elapsedMs: number) {
      uniforms.uTime.value = elapsedMs / 1000;
      renderer.render(scene, camera);
    }

    if (reducedMotion) {
      // Seção 33: versão estática — um frame só, sem `uTime` avançando (Seção 10: nada de
      // distorção/glitch constante quando o SO pede menos movimento).
      renderFrame(0);
    } else {
      const tick = (time: number) => {
        if (isPageVisible) renderFrame(time);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("pointermove", handlePointerMove);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [supported, reducedMotion, isFinePointer]);

  if (!supported || renderFailed) return null;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
