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

/** Keeps player-authored F4 configuration across an Epoch while dropping live charge/storage. */
export function retainedF4LawConfiguration(
  universeId: string,
  state: Readonly<NumericLawState>,
): NumericLawState {
  const keep = universeId === 'prismata'
    ? (key: string) => key === 'u5-recipe' || key.startsWith('u5-route-')
    : universeId === 'tempest'
      ? (key: string) => key === 'u6-path' || key === 'u6-path-length' || key === 'u6-path-risk'
      : universeId === 'canticle'
        ? (key: string) => key === 'u7-measure' || key.startsWith('u7-slot-')
        : () => false
  return Object.fromEntries(Object.entries(state).filter(([key]) => keep(key)))
}

export const PRISMATA_RECIPES = [
  { id: 'coherence', name: 'Coherence', glyph: '┃', description: 'Focus the strongest wavelength family into one narrow, high-output beam.' },
  { id: 'synthesis', name: 'White Synthesis', glyph: '✧', description: 'Reward broad, balanced coverage across every labeled wavelength family.' },
  { id: 'fluorescence', name: 'Fluorescence', glyph: '◫', description: 'Store delayed light, then release it as a stable afterglow.' },
  { id: 'diffraction', name: 'Diffraction', glyph: '╱', description: 'Spread output across many bands for active opportunities and archive discovery.' },
] as const

export type PrismataRecipeId = (typeof PRISMATA_RECIPES)[number]['id']

export const PRISMATA_BANDS = [
  { id: 'red', name: 'Red', glyph: 'Ⅰ' },
  { id: 'amber', name: 'Amber', glyph: 'Ⅱ' },
  { id: 'green', name: 'Green', glyph: 'Ⅲ' },
  { id: 'blue', name: 'Blue', glyph: 'Ⅳ' },
  { id: 'violet', name: 'Violet', glyph: 'Ⅴ' },
  { id: 'invisible', name: 'Invisible', glyph: 'Ⅵ' },
] as const

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

export function prismataStatus(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): PrismataStatus {
  const recipeIndex = Math.min(PRISMATA_RECIPES.length - 1, Math.floor(readNumber(state, 'u5-recipe', 1, 3)))
  const routes = Array.from({ length: 18 }, (_, index) => Math.floor(readNumber(
    state,
    `u5-route-${String(index + 1).padStart(2, '0')}`,
    Math.floor(index / 3),
    PRISMATA_BANDS.length - 1,
  )))
  const bands = Array.from({ length: PRISMATA_BANDS.length }, () => 0)
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
  return { recipeIndex, recipe: PRISMATA_RECIPES[recipeIndex], bands, routes, activeBands, balance, fluorescence, multiplier, explanation }
}

export function selectPrismataRecipe(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= PRISMATA_RECIPES.length) return false
  writeNumber(state, 'u5-recipe', index)
  return true
}

export function routePrismataKindling(
  state: NumericLawState,
  kindlingIndex: number,
  bandIndex: number,
): boolean {
  if (!Number.isInteger(kindlingIndex) || kindlingIndex < 0 || kindlingIndex >= 18) return false
  if (!Number.isInteger(bandIndex) || bandIndex < 0 || bandIndex >= PRISMATA_BANDS.length) return false
  writeNumber(state, `u5-route-${String(kindlingIndex + 1).padStart(2, '0')}`, bandIndex)
  return true
}

export const TEMPEST_PATHS = [
  { id: 'conductor', name: 'Conductor', glyph: 'ϟ', threshold: 20, boost: 1.8, durationSec: 22, defaultLength: 2, defaultRisk: 0, description: 'Frequent short discharges with a reliable return.' },
  { id: 'supercell', name: 'Supercell', glyph: '↯', threshold: 70, boost: 4.4, durationSec: 30, defaultLength: 7, defaultRisk: 2, description: 'Hold a long charge cycle for one enormous chain.' },
  { id: 'jetstream', name: 'Jetstream', glyph: '⇝', threshold: 45, boost: 2.6, durationSec: 48, defaultLength: 6, defaultRisk: 1, description: 'Route charge into a long, stable circulation path.' },
  { id: 'stormchaser', name: 'Stormchaser', glyph: '⌁', threshold: 35, boost: 3.1, durationSec: 26, defaultLength: 4, defaultRisk: 3, description: 'Follow an active branching leader for a sharper burst.' },
] as const

