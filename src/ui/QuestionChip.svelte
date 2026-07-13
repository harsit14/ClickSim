<script lang="ts">
  import { questionReady } from '../engine/game.svelte'

  let { onopen }: { onopen: () => void } = $props()

  const ready = $derived(questionReady())
</script>

{#if ready}
  <button class="ask" onclick={onopen}>ask the question</button>
{/if}

<style>
  .ask {
    position: fixed;
    bottom: 13vh;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.55rem 1.5rem;
    font: inherit;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1rem;
    color: rgba(225, 220, 250, 0.95);
    background: rgba(20, 16, 40, 0.85);
    border: 1px solid rgba(180, 170, 255, 0.45);
    border-radius: 999px;
    cursor: pointer;
    z-index: 7;
    box-shadow: 0 0 26px rgba(160, 150, 255, 0.25);
    animation: ask-pulse 2.4s ease-in-out infinite;
    transition: transform 0.08s;
  }
  .ask:hover { transform: translateX(-50%) scale(1.05); }
  .ask:active { transform: translateX(-50%) scale(0.97); }
  @keyframes ask-pulse {
    0%, 100% { box-shadow: 0 0 16px rgba(160, 150, 255, 0.2); }
    50% { box-shadow: 0 0 34px rgba(160, 150, 255, 0.5); }
  }
  @media (max-width: 720px) {
    .ask { bottom: var(--mobile-transient-bottom, 48vh); min-height: 2.75rem; max-width: calc(100vw - 1rem); }
  }
</style>
