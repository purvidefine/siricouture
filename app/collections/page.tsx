import type { Metadata } from 'next';
import PieceCard from '@/components/PieceCard';
import { Buti, StitchRule } from '@/components/Motif';
import { COLLECTIONS, OCCASIONS, PIECES } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Kurta sets, lehengas, anarkalis and dresses — hand-embroidered in Bhilwara. Browse by collection or by occasion.',
};

/**
 * The catalogue.
 *
 * Grouped by collection rather than paginated, because the whole range is small
 * enough to see at once and grouping is how she talks about the work herself.
 */
export default function CollectionsPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">The range</p>
        <h1 className="page-title">Collections</h1>
        <p className="page-lead">
          Eight pieces across six collections. Every one is made to order, and every one can be
          remade in your colour and your measurements.
        </p>
        <ul className="occasions" aria-label="Occasions we make for">
          {OCCASIONS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </header>

      {COLLECTIONS.map((c, ci) => {
        const pieces = PIECES.filter((p) => p.collection === c.name);
        if (pieces.length === 0) return null;
        return (
          <section key={c.slug} id={c.slug} className="section collection-block">
            <div className="collection-block__head">
              <Buti size={58} seed={ci * 9 + 2} />
              <div>
                <h2 className="section__title">{c.name}</h2>
                <p className="section__lead">{c.line}</p>
              </div>
            </div>
            <StitchRule width={1200} seed={ci * 7 + 5} className="section-rule" />
            <div className="grid">
              {pieces.map((p, i) => (
                <PieceCard key={p.slug} piece={p} index={ci * 4 + i} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
