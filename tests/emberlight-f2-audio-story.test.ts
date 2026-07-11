import assert from 'node:assert/strict'
import test from 'node:test'
import { validateUniverseAudioDef } from '../src/audio/semantic-contract'
import {
  EMBERLIGHT_AUDIO_DEF,
  EMBERLIGHT_AUDIO_EVENT_MAP,
} from '../src/audio/emberlight/identity'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { EMBERLIGHT_SUPERNOVA_SENSORY_SPEC } from '../src/render/emberlight/supernova'

test('Emberlight audio map covers click, purchase, critical, each Omen, and Supernova', () => {
  assert.deepEqual(validateUniverseAudioDef(EMBERLIGHT_AUDIO_DEF), [])
  const cueIds = new Set(EMBERLIGHT_AUDIO_DEF.cues.map(({ id }) => id))
  const mapped = [
    EMBERLIGHT_AUDIO_EVENT_MAP.click,
    EMBERLIGHT_AUDIO_EVENT_MAP.purchase,
    EMBERLIGHT_AUDIO_EVENT_MAP.critical,
    ...Object.values(EMBERLIGHT_AUDIO_EVENT_MAP.omens),
    EMBERLIGHT_AUDIO_EVENT_MAP.supernova,
    EMBERLIGHT_AUDIO_EVENT_MAP.archive,
    EMBERLIGHT_AUDIO_EVENT_MAP.achievement,
    EMBERLIGHT_AUDIO_EVENT_MAP.beacon,
  ]
  assert.ok(mapped.every((id) => cueIds.has(id)))
  assert.equal(new Set(Object.values(EMBERLIGHT_AUDIO_EVENT_MAP.omens)).size, 4)
  for (const omen of EMBERLIGHT_V2.omens) {
    assert.equal(omen.object.audioCue, EMBERLIGHT_AUDIO_EVENT_MAP.omens[omen.id])
  }
})

test('Supernova is a contiguous, captioned, reduced-motion-safe subtractive ceremony', () => {
  const spec = EMBERLIGHT_SUPERNOVA_SENSORY_SPEC
  assert.equal(spec.localName, 'Supernova')
  assert.equal(spec.canonicalName, 'Epoch Turn')
  assert.equal(spec.confirmationRequired, true)
  assert.equal(spec.fullScreenFlashAllowed, false)
  for (let index = 0; index < spec.phases.length; index += 1) {
    const phase = spec.phases[index]
    assert.ok(phase.caption.trim(), phase.id)
    assert.ok(phase.shapeCue.trim(), phase.id)
    assert.ok(phase.reducedMotion.trim(), phase.id)
    if (index > 0) {
      const previous = spec.phases[index - 1]
      assert.equal(phase.startMs, previous.startMs + previous.durationMs, phase.id)
    }
  }
  const final = spec.phases.at(-1)!
  assert.equal(final.startMs + final.durationMs, spec.totalDurationMs)
  const silence = spec.phases.filter(({ audio }) => audio.kind === 'intentional-silence')
  assert.equal(silence.length, 1)
  assert.equal(silence[0].durationMs, 1_200)
})

test('local, canonical, muted, non-color, and screen-reader language is explicit', () => {
  const accessibility = EMBERLIGHT_V2.accessibility
  assert.match(accessibility.heartLabel, /Last Ember, Heart of Emberlight/)
  assert.match(accessibility.currencyLabel, /Light, Emberlight World currency/)
  assert.equal(accessibility.screenReaderOrder[0], EMBERLIGHT_V2.heart.id)
  assert.ok(EMBERLIGHT_V2.visual.objects.every(({ id }) => accessibility.screenReaderOrder.includes(id)))
  for (const omen of ['falling-star', 'pulsar-sweep', 'comet-return', 'microlensing']) {
    assert.ok(accessibility.announcements.some(({ messageKey }) => messageKey.includes(omen)))
  }
  assert.ok(accessibility.nonColorSignals.length >= 8)
  assert.ok(accessibility.nonColorSignals.every(({ text, shape, pattern, highContrastTreatment }) => (
    text.trim() && shape.trim() && pattern.trim() && highContrastTreatment.trim()
  )))
  assert.ok(accessibility.muted.captions.some((caption) => caption.includes('silent beat')))
  assert.equal(accessibility.reducedMotion.timingInformationPreserved, true)
  assert.equal(accessibility.lowQuality.preservesStateLabels, true)
})
