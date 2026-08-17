'use client';

/**
 * Scene.tsx — the composition.
 *
 * Everything derives from one number: scroll progress. From it come the camera
 * move, the number of stitches in existence, the needle's position in its cycle,
 * how present the hand is, and whether the panel is still on the table or has
 * become the front of a garment.
 *
 * The panel and the garment are not separate assets. The same cloth and the same
 * thread geometry are transformed up onto the bodice, because "the panel becomes
 * the piece" should be literally true rather than a cross-fade.
 *
 * <Driver> is deliberately the first child: React subscribes frame callbacks in
 * mount order, so the driver always writes the live state before its siblings
 * read it in the same frame.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Atelier from './Atelier';
import Cloth, { CLOTH_SCALE } from './Cloth';
import Stitches from './Stitches';
import Needle from './Needle';
import Hand from './Hand';
import Garment from './Garment';
import { buildButi } from '@/lib/craft';
import { CHAPTERS, resolveScroll, smoother } from '@/lib/chapters';
import { computeNeedleState } from '@/lib/needleMotion';
import { createLiveState, type LiveState } from '@/lib/live';
import type { QualitySettings } from '@/lib/quality';
import { fabricShift, needlePierce, threadPull } from '@/lib/audio';
import type { Stitch } from '@/lib/craft';

const N = CHAPTERS.length;

/** A window of global progress expressed in chapter units, eased. */
function window01(p: number, fromChapter: number, toChapter: number) {
  return smoother((p * N - fromChapter) / (toChapter - fromChapter));
}

interface DriverProps {
  progressRef: React.MutableRefObject<number>;
  live: React.MutableRefObject<LiveState>;
  stitches: Stitch[];
  total: number;
  reducedMotion: boolean;
  workRef: React.RefObject<THREE.Group>;
  onChapter?: (index: number) => void;
}

function Driver({
  progressRef,
  live,
  stitches,
  total,
  reducedMotion,
  workRef,
  onChapter,
}: DriverProps) {
  const { camera } = useThree();

  const target = useMemo(
    () => ({
      pos: new THREE.Vector3(...CHAPTERS[0].cam),
      look: new THREE.Vector3(...CHAPTERS[0].target),
      fov: CHAPTERS[0].fov,
    }),
    []
  );

  const current = useMemo(
    () => ({
      pos: new THREE.Vector3(...CHAPTERS[0].cam),
      look: new THREE.Vector3(...CHAPTERS[0].target),
      fov: CHAPTERS[0].fov,
    }),
    []
  );

  const audio = useRef({ lastStitch: -1, lastPhase: 0 });

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    // a very close near plane is what makes the opening macro shot possible
    cam.near = 0.004;
    cam.far = 60;
    cam.fov = CHAPTERS[0].fov;
    cam.position.copy(current.pos);
    cam.lookAt(current.look);
    cam.updateProjectionMatrix();
  }, [camera, current]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20); // guard against tab-switch spikes
    const p = progressRef.current;
    const s = resolveScroll(p);
    const L = live.current;

    L.progress = p;

    // ---- camera: critically damped, never snapping, never overshooting
    target.pos.set(...s.cam);
    target.look.set(...s.target);
    target.fov = s.fov;

    const lambda = reducedMotion ? 30 : 3.4;
    current.pos.x = THREE.MathUtils.damp(current.pos.x, target.pos.x, lambda, dt);
    current.pos.y = THREE.MathUtils.damp(current.pos.y, target.pos.y, lambda, dt);
    current.pos.z = THREE.MathUtils.damp(current.pos.z, target.pos.z, lambda, dt);
    current.look.x = THREE.MathUtils.damp(current.look.x, target.look.x, lambda, dt);
    current.look.y = THREE.MathUtils.damp(current.look.y, target.look.y, lambda, dt);
    current.look.z = THREE.MathUtils.damp(current.look.z, target.look.z, lambda, dt);
    current.fov = THREE.MathUtils.damp(current.fov, target.fov, lambda, dt);

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(current.pos);
    cam.lookAt(current.look);
    if (Math.abs(cam.fov - current.fov) > 0.01) {
      cam.fov = current.fov;
      cam.updateProjectionMatrix();
    }

    // ---- how much of the motif exists
    L.revealed = s.stitched * total;

    // ---- the needle cycle, shared by the cloth dimple and the needle mesh
    computeNeedleState(stitches, L.revealed, CLOTH_SCALE, L.needle);

    // ---- presence envelopes
    L.needlePresence = 1 - window01(p, 4.55, 5.25);
    L.handPresence = s.hand * (1 - window01(p, 4.7, 5.4));
    L.garmentReveal = window01(p, 5.25, 6.0);
    L.figureReveal = window01(p, 6.3, 6.92);
    L.onBody = window01(p, 5.4, 6.15);

    // ---- the panel travels from the table onto the bodice
    const g = workRef.current;
    if (g) {
      // flat on the table -> upright on the bodice. It lands small: a set-in
      // hand-embroidered panel, which is what couture actually does with one.
      g.rotation.x = L.onBody * (Math.PI / 2);
      g.scale.setScalar(1 - L.onBody * 0.74);
      g.position.set(0, L.onBody * 1.3, L.onBody * 0.194);
    }

    // ---- sound, triggered by the mechanics rather than by a timeline
    const idx = Math.floor(L.revealed);
    const phase = L.revealed - idx;
    if (idx > audio.current.lastStitch && idx >= 0) {
      needlePierce(0.6 + Math.random() * 0.4);
      if (idx % 17 === 0) fabricShift();
    }
    if (idx !== audio.current.lastStitch) audio.current.lastStitch = idx;
    if (phase > 0.76 && audio.current.lastPhase <= 0.76) {
      threadPull(0.6 + Math.random() * 0.5);
    }
    audio.current.lastPhase = phase;

    // ---- chapter change, for the typographic overlay
    if (s.index !== L.chapter) {
      L.chapter = s.index;
      onChapter?.(s.index);
    }
  });

  return null;
}

interface SceneProps {
  progressRef: React.MutableRefObject<number>;
  quality: QualitySettings;
  reducedMotion: boolean;
  onChapter?: (index: number) => void;
}

export default function Scene({ progressRef, quality, reducedMotion, onChapter }: SceneProps) {
  const stitches = useMemo(() => buildButi(20240817), []);
  const total = Math.min(stitches.length, quality.maxStitches);
  const visible = useMemo(() => stitches.slice(0, total), [stitches, total]);

  const workRef = useRef<THREE.Group>(null);

  const live = useRef<LiveState>(
    createLiveState(computeNeedleState(visible, 0, CLOTH_SCALE))
  );

  return (
    <>
      <Driver
        progressRef={progressRef}
        live={live}
        stitches={visible}
        total={total}
        reducedMotion={reducedMotion}
        workRef={workRef}
        onChapter={onChapter}
      />

      <fog attach="fog" args={['#120f0c', 2.4, 9.5]} />

      <Atelier shadows={quality.shadows} />

      {/* the work: cloth and thread together, table -> bodice as one object */}
      <group ref={workRef}>
        <Cloth
          stitches={visible}
          live={live}
          segments={quality.fabricSegments}
          textureSize={quality.fabricTexture}
          quality={quality.tier}
        />
        <Stitches
          stitches={visible}
          live={live}
          radial={quality.threadRadial}
          tubular={quality.threadTubular}
          showReverse={quality.reverseThreads}
        />
      </group>

      <Needle live={live} radial={quality.threadRadial} tubular={quality.threadTubular} />

      <Hand live={live} />

      <Garment live={live} segments={quality.tier} />
    </>
  );
}
