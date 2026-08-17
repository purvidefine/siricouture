/**
 * Motif.tsx — the handwork, as components.
 *
 * These are the pieces that put craft "everywhere" on the site without ever
 * decorating with generic ornament. A rule between two sections is a run of
 * hand-worked stitches. A collection marker is a buti. A hem accent is a gota
 * scallop. All of it is generated, none of it is stock.
 */

import { buti, runningStitch, scallopBorder, shisha, vine } from '@/lib/motifs';

interface RuleProps {
  width?: number;
  className?: string;
  colour?: string;
  seed?: number;
}

/** A hand-worked hairline. The site's default divider. */
export function StitchRule({ width = 1200, className = '', colour, seed = 7 }: RuleProps) {
  return (
    <svg
      className={`motif motif--rule ${className}`}
      viewBox={`0 -4 ${width} 8`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={runningStitch(width, { seed })}
        stroke={colour ?? 'currentColor'}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** The floral sprig. Used as a section marker and a collection bullet. */
export function Buti({
  size = 68,
  seed = 3,
  className = '',
  showCentre = true,
}: {
  size?: number;
  seed?: number;
  className?: string;
  showCentre?: boolean;
}) {
  const m = buti(seed);
  return (
    <svg
      className={`motif motif--buti ${className}`}
      viewBox={m.viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" strokeLinecap="round">
        <path d={m.stem} stroke="var(--motif-stem)" strokeWidth={1.6} />
        <path d={m.leaves} stroke="var(--motif-leaf)" strokeWidth={1.5} />
        <path d={m.petals} stroke="var(--motif-petal)" strokeWidth={1.5} />
      </g>
      {showCentre &&
        m.centre.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="var(--motif-centre)" />
        ))}
    </svg>
  );
}

/** A gota / sequin scalloped hem. Sits under headings and hero blocks. */
export function Scallop({
  width = 640,
  height = 34,
  seed = 11,
  className = '',
}: {
  width?: number;
  height?: number;
  seed?: number;
  className?: string;
}) {
  const { arc, anchors } = scallopBorder(width, { height: height - 4, seed });
  return (
    <svg
      className={`motif motif--scallop ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={arc} fill="none" stroke="var(--motif-zari)" strokeWidth={1.3} />
      {anchors.map((a, i) => (
        <circle key={i} cx={a.cx} cy={a.cy} r={a.r} fill="var(--motif-zari)" opacity={0.85} />
      ))}
    </svg>
  );
}

/** A single mirror, held by its ring of anchor stitches. */
export function Shisha({
  size = 44,
  seed = 21,
  className = '',
}: {
  size?: number;
  seed?: number;
  className?: string;
}) {
  const r = size * 0.3;
  const { ring, spokes } = shisha(r, { seed });
  return (
    <svg
      className={`motif motif--shisha ${className}`}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ring} fill="var(--motif-mirror)" stroke="var(--motif-zari)" strokeWidth={1} />
      <path d={spokes} stroke="var(--motif-stem)" strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A running floral vine, for wide dividers between major sections. */
export function Vine({
  width = 900,
  className = '',
  seed = 31,
}: {
  width?: number;
  className?: string;
  seed?: number;
}) {
  const v = vine(width, { seed });
  return (
    <svg
      className={`motif motif--vine ${className}`}
      viewBox={`0 0 ${width} 30`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" strokeLinecap="round">
        <path d={v.stem} stroke="var(--motif-stem)" strokeWidth={1.4} />
        <path d={v.leaves} stroke="var(--motif-leaf)" strokeWidth={1.3} />
      </g>
      {v.buds.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="var(--motif-petal)" />
      ))}
    </svg>
  );
}
