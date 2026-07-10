<script lang="ts">
  import { toastState } from '../systems/toasts.svelte'

  let { clearOfShop = false }: { clearOfShop?: boolean } = $props()
</script>

{#if toastState.list.length > 0}
  <div class="toasts" class:shop-clear={clearOfShop} role="status" aria-live="polite" aria-atomic="true">
    {#each toastState.list as t (t.key)}
      <div class="toast">
        {#if t.tag}<span class="tag">{t.tag}</span>{/if}
        <strong>{t.title}</strong>
        <p>{t.body}</p>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toasts {
    position: fixed;
    top: 4rem;
    right: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 16rem;
    z-index: 9;
    pointer-events: none;
  }
  .toasts.shop-clear {
    top: 9rem;
    right: 19rem;
  }
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
  @media (max-width: 720px) {
    .toasts {
      top: auto;
      bottom: 40vh;
      right: 0.6rem;
      width: 13rem;
    }
  }
</style>
