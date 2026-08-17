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

Pages: home, collections, piece detail, **The Handwork**, atelier, commission.

## Positioning — read this before changing copy

This is **not** a bridal-lehenga house, and an earlier version of this project went
wrong by assuming it was. Read from her own captions and grid:

- Modern Indian occasion wear — kurta sets, suit sets, lehengas, anarkalis, dresses
- The wedding **guest**, the bridesmaid, the trousseau, the festive edit
- Sorbet palette, explicitly against the traditional register: *"Forget the
  traditional reds and golds for a moment, we're making a case for the Sorbet Suite."*
- Voice: short, observational, first-person plural. Never salesy.
- ~1,950 followers, 188 posts, ~11–14 likes a post

The palette in `lib/brand.ts` is sampled from her own photography, not chosen.

## Handwork everywhere

The brief was to show authentic handwork throughout. Rather than decorating with
generic Indian ornament — arches, paisley, peacocks, mandalas — **every
decorative element on this site is a generated embroidery structure** (`lib/motifs.ts`):

| Motif | What it actually is | Where it appears |
|---|---|---|
| `runningStitch` | Individual stitches along a line | Every section rule, nav, footer |
| `buti` | Floral sprig: back-stitched stem, satin leaves and petals, knotted centre | Nav mark, section heads, image placeholders |
| `scallopBorder` | Gota/sequin scalloped hem with anchor points | Under headings and hero |
| `shisha` | A mirror held by its ring of anchor stitches | Mirror-work section |
| `vine` | Running floral border, satin leaves and buds | Major section dividers |

Two rules make these read as handwork rather than clip-art: stitches are drawn as
**individual segments** rather than a repeating dash pattern, and every length,
gap and position carries a **seeded wobble** — so no two stitches match, but the
same seed always draws the same motif and nothing shimmers between renders.

Beyond decoration, the handwork is *named*: every piece lists its techniques with
the local term (Resham, Shisha, Zari, Sitara) and the real hours each takes. That
is the argument for the price and the lead time.

## Structure

```
app/
  page.tsx                 home
  collections/             the catalogue, grouped by collection
  pieces/[slug]/           piece detail — spec, handwork, enquiry
  handwork/                the five techniques, at length
  atelier/                 studio, lead times, visiting
  commission/              the enquiry flow (client component)
components/
  Motif.tsx                the drawn handwork
  Frame.tsx                image placeholder
  PieceCard.tsx  Chrome.tsx
lib/
  brand.ts                 observed brand facts + palette
  motifs.ts                embroidery geometry -> SVG
  catalogue.ts             collections, pieces, techniques
  enquiry.ts               WhatsApp deep links
```

`lib/enquiry.ts` is deliberately outside any `'use client'` module — server
components import it, and a function exported across the client boundary cannot
be serialised.

---

## Before this goes live

1. **Set the WhatsApp number** in `lib/brand.ts` (`BRAND.whatsapp`, digits only,
   with country code). Until it is set, every enquiry CTA falls back to the
   commission page and the form shows the message it composed instead of sending.
   Nothing is dead, but nothing reaches her either.

2. **Replace the photography.** The site now runs on **real photographs of her
   garments**, recovered frame-by-frame from the reference recording of her
   Instagram and upscaled — 15 product shots plus 5 handwork macros in
   `public/images/`. They are genuinely her pieces, which is why they are here
   rather than placeholders, but they came from an 852×480 screen capture and are
   soft. Nothing displays larger than ~480px wide for that reason. **Swap in the
   originals**: replace the files in `public/images/pieces/` and
   `public/images/handwork/` keeping the same names, and nothing else changes.
   Slots without a real photograph (the studio interior, the shopfront) still
   render the labelled placeholder.

3. **Confirm the catalogue.** `lib/catalogue.ts` carries six pieces — Gulbahar,
   Citrine, Violet, Marigold, The Florals, Coral — one for each garment that
   could actually be seen in the reference. Names, fabrics and handwork are
   inferred and should be checked. Add the rest of her range with real photographs.

4. **Confirm the technique list.** Five are listed because five are visible in her
   work. Aari, gota patti and beadwork are deliberately **absent** — she has not
   confirmed working in them, and the brief was explicit that traditions must not
   be combined speculatively. Add them only on her word.

5. **Check the lead times and hours.** The figures on `/handwork` and `/atelier`
   ("6–14 hours a panel", "four to eight weeks") are plausible for this work but
   were not supplied by the studio. They are load-bearing claims — verify them.

6. **Founder story** is missing from `/atelier`; the page is written to read
   correctly without it and to take a paragraph without restructuring.

7. **Typography** uses system stacks only, because this build had no network
   access to font hosts. A licensed display face can be swapped in by changing
   `--serif` in `app/globals.css`.
