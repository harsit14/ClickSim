import type { EconomyAmount } from './types'
import { amountFromNumber, amountToBoundedNumber } from '../../core/numeric/amount'

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

export const PRISMATA_RECIPES = [
  { id: 'coherence', name: 'Coherence', glyph: '┃', description: 'Focus the strongest wavelength family into one narrow, high-output beam.' },
  { id: 'synthesis', name: 'White Synthesis', glyph: '✧', description: 'Reward broad, balanced coverage across every labeled wavelength family.' },
  { id: 'fluorescence', name: 'Fluorescence', glyph: '◫', description: 'Store delayed light, then release it as a stable afterglow.' },
  { id: 'diffraction', name: 'Diffraction', glyph: '╱', description: 'Spread output across many bands for active opportunities and archive discovery.' },
] as const

export type PrismataRecipeId = (typeof PRISMATA_RECIPES)[number]['id']

export interface PrismataStatus {
  readonly recipeIndex: number
  readonly recipe: (typeof PRISMATA_RECIPES)[number]
  readonly bands: readonly number[]
  readonly activeBands: number
  readonly balance: number
  readonly fluorescence: number
  readonly multiplier: number
  readonly explanation: string
}

export function prismataStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): PrismataStatus {
  const recipeIndex = Math.min(PRISMATA_RECIPES.length - 1, Math.floor(readNumber(state, 'u5-recipe', 1, 3)))
  const bands = Array.from({ length: 6 }, (_, band) => {
    let quantity = 0
    for (let offset = 1; offset <= 3; offset++) {
      quantity += Math.max(0, owned[`u5-kindling-${String(band * 3 + offset).padStart(2, '0')}`] ?? 0)
    }
    return quantity
  })
  const active = bands.filter((quantity) => quantity > 0)
  const activeBands = active.length
  const strongest = Math.max(0, ...bands)
  const total = bands.reduce((sum, quantity) => sum + quantity, 0)
  const weakestActive = active.length > 0 ? Math.min(...active) : 0
  const balance = strongest > 0 ? weakestActive / strongest : 0
  const fluorescence = readNumber(state, 'u5-fluorescence', 0, 100)
  let multiplier = 1
  let explanation = 'Establish a wavelength family to begin optical synthesis.'
  if (recipeIndex === 0 && total > 0) {
    const focus = strongest / total
    multiplier = 1 + focus * 2.4
    explanation = `${Math.round(focus * 100)}% of Chroma is focused through the strongest band.`
  } else if (recipeIndex === 1 && activeBands > 0) {
    multiplier = 1 + activeBands * 0.18 + balance * 0.5 + (activeBands === 6 ? 0.45 : 0)
    explanation = `${activeBands}/6 labeled bands contribute; balance is ${Math.round(balance * 100)}%.`
  } else if (recipeIndex === 2) {
    multiplier = 0.9 + fluorescence * 0.022
    explanation = `${Math.round(fluorescence)}% delayed light is held in the fluorescent lattice.`
  } else if (recipeIndex === 3) {
    multiplier = 1 + activeBands * 0.16
    explanation = `${activeBands}/6 bands are spread into distinct diffraction paths.`
  }
  return { recipeIndex, recipe: PRISMATA_RECIPES[recipeIndex], bands, activeBands, balance, fluorescence, multiplier, explanation }
}

export function selectPrismataRecipe(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= PRISMATA_RECIPES.length) return false
  writeNumber(state, 'u5-recipe', index)
  return true
}

export const TEMPEST_PATHS = [
  { id: 'conductor', name: 'Conductor', glyph: 'ϟ', threshold: 20, boost: 1.8, durationSec: 22, description: 'Frequent short discharges with a reliable return.' },
  { id: 'supercell', name: 'Supercell', glyph: '↯', threshold: 70, boost: 4.4, durationSec: 30, description: 'Hold a long charge cycle for one enormous chain.' },
  { id: 'jetstream', name: 'Jetstream', glyph: '⇝', threshold: 45, boost: 2.6, durationSec: 48, description: 'Route charge into a long, stable circulation path.' },
  { id: 'stormchaser', name: 'Stormchaser', glyph: '⌁', threshold: 35, boost: 3.1, durationSec: 26, description: 'Follow an active branching leader for a sharper burst.' },
] as const

export interface TempestStatus {
  readonly pathIndex: number
  readonly path: (typeof TEMPEST_PATHS)[number]
  readonly charge: number
  readonly boostRemainingSec: number
  readonly ready: boolean
  readonly multiplier: number
  readonly explanation: string
}

export function tempestStatus(
  state: Readonly<NumericLawState> | undefined,
): TempestStatus {
  const pathIndex = Math.min(TEMPEST_PATHS.length - 1, Math.floor(readNumber(state, 'u6-path', 0, 3)))
  const path = TEMPEST_PATHS[pathIndex]
  const charge = readNumber(state, 'u6-charge', 0, 100)
  const boostRemainingSec = readNumber(state, 'u6-boost-seconds', 0, path.durationSec)
  const ready = charge >= path.threshold
  const multiplier = boostRemainingSec > 0 ? path.boost : 0.88 + charge * 0.0042
  const explanation = boostRemainingSec > 0
    ? `${path.name} is propagating for ${Math.ceil(boostRemainingSec)}s.`
    : ready
      ? `${path.name} is charged and ready to discharge.`
      : `${Math.ceil(path.threshold - charge)}% more potential is required for ${path.name}.`
  return { pathIndex, path, charge, boostRemainingSec, ready, multiplier, explanation }
}

