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
  index: 11,
  setType: SetType.RELIC,
  ingameId: '112',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Wastelander',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 1,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Imaginary_DMG) {
      c.IMAGINARY_DMG_BOOST.buff(0.10, Source.WastelanderOfBanditryDesert)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD_BOOST, 0.20 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0), x.source(Source.WastelanderOfBanditryDesert))
    if (setConditionals.valueWastelanderOfBanditryDesert > 0) {
      x.buff(StatKey.CR_BOOST, 0.10, x.source(Source.WastelanderOfBanditryDesert))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.IMAGINARY_DMG_BOOST, 0.10, WastelanderOfBanditryDesert),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_WastelanderOfBanditryDesert) >= 1) {
      if (setConditionals.valueWastelanderOfBanditryDesert > 0) {
        ${buff.action(AKey.CR_BOOST, 0.10).wgsl(action, 3)}
      }
      if (setConditionals.valueWastelanderOfBanditryDesert == 2) {
        ${buff.action(AKey.CD_BOOST, 0.20).wgsl(action, 3)}
      }
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    {
      display: t('Wastelander.Off.Display'),
      value: 0,
      label: t('Wastelander.Off.Label'),
    },
    {
      display: t('Wastelander.Debuffed.Display'),
      value: 1,
      label: t('Wastelander.Debuffed.Label'),
    },
    {
      display: t('Wastelander.Imprisoned.Display'),
      value: 2,
      label: t('Wastelander.Imprisoned.Label'),
    },
  ]
}

export const WastelanderOfBanditryDesert = {
  id: Sets.WastelanderOfBanditryDesert,
  setKey: 'WastelanderOfBanditryDesert',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
