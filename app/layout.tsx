import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import { Footer, Nav } from '@/components/Chrome';
import './globals.css';

/**
 * Typography.
 *
 * A didone display face against a geometric sans — the pairing fashion titles
 * have used for a century, and the reason a page reads as editorial before a
 * single image loads. Bodoni Moda carries the high stroke contrast at large
 * sizes; Jost holds the small uppercase labels and body copy without
 * competing. Both are self-hosted by next/font, so there is no flash of
 * fallback text and no request to a font host at runtime.
 */
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://siri-couture.vercel.app'),
  title: {
    default: 'Siri Couture — Hand embroidery, Bhilwara',
    template: '%s · Siri Couture',
  },
  description:
    'Modern Indian occasion wear, embroidered by hand in Bhilwara. Thread work, mirror work and zari on organza, chanderi and silk — made to your measurements.',
  openGraph: {
    title: 'Siri Couture — Hand embroidery, Bhilwara',
    description:
      'Modern Indian occasion wear, embroidered by hand in Bhilwara. Made once, made to order, made for you.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
