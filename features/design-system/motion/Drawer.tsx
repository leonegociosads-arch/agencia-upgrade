"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { DURATION, EASE } from "./motionConfig";

export interface DrawerProps {
  open: boolean;
  overlayClassName: string;
  panelClassName: string;
  overlayProps?: HTMLAttributes<HTMLDivElement>;
  panelProps?: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
  /** Fecha ao pressionar Esc (Etapa 31 — Testes Funcionais, briefing Seção 93: "Escape: fechar
   * modal/drawer/menu quando apropriado" — gap real encontrado via teste de acessibilidade, nenhum
   * componente do projeto tratava Escape antes desta correção). Opcional só para não quebrar quem
   * já usa `Drawer` sem uma forma de fechar por fora (nenhum caso assim existe hoje). */
  onClose?: () => void;
}

/**
 * Drawer/painel/bottom sheet genérico com abertura e fechamento animados via GSAP (Fase GSAP e
 * Transições, Seções 24-25 — "Meu Upgrade": "usar timeline curta"; "ao fechar: inverter de forma
 * controlada"). Só cuida de motion + foco; POSIÇÃO (painel lateral no desktop vs. bottom sheet no
 * mobile) continua 100% CSS/`@media` de quem usa este componente (`BuilderShell.module.css`) —
 * animar `scale`+`opacity` (em vez de uma direção de entrada específica) funciona igual bem nos
 * dois layouts, sem o componente precisar saber em qual breakpoint está.
 *
 * Ao contrário de `SceneTransition` (que sempre tem uma cena "atual" nova para mostrar), um
 * drawer fechado é simplesmente NADA — por isso, ao fechar, o conteúdo continua montado durante a
 * animação de saída (`rendered` fica `true` um instante a mais que `open`) e só desmonta de
 * verdade quando a animação termina.
 */
export default function Drawer({
  open,
  overlayClassName,
  panelClassName,
  overlayProps,
  panelProps,
  children,
  onClose,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [rendered, setRendered] = useState(open);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !onClose) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Abrir: monta (se preciso) e sempre garante `rendered = true` antes do efeito de entrada rodar.
  // `setState` aqui é intencional (não um cálculo derivado que caberia no corpo do render): o
  // ponto do efeito é capturar `document.activeElement` — um sistema externo de verdade — no
  // exato instante em que o drawer abre, para devolver o foco a ele ao fechar (Seção 25 do
  // briefing). Fazer essa leitura durante o render (em vez de um efeito) arriscaria capturar um
  // valor errado em uma repetição de render descartada (Strict Mode, React concorrente).
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ligado à leitura externa acima, não um cálculo derivado redundante.
      setRendered(true);
    }
  }, [open]);

  // Anima a ENTRADA — só quando `rendered` acabou de virar `true` por causa de `open`.
  useEffect(() => {
    if (!open || !rendered) return;
    const overlayEl = overlayRef.current;
    const panelEl = panelRef.current;
    if (!overlayEl || !panelEl) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([overlayEl, panelEl], { clearProps: "all" });
      } else {
        gsap.set(panelEl, { opacity: 0, scale: 0.97 });
        gsap.set(overlayEl, { opacity: 0 });
        const timeline = gsap.timeline();
        timeline.to(overlayEl, { opacity: 1, duration: DURATION.normal, ease: EASE.standard }, 0);
        timeline.to(panelEl, { opacity: 1, scale: 1, duration: DURATION.slow, ease: EASE.emphasized }, 0.05);
      }
      // Foco (Seção 25 do briefing: "abrir: backdrop, painel, conteúdo, foco") — move para o
      // painel, nunca para dentro de um campo específico (o próprio conteúdo decide o que faz
      // mais sentido receber foco depois, ex. o botão de fechar).
      panelEl.focus();
    }, panelRef);

    return () => ctx.revert();
  }, [open, rendered, reducedMotion]);

  // Anima a SAÍDA quando `open` vira `false` enquanto o painel ainda está montado.
  useEffect(() => {
    if (open || !rendered) return;
    const overlayEl = overlayRef.current;
    const panelEl = panelRef.current;

    function finish() {
      setRendered(false);
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    }

    if (!overlayEl || !panelEl) {
      finish();
      return;
    }

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        finish();
        return;
      }
      const timeline = gsap.timeline({ onComplete: finish });
      timeline.to(panelEl, { opacity: 0, scale: 0.97, duration: DURATION.fast, ease: EASE.exit }, 0);
      timeline.to(overlayEl, { opacity: 0, duration: DURATION.fast, ease: EASE.exit }, 0);
    });

    return () => ctx.revert();
  }, [open, rendered, reducedMotion]);

  if (!rendered) return null;

  return (
    <div ref={overlayRef} className={overlayClassName} {...overlayProps}>
      <div ref={panelRef} className={panelClassName} tabIndex={-1} {...panelProps}>
        {children}
      </div>
    </div>
  );
}
