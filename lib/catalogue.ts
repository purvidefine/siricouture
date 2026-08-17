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
    name: 'Thread embroidery',
    local: 'Resham',
    line: 'The outline of everything.',
    body:
      'Fine silk thread worked by hand into vines, butis and borders. Satin stitch for the filled shapes, back stitch for the lines that hold them together. It is the slowest part of any piece and the first thing you notice up close.',
    hours: '6–14 hours a panel',
  },
  {
    id: 'shisha',
    name: 'Mirror work',
    local: 'Shisha',
    line: 'Held down by hand, one ring at a time.',
    body:
      'Each mirror is fixed with a ring of anchor stitches worked around its edge — no glue, no backing. The stitches are the setting. Catch the light from across a room and you will see why it survives.',
    hours: '2–4 minutes a mirror',
  },
  {
    id: 'zari',
    name: 'Metallic thread',
    local: 'Zari',
    line: 'Aged gold, never bright.',
    body:
      'Flattened metallic thread couched onto the surface rather than pulled through it, which is what keeps it sitting proud and catching light. Used along necklines and hems, sparingly.',
    hours: '4–10 hours a border',
  },
  {
    id: 'sequin',
    name: 'Sequin scallop',
    local: 'Sitara',
    line: 'The scallop along a hem.',
    body:
      'Sequins set individually along a scalloped edge, each anchored with its own stitch. Worked in tonal colours rather than contrast, so the border reads as texture before it reads as shine.',
    hours: '8–16 hours a hem',
  },
  {
    id: 'applique',
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
  /** Placeholder tint — replaced by real photography. */
  tint: string;
  fabric: string;
  techniques: Technique[];
  /** One line in her voice, for the card. */
  note: string;
  occasion: string[];
  /** Portrait aspect for the card image slot. */
  ratio: '3/4' | '4/5';
}

export const PIECES: Piece[] = [
  {
    slug: 'gulbahar-fuchsia-set',
    name: 'Gulbahar',
    collection: 'Gulbahar',
    type: 'Kurta set with dupatta',
    colour: 'Fuchsia',
    tint: '#C8407E',
    fabric: 'Silk organza',
    techniques: ['thread', 'zari'],
    note: 'There is a lightness to this one — in the fabric, and in the way it moves.',
    occasion: ['Festive', 'Wedding guest'],
    ratio: '3/4',
  },
  {
    slug: 'citrine-lehenga',
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
  },
  {
    slug: 'sorbet-suite',
    name: 'Sorbet Suite',
    collection: 'Sorbet Suite',
    type: 'Suit set with dupatta',
    colour: 'Marigold and lilac',
    tint: '#E0B75B',
    fabric: 'Chanderi',
    techniques: ['zari', 'thread'],
    note: 'A case against the traditional reds and golds, for one season at least.',
    occasion: ['Summer wedding', 'Bridesmaid'],
    ratio: '4/5',
  },
  {
    slug: 'violet-trousseau',
    name: 'Violet',
    collection: 'Festive Atelier',
    type: 'Kurta set',
    colour: 'Deep violet',
    tint: '#54459B',
    fabric: 'Silk',
    techniques: ['zari', 'sequin'],
    note: 'The kind of violet that makes you stop and think. Trousseau, redone.',
    occasion: ['Festive', 'Reception'],
    ratio: '3/4',
  },
  {
    slug: 'the-florals-ivory',
    name: 'The Florals',
    collection: 'The Florals',
    type: 'Anarkali with dupatta',
    colour: 'Ivory',
    tint: '#EFE7D8',
    fabric: 'Sheer organza',
    techniques: ['applique', 'thread'],
    note: 'Flowers laid onto organza, so they look like they are floating.',
    occasion: ['Day wedding', 'Festive'],
    ratio: '3/4',
  },
  {
    slug: 'wine-anarkali',
    name: 'Wine',
    collection: 'Festive Atelier',
    type: 'Floor-length anarkali',
    colour: 'Wine',
    tint: '#6E3541',
    fabric: 'Georgette',
    techniques: ['thread', 'sequin'],
    note: 'Cut long and full, with the work kept to the yoke and the sleeve.',
    occasion: ['Reception', 'Sangeet'],
    ratio: '3/4',
  },
  {
    slug: 'elevated-ivory-co-ord',
    name: 'Ivory Co-ord',
    collection: 'Elevated Basics',
    type: 'Co-ord set',
    colour: 'Ivory',
    tint: '#E8E0D2',
    fabric: 'Cotton silk',
    techniques: ['thread'],
    note: 'The one you will reach for when nothing else feels right.',
    occasion: ['Day', 'Travel'],
    ratio: '4/5',
  },
  {
    slug: 'blush-dress',
    name: 'Blush',
    collection: 'Elevated Basics',
    type: 'Dress',
    colour: 'Blush',
    tint: '#E7C9D2',
    fabric: 'Cotton silk',
    techniques: ['thread'],
    note: 'Quiet handwork, on something you can wear on an ordinary day.',
    occasion: ['Day', 'Brunch'],
    ratio: '4/5',
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
  { slug: 'the-florals', name: 'The Florals', line: 'Appliqué flowers on sheer ground.', tint: '#D8C7B4' },
  { slug: 'summer-edit', name: 'Summer Edit', line: 'Citrine, mirrors, and light.', tint: '#D9AE3B' },
  { slug: 'sorbet-suite', name: 'Sorbet Suite', line: 'Against the reds and golds.', tint: '#E0B75B' },
  { slug: 'festive-atelier', name: 'Festive Atelier', line: 'Violet, wine, and evening.', tint: '#54459B' },
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
