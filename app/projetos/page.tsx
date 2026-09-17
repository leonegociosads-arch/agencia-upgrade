import type { Metadata } from "next";
import SiteHeader from "@/features/site/components/SiteHeader";
import SiteFooter from "@/features/site/components/SiteFooter";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import styles from "./page.module.css";

/** Título/descrição honestos sobre o estado real da página (Fase SEO, Seções 3/29 do briefing:
 * "claro, específico, sem spam"; "não reescrever tudo apenas por SEO") — a mesma frase que já
 * aparece no corpo da página, nunca uma promessa de conteúdo que ainda não existe. */
export const metadata: Metadata = {
  title: "Projetos",
  description: "Os primeiros cases da Upgrade estão a caminho — projetos reais entregues pela agência aparecem aqui.",
  alternates: { canonical: "/projetos" },
};

/**
 * Placeholder estrutural (Etapa 8), agora com a identidade visual da Fase 19 aplicada — cases reais
 * continuam pendentes de uma fase de conteúdo futura (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 4);
 * nada foi inventado (nenhum case/depoimento fictício), só o visual da página em si.
 */
export default function ProjetosPage() {
  return (
    <>
      <SiteHeader />
      <SectionContainer as="main" className={styles.main}>
        <Heading variant="h1" as="h1">
          Projetos
        </Heading>
        <Text color="secondary" className={styles.lead}>
          Página institucional provisória. Os primeiros cases reais da Upgrade entram aqui assim
          que estiverem prontos.
        </Text>
      </SectionContainer>
      <SiteFooter />
    </>
  );
}
