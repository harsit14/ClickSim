# F2 comparative QA protocol (desktop)

Status: reusable Q1a harness and protocol only. No Emberlight/Tidefall comparison has been run or claimed in this branch. Tidefall does not yet expose an integrated validated `UniversePackV2` at the approved base.

## Scope and gate

This protocol is desktop-only. It does not collect or judge mobile layouts, touch density, mobile performance, or responsive breakpoints.

The F2 comparison passes only when all three evidence families pass:

1. the two validated manifests have distinct label-free fingerprints for Heart, world silhouette, interactive objects, material, motion, click response, Omen behavior, Archive, local prestige, audio families, and non-color state signals;
2. testers correctly identify both worlds in every required blind/audio/accessibility trial;
3. caller-supplied observations show consistent names and color tokens across world, shop, Archive, and guide.

The harness emits defects rather than changing pack content. Emberlight defects route to `agent-01-emberlight`, Tidefall defects to `agent-02-tidefall`, and missing/malformed QA evidence to `team-q1`.

## Fixed desktop capture setup

Use the same setup for both worlds:

- desktop Chromium, viewport `1440 × 900`, device scale factor `1`;
- a clean profile and the same approved integration SHA;
- default text scale and standard contrast except in the high-contrast pass;
- fixed deterministic fixture/save and explicit Omen/event selection;
- no DevTools overlays, browser chrome, file names, URL parameters, universe names, currency names, captions, tooltips, or panel headings inside blind visual artifacts;
- lossless PNG for visual artifacts and lossless WAV/FLAC for audio artifacts;
- artifact IDs formatted as `<universe>-<condition>-<subject>-<sequence>`.

Record the integration SHA, browser version, fixture/save identifier, viewport, quality, motion, contrast, audio buses, event ID, and capture command beside every artifact. Do not mix captures from different SHAs in one report.

## Required identification trials

Use at least three testers who were not told the answer order. Randomize Emberlight/Tidefall order outside the harness and preserve that order in the evidence log.

| Condition | Required subjects for each world | Presentation |
|---|---|---|
| `blind-visual` | world, Heart, interactive object, state/tide state | Remove all textual labels and identifying metadata. Preserve only rendered shape, material, layout, motion frame, and non-text state cues. |
| `audio-only` | world | Hide the canvas and captions. Normalize playback gain; do not rename files with universe terms. |
| `muted` | world, Heart, interactive object, state | Mute every audio bus. Use the same label-free visual rules as the blind pass. |
| `high-contrast` | world, state | Enable the shipped high-contrast mode. Do not apply external CSS. |
| `reduced-motion` | world, Heart, interactive object, state | Force the shipped reduced-motion mode and capture its replacement pose/crossfade/pulse. |
| `low-quality` | world, Heart, interactive object, state | Force the shipped low-quality profile while keeping the desktop viewport. |

For each trial record `condition`, `expectedUniverseId`, `identifiedUniverseId` (`emberlight`, `tidefall`, or `unclear`), `subject`, anonymized `testerId`, `artifactId`, and the cues the tester actually used. A missed answer is a gate defect; do not discard it and rerun only successful testers.

Audio-only evidence must exercise the click material cue, purchase interval, critical accent, Omen call, local prestige cadence, and at least one established-world stem mix. The manifest fingerprint checks these families structurally; the tester record establishes that the rendered mix remains identifiable.

## Name and color consistency observations

Supply observations from all four surfaces for both worlds: `world`, `shop`, `archive`, and `guide`.

Each observation contains:

- `universeId`;
- `surface`;
- `entityKind`: Heart, currency, generator, Omen, Archive, Archive record, or local prestige;
- stable `entityId`;
- exact `displayedName`;
- a canonical `colorToken` chosen before capture, such as `hue:42`, `gold-plasma`, or `tide-cyan`;
- `artifactId`;
- exact UI/source locator in `sourcePath`.

Observe at minimum the Heart, world currency, tier-1 Kindling, tier-9 Kindling, one Omen, one Archive record, the Archive itself, and local prestige wherever each appears. Reuse the same entity ID across surfaces so the harness can compare it. Color tokens describe semantic presentation, not sampled monitor RGB values.

## Input file

Create `/tmp/f2-comparative-input.json` with this shape:

```json
{
  "surfaceObservations": [
    {
      "universeId": "emberlight",
      "surface": "shop",
      "entityKind": "generator",
      "entityId": "spark",
      "displayedName": "<exact integrated name>",
      "colorToken": "<canonical token>",
      "artifactId": "emberlight-standard-shop-01",
      "sourcePath": "<selector or source path>"
    }
  ],
  "identificationTrials": [
    {
      "condition": "blind-visual",
      "expectedUniverseId": "emberlight",
      "identifiedUniverseId": "emberlight",
      "subject": "heart",
      "testerId": "tester-01",
      "artifactId": "emberlight-blind-visual-heart-01",
      "cuesReported": ["<shape/material/motion cue reported by tester>"]
    }
  ]
}
```

The abbreviated example is not complete evidence. The runner reports coverage defects until every condition/subject/world combination and all four consistency surfaces are present.

## Commands after both content branches integrate

First confirm the integration exports validated packs. The expected command assumes Tidefall follows the Emberlight export convention:

```sh
npm run verify
node --import tsx --test tests/f2-comparative.test.ts
node --import tsx --input-type=module -e '
  const [leftModule, rightModule, harness, fs] = await Promise.all([
    import("./src/content/universes/emberlight-v2.ts"),
    import("./src/content/universes/tidefall-v2.ts"),
    import("./src/qa/f2/index.ts"),
    import("node:fs")
  ]);
  const input = JSON.parse(fs.readFileSync("/tmp/f2-comparative-input.json", "utf8"));
  const report = harness.auditUniversePair(leftModule.EMBERLIGHT_V2, rightModule.TIDEFALL_V2, input);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.gatePassed ? 0 : 1;
' > /tmp/f2-comparative-report.json
```

If the integrated Tidefall module/export name differs, replace that import/export reference and record the actual name in the QA log. Exit code `0` means the complete supplied gate passed; a nonzero exit means the report contains defects or the packs/input could not be loaded and validated.

Data still required after integration:

- the approved integration SHA containing both validated V2 packs;
- deterministic desktop save/fixture IDs for matched progression points;
- label-free screenshots or motion-frame sets for all required visual subjects;
- audio-only recordings for the required cue families and stem mix;
- muted, high-contrast, reduced-motion, and low-quality artifacts;
- tester responses and reported cues;
- world/shop/Archive/guide observations with source locators;
- the JSON report produced by the command above.

## Defect handling

Every emitted defect contains owner, pack-relative path, reproduction steps, and evidence. Attach the referenced artifacts when sending it to the owner. Do not edit Emberlight or Tidefall from the QA branch. After a content owner supplies a fix, rerun the complete condition—never only the failed artifact—and retain the before/after report IDs.

## Limitations of Q1a

Manifest fingerprints are deterministic risk signals, not screenshots or rendered audio. They deliberately ignore array ordering, content IDs, pack IDs, and authored UI labels. The real F2 claim requires the caller-supplied desktop artifacts and tester results above. This branch proves the harness with synthetic pass/fail packs only.
