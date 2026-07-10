import assert from 'node:assert/strict'
import test from 'node:test'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave } from '../src/core/save-data'
import { serializeAmount } from '../src/core/numeric/amount'

test('rejects missing, future, and non-numeric save versions', () => {
  assert.equal(migrateAndSanitizeSave({}), null)
  assert.equal(migrateAndSanitizeSave({ version: '12' }), null)
  assert.equal(migrateAndSanitizeSave({ version: 14 }), null)
})

test('migrates a legacy v1 save through every version', () => {
  const migrated = migrateAndSanitizeSave({
    version: 1,
    savedAt: 100,
    light: 900,
    totalEarned: 1_000,
    clicks: 25,
    owned: { spark: 4 },
  })

  assert.ok(migrated)
  assert.equal(migrated.version, 13)
  assert.equal(migrated.activeUniverse, 'emberlight')
  assert.deepEqual(migrated.owned, { spark: 4 })
  assert.deepEqual(migrated.ui, ['counter', 'shop', 'upgrades', 'stats', 'options'])
  assert.deepEqual(migrated.vesselParts, [])
  assert.deepEqual(migrated.stardustWorks, {})
  assert.deepEqual(migrated.deepWorks, {})
  assert.equal(migrated.motionPreference, 'system')
  assert.equal(migrated.visualQuality, 'auto')
  assert.equal(migrated.beatVisual, 'subtle')
  assert.equal(migrated.textScale, 'normal')
  assert.equal(migrated.highContrast, false)
})

test('migrates v11 saves into persistent Phase 5 preferences', () => {
  const migrated = migrateAndSanitizeSave({
    version: 11,
    savedAt: 1_000,
    totalEarned: 10,
  })
  assert.ok(migrated)
  assert.equal(migrated.version, 13)
  assert.equal(migrated.motionPreference, 'system')
  assert.equal(migrated.visualQuality, 'auto')
  assert.equal(migrated.beatVisual, 'subtle')
  assert.equal(migrated.textScale, 'normal')
  assert.equal(migrated.highContrast, false)

  const preferences = migrateAndSanitizeSave({
    version: 12,
    motionPreference: 'reduced',
    visualQuality: 'low',
    beatVisual: 'strong',
    textScale: 'large',
    highContrast: true,
  })
  assert.ok(preferences)
  assert.equal(preferences.motionPreference, 'reduced')
  assert.equal(preferences.visualQuality, 'low')
  assert.equal(preferences.beatVisual, 'strong')
  assert.equal(preferences.textScale, 'large')
  assert.equal(preferences.highContrast, true)
})

test('sanitizes corrupt values and strips unknown content ids', () => {
  const clean = migrateAndSanitizeSave({
    version: 9,
    savedAt: Number.NaN,
    activeUniverse: 'not-a-universe',
    light: Number.POSITIVE_INFINITY,
    totalEarned: 100,
    owned: { spark: 2.9, wisp: -4, exploit: 999 },
    upgrades: ['ember-touch', 'unknown', 'ember-touch'],
    ui: ['counter', 'counter', 'admin'],
    sfxVolume: 9,
    musicVolume: -2,
    stardust: 10,
    stardustTotal: 5,
    singularities: 7,
    singTotal: 2,
    ending: 'impossible',
    theme: 'neon',
    vesselParts: {},
    wayfinder: ['safe-id', '../../bad', 'safe-id'],
    stardustWorks: { 'continuing-corona': 3.8, exploit: 99, 'parallax-engine': -4 },
    deepWorks: { 'worldseed-compression': 500, 'recursive-abyss': 2.9, exploit: 5 },
    motionPreference: 'maximum',
    visualQuality: 'cinema',
    beatVisual: 'danger',
    textScale: 'huge',
    highContrast: 'yes',
  })

  assert.ok(clean)
  assert.equal(clean.activeUniverse, 'emberlight')
  assert.equal(serializeAmount(clean.light), '0')
  assert.deepEqual(clean.owned, { spark: 2 })
  assert.deepEqual(clean.upgrades, ['ember-touch'])
  assert.deepEqual(clean.ui, ['counter'])
  assert.equal(clean.sfxVolume, 1)
  assert.equal(clean.musicVolume, 0)
  assert.equal(serializeAmount(clean.stardust), '5e0')
  assert.equal(serializeAmount(clean.singularities), '2e0')
  assert.equal(clean.ending, null)
  assert.equal(clean.theme, 'ember')
  assert.deepEqual(clean.vesselParts, [])
  assert.deepEqual(clean.wayfinder, ['safe-id'])
  assert.deepEqual(clean.stardustWorks, { 'continuing-corona': 3 })
  assert.deepEqual(clean.deepWorks, { 'worldseed-compression': 100, 'recursive-abyss': 2 })
  assert.equal(clean.motionPreference, 'system')
  assert.equal(clean.visualQuality, 'auto')
  assert.equal(clean.beatVisual, 'subtle')
  assert.equal(clean.textScale, 'normal')
  assert.equal(clean.highContrast, false)
})

