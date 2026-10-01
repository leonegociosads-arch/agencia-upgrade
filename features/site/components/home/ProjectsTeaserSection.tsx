"use client";

import { useRef } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Card from "@/features/design-system/components/Card";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useRevealScrollMotion } from "../../motion/useRevealScrollMotion";
import styles from "./ProjectsTeaserSection.module.css";

/**
 * Teaser de "Projetos/Prova" (briefing, Seção 14) — ainda sem cases reais para uma apresentação
 * mais rica (carrossel, scroll horizontal — Seção 15 do briefing: só se houver caso real, "não
 * usar scroll horizontal só porque parece sofisticado"); por isso, uma revelação simples é a
 * escolha certa aqui, não uma ausência de motion.
 */
/*
 * [FUTURO CASE — PROVA] Esta seção é o lugar da prova da Home. Quando houver projetos reais
 * autorizados, ela vira uma vitrine de até 3 cases (imagem principal + cliente/segmento + o desafio
 * + a solução + serviços usados + resultado real, SÓ se houver número verificável + CTA para o
 * caso completo em `/projetos`). Nada disso pode ser inventado. Assets e informações necessários:
 * `docs/CONTENT-TODO.md` (itens "Case 01..03 — Home" e "Prova/depoimentos").
 */
export default function ProjectsTeaserSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  // `scaleFrom` (Etapa 36 — Award-Level): diferencia esta entrada da de `FinalCtaSection`, que usa
  // o mesmo hook sem escala — as duas seções "leves" da Home deixam de ter a assinatura de motion
  // idêntica (briefing, Seção 15).
  useRevealScrollMotion(sectionRef, { itemSelectors: [`.${styles.projectsTeaser}`], scaleFrom: 0.96 });

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.section}>
      <Card className={styles.projectsTeaser}>
        {/* `as="h2"` (Fase SEO, Seção 5 do briefing: hierarquia coerente) — esta seção é uma irmã
         * de "O que fazemos"/"Pronto para dar o próximo passo?" (ambas `h2`), não uma subseção
         * dela; `variant="h3"` mantém o mesmo tamanho visual compacto de sempre, só a tag semântica
         * muda (o mesmo recurso documentado em `Heading.tsx`). */}
        <Heading variant="h3" as="h2">
          Projetos
        </Heading>
        {/* Antes: "Os primeiros cases da Upgrade estão a caminho — em breve, projetos reais entregues
            pela agência aparecem aqui." */}
        <Text color="secondary">
          Estamos organizando os primeiros projetos para publicar aqui, com o desafio de cada cliente
          e a solução da Upgrade.
        </Text>
        <LinkButton href="/projetos" variant="secondary" size="sm">
          Ver projetos
        </LinkButton>
      </Card>
    </SectionContainer>
  );
}
