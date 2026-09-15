"use client";

import { SERVICE_IDS, SERVICES } from "../data/services";
import { useBuilder } from "../state/BuilderContext";
import styles from "./ServiceSelector.module.css";

/**
 * Tela de escolha de serviço (WF-03). Mostra sempre as 3 categorias, nunca uma quarta — o link
 * para quem chega indeciso é secundário e sai do Builder (docs/USER-FLOW.md, Seção 12), sem abrir
 * pergunta nenhuma; não implementado nesta etapa por não envolver estado do Builder.
 */
export default function ServiceSelector() {
  const { state, startNewService, startEditingService } = useBuilder();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Por onde você quer começar?</h1>
      <div className={styles.grid}>
        {SERVICE_IDS.map((serviceId) => {
          const service = SERVICES[serviceId];
          const configured = state.confirmedServices[serviceId] !== undefined;
          return (
            <button
              key={serviceId}
              type="button"
              className={styles.card}
              onClick={() => (configured ? startEditingService(serviceId) : startNewService(serviceId))}
            >
              {configured && <span className={styles.badge}>Configurado</span>}
              <span className={styles.cardLabel}>{service.label}</span>
              <span className={styles.cardDescription}>{service.shortDescription}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className={styles.secondaryLink} disabled title="Canal de contato — Etapa 9+">
        Não sabe exatamente do que precisa? Fale com a Upgrade
      </button>
    </div>
  );
}
