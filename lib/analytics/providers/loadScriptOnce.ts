/**
 * Injeta uma `<script src="...">` externa no `<head>` uma única vez, mesmo que chamado várias
 * vezes (GA4/Meta Pixel só devem carregar um script cada, independente de quantos eventos forem
 * disparados). Usado só pelos providers de terceiros (`ga4.ts`, `metaPixel.ts`) — o provider
 * interno nunca carrega script nenhum (usa uma Server Action).
 */
const loadedScriptUrls = new Set<string>();

export function loadScriptOnce(src: string): void {
  if (typeof document === "undefined") return;
  if (loadedScriptUrls.has(src)) return;
  loadedScriptUrls.add(src);

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/** Só para testes — evita que scripts "carregados" num teste sejam considerados presentes no
 * próximo (o `Set` é módulo-level, sobrevive entre `it()`s do mesmo arquivo). */
export function resetLoadedScriptsForTests(): void {
  loadedScriptUrls.clear();
}
