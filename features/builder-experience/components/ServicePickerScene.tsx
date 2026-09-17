import { SERVICE_IDS, SERVICES } from "@/features/builder/data/services";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import type { ServiceId } from "@/features/builder/types";
import ExperienceScene from "./ExperienceScene";
import FloatingCard from "./FloatingCard";
import styles from "./ServicePickerScene.module.css";

export interface ServicePickerSceneProps {
  selected: ServiceId | null;
  onSelect: (serviceId: ServiceId) => void;
  disabled: boolean;
}

/**
 * Cena 1 da Prova de Conceito — mesmas 3 categorias e a mesma copy de `ServiceSelector.tsx` (o
 * dado vem de `SERVICES`, nunca duplicado); o que muda aqui é só a linguagem de interação (deck,
 * floating, seleção separada de avançar), não o conteúdo.
 */
export default function ServicePickerScene({ selected, onSelect, disabled }: ServicePickerSceneProps) {
  return (
    <ExperienceScene eyebrow="Prova de conceito — Builder" title="Por onde você quer começar?">
      <div className={styles.grid}>
        {SERVICE_IDS.map((serviceId, index) => (
          <FloatingCard
            key={serviceId}
            index={index}
            label={SERVICES[serviceId].label}
            description={SERVICES[serviceId].shortDescription}
            icon={<ServiceIcon serviceId={serviceId} />}
            selected={selected === serviceId}
            floating={selected === null}
            dimmed={selected !== null && selected !== serviceId}
            disabled={disabled}
            onSelect={() => onSelect(serviceId)}
          />
        ))}
      </div>
    </ExperienceScene>
  );
}
