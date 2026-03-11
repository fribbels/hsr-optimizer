import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2, basicP4 } from 'lib/gpu/injection/generateBasicSetEffects'
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
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.BE, 0.16, ThiefOfShootingMeteor),
    basicP4(WgslStatName.BE, 0.16, ThiefOfShootingMeteor),
  ],
}

export const ThiefOfShootingMeteor = {
  id: Sets.ThiefOfShootingMeteor,
  setKey: 'ThiefOfShootingMeteor',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
