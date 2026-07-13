import type { UniverseId } from '../content/universes/types'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let output: BiquadFilterNode | null = null
let volume = 0.5
let deepLowPassActive = false

export const DEEP_LOW_PASS_HZ = 3_400
export const OPEN_LOW_PASS_HZ = 20_000

export function depthLowPassFrequency(active: boolean): number {
  return active ? DEEP_LOW_PASS_HZ : OPEN_LOW_PASS_HZ
}

/** Reversible shared-output treatment; does not initialize audio by itself. */
export function setDepthLowPass(active: boolean): void {
  deepLowPassActive = active
  if (!ctx || !output) return
  const now = ctx.currentTime
  output.frequency.cancelScheduledValues(now)
  output.frequency.setValueAtTime(Math.max(20, output.frequency.value), now)
  output.frequency.exponentialRampToValueAtTime(depthLowPassFrequency(active), now + (active ? 0.7 : 0.45))
}

export function setMasterVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (master) master.gain.value = volume
}

/** Shared context for other audio modules (music engine). */
export function getAudio(): { ctx: AudioContext; master: GainNode; output: BiquadFilterNode } | null {
  return audio()
}

function audio(): { ctx: AudioContext; master: GainNode; output: BiquadFilterNode } | null {
  try {
    if (!ctx) {
      ctx = new AudioContext()
      master = ctx.createGain()
      output = ctx.createBiquadFilter()
      master.gain.value = volume
      output.type = 'lowpass'
      output.frequency.value = depthLowPassFrequency(deepLowPassActive)
      output.Q.value = 0.35
      master.connect(output)
      output.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return { ctx, master: master!, output: output! }
  } catch {
    return null
  }
}

/** Warm, woody thump — pitch-randomized so rapid clicking never grates. */
export function playClick(mode: UniverseId = 'emberlight') {
  if (mode === 'tidefall') {
    playTidefallClick()
    return
  }
  if (mode === 'verdance') {
    playVerdanceClick()
    return
  }
  if (mode === 'clockwork') {
    playClockworkClick()
    return
  }
  if (mode === 'brahmalok' || mode === 'vishnulok' || mode === 'kailash') {
    playFutureClick(mode)
    return
  }
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const base = 165 * (0.97 + Math.random() * 0.06)

  const osc = a.ctx.createOscillator()
  const gain = a.ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base * 2.2, t)
  osc.frequency.exponentialRampToValueAtTime(base, t + 0.055)
  gain.gain.setValueAtTime(0.5, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  osc.connect(gain).connect(a.master)
  osc.start(t)
  osc.stop(t + 0.12)

  // a whisper of crackle on top
  const len = Math.floor(a.ctx.sampleRate * 0.03)
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = a.ctx.createBufferSource()
  noise.buffer = buf
  const nGain = a.ctx.createGain()
  nGain.gain.setValueAtTime(0.06, t)
  const filter = a.ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 3000
  noise.connect(filter).connect(nGain).connect(a.master)
  noise.start(t)
}

/** A quiet, deterministic harmonic interval layered only onto accepted beat clicks. */
export function playRhythmAccent(mode: UniverseId = 'emberlight', streak = 1): boolean {
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  const roots: Record<UniverseId, number> = {
    emberlight: 330,
    tidefall: 293.66,
    verdance: 261.63,
    clockwork: 330,
    brahmalok: 293.66,
    vishnulok: 220,
    kailash: 146.83,
  }
  const root = roots[mode]
  const ratio = streak >= 64 ? 1.5 : streak >= 16 ? 4 / 3 : 5 / 4
  for (const [index, frequency] of [root, root * ratio].entries()) {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    const start = t + index * 0.018
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.045 : 0.032, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24)
    oscillator.connect(gain).connect(a.master)
    oscillator.start(start)
    oscillator.stop(start + 0.26)
  }
  return true
}

/** A short wooden seed-pop with a leaf-soft tail. */
function playVerdanceClick() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const body = a.ctx.createOscillator()
  const gain = a.ctx.createGain()
  const filter = a.ctx.createBiquadFilter()
  body.type = 'triangle'
  body.frequency.setValueAtTime(310, t)
  body.frequency.exponentialRampToValueAtTime(118, t + 0.14)
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1_250, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.3, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  body.connect(filter).connect(gain).connect(a.master)
  body.start(t)
  body.stop(t + 0.22)
}

