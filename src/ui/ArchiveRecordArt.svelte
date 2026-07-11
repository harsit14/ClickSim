<script lang="ts">
  import type { UniverseId } from '../content/universes/types'
  import { CHAMBER_ARCHIVE_MARK_BY_ID } from '../render/chamber-archive-marks'
  import { CLOCKWORK_PATENT_MARK_BY_ID } from '../render/clockwork/patent-marks'

  interface Props {
    id: string
    hue: number
    universeId: UniverseId
    unresolved?: boolean
  }

  let { id, hue, universeId, unresolved = false }: Props = $props()
  const clockworkMark = $derived(universeId === 'clockwork' ? CLOCKWORK_PATENT_MARK_BY_ID.get(id) : undefined)
  const chamberMark = $derived.by(() => {
    const mark = CHAMBER_ARCHIVE_MARK_BY_ID.get(id)
    return mark?.universeId === universeId ? mark : undefined
  })
</script>

<span
  class={`archive-record-art art-${id}`}
  class:tidefall={universeId === 'tidefall'}
  class:clockwork={universeId === 'clockwork'}
  class:chamber-native={!!chamberMark}
  data-native-universe={chamberMark?.universeId}
  class:unresolved
  style:--record-hue={hue}
  aria-hidden="true"
>
  {#if clockworkMark}
    <svg class={`patent-mark family-${clockworkMark.family}`} viewBox="0 0 40 40">
      <path class="patent-plate" d="M5 5H30L35 10V35H5ZM30 5V10H35M8 8H11M8 32H11" />
      <path class="patent-diagram" d={clockworkMark.diagramPath} />
      <path class="patent-accent" d={clockworkMark.accentPath} />
    </svg>
  {:else if chamberMark}
    <svg class={`chamber-mark family-${chamberMark.family}`} viewBox="0 0 40 40">
      <path class="chamber-frame" d={chamberMark.framePath} />
      <path class="chamber-diagram" d={chamberMark.diagramPath} />
      <path class="chamber-accent" d={chamberMark.accentPath} />
    </svg>
  {:else}
    <i class="halo"></i><i class="core"></i><i class="ring"></i><i class="beam"></i>
  {/if}
</span>

<style>
  .archive-record-art {
    position: relative;
    display: block;
    width: 2.55rem;
    height: 2.55rem;
    overflow: hidden;
    border: 1px solid hsla(var(--record-hue), 72%, 68%, 0.14);
    border-radius: 50%;
    background: radial-gradient(circle, hsla(var(--record-hue), 62%, 45%, 0.08), rgba(2, 3, 9, 0.78) 70%);
    box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.58), 0 0 16px hsla(var(--record-hue), 85%, 56%, 0.08);
  }
  .archive-record-art i { position: absolute; display: block; pointer-events: none; }
  .core {
    left: 50%;
    top: 50%;
    width: 0.48rem;
    height: 0.48rem;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: hsl(var(--record-hue), 88%, 76%);
    box-shadow: 0 0 8px hsla(var(--record-hue), 95%, 72%, 0.74);
  }
  .halo {
    inset: 0.45rem;
    border: 1px solid hsla(var(--record-hue), 90%, 72%, 0.2);
    border-radius: 50%;
    animation: archive-pulse 2.8s ease-in-out infinite alternate;
  }
  .ring {
    left: 50%;
    top: 50%;
    width: 1.75rem;
    height: 0.52rem;
    transform: translate(-50%, -50%) rotate(-16deg);
    border: 1px solid hsla(var(--record-hue), 82%, 72%, 0.38);
    border-radius: 50%;
    animation: archive-spin 8s linear infinite;
  }
  .beam { display: none; }
  .unresolved { filter: grayscale(0.86); opacity: 0.45; }

  .clockwork {
    overflow: visible;
    border-color: hsla(var(--record-hue), 54%, 65%, 0.28);
    border-radius: 0.28rem;
    background:
      linear-gradient(hsla(var(--record-hue), 45%, 58%, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, hsla(var(--record-hue), 45%, 58%, 0.055) 1px, transparent 1px),
      linear-gradient(145deg, rgba(37, 31, 23, 0.96), rgba(10, 14, 17, 0.98));
    background-size: 0.42rem 0.42rem, 0.42rem 0.42rem, auto;
    box-shadow:
      inset 0 0 0 1px rgba(255, 230, 172, 0.035),
      inset 0 0 14px rgba(0, 0, 0, 0.54),
      0 0 13px hsla(var(--record-hue), 72%, 54%, 0.09);
  }
  .patent-mark { width: 100%; height: 100%; overflow: visible; }
  .patent-mark path {
    vector-effect: non-scaling-stroke;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .patent-plate { stroke: hsla(var(--record-hue), 48%, 72%, 0.32); stroke-width: 0.78; }
  .patent-diagram {
    stroke: hsla(var(--record-hue), 74%, 74%, 0.9);
    stroke-width: 1.35;
    filter: drop-shadow(0 0 1.8px hsla(var(--record-hue), 84%, 62%, 0.42));
  }
  .patent-accent {
    stroke: #fff0ba;
    stroke-width: 1.05;
    stroke-dasharray: 2 1.5;
    opacity: 0.82;
    animation: patent-index 2.4s steps(4, end) infinite;
  }
  .family-prediction .patent-diagram { stroke: hsla(var(--record-hue), 66%, 78%, 0.94); }
  .family-exception .patent-accent { stroke: #ffc69e; }

  .chamber-native {
    overflow: visible;
    border-color: hsla(var(--record-hue), 58%, 70%, 0.25);
    background: linear-gradient(145deg, hsla(var(--record-hue), 32%, 18%, 0.82), rgba(4, 7, 11, 0.96));
    box-shadow: inset 0 0 13px rgba(0, 0, 0, 0.5), 0 0 13px hsla(var(--record-hue), 70%, 56%, 0.1);
  }
  .chamber-mark { width: 100%; height: 100%; overflow: visible; }
  .chamber-mark path {
    vector-effect: non-scaling-stroke;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .chamber-frame { stroke: hsla(var(--record-hue), 50%, 72%, 0.24); stroke-width: 0.72; }
  .chamber-diagram {
    stroke: hsla(var(--record-hue), 72%, 78%, 0.92);
    stroke-width: 1.28;
    filter: drop-shadow(0 0 1.6px hsla(var(--record-hue), 90%, 68%, 0.4));
  }
  .chamber-accent {
    stroke: color-mix(in srgb, hsl(var(--record-hue), 88%, 76%) 72%, white);
    stroke-width: 1.05;
    stroke-dasharray: 2.2 1.6;
    opacity: 0.84;
    animation: native-record-signal 2.8s ease-in-out infinite alternate;
  }
  [data-native-universe='verdance'] {
    border-radius: 52% 48% 44% 56%;
    background:
      linear-gradient(32deg, transparent 47%, hsla(var(--record-hue), 55%, 68%, 0.08) 48% 50%, transparent 51%),
      radial-gradient(circle at 36% 28%, hsla(var(--record-hue), 48%, 34%, 0.24), rgba(5, 17, 10, 0.96) 70%);
  }
  [data-native-universe='verdance'] .chamber-frame { stroke-dasharray: 1.2 1.8; }
  [data-native-universe='verdance'] .chamber-accent { stroke: #d9f3a9; }
  [data-native-universe='prismata'] {
    border-radius: 48% 48% 42% 42%;
    background:
      repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,231,178,.035) 6px 7px),
      radial-gradient(circle, hsla(var(--record-hue), 54%, 30%, 0.24), rgba(10, 7, 15, 0.98) 72%);
  }
  [data-native-universe='prismata'] .chamber-frame { stroke: rgba(255, 235, 195, 0.28); stroke-dasharray: 1.2 1.4; }
  [data-native-universe='prismata'] .chamber-accent { stroke: #8ecbe0; animation-timing-function: ease-in-out; }
  [data-native-universe='tempest'] {
    border-radius: 50% 50% 32% 32%;
    background:
      repeating-radial-gradient(ellipse at 50% 0, transparent 0 5px, hsla(var(--record-hue), 54%, 70%, 0.04) 5px 6px),
      linear-gradient(180deg, hsla(var(--record-hue), 38%, 27%, 0.24), rgba(4, 8, 22, 0.98));
  }
  [data-native-universe='tempest'] .chamber-accent { stroke: #efd78f; animation-timing-function: ease-in-out; animation-duration: 3.6s; }
  [data-native-universe='canticle'] {
    border-radius: 50%;
    background:
      repeating-radial-gradient(circle, transparent 0 5px, hsla(var(--record-hue), 52%, 70%, 0.05) 5px 6px),
      radial-gradient(circle, hsla(var(--record-hue), 45%, 30%, 0.2), rgba(12, 6, 15, 0.98) 72%);
  }
  [data-native-universe='canticle'] .chamber-frame { stroke-dasharray: 1.5 1.5; }
  [data-native-universe='canticle'] .chamber-accent { stroke: #ffe7f7; animation-duration: 3.6s; }

  .art-moth .core { width: 0.6rem; height: 0.6rem; background: #eff8ff; box-shadow: 0 0 5px #fff, 0 0 14px rgba(170, 215, 255, 0.75); }
  .art-moth .halo { inset: 0.7rem; border-color: rgba(202, 232, 255, 0.3); }
  .art-moth .ring { width: 2rem; height: 0.66rem; border-color: rgba(170, 208, 255, 0.18); }

  .art-chimes .core { width: 0.36rem; height: 0.36rem; background: #dffaff; }
  .art-chimes .halo { inset: 0.35rem; border-style: dashed; border-color: rgba(127, 226, 255, 0.3); }
  .art-chimes .ring { width: 1.4rem; height: 1.4rem; border-color: rgba(130, 226, 255, 0.26); }
  .art-chimes .beam,
  .art-metronome-heart .beam {
    display: block;
    left: 50%;
    top: 0.22rem;
    width: 1px;
    height: 2.1rem;
    transform: rotate(28deg);
    background: linear-gradient(transparent, hsla(var(--record-hue), 95%, 80%, 0.62), transparent);
    box-shadow: 0 0 5px hsla(var(--record-hue), 90%, 74%, 0.4);
  }

  .art-hearthkeeper .core { width: 0.92rem; height: 0.92rem; background: radial-gradient(circle at 35% 30%, #fff4ca, #ff9b43 54%, #8f2c24); box-shadow: 0 0 16px rgba(255, 140, 65, 0.65); }
  .art-hearthkeeper .halo { inset: 0.28rem; border-color: rgba(255, 145, 75, 0.23); }
  .art-hearthkeeper .ring { border-style: dotted; border-color: rgba(255, 194, 120, 0.3); }

  .art-glass-garden .core { width: 1.8rem; height: 1.16rem; background: radial-gradient(ellipse at 35% 45%, rgba(255, 158, 232, 0.72), rgba(111, 94, 255, 0.38) 48%, transparent 74%); filter: blur(1px); box-shadow: 0 0 14px rgba(182, 96, 255, 0.34); }
  .art-glass-garden .halo { inset: 0.24rem; border-color: rgba(211, 150, 255, 0.18); border-radius: 42% 58% 38% 62%; transform: rotate(24deg); }
  .art-glass-garden .ring { border-top-color: rgba(115, 245, 235, 0.38); border-right-color: transparent; border-bottom-color: transparent; }

  .art-second-cursor .core { width: 0.42rem; height: 0.42rem; background: #e7fbff; box-shadow: 0 0 12px #9defff; }
  .art-second-cursor .ring { width: 1rem; height: 1rem; border-style: dashed; }
  .art-second-cursor .beam {
    display: block;
    left: 0.16rem;
    top: 1.2rem;
    width: 2.2rem;
    height: 2px;
    transform: rotate(-18deg);
    background: linear-gradient(90deg, transparent, rgba(160, 239, 255, 0.75), transparent);
    box-shadow: 0 0 8px rgba(105, 225, 255, 0.55);
    animation: quasar-beam 1.4s ease-in-out infinite alternate;
  }

  .art-snail .core { left: 72%; width: 0.45rem; height: 0.45rem; background: #f4ffdc; box-shadow: 0 0 10px rgba(210, 255, 154, 0.85); }
  .art-snail .halo { display: none; }
  .art-snail .ring { left: 38%; width: 1.65rem; height: 0.32rem; transform: translate(-50%, -50%) rotate(-28deg); border: 0; background: linear-gradient(90deg, transparent, rgba(163, 231, 255, 0.14), rgba(228, 255, 185, 0.56)); filter: blur(1px); }

  .art-aurora .core { width: 1.65rem; height: 1.65rem; background: radial-gradient(circle, transparent 26%, rgba(105, 242, 220, 0.18) 32%, rgba(165, 100, 255, 0.28) 54%, transparent 70%); box-shadow: none; }
  .art-aurora .halo { inset: 0.34rem; border-color: rgba(100, 255, 222, 0.27); border-radius: 48% 52% 61% 39%; }
  .art-aurora .ring { border-color: rgba(185, 115, 255, 0.3); border-left-color: transparent; border-right-color: transparent; transform: translate(-50%, -50%) rotate(35deg); }

  .art-door .core,
  .art-orrery .core { background: #010207; box-shadow: 0 0 0 2px rgba(255, 190, 105, 0.22), 0 0 12px rgba(255, 134, 60, 0.25); }
  .art-door .core { width: 0.74rem; height: 0.74rem; }
  .art-door .halo { inset: 0.53rem; border-color: rgba(255, 171, 92, 0.36); }
  .art-door .ring { width: 1.75rem; height: 0.42rem; border-color: rgba(255, 198, 112, 0.46); border-bottom-color: rgba(255, 93, 55, 0.18); }

  .art-star-jar .core { width: 0.34rem; height: 0.34rem; background: #f4fbff; box-shadow: 0 0 6px #fff, 0 0 12px rgba(145, 208, 255, 0.9); }
  .art-star-jar .halo { inset: 0.82rem; border-width: 2px; border-color: rgba(185, 229, 255, 0.32); }
  .art-star-jar .ring { width: 1.15rem; height: 1.15rem; border-style: dotted; border-color: rgba(180, 224, 255, 0.24); }

  .art-metronome-heart .core { width: 0.4rem; height: 0.4rem; background: #fff2fb; box-shadow: 0 0 10px rgba(255, 140, 210, 0.86); animation: archive-pulse 0.72s ease-in-out infinite alternate; }
  .art-metronome-heart .ring { width: 1.45rem; height: 1.45rem; border-style: dashed; border-color: rgba(255, 143, 211, 0.28); }
  .art-metronome-heart .beam { transform: rotate(-34deg); }

  .art-letter .core { width: 1.12rem; height: 1.12rem; background: radial-gradient(circle at 35% 30%, #fff0bd, #ef7648 48%, #8d2529 76%); box-shadow: 0 0 15px rgba(238, 91, 55, 0.66); }
  .art-letter .halo { inset: 0.28rem; border-color: rgba(255, 121, 75, 0.2); }
  .art-letter .ring { width: 2rem; height: 0.72rem; border-color: rgba(255, 171, 103, 0.2); }

  .art-orrery .core { width: 1rem; height: 1rem; }
  .art-orrery .halo { inset: 0.2rem; border-color: rgba(255, 183, 105, 0.28); }
  .art-orrery .ring { width: 2.3rem; height: 0.58rem; border-width: 2px; border-color: rgba(255, 215, 137, 0.52); border-bottom-color: rgba(255, 91, 48, 0.22); }

  .tidefall { border-radius: 46% 54% 58% 42%; background: radial-gradient(circle at 50% 36%, hsla(var(--record-hue), 72%, 62%, 0.13), rgba(1, 12, 22, 0.88) 72%); }
  .tidefall.art-moth .core { background: transparent; box-shadow: inset 0.24rem 0 0 rgba(207, 252, 255, 0.92), 0 0 12px rgba(116, 226, 255, 0.68); }
  .tidefall.art-chimes .ring { width: 2rem; height: 0.72rem; border-style: solid; }
  .tidefall.art-hearthkeeper .core { width: 0.82rem; height: 0.82rem; background: radial-gradient(circle at 32% 28%, #fff, #b9fff2 42%, #39a9a1 72%); box-shadow: 0 0 15px rgba(88, 222, 216, 0.75); }
  .tidefall.art-glass-garden .core { background: radial-gradient(ellipse, rgba(90, 255, 193, 0.62), rgba(24, 151, 153, 0.3) 52%, transparent 74%); }
  .tidefall.art-snail .ring { height: 0.7rem; border-radius: 50%; background: linear-gradient(90deg, transparent, rgba(79, 216, 207, 0.22), rgba(183, 255, 242, 0.62)); }
  .tidefall.art-letter .core { background: radial-gradient(circle at 35% 30%, #ffe9cc, #ef5d53 48%, #42152a 78%); }
  .tidefall.art-door .ring,
  .tidefall.art-orrery .ring { border-color: rgba(92, 218, 255, 0.5); border-bottom-color: rgba(83, 89, 255, 0.22); }

  @keyframes archive-pulse { from { opacity: 0.46; transform: scale(0.94); } to { opacity: 1; transform: scale(1.06); } }
  @keyframes archive-spin { to { transform: translate(-50%, -50%) rotate(344deg); } }
  @keyframes quasar-beam { from { opacity: 0.38; } to { opacity: 1; } }
  @keyframes patent-index { 0%, 100% { opacity: 0.38; } 50% { opacity: 1; } }
  @keyframes native-record-signal { from { opacity: 0.36; stroke-dashoffset: 0; } to { opacity: 1; stroke-dashoffset: 5; } }

  @media (prefers-reduced-motion: reduce) {
    .archive-record-art i { animation: none !important; }
    .archive-record-art path { animation: none !important; }
  }
</style>
