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
    c.ATK_P.buff(0.12, Source.RevelryByTheSea)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const atk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)
    if (atk >= 3600) {
      x.buff(StatKey.DMG_BOOST, 0.24, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
    } else if (atk >= 2400) {
      x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const RevelryByTheSea: SetConfig = {
  id: 'RevelryByTheSea',
  info: {
    index: 21,
    setType: SetType.ORNAMENT,
    ingameId: '322',
  },
  conditionals,
  display,
}
