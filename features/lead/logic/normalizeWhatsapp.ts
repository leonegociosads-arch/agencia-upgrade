/**
 * Normaliza um número de WhatsApp brasileiro para um formato consistente — código do país (55) +
 * DDD + número, só dígitos (ex.: `"5513999999999"`). Aceita qualquer formatação comum de entrada
 * ("(13) 99999-9999", "13 99999-9999", "13999999999", "+55 13 99999-9999") — a validação nunca
 * depende de formatação visual exata (docs/IMPLEMENTATION-STAGE-12.md). Retorna `null` quando não
 * é possível reconhecer um número válido (DDD de 2 dígitos + 8 ou 9 dígitos de número).
 *
 * Deliberadamente simples — não é um parser genérico de telefones internacionais (fora de escopo
 * desta fase, que trata o Brasil como uso principal inicial).
 */
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let national = digits;
  // Um número nacional (DDD + número) tem 10 ou 11 dígitos; qualquer coisa além disso só faz
  // sentido como código do país (55) já incluído — nunca confundido com um DDD igual a "55"
  // (Novo Hamburgo/RS), porque nesse caso o total já seria 10 ou 11, não 12/13.
  if (national.startsWith("55") && (national.length === 12 || national.length === 13)) {
    national = national.slice(2);
  }

  if (national.length !== 10 && national.length !== 11) return null;
  return `55${national}`;
}
