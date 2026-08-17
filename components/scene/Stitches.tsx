'use client';

/**
 * Stitches.tsx — the thread itself.
 *
 * All stitches of a given thread type are merged into one geometry and revealed
 * in the vertex shader by make-order. The stitch currently being worked grows
 * along its own length, so the viewer sees thread being drawn through the cloth
 * rather than a finished stitch appearing.
 *
 * Four threads only: a rust outline thread, a terracotta fill, an indigo seed
 * thread and a small amount of aged zari at the flower centre. Restraint is the
 * brief — this is an atelier, not a sample card.
 */

import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { threadColor, type Stitch, type StitchKind } from '@/lib/craft';
import { buildCarryGeometry, buildStitchGeometry, splitByKind } from '@/lib/stitchGeometry';
import { makeThreadTexture } from '@/lib/textures';
import type { LiveState } from '@/lib/live';
import { CLOTH_SCALE } from './Cloth';

interface GroupProps {
  stitches: Stitch[];
  kind: StitchKind;
  live: React.MutableRefObject<LiveState>;
  radial: number;
  tubular: number;
  reverse?: boolean;
}

/** Shared reveal injection, used by both the face threads and the carries. */
function applyReveal(material: THREE.Material, uniforms: { uRevealed: { value: number } }) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRevealed = uniforms.uRevealed;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aIndex;
        attribute float aT;
        uniform float uRevealed;
        varying float vHidden;
        `
      )
      .replace(
        '#include <project_vertex>',
        /* glsl */ `
        #include <project_vertex>

        float made  = floor(uRevealed);
        float grown = fract(uRevealed);

        vHidden = 0.0;
        if (aIndex > made + 0.5) {
          // not yet begun
          vHidden = 1.0;
        } else if (abs(aIndex - made) < 0.5 && aT > grown) {
          // this is the stitch under the needle right now — only the part the
          // hand has already pulled through exists
          vHidden = 1.0;
        }

        if (vHidden > 0.5) {
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        }
        `
      );
  };
  material.needsUpdate = true;
}

function StitchGroup({ stitches, kind, live, radial, tubular, reverse }: GroupProps) {
  const geometry = useMemo(() => {
    if (stitches.length === 0) return null;
    const opts = { radial, tubular, scale: CLOTH_SCALE, sink: 0.0006 };
    return reverse ? buildCarryGeometry(stitches, opts) : buildStitchGeometry(stitches, opts);
  }, [stitches, radial, tubular, reverse]);

  const threadTex = useMemo(
    () => makeThreadTexture({ size: 256, plies: 3, metallic: kind === 'metal' }),
    [kind]
  );

  const uniforms = useMemo(() => ({ uRevealed: { value: 0 } }), []);

  const material = useMemo(() => {
    const isMetal = kind === 'metal';
    const color = new THREE.Color(threadColor(kind));
    if (reverse) color.multiplyScalar(0.62); // the back is always duller

    const m = new THREE.MeshPhysicalMaterial({
      color,
      map: threadTex,
      // the ply twist also modulates roughness, which is what makes floss glint
      roughnessMap: threadTex,
      roughness: isMetal ? 0.3 : 0.66,
      metalness: isMetal ? 0.85 : 0.02,
      sheen: isMetal ? 0 : 0.7,
      sheenColor: new THREE.Color('#ffe9d2'),
      sheenRoughness: 0.6,
      envMapIntensity: isMetal ? 1.5 : 0.35,
    });
    applyReveal(m, uniforms);
    return m;
  }, [kind, threadTex, uniforms, reverse]);

  useFrame(() => {
    uniforms.uRevealed.value = live.current.revealed;
  });

  useEffect(
    () => () => {
      geometry?.dispose();
      material.dispose();
      threadTex.dispose();
    },
    [geometry, material, threadTex]
  );

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} material={material} castShadow={!reverse} receiveShadow={!reverse} />
  );
}

interface StitchesProps {
  stitches: Stitch[];
  live: React.MutableRefObject<LiveState>;
  radial: number;
  tubular: number;
  showReverse: boolean;
}

export default function Stitches({
  stitches,
  live,
  radial,
  tubular,
  showReverse,
}: StitchesProps) {
  const groups = useMemo(() => splitByKind(stitches), [stitches]);

  return (
    <group>
      {(Object.keys(groups) as StitchKind[]).map((kind) => (
        <StitchGroup
          key={kind}
          kind={kind}
          stitches={groups[kind]}
          live={live}
          radial={radial}
          tubular={tubular}
        />
      ))}

      {showReverse && (
        <StitchGroup
          key="carry"
          kind="outline"
          stitches={stitches}
          live={live}
          radial={Math.max(4, radial - 2)}
          tubular={Math.max(4, tubular - 3)}
          reverse
        />
      )}
    </group>
  );
}
