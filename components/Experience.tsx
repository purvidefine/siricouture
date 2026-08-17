'use client';

/**
 * Experience.tsx — the scroll harness.
 *
 * The canvas is fixed; a tall empty column behind it converts scroll distance
 * into a single 0..1 progress value. That value is written to a ref, never to
 * React state, so scrolling costs nothing in render work.
 *
 * Smooth scrolling is on by default because the camera moves are slow and a raw
 * wheel event makes them stutter. It is switched off entirely for anyone who has
 * asked for reduced motion, along with the damped camera.
 */

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './scene/Scene';
import Overlay from './ui/Overlay';
import Chrome from './ui/Chrome';
import CreateYourSiri from './ui/CreateYourSiri';
import Loader from './ui/Loader';
import { TOTAL_SCROLL_VH } from '@/lib/chapters';
import { detectQuality, prefersReducedMotion, type QualitySettings } from '@/lib/quality';

export default function Experience() {
  const progressRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [quality, setQuality] = useState<QualitySettings | null>(null);
  const [reduced, setReduced] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [ready, setReady] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  // decide the budget once, on the client, after mount
  useEffect(() => {
    setQuality(detectQuality());
    setReduced(prefersReducedMotion());
  }, []);

  // ---- scroll -> progress
  useEffect(() => {
    if (!quality) return;

    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let disposed = false;

    const read = () => {
      const el = scrollRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY - el.offsetTop, 0), Math.max(total, 1));
      const p = total > 0 ? y / total : 0;
      progressRef.current = p;
      // the progress indicator is the only thing that needs React, and it is
      // cheap enough to update at a coarse granularity
      setProgressPct((prev) => (Math.abs(prev - p) > 0.004 ? p : prev));
    };

    const tick = (time: number) => {
      lenis?.raf(time);
      read();
      raf = requestAnimationFrame(tick);
    };

    const setup = async () => {
      if (!reduced) {
        try {
          const { default: Lenis } = await import('lenis');
          if (disposed) return;
          lenis = new Lenis({
            duration: 1.25,
            // long, soft easing so the camera glides rather than tracks the wheel
            easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
            wheelMultiplier: 0.85,
            touchMultiplier: 1.4,
          }) as unknown as typeof lenis;
        } catch {
          lenis = null; // fall back to native scroll
        }
      }
      raf = requestAnimationFrame(tick);
    };

    void setup();
    window.addEventListener('resize', read);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', read);
      lenis?.destroy();
    };
  }, [quality, reduced]);

  const handleChapter = useCallback((i: number) => setChapter(i), []);

  return (
    <>
      {/* the fixed stage */}
      <div className="stage" aria-hidden="true">
        {quality && (
          <Canvas
            dpr={quality.dpr}
            shadows={quality.shadows}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
            }}
            camera={{ fov: 22, near: 0.004, far: 60, position: [0.06, 0.042, 0.175] }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              // a touch under 1.0 — the workroom is softly lit, not bright
              gl.toneMappingExposure = 0.92;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              setReady(true);
            }}
          >
            <Suspense fallback={null}>
              <Scene
                progressRef={progressRef}
                quality={quality}
                reducedMotion={reduced}
                onChapter={handleChapter}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      <Loader ready={ready} />

      {/* typographic layer, sits above the canvas */}
      <Overlay chapter={chapter} progress={progressPct} />
      <Chrome progress={progressPct} chapter={chapter} />

      {/* the column that generates the scroll */}
      <div
        ref={scrollRef}
        className="scroll-driver"
        style={{ height: `${TOTAL_SCROLL_VH * 100}vh` }}
      />

      <CreateYourSiri />
    </>
  );
}
