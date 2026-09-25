"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { useScrollLock } from "./useScrollLock";
import { SCENE_CUTSCENE_PRESETS, type SceneCutscenePresetName } from "./sceneCutscenePresets";
import { CUTSCENE_PEAKS, peakPolygon } from "./sceneCutsceneGeometry";
import { ParticleLogo, type ParticleClip } from "./particleLogo";
import styles from "./SceneCutscene.module.css";

export interface SceneCutsceneCoveredInfo {
  /** `true` quando a troca acontece de fato escondida atrás da cortina; `false` no caminho sem
   * animação (reduced motion) — quem chama decide se ainda quer sua própria transição leve. */
  hidden: boolean;
}

export interface PlaySceneCutsceneOptions {
  preset?: SceneCutscenePresetName;
  /** Cor de acento explícita (sobrepõe a do preset). */
  accent?: string;
  /** Chamado com a viewport 100% preta — é aqui que a troca de estado/tela acontece. */
  onCovered: (info: SceneCutsceneCoveredInfo) => void;
  /** Espera antes do desenho começar a subir (ex.: feedback de clique do card). */
  delay?: number;
  /** Duração total aproximada (s) do fechamento + preto + abertura; padrão vem do preset. */
  duration?: number;
}

interface SceneCutsceneContextValue {
  /** Retorna `false` (e não faz nada) se já existe uma cutscene tocando. */
  play: (options: PlaySceneCutsceneOptions) => boolean;
  isPlaying: boolean;
  /** Roda `callback` quando a cena nova estiver revelada (na hora, se nada estiver tocando).
   * Retorna um cancelador — para animações de entrada esperarem a cortina sair. */
  whenRevealed: (callback: () => void) => () => void;
}

const noop = () => {};

const SceneCutsceneContext = createContext<SceneCutsceneContextValue>({
  play: ({ onCovered }) => {
    onCovered({ hidden: false });
    return true;
  },
  isPlaying: false,
  whenRevealed: (callback) => {
    callback();
    return noop;
  },
});

export function useSceneCutscene(): SceneCutsceneContextValue {
  return useContext(SceneCutsceneContext);
}

// Pausa curta entre a cortina terminar de sair e a entrada da cena nova começar (hierarquia de
// movimento: cortina -> respiro -> cards -> flutuação, nunca tudo junto).
const REVEAL_SETTLE_S = 0.07;

function subscribeNothing() {
  return noop;
}

const LOGO_SRC = "/assets/cutscene/upgrade-logo.png";
const FRONT_APEX_Y = CUTSCENE_PEAKS.find((peak) => peak.id === "front")?.apexY ?? 0;
/** A logo começa a se formar com 25% do fechamento andado e termina junto com ele. */
const FORM_START = 0.25;
/** A logo termina de ser recolhida com 80% da abertura andada. */
const DISPERSE_SHARE = 0.8;

