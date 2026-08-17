/**
 * chapters.ts — the scroll score.
 *
 * The cloth lies flat in the XZ plane with +Y up, the way it would sit on a
 * worktable. The camera begins almost touching it and retreats over seven
 * movements. Motif coordinates are [x, y] in fabric space and map to world as
 * (x, 0, -y), so the motif's "up" runs away from the viewer across the table.
 *
 * Distances are small on purpose: the sample panel is 0.66 world units across
 * (~13cm), so the opening shot at ~0.08 units really is a macro lens sitting a
 * couple of centimetres off the cloth.
 */

export interface Chapter {
  id: string;
  /** Numeral shown in the editorial overlay. */
  numeral: string;
  /** The single line of copy for this movement. */
  line: string;
  /** Optional second line, smaller. */
  sub?: string;
  /** Camera position at the START of this chapter. */
  cam: [number, number, number];
  /** Where the camera is aimed at the START of this chapter. */
  target: [number, number, number];
  /** Focal length in mm — long and macro early, wider as we retreat. */
  fov: number;
  /** Fraction of the motif stitched by the END of this chapter. */
  stitchedBy: number;
  /** How present the artisan's hand is, 0..1. */
  hand: number;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'thread',
    numeral: '01',
    line: 'MADE BY HAND.',
    sub: 'Cotton, spun and woven before anything is drawn on it.',
    // ~1.4cm of cloth across the frame: macro, but far enough back that a
    // 0.7mm thread reads as thread rather than as a pipe
    cam: [0.06, 0.055, 0.42],
    target: [0.0, 0.003, 0.275],
    fov: 24,
    stitchedBy: 0.02,
    hand: 0.12,
  },
  {
    id: 'stitch',
    numeral: '02',
    line: 'ONE STITCH AT A TIME.',
    sub: 'The needle goes down, the thread is pulled, the cloth gathers.',
    cam: [0.075, 0.07, 0.4],
    target: [0.0, 0.002, 0.235],
    fov: 26,
    stitchedBy: 0.12,
    hand: 0.5,
  },
  {
    id: 'motif',
    numeral: '03',
    line: 'A BUTI TAKES SHAPE.',
    sub: 'Stem first, then the leaves, then the flower. Always that order.',
    cam: [0.1, 0.1, 0.33],
    target: [0.005, 0.0, 0.1],
    fov: 30,
    stitchedBy: 0.46,
    hand: 0.85,
  },
  {
    id: 'hand',
    numeral: '04',
    line: 'THE HAND IS THE DESIGNER.',
    sub: 'No two stitches are the same length. That is the point.',
    cam: [0.15, 0.135, 0.285],
    target: [0.015, 0.0, 0.04],
    fov: 34,
    stitchedBy: 0.72,
    hand: 1.0,
  },
  {
    id: 'piece',
    numeral: '05',
    line: 'CRAFTED IN BHILWARA.',
    sub: 'Roughly nine hours of work, on a panel the size of your palm.',
    // framed to the motif exactly: 8cm of cloth, the whole buti and no more
    cam: [0.055, 0.5, 0.4],
    target: [0.004, 0.0, 0.085],
    fov: 38,
    stitchedBy: 1.0,
    hand: 0.35,
  },
  {
    id: 'garment',
    numeral: '06',
    line: 'THE PANEL BECOMES THE PIECE.',
    sub: 'Cut, set and finished by the same hands that embroidered it.',
    cam: [0.36, 1.35, 2.1],
    target: [0.0, 0.85, 0.0],
    fov: 40,
    stitchedBy: 1.0,
    hand: 0.0,
  },
  {
    id: 'woman',
    numeral: '07',
    line: 'MADE AROUND YOU.',
    sub: 'Measured, fitted and made for one person.',
    cam: [0.0, 1.2, 3.5],
    target: [0.0, 1.05, 0.0],
    fov: 34,
    stitchedBy: 1.0,
    hand: 0.0,
  },
];

/** Scroll length in viewport heights. Generous, so movement stays slow. */
export const SCROLL_VH_PER_CHAPTER = 1.35;

export const TOTAL_SCROLL_VH = CHAPTERS.length * SCROLL_VH_PER_CHAPTER;

/** Smootherstep — no linear camera moves anywhere in this experience. */
export function smoother(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export interface ChapterState {
  index: number;
  /** 0..1 within the current chapter. */
  local: number;
  /** Eased blend factor toward the next chapter. */
  blend: number;
  cam: [number, number, number];
  target: [number, number, number];
  fov: number;
  stitched: number;
  hand: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Resolve global scroll progress (0..1) into a fully interpolated camera and
 * stitch-count state. Every value is eased, so the whole sequence reads as one
 * continuous move rather than seven cuts.
 */
export function resolveScroll(progress: number): ChapterState {
  const p = Math.min(0.9999, Math.max(0, progress));
  const scaled = p * CHAPTERS.length;
  const index = Math.min(CHAPTERS.length - 1, Math.floor(scaled));
  const local = scaled - index;
  const next = CHAPTERS[Math.min(CHAPTERS.length - 1, index + 1)];
  const cur = CHAPTERS[index];

  // Each chapter HOLDS its composed framing for the first stretch, then eases
  // into the next. Without the hold, every designed shot exists for a single
  // frame at the chapter boundary and the camera is permanently in transit.
  const HOLD = 0.45;
  const blend = smoother((local - HOLD) / (1 - HOLD));

  const prevStitched = index === 0 ? 0 : CHAPTERS[index - 1].stitchedBy;

  return {
    index,
    local,
    blend,
    cam: lerp3(cur.cam, next.cam, blend),
    target: lerp3(cur.target, next.target, blend),
    fov: lerp(cur.fov, next.fov, blend),
    // stitches accumulate smoothly across the chapter, not in jumps
    stitched: lerp(prevStitched, cur.stitchedBy, smoother(local)),
    hand: lerp(cur.hand, next.hand, blend),
  };
}
