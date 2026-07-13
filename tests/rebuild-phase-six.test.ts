import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { progressionIdentity } from '../src/content/universe-progression'
import { universeById, V2_UNIVERSE_BY_ID } from '../src/content/universes'
import { runCurrentPackAudit } from '../balance/current-pack-audit'
import { SIMULATOR_PROFILES } from '../balance/simulator-contract'

const CHAMBER_IDS = ['verdance', 'prismata', 'tempest', 'canticle'] as const

test('Phase 6.2 gives every chamber world a ten-line authored Lumen arc', () => {
  const expectedEpochLanguage = {
    verdance: /Pruning.*(?:cut|memory|seed)/i,
    prismata: /Recomposition.*Folio/i,
    tempest: /Renewal.*Return/i,
    canticle: /Release.*Trace/i,
  }
  const allTexts: string[] = []

  for (const universeId of CHAMBER_IDS) {
    const lines = universeById(universeId).lumen
    assert.equal(lines.length, 10, `${universeId} Lumen count drifted`)
    assert.equal(new Set(lines.map(({ id }) => id)).size, 10)
    assert.equal(new Set(lines.map(({ text }) => text)).size, 10)
    assert.ok(lines.every(({ text }) => text.length >= 50 && /[.!?]$/.test(text)))
    const epochLine = lines.find(({ id }) => id.includes('pruning') || id.endsWith('lumen-epoch'))
    assert.ok(epochLine)
    assert.match(epochLine.text, expectedEpochLanguage[universeId])
    allTexts.push(...lines.map(({ text }) => text))
  }

  assert.equal(new Set(allTexts).size, allTexts.length)
  assert.ok(allTexts.every((text) => !/ended the current form/i.test(text)))
})

test('each chamber Epoch decision uses native ceremony prose instead of shared scaffolding', () => {
  const decisions = CHAMBER_IDS.map((universeId) => progressionIdentity(universeId).observatory)
  for (const field of ['firstText', 'needsText', 'readyText', 'warningText', 'goText'] as const) {
    assert.equal(new Set(decisions.map((identity) => identity[field])).size, CHAMBER_IDS.length, `${field} was templated`)
  }
  const futureCopySource = readFileSync(new URL('../src/content/universe-progression.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(futureCopySource, /When this world has gathered enough/)
  assert.doesNotMatch(futureCopySource, /is ready\. Inspect the boundary before committing/)
  assert.deepEqual(decisions.map(({ goText }) => goText), [
    'Open the canopy',
    'Recompose the folio',
    'Complete the return',
    'Release this cycle',
  ])
})

test('Pruning, Recomposition, Renewal, and Release have distinct semantic cadences', () => {
  const expectedCadence = {
    verdance: /pruning/i,
    prismata: /folio-close.*open final interval/i,
    tempest: /returning current.*quiet/i,
    canticle: /silence.*return/i,
  }
  const families = CHAMBER_IDS.map((universeId) => {
    const audio = V2_UNIVERSE_BY_ID.get(universeId)!.audio
    const cue = audio.cues.find(({ id }) => id === audio.prestigeCadenceCue)
    assert.ok(cue)
    assert.equal(cue.priority, 'ceremony')
    assert.equal(cue.mutedFallback, 'visual-and-caption')
    assert.match(cue.family, expectedCadence[universeId])
    return cue.family
  })
  assert.equal(new Set(families).size, CHAMBER_IDS.length)
})

test('Phase 6.4 gives every chamber doctrine, trial, and Omen reward a strategic effect', () => {
  const fingerprints: string[] = []
  for (const universeId of CHAMBER_IDS) {
    const pack = V2_UNIVERSE_BY_ID.get(universeId)!
    const localGeneratorIds = new Set(pack.economy.generators.map(({ id }) => id))
    const groups = [
      ...pack.economy.doctrines.map(({ id, effects }) => ({ id, effects })),
      ...pack.trials.map(({ id, rewardEffects }) => ({ id, effects: rewardEffects })),
      ...pack.omens.flatMap(({ rewards }) => rewards.map(({ id, effects }) => ({ id, effects }))),
    ]
    assert.ok(groups.length >= 12, `${universeId} strategic surface is incomplete`)
    for (const group of groups) {
      assert.ok(group.effects.length > 0, `${universeId}/${group.id} still has effects: []`)
      for (const effect of group.effects) {
        assert.ok(Number.isFinite(effect.value) && effect.value > 0, `${universeId}/${group.id} has an invalid value`)
        if (effect.kind === 'genMult') assert.ok(localGeneratorIds.has(effect.gen), `${group.id} targets a foreign Kindling`)
        if (effect.kind === 'synergy') {
          assert.ok(localGeneratorIds.has(effect.gen), `${group.id} targets a foreign resonance receiver`)
          assert.ok(localGeneratorIds.has(effect.per), `${group.id} targets a foreign resonance source`)
        }
      }
    }
    fingerprints.push(pack.economy.doctrines.map(({ effects }) => effects.map(({ kind }) => kind).sort().join('+')).join('|'))
  }
  assert.equal(new Set(fingerprints).size, CHAMBER_IDS.length, 'chamber doctrine strategies became interchangeable')
})

test('Phase 6.5 gives every chamber its own 3–6 hour competent Beacon curve', () => {
  const competent = SIMULATOR_PROFILES.find(({ id }) => id === 'competent-universe-mechanic')!
  const costCurves = CHAMBER_IDS.map((universeId) => (
    universeById(universeId).generators.map(({ baseCost }) => baseCost).join(',')
  ))
  assert.equal(new Set(costCurves).size, CHAMBER_IDS.length, 'chamber worlds share one base-cost ladder')

  const beaconHours = CHAMBER_IDS.map((universeId) => {
    const result = runCurrentPackAudit(universeId, competent, 6.1)
    assert.notEqual(result.firstBeaconAtMs, null, `${universeId} missed its six-hour Beacon window`)
    assert.ok(result.longestPreEpochPurchaseGapMs <= 10 * 60_000, `${universeId} has a pre-Epoch wall over ten minutes`)
    return result.firstBeaconAtMs! / 3_600_000
  })
  beaconHours.forEach((hours, index) => {
    assert.ok(hours >= 3 && hours <= 6, `${CHAMBER_IDS[index]} reached its Beacon in ${hours.toFixed(2)}h`)
  })
  assert.deepEqual(beaconHours, [4.5, 3.8, 5.083333333333333, 5.55])
})
