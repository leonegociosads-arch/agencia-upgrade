import type { ReactNode } from "react";

/**
 * Ilustrações das opções da cena especial (`ShowcaseQuestionPanel`) — ícones de traço preto e
 * grosso, no estilo da referência aprovada (raio, carrinho, estrela…). Desenhados à mão em SVG
 * (24×24, `currentColor`), sem biblioteca externa. Chave = `idDaPergunta:idDaOpção`, a mesma
 * convenção de `data/optionAssets.ts`. Opção sem entrada aqui simplesmente aparece sem ícone.
 *
 * Para trocar por arte própria no futuro, basta devolver um `<img>` na entrada correspondente.
 */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const DOT = { fill: "currentColor", stroke: "none" } as const;

const CHAT = (
  <Icon>
    <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H10l-5.5 4v-15A1.5 1.5 0 0 1 5 4.5z" />
    <path d="M8.5 9.5h7M8.5 12.5h4.5" />
  </Icon>
);
const FORM = (
  <Icon>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9.5 2.5h5v3h-5z" />
    <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
  </Icon>
);
const CALENDAR_BASE = (
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </>
);
const CALENDAR = (
  <Icon>
    {CALENDAR_BASE}
    <path d="M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2" />
  </Icon>
);
const PLUG = (
  <Icon>
    <path d="M9 2.5v5M15 2.5v5" />
    <path d="M6 7.5h12V11a6 6 0 0 1-12 0z" />
    <path d="M12 17v4.5" />
  </Icon>
);
const BAG = (
  <Icon>
    <path d="M5 8h14l-1.2 12.5H6.2z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Icon>
);
const CARD = (
  <Icon>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 10h19M6.5 15h4" />
  </Icon>
);
const USER = (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
const BOX = (
  <Icon>
    <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
    <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
  </Icon>
);
const LOCK = (
  <Icon>
    <rect x="4.5" y="10.5" width="15" height="11" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 15v2.5" />
  </Icon>
);
const DASHBOARD = (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </Icon>
);
const RECURRING_PAYMENT = (
  <Icon>
    <path d="M20 11A8 8 0 0 0 5.5 6.5L3.5 8.5" />
    <path d="M3.5 4v4.5H8" />
    <path d="M4 13a8 8 0 0 0 14.5 4.5l2-2" />
    <path d="M20.5 20v-4.5H16" />
    <path d="M12 8.5v7M14 10.2h-2.8a1.3 1.3 0 0 0 0 2.6h1.6a1.3 1.3 0 0 1 0 2.6H10" />
  </Icon>
);
const NETWORK = (
  <Icon>
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="19" r="2.5" />
    <circle cx="19" cy="19" r="2.5" />
    <path d="M12 7.5v4M12 11.5 6.8 17M12 11.5l5.2 5.5" />
  </Icon>
);
const SEEDLING = (
  <Icon>
    <path d="M12 21v-9" />
    <path d="M12 12c0-4-3-6.5-7.5-6.5 0 4 3 6.5 7.5 6.5z" />
    <path d="M12 14.5c0-4.5 3-7.5 7.5-7.5 0 4.5-3 7.5-7.5 7.5z" />
  </Icon>
);
const MEGAPHONE = (
  <Icon>
    <path d="M3.5 10v4a1 1 0 0 0 1 1h2.5l9 5.5v-17L7 9H4.5a1 1 0 0 0-1 1z" />
    <path d="M19.5 9a4 4 0 0 1 0 6" />
    <path d="M7 15l1.5 5" />
  </Icon>
);
const TREND_UP = (
  <Icon>
    <path d="M3 17.5 9 11.5l4 4 8-8" />
    <path d="M15 7.5h6v6" />
  </Icon>
);
const TREND_DOWN = (
  <Icon>
    <path d="M3 6.5 9 12.5l4-4 8 8" />
    <path d="M15 16.5h6v-6" />
  </Icon>
);
const SPARKLES = (
  <Icon>
    <path d="M11 3.5 12.8 8.7 18 10.5l-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8z" />
    <path d="M19 15.5v5M16.5 18h5" />
  </Icon>
);
const PEN = (
  <Icon>
    <path d="M12.5 20.5h8.5" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);
const REFRESH = (
  <Icon>
    <path d="M20 11A8 8 0 0 0 5.5 6.5L3.5 8.5" />
    <path d="M3.5 4v4.5H8" />
    <path d="M4 13a8 8 0 0 0 14.5 4.5l2-2" />
    <path d="M20.5 20v-4.5H16" />
  </Icon>
);
const LAYERS = (
  <Icon>
    <path d="M12 2.5 21 7l-9 4.5L3 7z" />
    <path d="M3 12l9 4.5 9-4.5" />
    <path d="M3 16.5 12 21l9-4.5" />
  </Icon>
);
const CALENDAR_REPEAT = (
  <Icon>
    {CALENDAR_BASE}
    <path d="M15 14.2a3.2 3.2 0 0 0-5.7-1" />
    <path d="M9 12v1.8h1.8" />
    <path d="M9 16.3a3.2 3.2 0 0 0 5.7 1" />
    <path d="M15 18.5v-1.8h-1.8" />
  </Icon>
);
const TARGET = (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.6" {...DOT} />
  </Icon>
);
const CALENDAR_CHECK = (
  <Icon>
    {CALENDAR_BASE}
    <path d="m9 15 2 2 4-4" />
  </Icon>
);
const IMAGE_STACK = (
  <Icon>
    <rect x="7" y="3" width="14" height="14" rx="2" />
    <path d="M3 7v12a2 2 0 0 0 2 2h12" />
    <path d="m7.5 14 3.5-3.5 2.5 2.5 2-2 5 5" />
  </Icon>
);
const USERS = (
  <Icon>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
  </Icon>
);
const QUESTION = (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
    <circle cx="12" cy="17.2" r="0.6" {...DOT} />
  </Icon>
);
const IMAGE = (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.8" />
    <path d="m21 16-5-5-9 9" />
  </Icon>
);
const PLAY = (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M10 9.2v5.6l4.8-2.8z" {...DOT} />
  </Icon>
);
const IMAGE_AND_PLAY = (
  <Icon>
    <rect x="1.8" y="6.5" width="9.7" height="11" rx="1.6" />
    <path d="m1.8 15 3-3 3.5 3.5" />
    <rect x="12.5" y="6.5" width="9.7" height="11" rx="1.6" />
    <path d="M16 10v4l3.2-2z" {...DOT} />
  </Icon>
);
const VIDEO_CAMERA = (
  <Icon>
    <rect x="2.5" y="6" width="13" height="12" rx="2" />
    <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
  </Icon>
);
const CAMERA = (
  <Icon>
    <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
);
const FILM = (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7.5 3v18M16.5 3v18M3 8h4.5M3 12h4.5M3 16h4.5M16.5 8H21M16.5 12H21M16.5 16H21" />
  </Icon>
);
const PALETTE = (
  <Icon>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-4 3.5h-2a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 21z" />
    <circle cx="7.5" cy="11" r="1.3" {...DOT} />
    <circle cx="10.5" cy="7" r="1.3" {...DOT} />
    <circle cx="15.5" cy="7.5" r="1.3" {...DOT} />
  </Icon>
);

const OPTION_ICONS: Readonly<Record<string, ReactNode>> = {
  // Site — etapa 3 (as opções mudam conforme o tipo de site).
  "site_recursos:apresentacao_contato": CHAT,
  "site_recursos:formularios_leads": FORM,
  "site_recursos:agendamento_orcamento": CALENDAR,
  "site_recursos:integracoes_ferramentas": PLUG,
  "site_recursos:catalogo_pedidos": BAG,
  "site_recursos:pagamento_online": CARD,
  "site_recursos:area_cliente": USER,
  "site_recursos:integracoes_estoque_pagamentos": BOX,
  "site_recursos:login_area_restrita": LOCK,
  "site_recursos:painel_dashboard": DASHBOARD,
  "site_recursos:pagamentos_assinaturas": RECURRING_PAYMENT,
  "site_recursos:integracao_outros_sistemas": NETWORK,
  // Tráfego Pago — etapa 4.
  "trafego_experiencia:nunca_anunciei": SEEDLING,
  "trafego_experiencia:anunciei_algumas_vezes": MEGAPHONE,
  "trafego_experiencia:anuncio_atualmente": TREND_UP,
  "trafego_experiencia:anunciei_sem_resultado": TREND_DOWN,
  // Design e Social Media — etapa 3 (depende do serviço escolhido na etapa 2).
  "identidade_situacao:sem_identidade": SPARKLES,
  "identidade_situacao:basico_profissionalizar": PEN,
  "identidade_situacao:tenho_quero_renovar": REFRESH,
  "design_formato:pacote_artes": LAYERS,
  "design_formato:conteudo_recorrente": CALENDAR_REPEAT,
  "design_formato:campanha_especifica": TARGET,
  "social_necessidade:planejamento_conteudo": CALENDAR_CHECK,
  "social_necessidade:criacao_recorrente": IMAGE_STACK,
  "social_necessidade:gestao_completa": USERS,
  "social_necessidade:nao_sei": QUESTION,
  "criativos_formato:imagens": IMAGE,
  "criativos_formato:videos": PLAY,
  "criativos_formato:imagens_videos": IMAGE_AND_PLAY,
  "video_material:videos_gravados": VIDEO_CAMERA,
  "video_material:fotos_imagens": CAMERA,
  "video_material:videos_fotos": FILM,
  "video_material:criar_materiais_graficos": PALETTE,
};

export function getShowcaseOptionIcon(questionId: string, optionId: string): ReactNode | null {
  return OPTION_ICONS[`${questionId}:${optionId}`] ?? null;
}
