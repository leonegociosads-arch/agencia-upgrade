/**
 * Constantes compartilhadas da logo em partículas — usadas pelo efeito WebGL
 * (`UpgradeLogoParticles.tsx`) e pela prévia estática leve (`UpgradeLogoParticlesStatic.tsx`), para
 * as duas desenharem EXATAMENTE a mesma nuvem (mesma amostragem, mesma quantidade, mesmo
 * enquadramento) e a troca de uma pela outra não "pular". Arquivo sem `three`: importá-lo não
 * puxa o motor 3D para o bundle.
 */

/** Largura da amostragem do PNG da logo (não é a resolução do canvas). Ver `UpgradeLogoParticles`. */
export const SAMPLE_WIDTH = 320;
/** Densidade no desktop (ponteiro fino). */
export const PARTICLE_COUNT_DESKTOP = 6000;
/** Densidade no toque (celular/tablet). */
export const PARTICLE_COUNT_MOBILE = 3200;
/** Folga do enquadramento da câmera ao redor da logo (o "U" ocupa 1/1.25 = 80% da área). */
export const CAMERA_MARGIN = 1.25;
/** Tamanho-base do ponto (px CSS, antes do pixel ratio) e opacidade-base em repouso — os mesmos
 * valores do shader (`shaders/logoParticles.ts`). */
export const BASE_POINT_SIZE = 1.9;
export const BASE_POINT_ALPHA = 0.62;
