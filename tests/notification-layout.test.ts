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
  assert.match(appSource, /class="notification-lane" aria-label="Notifications"/)
  assert.match(appSource, /\.notification-lane \{[^}]*left: 0\.75rem;[^}]*width: min\(16\.5rem, calc\(50vw - 22\.75rem\)\);/s)
  assert.match(toastSource, /class="achievement-banner instrument-panel"/)
  assert.match(toastSource, /\.achievement-banner\s*{[^}]*position: relative;[^}]*width: 100%;/s)
  assert.match(toastSource, /queued/)
  assert.match(toastStateSource, /pushAchievementToast/)
  assert.match(toastStateSource, /scheduleAchievementAdvance/)
  assert.match(toastStateSource, /MAX_VISIBLE_TOASTS = 1/)
  assert.match(toastStateSource, /queue: Toast\[\]/)
  assert.match(toastStateSource, /promoteQueuedToasts/)
  assert.match(toastSource, /toastState\.queue\.length/)
  assert.match(achievementSource, /pushAchievementToast\(copy\.name/)
  assert.match(appSource, /<aside class="notification-lane"[\s\S]*<NumberSuffixHint[\s\S]*<Toasts governed=\{transientGoverned\}/)
  assert.match(appSource, /<Hud \/>\s*<BuffBar integrated maxVisible=\{2\} \/>/)
  assert.doesNotMatch(appSource, /<Hud \/>\s*<BuffBar \/>/)
  assert.match(toastSource, /class:governed/)
  assert.match(toastSource, /visibleToasts = \$derived\(toastState\.list\.slice\(0, 1\)\)/)
})

test('mobile chrome has collision-free lanes at 380, 650, and 800px', () => {
  const viewports = [
    { width: 380, height: 844 },
    { width: 650, height: 900 },
    { width: 800, height: 900 },
  ] as const
  for (const viewport of viewports) {
    assert.deepEqual(narrowChromeCollisions(viewport), [], `${viewport.width}px default chrome`)
    assert.deepEqual(narrowChromeCollisions(viewport, true), [], `${viewport.width}px Lumen history`)
    assert.deepEqual(narrowChromeCollisions(viewport, false, true), [], `${viewport.width}px active Lumen`)
    assert.deepEqual(narrowChromeCollisions(viewport, false, false, true), [], `${viewport.width}px Kindling drawer`)
    assert.ok(!planNarrowChrome(viewport).some(({ id }) => id === 'shop'))
    assert.ok(planNarrowChrome(viewport, false, false, true).some(({ id }) => id === 'shop'))
    assert.ok(planNarrowChrome(viewport, true).some(({ id }) => id === 'lumen-history'))
    assert.ok(planNarrowChrome(viewport, false, true).some(({ id }) => id === 'lumen'))
    assert.ok(!planNarrowChrome(viewport, false, true).some(({ id }) => id === 'guidance'))
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
  assert.match(app, /--mobile-dock-height: calc\(4\.35rem \+ env\(safe-area-inset-bottom, 0px\)\)/)
  assert.match(app, /\.notification-lane \{[\s\S]*top: 13\.75rem;[\s\S]*right: max\(0\.5rem, env\(safe-area-inset-right, 0px\)\);[\s\S]*left: auto;/)
  // Mobile dock is a two-anchor rail (Kindling + More); overflow stays visible
  // so the Sections sheet, fixed inside the dock, is not clipped above the bar.
  assert.match(app, /\.dock \{[\s\S]*bottom: 0;[\s\S]*justify-content: center;[\s\S]*overflow: visible;/)
  assert.match(app, /\.dock\.sections-open \{ z-index: 9; \}/)
  assert.match(app, /\.dock-btn \{[\s\S]*min-height: 3\.35rem;/)
  // Sections sheet: a modal bottom sheet of section tiles above the bar.
  assert.match(app, /id="mobile-more-button"[\s\S]*aria-controls="dock-sections"[\s\S]*aria-expanded=\{sectionsOpen\}/)
  assert.match(app, /id="dock-sections"[\s\S]*aria-modal=\{sectionsOpen \? 'true' : undefined\}/)
  assert.match(app, /\.dock\.sections-open \.dock-sections \{[\s\S]*transform: translateY\(0\);/)
  assert.match(app, /class="sections-scrim"[\s\S]*onclick=\{closeSections\}[\s\S]*tabindex="-1"/)
  assert.match(app, /\.game-shell\.sections-open \.notification-lane/)
  assert.match(app, /class:shop-collapsed=\{shopCollapsed\}/)
  assert.match(app, /class:shop-absent=\{!hasUi\('shop'\)\}/)
  assert.match(app, /const initialMobileLayout = window\.innerWidth <= MOBILE_BREAKPOINT[\s\S]*let shopCollapsed = \$state\(initialMobileLayout\)/)
  assert.match(app, /id="mobile-kindling-button"[\s\S]*aria-controls="kindling-shop"[\s\S]*aria-expanded=\{!shopCollapsed\}/)
  assert.match(shop, /bottom: calc\(var\(--mobile-dock-height/)
  assert.match(shop, /\.shop\.collapsed \{[\s\S]*translateX\(calc\(100% \+ 1rem\)\);[\s\S]*pointer-events: none;/)
  assert.match(shop, /class="shop-content" inert=\{collapsed\} aria-hidden=\{collapsed\}/)
  assert.match(shop, /class="shop-scrim"[\s\S]*onclick=\{closeShop\}[\s\S]*tabindex="-1"/)
  assert.match(shop, /role=\{mobile \? 'dialog' : undefined\}[\s\S]*aria-modal=\{mobile && !collapsed \? 'true' : undefined\}/)
  assert.match(shop, /function trapMobileShopFocus\(event: KeyboardEvent\)/)
  assert.match(shop, /min-height: 2\.75rem;/)
  assert.match(toasts, /\.achievement-banner \{ width: 100%; animation: none;/)
  assert.match(toasts, /\.toasts,\s*\.toasts\.shop-clear \{ width: 100%; \}/)
  const buffs = readFileSync(new URL('../src/ui/BuffBar.svelte', import.meta.url), 'utf8')
  assert.match(buffs, /\.buffs:not\(\.integrated\) \{ top:11\.5rem;right:\.6rem;/)
  assert.match(toasts, /@media \(max-width: 380px\) \{[\s\S]*\.toasts,\s*\.toasts\.shop-clear \{ width:/)
  assert.match(lumen, /\.lumen-shell \{ bottom: var\(--mobile-transient-bottom, 41vh\);/)
  assert.match(lumen, /\.lumen-history \{[\s\S]*position: fixed;[\s\S]*bottom: var\(--mobile-history-bottom/)
  assert.match(app, /data-lumen-history='open'/)
  assert.match(toasts, /data-lumen-history='open'/)
})
