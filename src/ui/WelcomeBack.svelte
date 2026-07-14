<script lang="ts">
  import { onMount } from 'svelte'
  import { game, earn, ratePerSec } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playCollect } from '../audio/sfx'
  import { universeById } from '../content/universes'
  import type { OfflineReturnSummary } from '../core/offline-pacing'
  import { containModalKeydown } from '../accessibility/modal-focus'
  import {
    offlineMilestoneCandidates,
    selectOfflineNearMiss,
  } from '../experience/offline-return'
  import { welcomeBackEligible } from './welcome-back-model'

  let { summary, oncollect }: { summary: OfflineReturnSummary; oncollect: () => void } = $props()
  let dialog = $state<HTMLElement>()
  let collectButton = $state<HTMLButtonElement>()
  const open = $derived(welcomeBackEligible(summary.gain))
  const pack = $derived(universeById(game.activeUniverse))
  const nearMiss = $derived(selectOfflineNearMiss(
    game.light,
    summary.gain,
    ratePerSec(),
    summary.efficiency,
    offlineMilestoneCandidates(game),
  ))

  function duration(seconds: number): string {
    const minutes = Math.max(1, Math.ceil(seconds / 60))
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    if (hours < 24) return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`
    const days = Math.floor(hours / 24)
    const extraHours = hours % 24
    return extraHours > 0 ? `${days}d ${extraHours}h` : `${days}d`
  }

  function collect() {
    earn(summary.gain)
    save()
    playCollect()
    oncollect()
  }

  onMount(() => {
    if (open) collectButton?.focus({ preventScroll: true })
  })
</script>

{#if open}
  <div class="return-scrim reduced-motion-safe">
    <div
      bind:this={dialog}
      class="return-card instrument-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
      aria-describedby="welcome-back-summary"
      tabindex="-1"
      onkeydown={(event) => dialog && containModalKeydown(event, dialog, collect)}
    >
      <header>
        <span aria-hidden="true">◒</span>
        <div>
          <small>the patient path</small>
          <h2 id="welcome-back-title">While you were gone, the world kept tending.</h2>
        </div>
      </header>

      <p id="welcome-back-summary">Your {pack.currency.toLowerCase()} waited without decay or penalty.</p>
      <div class="gain"><span>{pack.currencyGlyph}</span><strong>{format(summary.gain)}</strong><small>{pack.currency} gathered</small></div>

      <dl class="return-ledger">
        <div><dt>Away</dt><dd>{duration(summary.elapsedSeconds)}</dd></div>
        <div><dt>Counted</dt><dd>{duration(summary.countedSeconds)}</dd></div>
        <div><dt>Efficiency</dt><dd>{Math.round(summary.efficiency * 100)}%</dd></div>
      </dl>
      {#if summary.capReached}
        <p class="cap-note">The return cap was reached. Your next absence begins a fresh twelve-hour window.</p>
      {/if}

      {#if nearMiss}
        <aside class="near-miss" aria-label="Next idle milestone">
          <span aria-hidden="true">✧</span>
          <div>
            <small>{nearMiss.status === 'reached' ? 'within reach now' : 'next return horizon'}</small>
            <strong>{nearMiss.candidate.name}</strong>
            <p>
              {#if nearMiss.status === 'reached'}
                This return is enough to buy this {nearMiss.candidate.kind.toLowerCase()}.
              {:else}
                About {duration(nearMiss.additionalSeconds)} more offline at this pace would have bought it.
              {/if}
            </p>
          </div>
        </aside>
      {/if}

      <button bind:this={collectButton} type="button" onclick={collect}>Gather the {pack.currency.toLowerCase()}</button>
    </div>
  </div>
{/if}

<style>
  .return-scrim { position:fixed;inset:0;z-index:34;display:grid;place-items:center;padding:1rem;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--gold) 9%,transparent),transparent 34%),rgba(4,4,10,.78);backdrop-filter:blur(9px);animation:return-in .42s ease both; }
  .return-card { width:min(36rem,calc(100vw - 2rem));max-height:calc(100dvh - 2rem);overflow-y:auto;padding:clamp(1.15rem,3vw,1.8rem);color:var(--text);background:linear-gradient(145deg,color-mix(in srgb,var(--panel) 96%,var(--gold) 3%),color-mix(in srgb,var(--panel) 98%,#05050a));border:1px solid color-mix(in srgb,var(--gold) 24%,transparent);border-radius:1rem;box-shadow:0 1.5rem 5rem rgba(0,0,0,.5),inset 0 1px rgba(255,255,255,.04); }
  header { display:flex;align-items:center;gap:.8rem; }
  header > span { width:2.65rem;aspect-ratio:1;display:grid;place-items:center;color:var(--gold);border:1px solid color-mix(in srgb,var(--gold) 32%,transparent);border-radius:50%;box-shadow:0 0 1.4rem color-mix(in srgb,var(--gold) 16%,transparent); }
  header small,.near-miss small { color:color-mix(in srgb,var(--gold) 66%,var(--dim));font-size:.56rem;font-weight:760;letter-spacing:.14em;text-transform:uppercase; }
  h2 { margin:.16rem 0 0;font:560 clamp(1.04rem,2.6vw,1.42rem)/1.2 var(--font-story); }
  #welcome-back-summary { margin:.85rem 0 0;color:var(--dim);font:italic .8rem/1.45 var(--font-story); }
  .gain { display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:.55rem;margin:1rem 0;padding:.85rem 1rem;background:color-mix(in srgb,var(--gold) 4%,transparent);border:1px solid color-mix(in srgb,var(--gold) 14%,transparent);border-radius:.75rem; }
  .gain > span { grid-row:1 / 3;color:var(--amber);font-size:1.15rem; }
  .gain strong { color:var(--gold);font-size:clamp(1.45rem,4vw,2rem);line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 1.3rem color-mix(in srgb,var(--gold) 24%,transparent); }
  .gain small { margin-top:.18rem;color:var(--dim);font-size:.55rem;letter-spacing:.1em;text-transform:uppercase; }
  .return-ledger { display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin:0; }
  .return-ledger div { padding:.58rem .65rem;border:1px solid color-mix(in srgb,var(--gold) 10%,transparent);border-radius:.6rem;background:rgba(255,255,255,.018); }
  dt { color:var(--dim);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase; }
  dd { margin:.2rem 0 0;color:var(--text);font-size:.74rem;font-weight:680;font-variant-numeric:tabular-nums; }
  .cap-note { margin:.5rem 0 0;color:var(--dim);font-size:.6rem;line-height:1.4; }
  .near-miss { display:grid;grid-template-columns:auto minmax(0,1fr);gap:.65rem;margin-top:.9rem;padding:.72rem .78rem;border:1px solid color-mix(in srgb,var(--gold) 20%,transparent);border-radius:.72rem;background:color-mix(in srgb,var(--gold) 4%,transparent); }
  .near-miss > span { color:var(--gold); }
  .near-miss strong { display:block;margin-top:.15rem;font:620 .86rem/1.2 var(--font-story); }
  .near-miss p { margin:.22rem 0 0;color:var(--dim);font-size:.65rem;line-height:1.4; }
  button { width:100%;min-height:2.65rem;margin-top:1rem;padding:.65rem 1.2rem;color:#1a1206;background:linear-gradient(180deg,var(--gold),var(--amber));border:0;border-radius:999px;font:720 .72rem/1 var(--font-interface);cursor:pointer; }
  button:hover { filter:brightness(1.06); }
  button:focus-visible { outline:2px solid white;outline-offset:2px; }
  @keyframes return-in { from { opacity:0; } }
  @media (max-width:520px) { .return-ledger { grid-template-columns:1fr; } }
  :global(html[data-motion='reduced']) .reduced-motion-safe,
  :global(html[data-motion='reduced']) .reduced-motion-safe * { animation:none !important;transition:none !important; }
  @media (prefers-reduced-motion:reduce) { .reduced-motion-safe,.reduced-motion-safe * { animation:none !important;transition:none !important; } }
</style>
