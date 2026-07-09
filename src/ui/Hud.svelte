<script lang="ts">
  import { game, activeRatePerSec, hasUi, recentClickRatePerSec } from '../engine/game.svelte'
  import { format } from '../core/format'

  const rate = $derived(activeRatePerSec())
  const clickRate = $derived(recentClickRatePerSec())
</script>

{#if hasUi('counter')}
  <div class="hud">
    <div class="light"><span class="star">✦</span>{format(game.light)}</div>
    {#if rate > 0}
      <div class="rate" class:active={clickRate > 0}>{format(rate)} light /s</div>
    {/if}
    {#if game.stardustTotal > 0 || game.singTotal > 0}
      <div class="dust">✧ {game.stardust}{#if game.singTotal > 0}&nbsp;&nbsp;<span class="sing">◉ {game.singularities}</span>{/if}</div>
    {/if}
  </div>
{/if}

<style>
  .hud {
    text-align: center;
    animation: fade-in 1.6s ease both;
    pointer-events: none;
  }
  .light {
    font-size: 2.1rem;
    font-weight: 650;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
    color: var(--gold);
    text-shadow: 0 0 24px rgba(255, 179, 92, 0.35);
  }
  .star {
    font-size: 1.3rem;
    margin-right: 0.4rem;
    vertical-align: 0.2rem;
    color: var(--amber);
  }
  .rate {
    margin-top: 0.15rem;
    font-size: 0.85rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
    animation: fade-in-plain 1s ease both;
  }
  .rate.active {
    color: #b1f5ff;
    text-shadow: 0 0 16px rgba(105, 235, 255, 0.25);
  }
  .dust {
    margin-top: 0.15rem;
    font-size: 0.8rem;
    color: #c9c1f2;
    text-shadow: 0 0 12px rgba(170, 150, 255, 0.35);
    font-variant-numeric: tabular-nums;
    animation: fade-in-plain 1s ease both;
  }
  .sing {
    color: #9fd8ef;
    text-shadow: 0 0 12px rgba(120, 210, 255, 0.35);
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-plain {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
