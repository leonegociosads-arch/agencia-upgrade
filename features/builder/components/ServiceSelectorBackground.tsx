import Image from "next/image";
import type { Ref } from "react";
import styles from "./ServiceSelectorBackground.module.css";

interface ServiceSelectorBackgroundProps {
  /** Camada que recebe o parallax de mouse (Seção 14) — aplicado pelo pai (`ServiceSelector.tsx`)
   * via GSAP `quickTo`, nunca aqui: este componente só monta a cena, não decide se/como ela reage
   * ao cursor (mesma separação de responsabilidade do resto do Builder). */
  parallaxRef?: Ref<HTMLDivElement>;
}

/**
 * Cenário espacial da tela "Escolha o seu Upgrade" (WF-03, Seção 3 do briefing: "background
 * espacial/planetário SEM interface"), ocupando a viewport inteira atrás do header/título/cards.
 * `aria-hidden`: puramente decorativo, o `<h1>` real da cena já carrega o conteúdo textual.
 *
 * O arquivo original fornecido pelo usuário (`background.png`) veio com uma interface de EXEMPLO
 * "queimada" nos próprios pixels (logo, "ETAPA 1/4", barra de progresso, "MENU") — visivelmente uma
 * composição de referência do mockup inteiro, não um fundo isolado. Achado no teste visual: com o
 * header real desta tela por cima, aparecia um segundo "ETAPA 1/4" fantasma atrás do de verdade.
 * Recortada (`sharp`, script descartável) a faixa superior (~11.5% da altura) que continha essa UI
 * de exemplo — o resto da imagem (todo o cenário espacial em si) não foi tocado, só reenquadrado
 * (nenhum pixel da composição real foi redesenhado/alterado, só removida a faixa com texto/ícones).
 */
export default function ServiceSelectorBackground({ parallaxRef }: ServiceSelectorBackgroundProps) {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      {/* Duas camadas de transform separadas de propósito (mesma razão do card, ver
       * `ServiceSelectorCard.module.css`): a de fora recebe o parallax de mouse via JS
       * (`parallaxRef`), a de dentro roda a deriva ambiental contínua via CSS — nunca as duas
       * disputando a mesma propriedade no mesmo elemento. */}
      <div ref={parallaxRef} className={styles.parallaxLayer}>
        <div className={styles.imageWrapper}>
          <Image
            src="/builder/service-select/background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.image}
          />
        </div>
      </div>
      <div className={styles.veil} />
    </div>
  );
}
