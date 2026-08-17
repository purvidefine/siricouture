/**
 * Frame.tsx — the image placeholder.
 *
 * The studio's photography has not been supplied yet, so every image slot on the
 * site renders this instead: a correctly-proportioned block carrying the piece's
 * own colour, a hand-worked corner motif, and a visible label saying which shot
 * belongs there.
 *
 * It is deliberately NOT a grey box. It holds the exact space and aspect the real
 * photograph will occupy, so dropping images in later changes nothing about the
 * layout — and the placeholder is legible enough that the client can see what
 * they still owe.
 */

import { Buti } from './Motif';

interface FrameProps {
  /** Dominant colour of the piece, used to tint the placeholder. */
  tint?: string;
  ratio?: '3/4' | '4/5' | '1/1' | '16/9';
  /** What photograph belongs in this slot. */
  label?: string;
  /** Optional real image, once supplied. */
  src?: string;
  alt?: string;
  className?: string;
  seed?: number;
  /** Larger motif and label, for hero-scale slots. */
  feature?: boolean;
}

export default function Frame({
  tint = '#E5DCCE',
  ratio = '3/4',
  label,
  src,
  alt = '',
  className = '',
  seed = 3,
  feature = false,
}: FrameProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <div className={`frame ${className}`} style={{ aspectRatio: ratio }}>
        <img className="frame__img" src={src} alt={alt} loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`frame frame--empty ${feature ? 'frame--feature' : ''} ${className}`}
      style={{ aspectRatio: ratio, ['--tint' as string]: tint }}
      role="img"
      aria-label={label ? `Photograph pending: ${label}` : 'Photograph pending'}
    >
      <span className="frame__wash" aria-hidden="true" />
      <Buti size={feature ? 168 : 104} seed={seed} className="frame__motif" />
      {label && <span className="frame__label">{label}</span>}
    </div>
  );
}
