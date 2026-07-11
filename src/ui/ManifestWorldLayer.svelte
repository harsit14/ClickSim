<script lang="ts">
  import { onMount } from 'svelte'
  import type { UniversePackV2, WorldObjectManifest } from '../content/universes'
  import type { CuriosityDef } from '../content/curiosities'
  import {
    planManifestLayout,
    type ManifestObjectRenderPlan,
    type ManifestRenderPreferences,
    type ManifestViewport,
  } from '../render/manifest-layout'
  import {
    archiveHintPlacement,
    planArchiveLandmarks,
    type ArchiveLandmarkMode,
  } from '../render/archive-landmarks'
  import type { HudClearanceRect } from '../render/hud-clearance'
  import { archiveLandmarkDescriptorsFor } from '../render/archive-landmark-registry'
  import { heartPresentationStateKey } from '../render/presentation-contract'
  import {
    presentationWorldStateAt,
    universePresentationById,
  } from '../render/presentation-registry'
  import ArchiveRecordArt from './ArchiveRecordArt.svelte'
  import ChamberVistaLayer from './ChamberVistaLayer.svelte'
  import ClockworkFlagshipLayer from './ClockworkFlagshipLayer.svelte'
  import EmberlightFlagshipLayer from './EmberlightFlagshipLayer.svelte'
  import EmberlightRemnants from './EmberlightRemnants.svelte'
  import KindledSky from './KindledSky.svelte'
  import TidefallFlagshipLayer from './TidefallFlagshipLayer.svelte'

  interface Props {
    pack: UniversePackV2
    owned: Readonly<Record<string, number>>
    preferences: ManifestRenderPreferences
    archiveItems?: readonly CuriosityDef[]
    unlockedArchiveIds?: readonly string[]
    litBeaconUniverseIds?: readonly string[]
    activeOmenIds?: readonly string[]
    achievementIds?: readonly string[]
    numericLawState?: Readonly<Record<string, import('../content/universes/types').EconomyAmount>>
    onarchiveopen?: () => void
  }

  const VERDANCE_LEAVES = [
    ['9%', '30%', '-18deg'], ['13%', '20%', '12deg'], ['31%', '54%', '-8deg'],
    ['68%', '57%', '14deg'], ['87%', '19%', '-12deg'], ['91%', '33%', '18deg'],
  ] as const

  let {
    pack,
    owned,
    preferences,
    archiveItems = [],
    unlockedArchiveIds = [],
    litBeaconUniverseIds = [],
    activeOmenIds = [],
    achievementIds = [],
    numericLawState,
    onarchiveopen = () => {},
  }: Props = $props()
  let viewport = $state<ManifestViewport>({ width: 1280, height: 720 })
  let topUiClearance = $state<HudClearanceRect | undefined>(undefined)
  let now = $state(Date.now())
  let leviathanPreview = $state(false)

  const presentation = $derived(universePresentationById(pack.id))
  const manifestByObjectId = $derived(new Map(pack.visual.objects.map((object) => [object.id, object])))
  const archiveIdSet = $derived(new Set(unlockedArchiveIds))
  const activeOmenIdSet = $derived(new Set(activeOmenIds))
  const beaconLit = $derived(litBeaconUniverseIds.includes(pack.id))

  function objectVisible(object: WorldObjectManifest): boolean {
    if (object.sourceKind === 'generator') return (owned[object.sourceId] ?? 0) > 0
    if (object.sourceKind === 'archive') return archiveIdSet.has(object.sourceId)
    if (object.sourceKind === 'omen') return activeOmenIdSet.has(object.sourceId)
    if (object.sourceKind === 'beacon') return beaconLit
    return false
  }

  const visibleObjectIds = $derived(pack.visual.objects.filter(objectVisible).map(({ id }) => id))
  const virginWorld = $derived(visibleObjectIds.length === 0)
  const objectCountsById = $derived(Object.fromEntries(pack.visual.objects.map((object) => [
    object.id,
    object.sourceKind === 'generator'
      ? owned[object.sourceId] ?? 0
      : objectVisible(object) ? 1 : 0,
  ])))
  const plan = $derived(planManifestLayout({
    visual: pack.visual,
    heart: pack.heart,
    viewport,
    state: {
      visibleObjectIds,
      ownershipBySourceId: owned,
      objectCountsById,
    },
    preferences,
  }))
  const heartState = $derived(presentation?.heart.states[heartPresentationStateKey(plan.heart.state)] ?? null)
  const worldState = $derived(presentationWorldStateAt(pack.id, now))
  const sceneStrength = $derived(Math.min(1, 0.3 + plan.objects.length / 12))
  const archiveMode = $derived<ArchiveLandmarkMode>(
    preferences.reducedMotion ? 'reduced-motion' : preferences.quality === 'low' ? 'low-quality' : 'standard',
  )
  const archiveRecordById = $derived(new Map(pack.archive.records.map((record) => [record.id, record])))
  const archiveItemById = $derived(new Map(archiveItems.map((item) => [item.id, item])))
  const archiveLandmarkPlan = $derived(planArchiveLandmarks(
    pack,
    unlockedArchiveIds,
    archiveLandmarkDescriptorsFor(pack.id),
    archiveMode,
    viewport,
    topUiClearance,
  ))

  function measure() {
    viewport = {
      width: Math.max(320, window.innerWidth),
      height: Math.max(480, window.innerHeight),
    }
    const topStack = document.querySelector<HTMLElement>('.top-stack')
    const rect = topStack?.getBoundingClientRect()
    topUiClearance = rect && rect.width > 0 && rect.height > 0
      ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      : undefined
  }

  function countLabel(count: number): string {
    if (count === 1) return '1 owned'
    return `${count.toLocaleString()} owned`
  }

  function statusLabel(object: ManifestObjectRenderPlan, count: number): string {
    const sourceKind = manifestByObjectId.get(object.objectId)?.sourceKind
    if (sourceKind === 'archive') return 'Archive record collected'
    if (sourceKind === 'beacon') return 'Beacon lit'
    if (sourceKind === 'omen') return 'Omen active'
    if (sourceKind === 'story') return 'World landmark formed'
    return countLabel(count)
  }

  onMount(() => {
    measure()
    const topStack = document.querySelector<HTMLElement>('.top-stack')
    const topStackObserver = topStack && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null
    if (topStack && topStackObserver) topStackObserver.observe(topStack)
    leviathanPreview = import.meta.env.DEV
      && new URLSearchParams(window.location.search).get('tide-omen') === 'leviathan'
    const timer = setInterval(() => (now = Date.now()), 500)
    return () => {
      topStackObserver?.disconnect()
      clearInterval(timer)
    }
  })
