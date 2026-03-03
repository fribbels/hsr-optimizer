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
  index: 19,
  setType: SetType.RELIC,
  ingameId: '120',
  name: Sets.TheWindSoaringValorous,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Valorous',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
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
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_TheWindSoaringValorous) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, `0.36 * f32(setConditionals.enabledTheWindSoaringValorous)`).damageType(DamageTag.ULT).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const TheWindSoaringValorous = {
  id: 'TheWindSoaringValorous',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
