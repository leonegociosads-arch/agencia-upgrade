import * as THREE from "three";

/**
 * Construção procedural do monograma "U" da Upgrade em 3D (Fase 3D/WebGL, Seção 6 do briefing:
 * "se for necessário modelo, preferir geometria simples... evitar modelos enormes"). Nenhum
 * arquivo `.glb`/`.gltf` existe no projeto (nenhuma ferramenta de modelagem 3D disponível nesta
 * sessão) — a saída responsável, na mesma linha da síntese de som via Web Audio na Fase
 * Microinterações, é construir a peça via geometria pura do Three.js (`THREE.Shape` extrudado),
 * gerada em tempo real, sem nenhum asset externo para pesar o bundle ou precisar de licença.
 *
 * Interpretação livre (não uma reprodução literal do PNG) das duas lâminas curvas que se encontram
 * na base — a metade esquerda prateada e a direita verde, com uma cunha grafite/petróleo entre
 * elas (identidade de marca, `upgrade-brand-identity`) — o suficiente para ler como uma assinatura
 * em 3D sem tentar recriar pixel a pixel um logotipo 2D desenhado à mão.
 */

const BLADE_WIDTH = 1;
const BLADE_HEIGHT = 2.6;

function createBladeShape(mirrored: boolean): THREE.Shape {
  const sign = mirrored ? -1 : 1;
  const w = (BLADE_WIDTH / 2) * sign;
  const h = BLADE_HEIGHT;

  const shape = new THREE.Shape();
  // Topo com corte diagonal (ecoa o corte diagonal do grafismo 2D do Hero/CTA final).
  shape.moveTo(-w, h * 0.5);
  shape.lineTo(w, h * 0.41);
  // Lateral externa descendo até a ponta arredondada da base.
  shape.bezierCurveTo(w * 1.05, h * 0.05, w * 0.55, h * -0.175, 0, h * -0.25);
  // Lateral interna voltando para o topo, fechando a "lâmina".
  shape.bezierCurveTo(-w * 0.55, h * -0.175, -w * 1.05, h * 0.05, -w, h * 0.5);
  return shape;
}

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 0.32,
  bevelEnabled: true,
  bevelThickness: 0.045,
  bevelSize: 0.035,
  bevelSegments: 3,
  curveSegments: 24,
};

function createBladeGeometry(mirrored: boolean): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(createBladeShape(mirrored), EXTRUDE_SETTINGS);
  geometry.center();
  return geometry;
}

export interface UpgradeMonogramMaterials {
  silver: THREE.MeshStandardMaterial;
  green: THREE.MeshStandardMaterial;
  shadow: THREE.MeshStandardMaterial;
}

export function createUpgradeMonogramMaterials(): UpgradeMonogramMaterials {
  return {
    // Metade prateada/branca (`upgrade-brand-identity`: "gradiente branco/prateado").
    silver: new THREE.MeshStandardMaterial({ color: 0xd7dee3, metalness: 0.62, roughness: 0.3 }),
    // Metade verde da marca (`--ds-color-accent`, `#2db958`).
    green: new THREE.MeshStandardMaterial({ color: 0x2db958, metalness: 0.42, roughness: 0.34 }),
    // Cunha grafite/petróleo escura no encontro das duas metades (a "sombra" descrita na
    // identidade de marca) — mais escura que `--ds-color-surface-elevated` para se destacar do
    // fundo preto do site sem virar um terceiro tom que compita com branco/verde.
    shadow: new THREE.MeshStandardMaterial({ color: 0x142028, metalness: 0.15, roughness: 0.75 }),
  };
}

/**
 * Grupo pronto para adicionar à cena — duas lâminas espelhadas (prateada à esquerda, verde à
 * direita, como no logo real) mais uma cunha decorativa na base. Função pura (sem `renderer`/
 * `scene`), testável sem um contexto WebGL de verdade — só constrói geometria/materiais/transforms.
 */
export function buildUpgradeMonogramGroup(materials = createUpgradeMonogramMaterials()): THREE.Group {
  const group = new THREE.Group();

  const leftBlade = new THREE.Mesh(createBladeGeometry(false), materials.silver);
  leftBlade.position.set(-0.5, 0.12, 0.05);
  leftBlade.rotation.z = 0.16;
  leftBlade.name = "upgradeMonogram_bladeLeft";

  const rightBlade = new THREE.Mesh(createBladeGeometry(true), materials.green);
  rightBlade.position.set(0.5, -0.08, -0.05);
  rightBlade.rotation.z = -0.16;
  rightBlade.name = "upgradeMonogram_bladeRight";

  const wedgeGeometry = new THREE.CircleGeometry(0.34, 3, Math.PI * 0.62, Math.PI * 0.78);
  const wedge = new THREE.Mesh(wedgeGeometry, materials.shadow);
  wedge.position.set(0, -0.62, -0.02);
  wedge.rotation.x = -0.15;
  wedge.name = "upgradeMonogram_shadowWedge";

  group.add(leftBlade, rightBlade, wedge);
  group.name = "upgradeMonogramGroup";
  return group;
}

export function disposeUpgradeMonogramGroup(group: THREE.Group, materials: UpgradeMonogramMaterials): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) child.geometry.dispose();
  });
  materials.silver.dispose();
  materials.green.dispose();
  materials.shadow.dispose();
}
