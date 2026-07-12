import type { EconomyAmount } from './types'
import { amountFromNumber, amountToBoundedNumber } from '../../core/numeric/amount'
import { VISHNULOK_STRAIN_COPY } from './tempest'
import { BRAHMALOK_FOLIO_COMMISSIONS } from './prismata'

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

function totalOwned(owned: Readonly<Record<string, number>>, prefix: string): number {
  let total = 0
  for (let index = 1; index <= 18; index++) {
    total += Math.max(0, owned[`${prefix}-kindling-${String(index).padStart(2, '0')}`] ?? 0)
  }
  return total
}

/** Keeps player-authored F4 configuration across an Epoch while dropping live charge/storage. */
export function retainedF4LawConfiguration(
  universeId: string,
  state: Readonly<NumericLawState>,
): NumericLawState {
  const keep = universeId === 'verdance'
    ? (key: string) => key.startsWith('u3-graft-')
    : universeId === 'prismata'
      ? (key: string) => key === 'u5-recipe' || key === 'u5-margin-mode' || key.startsWith('u5-route-')
      : universeId === 'tempest'
        ? (key: string) => key === 'u6-path' || key === 'u6-path-length' || key === 'u6-path-risk'
        : universeId === 'canticle'
          ? (key: string) => key === 'u7-measure' || key.startsWith('u7-slot-')
          : () => false
  return Object.fromEntries(Object.entries(state).filter(([key]) => keep(key)))
}

export const BRAHMALOK_MODES = [
  { id: 'germination', name: 'Germination', glyph: '•', description: 'Concentrate possibility in the strongest direction until a first form opens.' },
  { id: 'mandala', name: 'Fourfold Mandala', glyph: '⌘', description: 'Reward balanced participation from seed, measure, name, and form.' },
  { id: 'memory', name: 'Manuscript Memory', glyph: '▤', description: 'Store revisions, then return them as a visible marginal memory.' },
  { id: 'proliferation', name: 'Proliferation', glyph: '✤', description: 'Spread possibility across distinct forms and active openings.' },
] as const

/** @deprecated Save-slot compatibility alias. */
export const PRISMATA_RECIPES = BRAHMALOK_MODES
export type BrahmalokModeId = (typeof BRAHMALOK_MODES)[number]['id']
export type PrismataRecipeId = BrahmalokModeId

export const BRAHMALOK_DIRECTIONS = [
  { id: 'seed', name: 'Seed', glyph: '•' },
  { id: 'measure', name: 'Measure', glyph: '⌁' },
  { id: 'name', name: 'Name', glyph: '⌜' },
  { id: 'form', name: 'Form', glyph: '◇' },
] as const

/** @deprecated Save-slot compatibility alias. */
export const PRISMATA_BANDS = BRAHMALOK_DIRECTIONS

export interface PrismataStatus {
  readonly recipeIndex: number
  readonly recipe: (typeof PRISMATA_RECIPES)[number]
  readonly bands: readonly number[]
  readonly routes: readonly number[]
  readonly activeBands: number
  readonly balance: number
  readonly fluorescence: number
  readonly multiplier: number
  readonly explanation: string
}

export type BrahmalokStatus = PrismataStatus

export function prismataStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): PrismataStatus {
  const recipeIndex = Math.min(BRAHMALOK_MODES.length - 1, Math.floor(readNumber(state, 'u5-recipe', 1, 3)))
  const routes = Array.from({ length: 18 }, (_, index) => Math.floor(readNumber(
    state,
    `u5-route-${String(index + 1).padStart(2, '0')}`,
    index % BRAHMALOK_DIRECTIONS.length,
    BRAHMALOK_DIRECTIONS.length - 1,
  )))
  const bands = Array.from({ length: BRAHMALOK_DIRECTIONS.length }, () => 0)
  routes.forEach((band, index) => {
    bands[band] += Math.max(0, owned[`u5-kindling-${String(index + 1).padStart(2, '0')}`] ?? 0)
  })
  const active = bands.filter((quantity) => quantity > 0)
  const activeBands = active.length
  const strongest = Math.max(0, ...bands)
  const total = bands.reduce((sum, quantity) => sum + quantity, 0)
  const weakestActive = active.length > 0 ? Math.min(...active) : 0
  const balance = strongest > 0 ? weakestActive / strongest : 0
  const fluorescence = readNumber(state, 'u5-fluorescence', 0, 100)
  let multiplier = 1
  let explanation = 'Unfold a Kindling to begin the four-direction creation field.'
  if (recipeIndex === 0 && total > 0) {
    const focus = strongest / total
    multiplier = 1 + focus * 2.4
    explanation = `${Math.round(focus * 100)}% of Possibility gathers in the strongest creation direction.`
  } else if (recipeIndex === 1 && activeBands > 0) {
    multiplier = 1 + activeBands * 0.21 + balance * 0.5 + (activeBands === 4 ? 0.45 : 0)
    explanation = `${activeBands}/4 creation directions contribute; balance is ${Math.round(balance * 100)}%.`
  } else if (recipeIndex === 2) {
    multiplier = 0.9 + fluorescence * 0.022
    explanation = `${Math.round(fluorescence)}% manuscript memory remains visible in the margins.`
  } else if (recipeIndex === 3) {
    multiplier = 1 + activeBands * 0.24
    explanation = `${activeBands}/4 directions are opening distinct, revisable forms.`
  }
  return { recipeIndex, recipe: BRAHMALOK_MODES[recipeIndex], bands, routes, activeBands, balance, fluorescence, multiplier, explanation }
}

export const brahmalokStatus = prismataStatus

export function selectPrismataRecipe(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= BRAHMALOK_MODES.length) return false
  if (prismataStatus(state, {}).recipeIndex !== index) markBrahmalokCommissionEdited(state)
  writeNumber(state, 'u5-recipe', index)
  return true
}

export const selectBrahmalokMode = selectPrismataRecipe

export function routePrismataKindling(
  state: NumericLawState,
  kindlingIndex: number,
  bandIndex: number,
): boolean {
  if (!Number.isInteger(kindlingIndex) || kindlingIndex < 0 || kindlingIndex >= 18) return false
  if (!Number.isInteger(bandIndex) || bandIndex < 0 || bandIndex >= BRAHMALOK_DIRECTIONS.length) return false
  const key = `u5-route-${String(kindlingIndex + 1).padStart(2, '0')}`
  const current = Math.floor(readNumber(state, key, kindlingIndex % BRAHMALOK_DIRECTIONS.length, BRAHMALOK_DIRECTIONS.length - 1))
  if (current !== bandIndex) {
    markBrahmalokCommissionEdited(state)
    if (readNumber(state, 'u5-commission-phase', 0, 1) >= 1) {
      writeNumber(state, 'u5-commission-route-changes', readNumber(state, 'u5-commission-route-changes', 0, 18) + 1)
    }
  }
  writeNumber(state, key, bandIndex)
  return true
}

export const routeBrahmalokKindling = routePrismataKindling

export type BrahmalokCommissionDef = (typeof BRAHMALOK_FOLIO_COMMISSIONS)[number]
export const BRAHMALOK_COMMISSIONS: readonly BrahmalokCommissionDef[] = BRAHMALOK_FOLIO_COMMISSIONS
export const BRAHMALOK_COMMISSION_WAIT_SECONDS = 240
export const BRAHMALOK_COMMISSION_ACTIVE_SECONDS = 180
export const BRAHMALOK_COMMISSION_HOLD_SECONDS = 60
export const BRAHMALOK_COMMISSION_BUFF_SECONDS = 120
export const BRAHMALOK_COMMISSION_BUFF = 1.6
export const BRAHMALOK_LAW_FACTOR_CEILING = 4.2

