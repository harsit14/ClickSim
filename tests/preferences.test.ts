import assert from 'node:assert/strict'
import test from 'node:test'
import {
  motionReduced,
  renderProfile,
  resolveEffectiveVisualQuality,
  resolveVisualQuality,
} from '../src/core/preferences'

test('automatic quality protects constrained mobile devices', () => {
  assert.equal(resolveVisualQuality('auto', {
    width: 390,
    devicePixelRatio: 3,
    hardwareConcurrency: 4,
  }), 'low')

  assert.equal(resolveVisualQuality('auto', {
    width: 1280,
    devicePixelRatio: 2,
    hardwareConcurrency: 6,
  }), 'balanced')

  assert.equal(resolveVisualQuality('auto', {
    width: 1920,
    devicePixelRatio: 1,
    hardwareConcurrency: 4,
  }), 'low')

  assert.equal(resolveVisualQuality('auto', {
    width: 1920,
    devicePixelRatio: 1,
    hardwareConcurrency: 12,
  }), 'high')
})

test('adaptive canvas degradation also lowers DOM scenery while manual choices stay fixed', () => {
  const capableDesktop = { width: 1920, devicePixelRatio: 1, hardwareConcurrency: 12 }
  assert.equal(resolveEffectiveVisualQuality('auto', capableDesktop, 'low'), 'low')
  assert.equal(resolveEffectiveVisualQuality('auto', capableDesktop, 'balanced'), 'balanced')
  assert.equal(resolveEffectiveVisualQuality('high', capableDesktop, 'low'), 'high')
})

test('manual quality choices remain deterministic and enforce distinct budgets', () => {
  const environment = { width: 390, devicePixelRatio: 3, hardwareConcurrency: 2 }
  assert.equal(resolveVisualQuality('high', environment), 'high')
  const high = renderProfile('high', environment)
  const low = renderProfile('low', environment)
  assert.equal(high.fps, 60)
  assert.equal(low.fps, 30)
  assert.ok(high.maxParticles > low.maxParticles)
  assert.ok(high.maxGlimmersPerTier > low.maxGlimmersPerTier)
  assert.ok(high.dprCap > low.dprCap)
})

test('motion follows the operating system unless reduced motion is forced', () => {
  assert.equal(motionReduced('system', false), false)
  assert.equal(motionReduced('system', true), true)
  assert.equal(motionReduced('reduced', false), true)
})
