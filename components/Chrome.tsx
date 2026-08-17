'use client';

/**
 * Chrome.tsx — navigation and footer.
 *
 * The nav carries a buti as its mark, so the first thing on every page is a
 * piece of handwork. Enquiry is a persistent action rather than a page buried
 * in the menu, because commissioning is what most of her clients come to do.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { enquiryHref } from '@/lib/enquiry';
import { Buti, StitchRule } from './Motif';

const LINKS = [
  { href: '/collections', label: 'Collections' },
  { href: '/handwork', label: 'The Handwork' },
  { href: '/atelier', label: 'Atelier' },
  { href: '/commission', label: 'Commission' },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav__bar">
        <Link href="/" className="nav__mark" onClick={() => setOpen(false)}>
          <Buti size={30} seed={5} showCentre={false} className="nav__buti" />
          <span>SIRI COUTURE</span>
        </Link>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path?.startsWith(l.href) ? 'is-current' : ''}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a className="nav__cta" href={enquiryHref()} onClick={() => setOpen(false)}>
            Enquire
          </a>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      <StitchRule width={1400} className="nav__rule" seed={12} />
    </header>
  );
}

export function Footer() {
  const { address } = BRAND;
  return (
    <footer className="foot">
      <StitchRule width={1400} className="foot__rule" seed={44} />
      <div className="foot__grid">
        <div className="foot__col">
          <Buti size={54} seed={9} />
          <p className="foot__mark">SIRI COUTURE</p>
          <p className="foot__line">Ethereal pieces, handcrafted.</p>
        </div>

        <div className="foot__col">
          <h3>Visit the studio</h3>
          <address>
            {address.line1}
            <br />
            {address.line2}
            <br />
            {address.city}, {address.state} {address.pin}
          </address>
        </div>

        <div className="foot__col">
          <h3>Commission</h3>
          <p>
            Every piece can be made to your measurements, in your colour, with the handwork you
            choose.
          </p>
          <Link className="foot__link" href="/commission">
            Start a commission
          </Link>
        </div>

        <div className="foot__col">
          <h3>Elsewhere</h3>
          <a className="foot__link" href={BRAND.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          {BRAND.email && (
            <a className="foot__link" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>
          )}
        </div>
      </div>

      <p className="foot__base">
        <span>Handmade in Bhilwara, worn everywhere.</span>
        <span>&copy; {new Date().getFullYear()} Siri Couture</span>
      </p>
    </footer>
  );
}
