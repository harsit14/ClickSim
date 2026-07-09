<script lang="ts">
  import {
    VESSEL_PARTS,
    vesselPartComplete,
    vesselPartCurrent,
    vesselPartReady,
    vesselProgress,
    type VesselPartDef,
  } from '../content/vessel'
  import { buildVesselPart, game, vesselComplete } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { playBuy, playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'

  let { onclose }: { onclose: () => void } = $props()

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
</script>

<section class="vessel">
  <header>
    <div>
      <h2>The Vessel</h2>
      <span>{game.vesselParts.length} / {VESSEL_PARTS.length} parts set</span>
    </div>
    <button class="close" onclick={onclose}>✕</button>
  </header>

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
    <p class="ready-note">All five pieces hold. The Crossing waits for a sky to open.</p>
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
  .ready-note {
    margin: 0.9rem 0 0;
    font-family: Georgia, serif;
    font-style: italic;
    text-align: center;
    color: rgba(210, 230, 255, 0.78);
  }
  @media (max-width: 620px) {
    .part {
      grid-template-columns: auto 1fr;
    }
    .state {
      grid-column: 2;
      min-width: 0;
      align-items: flex-start;
    }
  }
</style>
