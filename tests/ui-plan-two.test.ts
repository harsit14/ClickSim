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
  assert.match(app, /function clearAllTransientUi\(\)[\s\S]*resetSessionFeedback\(\)/)
  assert.match(app, /offlineGainDismissed = true/)
  assert.match(app, /transientResetToken \+= 1/)
  assert.match(options, /onhardreset\?\.\(\)/)
  assert.match(toasts, /visibleToasts = \$derived\(governed \? toastState\.list\.slice\(0, 1\)/)
  assert.match(lumen, /if \(resetToken === handledResetToken\) return[\s\S]*history = \[\]/)
  assert.match(omen, /if \(resetToken === handledResetToken\) return[\s\S]*bankedEmbers = null/)
  assert.match(runtime, /for \(const timer of purchaseTimers\) clearTimeout\(timer\)/)
  assert.match(suffix, /suppressed/)
})
