import type { Metadata } from 'next';
import PieceCard from '@/components/PieceCard';
import Reveal from '@/components/Reveal';
import { COLLECTIONS, OCCASIONS, PIECES } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Kurta sets, lehengas, anarkalis and dresses — hand-embroidered in Bhilwara. Browse by collection or by occasion.',
};

/**
 * The catalogue.
 *
 * One grid rather than six near-empty sections: the range currently runs one
 * piece per collection, so grouping them into separate blocks left a lonely
 * card under every heading. Each card still carries its collection name and its
 * collection's anchor, so links from elsewhere on the site land in the right
 * place.
 */
export default function CollectionsPage() {
  return (
    <>
      <header className="wrap page-head">
        <p className="eyebrow">The range</p>
        <h1 className="page-title">Collections</h1>
        <p className="page-lead">
          Six collections, every piece made to order — and every one able to be remade in your
          colour and your measurements.
        </p>
        <ul className="occasions" aria-label="Occasions we make for">
          {OCCASIONS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </header>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="grid">
          {PIECES.map((p, i) => {
            const collection = COLLECTIONS.find((c) => c.name === p.collection);
            return (
              <PieceCard key={p.slug} piece={p} index={i} showCollection id={collection?.slug} />
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <Reveal className="head">
          <p className="eyebrow">The collections</p>
          <h2 className="head__title">What each one is for.</h2>
        </Reveal>
        <ol className="steps">
          {COLLECTIONS.map((c, i) => (
            <Reveal as="li" className="step" key={c.slug} delay={i * 50}>
              <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__t">{c.name}</h3>
              <p className="step__d">{c.line}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
