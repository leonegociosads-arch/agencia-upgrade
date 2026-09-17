import type { LeadNote } from "@/lib/repositories/leadNotes";
import { formatDateTime } from "../logic/formatDate";
import styles from "./NotesList.module.css";

/** `{note.content}` via JSX — nunca `dangerouslySetInnerHTML` (`docs/ADMIN-CRM.md`, "Segurança"):
 * o texto da nota é sempre tratado como texto puro, nunca como HTML. */
export default function NotesList({ notes }: { notes: LeadNote[] }) {
  if (notes.length === 0) {
    return <p className={styles.empty}>Nenhuma observação ainda.</p>;
  }

  return (
    <ul className={styles.list}>
      {notes.map((note) => (
        <li key={note.id} className={styles.item}>
          <p className={styles.content}>{note.content}</p>
          <span className={styles.meta}>{formatDateTime(note.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
