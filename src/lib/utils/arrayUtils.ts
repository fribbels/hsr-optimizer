export function arrayIncludes<T>(array: T[], element: T): boolean {
  return array.includes(element)
}

// ([{'x': 'y'}], 'x') => {'y': {'x': 'y'}}
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

// ['z'] => {'z': true}
export function stringArrayToMap<T extends string>(array: T[]) {
  return array.reduce((map, str) => {
    map[str] = true
    return map
  }, {} as Record<T, true>)
}

// [1, 2, 2, 3] => [1, 2, 3]
export function filterUnique<T>(arr: T[]) {
  return arr.filter((value, index, array) => array.indexOf(value) === index)
}

// [1, 2, null, 3] => [1, 2, 3]
export function filterNonNull<T>(arr: T[]) {
  return arr.filter((value) => value != null)
}
