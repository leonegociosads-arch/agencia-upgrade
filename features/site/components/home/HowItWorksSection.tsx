"use client";

import { useRef } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Card from "@/features/design-system/components/Card";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useMagneticHover } from "@/features/design-system/motion/useMagneticHover";
import { useRevealScrollMotion } from "../../motion/useRevealScrollMotion";
import { JOURNEY_STEPS } from "@/features/builder/data/journeySteps";
import styles from "./HowItWorksSection.module.css";

/**
 * Os 4 passos REAIS do fluxo (escolher → responder → montar e revisar → enviar). Nenhuma etapa
 * inventada: cada frase descreve algo que o Builder de fato faz. A lista vive em
 * `features/builder/data/journeySteps.ts` porque o Builder usa os MESMOS 4 passos como progresso
 * geral no cabeçalho — a promessa da Home e a experiência nunca divergem.
 */
const STEPS = JOURNEY_STEPS;

/**
 * "Como funciona" (Home como landing page comercial) — torna o Builder o diferencial: em vez de um
 * formulário igual para todo mundo, o visitante monta o que faz sentido para a empresa dele. O
 * título da seção é "Como funciona" (claro para quem lê e para busca); a ideia do Builder está no
 * parágrafo de apoio e nunca usa o termo interno "Builder" — o visitante conhece "Monte seu Upgrade".
 *
 * [FUTURO MOCKUP — mostrar o Builder] Esta seção ganha muito com uma imagem/vídeo curto REAL do
 * Builder em uso (a tela de escolha de serviços ou o resumo "Seu Upgrade está quase pronto!"). Não
 * foi criada nem escolhida nenhuma imagem: especificação do asset em `docs/CONTENT-TODO.md`
 * (item "Como funciona — demonstração do Builder").
 */
export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useRevealScrollMotion(sectionRef, {
    itemSelectors: [`.${styles.intro}`, `.${styles.step}`, `.${styles.footer}`],
  });
  const ctaRef = useMagneticHover<HTMLAnchorElement>();

  return (
    <SectionContainer as="section" ref={sectionRef} id="como-funciona" className={styles.section} aria-labelledby="como-funciona-title">
      <div className={styles.intro}>
        <Heading variant="h2" id="como-funciona-title">
          Como funciona
        </Heading>
        <Text color="secondary" className={styles.lead}>
          Cada empresa precisa de uma combinação diferente. Em vez de preencher um formulário igual para todo
          mundo, você monta o seu Upgrade: escolhe os serviços, responde poucas perguntas e revisa tudo antes de
          enviar.
        </Text>
      </div>

      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <Card elevated className={styles.stepCard}>
              <span className={styles.stepNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Heading variant="h3">{step.title}</Heading>
              <Text size="sm" color="secondary">
                {step.text}
              </Text>
            </Card>
          </li>
        ))}
      </ol>

      <div className={styles.footer}>
        <LinkButton ref={ctaRef} href="/builder" size="lg">
          Monte seu Upgrade
        </LinkButton>
        <Text size="sm" color="secondary">
          Seus dados de contato só são pedidos no final, depois do resumo.
        </Text>
      </div>
    </SectionContainer>
  );
}
