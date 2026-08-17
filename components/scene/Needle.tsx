'use client';

/**
 * Needle.tsx — the tool, and the length of thread currently in play.
 *
 * The needle is a lathed steel profile with a real eye, and it is genuinely
 * hidden while it travels under the cloth rather than sliding across the surface.
 * The working thread is a tube whose control points are re-solved every frame,
 * so it hangs slack when the hand is positioning and snaps taut on the pull.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '@/lib/craft';
import { makeThreadTexture } from '@/lib/textures';
import type { LiveState } from '@/lib/live';

const NEEDLE_LENGTH = 0.17;   // ~3.4cm
const NEEDLE_RADIUS = 0.0013; // ~0.5mm across

/** Lathed profile: sharp point, swelling shank, flattened eye end. */
function makeNeedleGeometry() {
  const pts: THREE.Vector2[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let r: number;
    if (t < 0.28) {
      // the taper to the point — long and fine, as an embroidery needle is
      r = NEEDLE_RADIUS * Math.pow(t / 0.28, 0.62);
    } else if (t < 0.82) {
      r = NEEDLE_RADIUS;
    } else {
      // slight swell around the eye, then the blunt end
      const u = (t - 0.82) / 0.18;
      r = NEEDLE_RADIUS * (1 + Math.sin(u * Math.PI) * 0.28) * (1 - Math.pow(u, 6) * 0.6);
    }
    pts.push(new THREE.Vector2(Math.max(0.00002, r), t * NEEDLE_LENGTH));
  }
  const g = new THREE.LatheGeometry(pts, 14);
  g.computeVertexNormals();
  return g;
}

/** The eye, as an elongated ring the thread passes through. */
function makeEyeGeometry() {
  const g = new THREE.TorusGeometry(NEEDLE_RADIUS * 0.72, NEEDLE_RADIUS * 0.26, 8, 20);
  g.scale(1, 2.5, 1);
  return g;
}

interface NeedleProps {
  live: React.MutableRefObject<LiveState>;
  tubular: number;
  radial: number;
}

const THREAD_SEGMENTS = 24;

