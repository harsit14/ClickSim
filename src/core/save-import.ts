import {
  CURRENT_SAVE_VERSION,
  F5_SAVE_VERSION,
  LEGACY_SAVE_VERSION,
  NUMERIC_SAVE_VERSION,
} from './save-data'

export type SaveImportFailure =
  | { reason: 'empty' }
  | { reason: 'invalid-encoding' }
  | { reason: 'invalid-json' }
  | { reason: 'invalid-document' }
  | { reason: 'missing-version' }
  | { reason: 'unsupported-version'; version: number }
  | { reason: 'newer-version'; version: number }
  | { reason: 'damaged-save'; version: number }
  | { reason: 'migration-failed'; version: number }
  | { reason: 'storage-unavailable' }

export type SaveImportResult = { ok: true } | { ok: false; failure: SaveImportFailure }

export interface DecodedSaveImport {
  readonly json: string
  readonly parsed: Record<string, unknown>
  readonly version: number
}

export function decodeSaveImportCode(code: string): DecodedSaveImport | SaveImportFailure {
  if (!code.trim()) return { reason: 'empty' }
  let json = ''
  try {
    json = decodeURIComponent(escape(atob(code.trim())))
  } catch {
    return { reason: 'invalid-encoding' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { reason: 'invalid-json' }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { reason: 'invalid-document' }
  const version = (parsed as Record<string, unknown>).version
  if (typeof version !== 'number' || !Number.isInteger(version)) return { reason: 'missing-version' }
  if (version > CURRENT_SAVE_VERSION) return { reason: 'newer-version', version }
  const supported = version >= 1 && (
    version <= LEGACY_SAVE_VERSION
    || version === NUMERIC_SAVE_VERSION
    || version === F5_SAVE_VERSION
    || version === CURRENT_SAVE_VERSION
  )
  if (!supported) return { reason: 'unsupported-version', version }
  return { json, parsed: parsed as Record<string, unknown>, version }
}

export function describeSaveImportFailure(failure: SaveImportFailure): string {
  switch (failure.reason) {
    case 'empty': return 'Paste an EMBER export code before importing.'
    case 'invalid-encoding': return 'This is not an EMBER export code. Paste the entire code or choose a downloaded save file.'
    case 'invalid-json': return 'The code decoded, but its save document is damaged. Try a rolling backup or export again.'
    case 'invalid-document': return 'The decoded data is not an EMBER save. No progress was changed.'
    case 'missing-version': return 'This save does not identify its EMBER version. No progress was changed.'
    case 'unsupported-version': return `EMBER save version ${failure.version} is not supported by this build.`
    case 'newer-version': return `This save is from EMBER v${failure.version}, newer than this build (v${CURRENT_SAVE_VERSION}). Update the game before importing it.`
    case 'damaged-save': return `This v${failure.version} save is missing or contains damaged progress data. Try a recovery checkpoint.`
    case 'migration-failed': return `This v${failure.version} save could not be upgraded safely. Your current progress was not changed.`
    case 'storage-unavailable': return 'The save is valid, but this browser could not store it. Check storage permissions or available space.'
  }
}
