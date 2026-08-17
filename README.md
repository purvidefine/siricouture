# Siri Couture — *Made by hand. Made for you.*

A scroll-driven 3D atelier experience for a contemporary Indian couture label in
Bhilwara. The visitor watches a length of handloom cotton become a garment, one
stitch at a time.

```
THREAD → STITCH → MOTIF → HAND → PIECE → GARMENT → WOMAN
```

Next.js 14 (App Router) · React Three Fiber · three.js · Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## The central decision: everything is generated, nothing is downloaded

There are no `.glb` models, no scanned fabric maps, no photographs and no audio
files in this repository. Every surface, every length of thread and every sound
is produced in code at runtime. That was originally a constraint of the build
environment, but it turned out to serve the brief: procedural cloth can be built
as an *actual weave* rather than a photograph of one, which is what allows the
camera to sit two centimetres off the surface without falling apart.

| Element | How it is made |
|---|---|
| Cloth | Plain weave height field — warp and weft interlacing on a checkerboard, with per-thread gauge variation (slub). Sobel-filtered into a normal map. `lib/textures.ts` |
| Thread | Real tube geometry per stitch, merged into one buffer per thread type. `lib/stitchGeometry.ts` |
| Needle | Lathed steel profile with a real eye. `components/scene/Needle.tsx` |
| Motif | Generated stitch-by-stitch from motif geometry, not drawn as a pattern. `lib/craft.ts` |
| Sound | Web Audio: filtered pink-noise transients for the pierce, the pull, the cloth. `lib/audio.ts` |
| Environment | Canvas-drawn equirect passed through PMREM. `makeAtelierEnv()` |

## Authenticity notes

**The motif is a *buti*** — the small floral sprig that is the backbone of
Rajasthani hand embroidery. One stem, two leaves, a five-petal flower, a scatter
of seed stitches. No mandalas, no paisley, no peacocks, no borders, no palace
architecture. It is worked in the order an artisan actually works it: stem in
back stitch, then leaves in satin, then petals, then the zari knots at the
centre last and tightest. The scroll reveal follows that order exactly.

**Nothing is symmetrical.** Stitch length wanders by about a tenth, the needle
lands slightly off the drawn line, satin stitches overshoot their edge unevenly,
and thread tension varies per stitch. All of it is seeded (`buildButi(20240817)`)
so the piece is identical on every visit — a finished garment does not re-stitch
itself between viewings — but never machine-regular.

**The cloth is dragged by the work.** Three deformations run in the cloth's
vertex shader: resting folds, a live compression dimple under the needle, and
permanent pucker at every stitch already pulled tight. The third is the one that
matters — embroidery that leaves its ground undisturbed reads as a decal.

**The reverse is modelled.** Carry threads run under the cloth from one stitch's
exit to the next stitch's entry, duller and slacker than the face.

**One shared source of truth.** `computeNeedleState()` drives the needle mesh
*and* the cloth's dimple *and* the hand *and* the sound triggers, so the
compression in the weave is always exactly under the point of the needle.

## Scale

One world unit ≈ 20cm. The sample panel is 0.66 units (~13cm, hoop-sized), the
buti spans 0.22 units (~4.4cm), floss is ~0.4mm, and the opening shot frames
about 1.4cm of cloth. Thread gauge and stitch height are authored in world units
and deliberately *not* scaled with the motif, because floss thickness is a
property of the thread.

## Structure

```
app/                     shell, global styles
components/
  Experience.tsx         scroll harness — writes progress to a ref, never state
  scene/
    Scene.tsx            composition; <Driver> writes the frame bus first
    Cloth.tsx  Stitches.tsx  Needle.tsx  Hand.tsx  Garment.tsx  Atelier.tsx
  ui/                    Overlay, Chrome, Loader, CreateYourSiri, NoScript
lib/
  craft.ts               motif + stitch generation (the "brain")
  chapters.ts            the scroll score and camera keyframes
  live.ts                per-frame state bus
  needleMotion.ts        the mechanics of one stitch
  stitchGeometry.ts      stitches → merged tube geometry
  textures.ts            weave, floss, environment
  handTexture.ts         the artisan's hand
  audio.ts  quality.ts
```

**Scroll never re-renders React.** Progress is written to a ref; each scene
component reads the shared `LiveState` inside its own `useFrame`. `<Driver>` is
mounted first so it always writes before its siblings read.

**Reveal happens in the vertex shader.** Each vertex carries `aIndex` (global
make-order) and `aT` (position along its stitch). The stitch under the needle
grows along its own length rather than popping in. Geometry is never rebuilt
while scrolling.

## Performance and access

Three quality tiers are chosen at runtime from pointer type, viewport,
`hardwareConcurrency` and `deviceMemory` (`lib/quality.ts`). Mobile keeps all
seven chapters and the same motif; it loses geometry density, texture resolution
and the reverse-side carries. `prefers-reduced-motion` disables smooth scrolling
and hard-damps the camera. Sound is off until asked for. Without JavaScript the
seven movements render as text and the commission copy still works.

---

## Known gaps — read before showing a client

These are honest limitations, not oversights.

1. **The hand is a soft out-of-focus mass, not a modelled hand.** No photoscanned
   hand was available, and a procedural one would have landed exactly on the
   failure the brief warns about — plastic skin, mannequin fingers. It is
   therefore treated the way a 100mm macro at f/2.8 actually treats it: the pinch
   of thumb against forefinger reads, the rest falls away. **Replacing this with
   a real hand scan is the single highest-value upgrade.**

2. **The wearer is handled the same way** — a soft mass above the garment. Should
   be replaced with Siri Couture's own editorial photography or video.

3. **The garment is parametric,** not a cut pattern. It has shoulders, a waist
   and real hem folds, but it is a suggestion of a silhouette. A proper GLB of an
   actual Siri Couture piece would transform the last two chapters.

4. **No depth-of-field pass.** Near-field thread is dissolved in-shader to
   approximate defocus. A real DOF pass (`postprocessing`) would do this properly
   and is the second-highest-value upgrade.

5. **The craft is thread embroidery only.** Gota, mirror work, aari and
   beadwork are scaffolded in the palette and stitch-kind system but not built,
   because *which techniques Siri Couture genuinely works with was never
   confirmed.* Do not add them speculatively — the brief is explicit that
   traditions must not be randomly combined. Confirm with the studio first, then
   each becomes a new craft chapter with its own material, sound and motif.

6. **The enquiry form has no backend.** `CreateYourSiri.tsx` collects the fields
   and sets local state; wire it to the studio's endpoint or the WhatsApp
   Business API.

7. **Copy details are placeholders** — "roughly nine hours of work" and the
   Bhilwara references should be confirmed by the studio before publishing.
