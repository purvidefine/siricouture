/**
 * textures.ts — every surface in this scene is generated in code.
 *
 * There are no downloaded texture maps. The cloth is built as an actual plain
 * weave: warp threads and weft threads crossing over and under each other, with
 * per-thread thickness variation (handloom cotton is slubby — that unevenness is
 * exactly what separates it from a printed plane). From that height field we
 * derive a normal map, so at macro range the light catches individual threads.
 */

import * as THREE from 'three';

type Rng = () => number;

function mulberry(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise — used for fibre fuzz and tonal drift in the cloth. */
function valueNoise(size: number, cells: number, rng: Rng): Float32Array {
  const grid = new Float32Array((cells + 1) * (cells + 1));
  for (let i = 0; i < grid.length; i++) grid[i] = rng();

  const out = new Float32Array(size * size);
  const scale = cells / size;
  const smooth = (t: number) => t * t * (3 - 2 * t);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = x * scale;
      const fy = y * scale;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = smooth(fx - x0);
      const ty = smooth(fy - y0);
      const i00 = grid[y0 * (cells + 1) + x0];
      const i10 = grid[y0 * (cells + 1) + x0 + 1];
      const i01 = grid[(y0 + 1) * (cells + 1) + x0];
      const i11 = grid[(y0 + 1) * (cells + 1) + x0 + 1];
      const a = i00 + (i10 - i00) * tx;
      const b = i01 + (i11 - i01) * tx;
      out[y * size + x] = a + (b - a) * ty;
    }
  }
  return out;
}

function fbm(size: number, rng: Rng, octaves = 4, baseCells = 4): Float32Array {
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  let cells = baseCells;
  for (let o = 0; o < octaves; o++) {
    const layer = valueNoise(size, cells, rng);
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * amp;
    total += amp;
    amp *= 0.5;
    cells *= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/**
 * The weave height field.
 *
 * Plain weave: at every crossing, either the warp passes over the weft or the
 * weft passes over the warp, alternating like a checkerboard. Each thread gets
 * its own thickness multiplier so the cloth reads as handloom, not industrial.
 */
function weaveHeight(size: number, threads: number, rng: Rng): Float32Array {
  const h = new Float32Array(size * size);
  const cell = size / threads;

  // per-thread thickness — the slub
  const warpGauge = new Float32Array(threads);
  const weftGauge = new Float32Array(threads);
  for (let i = 0; i < threads; i++) {
    warpGauge[i] = 0.78 + rng() * 0.44;
    weftGauge[i] = 0.78 + rng() * 0.44;
  }
  // slow drift so thick threads cluster, as they do on a real loom
  const drift = fbm(threads, rng, 2, 2);
  for (let i = 0; i < threads; i++) {
    warpGauge[i] *= 0.85 + drift[i] * 0.3;
    weftGauge[i] *= 0.85 + drift[(i * 7) % threads] * 0.3;
  }

  const fuzz = fbm(size, rng, 4, 16);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wi = Math.floor(x / cell) % threads;
      const fi = Math.floor(y / cell) % threads;

      // position across the thread's own width, -1..1
      const u = ((x % cell) / cell) * 2 - 1;
      const v = ((y % cell) / cell) * 2 - 1;

      // round cross-section, scaled by that thread's gauge
      const gw = warpGauge[wi];
      const gf = weftGauge[fi];
      const warpProfile = Math.max(0, 1 - (u * u) / (gw * gw));
      const weftProfile = Math.max(0, 1 - (v * v) / (gf * gf));

      const warpH = Math.sqrt(warpProfile) * gw;
      const weftH = Math.sqrt(weftProfile) * gf;

      // checkerboard interlacing
      const warpOver = (wi + fi) % 2 === 0;
      let height: number;
      if (warpOver) {
        height = warpH * 0.62 + weftH * 0.24;
      } else {
        height = weftH * 0.62 + warpH * 0.24;
      }

      // fibre fuzz breaks the mathematical cleanliness of the profile
      height += (fuzz[y * size + x] - 0.5) * 0.16;

      h[y * size + x] = Math.min(1, Math.max(0, height * 0.62 + 0.2));
    }
  }
  return h;
}

