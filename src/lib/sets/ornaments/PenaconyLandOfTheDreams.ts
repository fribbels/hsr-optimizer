import { ConditionalDataType, Sets } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
  TeammateOption,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ERR.buff(0.05, Source.PenaconyLandOfTheDreams)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledPenaconyLandOfTheDreams) {
      x.buff(StatKey.DMG_BOOST, 0.10, x.targets(TargetTag.Memosprite).source(Source.PenaconyLandOfTheDreams))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_PenaconyLandOfTheDreams) >= 1
      && setConditionals.enabledPenaconyLandOfTheDreams == true
    ) {
      ${buff.action(AKey.DMG_BOOST, 0.10).targets(TargetTag.Memosprite).wgsl(action, 2)}
    }
  `,
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Penacony',
  modifiable: true,
  defaultValue: true,
}

export const PenaconyLandOfTheDreams: SetConfig = {
  id: 'PenaconyLandOfTheDreams',
  info: {
    index: 11,
    setType: SetType.ORNAMENT,
    ingameId: '312',
  },
  conditionals,
  display,
  teammate: [{
    value: Sets.PenaconyLandOfTheDreams,
    i18nKey: 'Penacony',
    nonstackable: false,
    effect: ({ x, characterElement, teammateElement }) => {
      if (characterElement != teammateElement) return
      x.buff(StatKey.DMG_BOOST, 0.10, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(Source.PenaconyLandOfTheDreams))
    },
  }],
}
