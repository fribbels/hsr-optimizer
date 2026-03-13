import { Flex } from '@mantine/core'
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
import { TabVisibilityContext, TabVisibilityValue } from 'lib/hooks/useTabVisibility'
import React, {
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

const defaultErrorRender = ({ error }: FallbackProps) =>
  <div>Something went wrong: {error instanceof Error ? error.message : String(error)}</div>

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
  const isActive = activeKey === tabKey
  const prevActiveRef = useRef(isActive)
  const listenersRef = useRef(new Set<() => void>())
  const isActiveRef = useRef(isActive)

  // Always keep the ref in sync — gated listeners read this synchronously
  isActiveRef.current = isActive

  // STABLE context value — never changes identity, so useContext never
  // triggers consumer re-renders. Activation is signaled via listeners instead.
  const [contextValue] = useState<TabVisibilityValue>(() => ({
    isActiveRef,
    addActivationListener: (cb: () => void) => {
      listenersRef.current.add(cb)
      return () => { listenersRef.current.delete(cb) }
    },
  }))

  // On activation (hidden → visible): notify all listeners via microtask.
  // Each listener calls useSyncExternalStore's onStoreChange, which checks
  // getSnapshot() — only components with actual value changes re-render.
  if (isActive && !prevActiveRef.current) {
    queueMicrotask(() => {
      for (const listener of listenersRef.current) {
        listener()
      }
    })
  }
  prevActiveRef.current = isActive

  return (
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <TabVisibilityContext value={contextValue}>
        <div style={{ display: isActive ? 'contents' : 'none' }} id={tabKey}>
          {content}
        </div>
      </TabVisibilityContext>
    </ErrorBoundary>
  )
}
