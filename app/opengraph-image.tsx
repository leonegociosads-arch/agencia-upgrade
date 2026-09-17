import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/siteConfig";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE_NAME;

/**
 * Imagem de compartilhamento padrão do site (Fase SEO, Seções 19/20 do briefing: "criar ou
 * utilizar imagem oficial da Upgrade... evitar imagem cortada ou com texto pequeno"). Gerada via
 * `ImageResponse`/`next/og` a partir do logo real + a mesma descrição já usada em
 * `app/layout.tsx`/`HeroSection.tsx` (nunca um texto novo inventado só para esta imagem) — mesmo
 * raciocínio de `app/icon.tsx`: sem nenhum arquivo de imagem novo para versionar, sempre em sincronia
 * com a marca/copy reais.
 *
 * Páginas específicas podem sobrescrever isso com seu próprio `opengraph-image` mais à frente
 * (nenhuma nesta fase precisa: `/projetos`/`/privacidade` são institucionais simples, e
 * `/builder`/`/admin` são `noindex` — não faz sentido investir numa imagem de compartilhamento
 * própria para eles agora).
 */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#000000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- `next/og`/Satori exige um <img> real, `next/image` não funciona aqui. */}
        <img src={logoSrc} width={132} height={174} alt="" />
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#fbfbfb" }}>{SITE_NAME}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#a6b0bb", maxWidth: 820, textAlign: "center" }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size },
  );
}
