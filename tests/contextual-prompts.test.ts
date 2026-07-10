import assert from 'node:assert/strict'
import test from 'node:test'
import {
  disableContextualPrompts,
  describeContextualPrompt,
  dismissContextualPrompt,
  selectContextualPrompt,
  type ContextualPromptCandidate,
  type ContextualPromptState,
} from '../src/experience/contextual-prompts'

const prompts: ContextualPromptCandidate[] = [
  {
    id: 'shop',
    titleKey: 'prompt.shop.title',
    bodyKey: 'prompt.shop.body',
    actionLabelKey: 'prompt.shop.action',
    announcementKey: 'announcement.prompt.shop',
    priority: 10,
    available: true,
  },
  {
    id: 'archive',
    titleKey: 'prompt.archive.title',
    bodyKey: 'prompt.archive.body',
    announcementKey: 'announcement.prompt.archive',
    priority: 20,
    available: true,
  },
  {
    id: 'locked',
    titleKey: 'prompt.locked.title',
    bodyKey: 'prompt.locked.body',
    announcementKey: 'announcement.prompt.locked',
    priority: 100,
    available: false,
  },
]

const initial: ContextualPromptState = { enabled: true, dismissedIds: [] }

test('contextual prompts choose one deterministic available first-use message', () => {
  assert.equal(selectContextualPrompt(prompts, initial).prompt?.id, 'archive')
  assert.equal(selectContextualPrompt([...prompts].reverse(), initial).prompt?.id, 'archive')
})

test('dismissal is immutable, unique, and exposes the next prompt', () => {
  const dismissed = dismissContextualPrompt(initial, 'archive')
  assert.deepEqual(initial.dismissedIds, [])
  assert.deepEqual(dismissed.dismissedIds, ['archive'])
  assert.equal(selectContextualPrompt(prompts, dismissed).prompt?.id, 'shop')
  assert.equal(dismissContextualPrompt(dismissed, 'archive'), dismissed)
})

test('complete off state suppresses every prompt without erasing dismissals', () => {
  const dismissed = dismissContextualPrompt(initial, 'archive')
  const off = disableContextualPrompts(dismissed)
  assert.deepEqual(off, { enabled: false, dismissedIds: ['archive'] })
  assert.deepEqual(selectContextualPrompt(prompts, off), { status: 'off', prompt: null })
  assert.equal(disableContextualPrompts(off), off)
})

test('all dismissed or unavailable prompts produce an explicit empty state', () => {
  const state = { enabled: true, dismissedIds: ['archive', 'shop'] }
  assert.deepEqual(selectContextualPrompt(prompts, state), { status: 'empty', prompt: null })
})

test('selected prompts expose semantic announcement data instead of rendered prose', () => {
  const prompt = selectContextualPrompt(prompts, initial).prompt!
  assert.deepEqual(describeContextualPrompt(prompt), {
    key: 'announcement.prompt.archive',
    parameters: { promptId: 'archive' },
  })
})