export interface BrahmalokCommissionStatus {
  readonly commission: BrahmalokCommissionDef
  readonly phase: 'waiting' | 'active'
  readonly secondsRemaining: number
  readonly edited: boolean
  readonly routeChanges: number
  readonly predicateSatisfied: boolean
  readonly answered: boolean
  readonly heldSeconds: number
  readonly buffSecondsRemaining: number
  readonly explanation: string
}

export function markBrahmalokCommissionEdited(state: NumericLawState): void {
  if (readNumber(state, 'u5-commission-phase', 0, 1) >= 1) writeNumber(state, 'u5-commission-edited', 1)
}

export function brahmalokCommissionPredicate(
  predicate: BrahmalokCommissionDef['predicate'],
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): boolean {
  const status = prismataStatus(state, owned)
  const seed = status.bands[0]
  const name = status.bands[2]
  const form = status.bands[3]
  const strongest = Math.max(...status.bands)
  const active = status.bands.filter((value) => value > 0)
  const balanced = active.length > 0 && Math.min(...active) >= strongest * 0.8
  const changes = Math.floor(readNumber(state, 'u5-commission-route-changes', 0, 18))
  const seedStrong = seed > 0 && seed === strongest
  const nameStrong = name > 0 && name === strongest
  const formStrong = form > 0 && form === strongest
  if (predicate === 'form-zero-seed-strong') return form === 0 && seedStrong
  if (predicate === 'balance-twenty') return active.length >= 2 && balanced
  if (predicate === 'name-strong-three') return nameStrong && status.activeBands >= 3
  if (predicate === 'routes-four') return changes >= 4
  if (predicate === 'seed-strong-three') return seedStrong && status.activeBands >= 3
  if (predicate === 'all-four-balanced') return status.activeBands === 4 && balanced
  if (predicate === 'name-strong-four') return nameStrong && status.activeBands === 4
  if (predicate === 'form-strong-three') return formStrong && status.activeBands >= 3
  if (predicate === 'seed-open-changes-two') return form === 0 && seedStrong && changes >= 2
  if (predicate === 'balanced-changes-four') return status.activeBands === 4 && balanced && changes >= 4
  if (predicate === 'name-memory') return nameStrong && status.recipe.id === 'memory'
  if (predicate === 'form-four-changes-four') return status.activeBands === 4 && formStrong && changes >= 4
  if (predicate === 'seed-open-changes-four') return form === 0 && seedStrong && changes >= 4
  if (predicate === 'balanced-changes-five') return status.activeBands === 4 && balanced && changes >= 5
  if (predicate === 'name-four-changes-five') return nameStrong && status.activeBands === 4 && changes >= 5
  if (predicate === 'all-four-changes-six') return status.activeBands === 4 && changes >= 6
  return false
}

function availableBrahmalokCommissionCount(archiveCount: number): number {
  return Math.min(BRAHMALOK_COMMISSIONS.length, 4 + Math.floor(Math.max(0, archiveCount) / 4) * 4)
}

export function brahmalokCommissionStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  archiveCount = 0,
): BrahmalokCommissionStatus {
  const available = availableBrahmalokCommissionCount(archiveCount)
  const index = Math.floor(readNumber(state, 'u5-commission-index', 0, BRAHMALOK_COMMISSIONS.length - 1)) % available
  const commission = BRAHMALOK_COMMISSIONS[index]
  const phase: 'waiting' | 'active' = readNumber(state, 'u5-commission-phase', 0, 1) >= 1 ? 'active' : 'waiting'
  const elapsed = readNumber(state, 'u5-commission-elapsed', 0, phase === 'active' ? BRAHMALOK_COMMISSION_ACTIVE_SECONDS : BRAHMALOK_COMMISSION_WAIT_SECONDS)
  const edited = readNumber(state, 'u5-commission-edited', 0, 1) >= 1
  const routeChanges = Math.floor(readNumber(state, 'u5-commission-route-changes', 0, 18))
  const predicateSatisfied = brahmalokCommissionPredicate(commission.predicate, state, owned)
  const answered = phase === 'active' && edited && predicateSatisfied
  const heldSeconds = readNumber(state, 'u5-commission-held-seconds', 0, BRAHMALOK_COMMISSION_HOLD_SECONDS)
  const buffSecondsRemaining = readNumber(state, 'u5-commission-buff-seconds', 0, BRAHMALOK_COMMISSION_BUFF_SECONDS)
  const duration = phase === 'active' ? BRAHMALOK_COMMISSION_ACTIVE_SECONDS : BRAHMALOK_COMMISSION_WAIT_SECONDS
  const explanation = phase === 'waiting'
    ? `The folio margins are quiet. Another direction may ask in ${Math.ceil(duration - elapsed)}s.`
    : answered
      ? `${commission.question} Hold this deliberate answer for ${Math.ceil(BRAHMALOK_COMMISSION_HOLD_SECONDS - heldSeconds)}s: ${commission.answer}.`
      : `${commission.question} ${commission.direction[0].toUpperCase()}${commission.direction.slice(1)} asks you to ${commission.answer}. The margin closes without penalty in ${Math.ceil(duration - elapsed)}s.`
  return { commission, phase, secondsRemaining: Math.max(0, duration - elapsed), edited, routeChanges, predicateSatisfied, answered, heldSeconds, buffSecondsRemaining, explanation }
}

