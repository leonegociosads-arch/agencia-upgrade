"use client";

import type { MouseEvent } from "react";
import { cx } from "@/features/design-system/utils/cx";
import type { Question } from "../../types";
import styles from "./TrafficOptionCard.module.css";

/**
 * Laboratório visual das respostas (pedido do usuário): card de resposta desenhado 100% em código
 * — sem PNG, sem ilustração — para encontrar o padrão definitivo das perguntas internas. Por
 * enquanto vale SÓ para as perguntas listadas aqui; todas as outras continuam com o `OptionCard`
 * de sempre (arte em PNG). Para testar em outra pergunta no futuro, basta incluir o id dela.
 */
const TRAFFIC_OPTION_CARD_QUESTIONS: ReadonlySet<string> = new Set(["trafego_negocio"]);

export function usesTrafficOptionCard(question: Question): boolean {
  return TRAFFIC_OPTION_CARD_QUESTIONS.has(question.id);
}

interface TrafficOptionCardProps {
  /** Posição da opção na lista (0, 1, 2…) — vira o identificador discreto "01", "02"… */
  index: number;
  label: string;
  description?: string;
  selected: boolean;
  /** Múltipla escolha: expõe `aria-pressed` (o componente já nasce pronto para ser reaproveitado). */
  showCheck: boolean;
  disabled: boolean;
  className?: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Estrutura: o `<button>` é só a área clicável (foco, teclado, clique, e é ele que a entrada GSAP
 * da lista move). Tudo o que é visual mora no `.surface` interno — assim o "subir 1px" do hover
 * (CSS) nunca briga com o `transform` inline que a entrada escreve no botão.
 *
 * A silhueta chanfrada é um `clip-path` em duas camadas (`.frame` = a linha de 1px, `.fill` = o
 * interior escuro 1px para dentro); o glow é um `drop-shadow` no `.surface`, que acompanha o
 * recorte (um `box-shadow` desenharia um retângulo).
 */
export default function TrafficOptionCard({
  index,
  label,
  description,
  selected,
  showCheck,
  disabled,
  className,
  onClick,
}: TrafficOptionCardProps) {
  return (
    <button
      type="button"
      className={cx(styles.card, className)}
      data-selected={selected || undefined}
      aria-pressed={showCheck ? selected : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.surface}>
        <span className={styles.frame} aria-hidden="true" />
        <span className={styles.fill} aria-hidden="true" />
        <span className={styles.lightLine} aria-hidden="true" />

        <span className={styles.index} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>

        <span className={styles.indicator} aria-hidden="true">
          {selected ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 12.5 10 17 18.5 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
