/**
 * REFERENCE IMPLEMENTATION — Kailash Weather Fronts and the Long Rest.
 * See suggestion/README.md and LOKA_DEPTH_PLAN.md §5.
 *
 * This file is a self-contained sketch of the mid/end-game escalation for the
 * u7/canticle realm. On integration, everything here merges into
 * src/content/universes/f4-runtime.ts and reuses its private read/write
 * helpers; the local copies exist only so this folder compiles standalone.
 *
 * Design rules encoded here (from LOKA_DEPTH_PLAN.md):
 * - The mountain leads; the player answers by recomposing the existing cycle.
 * - A front is only "answered" when its composition predicate holds AND the
 *   player touched the cycle since the front was announced. This guarantees
 *   idle neutrality: a player who never edits keeps today's exact production.
 * - Every multiplier is bounded; the combined law factor never exceeds
 *   KAILASH_LAW_FACTOR_CEILING so the realm total stays under the ×5.0 budget.
 * - Fronts never punish. An unanswered front simply clears.
 * - No RNG: fronts rotate in fixed order so the state machine is
 *   deterministic and offline-safe. If the integrated version wants variety,
 *   it should draw from the realm's seeded rng, never Math.random().
 */
import type { EconomyAmount } from '../../src/content/universes/types'
import { amountFromNumber, amountToBoundedNumber } from '../../src/core/numeric/amount'
import { canticleStatus, type KailashAct } from '../../src/content/universes/f4-runtime'

type NumericLawState = Record<string, EconomyAmount>

function readNumber(
  state: Readonly<NumericLawState> | undefined,
  key: string,
  fallback = 0,
  maximum = 1_000_000,
): number {
  const value = state?.[key]
  if (!value) return fallback
  try {
    const numeric = amountToBoundedNumber(value)
    return Number.isFinite(numeric) && numeric >= 0 ? Math.min(maximum, numeric) : fallback
  } catch {
    return fallback
  }
}

function writeNumber(state: NumericLawState, key: string, value: number): void {
  state[key] = amountFromNumber(Math.max(0, Number.isFinite(value) ? value : 0))
}

// --- Front timeline -------------------------------------------------------

export const KAILASH_FRONT_CALM_SECONDS = 150
export const KAILASH_FRONT_APPROACH_SECONDS = 45
export const KAILASH_FRONT_ACTIVE_SECONDS = 210
/** Fraction of the active phase that must be answered to earn a Descent Trace. */
export const KAILASH_FRONT_ANSWER_FRACTION = 0.6
/** Carry-over bonus window granted into the calm after an answered front. */
export const KAILASH_FRONT_CARRY_SECONDS = 60
/** Hard ceiling for the combined front/carry/grace factor (see §6.3). */
export const KAILASH_LAW_FACTOR_CEILING = 1.8

export type KailashFrontPhase = 'calm' | 'approaching' | 'active'

export interface KailashFrontDef {
  readonly id: string
  readonly name: string
  readonly glyph: string
  /** What the mountain favors while this front is active. */
  readonly favoredRoles: readonly KailashAct[]
  readonly description: string
  readonly answer: string
  readonly silhouette: string
  readonly reducedMotionState: string
}

/**
 * Fixed rotation. Fire season is deliberately a far-ridge boundary condition,
 * never a spectacle: its only mechanical face is "shelter must sit beside
 * release", which is the realm's own stated ethic (guardrail 9).
 */
export const KAILASH_FRONTS: readonly KailashFrontDef[] = [
  {
    id: 'passing-snow',
    name: 'Passing Snow',
    glyph: '≋',
    favoredRoles: ['grace', 'rest'],
    description: 'A pale front crosses the ridge. The mountain favors grace and deliberate rest.',
    answer: 'hold at least three rests and two grace acts in the cycle',
    silhouette: 'snow veil advancing above one labeled silver descent',
    reducedMotionState: 'static snow band held at the ridge line with a text label',
  },
  {
    id: 'fire-season',
    name: 'Fire Season',
    glyph: '◇',
    favoredRoles: ['release'],
    description: 'A copper glow rises on the far ridge. Every release must sit beside shelter.',
    answer: 'keep at least one release, and shelter adjacent to every release',
    silhouette: 'thin copper horizon behind two stone shoulders, far from the valley',
    reducedMotionState: 'fixed copper arc on the far ridge with a text label',
  },
  {
    id: 'cloud-bank',
    name: 'Cloud Bank',
    glyph: '⌁',
    favoredRoles: ['veil'],
    description: 'Cloud settles over the pass. Concealment protects passage without denying it.',
    answer: 'hold at least two veil acts in the cycle',
    silhouette: 'layered cloud ledges crossing a marked mountain pass',
    reducedMotionState: 'static cloud bank drawn across the pass with a text label',
  },
  {
    id: 'clearing',
    name: 'Clearing',
    glyph: '○',
    favoredRoles: ['emergence'],
    description: 'The sky opens. Transitions between unlike acts read clearly on the slopes.',
    answer: 'keep five distinct acts and at least twelve transitions in the cycle',
    silhouette: 'two cloud banks parting around a numbered mountain pass',
    reducedMotionState: 'open pass held between two fixed cloud edges with a text label',
  },
]