export function advanceBrahmalokCommissions(
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  elapsedSeconds: number,
  archiveCount = 0,
  promptsEnabled = true,
): Pick<F4LawEvents, 'foliosEarned' | 'announcements'> {
  const announcements: F4LawAnnouncement[] = []
  let foliosEarned = 0
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return { foliosEarned, announcements }
  const buff = readNumber(state, 'u5-commission-buff-seconds', 0, BRAHMALOK_COMMISSION_BUFF_SECONDS)
  if (buff > 0) writeNumber(state, 'u5-commission-buff-seconds', Math.max(0, buff - elapsedSeconds))
  if (!promptsEnabled) return { foliosEarned, announcements }
  const fullCycle = BRAHMALOK_COMMISSION_WAIT_SECONDS + BRAHMALOK_COMMISSION_ACTIVE_SECONDS
  if (elapsedSeconds > fullCycle * 2) {
    writeNumber(state, 'u5-commission-phase', 0)
    writeNumber(state, 'u5-commission-elapsed', 0)
    writeNumber(state, 'u5-commission-edited', 0)
    writeNumber(state, 'u5-commission-route-changes', 0)
    writeNumber(state, 'u5-commission-held-seconds', 0)
    return { foliosEarned, announcements }
  }

  let remaining = elapsedSeconds
  while (remaining > 0) {
    const status = brahmalokCommissionStatus(state, owned, archiveCount)
    const duration = status.phase === 'active' ? BRAHMALOK_COMMISSION_ACTIVE_SECONDS : BRAHMALOK_COMMISSION_WAIT_SECONDS
    const elapsed = duration - status.secondsRemaining
    const step = Math.min(remaining, status.secondsRemaining)
    remaining -= step
    if (status.phase === 'active' && status.answered) {
      const held = Math.min(BRAHMALOK_COMMISSION_HOLD_SECONDS, status.heldSeconds + step)
      writeNumber(state, 'u5-commission-held-seconds', held)
      if (held >= BRAHMALOK_COMMISSION_HOLD_SECONDS) {
        foliosEarned += 1
        writeNumber(state, 'u5-commission-buff-seconds', BRAHMALOK_COMMISSION_BUFF_SECONDS)
        announcements.push({ key: `${status.commission.id}-answered`, text: `${status.commission.direction[0].toUpperCase()}${status.commission.direction.slice(1)} keeps the answer. A Folio Sketch joins the margin shelf.`, politeness: 'polite' })
        finishBrahmalokCommission(state, archiveCount)
        continue
      }
    } else if (status.phase === 'active' && status.heldSeconds > 0 && status.edited) {
      writeNumber(state, 'u5-commission-held-seconds', 0)
    }
    if (elapsed + step < duration) {
      writeNumber(state, 'u5-commission-elapsed', elapsed + step)
      continue
    }
    if (status.phase === 'waiting') {
      writeNumber(state, 'u5-commission-phase', 1)
      writeNumber(state, 'u5-commission-elapsed', 0)
      writeNumber(state, 'u5-commission-edited', 0)
      writeNumber(state, 'u5-commission-route-changes', 0)
      writeNumber(state, 'u5-commission-held-seconds', 0)
      announcements.push({ key: `${status.commission.id}-open`, text: `${status.commission.direction[0].toUpperCase()}${status.commission.direction.slice(1)} opens a Folio Commission: ${status.commission.question}`, politeness: 'polite' })
    } else {
      announcements.push({ key: `${status.commission.id}-blank`, text: 'The Commission closes without an answer. The margin stays blank.', politeness: 'polite' })
      finishBrahmalokCommission(state, archiveCount)
    }
  }
  return { foliosEarned, announcements }
}

function finishBrahmalokCommission(state: NumericLawState, archiveCount: number): void {
  const available = availableBrahmalokCommissionCount(archiveCount)
  const index = Math.floor(readNumber(state, 'u5-commission-index', 0, BRAHMALOK_COMMISSIONS.length - 1))
  writeNumber(state, 'u5-commission-index', (index + 1) % available)
  writeNumber(state, 'u5-commission-phase', 0)
  writeNumber(state, 'u5-commission-elapsed', 0)
  writeNumber(state, 'u5-commission-edited', 0)
  writeNumber(state, 'u5-commission-route-changes', 0)
  writeNumber(state, 'u5-commission-held-seconds', 0)
}

export function selectBrahmalokMarginMode(state: NumericLawState, index: number | null): boolean {
  if (index !== null && (!Number.isInteger(index) || index < 0 || index >= BRAHMALOK_MODES.length)) return false
  const primary = prismataStatus(state, {}).recipeIndex
  if (index === primary) return false
  writeNumber(state, 'u5-margin-mode', index === null ? 0 : index + 1)
  return true
}

export function brahmalokMarginModeIndex(state: Readonly<NumericLawState> | undefined): number | null {
  const encoded = Math.floor(readNumber(state, 'u5-margin-mode', 0, BRAHMALOK_MODES.length))
  return encoded <= 0 ? null : encoded - 1
}

export function combineBrahmalokLawFactors(baseFactor: number, commissionFactor: number, marginFactor: number): number {
  const base = Number.isFinite(baseFactor) && baseFactor > 0 ? baseFactor : 1
  const bonus = (factor: number) => Number.isFinite(factor) && factor > 1 ? factor : 1
  return Math.min(BRAHMALOK_LAW_FACTOR_CEILING, base * bonus(commissionFactor) * bonus(marginFactor))
}

export function brahmalokLawMultiplier(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): number {
  const primary = prismataStatus(state, owned)
  const marginIndex = brahmalokMarginModeIndex(state)
  let marginFactor = 1
  if (marginIndex !== null && marginIndex !== primary.recipeIndex) {
    const marginState: NumericLawState = { ...(state ?? {}), 'u5-recipe': amountFromNumber(marginIndex) }
    const marginMultiplier = prismataStatus(marginState, owned).multiplier
    marginFactor = 1 + Math.max(0, marginMultiplier - 1) * 0.4
  }
  const commissionFactor = readNumber(state, 'u5-commission-buff-seconds', 0, BRAHMALOK_COMMISSION_BUFF_SECONDS) > 0 ? BRAHMALOK_COMMISSION_BUFF : 1
  return combineBrahmalokLawFactors(primary.multiplier, commissionFactor, marginFactor)
}

export const VISHNULOK_CIRCUITS = [
  { id: 'daily-return', name: 'Daily Return', glyph: '↶', threshold: 20, boost: 1.8, durationSec: 22, defaultLength: 2, defaultRisk: 0, description: 'Frequent modest corrections with a reliable return.' },
  { id: 'refuge-circuit', name: 'Refuge Circuit', glyph: '⌂', threshold: 70, boost: 3.4, durationSec: 30, defaultLength: 7, defaultRisk: 2, description: 'Carry a large burden through a long chain of shelters.' },
  { id: 'measured-correction', name: 'Measured Correction', glyph: '≋', threshold: 45, boost: 2.6, durationSec: 48, defaultLength: 6, defaultRisk: 1, description: 'Sustain a broad, stable correction through the middle current.' },
  { id: 'ocean-balance', name: 'Ocean Balance', glyph: '∞', threshold: 35, boost: 3.1, durationSec: 26, defaultLength: 4, defaultRisk: 3, description: 'Follow changing strain through a sharper responsive return.' },
] as const

/** @deprecated Save-slot compatibility alias. */
export const TEMPEST_PATHS = VISHNULOK_CIRCUITS

export const VISHNULOK_BURDENS = [
  { id: 'sheltered', name: 'Sheltered', glyph: '⌂', description: 'Lower return, stable refuge.' },
  { id: 'open-water', name: 'Open Water', glyph: '≈', description: 'Moderate burden and return.' },
  { id: 'strained', name: 'Strained', glyph: '⌁', description: 'Higher threshold and stronger correction.' },
  { id: 'far-reaching', name: 'Far-Reaching', glyph: '∞', description: 'Maximum return with the widest obligation.' },
] as const

/** @deprecated Save-slot compatibility alias. */
export const TEMPEST_RISKS = VISHNULOK_BURDENS

export interface TempestStatus {
  readonly pathIndex: number
  readonly path: (typeof VISHNULOK_CIRCUITS)[number]
  readonly length: number
  readonly riskIndex: number
  readonly risk: (typeof VISHNULOK_BURDENS)[number]
  readonly threshold: number
  readonly boost: number
  readonly durationSec: number
  readonly charge: number
  readonly boostRemainingSec: number
  readonly secondCharge: number
  readonly secondBoostRemainingSec: number
  readonly secondReady: boolean
  readonly confluenceActive: boolean
  readonly ready: boolean
  readonly multiplier: number
  readonly explanation: string
}

