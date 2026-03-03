import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  index: 14,
  setType: SetType.RELIC,
  ingameId: '115',
  name: Sets.TheAshblazingGrandDuke,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Ashblazing',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 0,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(Source.TheAshblazingGrandDuke))
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.ATK_P, 0.06 * setConditionals.valueTheAshblazingGrandDuke, x.source(Source.TheAshblazingGrandDuke))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic2p(*p_sets, SET_TheAshblazingGrandDuke) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.FUA).wgsl(action, 2)}
      if (relic4p(*p_sets, SET_TheAshblazingGrandDuke) >= 1) {
        ${buff.action(AKey.ATK_P, `0.06 * f32(setConditionals.valueTheAshblazingGrandDuke)`).wgsl(action, 3)}
      }
    }
  `,
} as const satisfies SetConditionals

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 9 }).map((_val, i) => ({
    display: t('Ashblazing.Display', { stackCount: i }),
    value: i,
    label: t('Ashblazing.Label', { stackCount: i, buffValue: 6 * i }),
  }))
}

export const TheAshblazingGrandDuke = {
  id: 'TheAshblazingGrandDuke',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
