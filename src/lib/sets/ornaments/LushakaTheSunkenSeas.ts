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
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 16,
  setType: SetType.ORNAMENT,
  ingameId: '317',
  name: Sets.LushakaTheSunkenSeas,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Lushaka',
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.LushakaTheSunkenSeas)
  },
  teammate: [{
    value: Sets.LushakaTheSunkenSeas,
    label: (t) => t('TeammateSets.Lushaka.Text'),
    desc: (t) => t('TeammateSets.Lushaka.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.ATK_P, 0.12, x.source(Source.LushakaTheSunkenSeas))
    },
  }],
} as const satisfies SetConditionals

export const LushakaTheSunkenSeas = {
  id: 'LushakaTheSunkenSeas',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
