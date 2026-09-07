/**
 * PieceCard.tsx — a single piece in a grid.
 *
 * Every card still names its handwork. That is the argument the whole site
 * rests on: you cannot look at a piece here without being told, in plain words,
 * what was done to it by hand. The card is not a card — image, name, cloth,
 * techniques, no border, no box.
 */

import Link from 'next/link';
import Figure from './Figure';
import Reveal from './Reveal';
import { TECHNIQUE_BY_ID, type Piece } from '@/lib/catalogue';

export default function PieceCard({
  piece,
  index = 0,
  showCollection = false,
  id,
}: {
  piece: Piece;
  index?: number;
  /** Name the collection above the piece, on pages that mix collections. */
  showCollection?: boolean;
  id?: string;
}) {
  return (
    <Reveal as="article" delay={(index % 3) * 80} id={id}>
      <Link href={`/pieces/${piece.slug}`}>
        <Figure
          src={piece.images[0]}
          alt={`${piece.name} — ${piece.type} in ${piece.colour}`}
          ratio={piece.ratio}
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
          hover
          pending={`${piece.name} — ${piece.type}`}
        />

        <div className="card__body">
          {showCollection && <p className="card__collection">{piece.collection}</p>}
          <h3 className="card__name">{piece.name}</h3>
          <p className="card__meta">
            {piece.type} · {piece.fabric}
          </p>
          <ul className="card__work" aria-label="Handwork">
            {piece.techniques.map((t) => (
              <li key={t}>{TECHNIQUE_BY_ID[t].name}</li>
            ))}
          </ul>
        </div>
      </Link>
    </Reveal>
  );
}
