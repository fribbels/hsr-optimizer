import { countTeamPath } from 'lib/conditionals/conditionalUtils'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { getTeammateOption } from 'lib/sets/setConfigRegistry'
import { newTransformStateActions } from 'lib/optimization/rotation/actionTransform'
import {
  AbilityKind,
  DEFAULT_BASIC,
  getAbilityKind,
  NULL_TURN_ABILITY_NAME,
  TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import DB from 'lib/state/db'
import {
  ComboConditionalCategory,
  ComboConditionals,
  ComboSelectConditional,
  ComboState,
  initializeComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterId } from 'types/character'
import {
  CharacterConditionalsController,
  ConditionalValueMap,
  LightConeConditionalsController,
} from 'types/conditionals'
import {
  Form,
  OptimizerForm,
} from 'types/form'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

export function transformComboState(request: Form, context: OptimizerContext) {
  // console.log('transformComboState')

  if (!request.comboStateJson || request.comboStateJson == '{}') {
    request.comboType = ComboType.SIMPLE
  }

  if (request.comboType == ComboType.ADVANCED) {
    const comboState = initializeComboState(request, true)
    newTransformStateActions(comboState, request, context)
  } else {
    const comboState = initializeComboState(request, false)
    newTransformStateActions(comboState, request, context)
  }
}

export function defineAction(
  rotation: boolean,
  actionIndex: number,
  comboState: ComboState,
  abilityName: TurnAbilityName,
  request: OptimizerForm,
  context: OptimizerContext,
) {
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
  action.actorEidolon = context.characterEidolon
  action.actionIndex = actionIndex
  action.actionType = getAbilityKind(abilityName)
  action.actionName = abilityName
  action.actionIdentifier = rotation
    ? 'Rotation' + actionIndex
    : 'Default' + actionIndex

  const conditionalIndex = rotation ?  actionIndex : 0

  action.characterConditionals = transformConditionals(conditionalIndex, comboState.comboCharacter.characterConditionals)
  action.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboCharacter.lightConeConditionals)
  action.setConditionals = transformSetConditionals(conditionalIndex, comboState.comboCharacter.setConditionals) as SetConditional
  action.setConditionals = overrideSetConditionals(action.setConditionals, context)

  if (comboState.comboTeammate0) {
    action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
    action.teammate0.actorEidolon = comboState.comboTeammate0.metadata.characterEidolon
    action.teammate0.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate0.characterConditionals)
    action.teammate0.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate0.lightConeConditionals)
  }

  if (comboState.comboTeammate1) {
    action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
    action.teammate1.actorEidolon = comboState.comboTeammate1.metadata.characterEidolon
    action.teammate1.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate1.characterConditionals)
    action.teammate1.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate1.lightConeConditionals)
  }

  if (comboState.comboTeammate2) {
    action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
    action.teammate2.actorEidolon = comboState.comboTeammate2.metadata.characterEidolon
    action.teammate2.characterConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate2.characterConditionals)
    action.teammate2.lightConeConditionals = transformConditionals(conditionalIndex, comboState.comboTeammate2.lightConeConditionals)
  }

  return action
}

function calculateActionHits() {
}

export function precomputeConditionals(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(comboState.comboCharacter.metadata)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(comboState.comboCharacter.metadata)

  const container = action.precomputedStats


  lightConeConditionals.initializeConfigurationsContainer?.(container, action, context)
  characterConditionals.initializeConfigurationsContainer?.(container, action, context)

  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((x) => !!x?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      actorEidolon: teammate.metadata.characterEidolon,
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals),
      config: action.config,
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    teammateCharacterConditionals.initializeTeammateConfigurationsContainer?.(container, teammateAction, context)
    teammateLightConeConditionals.initializeTeammateConfigurationsContainer?.(container, teammateAction, context)
  }

  lightConeConditionals.precomputeEffectsContainer?.(container, action, context)
  characterConditionals.precomputeEffectsContainer?.(container, action, context)

  lightConeConditionals.precomputeMutualEffectsContainer?.(container, action, context, action)
  characterConditionals.precomputeMutualEffectsContainer?.(container, action, context, action)

  precomputeTeammates(action, comboState, context)
}

function precomputeTeammates(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  // Precompute teammate effects
  const x = action.precomputedStats
  const teammateSetEffects: Record<string, boolean> = {}
  const teammates = [
    comboState.comboTeammate0,
    comboState.comboTeammate1,
    comboState.comboTeammate2,
  ].filter((t) => !!t?.metadata?.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammate = teammates[i]!
    // This is set to null so empty light cones don't get overwritten by the main lc. TODO: There's probably a better place for this
    const teammateRequest = Object.assign({}, teammates[i])

    const teammateAction = {
      actorId: teammate.metadata.characterId,
      actorEidolon: teammate.metadata.characterEidolon,
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals),
      config: action.config,
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    if (teammateCharacterConditionals.precomputeMutualEffectsContainer) {
      teammateCharacterConditionals.precomputeMutualEffectsContainer(x, teammateAction, context, action)
    }
    if (teammateCharacterConditionals.precomputeTeammateEffectsContainer) {
      teammateCharacterConditionals.precomputeTeammateEffectsContainer(x, teammateAction, context, action)
    }

    if (teammateLightConeConditionals.precomputeMutualEffectsContainer) {
      teammateLightConeConditionals.precomputeMutualEffectsContainer(x, teammateAction, context)
    }
    if (teammateLightConeConditionals.precomputeTeammateEffectsContainer) {
      teammateLightConeConditionals.precomputeTeammateEffectsContainer(x, teammateAction, context)
    }

    for (const [key, value] of [...Object.entries(teammateRequest.relicSetConditionals), ...Object.entries(teammateRequest.ornamentSetConditionals)]) {
      if (value.type == ConditionalDataType.BOOLEAN) {
        const booleanComboConditional = value
        if (!booleanComboConditional.activations[action.actionIndex]) {
          continue
        }
      } else {
        continue
      }

      const teammateOption = getTeammateOption(key)
      if (!teammateOption) continue
      if (teammateOption.nonstackable && teammateSetEffects[key]) continue

      teammateOption.effect({
        x,
        characterElement: comboState.comboCharacter.metadata.element,
        teammateElement: teammateRequest.metadata.element,
        teammateActorId: teammateAction.actorId,
      })

      // Track unique buffs
      teammateSetEffects[key] = true
    }
  }

  action.config.teammateSetEffects = teammateSetEffects
}

