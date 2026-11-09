"use client";

import { useEffect, useRef, useState } from "react";
import { buildLogoParticleData, type LogoParticleData } from "@/features/design-system/webgl/buildLogoParticleData";
import { CAMERA_MARGIN, SAMPLE_WIDTH } from "@/features/design-system/webgl/logoParticlesConfig";
import styles from "./BuilderLogoLab.module.css";

/**
 * Protótipo "O U que se monta" (ideia E1 da auditoria, NÃO ligado ao Builder): a logo em partículas é
 * dividida em três partes — metade prata, metade verde e a base curva (onde fica a sombra) — e cada
 * serviço escolhido acende uma parte. Usa a MESMA amostragem da logo do Hero
 * (`buildLogoParticleData`), desenhada em Canvas 2D (sem `three`).
 *
 * Mapeamento escolhido só para a demonstração (a decisão real é do dono): Site = metade prata,
 * Tráfego Pago = metade verde, Design e Social Media = base curva do U.
 */
type Part = "site" | "trafego" | "design";

const PARTS: { id: Part; label: string }[] = [
  { id: "site", label: "Site" },
  { id: "trafego", label: "Tráfego Pago" },
  { id: "design", label: "Design e Social Media" },
];

/** Em que parte do "U" a partícula está: a base curva (terço de baixo, onde fica a sombra da marca)
 * → design; acima dela, a metade verde → tráfego e a metade prata → site. */
function partOf(data: LogoParticleData, i: number): Part {
  const y = data.positions[i * 3 + 1];
  if (y < -data.halfHeight * 0.38) return "design";
  const r = data.colors[i * 3];
  const g = data.colors[i * 3 + 1];
  return g > r * 1.3 ? "trafego" : "site";
}

export default function BuilderLogoLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<LogoParticleData | null>(null);
  const [active, setActive] = useState<Part[]>([]);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const h = Math.round(SAMPLE_WIDTH * (image.height / image.width));
      const sample = document.createElement("canvas");
      sample.width = SAMPLE_WIDTH;
      sample.height = h;
      const ctx = sample.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, SAMPLE_WIDTH, h);
      setData(buildLogoParticleData(ctx.getImageData(0, 0, SAMPLE_WIDTH, h), 5000));
    };
    image.src = "/logo-mark.png";
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    const aspect = canvas.width / canvas.height;
    const fitH = Math.max(data.halfHeight, data.halfWidth / aspect) * CAMERA_MARGIN;
    const fitW = fitH * aspect;
    const count = data.positions.length / 3;
    for (let i = 0; i < count; i += 1) {
      const lit = active.includes(partOf(data, i));
      const x = ((data.positions[i * 3] / fitW) * 0.5 + 0.5) * canvas.width;
      const y = (0.5 - (data.positions[i * 3 + 1] / fitH) * 0.5) * canvas.height;
      const r = Math.round(data.colors[i * 3] * 255);
      const g = Math.round(data.colors[i * 3 + 1] * 255);
      const b = Math.round(data.colors[i * 3 + 2] * 255);
      ctx.fillStyle = `rgba(${r},${g},${b},${lit ? 0.7 : 0.07})`;
      ctx.beginPath();
      ctx.arc(x, y, (lit ? 1.1 : 0.8) * ratio, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, active]);

  const count = active.length;
  const status =
    count === 0
      ? "Nenhum serviço escolhido: o U ainda está apagado."
      : count === 3
        ? "Três serviços: o U está completo."
        : `${count} serviço${count > 1 ? "s" : ""}: o U está se montando.`;

  return (
    <main className={styles.page}>
      <p className={styles.badge}>Protótipo · não está no site</p>
      <h1 className={styles.title}>O U que se monta</h1>
      <p className={styles.lead}>
        Cada serviço escolhido acende uma parte da logo. Toque nos serviços para ver o U se completar.
      </p>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </div>
      <p className={styles.status} aria-live="polite">
        {status}
      </p>
      <div className={styles.toggles} role="group" aria-label="Serviços do protótipo">
        {PARTS.map((part) => {
          const on = active.includes(part.id);
          return (
            <button
              key={part.id}
              type="button"
              aria-pressed={on}
              className={styles.toggle}
              onClick={() => setActive((prev) => (on ? prev.filter((p) => p !== part.id) : [...prev, part.id]))}
            >
              {part.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}
