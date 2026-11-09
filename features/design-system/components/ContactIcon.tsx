import type { ContactChannelKind } from "@/lib/contact/siteContact";

interface ContactIconProps {
  kind: ContactChannelKind;
  className?: string;
}

/**
 * Ícones de linha dos canais de contato (mesmo traço dos ícones do Design System: 24×24,
 * `currentColor`, ~1.8px). Sempre decorativos — o nome do canal está no texto ao lado.
 */
export default function ContactIcon({ kind, className }: ContactIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {kind === "whatsapp" && (
        <>
          <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 15.6-4.7Z" />
          <path d="M9 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.6.8-.6.3-1.5.4-2.6 0a8.3 8.3 0 0 1-4.3-4.3c-.4-1.1-.3-2 .1-2.6Z" />
        </>
      )}
      {kind === "instagram" && (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "email" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </>
      )}
    </svg>
  );
}
