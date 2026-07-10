import assert from 'node:assert/strict'
import test from 'node:test'
import {
  simulateTenClicksPerSecondWithOmen,
  validateUniverseAudioDef,
} from '../src/audio/semantic-contract'
import { TIDEFALL } from '../src/content/universes/tidefall'
import {
  TIDEFALL_V2_PACK,
  TIDEFALL_V2_SUPPLEMENT,
} from '../src/content/universes/tidefall-v2'
import { TIDEFALL_OMEN_RUNTIME_SPECS } from '../src/content/universes/tidefall/omens'
import { auditManifestRenderPlan, planManifestLayout } from '../src/render/manifest-layout'
import { validateUniversePackV2 } from '../src/render/manifest-validator'

test('Tidefall crosses the temporary bridge as one complete validated V2 pack', () => {
  assert.equal(TIDEFALL_V2_PACK.id, 'tidefall')
  assert.equal(TIDEFALL_V2_PACK.economy.generators.length, 18)
  assert.equal(TIDEFALL_V2_PACK.economy.doctrines.length, 4)
  assert.equal(TIDEFALL_V2_PACK.omens.length, 5)
  assert.equal(TIDEFALL_V2_PACK.archive.records.length, 12)
  assert.equal(TIDEFALL_V2_PACK.archive.shelves.length, 3)
  assert.equal(TIDEFALL_V2_PACK.story.echoes.length, 10)
  assert.equal(TIDEFALL_V2_PACK.visual.objects.length, 36)
  assert.deepEqual(validateUniversePackV2(TIDEFALL_V2_PACK), { valid: true, issues: [] })
  assert.deepEqual(validateUniverseAudioDef(TIDEFALL_V2_PACK.audio), [])
  const cueIds = new Set(TIDEFALL_V2_PACK.audio.cues.map(({ id }) => id))
  assert.ok(TIDEFALL_V2_PACK.visual.objects.every(({ audioCue }) => audioCue && cueIds.has(audioCue)))

  assert.deepEqual(
    TIDEFALL_V2_PACK.economy.generators.map(({ id, name }) => ({ id, name })),
    TIDEFALL.generators.map(({ id, name }) => ({ id, name })),
  )
  assert.deepEqual(
    TIDEFALL_V2_PACK.story.echoes.map(({ id }) => id),
    TIDEFALL.echoes.map(({ id }) => id),
  )
})

test('Tidefall V2 changes no legacy rate, power-up, or save-stable economy identity', () => {
  assert.strictEqual(TIDEFALL_V2_PACK.physics.rateMultiplier?.({} as never, 22_500), TIDEFALL.twist.rateMultiplier?.(22_500))
  assert.deepEqual(
    TIDEFALL_V2_PACK.economy.generators.map(({ id, baseCost, baseRate, costMult }) => ({ id, baseCost, baseRate, costMult })),
    TIDEFALL.generators.map(({ id, baseCost, baseRate, costMult }) => ({ id, baseCost, baseRate, costMult })),
  )
  assert.deepEqual(
    TIDEFALL_OMEN_RUNTIME_SPECS.slice(0, 4).map((omen) => ({
      id: omen.id,
      durationSec: omen.durationSec,
      productionMultiplier: omen.productionMultiplier,
      clickMultiplier: omen.clickMultiplier,
      storedRateSeconds: omen.storedRateSeconds,
      minimumAward: omen.minimumAward,
    })),
    TIDEFALL.events.powerUps.map((omen) => ({
      id: omen.id,
      durationSec: omen.durationSec,
      productionMultiplier: omen.prodMult,
      clickMultiplier: omen.clickMult,
      storedRateSeconds: omen.rateSeconds,
      minimumAward: omen.minAward,
    })),
  )
})

test('Tidefall semantic audio remains safe under the ten-click Omen stress fixture', () => {
  const report = simulateTenClicksPerSecondWithOmen(TIDEFALL_V2_PACK.audio)
  assert.equal(report.attempts, 11)
  assert.equal(report.played + report.suppressed, 11)
  assert.ok(report.maximumConcurrent <= 3)
  assert.equal(report.ceilingRespected, true)
})

test('real Tidefall manifests produce clean desktop plans at every ownership and fallback state', () => {
  const visibleObjectIds = TIDEFALL_V2_PACK.visual.objects.map(({ id }) => id)
  for (const count of [1, 10, 25, 50, 100]) {
    const ownershipBySourceId = Object.fromEntries(
      TIDEFALL_V2_PACK.economy.generators.map(({ id }) => [id, count]),
    )
    for (const preferences of [
      { reducedMotion: false, quality: 'high' as const, minimal: false, panelOpen: false },
      { reducedMotion: true, quality: 'balanced' as const, minimal: false, panelOpen: true },
      { reducedMotion: false, quality: 'low' as const, minimal: true, panelOpen: false },
    ]) {
      const plan = planManifestLayout({
        visual: TIDEFALL_V2_PACK.visual,
        heart: TIDEFALL_V2_PACK.heart,
        viewport: { width: 1280, height: 720 },
        state: { visibleObjectIds, ownershipBySourceId },
        preferences,
      })
      assert.deepEqual(plan.diagnostics, [])
      assert.deepEqual(auditManifestRenderPlan(plan), [])
      assert.ok(plan.objects.length > 0)
      assert.equal(plan.heart.focusLabel, 'Tideheart, Heart of Tidefall; surf Glow')
    }
  }
})

test('the supplement exposes four distinct doctrine visual signatures and full fallback equality', () => {
  assert.equal(new Set(TIDEFALL_V2_SUPPLEMENT.economy.doctrines.map(({ visualSignature }) => visualSignature)).size, 4)
  assert.equal(TIDEFALL_V2_PACK.accessibility.muted.fullGameplayEquivalent, true)
  assert.equal(TIDEFALL_V2_PACK.accessibility.reducedMotion.fullGameplayEquivalent, true)
  assert.equal(TIDEFALL_V2_PACK.accessibility.lowQuality.fullGameplayEquivalent, true)
  assert.deepEqual(TIDEFALL_V2_PACK.accessibility.timing.averagedRewardRatio, [0.85, 0.9])
})
