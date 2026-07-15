import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { planClockworkHeartResponse } from '../src/content/universes/clockwork/heart'
import {
  CLOCKWORK_MAINTENANCE_SIGNALS,
  clockworkMaintenanceOccurrenceKey,
  clockworkMaintenanceSignalStateAt,
  clockworkMaintenanceTimeline,
  nextClockworkMaintenanceOccurrence,
} from '../src/content/universes/clockwork/maintenance'
import { planClockworkRewinding } from '../src/content/universes/clockwork/rewinding'

test('Maintenance Signals expose exact deterministic forecast and active boundaries', () => {
  const maintenance = CLOCKWORK_MAINTENANCE_SIGNALS[0]
  assert.deepEqual(clockworkMaintenanceSignalStateAt(maintenance, 0), {
    signalId: 'clockwork-maintenance-window',
    status: 'forecast',
    cycleIndex: 0,
    startsAtMs: 60_000,
    endsAtMs: 105_000,
    remainingMs: 60_000,
    warningVisible: true,
  })
  assert.equal(clockworkMaintenanceSignalStateAt(maintenance, 60_000).status, 'active')
  assert.equal(clockworkMaintenanceSignalStateAt(maintenance, 104_999).remainingMs, 1)
  assert.equal(clockworkMaintenanceSignalStateAt(maintenance, 105_000).startsAtMs, 360_000)
  assert.throws(() => clockworkMaintenanceSignalStateAt(maintenance, Number.NaN), /finite/)
})

test('the combined Maintenance timeline is sorted, repeatable, and caller-bounded', () => {
  const first = clockworkMaintenanceTimeline(0, 40 * 60_000)
  const second = clockworkMaintenanceTimeline(0, 40 * 60_000)
  assert.deepEqual(first, second)
  assert.ok(first.length > 4)
  assert.ok(first.every((entry, index) => index === 0 || first[index - 1].startsAtMs <= entry.startsAtMs))
  assert.equal(new Set(first.map(({ signalId }) => signalId)).size, 4)
  assert.throws(() => clockworkMaintenanceTimeline(0, -1), /nonnegative/)
})

test('the event layer can consume each deterministic Maintenance occurrence once', () => {
  const first = nextClockworkMaintenanceOccurrence(0)
  assert.ok(first)
  assert.equal(first.signalId, 'clockwork-maintenance-window')
  assert.equal(first.startsAtMs, 60_000)
  assert.equal(first.key, clockworkMaintenanceOccurrenceKey(first))

  const duringFirst = nextClockworkMaintenanceOccurrence(60_000)
  assert.equal(duringFirst?.key, first.key)
  const afterHandling = nextClockworkMaintenanceOccurrence(60_000, new Set([first.key]))
  assert.equal(afterHandling?.signalId, 'clockwork-noon-alignment')
  assert.equal(afterHandling?.startsAtMs, 180_000)
})

test('Clockwork scheduled signals and cadence criticals are wired into the live interaction layers', () => {
  const events = readFileSync(new URL('../src/ui/FallingStar.svelte', import.meta.url), 'utf8')
  const game = readFileSync(new URL('../src/engine/game.svelte.ts', import.meta.url), 'utf8')
  const stats = readFileSync(new URL('../src/ui/StatsPanel.svelte', import.meta.url), 'utf8')
  assert.match(events, /nextClockworkMaintenanceOccurrence/)
  assert.match(events, /universe\.id !== 'clockwork'/)
  assert.match(events, /handledClockworkOccurrences\.add/)
  assert.match(game, /criticalClickOccurs/)
  assert.match(stats, /crit cadence/)
})

test('Rewinding releases five semantic phases and returns Mainsprings in every presentation mode', () => {
  const authored = planClockworkRewinding(1_000, { reducedMotion: false, lowQuality: false })
  const reduced = planClockworkRewinding(1_000, { reducedMotion: true, lowQuality: false })
  const low = planClockworkRewinding(1_000, { reducedMotion: false, lowQuality: true })
  assert.equal(authored.localName, 'Rewinding')
  assert.equal(authored.rewardName, 'Mainsprings')
  assert.deepEqual(authored.phases.map(({ id }) => id), [
    'train-disengagement', 'reverse-release', 'zero-index', 'perfect-interval-lock', 'first-tooth-restart',
  ])
  assert.ok(authored.phases.every(({ presentation }) => presentation === 'authored-motion'))
  assert.ok(reduced.phases.every(({ presentation }) => presentation === 'crossfade'))
  assert.ok(low.phases.every(({ presentation }) => presentation === 'indexed-stills'))
  assert.equal(authored.endsAtMs, reduced.endsAtMs)
  assert.equal(authored.endsAtMs, low.endsAtMs)
})

test('Escapement Heart response always engages, releases, and transmits without random branches', () => {
  const authored = planClockworkHeartResponse(0, false)
  const reduced = planClockworkHeartResponse(0, true)
  assert.deepEqual(authored.phases.map(({ id }) => id), ['engage-tooth', 'release-pallet', 'transmit-torque'])
  assert.deepEqual(reduced.phases.map(({ id }) => id), ['engage-tooth', 'release-pallet', 'transmit-torque'])
  assert.equal(authored.audioCue, 'clockwork-heart-engage')
  assert.ok(reduced.endsAtMs < authored.endsAtMs)
  assert.ok(reduced.phases.every(({ shapeCue }) => shapeCue.length > 0))
  assert.throws(() => planClockworkHeartResponse(-1, false), /nonnegative/)
})
