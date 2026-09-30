import gsap from "gsap";

/**
 * Motion da cena especial de pergunta (laboratório — hoje só a situação com anúncios do Tráfego
 * Pago, ver `usesPurpleShowcase`). Mesma metáfora das respostas simples: a cena ENTRA pela
 * esquerda e, ao confirmar em "Próxima", SAI pela direita.
 *
 * Tudo é uma timeline GSAP com sobreposição (nada de `setTimeout`) e só anima `transform`/
 * `opacity`. O GSAP nunca "endireita" a página: a inclinação de repouso vem do CSS
 * (`.stage { rotate }`), e aqui só se soma uma rotação extra no invólucro `.enter`, que é limpa no
 * fim (`clearProps`) — a posição final é exatamente a do CSS.
 */
export const PANEL_MOTION = {
  entryEase: "power3.out",
  exitEase: "power3.in",
  desktop: { entryX: 130, entryY: 24, entryRotation: -2, entryDuration: 0.68, exitDuration: 0.42, exitRotation: 2 },
  mobile: { entryX: 56, entryY: 16, entryRotation: -1, entryDuration: 0.58, exitDuration: 0.36, exitRotation: 1 },
} as const;

const MOBILE_BREAKPOINT_PX = 640;

function profile() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX;
  return isMobile ? PANEL_MOTION.mobile : PANEL_MOTION.desktop;
}

/** Elementos que a timeline move, já separados por grupo (ordem de chegada da cena). */
export interface PanelMotionTargets {
  /** Invólucro de tudo (cabeçalho escuro + painel + camada roxa + post-it). */
  enter: HTMLElement;
  /** Camada roxa atrás do painel — entra com um pequeno atraso, para dar profundidade. */
  slab: HTMLElement | null;
  /** Grupo 1: etapa, contador, barra de progresso e aba do caminho. */
  header: HTMLElement[];
  /** Grupo 2: título e subtítulo. */
  heading: HTMLElement[];
  /** Grupo 3: as alternativas. */
  options: HTMLElement[];
  /** Grupo 4: Voltar e Próxima. */
  actions: HTMLElement | null;
  /** Grupo 5: post-it. */
  postIt: HTMLElement | null;
}

function everything(t: PanelMotionTargets): HTMLElement[] {
  return [t.enter, t.slab, ...t.header, ...t.heading, ...t.options, t.actions, t.postIt].filter(
    (el): el is HTMLElement => el !== null,
  );
}

export function animatePanelEntry(targets: PanelMotionTargets, onComplete: () => void): gsap.core.Timeline {
  const { entryX, entryY, entryRotation, entryDuration } = profile();
  const timeline = gsap.timeline({
    onComplete: () => {
      // Devolve `transform` ao CSS (inclinação de repouso) e `opacity` ao que o CSS decidir.
      gsap.set(everything(targets).filter((el) => el !== targets.enter), { clearProps: "transform,opacity" });
      gsap.set(targets.enter, { clearProps: "transform" });
      onComplete();
    },
  });

  // Página inteira: chega da esquerda, desacelera e encaixa na inclinação do CSS.
  timeline.fromTo(
    targets.enter,
    { x: -entryX, y: entryY, rotation: entryRotation },
    { x: 0, y: 0, rotation: 0, duration: entryDuration, ease: PANEL_MOTION.entryEase },
    0,
  );
  // A opacidade só suaviza a chegada (termina cedo); quem conta é o deslocamento.
  timeline.fromTo(targets.enter, { opacity: 0 }, { opacity: 1, duration: entryDuration * 0.4, ease: "power1.out" }, 0);

  // Camada roxa: um instante depois, vinda um pouco mais de trás — profundidade, não duas cenas.
  if (targets.slab) {
    timeline.fromTo(
      targets.slab,
      { x: -entryX * 0.35, opacity: 0 },
      { x: 0, opacity: 1, duration: entryDuration * 0.9, ease: PANEL_MOTION.entryEase },
      0.06,
    );
  }

  // Conteúdo interno em grupos, bem sobrepostos: cabeçalho → título → alternativas → botões.
  const rise = (els: HTMLElement[] | HTMLElement | null, y: number, at: number, extra: gsap.TweenVars = {}) => {
    if (!els || (Array.isArray(els) && els.length === 0)) return;
    timeline.fromTo(els, { y, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out", ...extra }, at);
  };
  rise(targets.header, 10, 0.2);
  rise(targets.heading, 12, 0.3);
  rise(targets.options, 14, 0.38, { stagger: 0.05 });
  rise(targets.actions, 10, 0.5);

  // Post-it por último: "cola" com um leve encaixe (sem bounce).
  if (targets.postIt) {
    timeline.fromTo(
      targets.postIt,
      { scale: 0.9, rotation: -6, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.46, ease: "power3.out" },
      0.56,
    );
  }

  return timeline;
}

/** Distância até a página sair inteira pela borda direita da janela. */
function distanceToLeaveViewport(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return Math.max(window.innerWidth - rect.left, rect.width) + 40;
}

/** Saída: o botão confirma (microcompressão) e a página inteira — painel, camada roxa e post-it,
 * todos dentro de `.enter` — segue para a direita, com uma rotação extra bem pequena. `onComplete`
 * só roda quando ela já saiu: é ali que o avanço de sempre do Builder acontece. */
export function animatePanelExit(
  targets: { enter: HTMLElement; button: HTMLElement | null },
  onComplete: () => void,
): gsap.core.Timeline {
  const { exitDuration, exitRotation } = profile();
  const timeline = gsap.timeline({ onComplete });
  const leaveAt = targets.button ? 0.1 : 0;

  if (targets.button) {
    timeline.to(targets.button, { scale: 0.96, duration: 0.05, ease: "power1.out" }, 0);
    timeline.to(targets.button, { scale: 1, duration: 0.05, ease: "power1.out" }, 0.05);
  }
  timeline.to(
    targets.enter,
    {
      x: () => distanceToLeaveViewport(targets.enter),
      y: 12,
      rotation: exitRotation,
      duration: exitDuration,
      ease: PANEL_MOTION.exitEase,
    },
    leaveAt,
  );
  // O fade só começa na segunda metade do trajeto: primeiro se percebe o deslocamento.
  timeline.to(targets.enter, { opacity: 0, duration: exitDuration * 0.4, ease: "power1.in" }, leaveAt + exitDuration * 0.6);
  return timeline;
}
