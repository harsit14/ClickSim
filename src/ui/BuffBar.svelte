<script lang="ts">
  import { onMount } from 'svelte'
  import { buffState } from '../systems/buffs.svelte'
  import { gameTime } from '../core/pause.svelte'

  let { integrated = false, reserve = false }: { integrated?: boolean; reserve?: boolean } = $props()
  let now = $state(gameTime())

  onMount(() => {
    const t = setInterval(() => (now = gameTime()), 250)
    return () => clearInterval(t)
  })

  const active = $derived(buffState.list.filter((b) => b.until > now))
</script>

{#if active.length > 0 || reserve}
  <div class="buffs" class:integrated class:empty={active.length === 0} aria-label={integrated ? 'Active power-up effects' : undefined}>
    {#if active.length === 0 && integrated}
      <span class="empty-label">none</span>
    {/if}
    {#each (integrated ? active.slice(0, 1) : active) as b (b.id)}
      <span class="pill">
        {b.label}
        <em>{Math.ceil((b.until - now) / 1000)}s</em>
      </span>
    {/each}
    {#if integrated && active.length > 1}<span class="more">+{active.length - 1}</span>{/if}
  </div>
{/if}

<style>
  .buffs {
    display: flex;
    gap: 0.4rem;
    max-width: min(42rem, 92vw);
    justify-content: center;
    flex-wrap: wrap;
    pointer-events: none;
  }
  .buffs:not(.integrated) { position:fixed;z-index:9;right:1.25rem;top:.75rem;width:min(16rem,calc(100vw - 2rem));justify-content:flex-end; }
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
  .buffs.integrated { width: 100%; height: 1.45rem; min-width: 0; flex-wrap: nowrap; justify-content: flex-start; align-items: center; overflow: hidden; }
  .buffs.integrated .pill { min-width: 0; max-width: 100%; box-sizing: border-box; overflow: hidden; padding: 0.24rem 0.46rem; font-size: 0.56rem; line-height: 1; text-overflow: ellipsis; white-space: nowrap; }
  .buffs.integrated .pill em { margin-left: 0.22rem; }
  .empty-label { color: color-mix(in srgb, var(--dim) 62%, transparent); font: 650 0.43rem/1 system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
  .more { flex: 0 0 auto; color: var(--amber); font: 720 0.48rem/1 system-ui, sans-serif; }
  @keyframes pill-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (max-width:800px) { .buffs:not(.integrated) { top:11.5rem;right:.6rem;width:min(13rem,calc(100vw - 4rem));justify-content:flex-end; } }
  :global(html[data-lumen-history='open']) .buffs:not(.integrated) { display:none; }
</style>
