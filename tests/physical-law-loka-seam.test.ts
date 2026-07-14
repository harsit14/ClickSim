import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { CLOCKWORK_REVELATION_BEATS } from '../src/content/universes/clockwork/revelation'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('the Unscheduled Interval contains one explicit entropy-to-first-forms bridge beat', () => {
  assert.deepEqual(CLOCKWORK_REVELATION_BEATS.map(({ id }) => id), [
    'schedule-fault',
    'city-holds',
    'blank-date',
    'witness-arrives',
    'law-thins',
    'forecasts-reclassified',
    'three-loka-seals',
    'passage-remains',
  ])
  const seam = CLOCKWORK_REVELATION_BEATS[4]
  assert.match(seam.prose, /Physical law thins into first forms/)
  assert.match(seam.prose, /not another planet/)
  assert.match(seam.prose, /what remains when heat forgets shape/)
  assert.match(seam.accessibleDescription, /pre-existing first forms/)
  assert.match(seam.reducedMotionIntent, /no sacred figure, portrait, or simulated attribute/)
  assert.deepEqual(seam.revealsRealms, [])
})

test('Lumen explicitly records and discovers the seam without authorship', () => {
  const seam = CLOCKWORK_REVELATION_BEATS.find(({ id }) => id === 'law-thins')!
  assert.match(seam.archiveNote ?? '', /I found the seam/)
  assert.match(seam.archiveNote ?? '', /I did not make what lies beyond it/)
  assert.match(seam.archiveNote ?? '', /without claiming its source/)

  const narrative = [
    ...CLOCKWORK_REVELATION_BEATS.flatMap((beat) => [
      beat.prose,
      beat.visualIntent,
      beat.accessibleDescription,
      beat.archiveNote ?? '',
    ]),
    read('../src/content/guide.ts'),
    read('../src/content/universes/brahmalok/index.ts'),
  ].join(' ')
  assert.match(narrative, /Lumen records the seam/)
  assert.match(narrative, /keep the record, not claim its source/)
  assert.doesNotMatch(narrative, /Lumen (?:made|created|authored|formed) (?:the )?(?:three )?(?:lokas|Brahmalok|Vishnulok|Kailash)/i)
})

test('the physical-law seam is visible, replayable, and accessibility-equivalent', () => {
  const component = read('../src/ui/ClockworkRevelation.svelte')
  assert.deepEqual(compile(component, { filename: 'ClockworkRevelation.svelte', generate: 'client' }).warnings, [])
  assert.match(component, /class="entropy-bridge"/)
  assert.match(component, /PHYSICAL LAW|physical law/)
  assert.match(component, /limit of measurement/)
  assert.match(component, /first forms remain/)
  assert.match(component, /NOT ANOTHER PLANET/)
  assert.match(component, /found · not formed/)
  assert.match(component, /beat\.archiveNote/)
  assert.match(component, /Lumen · archive note/)
  assert.match(component, /aria-hidden=\{!revealFirstForms\}/)
  assert.match(component, /html\[data-motion='reduced'\]/)
})
