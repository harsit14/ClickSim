import type { GameState } from '../engine/game.svelte'
import { amountFromNumber, gteAmount } from '../core/numeric/amount'

/** Echoes — recovered fragments of the universe that came before.
 *  Collected automatically; read in the Codex. The record grows darker. */
export interface EchoDef {
  id: string
  title: string
  /** where/how Lumen recovered it — shown under the title */
  provenance: string
  text: string
  when: (g: GameState) => boolean
}

export const ECHOES: EchoDef[] = [
  {
    id: 'first-fire',
    title: 'The First Fire',
    provenance: 'recovered from ash, meaning uncertain',
    text:
      'They found it in a storm, or it found them. For a hundred generations they fed it and told it their names. The record does not say when they stopped being afraid of the dark. It says only: after the fire, the nights were for stories.',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e4)),
  },
  {
    id: 'census',
    title: 'Census',
    provenance: 'an administrative tablet, immaculately preserved',
    text:
      'Registered this cycle: 4 billion hearths, 90 million forges, 6,000 beacon-temples. Note by the counting-clerk, in a different hand: "counted lights all day. dreamed of them all night. there are worse jobs."',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e7)),
  },
  {
    id: 'lighthouse',
    title: 'The Lighthouse Keepers',
    provenance: 'a beacon log, final volume',
    text:
      'Entry 11,301: no answer. Entry 11,302: no answer. Entry 11,303: weather fine. polished the lens. no answer. A keeper\'s vow, printed inside the cover: WE DO NOT CALL BECAUSE SOMEONE LISTENS. WE CALL SO THE DARK KNOWS WHERE WE ARE.',
    when: (g) => g.achievements.includes('first-beacon'),
  },
  {
    id: 'letters-home',
    title: 'Letters Home',
    provenance: 'found orbiting a cold cinder',
    text:
      '"Dear Ama — the new sun took today. It is small and the wrong shade of gold and I have never been so proud of anything. The engineers cried. I did not (this is a lie). Your daughter, still warm."',
    when: (g) => g.achievements.includes('first-sun'),
  },
  {
    id: 'long-bright',
    title: 'The Long Bright',
    provenance: 'a history, abridged by damage',
    text:
      'For an age the sky was so full that night was a rumor. Poets complained. Astronomers wept and bought curtains. It was, every record agrees, the best of all the ages — and no one alive remembered paying for it.',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e12)),
  },
  {
    id: 'wisp-song',
    title: 'What the Wisps Sang',
    provenance: 'transcription attempt, marked FAILED',
    text:
      'The melody cannot be written down. Every notation system collapses at the third bar. One transcriber managed a marginal note before giving up: "it is a lullaby. i am sure of it. what i cannot work out is — for whom?"',
    when: (g) => g.starsCaught >= 5,
  },
  {
    id: 'inventory',
    title: 'Inventory of Losses',
    provenance: 'Lumen’s own hand. It did not offer this one.',
    text:
      'Item: everything. Condition: dark. Cause: [the entry is scratched out, rewritten, scratched out again. beneath the last attempt, very small:] i was there. i counted what it left. it left one.',
    when: (g) => g.supernovae >= 1,
  },
  {
    id: 'second-census',
    title: 'The Second Census',
    provenance: 'not recovered. written yesterday.',
    text:
      'Registered this cycle: everything you have made, unmade, and made again. Note by the counting-clerk — the handwriting is Lumen’s: "it builds faster each time. it burns the work without flinching. i have seen exactly one other thing do that."',
    when: (g) => g.supernovae >= 2,
  },
  {
    id: 'margin-note',
    title: 'Margin Note, Unsigned',
    provenance: 'tucked inside the beacon log. the ink is fresh.',
    text:
      'you have noticed the stardust fits your hands. you have noticed the dark does not fight back. you have not yet asked the only question that matters: what was the last thing the old universe saw? — when you are ready, ask me.',
    when: (g) => gteAmount(g.stardustTotal, amountFromNumber(10)),
  },
  {
    id: 'shape-in-dark',
    title: 'The Shape in the Dark',
    provenance: 'eyewitness account. the only one.',
    text:
      'It did not roar. That is the detail every telling gets wrong. It arrived like evening does — gradually, then all at once, and the stars went out politely, as if asked. The witness swears it paused at the last ember. The witness swears it looked... relieved.',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e15)),
  },
]
