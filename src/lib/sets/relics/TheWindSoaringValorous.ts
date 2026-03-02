import { ConditionalDataType } from 'lib/constants/constants'
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
    c.ATK_P.buff(0.12, Source.TheWindSoaringValorous)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.06, Source.TheWindSoaringValorous)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledTheWindSoaringValorous) {
      x.buff(StatKey.DMG_BOOST, 0.36, x.damageType(DamageTag.ULT).source(Source.TheWindSoaringValorous))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Valorous',
  modifiable: true,
  defaultValue: false,
}

export const TheWindSoaringValorous: SetConfig = {
  id: 'TheWindSoaringValorous',
  info: {
    index: 19,
    setType: SetType.RELIC,
    ingameId: '120',
  },
  conditionals,
  display,
}
