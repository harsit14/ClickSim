import {
  migrateAndSanitizeSaveV12,
  migrateAndSanitizeSaveV13,
  stringifySaveDataV13,
  type SaveDataV13,
} from '../save-data'

export const V12_ROLLBACK_KEY = 'ember.save.rollback.v12'

export interface SaveStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface PreparedV13Migration {
  readonly data: SaveDataV13
  readonly serialized: string
  readonly rollbackV12Raw: string | null
}

/** Validate and serialize the complete snapshot before touching storage. */
export function prepareV13Migration(raw: string): PreparedV13Migration | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const version = (parsed as Record<string, unknown>).version
    const data = migrateAndSanitizeSaveV13(parsed)
    if (!data) return null
    const serialized = stringifySaveDataV13(data)
    if (!migrateAndSanitizeSaveV13(JSON.parse(serialized))) return null

    let rollbackV12Raw: string | null = null
    if (typeof version === 'number' && version <= 12) {
      const legacy = migrateAndSanitizeSaveV12(parsed)
      if (!legacy) return null
      rollbackV12Raw = version === 12 ? raw : JSON.stringify(legacy)
    }
    return { data, serialized, rollbackV12Raw }
  } catch {
    return null
  }
}

function restore(storage: SaveStorage, key: string, previous: string | null): void {
  if (previous === null) storage.removeItem(key)
  else storage.setItem(key, previous)
}

/**
 * Commit the dedicated rollback snapshot once, then the v13 primary. If either
 * write fails, restore both keys to their exact pre-call contents.
 */
export function commitV13Migration(
  storage: SaveStorage,
  primaryKey: string,
  raw: string,
  savedAtOverride?: number,
): SaveDataV13 | null {
  const prepared = prepareV13Migration(raw)
  if (!prepared) return null
  const data = savedAtOverride === undefined
    ? prepared.data
    : { ...prepared.data, savedAt: savedAtOverride }
  const serialized = savedAtOverride === undefined
    ? prepared.serialized
    : stringifySaveDataV13(data)
  if (prepared.rollbackV12Raw === null) return data

  const previousPrimary = storage.getItem(primaryKey)
  const previousRollback = storage.getItem(V12_ROLLBACK_KEY)
  try {
    if (previousRollback === null) storage.setItem(V12_ROLLBACK_KEY, prepared.rollbackV12Raw)
    storage.setItem(primaryKey, serialized)
    return data
  } catch {
    try {
      restore(storage, primaryKey, previousPrimary)
      restore(storage, V12_ROLLBACK_KEY, previousRollback)
    } catch {
      // Storage failure is terminal for this attempt; callers keep playing in memory.
    }
    return null
  }
}
