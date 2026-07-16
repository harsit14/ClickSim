import assert from 'node:assert/strict'
import test from 'node:test'
import {
  REALM_ANSWER_IDS,
  REALM_CHOICE_CALLBACKS,
  REALM_CONCLUSIONS,
  callbackForRealm,
  type RealmAnswerHistory,
} from '../src/content/endings'
import { SAGA_LUMEN_LINES } from '../src/content/saga-lumen'
import { storyLinesForUniverse } from '../src/content/story-lines'
import {
  UNIVERSES,
  V2_UNIVERSE_BY_ID,
  type UniverseId,
} from '../src/content/universes'
import {
  GARDEN_NODES,
  gardenCredits,
  gardenNodesForAnswers,
  gardenSynthesis,
} from '../src/endgame/garden'

const realmIds = UNIVERSES.map(({ id }) => id as UniverseId)
const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')

test('seven realm conclusions contain twenty-one distinct authored answers', () => {
  assert.equal(Object.keys(REALM_CONCLUSIONS).length, 7)
  assert.deepEqual(Object.keys(REALM_CONCLUSIONS), realmIds)
  assert.equal(REALM_ANSWER_IDS.length, 21)
  assert.equal(new Set(REALM_ANSWER_IDS).size, 21)

  const questions = new Set<string>()
  const optionSetFingerprints = new Set<string>()
  const collectedAnswerIds: string[] = []

  for (const universeId of realmIds) {
    const conclusion = REALM_CONCLUSIONS[universeId]
    assert.equal(conclusion.universeId, universeId)
    assert.equal(conclusion.choices.length, 3)

    const optionIds = conclusion.choices.map(({ id }) => id)
    const optionLabels = conclusion.choices.map(({ label }) => normalize(label))
    assert.equal(new Set(optionIds).size, 3, `${universeId} repeats an option ID`)
    assert.equal(new Set(optionLabels).size, 3, `${universeId} repeats an option label`)
    collectedAnswerIds.push(...optionIds)

    const question = normalize(conclusion.question)
    assert.ok(question.length > 0, `${universeId} has no final Question`)
    assert.equal(questions.has(question), false, `${universeId} repeats another realm's Question`)
    questions.add(question)

    const optionSet = [...optionLabels].sort().join('|')
    assert.equal(
      optionSetFingerprints.has(optionSet),
      false,
      `${universeId} repeats another realm's visible option set`,
    )
    optionSetFingerprints.add(optionSet)
  }

  assert.equal(questions.size, 7)
  assert.equal(optionSetFingerprints.size, 7)
  assert.deepEqual(collectedAnswerIds, REALM_ANSWER_IDS)
})

test('V2 realm registries use the conclusion Question as their civilization Question', () => {
  assert.equal(V2_UNIVERSE_BY_ID.size, 7)
  for (const universeId of realmIds) {
    const pack = V2_UNIVERSE_BY_ID.get(universeId)
    assert.ok(pack, `${universeId} is missing from the V2 registry`)
    assert.equal(pack.identity.civilizationQuestion, REALM_CONCLUSIONS[universeId].question)
    assert.equal(pack.story.civilizationQuestion, REALM_CONCLUSIONS[universeId].question)
  }
})

test('eighteen immediate callbacks carry every prior answer into the next realm', () => {
  assert.equal(REALM_CHOICE_CALLBACKS.length, 18)
  assert.equal(new Set(REALM_CHOICE_CALLBACKS.map(({ id }) => id)).size, 18)

  const expectedCallbackKeys = new Set<string>()
  for (let index = 1; index < realmIds.length; index += 1) {
    const sourceUniverseId = realmIds[index - 1]
    const targetUniverseId = realmIds[index]
    const sourceChoices = REALM_CONCLUSIONS[sourceUniverseId].choices
    const transitionCallbacks = REALM_CHOICE_CALLBACKS.filter((callback) => (
      callback.sourceUniverseId === sourceUniverseId
      && callback.targetUniverseId === targetUniverseId
    ))

    assert.equal(transitionCallbacks.length, 3, `${sourceUniverseId} -> ${targetUniverseId}`)
    assert.deepEqual(
      new Set(transitionCallbacks.map(({ sourceAnswerId }) => sourceAnswerId)),
      new Set(sourceChoices.map(({ id }) => id)),
    )

    for (const choice of sourceChoices) {
      const history: RealmAnswerHistory = { [sourceUniverseId]: [choice.id] }
      const callback = callbackForRealm(targetUniverseId, history)
      assert.ok(callback, `${choice.id} has no callback in ${targetUniverseId}`)
      assert.equal(callback.sourceUniverseId, sourceUniverseId)
      assert.equal(callback.sourceAnswerId, choice.id)
      assert.ok(callback.completionLine.trim())
      assert.ok(callback.lumenLine.trim())
      expectedCallbackKeys.add(`${sourceUniverseId}|${targetUniverseId}|${choice.id}`)
    }
  }

  const actualCallbackKeys = new Set(REALM_CHOICE_CALLBACKS.map((callback) => (
    `${callback.sourceUniverseId}|${callback.targetUniverseId}|${callback.sourceAnswerId}`
  )))
  assert.deepEqual(actualCallbackKeys, expectedCallbackKeys)
})

