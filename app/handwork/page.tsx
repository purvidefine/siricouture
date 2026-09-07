import type { Metadata } from 'next';
import Link from 'next/link';
import Figure from '@/components/Figure';
import Reveal from '@/components/Reveal';
import { enquiryHref } from '@/lib/enquiry';
import { PIECES, TECHNIQUES } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'The Craft',
  description:
    'Thread embroidery, mirror work, zari, sequin scallops and floral appliqué — the five techniques behind every Siri Couture piece, and how long each one takes.',
};

/**
 * The Craft.
 *
 * The most important page on the site: the argument for the price, the reason
 * the lead time is what it is, and the thing no mill-made competitor can copy.
 * Each technique is given a full spread and a macro photograph — nothing here
 * is illustrated, because the work itself is the illustration.
 */
export default function HandworkPage() {
  return (
    <>
      <header className="wrap page-head">
        <p className="eyebrow">Why it takes as long as it does</p>
        <h1 className="page-title">The art of couture</h1>
        <p className="page-lead">
          There is no machine in this part of the process. Every technique below is worked by hand,
          on the cloth, one stitch at a time — which is why a piece takes weeks, and why no two are
          identical.
        </p>
      </header>

      <div className="wrap">
        {TECHNIQUES.map((t, i) => {
          const used = PIECES.filter((p) => p.techniques.includes(t.id));
          return (
            <section key={t.id} id={t.id} className={`tech-block${i % 2 ? ' is-flipped' : ''}`}>
              <Reveal className="tech-block__art" image>
                <Figure
                  src={t.image}
                  alt={`${t.name} — ${t.local} — on a Siri Couture piece`}
                  ratio="4/5"
                  sizes="(max-width: 1000px) 100vw, 46vw"
                />
              </Reveal>

              <Reveal className="tech-block__text" delay={120}>
                <p className="tech-block__local">
                  {String(i + 1).padStart(2, '0')} · {t.local}
                </p>
                <h2 className="tech-block__title">{t.name}</h2>
                <p className="tech-block__line">{t.line}</p>
                <p className="lead">{t.body}</p>

                <dl className="spec" style={{ marginTop: 'clamp(1.4rem, 3vw, 2rem)' }}>
                  <div>
                    <dt>By hand in</dt>
                    <dd>{t.hours}</dd>
                  </div>
                  <div>
                    <dt>Seen on</dt>
                    <dd>{used.map((p) => p.name).join(', ')}</dd>
                  </div>
                </dl>

                {used.length > 0 && (
                  <div className="tech-block__uses">
                    {used.map((p) => (
                      <Link key={p.slug} href={`/pieces/${p.slug}`}>
                        <Figure
                          src={p.images[0]}
                          alt={p.name}
                          ratio="3/4"
                          sizes="7rem"
                          hover
                          pending={p.name}
                        />
                        <span>{p.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </Reveal>
            </section>
          );
        })}
      </div>

      <section className="section budget">
        <div className="wrap budget__grid">
          <Reveal>
            <p className="eyebrow">Bespoke</p>
            <h2 className="budget__title">
              Choose the handwork
              <br />
              <em>for your own piece.</em>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead">
              Any of these can be worked onto any silhouette we make, lightly or all the way along a
              hem. Tell us the occasion and we will draw something for it.
            </p>
            <p style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              <a
                className="btn btn--solid"
                href={enquiryHref(
                  'Hello Siri Couture — I would like to commission a piece with hand embroidery.'
                )}
              >
                Start your Siri story
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
