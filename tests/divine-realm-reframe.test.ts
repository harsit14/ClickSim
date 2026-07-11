import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  DIVINE_REALMS,
  DIVINE_REALM_BY_ID,
  DIVINE_REALM_BY_SAVE_SLOT,
  RESTORED_UNIVERSE_ROUTE,
  SACRED_CONTENT_GUARDRAILS,
  SAVE_STABLE_STORY_ROUTE,
  divineRealmForSaveSlot,
} from '../src/content/divine-realms'
import { universeById } from '../src/content/universes'
import {
  CLOCKWORK_REVELATION_BEATS,
  CLOCKWORK_REVELATION_DURATION_MS,
  CLOCKWORK_REVELATION_TRIGGER,
  clockworkRevelationBeatAt,
  clockworkRevelationAvailable,
  planClockworkRevelation,
} from '../src/content/universes/clockwork/revelation'
import { CLOCKWORK_MAINTENANCE_SIGNALS } from '../src/content/universes/clockwork/maintenance'
import { CLOCKWORK_STORY_SCENES } from '../src/content/universes/clockwork/story'

test('Clockwork remains the final restored universe and the three lokas occupy save-stable slots', () => {
  assert.deepEqual(RESTORED_UNIVERSE_ROUTE, ['emberlight', 'tidefall', 'verdance', 'clockwork'])
  assert.deepEqual(DIVINE_REALMS.map(({ id }) => id), ['brahmalok', 'vishnulok', 'kailash'])
  assert.deepEqual(DIVINE_REALMS.map(({ saveSlotUniverseId }) => saveSlotUniverseId), ['prismata', 'tempest', 'canticle'])
  assert.deepEqual(DIVINE_REALMS.map(({ stablePrefix }) => stablePrefix), ['u5', 'u6', 'u7'])
  assert.deepEqual(SAVE_STABLE_STORY_ROUTE, ['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle'])
  assert.equal(DIVINE_REALM_BY_ID.size, 3)
  assert.equal(DIVINE_REALM_BY_SAVE_SLOT.size, 3)

  for (const realm of DIVINE_REALMS) {
    const currentPack = universeById(realm.saveSlotUniverseId)
    assert.ok(currentPack.generators.every(({ id }) => id.startsWith(`${realm.stablePrefix}-`)))
    if (realm.id === 'brahmalok' || realm.id === 'vishnulok') assert.equal(currentPack.shortName, realm.publicName)
    else assert.notEqual(currentPack.shortName, realm.publicName, 'Unbuilt loka names stay dormant until complete')
    assert.equal(divineRealmForSaveSlot(realm.saveSlotUniverseId)?.id, realm.id)
    assert.ok(realm.sacredPresences.every((presence) => !realm.centralInterface.includes(presence)))
  }
  assert.equal(divineRealmForSaveSlot('clockwork'), null)
})

test('the cultural contract prohibits turning sacred content into ordinary economy objects', () => {
  assert.deepEqual(SACRED_CONTENT_GUARDRAILS, [
    'not-currency', 'not-generator', 'not-upgrade', 'not-boss', 'not-loot',
    'not-joke-achievement', 'not-cabinet-collectible',
  ])
  const canon = readFileSync(new URL('../TRIMURTI_REFRAME.md', import.meta.url), 'utf8')
  assert.match(canon, /Hindu traditions are diverse/)
  assert.match(canon, /never\n\s+currencies, loot, bosses/)
  assert.match(canon, /Saraswati, Lakshmi, and Parvati are not accessories/)
  assert.match(canon, /cultural consultant/)
  assert.match(canon, /No live UI adopts a loka name until/)
  assert.match(canon, /external cultural review remains a release gate/i)
})

