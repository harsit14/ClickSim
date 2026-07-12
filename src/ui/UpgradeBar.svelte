<script lang="ts">
  import { availableUpgrades } from '../engine/compute'
  import { describeEffect, type UpgradeDef } from '../content/upgrades'
  import { game, hasUi, buyUpgrade } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'
  import { amountFromNumber, ltAmount } from '../core/numeric/amount'
  import SetPieceArt from './SetPieceArt.svelte'
  import { emberlightSetPieceStage } from '../render/emberlight/set-piece-registry'

  let { dense = false }: { dense?: boolean } = $props()
  const available = $derived(hasUi('upgrades') ? availableUpgrades(game) : [])
  const shown = $derived(available.slice(0, dense ? 6 : 9))
  const overflow = $derived(available.length - shown.length)
  let previewId = $state<string | null>(null)
  const preview = $derived(shown.find((u) => u.id === previewId) ?? null)
  const pack = $derived(universeById(game.activeUniverse))

  function tryBuy(id: string): boolean {
    const bought = buyUpgrade(id)
    if (!bought) return false
    playBuy()
    if (previewId === id) previewId = null
    return true
  }

  function clearPreviewIfFocusLeaves(event: FocusEvent) {
    const next = event.relatedTarget
    if (!(next instanceof Node) || !(event.currentTarget as HTMLElement).contains(next)) {
      previewId = null
    }
  }

  function upgradeGeneratorId(upgrade: UpgradeDef): string {
    const generatorEffect = upgrade.effects.find((effect) => effect.kind === 'genMult' || effect.kind === 'synergy')
    if (generatorEffect?.kind === 'genMult' || generatorEffect?.kind === 'synergy') return generatorEffect.gen
    return upgrade.unlock.gen ?? 'spark'
  }

  function targetCue(upgrade: UpgradeDef): string {
    const kinds = new Set(upgrade.effects.map(({ kind }) => kind))
    if ([...kinds].some((kind) => kind === 'clickMult' || kind === 'clickShare' || kind === 'critChance' || kind === 'critMult')) return 'Touch'
    if (kinds.has('globalMult')) return 'Global'
    if (kinds.has('synergy') || kinds.has('synergyMult')) return 'Resonance'
    const generatorId = upgradeGeneratorId(upgrade)
    return pack.generatorById.get(generatorId)?.name ?? 'Kindling'
  }
</script>

