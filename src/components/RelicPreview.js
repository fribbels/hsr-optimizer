import { Card, Col, Divider, Flex, Image, Row, Space, Typography } from 'antd';
import * as React from 'react';

const { Title, Paragraph, Text, Link } = Typography;

function generateStat(stat) {
  if (!stat || !stat.stat || stat.value == null || stat.value == undefined) {
    return (
      <Flex justify='space-between'>
        <Text>
          <span>&shy;</span>
        </Text>
        <Text>
          <span>&shy;</span>
        </Text>
      </Flex>
    )
  }

  let displayValue = Utils.isFlat(stat.stat) ? stat.value : (stat.value).toFixed(1)

  return (
    <Flex justify='space-between'>
      <Text>
        {Constants.StatsToReadable[stat.stat]}
      </Text>
      <Text>
        {displayValue}
      </Text>
    </Flex>
  )
}

function generateScores(data) {
  if (!data || data.os == undefined || data.ss == undefined || data.ds == undefined) {
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
        O/S/D Score
      </Text>
        
      <Text>
        {round10ths(data.os)}/{round10ths(data.ss)}/{round10ths(data.ds)}
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

export default function RelicPreview(props) {
  // console.log('RelicPreview', props)
  let data = getRelic(props.relic)
  if (!data) {
    return
  }
  let enhance = data.enhance
  let part = data.part
  let set = data.set

  let substats = data.substats || []
  let main = data.main || {}

  let relicSrc = set ? Assets.getSetImage(set, part) : Assets.getBlank()

  let equippedBy = data.equippedBy
  let equippedBySrc = equippedBy ? Assets.getCharacterAvatarById(equippedBy) : Assets.getBlank()
  // console.log(props, data)

  return (
    <Card size="small" style={{ width: 200, height: 280 }}>
      <Flex vertical justify='space-between' style={{height: 255}}>
        <Flex justify='space-between' align='center'>
          <Image
            preview={false}
            height={50}
            width={50}
            src={relicSrc}
            fallback=''
          />
          <Text>
            {enhance ? `+${enhance}` : ''}
          </Text>
          <Image
            preview={false}
            height={50}
            width={50}
            src={equippedBySrc}
            fallback=''
          />
        </Flex>
        
        <Divider style={{margin: '6px 0px 6px 0px'}}/>
        
        {generateStat(main)}

        <Divider style={{margin: '6px 0px 6px 0px'}}/>

        <Flex vertical gap={0}>
          {generateStat(substats[0])}
          {generateStat(substats[1])}
          {generateStat(substats[2])}
          {generateStat(substats[3])}
        </Flex>

        <Divider style={{margin: '6px 0px 6px 0px'}}/>

        {generateScores(data)}
      </Flex>
    </Card>
  );
}

function round10ths(x) {
  return Math.round(x);
} 

