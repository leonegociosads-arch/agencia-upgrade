import type { Metadata } from "next";
import { BuilderProvider } from "@/features/builder/state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "@/features/builder/components/BuilderShell";

/**
 * `noindex, follow` (Fase SEO, Seção 11 do briefing) — o Builder é a FERRAMENTA de conversão, não
 * uma landing page com conteúdo próprio para ranquear (todo o conteúdo é dinâmico/dependente de
 * estado do usuário, sem nenhuma cópia estável para o Google indexar). `follow: true` (não
 * `nofollow`): a página em si não deve aparecer em busca, mas isso não deve impedir o Google de
 * seguir links que eventualmente apontem A PARTIR dela — diferente de `/admin` (Seção 12), que é
 * de fato privado.
 */
export const metadata: Metadata = {
  title: "Monte seu Upgrade",
  robots: { index: false, follow: true },
};

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>
  );
}
