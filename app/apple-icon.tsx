import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícone de tela inicial do iOS (`<link rel="apple-touch-icon">`) — mesmo raciocínio de
 * `app/icon.tsx`, tamanho padrão recomendado pela Apple (180×180). */
export default async function AppleIcon() {
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
        <img src={logoSrc} width={130} height={171} alt="" />
      </div>
    ),
    { ...size },
  );
}
