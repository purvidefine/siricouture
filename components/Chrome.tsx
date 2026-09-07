'use client';

/**
 * Chrome.tsx — navigation and footer.
 *
 * The bar carries nothing but the wordmark, five words and one action. Over the
 * hero it is transparent and white; the moment the page moves it settles onto
 * ivory. On small screens the links become a full-screen menu set in the
 * display face, because a cramped dropdown is the fastest way to make a couture
 * site look like a template.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { enquiryHref } from '@/lib/enquiry';

const LINKS = [
  { href: '/collections', label: 'Collections' },
  { href: '/commission', label: 'Bespoke' },
  { href: '/handwork', label: 'The Craft' },
  { href: '/atelier', label: 'The Atelier' },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = path === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A full-screen menu must not leave the page scrolling underneath it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const over = isHome && !scrolled && !open;

  return (
    <>
      <header className={`nav ${over ? 'nav--over' : 'nav--solid'}`}>
        <div className="nav__bar">
          <Link href="/" className="nav__mark">
            Siri Couture
          </Link>

          <nav className="nav__links" aria-label="Main">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={path?.startsWith(l.href) ? 'is-current' : ''}
              >
                {l.label}
              </Link>
            ))}
            <a className="nav__cta" href={enquiryHref()}>
              Enquire
            </a>
          </nav>

          <button
            type="button"
            className={`nav__toggle${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`menu${open ? ' is-open' : ''}`} id="menu" hidden={!open}>
        <nav className="menu__links" aria-label="Main">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ ['--delay' as string]: `${120 + i * 70}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/commission"
            style={{ ['--delay' as string]: `${120 + LINKS.length * 70}ms` }}
          >
            <em>Start your Siri story</em>
          </Link>
        </nav>

        <div className="menu__foot">
          <p className="eyebrow">Bhilwara, Rajasthan</p>
          <a className="link" href={BRAND.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const { address } = BRAND;

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__grid">
          <div className="foot__col">
            <p className="foot__mark">Siri Couture</p>
            <p className="foot__line">
              Ethereal pieces, handcrafted. Made in Bhilwara, worn everywhere.
            </p>
          </div>

          <div className="foot__col">
            <h3>The studio</h3>
            <address>
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}, {address.state} {address.pin}
            </address>
          </div>

          <div className="foot__col">
            <h3>Bespoke</h3>
            <p>
              Every piece can be made to your measurements, in your colour, with the handwork you
              choose.
            </p>
            <Link className="foot__link" href="/commission">
              Start your Siri story
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
          <span>Handmade in Bhilwara, worn everywhere</span>
          <span>&copy; {new Date().getFullYear()} Siri Couture</span>
        </p>
      </div>
    </footer>
  );
}
