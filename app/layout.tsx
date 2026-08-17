import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Siri Couture — Made by hand. Made for you.',
  description:
    'A contemporary Indian couture atelier in Bhilwara. Watch a piece of cloth become a garment, one hand-made stitch at a time.',
  openGraph: {
    title: 'Siri Couture — Made by hand. Made for you.',
    description:
      'A contemporary Indian couture atelier in Bhilwara. Watch a piece of cloth become a garment, one hand-made stitch at a time.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0e0c0a',
  width: 'device-width',
  initialScale: 1,
  // the experience is scroll-driven; pinch-zoom stays available for accessibility
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
