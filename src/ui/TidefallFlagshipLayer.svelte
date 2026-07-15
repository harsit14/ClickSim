<script lang="ts">
  import { onMount } from 'svelte'
  import { tidefallTideState } from '../content/universes/tidefall/tide-state'
  import {
    TIDEFALL_FAMILY_SEATS,
    TIDEFALL_SET_PIECES,
    tidefallOwnershipThreshold,
  } from '../render/tidefall/set-piece-registry'
  import SetPieceArt from './SetPieceArt.svelte'
  import { planTidefallMidDepth } from '../render/tidefall/mid-depth'

  let {
    owned,
    reducedMotion = false,
    leviathanActive = false,
    quality = 'high',
  }: {
    owned: Readonly<Record<string, number>>
    reducedMotion?: boolean
    leviathanActive?: boolean
    quality?: 'low' | 'balanced' | 'high'
  } = $props()

  const bubbles = [
    [7, 49, 0.45], [13, 72, 0.28], [21, 55, 0.34], [35, 66, 0.2],
    [65, 54, 0.26], [78, 46, 0.42], [84, 68, 0.24], [94, 58, 0.32],
  ] as const
  const shoals = [
    [7, 28, -7], [18, 39, 4], [70, 29, -3], [88, 43, 6],
  ] as const

  let now = $state(Date.now())
  const tide = $derived(tidefallTideState(now))
  const tideLift = $derived((tide.multiplier - 1) * 3.2)
  const families = $derived(TIDEFALL_SET_PIECES.map((piece, index) => {
    const early = piece.stages[0]
    const late = piece.stages[1]
    const earlyCount = owned[early.sourceId] ?? 0
    const lateCount = owned[late.sourceId] ?? 0
    const count = Math.max(earlyCount, lateCount)
    return {
      ...piece,
      ...TIDEFALL_FAMILY_SEATS[index],
      count,
      threshold: tidefallOwnershipThreshold(count),
      stage: lateCount > 0 ? late : early,
    }
  }).filter((family) => family.count > 0))
  const midDepthMigrations = $derived(planTidefallMidDepth(owned, quality))

  onMount(() => {
    const timer = window.setInterval(() => (now = Date.now()), 250)
    return () => window.clearInterval(timer)
  })
</script>

<div
  class="tidefall-flagship"
  class:motion-paused={reducedMotion}
  data-phase-five="tidefall-first-slice"
  data-tide-state={tide.id}
  data-tide-pattern={tide.pattern}
  data-family-count={families.length}
  style={`--tide-lift:${tideLift}vh;--tide-pressure:${tide.multiplier}`}
  aria-hidden="true"
