import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { V2_UNIVERSE_BY_ID, type UniverseId } from '../src/content/universes'
import { buildEnglishCatalog } from '../src/localization/catalog'
import {
  auditAccessibilityContracts,
  auditObjectPurpose,
  simulateAudioFatigueSession,
} from '../src/release/audits'
import {
  auditManifestRenderPlan,
  planManifestLayout,
} from '../src/render/manifest-layout'
import {
  migrateAndSanitizeSave,
  migrateAndSanitizeSaveV13,
  serializeSaveDataV13,
  serializeSaveDataV22,
} from '../src/core/save-data'
import {
  DEFAULT_SIMULATOR_CONTRACT_CONFIG,
  createSimulatorCases,
} from '../balance/simulator-contract'
import { simulateProfileCase } from '../balance/profile-simulator'

const universes: readonly UniverseId[] = [
  'emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle',
]

test('final object-purpose audit covers every Heart, Kindling, Archive object, and Beacon', () => {
  assert.deepEqual(auditObjectPurpose(), [])
})

test('all seven universes preserve muted, reduced-motion, low-quality, and non-color gameplay', () => {
  assert.deepEqual(auditAccessibilityContracts(), [])
})

test('desktop release viewport matrix stays deterministic, bounded, and Heart-clear', () => {
  const viewports = [
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
  ]
  const profiles = [
    { reducedMotion: false, quality: 'high' as const, minimal: false, panelOpen: false },
    { reducedMotion: false, quality: 'balanced' as const, minimal: false, panelOpen: true },
    { reducedMotion: true, quality: 'low' as const, minimal: true, panelOpen: false },
  ]
  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    for (const viewport of viewports) {
      for (const preferences of profiles) {
        const ownershipBySourceId = Object.fromEntries(pack.visual.objects.map((object) => [object.sourceId, 100]))
        const input = {
          visual: pack.visual,
          heart: pack.heart,
          viewport,
          state: { visibleObjectIds: pack.visual.objects.map((object) => object.id), ownershipBySourceId },
          preferences,
        }
        const first = planManifestLayout(input)
        const second = planManifestLayout(input)
        assert.deepEqual(first, second, `${universeId} must be deterministic at ${viewport.width}×${viewport.height}`)
        assert.deepEqual(auditManifestRenderPlan(first), [], `${universeId} layout failed at ${viewport.width}×${viewport.height}`)
      }
    }
  }
})

test('thirty-minute abstract fatigue sessions remain under peak and concurrency limits', () => {
  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    const summary = simulateAudioFatigueSession(universeId, pack.audio)
    assert.deepEqual(summary.issues, [])
    assert.equal(summary.attempts, 9_000)
    assert.ok(summary.played > 0)
    assert.ok(summary.suppressed > 0 || summary.maximumAttenuationDb < 0)
  }
})

test('five-hour, fifty-hour, and returning-player simulations remain numeric and actionable', () => {
  for (const horizonMs of [5 * 60 * 60_000, 50 * 60 * 60_000]) {
    const config = { ...DEFAULT_SIMULATOR_CONTRACT_CONFIG, horizonMs }
    const cases = createSimulatorCases(config).filter((simulationCase) => (
      simulationCase.progression.visit === 'beacon-accelerated-revisit'
      || simulationCase.progression.visit === 'first-visit' && simulationCase.progression.archive === 'no-archive'
    ))
    for (const simulationCase of cases) {
      const result = simulateProfileCase(simulationCase)
      assert.equal(result.numericHealth.passed, true, simulationCase.id)
      assert.equal(result.numericHealth.stalledComparison, false, simulationCase.id)
      assert.ok(result.purchaseGaps.purchaseCount > 0, simulationCase.id)
    }
  }
})

test('complete historical fixture ladder migrates to v22 and canonicalizes idempotently', () => {
  for (let version = 1; version <= 12; version++) {
    const migrated = migrateAndSanitizeSave({ version, savedAt: version, light: 0, totalEarned: 0 })
    assert.ok(migrated, `version ${version} should migrate`)
    assert.equal(migrated.version, 22)
    const wire = serializeSaveDataV22(migrated)
    assert.deepEqual(serializeSaveDataV22(migrateAndSanitizeSave(wire)!), wire)
  }
  const numeric = migrateAndSanitizeSaveV13({ version: 12, savedAt: 13, light: 1, totalEarned: 2 })!
  const numericWire = serializeSaveDataV13(numeric)
  const current = migrateAndSanitizeSave(numericWire)
  assert.ok(current)
  assert.equal(current.version, 22)
  assert.deepEqual(current.endgame.atlasCompletions, [])
})

test('crash drill skips corrupt primary data and accepts the newest valid historical backup', () => {
  const valid = serializeSaveDataV13(migrateAndSanitizeSaveV13({ version: 12, savedAt: 5_000, totalEarned: 10 })!)
  const candidates: unknown[] = [
    { ...valid, totalEarned: 'not-an-amount' },
    { version: 999, totalEarned: '1e1' },
    valid,
  ]
  const recovered = candidates.map((candidate) => migrateAndSanitizeSave(candidate)).find(Boolean)
  assert.ok(recovered)
  assert.equal(recovered.savedAt, 5_000)
  assert.equal(recovered.version, 22)
})

test('translation catalog covers release content with stable unique keys', () => {
  const catalog = buildEnglishCatalog()
  assert.ok(Object.keys(catalog).length >= 2_300)
  assert.equal(Object.keys(catalog).length, new Set(Object.keys(catalog)).size)
  for (const universeId of universes) {
    assert.ok(catalog[`universe.${universeId}.name`])
    assert.ok(catalog[`universe.${universeId}.question`])
  }
  assert.equal(catalog['shell.atlas-title'], 'Atlas of Possible Worlds')
  assert.ok(catalog['garden.closure.continue.consequence'])
})

test('Legacy hub compiles without accessibility warnings and exposes focus/contrast states', () => {
  const path = new URL('../src/ui/EndgameHub.svelte', import.meta.url)
  const source = readFileSync(path, 'utf8')
  const result = compile(source, { filename: path.pathname, generate: 'client' })
  assert.deepEqual(result.warnings, [])
  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-live="polite"/)
  assert.match(source, /focus-visible/)
  const appCss = readFileSync(new URL('../src/app.css', import.meta.url), 'utf8')
  assert.match(appCss, /data-contrast=['"]high['"]/)
})
