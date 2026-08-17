/**
 * needleMotion.ts — the mechanics of one stitch.
 *
 * A single stitch is not "thread appears". It is a cycle:
 *
 *   hover -> touch -> press -> pierce -> travel under the cloth ->
 *   emerge at the exit -> rise -> pull until the thread seats
 *
 * The cloth and the needle both read from this same function, so the dimple in
 * the weave is always exactly under the point of the needle. That single shared
 * source of truth is what stops it looking like two animations playing near each
 * other.
 */

import * as THREE from 'three';
import type { Stitch } from './craft';

export interface NeedleState {
  /** Needle point in world space. */
  tip: THREE.Vector3;
  /** Unit vector along the needle, pointing toward the tip. */
  axis: THREE.Vector3;
  /** Needle point in fabric coords, for the cloth's dimple uniform. */
  fabric: [number, number];
  /** 0..1 how hard the cloth is being pressed right now. */
  depth: number;
  /** Where the working thread currently leaves the cloth. */
  anchor: THREE.Vector3;
  /** 0..1 tension on the working thread — peaks during the pull. */
  tension: number;
  /** True while the needle is below the cloth and should not be drawn. */
  submerged: boolean;
  /** Index of the stitch being worked. */
  stitch: number;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Bell curve peaking at `centre`. */
const bell = (x: number, centre: number, width: number) =>
  Math.exp(-((x - centre) * (x - centre)) / (2 * width * width));

// ~5mm of lift between stitches; the hand does not raise far
const HOVER = 0.026;

export function computeNeedleState(
  stitches: Stitch[],
  revealed: number,
  scale: number,
  out?: NeedleState
): NeedleState {
  const state: NeedleState =
    out ??
    ({
      tip: new THREE.Vector3(),
      axis: new THREE.Vector3(),
      anchor: new THREE.Vector3(),
      fabric: [0, 0],
      depth: 0,
      tension: 0,
      submerged: false,
      stitch: 0,
    } as NeedleState);

  if (stitches.length === 0) return state;

  const i = Math.min(stitches.length - 1, Math.max(0, Math.floor(revealed)));
  const t = Math.min(1, Math.max(0, revealed - Math.floor(revealed)));
  const st = stitches[i];
  state.stitch = i;

  const ex = st.entry[0] * scale;
  const ez = -st.entry[1] * scale;
  const xx = st.exit[0] * scale;
  const xz = -st.exit[1] * scale;

  // lateral travel: the needle sits at the entry, crosses beneath, surfaces at
  // the exit. Nothing moves while it is piercing — that is where the hand pauses.
  const travel = smoothstep(0.4, 0.72, t);
  const px = ex + (xx - ex) * travel;
  const pz = ez + (xz - ez) * travel;

  // vertical: down through the cloth, under, back up, then lifted on the pull
  const descend = 1 - smoothstep(0.0, 0.3, t);
  const under = bell(t, 0.55, 0.16);
  const lift = smoothstep(0.74, 1.0, t);

  const py = HOVER * descend - 0.009 * under + HOVER * 0.92 * lift;

  state.tip.set(px, py, pz);
  state.fabric = [px / scale, -pz / scale];

  // the cloth resists hardest just before the point breaks through, and again as
  // the eye of the needle is forced past the weave
  state.depth = Math.max(bell(t, 0.32, 0.075), bell(t, 0.68, 0.075)) * (0.55 + st.tension * 0.6);

  // needle held at a working angle, rolling slightly through the cycle
  const roll = 0.28 + Math.sin(t * Math.PI) * 0.14;
  state.axis
    .set(-0.42 + roll * 0.2, -0.86, 0.3 - roll * 0.15)
    .normalize();

  state.submerged = py < -0.0018;

  // the working thread leaves the cloth at the previous stitch's exit
  const prev = i > 0 ? stitches[i - 1] : st;
  state.anchor.set(prev.exit[0] * scale, 0.0012, -prev.exit[1] * scale);

  // tension spikes on the pull-through at the end of the cycle
  state.tension = smoothstep(0.72, 0.95, t) * (0.6 + st.tension * 0.4);

  return state;
}
