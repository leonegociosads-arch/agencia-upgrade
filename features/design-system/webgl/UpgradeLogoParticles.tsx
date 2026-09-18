"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useFinePointer } from "../motion/pointerCapability";
import { hasWebGL } from "./webglSupport";
import { getSafePixelRatio } from "./pixelRatio";
import { buildLogoParticleData } from "./buildLogoParticleData";
import { logoParticlesVertexShader, logoParticlesFragmentShader } from "./shaders/logoParticles";
import styles from "./UpgradeLogoParticles.module.css";

// Resolução de trabalho usada só para amostrar os pixels do PNG (não é a resolução do canvas na
// tela) — grande o suficiente para preservar os detalhes da forma, pequena o suficiente para o loop
// de amostragem em `buildLogoParticleData` custar poucos milissegundos. 320 (era 220) para os
// traços mais finos da logo (ex.: a lâmina diagonal) terem pixels suficientes para amostrar bem.
const SAMPLE_WIDTH = 320;
// Ajuste (correção pós-entrega): densidade bem maior para a logo ficar claramente legível —
// "aglomerado genérico" antes, não "densidade rica" — ver `docs/DECISIONS.md`. Configurável aqui.
const PARTICLE_COUNT_DESKTOP = 6000;
const PARTICLE_COUNT_MOBILE = 2200;
// Raio reduzido à metade do valor original (pedido explícito: reação mais concentrada e precisa).
const MOUSE_INFLUENCE_RADIUS = 0.55;
// Amplitude do micro movimento em repouso, bem menor que antes: o valor original (0.045) era maior
// que o espaçamento típico entre partículas vizinhas, então a "respiração" de cada partícula
// invadia o lugar da partícula ao lado a cada frame — isso, mais do que o algoritmo de amostragem
// em si, era a causa real da logo parecer um aglomerado sem forma em vez de uma silhueta legível.
const IDLE_AMPLITUDE = 0.012;
// Velocidade com que a influência do mouse liga/desliga (entrar/sair da área de partículas) a cada
// frame. Histórico: 0.06 (original) → 0.012 → 0.004 → 0.008 → 0.016 (esta rodada, "2x mais rápido"
// de novo, sobre o estado já com posição do mouse exata — ver `PARTICLE_EASE` abaixo).
const MOUSE_INFLUENCE_EASE = 0.016;
// Velocidade com que CADA PARTÍCULA converge para a posição que a atração do mouse pede agora —
// é isto, e só isto, que dá a sensação de peso/elegância; a posição do mouse em si
// (`currentMouse`, em `renderFrame`) não tem NENHUMA suavização própria desde a rodada anterior —
// é lida exata, todo frame, então o centro de atração nunca fica atrasado em relação ao cursor,
// não importa o valor daqui. Histórico: introduzida em 0.016 → 0.032 (esta rodada, "2x mais
// rápido").
const PARTICLE_EASE = 0.032;

/**
 * Substitui o antigo monograma sólido (`UpgradeLogo3D`, mantido no repositório mas não mais
 * referenciado no Hero) pelo pedido explícito do usuário: a logo oficial da Upgrade recomposta como
 * um campo de partículas, com magnetismo ao cursor. Segue a mesma arquitetura isolada dos outros
 * efeitos WebGL do projeto (`UpgradeLogo3D.tsx`, `ProceduralAura.tsx`): único arquivo que importa
 * `three`, sempre client-only via `next/dynamic({ ssr: false })`, fallback CSS do elemento-pai
 * sempre por baixo, nunca quebra a página se WebGL falhar.
 *
 * A forma da logo vem de uma amostragem de pixels de `public/logo-mark.png` (ver
 * `buildLogoParticleData.ts` para o porquê de não ter usado o SVG enviado).
 *
 * Interação com o mouse — duas coisas deliberadamente separadas (pedido explícito do usuário: "o
 * campo de atração deve seguir o mouse exatamente, sem lag; as partículas podem continuar mais
 * lentas"): a posição do mouse (`currentMouse`, em `renderFrame`) é lida sem NENHUM atraso; só a
 * posição de CADA PARTÍCULA converge (com uma suavização própria, `PARTICLE_EASE`) para o alvo que
 * essa posição exata pede a cada frame. Isso exige um pequeno estado por partícula
 * (`renderedPositions`, atualizado em JS e reenviado para a GPU a cada frame) — uma simulação bem
 * mais simples que GPGPU (sem textura de posições, sem passes extras de shader), mas é estado de
 * verdade, ao contrário da primeira versão deste arquivo (puramente sem estado). Ver
 * `docs/DECISIONS.md` para o histórico completo dessa mudança de abordagem.
 */
