/**
 * quality.ts — one story, two budgets.
 *
 * Mobile gets the same seven movements and the same motif. What it loses is
 * geometry density and texture resolution, never a chapter. The brief is explicit
 * that usability outranks the 3D, so we also honour prefers-reduced-motion by
 * dropping to a static, scroll-stepped presentation.
 */

export type Tier = 'high' | 'medium' | 'low';

export interface QualitySettings {
  tier: Tier;
  /** Texture edge length for the woven cloth. */
  fabricTexture: number;
  /** Segments per side on the cloth plane — drives fold and pucker fidelity. */
  fabricSegments: number;
  /** Radial + tubular segments on every thread. */
  threadRadial: number;
  threadTubular: number;
  /** Cap on simultaneously rendered stitches. */
  maxStitches: number;
  /** Render the reverse-side carry threads under the cloth. */
  reverseThreads: boolean;
  /** Device pixel ratio ceiling. */
  dpr: [number, number];
  /** Soft contact shadows. */
  shadows: boolean;
}

const HIGH: QualitySettings = {
  tier: 'high',
  fabricTexture: 1024,
  fabricSegments: 256,
  threadRadial: 8,
  threadTubular: 10,
  maxStitches: 600,
  reverseThreads: true,
  dpr: [1, 2],
  shadows: true,
};

const MEDIUM: QualitySettings = {
  tier: 'medium',
  fabricTexture: 768,
  fabricSegments: 160,
  threadRadial: 6,
  threadTubular: 8,
  maxStitches: 480,
  reverseThreads: true,
  dpr: [1, 1.75],
  shadows: true,
};

const LOW: QualitySettings = {
  tier: 'low',
  fabricTexture: 512,
  fabricSegments: 96,
  threadRadial: 5,
  threadTubular: 6,
  maxStitches: 340,
  reverseThreads: false,
  dpr: [1, 1.5],
  shadows: false,
};

export function detectQuality(): QualitySettings {
  if (typeof window === 'undefined') return MEDIUM;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 820;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (narrow || coarse) {
    return cores >= 8 && mem >= 6 ? MEDIUM : LOW;
  }
  if (cores <= 4 || mem <= 4) return MEDIUM;
  return HIGH;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
