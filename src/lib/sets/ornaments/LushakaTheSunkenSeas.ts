import { ConditionalDataType, Sets } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  OptimizerContext,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
  TeammateOption,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.LushakaTheSunkenSeas)
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Lushaka',
  defaultValue: false,
}

export const LushakaTheSunkenSeas: SetConfig = {
  id: 'LushakaTheSunkenSeas',
  info: {
    index: 16,
    setType: SetType.ORNAMENT,
    ingameId: '317',
  },
  conditionals,
  display,
  teammate: [{
    value: Sets.LushakaTheSunkenSeas,
    i18nKey: 'Lushaka',
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.ATK_P, 0.12, x.source(Source.LushakaTheSunkenSeas))
    },
  }],
}
