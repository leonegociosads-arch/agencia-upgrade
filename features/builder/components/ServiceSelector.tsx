"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { SERVICE_IDS, SERVICES } from "../data/services";
import { useBuilder } from "../state/BuilderContext";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { playSound } from "@/features/design-system/motion/sound";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useFinePointer } from "@/features/design-system/motion/pointerCapability";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { cx } from "@/features/design-system/utils/cx";
import ServiceSelectorBackground from "./ServiceSelectorBackground";
import ServiceSelectorHeader from "./ServiceSelectorHeader";
import ServiceSelectorCard from "./ServiceSelectorCard";
import MobileServiceCarousel from "./MobileServiceCarousel";
import type { ServiceId } from "../types";
import styles from "./ServiceSelector.module.css";

// Mesmo breakpoint das regras `@media (min-width: 900px)` em `ServiceSelector.module.css` e
// `MobileServiceCarousel.module.css`.
const MOBILE_BREAKPOINT_PX = 900;

function subscribeMobileViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getMobileViewportSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT_PX;
}

function getMobileViewportServerSnapshot(): boolean {
  return false;
}

/**
 * Decide entre a fileira estática de desktop e o carrossel circular de mobile. Renderização
 * CONDICIONAL (não as duas ao mesmo tempo com uma escondida por CSS) de propósito: com as duas
 * sempre no DOM, `getByText`/`getByRole` (produção E os ~28 testes de fluxo do Builder) passavam a
 * achar 2 elementos com o mesmo rótulo acessível — jsdom não aplica `display:none` de media query,
 * então essa ambiguidade também existiria de verdade pra qualquer leitor de tela que ignorasse CSS.
 *
 * `window.innerWidth` (não `matchMedia`) de propósito: `vitest.setup.ts` já mocka
 * `window.matchMedia` globalmente para SEMPRE `matches: true` (necessário pro `useReducedMotion`/
 * `useFinePointer` terem um padrão determinístico nos testes) — reusar `matchMedia` aqui faria esta
 * verificação também sempre voltar `true` (mobile) em QUALQUER teste, trocando silenciosamente a
 * árvore de todos os ~630 testes de fluxo do Builder pra este carrossel novo. `innerWidth` lê o
 * valor de verdade (padrão do jsdom é 1024px — desktop), o mesmo padrão já usado em
 * `motionConfig.ts#getSceneDistance`. `getServerSnapshot` fixo em `false` (mesmo padrão de
 * `useFinePointer`/`useReducedMotion`) evita divergência entre o HTML do servidor e a primeira
 * pintura do cliente — em compensação, um celular vê a fileira de desktop por um instante antes de
 * trocar pro carrossel assim que o hook lê a largura real.
 */
function useIsMobileViewport(): boolean {
  return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, getMobileViewportServerSnapshot);
}

export interface ServiceSelectorProps {
  onToggleMyUpgrade: () => void;
  onResetSession: () => void;
}

/**
 * Tela de escolha de serviço (WF-03) — versão cinematográfica ("Escolha o seu Upgrade", pedido do
 * usuário fora da sequência de Etapas numeradas; ver `docs/DECISIONS.md`). Mostra sempre as 3
 * categorias, nunca uma quarta — o link para quem chega indeciso é secundário e sai do Builder
 * (docs/USER-FLOW.md, Seção 12), sem abrir pergunta nenhuma.
 *
 * Nenhuma regra de negócio nova e nenhuma mudança de TIMING da ação real: a decisão entre
 * `startNewService`/`startEditingService`, o evento `service_selected` (só para configuração NOVA)
 * e a ordem de chamadas (som -> `markForward` -> ação) continuam idênticos e SÍNCRONOS, exatamente
 * como antes desta reformulação visual — dezenas de testes de fluxo (`BuilderShell*.test.tsx`,
 * `MyUpgrade.test.tsx`) fazem `fireEvent.click` seguido de asserção imediata (sem `await`), então
 * atrasar esse disparo (ex.: para dar tempo de uma animação local de "seleção" tocar antes) quebraria
 * o contrato síncrono que essas suítes já verificam. A resposta visual ao clique (Seção 11, Fase A)
 * continua real e imediata (`handlePointerDown`, abaixo, ainda GSAP/síncrono); a "Fase C" (avançar
 * para a próxima cena) já é inteiramente coberta pelo crossfade que `SceneTransition` sempre fez.
 */
