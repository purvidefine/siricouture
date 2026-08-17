'use client';

/**
 * Commission.
 *
 * The main conversion path. Short, because a commission genuinely starts as a
 * conversation and the form only has to gather enough to have that conversation
 * well: the occasion, the date, a colour, and which handwork they want.
 *
 * Submitting composes a WhatsApp message rather than posting to a server —
 * that is where her clients already talk to her, and it means the studio needs
 * no backend to start taking enquiries.
 */

import { useMemo, useState } from 'react';
import { Buti, Scallop, StitchRule } from '@/components/Motif';
import { BRAND } from '@/lib/brand';
import { TECHNIQUES } from '@/lib/catalogue';

const OCCASIONS = [
  'A wedding I am attending',
  'My own function',
  'Bridesmaid / close family',
  'Festive',
  'Something for every day',
];

const STEPS = [
  { n: '01', t: 'You tell us', d: 'The occasion, roughly when, and anything you already love.' },
  { n: '02', t: 'We draw', d: 'A silhouette and the handwork for it, in your colour.' },
  { n: '03', t: 'We measure', d: 'In the studio, or over video with a tape at home.' },
  { n: '04', t: 'It is made', d: 'Cut, embroidered and finished by hand. Four to eight weeks.' },
];

export default function CommissionPage() {
  const [occasion, setOccasion] = useState('');
  const [when, setWhen] = useState('');
  const [colour, setColour] = useState('');
  const [work, setWork] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');

  const message = useMemo(() => {
    const lines = [
      `Hello Siri Couture — I would like to commission a piece.`,
      name && `Name: ${name}`,
      occasion && `Occasion: ${occasion}`,
      when && `When: ${when}`,
      colour && `Colour: ${colour}`,
      work.length > 0 && `Handwork: ${work.join(', ')}`,
      notes && `Notes: ${notes}`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [name, occasion, when, colour, work, notes]);

  const href = BRAND.whatsapp
    ? `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`
    : null;

  const toggle = (t: string) =>
    setWork((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <>
      <header className="page-head">
        <Buti size={76} seed={12} />
        <p className="eyebrow">Made for one person</p>
        <h1 className="page-title">Commission a piece</h1>
        <p className="page-lead">
          Most of what leaves this studio was made for someone specific. Tell us what you need and we
          will draw something for it — there is no obligation in asking.
        </p>
        <Scallop width={440} seed={15} className="page-head__scallop" />
      </header>

      <section className="section steps-section">
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="steps__n">{s.n}</span>
              <h2>{s.t}</h2>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <StitchRule width={1200} className="section-rule" seed={62} />

      <section className="section form-section">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (href) window.open(href, '_blank', 'noopener');
          }}
        >
          <h2 className="section__title">Tell us about it</h2>

          <fieldset className="field">
            <legend>What is it for?</legend>
            <div className="chips">
              {OCCASIONS.map((o) => (
                <button
                  type="button"
                  key={o}
                  className={`chip ${occasion === o ? 'is-on' : ''}`}
                  aria-pressed={occasion === o}
                  onClick={() => setOccasion(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </fieldset>

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
                  className={`chip ${work.includes(t.name) ? 'is-on' : ''}`}
                  aria-pressed={work.includes(t.name)}
                  onClick={() => toggle(t.name)}
                >
                  {t.name}
                  <em>{t.local}</em>
                </button>
              ))}
            </div>
            <p className="field__help">Not sure? Leave it — we will suggest something.</p>
          </fieldset>

          <label className="field">
            <span>Anything else</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A photograph you like, a piece you already own, a length, a neckline."
            />
          </label>

          <label className="field">
            <span>Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="So we know who we are writing to"
            />
          </label>

          {href ? (
            <button type="submit" className="btn btn--solid">
              Send on WhatsApp
            </button>
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
          <StitchRule width={260} seed={71} />
          <h2>Made further away?</h2>
          <p>
            We make to measurement and ship. Send your numbers and we will send back a fit sheet
            before anything is cut.
          </p>
        </aside>
      </section>
    </>
  );
}
