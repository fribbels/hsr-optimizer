import { exportRaw } from './raw-data'

import fs from 'fs'

// npx tsx misc/beta/generateData.ts

const unreleasedIds = [
  '1220',
  '1222',
  '1223',
  '23032',
  '23031',
  '21047',
]

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
  const id = '' + character['_id']
  const unreleased = unreleasedIds.includes(id)
  const stats = {
    'HP': character['Stats']['HP'],
    'ATK': character['Stats']['ATK'],
    'DEF': character['Stats']['DEF'],
    'SPD': character['Stats']['SPD'],
    'CRIT Rate': 0.05,
    'CRIT DMG': 0.50,
  }
  return {
    id: id,
    name: character['Name'],
    rarity: character['Rarity'],
    path: character['Path'],
    element: elementMapping[character['Element']],
    max_sp: character['SP'],
    stats: stats,
    unreleased: unreleased
  }
})
const characterMap = arrayToMap(cleanedCharacters, 'id')

const cleanedLightcones = lightCones.map(lightCone => {
  const id = '' + lightCone['_id']
  const unreleased = unreleasedIds.includes(id)
  return {
    id: id,
    name: lightCone['Name'],
    rarity: lightCone['Rarity'],
    path: lightCone['Path'],
    stats: lightCone['Stats'],
    unreleased: unreleased
  }
})
const lightConeMap = arrayToMap(cleanedLightcones, 'id')

const cleanedRelics = relics.map(relic => {
  return {
    id: '' + relic['_id'],
    name: '' + relic['Name'],
    skills: '' + relic['Skills'],
  }
})

const merged = {
  characters: characterMap,
  lightCones: lightConeMap,
  relics: cleanedRelics
}

fs.writeFile('./src/data/game_data.json', JSON.stringify(merged, null, 2), (err) => {
  if (err) {
    console.error('Error writing to file', err)
  } else {
    console.log('Done')
  }
});