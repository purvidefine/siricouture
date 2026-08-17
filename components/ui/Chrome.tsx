'use client';

/**
 * Chrome.tsx — wordmark, sound, and a sense of where you are.
 *
 * The progress indicator is a row of seven short rules rather than a bar, so it
 * reads as chapters in a piece of work rather than a loading state. Sound is off
 * until asked for, and says what it is when it is off.
 */

import { useEffect, useState } from 'react';
import { CHAPTERS } from '@/lib/chapters';
import { isEnabled, setEnabled } from '@/lib/audio';

interface ChromeProps {
  progress: number;
  chapter: number;
}

export default function Chrome({ progress, chapter }: ChromeProps) {
  const [sound, setSound] = useState(false);

  useEffect(() => setSound(isEnabled()), []);

  const toggle = () => {
    const next = !sound;
    setEnabled(next);
    setSound(next);
  };

  const started = progress > 0.012;

  return (
    <>
      <header className="chrome chrome--top">
        <a className="chrome__mark" href="#top">
          SIRI COUTURE
        </a>
        <button
          type="button"
          className={`chrome__sound ${sound ? 'is-on' : ''}`}
          onClick={toggle}
          aria-pressed={sound}
        >
          <span className="chrome__soundBars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {sound ? 'SOUND ON' : 'SOUND OFF'}
        </button>
      </header>

      <nav className="chrome chrome--rail" aria-label="Chapter">
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id} className={i === chapter ? 'is-current' : i < chapter ? 'is-past' : ''}>
              <span className="chrome__railNum">{c.numeral}</span>
              <span className="chrome__railRule" />
            </li>
          ))}
        </ol>
      </nav>

      <div className={`chrome__hint ${started ? 'is-hidden' : ''}`}>
        <span>SCROLL</span>
        <i />
      </div>
    </>
  );
}
