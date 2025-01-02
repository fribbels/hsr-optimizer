import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { ConditionalDataType, SACERDOS_RELIVED_ORDEAL_1_STACK, SACERDOS_RELIVED_ORDEAL_2_STACK, Sets } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { calculateContextConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { baseComputedStatsArray, ComputedStatsArray, ComputedStatsArrayCore, Key, Source } from 'lib/optimization/computedStatsArray'
import { ComboConditionalCategory, ComboConditionals, ComboSelectConditional, ComboState, initializeComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterConditionalsController, ConditionalValueMap, LightConeConditionalsController } from 'types/conditionals'
import { Form } from 'types/form'
import { OptimizerAction, OptimizerContext, SetConditional } from 'types/optimizer'

export function transformComboState(request: Form, context: OptimizerContext) {
  // console.log('transformComboState')

  if (!request.comboStateJson || request.comboStateJson == '{}') {
    request.comboType = 'simple'
  }

  if (request.comboType == 'advanced') {
    const comboState = initializeComboState(request, true)
    transformStateActions(comboState, request, context)
  } else {
    const comboState = initializeComboState(request, false)
    transformStateActions(comboState, request, context)
  }
}

function transformStateActions(comboState: ComboState, request: Form, context: OptimizerContext) {
  const comboAbilities = getComboAbilities(request.comboAbilities)
  const actions: OptimizerAction[] = []
  for (let i = 0; i < comboAbilities.length; i++) {
    actions.push(transformAction(i, comboState, comboAbilities, context))
  }

  context.actions = actions
  context.comboDot = request.comboDot || 0
  context.comboBreak = request.comboBreak || 0
}

function transformAction(actionIndex: number, comboState: ComboState, comboAbilities: string[], context: OptimizerContext) {
  const action: OptimizerAction = {
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: {},
    teammate0: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammate1: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammate2: {
      characterConditionals: {},
      lightConeConditionals: {},
    },
    teammateDynamicConditionals: [] as DynamicConditional[],
  } as OptimizerAction
  action.actorId = context.characterId
  action.actionIndex = actionIndex
  action.actionType = comboAbilities[actionIndex]

  action.characterConditionals = transformConditionals(actionIndex, comboState.comboCharacter.characterConditionals)
  action.lightConeConditionals = transformConditionals(actionIndex, comboState.comboCharacter.lightConeConditionals)
  action.setConditionals = transformSetConditionals(actionIndex, comboState.comboCharacter.setConditionals) as SetConditional

  action.precomputedX = new ComputedStatsArrayCore(false) as ComputedStatsArray
  action.precomputedX.setPrecompute(baseComputedStatsArray())
  action.precomputedM = action.precomputedX.m
  action.precomputedM.setPrecompute(baseComputedStatsArray())

  if (comboState.comboTeammate0) {
    action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
    action.teammate0.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate0.characterConditionals)
    action.teammate0.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate0.lightConeConditionals)
  }

  if (comboState.comboTeammate1) {
    action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
    action.teammate1.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate1.characterConditionals)
    action.teammate1.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate1.lightConeConditionals)
  }

  if (comboState.comboTeammate2) {
    action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
    action.teammate2.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate2.characterConditionals)
    action.teammate2.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate2.lightConeConditionals)
  }

  precomputeConditionals(action, comboState, context)
  calculateContextConditionalRegistry(action, context)

  return action
}

