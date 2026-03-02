import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SelectOptionContent } from 'lib/optimization/rotation/setConditionalContent'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Sacerdos.Display', { stackCount: i }),
    value: i,
    label: t('Sacerdos.Label', { stackCount: i, buffValue: 18 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD, 0.18 * setConditionals.valueSacerdosRelivedOrdeal, x.source(Source.SacerdosRelivedOrdeal))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 0,
}

export const SacerdosRelivedOrdeal: SetConfig = {
  id: 'SacerdosRelivedOrdeal',
  info: {
    index: 20,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
