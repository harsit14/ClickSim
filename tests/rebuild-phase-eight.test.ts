import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { averagedRhythmReward, DEFAULT_AVERAGED_COMPETENT_RATIO } from '../src/accessibility/averaged-rhythm'
import { PARTICLE_RECIPES } from '../src/render/particle-recipes'
import {
  advanceOmenAttraction,
  OMEN_ATTRACTION_CAP,
} from '../src/systems/omen-attraction'
import {
  BASE_RHYTHM_WINDOW_MS,
  RHYTHM_COMPETENT_MULTIPLIER,
  RHYTHM_EXCEPTIONAL_MULTIPLIER,
  RHYTHM_MULTIPLIER_STEPS,
  rhythmAttractionCheckpoint,
  rhythmMultiplierForStreak,
} from '../src/systems/rhythm-balance'
import {
  OMEN_ANNOUNCEMENT_MS,
  OMEN_MIN_HIT_SIZE_PX,
  OMEN_MISS_BANK_RATIO,
  planOmenReward,
} from '../src/systems/omen-v2'
import {
  LUMEN_VAULT_ITEMS,
  lumenVaultItemsForHome,
} from '../src/content/legacy-exchange'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('Phase 8.1 caps performed rhythm at one-and-a-half inside a ninety-millisecond base window', () => {
  assert.equal(BASE_RHYTHM_WINDOW_MS, 90)
  assert.equal(RHYTHM_COMPETENT_MULTIPLIER, 1.4)
  assert.equal(RHYTHM_EXCEPTIONAL_MULTIPLIER, 1.5)
  assert.deepEqual(RHYTHM_MULTIPLIER_STEPS, [
    { streak: 4, multiplier: 1.1 },
    { streak: 8, multiplier: 1.2 },
    { streak: 16, multiplier: 1.3 },
    { streak: 32, multiplier: 1.4 },
    { streak: 64, multiplier: 1.5 },
  ])
  assert.equal(rhythmMultiplierForStreak(0), 1)
  assert.equal(rhythmMultiplierForStreak(31), 1.3)
  assert.equal(rhythmMultiplierForStreak(64), 1.5)
  assert.equal(rhythmMultiplierForStreak(100_000), 1.5)

  const combo = read('../src/systems/combo.svelte.ts')
  assert.match(combo, /BASE_RHYTHM_WINDOW_MS \/ 1_000/)
  assert.match(combo, /rhythmMultiplierForStreak\(combo\.streak\)/)
  assert.doesNotMatch(combo, /addBuff/)
  assert.doesNotMatch(combo, /prodMult|clickMult/)
})

test('long streak milestones fill Omen attraction instead of multiplying raw output', () => {
  const checkpoints = [8, 16, 32, 64].map((streak) => rhythmAttractionCheckpoint(streak)!)
  assert.deepEqual(checkpoints, [
    { rewardAt: 8, charge: 10 },
    { rewardAt: 16, charge: 20 },
    { rewardAt: 32, charge: 30 },
    { rewardAt: 64, charge: 40 },
  ])
  assert.equal(checkpoints.reduce((sum, { charge }) => sum + charge, 0), OMEN_ATTRACTION_CAP)
  assert.equal(rhythmAttractionCheckpoint(65), null)
  assert.deepEqual(rhythmAttractionCheckpoint(96), { rewardAt: 96, charge: 40 })

  let attraction = 0
  for (const checkpoint of checkpoints) {
    const next = advanceOmenAttraction(attraction, checkpoint.charge)
    attraction = next.charge
  }
  assert.equal(attraction, OMEN_ATTRACTION_CAP)
  assert.deepEqual(advanceOmenAttraction(90, 25), { charge: 100, ready: true, overflow: 15 })
  assert.deepEqual(advanceOmenAttraction(Number.NaN, 20), { charge: 0, ready: false, overflow: 0 })

  const combo = read('../src/systems/combo.svelte.ts')
  const stars = read('../src/systems/falling-stars.svelte.ts')
  const eventUi = read('../src/ui/FallingStar.svelte')
  assert.match(combo, /chargeOmenAttraction\(checkpoint\.charge\)/)
  assert.match(stars, /omenAttraction: 0/)
  assert.match(stars, /advanceOmenAttraction/)
  assert.match(eventUi, /resetOmenAttraction\(\)/)
})

test('averaged accessibility keeps its ratio policy against the rebalanced active values', () => {
  const result = averagedRhythmReward({
    competentMultiplier: RHYTHM_COMPETENT_MULTIPLIER,
    exceptionalMultiplier: RHYTHM_EXCEPTIONAL_MULTIPLIER,
    presentation: { audio: 'muted', motion: 'reduced', quality: 'low' },
  })
  assert.equal(result.status, 'ready')
  assert.equal(result.competentRatio, DEFAULT_AVERAGED_COMPETENT_RATIO)
  assert.equal(result.rewardMultiplier, RHYTHM_COMPETENT_MULTIPLIER * DEFAULT_AVERAGED_COMPETENT_RATIO)
  assert.equal(result.belowExceptional, true)

  const canvas = read('../src/ui/EmberCanvas.svelte')
  assert.match(canvas, /competentMultiplier: RHYTHM_COMPETENT_MULTIPLIER/)
  assert.match(canvas, /exceptionalMultiplier: RHYTHM_EXCEPTIONAL_MULTIPLIER/)
  assert.match(canvas, /return \{ multiplier: result\.rewardMultiplier \?\? 1, onBeat: false \}/)
})

