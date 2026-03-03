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
  index: 10,
  setType: SetType.RELIC,
  ingameId: '111',
  name: Sets.ThiefOfShootingMeteor,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
} as const satisfies SetConditionals

export const ThiefOfShootingMeteor = {
  id: 'ThiefOfShootingMeteor',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
