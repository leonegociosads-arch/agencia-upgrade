"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useHeroScrollMotion } from "../../motion/useHeroScrollMotion";
import { useMagneticHover } from "@/features/design-system/motion/useMagneticHover";
import styles from "./HeroSection.module.css";

// Client-only + code-split (Fase 3D/WebGL, Seções 43/44/21 do briefing: "WebGL só no client";
// "Home comum carrega primeiro, 3D depois") — `three` nunca entra no bundle inicial da Home.
// `.heroGraphicFallback` (abaixo) mantém um fundo simples atrás da área das partículas o tempo
// todo: se este import falhar, demorar, ou `hasWebGL()` recusar dentro do próprio componente, o
// fallback já shipado continua exatamente igual (Seção 31: "fallback é obrigatório").
//
// Pedido do usuário (fora da sequência de Etapas numeradas): troca do monograma sólido
// (`UpgradeLogo3D`, mantido no repositório mas não usado aqui) pela logo oficial recomposta como
// campo de partículas com magnetismo ao cursor — ver `docs/DECISIONS.md` para o registro completo.
// Pedido do usuário, rodada seguinte: o recorte diagonal decorativo que antes vivia atrás das
// partículas (`.heroGraphicFallback`) virou um elemento próprio (`.heroAccentGraphic`), deslocado
// para a esquerda — a área atrás das partículas ficou só um fundo limpo/escuro, sem o recorte.
const UpgradeLogoParticles = dynamic(() => import("@/features/design-system/webgl/UpgradeLogoParticles"), { ssr: false });

/**
 * Hero da Home (Fase 19, `docs/UI-FINAL.md`) — conteúdo idêntico ao de antes da Fase ScrollTrigger
 * e Storytelling; o que muda nesta fase é só o motion (`useHeroScrollMotion`), nunca a copy. Fase
 * Microinterações adiciona o efeito magnético no CTA principal (briefing Seção 7/8 — só no CTA
 * mais importante da página, nunca no link secundário "Ver projetos").
 *
 * Fase 3D/WebGL: o grafismo decorativo (`.heroGraphic`) ganha o monograma "U" em 3D
 * (`UpgradeLogo3D`) por cima do gradiente CSS que já existia. A interação-surpresa que vivia aqui
 * (`useAvoidCursor`, Fase Microinterações — "afastar-se do cursor") foi retirada deste elemento: a
 * peça 3D agora tem sua própria reação (bem mais sutil) ao cursor, e as duas não fazem sentido no
 * mesmo objeto ao mesmo tempo — ver `docs/DECISIONS.md`.
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useHeroScrollMotion(sectionRef);
  const ctaRef = useMagneticHover<HTMLAnchorElement>();

  // Etapa 30 (Performance, Seções 9/46 do briefing): adia a inicialização do WebGL para depois do
  // navegador ter uma folga no main thread, em vez de competir com hidratação/GSAP/Lenis pelo
  // mesmo frame. No COMPUTADOR (ponteiro fino) continua exatamente assim: `requestIdleCallback` com
  // `timeout` de 1,5 s (ou `setTimeout` onde não existe, ex. Safari) — comportamento aprovado.
  //
  // No TOQUE (celular/tablet — Fase 3 da auditoria de 09/11/2026): o motor 3D (~480 KB) montava em até
  // 1,5 s mesmo com o aparelho ainda ocupado, e era o maior trabalho de processador da Home no celular.
  // Agora a logo em partículas aparece desde o primeiro quadro como PRÉVIA ESTÁTICA: uma imagem leve
  // (~26 KB) da MESMA nuvem em repouso, gerada uma vez por `scripts/generate-logo-particles-preview.mjs`
  // e servida só pela CSS (`.heroStaticPreview`, nenhum JavaScript). O efeito interativo só monta no
  // primeiro gesto (toque, rolagem, roda do mouse ou tecla), que é justamente quando ele passa a ter
  // função. Mesma caixa, sem pulo de layout; a prévia só some quando o primeiro quadro WebGL já está na
  // tela.
  const pointerKind = usePointerKind();
  const [webglReady, setWebglReady] = useState(false);
  const [liveVisible, setLiveVisible] = useState(false);
  useEffect(() => {
    if (pointerKind === "unknown") return;
    if (pointerKind === "fine") {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(() => setWebglReady(true), { timeout: 1500 });
        return () => window.cancelIdleCallback(id);
      }
      const id = window.setTimeout(() => setWebglReady(true), 200);
      return () => window.clearTimeout(id);
    }

    const events = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
    const start = () => {
      events.forEach((name) => window.removeEventListener(name, start));
      setWebglReady(true);
    };
    events.forEach((name) => window.addEventListener(name, start, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, start));
  }, [pointerKind]);

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.hero}>
      {/* Copy (registro em `docs/CONTENT-TODO.md`): antes "Estúdio digital de performance" — o nome
          do site é "Agência Upgrade" e "performance" promete resultado mensurável sem prova. */}
      <Badge tone="accent" className={styles.badge}>
        Agência digital
      </Badge>
      <Heading variant="display" className={styles.heroTitle}>
        Um upgrade real na presença digital da sua empresa.
      </Heading>
      {/* A headline é a frase de posicionamento da marca e foi mantida; quem responde "o que faz,
          para quem e o que posso fazer aqui" é este subtítulo (antes: "Sites, tráfego pago e design
          trabalhando juntos — com um processo claro do primeiro clique ao projeto entregue."). */}
      <Text size="lg" color="secondary" className={styles.heroSubtitle}>
        Sites, tráfego pago, design e social media para a sua empresa. Escolha o que precisa,
        responda poucas perguntas e monte o seu Upgrade.
      </Text>
      <div className={styles.heroActions}>
        <LinkButton ref={ctaRef} href="/builder" size="lg">
          Monte seu Upgrade
        </LinkButton>
        <LinkButton href="/projetos" variant="ghost" size="lg">
          Ver projetos
        </LinkButton>
      </div>
      <p className={styles.heroNote}>Poucas perguntas · você revisa tudo antes de enviar</p>
      <div className={styles.heroAccentGraphic} aria-hidden="true" />
      <div className={styles.heroGraphic} aria-hidden="true">
        <div className={styles.heroGraphicFallback} />
        {/* Só aparece em telas de toque (CSS); some quando o efeito vivo já desenhou o 1º quadro. */}
        <div className={styles.heroStaticPreview} data-hidden={liveVisible || undefined} />
        {webglReady && <UpgradeLogoParticles onReady={() => setLiveVisible(true)} />}
      </div>
    </SectionContainer>
  );
}

// Mesmo critério de `useFinePointer` (que também decide a densidade de partículas do efeito WebGL),
// mas com um terceiro estado: no servidor e na hidratação ainda não se sabe o tipo de ponteiro, e nada
// é montado até saber — assim o computador nunca desenha a prévia do celular, nem por um instante.
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
type PointerKind = "unknown" | "fine" | "coarse";

function subscribePointerKind(onChange: () => void) {
  const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function usePointerKind(): PointerKind {
  return useSyncExternalStore<PointerKind>(
    subscribePointerKind,
    () => (window.matchMedia(FINE_POINTER_QUERY).matches ? "fine" : "coarse"),
    () => "unknown",
  );
}
