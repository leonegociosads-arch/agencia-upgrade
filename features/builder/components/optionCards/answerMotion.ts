import gsap from "gsap";

/**
 * Motion "horizontal" das respostas (laboratório — hoje só a 1ª pergunta de Tráfego Pago, junto com
 * o `TrafficOptionCard`). A metáfora é de percurso: as respostas ENTRAM da esquerda e, ao escolher
 * uma, SAEM pela direita — "selecionou → seguimos adiante".
 *
 * Tudo aqui é orquestrado por timelines GSAP (nada de `setTimeout` espalhado) e só anima
 * `transform`/`opacity`. Os valores ficam juntos neste objeto para o motion ser calibrado sem
 * mexer na lógica.
 */
export const ANSWER_MOTION = {
  /** `power4.out` = easeOutQuint = `cubic-bezier(0.22, 1, 0.36, 1)` — desaceleração longa, sem bounce. */
  entryEase: "power4.out",
  /** Aceleração decidida para fora — `power3.in`. */
  exitEase: "power3.in",
  desktop: {
    entryDistance: 96,
    entryDuration: 0.62,
    entryStagger: 0.06,
    exitDuration: 0.4,
  },
  mobile: {
    entryDistance: 56,
    entryDuration: 0.52,
    entryStagger: 0.05,
    exitDuration: 0.34,
  },
  /** Título/rótulo: deslocamento curto, e os cards começam logo depois dele. */
  introDistance: 16,
  introDuration: 0.45,
  cardsAfterIntro: 0.08,
  /** A opção escolhida fica acesa (+ microcompressão) por este tempo antes de sair. */
  selectedHold: 0.11,
  /** Vantagem da opção escolhida sobre as outras na saída. */
  selectedLead: 0.05,
  /** Diferença mínima entre as outras opções na saída — uma ação conjunta, não uma fila. */
  exitStagger: 0.02,
} as const;

const MOBILE_BREAKPOINT_PX = 640;

function profile() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX;
  return isMobile ? ANSWER_MOTION.mobile : ANSWER_MOTION.desktop;
}

interface EntryOptions {
  /** Bloco rótulo + pergunta (entra primeiro, bem discreto). Opcional. */
  intro: HTMLElement | null;
  cards: HTMLElement[];
  onComplete: () => void;
}

/** Entrada: rótulo + pergunta deslizam poucos pixels; logo depois, os cards chegam da esquerda em
 * onda (stagger curto). O opacity só suaviza o começo — quem conta a história é o `x`. */
export function animateAnswersEntry({ intro, cards, onComplete }: EntryOptions): gsap.core.Timeline {
  const { entryDistance, entryDuration, entryStagger } = profile();
  const timeline = gsap.timeline({ onComplete });

  if (intro) {
    timeline.fromTo(
      intro,
      { x: -ANSWER_MOTION.introDistance, opacity: 0 },
      { x: 0, opacity: 1, duration: ANSWER_MOTION.introDuration, ease: ANSWER_MOTION.entryEase },
      0,
    );
  }

  const cardsStart = intro ? ANSWER_MOTION.cardsAfterIntro : 0;
  timeline.fromTo(
    cards,
    { x: -entryDistance },
    { x: 0, duration: entryDuration, stagger: entryStagger, ease: ANSWER_MOTION.entryEase },
    cardsStart,
  );
  // Opacity curta e separada: some antes da metade do deslocamento, então o card nunca "aparece
  // por transparência" — ele chega.
  timeline.fromTo(
    cards,
    { opacity: 0 },
    { opacity: 1, duration: entryDuration * 0.3, stagger: entryStagger, ease: "power1.out" },
    cardsStart,
  );

  return timeline;
}

interface ExitOptions {
  selected: HTMLElement;
  cards: HTMLElement[];
  onComplete: () => void;
}

/** Distância até o card sumir inteiro pela borda direita da janela (não do container — nada de
 * corte no meio da tela). A página já tem `overflow-x: hidden` no html/body, então isso nunca
 * gera rolagem lateral. */
function distanceToLeaveViewport(card: HTMLElement): number {
  const rect = card.getBoundingClientRect();
  return Math.max(window.innerWidth - rect.left, rect.width) + 24;
}

/** Saída: a escolhida confirma (microcompressão enquanto o estado "selecionado" acende), dispara
 * primeiro, e as demais a acompanham quase juntas. `onComplete` só roda quando a lista inteira
 * já saiu — é ali que a navegação existente acontece. */
export function animateAnswersExit({ selected, cards, onComplete }: ExitOptions): gsap.core.Timeline {
  const { exitDuration } = profile();
  const others = cards.filter((card) => card !== selected);
  // Clique no meio da entrada: a saída assume a partir de onde cada card está (nada de duas
  // animações disputando o mesmo `x`).
  gsap.killTweensOf(cards);
  const timeline = gsap.timeline({ onComplete });

  timeline.to(selected, { scale: 0.995, duration: ANSWER_MOTION.selectedHold * 0.5, ease: "power1.out" }, 0);
  timeline.to(selected, { scale: 1, duration: ANSWER_MOTION.selectedHold * 0.5, ease: "power1.out" });

  const leaveAt = ANSWER_MOTION.selectedHold;
  const fadeDelay = exitDuration * 0.55;
  const fadeDuration = exitDuration - fadeDelay;

  timeline.to(selected, { x: () => distanceToLeaveViewport(selected), duration: exitDuration, ease: ANSWER_MOTION.exitEase }, leaveAt);
  timeline.to(selected, { opacity: 0, duration: fadeDuration, ease: "power1.in" }, leaveAt + fadeDelay);

  if (others.length > 0) {
    const othersAt = leaveAt + ANSWER_MOTION.selectedLead;
    timeline.to(
      others,
      { x: (_index: number, card: HTMLElement) => distanceToLeaveViewport(card), duration: exitDuration, stagger: ANSWER_MOTION.exitStagger, ease: ANSWER_MOTION.exitEase },
      othersAt,
    );
    timeline.to(
      others,
      { opacity: 0, duration: fadeDuration, stagger: ANSWER_MOTION.exitStagger, ease: "power1.in" },
      othersAt + fadeDelay,
    );
  }

  return timeline;
}
