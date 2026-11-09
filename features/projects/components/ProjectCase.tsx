"use client";

import { useId, useRef, useState } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useRevealScrollMotion } from "@/features/site/motion/useRevealScrollMotion";
import type { ProjectCase as ProjectCaseData, ProjectFeature } from "../types";
import ProjectMedia from "./ProjectMedia";
import styles from "./ProjectCase.module.css";

export interface ProjectCaseProps {
  project: ProjectCaseData;
}

/**
 * Um case de `/projetos` (Etapa "Ver Projetos"), em composição editorial:
 *
 *   desktop  cabeçalho (nome, categoria, headline, resumo) | necessidade e solução
 *            mídia grande, quase na largura toda
 *            Na tela (front-end) | Nos bastidores (back-end)
 *            CTA
 *   mobile   mídia → cabeçalho → necessidade/solução → camadas → CTA
 *
 * A primeira versão (mídia fixa ao lado de uma coluna de texto) foi descartada na validação
 * visual: a mídia ficava com metade da largura e o texto virava uma coluna longa demais — o
 * oposto de "projeto principal com presença". Registro em `docs/DECISIONS.md`.
 *
 * Leitura para dois públicos: o empresário entende a necessidade e o que foi construído; quem
 * conhece tecnologia encontra "Front-end"/"Back-end", sempre com a tradução ao lado. Nenhuma
 * ferramenta ou fornecedor é nomeado (decisão de 08/11/2026). "Na tela" × "Nos bastidores" é o
 * argumento central: com recursos reais, mostra por que um projeto completo vale mais do que uma
 * página simples.
 */
export default function ProjectCase({ project }: ProjectCaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  // Mesmo hook (e mesma assinatura de motion) das seções de revelação da Home: nenhuma linguagem
  // de movimento nova. Com movimento reduzido, o hook não anima nada.
  useRevealScrollMotion(sectionRef, {
    itemSelectors: [`.${styles.header}`, `.${styles.media}`, `.${styles.layers}`, `.${styles.footer}`],
  });

  const titleId = `${project.slug}-titulo`;

  return (
    <section
      ref={sectionRef}
      id={project.slug}
      aria-labelledby={titleId}
      className={styles.case}
    >
      <SectionContainer as="div" className={styles.grid}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.index} aria-hidden="true">
              {project.index}
            </span>
            <Badge tone="accent">{project.category}</Badge>
          </p>
          <Heading variant="h1" as="h2" id={titleId}>
            {project.name}
          </Heading>
          <Text size="lg" weight="medium" className={styles.headline}>
            {project.headline}
          </Text>
          <Text color="secondary" className={styles.summary}>
            {project.summary}
          </Text>
        </header>

        <dl className={styles.context}>
          <div>
            <dt>A necessidade</dt>
            <dd>{project.context.need}</dd>
          </div>
          <div>
            <dt>O que construímos</dt>
            <dd>{project.context.solution}</dd>
          </div>
        </dl>

        <div className={styles.mediaArea}>
          <ProjectMedia
            media={project.media}
            projectName={project.name}
            accent={project.accent}
            sizes="(min-width: 1280px) 1040px, (min-width: 768px) 90vw, 100vw"
            className={styles.media}
          />
        </div>

        <div className={styles.layers}>
          <FeatureLayer
            term="Front-end"
            title="Na tela do cliente"
            explanation="A parte do site que o cliente vê e usa."
            features={project.screen}
          />
          <FeatureLayer
            term="Back-end"
            title="Nos bastidores"
            explanation="A estrutura que ninguém vê: guarda os dados, aplica as regras e processa os pedidos."
            features={project.backstage}
          />
        </div>

        {/* Sem lista de ferramentas ("Estruturado com"), por decisão de 08/11/2026: o cliente não
            precisa dela e a agência não expõe a própria stack. O valor fica explicado por recurso. */}
        <div className={styles.footer}>
          <div className={styles.actions}>
            {/* `aria-label` (e não texto escondido): dentro do `inline-flex` do botão o navegador
                junta os pedaços com espaço ("ao vivo : SM Design"). Começa pelo texto visível. */}
            <LinkButton
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className={styles.cta}
              aria-label={`Ver projeto ao vivo: ${project.name} (abre em nova aba)`}
            >
              Ver projeto ao vivo
              <ExternalIcon />
            </LinkButton>
            <Text as="span" size="caption" color="secondary">
              {project.media.domain} · abre em nova aba
            </Text>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}

interface FeatureLayerProps {
  term: string;
  title: string;
  explanation: string;
  features: ProjectFeature[];
}

/**
 * Uma camada do projeto ("Na tela" ou "Nos bastidores"): termo técnico + tradução + recursos.
 *
 * No celular, cada recurso mostra só o título; a explicação abre no botão (página bem mais curta,
 * sem perder nada). Do tablet para cima, a explicação fica sempre visível e o botão some — o
 * estado `expanded` só tem efeito visual abaixo de 768px (`ProjectCase.module.css`).
 */
function FeatureLayer({ term, title, explanation, features }: FeatureLayerProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  return (
    <div className={styles.layer}>
      <Text as="span" size="label" color="accent" className={styles.term}>
        {term}
      </Text>
      <Heading variant="h3">{title}</Heading>
      <Text size="sm" color="secondary" className={styles.explanation}>
        {explanation}
      </Text>
      <ul id={listId} className={styles.features} data-expanded={expanded}>
        {features.map((feature) => (
          <li key={feature.title}>
            <span className={styles.featureTitle}>{feature.title}</span>
            <span className={styles.featureText}>{feature.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={listId}
        // São 4 botões iguais na página: o leitor de tela ouve também de qual camada é. O nome
        // começa pelo texto visível (WCAG 2.5.3).
        aria-label={`${expanded ? "Mostrar menos" : "Ver como funciona"}: ${title}`}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Mostrar menos" : "Ver como funciona"}
        <span className={styles.toggleIcon} aria-hidden="true" />
      </button>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg className={styles.externalIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3h7v7M13 3 4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
