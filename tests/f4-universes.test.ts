import assert from 'node:assert/strict'
import test from 'node:test'
import { validateUniverseAudioDef } from '../src/audio/semantic-contract'
import { UNIVERSES } from '../src/content/universes'
import { PRISMATA, PRISMATA_V2_PACK } from '../src/content/universes/prismata'
import { TEMPEST, TEMPEST_V2_PACK } from '../src/content/universes/tempest'
import { CANTICLE, CANTICLE_V2_PACK } from '../src/content/universes/canticle'
import {
  CANTICLE_MEASURES,
  advanceF4LawState,
  canticleStatus,
  configureTempestRoute,
  cycleCanticleSlot,
  dischargeTempest,
  prismataStatus,
  retainedF4LawConfiguration,
  routePrismataKindling,
  selectCanticleMeasure,
  selectPrismataRecipe,
  selectTempestPath,
  tempestStatus,
} from '../src/content/universes/f4-runtime'
import { validateUniversePackV2 } from '../src/render/manifest-validator'
import { validateUniversePresentation } from '../src/render/presentation-contract'
import { PRISMATA_PRESENTATION } from '../src/render/prismata/presentation'
import { TEMPEST_PRESENTATION } from '../src/render/tempest/presentation'
import { CANTICLE_PRESENTATION } from '../src/render/canticle/presentation'
import { amountFromNumber } from '../src/core/numeric/amount'

const PACKS = [
  ['u5', PRISMATA, PRISMATA_V2_PACK, PRISMATA_PRESENTATION],
  ['u6', TEMPEST, TEMPEST_V2_PACK, TEMPEST_PRESENTATION],
  ['u7', CANTICLE, CANTICLE_V2_PACK, CANTICLE_PRESENTATION],
] as const

test('F4 registers seven complete playable universe packs', () => {
  assert.deepEqual(UNIVERSES.map(({ id }) => id), ['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle'])
  for (const [prefix, legacy, v2, presentation] of PACKS) {
    assert.equal(legacy.generators.length, 18)
    assert.equal(v2.economy.generators.length, 18)
    assert.equal(v2.economy.doctrines.length, 4)
    assert.equal(v2.omens.length, 4)
    assert.equal(v2.archive.records.length, 12)
    assert.equal(v2.story.echoes.length, 10)
    assert.equal(v2.visual.objects.length, 35)
    assert.ok(v2.economy.generators.every(({ id }) => id.startsWith(`${prefix}-`)))
    assert.deepEqual(validateUniversePackV2(v2), { valid: true, issues: [] })
    assert.deepEqual(validateUniverseAudioDef(v2.audio), [])
    assert.deepEqual(validateUniversePresentation(v2, presentation), [])
    assert.ok(v2.economy.doctrines.every((doctrine) => doctrine.effects.length > 0))
    assert.ok(v2.omens.every((omen) => omen.rewards.every((reward) => reward.effects.length > 0)))
    assert.ok(v2.trials.every((trial) => trial.rewardEffects.length > 0))
  }
  assert.equal(new Set(PACKS.map(([, legacy]) => legacy.generators.map(({ baseCost }) => baseCost).join(','))).size, 3)
  assert.equal(new Set(PACKS.map(([, legacy]) => legacy.generators.map(({ baseRate }) => baseRate).join(','))).size, 3)
  assert.ok(PRISMATA.upgrades.some(({ id }) => id === 'u5-labeled-white'))
  assert.ok(TEMPEST.upgrades.some(({ id }) => id === 'u6-auroral-return'))
  assert.ok(CANTICLE.upgrades.some(({ id }) => id === 'u7-room-for-answer'))
  assert.equal(new Set(PACKS.map(([, legacy]) => legacy.lumen.find(({ id }) => id.endsWith('lumen-epoch'))?.text)).size, 3)
})

