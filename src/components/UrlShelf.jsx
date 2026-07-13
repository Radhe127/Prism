import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './UrlShelf.module.css';

const PRESETS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'YouTube', url: 'https://youtube.com' },
  { label: 'Wikipedia', url: 'https://wikipedia.org' },
  { label: 'GMail', url: 'https://mail.google.com' },
];

const AVATAR_COLORS = [
  ['#22d3ee', '#3b82f6'],
  ['#a855f7', '#ec4899'],
  ['#34d399', '#22d3ee'],
  ['#f59e0b', '#ec4899'],
  ['#6366f1', '#22d3ee'],
  ['#ec4899', '#a855f7'],
];

// If the user types a bare host (no protocol) treat it as https.
function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return 'https://' + value;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function labelFromUrl(url) {
  const host = hostnameOf(url);
  const base = host.split('.')[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function initialsFor(url) {
  const host = hostnameOf(url);
  const parts = host.split('.');
  const core = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  return (core[0] || '?').toUpperCase();
}

function colorFor(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function UrlShelf() {
  const [links, setLinks] = useLocalStorage('qurl:links', []);
  const [urlInput, setUrlInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  const addLink = (rawUrl, rawLabel) => {
    const url = normalizeUrl(rawUrl);
    if (!url) return;
    const label = (rawLabel || '').trim() || labelFromUrl(url);
    setLinks((prev) => {
      if (prev.some((l) => l.url === url)) return prev; // dedupe
      return [{ id: makeId(), label, url, addedAt: Date.now() }, ...prev];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addLink(urlInput, labelInput);
    setUrlInput('');
    setLabelInput('');
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <section className={styles.card} aria-label="Saved URLs">
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <LinkIcon />
          <h2 className={styles.title}>Quick URL</h2>
        </div>
        <span className={styles.count}>
          {links.length} {links.length === 1 ? 'link' : 'links'}
        </span>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          inputMode="url"
          placeholder="Paste a URL — saved forever…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          aria-label="URL to save"
        />
        <input
          className={styles.labelInput}
          type="text"
          placeholder="Label (optional)"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          aria-label="Label for the URL"
        />
        <button className={styles.addBtn} type="submit" disabled={!urlInput.trim()}>
          Add
        </button>
      </form>

      <div className={styles.chips}>
        {PRESETS.map((p) => (
          <button
            key={p.url}
            className={styles.chip}
            onClick={() => addLink(p.url, p.label)}
            disabled={links.some((l) => l.url === normalizeUrl(p.url))}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {links.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyMark} aria-hidden="true" />
            <p>No links yet. Add one above or tap a preset — it stays on this device.</p>
          </div>
        ) : (
          links.map((link) => {
            const [c1, c2] = colorFor(link.url);
            return (
              <div className={styles.row} key={link.id}>
                <a
                  className={styles.rowLink}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open ${link.label} in a new tab`}
                >
                  <span
                    className={styles.avatar}
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    aria-hidden="true"
                  >
                    {initialsFor(link.url)}
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowLabel}>{link.label}</span>
                    <span className={styles.rowHost}>{hostnameOf(link.url)}</span>
                  </span>
                  <span className={styles.openTag} aria-hidden="true">
                    Open ↗
                  </span>
                </a>
                <button
                  className={styles.delBtn}
                  onClick={() => removeLink(link.id)}
                  aria-label={`Remove ${link.label}`}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function LinkIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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
