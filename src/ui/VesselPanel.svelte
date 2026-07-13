<script lang="ts">
  import { onMount } from 'svelte'
  import {
    vesselBlueprint,
    vesselPartComplete,
    vesselPartCurrent,
    vesselPartIdsFor,
    vesselPartReady,
    vesselPartsForUniverse,
    vesselProgress,
    vesselStage,
    type VesselPartDef,
  } from '../content/vessel'
  import { vesselPartCopy } from '../content/universe-progression'
  import { UNIVERSES, universeById, type UniversePack } from '../content/universes'
  import { WAYFINDER_NODES, wayfinderNodeAvailable } from '../content/wayfinder'
  import {
    buildVesselPart,
    buyWayfinder,
    game,
    igniteCurrentBeacon,
    universeBeaconReady,
    universeRouteUnlocked,
    universeRouteVisible,
    universeVisited,
    vesselComplete,
  } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playBuy, playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'
  import { amountFromNumber, gteAmount, isZeroAmount } from '../core/numeric/amount'
  import LumenVaultShelf from './LumenVaultShelf.svelte'
  import SuccessionRelayHome from './SuccessionRelayHome.svelte'

  let { onclose, oncross }: { onclose: () => void; oncross: (universeId: string) => void } = $props()
  let closeButton: HTMLButtonElement

  onMount(() => closeButton.focus())

  const activePack = $derived(universeById(game.activeUniverse))
  const activeBlueprint = $derived(vesselBlueprint(game.activeUniverse))
  const activeParts = $derived(vesselPartsForUniverse(game.activeUniverse))
  const activePartIds = $derived(vesselPartIdsFor(game))
  const activeVesselComplete = $derived(vesselComplete())
  const visibleRoutes = $derived(UNIVERSES.filter(({ id }) => universeRouteVisible(id)))
  const hasReturnRoute = $derived(
    visibleRoutes.some(({ id }) => id !== game.activeUniverse && universeVisited(id)),
  )

  function progressText(part: VesselPartDef): string {
    if (part.id === 'archive') return game.ending === null ? 'unanswered' : 'answered'
    return `${format(vesselPartCurrent(game, part))} / ${format(part.target)}`
  }

  function tryBuild(part: VesselPartDef) {
    if (!buildVesselPart(part.id)) return
    if (vesselComplete()) playCollect()
    else playBuy()
    save()
    pushToast(
      vesselPartCopy(part, activePack.id).name,
      vesselComplete() ? activeBlueprint.completion : `${activeBlueprint.name} takes shape in ${activePack.shortName}.`,
      'vessel',
    )
  }

  function beaconProgress(pack: UniversePack): number {
    const owned = pack.id === game.activeUniverse ? game.owned : game.universeRuns[pack.id]?.owned
    return Math.min(pack.beacon.count, owned?.[pack.beacon.generatorId] ?? 0)
  }

  function tryLightBeacon() {
    const gained = igniteCurrentBeacon()
    if (isZeroAmount(gained)) return
    playCollect()
    save()
    pushToast(`${activePack.shortName} Beacon lit`, `◆ ${format(gained)} Dark Between recovered.`, 'wayfinder')
  }

  function tryBuyWayfinder(id: (typeof WAYFINDER_NODES)[number]['id']) {
    const node = WAYFINDER_NODES.find((entry) => entry.id === id)
    if (!node || !buyWayfinder(id)) return
    playBuy()
    save()
    pushToast(node.name, node.effect, 'wayfinder')
  }
</script>

