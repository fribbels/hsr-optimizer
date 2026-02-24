import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue, } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ModifierContext } from 'lib/optimization/context/calculateActions'
import { AKey, StatKey, } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, SELF_ENTITY_INDEX, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { YAO_GUANG } from 'lib/simulations/tests/testMetadataConstants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { ElationHit } from 'types/hitConditionalTypes'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const YaoguangEntities = createEnum('Yaoguang')
export const YaoguangAbilities = createEnum('BASIC', 'ELATION_SKILL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.SKILL_BASIC_ELATION_SKILL_3_ULT_TALENT_ELATION_SKILL_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
    SOURCE_ELATION_SKILL,
  } = Source.character(YAO_GUANG)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const basicScaling = basic(e, 0.90, 0.99)
  const skillElationBuff = skill(e, 0.20, 0.22)
  const ultResPenValue = ult(e, 0.20, 0.22)
  const talentElationScaling = talent(e, 0.20, 0.22)

  const elationSkillAoeScaling = elationSkill(e, 1.00, 1.05, 1.10)
  const elationSkillBounceCount = 5
  const elationSkillBounceScaling = elationSkill(e, 0.20, 0.21, 0.22)
  const elationSkillVulnerability = 0.16

  const ahaPunchlineValue = (e >= 1) ? 40 : 20

  const defaults = {
    punchlineStacks: 50,
    skillZoneActive: true,
    ultResPenBuff: true,
    certifiedBanger: true,
    ahaMoment: false,
    woesWhisperVulnerability: true,
    traceSpdElation: true,
    e1DefPen: true,
    e2ZoneSpdBuff: true,
    e6Merrymaking: true,
  }

  const teammateDefaults = {
    certifiedBanger: true,
    consumesSkillPoints: true,
    teammatePunchlineStacks: 50,
    skillZoneActive: true,
    teammateElationValue: 2.00,
    ultResPenBuff: true,
    woesWhisperVulnerability: true,
    e1DefPen: true,
    e2ZoneSpdBuff: true,
    e6Merrymaking: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    skillZoneActive: {
      id: 'skillZoneActive',
      formItem: 'switch',
      text: 'Skill Zone active',
      content: betaContent,
    },
    ultResPenBuff: {
      id: 'ultResPenBuff',
      formItem: 'switch',
      text: 'Ult RES PEN buff',
      content: betaContent,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Certified Banger',
      content: betaContent,
    },
    ahaMoment: {
      id: 'ahaMoment',
      formItem: 'switch',
      text: 'Aha Moment',
      content: betaContent,
    },
    woesWhisperVulnerability: {
      id: 'woesWhisperVulnerability',
      formItem: 'switch',
      text: 'Woe\'s Whisper vulnerability',
      content: betaContent,
    },
    traceSpdElation: {
      id: 'traceSpdElation',
      formItem: 'switch',
      text: 'SPD Elation buff',
      content: betaContent,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 Elation DEF PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2ZoneSpdBuff: {
      id: 'e2ZoneSpdBuff',
      formItem: 'switch',
      text: 'E2 Zone SPD buff',
      content: betaContent,
      disabled: e < 2,
    },
    e6Merrymaking: {
      id: 'e6Merrymaking',
      formItem: 'switch',
      text: 'E6 Merrymaking',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    certifiedBanger: content.certifiedBanger,
    consumesSkillPoints: {
      id: 'consumesSkillPoints',
      formItem: 'switch',
      text: 'Consumes skill points',
      content: betaContent,
    },
    teammatePunchlineStacks: {
      id: 'teammatePunchlineStacks',
      formItem: 'slider',
      text: `Yao Guang's Punchline stacks`,
      content: betaContent,
      min: 0,
      max: 200,
    },
    skillZoneActive: content.skillZoneActive,
    teammateElationValue: {
      id: 'teammateElationValue',
      formItem: 'slider',
      text: `Yao Guang's Elation DMG Boost`,
      content: betaContent,
      min: 0,
      max: 2.00,
      percent: true,
    },
    ultResPenBuff: content.ultResPenBuff,
    woesWhisperVulnerability: content.woesWhisperVulnerability,
    e1DefPen: content.e1DefPen,
    e2ZoneSpdBuff: content.e2ZoneSpdBuff,
    e6Merrymaking: content.e6Merrymaking,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ELATION_SKILL],
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(YaoguangEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [YaoguangEntities.Yaoguang]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(YaoguangAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const punchline = (r.ahaMoment) ? ahaPunchlineValue : r.punchlineStacks

      // Combined Elation Skill scaling: AoE base + bounce hits averaged per enemy
      const baseElationScaling = elationSkillAoeScaling + elationSkillBounceCount * elationSkillBounceScaling / context.enemyCount
      const e6ElationMultiplier = (e >= 6 && r.e6Merrymaking) ? 2 : 1
      const combinedElationScaling = baseElationScaling * e6ElationMultiplier
      const combinedToughness = 20 + 5 * elationSkillBounceCount / context.enemyCount

      return {
        [YaoguangAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [YaoguangAbilities.ELATION_SKILL]: {
          hits: [
            HitDefinitionBuilder.elation()
              .damageType(DamageTag.ELATION)
              .damageElement(ElementTag.Physical)
              .elationScaling(combinedElationScaling)
              .punchlineStacks(punchline)
              .toughnessDmg(combinedToughness)
              .build(),
          ],
        },
        [YaoguangAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [{
      modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
        if (!self.ownConditionals.certifiedBanger) return

        const hasDirectHit = action.hits?.some((hit) => hit.directHit)
        if (!hasDirectHit) return

        const punchline = (self.isTeammate)
          ? self.ownConditionals.teammatePunchlineStacks as number
          : ((self.ownConditionals.ahaMoment) ? ahaPunchlineValue : self.ownConditionals.punchlineStacks as number)

        // If attacker's Elation < Yaoguang's, use Yaoguang's Elation for Great Boon calculation
        const minElation = (self.isTeammate)
          ? self.ownConditionals.teammateElationValue as number
          : 0

        // Great Boon deals Elation DMG "of the corresponding Type" - match the attacker's element
        const attackElement = action.hits?.find((hit) => hit.directHit && hit.damageElement !== ElementTag.None)?.damageElement ?? ElementTag.None

        // Great Boon triggers 1 time, or 2 times if the attack consumes Skill Points
        const greatBoonCount = (self.isTeammate && self.ownConditionals.consumesSkillPoints) ? 2 : 1

        for (let i = 0; i < greatBoonCount; i++) {
          const greatBoonHit = HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(attackElement)
            .elationScaling(talentElationScaling)
            .punchlineStacks(punchline)
            .toughnessDmg(0)
            .build() as ElationHit
          greatBoonHit.minElationOverride = minElation

          action.hits!.push(greatBoonHit)
        }
      },
    }],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, 0.60, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (m.ultResPenBuff) ? ultResPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      x.buff(StatKey.VULNERABILITY, (m.woesWhisperVulnerability) ? elationSkillVulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ELATION_SKILL))

      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefPen) ? 0.20 : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_E1))

      x.buff(StatKey.SPD_P, (e >= 2 && m.skillZoneActive && m.e2ZoneSpdBuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      x.buff(StatKey.ELATION_DMG_BOOST, (e >= 2 && m.skillZoneActive && m.e2ZoneSpdBuff) ? 0.16 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      x.buff(StatKey.MERRYMAKING, (e >= 6 && m.e6Merrymaking) ? 0.25 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))

      const primaryAhaMoment = originalCharacterAction!.characterConditionals.ahaMoment
      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 4 && primaryAhaMoment) ? 0.50 : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const sharedElation = (t.skillZoneActive) ? t.teammateElationValue * skillElationBuff : 0
      x.buff(StatKey.UNCONVERTIBLE_ELATION_BUFF, sharedElation, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.ELATION_DMG_BOOST, sharedElation, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // SPD >= 120 grants Elation +30%, +1% per excess SPD up to 200
      if (r.traceSpdElation) {
        const spd = x.getActionValue(StatKey.SPD, YaoguangEntities.Yaoguang)
        if (spd >= 120) {
          const excessSpd = Math.min(200, spd - 120)
          const elationBuff = 0.30 + excessSpd * 0.01
          x.buff(StatKey.ELATION_DMG_BOOST, elationBuff, x.source(SOURCE_TRACE))
        }
      }

      // Increases all allies' Elation by 20% of Yaoguang's Elation
      if (r.skillZoneActive) {
        const elation = x.getActionValue(StatKey.ELATION_DMG_BOOST, YaoguangEntities.Yaoguang)
        const sharedElation = elation * skillElationBuff
        x.buff(StatKey.UNCONVERTIBLE_ELATION_BUFF, sharedElation, x.source(SOURCE_SKILL))
        x.buff(StatKey.ELATION_DMG_BOOST, sharedElation, x.source(SOURCE_SKILL))
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.traceSpdElation)}) {
  let spd = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)};
  if (spd >= 120.0) {
    let excessSpd = min(200.0, spd - 120.0);
    let elationBuff = 0.30 + excessSpd * 0.01;
    ${buff.action(AKey.ELATION_DMG_BOOST, 'elationBuff').wgsl(action)}
  }
}

if (${wgslTrue(r.skillZoneActive)}) {
  let elation = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ELATION_DMG_BOOST, action.config)};
  let sharedElation = elation * ${skillElationBuff};
  ${buff.action(AKey.UNCONVERTIBLE_ELATION_BUFF, 'sharedElation').wgsl(action)}
  ${buff.action(AKey.ELATION_DMG_BOOST, 'sharedElation').wgsl(action)}
}
      `
    },
  }
}
