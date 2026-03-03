import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
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
  index: 16,
  setType: SetType.RELIC,
  ingameId: '117',
  name: Sets.PioneerDiverOfDeadWaters,
} as const satisfies SetInfo

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Diver',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

const conditionals = {
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
} as const satisfies SetConditionals

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
  id: 'PioneerDiverOfDeadWaters',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
