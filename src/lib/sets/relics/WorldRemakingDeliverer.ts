import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
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
    c.CR.buff(0.08, Source.WorldRemakingDeliverer)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWorldRemakingDeliverer) {
      x.buff(StatKey.HP_P, 0.24, x.targets(TargetTag.SelfAndMemosprite).source(Source.WorldRemakingDeliverer))
      if (!x.config.teammateSetEffects[Sets.WorldRemakingDeliverer]) {
        x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
      }
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const WorldRemakingDeliverer: SetConfig = {
  id: 'WorldRemakingDeliverer',
  info: {
    index: 26,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
