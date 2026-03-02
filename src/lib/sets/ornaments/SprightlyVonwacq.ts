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
    c.ERR.buff(0.05, Source.SprightlyVonwacq)
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const SprightlyVonwacq: SetConfig = {
  id: 'SprightlyVonwacq',
  info: {
    index: 7,
    setType: SetType.ORNAMENT,
    ingameId: '308',
  },
  conditionals,
  display,
}
