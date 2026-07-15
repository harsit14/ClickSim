<script lang="ts">
  import type { EconomyAmount, WorldObjectManifest } from '../content/universes/types'
  import {
    planBrahmalokCourts,
    planBrahmalokFolioShelf,
    planBrahmalokHeartResponse,
    planBrahmalokPetalWhorls,
  } from '../render/brahmalok/world-layer'

  let {
    objects,
    owned,
    numericLawState,
    folios = 0,
    archiveCount = 0,
    reducedMotion = false,
    quality = 'high',
  }: {
    objects: readonly WorldObjectManifest[]
    owned: Readonly<Record<string, number>>
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    folios?: number
    archiveCount?: number
    reducedMotion?: boolean
    quality?: 'low' | 'balanced' | 'high'
  } = $props()

  const courts = $derived(planBrahmalokCourts(numericLawState, owned))
  const shelf = $derived(planBrahmalokFolioShelf(folios))
  const whorls = $derived(planBrahmalokPetalWhorls(objects, owned))
  const heart = $derived(planBrahmalokHeartResponse(numericLawState, owned, archiveCount, reducedMotion))
</script>

<div class="brahmalok-world-layer" class:motion-paused={reducedMotion} class:low-quality={quality === 'low'} data-folios={shelf.folios.length} data-whorls={whorls.length} data-asking={heart.askingDirection ?? 'none'}>
  {#each courts as court (court.id)}
    <figure class="creation-court {court.direction.id}" class:asking={heart.askingDirection === court.direction.id} data-threshold={court.threshold} style={`--court-x:${court.xPercent}%;--court-y:${court.yPercent}%`} title={`${court.direction.name}: ${court.silhouette}; ${court.pattern}`}>
      <i class="court-ground"></i><b>{court.direction.glyph}</b><span>{court.direction.name}</span>
      {#if court.threshold >= 10}<i class="court-building first"></i>{/if}
      {#if court.threshold >= 25}<i class="court-building second"></i>{/if}
      {#if court.threshold >= 50}<i class="court-route"></i>{/if}
      {#if court.threshold >= 100}<i class="court-crown"></i>{/if}
    </figure>
  {/each}

  <div class="folio-shelf" aria-hidden="true">
    {#each shelf.folios as folio (folio.index)}<i class:fresh={folio.stage === 'fresh'} style={`--folio-index:${folio.index}`}></i>{/each}
  </div>

  <div class="petal-sky" aria-hidden="true">
    {#each whorls as whorl (whorl.id)}
      <i data-threshold={whorl.threshold} style={`--whorl-rotation:${whorl.rotationDegrees}deg;--whorl-radius:${whorl.radiusPercent}%`}></i>
    {/each}
    <b></b>
  </div>

  <div class="lotus-response" class:attention={heart.attention !== 'none'} class:static={heart.attention === 'static-ring'} aria-hidden="true">
    {#each heart.directionFractions as fraction, index}<i style={`--arc-index:${index};--arc-strength:${fraction}`}></i>{/each}
    <b></b>
  </div>

  <p class="sr-only" role="status">{heart.label}. {folios} Folio Sketches kept{shelf.unrenderedFolios > 0 ? `; and ${shelf.unrenderedFolios} more remain in the margins` : ''}. The lotus center remains an unclaimed open square.</p>
</div>

<style>
  .brahmalok-world-layer { position:absolute;inset:0;z-index:2;pointer-events:none;--folio-gold:#d8b46a;--folio-rose:#9e4f63;--folio-ivory:#e6d8bf; }
  .creation-court { position:absolute;left:clamp(4.4rem,var(--court-x),calc(100% - 4.4rem));top:var(--court-y);width:8rem;height:4.7rem;margin:0;transform:translate(-50%,-50%);color:var(--folio-ivory);opacity:.76; }
  .court-ground { position:absolute;left:8%;right:8%;bottom:.4rem;height:1.3rem;border:1px solid color-mix(in srgb,var(--folio-gold) 40%,transparent);border-radius:50%;transform:skewX(-12deg);background:color-mix(in srgb,#351b29 70%,transparent); }
  .creation-court > b { position:absolute;left:50%;top:.35rem;transform:translateX(-50%);font:.85rem/1 Georgia,serif; }.creation-court > span { position:absolute;left:50%;top:1.35rem;transform:translateX(-50%);font:700 .4rem/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase; }
  .court-building { position:absolute;bottom:1rem;width:1.45rem;height:1.4rem;border:1px solid currentColor;border-bottom:0;background:repeating-linear-gradient(90deg,transparent 0 .28rem,color-mix(in srgb,currentColor 25%,transparent) .3rem .34rem); }.court-building.first { left:1.15rem; }.court-building.second { right:1.15rem;height:1.75rem; }
  .court-route { position:absolute;left:23%;right:23%;bottom:.7rem;height:1px;background:var(--folio-gold);box-shadow:0 0 .35rem var(--folio-gold); }.court-crown { position:absolute;left:15%;right:15%;top:.1rem;height:1.1rem;border-top:1px dashed var(--folio-gold);border-radius:50%; }
  .creation-court[data-threshold='0'] { opacity:.22; }.creation-court[data-threshold='1'] { scale:.76; }.creation-court[data-threshold='10'] { scale:.84; }.creation-court[data-threshold='25'] { scale:.92; }.creation-court[data-threshold='50'] { scale:1; }.creation-court[data-threshold='100'] { scale:1.08;opacity:.92; }
  .creation-court.asking { outline:1px solid var(--folio-gold);outline-offset:.15rem;animation:court-attention 2.8s ease-in-out infinite alternate; }
  .folio-shelf { position:absolute;left:20%;right:20%;top:35%;height:2.6rem;display:flex;align-items:end;justify-content:center;gap:.14rem;border-bottom:2px solid color-mix(in srgb,var(--folio-gold) 45%,transparent); }
  .folio-shelf i { width:.38rem;height:calc(1rem + (var(--folio-index) % 4) * .16rem);border:1px solid color-mix(in srgb,var(--folio-ivory) 48%,transparent);border-bottom:0;background:color-mix(in srgb,var(--folio-rose) 45%,#2b1624);transform:skewY(calc((var(--folio-index) % 3 - 1) * 4deg)); }.folio-shelf i.fresh { border-color:#f1d58c;box-shadow:0 0 .5rem color-mix(in srgb,#e6bc63 50%,transparent); }
  .petal-sky { position:absolute;inset:4% 9% 26%; }.petal-sky i { position:absolute;left:50%;top:48%;width:var(--whorl-radius);aspect-ratio:1;border:1px solid color-mix(in srgb,var(--folio-rose) 28%,transparent);border-radius:50% 8% 50% 8%;transform:translate(-50%,-50%) rotate(var(--whorl-rotation)); }.petal-sky i[data-threshold='50'] { border-style:dashed;border-color:color-mix(in srgb,var(--folio-gold) 32%,transparent); }.petal-sky i[data-threshold='100'] { border-width:2px;border-color:color-mix(in srgb,var(--folio-ivory) 34%,transparent); }.petal-sky b { position:absolute;left:50%;top:48%;width:13%;aspect-ratio:1;transform:translate(-50%,-50%);background:transparent;border:1px solid color-mix(in srgb,var(--folio-gold) 28%,transparent); }
  .lotus-response { position:absolute;left:50%;top:52%;width:9rem;aspect-ratio:1;transform:translate(-50%,-50%); }.lotus-response i { position:absolute;inset:calc(.6rem + var(--arc-index) * .08rem);border:calc(1px + var(--arc-strength) * 3px) solid transparent;border-top-color:color-mix(in srgb,var(--folio-gold) calc(25% + var(--arc-strength) * 55%),transparent);border-radius:50%;transform:rotate(calc(var(--arc-index) * 90deg + 45deg)); }.lotus-response b { position:absolute;left:50%;top:50%;width:1.35rem;aspect-ratio:1;transform:translate(-50%,-50%);background:transparent;border:1px solid var(--folio-gold); }
  .lotus-response.attention { filter:drop-shadow(0 0 .45rem color-mix(in srgb,var(--folio-gold) 42%,transparent));animation:lotus-attention 2.8s ease-in-out infinite alternate; }.lotus-response.static { animation:none;outline:1px dashed var(--folio-gold);outline-offset:.3rem; }
  .motion-paused .creation-court,.motion-paused .lotus-response { animation:none; }.low-quality .petal-sky i[data-threshold='25'],.low-quality .court-building.second { display:none; }
  @keyframes court-attention { to { outline-offset:.35rem;filter:brightness(1.18); } } @keyframes lotus-attention { to { filter:drop-shadow(0 0 .85rem color-mix(in srgb,var(--folio-gold) 60%,transparent)); } }
  :global(html[data-contrast='high']) .creation-court,:global(html[data-contrast='high']) .folio-shelf i { color:white;border-color:white; }
  .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
</style>
