import { Button, Flex } from '@mantine/core'
import i18next from 'i18next'
import { Hint } from 'lib/interactions/hint'
import { Message } from 'lib/interactions/message'
import { equipClicked } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { gridStore } from 'lib/stores/gridStore'
import React from 'react'
import { useTranslation } from 'react-i18next'

const defaultGap = 5
const buttonStyle: React.CSSProperties = { flex: 1 }

function addToPinned() {
  const gridApi = gridStore.optimizerGridApi()
  if (!gridApi) return
  const currentPinnedRows = gridApi.getGridOption('pinnedTopRowData')!
  const selectedNodes = gridApi.getSelectedNodes()
  const t = i18next.getFixedT(null, 'optimizerTab', 'Sidebar.Pinning.Messages')

  if (!selectedNodes || selectedNodes.length === 0) {
    Message.warning(t('NoneSelected') /* 'No row selected' */)
  } else if (selectedNodes[0].data!.statSim) {
    Message.warning(t('SimSelected') /* 'Custom simulation rows are not pinnable' */)
  } else if (currentPinnedRows.find((row) => String(row.id) === String(selectedNodes[0].data!.id))) {
    Message.warning(t('AlreadyPinned') /* 'This build is already pinned' */)
  } else {
    const selectedRow = selectedNodes[0].data
    if (selectedRow) {
      currentPinnedRows.push(selectedRow)
      gridApi.updateGridOptions({ pinnedTopRowData: currentPinnedRows })
    }
  }
}

function clearPinned() {
  const gridApi = gridStore.optimizerGridApi()
  if (!gridApi) return
  const currentPinned = gridApi.getGridOption('pinnedTopRowData')
  if (currentPinned?.length) {
    gridApi.updateGridOptions({ pinnedTopRowData: [currentPinned[0]] })
  }
}

export const ResultsSection = React.memo(function ResultsSection({ isFullSize }: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.ResultsGroup' })
  return (
    <Flex direction="column" gap={5}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header') /* Results */}</HeaderText>
        <TooltipImage type={Hint.actions()} />
      </Flex>
      <Flex gap={isFullSize ? defaultGap : 8} justify='space-around'>
        <Button onClick={equipClicked} style={buttonStyle}>
          {t('Equip') /* Equip */}
        </Button>
        <Button variant="default" onClick={OptimizerTabController.applyRowFilters} style={buttonStyle}>
          {t('Filter') /* Filter */}
        </Button>
      </Flex>
      <Flex gap={isFullSize ? defaultGap : 8} justify='space-around'>
        <Button variant="default" style={buttonStyle} onClick={addToPinned}>
          {t('Pin') /* Pin build */}
        </Button>
        <Button variant="default" style={buttonStyle} onClick={clearPinned}>
          {t('Clear') /* Clear pins */}
        </Button>
      </Flex>
    </Flex>
  )
})
