import assert from 'node:assert/strict'
import test from 'node:test'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { CHALLENGE_BY_ID, challengeUnlocked } from '../src/content/challenges'
import { GENERATORS } from '../src/content/generators'
import { TIDEFALL_ECHOES, TIDEFALL_UPGRADES } from '../src/content/universes/tidefall'
import {
  availableUpgrades,
  clickPower,
  genDisabled,
  genRate,
  synergyBonusMult,
  unitRate,
  type EcoState,
} from '../src/engine/compute'

function state(): EcoState {
  return {
    activeUniverse: 'emberlight',
    light: 0,
    totalEarned: 0,
    clicks: 0,
    owned: {},
    upgrades: [],
    achievements: [],
    stardustTotal: 0,
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
    darkBetween: 0,
    wayfinder: [],
    vesselParts: [],
  }
}

test('advanced trials reveal in order and enforce production rules', () => {
  const glass = CHALLENGE_BY_ID.get('glass-ceiling')!
  const single = CHALLENGE_BY_ID.get('single-voice')!
  assert.equal(challengeUnlocked(['a', 'b'], glass), false)
  assert.equal(challengeUnlocked(['a', 'b', 'c'], glass), true)
  assert.equal(challengeUnlocked(Array(7).fill('done'), single), false)
  assert.equal(challengeUnlocked(Array(8).fill('done'), single), true)

  const game = state()
  game.owned = { spark: 100, wisp: 20 }
  game.challenge = 'glass-ceiling'
  const cappedRate = genRate(game, GENERATORS[0])
  game.challenge = null
  game.owned.spark = 15
  assert.equal(cappedRate, genRate(game, GENERATORS[0]))

  game.owned = { spark: 20, wisp: 5, hearth: 1 }
  game.challenge = 'single-voice'
  assert.equal(genDisabled(game, GENERATORS[0]), true)
  assert.equal(genDisabled(game, GENERATORS[2]), false)
})

test('advanced trials constrain clicking, upgrades, and tier parity', () => {
  const game = state()
  game.owned.spark = 10
  const normalClick = clickPower(game)
  game.challenge = 'ashen-touch'
  assert.equal(clickPower(game), normalClick * 0.05)

  game.challenge = 'unwritten'
  game.clicks = 100
  game.totalEarned = 1e9
  assert.deepEqual(availableUpgrades(game), [])

  game.challenge = 'broken-ladder'
  assert.equal(genDisabled(game, GENERATORS[0]), false)
  assert.equal(genDisabled(game, GENERATORS[1]), true)
})

test('Small Vessels doubles the bonus portion of every resonance', () => {
  const game = state()
  game.owned = { spark: 10, wisp: 1 }
  game.upgrades = ['wisp-chorus']
  const wisp = GENERATORS[1]
  assert.ok(Math.abs(unitRate(game, wisp) / wisp.baseRate - 1.2) < 1e-12)
  game.challengesDone = ['small-vessels']
  assert.equal(synergyBonusMult(game), 2)
  assert.ok(Math.abs(unitRate(game, wisp) / wisp.baseRate - 1.4) < 1e-12)
})

test('Tidefall now carries a full resonance and ten-echo lore arc', () => {
  const resonances = TIDEFALL_UPGRADES.flatMap((upgrade) =>
    upgrade.effects.filter((effect) => effect.kind === 'synergy'),
  )
  assert.ok(resonances.length >= 12)
  assert.equal(TIDEFALL_ECHOES.length, 10)
})

test('temporary trial resets do not award empty-run achievements', () => {
  const trial = state()
  trial.challenge = 'glass-ceiling'
  trial.clicks = 1_000
  trial.totalEarned = 1e9
  const impatience = ACHIEVEMENTS.find((achievement) => achievement.id === 'impatience')!
  const purist = ACHIEVEMENTS.find((achievement) => achievement.id === 'purist')!
  assert.equal(impatience.when(trial as Parameters<typeof impatience.when>[0], 0), false)
  assert.equal(purist.when(trial as Parameters<typeof purist.when>[0], 0), false)
})
