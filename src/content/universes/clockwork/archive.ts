import type {
  CuriosityCabinetDef,
  CuriosityDef,
  CuriosityShelfDef,
} from '../../curiosities'

export const CLOCKWORK_PATENT_ITEMS: CuriosityDef[] = [
  {
    id: 'u4-patent-one-tooth-prototype', name: 'One-Tooth Prototype', glyph: '⌑',
    classification: 'transmission patent · plate 01',
    flavor: 'The smallest machine that can still prove work moved from one place to another.',
    record: 'The patent rejects ornamental rotation. Its only claim is that a tooth must transmit force or remain still.',
    desc: 'makes the first power route legible from source to destination', cost: 1e6, hue: 42,
  },
  {
    id: 'u4-patent-self-oiling-bearing', name: 'Self-Oiling Bearing', glyph: '◎',
    classification: 'transmission patent · plate 02',
    flavor: 'A ceramic race carrying one sealed drop through an endless civic shift.',
    record: 'The bearing was approved only after its inventors proved maintenance could be scheduled without surprise failure.',
    desc: 'reduces visible friction along completed trains', cost: 5e6, hue: 36,
  },
  {
    id: 'u4-patent-impossible-escapement', name: 'Impossible Escapement', glyph: '⊳',
    classification: 'transmission patent · plate 03',
    flavor: 'A pallet releases time without receiving the force that should move it.',
    record: 'One drawing labels the missing input THE HAND OUTSIDE THE PLAN. Every later copy removes the phrase.',
    desc: 'marks exact cadence transmission without relying on sound', cost: 25e6, hue: 48,
  },
  {
    id: 'u4-patent-moonless-orrery', name: 'Moonless Orrery', glyph: '⌖',
    classification: 'transmission patent · plate 04',
    flavor: 'Every gear describes an orbit except the empty axle that moves them all.',
    record: 'The absent body has Tidefall mass readings. The Clockmakers knew another world before the city stopped.',
    desc: 'adds a fixed meridian alignment to the route forecast', cost: 1e8, hue: 212,
  },
  {
    id: 'u4-patent-memory-cam', name: 'Memory Cam', glyph: '◒',
    classification: 'prediction patent · plate 01',
    flavor: 'Its uneven profile stores the shape of one completed ten-second shift.',
    record: 'The cam cannot improvise. It can, however, repeat the best thing the city has already chosen to do.',
    desc: 'makes Recall Notice history visible as a fixed profile', cost: 5e8, hue: 198,
  },
  {
    id: 'u4-patent-compassion-governor', name: 'Compassion Governor', glyph: '⚖',
    classification: 'prediction patent · plate 02',
    flavor: 'A regulator that treats excessive efficiency as a civic emergency.',
    record: 'The city could predict every cost except what perfection would do to the people required to maintain it.',
    desc: 'labels overload before a route becomes a single brittle dependency', cost: 2e9, hue: 204,
  },
  {
    id: 'u4-patent-punched-prophecy', name: 'Punched Prophecy', glyph: '◫',
    classification: 'prediction patent · plate 03',
    flavor: 'A paper future encoded as holes through which tomorrow can be inspected.',
    record: 'Every aperture is correct. The blank margin is where the Clockmakers recorded whether they obeyed it.',
    desc: 'extends the deterministic Maintenance Signal forecast', cost: 1e10, hue: 176,
  },
  {
    id: 'u4-patent-perpetual-warranty', name: 'Perpetual Warranty', glyph: '∞',
    classification: 'prediction patent · plate 04',
    flavor: 'A maintenance promise valid after the manufacturer, owner, and calendar have ended.',
    record: 'The final clause appoints the restored Heart as guarantor, dated before the Heart arrived.',
    desc: 'retains Patent Ledger evidence across every Rewinding', cost: 1e11, hue: 44,
  },
  {
    id: 'u4-patent-broken-hourglass', name: 'Broken Hourglass', glyph: '⧖',
    classification: 'exception patent · plate 01',
    flavor: 'The sand is numbered, but one grain remains outside every count.',
    record: 'The bureau classified the grain as controlled unpredictability: visible, bounded, and never required.',
    desc: 'introduces bounded exception as philosophy rather than a random reward', cost: 1e12, hue: 14,
  },
  {
    id: 'u4-patent-clockmakers-hand', name: 'Clockmaker’s Hand', glyph: '✋',
    classification: 'exception patent · plate 02',
    flavor: 'An articulated tool worn smooth where a human thumb once rested.',
    record: 'Its last repair introduced a harmless asymmetry. Production improved because someone chose care over specification.',
    desc: 'shows manual route changes as authored decisions', cost: 1e13, hue: 30,
  },
  {
    id: 'u4-patent-city-shift-bell', name: 'City Shift Bell', glyph: '◓',
    classification: 'exception patent · plate 03',
    flavor: 'A tuned bell whose schedule belongs to workers rather than the machine.',
    record: 'The bell introduced the city’s first unscheduled holiday. The Great Regulator preserved the discrepancy.',
    desc: 'adds a visual and captioned equivalent to every scheduled chime', cost: 1e14, hue: 52,
  },
  {
    id: 'u4-patent-blueprint-tomorrow', name: 'Blueprint for Tomorrow', glyph: '⌑',
    classification: 'exception patent · plate 04',
    flavor: 'A complete plan whose final route is deliberately left for another hand.',
    record: 'The city predicted the Devourer, stopped every clock, and survived unnoticed. The blank route asks whether survival without choice was freedom at all.',
    desc: 'reveals why the Unwound City stopped and what restoration risks', cost: 1e15, hue: 214,
  },
]

