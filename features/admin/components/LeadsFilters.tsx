import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "../logic/leadStatus";
import { LEAD_SCORE_TIER_LABELS } from "../logic/leadScoreDisplay";
import type { LeadScoreTier } from "@/features/lead/logic/getLeadScoreTier";
import { SERVICES } from "@/features/builder/data/services";
import type { ServiceId } from "@/features/builder/types";
import Input from "@/features/design-system/components/Input";
import Select from "@/features/design-system/components/Select";
import Button from "@/features/design-system/components/Button";
import styles from "./LeadsFilters.module.css";

const TIERS: LeadScoreTier[] = ["LOW", "MEDIUM", "HIGH", "PRIORITY"];
const SERVICE_IDS = Object.keys(SERVICES) as ServiceId[];

export interface LeadsFiltersValue {
  status?: LeadStatus;
  tier?: LeadScoreTier;
  service?: ServiceId;
  search?: string;
  sort: "recent" | "score";
}

/**
 * Formulário `GET` puro (sem JavaScript) — submeter recarrega a mesma rota com os parâmetros de
 * busca novos; o Server Component da página (`app/admin/(protected)/page.tsx`) lê tudo de
 * `searchParams`. Mais simples e mais rápido que um filtro controlado por cliente
 * (`docs/ADMIN-CRM.md`, "priorizar carregamento rápido").
 */
export default function LeadsFilters({ current }: { current: LeadsFiltersValue }) {
  return (
    <form method="get" className={styles.form}>
      <Input
        type="search"
        name="q"
        placeholder="Buscar por nome, empresa, e-mail ou WhatsApp"
        defaultValue={current.search ?? ""}
        className={styles.search}
        aria-label="Buscar"
      />

      <Select name="status" defaultValue={current.status ?? ""} aria-label="Filtrar por status" className={styles.select}>
        <option value="">Status: todos</option>
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <Select name="tier" defaultValue={current.tier ?? ""} aria-label="Filtrar por prioridade" className={styles.select}>
        <option value="">Prioridade: todas</option>
        {TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {LEAD_SCORE_TIER_LABELS[tier]}
          </option>
        ))}
      </Select>

      <Select name="service" defaultValue={current.service ?? ""} aria-label="Filtrar por serviço" className={styles.select}>
        <option value="">Serviço: todos</option>
        {SERVICE_IDS.map((serviceId) => (
          <option key={serviceId} value={serviceId}>
            {SERVICES[serviceId].label}
          </option>
        ))}
      </Select>

      <Select name="sort" defaultValue={current.sort} aria-label="Ordenar" className={styles.select}>
        <option value="recent">Mais recentes</option>
        <option value="score">Maior score</option>
      </Select>

      <Button type="submit" size="sm">
        Filtrar
      </Button>
    </form>
  );
}
