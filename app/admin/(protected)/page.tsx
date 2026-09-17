import { requireAdminSession } from "@/lib/auth/adminSession";
import { listLeads, getAdminLeadCounts } from "@/lib/repositories/leads";
import { getAnalyticsOverview } from "@/lib/repositories/analyticsEvents";
import { isValidLeadStatus, type LeadStatus } from "@/features/admin/logic/leadStatus";
import { isValidAnalyticsPeriod, resolvePeriodStart } from "@/features/admin/logic/resolvePeriodStart";
import { SERVICES } from "@/features/builder/data/services";
import type { ServiceId } from "@/features/builder/types";
import type { LeadScoreTier } from "@/features/lead/logic/getLeadScoreTier";
import DashboardSummary from "@/features/admin/components/DashboardSummary";
import AnalyticsOverview from "@/features/admin/components/AnalyticsOverview";
import LeadsFilters from "@/features/admin/components/LeadsFilters";
import LeadsList from "@/features/admin/components/LeadsList";
import Pagination from "@/features/admin/components/Pagination";
import EmptyState from "@/features/admin/components/EmptyState";
import ErrorState from "@/features/admin/components/ErrorState";

const VALID_TIERS: LeadScoreTier[] = ["LOW", "MEDIUM", "HIGH", "PRIORITY"];
const VALID_SERVICES = Object.keys(SERVICES) as ServiceId[];

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface AdminHomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Home do admin — "central de oportunidades" (`docs/ADMIN-CRM.md`): resumo mínimo + lista
 * filtrável/ordenável/paginada. Filtros e paginação vivem inteiramente na URL (`searchParams`),
 * então voltar/avançar no navegador e compartilhar um link com filtros aplicados funcionam sem
 * nenhum estado de cliente.
 */
export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const { supabase } = await requireAdminSession();
  const sp = await searchParams;

  const statusParam = readParam(sp.status);
  const tierParam = readParam(sp.tier);
  const serviceParam = readParam(sp.service);
  const searchTerm = readParam(sp.q);
  const sort = readParam(sp.sort) === "score" ? "score" : "recent";
  const page = Number(readParam(sp.page)) || 1;
  const periodParam = readParam(sp.analyticsPeriod);
  const period = periodParam && isValidAnalyticsPeriod(periodParam) ? periodParam : "7d";

  const status: LeadStatus | undefined = statusParam && isValidLeadStatus(statusParam) ? statusParam : undefined;
  const tier: LeadScoreTier | undefined = tierParam && VALID_TIERS.includes(tierParam as LeadScoreTier) ? (tierParam as LeadScoreTier) : undefined;
  const service: ServiceId | undefined = serviceParam && VALID_SERVICES.includes(serviceParam as ServiceId) ? (serviceParam as ServiceId) : undefined;

  const [result, counts, analyticsOverview] = await Promise.all([
    listLeads(supabase, { filters: { status, tier, service, search: searchTerm }, sort, page }),
    getAdminLeadCounts(supabase),
    getAnalyticsOverview(supabase, resolvePeriodStart(period)),
  ]);

  const currentParams: Record<string, string | undefined> = {
    status,
    tier,
    service,
    q: searchTerm,
    sort,
    page: String(page),
  };

  return (
    <div>
      <AnalyticsOverview overview={analyticsOverview} period={period} currentParams={currentParams} />
      <DashboardSummary counts={counts} />
      <LeadsFilters current={{ status, tier, service, search: searchTerm, sort }} />

      {!result.ok ? (
        <ErrorState message={result.message} />
      ) : result.items.length === 0 ? (
        <EmptyState message="Nenhum projeto recebido ainda." />
      ) : (
        <>
          <LeadsList items={result.items} />
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            searchParams={{ status, tier, service, q: searchTerm, sort }}
          />
        </>
      )}
    </div>
  );
}