>
  <div class="inverted-ocean">
    <div class="surface-shimmer"></div>
    <svg class="surface-line" viewBox="0 0 1200 160" preserveAspectRatio="none">
      <path class="surface-crest crest-back" d="M-30 78 C95 38 178 114 302 73 C425 32 515 111 638 70 C762 28 856 108 978 67 C1087 31 1165 75 1230 54"></path>
      <path class="surface-crest crest-front" d="M-30 104 C83 72 181 126 300 96 C428 63 519 124 642 91 C770 57 862 119 986 86 C1088 59 1176 91 1230 76"></path>
      <path class="surface-fragment" d="M78 39 C121 25 154 29 191 43 M395 33 C441 18 483 23 521 40 M720 29 C766 15 812 20 851 36 M1018 34 C1057 20 1094 23 1129 38"></path>
    </svg>
    <div class="water-column"></div>
    <div class="abyss"></div>
    <svg class="trench-horizon" viewBox="0 0 1200 260" preserveAspectRatio="none">
      <path class="trench-mass" d="M0 260 L0 116 L104 90 L205 121 L307 82 L402 112 L498 58 L594 101 L682 73 L781 121 L875 84 L971 124 L1075 77 L1200 110 L1200 260 Z"></path>
      <path class="trench-rim" d="M0 116 L104 90 L205 121 L307 82 L402 112 L498 58 L594 101 L682 73 L781 121 L875 84 L971 124 L1075 77 L1200 110"></path>
      <path class="depth-contour" d="M94 151 L208 139 L302 165 M430 142 L510 111 L603 148 M780 158 L874 125 L966 159 M1013 148 L1091 117"></path>
    </svg>
    <div class="suspended-life">
      {#each bubbles as bubble}
        <i class="bubble" style={`--x:${bubble[0]}%;--y:${bubble[1]}%;--bubble:${bubble[2]}`}></i>
      {/each}
      {#each shoals as shoal}
        <span class="shoal" style={`--x:${shoal[0]}%;--y:${shoal[1]}%;--tilt:${shoal[2]}deg`}><i></i><i></i><i></i></span>
      {/each}
    </div>
    <div class="mid-depth-migrations" data-migration-count={midDepthMigrations.length} data-motion={reducedMotion ? 'static' : 'drifting'}>
      {#each midDepthMigrations as migration (migration.id)}
        <span
          class="migration {migration.kind} form-{migration.form}"
          class:reverse={migration.direction === -1}
          class:static={reducedMotion}
          data-migration={migration.id}
          data-form={migration.form}
          style={`--migration-y:${migration.y}%;--migration-rest-x:${migration.restingX}%;--migration-duration:${migration.durationSec}s;--migration-delay:${migration.delaySec}s`}
        >
          <i class="migration-body"></i>
          {#if migration.form >= 2}<i class="migration-companion companion-one"></i>{/if}
          {#if migration.form >= 3}<i class="migration-companion companion-two"></i>{/if}
          {#if migration.form >= 4}<b class="migration-wake"></b>{/if}
          {#if migration.form >= 5}<b class="migration-crown"></b>{/if}
        </span>
      {/each}
    </div>
  </div>

  <div class="pelagic-families">
    {#each families as family (family.id)}
      <figure
        class="pelagic-family"
        class:organized={(family.threshold ?? 0) >= 10}
        class:connected={(family.threshold ?? 0) >= 25}
        class:habitat={(family.threshold ?? 0) >= 50}
        class:named={(family.threshold ?? 0) >= 100}
        data-pelagic-family={family.id}
        data-depth={family.depth}
        data-ownership-threshold={family.threshold ?? 0}
        style={`--x:${family.x}%;--y:${family.y}%;--size:${family.size}rem;--half-size:${family.size / 2}rem`}
      >
        {#if (family.threshold ?? 0) >= 50}<span class="habitat-glow"></span>{/if}
        {#if (family.threshold ?? 0) >= 25}<span class="current-link"><i></i><i></i><i></i></span>{/if}
        {#if (family.threshold ?? 0) >= 10}<span class="companion-forms"><i></i><i></i></span>{/if}
        <SetPieceArt stage={family.stage} animate={!reducedMotion} />
        {#if (family.threshold ?? 0) >= 100}<figcaption>{family.name}</figcaption>{/if}
      </figure>
    {/each}
  </div>

  {#if leviathanActive}
    <div class="leviathan-passage" data-leviathan-passage="active">
      <svg viewBox="0 0 520 150" role="img" aria-label="A leviathan crosses below the Tidefall surface">
        <path class="leviathan-body" d="M12 89 C73 35 147 27 233 48 C291 7 386 9 438 50 C466 71 488 76 513 63 C493 89 465 98 433 91 C359 136 247 132 176 98 C108 112 54 108 12 89 Z"></path>
        <path class="leviathan-tail" d="M433 52 C466 20 493 16 514 25 C495 40 488 57 513 65 C480 76 456 69 433 52 Z"></path>
        <path class="leviathan-eye" d="M91 70 C96 65 104 68 104 75 C103 82 94 84 90 78 Z"></path>
      </svg>
      <span class="wake-marks"><i>1</i><i>2</i><i>3</i></span>
    </div>
  {/if}
</div>

<style>
  .tidefall-flagship {
    --set-piece-body: color-mix(in srgb, #49d8c4 58%, #17394b);
    --set-piece-light: color-mix(in srgb, #effff8 82%, #67e7cf);
    --set-piece-shadow: #061722;
    --set-piece-void: #020b13;
    --set-piece-line: color-mix(in srgb, #a7f4e6 72%, transparent);
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
  }
  .inverted-ocean,
  .pelagic-families,
  .suspended-life,
  .mid-depth-migrations { position: absolute; inset: 0; }
  .inverted-ocean {
    background:
      linear-gradient(180deg, rgba(143, 246, 231, 0.1), transparent 19%),
      linear-gradient(180deg, rgba(7, 28, 40, 0.28) 0%, rgba(6, 21, 33, 0.32) 28%, rgba(3, 12, 21, 0.38) 66%, rgba(1, 5, 11, 0.46) 100%);
  }
  .surface-shimmer {
    position: absolute;
    left: -4%; right: -4%; top: calc(4% + var(--tide-lift));
    height: 22%;
    background:
      linear-gradient(174deg, transparent 0 38%, rgba(198, 255, 241, 0.09) 39% 40%, transparent 41% 100%),
      radial-gradient(ellipse at 50% 0%, rgba(184, 255, 240, 0.24), transparent 64%);
    filter: blur(0.2rem);
    transition: top 500ms ease;
  }
  .surface-line {
    position: absolute;
    left: -2%; top: calc(5% + var(--tide-lift));
    width: 104%; height: 19%;
    overflow: visible;
    transition: top 500ms ease;
    filter: drop-shadow(0 0 0.45rem rgba(101, 230, 207, 0.22));
  }
  .surface-line path { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; }
  .surface-crest { stroke: rgba(173, 245, 230, 0.36); stroke-width: 1.1; }
  .crest-back { stroke: rgba(100, 209, 195, 0.2); }
  .surface-fragment { stroke: rgba(225, 255, 247, 0.22); stroke-width: 0.8; }
  .water-column {
    position: absolute; inset: 18% 0 22%;
    opacity: 0.54;
    background:
      linear-gradient(90deg, transparent 5%, rgba(99, 222, 205, 0.045) 22%, transparent 24% 66%, rgba(99, 222, 205, 0.04) 68%, transparent 91%),
      repeating-linear-gradient(180deg, transparent 0 9.8rem, rgba(117, 220, 208, 0.025) 9.85rem 9.9rem);
    -webkit-mask: linear-gradient(180deg, #000, rgba(0,0,0,.6), transparent);
    mask: linear-gradient(180deg, #000, rgba(0,0,0,.6), transparent);
  }
  .abyss {
    position: absolute; left: 0; right: 0; bottom: 0; height: 48%;
    background: linear-gradient(180deg, transparent, rgba(0, 5, 12, 0.36) 46%, rgba(0, 4, 10, 0.62) 100%);
  }
  .trench-horizon {
    position: absolute; left: -2%; bottom: -4%; width: 104%; height: 40%;
    filter: drop-shadow(0 -0.5rem 1.7rem rgba(18, 102, 102, 0.08));
  }
  .trench-mass { fill: rgba(1, 5, 10, 0.72); }
  .trench-rim { fill: none; stroke: rgba(73, 193, 175, 0.18); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
  .depth-contour { fill: none; stroke: rgba(73, 193, 175, 0.08); stroke-width: 1; vector-effect: non-scaling-stroke; }
  .bubble {
    position: absolute; left: var(--x); top: var(--y);
    width: calc(0.62rem * var(--bubble)); aspect-ratio: 1; border-radius: 50%;
    border: 1px solid rgba(163, 246, 232, 0.42);
    animation: bubble-rise 11s ease-in infinite;
  }
  .shoal { position: absolute; left: var(--x); top: var(--y); width: 4.5rem; height: 1.4rem; transform: rotate(var(--tilt)); opacity: 0.42; }
  .shoal i {
    position: absolute; width: 0.9rem; height: 0.35rem;
    background: rgba(139, 235, 218, 0.68);
    clip-path: polygon(0 50%, 34% 0, 100% 50%, 34% 100%);
  }
  .shoal i:nth-child(2) { left: 1.45rem; top: 0.55rem; transform: scale(0.7); }
  .shoal i:nth-child(3) { left: 3.2rem; top: 0.12rem; transform: scale(0.48); }
  .mid-depth-migrations { z-index:2;overflow:hidden; }
  .migration { position:absolute;left:-8%;top:var(--migration-y);width:3.6rem;height:2.2rem;color:rgba(143,235,220,.48);animation:mid-depth-drift var(--migration-duration) linear var(--migration-delay) infinite;filter:drop-shadow(0 0 .3rem rgba(95,222,204,.12)); }
  .migration.reverse { left:auto;right:-8%;animation-name:mid-depth-drift-reverse;transform:scaleX(-1); }
  .migration.static { left:var(--migration-rest-x);right:auto;animation:none;transform:none; }
  .migration-body,.migration-companion { position:absolute;display:block; }
  .shoal .migration-body,.shoal .migration-companion { width:1.15rem;height:.42rem;background:currentColor;clip-path:polygon(0 50%,28% 0,78% 12%,100% 50%,78% 88%,28% 100%); }
  .lantern .migration-body,.lantern .migration-companion { width:.9rem;height:1rem;border:1px solid currentColor;border-radius:58% 58% 32% 32%;background:radial-gradient(circle at 50% 42%,rgba(215,255,245,.24),transparent 48%); }
  .lantern .migration-body::after,.lantern .migration-companion::after { content:'';position:absolute;left:18%;right:18%;top:100%;height:.72rem;border-left:1px solid currentColor;border-right:1px solid currentColor;border-radius:0 0 50% 50%; }
  .ray .migration-body,.ray .migration-companion { width:1.5rem;height:.72rem;background:currentColor;clip-path:polygon(0 50%,36% 0,82% 22%,100% 50%,82% 78%,36% 100%);border-radius:50%; }
  .driftleaf .migration-body,.driftleaf .migration-companion { width:1.28rem;height:.68rem;border:1px solid currentColor;border-radius:100% 0 100% 0;transform:rotate(14deg); }
  .migration-companion { opacity:.68;transform:scale(.72); }
  .companion-one { left:1.45rem;top:.7rem; }.companion-two { left:2.55rem;top:.08rem;opacity:.46; }
  .migration-wake { position:absolute;left:-.7rem;top:.32rem;width:.75rem;height:1.3rem;border-left:1px solid currentColor;border-radius:50%;opacity:.38; }
  .migration-crown { position:absolute;left:.24rem;top:-.38rem;width:.7rem;height:.3rem;border-top:1px solid currentColor;border-radius:50%;opacity:.5; }
  .pelagic-family {
    position: absolute; left: clamp(var(--half-size), var(--x), calc(100% - var(--half-size))); top: calc(var(--y) + var(--tide-lift));
    width: var(--size); height: var(--size); margin: 0;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 0 0.65rem rgba(69, 218, 195, 0.25));
    transition: top 500ms ease;
  }
  .pelagic-family[data-depth='surface'] { z-index: 4; }
  .pelagic-family[data-depth='middle'] { z-index: 3; opacity: 0.9; }
  .pelagic-family[data-depth='deep'] { z-index: 2; opacity: 0.76; }
  .pelagic-family[data-depth='trench'] { z-index: 1; opacity: 0.68; }
  .companion-forms,
  .current-link,
  .habitat-glow { position: absolute; inset: 0; }
  .companion-forms i { position: absolute; width: 22%; height: 22%; opacity: 0.48; }
  .companion-forms i:first-child { left: -27%; top: 54%; border-left: 2px solid rgba(127, 238, 220, 0.48); transform: skewY(-25deg); }
  .companion-forms i:last-child { right: -25%; top: 28%; border-right: 2px solid rgba(127, 238, 220, 0.4); transform: skewY(25deg); }
  .current-link { left: -35%; right: -35%; top: 74%; height: 15%; }
  .current-link i { position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(113, 232, 214, 0.34), transparent); transform: skewY(-4deg); }
  .current-link i:nth-child(2) { top: 0.38rem; opacity: 0.6; }
  .current-link i:nth-child(3) { top: 0.74rem; opacity: 0.3; }
  .habitat-glow { inset: -65%; background: radial-gradient(circle, rgba(71, 218, 196, 0.12), transparent 65%); }
  .pelagic-family.named { filter: drop-shadow(0 0 1.15rem rgba(99, 239, 215, 0.34)); }
  .pelagic-family figcaption {
    position: absolute; left: 50%; top: calc(100% + 0.35rem); transform: translateX(-50%);
    padding: 0.18rem 0.45rem; white-space: nowrap;
    color: rgba(213, 248, 240, 0.62);
    background: radial-gradient(ellipse, rgba(0, 8, 15, 0.78), transparent 76%);
    font-size: 0.48rem; font-weight: 650; letter-spacing: 0.12em; text-transform: uppercase;
  }
  .leviathan-passage {
    position: absolute; left: -38%; top: calc(17% + var(--tide-lift)); z-index: 1;
    width: min(43vw, 34rem); opacity: 0.22;
    animation: leviathan-crossing 36s linear infinite;
  }
  .leviathan-passage svg { display: block; width: 100%; overflow: visible; filter: drop-shadow(0 0.6rem 1rem rgba(73, 214, 195, 0.18)); }
  .leviathan-body,
  .leviathan-tail { fill: #00070d; stroke: rgba(157, 237, 223, 0.28); stroke-width: 1; vector-effect: non-scaling-stroke; }
  .leviathan-eye { fill: #d9fff5; }
  .wake-marks { position: absolute; left: 14%; right: 5%; top: -1.1rem; display: flex; justify-content: space-around; }
  .wake-marks i { color: rgba(191, 248, 236, 0.36); font: 600 0.44rem/1 ui-monospace, monospace; font-style: normal; border-top: 1px solid currentColor; padding-top: 0.18rem; width: 2.3rem; text-align: center; }
  @keyframes bubble-rise { from { transform: translateY(1.5rem); opacity: 0; } 18% { opacity: 0.55; } to { transform: translateY(-6rem); opacity: 0; } }
  @keyframes mid-depth-drift { from { transform:translateX(0); } to { transform:translateX(116vw); } }
  @keyframes mid-depth-drift-reverse { from { transform:scaleX(-1) translateX(0); } to { transform:scaleX(-1) translateX(116vw); } }
  @keyframes leviathan-crossing { from { transform: translateX(0); } to { transform: translateX(330%); } }
  .motion-paused *,
  :global(html[data-motion='reduced']) .tidefall-flagship * { animation: none !important; transition: none !important; }
  .motion-paused .leviathan-passage,
  :global(html[data-motion='reduced']) .leviathan-passage { left: 29%; opacity: 0.18; }
  @media (max-width: 760px) {
    .pelagic-family { width: calc(var(--size) * 0.72); height: calc(var(--size) * 0.72); }
    .pelagic-family:nth-child(even) { transform: translate(-50%, -50%) scale(0.8); }
    .trench-horizon { height: 35%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tidefall-flagship * { animation: none !important; transition: none !important; }
    .leviathan-passage { left: 29%; opacity: 0.18; }
  }
</style>
