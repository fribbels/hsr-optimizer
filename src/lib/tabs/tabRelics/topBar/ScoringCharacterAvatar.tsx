import { Box, Flex, Text, UnstyledButton } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import classes from './ScoringCharacterAvatar.module.css'

export function ScoringCharacterAvatar({ characterId, onCharacterChange, onScoringClick }: {
  characterId: CharacterId | null
  onCharacterChange: (id: CharacterId | null) => void
  onScoringClick: () => void
}) {
  const { t } = useTranslation('gameData')

  const characterName = characterId
    ? t(`Characters.${characterId}.Name`)
    : null

  return (
    <UnstyledButton
      className={classes.button}
      onClick={() => onCharacterChange(characterId)}
    >
      <Box className={classes.ringWrapper}>
        <Box className={classes.ring}>
          {characterId
            ? (
              <img
                src={Assets.getCharacterAvatarById(characterId)}
                alt={characterName ?? ''}
                className={classes.avatar}
              />
            )
            : <Box className={classes.placeholder} />}
        </Box>
        <Box className={classes.statusDot} />
      </Box>

      <Flex direction="column" className={classes.labelGroup}>
        <Text className={classes.scoringLabel} component="span">
          Scoring
        </Text>
        <Text className={classes.characterName} component="span">
          {characterName ?? 'Select...'}
        </Text>
      </Flex>

      <Text className={classes.chevron} component="span">
        ▾
      </Text>
    </UnstyledButton>
  )
}
