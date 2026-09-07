import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import PieceCard from '@/components/PieceCard';
import Reveal from '@/components/Reveal';
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
 * studio knows what the message is about before opening it — which is how
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
      <article className="wrap piece">
        <div className="piece__gallery">
          <Reveal image>
            <Figure
              src={piece.images[0]}
              alt={`${piece.name} — ${piece.type}`}
              ratio={piece.ratio}
              sizes="(max-width: 1000px) 100vw, 58vw"
              priority
              pending={`${piece.name} — full-length`}
            />
          </Reveal>

          {piece.images.length > 1 && (
            <div className="piece__thumbs">
              {piece.images.slice(1).map((src, i) => (
                <Reveal key={src} image delay={i * 70}>
                  <Figure
                    src={src}
                    alt={`${piece.name}, view ${i + 2}`}
                    ratio="3/4"
                    sizes="(max-width: 1000px) 50vw, 29vw"
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="piece__info">
          <p className="eyebrow">
            <Link href={`/collections#${piece.collection.toLowerCase().replace(/\s+/g, '-')}`}>
              {piece.collection}
            </Link>
          </p>
          <h1 className="page-title" style={{ marginTop: '0.6rem' }}>
            {piece.name}
          </h1>
          <p className="piece__note">{piece.note}</p>

          <dl className="spec">
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

          <section className="piece__work">
            <p className="eyebrow">The handwork on this piece</p>
            <ul>
              {piece.techniques.map((t) => {
                const info = TECHNIQUE_BY_ID[t];
                return (
                  <li key={t}>
                    <Link href={`/handwork#${t}`}>
                      <strong>{info.name}</strong>
                    </Link>
                    <p style={{ color: 'var(--ink-2)' }}>{info.line}</p>
                    <span className="piece__hours">
                      {info.local} · {info.hours}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="piece__actions">
            <a
              className="btn btn--solid"
              href={enquiryHref(
                `Hello Siri Couture — I am interested in ${piece.name} (${piece.type}). Could you tell me about making it to my measurements?`
              )}
            >
              Enquire about this piece
            </a>
            <Link className="btn" href="/commission">
              Commission something like it
            </Link>
          </div>

          <p className="form__note" style={{ marginTop: '1.4rem' }}>
            Made to order in Bhilwara. Tell us your measurements and your occasion date and we will
            say honestly whether we can make it in time.
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="wrap section">
          <div className="head head--split">
            <h2 className="head__title">Worked in the same techniques</h2>
            <Link className="link" href="/collections">
              All pieces
            </Link>
          </div>
          <div className="grid">
            {related.map((p, i) => (
              <PieceCard key={p.slug} piece={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
