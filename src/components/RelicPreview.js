import {Card, Col, Divider, Flex, Image, Popover, Row, Space, Tooltip, Typography} from 'antd';
import * as React from 'react';
import { RelicScorer } from '../lib/relicScorer';
import {Renderer} from "../lib/renderer";
import {CheckCircleFilled, CheckCircleOutlined, CheckCircleTwoTone} from "@ant-design/icons";

const { Title, Paragraph, Text, Link } = Typography;

let iconSize = 23

function generateStat(stat, source, main, relic) {
  if (!stat || !stat.stat || stat.value == null || stat.value == undefined) {
    return (
      <Flex justify='space-between'>
        <Flex>
          <img src={Assets.getBlank()} style={{width: iconSize, height: iconSize, marginRight: 3}}></img>
        </Flex>
      </Flex>
    )
  }
  
  let displayValue
  if (main) {
    displayValue = Renderer.renderMainStatNumber(stat, relic)
  } else {
    displayValue = Renderer.renderSubstatNumber(stat, relic)
  }
  displayValue += Utils.isFlat(stat.stat) ? '' : '%'

  return (
    <Flex justify='space-between'>
      <Flex>
        <img src={Assets.getStatIcon(stat.stat)} style={{width: iconSize, height: iconSize, marginRight: 3}}></img>
        <Text>
          {Constants.StatsToReadable[stat.stat]}
        </Text>
      </Flex>
      <Text>
        {displayValue}
      </Text>
    </Flex>
  )
}

function getRelic(relic) {
  if (!relic || !relic.id) {
    return {substats: []}
  } 

  return DB.getRelicById(relic.id)
}

let gradeToColor = {
  5: '#efb679',
  4: '#cc52f1',
  3: '#58beed',
  2: '#63e0ac',
}

export default function RelicPreview(props) {
  // console.log('RelicPreview', props)
  // const [hovered, setHovered] = React.useState(false);

  let relic = getRelic(props.relic)
  if (props.source == 'scorer') {
    relic = props.relic
  } 
  
  if (!relic) {
    relic = {
      enhance: 0,
      part: undefined,
      set: undefined,
      grade: 0
    }
  }

  let enhance = relic.enhance
  let part = relic.part
  let set = relic.set
  let grade = relic.grade

  let substats = relic.substats || []
  let main = relic.main || {}
  let relicSrc = set ? Assets.getSetImage(set, part) : Assets.getBlank()

  let equippedBy = relic.equippedBy
  let equippedBySrc = equippedBy ? Assets.getCharacterAvatarById(equippedBy) : Assets.getBlank()

  let color = gradeToColor[grade] || ''
  let scored = props.relic != undefined && props.score != undefined

  function relicClicked() {
    console.log(relic, props)
    if (!relic || !relic.part || !relic.set || props.source == 'scorer') return

    setSelectedRelic(relic)
    setEditModalOpen(true)
  }

  return (
    <Card
      size="small"
      hoverable={props.source != 'scorer'}
      onClick={relicClicked}
      style={{ width: 200, height: 280 }}
      // onMouseEnter={() => setHovered(true)}
      // onMouseLeave={() => setHovered(false)}
    >
      <Flex vertical justify='space-between'  style={{height: 255}}>
        <Flex justify='space-between' align='center'>
          <img
            style={{height: 50, width: 50}}
            title={set} 
            src={relicSrc}
          />
          <Flex vertical align='center'>
            {/*<CheckCircleFilled style={{color: 'green'}}/>twoToneColor="#52c41a"*/}

            <Flex align='center' gap={5}>
              {
                relic.verified
                  ?
                  <Tooltip title="Substats verified by relic scorer"><CheckCircleFilled style={{fontSize: '14px', color: color}}/></Tooltip>
                  : <div style={{width: 14, height: 14, borderRadius: '50%', background: color}}/>
              }
              <Flex style={{width: 30}} justify='space-around'>
                <Text>
                  {part != undefined ? `+${enhance}` : ''}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <img
            style={{height: 50, width: 50}}
            src={equippedBySrc}
          />
        </Flex>
        
        <Divider style={{margin: '6px 0px 6px 0px'}}/>
        
        {generateStat(main, props.source, true, relic)}

        <Divider style={{margin: '6px 0px 6px 0px'}}/>

        <Flex vertical gap={0}>
          {generateStat(substats[0], props.source, false, relic)}
          {generateStat(substats[1], props.source, false, relic)}
          {generateStat(substats[2], props.source, false, relic)}
          {generateStat(substats[3], props.source, false, relic)}
        </Flex>

        <Divider style={{margin: '6px 0px 6px 0px'}}/>

        <Flex gap={4} justify='space-between'>
          <Flex>
            <img src={(scored) ? Assets.getStarBw() : Assets.getBlank()} style={{width: iconSize, height: iconSize, marginRight: 3}}></img>
            <Text>
              {(scored) ? 'Score' : ''}
            </Text>
          </Flex>
          <Text>
            {(scored) && `${props.score.score} (${props.score.rating})${props.score.meta.modified ? ' *' : ''}`}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

function round10ths(x) {
  return Math.round(x);
} 