export function tempestStatus(
  state: Readonly<NumericLawState> | undefined,
): TempestStatus {
  const pathIndex = Math.min(VISHNULOK_CIRCUITS.length - 1, Math.floor(readNumber(state, 'u6-path', 0, 3)))
  const path = VISHNULOK_CIRCUITS[pathIndex]
  const length = Math.max(1, Math.floor(readNumber(state, 'u6-path-length', path.defaultLength, 8)))
  const riskIndex = Math.min(VISHNULOK_BURDENS.length - 1, Math.floor(readNumber(state, 'u6-path-risk', path.defaultRisk, 3)))
  const risk = VISHNULOK_BURDENS[riskIndex]
  const threshold = Math.min(95, Math.max(10, path.threshold + (length - path.defaultLength) * 4 + (riskIndex - path.defaultRisk) * 5))
  const boost = path.boost * (0.78 + length * 0.055 + riskIndex * 0.12)
  const durationSec = Math.max(12, Math.round(path.durationSec * (0.78 + length * 0.045)))
  const charge = readNumber(state, 'u6-charge', 0, 100)
  const boostRemainingSec = readNumber(state, 'u6-boost-seconds', 0, durationSec)
  const secondCharge = readNumber(state, 'u6-charge-2', 0, 100)
  const secondBoostRemainingSec = readNumber(state, 'u6-boost-seconds-2', 0, durationSec)
  const ready = charge >= threshold
  const secondReady = secondCharge >= threshold
  const confluenceActive = boostRemainingSec > 0 && secondBoostRemainingSec > 0
  const returning = boostRemainingSec > 0 || secondBoostRemainingSec > 0
  const multiplier = returning ? boost : Math.max(0.72, 0.9 + charge * 0.0038 - riskIndex * 0.035)
  const explanation = returning
    ? `${path.name} is returning across ${length} shelters for ${Math.ceil(Math.max(boostRemainingSec, secondBoostRemainingSec))}s with a ${risk.name.toLowerCase()} burden${confluenceActive ? '; two currents are in confluence' : ''}: ×${boost.toFixed(2)} temporary return.`
    : ready
      ? `${path.name} is ready: ${length} shelters, ${risk.name.toLowerCase()} burden, ×${boost.toFixed(2)} temporary return.`
      : `${Math.ceil(threshold - charge)}% more continuity is required for this ${length}-shelter ${path.name}; current ×${multiplier.toFixed(2)} gathering baseline.`
  return { pathIndex, path, length, riskIndex, risk, threshold, boost, durationSec, charge, boostRemainingSec, secondCharge, secondBoostRemainingSec, secondReady, confluenceActive, ready, multiplier, explanation }
}

export function selectTempestPath(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= VISHNULOK_CIRCUITS.length) return false
  if (tempestStatus(state).pathIndex !== index) markVishnulokCircuitEdited(state)
  writeNumber(state, 'u6-path', index)
  return true
}

export const selectVishnulokCircuit = selectTempestPath

export function configureTempestRoute(
  state: NumericLawState,
  length: number,
  riskIndex: number,
): boolean {
  if (!Number.isInteger(length) || length < 1 || length > 8) return false
  if (!Number.isInteger(riskIndex) || riskIndex < 0 || riskIndex >= VISHNULOK_BURDENS.length) return false
  const current = tempestStatus(state)
  if (current.length !== length || current.riskIndex !== riskIndex) markVishnulokCircuitEdited(state)
  writeNumber(state, 'u6-path-length', length)
  writeNumber(state, 'u6-path-risk', riskIndex)
  return true
}

export const configureVishnulokCircuit = configureTempestRoute

export function dischargeTempest(state: NumericLawState): boolean {
  const status = tempestStatus(state)
  if (!status.ready || status.boostRemainingSec > 0) return false
  writeNumber(state, 'u6-charge', Math.max(0, status.charge - status.threshold))
  writeNumber(state, 'u6-boost-seconds', status.durationSec)
  writeNumber(state, 'u6-last-discharge', status.pathIndex + 1)
  writeNumber(state, 'u6-last-length', status.length)
  writeNumber(state, 'u6-last-risk', status.riskIndex)
  recordVishnulokReturn(state, status)
  return true
}

export const completeVishnulokReturn = dischargeTempest

export function dischargeTempestSecond(state: NumericLawState): boolean {
  const status = tempestStatus(state)
  if (!status.secondReady || status.secondBoostRemainingSec > 0) return false
  writeNumber(state, 'u6-charge-2', Math.max(0, status.secondCharge - status.threshold))
  writeNumber(state, 'u6-boost-seconds-2', status.durationSec)
  writeNumber(state, 'u6-last-discharge-2', status.pathIndex + 1)
  recordVishnulokReturn(state, status)
  return true
}

export type VishnulokStrainPhase = 'waiting' | 'present'

export interface VishnulokStrainDef {
  readonly id: string
  readonly name: string
  readonly glyph: string
  readonly description: string
  readonly preference: string
  readonly silhouette: string
  readonly pattern: string
  readonly restoredFeature: string
}

export const VISHNULOK_STRAINS: readonly VishnulokStrainDef[] = VISHNULOK_STRAIN_COPY

export const VISHNULOK_STRAIN_WAIT_SECONDS = 240
export const VISHNULOK_LAW_FACTOR_CEILING = 5.5
export const VISHNULOK_STRAIN_BONUS = 1.8
export const VISHNULOK_CONFLUENCE_BONUS = 1.25

export interface VishnulokStrainStatus {
  readonly strain: VishnulokStrainDef
  readonly phase: VishnulokStrainPhase
  readonly secondsUntilPresent: number
  readonly edited: boolean
  readonly predicateSatisfied: boolean
  readonly answered: boolean
  readonly genericReturns: number
  readonly explanation: string
}

export function markVishnulokCircuitEdited(state: NumericLawState): void {
  if (readNumber(state, 'u6-strain-phase', 0, 1) >= 1) writeNumber(state, 'u6-strain-edited', 1)
}

export function vishnulokStrainPredicate(strainId: string, status: TempestStatus): boolean {
  if (strainId === 'thinning-coast') return status.length >= 6 && status.risk.id === 'sheltered'
  if (strainId === 'scattered-school') return status.length <= 3 && status.risk.id === 'far-reaching'
  if (strainId === 'crowded-shelter') return status.length >= 4 && status.length <= 6 && status.risk.id === 'strained'
  if (strainId === 'divided-currents') return status.path.id === 'ocean-balance'
  return false
}

export function vishnulokStrainStatus(state: Readonly<NumericLawState> | undefined): VishnulokStrainStatus {
  const index = Math.floor(readNumber(state, 'u6-strain-index', 0, VISHNULOK_STRAINS.length - 1))
  const strain = VISHNULOK_STRAINS[index]
  const phase: VishnulokStrainPhase = readNumber(state, 'u6-strain-phase', 0, 1) >= 1 ? 'present' : 'waiting'
  const elapsed = readNumber(state, 'u6-strain-elapsed', 0, VISHNULOK_STRAIN_WAIT_SECONDS)
  const edited = readNumber(state, 'u6-strain-edited', 0, 1) >= 1
  const predicateSatisfied = vishnulokStrainPredicate(strain.id, tempestStatus(state))
  const answered = phase === 'present' && edited && predicateSatisfied
  const genericReturns = Math.floor(readNumber(state, 'u6-strain-generic-returns', 0, 2))
  const explanation = phase === 'waiting'
    ? `The ocean is settled. Another imbalance may become legible in ${Math.ceil(VISHNULOK_STRAIN_WAIT_SECONDS - elapsed)}s.`
    : answered
      ? `${strain.name} has a deliberate matching route: ${strain.preference}. Complete the return to restore it.`
      : `${strain.name} waits without damage or expiry. It prefers ${strain.preference}; any two ordinary returns will also soothe it.`
  return { strain, phase, secondsUntilPresent: Math.max(0, VISHNULOK_STRAIN_WAIT_SECONDS - elapsed), edited, predicateSatisfied, answered, genericReturns, explanation }
}

