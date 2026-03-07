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
  id: 'PasserbyOfWanderingCloud',
  index: 0,
  setType: SetType.RELIC,
  ingameId: '101',
  name: Sets.PasserbyOfWanderingCloud,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.OHB.buff(0.10, Source.PasserbyOfWanderingCloud)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.OHB, 0.10, info),
  ],
} as const satisfies SetConditionals

export const PasserbyOfWanderingCloud = {
  id: 'PasserbyOfWanderingCloud',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