/** Sobel the height field into a tangent-space normal map. */
function heightToNormal(h: Float32Array, size: number, strength: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(size * size * 4);
  const at = (x: number, y: number) => {
    const xx = (x + size) % size;
    const yy = (y + size) % size;
    return h[yy * size + xx];
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = at(x - 1, y - 1);
      const t = at(x, y - 1);
      const tr = at(x + 1, y - 1);
      const l = at(x - 1, y);
      const r = at(x + 1, y);
      const bl = at(x - 1, y + 1);
      const b = at(x, y + 1);
      const br = at(x + 1, y + 1);

      const dx = tl + 2 * l + bl - (tr + 2 * r + br);
      const dy = tl + 2 * t + tr - (bl + 2 * b + br);

      let nx = dx * strength;
      let ny = dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      const nzn = nz / len;

      const i = (y * size + x) * 4;
      data[i] = (nx * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * 0.5 + 0.5) * 255;
      data[i + 2] = (nzn * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  return data;
}

function canvasFrom(data: Uint8ClampedArray, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  // build through createImageData rather than the ImageData constructor: it
  // sidesteps the ArrayBuffer/SharedArrayBuffer typing split and is no slower
  const img = ctx.createImageData(size, size);
  img.data.set(data);
  ctx.putImageData(img, 0, 0);
  return c;
}

function tex(canvas: HTMLCanvasElement, repeat: number, srgb: boolean): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export interface FabricTextures {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
  dispose: () => void;
}

/**
 * Build the cloth. `size` is texture resolution, `repeat` how many times the
 * weave tiles across the panel — together they set the apparent thread count.
 */
export function makeFabricTextures(opts: {
  size?: number;
  threads?: number;
  repeat?: number;
  base?: string;
  seed?: number;
  normalStrength?: number;
}): FabricTextures {
  const size = opts.size ?? 1024;
  const threads = opts.threads ?? 56;
  const repeat = opts.repeat ?? 6;
  const seed = opts.seed ?? 7;
  const rng = mulberry(seed);

  const height = weaveHeight(size, threads, rng);
  const tone = fbm(size, mulberry(seed + 99), 4, 3);
  const dirt = fbm(size, mulberry(seed + 501), 5, 8);

  const base = new THREE.Color(opts.base ?? '#e8dfd0');

  // albedo: base colour shaded by the weave itself plus slow tonal drift, so the
  // cloth is never one flat value
  const albedo = new Uint8ClampedArray(size * size * 4);
  const rough = new Uint8ClampedArray(size * size * 4);
  const ao = new Uint8ClampedArray(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const h = height[i];
    const t = tone[i];
    const d = dirt[i];

    // threads sitting on top catch light; the valleys between them go warm-dark
    const shade = 0.84 + h * 0.22;
    const drift = 0.94 + t * 0.12;

    const r = base.r * shade * drift;
    const g = base.g * shade * drift * (0.995 + d * 0.01);
    const b = base.b * shade * drift * (0.985 + d * 0.02);

    const j = i * 4;
    albedo[j] = Math.min(255, r * 255);
    albedo[j + 1] = Math.min(255, g * 255);
    albedo[j + 2] = Math.min(255, b * 255);
    albedo[j + 3] = 255;

    // raised thread crowns are slightly burnished; recesses stay matte and fuzzy
    const rr = 0.94 - h * 0.26 + (d - 0.5) * 0.09;
    const rv = Math.min(255, Math.max(0, rr * 255));
    rough[j] = rv;
    rough[j + 1] = rv;
    rough[j + 2] = rv;
    rough[j + 3] = 255;

    // contact shadow where threads dive under each other
    const av = Math.min(255, Math.max(0, (0.62 + h * 0.42) * 255));
    ao[j] = av;
    ao[j + 1] = av;
    ao[j + 2] = av;
    ao[j + 3] = 255;
  }

  const normal = heightToNormal(height, size, opts.normalStrength ?? 2.6);

  const mapT = tex(canvasFrom(albedo, size), repeat, true);
  const normalT = tex(canvasFrom(normal, size), repeat, false);
  const roughT = tex(canvasFrom(rough, size), repeat, false);
  const aoT = tex(canvasFrom(ao, size), repeat, false);

  return {
    map: mapT,
    normalMap: normalT,
    roughnessMap: roughT,
    aoMap: aoT,
    dispose: () => {
      mapT.dispose();
      normalT.dispose();
      roughT.dispose();
      aoT.dispose();
    },
  };
}

/**
 * Thread texture: fine diagonal twist. Real embroidery floss is several plies
 * spiralling around each other, and at this range you can see that spiral catch
 * the light along the length of every stitch.
 */
export function makeThreadTexture(opts: { size?: number; plies?: number; metallic?: boolean }) {
  const size = opts.size ?? 256;
  const plies = opts.plies ?? 3;
  const metallic = opts.metallic ?? false;

  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = metallic ? '#8a7040' : '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // the ply spiral, drawn as banding across the thread's circumference
  const bands = plies * 9;
  for (let i = 0; i < bands; i++) {
    const t = i / bands;
    const shade = 0.74 + 0.26 * Math.abs(Math.sin(t * Math.PI * plies));
    const v = Math.round(shade * 255);
    ctx.strokeStyle = metallic
      ? `rgba(${v}, ${Math.round(v * 0.84)}, ${Math.round(v * 0.5)}, 1)`
      : `rgba(${v},${v},${v},1)`;
    ctx.lineWidth = size / bands + 1;
    ctx.beginPath();
    const y = t * size;
    ctx.moveTo(-size * 0.2, y);
    ctx.lineTo(size * 1.2, y + size * 0.34);
    ctx.stroke();
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * A small studio environment built in code: a soft key from a north window, a
 * warm bounce off the worktable, deep falloff everywhere else. Used as the env
 * map so metal thread and the needle have something real to reflect.
 */
export function makeAtelierEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size * 2;
  c.height = size;
  const ctx = c.getContext('2d')!;

  // sky-to-floor gradient: cool daylight above, warm timber bounce below
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#c9cdd2');
  grad.addColorStop(0.42, '#a89e94');
  grad.addColorStop(0.62, '#8a7a68');
  grad.addColorStop(1, '#5b4e42');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);

  // the window — the single bright source the needle will catch
  const wx = size * 0.62;
  const wy = size * 0.2;
  const win = ctx.createRadialGradient(wx, wy, 4, wx, wy, size * 0.42);
  win.addColorStop(0, 'rgba(255,252,246,1)');
  win.addColorStop(0.5, 'rgba(255,246,232,0.5)');
  win.addColorStop(1, 'rgba(255,246,232,0)');
  ctx.fillStyle = win;
  ctx.fillRect(0, 0, size * 2, size);

  // a dim warm lamp opposite, so metal reads as round rather than one-sided
  const lx = size * 1.5;
  const ly = size * 0.44;
  const lamp = ctx.createRadialGradient(lx, ly, 2, lx, ly, size * 0.26);
  lamp.addColorStop(0, 'rgba(255,206,150,0.85)');
  lamp.addColorStop(1, 'rgba(255,206,150,0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, size * 2, size);

  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(t).texture;
  pmrem.dispose();
  t.dispose();
  return env;
}

/**
 * Soft elliptical alpha mask, used for the hand's cast shadow and for the
 * depth-of-field vignette. Generated rather than shipped as a PNG.
 */
export function makeSoftMask(size = 256, falloff = 1.6): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const d = Math.min(1, Math.hypot(dx, dy));
      const a = Math.pow(1 - d, falloff);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 0;
      img.data[i + 3] = Math.max(0, a) * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
