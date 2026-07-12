export interface GuideBlock {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  note?: string
}

export interface GuideChapter {
  id: string
  nav: string
  eyebrow: string
  title: string
  summary: string
  keywords: string[]
  blocks: GuideBlock[]
}

/**
 * The prose layer of the in-game guide. Lists that can drift as content grows
 * (generators, trials, power-ups, cabinet objects, upgrades) are rendered from
 * their real definitions by GameGuide.svelte instead of being duplicated here.
 */
export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 'awakening',
    nav: 'First light',
    eyebrow: 'begin here',
    title: 'Awakening the interface',
    summary: 'EMBER begins with almost nothing because rebuilding the interface is part of rebuilding the universe.',
    keywords: ['start', 'beginner', 'tutorial', 'interface', 'unlock', 'counter', 'shop', 'music'],
    blocks: [
      {
        heading: 'The first few minutes',
        paragraphs: [
          'Click the central ember to make your first currency. New interface pieces appear as pale chips when you have earned enough to understand why they matter. Buying one permanently adds that tool to the current remembrance.',
          'There is no wrong opening. If only the ember is visible, keep touching it. The game is intentionally teaching through discovery rather than pop-up instructions.',
        ],
        bullets: [
          'The counter tells you what you can spend now.',
          'Kindling is the generator shop and creates passive income.',
          'Upgrade glyphs appear above the ember when their requirements are met.',
          'Stats, options, music, and bulk buying are purchased as the universe becomes capable of supporting them.',
        ],
        note: 'The guide appears after the counter so the opening still begins as one quiet point of light.',
      },
      {
        heading: 'Reading the screen',
        paragraphs: [
          'The large number at the top is spendable currency. The smaller rate is passive currency per second. Temporary blessings, rhythm streaks, prestige balances, and realm physics appear nearby only when relevant.',
          'The right rail is Kindling. The bottom-left dock opens permanent systems such as Stats, Options, the cabinet, Observatory, Deep, Story Archive, Vessel, and this guide.',
        ],
      },
    ],
  },
  {
    id: 'economy',
    nav: 'Economy',
    eyebrow: 'the core loop',
    title: 'Currency, kindling, and upgrades',
    summary: 'Clicks begin an economy; generators, refinements, synergies, and global laws carry it into astronomical scales.',
    keywords: ['currency', 'light', 'glow', 'generator', 'kindling', 'shop', 'upgrade', 'bulk', 'cost', 'production', 'synergy'],
    blocks: [
      {
        heading: 'Buying kindling',
        paragraphs: [
          'Every generator has a base cost, a base production rate, and a tier. Its next copy costs about 15% more than the previous one. New tiers initially look inefficient, then become the center of the economy after a few purchases and upgrades.',
          'Bulk controls buy 1, 10, 100, or the maximum affordable amount. Keyboard keys 1–9 buy the matching visible generator. A trial may limit which tiers can be purchased or how many copies may be owned.',
        ],
        bullets: [
          'Refinement upgrades usually appear at 10, 25, and 50 owned and double that generator.',
          'Global upgrades multiply every source.',
          'Synergy or resonance upgrades make one generator stronger for every copy of another.',
          'The Resonance Atlas in the Deep visualizes every live cross-generator relationship.',
        ],
      },
      {
        heading: 'What persists',
        paragraphs: [
          'Currency, owned generators, and normal upgrades belong to the current run and reset during a Supernova. Stardust and constellation choices survive Supernovas but reset during a Deep Collapse. Singularities, Deep upgrades, completed trials, achievements, and most larger records survive a Deep Collapse.',
          'Remembrance is the widest reset. It preserves the archive, achievement record, collected phenomena, themes, past answers, and the permanent memory multiplier while letting the opening unfold again.',
        ],
      },
    ],
  },
  {
    id: 'active-play',
    nav: 'Active play',
    eyebrow: 'hands on the universe',
    title: 'Clicks, criticals, rhythm, and blessings',
    summary: 'Active play remains relevant through click scaling, critical hits, beat timing, and realm-specific wandering events.',
    keywords: ['click', 'critical', 'crit', 'rhythm', 'combo', 'beat', 'music', 'powerup', 'power-up', 'falling star', 'bubble', 'buff'],
    blocks: [
      {
        heading: 'Click power and criticals',
        paragraphs: [
          'A click begins at one currency, then upgrades add flat multipliers and a share of passive production. That percentage scaling is why clicking remains useful after the numbers become enormous.',
          'Critical clicks begin as a small random chance to multiply one touch. Cabinet objects, upgrades, and permanent rewards can improve their frequency or force. The Stats panel records critical count and the largest critical ever made.',
        ],
      },
      {
        heading: 'Playing on the beat',
        paragraphs: [
          'Once music is unlocked, clicking close to an audible beat builds a streak. The ring around the central object is the visual beat guide. Missing the timing resets the streak but never removes permanent progress.',
          'Streak thresholds gently improve clicks up to ×1.5 and charge Omen attraction instead of creating large production blessings. Music tempo changes between realms, so the rhythm should be learned again after a crossing.',
        ],
        bullets: [
          '4 beats begins the basic ×1.1 combo multiplier.',
          '8, 16, 32, and 64 beats charge Omen attraction; click output never exceeds ×1.5.',
          'The Conductor and certain cabinet objects widen the timing window.',
          'The Silence trial disables music, combos, and wandering events.',
        ],
      },
      {
        heading: 'Wandering power-ups',
        paragraphs: [
          'A clickable omen periodically crosses the world. Catching it grants an instant award, a timed production or click blessing, or a hybrid of both. Each realm owns a different event shape, sound, reward table, and rarity distribution.',
          'Constellation perks and cabinet rewards can make events arrive sooner, last longer, or call a second omen. Ignoring an event never damages the save; active play is advantageous, not mandatory.',
        ],
      },
    ],
  },
  {
    id: 'universes',
    nav: 'Realms',
    eyebrow: 'different laws, different senses',
    title: 'Realm identities and physics',
    summary: 'A crossing changes far more than color: economy names, living physics, music, clicks, events, collections, lore, and world rendering all belong to the destination.',
    keywords: ['universe', 'realm', 'emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash', 'prismata', 'tempest', 'canticle', 'physics', 'tide', 'cohort', 'creation', 'mandala', 'continuity', 'refuge', 'release', 'grace', 'rest', 'crossing', 'world'],
    blocks: [
      {
        heading: 'Emberlight',
        paragraphs: [
          'The first restored world is steady and warm. Its production has no cyclic physics modifier, its score is a 72 BPM hearth-like arrangement, and its active omens are falling stars. It is the clearest place to learn the base economy.',
        ],
      },
      {
        heading: 'Tidefall',
        paragraphs: [
          'Tidefall is a moonless cosmic ocean. Production rises and falls from ×0.60 to ×1.40 over a ninety-second tide, and the HUD reports whether the tide is rising, high, falling, or low. Buying during a low tide is often efficient; evaluating production during a high tide reveals the run’s peak.',
          'Its music slows to a submerged 60 BPM pulse, clicks sound like pressure-drops, wandering blessings rise as bubbles, and the Pelagic Archive replaces Emberlight’s astronomical cabinet. The Steady Keel Wayfinder law makes the swing gentler without changing its average.',
        ],
      },
      {
        heading: 'The farther realms',
        paragraphs: [
          'Verdance ages each Kindling through new, rooted, mature, and ancient growth; old cohorts produce more and contribute Memory Seeds during Pruning. Clockwork removes random economics and asks you to inspect deterministic transmission routes and scheduled Maintenance Signals.',
          'Brahmalok is the first loka beyond the restored worlds. Its Lotus of Becoming routes Kindlings through seed, measure, name, and form, then rewards focused germination, balanced mandalas, manuscript memory, or proliferation. Vishnulok gathers Continuity, then carries a declared correction through a Daily Return, Refuge Circuit, Measured Correction, or Ocean Balance route until it comes home.',
          'Kailash arranges emergence, shelter, release, veil, grace, and deliberate rests around the Still Point, then reveals an incomplete copper ring and a path down. These are game-fiction labels, not a claim of exhaustive doctrine. Every state remains complete when muted.',
        ],
      },
      {
        heading: 'Progress is parked, not destroyed',
        paragraphs: [
          'Each realm keeps its own run: currency, generators, upgrades, Stardust era, Deep progress, challenges, ending, cabinet, and local Echoes wait exactly where the Vessel left them. Between currencies and Wayfinder laws sit above those parked realms.',
        ],
      },
    ],
  },
  {
    id: 'cabinet',
    nav: 'Cabinets',
    eyebrow: 'the realm examined',
    title: 'Cabinets, archives, and special objects',
    summary: 'Every realm has a twelve-object field archive divided into three four-part shelves, with local lore and mechanical rewards.',
    keywords: ['cabinet', 'archive', 'curiosity', 'object', 'phenomenon', 'protostar', 'comet', 'leviathan', 'record', 'shelf'],
    blocks: [
      {
        heading: 'Cataloguing objects',
        paragraphs: [
          'An unresolved signal appears when lifetime earnings reach roughly one quarter of its catalogue cost. Buying it records the object permanently in that realm and immediately adds +2% all production; completing its four-record shelf adds a larger combined reward.',
          'Completing all four objects in a shelf activates the shelf reward. Shelf reward types differ by realm, so the same stable save slot can represent a different object and a different build priority after crossing.',
        ],
      },
      {
        heading: 'Interactive records',
        bullets: [
          'The nursery object can be fueled for a timed production multiplier. Its duration and strength belong to the realm.',
          'The returning traveler completes a long orbit or migration and can be collected for stored production.',
          'The archival beacon contains a readable lore transmission.',
          'The horizon object changes its status after sufficiently vast lifetime earnings.',
          'Timing and attraction objects improve rhythm windows and wandering-event frequency.',
        ],
        paragraphs: [
          'Purchased objects also appear in the living world. Emberlight renders distant stellar phenomena; Tidefall renders currents, pearls, kelp-light, migrations, and pressure apertures as one underwater ecosystem.',
          'Lumen Shard lore and the Archive Resonator are purchased inside the active Archive. Archive power no longer lives in a separate multiverse shop.',
        ],
      },
    ],
  },
  {
    id: 'supernova',
    nav: 'Supernova',
    eyebrow: 'prestige layer one',
    title: 'Stardust and the Observatory',
    summary: 'A Supernova exchanges the current run for Stardust, making every later run faster and opening a permanent constellation build.',
    keywords: ['supernova', 'prestige', 'stardust', 'observatory', 'constellation', 'corona', 'reset', 'eternal works'],
    blocks: [
      {
        heading: 'When to collapse',
        paragraphs: [
          'Potential Stardust grows roughly with the square root of currency earned during the current Deep era. The Observatory shows the exact gain available now and the earnings target for the next point.',
          'A Supernova resets spendable currency, generators, and ordinary upgrades. It preserves Stardust, purchased constellation nodes, achievements, cabinet objects, Echoes, singularity systems, trials, and multiverse progress.',
        ],
        note: 'Early on, collapse when the shown gain will noticeably accelerate the next run. Later, the Nova Engine can automate a chosen gain threshold.',
      },
      {
        heading: 'Constellation branches',
        bullets: [
          'The Forge branch focuses on raw production.',
          'The Hand branch strengthens clicks and rhythm timing.',
          'The Sky branch improves wandering events.',
          'The Root branch improves offline progress and starting kindling.',
          'The Corona is the expensive capstone reached through developed Forge and Hand paths.',
        ],
        paragraphs: [
          'The same permanent choices are interpreted by each realm rather than copied verbatim. Emberlight draws a stellar Constellation in the Observatory; Tidefall sounds a Current Chart in the Moonless Chart, with local node names, lore, layout, and Undertow ritual.',
          'Once every node is owned, a repeatable Stardust market appears. Emberlight calls it the Eternal Observatory; Tidefall calls it the Returning Ocean. Both provide an endless production sink and increased Stardust yield until the next layer-two collapse.',
          'Permanent Heart vestments recovered with Lumen Shards also live in the Observatory, beside the sky map and the light they recolor.',
        ],
      },
    ],
  },
  {
    id: 'deep',
    nav: 'The Deep',
    eyebrow: 'prestige layer two',
    title: 'Singularities, automation, and recursive works',
    summary: 'A Deep Collapse folds an entire Stardust era into Singularities and unlocks automation, trials, and repeatable endgame growth.',
    keywords: ['deep', 'singularity', 'collapse', 'automation', 'auto-kindler', 'auto-stoker', 'nova engine', 'recursive', 'resonance atlas'],
    blocks: [
      {
        heading: 'Deep Collapse',
        paragraphs: [
          'Every twenty Stardust gathered in the current era produces one base Singularity, modified by later repeatable works. A Deep Collapse resets the run, Stardust, constellation, and temporary Stardust works. Singularities and everything purchased with them persist through future Deep Collapses.',
          'Emberlight presents this layer as the cold abstract Deep. Tidefall descends into the Hadal Archive, where the same permanent mechanics become Pressure Laws, Hadal Descents, a Current Atlas, and Pressure Trials with their own names and lore.',
        ],
      },
      {
        heading: 'Automation',
        paragraphs: [],
        bullets: [
          'Auto-Kindler buys the generator with the strongest immediate efficiency.',
          'Auto-Stoker buys the cheapest currently available normal upgrade.',
          'Nova Engine performs a Supernova when its displayed Stardust-gain threshold is reached.',
          'Automation is disabled inside trials so each rule set must be solved directly.',
        ],
      },
      {
        heading: 'Finished markets are not dead ends',
        paragraphs: [
          'After every fixed Singularity upgrade is owned, the Recursive Works become available. Worldseed Compression repeatedly doubles production. The Recursive Abyss repeatedly improves Deep Collapse yield. These ranks survive Deep Collapses and reset only during Remembrance.',
          'The Resonance Atlas lists every cross-generator synergy in the active realm, its source and target, price, ownership state, and live multiplier. Completing Small Vessels doubles the bonus portion of all resonances.',
          'Once a world has lit its Beacon, the Deep exposes its capped Lumen Distillery. Distillation converts that world’s local Singularities into shared Lumen Shards without changing the price curve or cap.',
        ],
      },
    ],
  },
  {
    id: 'trials',
    nav: 'Trials',
    eyebrow: 'impossible practice',
    title: 'The twelve trials of the Deep',
    summary: 'Trials temporarily replace the current run with a restricted one, then restore the original run exactly when completed or abandoned.',
    keywords: ['trial', 'challenge', 'silence', 'entropy', 'bare hands', 'swarm', 'glass ceiling', 'small vessels'],
    blocks: [
      {
        heading: 'How a trial works',
        paragraphs: [
          'Beginning a trial stores the current run and starts a clean temporary run under special laws. Trials award no Stardust. Meeting the displayed goal immediately grants the permanent reward and restores the stored run. Abandoning restores the run without the reward.',
          'The first six trials teach one restriction at a time. The Inner Horizon adds compound restrictions and unlocks progressively after earlier completions.',
        ],
        note: 'Trial rewards are permanent within the current remembrance and apply in every realm run that shares that remembrance.',
      },
    ],
  },
  {
    id: 'multiverse',
    nav: 'The Vessel',
    eyebrow: 'prestige layer three',
    title: 'Local Vessels, Beacons, and the Dark Between',
    summary: 'Each realm turns its own mastered laws into a crossing vessel before its Beacon can open the next route.',
    keywords: ['vessel', 'multiverse', 'crossing', 'beacon', 'dark between', 'wayfinder', 'route', 'parts'],
    blocks: [
      {
        heading: 'Building each realm’s Vessel',
        paragraphs: [
          'The Vessel appears after sufficiently vast progress. Every destination owns a different five-part design tied to its local law: Tidefall seals a pressure ark, Verdance grows a Seed Ark from aged cohorts, Brahmalok binds a four-direction folio without closing its final margin, Vishnulok completes a correction without enclosing its refuge, and Kailash carries the five-act cycle down through an open ring.',
          'Vessel completion is local to the active realm. Parts built in Emberlight remain recorded there, but they do not activate Tidefall’s Ark or any later crossing craft. Requirements, consumed materials, construction actions, and the visible schematic all change with the destination.',
        ],
      },
      {
        heading: 'Crossings and Beacons',
        paragraphs: [
          'Only the active realm’s completed Vessel can open the Wayfinder. Crossing parks the current realm, restores it if previously visited, and seals the Wayfinder again until that destination builds and activates its own Vessel.',
          'After the local Vessel is active, reaching the realm’s Beacon requirement can light it across the Between and unlock the next route. Beacons multiply production globally and award Dark Between, which is spent on permanent Wayfinder laws.',
          'Succession Relays and the Relay Lens live in the Wayfinder. Each completed source world may strengthen only its immediate successor; moving the controls here does not change ranks, costs, or effects.',
        ],
      },
    ],
  },
  {
    id: 'story',
    nav: 'Story & endings',
    eyebrow: 'the archive speaks',
    title: 'Lumen, the Story Archive, The Question, and Remembrance',
    summary: 'Story is delivered through short ambient lines, collectible Echoes, major in-engine scenes, and a final answer that changes future play.',
    keywords: ['lumen', 'echo', 'codex', 'story', 'question', 'ending', 'warden', 'hunger', 'companion', 'remembrance', 'spoiler'],
    blocks: [
      {
        heading: 'Lumen and the Story Archive',
        paragraphs: [
          'Lumen’s ticker reacts to milestones but never blocks input. Every line in the saved realm histories is retained in occurrence order. Open the Story Archive from the dock to revisit the latest line or read the complete journal for every visited realm.',
          'Recovered Echoes are longer archive fragments from economic and generator milestones. They remain available in the Story Archive’s Echoes tab.',
          'Echo collections belong to their realm. Completing the active realm’s archive can reveal an additional answer when The Question arrives.',
        ],
      },
      {
        heading: 'The Question',
        paragraphs: [
          'Act III culminates in a narrative choice rather than another numeric reset. Each answer grants a permanent law and recolors the central object. The game continues after an ending, with new Lumen lines acknowledging the chosen doctrine.',
          'After an ending, the Story Archive offers Remembrance: return to the first point of light while retaining the archive and record. Each Remembrance doubles production and allows another answer to be chosen later.',
        ],
        note: 'The guide explains the system without revealing the central story twist. A spoiler panel inside this chapter records the exact ending bonuses for players who choose to open it.',
      },
    ],
  },
  {
    id: 'legacy',
    nav: 'Garden & Atlas',
    eyebrow: 'closure and continuation',
    title: 'The Chronicle, Garden, and Atlas',
    summary: 'Four restored worlds and three lokas complete the authored saga; the Atlas continues with seeded combinations of tested laws.',
    keywords: ['chronicle', 'garden', 'atlas', 'convergence', 'loadout', 'build code', 'beacon name', 'route', 'seed', 'closure'],
    blocks: [
      {
        heading: 'The Chronicle and law loadouts',
        paragraphs: [
          'The Chronicle records awakenings, Epoch Turns, Deep Collapses, answers, Beacons, Garden closure, and completed Atlas routes. Lit Beacons may be given player-authored names, and the record keeps personal route bests without turning them into mandatory leaderboards.',
          'A law loadout combines one local doctrine, up to three owned Wayfinder laws, one Archive shelf resonance, a cosmetic Heart vestment, optional anomaly responses, and an automation profile. Short build codes contain configuration only: importing one never imports currencies, Beacons, unlocks, or progression.',
        ],
      },
      {
        heading: 'The Garden is an ending',
        paragraphs: [
          'After all seven Beacons are lit, the Garden places four restored worlds and three lokas in relationship rather than opening an eighth generator ladder. Creation, preservation, and responsible release remain distinct; the Garden is renewal after Kailash, not a fourth divine realm. Warden, Hunger, and Companion each receive a fulfilled closure. After all three answers have been lived across Remembrances, Continue reconciles them without declaring any one answer false.',
          'Brahmalok, Vishnulok, and Kailash are approached through respectful game-fiction rather than owned as resources. Their deities are never generators, currencies, opponents, or upgrade buttons; the loka systems express creation, refuge and continuity, and responsible release through environments, choices, and relationships.',
          'The credits scene is replayable through the permanent record. Choosing closure does not erase the save; it makes the transition from authored saga to continuing mastery explicit.',
        ],
      },
      {
        heading: 'Seeded Atlas routes and Convergences',
        paragraphs: [
          'The Atlas unlocks after three Beacons. Each route combines one restored world or loka with compatible, hand-authored environment, economy, and interaction laws, one narrative fragment, and an optional mastery constraint. The seed reproduces the same route and replay log exactly.',
          'Beginning a route parks the source realm intact and creates a temporary route run. Completion archives the replay and personal time; abandonment restores the source without loss. Convergences are permanent route and story collections. They never expire and have no paid or seasonal reward track.',
        ],
      },
    ],
  },
  {
    id: 'progress',
    nav: 'Records & themes',
    eyebrow: 'everything that remembers',
    title: 'Achievements, World Power, Stats, and Vestments',
    summary: 'Records are both a history of play and a quiet permanent-growth system.',
    keywords: ['achievement', 'radiance', 'resonance', 'stats', 'theme', 'vestment', 'cosmetic', 'record', 'hidden'],
    blocks: [
      {
        heading: 'Achievements and world power',
        paragraphs: [
          'Every achievement grants one point of the current realm’s achievement power: Radiance in Emberlight and Resonance in Tidefall. Each point adds one percent to global production. The Stats panel localizes the record to the current realm and conceals hidden names until discovered.',
          'Achievement categories cover earnings, generators, clicking, criticals, rhythm, prestige, trials, cabinets, time, endings, and unusual behavior. Hidden achievements reward experimentation; they are never required to make the economy function.',
        ],
      },
      {
        heading: 'Stats and Vestments',
        paragraphs: [
          'Stats separates passive production, recent active clicking, generator contribution, critical chance, prestige history, market ranks, trials, multiverse progress, and time played. Use it to find which generator actually drives the current build.',
          'Vestments are cosmetic accent palettes unlocked through Echoes, Deep Collapses, and trials. They grant no production. Each realm adapts a vestment into its own color family, so the change stays visible without making Tidefall look like Emberlight or vice versa.',
        ],
      },
    ],
  },
  {
    id: 'saves-controls',
    nav: 'Saves & controls',
    eyebrow: 'play safely',
    title: 'Offline progress, saves, settings, and controls',
    summary: 'EMBER is designed to be left, returned to, exported, played with a keyboard, and recovered safely after content updates.',
    keywords: ['save', 'autosave', 'offline', 'export', 'import', 'reset', 'settings', 'keyboard', 'space', 'enter', 'mobile', 'accessibility'],
    blocks: [
      {
        heading: 'Saving and offline progress',
        paragraphs: [
          'The game autosaves locally and saves around major state changes. Returning after time away presents a collect screen for capped offline production. Constellation perks improve both offline efficiency and the maximum time counted.',
          'Options can copy or download the entire save as a text code and import a validated code later. Export before changing browsers or clearing site data. Import replaces the current game and reloads only after the data passes migration and content validation.',
          'Three rolling recovery checkpoints are captured during play, plus one daily checkpoint. If the primary snapshot becomes unreadable, EMBER automatically tries those checkpoints from newest to oldest. They can also be restored manually from Save Safety in Options.',
        ],
        note: '“Let the ember go out” is the destructive full reset. It asks for confirmation and cannot be undone without an exported code.',
      },
      {
        heading: 'Controls and accessibility',
        paragraphs: [],
        bullets: [
          'Click or tap the central object to earn currency.',
          'Space or Enter also activates the central object when focus is not inside a control.',
          'Number keys 1–9 buy the matching visible generator.',
          'G opens this guide; I opens Stats; O opens Options; C opens the active cabinet; V opens the Vessel; S opens the Observatory; D opens the Deep; E opens the Story Archive; and L opens the Legacy hub when each system exists.',
          'B cycles the 1, 10, 100, and maximum bulk-buy settings. Escape closes any utility panel.',
          'Every major panel, upgrade, shop item, and story choice is keyboard focusable.',
          'Reduced-motion preferences disable or simplify major interface animations.',
          'The visual beat guide can be subtle, strong, or hidden without changing rhythm rewards.',
          'Large interface text and high contrast can be enabled independently.',
          'Canvas quality can be automatic, high, balanced, or low. Automatic mode lowers density and frame rate on constrained mobile devices without changing game math.',
          'Automatic quality also watches sustained frame rate. If the selected device profile cannot hold its target, effects step down safely and recover only after a long stable interval.',
          'Sound and music have independent volume sliders and may be muted without stopping progress.',
          'Version details, project credits, source code, and the feedback link live at the bottom of Options.',
          'The Playtest Report copies current render health, settings, and progression totals without including the save code. It is the fastest way to attach useful context to feedback.',
        ],
      },
      {
        heading: 'Practical strategy',
        paragraphs: [],
        bullets: [
          'If progress feels slow, check for affordable upgrades before stockpiling another generator.',
          'Use Stats to identify the generator contributing most of the rate, then buy its refinements and resonances.',
          'Supernova when the gain materially changes the next run; Deep Collapse when the Singularity reward buys a meaningful permanent system.',
          'Active players should combine a rhythm streak with a strong wandering-event blessing.',
          'Idle players should prioritize production, offline, automation, and stable realm physics.',
          'No timed reward is mandatory, and absence never removes permanent progress.',
        ],
      },
    ],
  },
]
