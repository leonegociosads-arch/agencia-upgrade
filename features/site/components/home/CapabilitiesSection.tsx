"use client";

import { useRef } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Card from "@/features/design-system/components/Card";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import { useTilt } from "@/features/design-system/motion/useTilt";
import { SERVICE_IDS, SERVICES } from "@/features/builder/data/services";
import type { ServiceId } from "@/features/builder/types";
import { useCapabilitiesScrollMotion } from "../../motion/useCapabilitiesScrollMotion";
import styles from "./CapabilitiesSection.module.css";

/**
 * "O que fazemos" (Fase 19) — mesma copy/dados de antes (reaproveita `SERVICES`, nunca duplica a
 * descrição das 3 categorias do Builder). Fase ScrollTrigger e Storytelling adiciona só o motion
 * (`useCapabilitiesScrollMotion`) e o `.frame` — um wrapper puramente estrutural, sem efeito
 * visual próprio fora do que o motion aplica (briefing, Seção 12: "título permanece; serviços
 * entram em sequência"). Fase Microinterações adiciona um tilt sutil por card (`useTilt`, mesma
 * linguagem dos cards do Builder — briefing Seção 59: "não inventar uma linguagem nova por seção").
 */
export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useCapabilitiesScrollMotion(sectionRef);

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.section}>
      <div className={styles.frame}>
        <Heading variant="h2">O que fazemos</Heading>
        <Text color="secondary" className={styles.sectionLead}>
          Três frentes, um projeto só — escolhida no Builder, configurada em poucos minutos.
        </Text>
        <div className={styles.capabilities}>
          {SERVICE_IDS.map((serviceId) => (
            <CapabilityCard key={serviceId} serviceId={serviceId} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

/** Componente próprio só para poder chamar `useTilt()` uma vez por card (não pode viver dentro do
 * `.map()` acima — mesmo motivo de `ServiceCard`/`OptionCard` no Builder). */
function CapabilityCard({ serviceId }: { serviceId: ServiceId }) {
  const service = SERVICES[serviceId];
  const tiltRef = useTilt<HTMLDivElement>(3);

  return (
    <Card ref={tiltRef} elevated className={styles.capabilityCard}>
      <span className={styles.capabilityMark}>
        <ServiceIcon serviceId={serviceId} />
      </span>
      <Heading variant="h3">{service.label}</Heading>
      <Text size="sm" color="secondary">
        {service.shortDescription}
      </Text>
    </Card>
  );
}
