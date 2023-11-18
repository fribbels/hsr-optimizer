import * as React from 'react';
import { Flex, Image, InputNumber, Space, Typography } from 'antd';
import RelicPreview from './RelicPreview';

export default function CharacterBuildPreview(props) {
  // console.log('OptimizerBuildPreview', props)
  return (
    <Flex vertical gap={15}>
      <Flex gap={15}>
        <RelicPreview relic={props.build?.Head}/>
        <RelicPreview relic={props.build?.Hands}/>
        <RelicPreview relic={props.build?.Body}/>
      </Flex>
      <Flex gap={15}>
        <RelicPreview relic={props.build?.Feet}/>
        <RelicPreview relic={props.build?.PlanarSphere}/>
        <RelicPreview relic={props.build?.LinkRope}/>
      </Flex>
    </Flex>
  );
}