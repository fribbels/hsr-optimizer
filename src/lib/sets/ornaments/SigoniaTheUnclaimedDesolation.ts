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
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('Sigonia.Display', { stackCount: i }),
    value: i,
    label: t('Sigonia.Label', { stackCount: i, buffValue: 4 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.04, Source.SigoniaTheUnclaimedDesolation)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD, 0.04 * setConditionals.valueSigoniaTheUnclaimedDesolation, x.source(Source.SigoniaTheUnclaimedDesolation))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 4,
}

export const SigoniaTheUnclaimedDesolation: SetConfig = {
  id: 'SigoniaTheUnclaimedDesolation',
  info: {
    index: 12,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
