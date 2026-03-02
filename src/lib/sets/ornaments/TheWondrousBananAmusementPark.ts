import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.TheWondrousBananAmusementPark)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledTheWondrousBananAmusementPark) {
      x.buff(StatKey.CD, 0.32, x.source(Source.TheWondrousBananAmusementPark))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_TheWondrousBananAmusementPark) >= 1
      && setConditionals.enabledTheWondrousBananAmusementPark == true
    ) {
      ${buff.action(AKey.CD, 0.32).wgsl(action, 2)}
    }
  `,
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Banana',
  modifiable: true,
  defaultValue: false,
}

export const TheWondrousBananAmusementPark: SetConfig = {
  id: 'TheWondrousBananAmusementPark',
  info: {
    index: 17,
    setType: SetType.ORNAMENT,
    ingameId: '318',
  },
  conditionals,
  display,
}
