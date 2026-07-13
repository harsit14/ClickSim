/** Adaptive layered soundtrack, fully synthesized with one authored profile per realm. */
import { getAudio } from './sfx'
import type { UniverseId } from '../content/universes/types'

const LOOKAHEAD_SEC = 0.35

export type MusicMode = UniverseId

// C — G/B — Am — F, voiced low and close
const CHORDS = [
  [261.63, 329.63, 392.0],
  [246.94, 293.66, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
]
const ROOTS = [130.81, 123.47, 110.0, 87.31]
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]

// Dm(add9) — Bbmaj7 — C(add9) — Am7, voiced like bells under water
const TIDE_CHORDS = [
  [146.83, 174.61, 220.0, 329.63],
  [116.54, 146.83, 174.61, 220.0],
  [130.81, 164.81, 196.0, 293.66],
  [110.0, 130.81, 164.81, 196.0],
]
const TIDE_ROOTS = [73.42, 58.27, 65.41, 55.0]
const TIDE_SCALE = [293.66, 329.63, 392.0, 440.0, 523.25, 587.33]

export interface RealmMusicProfile {
  readonly character: string
  readonly tempoBpm: number
  readonly chords: readonly (readonly number[])[]
  readonly roots: readonly number[]
  readonly scale: readonly number[]
  readonly padTypes: readonly OscillatorType[]
  readonly padDetunes: readonly number[]
  readonly padAttack: number
  readonly padPeak: number
  readonly padFilterHz: number
  readonly pulseBeats: readonly number[]
  readonly pulseType: OscillatorType
  readonly pulseStartHz: number
  readonly pulseEndHz: number
  readonly pulsePeak: number
  readonly pulseDecay: number
  readonly malletDensity: number
  readonly malletType: OscillatorType
  readonly malletMultiplier: number
  readonly bassBeats: readonly number[]
}

