<script lang="ts">
  import { onMount } from 'svelte'
  import {
    buildClockworkFlagshipScene,
    formatClockworkScheduleDuration,
  } from '../render/clockwork/flagship-scene'

  let {
    owned,
    reducedMotion = false,
  }: {
    owned: Readonly<Record<string, number>>
    reducedMotion?: boolean
  } = $props()

  let now = $state(Date.now())
  const scene = $derived(buildClockworkFlagshipScene(owned, now))

  onMount(() => {
    const timer = window.setInterval(() => (now = Date.now()), 1_000)
    return () => window.clearInterval(timer)
  })
</script>

<div
  class="clockwork-flagship"
  class:motion-paused={reducedMotion}
  data-phase-five="clockwork-first-slice"
  data-machine-count={scene.machines.length}
  data-route-count={scene.routes.length}
>
  <div class="machine-world" aria-hidden="true">
    <div class="machine-sky"></div>
    <svg class="escapement-tower" viewBox="0 0 240 560" preserveAspectRatio="none">
      <path class="tower-rail" d="M57 548 L83 104 L157 104 L183 548 M75 426 L165 426 M70 341 L170 341 M66 256 L174 256 M61 171 L179 171"></path>
      <path class="tower-crown" d="M44 108 L72 72 L168 72 L196 108 L174 132 L66 132 Z"></path>
      <path class="escape-wheel" d="M120 63 L127 83 L144 71 L141 93 L163 91 L148 107 L168 116 L146 122 L158 140 L137 133 L136 155 L123 137 L110 155 L109 133 L88 140 L100 122 L78 116 L98 107 L83 91 L105 93 L102 71 L119 83 Z"></path>
      <path class="anchor-pallet" d="M82 91 L110 112 L130 112 L158 91 L145 123 L129 132 L129 173 L111 173 L111 132 L95 123 Z"></path>
      <path class="pendulum" d="M120 171 L120 472 M120 472 L99 505 L120 538 L141 505 Z"></path>
      <path class="tower-index" d="M83 104 L83 548 M157 104 L157 548"></path>
    </svg>

    <div class="machine-floor">
      <span class="floor-rail rail-one"></span>
      <span class="floor-rail rail-two"></span>
      <span class="floor-rail rail-three"></span>
    </div>

    <svg class="physical-linkages" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <marker id="clockwork-power-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="3.5" markerHeight="3.5" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z"></path>
        </marker>
        <marker id="clockwork-cadence-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="3.5" markerHeight="3.5" orient="auto">
          <path d="M0 1 L7 4 L0 7 L2 4 Z"></path>
        </marker>
        <marker id="clockwork-efficiency-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="3.5" markerHeight="3.5" orient="auto">
          <path d="M0 0 L7 0 L7 8 L0 8 L3 4 Z"></path>
        </marker>
      </defs>
      {#each scene.routes as route, index (route.id)}
        <path
          class="linkage-base"
          data-route-id={route.id}
          data-route-kind={route.kind}
          d={route.path}
        ></path>
        <path
          class="linkage-torque"
          data-route-id={route.id}
          data-route-kind={route.kind}
          d={route.path}
          pathLength="1"
          marker-end={`url(#clockwork-${route.kind}-arrow)`}
          style={`--route-delay:${index * -83}ms`}
        ></path>
      {/each}
    </svg>

    <div class="machine-addresses">
      {#each scene.machines as machine (machine.id)}
        <figure
          class="machine-node"
          class:district={machine.count >= 10}
          class:networked={machine.count >= 25}
          class:regulated={machine.count >= 50}
          class:standard={machine.count >= 100}
          data-kindling-id={machine.id}
          data-machine={machine.machine}
          data-ownership-threshold={machine.count >= 100 ? 100 : machine.count >= 50 ? 50 : machine.count >= 25 ? 25 : machine.count >= 10 ? 10 : 1}
          style={`--x:${machine.x}%;--y:${machine.y}%;--machine-scale:${machine.scale}`}
        >
          {#if machine.count >= 25}<span class="input-socket"></span>{/if}
          <span class="machine-body"><i class="drive"></i><b class="output"></b></span>
          {#if machine.count >= 10}<span class="foundation"><i></i><i></i></span>{/if}
          {#if machine.count >= 50}<span class="load-gauge"><i></i></span>{/if}
          {#if machine.count >= 100}<figcaption>{machine.name}</figcaption>{/if}
        </figure>
      {/each}
    </div>
  </div>

  <section class="schedule-card" aria-label="Printed Maintenance Signal schedule">
    <header>
      <span>Form U4 · Shift 01</span>
      <strong>Maintenance Schedule</strong>
      <small>Filed before arrival</small>
    </header>
    <ol>
      {#each scene.schedule as row, index (row.id)}
        <li class:active={row.status === 'active'} class:warning={row.warningVisible} data-signal-id={row.id}>
          <span class="sequence">{String(index + 1).padStart(2, '0')}</span>
          <b aria-hidden="true">{row.glyph}</b>
          <span class="signal-name">{row.name}</span>
          <time>{row.status === 'active' ? 'OPEN' : `T−${formatClockworkScheduleDuration(row.remainingMs)}`}</time>
          <small>{row.nonColorShape}</small>
        </li>
      {/each}
    </ol>
    <footer>
      <span><i class="power-key"></i> power</span>
      <span><i class="cadence-key"></i> cadence</span>
      <span><i class="efficiency-key"></i> efficiency</span>
    </footer>
  </section>
</div>

<style>
  .clockwork-flagship {
    position: absolute; inset: 0; z-index: 2; overflow: hidden; pointer-events: none;
    color: #332611;
  }
  .machine-world,
  .machine-sky,
  .machine-addresses { position: absolute; inset: 0; }
  .machine-world { overflow: hidden; }
  .machine-sky {
    background:
      linear-gradient(180deg, rgba(20, 23, 27, 0.18), transparent 48%),
      repeating-linear-gradient(90deg, transparent 0 8.25%, rgba(222, 181, 97, 0.022) 8.3% 8.38%);
  }
  .machine-sky::after {
    content: ''; position: absolute; left: 19%; right: 18%; top: 17%; height: 38%;
    background: linear-gradient(180deg, rgba(206, 166, 83, 0.045), transparent);
    clip-path: polygon(7% 100%, 13% 42%, 24% 42%, 28% 68%, 36% 68%, 42% 18%, 50% 18%, 56% 55%, 64% 55%, 70% 34%, 78% 34%, 86% 100%);
  }
  .escapement-tower {
    position: absolute; z-index: 1; left: 50%; bottom: 16%; width: 15rem; height: 64%;
    transform: translateX(-50%); overflow: visible; opacity: 0.42;
    filter: drop-shadow(0 0 1rem rgba(216, 168, 78, 0.15));
  }
  .escapement-tower path { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: square; stroke-linejoin: miter; }
  .tower-rail { stroke: rgba(180, 139, 66, 0.4); stroke-width: 1.1; }
  .tower-crown { fill: rgba(12, 14, 17, 0.72); stroke: rgba(225, 185, 102, 0.45); stroke-width: 1.2; }
  .escape-wheel { fill: rgba(39, 32, 21, 0.72); stroke: rgba(236, 198, 111, 0.62); stroke-width: 1.2; transform-origin: 120px 116px; animation: tower-indexing 8s steps(15, end) infinite; }
  .anchor-pallet { stroke: rgba(177, 82, 66, 0.76); stroke-width: 3; transform-origin: 120px 121px; animation: pallet-release 1.6s steps(2, end) infinite; }
  .pendulum { stroke: rgba(222, 187, 111, 0.44); stroke-width: 1.4; transform-origin: 120px 171px; animation: pendulum-index 3.2s steps(4, end) infinite; }
  .tower-index { stroke: rgba(255, 226, 166, 0.11); stroke-width: 4; stroke-dasharray: 0.7 16; animation: tower-load 4s steps(8, end) infinite; }
  .machine-floor {
    position: absolute; z-index: 0; left: -5%; right: -5%; top: 55%; bottom: -8%;
    background:
      linear-gradient(180deg, rgba(91, 66, 30, 0.16), rgba(7, 8, 10, 0.52)),
      repeating-linear-gradient(90deg, transparent 0 8rem, rgba(225, 185, 105, 0.055) 8.05rem 8.1rem),
      repeating-linear-gradient(180deg, transparent 0 4.4rem, rgba(225, 185, 105, 0.04) 4.45rem 4.5rem);
    border-top: 1px solid rgba(235, 198, 123, 0.22);
    transform: perspective(34rem) rotateX(14deg);
    transform-origin: top center;
  }
  .floor-rail { position: absolute; left: 5%; right: 5%; height: 2px; background: linear-gradient(90deg, transparent, rgba(223, 183, 99, 0.23), transparent); }
  .rail-one { top: 28%; } .rail-two { top: 58%; } .rail-three { top: 82%; }
  .physical-linkages { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; }
  .linkage-base,
  .linkage-torque { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: square; stroke-linejoin: bevel; }
  .linkage-base { stroke: rgba(33, 27, 19, 0.92); stroke-width: 5; }
  .linkage-torque { stroke-width: 1.4; stroke-dasharray: 0.12 0.08; animation: torque-index 1.6s steps(8, end) infinite; animation-delay: var(--route-delay); }
  .linkage-torque[data-route-kind='power'] { stroke: rgba(242, 198, 105, 0.72); stroke-dasharray: 0.18 0.04; }
  .linkage-torque[data-route-kind='cadence'] { stroke: rgba(150, 197, 213, 0.68); stroke-dasharray: 0.08 0.08; }
  .linkage-torque[data-route-kind='efficiency'] { stroke: rgba(218, 165, 95, 0.65); stroke-dasharray: 0.025 0.075; }
  marker path { fill: rgba(245, 208, 128, 0.9); }
  .machine-node {
    position: absolute; z-index: 3; left: var(--x); top: var(--y); width: calc(3.4rem * var(--machine-scale)); height: calc(3rem * var(--machine-scale));
    margin: 0; transform: translate(-50%, -50%); filter: drop-shadow(0 0 0.55rem rgba(220, 169, 73, 0.2));
  }
  .machine-body {
    position: absolute; inset: 12% 9% 15%; display: grid; place-items: center;
    background: linear-gradient(145deg, rgba(147, 109, 51, 0.92), rgba(34, 29, 23, 0.96));
    border: 1px solid rgba(249, 218, 151, 0.43); clip-path: polygon(8% 0, 92% 0, 100% 18%, 100% 82%, 92% 100%, 8% 100%, 0 82%, 0 18%);
  }
  .drive { display: block; width: 1.15rem; aspect-ratio: 1; border: 2px solid rgba(255, 221, 145, 0.72); border-radius: 50%; position: relative; animation: drive-index 2.4s steps(12, end) infinite; }
  .drive::before,
  .drive::after { content: ''; position: absolute; left: 50%; top: -20%; bottom: -20%; width: 1px; background: rgba(255, 221, 145, 0.58); transform: translateX(-50%); }
  .drive::after { transform: translateX(-50%) rotate(90deg); }
  .output { position: absolute; right: -0.32rem; top: 50%; width: 0.48rem; height: 0.38rem; transform: translateY(-50%); background: #d8a84e; border: 1px solid #2a2117; }
  .input-socket { position: absolute; z-index: 2; left: -0.22rem; top: 50%; width: 0.45rem; aspect-ratio: 1; border: 1px solid #e4bd70; background: #101216; transform: translateY(-50%) rotate(45deg); }
  .foundation { position: absolute; left: 8%; right: 8%; bottom: 0; height: 18%; border-bottom: 2px solid rgba(224, 178, 88, 0.48); }
  .foundation i { position: absolute; bottom: 0; width: 0.28rem; height: 0.45rem; background: #45351f; } .foundation i:first-child { left: 12%; } .foundation i:last-child { right: 12%; }
  .load-gauge { position: absolute; left: 19%; right: 19%; top: 0; height: 0.32rem; border: 1px solid rgba(238, 205, 134, 0.4); }
  .load-gauge i { display: block; width: 72%; height: 100%; background: repeating-linear-gradient(90deg, #d8a84e 0 3px, transparent 3px 5px); }
  .machine-node[data-machine='tooth'] .drive { border-radius: 0; width: 1.45rem; height: 0.58rem; border-width: 1px; background: repeating-linear-gradient(90deg, #e0b55f 0 0.18rem, transparent 0.18rem 0.34rem); }
  .machine-node[data-machine='stop'] .drive { border-radius: 0; border: 0; width: 1.45rem; height: 1.1rem; background: linear-gradient(28deg, transparent 45%, #bc6255 46% 54%, transparent 55%), linear-gradient(-28deg, transparent 45%, #e0b55f 46% 54%, transparent 55%); }
  .machine-node[data-machine='spring'] .drive { border-radius: 0; border: 0; width: 1.5rem; height: 0.85rem; background: repeating-linear-gradient(90deg, transparent 0 0.14rem, #e0b55f 0.15rem 0.2rem); transform: skewX(-18deg); }
  .machine-node[data-machine='governor'] .drive { border: 0; border-radius: 0; background: linear-gradient(63deg, transparent 46%, #d9af59 47% 53%, transparent 54%), linear-gradient(-63deg, transparent 46%, #d9af59 47% 53%, transparent 54%); }
  .machine-node[data-machine='engine'] .drive { border-radius: 0; width: 1.4rem; height: 1rem; border-width: 1px; background: repeating-linear-gradient(0deg, rgba(225,181,91,.5) 0 1px, transparent 1px 0.24rem); }
  .machine-node figcaption {
    position: absolute; left: 50%; top: calc(100% + 0.15rem); transform: translateX(-50%); padding: 0.15rem 0.35rem; white-space: nowrap;
    color: rgba(237, 214, 169, 0.62); background: rgba(9, 10, 12, 0.72); font-size: 0.45rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .schedule-card {
    position: absolute; z-index: 5; left: 1rem; top: 4.2rem; width: 14.5rem; padding: 0.7rem 0.75rem 0.6rem;
    color: #342919; background: linear-gradient(102deg, rgba(225, 211, 176, 0.92), rgba(194, 177, 139, 0.92));
    border: 1px solid rgba(67, 49, 27, 0.72); box-shadow: 0 0.7rem 1.7rem rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.3);
    transform: rotate(-0.45deg); font-family: var(--font-interface, ui-sans-serif, system-ui);
  }
  .schedule-card::before { content: ''; position: absolute; inset: 0; opacity: 0.18; background: repeating-linear-gradient(0deg, transparent 0 0.38rem, #57462c 0.4rem 0.42rem); pointer-events: none; }
  .schedule-card header { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: end; row-gap: 0.12rem; padding-bottom: 0.4rem; border-bottom: 2px solid #4e3c24; }
  .schedule-card header span,
  .schedule-card header small { font: 700 0.43rem/1.2 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
  .schedule-card header strong { grid-column: 1 / -1; grid-row: 2; font: 760 0.78rem/1.3 var(--font-interface, ui-sans-serif, system-ui); letter-spacing: 0.08em; text-transform: uppercase; }
  .schedule-card header small { grid-column: 2; grid-row: 1; text-align: right; }
  .schedule-card ol { position: relative; display: grid; gap: 0; margin: 0.38rem 0 0; padding: 0; list-style: none; }
  .schedule-card li { display: grid; grid-template-columns: 1.25rem 1rem 1fr auto; align-items: center; min-height: 1.55rem; border-bottom: 1px solid rgba(72, 55, 31, 0.33); }
  .schedule-card li.active { background: rgba(140, 80, 52, 0.14); box-shadow: inset 0.18rem 0 #9b4e40; }
  .schedule-card li.warning:not(.active) { box-shadow: inset 0.18rem 0 #8a6b2f; }
  .sequence { font: 700 0.48rem/1 ui-monospace, monospace; }
  .schedule-card li b { font-size: 0.62rem; }
  .signal-name { font-size: 0.58rem; font-weight: 750; letter-spacing: 0.04em; text-transform: uppercase; }
  .schedule-card time { font: 750 0.54rem/1 ui-monospace, monospace; }
  .schedule-card li small { grid-column: 3 / -1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.42rem; opacity: 0.66; }
  .schedule-card footer { position: relative; display: flex; justify-content: space-between; gap: 0.35rem; padding-top: 0.45rem; font: 700 0.42rem/1 ui-monospace, monospace; text-transform: uppercase; }
  .schedule-card footer span { display: inline-flex; align-items: center; gap: 0.2rem; }
  .schedule-card footer i { display: inline-block; width: 1rem; height: 1px; background: #6f522a; }
  .schedule-card footer .cadence-key { background: repeating-linear-gradient(90deg, #315f6c 0 2px, transparent 2px 4px); }
  .schedule-card footer .efficiency-key { background: repeating-linear-gradient(90deg, #6f522a 0 1px, transparent 1px 3px); }
  @keyframes torque-index { to { stroke-dashoffset: -1; } }
  @keyframes tower-indexing { to { transform: rotate(360deg); } }
  @keyframes pallet-release { 50% { transform: rotate(7deg); } }
  @keyframes pendulum-index { 50% { transform: rotate(4deg); } }
  @keyframes tower-load { to { stroke-dashoffset: -16; } }
  @keyframes drive-index { to { transform: rotate(360deg); } }
  .motion-paused *,
  :global(html[data-motion='reduced']) .clockwork-flagship * { animation: none !important; transition: none !important; }
  @media (max-width: 760px) {
    .schedule-card { top: 11.5rem; width: 11.5rem; transform: scale(0.82) rotate(-0.45deg); transform-origin: top left; }
    .machine-node { transform: translate(-50%, -50%) scale(0.76); }
    .escapement-tower { width: 11rem; }
  }
  @media (prefers-reduced-motion: reduce) { .clockwork-flagship * { animation: none !important; transition: none !important; } }
</style>
