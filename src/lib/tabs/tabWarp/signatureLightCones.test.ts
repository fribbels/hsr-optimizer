import gameData from 'data/game_data.json' with { type: 'json' }
import {
  getSignatureLightConeId,
  SignatureLightConeByCharacterId,
} from 'lib/tabs/tabWarp/signatureLightCones'
import {
  expect,
  test,
} from 'vitest'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

test('signature light cone mappings point to existing characters and light cones', () => {
  for (const [characterId, lightConeId] of Object.entries(SignatureLightConeByCharacterId)) {
    expect(gameData.characters[characterId as CharacterId]).toBeDefined()
    expect(gameData.lightCones[lightConeId as LightConeId]).toBeDefined()
  }
})

test('character variants inherit their base character signature light cone', () => {
  const variantCharacterIds = Object.keys(gameData.characters)
    .filter((characterId) => characterId.endsWith('b1')) as CharacterId[]

  for (const characterId of variantCharacterIds) {
    const baseCharacterId = characterId.slice(0, -2) as CharacterId
    const baseSignatureLightConeId = getSignatureLightConeId(baseCharacterId)

    if (!baseSignatureLightConeId) continue

    expect(getSignatureLightConeId(characterId)).toBe(baseSignatureLightConeId)
  }
})
