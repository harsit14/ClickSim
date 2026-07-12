import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const resetSource = readFileSync(new URL('../src/feedback/reset-session.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')

test('hard-reset feedback cleanup names every prior-run channel atomically', () => {
  for (const call of [
    'clearBuffs()',
    'clearToasts()',
    'resetFallingStars()',
    'resetLiveFeedbackRuntime()',
    'combo.streak = 0',
    'combo.lastRewardAt = 0',
  ]) assert.match(resetSource, new RegExp(call.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  assert.match(appSource, /function clearAllTransientUi\(\)[\s\S]*resetSessionFeedback\(\)[\s\S]*offlineGainDismissed = true[\s\S]*transientResetToken \+= 1/)
})
