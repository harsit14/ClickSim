import {
  EMBERLIGHT_CABINET,
  type CuriosityCabinetDef,
  type CuriosityDef,
} from '../../curiosities'

type ArchiveCopy = Pick<
  CuriosityDef,
  'name' | 'glyph' | 'classification' | 'flavor' | 'record' | 'desc'
>

/**
 * Stable legacy IDs and all numeric/special behavior remain unchanged. Only the
 * authored Emberlight identity is replaced with the frozen Astral Cabinet bible.
 */
const ASTRAL_COPY: Readonly<Record<string, ArchiveCopy>> = {
  moth: {
    name: 'White Dwarf',
    glyph: '◉',
    classification: 'compressed stellar remnant · local sky 01',
    flavor: 'A dead sun pressed into a pearl of patient white fire.',
    record: 'Its spectrum predates the Last Ember. Every heavy element in its crust records a civilization that learned to survive by becoming smaller, denser, and harder to erase.',
    desc: 'compressed persistence lends every restored system a little gravity',
  },
  chimes: {
    name: 'Magnetar',
    glyph: '✣',
    classification: 'magnetic neutron remnant · local sky 02',
    flavor: 'A star whose invisible field can ring the dark like glass.',
    record: 'Four magnetic arcs repeat one syllable in a language Lumen knew before Emberlight. The interval bends the rhythm window without changing the beat itself.',
    desc: 'its bounded magnetic cadence strengthens production and critical timing',
  },
  hearthkeeper: {
    name: 'Protostellar Nursery',
    glyph: '✦',
    classification: 'fuelable stellar nursery · local sky 03',
    flavor: 'A cloud warm with stars that have not decided to ignite.',
    record: 'Lumen asks that this nursery be fed rather than hurried. Its dust contains the same mineral ratios as the Last Ember, arranged as if someone prepared a second beginning in advance.',
    desc: 'stoke the nursery; while fueled, all production +5%. it cools, but never dies',
  },
  'glass-garden': {
    name: 'Aurora World',
    glyph: '≋',
    classification: 'magnetized living world · local sky 04',
    flavor: 'A small world wearing its atmosphere as curtains of light.',
    record: 'The aurora brightens before every Omen and sketches a shoreline beneath a moonless sea. The Cabinet files the pattern as weather, warning, and invitation at once.',
    desc: 'visual weather takes root around the edge of the restored sky',
  },
  'second-cursor': {
    name: 'Quasar',
    glyph: '⌁',
    classification: 'active galactic nucleus · signal sky 01',
    flavor: 'A galaxy’s bright wound focused into one impossible direction.',
    record: 'Every jet crosses the point where the first universe ended. The returning pulse is one touch long, perfectly on beat, and aimed at the Last Ember.',
    desc: 'fires one clean measured pulse into the Heart every beat',
  },
  snail: {
    name: 'Rogue Planet',
    glyph: '◒',
    classification: 'unbound traveler · signal sky 02',
    flavor: 'A world with no sun, keeping warm by remembering one.',
    record: 'Ice on its night side contains salt from an ocean Emberlight has never held. It leaves safely, stores what the world made in its absence, and returns on a route the player can predict.',
    desc: 'completes its passage in about 90 minutes; every return carries a gift',
  },
  aurora: {
    name: 'Supermassive Black Hole',
    glyph: '●',
    classification: 'galactic gravity anchor · signal sky 03',
    flavor: 'An entire civilization turning around a darkness too large to notice it is alone.',
    record: 'Its lens gathers galaxies into a single legible relationship. The empty center matches the silhouette left when the old universe vanished, but the surrounding lights are still choosing one another.',
    desc: 'a slow field of galactic resonance changes the horizon without urgency',
  },
  door: {
    name: 'Black Hole',
    glyph: '●',
    classification: 'collapsed stellar horizon · signal sky 04',
    flavor: 'Not an absence. A place where every direction becomes inward.',
    record: 'One clock-tick disappears beyond its horizon each cycle. The missing interval reappears in the Wayfinder as a route no ordinary instrument can see.',
    desc: 'its event horizon becomes readable when this universe grows vast enough',
  },
  'star-jar': {
    name: 'Cosmic Microwave Fragment',
    glyph: '▦',
    classification: 'oldest-light relic · deep sky 01',
    flavor: 'A cold square of the first sky, still warm by a fraction.',
    record: 'The noise is older than every restored star, yet it contains a tiny gap shaped like the Last Ember. Omens gather near it as if searching for the missing note.',
    desc: 'its oldest signal draws falling stars 5% more often',
  },
  'metronome-heart': {
    name: 'Gravitational-Wave Knot',
    glyph: '⋇',
    classification: 'braided spacetime signal · deep sky 02',
    flavor: 'Two ancient collisions tied together before either occurred.',
    record: 'The knot tightens on Emberlight’s beat and relaxes between touches. Lumen identifies three overlapping waveforms, then quietly names them Warden, Hunger, and Companion.',
    desc: 'its precise waveform widens the beat window by 20ms',
  },
  letter: {
    name: 'Red Giant',
    glyph: '✹',
    classification: 'late-stage star · deep sky 03',
    flavor: 'A sun grown enormous and gentle at the edge of its ending.',
    record: 'Its outer atmosphere carries the Last Gardeners’ transmission. They hid the message inside the star’s breathing so a future keeper would have to let it live long enough to listen.',
    desc: 'its spectrum holds an archival transmission that can be read',
  },
  orrery: {
    name: 'Orrery of the Local Sky',
    glyph: '◎',
    classification: 'archive map-anchor · deep sky 04',
    flavor: 'A working model of every scale Emberlight has learned to care for.',
    record: 'The model aligns nursery, stars, galaxies, cosmic web, and Answering Star. When the final arm settles, it points beyond Emberlight toward several skies that are not reflections.',
    desc: 'completes the Astral Cabinet and anchors its route beyond the Known Sky',
  },
}

const items = EMBERLIGHT_CABINET.items.map((item): CuriosityDef => ({
  ...item,
  ...ASTRAL_COPY[item.id],
}))

export const EMBERLIGHT_ASTRAL_CABINET: CuriosityCabinetDef = {
  ...EMBERLIGHT_CABINET,
  title: 'Astral Cabinet',
  surveyLabel: 'Emberlight Astral Cabinet survey',
  dockTitle: 'Astral Cabinet',
  dockGlyph: '◎',
  items,
  itemById: new Map(items.map((item) => [item.id, item])),
  lines: {
    empty: 'Three shelves wait for phenomena the Known Sky has not learned to recognize.',
    first: 'The oldest light becomes less lonely once it has a name and a place.',
    chapter: 'Four records have resolved into one relationship inside the same sky.',
    cosmology: 'The Cabinet is no longer a collection. It is becoming a working cosmology.',
    complete: 'The Orrery settles. The Known Sky is complete enough to see its neighbors.',
  },
}
