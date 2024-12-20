import { AimOutlined, ClearOutlined, LineChartOutlined, LockOutlined, StopOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Modal } from 'antd'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { iconSize } from 'lib/constants/constantsUi'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'

import { Renderer } from 'lib/rendering/renderer'
import DB from 'lib/state/db'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { GenerateStat, SubstatDetails } from 'lib/tabs/tabRelics/relicPreview/GenerateStat'
import RelicStatText from 'lib/tabs/tabRelics/relicPreview/RelicStatText'
import { showcaseTransition } from 'lib/utils/colorUtils'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

export type ShowcaseTheme = {
  cardBackgroundColor: string
  cardBorderColor: string
}

export function RelicPreview(props: {
  relic?: Relic
  source?: ShowcaseSource
  characterId?: string
  score?: RelicScoringResult
  setEditModalOpen?: (open: boolean) => void
  setAddModalOpen?: (open: boolean) => void
  setSelectedRelic: (relic: Relic) => void
  showcaseTheme?: ShowcaseTheme
  withHoverButtons?: boolean
}) {
  const { t } = useTranslation('common')
  const {
    source,
    characterId,
    score,
    setEditModalOpen,
    setAddModalOpen,
    setSelectedRelic,
    showcaseTheme,
    withHoverButtons,
  } = props
  const placeholderRelic: Partial<Relic> = {
    enhance: 0,
    part: undefined,
    set: undefined,
    grade: 0,
    substats: [],
    main: undefined,
    equippedBy: undefined,
  }
  const relic: Relic = {
    ...placeholderRelic,
    ...props.relic,
  } as Relic

  const [hovered, setHovered] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)
  const [locatorOpen, setLocatorOpen] = useState(false)

  const relicSrc = relic.set ? Assets.getSetImage(relic.set, relic.part) : Assets.getBlank()
  const equippedBySrc = relic.equippedBy ? Assets.getCharacterAvatarById(relic.equippedBy) : Assets.getBlank()
  const scored = score !== undefined
  const cardWidth = 200
  const hoverable = !source // CHARACTER_TAB == 0 so no need to check separately from undefined

  const cardClicked = () => {
    if ((!relic.id && !characterId) || source == ShowcaseSource.SHOWCASE_TAB || source == ShowcaseSource.BUILDS_MODAL) return

    if (!relic.id) {
      console.log(`Add new relic for characterId=${characterId}.`)
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      setSelectedRelic(relic)
      setAddModalOpen?.(true)
    } else {
      setSelectedRelic(relic)
      setEditModalOpen?.(true)
    }
  }

  function reserveRelic() {
    if (!props.relic || !props.characterId) return
    const newRelic: Relic = props.relic
    newRelic.excluded = Object.values(DB.getMetadata().characters)
      .map((x) => x.id)
      .filter((x) => x !== props.characterId)
    newRelic.excludedCount = 1
    DB.setRelic(newRelic)
    window.setRelicRows(DB.getRelics()) // need to manually trigger a re-render of the grid to update restriction icons
  }

  function excludeRelic() {
    if (!props.relic || !props.characterId) return
    const newRelic: Relic = props.relic
    if (newRelic.excluded.includes(props.characterId)) return
    newRelic.excluded.push(props.characterId)
    newRelic.excludedCount++
    DB.setRelic(newRelic)
    window.setRelicRows(DB.getRelics())
  }

  function clearRestrictions() {
    if (!props.relic || !props.characterId) return
    const newRelic: Relic = props.relic
    newRelic.excluded = []
    newRelic.excludedCount = 0
    DB.setRelic(newRelic)
    window.setRelicRows(DB.getRelics())
  }

  return (
    <Card
      rootClassName='RelicPreviewCard'
      size='small'
      hoverable={hoverable}
      onClick={locatorOpen ? () => {} : cardClicked}
      style={{
        width: cardWidth,
        height: 280,
        backgroundColor: showcaseTheme?.cardBackgroundColor,
        borderColor: hovered && !buttonHovered && hoverable ? 'rgba(255, 255, 255, 0.40)' : showcaseTheme?.cardBorderColor,
        transition: showcaseTransition(),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex vertical justify='space-between' style={{ height: 255 }}>
        <Flex justify='space-between' align='center'>
          <img
            style={{
              height: 50,
              width: 50,
            }}
            title={relic.set}
            src={relicSrc}
          />
          <Flex vertical align='center'>
            <Flex align='center' gap={5}>
              {Renderer.renderGrade(relic)}
              <Flex style={{ width: 30 }} justify='space-around'>
                <RelicStatText>
                  {relic.id != undefined ? `+${relic.enhance}` : ''}
                </RelicStatText>
              </Flex>
            </Flex>
          </Flex>
          <img
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              outline: relic.equippedBy ? '1px solid rgba(125, 125, 125, 0.2)' : undefined,
              backgroundColor: relic.equippedBy ? 'rgba(0, 0, 0, 0.1)' : undefined,
            }}
            src={equippedBySrc}
          />
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        {GenerateStat(relic.main as SubstatDetails, true, relic)}

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex vertical gap={0}>
          {GenerateStat(relic.substats[0], false, relic)}
          {GenerateStat(relic.substats[1], false, relic)}
          {GenerateStat(relic.substats[2], false, relic)}
          {GenerateStat(relic.substats[3], false, relic)}
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>
        <div style={{ height: 22, overflowX: 'clip', width: 188, position: 'relative' }}>
          <Flex
            aria-hidden={!relic.id || (hovered && withHoverButtons)}
            justify='space-between'
            style={{
              height: 22,
              position: 'relative',
              paddingRight: 12,
              zIndex: 1,
              opacity: !(hovered && withHoverButtons) ? 1 : 0,
              transition: 'opacity 0.5s cubic-bezier(.23,1,.32,1)',
            }}
          >
            <Flex gap={2}>
              <img
                src={(scored) ? Assets.getStarBw() : Assets.getBlank()}
                style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
              >
              </img>
              <RelicStatText>
                {(scored) ? t('Score') : ''}
              </RelicStatText>
            </Flex>
            <RelicStatText>
              {(scored) ? `${score.score} (${score.rating})${score.meta?.modified ? ' *' : ''}` : ''}
            </RelicStatText>
          </Flex>
          <Flex
            aria-hidden={!hovered || !withHoverButtons || !relic.id}
            justify='space-between'
            style={{
              bottom: 28,
              position: 'relative',
              paddingRight: 12,
              zIndex: 2,
              transform: `translateX(${hovered && withHoverButtons && relic.id ? 0 : 190}px)`,
              transition: 'transform 0.5s cubic-bezier(.23,1,.32,1)',
            }}
          >
            <HoverButton
              title='reserve relic'
              label={<LockOutlined/>}
              onClick={reserveRelic}
              setButtonHovered={setButtonHovered}
              backgroundColor={showcaseTheme?.cardBackgroundColor}
              borderColor={showcaseTheme?.cardBorderColor}
            />
            <HoverButton
              title='exclude relic'
              label={<StopOutlined/>}
              onClick={excludeRelic}
              setButtonHovered={setButtonHovered}
              backgroundColor={showcaseTheme?.cardBackgroundColor}
              borderColor={showcaseTheme?.cardBorderColor}
            />
            <HoverButton
              title='remove restrictions'
              label={<ClearOutlined/>}
              onClick={clearRestrictions}
              setButtonHovered={setButtonHovered}
              backgroundColor={showcaseTheme?.cardBackgroundColor}
              borderColor={showcaseTheme?.cardBorderColor}
            />
            <HoverButton
              title='find in inventory'
              label={<AimOutlined/>}
              onClick={() => {
                setLocatorOpen(true)
                setHovered(false)
                setButtonHovered(false)
              }}
              setButtonHovered={setButtonHovered}
              backgroundColor={showcaseTheme?.cardBackgroundColor}
              borderColor={showcaseTheme?.cardBorderColor}
            />
            <HoverButton
              title='view in relics tab'
              label={<LineChartOutlined/>}
              onClick={() => window.viewRelicInGrid(relic.id)}
              setButtonHovered={setButtonHovered}
              backgroundColor={showcaseTheme?.cardBackgroundColor}
              borderColor={showcaseTheme?.cardBorderColor}
            />
          </Flex>
          <LocatorModal selectedRelic={relic} open={locatorOpen} setOpen={setLocatorOpen}/>
        </div>
      </Flex>
    </Card>
  )
}

function HoverButton(props: {
  label: string | number | ReactElement
  onClick: () => void
  setButtonHovered: (hovered: boolean) => void
  title?: string
  backgroundColor?: React.CSSProperties['backgroundColor']
  borderColor?: React.CSSProperties['color']
}) {
  return (
    <Button
      title={props.title}
      style={{
        padding: 2,
        height: 30,
        width: 30,
        backgroundColor: props?.backgroundColor,
        borderColor: props?.borderColor,
      }}
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
      onMouseEnter={() => props.setButtonHovered(true)}
      onMouseLeave={() => props.setButtonHovered(false)}
    >
      {props.label}
    </Button>
  )
}

function LocatorModal(props: { selectedRelic: Relic; open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Modal
      centered
      destroyOnClose
      open={props.open}
      width={380}
      onCancel={() => props.setOpen(false)}
      footer={[]}
    >
      <RelicLocator selectedRelic={props.selectedRelic}/>
    </Modal>
  )
}
