import { Flex } from '@mantine/core'
import { ScoringResults } from 'lib/characterPreview/characterPreviewController'
import { StatText } from 'lib/characterPreview/StatText'
import { useTranslation } from 'react-i18next'
import classes from './ShowcaseStatScore.module.css'

export function ShowcaseStatScore({ scoringResults }: {
  scoringResults: ScoringResults
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  return (
    <Flex direction='column'>
      <StatText className={classes.scoreText}>
        {t('CharacterPreview.CharacterScore', {
          score: scoringResults.totalScore.toFixed(0),
          grade: scoringResults.totalScore === 0 ? '' : scoringResults.totalRating,
        })}
      </StatText>
    </Flex>
  )
}
