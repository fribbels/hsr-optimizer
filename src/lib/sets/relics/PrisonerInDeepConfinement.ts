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
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
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
  index: 15,
  setType: SetType.RELIC,
  ingameId: '116',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Prisoner',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 0,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.PrisonerInDeepConfinement)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, 0.06 * setConditionals.valuePrisonerInDeepConfinement, x.source(Source.PrisonerInDeepConfinement))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, PrisonerInDeepConfinement),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_PrisonerInDeepConfinement) >= 1) {
      ${buff.action(AKey.DEF_PEN, `0.06 * f32(setConditionals.valuePrisonerInDeepConfinement)`).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 4 }).map((_val, i) => ({
    display: t('Prisoner.Display', { stackCount: i }),
    value: i,
    label: t('Prisoner.Label', { stackCount: i, buffValue: 6 * i }),
  }))
}

export const PrisonerInDeepConfinement = {
  id: Sets.PrisonerInDeepConfinement,
  setKey: 'PrisonerInDeepConfinement',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
