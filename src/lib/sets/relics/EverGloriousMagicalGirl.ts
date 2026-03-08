import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionalTFunction,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 28,
  setType: SetType.RELIC,
  ingameId: '129',
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
    x.buff(StatKey.DEF_PEN, 0.10 + 0.01 * setConditionals.valueEverGloriousMagicalGirl,
      x.damageType(DamageTag.ELATION).targets(TargetTag.SelfAndMemosprite).source(Source.EverGloriousMagicalGirl))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CD, 0.16, EverGloriousMagicalGirl),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_EverGloriousMagicalGirl) >= 1) {
      ${buff.hit(HKey.DEF_PEN, `0.10 + 0.01 * f32(setConditionals.valueEverGloriousMagicalGirl)`).damageType(DamageTag.ELATION).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
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
