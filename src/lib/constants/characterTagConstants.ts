import { DanHeng } from 'lib/conditionals/character/1000/DanHeng'
import { Himeko } from 'lib/conditionals/character/1000/Himeko'
import { March7th } from 'lib/conditionals/character/1000/March7th'
import { Welt } from 'lib/conditionals/character/1000/Welt'
import { WeltB1 } from 'lib/conditionals/character/1000/WeltB1'
import { ImbibitorLunae } from 'lib/conditionals/character/1200/ImbibitorLunae'
import { March7thImaginary } from 'lib/conditionals/character/1200/March7thImaginary'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Evernight } from 'lib/conditionals/character/1400/Evernight'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  TrailblazerDestructionCaelus,
  TrailblazerDestructionStelle,
} from 'lib/conditionals/character/8000/TrailblazerDestruction'
import {
  TrailblazerElationCaelus,
  TrailblazerElationStelle,
} from 'lib/conditionals/character/8000/TrailblazerElation'
import {
  TrailblazerHarmonyCaelus,
  TrailblazerHarmonyStelle,
} from 'lib/conditionals/character/8000/TrailblazerHarmony'
import {
  TrailblazerPreservationCaelus,
  TrailblazerPreservationStelle,
} from 'lib/conditionals/character/8000/TrailblazerPreservation'
import {
  TrailblazerRemembranceCaelus,
  TrailblazerRemembranceStelle,
} from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import type { OptimizerContext } from 'types/optimizer'

export const TRAILBLAZE_COMPANION_IDS = new Set([
  March7th.id,
  DanHeng.id,
  Himeko.id,
  Welt.id,
  WeltB1.id,
  ImbibitorLunae.id,
  March7thImaginary.id,
  Sunday.id,
  Evernight.id,
  PermansorTerrae.id,
  TrailblazerDestructionCaelus.id,
  TrailblazerDestructionStelle.id,
  TrailblazerPreservationCaelus.id,
  TrailblazerPreservationStelle.id,
  TrailblazerHarmonyCaelus.id,
  TrailblazerHarmonyStelle.id,
  TrailblazerElationCaelus.id,
  TrailblazerElationStelle.id,
  TrailblazerRemembranceCaelus.id,
  TrailblazerRemembranceStelle.id,
])

export function countTeamTrailblazeCompanion(context: OptimizerContext) {
  return (TRAILBLAZE_COMPANION_IDS.has(context.characterId) ? 1 : 0)
    + (TRAILBLAZE_COMPANION_IDS.has(context.teammate0Metadata?.characterId) ? 1 : 0)
    + (TRAILBLAZE_COMPANION_IDS.has(context.teammate1Metadata?.characterId) ? 1 : 0)
    + (TRAILBLAZE_COMPANION_IDS.has(context.teammate2Metadata?.characterId) ? 1 : 0)
}
