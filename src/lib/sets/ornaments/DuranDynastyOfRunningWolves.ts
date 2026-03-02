import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => {
    const label = i === 5 ? t('Duran.Label5') : t('Duran.Label', { stackCount: i, buffValue: TsUtils.precisionRound(5 * i) })
    return {
      display: t('Duran.Display', { stackCount: i }),
      value: i,
      label,
    }
  })
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, x.damageType(DamageTag.FUA).source(Source.DuranDynastyOfRunningWolves))
    if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
      x.buff(StatKey.CD, 0.25, x.source(Source.DuranDynastyOfRunningWolves))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 5,
}

export const DuranDynastyOfRunningWolves: SetConfig = {
  id: 'DuranDynastyOfRunningWolves',
  info: {
    index: 14,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
