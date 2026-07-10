import assert from 'node:assert/strict'
import test from 'node:test'
import {
  atlasReplayDigest,
  atlasRouteMultiplier,
  decodeAtlasRoute,
  generateAtlasRoute,
  replayAtlasRoute,
  validateAtlasRoute,
} from '../src/endgame/atlas'
import {
  cleanBeaconName,
  decodeLawLoadout,
  encodeLawLoadout,
  lawLoadoutOwnershipIssues,
  recordChronicleEvent,
  updateChronicleBest,
  validateLawLoadout,
} from '../src/endgame/chronicle'
import {
  availableGardenClosures,
  gardenCredits,
  gardenUnlocked,
  GARDEN_LINKS,
  GARDEN_NODES,
} from '../src/endgame/garden'
import { V2_UNIVERSE_BY_ID, type UniverseId } from '../src/content/universes'
import { THEMES } from '../src/content/themes'
import { WAYFINDER_NODES } from '../src/content/wayfinder'
import { createDevScenario } from '../src/core/dev-scenarios'
import {
  migrateAndSanitizeSave,
  serializeSaveDataV23,
} from '../src/core/save-data'
import {
  buildLawInteractionMatrix,
  detectLawDominance,
  softCapLawMultiplier,
  validateLawInteractionMatrix,
} from '../balance/law-interaction-matrix'

const universeIds: readonly UniverseId[] = [
  'emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle',
]

test('seeded Atlas routes use compatible authored laws and replay deterministically', () => {
  for (const [universeIndex, universeId] of universeIds.entries()) {
    for (let index = 0; index < 40; index++) {
      const route = generateAtlasRoute(universeIndex * 10_000 + index, universeId)
      assert.deepEqual(validateAtlasRoute(route), [])
      assert.deepEqual(decodeAtlasRoute(route.code), route)
      assert.deepEqual(replayAtlasRoute(route), replayAtlasRoute(route))
      assert.equal(atlasReplayDigest(route), atlasReplayDigest(route))
      assert.ok(atlasRouteMultiplier(route) > 1)
      assert.ok(atlasRouteMultiplier(route) < 1.35)
    }
  }
})

test('Atlas validation rejects damaged codes and mismatched route claims', () => {
  const route = generateAtlasRoute(7129, 'canticle')
  assert.equal(decodeAtlasRoute(`${route.code.slice(0, -1)}x`), null)
  assert.ok(validateAtlasRoute({ ...route, universeId: 'emberlight' }).length > 0)
  assert.throws(() => generateAtlasRoute(-1), /nonnegative/)
})

test('law loadout codes round-trip configuration without progression', () => {
  const pack = V2_UNIVERSE_BY_ID.get('prismata')!
  const loadout = {
    id: 'loadout-prism-test',
    name: 'White with labels',
    universeId: 'prismata' as const,
    doctrineId: pack.economy.doctrines[1].id,
    wayfinderLawIds: WAYFINDER_NODES.map((law) => law.id),
    archiveShelfId: pack.archive.shelves[2].id,
    vestmentId: THEMES[0].id,
    anomalyResponseIds: [],
    automation: 'balanced' as const,
  }
  assert.deepEqual(validateLawLoadout(loadout), [])
  const code = encodeLawLoadout(loadout)
  const decoded = decodeLawLoadout(code, loadout.name)
  assert.ok(decoded)
  assert.deepEqual({ ...decoded, id: loadout.id }, loadout)
  assert.deepEqual(lawLoadoutOwnershipIssues(decoded, loadout.wayfinderLawIds, [loadout.vestmentId]), [])
  assert.ok(lawLoadoutOwnershipIssues(decoded, [], []).length >= 2)
  assert.equal(decodeLawLoadout(`${code}damaged`), null)
})

