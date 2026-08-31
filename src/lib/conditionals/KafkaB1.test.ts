import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { ScoringConfigType } from 'types/metadata'
import { expect, test } from 'vitest'

test('Kafka resolves substats before DPS and none', () => {
  const availableSimulationConfigs = {
    [ScoringConfigType.DPS]: {},
  }

  expect(resolveShowcaseScoringOrder(
    KafkaB1.display.showcaseScoringOrder,
    availableSimulationConfigs,
  )).toEqual([
    ScoringType.SUBSTAT_SCORE,
    ScoringType.DPS_SCORE,
    ScoringType.NONE,
  ])
})
