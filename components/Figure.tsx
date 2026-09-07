/**
 * Figure.tsx — the editorial image.
 *
 * An image on this site is not a card: no radius, no shadow, no border, no
 * padding. It holds its aspect ratio so the page never reflows as photographs
 * load, and it goes through next/image so each slot requests a source width
 * that suits it.
 *
 * A slot with no photograph yet renders a plain field naming the shot that
 * belongs there — legible enough that the studio can see what it still owes,
 * quiet enough to sit in a finished-looking page.
 */

import Image from 'next/image';

interface FigureProps {
  src?: string;
  alt?: string;
  /** Any CSS aspect ratio: '3/4', '4/5', '1/1', '16/9'. */
  ratio?: string;
  /** Rendered width, so next/image can pick a source. */
  sizes?: string;
  priority?: boolean;
  caption?: string;
  className?: string;
  /** Slow zoom on hover — for links into a collection or piece. */
  hover?: boolean;
  /** Describes the photograph this slot is waiting for. */
  pending?: string;
  /** CSS object-position, when the crop needs steering. */
  position?: string;
}

export default function Figure({
  src,
  alt = '',
  ratio = '3/4',
  sizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw',
  priority = false,
  caption,
  className = '',
  hover = false,
  pending,
  position,
}: FigureProps) {
  const body = src ? (
    <div
      className={`fig${hover ? ' fig--hover' : ''}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  ) : (
    <div
      className={`fig fig--empty${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={pending ? `Photograph to come: ${pending}` : 'Photograph to come'}
    >
      <span className="fig__pending">{pending ?? 'Photograph to come'}</span>
    </div>
  );

  if (!caption) return body;

  return (
    <figure style={{ margin: 0 }}>
      {body}
      <figcaption className="fig__cap">{caption}</figcaption>
    </figure>
  );
}
