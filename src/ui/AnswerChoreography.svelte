<script lang="ts">
  import type { RealmAnswerId } from '../content/endings'
  import {
    ANSWER_CHOREOGRAPHIES,
    type AnswerChoreographyPhase,
    type AnswerVectorRole,
  } from '../render/answer-choreography'

  let {
    answerId,
    phase = 'preview',
    decorative = true,
    quality = 'full',
  }: {
    answerId: RealmAnswerId
    phase?: AnswerChoreographyPhase
    decorative?: boolean
    quality?: 'low' | 'full'
  } = $props()

  const spec = $derived(ANSWER_CHOREOGRAPHIES[answerId])
  const roles: readonly AnswerVectorRole[] = ['frame', 'secondary', 'primary', 'accent']
  const timing = $derived(
    `--answer-draw:${spec.motion.drawMs}ms;--answer-arrive:${Math.round(spec.motion.drawMs * 0.62)}ms;--answer-loop:${spec.motion.loopMs}ms;--answer-stagger:${spec.motion.staggerMs}ms`,
  )
</script>

<span
  class="answer-choreography {phase}"
  class:low-quality={quality === 'low'}
  data-answer-art={answerId}
  data-motif={spec.motif}
  data-composition={spec.composition}
  data-rhythm={spec.motion.rhythm}
  data-audio-cue={spec.audioCue}
  style={timing}
