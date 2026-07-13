<script lang="ts">
  import { shownAt, teasedAt, type GeneratorDef } from '../content/generators'
  import { universeById, universeV2ById } from '../content/universes'
  import {
    unitRate,
    bulkCost,
    maxAffordable,
    costMultOf,
    costScaleOf,
    genDisabled,
    genPurchaseDisabled,
    challengeMods,
    totalRate,
  } from '../engine/compute'
  import { game, hasUi, buyGenerator, type BuyAmount } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'
  import type { EconomyAmount } from '../content/universes/types'
  import { amountFromNumber, gteAmount, ltAmount } from '../core/numeric/amount'
  import { subtractAmounts, ZERO_AMOUNT } from '../core/numeric/amount'
  import { completedGeneratorPurchaseFeedback } from '../feedback'
  import { publishLivePurchase } from '../feedback/live-runtime.svelte'
  import {
    verdanceGeneratorCohortStatus,
    type VerdanceGeneratorCohortStatus,
  } from '../content/universes/verdance'
  import { resolveVisualQuality } from '../core/preferences'
  import KindlingShopArt from './KindlingShopArt.svelte'

  const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

  let {
    suppressed = false,
    collapsed = $bindable(false),
    mobile = false,
    onmobileclose,
  }: {
    suppressed?: boolean
    collapsed?: boolean
    mobile?: boolean
    onmobileclose?: () => void
  } = $props()

  let shopElement = $state<HTMLElement | null>(null)

  const visible = $derived(hasUi('shop'))
  const pack = $derived(universeById(game.activeUniverse))
  const v2Pack = $derived(universeV2ById(game.activeUniverse))
  const generators = $derived(pack.generators)
  const shown = $derived(generators.filter((g) => gteAmount(game.totalEarned, amountFromNumber(shownAt(g)))))
  const teased = $derived(
    generators.find((g) => ltAmount(game.totalEarned, amountFromNumber(shownAt(g))) && gteAmount(game.totalEarned, amountFromNumber(teasedAt(g)))),
  )
  const zeroAffordable = $derived(shown.length > 0 && !shown.some((generator) => {
    const planned = purchase(generator)
    return !genPurchaseDisabled(game, generator) && gteAmount(game.light, planned.cost)
  }))
  const nextKindlingCost = $derived(shown
    .filter((generator) => !genPurchaseDisabled(game, generator))
    .map((generator) => purchase(generator).cost)
    .sort((left, right) => ltAmount(left, right) ? -1 : ltAmount(right, left) ? 1 : 0)[0] ?? null)

  function purchase(g: GeneratorDef): { count: number; cost: EconomyAmount } {
    const owned = game.owned[g.id] ?? 0
    const mult = costMultOf(game, g)
    const scale = costScaleOf(game)
    let count =
      game.buyAmount === 'max'
        ? Math.max(1, maxAffordable(g, owned, game.light, mult, scale))
        : game.buyAmount
    const cap = challengeMods(game).maxOwnedPerGen
    if (cap !== undefined) count = Math.min(count, Math.max(0, cap - owned))
    return { count, cost: bulkCost(g, owned, count, mult, scale) }
  }

  function tryBuy(g: GeneratorDef) {
    const ownedBefore = game.owned[g.id] ?? 0
    const planned = purchase(g)
    const beforeRate = totalRate(game)
    const occurredAtMs = performance.now()
    const bought = buyGenerator(g)
    if (bought <= 0) return
    if (!v2Pack) {
      playBuy(1, game.activeUniverse, bought)
      return
    }

    const exactCost = bought === planned.count
      ? planned.cost
      : bulkCost(g, ownedBefore, bought, costMultOf(game, g), costScaleOf(game))
    const afterRate = totalRate(game)
    const rateDelta = gteAmount(afterRate, beforeRate)
      ? subtractAmounts(afterRate, beforeRate)
      : ZERO_AMOUNT
    const feedback = completedGeneratorPurchaseFeedback({
      pack: v2Pack,
      generator: g,
      ownedBefore,
      quantity: bought,
      totalCost: exactCost,
      rateDelta,
      occurredAtMs,
    })
    publishLivePurchase(feedback.event, v2Pack, {
      audio: { silence: game.sfxVolume <= 0 },
      visual: {
        reducedMotion: game.motionPreference === 'reduced',
        quality: resolveVisualQuality(game.visualQuality, {
          width: window.innerWidth,
          devicePixelRatio: window.devicePixelRatio || 1,
          hardwareConcurrency: navigator.hardwareConcurrency || 8,
        }),
        milestoneThreshold: feedback.milestoneThreshold,
      },
    })
  }

  function cohortTiming(status: VerdanceGeneratorCohortStatus): string {
    if (status.nextStageInMs === null) return 'maximum age'
    const minutes = Math.max(1, Math.ceil(status.nextStageInMs / 60_000))
    if (minutes < 60) return `next ring in ${minutes}m`
    const hours = Math.ceil(minutes / 60)
    return `next ring in ${hours}h`
  }

  function ownershipThreshold(count: number): 0 | 1 | 10 | 25 | 50 | 100 {
    if (count >= 100) return 100
    if (count >= 50) return 50
    if (count >= 25) return 25
    if (count >= 10) return 10
    if (count >= 1) return 1
    return 0
  }

  function toggleCollapsed() {
    if (collapsed) {
      collapsed = false
      return
    }
    collapsed = true
    onmobileclose?.()
  }

  function closeShop() {
    collapsed = true
    onmobileclose?.()
  }

  function trapMobileShopFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !mobile || collapsed || suppressed || !shopElement) return
    const focusable = Array.from(shopElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
</script>

<svelte:window onkeydown={trapMobileShopFocus} />

{#if visible && !suppressed}
  {#if !collapsed}
    <button class="shop-scrim" type="button" onclick={closeShop} aria-hidden="true" tabindex="-1"></button>
  {/if}
  <aside
    bind:this={shopElement}
    id="kindling-shop"
    class="shop instrument-panel"
    class:collapsed
    data-realm={pack.id}
    role={mobile ? 'dialog' : undefined}
    aria-modal={mobile && !collapsed ? 'true' : undefined}
    aria-label="Kindling shop"
  >
    <button
      type="button"
      class="retract"
      class:collapsed
      onclick={toggleCollapsed}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'open kindling shop' : 'hide kindling shop'}
      title={collapsed ? 'Open kindling' : 'Hide kindling'}
    >
      <span class="retract-glyph" aria-hidden="true">{collapsed ? '‹' : '›'}</span>
      <span class="mobile-close-glyph" aria-hidden="true">×</span>
      <span class="retract-label">{collapsed ? 'Kindling' : 'Close'}</span>
    </button>
    <div class="shop-content" inert={collapsed} aria-hidden={collapsed}>
      <header>
        <h2>Kindling</h2>
        {#if hasUi('bulk')}
          <div class="amounts" role="group" aria-label="bulk purchase amount" aria-keyshortcuts="B">
            {#each AMOUNTS as a (a)}
              <button
                class="amt"
                data-buy-mode={a}
                class:active={game.buyAmount === a}
                aria-label={a === 'max' ? 'maximum' : `buy ${a}`}
                aria-pressed={game.buyAmount === a}
                onclick={() => (game.buyAmount = a)}
              >
                {a === 'max' ? 'max' : '×' + a}
              </button>
            {/each}
          </div>
        {/if}
      </header>
      {#if zeroAffordable}
        <div class="shop-state" role="status">
          <strong>No Kindling is affordable yet.</strong>
          {#if game.challenge !== null && nextKindlingCost === null}
            <span>This trial currently pauses or limits every purchase. Follow the trial rule shown above.</span>
          {:else if nextKindlingCost}
            <span>Use the Heart to build toward {pack.currencyGlyph} {format(nextKindlingCost)}.</span>
          {:else}
            <span>Use the Heart to earn more {pack.currency}.</span>
          {/if}
        </div>
      {/if}
      <div class="rows">
        {#each shown as g (g.id)}
        {@const p = purchase(g)}
        {@const owned = game.owned[g.id] ?? 0}
        {@const artThreshold = ownershipThreshold(owned)}
        {@const cohort = pack.id === 'verdance' ? verdanceGeneratorCohortStatus(g.id, owned, game.numericLawState) : null}
        <button
          class="row"
          data-generator-id={g.id}
          data-ownership-threshold={artThreshold}
          class:affordable={!ltAmount(game.light, p.cost) && !genPurchaseDisabled(game, g)}
          class:unaffordable={ltAmount(game.light, p.cost) || genPurchaseDisabled(game, g)}
          aria-disabled={ltAmount(game.light, p.cost) || genPurchaseDisabled(game, g)}
          onclick={() => tryBuy(g)}
          title={genDisabled(game, g)
            ? 'silenced by the trial'
            : genPurchaseDisabled(game, g)
              ? 'limited by the trial'
              : cohort
                ? `${g.flavor} — ${cohort.stageLabel} cohort, production ×${cohort.multiplier.toFixed(2)}, ${cohortTiming(cohort)}`
                : g.flavor}
        >
          {#key `${pack.id}-${g.id}-${artThreshold}`}
            <span class="kindling-icon" class:state-glint={owned > 0} style:--hue={g.hue}>
              <KindlingShopArt universeId={pack.id} generatorId={g.id} tier={g.tier} label={g.name} />
            </span>
          {/key}
          <span class="info">
            <span class="name">
              <span class="name-label">{g.name}</span>
              {#if p.count > 1}<small>×{p.count}</small>{/if}
            </span>
            <span class="meta">{pack.currencyGlyph} {format(p.cost)} · +{format(unitRate(game, g))}/s</span>
            {#if cohort && owned > 0}
              <span class="cohort">{cohort.stageLabel} · ×{cohort.multiplier.toFixed(2)} · {cohortTiming(cohort)}</span>
            {/if}
          </span>
          <span class="owned">{owned || ''}</span>
        </button>
        {/each}
        {#if teased}
          <div class="row teased">
            <span class="dot mystery"></span>
            <span class="info"><span class="name"><span class="name-label">???</span></span></span>
          </div>
        {/if}
      </div>
    </div>
  </aside>
{/if}

<style>
  .shop {
    --shop-etch: linear-gradient(90deg, transparent, var(--amber), transparent);
    position: fixed;
    top: 50%;
    right: 1.25rem;
    transform: translateY(-50%);
    width: 16.5rem;
    max-height: 78vh;
    display: flex;
    flex-direction: column;
    padding: 1rem 0.9rem 0.6rem;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--amber) 8%, transparent), transparent 34%),
      color-mix(in srgb, var(--glass) 94%, var(--panel));
    border-color: color-mix(in srgb, var(--amber) 24%, var(--glass-border));
    border-radius: 14px;
    backdrop-filter: blur(10px);
    box-shadow:
      inset 3px 0 color-mix(in srgb, var(--amber) 32%, transparent),
      0 1.2rem 3rem rgba(0, 0, 0, 0.24);
    animation: shop-in 0.24s ease both;
    transition: transform 0.32s ease, opacity 0.2s ease, border-color 0.2s ease;
    z-index: 6;
  }
  .shop-content {
    min-height: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .shop-scrim,
  .mobile-close-glyph { display: none; }
  .shop::before {
    content: '';
    position: absolute;
    top: 0.32rem;
    right: 0.7rem;
    left: 0.7rem;
    height: 3px;
    background: var(--shop-etch);
    opacity: 0.72;
    pointer-events: none;
  }
  .shop[data-realm='emberlight'] {
    --shop-etch: linear-gradient(90deg, transparent 2%, var(--amber) 28% 34%, transparent 35% 49%, var(--amber) 50% 56%, transparent 57% 71%, var(--amber) 72% 78%, transparent 98%);
  }
  .shop[data-realm='tidefall'] {
    --shop-etch: repeating-linear-gradient(105deg, transparent 0 0.65rem, var(--amber) 0.68rem 0.78rem, transparent 0.81rem 1.45rem);
  }
  .shop[data-realm='verdance'] {
    --shop-etch: radial-gradient(ellipse at center, var(--amber) 0 18%, transparent 20%) 0 0 / 1.35rem 0.36rem repeat-x;
  }
  .shop[data-realm='clockwork'] {
    --shop-etch: repeating-linear-gradient(90deg, var(--amber) 0 0.28rem, transparent 0.28rem 0.52rem, var(--amber) 0.52rem 0.58rem, transparent 0.58rem 1.18rem);
  }
  .shop[data-realm='brahmalok'] {
    --shop-etch: repeating-linear-gradient(135deg, transparent 0 0.42rem, var(--amber) 0.45rem 0.52rem, transparent 0.55rem 0.95rem);
  }
  .shop[data-realm='vishnulok'] {
    --shop-etch: radial-gradient(circle at center, transparent 0 34%, var(--amber) 37% 48%, transparent 51%) 0 0 / 1.25rem 0.62rem repeat-x;
  }
  .shop[data-realm='kailash'] {
    --shop-etch: linear-gradient(90deg, transparent 3%, var(--amber) 3% 17%, transparent 17% 22%, var(--amber) 22% 38%, transparent 38% 43%, var(--amber) 43% 60%, transparent 60% 65%, var(--amber) 65% 82%, transparent 82% 87%, var(--amber) 87% 97%, transparent 97%);
  }
  .shop.collapsed {
    transform: translateY(-50%) translateX(calc(100% + 0.9rem));
    opacity: 0.82;
    border-color: rgba(255, 179, 92, 0.08);
  }
  @keyframes shop-in {
    from { opacity: 0; translate: 16px 0; }
    to { opacity: 1; translate: 0 0; }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.7rem;
  }
  .retract {
    position: absolute;
    top: 50%;
    left: -1.75rem;
    width: 1.75rem;
    height: 4rem;
    transform: translateY(-50%);
    display: grid;
    place-items: center;
    padding: 0;
    color: var(--gold);
    background: rgba(20, 18, 32, 0.82);
    border: 1px solid rgba(255, 179, 92, 0.18);
    border-right: none;
    border-radius: 10px 0 0 10px;
    box-shadow: 0 0 20px rgba(255, 179, 92, 0.08);
    cursor: pointer;
    font: inherit;
    font-size: 1.05rem;
    font-weight: 700;
    backdrop-filter: blur(10px);
  }
  .retract:hover {
    color: #fff1d0;
    border-color: rgba(255, 179, 92, 0.36);
  }
  .retract.collapsed {
    box-shadow: 0 0 26px rgba(255, 179, 92, 0.14);
  }
  .retract-label { display: none; }
  h2 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .amounts {
    display: flex;
    gap: 0.2rem;
  }
  .shop-state {
    display: grid;
    gap: 0.2rem;
    margin: 0 0 0.6rem;
    padding: 0.62rem 0.68rem;
    color: var(--dim);
    background: color-mix(in srgb, var(--panel) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--amber) 16%, transparent);
    border-radius: 0.55rem;
    font-size: 0.72rem;
    line-height: 1.35;
  }
  .shop-state strong { color: var(--text); font-size: 0.76rem; }
  .amt {
    min-width: 1.5rem;
    min-height: 1.5rem;
    padding: 0.15rem 0.42rem;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--dim);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 6px;
    cursor: pointer;
  }
  .amt.active {
    color: #1a1206;
    background: var(--amber);
    border-color: var(--amber);
  }
  .rows {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
  }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.55rem 0.6rem;
    margin-bottom: 0.4rem;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    color: var(--text);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.06s;
  }
  .row:not(.teased):not(.unaffordable) {
    background: color-mix(in srgb, var(--amber) 5%, rgba(255, 255, 255, 0.025));
    box-shadow: inset 0 0 1.1rem color-mix(in srgb, var(--amber) 12%, transparent);
  }
  .row.affordable {
    border-color: color-mix(in srgb, var(--amber) 34%, rgba(255, 255, 255, 0.08));
    box-shadow: inset 3px 0 color-mix(in srgb, var(--amber) 58%, transparent), inset 0 0 1.1rem color-mix(in srgb, var(--amber) 12%, transparent);
  }
  .row.affordable::after {
    content: '';
    position: absolute;
    top: 0.38rem;
    right: 0.42rem;
    width: 0.32rem;
    height: 0.32rem;
    border: 1px solid color-mix(in srgb, var(--amber) 78%, white);
    transform: rotate(45deg);
    opacity: 0.72;
  }
  .row:not(.teased):not(.unaffordable):hover {
    background: rgba(255, 179, 92, 0.09);
    border-color: rgba(255, 179, 92, 0.3);
  }
  .row:not(.teased):not(.unaffordable):active {
    transform: translateY(1px) scale(0.985);
    background: color-mix(in srgb, var(--amber) 14%, rgba(255, 255, 255, 0.025));
    box-shadow: inset 0 0.24rem 0.55rem rgba(0, 0, 0, 0.34), inset 3px 0 color-mix(in srgb, var(--amber) 72%, transparent);
  }
  .kindling-icon { transition: transform 70ms ease, filter 120ms ease; }
  .row:not(.teased):not(.unaffordable):active .kindling-icon { transform: translateY(1px) scale(0.94); filter: brightness(1.18); }
  .row.unaffordable {
    opacity: 1;
    color: color-mix(in srgb, var(--text) 45%, var(--bg));
    background:
      linear-gradient(132deg, transparent 0 48%, color-mix(in srgb, var(--dim) 8%, transparent) 49% 50%, transparent 51%) 0 0 / 2.8rem 2.8rem,
      color-mix(in srgb, var(--bg) 84%, var(--panel));
    border-color: color-mix(in srgb, var(--dim) 8%, transparent);
    box-shadow: inset 0 0 1.2rem rgba(0, 0, 0, 0.28);
    cursor: default;
  }
  .row.unaffordable .meta,
  .row.unaffordable .cohort { color: color-mix(in srgb, var(--dim) 45%, var(--bg)); }
  .row.unaffordable .owned { color: color-mix(in srgb, var(--amber) 45%, var(--bg)); }
  .row.teased {
    opacity: 0.35;
    cursor: default;
  }
  :global(html[data-motion='reduced']) .row,
  :global(html[data-motion='reduced']) .kindling-icon { transition: none; }
  :global(html[data-motion='reduced']) .row:not(.teased):not(.unaffordable):active { transform: none; }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: hsl(var(--hue, 38), 90%, 65%);
    box-shadow: 0 0 8px hsla(var(--hue, 38), 90%, 65%, 0.7);
  }
  .dot.mystery {
    background: #3a374d;
    box-shadow: none;
  }
  .kindling-icon {
    position: relative;
    flex: none;
    width: 0.95rem;
    height: 0.95rem;
    color: hsl(var(--hue, 38), 88%, 68%);
    filter: drop-shadow(0 0 0.24rem hsla(var(--hue, 38), 90%, 62%, 0.34));
  }
  .kindling-icon.state-glint::after {
    content: '';
    position: absolute;
    inset: -0.1rem;
    border-radius: 50%;
    border-top: 1px solid rgba(255, 241, 205, 0.8);
    animation: state-glint 520ms ease-out both;
  }
  @keyframes state-glint { from { opacity: 1; transform: scale(0.55) rotate(-50deg); } to { opacity: 0; transform: scale(1.25) rotate(25deg); } }
  .info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .name {
    display: flex;
    align-items: baseline;
    gap: 0.28rem;
    min-width: 0;
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.12;
  }
  .name-label {
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .name small {
    flex: none;
    white-space: nowrap;
    color: var(--amber);
    font-weight: 700;
  }
  .meta {
    font-size: 0.74rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .cohort {
    margin-top: 0.08rem;
    color: color-mix(in srgb, var(--gold) 66%, var(--dim));
    font-size: 0.6875rem;
    font-weight: 650;
    letter-spacing: 0.045em;
    text-transform: uppercase;
  }
  .owned {
    font-size: 1.15rem;
    font-weight: 650;
    color: var(--amber);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 800px) {
    .shop-scrim {
      position: fixed;
      inset: 0 0 var(--mobile-dock-height, calc(4.35rem + env(safe-area-inset-bottom, 0px))) 0;
      z-index: 8;
      display: block;
      padding: 0;
      background: rgba(2, 3, 9, 0.56);
      border: 0;
      backdrop-filter: blur(2px);
      animation: scrim-in 180ms ease both;
    }
    .shop {
      top: max(0.45rem, env(safe-area-inset-top, 0px));
      right: max(0.4rem, env(safe-area-inset-right, 0px));
      bottom: calc(var(--mobile-dock-height, calc(4.35rem + env(safe-area-inset-bottom, 0px))) + 0.4rem);
      left: auto;
      width: min(27rem, calc(100vw - 0.8rem - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
      transform: none;
      max-height: none;
      padding: 1rem 0.75rem 0.65rem;
      border-radius: 18px;
      box-shadow: inset 3px 0 color-mix(in srgb, var(--amber) 26%, transparent), -1rem 0 3rem rgba(0, 0, 0, 0.4);
      transition: transform 0.28s ease, opacity 0.2s ease, visibility 0s;
      z-index: 9;
    }
    .shop.collapsed {
      transform: translateX(calc(100% + 1rem));
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.28s ease, opacity 0.2s ease, visibility 0s 0.28s;
    }
    .retract {
      top: 0.55rem;
      right: 0.55rem;
      left: auto;
      width: 5.8rem;
      min-height: 2.75rem;
      height: 2.75rem;
      transform: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      color: color-mix(in srgb, var(--gold) 86%, white);
      background: color-mix(in srgb, var(--glass) 96%, var(--panel));
      border: 1px solid color-mix(in srgb, var(--amber) 34%, transparent);
      border-radius: 12px;
      box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
    }
    .retract.collapsed { display: none; }
    .retract-glyph { display: none; }
    .mobile-close-glyph { display: inline; font-size: 1.1rem; line-height: 1; }
    .retract-label { display: inline; }
    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.55rem;
      min-height: 2.75rem;
      margin-bottom: 0.65rem;
      padding-right: 6.25rem;
    }
    h2 { font-size: 0.75rem; }
    .amounts { gap: 0.3rem; padding-right: 0; }
    .amt {
      min-width: 2.75rem;
      min-height: 2.75rem;
      padding: 0.25rem 0.45rem;
      font-size: 0.72rem;
      border-radius: 9px;
    }
    .rows {
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .row {
      min-height: 3.75rem;
      margin-bottom: 0.48rem;
      padding: 0.65rem 0.7rem;
      gap: 0.72rem;
      border-radius: 12px;
    }
    .kindling-icon { width: 1.25rem; height: 1.25rem; }
    .name { font-size: 0.96rem; }
    .meta { margin-top: 0.12rem; font-size: 0.76rem; }
    .owned { font-size: 1.25rem; }
    @keyframes scrim-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes shop-in {
      from { opacity: 0; translate: 20px 0; }
      to { opacity: 1; translate: 0 0; }
    }
  }
</style>
