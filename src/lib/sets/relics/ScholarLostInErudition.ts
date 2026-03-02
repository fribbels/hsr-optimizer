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
    c.CR.buff(0.08, Source.ScholarLostInErudition)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.ULT | DamageTag.SKILL).source(Source.ScholarLostInErudition))
    if (setConditionals.enabledScholarLostInErudition) {
      x.buff(StatKey.DMG_BOOST, 0.25, x.damageType(DamageTag.SKILL).source(Source.ScholarLostInErudition))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Scholar',
  modifiable: true,
  defaultValue: true,
}

export const ScholarLostInErudition: SetConfig = {
  id: 'ScholarLostInErudition',
  info: {
    index: 21,
    setType: SetType.RELIC,
    ingameId: '122',
  },
  conditionals,
  display,
}
