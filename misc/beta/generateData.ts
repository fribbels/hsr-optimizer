import { exportRaw } from './raw-data'

import fs from 'fs'

const {
  characters,
  relics,
  lightCones
} = exportRaw()

const arrayToMap = (array, key) => {
  return array.reduce((map, obj) => {
    map[obj[key]] = obj
    return map
  }, {})
}

// [Stats.Physical_DMG]: 'Physical',
//   [Stats.Fire_DMG]: 'Fire',
//   [Stats.Ice_DMG]: 'Ice',
//   [Stats.Lightning_DMG]: 'Lightning',
//   [Stats.Wind_DMG]: 'Wind',
//   [Stats.Quantum_DMG]: 'Quantum',
//   [Stats.Imaginary_DMG]: 'Imaginary',
const elementMapping = {
  'Phys': 'Physical',
  'Fire': 'Fire',
  'Ice': 'Ice',
  'Elec': 'Lightning',
  'Wind': 'Wind',
  'Quantum': 'Quantum',
  'Imaginary': 'Imaginary',
}
const cleanedCharacters = characters.map(character => {
  const stats = {
    'HP': character['Stats']['HP'],
    'ATK': character['Stats']['ATK'],
    'DEF': character['Stats']['DEF'],
    'SPD': character['Stats']['SPD'],
    'CRIT Rate': 0.05,
    'CRIT DMG': 0.50,
  }
  return {
    id: '' + character['_id'],
    name: character['Name'],
    rarity: character['Rarity'],
    path: character['Path'],
    element: elementMapping[character['Element']],
    max_sp: character['SP'],
    stats: stats,
  }
})
const characterMap = arrayToMap(cleanedCharacters, 'id')

const cleanedLightcones = lightCones.map(lightCone => {
  return {
    id: '' + lightCone['_id'],
    name: lightCone['Name'],
    rarity: lightCone['Rarity'],
    path: lightCone['Path'],
    stats: lightCone['Stats'],
  }
})
const lightConeMap = arrayToMap(cleanedLightcones, 'id')

const merged = {
  characters: characterMap,
  lightCones: lightConeMap
}

fs.writeFile('./src/data/game_data.json', JSON.stringify(merged, null, 2), (err) => {
  if (err) {
    console.error('Error writing to file', err)
  } else {
    console.log('Done')
  }
});