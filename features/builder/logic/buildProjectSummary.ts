import { buildServiceSummary } from "./buildServiceSummary";
import { SERVICES } from "../data/services";
import type { MyUpgrade, ServiceId, ServiceReviewSummary, UpgradeItem } from "../types";

/**
 * DISPLAY SUMMARY do projeto inteiro (Resumo do Projeto, Etapa 11) — agrega
 * `buildServiceSummary` (Etapa 9) por serviço confirmado, sem duplicar a lógica de tradução de
 * respostas. Itera `Object.entries(confirmedServices)`, não uma lista fixa de `ServiceId`, pela
 * mesma razão já registrada no Meu Upgrade (Etapa 10): a ordem das chaves de um objeto simples já
 * é a ordem em que cada serviço foi confirmado pela primeira vez, e editar depois não muda essa
 * posição — é "a ordem definida no Meu Upgrade" que este resumo deve preservar. Função pura.
 */
export function buildProjectSummary(confirmedServices: MyUpgrade): ServiceReviewSummary[] {
  return (Object.entries(confirmedServices) as [ServiceId, UpgradeItem][]).map(([serviceId, item]) => ({
    serviceId,
    title: SERVICES[serviceId].label,
    items: buildServiceSummary(serviceId, item.answers),
  }));
}
