import type { ServiceId } from "@/features/builder/types";

export interface ServiceIconProps {
  serviceId: ServiceId;
  className?: string;
}

const SHARED = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Ícone linear por serviço — um único desenho por `ServiceId`, reaproveitado na Home e no Builder
 * (`ServiceSelector`) para a mesma categoria nunca aparecer com dois símbolos diferentes. Traço
 * simples (`currentColor`, sem preenchimento) para casar com a linguagem "ícones lineares" do
 * manual de marca, sem depender de uma biblioteca externa.
 */
export default function ServiceIcon({ serviceId, className }: ServiceIconProps) {
  if (serviceId === "site") {
    return (
      <svg {...SHARED} width="22" height="22" className={className} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="m9.5 13-2 2 2 2" />
        <path d="m14.5 13 2 2-2 2" />
      </svg>
    );
  }

  if (serviceId === "trafego") {
    return (
      <svg {...SHARED} width="22" height="22" className={className} aria-hidden="true">
        <path d="M3 17 9 11 13 15 21 7" />
        <path d="M15 7h6v6" />
      </svg>
    );
  }

  return (
    <svg {...SHARED} width="22" height="22" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" />
      <rect x="11.5" y="11.5" width="9" height="9" rx="1.5" />
    </svg>
  );
}
