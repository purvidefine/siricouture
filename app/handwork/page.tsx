import type { Metadata } from 'next';
import Link from 'next/link';
import Frame from '@/components/Frame';
import { Buti, Scallop, Shisha, StitchRule, Vine } from '@/components/Motif';
import { enquiryHref } from '@/lib/enquiry';
import { PIECES, TECHNIQUES } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'The Handwork',
  description:
    'Thread embroidery, mirror work, zari, sequin scallops and floral appliqué — the five techniques behind every Siri Couture piece, and how long each one takes.',
};

/**
 * The Handwork.
 *
 * The most important page on the site. It is the argument for the price, the
 * reason the lead time is what it is, and the thing no mill-made competitor can
 * copy. Each technique gets its own drawn motif so the craft is shown, not just
 * described.
 */
export default function HandworkPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Why it takes as long as it does</p>
        <h1 className="page-title">The Handwork</h1>
        <p className="page-lead">
          There is no machine in this part of the process. Every technique below is worked by hand,
          on the cloth, one stitch at a time — which is why a piece takes weeks and why no two are
          identical.
        </p>
        <Scallop width={480} seed={9} className="page-head__scallop" />
      </header>

      {TECHNIQUES.map((t, i) => {
        const used = PIECES.filter((p) => p.techniques.includes(t.id));
        const flip = i % 2 === 1;
        return (
          <section key={t.id} id={t.id} className={`technique-block ${flip ? 'is-flipped' : ''}`}>
            <div className="technique-block__text">
              <p className="technique-block__local">{t.local}</p>
              <h2 className="section__title">{t.name}</h2>
              <p className="technique-block__line">{t.line}</p>
              <p className="section__lead">{t.body}</p>

              <dl className="spec">
                <div>
                  <dt>Worked by hand in</dt>
                  <dd>{t.hours}</dd>
                </div>
                <div>
                  <dt>Seen on</dt>
                  <dd>
                    {used.slice(0, 3).map((p, k) => (
                      <span key={p.slug}>
                        <Link href={`/pieces/${p.slug}`}>{p.name}</Link>
                        {k < Math.min(used.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <StitchRule width={360} seed={i * 11 + 4} className="technique-block__rule" />

              <div className="technique-block__uses">
                {used.map((p) => (
                  <Link key={p.slug} href={`/pieces/${p.slug}`} className="mini">
                    <Frame ratio="3/4" src={p.images[0]} alt={p.name} tint={p.tint} />
                    <span>{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="technique-block__art">
              <Frame
                tint={['#C8407E', '#D9AE3B', '#B08D4F', '#54459B', '#EFE7D8'][i]}
                ratio="4/5"
                seed={i * 6 + 1}
                src={t.image}
                alt={`${t.name} on a Siri Couture piece`}
              />
              <div className="technique-block__motif" aria-hidden="true">
                {t.id === 'shisha' ? (
                  <Shisha size={78} seed={i + 3} />
                ) : t.id === 'sequin' ? (
                  <Scallop width={200} height={30} seed={i + 6} />
                ) : (
                  <Buti size={86} seed={i * 4 + 2} />
                )}
              </div>
            </div>
          </section>
        );
      })}

      <Vine width={1000} className="section-vine" seed={23} />

      <section className="section handwork-close">
        <h2 className="section__title">
          Choose the handwork
          <br />
          <em>for your own piece.</em>
        </h2>
        <p className="section__lead">
          Any of these can be worked onto any silhouette we make. Tell us the occasion and we will
          draw something for it.
        </p>
        <a className="btn btn--solid" href={enquiryHref('Hello Siri Couture — I would like to commission a piece with hand embroidery.')}>
          Start a commission
        </a>
      </section>
    </>
  );
}