export default function ServiceSelector({ onToggleMyUpgrade, onResetSession }: ServiceSelectorProps) {
  const { state, startNewService, startEditingService } = useBuilder();
  const { isTransitioning, markForward } = useSceneNavigation();
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const isMobileViewport = useIsMobileViewport();

  const [hoveredId, setHoveredId] = useState<ServiceId | null>(null);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const backgroundParallaxRef = useRef<HTMLDivElement | null>(null);
  const cardsParallaxRef = useRef<HTMLDivElement | null>(null);

  const locked = isTransitioning;
  const configuredCount = Object.keys(state.confirmedServices).length;
  const hasSomethingToReset = configuredCount > 0 || state.step !== "choosing_service";

  // Entrada da cena (Seção 12): sequência curta (header -> eyebrow -> title -> subtitle -> cards)
  // via GSAP, porque precisa ser UMA coreografia coordenada, não transições CSS independentes por
  // elemento. `gsap.context` (mesmo padrão de `SceneTransition.tsx`) escopa as buscas por classe a
  // só dentro desta cena e limpa tudo sozinho ao desmontar/Strict Mode.
  useEffect(() => {
    if (reducedMotion || !sceneRef.current) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      timeline
        .from(`.${styles.entranceHeader}`, { opacity: 0, y: -12, duration: 0.4 })
        .from(`.${styles.entranceEyebrow}`, { opacity: 0, y: 12, duration: 0.35 }, "-=0.15")
        .from(`.${styles.entranceTitle}`, { opacity: 0, y: 18, scale: 0.97, duration: 0.45 }, "-=0.2")
        .from(`.${styles.entranceSubtitle}`, { opacity: 0, y: 10, duration: 0.35 }, "-=0.25")
        .from(`.${styles.entranceCard}`, { opacity: 0, y: 28, scale: 0.94, duration: 0.45, stagger: 0.12 }, "-=0.15");
    }, sceneRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Parallax de mouse (Seção 14, só desktop): duas camadas com intensidades diferentes (fundo quase
  // parado, cards um pouco mais perceptíveis) — a diferença entre planos é o que produz a sensação
  // de profundidade, nunca o deslocamento em si sozinho. Amplitude pequena de propósito ("não
  // prejudicar leitura").
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isFinePointer || reducedMotion) return;

    const quickBgX = gsap.quickTo(backgroundParallaxRef.current, "x", { duration: 0.6, ease: "power2.out" });
    const quickBgY = gsap.quickTo(backgroundParallaxRef.current, "y", { duration: 0.6, ease: "power2.out" });
    const quickCardsX = gsap.quickTo(cardsParallaxRef.current, "x", { duration: 0.45, ease: "power2.out" });
    const quickCardsY = gsap.quickTo(cardsParallaxRef.current, "y", { duration: 0.45, ease: "power2.out" });

    function handleMove(event: PointerEvent) {
      const rect = scene!.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      quickBgX(relativeX * 10);
      quickBgY(relativeY * 6);
      quickCardsX(relativeX * -16);
      quickCardsY(relativeY * -10);
    }

    scene.addEventListener("pointermove", handleMove, { passive: true });
    return () => scene.removeEventListener("pointermove", handleMove);
  }, [isFinePointer, reducedMotion]);

  function handleSelect(serviceId: ServiceId, configured: boolean) {
    if (locked) return;
    playSound("card_select");
    markForward();
    if (configured) {
      startEditingService(serviceId);
      return;
    }
    // `service_selected` (Fase 17): só para uma configuração NOVA — reabrir um serviço já
    // configurado é edição, não "seleção" (docs/ANALYTICS.md, Seção "Eventos").
    trackEvent("service_selected", { serviceId });
    startNewService(serviceId);
  }

  function cardProps(serviceId: ServiceId) {
    const configured = state.confirmedServices[serviceId] !== undefined;
    const active = hoveredId === serviceId;
    const dimmed = hoveredId !== null && hoveredId !== serviceId;
    return {
      serviceId,
      label: SERVICES[serviceId].label,
      configured,
      disabled: locked,
      active,
      dimmed,
      // Guarda contra corrida entre eventos (o `leave` de um card pode chegar depois do `enter` de
      // outro) — só limpa `hoveredId` se ele ainda apontar para ESTE card.
      onHoverChange: (hovered: boolean) =>
        setHoveredId((current) => (hovered ? serviceId : current === serviceId ? null : current)),
      onSelect: () => handleSelect(serviceId, configured),
    };
  }

  return (
    <div ref={sceneRef} className={styles.scene}>
      <ServiceSelectorBackground parallaxRef={backgroundParallaxRef} />

      <div className={styles.entranceHeader}>
        <ServiceSelectorHeader
          configuredCount={configuredCount}
          hasSomethingToReset={hasSomethingToReset}
          onToggleMyUpgrade={onToggleMyUpgrade}
          onResetSession={onResetSession}
        />
      </div>

      <div className={styles.hero}>
        <div className={styles.headingBlock}>
          <p className={cx(styles.eyebrow, styles.entranceEyebrow)}>Escolha o seu</p>
          <h1 className={cx(styles.title, styles.entranceTitle)}>Upgrade.</h1>
          <p className={cx(styles.subtitle, styles.entranceSubtitle)}>
            Selecione um serviço para montarmos a solução ideal para o seu momento.
          </p>
        </div>

        {/* Desktop (≥900px) — fileira estática de sempre, intocada (pedido do usuário: "a versão
         * desktop já está correta e não deve ser alterada"). No mobile quem assume é o carrossel
         * abaixo — só um dos dois é renderizado por vez (ver `useIsMobileViewport` no topo deste
         * arquivo). */}
        {isMobileViewport ? (
          /* Mobile — seletor circular "estilo videogame" (pedido do usuário: cards cortados demais
           * e sem gesto de navegação na fileira estática anterior). Reaproveita o MESMO
           * `cardProps`/`handleSelect` do desktop — nenhuma lógica de seleção duplicada, só a
           * apresentação/interação é diferente. */
          <MobileServiceCarousel
            locked={locked}
            cards={SERVICE_IDS.map((serviceId) => {
              const props = cardProps(serviceId);
              return {
                serviceId,
                label: props.label,
                configured: props.configured,
                disabled: props.disabled,
                onSelect: props.onSelect,
              };
            })}
          />
        ) : (
          <div ref={cardsParallaxRef} className={styles.cardsRow}>
            {SERVICE_IDS.map((serviceId) => (
              <div key={serviceId} className={cx(styles.cardSlot, styles.entranceCard)}>
                <ServiceSelectorCard {...cardProps(serviceId)} />
              </div>
            ))}
          </div>
        )}

        <button type="button" className={styles.secondaryLink} disabled title="Canal de contato — Etapa 9+">
          Não sabe exatamente do que precisa? Fale com a Upgrade
        </button>
      </div>
    </div>
  );
}
