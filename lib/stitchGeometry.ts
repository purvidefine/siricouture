/**
 * stitchGeometry.ts — turns Stitch data into actual thread.
 *
 * Every stitch is a real tube of geometry with thickness, arcing up out of the
 * weave and back down into it. All stitches are merged into one buffer so the
 * whole motif is a single draw call; the scroll reveal is done in the vertex
 * shader with a per-vertex stitch index, not by rebuilding geometry.
 *
 * Two attributes carry the reveal:
 *   aIndex — which stitch this vertex belongs to
 *   aT     — 0..1 along that stitch's length, so the *current* stitch can grow
 *            out of the cloth rather than popping into existence.
 */

import * as THREE from 'three';
import type { Stitch, StitchKind } from './craft';

export interface StitchGeometryOptions {
  radial: number;
  tubular: number;
  /** Fabric-space units to world units. */
  scale: number;
  /** How far below the cloth surface the thread ends sink. */
  sink: number;
}

/** Map fabric [x, y] to world (x, 0, -y). */
function toWorld(p: [number, number], scale: number): THREE.Vector3 {
  return new THREE.Vector3(p[0] * scale, 0, -p[1] * scale);
}

/**
 * Build merged tube geometry for a set of stitches.
 *
 * The arc: each stitch leaves the cloth at its entry point, rises to `raise` at
 * the midpoint, and dives back in at the exit. Tension flattens the arc — a hard
 * pull seats the thread tighter to the cloth, which is why high-tension stitches
 * look lower and glossier than lazy ones.
 */
export function buildStitchGeometry(
  stitches: Stitch[],
  opts: StitchGeometryOptions
): THREE.BufferGeometry {
  const { radial, tubular, scale, sink } = opts;

  const vertsPerStitch = (tubular + 1) * (radial + 1);
  const total = stitches.length;

  const positions = new Float32Array(total * vertsPerStitch * 3);
  const normals = new Float32Array(total * vertsPerStitch * 3);
  const uvs = new Float32Array(total * vertsPerStitch * 2);
  const aIndex = new Float32Array(total * vertsPerStitch);
  const aT = new Float32Array(total * vertsPerStitch);

  const indices: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const prev = new THREE.Vector3();
  const next = new THREE.Vector3();

  let v = 0;

  for (let s = 0; s < total; s++) {
    const st = stitches[s];
    const a = toWorld(st.entry, scale);
    const b = toWorld(st.exit, scale);

    // both ends dip just under the surface so the thread reads as passing
    // through the weave rather than resting on top of it
    a.y = -sink;
    b.y = -sink;

    // `raise` is the height of the thread's centreline at the crown, measured
    // from the cloth surface. It must clear `sink`, or the whole stitch stays
    // buried and only a stub shows above the ground.
    const raise = st.raise * (1.15 - st.tension * 0.35);
    const span = sink + raise;
    const baseVertex = v;

    // sample the arc
    // a sine arc reaches zero at both ends, so the thread genuinely meets the
    // cloth where it enters instead of floating above it. The exponent shifts
    // the crown slightly off centre, which is what an uneven pull actually does.
    const skewExp = 0.86 + (st.twist / Math.PI) * 0.28;
    const pointAt = (t: number, out: THREE.Vector3) => {
      out.lerpVectors(a, b, t);
      out.y = -sink + Math.sin(Math.PI * Math.pow(Math.min(1, Math.max(0, t)), skewExp)) * span;
      return out;
    };

    for (let i = 0; i <= tubular; i++) {
      const t = i / tubular;
      pointAt(t, p);

      // finite-difference tangent
      pointAt(Math.max(0, t - 0.02), prev);
      pointAt(Math.min(1, t + 0.02), next);
      tangent.subVectors(next, prev).normalize();

      normal.crossVectors(tangent, up);
      if (normal.lengthSq() < 1e-8) normal.set(1, 0, 0);
      normal.normalize();
      binormal.crossVectors(normal, tangent).normalize();

      // taper into the cloth, but only over the last few percent — pinching the
      // ends to nothing would leave visible gaps between consecutive stitches
      const taper = Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 4.0 + 0.58);
      const radius = st.gauge * taper;

      for (let j = 0; j <= radial; j++) {
        const ang = (j / radial) * Math.PI * 2 + st.twist;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);

        const nx = cos * normal.x + sin * binormal.x;
        const ny = cos * normal.y + sin * binormal.y;
        const nz = cos * normal.z + sin * binormal.z;

        const o = v * 3;
        positions[o] = p.x + nx * radius;
        positions[o + 1] = p.y + ny * radius;
        positions[o + 2] = p.z + nz * radius;

        normals[o] = nx;
        normals[o + 1] = ny;
        normals[o + 2] = nz;

        const uo = v * 2;
        // u runs along the thread so the ply twist texture stretches correctly
        uvs[uo] = t * 2.5;
        uvs[uo + 1] = j / radial;

        // the stitch's GLOBAL make-order, not its position in this buffer —
        // threads are split by material, but the hand still works in one order
        aIndex[v] = st.index;
        aT[v] = t;

        v++;
      }
    }

    // stitch the rings together
    for (let i = 0; i < tubular; i++) {
      for (let j = 0; j < radial; j++) {
        const i0 = baseVertex + i * (radial + 1) + j;
        const i1 = i0 + radial + 1;
        indices.push(i0, i1, i0 + 1);
        indices.push(i1, i1 + 1, i0 + 1);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('aIndex', new THREE.BufferAttribute(aIndex, 1));
  geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

/**
 * The reverse of the work.
 *
 * On the underside, thread travels from where one stitch ended to where the next
 * begins. Those carries are messier, slacker and duller than the face — which is
 * exactly why showing them proves the piece was made by a person.
 */
export function buildCarryGeometry(
  stitches: Stitch[],
  opts: StitchGeometryOptions
): THREE.BufferGeometry {
  const carries: Stitch[] = [];
  for (let i = 0; i < stitches.length - 1; i++) {
    const a = stitches[i];
    const b = stitches[i + 1];
    const d = Math.hypot(b.entry[0] - a.exit[0], b.entry[1] - a.exit[1]);
    // only carry where the jump is short; long jumps would be cut and restarted
    if (d > 0.28) continue;
    carries.push({
      entry: a.exit,
      exit: b.entry,
      index: a.index,
      tension: 0.25 + a.tension * 0.2,
      raise: -(0.0012 + d * 0.004),
      gauge: a.gauge * 0.85,
      kind: a.kind,
      twist: a.twist,
    });
  }
  return buildStitchGeometry(carries, { ...opts, sink: -opts.sink * 0.4 });
}

export function splitByKind(stitches: Stitch[]): Record<StitchKind, Stitch[]> {
  const out: Record<StitchKind, Stitch[]> = {
    outline: [],
    fill: [],
    seed: [],
    metal: [],
  };
  for (const s of stitches) out[s.kind].push(s);
  return out;
}
