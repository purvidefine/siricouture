'use client';

/**
 * Overlay.tsx — the words.
 *
 * Seven statements, one per movement, set quietly at the lower left. The copy
 * never explains the technology and never narrates what the visitor can already
 * see; it names the thing being shown and then gets out of the way.
 */

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '@/lib/chapters';

interface OverlayProps {
  chapter: number;
  progress: number;
}

export default function Overlay({ chapter, progress }: OverlayProps) {
  const [shown, setShown] = useState(chapter);
  const [visible, setVisible] = useState(true);
  const timers = useRef<number[]>([]);

  // cross-fade rather than cut: out, swap, back in
  useEffect(() => {
    if (chapter === shown) return;
    setVisible(false);
    const t1 = window.setTimeout(() => {
      setShown(chapter);
      setVisible(true);
    }, 420);
    timers.current.push(t1);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [chapter, shown]);

  const c = CHAPTERS[Math.min(CHAPTERS.length - 1, Math.max(0, shown))];

  // the copy steps aside for the final reveal so the garment holds the frame
  const dimmed = progress > 0.93;

  return (
    <div className={`overlay ${visible && !dimmed ? 'is-visible' : ''}`}>
      <div className="overlay__inner">
        <span className="overlay__numeral">{c.numeral}</span>
        <h2 className="overlay__line">{c.line}</h2>
        {c.sub && <p className="overlay__sub">{c.sub}</p>}
      </div>
    </div>
  );
}