/** O desenho inteiro (picos + massa preta), idêntico nas duas peças. */
function CutsceneShape() {
  return (
    <>
      <div className={styles.mass} />
      {CUTSCENE_PEAKS.map((peak) => (
        <div key={peak.id}>
          {peak.rings.map((ring, index) => (
            <div
              key={ring.inset}
              className={`${styles.ring} ${styles[ring.color]}`}
              style={{ clipPath: peakPolygon(peak, ring.inset, index === peak.rings.length - 1) }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/**
 * Cutscene de troca de cena. Um único desenho geométrico (três picos sobre uma massa preta) sobe
 * como UMA peça de baixo para cima até a massa cobrir a tela; nesse instante a cortina preta
 * assume, a troca de conteúdo acontece (`onCovered`), e depois de um respiro o mesmo desenho,
 * espelhado verticalmente, sobe revelando a cena nova. Genérica: não sabe nada do Builder.
 *
 * Com `prefers-reduced-motion`, nada aparece: `onCovered` roda na hora, síncrono (o mesmo contrato
 * síncrono do clique que as suítes de fluxo do Builder verificam).
 */
export function SceneCutsceneProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  // Portal só existe no cliente — no servidor e na hidratação nada é renderizado (sem mismatch).
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef<HTMLDivElement | null>(null);
  const openingRef = useRef<HTMLDivElement | null>(null);
  const probeRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particleLogo] = useState(() => new ParticleLogo(LOGO_SRC));
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const settleCallRef = useRef<gsap.core.Tween | null>(null);
  const resumeCallRef = useRef<gsap.core.Tween | null>(null);
  const playingRef = useRef(false);
  const revealPendingRef = useRef(false);
  const revealQueueRef = useRef(new Set<() => void>());
  const [isPlaying, setIsPlaying] = useState(false);

  useScrollLock(isPlaying);

  // Prepara o mapa de partículas antes do primeiro clique (busca + decode + getImageData em tempo
  // ocioso) e refaz os destinos quando a viewport muda.
  useEffect(() => {
    if (reducedMotion) return;
    const prepare = () => {
      particleLogo.prepare(window.innerWidth, window.innerHeight);
      particleLogo.resizeCanvas();
    };
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => {
      particleLogo.preload().then(prepare);
    });
    window.addEventListener("resize", prepare);
    return () => {
      cancelIdle(handle);
      window.removeEventListener("resize", prepare);
    };
  }, [particleLogo, reducedMotion]);

  const flushRevealQueue = useCallback(() => {
    revealPendingRef.current = false;
    const queue = Array.from(revealQueueRef.current);
    revealQueueRef.current.clear();
    queue.forEach((callback) => callback());
  }, []);

  const play = useCallback(
    ({ preset = "default", accent, onCovered, delay = 0, duration }: PlaySceneCutsceneOptions) => {
      if (playingRef.current) return false;

      const root = rootRef.current;
      const cover = coverRef.current;
      const closing = closingRef.current;
      const opening = openingRef.current;
      const probe = probeRef.current;
      if (reducedMotion || !root || !cover || !closing || !opening || !probe) {
        onCovered({ hidden: false });
        return true;
      }

      const config = SCENE_CUTSCENE_PRESETS[preset];
      const total = config.coverDuration + config.hold + config.revealDuration;
      const scale = duration ? duration / total : 1;

      playingRef.current = true;
      revealPendingRef.current = true;
      setIsPlaying(true);

      root.style.setProperty("--transition-accent", accent ?? config.accent);
      root.style.setProperty("--transition-base", config.base);
      root.dataset.active = "true";

      // V = viewport; P = altura da faixa dos picos (a massa começa em P dentro da peça);
      // S = altura da peça inteira (P + massa com a altura da viewport).
      const V = root.clientHeight;
      const P = probe.offsetTop;
      const S = closing.offsetHeight;
      const reset = () => {
        gsap.set([closing, opening], { y: V * 2, visibility: "hidden" });
        gsap.set(cover, { visibility: "hidden" });
      };

      // Partículas só aparecem dentro da massa preta: sobem junto com o preto no fechamento, ficam
      // livres no blackout e são recolhidas junto com o preto na abertura.
      let stage: "closing" | "black" | "opening" = "closing";
      const M = S - P;
      // O preto sobe até a ponta do pico da frente (bordas nas laterais, ponta no centro); 3px de
      // folga para ficar dentro do filete de acento.
      const peakRise = (1 - FRONT_APEX_Y) * P - 3;
      const getClip = (): ParticleClip => {
        if (stage === "black") return { top: 0, bottom: V, topPeak: 0, bottomPeak: 0 };
        if (stage === "closing") {
          const yc = Number(gsap.getProperty(closing, "y"));
          return { top: yc + P, bottom: V, topPeak: peakRise, bottomPeak: 0 };
        }
        const yo = Number(gsap.getProperty(opening, "y"));
        return { top: 0, bottom: yo + M, topPeak: 0, bottomPeak: peakRise };
      };
      const canvas = canvasRef.current;
      const withLogo = particleLogo.ready && canvas !== null;
      if (withLogo) {
        particleLogo.prepare(root.clientWidth, V);
        particleLogo.start(canvas, getClip);
      }
      reset();

      const timeline = gsap.timeline({
        delay,
        defaults: { ease: config.ease, force3D: true },
        onComplete: () => {
          reset();
          particleLogo.stop();
          delete root.dataset.active;
          timelineRef.current = null;
          playingRef.current = false;
          setIsPlaying(false);
          settleCallRef.current = gsap.delayedCall(REVEAL_SETTLE_S, flushRevealQueue);
        },
      });
      timelineRef.current = timeline;

      // FECHAMENTO — o desenho inteiro sobe: ponta entrando pela borda de baixo até a massa preta
      // cobrir a viewport (picos já acima da borda de cima).
      timeline.set(closing, { y: V, visibility: "visible" });
      timeline.to(closing, { y: -P - 2, duration: config.coverDuration * scale });
      if (withLogo) {
        timeline.to(
          particleLogo.state,
          { form: 1, duration: config.coverDuration * (1 - FORM_START) * scale, ease: "none" },
          config.coverDuration * FORM_START * scale,
        );
      }

      // BLACKOUT — a cortina assume no mesmo frame em que a massa cobre tudo; o desenho some. Só
      // preto na tela; a troca de conteúdo acontece aqui.
      timeline.addLabel("covered");
      timeline.call(() => {
        stage = "black";
        gsap.set(cover, { visibility: "visible" });
        gsap.set(closing, { visibility: "hidden" });
        // `flushSync` garante que a cena nova já está no DOM antes da abertura começar.
        try {
          flushSync(() => onCovered({ hidden: true }));
        } catch (error) {
          console.error(error);
        }
        // Montar a cena nova pode travar a thread por alguns frames; pausar e retomar no próximo
        // tick faz o preto durar o `hold` inteiro em vez de "pular" o tempo perdido.
        timeline.pause();
        resumeCallRef.current = gsap.delayedCall(0, () => timeline.resume());
      });

      // ABERTURA — o mesmo desenho invertido: começa com a massa cobrindo a tela (troca invisível
      // com a cortina) e sobe até os picos invertidos passarem da borda de cima.
      const openAt = timeline.duration() + config.hold * scale;
      timeline.set(opening, { y: -2, visibility: "visible" }, openAt);
      timeline.call(() => {
        stage = "opening";
      }, undefined, openAt);
      timeline.set(cover, { visibility: "hidden" }, openAt);
      timeline.to(opening, { y: -S, duration: config.revealDuration * scale }, openAt);
      if (withLogo) {
        timeline.to(
          particleLogo.state,
          { disperse: 1, duration: config.revealDuration * DISPERSE_SHARE * scale, ease: "none" },
          openAt,
        );
      }

      return true;
    },
    [reducedMotion, flushRevealQueue, particleLogo],
  );

  const whenRevealed = useCallback((callback: () => void) => {
    if (!revealPendingRef.current) {
      callback();
      return noop;
    }
    revealQueueRef.current.add(callback);
    return () => {
      revealQueueRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    const queue = revealQueueRef.current;
    return () => {
      timelineRef.current?.kill();
      settleCallRef.current?.kill();
      resumeCallRef.current?.kill();
      particleLogo.stop();
      queue.clear();
      playingRef.current = false;
      revealPendingRef.current = false;
    };
  }, [particleLogo]);

  const value = useMemo(() => ({ play, isPlaying, whenRevealed }), [play, isPlaying, whenRevealed]);

  return (
    <SceneCutsceneContext.Provider value={value}>
      {children}
      {isClient &&
        createPortal(
          <div ref={rootRef} className={styles.root} aria-hidden="true">
            <div ref={coverRef} className={styles.cover} />
            <div ref={closingRef} className={styles.shape}>
              <div className={styles.flip}>
                <CutsceneShape />
              </div>
            </div>
            <div ref={openingRef} className={`${styles.shape} ${styles.inverted}`}>
              <div className={styles.flip}>
                <CutsceneShape />
              </div>
            </div>
            {/* Partículas da logo: acima da geometria, mas recortadas a cada frame para só aparecer
             * dentro da massa preta. */}
            <canvas ref={canvasRef} className={styles.particles} />
            {/* Sonda invisível só para medir a altura da faixa dos picos (`--peak-h`) em px. */}
            <div ref={probeRef} className={styles.probe} />
          </div>,
          document.body,
        )}
    </SceneCutsceneContext.Provider>
  );
}
