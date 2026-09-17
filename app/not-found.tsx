import type { Metadata } from "next";
import SiteHeader from "@/features/site/components/SiteHeader";
import SiteFooter from "@/features/site/components/SiteFooter";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import LinkButton from "@/features/design-system/components/LinkButton";
import styles from "./not-found.module.css";

/**
 * Só `title` — o Next.js já injeta `<meta name="robots" content="noindex">` automaticamente em
 * qualquer resposta 404 (comportamento documentado, `not-found.md`), incluindo esta página; um
 * `robots` redundante aqui só duplicaria a tag sem mudar nada.
 */
export const metadata: Metadata = {
  title: "Página não encontrada",
};

/**
 * 404 (Fase SEO, Seção 53 do briefing: "deve explicar o erro, permitir retorno, não parecer
 * página quebrada"). Mesmo header/footer institucionais das páginas públicas — nunca uma tela
 * genérica em branco — com um caminho claro de volta (Home) e para o Builder, a ação comercial
 * principal do site.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <SectionContainer as="main" className={styles.main}>
        <Text as="span" size="label" color="secondary">
          Erro 404
        </Text>
        <Heading variant="h1" as="h1">
          Página não encontrada
        </Heading>
        <Text color="secondary" className={styles.lead}>
          O endereço que você tentou acessar não existe ou foi movido.
        </Text>
        <div className={styles.actions}>
          <LinkButton href="/" size="lg">
            Voltar para a Home
          </LinkButton>
          <LinkButton href="/builder" variant="ghost" size="lg">
            Monte seu Upgrade
          </LinkButton>
        </div>
      </SectionContainer>
      <SiteFooter />
    </>
  );
}
