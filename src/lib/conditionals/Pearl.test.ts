import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { Pearl } from 'lib/conditionals/character/1500/Pearl'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { ScoringConfigType } from 'types/metadata'
import { expect, test } from 'vitest'

test('Pearl resolves substats before heal and none', () => {
  const availableSimulationConfigs = {
    [ScoringConfigType.HEAL]: {},
  }

  expect(resolveShowcaseScoringOrder(
    Pearl.display.showcaseScoringOrder,
    availableSimulationConfigs,
  )).toEqual([
    ScoringType.SUBSTAT_SCORE,
    ScoringType.HEAL_SCORE,
    ScoringType.NONE,
  ])
})
