import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.DEF_P.buff(0.15, Source.KnightOfPurityPalace)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.outputType(OutputTag.SHIELD).source(Source.KnightOfPurityPalace))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_KnightOfPurityPalace) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.20).outputType(OutputTag.SHIELD).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

export const KnightOfPurityPalace = {
  id: 'KnightOfPurityPalace',
  info: {
    index: 2,
    setType: SetType.RELIC,
    ingameId: '103',
  },
  conditionals,
  display,
} as const satisfies SetConfig
