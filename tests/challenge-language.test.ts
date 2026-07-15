import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { CHALLENGES } from '../src/content/challenges'
import { localizeChallengeText } from '../src/content/challenge-language'
import { DEEP_UPGRADES } from '../src/content/deep'
import { challengeCopy, deepUpgradeCopy, progressionIdentity } from '../src/content/universe-progression'
import { UNIVERSES, V2_UNIVERSE_BY_ID } from '../src/content/universes'
import type { GameState } from '../src/engine/game.svelte'

const canonicalLeak = /\b(?:kindle|kindling|generators?|clicks|upgrades|falling stars?)\b/i

test('every non-Emberlight trial resolves canonical mechanics into its own universe language', () => {
  for (const universe of UNIVERSES.filter(({ id }) => id !== 'emberlight')) {
    for (const challenge of CHALLENGES) {
      const copy = challengeCopy(challenge, universe)
      const displayed = `${copy.rules} ${copy.goalText} ${copy.rewardDesc}`
      assert.doesNotMatch(displayed, /\{[^}]+\}/, `${universe.id}/${challenge.id} left a placeholder`)
      assert.doesNotMatch(displayed, canonicalLeak, `${universe.id}/${challenge.id} leaked Emberlight language`)
    }

    const firstThree = universe.generators.slice(0, 3).map(({ name }) => name)
    const swarm = challengeCopy(CHALLENGES.find(({ id }) => id === 'swarm')!, universe)
    for (const name of firstThree) {
      assert.match(swarm.rules, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      assert.match(swarm.rewardDesc, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }

    for (const id of ['entropy', 'glass-ceiling', 'unwritten']) {
      const copy = challengeCopy(CHALLENGES.find((challenge) => challenge.id === id)!, universe)
      assert.match(copy.goalText, new RegExp(universe.generators[9].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    const finalGoal = challengeCopy(CHALLENGES.find(({ id }) => id === 'small-vessels')!, universe)
    assert.match(finalGoal.goalText, new RegExp(universe.generators[17].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('Clockwork Maintenance Trials use mechanism, Ticks, and named machine tiers throughout', () => {
  const clockwork = UNIVERSES.find(({ id }) => id === 'clockwork')!
  const entropy = challengeCopy(CHALLENGES.find(({ id }) => id === 'entropy')!, clockwork)
  const swarm = challengeCopy(CHALLENGES.find(({ id }) => id === 'swarm')!, clockwork)
  const silence = challengeCopy(CHALLENGES.find(({ id }) => id === 'silence')!, clockwork)
  const single = challengeCopy(CHALLENGES.find(({ id }) => id === 'single-voice')!, clockwork)
  const final = challengeCopy(CHALLENGES.find(({ id }) => id === 'small-vessels')!, clockwork)

  assert.equal(entropy.rules, 'Mechanism costs grow at ×1.30 instead of ×1.15.')
  assert.equal(entropy.goalText, 'build a Difference Engine')
  assert.equal(swarm.rules, 'Only Tooth, Cog, and Ratchet operate.')
  assert.equal(swarm.rewardDesc, 'Tooth, Cog, and Ratchet ×3, always')
  assert.equal(silence.rules, 'No bells. No cadence. No Maintenance Signals. Just you and the unpowered city.')
  assert.equal(single.rules, 'Only your highest owned mechanism tier transmits.')
  assert.equal(final.goalText, 'build The Great Regulator')
  assert.equal(final.rewardDesc, 'all mechanism linkages ×2, always')
})

test('localized generator trial goals inspect the active universe generator tiers', () => {
  const generatorGoalIds = ['entropy', 'glass-ceiling', 'unwritten']

  for (const universe of UNIVERSES) {
    const tierTenId = universe.generators[9].id
    const tierEighteenId = universe.generators[17].id
    const tierTenState = { owned: { [tierTenId]: 1 } } as unknown as GameState
    const tierEighteenState = { owned: { [tierEighteenId]: 1 } } as unknown as GameState

    for (const challengeId of generatorGoalIds) {
      const challenge = CHALLENGES.find(({ id }) => id === challengeId)!
      assert.equal(challenge.goal(tierTenState, universe.generators), true, `${universe.id}/${challengeId}`)
      assert.deepEqual(challenge.progress(tierTenState, universe.generators), { current: 1, target: 1 })
    }

    const final = CHALLENGES.find(({ id }) => id === 'small-vessels')!
    assert.equal(final.goal(tierEighteenState, universe.generators), true, `${universe.id}/small-vessels`)
    assert.deepEqual(final.progress(tierEighteenState, universe.generators), { current: 1, target: 1 })
  }
})

test('Vishnulok and Kailash keep distinct public trial-unit language', () => {
  const vishnulok = UNIVERSES.find(({ id }) => id === 'vishnulok')!
  const kailash = UNIVERSES.find(({ id }) => id === 'kailash')!

  assert.equal(localizeChallengeText('One Kindling remains.', vishnulok), 'One Refuge remains.')
  assert.equal(localizeChallengeText('Two Kindlings remain.', vishnulok), 'Two Refuges remain.')
  assert.equal(localizeChallengeText('One Kindling remains.', kailash), 'One Waystation remains.')
  assert.equal(localizeChallengeText('Two Kindlings remain.', kailash), 'Two Waystations remain.')
})

test('trial display, guide, active banner, and completion toast share the resolved copy', () => {
  const deep = readFileSync(new URL('../src/ui/TheDeep.svelte', import.meta.url), 'utf8')
  const guide = readFileSync(new URL('../src/ui/GameGuide.svelte', import.meta.url), 'utf8')
  const banner = readFileSync(new URL('../src/ui/ChallengeBanner.svelte', import.meta.url), 'utf8')
  const achievements = readFileSync(new URL('../src/systems/achievements.svelte.ts', import.meta.url), 'utf8')

  assert.match(deep, /\{copy\.rules\}[\s\S]*\{copy\.goalText\}[\s\S]*\{copy\.rewardDesc\}/)
  assert.doesNotMatch(deep, /localize\(c\.(?:rules|goalText|rewardDesc)\)/)
  assert.match(guide, /copy\.rules[\s\S]*copy\.goalText[\s\S]*copy\.rewardDesc/)
  assert.match(banner, /const universe = \$derived\(universeById\(game\.activeUniverse\)\)/)
  assert.match(banner, /challengeCopy\(trial, universe\)/)
  assert.match(banner, /trial\.progress\(game, universe\.generators\)/)
  assert.match(banner, /<strong>Rule:<\/strong>/)
  assert.match(banner, /<b>Goal:<\/b>/)
  assert.match(banner, /First: use the Heart|First: buy a production source/)
  assert.match(deep, /aria-label=\{`Begin \$\{copy\.name\}/)
  assert.match(achievements, /const universe = universeById\(game\.activeUniverse\)/)
  assert.match(achievements, /c\.goal\(game, universe\.generators\)/)
  assert.match(achievements, /challengeCopy\(c, universe\)/)
  assert.match(achievements, /copy\.rewardDesc/)
})

test('every V2 trial accessibility description is free of unresolved placeholders', () => {
  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    for (const trial of pack.trials) {
      assert.doesNotMatch(trial.accessibilityDescription, /\{[^}]+\}/, `${universeId}/${trial.id}`)
    }
  }
})

test('shared Deep copy also resolves canonical starter tiers and currency placeholders', () => {
  const dawnMemory = DEEP_UPGRADES.find(({ id }) => id === 'dawn-memory')!
  for (const universe of UNIVERSES) {
    const copy = deepUpgradeCopy(dawnMemory, universe.id)
    const effect = localizeChallengeText(copy.effect ?? dawnMemory.desc, universe)
    const warning = localizeChallengeText(progressionIdentity(universe.id).deep.warningText, universe)

    assert.doesNotMatch(effect, /\{[^}]+\}/, `${universe.id} dawn memory`)
    assert.doesNotMatch(warning, /\{[^}]+\}/, `${universe.id} warning`)
    if (effect.includes('40')) assert.match(effect, new RegExp(universe.generators[0].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    if (effect.includes('5')) assert.match(effect, new RegExp(universe.generators[1].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
