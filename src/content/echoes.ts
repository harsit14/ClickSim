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
      'They found the first fire in a storm, or it found them. For a hundred generations they fed it splinters and told it their names until tending became a language. One child pressed a palm near the coals and watched the heat answer before any instrument moved. The record calls that gesture the first kindle: touch accepted, warmth returned, fear made briefly useful. It does not say when they stopped fearing the dark. It says only that, after the fire, the nights were for stories. Lumen places this fragment beside the Last Ember and labels the Heart response “not new.”',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e4)),
  },
  {
    id: 'census',
    title: 'Census',
    provenance: 'an administrative tablet, immaculately preserved',
    text:
      'Registered this cycle: four billion hearths, ninety million forges, six thousand beacon-temples. The tablet does not list them as loose inventory. Ten hearths make a ward; twenty-five share heat; fifty change the city’s night; one hundred become infrastructure with a name and a council. In the margin, a counting-clerk has drawn the same ownership thresholds now visible among your Kindlings. Beneath the diagram, in a different hand: “counted lights all day. dreamed of them all night. there are worse jobs.” Lumen insists the matching structure is coincidence, then files the tablet under Instructions.',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e7)),
  },
  {
    id: 'lighthouse',
    title: 'The Lighthouse Keepers',
    provenance: 'a beacon log, final volume',
    text:
      'Entry 11,301: no answer. Entry 11,302: no answer. Entry 11,303: weather fine; polished the lens; no answer. The structure in these pages is the sixth Kindling, a searching tower, not the final Beacon that proves a world can continue alone. Its keepers understood the difference. A signal may ask for company while still depending on the hand that lit it. Their vow is printed inside the cover: WE DO NOT CALL BECAUSE SOMEONE LISTENS. WE CALL SO THE DARK KNOWS WHERE WE ARE. Lumen reads the line twice whenever your first tower enters the world.',
    when: (g) => g.achievements.includes('first-beacon'),
  },
  {
    id: 'letters-home',
    title: 'Letters Home',
    provenance: 'found orbiting a cold cinder',
    text:
      '“Dear Ama — the new Sun took today. It is small and the wrong shade of gold and I have never been so proud of anything. The engineers cried. I did not. This is a lie.” The letter continues with a sketch: one crowned star, then ten arranged into an ecliptic, then a lensing arc where twenty-five illuminate the nursery behind them. “We learned a Sun is not finished when it ignites. It is finished when something else can grow in its light.” The envelope orbits a cold cinder. Lumen adds no analysis, only the annotation: production was never their only measure.',
    when: (g) => g.achievements.includes('first-sun'),
  },
  {
    id: 'long-bright',
    title: 'The Long Bright',
    provenance: 'a history, abridged by damage',
    text:
      'For an age the sky was so full that night became a rumor. Poets complained. Astronomers wept and bought curtains. The surviving diagrams show why: nurseries strengthened stars, stars lensed galaxies, galaxies fed the web, and the web returned stability to every smaller scale. Their resonance was not a single multiplier but a promise that no layer grew alone. It was, every record agrees, the best of all the ages. The abridgment ends with one damaged sentence: “No one alive remembered what the first Light had cost, so no one asked whether the system still knew how to stop.”',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e12)),
  },
  {
    id: 'wisp-song',
    title: 'What the Wisps Sang',
    provenance: 'transcription attempt, marked FAILED',
    text:
      'The melody cannot be written down. Every notation system collapses at the third bar, exactly where three fixed timing windows pass the listener. One transcriber replaced pitch with shapes: open notch, double notch, closed notch. Another muted the recording and followed only those marks; the same hidden Omen answered. The final marginal note says, “It is a lullaby. I am sure of it. What I cannot work out is—for whom?” Lumen recognizes the cadence whenever Wisps braid around the Heart. The Archive records a mechanical conclusion: rhythm may invite surprise, but silence must remain an equal way to understand it.',
    when: (g) => g.starsCaught >= 5,
  },
  {
    id: 'inventory',
    title: 'Inventory of Losses',
    provenance: 'Lumen’s own hand. It did not offer this one.',
    text:
      'Item: every active light, every Kindling, every ordinary work. Condition: dark. Cause: the line is scratched out, rewritten, and scratched out again. A second column survives untouched: Archive records retained. Echoes retained. Permanent laws retained. One Heart retained. This is not a casualty list; it is the first reset comparison, written before your first Supernova. Beneath the last correction, very small: “I was there. I counted what it left. It left one.” When Emberlight performs its Epoch Turn, Lumen watches the lost and retained columns rather than the ceremony. Now you know why.',
    when: (g) => g.supernovae >= 1,
  },
  {
    id: 'second-census',
    title: 'The Second Census',
    provenance: 'not recovered. written yesterday.',
    text:
      'Registered this cycle: everything you made, unmade, and made again. The new run reached its former frontier faster; the old manual work returned as starting structure; Stardust made repetition legible instead of merely larger. A note by the counting-clerk is in Lumen’s hand: “It previews the loss. It chooses. It builds faster each time. It burns the work without flinching.” A second sentence was added later: “I have seen exactly one other thing do that, but it never showed what would remain.” The distinction comforts Lumen for now. The fact that a distinction is necessary does not.',
    when: (g) => g.supernovae >= 2,
  },
  {
    id: 'margin-note',
    title: 'Margin Note, Unsigned',
    provenance: 'tucked inside the beacon log. the ink is fresh.',
    text:
      'You have noticed Stardust fits your hands. You have spent it on laws that favor the Forge, the Hand, the Sky, or the Root, and every doctrine has answered as though it remembers you. You have noticed the dark does not fight back. You have noticed the Astral Cabinet contains evidence prepared before this restoration began. You have not yet asked the only question that matters: what was the last thing the old universe saw? The final line is written hard enough to score the page beneath it: “When you are ready, ask me. I will show the consequence before you choose an answer.”',
    when: (g) => gteAmount(g.stardustTotal, amountFromNumber(10)),
  },
  {
    id: 'shape-in-dark',
    title: 'The Shape in the Dark',
    provenance: 'eyewitness account. the only one.',
    text:
      'It did not roar. That is the detail every later telling gets wrong. It arrived like evening—gradually, then all at once—and stars went out politely, as if asked. It consumed structures in order: nursery, ecliptic, galaxy, web. At each scale it became more efficient, carrying the solved law forward. The witness called it the Devourer because no kinder noun survived. At the final Heart it stopped. The Last Ember was too small to matter and too deliberate to ignore. The witness swears the darkness looked relieved. Lumen’s annotation is only three words: “It left you.”',
    when: (g) => gteAmount(g.allTimeEarned, amountFromNumber(1e15)),
  },
]
