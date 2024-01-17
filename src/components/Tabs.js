import React, {useMemo} from 'react';
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
const Tabs = () => {
  const activeKey = store(s => s.activeKey)

  let optimizerActive = activeKey == 'optimizer'
  let charactersActive = activeKey == 'characters'
  let relicsActive = activeKey == 'relics'
  let importActive = activeKey == 'import'
  let gettingStartedActive = activeKey == '#getting-started'
  let scorerActive = activeKey == '#scorer'
  let comingSoonActive = activeKey == 'coming-soon'
  let betaActive = activeKey == '#beta'

  let optimizerDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <OptimizerTab active={optimizerActive}/>
      </ErrorBoundary>
    )
  }, [optimizerActive])

  let charactersDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <CharacterTab active={charactersActive}/>
      </ErrorBoundary>
    )
  }, [charactersActive])

  let relicsDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <RelicsTab active={relicsActive}/>
      </ErrorBoundary>
    )
  }, [relicsActive])

  let importDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <ImportTab active={importActive}/>
      </ErrorBoundary>
    )
  }, [importActive])

  let gettingStartedDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <GettingStartedTab active={gettingStartedActive}/>
      </ErrorBoundary>
    )
  }, [gettingStartedActive])

  let scorerDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <RelicScorerTab active={scorerActive}/>
      </ErrorBoundary>
    )
  }, [scorerActive])

  let comingSoonDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <ComingSoonTab active={comingSoonActive}/>
      </ErrorBoundary>
    )
  }, [comingSoonActive])

  let betaDisplay = useMemo(() => {
    return (
      <ErrorBoundary fallback={defaultError()}>
        <BetaTab active={betaActive}/>
      </ErrorBoundary>
    )
  }, [betaActive])

  return (
    <>
      {optimizerDisplay}
      {charactersDisplay}
      {relicsDisplay}
      {importDisplay}
      {gettingStartedDisplay}
      {scorerDisplay}
      {comingSoonDisplay}
      {betaDisplay}

      <ErrorBoundary fallback={defaultError()}>
        <ScoringModal />
      </ErrorBoundary >
    </>
  )
}

export default Tabs;
