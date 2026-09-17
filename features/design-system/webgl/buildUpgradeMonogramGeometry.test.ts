import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  buildUpgradeMonogramGroup,
  createUpgradeMonogramMaterials,
  disposeUpgradeMonogramGroup,
} from "./buildUpgradeMonogramGeometry";

describe("buildUpgradeMonogramGroup (Fase 3D/WebGL, Seção 6 — geometria procedural do monograma)", () => {
  it("monta um grupo com as duas lâminas e a cunha de sombra", () => {
    const group = buildUpgradeMonogramGroup();
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children).toHaveLength(3);

    const names = group.children.map((child) => child.name);
    expect(names).toContain("upgradeMonogram_bladeLeft");
    expect(names).toContain("upgradeMonogram_bladeRight");
    expect(names).toContain("upgradeMonogram_shadowWedge");
  });

  it("usa as cores de marca (prateado à esquerda, verde à direita — nunca arco-íris/RGB genérico)", () => {
    const materials = createUpgradeMonogramMaterials();
    expect(materials.green.color.getHexString()).toBe("2db958");
    expect(materials.silver.color.getHexString()).not.toBe(materials.green.color.getHexString());
    expect(materials.shadow.color.getHexString()).not.toBe(materials.silver.color.getHexString());
  });

  it("cada lâmina usa a metade correspondente das cores de marca", () => {
    const materials = createUpgradeMonogramMaterials();
    const group = buildUpgradeMonogramGroup(materials);
    const left = group.getObjectByName("upgradeMonogram_bladeLeft") as THREE.Mesh;
    const right = group.getObjectByName("upgradeMonogram_bladeRight") as THREE.Mesh;
    expect(left.material).toBe(materials.silver);
    expect(right.material).toBe(materials.green);
  });

  it("todas as geometrias têm volume (nunca uma forma degenerada/vazia)", () => {
    const group = buildUpgradeMonogramGroup();
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        expect(size.x).toBeGreaterThan(0);
        expect(size.y).toBeGreaterThan(0);
      }
    });
  });

  it("disposeUpgradeMonogramGroup libera geometrias e materiais sem lançar", () => {
    const materials = createUpgradeMonogramMaterials();
    const group = buildUpgradeMonogramGroup(materials);
    expect(() => disposeUpgradeMonogramGroup(group, materials)).not.toThrow();
  });
});
