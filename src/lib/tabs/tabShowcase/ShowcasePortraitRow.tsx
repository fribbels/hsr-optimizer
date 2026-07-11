import { Flex } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import styles from 'lib/tabs/tabShowcase/ShowcaseTab.module.css'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { memo } from 'react'

export const ShowcasePortraitRow = memo(function ShowcasePortraitRow({
  characters,
  selectedIndex,
  onSelect,
}: {
  characters: ShowcaseTabCharacter[],
  selectedIndex: number,
  onSelect: (index: number) => void,
}) {
  return (
    <Flex justify='center' align='center' gap={20} wrap='wrap'>
      {characters.map((char, index) => (
        <div
          key={char.id + '-' + index}
          className={index === selectedIndex ? styles.portraitContainerSelected : styles.portraitContainer}
          onClick={() => onSelect(index)}
        >
          <img
            className={styles.portraitImage}
            src={Assets.getCharacterAvatarById(char.id)}
          />
        </div>
      ))}
    </Flex>
  )
})
