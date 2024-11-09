import { Flex } from 'antd'
import i18next from 'i18next'
import { Assets } from 'lib/assets'
import { Character } from 'types/Character'
import { ReactElement } from 'types/Components'

type GenerateCharacterListProps = {
  currentCharacters: Character[]
  excludeCharacters?: Character[]
  withNobodyOption?: boolean
}

type OptionType = {
  value: string
  label: ReactElement | string
  title: string
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

  const options: OptionType[] = currentCharacters
    .filter((character) => !excludeCharacters.includes(character))
    .map((character): OptionType => ({
      value: character.id,
      label:
        (
          <Flex gap={5} align='center'>
            <img
              src={Assets.getCharacterAvatarById(character.id)}
              style={{ height: 22, marginRight: 4 }}
            />
            {i18next.t(`gameData:Characters.${character.id}.Name` as never)}
          </Flex>
        ),
      title: i18next.t(`gameData:Characters.${character.id}.Name` as never),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))

  if (withNobodyOption) {
    options.unshift({ value: 'None', label: 'None', title: 'None' })
  }

  return options
}
