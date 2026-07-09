/**
 * Adaptive layered soundtrack, fully synthesized — no audio files.
 * One warm 4-bar loop at 72 BPM; stems fade in as generator families
 * are owned. The beat grid is exposed for the rhythm-combo system.
 */
import { getAudio } from './sfx'

const BPM = 72
export const BEAT_SEC = 60 / BPM
const BAR_SEC = BEAT_SEC * 4
const LOOKAHEAD_SEC = 0.35

// C — G/B — Am — F, voiced low and close
const CHORDS = [
  [261.63, 329.63, 392.0],
  [246.94, 293.66, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
]
const ROOTS = [130.81, 123.47, 110.0, 87.31]
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]

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

export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (musicGain) musicGain.gain.value = volume * 0.9
}

export function setStems(f: StemFlags) {
  stems = f
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
  musicGain.gain.value = volume * 0.9
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
  const frac = t % BEAT_SEC
  return frac > BEAT_SEC / 2 ? frac - BEAT_SEC : frac
}

export function currentBeatIndex(): number | null {
  if (!playing) return null
  const a = getAudio()
  if (!a) return null
  const t = a.ctx.currentTime - startAt
  return t < 0 ? null : Math.floor(t / BEAT_SEC)
}

function schedule() {
  const a = getAudio()
  if (!a || !playing) return
  while (startAt + nextBar * BAR_SEC < a.ctx.currentTime + LOOKAHEAD_SEC) {
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
  const t0 = startAt + bar * BAR_SEC
  const chord = CHORDS[bar % 4]
  const root = ROOTS[bar % 4]

  // pad — always on: two detuned triangles per chord tone
  for (const f of chord) {
    for (const det of [-6, 6]) {
      tone(ctx, {
        freq: f, type: 'triangle', at: t0, attack: 0.9, peak: 0.035,
        decayTo: BAR_SEC + 0.4, detune: det, filterHz: 900,
      })
    }
  }

  // heartbeat pulse — the beat grid made audible (stronger on the downbeat)
  for (let b = 0; b < 4; b++) {
    const at = t0 + b * BEAT_SEC
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
  if (stems.mallets) {
    const rand = mulberry32(bar * 7919 + 17)
    for (let eighth = 0; eighth < 8; eighth++) {
      if (rand() < 0.45) continue
      const f = PENTA[Math.floor(rand() * PENTA.length)]
      tone(ctx, {
        freq: f * 2, type: 'triangle', at: t0 + eighth * (BEAT_SEC / 2),
        attack: 0.01, peak: 0.05, decayTo: 0.5, filterHz: 3000,
      })
    }
  }

  // bass — beacon-family stem: root on beats 1 and 3
  if (stems.bass) {
    for (const b of [0, 2]) {
      tone(ctx, {
        freq: root, type: 'sine', at: t0 + b * BEAT_SEC,
        attack: 0.02, peak: 0.11, decayTo: 1.1,
      })
    }
  }

  // strings — star-family stem: slow filtered saws an octave up
  if (stems.strings) {
    for (const f of chord) {
      tone(ctx, {
        freq: f * 2, type: 'sawtooth', at: t0, attack: 1.3, peak: 0.014,
        decayTo: BAR_SEC + 0.5, filterHz: 1300,
      })
    }
  }

  // choir — cosmic stem: high sines with slow vibrato
  if (stems.choir) {
    for (const f of chord) {
      tone(ctx, {
        freq: f * 4, type: 'sine', at: t0, attack: 1.6, peak: 0.012,
        decayTo: BAR_SEC + 0.6, vibratoHz: 5, vibratoDepth: 4,
      })
    }
  }
}