test('sanitizes the challenge return snapshot independently', () => {
  const clean = migrateAndSanitizeSave({
    version: 9,
    totalEarned: 1_000,
    challenge: 'silence',
    challengeReturn: {
      light: 500,
      totalEarned: 400,
      owned: { spark: 3, fake: 99 },
      upgrades: ['ember-touch', 'fake'],
      buyAmount: 100,
    },
  })

  assert.ok(clean?.challengeReturn)
  assert.equal(serializeAmount(clean.challengeReturn.light), '4e2')
  assert.deepEqual(clean.challengeReturn.owned, { spark: 3 })
  assert.deepEqual(clean.challengeReturn.upgrades, ['ember-touch'])
  assert.equal(clean.challengeReturn.buyAmount, 100)
})

test('sanitizes parked universe runs against their own content packs', () => {
  const clean = migrateAndSanitizeSave({
    version: 10,
    activeUniverse: 'emberlight',
    universeRuns: {
      tidefall: {
        light: 900,
        totalEarned: 1_000,
        owned: { spark: 4, exploit: 99 },
        upgrades: ['undertow-touch', 'ember-touch'],
        seen: ['tide-arrival', 'awake'],
        echoes: ['tide-moon-ledger', 'first-fire'],
        buyAmount: 10,
        stardustWorks: { 'continuing-corona': 2, exploit: 7 },
        deepWorks: { 'recursive-abyss': 1, exploit: 7 },
      },
      fake: { light: 1e99, totalEarned: 1e99 },
    },
  })

  assert.ok(clean)
  assert.deepEqual(clean.universeRuns.tidefall.owned, { spark: 4 })
  assert.deepEqual(clean.universeRuns.tidefall.upgrades, ['undertow-touch'])
  assert.deepEqual(clean.universeRuns.tidefall.seen, ['tide-arrival'])
  assert.deepEqual(clean.universeRuns.tidefall.echoes, ['tide-moon-ledger'])
  assert.deepEqual(clean.universeRuns.tidefall.stardustWorks, { 'continuing-corona': 2 })
  assert.deepEqual(clean.universeRuns.tidefall.deepWorks, { 'recursive-abyss': 1 })
  assert.equal(clean.universeRuns.fake, undefined)
})

test('dev endgame scenario is deterministic and valid', () => {
  const scenario = createDevScenario('endgame', 10_000)
  assert.ok(scenario)
  assert.equal(scenario.savedAt, 10_000)
  assert.equal(serializeAmount(scenario.light), '1e40')
  assert.equal(Object.keys(scenario.owned).length, 18)
  assert.equal(scenario.curiosities.length, 12)
  assert.equal(scenario.autoKindler, true)
  assert.deepEqual(scenario.singUpgrades, ['deep-resonance'])
})

test('question scenario exposes the finale without changing endgame fixtures', () => {
  const endgame = createDevScenario('endgame', 10_000)
  const question = createDevScenario('question', 10_000)
  assert.ok(endgame && question)
  assert.equal(endgame.seen.includes('act3-hook'), false)
  assert.equal(question.seen.includes('act3-hook'), true)
  assert.equal(serializeAmount(question.light), '1e21')
})

test('crossing and Tidefall scenarios expose the multiverse layer safely', () => {
  const crossing = createDevScenario('crossing', 10_000)
  const tidefall = createDevScenario('tidefall', 10_000)
  assert.ok(crossing && tidefall)
  assert.equal(crossing.vesselParts.length, 5)
  assert.equal(crossing.ending, 'warden')
  assert.equal(tidefall.activeUniverse, 'tidefall')
  assert.deepEqual(tidefall.beacons, ['emberlight'])
  assert.equal(tidefall.owned.spark, 60)
  assert.deepEqual(tidefall.echoes, ['tide-moon-ledger'])
})

test('Verdance and Clockwork scenarios preserve their local content', () => {
  const verdance = createDevScenario('verdance', 10_000)
  const clockwork = createDevScenario('clockwork', 10_000)
  assert.ok(verdance)
  assert.ok(clockwork)
  assert.equal(verdance.activeUniverse, 'verdance')
  assert.equal(clockwork.activeUniverse, 'clockwork')
  assert.ok(Object.keys(verdance.owned).every((id) => id.startsWith('u3-')))
  assert.ok(Object.keys(clockwork.owned).every((id) => id.startsWith('u4-')))
  assert.ok(verdance.curiosities.length >= 3)
  assert.ok(clockwork.curiosities.length >= 3)
})

test('markets scenario exposes both completed repeatable economies', () => {
  const markets = createDevScenario('markets', 10_000)
  assert.ok(markets)
  assert.equal(markets.constellation.length, 13)
  assert.equal(markets.singUpgrades.length, 6)
  assert.deepEqual(markets.stardustWorks, { 'continuing-corona': 3, 'parallax-engine': 2 })
  assert.deepEqual(markets.deepWorks, { 'worldseed-compression': 2, 'recursive-abyss': 1 })
})
