function sortKeys(val: unknown): unknown {
  if (val === null || typeof val !== 'object') return val
  if (Array.isArray(val)) return val.map(sortKeys)
  const obj = val as Record<string, unknown>
  const keys = Object.keys(obj)
  keys.sort()
  const sorted: Record<string, unknown> = Object.create(null)
  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = sortKeys(obj[keys[i]])
  }
  return sorted
}

/** Deep clone via JSON round-trip. Returns the input unchanged if falsy. */
export function clone<T>(obj: T): T {
  if (!obj) return obj
  return JSON.parse(JSON.stringify(obj)) as T
}

/** Deterministic JSON hash of an object (sorted keys). */
export function objectHash<T>(obj: T): string {
  return JSON.stringify(sortKeys(obj))
}

/** Swap keys and values in a string→string mapping. */
export function flipStringMapping(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key]),
  )
}

/**
 * Copy defined (non-null/undefined) values from source onto target's existing keys.
 * Object/array values are deep-cloned to prevent shared-reference mutations from corrupting the source.
 * Mutates and returns target.
 */
export function mergeDefinedValues<T extends Record<string, unknown>>(target: T, source: Partial<T> | undefined): T {
  if (!source) return target
  for (const key of Object.keys(target) as Array<keyof T>) {
    if (source[key] != null) {
      const val = source[key]
      target[key] = (val && typeof val === 'object' ? clone(val) : val) as T[keyof T]
    }
  }
  return target
}

/**
 * Fill undefined keys in target with values from source.
 * Object/array values are deep-cloned to prevent shared-reference mutations from corrupting the source.
 * Mutates and returns target.
 */
export function mergeUndefinedValues<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  for (const key of Object.keys(source) as Array<keyof T>) {
    if (target[key] == null) {
      const val = source[key]
      target[key] = (val && typeof val === 'object' ? clone(val) : val) as T[keyof T]
    }
  }
  return target
}

/** Remove a key from an object, returning a new object. */
export function omit<T extends Record<string, unknown>>(obj: T, key: string): T {
  const { [key]: _, ...rest } = obj
  return rest as T
}

/** Set a key if value is truthy, otherwise remove it. */
export function setOrOmit<T>(record: Record<string, T>, key: string, value: T | undefined): Record<string, T> {
  return value ? { ...record, [key]: value } : omit(record, key)
}
