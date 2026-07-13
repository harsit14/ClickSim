import assert from 'node:assert/strict'
import test from 'node:test'
import { universeById, universeV2ById } from '../src/content/universes'
import {
  completedGeneratorPurchaseFeedback,
  crossedOwnershipThreshold,
} from '../src/feedback'

const pack = universeV2ById('emberlight')!
const generator = universeById('emberlight').generators[0]
const amount = (mantissa: number, exponent = 0) => ({ mantissa, exponent })

test('ownership feedback reports the highest threshold crossed by one purchase', () => {
  assert.equal(crossedOwnershipThreshold(0, 1), 1)
  assert.equal(crossedOwnershipThreshold(1, 10), 10)
  assert.equal(crossedOwnershipThreshold(9, 50), 50)
  assert.equal(crossedOwnershipThreshold(50, 99), null)
  assert.equal(crossedOwnershipThreshold(99, 100), 100)
})

test('completed generator purchases share semantic quantity and milestone meaning', () => {
  const single = completedGeneratorPurchaseFeedback({
    pack,
    generator,
    ownedBefore: 1,
    quantity: 1,
    totalCost: amount(1.5, 1),
    rateDelta: amount(3, -1),
    occurredAtMs: 123.9,
  })
  assert.equal(single.milestoneThreshold, null)
  assert.equal(single.event.id, 'emberlight-purchase-spark-123')
  assert.equal(single.event.quantity, 1)
  assert.equal(single.event.tier, 1)
  assert.equal(single.event.aggregation, undefined)
  assert.equal(single.event.audioCue, pack.audio.purchaseIntervalCue)
  assert.ok(single.event.announcement?.messageKey.endsWith('.announcement.purchase'))

  const bulk = completedGeneratorPurchaseFeedback({
    pack,
    generator,
    ownedBefore: 9,
    quantity: 10,
    totalCost: amount(2.5, 2),
    rateDelta: amount(3, 0),
    occurredAtMs: 456,
  })
  assert.equal(bulk.milestoneThreshold, 10)
  assert.equal(bulk.event.quantity, 10)
  assert.equal(bulk.event.tier, 2)
  assert.equal(bulk.event.aggregation?.count, 10)
})
