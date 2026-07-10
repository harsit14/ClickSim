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
  dischargeTempest,
  prismataStatus,
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
  }
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
  assert.equal(dischargeTempest(state), true)
  const active = tempestStatus(state)
  assert.equal(active.boostRemainingSec, active.path.durationSec)
  assert.equal(active.multiplier, active.path.boost)
  advanceF4LawState('tempest', state, owned, active.path.durationSec)
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
  assert.ok(CANTICLE_MEASURES.every((measure) => measure.slots.length === 8))
  assert.equal(CANTICLE_V2_PACK.physics.sequence?.silentModeEquivalent, true)
  assert.equal(CANTICLE_V2_PACK.accessibility.muted.fullGameplayEquivalent, true)
})