/** Non-color signal entries to append to KAILASH_SPEC.nonColorSignals. */
export const KAILASH_FRONT_SIGNALS = [
  { id: 'u7-front-approaching', text: 'front approaching', shape: 'turned weather vane', pattern: 'single leaning pointer above the ridge' },
  { id: 'u7-front-active', text: 'front on the ridge', shape: 'named weather band', pattern: 'labeled band with the favored acts listed' },
  { id: 'u7-front-answered', text: 'front answered', shape: 'weather band with open notch', pattern: 'band broken by one bright composition mark' },
  { id: 'u7-long-rest', text: 'long rest', shape: 'held ring with lamp below', pattern: 'still act ring above one slowly filling lamp' },
] as const

/** Lumen lines for the realm's first encounters with each system. */
export const KAILASH_FRONT_LUMEN = {
  firstFront: 'Weather is the mountain speaking first. We are not asked to stop it — only to arrange ourselves honestly before it arrives.',
  firstAnswer: 'The cycle answered the ridge. Look below: the path down has one more mark than it did.',
  firstLongRest: 'Nothing is earned by stopping, I used to think. The lamp at the lowest shelter disagrees, quietly, all night.',
} as const

export interface KailashFrontAnnouncement {
  readonly key: string
  readonly text: string
  readonly politeness: 'polite'
}

export interface KailashFrontEvents {
  /** Descent Traces earned; the caller persists these into the realm's lifetime counters (Chronicle), NOT law state. */
  readonly tracesEarned: number
  readonly announcements: readonly KailashFrontAnnouncement[]
}

export interface KailashFrontStatus {
  readonly front: KailashFrontDef
  readonly phase: KailashFrontPhase
  readonly phaseSecondsRemaining: number
  readonly predicateSatisfied: boolean
  readonly edited: boolean
  readonly answered: boolean
  readonly answeredSeconds: number
  readonly carrySecondsRemaining: number
  readonly explanation: string
}

// --- Composition predicates -------------------------------------------------

function roleCounts(slots: readonly KailashAct[]): Record<KailashAct, number> {
  const counts: Record<KailashAct, number> = { emergence: 0, shelter: 0, release: 0, veil: 0, grace: 0, rest: 0 }
  for (const role of slots) counts[role] += 1
  return counts
}

function everyReleaseSheltered(slots: readonly KailashAct[]): boolean {
  const releases = slots.flatMap((role, index) => (role === 'release' ? [index] : []))
  if (releases.length === 0) return false
  return releases.every((index) => {
    const before = slots[(index + slots.length - 1) % slots.length]
    const after = slots[(index + 1) % slots.length]
    return before === 'shelter' || after === 'shelter'
  })
}

function transitionCount(slots: readonly KailashAct[]): number {
  return slots.reduce((count, role, index) => (
    role === slots[(index + slots.length - 1) % slots.length] ? count : count + 1
  ), 0)
}

export function kailashFrontPredicate(frontId: string, slots: readonly KailashAct[]): boolean {
  const counts = roleCounts(slots)
  switch (frontId) {
    case 'passing-snow': return counts.rest >= 3 && counts.grace >= 2
    case 'fire-season': return everyReleaseSheltered(slots)
    case 'cloud-bank': return counts.veil >= 2
    case 'clearing': return new Set(slots).size >= 5 && transitionCount(slots) >= 12
    default: return false
  }
}

// --- State machine ----------------------------------------------------------

const PHASE_CALM = 0
const PHASE_APPROACHING = 1
const PHASE_ACTIVE = 2

