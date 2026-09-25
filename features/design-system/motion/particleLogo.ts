/**
 * Logo da Upgrade formada por partículas, desenhada num único `<canvas>` 2D (nunca um elemento DOM
 * por partícula). O PNG é só o MAPA: lido uma vez com `getImageData`, vira uma lista de destinos
 * com a cor original de cada ponto — o `<img>` nunca aparece.
 *
 * O GSAP anima só dois números globais (`state.form`, `state.disperse`); o loop de
 * `requestAnimationFrame` interpreta esse progresso para todas as partículas, cada uma com um
 * pequeno atraso/deslocamento próprio para não parecer rígido.
 */
export type ParticleLogoPhase = "idle" | "forming" | "formed" | "disintegrating" | "hidden";

interface Particle {
  /** Destino, relativo ao centro da logo (px CSS). */
  tx: number;
  ty: number;
  /** Nascimento: perto do destino, disperso. */
  sx: number;
  sy: number;
  /** Saída: para cima, com leve variação horizontal. */
  ex: number;
  ey: number;
  size: number;
  color: string;
  glow: boolean;
  delayIn: number;
  delayOut: number;
}

/** Área onde as partículas podem aparecer (o preto da cutscene), em px CSS: faixa vertical cujas
 * bordas sobem/descem em chevron até o centro (a silhueta do pico da frente). */
export interface ParticleClip {
  top: number;
  bottom: number;
  /** Quanto a borda de cima sobe no centro da tela. */
  topPeak: number;
  /** Quanto a borda de baixo desce no centro da tela. */
  bottomPeak: number;
}

const ALPHA_THRESHOLD = 128;
const IN_SPREAD = 0.35;
const OUT_SPREAD = 0.35;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInQuad(t: number) {
  return t * t;
}

function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Tamanho da logo: pela altura da viewport, limitado pela largura (proporção original). */
function logoSize(viewportW: number, viewportH: number, aspect: number) {
  let height = Math.min(340, Math.max(170, viewportH * 0.34));
  if (height * aspect > viewportW * 0.6) height = (viewportW * 0.6) / aspect;
  return { width: Math.round(height * aspect), height: Math.round(height) };
}

export class ParticleLogo {
  readonly state = { form: 0, disperse: 0 };
  phase: ParticleLogoPhase = "idle";

  private image: HTMLImageElement | null = null;
  private loading: Promise<void> | null = null;
  private particles: Particle[] = [];
  private builtFor = "";
  private logoH = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpr = 1;
  private frame = 0;
  private getClip: (() => ParticleClip | null) | null = null;

  constructor(private readonly src: string) {}

