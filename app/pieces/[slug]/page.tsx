import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Frame from '@/components/Frame';
import PieceCard from '@/components/PieceCard';
import { Buti, Scallop, StitchRule } from '@/components/Motif';
import { enquiryHref } from '@/lib/enquiry';
import { PIECES, TECHNIQUE_BY_ID, pieceBySlug } from '@/lib/catalogue';

export function generateStaticParams() {
  return PIECES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const piece = pieceBySlug(params.slug);
  if (!piece) return { title: 'Piece not found' };
  return {
    title: piece.name,
    description: `${piece.name} — ${piece.type} in ${piece.fabric}, ${piece.colour}. ${piece.note}`,
  };
}

/**
 * A single piece.
 *
 * No cart. The action is an enquiry, pre-filled with the piece name so the
 * studio knows what the message is about before they open it — which is how
 * made-to-order actually sells at this price point.
 */
export default function PiecePage({ params }: { params: { slug: string } }) {
  const piece = pieceBySlug(params.slug);
  if (!piece) notFound();

  const related = PIECES.filter((p) => p.slug !== piece.slug)
    .filter((p) => p.techniques.some((t) => piece.techniques.includes(t)))
    .slice(0, 3);

  return (
    <>
      <article className="piece">
        <div className="piece__gallery">
          <Frame tint={piece.tint} ratio="3/4" seed={3} feature label={`${piece.name} — full length`} />
          <div className="piece__thumbs">
            <Frame tint={piece.tint} ratio="1/1" seed={11} label="Detail — yoke" />
            <Frame tint={piece.tint} ratio="1/1" seed={19} label="Detail — hem" />
            <Frame tint={piece.tint} ratio="1/1" seed={27} label="On the body" />
          </div>
        </div>

        <div className="piece__info">
          <p className="eyebrow">
            <Link href={`/collections#${piece.collection.toLowerCase().replace(/\s+/g, '-')}`}>
              {piece.collection}
            </Link>
          </p>
          <h1 className="page-title">{piece.name}</h1>
          <Scallop width={280} seed={7} className="piece__scallop" />
          <p className="piece__note">{piece.note}</p>

          <dl className="spec spec--stacked">
            <div>
              <dt>Silhouette</dt>
              <dd>{piece.type}</dd>
            </div>
            <div>
              <dt>Cloth</dt>
              <dd>{piece.fabric}</dd>
            </div>
            <div>
              <dt>Colour</dt>
              <dd>
                <span className="swatch" style={{ background: piece.tint }} aria-hidden="true" />
                {piece.colour}
              </dd>
            </div>
            <div>
              <dt>Made for</dt>
              <dd>{piece.occasion.join(', ')}</dd>
            </div>
          </dl>

          <StitchRule width={420} seed={31} className="piece__rule" />

          <section className="piece__work">
            <h2 className="piece__workTitle">
              <Buti size={38} seed={4} showCentre={false} />
              The handwork on this piece
            </h2>
            <ul>
              {piece.techniques.map((t) => {
                const info = TECHNIQUE_BY_ID[t];
                return (
                  <li key={t}>
                    <Link href={`/handwork#${t}`}>
                      <strong>{info.name}</strong>
                      <span className="piece__local">{info.local}</span>
                    </Link>
                    <p>{info.line}</p>
                    <span className="piece__hours">{info.hours}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="piece__actions">
            <a
              className="btn btn--solid"
              href={enquiryHref(
                `Hello Siri Couture — I am interested in ${piece.name} (${piece.type}). Could you tell me about availability and making it to my measurements?`
              )}
            >
              Enquire about this piece
            </a>
            <Link className="btn btn--line" href="/commission">
              Commission something like it
            </Link>
          </div>

          <p className="piece__made">
            Made to order in Bhilwara. Tell us your measurements and your occasion date — we will
            tell you honestly whether we can make it in time.
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section">
          <div className="section__head section__head--row">
            <h2 className="section__title">Worked in the same techniques</h2>
          </div>
          <div className="grid">
            {related.map((p, i) => (
              <PieceCard key={p.slug} piece={p} index={i + 5} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
