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
    planArchiveLandmarks,
    type ArchiveLandmarkMode,
  } from '../render/archive-landmarks'
  import { archiveLandmarkDescriptorsFor } from '../render/archive-landmark-registry'
  import { heartPresentationStateKey } from '../render/presentation-contract'
  import {
    presentationWorldStateAt,
    universePresentationById,
  } from '../render/presentation-registry'
  import ArchiveRecordArt from './ArchiveRecordArt.svelte'

  interface Props {
    pack: UniversePackV2
    owned: Readonly<Record<string, number>>
    preferences: ManifestRenderPreferences
    archiveItems?: readonly CuriosityDef[]
    unlockedArchiveIds?: readonly string[]
    litBeaconUniverseIds?: readonly string[]
    activeOmenIds?: readonly string[]
    onarchiveopen?: () => void
  }

  const EMBER_STARS = [
    ['10%', '34%', '0.72'], ['24%', '70%', '0.42'], ['35%', '55%', '0.5'],
    ['66%', '57%', '0.46'], ['76%', '68%', '0.66'], ['90%', '39%', '0.38'],
    ['43%', '79%', '0.32'], ['58%', '76%', '0.28'],
  ] as const
  const TIDE_BUBBLES = [
    ['10%', '42%', '0.56'], ['23%', '58%', '0.32'], ['27%', '64%', '0.24'],
    ['74%', '62%', '0.28'], ['78%', '54%', '0.48'], ['82%', '66%', '0.22'],
  ] as const
  const TIDE_FISH = [
    ['18%', '59%', '0.62'], ['23%', '63%', '0.42'], ['28%', '57%', '0.32'],
    ['71%', '58%', '0.38'], ['76%', '62%', '0.56'], ['90%', '39%', '0.3'],
  ] as const
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
    onarchiveopen = () => {},
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
  ))

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

  onMount(() => {
    measure()
    const timer = setInterval(() => (now = Date.now()), 500)
    return () => clearInterval(timer)
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
  style={`--scene-strength:${sceneStrength}`}
>
  <h2 class="sr-only">Visible {pack.identity.shortName} world</h2>

  {#if presentation}
    <div class="scene-composition" aria-hidden="true">
      <div class="scene-vignette"></div>
      {#if pack.id === 'emberlight'}
        <div class="ember-haze"></div>
        <div class="ember-corona"></div>
        <div class="ember-orbit orbit-one"></div>
        <div class="ember-orbit orbit-two"></div>
        <div class="ember-orbit orbit-three"></div>
        <div class="ember-constellation">
          {#each EMBER_STARS as star}
            <i style={`--x:${star[0]};--y:${star[1]};--spark:${star[2]}`}></i>
          {/each}
        </div>
      {:else if pack.id === 'tidefall'}
        <div class="tide-depth"></div>
        <div class="tide-current current-one"></div>
        <div class="tide-current current-two"></div>
        <div class="tide-current current-three"></div>
        <div class="tide-caustic"></div>
        <div class="tide-bubbles">
          {#each TIDE_BUBBLES as bubble}
            <i style={`--x:${bubble[0]};--y:${bubble[1]};--bubble:${bubble[2]}`}></i>
          {/each}
        </div>
        <div class="tide-shoal">
          {#each TIDE_FISH as fish}
            <i style={`--x:${fish[0]};--y:${fish[1]};--fish:${fish[2]}`}></i>
          {/each}
        </div>
      {:else if pack.id === 'verdance'}
        <div class="verdance-canopy"></div>
        <div class="verdance-roots"></div>
        <div class="verdance-ring growth-ring-one"></div>
        <div class="verdance-ring growth-ring-two"></div>
        <div class="verdance-leaves">
          {#each VERDANCE_LEAVES as leaf}
            <i style={`--x:${leaf[0]};--y:${leaf[1]};--leaf-rotation:${leaf[2]}`}></i>
          {/each}
        </div>
      {:else if pack.id === 'clockwork'}
        <div class="clockwork-depth"></div>
        <div class="clockwork-horizon"></div>
        <div class="clockwork-meridian"></div>
        <div class="clockwork-gear gear-primary"></div>
        <div class="clockwork-gear gear-secondary"></div>
        <div class="clockwork-chapter-ring"></div>
        <div class="clockwork-power-train"><i></i><i></i><i></i><i></i><i></i></div>
      {:else if pack.id === 'prismata'}
        <div class="prismata-bench"></div>
        <div class="prismata-lens lens-near"></div>
        <div class="prismata-lens lens-far"></div>
        <div class="prismata-spectrum"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="prismata-caustic"></div>
      {:else if pack.id === 'tempest'}
        <div class="tempest-depth"></div>
        <div class="tempest-cell cell-left"></div>
        <div class="tempest-cell cell-right"></div>
        <div class="tempest-front"></div>
        <div class="tempest-leader"></div>
        <div class="tempest-magnetosphere"></div>
      {:else if pack.id === 'canticle'}
        <div class="canticle-chamber"></div>
        <div class="canticle-node node-one"></div>
        <div class="canticle-node node-two"></div>
        <div class="canticle-node node-three"></div>
        <div class="canticle-wave wave-one"></div>
        <div class="canticle-wave wave-two"></div>
        <div class="canticle-rest"></div>
      {/if}
    </div>

    {#if worldState}
      <p class="sr-only" role="status">{worldState.label}</p>
    {/if}

    {#if heartState}
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
  .ember-constellation,
  .tide-bubbles,
  .tide-shoal,
  .verdance-leaves {
    position: absolute;
    inset: 0;
  }

  /* Prismata: a functional optical bench whose component paths remain separate. */
  .prismata-bench {
    position: absolute;
    left: 9%; right: 9%; top: 53%; height: 1px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 30%, transparent) 8% 92%, transparent);
    box-shadow: 0 0 2.2rem color-mix(in srgb, var(--amber) 8%, transparent);
  }
  .prismata-lens {
    position: absolute; top: 53%; width: 7.5rem; height: 18rem;
    border: 1px solid color-mix(in srgb, var(--gold) 32%, transparent);
    border-radius: 50%;
    background: radial-gradient(ellipse, color-mix(in srgb, var(--amber) 8%, transparent), transparent 68%);
    transform: translateY(-50%);
  }
  .lens-near { left: 29%; transform: translateY(-50%) rotate(-7deg); }
  .lens-far { right: 29%; transform: translateY(-50%) rotate(7deg); }
  .prismata-spectrum { position: absolute; inset: 0; }
  .prismata-spectrum i {
    position: absolute; left: 8%; right: 8%; top: calc(45% + var(--offset, 0) * 3.2%); height: 1px;
    background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--gold) 32%, transparent) 0 6px, transparent 6px 10px);
    transform: rotate(calc((var(--offset, 0) - 2.5) * 1.2deg));
    opacity: calc(0.25 + var(--offset, 0) * 0.055);
  }
  .prismata-spectrum i:nth-child(1) { --offset: 0; }
  .prismata-spectrum i:nth-child(2) { --offset: 1; }
  .prismata-spectrum i:nth-child(3) { --offset: 2; }
  .prismata-spectrum i:nth-child(4) { --offset: 3; }
  .prismata-spectrum i:nth-child(5) { --offset: 4; }
  .prismata-spectrum i:nth-child(6) { --offset: 5; }
  .prismata-caustic {
    position: absolute; left: 50%; top: 53%; width: min(30vw, 26rem); aspect-ratio: 2.4;
    transform: translate(-50%, -50%); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    background: radial-gradient(ellipse, color-mix(in srgb, var(--gold) 13%, transparent), transparent 68%);
    border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
  }

  /* Tempest: bounded cells, a declared leader, and a legible pressure horizon. */
  .tempest-depth { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 52%, color-mix(in srgb, var(--amber) 9%, transparent), transparent 36%), linear-gradient(180deg, color-mix(in srgb, var(--gold) 3%, transparent), transparent 40% 72%, color-mix(in srgb, var(--panel) 24%, transparent)); }
  .tempest-cell { position: absolute; top: 38%; width: 28%; height: 30%; border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); border-radius: 50%; background: radial-gradient(ellipse, color-mix(in srgb, var(--amber) 9%, transparent), transparent 68%); filter: blur(0.2px); }
  .cell-left { left: 12%; transform: rotate(-8deg); }
  .cell-right { right: 12%; transform: rotate(9deg); }
  .tempest-front { position: absolute; left: -4%; right: -4%; top: 66%; height: 18%; border-top: 1px solid color-mix(in srgb, var(--gold) 26%, transparent); border-radius: 50%; transform: rotate(-1deg); }
  .tempest-leader { position: absolute; left: 50%; top: 24%; width: 1px; height: 56%; background: color-mix(in srgb, var(--gold) 42%, transparent); clip-path: polygon(0 0, 100% 0, 100% 34%, 0 48%, 100% 62%, 0 78%, 100% 100%, 0 100%); box-shadow: -3rem 5rem 0 color-mix(in srgb, var(--amber) 18%, transparent), 3.4rem 8rem 0 color-mix(in srgb, var(--amber) 16%, transparent); }
  .tempest-magnetosphere { position: absolute; left: 50%; top: 53%; width: min(72vw, 66rem); aspect-ratio: 2.6; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); border-left-color: transparent; border-radius: 50%; }

  /* Canticle: two waveform voices share architecture and leave one visible rest. */
  .canticle-chamber { position: absolute; left: 10%; right: 10%; top: 28%; bottom: 16%; border: 1px solid color-mix(in srgb, var(--gold) 14%, transparent); border-radius: 50% 50% 14% 14%; background: repeating-radial-gradient(ellipse at 50% 52%, transparent 0 8%, color-mix(in srgb, var(--amber) 5%, transparent) 8.2% 8.5%, transparent 8.7% 16%); }
  .canticle-node { position: absolute; top: 53%; width: 0.72rem; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--gold) 48%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 82%, transparent); box-shadow: 0 0 1.2rem color-mix(in srgb, var(--amber) 26%, transparent); }
  .node-one { left: 24%; } .node-two { left: 50%; transform: translateX(-50%); } .node-three { right: 24%; }
  .canticle-wave { position: absolute; left: 12%; right: 12%; top: 49%; height: 8%; border-top: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--amber) 12%, transparent); border-radius: 50%; }
  .wave-one { transform: rotate(3deg); }
  .wave-two { transform: rotate(-3deg) translateY(2.6rem); opacity: 0.6; }
  .canticle-rest { position: absolute; left: 50%; top: 53%; width: min(14vw, 10rem); height: 5.4rem; transform: translate(-50%, -50%); border: 1px dashed color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 42%, transparent); }

  /* Clockwork: one inspectable civic transmission centered on the Heart. */
  .clockwork-depth {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 53%, color-mix(in srgb, var(--amber) 11%, transparent) 0 7%, transparent 34%),
      linear-gradient(180deg, transparent 0 47%, color-mix(in srgb, var(--panel) 12%, transparent) 72%, color-mix(in srgb, var(--bg) 42%, transparent));
  }
  .clockwork-horizon {
    position: absolute;
    left: 7%;
    right: 7%;
    top: 32%;
    height: 36%;
    border-top: 1px solid color-mix(in srgb, var(--gold) 16%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--amber) 11%, transparent);
    background: repeating-linear-gradient(90deg, transparent 0 8.5%, color-mix(in srgb, var(--gold) 8%, transparent) 8.6% 8.75%);
    -webkit-mask: linear-gradient(90deg, transparent, #000 13% 87%, transparent);
    mask: linear-gradient(90deg, transparent, #000 13% 87%, transparent);
  }
  .clockwork-meridian {
    position: absolute;
    left: 50%;
    top: 12%;
    bottom: 10%;
    width: 1px;
    background: linear-gradient(transparent, color-mix(in srgb, var(--gold) 38%, transparent) 20% 82%, transparent);
  }
  .clockwork-gear,
  .clockwork-chapter-ring {
    position: absolute;
    left: 50%;
    top: 53%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .clockwork-gear {
    background: repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--gold) 30%, transparent) 0 2deg, transparent 2deg 15deg);
    -webkit-mask: radial-gradient(circle, transparent 0 62%, #000 63% 72%, transparent 73%);
    mask: radial-gradient(circle, transparent 0 62%, #000 63% 72%, transparent 73%);
    animation: clockwork-index 36s steps(24, end) infinite;
  }
  .gear-primary { width: min(39vw, 34rem); aspect-ratio: 1; }
  .gear-secondary { width: min(62vw, 58rem); aspect-ratio: 1; opacity: 0.38; animation-direction: reverse; animation-duration: 54s; }
  .clockwork-chapter-ring {
    width: min(49vw, 45rem);
    aspect-ratio: 1;
    border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent);
    box-shadow: inset 0 0 2.8rem color-mix(in srgb, var(--amber) 4%, transparent);
  }
  .clockwork-power-train {
    position: absolute;
    left: 18%;
    right: 18%;
    top: 53%;
    height: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 38%, transparent) 12% 88%, transparent);
  }
  .clockwork-power-train i {
    width: 0.64rem;
    aspect-ratio: 1;
    border: 1px solid color-mix(in srgb, var(--gold) 46%, transparent);
    border-radius: 50%;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    box-shadow: 0 0 0 0.24rem color-mix(in srgb, var(--amber) 7%, transparent);
  }
  .scene-composition {
    opacity: calc(0.58 + var(--scene-strength) * 0.28);
  }
  .scene-vignette {
    z-index: 4;
    background: radial-gradient(ellipse at 50% 53%, transparent 0 28%, rgba(2, 4, 10, 0.12) 58%, rgba(1, 2, 7, 0.7) 100%);
  }

  /* Emberlight: one solar system, not a field of disconnected tokens. */
  .ember-haze,
  .ember-corona,
  .ember-orbit {
    position: absolute;
    left: 50%;
    top: 53%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .ember-haze {
    width: min(76vw, 68rem);
    aspect-ratio: 1.45;
    background:
      radial-gradient(ellipse at center, color-mix(in srgb, var(--amber) 11%, transparent) 0 12%, transparent 54%),
      radial-gradient(ellipse at center, color-mix(in srgb, var(--gold) 6%, transparent) 0 2%, transparent 68%);
    filter: blur(18px);
  }
  .ember-corona {
    width: min(34vw, 28rem);
    aspect-ratio: 1;
    background: repeating-conic-gradient(from 8deg, color-mix(in srgb, var(--gold) 12%, transparent) 0 1deg, transparent 1deg 18deg);
    -webkit-mask: radial-gradient(circle, transparent 0 28%, #000 45%, transparent 72%);
    mask: radial-gradient(circle, transparent 0 28%, #000 45%, transparent 72%);
    animation: corona-turn 70s linear infinite;
  }
  .ember-orbit {
    border: 1px solid color-mix(in srgb, var(--gold) 30%, transparent);
    box-shadow: inset 0 0 2rem color-mix(in srgb, var(--amber) 3%, transparent);
  }
  .orbit-one { width: min(32vw, 29rem); aspect-ratio: 1.85; transform: translate(-50%, -50%) rotate(-9deg); }
  .orbit-two { width: min(55vw, 52rem); aspect-ratio: 2.15; opacity: 0.52; transform: translate(-50%, -50%) rotate(6deg); }
  .orbit-three { width: min(76vw, 72rem); aspect-ratio: 2.55; opacity: 0.22; transform: translate(-50%, -50%) rotate(-4deg); }
  .ember-constellation i {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: calc(0.22rem + var(--spark) * 0.26rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background: color-mix(in srgb, var(--gold) 86%, white);
    box-shadow:
      0 0 calc(0.4rem + var(--spark) * 0.9rem) color-mix(in srgb, var(--amber) 58%, transparent),
      0 0 0 1px color-mix(in srgb, var(--gold) 20%, transparent);
    opacity: calc(0.25 + var(--spark));
    animation: ember-signal 5.8s ease-in-out infinite alternate;
  }

  /* Tidefall: layered currents share a horizon and the landmarks form two shoals. */
  .tide-depth {
    position: absolute;
    inset: 8% 0 0;
    background:
      radial-gradient(ellipse at 50% 55%, color-mix(in srgb, var(--amber) 12%, transparent) 0 5%, transparent 42%),
      linear-gradient(180deg, transparent 0 28%, color-mix(in srgb, var(--panel) 16%, transparent) 58%, color-mix(in srgb, var(--bg) 35%, transparent) 100%);
  }
  .tide-current {
    position: absolute;
    left: -12vw;
    width: 124vw;
    border-radius: 50%;
    border-top: 1px solid color-mix(in srgb, var(--gold) 34%, transparent);
    box-shadow: 0 -1.2rem 2.8rem color-mix(in srgb, var(--amber) 4%, transparent);
    transform-origin: center;
    animation: current-drift 14s ease-in-out infinite alternate;
  }
  .current-one { top: 39%; height: 24%; transform: rotate(-2deg); }
  .current-two { top: 51%; height: 18%; opacity: 0.54; transform: rotate(2deg); animation-delay: -4s; }
  .current-three { top: 67%; height: 16%; opacity: 0.24; transform: rotate(-1deg); animation-delay: -8s; }
  .tide-caustic {
    position: absolute;
    left: 50%;
    top: 53%;
    width: min(68vw, 64rem);
    aspect-ratio: 2.5;
    border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
    border-left-color: transparent;
    border-right-color: transparent;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: inset 0 0 4rem color-mix(in srgb, var(--amber) 4%, transparent);
  }
  .tide-bubbles i {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: calc(0.28rem + var(--bubble) * 0.8rem);
    aspect-ratio: 1;
    border: 1px solid color-mix(in srgb, var(--gold) 48%, transparent);
    border-radius: 50%;
    opacity: calc(0.18 + var(--bubble));
    animation: bubble-rise 9s ease-in-out infinite alternate;
  }
  .tide-shoal i {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: calc(0.8rem + var(--fish) * 1.4rem);
    height: calc(0.24rem + var(--fish) * 0.34rem);
    border-radius: 70% 46% 46% 70%;
    background: color-mix(in srgb, var(--gold) 46%, transparent);
    opacity: calc(0.16 + var(--fish) * 0.42);
    animation: shoal-drift 11s ease-in-out infinite alternate;
  }
  .tide-shoal i::after {
    content: '';
    position: absolute;
    right: -32%;
    top: 50%;
    width: 42%;
    height: 150%;
    background: inherit;
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
    transform: translateY(-50%);
  }
  .tide-shoal i:nth-child(-n + 3) { transform: scaleX(-1); }

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
    bottom: calc(100% + 0.65rem);
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
    inset: -20% -46%;
    border: 1px solid color-mix(in srgb, var(--gold) 32%, transparent);
    border-left-color: transparent;
    border-right-color: transparent;
    box-shadow: inset 0 0 2.5rem color-mix(in srgb, var(--amber) 8%, transparent);
    animation: heart-current 7s ease-in-out infinite alternate;
  }
  .tidefall .heart-frame::before {
    inset: 20% 28%;
    border-top: 1px solid color-mix(in srgb, var(--gold) 58%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
  }
  .tidefall .heart-frame::after {
    inset: -24% 12%;
    border: 1px solid color-mix(in srgb, var(--amber) 18%, transparent);
    border-top-color: transparent;
    border-bottom-color: transparent;
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
  @keyframes corona-turn { to { transform: translate(-50%, -50%) rotate(360deg); } }
  @keyframes ember-signal { to { opacity: 0.28; transform: scale(0.72); } }
  @keyframes heart-orbit { to { transform: rotate(360deg); } }
  @keyframes current-drift { to { transform: translateY(-1.5%) rotate(1deg) scaleX(1.02); } }
  @keyframes bubble-rise { to { transform: translateY(-1.6rem); opacity: 0.16; } }
  @keyframes shoal-drift { to { margin-left: 1.4rem; opacity: 0.2; } }
  @keyframes heart-current { to { transform: scaleX(1.04) scaleY(0.94); opacity: 0.62; } }
  @keyframes leaf-breathe { to { transform: rotate(var(--leaf-rotation)) translateY(-0.3rem); opacity: 0.28; } }
  @keyframes seed-breathe { to { transform: scale(1.035, 0.97); opacity: 0.72; } }
  @keyframes clockwork-index { to { transform: translate(-50%, -50%) rotate(360deg); } }
  @keyframes clockwork-heart-index { to { transform: rotate(360deg); } }
  :global(html[data-visual-quality='low']) .orbit-three,
  :global(html[data-visual-quality='low']) .current-three,
  :global(html[data-visual-quality='low']) .ember-constellation i:nth-child(n + 5),
  :global(html[data-visual-quality='low']) .tide-bubbles i:nth-child(n + 4),
  :global(html[data-visual-quality='low']) .tide-shoal i:nth-child(n + 4) { display: none; }
  :global(html[data-contrast='high']) .ember-orbit,
  :global(html[data-contrast='high']) .tide-current,
  :global(html[data-contrast='high']) .tide-caustic,
  :global(html[data-contrast='high']) .heart-frame { border-color: rgba(255, 255, 255, 0.64); }
  @media (prefers-reduced-motion: reduce) {
    .manifest-world,
    .manifest-world * { animation: none !important; transition: none !important; }
  }
</style>
