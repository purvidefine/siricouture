'use client';

/**
 * Garment.tsx — where the panel goes.
 *
 * The drape is built parametrically: a partial wrap that flares from the waist,
 * carrying real folds whose depth increases toward the hem, because that is how
 * weight behaves in a cut garment. It is deliberately a contemporary silhouette —
 * clean, unfussy, no ornament except the panel the visitor just watched being
 * embroidered.
 *
 * The wearer is handled the same way as the artisan's hand: a soft, warm,
 * out-of-focus mass rather than a modelled figure. A bad CG woman would undo
 * every honest thing in the preceding six chapters.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeFabricTextures } from '@/lib/textures';
import type { LiveState } from '@/lib/live';

/**
 * Parametric drape.
 *  u — around the body (a partial wrap, so we never render a closed tube)
 *  v — from shoulder to hem
 */
function buildDrapeGeometry(segU = 96, segV = 128): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const HEIGHT = 1.62;
  const WRAP = Math.PI * 1.3; // open at the back

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV;

    /*
     * The silhouette, top to bottom. The shoulder taper matters more than
     * anything else here: without it the drape closes into a cone and reads as
     * a lampshade rather than a cut garment.
     *
     *   0.00–0.07  neckline opening out to the shoulder line
     *   0.07–0.30  bodice, easing in toward the waist
     *   0.30–0.38  waist, held
     *   0.38–1.00  released, flaring to the hem
     */
    const shoulder = 0.07;
    const waistIn = 0.3;
    const waistOut = 0.38;

    let radius: number;
    if (v < shoulder) {
      const t = v / shoulder;
      radius = 0.075 + Math.sin(t * Math.PI * 0.5) * 0.125;
    } else if (v < waistIn) {
      const t = (v - shoulder) / (waistIn - shoulder);
      radius = 0.2 - Math.sin(t * Math.PI * 0.5) * 0.047;
    } else if (v < waistOut) {
      radius = 0.153;
    } else {
      const t = (v - waistOut) / (1 - waistOut);
      radius = 0.153 + Math.pow(t, 1.5) * 0.36;
    }

    const y = (1 - v) * HEIGHT;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const theta = -WRAP / 2 + u * WRAP;

      // folds: shallow at the waist, deep and irregular at the hem
      const foldWeight = Math.pow(Math.max(0, (v - waistOut) / (1 - waistOut)), 1.3);
      const folds =
        Math.sin(u * Math.PI * 9.0) * 0.028 +
        Math.sin(u * Math.PI * 5.0 + 1.3) * 0.019 +
        Math.sin(u * Math.PI * 15.0 + 0.6) * 0.008;

      const r = radius + folds * foldWeight;

      positions.push(Math.sin(theta) * r, y, Math.cos(theta) * r);
      uvs.push(u * 2.2, v * 3.4);
    }
  }

  const row = segU + 1;
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * row + iu;
      const b = a + row;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute('uv1', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** The wearer, as a soft mass. Same photographic logic as the hand. */
function makeFigureTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const s = size / 512;

  if ('filter' in ctx) ctx.filter = 'blur(26px)';
  ctx.fillStyle = '#fff';

  // neck
  ctx.beginPath();
  ctx.ellipse(256 * s, 250 * s, 34 * s, 62 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.ellipse(254 * s, 150 * s, 62 * s, 76 * s, 0.04, 0, Math.PI * 2);
  ctx.fill();

  // shoulders, asymmetric — weight on one hip
  ctx.beginPath();
  ctx.ellipse(256 * s, 350 * s, 150 * s, 66 * s, -0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.filter = 'none';

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

interface GarmentProps {
  live: React.MutableRefObject<LiveState>;
  segments: 'high' | 'medium' | 'low';
}

export default function Garment({ live, segments }: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const figureRef = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    const [u, v] = segments === 'low' ? [48, 64] : segments === 'medium' ? [72, 96] : [96, 128];
    return buildDrapeGeometry(u, v);
  }, [segments]);

  const cloth = useMemo(
    () =>
      makeFabricTextures({
        size: segments === 'low' ? 512 : 768,
        threads: 48,
        repeat: 4,
        // the garment ground is a shade cooler and deeper than the sample panel
        base: '#ded2c0',
        seed: 23,
        normalStrength: 2.1,
      }),
    [segments]
  );

  const figureTex = useMemo(() => makeFigureTexture(512), []);
  const figureGeo = useMemo(() => new THREE.PlaneGeometry(1.25, 1.25), []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: cloth.map,
        normalMap: cloth.normalMap,
        roughnessMap: cloth.roughnessMap,
        aoMap: cloth.aoMap,
        aoMapIntensity: 0.7,
        roughness: 0.94,
        metalness: 0,
        sheen: 0.7,
        sheenColor: new THREE.Color('#fff2e0'),
        sheenRoughness: 0.7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      }),
    [cloth]
  );

  const figureMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: figureTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        color: new THREE.Color('#5a4133'),
        toneMapped: false,
      }),
    [figureTex]
  );

  useEffect(
    () => () => {
      geo.dispose();
      figureGeo.dispose();
      cloth.dispose();
      figureTex.dispose();
      material.dispose();
      figureMat.dispose();
    },
    [geo, figureGeo, cloth, figureTex, material, figureMat]
  );

  useFrame(() => {
    const reveal = live.current.garmentReveal;
    const figure = live.current.figureReveal;

    material.opacity = reveal;
    figureMat.opacity = figure * 0.8;

    const g = groupRef.current;
    if (g) {
      g.visible = reveal > 0.01;
      // the garment settles the last centimetre into place as it resolves
      g.position.y = (1 - reveal) * -0.05;
    }

    const f = figureRef.current;
    if (f) f.visible = figure > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo} material={material} castShadow receiveShadow />
      <mesh
        ref={figureRef}
        geometry={figureGeo}
        material={figureMat}
        position={[0, 1.78, -0.04]}
        renderOrder={-1}
      />
    </group>
  );
}
