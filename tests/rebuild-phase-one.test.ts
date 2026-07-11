import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import {
  EMBERLIGHT_SET_PIECES,
  EMBERLIGHT_SET_PIECE_STAGE_BY_OBJECT_ID,
  validateEmberlightSetPieceRegistry,
} from '../src/render/emberlight/set-piece-registry'
import { PARTICLE_RECIPES } from '../src/render/particle-recipes'

const EXPECTED_SILHOUETTE_SNAPSHOTS = {
  'ember-kindling-spark': 'b8206512f39f98cf',
  'ember-kindling-wisp': '022202754e681235',
  'ember-kindling-hearth': 'b0d3d479ec6202a2',
  'ember-kindling-kiln': '157742af05822bc0',
  'ember-kindling-forge': 'af8a320ac925a8af',
  'ember-kindling-beacon': '63f69a3eb24bcfb2',
  'ember-kindling-titan': '41d92cef5d50799b',
  'ember-kindling-starseed': '3a886403623c846e',
  'ember-kindling-protostar': '5452b09ed2afd872',
  'ember-kindling-sun': '751e2a699dc89f2e',
  'ember-kindling-binary': '2868e5dd62b9f1f3',
  'ember-kindling-constellation': '6a8046acd6420be1',
  'ember-kindling-nebula': '30623ffeb786a662',
  'ember-kindling-galaxy': 'd4347385f9f4fb19',
  'ember-kindling-supercluster': '9b2850ba115ad932',
  'ember-kindling-web': '9026fc1304907884',
  'ember-kindling-loom': 'c213b08e360a6060',
  'ember-kindling-ember2': 'b56a4226b0c7a6ec',
} as const

test('nine authored lifecycle set pieces cover all eighteen stable Emberlight Kindling IDs', () => {
  assert.deepEqual(validateEmberlightSetPieceRegistry(), [])
  assert.equal(EMBERLIGHT_SET_PIECES.length, 9)
  assert.equal(EMBERLIGHT_SET_PIECE_STAGE_BY_OBJECT_ID.size, 18)
  const manifestIds = EMBERLIGHT_V2.visual.objects
    .filter(({ sourceKind }) => sourceKind === 'generator')
    .map(({ id }) => id)
    .sort()
  assert.deepEqual([...EMBERLIGHT_SET_PIECE_STAGE_BY_OBJECT_ID.keys()].sort(), manifestIds)
  assert.ok(EMBERLIGHT_SET_PIECES.flatMap(({ stages }) => stages).every(({ entrance }) => entrance !== ('fade' as typeof entrance)))
})

test('every flat-black Kindling silhouette is snapshot-locked by its authored paths', () => {
  const snapshots = Object.fromEntries(EMBERLIGHT_SET_PIECES.flatMap(({ stages }) => stages).map((stage) => [
    stage.objectId,
    createHash('sha256').update(stage.paths.map(({ d }) => d).join('|')).digest('hex').slice(0, 16),
  ]))
  assert.deepEqual(snapshots, EXPECTED_SILHOUETTE_SNAPSHOTS)
})

test('the dev silhouette route and vector renderer compile without accessibility warnings', () => {
  for (const file of ['SilhouetteHarness.svelte', 'SetPieceArt.svelte']) {
    const url = new URL(`../src/ui/${file}`, import.meta.url)
    const source = readFileSync(url, 'utf8')
    assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
  }
  const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const harness = readFileSync(new URL('../src/ui/SilhouetteHarness.svelte', import.meta.url), 'utf8')
  assert.match(main, /has\('silhouettes'\)/)
  assert.match(harness, /\[32, 64, 128\]/)
  assert.match(harness, /All Emberlight Kindling silhouettes at 32 pixels/)
})

test('generic rotated primitive stacking is frozen to the three legacy chamber pieces', () => {
  const future = readFileSync(new URL('../src/render/future-presentation.ts', import.meta.url), 'utf8')
  assert.match(future, /@deprecated Frozen compatibility bridge/)
  assert.match(future, /new Set\(\['prismata', 'tempest', 'canticle'\]\)/)
  assert.match(future, /must register authored set-piece paths; generic primitive stacking is frozen/)
})

test('the Coal has a four-second breath, directional compression, cracks, and six accretion stages', () => {
  const world = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
  const layer = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  assert.match(world, /\(now \/ 4_000\) \* Math\.PI \* 2/)
  assert.match(world, /1 - this\.pulse \* 0\.06/)
  assert.match(world, /private emberlightCoalStage\(\): number/)
  assert.match(world, /if \(game\.ending !== null\) return 5/)
  assert.match(world, /ctx\.lineTo\(-radius \* 0\.06, radius \* 0\.74\)/)
  assert.match(world, /this\.idleMoteAcc >= moteInterval/)
  assert.match(world, /sparkCount > 0/)
  assert.match(layer, /pack\.id !== 'emberlight'/)
})

test('one pooled system owns six behaviorally distinct particle recipes', () => {
  assert.deepEqual(Object.keys(PARTICLE_RECIPES), ['click', 'on-beat', 'critical', 'purchase', 'achievement', 'omen'])
  assert.deepEqual(PARTICLE_RECIPES.click.count, [5, 9])
  assert.equal(PARTICLE_RECIPES.click.gravity, -120)
  assert.equal(PARTICLE_RECIPES.click.gravityAfter, 60)
  assert.equal(PARTICLE_RECIPES['on-beat'].tailLength, PARTICLE_RECIPES.click.tailLength * 2)
  assert.deepEqual(PARTICLE_RECIPES.critical.count, [4, 4])
  assert.deepEqual(PARTICLE_RECIPES.purchase.lifeMs, [400, 400])
  assert.deepEqual(PARTICLE_RECIPES.omen.count, [12, 16])
  assert.ok(new Set(Object.values(PARTICLE_RECIPES).map(({ behavior }) => behavior)).size === 6)

  const world = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
  const runtime = readFileSync(new URL('../src/feedback/live-runtime.svelte.ts', import.meta.url), 'utf8')
  const achievements = readFileSync(new URL('../src/systems/achievements.svelte.ts', import.meta.url), 'utf8')
  const omen = readFileSync(new URL('../src/ui/FallingStar.svelte', import.meta.url), 'utf8')
  assert.match(world, /emitParticleRecipe\(kind: ParticleRecipeKind/)
  assert.match(runtime, /schedulePurchaseCeremony/)
  assert.match(runtime, /emitPurchaseMote/)
  assert.match(achievements, /emitParticleRecipe\('achievement'\)/)
  assert.match(omen, /emitParticleRecipe\('omen'/)
})

test('matter enters through kindle, build, condense, or draw—never fade-in', () => {
  const art = readFileSync(new URL('../src/ui/SetPieceArt.svelte', import.meta.url), 'utf8')
  const flagshipLayer = readFileSync(new URL('../src/ui/EmberlightFlagshipLayer.svelte', import.meta.url), 'utf8')
  for (const entrance of ['kindle', 'build', 'condense', 'draw']) assert.match(art, new RegExp(`${entrance}-in`))
  assert.doesNotMatch(art, /@keyframes[^{}]*fade/i)
  assert.match(flagshipLayer, /<SetPieceArt stage=\{landmarkStage\} animate=/)
})
