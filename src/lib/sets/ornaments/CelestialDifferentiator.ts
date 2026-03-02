import { ConditionalDataType } from 'lib/constants/constants'
import {
  BasicKey,
  BasicStatsArray,
} from 'lib/optimization/basicStatsArray'
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
    c.CD.buff(0.16, Source.CelestialDifferentiator)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledCelestialDifferentiator && x.c.a[BasicKey.CD] >= 1.20) {
      x.buff(StatKey.CR, 0.60, x.source(Source.CelestialDifferentiator))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: false,
}

export const CelestialDifferentiator: SetConfig = {
  id: 'CelestialDifferentiator',
  info: {
    index: 4,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
