import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { V2_UNIVERSE_BY_ID, universeById } from '../src/content/universes'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import type { UniversePackV2 } from '../src/content/universes/types'
import {
  ARCHIVE_LANDMARK_SLOTS,
  planArchiveLandmarks,
} from '../src/render/archive-landmarks'
import { archiveLandmarkDescriptorsFor } from '../src/render/archive-landmark-registry'
import type {
  ArchiveLandmarkPresentationDescriptor,
} from '../src/render/archive-landmarks'

function descriptorsFor(
  pack: UniversePackV2,
  recordIds: readonly string[],
  groupFor: (recordId: string, index: number) => string = (recordId) => recordId,
): ArchiveLandmarkPresentationDescriptor[] {
  return recordIds.map((recordId, index) => {
    const groupId = groupFor(recordId, index)
    return {
      recordId,
      priority: 100 - index,
      hoverTheme: `${pack.identity.shortName} field trace`,
      accessibleTheme: `${pack.archive.localName} landmark`,
      fallbackGroupId: groupId,
      fallbackGroupLabel: `${pack.identity.shortName} ${groupId}`,
    }
  })
}

function assertSemanticIdentity(
  pack: UniversePackV2,
  recordId: string,
  plan: ReturnType<typeof planArchiveLandmarks>,
): void {
  const source = pack.archive.records.find((record) => record.id === recordId)
  const presented = plan.landmarks
    .flatMap(({ records }) => records)
    .find((record) => record.id === recordId)
  assert.ok(source)
  assert.ok(presented)
  assert.equal(presented.observation, source.observation)
  assert.equal(presented.implication, source.implication)
  assert.equal(presented.effectDescription, source.effectDescription)
  assert.deepEqual(presented.baseMaterial, source.object.material)
  assert.equal(presented.baseSilhouette, source.object.silhouette)
  assert.match(presented.hoverDescription, new RegExp(source.effectDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(presented.accessibleDescription, /Observation:/)
  assert.match(presented.accessibleDescription, /Implication:/)
  assert.match(presented.accessibleDescription, /Effect:/)
}

test('Emberlight archive landmarks preserve record meaning, identity, themed copy, and safe slots', () => {
  const recordIds = EMBERLIGHT_V2.archive.records.slice(0, 4).map(({ id }) => id)
  const plan = planArchiveLandmarks(
    EMBERLIGHT_V2,
    recordIds,
    descriptorsFor(EMBERLIGHT_V2, recordIds),
  )

  assert.equal(plan.universeId, 'emberlight')
  assert.equal(plan.attentionLimit, 12)
  assert.equal(plan.visibleInteractiveCount, 4)
  assert.equal(plan.landmarks.length, 4)
  assert.equal(plan.hidden.length, 0)
  assert.equal(new Set(plan.landmarks.map(({ slot }) => slot.id)).size, 4)

  for (const landmark of plan.landmarks) {
    assert.equal(landmark.interactive, true)
    assert.equal(landmark.grouped, false)
    assert.ok(ARCHIVE_LANDMARK_SLOTS.includes(landmark.slot))
    assert.deepEqual(landmark.slot.avoids, ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui'])
    assert.ok(landmark.slot.x >= 0.09 && landmark.slot.x <= 0.73)
    assert.ok(landmark.slot.y >= 0.24 && landmark.slot.y <= 0.83)
    const requiredHeartClearance = Math.max(...landmark.recordIds.map((recordId) => {
      const record = EMBERLIGHT_V2.archive.records.find(({ id }) => id === recordId)
      assert.ok(record)
      return record.object.minimumHeartDistance
    }))
    assert.ok(landmark.slot.heartClearanceRadii >= requiredHeartClearance)
    assert.match(landmark.hoverDescription, /Emberlight field trace/)
    assert.match(landmark.accessibleDescription, /Astral Cabinet landmark/)
  }
  for (const recordId of recordIds) assertSemanticIdentity(EMBERLIGHT_V2, recordId, plan)
})

test('Tidefall archive landmarks use Pelagic presentation descriptors without Emberlight assumptions', () => {
  const recordIds = TIDEFALL_V2_PACK.archive.records.slice(2, 5).map(({ id }) => id)
  const plan = planArchiveLandmarks(
    TIDEFALL_V2_PACK,
    recordIds,
    descriptorsFor(TIDEFALL_V2_PACK, recordIds),
  )

  assert.equal(plan.universeId, 'tidefall')
  assert.equal(plan.visibleInteractiveCount, 3)
  assert.deepEqual(plan.landmarks.map(({ recordIds: ids }) => ids[0]), recordIds)
  for (const recordId of recordIds) assertSemanticIdentity(TIDEFALL_V2_PACK, recordId, plan)
  for (const landmark of plan.landmarks) {
    assert.match(landmark.hoverDescription, /Tidefall field trace/)
    assert.match(landmark.accessibleDescription, /Pelagic Archive landmark/)
    assert.doesNotMatch(landmark.accessibleDescription, /Astral Cabinet/)
  }
})

test('selection, diagnostics, and placement are invariant to unlocked-ID and descriptor order', () => {
  const recordIds = TIDEFALL_V2_PACK.archive.records.slice(0, 7).map(({ id }) => id)
  const descriptors = descriptorsFor(
    TIDEFALL_V2_PACK,
    recordIds,
    (_recordId, index) => `shelf-${Math.floor(index / 4)}`,
  )
  const forward = planArchiveLandmarks(TIDEFALL_V2_PACK, recordIds, descriptors, 'reduced-motion')
  const reversed = planArchiveLandmarks(
    TIDEFALL_V2_PACK,
    [...recordIds].reverse(),
    [...descriptors].reverse(),
    'reduced-motion',
  )

  assert.deepEqual(reversed, forward)
})

test('all modes preserve every individual record while changing only fallback rendering', () => {
  const recordIds = EMBERLIGHT_V2.archive.records.slice(0, 8).map(({ id }) => id)
  const descriptors = descriptorsFor(
    EMBERLIGHT_V2,
    recordIds,
    (_recordId, index) => `shelf-${Math.floor(index / 4)}`,
  )
  const standard = planArchiveLandmarks(EMBERLIGHT_V2, recordIds, descriptors)
  const reduced = planArchiveLandmarks(EMBERLIGHT_V2, recordIds, descriptors, 'reduced-motion')
  const low = planArchiveLandmarks(EMBERLIGHT_V2, recordIds, descriptors, 'low-quality')

  assert.equal(standard.landmarks.length, 8)
  assert.equal(standard.hidden.length, 0)
  assert.ok(standard.landmarks.every(({ grouped }) => !grouped))
  assert.equal(reduced.landmarks.length, 8)
  assert.equal(reduced.hidden.length, 0)
  assert.ok(reduced.landmarks.every(({ grouped, records }) => !grouped && records.length === 1))
  assert.deepEqual(
    reduced.landmarks.map(({ id, recordIds: ids, slot }) => ({ id, ids, slot: slot.id })),
    low.landmarks.map(({ id, recordIds: ids, slot }) => ({ id, ids, slot: slot.id })),
  )
  assert.deepEqual(
    reduced.landmarks.flatMap(({ recordIds: ids }) => ids).sort(),
    [...recordIds].sort(),
  )
})

test('all seven completed Archives render all twelve records with the collection-card art contract', () => {
  const cabinetSource = readFileSync('src/ui/CuriosityCabinet.svelte', 'utf8')
  const worldSource = readFileSync('src/ui/ManifestWorldLayer.svelte', 'utf8')
  assert.match(cabinetSource, /ArchiveRecordArt/)
  assert.match(worldSource, /ArchiveRecordArt/)

  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    const recordIds = pack.archive.records.map(({ id }) => id)
    const cabinetIds = universeById(universeId).cabinet.items.map(({ id }) => id)
    assert.deepEqual(cabinetIds, recordIds, `${universeId} Cabinet and Archive identities drifted`)

    for (const mode of ['standard', 'reduced-motion', 'low-quality'] as const) {
      const plan = planArchiveLandmarks(
        pack,
        recordIds,
        archiveLandmarkDescriptorsFor(universeId),
        mode,
      )
      assert.equal(plan.landmarks.length, 12, `${universeId}/${mode} hid records`)
      assert.equal(plan.visibleInteractiveCount, 12)
      assert.equal(plan.hidden.length, 0)
      assert.equal(new Set(plan.landmarks.map(({ slot }) => slot.id)).size, 12)
      assert.deepEqual(plan.landmarks.flatMap(({ recordIds: ids }) => ids).sort(), [...recordIds].sort())
      assert.equal(new Set(plan.landmarks.map(({ slot }) => slot.x)).size, 12, `${universeId}/${mode} aligned x positions`)
      assert.equal(new Set(plan.landmarks.map(({ slot }) => slot.y)).size, 12, `${universeId}/${mode} aligned y positions`)
    }
  }
})

test('unknown and missing IDs are stable diagnostics and never become landmarks', () => {
  const [known, missing] = TIDEFALL_V2_PACK.archive.records
  const descriptors: ArchiveLandmarkPresentationDescriptor[] = [
    ...descriptorsFor(TIDEFALL_V2_PACK, [known.id]),
    {
      recordId: 'unknown-descriptor',
      priority: 999,
      hoverTheme: 'Unknown hover',
      accessibleTheme: 'Unknown accessible',
      fallbackGroupId: 'unknown-group',
      fallbackGroupLabel: 'Unknown group',
    },
  ]
  const plan = planArchiveLandmarks(
    TIDEFALL_V2_PACK,
    [missing.id, 'unknown-record-b', known.id, 'unknown-record-a', known.id],
    descriptors,
  )

  assert.deepEqual(plan.landmarks.map(({ recordIds }) => recordIds), [[known.id]])
  assert.deepEqual(plan.unknownRecordIds, ['unknown-record-a', 'unknown-record-b'])
  assert.deepEqual(plan.missingDescriptorRecordIds, [missing.id])
  assert.deepEqual(plan.unknownDescriptorRecordIds, ['unknown-descriptor'])
})

test('reduced-motion and low-quality visuals are the exact authored pack fallbacks', () => {
  for (const pack of [EMBERLIGHT_V2, TIDEFALL_V2_PACK]) {
    const record = pack.archive.records[0]
    const descriptors = descriptorsFor(pack, [record.id])
    const reduced = planArchiveLandmarks(pack, [record.id], descriptors, 'reduced-motion').landmarks[0].records[0]
    const low = planArchiveLandmarks(pack, [record.id], descriptors, 'low-quality').landmarks[0].records[0]

    assert.equal(reduced.visual.fallbackState, record.object.reducedMotionState)
    assert.equal(low.visual.fallbackState, record.object.lowQualityState)
    assert.equal(reduced.visual.material, record.object.reducedMotionState.material)
    assert.equal(reduced.visual.silhouette, record.object.reducedMotionState.silhouette)
    assert.equal(reduced.visual.motion, record.object.reducedMotionState.motion)
    assert.equal(low.visual.material, record.object.lowQualityState.material)
    assert.equal(low.visual.silhouette, record.object.lowQualityState.silhouette)
    assert.equal(low.visual.motion, record.object.lowQualityState.motion)
    assert.equal(reduced.observation, low.observation)
    assert.equal(reduced.implication, low.implication)
    assert.equal(reduced.effectDescription, low.effectDescription)
    assert.equal(reduced.baseMaterial, low.baseMaterial)
    assert.equal(reduced.baseSilhouette, low.baseSilhouette)
  }
})
