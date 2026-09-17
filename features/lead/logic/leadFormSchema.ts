import { z } from "zod";
import { normalizeWhatsapp } from "./normalizeWhatsapp";

/**
 * Validação do formulário de contato (WF-10) — client-side, para UX (docs/TECHNICAL-ARCHITECTURE.md,
 * Seção 17: Zod já era a ferramenta recomendada para essa fronteira). A saída do schema (`z.output`)
 * já É `LeadContactData` — trim/normalização acontecem dentro do próprio schema, então
 * `buildLeadPayload` nunca precisa repetir essa lógica (evita duas fontes de normalização capazes
 * de divergir).
 *
 * Mensagens sempre em português, específicas por campo, nunca técnicas (nunca
 * "ValidationError: invalid_string"). Nenhuma validação aqui é a fronteira de segurança real —
 * essa, quando existir (Etapa 13, com um servidor de verdade), precisa validar de novo no
 * servidor; o mesmo schema pode ser reaproveitado lá.
 */
const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `Informe ${label}.`)
    .max(120, "Esse campo está muito longo.");

export const leadFormSchema = z.object({
  name: requiredText("seu nome"),
  company: requiredText("o nome da empresa"),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Informe seu WhatsApp.")
    .transform((value, ctx) => {
      const normalized = normalizeWhatsapp(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "Informe um WhatsApp válido, com DDD." });
        return z.NEVER;
      }
      return normalized;
    }),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
  // Opcional: aceita URL ou handle de Instagram de forma permissiva (docs/IMPLEMENTATION-STAGE-12.md,
  // Seção "Website / Instagram") — nunca bloqueia o envio por uma regra rígida num campo opcional.
  // Sem `.optional()` na entrada: um `<input>` sempre entrega string (nunca `undefined`); é a
  // saída (depois do transform) que se torna opcional quando o campo está vazio.
  websiteOrInstagram: z
    .string()
    .trim()
    .transform((value) => (value ? value : undefined)),
});

/** Formato bruto que o formulário produz (o que `useForm<LeadFormSchemaInput>` espera). */
export type LeadFormSchemaInput = z.input<typeof leadFormSchema>;

/** Formato já validado/normalizado (o que `handleSubmit` entrega em caso de sucesso). */
export type LeadFormSchemaOutput = z.output<typeof leadFormSchema>;