function phaseDuration(phase: number): number {
  return phase === PHASE_CALM
    ? KAILASH_FRONT_CALM_SECONDS
    : phase === PHASE_APPROACHING
      ? KAILASH_FRONT_APPROACH_SECONDS
      : KAILASH_FRONT_ACTIVE_SECONDS
}

/**
 * Mark that the player touched the cycle (integration point: call this from
 * selectCanticleMeasure / setCanticleSlotRole / cycleCanticleSlot). Only
 * meaningful while a front is announced or active — this is what separates a
 * deliberate answer from a composition that idled into the right shape.
 */
export function markKailashCycleEdited(state: NumericLawState): void {
  if (readNumber(state, 'u7-front-phase', PHASE_CALM, PHASE_ACTIVE) !== PHASE_CALM) {
    writeNumber(state, 'u7-front-edited', 1)
  }
}

export function kailashFrontStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): KailashFrontStatus {
  const index = Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1))
  const front = KAILASH_FRONTS[index]
  const phaseIndex = Math.floor(readNumber(state, 'u7-front-phase', PHASE_CALM, PHASE_ACTIVE))
  const phase: KailashFrontPhase = phaseIndex === PHASE_ACTIVE ? 'active' : phaseIndex === PHASE_APPROACHING ? 'approaching' : 'calm'
  const elapsed = readNumber(state, 'u7-front-elapsed', 0, phaseDuration(phaseIndex))
  const slots = canticleStatus(state, owned, 0).slots
  const predicateSatisfied = kailashFrontPredicate(front.id, slots)
  const edited = readNumber(state, 'u7-front-edited', 0, 1) >= 1
  const answered = phase === 'active' && predicateSatisfied && edited
  const answeredSeconds = readNumber(state, 'u7-front-answered-seconds', 0, KAILASH_FRONT_ACTIVE_SECONDS)
  const carrySecondsRemaining = readNumber(state, 'u7-front-carry-seconds', 0, KAILASH_FRONT_CARRY_SECONDS)
  const explanation = phase === 'calm'
    ? `The ridge is quiet. ${front.name} will approach in ${Math.ceil(phaseDuration(PHASE_CALM) - elapsed)}s.`
    : phase === 'approaching'
      ? `${front.name} approaches: ${front.answer}. It arrives in ${Math.ceil(phaseDuration(PHASE_APPROACHING) - elapsed)}s.`
      : answered
        ? `${front.name} is answered: the cycle holds its shape for ${Math.ceil(phaseDuration(PHASE_ACTIVE) - elapsed)}s more.`
        : `${front.name} crosses the ridge for ${Math.ceil(phaseDuration(PHASE_ACTIVE) - elapsed)}s: ${front.answer}.`
  return { front, phase, phaseSecondsRemaining: Math.max(0, phaseDuration(phaseIndex) - elapsed), predicateSatisfied, edited, answered, answeredSeconds, carrySecondsRemaining, explanation }
}

/**
 * Advance the front timeline. Deterministic; safe to call with any positive
 * elapsed. Offline gaps are settled rather than replayed: after two full
 * front cycles' worth of seconds, the machine folds to a fresh calm phase so
 * a returning player never faces a backlog of stale announcements.
 */
