/** `mailto:` simples (Fase 16) — não é um sistema de e-mail completo. */
export function buildMailtoLink(email: string): string {
  return `mailto:${email}`;
}
