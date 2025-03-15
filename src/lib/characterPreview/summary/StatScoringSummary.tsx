import { Flex, Typography } from 'antd'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CHARACTER_SCORE } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { filterNonNull } from 'lib/utils/arrayUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

// FIXME MED

const { Text } = Typography

export const StatScoringSummary = (props: {
  simScoringResult?: SimulationScore
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
  scoringType: string
}) => {
  const { t, i18n } = useTranslation(['charactersTab', 'common'])

  const {
    simScoringResult,
    displayRelics,
    showcaseMetadata,
    scoringType,
  } = props

  if (scoringType != CHARACTER_SCORE) {
    return <></>
  }

  console.debug(displayRelics)

  const scoringMetadata = DB.getScoringMetadata(showcaseMetadata.characterId)

  filterNonNull(Object.values(displayRelics)).forEach((relic) => {
    const days = scoreTbp(relic, scoringMetadata.stats)
    console.log(days, relic)
  })

  return (
    <Flex vertical gap={20} align='center' style={{ width: 1068 }}>
      test
    </Flex>
  )
}
