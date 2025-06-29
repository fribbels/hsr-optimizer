import { Flex } from 'antd'
import { ScoringResults } from 'lib/characterPreview/characterPreviewController'
import StatText from 'lib/characterPreview/StatText'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function ShowcaseStatScore(props: {
  scoringResults: ScoringResults,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    scoringResults,
  } = props

  return (
    <Flex vertical>
      <StatText style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2, textAlign: 'center', color: '#e1a564' }}>
        {t('CharacterPreview.CharacterScore', {
          score: scoringResults.totalScore.toFixed(0),
          grade: scoringResults.totalScore == 0 ? '' : scoringResults.totalRating,
        })}
      </StatText>
    </Flex>
  )
}
