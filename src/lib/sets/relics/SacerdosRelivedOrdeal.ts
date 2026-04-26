import {
  ConditionalDataType,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  index: 20,
  setType: SetType.RELIC,
  ingameId: '121',
  twoPieceStatTag: Stats.SPD_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Sacerdos',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 0,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const value = setConditionals.valueSacerdosRelivedOrdeal
    if (value === 1 || value === 2) {
      x.buff(StatKey.CD, 0.18 * value, x.source(Source.SacerdosRelivedOrdeal))
    } else if (value === 3 || value === 4) {
      const stacks = value - 2
      x.buff(StatKey.DMG_BOOST, 0.18 * stacks, x.outputBuff(StatKey.CD).source(Source.SacerdosRelivedOrdeal))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, SacerdosRelivedOrdeal),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_SacerdosRelivedOrdeal) >= 1) {
      let sacValue = i32(setConditionals.valueSacerdosRelivedOrdeal);
      if (sacValue == 1 || sacValue == 2) {
        ${buff.action(AKey.CD, `0.18 * f32(setConditionals.valueSacerdosRelivedOrdeal)`).wgsl(action, 2)}
      } else if (sacValue == 3 || sacValue == 4) {
        let sacStacks = f32(sacValue - 2);
        ${buff.hit(HKey.DMG_BOOST, `0.18 * sacStacks`).outputBuff(StatKey.CD).wgsl(action, 2)}
      }
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
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  const selfOptions = Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Sacerdos.Display', { stackCount: i }),
    value: i,
    label: t('Sacerdos.Label', { stackCount: i, buffValue: 18 * i }),
  }))
  const teammateOptions = [1, 2].map((stacks) => ({
    display: `${stacks} (teammate)`,
    value: stacks + 2,
    label: `${stacks} stack${stacks > 1 ? 's' : ''} (teammate buff) — ${18 * stacks}% CD`,
  }))
  return [...selfOptions, ...teammateOptions]
}

export const SacerdosRelivedOrdeal = {
  id: Sets.SacerdosRelivedOrdeal,
  setKey: 'SacerdosRelivedOrdeal',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
