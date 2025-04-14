import { Button, Card, Flex, Typography } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import { MainStatsSection, SetsSection, STAT_SIMULATION_OPTIONS_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { HeaderText } from 'lib/ui/HeaderText'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

const { Text } = Typography

export default function BenchmarksTab(): ReactElement {
  return (
    <Flex vertical style={{ height: 1400, width: 950 }} align='center' gap={10}>
      <Flex>
        <Flex vertical gap={5} style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }}>
          <SetsSection simType={StatSimTypes.SubstatRolls}/>
          <MainStatsSection simType={StatSimTypes.SubstatRolls}/>
          <TeammatesSection/>
        </Flex>
      </Flex>
      <Button>
        Generate benchmarks
      </Button>
    </Flex>
  )
}

function TeammatesSection(props: {}) {
  return (
    <Flex vertical>
      <HeaderText>Teammates</HeaderText>
      <Flex justify='space-around'>
        <Teammate/>
        <Teammate/>
        <Teammate/>
      </Flex>
    </Flex>
  )
}

const iconSize = 64

function Teammate(props: {}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const teammate = {
    characterId: '1212',
    characterEidolon: 0,
    lightCone: '23014',
    lightConeSuperimposition: 1,
  }
  return (
    <Card.Grid
      style={{
        width: '33.3333%',
        textAlign: 'center',
        padding: 1,
        boxShadow: 'none',
        // background: token.colorBgLayout,
      }}
      hoverable={true}
      onClick={() => {
        // setCharacterModalInitialCharacter({ form: teammate } as Character)
        // setCharacterModalOpen(true)
        //
        // setSelectedTeammateIndex(index)
      }}
      className='custom-grid'
    >
      <Flex vertical align='center' gap={0}>
        <img
          src={Assets.getCharacterAvatarById('1212')}
          style={{
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize,
            backgroundColor: 'rgba(124, 124, 124, 0.1)',
            border: showcaseOutline,
          }}
        />
        <OverlayText text={t('common:EidolonNShort', { eidolon: teammate.characterEidolon })} top={-12}/>
        {/* <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{ height: iconSize, marginTop: -3 }}/> */}
        <img src={Assets.getBlankLightCone()} style={{ height: iconSize, marginTop: -3 }}/>
        <OverlayText
          text={t('common:SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </Card.Grid>
  )
}
