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
import { CUTSCENE_GEOMETRY, trianglePolygon, type SceneCutsceneVariant } from "./sceneCutsceneGeometry";
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

const PHASES = ["closing", "opening"] as const;
const POSITIONS = ["left", "center", "right"] as const;
type Phase = (typeof PHASES)[number];
type Position = (typeof POSITIONS)[number];

function nodeKey(phase: Phase, position: Position) {
  return `${phase}-${position}`;
}

/**
 * Cutscene de troca de cena: uma formação de três triângulos ▲ sobe na frente de uma cortina preta
 * até cobrir a tela, a troca de conteúdo acontece SÓ com a viewport totalmente preta
 * (`onCovered`), e uma segunda formação ▼ sai junto com a cortina revelando a cena nova
 * (coreografia em `sceneCutsceneGeometry.ts`). Genérica de propósito — não sabe nada do Builder:
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
  const coverRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<Phase, HTMLDivElement | null>>({ closing: null, opening: null });
  const triangleRefs = useRef(new Map<string, HTMLDivElement | null>());
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
      const cover = coverRef.current;
      const closingGroup = groupRefs.current.closing;
      const openingGroup = groupRefs.current.opening;
      const nodes = (phase: Phase, positions: readonly Position[]) =>
        positions.map((position) => triangleRefs.current.get(nodeKey(phase, position)) ?? null);
      const all = PHASES.flatMap((phase) => nodes(phase, POSITIONS));
      if (reducedMotion || !root || !cover || !closingGroup || !openingGroup || all.some((node) => !node)) {
        onCovered({ hidden: false });
        return true;
      }
      const geometry = CUTSCENE_GEOMETRY[config.variant];
      const triangles = all as HTMLDivElement[];
      const closingCenter = nodes("closing", ["center"]) as HTMLDivElement[];
      const closingLaterals = nodes("closing", ["left", "right"]) as HTMLDivElement[];
      const openingCenter = nodes("opening", ["center"]) as HTMLDivElement[];
      const openingLaterals = nodes("opening", ["left", "right"]) as HTMLDivElement[];
      const moving = [cover, ...triangles];

      playingRef.current = true;
      revealPendingRef.current = true;
      setIsPlaying(true);

      root.style.setProperty("--transition-accent", config.accent);
      root.style.setProperty("--transition-base", config.base);
      root.dataset.active = "true";

      // V = altura da viewport, H = altura do triângulo. Fechamento: triângulos ▲ nascem com a ponta
      // na borda de baixo e terminam com a base na borda de cima; a cortina vem colada na base dos
      // laterais. Abertura: triângulos ▼ nascem com a base colada na borda de baixo da cortina e
      // terminam com a ponta na borda de cima, a cortina saindo junto com os laterais.
      const V = root.clientHeight;
      const H = closingCenter[0].offsetHeight;
      const offscreen = V * 2;
      gsap.set(cover, { y: V + H });
      gsap.set(triangles, { y: V });
      gsap.set(closingGroup, { visibility: "visible" });
      gsap.set(openingGroup, { visibility: "hidden" });

      const t = (seconds: number) => seconds * config.speed;
      const timeline = gsap.timeline({
        delay,
        defaults: { ease: config.ease, force3D: true },
        onComplete: () => {
          gsap.set(moving, { y: offscreen });
          gsap.set([closingGroup, openingGroup], { visibility: "hidden" });
          delete root.dataset.active;
          timelineRef.current = null;
          playingRef.current = false;
          setIsPlaying(false);
          settleCallRef.current = gsap.delayedCall(REVEAL_SETTLE_S, flushRevealQueue);
        },
      });
      timelineRef.current = timeline;

      // FECHAMENTO — o central puxa a formação; esquerdo + direito (e a cortina) juntos logo depois.
      const { closing, opening } = geometry;
      timeline.to(closingCenter, { y: -H, duration: t(closing.center.duration) }, t(closing.center.delay));
      timeline.to(closingLaterals, { y: -H, duration: t(closing.laterals.duration) }, t(closing.laterals.delay));
      timeline.to(cover, { y: 0, duration: t(closing.laterals.duration) }, t(closing.laterals.delay));

      // BLACKOUT — só a cortina na tela; a troca de conteúdo acontece aqui.
      timeline.call(() => {
        gsap.set(closingGroup, { visibility: "hidden" });
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

      // ABERTURA — espelho temporal: esquerdo + direito (e a cortina) primeiro, central logo depois.
      const openAt = timeline.duration() + t(config.hold);
      timeline.set(openingGroup, { visibility: "visible" }, openAt);
      timeline.to(openingLaterals, { y: -H, duration: t(opening.laterals.duration) }, openAt + t(opening.laterals.delay));
      timeline.to(cover, { y: -(V + H), duration: t(opening.laterals.duration) }, openAt + t(opening.laterals.delay));
      timeline.to(openingCenter, { y: -H, duration: t(opening.center.duration) }, openAt + t(opening.center.delay));

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
            <div ref={coverRef} className={styles.cover} />
            {PHASES.map((phase) => (
              <div
                key={phase}
                ref={(element) => {
                  groupRefs.current[phase] = element;
                }}
                className={styles.group}
              >
                {POSITIONS.map((position) => {
                  const key = nodeKey(phase, position);
                  const { rings } = CUTSCENE_GEOMETRY[variant];
                  return (
                    <div
                      key={position}
                      ref={(element) => {
                        triangleRefs.current.set(key, element);
                      }}
                      className={`${styles.triangle} ${styles[position]} ${position === "center" ? styles.front : ""}`}
                    >
                      {(position === "center" ? rings.center : rings.lateral).map((ring) => (
                        <div
                          key={ring.inset}
                          className={`${styles.ring} ${styles[ring.color]}`}
                          style={{ clipPath: trianglePolygon(ring.inset, phase === "closing" ? "up" : "down") }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </SceneCutsceneContext.Provider>
  );
}
