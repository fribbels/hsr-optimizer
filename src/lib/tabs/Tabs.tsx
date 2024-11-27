import { Flex, Typography } from 'antd'
import ScoringModal from 'lib/overlays/modals/ScoringModal'
import { AppPages, PageToRoute } from 'lib/state/db'
import ChangelogTab from 'lib/tabs/tabChangelog/ChangelogTab'
import CharacterTab from 'lib/tabs/tabCharacters/CharacterTab'
import HomeTab from 'lib/tabs/tabHome/HomeTab'
import ImportTab from 'lib/tabs/tabImport/ImportTab'
import MetadataTab from 'lib/tabs/tabMetadata/MetadataTab'

import OptimizerTab from 'lib/tabs/tabOptimizer/OptimizerTab'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import RelicsTab from 'lib/tabs/tabRelics/RelicsTab'
import RelicScorerTab from 'lib/tabs/tabShowcase/RelicScorerTab'
import WebgpuTab from 'lib/tabs/tabWebgpu/WebgpuTab'
import { WorkerPool } from 'lib/worker/workerPool'
import React, { ReactElement, Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Form } from 'types/form'

const defaultErrorRender = ({ error: { message } }: {
  error: {
    message: string
  }
}) => (
  <Typography>Something went wrong: {message}</Typography>
)

let optimizerInitialized = false

const Tabs = () => {
  const activeKey = window.store((s) => s.activeKey).split('?')[0]

  const optimizerTab = React.useMemo(() => <OptimizerTab/>, [])
  const characterTab = React.useMemo(() => <CharacterTab/>, [])
  const relicsTab = React.useMemo(() => <RelicsTab/>, [])
  const importTab = React.useMemo(() => <ImportTab/>, [])
  const relicScorerTab = React.useMemo(() => <RelicScorerTab/>, [])
  const changelogTab = React.useMemo(() => <ChangelogTab/>, [])
  const webgpuTab = React.useMemo(() => <WebgpuTab/>, [])
  const metadataTab = React.useMemo(() => <MetadataTab/>, [])
  const homeTab = React.useMemo(() => <Suspense><HomeTab/></Suspense>, [])

  useEffect(() => {
    let route = PageToRoute[activeKey] || PageToRoute[AppPages.OPTIMIZER]
    if (activeKey == AppPages.SHOWCASE) {
      const id = window.location.hash.split('?')[1]?.split('id=')[1]?.split('&')[0]
      if (id) {
        route += `?id=${id}`
      }
    }
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, window.title, route)

    if (activeKey == AppPages.OPTIMIZER) {
      window.onOptimizerFormValuesChange({} as Form, OptimizerTabController.getForm())

      // Only kick off the workers on the first load of OptimizerTab. Skips this for scorer-only users.
      if (!optimizerInitialized) {
        optimizerInitialized = true
        WorkerPool.initializeAllWorkers()
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [activeKey])

  return (
    <Flex justify='space-around' style={{ width: '100%' }}>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.HOME} content={homeTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.OPTIMIZER} content={optimizerTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHARACTERS} content={characterTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELICS} content={relicsTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.IMPORT} content={importTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.SHOWCASE} content={relicScorerTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHANGELOG} content={changelogTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.WEBGPU_TEST} content={webgpuTab}/>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.METADATA_TEST} content={metadataTab}/>

      <ErrorBoundary fallbackRender={defaultErrorRender}>
        <ScoringModal/>
      </ErrorBoundary>
    </Flex>
  )
}

export default Tabs

function TabRenderer(props: {
  activeKey: string
  tabKey: string
  content: ReactElement
}) {
  return (
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <div style={{ display: props.activeKey === props.tabKey ? 'contents' : 'none' }} id={props.tabKey}>
        {props.content}
      </div>
    </ErrorBoundary>
  )
}
