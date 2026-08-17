import type { Metadata, Viewport } from 'next';
import { Footer, Nav } from '@/components/Chrome';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://siri-couture.vercel.app'),
  title: {
    default: 'Siri Couture — Ethereal pieces, handcrafted',
    template: '%s · Siri Couture',
  },
  description:
    'Modern Indian occasion wear, hand-embroidered in Bhilwara. Thread work, mirror work and zari on organza, chanderi and silk — made to your measurements.',
  openGraph: {
    title: 'Siri Couture — Ethereal pieces, handcrafted',
    description:
      'Modern Indian occasion wear, hand-embroidered in Bhilwara. Slow fashion, stitched in sunshine.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
