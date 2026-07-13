import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import { CLOCKWORK_KINDLING_IDS } from '../src/content/universes/clockwork/routing'
import {
  CLOCKWORK_MACHINE_SEATS,
  buildClockworkFlagshipScene,
  clockworkKindlingIdsAreCovered,
  formatClockworkScheduleDuration,
} from '../src/render/clockwork/flagship-scene'
import {
  CROSSING_FIRST_ARRIVAL_DURATION_MS,
  CROSSING_FIRST_ARRIVAL_PHASES,
  CROSSING_REVISIT_DURATION_MS,
  crossingCeremonyLine,
  crossingCeremonyPhaseAt,
  crossingHabitBreaks,
  crossingVocabularyStumble,
} from '../src/experience/crossing-arrival'
import type { UniverseId } from '../src/content/universes/types'
import {
  TIDEFALL_SET_PIECES,
  tidefallOwnershipThreshold,
  tidefallSetPieceStage,
} from '../src/render/tidefall/set-piece-registry'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('Phase 5 starts Tidefall with nine authored families covering every Kindling once', () => {
  assert.equal(TIDEFALL_SET_PIECES.length, 9)
  const stages = TIDEFALL_SET_PIECES.flatMap((piece) => piece.stages)
  assert.equal(stages.length, 18)
  assert.deepEqual(
    stages.map((stage) => stage.sourceId).sort(),
    TIDEFALL_V2_PACK.economy.generators.map((generator) => generator.id).sort(),
  )
  assert.equal(new Set(stages.map((stage) => stage.objectId)).size, 18)
  assert.equal(new Set(stages.map((stage) => stage.paths.map((path) => path.d).join('|'))).size, 18)
  for (const stage of stages) {
    assert.equal(tidefallSetPieceStage(stage.objectId), stage)
    assert.notEqual(stage.entrance, 'fade')
  }
})

test('Tidefall ownership changes structure at the shared 1/10/25/50/100 thresholds', () => {
  assert.equal(tidefallOwnershipThreshold(0), null)
  assert.equal(tidefallOwnershipThreshold(1), 1)
  assert.equal(tidefallOwnershipThreshold(10), 10)
  assert.equal(tidefallOwnershipThreshold(25), 25)
  assert.equal(tidefallOwnershipThreshold(50), 50)
  assert.equal(tidefallOwnershipThreshold(100), 100)
  assert.equal(tidefallOwnershipThreshold(10_000), 100)
})

