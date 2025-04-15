import { Button, Card, Flex, Form as AntDForm, InputNumber, Radio } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { CharacterEidolonFormRadio, RadioButton } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { HeaderText } from 'lib/ui/HeaderText'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

type BenchmarkForm = {
  characterId: string
  lightConeId: string
}

const GAP = 8
const HEADER_GAP = 5
const PANEL_WIDTH = 250

export default function BenchmarksTab(): ReactElement {
  const [benchmarkForm] = AntDForm.useForm<BenchmarkForm>()

  return (
    <AntDForm
      form={benchmarkForm}
      preserve={false}
      layout='vertical'
    >
      <Flex vertical style={{ height: 1400, width: 1200 }} align='center' gap={GAP}>
        <Flex gap={GAP * 3}>
          <LeftPanel/>
          <MiddlePanel/>
          <RightPanel/>
        </Flex>
        <Button onClick={() => console.log(benchmarkForm.getFieldsValue())}>
          Generate benchmarks
        </Button>
      </Flex>
    </AntDForm>
  )
}

function LeftPanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''
  const lightConeId = AntDForm.useWatch('lightConeId', form) ?? ''

  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const offset = lightConeMetadata?.imageCenter ?? undefined

  return (
    <Flex vertical gap={GAP}>
      <Flex vertical gap={GAP}>
        <HeaderText>Benchmark</HeaderText>
        <CenteredImage
          src={Assets.getCharacterPreviewById(characterId)}
          containerW={250}
          containerH={300}
        />
      </Flex>
      <CenteredImage
        src={Assets.getLightConePortraitById(lightConeId)}
        containerW={250}
        containerH={90}
        zoom={1.05}
        centerY={offset}
        relativeHeight={585}
      />
    </Flex>
  )
}

function MiddlePanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''

  return (
    <Flex vertical gap={GAP} style={{ width: PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>Character</HeaderText>
        <AntDForm.Item name='characterId' noStyle>
          <CharacterSelect value=''/>
        </AntDForm.Item>
        <CharacterEidolonFormRadio/>
      </Flex>

      <Flex vertical gap={GAP}>
        <HeaderText>Light Cone</HeaderText>
        <AntDForm.Item name='lightConeId' noStyle>
          <LightConeSelect value='' characterId={characterId}/>
        </AntDForm.Item>
        <LightConeSuperimpositionFormRadio/>
      </Flex>

      <TeammatesSection/>
    </Flex>
  )
}

function RightPanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''

  return (
    <Flex vertical gap={GAP} style={{ width: PANEL_WIDTH }}>
      <HeaderText>Benchmark type</HeaderText>
      <Flex style={{ width: '100%' }}>
        <AntDForm.Item name='percentage' noStyle>
          <Radio.Group
            defaultValue='a'
            buttonStyle='solid'
            style={{ width: '100%', display: 'flex' }}
          >
            <RadioButton value={100} text='100%'/>
            <RadioButton value={200} text='200%'/>
          </Radio.Group>
        </AntDForm.Item>
      </Flex>

      <HeaderText>Benchmark sets</HeaderText>
      <Flex vertical gap={HEADER_GAP}>
        <SetsSection simType={StatSimTypes.SubstatRolls}/>
      </Flex>

      <HeaderText>Benchmark basic SPD</HeaderText>
      <AntDForm.Item name='basicSpd' noStyle>
        <InputNumber style={{ width: '100%' }}/>
      </AntDForm.Item>
    </Flex>
  )
}

function TeammatesSection(props: { x?: string }) {
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

function Teammate(props: { x?: string }) {
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