test('the Unscheduled Interval is one contiguous, deterministic, accessible revelation', () => {
  assert.equal(CLOCKWORK_REVELATION_TRIGGER.sceneId, 'u4-scene-unscheduled-interval')
  assert.equal(CLOCKWORK_REVELATION_TRIGGER.seenId, CLOCKWORK_REVELATION_TRIGGER.sceneId)
  assert.equal(CLOCKWORK_REVELATION_DURATION_MS, 54_000)
  assert.equal(new Set(CLOCKWORK_REVELATION_BEATS.map(({ id }) => id)).size, CLOCKWORK_REVELATION_BEATS.length)
  assert.equal(CLOCKWORK_MAINTENANCE_SIGNALS.length, 4, 'The one-time revelation is not a recurring signal')

  for (const [index, beat] of CLOCKWORK_REVELATION_BEATS.entries()) {
    assert.ok(beat.durationMs >= 5_000)
    assert.ok(beat.prose.length > 12)
    assert.ok(beat.visualIntent.length > 30)
    assert.ok(beat.reducedMotionIntent.length > 30)
    assert.ok(beat.audioIntent.length > 30)
    assert.ok(beat.accessibleDescription.length > 30)
    if (index > 0) {
      const previous = CLOCKWORK_REVELATION_BEATS[index - 1]
      assert.equal(beat.startsAtMs, previous.startsAtMs + previous.durationMs)
    }
  }

  const seals = CLOCKWORK_REVELATION_BEATS.find(({ id }) => id === 'three-loka-seals')
  assert.deepEqual(seals?.revealsRealms, ['brahmalok', 'vishnulok', 'kailash'])
  assert.match(seals?.accessibleDescription ?? '', /Brahmalok, Vishnulok, and Kailash/)
  assert.ok(CLOCKWORK_STORY_SCENES.some(({ id, kind }) => id === CLOCKWORK_REVELATION_TRIGGER.sceneId && kind === 'beacon'))
  assert.equal(clockworkRevelationBeatAt(0).id, 'schedule-fault')
  assert.equal(clockworkRevelationBeatAt(16_999).id, 'blank-date')
  assert.equal(clockworkRevelationBeatAt(17_000).id, 'witness-arrives')
  assert.equal(clockworkRevelationBeatAt(CLOCKWORK_REVELATION_DURATION_MS).id, 'passage-remains')
  assert.throws(() => clockworkRevelationBeatAt(-1), /finite and nonnegative/)
  assert.throws(() => clockworkRevelationBeatAt(Number.NaN), /finite and nonnegative/)
})

test('the visible revelation owns the viewport and remains replayable from the archive', () => {
  const component = readFileSync(new URL('../src/ui/ClockworkRevelation.svelte', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const archive = readFileSync(new URL('../src/ui/Codex.svelte', import.meta.url), 'utf8')

  assert.match(component, /role="dialog"/)
  assert.match(component, /aria-modal="true"/)
  assert.match(component, /z-index: 40/)
  assert.match(component, /data-realm=\{realm\.id\}/)
  assert.match(component, /replay[\s\S]*Leave remembered interval/)
  assert.match(component, /html\[data-motion='reduced'\]/)
  assert.match(app, /clockworkRevelationAvailable\(game\)/)
  assert.match(app, /acquireGamePause\('story scene'\)/)
  assert.match(archive, /Replay interval/)
})

test('the Clockwork revelation unlock predicate and fallback plan fail closed', () => {
  const complete = {
    beacons: ['clockwork'],
    owned: { 'u4-great-regulator': 1 },
    echoes: ['u4-echo-vulnerable-again'],
  }
  assert.equal(clockworkRevelationAvailable(complete), true)
  assert.equal(clockworkRevelationAvailable({ ...complete, beacons: [] }), false)
  assert.equal(clockworkRevelationAvailable({ ...complete, owned: {} }), false)
  assert.equal(clockworkRevelationAvailable({ ...complete, echoes: [] }), false)

  const full = planClockworkRevelation(12_000, { reducedMotion: false, muted: false })
  const fallback = planClockworkRevelation(12_000, { reducedMotion: true, muted: true })
  assert.equal(full.presentation, 'full')
  assert.equal(full.audio, 'authored')
  assert.equal(fallback.presentation, 'reduced')
  assert.equal(fallback.audio, 'muted-equivalent')
  assert.equal(full.endsAtMs, 66_000)
  assert.deepEqual(fallback.beats, full.beats)
  assert.throws(() => planClockworkRevelation(-1, { reducedMotion: false, muted: false }), /finite and nonnegative/)
  assert.throws(() => planClockworkRevelation(Number.NaN, { reducedMotion: false, muted: false }), /finite and nonnegative/)
})
