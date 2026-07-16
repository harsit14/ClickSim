import type { RealmAnswerId } from '../content/endings'
import type { UniverseId } from '../content/universes/types'

export type AnswerChoreographyPhase = 'preview' | 'resolve'
export type AnswerVectorRole = 'frame' | 'primary' | 'secondary' | 'accent'

export interface AnswerVectorPath {
  readonly d: string
  readonly role: AnswerVectorRole
  readonly filled?: boolean
}

export interface AnswerVectorCircle {
  readonly cx: number
  readonly cy: number
  readonly r: number
  readonly role: AnswerVectorRole
  readonly hollow?: boolean
}

export interface AnswerMotionFingerprint {
  /** A stable, answer-specific cadence name used by the component and audio bridge. */
  readonly rhythm: string
  readonly drawMs: number
  readonly loopMs: number
  readonly staggerMs: number
}

export interface AnswerChoreographySpec {
  readonly answerId: RealmAnswerId
  readonly universeId: UniverseId
  /** Stable illustration identity. No two answers share one. */
  readonly motif: string
  /** Concise art-direction description; also protects non-color differentiation. */
  readonly composition: string
  readonly ariaDescription: string
  readonly audioCue: `answer.${RealmAnswerId}.resolve`
  readonly motion: AnswerMotionFingerprint
  readonly paths: readonly AnswerVectorPath[]
  readonly circles: readonly AnswerVectorCircle[]
}

const path = (d: string, role: AnswerVectorRole, filled = false): AnswerVectorPath => ({ d, role, filled })
const circle = (
  cx: number,
  cy: number,
  r: number,
  role: AnswerVectorRole,
  hollow = false,
): AnswerVectorCircle => ({ cx, cy, r, role, hollow })

function choreography(
  value: Omit<AnswerChoreographySpec, 'audioCue'>,
): AnswerChoreographySpec {
  return { ...value, audioCue: `answer.${value.answerId}.resolve` }
}

/**
 * Twenty-one deliberately different silhouettes. Primary geometry alone stays
 * recognizable in low-quality mode; secondary strokes supply atmosphere.
 */
