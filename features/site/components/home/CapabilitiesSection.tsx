"use client";

import { useRef } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Card from "@/features/design-system/components/Card";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import { useTilt } from "@/features/design-system/motion/useTilt";
import { SERVICE_IDS, SERVICES } from "@/features/builder/data/services";
import { SUMMARY_TITLES } from "@/features/builder/components/ProjectReviewService";
import type { ServiceId } from "@/features/builder/types";
import { useCapabilitiesScrollMotion } from "../../motion/useCapabilitiesScrollMotion";
import styles from "./CapabilitiesSection.module.css";

/**
 * Copy da Home para cada frente: o que fazemos + para que serve + quando faz sentido. É conteúdo
 * SÓ da Home — `SERVICES.shortDescription` continua intacta porque é usada em outras telas. Só
 * afirma o que o Builder realmente cobre (tipos de site, destinos, perguntas de marca e social).
 * Antes, cada card mostrava só a lista de itens (ex.: "Sites, landing pages, lojas virtuais e
 * sistemas.") — sem dizer o que o cliente ganha nem quando contratar.
 */
const HOME_SERVICE_COPY: Readonly<Record<ServiceId, { what: string; why: string; when: string }>> = {
  site: {
    what: "Sites institucionais, landing pages, lojas virtuais e sistemas sob medida.",
    why: "Para a sua empresa ser encontrada, entendida e contatada em um espaço que é seu.",
    when: "Quando você precisa criar, refazer ou ampliar o seu site.",
  },
  trafego: {
    what: "Planejamento e gestão de campanhas pagas no Google e no Meta.",
    why: "Para colocar a sua empresa diante de quem já procura o que você oferece.",
    when: "Quando você já tem um destino (site, WhatsApp, loja) e quer levar mais gente até ele.",
  },
  design: {
    what: "Identidade visual, artes e conteúdo para redes sociais, criativos de anúncio e edição de vídeo.",
    why: "Para a sua marca ser reconhecida e consistente em cada lugar onde aparece.",
    when: "Quando a marca ainda não tem identidade, ou quando as redes precisam de constância.",
  },
};

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
        {/* Antes: "Três frentes, um projeto só — escolhida no Builder, configurada em poucos minutos."
            (concordância errada e nada concreto). */}
        <Text color="secondary" className={styles.sectionLead}>
          Três frentes que você pode contratar separadas ou combinar no mesmo projeto.
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
  const copy = HOME_SERVICE_COPY[serviceId];
  const tiltRef = useTilt<HTMLDivElement>(3);

  return (
    <Card ref={tiltRef} elevated className={styles.capabilityCard}>
      <span className={styles.capabilityMark}>
        <ServiceIcon serviceId={serviceId} />
      </span>
      <Text as="span" size="label" color="accent" className={styles.frontName}>
        {SUMMARY_TITLES[serviceId]}
      </Text>
      <Heading variant="h3">{service.label}</Heading>
      <Text size="sm" color="secondary">
        {copy.what}
      </Text>
      <dl className={styles.facts}>
        <div>
          <dt>Para quê</dt>
          <dd>{copy.why}</dd>
        </div>
        <div>
          <dt>Quando faz sentido</dt>
          <dd>{copy.when}</dd>
        </div>
      </dl>
    </Card>
  );
}
