import { cloneAnswers } from "../utils/cloneAnswers";
import type { MyUpgrade, ProjectSnapshot, ServiceId, UpgradeItem } from "../types";

/**
 * PROJECT SNAPSHOT (Etapa 11) — objeto de dados puro do projeto confirmado, para uso futuro por
 * camadas que precisam de dados, não de apresentação (Supabase, WhatsApp, e-mail, admin,
 * analytics — Etapas 12+). Nunca usa `serviceDraft`; só lê `confirmedServices`. Cada `answers` é
 * uma cópia seguro (`cloneAnswers`, Etapa 8) — alterar o snapshot depois de gerado nunca pode
 * afetar o estado confirmado.
 *
 * Mesma ordem de iteração de `buildProjectSummary` (Object.entries preserva a ordem de inserção)
 * — o resumo visual e o snapshot vêm da mesma fonte, na mesma ordem, para nunca poderem divergir
 * (docs/IMPLEMENTATION-STAGE-11.md, Seção "Consistência").
 *
 * Deliberadamente sem dados pessoais do lead: isso só existe a partir da Etapa 12.
 */
export function buildProjectSnapshot(confirmedServices: MyUpgrade): ProjectSnapshot {
  return {
    services: (Object.entries(confirmedServices) as [ServiceId, UpgradeItem][]).map(([serviceId, item]) => ({
      serviceId,
      answers: cloneAnswers(item.answers),
    })),
  };
}
