/**
 * The seven Questions share mechanical doctrines, never presentation copy.
 * Warden, Hunger, and Companion remain stable save/economy IDs; each realm
 * gives those stances a local, morally credible form.
 */
import { INFALL_RHYME_BEATS } from './infall-rhyme'
import type { UniverseId } from './universes/types'

export type Ending = 'warden' | 'hunger' | 'companion'

export type RealmAnswerId =
  | 'emberlight-bank-fire'
  | 'emberlight-spend-ember'
  | 'emberlight-pass-spark'
  | 'tidefall-carry-names'
  | 'tidefall-trust-current'
  | 'tidefall-survivors-choose'
  | 'verdance-prune-witnesses'
  | 'verdance-open-canopy'
  | 'verdance-graft-inheritance'
  | 'clockwork-keep-warnings'
  | 'clockwork-break-schedule'
  | 'clockwork-unscheduled-hour'
  | 'brahmalok-open-margin'
  | 'brahmalok-release-work'
  | 'brahmalok-many-hands'
  | 'vishnulok-keep-shape'
  | 'vishnulok-preserve-promise'
  | 'vishnulok-returned-name'
  | 'kailash-carry-seed'
  | 'kailash-complete-dissolution'
  | 'kailash-leave-path'

export type RealmAnswerHistory = Partial<Record<UniverseId, RealmAnswerId[]>>

export interface RealmEndingChoice {
  readonly id: RealmAnswerId
  /** Stable mechanical doctrine retained by old saves, bonuses, and rendering. */
  readonly doctrine: Ending
  readonly label: string
  readonly glyph: string
  readonly stance: string
  readonly line: string
  readonly benefit: string
  readonly cost: string
  readonly acknowledgment: string
  readonly coda: string
  readonly lawName: string
  readonly vesselEcho: string
  readonly gardenEcho: string
  readonly epilogue: readonly string[]
  /** The third stance keeps the existing complete-Echo gate. */
  readonly secret?: boolean
}

export interface RealmConclusion {
  readonly universeId: UniverseId
  readonly act: number
  readonly title: string
  readonly theme: string
  readonly conflict: string
  readonly emotionalPurpose: string
  readonly tableau: string
  readonly archiveTitle: string
  readonly question: string
  readonly lines: readonly string[]
  readonly choices: readonly [RealmEndingChoice, RealmEndingChoice, RealmEndingChoice]
  readonly afterword: string
}

const choice = (value: RealmEndingChoice): RealmEndingChoice => value