{#if shown.length > 0}
  <div
    class="upgrade-stack"
    role="group"
    aria-label="Available upgrades"
    onpointerleave={() => (previewId = null)}
    onfocusout={clearPreviewIfFocusLeaves}
  >
    <div class="bar">
      {#each shown as u (u.id)}
        {@const artifact = game.activeUniverse === 'emberlight'
          ? emberlightSetPieceStage(`ember-kindling-${upgradeGeneratorId(u)}`)
          : null}
        <button
          class="up"
          class:previewing={previewId === u.id}
          class:unaffordable={ltAmount(game.light, amountFromNumber(u.cost))}
          style:--hue={u.hue}
          aria-label={`${u.name}: ${u.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())).join(', ')}`}
          aria-describedby={previewId === u.id ? 'upgrade-preview' : undefined}
          onpointerenter={() => (previewId = u.id)}
          onpointerdown={() => (previewId = u.id)}
          onfocus={() => (previewId = u.id)}
          onclick={() => tryBuy(u.id)}
        >
          {#if artifact}
            <span class="artifact-icon"><SetPieceArt stage={artifact} monochrome /></span>
          {:else}
            <span class="glyph">{u.glyph}</span>
          {/if}
          <span class="target-cue">{targetCue(u)}</span>
        </button>
      {/each}
      {#if overflow > 0}
        <span class="more">+{overflow}</span>
      {/if}
    </div>
    {#if preview}
      <div id="upgrade-preview" class="detail" style:--hue={preview.hue}>
        <div class="detail-head"><strong>{preview.name}</strong><span>{targetCue(preview)}</span></div>
        <em>{preview.flavor}</em>
        <span class="fx"><b>Changes</b> · {preview.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())).join(' · ')}</span>
        <span class="price" class:ready={!ltAmount(game.light, amountFromNumber(preview.cost))}>
          {ltAmount(game.light, amountFromNumber(preview.cost)) ? 'Needs' : 'Ready'} · {pack.currencyGlyph} {format(preview.cost)}
        </span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .upgrade-stack {
    width: min(34rem, 96vw);
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    animation: bar-in 0.24s ease both;
    pointer-events: auto;
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    max-width: 100%;
  }
  @keyframes bar-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .up {
    position: relative;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--amber) 6%, hsla(var(--hue), 70%, 55%, 0.08));
    border: 1px solid hsla(var(--hue), 85%, 65%, 0.55);
    border-radius: 10px;
    cursor: pointer;
    padding: 0;
    box-shadow: inset 0 0 1rem color-mix(in srgb, var(--amber) 12%, transparent), 0 0 12px hsla(var(--hue), 90%, 60%, 0.18);
    transition: transform 0.08s, box-shadow 0.15s;
  }
  .up:not(.unaffordable):hover {
    box-shadow: 0 0 20px hsla(var(--hue), 90%, 60%, 0.5);
    transform: translateY(1px);
  }
  .up.previewing {
    border-color: hsl(var(--hue), 90%, 74%);
    box-shadow: 0 0 20px hsla(var(--hue), 90%, 60%, 0.45);
  }
  .up.unaffordable {
    opacity: 1;
    color: color-mix(in srgb, var(--text) 45%, var(--bg));
    background:
      linear-gradient(128deg, transparent 0 47%, color-mix(in srgb, var(--dim) 9%, transparent) 48% 50%, transparent 51%) 0 0 / 1.5rem 1.5rem,
      color-mix(in srgb, var(--bg) 86%, var(--panel));
    border-color: color-mix(in srgb, var(--dim) 12%, transparent);
    box-shadow: inset 0 0 0.9rem rgba(0, 0, 0, 0.28);
    cursor: default;
  }
  .up.unaffordable .artifact-icon,
  .up.unaffordable .glyph { color: color-mix(in srgb, var(--dim) 45%, var(--bg)); filter: none; }
  .glyph {
    font-size: 0.95rem;
    font-weight: 700;
    color: hsl(var(--hue), 90%, 72%);
  }
  .artifact-icon {
    width: 1.32rem;
    height: 1.32rem;
    color: hsl(var(--hue), 90%, 72%);
    filter: drop-shadow(0 0 0.25rem hsla(var(--hue), 90%, 60%, 0.36));
    animation: artifact-glint 560ms ease-out both;
  }
  .target-cue {
    position: absolute;
    left: 0.15rem;
    right: 0.15rem;
    bottom: 0.2rem;
    overflow: hidden;
    color: color-mix(in srgb, var(--text) 72%, var(--dim));
    font: 650 0.6875rem/1 system-ui, sans-serif;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .glyph, .artifact-icon { transform: translateY(-0.34rem); }
  @keyframes artifact-glint { from { opacity: 0.25; transform: scale(0.65); filter: brightness(2.2); } to { opacity: 1; transform: scale(1); } }
  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    width: min(25rem, 92vw);
    padding: 0.6rem 0.75rem;
    background: rgba(12, 11, 22, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 0.78rem;
    text-align: left;
    pointer-events: none;
    box-shadow: 0 0 26px rgba(8, 7, 18, 0.55);
    animation: detail-in 0.14s ease both;
  }
  .detail strong {
    color: var(--text);
  }
  .detail-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  .detail-head span { color: var(--amber); font-size: 0.6875rem; font-weight: 720; letter-spacing: 0.08em; text-transform: uppercase; }
  .detail em {
    color: var(--dim);
    font-family: Georgia, serif;
  }
  .detail .fx {
    color: hsl(var(--hue), 80%, 70%);
  }
  .detail .fx b { color: var(--dim); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.07em; }
  .detail .price {
    color: var(--gold);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .detail .price.ready { color: color-mix(in srgb, var(--gold) 78%, white); }
  @keyframes detail-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .more {
    font-size: 0.8rem;
    color: var(--dim);
  }
  @media (max-width: 800px) {
    .bar {
      overflow-x: auto;
      justify-content: flex-start;
      width: 100%;
      padding-bottom: 0.2rem;
    }
    .detail {
      width: min(25rem, 96vw);
    }
  }
</style>
