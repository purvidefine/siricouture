/**
 * motifs.ts — the handwork, drawn.
 *
 * The brief is "authentic handwork everywhere". Rather than decorating the site
 * with generic Indian ornament, every rule, divider and flourish here is a real
 * embroidery structure generated as SVG: running stitch, back stitch, a satin-
 * filled buti, a gota scallop, a shisha ring, a floral vine.
 *
 * Two rules make these read as handwork rather than clip-art:
 *
 *   1. Stitches are drawn as *individual segments*, not as a dashed line. A
 *      dash pattern repeats perfectly; a hand does not.
 *   2. Every length, gap and position carries a small seeded wobble, so no two
 *      stitches match — but the same seed always draws the same motif, so the
 *      page does not shimmer between renders.
 *
 * These come from the techniques actually visible in the studio's work: fine
 * thread embroidery, mirror work, sequin-and-zari scalloped borders, and floral
 * appliqué on organza.
 */

/** Deterministic PRNG so a given motif is identical on every render. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * A run of individual stitches along a horizontal line.
 * Used for section rules — the site's most repeated handwork element.
 */
export function runningStitch(
  width: number,
  opts: { y?: number; stitch?: number; gap?: number; seed?: number } = {}
): string {
  const y = opts.y ?? 0;
  const stitch = opts.stitch ?? 9;
  const gap = opts.gap ?? 6;
  const r = rng(opts.seed ?? 7);

  let d = '';
  let x = 0;
  while (x < width) {
    // each stitch a little longer or shorter than its neighbour
    const len = stitch * (0.78 + r() * 0.44);
    const drift = (r() - 0.5) * 1.1; // the line wanders off true
    const tilt = (r() - 0.5) * 0.9;
    const x2 = Math.min(width, x + len);
    d += `M${round(x)} ${round(y + drift)} L${round(x2)} ${round(y + drift + tilt)} `;
    x = x2 + gap * (0.8 + r() * 0.5);
  }
  return d.trim();
}

/**
 * Back stitch along an arbitrary polyline — an unbroken worked line, where each
 * stitch shares an endpoint with the last. Used for the buti stem and outlines.
 */
function backStitch(points: [number, number][], spacing: number, seed: number): string {
  const r = rng(seed);
  let d = '';
  let carried = 0;
  let prev = points[0];

  for (let i = 1; i < points.length; i++) {
    const cur = points[i];
    const seg = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    carried += seg;
    if (carried >= spacing * (0.85 + r() * 0.3)) {
      const w = (r() - 0.5) * 0.8;
      d += `M${round(prev[0])} ${round(prev[1] + w * 0.5)} L${round(cur[0])} ${round(cur[1] + w)} `;
      carried = 0;
      prev = cur;
    }
  }
  return d.trim();
}

