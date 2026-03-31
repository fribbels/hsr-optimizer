import {
  Parts,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { StatCalculator } from 'lib/relics/statCalculator'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { precisionRound } from 'lib/utils/mathUtils'

export function relicSetIndexToNames(relicSetIndex: number) {
  const numSetsR = Object.values(SetsRelics).length
  const s1 = relicSetIndex % numSetsR
  const s2 = ((relicSetIndex - s1) / numSetsR) % numSetsR
  const s3 = ((relicSetIndex - s2 * numSetsR - s1) / (numSetsR * numSetsR)) % numSetsR
  const s4 = ((relicSetIndex - s3 * numSetsR * numSetsR - s2 * numSetsR - s1) / (numSetsR * numSetsR * numSetsR)) % numSetsR
  const relicSets = [s1, s2, s3, s4]
  return calculateRelicSets(relicSets)
}

export function ornamentSetIndexToName(ornamentSetIndex: number) {
  const ornamentSetCount = Object.values(SetsOrnaments).length
  const os1 = ornamentSetIndex % ornamentSetCount
  const os2 = ((ornamentSetIndex - os1) / ornamentSetCount) % ornamentSetCount
  return calculateOrnamentSets([os1, os2], false)
}

export function convertRelicsToSimulation(
  relicsByPart: Partial<SingleRelicByPart>,
  relicSet1: string,
  relicSet2: string,
  ornamentSet?: string,
  quality = 1,
  speedRollValue = 2.6,
) {
  const relics = Object.values(relicsByPart)
  const accumulatedSubstatRolls = Object.fromEntries(SubStats.map((x) => [x, 0])) as Record<SubStats, number>

  // Sum up substat rolls
  for (const relic of relics) {
    if (relic && relic.substats) {
      for (const substat of relic.substats) {
        accumulatedSubstatRolls[substat.stat] += substat.value
          / (substat.stat === Stats.SPD ? speedRollValue : StatCalculator.getMaxedSubstatValue(substat.stat, quality))
      }
    }
  }

  // Round them to 4 precision
  SubStats.forEach((x) => accumulatedSubstatRolls[x] = precisionRound(accumulatedSubstatRolls[x], 4))

  // Generate the fake request and submit it
  return {
    name: '',
    simRelicSet1: relicSet1,
    simRelicSet2: relicSet2,
    simOrnamentSet: ornamentSet,
    simBody: relicsByPart[Parts.Body]?.main?.stat || null,
    simFeet: relicsByPart[Parts.Feet]?.main?.stat || null,
    simPlanarSphere: relicsByPart[Parts.PlanarSphere]?.main?.stat || null,
    simLinkRope: relicsByPart[Parts.LinkRope]?.main?.stat || null,
    stats: {
      [Stats.HP]: accumulatedSubstatRolls[Stats.HP] || null,
      [Stats.ATK]: accumulatedSubstatRolls[Stats.ATK] || null,
      [Stats.DEF]: accumulatedSubstatRolls[Stats.DEF] || null,
      [Stats.HP_P]: accumulatedSubstatRolls[Stats.HP_P] || null,
      [Stats.ATK_P]: accumulatedSubstatRolls[Stats.ATK_P] || null,
      [Stats.DEF_P]: accumulatedSubstatRolls[Stats.DEF_P] || null,
      [Stats.CR]: accumulatedSubstatRolls[Stats.CR] || null,
      [Stats.CD]: accumulatedSubstatRolls[Stats.CD] || null,
      [Stats.SPD]: accumulatedSubstatRolls[Stats.SPD] || null,
      [Stats.EHR]: accumulatedSubstatRolls[Stats.EHR] || null,
      [Stats.RES]: accumulatedSubstatRolls[Stats.RES] || null,
      [Stats.BE]: accumulatedSubstatRolls[Stats.BE] || null,
    },
  }
}

function calculateRelicSets(relicSets: (string | number)[], nameProvided = false) {
  const relicSetNames: string[] = []
  while (relicSets.length > 0) {
    const value = relicSets[0]
    if (relicSets.indexOf(value) !== relicSets.lastIndexOf(value)) {
      const setName = nameProvided ? value : Object.entries(RelicSetToIndex).find((x) => x[1] === value)![0]
      relicSetNames.push(setName as string)

      const otherIndex = relicSets.lastIndexOf(value)
      relicSets.splice(otherIndex, 1)
    }
    relicSets.splice(0, 1)
  }

  return relicSetNames
}

function calculateOrnamentSets(ornamentSets: unknown[], nameProvided = true): string | undefined {
  if (ornamentSets[0] != null && ornamentSets[0] === ornamentSets[1]) {
    return (
      nameProvided
        ? ornamentSets[1] as string
        : Object.entries(OrnamentSetToIndex).find((x) => x[1] === ornamentSets[1])![0]
    )
  }
  return undefined
}
