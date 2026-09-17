import { z } from "zod";

/**
 * SEGUNDA CAMADA DE VALIDAÇÃO (servidor) — `docs/IMPLEMENTATION-STAGE-12.md` já previa duas camadas
 * ("cliente agora, servidor pronto para depois"); esta é a camada de servidor, usada por
 * `features/lead/actions/submitLead.ts` antes de gravar no Supabase.
 *
 * Não repete `leadFormSchema` (que valida a ENTRADA bruta do formulário e faz a normalização) —
 * este schema valida a SAÍDA já normalizada (`LeadPayload`, o que trafega numa Server Action, que
 * `docs/…/server-actions.md` trata como "todo entrada não confiável"). Um objeto bem formado ainda
 * pode ter sido montado por um cliente malicioso direto na Server Action, então os limites aqui são
 * checagens de forma/sanidade, não uma cópia da lógica de normalização.
 *
 * Limites de tamanho (Etapa 29, Seção 18/20/41): toda pergunta do Builder é de múltipla escolha —
 * a UI real só produz ids de opção curtos (`features/builder/types.ts`, `AnswerValue`), nunca texto
 * livre. Os limites abaixo não restringem nenhum uso legítimo; existem só para que um cliente
 * malicioso não consiga montar um payload arbitrariamente grande direto contra a Server Action.
 */
const MAX_SERVICES = 10; // hoje só existem 3 serviços reais (site/trafego/design) — folga generosa
const MAX_ANSWERS_PER_SERVICE = 50; // nenhuma configuração de serviço tem hoje mais que ~15 perguntas
const MAX_ANSWER_KEY_LENGTH = 100; // ids de pergunta reais têm poucas dezenas de caracteres
const MAX_ANSWER_VALUE_LENGTH = 200; // ids de opção reais têm poucas dezenas de caracteres
const MAX_ANSWER_ARRAY_LENGTH = 20; // nenhuma pergunta de múltipla escolha real tem tantas opções

const answerValueSchema = z.union([
  z.string().max(MAX_ANSWER_VALUE_LENGTH),
  z.array(z.string().max(MAX_ANSWER_VALUE_LENGTH)).max(MAX_ANSWER_ARRAY_LENGTH),
]);

const answersSchema = z
  .record(z.string().max(MAX_ANSWER_KEY_LENGTH), answerValueSchema)
  .refine((answers) => Object.keys(answers).length <= MAX_ANSWERS_PER_SERVICE, {
    message: "Excesso de respostas para um único serviço.",
  });

export const leadPayloadSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().min(2).max(120),
    whatsapp: z
      .string()
      .trim()
      .regex(/^55\d{10,11}$/, "WhatsApp fora do formato normalizado esperado."),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    websiteOrInstagram: z.string().trim().min(1).max(200).optional(),
  }),
  project: z.object({
    services: z
      .array(
        z.object({
          serviceId: z.enum(["site", "trafego", "design"]),
          answers: answersSchema,
        }),
      )
      .min(1, "O projeto precisa ter ao menos um serviço.")
      .max(MAX_SERVICES, "Excesso de serviços em um único projeto."),
  }),
  meta: z.object({
    createdAt: z.iso.datetime(),
    idempotencyKey: z.string().trim().min(1).max(200),
  }),
});
