/**
 * craft.ts — the embroidery "brain".
 *
 * Everything here exists to make the handwork physically believable. A stitch is
 * never drawn as decoration: it is generated as a needle entry point, a needle
 * exit point, a length of thread under tension, and the small error a human hand
 * makes when repeating the same motion four hundred times.
 *
 * Nothing in here is symmetrical by accident. The irregularity is seeded so the
 * motif is identical on every load (a garment does not re-stitch itself between
 * visits) while never being machine-perfect.
 */

/**
 * World scale.
 *
 * Read 1 world unit as roughly 20cm. The sample panel is 0.66 units (~13cm, a
 * hoop-sized swatch) and the buti occupies 0.22 units (~4.4cm), which is the
 * real proportion of a motif to the ground it sits on. Motif coordinates run
 * -1..1 and are multiplied by MOTIF_SCALE on their way into world space.
 *
 * Thread gauge and stitch raise are NOT scaled by this — they are already
 * authored in world units, because floss thickness is an absolute property of
 * the thread, not a function of how big the motif is.
 */
export const MOTIF_SCALE = 0.34;

/** Deterministic PRNG (mulberry32). Same seed -> same hand. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Vec2 = [number, number];

/** A single stitch as the artisan actually makes it. */
export interface Stitch {
  /** Where the needle goes down through the cloth. */
  entry: Vec2;
  /** Where the needle comes back up. */
  exit: Vec2;
  /** Order in which this stitch is made — drives the scroll reveal. */
  index: number;
  /** 0..1 — how hard the thread was pulled. Affects raise + fabric pucker. */
  tension: number;
  /** How far the thread sits above the cloth, in world units. */
  raise: number;
  /** Thread radius; hand-spun thread is not one gauge. */
  gauge: number;
  /** Which technique made it — drives material choice. */
  kind: StitchKind;
  /** Slight roll of the thread on its own axis. */
  twist: number;
}

export type StitchKind = 'outline' | 'fill' | 'seed' | 'metal';

/**
 * The motif.
 *
 * This is a *buti* — the small repeating floral sprig that is the backbone of
 * Rajasthani hand embroidery, and the honest choice for a Bhilwara atelier. It is
 * deliberately NOT a mandala, a paisley, a peacock or a border. It is one sprig:
 * a stem, two leaves, a five-petal flower and a scatter of seed stitches, which
 * is what an artisan would actually lay down on a panel.
 *
 * Coordinates are in fabric space, roughly -1..1, y up.
 */

/** Cubic-sampled polyline through control points, for smooth organic runs. */
function sampleCurve(pts: Vec2[], segments: number): Vec2[] {
  const out: Vec2[] = [];
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
    const x =
      0.5 *
      (2 * p1[0] +
        (-p0[0] + p2[0]) * f +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * f2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * f3);
    const y =
      0.5 *
      (2 * p1[1] +
        (-p0[1] + p2[1]) * f +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * f2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * f3);
    out.push([x, y]);
  }
  return out;
}

/** The stem: a single curving line, worked in back stitch from the base upward. */
const STEM: Vec2[] = [
  [-0.02, -0.86],
  [0.0, -0.55],
  [0.05, -0.28],
  [0.02, -0.04],
];

/** Two leaves, each a closed lobe filled with slanted satin stitch. */
const LEAF_LEFT: Vec2[] = [
  [0.0, -0.52],
  [-0.2, -0.46],
  [-0.31, -0.32],
  [-0.26, -0.19],
  [-0.11, -0.24],
  [-0.01, -0.4],
];

const LEAF_RIGHT: Vec2[] = [
  [0.04, -0.34],
  [0.22, -0.31],
  [0.33, -0.18],
  [0.27, -0.05],
  [0.12, -0.11],
  [0.04, -0.25],
];

/** Five petals radiating from the flower head. Not evenly spaced — a hand drew this. */
const PETAL_ANGLES = [96, 158, 222, 288, 32];
const PETAL_LENGTHS = [0.3, 0.27, 0.29, 0.26, 0.28];
const FLOWER_CENTER: Vec2 = [0.02, 0.06];

