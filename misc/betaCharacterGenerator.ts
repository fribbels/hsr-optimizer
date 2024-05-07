// eslint-disable-next-line @typescript-eslint/no-var-requires

// Helper tool for importing beta characters
// npx tsx betaCharacterGenerator.ts

import character from './characterToConvert.json'

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

  // Elements
  // Lightning - Thunder

  // Change these

  const name = 'Jade'
  const id = '1314'
  const rarity = 5
  const path = 'Mage'
  const element = 'Quantum'
  const max_sp = 140

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

  console.log(JSON.stringify(characterPromotions, null, 4))
  console.log(JSON.stringify(convertedCharacter, null, 4))
}

run()
