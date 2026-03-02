import {
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
    if (context.elementalDamageType == Stats.Fire_DMG) {
      c.FIRE_DMG_BOOST.buff(0.10, Source.FiresmithOfLavaForging)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.SKILL).source(Source.FiresmithOfLavaForging))
    if (setConditionals.enabledFiresmithOfLavaForging) {
      x.buff(StatKey.FIRE_DMG_BOOST, 0.12, x.source(Source.FiresmithOfLavaForging))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
}

export const FiresmithOfLavaForging: SetConfig = {
  id: 'FiresmithOfLavaForging',
  info: {
    index: 6,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
