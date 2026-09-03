import {
  type SetKey,
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import {
  BasicKey,
  type BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import type { OptimizerContext } from 'types/optimizer'
import {
  describe,
  expect,
  it,
} from 'vitest'

type ElementalRelicSetCase = {
  name: string,
  setKey: SetKey,
  stat: number,
  wearerElement: StatsValues,
}

const cases: ElementalRelicSetCase[] = [
  { name: 'Band of Sizzling Thunder', setKey: 'BandOfSizzlingThunder', stat: BasicKey.LIGHTNING_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Champion of Streetwise Boxing', setKey: 'ChampionOfStreetwiseBoxing', stat: BasicKey.PHYSICAL_DMG_BOOST, wearerElement: Stats.Lightning_DMG },
  { name: 'Eagle of Twilight Line', setKey: 'EagleOfTwilightLine', stat: BasicKey.WIND_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Firesmith of Lava-Forging', setKey: 'FiresmithOfLavaForging', stat: BasicKey.FIRE_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Genius of Brilliant Stars', setKey: 'GeniusOfBrilliantStars', stat: BasicKey.QUANTUM_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Hunter of Glacial Forest', setKey: 'HunterOfGlacialForest', stat: BasicKey.ICE_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Poet of Mourning Collapse', setKey: 'PoetOfMourningCollapse', stat: BasicKey.QUANTUM_DMG_BOOST, wearerElement: Stats.Physical_DMG },
  { name: 'Wastelander of Banditry Desert', setKey: 'WastelanderOfBanditryDesert', stat: BasicKey.IMAGINARY_DMG_BOOST, wearerElement: Stats.Physical_DMG },
]

describe.each(cases)('$name 2-piece effect', ({ setKey, stat, wearerElement }) => {
  it('adds its elemental damage bonus for an off-element wearer', () => {
    const c = new BasicStatsArrayCore(false) as BasicStatsArray
    const context = { elementalDamageType: wearerElement } as OptimizerContext
    const setConfig = setConfigRegistry.get(setKey)

    c.a[stat] = 0.25
    setConfig!.conditionals.p2c?.(c, context)

    expect(c.a[stat]).toBeCloseTo(0.35)
  })
})
