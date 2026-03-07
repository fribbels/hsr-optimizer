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
  index: 20,
  setType: SetType.ORNAMENT,
  ingameId: '321',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Arcadia',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 4,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(
      StatKey.DMG_BOOST,
      arcadiaSetIndexToDmg[setConditionals.valueArcadiaOfWovenDreams],
      x.targets(TargetTag.SelfAndMemosprite).source(Source.ArcadiaOfWovenDreams),
    )
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (ornament2p(*p_sets, SET_ArcadiaOfWovenDreams) >= 1) {
      let arcadiaBuffValue = getArcadiaOfWovenDreamsValue(setConditionals.valueArcadiaOfWovenDreams);
      ${buff.action(AKey.DMG_BOOST, 'arcadiaBuffValue').targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 8 }).map((_val, i) => {
    const allyCount = i + 1
    return {
      display: t('Arcadia.Display', { allyCount }),
      value: allyCount,
      label: t('Arcadia.Label', {
        buffValue: Math.max(12 * (4 - allyCount), 9 * (allyCount - 4)),
        allyCount,
      }),
    }
  })
}

const arcadiaSetIndexToDmg: Record<number, number> = {
  1: 0.36,
  2: 0.24,
  3: 0.12,
  4: 0.00,
  5: 0.09,
  6: 0.18,
  7: 0.27,
  8: 0.36,
}

export const ArcadiaOfWovenDreams = {
  id: Sets.ArcadiaOfWovenDreams,
  setKey: 'ArcadiaOfWovenDreams',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
