<script lang="ts">
  import { availableUpgrades } from '../engine/compute'
  import { describeEffect } from '../content/upgrades'
  import { game, hasUi, buyUpgrade } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'

  const SHOWN = 9
  const available = $derived(hasUi('upgrades') ? availableUpgrades(game) : [])
  const shown = $derived(available.slice(0, SHOWN))
  const overflow = $derived(available.length - shown.length)
  const hasPrestigeCurrency = $derived(game.stardustTotal > 0 || game.singTotal > 0)

  function tryBuy(id: string) {
    if (buyUpgrade(id)) playBuy()
  }
</script>

{#if shown.length > 0}
  <div class="bar" class:with-currencies={hasPrestigeCurrency}>
    {#each shown as u (u.id)}
      <button
        class="up"
        class:unaffordable={game.light < u.cost}
        style:--hue={u.hue}
        onclick={() => tryBuy(u.id)}
      >
        <span class="glyph">{u.glyph}</span>
        <span class="tip">
          <strong>{u.name}</strong>
          <em>{u.flavor}</em>
          <span class="fx">{u.effects.map(describeEffect).join(' · ')}</span>
          <span class="price">✦ {format(u.cost)}</span>
        </span>
      </button>
    {/each}
    {#if overflow > 0}
      <span class="more">+{overflow}</span>
    {/if}
  </div>
{/if}

<style>
  .bar {
    position: fixed;
    top: 5.15rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.45rem;
    max-width: 92vw;
    animation: bar-in 1s ease both;
    z-index: 6;
  }
  .bar.with-currencies {
    top: 6.35rem;
  }
  @keyframes bar-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .up {
    position: relative;
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    background: hsla(var(--hue), 70%, 55%, 0.12);
    border: 1px solid hsla(var(--hue), 85%, 65%, 0.55);
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 12px hsla(var(--hue), 90%, 60%, 0.25);
    transition: transform 0.08s, box-shadow 0.15s;
  }
  .up:not(.unaffordable):hover {
    box-shadow: 0 0 20px hsla(var(--hue), 90%, 60%, 0.5);
    transform: translateY(1px);
  }
  .up.unaffordable {
    opacity: 0.4;
    box-shadow: none;
    cursor: default;
  }
  .glyph {
    font-size: 0.95rem;
    font-weight: 700;
    color: hsl(var(--hue), 90%, 72%);
  }
  .tip {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    display: none;
    flex-direction: column;
    gap: 0.2rem;
    width: 13.5rem;
    padding: 0.6rem 0.75rem;
    background: rgba(12, 11, 22, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 0.78rem;
    text-align: left;
    z-index: 5;
    pointer-events: none;
  }
  .up:hover .tip {
    display: flex;
  }
  .tip strong {
    color: var(--text);
  }
  .tip em {
    color: var(--dim);
    font-family: Georgia, serif;
  }
  .tip .fx {
    color: hsl(var(--hue), 80%, 70%);
  }
  .tip .price {
    color: var(--gold);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .more {
    font-size: 0.8rem;
    color: var(--dim);
  }
  @media (max-width: 720px) {
    .bar {
      top: 5rem;
      overflow-x: auto;
      max-width: 96vw;
      padding-bottom: 0.2rem;
    }
    .bar.with-currencies {
      top: 6.25rem;
    }
    .tip {
      display: none !important;
    }
  }
</style>
