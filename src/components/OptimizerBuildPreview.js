import { Row, Space } from 'antd';
import * as React from 'react';
import RelicPreview from './RelicPreview';
import { RelicScorer } from '../lib/relicScorer';

export default function OptimizerBuildPreview(props) {
  // console.log('OptimizerBuildPreview', props)
  let headScore = props.build ? RelicScorer.score(props.build?.Head, props.build?.optimizerCharacterId) : undefined;
  let handsScore = props.build ? RelicScorer.score(props.build?.Hands, props.build?.optimizerCharacterId) : undefined;
  let bodyScore = props.build ? RelicScorer.score(props.build?.Body, props.build?.optimizerCharacterId) : undefined;
  let feetScore = props.build ? RelicScorer.score(props.build?.Feet, props.build?.optimizerCharacterId) : undefined;
  let planarSphereScore = props.build ? RelicScorer.score(props.build?.PlanarSphere, props.build?.optimizerCharacterId) : undefined;
  let linkRopeScore = props.build ? RelicScorer.score(props.build?.LinkRope, props.build?.optimizerCharacterId) : undefined;

  return (
    <Space>
      <RelicPreview relic={props.build?.Head} score={headScore}/>
      <RelicPreview relic={props.build?.Hands} score={handsScore}/>
      <RelicPreview relic={props.build?.Body} score={bodyScore}/>
      <RelicPreview relic={props.build?.Feet} score={feetScore}/>
      <RelicPreview relic={props.build?.PlanarSphere} score={planarSphereScore} />
      <RelicPreview relic={props.build?.LinkRope} score={linkRopeScore} />
    </Space>
  );
}