export const MUSIC_PROFILES: Readonly<Record<MusicMode, RealmMusicProfile>> = {
  emberlight: {
    character: 'warm heartbeat and close triangular firelight', tempoBpm: 72,
    chords: CHORDS, roots: ROOTS, scale: PENTA,
    padTypes: ['triangle', 'triangle'], padDetunes: [-6, 6], padAttack: 0.9, padPeak: 0.035, padFilterHz: 900,
    pulseBeats: [0, 1, 2, 3], pulseType: 'sine', pulseStartHz: 150, pulseEndHz: 55, pulsePeak: 0.14, pulseDecay: 0.16,
    malletDensity: 0.55, malletType: 'triangle', malletMultiplier: 2, bassBeats: [0, 2],
  },
  tidefall: {
    character: 'submerged minor-seventh pressure and surface droplets', tempoBpm: 60,
    chords: TIDE_CHORDS, roots: TIDE_ROOTS, scale: TIDE_SCALE,
    padTypes: ['sine', 'triangle'], padDetunes: [-9, 9], padAttack: 1.45, padPeak: 0.026, padFilterHz: 680,
    pulseBeats: [0, 2], pulseType: 'sine', pulseStartHz: 92, pulseEndHz: 38, pulsePeak: 0.13, pulseDecay: 0.78,
    malletDensity: 0.42, malletType: 'sine', malletMultiplier: 1.5, bassBeats: [0],
  },
  verdance: {
    character: 'slow germinating major sevenths and woody paired breaths', tempoBpm: 66,
    chords: [
      [261.63, 329.63, 392, 493.88], [293.66, 349.23, 440, 523.25],
      [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63],
    ],
    roots: [130.81, 146.83, 110, 87.31], scale: [261.63, 293.66, 329.63, 349.23, 392, 440],
    padTypes: ['sine', 'triangle'], padDetunes: [-4, 7], padAttack: 1.8, padPeak: 0.028, padFilterHz: 1_100,
    pulseBeats: [0, 3], pulseType: 'triangle', pulseStartHz: 104, pulseEndHz: 65, pulsePeak: 0.075, pulseDecay: 0.52,
    malletDensity: 0.34, malletType: 'triangle', malletMultiplier: 1.5, bassBeats: [0],
  },
  clockwork: {
    character: 'dry escapement fifths and counted metallic teeth', tempoBpm: 96,
    chords: [
      [146.83, 220, 293.66], [164.81, 246.94, 329.63],
      [130.81, 196, 261.63], [110, 164.81, 220],
    ],
    roots: [73.42, 82.41, 65.41, 55], scale: [293.66, 329.63, 369.99, 392, 440, 493.88],
    padTypes: ['square', 'triangle'], padDetunes: [0], padAttack: 0.045, padPeak: 0.018, padFilterHz: 560,
    pulseBeats: [0, 1, 2, 3], pulseType: 'square', pulseStartHz: 880, pulseEndHz: 440, pulsePeak: 0.042, pulseDecay: 0.055,
    malletDensity: 0.72, malletType: 'square', malletMultiplier: 2, bassBeats: [0, 2],
  },
  prismata: {
    character: 'open dawn intervals unfolding in four measured directions', tempoBpm: 78,
    chords: [
      [146.83, 184.99, 220, 277.18], [164.81, 207.65, 246.94, 329.63],
      [196, 246.94, 293.66, 369.99], [130.81, 164.81, 220, 293.66],
    ],
    roots: [73.42, 82.41, 98, 65.41], scale: [293.66, 329.63, 369.99, 440, 493.88, 554.37],
    padTypes: ['sine', 'sine'], padDetunes: [-8, 8], padAttack: 2.1, padPeak: 0.025, padFilterHz: 1_750,
    pulseBeats: [0, 2], pulseType: 'sine', pulseStartHz: 220, pulseEndHz: 146.83, pulsePeak: 0.05, pulseDecay: 0.64,
    malletDensity: 0.3, malletType: 'sine', malletMultiplier: 2, bassBeats: [0],
  },
  tempest: {
    character: 'returning suspended currents around a stable low refuge', tempoBpm: 68,
    chords: [
      [196, 233.08, 293.66, 392], [174.61, 220, 261.63, 349.23],
      [146.83, 196, 246.94, 329.63], [164.81, 220, 293.66, 369.99],
    ],
    roots: [98, 87.31, 73.42, 82.41], scale: [246.94, 293.66, 329.63, 369.99, 392, 440],
    padTypes: ['sine', 'triangle'], padDetunes: [-3, 11], padAttack: 1.65, padPeak: 0.024, padFilterHz: 760,
    pulseBeats: [0, 2.5], pulseType: 'sine', pulseStartHz: 118, pulseEndHz: 52, pulsePeak: 0.085, pulseDecay: 0.88,
    malletDensity: 0.26, malletType: 'sine', malletMultiplier: 1.25, bassBeats: [0, 3],
  },
  canticle: {
    character: 'austere open fifths, long air, and isolated summit tones', tempoBpm: 54,
    chords: [[146.83, 220], [130.81, 196], [110, 164.81], [98, 146.83]],
    roots: [73.42, 65.41, 55, 49], scale: [220, 293.66, 329.63, 392, 440, 587.33],
    padTypes: ['sine'], padDetunes: [-2, 2], padAttack: 2.6, padPeak: 0.02, padFilterHz: 820,
    pulseBeats: [0], pulseType: 'sine', pulseStartHz: 74, pulseEndHz: 49, pulsePeak: 0.04, pulseDecay: 1.15,
    malletDensity: 0.18, malletType: 'triangle', malletMultiplier: 1.5, bassBeats: [0],
  },
}

export function musicProfileFingerprint(mode: MusicMode): string {
  const profile = MUSIC_PROFILES[mode]
  return [
    profile.tempoBpm,
    profile.character,
    profile.chords.flat().join(','),
    profile.padTypes.join(','),
    profile.padAttack,
    profile.padFilterHz,
    profile.pulseBeats.join(','),
    profile.pulseType,
    profile.pulseStartHz,
    profile.malletDensity,
  ].join('|')
}

export interface StemFlags {
  mallets: boolean
  bass: boolean
  strings: boolean
  choir: boolean
}

