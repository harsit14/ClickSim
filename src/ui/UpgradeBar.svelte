<script lang="ts">
  import { availableUpgrades } from '../engine/compute'
  import { describeEffect } from '../content/upgrades'
  import { game, hasUi, buyUpgrade } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'
  import { amountFromNumber, ltAmount } from '../core/numeric/amount'

  const SHOWN = 9
  const available = $derived(hasUi('upgrades') ? availableUpgrades(game) : [])
  const shown = $derived(available.slice(0, SHOWN))
  const overflow = $derived(available.length - shown.length)
  let previewId = $state<string | null>(null)
  const preview = $derived(shown.find((u) => u.id === previewId) ?? null)
  const pack = $derived(universeById(game.activeUniverse))

  function tryBuy(id: string): boolean {
    const bought = buyUpgrade(id)
    if (!bought) return false
    playBuy()
    if (previewId === id) previewId = null
    return true
  }

  function clearPreviewIfFocusLeaves(event: FocusEvent) {
    const next = event.relatedTarget
    if (!(next instanceof Node) || !(event.currentTarget as HTMLElement).contains(next)) {
      previewId = null
    }
  }
</script>

{#if shown.length > 0}
  <div
    class="upgrade-stack"
    role="group"
    aria-label="Available upgrades"
    onpointerleave={() => (previewId = null)}
    onfocusout={clearPreviewIfFocusLeaves}
  >
    <div class="bar">
      {#each shown as u (u.id)}
        <button
          class="up"
          class:previewing={previewId === u.id}
          class:unaffordable={ltAmount(game.light, amountFromNumber(u.cost))}
          style:--hue={u.hue}
          aria-label={`${u.name}: ${u.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())).join(', ')}`}
          aria-describedby={previewId === u.id ? 'upgrade-preview' : undefined}
          onpointerenter={() => (previewId = u.id)}
          onpointerdown={() => (previewId = u.id)}
          onfocus={() => (previewId = u.id)}
          onclick={() => tryBuy(u.id)}
        >
          <span class="glyph">{u.glyph}</span>
        </button>
      {/each}
      {#if overflow > 0}
        <span class="more">+{overflow}</span>
      {/if}
    </div>
    {#if preview}
      <div id="upgrade-preview" class="detail" style:--hue={preview.hue}>
        <strong>{preview.name}</strong>
        <em>{preview.flavor}</em>
        <span class="fx">{preview.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())).join(' · ')}</span>
        <span class="price">{pack.currencyGlyph} {format(preview.cost)}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .upgrade-stack {
    width: min(30rem, 96vw);
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    animation: bar-in 1s ease both;
    pointer-events: auto;
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    max-width: 100%;
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
  .up.previewing {
    border-color: hsl(var(--hue), 90%, 74%);
    box-shadow: 0 0 20px hsla(var(--hue), 90%, 60%, 0.45);
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
  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    width: min(25rem, 92vw);
    padding: 0.6rem 0.75rem;
    background: rgba(12, 11, 22, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 0.78rem;
    text-align: left;
    pointer-events: none;
    box-shadow: 0 0 26px rgba(8, 7, 18, 0.55);
    animation: detail-in 0.14s ease both;
  }
  .detail strong {
    color: var(--text);
  }
  .detail em {
    color: var(--dim);
    font-family: Georgia, serif;
  }
  .detail .fx {
    color: hsl(var(--hue), 80%, 70%);
  }
  .detail .price {
    color: var(--gold);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  @keyframes detail-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .more {
    font-size: 0.8rem;
    color: var(--dim);
  }
  @media (max-width: 720px) {
    .bar {
      overflow-x: auto;
      justify-content: flex-start;
      width: 100%;
      padding-bottom: 0.2rem;
    }
    .detail {
      width: min(25rem, 96vw);
    }
  }
</style>
