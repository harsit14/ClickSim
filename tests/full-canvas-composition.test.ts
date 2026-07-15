import assert from 'node:assert/strict'
import test from 'node:test'
import { BRAHMALOK_V2_PACK } from '../src/content/universes/brahmalok'
import { KAILASH_V2_PACK } from '../src/content/universes/kailash'
import { VERDANCE_V2_PACK } from '../src/content/universes/verdance'
import { VISHNULOK_V2_PACK } from '../src/content/universes/vishnulok'
import { planBrahmalokCourts } from '../src/render/brahmalok/world-layer'
import { CLOCKWORK_MACHINE_SEATS } from '../src/render/clockwork/flagship-scene'
import {
  buildEmberlightFlagshipScene,
  EMBERLIGHT_LIFECYCLE_SEATS,
} from '../src/render/emberlight/flagship-scene'
import { planKailashFormations } from '../src/render/kailash/world-layer'
import { TIDEFALL_FAMILY_SEATS } from '../src/render/tidefall/set-piece-registry'
import { planVerdanceGroves } from '../src/render/verdance/world-layer'
import { planVishnulokShelters } from '../src/render/vishnulok/world-layer'

function fullOwnership(generatorIds: readonly string[]): Readonly<Record<string, number>> {
  return Object.fromEntries(generatorIds.map((id) => [id, 100]))
}

function assertUsesFullCanvas(label: string, xCoordinates: readonly number[]): void {
  assert.ok(xCoordinates.length > 0, `${label} has no authored world anchors`)
  assert.ok(Math.min(...xCoordinates) <= 10, `${label} does not reach the left edge of the stage`)
  assert.ok(Math.max(...xCoordinates) >= 90, `${label} still reserves the old right-side shop lane`)
  assert.ok(xCoordinates.some((x) => x < 50) && xCoordinates.some((x) => x > 50), `${label} is not balanced across the Heart`)
}

test('every universe authors its primary world composition across the complete reversible stage', () => {
  const emberlight = buildEmberlightFlagshipScene({ hearth: 25, sun: 25 })
  assertUsesFullCanvas('Emberlight hearths', emberlight.hearthSeats.map(({ x }) => x))
  assertUsesFullCanvas('Emberlight suns', emberlight.sunSeats.map(({ x }) => x))
  assertUsesFullCanvas('Emberlight lifecycle landmarks', Object.values(EMBERLIGHT_LIFECYCLE_SEATS).map(({ x }) => x))

  assertUsesFullCanvas('Tidefall families', TIDEFALL_FAMILY_SEATS.map(({ x }) => x))
  assertUsesFullCanvas('Clockwork machines', CLOCKWORK_MACHINE_SEATS.map(({ x }) => x))

  const verdanceOwned = fullOwnership(VERDANCE_V2_PACK.economy.generators.map(({ id }) => id))
  assertUsesFullCanvas(
    'Verdance groves',
    planVerdanceGroves(VERDANCE_V2_PACK.visual.objects, verdanceOwned).map(({ xPercent }) => xPercent),
  )

  const brahmalokOwned = fullOwnership(BRAHMALOK_V2_PACK.economy.generators.map(({ id }) => id))
  assertUsesFullCanvas('Brahmalok courts', planBrahmalokCourts({}, brahmalokOwned).map(({ xPercent }) => xPercent))

  const vishnulokOwned = fullOwnership(VISHNULOK_V2_PACK.economy.generators.map(({ id }) => id))
  assertUsesFullCanvas(
    'Vishnulok shelters',
    planVishnulokShelters(VISHNULOK_V2_PACK.visual.objects, vishnulokOwned).map(({ xPercent }) => xPercent),
  )

  const kailashOwned = fullOwnership(KAILASH_V2_PACK.economy.generators.map(({ id }) => id))
  assertUsesFullCanvas(
    'Kailash formations',
    planKailashFormations(KAILASH_V2_PACK.visual.objects, kailashOwned).map(({ xPercent }) => xPercent),
  )
})
