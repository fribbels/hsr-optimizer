import React from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { Typography } from 'antd';

import OptimizerTab from 'components/OptimizerTab'
import ImportTab from 'components/ImportTab'
import RelicsTab from 'components/RelicsTab'
import CharacterTab from 'components/CharacterTab';
import ComingSoonTab from 'components/ComingSoonTab';
import RelicScorerTab from 'components/RelicScorerTab';
import GettingStartedTab from 'components/GettingStartedTab';
import ScoringModal from 'components/ScoringModal';
import PropTypes from "prop-types";

const defaultError = <Typography>Something went wrong</Typography>;

const Tabs = () => {
  const activeKey = global.store(s => s.activeKey)

  const optimizerTab = React.useMemo( () => <OptimizerTab/>, []);
  const characterTab = React.useMemo( () => <CharacterTab/>, []);
  const relicsTab = React.useMemo( () => <RelicsTab/>, []);
  const importTab = React.useMemo( () => <ImportTab/>, []);
  const gettingStartedTab = React.useMemo( () => <GettingStartedTab/>, []);
  const relicScorerTab = React.useMemo( () => <RelicScorerTab/>, []);
  const comingSoonTab = React.useMemo( () => <ComingSoonTab/>, []);

  return (
    <>
      <TabRenderer activeKey={activeKey} tabKey='optimizer' content={optimizerTab}/>
      <TabRenderer activeKey={activeKey} tabKey='characters' content={characterTab}/>
      <TabRenderer activeKey={activeKey} tabKey='relics' content={relicsTab}/>
      <TabRenderer activeKey={activeKey} tabKey='import' content={importTab}/>
      <TabRenderer activeKey={activeKey} tabKey='#getting-started' content={gettingStartedTab}/>
      <TabRenderer activeKey={activeKey} tabKey='#scorer' content={relicScorerTab}/>
      <TabRenderer activeKey={activeKey} tabKey='coming-soon' content={comingSoonTab}/>

      <ErrorBoundary fallback={defaultError}>
        <ScoringModal />
      </ErrorBoundary >
    </>
  )
}

export default Tabs;

function TabRenderer(props) {
  return (
    <ErrorBoundary fallback={defaultError}>
      <div style={{display: props.activeKey === props.tabKey ? 'contents' : 'none'}}>
        {props.content}
      </div>
    </ErrorBoundary >
  )
}
TabRenderer.propTypes = {
  activeKey: PropTypes.string,
  tabKey: PropTypes.string,
  content: PropTypes.element,
}