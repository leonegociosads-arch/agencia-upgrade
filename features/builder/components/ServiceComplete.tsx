"use client";

import { useEffect } from "react";
import { buildServiceSummary } from "../logic/buildServiceSummary";
import { SERVICES } from "../data/services";
import { useBuilder } from "../state/BuilderContext";
import Heading from "@/features/design-system/components/Heading";
import Button from "@/features/design-system/components/Button";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { playSound } from "@/features/design-system/motion/sound";
import type { ServiceId } from "../types";
import styles from "./ServiceComplete.module.css";

interface ServiceCompleteProps {
  serviceId: ServiceId;
}

/**
 * Tela de conclusão de um serviço NOVO (WF-05). Os dois CTAs desta tela sempre levaram exatamente
 * ao mesmo lugar (`goToEntry()`, a tela de categorias) — isso nunca mudou. O texto do botão
 * principal, porém, mudou na Etapa 32 (Testes de UX): era "Ver Meu Upgrade / Finalizar", uma
 * promessa dupla que nunca se cumpria ali (nada era "finalizado" só com este clique; era preciso
 * achar sozinho o botão "Meu Upgrade" da navegação depois). Uma primeira correção fez este botão
 * abrir o drawer "Meu Upgrade" de verdade — descartada ao rodar a suíte E2E completa: o mesmo botão
 * é o caminho padrão para "voltar e configurar outro serviço" (Cenário 2 do
 * `docs/USER-FLOW.md` — Site + Tráfego, por exemplo), e abrir o drawer automaticamente aqui deixava
 * o painel cobrindo a tela de categorias bem no momento em que a pessoa mais provavelmente quer
 * clicar num cartão por baixo dele — pior para quem configura vários serviços (Perfil C,
 * `docs/UX-TESTS.md`) do que o problema original. Correção final: só o texto, "Continuar" — sem
 * prometer nada que o clique não cumpre, e sem nenhuma mudança de comportamento. Ver
 * `docs/UX-FRICTION-MAP.md` para o achado completo e `docs/DECISIONS.md` para o registro da
 * tentativa descartada.
 */
export default function ServiceComplete({ serviceId }: ServiceCompleteProps) {
  const { state, goToEntry } = useBuilder();
  const { markForward } = useSceneNavigation();
  const item = state.confirmedServices[serviceId];
  const summary = item ? buildServiceSummary(serviceId, item.answers) : [];

  useEffect(() => {
    // Toca ao CHEGAR nesta cena (o momento real da conclusão), não ao sair dela — briefing da
    // Fase GSAP e Transições, Seção 44 ("service_complete").
    playSound("service_complete");
  }, []);

  function handleContinue() {
    markForward();
    goToEntry();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.check} aria-hidden="true">
        ✓
      </div>
      <Heading variant="h2" as="h2" className={styles.title}>
        {SERVICES[serviceId].label} adicionado ao seu Upgrade
      </Heading>

      <div className={styles.summary}>
        {summary.map((entry) => (
          <div key={entry.question} className={styles.summaryItem}>
            <span className={styles.summaryQuestion}>{entry.question}</span>
            <span className={styles.summaryAnswer}>{entry.answer}</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button fullWidth onClick={handleContinue}>
          Continuar
        </Button>
        <Button variant="secondary" fullWidth onClick={handleContinue}>
          Adicionar outro serviço
        </Button>
      </div>
    </div>
  );
}
