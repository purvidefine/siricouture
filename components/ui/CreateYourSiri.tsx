'use client';

/**
 * CreateYourSiri.tsx — what the visitor does next.
 *
 * After seven movements of watching something be made, the ask is not "shop
 * now". It is an invitation to commission, which is what a made-to-measure
 * atelier actually sells. The form is short on purpose: occasion, date, an idea.
 * Everything else belongs in the conversation that follows.
 */

import { useState } from 'react';

const OCCASIONS = ['Wedding', 'Reception', 'Sangeet or Mehendi', 'Festive', 'Something else'];

export default function CreateYourSiri() {
  const [occasion, setOccasion] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <section className="create" id="create">
      <div className="create__inner">
        <p className="create__eyebrow">CREATE YOUR SIRI</p>

        <h2 className="create__head">
          Bring us your occasion,
          <br />
          your idea, your inspiration.
          <br />
          <em>We&rsquo;ll make it yours.</em>
        </h2>

        <p className="create__body">
          Every piece begins the way the one you just watched began — with a length of cloth, a
          drawing, and a conversation about the person it is for. Nothing is cut before that
          conversation happens.
        </p>

        {!sent ? (
          <form
            className="create__form"
            onSubmit={(e) => {
              e.preventDefault();
              // Wire to the studio's enquiry endpoint / WhatsApp Business API.
              setSent(true);
            }}
          >
            <fieldset className="create__field">
              <legend>The occasion</legend>
              <div className="create__chips">
                {OCCASIONS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    className={`create__chip ${occasion === o ? 'is-on' : ''}`}
                    onClick={() => setOccasion(o)}
                    aria-pressed={occasion === o}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="create__label">
              <span>When is it?</span>
              <input type="text" name="when" placeholder="Month and year is enough" />
            </label>

            <label className="create__label">
              <span>What do you have in mind?</span>
              <textarea
                name="idea"
                rows={3}
                placeholder="A colour, a fabric, a photograph, a memory — anything."
              />
            </label>

            <label className="create__label">
              <span>How do we reach you?</span>
              <input type="text" name="contact" placeholder="WhatsApp number or email" required />
            </label>

            <button type="submit" className="create__cta">
              START A CUSTOM ORDER
            </button>

            <p className="create__note">
              We reply to every enquiry ourselves, usually within a day. Overseas orders are made to
              your measurements and shipped worldwide.
            </p>
          </form>
        ) : (
          <div className="create__thanks" role="status">
            <p className="create__thanksHead">Thank you.</p>
            <p>
              We have your note. Someone from the studio will write to you shortly — and it will be a
              person, not an autoresponder.
            </p>
          </div>
        )}
      </div>

      <footer className="foot">
        <span>SIRI COUTURE</span>
        <span>MADE BY HAND. MADE FOR YOU.</span>
        <span>BHILWARA, RAJASTHAN</span>
      </footer>
    </section>
  );
}