function recordVishnulokReturn(state: NumericLawState, status: TempestStatus): void {
  writeNumber(state, 'u6-return-pending', readNumber(state, 'u6-return-pending', 0, 10) + 1)
  if (readNumber(state, 'u6-strain-phase', 0, 1) < 1) return
  const strain = vishnulokStrainStatus(state)
  if (strain.answered) {
    writeNumber(state, 'u6-route-pending', readNumber(state, 'u6-route-pending', 0, 10) + 1)
    writeNumber(state, 'u6-strain-resolved', 1)
    writeNumber(state, 'u6-strain-bonus-seconds', status.durationSec)
    return
  }
  const genericReturns = Math.min(2, strain.genericReturns + 1)
  writeNumber(state, 'u6-strain-generic-returns', genericReturns)
  if (genericReturns >= 2) writeNumber(state, 'u6-strain-resolved', 1)
}

export function advanceVishnulokStrains(
  state: NumericLawState,
  elapsedSeconds: number,
  promptsEnabled = true,
): Pick<F4LawEvents, 'routesEarned' | 'returnsCompleted' | 'announcements'> {
  const announcements: F4LawAnnouncement[] = []
  const routesEarned = Math.floor(readNumber(state, 'u6-route-pending', 0, 10))
  const returnsCompleted = Math.floor(readNumber(state, 'u6-return-pending', 0, 10))
  if (routesEarned > 0) writeNumber(state, 'u6-route-pending', 0)
  if (returnsCompleted > 0) writeNumber(state, 'u6-return-pending', 0)
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return { routesEarned, returnsCompleted, announcements }

  const bonusSeconds = readNumber(state, 'u6-strain-bonus-seconds', 0, 120)
  if (bonusSeconds > 0) writeNumber(state, 'u6-strain-bonus-seconds', Math.max(0, bonusSeconds - elapsedSeconds))
  if (!promptsEnabled) return { routesEarned, returnsCompleted, announcements }
  const status = vishnulokStrainStatus(state)
  if (status.phase === 'present') {
    if (readNumber(state, 'u6-strain-resolved', 0, 1) >= 1) {
      announcements.push({ key: `${status.strain.id}-restored`, text: routesEarned > 0 ? `${status.strain.name} is restored. The living chart keeps one woven route.` : `${status.strain.name} settles after two patient returns.`, politeness: 'polite' })
      writeNumber(state, 'u6-strain-phase', 0)
      writeNumber(state, 'u6-strain-elapsed', 0)
      writeNumber(state, 'u6-strain-resolved', 0)
      writeNumber(state, 'u6-strain-edited', 0)
      writeNumber(state, 'u6-strain-generic-returns', 0)
      writeNumber(state, 'u6-strain-index', (Math.floor(readNumber(state, 'u6-strain-index', 0, VISHNULOK_STRAINS.length - 1)) + 1) % VISHNULOK_STRAINS.length)
    }
    return { routesEarned, returnsCompleted, announcements }
  }

  if (elapsedSeconds > VISHNULOK_STRAIN_WAIT_SECONDS * 2) {
    writeNumber(state, 'u6-strain-phase', 1)
    writeNumber(state, 'u6-strain-elapsed', 0)
    return { routesEarned, returnsCompleted, announcements }
  }
  const nextElapsed = status.secondsUntilPresent <= elapsedSeconds
    ? VISHNULOK_STRAIN_WAIT_SECONDS
    : VISHNULOK_STRAIN_WAIT_SECONDS - status.secondsUntilPresent + elapsedSeconds
  if (nextElapsed >= VISHNULOK_STRAIN_WAIT_SECONDS) {
    writeNumber(state, 'u6-strain-phase', 1)
    writeNumber(state, 'u6-strain-elapsed', 0)
    announcements.push({ key: `${status.strain.id}-present`, text: `${status.strain.name} becomes legible in the middle water. It waits for ${status.strain.preference}.`, politeness: 'polite' })
  } else {
    writeNumber(state, 'u6-strain-elapsed', nextElapsed)
  }
  return { routesEarned, returnsCompleted, announcements }
}

export function combineVishnulokLawFactors(baseFactor: number, strainFactor: number, confluenceFactor: number): number {
  const base = Number.isFinite(baseFactor) && baseFactor > 0 ? baseFactor : 1
  const bonus = (factor: number) => Number.isFinite(factor) && factor > 1 ? factor : 1
  return Math.min(VISHNULOK_LAW_FACTOR_CEILING, base * bonus(strainFactor) * bonus(confluenceFactor))
}

export function vishnulokLawMultiplier(state: Readonly<NumericLawState> | undefined): number {
  const status = tempestStatus(state)
  const strainFactor = readNumber(state, 'u6-strain-bonus-seconds', 0, 120) > 0 ? VISHNULOK_STRAIN_BONUS : 1
  const confluenceFactor = status.confluenceActive ? VISHNULOK_CONFLUENCE_BONUS : 1
  return combineVishnulokLawFactors(status.multiplier, strainFactor, confluenceFactor)
}

export const KAILASH_ACTS = ['emergence', 'shelter', 'release', 'rest', 'veil', 'grace'] as const
export type KailashAct = (typeof KAILASH_ACTS)[number]

export const KAILASH_CYCLES = [
  { id: 'mountain-cycle', name: 'Mountain Cycle', glyph: '△', description: 'Every change opens refuge and returns toward stillness.', slots: ['emergence', 'grace', 'emergence', 'release', 'emergence', 'grace', 'emergence', 'rest', 'emergence', 'veil', 'emergence', 'release', 'emergence', 'grace', 'emergence', 'rest'] },
  { id: 'refuge-cycle', name: 'Refuge Cycle', glyph: '⌂', description: 'Shelter and grace surround each necessary ending.', slots: ['shelter', 'shelter', 'grace', 'shelter', 'release', 'shelter', 'grace', 'rest', 'shelter', 'shelter', 'grace', 'shelter', 'release', 'shelter', 'grace', 'rest'] },
  { id: 'river-cycle', name: 'River Cycle', glyph: '≈', description: 'Emergence follows release downstream through visible consequence.', slots: ['emergence', 'veil', 'grace', 'release', 'emergence', 'veil', 'grace', 'rest', 'veil', 'emergence', 'grace', 'release', 'veil', 'emergence', 'grace', 'rest'] },
  { id: 'open-ring', name: 'Open Ring', glyph: '◜', description: 'Grace and meaningful rests keep completion from becoming enclosure.', slots: ['rest', 'rest', 'emergence', 'rest', 'release', 'rest', 'grace', 'rest', 'shelter', 'rest', 'veil', 'rest', 'release', 'rest', 'grace', 'rest'] },
] as const satisfies readonly { readonly id: string; readonly name: string; readonly glyph: string; readonly description: string; readonly slots: readonly KailashAct[] }[]

/** @deprecated Save-stable compatibility names retained for existing consumers. */
export const CANTICLE_ROLES = KAILASH_ACTS
export type CanticleRole = KailashAct
/** @deprecated Save-stable compatibility name retained for existing consumers. */
export const CANTICLE_MEASURES = KAILASH_CYCLES

