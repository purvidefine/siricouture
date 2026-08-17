'use client';

/**
 * Atelier.tsx — the room, kept deliberately quiet.
 *
 * One window, one worktable, one spool. The brief is explicit that the craft is
 * the hero and the environment must not become a "busy Indian room", so there is
 * no architecture, no ornament and no colour that competes with the thread.
 *
 * The lighting is a single soft key from a north-facing window with a warm bounce
 * back off the timber — which is how every real workroom of this kind is lit,
 * because you cannot judge thread colour under mixed light.
 */

import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { makeAtelierEnv, makeFabricTextures, makeThreadTexture } from '@/lib/textures';
import { PALETTE } from '@/lib/craft';

/** Timber worktable: quartersawn grain, worn matte, nothing decorative. */
function makeWoodTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#6b5642';
  ctx.fillRect(0, 0, size, size);

  // grain lines drifting slowly across the board
  for (let i = 0; i < 190; i++) {
    const y = Math.random() * size;
    const dark = Math.random() * 0.35 + 0.1;
    ctx.strokeStyle = `rgba(40, 28, 18, ${dark})`;
    ctx.lineWidth = Math.random() * 2.4 + 0.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.017 + i) * 5 + Math.sin(x * 0.005 + i * 2) * 11);
    }
    ctx.stroke();
  }

  // a few darker figure marks so the board is not uniform
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = ctx.createRadialGradient(x, y, 1, x, y, 30 + Math.random() * 60);
    g.addColorStop(0, 'rgba(38,26,16,0.4)');
    g.addColorStop(1, 'rgba(38,26,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 90, y - 90, 180, 180);
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(9, 9);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Spool() {
  const threadTex = useMemo(() => makeThreadTexture({ size: 256, plies: 4 }), []);
  useEffect(() => () => threadTex.dispose(), [threadTex]);

  const wound = useMemo(() => {
    const t = threadTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 26);
    t.needsUpdate = true;
    return t;
  }, [threadTex]);

  useEffect(() => () => wound.dispose(), [wound]);

  return (
    <group position={[-0.62, 0.028, 0.5]} rotation={[0, 0.5, Math.PI / 2]}>
      {/* the wound body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.062, 28]} />
        <meshPhysicalMaterial
          color={PALETTE.terracotta}
          map={wound}
          roughnessMap={wound}
          roughness={0.72}
          sheen={0.6}
          sheenColor={new THREE.Color('#ffe9d2')}
        />
      </mesh>
      {/* end flanges */}
      {[-0.033, 0.033].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.033, 0.033, 0.004, 28]} />
          <meshPhysicalMaterial color="#8a7154" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

export default function Atelier({ shadows }: { shadows: boolean }) {
  const { gl, scene } = useThree();

  const wood = useMemo(() => makeWoodTexture(512), []);

  // a coarse undercloth between the timber and the work, as on any real table
  const under = useMemo(
    () =>
      makeFabricTextures({
        size: 512,
        threads: 40,
        repeat: 52,
        base: '#8e8071',
        seed: 41,
        normalStrength: 1.1,
      }),
    []
  );

  useEffect(() => {
    const env = makeAtelierEnv(gl);
    scene.environment = env;
    scene.background = new THREE.Color('#0e0c0a');
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  useEffect(
    () => () => {
      wood.dispose();
      under.dispose();
    },
    [wood, under]
  );

  return (
    <group>
      {/* --- the single window key. Cool, soft, from the upper right. */}
      <directionalLight
        position={[2.6, 3.4, 2.2]}
        intensity={2.5}
        color="#fff4e6"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={12}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
        shadow-normalBias={0.004}
      />

      {/* --- warm bounce back off the timber, filling the underside of the thread */}
      <directionalLight position={[-1.8, 0.7, -1.4]} intensity={0.5} color="#e8b98a" />

      {/* --- a low ambient so the shadows keep detail rather than going black */}
      <ambientLight intensity={0.22} color="#cdbfae" />

      {/* --- undercloth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0022, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshPhysicalMaterial
          map={under.map}
          normalMap={under.normalMap}
          roughnessMap={under.roughnessMap}
          roughness={1}
          sheen={0.4}
          sheenColor={new THREE.Color('#ffeeda')}
        />
      </mesh>

      {/* --- worktable */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.016, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshPhysicalMaterial map={wood} roughness={0.78} metalness={0} color="#8d7259" />
      </mesh>

      <Spool />
    </group>
  );
}
