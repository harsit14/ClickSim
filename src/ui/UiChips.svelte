<script lang="ts">
  import { UI_UNLOCKS } from '../content/ui-unlocks'
  import { game, buyUi } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBloom } from '../audio/sfx'
  import { startMusic } from '../audio/music'

  const next = $derived(
    UI_UNLOCKS.find((u) => !game.ui.includes(u.id) && game.totalEarned >= u.appearAt),
  )

  function tryBuy() {
    const id = next?.id
    if (!id || !buyUi(id)) return
    playBloom()
    if (id === 'music') startMusic()
  }
</script>

{#if next}
  {#key next.id}
    <button type="button" class="chip" class:unaffordable={game.light < next.cost} onclick={tryBuy}>
      <span class="label">{next.label}</span>
      <span class="cost">✦ {format(next.cost)}</span>
    </button>
  {/key}
{/if}

<style>
  .chip {
    position: fixed;
    bottom: 13vh;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.55rem 1.2rem;
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.35);
    border-radius: 999px;
    color: var(--text);
    font: inherit;
    cursor: pointer;
    animation: chip-in 1.6s ease both;
    box-shadow: 0 0 22px rgba(255, 179, 92, 0.12);
    transition: box-shadow 0.2s, border-color 0.2s, transform 0.08s;
    z-index: 8;
  }
  .chip:not(.unaffordable):hover {
    border-color: rgba(255, 179, 92, 0.7);
    box-shadow: 0 0 30px rgba(255, 179, 92, 0.25);
  }
  .chip:not(.unaffordable):active {
    transform: translateX(-50%) scale(0.96);
  }
  .chip.unaffordable {
    opacity: 0.55;
    cursor: default;
  }
  .label {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    color: rgba(220, 215, 240, 0.9);
  }
  .cost {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }
  @keyframes chip-in {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @media (max-width: 720px) {
    .chip {
      bottom: 48vh;
    }
  }
</style>
