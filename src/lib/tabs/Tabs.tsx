import { Flex } from '@mantine/core'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { BenchmarksTab } from 'lib/tabs/tabBenchmarks/BenchmarksTab'
import { ChangelogTab } from 'lib/tabs/tabChangelog/ChangelogTab'
import { CharacterTab } from 'lib/tabs/tabCharacters/CharacterTab'
import { HomeTab } from 'lib/tabs/tabHome/HomeTab'
import { ImportTab } from 'lib/tabs/tabImport/ImportTab'
import { OptimizerTab } from 'lib/tabs/tabOptimizer/OptimizerTab'
import { RelicsTab } from 'lib/tabs/tabRelics/RelicsTab'
import { ShowcaseTab } from 'lib/tabs/tabShowcase/ShowcaseTab'
import { WarpCalculatorTab } from 'lib/tabs/tabWarp/WarpCalculatorTab'

import { workerPool } from 'lib/worker/workerPool'
import { TabVisibilityContext, type TabVisibilityValue } from 'lib/hooks/useTabVisibility'
import React, {
  type ReactElement,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

const MetadataTab = lazy(() => import('lib/tabs/tabMetadata/MetadataTab').then((m) => ({ default: m.MetadataTab })))
const WebgpuTab = lazy(() => import('lib/tabs/tabWebgpu/WebgpuTab').then((m) => ({ default: m.WebgpuTab })))

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

// Mount priority: active tab is instant, then stagger one per frame in this order.
// URL-reachable tabs first, then internal tabs, then dev/test tabs last.
const MOUNT_PRIORITY: AppPages[] = [
  AppPages.SHOWCASE,
  AppPages.OPTIMIZER,
  AppPages.HOME,
  AppPages.WARP,
  AppPages.BENCHMARKS,
  AppPages.CHANGELOG,
  AppPages.CHARACTERS,
  AppPages.RELICS,
  AppPages.IMPORT,
  // WEBGPU_TEST and METADATA_TEST are dev-only: lazy-loaded and mounted only on navigate
]

let optimizerInitialized = false

const Tabs = () => {
  const activeKey = useGlobalStore((s) => s.activeKey).split('?')[0] as AppPages

  // Create all element descriptions once (stable references, but not mounted until included in tree)
  const tabElements = React.useMemo(
    () => new Map(TAB_COMPONENTS.map(([key, Component]) => [key, <Component />] as const)),
    [],
  )

  // Start with only the active tab mounted. Remaining tabs mount one-at-a-time in priority order
  // with a delay between each to keep the main thread responsive.
  const [mountedTabs, setMountedTabs] = useState<Set<AppPages>>(() => new Set([activeKey]))

  // Immediately mount any tab the user navigates to, even if the stagger hasn't reached it yet.
  useEffect(() => {
    setMountedTabs((prev) => {
      if (prev.has(activeKey)) return prev
      return new Set(prev).add(activeKey)
    })
  }, [activeKey])

  useEffect(() => {
    const queue = MOUNT_PRIORITY.filter((page) => page !== activeKey)
    let i = 0
    let timerId: ReturnType<typeof setTimeout>

    function mountNext() {
      if (i < queue.length) {
        setMountedTabs((prev) => new Set(prev).add(queue[i]))
        i++
        // Space out mounts so the browser stays responsive between heavy tabs
        timerId = setTimeout(mountNext, 100)
      }
    }

    // Start staggering after the active tab has had time to fully paint
    timerId = setTimeout(mountNext, 100)
    return () => clearTimeout(timerId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let route = PageToRoute[activeKey]
    if (activeKey === AppPages.SHOWCASE) {
      const id = window.location.hash.split('?')[1]?.split('id=')[1]?.split('&')[0]
      if (id) {
        route += `?id=${id}`
      }
    }
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, document.title, route)

    if (activeKey === AppPages.OPTIMIZER) {
      // Only kick off the workers on the first load of OptimizerTab. Skips this for scorer-only users.
      if (!optimizerInitialized) {
        optimizerInitialized = true
        workerPool.initialize()
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [activeKey])

  return (
    <Flex justify='space-around' w='100%'>
      {TAB_COMPONENTS.map(([tabKey]) => (
        <TabRenderer key={tabKey} activeKey={activeKey} tabKey={tabKey}>
          {mountedTabs.has(tabKey) ? tabElements.get(tabKey)! : null}
        </TabRenderer>
      ))}
    </Flex>
  )
}

export { Tabs }


function TabRenderer({ activeKey, tabKey, children }: {
  activeKey: AppPages
  tabKey: AppPages
  children: ReactElement | null
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

  // On activation (hidden → visible): notify listeners after one frame.
  // Single rAF is sufficient — activation listeners are nearly zero-cost
  // (changedWhileHidden optimization skips unchanged stores).
  if (isActive && !prevActiveRef.current) {
    requestAnimationFrame(() => {
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
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </div>
      </TabVisibilityContext>
    </ErrorBoundary>
  )
}