function precomputeConditionals(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(comboState.comboCharacter.metadata)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(comboState.comboCharacter.metadata)

  const x = action.precomputedX

  lightConeConditionals.initializeConfigurations?.(x, action, context)
  characterConditionals.initializeConfigurations?.(x, action, context)

  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((x) => !!x?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!
    const teammateRequest = Object.assign({}, teammates[i])

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals),
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    teammateCharacterConditionals.initializeTeammateConfigurations?.(x, teammateAction, context)
    teammateLightConeConditionals.initializeTeammateConfigurations?.(x, teammateAction, context)
  }

  // Precompute stage
  lightConeConditionals.precomputeEffects?.(x, action, context)
  characterConditionals.precomputeEffects?.(x, action, context)

  // Precompute mutual stage
  lightConeConditionals.precomputeMutualEffects?.(x, action, context)
  characterConditionals.precomputeMutualEffects?.(x, action, context)

  precomputeTeammates(action, comboState, context)
  // If the conditionals forced weakness break, keep it. Otherwise use the request's broken status
  x.ENEMY_WEAKNESS_BROKEN.set((x.a[Key.ENEMY_WEAKNESS_BROKEN] || context.enemyWeaknessBroken ? 1 : 0), Source.NONE)
}

function precomputeTeammates(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  // Precompute teammate effects
  const x = action.precomputedX
  const teammateSetEffects: Record<string, boolean> = {}
  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((x) => !!x?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!
    // This is set to null so empty light cones don't get overwritten by the main lc. TODO: There's probably a better place for this
    const teammateRequest = Object.assign({}, teammates[i])

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals),
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata) as CharacterConditionalsController

    if (teammateCharacterConditionals.precomputeMutualEffects) teammateCharacterConditionals.precomputeMutualEffects(x, teammateAction, context)
    if (teammateCharacterConditionals.precomputeTeammateEffects) teammateCharacterConditionals.precomputeTeammateEffects(x, teammateAction, context)

    if (teammateLightConeConditionals.precomputeMutualEffects) teammateLightConeConditionals.precomputeMutualEffects(x, teammateAction, context)
    if (teammateLightConeConditionals.precomputeTeammateEffects) teammateLightConeConditionals.precomputeTeammateEffects(x, teammateAction, context)

    for (const [key, value] of [...Object.entries(teammateRequest.relicSetConditionals), ...Object.entries(teammateRequest.ornamentSetConditionals)]) {
      if (value.type == ConditionalDataType.BOOLEAN) {
        const booleanComboConditional = value
        if (!booleanComboConditional.activations[action.actionIndex]) {
          continue
        }
      } else {
        continue
      }
      switch (key) {
        case Sets.BrokenKeel:
          x.CD.buffTeam(0.10, Source.BrokenKeel)
          break
        case Sets.FleetOfTheAgeless:
          x.ATK_P.buffTeam(0.08, Source.FleetOfTheAgeless)
          break
        case Sets.PenaconyLandOfTheDreams:
          if (comboState.comboCharacter.metadata.element != teammateRequest.metadata.element) break
          x.ELEMENTAL_DMG.buff(0.10, Source.PenaconyLandOfTheDreams)
          break
        case Sets.LushakaTheSunkenSeas:
          x.ATK_P.buff(0.12, Source.LushakaTheSunkenSeas)
          break
        case Sets.MessengerTraversingHackerspace:
          if (teammateSetEffects[Sets.MessengerTraversingHackerspace]) break
          x.SPD_P.buffTeam(0.12, Source.MessengerTraversingHackerspace)
          break
        case Sets.WatchmakerMasterOfDreamMachinations:
          if (teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) break
          x.BE.buffTeam(0.30, Source.WatchmakerMasterOfDreamMachinations)
          break
        case SACERDOS_RELIVED_ORDEAL_1_STACK:
          if (teammateAction.actorId == '1313') {
            x.CD.buffDual(0.18, Source.SacerdosRelivedOrdeal)
          } else {
            x.CD.buff(0.18, Source.SacerdosRelivedOrdeal)
          }
          break
        case SACERDOS_RELIVED_ORDEAL_2_STACK:
          if (teammateAction.actorId == '1313') {
            x.CD.buffDual(0.36, Source.SacerdosRelivedOrdeal)
          } else {
            x.CD.buff(0.36, Source.SacerdosRelivedOrdeal)
          }
          break
        default:
      }

      // Track unique buffs
      teammateSetEffects[key] = true
    }
  }
}

function transformConditionals(actionIndex: number, conditionals: ComboConditionals) {
  const result: Record<string, number | boolean> = {}
  for (const [key, category] of Object.entries(conditionals)) {
    result[key] = transformConditional(category, actionIndex)
  }

  return result as ConditionalValueMap
}

