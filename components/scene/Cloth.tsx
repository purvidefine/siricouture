'use client';

/**
 * Cloth.tsx — the ground the whole story happens on.
 *
 * This is not a coloured plane. It carries a generated plain-weave normal map so
 * individual warp and weft threads catch light at macro range, and it deforms in
 * three ways that a real piece of cloth under a needle deforms:
 *
 *   1. slow folds, because cloth never lies perfectly flat on a table
 *   2. a live dimple where the needle is currently pressing through
 *   3. permanent pucker at every stitch already made, because pulling thread
 *      tight gathers the weave around it
 *
 * (3) is what sells it. Embroidery that leaves the cloth undisturbed reads as a
 * decal; embroidery that drags the ground with it reads as handwork.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeFabricTextures } from '@/lib/textures';
import { MOTIF_SCALE, PALETTE, type Stitch } from '@/lib/craft';
import type { LiveState } from '@/lib/live';

/** Motif coords -1..1 -> world. Re-exported so the scene shares one scale. */
export const CLOTH_SCALE = MOTIF_SCALE;

/**
 * The sample panel: 0.66 world units ≈ 13cm, a hoop-sized swatch. The buti
 * covers the middle third of it, which is how a real sample is laid out — you
 * leave ground around a motif so it can be judged.
 */
const PLANE = 0.66;

interface ClothProps {
  stitches: Stitch[];
  /** Per-frame state bus, written by the scene driver. */
  live: React.MutableRefObject<LiveState>;
  segments: number;
  textureSize: number;
  quality: 'high' | 'medium' | 'low';
}

/**
 * The pucker map: a greyscale record of every stitch the hand has already
 * pulled. Redrawn in batches as the reveal advances rather than every frame.
 */
