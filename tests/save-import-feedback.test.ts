import assert from 'node:assert/strict'
import test from 'node:test'
import {
  decodeSaveImportCode,
  describeSaveImportFailure,
  type SaveImportFailure,
} from '../src/core/save-import'

const encode = (value: string) => btoa(value)

test('save import classification distinguishes encoding, document, and version failures', () => {
  assert.deepEqual(decodeSaveImportCode(''), { reason: 'empty' })
  assert.deepEqual(decodeSaveImportCode('not an export!!!'), { reason: 'invalid-encoding' })
  assert.deepEqual(decodeSaveImportCode(encode('{')), { reason: 'invalid-json' })
  assert.deepEqual(decodeSaveImportCode(encode('[]')), { reason: 'invalid-document' })
  assert.deepEqual(decodeSaveImportCode(encode('{}')), { reason: 'missing-version' })
  assert.deepEqual(decodeSaveImportCode(encode('{"version":24}')), { reason: 'newer-version', version: 24 })
  assert.deepEqual(decodeSaveImportCode(encode('{"version":14}')), { reason: 'unsupported-version', version: 14 })
  assert.equal('json' in decodeSaveImportCode(encode('{"version":23}')), true)
})

test('every import failure tells the player what happened or what to do next', () => {
  const failures: SaveImportFailure[] = [
    { reason: 'empty' },
    { reason: 'invalid-encoding' },
    { reason: 'invalid-json' },
    { reason: 'invalid-document' },
    { reason: 'missing-version' },
    { reason: 'unsupported-version', version: 14 },
    { reason: 'newer-version', version: 24 },
    { reason: 'damaged-save', version: 23 },
    { reason: 'migration-failed', version: 12 },
    { reason: 'storage-unavailable' },
  ]
  for (const failure of failures) {
    const message = describeSaveImportFailure(failure)
    assert.ok(message.length >= 35, `${failure.reason} needs an actionable message`)
    assert.match(message, /save|code|progress|store|browser|paste|build/i)
  }
})
