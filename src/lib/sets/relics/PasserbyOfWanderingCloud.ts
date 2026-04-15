import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  type OptimizerContext,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 0,
  setType: SetType.RELIC,
  ingameId: '101',
  twoPieceStatTag: Stats.OHB,
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