test('on-beat reward lives in braid particles, one ring, and a harmonized note', () => {
  assert.equal(PARTICLE_RECIPES['on-beat'].tailLength, PARTICLE_RECIPES.click.tailLength * 2)
  assert.equal(PARTICLE_RECIPES['on-beat'].count[1], PARTICLE_RECIPES.click.count[1])
  assert.match(PARTICLE_RECIPES['on-beat'].behavior, /ring.*braid/i)

  const world = read('../src/render/world.ts')
  const canvas = read('../src/ui/EmberCanvas.svelte')
  const audio = read('../src/audio/sfx.ts')
  assert.match(world, /kind === 'on-beat' && comboStreak >= 8/)
  assert.match(world, /if \(feedback\.onBeat\) this\.rings\.push\(performance\.now\(\)\)/)
  assert.match(canvas, /if \(rhythm\.onBeat\) playRhythmAccent\(clickMode, combo\.streak\)/)
  assert.match(audio, /export function playRhythmAccent/)
  assert.match(audio, /\[root, root \* ratio\]\.entries\(\)/)
})

test('Phase 8.2 announces every Omen for five seconds before its route begins', () => {
  assert.equal(OMEN_ANNOUNCEMENT_MS, 5_000)
  const eventUi = read('../src/ui/FallingStar.svelte')
  const audio = read('../src/audio/sfx.ts')
  assert.deepEqual(compile(eventUi, { filename: 'FallingStar.svelte', generate: 'client' }).warnings, [])
  assert.match(eventUi, /phase: 'announcing'/)
  assert.match(eventUi, /OMEN_ANNOUNCEMENT_MS - \(now - star\.announcedAt\)/)
  assert.match(eventUi, /playOmenApproach\(pack\.audio\.event\)/)
  assert.match(eventUi, /class="omen-announcement"/)
  assert.match(audio, /export function playOmenApproach/)
})

test('Omen routes are generous slow arcs with a formal minimum target', () => {
  assert.equal(OMEN_MIN_HIT_SIZE_PX, 44)
  const eventUi = read('../src/ui/FallingStar.svelte')
  const routes = read('../src/systems/power-up-spawn.ts')
  assert.match(eventUi, /positionOnOmenArc\(star\.route, routeProgress\)/)
  assert.match(eventUi, /min-width: 44px/)
  assert.match(eventUi, /min-height: 44px/)
  assert.match(routes, /const verticalSpeed = 28 \+ speedRoll \* 10/)
  assert.match(routes, /const sideSpeed = 32 \+ speedRoll \* 10/)
  assert.match(routes, /const gutter = 24/)
})

test('a missed Omen banks exactly one quarter without weakening its buff', () => {
  assert.equal(OMEN_MISS_BANK_RATIO, 0.25)
  assert.deepEqual(
    planOmenReward({ durationSec: 40, rateSeconds: 120 }, 1.5, OMEN_MISS_BANK_RATIO),
    { durationSeconds: 15, rateSeconds: 30, rewardRatio: 0.25 },
  )
  assert.deepEqual(
    planOmenReward({ durationSec: 1 }, 1, OMEN_MISS_BANK_RATIO),
    { durationSeconds: 1, rateSeconds: 0, rewardRatio: 0.25 },
  )
  const eventUi = read('../src/ui/FallingStar.svelte')
  assert.match(eventUi, /applyReward\(missed, OMEN_MISS_BANK_RATIO, true\)/)
  assert.match(eventUi, /A quarter of its reward remains along the route/)
  assert.match(eventUi, /class="banked-embers"/)
  assert.match(eventUi, /worldRef\(\)\?\.emitParticleRecipe\('omen', groundX, groundY\)/)
})

test('Phase 8.3 consolidates meta purchases without changing any stored item', () => {
  const partition = [
    ...lumenVaultItemsForHome('archive'),
    ...lumenVaultItemsForHome('observatory'),
    ...lumenVaultItemsForHome('vessel-wayfinder'),
  ]
  assert.equal(partition.length, LUMEN_VAULT_ITEMS.length)
  assert.equal(new Set(partition.map(({ id }) => id)).size, LUMEN_VAULT_ITEMS.length)
  assert.deepEqual(
    partition.map(({ id, cost, productionMultiplier, themeId }) => ({ id, cost, productionMultiplier, themeId })).sort((a, b) => a.id.localeCompare(b.id)),
    LUMEN_VAULT_ITEMS.map(({ id, cost, productionMultiplier, themeId }) => ({ id, cost, productionMultiplier, themeId })).sort((a, b) => a.id.localeCompare(b.id)),
  )

  const legacy = read('../src/ui/EndgameHub.svelte')
  const deep = read('../src/ui/TheDeep.svelte')
  const observatory = read('../src/ui/Observatory.svelte')
  const vessel = read('../src/ui/VesselPanel.svelte')
  const archive = read('../src/ui/CuriosityCabinet.svelte')
  assert.doesNotMatch(legacy, /buySuccessionRelay|distillLumenShard|buyLumenVaultItem/)
  assert.match(deep, /<LumenDistillery/)
  assert.match(observatory, /home="observatory"/)
  assert.match(vessel, /<SuccessionRelayHome[\s\S]*home="vessel-wayfinder"/)
  assert.match(archive, /home="archive"/)
})

test('the canonical README records the current presentation and reset contracts', () => {
  const canon = read('../README.md')
  assert.match(canon, /This README is the single canonical project document/)
  assert.match(canon, /Ownership changes form at the thresholds \*\*1 \/ 10 \/ 25 \/ 50 \/ 100\*\*/)
  assert.match(canon, /naked circle, square, line, or generic pill is not a finished world object/)
  assert.match(canon, /Transient achievements, Echoes, and shorthand messages share one central reserved notification lane with queueing/)
  assert.match(canon, /Only an explicit full save wipe clears all active state, parked realms, history, and Between progression/)
  assert.match(canon, /External cultural review remains a release gate/i)
})
