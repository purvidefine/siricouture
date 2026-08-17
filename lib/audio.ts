/**
 * audio.ts — tactile sound, synthesised.
 *
 * There is no music. Every sound here is generated with the Web Audio API and is
 * meant to be almost subliminal: the tick of a needle breaking the weave, the dry
 * rasp of thread dragging through cloth, the room tone of a quiet workroom.
 *
 * Sound is off until the visitor asks for it. Nothing autoplays.
 */

type Ctx = AudioContext & { _siriMaster?: GainNode };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let ambience: { stop: () => void } | null = null;
let enabled = false;

function ensure(): Ctx | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC() as Ctx;
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  return ctx;
}

/** Short burst of filtered noise — the body of every tactile sound here. */
function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  // pink-ish noise: cheaper than a proper filter bank and warmer than white
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099;
    b1 = 0.963 * b1 + w * 0.2965;
    b2 = 0.57 * b2 + w * 1.0526;
    data[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
  }
  return buf;
}

/**
 * The needle piercing the weave: a very short, high, dry click with almost no
 * tail — the sound of a fine point separating two threads rather than cutting.
 */
export function needlePierce(strength = 1) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.045);

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2600 + Math.random() * 900;
  bp.Q.value = 3.5;

  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16 * strength, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + 0.06);
}

/**
 * Thread being drawn through cloth: a soft rasp that rises slightly in pitch as
 * the length shortens, then stops dead when the stitch seats.
 */
export function threadPull(length = 1) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;

  const dur = 0.16 + length * 0.14;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur + 0.05);

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900;
  bp.Q.value = 1.4;

  const t = c.currentTime;
  bp.frequency.linearRampToValueAtTime(1500 + Math.random() * 300, t + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.03);
  g.gain.linearRampToValueAtTime(0.032, t + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

/** Cloth shifting on the table when the hand repositions it. */
export function fabricShift() {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.34);

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 700;

  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.038, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

  src.connect(lp).connect(g).connect(master);
  src.start(t);
  src.stop(t + 0.35);
}

/** Room tone: a barely-there bed so the silence has a place rather than a void. */
function startAmbience() {
  const c = ensure();
  if (!c || !master || ambience) return;

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 4);
  src.loop = true;

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 340;

  const g = c.createGain();
  g.gain.value = 0.02;

  src.connect(lp).connect(g).connect(master);
  src.start();

  ambience = {
    stop: () => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      src.disconnect();
    },
  };
}

export function setEnabled(on: boolean) {
  const c = ensure();
  if (!c || !master) return;
  enabled = on;
  if (on) {
    if (c.state === 'suspended') void c.resume();
    startAmbience();
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.linearRampToValueAtTime(1, c.currentTime + 0.6);
  } else {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.linearRampToValueAtTime(0, c.currentTime + 0.3);
  }
}

export function isEnabled() {
  return enabled;
}