>
  <svg
    viewBox="0 0 120 72"
    preserveAspectRatio="xMidYMid meet"
    role={decorative ? undefined : 'img'}
    aria-hidden={decorative ? 'true' : undefined}
    aria-label={decorative ? undefined : spec.ariaDescription}
  >
    {#each roles as role}
      <g class="vector-group {role}-group" data-role={role}>
        {#each spec.paths.filter((entry) => entry.role === role) as entry, index (`${role}-path-${index}`)}
          <path
            class:filled={entry.filled}
            d={entry.d}
            pathLength="1"
            style={`--vector-delay:${Math.round(index * spec.motion.staggerMs * 0.25)}ms`}
          ></path>
        {/each}
        {#each spec.circles.filter((entry) => entry.role === role) as entry, index (`${role}-circle-${index}`)}
          <circle
            class:hollow={entry.hollow}
            cx={entry.cx}
            cy={entry.cy}
            r={entry.r}
            style={`--vector-delay:${Math.round(index * spec.motion.staggerMs * 0.333)}ms`}
          ></circle>
        {/each}
      </g>
    {/each}
  </svg>
</span>

<style>
  .answer-choreography {
    position: relative;
    isolation: isolate;
    display: block;
    width: 100%;
    color: hsl(var(--realm-hue), 82%, 76%);
    contain: layout paint;
  }
  .answer-choreography::before {
    content: '';
    position: absolute;
    inset: 16% 13%;
    z-index: -1;
    opacity: 0.3;
    background: radial-gradient(ellipse, hsla(var(--realm-hue), 78%, 58%, 0.2), transparent 68%);
    filter: blur(8px);
  }
  .preview { height: 5.35rem; margin: 0.35rem 0 0.2rem; }
  .resolve { width: min(26rem, 76vw); height: 8.4rem; margin: 0 auto; }
  svg { width: 100%; height: 100%; display: block; overflow: visible; }
  path,
  circle,
  .vector-group {
    vector-effect: non-scaling-stroke;
    transform-box: fill-box;
    transform-origin: center;
  }
  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.55;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  circle { fill: currentColor; stroke: currentColor; stroke-width: 1.35; }
  .hollow { fill: rgba(3, 4, 10, 0.92); }
  path.filled { fill: color-mix(in srgb, currentColor 48%, transparent); }
  .frame-group { opacity: 0.38; }
  .frame-group path { stroke-width: 1.1; }
  .secondary-group { opacity: 0.52; }
  .secondary-group path { stroke-width: 1.05; stroke-dasharray: 0.28 0.08; }
  .primary-group { opacity: 0.92; }
  .primary-group path { stroke-width: 1.85; }
  .accent-group {
    color: color-mix(in srgb, hsl(var(--realm-hue), 90%, 74%) 74%, white);
    filter: drop-shadow(0 0 4px hsla(var(--realm-hue), 92%, 66%, 0.48));
  }
  .accent-group path { stroke-width: 2.15; }

  .resolve path {
    stroke-dasharray: 1;
    animation: vector-draw var(--answer-draw) cubic-bezier(0.22, 0.75, 0.25, 1) both;
    animation-delay: var(--vector-delay);
  }
  .resolve circle {
    animation: vector-arrive var(--answer-arrive) cubic-bezier(0.16, 0.8, 0.25, 1.2) both;
    animation-delay: var(--vector-delay);
  }
  @keyframes vector-draw { from { stroke-dashoffset: 1; opacity: 0.08; } to { stroke-dashoffset: 0; opacity: 1; } }
  @keyframes vector-arrive { from { opacity: 0; transform: scale(0.15); } to { opacity: 1; transform: scale(1); } }

  [data-rhythm='seal-and-breathe'] .accent-group { animation: seal-breathe var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='three-beat-flare'] .accent-group { animation: three-flare var(--answer-loop) ease-out infinite; }
  [data-rhythm='relay-and-depart'] .accent-group { animation: relay-depart var(--answer-loop) cubic-bezier(.3,.7,.3,1) infinite; }
  [data-rhythm='measured-lift'] .accent-group { animation: measured-lift var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='continuous-undertow'] .accent-group { animation: undertow var(--answer-loop) linear infinite; }
  [data-rhythm='asynchronous-fleet'] .accent-group { animation: fleet-drift var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='name-cut-settle'] .accent-group { animation: named-cut var(--answer-loop) cubic-bezier(.65,0,.2,1) infinite; }
  [data-rhythm='gust-open-rest'] .primary-group { animation: canopy-open var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='counterpulse-join'] .accent-group { animation: graft-join var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='scan-appeal-pause'] .accent-group { animation: warning-scan var(--answer-loop) steps(7, end) infinite; }
  [data-rhythm='snap-scatter-silence'] .accent-group { animation: schedule-snap var(--answer-loop) cubic-bezier(.8,0,.2,1) infinite; }
  [data-rhythm='tick-long-dwell'] .accent-group { animation: private-hour var(--answer-loop) steps(4, end) infinite; }
  [data-rhythm='write-stop-listen'] .accent-group { animation: open-margin var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='loosen-lift-depart'] .accent-group { animation: folio-release var(--answer-loop) cubic-bezier(.2,.7,.2,1) infinite; }
  [data-rhythm='staggered-counterwrite'] .accent-group { animation: many-hands var(--answer-loop) steps(5, end) infinite; }
  [data-rhythm='steady-shell-inner-ebb'] .accent-group { animation: shelter-ebb var(--answer-loop) ease-in-out infinite; }
  [data-rhythm='exchange-and-return'] .accent-group { animation: promise-exchange var(--answer-loop) cubic-bezier(.45,0,.55,1) infinite; }
  [data-rhythm='emerge-pause-name'] .accent-group { animation: returned-name var(--answer-loop) cubic-bezier(.2,.7,.3,1) infinite; }
  [data-rhythm='seven-step-descent'] .accent-group { animation: seed-descent var(--answer-loop) steps(7, end) infinite; }
  [data-rhythm='widen-fade-stillness'] .primary-group { animation: aperture-release var(--answer-loop) ease-out infinite; }
  [data-rhythm='trace-cross-open-hold'] .accent-group { animation: open-path var(--answer-loop) steps(5, end) infinite; }

  @keyframes seal-breathe { 0%, 18%, 100% { transform: scale(1); opacity:.78; } 36% { transform: scale(.88); opacity:1; } 58% { transform: scale(.94); opacity:.86; } }
  @keyframes three-flare { 0%, 8%, 16%, 24%, 100% { transform: scale(.78); opacity:.58; } 4%, 12%, 20% { transform: scale(1.14); opacity:1; } 40% { transform: scale(1); opacity:.72; } }
  @keyframes relay-depart { 0%, 12% { transform: translateX(-3px); opacity:.58; } 34% { transform: translateX(0); opacity:1; } 66% { transform: translateX(4px); opacity:.84; } 100% { transform: translateX(7px); opacity:.45; } }
  @keyframes measured-lift { 0%, 16%, 100% { transform: translateY(3px); opacity:.56; } 45%, 72% { transform: translateY(-4px); opacity:1; } }
  @keyframes undertow { 0% { transform: translateX(-4px) skewX(-3deg); } 50% { transform: translateX(5px) skewX(3deg); } 100% { transform: translateX(-4px) skewX(-3deg); } }
  @keyframes fleet-drift { 0%, 100% { transform: translate(-3px,2px) rotate(-1deg); } 27% { transform: translate(2px,-2px) rotate(1deg); } 61% { transform: translate(5px,1px) rotate(-.5deg); } }
  @keyframes named-cut { 0%, 42% { transform: rotate(0); opacity:.7; } 47% { transform: rotate(-9deg) translateY(1px); opacity:1; } 58%, 82% { transform: rotate(-4deg) translateY(4px); opacity:.82; } 100% { transform: rotate(0); opacity:.7; } }
  @keyframes canopy-open { 0%, 12%, 100% { transform: scaleX(.92); } 38%, 72% { transform: scaleX(1.06); } }
  @keyframes graft-join { 0%, 100% { transform: scaleX(.76); opacity:.56; } 28% { transform: scaleX(1.08); opacity:1; } 43% { transform: scaleX(.92); } 64% { transform: scaleX(1); opacity:.88; } }
  @keyframes warning-scan { 0%, 12% { transform: rotate(-14deg); opacity:.5; } 46% { transform: rotate(8deg); opacity:1; } 62%, 91% { transform: rotate(0); opacity:.84; } 100% { transform: rotate(-14deg); opacity:.5; } }
  @keyframes schedule-snap { 0%, 20%, 100% { transform: rotate(0) scale(1); } 23% { transform: rotate(9deg) scale(1.13); } 26% { transform: rotate(-7deg) scale(.91); } 31%, 63% { transform: rotate(3deg) scale(1); opacity:.84; } }
  @keyframes private-hour { 0%, 10% { transform: rotate(0); opacity:.58; } 18% { transform: rotate(2deg); opacity:1; } 24%, 86% { transform: rotate(2deg); opacity:.82; } 100% { transform: rotate(0); } }
  @keyframes open-margin { 0%, 26% { transform: translateX(-5px); opacity:.42; } 48% { transform: translateX(0); opacity:1; } 55%, 91% { transform: translateX(0); opacity:.82; } 100% { opacity:.42; } }
  @keyframes folio-release { 0%, 13% { transform: translate(-4px,4px) rotate(-3deg); opacity:.48; } 48% { transform: translate(2px,-5px) rotate(2deg); opacity:1; } 78%, 100% { transform: translate(6px,-9px) rotate(4deg); opacity:.35; } }
  @keyframes many-hands { 0%, 100% { transform: rotate(-2deg) scale(.92); opacity:.58; } 20% { transform: rotate(1deg) scale(1); } 40% { transform: rotate(-1deg) scale(1.06); } 60% { transform: rotate(2deg) scale(.97); opacity:1; } 80% { transform: rotate(0) scale(1.03); } }
  @keyframes shelter-ebb { 0%, 100% { transform: translateX(-3px) scaleX(.94); opacity:.7; } 36% { transform: translateX(3px) scaleX(1.07); opacity:1; } 68% { transform: translateX(-1px) scaleX(.99); } }
  @keyframes promise-exchange { 0%, 100% { transform: translateX(-6px) rotate(-3deg); opacity:.55; } 50% { transform: translateX(6px) rotate(3deg); opacity:1; } }
  @keyframes returned-name { 0%, 18% { transform: translateY(5px) scale(.7); opacity:.4; } 45% { transform: translateY(0) scale(1); opacity:.84; } 58%, 84% { transform: translateY(-2px) scale(1.08); opacity:1; } 100% { transform: translateY(5px) scale(.7); opacity:.4; } }
  @keyframes seed-descent { 0% { transform: translate(-3px,-6px); opacity:.45; } 28% { transform: translate(2px,-2px); } 56% { transform: translate(-2px,3px); opacity:1; } 82%, 100% { transform: translate(1px,7px); opacity:.65; } }
  @keyframes aperture-release { 0%, 18% { transform: scale(.82) rotate(-3deg); opacity:1; } 62% { transform: scale(1.12) rotate(3deg); opacity:.34; } 78%, 100% { transform: scale(1.18) rotate(4deg); opacity:.12; } }
  @keyframes open-path { 0%, 12% { opacity:.35; transform: translateY(4px); } 34% { opacity:.65; transform: translateY(2px); } 56% { opacity:1; transform: translateY(0); } 68%, 94% { opacity:.82; transform: translateY(-2px); } 100% { opacity:.35; transform: translateY(4px); } }

  .low-quality .secondary-group,
  :global(html[data-visual-quality='low']) .secondary-group { display: none; }
  .low-quality::before,
  :global(html[data-visual-quality='low']) .answer-choreography::before { filter: none; opacity: .15; }
  .low-quality .accent-group,
  :global(html[data-visual-quality='low']) .accent-group { filter: none; }

  :global(html[data-motion='reduced']) .answer-choreography *,
  :global(html[data-motion='reduced']) .answer-choreography *::before { animation: none !important; transition: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .answer-choreography *,
    .answer-choreography *::before { animation: none !important; transition: none !important; }
  }
</style>