export default function Needle({ live, radial }: NeedleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const threadRef = useRef<THREE.Mesh>(null);

  const needleGeo = useMemo(() => makeNeedleGeometry(), []);
  const eyeGeo = useMemo(() => makeEyeGeometry(), []);

  const steel = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#b9bfc6'),
        metalness: 1.0,
        // polished but used — a needle in daily service is not a mirror
        roughness: 0.24,
        envMapIntensity: 2.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
      }),
    []
  );

  const threadTex = useMemo(() => makeThreadTexture({ size: 256, plies: 3 }), []);

  const threadMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(PALETTE.thread),
        map: threadTex,
        roughnessMap: threadTex,
        roughness: 0.68,
        metalness: 0.02,
        sheen: 0.7,
        sheenColor: new THREE.Color('#ffe9d2'),
        sheenRoughness: 0.6,
        transparent: true,
        depthWrite: true,
      }),
    [threadTex]
  );

  // dissolve the part of the thread that is too close to the lens to be sharp
  useEffect(() => {
    threadMat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        /* glsl */ `
        float camDist = length(vViewPosition);
        diffuseColor.a *= smoothstep(0.018, 0.085, camDist);
        #include <opaque_fragment>
        `
      );
    };
    threadMat.needsUpdate = true;
  }, [threadMat]);

  /**
   * The working thread. Topology is fixed; only the vertex positions move, so
   * re-solving the hang every frame stays cheap.
   */
  const threadGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: THREAD_SEGMENTS }, () => new THREE.Vector3())
    );
    return new THREE.TubeGeometry(curve, THREAD_SEGMENTS - 1, 0.001, Math.max(5, radial - 2), false);
  }, [radial]);

  useEffect(
    () => () => {
      needleGeo.dispose();
      eyeGeo.dispose();
      threadGeo.dispose();
      steel.dispose();
      threadMat.dispose();
      threadTex.dispose();
    },
    [needleGeo, eyeGeo, threadGeo, steel, threadMat, threadTex]
  );

  // scratch objects, reused every frame
  const scratch = useMemo(
    () => ({
      eye: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      upAxis: new THREE.Vector3(0, 1, 0),
      curve: new THREE.CatmullRomCurve3(
        Array.from({ length: THREAD_SEGMENTS }, () => new THREE.Vector3())
      ),
      frames: null as null | ReturnType<THREE.Curve<THREE.Vector3>['computeFrenetFrames']>,
    }),
    []
  );

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    const state = live.current.needle;
    const presence = live.current.needlePresence;

    // --- place the needle: tip at the working point, body along the axis
    g.position.copy(state.tip);
    scratch.quat.setFromUnitVectors(scratch.upAxis, state.axis);
    g.quaternion.copy(scratch.quat);

    // hide while it is under the cloth, and fade out when the work is done
    const visible = presence > 0.02 && !state.submerged;
    g.visible = visible;

    steel.opacity = presence;
    steel.transparent = presence < 0.99;

    // --- the eye sits near the blunt end, in world space
    scratch.eye
      .copy(state.axis)
      .multiplyScalar(-NEEDLE_LENGTH * 0.86)
      .add(state.tip);

    // --- solve the working thread from the eye back to where it leaves the cloth
    const pts = scratch.curve.points;
    const slack = (1 - state.tension) * 0.014;

    for (let i = 0; i < THREAD_SEGMENTS; i++) {
      const t = i / (THREAD_SEGMENTS - 1);
      const p = pts[i];
      p.lerpVectors(scratch.eye, state.anchor, t);
      // catenary sag, flattened as the thread is pulled tight
      const sag = Math.sin(t * Math.PI) * slack;
      p.y -= sag;
      // a little lateral drift so it never reads as a straight CG line
      p.x += Math.sin(t * Math.PI * 1.4) * slack * 0.35;
    }

    // rebuild the tube's vertices in place around the updated curve
    const tube = threadRef.current;
    if (tube) {
      const geo = tube.geometry as THREE.TubeGeometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const nor = geo.attributes.normal as THREE.BufferAttribute;
      const frames = scratch.curve.computeFrenetFrames(THREAD_SEGMENTS - 1, false);
      const radialSegments = Math.max(5, radial - 2);
      const radius = 0.001;

      let v = 0;
      for (let i = 0; i < THREAD_SEGMENTS; i++) {
        const P = scratch.curve.getPointAt(
          Math.min(1, i / (THREAD_SEGMENTS - 1)),
          scratch.mid.clone()
        );
        const N = frames.normals[Math.min(i, frames.normals.length - 1)];
        const B = frames.binormals[Math.min(i, frames.binormals.length - 1)];

        for (let j = 0; j <= radialSegments; j++) {
          const ang = (j / radialSegments) * Math.PI * 2;
          const sin = Math.sin(ang);
          const cos = -Math.cos(ang);

          const nx = cos * N.x + sin * B.x;
          const ny = cos * N.y + sin * B.y;
          const nz = cos * N.z + sin * B.z;

          pos.setXYZ(v, P.x + radius * nx, P.y + radius * ny, P.z + radius * nz);
          nor.setXYZ(v, nx, ny, nz);
          v++;
        }
      }
      pos.needsUpdate = true;
      nor.needsUpdate = true;
      geo.computeBoundingSphere();

      tube.visible = presence > 0.02;
      threadMat.opacity = presence;
      threadMat.transparent = presence < 0.99;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <mesh geometry={needleGeo} material={steel} castShadow />
        <mesh
          geometry={eyeGeo}
          material={steel}
          position={[0, NEEDLE_LENGTH * 0.86, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>

      <mesh ref={threadRef} geometry={threadGeo} material={threadMat} castShadow />
    </group>
  );
}
