import {
  type GetRowIdParams,
  type GridOptions,
  type IRowNode,
  type IsExternalFilterPresentParams,
} from 'ag-grid-community'
import {
  AgGridReact,
  type AgGridReactProps,
} from 'ag-grid-react'
import { useGridLocale, useGridLocaleRebuild } from 'lib/hooks/useGridLocale'
import { useTranslation } from 'react-i18next'
import type { ScoredRelic } from 'lib/relics/scoreRelics'
import { scoreRelicsAsync } from 'lib/worker/scoreRelicsWorkerRunner'
import {
  defaultRelicsGridColDefs,
  generateBaselineColDefs,
  generateOptionalColDefs,
} from 'lib/tabs/tabRelics/columnDefs'
import { TAB_WIDTH } from 'lib/tabs/tabRelics/RelicsTab'
import { RelicsTabController } from 'lib/tabs/tabRelics/relicsTabController'
import { useRelicsTabStore, type ValueColumnField } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { gridStore } from 'lib/stores/gridStore'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { useShallow } from 'zustand/react/shallow'

const gridOptions: GridOptions<ScoredRelic> = {
  rowHeight: 33,
  rowBuffer: 15,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  suppressNoRowsOverlay: true,
  getRowId: (params: GetRowIdParams<ScoredRelic>) => params.data.id,
}

const paginationSettings: AgGridReactProps<ScoredRelic> = {
  pagination: true,
  paginationPageSizeSelector: false,
  paginationPageSize: 3100,
}

export function RelicsGrid() {
  const { getLocaleText, paginationNumberFormatter } = useGridLocale('relicsTab', 'RelicGrid')
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const { gridDestroyed } = useGridLocaleRebuild()

  const relics = useRelicStore((s) => s.relics)
  const scoringVersion = useScoringStore((s) => s.scoringVersion)

  const { focusCharacter, excludedRelicPotentialCharacters, filters, valueColumns } = useRelicsTabStore(
    useShallow((s) => ({
      focusCharacter: s.focusCharacter,
      excludedRelicPotentialCharacters: s.excludedRelicPotentialCharacters,
      filters: s.filters,
      valueColumns: s.valueColumns,
    })),
  )

  const gridRef = useRef<AgGridReact<ScoredRelic>>(null)
  useEffect(() => {
    gridStore.setRelicsGrid(gridRef)
  }, [])

  // Score relics off the main thread via web worker. Starts immediately on mount
  // (during stagger) so data is often ready before the user navigates to the tab.
  // Results are held in a pending ref until the tab is active, then applied via
  // startTransition so AG Grid's data ingestion doesn't block the UI.
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [scoredRelics, setScoredRelics] = useState<ScoredRelic[] | null>(null)
  const pendingResultRef = useRef<ScoredRelic[] | null>(null)

  // Apply pending results when the tab activates, delayed so the menu animation completes first
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>
    const unsub = addActivationListener(() => {
      if (pendingResultRef.current) {
        const result = pendingResultRef.current
        pendingResultRef.current = null
        timerId = setTimeout(() => {
          startTransition(() => setScoredRelics(result))
        }, 250)
      }
    })
    return () => {
      unsub()
      clearTimeout(timerId)
    }
  }, [addActivationListener])

  useEffect(() => {
    pendingResultRef.current = null

    if (relics.length === 0) {
      setScoredRelics(null)
      return
    }

    let cancelled = false
    scoreRelicsAsync(relics, excludedRelicPotentialCharacters, focusCharacter)
      .then((result) => {
        if (cancelled || result.length === 0) return
        if (isActiveRef.current) {
          startTransition(() => setScoredRelics(result))
        } else {
          pendingResultRef.current = result
        }
      })
      .catch((err) => {
        if (!cancelled) console.warn('scoreRelicsAsync error:', err)
      })
    return () => { cancelled = true }
    // scoringVersion is not passed to the worker but triggers re-scoring via this dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relics, scoringVersion, focusCharacter, excludedRelicPotentialCharacters])

  const columnDefs = useMemo(() => {
    return generateBaselineColDefs(t)
      .concat(generateOptionalColDefs(t).filter((x) => valueColumns.includes(x.field as ValueColumnField)))
  }, [valueColumns, t])

  const isExternalFilterPresent = useCallback((_params: IsExternalFilterPresentParams<ScoredRelic>) => {
    return !Object.values(filters).every((filter) => filter.length === 0)
  }, [filters])

  const doesExternalFilterPass = useCallback((node: IRowNode<ScoredRelic>) => {
    const relic = node.data
    if (!relic) return false
    if (filters.part.length && !filters.part.includes(relic.part)) return false
    if (filters.enhance.length && !filters.enhance.some((x) => relic.enhance >= x && relic.enhance <= x + 2)) return false
    if (filters.grade.length && !filters.grade.includes(relic.grade)) return false
    if (filters.initialRolls.length && !filters.initialRolls.includes(relic.initialRolls ?? 3)) return false
    if (filters.verified.length && !filters.verified.includes(relic.verified ?? false)) return false
    if (filters.equipped.length && !filters.equipped.includes(relic.equippedBy != null)) return false
    if (filters.set.length && !filters.set.includes(relic.set)) return false
    if (filters.mainStat.length && !filters.mainStat.includes(relic.main.stat)) return false
    if (
      filters.subStat.length && !filters.subStat.every((filterStat) => {
        return relic.substats.some((s) => s.stat === filterStat)
          || relic.previewSubstats.some((s) => s.stat === filterStat)
      })
    ) {
      return false
    }
    return true
  }, [filters])

  return (
    <div
      id='relicGrid'
      className='ag-theme-balham-dark'
      style={{
        width: TAB_WIDTH,
        height: 600,
        overflow: 'hidden',
        resize: 'vertical',
        marginTop: 0,
      }}
    >
      {!gridDestroyed && (
        <AgGridReact
          ref={gridRef}
          rowData={scoredRelics}
          columnDefs={columnDefs}
          defaultColDef={defaultRelicsGridColDefs}
          gridOptions={gridOptions}
          onSelectionChanged={RelicsTabController.onSelectionChanged}
          onRowDoubleClicked={RelicsTabController.onRowDoubleClicked}
          navigateToNextCell={RelicsTabController.navigateToNextCell}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          getLocaleText={getLocaleText}
          headerHeight={48}
          animateRows={true}
          rowSelection={{ mode: 'multiRow', checkboxes: false, headerCheckbox: false, enableClickSelection: true }}
          paginationNumberFormatter={paginationNumberFormatter}
          {...paginationSettings}
        />
      )}
    </div>
  )
}
