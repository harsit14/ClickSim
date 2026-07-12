import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { CHALLENGES } from '../src/content/challenges'
import { UNIVERSES, universeById } from '../src/content/universes'
import { VESSEL_PART_IDS } from '../src/content/vessel'
import { WAYFINDER_NODES } from '../src/content/wayfinder'
import { SUCCESSION_RELAYS, lumenClaimIds } from '../src/content/legacy-exchange'
import { createDevScenario } from '../src/core/dev-scenarios'
import { applyDevCheat } from '../src/core/dev-playtest'
import type { GameState } from '../src/engine/game.svelte'

function scenario(name: 'tempest' | 'opening'): GameState {
  const result = createDevScenario(name, 10_000)
  assert.ok(result)
  return { ...result, ...result.endgame } as unknown as GameState
}

test('ready Beacon cheat completes local requirements but preserves the real ignition interaction', () => {
  const state = scenario('tempest')
  applyDevCheat(state, 'ready-beacon', 20_000)
  const pack = universeById('tempest')

  assert.equal(state.activeUniverse, 'tempest')
  assert.equal(state.beacons.includes('tempest'), false)
  assert.deepEqual(state.vesselPartsByUniverse.tempest, VESSEL_PART_IDS)
  assert.ok(pack.generators.every(({ id }) => state.owned[id] === 125))
  assert.deepEqual(state.challengesDone, CHALLENGES.map(({ id }) => id))
  assert.ok(pack.cabinet.items.every(({ id }) => state.curiosities.includes(id)))
  assert.ok(pack.echoes.every(({ id }) => state.echoes.includes(id)))
})

test('unlock Everything exposes all shared progression while leaving finale choices replayable', () => {
  const state = scenario('opening')
  applyDevCheat(state, 'unlock-everything', 20_000)

  assert.deepEqual(state.beacons, UNIVERSES.map(({ id }) => id))
  assert.deepEqual(state.wayfinder, WAYFINDER_NODES.map(({ id }) => id))
  assert.ok(UNIVERSES.every(({ id }) => state.vesselPartsByUniverse[id]?.length === VESSEL_PART_IDS.length))
  assert.deepEqual(state.achievements, ACHIEVEMENTS.map(({ id }) => id))
  assert.deepEqual(state.pastEndings, ['warden', 'hunger', 'companion'])
  assert.equal(state.ending, null)
  assert.equal(state.gardenEnding, null)
  assert.ok(state.seen.includes('act3-hook'))
  assert.deepEqual(Object.keys(state.successionRelays), SUCCESSION_RELAYS.map(({ id }) => id))
  assert.deepEqual(state.lumenShardClaims, lumenClaimIds())
  assert.ok(state.lumenShards >= 50)
  assert.deepEqual(state.lumenPurchases, [])
})

test('development cheats reject invalid caller time', () => {
  const state = scenario('opening')
  assert.throws(() => applyDevCheat(state, 'show-all-controls', Number.NaN), /finite and nonnegative/)
})

test('presentation QA exposes a five-notification storm without changing progression', () => {
  const state = scenario('opening')
  const before = JSON.stringify(state)
  assert.match(applyDevCheat(state, 'notification-storm', 1_000), /Fire 5 Notifications/)
  assert.equal(JSON.stringify(state), before)
  const panel = readFileSync(new URL('../src/ui/DevPlaytestPanel.svelte', import.meta.url), 'utf8')
  assert.equal((panel.match(/pushToast\(/g) ?? []).length, 4)
  assert.match(panel, /pushAchievementToast\(/)
})

test('loka depth QA primes an authored prompt and permanent world traces', () => {
  const state = scenario('tempest')
  assert.match(applyDevCheat(state, 'prime-loka-depth', 1_000), /Prime Loka Depth/)
  assert.equal(state.lokaProgress['u6-routes'], 14)
  assert.equal(state.lokaProgress['u6-returns'], 120)
  assert.ok(state.numericLawState['u6-strain-phase'])
  assert.ok(universeById('tempest').generators.every(({ id }) => state.owned[id] === 125))
})

test('playtest console compiles accessibly and remains behind an explicit dev URL gate', () => {
  const componentUrl = new URL('../src/ui/DevPlaytestPanel.svelte', import.meta.url)
  const componentSource = readFileSync(componentUrl, 'utf8')
  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const compiled = compile(componentSource, {
    filename: componentUrl.pathname,
    generate: 'client',
  })

  assert.deepEqual(compiled.warnings, [])
  assert.match(appSource, /import\.meta\.env\.DEV[\s\S]*playtest/)
  assert.match(appSource, /\{#if playtestMode\}[\s\S]*<DevPlaytestPanel/)
  assert.match(componentSource, /Development playtest console/)
  assert.match(componentSource, /aria-keyshortcuts="F10"/)
})
