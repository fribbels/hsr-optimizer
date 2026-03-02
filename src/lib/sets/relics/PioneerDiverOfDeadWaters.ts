import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SelectOptionContent } from 'lib/optimization/rotation/setConditionalContent'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
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
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
}

export const PioneerDiverOfDeadWaters: SetConfig = {
  id: 'PioneerDiverOfDeadWaters',
  info: {
    index: 16,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
