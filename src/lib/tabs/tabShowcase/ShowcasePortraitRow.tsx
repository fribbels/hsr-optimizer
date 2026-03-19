import { Flex } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { ElementToColor } from 'lib/tabs/tabShowcase/showcaseTabController'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { memo } from 'react'
import styles from './ShowcaseTab.module.css'

export const ShowcasePortraitRow = memo(function ShowcasePortraitRow({
  characters,
  selectedIndex,
  onSelect,
}: {
  characters: ShowcaseTabCharacter[]
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const metadata = getGameMetadata()

  return (
    <Flex justify="center" align="center" gap={4} wrap="wrap">
      {characters.map((char, index) => {
        const charMeta = metadata.characters[char.id]
        const isSelected = index === selectedIndex
        const borderColor = isSelected && charMeta
          ? ElementToColor[charMeta.element]
          : 'var(--border-color)'

        return (
          <div
            key={char.id + '-' + index}
            className={styles.portraitContainer}
            onClick={() => onSelect(index)}
          >
            <img
              className={styles.portraitImage}
              src={Assets.getCharacterAvatarById(char.id)}
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div>
        )
      })}
    </Flex>
  )
})
