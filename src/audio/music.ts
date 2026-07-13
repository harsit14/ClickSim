/**
 * Adaptive layered soundtrack, fully synthesized — no audio files.
 * One warm 4-bar loop at 72 BPM; stems fade in as generator families
 * are owned. The beat grid is exposed for the rhythm-combo system.
 */
import { getAudio } from './sfx'
import type { UniverseId } from '../content/universes/types'

const LOOKAHEAD_SEC = 0.35

export type MusicMode = UniverseId

const MUSIC_BPM: Record<MusicMode, number> = {
  emberlight: 72,
  tidefall: 60,
  verdance: 84,
  clockwork: 90,
  prismata: 84,
  tempest: 72,
  canticle: 72,
}

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
  return 60 / MUSIC_BPM[musicMode]
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
    musicGain.connect(a.ctx.destination)
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
  if (musicMode === 'tidefall' || musicMode === 'tempest') {
    scheduleTidefallBar(ctx, bar)
    return
  }
  const beatSec = beatDurationSec()
  const barSec = beatSec * 4
  const t0 = startAt + bar * barSec
  const chord = CHORDS[bar % 4]
  const root = ROOTS[bar % 4]
  const activeStems = effectiveStemFlags()

  // pad — always on: two detuned triangles per chord tone
  for (const f of chord) {
    for (const det of [-6, 6]) {
      tone(ctx, {
        freq: f, type: 'triangle', at: t0, attack: 0.9, peak: 0.035,
        decayTo: barSec + 0.4, detune: det, filterHz: 900,
      })
    }
  }

  // heartbeat pulse — the beat grid made audible (stronger on the downbeat)
  for (let b = 0; b < 4; b++) {
    const at = t0 + b * beatSec
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, at)
    osc.frequency.exponentialRampToValueAtTime(55, at + 0.1)
    const peak = b === 0 ? 0.14 : 0.07
    gain.gain.setValueAtTime(peak, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
    osc.connect(gain).connect(musicGain!)
    osc.start(at)
    osc.stop(at + 0.2)
  }

  // mallets — hearth-family stem: pentatonic plucks on scattered eighths
  if (activeStems.mallets) {
    const rand = mulberry32(bar * 7919 + 17)
    for (let eighth = 0; eighth < 8; eighth++) {
      if (rand() < 0.45) continue
      const f = PENTA[Math.floor(rand() * PENTA.length)]
      tone(ctx, {
        freq: f * 2, type: 'triangle', at: t0 + eighth * (beatSec / 2),
        attack: 0.01, peak: 0.05, decayTo: 0.5, filterHz: 3000,
      })
    }
  }

  // bass — beacon-family stem: root on beats 1 and 3
  if (activeStems.bass) {
    for (const b of [0, 2]) {
      tone(ctx, {
        freq: root, type: 'sine', at: t0 + b * beatSec,
        attack: 0.02, peak: 0.11, decayTo: 1.1,
      })
    }
  }

  // strings — star-family stem: slow filtered saws an octave up
  if (activeStems.strings) {
    for (const f of chord) {
      tone(ctx, {
        freq: f * 2, type: 'sawtooth', at: t0, attack: 1.3, peak: 0.014,
        decayTo: barSec + 0.5, filterHz: 1300,
      })
    }
  }

  // choir — cosmic stem: high sines with slow vibrato
  if (activeStems.choir) {
    for (const f of chord) {
      tone(ctx, {
        freq: f * 4, type: 'sine', at: t0, attack: 1.6, peak: 0.012,
        decayTo: barSec + 0.6, vibratoHz: 5, vibratoDepth: 4,
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
