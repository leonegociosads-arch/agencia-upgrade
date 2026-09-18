"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LinkButton from "@/features/design-system/components/LinkButton";
import SoundToggle from "@/features/design-system/components/SoundToggle";
import { useMagneticHover } from "@/features/design-system/motion/useMagneticHover";
import { useScrolled } from "@/features/design-system/motion/useScrolled";
import { useScrollLock } from "@/features/design-system/motion/useScrollLock";
import { cx } from "@/features/design-system/utils/cx";
import styles from "./SiteHeader.module.css";

/**
 * Cabeçalho das páginas institucionais (Fase 19) — navegação completa, como pedido pelo briefing
 * ("Home pode possuir navegação completa"). O Builder continua com `BuilderNavigation.tsx`
 * (navegação reduzida, propositalmente um componente à parte — Seção 27 do briefing pede menos
 * distração ali) e o admin com a própria barra em `app/admin/(protected)/layout.tsx`; nenhum dos
 * dois foi substituído por este componente.
 *
 * Menu mobile (Seção 25: "criar UI mobile de verdade, não apenas reduzir desktop") — sem ele, os
 * links de navegação simplesmente desapareciam abaixo de 768px, sem nenhuma forma de alcançá-los
 * a não ser rolar até o footer. `"use client"` só por causa deste estado local de aberto/fechado.
 *
 * Só linka para rotas que realmente existem hoje (`/`, `/projetos`) — nunca um item de menu morto
 * (ex.: "Sobre", que não tem página própria ainda).
 */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const ctaRef = useMagneticHover<HTMLAnchorElement>();
  // Menu mobile é um dropdown sobre o conteúdo (Seção 29 do briefing: "menu aberto não pode
  // deixar página rolando atrás") — sem isso, um scroll por trás dele continuava rolando a Home.
  useScrollLock(menuOpen);

  return (
    <header className={cx(styles.header, scrolled && styles.headerScrolled)}>
      <Link href="/" className={styles.logo}>
        {/* Etapa 30 (Performance): dimensões intrínsecas = 2x o tamanho real exibido (`.logoMark`,
         * `height: 26px`), não o tamanho do arquivo-fonte (556×731, usado só pelas rotas de geração
         * de ícone/OG em `app/icon.tsx`/`app/apple-icon.tsx`/`app/opengraph-image.tsx`). Sem isto,
         * `next/image` monta um `srcSet` pedindo até 1200px de largura para um logo que nunca é
         * exibido com mais de ~20px — o otimizador do Next não amplia além da fonte, então o
         * resultado real era sempre servir o PNG original inteiro (~31KB) por carregamento de
         * página. Com 40×52, o maior candidato do `srcSet` (2x) cai para ~1,5KB. */}
        <Image src="/logo-mark.png" alt="" width={40} height={52} className={styles.logoMark} priority />
        Upgrade
      </Link>

      <nav className={styles.nav} aria-label="Navegação principal">
        <Link href="/" className={styles.navLink}>
          Início
        </Link>
        <Link href="/projetos" className={styles.navLink}>
          Projetos
        </Link>
      </nav>

      <div className={styles.actions}>
        <SoundToggle className={styles.soundToggle} />

        <LinkButton ref={ctaRef} href="/builder" size="sm" className={styles.cta}>
          Monte seu Upgrade
        </LinkButton>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={cx(styles.menuIcon, menuOpen && styles.menuIconOpen)} aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <nav id="site-mobile-menu" className={styles.mobileMenu} aria-label="Navegação principal (mobile)">
          <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link href="/projetos" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Projetos
          </Link>
          <Link href="/privacidade" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Privacidade
          </Link>
          <div className={styles.mobileSoundRow}>
            <span>Som da interface</span>
            <SoundToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
