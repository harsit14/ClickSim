import assert from 'node:assert/strict'
import test from 'node:test'
import {
  simulateTenClicksPerSecondWithOmen,
  validateUniverseAudioDef,
} from '../src/audio/semantic-contract'
import {
  CLOCKWORK,
  CLOCKWORK_V2_PACK,
} from '../src/content/universes/clockwork/index'
import { CLOCKWORK_PATENT_ITEMS } from '../src/content/universes/clockwork/archive'
import { CLOCKWORK_MAINTENANCE_SIGNALS } from '../src/content/universes/clockwork/maintenance'
import { validateUniversePackV2 } from '../src/render/manifest-validator'
import {
  CLOCKWORK_PATENT_MARKS,
  CLOCKWORK_PATENT_MARK_BY_ID,
} from '../src/render/clockwork/patent-marks'

test('Clockwork exports complete legacy and direct V2 packs with matching stable economy IDs', () => {
  assert.equal(CLOCKWORK.id, 'clockwork')
  assert.equal(CLOCKWORK_V2_PACK.id, 'clockwork')
  assert.equal(CLOCKWORK.generators.length, 18)
  assert.equal(CLOCKWORK_V2_PACK.economy.generators.length, 18)
  assert.deepEqual(
    CLOCKWORK_V2_PACK.economy.generators.map(({ id, name, baseCost, baseRate, costMult }) => ({ id, name, baseCost, baseRate, costMult })),
    CLOCKWORK.generators.map(({ id, name, baseCost, baseRate, costMult }) => ({ id, name, baseCost, baseRate, costMult })),
  )
  assert.deepEqual(validateUniversePackV2(CLOCKWORK_V2_PACK), { valid: true, issues: [] })
  assert.deepEqual(validateUniverseAudioDef(CLOCKWORK_V2_PACK.audio), [])
})

test('Clockwork preserves every frozen identity and reset noun', () => {
  assert.equal(CLOCKWORK.currency, 'Ticks')
  assert.equal(CLOCKWORK.centralObject, 'Escapement Heart')
  assert.equal(CLOCKWORK.cabinet.title, 'Patent Ledger')
  assert.equal(CLOCKWORK_V2_PACK.identity.primaryVerb, 'route')
  assert.equal(CLOCKWORK_V2_PACK.heart.localName, 'Escapement Heart')
  assert.equal(CLOCKWORK_V2_PACK.economy.currency.localName, 'Ticks')
  assert.equal(CLOCKWORK_V2_PACK.economy.localPrestige.localName, 'Rewinding')
  assert.equal(CLOCKWORK_V2_PACK.economy.localPrestige.rewardCurrency.localName, 'Mainsprings')
  assert.equal(CLOCKWORK_V2_PACK.archive.localName, 'Patent Ledger')
})

test('all new Clockwork save-stable content IDs remain pack-local', () => {
  const ids = [
    ...CLOCKWORK.generators.map(({ id }) => id),
    ...CLOCKWORK.upgrades.map(({ id }) => id),
    ...CLOCKWORK_PATENT_ITEMS.map(({ id }) => id),
    ...CLOCKWORK.echoes.map(({ id }) => id),
    ...CLOCKWORK_V2_PACK.trials.map(({ id }) => id),
    ...CLOCKWORK_V2_PACK.story.scenes.map(({ id }) => id),
  ]
  assert.ok(ids.every((id) => id.startsWith('u4-')))
  assert.equal(new Set(ids).size, ids.length)
})

test('Clockwork forbids random economics and declares four scheduled Maintenance Signals', () => {
  assert.equal(CLOCKWORK.twist.randomnessAllowed, false)
  assert.equal(CLOCKWORK_V2_PACK.physics.randomAllowed, false)
  assert.equal(CLOCKWORK_MAINTENANCE_SIGNALS.length, 4)
  assert.equal(CLOCKWORK_V2_PACK.omens.length, 4)
  for (const omen of CLOCKWORK_V2_PACK.omens) {
    assert.equal(omen.spawn.mode, 'scheduled')
    assert.ok((omen.spawn.scheduleMs ?? 0) > 0)
    assert.equal(omen.spawn.baseChance, undefined)
    assert.equal(omen.spawn.pityThreshold, undefined)
  }
  assert.ok(CLOCKWORK.upgrades.flatMap(({ effects }) => effects).every(({ kind }) => kind !== 'critChance' && kind !== 'critMult'))
})

