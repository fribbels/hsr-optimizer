import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  OptimizerContext,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.OHB.buff(0.10, Source.PasserbyOfWanderingCloud)
  },
} as const satisfies SetConditionals

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

export const PasserbyOfWanderingCloud = {
  id: 'PasserbyOfWanderingCloud',
  info: {
    index: 0,
    setType: SetType.RELIC,
    ingameId: '101',
  },
  conditionals,
  display,
} as const satisfies SetConfig
