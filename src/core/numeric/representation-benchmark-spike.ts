/**
 * Reproducible NUM-001 micro-benchmark. It is intentionally excluded from live
 * code and measures arithmetic overhead only; timings are evidence, not tests.
 */
import {
  addScientificPairsSpike,
  multiplyScientificPairsSpike,
  parseScientificPairSpike,
  serializeScientificPairSpike,
} from './scientific-pair-spike'

export interface RepresentationBenchmarkSample {
  readonly representation: 'native-number' | 'normalized-scientific-pair' | 'bigint-fixed-coefficient'
  readonly operations: number
  readonly elapsedMs: number
  readonly operationsPerSecond: number
  readonly checksum: string
}

function measure(
  representation: RepresentationBenchmarkSample['representation'],
  iterations: number,
  action: () => string,
): RepresentationBenchmarkSample {
  const startedAt = globalThis.performance.now()
  const checksum = action()
  const elapsedMs = globalThis.performance.now() - startedAt
  return {
    representation,
    operations: iterations * 2,
    elapsedMs,
    operationsPerSecond: iterations * 2 / (elapsedMs / 1_000),
    checksum,
  }
}

/** Each iteration performs equivalent multiply-then-add work at ~15 digits. */
export function runRepresentationBenchmarkSpike(
  iterations = 100_000,
): readonly RepresentationBenchmarkSample[] {
  if (!Number.isSafeInteger(iterations) || iterations <= 0) {
    throw new RangeError('Benchmark iterations must be a positive safe integer')
  }

  const native = measure('native-number', iterations, () => {
    let value = 1
    for (let index = 0; index < iterations; index++) value = value * 1.0000001 + 0.000001
    return value.toPrecision(15)
  })

  const multiplier = parseScientificPairSpike('1.0000001e0')
  const increment = parseScientificPairSpike('1e-6')
  const scientificPair = measure('normalized-scientific-pair', iterations, () => {
    let value = parseScientificPairSpike('1e0')
    for (let index = 0; index < iterations; index++) {
      value = addScientificPairsSpike(multiplyScientificPairsSpike(value, multiplier), increment)
    }
    return serializeScientificPairSpike(value)
  })

  const scale = 1_000_000_000_000_000n
  const scaledMultiplier = 1_000_000_100_000_000n
  const scaledIncrement = 1_000_000_000n
  const bigint = measure('bigint-fixed-coefficient', iterations, () => {
    let value = scale
    for (let index = 0; index < iterations; index++) {
      value = value * scaledMultiplier / scale + scaledIncrement
    }
    return value.toString()
  })

  return Object.freeze([native, scientificPair, bigint])
}
