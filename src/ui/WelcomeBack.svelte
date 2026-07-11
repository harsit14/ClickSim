<script lang="ts">
  import { game, earn } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playCollect } from '../audio/sfx'
  import { universeById } from '../content/universes'
  import type { EconomyAmount } from '../content/universes/types'
  import { welcomeBackEligible } from './welcome-back-model'

  let { amount }: { amount: EconomyAmount } = $props()
  let dismissed = $state(false)
  const open = $derived(welcomeBackEligible(amount) && !dismissed)
  const pack = $derived(universeById(game.activeUniverse))

  function collect() {
    earn(amount)
    playCollect()
    dismissed = true
  }
</script>

{#if open}
  <div class="scrim">
    <div class="card instrument-panel">
      <p class="title">While you were gone,</p>
      <p class="body">your {pack.currency.toLowerCase()} kept gathering.</p>
      <p class="gain">{pack.currencyGlyph} {format(amount)}</p>
      <button onclick={collect}>Gather the {pack.currency.toLowerCase()}</button>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(4, 4, 10, 0.7);
    backdrop-filter: blur(4px);
    z-index: 10;
    animation: fade 0.8s ease both;
  }
  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .card {
    text-align: center;
    padding: 2.2rem 3rem;
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.2);
    border-radius: 18px;
  }
  .title, .body {
    margin: 0;
    font-family: Georgia, serif;
    font-style: italic;
    color: var(--dim);
  }
  .gain {
    margin: 1rem 0 1.4rem;
    font-size: 2rem;
    font-weight: 650;
    color: var(--gold);
    text-shadow: 0 0 24px rgba(255, 179, 92, 0.4);
    font-variant-numeric: tabular-nums;
  }
  button {
    padding: 0.6rem 1.6rem;
    font: inherit;
    font-weight: 600;
    color: #1a1206;
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.08s;
  }
  button:hover {
    transform: scale(1.04);
  }
  button:active {
    transform: scale(0.97);
  }
</style>
