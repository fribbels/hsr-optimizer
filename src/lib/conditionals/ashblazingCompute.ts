import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'

const MAX_STACKS = 8
const ENEMY_COUNTS = [1, 3, 5] as const

type TargetType = 'single' | 'aoe' | 'blast' | 'bounce' | 'outer'

export type AshblazingHit =
  | { targetType: 'single' | 'aoe' | 'blast', weight: number }
  | { targetType: 'bounce', weight: number, bounceCount: number }
  | { targetType: 'outer' }

export type AshblazingMultiFn = (context: { enemyCount: number }) => number

// _ _ 1 _ _
export function single(weight: number): AshblazingHit {
  return { targetType: 'single', weight }
}

// 1 2 3 4 5
export function aoe(weight: number): AshblazingHit {
  return { targetType: 'aoe', weight }
}

// _ 1 2 3 _
export function blast(weight: number): AshblazingHit {
  return { targetType: 'blast', weight }
}

// random target per bounce, weighted by 1/enemyCount
export function bounce(weight: number, count: number): AshblazingHit {
  return { targetType: 'bounce', weight, bounceCount: count }
}

// 1 2 _ 3 4
export function outer(): AshblazingHit {
  return { targetType: 'outer' }
}

function getTargetsHit(targetType: TargetType, enemyCount: number): number {
  switch (targetType) {
    case 'single':
      return 1
    case 'aoe':
      return enemyCount
    case 'blast':
      return Math.min(3, enemyCount)
    case 'outer':
      return Math.max(0, enemyCount - 1)
    case 'bounce':
      return 1
  }
}

function computeForEnemyCount(hits: AshblazingHit[], enemyCount: number): number {
  let stacks = Math.ceil(getTargetsHit(hits[0].targetType, enemyCount) / 2)
  let totalContrib = 0
  let totalWeight = 0

  for (const hit of hits) {
    if (hit.targetType === 'outer') {
      stacks = Math.min(MAX_STACKS, stacks + Math.max(0, enemyCount - 1))
      continue
    }

    if (hit.targetType === 'bounce') {
      const perBounceWeight = hit.weight / enemyCount
      for (let i = 0; i < hit.bounceCount; i++) {
        totalContrib += stacks * perBounceWeight
        totalWeight += perBounceWeight
        stacks = Math.min(MAX_STACKS, stacks + 1)
      }
      continue
    }

    totalContrib += stacks * hit.weight
    totalWeight += hit.weight
    stacks = Math.min(MAX_STACKS, stacks + getTargetsHit(hit.targetType, enemyCount))
  }

  if (totalWeight === 0) return 0
  return ASHBLAZING_ATK_STACK * totalContrib / totalWeight
}

export function ashblazingMulti(hits: AshblazingHit[]): AshblazingMultiFn {
  const hitMultiByEnemyCount: Record<number, number> = {}

  for (const enemyCount of ENEMY_COUNTS) {
    hitMultiByEnemyCount[enemyCount] = computeForEnemyCount(hits, enemyCount)
  }

  return (context) => hitMultiByEnemyCount[context.enemyCount]
}
