# Quick URL · Liquid-Glass Dashboard

A re-imagining of the **Quick-URL Application** as a single-page productivity
deck built with **React + Vite**. Dark, moody, liquid-glass UI with a living
rain backdrop and four self-contained widgets — no backend, no external UI
libraries, fully static.

## Features

| Widget | What it does |
| --- | --- |
| **Quick URL** | Open any URL **inside the card** via an `<iframe>` (not a new tab). Shows a loading spinner, a Close button, and a graceful fallback (with “open in new tab”) when a site blocks framing. |
| **Time Watch** | Real-time `HH:MM:SS` digital clock with the full date and a pulsing `live` indicator. |
| **Notes** | Auto-saving textarea persisted to `localStorage` on every keystroke; survives reloads. |
| **Focus Mode** | Pomodoro timer with adjustable focus/break durations, Start / Pause / Reset, an SVG progress ring, and a browser notification + on-screen alert when a session ends. |

## Tech stack

- **React 18** (functional components + hooks)
- **Vite 5** (build tool)
- **CSS Modules** for all styling (glassmorphism via `backdrop-filter`, custom animations, responsive grid)
- **localStorage** for persistence (notes + focus durations + last opened URL)
- **Canvas** rain animation (no libraries)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project structure

```
quick-url-application/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                  # dashboard layout + responsive glass grid
    ├── App.module.css
    ├── index.css                # design tokens + global resets
    ├── hooks/
    │   └── useLocalStorage.js   # persist state to localStorage
    └── components/
        ├── RainBackground.jsx       # canvas rain
        ├── QuickUrlWidget.jsx       # in-card iframe browser
        ├── TimeWatch.jsx            # live clock
        ├── NotesWidget.jsx          # auto-saving notes
        └── FocusMode.jsx            # pomodoro timer + ring
```

## Notes on browser behavior

- Some sites send `X-Frame-Options` / `Content-Security-Policy: frame-ancestors`,
  which prevents them from rendering in an iframe. The Quick URL widget detects
  this with a load-timeout heuristic and offers an “Open in new tab” escape hatch.
- Browser notifications require permission; the Focus Mode widget prompts for it
  on first Start and shows an “Enable session alerts” button if denied.
