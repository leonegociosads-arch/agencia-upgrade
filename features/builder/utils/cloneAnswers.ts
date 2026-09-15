import type { BuilderAnswers } from "../types";

/**
 * Cópia segura de um mapa de respostas — usada ao entrar em modo de edição (o rascunho nunca
 * pode compartilhar referência mutável com a configuração confirmada; alterar o rascunho não
 * pode alterar acidentalmente o item já salvo no "Meu Upgrade").
 */
export function cloneAnswers(answers: BuilderAnswers): BuilderAnswers {
  const copy: BuilderAnswers = {};
  for (const [key, value] of Object.entries(answers)) {
    copy[key] = Array.isArray(value) ? [...value] : value;
  }
  return copy;
}