export function transformConditionals(actionIndex: number, conditionals: ComboConditionals) {
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
    enabledPenaconyLandOfTheDreams: transformConditional(conditionals[Sets.PenaconyLandOfTheDreams], actionIndex),
    enabledIzumoGenseiAndTakamaDivineRealm: transformConditional(conditionals[Sets.IzumoGenseiAndTakamaDivineRealm], actionIndex),
    enabledForgeOfTheKalpagniLantern: transformConditional(conditionals[Sets.ForgeOfTheKalpagniLantern], actionIndex),
    enabledTheWindSoaringValorous: transformConditional(conditionals[Sets.TheWindSoaringValorous], actionIndex),
    enabledTheWondrousBananAmusementPark: transformConditional(conditionals[Sets.TheWondrousBananAmusementPark], actionIndex),
    enabledScholarLostInErudition: transformConditional(conditionals[Sets.ScholarLostInErudition], actionIndex),
    enabledHeroOfTriumphantSong: transformConditional(conditionals[Sets.HeroOfTriumphantSong], actionIndex),
    enabledWarriorGoddessOfSunAndThunder: transformConditional(conditionals[Sets.WarriorGoddessOfSunAndThunder], actionIndex),
    enabledWavestriderCaptain: transformConditional(conditionals[Sets.WavestriderCaptain], actionIndex),
    enabledWorldRemakingDeliverer: transformConditional(conditionals[Sets.WorldRemakingDeliverer], actionIndex),
    enabledSelfEnshroudedRecluse: transformConditional(conditionals[Sets.SelfEnshroudedRecluse], actionIndex),
    enabledDivinerOfDistantReach: transformConditional(conditionals[Sets.DivinerOfDistantReach], actionIndex),
    enabledAmphoreusTheEternalLand: transformConditional(conditionals[Sets.AmphoreusTheEternalLand], actionIndex),
    enabledTengokuLivestream: transformConditional(conditionals[Sets.TengokuLivestream], actionIndex),
    valueChampionOfStreetwiseBoxing: transformConditional(conditionals[Sets.ChampionOfStreetwiseBoxing], actionIndex),
    valueWastelanderOfBanditryDesert: transformConditional(conditionals[Sets.WastelanderOfBanditryDesert], actionIndex),
    valueLongevousDisciple: transformConditional(conditionals[Sets.LongevousDisciple], actionIndex),
    valueTheAshblazingGrandDuke: transformConditional(conditionals[Sets.TheAshblazingGrandDuke], actionIndex),
    valuePrisonerInDeepConfinement: transformConditional(conditionals[Sets.PrisonerInDeepConfinement], actionIndex),
    valuePioneerDiverOfDeadWaters: transformConditional(conditionals[Sets.PioneerDiverOfDeadWaters], actionIndex),
    valueSigoniaTheUnclaimedDesolation: transformConditional(conditionals[Sets.SigoniaTheUnclaimedDesolation], actionIndex),
    valueDuranDynastyOfRunningWolves: transformConditional(conditionals[Sets.DuranDynastyOfRunningWolves], actionIndex),
    valueSacerdosRelivedOrdeal: transformConditional(conditionals[Sets.SacerdosRelivedOrdeal], actionIndex),
    valueArcadiaOfWovenDreams: transformConditional(conditionals[Sets.ArcadiaOfWovenDreams], actionIndex),
    valueEverGloriousMagicalGirl: transformConditional(conditionals[Sets.EverGloriousMagicalGirl], actionIndex),
  }
}

export enum ComboType {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export function getDefaultComboTurnAbilities(characterId: CharacterId, characterEidolon: number) {
  const simulation = DB.getMetadata().characters[characterId]?.scoringMetadata?.simulation
  return {
    comboTurnAbilities: simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC],
    comboDot: simulation?.comboDot ?? 0,
  }
}

export function getComboTypeAbilities(form: OptimizerForm) {
  if (form.comboType == ComboType.SIMPLE) {
    return getDefaultComboTurnAbilities(form.characterId, form.characterEidolon)
  }

  return {
    comboTurnAbilities: form.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC],
    comboDot: form.comboDot ?? 0,
  }
}

function overrideSetConditionals(setConditionals: SetConditional, context: OptimizerContext): SetConditional {
  return {
    ...setConditionals,
    enabledIzumoGenseiAndTakamaDivineRealm: setConditionals.enabledIzumoGenseiAndTakamaDivineRealm && countTeamPath(context, context.path) >= 2,
  }
}

export function countDotAbilities(actions: OptimizerAction[]) {
  return actions.filter((x) => x.actionType == AbilityKind.DOT).length
}
