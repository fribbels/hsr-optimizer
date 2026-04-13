import { type TFunction } from 'i18next'
import {
  type MainStatParts,
  MainStatPartsArray,
  type MainStats,
  Parts,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import {
  memo,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import classes from './MainStatsSummary.module.css'

type MainStatsSummaryProps = {
  simBody: string,
  simFeet: string,
  simPlanarSphere: string,
  simLinkRope: string,
  promise?: never,
  mode?: never,
} | {
  simBody?: never,
  simFeet?: never,
  simPlanarSphere?: never,
  simLinkRope?: never,
  promise: Promise<SimulationScore | null>,
  mode: 'Benchmark' | 'Perfect',
}
export const MainStatsSummary = memo(function MainStatsSummary({
  simBody,
  simFeet,
  simPlanarSphere,
  simLinkRope,
  promise,
  mode,
}: MainStatsSummaryProps) {
  const { t } = useTranslation('common')

  const partToStat: Record<MainStatParts, MainStats> | null = promise ? null : {
    [Parts.Body]: simBody as MainStats,
    [Parts.Feet]: simFeet as MainStats,
    [Parts.LinkRope]: simLinkRope as MainStats,
    [Parts.PlanarSphere]: simPlanarSphere as MainStats,
  }

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        {MainStatPartsArray.map((part) => {
          return (
            <div key={part} className={classes.row}>
              <img src={Assets.getPart(part)} className={classes.partImage} />
              {promise
                ? <SuspenseNode promise={promise} selector={selector(part, mode, t)} />
                : (
                  <span className={classes.statName}>
                    {partToStat![part] ? t(`ReadableStats.${partToStat![part]}`).replace('Boost', '') : ''}
                  </span>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

const partToSelectorString = {
  [Parts.Body]: 'simBody',
  [Parts.Feet]: 'simFeet',
  [Parts.LinkRope]: 'simLinkRope',
  [Parts.PlanarSphere]: 'simPlanarSphere',
} as const

function selector(
  part: MainStatParts,
  mode: 'Benchmark' | 'Perfect',
  t: TFunction<'common', undefined>,
): (result: SimulationScore | null) => ReactNode {
  const selectorString = mode === 'Benchmark' ? 'benchmarkSim' : 'maximumSim'
  return function(result: SimulationScore | null) {
    if (result === null) return null
    const stat = result[selectorString].request[partToSelectorString[part]] as MainStats
    return (
      <span className={classes.statName}>
        {stat ? t(`ReadableStats.${stat}`).replace('Boost', '') : ''}
      </span>
    )
  }
}
