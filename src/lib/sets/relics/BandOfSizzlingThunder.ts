import {
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
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
    if (context.elementalDamageType == Stats.Lightning_DMG) {
      c.LIGHTNING_DMG_BOOST.buff(0.10, Source.BandOfSizzlingThunder)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledBandOfSizzlingThunder) {
      x.buff(StatKey.ATK_P, 0.20, x.source(Source.BandOfSizzlingThunder))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const BandOfSizzlingThunder: SetConfig = {
  id: 'BandOfSizzlingThunder',
  info: {
    index: 8,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
