import { type ScoringResults } from 'lib/characterPreview/characterPreviewController'
import { StatText } from 'lib/characterPreview/StatText'
import { memo } from 'react'
import classes from './ShowcaseStatScore.module.css'

export const ShowcaseStatScore = memo(function ShowcaseStatScore({ scoringResults }: {
  scoringResults: ScoringResults,
}) {
  return (
    <div>
      <StatText className={classes.scoreText}>
        {`Perfection: ${scoringResults.totalScore.toFixed(1)}%`}
      </StatText>
    </div>
  )
})
