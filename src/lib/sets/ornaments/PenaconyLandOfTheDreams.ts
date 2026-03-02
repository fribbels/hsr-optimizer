import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
    c.ERR.buff(0.05, Source.PenaconyLandOfTheDreams)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledPenaconyLandOfTheDreams) {
      x.buff(StatKey.DMG_BOOST, 0.10, x.targets(TargetTag.Memosprite).source(Source.PenaconyLandOfTheDreams))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const PenaconyLandOfTheDreams: SetConfig = {
  id: 'PenaconyLandOfTheDreams',
  info: {
    index: 11,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
