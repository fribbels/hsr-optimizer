import { Flex, Typography } from 'antd'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { enrichRelicAnalysis, RelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { CHARACTER_SCORE } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RelicSubstatMetadata } from 'types/relic'

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

  const characterId = showcaseMetadata.characterId
  const scoringMetadata = DB.getScoringMetadata(showcaseMetadata.characterId)

  const enrichedRelics = enrichRelicAnalysis(displayRelics, scoringMetadata, characterId)

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns
    gridTemplateRows: 'repeat(3, auto)', // 3 rows
    gap: '10px', // Spacing between items
    width: '100%',
    marginTop: 20,
  }

  return (
    <Flex vertical gap={10} style={gridStyle}>
      <RelicContainer relicAnalysis={enrichedRelics.Head}/>
      <RelicContainer relicAnalysis={enrichedRelics.Hands}/>
      <RelicContainer relicAnalysis={enrichedRelics.Body}/>
      <RelicContainer relicAnalysis={enrichedRelics.Feet}/>
      <RelicContainer relicAnalysis={enrichedRelics.PlanarSphere}/>
      <RelicContainer relicAnalysis={enrichedRelics.LinkRope}/>
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

function RelicContainer(props: { relicAnalysis?: RelicAnalysis }) {
  const { relicAnalysis } = props
  const cardStyle = {
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
    minHeight: 302,
  }
  if (!relicAnalysis) {
    return (
      <div style={cardStyle}/>
    )
  }
  return (
    <Flex
      style={cardStyle}
      gap={10}
    >
      <RelicPreview setSelectedRelic={() => {}} relic={relicAnalysis.relic}/>
      <RelicAnalysisCard relicAnalysis={relicAnalysis}/>
    </Flex>
  )
}

const cardStyle = {
  flex: 1,
  borderRadius: 5,
  overflow: 'hidden',
  padding: 10,
  background: '#243356',
  border: '1px solid rgba(255, 255, 255, 0.10)',
}

function RelicAnalysisCard(props: { relicAnalysis?: RelicAnalysis }) {
  const { relicAnalysis } = props
  if (!relicAnalysis) {
    return (
      <div style={cardStyle}/>
    )
  }
  return (
    <Flex vertical style={{ width: '100%' }} gap={10}>
      <Flex style={{ height: 110 }} gap={10}>
        <MetricCard/>
        <MetricCard/>
      </Flex>
      <Flex style={{ ...cardStyle, height: 55 }} gap={10}>
        test
      </Flex>
      <Flex style={{ height: 40 }} gap={10}>
        <QualityCard/>
      </Flex>
    </Flex>
  )
}

function QualityCard(props: {}) {
  return (
    <Flex
      style={{
        backgroundColor: '#3248a0',
        width: '100%',
      }}
      justify='space-between'
    >
      .
    </Flex>
  )
}

function MetricCard(props: {}) {
  return (
    <Flex
      style={{
        ...cardStyle,
        padding: '6px 10px',
        backgroundColor: '#304878',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      }}
      vertical
      flex={1}
      justify='space-around'
      gap={10}
    >
      <Flex vertical>
        <span style={{
          fontSize: '13px',
          color: '#9FAFCF',
        }}
        >
          Days
        </span>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#E0E6F2',
        }}
        >
          2355
        </span>
      </Flex>
      <Flex vertical>
        <span style={{
          fontSize: '13px',
          color: '#9FAFCF',
        }}
        >
          Days
        </span>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#E0E6F2',
        }}
        >
          2355
        </span>
      </Flex>
    </Flex>
  )
}

function TempSubstat(props: { substat: RelicSubstatMetadata }) {
  const { substat } = props
  const rolls = substat.rolls!
  return (
    <span>
      {`High: ${rolls.high}, Mid: ${rolls.mid}, Low: ${rolls.low} - ${substat.stat}`}
    </span>
  )
}

{ /* <Flex vertical> */ }
{ /*  <span> */ }
{ /*    {localeNumberComma(relicAnalysis.estDays)} Days */ }
{ /*  </span> */ }
{ /*  <span> */ }
{ /*    {localeNumberComma(relicAnalysis.estTbp)} TBP */ }
{ /*  </span> */ }
{ /*  <span> */ }
{ /*    {localeNumber_0(relicAnalysis.currentPotential)} % Perfection */ }
{ /*  </span> */ }
{ /*  <span> */ }
{ /*    {localeNumber_0(relicAnalysis.rerollPotential - relicAnalysis.currentPotential)} % Avg Reroll Δ */ }
{ /*  </span> */ }
{ /*  <TempSubstat substat={relicAnalysis.relic.substats[0]}/> */ }
{ /*  <TempSubstat substat={relicAnalysis.relic.substats[1]}/> */ }
{ /*  <TempSubstat substat={relicAnalysis.relic.substats[2]}/> */ }
{ /*  <TempSubstat substat={relicAnalysis.relic.substats[3]}/> */ }
{ /* </Flex> */ }
