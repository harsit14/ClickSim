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
  import {
    brahmalokStatus,
    canticleStatus,
    tempestStatus,
    type KailashAct,
  } from '../content/universes/f4-runtime'

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

  const KAILASH_SNOW = [
    ['7%', '18%', '.7'], ['15%', '61%', '1'], ['23%', '34%', '.8'], ['31%', '76%', '.6'],
    ['39%', '12%', '1'], ['47%', '54%', '.7'], ['55%', '25%', '.9'], ['63%', '69%', '.6'],
    ['70%', '40%', '1'], ['77%', '16%', '.7'], ['83%', '58%', '.9'], ['89%', '31%', '.6'],
    ['94%', '73%', '.8'], ['52%', '83%', '.6'],
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
  const brahmalokWorldState = $derived(pack.id === 'prismata' ? brahmalokStatus(numericLawState, owned) : null)
  const vishnulokWorldState = $derived(pack.id === 'tempest' ? tempestStatus(numericLawState) : null)
  const kailashWorldState = $derived(pack.id === 'canticle' ? canticleStatus(numericLawState, owned, now) : null)
  const brahmalokDirectionMax = $derived(Math.max(1, ...(brahmalokWorldState?.bands ?? [0])))

  function brahmalokDirectionStrength(index: number): number {
    return (brahmalokWorldState?.bands[index] ?? 0) / brahmalokDirectionMax
  }

  function kailashActGlyph(role: KailashAct): string {
    return role === 'rest' ? '○' : role === 'emergence' ? '△' : role === 'shelter' ? '⌂' : role === 'release' ? '▽' : role === 'veil' ? '⌁' : '◇'
  }

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
  class:low-quality={preferences.quality === 'low'}
  aria-label={`${pack.identity.shortName} authored world`}
  data-universe-v2={pack.id}
  data-layout-diagnostics={plan.diagnostics.length}
  data-visible-objects={plan.objects.length}
  data-presentation-ready={presentation !== null}
  data-world-state={worldState?.key ?? 'none'}
  data-virgin-state={virginWorld}
  data-brahmalok-directions={brahmalokWorldState?.activeBands ?? undefined}
  data-vishnulok-returning={vishnulokWorldState ? vishnulokWorldState.boostRemainingSec > 0 : undefined}
  data-kailash-act={kailashWorldState?.role ?? undefined}
  style={`--scene-strength:${sceneStrength};--loka-balance:${brahmalokWorldState?.balance ?? 0};--loka-continuity:${(vishnulokWorldState?.charge ?? 0) / 100};--loka-reach:${(vishnulokWorldState?.length ?? 0) / 8};--loka-pattern:${Math.max(0, (kailashWorldState?.patternBonus ?? 1) - 1)};--loka-cycle:${kailashWorldState ? (kailashWorldState.slotIndex + 1) / kailashWorldState.slots.length : 0}`}
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
        <div class="brahmalok-dawn"></div>
        <div class="brahmalok-manuscript"></div>
        <div class="brahmalok-rivers"><i></i><i></i><i></i><i></i></div>
        <div class="brahmalok-courts">
          {#each Array.from({ length: 4 }) as _, index}<i class:active={(brahmalokWorldState?.bands[index] ?? 0) > 0} style={`--direction-strength:${brahmalokDirectionStrength(index)}`}></i>{/each}
        </div>
        <div class="brahmalok-lotus">
          {#each Array.from({ length: 12 }) as _, index}
            {@const directionIndex = Math.floor(index / 3)}
            <i class:active={(brahmalokWorldState?.bands[directionIndex] ?? 0) > 0} style={`--petal-index:${index};--petal-strength:${brahmalokDirectionStrength(directionIndex)}`}></i>
          {/each}
          <b></b><span></span>
        </div>
        <div class="brahmalok-script"><i></i><i></i><i></i><i></i><i></i></div>
      {:else if pack.id === 'tempest'}
        <div class="vishnulok-depth"></div>
        <div class="vishnulok-horizon"></div>
        <div class="vishnulok-currents">
          {#each Array.from({ length: 3 }) as _, index}<i class:active={index < Math.ceil((vishnulokWorldState?.length ?? 0) / 3)} style={`--current-index:${index}`}></i>{/each}
        </div>
        <div class="vishnulok-refuges">
          {#each Array.from({ length: 4 }) as _, index}<i class:active={index < Math.ceil((vishnulokWorldState?.length ?? 0) / 2)}></i>{/each}
        </div>
        <div class="vishnulok-leaves"><i></i><i></i><i></i></div>
        <div class="vishnulok-return" class:returning={(vishnulokWorldState?.boostRemainingSec ?? 0) > 0}><i></i></div>
        <div class="vishnulok-continuity" class:returning={(vishnulokWorldState?.boostRemainingSec ?? 0) > 0}></div>
        <div class="vishnulok-sounding"></div>
      {:else if pack.id === 'canticle'}
        <div class="kailash-sky"></div>
        <div class="kailash-moon"></div>
        <div class="kailash-range range-far"></div>
        <div class="kailash-range range-near"></div>
        <div class="kailash-river"></div>
        <div class="kailash-river-glints"><i></i><i></i><i></i></div>
        <div class="kailash-shelters"><i></i><i></i><i></i><i></i></div>
        <div class="kailash-clouds"><i></i><i></i><i></i></div>
        <div class="kailash-snow">
          {#each KAILASH_SNOW as flake, index}<i style={`--snow-index:${index};--snow-x:${flake[0]};--snow-y:${flake[1]};--snow-size:${flake[2]}`}></i>{/each}
        </div>
        <div class="kailash-copper-ring" class:responsible={(kailashWorldState?.distinctRoles ?? 0) === 6 && (kailashWorldState?.restCount ?? 0) >= 3}></div>
        <div class="kailash-cycle-marker" data-role={kailashWorldState?.role ?? 'rest'}><span>{kailashWorldState ? kailashActGlyph(kailashWorldState.role) : '○'}</span></div>
        <div class="kailash-still" data-role={kailashWorldState?.role ?? 'rest'}><span>{kailashWorldState ? kailashActGlyph(kailashWorldState.role) : '○'}</span></div>
      {/if}
    </div>
    {/if}

    {#if brahmalokWorldState}
      <p class="sr-only">Brahmalok world state: {brahmalokWorldState.activeBands} creation directions active at {Math.round(brahmalokWorldState.balance * 100)} percent balance.</p>
    {:else if vishnulokWorldState}
      <p class="sr-only">Vishnulok world state: {Math.round(vishnulokWorldState.charge)} percent continuity across {vishnulokWorldState.length} shelters; {vishnulokWorldState.boostRemainingSec > 0 ? 'return in progress' : 'gathering continuity'}.</p>
    {:else if kailashWorldState}
      <p class="sr-only">Kailash world state: position {kailashWorldState.slotIndex + 1} of {kailashWorldState.slots.length}, {kailashWorldState.role}; {kailashWorldState.restCount} rests and {kailashWorldState.distinctRoles} distinct acts.</p>
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

  /* Brahmalok: libraries and making courts unfold from one unoccupied lotus center. */
  .brahmalok-dawn { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 68%, color-mix(in srgb, var(--amber) 14%, transparent), transparent 38%), linear-gradient(180deg, color-mix(in srgb, #587a98 7%, transparent), transparent 46%); }
  .brahmalok-manuscript { position: absolute; left: 7%; right: 7%; top: 22%; bottom: 9%; border: 1px solid color-mix(in srgb, var(--gold) 9%, transparent); border-radius: 46% 46% 2rem 2rem; background: repeating-linear-gradient(0deg, transparent 0 3.2rem, color-mix(in srgb, var(--gold) 3%, transparent) 3.25rem 3.3rem); clip-path: polygon(8% 0, 92% 0, 100% 12%, 100% 100%, 0 100%, 0 12%); }
  .brahmalok-manuscript::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: linear-gradient(transparent, color-mix(in srgb, var(--gold) 12%, transparent), transparent); }
  .brahmalok-rivers { position: absolute; inset: 0; }
  .brahmalok-rivers i { position: absolute; left: 50%; top: 59%; width: 44%; height: 1px; transform-origin: left center; background: linear-gradient(90deg, color-mix(in srgb, #83c8dd 24%, transparent), transparent); }
  .brahmalok-rivers i:nth-child(1) { transform: rotate(12deg); } .brahmalok-rivers i:nth-child(2) { transform: rotate(168deg); } .brahmalok-rivers i:nth-child(3) { transform: rotate(42deg); } .brahmalok-rivers i:nth-child(4) { transform: rotate(138deg); }
  .brahmalok-courts { position: absolute; inset: 0; }
  .brahmalok-courts i { position: absolute; width: clamp(5rem, 9vw, 8rem); aspect-ratio: 1.45; border: 1px solid color-mix(in srgb, var(--gold) calc(8% + var(--direction-strength, 0) * 34%), transparent); background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--amber) calc(2% + var(--direction-strength, 0) * 12%), transparent) 0 1px, transparent 1px 22%); clip-path: polygon(10% 0, 90% 0, 100% 24%, 100% 100%, 0 100%, 0 24%); opacity: calc(.3 + var(--direction-strength, 0) * .7); transition: opacity .45s ease, filter .45s ease; }
  .brahmalok-courts i.active { filter: drop-shadow(0 0 .7rem color-mix(in srgb, var(--amber) calc(var(--direction-strength) * 22%), transparent)); }
  .brahmalok-courts i:nth-child(1) { left: 15%; top: 33%; } .brahmalok-courts i:nth-child(2) { right: 15%; top: 33%; transform: scaleX(-1); } .brahmalok-courts i:nth-child(3) { left: 20%; bottom: 14%; transform: scale(.78); } .brahmalok-courts i:nth-child(4) { right: 20%; bottom: 14%; transform: scale(-.78,.78); }
  .brahmalok-lotus { position: absolute; left: 50%; top: 59%; width: min(27vw, 22rem); aspect-ratio: 1; transform: translate(-50%, -50%); filter: drop-shadow(0 0 2.4rem color-mix(in srgb, var(--amber) 15%, transparent)); }
  .brahmalok-lotus > i { --petal-angle: calc(var(--petal-index) * 30deg); position: absolute; left: 50%; top: 50%; width: 17%; height: 42%; transform-origin: 0 0; transform: rotate(var(--petal-angle)) translate(-50%, -86%); border: 1px solid color-mix(in srgb, var(--gold) calc(10% + var(--petal-strength, 0) * 58%), transparent); border-radius: 70% 18% 70% 18%; background: linear-gradient(180deg, color-mix(in srgb, var(--amber) calc(3% + var(--petal-strength, 0) * 21%), transparent), transparent 70%); opacity: calc(.24 + var(--petal-strength, 0) * .76); transition: opacity .4s ease, filter .4s ease; }
  .brahmalok-lotus > i.active { filter: drop-shadow(0 0 .45rem color-mix(in srgb, var(--amber) calc(var(--petal-strength) * 34%), transparent)); }
  .brahmalok-lotus b { position: absolute; inset: 31%; border: 1px solid color-mix(in srgb, var(--amber) calc(22% + var(--loka-balance) * 46%), transparent); border-radius: 50%; box-shadow: 0 0 calc(.4rem + var(--loka-balance) * 1.2rem) color-mix(in srgb, var(--amber) calc(var(--loka-balance) * 24%), transparent); }
  .brahmalok-lotus span { position: absolute; inset: 42%; border: 1px dashed color-mix(in srgb, #8ecbe0 48%, transparent); background: color-mix(in srgb, var(--bg) 88%, transparent); transform: rotate(45deg); }
  .brahmalok-script { position: absolute; left: 8%; right: 8%; bottom: 6%; height: 3rem; display: flex; justify-content: center; gap: 3.5%; opacity: .42; }
  .brahmalok-script i { width: 12%; border-top: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--amber) 12%, transparent); transform: skewX(-16deg); }
  .motion-paused .brahmalok-lotus { filter: none; }

  /* Vishnulok: calm cosmic water organized by refuge, return, and responsive order. */
  .vishnulok-depth { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 62%,color-mix(in srgb,var(--amber) 10%,transparent),transparent 38%),linear-gradient(180deg,color-mix(in srgb,#304c83 8%,transparent),transparent 38%,color-mix(in srgb,#0b2351 20%,transparent)); }
  .vishnulok-horizon { position:absolute;left:-6%;right:-6%;top:57%;height:26%;border-top:1px solid color-mix(in srgb,var(--gold) 30%,transparent);border-radius:50%;background:repeating-radial-gradient(ellipse at 50% 0,transparent 0 1.6rem,color-mix(in srgb,#7898cc 6%,transparent) 1.65rem 1.72rem); }
  .vishnulok-currents { position:absolute;inset:0; }.vishnulok-currents i { --current-angle:calc((var(--current-index) - 1) * 12deg);position:absolute;left:50%;top:56%;width:min(calc(38vw + var(--loka-reach) * 18vw - var(--current-index) * 4vw),62rem);aspect-ratio:3;transform:translate(-50%,-50%) rotate(var(--current-angle));border-top:1px solid color-mix(in srgb,var(--gold) 8%,transparent);border-bottom:1px solid color-mix(in srgb,var(--amber) 4%,transparent);border-radius:50%;opacity:.16;transition:opacity .45s ease,border-color .45s ease; }.vishnulok-currents i.active { border-color:color-mix(in srgb,var(--gold) calc(16% + var(--loka-continuity) * 26%),transparent);opacity:calc(.28 + var(--loka-continuity) * .34);filter:drop-shadow(0 0 .28rem color-mix(in srgb,var(--amber) 9%,transparent)); }
  .vishnulok-refuges { position:absolute;inset:0; }.vishnulok-refuges i { position:absolute;top:48%;width:clamp(4rem,8vw,7rem);height:3.2rem;border:1px solid color-mix(in srgb,var(--gold) 8%,transparent);border-bottom:0;border-radius:55% 55% 0 0;background:linear-gradient(180deg,color-mix(in srgb,var(--gold) 2%,transparent),transparent);opacity:.28;transition:opacity .45s ease,box-shadow .45s ease; }.vishnulok-refuges i.active { border-color:color-mix(in srgb,var(--gold) 32%,transparent);opacity:.78;box-shadow:inset 0 .7rem 1.2rem color-mix(in srgb,var(--amber) 6%,transparent); }.vishnulok-refuges i:nth-child(1){left:12%}.vishnulok-refuges i:nth-child(2){left:31%;top:66%;transform:scale(.8)}.vishnulok-refuges i:nth-child(3){right:31%;top:66%;transform:scale(.8)}.vishnulok-refuges i:nth-child(4){right:12%}
  .vishnulok-leaves { position:absolute;inset:0; }.vishnulok-leaves i { position:absolute;top:68%;width:3.4rem;height:1.35rem;border:1px solid color-mix(in srgb,#85b58d 24%,transparent);border-radius:70% 30% 70% 30%;transform:rotate(var(--leaf-angle,0deg)); }.vishnulok-leaves i:nth-child(1){left:20%;--leaf-angle:-12deg}.vishnulok-leaves i:nth-child(2){left:calc(50% - 1.7rem);top:73%;--leaf-angle:4deg}.vishnulok-leaves i:nth-child(3){right:20%;--leaf-angle:16deg}
  .vishnulok-return { position:absolute;left:50%;top:56%;width:min(46vw,40rem);aspect-ratio:2.7;transform:translate(-50%,-50%);border:2px solid color-mix(in srgb,var(--amber) calc(12% + var(--loka-continuity) * 34%),transparent);border-left-color:transparent;border-radius:50%;filter:drop-shadow(0 0 1.2rem color-mix(in srgb,var(--amber) 12%,transparent));transition:filter .45s ease; }.vishnulok-return.returning { filter:drop-shadow(0 0 1.8rem color-mix(in srgb,var(--amber) 34%,transparent));animation:return-breathe 2.8s ease-in-out infinite alternate; }.vishnulok-return i { position:absolute;right:-.2rem;top:48%;width:.8rem;height:.8rem;border-top:2px solid color-mix(in srgb,var(--gold) 58%,transparent);border-right:2px solid color-mix(in srgb,var(--gold) 58%,transparent);transform:rotate(45deg); }
  .vishnulok-continuity { position:absolute;z-index:2;left:50%;top:56%;width:min(11vw,9rem);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:conic-gradient(color-mix(in srgb,var(--gold) 48%,#6d8fd1) calc(var(--loka-continuity) * 1turn),color-mix(in srgb,var(--gold) 5%,transparent) 0);-webkit-mask:radial-gradient(circle,transparent 66%,#000 68%);mask:radial-gradient(circle,transparent 66%,#000 68%);opacity:.5; }.vishnulok-continuity.returning { opacity:.82;filter:drop-shadow(0 0 .65rem color-mix(in srgb,var(--amber) 28%,transparent)); }
  .vishnulok-sounding { position:absolute;left:50%;top:29%;bottom:11%;width:1px;background:linear-gradient(transparent,color-mix(in srgb,var(--gold) 20%,transparent),transparent);box-shadow:-.4rem 1.1rem 0 color-mix(in srgb,var(--gold) 8%,transparent),.4rem 2.2rem 0 color-mix(in srgb,var(--gold) 8%,transparent); }

  /* Kailash: environment-first sacred geography; no deity or sacred attribute is rendered as a game object. */
  .kailash-sky { position:absolute;inset:0;background:radial-gradient(circle at 72% 20%,color-mix(in srgb,var(--gold) 9%,transparent),transparent 16%),linear-gradient(180deg,#050913 0%,#0a1524 55%,#101b27 100%); }
  .kailash-moon { position:absolute;right:19%;top:12%;width:clamp(2.6rem,5vw,5.4rem);aspect-ratio:1;border:1px solid color-mix(in srgb,var(--gold) 45%,transparent);border-radius:50%;box-shadow:0 0 2.8rem color-mix(in srgb,var(--gold) 18%,transparent); }.kailash-moon::after { content:'';position:absolute;inset:-.2rem -.65rem .3rem .65rem;border-radius:50%;background:#070c16; }
  .kailash-range { position:absolute;left:50%;bottom:0;transform:translateX(-50%);clip-path:polygon(0 100%,14% 68%,25% 75%,39% 43%,48% 57%,59% 7%,70% 61%,81% 48%,100% 100%); }
  .range-far { width:112%;height:62%;background:#15283a;opacity:.7; }.range-near { width:94%;height:54%;background:linear-gradient(145deg,color-mix(in srgb,var(--gold) 16%,#28465d),#0b1726 48%,#050a12 80%);filter:drop-shadow(0 0 1.6rem color-mix(in srgb,var(--gold) 7%,transparent)); }
  .kailash-river { position:absolute;z-index:2;left:57%;top:37%;width:.22rem;height:63%;background:linear-gradient(var(--gold),#75b5c5 52%,transparent);transform:rotate(7deg);box-shadow:0 0 1rem color-mix(in srgb,var(--gold) 34%,transparent); }.kailash-river::after { content:'';position:absolute;left:-2rem;bottom:-.2rem;width:5rem;height:.8rem;border-top:1px solid color-mix(in srgb,#75b5c5 34%,transparent);border-radius:50%; }
  .kailash-river-glints { position:absolute;z-index:3;inset:0;pointer-events:none; }.kailash-river-glints i { position:absolute;left:calc(55.8% + var(--glint-offset, 0%));width:clamp(1.2rem,2.4vw,2.4rem);height:.32rem;border-top:1px solid color-mix(in srgb,#bce8ee 48%,transparent);border-radius:50%;filter:drop-shadow(0 0 .32rem color-mix(in srgb,#75b5c5 28%,transparent));opacity:.5;animation:river-glint 5.6s ease-in-out infinite alternate; }.kailash-river-glints i:nth-child(1){top:56%;--glint-offset:-.5%;animation-delay:-1.6s}.kailash-river-glints i:nth-child(2){top:70%;--glint-offset:-1.1%;transform:scale(.82);animation-delay:-3.2s}.kailash-river-glints i:nth-child(3){top:84%;--glint-offset:-1.8%;transform:scale(.68);animation-delay:-4.5s}
  .kailash-shelters { position:absolute;z-index:3;inset:0; }.kailash-shelters i { position:absolute;bottom:9%;width:clamp(2.2rem,4vw,4rem);height:1.8rem;border:1px solid color-mix(in srgb,var(--gold) 18%,transparent);border-bottom:0;border-radius:55% 55% 0 0;background:color-mix(in srgb,#172b39 72%,transparent); }.kailash-shelters i::before { content:'';position:absolute;left:50%;bottom:.12rem;width:.38rem;height:.46rem;transform:translateX(-50%);border:1px solid color-mix(in srgb,#f0d5a1 42%,transparent);border-bottom:0;border-radius:50% 50% 0 0;background:color-mix(in srgb,#dca45d 42%,transparent);box-shadow:0 0 .85rem color-mix(in srgb,#e7b96f 38%,transparent);animation:shelter-lamp 4.8s ease-in-out infinite alternate; }.kailash-shelters i::after { content:'';position:absolute;left:54%;top:-.55rem;width:.55rem;height:.8rem;border-left:1px solid color-mix(in srgb,#cbd9df 14%,transparent);border-radius:50%;transform:rotate(-15deg);opacity:.45; }.kailash-shelters i:nth-child(1){left:10%}.kailash-shelters i:nth-child(2){left:29%;bottom:16%;transform:scale(.78)}.kailash-shelters i:nth-child(3){right:29%;bottom:13%;transform:scale(.82)}.kailash-shelters i:nth-child(4){right:9%}
  .kailash-clouds { position:absolute;z-index:2;inset:0; }.kailash-clouds i { position:absolute;width:24%;height:7%;border-top:1px solid color-mix(in srgb,var(--gold) 11%,transparent);border-radius:50%;opacity:.55; }.kailash-clouds i:nth-child(1){left:8%;top:27%}.kailash-clouds i:nth-child(2){right:8%;top:36%}.kailash-clouds i:nth-child(3){left:36%;top:16%;width:29%}
  .kailash-snow { position:absolute;z-index:3;inset:7% 2% 20%;overflow:hidden;pointer-events:none; }.kailash-snow i { position:absolute;left:var(--snow-x);top:var(--snow-y);width:calc(.13rem * var(--snow-size));aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,#dbe9ee 48%,transparent);box-shadow:0 0 .3rem color-mix(in srgb,#bfd9e3 18%,transparent);opacity:calc(.35 + var(--snow-size) * .25);animation:snow-drift calc(8s + var(--snow-index) * .28s) ease-in-out infinite alternate;animation-delay:calc(var(--snow-index) * -.73s); }
  .kailash-copper-ring { position:absolute;z-index:1;left:57%;top:47%;width:min(33vw,27rem);aspect-ratio:1;transform:translate(-50%,-50%);border:1px solid color-mix(in srgb,#c47d4f calc(16% + var(--loka-pattern) * 82%),transparent);border-left-color:transparent;border-radius:50%;filter:drop-shadow(0 0 calc(.5rem + var(--loka-pattern) * 2.2rem) color-mix(in srgb,#c47d4f calc(7% + var(--loka-pattern) * 38%),transparent)); }.kailash-copper-ring.responsible { border-width:2px; }
  .kailash-cycle-marker { position:absolute;z-index:4;left:57%;top:47%;width:min(33vw,27rem);aspect-ratio:1;transform:translate(-50%,-50%) rotate(calc(var(--loka-cycle) * 1turn));border-radius:50%;pointer-events:none; }.kailash-cycle-marker span { position:absolute;left:50%;top:-.55rem;width:1.1rem;height:1.1rem;display:grid;place-items:center;transform:translateX(-50%) rotate(calc(var(--loka-cycle) * -1turn));color:#d89a6d;background:#07101a;border:1px solid color-mix(in srgb,#c47d4f 58%,transparent);border-radius:50%;font:.55rem/1 ui-monospace,monospace;box-shadow:0 0 .8rem color-mix(in srgb,#c47d4f 24%,transparent); }
  .kailash-cycle-marker[data-role='rest'] span { color:#c8dce3;border-style:dashed; }.kailash-cycle-marker[data-role='shelter'] span { color:#e8d3a8; }.kailash-cycle-marker[data-role='release'] span { color:#e08b5d; }
  .kailash-still { position:absolute;z-index:4;left:57%;top:41%;width:1.7rem;aspect-ratio:1;display:grid;place-items:center;transform:translate(-50%,-50%);border:1px solid color-mix(in srgb,var(--gold) 42%,transparent);border-radius:50%;background:#060a12;box-shadow:0 0 1.6rem color-mix(in srgb,#75b5c5 18%,transparent); }.kailash-still span { color:#c8dce3;font:.58rem/1 ui-monospace,monospace; }.kailash-still[data-role='release'] span { color:#df8a5c; }.kailash-still[data-role='grace'] span { color:#e3d4b2; }

  @keyframes return-breathe { from { opacity:.68; } to { opacity:1; } }
  @keyframes river-glint { to { opacity:.82;transform:translateX(.35rem) scaleX(1.12); } }
  @keyframes shelter-lamp { to { opacity:.72;box-shadow:0 0 1.1rem color-mix(in srgb,#e7b96f 48%,transparent); } }
  @keyframes snow-drift { to { transform:translate(.8rem,1.4rem);opacity:.28; } }
  .motion-paused .vishnulok-return.returning { animation:none; }
  .motion-paused .kailash-snow i,
  .motion-paused .kailash-river-glints i,
  .motion-paused .kailash-shelters i::before { animation:none; }
  .low-quality .kailash-snow i:nth-child(n + 7),
  .low-quality .kailash-river-glints i:nth-child(n + 3),
  .low-quality .kailash-shelters i::after { display:none; }

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
