<script lang="ts">
  import { onMount } from 'svelte'
  import type { UniversePackV2, WorldObjectManifest } from '../content/universes'
  import {
    planManifestLayout,
    type ManifestObjectRenderPlan,
    type ManifestRenderPreferences,
    type ManifestViewport,
  } from '../render/manifest-layout'
  import {
    heartPresentationStateKey,
    objectPresentationStateKey,
    type ObjectPresentation,
    type PresentationState,
  } from '../render/presentation-contract'
  import {
    presentationWorldStateAt,
    universePresentationById,
  } from '../render/presentation-registry'
  import PresentationShape from './PresentationShape.svelte'

  interface Props {
    pack: UniversePackV2
    owned: Readonly<Record<string, number>>
    preferences: ManifestRenderPreferences
    unlockedArchiveIds?: readonly string[]
    litBeaconUniverseIds?: readonly string[]
    activeOmenIds?: readonly string[]
  }

  let {
    pack,
    owned,
    preferences,
    unlockedArchiveIds = [],
    litBeaconUniverseIds = [],
    activeOmenIds = [],
  }: Props = $props()
  let viewport = $state<ManifestViewport>({ width: 1280, height: 720 })
  let now = $state(Date.now())

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

  function measure() {
    viewport = {
      width: Math.max(320, window.innerWidth),
      height: Math.max(480, window.innerHeight),
    }
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

  function descriptorFor(object: ManifestObjectRenderPlan): ObjectPresentation | null {
    return presentation?.objects[object.objectId] ?? null
  }

  function visualStateFor(object: ManifestObjectRenderPlan): PresentationState | null {
    return descriptorFor(object)?.states[objectPresentationStateKey(object.state)] ?? null
  }

  onMount(() => {
    measure()
    const timer = setInterval(() => (now = Date.now()), 500)
    return () => clearInterval(timer)
  })
</script>

<svelte:window onresize={measure} />

<section
  class="manifest-world"
  aria-label={`${pack.identity.shortName} authored world`}
  data-universe-v2={pack.id}
  data-layout-diagnostics={plan.diagnostics.length}
  data-visible-objects={plan.objects.length}
  data-presentation-ready={presentation !== null}
  data-world-state={worldState?.key ?? 'none'}
>
  <h2 class="sr-only">Visible {pack.identity.shortName} world objects</h2>

  {#if presentation}
    {#if worldState}
      <div
        class="world-state-geometry"
        data-depth={worldState.descriptor.depth}
        data-state-key={worldState.key}
        data-occlusion={worldState.descriptor.occlusion}
      >
        <PresentationShape state={worldState.descriptor} palette={presentation.palette} />
      </div>
      <div class="world-state-indicator" role="status" aria-label={worldState.label}>
        <span class="phase-mark" data-state-key={worldState.key} aria-hidden="true"></span>
        <strong>{worldState.label}</strong>
      </div>
    {/if}

    {#if heartState}
      <figure
        class="manifest-heart"
        class:motion-paused={preferences.reducedMotion}
        data-depth={presentation.heart.depth}
        data-heart-id={presentation.heart.id}
        data-state-source={plan.heart.state.source}
        data-geometry={heartState.geometryLabel}
        data-occlusion={presentation.heart.occlusion}
        style={`left:${plan.heart.rect.x}px;top:${plan.heart.rect.y}px;width:${plan.heart.rect.width}px;height:${plan.heart.rect.height}px`}
        aria-hidden="true"
      >
        <PresentationShape state={heartState} palette={presentation.palette} />
      </figure>
    {/if}

    {#each plan.objects as object (object.objectId)}
      {@const ownedCount = owned[object.sourceId] ?? 0}
      {@const descriptor = descriptorFor(object)}
      {@const visualState = visualStateFor(object)}
      {#if descriptor && visualState}
        <figure
          class="manifest-object"
          class:motion-paused={object.motionPaused}
          data-object-id={object.objectId}
          data-source-id={object.sourceId}
          data-zone={object.screenZone}
          data-depth={descriptor.depth}
          data-motion={object.state.motion.kind}
          data-ownership-state={object.state.ownershipThreshold ?? 'base'}
          data-state-source={object.state.source}
          data-geometry={visualState.geometryLabel}
          data-occlusion={descriptor.occlusion}
          style={`left:${object.rect.x}px;top:${object.rect.y}px;width:${object.rect.width}px;height:${object.rect.height}px;opacity:${object.opacity}`}
          aria-label={`${object.state.label}; ${statusLabel(object, ownedCount)}; ${object.state.silhouette}`}
        >
          <PresentationShape state={visualState} palette={presentation.palette} />
          <figcaption aria-hidden="true">
            <strong>{object.state.label}</strong>
            <span>{statusLabel(object, ownedCount)}</span>
          </figcaption>
        </figure>
      {/if}
    {/each}
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
  .world-state-geometry {
    position: absolute;
    inset: 12% 6% 7%;
    z-index: 0;
    opacity: 0.78;
    transform-origin: 50% 70%;
    animation: world-state-breathe 8s ease-in-out infinite;
  }
  .world-state-indicator {
    position: fixed;
    left: 1rem;
    bottom: 1rem;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.34rem 0.55rem;
    color: color-mix(in srgb, var(--gold) 82%, white);
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent);
    border-radius: 0.4rem;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .phase-mark {
    position: relative;
    width: 1.3rem;
    height: 0.85rem;
    border: 2px solid currentColor;
  }
  .phase-mark[data-state-key='rising'] { border-width: 0 2px 2px 0; transform: rotate(-135deg) scale(0.62); }
  .phase-mark[data-state-key='high'] { border-width: 2px 2px 0; border-radius: 50% 50% 0 0; }
  .phase-mark[data-state-key='falling'] { border-width: 0 2px 2px 0; transform: rotate(45deg) scale(0.62); }
  .phase-mark[data-state-key='low'] { border-width: 0 2px 2px; border-radius: 0 0 50% 50%; }
  .manifest-heart,
  .manifest-object {
    --object-shadow: color-mix(in srgb, var(--amber) 46%, transparent);
    position: absolute;
    display: grid;
    place-items: center;
    margin: 0;
    filter: drop-shadow(0 0 9px var(--object-shadow));
    transition: opacity 180ms ease, filter 180ms ease;
    transform-origin: center;
  }
  [data-depth='back'] { z-index: 1; }
  [data-depth='middle'] { z-index: 2; }
  [data-depth='front'] { z-index: 3; }
  .manifest-heart {
    z-index: 3;
    filter: drop-shadow(0 0 1.1rem color-mix(in srgb, var(--gold) 62%, transparent));
    animation: heart-breathe 3.4s ease-in-out infinite;
  }
  [data-motion='orbital'] { animation: authored-orbit 12s linear infinite; }
  [data-motion='growth'] { animation: authored-grow 5.6s ease-in-out infinite; }
  [data-motion='optical'] { animation: authored-optical 6s ease-in-out infinite; }
  [data-motion='atmospheric'] { animation: authored-atmosphere 9.6s ease-in-out infinite; }
  [data-motion='tidal'] { animation: authored-tide 7.5s ease-in-out infinite; }
  [data-motion='waveform'] { animation: authored-wave 3.8s steps(3, end) infinite; }
  [data-ownership-state='50'],
  [data-ownership-state='100'] { filter: drop-shadow(0 0 13px color-mix(in srgb, var(--gold) 48%, transparent)); }
  figcaption {
    position: absolute;
    top: calc(100% + 0.15rem);
    left: 50%;
    width: max-content;
    max-width: 10rem;
    padding: 0.2rem 0.35rem;
    color: var(--text);
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 25%, transparent);
    border-radius: 0.3rem;
    opacity: 0;
    transform: translateX(-50%);
    transition: opacity 160ms ease;
    text-align: center;
    font-size: 0.58rem;
    line-height: 1.2;
  }
  figcaption strong,
  figcaption span { display: block; }
  figcaption span { color: var(--dim); }
  [data-ownership-state='100'] figcaption,
  [data-zone='horizon'][data-ownership-state='50'] figcaption { opacity: 0.85; }
  .motion-paused,
  .motion-paused :global(*) { animation-play-state: paused !important; }
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
  @keyframes heart-breathe {
    0%, 100% { transform: scale(0.96); }
    50% { transform: scale(1.035); }
  }
  @keyframes authored-orbit { to { transform: rotate(360deg); } }
  @keyframes authored-grow { 0%, 100% { transform: scaleY(0.9); } 50% { transform: scaleY(1.05); } }
  @keyframes authored-optical { 0%, 100% { opacity: 0.62; } 50% { opacity: 1; } }
  @keyframes authored-atmosphere { 0%, 100% { transform: translate(-2%, 1%); } 50% { transform: translate(2%, -1%); } }
  @keyframes authored-tide { 0%, 100% { transform: translateY(3%) scaleY(0.94); } 50% { transform: translateY(-3%) scaleY(1.04); } }
  @keyframes authored-wave { 0%, 100% { opacity: 0.64; } 50% { opacity: 1; } }
  @keyframes world-state-breathe { 0%, 100% { transform: scaleY(0.94); } 50% { transform: scaleY(1.03); } }
  :global(html[data-contrast='high']) .world-state-indicator {
    color: #fff;
    background: #000;
    border-width: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .manifest-heart,
    .manifest-object,
    .world-state-geometry { animation: none !important; transition: none; }
  }
</style>
