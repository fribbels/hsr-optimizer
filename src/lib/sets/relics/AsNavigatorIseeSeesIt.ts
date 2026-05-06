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
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 30,
  setType: SetType.RELIC,
  ingameId: '131',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 3,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.AsNavigatorIseeSeesIt)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.18 * setConditionals.valueAsNavigatorIseeSeesIt, x.damageType(DamageTag.ULT).source(Source.AsNavigatorIseeSeesIt))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, AsNavigatorIseeSeesIt),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_AsNavigatorIseeSeesIt) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, `0.18 * f32(setConditionals.valueAsNavigatorIseeSeesIt)`).damageType(DamageTag.ULT).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(): SelectOptionContent[] {
  return Array.from({ length: 4 }).map((_val, i) => ({
    display: `${i}x`,
    value: i,
    label: `${i} stacks (+${18 * i}% ULT DMG)`,
  }))
}

export const AsNavigatorIseeSeesIt = {
  id: Sets.AsNavigatorIseeSeesIt,
  setKey: 'AsNavigatorIseeSeesIt',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
