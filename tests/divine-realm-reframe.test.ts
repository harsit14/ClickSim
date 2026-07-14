import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  DIVINE_REALMS,
  DIVINE_REALM_BY_ID,
  RESTORED_UNIVERSE_ROUTE,
  SACRED_CONTENT_GUARDRAILS,
  STORY_ROUTE,
  divineRealmById,
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

test('Clockwork remains the final restored universe and the three lokas use canonical IDs', () => {
  assert.deepEqual(RESTORED_UNIVERSE_ROUTE, ['emberlight', 'tidefall', 'verdance', 'clockwork'])
  assert.deepEqual(DIVINE_REALMS.map(({ id }) => id), ['brahmalok', 'vishnulok', 'kailash'])
  assert.deepEqual(STORY_ROUTE, ['emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash'])
  assert.equal(DIVINE_REALM_BY_ID.size, 3)

  for (const realm of DIVINE_REALMS) {
    const currentPack = universeById(realm.id)
    assert.ok(currentPack.generators.every(({ id }) => id.startsWith(`${realm.id}-`)))
    assert.equal(currentPack.shortName, realm.publicName)
    assert.equal(divineRealmById(realm.id)?.id, realm.id)
    assert.ok(realm.sacredPresences.every((presence) => !realm.centralInterface.includes(presence)))
  }
  assert.equal(divineRealmById('clockwork'), null)
})

test('the cultural contract prohibits turning sacred content into ordinary economy objects', () => {
  assert.deepEqual(SACRED_CONTENT_GUARDRAILS, [
    'not-currency', 'not-generator', 'not-upgrade', 'not-boss', 'not-loot',
    'not-joke-achievement', 'not-cabinet-collectible',
  ])
  const canon = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  assert.match(canon, /Hindu traditions are diverse/)
  assert.match(canon, /Sacred beings and attributes are never currencies, generators, upgrades, enemies, bosses, loot/)
  assert.match(canon, /Saraswati, Lakshmi, and Parvati are not accessories/)
  assert.match(canon, /qualified cultural consultant/)
  assert.match(canon, /Public loka names may appear in live UI only after/)
  assert.match(canon, /External cultural review remains a release gate/i)
})

test('the Unscheduled Interval is one contiguous, deterministic, accessible revelation', () => {
  assert.equal(CLOCKWORK_REVELATION_TRIGGER.sceneId, 'clockwork-scene-unscheduled-interval')
  assert.equal(CLOCKWORK_REVELATION_TRIGGER.seenId, CLOCKWORK_REVELATION_TRIGGER.sceneId)
  assert.equal(CLOCKWORK_REVELATION_DURATION_MS, 63_000)
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
  const seam = CLOCKWORK_REVELATION_BEATS.find(({ id }) => id === 'law-thins')
  const forecasts = CLOCKWORK_REVELATION_BEATS.find(({ id }) => id === 'forecasts-reclassified')
  const passage = CLOCKWORK_REVELATION_BEATS.find(({ id }) => id === 'passage-remains')
  assert.deepEqual(seals?.revealsRealms, ['brahmalok', 'vishnulok', 'kailash'])
  assert.deepEqual(seam?.revealsRealms, [])
  assert.match(seam?.prose ?? '', /not another planet/i)
  assert.match(seam?.prose ?? '', /heat forgets shape/i)
  assert.match(seam?.archiveNote ?? '', /I found the seam[\s\S]*I did not make/i)
  assert.match(seals?.accessibleDescription ?? '', /Brahmalok, Vishnulok, and Kailash/)
  const bridge = [forecasts, seals, passage]
    .flatMap((beat) => beat ? [beat.prose, beat.visualIntent, beat.accessibleDescription] : [])
    .join(' ')
  assert.match(bridge, /pre-existing|already exist|existed before/i)
  assert.match(bridge, /older archive traces|archive discovered|helped us find/i)
  assert.doesNotMatch(bridge, /Lumen (?:made|created|authored|ordered) (?:the )?(?:three )?lokas/i)
  assert.ok(CLOCKWORK_STORY_SCENES.some(({ id, kind }) => id === CLOCKWORK_REVELATION_TRIGGER.sceneId && kind === 'beacon'))
  assert.equal(clockworkRevelationBeatAt(0).id, 'schedule-fault')
  assert.equal(clockworkRevelationBeatAt(16_999).id, 'blank-date')
  assert.equal(clockworkRevelationBeatAt(17_000).id, 'witness-arrives')
  assert.equal(clockworkRevelationBeatAt(26_000).id, 'law-thins')
  assert.equal(clockworkRevelationBeatAt(35_000).id, 'forecasts-reclassified')
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
    owned: { 'clockwork-great-regulator': 1 },
    echoes: ['clockwork-echo-vulnerable-again'],
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
  assert.equal(full.endsAtMs, 75_000)
  assert.deepEqual(fallback.beats, full.beats)
  assert.throws(() => planClockworkRevelation(-1, { reducedMotion: false, muted: false }), /finite and nonnegative/)
  assert.throws(() => planClockworkRevelation(Number.NaN, { reducedMotion: false, muted: false }), /finite and nonnegative/)
})
