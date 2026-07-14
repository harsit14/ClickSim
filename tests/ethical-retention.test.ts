import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { UNIVERSES, universeById, type UniverseId } from '../src/content/universes'
import { lumenLineText, type LumenLine } from '../src/content/lumen'
import {
  atlasUtcDay,
  dailyAtlasRoute,
  decodeAtlasRoute,
  generateAtlasRoute,
} from '../src/endgame/atlas'
import {
  gardenKeepsake,
  gardenKeepsakeFilename,
  gardenKeepsakeSvg,
} from '../src/endgame/garden-keepsake'
import { quietGoalProgress } from '../src/endgame/quiet-goals'

const universeIds = UNIVERSES.map((universe) => universe.id as UniverseId)

test('the daily Atlas route is shared by UTC day and its ordinary code never expires', () => {
  const morning = Date.UTC(2026, 6, 14, 1, 5)
  const evening = Date.UTC(2026, 6, 14, 23, 55)
  const tomorrow = Date.UTC(2026, 6, 15, 0, 1)

  assert.equal(atlasUtcDay(morning), '2026-07-14')
  assert.deepEqual(dailyAtlasRoute(morning, 'verdance'), dailyAtlasRoute(evening, 'verdance'))
  assert.notEqual(dailyAtlasRoute(morning, 'verdance').route.code, dailyAtlasRoute(tomorrow, 'verdance').route.code)

  const oldCode = dailyAtlasRoute(morning, 'verdance').route.code
  assert.deepEqual(decodeAtlasRoute(oldCode), dailyAtlasRoute(morning, 'verdance').route)
  assert.throws(() => dailyAtlasRoute(Number.POSITIVE_INFINITY), /finite timestamp/)
})

test('quiet goals derive from permanent records and never add a reward state', () => {
  const activeUniverse = 'emberlight' as const
  const universeRuns = Object.fromEntries(universeIds.map((universeId) => [
    universeId,
    {
      curiosities: universeById(universeId).cabinet.items.map((item) => item.id),
      challengesDone: Array.from({ length: 12 }, (_, index) => `${universeId}-trial-${index}`),
    },
  ]))
  const state = {
    activeUniverse,
    curiosities: universeById(activeUniverse).cabinet.items.map((item) => item.id),
    challengesDone: Array.from({ length: 12 }, (_, index) => `emberlight-trial-${index}`),
    universeRuns,
    beacons: [...universeIds],
    beaconNames: Object.fromEntries(universeIds.map((id) => [id, `Beacon of ${id}`])),
    atlasCompletions: universeIds.map((universeId, index) => ({
      routeCode: generateAtlasRoute(index + 1, universeId).code,
      universeId,
    })),
  }

  const goals = quietGoalProgress(state as never)
  assert.equal(goals.length, 6)
  assert.ok(goals.every((goal) => goal.complete))
  assert.ok(goals.every((goal) => !('reward' in goal)))
})

test('Garden ending cards are deterministic, portable, and escape Beacon names', () => {
  const model = gardenKeepsake('companion', { emberlight: '</text><script>alert(1)</script>' })
  const svg = gardenKeepsakeSvg(model)

  assert.equal(svg, gardenKeepsakeSvg(model))
  assert.equal(gardenKeepsakeFilename('companion'), 'ember-garden-companion.svg')
  assert.match(svg, /EMBER · THE GARDEN/)
  assert.match(svg, /&lt;\/text&gt;&lt;script&gt;/)
  assert.doesNotMatch(svg, /<script/)
  assert.doesNotMatch(svg, /(?:href|src)=/)
})

test('Remembrance-aware Lumen copy changes memory without changing line identity', () => {
  const line: LumenLine = {
    id: 'memory-test',
    text: 'First visit.',
    remembranceText: 'We have been here before.',
    when: () => true,
  }
  assert.equal(lumenLineText(line, 0), 'First visit.')
  assert.equal(lumenLineText(line, 1), 'We have been here before.')
  assert.equal(lumenLineText({ ...line, remembranceText: undefined }, 2), 'First visit.')

  for (const universe of UNIVERSES.filter(({ id }) => id !== 'emberlight')) {
    const arrival = universe.lumen.find((candidate) => candidate.when({ clicks: 1 } as never))
    assert.ok(arrival?.remembranceText, `${universe.id} needs a remembered arrival`)
    assert.notEqual(lumenLineText(arrival, 1), arrival.text)
  }
})

test('ethical retention surfaces compile and state their non-punitive contracts', () => {
  const componentNames = ['App.svelte', 'ui/OptionsPanel.svelte', 'ui/EndgameHub.svelte', 'ui/GardenScene.svelte']
  const sources = componentNames.map((name) => {
    const path = new URL(`../src/${name}`, import.meta.url)
    const source = readFileSync(path, 'utf8')
    assert.deepEqual(compile(source, { filename: path.pathname, generate: 'client' }).warnings, [])
    return source
  })
  const [app, options, hub, garden] = sources

  assert.match(options, />Photo mode</)
  assert.match(app, /setPhotoPaused\(true\)/)
  assert.match(app, /exportPng\(\)/)
  assert.match(hub, /no streak and no expiry penalty/)
  assert.match(hub, /They grant no power, expire never, and do not hold the story closed/)
  assert.match(garden, /Freeze Garden/)
  assert.match(garden, /Save ending card/)
})
