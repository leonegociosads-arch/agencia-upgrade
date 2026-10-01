/**
 * Canais de contato direto e expectativa de retorno da Upgrade — fonte única (mesmo princípio de
 * `lib/seo/siteConfig.ts`: nenhum outro arquivo declara número, link ou prazo à parte).
 *
 * NADA aqui é inventado: os dois valores vêm de variáveis de ambiente (documentadas em
 * `.env.example`) e ficam VAZIOS até a Upgrade informar o dado real. Enquanto estiverem vazios, a
 * interface simplesmente não mostra o recurso (o botão de WhatsApp fica desativado, a promessa de
 * prazo não aparece) — nunca um número ou um prazo adivinhado. Pendência registrada em
 * `docs/CONTENT-TODO.md`.
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

/** Prazo REAL de retorno já como trecho de frase (ex.: "em até 1 dia útil"), ou `null` se a Upgrade
 * ainda não definiu um prazo. Só aparece na interface quando existir. */
export function getResponseTimeLabel(): string | null {
  const label = (process.env.NEXT_PUBLIC_RESPONSE_TIME ?? "").trim();
  return label.length > 0 ? label : null;
}
