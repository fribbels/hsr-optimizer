import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionals,
  SetConditionalTFunction,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 25,
  setType: SetType.ORNAMENT,
  ingameId: '326',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.CityOfConvergingStars',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 3,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const val = setConditionals.valueCityOfConvergingStars

    // FUA ATK +24% (values 1, 3)
    if (val === 1 || val === 3) {
      x.buff(StatKey.ATK_P, 0.24, x.source(Source.CityOfConvergingStars))
    }

    // Enemy defeated: CRIT DMG +12% (values 2, 3)
    if (val === 2 || val === 3) {
      x.buff(StatKey.CD, 0.12, x.source(Source.CityOfConvergingStars))
    }
  },
  teammate: [{
    value: Sets.CityOfConvergingStars,
    label: (t) => t('TeammateSets.CityOfConvergingStars.Text'),
    desc: (t) => t('TeammateSets.CityOfConvergingStars.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.12, x.targets(TargetTag.FullTeam).source(Source.CityOfConvergingStars))
    },
  }],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (ornament2p(*p_sets, SET_CityOfConvergingStars) >= 1) {
      if (setConditionals.valueCityOfConvergingStars == 1 || setConditionals.valueCityOfConvergingStars == 3) {
        ${buff.action(AKey.ATK_P, 0.24).wgsl(action, 2)}
      }
      if (setConditionals.valueCityOfConvergingStars == 2 || setConditionals.valueCityOfConvergingStars == 3) {
        ${buff.action(AKey.CD, 0.12).wgsl(action, 3)}
      }
    }
  `,
}

// Selection values:
// 0 = Off (neither active)
// 1 = ATK only (FUA ATK buff active)
// 2 = CD only (enemy defeated CD buff active)
// 3 = ATK + CD (both active)

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    {
      display: t('CityOfConvergingStars.Off.Display'),
      value: 0,
      label: t('CityOfConvergingStars.Off.Label'),
    },
    {
      display: t('CityOfConvergingStars.AtkOnly.Display'),
      value: 1,
      label: t('CityOfConvergingStars.AtkOnly.Label'),
    },
    {
      display: t('CityOfConvergingStars.CdOnly.Display'),
      value: 2,
      label: t('CityOfConvergingStars.CdOnly.Label'),
    },
    {
      display: t('CityOfConvergingStars.Both.Display'),
      value: 3,
      label: t('CityOfConvergingStars.Both.Label'),
    },
  ]
}

export const CityOfConvergingStars = {
  id: Sets.CityOfConvergingStars,
  setKey: 'CityOfConvergingStars',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
