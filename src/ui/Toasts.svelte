<script lang="ts">
  import { toastState } from '../systems/toasts.svelte'

  let { clearOfShop = false, governed = false }: { clearOfShop?: boolean; governed?: boolean } = $props()
  const visibleToasts = $derived(toastState.list.slice(0, 1))
  const queuedCount = $derived(toastState.queue.length + Math.max(0, toastState.list.length - visibleToasts.length))
</script>

{#if toastState.achievements[0]}
  {@const achievement = toastState.achievements[0]}
  <div class="achievement-banner instrument-panel" role="status" aria-live="polite" aria-atomic="true">
    <span class="achievement-mark" aria-hidden="true">◆</span>
    <div>
      {#if achievement.tag}<span class="achievement-tag">{achievement.tag}</span>{/if}
      <strong>{achievement.title}</strong>
      <p>{achievement.body}</p>
    </div>
    {#if toastState.achievements.length > 1}
      <small>+{toastState.achievements.length - 1} queued</small>
    {/if}
    <i aria-hidden="true"></i>
  </div>
{/if}

{#if toastState.list.length > 0}
  <div class="toasts" class:shop-clear={clearOfShop} class:governed role="status" aria-live="polite" aria-atomic="true">
    {#each visibleToasts as t (t.key)}
      <div class="toast instrument-panel">
        {#if t.tag}<span class="tag">{t.tag}</span>{/if}
        <strong>{t.title}</strong>
        <p>{t.body}</p>
      </div>
    {/each}
    {#if queuedCount > 0}
      <small class="queued-count">+{queuedCount} queued</small>
    {/if}
  </div>
{/if}

<style>
  .achievement-banner {
    position: relative;
    width: 100%;
    min-height: 2.7rem;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.58rem;
    overflow: hidden;
    padding: 0.48rem 0.68rem 0.58rem;
    color: var(--gold);
    background: linear-gradient(105deg, color-mix(in srgb, var(--amber) 11%, transparent), transparent 52%), rgba(9, 9, 18, 0.94);
    border: 1px solid color-mix(in srgb, var(--amber) 40%, transparent);
    border-radius: 0.15rem 0.75rem 0.75rem 0.15rem;
    box-shadow: 0 0.65rem 2.2rem rgba(0, 0, 0, 0.42), inset 3px 0 var(--amber);
    pointer-events: none;
    animation: achievement-arrive 0.38s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
  }
  .achievement-banner > div { min-width: 0; }
  .achievement-mark { display: grid; place-items: center; width: 1.65rem; height: 1.65rem; color: var(--amber); border: 1px solid color-mix(in srgb, var(--amber) 34%, transparent); border-radius: 50%; text-shadow: 0 0 0.7rem var(--amber); }
  .achievement-tag { display: block; margin-bottom: 0.08rem; color: var(--amber); font: 730 0.45rem/1 system-ui, sans-serif; letter-spacing: 0.13em; text-transform: uppercase; }
  .achievement-banner strong { overflow: hidden; font-size: 0.72rem; line-height: 1.05; text-overflow: ellipsis; white-space: nowrap; }
  .achievement-banner p { overflow: hidden; margin-top: 0.1rem; font-size: 0.56rem; line-height: 1.1; text-overflow: ellipsis; white-space: nowrap; }
  .achievement-banner small { align-self: start; color: var(--dim); font: 620 0.43rem/1 system-ui, sans-serif; white-space: nowrap; }
  .achievement-banner > i { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; transform-origin: left; background: linear-gradient(90deg, var(--amber), var(--gold)); animation: achievement-time 4.5s linear both; }
  @keyframes achievement-arrive { from { opacity: 0; transform: translateY(-0.7rem); } to { opacity: 1; transform: translateY(0); } }
  @keyframes achievement-time { from { transform: scaleX(1); } to { transform: scaleX(0); } }
  .toasts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    pointer-events: none;
  }
  .toasts.shop-clear,
  .toasts.governed { position: relative; }
  .toast {
    padding: 0.65rem 0.85rem;
    background: rgba(14, 13, 26, 0.92);
    border: 1px solid rgba(255, 217, 138, 0.35);
    border-radius: 12px;
    box-shadow: 0 0 24px rgba(255, 179, 92, 0.12);
    animation: toast-in 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .tag {
    display: inline-block;
    margin-bottom: 0.15rem;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--amber);
  }
  strong {
    display: block;
    font-size: 0.9rem;
    color: var(--gold);
  }
  p {
    margin: 0.15rem 0 0;
    font-size: 0.76rem;
    font-family: Georgia, serif;
    font-style: italic;
    color: var(--dim);
  }
  .queued-count {
    align-self: flex-end;
    padding: 0.18rem 0.42rem;
    color: var(--dim);
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    border-radius: 999px;
    font: 650 0.5rem/1 system-ui, sans-serif;
    letter-spacing: 0.04em;
  }
  @media (max-width: 800px) {
    .achievement-banner { width: 100%; animation: none; }
    .toasts,
    .toasts.shop-clear { width: 100%; }
  }
  :global(html[data-lumen-history='open']) .toasts { display: none; }
  @media (max-width: 380px) {
    .achievement-banner { width: 100%; }
    .toasts,
    .toasts.shop-clear { width: min(12rem, calc(100vw - 4rem)); }
  }
  :global(html[data-motion='reduced']) .achievement-banner,
  :global(html[data-motion='reduced']) .achievement-banner > i { animation: none; }
</style>
