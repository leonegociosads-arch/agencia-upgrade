/** Combina nomes de classe condicionalmente, ignorando valores falsy — usado por todo componente
 * do Design System para compor variante + tamanho + estado sem encadear ternários repetidos. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