let musicGain: GainNode | null = null
let playing = false
let startAt = 0
let nextBar = 0
let timer: ReturnType<typeof setInterval> | undefined
let volume = 0.6
let stems: StemFlags = { mallets: false, bass: false, strings: false, choir: false }
let musicMode: MusicMode = 'emberlight'
let stillness = false

function musicGainTarget(): number {
  return volume * (stillness ? 0.11 : 0.9)
}

export function beatDurationSec(): number {
  return 60 / MUSIC_PROFILES[musicMode].tempoBpm
}

export function currentMusicMode(): MusicMode {
  return musicMode
}

export function setMusicMode(mode: MusicMode) {
  if (mode === musicMode) return
  const resume = playing
  stopMusic()
  musicMode = mode
  if (resume) startMusic()
}

export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (musicGain) musicGain.gain.value = musicGainTarget()
}

export function musicStillnessActive(): boolean {
  return stillness
}

/** Fades the ordinary score down while Long Rest keeps only its sparse summit tone. */
export function setMusicStillness(active: boolean): void {
  if (stillness === active) return
  stillness = active
  if (!musicGain) return
  const a = getAudio()
  if (!a) return
  const now = a.ctx.currentTime
  const current = Math.max(0.0001, musicGain.gain.value)
  musicGain.gain.cancelScheduledValues(now)
  musicGain.gain.setValueAtTime(current, now)
  musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, musicGainTarget()), now + (active ? 1.8 : 2.4))
}

export function setStems(f: StemFlags) {
  stems = f
}

export function effectiveStemFlags(): StemFlags {
  return { ...stems }
}

export function isPlaying() {
  return playing
}

export function startMusic() {
  if (playing) return
  const a = getAudio()
  if (!a) return
  if (!musicGain) {
    musicGain = a.ctx.createGain()
    musicGain.connect(a.output)
  }
  musicGain.gain.value = musicGainTarget()
  startAt = a.ctx.currentTime + 0.2
  nextBar = 0
  playing = true
  timer = setInterval(schedule, 100)
}

export function stopMusic() {
  playing = false
  clearInterval(timer)
}

/** Signed seconds to the nearest beat, or null when silent. */
export function beatPhaseSec(): number | null {
  if (!playing) return null
  const a = getAudio()
  if (!a) return null
  const t = a.ctx.currentTime - startAt
  if (t < 0) return null
  const beatSec = beatDurationSec()
  const frac = t % beatSec
  return frac > beatSec / 2 ? frac - beatSec : frac
}

export function currentBeatIndex(): number | null {
  if (!playing) return null
  const a = getAudio()
  if (!a) return null
  const t = a.ctx.currentTime - startAt
  return t < 0 ? null : Math.floor(t / beatDurationSec())
}

function schedule() {
  const a = getAudio()
  if (!a || !playing) return
  const barSec = beatDurationSec() * 4
  while (startAt + nextBar * barSec < a.ctx.currentTime + LOOKAHEAD_SEC) {
    scheduleBar(a.ctx, nextBar)
    nextBar++
  }
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function tone(
  ctx: AudioContext,
  opts: {
    freq: number
    type: OscillatorType
    at: number
    attack: number
    peak: number
    decayTo: number
    detune?: number
    filterHz?: number
    vibratoHz?: number
    vibratoDepth?: number
  },
) {
  if (!musicGain) return
  const osc = ctx.createOscillator()
  osc.type = opts.type
  osc.frequency.value = opts.freq
  if (opts.detune) osc.detune.value = opts.detune

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, opts.at)
  gain.gain.exponentialRampToValueAtTime(Math.max(opts.peak, 0.0002), opts.at + opts.attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.decayTo)

  let head: AudioNode = osc
  if (opts.filterHz) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = opts.filterHz
    head.connect(filter)
    head = filter
  }
  if (opts.vibratoHz) {
    const lfo = ctx.createOscillator()
    lfo.frequency.value = opts.vibratoHz
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = opts.vibratoDepth ?? 3
    lfo.connect(lfoGain).connect(osc.frequency)
    lfo.start(opts.at)
    lfo.stop(opts.at + opts.decayTo + 0.1)
  }
  head.connect(gain).connect(musicGain)
  osc.start(opts.at)
  osc.stop(opts.at + opts.decayTo + 0.1)
}

