'use client';

/**
 * Hand.tsx — the artisan, present but not performed.
 *
 * Two elements:
 *   1. a soft foreground mass, held nearer the camera than the focal plane, so
 *      it is genuinely out of focus the way a hand is at macro range
 *   2. a contact shadow on the cloth, which is what actually convinces the eye
 *      that something is physically above the fabric
 *
 * The motion is small and functional. A working hand does not gesture: it
 * presses, it steadies, it repositions by a few millimetres and then it is still.
 * Every movement here is tied to the stitch cycle, so the hand is always doing
 * the thing the needle is doing.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeHandShadowTexture, makeHandTexture } from '@/lib/handTexture';
import { stitchPhase, type LiveState } from '@/lib/live';

interface HandProps {
  live: React.MutableRefObject<LiveState>;
}

export default function Hand({ live }: HandProps) {
  const massRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  const massTex = useMemo(() => makeHandTexture({ size: 512, blur: 30 }), []);
  const shadowTex = useMemo(() => makeHandShadowTexture({ size: 512, blur: 20, dilate: 3 }), []);

  const massMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: massTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        // warm mid-brown; this is skin in shadow, not a silhouette cut-out
        color: new THREE.Color('#4a3327'),
        toneMapped: false,
      }),
    [massTex]
  );

  const shadowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        color: new THREE.Color('#2a1d13'),
        blending: THREE.NormalBlending,
      }),
    [shadowTex]
  );

  useEffect(
    () => () => {
      massTex.dispose();
      shadowTex.dispose();
      massMat.dispose();
      shadowMat.dispose();
    },
    [massTex, shadowTex, massMat, shadowMat]
  );

  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((frameState) => {
    const t = frameState.clock.elapsedTime;
    const L = live.current;
    const state = L.needle;
    const presence = L.handPresence;
    const phase = stitchPhase(L);

    // the hand settles into the press and releases after the pull-through
    const press = Math.sin(Math.min(1, Math.max(0, phase)) * Math.PI);
    // a slow, involuntary drift — nobody holds perfectly still
    const driftX = Math.sin(t * 0.31) * 0.0025 + Math.sin(t * 0.77) * 0.0009;
    const driftZ = Math.cos(t * 0.26) * 0.0025;

    const mass = massRef.current;
    if (mass) {
      // anchored to the needle's blunt end: the hand holds the needle, so where
      // the needle goes the grip follows
      const eyeX = state.tip.x - state.axis.x * 0.15;
      const eyeY = state.tip.y - state.axis.y * 0.15;
      const eyeZ = state.tip.z - state.axis.z * 0.15;

      // pushed down and toward the camera so the hand enters from the lower
      // right corner. A hand really is bigger than this frame; filling it would
      // just black out the work, so we show the part that holds the needle.
      mass.position.set(
        eyeX + 0.075 + driftX,
        eyeY - 0.055 + press * 0.003,
        eyeZ + 0.105 + driftZ
      );
      mass.scale.setScalar(0.46);
      // faces the camera; it is a soft mass, not a modelled object
      mass.quaternion.copy(frameState.camera.quaternion);
      massMat.opacity = presence * 0.92;
      mass.visible = presence > 0.01;
    }

    const shadow = shadowRef.current;
    if (shadow) {
      shadow.position.set(state.tip.x + 0.042 + driftX * 1.4, 0.0009, state.tip.z + 0.055 + driftZ * 1.4);
      // the shadow tightens and darkens as the hand comes down to press
      const closeness = 0.62 + press * 0.16;
      shadow.scale.set(0.46 * closeness, 0.46 * closeness, 1);
      shadowMat.opacity = presence * (0.16 + press * 0.1);
      shadow.visible = presence > 0.01;
    }
  });

  return (
    <group>
      <mesh ref={shadowRef} geometry={geo} material={shadowMat} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} />
      <mesh ref={massRef} geometry={geo} material={massMat} renderOrder={10} />
    </group>
  );
}
