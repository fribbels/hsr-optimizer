import { Row, Space } from 'antd';
import * as React from 'react';
import RelicPreview from './RelicPreview';
import { RelicScorer } from '../lib/relicScorer';

export default function OptimizerBuildPreview(props) {
  console.log('OptimizerBuildPreview', props)
  const [, forceUpdate] = React.useReducer(o => !o, true);
  window.forceOptimizerBuildPreviewUpdate = forceUpdate

  let relicsById = DB.getRelicsById()
  let characterId = OptimizerTabController.getForm().characterId

  let headScore = props.build ? RelicScorer.score(relicsById[props.build?.Head], characterId) : undefined;
  let handsScore = props.build ? RelicScorer.score(relicsById[props.build?.Hands], characterId) : undefined;
  let bodyScore = props.build ? RelicScorer.score(relicsById[props.build?.Body], characterId) : undefined;
  let feetScore = props.build ? RelicScorer.score(relicsById[props.build?.Feet], characterId) : undefined;
  let planarSphereScore = props.build ? RelicScorer.score(relicsById[props.build?.PlanarSphere], characterId) : undefined;
  let linkRopeScore = props.build ? RelicScorer.score(relicsById[props.build?.LinkRope], characterId) : undefined;
  return (
    <Space>
      <RelicPreview relic={relicsById[props.build?.Head]} score={headScore}/>
      <RelicPreview relic={relicsById[props.build?.Hands]} score={handsScore}/>
      <RelicPreview relic={relicsById[props.build?.Body]} score={bodyScore}/>
      <RelicPreview relic={relicsById[props.build?.Feet]} score={feetScore}/>
      <RelicPreview relic={relicsById[props.build?.PlanarSphere]} score={planarSphereScore} />
      <RelicPreview relic={relicsById[props.build?.LinkRope]} score={linkRopeScore} />
    </Space>
  );
}