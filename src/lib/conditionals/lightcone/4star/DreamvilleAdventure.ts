import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DreamvilleAdventure')
  const { SOURCE_LC } = Source.lightCone('21036')

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
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
    skillDmgBuff: {
      lc: true,
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
    basicDmgBuff: {
      lc: true,
      id: 'basicDmgBuff',
      formItem: 'switch',
      text: t('Content.basicDmgBuff.text'),
      content: t('Content.basicDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
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
