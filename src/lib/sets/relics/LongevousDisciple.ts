import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Longevous.Display', { stackCount: i }),
    value: i,
    label: t('Longevous.Label', { stackCount: i, buffValue: 8 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.LongevousDisciple)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CR, 0.08 * setConditionals.valueLongevousDisciple, x.source(Source.LongevousDisciple))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
}

export const LongevousDisciple: SetConfig = {
  id: 'LongevousDisciple',
  info: {
    index: 12,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
