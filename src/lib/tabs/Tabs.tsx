import { Flex, Text } from '@mantine/core'
import { ScoringModal } from 'lib/overlays/modals/ScoringModal'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { BenchmarksTab } from 'lib/tabs/tabBenchmarks/BenchmarksTab'
import ChangelogTab from 'lib/tabs/tabChangelog/ChangelogTab'
import CharacterTab from 'lib/tabs/tabCharacters/CharacterTab'
import HomeTab from 'lib/tabs/tabHome/HomeTab'
import ImportTab from 'lib/tabs/tabImport/ImportTab'
import MetadataTab from 'lib/tabs/tabMetadata/MetadataTab'
import OptimizerTab from 'lib/tabs/tabOptimizer/OptimizerTab'
import { RelicsTab } from 'lib/tabs/tabRelics/RelicsTab'
import { ShowcaseTab } from 'lib/tabs/tabShowcase/ShowcaseTab'
import { WarpCalculatorTab } from 'lib/tabs/tabWarp/WarpCalculatorTab'
import { WebgpuTab } from 'lib/tabs/tabWebgpu/WebgpuTab'
import { WorkerPool } from 'lib/worker/workerPool'
import React, {
  ReactElement,
  useEffect,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const defaultErrorRender = ({ error: { message } }: {
  error: {
    message: string,
  },
}) => <Text>Something went wrong: {message}</Text>

const TAB_COMPONENTS: [AppPages, React.ComponentType][] = [
  [AppPages.HOME, HomeTab],
  [AppPages.OPTIMIZER, OptimizerTab],
  [AppPages.CHARACTERS, CharacterTab],
  [AppPages.RELICS, RelicsTab],
  [AppPages.IMPORT, ImportTab],
  [AppPages.SHOWCASE, ShowcaseTab],
  [AppPages.WARP, WarpCalculatorTab],
  [AppPages.BENCHMARKS, BenchmarksTab],
  [AppPages.CHANGELOG, ChangelogTab],
  [AppPages.WEBGPU_TEST, WebgpuTab],
  [AppPages.METADATA_TEST, MetadataTab],
]

let optimizerInitialized = false

const Tabs = () => {
  const activeKey = useGlobalStore((s) => s.activeKey).split('?')[0] as AppPages

  const tabs = React.useMemo(
    () => TAB_COMPONENTS.map(([key, Component]) => [key, <Component />] as const),
    [],
  )

  useEffect(() => {
    let route = PageToRoute[activeKey]
    if (activeKey == AppPages.SHOWCASE) {
      const id = window.location.hash.split('?')[1]?.split('id=')[1]?.split('&')[0]
      if (id) {
        route += `?id=${id}`
      }
    }
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, document.title, route)

    if (activeKey == AppPages.OPTIMIZER) {
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
    <Flex justify='space-around' w='100%'>
      {tabs.map(([tabKey, content]) => (
        <TabRenderer key={tabKey} activeKey={activeKey} tabKey={tabKey} content={content} />
      ))}

      <ErrorBoundary fallbackRender={defaultErrorRender}>
        <ScoringModal />
      </ErrorBoundary>
    </Flex>
  )
}

export default Tabs

function TabRenderer({ activeKey, tabKey, content }: {
  activeKey: AppPages
  tabKey: AppPages
  content: ReactElement
}) {
  return (
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <div style={{ display: activeKey === tabKey ? 'contents' : 'none' }} id={tabKey}>
        {content}
      </div>
    </ErrorBoundary>
  )
}
