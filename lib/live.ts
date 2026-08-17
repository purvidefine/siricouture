/**
 * live.ts — the per-frame state bus.
 *
 * Scroll drives this experience at 60fps. Pushing that through React state would
 * re-render the tree on every frame, so instead a single mutable object is
 * written once per frame by the driver and read by each scene component inside
 * its own render loop. React only ever mounts the tree; it never animates it.
 */

import * as THREE from 'three';
import type { NeedleState } from './needleMotion';

export interface LiveState {
  /** Global scroll progress, 0..1. */
  progress: number;
  /** Fractional count of stitches made. */
  revealed: number;
  /** Current chapter index. */
  chapter: number;
  /** 0..1 presence envelopes. */
  handPresence: number;
  needlePresence: number;
  garmentReveal: number;
  figureReveal: number;
  /** How far the panel has travelled from table to bodice, 0..1. */
  onBody: number;
  /** Full needle mechanics for this frame. */
  needle: NeedleState;
}

export function createLiveState(needle: NeedleState): LiveState {
  return {
    progress: 0,
    revealed: 0,
    chapter: 0,
    handPresence: 0,
    needlePresence: 1,
    garmentReveal: 0,
    figureReveal: 0,
    onBody: 0,
    needle,
  };
}

/** Convenience: the fractional part of the current stitch, 0..1. */
export function stitchPhase(live: LiveState): number {
  return live.revealed - Math.floor(live.revealed);
}

export const V3 = THREE.Vector3;
