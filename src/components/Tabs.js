import React from 'react';
import { ErrorBoundary } from "react-error-boundary";
import OptimizerTab from './OptimizerTab'
import ImportTab from './ImportTab'
import RelicsTab from './RelicsTab'
import CharacterTab from './CharacterTab';
import ComingSoonTab from './ComingSoonTab';
import RelicScorerTab from './RelicScorerTab';
import GettingStartedTab from './GettingStartedTab';
import BetaTab from './BetaTab';
import ScoringModal from './ScoringModal';
import { Typography } from 'antd';

let defaultError = () => {
  return (
    <Typography>Something went wrong</Typography>
  )
}
const Tabs = ({activeKey}) => {
  return (
    <>
      <ErrorBoundary fallback={defaultError()}>
        <OptimizerTab style={{display: activeKey == 'optimizer' ? 'block' : 'none'}}/>
      </ErrorBoundary>

      <ErrorBoundary fallback={defaultError()}>
        <RelicsTab style={{ display: activeKey == 'relics' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <CharacterTab style={{display: activeKey == 'characters' ? 'block' : 'none'}}/>
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <ImportTab style={{ display: activeKey == 'import' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <GettingStartedTab style={{ display: activeKey == '#getting-started' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <RelicScorerTab style={{ display: activeKey == '#scorer' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <ComingSoonTab style={{ display: activeKey == 'coming-soon' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <BetaTab style={{ display: activeKey == '#beta' ? 'block' : 'none' }} />
      </ErrorBoundary >

      <ErrorBoundary fallback={defaultError()}>
        <ScoringModal />
      </ErrorBoundary >
    </>
  )
}

export default Tabs;
