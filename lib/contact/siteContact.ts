/**
 * Canais de contato direto e expectativa de retorno da Upgrade — fonte única (mesmo princípio de
 * `lib/seo/siteConfig.ts`: nenhum outro arquivo declara número, link ou prazo à parte).
 *
 * NADA aqui é inventado: todos os valores vêm de variáveis de ambiente (documentadas em
 * `.env.example`) e ficam VAZIOS até a Upgrade informar o dado real. Enquanto estiverem vazios, a
 * interface simplesmente não mostra o recurso (o atalho "Fale com a Upgrade" some, o rodapé não lista
 * contato, a promessa de prazo não aparece) — nunca um número, e-mail, perfil ou prazo adivinhado.
 * Pendência registrada em `docs/CONTENT-TODO.md`.
 *
 * Para ligar um canal basta preencher UMA variável (na Hostinger: painel → site → variáveis de
 * ambiente, seguido de um novo build, porque `NEXT_PUBLIC_*` entra no código no momento do build):
 * - `NEXT_PUBLIC_WHATSAPP_NUMBER` — WhatsApp oficial (canal preferido em todo o site);
 * - `NEXT_PUBLIC_CONTACT_EMAIL` — e-mail oficial;
 * - `NEXT_PUBLIC_INSTAGRAM` — perfil oficial (`@perfil` ou o link do perfil).
 *
 * Lidas a cada chamada (e não em constantes de módulo) para continuarem testáveis; em produção o
 * Next.js troca `process.env.NEXT_PUBLIC_*` pelo valor literal no build.
 */

/** Mensagem inicial do WhatsApp. Texto de copy — confirmar o tom com a Upgrade (`CONTENT-TODO.md`). */
export const WHATSAPP_DEFAULT_MESSAGE = "Olá! Vim pelo site da Upgrade e quero conversar sobre um projeto.";

/** Número do WhatsApp oficial só com dígitos, com DDI e DDD (ex.: 5511999999999), ou `null` se ainda
 * não foi definido. Menos de 10 dígitos é tratado como "não definido" (valor claramente incompleto). */
export function getWhatsAppNumber(): string | null {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

/** Link `wa.me` com a mensagem inicial, ou `null` enquanto não existir um número oficial. */
export function getWhatsAppLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string | null {
  const number = getWhatsAppNumber();
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

/** E-mail oficial (validação de formato simples), ou `null` se ainda não foi definido. */
export function getContactEmail(): string | null {
  const email = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/** Nome do perfil oficial do Instagram (sem "@"), aceitando `@perfil`, `perfil` ou o link do perfil,
 * ou `null` se ainda não foi definido ou não parece um perfil válido. */
export function getInstagramHandle(): string | null {
  const raw = (process.env.NEXT_PUBLIC_INSTAGRAM ?? "").trim();
  if (!raw) return null;
  const fromUrl = raw.match(/instagram\.com\/([^/?#\s]+)/i);
  const handle = (fromUrl ? fromUrl[1] : raw).replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}

/** Prazo REAL de retorno já como trecho de frase (ex.: "em até 1 dia útil"), ou `null` se a Upgrade
 * ainda não definiu um prazo. Só aparece na interface quando existir. */
export function getResponseTimeLabel(): string | null {
  const label = (process.env.NEXT_PUBLIC_RESPONSE_TIME ?? "").trim();
  return label.length > 0 ? label : null;
}

export type ContactChannelKind = "whatsapp" | "instagram" | "email";

export interface ContactChannel {
  kind: ContactChannelKind;
  href: string;
  /** Nome do canal ("WhatsApp", "Instagram", "E-mail"). */
  label: string;
  /** O que aparece ao lado do ícone no rodapé (o próprio canal, nunca um texto inventado). */
  display: string;
  /** `true` quando o link sai do site (abre em nova aba); `mailto:` abre o app de e-mail. */
  external: boolean;
}

/** Formata os dígitos do WhatsApp para leitura (+55 11 91234-5678). Só apresentação. */
function formatWhatsAppDisplay(digits: string): string {
  const match = digits.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}` : `+${digits}`;
}

/**
 * Todos os canais REALMENTE configurados, na ordem de preferência (WhatsApp → Instagram → e-mail).
 * Lista vazia = nenhum canal existe ainda; quem usa a lista não mostra nada.
 */
export function getContactChannels(message: string = WHATSAPP_DEFAULT_MESSAGE): ContactChannel[] {
  const channels: ContactChannel[] = [];
  const whatsappNumber = getWhatsAppNumber();
  const whatsappLink = getWhatsAppLink(message);
  if (whatsappNumber && whatsappLink) {
    channels.push({
      kind: "whatsapp",
      href: whatsappLink,
      label: "WhatsApp",
      display: formatWhatsAppDisplay(whatsappNumber),
      external: true,
    });
  }
  const instagram = getInstagramHandle();
  if (instagram) {
    channels.push({
      kind: "instagram",
      href: `https://www.instagram.com/${instagram}/`,
      label: "Instagram",
      display: `@${instagram}`,
      external: true,
    });
  }
  const email = getContactEmail();
  if (email) {
    channels.push({ kind: "email", href: `mailto:${email}`, label: "E-mail", display: email, external: false });
  }
  return channels;
}

/** O canal que os atalhos "Fale com a Upgrade" usam: o primeiro configurado, ou `null` se nenhum. */
export function getPrimaryContactChannel(message: string = WHATSAPP_DEFAULT_MESSAGE): ContactChannel | null {
  return getContactChannels(message)[0] ?? null;
}
