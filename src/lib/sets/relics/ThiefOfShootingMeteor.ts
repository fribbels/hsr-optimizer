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

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const ThiefOfShootingMeteor: SetConfig = {
  id: 'ThiefOfShootingMeteor',
  info: {
    index: 10,
    setType: SetType.RELIC,
    ingameId: '111',
  },
  conditionals,
  display,
}
