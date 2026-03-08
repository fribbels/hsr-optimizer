import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  OptimizerContext,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 0,
  setType: SetType.RELIC,
  ingameId: '101',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.OHB.buff(0.10, Source.PasserbyOfWanderingCloud)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.OHB, 0.10, PasserbyOfWanderingCloud),
  ],
}

export const PasserbyOfWanderingCloud = {
  id: Sets.PasserbyOfWanderingCloud,
  setKey: 'PasserbyOfWanderingCloud',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
