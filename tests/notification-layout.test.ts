import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { narrowChromeCollisions, planNarrowChrome } from '../src/render/chrome-layout'

test('desktop notifications reserve a lane clear of the Kindling shop and top mechanics', () => {
  const toastPath = new URL('../src/ui/Toasts.svelte', import.meta.url)
  const toastSource = readFileSync(toastPath, 'utf8')
  const toastStateSource = readFileSync(new URL('../src/systems/toasts.svelte.ts', import.meta.url), 'utf8')
  const achievementSource = readFileSync(new URL('../src/systems/achievements.svelte.ts', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const compiled = compile(toastSource, { filename: toastPath.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(toastSource, /class:shop-clear/)
  assert.match(toastSource, /\.toasts\.shop-clear\s*{[^}]*top:\s*3\.6rem;[^}]*right:\s*18rem;/s)
  assert.match(toastSource, /class="achievement-banner instrument-panel"/)
  assert.match(toastSource, /\.achievement-banner\s*{[^}]*top:\s*0\.7rem;[^}]*left:\s*0\.85rem;/s)
  assert.match(toastSource, /queued/)
  assert.match(toastStateSource, /pushAchievementToast/)
  assert.match(toastStateSource, /scheduleAchievementAdvance/)
  assert.match(toastStateSource, /MAX_VISIBLE_TOASTS = 2/)
  assert.match(toastStateSource, /queue: Toast\[\]/)
  assert.match(toastStateSource, /promoteQueuedToasts/)
  assert.match(toastSource, /toastState\.queue\.length/)
  assert.match(achievementSource, /pushAchievementToast\(copy\.name/)
  assert.match(appSource, /<Toasts governed=\{transientGoverned\} clearOfShop=\{hasUi\('shop'\) && !utilityPanelOpen\} \/>/)
  assert.match(toastSource, /class:governed/)
  assert.match(toastSource, /visibleToasts = \$derived\(governed \? toastState\.list\.slice\(0, 1\)/)
})

test('Phase 4 narrow chrome has collision-free lanes at 380, 650, and 800px', () => {
  const viewports = [
    { width: 380, height: 844 },
    { width: 650, height: 900 },
    { width: 800, height: 900 },
  ] as const
  for (const viewport of viewports) {
    assert.deepEqual(narrowChromeCollisions(viewport), [], `${viewport.width}px default chrome`)
    assert.deepEqual(narrowChromeCollisions(viewport, true), [], `${viewport.width}px Lumen history`)
    assert.ok(planNarrowChrome(viewport).some(({ id }) => id === 'shop'))
    assert.ok(planNarrowChrome(viewport, true).some(({ id }) => id === 'lumen-history'))
    assert.ok(!planNarrowChrome(viewport, true).some(({ id }) => id === 'guidance' || id === 'notifications'))
  }
})

test('narrow CSS uses the same single stacking order as the collision planner', () => {
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const shop = readFileSync(new URL('../src/ui/ShopPanel.svelte', import.meta.url), 'utf8')
  const toasts = readFileSync(new URL('../src/ui/Toasts.svelte', import.meta.url), 'utf8')
  const lumen = readFileSync(new URL('../src/ui/LumenTicker.svelte', import.meta.url), 'utf8')
  assert.match(app, /@media \(max-width: 800px\)/)
  assert.match(app, /\.cohesion-stack \{[\s\S]*top: 21\.5rem;/)
  assert.match(shop, /@media \(max-width: 800px\)/)
  assert.match(toasts, /\.achievement-banner \{ top: 8\.2rem;/)
  assert.match(toasts, /\.toasts,\s*\.toasts\.shop-clear \{[\s\S]*top: 14\.5rem;[\s\S]*right: 0\.6rem;/)
  const buffs = readFileSync(new URL('../src/ui/BuffBar.svelte', import.meta.url), 'utf8')
  assert.match(buffs, /\.buffs:not\(\.integrated\) \{ top:11\.5rem;right:\.6rem;/)
  assert.match(toasts, /@media \(max-width: 380px\) \{[\s\S]*\.toasts,\s*\.toasts\.shop-clear \{ width:/)
  assert.match(lumen, /\.lumen-history \{ position: fixed;[\s\S]*top: 11\.5rem;[\s\S]*bottom: 50vh;/)
  assert.match(app, /data-lumen-history='open'/)
  assert.match(toasts, /data-lumen-history='open'/)
})
