import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type CharacterId } from 'types/character'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean, { characterId }: { characterId: CharacterId }): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AGroundedAscent')
  const { SOURCE_LC } = Source.lightCone(AGroundedAscent.id)

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
      content: t('Content.dmgBuffStacks.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
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

      if (characterId === Sunday.id) {
        x.buff(StatKey.DMG_BOOST, m.dmgBuffStacks * sValuesDmg[s], x.targets(TargetTag.SelfAndMemosprite).deferrable().source(SOURCE_LC))
      } else {
        x.buff(StatKey.DMG_BOOST, m.dmgBuffStacks * sValuesDmg[s], x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
      }
    },
  }
}

export const AGroundedAscent: LightConeConfig = {
  id: '23034',
  conditionals,
}
