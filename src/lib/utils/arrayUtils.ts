export function arrayIncludes<T>(array: T[], element: T): boolean {
  return array.includes(element)
}

/** ([{'x': 'y'}], 'x') => {'y': {'x': 'y'}} */
export function arrayToMap<
  T,
  K extends keyof T,
>(array: T[], key: K) {
  return array.reduce((map, obj) => {
    map[obj[key]] = obj
    return map
    // @ts-ignore
  }, {} as Record<T[K], T>)
}

/** ['z'] => {'z': true} */
export function stringArrayToMap<T extends string>(array: T[]) {
  return array.reduce((map, str) => {
    map[str] = true
    return map
  }, {} as Record<T, true>)
}

/** [1, 2, 2, 3] => [1, 2, 3] */
export function filterUnique<T>(arr: T[]) {
  return arr.filter((value, index, array) => array.indexOf(value) === index)
}

export function filterUniqueStringify<T>(arr: T[]) {
  return arr.filter((value, index, array) => {
    return index === array.findIndex((item) => {
      if (typeof value !== 'object' || value === null) {
        return value === item
      }

      return JSON.stringify(value) === JSON.stringify(item)
    })
  })
}

/** [0, 1, 2, null, 3] => [0, 1, 2, 3] */
export function filterNonNull<T>(arr: T[]) {
  return arr.filter(ArrayFilters.nonNullable)
}

/** [1, 2], 2 => 1 */
export function getIndexOf<T>(array: readonly T[], item: unknown): number {
  return array.indexOf(item as T)
}

export const ArrayFilters = {
  nonNullable: <T>(x: T) => x != null,
}

/** only use this on objects where you know the shape strictly matches the type, otherwise you might get surprised by unexpected keys */
export function definedEntries<K extends string | number | symbol, V>(record: Partial<Record<K, V>>) {
  return Object.entries(record).filter((x) => x[1] !== undefined) as Array<[K, V]>
}
