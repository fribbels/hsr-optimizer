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
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 17,
  setType: SetType.ORNAMENT,
  ingameId: '318',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Banana',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.TheWondrousBananAmusementPark)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledTheWondrousBananAmusementPark) {
      x.buff(StatKey.CD, 0.32, x.source(Source.TheWondrousBananAmusementPark))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CD, 0.16, TheWondrousBananAmusementPark),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_TheWondrousBananAmusementPark) >= 1
      && setConditionals.enabledTheWondrousBananAmusementPark == true
    ) {
      ${buff.action(AKey.CD, 0.32).wgsl(action, 2)}
    }
  `,
}

export const TheWondrousBananAmusementPark = {
  id: Sets.TheWondrousBananAmusementPark,
  setKey: 'TheWondrousBananAmusementPark',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
