"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cx } from "@/features/design-system/utils/cx";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { useInViewport } from "@/features/design-system/webgl/useInViewport";
import type { ProjectImage, ProjectMediaConfig, ProjectVideo } from "../types";
import styles from "./ProjectMedia.module.css";

export interface ProjectMediaProps {
  media: ProjectMediaConfig;
  /** Nome do projeto: entra no nome acessível do player e do botão de play. */
  projectName: string;
  /** Cor da marca do cliente, só para o brilho atrás da moldura. */
  accent: string;
  /** `sizes` da tela principal (a coluna da mídia muda de largura por breakpoint). */
  sizes?: string;
  className?: string;
}

/**
 * Área de mídia de um case (Etapa "Ver Projetos"): moldura de navegador com a tela real do site e,
 * por cima, a mesma experiência no celular. É a peça definitiva do layout, não um placeholder: hoje
 * mostra capturas reais; amanhã, o vídeo de navegação — trocando SÓ os dados (`media.video`).
 *
 * Por que uma moldura desenhada em CSS e não um mockup em imagem: escala com o layout, não pesa
 * nada, respeita o Design System (raio, borda, superfície) e funciona igual para imagem ou vídeo.
 */
export default function ProjectMedia({
  media,
  projectName,
  accent,
  sizes = "100vw",
  className,
}: ProjectMediaProps) {
  return (
    <figure
      className={cx(styles.stage, media.phoneSide === "left" && styles.phoneLeft, className)}
      style={{ "--project-accent": accent } as CSSProperties}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.browser}>
        <div className={styles.browserBar} aria-hidden="true">
          <span className={styles.dots}>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.address}>{media.domain}</span>
        </div>
        <div className={styles.screen}>
          {media.video ? (
            <ScreenVideo video={media.video} poster={media.desktop} projectName={projectName} sizes={sizes} />
          ) : (
            <Image
              src={media.desktop.src}
              width={media.desktop.width}
              height={media.desktop.height}
              alt={media.desktop.alt}
              sizes={sizes}
              className={styles.screenImage}
            />
          )}
        </div>
      </div>
      {media.mobile && (
        <div className={styles.phone}>
          <Image
            src={media.mobile.src}
            width={media.mobile.width}
            height={media.mobile.height}
            alt={media.mobile.alt}
            sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, 112px"
            className={styles.phoneImage}
          />
        </div>
      )}
      <figcaption className={styles.caption}>
        {media.video ? "Demonstração de navegação" : "Telas reais do site no ar"}
      </figcaption>
    </figure>
  );
}

interface ScreenVideoProps {
  video: ProjectVideo;
  poster: ProjectImage;
  projectName: string;
  sizes: string;
}

/**
 * Vídeo sob demanda. O pôster (otimizado pelo `next/image`) aparece sempre primeiro; o arquivo de
 * vídeo só é pedido à rede quando:
 *  - `autoplay` está ligado, o visitante NÃO pediu movimento reduzido e a mídia chegou perto da
 *    tela (`useInViewport`, 200px de antecedência); ou
 *  - o visitante tocou no play.
 * Fora da tela, o vídeo pausa (nenhum decode rodando à toa) e volta a tocar ao reaparecer — a não
 * ser que a PESSOA tenha pausado (pelos controles ou pelo botão de pausa do autoplay): pausa dela
 * é respeitada. Em movimento reduzido nunca há autoplay: fica o pôster com o botão de play, e o
 * vídeo só roda se a pessoa pedir.
 *
 * Não há `load()` manual: o `<video>` já é montado com as `<source>` dentro, e a inserção delas
 * dispara sozinha a escolha do arquivo. Um `load()` extra só reiniciaria esse carregamento.
 */
function ScreenVideo({ video, poster, projectName, sizes }: ScreenVideoProps) {
  const reducedMotion = useReducedMotion();
  const [containerRef, nearViewport] = useInViewport<HTMLDivElement>("200px");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activated, setActivated] = useState(false);
  // `playing`: já há quadro na tela (esconde o pôster). `paused`: espelho de `el.paused` (rótulo do
  // botão de pausa). `userPaused`: a pessoa pausou — o retorno à tela não volta a tocar sozinho.
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  // Pausa feita pelo próprio componente (saiu da tela etc.), para o `onPause` não tomá-la como da pessoa.
  const pausingByCode = useRef(false);

  const autoplay = Boolean(video.autoplay) && !reducedMotion;
  // Depois de montado, o `<video>` fica montado: sair da tela só pausa (desmontar descartaria o
  // que já foi baixado e faria o arquivo ser pedido de novo a cada volta).
  const [loaded, setLoaded] = useState(false);
  if (!loaded && (activated || (autoplay && nearViewport))) setLoaded(true);
  const shouldLoad = loaded || activated || (autoplay && nearViewport);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;
    if (nearViewport && !userPaused && (activated || autoplay)) {
      // `?.`: implementações antigas (e o jsdom) não devolvem Promise.
      el.play()?.catch(() => {
        // Navegador recusou tocar (economia de dados, autoplay bloqueado): fica o pôster.
      });
    } else if (!el.paused) {
      pausingByCode.current = true;
      el.pause();
    }
  }, [shouldLoad, nearViewport, userPaused, activated, autoplay]);

  // O botão de play some ao ser usado: o foco vai para o player (com controles), não para o `body`.
  useEffect(() => {
    if (activated) videoRef.current?.focus();
  }, [activated]);

  function handlePause() {
    setPlaying(false);
    setPaused(true);
    if (pausingByCode.current) {
      pausingByCode.current = false;
    } else {
      setUserPaused(true);
    }
  }

  function handlePlay() {
    setPaused(false);
    setUserPaused(false);
  }

  // Autoplay roda sem controles nativos; este botão é o jeito de parar (WCAG 2.2.2) e retomar.
  function toggleAutoplay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()?.catch(() => {});
    } else {
      el.pause();
    }
  }

  return (
    <div ref={containerRef} className={styles.videoWrap}>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={poster.alt}
        sizes={sizes}
        className={cx(styles.screenImage, playing && styles.posterHidden)}
      />
      {shouldLoad && (
        <video
          ref={videoRef}
          className={styles.video}
          muted={!activated}
          loop={!activated}
          playsInline
          preload="metadata"
          controls={activated}
          tabIndex={activated ? -1 : undefined}
          aria-label={`${video.label} (${projectName})`}
          onPlay={handlePlay}
          onPlaying={() => setPlaying(true)}
          onPause={handlePause}
        >
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      )}
      {!activated && !autoplay && (
        <button
          type="button"
          className={styles.play}
          aria-label={`Ver demonstração de ${projectName}`}
          onClick={() => setActivated(true)}
        >
          <span className={styles.playIcon} aria-hidden="true" />
          Ver demonstração
        </button>
      )}
      {!activated && autoplay && shouldLoad && (
        <button
          type="button"
          className={styles.autoplayToggle}
          aria-label={`${paused ? "Tocar" : "Pausar"} demonstração de ${projectName}`}
          onClick={toggleAutoplay}
        >
          <span className={paused ? styles.playIcon : styles.pauseIcon} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
