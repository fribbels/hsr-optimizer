import { Flex } from 'antd'
import { TFunction } from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { currentLocale } from 'lib/utils/i18nUtils'
import { ReactNode } from 'react'
import { Character } from 'types/character'

type GenerateCharacterListOptions = {
  currentCharacters: Character[],
  excludeCharacters?: Character[],
  withNobodyOption?: boolean,
  longNameLabel?: boolean,
  longNameTitle?: boolean,
}

type OptionType = {
  value: string,
  label: ReactNode,
  title: string,
}

// Character selector options from current characters with some customization parameters
export function generateCharacterList(
  listOptions: Partial<GenerateCharacterListOptions>,
  t: TFunction<'gameData', 'Characters'>,
) {
  const {
    currentCharacters,
    excludeCharacters,
    withNobodyOption,
  } = {
    currentCharacters: [],
    excludeCharacters: [],
    withNobodyOption: true,
    ...listOptions,
  }

  const options: OptionType[] = currentCharacters
    .filter((character) => !excludeCharacters.includes(character))
    .map((character): OptionType => ({
      value: character.id,
      label: (
        <Flex gap={5} align='center'>
          <img
            src={Assets.getCharacterAvatarById(character.id)}
            style={{ height: 22, marginRight: 4 }}
          />
          {listOptions.longNameLabel
            ? t(`${character.id}.LongName`)
            : t(`${character.id}.Name`)}
        </Flex>
      ),
      title: listOptions.longNameTitle
        ? t(`${character.id}.LongName`)
        : t(`${character.id}.Name`),
    }))
    .sort(sortAlphabeticEmojiLast('title'))

  if (withNobodyOption) {
    options.unshift({ value: 'None', label: 'None', title: 'None' })
  }

  return options
}

export function sortAlphabeticEmojiLast(): (a: string, b: string) => number
export function sortAlphabeticEmojiLast<T extends string, R extends Record<T, string>>(propKey: T): (a: R, b: R) => number
export function sortAlphabeticEmojiLast<T extends string, R extends Record<T, string>>(propKey?: T) {
  if (propKey) {
    return (a: R, b: R) => {
      if (hasEmoji(a[propKey]) && !hasEmoji(b[propKey])) return 1
      if (!hasEmoji(a[propKey]) && hasEmoji(b[propKey])) return -1
      return a[propKey].localeCompare(b[propKey], currentLocale())
    }
  } else {
    return (a: string, b: string) => {
      if (hasEmoji(a) && !hasEmoji(b)) return 1
      if (!hasEmoji(a) && hasEmoji(b)) return -1
      return a.localeCompare(b, currentLocale())
    }
  }
}

function hasEmoji(str: string) {
  const numOrEmojiCount = /\p{Emoji}/u.exec(str)?.length ?? 0
  const numCount = /\p{Number}/u.exec(str)?.length ?? 0
  return numOrEmojiCount > numCount
}
