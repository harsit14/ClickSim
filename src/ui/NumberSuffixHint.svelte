<script lang="ts">
  import { onMount } from 'svelte'
  import type { EconomyAmount } from '../content/universes/types'
  import { numberSuffixGuide } from '../core/number-suffix-guide'

  let { amount, currencyName, suppressed = false }: { amount: EconomyAmount; currencyName: string; suppressed?: boolean } = $props()
  let dismissed = $state(true)
  const guide = $derived(numberSuffixGuide(amount))
  const visible = $derived(!suppressed && !dismissed && guide !== null)
  const storageKey = 'ember:number-suffix-guide:v1'

  onMount(() => {
    try {
      dismissed = localStorage.getItem(storageKey) === 'seen'
    } catch {
      dismissed = false
    }
  })

  function dismiss() {
    dismissed = true
    try {
      localStorage.setItem(storageKey, 'seen')
    } catch {
      // The lesson still dismisses for this session when storage is unavailable.
    }
  }
</script>

{#if visible && guide}
  <aside class="suffix-hint" role="status" aria-label={`Number shorthand: ${guide.explanation}`}>
    <span>NUMBER SHORTHAND</span>
    <p><strong>{guide.symbol}</strong> means {guide.name} · 10<sup>{guide.power}</sup></p>
    <small>{guide.name === 'scientific notation' ? `Read it as “times ten to the ${guide.power}.”` : 'Each new suffix is ×1,000.'} Current resource: {currencyName}.</small>
    <button type="button" onclick={dismiss} aria-label="Dismiss number shorthand explanation">got it</button>
  </aside>
{/if}

<style>
  .suffix-hint { position:fixed;z-index:18;left:calc(50% + 11.5rem);top:.8rem;width:11.2rem;box-sizing:border-box;display:grid;grid-template-columns:1fr auto;gap:.16rem .45rem;padding:.48rem .55rem;color:var(--gold);text-align:left;background:color-mix(in srgb,var(--panel) 94%,#05060b);border:1px solid color-mix(in srgb,var(--amber) 34%,transparent);border-radius:.35rem .8rem .8rem .35rem;box-shadow:0 .7rem 2rem color-mix(in srgb,var(--bg) 76%,transparent),inset 2px 0 color-mix(in srgb,var(--amber) 58%,transparent);pointer-events:auto;animation:suffix-enter .24s ease-out both; }
  .suffix-hint > span { color:var(--amber);font:760 .6875rem/1 system-ui,sans-serif;letter-spacing:.1em; }
  .suffix-hint p { grid-column:1 / -1;margin:0;color:color-mix(in srgb,var(--gold) 78%,white);font:560 .6875rem/1.35 system-ui,sans-serif; }
  .suffix-hint p strong { color:white;font:780 .75rem/1 ui-monospace,monospace; }
  .suffix-hint sup { font-size:.6875rem; }
  .suffix-hint small { grid-column:1;color:var(--dim);font:.6875rem/1.3 system-ui,sans-serif; }
  .suffix-hint button { grid-column:2;grid-row:1;min-width:1.5rem;min-height:1.5rem;padding:.2rem;color:var(--dim);background:transparent;border:0;font:680 .6875rem/1 system-ui,sans-serif;text-transform:uppercase;cursor:pointer; }
  .suffix-hint button:hover,.suffix-hint button:focus-visible { color:white;outline:1px solid var(--amber);outline-offset:.18rem; }
  @keyframes suffix-enter { from { opacity:0;transform:translateY(-.3rem); } }
  :global(html[data-motion='reduced']) .suffix-hint { animation:none; }
  @media (max-width:800px) { .suffix-hint { left:50%;top:12rem;width:min(16rem,calc(100vw - 2rem));transform:translateX(-50%); } @keyframes suffix-enter { from { opacity:0;transform:translate(-50%,-.3rem); } } }
</style>
