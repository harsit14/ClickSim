<script lang="ts">
  import type { UniverseId } from '../content/universes/types'
  import { emberlightSetPieceStage } from '../render/emberlight/set-piece-registry'
  import { tidefallSetPieceStageForSource } from '../render/tidefall/set-piece-registry'
  import { kindlingShopMark } from '../render/kindling-shop-marks'
  import SetPieceArt from './SetPieceArt.svelte'

  let {
    universeId,
    generatorId,
    tier,
    label,
  }: {
    universeId: UniverseId | string
    generatorId: string
    tier: number
    label: string
  } = $props()

  const stage = $derived(
    universeId === 'emberlight'
      ? emberlightSetPieceStage(`ember-kindling-${generatorId}`)
      : universeId === 'tidefall'
        ? tidefallSetPieceStageForSource(generatorId)
        : null,
  )
  const mark = $derived(kindlingShopMark(universeId as UniverseId, tier))
</script>

<span class="shop-art" class:authored-stage={!!stage} data-universe-art={universeId} data-tier={tier} title={`${label} shop silhouette`}>
  {#if stage}
    <SetPieceArt {stage} monochrome />
  {:else if mark}
    <svg viewBox="0 0 40 40" aria-hidden="true" data-family={mark.family} data-phase={mark.phase}>
      <path class="frame" d={mark.framePath}></path>
      <path class="body" d={mark.bodyPath}></path>
      <path class="accent" d={mark.accentPath}></path>
    </svg>
  {/if}
</span>

<style>
  .shop-art,
  svg { display: block; width: 100%; height: 100%; }
  .shop-art { color: inherit; }
  svg { overflow: visible; }
  path {
    vector-effect: non-scaling-stroke;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .frame { stroke-width: 0.78; opacity: 0.25; }
  .body { stroke-width: 1.7; opacity: 0.94; filter: drop-shadow(0 0 1.6px currentColor); }
  .accent { stroke: color-mix(in srgb, currentColor 54%, white); stroke-width: 1.05; opacity: 0.72; }
  [data-universe-art='verdance'] .frame { stroke-dasharray: 1.2 1.5; }
  [data-universe-art='clockwork'] path { stroke-linecap: square; }
  [data-universe-art='clockwork'] .accent { stroke-dasharray: 1.4 1; }
  [data-universe-art='prismata'] .body { stroke-width: 1.55; }
  [data-universe-art='prismata'] .accent { stroke: white; }
  [data-universe-art='tempest'] .accent { stroke-dasharray: 2 1.2; }
  [data-universe-art='canticle'] .frame { stroke-dasharray: 1.3 1.3; }
</style>
