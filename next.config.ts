import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança + CSP (Etapa 29 — Segurança, Seções 50-56).
 *
 * CSP SEM nonce, de propósito: a maioria das rotas do site é estática (`next build` já mostra
 * quase todas como `○`, Fase SEO/LGPD) — um CSP com nonce exige renderização dinâmica em toda
 * página (`node_modules/next/dist/docs/.../content-security-policy.md`, "Static vs Dynamic
 * Rendering with CSP"), o que jogaria fora todo o trabalho de performance/SEO já feito sem um
 * ganho de segurança proporcional para este projeto. A própria documentação do Next recomenda essa
 * variante ("Without Nonces") para quem não precisa de CSP estrita por requisito de compliance.
 *
 * `'unsafe-inline'` em `script-src`/`style-src`: necessário porque o App Router injeta o payload
 * de hidratação (RSC) e alguns estilos inline sem nonce nesta variante estática — é a mesma
 * concessão que o exemplo oficial "Without Nonces" documenta. Não abre uma porta nova: sem
 * `dangerouslySetInnerHTML` de conteúdo de usuário em lugar nenhum do projeto (auditado nesta
 * fase — `docs/SECURITY.md`, Seção "XSS"), o risco real de injeção de script já é baixo.
 *
 * Domínios de terceiro só os dois que o projeto pode carregar condicionalmente (Fase 17): GA4
 * (`googletagmanager.com`/`google-analytics.com`) e Meta Pixel (`facebook.net`/`facebook.com`).
 * Listados aqui mesmo que as variáveis de ambiente correspondentes não estejam configuradas — CSP
 * descreve o que É PERMITIDO, não o que está ativo agora.
 */
const isDev = process.env.NODE_ENV === "development";

const CONNECT_SRC = ["'self'", "https://*.supabase.co", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://www.googletagmanager.com", "https://connect.facebook.net", "https://www.facebook.com"];

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src ${CONNECT_SRC.join(" ")}`,
  "img-src 'self' data: https://www.googletagmanager.com https://www.facebook.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // `upgrade-insecure-requests` e HSTS (abaixo) só fazem sentido onde HTTPS de verdade existe —
  // nunca em dev, que serve `http://localhost` puro (Seção 49 do briefing da Etapa 29: "produção
  // somente HTTPS", não "todo ambiente"). Bug real encontrado via E2E nesta fase (Etapa 31): o
  // WebKit (Safari) aplica HSTS/upgrade-insecure-requests de forma mais estrita que Chromium/
  // Firefox mesmo em `localhost` — depois da PRIMEIRA resposta com esses cabeçalhos, o WebKit
  // passou a forçar HTTPS em toda requisição seguinte (fontes, CSS, chunks), e como o `next dev`
  // não fala TLS, TODA a página quebrava silenciosamente ("SSL connect error" no console) — banner
  // de consentimento, login do admin e o fluxo do Builder pareciam travados, mas a causa real era
  // puramente de transporte, nunca a lógica da aplicação.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  // Redundante com `frame-ancestors 'none'` acima para navegadores modernos, mantido pela
  // compatibilidade mais ampla que scanners/ferramentas de auditoria ainda esperam encontrar.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Bloqueia todas as APIs sensíveis do navegador que o site não usa (Seção 56) — nenhuma
  // funcionalidade real depende de câmera/microfone/geolocalização/pagamentos/USB.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Só em produção — ver o comentário de `upgrade-insecure-requests` acima para o bug real que
  // enviar isto em desenvolvimento causava no WebKit/Safari.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  // Some expor "X-Powered-By: Next.js" (Seção 58/62 — não revelar detalhes internos desnecessários).
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