<section class="vessel instrument-panel">
  <header>
    <div>
      <span class="overline">{activeBlueprint.overline}</span>
      <h2>{activeBlueprint.name}</h2>
      <span>{vesselStage(game)}</span>
    </div>
    <button bind:this={closeButton} class="close" aria-label="close the Vessel" onclick={onclose}>✕</button>
  </header>

  <p class="blueprint-intro">{activeBlueprint.description}</p>

  <div
    class="schematic"
    data-motif={activeBlueprint.motif}
    style:--vessel-hue={activePack.palette.accentHue}
    aria-hidden="true"
  >
    <span class="motif-field"></span>
    {#each activeParts as part, index (part.id)}
      <span
        class="motif-piece"
        class:lit={activePartIds.includes(part.id)}
        class:piece-0={index === 0}
        class:piece-1={index === 1}
        class:piece-2={index === 2}
        class:piece-3={index === 3}
        class:piece-4={index === 4}
        style:--piece-hue={part.hue}
      ><b>{part.glyph}</b></span>
    {/each}
    <span class="schematic-label">{activeParts.map(({ short }) => short).join(' · ')}</span>
  </div>

  <div class="parts">
    {#each activeParts as part (part.id)}
      {@const copy = vesselPartCopy(part, activePack.id)}
      {@const complete = vesselPartComplete(game, part.id)}
      {@const ready = vesselPartReady(game, part)}
      <article class="part" class:complete class:ready style:--hue={part.hue}>
        <span class="sigil">{complete ? '◆' : ready ? '✦' : '·'}</span>
        <div class="copy">
          <strong>{copy.name}</strong>
          <em>{copy.flavor}</em>
          <span>{copy.requirement}</span>
          <span class="meter" aria-hidden="true">
            <span style:width={`${vesselProgress(game, part) * 100}%`}></span>
          </span>
        </div>
        <div class="state">
          <span>{complete ? 'set' : progressText(part)}</span>
          {#if !complete}
            <button disabled={!ready || game.challenge !== null} onclick={() => tryBuild(part)}>
              {copy.action}
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if activeVesselComplete || hasReturnRoute}
    <section class="wayfinder" aria-labelledby="wayfinder-title">
      <header class="wayfinder-head">
        <div>
          <span class="overline">routes through the quiet</span>
          <h3 id="wayfinder-title">The Wayfinder</h3>
        </div>
        <div class="between"><strong>◆ {format(game.darkBetween)}</strong><span>Dark Between</span></div>
      </header>

      <div class="routes">
        {#each visibleRoutes as universe (universe.id)}
          {@const active = universe.id === game.activeUniverse}
          {@const visited = universeVisited(universe.id)}
          {@const unlocked = universeRouteUnlocked(universe.id)}
          {@const beaconLit = game.beacons.includes(universe.id)}
          {@const beaconReady = active && universeBeaconReady(universe.id)}
          <article class="route" class:active class:locked={!unlocked} style:--route-hue={universe.palette.accentHue}>
            <span class="route-glyph" aria-hidden="true">{universe.route.glyph}</span>
            <div class="route-copy">
              <span>{universe.route.epithet}</span>
              <strong>{universe.name}</strong>
              <p>{universe.description}</p>
              <small>{universe.twist.description}</small>
            </div>
            <div class="route-state">
              {#if beaconLit}
                <span class="beacon lit">✦ beacon lit</span>
              {:else if beaconReady}
                <button class="beacon-button" onclick={tryLightBeacon}>light Beacon · +◆{universe.beacon.reward}</button>
              {:else if active}
                <span class="beacon">Beacon {format(beaconProgress(universe))}/{format(universe.beacon.count)}</span>
              {/if}

              {#if active}
                <span class="anchored">anchored here</span>
              {:else if unlocked}
                <button class="cross-button" onclick={() => oncross(universe.id)}>
                  {visited ? 'return' : 'cross'} to {universe.shortName}
                </button>
              {:else}
                <span class="locked-copy">{universe.route.unlockText}</span>
              {/if}
            </div>
          </article>
        {/each}
      </div>

      {#if activeVesselComplete}
        <div class="wayfinder-tree">
          <span class="overline">what the vessel learns between worlds</span>
          {#each WAYFINDER_NODES as node (node.id)}
            {@const owned = game.wayfinder.includes(node.id)}
            {@const available = wayfinderNodeAvailable(game.wayfinder, node)}
            <article class="way-node" class:owned class:available>
              <span class="node-glyph">{node.glyph}</span>
              <div><strong>{node.name}</strong><em>{node.flavor}</em><span>{node.effect}</span></div>
              {#if owned}
                <span class="learned">learned</span>
              {:else}
                <button disabled={!available || !gteAmount(game.darkBetween, amountFromNumber(node.cost))} onclick={() => tryBuyWayfinder(node.id)}>◆ {node.cost}</button>
              {/if}
            </article>
          {/each}
        </div>

        <SuccessionRelayHome />
        <LumenVaultShelf home="vessel-wayfinder" />
      {/if}
    </section>
  {/if}

  {#if !activeVesselComplete}
    <section class="crossing-gate" aria-label="New universe routes locked">
      <span>{hasReturnRoute ? 'New routes sealed' : 'Wayfinder sealed'}</span>
      <strong>Complete {activeBlueprint.name} before entering an unseen realm from {activePack.shortName}.</strong>
      <p>
        Each realm must build and activate its own crossing vessel before entering an unseen realm.
        {hasReturnRoute ? ' Previously reached realms remain available above.' : ''}
      </p>
    </section>
  {/if}
</section>

<style>
  .vessel {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(31rem, 92vw);
    max-height: 82vh;
    overflow-y: auto;
    padding: 1rem 1.1rem;
    background: rgba(12, 10, 20, 0.95);
    border: 1px solid rgba(170, 220, 255, 0.22);
    border-radius: 14px;
    backdrop-filter: blur(12px);
    z-index: 9;
    animation: vessel-in 0.24s ease both;
    scrollbar-width: thin;
  }
  @keyframes vessel-in {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.8rem;
  }
  .schematic {
    position: relative;
    height: 7.5rem;
    margin: 0 0 0.9rem;
    overflow: hidden;
    border-radius: 10px;
    background:
      radial-gradient(circle at 50% 50%, hsla(var(--vessel-hue), 78%, 64%, 0.12), transparent 32%),
      linear-gradient(120deg, hsla(var(--vessel-hue), 65%, 46%, 0.05), transparent 46%),
      rgba(255, 255, 255, 0.025);
    border: 1px solid hsla(var(--vessel-hue), 72%, 72%, 0.16);
  }
  .motif-field {
    position: absolute;
    inset: 16% 9% 22%;
    border: 1px solid hsla(var(--vessel-hue), 70%, 74%, 0.1);
    border-radius: 50%;
  }
  .motif-field::before,
  .motif-field::after {
    content: '';
    position: absolute;
    left: 8%;
    right: 8%;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, hsla(var(--vessel-hue), 76%, 74%, 0.18), transparent);
  }
  .motif-field::after { transform: rotate(90deg); }
  .motif-piece {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2.2rem;
    height: 2.2rem;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    color: hsl(var(--piece-hue), 86%, 75%);
    border: 1px solid hsla(var(--piece-hue), 78%, 72%, 0.56);
    background: hsla(var(--piece-hue), 68%, 48%, 0.1);
    opacity: 0.22;
    transition: opacity 0.2s, filter 0.2s, background 0.2s;
  }
  .motif-piece b {
    position: relative;
    z-index: 2;
    font: 700 0.72rem/1 ui-monospace, monospace;
  }
  .motif-piece.lit {
    opacity: 1;
    background: hsla(var(--piece-hue), 72%, 54%, 0.2);
    filter: drop-shadow(0 0 10px hsla(var(--piece-hue), 82%, 64%, 0.34));
  }
  .schematic-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.35rem;
    text-align: center;
    color: hsla(var(--vessel-hue), 58%, 78%, 0.48);
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  [data-motif='starship'] .piece-0 { left: 42%; top: 58%; width: 9rem; height: 2.8rem; border-radius: 0 0 70% 70%; }
  [data-motif='starship'] .piece-1 { left: 49%; top: 32%; width: 6rem; height: 4.2rem; clip-path: polygon(50% 0, 100% 88%, 50% 72%, 0 88%); }
  [data-motif='starship'] .piece-2 { left: 50%; top: 58%; width: 1.4rem; height: 1.4rem; border-radius: 50%; }
  [data-motif='starship'] .piece-3 { left: 45%; top: 72%; width: 9rem; height: 0.45rem; border-radius: 50%; }
  [data-motif='starship'] .piece-4 { left: 67%; top: 51%; width: 1.5rem; height: 1.8rem; border-radius: 0.25rem; }

  [data-motif='bathysphere'] .motif-field { inset: 9% 25% 20%; border-width: 2px; }
  [data-motif='bathysphere'] .piece-0 { width: 5.7rem; height: 5.7rem; border-radius: 50%; }
  [data-motif='bathysphere'] .piece-1 { width: 10rem; height: 2.2rem; clip-path: polygon(0 50%, 25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%); }
  [data-motif='bathysphere'] .piece-2 { width: 1.8rem; height: 1.8rem; border-radius: 50%; }
  [data-motif='bathysphere'] .piece-3 { top: 72%; width: 4.5rem; height: 0.55rem; border-radius: 999px; }
  [data-motif='bathysphere'] .piece-4 { left: 65%; top: 33%; width: 1.7rem; height: 2rem; border-radius: 45% 45% 20% 20%; }

  [data-motif='seed-ark'] .motif-field { inset: 7% 31% 18%; border-radius: 65% 35% 60% 40%; transform: rotate(-16deg); }
  [data-motif='seed-ark'] .piece-0 { width: 5.3rem; height: 6.2rem; border-radius: 65% 35% 60% 40%; transform: translate(-50%, -50%) rotate(-16deg); }
  [data-motif='seed-ark'] .piece-1 { left: 38%; top: 31%; width: 3.8rem; height: 1.8rem; border-radius: 100% 0 100% 0; transform: translate(-50%, -50%) rotate(24deg); }
  [data-motif='seed-ark'] .piece-2 { width: 1.7rem; height: 2.4rem; border-radius: 50%; }
  [data-motif='seed-ark'] .piece-3 { left: 60%; top: 35%; width: 2.2rem; height: 2.2rem; border-radius: 50%; }
  [data-motif='seed-ark'] .piece-4 { top: 70%; width: 5rem; height: 1.2rem; border-width: 0 0 1px; border-radius: 50%; }

  [data-motif='clock-engine'] .motif-field { inset: 8% 31% 18%; border: 2px dotted hsla(var(--vessel-hue), 70%, 74%, 0.2); }
  [data-motif='clock-engine'] .piece-0 { width: 6.2rem; height: 6.2rem; border: 0.45rem double hsla(var(--piece-hue), 78%, 72%, 0.56); border-radius: 50%; }
  [data-motif='clock-engine'] .piece-1 { width: 4.6rem; height: 4.6rem; border: 0.3rem dashed hsla(var(--piece-hue), 78%, 72%, 0.56); border-radius: 50%; }
  [data-motif='clock-engine'] .piece-2 { width: 2.3rem; height: 2.3rem; border: 0.35rem double hsla(var(--piece-hue), 78%, 72%, 0.56); border-radius: 50%; }
  [data-motif='clock-engine'] .piece-3 { width: 0.35rem; height: 4.7rem; transform: translate(-50%, -50%) rotate(32deg); }
  [data-motif='clock-engine'] .piece-4 { left: 66%; top: 35%; width: 2rem; height: 2.4rem; border-radius: 0.2rem; }

  [data-motif='spectrum-prism'] .motif-field { inset: 8% 24% 18%; border-radius: 48% 48% 12% 12%; background: repeating-linear-gradient(0deg, transparent 0 .7rem, hsla(var(--vessel-hue),70%,74%,.07) .72rem .76rem); }
  [data-motif='spectrum-prism'] .piece-0 { width: 7.5rem; height: 4.9rem; border-radius: 55% 45% 15% 15%; }
  [data-motif='spectrum-prism'] .piece-1 { left: 67%; top: 48%; width: 5.5rem; height: 3.7rem; border-radius: 60% 40% 60% 40%; }
  [data-motif='spectrum-prism'] .piece-2 { width: 2rem; height: 2rem; transform: translate(-50%, -50%) rotate(45deg); border-style: dashed; }
  [data-motif='spectrum-prism'] .piece-3 { left: 33%; width: 5.5rem; height: .45rem; }
  [data-motif='spectrum-prism'] .piece-4 { top: 70%; width: 3.8rem; height: 1.25rem; border-radius: 70% 30% 70% 30%; }

  [data-motif='storm-conductor'] .motif-field { inset: 18% 16% 25%; border-radius: 50%; border-left-style: dashed; }
  [data-motif='storm-conductor'] .piece-0 { top: 43%; width: 9rem; height: 3.3rem; border-radius: 55% 55% 18% 18%; }
  [data-motif='storm-conductor'] .piece-1 { top: 62%; width: 7.5rem; height: 2.3rem; border-radius: 50%; border-left-style: dashed; }
  [data-motif='storm-conductor'] .piece-2 { left: 31%; top: 64%; width: 4rem; height: .45rem; transform: translate(-50%,-50%) rotate(18deg); }
  [data-motif='storm-conductor'] .piece-3 { left: 69%; top: 64%; width: 4rem; height: .45rem; transform: translate(-50%,-50%) rotate(-18deg); }
  [data-motif='storm-conductor'] .piece-4 { width: 2.3rem; height: 1.7rem; border-radius: 55% 55% 18% 18%; }

  [data-motif='resonant-chamber'] .motif-field { inset:12% 18% 16%;border:1px solid hsla(var(--vessel-hue),70%,74%,.14);border-left-color:transparent;border-radius:50%; }
  [data-motif='resonant-chamber'] .piece-0 { top:58%;width:10rem;height:5.2rem;clip-path:polygon(0 100%,18% 62%,34% 72%,54% 8%,70% 70%,82% 55%,100% 100%);border-radius:0;background:hsla(var(--piece-hue),55%,38%,.16); }
  [data-motif='resonant-chamber'] .piece-1 { left:54%;top:58%;width:.25rem;height:7rem;transform:translate(-50%,-50%) rotate(7deg);border-radius:999px; }
  [data-motif='resonant-chamber'] .piece-2 { left:26%;top:72%;width:2.4rem;height:1.4rem;border-radius:55% 55% 0 0; }
  [data-motif='resonant-chamber'] .piece-3 { left:74%;top:72%;width:2.4rem;height:1.4rem;border-radius:55% 55% 0 0; }
  [data-motif='resonant-chamber'] .piece-4 { top:52%;width:8rem;height:8rem;border-left-color:transparent;border-radius:50%; }

  .blueprint-intro {
    margin: -0.25rem 0 0.65rem;
    color: var(--dim);
    font: italic 0.72rem/1.4 Georgia, serif;
  }
  h2 {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #bfeaff;
  }
  header span {
    display: block;
    margin-top: 0.18rem;
    font-size: 0.74rem;
    color: var(--dim);
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.95rem;
    cursor: pointer;
  }
  .parts {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }
  .part {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.7rem;
    align-items: center;
    padding: 0.72rem;
    background: hsla(var(--hue), 80%, 50%, 0.045);
    border: 1px solid hsla(var(--hue), 80%, 70%, 0.14);
    border-radius: 10px;
  }
  .part.ready {
    border-color: hsla(var(--hue), 90%, 72%, 0.42);
    box-shadow: 0 0 18px hsla(var(--hue), 90%, 60%, 0.12);
  }
  .part.complete {
    background: hsla(var(--hue), 80%, 50%, 0.1);
    border-color: hsla(var(--hue), 90%, 72%, 0.5);
  }
  .sigil {
    width: 1.35rem;
    display: grid;
    place-items: center;
    color: hsl(var(--hue), 90%, 72%);
    text-shadow: 0 0 12px hsla(var(--hue), 90%, 65%, 0.45);
  }
  .copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  strong {
    font-size: 0.9rem;
    color: var(--text);
  }
  em {
    font-family: Georgia, serif;
    font-size: 0.77rem;
    line-height: 1.3;
    color: var(--dim);
  }
  .copy > span:not(.meter) {
    font-size: 0.74rem;
    color: hsl(var(--hue), 80%, 73%);
  }
  .meter {
    width: 100%;
    height: 0.28rem;
    margin-top: 0.18rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
  }
  .meter span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, hsl(var(--hue), 90%, 62%), hsl(var(--hue), 90%, 76%));
  }
  .state {
    min-width: 6.4rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
  }
  .state span {
    font-size: 0.72rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .state button {
    padding: 0.32rem 0.62rem;
    font: inherit;
    font-size: 0.72rem;
    font-weight: 700;
    color: #061018;
    background: linear-gradient(180deg, #d7f3ff, #72d8ff);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
  }
  .state button:disabled {
    opacity: 0.38;
    cursor: default;
  }
  .wayfinder {
    margin-top: 0.9rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(170, 220, 255, 0.13);
  }
  .crossing-gate {
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
    margin-top: 0.9rem;
    padding: 0.78rem 0.85rem;
    background: color-mix(in srgb, var(--amber) 6%, transparent);
    border: 1px dashed color-mix(in srgb, var(--amber) 22%, transparent);
    border-radius: 10px;
  }
  .crossing-gate > span {
    color: var(--dim);
    font-size: 0.55rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .crossing-gate strong { color: var(--gold); font-size: 0.78rem; }
  .crossing-gate p { margin: 0; color: var(--dim); font-size: 0.68rem; line-height: 1.4; }
  .wayfinder-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.65rem;
  }
  .overline {
    display: block;
    margin-bottom: 0.18rem;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(155, 218, 240, 0.64);
  }
  h3 { margin: 0; font-family: Georgia, serif; font-size: 1.15rem; font-weight: 500; color: #d7f3ff; }
  .between { display: flex; flex-direction: column; align-items: flex-end; }
  .between strong { color: #bfeaff; font-size: 0.9rem; }
  .between span { font-size: 0.58rem; color: var(--dim); }
  .routes { display: grid; gap: 0.55rem; }
  .route {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.7rem;
    align-items: center;
    padding: 0.75rem;
    background: hsla(var(--route-hue), 60%, 35%, 0.07);
    border: 1px solid hsla(var(--route-hue), 80%, 70%, 0.18);
    border-radius: 11px;
  }
  .route.active { border-color: hsla(var(--route-hue), 85%, 74%, 0.45); box-shadow: inset 0 0 28px hsla(var(--route-hue), 70%, 50%, 0.07); }
  .route.locked { opacity: 0.48; }
  .route-glyph { width: 2rem; height: 2rem; display: grid; place-items: center; color: hsl(var(--route-hue), 90%, 76%); border: 1px solid hsla(var(--route-hue), 80%, 70%, 0.24); border-radius: 50%; box-shadow: 0 0 16px hsla(var(--route-hue), 70%, 55%, 0.14); }
  .route-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.08rem; }
  .route-copy > span { font-size: 0.52rem; letter-spacing: 0.12em; text-transform: uppercase; color: hsl(var(--route-hue), 65%, 72%); }
  .route-copy strong { font-family: Georgia, serif; font-size: 0.92rem; }
  .route-copy p { margin: 0.15rem 0; font-size: 0.67rem; line-height: 1.35; color: var(--dim); }
  .route-copy small { font-size: 0.58rem; color: rgba(173, 214, 226, 0.74); }
  .route-state { min-width: 7.8rem; display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; }
  .beacon,
  .anchored,
  .locked-copy { font-size: 0.58rem; color: var(--dim); text-align: right; }
  .beacon.lit { color: hsl(var(--route-hue), 85%, 74%); }
  .beacon-button,
  .cross-button,
  .way-node button {
    padding: 0.35rem 0.62rem;
    font: inherit;
    font-size: 0.62rem;
    font-weight: 750;
    color: #061018;
    background: linear-gradient(180deg, #d7f3ff, #72d8ff);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
  }
  .wayfinder-tree { display: grid; gap: 0.4rem; margin-top: 0.85rem; }
  .way-node {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: center;
    padding: 0.58rem 0.65rem;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 9px;
    opacity: 0.5;
  }
  .way-node.available,
  .way-node.owned { opacity: 1; }
  .way-node.owned { border-color: rgba(170, 220, 255, 0.26); }
  .node-glyph { color: #bfeaff; }
  .way-node > div { display: flex; flex-direction: column; gap: 0.08rem; }
  .way-node strong { font-size: 0.76rem; }
  .way-node em { font-size: 0.65rem; }
  .way-node > div span { font-size: 0.6rem; color: #9fd8ef; }
  .way-node button:disabled { opacity: 0.35; cursor: default; }
  .learned { font-size: 0.58rem; color: #9fd8ef; text-transform: uppercase; letter-spacing: 0.08em; }
  @media (max-width: 620px) {
    .part {
      grid-template-columns: auto 1fr;
    }
    .state {
      grid-column: 2;
      min-width: 0;
      align-items: flex-start;
    }
    .route { grid-template-columns: auto minmax(0, 1fr); }
    .route-state { grid-column: 2; min-width: 0; align-items: flex-start; }
    .beacon,
    .anchored,
    .locked-copy { text-align: left; }
  }
</style>
