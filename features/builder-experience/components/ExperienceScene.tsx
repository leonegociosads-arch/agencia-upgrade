import type { ReactNode } from "react";
import Badge from "@/features/design-system/components/Badge";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import styles from "./ExperienceScene.module.css";

export interface ExperienceSceneProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Layout compartilhado das 3 cenas da Prova de Conceito — título + descrição curta + corpo (cards
 * ou ação). Cada cena (`ServicePickerScene`/`QuestionPreviewScene`/`CompletionScene`) só define o
 * conteúdo do corpo; a moldura é sempre esta, para a transição entre cenas parecer uma sequência
 * coerente de slides, não telas desenhadas cada uma do seu jeito.
 */
export default function ExperienceScene({ eyebrow, title, description, children }: ExperienceSceneProps) {
  return (
    <div className={styles.scene}>
      {eyebrow && <Badge tone="accent">{eyebrow}</Badge>}
      <Heading variant="display" as="h1" className={styles.title}>
        {title}
      </Heading>
      {description && (
        <Text size="lg" color="secondary" className={styles.description}>
          {description}
        </Text>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
