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
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
} as const satisfies SetConditionals

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

export const ThiefOfShootingMeteor = {
  id: 'ThiefOfShootingMeteor',
  info: {
    index: 10,
    setType: SetType.RELIC,
    ingameId: '111',
  },
  conditionals,
  display,
} as const satisfies SetConfig
