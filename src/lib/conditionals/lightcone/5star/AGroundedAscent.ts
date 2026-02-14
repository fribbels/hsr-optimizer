import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AGroundedAscent')
  const { SOURCE_LC } = Source.lightCone('23034')

  const sValuesDmg = [0.15, 0.1725, 0.195, 0.2175, 0.24]

  const defaults = {
    dmgBuffStacks: 3,
  }

  const teammateDefaults = {
    dmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuffStacks: {
      lc: true,
      id: 'dmgBuffStacks',
      formItem: 'slider',
      text: t('Content.dmgBuffStacks.text'),
      content: t('Content.dmgBuffStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
      min: 0,
      max: 3,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBuffStacks: content.dmgBuffStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      if (action.actorId == '1313') {
        x.buff(StatKey.DMG_BOOST, m.dmgBuffStacks * sValuesDmg[s], x.targets(TargetTag.SelfAndMemosprite).deferrable().source(SOURCE_LC))
      } else {
        x.buff(StatKey.DMG_BOOST, m.dmgBuffStacks * sValuesDmg[s], x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
      }
    },
  }
}