test('Chronicle records are bounded, sanitized, ordered, and keep personal bests', () => {
  let events = recordChronicleEvent([], 'emberlight', 'awakening', 200, '  First   warmth  ')
  events = recordChronicleEvent(events, 'emberlight', 'beacon', 100, 'Beacon')
  assert.deepEqual(events.map((event) => event.at), [100, 200])
  assert.equal(events[1].detail, 'First warmth')
  assert.equal(cleanBeaconName('  My\u0000 Beacon  '), 'My Beacon')
  const route = generateAtlasRoute(1303, 'tidefall')
  const first = updateChronicleBest([], { routeCode: route.code, durationMs: 5_000, completedAt: 10_000 })
  const slower = updateChronicleBest(first, { routeCode: route.code, durationMs: 8_000, completedAt: 20_000 })
  const faster = updateChronicleBest(slower, { routeCode: route.code, durationMs: 4_000, completedAt: 30_000 })
  assert.equal(slower[0].durationMs, 5_000)
  assert.equal(faster[0].durationMs, 4_000)
})

test('Garden requires seven Beacons and exposes reconciliation only after all answers', () => {
  assert.equal(GARDEN_NODES.length, 7)
  assert.equal(GARDEN_LINKS.length, 7)
  assert.equal(gardenUnlocked(universeIds.slice(0, 6)), false)
  assert.equal(gardenUnlocked(universeIds), true)
  const ordinary = availableGardenClosures(universeIds, ['warden'], 'companion')
  assert.deepEqual(ordinary.map((closure) => closure.id), ['warden', 'hunger', 'companion'])
  const reconciled = availableGardenClosures(universeIds, ['warden', 'hunger'], 'companion')
  assert.deepEqual(reconciled.map((closure) => closure.id), ['warden', 'hunger', 'companion', 'continue'])
  assert.ok(gardenCredits('continue').at(-1)?.includes('permanent continuation'))
})

test('v23 save migration preserves F5 records and strips forged progression metadata', () => {
  const scenario = createDevScenario('garden', 50_000)
  assert.ok(scenario)
  const route = generateAtlasRoute(5021, 'canticle')
  const pack = V2_UNIVERSE_BY_ID.get('canticle')!
  const loadout = {
    id: 'loadout-silent-route', name: 'Room to answer', universeId: 'canticle' as const,
    doctrineId: pack.economy.doctrines[3].id,
    wayfinderLawIds: [], archiveShelfId: pack.archive.shelves[1].id,
    vestmentId: THEMES[0].id, anomalyResponseIds: [], automation: 'idle' as const,
  }
  const enriched = {
    ...serializeSaveDataV23(scenario),
    endgame: {
      ...scenario.endgame,
      beaconNames: { canticle: 'The Answering Rest', exploit: 'bad' },
      lawLoadouts: [loadout, { ...loadout, id: '../../bad' }],
      activeLawLoadoutId: loadout.id,
      chronicleEvents: [{ id: 'chronicle-test', universeId: 'canticle', milestone: 'garden', at: 50_000, detail: 'Continue.' }],
      chronicleBests: [{ routeCode: route.code, durationMs: 9_000, completedAt: 50_000 }],
      atlasCompletions: [{ routeCode: route.code, universeId: 'canticle', seed: route.seed, durationMs: 9_000, completedAt: 50_000, replayDigest: atlasReplayDigest(route) }],
      unlockedConvergences: ['first-neighbors', 'exploit'],
      gardenEnding: 'continue',
      gardenSceneSeen: true,
    },
  }
  const clean = migrateAndSanitizeSave(enriched)
  assert.ok(clean)
  assert.deepEqual(clean.endgame.beaconNames, { canticle: 'The Answering Rest' })
  assert.equal(clean.endgame.lawLoadouts.length, 1)
  assert.equal(clean.endgame.activeLawLoadoutId, loadout.id)
  assert.equal(clean.endgame.atlasCompletions.length, 1)
  assert.deepEqual(clean.endgame.unlockedConvergences, ['first-neighbors', 'divided-sky', 'choir-of-weather'])
  assert.equal(clean.endgame.gardenEnding, 'continue')
})

test('endless law matrix soft-caps stacking and has no all-context dominant build', () => {
  assert.equal(softCapLawMultiplier(1.5), 1.5)
  assert.ok(softCapLawMultiplier(20) < 2.7)
  const matrix = buildLawInteractionMatrix()
  assert.deepEqual(validateLawInteractionMatrix(matrix), [])
  assert.equal(detectLawDominance(matrix).some((finding) => finding.dominatesEveryContext), false)
})