test('Clockwork V2 carries four doctrines, twelve patents, ten Echoes, Deep trials, scenes, and Beacon', () => {
  assert.deepEqual(CLOCKWORK_V2_PACK.economy.doctrines.map(({ name }) => name), [
    'Power Train', 'Distributed Works', 'Precision Train', 'Forecast Engine',
  ])
  assert.equal(new Set(CLOCKWORK_V2_PACK.economy.doctrines.map(({ visualSignature }) => visualSignature)).size, 4)
  assert.equal(CLOCKWORK_V2_PACK.archive.records.length, 12)
  assert.deepEqual(CLOCKWORK_V2_PACK.archive.shelves.map(({ name }) => name), ['Transmission', 'Prediction', 'Exception'])
  assert.equal(CLOCKWORK_V2_PACK.story.echoes.length, 10)
  assert.equal(CLOCKWORK_V2_PACK.trials.length, 12)
  assert.ok(['arrival', 'epoch', 'deep', 'beacon'].every((kind) => CLOCKWORK_V2_PACK.story.scenes.some((scene) => scene.kind === kind)))
  assert.equal(CLOCKWORK_V2_PACK.beacon.requirement.sourceId, 'u4-great-regulator')
  assert.equal(CLOCKWORK_V2_PACK.beacon.requirement.target, 1)
})

test('all twelve Patent Ledger resonances have distinct Clockwork-native diagram marks', () => {
  assert.equal(CLOCKWORK_PATENT_MARKS.length, 12)
  assert.deepEqual(
    CLOCKWORK_PATENT_MARKS.map(({ id }) => id),
    CLOCKWORK_PATENT_ITEMS.map(({ id }) => id),
  )
  assert.equal(CLOCKWORK_PATENT_MARK_BY_ID.size, 12)
  assert.equal(new Set(CLOCKWORK_PATENT_MARKS.map(({ diagramPath }) => diagramPath)).size, 12)
  assert.deepEqual(
    Object.fromEntries(['transmission', 'prediction', 'exception'].map((family) => [
      family,
      CLOCKWORK_PATENT_MARKS.filter((mark) => mark.family === family).length,
    ])),
    { transmission: 4, prediction: 4, exception: 4 },
  )
  assert.ok(CLOCKWORK_PATENT_MARKS.every(({ label, diagramPath, accentPath }) => (
    label.length > 12 && diagramPath.length > 20 && accentPath.length > 8
  )))
})

test('Clockwork semantic audio covers every object and respects stress ceilings', () => {
  const cueIds = new Set(CLOCKWORK_V2_PACK.audio.cues.map(({ id }) => id))
  assert.ok(CLOCKWORK_V2_PACK.visual.objects.every(({ audioCue }) => audioCue && cueIds.has(audioCue)))
  const report = simulateTenClicksPerSecondWithOmen(CLOCKWORK_V2_PACK.audio)
  assert.equal(report.attempts, 11)
  assert.equal(report.played + report.suppressed, 11)
  assert.ok(report.maximumConcurrent <= 3)
  assert.equal(report.ceilingRespected, true)
  assert.equal(CLOCKWORK_V2_PACK.audio.tempoBpm, 90)
})

test('muted, reduced-motion, low-quality, and non-color paths preserve complete gameplay', () => {
  const accessibility = CLOCKWORK_V2_PACK.accessibility
  assert.equal(accessibility.muted.fullGameplayEquivalent, true)
  assert.equal(accessibility.reducedMotion.fullGameplayEquivalent, true)
  assert.equal(accessibility.reducedMotion.timingInformationPreserved, true)
  assert.equal(accessibility.lowQuality.fullGameplayEquivalent, true)
  assert.equal(accessibility.lowQuality.preservesHitTargets, true)
  assert.equal(accessibility.lowQuality.preservesStateLabels, true)
  assert.deepEqual(accessibility.timing.averagedRewardRatio, [0.85, 0.9])
  assert.ok(accessibility.nonColorSignals.some(({ stateId }) => stateId === 'u4-route-power'))
  assert.ok(accessibility.nonColorSignals.some(({ stateId }) => stateId === 'u4-route-overload'))
  assert.ok(accessibility.nonColorSignals.some(({ stateId }) => stateId === 'u4-signal-forecast'))
})
