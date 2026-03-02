import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
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
    c.BE.buff(0.16, Source.IronCavalryAgainstTheScourge)
  },
  p4t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 1.50) {
      x.buff(StatKey.DEF_PEN, 0.10, x.damageType(DamageTag.BREAK).source(Source.IronCavalryAgainstTheScourge))
      if (x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 2.50) {
        x.buff(StatKey.DEF_PEN, 0.15, x.damageType(DamageTag.SUPER_BREAK).source(Source.IronCavalryAgainstTheScourge))
      }
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const IronCavalryAgainstTheScourge: SetConfig = {
  id: 'IronCavalryAgainstTheScourge',
  info: {
    index: 18,
    setType: SetType.RELIC,
    ingameId: '119',
  },
  conditionals,
  display,
}
