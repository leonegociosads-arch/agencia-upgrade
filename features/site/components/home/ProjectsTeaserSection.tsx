"use client";

import { useRef } from "react";
import Link from "next/link";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import LinkButton from "@/features/design-system/components/LinkButton";
import { PROJECT_CASES } from "@/features/projects/data/projects";
import ProjectMedia from "@/features/projects/components/ProjectMedia";
import { useRevealScrollMotion } from "../../motion/useRevealScrollMotion";
import styles from "./ProjectsTeaserSection.module.css";

/**
 * "Projetos" na Home — teaser de AUTORIDADE VISUAL (correção da auditoria de 09/11/2026, achado A1):
 * antes era um cartão só de texto, a seção mais fraca da Home e a única com prova real.
 *
 * Agora mostra os dois cases reais (SM Design e Kai Hikari) com a MESMA mídia já aprovada em
 * `/projetos` (`ProjectMedia`: moldura de navegador + celular, capturas reais em
 * `public/assets/projects/<case>/`) e os dados de `features/projects/data/projects.ts` — nada de tela
 * nova, nada inventado. Não reconstrói `/projetos`: cada case mostra só nome, categoria e a headline, e
 * leva ao seu trecho da página (`/projetos#sm-design`, `/projetos#kai-hikari`). Nenhum link vai para o
 * site ao vivo de um cliente (o do Kai Hikari está em finalização — `liveLinkStatus`).
 *
 * Imagens: `next/image` sem `priority` (seção abaixo da dobra → carregamento preguiçoso) e `sizes`
 * do tamanho real do card. Motion: a mesma revelação simples de antes (`useRevealScrollMotion`).
 */
export default function ProjectsTeaserSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useRevealScrollMotion(sectionRef, {
    itemSelectors: [`.${styles.header}`, `.${styles.caseCard}`],
    scaleFrom: 0.97,
  });

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.section} aria-labelledby="projetos-home-title">
      <div className={styles.header}>
        <div className={styles.intro}>
          {/* `as="h2"` (Fase SEO): irmã de "O que fazemos"/"Como funciona" na hierarquia. */}
          <Heading variant="h2" as="h2" id="projetos-home-title">
            Projetos
          </Heading>
          <Text color="secondary" className={styles.lead}>
            Uma loja virtual de motocross e um cardápio digital com pedido online: veja o que cada negócio
            precisava e o que a Upgrade construiu.
          </Text>
        </div>
        <LinkButton href="/projetos" variant="secondary" className={styles.cta}>
          Ver projetos
        </LinkButton>
      </div>

      <ul className={styles.cases}>
        {PROJECT_CASES.map((project) => (
          <li key={project.slug} className={styles.caseCard}>
            <Link
              href={`/projetos#${project.slug}`}
              className={styles.caseLink}
              aria-label={`${project.name} — ${project.category}: ver o case em Projetos`}
            >
              <ProjectMedia
                // Sempre a captura (pôster), nunca o player: dentro de um link não pode haver controles.
                media={{ ...project.media, video: undefined }}
                projectName={project.name}
                accent={project.accent}
                sizes="(min-width: 1240px) 560px, (min-width: 900px) 45vw, 92vw"
                phoneSizes="(min-width: 900px) 128px, 96px"
                showCaption={false}
                className={styles.media}
              />
              <span className={styles.meta}>
                <span className={styles.index} aria-hidden="true">
                  {project.index}
                </span>
                <span className={styles.metaText}>
                  <span className={styles.name}>{project.name}</span>
                  <span className={styles.category}>{project.category}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </span>
              <span className={styles.headline}>{project.headline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
