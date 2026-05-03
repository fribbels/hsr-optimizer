import {
  type MainStats,
  MainStatsValues,
  Parts,
  Stats,
  type StatsValues,
  type SubStats,
} from 'lib/constants/constants'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { type CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

function maxedMainStat(stat: MainStats): {
  stat: MainStats,
  value: number,
} {
  return { stat: stat, value: MainStatsValues[stat][5].base + 15 * MainStatsValues[stat][5].increment }
}

export function simToBuild(sim: Simulation, wearer: CharacterId, rollQuality: 'low' | 'mid' | 'high'): Record<Parts, Relic> | null {
  const request = sim.request
  const head: Relic = {
    id: 'head-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simRelicSet1,
    part: Parts.Head,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(Stats.HP),
  }
  const hand: Relic = {
    id: 'hand-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simRelicSet1,
    part: Parts.Hands,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(Stats.ATK),
  }
  const body: Relic = {
    id: 'body-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simRelicSet2,
    part: Parts.Body,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(request.simBody as MainStats),
  }
  const feet: Relic = {
    id: 'feet-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simRelicSet2,
    part: Parts.Feet,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(request.simFeet as MainStats),
  }
  const ball: Relic = {
    id: 'ball-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simOrnamentSet,
    part: Parts.PlanarSphere,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(request.simPlanarSphere as MainStats),
  }
  const rope: Relic = {
    id: 'rope-preview',
    grade: 5,
    enhance: 15,
    equippedBy: wearer,
    set: request.simOrnamentSet,
    part: Parts.LinkRope,
    weightScore: 0,
    previewSubstats: [],
    augmentedStats: {} as Record<StatsValues, number> & { mainStat: string, mainValue: number },
    initialRolls: 4,
    substats: [],
    main: maxedMainStat(request.simLinkRope as MainStats),
  }

  const stats = request.stats
  const usedStats = Object.entries(stats).filter(([_, count]) => count).map(([stat, _]) => stat as SubStats)

  usedStats.forEach((stat) => {
    const rollCount = stats[stat]
  })

  return null
}
