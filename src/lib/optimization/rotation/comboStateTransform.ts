import { countTeamPath } from 'lib/conditionals/conditionalUtils'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ConditionalDataType,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { Source } from 'lib/optimization/buffSource'
import {
  baseComputedStatsArray,
  ComputedStatsArray,
  ComputedStatsArrayCore,
  Key,
} from 'lib/optimization/computedStatsArray'
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

const SUNDAY_ID = '1313'

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

// function transformStateActions(comboState: ComboState, request: Form, context: OptimizerContext) {
//   const { comboTurnAbilities, comboDot } = getComboTypeAbilities(request)
//
//   // OLD
//
//   const actions: OptimizerAction[] = []
//   for (let i = 0; i < comboTurnAbilities.length; i++) {
//     actions.push(defineAction(i, comboState, comboTurnAbilities[i], request, context))
//   }
//
//   context.actions = actions
//   calculateActions(request, context)
//
//   for (let i = 0; i < comboTurnAbilities.length; i++) {
//     const action = actions[i]
//
//     const container = new ComputedStatsContainer(context)
//     console.log(container)
//
//     action.precomputedStats = container
//
//     if (comboState.comboTeammate0) {
//       action.teammate0.actorId = comboState.comboTeammate0.metadata.characterId
//       action.teammate0.characterConditionals = transformConditionals(i, comboState.comboTeammate0.characterConditionals)
//       action.teammate0.lightConeConditionals = transformConditionals(i, comboState.comboTeammate0.lightConeConditionals)
//     }
//
//     if (comboState.comboTeammate1) {
//       action.teammate1.actorId = comboState.comboTeammate1.metadata.characterId
//       action.teammate1.characterConditionals = transformConditionals(i, comboState.comboTeammate1.characterConditionals)
//       action.teammate1.lightConeConditionals = transformConditionals(i, comboState.comboTeammate1.lightConeConditionals)
//     }
//
//     if (comboState.comboTeammate2) {
//       action.teammate2.actorId = comboState.comboTeammate2.metadata.characterId
//       action.teammate2.characterConditionals = transformConditionals(i, comboState.comboTeammate2.characterConditionals)
//       action.teammate2.lightConeConditionals = transformConditionals(i, comboState.comboTeammate2.lightConeConditionals)
//     }
//
//     precomputeConditionals(action, comboState, context)
//     calculateContextConditionalRegistry(action, context)
//   }
//
//   const characterConditionalController = CharacterConditionalsResolver.get(context)
//
//   context.dotAbilities = countDotAbilities(actions)
//   context.comboDot = comboDot || 0
//   context.activeAbilities = characterConditionalController.activeAbilities ?? []
//   context.activeAbilityFlags = context.activeAbilities.reduce((ability, flags) => ability | flags, 0)
// }
/*

DefaultActions
[BASIC]
[SKILL]
Same X stats

RotationActions
[BASIC]
[SKILL]
[BASIC]
[SKILL]



 */
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

  action.precomputedX = new ComputedStatsArrayCore(request.trace) as ComputedStatsArray
  action.precomputedX.setPrecompute(baseComputedStatsArray())
  action.precomputedM = action.precomputedX.m
  action.precomputedM.setPrecompute(baseComputedStatsArray())

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

  const x = action.precomputedX
  const container = action.precomputedStats

  if (context.deprioritizeBuffs) {
    x.DEPRIORITIZE_BUFFS.set(1, Source.NONE)
  }

  // If the conditionals forced weakness break, keep it. Otherwise use the request's broken status
  x.ENEMY_WEAKNESS_BROKEN.config(x.a[Key.ENEMY_WEAKNESS_BROKEN] || context.enemyWeaknessBroken ? 1 : 0, Source.NONE)

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
  const x = action.precomputedX
  const container = action.precomputedStats
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
      actorEidolon: teammate.metadata.characterEidolon,
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals),
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals),
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate.metadata)
    const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate.metadata)

    if (teammateCharacterConditionals.precomputeMutualEffectsContainer) {
      teammateCharacterConditionals.precomputeMutualEffectsContainer(container, teammateAction, context, action)
    }
    if (teammateCharacterConditionals.precomputeTeammateEffectsContainer) {
      teammateCharacterConditionals.precomputeTeammateEffectsContainer(container, teammateAction, context, action)
    }

    if (teammateLightConeConditionals.precomputeMutualEffectsContainer) {
      teammateLightConeConditionals.precomputeMutualEffectsContainer(container, teammateAction, context)
    }
    if (teammateLightConeConditionals.precomputeTeammateEffectsContainer) {
      teammateLightConeConditionals.precomputeTeammateEffectsContainer(container, teammateAction, context)
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
      switch (key) {
        case Sets.BrokenKeel:
          x.CD.buffTeam(0.10, Source.BrokenKeel)
          break
        case Sets.FleetOfTheAgeless:
          x.ATK_P.buffTeam(0.08, Source.FleetOfTheAgeless)
          break
        case Sets.PenaconyLandOfTheDreams:
          if (comboState.comboCharacter.metadata.element != teammateRequest.metadata.element) break
          x.ELEMENTAL_DMG.buffDual(0.10, Source.PenaconyLandOfTheDreams)
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
          if (teammateAction.actorId == SUNDAY_ID) {
            x.CD.buffDual(0.18, Source.SacerdosRelivedOrdeal)
          } else {
            x.CD.buffSingle(0.18, Source.SacerdosRelivedOrdeal)
          }
          break
        case SACERDOS_RELIVED_ORDEAL_2_STACK:
          if (teammateAction.actorId == SUNDAY_ID) {
            x.CD.buffDual(0.36, Source.SacerdosRelivedOrdeal)
          } else {
            x.CD.buffSingle(0.36, Source.SacerdosRelivedOrdeal)
          }
          break
        case Sets.WarriorGoddessOfSunAndThunder:
          if (teammateSetEffects[Sets.WarriorGoddessOfSunAndThunder]) break
          x.CD.buffTeam(0.15, Source.WarriorGoddessOfSunAndThunder)
          break
        case Sets.WorldRemakingDeliverer:
          x.ELEMENTAL_DMG.buffTeam(0.15, Source.WorldRemakingDeliverer)
          break
        case Sets.SelfEnshroudedRecluse:
          x.CD.buffTeam(0.15, Source.SelfEnshroudedRecluse)
          break
        case Sets.AmphoreusTheEternalLand:
          if (teammateSetEffects[Sets.AmphoreusTheEternalLand]) break
          x.SPD_P.buffTeam(0.08, Source.AmphoreusTheEternalLand)
          break
        default:
      }

      // Track unique buffs
      teammateSetEffects[key] = true
    }
  }
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
