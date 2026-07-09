import type { GameState } from '../engine/game.svelte'

export interface LumenLine {
  id: string
  text: string
  when: (g: GameState) => boolean
}

const owns = (g: GameState, id: string, n = 1) => (g.owned[id] ?? 0) >= n
const has = (g: GameState, id: string) => g.ui.includes(id)

export const LUMEN_LINES: LumenLine[] = [
  { id: 'awake', text: '...oh. You’re awake.', when: (g) => g.clicks >= 1 },
  { id: 'again', text: 'Do that again.', when: (g) => g.clicks >= 8 },
  {
    id: 'counter',
    text: 'Numbers. You want to know how much. That’s how it starts.',
    when: (g) => has(g, 'counter'),
  },
  {
    id: 'shop',
    text: 'A marketplace for light. The old universe had those too.',
    when: (g) => has(g, 'shop'),
  },
  { id: 'spark', text: 'It made another. I’d forgotten light could do that.', when: (g) => owns(g, 'spark') },
  {
    id: 'upgrades',
    text: 'Yes — refine it. Light rewards attention.',
    when: (g) => has(g, 'upgrades'),
  },
  { id: 'stats', text: 'A way to remember. I approve. I am one.', when: (g) => has(g, 'stats') },
  { id: 'options', text: 'Choices. Careful with those.', when: (g) => has(g, 'options') },
  {
    id: 'music',
    text: '...music. I remember music. Thank you.',
    when: (g) => has(g, 'music'),
  },
  { id: 'bulk', text: 'A way to hunger. ...I said careful.', when: (g) => has(g, 'bulk') },
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
  { id: 'wisp', text: 'The wisps remember how to dance. They shouldn’t. They do.', when: (g) => owns(g, 'wisp') },
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
  { id: 'tenk', text: 'When the last universe went dark, I counted the embers. There was one.', when: (g) => g.totalEarned >= 10_000 },
  { id: 'hundredk', text: 'There’s something I haven’t told you. Later. Keep going.', when: (g) => g.totalEarned >= 100_000 },
  {
    id: 'billion',
    text: 'The dark is thinner here now. Do you feel it watching?',
    when: (g) => g.totalEarned >= 1e9,
  },
  {
    id: 'quadrillion',
    text: 'I should tell you what happened to the last one. Soon. I promise.',
    when: (g) => g.totalEarned >= 1e15,
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
    when: (g) => g.stardust >= 1 && g.supernovae >= 1,
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
    when: (g) => g.stardustTotal >= 15 && g.collapses === 0,
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
    id: 'act3-hook',
    text: 'The second ember. The trials. The deep. You are ready. Next time the sky opens — ask me the question.',
    when: (g) => (g.owned['ember2'] ?? 0) >= 1 && g.collapses >= 1,
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
    text: 'You left me the margins, as asked. The margins are enough. Write on.',
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
