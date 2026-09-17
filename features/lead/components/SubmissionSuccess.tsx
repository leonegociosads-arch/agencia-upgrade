"use client";

import { useEffect } from "react";
import { useBuilder } from "@/features/builder/state/BuilderContext";
import { buildProjectSummary } from "@/features/builder/logic/buildProjectSummary";
import { useLeadDraft } from "../state/LeadContext";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Button from "@/features/design-system/components/Button";
import { playSound } from "@/features/design-system/motion/sound";
import styles from "./SubmissionSuccess.module.css";

/**
 * Estado `"success"` (WF-11) — UI final na Fase 19. O texto "Próximo passo" substitui a nota
 * antiga sobre integração comercial futura (Etapa 12): a persistência real já existe desde a Fase
 * 13, então aquele aviso estava desatualizado. Nenhum CTA de WhatsApp foi adicionado (briefing,
 * Seção 17: "quando aplicável") — não existe um número da própria Upgrade configurado em nenhum
 * lugar do projeto para linkar; inventar um violaria a regra de nunca preencher automaticamente
 * conteúdo que não existe.
 *
 * Título "Recebemos seu projeto." (corrigido na Etapa 32, Testes de UX — antes: "Projeto validado
 * com sucesso."). A redação antiga vinha de uma decisão real da Fase 12 (`docs/DECISIONS.md`):
 * "Recebemos" foi evitado ali porque, naquela fase, nenhuma integração/persistência real existia
 * ainda — dizer "recebemos" seria falso. Essa razão não existe mais desde a Fase 13 (Supabase real
 * — este componente só é alcançado depois de `submitLeadSuccess()`, chamado em `LeadForm.tsx`
 * somente quando a Server Action confirma a gravação). Com a razão original superada, "validado"
 * ficou como a pior opção das duas: soa como uma etapa de aprovação/triagem ainda pendente
 * ("será que meu projeto passou?"), o oposto do que a Seção 40/41 do briefing de UX pedem (deixar
 * claro que deu certo, sem gerar ansiedade). "Recebemos seu projeto." é direto, verdadeiro agora, e
 * é exatamente a redação que `docs/USER-FLOW.md` (Seção 15) já previa desde a Fase 4.
 */
interface SubmissionSuccessProps {
  /** "Iniciar novo projeto" (Fase 14) — limpa a sessão (Builder + leadDraft + storage local)
   * depois de mostrar a confirmação; nunca chamado automaticamente (docs/SESSION-PERSISTENCE.md,
   * "Limpeza após sucesso": dados continuam disponíveis enquanto esta tela estiver visível). */
  onStartNewProject: () => void;
}

export default function SubmissionSuccess({ onStartNewProject }: SubmissionSuccessProps) {
  const { state } = useBuilder();
  const { leadDraft } = useLeadDraft();
  const summaries = buildProjectSummary(state.confirmedServices);
  const firstName = leadDraft.name.trim().split(/\s+/)[0] || "";

  useEffect(() => {
    // Toca ao CHEGAR nesta tela (o momento real do sucesso) — mesmo padrão de `service_complete`
    // em `ServiceComplete.tsx` (Fase GSAP e Transições).
    playSound("success");
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.check} aria-hidden="true">
        ✓
      </div>
      <Heading variant="h2" as="h2" className={styles.title}>
        Recebemos seu projeto.
      </Heading>
      {firstName && (
        <Text size="lg" color="secondary">
          Obrigado, {firstName}!
        </Text>
      )}

      <ul className={styles.list}>
        {summaries.map((summary) => (
          <li key={summary.serviceId}>{summary.title}</li>
        ))}
      </ul>

      <Text as="p" size="sm" color="secondary" className={styles.note}>
        Próximo passo: nossa equipe vai analisar seu projeto e entrar em contato em breve.
      </Text>

      <Button onClick={onStartNewProject}>Iniciar novo projeto</Button>
    </div>
  );
}
