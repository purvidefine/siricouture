# Siri Couture

Website for [@_siricouture](https://www.instagram.com/_siricouture/) — a hand-embroidery
studio in Bhilwara, Rajasthan making modern Indian occasion wear.

Next.js 14 (App Router) · TypeScript · no runtime dependencies beyond React.

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## What this is

A **catalogue-and-commission** site, not a shop. Her clients come to have handwork
done, and occasion wear at this price point does not convert in a cart, so every
action on the site leads to a conversation — pre-filled and handed to WhatsApp,
where she already talks to her customers.

Pages: home, collections, piece detail, **The Craft**, atelier, bespoke enquiry.

## Positioning — read this before changing copy

This is **not** a bridal-lehenga house, and an earlier version of this project went
wrong by assuming it was. Read from her own captions and grid:

- Modern Indian occasion wear — kurta sets, suit sets, lehengas, anarkalis, dresses
- The wedding **guest**, the bridesmaid, the trousseau, the festive edit
- Sorbet palette, explicitly against the traditional register: *"Forget the
  traditional reds and golds for a moment, we're making a case for the Sorbet Suite."*
- Voice: short, observational, first-person plural. Never salesy.
- ~1,950 followers, 188 posts, ~11–14 likes a post

## Art direction

The site is built to read as a couture house rather than a boutique: the money is
in typography, spacing and composition, not in ornament.

| Decision | What it is | Why |
|---|---|---|
| **Type** | Bodoni Moda (display) against Jost (sans), self-hosted via `next/font` | A didone against a geometric sans is the fashion-title pairing; it reads editorial before a single image loads |
| **Palette** | Warm ivory, deep ink, muted neutrals, one restrained accent | The clothes carry the colour. No gold, no gradients, no maroon |
| **Ornament** | None | Removed deliberately — see below |
| **Radius / shadow** | Zero, everywhere | An image is an image, not a card |
| **Grid** | 12 columns, asymmetric, alternating | The eye travels down the page instead of scanning a matrix |
| **Motion** | Text rises, images uncover behind a lifting curtain, one easing, ~1.4s | Slow and deliberate. Everything is disabled under `prefers-reduced-motion` |

Two things worth knowing before editing:

- **`components/Reveal.tsx` must not hide its own element with `clip-path`.** An
  element that clips itself is reported by `IntersectionObserver` as not
  intersecting, so it can never be observed into view — and the clip also
  suppressed `next/image`'s lazy loading underneath it. The reveal is a painted
  curtain (`::after`) for that reason; it changes no geometry. The curtain has to
  match the section's background, which is why `.dark` and `.budget` override it.
- **Never put `overflow-x` on `<body>`.** Same class of problem.

### The generated embroidery motifs

`lib/motifs.ts` and `components/Motif.tsx` draw real embroidery structures —
running stitch, buti, gota scallop, shisha ring, floral vine — as seeded SVG, so
no two stitches match and nothing shimmers between renders. They are **retained
but no longer used in the layout**: the brief for this pass was quiet luxury and
less decoration, and drawn ornament is the register it was moving away from.
Delete both files if you are sure, or bring the buti back as a mark on
stationery, a favicon or packaging.

The handwork is still *named* everywhere instead: every piece lists its
techniques with the local term (Resham, Shisha, Zari, Sitara) and the real hours
each takes. That is the argument for the price and the lead time.

## Structure

```
app/
  page.tsx                 home — hero, collections, craft, atelier, story,
                           bespoke, budget, clients, closing
  collections/             the lookbook
  pieces/[slug]/           piece detail — spec, handwork, enquiry
  handwork/                the five techniques, at length
  atelier/                 studio, lead times, visiting
  commission/              the bespoke consultation (client component)
components/
  Chrome.tsx               nav (+ full-screen mobile menu) and footer
  Figure.tsx               the editorial image, and the "photograph to come" slot
  Reveal.tsx               scroll-triggered entrance
  PieceCard.tsx
  Motif.tsx                drawn handwork — retained, unused
lib/
  brand.ts                 observed brand facts + palette
  catalogue.ts             collections, pieces, techniques
  enquiry.ts               WhatsApp deep links
  motifs.ts                embroidery geometry -> SVG — retained, unused
```

`lib/enquiry.ts` is deliberately outside any `'use client'` module — server
components import it, and a function exported across the client boundary cannot
be serialised.

---

## Before this goes live

1. **Set the WhatsApp number** in `lib/brand.ts` (`BRAND.whatsapp`, digits only,
   with country code). Until it is set, every enquiry CTA falls back to the
   bespoke page and the form shows the message it composed instead of sending.
   Nothing is dead, but nothing reaches her either.

2. **Replace the photography — this is now the weakest part of the site.** The
   design is composed for large, sharp images and the current files cannot carry
   it. They are frame-grabs recovered from an 852×480 screen capture of her
   Instagram, so nothing is wider than ~900px and everything is soft. The hero
   and the closing panel are the two worst offenders because they run full-bleed.
   A film-grain plate (`.grain` in `globals.css`) is applied over both to make
   the softness read as filmic rather than low-resolution — **remove it once real
   photography lands**, it is a treatment, not a texture.

   Drop replacements into `public/images/` under the same filenames and nothing
   else changes.

3. **Two of the five "handwork macros" are not macros.**
   `public/images/handwork/sequin.jpg` is a full garment and `applique.jpg` is a
   full-figure shot at distance. They sit in a row of square close-ups on the
   home and atelier pages and visibly break it. These are the highest-value
   photographs to reshoot: tight, sharp, raking light, cloth filling the frame.

4. **Photography the studio still owes**, in priority order:
   - Handwork macros for **Sitara** and **Kaam** (above)
   - A hero frame — full-length, garment legible, room around the figure
   - The studio: worktable, frames, thread spools
   - Hands at work, embroidery in progress
   - The shopfront at Navkar City Centre
   - Client photographs, with permission, for the "In their words" section

   Every slot without a photograph renders a labelled field saying what belongs
   there, so nothing is a broken image and the layout does not move when one
   arrives.

5. **No testimonials are written.** The "In their words" section holds three
   marked placeholders. Nothing goes in them until a real client says it and
   supplies a photograph — invented praise is the fastest way to lose the
   credibility the rest of the site is building.

6. **No prices anywhere, by design.** The budget field on the bespoke page is
   free text with no bands and no "from" figure, because inventing price points
   would misrepresent the business. If she wants preset ranges, supply the real
   ones and they can become chips.

7. **Confirm the catalogue.** `lib/catalogue.ts` carries six pieces — Gulbahar,
   Citrine, Violet, Marigold, The Florals, Coral — one for each garment visible
   in the reference. Names, fabrics and handwork are inferred and should be
   checked. The collections page currently runs one piece per collection; add the
   rest of her range and it fills out on its own.

8. **Confirm the technique list.** Five are listed because five are visible in her
   work. Aari, gota patti and beadwork are deliberately **absent** — she has not
   confirmed working in them, and traditions must not be combined speculatively.
   Add them only on her word.

9. **Check the lead times and hours.** The figures on `/handwork` and `/atelier`
   ("6–14 hours a panel", "four to eight weeks") are plausible for this work but
   were not supplied by the studio. They are load-bearing claims — verify them.

10. **Founder story** is missing from `/atelier`; the page is written to read
    correctly without it and to take a paragraph without restructuring.

## Image credits

No third-party photography is used. Every photograph on the site is the studio's
own, recovered from the reference recording of its Instagram. Free-licence stock
was not added: sourcing it needs network access to Unsplash or Pexels, which the
build environment blocks, and placeholder stock of other people's garments would
have undercut the craftsmanship argument the site is built on. Replace the files
listed in step 2 above with the studio's originals and no credits are needed.
