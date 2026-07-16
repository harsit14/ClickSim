import { createFutureUniversePack, type FutureUniverseSpec } from '../future-pack'

const kindling = (name: string, flavor: string, silhouette: string) => ({ name, flavor, silhouette })
const archive = (name: string, glyph: string, observation: string, implication: string, effect: string, silhouette: string) => ({ name, glyph, observation, implication, effect, silhouette })
const story = (title: string, provenance: string, text: string) => ({ title, provenance, text })

export const KAILASH_FRONT_SIGNALS = [
  { id: 'kailash-front-approaching', text: 'front approaching', shape: 'turned weather vane', pattern: 'single leaning pointer above the ridge' },
  { id: 'kailash-front-active', text: 'front on the ridge', shape: 'named weather band', pattern: 'labeled band with the favored acts listed' },
  { id: 'kailash-front-answered', text: 'front answered', shape: 'weather band with open notch', pattern: 'band broken by one bright composition mark' },
  { id: 'kailash-long-rest', text: 'long rest', shape: 'held ring with lamp below', pattern: 'still act ring above one slowly filling lamp' },
] as const

export const KAILASH_FRONT_LUMEN = {
  firstFront: 'Weather is the mountain speaking first. We are not asked to stop it — only to arrange ourselves honestly before it arrives.',
  firstAnswer: 'The cycle answered the ridge. Look below: the path down has one more mark than it did.',
  firstLongRest: 'Nothing is earned by stopping, I used to think. The lamp at the lowest shelter disagrees, quietly, all night.',
} as const

/**
 * Kailash is environment-first: sacred presences are never resources,
 * instruments, or collectibles, and the five-act sequence is game fiction.
 */