/** Catmull-Rom sampling, for petals and leaves that curve like drawn ones. */
function curve(pts: [number, number][], segments: number): [number, number][] {
  const out: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < segments; i++) {
    const t = (i / (segments - 1)) * (n - 1);
    const i0 = Math.floor(t);
    const f = t - i0;
    const p0 = pts[Math.max(0, i0 - 1)];
    const p1 = pts[i0];
    const p2 = pts[Math.min(n - 1, i0 + 1)];
    const p3 = pts[Math.min(n - 1, i0 + 2)];
    const f2 = f * f;
    const f3 = f2 * f;
    const at = (a: number, b: number, c: number, e: number) =>
      0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - e) * f2 + (-a + 3 * b - 3 * c + e) * f3);
    out.push([at(p0[0], p1[0], p2[0], p3[0]), at(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

/**
 * Satin fill: parallel stitches laid across a closed lobe, which is how a leaf
 * or a petal is actually filled. Scan lines are cast across the shape and
 * clipped to it, exactly as the 3D version did.
 */
function satinFill(
  outline: [number, number][],
  angleDeg: number,
  density: number,
  seed: number
): string {
  const r = rng(seed);
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;

  let lo = Infinity;
  let hi = -Infinity;
  for (const p of outline) {
    const proj = p[0] * px + p[1] * py;
    if (proj < lo) lo = proj;
    if (proj > hi) hi = proj;
  }

  let d = '';
  const lines = Math.max(3, Math.round((hi - lo) / density));
  for (let i = 0; i <= lines; i++) {
    const off = lo + ((hi - lo) * i) / lines + (r() - 0.5) * density * 0.3;
    const hits: number[] = [];
    for (let j = 0; j < outline.length - 1; j++) {
      const p1 = outline[j];
      const p2 = outline[j + 1];
      const a1 = p1[0] * px + p1[1] * py;
      const a2 = p2[0] * px + p2[1] * py;
      if ((a1 - off) * (a2 - off) <= 0 && a1 !== a2) {
        const f = (off - a1) / (a2 - a1);
        const hx = p1[0] + (p2[0] - p1[0]) * f;
        const hy = p1[1] + (p2[1] - p1[1]) * f;
        hits.push(hx * dx + hy * dy);
      }
    }
    if (hits.length < 2) continue;
    hits.sort((m, n) => m - n);
    // the hand overshoots the drawn edge, unevenly
    const s = hits[0] + (r() - 0.5) * 1.2;
    const e = hits[hits.length - 1] + (r() - 0.5) * 1.2;
    if (e - s < 1) continue;
    d += `M${round(dx * s + px * off)} ${round(dy * s + py * off)} L${round(dx * e + px * off)} ${round(dy * e + py * off)} `;
  }
  return d.trim();
}

export interface Buti {
  stem: string;
  leaves: string;
  petals: string;
  centre: { cx: number; cy: number; r: number }[];
  viewBox: string;
}

/**
 * The buti — a small floral sprig, the backbone of Rajasthani hand embroidery
 * and the honest motif for a Bhilwara studio. One stem, two leaves, five petals,
 * a knotted centre. Deliberately not a mandala, paisley, peacock or border.
 */
export function buti(seed = 3): Buti {
  const S = 100;
  const cx = 50;

  const stemPts = curve(
    [
      [cx - 1, 96],
      [cx + 1, 74],
      [cx + 4, 54],
      [cx + 1, 38],
    ],
    48
  );

  const leafL = curve(
    [
      [cx, 72],
      [cx - 15, 68],
      [cx - 23, 58],
      [cx - 19, 49],
      [cx - 8, 53],
      [cx - 1, 63],
      [cx, 72],
    ],
    56
  );

  const leafR = curve(
    [
      [cx + 3, 60],
      [cx + 17, 57],
      [cx + 25, 48],
      [cx + 21, 39],
      [cx + 10, 43],
      [cx + 3, 52],
      [cx + 3, 60],
    ],
    56
  );

  // five petals, unevenly spaced and unevenly long — a hand drew this
  const angles = [96, 158, 222, 288, 32];
  const lengths = [21, 19, 20, 18, 20];
  const fcx = cx + 1;
  const fcy = 30;

  let petals = '';
  angles.forEach((ang, i) => {
    const a = (ang * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = -Math.sin(a);
    const nx = -dy;
    const ny = dx;
    const L = lengths[i];
    const w = 6.4;
    const outline = curve(
      [
        [fcx, fcy],
        [fcx + dx * L * 0.55 + nx * w, fcy + dy * L * 0.55 + ny * w],
        [fcx + dx * L, fcy + dy * L],
        [fcx + dx * L * 0.55 - nx * w, fcy + dy * L * 0.55 - ny * w],
        [fcx, fcy],
      ],
      44
    );
    // worked across the petal's own axis, so the sheen runs petal-wise
    petals += satinFill(outline, ang + 90, 2.5, seed + i * 17) + ' ';
  });

  const r = rng(seed + 900);
  const centre = Array.from({ length: 7 }, () => {
    const a = r() * Math.PI * 2;
    const rad = 1.6 + r() * 2.6;
    return {
      cx: round(fcx + Math.cos(a) * rad),
      cy: round(fcy + Math.sin(a) * rad),
      r: round(0.9 + r() * 0.7),
    };
  });

  return {
    stem: backStitch(stemPts, 5.5, seed + 1),
    leaves: `${satinFill(leafL, 118, 2.8, seed + 40)} ${satinFill(leafR, 62, 2.8, seed + 60)}`,
    petals: petals.trim(),
    centre,
    viewBox: `0 0 ${S} ${S}`,
  };
}

/**
 * A gota / zari scalloped border — the sequinned scallop running along the hem
 * of the citrine lehenga in the studio's own work. Returns the scallop outline
 * plus the anchor stitches that hold it down.
 */
export function scallopBorder(
  width: number,
  opts: { height?: number; scallops?: number; seed?: number } = {}
): { arc: string; anchors: { cx: number; cy: number; r: number }[] } {
  const h = opts.height ?? 30;
  const n = opts.scallops ?? Math.max(3, Math.round(width / 62));
  const r = rng(opts.seed ?? 11);
  const step = width / n;

  let arc = `M0 2 `;
  const anchors: { cx: number; cy: number; r: number }[] = [];

  for (let i = 0; i < n; i++) {
    const x0 = i * step;
    const x1 = (i + 1) * step;
    // each scallop a touch deeper or shallower than the last
    const depth = h * (0.82 + r() * 0.32);
    const mid = (x0 + x1) / 2 + (r() - 0.5) * step * 0.08;
    arc += `Q${round(mid)} ${round(depth)} ${round(x1)} 2 `;
    anchors.push({ cx: round(mid), cy: round(depth * 0.62), r: round(1.5 + r() * 0.9) });
  }

  return { arc: arc.trim(), anchors };
}

/**
 * Shisha (mirror) work — a mirror held to the cloth by a ring of anchor
 * stitches radiating outward. Visible on the citrine and violet pieces.
 */
export function shisha(
  radius = 12,
  opts: { spokes?: number; seed?: number } = {}
): { ring: string; spokes: string } {
  const n = opts.spokes ?? 16;
  const r = rng(opts.seed ?? 21);
  let spokes = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.06;
    const inner = radius * (0.92 + r() * 0.08);
    const outer = radius * (1.22 + r() * 0.2);
    spokes += `M${round(Math.cos(a) * inner)} ${round(Math.sin(a) * inner)} L${round(Math.cos(a) * outer)} ${round(Math.sin(a) * outer)} `;
  }
  return { ring: `M${radius} 0 A${radius} ${radius} 0 1 1 ${-radius} 0 A${radius} ${radius} 0 1 1 ${radius} 0`, spokes: spokes.trim() };
}

/**
 * A running floral vine, for long horizontal dividers. Stem in back stitch with
 * small buds alternating along it — the simplest border a hand actually works.
 */
export function vine(
  width: number,
  opts: { amplitude?: number; seed?: number } = {}
): { stem: string; buds: { cx: number; cy: number; r: number }[]; leaves: string } {
  const amp = opts.amplitude ?? 7;
  const r = rng(opts.seed ?? 31);
  const pts: [number, number][] = [];
  const steps = Math.max(24, Math.round(width / 6));

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = 14 + Math.sin((x / width) * Math.PI * 6) * amp + (r() - 0.5) * 0.7;
    pts.push([x, y]);
  }

  const buds: { cx: number; cy: number; r: number }[] = [];
  const leaves: string[] = [];
  const count = Math.max(3, Math.round(width / 78));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const idx = Math.round(t * steps);
    const [bx, by] = pts[idx];
    const up = i % 2 === 0 ? -1 : 1;
    buds.push({ cx: round(bx), cy: round(by + up * 6.5), r: round(2 + r() * 1.2) });
    const lf = curve(
      [
        [bx, by],
        [bx + 6, by + up * 3],
        [bx + 10, by + up * 8],
        [bx + 4, by + up * 7],
        [bx, by],
      ],
      28
    );
    leaves.push(satinFill(lf, up > 0 ? 55 : 125, 2.2, 200 + i * 13));
  }

  return { stem: backStitch(pts, 5, 77), buds, leaves: leaves.join(' ') };
}
