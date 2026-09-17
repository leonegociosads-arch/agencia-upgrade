import type { Metadata } from "next";
import SiteHeader from "@/features/site/components/SiteHeader";
import SiteFooter from "@/features/site/components/SiteFooter";
import HeroSection from "@/features/site/components/home/HeroSection";
import CapabilitiesSection from "@/features/site/components/home/CapabilitiesSection";
import ProjectsTeaserSection from "@/features/site/components/home/ProjectsTeaserSection";
import FinalCtaSection from "@/features/site/components/home/FinalCtaSection";
import { getOrganizationJsonLd, getWebSiteJsonLd, toJsonLd } from "@/lib/seo/structuredData";
import styles from "./page.module.css";

/** Canonical explícito (Fase SEO, Seção 18 do briefing: "evitar duplicação por query params/UTM")
 * — o título/descrição já vêm do padrão de `app/layout.tsx` (`title.default`), então não
 * precisam ser repetidos aqui. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Home — UI final (Fase 19, `docs/UI-FINAL.md`). A partir da Fase ScrollTrigger e Storytelling
 * (Etapa 23), cada seção vira um Client Component próprio (`features/site/components/home/`) para
 * poder ter seu próprio hook de motion de scroll (`docs/SCROLL-STORYTELLING.md`) — a Home continua
 * um Server Component (este arquivo), então o HTML inicial sempre chega completo, sem depender de
 * JS para existir (Seção 39 do briefing: SEO/crawlers).
 */
export default function Home() {
  return (
    <>
      {/* Dados estruturados (Seções 22-24 do briefing) — só fatos reais, ver `structuredData.ts`.
       * `<` escapado (Seção padrão de segurança para JSON-LD embutido): nenhum valor aqui vem de
       * entrada do usuário, mas evita por completo qualquer risco de fechar a tag `<script>` cedo. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(getOrganizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(getWebSiteJsonLd()) }} />
      <SiteHeader />
      <main className={styles.main}>
        <HeroSection />
        <CapabilitiesSection />
        <ProjectsTeaserSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
