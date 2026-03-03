import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 21,
  setType: SetType.RELIC,
  ingameId: '122',
  name: Sets.ScholarLostInErudition,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Scholar',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.ScholarLostInErudition)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.ULT | DamageTag.SKILL).source(Source.ScholarLostInErudition))
    if (setConditionals.enabledScholarLostInErudition) {
      x.buff(StatKey.DMG_BOOST, 0.25, x.damageType(DamageTag.SKILL).source(Source.ScholarLostInErudition))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_ScholarLostInErudition) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.SKILL | DamageTag.ULT).wgsl(action, 2)}
      if (setConditionals.enabledScholarLostInErudition == true) {
        ${buff.hit(HKey.DMG_BOOST, 0.25).damageType(DamageTag.SKILL).wgsl(action, 3)}
      }
    }
  `,
} as const satisfies SetConditionals

export const ScholarLostInErudition = {
  id: 'ScholarLostInErudition',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
