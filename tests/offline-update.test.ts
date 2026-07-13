import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const offlineSource = readFileSync(new URL('../src/core/offline.ts', import.meta.url), 'utf8')
const workerSource = readFileSync(new URL('../scripts/generate-service-worker.mjs', import.meta.url), 'utf8')

test('deployed builds replace an existing cached client promptly', () => {
  assert.match(offlineSource, /controllerchange/)
  assert.match(offlineSource, /replacingExistingWorker/)
  assert.match(offlineSource, /window\.location\.reload\(\)/)
  assert.match(offlineSource, /updateViaCache: 'none'/)
  assert.match(offlineSource, /registration\.update\(\)/)
})

test('navigations prefer the deployed index while retaining an offline fallback', () => {
  assert.match(workerSource, /event\.request\.mode === 'navigate'/)
  assert.match(workerSource, /fetch\(event\.request\)/)
  assert.match(workerSource, /cache\.put\('\.\/index\.html', response\.clone\(\)\)/)
  assert.match(workerSource, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/)
})
