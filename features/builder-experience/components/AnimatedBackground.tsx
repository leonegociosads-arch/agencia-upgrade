import styles from "./AnimatedBackground.module.css";

/**
 * Camada de fundo persistente da Prova de Conceito (briefing "Fundo": "deve parecer contínuo e
 * infinito... movimento MUITO lento... deve continuar existindo como uma camada persistente"
 * durante a transição de cena). Montada UMA única vez pelo componente-pai (`BuilderExperiencePoc`),
 * fora da árvore que o `DeckTransition` remonta a cada troca de cena — nunca reinicia.
 *
 * 100% CSS (`@keyframes`, só `transform`) — já respeita `prefers-reduced-motion` pela regra
 * global de `styles/tokens.css` (zera qualquer `animation-duration` do projeto inteiro), sem
 * precisar de nenhuma lógica de JS aqui.
 */
export default function AnimatedBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.grid} />
      <div className={styles.glowPrimary} />
      <div className={styles.glowSecondary} />
      <div className={styles.vignette} />
    </div>
  );
}
