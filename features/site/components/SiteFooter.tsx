import Link from "next/link";
import OpenConsentPreferencesButton from "@/features/privacy/components/OpenConsentPreferencesButton";
import { getContactChannels } from "@/lib/contact/siteContact";
import ContactIcon from "@/features/design-system/components/ContactIcon";
import styles from "./SiteFooter.module.css";

/** Footer enxuto (Fase 19, Seção 28: "não transformar em sitemap gigante") — só o essencial: marca,
 * os links institucionais que realmente existem, os canais de contato REALMENTE configurados (ícone +
 * texto, uma linha) e o ano corrente. Nenhum contato/rede social é inventado: sem configuração
 * (`lib/contact/siteContact.ts`), a linha de contato simplesmente não existe.
 *
 * Fase LGPD (briefing Seção 19/63): "Preferências de privacidade" reabre o mesmo
 * `ConsentBanner` já montado em `app/layout.tsx` — é um `<button>`, não um `Link` (Seção 49: não
 * navega para lugar nenhum, só reabre uma UI que já existe na página; trocar a semântica por
 * conveniência visual é exatamente o que o briefing pede para evitar). `OpenConsentPreferencesButton`
 * é a fronteira de Client Component (este arquivo continua um Server Component — `onClick` direto
 * aqui quebraria o build, já que `SiteFooter` é usado a partir de páginas/`not-found.tsx` que
 * também são Server Components). */
export default function SiteFooter() {
  const year = new Date().getFullYear();
  // WhatsApp, Instagram e e-mail vêm de variáveis de ambiente — só os configurados aparecem
  // (nenhum contato foi inventado; ver `lib/contact/siteContact.ts`).
  const channels = getContactChannels();

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <span className={styles.brand}>Upgrade</span>
        <nav className={styles.links} aria-label="Links institucionais">
          <Link href="/projetos" className={styles.link}>
            Projetos
          </Link>
          <Link href="/privacidade" className={styles.link}>
            Privacidade
          </Link>
          <OpenConsentPreferencesButton className={styles.link}>Preferências de privacidade</OpenConsentPreferencesButton>
        </nav>
      </div>
      {channels.length > 0 && (
        <ul className={styles.contacts} aria-label="Fale com a Upgrade">
          {channels.map((channel) => (
            <li key={channel.kind}>
              <a
                href={channel.href}
                className={styles.contact}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={`${channel.label}: ${channel.display}${channel.external ? " (abre em nova aba)" : ""}`}
              >
                <ContactIcon kind={channel.kind} className={styles.contactIcon} />
                <span>{channel.display}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.copy}>© {year} Agência Upgrade.</p>
    </footer>
  );
}
