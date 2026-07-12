<script lang="ts">
  import { onMount } from 'svelte'
  import { planLokaShelfSetPieces } from '../render/loka-shelf-set-pieces'

  let {
    universeId,
    archiveIds,
    progress,
    reducedMotion,
    onskip = () => {},
  }: {
    universeId: string
    archiveIds: readonly string[]
    progress: Readonly<Record<string, number>>
    reducedMotion: boolean
    onskip?: (key: string) => void
  } = $props()

  let now = $state(Date.now())
  const plans = $derived(planLokaShelfSetPieces(universeId, archiveIds, progress, now, reducedMotion))
  const active = $derived(plans.find((plan) => plan.active) ?? null)

  onMount(() => {
    const timer = window.setInterval(() => (now = Date.now()), 100)
    return () => window.clearInterval(timer)
  })
</script>

<div class="shelf-set-pieces" data-active={active?.id ?? 'none'}>
  {#each plans.filter(({ completed }) => completed) as plan (plan.id)}
    <i class="shelf-landmark" class:active={plan.active} style={`--set-x:${plan.xPercent}%;--set-y:${plan.yPercent}%`} title={`${plan.title}: ${plan.staticEquivalent}`} aria-hidden="true"><b>{plan.shelfIndex}</b></i>
  {/each}
  {#if active}
    <section class="shelf-moment" class:reduced={active.reducedMotion} style={`--set-x:${active.xPercent}%;--set-y:${active.yPercent}%`} role="status" aria-live="polite" aria-atomic="true">
      <span aria-hidden="true">{active.shelfIndex}</span>
      <div><small>SHELF {active.shelfIndex} · IN THE WORLD</small><strong>{active.title}</strong><p>{active.reducedMotion ? active.staticEquivalent : active.moment}</p><i style={`--moment-progress:${active.progressFraction}`}></i></div>
      <button type="button" onclick={() => onskip(active.progressKey)}>Skip</button>
    </section>
  {/if}
</div>

<style>
  .shelf-set-pieces { position:absolute;inset:0;z-index:4;pointer-events:none; }
  .shelf-landmark { position:absolute;left:var(--set-x);top:var(--set-y);width:1.7rem;height:1.25rem;display:grid;place-items:center;transform:translate(-50%,-50%);color:var(--gold);border:1px solid color-mix(in srgb,var(--gold) 45%,transparent);border-radius:48% 48% 16% 16%;background:color-mix(in srgb,var(--bg) 78%,transparent);box-shadow:0 .25rem .55rem color-mix(in srgb,var(--bg) 72%,transparent);opacity:.72; }
  .shelf-landmark b { font:.45rem/1 system-ui,sans-serif; }.shelf-landmark.active { opacity:1;animation:set-piece-light 1.8s ease-in-out infinite alternate; }
  .shelf-moment { position:absolute;left:clamp(10rem,var(--set-x),calc(100% - 10rem));top:clamp(10rem,var(--set-y),calc(100% - 8rem));width:min(19rem,calc(100vw - 2rem));display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.55rem;padding:.55rem .65rem;transform:translate(-50%,-115%);color:var(--gold);background:color-mix(in srgb,var(--panel) 96%,#05070b);border:1px solid color-mix(in srgb,var(--gold) 48%,transparent);box-shadow:0 .8rem 2rem rgba(0,0,0,.65);pointer-events:auto; }
  .shelf-moment > span { width:1.65rem;height:1.65rem;display:grid;place-items:center;border:1px solid currentColor;border-radius:50%;font:700 .55rem/1 system-ui,sans-serif; }.shelf-moment small { display:block;color:var(--dim);font:750 .37rem/1 system-ui,sans-serif;letter-spacing:.13em; }.shelf-moment strong { display:block;margin-top:.14rem;font:650 .65rem/1.1 Georgia,serif; }.shelf-moment p { margin:.16rem 0 .28rem;color:var(--dim);font:.48rem/1.25 Georgia,serif; }
  .shelf-moment div > i { display:block;width:calc(var(--moment-progress) * 100%);height:2px;background:var(--gold);transition:width .1s linear; }.shelf-moment button { padding:.3rem .42rem;color:var(--dim);background:transparent;border:1px solid color-mix(in srgb,var(--gold) 22%,transparent);border-radius:.25rem;font-size:.42rem;cursor:pointer; }
  .shelf-moment.reduced div > i { width:100%;transition:none; }.shelf-moment.reduced { animation:none; }
  @keyframes set-piece-light { to { box-shadow:0 0 1rem color-mix(in srgb,var(--gold) 48%,transparent); } }
</style>
