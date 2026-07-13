import { useState, useEffect } from 'react';
import styles from './TimeWatch.module.css';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function TimeWatch() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Used by the pulsing separator dots
  const seconds = now.getSeconds();

  return (
    <section className={styles.card} aria-label="Time watch">
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <span className={styles.label}>Time Watch</span>
        <span className={styles.live} aria-hidden="true">
          <span className={styles.liveDot} />
          live
        </span>
      </header>

      <div className={styles.clock} role="timer" aria-live="off">
        {time.split('').map((ch, i) =>
          ch === ':' ? (
            <span
              key={i}
              className={`${styles.sep} ${seconds % 2 === 0 ? styles.sepOn : ''}`}
            >
              :
            </span>
          ) : (
            <span key={i} className={styles.digit}>
              {ch}
            </span>
          )
        )}
      </div>

      <div className={styles.date}>{date}</div>
    </section>
  );
}
