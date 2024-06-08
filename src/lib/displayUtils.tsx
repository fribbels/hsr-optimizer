import DB from 'lib/db'
import { Flex } from 'antd'
import { Assets } from 'lib/assets'
import { Character } from 'types/Character'

type GenerateCharacterListProps = {
  currentCharacters: Character[]
  excludeCharacters?: Character[]
  withNobodyOption?: boolean
}
// Character selector options from current characters with some customization parameters
export function generateCharacterList(
  props: Partial<GenerateCharacterListProps>,
) {
  const {
    currentCharacters,
    excludeCharacters,
    withNobodyOption,
  } = {
    ...{
      currentCharacters: [],
      excludeCharacters: [],
      withNobodyOption: true,
    },
    ...props,
  }

  const characterData = DB.getMetadata().characters

  const options = currentCharacters
    .filter((character) => !excludeCharacters.includes(character))
    .map((character) => ({
      value: character.id,
      label:
        (
          <Flex gap={5} align="center">
            <img
              src={Assets.getCharacterAvatarById(character.id)}
              style={{ height: 22, marginRight: 4 }}
            />
            {characterData[character.id].displayName}
          </Flex>
        ),
      title: characterData[character.id].displayName,
    }))
    .sort((a, b) => a.title.localeCompare(b.title))

  if (withNobodyOption) {
    options.unshift({ value: 'None', label: 'None', title: 'None' })
  }

  return options
}
