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
import { CUTSCENE_GEOMETRY, piecePolygon, type SceneCutsceneVariant } from "./sceneCutsceneGeometry";
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
 * Cutscene de troca de cena ("layered vertical wipe"): placas geométricas de tela cheia
 * (`sceneCutsceneGeometry.ts`) sobem de baixo para cima com velocidades levemente diferentes, a
 * troca de conteúdo acontece SÓ com a viewport totalmente coberta (`onCovered`), e as placas
 * continuam subindo revelando a cena nova. Genérica de propósito — não sabe nada do Builder:
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
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [variant, setVariant] = useState<SceneCutsceneVariant>("peaks");
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
    ({ preset = "default", onCovered, delay = 0 }: PlaySceneCutsceneOptions) => {
      if (playingRef.current) return false;

      const config = SCENE_CUTSCENE_PRESETS[preset];
      // Geometria diferente da que está montada: troca antes de medir/animar (raro — hoje só há uma).
      if (!reducedMotion && config.variant !== variant) flushSync(() => setVariant(config.variant));

      const root = rootRef.current;
      const geometry = CUTSCENE_GEOMETRY[config.variant];
      const pieces = geometry.pieces.map((_, index) => pieceRefs.current[index]);
      if (reducedMotion || !root || pieces.some((piece) => !piece)) {
        onCovered({ hidden: false });
        return true;
      }
      const elements = pieces as HTMLDivElement[];

      playingRef.current = true;
      revealPendingRef.current = true;
      setIsPlaying(true);

      root.style.setProperty("--transition-accent", config.accent);
      root.style.setProperty("--transition-base", config.base);
      root.dataset.active = "true";

      const timeline = gsap.timeline({
        delay,
        defaults: { ease: config.ease, force3D: true },
        onComplete: () => {
          gsap.set(elements, { yPercent: 100 });
          delete root.dataset.active;
          timelineRef.current = null;
          playingRef.current = false;
          setIsPlaying(false);
          settleCallRef.current = gsap.delayedCall(REVEAL_SETTLE_S, flushRevealQueue);
        },
      });
      timelineRef.current = timeline;

      // Cobrir: cada placa com seu tempo (profundidade), todas convergindo juntas na cobertura.
      timeline.set(elements, { y: 0, yPercent: 100 });
      geometry.pieces.forEach((piece, index) => {
        timeline.to(elements[index], { yPercent: 0, duration: piece.cover.duration * config.speed }, piece.cover.delay * config.speed);
      });
      timeline.call(() => {
        // `flushSync` garante que a cena nova já está no DOM antes das placas voltarem a andar.
        try {
          flushSync(() => onCovered({ hidden: true }));
        } catch (error) {
          console.error(error);
        }
        // Montar a cena nova pode travar a thread por alguns frames; pausar e retomar no próximo
        // tick faz a revelação começar do ponto certo em vez de "pular" o tempo perdido.
        timeline.pause();
        resumeCallRef.current = gsap.delayedCall(0, () => timeline.resume());
      });
      // Revelar: continuam subindo, agora com a borda espelhada de baixo passando pela tela.
      const revealStart = timeline.duration() + config.hold;
      geometry.pieces.forEach((piece, index) => {
        timeline.to(
          elements[index],
          { yPercent: -100, duration: piece.reveal.duration * config.speed },
          revealStart + piece.reveal.delay * config.speed,
        );
      });

      return true;
    },
    [reducedMotion, variant, flushRevealQueue],
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
            {CUTSCENE_GEOMETRY[variant].pieces.map((piece, index) => (
              <div
                key={piece.id}
                ref={(element) => {
                  pieceRefs.current[index] = element;
                }}
                className={styles.piece}
                style={{ clipPath: piecePolygon(piece, 0) }}
              >
                {piece.rings.map((ring) => (
                  <div
                    key={ring.inset}
                    className={`${styles.ring} ${styles[ring.color]}`}
                    style={{ clipPath: piecePolygon(piece, ring.inset) }}
                  />
                ))}
                {piece.bodyLines && (
                  <>
                    <span className={`${styles.bodyLine} ${styles.bodyLineTop}`} />
                    <span className={`${styles.bodyLine} ${styles.bodyLineBottom}`} />
                  </>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </SceneCutsceneContext.Provider>
  );
}