export const ANSWER_CHOREOGRAPHIES: Readonly<Record<RealmAnswerId, AnswerChoreographySpec>> = {
  'emberlight-bank-fire': choreography({
    answerId: 'emberlight-bank-fire', universeId: 'emberlight', motif: 'banked-hearth',
    composition: 'A small flame sealed inside a diamond reserve with an unlit outer margin.',
    ariaDescription: 'A sheltered flame leaves a broad ring of darkness untouched.',
    motion: { rhythm: 'seal-and-breathe', drawMs: 1180, loopMs: 6200, staggerMs: 180 },
    paths: [
      path('M60 9 91 36 60 63 29 36Z', 'frame'),
      path('M60 18 80 36 60 54 40 36Z', 'primary'),
      path('M60 48C49 41 54 34 60 25c6 9 11 16 0 23Z', 'accent', true),
      path('M18 36H25M95 36h7', 'secondary'),
    ],
    circles: [circle(60, 36, 30, 'secondary', true)],
  }),
  'emberlight-spend-ember': choreography({
    answerId: 'emberlight-spend-ember', universeId: 'emberlight', motif: 'many-hearths',
    composition: 'A central ember spends itself into seven outward hearths and widening heat rings.',
    ariaDescription: 'One bright ember flares outward into many inhabited hearths.',
    motion: { rhythm: 'three-beat-flare', drawMs: 540, loopMs: 2100, staggerMs: 72 },
    paths: [
      path('M60 36 20 17M60 36 35 8M60 36 85 8M60 36 100 17M60 36 102 49M60 36 82 64M60 36 26 61', 'primary'),
      path('M60 48C47 41 53 29 60 18c8 12 13 23 0 30Z', 'accent', true),
      path('M10 36h15M95 36h15', 'secondary'),
    ],
    circles: [
      circle(20, 17, 3.6, 'accent'), circle(35, 8, 3, 'accent'), circle(85, 8, 3.3, 'accent'),
      circle(100, 17, 3, 'accent'), circle(102, 49, 3.6, 'accent'), circle(82, 64, 3, 'accent'),
      circle(26, 61, 3.3, 'accent'), circle(60, 36, 25, 'secondary', true),
    ],
  }),
  'emberlight-pass-spark': choreography({
    answerId: 'emberlight-pass-spark', universeId: 'emberlight', motif: 'spark-relay',
    composition: 'A spark crosses a branching constellation whose final figure escapes the original axis.',
    ariaDescription: 'A spark passes from hand to hand and becomes an unplanned constellation.',
    motion: { rhythm: 'relay-and-depart', drawMs: 860, loopMs: 4400, staggerMs: 240 },
    paths: [
      path('M13 47 34 36 54 43 73 24 105 16M54 43 78 56 106 50', 'primary'),
      path('M13 47 22 29M34 36 40 18M73 24 89 34', 'secondary'),
      path('M101 11l4 5 6 1-5 4-1 6-4-5-6-1 5-4Z', 'accent', true),
    ],
    circles: [circle(13, 47, 4, 'accent'), circle(34, 36, 3.2, 'accent'), circle(54, 43, 3.2, 'accent'), circle(73, 24, 3.2, 'accent'), circle(78, 56, 3.2, 'accent'), circle(106, 50, 3.2, 'accent')],
  }),

  'tidefall-carry-names': choreography({
    answerId: 'tidefall-carry-names', universeId: 'tidefall', motif: 'name-ark',
    composition: 'An ark-shaped ledger rises above a wave while name strokes lift from submerged doors.',
    ariaDescription: 'Names rise into an ark while the drowned houses remain beneath the tide.',
    motion: { rhythm: 'measured-lift', drawMs: 1320, loopMs: 5600, staggerMs: 210 },
    paths: [
      path('M27 39h66l-8 15H35Z', 'primary'),
      path('M39 39V22h42v17M47 32h7M61 32h12M47 27h18', 'primary'),
      path('M7 58c12-8 22 8 34 0s22 8 36 0 23 7 36-1', 'frame'),
      path('M43 48v-8M55 49V37M67 49V34M78 48V39', 'accent'),
      path('M16 49h13M91 48h15', 'secondary'),
    ],
    circles: [],
  }),
  'tidefall-trust-current': choreography({
    answerId: 'tidefall-trust-current', universeId: 'tidefall', motif: 'archive-current',
    composition: 'Rectangular archive leaves soften into fish and silt along an uninterrupted current.',
    ariaDescription: 'Archive pages dissolve into fish, silt, and a living current.',
    motion: { rhythm: 'continuous-undertow', drawMs: 980, loopMs: 7300, staggerMs: 95 },
    paths: [
      path('M8 25c14-13 27 13 42 0s28 13 42 0 18 0 22 4M7 47c12-12 25 13 41 0s28 12 43 0 18-1 24 3', 'primary'),
      path('M21 31h17v13H21ZM27 34h7M27 38h5', 'frame'),
      path('M56 38c8-7 15-6 21 0-6 6-13 7-21 0Zm21 0 8-7v14Z', 'accent'),
      path('M93 31c5-4 10-4 14 0-4 4-9 4-14 0Z', 'secondary'),
    ],
    circles: [circle(44, 51, 1.6, 'secondary'), circle(50, 55, 1.2, 'secondary'), circle(88, 55, 1.4, 'secondary')],
  }),
  'tidefall-survivors-choose': choreography({
    answerId: 'tidefall-survivors-choose', universeId: 'tidefall', motif: 'many-shores',
    composition: 'Three different boats diverge from one flooded threshold toward three unequal shores.',
    ariaDescription: 'Survivors steer separate boats toward several chosen shores.',
    motion: { rhythm: 'asynchronous-fleet', drawMs: 760, loopMs: 5100, staggerMs: 430 },
    paths: [
      path('M58 58V39h12v19M61 45h6', 'frame'),
      path('M62 40 28 20M64 40 64 13M68 42 101 26', 'primary'),
      path('M17 22h23l-5 7H22ZM53 12h22l-5 7H58ZM90 27h23l-5 7H95Z', 'accent'),
      path('M4 60c18-7 33 7 50 0s33 7 61 0', 'secondary'),
    ],
    circles: [circle(28, 20, 2.2, 'secondary'), circle(64, 13, 2.2, 'secondary'), circle(101, 26, 2.2, 'secondary')],
  }),

  'verdance-prune-witnesses': choreography({
    answerId: 'verdance-prune-witnesses', universeId: 'verdance', motif: 'witnessed-cut',
    composition: 'A forked branch is cut at a bright notch between two witnessing circles.',
    ariaDescription: 'Two witnesses face a named branch as one deliberate cut admits light.',
    motion: { rhythm: 'name-cut-settle', drawMs: 1450, loopMs: 6400, staggerMs: 320 },
    paths: [
      path('M58 64V42L38 23M58 43 78 19M38 23 25 16M39 24 30 34M78 19 91 12M76 21 88 31', 'primary'),
      path('M51 39l14 8M53 34l14 8', 'accent'),
      path('M18 55c10-9 18-8 26 0M76 55c9-8 18-9 27 0', 'secondary'),
      path('M44 61h32', 'frame'),
    ],
    circles: [circle(26, 53, 4, 'accent', true), circle(94, 53, 4, 'accent', true)],
  }),
  'verdance-open-canopy': choreography({
    answerId: 'verdance-open-canopy', universeId: 'verdance', motif: 'wind-opened-canopy',
    composition: 'Two broad crowns part around a vertical shaft of sky, wind, and new seedlings.',
    ariaDescription: 'Wind parts the old canopy and sunlight reaches seedlings below.',
    motion: { rhythm: 'gust-open-rest', drawMs: 1040, loopMs: 4700, staggerMs: 140 },
    paths: [
      path('M9 35C12 12 31 8 54 23 48 35 31 40 9 35ZM111 35C108 12 89 8 66 23c6 12 23 17 45 12Z', 'primary', true),
      path('M60 7v54M54 17l6-10 6 10M49 47c6 0 9 5 11 14M71 47c-6 0-9 5-11 14', 'accent'),
      path('M16 48c18-8 27 6 39-2M105 47c-15-7-25 5-38-2', 'secondary'),
    ],
    circles: [circle(60, 42, 5, 'secondary', true)],
  }),
  'verdance-graft-inheritance': choreography({
    answerId: 'verdance-graft-inheritance', universeId: 'verdance', motif: 'living-graft',
    composition: 'Two unlike roots cross, bind at a wrapped graft, and flower in each other’s shapes.',
    ariaDescription: 'Two lineages meet at a living graft and flower as something shared.',
    motion: { rhythm: 'counterpulse-join', drawMs: 1220, loopMs: 3900, staggerMs: 260 },
    paths: [
      path('M20 62C29 47 44 48 54 36L74 12M101 62C90 48 75 49 66 36L46 12', 'primary'),
      path('M50 31h20M49 35h22M50 39h20', 'accent'),
      path('M74 12c9 2 13 8 11 16-8-1-13-7-11-16ZM46 12c-9 2-13 8-11 16 8-1 13-7 11-16Z', 'primary', true),
      path('M24 56 13 46M96 56l11-10', 'secondary'),
    ],
    circles: [circle(60, 35, 5.5, 'accent', true)],
  }),

  'clockwork-keep-warnings': choreography({
    answerId: 'clockwork-keep-warnings', universeId: 'clockwork', motif: 'open-warning',
    composition: 'A forecast dial retains its ticks but opens a visible appeal gate through its rim.',
    ariaDescription: 'A warning dial includes an open gate through which refusal can pass.',
    motion: { rhythm: 'scan-appeal-pause', drawMs: 920, loopMs: 6800, staggerMs: 110 },
    paths: [
      path('M85 20a31 31 0 1 0 4 39M60 36 79 25M60 36v18', 'primary'),
      path('M90 45h20M102 37l8 8-8 8', 'accent'),
      path('M60 8v7M37 14l4 6M20 36h7M37 58l4-6M60 64v-7M82 58l-4-6', 'secondary'),
      path('M86 20 97 9', 'frame'),
    ],
    circles: [circle(60, 36, 4, 'accent')],
  }),
  'clockwork-break-schedule': choreography({
    answerId: 'clockwork-break-schedule', universeId: 'clockwork', motif: 'shattered-schedule',
    composition: 'A clock face breaks into unequal arcs while both hands leave the center on separate trajectories.',
    ariaDescription: 'A schedule shatters and its freed hands point beyond the broken dial.',
    motion: { rhythm: 'snap-scatter-silence', drawMs: 430, loopMs: 3200, staggerMs: 38 },
    paths: [
      path('M43 10A29 29 0 0 0 30 19M22 31a30 30 0 0 0 7 25M43 65a30 30 0 0 0 30-3M86 49a29 29 0 0 0-4-26M70 10a29 29 0 0 1 9 6', 'primary'),
      path('M58 36 91 14M58 36 27 8', 'accent'),
      path('M52 28 45 19M65 44l10 11M42 43l-12 9M73 30l13-7', 'secondary'),
    ],
    circles: [circle(58, 36, 4, 'accent'), circle(91, 14, 2.5, 'secondary'), circle(27, 8, 2.5, 'secondary')],
  }),
  'clockwork-unscheduled-hour': choreography({
    answerId: 'clockwork-unscheduled-hour', universeId: 'clockwork', motif: 'private-hour',
    composition: 'A complete civic dial surrounds one deliberately blank square hour outside its mechanism.',
    ariaDescription: 'A public clock keeps one quiet square of time beyond inspection.',
    motion: { rhythm: 'tick-long-dwell', drawMs: 1620, loopMs: 8400, staggerMs: 520 },
    paths: [
      path('M73 11a27 27 0 1 0 14 18M60 36V19M60 36l-12 9', 'primary'),
      path('M88 9h20v20H88Z', 'accent'),
      path('M60 9v6M34 19l5 4M27 45h7M44 63l3-6M73 62l-3-6', 'secondary'),
      path('M82 16 72 25', 'frame'),
    ],
    circles: [circle(60, 36, 3.5, 'accent')],
  }),

  'brahmalok-open-margin': choreography({
    answerId: 'brahmalok-open-margin', universeId: 'brahmalok', motif: 'open-folio-margin',
    composition: 'A written folio stops before an open right edge where a small unanswered star waits.',
    ariaDescription: 'A creator’s folio keeps one margin open for an answer it cannot own.',
    motion: { rhythm: 'write-stop-listen', drawMs: 1880, loopMs: 7200, staggerMs: 170 },
    paths: [
      path('M25 10h67v52H25ZM33 21h38M33 29h49M33 37h34M33 45h44M33 53h27', 'primary'),
      path('M92 10v52', 'frame'),
      path('M88 17h8M88 55h8', 'accent'),
      path('M103 31l2 4 5 1-4 3 1 5-4-3-5 2 2-5-3-4 5 1Z', 'secondary', true),
    ],
    circles: [],
  }),
  'brahmalok-release-work': choreography({
    answerId: 'brahmalok-release-work', universeId: 'brahmalok', motif: 'released-folio',
    composition: 'A folio opens below as its written line becomes a bird climbing beyond the frame.',
    ariaDescription: 'A created page lifts from its folio and flies beyond the maker’s reach.',
    motion: { rhythm: 'loosen-lift-depart', drawMs: 820, loopMs: 5300, staggerMs: 310 },
    paths: [
      path('M17 53c14-7 28-5 43 4 15-9 29-11 43-4V17c-13-5-28-2-43 7-15-9-30-12-43-7Z', 'frame'),
      path('M60 24v33', 'primary'),
      path('M54 24C61 16 69 12 79 9M79 9c7 0 13 3 18 9-8-3-15-2-20 3M79 9c-2 7-1 13 4 18', 'accent'),
      path('M25 30h20M25 37h15M76 37h18M76 44h14', 'secondary'),
    ],
    circles: [],
  }),
  'brahmalok-many-hands': choreography({
    answerId: 'brahmalok-many-hands', universeId: 'brahmalok', motif: 'many-handed-revision',
    composition: 'Five stylus-lines enter from different edges and revise a shared many-petaled folio.',
    ariaDescription: 'Many hands revise one living folio without a single final author.',
    motion: { rhythm: 'staggered-counterwrite', drawMs: 1360, loopMs: 4600, staggerMs: 205 },
    paths: [
      path('M60 18c12 0 20 8 20 18s-8 18-20 18-20-8-20-18 8-18 20-18Z', 'primary'),
      path('M60 36 14 15M60 36 31 65M60 36 60 4M60 36 91 64M60 36 107 17', 'accent'),
      path('M51 25c8 3 11 11 9 21M69 25c-8 3-11 11-9 21M43 36h34', 'secondary'),
      path('M9 12h10M26 68l8-6M56 4h8M87 61l8 7M102 14l9-4', 'frame'),
    ],
    circles: [circle(60, 36, 4, 'accent')],
  }),

  'vishnulok-keep-shape': choreography({
    answerId: 'vishnulok-keep-shape', universeId: 'vishnulok', motif: 'sheltering-shape',
    composition: 'A steady refuge outline contains a changing school whose inner forms never repeat.',
    ariaDescription: 'A stable shelter holds changing lives without freezing their motion.',
    motion: { rhythm: 'steady-shell-inner-ebb', drawMs: 1540, loopMs: 6100, staggerMs: 125 },
    paths: [
      path('M21 57V34C21 17 37 9 60 9s39 8 39 25v23H21Z', 'primary'),
      path('M35 37c9-8 18-8 27 0-9 8-18 8-27 0Zm27 0 9-8v16ZM71 48c6-5 12-5 18 0-6 5-12 5-18 0Zm18 0 6-5v10Z', 'accent'),
      path('M29 57c9-8 18 6 29 0s20 6 33 0', 'secondary'),
    ],
    circles: [circle(48, 35, 1.2, 'frame'), circle(79, 47, 1, 'frame')],
  }),
  'vishnulok-preserve-promise': choreography({
    answerId: 'vishnulok-preserve-promise', universeId: 'vishnulok', motif: 'promise-ribbon',
    composition: 'Two unlike vessels exchange one continuous ribbon through an open infinity loop.',
    ariaDescription: 'A promise crosses between changed forms while neither form is held fixed.',
    motion: { rhythm: 'exchange-and-return', drawMs: 1120, loopMs: 3500, staggerMs: 175 },
    paths: [
      path('M10 36c13-20 29-20 50 0s37 20 50 0c-13-20-29-20-50 0S23 56 10 36Z', 'primary'),
      path('M24 36c8-9 15-9 24 0-9 9-16 9-24 0ZM72 36c8-9 15-9 24 0-9 9-16 9-24 0Z', 'secondary'),
      path('M54 32l6 4-6 4M66 40l-6-4 6-4', 'accent'),
    ],
    circles: [circle(60, 36, 4.5, 'accent', true)],
  }),
  'vishnulok-returned-name': choreography({
    answerId: 'vishnulok-returned-name', universeId: 'vishnulok', motif: 'self-naming-return',
    composition: 'A returned figure steps from an open cocoon and writes a new star-name above itself.',
    ariaDescription: 'A returned life emerges from shelter and names itself in new stars.',
    motion: { rhythm: 'emerge-pause-name', drawMs: 1720, loopMs: 6700, staggerMs: 360 },
    paths: [
      path('M31 58C18 46 18 22 38 10c16 9 20 29 9 48M89 58c13-12 13-36-7-48-16 9-20 29-9 48', 'frame'),
      path('M60 31c-8 0-12 7-12 14v15M60 31c8 0 12 7 12 14v15M60 31V18', 'primary'),
      path('M53 12l7-7 7 7M78 18l3 5 6 1-5 4 1 6-5-3-6 3 2-6-5-4 6-1Z', 'accent'),
      path('M38 50 27 61M82 50l11 11', 'secondary'),
    ],
    circles: [circle(60, 25, 5, 'accent', true)],
  }),

  'kailash-carry-seed': choreography({
    answerId: 'kailash-carry-seed', universeId: 'kailash', motif: 'seed-descent',
    composition: 'A single seed descends a switchback from a dissolving summit into an unseen valley.',
    ariaDescription: 'One seed is carried down a long mountain path while the summit releases everything else.',
    motion: { rhythm: 'seven-step-descent', drawMs: 1980, loopMs: 7800, staggerMs: 470 },
    paths: [
      path('M12 61 60 7l48 54M28 61l32-38 32 38', 'frame'),
      path('M60 15 45 27 69 34 48 42 75 49 54 58', 'primary'),
      path('M60 10c-6 2-9 7-8 13 6 0 10-5 8-13Zm0 0c6 2 9 7 8 13-6 0-10-5-8-13Z', 'accent', true),
      path('M22 61h76', 'secondary'),
    ],
    circles: [circle(54, 58, 3.2, 'accent')],
  }),
  'kailash-complete-dissolution': choreography({
    answerId: 'kailash-complete-dissolution', universeId: 'kailash', motif: 'released-aperture',
    composition: 'Concentric ring fragments move outward, leaving a precisely empty aperture.',
    ariaDescription: 'A ring releases its pieces until only an open center remains.',
    motion: { rhythm: 'widen-fade-stillness', drawMs: 2260, loopMs: 9100, staggerMs: 680 },
    paths: [
      path('M60 11a25 25 0 0 1 21 11M88 34a25 25 0 0 1-5 20M74 63a25 25 0 0 1-20 2M42 59a25 25 0 0 1-8-19M35 28a25 25 0 0 1 15-15', 'primary'),
      path('M60 3v14M60 55v14M27 36h14M79 36h14M37 13l10 11M73 49l10 11M83 13 73 24M47 49 37 60', 'secondary'),
      path('M60 26a10 10 0 1 1 0 20 10 10 0 1 1 0-20Z', 'accent'),
    ],
    circles: [circle(60, 36, 4.5, 'frame', true)],
  }),
  'kailash-leave-path': choreography({
    answerId: 'kailash-leave-path', universeId: 'kailash', motif: 'open-pass',
    composition: 'Two mountain faces hold an unclosed pass while footprints continue beyond the frame.',
    ariaDescription: 'An open mountain path crosses the ending and continues beyond sight.',
    motion: { rhythm: 'trace-cross-open-hold', drawMs: 2420, loopMs: 10200, staggerMs: 590 },
    paths: [
      path('M4 62 36 14l20 30M116 62 86 17 65 45', 'frame'),
      path('M58 68c-5-11-5-20 2-28s9-15 6-29', 'primary'),
      path('M55 58h8M56 48h8M58 38h8M61 28h8M63 18h8', 'accent'),
      path('M12 62h36M75 62h34M30 36l7-5M91 39l-7-6', 'secondary'),
    ],
    circles: [circle(67, 7, 3, 'accent', true)],
  }),
}

export const ANSWER_CHOREOGRAPHY_EVENT = 'clicksim:answer-choreography' as const

export interface AnswerChoreographyEventDetail {
  readonly answerId: RealmAnswerId
  readonly universeId: UniverseId
  readonly motif: string
  readonly rhythm: string
  readonly phase: AnswerChoreographyPhase
  readonly audioCue: `answer.${RealmAnswerId}.resolve`
}

/** Pure bridge for presentation systems; visual state never depends on audio. */
export function answerChoreographyCue(
  answerId: RealmAnswerId,
  phase: AnswerChoreographyPhase,
): AnswerChoreographyEventDetail {
  const spec = ANSWER_CHOREOGRAPHIES[answerId]
  return {
    answerId,
    universeId: spec.universeId,
    motif: spec.motif,
    rhythm: spec.motion.rhythm,
    phase,
    audioCue: spec.audioCue,
  }
}

declare global {
  interface WindowEventMap {
    [ANSWER_CHOREOGRAPHY_EVENT]: CustomEvent<AnswerChoreographyEventDetail>
  }
}