test('Garden synthesis carries all seven selections into dynamic realm offerings', () => {
  const selected = new Map(realmIds.map((universeId, index) => {
    const choice = REALM_CONCLUSIONS[universeId].choices[index % 3]
    return [universeId, choice] as const
  }))
  const history = Object.fromEntries(
    [...selected].map(([universeId, choice]) => [universeId, [choice.id]]),
  ) as RealmAnswerHistory

  const synthesis = gardenSynthesis(history)
  assert.equal(synthesis.complete, true)
  assert.equal(synthesis.echoes.length, 7)
  assert.deepEqual(synthesis.echoes.map(({ universeId }) => universeId), realmIds)
  assert.match(synthesis.opening, new RegExp(selected.get('emberlight')!.label))
  assert.match(synthesis.opening, new RegExp(selected.get('tidefall')!.label))
  assert.match(synthesis.pattern, new RegExp(selected.get('verdance')!.label))
  assert.match(synthesis.pattern, new RegExp(selected.get('clockwork')!.label))
  assert.match(synthesis.tension, new RegExp(selected.get('brahmalok')!.label))
  assert.match(synthesis.tension, new RegExp(selected.get('vishnulok')!.label))
  assert.match(synthesis.tension, new RegExp(selected.get('kailash')!.label))
  assert.doesNotMatch(
    `${synthesis.opening} ${synthesis.pattern} ${synthesis.tension}`,
    /most often|majority|leading doctrine|winning doctrine/i,
  )

  for (const echo of synthesis.echoes) {
    const choice = selected.get(echo.universeId)!
    assert.equal(echo.answerId, choice.id)
    assert.equal(echo.answerLabel, choice.label)
    assert.equal(echo.lawName, choice.lawName)
    assert.equal(echo.offering, choice.gardenEcho)
  }

  const nodes = gardenNodesForAnswers(history)
  assert.equal(nodes.length, 7)
  for (const node of nodes) {
    const choice = selected.get(node.universeId)!
    const staticNode = GARDEN_NODES.find(({ universeId }) => universeId === node.universeId)!
    assert.equal(node.question, REALM_CONCLUSIONS[node.universeId].question)
    assert.equal(node.offering, choice.gardenEcho)
    assert.notEqual(node.offering, staticNode.offering)
  }

  const credits = gardenCredits('continue', history)
  for (const node of nodes) assert.ok(credits.includes(`${node.name} — ${node.offering}`))
  assert.doesNotMatch(credits.join(' '), /most often|majority|leading doctrine|winning doctrine/i)

  const incompleteHistory = { ...history }
  delete incompleteHistory.kailash
  const incomplete = gardenSynthesis(incompleteHistory)
  assert.equal(incomplete.complete, false)
  assert.equal(incomplete.echoes.length, 6)
})

test('the shared story resolver archives every saga callback line in its target realm', () => {
  assert.equal(SAGA_LUMEN_LINES.length, 18)
  const sagaIds = new Set(SAGA_LUMEN_LINES.map(({ id }) => id))
  assert.equal(sagaIds.size, 18)

  for (const callback of REALM_CHOICE_CALLBACKS) {
    const expectedId = `saga-${callback.id}`
    const resolved = storyLinesForUniverse(callback.targetUniverseId)
    const line = resolved.find(({ id }) => id === expectedId)
    assert.ok(line, `${expectedId} is absent from ${callback.targetUniverseId}'s story resolver`)
    assert.equal(line.text, callback.lumenLine)
  }

  for (const universeId of realmIds) {
    const expectedIds = REALM_CHOICE_CALLBACKS
      .filter(({ targetUniverseId }) => targetUniverseId === universeId)
      .map(({ id }) => `saga-${id}`)
      .sort()
    const resolvedIds = storyLinesForUniverse(universeId)
      .map(({ id }) => id)
      .filter((id) => sagaIds.has(id))
      .sort()
    assert.deepEqual(resolvedIds, expectedIds, universeId)
  }
})
