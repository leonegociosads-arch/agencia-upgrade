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
import styles from "./SceneCutscene.module.css";

export interface SceneCutsceneCoveredInfo {
  /** `true` quando a troca acontece de fato escondida atrás da cortina; `false` no caminho sem
   * animação (reduced motion) — quem chama decide se ainda quer sua própria transição leve. */
  hidden: boolean;
}

export interface PlaySceneCutsceneOptions {
  preset?: SceneCutscenePresetName;
  /** Chamado com a viewport 100% coberta — é aqui que a troca de estado/tela acontece. */
  onCovered: (info: SceneCutsceneCoveredInfo) => void;
  /** Espera antes das camadas começarem a subir (ex.: feedback de clique do card). */
  delay?: number;
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

/**
 * Cutscene de troca de cena ("layered vertical wipe"): duas camadas de tela cheia sobem de baixo
 * para cima, a troca de conteúdo acontece SÓ com a viewport totalmente coberta (`onCovered`), e as
 * camadas continuam subindo revelando a cena nova. Genérica de propósito — não sabe nada do Builder:
 * quem chama passa a callback de troca e um preset (`sceneCutscenePresets.ts`).
 *
 * Com `prefers-reduced-motion`, nenhuma camada aparece: `onCovered` roda na hora, síncrono (o mesmo
 * contrato síncrono do clique que as suítes de fluxo do Builder já verificam).
 */
export function SceneCutsceneProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  // Portal só existe no cliente — no servidor e na hidratação nada é renderizado (sem mismatch).
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const settleCallRef = useRef<gsap.core.Tween | null>(null);
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
    ({ preset = "default", onCovered, delay = 0 }: PlaySceneCutsceneOptions) => {
      if (playingRef.current) return false;

      const root = rootRef.current;
      const accent = accentRef.current;
      const base = baseRef.current;
      if (reducedMotion || !root || !accent || !base) {
        onCovered({ hidden: false });
        return true;
      }

      const config = SCENE_CUTSCENE_PRESETS[preset];
      playingRef.current = true;
      revealPendingRef.current = true;
      setIsPlaying(true);

      root.style.setProperty("--cutscene-accent", config.accent);
      root.style.setProperty("--cutscene-base", config.base);
      root.dataset.variant = config.variant;
      root.dataset.active = "true";

      const layers = [accent, base];
      const timeline = gsap.timeline({
        delay,
        defaults: { ease: config.ease, force3D: true },
        onComplete: () => {
          gsap.set(layers, { yPercent: 100 });
          delete root.dataset.active;
          timelineRef.current = null;
          playingRef.current = false;
          setIsPlaying(false);
          settleCallRef.current = gsap.delayedCall(REVEAL_SETTLE_S, flushRevealQueue);
        },
      });
      timelineRef.current = timeline;

      timeline
        .set(layers, { y: 0, yPercent: 100 })
        // Cobrir: acento na frente, base logo atrás (sobreposta) — a base é quem cobre por inteiro.
        .to(accent, { yPercent: 0, duration: config.coverDuration }, 0)
        .to(base, { yPercent: 0, duration: config.coverDuration }, config.layerOffset)
        .call(() => {
          // `flushSync` garante que a cena nova já está no DOM antes da cortina voltar a andar.
          try {
            flushSync(() => onCovered({ hidden: true }));
          } catch (error) {
            console.error(error);
          }
        })
        // Revelar: base sai primeiro, acento por último — o acento só aparece como faixa nas bordas.
        .to(base, { yPercent: -100, duration: config.revealDuration }, `+=${config.hold}`)
        .to(accent, { yPercent: -100, duration: config.revealDuration }, `<+=${config.layerOffset}`);

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
          <div ref={rootRef} className={styles.root} data-variant="default" aria-hidden="true">
            <div ref={accentRef} className={`${styles.layer} ${styles.layerAccent}`} />
            <div ref={baseRef} className={`${styles.layer} ${styles.layerBase}`}>
              <span className={`${styles.edgeLine} ${styles.edgeLineTop}`} />
              <span className={`${styles.edgeLine} ${styles.edgeLineBottom}`} />
            </div>
          </div>,
          document.body,
        )}
    </SceneCutsceneContext.Provider>
  );
}
