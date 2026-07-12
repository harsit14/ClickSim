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
  import { aggregatePurchaseFeedback } from '../feedback'
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
  }: { suppressed?: boolean; collapsed?: boolean } = $props()

  const visible = $derived(hasUi('shop'))
  const pack = $derived(universeById(game.activeUniverse))
  const v2Pack = $derived(universeV2ById(game.activeUniverse))
  const generators = $derived(pack.generators)
  const shown = $derived(generators.filter((g) => gteAmount(game.totalEarned, amountFromNumber(shownAt(g)))))
  const teased = $derived(
    generators.find((g) => ltAmount(game.totalEarned, amountFromNumber(shownAt(g))) && gteAmount(game.totalEarned, amountFromNumber(teasedAt(g)))),
  )

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
      playBuy()
      return
    }

    const exactCost = bought === planned.count
      ? planned.cost
      : bulkCost(g, ownedBefore, bought, costMultOf(game, g), costScaleOf(game))
    const afterRate = totalRate(game)
    const rateDelta = gteAmount(afterRate, beforeRate)
      ? subtractAmounts(afterRate, beforeRate)
      : ZERO_AMOUNT
    const announcement = v2Pack.accessibility.announcements.find(
      ({ messageKey }) => messageKey.endsWith('.announcement.purchase'),
    )
    const [event] = aggregatePurchaseFeedback({
      eventId: `${v2Pack.id}-purchase-${g.id}-${Math.floor(occurredAtMs)}`,
      occurredAtMs,
      source: { universeId: v2Pack.id, kind: 'generator', id: g.id },
      mode: bought === 1 ? 'one' : bought === 10 ? 'ten' : 'max',
      quantity: bought,
      totalCost: exactCost,
      totalRateDelta: rateDelta,
      audioCue: v2Pack.audio.purchaseIntervalCue,
      ...(announcement ? { announcement } : {}),
    })
    publishLivePurchase(event, v2Pack, {
      audio: { silence: game.sfxVolume <= 0 },
      visual: {
        reducedMotion: game.motionPreference === 'reduced',
        quality: resolveVisualQuality(game.visualQuality, {
          width: window.innerWidth,
          devicePixelRatio: window.devicePixelRatio || 1,
          hardwareConcurrency: navigator.hardwareConcurrency || 8,
        }),
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
</script>

{#if visible && !suppressed}
  <aside class="shop instrument-panel" class:collapsed aria-label="Kindling shop">
    <button
      class="retract"
      class:collapsed
      onclick={() => (collapsed = !collapsed)}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'open kindling shop' : 'hide kindling shop'}
      title={collapsed ? 'Open kindling' : 'Hide kindling'}
    >
      {collapsed ? '‹' : '›'}
    </button>
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
          class:unaffordable={ltAmount(game.light, p.cost) || genPurchaseDisabled(game, g)}
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
  </aside>
{/if}

<style>
  .shop {
    position: fixed;
    top: 50%;
    right: 1.25rem;
    transform: translateY(-50%);
    width: 16.5rem;
    max-height: 78vh;
    display: flex;
    flex-direction: column;
    padding: 1rem 0.9rem 0.6rem;
    background-color: var(--glass);
    border-color: var(--glass-border);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    animation: shop-in 0.24s ease both;
    transition: transform 0.32s ease, opacity 0.2s ease, border-color 0.2s ease;
    z-index: 6;
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
  .row:not(.teased):not(.unaffordable):hover {
    background: rgba(255, 179, 92, 0.09);
    border-color: rgba(255, 179, 92, 0.3);
  }
  .row:not(.teased):not(.unaffordable):active {
    transform: scale(0.97);
  }
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
    font-size: 0.58rem;
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
    .shop {
      top: auto;
      right: 0;
      bottom: 0;
      left: 0;
      width: auto;
      transform: none;
      border-radius: 16px 16px 0 0;
      max-height: 38vh;
      transition: transform 0.32s ease, opacity 0.2s ease;
    }
    .shop.collapsed {
      transform: translateY(calc(100% - 2.4rem));
      opacity: 0.9;
    }
    .retract {
      top: -1.95rem;
      left: 50%;
      width: 5.2rem;
      height: 1.95rem;
      transform: translateX(-50%);
      border: 1px solid rgba(255, 179, 92, 0.18);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
    }
    .retract:not(.collapsed) {
      transform: translateX(-50%) rotate(90deg);
    }
    .retract.collapsed {
      transform: translateX(-50%) rotate(-90deg);
    }
    @keyframes shop-in {
      from { opacity: 0; translate: 0 20px; }
      to { opacity: 1; translate: 0 0; }
    }
  }
</style>