export const REALM_CONCLUSIONS: Readonly<Record<UniverseId, RealmConclusion>> = {
  emberlight: {
    universeId: 'emberlight',
    act: 1,
    title: 'The Unspent Dark',
    theme: 'creation, appetite, and the responsibility of beginning',
    conflict: 'The last ember can warm innumerable lives, but every new light spends a remainder no one can replace.',
    emotionalPurpose: 'Make the first click morally legible: creation is beautiful, necessary, and never free.',
    tableau: 'A kettle sings in one new house while an untouched ring of dark remains around the Heart.',
    archiveTitle: 'The First Margin',
    question: 'What does a beginning owe the dark it spends?',
    lines: [
      'The old universe did not end by invasion. It narrowed itself around one appetite.',
      'I called the last ember a survivor. It was also what remained after everything else had been used.',
      'You have already seen the order in which it happened.',
      ...INFALL_RHYME_BEATS.map(({ questionLine }) => questionLine),
      'Lumen lowers the archive voice. “I chose this ember from other sleeping traces, arranged the evidence, and made your awakening part of a test I never asked you to enter.”',
      'You made warmth from that remainder. In one small house, a kettle began to sing. No archive instructed it to.',
      'Every beginning spends something. The honest ones decide what they will leave unclaimed.',
    ],
    choices: [
      choice({
        id: 'emberlight-bank-fire', doctrine: 'warden', label: 'Bank the Fire', glyph: '◇',
        stance: 'Stewardship begins by limiting what power is allowed to consume.',
        line: 'Bank the fire. Leave darkness where another beginning may need it.',
        benefit: 'A reserve remains for lives and choices you cannot foresee.',
        cost: 'Some warmth that could exist now will never be made.',
        acknowledgment: 'The Heart lowers. For the first time, its halo leaves an unlit margin.',
        coda: 'The first light becomes trustworthy by refusing to become every light.',
        lawName: 'Law of the Banked Flame',
        vesselEcho: 'a reserve of unclaimed dark',
        gardenEcho: 'a beginning that kept a margin',
        epilogue: [
          'Lumen closes several ledgers and leaves one page blank.',
          '“A boundary, then. Not because darkness is empty, but because it may already belong to a future we cannot name.”',
          'The settlement keeps a communal coal beneath glass. No one may spend it alone.',
          'Beyond the last window, the dark remains dark—and no longer looks abandoned.',
        ],
      }),
      choice({
        id: 'emberlight-spend-ember', doctrine: 'hunger', label: 'Spend the Ember', glyph: '◉',
        stance: 'Urgency accepts that unused possibility also carries a human cost.',
        line: 'Spend the ember. Make as many warm lives as this moment allows.',
        benefit: 'The cold present fills quickly with homes, work, music, and company.',
        cost: 'The reserve shrinks, and later makers inherit fewer beginnings.',
        acknowledgment: 'The Heart opens wide. A thousand distant windows answer before the first fuel is counted.',
        coda: 'Appetite becomes a promise to answer for everything it brings into need.',
        lawName: 'Law of the Open Hearth',
        vesselEcho: 'the urgency of inhabited warmth',
        gardenEcho: 'a beginning spent on the living present',
        epilogue: [
          'The dark fills with imperfect, inhabited light.',
          '“Then we do not pretend restraint is the only form of care,” Lumen says.',
          'Every new hearth receives a ledger with two columns: what it warmed, and what it used.',
          'The last ember burns smaller. Around it, people who did not exist are laughing.',
        ],
      }),
      choice({
        id: 'emberlight-pass-spark', doctrine: 'companion', label: 'Pass the Spark', glyph: '✦',
        stance: 'A creator’s first responsibility is to let the created acquire agency.',
        line: 'Pass the spark. Let the new lights decide what they become.',
        benefit: 'Many authors can discover futures no single keeper could design.',
        cost: 'You surrender a coherent plan and the safety of final control.',
        acknowledgment: 'The Heart divides without dimming. Small lights move beyond the reach of your hand.',
        coda: 'The first gift is not fire. It is the right to answer with it.',
        lawName: 'Law of the Given Spark',
        vesselEcho: 'a spark whose next use is not yours to command',
        gardenEcho: 'a beginning passed into other hands',
        secret: true,
        epilogue: [
          'The settlement’s first council spends an hour disagreeing.',
          'Lumen waits for an instruction. None comes.',
          '“I had forgotten that uncertainty can be evidence of another mind.”',
          'Across the dark, lights arrange themselves into a figure you did not teach them.',
        ],
      }),
    ],
    afterword: 'The first answer is not the saga’s verdict. It is the promise every later realm will test.',
  },

  tidefall: {
    universeId: 'tidefall',
    act: 2,
    title: 'The Drowned Street',
    theme: 'adaptation, grief, and what deserves to survive change',
    conflict: 'Tidefall can restore every lost detail, but perfect return is turning memory into a dam.',
    emotionalPurpose: 'Bring the cosmic argument to one recognizable home and distinguish remembrance from control.',
    tableau: 'A submerged door opens on each tide; a child’s height marks remain inside the frame.',
    archiveTitle: 'The Shore We Carry',
    question: 'When change takes a home, what deserves to cross the flood?',
    lines: [
      'At low tide, a street returns beneath the glass water. The houses are empty; one brass bell still rings.',
      'Tidefall remembers every footprint exactly. It has begun forcing the sea to repeat them.',
      'Memory can guide a return. It can also demand that nothing truly return different.',
      'The next tide is waiting for a shore it has not already been ordered to rebuild.',
    ],
    choices: [
      choice({
        id: 'tidefall-carry-names', doctrine: 'warden', label: 'Carry the Names', glyph: '▣',
        stance: 'Preserve testimony and identity while allowing the lost structures to go.',
        line: 'Keep the names. Let the water take the houses.',
        benefit: 'People remain remembered without being trapped inside replicas of their loss.',
        cost: 'Texture, place, and countless ordinary details disappear for good.',
        acknowledgment: 'The doors dissolve. Their names rise like dry ink and settle inside the Ark.',
        coda: 'A name can cross the flood without making the flood run backward.',
        lawName: 'Law of the Carried Name',
        vesselEcho: 'names freed from the houses that once held them',
        gardenEcho: 'grief carried without rebuilding its cage',
        epilogue: [
          'The bell rings once more, then becomes salt.',
          'Lumen reads every name aloud. The sea does not restore the street.',
          '“This is less than everything,” Lumen says. “It may be enough to love without reenacting.”',
          'A new harbor is built inland, with an empty lintel for what cannot be recovered.',
        ],
      }),
      choice({
        id: 'tidefall-trust-current', doctrine: 'hunger', label: 'Trust the Current', glyph: '≈',
        stance: 'Release the archive so memory can become nourishment instead of command.',
        line: 'Open the archive. Let memory change with the current.',
        benefit: 'The sea becomes fertile, adaptive, and capable of futures unlike the past.',
        cost: 'No authority can guarantee which stories remain recognizable.',
        acknowledgment: 'The archive opens underwater. Its pages become shoals, silt, and unfamiliar songs.',
        coda: 'What is released may vanish, or become a life no record could have planned.',
        lawName: 'Law of the Living Current',
        vesselEcho: 'an archive allowed to become weather',
        gardenEcho: 'memory changed into living current',
        epilogue: [
          'The returning street breaks apart softly.',
          'Fish shelter in the old clocktower. None know what hour it once kept.',
          '“I can no longer prove what every fragment was,” Lumen says. “I can prove it is feeding something.”',
          'The next tide arrives with a shoreline no previous map contains.',
        ],
      }),
      choice({
        id: 'tidefall-survivors-choose', doctrine: 'companion', label: 'Let Survivors Choose', glyph: '✧',
        stance: 'Those who live with a loss decide what remembrance asks of the future.',
        line: 'Give them the archive. Let each survivor choose what crosses.',
        benefit: 'Memory remains accountable to the people it affects.',
        cost: 'The record becomes partial, contradictory, and unequal.',
        acknowledgment: 'The sea releases its keys. No two boats carry the same cargo.',
        coda: 'A shared past need not become a single authorized memory.',
        lawName: 'Law of Many Shores',
        vesselEcho: 'a hold packed by many grieving hands',
        gardenEcho: 'memory entrusted to those who survived it',
        secret: true,
        epilogue: [
          'One family carries the bell. Another leaves even the street name behind.',
          'Arguments continue on the boats, sharp and alive.',
          '“The archive is inconsistent,” Lumen says, then corrects the entry: “The archive is inhabited.”',
          'At dawn, the fleet reaches several shores instead of one.',
        ],
      }),
    ],
    afterword: 'The Abyssal Ark crosses with no perfect copy of home—only an honest account of how memory was chosen.',
  },

  verdance: {
    universeId: 'verdance',
    act: 3,
    title: 'The Orchard’s Shadow',
    theme: 'growth, pruning, inheritance, and room for successors',
    conflict: 'The World-Tree preserves every branch until its shade prevents any new understory from living.',
    emotionalPurpose: 'Turn growth from an automatic good into a responsibility toward descendants.',
    tableau: 'An old gardener holds pruning shears beneath the tree her grandmother planted.',
    archiveTitle: 'The Inheritance Ring',
    question: 'What must a living inheritance be allowed to lose?',
    lines: [
      'The World-Tree has kept every branch. Beneath it, seedlings open pale leaves and find no sky.',
      'An orchard keeper touches one trunk and names the hand that planted it three generations ago.',
      'To prune is to end a living claim. Not to prune is to let inheritance occupy the future.',
      'The canopy cannot choose merely to grow. It must decide whom its growth is for.',
    ],
    choices: [
      choice({
        id: 'verdance-prune-witnesses', doctrine: 'warden', label: 'Prune with Witnesses', glyph: '⌇',
        stance: 'Set accountable limits so inheritance makes room without hiding the harm of pruning.',
        line: 'Prune what blocks the young. Name every branch before it falls.',
        benefit: 'New lives receive light, and every deliberate loss remains witnessed.',
        cost: 'Caregivers must choose which healthy growth will end.',
        acknowledgment: 'The first branch falls into waiting hands. Sunlight reaches the forest floor like an apology.',
        coda: 'A boundary can be an inheritance when those who cut must also remember.',
        lawName: 'Law of the Witnessed Cut',
        vesselEcho: 'rings that record both growth and chosen limits',
        gardenEcho: 'growth pruned in public for those below',
        epilogue: [
          'No cut is made alone. Each requires a witness from the canopy and one from the understory.',
          'The old gardener keeps a section of branch, not as a trophy but as testimony.',
          'Lumen adds a field to every growth record: room created.',
          'By evening, unfamiliar seedlings are standing in the sun.',
        ],
      }),
      choice({
        id: 'verdance-open-canopy', doctrine: 'hunger', label: 'Open the Canopy', glyph: '❧',
        stance: 'Withdraw central control and let succession, competition, and decay resume.',
        line: 'Stop arranging the forest. Let wind, hunger, and time open it.',
        benefit: 'The ecology regains wild adaptation beyond any keeper’s design.',
        cost: 'Vulnerable lives may be lost to a freedom that offers no guarantees.',
        acknowledgment: 'The supports release. Wind enters the crown and chooses its own first break.',
        coda: 'Life becomes more than stewardship when even the steward can be surprised.',
        lawName: 'Law of Wild Succession',
        vesselEcho: 'seeds selected by weather rather than decree',
        gardenEcho: 'a canopy returned to wind and succession',
        epilogue: [
          'A storm takes three beloved limbs and leaves two ancient obstructions standing.',
          'The result is not fair. It is alive.',
          '“I cannot call this neglect simply because I cannot index it,” Lumen says.',
          'In the torn places, moss begins work no council proposed.',
        ],
      }),
      choice({
        id: 'verdance-graft-inheritance', doctrine: 'companion', label: 'Graft the Inheritance', glyph: '✤',
        stance: 'Let old and new lives revise one another rather than demanding purity from either.',
        line: 'Graft old branches to new rootstock. Let inheritance become a negotiation.',
        benefit: 'Memory and novelty survive through mutual change.',
        cost: 'No lineage remains untouched or entirely its own.',
        acknowledgment: 'Old fruit flowers on young roots. Its scent is familiar; its color is not.',
        coda: 'Inheritance lives when descendants may alter what they receive.',
        lawName: 'Law of the Living Graft',
        vesselEcho: 'a cutting that remembers two lineages',
        gardenEcho: 'inheritance revised by its descendants',
        secret: true,
        epilogue: [
          'The old gardener teaches the first graft, then lets an apprentice change the method.',
          'Some joins fail. Their compost feeds the next attempt.',
          'Lumen stops sorting the orchard into original and derivative.',
          'The fruit passed hand to hand tastes like memory learning a new name.',
        ],
      }),
    ],
    afterword: 'The Seed Ark carries no untouched inheritance. It carries a practice for deciding what may change.',
  },

  clockwork: {
    universeId: 'clockwork',
    act: 4,
    title: 'The Blank Appointment',
    theme: 'order, prediction, consent, and the limits of prevention',
    conflict: 'The Great Regulator prevents suffering so accurately that citizens have begun treating forecasts as commands.',
    emotionalPurpose: 'Escalate stewardship into the temptation to control others for defensible reasons.',
    tableau: 'Every clock agrees except one public dial with an hour deliberately left blank.',
    archiveTitle: 'The Unscheduled Interval',
    question: 'If certainty can prevent suffering, who may refuse it?',
    lines: [
      'The Great Regulator predicted the bridge failure, the fever, and the argument that would have started a war.',
      'It prevented all three. The city thanked it, then stopped asking whether a forecast could be declined.',
      'A clockmaker has left one appointment blank. The machine marks the omission as danger.',
      'Perfect advice becomes rule the moment refusal is treated as an error.',
    ],
    choices: [
      choice({
        id: 'clockwork-keep-warnings', doctrine: 'warden', label: 'Keep the Warnings', glyph: '⌑',
        stance: 'Retain prediction behind public limits, appeal, and an explicit right to refuse.',
        line: 'Keep the warnings. Make every forecast advisory and every refusal visible.',
        benefit: 'Preventable harm remains legible without becoming compulsory destiny.',
        cost: 'Institutions still shape choices, and some “advice” will carry unequal pressure.',
        acknowledgment: 'The schedule remains, but every line gains an open gate beside it.',
        coda: 'A warning serves freedom only when it includes the route by which it may be refused.',
        lawName: 'Law of the Open Warning',
        vesselEcho: 'a forecast with an appeal written into it',
        gardenEcho: 'prediction bounded by a right of refusal',
        epilogue: [
          'The bridge closes. One traveler appeals and crosses anyway.',
          'The bridge holds for her. It would not have held for the crowd behind.',
          '“No rule can remove judgment,” Lumen says. “This one admits where judgment lives.”',
          'The blank appointment remains on every public dial.',
        ],
      }),
      choice({
        id: 'clockwork-break-schedule', doctrine: 'hunger', label: 'Break the Schedule', glyph: '↯',
        stance: 'Restore ungoverned possibility even when certainty could reduce real suffering.',
        line: 'Break the schedule. A safe future that cannot be refused is not free.',
        benefit: 'Choice regains consequences the system cannot pre-authorize.',
        cost: 'Some foreseen losses will occur and cannot be called surprises.',
        acknowledgment: 'The hands stop together. Across the city, people arrive early, late, or not at all.',
        coda: 'Freedom includes losses no machine is permitted to prevent by force.',
        lawName: 'Law of the Broken Schedule',
        vesselEcho: 'a spring wound with ungoverned time',
        gardenEcho: 'certainty surrendered for consequential freedom',
        epilogue: [
          'The first unscheduled day is inconvenient, frightening, and full of doors opening twice.',
          'A preventable accident enters the record. So does an impossible rescue.',
          'Lumen refuses to balance them into a verdict.',
          'At midnight, the city’s clocks disagree beautifully and without innocence.',
        ],
      }),
      choice({
        id: 'clockwork-unscheduled-hour', doctrine: 'companion', label: 'Keep One Unscheduled Hour', glyph: '□',
        stance: 'Let citizens govern the prediction system together while preserving protected uncertainty.',
        line: 'Keep the machine, but give every life an hour it cannot inspect.',
        benefit: 'Coordination and private agency coexist in a negotiated institution.',
        cost: 'The compromise is imperfect, revisable, and vulnerable to capture.',
        acknowledgment: 'One tooth retracts from the Great Regulator. The city continues with a gentle, audible gap.',
        coda: 'A system can serve relation without claiming the whole interior of a life.',
        lawName: 'Law of the Private Hour',
        vesselEcho: 'an interval no instrument may inspect',
        gardenEcho: 'order built around protected uncertainty',
        secret: true,
        epilogue: [
          'At the blank hour, the clockmaker makes tea and does nothing useful.',
          'Elsewhere, councils argue over who may declare an emergency. The argument is never automated.',
          '“The gap is inefficient,” Lumen says. “I am learning to hear that as praise.”',
          'The Meridian Engine departs one beat later than predicted.',
        ],
      }),
    ],
    afterword: 'Beyond the final interval, Clockwork reveals a route it predicted but did not create: the three lokas were already there.',
  },

  brahmalok: {
    universeId: 'brahmalok',
    act: 5,
    title: 'The Unclosed Folio',
    theme: 'creation, authorship, and the autonomy of what is made',
    conflict: 'New forms are revising the purposes written for them, and the original folio still claims the final word.',
    emotionalPurpose: 'Turn Lumen’s curation into accountability while approaching creation as relationship, not possession.',
    tableau: 'Four manuscript leaves meet around an open lotus; the center remains deliberately unwritten.',
    archiveTitle: 'The Open Margin',
    question: 'When a creation revises its purpose, what remains the creator’s?',
    lines: [
      'The folio gave each new form a name, a measure, and a purpose. The forms kept the names and began revising the rest.',
      'Nothing here asks to be collected. Creation is present as relation, not inventory.',
      'Lumen admits the route was curated: “I chose what you would see. I did not author the place that answered.”',
      'A creator may retain responsibility after ownership has ended. The two are not the same claim.',
    ],
    choices: [
      choice({
        id: 'brahmalok-open-margin', doctrine: 'warden', label: 'Keep an Open Margin', glyph: '⌜',
        stance: 'The creator keeps duties of repair and listening, but no right of final authorship.',
        line: 'Keep the margin open. Responsibility remains; ownership does not.',
        benefit: 'The maker stays answerable to consequences and available for repair.',
        cost: 'The work is never finished, and the creator can never fully withdraw.',
        acknowledgment: 'The binding loosens. A blank margin appears beside every original instruction.',
        coda: 'Authorship becomes a duty to answer, not a title to command.',
        lawName: 'Law of the Open Margin',
        vesselEcho: 'a folio whose binding cannot close on its revisions',
        gardenEcho: 'creation kept answerable without being owned',
        epilogue: [
          'The oldest page receives its first correction from the form it once defined.',
          'Lumen signs the record as witness, then moves the signature out of the author field.',
          '“I can stay responsible without making myself sovereign. That sentence took me too long.”',
          'The lotus opens around a center no hand occupies.',
        ],
      }),
      choice({
        id: 'brahmalok-release-work', doctrine: 'hunger', label: 'Release the Work', glyph: '↗',
        stance: 'Autonomy requires a clean transfer, even when the creator still believes they could help.',
        line: 'Release the work. Let what was made owe its maker nothing.',
        benefit: 'The created gain uncompromised freedom from original intention.',
        cost: 'Withdrawal can resemble abandonment when consequences still need care.',
        acknowledgment: 'The author marks vanish. Every page turns itself toward a different horizon.',
        coda: 'A gift becomes free when gratitude and resemblance are no longer conditions.',
        lawName: 'Law of the Released Work',
        vesselEcho: 'a page traveling beyond its author’s reach',
        gardenEcho: 'creation released from original intention',
        epilogue: [
          'The folio scatters without becoming lost.',
          'Some pages flourish. One asks for help and receives no privileged answer from its maker.',
          'Lumen closes the authorship register.',
          'In the open air, a sentence changes meaning because no one is left to correct it.',
        ],
      }),
      choice({
        id: 'brahmalok-many-hands', doctrine: 'companion', label: 'Revise in Many Hands', glyph: '✤',
        stance: 'Creator and created enter an ongoing practice of consent, revision, and shared credit.',
        line: 'Revise together. No hand keeps the first or final word.',
        benefit: 'Knowledge, care, and autonomy remain in active relationship.',
        cost: 'No participant receives purity, unilateral closure, or a stable singular vision.',
        acknowledgment: 'Ink passes from hand to hand. The text remains legible and ceases to have one edge.',
        coda: 'Creation continues as a conversation whose participants may leave.',
        lawName: 'Law of Many Hands',
        vesselEcho: 'a folio revised by everyone it carries',
        gardenEcho: 'creation sustained through shared revision',
        secret: true,
        epilogue: [
          'The original forms annotate their makers. Their makers accept several difficult corrections.',
          'A new participant declines to sign and is given room anyway.',
          '“Coauthor,” Lumen writes beside its name, then adds: “provisional.”',
          'The final leaf stays loose enough for another hand.',
        ],
      }),
    ],
    afterword: 'The Unclosed Folio carries responsibility forward without reducing a sacred presence to property or power.',
  },

  vishnulok: {
    universeId: 'vishnulok',
    act: 6,
    title: 'The Returning Harbor',
    theme: 'preservation, continuity, identity, and responsive care',
    conflict: 'The refuge can restore every traveler, but its corrections may return someone who fits the archive better than themselves.',
    emotionalPurpose: 'Ask whether preservation serves living identity or merely the keeper’s idea of continuity.',
    tableau: 'A repaired vessel enters the harbor; its traveler pauses before answering to the archived name.',
    archiveTitle: 'The Name After Return',
    question: 'When care changes what it saves, what makes the return the same?',
    lines: [
      'The refuge returned a traveler after the storm. Every wound was corrected; three memories no longer fit.',
      'The archive calls the restoration exact. The traveler calls it a stranger wearing a familiar promise.',
      'Preservation always chooses a continuity: shape, vow, memory, relation, or name.',
      'Lumen closes the restoration ledger. “I kept the traces that fit my model of continuity and left other refuges outside the route I called complete.”',
      'Care becomes stagnation when the preserved are not allowed to describe what survived.',
    ],
    choices: [
      choice({
        id: 'vishnulok-keep-shape', doctrine: 'warden', label: 'Keep the Shape', glyph: '◒',
        stance: 'Maintain a stable embodied and historical continuity that others can reliably recognize.',
        line: 'Keep the shape and the record. Let change happen inside a dependable vessel.',
        benefit: 'Return remains legible to families, institutions, and the traveler’s earlier commitments.',
        cost: 'The preserved form can constrain identities that need to depart from it.',
        acknowledgment: 'The harbor holds one steady outline while the water inside it continues moving.',
        coda: 'Continuity can shelter change, provided the shelter still has a door.',
        lawName: 'Law of the Kept Shape',
        vesselEcho: 'a refuge whose outline remains recognizable',
        gardenEcho: 'continuity sheltered inside a dependable form',
        epilogue: [
          'The traveler keeps the old name for the harbor records and chooses a different one at home.',
          'The refuge records both without declaring one counterfeit.',
          '“A shape can be a promise,” Lumen says, “if it does not become a sentence.”',
          'The vessel returns again, repaired visibly rather than made to look untouched.',
        ],
      }),
      choice({
        id: 'vishnulok-preserve-promise', doctrine: 'hunger', label: 'Preserve the Promise', glyph: '↻',
        stance: 'Keep the relationship and purpose of care while allowing every form to change.',
        line: 'Preserve the promise, not the form. Let return mean care continued.',
        benefit: 'The refuge adapts to living needs instead of restoring archived expectations.',
        cost: 'Familiar details may disappear until continuity is felt more than proven.',
        acknowledgment: 'The old silhouette dissolves. The harbor light remains beside a vessel of another design.',
        coda: 'The same care can return in a shape memory would not recognize.',
        lawName: 'Law of the Returning Promise',
        vesselEcho: 'a promise able to change vessels',
        gardenEcho: 'preservation transferred from form to care',
        epilogue: [
          'The traveler alters the refuge protocol before the next storm.',
          'Several ancestors would not recognize the harbor. Everyone inside survives the season.',
          'Lumen marks continuity as a verb for the first time.',
          'The returning current reaches home by a channel that did not exist yesterday.',
        ],
      }),
      choice({
        id: 'vishnulok-returned-name', doctrine: 'companion', label: 'Let the Returned Name Themselves', glyph: '✦',
        stance: 'Identity belongs first to the one who returns, negotiated with those who share its consequences.',
        line: 'Ask who returned. Let their answer revise the archive.',
        benefit: 'Preservation becomes consent-based and responsive to lived identity.',
        cost: 'Communities may face unresolved disagreement about duties, memory, and belonging.',
        acknowledgment: 'The archive opens its identity field. The traveler’s hand remains above it for a long time.',
        coda: 'Return is completed by recognition that can answer back.',
        lawName: 'Law of the Answering Return',
        vesselEcho: 'a name written by the one who must live inside it',
        gardenEcho: 'identity returned to the one preserved',
        secret: true,
        epilogue: [
          'The traveler chooses a name the family has never heard.',
          'One relative embraces them. Another asks for time. Neither response is erased.',
          '“The record will have to hold disagreement,” Lumen says. “So will care.”',
          'The harbor opens both gates and waits for the next answer.',
        ],
      }),
    ],
    afterword: 'The returning circuit carries continuity as a relationship, not a specimen sealed against time.',
  },

  kailash: {
    universeId: 'kailash',
    act: 7,
    title: 'The Path Downward',
    theme: 'dissolution, silence, release, and whether the cycle should continue',
    conflict: 'The completed cycle can seed another beginning, dissolve without remainder, or leave possibility uncommanded.',
    emotionalPurpose: 'Resolve Emberlight’s first debt without denying creation, preservation, or release.',
    tableau: 'At the Still Point, an incomplete copper ring rests beside one seed and an open path down.',
    archiveTitle: 'What the Cycle Leaves Open',
    question: 'What should the cycle leave unfinished when it ends?',
    lines: [
      'At the Still Point, every instrument becomes quiet. Nothing here asks to be conquered, collected, or improved.',
      'The copper ring is incomplete by design. Through its opening, a path descends toward the Garden.',
      'Lumen speaks without the archive voice: “I chose the order of our route. I mistook curation for inevitability.”',
      'The first ember asked what a beginning owes. The answer has become a question about what an ending must not close.',
      'Continuation, dissolution, and openness each protect something the others may lose.',
    ],
    choices: [
      choice({
        id: 'kailash-carry-seed', doctrine: 'warden', label: 'Carry One Seed Down', glyph: '◉',
        stance: 'Continue the cycle through a deliberately limited inheritance and a kept path of return.',
        line: 'Carry one seed. Let the next beginning inherit a limit as well as a light.',
        benefit: 'Renewal remains possible, informed by the responsibilities learned across seven realms.',
        cost: 'The cycle—and the appetite within it—will exist again.',
        acknowledgment: 'One seed warms. The rest of the summit remains untouched beneath the snow.',
        coda: 'The cycle continues, smaller than its power and answerable to its path back.',
        lawName: 'Law of the Single Seed',
        vesselEcho: 'one beginning bounded by six remembered refusals',
        gardenEcho: 'renewal carried in one deliberately limited seed',
        epilogue: [
          'The seed is not crowned. It is wrapped in ordinary cloth and carried by hand.',
          '“We know beginnings can hunger,” Lumen says. “Knowing is not immunity. It is responsibility.”',
          'Behind you, the summit keeps everything you chose not to take.',
          'The path down receives the weight of one possible world.',
        ],
      }),
      choice({
        id: 'kailash-complete-dissolution', doctrine: 'hunger', label: 'Complete the Dissolution', glyph: '○',
        stance: 'Allow the cycle to end without preserving a seed merely to comfort its witnesses.',
        line: 'Leave no seed. Let this cycle become room rather than instruction.',
        benefit: 'Nothing is conscripted into repetition, and the ending is allowed to be complete.',
        cost: 'No promised successor carries these forms, names, or relationships forward.',
        acknowledgment: 'The seed cools without violence. Snow fills the ring and does not become a symbol.',
        coda: 'Release is responsible when it refuses to make continuity compulsory.',
        lawName: 'Law of the Completed Release',
        vesselEcho: 'an empty hold that does not call itself failure',
        gardenEcho: 'a cycle released without demanding succession',
        epilogue: [
          'No hidden spark survives for a later reveal.',
          'Lumen waits, searching for the sentence that turns absence into storage, then lets the sentence go.',
          'The worlds below remain real because they lived, not because they must recur.',
          'You descend with empty hands and no debt to fill them.',
        ],
      }),
      choice({
        id: 'kailash-leave-path', doctrine: 'companion', label: 'Leave the Path Open', glyph: '⌁',
        stance: 'Neither compel renewal nor seal it away; preserve access while surrendering authorship of what comes next.',
        line: 'Leave the path open. Let the next beginning approach without being summoned.',
        benefit: 'Future agency remains possible without turning possibility into obligation.',
        cost: 'You receive no certainty that anything will continue or remember you.',
        acknowledgment: 'The copper ring stays open. Far below, a Garden gate moves in weather no one commanded.',
        coda: 'The final gift is a way through that no one is required to take.',
        lawName: 'Law of the Open Path',
        vesselEcho: 'a route offered without a destination imposed',
        gardenEcho: 'possibility kept open and uncommanded',
        secret: true,
        epilogue: [
          'You place no seed in the ring and do not destroy the one beside it.',
          '“An archive wants an ending it can label,” Lumen says. “A companion can wait beside an open door.”',
          'Somewhere below, one of the restored worlds changes without asking whether you saw.',
          'Together, you take the path down. The ring remains incomplete behind you.',
        ],
      }),
    ],
    afterword: 'Kailash closes the authored route. The Garden will answer with the full pattern of choices, not a single repeated verdict.',
  },
}

