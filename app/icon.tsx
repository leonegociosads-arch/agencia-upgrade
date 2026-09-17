import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon gerado a partir do logo-mark oficial (Fase SEO, Seção 72 do briefing: "garantir favicon
 * correto"). O `app/favicon.ico` anterior era o ícone padrão do `create-next-app`, nunca trocado —
 * substituído por este arquivo (convenção `icon.tsx` do Next.js, geração via código com
 * `ImageResponse`/`next/og`, ver `docs/SEO.md`). Reaproveita o PNG real da marca
 * (`public/logo-mark.png`) — nenhum novo asset, nenhuma reinterpretação livre do símbolo (ao
 * contrário do monograma 3D da Fase 3D/WebGL, que é decorativo; aqui a marca real precisa aparecer
 * tal como é).
 */
export default async function Icon() {
  const logo = await readFile(join(process.cwd(), "public", "logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- `next/og`/Satori exige um <img> real, `next/image` não funciona aqui. */}
        <img src={logoSrc} width={22} height={29} alt="" />
      </div>
    ),
    { ...size },
  );
}
