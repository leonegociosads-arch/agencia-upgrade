import { requireAdminSession } from "@/lib/auth/adminSession";
import { getLeadById } from "@/lib/repositories/leads";
import { listLeadNotes } from "@/lib/repositories/leadNotes";
import { listLeadStatusHistory } from "@/lib/repositories/leadStatusHistory";
import LeadDetail from "@/features/admin/components/LeadDetail";
import ErrorState from "@/features/admin/components/ErrorState";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { supabase } = await requireAdminSession();
  const { id } = await params;

  const result = await getLeadById(supabase, id);
  if (!result.ok) {
    return <ErrorState message={result.message} />;
  }

  const [notes, history] = await Promise.all([listLeadNotes(supabase, id), listLeadStatusHistory(supabase, id)]);

  return <LeadDetail lead={result.lead} notes={notes} history={history} />;
}
