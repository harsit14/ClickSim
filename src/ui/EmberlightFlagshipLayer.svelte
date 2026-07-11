<script lang="ts">
  import { onMount } from 'svelte'
  import {
    buildEmberlightFlagshipScene,
    emberlightOwnershipThreshold,
    type FlagshipSeat,
  } from '../render/emberlight/flagship-scene'
  import { emberlightSetPieceStage } from '../render/emberlight/set-piece-registry'
  import SetPieceArt from './SetPieceArt.svelte'

  let {
    owned,
    reducedMotion = false,
  }: {
    owned: Readonly<Record<string, number>>
    reducedMotion?: boolean
  } = $props()

  const scene = $derived(buildEmberlightFlagshipScene(owned))
  const hearthStage = emberlightSetPieceStage('ember-kindling-hearth')!
  const kilnStage = emberlightSetPieceStage('ember-kindling-kiln')!
  const forgeStage = emberlightSetPieceStage('ember-kindling-forge')!
  let secondBlink = $state(0)

  const lifecycleLandmarks = $derived([
    (owned.wisp ?? 0) > 0
      ? { family: 'ember-exhale', name: 'The Auroral River', count: owned.wisp ?? 0, objectId: 'ember-kindling-wisp', x: 9, y: 68, size: 3.6, depth: 'ground' }
      : null,
    (owned.beacon ?? 0) > 0 || (owned.forge ?? 0) > 0
      ? { family: 'industry-signal', name: 'The Listening Crown', count: Math.max(owned.forge ?? 0, owned.beacon ?? 0), objectId: (owned.beacon ?? 0) > 0 ? 'ember-kindling-beacon' : 'ember-kindling-forge', x: 41, y: 71, size: 4.8, depth: 'ground' }
      : null,
    (owned.starseed ?? 0) > 0 || (owned.titan ?? 0) > 0
      ? { family: 'horizon-seed', name: 'The Seeded Range', count: Math.max(owned.titan ?? 0, owned.starseed ?? 0), objectId: (owned.starseed ?? 0) > 0 ? 'ember-kindling-starseed' : 'ember-kindling-titan', x: 76, y: 67, size: 4.5, depth: 'horizon' }
      : null,
    (owned.sun ?? 0) < 1 && (owned.protostar ?? 0) > 0
      ? { family: 'stellar-birth', name: 'The Rising Nursery', count: owned.protostar ?? 0, objectId: 'ember-kindling-protostar', x: 61, y: 43, size: 4.6, depth: 'horizon' }
      : null,
    (owned.constellation ?? 0) < 1 && (owned.binary ?? 0) > 0
      ? { family: 'stellar-relations', name: 'The Paired Clock', count: owned.binary ?? 0, objectId: 'ember-kindling-binary', x: 70, y: 39, size: 4.3, depth: 'deep' }
      : null,
    (owned.galaxy ?? 0) > 0 || (owned.nebula ?? 0) > 0
      ? { family: 'deep-sky', name: 'The Nursery Spiral', count: Math.max(owned.nebula ?? 0, owned.galaxy ?? 0), objectId: (owned.galaxy ?? 0) > 0 ? 'ember-kindling-galaxy' : 'ember-kindling-nebula', x: 72, y: 25, size: 5.8, depth: 'deep' }
      : null,
    (owned.web ?? 0) > 0 || (owned.supercluster ?? 0) > 0
      ? { family: 'cosmic-topology', name: 'The Web', count: Math.max(owned.supercluster ?? 0, owned.web ?? 0), objectId: (owned.web ?? 0) > 0 ? 'ember-kindling-web' : 'ember-kindling-supercluster', x: 32, y: 15, size: 5.3, depth: 'deep' }
      : null,
    (owned.loom ?? 0) > 0
      ? { family: 'answer', name: 'The Deep Loom', count: owned.loom ?? 0, objectId: 'ember-kindling-loom', x: 6, y: 57, size: 6.4, depth: 'horizon' }
      : null,
  ].filter((landmark) => landmark !== null))

  onMount(() => {
    const blink = () => (secondBlink += 1)
    const keyBlink = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') blink()
    }
    window.addEventListener('pointerdown', blink, { capture: true })
    window.addEventListener('keydown', keyBlink, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', blink, { capture: true })
      window.removeEventListener('keydown', keyBlink, { capture: true })
    }
  })

  function settlementStage(index: number, total: number) {
    if ((owned.forge ?? 0) > 0 && index === total - 1) return forgeStage
    if ((owned.kiln ?? 0) > 0 && index > 0 && index % 2 === 1) return kilnStage
    return hearthStage
  }

  function seatStyle(seat: FlagshipSeat): string {
    return `--x:${seat.x}%;--y:${seat.y}%;--scale:${seat.scale};--tilt:${seat.tilt}deg`
  }
