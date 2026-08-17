/**
 * NoScript.tsx — the story without WebGL.
 *
 * If scripting is off, or the device cannot render the scene, the visitor still
 * gets the seven movements as text and can still commission a piece. The 3D is a
 * storytelling layer over a working site, never a gate in front of one.
 */

import { CHAPTERS } from '@/lib/chapters';

export default function NoScript() {
  return (
    <noscript>
      <div className="fallback">
        <p className="fallback__eyebrow">SIRI COUTURE — BHILWARA</p>
        <h1 className="fallback__head">Made by hand. Made for you.</h1>
        <p className="fallback__body">
          A contemporary Indian couture atelier. Every piece is drawn, embroidered and finished by
          hand, and cut to one person&rsquo;s measurements.
        </p>
        <ol className="fallback__list">
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <span>{c.numeral}</span>
              <strong>{c.line}</strong>
              {c.sub && <em>{c.sub}</em>}
            </li>
          ))}
        </ol>
        <p className="fallback__cta">
          To commission a piece, write to the studio and tell us the occasion, the date, and what you
          have in mind.
        </p>
      </div>
    </noscript>
  );
}
