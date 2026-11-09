import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BuilderLogoLab from "@/features/lab/BuilderLogoLab";

export const metadata: Metadata = {
  title: "Laboratório — O U que se monta",
  robots: { index: false, follow: false },
};

/**
 * PROTÓTIPO ISOLADO (ideia E1 da auditoria de 09/11/2026): "o U que se monta" — 1 serviço acende uma
 * parte do "U", 2 deixam mais completo, 3 completam a marca. NÃO está ligado ao Builder real nem à
 * Home, não grava nada e não é uma decisão aprovada: serve só para o dono ver a ideia funcionando.
 *
 * Bloqueado em produção (mesmo padrão de `/builder/experiencia` e `/design-system`): fora do
 * `next dev`, a rota responde 404. Também tem `noindex`.
 */
export default function BuilderLogoLabPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <BuilderLogoLab />;
}
