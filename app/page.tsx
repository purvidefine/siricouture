/**
 * Home.
 *
 * Order of argument: what she makes -> what was done by hand -> the collections
 * -> how to commission. Handwork appears in the first screen, not three sections
 * down, because it is the reason to choose her over a mill-made suit set.
 */

import Link from 'next/link';
import Frame from '@/components/Frame';
import PieceCard from '@/components/PieceCard';
import { Buti, Scallop, StitchRule, Vine } from '@/components/Motif';
import { enquiryHref } from '@/lib/enquiry';
import { COLLECTIONS, PIECES, TECHNIQUES } from '@/lib/catalogue';

export default function Home() {
  const featured = PIECES.slice(0, 4);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Bhilwara, Rajasthan</p>
          <h1 className="hero__title">
            Ethereal pieces,
            <br />
            <em>handcrafted.</em>
          </h1>
          <Scallop width={420} className="hero__scallop" seed={4} />
          <p className="hero__sub">
            Slow fashion, stitched in sunshine. Occasion wear for the wedding you are attending, the
            festival you are dressing for, and the ordinary day you want to feel like something.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--solid" href="/collections">
              See the collections
            </Link>
            <a className="btn btn--line" href={enquiryHref()}>
              Commission a piece
            </a>
          </div>
        </div>

        <div className="hero__images">
          <Frame tint="#C8407E" ratio="3/4" seed={2} feature label="Hero — Gulbahar, full length" />
          <Frame tint="#D9AE3B" ratio="4/5" seed={8} label="Detail — citrine hem, mirror work" className="hero__inset" />
        </div>
      </section>

      <StitchRule width={1400} className="section-rule" seed={21} />

      {/* ------------------------------------------------------ handwork */}
      <section className="section handwork-intro">
        <div className="section__head">
          <Buti size={72} seed={6} />
          <h2 className="section__title">What was done by hand</h2>
          <p className="section__lead">
            Every piece that leaves this studio has been worked on by a person, for hours. These are
            the five techniques it will have been worked in — and on every piece, we tell you which.
          </p>
        </div>

        <ul className="techniques">
          {TECHNIQUES.map((t, i) => (
            <li key={t.id} className="technique">
              <span className="technique__local">{t.local}</span>
              <h3 className="technique__name">{t.name}</h3>
              <p className="technique__line">{t.line}</p>
              <span className="technique__hours">{t.hours}</span>
              <StitchRule width={320} seed={i * 13 + 2} className="technique__rule" />
            </li>
          ))}
        </ul>

        <Link className="link-more" href="/handwork">
          How each one is made
        </Link>
      </section>

      <Vine width={1000} className="section-vine" seed={17} />

      {/* ----------------------------------------------------- collections */}
      <section className="section">
        <div className="section__head section__head--row">
          <h2 className="section__title">Collections</h2>
          <Link className="link-more" href="/collections">
            All pieces
          </Link>
        </div>

        <ul className="collections">
          {COLLECTIONS.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/collections#${c.slug}`} className="collection">
                <span className="collection__dot" style={{ background: c.tint }} aria-hidden="true" />
                <span className="collection__name">{c.name}</span>
                <span className="collection__line">{c.line}</span>
                <Buti size={40} seed={i * 5 + 1} className="collection__buti" showCentre={false} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- pieces */}
      <section className="section">
        <div className="section__head section__head--row">
          <h2 className="section__title">Recently made</h2>
        </div>
        <div className="grid">
          {featured.map((p, i) => (
            <PieceCard key={p.slug} piece={p} index={i} />
          ))}
        </div>
      </section>

      <StitchRule width={1400} className="section-rule" seed={55} />

      {/* ---------------------------------------------------- commission */}
      <section className="section commission-cta">
        <div className="commission-cta__text">
          <p className="eyebrow">Made for one person</p>
          <h2 className="section__title">
            Most of what we make
            <br />
            <em>begins as a conversation.</em>
          </h2>
          <p className="section__lead">
            Bring us the occasion, a colour, a photograph, a piece you already love. We will draw the
            handwork for it, make it to your measurements, and tell you honestly how long it takes.
          </p>
          <a className="btn btn--solid" href={enquiryHref()}>
            Start a commission
          </a>
        </div>
        <Frame tint="#B7A3D6" ratio="4/5" seed={14} label="Studio — hands at work on a panel" />
      </section>
    </>
  );
}
