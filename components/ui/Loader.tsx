'use client';

/**
 * Loader.tsx — the first few seconds.
 *
 * Textures here are generated rather than downloaded, so the wait is CPU time on
 * the visitor's own machine. It is short, but it is not nothing, and a blank
 * black screen would read as broken. So: the wordmark, and a single hairline that
 * fills — no spinner, no percentage, nothing that draws attention to loading.
 */

import { useEffect, useState } from 'react';

export default function Loader({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    // hold a beat after first paint so the fabric is actually there when we lift
    const t = window.setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div className={`loader ${gone ? 'is-gone' : ''}`} aria-hidden={gone}>
      <div className="loader__mark">
        <span className="loader__name">SIRI COUTURE</span>
        <span className="loader__place">BHILWARA</span>
      </div>
      <div className="loader__rule">
        <i className={ready ? 'is-full' : ''} />
      </div>
    </div>
  );
}
