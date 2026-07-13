import assert from 'node:assert/strict'
import test from 'node:test'
import { ACHIEVEMENTS, achievementDisplay } from '../src/content/achievements'
import { THEMES, themeVarsForUniverse } from '../src/content/themes'
import { tidefallRateMultiplier } from '../src/content/universes/tidefall'
import { universeById } from '../src/content/universes'
import {
  wayfinderNodeAvailable,
  wayfinderProductionMult,
  wayfinderStartingKindlings,
  wayfinderTideAmplitude,
  WAYFINDER_NODES,
} from '../src/content/wayfinder'
import { totalRate, universeRateMult, type EcoState } from '../src/engine/compute'
import {
  beatDurationSec,
  MUSIC_PROFILES,
  musicProfileFingerprint,
  musicStillnessActive,
  setMusicMode,
  setMusicStillness,
} from '../src/audio/music'
import { CONSTELLATION } from '../src/content/constellation'
import { DEEP_UPGRADES } from '../src/content/deep'
import { VESSEL_PARTS } from '../src/content/vessel'
import {
  constellationNodeCopy,
  deepUpgradeCopy,
  progressionIdentity,
  vesselPartCopy,
} from '../src/content/universe-progression'
import { ZERO_AMOUNT, amountFromNumber, gtAmount } from '../src/core/numeric/amount'

function tideState(): EcoState {
  return {
    activeUniverse: 'tidefall',
    light: ZERO_AMOUNT,
    totalEarned: amountFromNumber(1_000),
    clicks: 0,
    owned: { 'tidefall-droplet': 1 },
    upgrades: [],
    achievements: [],
    stardustTotal: ZERO_AMOUNT,
    constellation: [],
    stardustWorks: {},
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengesDone: [],
    ending: null,
    remembrances: 0,
    curiosities: [],
    keeperFedUntil: 0,
    beacons: [],
    darkBetween: ZERO_AMOUNT,
    wayfinder: [],
    vesselParts: [],
  }
}

test('Tidefall ships a complete economy with a distinct identity', () => {
  const emberlight = universeById('emberlight')
  const tidefall = universeById('tidefall')
  assert.equal(tidefall.generators.length, 18)
  assert.ok(tidefall.upgrades.length >= 60)
  assert.equal(tidefall.generators[0].name, 'Droplet')
  assert.equal(tidefall.generators[17].name, 'The Second Wave')
  assert.equal(tidefall.currency, 'Glow')
  assert.notEqual(tidefall.audio.music, emberlight.audio.music)
  assert.notEqual(tidefall.audio.click, emberlight.audio.click)
  assert.notEqual(tidefall.centralObject, emberlight.centralObject)
  assert.notEqual(tidefall.events.motion, emberlight.events.motion)
  assert.equal(tidefall.events.noun, 'wandering bubble')
  assert.equal(tidefall.cabinet.title, 'The Pelagic Archive')
  assert.equal(emberlight.achievementPower, 'Radiance')
  assert.equal(tidefall.achievementPower, 'Resonance')
  const emberPowerUps = new Set(emberlight.events.powerUps.map((power) => power.id))
  assert.equal(tidefall.events.powerUps.some((power) => emberPowerUps.has(power.id)), false)
})

test('achievements and vestments adopt the active universe identity', () => {
  const firstSpark = ACHIEVEMENTS.find((achievement) => achievement.id === 'first-spark')!
  const catcher = ACHIEVEMENTS.find((achievement) => achievement.id === 'star-catcher')!
  assert.equal(achievementDisplay(firstSpark, 'emberlight').name, 'First Spark')
  assert.equal(achievementDisplay(firstSpark, 'tidefall').name, 'First Droplet')
  assert.equal(achievementDisplay(catcher, 'tidefall').name, 'Bubble Catcher')

  const tidefallAccents = THEMES.map((theme) => themeVarsForUniverse(theme, 'tidefall')['--amber'])
  assert.equal(new Set(tidefallAccents).size, THEMES.length)
  assert.ok(THEMES.every((theme) => themeVarsForUniverse(theme, 'tidefall')['--amber'] !== theme.vars['--amber']))
  assert.ok(THEMES.every((theme) => themeVarsForUniverse(theme, 'verdance')['--amber'] !== theme.vars['--amber']))
  assert.ok(THEMES.every((theme) => themeVarsForUniverse(theme, 'clockwork')['--amber'] !== theme.vars['--amber']))
})

