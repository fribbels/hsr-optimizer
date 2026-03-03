import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 26,
  setType: SetType.RELIC,
  ingameId: '127',
  name: Sets.WorldRemakingDeliverer,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Deliverer',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.WorldRemakingDeliverer)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWorldRemakingDeliverer) {
      x.buff(StatKey.HP_P, 0.24, x.targets(TargetTag.SelfAndMemosprite).source(Source.WorldRemakingDeliverer))
      if (!x.config.teammateSetEffects[Sets.WorldRemakingDeliverer]) {
        x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
      }
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WorldRemakingDeliverer) >= 1
      && setConditionals.enabledWorldRemakingDeliverer == true
    ) {
      ${buff.action(AKey.HP_P, 0.24).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
      if (${wgslFalse(action.config.teammateSetEffects[Sets.WorldRemakingDeliverer])}) {
        ${buff.action(AKey.DMG_BOOST, 0.15).targets(TargetTag.FullTeam).wgsl(action, 2)}
      }
    }
  `,
  teammate: [{
    value: Sets.WorldRemakingDeliverer,
    label: (t) => t('TeammateSets.WorldRemaking.Text'),
    desc: (t) => t('TeammateSets.WorldRemaking.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
    },
  }],
} as const satisfies SetConditionals

export const WorldRemakingDeliverer = {
  id: 'WorldRemakingDeliverer',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
