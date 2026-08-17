/**
 * catalogue.ts — collections, pieces and techniques.
 *
 * Everything here is modelled on pieces visible in the studio's own feed. Names,
 * colours, fabrics and handwork are taken from her captions where she stated
 * them ("Citrine yellow. Hand-embroidered detail.", "Sorbet Suite", "Gulbahar").
 *
 * Images are PLACEHOLDERS. Each piece declares the crop and dominant colour it
 * expects, so swapping in real photography is a one-line change per piece and
 * the layout will not move.
 */

export type Technique =
  | 'thread'
  | 'shisha'
  | 'zari'
  | 'sequin'
  | 'applique';

export interface TechniqueInfo {
  id: Technique;
  name: string;
  local: string;
  /** One line, in the studio's voice. */
  line: string;
  /** What it actually is, plainly. */
  body: string;
  /** Roughly how long a piece of it takes, for the "slow fashion" claim. */
  hours: string;
  /** Macro of the technique on an actual garment. */
  image: string;
}

/**
 * The five techniques visible in her work. Deliberately limited to what can be
 * seen in the reference — aari, gota patti and beadwork are NOT listed, because
 * the studio has not confirmed working in them and the brief was explicit that
 * traditions must not be combined speculatively.
 */
export const TECHNIQUES: TechniqueInfo[] = [
  {
    id: 'thread',
    image: '/images/handwork/thread.jpg',
    name: 'Thread embroidery',
    local: 'Resham',
    line: 'The outline of everything.',
    body:
      'Fine silk thread worked by hand into vines, butis and borders. Satin stitch for the filled shapes, back stitch for the lines that hold them together. It is the slowest part of any piece and the first thing you notice up close.',
    hours: '6–14 hours a panel',
  },
  {
    id: 'shisha',
    image: '/images/handwork/shisha.jpg',
    name: 'Mirror work',
    local: 'Shisha',
    line: 'Held down by hand, one ring at a time.',
    body:
      'Each mirror is fixed with a ring of anchor stitches worked around its edge — no glue, no backing. The stitches are the setting. Catch the light from across a room and you will see why it survives.',
    hours: '2–4 minutes a mirror',
  },
  {
    id: 'zari',
    image: '/images/handwork/zari.jpg',
    name: 'Metallic thread',
    local: 'Zari',
    line: 'Aged gold, never bright.',
    body:
      'Flattened metallic thread couched onto the surface rather than pulled through it, which is what keeps it sitting proud and catching light. Used along necklines and hems, sparingly.',
    hours: '4–10 hours a border',
  },
  {
    id: 'sequin',
    image: '/images/handwork/sequin.jpg',
    name: 'Sequin scallop',
    local: 'Sitara',
    line: 'The scallop along a hem.',
    body:
      'Sequins set individually along a scalloped edge, each anchored with its own stitch. Worked in tonal colours rather than contrast, so the border reads as texture before it reads as shine.',
    hours: '8–16 hours a hem',
  },
  {
    id: 'applique',
    image: '/images/handwork/applique.jpg',
    name: 'Floral appliqué',
    local: 'Kaam',
    line: 'Flowers laid onto organza.',
    body:
      'Small cut flowers stitched onto sheer organza so they appear to float. Every edge is turned and secured by hand — on a transparent ground there is nowhere for a shortcut to hide.',
    hours: '20–40 minutes a flower',
  },
];

export const TECHNIQUE_BY_ID = Object.fromEntries(
  TECHNIQUES.map((t) => [t.id, t])
) as Record<Technique, TechniqueInfo>;

export interface Piece {
  slug: string;
  name: string;
  collection: string;
  /** Garment type, as she describes them. */
  type: string;
  colour: string;
  /** Dominant colour — still used for the enquiry swatch and card dot. */
  tint: string;
  fabric: string;
  techniques: Technique[];
  /** One line in her voice, for the card. */
  note: string;
  occasion: string[];
  /** Portrait aspect for the card image slot. */
  ratio: '3/4' | '4/5';
  /**
   * Real photography, in display order — first is the primary shot.
   *
   * These are frame-grabs from the studio's own Instagram, upscaled. They are
   * genuinely her garments, which is why they are here rather than placeholders,
   * but they are low resolution and should be replaced with the originals.
   */
  images: string[];
}

const IMG = '/images/pieces';

