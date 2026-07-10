import assert from 'node:assert/strict'
import test from 'node:test'
import {
  heartBaseRadius,
  heartHitRadius,
  heartMaximumHitRadius,
  pointInsideHeartTarget,
  rectIntersectsHeartTarget,
} from '../src/render/heart-target'

test('the opening Heart remains substantial across supported viewports', () => {
  assert.equal(heartBaseRadius(390, 844), 42)
  assert.ok(Math.abs(heartBaseRadius(1280, 720) - 46.8) < 1e-9)
  assert.equal(heartBaseRadius(2048, 1117), 54)
})

test('the click target is larger than the visible Heart and includes its boundary', () => {
  const coreRadius = heartBaseRadius(1280, 720)
  const hitRadius = heartHitRadius(coreRadius)
  assert.equal(hitRadius, coreRadius * 1.75)
  assert.ok(hitRadius > coreRadius)
  assert.equal(pointInsideHeartTarget({ x: hitRadius, y: 0 }, { x: 0, y: 0 }, coreRadius), true)
  assert.equal(pointInsideHeartTarget({ x: hitRadius + 0.01, y: 0 }, { x: 0, y: 0 }, coreRadius), false)
})

test('interactive rectangles stay clear of the maximum progression hit halo', () => {
  const viewport = { width: 1280, height: 720 }
  const radius = heartMaximumHitRadius(viewport)
  assert.ok(radius > heartHitRadius(heartBaseRadius(viewport.width, viewport.height)))
  assert.equal(rectIntersectsHeartTarget({ x: 620, y: 330, width: 40, height: 40 }, viewport), true)
  assert.equal(rectIntersectsHeartTarget({ x: 40, y: 600, width: 40, height: 40 }, viewport), false)
})
