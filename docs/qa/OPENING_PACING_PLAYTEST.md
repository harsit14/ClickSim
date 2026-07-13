# Opening pacing playtest gate

Recorded 2026-07-12 after keyboard discovery shipped. This pass deliberately does not reduce UI costs without observed fatigue evidence.

## Reproducible path

On a fresh save, buying each control as soon as it is affordable produces:

| Milestone | Heart activations | Gap | Keyboard status |
| --- | ---: | ---: | --- |
| Keyboard hint | 5 | 5 | Space and Enter are surfaced |
| Counter | 10 | 5 after hint | alternate input already known |
| Shop | 35 | 25 | first spending decision |
| Upgrades | 110 | 75 | first growth controls |

The current opening passes the structural contract: keyboard discovery precedes the first unlock, the Shop arrives by 40 activations, growth controls arrive by 120, and no single gap exceeds 75. This supports holding costs at 10 / 25 / 75 for an observed playtest rather than treating 110 activations as proof of comfort.

## Human-session protocol

Run at least five fresh-save sessions across pointer, keyboard, and switch/assistive input where available. Do not tell participants which input is preferred. Record:

- time and activation count at Counter, Shop, and Upgrades;
- whether the keyboard hint was noticed and used;
- hand/attention fatigue on a 1–5 scale after Shop and Upgrades;
- any pause, abandonment, accidental chip activation, or confusion about the next goal.

Reduce costs only if one of these predeclared conditions is met:

- median fatigue at Upgrades is 3 or higher;
- the 75th-percentile time to Upgrades exceeds 90 seconds;
- fewer than 60% of keyboard-capable participants notice the hint before Shop;
- any assistive-input participant cannot complete the opening without pain or repeated errors.

If triggered, test 5 / 15 / 50 as the first candidate curve. Compare it against the current curve with the same participants and retain the reduction only if it improves fatigue without making the three narrative reveals feel simultaneous.

## Current decision

Hold the authored costs. The code-level path passes, but physical comfort is a human outcome and still needs observed sessions. The automated browser was unavailable during this audit, so no interactive timing or subjective result is claimed here.
