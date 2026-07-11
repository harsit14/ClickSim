# The Three Lokas Reframe

Status: implementation canon; Brahmalok and Vishnulok technical replacements complete, external cultural review remains a release gate

## Story contract

Clockwork is the final universe restored by Lumen's system. Its completed Great
Regulator discovers an **Unscheduled Interval**: time continues although every
forecast and mechanical cause has stopped. An original fictional presence, the
**Witness Outside the Calendar**, reveals that Clockwork's three projected
successors were incomplete shadows of three older cosmic acts.

Prismata, Tempest, and Canticle cease to be destinations in the final fiction.
Their best mechanics may survive as optional Clockwork Forecast Chambers. Their
save-stable slots remain `prismata`, `tempest`, and `canticle` until the three
replacement realms are complete.

The playable route becomes:

1. Emberlight — material ignition and physical creation.
2. Tidefall — memory surviving pressure and absence.
3. Verdance — life surviving through change.
4. Clockwork — causality, prediction, and consent; the last restored universe.
5. Brahmalok — intentional creation through knowledge, distinction, and form.
6. Vishnulok — preservation as responsive restoration of order.
7. Kailash — dissolution, renewal, refuge, and release.
8. The Question and Garden — choice after the completed cosmic cycle.

The last three are **lokas**, not objects selected or manufactured by Lumen.
The player approaches and learns to participate in their governing relations;
the player does not build, purchase, defeat, own, or upgrade a deity.

## Realm direction

### Brahmalok

- Public title: **Brahmalok**. Classical naming and transliteration receive a
  consultant pass before public copy is frozen.
- Sacred presences: Brahma and Saraswati, each treated with independent agency.
- Player verb: **unfold**.
- Central interface: **The Lotus of Becoming**, never Brahma himself.
- Mechanic: a four-direction creation mandala arranging Seed, Measure, Name,
  and Form. These are game-fiction labels, not claims of canonical doctrine.
- Visual grammar: lotus growth, four horizons, hamsa traces, water, measured
  geometry, illuminated knowledge, rose, maroon, ivory, and gold.
- Completion: the four horizons become one legible creation without erasing
  their directions.

### Vishnulok

- Public title: **Vishnulok**; **Vaikuntha** remains the primary traditional
  reference for research and consultant review.
- Sacred presences: Vishnu and Lakshmi. Ananta is a sacred cosmological
  presence, not a level prop or enemy.
- Player verb: **sustain**.
- Central interface: **The Endless Circuit**. Ananta remains a sacred presence,
  not the name or body of the player's instrument.
- Mechanic: production travels through declared paths that echo the surrounding
  coils without turning Ananta into machinery. A selected correction
  route restores imbalance and returns rather than maximizing destruction.
- Visual grammar: calm cosmic ocean, endless coils, conch pulse, chakra route,
  lotus, indigo, milk-white, restrained emerald, and gold.
- Completion: the correction circuit closes, the chakra returns, and the ocean
  becomes still without becoming lifeless.

### Kailash

- Public title: **Kailash**; Shiva may also be identified as Mahesh/Mahadeva in
  reviewed explanatory copy.
- Sacred presences: Shiva and Parvati, with Ganga and Nandi represented through
  their own meaning rather than decorative shorthand.
- Player verb: **release**.
- Central interface: **The Still Point**, never Shiva himself.
- Mechanic: a five-act cosmic rhythm—creation, protection, dissolution,
  concealment, and grace—built on an editable sequence with meaningful rests.
- Visual grammar: mountain stillness, moon, river thread, damaru rhythm, ash,
  snow, blue stone, copper fire, and the late emergence of the dance ring.
- Completion: a consent-gated dissolution removes the world beat by beat while
  retained progression remains protected. The Garden follows as renewal.

## Cultural guardrails

1. Hindu traditions are diverse. The game must never claim the Trimurti is the
   sole or universally dominant account of Hindu divinity.
2. Creation, preservation, and dissolution are organizing themes, not exclusive
   job descriptions. Copy must preserve overlap, renewal, refuge, and grace.
3. Deities, sacred texts, mantras, yantras, lingas, and sacred symbols are never
   currencies, loot, bosses, joke achievements, ordinary Kindlings, or Cabinet
   collectibles.
4. Do not use `Om` as ambient decoration or a generic magic glyph.
5. Do not invent Sanskrit names for currencies or mechanics without review.
   English working names remain placeholders until a language consultant signs
   off on meaning, register, and pronunciation.
6. Direct deity imagery requires iconographic review. Environment-first presence
   is preferred during implementation.
7. Saraswati, Lakshmi, and Parvati are not accessories or palette sources. If
   present, their agency must be explicit in story and visual purpose.
8. Avatars and divine weapons are not disposable power-ups. Vishnu's corrective
   action is represented as restoration of order, not combat spectacle.
9. Shiva's dissolution is never nihilism or gore. Stillness, renewal, protection,
   refuge, and liberation remain visible alongside fire.
10. At least one Hindu cultural consultant and one South Asian art/iconography
    reviewer must approve final names, deity depictions, major story scenes, and
    marketing captures.

## Technical compatibility contract

- Keep internal universe IDs `prismata`, `tempest`, and `canticle` during the
  replacement. They are save slots, not final public identities.
- Keep prefixes `u5`, `u6`, and `u7`, generator IDs, purchased content IDs,
  Chronicle keys, Beacon claims, and stored progression stable wherever possible.
- New public identity is resolved through `src/content/divine-realms.ts`.
- No live UI adopts a loka name until that realm's 18 Kindlings, 12 Archive
  records, mechanics, trials, story, audio, crossings, fallbacks, and art are all
  complete.
- Brahmalok and Vishnulok now satisfy that technical activation gate in the
  development build. Kailash remains dormant. External cultural-consultant and
  South Asian art/iconography review remain mandatory before a public release;
  technical activation is not a substitute for that human review.
- The Unscheduled Interval is a one-time revelation after Clockwork's Beacon,
  not a fifth recurring random or scheduled Maintenance Signal.

## Research baseline

Implementation should continue to use museum and scholarly sources, followed by
human cultural review. The current baseline includes the Smithsonian National
Museum of Asian Art's *Vishnu's Cosmic Ocean*, the Metropolitan Museum of Art's
Nataraja and Vishnu records, and British Museum iconographic records for Shiva,
Vishnu, and related attributes.
