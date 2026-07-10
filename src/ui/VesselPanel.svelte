<script lang="ts">
  import {
    VESSEL_PARTS,
    vesselPartComplete,
    vesselPartCurrent,
    vesselPartReady,
    vesselProgress,
    vesselStage,
    type VesselPartDef,
  } from '../content/vessel'
  import { UNIVERSES, universeById, type UniversePack } from '../content/universes'
  import { WAYFINDER_NODES, wayfinderNodeAvailable } from '../content/wayfinder'
  import {
    buildVesselPart,
    buyWayfinder,
    game,
    igniteCurrentBeacon,
    universeBeaconReady,
    universeRouteUnlocked,
    universeVisited,
    vesselComplete,
  } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playBuy, playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'

  let { onclose, oncross }: { onclose: () => void; oncross: (universeId: string) => void } = $props()

  const activePack = $derived(universeById(game.activeUniverse))

  function progressText(part: VesselPartDef): string {
    if (part.id === 'archive') return game.ending === null ? 'unanswered' : 'answered'
    return `${format(vesselPartCurrent(game, part))} / ${format(part.target)}`
  }

  function tryBuild(part: VesselPartDef) {
    if (!buildVesselPart(part.id)) return
    if (vesselComplete()) playCollect()
    else playBuy()
    save()
    pushToast(part.name, 'The Vessel takes shape in the dark.', 'vessel')
  }

  function beaconProgress(pack: UniversePack): number {
    const owned = pack.id === game.activeUniverse ? game.owned : game.universeRuns[pack.id]?.owned
    return Math.min(pack.beacon.count, owned?.[pack.beacon.generatorId] ?? 0)
  }

  function tryLightBeacon() {
    const gained = igniteCurrentBeacon()
    if (gained <= 0) return
    playCollect()
    save()
    pushToast(`${activePack.shortName} Beacon lit`, `◆ ${gained} Dark Between recovered.`, 'wayfinder')
  }

  function tryBuyWayfinder(id: (typeof WAYFINDER_NODES)[number]['id']) {
    const node = WAYFINDER_NODES.find((entry) => entry.id === id)
    if (!node || !buyWayfinder(id)) return
    playBuy()
    save()
    pushToast(node.name, node.effect, 'wayfinder')
  }
</script>

<section class="vessel">
  <header>
    <div>
      <h2>The Vessel</h2>
      <span>{vesselStage(game)}</span>
    </div>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <div class="schematic" aria-hidden="true">
    <span class="keel" class:lit={game.vesselParts.includes('keel-trials')}></span>
    <span class="hull" class:lit={game.vesselParts.includes('hull-hearths')}></span>
    <span class="mast"></span>
    <span class="sail left" class:lit={game.vesselParts.includes('sails-constellation')}></span>
    <span class="sail right" class:lit={game.vesselParts.includes('sails-constellation')}></span>
    <span class="heart" class:lit={game.vesselParts.includes('heart-sun')}></span>
    <span class="archive" class:lit={game.vesselParts.includes('archive')}></span>
  </div>

  <div class="parts">
    {#each VESSEL_PARTS as part (part.id)}
      {@const complete = vesselPartComplete(game, part.id)}
      {@const ready = vesselPartReady(game, part)}
      <article class="part" class:complete class:ready style:--hue={part.hue}>
        <span class="sigil">{complete ? '◆' : ready ? '✦' : '·'}</span>
        <div class="copy">
          <strong>{part.name}</strong>
          <em>{part.flavor}</em>
          <span>{part.requirement}</span>
          <span class="meter" aria-hidden="true">
            <span style:width={`${vesselProgress(game, part) * 100}%`}></span>
          </span>
        </div>
        <div class="state">
          <span>{complete ? 'set' : progressText(part)}</span>
          {#if !complete}
            <button disabled={!ready || game.challenge !== null} onclick={() => tryBuild(part)}>
              {part.action}
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if vesselComplete()}
    <section class="wayfinder" aria-labelledby="wayfinder-title">
      <header class="wayfinder-head">
        <div>
          <span class="overline">routes through the quiet</span>
          <h3 id="wayfinder-title">The Wayfinder</h3>
        </div>
        <div class="between"><strong>◆ {game.darkBetween}</strong><span>Dark Between</span></div>
      </header>

      <div class="routes">
        {#each UNIVERSES as universe (universe.id)}
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
              <button disabled={!available || game.darkBetween < node.cost} onclick={() => tryBuyWayfinder(node.id)}>◆ {node.cost}</button>
            {/if}
          </article>
        {/each}
      </div>
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
    animation: vessel-in 0.45s ease both;
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
      radial-gradient(circle at 48% 68%, rgba(255, 217, 138, 0.12), transparent 28%),
      radial-gradient(circle at 20% 30%, rgba(135, 215, 255, 0.1), transparent 26%),
      rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(170, 220, 255, 0.12);
  }
  .schematic::before,
  .schematic::after {
    content: '';
    position: absolute;
    inset: auto 12% 24% 12%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(170, 220, 255, 0.16), transparent);
  }
  .schematic::after {
    inset: 24% 18% auto 18%;
    opacity: 0.45;
  }
  .keel,
  .hull,
  .mast,
  .sail,
  .heart,
  .archive {
    position: absolute;
    display: block;
    opacity: 0.32;
    transition: opacity 0.2s, filter 0.2s;
  }
  .lit {
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba(150, 220, 255, 0.28));
  }
  .keel {
    left: 32%;
    right: 28%;
    bottom: 26%;
    height: 2px;
    background: #ff8d67;
  }
  .hull {
    left: 24%;
    right: 20%;
    bottom: 28%;
    height: 2.8rem;
    border-bottom: 3px solid #ffc47d;
    border-radius: 0 0 70% 70%;
    transform: skewX(-8deg);
  }
  .mast {
    left: 48%;
    bottom: 29%;
    width: 2px;
    height: 4.8rem;
    background: rgba(205, 238, 255, 0.55);
    opacity: 0.7;
  }
  .sail {
    bottom: 39%;
    width: 4.2rem;
    height: 3.8rem;
    border: 1px solid rgba(205, 238, 255, 0.75);
    background: rgba(170, 220, 255, 0.12);
  }
  .sail.left {
    right: 51%;
    clip-path: polygon(100% 0, 100% 100%, 0 84%);
  }
  .sail.right {
    left: 51%;
    clip-path: polygon(0 12%, 0 100%, 100% 86%);
  }
  .heart {
    left: 47.5%;
    bottom: 33%;
    width: 0.72rem;
    height: 0.72rem;
    border-radius: 50%;
    background: #ffe28d;
    box-shadow: 0 0 20px rgba(255, 210, 100, 0.55);
  }
  .archive {
    left: 59%;
    bottom: 35%;
    width: 0.95rem;
    height: 1.1rem;
    border: 1px solid rgba(220, 205, 255, 0.8);
    border-radius: 3px;
    background: rgba(220, 205, 255, 0.12);
  }
  h2 {
    margin: 0;
    font-size: 0.72rem;
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
