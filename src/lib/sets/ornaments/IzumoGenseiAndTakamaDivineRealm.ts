import { ConditionalDataType } from 'lib/constants/constants'
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
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
      x.buff(StatKey.CR, 0.12, x.source(Source.IzumoGenseiAndTakamaDivineRealm))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_IzumoGenseiAndTakamaDivineRealm) >= 1
      && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm == true
    ) {
      ${buff.action(AKey.CR, 0.12).wgsl(action, 2)}
    }
  `,
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Izumo',
  modifiable: true,
  defaultValue: true,
}

export const IzumoGenseiAndTakamaDivineRealm: SetConfig = {
  id: 'IzumoGenseiAndTakamaDivineRealm',
  info: {
    index: 13,
    setType: SetType.ORNAMENT,
    ingameId: '314',
  },
  conditionals,
  display,
}