function scheduleBar(ctx: AudioContext, bar: number) {
  if (musicMode === 'canticle' && stillness) {
    scheduleKailashStillnessBar(ctx, bar)
    return
  }
  if (musicMode === 'tidefall') {
    scheduleTidefallBar(ctx, bar)
    return
  }
  scheduleProfiledBar(ctx, bar, MUSIC_PROFILES[musicMode])
}

function scheduleProfiledBar(ctx: AudioContext, bar: number, profile: RealmMusicProfile) {
  if (!musicGain) return
  const output = musicGain
  const beatSec = beatDurationSec()
  const barSec = beatSec * 4
  const t0 = startAt + bar * barSec
  const chord = profile.chords[bar % profile.chords.length]
  const root = profile.roots[bar % profile.roots.length]
  const activeStems = effectiveStemFlags()

  for (const frequency of chord) {
    profile.padDetunes.forEach((detune, index) => {
      tone(ctx, {
        freq: frequency,
        type: profile.padTypes[index % profile.padTypes.length],
        at: t0,
        attack: profile.padAttack,
        peak: profile.padPeak,
        decayTo: barSec + Math.min(1.2, profile.padAttack * 0.45),
        detune,
        filterHz: profile.padFilterHz,
      })
    })
  }

  profile.pulseBeats.forEach((beat, index) => {
    const at = t0 + beat * beatSec
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = profile.pulseType
    osc.frequency.setValueAtTime(profile.pulseStartHz, at)
    osc.frequency.exponentialRampToValueAtTime(
      profile.pulseEndHz,
      at + Math.max(0.025, Math.min(profile.pulseDecay * 0.65, 0.45)),
    )
    const peak = index === 0 ? profile.pulsePeak : profile.pulsePeak * 0.55
    gain.gain.setValueAtTime(peak, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + profile.pulseDecay)
    osc.connect(gain).connect(output)
    osc.start(at)
    osc.stop(at + profile.pulseDecay + 0.05)
  })

  if (activeStems.mallets) {
    const rand = mulberry32(bar * 7919 + profile.character.length * 131)
    for (let eighth = 0; eighth < 8; eighth++) {
      if (rand() > profile.malletDensity) continue
      const frequency = profile.scale[Math.floor(rand() * profile.scale.length)]
      tone(ctx, {
        freq: frequency * profile.malletMultiplier,
        type: profile.malletType,
        at: t0 + eighth * (beatSec / 2),
        attack: musicMode === 'clockwork' ? 0.003 : 0.012,
        peak: musicMode === 'canticle' ? 0.028 : 0.045,
        decayTo: musicMode === 'clockwork' ? 0.12 : musicMode === 'canticle' ? 1.4 : 0.62,
        filterHz: Math.max(900, profile.padFilterHz * 2.2),
      })
    }
  }

  if (activeStems.bass) {
    for (const beat of profile.bassBeats) {
      tone(ctx, {
        freq: root,
        type: musicMode === 'clockwork' ? 'triangle' : 'sine',
        at: t0 + beat * beatSec,
        attack: musicMode === 'canticle' ? 0.35 : 0.03,
        peak: 0.085,
        decayTo: musicMode === 'canticle' ? 2.2 : 1.15,
        filterHz: musicMode === 'clockwork' ? 420 : undefined,
      })
    }
  }

  if (activeStems.strings) {
    for (const frequency of chord) {
      tone(ctx, {
        freq: frequency * 2,
        type: musicMode === 'verdance' ? 'triangle' : musicMode === 'clockwork' ? 'square' : 'sawtooth',
        at: t0,
        attack: Math.max(0.35, profile.padAttack * 0.8),
        peak: musicMode === 'clockwork' ? 0.006 : 0.012,
        decayTo: barSec + 0.5,
        filterHz: profile.padFilterHz * 1.45,
      })
    }
  }

  if (activeStems.choir) {
    for (const frequency of chord) {
      tone(ctx, {
        freq: frequency * (musicMode === 'canticle' ? 2 : 4),
        type: 'sine',
        at: t0,
        attack: Math.max(1.2, profile.padAttack),
        peak: musicMode === 'canticle' ? 0.007 : 0.01,
        decayTo: barSec + 0.7,
        vibratoHz: musicMode === 'clockwork' ? 2.4 : 4.6,
        vibratoDepth: musicMode === 'prismata' ? 2 : 4,
      })
    }
  }
}

