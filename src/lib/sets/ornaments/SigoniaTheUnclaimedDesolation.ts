import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
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
  index: 12,
  setType: SetType.ORNAMENT,
  ingameId: '313',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Sigonia',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 4,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.04, Source.SigoniaTheUnclaimedDesolation)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD, 0.04 * setConditionals.valueSigoniaTheUnclaimedDesolation, x.source(Source.SigoniaTheUnclaimedDesolation))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CR, 0.04, SigoniaTheUnclaimedDesolation),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (ornament2p(*p_sets, SET_SigoniaTheUnclaimedDesolation) >= 1) {
      ${buff.action(AKey.CD, `0.04 * f32(setConditionals.valueSigoniaTheUnclaimedDesolation)`).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('Sigonia.Display', { stackCount: i }),
    value: i,
    label: t('Sigonia.Label', { stackCount: i, buffValue: 4 * i }),
  }))
}

export const SigoniaTheUnclaimedDesolation = {
  id: Sets.SigoniaTheUnclaimedDesolation,
  setKey: 'SigoniaTheUnclaimedDesolation',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
