import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS,
  EMBERLIGHT_SUPERNOVA_HOLD_MS,
  EMBERLIGHT_SUPERNOVA_SENSORY_SPEC,
  emberlightSupernovaPhaseAt,
} from '../src/render/emberlight/supernova'
import {
  clearCeremonyStemWithdrawal,
  effectiveStemFlags,
  setCeremonyStemBeat,
  setStems,
} from '../src/audio/music'

test('the Supernova owns a contiguous thirty-two-second authored timeline', () => {
  const spec = EMBERLIGHT_SUPERNOVA_SENSORY_SPEC
  assert.equal(spec.totalDurationMs, 32_000)
  assert.equal(spec.heldChoice.beats, 3)
  assert.equal(spec.heldChoice.releaseCancels, true)
  assert.equal(spec.heldChoice.dimPerBeat, 0.1)
  assert.equal(EMBERLIGHT_SUPERNOVA_HOLD_MS, EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS * 3)
  for (let index = 1; index < spec.phases.length; index += 1) {
    const previous = spec.phases[index - 1]
    assert.equal(spec.phases[index].startMs, previous.startMs + previous.durationMs)
  }
  const final = spec.phases.at(-1)!
  assert.equal(final.startMs + final.durationMs, 32_000)
  assert.equal(emberlightSupernovaPhaseAt(12_000).id, 'void')
  assert.equal(emberlightSupernovaPhaseAt(13_200).id, 'blast')
  assert.equal(emberlightSupernovaPhaseAt(14_000).id, 'stardust-rain')
  assert.equal(emberlightSupernovaPhaseAt(22_000).id, 'rebuild')
})

test('the consent hold withdraws choir, strings, and bass without mutating base stems', () => {
  setStems({ mallets: true, bass: true, strings: true, choir: true })
  setCeremonyStemBeat(1)
  assert.deepEqual(effectiveStemFlags(), { mallets: true, bass: true, strings: true, choir: false })
  setCeremonyStemBeat(2)
  assert.deepEqual(effectiveStemFlags(), { mallets: true, bass: true, strings: false, choir: false })
  setCeremonyStemBeat(3)
  assert.deepEqual(effectiveStemFlags(), { mallets: true, bass: false, strings: false, choir: false })
  clearCeremonyStemWithdrawal()
  assert.deepEqual(effectiveStemFlags(), { mallets: true, bass: true, strings: true, choir: true })
})

test('the reset confirmation requires a cancellable pointer-or-keyboard hold', () => {
  const source = readFileSync(new URL('../src/ui/ResetComparisonCard.svelte', import.meta.url), 'utf8')
  assert.match(source, /comparison\.boundary === 'epoch-turn'/)
  assert.match(source, /onpointerdown=\{beginHold\}/)
  assert.match(source, /onpointerup=\{releaseHold\}/)
  assert.match(source, /onpointercancel=\{releaseHold\}/)
  assert.match(source, /Press and hold for three beats\. Release to cancel\./)
  assert.match(source, /onholdbeat\(holdBeat\)/)
  assert.match(source, /import\.meta\.env\.DEV[\s\S]*supernova-preview/)
  assert.match(source, /onclick=\{confirmClick\}/)
})

test('the cutscene consumes and rebuilds world and UI without a full-screen white flash', () => {
  const url = new URL('../src/ui/SupernovaCutscene.svelte', import.meta.url)
  const source = readFileSync(url, 'utf8')
  assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
  assert.doesNotMatch(source, /Math\.random/)
  assert.match(source, /worldRef\(\)\?\.beginCollapse\(scaled\(6_000\), scaled\(6_000\)\)/)
  assert.match(source, /if \(next\.id === 'blast'\)/)
  assert.match(source, /playSupernovaHeartbeat\(\)/)
  assert.match(source, /playStardustMote\(index\)/)
  assert.match(source, /uiPurchaseOrder/)
  assert.match(source, /setTimeout\(finish, scaled\(EMBERLIGHT_SUPERNOVA_SENSORY_SPEC\.totalDurationMs\)\)/)
  assert.match(source, /html\[data-supernova-phase='infall-hud'\] \.shop/)
  assert.match(source, /palette-ring/)
  assert.match(source, /\.dark \{[\s\S]*?background: #000/)
  assert.doesNotMatch(source, /\.flash\s*\{[\s\S]*?background:\s*(?:#fff|white)/i)
})

test('the post-prestige Coal retains stones, glittering ash, and sixty-second ghosts', () => {
  const world = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
  assert.match(world, /if \(game\.supernovae > 0\) return 1/)
  assert.match(world, /private drawSupernovaAfterglow\(now: number\)/)
  assert.match(world, /if \(age >= 60_000\)/)
  assert.match(world, /Scorch-ghosts remember the largest lost structures/)
  assert.match(world, /this\.drawSupernovaAfterglow\(now\)/)
})