export const PIECES: Piece[] = [
  {
    slug: 'gulbahar',
    name: 'Gulbahar',
    collection: 'Gulbahar',
    type: 'Kurta set with organza dupatta',
    colour: 'Fuchsia',
    tint: '#C8407E',
    fabric: 'Silk organza',
    techniques: ['thread', 'zari'],
    note: 'There is a lightness to this one — in the fabric, and in the way it moves.',
    occasion: ['Festive', 'Wedding guest'],
    ratio: '3/4',
    images: [
      `${IMG}/gulbahar-2.jpg`,
      `${IMG}/gulbahar-1.jpg`,
      `${IMG}/gulbahar-detail.jpg`,
      `${IMG}/gulbahar-5.jpg`,
      `${IMG}/gulbahar-4.jpg`,
      `${IMG}/gulbahar-3.jpg`,
    ],
  },
  {
    slug: 'citrine',
    name: 'Citrine',
    collection: 'Summer Edit',
    type: 'Lehenga set',
    colour: 'Citrine yellow',
    tint: '#D9AE3B',
    fabric: 'Organza over cotton silk',
    techniques: ['shisha', 'sequin', 'thread'],
    note: 'Citrine yellow. Hand-embroidered detail, all the way along the hem.',
    occasion: ['Wedding guest', 'Mehendi'],
    ratio: '3/4',
    images: [`${IMG}/citrine-1.jpg`, `${IMG}/citrine-2.jpg`],
  },
  {
    slug: 'violet',
    name: 'Violet',
    collection: 'Festive Atelier',
    type: 'Kurta set with sheer dupatta',
    colour: 'Deep violet',
    tint: '#54459B',
    fabric: 'Silk',
    techniques: ['sequin', 'zari'],
    note: 'The kind of violet that makes you stop and think. Trousseau, redone.',
    occasion: ['Festive', 'Reception'],
    ratio: '3/4',
    images: [`${IMG}/violet-1.jpg`, `${IMG}/violet-2.jpg`],
  },
  {
    slug: 'marigold',
    name: 'Marigold',
    collection: 'Sorbet Suite',
    type: 'Suit set with dupatta',
    colour: 'Marigold and blush',
    tint: '#D9AE3B',
    fabric: 'Chanderi',
    techniques: ['zari', 'thread'],
    note: 'A case against the traditional reds and golds, for one season at least.',
    occasion: ['Summer wedding', 'Bridesmaid'],
    ratio: '4/5',
    images: [`${IMG}/marigold-1.jpg`, `${IMG}/marigold-2.jpg`],
  },
  {
    slug: 'the-florals',
    name: 'The Florals',
    collection: 'The Florals',
    type: 'Kurta set with organza dupatta',
    colour: 'Ivory',
    tint: '#EFE7D8',
    fabric: 'Sheer organza',
    techniques: ['applique', 'thread'],
    note: 'Flowers laid onto organza, so they look like they are floating.',
    occasion: ['Day wedding', 'Festive'],
    ratio: '4/5',
    images: [`${IMG}/florals-1.jpg`, `${IMG}/ivory-detail.jpg`],
  },
  {
    slug: 'coral',
    name: 'Coral',
    collection: 'Elevated Basics',
    type: 'Kurta with embroidered yoke',
    colour: 'Coral',
    tint: '#E08A72',
    fabric: 'Cotton silk',
    techniques: ['thread'],
    note: 'Quiet handwork, on something you can wear on an ordinary day.',
    occasion: ['Day', 'Brunch'],
    ratio: '4/5',
    images: [`${IMG}/coral-1.jpg`],
  },
];

export interface Collection {
  slug: string;
  name: string;
  line: string;
  tint: string;
}

export const COLLECTIONS: Collection[] = [
  { slug: 'gulbahar', name: 'Gulbahar', line: 'Fuchsia, organza and thread.', tint: '#C8407E' },
  { slug: 'summer-edit', name: 'Summer Edit', line: 'Citrine, mirrors, and light.', tint: '#D9AE3B' },
  { slug: 'festive-atelier', name: 'Festive Atelier', line: 'Violet, wine, and evening.', tint: '#54459B' },
  { slug: 'sorbet-suite', name: 'Sorbet Suite', line: 'Against the reds and golds.', tint: '#E0B75B' },
  { slug: 'the-florals', name: 'The Florals', line: 'Appliqué flowers on sheer ground.', tint: '#D8C7B4' },
  { slug: 'elevated-basics', name: 'Elevated Basics', line: 'Handwork for ordinary days.', tint: '#E8E0D2' },
];

export function pieceBySlug(slug: string) {
  return PIECES.find((p) => p.slug === slug);
}

export function piecesByTechnique(t: Technique) {
  return PIECES.filter((p) => p.techniques.includes(t));
}

/** Every occasion mentioned across the catalogue, for the filter row. */
export const OCCASIONS = Array.from(new Set(PIECES.flatMap((p) => p.occasion))).sort();

/** Every photograph in the catalogue, flattened — used by the home lookbook. */
export const ALL_IMAGES: { src: string; piece: Piece }[] = PIECES.flatMap((p) =>
  p.images.map((src) => ({ src, piece: p }))
);
