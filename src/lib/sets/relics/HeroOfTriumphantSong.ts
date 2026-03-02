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
    c.ATK_P.buff(0.12, Source.HeroOfTriumphantSong)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledHeroOfTriumphantSong) {
      x.buff(StatKey.SPD_P, 0.06, x.source(Source.HeroOfTriumphantSong))
      x.buff(StatKey.CD, 0.30, x.targets(TargetTag.SelfAndMemosprite).source(Source.HeroOfTriumphantSong))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: false,
}

export const HeroOfTriumphantSong: SetConfig = {
  id: 'HeroOfTriumphantSong',
  info: {
    index: 22,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
