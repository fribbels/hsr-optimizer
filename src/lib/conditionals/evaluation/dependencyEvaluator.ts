import { Stats } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalRegistry } from 'lib/optimization/calculateConditionals'

const MAX_EVALUATIONS = 3

export function evaluateDependencyOrder(registeredConditionals: ConditionalRegistry) {
  const chainedConditionals: DynamicConditional[] = []
  const terminalConditionals: DynamicConditional[] = []

  Object.values(registeredConditionals).forEach((conditionalGroup) => {
    for (const conditional of conditionalGroup) {
      if (conditional.chainsTo.length == 0) {
        terminalConditionals.push(conditional)
      } else {
        chainedConditionals.push(conditional)
      }
    }
  })

  const registry = emptyRegistry()
  const activationCount: Record<string, number> = {}
  const executedConditionals = new Set<string>()
  const pendingEvaluations = new Set<string>()
  const res: string[] = []
  const conditionalMap: Record<string, DynamicConditional> = {}
  const conditionalSequence: DynamicConditional[] = []

  for (const conditional of chainedConditionals) {
    conditionalMap[conditional.id] = conditional
    for (const stat of conditional.dependsOn) {
      registry[stat].push(conditional)
    }
  }

  const remainingConditionals = new Set(chainedConditionals.map((c) => c.id))

  const bestStartingStat = statOrder.reduce((bestStat, currentStat) => {
    const currentReachable = getTotalReachableConditionals(currentStat, remainingConditionals, registry)
    const bestReachable = getTotalReachableConditionals(bestStat, remainingConditionals, registry)

    return currentReachable > bestReachable ? currentStat : bestStat
  })

  let priorityQueue: string[] = [bestStartingStat]

  // console.log(`Starting with best Stat: ${bestStartingStat}`)

  let iterationCount = 0
  const MAX_ITERATIONS = 100

  while (remainingConditionals.size > 0 || priorityQueue.length > 0 || pendingEvaluations.size > 0) {
    iterationCount++
    if (iterationCount > MAX_ITERATIONS) {
      console.error('Loop exceeded 100 iterations')
      break
    }

    // console.log(`Iteration: ${iterationCount}`)

    priorityQueue.sort((a, b) => {
      const aScore = getTotalReachableConditionals(a, remainingConditionals, registry)
      const bScore = getTotalReachableConditionals(b, remainingConditionals, registry)
      return bScore - aScore
    })

    let stat: string | undefined = priorityQueue.shift()

    if (!stat && pendingEvaluations.size > 0) {
      stat = [...pendingEvaluations][0]
      pendingEvaluations.delete(stat)
      // console.log(`Re-evaluating Delayed Stat: ${stat}`)
    }

    if (!stat) break

    if (!pendingEvaluations.has(stat) && !priorityQueue.includes(stat)) {
      // console.log(`Evaluating Stat: ${stat}`)
      res.push(stat)
    }

    for (const conditional of registry[stat]) {
      if (executedConditionals.has(conditional.id) || remainingConditionals.has(conditional.id)) {
        if (activationCount[conditional.id] >= MAX_EVALUATIONS) continue
        if (activationCount[conditional.id] == null) activationCount[conditional.id] = 0
        activationCount[conditional.id]++

        executedConditionals.add(conditional.id)
        remainingConditionals.delete(conditional.id)
        // console.log(`  -> Executed conditional: ${conditional.id}`)

        conditionalSequence.push(conditional)

        for (const chainedStat of conditional.chainsTo) {
          if (!priorityQueue.includes(chainedStat) && !pendingEvaluations.has(chainedStat)) {
            // console.log(`    -> Queuing for evaluation: ${chainedStat}`)
            priorityQueue.push(chainedStat)
          } else {
            // console.log(`Skipping redundant addition of ${chainedStat}`)
          }
        }
      }
    }

    // Check all stats are evaluated at least once
    for (const stat of statOrder) {
      if (!res.includes(stat)) {
        priorityQueue.push(stat)
      }
    }

    priorityQueue = Array.from(new Set(priorityQueue))
  }

  return {
    conditionalSequence,
    terminalConditionals,
  }
}

const statOrder = [
  Stats.SPD,
  Stats.BE,
  Stats.EHR,
  Stats.CR,
  Stats.CD,
  Stats.RES,
  Stats.DEF,
  Stats.ATK,
  Stats.OHB,
  Stats.ERR,
  Stats.HP,
]

function emptyRegistry(): Record<string, DynamicConditional[]> {
  return {
    [Stats.HP]: [],
    [Stats.ATK]: [],
    [Stats.DEF]: [],
    [Stats.SPD]: [],
    [Stats.CR]: [],
    [Stats.CD]: [],
    [Stats.EHR]: [],
    [Stats.RES]: [],
    [Stats.BE]: [],
    [Stats.OHB]: [],
    [Stats.ERR]: [],
  }
}

function getTotalReachableConditionals(stat: string, remainingConditionals: Set<string>, registry: ConditionalRegistry, visited = new Set<string>()): number {
  if (visited.has(stat)) return 0
  visited.add(stat)

  let count = 0
  for (const conditional of registry[stat]) {
    if (remainingConditionals.has(conditional.id)) {
      count++

      for (const chainedStat of conditional.chainsTo) {
        count += getTotalReachableConditionals(chainedStat, remainingConditionals, registry, visited)
      }
    }
  }

  return count
}
