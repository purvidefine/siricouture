/**
 * handTexture.ts — the artisan's hand, as a soft mass rather than a model.
 *
 * A deliberate decision: this project has no photoscanned hand, and a
 * procedurally modelled one would land exactly on the failure the brief warns
 * about — smooth plastic skin, mannequin fingers, uncanny knuckles.
 *
 * So the hand is treated the way a macro lens actually treats it. At f/2.8 on a
 * 100mm macro focused on the needle point, the hand holding that needle is
 * substantially out of focus: a warm, soft, unmistakably human mass with the
 * pinch of thumb against forefinger readable, and everything else falling away.
 * That is truthful photography, not a shortcut.
 *
 * The silhouette is built from a real embroidery grip: forearm entering low and
 * right, palm rolled slightly inward, index and thumb meeting at the needle,
 * remaining fingers curled under to steady the cloth.
 */

import * as THREE from 'three';

interface HandOptions {
  size?: number;
  blur?: number;
  /** Spread the shape outward before blurring — used for the cast shadow. */
  dilate?: number;
}

function drawHand(ctx: CanvasRenderingContext2D, size: number, dilate: number) {
  const s = size / 512;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';

  // --- forearm and wrist, entering from the bottom-right of frame
  ctx.beginPath();
  ctx.moveTo(560 * s, 560 * s);
  ctx.quadraticCurveTo(430 * s, 470 * s, 372 * s, 392 * s);
  ctx.quadraticCurveTo(330 * s, 340 * s, 352 * s, 300 * s);
  ctx.quadraticCurveTo(400 * s, 250 * s, 470 * s, 300 * s);
  ctx.quadraticCurveTo(540 * s, 360 * s, 600 * s, 470 * s);
  ctx.closePath();
  ctx.fill();

  // --- palm: rolled toward the work, not flat to camera
  ctx.beginPath();
  ctx.ellipse(330 * s, 318 * s, (96 + dilate) * s, (78 + dilate) * s, -0.62, 0, Math.PI * 2);
  ctx.fill();

  const finger = (pts: number[][], width: number) => {
    ctx.lineWidth = (width + dilate * 1.4) * s;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = ((pts[i][0] + pts[i + 1][0]) / 2) * s;
      const yc = ((pts[i][1] + pts[i + 1][1]) / 2) * s;
      ctx.quadraticCurveTo(pts[i][0] * s, pts[i][1] * s, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1][0] * s, pts[pts.length - 1][1] * s);
    ctx.stroke();
  };

  // --- index finger, reaching to the needle. Tapers toward the tip.
  finger(
    [
      [318, 288],
      [268, 236],
      [222, 190],
      [196, 162],
    ],
    38
  );
  finger(
    [
      [222, 190],
      [200, 168],
      [188, 155],
    ],
    30
  );

  // --- thumb, coming up to meet it. The pinch is the whole point of the pose.
  finger(
    [
      [300, 356],
      [252, 300],
      [214, 244],
      [190, 190],
    ],
    42
  );
  finger(
    [
      [214, 244],
      [198, 214],
      [188, 186],
    ],
    33
  );

  // --- the pinch itself: a small dense mass where thumb and index close
  ctx.beginPath();
  ctx.ellipse(190 * s, 172 * s, (26 + dilate) * s, (21 + dilate) * s, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // --- remaining fingers curled under, steadying the cloth. Shorter, lower,
  //     and each slightly different — no two fingers of a real hand match.
  finger(
    [
      [358, 348],
      [312, 396],
      [286, 432],
    ],
    36
  );
  finger(
    [
      [396, 366],
      [356, 418],
      [334, 452],
    ],
    33
  );
  finger(
    [
      [432, 388],
      [402, 434],
      [386, 464],
    ],
    28
  );
}

/**
 * Returns a canvas whose alpha channel is the hand. Colour is flat white; the
 * material tints it, so the same texture serves both the silhouette and the
 * shadow.
 */
function handCanvas(size: number, blur: number, dilate: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // blur via the 2D filter where available; fall back to stacked offsets.
  // Probed at runtime rather than by type, because older Safari exposes the
  // property but ignores the value.
  const supportsFilter = (() => {
    try {
      ctx.filter = 'blur(1px)';
      const ok = ctx.filter === 'blur(1px)';
      ctx.filter = 'none';
      return ok;
    } catch {
      return false;
    }
  })();

  if (supportsFilter) {
    ctx.filter = `blur(${blur}px)`;
    drawHand(ctx, size, dilate);
    ctx.filter = 'none';
  } else {
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 10; i++) {
      ctx.save();
      const a = (i / 10) * Math.PI * 2;
      ctx.translate(Math.cos(a) * blur * 0.6, Math.sin(a) * blur * 0.6);
      drawHand(ctx, size, dilate);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  return c;
}

export function makeHandTexture(opts: HandOptions = {}): THREE.CanvasTexture {
  const size = opts.size ?? 512;
  const t = new THREE.CanvasTexture(handCanvas(size, opts.blur ?? 16, opts.dilate ?? 0));
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function makeHandShadowTexture(opts: HandOptions = {}): THREE.CanvasTexture {
  const size = opts.size ?? 512;
  const t = new THREE.CanvasTexture(handCanvas(size, opts.blur ?? 22, opts.dilate ?? 4));
  t.needsUpdate = true;
  return t;
}
