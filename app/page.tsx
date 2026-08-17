import dynamic from 'next/dynamic';
import NoScript from '@/components/ui/NoScript';

// the whole experience is client-side WebGL; there is nothing to server-render
const Experience = dynamic(() => import('@/components/Experience'), { ssr: false });

export default function Page() {
  return (
    <main id="top">
      <Experience />
      <NoScript />
    </main>
  );
}
