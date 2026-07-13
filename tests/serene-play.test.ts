import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave, serializeSaveDataV23 } from '../src/core/save-data'

const optionsSource = readFileSync(new URL('../src/ui/OptionsPanel.svelte', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
const worldSource = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
const toastSource = readFileSync(new URL('../src/systems/toasts.svelte.ts', import.meta.url), 'utf8')

test('serene presentation choices are global, persistent, and backward compatible', () => {
  const scenario = createDevScenario('tidefall', 10_000)!
  assert.equal(scenario.showAchievementPopups, true)
  assert.equal(scenario.showRoutineToasts, true)
  assert.equal(scenario.showWorldScenery, true)
  assert.equal(scenario.showInteractionEffects, true)

  const quiet = serializeSaveDataV23({
    ...scenario,
    showAchievementPopups: false,
    showRoutineToasts: false,
    showWorldScenery: false,
    showInteractionEffects: false,
  })
  const restoredQuiet = migrateAndSanitizeSave(quiet)!
  assert.equal(restoredQuiet.showAchievementPopups, false)
  assert.equal(restoredQuiet.showRoutineToasts, false)
  assert.equal(restoredQuiet.showWorldScenery, false)
  assert.equal(restoredQuiet.showInteractionEffects, false)

  const oldV23 = { ...quiet } as Record<string, unknown>
  delete oldV23.showAchievementPopups
  delete oldV23.showRoutineToasts
  delete oldV23.showWorldScenery
  delete oldV23.showInteractionEffects
  const restoredOld = migrateAndSanitizeSave(oldV23)!
  assert.equal(restoredOld.showAchievementPopups, true)
  assert.equal(restoredOld.showRoutineToasts, true)
  assert.equal(restoredOld.showWorldScenery, true)
  assert.equal(restoredOld.showInteractionEffects, true)
})

test('Options exposes a master serene preset and independent presentation controls', () => {
  assert.match(optionsSource, />Serene play</)
  assert.match(optionsSource, />Achievement banners</)
  assert.match(optionsSource, />Routine notifications</)
  assert.match(optionsSource, />Kindling &amp; Cabinet scenery</)
  assert.match(optionsSource, />Interaction effects</)
  assert.match(optionsSource, /Actionable power-ups, reset confirmations, and Lumen story lines stay available/)
  assert.deepEqual(compile(optionsSource, { filename: 'OptionsPanel.svelte', generate: 'client' }).warnings, [])
})

test('quiet presentation hides only optional scenery and transient feedback', () => {
  assert.match(appSource, /activeV2Pack && game\.showWorldScenery/)
  assert.match(appSource, /game\.showInteractionEffects\}<PurchaseCeremonyLayer/)
  assert.match(appSource, /setToastPreferences/)
  assert.match(worldSource, /if \(!game\.showInteractionEffects\) return/)
  assert.match(worldSource, /if \(game\.showWorldScenery\)/)
  assert.match(toastSource, /if \(!achievementPopupsEnabled\) return/)
  assert.match(toastSource, /if \(!routineToastsEnabled\) return/)
})
