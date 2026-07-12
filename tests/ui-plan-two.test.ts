import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('phase one exposes plain labels, contextual trial actions, and readable ceremony chrome', () => {
  const app = read('../src/App.svelte')
  const banner = read('../src/ui/ChallengeBanner.svelte')
  const deep = read('../src/ui/TheDeep.svelte')
  const vault = read('../src/ui/LumenVaultShelf.svelte')
  const crossing = read('../src/ui/CrossingPrelude.svelte')
  const revelation = read('../src/ui/ClockworkRevelation.svelte')

  for (const label of ['Guide', 'Records', 'Options', 'Cabinet', 'Vessel', 'Epoch reset', 'Deep reset', 'Story', 'Legacy']) {
    assert.match(app, new RegExp(`>${label}<`))
  }
  assert.match(app, /activePack\.id === 'prismata' \? '✤' : epochMatterGlyph/)
  assert.match(banner, /<strong>Rule:<\/strong>/)
  assert.match(banner, /<b>Goal:<\/b>/)
  assert.match(banner, /aria-label=\{`Abandon \$\{copy\?\.name/)
  assert.match(deep, /aria-label=\{`Begin \$\{copy\.name\}/)
  assert.match(vault, /Unlock \$\{item\.name\} for \$\{item\.cost\} Lumen Shards/)
  assert.match(crossing, /\.phase-rail small \{[^}]*0\.6875rem/)
  assert.match(revelation, /\.caption small \{[^}]*\.6875rem/)
})

test('phase one Garden questions are persistently readable and keyboard-selectable', () => {
  const garden = read('../src/ui/GardenScene.svelte')
  assert.match(garden, /class="presence-reading"/)
  assert.match(garden, /class="presence-reader"/)
  assert.match(garden, /onfocus=\{\(\) => \(selectedUniverseId = node\.universeId\)\}/)
  assert.match(garden, /\.relation-names span \{[^}]*\.6875rem/)
  assert.match(garden, /figcaption small \{[^}]*\.6875rem/)
  assert.deepEqual(compile(garden, { filename: 'GardenScene.svelte', generate: 'client' }).warnings, [])
})

test('phase two governs transients and clears every visible prior-run channel on wipe', () => {
  const app = read('../src/App.svelte')
  const options = read('../src/ui/OptionsPanel.svelte')
  const suffix = read('../src/ui/NumberSuffixHint.svelte')
  const toasts = read('../src/ui/Toasts.svelte')
  const lumen = read('../src/ui/LumenTicker.svelte')
  const omen = read('../src/ui/FallingStar.svelte')
  const runtime = read('../src/feedback/live-runtime.svelte.ts')

  assert.match(app, /suppressed=\{utilityPanelOpen \|\| storyModalActive \|\| resetPreviewOpen \|\| universeInstrumentActive\}/)
  assert.match(app, /function quietSessionFeedback\(\)[\s\S]*resetSessionFeedback\(\)/)
  assert.match(app, /offlineGainDismissed = true/)
  assert.match(app, /transientResetToken \+= 1/)
  assert.match(options, /onhardreset\?\.\(\)/)
  assert.match(toasts, /visibleToasts = \$derived\(toastState\.list\.slice\(0, 1\)\)/)
  assert.match(lumen, /if \(resetToken === handledResetToken\) return[\s\S]*history = \[\]/)
  assert.match(omen, /if \(resetToken === handledResetToken\) return[\s\S]*bankedEmbers = null/)
  assert.match(runtime, /for \(const timer of purchaseTimers\) clearTimeout\(timer\)/)
  assert.match(suffix, /suppressed/)
})

test('phase three routes Deep and Remembrance through one structured comparison and authored ceremony', () => {
  const app = read('../src/App.svelte')
  const deep = read('../src/ui/TheDeep.svelte')
  const ceremony = read('../src/ui/DeepCollapseCeremony.svelte')
  const codex = read('../src/ui/Codex.svelte')
  const resetCard = read('../src/ui/ResetComparisonCard.svelte')
  const question = read('../src/ui/TheQuestion.svelte')
  const observatory = read('../src/ui/Observatory.svelte')

  assert.match(app, /boundary: 'deep-collapse'[\s\S]*glyph: '◉'[\s\S]*after: format\(addAmounts\(game\.singularities, gain\)\)/)
  assert.match(app, /boundary: 'remembrance'[\s\S]*glyph: '×'[\s\S]*canonicalName: 'All production'/)
  assert.match(app, /<DeepCollapseCeremony doReset=\{resetForDeepCollapse\}/)
  assert.match(deep, /Review \{identity\.collapseName\}/)
  assert.doesNotMatch(deep, /performDeepCollapse/)
  assert.match(ceremony, /Consequence[\s\S]*Crossing[\s\S]*Result/)
  assert.match(ceremony, /class:reduced/)
  assert.match(codex, /Other universes, the Archive, the Between, settings, and the permanent record remain/)
  assert.match(codex, /Review Remembrance/)
  assert.match(resetCard, /model\.reward\.glyph === '×'/)
  assert.doesNotMatch(question, /onpointerdown=.*choose\(choice\.id\)/)
  assert.match(observatory, /observatoryPanel\.scrollTo\(\{ top: 0/)
  assert.match(observatory, /header \{[\s\S]*position: sticky;/)
  assert.deepEqual(compile(ceremony, { filename: 'DeepCollapseCeremony.svelte', generate: 'client' }).warnings, [])
})

test('phase four makes unavailable purchases and goal progress readable without hover', () => {
  const shop = read('../src/ui/ShopPanel.svelte')
  const upgrades = read('../src/ui/UpgradeBar.svelte')
  const lens = read('../src/ui/GoalLens.svelte')
  const app = read('../src/App.svelte')

  assert.match(shop, /No Kindling is affordable yet\./)
  assert.match(shop, /Use the Heart to build toward/)
  assert.match(shop, /role="status"/)
  assert.match(upgrades, /class="target-cue">\{targetCue\(u\)\}/)
  assert.match(lens, /visibleSlots = \$derived\(model\.slots\.filter/)
  assert.match(lens, /class="pace" data-direction=\{rateDirection\}/)
  assert.match(lens, /recommendation\.progress\.current.*recommendation\.progress\.target/s)
  assert.match(app, /window\.setInterval\(sample, 15_000\)/)
  for (const [name, source] of [['ShopPanel.svelte', shop], ['UpgradeBar.svelte', upgrades], ['GoalLens.svelte', lens]] as const) {
    assert.deepEqual(compile(source, { filename: name, generate: 'client' }).warnings, [])
  }
})

test('phase five places actionable import failures beside the invalid field', () => {
  const options = read('../src/ui/OptionsPanel.svelte')
  const save = read('../src/core/save.ts')
  const feedback = read('../src/core/save-import.ts')

  assert.match(options, /importSaveDetailed\(importCode\)/)
  assert.match(options, /describeSaveImportFailure\(result\.failure\)/)
  assert.match(options, /id="save-import-feedback" class="import-error" role="alert"/)
  assert.match(options, /aria-invalid=\{importError \? 'true'/)
  assert.match(save, /export function importSaveDetailed/)
  for (const reason of ['invalid-encoding', 'invalid-json', 'newer-version', 'damaged-save', 'storage-unavailable']) {
    assert.match(feedback, new RegExp(`case '${reason}'`))
  }
  assert.deepEqual(compile(options, { filename: 'OptionsPanel.svelte', generate: 'client' }).warnings, [])
})
