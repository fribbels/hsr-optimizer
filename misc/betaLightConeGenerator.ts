// eslint-disable-next-line @typescript-eslint/no-var-requires

// Helper tool for importing beta light cones
// npx tsx betaLightConeGenerator.ts

import lightCone from './lightConeToConvert.json'

function run() {

  function precisionRound(number, precision = 5) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }

  // Paths
  // Harmony - Shaman
  // Preservation - Knight
  // Nihility - Warlock
  // Destruction - Warrior
  // Abundance - Priest
  // Hunt - Rogue
  // Erudition - Mage

  const lcName = 'Eternal Calculus'
  const id = '24004'
  const rarity = 5
  const path = 'Mage'

  const convertedLightCone = {
    [id]: {
      id,
      rarity,
      path,
      name: lcName,
      unreleased: true,
    },
  }

  const lightConePromotions = {
    [id]: {
      id,
      values: [],
    },
  }

  for (const value of Object.values(lightCone.Stats)) {
    lightConePromotions[id].values.push({
      hp: {
        base: precisionRound(value['BaseHP']),
        step: precisionRound(value['BaseHPAdd']),
      },
      atk: {
        base: precisionRound(value['BaseAttack']),
        step: precisionRound(value['BaseAttackAdd']),
      },
      def: {
        base: precisionRound(value['BaseDefence']),
        step: precisionRound(value['BaseDefenceAdd']),
      },
    })
  }

  console.log(JSON.stringify(lightConePromotions, null, 4))
  console.log(JSON.stringify(convertedLightCone, null, 4))
}

run()
