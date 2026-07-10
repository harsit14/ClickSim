import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_CHAPTERS } from '../src/content/guide'
import { TIDEFALL } from '../src/content/universes/tidefall'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import {
  TIDEFALL_CANONICAL_IDENTITY,
  TIDEFALL_V2_COLOR_TOKENS,
} from '../src/content/universes/tidefall/identity'
import { TIDEFALL_PRESENTATION } from '../src/render/tidefall/presentation'
import { planTidefallHeartResponse } from '../src/render/tidefall/heart-response'
import { planUndertowCeremony } from '../src/render/tidefall/undertow-ceremony'

test('Tidefall names are identical across legacy shop, V2 pack, Archive, Heart, and ceremony', () => {
  assert.equal(TIDEFALL.name, TIDEFALL_CANONICAL_IDENTITY.universeName)
  assert.equal(TIDEFALL.shortName, TIDEFALL_CANONICAL_IDENTITY.shortName)
  assert.equal(TIDEFALL.centralObject, TIDEFALL_CANONICAL_IDENTITY.heartName)
  assert.equal(TIDEFALL.currency, TIDEFALL_CANONICAL_IDENTITY.currencyName)
  assert.equal(TIDEFALL_V2_PACK.heart.localName, TIDEFALL_CANONICAL_IDENTITY.heartName)
  assert.equal(TIDEFALL_V2_PACK.archive.localName, TIDEFALL_CANONICAL_IDENTITY.archiveName)
  assert.equal(TIDEFALL_V2_PACK.economy.localPrestige.localName, TIDEFALL_CANONICAL_IDENTITY.epochTurnName)
  assert.equal(TIDEFALL_V2_PACK.economy.localPrestige.rewardCurrency.localName, TIDEFALL_CANONICAL_IDENTITY.epochMatterName)
})

test('Tidefall presentation colors exactly reuse its authored palette tokens', () => {
  assert.equal(TIDEFALL_PRESENTATION.palette.primary, TIDEFALL.palette.vars['--amber'])
  assert.equal(TIDEFALL_PRESENTATION.palette.highlight, TIDEFALL.palette.vars['--gold'])
  assert.equal(TIDEFALL_PRESENTATION.palette.shadow, TIDEFALL.palette.vars['--panel'])
  assert.equal(TIDEFALL_PRESENTATION.palette.void, TIDEFALL.palette.vars['--bg'])
  assert.equal(TIDEFALL_PRESENTATION.palette.secondary, TIDEFALL_V2_COLOR_TOKENS.abyss)
})

test('the current guide identifies Tidefall, its ninety-second tide, and Pelagic Archive', () => {
  const guide = GUIDE_CHAPTERS.flatMap((chapter) => [
    chapter.title,
    chapter.summary,
    ...chapter.blocks.flatMap((block) => [block.heading, ...block.paragraphs, ...(block.bullets ?? []), block.note ?? '']),
  ]).join('\n')
  assert.match(guide, /Tidefall is a moonless cosmic ocean/)
  assert.match(guide, /ninety-second tide/)
  assert.match(guide, /Pelagic Archive/)
})

test('Undertow is a five-phase Moon Salt ceremony with equivalent reduced and low-quality plans', () => {
  const authored = planUndertowCeremony(1_000, { reducedMotion: false, lowQuality: false })
  const reduced = planUndertowCeremony(1_000, { reducedMotion: true, lowQuality: false })
  const low = planUndertowCeremony(1_000, { reducedMotion: false, lowQuality: true })
  assert.equal(authored.localName, 'Undertow')
  assert.equal(authored.rewardName, 'Moon Salt')
  assert.deepEqual(authored.phases.map(({ kind }) => kind), [
    'waterline-withdrawal',
    'current-reversal',
    'pressure-silence',
    'moon-salt-return',
    'low-tide-restart',
  ])
  assert.ok(authored.phases.every(({ presentation }) => presentation === 'authored-motion'))
  assert.ok(reduced.phases.every(({ presentation }) => presentation === 'crossfade'))
  assert.ok(low.phases.every(({ presentation }) => presentation === 'static-pressure-steps'))
  assert.equal(authored.endsAtMs, reduced.endsAtMs)
  assert.equal(authored.endsAtMs, low.endsAtMs)
})

test('Tideheart touch response has three semantic phases and critical/muted-readable identity', () => {
  const base = planTidefallHeartResponse({ startsAtMs: 0, semanticIntensity: 0.8, critical: false, reducedMotion: false })
  const critical = planTidefallHeartResponse({ startsAtMs: 0, semanticIntensity: 0.8, critical: true, reducedMotion: true })
  assert.deepEqual(base.phases.map(({ kind }) => kind), ['pressure-compression', 'nacre-ring', 'current-rebound'])
  assert.equal(base.audioCue, 'tide-click-pressure')
  assert.equal(critical.audioCue, 'tide-critical-crest')
  assert.equal(critical.caption, 'Critical crest')
  assert.ok(critical.phases.every(({ shapeCue }) => shapeCue.length > 0))
  assert.throws(() => planTidefallHeartResponse({ startsAtMs: 0, semanticIntensity: 2, critical: false, reducedMotion: false }), /between zero and one/)
})
