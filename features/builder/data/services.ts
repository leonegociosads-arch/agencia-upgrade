import type { ServiceDefinition, ServiceId } from "../types";

// Fonte central de configuração dos 3 serviços — nunca espalhar labels pelo projeto.
// O `id` interno nunca muda; `label`/`shortDescription` podem ser ajustados a qualquer momento
// (ver docs/TECHNICAL-ARCHITECTURE.md, Seção 14).
export const SERVICES: Record<ServiceId, ServiceDefinition> = {
  site: {
    id: "site",
    label: "Criar um site",
    shortDescription: "Sites, landing pages, lojas virtuais e sistemas.",
  },
  trafego: {
    id: "trafego",
    label: "Atrair mais clientes",
    shortDescription: "Gestão de tráfego pago e campanhas.",
  },
  design: {
    id: "design",
    label: "Fortalecer minha marca e conteúdo",
    shortDescription: "Design, identidade visual, social media e edição de vídeos.",
  },
};

export const SERVICE_IDS: ServiceId[] = ["site", "trafego", "design"];