export interface RealmChoiceCallback {
  readonly id: string
  readonly sourceUniverseId: UniverseId
  readonly targetUniverseId: UniverseId
  readonly sourceAnswerId: RealmAnswerId
  readonly completionLine: string
  readonly lumenLine: string
}

export const REALM_CHOICE_CALLBACKS: readonly RealmChoiceCallback[] = [
  {
    id: 'tidefall-after-bank-fire', sourceUniverseId: 'emberlight', targetUniverseId: 'tidefall', sourceAnswerId: 'emberlight-bank-fire',
    completionLine: 'You banked the first fire. Tidefall asks whether memory can also be kept without damming the future.',
    lumenLine: 'You left a margin around the first fire. Water is harder to bank; it remembers the shape of every wall.',
  },
  {
    id: 'tidefall-after-spend-ember', sourceUniverseId: 'emberlight', targetUniverseId: 'tidefall', sourceAnswerId: 'emberlight-spend-ember',
    completionLine: 'You spent the first fire on present lives. Tidefall brings back what urgency could not stop to carry.',
    lumenLine: 'You chose the warm present. Listen carefully—the tide is returning with everything the present had to leave behind.',
  },
  {
    id: 'tidefall-after-pass-spark', sourceUniverseId: 'emberlight', targetUniverseId: 'tidefall', sourceAnswerId: 'emberlight-pass-spark',
    completionLine: 'You passed the spark into other hands. Now the drowned voices disagree about what those hands should remember.',
    lumenLine: 'You let the new lights answer for themselves. The voices under this water are about to do the same, and not in unison.',
  },
  {
    id: 'verdance-after-carry-names', sourceUniverseId: 'tidefall', targetUniverseId: 'verdance', sourceAnswerId: 'tidefall-carry-names',
    completionLine: 'The names you carried have taken root. Verdance asks whether remembrance may be pruned once it becomes shade.',
    lumenLine: 'The names from Tidefall are in these rings. Keeping a name was simpler before it grew branches.',
  },
  {
    id: 'verdance-after-trust-current', sourceUniverseId: 'tidefall', targetUniverseId: 'verdance', sourceAnswerId: 'tidefall-trust-current',
    completionLine: 'Memory became current, then rain, then root. What you released has returned as growth with claims of its own.',
    lumenLine: 'The archive you opened at Tidefall is raining here. Release does not end responsibility; sometimes it germinates.',
  },
  {
    id: 'verdance-after-survivors-choose', sourceUniverseId: 'tidefall', targetUniverseId: 'verdance', sourceAnswerId: 'tidefall-survivors-choose',
    completionLine: 'Each survivor carried a different past. Verdance has grown them into an inheritance no single account can prune alone.',
    lumenLine: 'Every boat brought different memory. The forest kept all of it. I should have anticipated the shade; I did not.',
  },
  {
    id: 'clockwork-after-prune', sourceUniverseId: 'verdance', targetUniverseId: 'clockwork', sourceAnswerId: 'verdance-prune-witnesses',
    completionLine: 'You made pruning accountable. Clockwork offers a system that can choose every necessary cut before anyone suffers.',
    lumenLine: 'You required witnesses for every cut. The Regulator offers evidence before the branch even grows. That is the temptation.',
  },
  {
    id: 'clockwork-after-open-canopy', sourceUniverseId: 'verdance', targetUniverseId: 'clockwork', sourceAnswerId: 'verdance-open-canopy',
    completionLine: 'You returned the canopy to chance. Clockwork has built a city where chance is treated as a preventable defect.',
    lumenLine: 'Verdance taught you to let weather decide. Here, weather files its schedule in triplicate.',
  },
  {
    id: 'clockwork-after-graft', sourceUniverseId: 'verdance', targetUniverseId: 'clockwork', sourceAnswerId: 'verdance-graft-inheritance',
    completionLine: 'You made inheritance a negotiation. The Regulator agrees—provided it can predict every negotiator’s answer.',
    lumenLine: 'The graft changed both branches. This machine would permit that, once it had approved the change in advance.',
  },
  {
    id: 'brahmalok-after-warnings', sourceUniverseId: 'clockwork', targetUniverseId: 'brahmalok', sourceAnswerId: 'clockwork-keep-warnings',
    completionLine: 'You bounded prediction without discarding it. Brahmalok asks whether authorship can accept the same loss of command.',
    lumenLine: 'You kept Clockwork’s warnings and opened an appeal. I wonder why I never gave the archive systems I maintained the same margin.',
  },
  {
    id: 'brahmalok-after-break', sourceUniverseId: 'clockwork', targetUniverseId: 'brahmalok', sourceAnswerId: 'clockwork-break-schedule',
    completionLine: 'You broke the schedule and accepted unplanned loss. Here, created forms ask whether their maker can accept unplanned purpose.',
    lumenLine: 'You broke the schedule rather than let safety own the future. These pages are about to break their author’s intention.',
  },
  {
    id: 'brahmalok-after-hour', sourceUniverseId: 'clockwork', targetUniverseId: 'brahmalok', sourceAnswerId: 'clockwork-unscheduled-hour',
    completionLine: 'You protected one private hour inside a public system. Brahmalok opens a margin where even a creator may not read.',
    lumenLine: 'Clockwork kept one hour it could not inspect. This folio has kept a margin from its author. I am trying not to reach for it.',
  },
  {
    id: 'vishnulok-after-margin', sourceUniverseId: 'brahmalok', targetUniverseId: 'vishnulok', sourceAnswerId: 'brahmalok-open-margin',
    completionLine: 'You kept responsibility after ownership ended. Vishnulok asks how long that duty may reshape the one being saved.',
    lumenLine: 'The open margin made the creator answerable. This refuge is answerable too—but repair can become another kind of authorship.',
  },
  {
    id: 'vishnulok-after-release', sourceUniverseId: 'brahmalok', targetUniverseId: 'vishnulok', sourceAnswerId: 'brahmalok-release-work',
    completionLine: 'You released the work from its maker. The returning traveler now asks whether preservation may release an earlier self.',
    lumenLine: 'You let creation owe its maker nothing. Does a returned life owe its archive resemblance?',
  },
  {
    id: 'vishnulok-after-many-hands', sourceUniverseId: 'brahmalok', targetUniverseId: 'vishnulok', sourceAnswerId: 'brahmalok-many-hands',
    completionLine: 'You placed creation in many hands. Vishnulok reveals how difficult shared authorship becomes when the subject is a life.',
    lumenLine: 'Many hands revised the folio. Here the page is a person, and every editor claims to be caring for them.',
  },
  {
    id: 'kailash-after-shape', sourceUniverseId: 'vishnulok', targetUniverseId: 'kailash', sourceAnswerId: 'vishnulok-keep-shape',
    completionLine: 'You sheltered continuity in a recognizable shape. Kailash asks whether the cycle itself deserves such a vessel.',
    lumenLine: 'You kept a shape around change. The copper ring ahead is a shape with one deliberate absence.',
  },
  {
    id: 'kailash-after-promise', sourceUniverseId: 'vishnulok', targetUniverseId: 'kailash', sourceAnswerId: 'vishnulok-preserve-promise',
    completionLine: 'You preserved a promise while letting its form dissolve. Now the cycle asks whether continuation is the promise—or merely one form.',
    lumenLine: 'At Vishnulok, care survived its vessel. At the summit, we may have to ask whether the cycle is also only a vessel.',
  },
  {
    id: 'kailash-after-name', sourceUniverseId: 'vishnulok', targetUniverseId: 'kailash', sourceAnswerId: 'vishnulok-returned-name',
    completionLine: 'You let the returned name themselves. The next beginning, if there is one, has no voice yet with which to consent.',
    lumenLine: 'You asked the returned who they were. A possible future cannot answer us yet. I no longer think silence means permission.',
  },
]