  /** Busca e decodifica a imagem (uma vez). Chamar cedo, em tempo ocioso. */
  preload(): Promise<void> {
    if (this.loading) return this.loading;
    this.loading = new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.src = this.src;
      image
        .decode()
        .then(() => {
          this.image = image;
          resolve();
        })
        .catch(() => resolve());
    });
    return this.loading;
  }

  get ready() {
    return this.image !== null;
  }

  /** Gera os destinos para o tamanho de viewport atual (barato: só refaz se a viewport mudou). */
  prepare(viewportW: number, viewportH: number) {
    const image = this.image;
    if (!image) return;
    const key = `${viewportW}x${viewportH}`;
    if (key === this.builtFor) return;
    this.builtFor = key;

    const aspect = image.naturalWidth / image.naturalHeight;
    const { width, height } = logoSize(viewportW, viewportH, aspect);
    this.logoH = height;
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const octx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.drawImage(image, 0, 0, width, height);
    const { data } = octx.getImageData(0, 0, width, height);

    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > ALPHA_THRESHOLD) opaque++;
    const target = viewportW < 700 ? 750 : 1200;
    const step = Math.max(2, Math.round(Math.sqrt(opaque / target)));
    const scale = height / 340;
    const particleBase = Math.min(3, Math.max(1.2, step * 0.55));

    const particles: Particle[] = [];
    for (let py = Math.floor(step / 2); py < height; py += step) {
      for (let px = Math.floor(step / 2); px < width; px += step) {
        const jx = Math.min(width - 1, Math.max(0, Math.round(px + (Math.random() - 0.5) * step * 0.4)));
        const jy = Math.min(height - 1, Math.max(0, Math.round(py + (Math.random() - 0.5) * step * 0.4)));
        const i = (jy * width + jx) * 4;
        if (data[i + 3] <= ALPHA_THRESHOLD) continue;
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const tx = jx - width / 2;
        const ty = jy - height / 2;
        const angle = Math.random() * Math.PI * 2;
        const radius = (30 + Math.random() * 70) * scale;
        const fromBottom = (ty + height / 2) / height;
        particles.push({
          tx,
          ty,
          sx: tx + Math.cos(angle) * radius,
          sy: ty + Math.sin(angle) * radius,
          ex: tx + (Math.random() - 0.5) * 50 * scale,
          ey: ty - (100 + Math.random() * 150) * scale,
          size: particleBase * (Math.random() < 0.08 ? 1.5 : 0.8 + Math.random() * 0.35),
          color: `rgb(${r}, ${g}, ${b})`,
          glow: g > r + 40 && g > b + 20,
          delayIn: Math.random() * IN_SPREAD,
          // Base da logo sai primeiro: é por baixo que o preto começa a ser recolhido.
          delayOut: (1 - fromBottom) * (OUT_SPREAD - 0.08) + Math.random() * 0.08,
        });
      }
    }
    this.particles = particles;
  }

  get count() {
    return this.particles.length;
  }

  /** Liga o canvas e o loop de desenho. `getClip` diz onde a massa preta está a cada frame. */
  start(canvas: HTMLCanvasElement, getClip: () => ParticleClip | null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.getClip = getClip;
    this.state.form = 0;
    this.state.disperse = 0;
    this.phase = "forming";
    this.resizeCanvas();
    cancelAnimationFrame(this.frame);
    const loop = () => {
      this.draw();
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  resizeCanvas() {
    const canvas = this.canvas;
    if (!canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * this.dpr);
    canvas.height = Math.round(canvas.clientHeight * this.dpr);
  }

  /** Para o loop e limpa o canvas — pronta para a próxima execução. */
  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    const { canvas, ctx } = this;
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.phase = "hidden";
    this.state.form = 0;
    this.state.disperse = 0;
  }

  private draw() {
    const { canvas, ctx } = this;
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { form, disperse } = this.state;
    if (disperse > 0) this.phase = disperse >= 1 ? "hidden" : "disintegrating";
    else if (form >= 1) this.phase = "formed";
    if (form <= 0 || this.phase === "hidden") return;

    const clip = this.getClip?.();
    if (!clip || clip.bottom + clip.bottomPeak <= clip.top - clip.topPeak) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, clip.top);
    ctx.lineTo(w / 2, clip.top - clip.topPeak);
    ctx.lineTo(w, clip.top);
    ctx.lineTo(w, clip.bottom);
    ctx.lineTo(w / 2, clip.bottom + clip.bottomPeak);
    ctx.lineTo(0, clip.bottom);
    ctx.closePath();
    ctx.clip();

    const cx = w / 2;
    const cy = h / 2;
    for (const p of this.particles) {
      const inT = easeOutCubic(clamp01((form - p.delayIn) / (1 - IN_SPREAD)));
      if (inT <= 0) continue;
      const outT = easeInQuad(clamp01((disperse - p.delayOut) / (1 - OUT_SPREAD)));
      const alpha = inT * (1 - outT);
      if (alpha <= 0.01) continue;
      const x = outT > 0 ? p.tx + (p.ex - p.tx) * outT : p.sx + (p.tx - p.sx) * inT;
      const y = outT > 0 ? p.ty + (p.ey - p.ty) * outT : p.sy + (p.ty - p.sy) * inT;
      const px = cx + x;
      const py = cy + y;
      ctx.fillStyle = p.color;
      if (p.glow) {
        // Glow bem sutil só nas partículas verdes da identidade.
        ctx.globalAlpha = alpha * 0.12;
        ctx.fillRect(px - p.size * 1.5, py - p.size * 1.5, p.size * 3, p.size * 3);
      }
      ctx.globalAlpha = alpha;
      ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** Altura atual da logo (px CSS) — útil para testes/diagnóstico. */
  get height() {
    return this.logoH;
  }
}
