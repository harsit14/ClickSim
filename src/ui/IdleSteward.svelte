<script lang="ts">
  import { onMount } from 'svelte'
  import { game } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { perkBonus } from '../content/constellation'
  import { planOfflineProgress } from '../core/offline-pacing'
  import { idleManagerRealmStatus } from '../experience/idle-manager'
  import AutoKindlerManager from './AutoKindlerManager.svelte'

  let { onclose, onreviewrealm }: { onclose: () => void; onreviewrealm: () => void } = $props()
  let closeButton: HTMLButtonElement
  const pack = $derived(universeById(game.activeUniverse))
  const dailyPlan = $derived(planOfflineProgress(
    24 * 3_600,
    perkBonus(game.constellation, 'offline'),
    perkBonus(game.constellation, 'offlineCap'),
  ))
  const realm = $derived(idleManagerRealmStatus(
    game.activeUniverse,
    game.numericLawState,
    game.owned,
    game.curiosities.length,
  ))

  onMount(() => closeButton.focus({ preventScroll: true }))
</script>

<section class="steward instrument-panel" aria-labelledby="steward-title">
  <header>
    <div><small>idle is a playstyle</small><h2 id="steward-title">The Steward</h2></div>
    <button bind:this={closeButton} type="button" class="close" aria-label="Close the Steward" onclick={onclose}>✕</button>
  </header>

  <p class="intro">Shape what grows between visits. Nothing here asks for a streak, and saved realm decisions do not expire.</p>

  <div class="return-rhythm" aria-label={`Offline production counts ${dailyPlan.countedSeconds / 3_600} hours at ${Math.round(dailyPlan.efficiency * 100)} percent efficiency`}>
    <span aria-hidden="true">◒</span>
    <div><small>return rhythm</small><strong>{dailyPlan.countedSeconds / 3_600}h window · {Math.round(dailyPlan.efficiency * 100)}% production</strong><p>Two thoughtful check-ins per day keep the competent-idle route inside the three-to-seven-day realm target.</p></div>
  </div>

  <AutoKindlerManager />

  <section class="realm-decisions" class:waiting={realm.attentionCount > 0}>
    <div>
      <small>banked realm decisions</small>
      <strong>{realm.attentionCount > 0 ? `${realm.attentionCount} waiting` : 'Nothing waiting'}</strong>
      <p>{realm.bankedCount > 0 ? `${realm.bankedCount} saved prompt${realm.bankedCount === 1 ? '' : 's'} can be recalled without penalty.` : `The ${pack.name} instrument will hold future manager prompts for your return.`}</p>
    </div>
    {#if realm.controlLabel}
      <button type="button" onclick={onreviewrealm}>Review {realm.controlLabel}</button>
    {/if}
  </section>
</section>

<style>
  .steward { position:fixed;inset:3.2rem 0 auto;margin:0 auto;width:min(42rem,96vw);max-height:calc(100dvh - 4rem);overflow-y:auto;padding:1.1rem 1.25rem 1.35rem;color:var(--text);background:linear-gradient(180deg,rgba(6,9,15,.98),rgba(7,5,13,.98));border:1px solid rgba(140,220,255,.18);border-radius:1rem;box-shadow:0 1.5rem 5rem rgba(0,0,0,.44);z-index:9; }
  header { display:flex;align-items:center;justify-content:space-between;gap:1rem; }
  header small,.return-rhythm small,.realm-decisions small { color:#80c9eb;font-size:.52rem;font-weight:760;letter-spacing:.15em;text-transform:uppercase; }
  h2 { margin:.14rem 0 0;color:#dff5ff;font:560 1.2rem/1.2 var(--font-story); }
  .close { padding:.35rem;color:var(--dim);background:none;border:0;font-size:.9rem;cursor:pointer; }
  .close:focus-visible,.realm-decisions button:focus-visible { outline:2px solid white;outline-offset:2px; }
  .intro { margin:.65rem 0 .85rem;color:var(--dim);font:italic .76rem/1.5 var(--font-story); }
  .return-rhythm { display:grid;grid-template-columns:auto minmax(0,1fr);gap:.65rem;margin-bottom:.7rem;padding:.68rem .75rem;border:1px solid rgba(140,220,255,.14);border-radius:.72rem;background:rgba(140,220,255,.035); }
  .return-rhythm > span { color:#9fdcf4;font-size:1rem; }
  .return-rhythm strong { display:block;margin-top:.12rem;color:#d9f2ff;font-size:.72rem; }
  .return-rhythm p,.realm-decisions p { margin:.2rem 0 0;color:var(--dim);font-size:.59rem;line-height:1.4; }
  .realm-decisions { display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.7rem;padding:.72rem .78rem;border:1px solid rgba(140,220,255,.13);border-radius:.72rem;background:rgba(255,255,255,.018); }
  .realm-decisions.waiting { border-color:color-mix(in srgb,var(--gold) 24%,transparent);background:color-mix(in srgb,var(--gold) 4%,transparent); }
  .realm-decisions strong { display:block;margin-top:.12rem;color:var(--text);font-size:.74rem; }
  .realm-decisions button { flex:0 0 auto;padding:.46rem .68rem;color:#06131c;background:linear-gradient(180deg,#d6f3ff,#80c9eb);border:0;border-radius:999px;font:720 .58rem/1 var(--font-interface);cursor:pointer; }
  @media (max-width:560px) { .realm-decisions { align-items:stretch;flex-direction:column; }.realm-decisions button { width:100%;min-height:2.4rem; } }
</style>
