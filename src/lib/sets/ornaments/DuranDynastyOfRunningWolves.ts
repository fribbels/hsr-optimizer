import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SelectOptionContent,
  type SetConditionalTFunction,
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'
import { precisionRound } from 'lib/utils/mathUtils'

const info = {
  index: 14,
  setType: SetType.ORNAMENT,
  ingameId: '315',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Duran',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 5,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, x.damageType(DamageTag.FUA).source(Source.DuranDynastyOfRunningWolves))
    if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
      x.buff(StatKey.CD, 0.25, x.source(Source.DuranDynastyOfRunningWolves))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (ornament2p(*p_sets, SET_DuranDynastyOfRunningWolves) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, `0.05 * f32(setConditionals.valueDuranDynastyOfRunningWolves)`).damageType(DamageTag.FUA).wgsl(action, 2)}
      if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
        ${buff.action(AKey.CD, 0.25).wgsl(action, 3)}
      }
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => {
    const label = i === 5 ? t('Duran.Label5') : t('Duran.Label', { stackCount: i, buffValue: precisionRound(5 * i) })
    return {
      display: t('Duran.Display', { stackCount: i }),
      value: i,
      label,
    }
  })
}

export const DuranDynastyOfRunningWolves = {
  id: Sets.DuranDynastyOfRunningWolves,
  setKey: 'DuranDynastyOfRunningWolves',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