export function selectTempestPath(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= TEMPEST_PATHS.length) return false
  writeNumber(state, 'u6-path', index)
  return true
}

export function dischargeTempest(state: NumericLawState): boolean {
  const status = tempestStatus(state)
  if (!status.ready || status.boostRemainingSec > 0) return false
  writeNumber(state, 'u6-charge', Math.max(0, status.charge - status.path.threshold))
  writeNumber(state, 'u6-boost-seconds', status.path.durationSec)
  writeNumber(state, 'u6-last-discharge', status.pathIndex + 1)
  return true
}

export const CANTICLE_MEASURES = [
  { id: 'pulse', name: 'Pulse', glyph: '●', description: 'Short active cycles with a strong downbeat.', slots: ['pulse', 'echo', 'pulse', 'multiplier', 'pulse', 'echo', 'pulse', 'rest'] },
  { id: 'drone', name: 'Drone', glyph: '━', description: 'A stable passive measure built from sustained relationships.', slots: ['sustain', 'sustain', 'echo', 'sustain', 'multiplier', 'sustain', 'echo', 'rest'] },
  { id: 'counterpoint', name: 'Counterpoint', glyph: '≋', description: 'Two families answer one another across the measure.', slots: ['pulse', 'syncopation', 'echo', 'multiplier', 'pulse', 'syncopation', 'echo', 'rest'] },
  { id: 'silence', name: 'Silence', glyph: '◌', description: 'Strategic rests amplify the relationships around them.', slots: ['rest', 'rest', 'pulse', 'rest', 'multiplier', 'rest', 'echo', 'rest'] },
] as const

export type CanticleRole = (typeof CANTICLE_MEASURES)[number]['slots'][number]

export interface CanticleStatus {
  readonly measureIndex: number
  readonly measure: (typeof CANTICLE_MEASURES)[number]
  readonly slotIndex: number
  readonly role: CanticleRole
  readonly multiplier: number
  readonly nextSlotInMs: number
  readonly explanation: string
}

const ROLE_MULTIPLIERS: Record<CanticleRole, number> = {
  pulse: 1.45,
  sustain: 1.38,
  multiplier: 2.15,
  rest: 1.72,
  syncopation: 1.62,
  echo: 1.5,
}

export function canticleStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): CanticleStatus {
  const measureIndex = Math.min(CANTICLE_MEASURES.length - 1, Math.floor(readNumber(state, 'u7-measure', 1, 3)))
  const measure = CANTICLE_MEASURES[measureIndex]
  const slotDurationMs = 900
  const normalizedNow = Number.isFinite(nowMs) && nowMs >= 0 ? nowMs : 0
  const slotIndex = Math.floor(normalizedNow / slotDurationMs) % measure.slots.length
  const role = measure.slots[slotIndex]
  const families = Math.min(6, Math.ceil(totalOwned(owned, 'u7') / 50))
  const familyBonus = 1 + families * 0.035
  const measureBonus = measureIndex === 0 ? 1.05 : measureIndex === 1 ? 1.08 : measureIndex === 2 ? 1.12 : 1.1
  const multiplier = ROLE_MULTIPLIERS[role] * familyBonus * measureBonus
  const nextSlotInMs = slotDurationMs - (normalizedNow % slotDurationMs)
  return {
    measureIndex,
    measure,
    slotIndex,
    role,
    multiplier,
    nextSlotInMs,
    explanation: `${measure.name} slot ${slotIndex + 1}/${measure.slots.length}: ${role}. ${families} Kindling families are audible and visually labeled.`,
  }
}

export function selectCanticleMeasure(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= CANTICLE_MEASURES.length) return false
  writeNumber(state, 'u7-measure', index)
  return true
}

export function advanceF4LawState(
  universeId: string,
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  elapsedSeconds: number,
): void {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return
  const elapsed = Math.min(elapsedSeconds, 7 * 24 * 60 * 60)
  if (universeId === 'prismata') {
    const status = prismataStatus(state, owned)
    const direction = status.recipe.id === 'fluorescence' ? 1 : -0.22
    const breadth = Math.max(0.25, status.activeBands / 6)
    writeNumber(state, 'u5-fluorescence', Math.max(0, Math.min(100, status.fluorescence + direction * breadth * elapsed / 4)))
  } else if (universeId === 'tempest') {
    const status = tempestStatus(state)
    const productionScale = 0.55 + Math.min(1.8, Math.log10(totalOwned(owned, 'u6') + 1) * 0.42)
    writeNumber(state, 'u6-charge', Math.min(100, status.charge + elapsed * productionScale))
    writeNumber(state, 'u6-boost-seconds', Math.max(0, status.boostRemainingSec - elapsed))
  }
}

export function f4RateMultiplier(
  universeId: string,
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
  nowMs = Date.now(),
): number {
  if (universeId === 'prismata') return prismataStatus(state, owned).multiplier
  if (universeId === 'tempest') return tempestStatus(state).multiplier
  if (universeId === 'canticle') return canticleStatus(state, owned, nowMs).multiplier
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
    return status.recipe.id === 'coherence' ? 1.35 : status.recipe.id === 'diffraction' ? 1.2 : 1
  }
  if (universeId === 'tempest') {
    const status = tempestStatus(state)
    return status.boostRemainingSec > 0 && status.path.id === 'stormchaser' ? 1.5 : 1
  }
  if (universeId === 'canticle') {
    const status = canticleStatus(state, owned, nowMs)
    return status.role === 'pulse' || status.role === 'syncopation' ? 1.25 : 1
  }
  return 1
}
