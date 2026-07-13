import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  EMBERLIGHT_SUPERNOVA_SENSORY_SPEC,
  emberlightSupernovaPhaseAt,
} from '../src/render/emberlight/supernova'
import {
  effectiveStemFlags,
  setStems,
} from '../src/audio/music'

test('the Supernova owns a contiguous thirty-two-second authored timeline', () => {
  const spec = EMBERLIGHT_SUPERNOVA_SENSORY_SPEC
  assert.equal(spec.totalDurationMs, 32_000)
  assert.equal(spec.confirmationRequired, true)
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

test('the reset preview does not mutate the playing stem mix before confirmation', () => {
  setStems({ mallets: true, bass: true, strings: true, choir: true })
  assert.deepEqual(effectiveStemFlags(), { mallets: true, bass: true, strings: true, choir: true })
})

test('the reset comparison is the safety step and every universe confirms with one click', () => {
  const source = readFileSync(new URL('../src/ui/ResetComparisonCard.svelte', import.meta.url), 'utf8')
  assert.match(source, /onclick=\{\(\) => decide\('confirm'\)\}/)
  assert.match(source, /model\.requiresExplicitConfirmation/)
  assert.doesNotMatch(source, /holdProgress|beginHold|onpointerdown|Hold \$\{holdBeat\}/)
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
  assert.match(source, /currentPhase\.caption[\s\S]*replaceAll\('Supernova', ritualName\)[\s\S]*replaceAll\('Stardust', rewardName\)/)
  assert.match(source, /<small>\{rewardName\} returning<\/small>/)
  assert.match(source, /Skip remembered \{ritualName\}/)
  assert.doesNotMatch(source, />Stardust returning</)
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
