"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBuilder } from "@/features/builder/state/BuilderContext";
import { buildProjectSummary } from "@/features/builder/logic/buildProjectSummary";
import { SUMMARY_TITLES } from "@/features/builder/components/ProjectReviewService";
import { useLeadDraft } from "../state/LeadContext";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import ContactIcon from "@/features/design-system/components/ContactIcon";
import { playSound } from "@/features/design-system/motion/sound";
import { getResponseTimeLabel, getWhatsAppLink } from "@/lib/contact/siteContact";
import styles from "./SubmissionSuccess.module.css";

/**
 * Estado `"success"` (WF-11) — o fim da jornada. Redesenho da auditoria de 09/11/2026 (achado A7):
 * antes era um "✓" em texto, a lista dos serviços e um único botão "Iniciar novo projeto" (um convite
 * a apagar o que a pessoa acabou de fazer), a tela mais simples do fluxo depois de partículas,
 * cutscene, prancheta e mascote.
 *
 * Agora usa o MESMO vocabulário visual do Builder — a janela com os 3 pontinhos e o check em pixel
 * art da tela "Serviço adicionado" — e responde, em ordem: deu certo (título + check), o que foi
 * enviado (os serviços montados), que está guardado (frase factual: só aparece depois de a Server
 * Action confirmar a gravação), e o que acontece agora (texto honesto, prazo só se configurado).
 *
 * Próximo passo:
 * - com WhatsApp configurado: principal "Continuar pelo WhatsApp", secundário "Ver projetos";
 * - sem WhatsApp: principal "Ver projetos", secundário "Voltar ao site";
 * - sempre, discreto: "Iniciar novo projeto" (limpa a sessão — Fase 14).
 * Nenhum número, prazo ou promessa é inventado: tudo vem de `lib/contact/siteContact.ts`.
 *
 * Título "Recebemos seu projeto." (Etapa 32): só é verdade porque este componente só aparece depois de
 * `submitLeadSuccess()`, chamado quando a gravação foi confirmada.
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
  // [PENDENTE — PRAZO E WHATSAPP] Os dois vêm de configuração (`lib/contact/siteContact.ts`) e só
  // aparecem quando a Upgrade os definir; sem isso, nenhum prazo nem número é inventado.
  const responseTime = getResponseTimeLabel();
  const whatsappLink = getWhatsAppLink();

  useEffect(() => {
    // Toca ao CHEGAR nesta tela (o momento real do sucesso).
    playSound("success");
  }, []);

  return (
    <div className={styles.scene}>
      <section className={styles.card} aria-labelledby="success-title">
        <div className={styles.titlebar}>
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </span>
          <span className={styles.tag}>Projeto enviado</span>
        </div>

        <div className={styles.content}>
          <Image
            src="/assets/builder/service-complete/pixel-check.png"
            alt=""
            width={221}
            height={216}
            className={styles.check}
            sizes="88px"
          />
          <h2 id="success-title" className={styles.title}>
            Recebemos seu projeto.
          </h2>
          {firstName && <p className={styles.thanks}>Obrigado, {firstName}!</p>}

          <div className={styles.block}>
            <p className={styles.blockLabel}>O que você montou</p>
            <ul className={styles.services}>
              {summaries.map((summary) => (
                <li key={summary.serviceId} className={styles.service}>
                  <span className={styles.serviceIcon} aria-hidden="true">
                    <ServiceIcon serviceId={summary.serviceId} />
                  </span>
                  {SUMMARY_TITLES[summary.serviceId]}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.next}>
            <p className={styles.nextLine}>
              <span className={styles.nextDot} aria-hidden="true" />
              <span>Seu projeto ficou registrado com a Upgrade do jeito que você montou.</span>
            </p>
            {/* Antes: "Próximo passo: nossa equipe vai analisar seu projeto e entrar em contato em breve." */}
            <p className={styles.nextLine}>
              <span className={styles.nextDot} aria-hidden="true" />
              <span>
                O que acontece agora: a equipe da Upgrade analisa o que você montou e entra em contato pelos dados que
                você informou{responseTime ? `, ${responseTime}` : ""}.
              </span>
            </p>
          </div>

          <div className={styles.actions}>
            {whatsappLink ? (
              <>
                <a
                  className={styles.primary}
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Continuar pelo WhatsApp (abre em nova aba)"
                >
                  <ContactIcon kind="whatsapp" />
                  Continuar pelo WhatsApp
                </a>
                <Link className={styles.secondary} href="/projetos">
                  Ver projetos
                </Link>
              </>
            ) : (
              <>
                <Link className={styles.primary} href="/projetos">
                  Ver projetos
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
                  </svg>
                </Link>
                <Link className={styles.secondary} href="/">
                  Voltar ao site
                </Link>
              </>
            )}
          </div>

          <button type="button" className={styles.restart} onClick={onStartNewProject}>
            Iniciar novo projeto
          </button>
        </div>
      </section>
    </div>
  );
}