function transformConditional(category: ComboConditionalCategory, actionIndex: number) {
  if (category.type == ConditionalDataType.BOOLEAN) {
    const booleanCategory = category
    return booleanCategory.activations[actionIndex]
  } else {
    const partitionCategory = category as ComboSelectConditional
    for (let i = 0; i < partitionCategory.partitions.length; i++) {
      const partition = partitionCategory.partitions[i]
      if (partition.activations[actionIndex]) {
        return partition.value
      }
    }
  }

  return 0
}

function transformSetConditionals(actionIndex: number, conditionals: ComboConditionals) {
  return {
    enabledHunterOfGlacialForest: transformConditional(conditionals[Sets.HunterOfGlacialForest], actionIndex),
    enabledFiresmithOfLavaForging: transformConditional(conditionals[Sets.FiresmithOfLavaForging], actionIndex),
    enabledGeniusOfBrilliantStars: transformConditional(conditionals[Sets.GeniusOfBrilliantStars], actionIndex),
    enabledBandOfSizzlingThunder: transformConditional(conditionals[Sets.BandOfSizzlingThunder], actionIndex),
    enabledMessengerTraversingHackerspace: transformConditional(conditionals[Sets.MessengerTraversingHackerspace], actionIndex),
    enabledCelestialDifferentiator: transformConditional(conditionals[Sets.CelestialDifferentiator], actionIndex),
    enabledWatchmakerMasterOfDreamMachinations: transformConditional(conditionals[Sets.WatchmakerMasterOfDreamMachinations], actionIndex),
    enabledIzumoGenseiAndTakamaDivineRealm: transformConditional(conditionals[Sets.IzumoGenseiAndTakamaDivineRealm], actionIndex),
    enabledForgeOfTheKalpagniLantern: transformConditional(conditionals[Sets.ForgeOfTheKalpagniLantern], actionIndex),
    enabledTheWindSoaringValorous: transformConditional(conditionals[Sets.TheWindSoaringValorous], actionIndex),
    enabledTheWondrousBananAmusementPark: transformConditional(conditionals[Sets.TheWondrousBananAmusementPark], actionIndex),
    enabledScholarLostInErudition: transformConditional(conditionals[Sets.ScholarLostInErudition], actionIndex),
    enabledHeroOfTriumphantSong: transformConditional(conditionals[Sets.HeroOfTriumphantSong], actionIndex),
    valueChampionOfStreetwiseBoxing: transformConditional(conditionals[Sets.ChampionOfStreetwiseBoxing], actionIndex),
    valueWastelanderOfBanditryDesert: transformConditional(conditionals[Sets.WastelanderOfBanditryDesert], actionIndex),
    valueLongevousDisciple: transformConditional(conditionals[Sets.LongevousDisciple], actionIndex),
    valueTheAshblazingGrandDuke: transformConditional(conditionals[Sets.TheAshblazingGrandDuke], actionIndex),
    valuePrisonerInDeepConfinement: transformConditional(conditionals[Sets.PrisonerInDeepConfinement], actionIndex),
    valuePioneerDiverOfDeadWaters: transformConditional(conditionals[Sets.PioneerDiverOfDeadWaters], actionIndex),
    valueSigoniaTheUnclaimedDesolation: transformConditional(conditionals[Sets.SigoniaTheUnclaimedDesolation], actionIndex),
    valueDuranDynastyOfRunningWolves: transformConditional(conditionals[Sets.DuranDynastyOfRunningWolves], actionIndex),
    valueSacerdosRelivedOrdeal: transformConditional(conditionals[Sets.SacerdosRelivedOrdeal], actionIndex),
  }
}

function getComboAbilities(comboAbilities: string[]) {
  const newComboAbilities = ['DEFAULT']
  for (let i = 1; i <= 8; i++) {
    if (comboAbilities[i] == null) break
    newComboAbilities.push(comboAbilities[i])
  }
  return newComboAbilities
}
