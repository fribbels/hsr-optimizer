import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.ForgeOfTheKalpagniLantern)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledForgeOfTheKalpagniLantern) {
      x.buff(StatKey.BE, 0.40, x.source(Source.ForgeOfTheKalpagniLantern))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: false,
}

export const ForgeOfTheKalpagniLantern: SetConfig = {
  id: 'ForgeOfTheKalpagniLantern',
  info: {
    index: 15,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
