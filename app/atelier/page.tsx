import type { Metadata } from 'next';
import Figure from '@/components/Figure';
import Reveal from '@/components/Reveal';
import { enquiryHref } from '@/lib/enquiry';
import { BRAND } from '@/lib/brand';
import { TECHNIQUES, pieceBySlug } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'The Atelier',
  description:
    'Siri Couture is a small hand-embroidery studio in Bhilwara, Rajasthan. Slow fashion, made to order, stitched by hand.',
};

const VALUES = [
  {
    t: 'Made to order',
    d: 'Almost nothing is made in advance. Your piece is cut for you, which is why we ask for measurements rather than a size.',
  },
  {
    t: 'Handwork named, every time',
    d: 'On every piece on this site the techniques are listed by name. If it is not listed, it is not on there.',
  },
  {
    t: 'Honest lead times',
    d: 'If your date is too close for the work you want, we will say so and offer something we can finish well.',
  },
  {
    t: 'Worn everywhere',
    d: 'Made in Bhilwara and shipped wherever you are. Overseas orders are made to measurement and sent with a fit sheet.',
  },
];

/**
 * The Atelier.
 *
 * The credibility page: where the studio is, how it works, and what "slow
 * fashion" means in hours rather than as a slogan.
 *
 * TODO(studio): the founder's name and story are not in the reference material.
 * The page is written to read correctly without them and to take a paragraph
 * without restructuring.
 */
export default function AtelierPage() {
  const { address } = BRAND;
  const detail = pieceBySlug('gulbahar')!;

  return (
    <>
      <header className="wrap page-head">
        <p className="eyebrow">Bhilwara, Rajasthan</p>
        <h1 className="page-title">Inside the atelier</h1>
        <p className="page-lead">
          A small studio in a textile town, making occasion wear the slow way: drawn, cut,
          embroidered by hand and finished one piece at a time.
        </p>
      </header>

      <section className="wrap section">
        <div className="story">
          <div className="story__row story__row--a">
            <Reveal className="story__media" image>
              <Figure
                ratio="4/5"
                sizes="(max-width: 900px) 100vw, 40vw"
                pending="The studio — worktable, frames, thread spools"
              />
            </Reveal>
            <Reveal className="story__text" delay={120}>
              <p className="eyebrow">Slow fashion, in hours</p>
              <h2 className="head__title" style={{ marginBlock: '0.8rem 1.2rem' }}>
                What the words actually mean.
              </h2>
              <p className="lead">
                &ldquo;Slow fashion&rdquo; is used loosely enough to mean nothing, so here is what
                it means here. A yoke takes between six and fourteen hours to embroider. A scalloped
                hem takes eight to sixteen. A single mirror is anchored in about three minutes, and
                a lehenga hem may carry two hundred of them.
              </p>
              <p className="lead" style={{ marginTop: '1.2rem' }}>
                Nothing is bought in finished. Nothing is machine-embroidered and called handwork. A
                piece takes four to eight weeks because that is genuinely how long the work takes.
              </p>
            </Reveal>
          </div>

          <div className="story__row story__row--b">
            <Reveal className="story__media" image>
              <Figure
                src={detail.images[2]}
                alt="Hand-embroidered detail on organza"
                ratio="16/9"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </Reveal>
            <Reveal className="story__text" delay={120}>
              <p className="pull">
                Made once, made to order, made for you.
                <span className="pull__cite">Siri Couture, Bhilwara</span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="head">
          <p className="eyebrow">How we work</p>
          <h2 className="head__title">Four things we hold to.</h2>
        </div>
        <ol className="steps">
          {VALUES.map((v, i) => (
            <Reveal as="li" className="step" key={v.t} delay={i * 60}>
              <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__t">{v.t}</h3>
              <p className="step__d">{v.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="wrap section">
        <div className="story__row story__row--a">
          <Reveal className="story__media" image>
            <Figure
              ratio="1/1"
              sizes="(max-width: 900px) 100vw, 40vw"
              pending="Shopfront — Navkar City Centre, Bhilwara"
            />
          </Reveal>
          <Reveal className="story__text" delay={120}>
            <p className="eyebrow">Visit</p>
            <h2 className="head__title" style={{ marginBlock: '0.8rem 1.2rem' }}>
              Come and see the cloth.
            </h2>
            <p className="lead">
              Colour is difficult on a screen and handwork is difficult in a photograph. If you can
              reach the studio, it is worth the trip.
            </p>
            <address
              style={{ fontStyle: 'normal', margin: '1.4rem 0', color: 'var(--ink-2)' }}
            >
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}, {address.state} {address.pin}
            </address>
            <a
              className="btn"
              href={enquiryHref('Hello Siri Couture — I would like to visit the studio.')}
            >
              Arrange a visit
            </a>
          </Reveal>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap head">
          <p className="eyebrow">Out of the studio</p>
          <h2 className="head__title">The work, up close.</h2>
        </div>
        <div className="macros">
          {TECHNIQUES.map((t, i) => (
            <Reveal key={t.id} image delay={i * 90}>
              <Figure
                src={t.image}
                alt={`${t.name} — ${t.local}`}
                ratio="1/1"
                sizes="(max-width: 1100px) 74vw, 19vw"
                caption={t.local}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