test('Tidefall is an inverted ocean world, not a set of orbital current ellipses', () => {
  const layer = read('../src/ui/TidefallFlagshipLayer.svelte')
  const manifest = read('../src/ui/ManifestWorldLayer.svelte')
  assert.deepEqual(compile(layer, { filename: 'TidefallFlagshipLayer.svelte', generate: 'client' }).warnings, [])
  assert.match(layer, /class="inverted-ocean"/)
  assert.match(layer, /class="surface-line"/)
  assert.match(layer, /class="abyss"/)
  assert.match(layer, /class="trench-horizon"/)
  assert.match(layer, /data-tide-state=\{tide\.id\}/)
  assert.match(layer, /--tide-lift:/)
  assert.match(manifest, /import TidefallFlagshipLayer/)
  assert.match(manifest, /<TidefallFlagshipLayer/)
  assert.doesNotMatch(manifest, /class="tide-current/)
  assert.doesNotMatch(manifest, /class="tide-caustic/)
})

test('Leviathan is a horizon passage with three forecast wakes and a reduced-motion hold', () => {
  const layer = read('../src/ui/TidefallFlagshipLayer.svelte')
  const manifest = read('../src/ui/ManifestWorldLayer.svelte')
  assert.match(layer, /data-leviathan-passage="active"/)
  assert.match(layer, /class="leviathan-body"/)
  assert.match(layer, /<i>1<\/i><i>2<\/i><i>3<\/i>/)
  assert.match(layer, /@keyframes leviathan-crossing/)
  assert.match(layer, /\.motion-paused \.leviathan-passage/)
  assert.match(manifest, /activeOmenIdSet\.has\('leviathan-passage'\)/)
})

test('Tidefall keeps the authored ocean translucent so native canvas pulse and glow survive', () => {
  const layer = read('../src/ui/TidefallFlagshipLayer.svelte')
  assert.match(layer, /rgba\(7, 28, 40, 0\.28\)/)
  assert.match(layer, /rgba\(0, 4, 10, 0\.62\)/)
  assert.doesNotMatch(layer, /linear-gradient\(180deg, #071c28/)
})

test('Clockwork assigns all eighteen stable Kindlings to Heart-clear machine addresses', () => {
  assert.equal(CLOCKWORK_MACHINE_SEATS.length, 18)
  assert.equal(clockworkKindlingIdsAreCovered(), true)
  assert.deepEqual(
    CLOCKWORK_MACHINE_SEATS.map(({ id }) => id).sort(),
    [...CLOCKWORK_KINDLING_IDS].sort(),
  )
  assert.equal(new Set(CLOCKWORK_MACHINE_SEATS.map(({ id }) => id)).size, 18)
  for (const seat of CLOCKWORK_MACHINE_SEATS) {
    assert.ok(seat.x <= 74, `${seat.id} enters the Kindling-shop lane`)
    assert.ok(Math.hypot(seat.x - 50, seat.y - 62) > 10, `${seat.id} enters the Heart clearance`)
  }
})

test('Clockwork converts its real civic DAG into physical directional linkages', () => {
  const owned = Object.fromEntries(CLOCKWORK_KINDLING_IDS.map((id) => [id, 50]))
  const scene = buildClockworkFlagshipScene(owned, 60_000)
  assert.equal(scene.machines.length, 18)
  assert.equal(scene.routes.length, 17)
  assert.deepEqual(new Set(scene.routes.map(({ kind }) => kind)), new Set(['power', 'cadence', 'efficiency']))
  for (const route of scene.routes) {
    assert.match(route.path, /^M [-\d.]+ [-\d.]+ L /)
    assert.doesNotMatch(route.path, /[CQAS]/)
  }
  assert.equal(scene.schedule.length, 4)
  assert.equal(scene.schedule[0].status, 'active')
  assert.equal(formatClockworkScheduleDuration(125_000), '2:05')
})

test('Clockwork flagship is a machine floor and tower with stepped torque and a printed schedule', () => {
  const layer = read('../src/ui/ClockworkFlagshipLayer.svelte')
  const manifest = read('../src/ui/ManifestWorldLayer.svelte')
  assert.deepEqual(compile(layer, { filename: 'ClockworkFlagshipLayer.svelte', generate: 'client' }).warnings, [])
  assert.match(layer, /class="machine-floor"/)
  assert.match(layer, /class="escapement-tower"/)
  assert.match(layer, /class="physical-linkages"/)
  assert.match(layer, /class="schedule-card"/)
  assert.match(layer, /data-route-kind=\{route\.kind\}/)
  assert.match(layer, /@keyframes torque-index/)
  assert.match(layer, /animation: torque-index 1\.6s steps\(8, end\)/)
  assert.match(layer, /Printed Maintenance Signal schedule/)
  assert.match(layer, /left: 1rem; top: 4\.2rem;/)
  assert.doesNotMatch(layer, /left: 1rem; top: 1rem;/)
  assert.match(manifest, /import ClockworkFlagshipLayer/)
  assert.match(manifest, /<ClockworkFlagshipLayer/)
  assert.doesNotMatch(manifest, /class="clockwork-gear/)
  assert.doesNotMatch(manifest, /class="clockwork-chapter-ring/)
})

test('Phase 5.3 first arrival is one contiguous twenty-second six-beat Crossing', () => {
  assert.equal(CROSSING_FIRST_ARRIVAL_DURATION_MS, 20_000)
  assert.equal(CROSSING_REVISIT_DURATION_MS, 6_800)
  assert.deepEqual(CROSSING_FIRST_ARRIVAL_PHASES.map(({ id }) => id), [
    'departure', 'between', 'wrong-foot', 'translation', 'arrival', 'ready',
  ])
  assert.equal(crossingCeremonyPhaseAt(6_799, true).id, 'between')
  assert.equal(crossingCeremonyPhaseAt(6_800, true).id, 'wrong-foot')
  assert.equal(crossingCeremonyPhaseAt(19_999, true).id, 'arrival')
  assert.equal(crossingCeremonyPhaseAt(20_000, true).id, 'ready')
  assert.equal(crossingCeremonyPhaseAt(6_799, false).id, 'arrival')
  assert.equal(crossingCeremonyPhaseAt(6_800, false).id, 'ready')
})

test('every world owns a vocabulary correction and three habit breaks inside ten minutes', () => {
  const ids: readonly UniverseId[] = ['emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash']
  for (const id of ids) {
    const moments = crossingHabitBreaks(id)
    assert.equal(moments.length, 3)
    assert.equal(new Set(moments.map(({ id: momentId }) => momentId)).size, 3)
    assert.ok(moments.every(({ atMs }) => atMs > 0 && atMs <= 600_000))
  }
  assert.match(crossingVocabularyStumble('Emberlight', 'kindle', 'Tidefall', 'surface'), /kindle— no[\s\S]*we surface/)
  assert.match(crossingCeremonyLine('wrong-foot', {
    sourceName: 'Emberlight', targetName: 'Tidefall', targetArrival: 'water rises', sourceVerb: 'kindle', targetVerb: 'surface',
  }), /old verb follows us one beat too far/)
})

test('Crossing UI and consumers wire ceremony, wrong sound, stumble, and timed habit breaks', () => {
  const crossing = read('../src/ui/CrossingPrelude.svelte')
  const app = read('../src/App.svelte')
  const canvas = read('../src/ui/EmberCanvas.svelte')
  const lumen = read('../src/ui/LumenTicker.svelte')
  const audio = read('../src/audio/sfx.ts')
  const runtime = read('../src/experience/crossing-arrival.svelte.ts')
  assert.deepEqual(compile(crossing, { filename: 'CrossingPrelude.svelte', generate: 'client' }).warnings, [])
  assert.match(crossing, /data-duration-ms=\{durationMs\}/)
  assert.match(crossing, /data-crossing-phase=\{phase\.id\}/)
  assert.match(crossing, /crossing-speed/)
  assert.match(crossing, /class="wrong-foot-mark"/)
  assert.match(app, /beginCrossingArrival\(/)
  assert.match(app, /completeCrossingArrival\(game\.activeUniverse\)/)
  assert.match(canvas, /consumeCrossingWrongClick\(game\.activeUniverse\)/)
  assert.match(lumen, /consumeCrossingLumenStumble\(universeId\)/)
  assert.match(lumen, /consumeCrossingHabitBreak\(universeId, wallNow\)/)
  assert.match(runtime, /wrongClickPending = active\.firstArrival/)
  assert.match(runtime, /stumblePending = active\.firstArrival/)
  assert.match(audio, /function playVerdanceClick\(/)
  assert.match(audio, /function playClockworkClick\(/)
})
