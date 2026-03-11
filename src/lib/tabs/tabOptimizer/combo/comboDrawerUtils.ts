export function getTeammateIndex(sourceKey: string) {
  if (sourceKey.includes('Teammate0')) return 0
  if (sourceKey.includes('Teammate1')) return 1
  if (sourceKey.includes('Teammate2')) return 2
  return undefined
}

export function elementToDataKey(element: HTMLElement | SVGElement) {
  return element.getAttribute('data-key') ?? '{}' // Get the data-key attribute
}