export interface CanticleStatus {
  readonly measureIndex: number
  readonly measure: (typeof CANTICLE_MEASURES)[number]
  readonly slots: readonly CanticleRole[]
  readonly slotIndex: number
  readonly role: CanticleRole
  readonly restCount: number
  readonly distinctRoles: number
  readonly patternBonus: number
  readonly multiplier: number
  readonly nextSlotInMs: number
  readonly explanation: string
}

const ROLE_MULTIPLIERS: Record<CanticleRole, number> = {
  emergence: 1.45,
  shelter: 1.38,
  release: 2.15,
  veil: 1.62,
  grace: 1.5,
  rest: 1.72,
}

export function canticleStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): CanticleStatus {
  const measureIndex = Math.min(KAILASH_CYCLES.length - 1, Math.floor(readNumber(state, 'u7-measure', 1, 3)))
  const measure = KAILASH_CYCLES[measureIndex]
  const slots = measure.slots.map((defaultRole, index) => {
    const defaultIndex = KAILASH_ACTS.indexOf(defaultRole)
    const roleIndex = Math.floor(readNumber(state, `u7-slot-${String(index + 1).padStart(2, '0')}`, defaultIndex, KAILASH_ACTS.length - 1))
    return KAILASH_ACTS[roleIndex]
  })
  const slotDurationMs = 900
  const normalizedNow = Number.isFinite(nowMs) && nowMs >= 0 ? nowMs : 0
  const slotIndex = Math.floor(normalizedNow / slotDurationMs) % slots.length
  const role = slots[slotIndex]
  const families = Math.min(6, Math.ceil(totalOwned(owned, 'u7') / 50))
  const familyBonus = 1 + families * 0.035
  const measureBonus = measureIndex === 0 ? 1.05 : measureIndex === 1 ? 1.08 : measureIndex === 2 ? 1.12 : 1.1
  const restCount = slots.filter((slotRole) => slotRole === 'rest').length
  const distinctRoles = new Set(slots).size
  const transitions = slots.reduce((count, slotRole, index) => (
    slotRole === slots[(index + slots.length - 1) % slots.length] ? count : count + 1
  ), 0)
  const patternBonus = 1 + Math.min(0.36, restCount * 0.016 + Math.max(0, distinctRoles - 2) * 0.032 + transitions / slots.length * 0.08)
  const multiplier = ROLE_MULTIPLIERS[role] * familyBonus * measureBonus * patternBonus
  const nextSlotInMs = slotDurationMs - (normalizedNow % slotDurationMs)
  return {
    measureIndex,
    measure,
    slots,
    slotIndex,
    role,
    restCount,
    distinctRoles,
    patternBonus,
    multiplier,
    nextSlotInMs,
    explanation: `${measure.name} position ${slotIndex + 1}/${slots.length}: ${role}. ${restCount} rests and ${distinctRoles} acts shape a ×${patternBonus.toFixed(2)} composition bonus inside the current ×${multiplier.toFixed(2)} continuous cycle total.`,
  }
}

export function selectCanticleMeasure(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= KAILASH_CYCLES.length) return false
  markKailashCycleEdited(state)
  writeNumber(state, 'u7-measure', index)
  KAILASH_CYCLES[index].slots.forEach((role, slotIndex) => {
    writeNumber(state, `u7-slot-${String(slotIndex + 1).padStart(2, '0')}`, KAILASH_ACTS.indexOf(role))
  })
  return true
}

export function setCanticleSlotRole(
  state: NumericLawState,
  slotIndex: number,
  roleIndex: number,
): boolean {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 16) return false
  if (!Number.isInteger(roleIndex) || roleIndex < 0 || roleIndex >= KAILASH_ACTS.length) return false
  markKailashCycleEdited(state)
  writeNumber(state, `u7-slot-${String(slotIndex + 1).padStart(2, '0')}`, roleIndex)
  return true
}

export function cycleCanticleSlot(state: NumericLawState, slotIndex: number): boolean {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 16) return false
  const status = canticleStatus(state, {}, 0)
  const currentRoleIndex = KAILASH_ACTS.indexOf(status.slots[slotIndex])
  return setCanticleSlotRole(state, slotIndex, (currentRoleIndex + 1) % KAILASH_ACTS.length)
}

export const selectKailashCycle = selectCanticleMeasure
export const setKailashAct = setCanticleSlotRole
export const cycleKailashAct = cycleCanticleSlot

// Kailash weather fronts ----------------------------------------------------

export const KAILASH_FRONT_CALM_SECONDS = 150
export const KAILASH_FRONT_APPROACH_SECONDS = 45
export const KAILASH_FRONT_ACTIVE_SECONDS = 210
export const KAILASH_FRONT_ANSWER_FRACTION = 0.6
export const KAILASH_FRONT_CARRY_SECONDS = 60
/** Extra prompt value stays modest even when several earned windows overlap. */
export const KAILASH_PROMPT_FACTOR_CEILING = 1.8
/** The existing cycle and every new Kailash factor share this one total ceiling. */
export const KAILASH_LAW_FACTOR_CEILING = 5
export const KAILASH_GRACE_RESERVE_CAP_SECONDS = 1_800
export const KAILASH_GRACE_BONUS_WINDOW_SECONDS = 600
export const KAILASH_GRACE_BONUS_MAX = 0.4

export type KailashFrontPhase = 'calm' | 'approaching' | 'active'

export interface KailashFrontDef {
  readonly id: string
  readonly name: string
  readonly glyph: string
  readonly favoredRoles: readonly KailashAct[]
  readonly description: string
  readonly answer: string
  readonly silhouette: string
  readonly reducedMotionState: string
}

export const KAILASH_FRONTS: readonly KailashFrontDef[] = [
  {
    id: 'passing-snow', name: 'Passing Snow', glyph: '≋', favoredRoles: ['grace', 'rest'],
    description: 'A pale front crosses the ridge. The mountain favors grace and deliberate rest.',
    answer: 'hold at least three rests and two grace acts in the cycle',
    silhouette: 'snow veil advancing above one labeled silver descent',
    reducedMotionState: 'static snow band held at the ridge line with a text label',
  },
  {
    id: 'fire-season', name: 'Fire Season', glyph: '◇', favoredRoles: ['release'],
    description: 'A copper glow rises on the far ridge. Every release must sit beside shelter.',
    answer: 'keep at least one release, and shelter adjacent to every release',
    silhouette: 'thin copper horizon behind two stone shoulders, far from the valley',
    reducedMotionState: 'fixed copper arc on the far ridge with a text label',
  },
  {
    id: 'cloud-bank', name: 'Cloud Bank', glyph: '⌁', favoredRoles: ['veil'],
    description: 'Cloud settles over the pass. Concealment protects passage without denying it.',
    answer: 'hold at least two veil acts in the cycle',
    silhouette: 'layered cloud ledges crossing a marked mountain pass',
    reducedMotionState: 'static cloud bank drawn across the pass with a text label',
  },
  {
    id: 'clearing', name: 'Clearing', glyph: '○', favoredRoles: ['emergence'],
    description: 'The sky opens. Transitions between unlike acts read clearly on the slopes.',
    answer: 'keep five distinct acts and at least twelve transitions in the cycle',
    silhouette: 'two cloud banks parting around a numbered mountain pass',
    reducedMotionState: 'open pass held between two fixed cloud edges with a text label',
  },
]

