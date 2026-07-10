# EMBER — Future Design Bible

> A long-horizon design plan for a coherent, deeply replayable incremental game.
>
> Status: proposal for post-Phase-5 work. This document does not override save compatibility, accessibility, performance, or the rule that the player must always understand what a reset will remove.

## How to use this document

Treat this as a design contract, not a backlog that every agent may reinterpret. A lead should approve the shared vocabulary, reset boundaries, schemas, and save ranges in **F0** before parallel implementation begins. After that gate, assign agents only the bounded tickets in Sections 12–13, give each agent explicit owned/prohibited files, and merge at the stated integration gates. Universe teams may develop content in parallel once the shared contracts are frozen; they should not independently change economy, save, renderer, or accessibility contracts.

### Navigation

| Design question | Read |
|---|---|
| What experience are we building, and where are the ethical boundaries? | Sections 0–2 |
| How do the current mechanics become one understandable game? | Sections 3–4 |
| How should touching, purchasing, sound, motion, and screen composition feel? | Section 5 |
| What are the seven universes, their objects, mechanics, stories, and identities? | Section 6 |
| How can the game support years of play without chores? | Sections 7–10 |
| What contracts keep implementation robust? | Section 11 |
| How should parallel agents be staged and assigned? | Sections 12–13 |
| What are the quality gates and build priorities? | Sections 14–16 |
| What evidence informed the plan, and how is each feature judged? | Sections 17–18 |

## 0. The north star

EMBER should not become “a large number surrounded by unrelated widgets.” It should become a living machine in which every visible object, sound, currency, reset, collection, and story beat answers the same fantasy:

**A dead reality is learning how to exist again through the player’s touch.**

The game can run for years, but “endless” must not mean an endlessly repeated spreadsheet. It needs two structures at once:

1. **A finite authored saga** with seven distinct universes, Lumen’s complete arc, major revelations, and a satisfying Garden ending.
2. **An infinite mastery game** after and around that saga, built from authored rule combinations, buildcraft, collections, optimization, and replayable chronicles.

The player should return because they are curious, expressive, and increasingly competent—not because a streak will break, a crop will die, or a limited reward will vanish.

### The three promises

- **Every action has a response.** Touches, purchases, discoveries, and resets change the screen and sound immediately.
- **Every system has a place.** No object exists only because a particle effect was easy to draw. It has an origin, mechanical purpose, visual behavior, upgrade path, and story record.
- **Every solved problem becomes a tool.** Old layers become automated, compressed, or creatively recombined. The player’s attention always moves toward the newest interesting decision.

### What “addictive” means here

The target is high voluntary engagement, not compulsion. Research based on self-determination theory links healthy game engagement to **competence, autonomy, and relatedness**. EMBER should support all three: competence through understandable mastery, autonomy through viable builds and freely reversible choices, and relatedness through Lumen, the recovered civilizations, and optional community sharing. See [Przybylski, Rigby, and Ryan’s motivational model](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf).

The game must reject:

- punitive login streaks;
- expiring paid power;
- loot boxes or obscured odds;
- energy systems;
- loss while absent;
- confirm-shaming;
- notifications designed to create anxiety;
- irreversible build mistakes without a clear warning;
- repetitive manual clicking after automation should have been earned.

