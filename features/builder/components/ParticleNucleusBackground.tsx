"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import type { ServiceId } from "../types";
import { NUCLEUS_CONFIG, NUCLEUS_THEMES, type NucleusLayer, type NucleusTheme } from "./background/builderBackgroundThemes";
import styles from "./ParticleNucleusBackground.module.css";

export interface ParticleNucleusBackgroundProps {
  /** Visível e animando. Inativo = transparente e sem loop (fica montado para o fade). */
  active: boolean;
  theme?: ServiceId;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  layer: number;
  sprite: HTMLCanvasElement;
}

/** Leve achatamento vertical: o campo fica um pouco mais largo que alto, como uma galáxia. */
const Y_SCALE = 0.8;
/** Partículas somem ao chegar a esta fração do raio do núcleo e renascem na borda. */
const CORE_EXIT = 0.3;
const FADE_OUT_MS = 700;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Ponto de luz pré-renderizado (gradiente radial) — desenhar com `drawImage` é bem mais barato
 * que um gradiente ou `shadowBlur` por partícula a cada frame. */
function makeSprite([r, g, b]: readonly [number, number, number], blur: number) {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const core = 0.22 + blur * 0.4;
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${1 - blur * 0.45})`);
  gradient.addColorStop(core, `rgba(${r}, ${g}, ${b}, ${0.55 - blur * 0.2})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

function particleCount(width: number) {
  const { density } = NUCLEUS_CONFIG;
  if (width < 700) return density.mobile;
  if (width < 1200) return density.tablet;
  return density.desktop;
}

/**
 * Fundo da terceira etapa do Builder: partículas vindo das bordas e convergindo para um núcleo
 * luminoso no centro da viewport, em fluxo contínuo. Um único `<canvas>` fixo atrás de todo o
 * conteúdo (nunca recebe clique).
 */
export default function ParticleNucleusBackground({ active, theme }: ParticleNucleusBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!active || !canvas || !ctx) return;

    const palette: NucleusTheme = NUCLEUS_THEMES[theme ?? "default"];
    const layers: readonly NucleusLayer[] = NUCLEUS_CONFIG.layers;
    const sprites = layers.map((layer) => palette.particleColors.map((color) => makeSprite(color, layer.blur)));

    let width = 0;
    let height = 0;
    let maxRadius = 1;
    let coreRadius = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, NUCLEUS_CONFIG.maxDpr);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const previous = maxRadius;
      maxRadius = Math.hypot(width / 2, height / 2 / Y_SCALE);
      coreRadius = Math.min(width, height) * NUCLEUS_CONFIG.nucleusSize;
      return previous;
    };
    resize();

    const spawn = (particle: Particle, anywhere: boolean) => {
      particle.angle = Math.random() * Math.PI * 2;
      particle.radius = anywhere ? rand(coreRadius * 0.6, maxRadius) : maxRadius * rand(0.95, 1.08);
      particle.speed = rand(0.8, 1.2);
    };

    const particles: Particle[] = [];
    const total = particleCount(width);
    layers.forEach((layer, layerIndex) => {
      const count = Math.round(total * layer.share);
      for (let i = 0; i < count; i++) {
        const particle: Particle = {
          angle: 0,
          radius: 0,
          speed: 1,
          size: rand(layer.size[0], layer.size[1]),
          alpha: rand(layer.alpha[0], layer.alpha[1]),
          layer: layerIndex,
          sprite: sprites[layerIndex][Math.floor(Math.random() * palette.particleColors.length)],
        };
        spawn(particle, true);
        particles.push(particle);
      }
    });

    const [nr, ng, nb] = palette.nucleusColor;
    const draw = (time: number) => {
      const cx = width / 2;
      const cy = height / 2;
      // O gradiente de fundo é CSS (no wrapper); o canvas só limpa e desenha luz por cima.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);

      // Núcleo: brilho suave com pulsação lenta — nunca um clarão.
      const { nucleusIntensity: intensity, nucleusPulse } = NUCLEUS_CONFIG;
      const pulse = 1 + Math.sin((time / 1000 / nucleusPulse.period) * Math.PI * 2) * nucleusPulse.amount;
      const glowRadius = coreRadius * pulse;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      glow.addColorStop(0, `rgba(${nr}, ${ng}, ${nb}, ${intensity * 0.55})`);
      glow.addColorStop(0.18, `rgba(${nr}, ${ng}, ${nb}, ${intensity * 0.22})`);
      glow.addColorStop(0.5, `rgba(${nr}, ${ng}, ${nb}, ${intensity * 0.06})`);
      glow.addColorStop(1, `rgba(${nr}, ${ng}, ${nb}, 0)`);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glow;
      ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

      for (const particle of particles) {
        const progress = particle.radius / maxRadius;
        const spawnFade = Math.min(1, (maxRadius - particle.radius) / (maxRadius * 0.12));
        const coreFade = Math.min(1, (particle.radius - coreRadius * CORE_EXIT) / (coreRadius * 0.9));
        const alpha = particle.alpha * Math.max(0, Math.min(spawnFade, coreFade));
        if (alpha <= 0.005) continue;
        // Um pouco menores perto do núcleo: reforça a profundidade (vindo "de perto" para "longe").
        const scale = 0.55 + 0.45 * Math.min(1, progress * 1.4);
        const glowSize = particle.size * 4 * scale;
        const x = cx + Math.cos(particle.angle) * particle.radius;
        const y = cy + Math.sin(particle.angle) * particle.radius * Y_SCALE;
        ctx.globalAlpha = alpha;
        ctx.drawImage(particle.sprite, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const step = (dt: number) => {
      for (const particle of particles) {
        const layer = layers[particle.layer];
        const progress = particle.radius / maxRadius;
        // Acelera levemente ao se aproximar do núcleo (sensação de atração).
        const velocity = NUCLEUS_CONFIG.speed * layer.speed * particle.speed * maxRadius * (0.45 + 0.9 * (1 - progress));
        particle.radius -= velocity * dt;
        particle.angle += NUCLEUS_CONFIG.swirl * dt * (1 + (1 - progress));
        if (particle.radius < coreRadius * CORE_EXIT) spawn(particle, false);
      }
    };

    const handleResize = () => {
      const previous = resize();
      const ratio = maxRadius / previous;
      for (const particle of particles) particle.radius *= ratio;
      if (reducedMotion) draw(0);
    };
    window.addEventListener("resize", handleResize);

    if (reducedMotion) {
      // Movimento reduzido: um quadro estático, sem loop.
      draw(0);
      return () => window.removeEventListener("resize", handleResize);
    }

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        step(dt);
        draw(now);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      // Deixa o fade de saída terminar antes de parar o loop.
      window.setTimeout(() => cancelAnimationFrame(frame), FADE_OUT_MS);
    };
  }, [active, theme, reducedMotion]);

  const palette = NUCLEUS_THEMES[theme ?? "default"];
  return (
    <div
      className={styles.root}
      data-active={active ? "true" : "false"}
      aria-hidden="true"
      style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, ${palette.backgroundCenter} 0%, ${palette.backgroundEdge} 100%)` }}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
