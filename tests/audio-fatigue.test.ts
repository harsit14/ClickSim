import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  FOCUS_MUSIC_MULTIPLIER,
  MUSIC_PROFILES,
  musicBarPlan,
  musicFocusModeActive,
  setMusicFocusMode,
} from '../src/audio/music'
import {
  AUDIO_SPACE_PROFILES,
  currentAudioSpace,
  setAudioSpace,
} from '../src/audio/sfx'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave, serializeSaveDataV23 } from '../src/core/save-data'

const optionsSource = readFileSync(new URL('../src/ui/OptionsPanel.svelte', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')

test('every realm score owns an eight-to-sixteen-bar form with authored breathing room', () => {
  for (const [mode, profile] of Object.entries(MUSIC_PROFILES)) {
    assert.ok([8, 12, 16].includes(profile.formBars), mode)
    assert.ok(profile.emptyBars.length >= 1, mode)
    assert.ok(profile.emptyBars.every((bar) => bar >= 0 && bar < profile.formBars), mode)
    const plan = Array.from({ length: profile.formBars }, (_, bar) => musicBarPlan(mode as keyof typeof MUSIC_PROFILES, bar, 1))
    assert.equal(plan.filter((bar) => bar.empty).length, profile.emptyBars.length, mode)
    assert.ok(new Set(plan.map((bar) => bar.phrase)).size >= 2, mode)
  }
})

test('arrangement density advances legibly with distinct Kindling ownership', () => {
  assert.equal(musicBarPlan('emberlight', 0, 0).densityStage, 0)
  assert.equal(musicBarPlan('emberlight', 0, 0.2).densityStage, 1)
  assert.equal(musicBarPlan('emberlight', 0, 0.5).densityStage, 2)
  assert.equal(musicBarPlan('emberlight', 0, 1).densityStage, 3)
  assert.equal(musicBarPlan('emberlight', 7, 1).empty, true)
  assert.notEqual(musicBarPlan('emberlight', 0, 1).harmonicIndex, musicBarPlan('emberlight', 4, 1).harmonicIndex)
  assert.match(appSource, /setMusicOwnershipDensity\(ids\.filter/)
})

test('Kailash Long Rest keeps one summit tone per four bars', () => {
  const form = Array.from({ length: 8 }, (_, bar) => musicBarPlan('kailash', bar, 1, true))
  assert.deepEqual(form.filter((bar) => !bar.empty).map((bar) => bar.formBar), [0, 4])
})

test('Focus Mode ducks only music and persists for old and current saves', () => {
  assert.ok(FOCUS_MUSIC_MULTIPLIER > 0 && FOCUS_MUSIC_MULTIPLIER <= 0.35)
  setMusicFocusMode(true)
  assert.equal(musicFocusModeActive(), true)
  setMusicFocusMode(false)
  assert.equal(musicFocusModeActive(), false)

  const scenario = createDevScenario('tidefall', 10_000)!
  const focused = migrateAndSanitizeSave(serializeSaveDataV23({ ...scenario, audioFocusMode: true }))!
  assert.equal(focused.audioFocusMode, true)
  const oldWire = serializeSaveDataV23(scenario) as unknown as Record<string, unknown>
  delete oldWire.audioFocusMode
  assert.equal(migrateAndSanitizeSave(oldWire)?.audioFocusMode, false)

  assert.match(optionsSource, />Focus mode</)
  assert.match(optionsSource, /keeping effects and the visual beat guide clear/)
  assert.match(optionsSource, /setMusicFocusMode\(game\.audioFocusMode\)/)
  assert.deepEqual(compile(optionsSource, { filename: 'OptionsPanel.svelte', generate: 'client' }).warnings, [])
})

test('world, archive, and Deep share one progressively descending spatial bus', () => {
  assert.ok(AUDIO_SPACE_PROFILES.world.lowPassHz > AUDIO_SPACE_PROFILES.archive.lowPassHz)
  assert.ok(AUDIO_SPACE_PROFILES.archive.lowPassHz > AUDIO_SPACE_PROFILES.deep.lowPassHz)
  assert.ok(AUDIO_SPACE_PROFILES.world.reverbWet < AUDIO_SPACE_PROFILES.archive.reverbWet)
  assert.ok(AUDIO_SPACE_PROFILES.archive.reverbWet < AUDIO_SPACE_PROFILES.deep.reverbWet)
  setAudioSpace('archive')
  assert.equal(currentAudioSpace(), 'archive')
  setAudioSpace('deep')
  assert.equal(currentAudioSpace(), 'deep')
  setAudioSpace('world')
  assert.equal(currentAudioSpace(), 'world')
  assert.match(appSource, /shell\.panels\.codex \|\| shell\.panels\.curiosities/)
})
