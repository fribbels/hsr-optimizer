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
    c.CR.buff(0.08, Source.InertSalsotto)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.50) {
      x.buff(StatKey.DMG_BOOST, 0.15, x.damageType(DamageTag.ULT | DamageTag.FUA).source(Source.InertSalsotto))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const InertSalsotto: SetConfig = {
  id: 'InertSalsotto',
  info: {
    index: 5,
    setType: SetType.ORNAMENT,
    ingameId: '306',
  },
  conditionals,
  display,
}
