/**
 * PieceCard.tsx — a single piece in a grid.
 *
 * Every card names its handwork. That is the whole point of the site: you cannot
 * look at a Siri Couture piece anywhere on this site without being told, in
 * plain words, what was done to it by hand.
 */

import Link from 'next/link';
import Frame from './Frame';
import { TECHNIQUE_BY_ID, type Piece } from '@/lib/catalogue';

export default function PieceCard({ piece, index = 0 }: { piece: Piece; index?: number }) {
  return (
    <Link href={`/pieces/${piece.slug}`} className="card">
      <Frame
        tint={piece.tint}
        ratio={piece.ratio}
        seed={index * 7 + 3}
        label={`${piece.name} — ${piece.type}`}
      />

      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{piece.name}</h3>
          <span className="card__colour" style={{ background: piece.tint }} aria-hidden="true" />
        </div>

        <p className="card__type">
          {piece.type} · {piece.fabric}
        </p>

        <ul className="card__work" aria-label="Handwork">
          {piece.techniques.map((t) => (
            <li key={t}>{TECHNIQUE_BY_ID[t].name}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
