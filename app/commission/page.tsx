'use client';

/**
 * Bespoke — the enquiry.
 *
 * The main conversion path, written as a consultation rather than a form: what
 * the occasion is, when it is, what you picture, and — deliberately included —
 * what you would like to spend. The budget field is the strategic part. The
 * studio's problem is not that people think the work is poor, it is that they
 * assume it is out of reach and never ask; a field that invites a figure, with
 * no bands and no "from" price, lets someone ask without declaring themselves.
 *
 * Nothing is posted to a server. Submitting composes a WhatsApp message, which
 * is where her clients already talk to her, and means the studio needs no
 * backend to start taking enquiries.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { TECHNIQUES } from '@/lib/catalogue';

const OCCASIONS = [
  'A wedding I am attending',
  'My own function',
  'Bridesmaid or close family',
  'Festive',
  'Something for every day',
];

const GARMENTS = ['Kurta set', 'Suit set', 'Lehenga set', 'Anarkali', 'Dress', 'Not sure yet'];

const STEPS = [
  { n: '01', t: 'Discover', d: 'The occasion, the date, and what you already know you want.' },
  { n: '02', t: 'Design', d: 'Silhouette, cloth and the handwork drawn for it, in your colour.' },
  { n: '03', t: 'Craft', d: 'Cut, embroidered and constructed by hand. Four to eight weeks.' },
  { n: '04', t: 'Fit', d: 'Fittings in the studio, or a fit sheet if you are further away.' },
  { n: '05', t: 'Deliver', d: 'Finished, pressed and wrapped by hand. Shipped wherever you are.' },
];

export default function CommissionPage() {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [garment, setGarment] = useState('');
  const [when, setWhen] = useState('');
  const [location, setLocation] = useState('');
  const [colour, setColour] = useState('');
  const [budget, setBudget] = useState('');
  const [work, setWork] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const message = useMemo(() => {
    const lines = [
      'Hello Siri Couture — I would like to start a piece.',
      name && `Name: ${name}`,
      occasion && `Occasion: ${occasion}`,
      garment && `Looking for: ${garment}`,
      when && `Date: ${when}`,
      location && `Where I am: ${location}`,
      colour && `Colour: ${colour}`,
      budget && `Budget in mind: ${budget}`,
      work.length > 0 && `Handwork: ${work.join(', ')}`,
      notes && `Notes: ${notes}`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [name, occasion, garment, when, location, colour, budget, work, notes]);

  const href = BRAND.whatsapp
    ? `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`
    : null;

  const toggleWork = (t: string) =>
    setWork((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <>
      <header className="wrap page-head">
        <p className="eyebrow">Bespoke</p>
        <h1 className="page-title">
          Your vision.
          <br />
          <em>Our craft.</em>
        </h1>
        <p className="page-lead">
          Most of what leaves this studio was made for someone specific. Tell us what you need and
          we will draw something for it — there is no obligation in asking.
        </p>
      </header>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <ol className="steps">
          {STEPS.map((s) => (
            <li className="step" key={s.n}>
              <span className="step__n">{s.n}</span>
              <h2 className="step__t">{s.t}</h2>
              <p className="step__d">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap section form-layout">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (href) window.open(href, '_blank', 'noopener');
          }}
        >
          <div className="head">
            <p className="eyebrow">The consultation</p>
            <h2 className="head__title">Tell us about it.</h2>
          </div>

          <label className="field">
            <span>Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="So we know who we are writing to"
            />
          </label>

          <fieldset className="field">
            <legend>What is it for?</legend>
            <div className="chips">
              {OCCASIONS.map((o) => (
                <button
                  type="button"
                  key={o}
                  className={`chip${occasion === o ? ' is-on' : ''}`}
                  aria-pressed={occasion === o}
                  onClick={() => setOccasion(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>What are you looking for?</legend>
            <div className="chips">
              {GARMENTS.map((g) => (
                <button
                  type="button"
                  key={g}
                  className={`chip${garment === g ? ' is-on' : ''}`}
                  aria-pressed={garment === g}
                  onClick={() => setGarment(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="two-up">
            <label className="field">
              <span>When do you need it?</span>
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="A month and year is enough"
              />
            </label>

            <label className="field">
              <span>Where are you?</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City — so we know about fittings and shipping"
              />
            </label>
          </div>

          <label className="field">
            <span>Any colour in mind?</span>
            <input
              type="text"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              placeholder="Fuchsia, citrine, violet, ivory — or describe it"
            />
          </label>

          <fieldset className="field">
            <legend>Handwork you would like</legend>
            <div className="chips">
              {TECHNIQUES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`chip${work.includes(t.name) ? ' is-on' : ''}`}
                  aria-pressed={work.includes(t.name)}
                  onClick={() => toggleWork(t.name)}
                >
                  {t.name}
                  <em>{t.local}</em>
                </button>
              ))}
            </div>
            <p className="field__help">Not sure? Leave it — we will suggest something.</p>
          </fieldset>

          {/* The budget question, asked the way the studio would ask it. */}
          <label className="field" id="budget">
            <span>Do you have a budget in mind?</span>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="A figure or a range — whatever you have in mind"
            />
            <p className="field__help">
              Entirely optional, and it does not narrow what we will show you. Handwork can be
              worked lightly or all the way along a hem, so knowing this early means we can
              recommend what will look best within it rather than guess.
            </p>
          </label>

          <label className="field">
            <span>Anything else</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A piece you already love, a neckline, a length, a photograph you want to send."
            />
            <p className="field__help">
              Have inspiration images? Send them straight into the chat once it opens — that is the
              easiest way for us to see what you mean.
            </p>
          </label>

          {href ? (
            <p>
              <button type="submit" className="btn btn--solid">
                Send on WhatsApp
              </button>
            </p>
          ) : (
            <div className="form__pending">
              <p>
                <strong>WhatsApp number not configured yet.</strong> Add it in{' '}
                <code>lib/brand.ts</code> and this button will open a pre-filled chat. Until then,
                here is the message this form has composed:
              </p>
              <pre>{message}</pre>
            </div>
          )}

          <p className="form__note">
            Nothing is stored on this website — the form composes a message and hands it to
            WhatsApp, so the conversation stays where the studio already works.
          </p>
        </form>

        <aside className="form-aside">
          <h2>Visit instead</h2>
          <address>
            {BRAND.address.line1}
            <br />
            {BRAND.address.line2}
            <br />
            {BRAND.address.city}, {BRAND.address.state} {BRAND.address.pin}
          </address>

          <h2 style={{ marginTop: '1.4rem' }}>Made further away?</h2>
          <p style={{ color: 'var(--ink-2)' }}>
            We make to measurement and ship. Send your numbers and we will send back a fit sheet
            before anything is cut.
          </p>

          <h2 style={{ marginTop: '1.4rem' }}>See the work first</h2>
          <p style={{ color: 'var(--ink-2)' }}>
            Every technique we work in, and how long each one takes.
          </p>
          <Link className="link" href="/handwork">
            The art of couture
          </Link>
        </aside>
      </section>
    </>
  );
}
