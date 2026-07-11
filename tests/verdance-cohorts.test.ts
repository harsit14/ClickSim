import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceVerdanceCohorts,
  compactVerdanceCohorts,
  plantVerdanceCohort,
  previewVerdancePruning,
  verdanceCohortProductionMultiplier,
  verdanceStageForAge,
} from '../src/content/universes/verdance/cohorts'
import {
  advanceVerdanceCohortLawState,
  clearVerdanceGraft,
  configureVerdanceGraft,
  verdanceCohortRuntimeSummary,
  verdanceGeneratorCohortStatus,
  verdanceGraftingStatus,
  verdanceGraftProductionMultiplier,
} from '../src/content/universes/verdance/runtime'
import { VERDANCE, VERDANCE_UPGRADES } from '../src/content/universes/verdance'
import { unitRate, upgradeUnlocked, type EcoState } from '../src/engine/compute'
import { ZERO_AMOUNT, amountFromNumber, amountToNumber } from '../src/core/numeric/amount'

test('Verdance cohorts age through four deterministic non-withering stages', () => {
  assert.equal(verdanceStageForAge(0), 'u3-cohort-new')
  assert.equal(verdanceStageForAge(5 * 60_000), 'u3-cohort-rooted')
  assert.equal(verdanceStageForAge(60 * 60_000), 'u3-cohort-mature')
  assert.equal(verdanceStageForAge(8 * 60 * 60_000), 'u3-cohort-ancient')
  assert.equal(advanceVerdanceCohorts([plantVerdanceCohort(4)], 10 * 60 * 60_000)[0].stageId, 'u3-cohort-ancient')
})

test('offline aging respects the caller cap and compacts by stage', () => {
  const rows = advanceVerdanceCohorts([plantVerdanceCohort(2), plantVerdanceCohort(3)], 10 * 60_000, 5 * 60_000)
  assert.deepEqual(rows, [{ stageId: 'u3-cohort-rooted', quantity: 5, ageMs: 5 * 60_000 }])
  assert.equal(compactVerdanceCohorts(rows).length, 1)
})

test('production and Pruning reward maturity instead of raw count', () => {
  const rows = [
    { stageId: 'u3-cohort-new' as const, quantity: 5, ageMs: 0 },
    { stageId: 'u3-cohort-mature' as const, quantity: 5, ageMs: 60 * 60_000 },
    { stageId: 'u3-cohort-ancient' as const, quantity: 5, ageMs: 8 * 60 * 60_000 },
  ]
  assert.equal(verdanceCohortProductionMultiplier(rows), (5 + 10 + 17.5) / 15)
  assert.deepEqual(previewVerdancePruning(rows), { maturityPoints: 20, memorySeeds: 4, prunableQuantity: 10 })
})

test('invalid time and quantity values fail closed', () => {
  assert.throws(() => plantVerdanceCohort(0), /positive safe integer/)
  assert.throws(() => verdanceStageForAge(Number.NaN), /finite and nonnegative/)
  assert.throws(() => advanceVerdanceCohorts([plantVerdanceCohort(1)], 1, -1), /finite and nonnegative/)
})

test('runtime cohorts age per Kindling and new planting dilutes maturity', () => {
  const generator = VERDANCE.generators[0]
  const state = {}
  const owned = { [generator.id]: 10 }
  advanceVerdanceCohortLawState(state, owned, [generator.id], 5 * 60_000)
  assert.equal(verdanceGeneratorCohortStatus(generator.id, 10, state).stageLabel, 'rooted')
  assert.equal(verdanceGeneratorCohortStatus(generator.id, 10, state).multiplier, 1.35)

  owned[generator.id] = 20
  advanceVerdanceCohortLawState(state, owned, [generator.id], 0)
  const diluted = verdanceGeneratorCohortStatus(generator.id, 20, state)
  assert.equal(diluted.stageLabel, 'new')
  assert.equal(diluted.multiplier, 1)
  assert.equal(Object.keys(state).length, 2)
})

test('runtime maturity changes production and contributes Memory Seeds to Pruning', () => {
  const generator = VERDANCE.generators[0]
  const numericLawState = {}
  const owned = { [generator.id]: 20 }
  advanceVerdanceCohortLawState(numericLawState, owned, [generator.id], 8 * 60 * 60_000)
  const summary = verdanceCohortRuntimeSummary([generator.id], owned, numericLawState)
  assert.equal(summary.dominantStageLabel, 'ancient')
  assert.equal(summary.multiplier, 3.5)
  assert.equal(summary.memorySeedBonus, 12)

  const economy: EcoState = {
    activeUniverse: 'verdance', light: ZERO_AMOUNT, totalEarned: ZERO_AMOUNT, clicks: 0,
    owned, upgrades: [], achievements: [], stardustTotal: ZERO_AMOUNT, constellation: [],
    stardustWorks: {}, singUpgrades: [], deepWorks: {}, challenge: null, challengesDone: [],
    ending: null, remembrances: 0, curiosities: [], keeperFedUntil: 0, beacons: [],
    darkBetween: ZERO_AMOUNT, wayfinder: [], vesselParts: [], numericLawState,
  }
  assert.equal(amountToNumber(unitRate(economy, generator)), generator.baseRate * 3.5)
})

