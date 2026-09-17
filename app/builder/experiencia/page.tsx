import { notFound } from "next/navigation";
import BuilderExperiencePoc from "@/features/builder-experience/components/BuilderExperiencePoc";

/**
 * Prova de conceito da linguagem de interação principal do Builder — mostra só a Cena 1 (escolha
 * de serviço) e a Cena 2 (primeira pergunta real do serviço escolhido), para validar fundo/cards/
 * floating/seleção/transição antes de decidir replicar no restante do Builder real (`/builder`,
 * inalterado). Bloqueada em produção (mesmo padrão de `/design-system`, `docs/DESIGN-SYSTEM.md`) —
 * é uma ferramenta interna de revisão, nunca uma tela pública do site.
 */
export default function BuilderExperiencePocPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <BuilderExperiencePoc />;
}