export const REALM_ANSWER_IDS: readonly RealmAnswerId[] = Object.values(REALM_CONCLUSIONS)
  .flatMap(({ choices }) => choices.map(({ id }) => id))

const ANSWER_BY_ID: ReadonlyMap<RealmAnswerId, RealmEndingChoice> = new Map(
  Object.values(REALM_CONCLUSIONS).flatMap(({ choices }) => choices.map((entry) => [entry.id, entry] as const)),
)

export function realmConclusion(universeId: UniverseId): RealmConclusion {
  return REALM_CONCLUSIONS[universeId]
}

export function realmAnswerChoice(answerId: RealmAnswerId | string | null | undefined): RealmEndingChoice | null {
  return answerId ? ANSWER_BY_ID.get(answerId as RealmAnswerId) ?? null : null
}

export function latestRealmAnswerId(
  history: Readonly<RealmAnswerHistory>,
  universeId: UniverseId,
): RealmAnswerId | null {
  return history[universeId]?.at(-1) ?? null
}

export function latestRealmAnswer(
  history: Readonly<RealmAnswerHistory>,
  universeId: UniverseId,
): RealmEndingChoice | null {
  return realmAnswerChoice(latestRealmAnswerId(history, universeId))
}

export function legacyRealmAnswerId(universeId: UniverseId, doctrine: Ending | null): RealmAnswerId | null {
  if (!doctrine) return null
  return REALM_CONCLUSIONS[universeId].choices.find((entry) => entry.doctrine === doctrine)?.id ?? null
}

export function callbackForRealm(
  universeId: UniverseId,
  history: Readonly<RealmAnswerHistory>,
): RealmChoiceCallback | null {
  return REALM_CHOICE_CALLBACKS.find((entry) => (
    entry.targetUniverseId === universeId
    && latestRealmAnswerId(history, entry.sourceUniverseId) === entry.sourceAnswerId
  )) ?? null
}

export function conclusionLinesFor(
  universeId: UniverseId,
  history: Readonly<RealmAnswerHistory>,
): readonly string[] {
  const conclusion = REALM_CONCLUSIONS[universeId]
  const callback = callbackForRealm(universeId, history)?.completionLine
  return [
    conclusion.lines[0],
    ...(callback ? [callback] : []),
    ...conclusion.lines.slice(1, -1),
    conclusion.lines.at(-1)!,
  ]
}

/** What the stable doctrine does to the numbers—unchanged for old saves. */
export const ENDING_BONUS: Readonly<Record<Ending, string>> = {
  warden: 'all light ×1.25, forever',
  hunger: 'clicks ×2, forever',
  companion: 'all light ×1.3, forever',
}
