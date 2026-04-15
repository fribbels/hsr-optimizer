import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SelectOptionContent,
  type SetConditionals,
  type SetConditionalTFunction,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 28,
  setType: SetType.RELIC,
  ingameId: '129',
  twoPieceStatTag: Stats.CD,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.MagicalGirl',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 10,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.EverGloriousMagicalGirl)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(
      StatKey.DEF_PEN,
      0.10 + 0.01 * setConditionals.valueEverGloriousMagicalGirl,
      x.damageType(DamageTag.ELATION).targets(TargetTag.SelfAndMemosprite).source(Source.EverGloriousMagicalGirl),
    )
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CD, 0.16, EverGloriousMagicalGirl),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_EverGloriousMagicalGirl) >= 1) {
      ${
    buff.hit(HKey.DEF_PEN, `0.10 + 0.01 * f32(setConditionals.valueEverGloriousMagicalGirl)`).damageType(DamageTag.ELATION).targets(TargetTag.SelfAndMemosprite)
      .wgsl(action, 2)
  }
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('MagicalGirl.Display', { stackCount: i }),
    value: i,
    label: t('MagicalGirl.Label', { stackCount: i }),
  }))
}

export const EverGloriousMagicalGirl = {
  id: Sets.EverGloriousMagicalGirl,
  setKey: 'EverGloriousMagicalGirl',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
