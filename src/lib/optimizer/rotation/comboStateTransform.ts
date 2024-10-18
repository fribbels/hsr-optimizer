import { ComboBooleanConditional, ComboConditionalCategory, ComboConditionals, ComboSelectConditional, ComboState, initializeComboState } from 'lib/optimizer/rotation/comboDrawerController'
import { Form } from 'types/Form'
import { OptimizerAction, OptimizerContext, SetConditional } from 'types/Optimizer'
import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { LightConeConditional, LightConeConditionalMap } from 'types/LightConeConditionals'
import { SACERDOS_RELIVED_ORDEAL_1_STACK, SACERDOS_RELIVED_ORDEAL_2_STACK, Sets, Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { calculateContextConditionalRegistry } from 'lib/optimizer/calculateConditionals'

export type ComboForm = {}

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
  } as OptimizerAction
  action.actionIndex = actionIndex
  action.actionType = comboAbilities[actionIndex]

  action.characterConditionals = transformConditionals(actionIndex, comboState.comboCharacter.characterConditionals) as CharacterConditionalMap
  action.lightConeConditionals = transformConditionals(actionIndex, comboState.comboCharacter.lightConeConditionals) as LightConeConditionalMap
  action.setConditionals = transformSetConditionals(actionIndex, comboState.comboCharacter.setConditionals) as SetConditional

  action.precomputedX = Object.assign({}, baseComputedStatsObject)

  if (comboState.comboTeammate0) {
    action.teammate0.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate0.characterConditionals) as CharacterConditionalMap
    action.teammate0.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate0.lightConeConditionals) as LightConeConditionalMap
  }

  if (comboState.comboTeammate1) {
    action.teammate1.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate1.characterConditionals) as CharacterConditionalMap
    action.teammate1.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate1.lightConeConditionals) as LightConeConditionalMap
  }

  if (comboState.comboTeammate2) {
    action.teammate2.characterConditionals = transformConditionals(actionIndex, comboState.comboTeammate2.characterConditionals) as CharacterConditionalMap
    action.teammate2.lightConeConditionals = transformConditionals(actionIndex, comboState.comboTeammate2.lightConeConditionals) as LightConeConditionalMap
  }

  precomputeConditionals(action, comboState, context)
  calculateContextConditionalRegistry(action, comboState.comboCharacter.metadata)

  return action
}

function precomputeConditionals(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(comboState.comboCharacter.metadata)
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(comboState.comboCharacter.metadata)

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
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals) as CharacterConditionalMap,
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals) as CharacterConditionalMap
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionals.get(teammate.metadata) as CharacterConditional
    const teammateLightConeConditionals = LightConeConditionals.get(teammate.metadata) as LightConeConditional

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
  x.ENEMY_WEAKNESS_BROKEN = x.ENEMY_WEAKNESS_BROKEN || (context.enemyWeaknessBroken ? 1 : 0)
}

function precomputeTeammates(action: OptimizerAction, comboState: ComboState, context: OptimizerContext) {
  // Precompute teammate effects
  const x = action.precomputedX
  const teammateSetEffects = {}
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
      characterConditionals: transformConditionals(action.actionIndex, teammate.characterConditionals) as CharacterConditionalMap,
      lightConeConditionals: transformConditionals(action.actionIndex, teammate.lightConeConditionals) as CharacterConditionalMap
    } as OptimizerAction

    const teammateCharacterConditionals = CharacterConditionals.get(teammate.metadata) as CharacterConditional
    const teammateLightConeConditionals = LightConeConditionals.get(teammate.metadata) as CharacterConditional

    if (teammateCharacterConditionals.precomputeMutualEffects) teammateCharacterConditionals.precomputeMutualEffects(x, teammateAction, context)
    if (teammateCharacterConditionals.precomputeTeammateEffects) teammateCharacterConditionals.precomputeTeammateEffects(x, teammateAction, context)

    if (teammateLightConeConditionals.precomputeMutualEffects) teammateLightConeConditionals.precomputeMutualEffects(x, teammateAction, context)
    if (teammateLightConeConditionals.precomputeTeammateEffects) teammateLightConeConditionals.precomputeTeammateEffects(x, teammateAction, context)

    for (const [key, value] of [...Object.entries(teammateRequest.relicSetConditionals), ...Object.entries(teammateRequest.ornamentSetConditionals)]) {
      if (value.type == 'boolean') {
        const booleanComboConditional = value as ComboBooleanConditional
        if (!booleanComboConditional.activations[action.actionIndex]) {
          continue
        }
      } else {
        continue
      }
      switch (key) {
        case Sets.BrokenKeel:
          x[Stats.CD] += 0.10
          break
        case Sets.FleetOfTheAgeless:
          x[Stats.ATK_P] += 0.08
          break
        case Sets.PenaconyLandOfTheDreams:
          if (comboState.comboCharacter.metadata.element != teammateRequest.metadata.element) break
          x.ELEMENTAL_DMG += 0.10
          break
        case Sets.LushakaTheSunkenSeas:
          x[Stats.ATK_P] += 0.12
          break
        case Sets.MessengerTraversingHackerspace:
          if (teammateSetEffects[Sets.MessengerTraversingHackerspace]) break
          x[Stats.SPD_P] += 0.12
          break
        case Sets.WatchmakerMasterOfDreamMachinations:
          if (teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) break
          x[Stats.BE] += 0.30
          break
        case SACERDOS_RELIVED_ORDEAL_1_STACK:
          x[Stats.CD] += 0.18
          break
        case SACERDOS_RELIVED_ORDEAL_2_STACK:
          x[Stats.CD] += 0.36
          break
        default:
      }

      // Track unique buffs
      teammateSetEffects[key] = true
    }
  }
}

function transformConditionals(actionIndex: number, conditionals: ComboConditionals) {
  const result = {}
  for (const [key, category] of Object.entries(conditionals)) {
    result[key] = transformConditional(category, actionIndex)
  }

  return result
}

function transformConditional(category: ComboConditionalCategory, actionIndex: number) {
  if (category.type == 'boolean') {
    const booleanCategory = category as ComboBooleanConditional
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
  let newComboAbilities = ['DEFAULT']
  for (let i = 1; i <= 8; i++) {
    if (comboAbilities[i] == null) break
    newComboAbilities.push(comboAbilities[i])
  }
  return newComboAbilities
}
