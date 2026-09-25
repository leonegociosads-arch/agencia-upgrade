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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const settleCallRef = useRef<gsap.core.Tween | null>(null);
  const resumeCallRef = useRef<gsap.core.Tween | null>(null);
  const playingRef = useRef(false);
  const revealPendingRef = useRef(false);
  const revealQueueRef = useRef(new Set<() => void>());
  const [isPlaying, setIsPlaying] = useState(false);

  useScrollLock(isPlaying);

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
      reset();

      const timeline = gsap.timeline({
        delay,
        defaults: { ease: config.ease, force3D: true },
        onComplete: () => {
          reset();
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

      // BLACKOUT — a cortina assume no mesmo frame em que a massa cobre tudo; o desenho some. Só
      // preto na tela; a troca de conteúdo acontece aqui.
      timeline.addLabel("covered");
      timeline.call(() => {
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
      timeline.set(cover, { visibility: "hidden" }, openAt);
      timeline.to(opening, { y: -S, duration: config.revealDuration * scale }, openAt);

      return true;
    },
    [reducedMotion, flushRevealQueue],
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
      queue.clear();
      playingRef.current = false;
      revealPendingRef.current = false;
    };
  }, []);

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
            {/* Sonda invisível só para medir a altura da faixa dos picos (`--peak-h`) em px. */}
            <div ref={probeRef} className={styles.probe} />
          </div>,
          document.body,
        )}
    </SceneCutsceneContext.Provider>
  );
}
