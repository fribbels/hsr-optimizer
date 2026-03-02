import { ConditionalDataType } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

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

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(
      StatKey.DMG_BOOST,
      arcadiaSetIndexToDmg[setConditionals.valueArcadiaOfWovenDreams],
      x.targets(TargetTag.SelfAndMemosprite).source(Source.ArcadiaOfWovenDreams),
    )
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 4,
}

export const ArcadiaOfWovenDreams: SetConfig = {
  id: 'ArcadiaOfWovenDreams',
  info: {
    index: 20,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
