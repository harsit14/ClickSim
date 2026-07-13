import {
  BRAHMALOK_MODES,
  KAILASH_CYCLES,
  VISHNULOK_CIRCUITS,
  advanceF4LawState,
  brahmalokStatus,
  kailashStatus,
  completeVishnulokReturn,
  selectBrahmalokMode,
  selectKailashCycle,
  selectVishnulokCircuit,
  vishnulokCircuitStatus,
} from '../src/content/universes/f4-runtime'
import type { EconomyAmount } from '../src/content/universes/types'

type NumericLawState = Record<string, EconomyAmount>

export interface LokaEquityCase {
  readonly universeId: 'brahmalok' | 'vishnulok' | 'kailash'
  readonly strategyId: string
  readonly averageMultiplier: number
  readonly peakMultiplier: number
  readonly activeFraction: number
}

function ownedKindlings(prefix: 'brahmalok' | 'vishnulok' | 'kailash'): Record<string, number> {
  return Object.fromEntries(Array.from({ length: 18 }, (_, index) => [
    `${prefix}-kindling-${String(index + 1).padStart(2, '0')}`,
    50,
  ]))
}

/** Simulates an established player actively using each loka's core instrument. */
export function buildLokaActiveEquity(durationSec = 1_800): readonly LokaEquityCase[] {
  const cases: LokaEquityCase[] = []
  const brahmaOwned = ownedKindlings('brahmalok')
  for (let modeIndex = 0; modeIndex < BRAHMALOK_MODES.length; modeIndex++) {
    const state: NumericLawState = {}
    selectBrahmalokMode(state, modeIndex)
    if (BRAHMALOK_MODES[modeIndex].id === 'memory') advanceF4LawState('brahmalok', state, brahmaOwned, 400)
    const multiplier = brahmalokStatus(state, brahmaOwned).multiplier
    cases.push({ universeId: 'brahmalok', strategyId: BRAHMALOK_MODES[modeIndex].id, averageMultiplier: multiplier, peakMultiplier: multiplier, activeFraction: 1 })
  }

  const vishnuOwned = ownedKindlings('vishnulok')
  for (let circuitIndex = 0; circuitIndex < VISHNULOK_CIRCUITS.length; circuitIndex++) {
    const state: NumericLawState = {}
    selectVishnulokCircuit(state, circuitIndex)
    let total = 0
    let peak = 1
    let returningSeconds = 0
    for (let second = 0; second < durationSec; second++) {
      advanceF4LawState('vishnulok', state, vishnuOwned, 1)
      let status = vishnulokCircuitStatus(state)
      if (status.ready && status.returnRemainingSec <= 0) {
        completeVishnulokReturn(state)
        status = vishnulokCircuitStatus(state)
      }
      total += status.multiplier
      peak = Math.max(peak, status.multiplier)
      if (status.returnRemainingSec > 0) returningSeconds++
    }
    cases.push({ universeId: 'vishnulok', strategyId: VISHNULOK_CIRCUITS[circuitIndex].id, averageMultiplier: total / durationSec, peakMultiplier: peak, activeFraction: returningSeconds / durationSec })
  }

  const kailashOwned = ownedKindlings('kailash')
  for (let cycleIndex = 0; cycleIndex < KAILASH_CYCLES.length; cycleIndex++) {
    const state: NumericLawState = {}
    selectKailashCycle(state, cycleIndex)
    const readings = Array.from({ length: 16 }, (_, position) => kailashStatus(state, kailashOwned, position * 900).multiplier)
    cases.push({
      universeId: 'kailash',
      strategyId: KAILASH_CYCLES[cycleIndex].id,
      averageMultiplier: readings.reduce((sum, multiplier) => sum + multiplier, 0) / readings.length,
      peakMultiplier: Math.max(...readings),
      activeFraction: 1,
    })
  }
  return cases
}

export function validateLokaActiveEquity(cases = buildLokaActiveEquity()): readonly string[] {
  const issues: string[] = []
  for (const entry of cases) {
    if (!Number.isFinite(entry.averageMultiplier) || entry.averageMultiplier < 1.25 || entry.averageMultiplier > 3.5) {
      issues.push(`${entry.universeId}/${entry.strategyId} has outlying average ×${entry.averageMultiplier.toFixed(2)}`)
    }
  }
  const bestByUniverse = (['brahmalok', 'vishnulok', 'kailash'] as const).map((universeId) => Math.max(
    ...cases.filter((entry) => entry.universeId === universeId).map((entry) => entry.averageMultiplier),
  ))
  const spread = Math.max(...bestByUniverse) / Math.min(...bestByUniverse)
  if (spread > 1.25) issues.push(`best active strategies differ by ${(spread * 100 - 100).toFixed(1)}%`)
  return issues
}