function petalOutline(angleDeg: number, length: number, width: number): Vec2[] {
  const a = (angleDeg * Math.PI) / 180;
  const cx = FLOWER_CENTER[0];
  const cy = FLOWER_CENTER[1];
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  // perpendicular
  const px = -dy;
  const py = dx;
  const tip: Vec2 = [cx + dx * length, cy + dy * length];
  const midL: Vec2 = [cx + dx * length * 0.55 + px * width, cy + dy * length * 0.55 + py * width];
  const midR: Vec2 = [cx + dx * length * 0.55 - px * width, cy + dy * length * 0.55 - py * width];
  return [[cx, cy], midL, tip, midR, [cx, cy]];
}

/**
 * Back stitch along a run: each stitch shares an endpoint with the previous one,
 * which is what makes an unbroken embroidered line rather than a dashed one.
 */
function backStitchRun(
  path: Vec2[],
  spacing: number,
  rng: () => number,
  kind: StitchKind,
  startIndex: number
): Stitch[] {
  const stitches: Stitch[] = [];
  let carried = 0;
  let prev = path[0];
  let idx = startIndex;

  for (let i = 1; i < path.length; i++) {
    const cur = path[i];
    const segLen = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    carried += segLen;
    // human stitch length wanders by roughly a tenth
    const target = spacing * (0.88 + rng() * 0.24);
    if (carried >= target) {
      // tiny lateral wobble: the needle rarely lands exactly on the drawn line
      const wob = (rng() - 0.5) * spacing * 0.22;
      const nx = -(cur[1] - prev[1]) / (segLen || 1);
      const ny = (cur[0] - prev[0]) / (segLen || 1);
      const entry: Vec2 = [prev[0] + nx * wob * 0.5, prev[1] + ny * wob * 0.5];
      const exit: Vec2 = [cur[0] + nx * wob, cur[1] + ny * wob];
      const tension = 0.55 + rng() * 0.4;
      stitches.push({
        entry,
        exit,
        index: idx++,
        tension,
        raise: (0.0013 + rng() * 0.0007) * (0.7 + tension * 0.5),
        gauge: 0.0011 + rng() * 0.0004,
        kind,
        twist: rng() * Math.PI,
      });
      carried = 0;
      prev = cur;
    }
  }
  return stitches;
}

/**
 * Satin fill: parallel stitches laid edge to edge across a closed lobe. This is
 * how a leaf or petal is actually filled — not by shading a polygon.
 */
function satinFill(
  outline: Vec2[],
  angleDeg: number,
  density: number,
  rng: () => number,
  kind: StitchKind,
  startIndex: number
): Stitch[] {
  const stitches: Stitch[] = [];
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;

  // project outline onto the perpendicular axis to find the sweep range
  let minP = Infinity;
  let maxP = -Infinity;
  for (const p of outline) {
    const proj = p[0] * px + p[1] * py;
    if (proj < minP) minP = proj;
    if (proj > maxP) maxP = proj;
  }

  let idx = startIndex;
  const lines = Math.max(3, Math.round((maxP - minP) / density));

  for (let i = 0; i <= lines; i++) {
    const t = i / lines;
    const offset = minP + (maxP - minP) * t + (rng() - 0.5) * density * 0.3;
    // find where this scan line crosses the outline
    const hits: number[] = [];
    for (let j = 0; j < outline.length - 1; j++) {
      const p1 = outline[j];
      const p2 = outline[j + 1];
      const proj1 = p1[0] * px + p1[1] * py;
      const proj2 = p2[0] * px + p2[1] * py;
      if ((proj1 - offset) * (proj2 - offset) <= 0 && proj1 !== proj2) {
        const f = (offset - proj1) / (proj2 - proj1);
        const hx = p1[0] + (p2[0] - p1[0]) * f;
        const hy = p1[1] + (p2[1] - p1[1]) * f;
        hits.push(hx * dx + hy * dy);
      }
    }
    if (hits.length < 2) continue;
    hits.sort((m, n) => m - n);
    const lo = hits[0];
    const hi = hits[hits.length - 1];
    if (hi - lo < 0.012) continue;

    // the hand overshoots the edge very slightly, and unevenly
    const padA = (rng() - 0.5) * 0.012;
    const padB = (rng() - 0.5) * 0.012;
    const entry: Vec2 = [dx * (lo + padA) + px * offset, dy * (lo + padA) + py * offset];
    const exit: Vec2 = [dx * (hi + padB) + px * offset, dy * (hi + padB) + py * offset];
    const tension = 0.5 + rng() * 0.45;
    stitches.push({
      entry,
      exit,
      index: idx++,
      tension,
      // satin sits proudest of the cloth — that raised sheen is the point of it
      raise: (0.0016 + rng() * 0.0008) * (0.7 + tension * 0.5),
      gauge: 0.0010 + rng() * 0.00035,
      kind,
      twist: rng() * Math.PI,
    });
  }
  return stitches;
}

