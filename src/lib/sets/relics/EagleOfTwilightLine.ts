import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
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
  index: 9,
  setType: SetType.RELIC,
  ingameId: '110',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Wind_DMG) {
      c.WIND_DMG_BOOST.buff(0.10, Source.EagleOfTwilightLine)
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.WIND_DMG_BOOST, 0.10, EagleOfTwilightLine),
  ],
}

export const EagleOfTwilightLine = {
  id: Sets.EagleOfTwilightLine,
  setKey: 'EagleOfTwilightLine',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
