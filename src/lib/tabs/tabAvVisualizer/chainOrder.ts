// Shared by simulateBattle.ts (resolution order) and ActionDisplayPanel.tsx (display order) — both need
// the exact same algorithm, or the panel could show/edit an order that doesn't match what actually gets
// simulated.
export type Chainable = { id: string; afterItemId?: string }

// Merges items sharing one anchor (e.g. "after this action", or "at this exact AV") into a single
// resolution order. `unchained` is the legacy default order — what resolves when nobody ever used
// afterItemId (e.g. "all plain after-interventions, then all after_action Ults in their array order").
// `chained` items get spliced immediately after whatever item their afterItemId points to (which can be
// another chained item too, so a -> b -> c chains correctly), recursively. A dangling afterItemId (points
// to something not present in this exact anchor, e.g. that item got removed) falls back to the end of the
// sequence rather than silently dropping the item.
export function mergeChainedOrder<T extends Chainable>(unchained: T[], chained: T[]): T[] {
  const childrenOf = new Map<string, T[]>()
  for (const item of chained) {
    const key = item.afterItemId!
    childrenOf.set(key, [...(childrenOf.get(key) ?? []), item])
  }
  const result: T[] = []
  const seen = new Set<string>()
  function emit(item: T) {
    if (seen.has(item.id)) return
    seen.add(item.id)
    result.push(item)
    for (const child of childrenOf.get(item.id) ?? []) emit(child)
  }
  for (const item of unchained) emit(item)
  for (const item of chained) emit(item)
  return result
}
