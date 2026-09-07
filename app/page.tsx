/**
 * Home.
 *
 * Read as a sequence rather than a set of blocks: a campaign image, one line of
 * argument, the work itself, the hands that made it, the studio, the story, the
 * bespoke route, and — before the last call to action — the sentence that lets
 * someone who is unsure about cost ask anyway. Every section is composed for
 * photography and left mostly empty; the restraint is the design.
 */

import Link from 'next/link';
import Figure from '@/components/Figure';
import Reveal from '@/components/Reveal';
import { enquiryHref } from '@/lib/enquiry';
import { COLLECTIONS, PIECES, TECHNIQUES, pieceBySlug } from '@/lib/catalogue';

const BESPOKE = [
  {
    n: '01',
    t: 'Discover',
    d: 'The occasion, the date, and what you already know you want to feel like.',
  },
  {
    n: '02',
    t: 'Design',
    d: 'Silhouette, cloth and the handwork drawn for it — in your colour, not ours.',
  },
  {
    n: '03',
    t: 'Craft',
    d: 'Cut, embroidered and constructed by hand in the studio. Four to eight weeks.',
  },
  {
    n: '04',
    t: 'Fit',
    d: 'Fittings in Bhilwara, or a fit sheet and your measurements if you are further away.',
  },
  { n: '05', t: 'Deliver', d: 'Finished, pressed and wrapped by hand. Shipped wherever you are.' },
];

