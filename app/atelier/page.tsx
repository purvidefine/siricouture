import type { Metadata } from 'next';
import Frame from '@/components/Frame';
import { Buti, Scallop, StitchRule, Vine } from '@/components/Motif';
import { enquiryHref } from '@/lib/enquiry';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Atelier',
  description:
    'Siri Couture is a small hand-embroidery studio in Bhilwara, Rajasthan. Slow fashion, made to order, stitched by hand.',
};

/**
 * Atelier.
 *
 * The credibility page. Short and specific — where the studio is, how it works,
 * and what "slow fashion" means in hours rather than as a slogan.
 *
 * TODO(studio): the founder's name and story are not in the reference material.
 * This page is written so it reads correctly without them, and so a paragraph
 * can be dropped in without restructuring anything.
 */
export default function AtelierPage() {
  const { address } = BRAND;

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Bhilwara, Rajasthan</p>
        <h1 className="page-title">The Atelier</h1>
        <p className="page-lead">
          A small studio in a textile town, making occasion wear the slow way: drawn, cut,
          embroidered by hand and finished one piece at a time.
        </p>
        <Scallop width={460} seed={22} className="page-head__scallop" />
      </header>

      <section className="atelier">
        <Frame tint="#E5DCCE" ratio="4/5" seed={5} feature label="The studio — worktable and frames" />
        <div className="atelier__text">
          <h2 className="section__title">Slow fashion, in hours</h2>
          <p className="section__lead">
            &ldquo;Slow fashion&rdquo; is used loosely enough to mean nothing, so here is what it
            means here. A yoke takes between six and fourteen hours to embroider. A scalloped hem
            takes eight to sixteen. A single mirror is anchored in about three minutes, and a
            lehenga hem may carry two hundred of them.
          </p>
          <p className="section__lead">
            Nothing is bought in finished. Nothing is machine-embroidered and called handwork. A
            piece takes four to eight weeks because that is genuinely how long the work takes.
          </p>
          <StitchRule width={380} seed={33} />
        </div>
      </section>

      <Vine width={1000} className="section-vine" seed={41} />

      <section className="section values">
        <div className="section__head">
          <Buti size={70} seed={8} />
          <h2 className="section__title">How we work</h2>
        </div>
        <ul className="values__list">
          <li>
            <h3>Made to order</h3>
            <p>
              Almost nothing is made in advance. Your piece is cut for you, which is why we ask for
              measurements rather than a size.
            </p>
          </li>
          <li>
            <h3>Handwork named, every time</h3>
            <p>
              On every piece on this site, the techniques used are listed by name. If it is not
              listed, it is not on there.
            </p>
          </li>
          <li>
            <h3>Honest lead times</h3>
            <p>
              If your date is too close for the work you want, we will say so and offer something we
              can actually finish well.
            </p>
          </li>
          <li>
            <h3>Worn everywhere</h3>
            <p>
              Made in Bhilwara and shipped wherever you are. Overseas orders are made to measurement
              and sent with a fit sheet.
            </p>
          </li>
        </ul>
      </section>

      <StitchRule width={1400} className="section-rule" seed={52} />

      <section className="section visit">
        <div>
          <h2 className="section__title">Come and see the cloth</h2>
          <p className="section__lead">
            Colour is difficult on a screen and handwork is difficult in a photograph. If you can
            reach the studio, it is worth the trip.
          </p>
          <address className="visit__address">
            {address.line1}
            <br />
            {address.line2}
            <br />
            {address.city}, {address.state} {address.pin}
          </address>
          <a className="btn btn--line" href={enquiryHref('Hello Siri Couture — I would like to visit the studio.')}>
            Arrange a visit
          </a>
        </div>
        <Frame tint="#C8407E" ratio="1/1" seed={16} label="Shopfront — Navkar City Centre" />
      </section>
    </>
  );
}
