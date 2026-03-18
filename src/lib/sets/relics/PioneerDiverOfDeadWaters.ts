import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { basicP4 } from 'lib/gpu/injection/generateBasicSetEffects'
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
  index: 16,
  setType: SetType.RELIC,
  ingameId: '117',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Diver',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
      x.buff(StatKey.DMG_BOOST, 0.12, x.source(Source.PioneerDiverOfDeadWaters))
    }
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.04, Source.PioneerDiverOfDeadWaters)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD_BOOST, pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters], x.source(Source.PioneerDiverOfDeadWaters))
    if (setConditionals.valuePioneerDiverOfDeadWaters > 2) {
      x.buff(StatKey.CR, 0.04, x.source(Source.PioneerDiverOfDeadWaters))
    }
  },
  gpuBasic: () => [
    basicP4(WgslStatName.CR, 0.04, PioneerDiverOfDeadWaters),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic2p(*p_sets, SET_PioneerDiverOfDeadWaters) >= 1 && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
      ${buff.action(AKey.DMG_BOOST, 0.12).wgsl(action, 2)}
      if (relic4p(*p_sets, SET_PioneerDiverOfDeadWaters) >= 1) {
        ${buff.action(AKey.CD_BOOST, `getPioneerSetValue(setConditionals.valuePioneerDiverOfDeadWaters)`).wgsl(action, 3)}
        if (setConditionals.valuePioneerDiverOfDeadWaters > 2) {
          ${buff.action(AKey.CR, 0.04).wgsl(action, 4)}
        }
      }
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    {
      display: t('Diver.Off.Display'),
      value: -1,
      label: t('Diver.Off.Label'),
    },
    {
      display: t('Diver.1Debuff.Display'),
      value: 0,
      label: t('Diver.1Debuff.Label'),
    },
    {
      display: t('Diver.2Debuff.Display'),
      value: 1,
      label: t('Diver.2Debuff.Label'),
    },
    {
      display: t('Diver.3Debuff.Display'),
      value: 2,
      label: t('Diver.3Debuff.Label'),
    },
    {
      display: t('Diver.2+Debuff.Display'),
      value: 3,
      label: t('Diver.2+Debuff.Label'),
    },
    {
      display: t('Diver.3+Debuff.Display'),
      value: 4,
      label: t('Diver.3+Debuff.Label'),
    },
  ]
}

export const PioneerDiverOfDeadWaters = {
  id: Sets.PioneerDiverOfDeadWaters,
  setKey: 'PioneerDiverOfDeadWaters',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
