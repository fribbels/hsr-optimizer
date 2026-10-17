import {
  countTeamPath,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import { AEON_AHA_ID } from 'lib/conditionals/evaluation/ahaAscension'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type LightConeConditionalFunction, type LightConeConfig } from 'types/lightConeConfig'

const conditionals: LightConeConditionalFunction = (s) => {
  const { SOURCE_LC } = Source.lightCone(SeeYouAtTheWorldsEnd.id)
  const sValuesCdPerElation = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesAhaCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffectsContainer: (x, action, context) => {
      const elationCount = countTeamPath(context, PathNames.Elation)
      const ahaOnField = context.characterId == AEON_AHA_ID || teammateMatchesId(context, AEON_AHA_ID) > 0
      const cdBuff = elationCount * sValuesCdPerElation[s] + (ahaOnField ? sValuesAhaCd[s] : 0)

      x.buff(StatKey.CD, cdBuff, x.source(SOURCE_LC))
    },
  }
}

export const SeeYouAtTheWorldsEnd: LightConeConfig = {
  id: '22009',
  conditionals,
}