export interface F4LawAnnouncement {
  readonly key: string
  readonly text: string
  readonly politeness: 'polite'
}

export interface F4LawEvents {
  readonly foliosEarned: number
  readonly routesEarned: number
  readonly returnsCompleted: number
  readonly tracesEarned: number
  readonly announcements: readonly F4LawAnnouncement[]
}

export interface F4LawContext {
  readonly upgrades?: readonly string[]
  readonly archiveCount?: number
  readonly promptsPaused?: boolean
}

const NO_F4_EVENTS: F4LawEvents = {
  foliosEarned: 0,
  routesEarned: 0,
  returnsCompleted: 0,
  tracesEarned: 0,
  announcements: [],
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

function kailashRoleCounts(slots: readonly KailashAct[]): Record<KailashAct, number> {
  const counts: Record<KailashAct, number> = { emergence: 0, shelter: 0, release: 0, veil: 0, grace: 0, rest: 0 }
  for (const role of slots) counts[role] += 1
  return counts
}

function everyKailashReleaseSheltered(slots: readonly KailashAct[]): boolean {
  const releases = slots.flatMap((role, index) => role === 'release' ? [index] : [])
  if (releases.length === 0) return false
  return releases.every((index) => (
    slots[(index + slots.length - 1) % slots.length] === 'shelter'
    || slots[(index + 1) % slots.length] === 'shelter'
  ))
}

function kailashTransitionCount(slots: readonly KailashAct[]): number {
  return slots.reduce((count, role, index) => (
    role === slots[(index + slots.length - 1) % slots.length] ? count : count + 1
  ), 0)
}

export function kailashFrontPredicate(frontId: string, slots: readonly KailashAct[]): boolean {
  const counts = kailashRoleCounts(slots)
  if (frontId === 'passing-snow') return counts.rest >= 3 && counts.grace >= 2
  if (frontId === 'fire-season') return everyKailashReleaseSheltered(slots)
  if (frontId === 'cloud-bank') return counts.veil >= 2
  if (frontId === 'clearing') return new Set(slots).size >= 5 && kailashTransitionCount(slots) >= 12
  return false
}

const KAILASH_PHASE_CALM = 0
const KAILASH_PHASE_APPROACHING = 1
const KAILASH_PHASE_ACTIVE = 2

function kailashPhaseDuration(phase: number): number {
  return phase === KAILASH_PHASE_CALM
    ? KAILASH_FRONT_CALM_SECONDS
    : phase === KAILASH_PHASE_APPROACHING
      ? KAILASH_FRONT_APPROACH_SECONDS
      : KAILASH_FRONT_ACTIVE_SECONDS
}

export function markKailashCycleEdited(state: NumericLawState): void {
  if (readNumber(state, 'u7-front-phase', KAILASH_PHASE_CALM, KAILASH_PHASE_ACTIVE) !== KAILASH_PHASE_CALM) {
    writeNumber(state, 'u7-front-edited', 1)
  }
}

export function kailashFrontStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): KailashFrontStatus {
  const index = Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1))
  const front = KAILASH_FRONTS[index]
  const phaseIndex = Math.floor(readNumber(state, 'u7-front-phase', KAILASH_PHASE_CALM, KAILASH_PHASE_ACTIVE))
  const phase: KailashFrontPhase = phaseIndex === KAILASH_PHASE_ACTIVE ? 'active' : phaseIndex === KAILASH_PHASE_APPROACHING ? 'approaching' : 'calm'
  const elapsed = readNumber(state, 'u7-front-elapsed', 0, kailashPhaseDuration(phaseIndex))
  const slots = canticleStatus(state, owned, 0).slots
  const predicateSatisfied = kailashFrontPredicate(front.id, slots)
  const edited = readNumber(state, 'u7-front-edited', 0, 1) >= 1
  const answered = phase === 'active' && predicateSatisfied && edited
  const answeredSeconds = readNumber(state, 'u7-front-answered-seconds', 0, KAILASH_FRONT_ACTIVE_SECONDS)
  const carrySecondsRemaining = readNumber(state, 'u7-front-carry-seconds', 0, KAILASH_FRONT_CARRY_SECONDS)
  const explanation = phase === 'calm'
    ? `The ridge is quiet. ${front.name} will approach in ${Math.ceil(kailashPhaseDuration(KAILASH_PHASE_CALM) - elapsed)}s.`
    : phase === 'approaching'
      ? `${front.name} approaches: ${front.answer}. It arrives in ${Math.ceil(kailashPhaseDuration(KAILASH_PHASE_APPROACHING) - elapsed)}s.`
      : answered
        ? `${front.name} is answered: the cycle holds its shape for ${Math.ceil(kailashPhaseDuration(KAILASH_PHASE_ACTIVE) - elapsed)}s more.`
        : `${front.name} crosses the ridge for ${Math.ceil(kailashPhaseDuration(KAILASH_PHASE_ACTIVE) - elapsed)}s: ${front.answer}.`
  return { front, phase, phaseSecondsRemaining: Math.max(0, kailashPhaseDuration(phaseIndex) - elapsed), predicateSatisfied, edited, answered, answeredSeconds, carrySecondsRemaining, explanation }
}

export function advanceKailashFronts(
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  elapsedSeconds: number,
): Pick<F4LawEvents, 'tracesEarned' | 'announcements'> {
  const announcements: F4LawAnnouncement[] = []
  let tracesEarned = 0
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return { tracesEarned, announcements }
  if (readNumber(state, 'u7-long-rest', 0, 1) >= 1) {
    const reserve = readNumber(state, 'u7-grace-reserve', 0, KAILASH_GRACE_RESERVE_CAP_SECONDS)
    writeNumber(state, 'u7-grace-reserve', Math.min(KAILASH_GRACE_RESERVE_CAP_SECONDS, reserve + Math.min(elapsedSeconds, 7 * 24 * 60 * 60)))
    return { tracesEarned, announcements }
  }
  const fullCycle = KAILASH_FRONT_CALM_SECONDS + KAILASH_FRONT_APPROACH_SECONDS + KAILASH_FRONT_ACTIVE_SECONDS
  let remaining = elapsedSeconds
  if (remaining > fullCycle * 2) {
    writeNumber(state, 'u7-front-index', (Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1)) + 1) % KAILASH_FRONTS.length)
    writeNumber(state, 'u7-front-phase', KAILASH_PHASE_CALM)
    writeNumber(state, 'u7-front-elapsed', 0)
    writeNumber(state, 'u7-front-answered-seconds', 0)
    writeNumber(state, 'u7-front-edited', 0)
    remaining = 0
  }
  const carry = readNumber(state, 'u7-front-carry-seconds', 0, KAILASH_FRONT_CARRY_SECONDS)
  if (carry > 0) writeNumber(state, 'u7-front-carry-seconds', Math.max(0, carry - elapsedSeconds))
  const bonusSeconds = readNumber(state, 'u7-grace-bonus-seconds', 0, KAILASH_GRACE_BONUS_WINDOW_SECONDS)
  if (bonusSeconds > 0) writeNumber(state, 'u7-grace-bonus-seconds', Math.max(0, bonusSeconds - elapsedSeconds))

  while (remaining > 0) {
    const phase = Math.floor(readNumber(state, 'u7-front-phase', KAILASH_PHASE_CALM, KAILASH_PHASE_ACTIVE))
    const elapsed = readNumber(state, 'u7-front-elapsed', 0, kailashPhaseDuration(phase))
    const step = Math.min(remaining, kailashPhaseDuration(phase) - elapsed)
    remaining -= step
    const index = Math.floor(readNumber(state, 'u7-front-index', 0, KAILASH_FRONTS.length - 1))
    const front = KAILASH_FRONTS[index]
    if (phase === KAILASH_PHASE_ACTIVE) {
      const slots = canticleStatus(state, owned, 0).slots
      if (kailashFrontPredicate(front.id, slots) && readNumber(state, 'u7-front-edited', 0, 1) >= 1) {
        writeNumber(state, 'u7-front-answered-seconds', Math.min(
          KAILASH_FRONT_ACTIVE_SECONDS,
          readNumber(state, 'u7-front-answered-seconds', 0, KAILASH_FRONT_ACTIVE_SECONDS) + step,
        ))
      }
    }
    if (elapsed + step < kailashPhaseDuration(phase)) {
      writeNumber(state, 'u7-front-elapsed', elapsed + step)
      continue
    }
    writeNumber(state, 'u7-front-elapsed', 0)
    if (phase === KAILASH_PHASE_CALM) {
      writeNumber(state, 'u7-front-phase', KAILASH_PHASE_APPROACHING)
      announcements.push({ key: `${front.id}-approach`, text: `${front.name} approaches the ridge. The mountain will favor ${front.favoredRoles.join(' and ')}.`, politeness: 'polite' })
    } else if (phase === KAILASH_PHASE_APPROACHING) {
      writeNumber(state, 'u7-front-phase', KAILASH_PHASE_ACTIVE)
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
      writeNumber(state, 'u7-front-phase', KAILASH_PHASE_CALM)
      writeNumber(state, 'u7-front-answered-seconds', 0)
      writeNumber(state, 'u7-front-edited', 0)
      writeNumber(state, 'u7-front-index', (index + 1) % KAILASH_FRONTS.length)
    }
  }
  return { tracesEarned, announcements }
}

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