test('Prismata lens recipes reward different optical relationships', () => {
  const state = {}
  const balancedOwned = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [`u5-kindling-${String(index + 1).padStart(2, '0')}`, 10]))
  assert.equal(selectPrismataRecipe(state, 1), true)
  const synthesis = prismataStatus(state, balancedOwned)
  assert.equal(synthesis.activeBands, 6)
  assert.equal(synthesis.balance, 1)
  assert.ok(synthesis.multiplier > 2)

  assert.equal(selectPrismataRecipe(state, 0), true)
  const focusedOwned = { ...balancedOwned, 'u5-kindling-01': 500, 'u5-kindling-02': 500, 'u5-kindling-03': 500 }
  const coherence = prismataStatus(state, focusedOwned)
  assert.equal(coherence.recipe.id, 'coherence')
  assert.notEqual(coherence.multiplier, synthesis.multiplier)

  assert.equal(selectPrismataRecipe(state, 2), true)
  advanceF4LawState('prismata', state, balancedOwned, 400)
  assert.equal(prismataStatus(state, balancedOwned).fluorescence, 100)

  assert.equal(routePrismataKindling(state, 0, 5), true)
  const routed = prismataStatus(state, balancedOwned)
  assert.equal(routed.routes[0], 5)
  assert.equal(routed.bands[0], 20)
  assert.equal(routed.bands[5], 40)
})

test('Tempest accumulates bounded potential and discharges only through a ready selected path', () => {
  const state = {}
  const owned = { 'u6-kindling-01': 20, 'u6-kindling-06': 10 }
  assert.equal(selectTempestPath(state, 1), true)
  assert.equal(dischargeTempest(state), false)
  advanceF4LawState('tempest', state, owned, 120)
  const ready = tempestStatus(state)
  assert.equal(ready.path.id, 'supercell')
  assert.equal(ready.charge, 100)
  const defaultBoost = ready.boost
  assert.equal(configureTempestRoute(state, 8, 3), true)
  const risky = tempestStatus(state)
  assert.ok(risky.threshold > ready.threshold)
  assert.ok(risky.boost > defaultBoost)
  assert.equal(dischargeTempest(state), true)
  const active = tempestStatus(state)
  assert.equal(active.boostRemainingSec, active.durationSec)
  assert.equal(active.multiplier, active.boost)
  advanceF4LawState('tempest', state, owned, active.durationSec)
  assert.equal(tempestStatus(state).boostRemainingSec, 0)
})

test('Canticle measures expose strategic rests with deterministic silent equivalence', () => {
  const state = {}
  const owned = { 'u7-kindling-01': 50, 'u7-kindling-07': 50 }
  assert.equal(selectCanticleMeasure(state, 3), true)
  const rest = canticleStatus(state, owned, 0)
  assert.equal(rest.measure.id, 'silence')
  assert.equal(rest.role, 'rest')
  assert.ok(rest.multiplier > 1)
  assert.ok(CANTICLE_MEASURES.every((measure) => measure.slots.length === 16))
  assert.equal(cycleCanticleSlot(state, 0), true)
  const edited = canticleStatus(state, owned, 0)
  assert.equal(edited.slots[0], 'syncopation')
  assert.notEqual(edited.patternBonus, rest.patternBonus)
  assert.equal(CANTICLE_V2_PACK.physics.sequence?.silentModeEquivalent, true)
  assert.equal(CANTICLE_V2_PACK.accessibility.muted.fullGameplayEquivalent, true)
})

test('F4 Epoch turns retain authored configuration but discard live law energy', () => {
  const verdance = {
    'u3-kindling-01-cohort-age': amountFromNumber(100),
    'u3-graft-rootstock': amountFromNumber(0),
    'u3-graft-scion': amountFromNumber(8),
    'u3-graft-active': amountFromNumber(1),
  }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('verdance', verdance)).sort(), [
    'u3-graft-active', 'u3-graft-rootstock', 'u3-graft-scion',
  ])

  const prismata = { 'u5-recipe': amountFromNumber(2), 'u5-route-01': amountFromNumber(5), 'u5-fluorescence': amountFromNumber(90) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('prismata', prismata)).sort(), ['u5-recipe', 'u5-route-01'])

  const tempest = { 'u6-path': amountFromNumber(3), 'u6-path-length': amountFromNumber(8), 'u6-path-risk': amountFromNumber(3), 'u6-charge': amountFromNumber(100), 'u6-boost-seconds': amountFromNumber(20) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('tempest', tempest)).sort(), ['u6-path', 'u6-path-length', 'u6-path-risk'])

  const canticle = { 'u7-measure': amountFromNumber(1), 'u7-slot-01': amountFromNumber(4), 'u7-live-pulse': amountFromNumber(1) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('canticle', canticle)).sort(), ['u7-measure', 'u7-slot-01'])
})
