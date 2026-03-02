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
    c.CR.buff(0.08, Source.RutilantArena)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.70) {
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(Source.RutilantArena))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const RutilantArena: SetConfig = {
  id: 'RutilantArena',
  info: {
    index: 8,
    setType: SetType.ORNAMENT,
    ingameId: '309',
  },
  conditionals,
  display,
}
