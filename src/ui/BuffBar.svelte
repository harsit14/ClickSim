<script lang="ts">
  import { onMount } from 'svelte'
  import { buffState } from '../systems/buffs.svelte'

  let now = $state(performance.now())

  onMount(() => {
    const t = setInterval(() => (now = performance.now()), 250)
    return () => clearInterval(t)
  })

  const active = $derived(buffState.list.filter((b) => b.until > now))
</script>

{#if active.length > 0}
  <div class="buffs">
    {#each active as b (b.id)}
      <span class="pill">
        {b.label}
        <em>{Math.ceil((b.until - now) / 1000)}s</em>
      </span>
    {/each}
  </div>
{/if}

<style>
  .buffs {
    position: fixed;
    top: 9.4rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.4rem;
    max-width: min(42rem, 92vw);
    justify-content: center;
    flex-wrap: wrap;
    pointer-events: none;
    z-index: 7;
  }
  .pill {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #ffe9c4;
    background: rgba(255, 179, 92, 0.14);
    border: 1px solid rgba(255, 179, 92, 0.4);
    border-radius: 999px;
    box-shadow: 0 0 18px rgba(255, 179, 92, 0.25);
    animation: pill-in 0.3s ease both;
  }
  .pill em {
    font-style: normal;
    color: var(--dim);
    margin-left: 0.35rem;
    font-variant-numeric: tabular-nums;
  }
  @keyframes pill-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
