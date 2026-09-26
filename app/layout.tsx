import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import AnalyticsPageView from "@/features/analytics/components/AnalyticsPageView";
import SmoothScrollProvider from "@/features/design-system/motion/SmoothScrollProvider";
import ConsentBanner from "@/features/privacy/components/ConsentBanner";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo/siteConfig";
import "./globals.css";

/**
 * Tipografia da identidade visual (Fases 18/19) — ver `docs/DESIGN-SYSTEM.md`, Seção 2, e
 * `docs/UI-FINAL.md`. As fontes Geist do `create-next-app` foram removidas nesta fase: agora que a
 * identidade real está aplicada em todo o site (não só nos componentes novos do Design System),
 * elas não tinham mais nenhum uso.
 */
const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

/**
 * Metadata raiz (Fase SEO, `docs/SEO.md`) — vale para toda página que não sobrescreve os próprios
 * campos. `metadataBase` resolve toda URL relativa (Open Graph, `canonical`) para absoluta; sem
 * ele, compartilhar um link em redes sociais gera uma imagem/URL quebrada.
 *
 * `title.template` (Seção 3 do briefing: títulos "claros, humanos, específicos, sem spam") deixa
 * cada página declarar só o próprio nome (`"Projetos"`, `"Política de Privacidade"`) — o sufixo da
 * marca é aplicado uma vez só, aqui, nunca repetido/escrito à mão em cada página.
 *
 * `robots` aqui é o padrão para páginas PÚBLICAS (index/follow) — `/admin` e `/builder` sobrescrevem
 * isso com o próprio `metadata.robots` (ver `docs/SEO.md`, Seção "Indexação por rota").
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <AnalyticsPageView />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ConsentBanner />
      </body>
    </html>
  );
}