/** A dry two-part escapement: engage, then release one counted tooth. */
function playClockworkClick() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  for (const [offset, frequency] of [[0, 1_180], [0.055, 760]] as const) {
    const tick = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    const filter = a.ctx.createBiquadFilter()
    tick.type = 'square'
    tick.frequency.setValueAtTime(frequency, t + offset)
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 4.8
    gain.gain.setValueAtTime(0.0001, t + offset)
    gain.gain.exponentialRampToValueAtTime(0.16, t + offset + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.045)
    tick.connect(filter).connect(gain).connect(a.master)
    tick.start(t + offset)
    tick.stop(t + offset + 0.055)
  }
}

function playFutureClick(mode: 'brahmalok' | 'vishnulok' | 'kailash') {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const oscillator = a.ctx.createOscillator()
  const gain = a.ctx.createGain()
  const filter = a.ctx.createBiquadFilter()
  oscillator.type = 'sine'
  const start = mode === 'brahmalok' ? 420 : mode === 'vishnulok' ? 245 : 180
  const end = mode === 'brahmalok' ? 285 : mode === 'vishnulok' ? 165 : 110
  oscillator.frequency.setValueAtTime(start, t)
  oscillator.frequency.exponentialRampToValueAtTime(end, t + (mode === 'kailash' ? 0.2 : 0.09))
  filter.type = 'lowpass'
  filter.frequency.value = mode === 'vishnulok' ? 1_200 : mode === 'kailash' ? 900 : 2_400
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(mode === 'vishnulok' ? 0.12 : mode === 'kailash' ? 0.08 : 0.24, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, t + (mode === 'kailash' ? 0.32 : 0.14))
  oscillator.connect(filter).connect(gain).connect(a.master)
  oscillator.start(t)
  oscillator.stop(t + 0.26)
}

/** A rounded droplet with a soft underwater pressure tail. */
function playTidefallClick() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const base = 210 * (0.96 + Math.random() * 0.08)

  const drop = a.ctx.createOscillator()
  const dropGain = a.ctx.createGain()
  drop.type = 'sine'
  drop.frequency.setValueAtTime(base * 3.1, t)
  drop.frequency.exponentialRampToValueAtTime(base, t + 0.11)
  dropGain.gain.setValueAtTime(0.0001, t)
  dropGain.gain.exponentialRampToValueAtTime(0.38, t + 0.008)
  dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.19)
  drop.connect(dropGain).connect(a.master)
  drop.start(t)
  drop.stop(t + 0.21)

  const pressure = a.ctx.createOscillator()
  const pressureGain = a.ctx.createGain()
  pressure.type = 'triangle'
  pressure.frequency.setValueAtTime(base * 0.72, t)
  pressure.frequency.exponentialRampToValueAtTime(48, t + 0.2)
  pressureGain.gain.setValueAtTime(0.12, t)
  pressureGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24)
  const filter = a.ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  pressure.connect(filter).connect(pressureGain).connect(a.master)
  pressure.start(t)
  pressure.stop(t + 0.26)
}

export interface PurchaseAudioProfile {
  readonly pitchScale: number
  readonly spacingScale: number
  readonly decayScale: number
}

/** Bounded timbre profile: bulk buys read larger without adding gain or voices. */
export function purchaseAudioProfile(quantity: number): PurchaseAudioProfile {
  const safeQuantity = Number.isFinite(quantity) && quantity >= 1 ? Math.floor(quantity) : 1
  const magnitude = Math.min(1, Math.log10(safeQuantity) / 2)
  return {
    pitchScale: 1 + magnitude * 0.16,
    spacingScale: 1 - magnitude * 0.28,
    decayScale: 1 + magnitude * 0.32,
  }
}

/** Authored local purchase interval. Returns false when Web Audio is unavailable. */
export function playBuy(
  gainScale = 1,
  mode: UniverseId = 'emberlight',
  quantity = 1,
): boolean {
  const profile = purchaseAudioProfile(quantity)
  if (mode === 'tidefall') return playTidefallBuy(gainScale, profile)
  if (mode !== 'emberlight') return playFutureBuy(gainScale, mode, profile)
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  const routedGain = a.ctx.createGain()
  routedGain.gain.value = Math.max(0, Math.min(2, gainScale))
  routedGain.connect(a.master)
  const notes = [523.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq * profile.pitchScale
    const start = t + i * 0.07 * profile.spacingScale
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35 * profile.decayScale)
    osc.connect(gain).connect(routedGain)
    osc.start(start)
    osc.stop(start + 0.4 * profile.decayScale)
  })
  return true
}