</script>

<div
  class="flagship-layer"
  class:motion-paused={reducedMotion}
  data-phase-two="flagship-complete"
  data-hearth-threshold={scene.hearthThreshold ?? 0}
  data-sun-threshold={scene.sunThreshold ?? 0}
  data-constellation-count={scene.constellationFigures.length}
  aria-hidden="true"
>
  <div class="lifecycle-landmarks">
    {#each lifecycleLandmarks as landmark (landmark.family)}
      {@const landmarkStage = emberlightSetPieceStage(landmark.objectId)!}
      {@const landmarkThreshold = emberlightOwnershipThreshold(landmark.count)!}
      <figure
        class="lifecycle-landmark"
        class:organized={landmarkThreshold >= 10}
        class:neighboring={landmarkThreshold >= 25}
        class:topology={landmarkThreshold >= 50}
        class:infrastructure={landmarkThreshold >= 100}
        data-lifecycle-family={landmark.family}
        data-depth={landmark.depth}
        data-ownership-threshold={landmarkThreshold}
        style={`--x:${landmark.x}%;--y:${landmark.y}%;--size:${landmark.size}rem`}
      >
        {#if landmarkThreshold >= 10 && landmarkThreshold < 100}
          <span class="structure-echoes"><i></i><i></i><i></i></span>
        {/if}
        {#if landmarkThreshold >= 25}<span class="neighbor-link"></span>{/if}
        <SetPieceArt stage={landmarkStage} animate={!reducedMotion} />
        {#if landmarkThreshold >= 100}<figcaption>{landmark.name}</figcaption>{/if}
      </figure>
    {/each}
  </div>

  {#if (owned.ember2 ?? 0) > 0}
    {#key secondBlink}
      <div class="second-ember" data-stage="answering-blink" aria-hidden="true"><i></i></div>
    {/key}
  {/if}

  {#if scene.constellationFigures.length > 0}
    <div
      class="drawn-sky"
      class:atlas={scene.constellationAtlas}
      class:navigable={(owned.constellation ?? 0) >= 50}
      class:star-map={(owned.constellation ?? 0) >= 100}
      data-lifecycle-family="stellar-relations"
      data-ownership-threshold={emberlightOwnershipThreshold(owned.constellation ?? 0) ?? 0}
    >
      {#each scene.constellationFigures as figure, index (figure.id)}
        <svg
          class="constellation-figure"
          viewBox="0 0 100 100"
          style={`--x:${figure.x}%;--y:${figure.y}%;--width:${figure.width}%;--rotation:${figure.rotation}deg;--draw-delay:${index * 90}ms`}
          data-figure-id={figure.id}
          data-figure-name={figure.name}
        >
          <path d={figure.path} pathLength="1"></path>
          {#each figure.nodes as node}
            <circle cx={node[0]} cy={node[1]} r="2"></circle>
          {/each}
        </svg>
      {/each}
      {#if (owned.constellation ?? 0) >= 100}<strong class="landmark-name">The Living Star Map</strong>{/if}
    </div>
  {/if}

  {#if scene.sunSeats.length > 0}
    <div class="ecliptic" class:visible-band={scene.eclipticVisible} class:landmark={scene.eclipticLandmark} data-lifecycle-family="stellar-birth" data-ownership-threshold={scene.sunThreshold ?? 0}>
      {#each scene.sunSeats as seat, index (`${seat.x}-${seat.y}`)}
        <div class="sun-seat" style={seatStyle(seat)} data-seat={index + 1}>
          <i class="coronal-loop loop-a"></i>
          <i class="coronal-loop loop-b"></i>
          <span class="sun-disk"></span>
        </div>
      {/each}
      {#if (owned.binary ?? 0) > 0}<span class="binary-companion"><i></i><i></i><b></b></span>{/if}
      {#if scene.eclipticLandmark}<strong class="landmark-name">The Ecliptic</strong>{/if}
    </div>
  {/if}

  {#if scene.hearthSeats.length > 0}
    <div
      class="settlement"
      class:merged-light={scene.mergedHearthLight}
      class:lower-sky-glow={scene.settlementGlow}
      class:terraces={scene.terraces}
      data-lifecycle-family="kept-fire"
      data-ownership-threshold={scene.hearthThreshold ?? 0}
    >
      <div class="settlement-light"></div>
      {#if scene.terraces}<div class="terrace-foundation"></div>{/if}
      {#each scene.hearthSeats as seat, index (`${seat.x}-${seat.y}`)}
        <figure class="settlement-seat" style={seatStyle(seat)}>
          <SetPieceArt
            stage={settlementStage(index, scene.hearthSeats.length)}
            animate={!reducedMotion}
          />
        </figure>
      {/each}
      {#if scene.terraces}<strong class="landmark-name">The Terraces</strong>{/if}
    </div>
  {/if}
</div>

<style>
  .flagship-layer { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
  .lifecycle-landmarks { position: absolute; inset: 0; }
  .lifecycle-landmark {
    position: absolute;
    left: var(--x); top: var(--y); width: var(--size); height: var(--size); margin: 0;
    transform: translate(-50%, -100%);
    filter: drop-shadow(0 0 0.7rem color-mix(in srgb, #ffad52 28%, transparent));
  }
  .lifecycle-landmark[data-depth='deep'] { z-index: 0; opacity: 0.68; }
  .lifecycle-landmark[data-depth='horizon'] { z-index: 2; opacity: 0.82; }
  .lifecycle-landmark[data-depth='ground'] { z-index: 4; }
  .structure-echoes,
  .neighbor-link { position: absolute; inset: 0; pointer-events: none; }
  .structure-echoes i { position: absolute; width: 0.28rem; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, #ffcf7a 52%, #6c3c36); }
  .structure-echoes i:nth-child(1) { left: -12%; top: 58%; }
  .structure-echoes i:nth-child(2) { right: -16%; top: 42%; }
  .structure-echoes i:nth-child(3) { left: 44%; top: -9%; }
  .neighbor-link { inset: -18%; border-bottom: 1px solid color-mix(in srgb, #ffb454 24%, transparent); border-radius: 50%; }
  .lifecycle-landmark.topology { filter: drop-shadow(0 0 1rem color-mix(in srgb, #ffad52 36%, transparent)); }
  .lifecycle-landmark.infrastructure { filter: drop-shadow(0 0 1.2rem color-mix(in srgb, #ffd98a 28%, transparent)); }
  .lifecycle-landmark figcaption,
  .landmark-name { position: absolute; left: 50%; top: calc(100% + 0.22rem); transform: translateX(-50%); padding: 0.16rem 0.42rem; color: rgba(239, 230, 216, 0.5); background: radial-gradient(ellipse, rgba(5, 4, 11, 0.68), transparent 76%); font-size: 0.5rem; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }
  .lifecycle-landmark[data-lifecycle-family='industry-signal']::after { content: ''; position: absolute; left: 50%; top: 22%; width: 14rem; height: 1px; transform-origin: left center; background: linear-gradient(90deg, rgba(255, 225, 166, 0.58), transparent); animation: beacon-sweep 12s linear infinite; }
  .second-ember { position: absolute; right: 25%; top: 7%; z-index: 4; width: 1.4rem; aspect-ratio: 1; display: grid; place-items: center; }
  .second-ember i { width: 0.22rem; aspect-ratio: 1; border-radius: 50%; background: #fff6e8; box-shadow: 0 0 0.7rem #ffb454; animation: answering-blink 90ms steps(1, end) both; }
  .drawn-sky { position: absolute; inset: 0; z-index: 1; opacity: 0.72; }
  .drawn-sky.atlas::before {
    content: '';
    position: absolute;
    left: 9%; right: 15%; top: 13%; height: 48%;
    background: radial-gradient(ellipse, color-mix(in srgb, #70cfff 5%, transparent), transparent 68%);
  }
  .drawn-sky.navigable { filter: drop-shadow(0 0 0.6rem rgba(90, 185, 230, 0.12)); }
  .drawn-sky.star-map::after { content: ''; position: absolute; left: 29%; top: 21%; width: 36%; height: 35%; border: 1px solid rgba(145, 218, 245, 0.08); clip-path: polygon(0 48%, 22% 0, 53% 22%, 76% 4%, 100% 56%, 68% 100%, 32% 78%); }
  .drawn-sky .landmark-name { left: 46%; top: 58%; }
  .constellation-figure {
    position: absolute;
    left: var(--x); top: var(--y); width: var(--width); aspect-ratio: 1.45;
    transform: rotate(var(--rotation)); overflow: visible;
    filter: drop-shadow(0 0 4px color-mix(in srgb, #79d9ff 20%, transparent));
  }
  .constellation-figure path {
    fill: none;
    stroke: color-mix(in srgb, #bfeaff 42%, transparent);
    stroke-width: 1;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    animation: draw-figure 2s ease-out both;
    animation-delay: var(--draw-delay);
  }
  .constellation-figure circle {
    fill: color-mix(in srgb, white 86%, #7fdcff);
    filter: drop-shadow(0 0 4px #7fdcff);
    transform-box: fill-box;
    transform-origin: center;
    animation: kindle-joint 520ms steps(3, end) both;
    animation-delay: var(--draw-delay);
  }

  .ecliptic { position: absolute; inset: 0; z-index: 2; }
  .ecliptic.visible-band::before {
    content: '';
    position: absolute;
    left: 13%; right: 14%; top: 22%; height: 27%;
    border-top: 9px solid color-mix(in srgb, #f6c96f 5%, transparent);
    border-radius: 50%;
    transform: rotate(1deg);
    filter: blur(5px);
  }
  .ecliptic.landmark::before {
    border-top-width: 14px;
    border-top-color: color-mix(in srgb, #f6c96f 9%, transparent);
  }
  .sun-seat {
    position: absolute;
    left: var(--x); top: var(--y);
    width: calc(2.35rem * var(--scale)); aspect-ratio: 1;
    transform: translate(-50%, -50%) rotate(var(--tilt));
    filter: drop-shadow(0 0 0.75rem color-mix(in srgb, #ffad43 46%, transparent));
  }
  .sun-disk {
    position: absolute; inset: 15%; z-index: 2; border-radius: 50%;
    background:
      radial-gradient(circle at 43% 38%, #fffbe0 0 12%, #ffd26d 37%, #d7782f 75%, #6f2d25 100%);
    box-shadow:
      0 0 0 1px color-mix(in srgb, #ffd98a 52%, transparent),
      0 0 0 3px color-mix(in srgb, #ffae4b 11%, transparent),
      0 0 1rem color-mix(in srgb, #ff9b3e 48%, transparent);
  }
  .coronal-loop {
    position: absolute; z-index: 1; border: 1px solid color-mix(in srgb, #ffd676 58%, transparent);
    border-left-color: transparent; border-bottom-color: transparent; border-radius: 50%;
    animation: corona-sway 8s ease-in-out infinite alternate;
  }
  .loop-a { inset: 1% 28% 44% 2%; transform: rotate(-24deg); }
  .loop-b { inset: 38% 0 4% 35%; transform: rotate(27deg); animation-delay: -3.5s; }
  .binary-companion { position: absolute; left: 68%; top: 37%; width: 4.6rem; height: 3rem; animation: binary-waltz 20s linear infinite; }
  .binary-companion i { position: absolute; top: 50%; border-radius: 50%; transform: translateY(-50%); }
  .binary-companion i:first-child { left: 8%; width: 1.45rem; aspect-ratio: 1; background: #ffd889; box-shadow: 0 0 0.7rem rgba(255, 173, 82, 0.5); }
  .binary-companion i:nth-child(2) { right: 10%; width: 0.85rem; aspect-ratio: 1; background: #d7efff; box-shadow: 0 0 0.6rem rgba(110, 203, 255, 0.45); }
  .binary-companion b { position: absolute; left: 28%; right: 26%; top: 50%; height: 1px; background: linear-gradient(90deg, #ffd889, #d7efff); opacity: 0.48; }
  .ecliptic .landmark-name { left: 50%; top: 44%; }

  .settlement { position: absolute; inset: 0; z-index: 4; }
  .settlement-light {
    position: absolute; left: 14%; top: 65%; width: 37%; height: 22%;
    background: radial-gradient(ellipse at 50% 48%, color-mix(in srgb, #f99b43 11%, transparent), transparent 68%);
    opacity: 0.48;
  }
  .settlement.merged-light .settlement-light {
    opacity: 1;
    background:
      radial-gradient(ellipse at 48% 48%, color-mix(in srgb, #ffb455 17%, transparent), transparent 67%),
      linear-gradient(102deg, transparent 8%, color-mix(in srgb, #d87b3b 8%, transparent) 28% 74%, transparent 92%);
  }
  .settlement.lower-sky-glow::before {
    content: '';
    position: absolute; left: -4%; right: 42%; bottom: 0; height: 42%;
    background: linear-gradient(0deg, color-mix(in srgb, #9c4b34 11%, transparent), transparent 78%);
  }
  .settlement-seat {
    position: absolute; left: var(--x); top: var(--y); z-index: 2;
    width: calc(4.2rem * var(--scale)); height: calc(4.2rem * var(--scale)); margin: 0;
    transform: translate(-50%, -100%) rotate(var(--tilt));
    filter: drop-shadow(0 0 0.6rem color-mix(in srgb, #ff9b48 22%, transparent));
  }
  .terrace-foundation {
    position: absolute; left: 15%; top: 66%; width: 35%; height: 14%;
    background: linear-gradient(165deg, transparent 7%, #2c2027 8% 24%, transparent 25% 31%, #37242a 32% 51%, transparent 52% 58%, #44282b 59% 80%, transparent 81%);
    clip-path: polygon(4% 100%, 13% 54%, 31% 54%, 37% 28%, 61% 28%, 67% 6%, 88% 6%, 100% 100%);
    opacity: 0.92;
  }
  .settlement .landmark-name { left: 32%; top: 80%; }

  .motion-paused,
  .motion-paused * { animation-play-state: paused !important; }
  @keyframes draw-figure { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes kindle-joint { from { transform: scale(0); } to { transform: scale(1); } }
  @keyframes corona-sway { to { transform: rotate(8deg) scale(1.08, 0.92); } }
  @keyframes beacon-sweep { to { transform: rotate(-26deg); } }
  @keyframes answering-blink { 0%, 48% { transform: scale(1); } 49%, 100% { transform: scale(2.7); background: white; } }
  @keyframes binary-waltz { to { transform: rotate(360deg); } }

  :global(html[data-visual-quality='low']) .constellation-figure:nth-child(n + 7) { display: none; }
  @media (max-width: 760px) {
    .settlement-seat { width: calc(3rem * var(--scale)); height: calc(3rem * var(--scale)); }
    .sun-seat { width: calc(1.7rem * var(--scale)); }
    .constellation-figure { opacity: 0.7; }
  }
  @media (prefers-reduced-motion: reduce) {
    .flagship-layer,
    .flagship-layer * { animation: none !important; }
  }
</style>
