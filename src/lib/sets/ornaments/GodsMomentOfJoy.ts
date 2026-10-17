import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { type OptimizerContext } from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 28,
  setType: SetType.ORNAMENT,
  ingameId: '329',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.GodsMomentOfJoy)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, GodsMomentOfJoy),
  ],
}

export const GodsMomentOfJoy = {
  id: Sets.GodsMomentOfJoy,
  setKey: 'GodsMomentOfJoy',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
