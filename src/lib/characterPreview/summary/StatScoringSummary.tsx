import { Flex, Typography } from 'antd'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CHARACTER_SCORE } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { filterNonNull } from 'lib/utils/arrayUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

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
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns
    gridTemplateRows: 'repeat(3, auto)', // 3 rows
    gap: '10px', // Spacing between items
    width: '100%',
    marginTop: 20,
  }

  return (
    <Flex vertical gap={10} style={{ marginTop: 20 }}>
      <RelicContainer relic={displayRelics.Head}/>
      <RelicContainer relic={displayRelics.Hands}/>
      <RelicContainer relic={displayRelics.Body}/>
      <RelicContainer relic={displayRelics.Feet}/>
      <RelicContainer relic={displayRelics.PlanarSphere}/>
      <RelicContainer relic={displayRelics.LinkRope}/>
    </Flex>
  )

  // return (
  //   <Flex vertical gap={20} align='center' style={{ width: 1068, marginTop: 20 }}>
  //     <RelicContainer relic={displayRelics.Head}/>
  //     <RelicContainer relic={displayRelics.Hands}/>
  //     <RelicContainer relic={displayRelics.Body}/>
  //   </Flex>
  // )
}

function RelicContainer(props: { relic: Relic }) {
  const { relic } = props
  if (!relic) {
    return <></>
  }
  return (
    <Flex
      style={{
        width: '100%',
        flex: 1,
        borderRadius: 5,
        overflow: 'hidden',
        padding: 10,
        background: 'rgb(29 42 81 / 73%)',
        boxShadow: cardShadowNonInset,
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
      gap={10}
    >
      <RelicPreview setSelectedRelic={() => {}} relic={relic}/>
      <RelicAnalysis relic={relic}/>
    </Flex>
  )
}

function RelicAnalysis(props: { relic: Relic }) {
  return (
    <Flex
      style={{
        // width: 850,
        flex: 1,
        borderRadius: 5,
        overflow: 'hidden',
        padding: 10,
        background: '#243356',
        border: '1px solid #354b7d',
      }}
    >
      test
    </Flex>
  )
}

