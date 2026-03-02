import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BasicKey } from 'lib/optimization/basicStatsArray'
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
    c.SPD_P.buff(0.06, Source.DivinerOfDistantReach)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const spd = x.c.a[BasicKey.SPD]
    x.buff(StatKey.CR, (spd >= 120 ? 0.10 : 0) + (spd >= 160 ? 0.08 : 0),
      x.source(Source.DivinerOfDistantReach))
    if (setConditionals.enabledDivinerOfDistantReach && !x.config.teammateSetEffects[Sets.DivinerOfDistantReach]) {
      x.buff(StatKey.ELATION, 0.10, x.targets(TargetTag.FullTeam).source(Source.DivinerOfDistantReach))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const DivinerOfDistantReach: SetConfig = {
  id: 'DivinerOfDistantReach',
  info: {
    index: 29,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
