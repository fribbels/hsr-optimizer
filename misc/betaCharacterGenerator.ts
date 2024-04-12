// eslint-disable-next-line @typescript-eslint/no-var-requires

// Helper tool for importing beta characters

function run() {
  const character = require('./characterToConvert.json')

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

  // Elements
  // Lightning - Thunder

  // Change these

  const name = 'Boothill'
  const id = '1315'
  const rarity = 5
  const path = 'Rogue'
  const element = 'Physical'
  const max_sp = 120

  // Dont change below

  const convertedCharacter = {
    [id]: {
      id,
      rarity,
      path,
      element,
      max_sp,
      name,
      unreleased: true,
    },
  }

  const characterPromotions = {
    [id]: {
      id,
      values: [],
    },
  }

  for (const value of Object.values(character.Stats)) {
    characterPromotions[id].values.push({
      hp: {
        base: precisionRound(value['HPBase']),
        step: precisionRound(value['HPAdd']),
      },
      atk: {
        base: precisionRound(value['AttackBase']),
        step: precisionRound(value['AttackAdd']),
      },
      def: {
        base: precisionRound(value['DefenceBase']),
        step: precisionRound(value['DefenceAdd']),
      },
      spd: {
        base: precisionRound(value['SpeedBase']),
        step: 0,
      },
      taunt: {
        base: precisionRound(value['BaseAggro']),
        step: 0,
      },
      crit_rate: {
        base: precisionRound(value['CriticalChance']),
        step: 0,
      },
      crit_dmg: {
        base: precisionRound(value['CriticalDamage']),
        step: 0,
      },
    })
  }

  console.log(JSON.stringify(convertedCharacter, null, 4))
  console.log(JSON.stringify(characterPromotions, null, 4))
}

run()
