import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatGoalDuration,
  resolveEmberUiText,
  resolveUniverseUiText,
} from '../src/experience/ember-ui-text'

test('Ember UI text resolves parameters and readable contract fallbacks', () => {
  assert.equal(resolveEmberUiText('goal-lens.title'), 'Ember Compass')
  assert.equal(resolveEmberUiText('goal-lens.kindling', { name: 'Spark' }), 'Kindle Spark')
  assert.equal(resolveEmberUiText('reset.category.deep-collapse-count'), 'Deep collapse count')
})

test('goal durations stay compact and reject invalid estimates', () => {
  assert.equal(formatGoalDuration(0), 'ready now')
  assert.equal(formatGoalDuration(45_000), 'about 45s')
  assert.equal(formatGoalDuration(12 * 60_000), 'about 12m')
  assert.equal(formatGoalDuration(90 * 60_000), 'about 1h 30m')
  assert.equal(formatGoalDuration(Number.NaN), 'time unavailable')
})

test('Tidefall presents its local Epoch names without changing canonical keys', () => {
  assert.equal(resolveUniverseUiText('tidefall', 'reset.action.epoch-turn'), 'Undertow')
  assert.equal(resolveUniverseUiText('tidefall', 'reset.category.epoch-matter'), 'Moon Salt (Epoch Matter)')
  assert.equal(resolveUniverseUiText('tidefall', 'goal-lens.title'), 'Current Chart')
  assert.equal(resolveUniverseUiText('tidefall', 'goal-lens.supernova'), 'Preview the Undertow')
  assert.equal(resolveUniverseUiText('emberlight', 'reset.action.epoch-turn'), 'Supernova')
})