export function enterKailashLongRest(state: NumericLawState): boolean {
  if (readNumber(state, 'u7-long-rest', 0, 1) >= 1) return false
  writeNumber(state, 'u7-long-rest', 1)
  return true
}

export function exitKailashLongRest(state: NumericLawState): boolean {
  if (readNumber(state, 'u7-long-rest', 0, 1) < 1) return false
  const reserve = readNumber(state, 'u7-grace-reserve', 0, KAILASH_GRACE_RESERVE_CAP_SECONDS)
  writeNumber(state, 'u7-long-rest', 0)
  writeNumber(state, 'u7-grace-reserve', 0)
  writeNumber(state, 'u7-grace-bonus-strength', KAILASH_GRACE_BONUS_MAX * (reserve / KAILASH_GRACE_RESERVE_CAP_SECONDS))
  writeNumber(state, 'u7-grace-bonus-seconds', reserve > 0 ? KAILASH_GRACE_BONUS_WINDOW_SECONDS : 0)
  return true
}

export function combineKailashLawFactors(baseFactor: number, frontFactor: number, carryFactor: number, graceFactor: number): number {
  const clean = (factor: number): number => Number.isFinite(factor) && factor > 1 ? factor : 1
  const promptFactor = Math.min(KAILASH_PROMPT_FACTOR_CEILING, clean(frontFactor) * clean(carryFactor) * clean(graceFactor))
  return Math.min(KAILASH_LAW_FACTOR_CEILING, clean(baseFactor) * promptFactor)
}

export function kailashFrontMultiplier(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
  baseFactor = 1,
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
  return combineKailashLawFactors(baseFactor, frontFactor, carryFactor, graceFactor)
}

export function advanceF4LawState(
  universeId: string,
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  elapsedSeconds: number,
  context: F4LawContext = {},
): F4LawEvents {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return NO_F4_EVENTS
  const elapsed = Math.min(elapsedSeconds, 7 * 24 * 60 * 60)
  if (universeId === 'prismata') {
    const status = prismataStatus(state, owned)
    const direction = status.recipe.id === 'memory' ? 1 : -0.22
    const breadth = Math.max(0.25, status.activeBands / 4)
    writeNumber(state, 'u5-fluorescence', Math.max(0, Math.min(100, status.fluorescence + direction * breadth * elapsed / 4)))
    const events = advanceBrahmalokCommissions(
      state,
      owned,
      elapsed,
      context.archiveCount ?? 0,
      (owned['u5-kindling-07'] ?? 0) > 0 && !context.promptsPaused,
    )
    return { ...NO_F4_EVENTS, ...events }
  } else if (universeId === 'tempest') {
    const status = tempestStatus(state)
    const productionScale = 0.55 + Math.min(1.8, Math.log10(totalOwned(owned, 'u6') + 1) * 0.42)
    const routeScale = (1 + status.riskIndex * 0.06) / (1 + (status.length - 1) * 0.025)
    const returningSeconds = Math.min(elapsed, status.boostRemainingSec)
    const gatheringSeconds = elapsed - returningSeconds
    writeNumber(state, 'u6-charge', Math.min(100, status.charge + gatheringSeconds * productionScale * routeScale))
    writeNumber(state, 'u6-boost-seconds', Math.max(0, status.boostRemainingSec - elapsed))
    if (context.upgrades?.includes('u6-auroral-return')) {
      const secondReturningSeconds = Math.min(elapsed, status.secondBoostRemainingSec)
      const secondGatheringSeconds = elapsed - secondReturningSeconds
      writeNumber(state, 'u6-charge-2', Math.min(100, status.secondCharge + secondGatheringSeconds * productionScale * routeScale * 0.5))
      writeNumber(state, 'u6-boost-seconds-2', Math.max(0, status.secondBoostRemainingSec - elapsed))
    }
    const events = advanceVishnulokStrains(
      state,
      elapsed,
      (owned['u6-kindling-08'] ?? 0) > 0 && !context.promptsPaused,
    )
    return { ...NO_F4_EVENTS, ...events }
  } else if (universeId === 'canticle' && (owned['u7-kindling-09'] ?? 0) > 0) {
    if (context.promptsPaused) return NO_F4_EVENTS
    const events = advanceKailashFronts(state, owned, elapsed)
    return { ...NO_F4_EVENTS, ...events }
  }
  return NO_F4_EVENTS
}

export function f4RateMultiplier(
  universeId: string,
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): number {
  if (universeId === 'prismata') return brahmalokLawMultiplier(state, owned)
  if (universeId === 'tempest') return vishnulokLawMultiplier(state)
  if (universeId === 'canticle') {
    const base = canticleStatus(state, owned, nowMs).multiplier
    return kailashFrontMultiplier(state, owned, nowMs, base)
  }
  return 1
}

export function f4ClickMultiplier(
  universeId: string,
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): number {
  if (universeId === 'prismata') {
    const status = prismataStatus(state, owned)
    return status.recipe.id === 'germination' ? 1.35 : status.recipe.id === 'proliferation' ? 1.2 : 1
  }
  if (universeId === 'tempest') {
    const status = tempestStatus(state)
    return (status.boostRemainingSec > 0 || status.secondBoostRemainingSec > 0) && status.path.id === 'ocean-balance' ? 1.5 : 1
  }
  if (universeId === 'canticle') {
    const status = canticleStatus(state, owned, nowMs)
    return status.role === 'emergence' || status.role === 'veil' ? 1.25 : 1
  }
  return 1
}
