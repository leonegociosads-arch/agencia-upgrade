"use client";

import Image from "next/image";
import Link from "next/link";
import { useBuilder } from "../state/BuilderContext";
import SoundToggle from "@/features/design-system/components/SoundToggle";
import { playSoundEffect, primeSoundEffect } from "@/features/design-system/motion/sound";
import { cx } from "@/features/design-system/utils/cx";
import BuilderJourneyProgress from "./BuilderJourneyProgress";
import styles from "./BuilderNavigation.module.css";

/**
 * O que o botão "Meu Upgrade (n)" faz em cada tela (decidido em `BuilderShell`):
 * - `"panel"`: abre/fecha o painel (escolha, perguntas, serviço adicionado);
 * - `"current"`: a pessoa JÁ está no resumo (a versão completa do Meu Upgrade) — o botão fica marcado
 *   como atual e leva ao topo do resumo;
 * - `"review"`: formulário de contato / erro de envio — leva de volta ao resumo (o mesmo
 *   "Voltar ao projeto" do formulário; os dados digitados continuam salvos);
 * - `"locked"`: enviando — fica visível, mas travado por um instante;
 * - `"hidden"`: projeto já enviado — não há mais o que montar.
 */
export type MyUpgradeButtonMode = "panel" | "current" | "review" | "locked" | "hidden";

interface BuilderNavigationProps {
  onToggleMyUpgrade: () => void;
  myUpgradeMode?: MyUpgradeButtonMode;
  /** "Começar de novo" (Fase 14) — sem destaque alto na UI, de propósito (ver
   * docs/SESSION-PERSISTENCE.md, "Reset manual"). */
  onResetSession: () => void;
}

/**
 * Navegação mínima do Builder (docs/WIREFRAME.md, Seção 21): logo, acesso ao Meu Upgrade.
 * "Voltar"/"Cancelar edição" ficam junto da pergunta (contexto local), não aqui.
 */
export default function BuilderNavigation({ onToggleMyUpgrade, myUpgradeMode = "panel", onResetSession }: BuilderNavigationProps) {
  const { state } = useBuilder();
  const count = Object.keys(state.confirmedServices).length;
  const hasSomethingToReset = count > 0 || state.step !== "choosing_service";

  function handleResetClick() {
    // Destrava o áudio ainda dentro do toque — o confirm nativo consome o gesto no celular.
    primeSoundEffect("reset");
    if (window.confirm("Começar um novo projeto? Isso vai apagar o progresso atual.")) {
      playSoundEffect("reset");
      onResetSession();
    }
  }

  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.logo}>
        {/* Etapa 30 (Performance): dimensões intrínsecas = 2x o tamanho exibido (`.logoMark`,
         * `height: 22px`) — ver o mesmo comentário em `SiteHeader.tsx` para o racional completo. */}
        <Image src="/logo-mark.png" alt="" width={33} height={44} className={styles.logoMark} priority />
        Upgrade
      </Link>
      <div className={styles.center}>
        <BuilderJourneyProgress step={state.step} />
      </div>
      <div className={styles.actions}>
        <SoundToggle className={styles.soundToggle} />
        {hasSomethingToReset && (
          <button type="button" className={styles.resetLink} onClick={handleResetClick}>
            Começar de novo
          </button>
        )}
        {myUpgradeMode !== "hidden" && (
          <button
            type="button"
            className={cx(styles.upgradeToggle, myUpgradeMode === "current" && styles.upgradeToggleCurrent)}
            onClick={onToggleMyUpgrade}
            disabled={myUpgradeMode === "locked"}
            aria-current={myUpgradeMode === "current" ? "page" : undefined}
            title={
              myUpgradeMode === "current"
                ? "Você está no resumo do seu Upgrade"
                : myUpgradeMode === "review"
                  ? "Voltar ao resumo do seu Upgrade"
                  : undefined
            }
          >
            Meu Upgrade {count > 0 ? `(${count})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
