import { ShowcaseRarity } from 'lib/characterPreview/card/ShowcaseRarity'
import { type ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { StatText } from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './ShowcaseCharacterHeader.module.css'

export const ShowcaseCharacterHeader = memo(function ShowcaseCharacterHeader({ showcaseMetadata, scoringType }: {
  showcaseMetadata: ShowcaseMetadata,
  scoringType?: ScoringType,
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        className={classes.headerRow}
        style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: marginVertical, marginTop: marginVertical }}
      >
        <img
          className={classes.elementIcon}
          src={Assets.getElement(characterElement)}
        />
        <ShowcaseRarity rarity={characterMetadata.rarity} />
        <img
          className={classes.elementIcon}
          src={Assets.getPathFromClass(characterPath)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StatText className={classes.characterName}>
          {characterName}
        </StatText>
        <StatText className={classes.characterLevel}>
          {`${t('common:LevelShort', { level: characterLevel })} ${t('common:EidolonNShort', { eidolon: characterEidolon })}`}
        </StatText>
      </div>
    </div>
  )
})