export function advanceKailashFronts(
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  elapsedSeconds: number,
): KailashFrontEvents {
  const announcements: KailashFrontAnnouncement[] = []
  let tracesEarned = 0
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return { tracesEarned, announcements }
  // The Long Rest holds the mountain still (LOKA_DEPTH_PLAN §5.2): while
  // resting, only the grace reserve moves.
  if (readNumber(state, 'u7-long-rest', 0, 1) >= 1) {
    const reserve = readNumber(state, 'u7-grace-reserve', 0, KAILASH_GRACE_RESERVE_CAP_SECONDS)
    writeNumber(state, 'u7-grace-reserve', Math.min(KAILASH_GRACE_RESERVE_CAP_SECONDS, reserve + Math.min(elapsedSeconds, 7 * 24 * 60 * 60)))
    return { tracesEarned, announcements }
  }
  const fullCycle = KAILASH_FRONT_CALM_SECONDS + KAILASH_FRONT_APPROACH_SECONDS + KAILASH_FRONT_ACTIVE_SECONDS
  let remaining = elapsedSeconds
  if (remaining > fullCycle * 2) {
    // Settle: whatever was in progress ends unanswered and unannounced.
    writeNumber(state, 'u7-front-index', (Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1)) + 1) % KAILASH_FRONTS.length)
    writeNumber(state, 'u7-front-phase', PHASE_CALM)
    writeNumber(state, 'u7-front-elapsed', 0)
    writeNumber(state, 'u7-front-answered-seconds', 0)
    writeNumber(state, 'u7-front-edited', 0)
    remaining = 0
  }
  // Carry window burns down in real time regardless of phase.
  const carry = readNumber(state, 'u7-front-carry-seconds', 0, KAILASH_FRONT_CARRY_SECONDS)
  if (carry > 0) writeNumber(state, 'u7-front-carry-seconds', Math.max(0, carry - elapsedSeconds))
  // Grace bonus from a finished Long Rest decays in real time.
  const bonusSeconds = readNumber(state, 'u7-grace-bonus-seconds', 0, KAILASH_GRACE_BONUS_WINDOW_SECONDS)
  if (bonusSeconds > 0) writeNumber(state, 'u7-grace-bonus-seconds', Math.max(0, bonusSeconds - elapsedSeconds))

  while (remaining > 0) {
    const phase = Math.floor(readNumber(state, 'u7-front-phase', PHASE_CALM, PHASE_ACTIVE))
    const elapsed = readNumber(state, 'u7-front-elapsed', 0, phaseDuration(phase))
    const step = Math.min(remaining, phaseDuration(phase) - elapsed)
    remaining -= step
    const index = Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1))
    const front = KAILASH_FRONTS[index]
    if (phase === PHASE_ACTIVE) {
      const slots = canticleStatus(state, owned, 0).slots
      if (kailashFrontPredicate(front.id, slots) && readNumber(state, 'u7-front-edited', 0, 1) >= 1) {
        writeNumber(state, 'u7-front-answered-seconds', Math.min(
          KAILASH_FRONT_ACTIVE_SECONDS,
          readNumber(state, 'u7-front-answered-seconds', 0, KAILASH_FRONT_ACTIVE_SECONDS) + step,
        ))
      }
    }
    if (elapsed + step < phaseDuration(phase)) {
      writeNumber(state, 'u7-front-elapsed', elapsed + step)
      continue
    }
    // Phase boundary.
    writeNumber(state, 'u7-front-elapsed', 0)
    if (phase === PHASE_CALM) {
      writeNumber(state, 'u7-front-phase', PHASE_APPROACHING)
      announcements.push({ key: `${front.id}-approach`, text: `${front.name} approaches the ridge. The mountain will favor ${front.favoredRoles.join(' and ')}.`, politeness: 'polite' })
    } else if (phase === PHASE_APPROACHING) {
      writeNumber(state, 'u7-front-phase', PHASE_ACTIVE)
      announcements.push({ key: `${front.id}-arrive`, text: `${front.name} crosses the ridge.`, politeness: 'polite' })
    } else {
      const answeredSeconds = readNumber(state, 'u7-front-answered-seconds', 0, KAILASH_FRONT_ACTIVE_SECONDS)
      const earned = answeredSeconds >= KAILASH_FRONT_ACTIVE_SECONDS * KAILASH_FRONT_ANSWER_FRACTION
      if (earned) {
        tracesEarned += 1
        writeNumber(state, 'u7-front-carry-seconds', KAILASH_FRONT_CARRY_SECONDS)
        announcements.push({ key: `${front.id}-answered`, text: 'The front clears. The descent gains a new trace.', politeness: 'polite' })
      } else {
        announcements.push({ key: `${front.id}-cleared`, text: 'The front clears without an answer. Another will come.', politeness: 'polite' })
      }
      writeNumber(state, 'u7-front-phase', PHASE_CALM)
      writeNumber(state, 'u7-front-answered-seconds', 0)
      writeNumber(state, 'u7-front-edited', 0)
      writeNumber(state, 'u7-front-index', (index + 1) % KAILASH_FRONTS.length)
    }
  }
  return { tracesEarned, announcements }
}

// --- The Long Rest ----------------------------------------------------------

export const KAILASH_GRACE_RESERVE_CAP_SECONDS = 1_800
export const KAILASH_GRACE_BONUS_WINDOW_SECONDS = 600
export const KAILASH_GRACE_BONUS_MAX = 0.4

