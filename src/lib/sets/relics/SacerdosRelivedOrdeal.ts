import {
  ConditionalDataType,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  index: 20,
  setType: SetType.RELIC,
  ingameId: '121',
  name: Sets.SacerdosRelivedOrdeal,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Sacerdos',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 0,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD, 0.18 * setConditionals.valueSacerdosRelivedOrdeal, x.source(Source.SacerdosRelivedOrdeal))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_SacerdosRelivedOrdeal) >= 1) {
      ${buff.action(AKey.CD, `0.18 * f32(setConditionals.valueSacerdosRelivedOrdeal)`).wgsl(action, 2)}
    }
  `,
  teammate: [
    {
      value: SACERDOS_RELIVED_ORDEAL_1_STACK,
      label: (t) => t('TeammateSets.Sacerdos1Stack.Text'),
      desc: (t) => t('TeammateSets.Sacerdos1Stack.Desc'),
      nonstackable: false,
      effect: ({ x, teammateActorId }) => {
        const SUNDAY_ID = '1313'
        if (teammateActorId == SUNDAY_ID) {
          x.buff(StatKey.CD, 0.18, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(Source.SacerdosRelivedOrdeal))
        } else {
          x.buff(StatKey.CD, 0.18, x.targets(TargetTag.SingleTarget).deferrable().source(Source.SacerdosRelivedOrdeal))
        }
      },
    },
    {
      value: SACERDOS_RELIVED_ORDEAL_2_STACK,
      label: (t) => t('TeammateSets.Sacerdos2Stack.Text'),
      desc: (t) => t('TeammateSets.Sacerdos2Stack.Desc'),
      nonstackable: false,
      effect: ({ x, teammateActorId }) => {
        const SUNDAY_ID = '1313'
        if (teammateActorId == SUNDAY_ID) {
          x.buff(StatKey.CD, 0.36, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(Source.SacerdosRelivedOrdeal))
        } else {
          x.buff(StatKey.CD, 0.36, x.targets(TargetTag.SingleTarget).deferrable().source(Source.SacerdosRelivedOrdeal))
        }
      },
    },
  ],
} as const satisfies SetConditionals

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Sacerdos.Display', { stackCount: i }),
    value: i,
    label: t('Sacerdos.Label', { stackCount: i, buffValue: 18 * i }),
  }))
}

export const SacerdosRelivedOrdeal = {
  id: 'SacerdosRelivedOrdeal',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