function playFutureBuy(
  gainScale: number,
  mode: Exclude<UniverseId, 'emberlight' | 'tidefall'>,
  profile: PurchaseAudioProfile,
): boolean {
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  const pairs: Record<typeof mode, readonly [number, number]> = {
    verdance: [293.66, 440],
    clockwork: [330, 495],
    brahmalok: [293.66, 440],
    vishnulok: [164.81, 220],
    kailash: [110, 146.83],
  }
  const routedGain = a.ctx.createGain()
  routedGain.gain.value = Math.max(0, Math.min(2, gainScale))
  routedGain.connect(a.master)
  pairs[mode].forEach((frequency, index) => {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency * profile.pitchScale
    const start = t + index * 0.075 * profile.spacingScale
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.014)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38 * profile.decayScale)
    oscillator.connect(gain).connect(routedGain)
    oscillator.start(start)
    oscillator.stop(start + 0.42 * profile.decayScale)
  })
  return true
}

/** A submerged minor-seventh rise with a short pressure return. */
function playTidefallBuy(gainScale: number, profile: PurchaseAudioProfile): boolean {
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  const routedGain = a.ctx.createGain()
  routedGain.gain.value = Math.max(0, Math.min(2, gainScale))
  routedGain.connect(a.master)
  const notes = [293.66, 523.25]
  notes.forEach((frequency, index) => {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    const filter = a.ctx.createBiquadFilter()
    oscillator.type = 'sine'
    const start = t + index * 0.09 * profile.spacingScale
    oscillator.frequency.setValueAtTime(frequency * 1.18 * profile.pitchScale, start)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * profile.pitchScale,
      start + 0.22 * profile.decayScale,
    )
    filter.type = 'lowpass'
    filter.frequency.value = 1_250
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.17, start + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48 * profile.decayScale)
    oscillator.connect(filter).connect(gain).connect(routedGain)
    oscillator.start(start)
    oscillator.stop(start + 0.52 * profile.decayScale)
  })
  return true
}

/** A local Epoch Turn ceremony: stellar bloom or Tidefall pressure reversal. */
export function playSupernova(mode: UniverseId = 'emberlight') {
  if (mode === 'tidefall') {
    playUndertow()
    return
  }
  if (mode !== 'emberlight') {
    playFutureEpoch(mode)
    return
  }
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  // sub boom
  const boom = a.ctx.createOscillator()
  const boomGain = a.ctx.createGain()
  boom.type = 'sine'
  boom.frequency.setValueAtTime(110, t)
  boom.frequency.exponentialRampToValueAtTime(28, t + 1.6)
  boomGain.gain.setValueAtTime(0.5, t)
  boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2)
  boom.connect(boomGain).connect(a.master)
  boom.start(t)
  boom.stop(t + 2.3)
  // shimmer chord blooming out of the blast
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + 0.5 + i * 0.16
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.6)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 2.8)
  })
}

/** The one heartbeat inside the Supernova's beat of black. */
export function playSupernovaHeartbeat(): boolean {
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  for (const [offset, peak] of [[0, 0.28], [0.14, 0.16]] as const) {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(92, t + offset)
    oscillator.frequency.exponentialRampToValueAtTime(42, t + offset + 0.18)
    gain.gain.setValueAtTime(0.0001, t + offset)
    gain.gain.exponentialRampToValueAtTime(peak, t + offset + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.24)
    oscillator.connect(gain).connect(a.master)
    oscillator.start(t + offset)
    oscillator.stop(t + offset + 0.26)
  }
  return true
}

/** One quiet mallet note for a landing Stardust facet. */
export function playStardustMote(index: number): boolean {
  const a = audio()
  if (!a) return false
  const chord = [261.63, 329.63, 392, 523.25, 659.25] as const
  const frequency = chord[Math.abs(Math.floor(index)) % chord.length]
  const t = a.ctx.currentTime
  const oscillator = a.ctx.createOscillator()
  const gain = a.ctx.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency * 1.8, t)
  oscillator.frequency.exponentialRampToValueAtTime(frequency, t + 0.05)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.055, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
  oscillator.connect(gain).connect(a.master)
  oscillator.start(t)
  oscillator.stop(t + 0.45)
  return true
}

function playFutureEpoch(mode: Exclude<UniverseId, 'emberlight' | 'tidefall'>) {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const roots: Record<typeof mode, number> = {
    verdance: 146.83,
    clockwork: 165,
    brahmalok: 146.83,
    vishnulok: 82.41,
    kailash: 73.42,
  }
  const root = roots[mode]
  const intervals = mode === 'brahmalok' ? [1, 1.5, 2, 2.5] : mode === 'kailash' ? [1, 4 / 3, 1.5, 2] : [1, 4 / 3, 1.75, 2]
  intervals.forEach((interval, index) => {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    oscillator.type = mode === 'clockwork' ? 'square' : 'sine'
    oscillator.frequency.value = root * interval
    const start = t + index * 0.18
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(mode === 'vishnulok' ? 0.055 : mode === 'kailash' ? 0.05 : 0.1, start + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1.8)
    oscillator.connect(gain).connect(a.master)
    oscillator.start(start)
    oscillator.stop(start + 1.9)
  })
}

