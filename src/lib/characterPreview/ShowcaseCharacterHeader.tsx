import { Flex } from '@mantine/core'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { ShowcaseRarity } from 'lib/characterPreview/ShowcaseRarity'
import { StatText } from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './ShowcaseCharacterHeader.module.css'

export const ShowcaseCharacterHeader = memo(function ShowcaseCharacterHeader({ showcaseMetadata, scoringType }: {
  showcaseMetadata: ShowcaseMetadata
  scoringType?: ScoringType
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    characterLevel,
    characterEidolon,
    characterName,
    characterPath,
    characterElement,
    characterMetadata,
  } = showcaseMetadata

  const marginVertical = scoringType === ScoringType.NONE ? 12 : 4

  return (
    <Flex direction='column'>
      <Flex justify='space-around' className={classes.headerRow} style={{ marginBottom: marginVertical, marginTop: marginVertical }} align='center'>
        <img
          className={classes.elementIcon}
          src={Assets.getElement(characterElement)}
        />
        <ShowcaseRarity rarity={characterMetadata.rarity} />
        <img
          className={classes.elementIcon}
          src={Assets.getPathFromClass(characterPath)}
        />
      </Flex>
      <Flex direction='column'>
        <StatText className={classes.characterName}>
          {characterName}
        </StatText>
        <StatText className={classes.characterLevel}>
          {`${t('common:LevelShort', { level: characterLevel })} ${t('common:EidolonNShort', { eidolon: characterEidolon })}`}
        </StatText>
      </Flex>
    </Flex>
  )
})
