import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  REALM_CONCLUSIONS,
  type RealmAnswerHistory,
} from '../src/content/endings'
import { UNIVERSES, type UniverseId } from '../src/content/universes'
import {
  GARDEN_LINKS,
  GARDEN_LINK_VARIANTS,
  gardenLinksForAnswers,
  gardenSynthesis,
  type GardenLinkCharacter,
} from '../src/endgame/garden'
import { buildEnglishCatalog } from '../src/localization/catalog'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')
const resolvedCharacters: readonly Exclude<GardenLinkCharacter, 'latent'>[] = [
  'held',
  'spillway',
  'handoff',
  'tempered',
  'open',
  'branching',
  'answered',
  'responsive',
  'reciprocal',
]

test('every semantic Garden link has an exhaustive authored three-by-three answer matrix', () => {
  assert.equal(GARDEN_LINKS.length, 7)
  assert.equal(GARDEN_LINK_VARIANTS.length, 63)

  for (const link of GARDEN_LINKS) {
    const variants = GARDEN_LINK_VARIANTS.filter((variant) => variant.linkId === link.id)
    const sourceChoices = REALM_CONCLUSIONS[link.from].choices
    const targetChoices = REALM_CONCLUSIONS[link.to].choices
    const expectedPairs = new Set(sourceChoices.flatMap((source) => targetChoices.map((target) => `${source.id}|${target.id}`)))
    const actualPairs = new Set(variants.map((variant) => `${variant.sourceAnswerId}|${variant.targetAnswerId}`))

    assert.equal(variants.length, 9, link.id)
    assert.deepEqual(actualPairs, expectedPairs, `${link.id} does not cover its exact answer pairs`)
    assert.equal(new Set(variants.map(({ result }) => result)).size, 9, `${link.id} repeats result copy`)
    assert.deepEqual(
      new Set(variants.map(({ character }) => character)),
      new Set(resolvedCharacters),
      `${link.id} does not give every pair a distinct relation character`,
    )
    for (const variant of variants) {
      const sourceIndex = sourceChoices.findIndex(({ id }) => id === variant.sourceAnswerId)
      const targetIndex = targetChoices.findIndex(({ id }) => id === variant.targetAnswerId)
      assert.equal(
        variant.character,
        resolvedCharacters[sourceIndex * 3 + targetIndex],
        `${link.id} mischaracterizes ${variant.sourceAnswerId} with ${variant.targetAnswerId}`,
      )
    }
  }
})

test('all sixty-three exact answer pairs resolve to their authored copy and visual character', () => {
  for (const variant of GARDEN_LINK_VARIANTS) {
    const definition = GARDEN_LINKS.find(({ id }) => id === variant.linkId)!
    const history: RealmAnswerHistory = {
      [definition.from]: [variant.sourceAnswerId],
      [definition.to]: [variant.targetAnswerId],
    }
    const resolved = gardenLinksForAnswers(history).find(({ id }) => id === variant.linkId)!

    assert.equal(resolved.sourceAnswerId, variant.sourceAnswerId)
    assert.equal(resolved.targetAnswerId, variant.targetAnswerId)
    assert.equal(resolved.result, variant.result)
    assert.equal(resolved.character, variant.character)
    assert.ok(resolved.characterLabel.trim())
    assert.ok(resolved.characterGlyph.trim())
  }

  const incomplete = gardenLinksForAnswers({
    emberlight: [REALM_CONCLUSIONS.emberlight.choices[0].id],
  })
  assert.ok(incomplete.every(({ character, sourceAnswerId, targetAnswerId }) => (
    character === 'latent' && sourceAnswerId === null && targetAnswerId === null
  )))
})

test('full Garden synthesis preserves every selected answer and all seven pair relations without scoring', () => {
  const universeIds = UNIVERSES.map(({ id }) => id as UniverseId)
  const combinations = 3 ** universeIds.length

  for (let combination = 0; combination < combinations; combination += 1) {
    let cursor = combination
    const history: RealmAnswerHistory = {}
    for (const universeId of universeIds) {
      const choice = REALM_CONCLUSIONS[universeId].choices[cursor % 3]
      history[universeId] = [choice.id]
      cursor = Math.floor(cursor / 3)
    }

    const synthesis = gardenSynthesis(history)
    assert.equal(synthesis.complete, true)
    assert.equal(synthesis.echoes.length, 7)
    assert.equal(synthesis.relations.length, 7)
    for (const universeId of universeIds) {
      assert.equal(synthesis.echoes.find((echo) => echo.universeId === universeId)?.answerId, history[universeId]?.[0])
    }
    for (const relation of synthesis.relations) {
      assert.equal(relation.sourceAnswerId, history[relation.from]?.[0])
      assert.equal(relation.targetAnswerId, history[relation.to]?.[0])
      assert.notEqual(relation.character, 'latent')
    }
  }

  const prose = GARDEN_LINK_VARIANTS.map(({ result }) => result).join(' ')
  assert.doesNotMatch(prose, /majority|minority|most often|winning|losing|score|ranked|correct answer|wrong answer/i)
  assert.doesNotMatch(prose, /conquer|collect a deity|command a deity|author(?:ed)? (?:Brahmalok|Vishnulok|Kailash)/i)
})

test('pair-responsive Garden copy is localized with save-stable answer IDs', () => {
  const catalog = buildEnglishCatalog()
  for (const variant of GARDEN_LINK_VARIANTS) {
    const key = `garden.link.${variant.linkId}.variant.${variant.sourceAnswerId}.${variant.targetAnswerId}.result`
    assert.equal(catalog[key], variant.result)
  }
  for (const character of ['latent', ...resolvedCharacters]) {
    assert.ok(catalog[`garden.link-character.${character}`])
  }
})

test('Garden relation controls preserve keyboard, reduced-motion, and narrow-screen contracts', () => {
  const scene = read('../src/ui/GardenScene.svelte')
  assert.deepEqual(compile(scene, { filename: 'GardenScene.svelte', generate: 'client' }).warnings, [])
  assert.match(scene, /<nav class="relation-names" aria-label="Relations among the restored worlds and lokas">/)
  assert.match(scene, /aria-pressed=\{selectedLink\?\.id === link\.id\}/)
  assert.match(scene, /disabled=\{ritual !== 'choice' \|\| !!ending\}/)
  assert.match(scene, /aria-label=\{`Read \$\{link\.name\}: \$\{link\.characterLabel\}\. \$\{link\.result\}`\}/)
  assert.match(scene, /aria-live="polite" aria-label="Selected relation between restored presences"/)
  assert.match(scene, /data-character=\{characterFor\('shared-sky'\)\}/)
  for (const character of resolvedCharacters) {
    assert.match(scene, new RegExp(`\\[data-character='${character}'\\]`), `${character} has no visible line treatment`)
  }
  assert.match(scene, /\.reduced \*, :global\(\[data-motion='reduced'\]\) \.garden-scene \* \{ animation: none !important; transition: none !important; \}/)
  assert.match(scene, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(scene, /\.relation-names \{ position: relative; inset: auto; display: flex;[^}]*overflow-x: auto;/s)
  assert.match(scene, /\.relation-names button \{ position: static; display: inline-flex; flex: 0 0 auto; width: auto; min-height: 2\.75rem;/)
  assert.match(scene, /\.relation-reading \{ position: relative; inset: auto; width: calc\(100% - 2rem\);/)
})
