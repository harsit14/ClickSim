import assert from 'node:assert/strict'
import test from 'node:test'
import {
  planPowerUpSpawn,
  powerUpHasExited,
  type PowerUpSpawnInput,
} from '../src/systems/power-up-spawn'
import { positionOnOmenArc } from '../src/systems/omen-v2'

const BASE: PowerUpSpawnInput = {
  viewportWidth: 1280,
  viewportHeight: 720,
  eventHalfWidth: 52.8,
  eventHalfHeight: 30.4,
  protectedLeft: 368,
  protectedRight: 912,
  protectedTop: 209,
  protectedHeartTop: 297,
  edgeRoll: 0,
  laneRoll: 0.25,
  positionRoll: 0.5,
  speedRoll: 0.5,
  driftRoll: 0.5,
}

test('power-ups travel along the requested top, bottom, or upper-side lanes', () => {
  const top = planPowerUpSpawn({ ...BASE, edgeRoll: 0.1 })
  const bottom = planPowerUpSpawn({ ...BASE, edgeRoll: 0.55 })
  const left = planPowerUpSpawn({ ...BASE, edgeRoll: 0.78 })
  const right = planPowerUpSpawn({ ...BASE, edgeRoll: 0.92 })

  assert.equal(top.edge, 'top')
  assert.ok(top.y >= BASE.eventHalfHeight + 24 && top.vy > 0)
  assert.ok(top.endY <= BASE.viewportHeight - BASE.eventHalfHeight - 24)
  assert.equal(bottom.edge, 'bottom')
  assert.ok(bottom.y <= BASE.viewportHeight - BASE.eventHalfHeight - 24 && bottom.vy < 0)
  assert.ok(bottom.endY >= BASE.eventHalfHeight + 24)
  for (const vertical of [top, bottom]) {
    assert.ok(
      vertical.x + BASE.eventHalfWidth <= BASE.protectedLeft
      || vertical.x - BASE.eventHalfWidth >= BASE.protectedRight,
    )
    assert.equal(vertical.vx, 0)
    assert.ok(vertical.durationMs >= 15_000)
  }
  assert.equal(left.edge, 'left')
  assert.ok(left.x >= BASE.eventHalfWidth + 24 && left.vx > 0)
  assert.equal(right.edge, 'right')
  assert.ok(right.x <= BASE.viewportWidth - BASE.eventHalfWidth - 24 && right.vx < 0)
  for (const side of [left, right]) {
    assert.ok(side.y - BASE.eventHalfHeight >= BASE.protectedTop)
    assert.ok(side.y + BASE.eventHalfHeight <= BASE.viewportHeight / 2)
  }
})

test('every deterministic side sample stays in the top half with a slow bowed crossing', () => {
  for (let index = 0; index < 100; index++) {
    const positionRoll = index / 100
    for (const edgeRoll of [0.78, 0.92]) {
      const plan = planPowerUpSpawn({ ...BASE, edgeRoll, positionRoll, speedRoll: positionRoll })
      assert.ok(plan.y + BASE.eventHalfHeight <= BASE.viewportHeight / 2)
      assert.ok(Math.abs(plan.vx) >= 32 && Math.abs(plan.vx) < 42)
      assert.equal(plan.vy, 0)
      assert.ok(plan.arcY <= -8 && plan.arcY >= -12)
      assert.ok(plan.durationMs >= 25_000)
      const distanceBeforeCenterLane = edgeRoll < 0.85
        ? BASE.protectedLeft - BASE.eventHalfWidth - plan.x
        : plan.x - (BASE.protectedRight + BASE.eventHalfWidth)
      assert.ok(distanceBeforeCenterLane / Math.abs(plan.vx) >= 5)
      for (let step = 0; step <= 20; step++) {
        const point = positionOnOmenArc(plan, step / 20)
        assert.ok(point.x - BASE.eventHalfWidth >= 23.99)
        assert.ok(point.x + BASE.eventHalfWidth <= BASE.viewportWidth - 23.99)
        assert.ok(point.y - BASE.eventHalfHeight >= BASE.protectedTop)
        assert.ok(point.y + BASE.eventHalfHeight <= BASE.viewportHeight / 2)
      }
    }
  }
})

test('entry-specific exit checks allow a full traversal before despawning', () => {
  assert.equal(powerUpHasExited('top', 300, 700, 1280, 720, 52.8, 30.4), false)
  assert.equal(powerUpHasExited('top', 300, 810, 1280, 720, 52.8, 30.4), true)
  assert.equal(powerUpHasExited('bottom', 300, -90, 1280, 720, 52.8, 30.4), true)
  assert.equal(powerUpHasExited('left', 1390, 300, 1280, 720, 52.8, 30.4), true)
  assert.equal(powerUpHasExited('right', -110, 300, 1280, 720, 52.8, 30.4), true)
})
