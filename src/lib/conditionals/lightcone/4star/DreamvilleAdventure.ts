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
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DreamvilleAdventure')
  const { SOURCE_LC } = Source.lightCone(DreamvilleAdventure.id)

  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    ultDmgBuff: false,
    skillDmgBuff: false,
    basicDmgBuff: false,
  }

  const teammateDefaults = {
    ultDmgBuff: false,
    skillDmgBuff: false,
    basicDmgBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultDmgBuff: {
      lc: true,
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
    skillDmgBuff: {
      lc: true,
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
    basicDmgBuff: {
      lc: true,
      id: 'basicDmgBuff',
      formItem: 'switch',
      text: t('Content.basicDmgBuff.text'),
      content: t('Content.basicDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultDmgBuff: content.ultDmgBuff,
    skillDmgBuff: content.skillDmgBuff,
    basicDmgBuff: content.basicDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (m.basicDmgBuff) ? sValues[s] : 0, x.damageType(DamageTag.BASIC).targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (m.skillDmgBuff) ? sValues[s] : 0, x.damageType(DamageTag.SKILL).targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (m.ultDmgBuff) ? sValues[s] : 0, x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const DreamvilleAdventure: LightConeConfig = {
  id: '21036',
  conditionals,
}