function usePuckerMap(stitches: Stitch[], size: number) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    let drawn = 0;

    // motif coords -> world -> plane UV. The motif only covers the middle of the
    // panel, so this mapping is not simply (f + 1) / 2.
    const toUv = (f: number) => (f * MOTIF_SCALE + PLANE / 2) / PLANE;

    const dot = (fx: number, fy: number, radius: number, strength: number) => {
      const px = toUv(fx) * size;
      const py = (1 - toUv(fy)) * size;
      const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
      g.addColorStop(0, `rgba(255,255,255,${strength})`);
      g.addColorStop(0.55, `rgba(255,255,255,${strength * 0.35})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    /** Draw up to `count` stitches; returns true if the texture changed. */
    const drawTo = (count: number) => {
      const target = Math.min(stitches.length, Math.max(0, Math.floor(count)));
      if (target === drawn) return false;
      if (target < drawn) {
        // scrubbed backwards — repaint from scratch
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        drawn = 0;
      }
      for (let i = drawn; i < target; i++) {
        const s = stitches[i];
        // the harder it was pulled, the more it gathers the ground
        const r = size * 0.009 * (0.7 + s.tension * 0.7);
        const a = 0.2 * s.tension;
        dot(s.entry[0], s.entry[1], r, a);
        dot(s.exit[0], s.exit[1], r, a);
      }
      drawn = target;
      texture.needsUpdate = true;
      return true;
    };

    return { texture, drawTo, dispose: () => texture.dispose() };
  }, [stitches, size]);
}

export default function Cloth({ stitches, live, segments, textureSize, quality }: ClothProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lastDrawn = useRef(-1);

  const fabric = useMemo(
    () =>
      makeFabricTextures({
        size: textureSize,
        threads: quality === 'low' ? 44 : 56,
        // threads * repeat = thread count across the 13cm panel. 56 x 15 ≈ 840,
        // i.e. ~64 threads/cm — a fine handloom cotton rather than sacking.
        repeat: quality === 'low' ? 11 : 15,
        base: PALETTE.ground,
        seed: 11,
        // strong enough to catch a raking light, not so strong it corrugates
        normalStrength: 1.55,
      }),
    [textureSize, quality]
  );

  const pucker = usePuckerMap(stitches, quality === 'low' ? 256 : 512);

  useEffect(() => () => fabric.dispose(), [fabric]);
  useEffect(() => () => pucker?.dispose(), [pucker]);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(PLANE, PLANE, segments, segments);
    // aoMap needs a second UV set in three's current material spec
    g.setAttribute('uv1', new THREE.BufferAttribute((g.attributes.uv as THREE.BufferAttribute).array, 2));
    return g;
  }, [segments]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uPucker: { value: pucker?.texture ?? null },
      uPuckerStrength: { value: 0.0075 },
      uNeedlePos: { value: new THREE.Vector2(99, 99) },
      uNeedleDepth: { value: 0 },
      // ~3mm of cloth is drawn in around a needle going through
      uNeedleRadius: { value: 0.015 },
      uFold: { value: 1 },
      uTime: { value: 0 },
    }),
    [pucker]
  );

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      map: fabric.map,
      normalMap: fabric.normalMap,
      roughnessMap: fabric.roughnessMap,
      aoMap: fabric.aoMap,
      aoMapIntensity: 0.85,
      normalScale: new THREE.Vector2(1.15, 1.15),
      roughness: 1.0,
      metalness: 0.0,
      // cotton has a soft off-axis bloom rather than a specular hit
      sheen: 0.55,
      sheenColor: new THREE.Color('#fff3e2'),
      sheenRoughness: 0.85,
      side: THREE.DoubleSide,
    });

    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          uniform sampler2D uPucker;
          uniform float uPuckerStrength;
          uniform vec2  uNeedlePos;
          uniform float uNeedleDepth;
          uniform float uNeedleRadius;
          uniform float uFold;
          uniform float uTime;
          varying vec2  vClothUv;
          varying float vPucker;
          `
        )
        .replace(
          '#include <begin_vertex>',
          /* glsl */ `
          #include <begin_vertex>

          vClothUv = uv;

          // --- slow folds: cloth resting on a table, not stretched on a frame
          float fold =
              sin(position.x * 6.2 + 0.7) * cos(position.y * 4.9 - 0.35) * 0.0042
            + sin(position.x * 14.8 - 1.1) * sin(position.y * 11.5 + 2.0) * 0.0013
            + sin((position.x + position.y) * 3.4 + uTime * 0.06) * 0.0009;
          transformed.z += fold * uFold;

          // --- permanent gather around stitches already pulled tight
          // clamped: where seed stitches cluster, dozens of dots overlap and an
          // unbounded value would punch a hole through the cloth
          float pk = min(texture2D(uPucker, uv).r, 0.65);
          vPucker = pk;
          transformed.z -= pk * uPuckerStrength;

          // --- live compression under the needle currently going through
          float nd = distance(position.xy, uNeedlePos);
          float dimple = exp(-(nd * nd) / (uNeedleRadius * uNeedleRadius));
          transformed.z -= dimple * uNeedleDepth;
          `
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          varying vec2  vClothUv;
          varying float vPucker;
          `
        )
        .replace(
          '#include <map_fragment>',
          /* glsl */ `
          #include <map_fragment>
          // gathered weave sits in its own shadow and reads denser
          diffuseColor.rgb *= (1.0 - vPucker * 0.22);
          `
        );
    };

    return m;
  }, [fabric, uniforms]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const L = live.current;
    uniforms.uTime.value = state.clock.elapsedTime;

    // repaint the pucker map in batches — every 4 stitches, not every frame
    const batch = Math.floor(L.revealed / 4) * 4;
    if (pucker && batch !== lastDrawn.current) {
      pucker.drawTo(L.revealed);
      lastDrawn.current = batch;
    }

    // the plane is unrotated in its own local space, so world (x, z) maps to
    // local (x, -y) — take it straight off the needle tip rather than
    // round-tripping through motif coords
    uniforms.uNeedlePos.value.set(L.needle.tip.x, -L.needle.tip.z);

    // the needle only presses while it is actually in play
    const press = L.needle.depth * L.needlePresence;
    uniforms.uNeedleDepth.value = THREE.MathUtils.lerp(
      uniforms.uNeedleDepth.value,
      press * 0.007,
      0.25
    );

    // once the panel lifts onto the garment it hangs, so the folds deepen
    uniforms.uFold.value = 1 + L.onBody * 1.6;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    />
  );
}
