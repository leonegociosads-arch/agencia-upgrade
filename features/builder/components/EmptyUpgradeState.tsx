"use client";

import DesignSystemEmptyState from "@/features/design-system/components/EmptyState";
import Button from "@/features/design-system/components/Button";

interface EmptyUpgradeStateProps {
  onAddService: () => void;
}

/**
 * WF-13 (docs/WIREFRAME-SCREENS.md) — estado vazio do "Meu Upgrade". O botão leva ao seletor
 * principal (nunca inicia um serviço específico sozinho — quem escolhe qual é o usuário).
 * Reaproveita o `EmptyState` do Design System (Fase 18/19) em vez de duplicar o padrão.
 */
export default function EmptyUpgradeState({ onAddService }: EmptyUpgradeStateProps) {
  return (
    <DesignSystemEmptyState
      title="Seu Upgrade ainda está vazio."
      action={
        <Button onClick={onAddService} size="sm">
          Adicionar um serviço
        </Button>
      }
    />
  );
}
