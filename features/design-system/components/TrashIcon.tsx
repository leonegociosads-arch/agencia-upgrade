export interface TrashIconProps {
  className?: string;
}

/** Ícone linear de remoção (mesmo traço de `ServiceIcon.tsx`) — reaproveitado em toda ação
 * destrutiva do Builder (`MyUpgradeItem`, `ProjectReviewService`) para nunca existirem dois
 * símbolos diferentes para o mesmo significado (briefing Microinterações, Seção 59). */
export default function TrashIcon({ className }: TrashIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
    </svg>
  );
}
