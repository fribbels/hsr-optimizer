import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  index: 3,
  setType: SetType.RELIC,
  ingameId: '104',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Hunter',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Ice_DMG) {
      c.ICE_DMG_BOOST.buff(0.10, Source.HunterOfGlacialForest)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledHunterOfGlacialForest) {
      x.buff(StatKey.CD, 0.25, x.source(Source.HunterOfGlacialForest))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ICE_DMG_BOOST, 0.10, HunterOfGlacialForest),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_HunterOfGlacialForest) >= 1
      && setConditionals.enabledHunterOfGlacialForest == true
    ) {
      ${buff.action(AKey.CD, 0.25).wgsl(action, 2)}
    }
  `,
}

export const HunterOfGlacialForest = {
  id: Sets.HunterOfGlacialForest,
  setKey: 'HunterOfGlacialForest',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
