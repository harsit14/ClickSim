import assert from 'node:assert/strict'
import test from 'node:test'
import { validateUniverseAudioDef } from '../src/audio/semantic-contract'
import { UNIVERSES } from '../src/content/universes'
import { BRAHMALOK, BRAHMALOK_V2_PACK } from '../src/content/universes/brahmalok'
import { VISHNULOK, VISHNULOK_V2_PACK } from '../src/content/universes/vishnulok'
import { KAILASH, KAILASH_V2_PACK } from '../src/content/universes/kailash'
import {
  KAILASH_CYCLES,
  advanceF4LawState,
  brahmalokStatus,
  kailashStatus,
  configureVishnulokCircuit,
  cycleKailashAct,
  completeVishnulokReturn,
  brahmalokStatus,
  routeBrahmalokKindling,
  retainedF4LawConfiguration,
  routeBrahmalokKindling,
  selectKailashCycle,
  selectBrahmalokMode,
  selectBrahmalokMode,
  selectVishnulokCircuit,
  vishnulokCircuitStatus,
} from '../src/content/universes/f4-runtime'
import { validateUniversePackV2 } from '../src/render/manifest-validator'
import { validateUniversePresentation } from '../src/render/presentation-contract'
import { BRAHMALOK_PRESENTATION } from '../src/render/brahmalok/presentation'
import { VISHNULOK_PRESENTATION } from '../src/render/vishnulok/presentation'
import { KAILASH_PRESENTATION } from '../src/render/kailash/presentation'
import { amountFromNumber } from '../src/core/numeric/amount'

const PACKS = [
  ['brahmalok', BRAHMALOK, BRAHMALOK_V2_PACK, BRAHMALOK_PRESENTATION],
  ['vishnulok', VISHNULOK, VISHNULOK_V2_PACK, VISHNULOK_PRESENTATION],
  ['kailash', KAILASH, KAILASH_V2_PACK, KAILASH_PRESENTATION],
] as const

test('F4 registers seven complete playable universe packs', () => {
  assert.deepEqual(UNIVERSES.map(({ id }) => id), ['emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash'])
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
  assert.ok(BRAHMALOK.upgrades.some(({ id }) => id === 'brahmalok-labeled-white'))
  assert.ok(VISHNULOK.upgrades.some(({ id }) => id === 'vishnulok-auroral-return'))
  assert.ok(KAILASH.upgrades.some(({ id }) => id === 'kailash-room-for-answer'))
  assert.equal(new Set(PACKS.map(([, legacy]) => legacy.lumen.find(({ id }) => id.endsWith('lumen-epoch'))?.text)).size, 3)
})

test('Brahmalok creation modes reward different four-direction relationships', () => {
  const state = {}
  const balancedOwned = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [`brahmalok-kindling-${String(index + 1).padStart(2, '0')}`, 10]))
  assert.equal(selectBrahmalokMode(state, 1), true)
  const mandala = brahmalokStatus(state, balancedOwned)
  assert.equal(mandala.activeDirections, 4)
  assert.equal(mandala.balance, 0.8)
  assert.ok(mandala.multiplier > 2)

  assert.equal(selectBrahmalokMode(state, 0), true)
  const focusedOwned = { ...balancedOwned, 'brahmalok-kindling-01': 500, 'brahmalok-kindling-05': 500, 'brahmalok-kindling-09': 500 }
  const germination = brahmalokStatus(state, focusedOwned)
  assert.equal(germination.mode.id, 'germination')
  assert.notEqual(germination.multiplier, mandala.multiplier)

  assert.equal(selectBrahmalokMode(state, 2), true)
  advanceF4LawState('brahmalok', state, balancedOwned, 400)
  assert.equal(brahmalokStatus(state, balancedOwned).manuscriptMemory, 100)

  assert.equal(routeBrahmalokKindling(state, 0, 3), true)
  assert.equal(routeBrahmalokKindling(state, 0, 4), false)
  const routed = brahmalokStatus(state, balancedOwned)
  assert.equal(routed.routes[0], 3)
  assert.equal(routed.directions[0], 40)
  assert.equal(routed.directions[3], 50)
})