Dark-pattern research specifically warns that FOMO, loss aversion, and manipulative choice architecture can increase retention while harming player autonomy. That is a design boundary, not an inspiration. See [Dark Patterns in the Design of Games](https://research.chalmers.se/en/publication/177148) and the recent [systematic review of random rewards and dark patterns](https://www.sciencedirect.com/science/article/pii/S1875952126000443).

---

## 1. Comparative analysis: what long-lived incrementals actually do well

No single reference game is the blueprint. Each is strong at a different part of the problem.

| Game | What sustains it | What EMBER should adopt | What EMBER should avoid |
|---|---|---|---|
| **Cookie Clicker** | Extreme content density, hundreds of upgrades and achievements, secrets, minigames, prestige upgrades, collections, and objects that become characters. Its official Steam description emphasizes 600+ upgrades, 500+ achievements, minigames, a dragon, permanent heavenly upgrades, and community mods. | Dense “one more discovery” cadence; hidden interactions; collections that alter play; major generators earning bespoke sub-systems; a playful layer beneath the cosmic solemnity. | Accumulated UI clutter, redundant multiplier tiers, and years of power creep with weak narrative integration. |
| **Antimatter Dimensions** | Continual unfolding: Infinity is presented as the beginning, followed by new prestige layers, challenges, perks, automation, and even custom scripting. | Each prestige must introduce a new decision language; automate solved work; challenges should permanently teach or change strategy; late automation may become player-programmable. | Dropping a wall of unexplained systems on new players; opaque formulas before the player has a reason to care. |
| **Realm Grinder** | Factions create radically different builds; research, reincarnations, excavations, challenges, and ascensions repeatedly recontextualize the same economy. | Strong build identities; free or cheap respecs; universe-specific archetypes; challenge rewards that unlock new strategies rather than only ×2 multipliers. | Spreadsheet-only decisions, mandatory wiki dependence, and upgrade descriptions that hide their real impact. |
| **Melvor Idle** | More than twenty purposeful skills feed one another; items, combat, pets, mastery, and offline progress create a broad long-term web. Its Steam page explicitly describes skills as interacting and benefiting other skills. | Every system should export something useful to at least two others; collections need loadout value; offline progress should preserve the same rules as online play. | Inventory overload, resource clutter, and dozens of nearly identical materials with no narrative identity. |
| **Tap Titans 2** | Strong immediate impact, visible enemies and stages, prestige artifacts, skill trees, clans, raids, and tournaments. | Clear short “boss” goals; builds that change touch behavior; visible stage mastery; satisfying prestige compression. | Competitive pressure, schedule-driven events, paid acceleration, and social systems that punish solo players. |
| **Egg, Inc.** | One tactile central action visibly fills a physical farm; research and transport constraints create comprehensible bottlenecks; prestige and cooperative contracts provide longer arcs. | Purchases should physically populate and reorganize the world; constraints should be visible; large upgrades should change the silhouette of the screen. | Monetized waiting, boost dependence, calendar pressure, and contract FOMO. |
| **Idle Slayer** | Active movement, bonus stages, chest hunts, crafting, equipment, a village, story, quests, offline progress, and a large skill tree keep the genre changing. | Occasional authored active episodes; a hub that binds systems; traversal or discovery sequences that contrast with ordinary idling. | A pile of disconnected minigames and event currencies competing for attention. |
| **Cell to Singularity** | A knowledge tree, prestige as a simulation reboot, animated objects, scientific records, parallel simulations, and expandable topic modules. | The cabinet should be a true field archive; objects should teach lore and mechanics; each universe can be a self-contained simulation with a shared meta-frame. | Parallel modes that feel like separate games and limited-time education content that late players cannot access. |
| **A Dark Room** | Radical progressive disclosure, environmental storytelling, mechanical phase changes, restraint, and excellent accessibility. The iOS version advertises no ads, loot boxes, IAP, or tracking and full VoiceOver playability. | Preserve mystery in the opening; reveal interfaces because the fiction needs them; let mechanical transformations deliver story; treat accessibility as a core quality target. | Remaining so cryptic that optimization-minded players cannot inspect the rules after discovery. |
| **Universal Paperclips** | The mechanics themselves are the narrative. A simple production button becomes finance, computation, infrastructure, probes, conflict, and a final philosophical decision. | Every major feature should advance the premise; the screen and verbs should transform between acts; late systems should reinterpret early actions. | A single-playthrough structure with little expressive replay value. |
| **Exponential Idle** | Transparent mathematical growth, achievements, multiple transformations, and free respecs that invite experimentation. | Show formulas on demand; let players compare builds; remove respec friction; make optimization legible rather than mysterious. | An aesthetic too abstract to support EMBER’s living-world promise. |
| **Kittens Game** | A tiny beginning unfolds into jobs, science, crafting, trade, religion, space, time, policies, challenges, and metaphysics. | Long-horizon system reveals; early resources gaining new uses later; civilizational scale. | Dense tab proliferation and production chains that require constant wiki consultation. |
| **Stimulation Clicker** | Almost every purchase creates a visible or audible novelty, producing an unusually strong “what appears next?” drive. | Screen-as-inventory, bespoke surprises, contrast, and purchases that change presentation. | Deliberate sensory hostility, incoherent clutter, and novelty without durable strategy. |

### The central finding

The longest-lived games do not merely offer more upgrades. They repeatedly rotate the player through five kinds of satisfaction:

1. **Impact:** “My input mattered.”
2. **Comprehension:** “I understand why the number changed.”
3. **Anticipation:** “I can see what I am approaching.”
4. **Expression:** “This build or route is mine.”
5. **Discovery:** “The game has become something I did not expect.”

EMBER already has most of the necessary systems. The future work is to bind them into this rotation.

---

## 2. The engagement architecture

### 2.1 Reward clocks

The player should always have meaningful anticipation on multiple clocks. These clocks must overlap without all firing at once.

| Clock | Frequency | Player question | Typical reward |
|---|---:|---|---|
| **Touch** | 50–300 ms | Did that feel responsive? | impact sound, compression, particles, readable `+amount` |
| **Burst** | 2–8 sec | Can I improve this moment? | critical, rhythm streak, combo accent, target completion |
| **Purchase** | 20–120 sec | What changes if I buy this? | generator state, upgrade, new visible behavior |
| **Discovery** | 3–10 min | What is the next strange thing? | object signal, Echo, omen, shelf completion, new mechanic |
| **Session** | 15–45 min | What can I finish before leaving? | branch node, trial attempt, prestige, Vessel part |
| **Return** | 4–24 hr | What happened while I was gone? | offline report, matured object, route result, new affordable plan |
| **Chapter** | 2–14 days | What truth or world comes next? | story act, Beacon, universe crossing, new law family |
| **Mastery** | 1–12 months | What kind of keeper am I becoming? | completed doctrine, perfected universe, rare archive set |
| **Legacy** | 1–3 years | What remains after the authored story? | Garden ending, Atlas tiers, rare world laws, Chronicle completion |

The clocks are design budgets. If a five-minute interval contains no purchase, discovery, story movement, or visible near-goal, that interval needs another signal—not necessarily another multiplier.

### 2.2 “Always two carrots and one mystery”

At all times the UI should expose:

- **Now:** one useful action affordable in under roughly two minutes.
- **Soon:** one clear goal expected within the current session.
- **Unknown:** one partially concealed signal, record, route, or mechanic whose reveal condition is hinted but not fully spoiled.

The existing Field Guide can explain discovered rules. It should not reveal every surprise before discovery.

### 2.3 Predictable progress plus bounded surprise

Pure randomness feels unfair; pure prediction becomes lifeless. Use both:

- Purchases, prestige gains, unlock requirements, and build effects are deterministic and previewed.
- Omens, criticals, rare object behaviors, and cosmetic variants provide surprise.
- Every rare random reward has visible odds after first discovery, a pity threshold, and no paid rerolls.
- Random events provide alternate acceleration, never exclusive permanent power.

### 2.4 The automation covenant

Automation is not a reward for refusing to play. It is proof that the player has mastered a layer.

For every repetitive mechanic:

1. The player performs it manually long enough to understand it.
2. They unlock a basic automation rule.
3. They improve its conditions or priorities.
4. The layer compresses into a summary while a newer decision takes focus.

No late-game player should be required to click hundreds of times per minute. Active play should be about timing, routing, choosing, and combining—not repetitive strain.

### 2.5 Five player motivations, all viable

| Player | Wants | EMBER support |
|---|---|---|
| **Restorer** | calm growth and a beautiful world | offline play, stable builds, screen evolution, collections |
| **Optimizer** | formulas and faster routes | Atlas, payback data, loadouts, trials, simulation graphs |
| **Performer** | tactile skill and rhythm | beat play, omen chaining, short active phenomena, personal records |
| **Archivist** | lore, completion, secrets | cabinets, Echoes, hidden records, visual variants, Chronicle |
| **Wayfinder** | novelty and new rule sets | crossings, anomalies, universe mastery, procedural route combinations |

Every universe needs at least one feature for each motivation, but it should favor two so that worlds have personality.

---

## 3. One coherent machine: binding the current features together

### 3.1 The five nested loops

```text
TOUCH LOOP
touch Heart → receive world currency → feel immediate response
        ↓
WORLD LOOP
buy Kindlings → world visibly organizes → discover upgrades, omens, records
        ↓
EPOCH LOOP
complete a local arc → perform the universe’s prestige → choose a build law
        ↓
DEEP LOOP
solve trials and automation → convert a mastered era into Singularities
        ↓
MULTIVERSE LOOP
complete Vessel/Beacon → cross to a world with new physics → strengthen all worlds
        ↓
LEGACY LOOP
combine world laws → restore the Garden → enter the endless Atlas of Possible Worlds
```

### 3.2 A canonical vocabulary

Use consistent functional nouns across universes, with local names underneath.

| Function | Canonical term | Local expression |
|---|---|---|
| central clickable | **Heart** | Ember, Tideheart, First Seed, Escapement Heart, White Lens, Storm Eye, First Chord |
| base producers | **Kindlings** | sparks/stars, currents/reefs, roots/groves, gears/engines, rays/lenses, clouds/cells, notes/choirs |
| active event | **Omen** | falling star, moon bubble, pollinator, maintenance signal, caustic flare, lightning leader, wandering refrain |
| collection | **Field Archive** | Astral Cabinet, Pelagic Archive, Impossible Herbarium, Patent Ledger, Spectrum Vault, Storm Almanac, Resonant Memory |
| local prestige | **Epoch Turn** | Supernova, Undertow, Pruning, Rewinding, Refraction, Discharge, Refrain |
| prestige-1 resource | **Epoch Matter** | Stardust, Moon Salt, Seeds, Mainsprings, Facets, Fulgurites, Overtones |
| prestige-2 | **Deep Collapse** | same multiversal concept, universe-specific ceremony |
| cross-world completion | **Beacon** | a world’s proof that it can continue without the player |

The UI may show the local name first and the canonical function in a tooltip. This gives distinct fantasy without forcing players to relearn the entire information architecture seven times.

### 3.3 Current-system relationship map

Every existing system must feed at least two other systems.

| System | Feeds | Receives from | Cohesion rule |
|---|---|---|---|
| **Clicking** | currency, rhythm, critical records, omen charging | upgrades, cabinet objects, builds, universe physics | click visuals always use the active world’s material and verb |
| **Kindlings** | passive economy, music stems, living-world population, Vessel requirements | upgrades, resonance web, prestige laws | every tier gains a unique silhouette and three visible ownership states |
| **Upgrades** | build identity, visual state, automation | generators, achievements, story | at least one in four upgrades changes behavior or presentation, not only magnitude |
| **Rhythm** | active multipliers, omen attraction, secret patterns | music, cabinet, challenges | each universe uses rhythm differently; silence mode remains fully viable |
| **Omens** | temporary opportunities, collection variants, active mastery | rhythm, upgrades, world conditions | no generic reskin; shape, path, reward table, sound, and lore are local |
| **Field Archive** | permanent micro-laws, lore, living-world objects, hidden routes | lifetime progress, exploration, omens | records belong to real categories in the world’s fiction |
| **Achievements/Radiance** | gentle global growth, cosmetics, Chronicle | every system | achievements teach breadth; hidden ones reward playfulness, not impossible guessing |
| **Supernova/Epoch Turn** | Epoch Matter, build tree, story act | current era | reset preview shows exact time-to-recover estimate and everything retained |
| **Deep** | automation, trials, recursive works, resonance inspection | Epoch mastery | the Deep asks the universe’s philosophical question, not the same generic void screen |
| **Trials** | permanent rules, build components, mastery seals | Deep | trials remix mechanics the player already understands and unlock new play styles |
| **Echoes/Codex** | story, endings, object interpretation, secret routes | milestones, archives, trials | Echoes explain why a mechanic exists, not merely describe scenery |
| **Vessel/Crossings** | new worlds, Beacons, Dark Between, Wayfinder | economy, constellation, trials, story | each part is assembled from demonstrated mastery and has a meaningful material origin |
| **Wayfinder** | cross-world loadouts and acceleration | Beacons, Dark Between | laws change routing and strategy, not only multiply all output |

### 3.4 No dead currencies

Every currency needs:

- a clear source;
- at least one finite market;
- at least one recurring sink;
- a reason to save it;
- an endgame conversion or legacy use;
- a visible statement of what resets it.

If a market becomes complete, the currency’s recurring sink must appear immediately. Existing recursive Stardust and Singularity works are the correct pattern. Future recurring sinks should emphasize choice: temporary world projects, anomaly tuning, cosmetic commissions, route modifiers, and loadout capacity.

### 3.5 Story is not a separate tab

Story advances through changed mechanics:

- Lumen speaks because a new behavior was observed.
- An Echo changes the interpretation of an object already on screen.
- A prestige ceremony reveals what that universe considers death and renewal.
- A trial recreates the historical failure of its civilization.
- A Beacon means the restored world no longer depends entirely on the player.
- A crossing changes Lumen’s vocabulary, certainty, and relationship to the Heart.

The Codex preserves and connects these moments; it does not carry the entire narrative alone.

---

## 4. Onboarding: simple for the first hour, deep forever

### 4.1 First-session sequence

| Time | Player sees | Player learns | Design rule |
|---:|---|---|---|
| 0–5 sec | one faint Heart | “This is touchable.” | no text before first interaction; pulse and sound imply affordance |
| 5–30 sec | click response and `+amount` | input creates currency | one sound family, one particle material, no secondary objects |
| 30–90 sec | counter and first goal | currency can be spent | counter purchase is affordable before repetition becomes tiring |
| 2–5 min | Kindling and first passive rate | the game can work without constant clicking | first generator visibly enters the world, not only the shop |
| 5–12 min | upgrades, options, music | systems unlock because the universe becomes capable | each new panel receives one sentence and one highlighted action |
| 12–30 min | first Omen, critical, visible generator state | active play is optional but expressive | missing an Omen never damages progress |
| 30–90 min | cabinet signal, resonance, build hints | the world has secrets and interactions | show “now / soon / unknown” goals |
| 1.5–4 hr | first Epoch Turn | reset means compression, not loss | show before/after production estimate and retained systems |

### 4.2 Progressive disclosure rules

1. Never reveal more than one new spendable currency in the same ten-minute window.
2. A system appears only when the player can perform its first meaningful action.
3. Locked systems show a poetic signal first, then a concrete requirement after the player asks or reaches 70% of it.
4. The first interaction is guided; every later interaction is player-owned.
5. After discovery, the Field Guide exposes exact mechanics and formulas.
6. “Recommended” means explainable, never mandatory. The player can disable purchase guidance.

### 4.3 The Goal Lens

Add one compact, optional goal strip beneath the HUD:

- **Next useful:** cheapest meaningful action and time estimate.
- **Next discovery:** nearest unseen system or record, described without spoilers.
- **Pinned ambition:** a player-selected long goal such as a trial, cabinet shelf, Beacon, or upgrade.

The strip should collapse automatically during active rhythm play and disappear entirely in minimalist mode.

### 4.4 Teaching prestige safely

Before any reset, show a comparison card:

```text
THIS ERA                         AFTER THE TURN
3.4 Qa /s                        estimated 11.8 Qa /s after 4m
18 Kindling tiers                starts with 40 tier-one Kindlings
8 Constellation nodes            12 Stardust available

RETURNS                          REMAINS
currency, generators, upgrades   archive, achievements, Echoes, permanent laws
```

The first reset can be previewed repeatedly. It is never triggered by a single accidental press.

### 4.5 Accessibility is part of onboarding

- Space/Enter and a focusable Heart must work from the first screen.
- Every visual timing cue has an audio, shape, and high-contrast form.
- Rhythm rewards can be averaged into a non-rhythm accessibility mode.
- Reduced motion preserves timing information without travel, shake, or large flashes.
- Color is never the sole indicator of rarity, ownership, tide state, route, or damage.
- Screen-reader labels use the local nouns but include the canonical function.
- The opening mystery must not hide Options, pause, save recovery, or the Field Guide from players who need them.

---

## 5. Making the screen a coherent dopamine hit

Academic work on game feel describes “juicing” as amplification that both empowers the player and clarifies what happened. The point is not maximum particles; it is **coherent, immediate, proportional feedback**. See [Designing Game Feel: A Survey](https://arxiv.org/abs/2011.09201) and [How Does Juicy Game Feedback Motivate?](https://people.csail.mit.edu/dkao/pdf/3613904.3642656.pdf).

### 5.1 Feedback hierarchy

| Event tier | Examples | Feedback budget |
|---|---|---|
| **T0: continuous** | passive production, idle ambience | almost silent; slow material motion; no repeated toast |
| **T1: touch** | normal click, generator buy | 30–120 ms compression, small material burst, short sound, readable number |
| **T2: skill** | critical, on-beat click, efficient purchase | contrasting accent, harmonic layer, slightly longer trail, local glow |
| **T3: discovery** | new tier, cabinet object, Echo, shelf | object arrival animation, named sound, brief world lighting change, Lumen line |
| **T4: mastery** | trial complete, branch capstone, Vessel part | 2–5 second ceremony, camera emphasis, music cadence, persistent silhouette change |
| **T5: epoch** | Supernova, Deep Collapse, Beacon, crossing | authored in-engine sequence with silence/contrast and a permanently changed state |

If every click uses T4 effects, nothing feels important. Reserve the largest effects for events the player will remember.

### 5.2 The ideal click timeline

- **0–16 ms:** input accepted; Heart compresses or changes material tension.
- **0–40 ms:** attack portion of the click sound begins.
- **20–80 ms:** particles emerge from the contact point using the universe material.
- **50–160 ms:** `+amount` separates from the Heart and follows a readable arc.
- **80–220 ms:** surrounding world gives a faint sympathetic response.
- **120–350 ms:** Heart returns with a small overshoot; critical/rhythm states finish their accent.

Never delay the basic sound until the economic tick. Input feedback and economy simulation are separate concerns.

### 5.3 A click has semantic materials

- Emberlight clicks eject plasma sparks and magnetic filaments.
- Tidefall clicks compress a pearl-like surface and release pressure rings.
- Verdance clicks split a seed coat and send veins through nearby roots.
- Clockwork clicks engage a tooth, advance an escapement, and transmit torque.
- Prismata clicks focus a ray and create a short spectral caustic.
- Tempest clicks separate charge and grow a branching leader.
- Canticle clicks strike a membrane and propagate a visible waveform.

Particles are consequences of the material, not confetti.

### 5.4 Purchase ceremony

Every significant purchase should answer four questions in under one second:

1. What was bought?
2. Where did it go?
3. What did it change?
4. What should the player want next?

Sequence:

- price contracts into the purchased item;
- the relevant screen location brightens;
- the item enters or evolves in the world;
- production delta appears briefly (`+18% total rate`);
- the next state or synergy becomes visible.

Bulk purchases combine into one ceremony, never 100 overlapping animations.

### 5.5 Screen composition rules

The playfield has four semantic zones:

1. **Heart zone:** central action and rhythm; no decorative object may cross its hit target.
2. **Near system:** active Kindlings and interactive archive objects; low visual frequency.
3. **Far system:** large-scale empire and history; medium visual frequency.
4. **Horizon:** Beacon, routes, future goals, and story threats; slowest motion.

At most:

- one primary animated target;
- three secondary interactive objects;
- two temporary reward effects;
- one story subtitle;
- one major panel

may demand attention at the same time. Everything else becomes ambient, grouped, dimmed, or summarized.

### 5.6 Visual-density governor

The world renderer should budget **attention**, not only particles.

Each manifest object declares:

- `salience`: ambient, supporting, interactive, milestone;
- `screenZone`;
- `motionBudget`;
- `minimumDistanceFromHeart`;
- `canOverlap` groups;
- `reducedMotionPose`;
- `qualityFallback`;
- `priorityWhilePanelOpen`.

When the screen becomes dense, reduce twinkle count and merge repeated producers into constellations, schools, groves, gear trains, spectra, storm fronts, or choirs. Never solve clutter by scattering smaller copies everywhere.

### 5.7 The “no naked primitives” rule

A circle, cone, sphere, cylinder, or line may be used as construction geometry, but it is never the final concept.

Every visible object must pass this card:

```text
NAME:
WORLD OF ORIGIN:
REAL OR IMAGINED PHENOMENON:
MECHANICAL PURPOSE:
WHY IT OCCUPIES THIS SCREEN ZONE:
MATERIAL / SURFACE:
SILHOUETTE AT A GLANCE:
IDLE BEHAVIOR:
INTERACTION BEHAVIOR:
OWNERSHIP STATES (1 / 10 / 25 / 50 / 100):
SOUND FAMILY:
LORE RECORD:
REDUCED-MOTION FORM:
LOW-QUALITY FORM:
```

If the card cannot be filled out, the object is not ready for the game.

### 5.8 Ownership changes form, not only count

Use five thresholds consistently:

- **1:** a single specimen appears.
- **10:** specimens organize into a recognizable group.
- **25:** the group begins affecting nearby objects.
- **50:** it changes lighting, music, or world topology.
- **100:** it becomes infrastructure—a permanent landmark rather than 100 sprites.

Example: one Sun is a star; ten Suns establish an ecliptic; twenty-five produce lensing arcs; fifty illuminate nebulae; one hundred collapse visually into a named stellar civilization whose panel reports the count.

### 5.9 Audio grammar

Every universe has:

- one click material;
- one purchase interval;
- one critical accent;
- one Omen call;
- one prestige cadence;
- four adaptive music stems tied to Kindling families;
- a silence state that is musically intentional.

Pitch variation stays bounded so rapid touching never becomes shrill. Big milestones temporarily subtract sound before adding it; contrast is more powerful than volume.

---


## 6. The seven-universe atlas

### 6.1 What must change between universes

A universe is not a palette. A complete universe pack owns:

- base currency name, glyph, material, and counting sound;
- Heart identity, click animation, and hit sound;
- eighteen Kindlings with local names and silhouettes;
- local production law that changes strategy;
- four build archetypes;
- four or more unique Omens with local movement and reward tables;
- twelve archive objects arranged into three meaningful shelves;
- local Epoch Turn name, ceremony, resource, and skill map;
- Deep presentation and trial variants;
- ambient environment, motion rules, and density-merging rules;
- click, purchase, Omen, achievement, and prestige audio families;
- adaptive score with its own meter/tempo/harmony;
- Lumen vocabulary, ten core Echoes, and a civilization question;
- one Beacon silhouette visible from the multiverse map;
- accessibility equivalents for all timing, color, and audio information.

The canonical UI layout may remain familiar. The decision pattern and sensory identity may not.

### 6.2 Common local progression shape

Each world uses the same learnable skeleton:

1. Wake its Heart.
2. Establish six foundational Kindlings.
3. Discover the world law.
4. Build six civilizational Kindlings.
5. Turn the first Epoch and choose a local doctrine.
6. Build six cosmic/transcendent Kindlings.
7. Enter the local face of the Deep.
8. Solve trials based on that world’s historical failure.
9. Complete its Archive and final Kindling.
10. Light its Beacon and decide what responsibility the restored world has toward its neighbors.

This shared cadence lowers relearning cost. The verbs, systems, builds, and presentation make the worlds distinct.

---

## U1 — Emberlight: The Known Sky

### Identity

- **Fantasy:** rebuild a universe from plasma, dust, gravity, stars, galaxies, and the cosmic web.
- **Heart:** The Last Ember, eventually becoming a stable stellar Heart.
- **Currency:** Light.
- **Favored players:** Restorers and Archivists, with the clearest baseline for Optimizers.
- **Core law:** stable production plus a web of resonances between scales. Emberlight teaches the common rules and lets synergies become increasingly important.
- **Epoch Turn:** Supernova.
- **Epoch Matter:** Stardust.
- **Civilization question:** “Is creation an act of care, or only hunger delayed?”

### Visual language

- **Materials:** incandescent plasma, ionized filaments, dust lanes, accretion disks, gravitational lensing, spectral bloom.
- **Primary silhouettes:** starbursts, crescent disks, bipolar jets, irregular nebula clouds, spiral/elliptical galaxy forms, branching cosmic filaments.
- **Motion:** orbital, rotational, accreting, eruptive, lensing; never arbitrary bouncing.
- **Zones:** stellar nursery below/near; mature stars around the Heart’s ecliptic; galaxies in the far field; cosmic web at the horizon.
- **Density merge:** individual stars become clusters, clusters become galaxies, galaxies become a connected web.

### Kindling ladder

1. Spark
2. Wisp
3. Hearth
4. Kiln
5. Forge
6. Beacon
7. Furnace Titan
8. Star Seed
9. Protostar
10. Sun
11. Binary Pair
12. Constellation
13. Nebula Garden
14. Galaxy
15. Supercluster
16. Cosmic Web
17. Deep Loom
18. The Second Ember

Each tier’s final silhouette must reference the named phenomenon. A “Galaxy” is not a circle with dots; it has a core, arms or elliptical distribution, dust occlusion, rotation, and lensing response.

### Build doctrines

- **The Forge:** stable passive production and high-tier infrastructure.
- **The Hand:** click share, critical mass, rhythm timing.
- **The Sky:** Omens, rare phenomena, and active chaining.
- **The Root:** offline efficiency, head starts, and lower-tier resonance.

### Omens

- **Falling Star:** catch for a production frenzy.
- **Pulsar Sweep:** a rotating beam creates three timed touch windows.
- **Comet Return:** a long-period path stores production and returns predictably.
- **Microlensing Event:** briefly reveals hidden objects and multiplies the most efficient Kindling.

### Astral Cabinet: twelve purposeful records

1. White Dwarf — compressed persistence.
2. Magnetar — rhythm-window distortion.
3. Protostellar Nursery — fuelable production incubation.
4. Rogue Planet — offline traveler and stored return.
5. Aurora World — visual weather and event attraction.
6. Quasar — second rhythmic click source.
7. Red Giant — late-life amplification.
8. Black Hole — production storage and horizon mystery.
9. Supermassive Black Hole — galaxy-scale resonance.
10. Cosmic Microwave Fragment — oldest lore signal.
11. Gravitational-Wave Knot — synergy amplifier.
12. Orrery of the Local Sky — shelf capstone and map anchor.

### Sound and story

- 72 BPM, warm pulse, mallets → forge percussion → strings → choir.
- Clicks are woody-plasma impacts with a short magnetic tail.
- The Supernova ceremony removes stems one by one, reaches one beat of silence, then returns as Stardust shimmer.
- Emberlight’s Archive establishes that the known astronomical objects are not decoration: each is evidence that the old universe anticipated the player’s return.

### Completion image

The screen resolves from scattered light into a legible cosmic hierarchy: nursery, stars, galaxies, web, Beacon. The player can understand the restored universe at a glance.

---

## U2 — Tidefall: The Moonless Sea

### Identity

- **Fantasy:** restore a universe whose vacuum behaves like an ocean under the pull of an absent moon.
- **Heart:** The Tideheart, a dense bioluminescent pearl enclosing a pressure void.
- **Currency:** Glow.
- **Favored players:** Performers and Restorers.
- **Core law:** production moves through a visible ninety-second tide. Active players surf crests; idle players receive the stable average.
- **Epoch Turn:** Undertow—the sea draws every built current beneath the Heart and returns Moon Salt.
- **Epoch Matter:** Moon Salt.
- **Civilization question:** “Can memory guide a world without becoming a force that controls it?”

### Visual language

- **Materials:** water volume, bioluminescent tissue, nacre, suspended silt, translucent membrane, kelp fiber, pressure distortion.
- **Primary silhouettes:** ripples, currents, reef branching, jelly forms, whale-like migrations, trenches, thermal vents, moon wakes.
- **Motion:** buoyant, tidal, schooling, pulsing, drifting, rising; never orbital unless the object explicitly follows a moon path.
- **Zones:** pale epipelagic top; reef/currents at mid-depth; abyss and vents below; absent moon suggested by negative space at the horizon.
- **Density merge:** droplets become currents, reef lights become cities, creatures become migrations, currents become the Living Sea.

### Kindling ladder

1. Droplet
2. Ripple
3. Tidepool
4. Current
5. Reef Light
6. Moonwake
7. Kelp Cathedral
8. Pearl Seed
9. Bioluminance
10. Drowned Beacon
11. Twin Tides
12. Shoal Constellation
13. Abyssal Garden
14. The Living Sea
15. Ocean of Moons
16. World Current
17. The Deep Trench
18. The Second Wave

### Build doctrines

- **Crest Rider:** high-tide active bursts and Omen chains.
- **Steady Keel:** narrows variance, strengthens idle/offline output.
- **Reef Builder:** lower-tier cross-resonance and persistent infrastructure.
- **Abyss Listener:** low-tide preparation, archive effects, and Deep rewards.

### Omens

- **Spring Tide Bubble:** strong production and moderate click multiplier.
- **Undertow Bubble:** enormous click multiplier with short duration.
- **Moon Pearl:** instant stored production plus a long gentle current.
- **Abyssal Bloom:** brief, symmetric production/click eruption.
- **Leviathan Passage:** rare multi-stage shadow; following its three surfacings yields an archive variant.

### Pelagic Archive

1. Reflected White Dwarf — false moon and tide origin.
2. Pressure Chimes — visual/audio beat aid.
3. Pearl Nursery — fuelable incubation.
4. Glass Kelp Garden — persistent reef resonance.
5. Quasar Sounding Line — second rhythmic click source.
6. Long-Wake Traveler — stored return migration.
7. Aurora Current — Omen attraction.
8. Black Mouth — horizon mystery.
9. Sunken Star Jar — instant storage.
10. Tidal Metronome — crest timing.
11. Red Giant Buoy — navigational lore.
12. Abyssal Orrery — map of the missing moons.

### Sound and story

- 60 BPM, minor-seventh sway, pressure-drop clicks, filtered percussion, glass harmonics, distant whale-like synthesis.
- Tide state is communicated by pitch, icon shape, text, and waterline—not color alone.
- The Undertow ceremony reverses particles and music envelopes, then resurfaces with Moon Salt crystallized on the Heart.
- The Archive reveals that the absent moon was deliberately removed to stop something in the trench from learning the rhythm of the world.

### Completion image

The restored sea reads as one ecosystem: light above, reef civilization around the Heart, migrations crossing mid-depth, an illuminated but unresolved trench below, and the Beacon rising like a lighthouse with no shore.

---

## U3 — Verdance: The Patient World

### Identity

- **Fantasy:** grow a dead seed into a planetary organism whose networks remember every pruning.
- **Heart:** The First Seed.
- **Currency:** Sap.
- **Favored players:** Restorers and Optimizers.
- **Core law:** Kindlings age. Each planted unit develops through growth rings and gains production over real active/offline time up to a cap. New planting is fast; old growth is precious.
- **Epoch Turn:** Pruning. Mature growth is cut back into Seeds that permanently improve future germination and unlock grafts.
- **Epoch Matter:** Memory Seeds.
- **Civilization question:** “Is preservation still life if nothing is allowed to change?”

### Visual language

- **Materials:** bark, cambium, leaf cuticle, mycelium, pollen, amber, dew, seed shells, root fiber.
- **Primary silhouettes:** branching roots, phyllotaxis spirals, fungal fans, leaf canopies, fruiting bodies, vascular networks.
- **Motion:** germination, unfurling, capillary flow, phototropism, pollination, seasonal shedding.
- **Zones:** roots below Heart; understory near; canopy above; spores and pollinators crossing; mycelium connecting distant systems.
- **Density merge:** plants become groves, groves become biomes, roots become a planetary nervous system.

### Kindling ladder

1. Memory Seed
2. Root Hair
3. Pale Sprout
4. Moss Cradle
5. Mycelium Thread
6. Young Grove
7. Pollinator Choir
8. Amber Orchard
9. Heartwood
10. Rain Canopy
11. Walking Mangrove
12. Forest Constellation
13. Continental Rhizome
14. Photosphere Bloom
15. Biosphere Crown
16. World Root
17. The Remembering Forest
18. The World-Tree

### The growth mechanic

- Each purchased unit stores `plantedAt` or a compact age cohort.
- Production multiplier rises in visible stages rather than invisible minute-by-minute decimals.
- Cohorts merge for save efficiency: new, rooted, mature, ancient.
- Pruning converts maturity, not raw count, into Memory Seeds.
- Grafting lets one mature Kindling lend a trait to another, forming the local build system.
- Offline aging is full-speed up to the offline cap; nothing withers while absent.

### Build doctrines

- **Canopy:** mature high tiers and long sessions.
- **Rhizome:** broad lower tiers and cross-network bonuses.
- **Bloom:** active pollination, rhythm, and Omens.
- **Seedbank:** rapid pruning cycles, offline growth, and strong starts.

### Omens

- **Golden Pollinator:** traces a flower route; touching blooms in order multiplies Sap.
- **Spore Rain:** seeds several young cohorts and accelerates root connections.
- **Sunbreak:** a moving shaft of light empowers Kindlings it crosses.
- **Amber Fruit:** contains stored age; harvest now or let it ripen for a larger deterministic reward.

### Impossible Herbarium

1. Resurrection Fern
2. Moon Orchid
3. Walking Mangrove
4. Glass Lichen
5. Memory Amber
6. Choir Fungus
7. Compass Vine
8. Lightning Oak
9. Star Pollen
10. Ocean Seed
11. Root Fossil
12. Garden Gate Cutting

Shelves are **Survival**, **Communication**, and **Inheritance**. Their rewards respectively improve offline aging, cross-Kindling grafts, and Memory Seed yield.

### Sound and story

- 84 BPM in an asymmetrical 6/8 feel, hand percussion, wooden clicks, leaf noise, breathy flute synthesis, root-bass pulses.
- A click cracks the seed coat and propagates a vein through the nearest network.
- Pruning is visually tender, not violent: leaves release, stems become amber lines, and the Seedbank lights.
- Verdance’s civilization stopped death so completely that it also stopped adaptation. Its trials ask the player to grow under scarcity, mutation, shade, and deliberate loss.

### Completion image

The World-Tree is not one giant trunk blocking the UI. Its roots define the lower composition, canopy frames the upper screen, and open negative space preserves the Heart. Every old cohort becomes a visible growth ring in the Beacon.

---

## U4 — Clockwork: The Unwound City

### Identity

- **Fantasy:** restart a deterministic universe where time is transmitted as torque through an immense civic machine.
- **Heart:** The Escapement Heart.
- **Currency:** Ticks.
- **Favored players:** Optimizers and Wayfinders.
- **Core law:** no random criticals or random Omens. Production is routed through visible gear trains. Players choose which Kindling drives, multiplies, or times another.
- **Epoch Turn:** Rewinding. The machine returns to zero and yields Mainsprings containing perfected timing.
- **Epoch Matter:** Mainsprings.
- **Civilization question:** “If every future is predictable, can any choice be free?”

### Visual language

- **Materials:** brass, blued steel, ceramic bearing, clock glass, oil, punched paper, tensioned spring, engraved ivory substitute.
- **Primary silhouettes:** gears with meaningful tooth counts, escapements, cams, governors, flywheels, linkages, automata, astronomical clocks.
- **Motion:** meshing rotation, reciprocation, indexing, winding, controlled release. Nothing spins without transmitting work.
- **Zones:** Heart escapement center; power train left/below; computation train right; civic clock towers at horizon; route lines follow mechanical linkages.
- **Density merge:** individual gears become trains, trains become engines, engines become districts of the Great Regulator.

### Kindling ladder

1. Tooth
2. Cog
3. Ratchet
4. Escapement
5. Mainspring
6. Flywheel
7. Governor
8. Clockmaker Automaton
9. Orrery
10. Difference Engine
11. Relay Foundry
12. Meridian Clock
13. Prediction Mill
14. City of Hours
15. Causal Engine
16. World Gear
17. The Last Calendar
18. The Great Regulator

### The routing mechanic

- Each Kindling has one input socket and one output socket initially.
- A route may transmit power, cadence, or efficiency; tooltips show the exact resulting formula.
- Rewiring is free outside active trials and can be stored in loadouts.
- Early recommended routes prevent onboarding paralysis.
- Late Mainspring laws add splitters, feedback governors, conditional gates, and scheduled route changes.
- Deterministic **Maintenance Signals** replace random Omens and are forecast on a timeline.

### Build doctrines

- **Power Train:** concentrate output through one dominant engine.
- **Distributed Works:** broad network with redundancy and offline stability.
- **Precision Train:** rhythm/timing windows and exact cycle bonuses.
- **Forecast Engine:** scheduled automation and future-state planning.

### Scheduled Omens

- **Maintenance Window:** choose one train to tune for a temporary multiplier.
- **Noon Alignment:** the Orrery aligns every fixed interval and rewards prepared routes.
- **Leap Tick:** insert or bank one extra production cycle.
- **Recall Notice:** forecasted event that lets the player replay the best recent ten seconds.

### Patent Ledger

1. One-Tooth Prototype
2. Self-Oiling Bearing
3. Impossible Escapement
4. Moonless Orrery
5. Memory Cam
6. Compassion Governor
7. Punched Prophecy
8. Perpetual Warranty
9. Broken Hourglass
10. Clockmaker’s Hand
11. City Shift Bell
12. Blueprint for Tomorrow

Shelves are **Transmission**, **Prediction**, and **Exception**. The final shelf introduces controlled unpredictability as a philosophical discovery rather than a generic random buff.

### Sound and story

- 90 BPM, strict 4/4, mechanical percussion, tuned metal, relay clicks, gradually humanized timing as the story advances.
- Every purchase adds a sound only when its train completes a cycle, avoiding constant ticking fatigue.
- Rewinding releases spring tension in reverse musical order, then locks one perfect interval into a Mainspring.
- The civilization predicted the Devourer and stopped its own time to avoid being noticed. The act of restoration makes the world vulnerable again.

### Completion image

The final machine resembles a functioning city and astronomical instrument, not a pile of gears. Route direction, load, bottleneck, and inactive systems are legible through motion, line weight, symbols, and sound.

---

## U5 — Prismata: The Broken Spectrum

### Identity

- **Fantasy:** reassemble a universe whose white light shattered into incompatible colors and geometries.
- **Heart:** The White Lens.
- **Currency:** Chroma.
- **Favored players:** Optimizers and Archivists.
- **Core law:** Kindlings emit wavelength families. Players combine and focus bands through lenses to satisfy recipes, unlock effects, and create white-light synthesis.
- **Epoch Turn:** Refraction. The current spectrum is split and crystallized into permanent Facets.
- **Epoch Matter:** Facets.
- **Civilization question:** “Does unity require every difference to disappear?”

### Visual language

- **Materials:** crystal lattice, glass, thin-film interference, diffraction, polarizing membrane, caustics, fluorescence.
- **Primary silhouettes:** prisms, lens assemblies, diffraction gratings, spectral arcs, crystal habits, fiber bundles. Shapes always include optical function and light path.
- **Motion:** propagation, focusing, splitting, interference, polarization rotation, fluorescence decay.
- **Zones:** emitters left/below; lenses around Heart; detector/recipe field right; auroral spectrum at horizon.
- **Density merge:** rays become beams, beams become fiber constellations, crystals become lattices, spectra become a reconstructed sky.

### Kindling ladder

1. Photon Seed
2. Red Ember Ray
3. Amber Band
4. Green Line
5. Blue Wake
6. Violet Spark
7. Prism
8. Fluorescent Garden
9. Polarizer
10. Lens Foundry
11. Diffraction Choir
12. Spectrum Bridge
13. Crystal Observatory
14. Aurora Engine
15. Lattice Moon
16. Rainbow Horizon
17. The Invisible Band
18. The White Star

### The spectrum mechanic

- Early play produces three broad bands; later Kindlings introduce narrow lines and invisible bands.
- Lens slots route bands into recipes such as complementary pairs, continuous spectrum, or pulsed coherence.
- Recipes create behavioral laws: stronger clicks, stable idle light, Omen attraction, archive revelation.
- The interface always provides a colorblind-safe spectral label, pattern, wavelength number, and shape.
- Saved lens loadouts support experimentation; respec is free.

### Build doctrines

- **Coherence:** concentrate one narrow wavelength for enormous focused output.
- **Synthesis:** combine all bands for stable white-light multipliers.
- **Fluorescence:** delayed/offline energy storage and release.
- **Diffraction:** broad active effects, Omens, and archive discovery.

### Omens

- **Caustic Flare:** a bright path crosses lenses; aligned optics multiply its reward.
- **Dark Line:** briefly removes one band but exposes a hidden absorption record.
- **Polar Aurora:** rotate a visual filter to match its orientation.
- **Cherenkov Wake:** a rare superluminal blue trace that chains through correct lens order.

### Spectrum Vault

1. Newton’s Lost Prism
2. Black Diamond Lattice
3. Fluorescent Fossil
4. Polarized Moon Shard
5. Infrared Garden
6. Ultraviolet Script
7. Gravitational Lens Chip
8. Frozen Rainbow
9. Absorption Crown
10. Fiber Star Map
11. Colorless Butterfly
12. White-Light Reliquary

Shelves are **Separation**, **Transmission**, and **Reunion**.

### Sound and story

- 96 BPM, bright mallets and glass, with harmony assigned to wavelength families. Combining colors literally combines chord tones.
- Clicks are glassy focus snaps with a soft photon hiss, not generic chimes.
- Refraction freezes the current beam network into a Facet, then the Heart returns as white light missing one subtle band until restored.
- The civilization divided itself into perfect, isolated spectra so no faction could consume another; it also lost the ability to perceive a shared world.

### Completion image

The player sees a legible optical instrument spanning the screen: sources, paths, lenses, interference, and a white star. Patterns and geometry preserve all information in grayscale and high-contrast modes.

---

## U6 — Tempest: The Charged Expanse

### Identity

- **Fantasy:** rebuild a universe made of atmosphere, pressure, magnetism, and storms that create land through repeated discharge.
- **Heart:** The Storm Eye.
- **Currency:** Charge.
- **Favored players:** Performers and Wayfinders.
- **Core law:** production builds electrical potential. The player chooses when and where to discharge it, trading stable accumulation for explosive chain reactions.
- **Epoch Turn:** Grounding. The entire storm is discharged into permanent Fulgurites that remember its path.
- **Epoch Matter:** Fulgurites.
- **Civilization question:** “Is power safest when contained, or only meaningful when released?”

### Visual language

- **Materials:** cloud volume, rain, ice crystal, plasma channel, ion glow, magnetic field lines, glassed sand, storm metal.
- **Primary silhouettes:** cumulonimbus towers, anvils, rotating cells, branching leaders, auroral curtains, cyclones, magnetic loops.
- **Motion:** convection, rotation, charge separation, leader growth, precipitation, pressure waves.
- **Zones:** ground and fulgurites below; Heart eye center; storm cells around; jet stream above; magnetosphere at horizon.
- **Density merge:** droplets become cells, cells become fronts, fronts become a planetary dynamo.

### Kindling ladder

1. Ion
2. Droplet Charge
3. Static Veil
4. Updraft
5. Rain Cell
6. Thunderhead
7. Lightning Leader
8. Hail Forge
9. Supercell
10. Jet Stream
11. Cyclone Pair
12. Aurora Crown
13. Continental Front
14. Storm Ocean
15. Planetary Dynamo
16. Magnetosphere
17. The Endless Hurricane
18. The Second Thunder

### The charge mechanic

- Passive production fills a clearly bounded potential meter.
- Kindlings occupy connected storm cells; a discharge follows the chosen path.
- Short paths are reliable; long paths multiply rewards but require enough charge.
- Clicking influences leader direction and rhythm without requiring rapid tapping.
- Discharges can emphasize production, clicks, Omens, or archive discovery.
- Automation can execute saved paths at thresholds; active play can improvise more efficient chains.

### Build doctrines

- **Conductor:** frequent, reliable short discharges.
- **Supercell:** long charge cycles and enormous chains.
- **Jetstream:** passive/offline circulation and cross-cell multipliers.
- **Stormchaser:** active Omens, critical paths, and archive variants.

### Omens

- **Ball Lightning:** follows the player’s last discharge path.
- **Blue Jet:** rises from cloud to horizon and rewards vertical infrastructure.
- **Sprites:** multiple high-altitude targets that form a timed pattern.
- **Quiet Eye:** a rare calm interval that banks all production and reveals lore.

### Storm Almanac

1. First Raindrop
2. Bottled Petrichor
3. Fulgurite Branch
4. Red Sprite Photograph
5. Ball-Lightning Cage
6. Compass Without North
7. Eye-Wall Seed
8. Frozen Thunder
9. Aurora Ribbon
10. Jetstream Chart
11. Stormglass Barometer
12. Map of the Final Climate

Shelves are **Formation**, **Discharge**, and **Aftermath**.

### Sound and story

- 108 BPM with syncopated percussion, low pressure rumbles, rain textures, and electrical high accents. Loudness remains tightly limited.
- Clicks are dry static snaps; discharges use layered propagation so the path is audible.
- Grounding creates a screen-wide but reduced-motion-safe path, then leaves a unique fulgurite silhouette representing the completed build.
- The civilization stored every conflict as atmospheric charge until a single disagreement became a world-ending storm.

### Completion image

The screen settles into a readable climate system—ground, cells, fronts, jet stream, magnetosphere—with the Beacon occupying the former eye wall as a stable auroral column.

---

## U7 — Canticle: The Silent Choir

### Identity

- **Fantasy:** restore a universe whose matter exists as standing waves, memory loops, and relationships between tones.
- **Heart:** The First Chord, visually represented by a resonant membrane and harmonic nodes—not a floating music note icon.
- **Currency:** Resonance.
- **Favored players:** Performers and Archivists.
- **Core law:** production is arranged into short sequences. Kindlings contribute pulses, drones, rests, and harmonics; the player builds a repeating measure that can emphasize active or idle play.
- **Epoch Turn:** Refrain. The completed composition ends, and its strongest relationships survive as Overtones.
- **Epoch Matter:** Overtones.
- **Civilization question:** “Can a voice remain itself while becoming part of a harmony?”

### Visual language

- **Materials:** vibrating membrane, Chladni sand patterns, luminous air density, strings, resonant wood, metallic overtones, waveform ribbons.
- **Primary silhouettes:** standing-wave nodes, instrument bodies, chambers, strings, tuning forks, choir architecture, interference patterns. Avoid literal decorative notes.
- **Motion:** oscillation, propagation, interference, entrainment, decay, call-and-response.
- **Zones:** rhythm sources around Heart; bass chambers below; melodic paths across; reverberation horizon behind.
- **Density merge:** pulses become measures, measures become movements, voices become a visible cathedral of standing waves.

### Kindling ladder

1. Pulse
2. Reed Breath
3. String
4. Drum Skin
5. Tuning Fork
6. Resonant Bowl
7. Echo Chamber
8. Bell Garden
9. Harmonic Loom
10. Memory Organ
11. Counterpoint Pair
12. Choir Constellation
13. Cathedral Wave
14. Planetary Chorus
15. Gravitational Hymn
16. World Resonator
17. The Unheard Movement
18. The Second Voice

### The sequence mechanic

- Begin with a four-slot measure; expand gradually to eight and sixteen slots.
- Kindlings fill roles: pulse, sustain, multiplier, rest, syncopation, echo.
- A rest is a positive strategic object that can amplify neighboring events.
- Presets support idle, click, Omen, and archive builds.
- Players can audition changes without spending or resetting.
- Silent mode displays timing through expanding node patterns, haptics where available, and captions; it retains full rewards.
- Automation may switch compositions based on offline/active state.

### Build doctrines

- **Pulse:** rhythm clicks and rapid cycles.
- **Drone:** stable passive/offline production.
- **Counterpoint:** multiple Kindling families interacting.
- **Silence:** rests, delayed rewards, archives, and Deep efficiency.

### Omens

- **Wandering Refrain:** repeat a short visual/audio pattern.
- **Dissonant Visitor:** resolve one conflicting interval for a reward.
- **Choir of One:** briefly makes the weakest Kindling carry the melody and become strongest.
- **Perfect Rest:** a silent target whose reward grows if the player intentionally does nothing for a few seconds.

### Resonant Memory

1. First Drum Skin
2. Bell Without Metal
3. Fossilized Chord
4. Silent Tuning Fork
5. Whale-Song Cylinder
6. Seismic Hymn
7. Glass Harmonica Moon
8. Echo of Lumen
9. Broken Conductor’s Baton
10. Chladni Star Map
11. Rest Between Universes
12. Instrument for a Second Voice

Shelves are **Voice**, **Memory**, and **Relationship**.

### Sound and story

- Base 72 BPM but with polymetric layers; the player’s measure changes orchestration, not the core accessibility timing grid.
- Click timbre depends on the active sequence slot while remaining soft and fatigue-safe.
- Refrain lets the composition complete, holds its final waveform on screen, and stores harmonic relationships as Overtones.
- The civilization pursued perfect harmony until individual voices became imperceptible. Its failure is the inverse of Prismata’s isolation.

### Completion image

The restored Canticle is a navigable composition: sources, chambers, standing waves, and choir architecture. A player with audio muted can read its structure completely through node position, pulse shape, captions, and contrast.

---

## 6.3 Cross-universe contrast matrix

| Universe | Primary verb | Time behavior | Active skill | Idle strength | Build object | Main motion | Emotional color |
|---|---|---|---|---|---|---|---|
| Emberlight | kindle | stable growth | rhythm/crit chains | broad resonance | constellation | orbit/accretion | warmth and guilt |
| Tidefall | surf | cyclic | crest timing | average tide stability | current chart | rise/fall/migrate | grief and guidance |
| Verdance | cultivate | aging | pollination/grafting | mature cohorts | living graft | grow/unfurl | care and change |
| Clockwork | route | deterministic schedule | network rewiring | planned automation | gear train | transmit/index | certainty and freedom |
| Prismata | focus | recipe state | lens alignment | fluorescence storage | optical bench | split/focus/interfere | difference and unity |
| Tempest | discharge | charge cycle | path chaining | circulation | storm map | convect/branch | restraint and release |
| Canticle | compose | repeating sequence | pattern performance | drones/rests | measure | oscillate/propagate | voice and belonging |

If two rows begin to feel interchangeable during implementation, one of the universes is not finished.

---



## 7. A game that can last for years without becoming an empty treadmill

### 7.1 The authored saga and the endless game are different promises

The story needs an ending. The save does not.

- **Authored completion:** restore seven Beacons, reconcile the three original answers, reach the Garden, and decide what a universe owes its successors.
- **Continuing mastery:** revisit worlds under new laws, perfect builds, complete archives, discover rare interactions, and map the Atlas of Possible Worlds.

Players who want closure can stop after the Garden and feel that they completed a real work. Players who want a permanent hobby receive systems designed for recombination rather than an infinitely extended cost curve.

### 7.2 Long-horizon cadence

These are tuning targets, not promises of forced waiting.

| Elapsed casual play | Intended frontier |
|---:|---|
| first session | complete UI awakening; understand Kindlings, upgrades, Omens |
| 1–3 days | first several Epoch Turns; clear build identity |
| 1–3 weeks | Deep, early trials, major Act III revelation |
| 3–8 weeks | first ending, Vessel completion, first crossing |
| 2–4 months | Tidefall and Verdance Beacons; Wayfinder specialization |
| 4–8 months | Clockwork and Prismata Beacons; cross-world buildcraft |
| 8–14 months | Tempest and Canticle Beacons; full Chronicle puzzle |
| 12–24 months | Garden ending and first Atlas Convergence |
| beyond | Atlas mastery, anomaly sets, Chronicle variants, optimization records |

Later worlds should not require replaying the first world’s calendar. Beacons, Wayfinder laws, remembered automation, and player knowledge should make each new world’s common layers three to five times faster while preserving its unique strategic arc.

### 7.3 The Atlas of Possible Worlds

After the first three Beacons, unlock a replay system built from authored **World Laws**.

An Atlas route combines:

- one universe;
- one environmental law;
- one economic law;
- one interaction law;
- one narrative fragment;
- optional mastery constraints.

Example:

```text
TIDEFALL: THE GLASS CURRENT
environment: the tide pauses for 12 seconds at each extreme
economy: only shelf-complete archive families resonate
interaction: every third Omen is visible far in advance
narrative: recover the cartographer who removed the moon
mastery: light the temporary Beacon without a critical click
```

World Laws are hand-authored and tested; combinations are seeded. Procedural generation selects compatible authored pieces—it does not invent unbalanced text effects.

### 7.4 Permanent Convergences, not expiring seasons

New content can arrive as **Convergences**: themed groups of Atlas routes, objects, and Echoes.

- A Convergence unlocks permanently when released.
- There is no battle pass and no reward expires.
- A featured Convergence may receive a harmless discovery bonus, but the content remains fully playable later.
- Players can select any archived Convergence.
- Completion rewards are primarily new laws, cosmetics, stories, and build options rather than a mandatory global multiplier.

This provides years of additive content without FOMO or save invalidation.

### 7.5 Infinite systems that remain interesting

Use several orthogonal mastery axes:

1. **Optimization:** fastest Beacon, deepest anomaly, most efficient route.
2. **Buildcraft:** local doctrine + Wayfinder law + archive loadout + anomaly response.
3. **Collection:** object variants, Echo annotations, visual forms, music arrangements.
4. **Execution:** optional rhythm, routing, lens, discharge, or sequence mastery.
5. **Interpretation:** story fragments and alternate Lumen conversations.
6. **Expression:** themes, Beacon forms, Heart vestments, saved world compositions.

Do not use one uncapped production rank as the entire postgame. Repeatable production sinks may support pacing, but new decisions carry the experience.

### 7.6 Legacy progression: The Chronicle

The Chronicle is a permanent record, not another shop.

It displays:

- each universe’s first awakening, Epoch Turn, Deep Collapse, answer, and Beacon;
- fastest and most unusual clears;
- every discovered object with universe-specific illustration states;
- laws used in successful Atlas routes;
- Lumen’s annotations changing across Remembrances;
- player-authored names for Beacons and saved loadouts;
- a zoomed-out timeline connecting causes between universes.

Chronicle completion unlocks interpretation, variants, and route options. It should not become a checklist that demands every hidden joke for basic progression.

---

## 8. Economy and balance plan

### 8.1 Currency architecture

Use four scales, even though local names change.

| Scale | Examples | Scope | Recurring sink |
|---|---|---|---|
| **World** | Light, Glow, Sap, Ticks, Chroma, Charge, Resonance | current run | Kindlings, upgrades, archive actions |
| **Epoch** | Stardust, Moon Salt, Memory Seeds, Mainsprings, Facets, Fulgurites, Overtones | current universe across local resets | doctrine tree, local projects, loadouts |
| **Deep** | Singularities | current remembrance / shared deep layer | automation, trials, recursive works, anomaly slots |
| **Between** | Dark Between, Beacons | all universes | Wayfinder laws, Atlas routes, cross-world projects |

Avoid adding separate currencies for every minigame. If a feature cannot use one of these scales, it needs a strong reason and a clear retirement path.

### 8.2 Active, idle, and offline parity

Target long-window production:

- attentive active play: approximately 1.5–2.5× a strong idle build;
- low-attention open play: approximately 1.1–1.4× offline;
- offline: 100% of the build’s stated offline rate after relevant unlocks;
- accessibility averaged-rhythm mode: within 10–15% of ordinary competent rhythm play, below exceptional execution.

Active play accelerates and diversifies. It never becomes mandatory for permanent content.

### 8.3 Reset quality rules

Every Epoch Turn or Collapse must:

- unlock a purchase or choice immediately;
- restore the previous frontier much faster than the prior run;
- automate or compress at least one mastered task within the next few resets;
- forecast recovery time;
- preserve collections and story unless explicitly stated;
- have a distinct sensory and narrative ceremony;
- never be optimal at intervals shorter than comfortable interaction unless fully automated.

### 8.4 Build balance

For each universe, define four first-class doctrines and at least two hybrids.

- No doctrine should dominate active, idle, challenge, and offline play simultaneously.
- Respec is free outside a live trial/route.
- The UI shows the source of every major multiplier.
- Each build has a visible world signature.
- Balance around meaningful decisions, not identical routes with different colors.

### 8.5 Wall policy

Measure walls as time with none of the following:

- useful affordable purchase;
- meaningful upgrade within 20% reach;
- Omen or active opportunity;
- story/record discovery;
- build decision;
- reset decision;
- visible progress toward a pinned goal.

Targets:

- first hour: no wall over 90 seconds;
- first day: no active wall over 5 minutes;
- established worlds: no active wall over 10 minutes;
- idle/offline goals may be hours or days only when another active or strategic goal remains available.

### 8.6 Simulation profiles

Every universe balance simulator must run:

- zero-skill idle/offline;
- casual one-click-per-second;
- active six-click-per-second;
- competent universe mechanic use;
- highly optimized build;
- reduced-rhythm accessibility mode;
- first visit and Beacon-accelerated revisit;
- no-archive and complete-archive states.

Output milestone times, purchase gaps, rate composition, reset recovery time, build dominance, numeric overflow, and stalled states. A content pack cannot merge without simulator and migration coverage.

### 8.7 Number-system future

The current JavaScript-number economy will eventually reach precision and range limits if the game truly runs for years. Before Atlas progression:

1. Introduce a tested big-number abstraction behind formatting and arithmetic helpers.
2. Migrate save values through a versioned string representation.
3. Keep all content formulas declarative and serializable.
4. Add finite/NaN/overflow tests for every effect pipeline.
5. Offer standard, scientific, engineering, and logarithmic notation.

Do not postpone this until player saves are already near `Number.MAX_VALUE`.

---

## 9. Endgame play: mastery instead of maintenance

### 9.1 Law loadouts

A late-game loadout combines:

- one local doctrine;
- up to three Wayfinder laws;
- one archive shelf resonance;
- one Heart vestment with cosmetic-only presentation;
- optional Atlas anomaly responses;
- automation profile.

Loadouts are named, saved, compared, and shareable as short text codes. Importing a loadout never imports progression.

### 9.2 Mastery trials

After the twelve Deep trials, each universe gains six **Mastery Trials** that test its special law:

- Emberlight: build a functioning resonance web with selected tiers absent.
- Tidefall: clear a goal using only low-tide preparation and crest execution.
- Verdance: preserve an ancient cohort through repeated pruning constraints.
- Clockwork: route a deterministic machine under socket limits.
- Prismata: synthesize white output without one visible wavelength family.
- Tempest: produce a target with a maximum number of discharges.
- Canticle: complete a route using required rests and counterpoint.

Rewards add new options or visuals. They do not simply multiply all production.

### 9.3 Cross-world projects

Beacons collaborate on long projects that consume surplus recurring currencies:

- **The Shared Sky:** Emberlight lensing improves Prismata recipes.
- **The Rain Treaty:** Tidefall currents feed Verdance offline aging.
- **The Weather Clock:** Clockwork schedules Tempest discharges.
- **The Choir of Storms:** Tempest paths become Canticle percussion.
- **The Garden Map:** all worlds reveal compatible Atlas laws.

Projects have contribution stages, visible construction, story scenes, and permanent world changes. They are not countdown timers; progress waits safely for the player.

### 9.4 Optional community without obligation

Good social features:

- share loadout and Atlas seed codes;
- compare personal route solutions locally or through community posts;
- vote on cosmetic Convergence themes;
- collaborative lore interpretation;
- optional aggregate statistics with privacy controls.

Avoid:

- daily leaderboards with exclusive power;
- clans required for progression;
- raid schedules;
- competitive rewards that make absence costly;
- chat infrastructure before moderation is sustainable.

### 9.5 Achievements as a learning map

Achievement groups:

- discovery;
- economic breadth;
- build mastery;
- active performance;
- idle patience;
- accessibility-compatible alternatives;
- story/Archive;
- unusual experiments;
- Atlas mastery.

Every achievement should either teach, commemorate, or invite experimentation. Delete achievements whose only purpose is another zero on an existing count unless that zero marks a real pacing milestone.

---

## 10. The complete story spine

### Act I — The Ember

The player and Lumen mistake rebuilding for simple hope. Mechanics are intimate and understandable.

### Act II — The Forge

Supernovae reveal that the player is comfortable destroying their own work to grow. Lumen begins comparing this behavior to an old threat.

### Act III — The Devourer

The Deep and trials reveal the Heart’s relationship to the consumed universe. The Question produces Warden, Hunger, or Companion—not as a good/evil quiz, but as a doctrine.

### Act IV — The Crossing

The first other universe proves the old catastrophe was not isolated. Lumen’s role changes from archivist of one world to witness between worlds.

### Act V — The Neighbors

Verdance and Clockwork reveal opposite survival failures: refusing change and refusing uncertainty. The player learns that every universe attempted a different defense.

### Act VI — The Divided Light

Prismata reframes identity: separate voices survived but lost shared reality. Past ending choices gain new dialogue and non-dominant route variations.

### Act VII — Release and Belonging

Tempest and Canticle ask whether power must be discharged and whether harmony can preserve individuality. Lumen finally reveals their own responsibility in choosing which universes were awakened.

### Act VIII — The Garden

The Garden is not an eighth normal economy. It is a synthesis space built from the seven Beacons. The player reconstructs relationships between worlds, revisits the three doctrines, and decides whether the Heart should remain central at all.

Possible closure:

- **Warden fulfilled:** worlds govern their own boundaries; the player becomes a distant keeper.
- **Hunger transformed:** consumption becomes compost—the Heart converts endings into beginnings with consent and limits.
- **Companion fulfilled:** the player gives up central control and joins the network as one voice.
- **Reconciliation:** after living all three doctrines across Remembrances, the Garden allows a fourth answer: “Continue.” It unlocks the Atlas without declaring any one doctrine false.

### Story-delivery budget

- Lumen ticker: one sentence, contextual, never blocks.
- Echo: 80–220 words, one concrete image, one mechanical connection.
- Archive record: observation + implication + effect.
- Major scene: 15–45 seconds, skippable after first view, replayable.
- Universe act: ten core Echoes, four object transmissions, one arrival, one first Epoch scene, one Deep scene, one Beacon scene.
- Atlas route: one fragment, not a lore dump.

### Choice and power

Narrative choices may change play style but should have comparable value. Show mechanical consequences before confirmation. After Remembrance, previously chosen doctrines become available as loadout laws so story preference never creates a permanently inferior save.

---

## 11. Data and architecture contracts

Parallel development is safe only after shared schemas are frozen.

### 11.1 `UniversePackV2`

```ts
interface UniversePackV2 {
  id: UniverseId
  identity: {
    name: string
    shortName: string
    epithet: string
    premise: string
    primaryVerb: string
    civilizationQuestion: string
  }
  economy: {
    currency: CurrencyPresentation
    generators: GeneratorDef[]
    upgrades: UpgradeDef[]
    doctrines: DoctrineDef[]
    localPrestige: LocalPrestigeDef
  }
  heart: HeartManifest
  physics: UniverseLawHooks
  omens: OmenDef[]
  archive: ArchiveDef
  trials: TrialDef[]
  story: UniverseStoryDef
  audio: UniverseAudioDef
  visual: UniverseVisualManifest
  beacon: BeaconDef
  accessibility: UniverseAccessibilityDef
}
```

### 11.2 World-object manifest

```ts
interface WorldObjectManifest {
  id: string
  sourceKind: 'generator' | 'archive' | 'omen' | 'story' | 'beacon'
  sourceId: string
  phenomenon: string
  purpose: string
  screenZone: 'heart' | 'near' | 'far' | 'horizon'
  salience: 'ambient' | 'supporting' | 'interactive' | 'milestone'
  material: string[]
  silhouette: string
  motion: MotionGrammar
  ownershipStates?: Record<1 | 10 | 25 | 50 | 100, VisualState>
  reducedMotionState: VisualState
  lowQualityState: VisualState
  overlapGroup: string
  minimumHeartDistance: number
  audioCue?: string
  loreRecord?: string
}
```

Renderers consume manifests. They do not infer meaning from IDs or contain universe-specific economic logic.

### 11.3 Physics hooks

```ts
interface UniverseLawHooks {
  rateMultiplier?(state: EcoState, now: number): number
  clickMultiplier?(state: EcoState, context: ClickContext): number
  purchaseTransform?(state: EcoState, purchase: Purchase): PurchaseResult
  offlineTransform?(state: EcoState, elapsed: number): OfflineResult
  randomAllowed?: boolean
  routing?: RoutingRules
  cohorts?: CohortRules
  sequence?: SequenceRules
  charge?: ChargeRules
  spectrum?: SpectrumRules
}
```

Hooks remain pure and testable. UI and Canvas never calculate production.

### 11.4 Content invariants

- IDs are save-stable and never reused.
- Every removed definition has a migration mapping.
- Every pack has exactly eighteen initial Kindlings and twelve initial archive objects unless a design review changes the global contract.
- Every effect is declarative or isolated in a pure physics hook.
- Every visible claim has a tested mechanical source.
- Every universe ships with a dev scenario, simulator profile, save fixture, and Field Guide entries.
- No content agent edits shared engine contracts after contract freeze without an explicit review.

---

## 12. Parallel-agent implementation roadmap

The main source of multi-agent failure is not code quality; it is two capable agents changing the same contract differently. Use staged parallelism.

### Stage F0 — Contract freeze (sequential, required first)

#### F0.1 Canonical vocabulary and progression lock

- Finalize Heart, Kindling, Omen, Archive, Epoch Turn, Deep, Beacon, and Atlas terms.
- Decide which names appear in UI versus tooltips.
- Decide reset boundaries and shared/local currencies.
- Output: `docs/CANONICAL_SYSTEMS.md`.

#### F0.2 Schema lock

- Implement or document `UniversePackV2`, object manifests, physics hooks, audio contracts, and accessibility contracts.
- Add type-only fixtures for all seven universes.
- Output: compile-clean contracts with no game behavior.

#### F0.3 Save-range plan

- Reserve IDs and migration versions for U3–U7 and Atlas systems.
- Decide big-number migration boundary.
- Output: save compatibility decision record.

**Gate:** no universe content implementation begins until F0 types and reset boundaries are approved.

### Stage F1 — Cohesion foundation (parallel after F0)

#### Agent lane A — Goal Lens and onboarding

- Own: goal recommendation engine, pinned goals, reset comparison card, contextual first-use prompts.
- Must not edit universe content.
- Acceptance: new player can identify now/soon/pinned goals; entire feature can be disabled.

#### Agent lane B — Purchase and feedback grammar

- Own: event feedback tiers, purchase delta calculation, animation orchestration, bulk aggregation.
- Must consume manifests and emit semantic events.
- Acceptance: one/ten/max buys never overlap effects; reduced motion has equivalent clarity.

#### Agent lane C — World manifest renderer

- Own: zone layout, salience governor, ownership state transitions, overlap prevention, quality fallbacks.
- Must not calculate economy.
- Acceptance: automated screenshot tests detect Heart obstruction and overflow at desktop/mobile sizes.

#### Agent lane D — Audio grammar

- Own: semantic cue registry, per-universe buses, fatigue limits, ducking, silence/reduced-audio behavior.
- Must not define progression requirements.
- Acceptance: all cues can be muted independently; no clipping under ten clicks per second plus an Omen.

#### Agent lane E — Big-number and formula inspection

- Own: numeric abstraction, notation, serialization, migration, formula breakdown UI.
- Acceptance: old fixtures migrate exactly; all economy tests remain finite at multi-year projections.

#### Agent lane F — Accessibility framework

- Own: focus management, semantic roles, non-color indicators, averaged rhythm mode, screen-reader announcements.
- Acceptance: complete keyboard path through base run, prestige, trial, cabinet, Vessel, crossing, and guide.

**F1 integration gate:** Emberlight must run on the new contracts before any new universe is merged.

### Stage F2 — Existing-world coherence pass

Run two content teams in parallel, with no shared-file edits.

#### Team E1 — Emberlight bible implementation

- Deliver eighteen object manifests, twelve cabinet manifests, four Omens, doctrine visuals, audio map, ten Echo revisions.
- Replace generic glimmers with meaningful state clusters.
- Preserve economic IDs and save behavior.

#### Team T1 — Tidefall bible implementation

- Deliver the complete pelagic ecosystem, tide-state non-color cues, Leviathan Omen, local Epoch ceremony specification, and ten Echo revisions.
- Verify every cabinet/shop/world name and color is identical across views.

#### Team Q1 — Comparative QA

- Run blind screenshots with labels removed. Testers must still distinguish world, tide state, interactive objects, and Heart.
- Run audio-only identification and muted/high-contrast identification.

**F2 gate:** Emberlight and Tidefall must feel different in mechanics, silhouette, sound, click response, Omen behavior, Archive, and prestige ceremony.

### Stage F3 — First expansion pair

#### Team V — Verdance vertical slice

Owned files:

- `content/universes/verdance/*`
- Verdance manifest fixture
- Verdance simulator profile
- Verdance-specific renderer modules only

Deliver in order:

1. First Seed + six Kindlings + cohort model.
2. Full eighteen Kindlings.
3. Pruning and Memory Seed doctrine tree.
4. Four Omens and Herbarium.
5. Deep/trials/story/Beacon.
6. Audio and accessibility.

#### Team C — Clockwork vertical slice

Deliver in order:

1. Escapement Heart + six Kindlings + routing graph.
2. Route inspection and free loadouts.
3. Full Kindling ladder and deterministic signals.
4. Rewinding, Mainsprings, Patent Ledger.
5. Deep/trials/story/Beacon.
6. Audio and accessibility.

#### Team S3 — Shared expansion QA

- Save parking/crossing tests.
- First-visit acceleration tests.
- Simulator comparison across four worlds.
- Mobile performance and memory profiling.

**F3 gate:** both worlds clear their first Beacon in simulated and human target ranges without copying Emberlight’s decision pattern.

### Stage F4 — Second expansion trio

After F3 proves the contracts, run three universe teams in parallel.

#### Team P — Prismata

- Own spectral routing, recipes, pattern/color accessibility, optics manifests, story, and simulator.

#### Team W — Tempest

- Own charge state, discharge paths, weather manifests, loudness safety, story, and simulator.

#### Team K — Canticle

- Own sequence model, silent equivalence, waveform manifests, audio system integration, story, and simulator.

Shared agents must not edit pack content. Pack agents must not edit shared hooks directly; they propose contract changes through an integration review.

### Stage F5 — The Garden and endless Atlas

#### Lane G — Garden narrative/gameplay

- Seven-Beacon synthesis space.
- Doctrine reconciliation.
- Credits/closure scene.
- Transition to Atlas.

#### Lane A5 — Atlas engine

- Compatible law tags.
- Seeded route generation.
- Permanent Convergence archive.
- Route validation and deterministic replay.

#### Lane L5 — Chronicle and loadouts

- Timeline, records, Beacon naming, build codes, personal bests.

#### Lane B5 — Endless balance

- Law interaction matrix.
- Soft caps.
- Multi-year numeric simulation.
- Dominant-strategy detection.

### Stage F6 — Release hardening

- real-device performance matrix;
- complete save-fixture migration suite;
- keyboard, screen reader, reduced motion, high contrast, and color-vision passes;
- translation-ready string extraction;
- content proofreading;
- audio fatigue sessions;
- five-hour, fifty-hour, and returning-player playtests;
- deployed offline/static-build test;
- crash/recovery drills;
- final object-purpose audit.

---

## 13. Suggested agent tickets

Each ticket is intentionally bounded so an agent can finish without inventing shared architecture.

| Ticket | Deliverable | Depends on | May run with |
|---|---|---|---|
| VIS-001 | Object manifest schema + validator | F0.2 | NUM-001, A11Y-001 |
| UX-001 | Goal Lens pure recommendation engine | F0.1 | VIS-001, AUDIO-001 |
| UX-002 | Reset comparison calculator/card | F0.1 | UX-001 |
| FEEL-001 | Semantic feedback event registry | F0.2 | VIS-001 |
| FEEL-002 | Purchase ceremony orchestrator | FEEL-001 | AUDIO-001 |
| AUDIO-001 | Cue grammar and loudness budget | F0.2 | VIS-001, UX-001 |
| A11Y-001 | Focus/announcement contract | F0.2 | NUM-001 |
| A11Y-002 | Averaged rhythm accessibility mode | A11Y-001 | AUDIO-001 |
| NUM-001 | Big-number spike and migration proposal | F0.3 | VIS-001 |
| SIM-001 | Multi-profile universe simulator contract | F0.2 | NUM-001 |
| EMB-001 | Emberlight Kindling manifests | VIS-001 | TIDE-001 |
| EMB-002 | Astral Cabinet object manifests | VIS-001 | EMB-001 |
| EMB-003 | Emberlight Omens and feedback | FEEL-001 | EMB-001 |
| TIDE-001 | Tidefall Kindling manifests | VIS-001 | EMB-001 |
| TIDE-002 | Pelagic Archive object manifests | VIS-001 | TIDE-001 |
| TIDE-003 | Tide state and Leviathan Omen | FEEL-001 | TIDE-001 |
| VERD-001 | Cohort/aging pure engine | F0.2, NUM-001 | CLOCK-001 |
| VERD-002 | Verdance content pack | VERD-001 | CLOCK-002 |
| CLOCK-001 | Routing graph pure engine | F0.2 | VERD-001 |
| CLOCK-002 | Clockwork content pack | CLOCK-001 | VERD-002 |
| PRISM-001 | Spectrum recipe pure engine | F3 gate | STORM-001, SONG-001 |
| STORM-001 | Charge/discharge pure engine | F3 gate | PRISM-001, SONG-001 |
| SONG-001 | Sequence pure engine + silent mode | F3 gate | PRISM-001, STORM-001 |
| ATLAS-001 | Law compatibility schema | seven pack schemas | GARDEN-001 |
| GARDEN-001 | Garden scene design and state graph | seven Beacon stories | ATLAS-001 |

For every ticket, require:

- owned files;
- prohibited files;
- input/output contracts;
- test command;
- acceptance criteria;
- migration impact;
- screenshots or audio evidence when visual/audio;
- handoff notes for the integrator.

---

## 14. Acceptance checklists

### 14.1 New-player gate

- The Heart receives an input within five seconds without instruction text.
- Counter and first Kindling arrive before clicking becomes tiring.
- The player understands passive rate by observing the world.
- No more than one new currency appears in ten minutes.
- First Omen is understandable and harmless to miss.
- Options, saves, accessibility, and guide are always reachable.
- The first reset preview is correctly understood by five out of five test players.

### 14.2 Five-hour gate

- No unexplained wall over ten minutes.
- At least three genuinely different decisions, not only “buy cheapest.”
- Screen composition remains legible after many objects.
- Player can name the next session goal and one long-term mystery.
- Clicking remains satisfying but is no longer mandatory.
- At least one build choice changes strategy and presentation.
- No audio layer becomes fatiguing over a continuous hour.

### 14.3 Endgame gate

- Old layers are automated or compressed.
- At least three viable build loadouts exist per universe.
- Every currency has a recurring sink.
- Every universe can be identified from silhouette alone.
- Cross-world projects create useful relationships without mandatory grinding.
- Atlas routes create new decisions rather than only larger enemy numbers/costs.
- A player who completes the Garden receives emotional closure.

### 14.4 Object-purpose gate

For every rendered object:

- name matches shop, archive, guide, and world;
- silhouette communicates phenomenon;
- position has a world reason;
- motion follows a physical/imagined law;
- ownership thresholds visibly evolve it;
- mechanic and lore agree;
- it cannot obstruct the Heart;
- reduced-motion and low-quality states exist;
- color is not the sole information channel.

### 14.5 Ethical-retention gate

- No reward is lost because the player skipped a day.
- No permanent power is exclusive to a timed event.
- Random odds are disclosed after discovery.
- No paid random reward exists.
- No notification uses guilt or false urgency.
- Every destructive action has a plain-language confirmation.
- Respec is free or trivial.
- Offline progression is a gift, not compensation for a penalty.
- The game recommends stopping points as clearly as it recommends goals.

---

## 15. Prioritized build order

### P0 — Bind and clarify what already exists

1. Freeze canonical system vocabulary.
2. Add Goal Lens and reset comparison.
3. Implement semantic object manifests and screen zones.
4. Replace repeated dots/primitives with Emberlight/Tidefall ownership states.
5. Add proportional purchase ceremonies and source breakdowns.
6. Finish keyboard/accessibility equivalence and rhythm averaging.
7. Introduce big-number migration before multi-year content.

### P1 — Make the two current worlds undeniable

1. Complete Emberlight visual/audio/object bible.
2. Complete Tidefall ecosystem and Leviathan Omen.
3. Give local Deep/trial presentation distinct world meaning.
4. Implement local Epoch naming/presentation while preserving canonical clarity.
5. Run five-hour first-world and Tidefall crossing tests.

### P2 — Prove expansion architecture

1. Verdance vertical slice.
2. Clockwork vertical slice.
3. Cross-world projects v1.
4. Loadouts and formula inspector.
5. First Atlas prototype with two compatible laws.

### P3 — Complete seven-world saga

1. Prismata.
2. Tempest.
3. Canticle.
4. Chronicle.
5. Seven-Beacon Garden.

### P4 — Build the years-long runway

1. Atlas law library.
2. Permanent Convergences.
3. Mastery trials.
4. Shareable loadouts/seeds.
5. Ongoing archive, Echo, and cosmetic additions.

---

## 16. Features not to build

- Random decorative shapes with no manifest or world purpose.
- A new panel for every idea.
- A separate currency for every side activity.
- Generic falling-star reskins across worlds.
- Prestige layers that only multiply output and repeat the same run.
- Daily chores, expiring missions, or login streaks.
- Competitive ladders with permanent exclusive power.
- Mandatory rapid clicking.
- Minigames disconnected from economy, story, or universe law.
- Hundreds of upgrade rows that change no behavior.
- Procedurally generated prose/effects without authored compatibility and balance.
- An infinite endgame made only of larger exponents.
- A Garden that is simply Universe Eight with green colors.

---

## 17. Research and reference links

Primary/official feature references:

- [Cookie Clicker — official Steam page](https://store.steampowered.com/app/1454400/Cookie_Clicker/)
- [Cookie Clicker — official web game](https://www.cookieclicker.com/)
- [Antimatter Dimensions — official Steam page](https://store.steampowered.com/app/1399720/Antimatter_Dimensions/)
- [Realm Grinder — official Steam page](https://store.steampowered.com/app/610080/Realm_Grinder/)
- [Melvor Idle — official Steam page](https://store.steampowered.com/app/1267910/Melvor_Idle/)
- [Idle Slayer — official Steam page](https://store.steampowered.com/app/1353300/Idle_Slayer/)
- [Tap Titans 2 — official Google Play listing](https://play.google.com/store/apps/details?id=com.gamehivecorp.taptitans2)
- [Egg, Inc. — official features](https://eggincgame.com/features.html)
- [Cell to Singularity — official FAQ](https://celltosingularity.com/faq/)
- [A Dark Room — official iOS listing](https://apps.apple.com/us/app/a-dark-room/id736683061)
- [Exponential Idle — official Google Play listing](https://play.google.com/store/apps/details?id=com.conicgames.exponentialidle)
- [Kittens Game — official game](https://kittensgame.com/web/)

Research references:

- [A Motivational Model of Video Game Engagement](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf)
- [Designing Game Feel: A Survey](https://arxiv.org/abs/2011.09201)
- [How Does Juicy Game Feedback Motivate?](https://people.csail.mit.edu/dkao/pdf/3613904.3642656.pdf)
- [Dark Patterns in the Design of Games](https://research.chalmers.se/en/publication/177148)
- [Level Up or Game Over: Exploring How Dark Patterns Shape Mobile Games](https://arxiv.org/abs/2412.05039)

---

## 18. Final design test

Before approving any future feature, ask:

1. Which player motivation does it serve?
2. Which existing systems does it feed and receive from?
3. What changes on the living screen?
4. What is its world-specific material and behavior?
5. How is it explained through story?
6. When does it become automated or compressed?
7. What does it look and sound like in reduced-motion, high-contrast, muted, and low-quality modes?
8. Does it create a real decision or only another multiplier?
9. Can the player safely ignore it for a day?
10. Will it still be understandable two years and five prestige layers later?

If fewer than eight answers are strong, redesign the feature before assigning it to an implementation agent.
