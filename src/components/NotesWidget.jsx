import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './NotesWidget.module.css';

export default function NotesWidget() {
  const [notes, setNotes] = useLocalStorage('qurl:notes', '');

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <section className={styles.card} aria-label="Notes">
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <NoteIcon />
          <h2 className={styles.title}>Notes</h2>
        </div>
        <span className={styles.saved}>
          <span className={styles.savedDot} />
          Auto-saved
        </span>
      </header>

      <textarea
        className={styles.textarea}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down anything… it stays here, on this device."
        spellCheck
        aria-label="Notes editor"
      />

      <footer className={styles.footer}>
        <span>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span className={styles.sep}>·</span>
        <span>{charCount} chars</span>
      </footer>
    </section>
  );
}

function NoteIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M15 4v4h4M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
