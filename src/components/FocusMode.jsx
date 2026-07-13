import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './FocusMode.module.css';

const R = 54;
const CIRC = 2 * Math.PI * R;

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function FocusMode() {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [focusMin, setFocusMin] = useLocalStorage('qurl:focusMin', 25);
  const [breakMin, setBreakMin] = useLocalStorage('qurl:breakMin', 5);

  const totalForMode = (mode === 'focus' ? focusMin : breakMin) * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalForMode);
  const [isRunning, setIsRunning] = useState(false);
  const [alert, setAlert] = useState(null); // { title, body, accent }

  const endTimeRef = useRef(0);
  const doneRef = useRef(false);

  const total = totalForMode;
  const fraction = total > 0 ? secondsLeft / total : 0;

  /* ---------- notification helpers ---------- */

  const notifSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notifPerm, setNotifPerm] = useState(
    notifSupported ? Notification.permission : 'unsupported'
  );

  const requestNotif = useCallback(() => {
    if (!notifSupported) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setNotifPerm);
    }
  }, [notifSupported]);

  const fireNotification = useCallback((title, body) => {
    if (!notifSupported || Notification.permission !== 'granted') return;
    try {
      new Notification(title, { body, tag: 'focus-mode', silent: false });
    } catch (err) {
      console.warn('FocusMode: notification failed', err);
    }
  }, [notifSupported]);

  /* ---------- completion ---------- */

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    const finished = mode;
    const next = finished === 'focus' ? 'break' : 'focus';
    const nextTotal = (next === 'focus' ? focusMin : breakMin) * 60;

    setMode(next);
    setSecondsLeft(nextTotal);

    const title =
      finished === 'focus' ? 'Focus session complete 🎉' : 'Break over — back to focus';
    const body =
      finished === 'focus'
        ? 'Nice work. Time for a short break.'
        : 'Break finished. Start your next focus block.';

    fireNotification(title, body);
    setAlert({ title, body, accent: finished === 'focus' ? 'break' : 'focus' });
  }, [mode, focusMin, breakMin, fireNotification]);

  /* ---------- ticking loop ---------- */

  useEffect(() => {
    if (!isRunning) return;
    doneRef.current = false;
    endTimeRef.current = Date.now() + secondsLeft * 1000;

    const id = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        handleComplete();
      }
    }, 250);

    return () => clearInterval(id);
    // handleComplete is stable for the duration of a run (mode/durations don't
    // change while running), so it's safe to depend on it here.
  }, [isRunning, secondsLeft, handleComplete]);

  /* ---------- controls ---------- */

  const start = () => {
    if (secondsLeft <= 0) return;
    requestNotif();
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft((mode === 'focus' ? focusMin : breakMin) * 60);
    setAlert(null);
  };

  const changeDuration = (which, value) => {
    const clamped = Math.min(120, Math.max(1, Math.round(value) || 1));
    if (which === 'focus') setFocusMin(clamped);
    else setBreakMin(clamped);
    // only re-seed the countdown when idle, for the active mode
    if (!isRunning) {
      setSecondsLeft(
        which === mode ? clamped * 60 : secondsLeft
      );
    }
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <section className={styles.card} aria-label="Focus mode timer">
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <TimerIcon />
          <h2 className={styles.title}>Focus Mode</h2>
        </div>
        <div className={styles.modeToggle} role="tablist" aria-label="Session type">
          <button
            className={`${styles.modeBtn} ${mode === 'focus' ? styles.modeActive : ''}`}
            onClick={() => {
              if (isRunning) return;
              setMode('focus');
              setSecondsLeft(focusMin * 60);
            }}
            disabled={isRunning}
            role="tab"
            aria-selected={mode === 'focus'}
          >
            Focus
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'break' ? styles.modeActive : ''}`}
            onClick={() => {
              if (isRunning) return;
              setMode('break');
              setSecondsLeft(breakMin * 60);
            }}
            disabled={isRunning}
            role="tab"
            aria-selected={mode === 'break'}
          >
            Break
          </button>
        </div>
      </header>

      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 140 140" aria-hidden="true">
          <circle
            className={styles.ringTrack}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            strokeWidth="10"
          />
          <circle
            className={`${styles.ringProg} ${
              mode === 'focus' ? styles.ringFocus : styles.ringBreak
            }`}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - fraction)}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className={styles.time}>
          <span className={styles.timeText}>
            {pad(mm)}:{pad(ss)}
          </span>
          <span className={styles.timeLabel}>
            {mode === 'focus' ? 'Focusing' : 'On break'}
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        {!isRunning ? (
          <button className={styles.primaryBtn} onClick={start} disabled={secondsLeft <= 0}>
            Start
          </button>
        ) : (
          <button className={styles.primaryBtn} onClick={pause}>
            Pause
          </button>
        )}
        <button className={styles.secondaryBtn} onClick={reset}>
          Reset
        </button>
      </div>

      <div className={styles.durations}>
        <DurationField
          label="Focus"
          value={focusMin}
          onChange={(v) => changeDuration('focus', v)}
          disabled={isRunning}
        />
        <DurationField
          label="Break"
          value={breakMin}
          onChange={(v) => changeDuration('break', v)}
          disabled={isRunning}
        />
      </div>

      {notifSupported && notifPerm !== 'granted' && (
        <button className={styles.notifHint} onClick={requestNotif}>
          <BellIcon />
          Enable session alerts
        </button>
      )}

      {alert && (
        <div
          className={`${styles.alert} ${
            alert.accent === 'focus' ? styles.alertFocus : styles.alertBreak
          }`}
          role="alert"
        >
          <div className={styles.alertText}>
            <strong>{alert.title}</strong>
            <span>{alert.body}</span>
          </div>
          <button className={styles.alertClose} onClick={() => setAlert(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </section>
  );
}

function DurationField({ label, value, onChange, disabled }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.stepper}>
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={disabled || value <= 1}
          aria-label={`Decrease ${label} minutes`}
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="120"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} minutes`}
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={disabled || value >= 120}
          aria-label={`Increase ${label} minutes`}
        >
          +
        </button>
      </div>
    </label>
  );
}

/* ---------- icons ---------- */

function TimerIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v4l2.5 1.5M9 2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