export default function UpgradeLogoParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [supported] = useState(hasWebGL);
  const [renderFailed, setRenderFailed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!supported || !canvas || !wrapper) return;

    let cancelled = false;
    let cleanupScene: (() => void) | null = null;

    const image = new Image();
    image.onload = () => {
      if (cancelled) return;

      const sampleHeight = Math.round(SAMPLE_WIDTH * (image.height / image.width));
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = SAMPLE_WIDTH;
      sampleCanvas.height = sampleHeight;
      const ctx = sampleCanvas.getContext("2d");
      if (!ctx) {
        setRenderFailed(true);
        return;
      }
      ctx.drawImage(image, 0, 0, SAMPLE_WIDTH, sampleHeight);

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, SAMPLE_WIDTH, sampleHeight);
      } catch {
        setRenderFailed(true);
        return;
      }

      cleanupScene = startScene(imageData);
    };
    image.onerror = () => {
      if (!cancelled) setRenderFailed(true);
    };
    image.src = "/logo-mark.png";

    function startScene(imageData: ImageData): (() => void) | null {
      if (!canvas || !wrapper) return null;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        setRenderFailed(true);
        return null;
      }

      const particleCount = isFinePointer ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE;
      const { positions: basePositions, colors, randoms, halfHeight, halfWidth, candidateCount } = buildLogoParticleData(imageData, particleCount);
      // Buffer realmente enviado à GPU — começa igual à posição-base (repouso) e é atualizado a
      // cada frame (só quando há interação de mouse) para convergir para onde a atração pede.
      // `basePositions` nunca é mutado: é sempre o "para onde volta" quando o mouse se afasta.
      const renderedPositions = new Float32Array(basePositions);

      // Modo de debug temporário, ativado via `?particlesDebug=1` na URL — desliga motion/interação
      // e força pontos brancos opacos com blending normal, para confirmar visualmente que a
      // amostragem da logo está correta, isolada de qualquer escolha de cor/blending/tamanho. Ver a
      // nota no topo de `shaders/logoParticles.ts`. Remover depois que a legibilidade em repouso
      // estiver confirmada (não é para ficar em produção).
      const debugMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("particlesDebug") === "1";

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(renderedPositions, 3));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

      const pixelRatio = getSafePixelRatio(!isFinePointer);
      const material = new THREE.ShaderMaterial({
        vertexShader: logoParticlesVertexShader,
        fragmentShader: logoParticlesFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uMouseInfluence: { value: 0 },
          uIdleAmp: { value: reducedMotion ? 0 : IDLE_AMPLITUDE },
          uRadius: { value: MOUSE_INFLUENCE_RADIUS },
          uPixelRatio: { value: pixelRatio },
          uDebugMode: { value: debugMode ? 1 : 0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: debugMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      const scene = new THREE.Scene();
      scene.add(points);

      if (process.env.NODE_ENV !== "production") {
        console.info("[UpgradeLogoParticles] diagnóstico", {
          debugMode,
          imageSample: `${imageData.width}x${imageData.height}`,
          candidateCount,
          particleCount: basePositions.length / 3,
          particleCountRequested: particleCount,
          isFinePointer,
          reducedMotion,
          canvasCssSize: `${wrapper.clientWidth}x${wrapper.clientHeight}`,
          devicePixelRatioUsed: pixelRatio,
          mouseInfluenceRadius: MOUSE_INFLUENCE_RADIUS,
          idleAmplitude: reducedMotion ? 0 : IDLE_AMPLITUDE,
          basePointSize: debugMode ? 3 : 1.9,
          baseAlpha: debugMode ? 1 : 0.62,
          blending: debugMode ? "NormalBlending" : "AdditiveBlending",
        });
      }

      // Câmera ortográfica: mapeia diretamente o cursor (NDC) para o mesmo espaço das posições das
      // partículas, sem precisar de raycast contra um plano — mais simples de manter (mesma ideia já
      // usada em `ProceduralAura.tsx`, aqui adaptada para o tamanho real da logo amostrada).
      const margin = 1.25;
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 5;

      function updateCameraFrustum() {
        if (!wrapper) return;
        const width = wrapper.clientWidth || 1;
        const height = wrapper.clientHeight || 1;
        const containerAspect = width / height;
        // Enquadra pelo maior lado (logo ou container) para a logo nunca ficar cortada, com uma
        // margem confortável para o raio de influência do mouse não bater na borda do frustum.
        const fitHalfHeight = Math.max(halfHeight, halfWidth / containerAspect) * margin;
        const fitHalfWidth = fitHalfHeight * containerAspect;
        camera.left = -fitHalfWidth;
        camera.right = fitHalfWidth;
        camera.top = fitHalfHeight;
        camera.bottom = -fitHalfHeight;
        camera.updateProjectionMatrix();
        return { fitHalfWidth, fitHalfHeight };
      }
      let frustum = updateCameraFrustum();

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(wrapper.clientWidth || 1, wrapper.clientHeight || 1, false);

      const targetMouseNdc = { x: 0, y: 0 };
      let targetInfluence = 0;
      const currentMouse = new THREE.Vector2(0, 0);
      let currentInfluence = 0;

      function handlePointerMove(event: PointerEvent) {
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const inBounds =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        targetInfluence = inBounds ? 1 : 0;
        if (inBounds && rect.width > 0 && rect.height > 0) {
          targetMouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          targetMouseNdc.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        }
      }
      function handlePointerLeaveWindow(event: MouseEvent) {
        if (!event.relatedTarget) targetInfluence = 0;
      }
      if (isFinePointer && !reducedMotion && !debugMode) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("mouseout", handlePointerLeaveWindow, { passive: true });
      }

      function handleContextLost(event: Event) {
        event.preventDefault();
        setRenderFailed(true);
      }
      canvas!.addEventListener("webglcontextlost", handleContextLost);

      const resizeObserver = new ResizeObserver(() => {
        if (!wrapper) return;
        frustum = updateCameraFrustum();
        renderer.setSize(wrapper.clientWidth || 1, wrapper.clientHeight || 1, false);
      });
      resizeObserver.observe(wrapper);

      let isInView = true;
      const intersectionObserver =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => { isInView = entry.isIntersecting; }, { rootMargin: "150px" });
      intersectionObserver?.observe(wrapper);

      let isPageVisible = !document.hidden;
      function handleVisibilityChange() {
        isPageVisible = !document.hidden;
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);

      let rafId = 0;

      function renderFrame(elapsedMs: number) {
        const elapsed = elapsedMs / 1000;

        if (isFinePointer && !reducedMotion && !debugMode && frustum) {
          currentInfluence += (targetInfluence - currentInfluence) * MOUSE_INFLUENCE_EASE;
          // Posição do mouse: exata, sem suavização — o campo de atração acompanha o cursor
          // imediatamente (pedido explícito do usuário, ver comentário no topo do arquivo).
          currentMouse.x = targetMouseNdc.x * frustum.fitHalfWidth;
          currentMouse.y = targetMouseNdc.y * frustum.fitHalfHeight;
          material.uniforms.uMouse.value.copy(currentMouse);
          material.uniforms.uMouseInfluence.value = currentInfluence;

          // Atração por partícula: mesma fórmula (atração radial + redemoinho tangencial, com teto
          // de magnitude) que antes vivia inteira no vertex shader — só que agora o ALVO calculado
          // aqui é atingido aos poucos (`PARTICLE_EASE`), não instantaneamente. É essa suavização,
          // e não mais a posição do mouse, que dá a sensação de peso/elegância.
          for (let i = 0; i < particleCount; i += 1) {
            const ix = i * 3;
            const iy = ix + 1;
            const iz = ix + 2;
            const baseX = basePositions[ix];
            const baseY = basePositions[iy];
            const baseZ = basePositions[iz];

            const toMouseX = currentMouse.x - baseX;
            const toMouseY = currentMouse.y - baseY;
            const dist = Math.sqrt(toMouseX * toMouseX + toMouseY * toMouseY);

            let falloff = 0;
            if (dist < MOUSE_INFLUENCE_RADIUS) {
              const t = dist / MOUSE_INFLUENCE_RADIUS;
              const smooth = t * t * (3 - 2 * t); // smoothstep(0, radius, dist)
              falloff = 1 - smooth;
            }

            const dirX = dist > 0.0001 ? toMouseX / dist : 0;
            const dirY = dist > 0.0001 ? toMouseY / dist : 0;
            const tangentX = -dirY;
            const tangentY = dirX;
            const phase = randoms[i] * 6.2831853;
            const swirlPhase = Math.sin(phase + elapsed * 0.4) * 0.5 + 0.5;

            let rawX = dirX * 0.34 + tangentX * 0.38 * swirlPhase;
            let rawY = dirY * 0.34 + tangentY * 0.38 * swirlPhase;
            const rawLength = Math.sqrt(rawX * rawX + rawY * rawY);
            if (rawLength > 0.5) {
              const scale = 0.5 / rawLength;
              rawX *= scale;
              rawY *= scale;
            }

            const scalar = falloff * currentInfluence;
            const targetX = baseX + rawX * scalar;
            const targetY = baseY + rawY * scalar;
            const targetZ = baseZ + scalar * 0.22;

            renderedPositions[ix] += (targetX - renderedPositions[ix]) * PARTICLE_EASE;
            renderedPositions[iy] += (targetY - renderedPositions[iy]) * PARTICLE_EASE;
            renderedPositions[iz] += (targetZ - renderedPositions[iz]) * PARTICLE_EASE;
          }
          geometry.attributes.position.needsUpdate = true;
        }

        material.uniforms.uTime.value = elapsed;
        renderer.render(scene, camera);
      }

      if (reducedMotion) {
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
        canvas!.removeEventListener("webglcontextlost", handleContextLost);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("mouseout", handlePointerLeaveWindow);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
    // `reducedMotion`/`isFinePointer` mudando recria a cena inteira do zero — mesma decisão (e mesmo
    // motivo) já documentada em `UpgradeLogo3D.tsx`.
  }, [supported, reducedMotion, isFinePointer]);

  if (!supported || renderFailed) return null;

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
