import { SERVICES } from "@/features/builder/data/services";
import { buildServiceSummary } from "@/features/builder/logic/buildServiceSummary";
import type { ProjectSnapshot, ServiceReviewSummary } from "@/features/builder/types";

/**
 * Resumo legível de um `ProjectSnapshot` para o detalhe do admin (Fase 16) — "reutilizar lógica de
 * display labels criada anteriormente", não reescrever. Reaproveita `buildServiceSummary`
 * (Etapa 9) diretamente, a mesma função pura que já monta o Resumo do Projeto público
 * (`features/builder/logic/buildProjectSummary.ts`) — só não usa `buildProjectSummary` porque
 * aquela função espera `MyUpgrade` (um record com `UpgradeItem`, que inclui `status`/timestamps
 * que um `ProjectSnapshot` não tem), enquanto aqui a entrada já é o `ProjectSnapshot` gravado no
 * banco (um array de `{serviceId, answers}`). O resultado é o mesmo tipo (`ServiceReviewSummary[]`).
 *
 * Reutilizar uma função pura de `features/builder/logic` a partir de `features/admin` é uma
 * exceção deliberada e estreita à regra da Fase 6 ("nunca admin → builder", pensada para
 * componentes/estado) — ver `docs/DECISIONS.md`, Fase 16.
 */
export function buildAdminProjectSummary(project: ProjectSnapshot): ServiceReviewSummary[] {
  return project.services.map((service) => ({
    serviceId: service.serviceId,
    title: SERVICES[service.serviceId].label,
    items: buildServiceSummary(service.serviceId, service.answers),
  }));
}
