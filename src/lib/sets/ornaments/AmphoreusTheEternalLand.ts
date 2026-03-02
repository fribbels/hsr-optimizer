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
    c.CR.buff(0.08, Source.AmphoreusTheEternalLand)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.config.hasMemosprite && setConditionals.enabledAmphoreusTheEternalLand && !x.config.teammateSetEffects[Sets.AmphoreusTheEternalLand]) {
      x.buff(StatKey.SPD_P, 0.08, x.targets(TargetTag.FullTeam).source(Source.AmphoreusTheEternalLand))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: false,
}

export const AmphoreusTheEternalLand: SetConfig = {
  id: 'AmphoreusTheEternalLand',
  info: {
    index: 22,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