test('grafting lends an older rootstock maturity to one younger scion at a donor cost', () => {
  const [rootstock, scion, untouched] = VERDANCE.generators
  const generatorIds = VERDANCE.generators.map(({ id }) => id)
  const state = {}
  const owned = { [rootstock.id]: 10, [scion.id]: 10, [untouched.id]: 10 }
  advanceVerdanceCohortLawState(state, owned, [rootstock.id], 8 * 60 * 60_000)
  advanceVerdanceCohortLawState(state, owned, [scion.id, untouched.id], 0)
  assert.equal(configureVerdanceGraft(state, 0, 1), true)

  const graft = verdanceGraftingStatus(generatorIds, owned, state)
  assert.equal(graft.configured, true)
  assert.equal(graft.active, true)
  assert.equal(graft.rootstockStageLabel, 'ancient')
  assert.equal(graft.scionStageLabel, 'new')
  assert.equal(graft.rootstockProductionFactor, 0.92)
  assert.equal(graft.scionGraftedMultiplier, 2.375)
  assert.equal(verdanceGraftProductionMultiplier(rootstock.id, generatorIds, owned, state), 0.92)
  assert.equal(verdanceGraftProductionMultiplier(scion.id, generatorIds, owned, state), 2.375)
  assert.equal(verdanceGraftProductionMultiplier(untouched.id, generatorIds, owned, state), 1)

  const economy: EcoState = {
    activeUniverse: 'verdance', light: ZERO_AMOUNT, totalEarned: ZERO_AMOUNT, clicks: 0,
    owned, upgrades: [], achievements: [], stardustTotal: ZERO_AMOUNT, constellation: [],
    stardustWorks: {}, singUpgrades: [], deepWorks: {}, challenge: null, challengesDone: [],
    ending: null, remembrances: 0, curiosities: [], keeperFedUntil: 0, beacons: [],
    darkBetween: ZERO_AMOUNT, wayfinder: [], vesselParts: [], numericLawState: state,
  }
  assert.equal(amountToNumber(unitRate(economy, rootstock)), rootstock.baseRate * 3.5 * 0.92)
  assert.equal(amountToNumber(unitRate(economy, scion)), scion.baseRate * 2.375)
})

test('grafting rejects invalid pairs, rests without an age lead, and severs cleanly', () => {
  const generatorIds = VERDANCE.generators.map(({ id }) => id)
  const state = {}
  const owned = { [generatorIds[0]]: 10, [generatorIds[1]]: 10 }
  assert.equal(configureVerdanceGraft(state, 0, 0), false)
  assert.equal(configureVerdanceGraft(state, -1, 1), false)
  assert.equal(configureVerdanceGraft(state, 0, 18), false)
  assert.equal(configureVerdanceGraft(state, 0, 1), true)
  assert.equal(verdanceGraftingStatus(generatorIds, owned, state).active, false)
  assert.equal(clearVerdanceGraft(state), true)
  assert.equal(clearVerdanceGraft(state), false)
  assert.equal(verdanceGraftingStatus(generatorIds, owned, state).configured, false)
})

test('every Verdance Kindling participates in a complete twelve-link resonance network', () => {
  const resonances = VERDANCE_UPGRADES.flatMap((upgrade) => (
    upgrade.effects
      .filter((effect) => effect.kind === 'synergy')
      .map((effect) => ({ upgrade, effect }))
  ))
  assert.equal(resonances.length, 12)
  assert.deepEqual(
    new Set(resonances.flatMap(({ effect }) => [effect.gen, effect.per])),
    new Set(VERDANCE.generators.map(({ id }) => id)),
  )

  const owned = Object.fromEntries(VERDANCE.generators.map(({ id }) => [id, 10]))
  const economy: EcoState = {
    activeUniverse: 'verdance', light: amountFromNumber(1e30), totalEarned: amountFromNumber(1e30), clicks: 0,
    owned, upgrades: resonances.map(({ upgrade }) => upgrade.id), achievements: [], stardustTotal: ZERO_AMOUNT,
    constellation: [], stardustWorks: {}, singUpgrades: [], deepWorks: {}, challenge: null,
    challengesDone: [], ending: null, remembrances: 0, curiosities: [], keeperFedUntil: 0,
    beacons: [], darkBetween: ZERO_AMOUNT, wayfinder: [], vesselParts: [], numericLawState: {},
  }

  for (const { upgrade, effect } of resonances) {
    assert.equal(upgrade.unlock.gen, effect.gen)
    assert.equal(upgrade.unlock.count, 10)
    assert.equal(upgradeUnlocked(economy, upgrade), true)
    const target = VERDANCE.generatorById.get(effect.gen)!
    const expected = target.baseRate * (1 + effect.value * 10)
    assert.ok(Math.abs(amountToNumber(unitRate(economy, target)) - expected) <= expected * 1e-12)
  }
})
