"use client";

import { useBuilder } from "../state/BuilderContext";
import { SERVICES } from "../data/services";
import styles from "./ProjectReview.module.css";

/**
 * Estado provisório `"reviewing"` (PROJECT_REVIEW), alcançado ao clicar "Finalizar projeto" no
 * Meu Upgrade. O resumo completo por serviço, a edição/remoção a partir daqui e o avanço para
 * contato são objetivo da Etapa 11 (WF-09) — aqui só confirma a transição de estado e lista os
 * serviços que farão parte do projeto, sem duplicar a lógica de resumo do Meu Upgrade.
 */
export default function ProjectReview() {
  const { state, goToEntry } = useBuilder();
  const items = Object.values(state.confirmedServices).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className={styles.wrapper}>
      <span className={styles.badge}>Etapa provisória — o resumo completo chega na Etapa 11</span>
      <h2 className={styles.title}>Seu projeto está pronto para revisão</h2>
      <p className={styles.count}>
        {items.length} {items.length === 1 ? "serviço" : "serviços"} selecionado{items.length === 1 ? "" : "s"}
      </p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.serviceId}>{SERVICES[item.serviceId].label}</li>
        ))}
      </ul>
      <button type="button" className={styles.secondaryButton} onClick={goToEntry}>
        Voltar ao Meu Upgrade
      </button>
    </div>
  );
}
