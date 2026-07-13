import { useState } from 'react';
import RainBackground from './components/RainBackground';
import Sidebar from './components/Sidebar';
import UrlShelf from './components/UrlShelf';
import TimeWatch from './components/TimeWatch';
import NotesWidget from './components/NotesWidget';
import FocusMode from './components/FocusMode';
import styles from './App.module.css';

const WIDGETS = [
  { id: 'urls', node: <UrlShelf /> },
  { id: 'time', node: <TimeWatch /> },
  { id: 'focus', node: <FocusMode /> },
  { id: 'notes', node: <NotesWidget /> },
];

export default function App() {
  // Clicking a nav item highlights (and dims the rest of) that widget.
  const [focused, setFocused] = useState(null);
  const toggleFocus = (id) => setFocused((prev) => (prev === id ? null : id));

  return (
    <div className={styles.app}>
      <RainBackground />

      <Sidebar active={focused} onNavigate={toggleFocus} />

      <main className={styles.shell}>
        <div className={styles.grid}>
          {WIDGETS.map(({ id, node }) => (
            <div
              key={id}
              id={`widget-${id}`}
              className={`${styles.tile} ${
                focused === id ? styles.focused : focused ? styles.dimmed : ''
              }`}
            >
              {node}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
