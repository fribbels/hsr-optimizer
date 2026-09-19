import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { SilverWolfB1 } from 'lib/conditionals/character/1000/SilverWolfB1'
import { Fugue } from 'lib/conditionals/character/1200/Fugue'
import { Aventurine } from 'lib/conditionals/character/1300/Aventurine'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { type CharacterConfig } from 'types/characterConfig'
import { ScoringConfigType } from 'types/metadata'
import { expect, test } from 'vitest'

interface ShowcaseOrderCase {
  name: string
  config: CharacterConfig
  availableSimulationConfigs: Partial<Record<ScoringConfigType, unknown>>
  expectedOrder: readonly ScoringType[]
}

const cases: ShowcaseOrderCase[] = [
  {
    name: 'Aventurine',
    config: Aventurine,
    availableSimulationConfigs: { [ScoringConfigType.SHIELD]: {} },
    expectedOrder: [ScoringType.SUBSTAT_SCORE, ScoringType.SHIELD_SCORE, ScoringType.NONE],
  },
  ...[Cipher, Fugue, SilverWolfB1, Yaoguang].map((config): ShowcaseOrderCase => ({
    name: config.id,
    config,
    availableSimulationConfigs: { [ScoringConfigType.DPS]: {} },
    expectedOrder: [ScoringType.SUBSTAT_SCORE, ScoringType.DPS_SCORE, ScoringType.NONE],
  })),
]

test.each(cases)('$name resolves substats first', ({
  config,
  availableSimulationConfigs,
  expectedOrder,
}) => {
  expect(resolveShowcaseScoringOrder(
    config.display.showcaseScoringOrder,
    availableSimulationConfigs,
  )).toEqual(expectedOrder)
})
