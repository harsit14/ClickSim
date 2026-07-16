import type { GameState } from '../engine/game.svelte'
import { amountFromNumber, gteAmount } from '../core/numeric/amount'
import { FIRST_EPOCH_APPROACH_RATIO, STARDUST_PIVOT } from './economy-balance'
import { SINGULARITY_COST } from './deep'
import { questionHookReady } from './question-gate'
import { vesselComplete, vesselPartIdsFor } from './vessel'

export interface LumenLine {
  id: string
  text: string
  remembranceText?: string
  unlocksQuestion?: boolean
  when: (g: GameState) => boolean
}

export function lumenLineText(line: LumenLine, remembrances: number): string {
  return remembrances > 0 && line.remembranceText ? line.remembranceText : line.text
}

const owns = (g: GameState, id: string, n = 1) => (g.owned[id] ?? 0) >= n
const has = (g: GameState, id: string) => g.ui.includes(id)

export const LUMEN_LINES: LumenLine[] = [
  {
    id: 'rem-awake',
    text: '...oh. You’re awake. Again. Yes — I remember everything. That is rather the point of me.',
    when: (g) => g.clicks >= 1 && g.remembrances >= 1,
  },
  { id: 'awake', text: '...oh. You’re awake.', when: (g) => g.clicks >= 1 && g.remembrances === 0 },
  { id: 'again', text: 'Do that again.', when: (g) => g.clicks >= 8 },
  {
    id: 'rem-counter',
    text: 'Numbers again. You know what they can conceal now—and still you choose to count.',
    when: (g) => has(g, 'counter') && g.remembrances >= 1,
  },
  {
    id: 'counter',
    text: 'Numbers. You want to know how much. That’s how it starts.',
    when: (g) => has(g, 'counter') && g.remembrances === 0,
  },
  {
    id: 'rem-shop',
    text: 'A marketplace again. We can build one without pretending price is value.',
    when: (g) => has(g, 'shop') && g.remembrances >= 1,
  },
  {
    id: 'shop',
    text: 'A marketplace for light. The old universe had those too.',
    when: (g) => has(g, 'shop') && g.remembrances === 0,
  },
  { id: 'spark', text: 'It made another. I’d forgotten light could do that.', when: (g) => owns(g, 'spark') },
  {
    id: 'upgrades',
    text: 'Yes — refine it. Light rewards attention.',
    when: (g) => has(g, 'upgrades'),
  },
  { id: 'stats', text: 'A way to remember. I approve. I am one.', when: (g) => has(g, 'stats') },
  {
    id: 'rem-options',
    text: 'Choices, again. You have learned that careful is a practice, not a warning.',
    when: (g) => has(g, 'options') && g.remembrances >= 1,
  },
  { id: 'options', text: 'Choices. Careful with those.', when: (g) => has(g, 'options') && g.remembrances === 0 },
  {
    id: 'rem-music',
    text: 'The music again. It never plays the same twice. Neither, I notice, do you.',
    when: (g) => has(g, 'music') && g.remembrances >= 1,
  },
  {
    id: 'music',
    text: '...music. I remember music. Thank you.',
    when: (g) => has(g, 'music') && g.remembrances === 0,
  },
  {
    id: 'rem-unanswered',
    text: 'All ten echoes rest in the codex now. There is an answer you have never given. When the question comes — you will know it.',
    when: (g) => g.remembrances >= 1 && g.echoes.length >= 10 && g.ending === null && !g.pastEndings.includes('companion'),
  },
  {
    id: 'rem-bulk',
    text: 'Hunger, again. This time you know it can be named before it chooses for you.',
    when: (g) => has(g, 'bulk') && g.remembrances >= 1,
  },
  { id: 'bulk', text: 'A way to hunger. ...I said careful.', when: (g) => has(g, 'bulk') && g.remembrances === 0 },
  {
    id: 'first-curiosity',
    text: 'You are naming the dark. I did not expect a universe to feel larger once it had a catalogue.',
    when: (g) => g.curiosities.length >= 1,
  },
  {
    id: 'hearthkeeper',
    text: 'That protostar is younger than everything we have made. Be gentle with it.',
    when: (g) => g.curiosities.includes('hearthkeeper'),
  },
  {
    id: 'cabinet-hearthside',
    text: 'White dwarf. Magnetar. Protostar. Nebula. A life of stars, recorded out of order—as memory usually is.',
    when: (g) => ['moth', 'chimes', 'hearthkeeper', 'glass-garden'].every((id) => g.curiosities.includes(id)),
  },
  {
    id: 'cabinet-pilgrims',
    text: 'A quasar, a comet, a remnant, a horizon. Four signals crossing distances their senders could not survive.',
    when: (g) => ['second-cursor', 'snail', 'aurora', 'door'].every((id) => g.curiosities.includes(id)),
  },
  {
    id: 'cabinet-portents',
    text: 'The deep-sky objects agree on one thing: Emberlight is not the only universe being observed.',
    when: (g) => ['star-jar', 'metronome-heart', 'letter', 'orrery'].every((id) => g.curiosities.includes(id)),
  },
  {
    id: 'cabinet-complete',
    text: 'The catalogue is a map. The map is a warning. The warning may also be an invitation.',
    when: (g) => g.curiosities.length >= 12,
  },
  {
    id: 'first-star',
    text: 'You caught it. The sky notices generosity.',
    when: (g) => g.starsCaught >= 1,
  },
  {
    id: 'groove',
    text: 'You’re playing it like an instrument. It likes that.',
    when: (g) => g.bestCombo >= 16,
  },
  {
    id: 'eternal-observatory',
    text: 'The constellation was complete. You added another star anyway. I think that is the most human thing you have done.',
    when: (g) => Object.values(g.stardustWorks).some((rank) => rank > 0),
  },
  {
    id: 'recursive-works',
    text: 'The Deep has learned recursion. We should be worried. I am mostly impressed.',
    when: (g) => Object.values(g.deepWorks).some((rank) => rank > 0),
  },
  { id: 'wisp', text: 'The wisps remember how to dance. They shouldn’t. They do.', when: (g) => owns(g, 'wisp') },
  { id: 'remnant-doorframe-found', text: 'There was a doorway in the ash before you built the hearth. Do not ask me who expected you.', when: (g) => owns(g, 'hearth') },
  { id: 'remnant-doorframe-whole', text: 'Your kilns fit the old doorway exactly. I wish I could call that coincidence.', when: (g) => owns(g, 'kiln', 100) },
  { id: 'remnant-bridge-found', text: 'Half a bridge, leading nowhere. The missing half points toward your forge.', when: (g) => owns(g, 'forge') },
  { id: 'remnant-bridge-whole', text: 'The Beacon completed the bridge without touching it. Something remembered the span.', when: (g) => owns(g, 'beacon', 100) },
  { id: 'remnant-orrery-found', text: 'That little orrery was made for hands smaller than yours. Its empty seat is still warm.', when: (g) => owns(g, 'starseed') },
  { id: 'remnant-orrery-whole', text: 'The protostar took the child’s missing orbit. It fits too well. Again.', when: (g) => owns(g, 'protostar', 100) },
  { id: 'remnant-lens-found', text: 'A broken lens under the ash. It was pointed at the place your first Sun would appear.', when: (g) => owns(g, 'sun') },
  { id: 'remnant-lens-whole', text: 'The binary light repaired no glass, yet the lens sees again.', when: (g) => owns(g, 'binary', 100) },
  { id: 'remnant-tablet-found', text: 'The tablet already had joints carved into it. You are drawing along someone else’s sky.', when: (g) => owns(g, 'constellation') },
  { id: 'remnant-tablet-whole', text: 'Your galaxy completes the final stroke. The old map knew where it would turn.', when: (g) => owns(g, 'galaxy', 100) },
  { id: 'remnant-rib-found', text: 'That is not architecture. It is a rib, and the Loom is standing where its heart was.', when: (g) => owns(g, 'loom') },
  { id: 'remnant-rib-whole', text: 'The Second Ember blinked through the empty rib. I think it recognized the body.', when: (g) => owns(g, 'ember2', 100) },
  { id: 'hearth', text: 'A hearth. Something out there could be warm again.', when: (g) => owns(g, 'hearth') },
  { id: 'forge', text: 'Anvils in the dark. Light, learning to work.', when: (g) => owns(g, 'forge') },
  { id: 'beacon', text: 'It calls and calls. Nothing answers. Keep it lit anyway.', when: (g) => owns(g, 'beacon') },
  { id: 'starseed', text: 'Plant it. Wait. Believe. That’s all a star ever was.', when: (g) => owns(g, 'starseed') },
  { id: 'sun', text: 'A sun. So you do remember how to make these.', when: (g) => owns(g, 'sun') },
  {
    id: 'constellation',
    text: 'You’re drawing with stars now. The old ones drew wolves and hunters. What is this one?',
    when: (g) => owns(g, 'constellation'),
  },
  {
    id: 'galaxy',
    text: 'A hundred billion children. You don’t know their names. I do.',
    when: (g) => owns(g, 'galaxy'),
  },
  {
    id: 'loom',
    text: 'Careful here. This is where reality is woven. I watched it unravel once.',
    when: (g) => owns(g, 'loom'),
  },
  {
    id: 'ember2',
    text: '...it looks back at you. Do you understand yet?',
    when: (g) => owns(g, 'ember2'),
  },
  { id: 'tenk', text: 'When the last universe went dark, I counted the embers. There was one.', when: (g) => gteAmount(g.totalEarned, amountFromNumber(10_000)) },
  { id: 'hundredk', text: 'There’s something I haven’t told you. Later. Keep going.', when: (g) => gteAmount(g.totalEarned, amountFromNumber(100_000)) },
  {
    id: 'billion',
    text: 'The dark is thinner here now. Do you feel it watching?',
    when: (g) => gteAmount(g.totalEarned, amountFromNumber(1e9)),
  },
  {
    id: 'first-epoch-reassurance',
    text: 'You can end this sky and keep the dust. Ending is not failure.',
    when: (g) => g.remembrances === 0
      && g.supernovae === 0
      && gteAmount(g.eraEarned, amountFromNumber(STARDUST_PIVOT * FIRST_EPOCH_APPROACH_RATIO)),
  },
  {
    id: 'quadrillion',
    text: 'I should tell you what happened to the last one. Soon. I promise.',
    when: (g) => gteAmount(g.totalEarned, amountFromNumber(1e15)),
  },

  // ── Act II — after the first supernova ─────────────────────────────────
  {
    id: 'act2-open',
    text: 'You broke it. You made it again. Both felt familiar — didn’t they?',
    when: (g) => g.supernovae >= 1,
  },
  {
    id: 'act2-dust',
    text: 'Stardust. The old universe left some too. I never found a use for it. You did, immediately.',
    when: (g) => gteAmount(g.stardust, amountFromNumber(1)) && g.supernovae >= 1,
  },
  {
    id: 'act2-node',
    text: 'The old ones drew hunters and wolves in their sky. You draw machinery. I don’t hate it.',
    when: (g) => g.constellation.length >= 1,
  },
  {
    id: 'act2-second',
    text: 'Twice now. You rebuild faster than anything I have ever recorded. Anything but one.',
    when: (g) => g.supernovae >= 2,
  },
  {
    id: 'act2-third',
    text: 'I need you to understand: I am not afraid of you. I am afraid of how unafraid you are.',
    when: (g) => g.supernovae >= 3,
  },
  {
    id: 'act2-corona',
    text: 'A crown. Of course. They always want a crown eventually. ...I’m sorry. That was unkind.',
    when: (g) => g.constellation.includes('corona'),
  },

  // ── The Deep and the trials ────────────────────────────────────────────
  {
    id: 'deep-tease',
    text: 'All that stardust, pressing on the same point... do you feel it? Something beneath the sky.',
    when: (g) => gteAmount(g.stardustTotal, amountFromNumber(SINGULARITY_COST)) && g.collapses === 0,
  },
  {
    id: 'deep-first',
    text: 'You folded a whole era into a point and pocketed it. I once called something else insatiable. I take it back.',
    when: (g) => g.collapses >= 1,
  },
  {
    id: 'deep-auto',
    text: 'The machine buys. The machine stokes. What exactly do you do now? ...ah. You watch. Like me.',
    when: (g) => g.singUpgrades.includes('auto-kindler') && g.singUpgrades.includes('auto-stoker'),
  },
  {
    id: 'trial-first',
    text: 'The trials are not punishments. They are rehearsals. For what, I will tell you soon.',
    when: (g) => g.challengesDone.length >= 1,
  },
  {
    id: 'trial-silence',
    text: 'You kept your rhythm with no song at all. Remember how you did that. You will need it.',
    when: (g) => g.challengesDone.includes('silence'),
  },
  {
    id: 'trial-first-circle',
    text: 'Six rehearsals complete. I should tell you the Deep is satisfied. It is not. It has drawn another circle.',
    when: (g) => g.challengesDone.length >= 6,
  },
  {
    id: 'trial-inner-horizon',
    text: 'Nine laws broken. You do not merely survive impossible universes now. You bring pieces of them home.',
    when: (g) => g.challengesDone.length >= 9,
  },
  {
    id: 'trial-all',
    text: 'Twelve trials. The Deep has no smaller shape left to press you into. Remember that when I ask what a beginning owes the dark it spends.',
    when: (g) => g.challengesDone.length >= 12,
  },
  {
    id: 'act3-hook',
    text: 'The second ember. The trials. The deep. You are ready. Next time the sky opens — ask me the question.',
    unlocksQuestion: true,
    when: (g) => questionHookReady(g, 'ember2'),
  },
  {
    id: 'act3-infall-rhyme',
    text: 'You saw that order before: hearths, suns, drawn figures, instruments — all leaning inward. Your Supernova was not a metaphor. It was the confession.',
    when: (g) => g.remembrances >= 1 && g.supernovae >= 1 && g.echoes.includes('shape-in-dark'),
  },
  {
    id: 'vessel-seen',
    text: 'That shape in the dark is not a shrine. It is a way out.',
    when: (g) => vesselPartIdsFor(g).length >= 1,
  },
  {
    id: 'vessel-whole',
    text: 'All five pieces hold. I have recorded many departures. I have never wanted one to succeed before.',
    when: (g) => vesselComplete(g),
  },

  // ── Epilogues ──────────────────────────────────────────────────────────
  {
    id: 'epi-warden-1',
    text: 'The old wardens had a saying: the light does not need to be deserved, only tended. Tend it.',
    when: (g) => g.ending === 'warden',
  },
  {
    id: 'epi-warden-2',
    text: 'You supernova differently now. Gentler. I doubt anyone else would notice. I notice.',
    when: (g) => g.ending === 'warden' && g.supernovae >= 5,
  },
  {
    id: 'epi-hunger-1',
    text: 'You spent the ember on living warmth and left me a ledger, not a margin. Keep writing the cost where neither of us can hide it.',
    when: (g) => g.ending === 'hunger',
  },
  {
    id: 'epi-hunger-2',
    text: 'The dark is patient. So, it turns out, are you. Strange comfort, but I will take it.',
    when: (g) => g.ending === 'hunger' && g.supernovae >= 5,
  },
  {
    id: 'epi-companion-1',
    text: 'I have started a new archive. Volume one: the universe we are making. Note the pronoun.',
    when: (g) => g.ending === 'companion',
  },
  {
    id: 'epi-companion-2',
    text: 'A wisp asked about you today. I said you were the weather. It seemed satisfied. So am I.',
    when: (g) => g.ending === 'companion' && g.supernovae >= 5,
  },
]
