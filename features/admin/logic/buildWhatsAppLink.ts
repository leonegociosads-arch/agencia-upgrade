/**
 * Link `wa.me` simples (Fase 16) — não é WhatsApp API. `whatsapp` já chega normalizado
 * (`55DDNNNNNNNNN`, Fase 12/13), exatamente o formato que `wa.me` espera (só dígitos, com DDI).
 * Mensagem inicial curta, de propósito — o administrador continua a conversa depois; nunca um
 * resumo gigante do projeto embutido automaticamente (`docs/ADMIN-CRM.md`).
 */
export function buildWhatsAppLink(whatsapp: string, firstName: string): string {
  const message = firstName
    ? `Olá, ${firstName}! Aqui é da Agência Upgrade. Recebemos seu projeto pelo nosso site.`
    : "Olá! Aqui é da Agência Upgrade. Recebemos seu projeto pelo nosso site.";
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}
