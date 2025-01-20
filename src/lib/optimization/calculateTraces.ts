import DB from 'lib/state/db'
import { DBMetadataCharacter } from 'types/metadata'

export function calculateCustomTraces(characterMetadata: DBMetadataCharacter) {
  const overrides = DB.getScoringMetadata(characterMetadata.id)

  const deactivatedTraces = overrides?.traces?.deactivated ?? []
  const traces: Record<string, number> = {
    ...characterMetadata.traces,
  }

  const stack = [...characterMetadata.traceTree]
  while (stack.length) {
    const node = stack.pop()!
    stack.push(...node.children)

    if (deactivatedTraces.includes(node.id)) {
      if (traces[node.stat]) {
        traces[node.stat] = Math.max(0, traces[node.stat] - node.value)
      }
    }
  }

  return traces
}
