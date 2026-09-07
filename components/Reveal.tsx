'use client';

/**
 * Reveal.tsx — scroll-triggered entrance.
 *
 * One observer per element, disconnected the moment it fires: nothing animates
 * twice and nothing stays subscribed while you scroll. Two behaviours only —
 * text rises a little, images open from the bottom edge and settle out of a
 * slight scale. Both are switched off wholesale by prefers-reduced-motion in
 * the stylesheet rather than here, so the markup is identical either way.
 */

import { useEffect, useRef, useState } from 'react';

type Tag = 'div' | 'section' | 'li' | 'figure' | 'article' | 'span';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms, for items revealed as a group. */
  delay?: number;
  /** Use the image reveal (the lifting curtain) rather than the text reveal. */
  image?: boolean;
  as?: Tag;
  /** Anchor target, where a section links to this element. */
  id?: string;
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  image = false,
  as: Tag = 'div',
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer (very old browsers, some crawlers): show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      id={id}
      ref={ref as React.RefObject<never>}
      className={`${image ? 'reveal-img' : 'reveal'}${shown ? ' is-in' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={{ ['--delay' as string]: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
