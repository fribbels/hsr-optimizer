import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
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
  index: 9,
  setType: SetType.RELIC,
  ingameId: '110',
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
