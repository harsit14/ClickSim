<script lang="ts">
  import type {
    PresentationLayer,
    PresentationState,
    UniversePresentation,
  } from '../render/presentation-contract'

  interface Props {
    state: PresentationState
    palette: UniversePresentation['palette']
  }

  let { state, palette }: Props = $props()

  function cssClipPath(layer: PresentationLayer): string {
    const value = layer.clipPath?.trim() ?? ''
    return /^(circle|ellipse|inset|polygon)\(/.test(value) ? `;clip-path:${value}` : ''
  }

  function layerStyle(layer: PresentationLayer): string {
    return [
      `--layer-inset:${layer.insetPercent}%`,
      `--layer-scale-x:${layer.scaleX}`,
      `--layer-scale-y:${layer.scaleY}`,
      `--layer-rotation:${layer.rotationDegrees}deg`,
      `--layer-fill:${palette[layer.fill]}`,
      `--layer-opacity:${layer.opacity}`,
    ].join(';') + cssClipPath(layer)
  }
</script>

<span
  class="presentation-shape"
  data-geometry={state.geometryLabel}
  data-pattern={state.pattern}
  aria-hidden="true"
>
  {#each state.layers as layer (layer.id)}
    <i
      class="presentation-layer"
      data-layer-id={layer.id}
      data-primitive={layer.primitive}
      data-stroke={layer.stroke ?? 'none'}
      data-clip={layer.clipPath ?? undefined}
      style={layerStyle(layer)}
    ></i>
  {/each}
</span>

<style>
  .presentation-shape {
    position: absolute;
    inset: 0;
    display: block;
    filter: drop-shadow(0 0 0.42rem color-mix(in srgb, var(--layer-glow, currentColor) 32%, transparent));
  }
  .presentation-layer {
    position: absolute;
    inset: var(--layer-inset);
    display: block;
    box-sizing: border-box;
    color: var(--layer-fill);
    background: var(--layer-fill);
    opacity: var(--layer-opacity);
    transform: rotate(var(--layer-rotation)) scale(var(--layer-scale-x), var(--layer-scale-y));
    transform-origin: center;
  }
  [data-primitive='ellipse'] { border-radius: 50%; }
  [data-primitive='polygon'] {
    clip-path: polygon(50% 0, 68% 28%, 100% 42%, 76% 63%, 84% 100%, 50% 78%, 16% 100%, 24% 63%, 0 42%, 32% 28%);
  }
  [data-primitive='ribbon'] {
    clip-path: polygon(0 38%, 18% 20%, 38% 35%, 58% 17%, 78% 32%, 100% 10%, 100% 62%, 79% 82%, 59% 65%, 39% 86%, 18% 70%, 0 91%);
  }
  [data-primitive='arc'] {
    background: transparent;
    border: 0.12rem solid currentColor;
    border-right-color: transparent;
    border-left-color: color-mix(in srgb, currentColor 42%, transparent);
    border-radius: 50%;
  }
  [data-primitive='frame'] {
    background: transparent;
    border: 0.1rem solid currentColor;
    border-radius: 18% 32% 16% 28%;
  }
  [data-primitive='branch'] {
    background: transparent;
    border-left: 0.14rem solid currentColor;
    border-bottom: 0.11rem solid currentColor;
    clip-path: polygon(4% 0, 54% 42%, 89% 4%, 66% 53%, 100% 82%, 58% 65%, 44% 100%, 38% 61%, 0 76%, 31% 50%);
  }
  [data-primitive='branch']::before,
  [data-primitive='branch']::after {
    content: '';
    position: absolute;
    left: 48%;
    bottom: 36%;
    width: 45%;
    border-top: 0.1rem solid currentColor;
    transform-origin: left;
    transform: rotate(-31deg);
  }
  [data-primitive='branch']::after { transform: rotate(34deg); }
  [data-primitive='cloud'] {
    border-radius: 62% 38% 58% 42% / 38% 62% 35% 65%;
    clip-path: polygon(4% 42%, 18% 17%, 41% 9%, 55% 22%, 77% 8%, 96% 31%, 89% 56%, 100% 78%, 72% 94%, 51% 82%, 31% 98%, 8% 78%);
  }
  [data-stroke='thin'] { outline: 1px solid color-mix(in srgb, currentColor 62%, transparent); outline-offset: -1px; }
  [data-stroke='strong'] { outline: 2px solid color-mix(in srgb, currentColor 84%, transparent); outline-offset: -2px; }
  [data-stroke='dashed'] { outline: 1px dashed currentColor; outline-offset: -1px; }
  :global(html[data-contrast='high']) .presentation-layer {
    filter: contrast(1.35);
    outline-color: #fff;
  }
</style>
