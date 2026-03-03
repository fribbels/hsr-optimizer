import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BasicKey } from 'lib/optimization/basicStatsArray'
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
  index: 29,
  setType: SetType.RELIC,
  ingameId: '130',
  name: Sets.DivinerOfDistantReach,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Diviner',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.DivinerOfDistantReach)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const spd = x.c.a[BasicKey.SPD]
    x.buff(StatKey.CR, (spd >= 120 ? 0.10 : 0) + (spd >= 160 ? 0.08 : 0),
      x.source(Source.DivinerOfDistantReach))
    if (setConditionals.enabledDivinerOfDistantReach && !x.config.teammateSetEffects[Sets.DivinerOfDistantReach]) {
      x.buff(StatKey.ELATION, 0.10, x.targets(TargetTag.FullTeam).source(Source.DivinerOfDistantReach))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_DivinerOfDistantReach) >= 1) {
      let divinerCrValue = select(0.0, 0.10, (*p_c).SPD >= 120.0) + select(0.0, 0.08, (*p_c).SPD >= 160.0);
      ${buff.action(AKey.CR, 'divinerCrValue').wgsl(action, 2)}
      if (setConditionals.enabledDivinerOfDistantReach == true && ${wgslFalse(action.config.teammateSetEffects[Sets.DivinerOfDistantReach])}) {
        ${buff.action(AKey.ELATION, 0.10).targets(TargetTag.FullTeam).wgsl(action, 3)}
      }
    }
  `,
  teammate: [{
    value: Sets.DivinerOfDistantReach,
    label: (t) => t('TeammateSets.Diviner.Text'),
    desc: (t) => t('TeammateSets.Diviner.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.ELATION, 0.10, x.targets(TargetTag.FullTeam).source(Source.DivinerOfDistantReach))
    },
  }],
} as const satisfies SetConditionals

export const DivinerOfDistantReach = {
  id: 'DivinerOfDistantReach',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
