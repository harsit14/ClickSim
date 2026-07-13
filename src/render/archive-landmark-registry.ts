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
  Array.from({ length: 12 }, (_value, index) => `verdance-archive-${String(index + 1).padStart(2, '0')}`),
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
    'clockwork-patent-one-tooth-prototype', 'clockwork-patent-self-oiling-bearing', 'clockwork-patent-impossible-escapement', 'clockwork-patent-moonless-orrery',
    'clockwork-patent-memory-cam', 'clockwork-patent-compassion-governor', 'clockwork-patent-punched-prophecy', 'clockwork-patent-perpetual-warranty',
    'clockwork-patent-broken-hourglass', 'clockwork-patent-clockmakers-hand', 'clockwork-patent-city-shift-bell', 'clockwork-patent-blueprint-tomorrow',
  ],
  'Patent Ledger mechanism',
  'Visible Patent Ledger landmark',
  [
    ['clockwork-transmission', 'Transmission patent train'],
    ['clockwork-prediction', 'Prediction patent train'],
    ['clockwork-exception', 'Exception patent train'],
  ],
)

const BRAHMALOK_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `brahmalok-archive-${String(index + 1).padStart(2, '0')}`),
  'Archive of First Forms record',
  'Visible Archive of First Forms landmark',
  [['brahmalok-first-thought', 'First Thought writing court'], ['brahmalok-given-form', 'Given Form workshop'], ['brahmalok-open-future', 'Open Future folio garden']],
)

const VISHNULOK_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `vishnulok-archive-${String(index + 1).padStart(2, '0')}`),
  'Ocean of Continuance sounding',
  'Visible Ocean of Continuance landmark',
  [['vishnulok-refuge', 'Refuge harbor'], ['vishnulok-correction', 'Correction current'], ['vishnulok-return', 'Return horizon']],
)

const KAILASH_ARCHIVE_LANDMARKS = descriptors(
  Array.from({ length: 12 }, (_value, index) => `kailash-archive-${String(index + 1).padStart(2, '0')}`),
  'Mountain Witness field note',
  'Visible Mountain Witness landmark',
  [['kailash-change', 'Change ridge'], ['kailash-refuge', 'Refuge valley'], ['kailash-return', 'Return path']],
)

const ARCHIVE_LANDMARKS_BY_UNIVERSE: Readonly<Record<string, readonly ArchiveLandmarkPresentationDescriptor[]>> = {
  emberlight: EMBERLIGHT_ARCHIVE_LANDMARKS,
  tidefall: TIDEFALL_ARCHIVE_LANDMARKS,
  verdance: VERDANCE_ARCHIVE_LANDMARKS,
  clockwork: CLOCKWORK_ARCHIVE_LANDMARKS,
  brahmalok: BRAHMALOK_ARCHIVE_LANDMARKS,
  vishnulok: VISHNULOK_ARCHIVE_LANDMARKS,
  kailash: KAILASH_ARCHIVE_LANDMARKS,
}

/** Explicit authored registry; missing worlds fail closed instead of borrowing another universe's language. */
export function archiveLandmarkDescriptorsFor(universeId: string): readonly ArchiveLandmarkPresentationDescriptor[] {
  return ARCHIVE_LANDMARKS_BY_UNIVERSE[universeId] ?? []
}