</script>

<svelte:window onresize={measure} />

<section
  class="manifest-world"
  class:emberlight={pack.id === 'emberlight'}
  class:tidefall={pack.id === 'tidefall'}
  class:verdance={pack.id === 'verdance'}
  class:clockwork={pack.id === 'clockwork'}
  class:prismata={pack.id === 'prismata'}
  class:tempest={pack.id === 'tempest'}
  class:canticle={pack.id === 'canticle'}
  class:motion-paused={preferences.reducedMotion}
  aria-label={`${pack.identity.shortName} authored world`}
  data-universe-v2={pack.id}
  data-layout-diagnostics={plan.diagnostics.length}
  data-visible-objects={plan.objects.length}
  data-presentation-ready={presentation !== null}
  data-world-state={worldState?.key ?? 'none'}
  data-virgin-state={virginWorld}
  style={`--scene-strength:${sceneStrength}`}
>
  <h2 class="sr-only">Visible {pack.identity.shortName} world</h2>

  {#if presentation}
    {#if !virginWorld}
    <div class="scene-composition" aria-hidden="true">
      <div class="scene-vignette"></div>
      {#if pack.id === 'verdance'}
        <div class="verdance-canopy"></div>
        <div class="verdance-roots"></div>
        <div class="verdance-ring growth-ring-one"></div>
        <div class="verdance-ring growth-ring-two"></div>
        <div class="verdance-leaves">
          {#each VERDANCE_LEAVES as leaf}
            <i style={`--x:${leaf[0]};--y:${leaf[1]};--leaf-rotation:${leaf[2]}`}></i>
          {/each}
        </div>
      {:else if pack.id === 'prismata'}
        <div class="prismata-darkroom"></div>
        <div class="prismata-aperture"></div>
        <div class="prismata-world-prism"></div>
        <div class="prismata-spectrum"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="prismata-detector"></div>
        <div class="prismata-caustic"></div>
      {:else if pack.id === 'tempest'}
        <div class="tempest-depth"></div>
        <div class="tempest-anvil"><i></i><i></i><i></i></div>
        <div class="tempest-rain"></div>
        <div class="tempest-charge positive-charge"></div>
        <div class="tempest-charge negative-charge"></div>
        <div class="tempest-front"></div>
        <div class="tempest-leader"><i></i><i></i><i></i></div>
        <div class="tempest-magnetosphere"></div>
      {:else if pack.id === 'canticle'}
        <div class="canticle-plate"></div>
        <div class="canticle-nodal nodal-one"></div>
        <div class="canticle-nodal nodal-two"></div>
        <div class="canticle-nodal nodal-three"></div>
        <div class="canticle-node node-one"></div>
        <div class="canticle-node node-two"></div>
        <div class="canticle-node node-three"></div>
        <div class="canticle-wave wave-one"></div>
        <div class="canticle-wave wave-two"></div>
        <div class="canticle-rest"></div>
      {/if}
    </div>
    {/if}

    <ChamberVistaLayer
      universeId={pack.id}
      generatorIds={pack.visual.objects
        .filter(({ sourceKind }) => sourceKind === 'generator')
        .map(({ sourceId }) => sourceId)}
      {owned}
      {numericLawState}
      reducedMotion={preferences.reducedMotion}
      quality={preferences.quality}
    />

    {#if pack.id === 'emberlight'}
      <EmberlightFlagshipLayer owned={owned} reducedMotion={preferences.reducedMotion} />
      <EmberlightRemnants owned={owned} />
      <KindledSky {achievementIds} reducedMotion={preferences.reducedMotion} />
    {/if}

    {#if pack.id === 'tidefall' && !virginWorld}
      <TidefallFlagshipLayer
        {owned}
        reducedMotion={preferences.reducedMotion}
        leviathanActive={activeOmenIdSet.has('leviathan-passage') || leviathanPreview}
      />
    {/if}

    {#if pack.id === 'clockwork' && !virginWorld}
      <ClockworkFlagshipLayer {owned} reducedMotion={preferences.reducedMotion} />
    {/if}

    {#if worldState}
      <p class="sr-only" role="status">{worldState.label}</p>
    {/if}

    {#if heartState && !virginWorld && pack.id !== 'emberlight'}
      <figure
        class="manifest-heart"
        data-depth={presentation.heart.depth}
        data-heart-id={presentation.heart.id}
        data-state-source={plan.heart.state.source}
        data-geometry={heartState.geometryLabel}
        data-occlusion={presentation.heart.occlusion}
        style={`left:${plan.heart.rect.x}px;top:${plan.heart.rect.y}px;width:${plan.heart.rect.width}px;height:${plan.heart.rect.height}px`}
        aria-hidden="true"
      >
        <span class="heart-frame"><i></i></span>
      </figure>
    {/if}

    <div
      class="archive-landmarks"
      data-landmark-count={archiveLandmarkPlan.landmarks.length}
      aria-label={`${pack.archive.localName} visible landmarks`}
    >
      {#each archiveLandmarkPlan.landmarks as landmark (landmark.id)}
        {@const record = archiveRecordById.get(landmark.representativeRecordId)}
        {@const item = archiveItemById.get(landmark.representativeRecordId)}
        {#if record}
          <button
            type="button"
            class="archive-landmark"
            data-record-id={record.id}
            data-slot={landmark.slot.id}
            data-side={landmark.slot.x >= 0.58 ? 'right' : landmark.slot.x <= 0.22 ? 'left-edge' : 'center'}
            data-vertical={archiveHintPlacement(
              landmark.slot,
              viewport,
              topUiClearance ? topUiClearance.y + topUiClearance.height : undefined,
            )}
            data-motion={landmark.visual.motion.kind}
            style={`--landmark-x:${landmark.slot.x * 100}%;--landmark-y:${landmark.slot.y * 100}%`}
            aria-label={`${landmark.accessibleDescription}. Open ${pack.archive.localName}.`}
            onclick={onarchiveopen}
          >
            <span class="archive-sigil" aria-hidden="true">
              <ArchiveRecordArt
                id={record.id}
                hue={item?.hue ?? (landmark.priority * 31) % 360}
                universeId={pack.id}
              />
            </span>
            <span class="archive-hint" role="tooltip">
              <small>{pack.archive.localName}</small>
              <strong>{landmark.grouped ? landmark.groupLabel : record.name}</strong>
              <span>{record.observation}</span>
              <em>{record.effectDescription}</em>
            </span>
          </button>
        {/if}
      {/each}
    </div>

    <ul class="sr-only" aria-label={`${pack.identity.shortName} visible landmarks`}>
      {#each plan.objects as object (object.objectId)}
        {@const ownedCount = owned[object.sourceId] ?? 0}
        <li
          data-object-id={object.objectId}
          data-source-id={object.sourceId}
          data-state-source={object.state.source}
        >
          {object.state.label}; {statusLabel(object, ownedCount)}; {object.state.silhouette}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="sr-only" role="status">No authored presentation is registered for {pack.identity.shortName}.</p>
  {/if}

  {#if plan.diagnostics.length > 0}
    <p class="sr-only" role="status">
      Manifest layout reported {plan.diagnostics.length} placement
      {plan.diagnostics.length === 1 ? 'problem' : 'problems'}.
    </p>
  {/if}
</section>

<style>
  .manifest-world {
    position: fixed;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
  }
  .scene-composition,
  .scene-vignette,
  .verdance-leaves {
    position: absolute;
    inset: 0;
  }

  /* Prismata: one darkroom-scale prism separates a source into named spatial rays. */
  .prismata-darkroom {
    position: absolute;
    inset: 18% 5% 10%;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--bg) 88%, transparent), transparent 30% 72%, color-mix(in srgb, var(--bg) 78%, transparent)),
      repeating-linear-gradient(0deg, transparent 0 4.8rem, color-mix(in srgb, var(--gold) 3%, transparent) 4.85rem 4.9rem);
    border-top: 1px solid color-mix(in srgb, var(--gold) 9%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 9%, transparent);
    clip-path: polygon(3% 0, 97% 0, 100% 8%, 100% 92%, 97% 100%, 3% 100%, 0 92%, 0 8%);
  }
  .prismata-aperture {
    position: absolute;
    left: 11%;
    top: 53%;
    width: 3.2rem;
    height: 10rem;
    transform: translateY(-50%);
    background: linear-gradient(90deg, color-mix(in srgb, var(--panel) 92%, transparent), color-mix(in srgb, var(--gold) 11%, transparent));
    border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
    clip-path: polygon(0 0, 100% 8%, 65% 42%, 65% 58%, 100% 92%, 0 100%);
  }
  .prismata-aperture::after {
    content: '';
    position: absolute;
    left: 62%;
    top: 48%;
    width: min(24vw, 19rem);
    height: 2px;
    background: white;
    box-shadow: 0 0 1rem white;
  }
  .prismata-world-prism {
    position: absolute;
    left: 48%;
    top: 53%;
    width: min(18vw, 14rem);
    aspect-ratio: 1.08;
    transform: translate(-50%, -50%);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
    background: linear-gradient(138deg, color-mix(in srgb, white 16%, transparent), color-mix(in srgb, var(--amber) 17%, transparent) 50%, color-mix(in srgb, var(--gold) 5%, transparent));
    filter: drop-shadow(0 0 2.4rem color-mix(in srgb, var(--amber) 18%, transparent));
  }
  .prismata-world-prism::after {
    content: '';
    position: absolute;
    inset: 2px;
    clip-path: inherit;
    background: color-mix(in srgb, var(--bg) 72%, transparent);
  }
  .prismata-spectrum { position: absolute; inset: 0; }
  .prismata-spectrum i {
    --ray-color: var(--gold);
    position: absolute;
    left: 52%;
    top: 53%;
    width: 43%;
    height: 1px;
    transform: rotate(calc((var(--offset, 0) - 2.5) * 5deg));
    transform-origin: left center;
    background: linear-gradient(90deg, var(--ray-color), color-mix(in srgb, var(--ray-color) 18%, transparent));
    box-shadow: 0 0 0.55rem var(--ray-color);
    opacity: 0.5;
  }
  .prismata-spectrum i:nth-child(1) { --offset: 0; --ray-color: #ff6f72; }
  .prismata-spectrum i:nth-child(2) { --offset: 1; --ray-color: #ffb95f; }
  .prismata-spectrum i:nth-child(3) { --offset: 2; --ray-color: #7ce5a2; }
  .prismata-spectrum i:nth-child(4) { --offset: 3; --ray-color: #62c9ff; }
  .prismata-spectrum i:nth-child(5) { --offset: 4; --ray-color: #ba91ff; }
  .prismata-spectrum i:nth-child(6) { --offset: 5; --ray-color: #f4eaff; }
  .prismata-detector {
    position: absolute;
    right: 8%;
    top: 31%;
    bottom: 25%;
    width: 1.4rem;
    border-left: 2px solid color-mix(in srgb, white 58%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--gold) 9%, transparent) 0 1px, transparent 1px 12%);
    box-shadow: -1rem 0 2.4rem color-mix(in srgb, var(--amber) 7%, transparent);
  }
  .prismata-caustic {
    position: absolute;
    left: 48%;
    top: 53%;
    width: min(29vw, 24rem);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, color-mix(in srgb, var(--gold) 12%, transparent), transparent 64%);
    -webkit-mask: conic-gradient(from 30deg, #000, transparent 16%, #000 32%, transparent 48%, #000 64%, transparent 80%, #000);
    mask: conic-gradient(from 30deg, #000, transparent 16%, #000 32%, transparent 48%, #000 64%, transparent 80%, #000);
  }

  /* Tempest: a vertical convective tower with separated charge and a branching leader. */
  .tempest-depth { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 31%, color-mix(in srgb, var(--amber) 12%, transparent), transparent 42%), linear-gradient(180deg, color-mix(in srgb, var(--gold) 4%, transparent), transparent 42% 68%, color-mix(in srgb, var(--panel) 30%, transparent)); }
  .tempest-anvil { position: absolute; left: 14%; right: 14%; top: 24%; height: 19%; border-bottom: 1px solid color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 62% 58% 24% 28%; background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 68%); box-shadow: 0 2.2rem 4rem color-mix(in srgb, var(--amber) 5%, transparent); }
  .tempest-anvil i { position: absolute; bottom: -1.1rem; width: 24%; height: 3.4rem; border: 1px solid color-mix(in srgb, var(--gold) 17%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--panel) 58%, transparent); }
  .tempest-anvil i:nth-child(1) { left: 16%; } .tempest-anvil i:nth-child(2) { left: 39%; width: 28%; height: 4.4rem; } .tempest-anvil i:nth-child(3) { right: 12%; }
  .tempest-rain { position: absolute; left: 27%; right: 27%; top: 41%; bottom: 18%; background: repeating-linear-gradient(104deg, transparent 0 1.3rem, color-mix(in srgb, var(--gold) 10%, transparent) 1.34rem 1.39rem); -webkit-mask: linear-gradient(transparent, #000 18% 78%, transparent); mask: linear-gradient(transparent, #000 18% 78%, transparent); }
  .tempest-charge { position: absolute; left: 34%; right: 34%; height: 1.2rem; border-radius: 50%; }
  .positive-charge { top: 29%; border-top: 1px dashed color-mix(in srgb, white 46%, transparent); box-shadow: 0 -0.7rem 1.4rem color-mix(in srgb, var(--gold) 7%, transparent); }
  .negative-charge { top: 43%; border-bottom: 1px dashed color-mix(in srgb, var(--amber) 54%, transparent); box-shadow: 0 0.7rem 1.4rem color-mix(in srgb, var(--amber) 7%, transparent); }
  .tempest-front { position: absolute; left: -4%; right: -4%; top: 72%; height: 18%; border-top: 1px solid color-mix(in srgb, var(--gold) 30%, transparent); border-radius: 50%; transform: rotate(-1deg); }
  .tempest-leader { position: absolute; left: 50%; top: 39%; width: 2px; height: 37%; transform: translateX(-50%) skewX(-8deg); background: linear-gradient(white, color-mix(in srgb, var(--gold) 22%, transparent)); box-shadow: 0 0 0.85rem color-mix(in srgb, white 46%, transparent); }
  .tempest-leader::after { content: ''; position: absolute; left: -1.1rem; top: 28%; width: 2.4rem; height: 2px; transform: rotate(-58deg); background: white; box-shadow: 2.6rem 2rem 0 color-mix(in srgb, var(--gold) 46%, transparent), -1.8rem 4rem 0 color-mix(in srgb, var(--amber) 32%, transparent); }
  .tempest-leader i { position: absolute; width: 4.8rem; height: 1px; background: color-mix(in srgb, var(--gold) 32%, transparent); transform-origin: left center; }
  .tempest-leader i:nth-child(1) { top: 22%; transform: rotate(-32deg); } .tempest-leader i:nth-child(2) { top: 47%; transform: rotate(38deg); } .tempest-leader i:nth-child(3) { top: 66%; transform: rotate(-52deg); }
  .tempest-magnetosphere { position: absolute; left: 50%; top: 53%; width: min(76vw, 70rem); aspect-ratio: 2.8; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-left-color: transparent; border-right-color: transparent; border-radius: 50%; }

  /* Canticle: a Chladni-like resonant plate with nodal geometry and an explicit rest. */
  .canticle-plate { position: absolute; left: 50%; top: 53%; width: min(64vw, 58rem); aspect-ratio: 1.72; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; background: radial-gradient(ellipse, color-mix(in srgb, var(--amber) 7%, transparent), transparent 66%); box-shadow: inset 0 0 4rem color-mix(in srgb, var(--amber) 4%, transparent); }
  .canticle-nodal { position: absolute; left: 50%; top: 53%; width: min(50vw, 44rem); aspect-ratio: 2.8; transform: translate(-50%, -50%) rotate(var(--node-angle, 0deg)); border-top: 1px solid color-mix(in srgb, var(--gold) 22%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--amber) 12%, transparent); border-radius: 50%; }
  .nodal-two { --node-angle: 60deg; width: min(42vw, 38rem); } .nodal-three { --node-angle: -60deg; width: min(42vw, 38rem); }
  .canticle-node { position: absolute; top: 53%; width: 0.72rem; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--gold) 48%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 82%, transparent); box-shadow: 0 0 1.2rem color-mix(in srgb, var(--amber) 26%, transparent); }
  .node-one { left: 24%; } .node-two { left: 50%; transform: translateX(-50%); } .node-three { right: 24%; }
  .canticle-wave { position: absolute; left: 12%; right: 12%; top: 49%; height: 8%; border-top: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--amber) 12%, transparent); border-radius: 50%; }
  .wave-one { transform: rotate(3deg); }
  .wave-two { transform: rotate(-3deg) translateY(2.6rem); opacity: 0.6; }
  .canticle-rest { position: absolute; left: 50%; top: 53%; width: min(13vw, 9rem); aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px dashed color-mix(in srgb, var(--gold) 30%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 48%, transparent); box-shadow: 0 0 2.4rem color-mix(in srgb, var(--bg) 90%, transparent); }

  .scene-composition {
    opacity: calc(0.58 + var(--scene-strength) * 0.28);
  }
  .scene-vignette {
    z-index: 4;
    background: radial-gradient(ellipse at 50% 53%, transparent 0 28%, rgba(2, 4, 10, 0.12) 58%, rgba(1, 2, 7, 0.7) 100%);
  }

  /* Verdance: roots and canopy form one organism around an open germination clearing. */
  .verdance-canopy {
    position: absolute;
    inset: -20% -8% auto;
    height: 56%;
    background:
      radial-gradient(ellipse at 18% 74%, color-mix(in srgb, var(--gold) 8%, transparent), transparent 34%),
      radial-gradient(ellipse at 50% 62%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 40%),
      radial-gradient(ellipse at 82% 72%, color-mix(in srgb, var(--gold) 7%, transparent), transparent 34%);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    border-radius: 0 0 50% 50%;
    filter: blur(0.2px);
  }
  .verdance-roots {
    position: absolute;
    left: 5%;
    right: 5%;
    bottom: -15%;
    height: 58%;
    background:
      repeating-radial-gradient(ellipse at 50% 0, transparent 0 7%, color-mix(in srgb, var(--amber) 8%, transparent) 7.2% 7.45%, transparent 7.7% 14%);
    -webkit-mask: linear-gradient(90deg, #000, transparent 46% 54%, #000);
    mask: linear-gradient(90deg, #000, transparent 46% 54%, #000);
    opacity: 0.66;
  }
  .verdance-ring {
    position: absolute;
    left: 50%;
    top: 53%;
    border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
    border-top-color: transparent;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .growth-ring-one { width: min(42vw, 36rem); aspect-ratio: 1.8; transform: translate(-50%, -50%) rotate(-6deg); }
  .growth-ring-two { width: min(68vw, 62rem); aspect-ratio: 2.4; opacity: 0.44; transform: translate(-50%, -50%) rotate(4deg); }
  .verdance-leaves i {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 1.2rem;
    height: 0.52rem;
    border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent);
    border-radius: 100% 0 100% 0;
    transform: rotate(var(--leaf-rotation));
    opacity: 0.46;
    animation: leaf-breathe 8s ease-in-out infinite alternate;
  }

  .archive-landmarks {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
  }
  .archive-landmark {
    position: absolute;
    left: var(--landmark-x);
    top: var(--landmark-y);
    width: 3.15rem;
    height: 3.15rem;
    padding: 0;
    color: var(--gold);
    background: transparent;
    border: 0;
    transform: translate(-50%, -50%);
    pointer-events: auto;
    cursor: pointer;
    filter: drop-shadow(0 0 0.85rem color-mix(in srgb, var(--amber) 24%, transparent));
    transition: transform 140ms ease, filter 140ms ease;
  }
  .archive-landmark:hover,
  .archive-landmark:focus-visible {
    z-index: 5;
    transform: translate(-50%, -50%) scale(1.08);
    filter: drop-shadow(0 0 1.25rem color-mix(in srgb, var(--amber) 44%, transparent));
    outline: none;
  }
  .archive-landmark:focus-visible .archive-sigil {
    outline: 2px solid white;
    outline-offset: 0.28rem;
  }
  .archive-sigil {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
  }
  .archive-hint {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.75rem);
    width: 15.5rem;
    display: grid;
    gap: 0.16rem;
    padding: 0.55rem 0.62rem;
    color: var(--text);
    background: color-mix(in srgb, var(--panel) 95%, #03050b);
    border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent);
    border-radius: 0.35rem 0.8rem 0.8rem 0.35rem;
    box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.38), inset 2px 0 color-mix(in srgb, var(--amber) 56%, transparent);
    opacity: 0;
    transform: translate(-50%, 0.3rem) scale(0.94);
    transform-origin: 50% 100%;
    transition: opacity 120ms ease, transform 120ms ease;
    pointer-events: none;
    text-align: left;
  }
  [data-side='right'] .archive-hint {
    left: auto;
    right: -0.4rem;
    transform: translate(0, 0.3rem) scale(0.94);
    transform-origin: 100% 100%;
  }
  [data-side='left-edge'] .archive-hint {
    left: -0.4rem;
    transform: translate(0, 0.3rem) scale(0.94);
    transform-origin: 0 100%;
  }
  [data-vertical='below'] .archive-hint {
    top: calc(100% + 0.75rem);
    bottom: auto;
    transform: translate(-50%, -0.3rem) scale(0.94);
    transform-origin: 50% 0;
  }
  [data-vertical='below'][data-side='right'] .archive-hint {
    transform: translate(0, -0.3rem) scale(0.94);
    transform-origin: 100% 0;
  }
  [data-vertical='below'][data-side='left-edge'] .archive-hint {
    transform: translate(0, -0.3rem) scale(0.94);
    transform-origin: 0 0;
  }
  .archive-landmark:hover .archive-hint,
  .archive-landmark:focus-visible .archive-hint {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  [data-side='right']:hover .archive-hint,
  [data-side='right']:focus-visible .archive-hint,
  [data-side='left-edge']:hover .archive-hint,
  [data-side='left-edge']:focus-visible .archive-hint { transform: translate(0, 0) scale(1); }
  .archive-hint small {
    color: color-mix(in srgb, var(--gold) 72%, var(--dim));
    font-size: 0.52rem;
    font-weight: 740;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .archive-hint strong { font-size: 0.75rem; }
  .archive-hint span,
  .archive-hint em { color: var(--dim); font-size: 0.62rem; line-height: 1.35; }
  .archive-hint em { color: color-mix(in srgb, var(--gold) 62%, var(--dim)); }

  .manifest-heart {
    position: absolute;
    z-index: 3;
    margin: 0;
    display: grid;
    place-items: center;
    transform-origin: center;
  }
  .heart-frame,
  .heart-frame::before,
  .heart-frame::after,
  .heart-frame i {
    position: absolute;
    border-radius: 50%;
  }
  .heart-frame { inset: -28%; }
  .heart-frame::before,
  .heart-frame::after { content: ''; }
  .emberlight .heart-frame {
    border: 1px solid color-mix(in srgb, var(--gold) 38%, transparent);
    box-shadow: 0 0 2.8rem color-mix(in srgb, var(--amber) 13%, transparent);
    animation: heart-orbit 16s linear infinite;
  }
  .emberlight .heart-frame::before {
    inset: 17%;
    border: 1px solid color-mix(in srgb, var(--amber) 52%, transparent);
    border-top-color: transparent;
    border-bottom-color: transparent;
  }
  .emberlight .heart-frame::after {
    inset: -22% 10%;
    border-top: 1px solid color-mix(in srgb, var(--gold) 30%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 13%, transparent);
    transform: rotate(-16deg);
  }
  .tidefall .heart-frame {
    inset: -16%;
    border: 0;
    border-radius: 46% 54% 58% 42% / 39% 47% 53% 61%;
    background:
      radial-gradient(circle at 39% 31%, color-mix(in srgb, white 76%, var(--gold)) 0 4%, transparent 5%),
      radial-gradient(ellipse at 33% 68%, color-mix(in srgb, var(--amber) 32%, transparent), transparent 56%),
      linear-gradient(142deg, color-mix(in srgb, var(--gold) 38%, var(--panel)), color-mix(in srgb, var(--amber) 19%, var(--bg)) 43%, color-mix(in srgb, var(--bg) 94%, black));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--gold) 20%, transparent), 0 0 2.5rem color-mix(in srgb, var(--amber) 14%, transparent);
    opacity: 0.48;
    animation: heart-current 7s ease-in-out infinite alternate;
  }
  .tidefall .heart-frame::before {
    inset: 23% 18% 18% 28%;
    border: 0;
    border-radius: 38% 62% 47% 53% / 58% 45% 55% 42%;
    background: linear-gradient(160deg, color-mix(in srgb, var(--bg) 91%, black), color-mix(in srgb, var(--panel) 74%, transparent));
  }
  .tidefall .heart-frame::after {
    left: 49%; top: -48%; bottom: 68%; width: 1px;
    border: 0;
    border-radius: 0;
    background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--gold) 52%, transparent));
    box-shadow: -0.8rem 0.6rem 0 color-mix(in srgb, var(--amber) 18%, transparent), 0.7rem 1.3rem 0 color-mix(in srgb, var(--gold) 14%, transparent);
  }
  .verdance .heart-frame {
    inset: -28%;
    border: 1px solid color-mix(in srgb, var(--gold) 34%, transparent);
    border-top-color: transparent;
    border-radius: 48% 52% 44% 56%;
    box-shadow: 0 0 2.6rem color-mix(in srgb, var(--amber) 10%, transparent);
    animation: seed-breathe 7.5s ease-in-out infinite alternate;
  }
  .verdance .heart-frame::before {
    inset: 18% 27% -28%;
    border-left: 1px solid color-mix(in srgb, var(--gold) 54%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 24%, transparent);
    border-radius: 0 0 0 70%;
    transform: rotate(-8deg);
  }
  .verdance .heart-frame::after {
    inset: -22%;
    border-bottom: 1px solid color-mix(in srgb, var(--amber) 25%, transparent);
    border-radius: 50%;
  }
  .clockwork .heart-frame {
    inset: -34%;
    border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent);
    box-shadow: 0 0 2.7rem color-mix(in srgb, var(--amber) 13%, transparent);
    animation: clockwork-heart-index 12s steps(15, end) infinite;
  }
  .clockwork .heart-frame::before {
    inset: 17%;
    border: 2px solid color-mix(in srgb, var(--amber) 54%, transparent);
    border-left-color: transparent;
    border-right-color: transparent;
  }
  .clockwork .heart-frame::after {
    inset: -22% 42%;
    border-left: 1px solid color-mix(in srgb, var(--gold) 48%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    border-radius: 0;
    transform: rotate(28deg);
  }

  .motion-paused,
  .motion-paused * { animation-play-state: paused !important; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @keyframes heart-orbit { to { transform: rotate(360deg); } }
  @keyframes heart-current { to { transform: scaleX(1.04) scaleY(0.94); opacity: 0.62; } }
  @keyframes leaf-breathe { to { transform: rotate(var(--leaf-rotation)) translateY(-0.3rem); opacity: 0.28; } }
  @keyframes seed-breathe { to { transform: scale(1.035, 0.97); opacity: 0.72; } }
  @keyframes clockwork-heart-index { to { transform: rotate(360deg); } }
  :global(html[data-contrast='high']) .heart-frame { border-color: rgba(255, 255, 255, 0.64); }
  @media (prefers-reduced-motion: reduce) {
    .manifest-world,
    .manifest-world * { animation: none !important; transition: none !important; }
  }
</style>