test('Vessel and prestige layers use Tidefall-specific fiction with canonical Kindling IDs', () => {
  const heart = VESSEL_PARTS.find((part) => part.id === 'heart-sun')!
  const tideHeart = vesselPartCopy(heart, 'tidefall')
  assert.equal(heart.consumes?.gen, 'sun')
  assert.match(tideHeart.name, /Drowned Beacon/)
  assert.doesNotMatch(`${tideHeart.name} ${tideHeart.requirement} ${tideHeart.action}`, /\bSuns?\b/)

  assert.equal(progressionIdentity('emberlight').observatory.title, 'The Observatory')
  assert.equal(progressionIdentity('tidefall').observatory.title, 'The Moonless Chart')
  assert.equal(progressionIdentity('tidefall').deep.title, 'The Hadal Archive')
  assert.equal(progressionIdentity('verdance').observatory.collapseName, 'Pruning')
  assert.equal(progressionIdentity('clockwork').observatory.collapseName, 'Rewinding')
  assert.notEqual(
    constellationNodeCopy(CONSTELLATION[0], 'tidefall').name,
    constellationNodeCopy(CONSTELLATION[0], 'emberlight').name,
  )
  assert.equal(constellationNodeCopy(CONSTELLATION[0], 'verdance').name, 'First Root')
  assert.equal(constellationNodeCopy(CONSTELLATION[0], 'clockwork').name, 'First Tooth')
  assert.notEqual(
    deepUpgradeCopy(DEEP_UPGRADES[0], 'tidefall').name,
    deepUpgradeCopy(DEEP_UPGRADES[0], 'emberlight').name,
  )
})

test('the living tide averages around one and reaches its stated extrema', () => {
  assert.ok(Math.abs(tidefallRateMultiplier(0) - 1) < 1e-12)
  assert.ok(Math.abs(tidefallRateMultiplier(22_500) - 1.4) < 1e-12)
  assert.ok(Math.abs(tidefallRateMultiplier(67_500) - 0.6) < 1e-12)

  const state = tideState()
  assert.ok(gtAmount(totalRate(state, 22_500), totalRate(state, 67_500)))
})

test('universe music modes carry different rhythm grids', () => {
  setMusicMode('emberlight')
  assert.ok(Math.abs(beatDurationSec() - 60 / 72) < 1e-12)
  setMusicMode('tidefall')
  assert.equal(beatDurationSec(), 1)
  setMusicMode('emberlight')
})

test('every realm owns a distinct harmonic and synthesized music profile', () => {
  const ids = ['emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash'] as const
  assert.equal(new Set(ids.map(musicProfileFingerprint)).size, ids.length)
  assert.equal(new Set(ids.map((id) => MUSIC_PROFILES[id].chords.flat().join(','))).size, ids.length)
  for (const id of ids) {
    const profile = MUSIC_PROFILES[id]
    assert.ok(profile.tempoBpm >= 48 && profile.tempoBpm <= 110)
    assert.ok(profile.chords.length >= 4)
    assert.ok(profile.chords.every((chord) => chord.length >= 2))
    assert.ok(profile.padPeak <= 0.04)
    assert.ok(profile.pulsePeak <= 0.14)
    assert.ok(profile.malletDensity >= 0 && profile.malletDensity <= 1)
  }
})

test('Kailash Long Rest switches to a reversible sparse stillness score', () => {
  setMusicMode('kailash')
  setMusicStillness(true)
  assert.equal(musicStillnessActive(), true)
  setMusicStillness(false)
  assert.equal(musicStillnessActive(), false)
  setMusicMode('emberlight')
})

test('Steady Keel narrows Tidefall without changing its midpoint', () => {
  const state = tideState()
  assert.equal(universeRateMult(state, 0), 1)
  state.wayfinder = ['steady-keel']
  assert.ok(Math.abs(universeRateMult(state, 22_500) - 1.28) < 1e-12)
  assert.ok(Math.abs(universeRateMult(state, 67_500) - 0.72) < 1e-12)
  assert.equal(wayfinderTideAmplitude(state.wayfinder), 0.7)
})

test('Wayfinder nodes form an ordered, persistent progression', () => {
  assert.equal(wayfinderNodeAvailable([], WAYFINDER_NODES[0]), true)
  assert.equal(wayfinderNodeAvailable([], WAYFINDER_NODES[1]), false)
  assert.equal(wayfinderNodeAvailable(['between-cargo'], WAYFINDER_NODES[1]), true)
  assert.equal(wayfinderProductionMult(['between-cargo']), 1.25)
  assert.equal(wayfinderStartingKindlings(['remembered-kindling']), 25)
})
