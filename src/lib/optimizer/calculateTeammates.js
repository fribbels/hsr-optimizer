import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Sets, Stats } from 'lib/constants'

export function calculateTeammates(request, params) {
  // Precompute teammate effects
  const precomputedX = params.precomputedX
  const teammateSetEffects = {}
  const teammates = [
    request.teammate0,
    request.teammate1,
    request.teammate2,
  ].filter((x) => !!x && !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    // This is set to null so empty light cones don't get overwritten by the main lc. TODO: There's probably a better place for this
    teammates[i].lightCone = teammates[i].lightCone || null
    const teammateRequest = Object.assign({}, request, teammates[i])

    const teammateCharacterConditionals = CharacterConditionals.get(teammateRequest)
    const teammateLightConeConditionals = LightConeConditionals.get(teammateRequest)

    if (teammateCharacterConditionals.precomputeMutualEffects) teammateCharacterConditionals.precomputeMutualEffects(precomputedX, teammateRequest)
    if (teammateCharacterConditionals.precomputeTeammateEffects) teammateCharacterConditionals.precomputeTeammateEffects(precomputedX, teammateRequest)

    if (teammateLightConeConditionals.precomputeMutualEffects) teammateLightConeConditionals.precomputeMutualEffects(precomputedX, teammateRequest)
    if (teammateLightConeConditionals.precomputeTeammateEffects) teammateLightConeConditionals.precomputeTeammateEffects(precomputedX, teammateRequest)

    switch (teammateRequest.teamOrnamentSet) {
      case Sets.BrokenKeel:
        precomputedX[Stats.CD] += 0.10
        break
      case Sets.FleetOfTheAgeless:
        precomputedX[Stats.ATK_P] += 0.08
        break
      case Sets.PenaconyLandOfTheDreams:
        if (teammateRequest.ELEMENTAL_DMG_TYPE != params.ELEMENTAL_DMG_TYPE) break
        precomputedX[params.ELEMENTAL_DMG_TYPE] += 0.10
        break
      case Sets.LushakaTheSunkenSeas:
        precomputedX[Stats.ATK_P] += 0.12
        break
      default:
    }

    switch (teammateRequest.teamRelicSet) {
      case Sets.MessengerTraversingHackerspace:
        if (teammateSetEffects[Sets.MessengerTraversingHackerspace]) break
        precomputedX[Stats.SPD_P] += 0.12
        break
      case Sets.WatchmakerMasterOfDreamMachinations:
        if (teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) break
        precomputedX[Stats.BE] += 0.30
        break
      default:
    }

    // Track unique buffs
    teammateSetEffects[teammateRequest.teamOrnamentSet] = true
    teammateSetEffects[teammateRequest.teamRelicSet] = true
  }
}

export function calculatePostPrecomputeTeammates(request, params) {
  // Postcompute teammate effects
  const precomputedX = params.precomputedX
  const teammates = [
    request.teammate0,
    request.teammate1,
    request.teammate2,
  ].filter((x) => !!x && !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    // This is set to null so empty light cones don't get overwritten by the main lc. TODO: There's probably a better place for this
    teammates[i].lightCone = teammates[i].lightCone || null
    const teammateRequest = Object.assign({}, request, teammates[i])

    const teammateCharacterConditionals = CharacterConditionals.get(teammateRequest)
    const teammateLightConeConditionals = LightConeConditionals.get(teammateRequest)

    if (teammateCharacterConditionals.postPreComputeMutualEffects) teammateCharacterConditionals.postPreComputeMutualEffects(precomputedX, teammateRequest)
    if (teammateLightConeConditionals.postPreComputeMutualEffects) teammateLightConeConditionals.postPreComputeMutualEffects(precomputedX, teammateRequest)
  }
}