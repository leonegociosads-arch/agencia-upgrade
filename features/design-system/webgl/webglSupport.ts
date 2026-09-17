/**
 * Detecção de suporte a WebGL (Fase 3D/WebGL, Seção 30 do briefing: "detectar suporte... se WebGL
 * não estiver disponível, site continua funcionando"). Resultado cacheado em módulo — criar um
 * `<canvas>` de teste a cada checagem seria desperdício, e o suporte não muda durante a sessão.
 *
 * `false` no servidor (nunca acessa `document` fora do cliente — Seção 43: "WebGL deve ser
 * executado apenas no client").
 */
let cachedSupport: boolean | null = null;

export function hasWebGL(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cachedSupport = !!gl;
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
}

/** Só para testes — evita que o cache de um teste vaze para o próximo. */
export function resetWebGLSupportCache(): void {
  cachedSupport = null;
}
