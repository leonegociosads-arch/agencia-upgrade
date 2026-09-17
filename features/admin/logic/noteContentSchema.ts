import { z } from "zod";

/** Texto puro, sem HTML — nunca renderizado com `dangerouslySetInnerHTML` (`docs/ADMIN-CRM.md`,
 * Seção "Segurança"). Limite de 2000 caracteres espelha a constraint `check` do banco. */
export const noteContentSchema = z
  .string()
  .trim()
  .min(1, "A nota não pode ficar vazia.")
  .max(2000, "A nota pode ter no máximo 2000 caracteres.");