export const TEMPEST_RISKS = [
  { id: 'grounded', name: 'Grounded', glyph: '▁', description: 'Lower return, stable containment.' },
  { id: 'exposed', name: 'Exposed', glyph: '⌁', description: 'Moderate branching risk and return.' },
  { id: 'volatile', name: 'Volatile', glyph: '↯', description: 'High threshold and stronger discharge.' },
  { id: 'untethered', name: 'Untethered', glyph: '☈', description: 'Maximum return with the least passive stability.' },
] as const

export interface TempestStatus {
  readonly pathIndex: number
  readonly path: (typeof TEMPEST_PATHS)[number]
  readonly length: number
  readonly riskIndex: number
  readonly risk: (typeof TEMPEST_RISKS)[number]
  readonly threshold: number
  readonly boost: number
  readonly durationSec: number
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
  const length = Math.max(1, Math.floor(readNumber(state, 'u6-path-length', path.defaultLength, 8)))
  const riskIndex = Math.min(TEMPEST_RISKS.length - 1, Math.floor(readNumber(state, 'u6-path-risk', path.defaultRisk, 3)))
  const risk = TEMPEST_RISKS[riskIndex]
  const threshold = Math.min(95, Math.max(10, path.threshold + (length - path.defaultLength) * 4 + (riskIndex - path.defaultRisk) * 5))
  const boost = path.boost * (0.78 + length * 0.055 + riskIndex * 0.12)
  const durationSec = Math.max(12, Math.round(path.durationSec * (0.78 + length * 0.045)))
  const charge = readNumber(state, 'u6-charge', 0, 100)
  const boostRemainingSec = readNumber(state, 'u6-boost-seconds', 0, durationSec)
  const ready = charge >= threshold
  const multiplier = boostRemainingSec > 0 ? boost : Math.max(0.72, 0.9 + charge * 0.0038 - riskIndex * 0.035)
  const explanation = boostRemainingSec > 0
    ? `${path.name} is propagating across ${length} cells for ${Math.ceil(boostRemainingSec)}s at ${risk.name.toLowerCase()} risk.`
    : ready
      ? `${path.name} is charged: ${length} cells, ${risk.name.toLowerCase()} risk, ×${boost.toFixed(2)} return.`
      : `${Math.ceil(threshold - charge)}% more potential is required for this ${length}-cell ${path.name} route.`
  return { pathIndex, path, length, riskIndex, risk, threshold, boost, durationSec, charge, boostRemainingSec, ready, multiplier, explanation }
}

export function selectTempestPath(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= TEMPEST_PATHS.length) return false
  writeNumber(state, 'u6-path', index)
  return true
}

export function configureTempestRoute(
  state: NumericLawState,
  length: number,
  riskIndex: number,
): boolean {
  if (!Number.isInteger(length) || length < 1 || length > 8) return false
  if (!Number.isInteger(riskIndex) || riskIndex < 0 || riskIndex >= TEMPEST_RISKS.length) return false
  writeNumber(state, 'u6-path-length', length)
  writeNumber(state, 'u6-path-risk', riskIndex)
  return true
}

export function dischargeTempest(state: NumericLawState): boolean {
  const status = tempestStatus(state)
  if (!status.ready || status.boostRemainingSec > 0) return false
  writeNumber(state, 'u6-charge', Math.max(0, status.charge - status.threshold))
  writeNumber(state, 'u6-boost-seconds', status.durationSec)
  writeNumber(state, 'u6-last-discharge', status.pathIndex + 1)
  writeNumber(state, 'u6-last-length', status.length)
  writeNumber(state, 'u6-last-risk', status.riskIndex)
  return true
}