function scheduleKailashStillnessBar(ctx: AudioContext, bar: number) {
  if (bar % 4 !== 0) return
  const barSec = beatDurationSec() * 4
  tone(ctx, {
    freq: 392,
    type: 'sine',
    at: startAt + bar * barSec,
    attack: 0.035,
    peak: 0.045,
    decayTo: Math.min(3.2, barSec),
    filterHz: 1_400,
  })
}

function scheduleTidefallBar(ctx: AudioContext, bar: number) {
  if (!musicGain) return
  const beatSec = beatDurationSec()
  const barSec = beatSec * 4
  const t0 = startAt + bar * barSec
  const chord = TIDE_CHORDS[bar % TIDE_CHORDS.length]
  const root = TIDE_ROOTS[bar % TIDE_ROOTS.length]
  const activeStems = effectiveStemFlags()

  // Submerged pad: slower sine/triangle bloom with a narrow, dark filter.
  for (const freq of chord) {
    for (const detune of [-9, 9]) {
      tone(ctx, {
        freq,
        type: detune < 0 ? 'sine' : 'triangle',
        at: t0,
        attack: 1.45,
        peak: 0.026,
        decayTo: barSec + 0.9,
        detune,
        filterHz: 680,
        vibratoHz: 0.18,
        vibratoDepth: 1.8,
      })
    }
  }

  // The tide is the pulse here: two long pressure swells instead of a heartbeat.
  for (const beat of [0, 2]) {
    const at = t0 + beat * beatSec
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(92, at)
    osc.frequency.exponentialRampToValueAtTime(38, at + 0.42)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(beat === 0 ? 0.13 : 0.08, at + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.78)
    osc.connect(gain).connect(musicGain)
    osc.start(at)
    osc.stop(at + 0.82)
  }

  // A tiny surface droplet keeps the combo grid legible without sounding percussive.
  for (let beat = 0; beat < 4; beat++) {
    tone(ctx, {
      freq: 740 + (bar % 2) * 90,
      type: 'sine',
      at: t0 + beat * beatSec,
      attack: 0.006,
      peak: beat === 0 ? 0.035 : 0.018,
      decayTo: 0.42,
      filterHz: 2100,
    })
  }

  if (activeStems.mallets) {
    const rand = mulberry32(bar * 6151 + 43)
    for (let eighth = 0; eighth < 8; eighth++) {
      if (rand() < 0.58) continue
      const freq = TIDE_SCALE[Math.floor(rand() * TIDE_SCALE.length)]
      tone(ctx, {
        freq: freq * 1.5,
        type: 'sine',
        at: t0 + eighth * (beatSec / 2),
        attack: 0.008,
        peak: 0.038,
        decayTo: 0.9,
        vibratoHz: 3.2,
        vibratoDepth: 2,
      })
    }
  }

  if (activeStems.bass) {
    tone(ctx, { freq: root, type: 'triangle', at: t0, attack: 0.18, peak: 0.08, decayTo: barSec, filterHz: 320 })
  }

  if (activeStems.strings) {
    for (const freq of chord.slice(1)) {
      tone(ctx, { freq: freq * 2, type: 'sine', at: t0 + beatSec, attack: 1.1, peak: 0.018, decayTo: barSec, vibratoHz: 0.32, vibratoDepth: 5 })
    }
  }

  if (activeStems.choir) {
    for (const freq of chord.slice(1)) {
      tone(ctx, { freq: freq * 3, type: 'triangle', at: t0, attack: 1.8, peak: 0.009, decayTo: barSec + 0.8, filterHz: 1450, vibratoHz: 4.2, vibratoDepth: 7 })
    }
  }
}
