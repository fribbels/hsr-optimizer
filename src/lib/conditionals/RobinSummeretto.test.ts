import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { RobinSummeretto } from 'lib/conditionals/character/1500/RobinSummeretto'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { ScoringConfigType } from 'types/metadata'
import {
  expect,
  test,
} from 'vitest'

test('Robin Summeretto resolves support before DPS, substats, and none', () => {
  const availableSimulationConfigs = {
    [ScoringConfigType.DPS]: {},
    [ScoringConfigType.BUFFER]: {},
  }

  expect(resolveShowcaseScoringOrder(
    RobinSummeretto.display.showcaseScoringOrder,
    availableSimulationConfigs,
  )).toEqual([
    ScoringType.BUFFER_SCORE,
    ScoringType.DPS_SCORE,
    ScoringType.SUBSTAT_SCORE,
    ScoringType.NONE,
  ])
})
