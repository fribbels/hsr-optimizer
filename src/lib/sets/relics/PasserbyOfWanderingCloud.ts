import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
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
} as const satisfies SetConditionals

export const PasserbyOfWanderingCloud = {
  id: 'PasserbyOfWanderingCloud',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
