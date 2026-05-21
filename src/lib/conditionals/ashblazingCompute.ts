import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'

const MAX_STACKS = 8
const ENEMY_COUNTS = [1, 3, 5] as const

type TargetType = 'single' | 'aoe' | 'blast'

export interface AshblazingHit {
  targetType: TargetType
  weight: number
}

export type AshblazingMultiFn = (context: { enemyCount: number }) => number

export function single(weight: number): AshblazingHit {
  return { targetType: 'single', weight }
}

export function aoe(weight: number): AshblazingHit {
  return { targetType: 'aoe', weight }
}

export function blast(weight: number): AshblazingHit {
  return { targetType: 'blast', weight }
}

function getTargetsHit(targetType: TargetType, enemyCount: number): number {
  switch (targetType) {
    case 'single':
      return 1
    case 'aoe':
      return enemyCount
    case 'blast':
      return Math.min(3, enemyCount)
  }
}

function normalizeWeights(hits: AshblazingHit[]): AshblazingHit[] {
  const totalWeight = hits.reduce((sum, hit) => sum + hit.weight, 0)

  if (Math.abs(totalWeight - 1.0) < 1e-6) {
    return hits
  }

  return hits.map((hit) => ({
    targetType: hit.targetType,
    weight: hit.weight / totalWeight,
  }))
}

function computeForEnemyCount(hits: AshblazingHit[], enemyCount: number): number {
  const firstHitTargets = getTargetsHit(hits[0].targetType, enemyCount)
  let stacks = Math.ceil(firstHitTargets / 2)
  let weightedStackTotal = 0

  for (const hit of hits) {
    weightedStackTotal += stacks * hit.weight

    const stackGrowth = getTargetsHit(hit.targetType, enemyCount)
    stacks = Math.min(MAX_STACKS, stacks + stackGrowth)
  }

  return ASHBLAZING_ATK_STACK * weightedStackTotal
}

export function ashblazingMulti(hits: AshblazingHit[]): AshblazingMultiFn {
  const normalizedHits = normalizeWeights(hits)
  const hitMultiByEnemyCount: Record<number, number> = {}

  for (const enemyCount of ENEMY_COUNTS) {
    hitMultiByEnemyCount[enemyCount] = computeForEnemyCount(normalizedHits, enemyCount)
  }

  return (context) => hitMultiByEnemyCount[context.enemyCount]
}
