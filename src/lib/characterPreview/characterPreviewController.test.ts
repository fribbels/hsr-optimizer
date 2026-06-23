// @vitest-environment jsdom
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { Blade } from 'lib/conditionals/character/1200/Blade'
import {
  Constants,
  Parts,
  Stats,
  type SubStats,
} from 'lib/constants/constants'
import type { AugmentedStats } from 'lib/relics/relicAugmenter'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Metadata } from 'lib/state/metadataInitializer'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import type { Character } from 'types/character'
import type { Relic } from 'types/relic'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

function makeWeightedRelic(): Relic {
  return {
    enhance: 15,
    grade: 5,
    part: Parts.Hands,
    set: 'Longevous Disciple',
    main: {
      stat: Stats.ATK,
      value: 100,
    },
    substats: [Stats.HP_P, Stats.CR, Stats.CD, Stats.SPD].map((stat) => ({
      stat,
      value: StatCalculator.getMaxedSubstatValue(stat),
    })),
    previewSubstats: [],
    weightScore: 0,
    ageIndex: 0,
    augmentedStats: {} as AugmentedStats,
    initialRolls: 0,
    id: '3cc6d912-6f7f-4dd7-8d1e-484033f15f5f',
    equippedBy: Blade.id,
  }
}

function makeCharacter(relic: Relic): Character {
  return {
    id: Blade.id,
    equipped: {
      [Parts.Hands]: relic,
    } as unknown as Character['equipped'],
    form: {
      characterId: Blade.id,
    } as Character['form'],
  }
}

test('leaderboard preview relic scores ignore user scoring overrides', () => {
  const character = Blade.id

  try {
    const stats = {} as Record<SubStats, number>
    for (const s of Constants.SubStats) stats[s] = 0
    useScoringStore.getState().setScoringMetadataOverrides({ [character]: { stats } })

    const relic = makeWeightedRelic()
    const showcaseCharacter = makeCharacter(relic)

    const leaderboardPreview = getPreviewRelics(ShowcaseSource.LEADERBOARD, showcaseCharacter, {})
    const showcasePreview = getPreviewRelics(ShowcaseSource.SHOWCASE_TAB, showcaseCharacter, {})

    expect(leaderboardPreview.scoringResults.relics[0].percentScore).toBeGreaterThan(0)
    expect(showcasePreview.scoringResults.relics[0].percentScore).toBe(0)
  } finally {
    useScoringStore.getState().clearCharacterOverrides(character)
  }
})
