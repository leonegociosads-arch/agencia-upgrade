"use client";

import { SERVICE_IDS, SERVICES } from "../data/services";
import { useBuilder } from "../state/BuilderContext";
import { trackEvent } from "@/lib/analytics/trackEvent";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import { playSound } from "@/features/design-system/motion/sound";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useTilt } from "@/features/design-system/motion/useTilt";
import { cx } from "@/features/design-system/utils/cx";
import type { ServiceId } from "../types";
import styles from "./ServiceSelector.module.css";

/**
 * Tela de escolha de serviço (WF-03). Mostra sempre as 3 categorias, nunca uma quarta — o link
 * para quem chega indeciso é secundário e sai do Builder (docs/USER-FLOW.md, Seção 12), sem abrir
 * pergunta nenhuma; não implementado nesta etapa por não envolver estado do Builder.
 *
 * Subtítulo (Etapa 32, Testes de UX): quem chega direto no Builder — sem passar pela Home, ex.
 * vindo de uma campanha (docs/USER-FLOW.md, Seção 2) — via só "Por onde você quer começar?" e os 3
 * cartões, sem nada explicando que isso é uma sequência curta de perguntas que vira um resumo no
 * final. Achado de "expectation setting" (briefing Seção 4/5): uma linha, sem jargão, cobre isso
 * sem precisar de texto longo (Seção 5: "não criar textos longos").
 */
export default function ServiceSelector() {
  const { state, startNewService, startEditingService } = useBuilder();
  const { isTransitioning, markForward } = useSceneNavigation();

  return (
    <div className={styles.wrapper}>
      <Heading variant="h1" as="h1" className={styles.title}>
        Por onde você quer começar?
      </Heading>
      <Text as="p" size="sm" color="secondary" className={styles.subtitle}>
        Escolha uma área e responda algumas perguntas rápidas — no final, você tem um resumo do seu
        projeto para enviar para a gente.
      </Text>
      <div className={styles.grid}>
        {SERVICE_IDS.map((serviceId) => {
          const configured = state.confirmedServices[serviceId] !== undefined;
          return (
            <ServiceCard
              key={serviceId}
              serviceId={serviceId}
              configured={configured}
              disabled={isTransitioning}
              onSelect={() => {
                if (isTransitioning) return;
                playSound("card_select");
                markForward();
                if (configured) {
                  startEditingService(serviceId);
                  return;
                }
                // `service_selected` (Fase 17): só para uma configuração NOVA — reabrir um serviço
                // já configurado é edição, não "seleção" (docs/ANALYTICS.md, Seção "Eventos").
                trackEvent("service_selected", { serviceId });
                startNewService(serviceId);
              }}
            />
          );
        })}
      </div>
      <button type="button" className={styles.secondaryLink} disabled title="Canal de contato — Etapa 9+">
        Não sabe exatamente do que precisa? Fale com a Upgrade
      </button>
    </div>
  );
}

interface ServiceCardProps {
  serviceId: ServiceId;
  configured: boolean;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * Extraído para um componente próprio (Fase Microinterações, Etapa 24) só para poder chamar
 * `useTilt()` uma vez POR CARD — um Hook não pode ser chamado dentro do `.map()` do componente
 * pai. O tilt em si é "extremamente sutil" (briefing Seção 11) e só existe com ponteiro fino e
 * motion não reduzido (`useTilt` já faz essa checagem sozinho).
 */
function ServiceCard({ serviceId, configured, disabled, onSelect }: ServiceCardProps) {
  const service = SERVICES[serviceId];
  const tiltRef = useTilt<HTMLButtonElement>(3);

  return (
    <button
      ref={tiltRef}
      type="button"
      className={cx(styles.card, configured && styles.cardConfigured)}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.cardMark}>
        <ServiceIcon serviceId={serviceId} />
      </span>
      {configured && (
        <Badge tone="success" className={styles.badge}>
          Configurado
        </Badge>
      )}
      <span className={styles.cardLabel}>{service.label}</span>
      <Text as="span" size="sm" color="secondary">
        {service.shortDescription}
      </Text>
      <span className={styles.cardCta} aria-hidden="true">
        {configured ? "Editar →" : "Começar →"}
      </span>
    </button>
  );
}