/** Undertow: the sea draws inward, holds one quiet beat, then returns as salt glass. */
function playUndertow() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime

  const pressure = a.ctx.createOscillator()
  const pressureGain = a.ctx.createGain()
  const pressureFilter = a.ctx.createBiquadFilter()
  pressure.type = 'sine'
  pressure.frequency.setValueAtTime(92, t)
  pressure.frequency.exponentialRampToValueAtTime(34, t + 1.55)
  pressureGain.gain.setValueAtTime(0.0001, t)
  pressureGain.gain.exponentialRampToValueAtTime(0.42, t + 0.22)
  pressureGain.gain.exponentialRampToValueAtTime(0.001, t + 1.72)
  pressureFilter.type = 'lowpass'
  pressureFilter.frequency.setValueAtTime(680, t)
  pressureFilter.frequency.exponentialRampToValueAtTime(120, t + 1.55)
  pressure.connect(pressureFilter).connect(pressureGain).connect(a.master)
  pressure.start(t)
  pressure.stop(t + 1.8)

  const returnNotes = [293.66, 349.23, 440, 587.33]
  returnNotes.forEach((frequency, index) => {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    oscillator.type = index % 2 === 0 ? 'sine' : 'triangle'
    oscillator.frequency.value = frequency
    const start = t + 1.95 + index * 0.12
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.095, start + 0.045)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1.35)
    oscillator.connect(gain).connect(a.master)
    oscillator.start(start)
    oscillator.stop(start + 1.42)
  })
}

/** A restrained five-second shimmer that lets the world announce an Omen. */
export function playOmenApproach(mode: UniverseId = 'emberlight'): boolean {
  const a = audio()
  if (!a) return false
  const t = a.ctx.currentTime
  const roots: Record<UniverseId, number> = {
    emberlight: 329.63,
    tidefall: 196,
    verdance: 261.63,
    clockwork: 440,
    brahmalok: 293.66,
    vishnulok: 110,
    kailash: 146.83,
  }
  const root = roots[mode]
  const intervals = mode === 'tidefall' || mode === 'vishnulok' ? [1, 4 / 3] : [1, 3 / 2]
  intervals.forEach((ratio, index) => {
    const oscillator = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    const filter = a.ctx.createBiquadFilter()
    oscillator.type = mode === 'clockwork' ? 'triangle' : 'sine'
    oscillator.frequency.value = root * ratio
    filter.type = 'lowpass'
    filter.frequency.value = mode === 'tidefall' ? 900 : 2_600
    const start = t + index * 0.32
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.038 : 0.026, start + 0.6)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 4.7)
    oscillator.connect(filter).connect(gain).connect(a.master)
    oscillator.start(start)
    oscillator.stop(start + 4.8)
  })
  return true
}

/** Sparkling ascent for catching a falling star. */
export function playStarCatch(mode: UniverseId = 'emberlight') {
  if (mode === 'tidefall') {
    playTidefallCatch()
    return
  }
  if (mode === 'vishnulok') {
    playTidefallCatch()
    return
  }
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [659.25, 830.61, 987.77, 1318.5]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const start = t + i * 0.05
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

/** Bubble-pop cascade for Tidefall's wandering blessings. */
function playTidefallCatch() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [392, 329.63, 261.63, 196]
  notes.forEach((freq, index) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    const start = t + index * 0.055
    osc.frequency.setValueAtTime(freq * 1.8, start)
    osc.frequency.exponentialRampToValueAtTime(freq, start + 0.18)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 0.52)
  })
}

/** Two-bell shimmer for an achievement. */
export function playAchievement() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [1046.5, 1568.0]
  notes.forEach((freq, i) => {
    for (const det of [0, 7]) {
      const osc = a.ctx.createOscillator()
      const gain = a.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = det
      const start = t + i * 0.12
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)
      osc.connect(gain).connect(a.master)
      osc.start(start)
      osc.stop(start + 1)
    }
  })
}

/** Rising bloom for assembling a new piece of the interface. */
export function playBloom() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [392.0, 493.88, 587.33, 783.99]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + i * 0.09
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1.1)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 1.2)
  })
}

/** Low, warm swell for the welcome-back collect. */
export function playCollect() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [261.63, 329.63, 392.0]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + i * 0.05
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 1)
  })
}
