import { Row, Space } from 'antd';
import * as React from 'react';
import RelicPreview from './RelicPreview';

export default function OptimizerBuildPreview(props) {
  // console.log('OptimizerBuildPreview', props)
  return (
    <Space>
      <RelicPreview relic={props.build?.Head}/>
      <RelicPreview relic={props.build?.Hands}/>
      <RelicPreview relic={props.build?.Body}/>
      <RelicPreview relic={props.build?.Feet}/>
      <RelicPreview relic={props.build?.PlanarSphere}/>
      <RelicPreview relic={props.build?.LinkRope}/>
    </Space>
  );
}