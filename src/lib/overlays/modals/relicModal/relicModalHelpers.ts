import {
  type MainStats,
  Parts,
  Stats,
  type SubStats,
} from 'lib/constants/constants'
import {
  precisionRound,
  truncate1000ths,
  truncate10ths,
} from 'lib/utils/mathUtils'
import { objectHash } from 'lib/utils/objectUtils'
import { isFlat } from 'lib/utils/statUtils'
import type { Relic } from 'types/relic'
import type { SubstatValues } from './relicModalTypes'

export const defaultMainStatPerPart = {
  [Parts.Head]: Stats.HP,
  [Parts.Hands]: Stats.ATK,
  [Parts.Body]: Stats.HP_P,
  [Parts.Feet]: Stats.HP_P,
  [Parts.PlanarSphere]: Stats.HP_P,
  [Parts.LinkRope]: Stats.HP_P,
}

function statUsesDecimal(stat: string | undefined, verified: boolean): boolean {
  if (!stat) return false
  if (stat === Stats.SPD) return verified
  return !isFlat(stat)
}

export function defaultSubstatValues(relic: Relic): SubstatValues {
  const substatCount = relic.substats.length
  return relic.substats.concat(relic.previewSubstats).reduce((acc, _, idx) => {
    const isPreview = idx >= substatCount
    const substat = isPreview ? renderPreviewSubstat(relic, idx - substatCount) : renderSubstat(relic, idx)
    switch (idx) {
      case 0:
      case 1:
      case 2:
      case 3:
        acc[`substatType${idx}`] = substat?.stat
        const rawValue = isPreview ? 0 : substat?.value
        acc[`substatValue${idx}`] = (!isPreview && statUsesDecimal(substat?.stat, !!relic.verified))
          ? rawValue!.toFixed(1)
          : rawValue?.toString()
        acc[`substat${idx}IsPreview`] = isPreview ? substat?.value : isPreview
        break
      default:
        throw new Error('RelicModal::defaultSubstatValues: Illegal index reached in relic substat iterator')
    }
    return acc
  }, {} as SubstatValues)
}

export function renderMainStat(relic: Relic): { stat: MainStats, value: number } | undefined {
  const mainStat = relic.main?.stat
  const mainValue = relic.main?.value

  if (!mainStat) return

  return renderStat(mainStat, mainValue)
}

function renderPreviewSubstat(relic: Relic, index: number) {
  const substat = relic.previewSubstats[index]
  if (!substat?.stat) return

  const stat = substat.stat
  const value = substat.value

  return renderStat(stat, value, relic) as { stat: SubStats, value: number }
}

function renderSubstat(relic: Relic, index: number) {
  const substat = relic.substats[index]
  if (!substat?.stat) return

  const stat = substat.stat
  const value = substat.value

  return renderStat(stat, value, relic) as { stat: SubStats, value: number }
}

function renderStat<S extends SubStats | MainStats>(stat: S, value: number, relic?: Relic): { stat: S, value: number } {
  if (stat === Stats.SPD) {
    if (relic?.verified) {
      return {
        stat: stat,
        value: truncate10ths(value),
      }
    } else {
      return {
        stat: stat,
        value: value % 1 !== 0 ? truncate10ths(Number(value.toFixed(1))) : Math.floor(value),
      }
    }
  } else if (isFlat(stat)) {
    return {
      stat: stat,
      value: Math.floor(value),
    }
  } else {
    return {
      stat: stat,
      value: truncate10ths(precisionRound(Math.floor(value * 10) / 10)),
    }
  }
}

function relicHash(relic: Relic) {
  return objectHash({
    grade: relic.grade,
    enhance: relic.enhance,
    part: relic.part,
    set: relic.set,
    mainStatType: relic.main?.stat,
    substats: relic.substats.map((stat) => ({
      stat: stat.stat,
      value: truncate1000ths(precisionRound(stat.value)),
    })),
  })
}

export function relicsAreDifferent(relic1: Relic | null, relic2: Relic | null) {
  if (!relic1 || !relic2) return true

  const relic1Hash = relicHash(relic1)
  const relic2Hash = relicHash(relic2)

  return relic1Hash !== relic2Hash
}
