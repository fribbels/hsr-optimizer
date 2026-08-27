import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 32,
  setType: SetType.RELIC,
  ingameId: '133',
  twoPieceStatTag: Stats.SPD_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

// The Elation buff lands on "one other ally target" so it never reaches the wearer — it is
// outgoing only. The Certified Banger CRIT DMG half reaches all allies including the wearer.
const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.DreamlitActor)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const value = setConditionals.valueDreamlitActor
    if (value >= 1) {
      x.buff(StatKey.BOOST, 0.16, x.outputBuff(StatKey.ELATION).source(Source.DreamlitActor))
    }
    if (value >= 2) {
      x.buff(StatKey.CD, 0.12, x.targets(TargetTag.FullTeam).source(Source.DreamlitActor))
      x.buff(StatKey.BOOST, 0.12, x.outputBuff(StatKey.CD).source(Source.DreamlitActor))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, DreamlitActor),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_DreamlitActor)) {
      if (setConditionals.valueDreamlitActor >= 1) {
        ${buff.hit(HKey.BOOST, 0.16).outputBuff(StatKey.ELATION).wgsl(action, 3)}
      }
      if (setConditionals.valueDreamlitActor >= 2) {
        ${buff.action(AKey.CD, 0.12).targets(TargetTag.FullTeam).wgsl(action, 3)}
        ${buff.hit(HKey.BOOST, 0.12).outputBuff(StatKey.CD).wgsl(action, 4)}
      }
    }
  `,
  teammate: [{
    value: Sets.DreamlitActor,
    label: () => '16% Elation + 12% CD',
    desc: () => '4 Piece: Dreamlit Actor (+16% Elation | +12% CD)',
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.ELATION, 0.16, x.targets(TargetTag.SingleTarget).deferrable().source(Source.DreamlitActor))
      x.buff(StatKey.CD, 0.12, x.targets(TargetTag.FullTeam).source(Source.DreamlitActor))
    },
  }],
}

function selectionOptions(): SelectOptionContent[] {
  return [
    { display: 'Off', value: 0, label: 'Off' },
    { display: 'Elation', value: 1, label: 'Elation +16%' },
    { display: 'CD', value: 2, label: 'Elation +16% | CD +12%' },
  ]
}

export const DreamlitActor = {
  id: Sets.DreamlitActor,
  setKey: 'DreamlitActor',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
