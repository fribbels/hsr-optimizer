import {
  ConditionalDataType,
  Sets,
  Stats,
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
  index: 9,
  setType: SetType.RELIC,
  ingameId: '110',
  name: Sets.EagleOfTwilightLine,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Wind_DMG) {
      c.WIND_DMG_BOOST.buff(0.10, Source.EagleOfTwilightLine)
    }
  },
} as const satisfies SetConditionals

export const EagleOfTwilightLine = {
  id: 'EagleOfTwilightLine',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
