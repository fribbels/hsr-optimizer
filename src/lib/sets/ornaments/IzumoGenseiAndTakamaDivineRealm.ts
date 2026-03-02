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
    c.ATK_P.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
      x.buff(StatKey.CR, 0.12, x.source(Source.IzumoGenseiAndTakamaDivineRealm))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const IzumoGenseiAndTakamaDivineRealm: SetConfig = {
  id: 'IzumoGenseiAndTakamaDivineRealm',
  info: {
    index: 13,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
