import { ConditionalDataType, Sets } from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
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
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Lushaka',
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.LushakaTheSunkenSeas)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ERR, 0.05, LushakaTheSunkenSeas),
  ],
  teammate: [{
    value: Sets.LushakaTheSunkenSeas,
    label: (t) => t('TeammateSets.Lushaka.Text'),
    desc: (t) => t('TeammateSets.Lushaka.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.ATK_P, 0.12, x.source(Source.LushakaTheSunkenSeas))
    },
  }],
}

export const LushakaTheSunkenSeas = {
  id: Sets.LushakaTheSunkenSeas,
  setKey: 'LushakaTheSunkenSeas',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
