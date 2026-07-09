<script lang="ts">
  import { GENERATORS, shownAt, teasedAt, type GeneratorDef } from '../content/generators'
  import { unitRate, bulkCost, maxAffordable, costMultOf, costScaleOf, genDisabled } from '../engine/compute'
  import { game, hasUi, buyGenerator, type BuyAmount } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'

  const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

  let collapsed = $state(false)

  const visible = $derived(hasUi('shop'))
  const shown = $derived(GENERATORS.filter((g) => game.totalEarned >= shownAt(g)))
  const teased = $derived(
    GENERATORS.find((g) => game.totalEarned < shownAt(g) && game.totalEarned >= teasedAt(g)),
  )

  function purchase(g: GeneratorDef): { count: number; cost: number } {
    const owned = game.owned[g.id] ?? 0
    const mult = costMultOf(game, g)
    const scale = costScaleOf(game)
    const count =
      game.buyAmount === 'max'
        ? Math.max(1, maxAffordable(g, owned, game.light, mult, scale))
        : game.buyAmount
    return { count, cost: bulkCost(g, owned, count, mult, scale) }
  }

  function tryBuy(g: GeneratorDef) {
    if (buyGenerator(g) > 0) playBuy()
  }
</script>

{#if visible}
  <aside class="shop" class:collapsed aria-label="Kindling shop">
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
        <div class="amounts">
          {#each AMOUNTS as a (a)}
            <button
              class="amt"
              class:active={game.buyAmount === a}
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
        <button
          class="row"
          class:unaffordable={game.light < p.cost || genDisabled(game, g)}
          onclick={() => tryBuy(g)}
          title={genDisabled(game, g) ? 'silenced by the trial' : g.flavor}
        >
          <span class="dot" style:--hue={g.hue}></span>
          <span class="info">
            <span class="name">{g.name}{#if p.count > 1}&nbsp;<small>×{p.count}</small>{/if}</span>
            <span class="meta">✦ {format(p.cost)} · +{format(unitRate(game, g))}/s</span>
          </span>
          <span class="owned">{owned || ''}</span>
        </button>
      {/each}
      {#if teased}
        <div class="row teased">
          <span class="dot mystery"></span>
          <span class="info"><span class="name">???</span></span>
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
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.14);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    animation: shop-in 1.4s ease both;
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
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.55rem 0.6rem;
    margin-bottom: 0.4rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    color: var(--text);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.06s;
  }
  .row:not(.teased):not(.unaffordable):hover {
    background: rgba(255, 179, 92, 0.09);
    border-color: rgba(255, 179, 92, 0.3);
  }
  .row:not(.teased):not(.unaffordable):active {
    transform: scale(0.97);
  }
  .row.unaffordable {
    opacity: 0.45;
    cursor: default;
  }
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
  .info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .name {
    font-size: 0.92rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name small {
    color: var(--amber);
    font-weight: 700;
  }
  .meta {
    font-size: 0.74rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .owned {
    font-size: 1.15rem;
    font-weight: 650;
    color: var(--amber);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 720px) {
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
