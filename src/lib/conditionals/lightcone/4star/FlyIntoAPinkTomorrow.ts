import {
  TrailblazerRemembranceCaelus,
  TrailblazerRemembranceStelle,
} from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type CharacterId } from 'types/character'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean, { characterId }: { characterId: CharacterId }): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlyIntoAPinkTomorrow')
  const { SOURCE_LC } = Source.lightCone(FlyIntoAPinkTomorrow.id)

  const sValuesDmg = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesEnhancedBasicDmg = [0.60, 0.70, 0.80, 0.90, 1.00]

  const isValidWearer = characterId == TrailblazerRemembranceStelle.id || characterId == TrailblazerRemembranceCaelus.id

  const defaults = {
    dmgBoost: isValidWearer,
    enhancedBasicBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: isValidWearer,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('Content.dmgBoost.text'),
      content: t('Content.dmgBoost.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
      disabled: !isValidWearer,
    },
    enhancedBasicBoost: {
      lc: true,
      id: 'enhancedBasicBoost',
      formItem: 'switch',
      text: t('Content.enhancedBasicBoost.text'),
      content: t('Content.enhancedBasicBoost.content', { DmgBoost: precisionRound(100 * sValuesEnhancedBasicDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBoost: content.dmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      if (context.characterId == TrailblazerRemembranceStelle.id || context.characterId == TrailblazerRemembranceCaelus.id) {
        x.buff(StatKey.DMG_BOOST, (r.enhancedBasicBoost) ? sValuesEnhancedBasicDmg[s] : 0, x.damageType(DamageTag.BASIC).source(SOURCE_LC))
      }
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      if (characterId === TrailblazerRemembranceStelle.id || characterId === TrailblazerRemembranceCaelus.id) {
        x.buff(StatKey.DMG_BOOST, (m.dmgBoost) ? sValuesDmg[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      }
    },
  }
}

export const FlyIntoAPinkTomorrow: LightConeConfig = {
  id: '22006',
  conditionals,
}
