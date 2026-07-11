import type { ArchiveLandmarkPresentationDescriptor } from './archive-landmarks'

function descriptors(
  ids: readonly string[],
  hoverTheme: string,
  accessibleTheme: string,
  shelfGroups: readonly [string, string][],
): readonly ArchiveLandmarkPresentationDescriptor[] {
  return ids.map((recordId, index) => {
    const shelfIndex = Math.min(shelfGroups.length - 1, Math.floor(index / 4))
    const [fallbackGroupId, fallbackGroupLabel] = shelfGroups[shelfIndex]
    return {
      recordId,
      priority: ids.length - index,
      hoverTheme,
      accessibleTheme,
      fallbackGroupId,
      fallbackGroupLabel,
    }
  })
}

const EMBERLIGHT_ARCHIVE_LANDMARKS = descriptors(
  ['moth', 'chimes', 'hearthkeeper', 'glass-garden', 'second-cursor', 'snail', 'aurora', 'door', 'star-jar', 'metronome-heart', 'letter', 'orrery'],
  'Astral Cabinet signal',
  'Visible Astral Cabinet landmark',
  [
    ['ember-local-sky', 'Local Sky constellation'],
    ['ember-signal-sky', 'Signal Sky constellation'],
    ['ember-deep-sky', 'Deep Sky constellation'],
  ],
)

const TIDEFALL_ARCHIVE_LANDMARKS = descriptors(
  ['moth', 'chimes', 'hearthkeeper', 'glass-garden', 'second-cursor', 'snail', 'aurora', 'door', 'star-jar', 'metronome-heart', 'letter', 'orrery'],
  'Pelagic Archive sounding',
  'Visible Pelagic Archive landmark',
  [
    ['tide-surface-omens', 'Surface Omen sounding'],
    ['tide-pelagic-signals', 'Pelagic Signal sounding'],
    ['tide-abyssal-relics', 'Abyssal Relic sounding'],
  ],
)

const VERDANCE_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `u3-archive-${String(index + 1).padStart(2, '0')}`),
  'Impossible Herbarium specimen',
  'Visible Impossible Herbarium landmark',
  [
    ['verdance-survival', 'Survival specimen grove'],
    ['verdance-communication', 'Communication specimen network'],
    ['verdance-inheritance', 'Inheritance specimen seedbank'],
  ],
)

const CLOCKWORK_ARCHIVE_LANDMARKS = descriptors(
  [
    'u4-patent-one-tooth-prototype', 'u4-patent-self-oiling-bearing', 'u4-patent-impossible-escapement', 'u4-patent-moonless-orrery',
    'u4-patent-memory-cam', 'u4-patent-compassion-governor', 'u4-patent-punched-prophecy', 'u4-patent-perpetual-warranty',
    'u4-patent-broken-hourglass', 'u4-patent-clockmakers-hand', 'u4-patent-city-shift-bell', 'u4-patent-blueprint-tomorrow',
  ],
  'Patent Ledger mechanism',
  'Visible Patent Ledger landmark',
  [
    ['clockwork-transmission', 'Transmission patent train'],
    ['clockwork-prediction', 'Prediction patent train'],
    ['clockwork-exception', 'Exception patent train'],
  ],
)

const PRISMATA_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `u5-archive-${String(index + 1).padStart(2, '0')}`),
  'Archive of First Forms record',
  'Visible Archive of First Forms landmark',
  [['prismata-first-thought', 'First Thought writing court'], ['prismata-given-form', 'Given Form workshop'], ['prismata-open-future', 'Open Future folio garden']],
)

const TEMPEST_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `u6-archive-${String(index + 1).padStart(2, '0')}`),
  'Ocean of Continuance sounding',
  'Visible Ocean of Continuance landmark',
  [['tempest-refuge', 'Refuge harbor'], ['tempest-correction', 'Correction current'], ['tempest-return', 'Return horizon']],
)

const CANTICLE_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `u7-archive-${String(index + 1).padStart(2, '0')}`),
  'Resonant Memory instrument',
  'Visible Resonant Memory landmark',
  [['canticle-voice', 'Voice chamber'], ['canticle-memory', 'Memory chamber'], ['canticle-relationship', 'Relationship chamber']],
)

const ARCHIVE_LANDMARKS_BY_UNIVERSE: Readonly<Record<string, readonly ArchiveLandmarkPresentationDescriptor[]>> = {
  emberlight: EMBERLIGHT_ARCHIVE_LANDMARKS,
  tidefall: TIDEFALL_ARCHIVE_LANDMARKS,
  verdance: VERDANCE_ARCHIVE_LANDMARKS,
  clockwork: CLOCKWORK_ARCHIVE_LANDMARKS,
  prismata: PRISMATA_ARCHIVE_LANDMARKS,
  tempest: TEMPEST_ARCHIVE_LANDMARKS,
  canticle: CANTICLE_ARCHIVE_LANDMARKS,
}

/** Explicit authored registry; missing worlds fail closed instead of borrowing another universe's language. */
export function archiveLandmarkDescriptorsFor(universeId: string): readonly ArchiveLandmarkPresentationDescriptor[] {
  return ARCHIVE_LANDMARKS_BY_UNIVERSE[universeId] ?? []
}
