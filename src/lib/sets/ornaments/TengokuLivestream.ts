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
    c.CD.buff(0.16, Source.TengokuLivestream)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledTengokuLivestream) {
      x.buff(StatKey.CD, 0.32, x.source(Source.TengokuLivestream))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Tengoku',
  modifiable: true,
  defaultValue: false,
}

export const TengokuLivestream: SetConfig = {
  id: 'TengokuLivestream',
  info: {
    index: 23,
    setType: SetType.ORNAMENT,
    ingameId: '324',
  },
  conditionals,
  display,
}
