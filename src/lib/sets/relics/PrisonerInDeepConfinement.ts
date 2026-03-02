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
  return Array.from({ length: 4 }).map((_val, i) => ({
    display: t('Prisoner.Display', { stackCount: i }),
    value: i,
    label: t('Prisoner.Label', { stackCount: i, buffValue: 6 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.PrisonerInDeepConfinement)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, 0.06 * setConditionals.valuePrisonerInDeepConfinement, x.source(Source.PrisonerInDeepConfinement))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 0,
}

export const PrisonerInDeepConfinement: SetConfig = {
  id: 'PrisonerInDeepConfinement',
  info: {
    index: 15,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
