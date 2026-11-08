/**
 * Modelo de dados dos cases de `/projetos` (Etapa "Ver Projetos").
 *
 * Tudo o que a página mostra sai daqui: nenhum texto de case fica escrito dentro de componente.
 * Regra de conteúdo (`docs/DECISIONS.md`, "nunca inventar"): cada item de `screen`/`backstage`
 * corresponde a um recurso CONFERIDO no site ao vivo e/ou no código-fonte do projeto — o registro
 * do que foi conferido e onde está em `docs/PROJECTS-CASES.md`.
 */

export interface ProjectImage {
  /** Caminho público (`/assets/projects/...`), servido pelo `next/image`. */
  src: string;
  width: number;
  height: number;
  /** Descreve o que a captura MOSTRA (não "screenshot do site"). */
  alt: string;
}

export interface ProjectVideoSource {
  src: string;
  /** MIME type (`video/webm`, `video/mp4`) — o navegador escolhe o primeiro que suporta. */
  type: string;
}

/**
 * Demonstração em vídeo (ainda não gravada — ver `docs/CONTENT-TODO.md`, "Vídeos dos cases").
 * Quando existir, basta preencher `ProjectMediaConfig.video`: o pôster continua sendo `desktop`.
 */
export interface ProjectVideo {
  sources: ProjectVideoSource[];
  /** Descrição curta do que o vídeo mostra — vira o nome acessível do player. */
  label: string;
  /**
   * `true`: toca sozinho, sem som e em loop, SÓ enquanto estiver na tela e SÓ se o visitante não
   * pediu movimento reduzido. `false` (padrão): pôster + botão de play; carrega ao clicar.
   */
  autoplay?: boolean;
}

export interface ProjectMediaConfig {
  /** Domínio mostrado na barra de endereço da moldura do navegador. */
  domain: string;
  /** Tela principal (computador). Também é o pôster do vídeo. */
  desktop: ProjectImage;
  /** Tela de celular sobreposta (opcional). */
  mobile?: ProjectImage;
  /**
   * Lado em que o celular sobrepõe a moldura (padrão: direita). Escolha pelo CONTEÚDO da captura:
   * o lado onde o celular não cobre título, botão ou texto importante da tela principal.
   */
  phoneSide?: "left" | "right";
  /** Opcional: quando preenchido, a tela principal vira o vídeo (com `desktop` como pôster). */
  video?: ProjectVideo;
}

/** Um recurso do projeto: nome curto + o que ele faz, em linguagem de cliente. */
export interface ProjectFeature {
  title: string;
  text: string;
}

/** Tecnologia citada + para que ela serve no projeto (nunca só o nome solto). */
export interface ProjectTechnology {
  name: string;
  role: string;
}

export interface ProjectCase {
  /** Também é o `id` da seção (âncora `#sm-design`). */
  slug: string;
  /** "01", "02" — ordem de leitura, não contagem de portfólio. */
  index: string;
  name: string;
  category: string;
  headline: string;
  summary: string;
  /** A necessidade · O que construímos (o negócio em si já está no `summary`). */
  context: { need: string; solution: string };
  /** Front-end: o que o cliente do negócio vê e usa. */
  screen: ProjectFeature[];
  /** Back-end: o que trabalha nos bastidores. */
  backstage: ProjectFeature[];
  technologies: ProjectTechnology[];
  liveUrl: string;
  media: ProjectMediaConfig;
  /** Cor da marca do cliente, usada SÓ no brilho atrás da mídia (o resto é Design System Upgrade). */
  accent: string;
}