/** Scattered seed stitches — the filler an artisan uses to break empty ground. */
function seedScatter(
  count: number,
  radius: number,
  center: Vec2,
  rng: () => number,
  startIndex: number
): Stitch[] {
  const stitches: Stitch[] = [];
  let idx = startIndex;
  for (let i = 0; i < count; i++) {
    // rejection-sample an annulus so seeds ring the flower rather than crowd it
    const ang = rng() * Math.PI * 2;
    const r = radius * (0.55 + Math.sqrt(rng()) * 0.45);
    const cx = center[0] + Math.cos(ang) * r;
    const cy = center[1] + Math.sin(ang) * r;
    const dir = rng() * Math.PI * 2;
    const len = 0.022 + rng() * 0.016;
    const tension = 0.6 + rng() * 0.35;
    stitches.push({
      entry: [cx, cy],
      exit: [cx + Math.cos(dir) * len, cy + Math.sin(dir) * len],
      index: idx++,
      tension,
      raise: (0.0012 + rng() * 0.0006) * (0.7 + tension * 0.5),
      gauge: 0.0009 + rng() * 0.0003,
      kind: 'seed',
      twist: rng() * Math.PI,
    });
  }
  return stitches;
}

/**
 * Build the full motif in the order a human would work it:
 * stem first, then leaves, then the flower head, then the seed fill.
 * The scroll reveal follows this order exactly, so the viewer watches the piece
 * being built the way it really is built.
 */
export function buildButi(seed = 20240817): Stitch[] {
  const rng = makeRng(seed);
  const all: Stitch[] = [];

  const stemPath = sampleCurve(STEM, 64);
  all.push(...backStitchRun(stemPath, 0.055, rng, 'outline', all.length));

  const leafL = sampleCurve([...LEAF_LEFT, LEAF_LEFT[0]], 72);
  all.push(...satinFill(leafL, 118, 0.019, rng, 'fill', all.length));

  const leafR = sampleCurve([...LEAF_RIGHT, LEAF_RIGHT[0]], 72);
  all.push(...satinFill(leafR, 62, 0.019, rng, 'fill', all.length));

  PETAL_ANGLES.forEach((ang, i) => {
    const outline = sampleCurve(petalOutline(ang, PETAL_LENGTHS[i], 0.088), 64);
    // petals are worked across their own axis, so the sheen runs petal-wise
    all.push(...satinFill(outline, ang + 90, 0.0165, rng, 'fill', all.length));
  });

  // the flower centre: dense metallic knots, worked last and tightest
  all.push(
    ...seedScatter(14, 0.045, FLOWER_CENTER, rng, all.length).map((s) => ({
      ...s,
      kind: 'metal' as StitchKind,
      raise: s.raise * 1.25,
      gauge: s.gauge * 1.15,
    }))
  );

  all.push(...seedScatter(26, 0.52, FLOWER_CENTER, rng, all.length));

  // re-index so reveal order is contiguous
  return all.map((s, i) => ({ ...s, index: i }));
}

/** Palette, in fabric/thread terms rather than UI terms. */
export const PALETTE = {
  ground: '#e8dfd0', // warm ivory handloom cotton
  groundDeep: '#d6c9b4', // shadowed weave
  sand: '#c9b79c',
  terracotta: '#a2543a',
  dustyRose: '#b98a80',
  indigo: '#2b3a52',
  indigoDeep: '#1b2534',
  metal: '#b09256', // aged zari, not bright gold
  metalDark: '#7d6438',
  thread: '#8f4f3d',
  ink: '#2c2721',
};

/** Thread colour per technique. Restrained — three threads, not a rainbow. */
export function threadColor(kind: StitchKind): string {
  switch (kind) {
    case 'metal':
      return PALETTE.metal;
    case 'fill':
      return PALETTE.terracotta;
    case 'seed':
      return PALETTE.indigo;
    default:
      return PALETTE.thread;
  }
}
