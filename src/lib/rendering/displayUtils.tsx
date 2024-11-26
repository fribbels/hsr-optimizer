import { Flex } from 'antd'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'

type GenerateCharacterListProps = {
  currentCharacters: Character[]
  excludeCharacters?: Character[]
  withNobodyOption?: boolean
  longNameLabel?: boolean
  longNameTitle?: boolean
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
            {
              props.longNameLabel
                ? i18next.t(`gameData:Characters.${character.id}.LongName` as never)
                : i18next.t(`gameData:Characters.${character.id}.Name` as never)
            }
          </Flex>
        ),
      title: props.longNameTitle
        ? i18next.t(`gameData:Characters.${character.id}.LongName` as never)
        : i18next.t(`gameData:Characters.${character.id}.Name` as never),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))

  if (withNobodyOption) {
    options.unshift({ value: 'None', label: 'None', title: 'None' })
  }

  return options
}
