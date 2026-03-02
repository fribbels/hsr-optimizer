import {
  ConditionalDataType,
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
  SetType,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Wind_DMG) {
      c.WIND_DMG_BOOST.buff(0.10, Source.EagleOfTwilightLine)
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const EagleOfTwilightLine: SetConfig = {
  id: 'EagleOfTwilightLine',
  info: {
    index: 9,
    setType: SetType.RELIC,
    ingameId: '110',
  },
  conditionals,
  display,
}