export const CANTICLE_ROLES = ['pulse', 'sustain', 'multiplier', 'rest', 'syncopation', 'echo'] as const
export type CanticleRole = (typeof CANTICLE_ROLES)[number]

export const CANTICLE_MEASURES = [
  { id: 'pulse', name: 'Pulse', glyph: '●', description: 'Short active cycles with a strong downbeat.', slots: ['pulse', 'echo', 'pulse', 'multiplier', 'pulse', 'echo', 'pulse', 'rest', 'pulse', 'syncopation', 'pulse', 'multiplier', 'pulse', 'echo', 'pulse', 'rest'] },
  { id: 'drone', name: 'Drone', glyph: '━', description: 'A stable passive measure built from sustained relationships.', slots: ['sustain', 'sustain', 'echo', 'sustain', 'multiplier', 'sustain', 'echo', 'rest', 'sustain', 'sustain', 'echo', 'sustain', 'multiplier', 'sustain', 'echo', 'rest'] },
  { id: 'counterpoint', name: 'Counterpoint', glyph: '≋', description: 'Two families answer one another across the measure.', slots: ['pulse', 'syncopation', 'echo', 'multiplier', 'pulse', 'syncopation', 'echo', 'rest', 'syncopation', 'pulse', 'echo', 'multiplier', 'syncopation', 'pulse', 'echo', 'rest'] },
  { id: 'silence', name: 'Silence', glyph: '◌', description: 'Strategic rests amplify the relationships around them.', slots: ['rest', 'rest', 'pulse', 'rest', 'multiplier', 'rest', 'echo', 'rest', 'sustain', 'rest', 'syncopation', 'rest', 'multiplier', 'rest', 'echo', 'rest'] },
] as const satisfies readonly { readonly id: string; readonly name: string; readonly glyph: string; readonly description: string; readonly slots: readonly CanticleRole[] }[]

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
  const slots = measure.slots.map((defaultRole, index) => {
    const defaultIndex = CANTICLE_ROLES.indexOf(defaultRole)
    const roleIndex = Math.floor(readNumber(state, `u7-slot-${String(index + 1).padStart(2, '0')}`, defaultIndex, CANTICLE_ROLES.length - 1))
    return CANTICLE_ROLES[roleIndex]
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
    explanation: `${measure.name} slot ${slotIndex + 1}/${slots.length}: ${role}. ${restCount} rests and ${distinctRoles} roles shape a ×${patternBonus.toFixed(2)} relationship bonus.`,
  }
}

export function selectCanticleMeasure(state: NumericLawState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= CANTICLE_MEASURES.length) return false
  writeNumber(state, 'u7-measure', index)
  CANTICLE_MEASURES[index].slots.forEach((role, slotIndex) => {
    writeNumber(state, `u7-slot-${String(slotIndex + 1).padStart(2, '0')}`, CANTICLE_ROLES.indexOf(role))
  })
  return true
}

export function setCanticleSlotRole(
  state: NumericLawState,
  slotIndex: number,
  roleIndex: number,
): boolean {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 16) return false
  if (!Number.isInteger(roleIndex) || roleIndex < 0 || roleIndex >= CANTICLE_ROLES.length) return false
  writeNumber(state, `u7-slot-${String(slotIndex + 1).padStart(2, '0')}`, roleIndex)
  return true
}

export function cycleCanticleSlot(state: NumericLawState, slotIndex: number): boolean {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 16) return false
  const status = canticleStatus(state, {}, 0)
  const currentRoleIndex = CANTICLE_ROLES.indexOf(status.slots[slotIndex])
  return setCanticleSlotRole(state, slotIndex, (currentRoleIndex + 1) % CANTICLE_ROLES.length)
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
    const routeScale = (1 + status.riskIndex * 0.06) / (1 + (status.length - 1) * 0.025)
    writeNumber(state, 'u6-charge', Math.min(100, status.charge + elapsed * productionScale * routeScale))
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