test('Vishnulok gathers bounded continuity and returns only through a ready circuit', () => {
  const state = {}
  const owned = { 'vishnulok-kindling-01': 20, 'vishnulok-kindling-06': 10 }
  assert.equal(selectVishnulokCircuit(state, 1), true)
  assert.equal(completeVishnulokReturn(state), false)
  advanceF4LawState('vishnulok', state, owned, 120)
  const ready = vishnulokCircuitStatus(state)
  assert.equal(ready.circuit.id, 'refuge-circuit')
  assert.equal(ready.continuity, 100)
  const defaultBoost = ready.boost
  assert.equal(configureVishnulokCircuit(state, 8, 3), true)
  const risky = vishnulokCircuitStatus(state)
  assert.ok(risky.threshold > ready.threshold)
  assert.ok(risky.boost > defaultBoost)
  assert.equal(completeVishnulokReturn(state), true)
  const active = vishnulokCircuitStatus(state)
  assert.equal(active.returnRemainingSec, active.durationSec)
  assert.equal(active.multiplier, active.boost)
  advanceF4LawState('vishnulok', state, owned, active.durationSec)
  assert.equal(vishnulokCircuitStatus(state).returnRemainingSec, 0)
})

test('Kailash cycles expose five acts, strategic rests, and deterministic silent equivalence', () => {
  const state = {}
  const owned = { 'kailash-kindling-01': 50, 'kailash-kindling-07': 50 }
  assert.equal(selectKailashCycle(state, 3), true)
  const rest = kailashStatus(state, owned, 0)
  assert.equal(rest.cycle.id, 'open-ring')
  assert.equal(rest.role, 'rest')
  assert.ok(rest.multiplier > 1)
  assert.ok(KAILASH_CYCLES.every((measure) => measure.slots.length === 16))
  assert.equal(cycleKailashAct(state, 0), true)
  const edited = kailashStatus(state, owned, 0)
  assert.equal(edited.slots[0], 'veil')
  assert.notEqual(edited.patternBonus, rest.patternBonus)
  assert.equal(KAILASH_V2_PACK.physics.sequence?.silentModeEquivalent, true)
  assert.equal(KAILASH_V2_PACK.accessibility.muted.fullGameplayEquivalent, true)
})

test('F4 Epoch turns retain authored configuration but discard live law energy', () => {
  const verdance = {
    'verdance-kindling-01-cohort-age': amountFromNumber(100),
    'verdance-graft-rootstock': amountFromNumber(0),
    'verdance-graft-scion': amountFromNumber(8),
    'verdance-graft-active': amountFromNumber(1),
  }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('verdance', verdance)).sort(), [
    'verdance-graft-active', 'verdance-graft-rootstock', 'verdance-graft-scion',
  ])

  const brahmalok = { 'brahmalok-mode': amountFromNumber(2), 'brahmalok-route-01': amountFromNumber(5), 'brahmalok-manuscript-memory': amountFromNumber(90) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('brahmalok', brahmalok)).sort(), ['brahmalok-mode', 'brahmalok-route-01'])

  const vishnulok = { 'vishnulok-circuit': amountFromNumber(3), 'vishnulok-shelter-count': amountFromNumber(8), 'vishnulok-burden': amountFromNumber(3), 'vishnulok-continuity': amountFromNumber(100), 'vishnulok-return-seconds': amountFromNumber(20) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('vishnulok', vishnulok)).sort(), ['vishnulok-burden', 'vishnulok-circuit', 'vishnulok-shelter-count'])

  const kailash = { 'kailash-cycle': amountFromNumber(1), 'kailash-slot-01': amountFromNumber(4), 'kailash-live-pulse': amountFromNumber(1) }
  assert.deepEqual(Object.keys(retainedF4LawConfiguration('kailash', kailash)).sort(), ['kailash-cycle', 'kailash-slot-01'])
})
