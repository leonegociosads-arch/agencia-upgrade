import type { Metadata } from "next";
import SiteHeader from "@/features/site/components/SiteHeader";
import SiteFooter from "@/features/site/components/SiteFooter";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import FinalCtaSection from "@/features/site/components/home/FinalCtaSection";
import ProjectCase from "@/features/projects/components/ProjectCase";
import { PROJECT_CASES } from "@/features/projects/data/projects";
import styles from "./page.module.css";

/** Título/descrição descrevem exatamente o que a página mostra (mesmo padrão de SEO do resto do
 * site: claro, específico, sem promessa de conteúdo que não existe). Canonical continua o mesmo. */
export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Cases reais da Agência Upgrade: o e-commerce da SM Design e o cardápio digital com pedido online do Kai Hikari. O que cada negócio precisava e o que foi construído, na tela e nos bastidores.",
  alternates: { canonical: "/projetos" },
};

/**
 * Vitrine de cases (Etapa "Ver Projetos"). Estrutura: intro com o índice dos dois cases → um case
 * por seção, em lados alternados → CTA final para o Builder (a mesma `FinalCtaSection` da Home).
 *
 * Dois cases e só: a página não finge um portfólio maior. Ser só dois é o que permite dar a cada um
 * uma seção inteira, com espaço para explicar o que foi construído. Conteúdo em
 * `features/projects/data/projects.ts`; registro do que foi conferido em `docs/PROJECTS-CASES.md`.
 */
export default function ProjetosPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionContainer as="section" aria-labelledby="projetos-titulo" className={styles.intro}>
          <Text as="p" size="label" color="accent" className={styles.eyebrow}>
            Projetos
          </Text>
          <Heading variant="display" as="h1" id="projetos-titulo" className={styles.title}>
            Dois negócios diferentes. Duas soluções sob medida.
          </Heading>
          <Text size="lg" color="secondary" className={styles.lead}>
            Uma loja de motocross e um restaurante japonês não precisam do mesmo site. Veja o que cada um
            precisava, o que a Upgrade construiu e o que acontece na tela e nos bastidores de cada projeto.
          </Text>

          <nav aria-label="Cases desta página" className={styles.index}>
            <ol className={styles.indexList}>
              {PROJECT_CASES.map((project) => (
                <li key={project.slug}>
                  <a href={`#${project.slug}`} className={styles.indexLink}>
                    <span className={styles.indexNumber} aria-hidden="true">
                      {project.index}
                    </span>
                    <span className={styles.indexText}>
                      <span className={styles.indexName}>{project.name}</span>
                      <span className={styles.indexCategory}>{project.category}</span>
                    </span>
                    <span className={styles.indexArrow} aria-hidden="true">
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </SectionContainer>

        {PROJECT_CASES.map((project) => (
          <ProjectCase key={project.slug} project={project} />
        ))}

        <FinalCtaSection
          heading="Seu projeto pode ser o próximo."
          support="Cada negócio pede uma solução diferente. No Builder, você escolhe o que precisa, responde poucas perguntas e revisa tudo antes de enviar."
        />
      </main>
      <SiteFooter />
    </>
  );
}
