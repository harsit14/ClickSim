import { createFutureUniversePack, type FutureUniverseSpec } from '../future-pack'

const kindling = (name: string, flavor: string, silhouette: string) => ({ name, flavor, silhouette })
const archive = (name: string, glyph: string, observation: string, implication: string, effect: string, silhouette: string) => ({ name, glyph, observation, implication, effect, silhouette })
const story = (title: string, provenance: string, text: string) => ({ title, provenance, text })

/**
 * Brahmalok occupies the save-stable `prismata` / `u5` slot. Runtime IDs stay
 * frozen; every player-facing identity below belongs to the new realm.
 */
export const BRAHMALOK_SPEC: FutureUniverseSpec = {
  id: 'prismata',
  prefix: 'u5',
  name: 'Brahmalok',
  shortName: 'Brahmalok',
  epithet: 'The Unfolding Lotus',
  premise: 'Approach a realm of creation, knowledge, measure, and form where every finished answer must leave room for another beginning.',
  primaryVerb: 'unfold',
  question: 'Can creation remain open to what it did not foresee?',
  currency: 'Possibility',
  currencyGlyph: '✦',
  currencyMaterial: 'uncommitted form carried as seed-light, ink, proportion, and clay',
  heartName: 'Lotus of Becoming',
  heartPhenomenon: 'An abstract four-direction lotus whose center stays open while seed, measure, name, and form exchange possibility.',
  heartSilhouette: 'four nested lotus whorls around an intentionally empty manuscript square',
  heartVerb: 'opens one petal and illuminates the next unanswered direction',
  achievementPower: 'Insight',
  epochName: 'Recomposition',
  epochMatter: 'Folios',
  epochMatterSingular: 'Folio',
  epochGlyph: '▤',
  epochMaterial: 'preserved relationships between an idea, its measure, its name, and its temporary form',
  archiveName: 'Archive of First Forms',
  archiveGlyph: '⌑',
  archiveRecord: 'THE UNCLOSED FOLIO — MARGIN RECORD\n\nA form is not sacred because it was first. A name is not complete because it endured. A measure is not just because it is exact. A seed is not empty because it has not yet chosen a body.\n\nThe lotus remains open at its center. Knowledge is encountered here, never owned. Creation continues only while revision remains possible.\n\n— copied by an unnamed keeper of the outer library',
  palette: { accentHue: 38, bg: '#080810', accent: '#d7a34c', gold: '#fff0c7', panel: 'rgba(22, 16, 24, 0.9)' },
  visualMaterials: ['palm-leaf paper', 'lotus-fiber vellum', 'river ink', 'unfired clay', 'sandalwood geometry', 'hammered gold line', 'dawn-blue enamel'],
  primarySilhouettes: ['a four-direction writing court around an open lotus', 'an inhabited mandala of libraries, gardens, measures, and workshops', 'a thousand-petal horizon whose center remains unclaimed'],
  economy: {
    baseCosts: [13, 162, 2_090, 26_000, 345_600, 4_640_000, 63_750_000, 877_500_000, 12_300_000_000, 173_250_000_000, 700_000_000_000, 22_000_000_000_000, 162_000_000_000_000, 1_740_000_000_000_000, 12_700_000_000_000_000, 138_000_000_000_000_000, 1_020_000_000_000_000_000, 11_800_000_000_000_000_000],
    baseRates: [0.252, 2.835, 27.6, 194.75, 2_187.5, 19_845, 135_300, 1_493_500, 10_560_000, 114_700_000, 843_750_000, 9_275_000_000, 67_500_000_000, 725_800_000_000, 5_280_000_000_000, 57_750_000_000_000, 423_000_000_000_000, 4_920_000_000_000_000],
    costMultiplier: 1.145,
  },
  signatureUpgrades: (generators) => [
    { id: 'u5-complementary-pairs', name: 'Fourfold Correspondence', flavor: 'A distant direction answers without becoming identical.', cost: 2e7, glyph: '⌘', hue: 38, unlock: { gen: generators[5].id, count: 10 }, effects: [{ kind: 'synergy', gen: generators[5].id, per: generators[0].id, value: 0.015 }] },
    { id: 'u5-fluorescent-memory', name: 'Marginal Memory', flavor: 'A page keeps the revisions that its final copy could have erased.', cost: 5e10, glyph: '⌜', hue: 332, unlock: { gen: generators[7].id, count: 25 }, effects: [{ kind: 'globalMult', value: 1.35 }] },
    { id: 'u5-labeled-white', name: 'Open Manuscript', flavor: 'The finished folio leaves one ruled space for an unforeseen hand.', cost: 3e16, glyph: '▤', hue: 206, unlock: { gen: generators[15].id, count: 10 }, effects: [{ kind: 'globalMult', value: 1.6 }, { kind: 'synergyMult', value: 1.25 }] },
  ],
  kindlings: [
    kindling('Seed Point', 'Possibility gathers at one point without being told what it must become.', 'single seed-dot held inside four unfinished compass strokes'),
    kindling('First Petal', 'The smallest opening proves that a center can make room without disappearing.', 'one broad lotus petal rising from an open square'),
    kindling('Measure Line', 'A line proposes proportion, then waits to be corrected by what it measures.', 'golden rule line with two movable end marks'),
    kindling('Naming Reed', 'A reed makes a mark without claiming the marked thing as property.', 'cut writing reed crossing one blank palm leaf'),
    kindling('Clay Thought', 'An idea accepts weight, texture, and the right to be remade.', 'unfired clay spiral beside a thumb-sized hollow'),
    kindling('Ink Spring', 'Knowledge enters the page as a current rather than a possession.', 'ink well fed by three narrow river channels'),
    kindling('Fourfold Loom', 'Seed, measure, name, and form begin weaving reciprocal obligations.', 'square loom with four differently patterned warp directions'),
    kindling('Memory Pool', 'Each revision remains visible beneath the newest reflection.', 'stepped pool holding four offset manuscript reflections'),
    kindling('Pattern Heron', 'A living proportion walks out of the diagram and changes it.', 'long-legged bird traced by an incomplete geometric grid'),
    kindling('Script Garden', 'Letters grow beside shapes they cannot fully contain.', 'terraced garden of leaf-like marks and open labels'),
    kindling('Geometry Hall', 'Public measures meet here to disclose where their certainty ends.', 'four-pillared hall around an unnumbered central plinth'),
    kindling('Artisan Constellation', 'Makers exchange techniques across distances no single workshop can see.', 'tool-star network joined by hand-drawn construction arcs'),
    kindling('Library Moon', 'A moon of shelves changes phase as different questions are read.', 'crescent library with open folios along its inner rim'),
    kindling('Calendar of Dawns', 'Every beginning receives a date; none is declared the last.', 'radial calendar whose final dawn cell remains blank'),
    kindling('Celestial Workshop', 'World-scale forms are tested, repaired, and returned to possibility.', 'open workshop canopy holding clay planets and measure rings'),
    kindling('Horizon Manuscript', 'The edge of the realm becomes a sentence still being written.', 'long palm-leaf horizon crossed by four rising strokes'),
    kindling('Thousand-Petal Sky', 'Difference multiplies without forcing the center closed.', 'layered petal vault with many distinct contour families'),
    kindling('The Open Lotus', 'Completion appears as a passage that refuses ownership.', 'immense lotus mandala with an empty square at its heart'),
  ],
  archives: [
    archive('The Unwritten Palm Leaf', '▭', 'A prepared leaf carries ruled lines but no authorized first sentence.', 'The keepers treated blankness as an active invitation, not missing content.', 'strengthens Seed work while a direction remains open', 'long ruled leaf with one uncut margin'),
    archive('Seed Without Species', '•', 'A seed has every structural sign of life and none of a known plant.', 'Its first record asks who benefits when possibility is classified too early.', 'adds an uncommitted seed to every new mandala', 'dark seed held by four incomplete botanical diagrams'),
    archive('Compass of Four Questions', '⌘', 'Its arms are labeled what, how much, what name, and what form.', 'No arm is called north; orientation begins with inquiry rather than authority.', 'makes all four creation directions readable without color', 'four-armed compass around a question-shaped center'),
    archive('River-Ink Vessel', '⌁', 'A writing vessel refills from a current that passes through the Archive.', 'The text remains accountable to everything carried downstream.', 'improves stored manuscript memory', 'ink bowl crossed by one continuous river line'),
    archive('Clay Alphabet', '▦', 'Eighteen soft signs can be rearranged before they are fired.', 'The old scribes delayed permanence until every reader could touch the sentence.', 'strengthens Form without freezing its route', 'grid of pressed clay signs with visible fingerprints'),
    archive('Lotus Shadow Map', '✤', 'A flower outside the chamber casts a shadow with one extra petal.', 'The missing source cannot be inventoried; its effect can still be acknowledged.', 'reveals relationships beyond the current mandala', 'petal shadow extending beyond a square survey frame'),
    archive('Breath Between Verses', '〰', 'Two lines are separated by a deliberately measured silence.', 'Meaning depends on the interval that no word occupies.', 'extends active creation opportunities', 'paired manuscript lines divided by a bowed empty band'),
    archive('Library of Blank Margins', '⌜', 'Every volume reserves more space for response than for declaration.', 'The collection values correction as highly as authorship.', 'preserves mandala choices through Recomposition', 'stacked folios with luminous outer margins'),
    archive('Broken Completion Seal', '◫', 'A certification stamp was cut before its final enclosing stroke.', 'The incomplete mark prevented one successful design from becoming compulsory.', 'turns unfinished directions into a bounded bonus', 'square seal missing its upper-right boundary'),
    archive('Measure Without Edge', '∞', 'A rule marks intervals but has neither first nor final notch.', 'Precision becomes useful only after surrendering the fantasy of a total boundary.', 'improves balanced four-direction layouts', 'parallel measure rails receding through an open frame'),
    archive('Loom of Possible Bodies', '⋈', 'Its warp can hold architectural, botanical, musical, or unclassified patterns.', 'Form is treated as a relationship among materials, not a hierarchy of bodies.', 'improves saved creation layouts', 'four-way loom with mutually crossing pattern families'),
    archive('The Unclosed Folio', '▤', 'The final record ends with a ruled square and no signature.', 'Brahmalok offers continuation, not possession; the next hand must remain free.', 'completes the Archive and reveals the Open Lotus', 'open folio whose final square aligns with a lotus center'),
  ],
  shelfNames: ['First Thought', 'Given Form', 'Open Future'],
  shelfRewards: ['Seeds and questions strengthen one another without choosing a final body.', 'Measure, name, and form return useful revisions to every Kindling.', 'The Open Lotus strengthens creation while preserving its empty center.'],
  omens: [
    { name: 'First Dawn', description: 'A new horizon briefly makes the next unanswered direction more productive.', silhouette: 'thin dawn arc rising behind four manuscript pillars', motion: 'optical', effects: [{ kind: 'clickMult', value: 1.25 }] },
    { name: 'Ink Rain', description: 'Visible drops connect revisions that were previously stored apart.', silhouette: 'three columns of ink drops joining offset folio lines', motion: 'optical', effects: [{ kind: 'globalMult', value: 1.12 }] },
    { name: 'Petal Turning', description: 'One lotus whorl rotates to expose a neglected direction without erasing the others.', silhouette: 'four-petal ring with one raised patterned segment', motion: 'optical', effects: [{ kind: 'critChance', value: 0.02 }] },
    { name: 'Margin Opens', description: 'A blank edge becomes a temporary route for an unforeseen creation.', silhouette: 'manuscript border opening into a long unruled path', motion: 'optical', effects: [{ kind: 'clickShare', value: 0.01 }] },
  ],
  doctrines: [
    { name: 'Germination', description: 'Concentrate possibility in the strongest direction until a first form can open.', favoredMotivations: ['optimizer', 'performer'], visualSignature: 'one seed point sending roots into a single broad petal', effects: [{ kind: 'clickMult', value: 1.35 }] },
    { name: 'Fourfold Mandala', description: 'Balance seed, measure, name, and form into a reciprocal creation field.', favoredMotivations: ['restorer', 'optimizer'], visualSignature: 'four patterned courts surrounding one deliberately empty square', effects: [{ kind: 'globalMult', value: 1.14 }] },
    { name: 'Manuscript Memory', description: 'Store revisions and offline possibility in visible margins.', favoredMotivations: ['restorer', 'archivist'], visualSignature: 'overlaid folios whose earlier lines remain readable', effects: [{ kind: 'globalMult', value: 1.08 }, { kind: 'critChance', value: 0.01 }] },
    { name: 'Proliferation', description: 'Spread possibility across many distinct forms and active openings.', favoredMotivations: ['performer', 'archivist'], visualSignature: 'many different petals growing from one open but unoccupied center', effects: [{ kind: 'clickShare', value: 0.01 }] },
  ],
  lumen: {
    awake: 'This is not another broken world. The lotus opened before we arrived and does not need us to finish it.',
    first: 'A Seed Point is possibility without an assigned body. Also, a loose page has caught in my sleeve three times. I think it has decided we are its margin.',
    law: 'Seed, measure, name, form. Move one Kindling and the whole mandala must answer for the change.',
    civil: 'The Memory Pool keeps every revision beneath the newest page. Knowledge here refuses the clean lie of a final draft.',
    archive: 'The Archive of First Forms records beginnings, corrections, and all the hands that declined to sign the final margin.',
    omen: 'That dawn did not reward a finished answer. It illuminated the direction we had neglected.',
    epoch: 'Recomposition preserved a relationship as a Folio, then returned the forms themselves to possibility.',
    cosmic: 'The Calendar of Dawns numbers beginnings without promising that any one of them owns the future.',
    question: 'I used to call knowledge a record because records could belong to me. This realm keeps correcting the verb.',
    beacon: 'The Open Lotus is not ours. It is allowing a passage because we finally stopped asking what we could take through it.',
  },
  story: [
    story('A Passage, Not a World', 'written across the first outer petal', 'Clockwork taught the Wayfinder to expect ruins, economies, and a final machine. Brahmalok answers with none of them. The realm is already alive with making. Its first instruction is a boundary: approach what is here; do not call restoration what would merely make it resemble you.'),
    story('The Four Questions', 'engraved around the Lotus of Becoming', 'Four directions ask what may begin, how it may be measured, what name permits relationship, and what form can remain revisable. No direction rules the others. A design that cannot answer all four is returned gently to the open center.'),
    story('The Unwritten Leaf', 'a palm-leaf folio prepared by unnamed keepers', 'The first page remains blank by agreement. Every visitor may propose a beginning on the second leaf, but none may claim to have authored the possibility that made beginning available. The blank page is not worshipped. It is protected from ownership.'),
    story('Measure and the Measured', 'construction marks beneath the Geometry Hall', 'Exact proportions fill the hall, accompanied by records of whom each proportion excluded. The makers revised doors after meeting unfamiliar bodies, revised calendars after hearing unfamiliar seasons, and revised the word universal whenever the world provided another exception.'),
    story('Knowledge Is a Presence', 'heard where the Archive opens onto running water', 'The keepers speak of Saraswati as an independent sacred presence of learning, speech, music, and knowledge—not an upgrade, assistant, collectible, or possession. The game offers no portrait and no command. Pages lift in a river breeze, and Lumen lowers their voice.'),
    story('Many Forms, No Final Form', 'woven into the Fourfold Loom', 'A pattern may become a shelter, a garden, a score, or something the current language cannot classify. The loom ranks none of these as a higher body. Its only permanent rule is that every finished form must preserve a route back to revision.'),
    story('Recomposition Procedure', 'copied inside the binding of a preserved Folio', 'Release current Possibility, Kindlings, ordinary refinements, and buy mode. Preserve the relationships among seed, measure, name, and form as one Folio. Retain Archives, Echoes, deeper laws, and every freely chosen mandala route. Preview the loss. Require consent. Creation without revision becomes enclosure.'),
    story('The Lotus Beyond Ownership', 'a horizon survey that refuses a center coordinate', 'Every map can describe the petals and none can assign the open center. The surveyors eventually stop calling this a technical failure. Their last annotation reads: a passage can welcome us without becoming ours, and a mystery can remain meaningful without becoming inventory.'),
    story('Lumen Corrects the Catalogue', 'a marginal note written after the ninth Archive record', 'Lumen replaces acquired with encountered, specimen with record, and completed with heard as far as the interface permits. “My oldest habit is turning relation into possession,” they write. “Please keep noticing when I do it politely.”'),
    story('The Open Lotus', 'the final folio aligned with the realm horizon', 'Seed, measure, name, and form answer one another. The lotus opens without placing a throne, tool, portrait, or prize at its center. Beyond it lies the sustaining realm. Behind it, Brahmalok continues creating without waiting for the player to leave or return.'),
  ],
  physics: {
    randomAllowed: true,
    spectrum: {
      bandIds: ['u5-seed', 'u5-measure', 'u5-name', 'u5-form'],
      recipeIds: ['germination', 'mandala', 'memory', 'proliferation'],
      freeReconfiguration: true,
      nonColorLabelsRequired: true,
    },
  },
  trials: [
    { name: 'Seed Without Shape', failure: 'Possibility was forced into the first familiar body.', rule: 'unfold while the Form direction remains empty', accessibility: 'The empty Form direction is labeled in text and shown as an open outline.', rewardEffects: [{ kind: 'clickMult', value: 1.05 }] },
    { name: 'Measure Without Rank', failure: 'Precision became a hierarchy instead of a tool for relation.', rule: 'use Germination while maintaining all four creation directions', accessibility: 'The strongest direction is named and patterned; exact quantities remain visible.', rewardEffects: [{ kind: 'globalMult', value: 1.03 }] },
    { name: 'The Nameless Page', failure: 'A record was treated as unreal because no approved title contained it.', rule: 'complete a mandala with the Name direction deliberately smallest', accessibility: 'Name is identified by a reed glyph, diagonal hatch, and text.', rewardEffects: [{ kind: 'critChance', value: 0.01 }] },
    { name: 'Unfinished Form', failure: 'A successful design was protected from every later correction.', rule: 'use alternating Kindling tiers only', accessibility: 'Available stations carry consecutive text labels and distinct silhouettes.', rewardEffects: [{ kind: 'clickShare', value: 0.002 }] },
    { name: 'The Empty Margin', failure: 'Every open space was mistaken for unused capacity.', rule: 'reach the target without Fourfold Mandala', accessibility: 'Mode state remains available through labels, geometry, and patterns.', rewardEffects: [{ kind: 'synergyMult', value: 1.05 }] },
    { name: 'Four Directions', failure: 'One act of making claimed to contain the whole of creation.', rule: 'finish with seed, measure, name, and form within ten percent balance', accessibility: 'Exact direction quantities and imbalance percentages are announced.', rewardEffects: [{ kind: 'globalMult', value: 1.08 }] },
  ],
  tempo: 84,
  meter: 'four-part material cycle of seed, measure, name, and form; no devotional melody is imitated',
  audioFamilies: ['soft reed contact and one page breath', 'wood, clay, and ink interval', 'four material taps resolving around silence', 'paper edge and water-drop call', 'folio-close cadence with an open final interval'],
  silenceState: 'Every direction remains readable through its name, glyph, pattern, position, quantity, and open-center geometry.',
  fatiguePolicy: 'Reed and page transients soften above four inputs per second; no chant, mantra, raga, or sacred instrument performance is simulated.',
  routeGlyph: '✤',
  routeArrival: 'a lotus of writing courts opens around an empty center, with no figure or object offered for possession',
  unlockText: 'witness Clockwork’s Unscheduled Interval',
  beaconName: 'Open Lotus Seal',
  beaconSilhouette: 'thousand-petal abstract lotus surrounding one unoccupied manuscript square',
  beaconReward: 4,
  nonColorSignals: [
    { id: 'u5-germination', text: 'germination', shape: 'one seed beneath a broad petal', pattern: 'solid center with rising contour' },
    { id: 'u5-mandala', text: 'fourfold mandala', shape: 'four courts around an open square', pattern: 'dot, ruled line, diagonal hatch, clay blocks' },
    { id: 'u5-memory', text: 'manuscript memory', shape: 'three offset folios', pattern: 'dotted earlier revisions' },
    { id: 'u5-proliferation', text: 'proliferation', shape: 'many unequal petals', pattern: 'numbered outward whorls' },
  ],
}

/** @deprecated Save-slot compatibility name. Prefer BRAHMALOK_SPEC in new code. */
export const PRISMATA_SPEC = BRAHMALOK_SPEC

const packs = createFutureUniversePack(BRAHMALOK_SPEC)

export const PRISMATA = packs.legacy
export const PRISMATA_V2_PACK = packs.v2
