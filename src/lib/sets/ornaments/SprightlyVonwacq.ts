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
  index: 7,
  setType: SetType.ORNAMENT,
  ingameId: '308',
  name: Sets.SprightlyVonwacq,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.SprightlyVonwacq)
  },
} as const satisfies SetConditionals

export const SprightlyVonwacq = {
  id: 'SprightlyVonwacq',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