export const CLOCKWORK_PATENT_SHELVES: CuriosityShelfDef[] = [
  {
    id: 'hearthside', index: 'I', name: 'Transmission',
    lore: 'Patents proving that rotation matters only when work reaches another machine.',
    ids: CLOCKWORK_PATENT_ITEMS.slice(0, 4).map(({ id }) => id),
    rewardKind: 'production', rewardName: 'Closed Train', reward: 'all production ×1.10', rewardValue: 1.1,
  },
  {
    id: 'pilgrims', index: 'II', name: 'Prediction',
    lore: 'Machines that forecast maintenance, memory, and the cost of certainty.',
    ids: CLOCKWORK_PATENT_ITEMS.slice(4, 8).map(({ id }) => id),
    rewardKind: 'clicks', rewardName: 'Inspected Formula', reward: 'touch power ×1.25', rewardValue: 1.25,
  },
  {
    id: 'portents', index: 'III', name: 'Exception',
    lore: 'Evidence that the city studied choice without turning it into hidden chance.',
    ids: CLOCKWORK_PATENT_ITEMS.slice(8, 12).map(({ id }) => id),
    rewardKind: 'production', rewardName: 'Bounded Exception', reward: 'reveals controlled unpredictability as a future doctrine', rewardValue: 1,
  },
]

export const CLOCKWORK_PATENT_RECORD =
  'PATENT OFFICE CLOSURE NOTICE — BLUEPRINT FOR TOMORROW\n\n' +
  'The Causal Engine predicts an observer that learns every solved system it consumes.\n\n' +
  'The city therefore chooses stillness. Stop the Heart. Preserve the schedules. Leave one route blank.\n\n' +
  'If time resumes, it will be because someone outside the prediction chose vulnerability over perfect safety.\n\n' +
  '— final registrar of the Unwound City'

export const CLOCKWORK_PATENT_LEDGER: CuriosityCabinetDef = {
  id: 'clockwork',
  title: 'Patent Ledger',
  surveyLabel: 'Clockwork patent inspection',
  dockTitle: 'Patent Ledger',
  dockGlyph: '⌑',
  items: CLOCKWORK_PATENT_ITEMS,
  itemById: new Map(CLOCKWORK_PATENT_ITEMS.map((item) => [item.id, item])),
  shelves: CLOCKWORK_PATENT_SHELVES,
  resonancePerItem: 0.008,
  fuelHours: 2,
  fuelProductionMult: 1.05,
  returnCycleSec: 60 * 60,
  returnRateSeconds: 600,
  starItemRateBonus: 0,
  beatWindowBonus: 0.02,
  lines: {
    empty: 'Three indexed drawers wait for mechanisms the city once considered worth protecting.',
    first: 'One patent has resumed meaning. Lumen checks its filing date twice.',
    chapter: 'Four mechanisms now describe one civic argument.',
    cosmology: 'The Ledger has stopped resembling an office. It is becoming a confession.',
    complete: 'The final route remains blank by design. Completion is not obedience.',
  },
  archiveRecord: CLOCKWORK_PATENT_RECORD,
}
