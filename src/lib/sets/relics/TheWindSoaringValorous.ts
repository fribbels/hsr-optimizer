import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  basicP2,
  basicP4,
} from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 19,
  setType: SetType.RELIC,
  ingameId: '120',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Valorous',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

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
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, TheWindSoaringValorous),
    basicP4(WgslStatName.CR, 0.06, TheWindSoaringValorous),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_TheWindSoaringValorous) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, `0.36 * f32(setConditionals.enabledTheWindSoaringValorous)`).damageType(DamageTag.ULT).wgsl(action, 2)}
    }
  `,
}

export const TheWindSoaringValorous = {
  id: Sets.TheWindSoaringValorous,
  setKey: 'TheWindSoaringValorous',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