export const KAILASH_SPEC: FutureUniverseSpec = {
  id: 'kailash', prefix: 'kailash', name: 'Kailash', shortName: 'Kailash', epithet: 'The Mountain Beyond Ending',
  premise: 'Approach a mountain where endings make refuge, renewal, concealment, and grace possible without turning dissolution into spectacle.',
  primaryVerb: 'release', question: 'What should the cycle leave unfinished when it ends?',
  currency: 'Stillness', currencyGlyph: '△', currencyMaterial: 'measured change moving through snow, river, stone, ash, shelter, and deliberate stillness',
  heartName: 'The Still Point', heartPhenomenon: 'A quiet mountain threshold where five visible acts and one chosen rest may be arranged without making a sacred presence into an instrument.',
  heartSilhouette: 'blue-stone summit divided by a silver river thread, five horizon notches, and one open resting interval',
  heartVerb: 'releases one bounded change through the current cycle and returns attention to the still center', achievementPower: 'Release',
  epochName: 'Release', epochMatter: 'Traces', epochMatterSingular: 'Trace', epochGlyph: '▽', epochMaterial: 'relationships and lessons deliberately carried through a completed ending',
  archiveName: 'Mountain Witness', archiveGlyph: '⌃',
  archiveRecord: 'WITNESS AT THE OPEN SUMMIT — FIELD NOTE\n\nThe mountain did not celebrate collapse. Snow became river, ash became soil, and every shelter opened before the fire crossed the ridge.\n\nName what is retained. Ask before releasing the rest. Leave a path down.\n\n— unsigned keeper of the high pass',
  palette: { accentHue: 196, bg: '#070b12', accent: '#63a9bf', gold: '#e8edf2', panel: 'rgba(12, 18, 29, 0.91)' },
  visualMaterials: ['moonlit snow', 'blue stone', 'river silver', 'weathered copper', 'soft ash', 'cedar shadow', 'open sky'],
  primarySilhouettes: ['a five-notched mountain around one still center', 'a silver river descending through blue-stone terraces', 'a late copper ring appearing only after every act and rest are legible'],
  economy: {
    baseCosts: [12, 166, 2_310, 23_400, 358_400, 4_880_000, 70_380_000, 845_000_000, 12_710_000_000, 160_000_000_000, 650_000_000_000, 18_400_000_000_000, 203_000_000_000_000, 1_880_000_000_000_000, 16_900_000_000_000_000, 160_000_000_000_000_000, 1_520_000_000_000_000_000, 16_000_000_000_000_000_000],
    baseRates: [0.224, 2.97, 21.16, 256.25, 1_837.5, 19_404, 145_140, 1_524_400, 11_440_000, 116_920_000, 1_075_000_000, 7_685_000_000, 84_600_000_000, 783_100_000_000, 7_040_000_000_000, 66_550_000_000_000, 634_500_000_000_000, 6_662_500_000_000_000],
    costMultiplier: 1.14,
  },
  signatureUpgrades: (generators) => [
    { id: 'kailash-open-measure', name: 'Open Interval', flavor: 'A bounded pause keeps release from becoming compulsion.', cost: 2e7, glyph: '○', hue: 196, unlock: { gen: generators[3].id, count: 10 }, effects: [{ kind: 'synergy', gen: generators[3].id, per: generators[0].id, value: 0.016 }] },
    { id: 'kailash-counterpoint-gate', name: 'Refuge Before Fire', flavor: 'The pass opens shelter before the dissolving front arrives.', cost: 7e10, glyph: '⌂', hue: 31, unlock: { gen: generators[10].id, count: 10 }, effects: [{ kind: 'synergy', gen: generators[10].id, per: generators[6].id, value: 0.014 }, { kind: 'synergyMult', value: 1.15 }] },
    { id: 'kailash-room-for-answer', name: 'Path Downward', flavor: 'Completion includes a route back into ordinary life.', cost: 4e16, glyph: '▽', hue: 196, unlock: { gen: generators[16].id, count: 10 }, effects: [{ kind: 'globalMult', value: 1.65 }, { kind: 'clickShare', value: 0.012 }] },
  ],
  kindlings: [
    kindling('Snowmelt', 'An ending becomes water before it becomes absence.', 'small snow shelf releasing one bright downward thread'),
    kindling('Stone Breath', 'Warmth and cold exchange places inside patient blue stone.', 'split stone aperture with one pale current'),
    kindling('Moonlit Ridge', 'A boundary remains visible without claiming the whole sky.', 'low mountain ridge carrying a slim crescent reflection'),
    kindling('River Thread', 'What leaves the summit becomes relation downstream.', 'single silver line descending through three terraces'),
    kindling('Cedar Refuge', 'Shelter is prepared before the weather asks permission.', 'three cedar profiles around an open central threshold'),
    kindling('Blue Glacier', 'Old pressure releases slowly enough for valleys to adapt.', 'faceted ice tongue crossed by dated melt bands'),
    kindling('Ash Meadow', 'After fire, the ground records both loss and possible growth.', 'dark meadow plane with pale shoots and visible ash seam'),
    kindling('Copper Dawn', 'Heat becomes a horizon instead of an impact.', 'thin copper arc rising behind two stone shoulders'),
    kindling('Cloud Stair', 'Concealment can protect a passage without denying it exists.', 'five offset cloud ledges fading around a marked route'),
    kindling('Silent Pass', 'A pause separates necessary release from careless momentum.', 'two cliffs framing one empty, numbered interval'),
    kindling('Valley Shelter', 'Many lives endure because the high places make room below.', 'nested valley walls surrounding four unequal dwellings'),
    kindling('High Lake', 'Still water holds the changed mountain without freezing it in place.', 'dark oval lake reflecting five separate horizon marks'),
    kindling('Weathered Cairn', 'Memory marks the route without becoming a commandment.', 'unequal stones stacked beside an unobstructed trail'),
    kindling('Shelter Grove', 'Renewal begins as shade, soil, and time shared freely.', 'open grove canopy above several distinct root gaps'),
    kindling('Fivefold Horizon', 'Emergence, shelter, release, veil, and grace remain distinguishable.', 'five unequal horizon arcs around an open center'),
    kindling('Dance of Seasons', 'Change repeats without making any season disposable.', 'four seasonal slopes joined by a fifth returning path'),
    kindling('Ring of Return', 'The late circle appears only after every refuge is open.', 'incomplete copper ring around mountain and river silhouettes'),
    kindling('Open Summit', 'The cycle completes without occupying the still point.', 'snow peak with five lit approaches and an empty center'),
  ],
  archives: [
    archive('Meltwater Ledger', '≈', 'Every release from the snowfield is paired with a downstream name.', 'The keepers measured ending by who received what followed.', 'improves emergence acts', 'stepped snowline above four labeled river branches'),
    archive('Refuge Map', '⌂', 'Shelters are drawn before fire, avalanche, or flood paths.', 'Protection was part of dissolution rather than its apology.', 'strengthens shelter acts', 'valley map with open shelters outside three hazard curves'),
    archive('Ash Season Chart', '·', 'Burned ground is recorded beside the first returning growth.', 'Loss remained visible while renewal was allowed to begin.', 'improves release acts', 'dark field divided into ash, rain, soil, and new shoot bands'),
    archive('Hidden Pass Marker', '⌁', 'A route disappears from the ridge yet remains legible from below.', 'Concealment protected passage without erasing public memory.', 'strengthens veil acts', 'mountain notch visible through three offset cloud contours'),
    archive('Copper Weather Vane', '◇', 'The vane turns toward danger, shelter, and clearing in sequence.', 'Attention moved before force did.', 'improves responsive sequencing', 'copper pointer above five directional weather marks'),
    archive('River-Stone Calendar', '▱', 'Five flood lines cross one stone and none is called the permanent shore.', 'Continuity was bounded change, not immobility.', 'preserves useful configuration through Release', 'river stone crossed by five dated silver bands'),
    archive('Night Refuge Lamp', '✧', 'A low light faces the path down rather than the summit.', 'Grace was measured by whether another traveler could return.', 'strengthens grace acts', 'small lamp under an open roof beside a descending trail'),
    archive('Two-Slope Accord', '⋀', 'Opposite villages maintain separate paths to one shared shelter.', 'Cooperation did not require identical custom or direction.', 'improves transitions between unlike acts', 'two mountain slopes meeting at an open valley threshold'),
    archive('Unfinished Ring', '◜', 'A copper circle stops before enclosing the summit.', 'The missing interval keeps completion from becoming possession.', 'amplifies deliberate rests', 'broken copper ring around an empty mountain center'),
    archive('Snow-Ash Core', '◐', 'Alternating pale and dark layers preserve several cycles of change.', 'The archive refused a clean story of destruction or purity.', 'improves offline release', 'vertical core with alternating snow, ash, water, and soil bands'),
    archive('Path Downward', '▽', 'The most carefully maintained road leads away from the sacred height.', 'Return to ordinary relation completes the ascent.', 'improves recovery after Release', 'descending switchback from an open summit to four shelters'),
    archive('Witness at the Open Summit', '⌃', 'Five approaches reach a center no structure occupies.', 'The final record asks for consent, names what remains, and leaves room for grace.', 'completes Witness and reveals the final Beacon route', 'five mountain paths stopping around one unoccupied still point'),
  ],
  shelfNames: ['Change', 'Refuge', 'Return'],
  shelfRewards: ['Emergence and release gain strength when their consequences remain visible.', 'Shelter and veil protect ordinary life before the cycle advances.', 'Grace, rests, and the path downward improve recovery after every ending.'],
  omens: [
    { name: 'Passing Snow', description: 'A pale front crosses the ridge and reveals its meltwater route.', silhouette: 'snow veil above one labeled silver descent', motion: 'waveform', effects: [{ kind: 'globalMult', value: 1.12 }] },
    { name: 'Refuge Light', description: 'A low valley light briefly strengthens shelter and recovery.', silhouette: 'open roof holding a small steady light', motion: 'still', effects: [{ kind: 'clickShare', value: 0.008 }] },
    { name: 'Copper Weather', description: 'A warm horizon makes the next act easier to read without accelerating it.', silhouette: 'copper arc behind five mountain notches', motion: 'waveform', effects: [{ kind: 'clickMult', value: 1.18 }] },
    { name: 'Clearing Pass', description: 'Clouds part around a route that was always present.', silhouette: 'two cloud banks around a numbered mountain pass', motion: 'still', effects: [{ kind: 'synergyMult', value: 1.12 }] },
  ],
  doctrines: [
    { name: 'Emergence', description: 'Favor active beginnings and visible downstream consequence.', favoredMotivations: ['performer', 'optimizer'], visualSignature: 'silver meltwater descending from a pale first horizon', effects: [{ kind: 'clickMult', value: 1.3 }] },
    { name: 'Refuge', description: 'Favor protection, patient production, and low-attention play.', favoredMotivations: ['restorer', 'optimizer'], visualSignature: 'open valley shelters beneath layered blue-stone slopes', effects: [{ kind: 'globalMult', value: 1.13 }] },
    { name: 'Release', description: 'Favor transitions, endings, and relationships between Kindling families.', favoredMotivations: ['optimizer', 'archivist'], visualSignature: 'ash and copper boundaries followed by clearly labeled new growth', effects: [{ kind: 'synergyMult', value: 1.22 }] },
    { name: 'Grace', description: 'Favor rests, Archives, recovery, and the path back to ordinary life.', favoredMotivations: ['restorer', 'archivist'], visualSignature: 'an incomplete ring opening toward a descending silver path', effects: [{ kind: 'globalMult', value: 1.08 }, { kind: 'clickShare', value: 0.006 }] },
  ],
  lumen: {
    awakeRemembered: 'We are below the summit again. I remember the way up—and, more importantly, the shelters on the way down.',
    firstRemembered: 'The snowmelt takes another path this time. Memory can guide a return without ordering it.',
    awake: 'The mountain is not waiting to be conquered. Read the routes of snow, shelter, ash, cloud, and return.',
    first: 'Snowmelt is an ending with a recipient. There is a lamp at the lowest shelter and a warm cup beside it. Someone expected us to remember the way down.',
    law: 'Five acts and one rest surround the Still Point. These labels are our working map, not a claim that one tradition has only one account.',
    civil: 'The valley opens refuge before the ridge releases anything. Consequence is part of the act, not a later correction.',
    archive: 'Mountain Witness records what changed, who found shelter, and which path remained open afterward.',
    omen: 'The pass cleared without becoming ours. Visibility can be a gift without being possession.',
    epoch: 'A Release carries Traces forward: not everything, and never nothing.',
    cosmic: 'The late ring does not close around the summit. Completion leaves a deliberate interval for grace.',
    question: 'If an ending protects only the one who initiated it, was it release—or abandonment?',
    beacon: 'The Open Summit remains unoccupied. The way onward begins by returning down the mountain.',
  },
  story: [
    story('The Mountain Is Not a Prize', 'first field note below the snow line', 'The earliest instruction forbids conquest language. Kailash is approached as sacred geography and living relation, never purchased, completed as property, or reduced to a scenic reward.'),
    story('Five Working Acts', 'public teaching map beside the Still Point', 'The interface names emergence, shelter, release, veil, and grace as game-fiction acts. The note explicitly refuses to present them as exhaustive doctrine. A sixth position is a deliberate rest where the player may stop the sequence.'),
    story('Parvati’s Independent Presence', 'a witnessed exchange preserved without portraiture', 'Parvati is named as an independent sacred presence whose agency, practice, and relation cannot be reduced to Shiva’s ornament or the mountain’s palette. The game does not ask the player to direct, collect, or impersonate her.'),
    story('Ganga Beyond the Interface', 'river testimony recorded below the glacier', 'Ganga is acknowledged as a sacred presence, not a resource meter or controllable water effect. The silver river in the interface is an original environmental current; it is not presented as the deity’s body.'),
    story('Nandi at the Boundary', 'keeper’s note outside the playable field', 'Nandi is named with reverence and independent meaning, never as a mount-shaped upgrade, mascot, gate lock, or collectible. No direct figure is rendered pending iconographic review.'),
    story('The Rhythm Not Simulated', 'audio policy etched into the quiet hall', 'The damaru is acknowledged as a sacred attribute and is not sampled, imitated, or turned into a timing toy. The soundtrack uses low wind, stone, water, and bounded neutral percussion instead.'),
    story('Shelter Before Dissolution', 'valley evacuation and refuge ledger', 'Every planned release begins by opening shelter, naming what remains, and tracing downstream consequence. Fire is one late boundary among snow, water, soil, cloud, and grace—not a spectacle or synonym for annihilation.'),
    story('Consent at the Still Point', 'release protocol around an incomplete copper ring', 'The player inspects what returns, what remains, and what is retained before a separate confirmation. Cancel leaves the world unchanged. After confirmation, the world recedes beat by beat with captions, reduced-motion equivalence, and no white flash.'),
    story('Shiva Beyond the Instrument', 'Witness annotation kept outside ordinary mechanics', 'Shiva is approached as a sacred presence whose meanings exceed the game’s organizing theme of dissolution. The Still Point, the five-act map, and the copper ring are original interfaces; none is Shiva, his body, or an instrument the player controls.'),
    story('The Path Down', 'final record at the Open Summit', 'Snow returns as river, ash holds the first new soil, shelters remain open, and the ring leaves one interval unclosed. The completion route turns toward ordinary life and the Garden. Renewal is not a reward pasted after destruction; it is the relation that made release responsible.'),
  ],
  physics: { randomAllowed: true, sequence: { minimumSlots: 4, maximumSlots: 16, roles: ['emergence', 'shelter', 'release', 'veil', 'grace', 'rest'], silentModeEquivalent: true } },
  trials: [
    { name: 'Shelter First', failure: 'The cycle advanced before refuge opened.', rule: 'place shelter before every release act', accessibility: 'Acts are labeled and connected by numbered sequence lines.', rewardEffects: [{ kind: 'globalMult', value: 1.03 }] },
    { name: 'Meaningful Rest', failure: 'Momentum erased the option to stop.', rule: 'use at least three deliberate rests', accessibility: 'Rest positions are open circles labeled REST.', rewardEffects: [{ kind: 'clickShare', value: 0.002 }] },
    { name: 'Visible Consequence', failure: 'An ending hid what followed downstream.', rule: 'alternate release with emergence or grace', accessibility: 'Every act uses text, shape, and position.', rewardEffects: [{ kind: 'synergyMult', value: 1.05 }] },
    { name: 'Quiet Mountain', failure: 'Sound was treated as required ceremony.', rule: 'complete with audio muted', accessibility: 'All timing, consent, and rewards remain visible and captioned.', rewardEffects: [{ kind: 'globalMult', value: 1.03 }] },
    { name: 'Open Ring', failure: 'Completion became enclosure.', rule: 'finish with one rest after grace', accessibility: 'The final open interval is announced explicitly.', rewardEffects: [{ kind: 'critChance', value: 0.01 }] },
    { name: 'Path Downward', failure: 'The summit forgot ordinary life.', rule: 'complete with all five acts and a rest present', accessibility: 'Act coverage and the return path are listed in text.', rewardEffects: [{ kind: 'globalMult', value: 1.08 }] },
  ],
  tempo: 72, meter: 'five-act visible cycle with player-authored rests',
  audioFamilies: ['low mountain wind', 'soft stone contact', 'meltwater thread', 'bounded copper warmth', 'final silence-and-return interval'],
  silenceState: 'Act labels, numbered sequence positions, named front captions, the static weather band, reserve percentage, mountain silhouettes, and the open ring provide complete mechanical equivalence.',
  fatiguePolicy: 'No mantra, raga, temple ceremony, sacred bell, conch, or damaru simulation. Neutral wind, water, stone, and low bounded percussion remain below fatigue limits.',
  routeGlyph: '△', routeArrival: 'a moonlit mountain appears above an open valley while one silver path descends toward shelter', unlockText: 'complete Vishnulok’s Still Horizon passage',
  beaconName: 'Open Summit Beacon', beaconSilhouette: 'five mountain approaches stopping around an unoccupied still point, with one silver path descending through an incomplete copper ring', beaconReward: 6,
  nonColorSignals: [
    { id: 'kailash-emergence', text: 'emergence', shape: 'upward silver thread', pattern: 'one rising line' },
    { id: 'kailash-shelter', text: 'shelter', shape: 'open roof', pattern: 'nested valley bands' },
    { id: 'kailash-release', text: 'release', shape: 'downward triangle', pattern: 'separated ash marks' },
    { id: 'kailash-rest', text: 'rest', shape: 'open circle', pattern: 'bounded empty interval' },
    { id: 'kailash-veil', text: 'veil', shape: 'offset cloud ledges', pattern: 'two broken horizontal lines' },
    { id: 'kailash-grace', text: 'grace', shape: 'open diamond', pattern: 'one lit mark beside the path down' },
    ...KAILASH_FRONT_SIGNALS,
  ],
}

const packs = createFutureUniversePack(KAILASH_SPEC)
export const KAILASH = packs.legacy
export const KAILASH_V2_PACK = packs.v2
