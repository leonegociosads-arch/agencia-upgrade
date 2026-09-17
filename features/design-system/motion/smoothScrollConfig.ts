import type { LenisOptions } from "lenis";

/**
 * Configuração moderada de Lenis (Fase Smooth Scroll, Seção 10 do briefing: "não exagerar em
 * duration/lerp/wheelMultiplier/touchMultiplier — a sensação deve continuar próxima do scroll
 * natural"). `lerp` é o padrão da própria lib (0.1) — testado como o ponto que já suaviza a roda
 * do mouse sem parecer "borrachudo" (Seção "Objetivo": nada de pesado/atrasado/com excesso de
 * inércia).
 *
 * `syncTouch: false` (padrão da lib) é uma escolha deliberada, não um esquecimento: no touch,
 * Lenis deixa o scroll nativo do sistema operacional passar direto, sem nenhuma suavização
 * artificial (Seções 14/15 do briefing: "usuário deve sentir resposta imediata ao dedo").Ativar
 * `syncTouch` trocaria a inércia nativa do dispositivo pela simulação da própria lib — exatamente
 * o efeito que o briefing pede para evitar.
 */
export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  syncTouch: false,
  smoothWheel: true,
  anchors: false,
};

/**
 * Rotas onde o Lenis NUNCA é instanciado (Seções 3-5 do briefing: "Builder NÃO deve depender do
 * Lenis para funcionar"; "Admin também não precisa de smooth scroll especial"). Comparado por
 * prefixo — cobre `/builder`, `/builder/experiencia`, `/admin`, `/admin/login` etc. de uma vez.
 * `/design-system` (ferramenta interna, Fase Design System) entra pelo mesmo motivo do Admin: uma
 * página de referência de componentes não precisa de smooth scroll.
 */
const NATIVE_SCROLL_ROUTE_PREFIXES = ["/builder", "/admin", "/design-system"] as const;

export function isSmoothScrollRoute(pathname: string): boolean {
  return !NATIVE_SCROLL_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
