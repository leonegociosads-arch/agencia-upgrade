"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useFinePointer } from "../motion/pointerCapability";
import { hasWebGL } from "./webglSupport";
import { getSafePixelRatio } from "./pixelRatio";
import { buildUpgradeMonogramGroup, createUpgradeMonogramMaterials, disposeUpgradeMonogramGroup } from "./buildUpgradeMonogramGeometry";
import styles from "./UpgradeLogo3D.module.css";

/**
 * Assinatura visual em 3D do monograma "U" da Upgrade (Fase 3D/WebGL, Seções 3-5 do briefing:
 * "prova de capacidade + assinatura visual... arquitetura isolada, componente específico"). Só
 * este arquivo importa `three` — nenhuma lógica WebGL espalhada por `HeroSection.tsx` ou qualquer
 * outro componente comum.
 *
 * SEMPRE renderizado DENTRO do wrapper `.heroGraphic` já existente (`HeroSection.module.css`), que
 * mantém o gradiente CSS original como fundo — o canvas só cobre esse fundo por cima quando WebGL
 * está disponível e monta com sucesso (Seção 31: "fallback é obrigatório"; nenhuma informação
 * importante — este elemento é puramente decorativo, `aria-hidden` no pai — vive só dentro do
 * canvas).
 *
 * Client-only por natureza (usa `WebGLRenderer`) — este componente é sempre importado via
 * `next/dynamic({ ssr: false })` pelo componente que o usa (`HeroGraphic.tsx`), nunca direto.
 */
export default function UpgradeLogo3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [supported] = useState(hasWebGL);
  // Cobre dois cenários (Seção 42 do briefing: "falha em efeito WebGL não pode quebrar página"):
  // o contexto morrer depois de já estar funcionando (`webglcontextlost`) OU o próprio
  // `WebGLRenderer` lançar na criação mesmo com `hasWebGL()` tendo dito que sim (driver
  // instável, contexto perdido entre a checagem e o uso, etc.) — os dois caem no mesmo fallback:
  // esconder o canvas, o gradiente CSS do elemento-pai continua visível.
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
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- falha real de um sistema externo (driver/GPU recusando o contexto WebGL), não um cálculo derivado; mesmo tipo de exceção já documentada em `Drawer.tsx`/`SmoothScrollProvider.tsx`.
      setRenderFailed(true);
      return;
    }
    renderer.setPixelRatio(getSafePixelRatio(!isFinePointer));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 20);
    camera.position.set(0, 0, 6);

    // Iluminação respeitando a identidade da marca (Seção 7: "preto, grafite, branco, verde
    // Upgrade — evitar arco-íris e RGB gratuito"): uma luz-chave branca, um preenchimento grafite
    // frio e um brilho de contorno verde bem discreto — nunca luzes coloridas aleatórias.
    scene.add(new THREE.AmbientLight(0x8a949c, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(2.5, 3, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x3a4a55, 0.6);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x2db958, 0.8, 12);
    rimLight.position.set(-1.5, 1, -3);
    scene.add(rimLight);

    const materials = createUpgradeMonogramMaterials();
    const group = buildUpgradeMonogramGroup(materials);
    group.scale.setScalar(1.15);
    scene.add(group);

    // Reação ao mouse (Seção 3: "reação leve ao mouse"; Seção 34: só desktop, nunca violenta) —
    // listener em `window` (mesmo padrão já aceito para `useAvoidCursor`/`useMagneticHover` na Fase
    // Microinterações), lido dentro do próprio loop de render, nunca via `setState` a cada
    // movimento.
    const pointerTarget = { x: 0, y: 0 };
    function handlePointerMove(event: PointerEvent) {
      pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
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
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    resizeObserver.observe(wrapper);

    // Pausa o loop quando a Home rola além do Hero (Seção 23 do briefing: "pausar render loop
    // quando fora da viewport") — uma flag lida dentro do próprio `tick`, não `useState`: entrar/
    // sair da tela pode acontecer várias vezes numa mesma sessão de scroll, e recriar a cena
    // inteira a cada vez seria um desperdício maior do que o problema que está resolvendo.
    let isInView = true;
    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => { isInView = entry.isIntersecting; }, { rootMargin: "150px" });
    intersectionObserver?.observe(wrapper);

    // Seção 24: "se `document.hidden`, reduzir ou pausar animação" — mesmo raciocínio do
    // `isInView` acima: uma flag simples atualizada por um listener nativo, nunca um hook React
    // (`usePageVisible`) referenciado direto dentro do `tick`, que ficaria "congelado" no valor de
    // quando o efeito rodou pela última vez (`reducedMotion`/`isFinePointer` são as únicas
    // dependências deste efeito — a aba escondendo/mostrando não deveria recriar a cena inteira).
    let isPageVisible = !document.hidden;
    function handleVisibilityChange() {
      isPageVisible = !document.hidden;
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let rafId = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    function renderFrame(elapsedMs: number) {
      const elapsed = elapsedMs / 1000;

      // Rotação/flutuação contínuas — bem lentas de propósito (Seção 4 do briefing: "não girar
      // rápido, não parecer videogame"). Puladas por completo com reduced motion (Seção 33).
      if (!reducedMotion) {
        group.rotation.y = elapsed * 0.18;
        group.position.y = Math.sin(elapsed * 0.6) * 0.08;
      }

      if (isFinePointer && !reducedMotion) {
        currentTiltX += (pointerTarget.y * 0.18 - currentTiltX) * 0.04;
        currentTiltY += (pointerTarget.x * 0.22 - currentTiltY) * 0.04;
        group.rotation.x = currentTiltX;
        group.rotation.z = currentTiltY * 0.4;
      }

      renderer.render(scene, camera);
    }

    if (reducedMotion) {
      // Seção 33: "oferecer versão estática" — um único frame parado, sem `requestAnimationFrame`
      // nenhum: ainda é a peça 3D de verdade (não o fallback 2D), só sem nenhuma animação contínua.
      renderFrame(0);
    } else {
      const tick = (time: number) => {
        if (isPageVisible && isInView) renderFrame(time);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("pointermove", handlePointerMove);
      disposeUpgradeMonogramGroup(group, materials);
      renderer.dispose();
    };
    // `reducedMotion`/`isFinePointer` mudando reconstrói a cena do zero (troca rara — só se o SO
    // mudar a preferência em tempo real) — mais simples e mais seguro do que tentar mutar um loop
    // já em andamento.
  }, [supported, reducedMotion, isFinePointer]);

  if (!supported || renderFailed) return null;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
