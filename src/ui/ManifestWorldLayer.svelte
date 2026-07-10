<script lang="ts">
  import { onMount } from 'svelte'
  import type { UniversePackV2 } from '../content/universes'
  import {
    planManifestLayout,
    type ManifestRenderPreferences,
    type ManifestViewport,
  } from '../render/manifest-layout'

  interface Props {
    pack: UniversePackV2
    owned: Readonly<Record<string, number>>
    preferences: ManifestRenderPreferences
  }

  let { pack, owned, preferences }: Props = $props()
  let viewport = $state<ManifestViewport>({ width: 1280, height: 720 })

  const visibleObjectIds = $derived(pack.visual.objects
    .filter((object) => object.sourceKind === 'generator' && (owned[object.sourceId] ?? 0) > 0)
    .map((object) => object.id))

  const plan = $derived(planManifestLayout({
    visual: pack.visual,
    heart: pack.heart,
    viewport,
    state: {
      visibleObjectIds,
      ownershipBySourceId: owned,
    },
    preferences,
  }))

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

  onMount(measure)
</script>

<svelte:window onresize={measure} />

<section
  class="manifest-world"
  aria-label={`${pack.identity.shortName} manifested Kindlings`}
  data-universe-v2={pack.id}
  data-layout-diagnostics={plan.diagnostics.length}
  data-visible-objects={plan.objects.length}
>
  <h2 class="sr-only">Visible {pack.identity.shortName} Kindlings</h2>
  {#each plan.objects as object (object.objectId)}
    {@const ownedCount = owned[object.sourceId] ?? 0}
    <figure
      class="manifest-object"
      class:motion-paused={object.motionPaused}
      data-object-id={object.objectId}
      data-source-id={object.sourceId}
      data-zone={object.screenZone}
      data-motion={object.state.motion.kind}
      data-ownership-state={object.state.ownershipThreshold ?? 'base'}
      style={`left:${object.rect.x}px;top:${object.rect.y}px;width:${object.rect.width}px;height:${object.rect.height}px;opacity:${object.opacity}`}
      aria-label={`${object.state.label}; ${countLabel(ownedCount)}; ${object.state.silhouette}`}
    >
      <span class="phenomenon" aria-hidden="true"></span>
      <figcaption aria-hidden="true">
        <strong>{object.state.label}</strong>
        <span>{countLabel(ownedCount)}</span>
      </figcaption>
    </figure>
  {/each}
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
  .manifest-object {
    --object-light: color-mix(in srgb, var(--gold) 78%, white);
    --object-shadow: color-mix(in srgb, var(--amber) 46%, transparent);
    position: absolute;
    display: grid;
    place-items: center;
    margin: 0;
    filter: drop-shadow(0 0 9px var(--object-shadow));
    transition: opacity 180ms ease, filter 180ms ease;
  }
  .phenomenon {
    position: absolute;
    inset: 14%;
    background:
      radial-gradient(circle at 38% 32%, white 0 7%, transparent 9%),
      radial-gradient(ellipse at center, var(--object-light) 0 18%, var(--amber) 36%, transparent 69%);
    border: 1px solid color-mix(in srgb, var(--object-light) 58%, transparent);
    clip-path: polygon(50% 0, 61% 32%, 100% 50%, 65% 61%, 50% 100%, 36% 64%, 0 50%, 34% 37%);
    animation: authored-breathe 5.2s ease-in-out infinite;
  }
  [data-motion='orbital'] .phenomenon {
    border-width: 2px 1px;
    border-radius: 50%;
    clip-path: ellipse(49% 27% at 50% 50%);
    animation: authored-orbit 7s linear infinite;
  }
  [data-motion='growth'] .phenomenon {
    clip-path: polygon(50% 0, 78% 20%, 91% 54%, 66% 100%, 50% 73%, 34% 100%, 9% 54%, 22% 20%);
    animation: authored-grow 5.6s ease-in-out infinite;
  }
  [data-motion='optical'] .phenomenon {
    clip-path: polygon(0 45%, 42% 36%, 50% 0, 58% 36%, 100% 45%, 58% 56%, 50% 100%, 42% 56%);
    animation: authored-optical 6s ease-in-out infinite;
  }
  [data-motion='atmospheric'] .phenomenon {
    border-radius: 64% 36% 58% 42% / 42% 58% 35% 65%;
    clip-path: none;
    animation: authored-atmosphere 9.6s ease-in-out infinite;
  }
  [data-motion='waveform'] .phenomenon {
    clip-path: polygon(0 46%, 16% 46%, 25% 18%, 38% 78%, 50% 28%, 63% 67%, 74% 40%, 100% 40%, 100% 60%, 76% 60%, 63% 84%, 50% 49%, 38% 96%, 24% 42%, 18% 66%, 0 66%);
  }
  [data-ownership-state='50'] .phenomenon,
  [data-ownership-state='100'] .phenomenon {
    inset: 5%;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 20%, transparent);
  }
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
  .motion-paused .phenomenon { animation-play-state: paused; }
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
  @keyframes authored-breathe {
    0%, 100% { transform: scale(0.91) rotate(-2deg); }
    50% { transform: scale(1.04) rotate(2deg); }
  }
  @keyframes authored-orbit { to { transform: rotate(360deg); } }
  @keyframes authored-grow {
    0%, 100% { transform: scaleY(0.86); }
    50% { transform: scaleY(1.06); }
  }
  @keyframes authored-optical {
    0%, 100% { opacity: 0.58; transform: scaleX(0.82); }
    50% { opacity: 1; transform: scaleX(1.08); }
  }
  @keyframes authored-atmosphere {
    0%, 100% { transform: translate(-3%, 1%) scale(0.94); }
    50% { transform: translate(3%, -1%) scale(1.04); }
  }
  @media (prefers-reduced-motion: reduce) {
    .phenomenon { animation: none !important; }
    .manifest-object { transition: none; }
  }
</style>
