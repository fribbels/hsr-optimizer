import { Card, Col, Divider, Flex, Image, Popover, Row, Space, Typography } from 'antd';
import * as React from 'react';
import { RelicScorer } from '../lib/relicScorer';

const { Title, Paragraph, Text, Link } = Typography;

let iconSize = 23

function generateStat(stat, source, main) {
  if (!stat || !stat.stat || stat.value == null || stat.value == undefined) {
    return (
      <Flex justify='space-between'>
        <Flex>
          <img src={Assets.getBlank()} style={{width: iconSize, height: iconSize, marginRight: 3}}></img>
        </Flex>
      </Flex>
    )
  }
  
  let displayValue = ''
  if (source == 'scorer') {
    if (stat.stat == Constants.Stats.SPD) {
      if (main) {
        displayValue = Math.floor(stat.value)
      } else {
        displayValue = (Math.floor(stat.value * 10) / 10)
      }
    } else {
      displayValue = Utils.isFlat(stat.stat) ? Math.floor(stat.value) : (Math.floor(stat.value * 10) / 10).toFixed(1) + "%"
    }   
  } else {
    if (stat.stat == Constants.Stats.SPD) {
      displayValue = Math.floor(stat.value)
    } else {
      displayValue = Utils.isFlat(stat.stat) ? Math.floor(stat.value) : (Math.floor(stat.value * 10) / 10).toFixed(1) + "%"
    }
  }
  
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

function generateScores(data) {
  if (!data || data.cs == undefined || data.ss == undefined || data.ds == undefined) {
    return (
      <Flex gap={4} justify='space-between'>
        <Text>
          <span>&shy;</span>
        </Text>
          
        <Text>
          <span>&shy;</span>
        </Text>
      </Flex>
    )
  }

  return (
    <Flex gap={4} justify='space-between'>
      <Text>
        C/S/D Score
      </Text>
        
      <Text>
        {round10ths(data.cs)}/{round10ths(data.ss)}/{round10ths(data.ds)}
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
  5: '#e1a564',
  4: '#9e5fe8',
  3: '#58beed',
  2: '#63e0ac',
}

export default function RelicPreview(props) {
  // console.log('RelicPreview', props)
  // const [hovered, setHovered] = React.useState(false);

  let data = getRelic(props.relic)
  if (props.source == 'scorer') {
    data = props.relic
  } 
  
  if (!data) {
    data = {
      enhance: 0,
      part: undefined,
      set: undefined,
      grade: 0
    }
  }

  let enhance = data.enhance
  let part = data.part
  let set = data.set
  let grade = data.grade

  let substats = data.substats || []
  let main = data.main || {}
  let relicSrc = set ? Assets.getSetImage(set, part) : Assets.getBlank()

  let equippedBy = data.equippedBy
  let equippedBySrc = equippedBy ? Assets.getCharacterAvatarById(equippedBy) : Assets.getBlank()
  // console.log(props, data)

  let color = gradeToColor[grade] || ''
  let scored = props.relic != undefined && props.score != undefined

  function relicClicked() {
    console.log(data, props)
    if (!data || !data.part || !data.set || props.source == 'scorer') return

    setSelectedRelic(data)
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
          <Flex  align='center'>
            {
              grade ? 
              <div style={{width: 12, height: 12, borderRadius: '50%', background: color, border: `2px solid ${color}`, padding: '2px', marginRight: 3}}>
              </div> 
              : ''
              
            }
            <Text>
              {part != undefined ? `+${enhance}` : ''}
            </Text>
          </Flex>
          <img
            style={{height: 50, width: 50}}
            src={equippedBySrc}
          />
        </Flex>
        
        <Divider style={{margin: '6px 0px 6px 0px'}}/>
        
        {generateStat(main, props.source, true)}

        <Divider style={{margin: '6px 0px 6px 0px'}}/>

        <Flex vertical gap={0}>
          {generateStat(substats[0], props.source)}
          {generateStat(substats[1], props.source)}
          {generateStat(substats[2], props.source)}
          {generateStat(substats[3], props.source)}
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

