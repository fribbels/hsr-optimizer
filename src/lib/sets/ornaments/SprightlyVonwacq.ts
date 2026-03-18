import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
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
  index: 7,
  setType: SetType.ORNAMENT,
  ingameId: '308',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.SprightlyVonwacq)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ERR, 0.05, SprightlyVonwacq),
  ],
}

export const SprightlyVonwacq = {
  id: Sets.SprightlyVonwacq,
  setKey: 'SprightlyVonwacq',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
