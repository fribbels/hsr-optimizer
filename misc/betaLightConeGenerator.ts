// eslint-disable-next-line @typescript-eslint/no-var-requires

// Helper tool for importing beta light cones

function run() {
  const lightCone = require('./lightConeToConvert.json')

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

  const lcName = 'Concert for Two'
  const id = '21043'
  const rarity = 5
  const path = 'Knight'

  const convertedLightCone = {
    [id]: {
      id,
      rarity,
      path,
      name: lcName,
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

  console.log(JSON.stringify(convertedLightCone, null, 4))
  console.log(JSON.stringify(lightConePromotions, null, 4))
}

run()
