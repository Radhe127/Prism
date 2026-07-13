import styles from './Sidebar.module.css';

export const NAV_ITEMS = [
  { id: 'urls', label: 'Quick URL', Icon: LinkIcon },
  { id: 'time', label: 'Time Watch', Icon: ClockIcon },
  { id: 'focus', label: 'Focus Mode', Icon: TimerIcon },
  { id: 'notes', label: 'Notes', Icon: NoteIcon },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true" />
        <div className={styles.brandText}>
          <span className={styles.brandName}>Quick&nbsp;URL</span>
          <span className={styles.brandTag}>glass deck</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navBar} aria-hidden="true" />
              <Icon />
              <span className={styles.navLabel}>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ---------- inline icons ---------- */

function LinkIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M10 14a4 4 0 0 0 5.66 0l3-3A4 4 0 0 0 13 4.34l-1.5 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 10a4 4 0 0 0-5.66 0l-3 3A4 4 0 0 0 11 19.66l1.5-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v4l2.5 1.5M9 2h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
