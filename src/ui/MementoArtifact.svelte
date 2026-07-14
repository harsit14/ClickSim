<script lang="ts">
  import type { MementoDefinition } from '../content/mementos'

  let {
    memento,
    locked = false,
    large = false,
    reducedMotion = false,
  }: {
    memento: MementoDefinition
    locked?: boolean
    large?: boolean
    reducedMotion?: boolean
  } = $props()
</script>

<div
  class="artifact"
  class:locked
  class:large
  class:reduced={reducedMotion}
  style={`--artifact:${memento.accent};--artifact-soft:${memento.secondary}`}
  aria-hidden="true"
>
  <i class="aura"></i><i class="mote one"></i><i class="mote two"></i><i class="mote three"></i>
  <svg viewBox="0 0 160 160" role="presentation">
    <defs>
      <radialGradient id={`glow-${memento.id}`}>
        <stop stop-color={memento.secondary} stop-opacity=".78" />
        <stop offset=".42" stop-color={memento.accent} stop-opacity=".32" />
        <stop offset="1" stop-color={memento.accent} stop-opacity="0" />
      </radialGradient>
      <linearGradient id={`metal-${memento.id}`} x2="1" y2="1">
        <stop stop-color={memento.secondary} />
        <stop offset=".48" stop-color={memento.accent} />
        <stop offset="1" stop-color="#15131a" />
      </linearGradient>
    </defs>
    <ellipse class="field" cx="80" cy="76" rx="58" ry="55" fill={`url(#glow-${memento.id})`} />
    <g class="object" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      {#if memento.motif === 'ember'}
        <path class="solid" d="M80 25 C91 47 111 54 105 83 C101 106 88 118 80 127 C64 115 51 100 54 78 C57 59 70 54 80 25Z" />
        <path d="M80 61 C89 75 89 88 78 102 C67 91 66 79 80 61Z" />
        <path d="M56 118 Q80 128 105 117" />
      {:else if memento.motif === 'drop'}
        <path class="glass" d="M80 23 C80 23 47 68 47 91 A33 33 0 0 0 113 91 C113 68 80 23 80 23Z" />
        <path d="M61 91 Q80 108 99 91" /><circle cx="72" cy="69" r="5" />
      {:else if memento.motif === 'seed'}
        <path class="solid" d="M80 37 C111 39 119 65 101 90 C88 108 64 112 50 94 C34 74 48 44 80 37Z" />
        <path d="M80 52 C76 77 68 96 52 116 M77 78 C91 73 103 64 110 52 M66 96 C76 105 89 112 103 116" />
      {:else if memento.motif === 'gear'}
        <path class="metal" d="M68 25 H92 L96 39 L108 45 L122 40 L134 60 L123 71 V85 L134 97 L122 118 L107 113 L96 120 L92 135 H68 L64 120 L52 113 L37 118 L26 97 L37 85 V71 L26 60 L38 40 L52 45 L64 39Z" />
        <circle cx="80" cy="79" r="28" /><circle cx="80" cy="79" r="8" />
      {:else if memento.motif === 'folio'}
        <path class="paper" d="M31 43 Q57 34 78 48 V122 Q56 109 31 117Z M129 43 Q103 34 82 48 V122 Q104 109 129 117Z" />
        <path d="M80 49 V122 M43 60 Q59 56 70 63 M43 74 Q59 70 70 77 M117 60 Q101 56 90 63 M117 74 Q101 70 90 77" />
      {:else if memento.motif === 'ring'}
        <path class="metal thick" d="M113 110 A47 47 0 1 1 121 58" />
        <path d="M121 58 L107 65 M113 110 L101 99" /><circle cx="80" cy="80" r="26" stroke-dasharray="2 8" />
      {:else if memento.motif === 'archive'}
        <path class="glass" d="M31 36 H129 V122 H31Z" /><path d="M80 36 V122 M31 79 H129" />
        <circle cx="55" cy="57" r="7" /><path d="M105 48 L110 57 L105 66 L100 57Z M48 96 Q57 86 67 96 Q57 108 48 96Z M95 105 L115 88" />
      {:else if memento.motif === 'deep'}
        <circle class="dark" cx="80" cy="78" r="34" /><circle cx="80" cy="78" r="48" stroke-dasharray="1 9" />
        <path d="M27 81 Q47 60 61 70 M99 89 Q118 99 133 78" /><circle class="core" cx="80" cy="78" r="7" />
      {:else if memento.motif === 'beacon'}
        <path class="metal" d="M63 123 L69 62 H91 L97 123Z" /><path d="M55 123 H105 M66 84 H94 M80 62 V36" />
        <path class="ray" d="M80 36 L42 52 M80 36 L118 52 M80 36 L80 13" /><circle class="core" cx="80" cy="36" r="8" />
      {:else if memento.motif === 'vessel'}
        <path class="metal" d="M42 59 H118 L108 115 Q80 130 52 115Z" /><path d="M42 59 Q80 81 118 59 M80 60 V28 M80 28 Q101 37 109 52" />
        <path d="M57 91 Q80 104 103 91" />
      {:else if memento.motif === 'compass'}
        <circle class="glass" cx="80" cy="80" r="49" /><circle cx="80" cy="80" r="31" stroke-dasharray="3 7" />
        <path class="solid" d="M80 35 L91 73 L125 80 L91 88 L80 125 L71 88 L35 80 L71 73Z" /><circle cx="80" cy="80" r="6" />
      {:else if memento.motif === 'mountain'}
        <path class="metal" d="M22 121 L66 43 L83 70 L101 30 L139 121Z" /><path d="M52 68 L66 43 L76 59 M88 52 L101 30 L114 54 M76 122 Q80 96 94 78" />
        <circle class="core" cx="94" cy="78" r="5" />
      {:else if memento.motif === 'prism'}
        <path class="glass" d="M80 20 L129 54 L111 121 L49 121 L31 54Z" /><path d="M80 20 V85 M31 54 L80 85 L129 54 M49 121 L80 85 L111 121" />
        <circle class="core" cx="80" cy="85" r="6" />
      {:else if memento.motif === 'garden'}
        <path class="metal" d="M57 56 Q80 42 103 56 V91 H57Z M51 91 H109 V105 H51Z M60 105 V129 M100 105 V129" />
        <path d="M43 128 Q56 111 69 128 M91 128 Q104 111 118 128 M80 91 V56" />
        <path class="leaf" d="M43 128 Q32 111 40 99 Q54 105 43 128Z M118 128 Q129 111 121 99 Q107 105 118 128Z" />
      {:else if memento.motif === 'bookmark'}
        <path class="paper" d="M53 25 H107 V128 L80 109 L53 128Z" /><path d="M65 45 H95 M65 58 H91 M80 78 C68 84 68 98 80 103 C92 98 92 84 80 78Z" />
      {:else if memento.motif === 'shell'}
        <path class="solid" d="M33 110 Q38 39 82 34 Q128 29 132 79 Q136 124 88 126 Q44 128 33 110Z" />
        <path d="M52 105 Q47 57 82 53 Q113 50 115 80 Q117 108 88 110 Q64 111 64 89 Q64 70 83 69 Q99 69 100 83 Q100 95 88 96" />
      {:else}
        <circle class="metal" cx="60" cy="59" r="25" /><circle cx="60" cy="59" r="10" />
        <path class="metal thick" d="M77 76 L126 125 M104 103 L119 88 M114 113 L129 98" />
      {/if}
    </g>
    <ellipse class="plinth" cx="80" cy="136" rx="47" ry="7" />
    {#if locked}<text x="80" y="88" text-anchor="middle">?</text>{/if}
  </svg>
</div>

<style>
  .artifact { position: relative; isolation: isolate; width: 100%; aspect-ratio: 1; color: var(--artifact); filter: drop-shadow(0 .5rem .75rem rgba(0,0,0,.48)); }
  .artifact.large { width: min(18rem, 58vw); }
  .aura { position: absolute; z-index: -1; inset: 14%; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--artifact) 25%, transparent), transparent 68%); animation: aura-breathe 5.8s ease-in-out infinite alternate; }
  svg { width: 100%; height: 100%; overflow: visible; }
  .field { animation: field-turn 13s linear infinite; transform-origin: center; }
  .object { stroke-width: 2.1; }
  .object .solid { fill: color-mix(in srgb, var(--artifact) 38%, #090a0e); }
  .object .metal { fill: color-mix(in srgb, var(--artifact) 22%, #111018); }
  .object .glass { fill: color-mix(in srgb, var(--artifact) 11%, transparent); }
  .object .paper { fill: color-mix(in srgb, var(--artifact-soft) 12%, #0d0d12); }
  .object .dark { fill: #030408; stroke-width: 3; }
  .object .core { fill: var(--artifact-soft); stroke: var(--artifact-soft); filter: drop-shadow(0 0 .5rem var(--artifact)); }
  .object .ray { stroke: var(--artifact-soft); stroke-dasharray: 2 7; }
  .object .leaf { fill: color-mix(in srgb, var(--artifact) 26%, transparent); }
  .object .thick { stroke-width: 7; }
  .plinth { fill: rgba(0,0,0,.48); stroke: color-mix(in srgb, var(--artifact) 28%, transparent); }
  text { fill: var(--artifact-soft); font: 700 2.2rem Georgia, serif; filter: drop-shadow(0 0 .45rem #000); }
  .mote { position: absolute; width: .22rem; height: .22rem; border-radius: 50%; background: var(--artifact-soft); box-shadow: 0 0 .45rem var(--artifact); animation: mote-drift 6s ease-in-out infinite alternate; }
  .mote.one { left: 20%; top: 28%; }
  .mote.two { right: 19%; top: 39%; animation-delay: -2s; }
  .mote.three { left: 44%; bottom: 17%; animation-delay: -4s; }
  .locked { color: color-mix(in srgb, var(--artifact) 34%, #555); filter: grayscale(.8) brightness(.48); }
  .locked .object { opacity: .35; }
  .locked .aura, .locked .mote { display: none; }
  .reduced *, :global([data-motion='reduced']) .artifact * { animation: none !important; }
  @keyframes aura-breathe { to { scale: 1.09; opacity: .72; } }
  @keyframes field-turn { to { transform: rotate(360deg); } }
  @keyframes mote-drift { to { translate: .4rem -.7rem; opacity: .35; } }
</style>