export default function Home() {
  // The hero is chosen for composition rather than catalogue order: arms wide,
  // dupatta open, the garment legible across the frame.
  const heroSrc = '/images/pieces/violet-1.jpg';
  const story = pieceBySlug('gulbahar')!;
  const florals = pieceBySlug('the-florals')!;
  const closing = pieceBySlug('citrine')!;

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="hero grain">
        <div className="hero__media">
          <Figure
            src={heroSrc}
            alt="A violet anarkali with a sheer embroidered dupatta held open"
            ratio="auto"
            sizes="100vw"
            priority
            position="center 26%"
            className="fig--bleed"
          />
        </div>
        <div className="hero__scrim" />

        <div className="hero__inner">
          <p className="eyebrow">Bhilwara · Rajasthan</p>
          <h1 className="hero__title">
            <span className="hero__line">
              <span style={{ ['--delay' as string]: '150ms' }}>Made for your</span>
            </span>
            <span className="hero__line">
              <span style={{ ['--delay' as string]: '290ms' }}>
                <em>moments.</em>
              </span>
            </span>
          </h1>
          <p className="hero__sub">
            Ethereal pieces, handcrafted. Slow fashion, stitched in sunshine — made once, made to
            order, made for you.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--light" href="/collections">
              Explore the collection
            </Link>
            <Link className="btn btn--light" href="/commission">
              Start your Siri story
            </Link>
          </div>
        </div>

        <span className="hero__cue">Scroll</span>
      </section>

      {/* ----------------------------------------------------- statement */}
      <section className="statement">
        <div className="wrap statement__grid">
          <Reveal>
            <p className="statement__text">
              Forget the traditional reds and golds for a moment. We are making a case for the
              sorbet suite.
            </p>
          </Reveal>
          <Reveal className="statement__aside" delay={120}>
            <p className="lead">
              Occasion wear for the wedding you are attending, the festival you are dressing for,
              and the ordinary day you want to feel like something. Not a bridal house — a small
              studio making the pieces worn around one.
            </p>
            <Link className="link" href="/atelier">
              Inside the atelier
            </Link>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- collections */}
      <section className="section">
        <div className="wrap">
          <div className="head head--split">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 className="head__title">Designed around you.</h2>
            </div>
            <Link className="link" href="/collections">
              All pieces
            </Link>
          </div>

          <div className="editorial">
            {COLLECTIONS.map((c, i) => {
              const cover = PIECES.find((p) => p.collection === c.name);
              const src = cover?.images.find((i) => i !== heroSrc) ?? cover?.images[0];
              const slug = cover ? `/pieces/${cover.slug}` : `/collections#${c.slug}`;
              return (
                <article className="ed" key={c.slug}>
                  <Reveal className="ed__media" image>
                    <Link href={slug}>
                      <Figure
                        src={src}
                        alt={cover ? `${c.name} — ${cover.type}` : c.name}
                        ratio={i % 2 === 0 ? '4/5' : '3/4'}
                        sizes="(max-width: 900px) 100vw, 58vw"
                        hover
                        pending={`${c.name} — collection image`}
                      />
                    </Link>
                  </Reveal>

                  <Reveal className="ed__body" delay={140}>
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="ed__title">{c.name}</h3>
                    <p className="ed__line">{c.line}</p>
                    {cover && (
                      <p className="ed__meta">
                        <span>{cover.type}</span>
                        <span>{cover.fabric}</span>
                      </p>
                    )}
                    <Link className="link" href={slug}>
                      View
                    </Link>
                  </Reveal>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- art of couture */}
      <section className="section dark">
        <div className="wrap">
          <div className="craft__grid">
            <Reveal className="craft__media" image>
              <Figure
                src={TECHNIQUES[1].image}
                alt="Mirrors set along a citrine organza hem, each anchored by hand"
                ratio="1/1"
                sizes="(max-width: 1000px) 100vw, 46vw"
              />
            </Reveal>

            <Reveal className="craft__body" delay={120}>
              <p className="eyebrow">The art of couture</p>
              <h2 className="craft__title">
                Every stitch
                <br />
                <em>put there by a person.</em>
              </h2>
              <p className="lead">
                There is no machine in this part of the process. A yoke takes six to fourteen hours
                to embroider. A single mirror is anchored in about three minutes, and a lehenga hem
                may carry two hundred of them. Nothing is bought in finished, and nothing
                machine-embroidered is ever called handwork.
              </p>
            </Reveal>
          </div>

          <ul className="techniques">
            {TECHNIQUES.map((t, i) => (
              <Reveal as="li" className="technique" key={t.id} delay={i * 60}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="technique__name">{t.name}</h3>
                  <span className="technique__local">{t.local}</span>
                </div>
                <p className="technique__line">{t.line}</p>
                <span className="technique__hours">{t.hours}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="macros" style={{ marginTop: 'clamp(2.5rem, 6vw, 5rem)' }}>
          {TECHNIQUES.map((t, i) => (
            <Reveal key={t.id} image delay={i * 90}>
              <Figure
                src={t.image}
                alt={`${t.name} — ${t.local} — worked by hand`}
                ratio="1/1"
                sizes="(max-width: 1100px) 74vw, 19vw"
                caption={t.local}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- atelier */}
      <section className="section">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Inside the atelier</p>
            <h2 className="head__title">A small studio in a textile town.</h2>
            <p className="lead">
              Bhilwara has made India&rsquo;s cloth for generations. We work the slow way inside it
              — drawn, cut, embroidered by hand, and finished one piece at a time.
            </p>
          </div>

          <div className="story">
            <div className="story__row story__row--a">
              <Reveal className="story__media" image>
                <Figure
                  ratio="4/5"
                  sizes="(max-width: 900px) 100vw, 40vw"
                  pending="The studio — worktable, frames, thread"
                />
              </Reveal>
              <Reveal className="story__text" delay={120}>
                <p className="lead">
                  Frames along the wall, cloth on the table, and one piece on each. A commission is
                  drawn before it is cut, and the drawing is made for the person who will wear it.
                </p>
                <Link className="link" href="/atelier">
                  Visit the studio
                </Link>
              </Reveal>
            </div>

            <div className="story__row story__row--b">
              <Reveal className="story__media" image>
                <Figure
                  ratio="16/9"
                  sizes="(max-width: 900px) 100vw, 50vw"
                  pending="Hands at work — embroidery in progress"
                />
              </Reveal>
              <Reveal className="story__text" delay={120}>
                <p className="pull">
                  We make one piece at a time, for one person at a time.
                  <span className="pull__cite">Siri Couture, Bhilwara</span>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- story */}
      <section className="section">
        <div className="wrap story">
          <div className="story__row story__row--a">
            <Reveal className="story__media" image>
              <Figure
                src={story.images[4]}
                alt={`${story.name} — hand-embroidered organza dupatta`}
                ratio="3/4"
                sizes="(max-width: 900px) 100vw, 40vw"
              />
            </Reveal>
            <Reveal className="story__text" delay={120}>
              <p className="eyebrow">Our story</p>
              <h2 className="head__title" style={{ marginBlock: '0.8rem 1.2rem' }}>
                Trousseau, redone.
              </h2>
              <p className="lead">
                We started where most of our clients start: needing something for an occasion, and
                not wanting what everyone else would be wearing to it. So the pieces are quieter
                than the register they sit in, and the work is in the cloth rather than on top of
                it.
              </p>
            </Reveal>
          </div>

          <div className="story__row story__row--b">
            <Reveal className="story__media" image>
              <Figure
                src={florals.images[1]}
                alt="Appliqué flowers on sheer organza"
                ratio="4/5"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </Reveal>
            <Reveal className="story__text" delay={120}>
              <p className="lead">
                Flowers laid onto organza, so they look like they are floating. Every edge turned
                and secured by hand — on a transparent ground there is nowhere for a shortcut to
                hide.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- bespoke */}
      <section className="section">
        <div className="wrap">
          <div className="head head--split">
            <div>
              <p className="eyebrow">Bespoke</p>
              <h2 className="head__title">
                Your vision.
                <br />
                <em>Our craft.</em>
              </h2>
            </div>
            <p className="lead" style={{ maxWidth: '38ch' }}>
              Most of what leaves this studio was made for someone specific. Bring us the occasion,
              a colour, a photograph, or a piece you already love.
            </p>
          </div>

          <ol className="steps">
            {BESPOKE.map((s, i) => (
              <Reveal as="li" className="step" key={s.n} delay={i * 60}>
                <span className="step__n">{s.n}</span>
                <h3 className="step__t">{s.t}</h3>
                <p className="step__d">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- budget */}
      <section className="section budget">
        <div className="wrap budget__grid">
          <Reveal>
            <p className="eyebrow">Considered around you</p>
            <h2 className="budget__title">Couture, considered around you.</h2>
            <p className="budget__lines">
              <span>Your occasion.</span>
              <span>Your vision.</span>
              <span>Your budget.</span>
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead">
              Handwork can be worked lightly or worked all the way along a hem, and the difference
              is hours rather than compromise. Have a figure in mind? Tell us, and we will
              recommend what can be made beautifully within it.
            </p>
            <p style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              <Link className="btn btn--solid" href="/commission#budget">
                Share your budget
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- clients */}
      <section className="section">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Worn</p>
            <h2 className="head__title">In their words.</h2>
            <p className="lead">
              Reserved for real clients. Nothing here is written until someone who wore a piece
              says it, and gives us the photograph to put beside it.
            </p>
          </div>

          <div className="clients">
            {['Client photograph', 'Client photograph', 'Client photograph'].map((label, i) => (
                <Reveal key={i} delay={i * 100}>
                  <Figure
                    ratio="3/4"
                    className="client__slot"
                    sizes="(max-width: 800px) 100vw, 32vw"
                  pending={`${label} — to come`}
                />
                <div className="client__meta">
                  <p className="eyebrow">Name · Occasion</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- closing */}
      <section className="closing grain">
        <div className="closing__media">
          <Figure
            src={closing.images[0]}
            alt="A citrine lehenga set, mirror-worked along the hem"
            ratio="auto"
            sizes="100vw"
            position="center 30%"
          />
        </div>
        <div className="closing__scrim" />
        <div className="closing__inner">
          <h2 className="closing__title">
            <span>Your moment.</span>
            <span>Your vision.</span>
            <span>
              <em>Your Siri.</em>
            </span>
          </h2>
          <p className="lead" style={{ color: 'rgba(250,247,242,0.82)', textAlign: 'center' }}>
            Let us make something for you.
          </p>
          <a className="btn btn--light" href={enquiryHref()}>
            Begin your enquiry
          </a>
        </div>
      </section>
    </>
  );
}
