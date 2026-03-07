import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
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
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 2,
  setType: SetType.RELIC,
  ingameId: '103',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.DEF_P.buff(0.15, Source.KnightOfPurityPalace)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.outputType(OutputTag.SHIELD).source(Source.KnightOfPurityPalace))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.DEF_P, 0.15, KnightOfPurityPalace),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_KnightOfPurityPalace) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.20).outputType(OutputTag.SHIELD).wgsl(action, 2)}
    }
  `,
}

export const KnightOfPurityPalace = {
  id: Sets.KnightOfPurityPalace,
  setKey: 'KnightOfPurityPalace',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
