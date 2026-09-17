import DesignSystemEmptyState from "@/features/design-system/components/EmptyState";

/** Fase 19: reaproveita o `EmptyState` do Design System em vez de um `<p>` solto — mesma API
 * (`message`) para não exigir nenhuma mudança nos dois call sites (`app/admin/(protected)/page.tsx`
 * e a tela de detalhe). */
export default function EmptyState({ message }: { message: string }) {
  return <DesignSystemEmptyState title={message} />;
}
