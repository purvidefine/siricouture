/**
 * brand.ts — Siri Couture, as observed.
 *
 * Every fact here was read off the studio's own Instagram (@_siricouture) in the
 * reference recording. Nothing is invented. Where something is unconfirmed it is
 * marked TODO rather than guessed at, because the last pass of this project went
 * wrong by assuming a bridal-couture positioning the brand does not have.
 *
 * The correction that matters: this is NOT a bridal-lehenga house. It is modern
 * Indian occasion wear — the wedding *guest*, the bridesmaid, the trousseau, the
 * festive edit. The captions say so explicitly: "Forget the traditional reds and
 * golds for a moment, we're making a case for the Sorbet Suite."
 */

export const BRAND = {
  name: 'Siri Couture',
  handle: '_siricouture',
  instagram: 'https://www.instagram.com/_siricouture/',

  /** Bio, verbatim from the profile. */
  bio: [
    'Ethereal pieces, handcrafted with love',
    'Slow fashion, stitched in sunshine',
    'Handmade in Bhilwara, worn everywhere',
  ],

  address: {
    line1: 'Shop No. 1, Navkar City Centre',
    line2: 'Near Kanchipuram',
    city: 'Bhilwara',
    state: 'Rajasthan',
    pin: '311001',
  },

  // TODO(studio): confirm before publishing.
  whatsapp: '', // e.g. '919XXXXXXXXX' — drives every enquiry CTA
  email: '',
  phone: '',
} as const;

/**
 * The palette, sampled from the studio's own photography rather than chosen.
 *
 * She works in sorbets: fuchsia, citrine, lilac, violet — deliberately against
 * the traditional red-and-gold register. The site therefore sits on warm ivory
 * and lets the clothes carry the colour, with a single accent used sparingly.
 */
export const COLOR = {
  ivory: '#FBF8F3',
  paper: '#F4EFE7',
  sand: '#E5DCCE',
  ink: '#2A2622',
  inkSoft: '#6B635B',

  fuchsia: '#C8407E',
  citrine: '#D9AE3B',
  lilac: '#B7A3D6',
  violet: '#54459B',
  wine: '#6E3541',
  leaf: '#7A8B62',

  /** Aged zari — used for hairlines and motif strokes, never as fill. */
  zari: '#B08D4F',
} as const;

/** Collection names taken from her grid and highlight covers. */
export const COLLECTION_NAMES = [
  'Gulbahar',
  'The Florals',
  'Summer Edit',
  'Sorbet Suite',
  'Elevated Basics',
  'Festive Atelier',
] as const;

/**
 * Voice notes, drawn from her real captions.
 *
 * "There's a lightness to this one — in the fabric, in the way it moves,
 *  in the way she looked when she first saw it. We noticed."
 * "Citrine yellow. Hand-embroidered detail."
 * "Trousseau, redone."
 *
 * Short. Observational. First-person plural. Never salesy, never ornate.
 * Copy on this site is written to match.
 */
export const VOICE = {
  tagline: 'Ethereal pieces, handcrafted.',
  sub: 'Slow fashion, stitched in sunshine. Made in Bhilwara, worn everywhere.',
} as const;
