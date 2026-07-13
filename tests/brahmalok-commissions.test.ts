import assert from 'node:assert/strict'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import type { EconomyAmount } from '../src/content/universes/types'
import { BRAHMALOK_V2_PACK } from '../src/content/universes/brahmalok'
import {
  BRAHMALOK_COMMISSION_HOLD_SECONDS,
  BRAHMALOK_COMMISSION_ACTIVE_SECONDS,
  BRAHMALOK_COMMISSION_WAIT_SECONDS,
  BRAHMALOK_LAW_FACTOR_CEILING,
  advanceF4LawState,
  brahmalokCommissionStatus,
  brahmalokMarginModeIndex,
  combineBrahmalokLawFactors,
  f4RateMultiplier,
  openBankedBrahmalokCommission,
  retainedF4LawConfiguration,
  routeBrahmalokKindling,
  selectBrahmalokMarginMode,
  selectBrahmalokMode,
} from '../src/content/universes/f4-runtime'
import {
  FOLIO_RENDER_CAP,
  LOTUS_CENTER_CLEARANCE_PERCENT,
  planBrahmalokCourts,
  planBrahmalokFolioShelf,
  planBrahmalokHeartResponse,
  planBrahmalokPetalWhorls,
} from '../src/render/brahmalok/world-layer'

type NumericLawState = Record<string, EconomyAmount>
const OWNED = { 'brahmalok-kindling-01': 10, 'brahmalok-kindling-07': 1 }

test('Folio Commissions unlock at the Fourfold Loom and remain idle-neutral', () => {
  const locked: NumericLawState = {}
  advanceF4LawState('brahmalok', locked, {}, BRAHMALOK_COMMISSION_WAIT_SECONDS)
  assert.equal(brahmalokCommissionStatus(locked, {}).phase, 'waiting')

  const state: NumericLawState = {}
  const before = f4RateMultiplier('brahmalok', state, OWNED)
  const events = advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_WAIT_SECONDS)
  assert.equal(brahmalokCommissionStatus(state, OWNED).phase, 'active')
  assert.equal(events.foliosEarned, 0)
  assert.equal(f4RateMultiplier('brahmalok', state, OWNED), before)
})

test('a satisfied default profile cannot answer without a deliberate edit', () => {
  const state: NumericLawState = {}
  advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_WAIT_SECONDS)
  const announced = brahmalokCommissionStatus(state, OWNED)
  assert.equal(announced.predicateSatisfied, true)
  assert.equal(announced.answered, false)
  advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_HOLD_SECONDS)
  assert.equal(brahmalokCommissionStatus(state, OWNED).heldSeconds, 0)

  selectBrahmalokMode(state, 0)
  assert.equal(brahmalokCommissionStatus(state, OWNED).answered, true)
  const events = advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_HOLD_SECONDS)
  assert.equal(events.foliosEarned, 1)
  assert.equal(brahmalokCommissionStatus(state, OWNED).phase, 'waiting')
})

test('later Commission tiers require later Archive shelves', () => {
  const state: NumericLawState = { 'brahmalok-commission-index': amountFromNumber(12) }
  assert.equal(brahmalokCommissionStatus(state, OWNED, 0).commission.id, 'seed-unfinished')
  assert.equal(brahmalokCommissionStatus(state, OWNED, 12).commission.id, 'seed-unclosed-folio')
})

test('route-change Commissions count only actual deliberate reroutes', () => {
  const state: NumericLawState = { 'brahmalok-commission-index': amountFromNumber(3) }
  advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_WAIT_SECONDS)
  routeBrahmalokKindling(state, 0, 0)
  assert.equal(brahmalokCommissionStatus(state, OWNED).routeChanges, 0)
  routeBrahmalokKindling(state, 0, 1)
  routeBrahmalokKindling(state, 0, 2)
  routeBrahmalokKindling(state, 0, 3)
  routeBrahmalokKindling(state, 0, 0)
  assert.equal(brahmalokCommissionStatus(state, OWNED).answered, true)
})

test('unanswered Commissions bank for deliberate later review', () => {
  const state: NumericLawState = {}
  advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_WAIT_SECONDS)
  advanceF4LawState('brahmalok', state, OWNED, BRAHMALOK_COMMISSION_ACTIVE_SECONDS)
  assert.equal(brahmalokCommissionStatus(state, OWNED).phase, 'waiting')
  assert.equal(brahmalokCommissionStatus(state, OWNED).bankedCount, 1)
  assert.equal(openBankedBrahmalokCommission(state), true)
  assert.equal(brahmalokCommissionStatus(state, OWNED).phase, 'active')
  assert.equal(brahmalokCommissionStatus(state, OWNED).bankedCount, 0)
})

test('the Fifth Reading is retained and shares one bounded realm combiner', () => {
  const state: NumericLawState = {}
  assert.equal(selectBrahmalokMarginMode(state, 0), true)
  assert.equal(brahmalokMarginModeIndex(state), 0)
  const retained = retainedF4LawConfiguration('brahmalok', state)
  assert.deepEqual(Object.keys(retained), ['brahmalok-margin-mode'])
  assert.equal(combineBrahmalokLawFactors(3.4, 1.6, 1.8), BRAHMALOK_LAW_FACTOR_CEILING)
  assert.ok(f4RateMultiplier('brahmalok', state, OWNED) <= BRAHMALOK_LAW_FACTOR_CEILING)
})

test('the Four Courts, folio shelf, petal sky, and Heart preserve the open center', () => {
  const state: NumericLawState = {}
  routeBrahmalokKindling(state, 0, 3)
  const courts = planBrahmalokCourts(state, OWNED)
  assert.equal(courts.length, 4)
  assert.equal(courts[3].routedOwnership, 10)
  assert.ok(courts.every(({ xPercent, yPercent }) => Math.hypot(xPercent - 50, yPercent - 55) >= LOTUS_CENTER_CLEARANCE_PERCENT))

  const shelf = planBrahmalokFolioShelf(31)
  assert.equal(shelf.folios.length, FOLIO_RENDER_CAP)
  assert.equal(shelf.unrenderedFolios, 7)
  const allOwned = Object.fromEntries(BRAHMALOK_V2_PACK.economy.generators.map(({ id }) => [id, 100]))
  assert.ok(planBrahmalokPetalWhorls(BRAHMALOK_V2_PACK.visual.objects, allOwned).length > 6)
  assert.equal(planBrahmalokHeartResponse(state, OWNED, 0, true).center, 'open-square')
})