export interface KailashLongRestStatus {
  readonly resting: boolean
  readonly reserveSeconds: number
  readonly reserveFraction: number
  readonly bonusSecondsRemaining: number
  readonly bonusStrength: number
  readonly explanation: string
}

export function kailashLongRestStatus(state: Readonly<NumericLawState> | undefined): KailashLongRestStatus {
  const resting = readNumber(state, 'u7-long-rest', 0, 1) >= 1
  const reserveSeconds = readNumber(state, 'u7-grace-reserve', 0, KAILASH_GRACE_RESERVE_CAP_SECONDS)
  const reserveFraction = reserveSeconds / KAILASH_GRACE_RESERVE_CAP_SECONDS
  const bonusSecondsRemaining = readNumber(state, 'u7-grace-bonus-seconds', 0, KAILASH_GRACE_BONUS_WINDOW_SECONDS)
  const bonusStrength = Math.min(KAILASH_GRACE_BONUS_MAX, readNumber(state, 'u7-grace-bonus-strength', 0, KAILASH_GRACE_BONUS_MAX))
  const explanation = resting
    ? `The Still Point holds. The lamp at the lowest shelter is ${Math.round(reserveFraction * 100)}% full.`
    : bonusSecondsRemaining > 0
      ? `Grace carried down from the rest strengthens the cycle for ${Math.ceil(bonusSecondsRemaining)}s more.`
      : 'The cycle turns. A Long Rest may be chosen from the Still Point.'
  return { resting, reserveSeconds, reserveFraction, bonusSecondsRemaining, bonusStrength, explanation }
}

/**
 * Enter the Long Rest. Gate (all three Mountain Witness shelves complete) and
 * exclusions (never during a trial, ceremony, or the dissolution consent
 * flow) belong to the caller — this function only manages law state.
 */
export function enterKailashLongRest(state: NumericLawState): boolean {
  if (readNumber(state, 'u7-long-rest', 0, 1) >= 1) return false
  writeNumber(state, 'u7-long-rest', 1)
  return true
}

/** Leave the rest; the banked reserve becomes a bounded, decaying cycle bonus. */
export function exitKailashLongRest(state: NumericLawState): boolean {
  if (readNumber(state, 'u7-long-rest', 0, 1) < 1) return false
  const reserve = readNumber(state, 'u7-grace-reserve', 0, KAILASH_GRACE_RESERVE_CAP_SECONDS)
  writeNumber(state, 'u7-long-rest', 0)
  writeNumber(state, 'u7-grace-reserve', 0)
  writeNumber(state, 'u7-grace-bonus-strength', KAILASH_GRACE_BONUS_MAX * (reserve / KAILASH_GRACE_RESERVE_CAP_SECONDS))
  writeNumber(state, 'u7-grace-bonus-seconds', reserve > 0 ? KAILASH_GRACE_BONUS_WINDOW_SECONDS : 0)
  return true
}

// --- Rate pipeline ----------------------------------------------------------

/**
 * Pure combiner, exported so the bound is directly testable. Integration
 * multiplies this into f4RateMultiplier('canticle', ...) — it is the ONLY
 * place the three new factors meet, and it clamps to the ceiling.
 */
export function combineKailashLawFactors(frontFactor: number, carryFactor: number, graceFactor: number): number {
  const clean = (factor: number): number => (Number.isFinite(factor) && factor > 1 ? factor : 1)
  return Math.min(KAILASH_LAW_FACTOR_CEILING, clean(frontFactor) * clean(carryFactor) * clean(graceFactor))
}

/**
 * The extra law multiplier from fronts, carry, and grace. Multiplied with the
 * existing canticleStatus().multiplier inside f4RateMultiplier on integration.
 */
export function kailashFrontMultiplier(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): number {
  const status = kailashFrontStatus(state, owned)
  let frontFactor = 1
  if (status.answered) {
    const currentRole = canticleStatus(state, owned, nowMs).role
    frontFactor = status.front.favoredRoles.includes(currentRole) ? 1.5 : 1.1
  }
  const carryFactor = status.carrySecondsRemaining > 0 ? 1.2 : 1
  const rest = kailashLongRestStatus(state)
  const graceFactor = rest.bonusSecondsRemaining > 0
    ? 1 + rest.bonusStrength * (rest.bonusSecondsRemaining / KAILASH_GRACE_BONUS_WINDOW_SECONDS)
    : 1
  return combineKailashLawFactors(frontFactor, carryFactor, graceFactor)
}
