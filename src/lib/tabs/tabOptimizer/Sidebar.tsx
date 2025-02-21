import { DownOutlined, ThunderboltFilled } from '@ant-design/icons'
import { IRowNode } from 'ag-grid-community'
import { Button, Divider, Dropdown, Flex, Grid, Modal, Popconfirm, Progress, Radio, theme, Typography } from 'antd'
import i18next from 'i18next'
import { COMPUTE_ENGINE_CPU, COMPUTE_ENGINE_GPU_EXPERIMENTAL, COMPUTE_ENGINE_GPU_STABLE, ComputeEngine } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
import { Hint } from 'lib/interactions/hint'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { Optimizer } from 'lib/optimization/optimizer'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import DB from 'lib/state/db'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { optimizerGridApi } from 'lib/utils/gridUtils'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { useToken } = theme
const { useBreakpoint } = Grid

const { Text } = Typography

function getGpuOptions(computeEngine: ComputeEngine) {
  return [
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.Experimental')}
          {/* GPU acceleration enabled (experimental) */}
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_EXPERIMENTAL,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_GPU_STABLE ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.Stable')}
          {/* GPU acceleration enabled (stable) */}
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_STABLE,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_CPU ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.CPU')}
          {/* CPU only */}
        </div>
      ),
      key: COMPUTE_ENGINE_CPU,
    },
  ]
}

function PermutationDisplay(props: { total?: number; right: number; left: string }) {
  const rightText = props.total
    ? `${localeNumberComma(props.right)} / ${localeNumberComma(props.total)} - (${localeNumberComma(Math.ceil(props.right / props.total * 100))}%)`
    : `${localeNumberComma(props.right)}`
  return (
    <Flex justify='space-between'>
      <Text style={{ lineHeight: '24px' }}>
        {props.left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
      <Text style={{ lineHeight: '24px' }}>
        {rightText}
      </Text>
    </Flex>
  )
}

const defaultGap = 5

export default function Sidebar() {
  const { lg, xl, xxl } = useBreakpoint()

  const breakpointNoShow = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.NoShow
  const breakpointShowXL = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXL
  const breakpointShowXXL = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXXL

  // replacing ?? with || breaks the logic
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const isFullSize = breakpointNoShow || !((lg && breakpointShowXL && !xl) || (lg && breakpointShowXXL && !xxl))

  return <OptimizerSidebar isFullSize={isFullSize}/>
}

function ComputeEngineSelect() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.GPUOptions' })
  const computeEngine = window.store((s) => s.savedSession[SavedSessionKeys.computeEngine])
  return (
    <Dropdown
      menu={{
        items: getGpuOptions(computeEngine),
        onClick: (e) => {
          if (e.key == COMPUTE_ENGINE_CPU) {
            window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
            Message.success(t('EngineSwitchSuccessMsg.CPU')/* Switched compute engine to CPU */)
          } else {
            verifyWebgpuSupport(true).then((device) => {
              if (device) {
                window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, e.key)
                Message.success(e.key == COMPUTE_ENGINE_GPU_EXPERIMENTAL ? t('EngineSwitchSuccessMsg.Experimental') : t('EngineSwitchSuccessMsg.Stable'))
                // Switched compute engine to GPU  Experimental/Stable
              }
            })
          }
        },
      }}
      className='custom-dropdown-button'
      trigger={['click']}
    >
      <Button style={{ padding: 3 }}>
        <Flex justify='space-around' align='center' style={{ width: '100%' }}>
          <div style={{ width: 1 }}/>
          <Text>
            {
              t(`Display.${computeEngine}`)
              /*
               [COMPUTE_ENGINE_GPU_EXPERIMENTAL]: 'GPU acceleration: Enabled',
               [COMPUTE_ENGINE_GPU_STABLE]: 'GPU acceleration: Enabled',
               [COMPUTE_ENGINE_CPU]: 'GPU acceleration: Disabled',
               */
            }
          </Text>
          <DownOutlined/>
        </Flex>
      </Button>
    </Dropdown>
  )
}

function addToPinned() {
  const gridApi = optimizerGridApi()
  const currentPinnedRows = gridApi.getGridOption('pinnedTopRowData')! as OptimizerDisplayDataStatSim[]
  const selectedNodes = gridApi.getSelectedNodes() as IRowNode<OptimizerDisplayDataStatSim>[]

  if (!selectedNodes || selectedNodes.length == 0) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.NoneSelected')/* 'No row selected' */)
  } else if (selectedNodes[0].data!.statSim) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.SimSelected')/* 'Custom simulation rows are not pinnable' */)
  } else if (currentPinnedRows.find((row) => String(row.id) == String(selectedNodes[0].data!.id))) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.AlreadyPinned')/* 'This build is already pinned' */)
  } else {
    const selectedRow = selectedNodes[0].data
    if (selectedRow) {
      currentPinnedRows.push(selectedRow)
      gridApi.updateGridOptions({ pinnedTopRowData: currentPinnedRows })
    }
  }
}

function clearPinned() {
  const gridApi = optimizerGridApi()
  const currentPinned = gridApi?.getGridOption('pinnedTopRowData')
  if (currentPinned?.length) {
    gridApi.updateGridOptions({ pinnedTopRowData: [currentPinned[0]] })
  }
}

function filterClicked() {
  console.log('Filter clicked')
  OptimizerTabController.applyRowFilters()
}

function calculateProgressText(
  startTime: number | null,
  optimizerEndTime: number | null,
  permutations: number,
  permutationsSearched: number,
  optimizationInProgress: boolean,
  optimizerRunningEngine: ComputeEngine) {
  if (!startTime) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.Progress') // Progress
  }

  let endTime = Date.now()
  if (optimizerEndTime) {
    endTime = optimizerEndTime
  }

  const searched = optimizerRunningEngine == COMPUTE_ENGINE_CPU ? permutationsSearched : Math.max(permutationsSearched, 65536 * 512)

  const msDiff = endTime - startTime
  if (!optimizerEndTime && msDiff < 5_000 && permutationsSearched < 5_000_000 || !permutationsSearched) {
    return i18next.t('optimizerTab:Sidebar.ProgressText.CalculatingETA') // Progress  (calculating ETA..)
  }

  const msRemaining = msDiff / permutationsSearched * (permutations - permutationsSearched)
  const perSecond = searched / (msDiff / 1000)
  return optimizationInProgress
    ? i18next.t('optimizerTab:Sidebar.ProgressText.TimeRemaining', {
      // {{rate}} / sec — ${{timeRemaining}} left
      rate: localeNumberComma(Math.floor(perSecond)),
      timeRemaining: Utils.msToReadable(msRemaining),
    })
    : i18next.t('optimizerTab:Sidebar.ProgressText.Finished', {
      // {{rate}} / sec — Finished
      rate: localeNumberComma(Math.floor(perSecond)),
    })
}

function ManyPermsModal(props: { manyPermsModalOpen: boolean; setManyPermsModalOpen: (open: boolean) => void; startSearch: () => void }) {
  const { t } = useTranslation('modals', { keyPrefix: 'ManyPerms' })
  return (
    <Modal
      title={t('Title')/* Very large search requested */}
      open={props.manyPermsModalOpen}
      width={900}
      destroyOnClose
      centered
      onOk={() => props.setManyPermsModalOpen(false)}
      onCancel={() => props.setManyPermsModalOpen(false)}
      footer={null}
    >
      <Flex justify='space-between' align='center' style={{ height: 45, marginTop: 30, marginBottom: 15 }} gap={16}>
        <Text>
          {
            t('Text')
            // This optimization search will take a substantial amount of time to finish.
            // You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats,
            // or use the Substat weight filter to reduce the number of permutations.
          }
        </Text>
        <Button
          onClick={() => props.setManyPermsModalOpen(false)}
          style={{ width: 250 }}
          type='primary'
        >
          {t('Cancel')/* Cancel search */}
        </Button>
        <Button
          onClick={() => {
            props.setManyPermsModalOpen(false)
            props.startSearch()
          }}
          style={{ width: 250 }}
          type='primary'
        >
          {t('Proceed')/* Proceed with search */}
        </Button>
      </Flex>
    </Modal>
  )
}

function OptimizerSidebar(props: { isFullSize: boolean }) {
  const { token } = useToken()
  const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
  return (
    <Flex vertical style={{ overflow: 'clip' }}>
      <Flex
        justify={props.isFullSize ? 'center' : 'space-evenly'}
        style={props.isFullSize
          ? { position: 'sticky', top: '25.6%', transform: 'translateY(-50%)', paddingLeft: 10, height: 150 }
          : {
            height: 121,
            overflow: 'clip',
            position: 'fixed',
            width: '100%',
            bottom: 0,
            left: 0,
            backgroundColor: 'rgb(29 42 71)',
            boxShadow: shadow,
            borderRadius: 5,
            padding: defaultPadding,
            zIndex: 3, /* prevent overlap with optimizer grid - ag-grid pinned top row has z-index 2 */
          }}
      >
        <Flex
          style={props.isFullSize
            ? {
              borderRadius: 5,
              backgroundColor: token.colorBgContainer,
              padding: defaultPadding,
              height: 'fit-content',
              width: 233,
              boxShadow: shadow,
              gap: defaultPadding,
            }
            : undefined}
        >
          <Flex vertical={props.isFullSize} gap={props.isFullSize ? 5 : 20}>
            <PermutationsGroup isFullSize={props.isFullSize}/>
            <OptimizerControlsGroup isFullSize={props.isFullSize}/>
            <ResultsGroup isFullSize={props.isFullSize}/>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

function PermutationsGroup(props: { isFullSize: boolean }) {
  const permutationDetails = window.store((s) => s.permutationDetails)
  const permutations = window.store((s) => s.permutations)
  const permutationsSearched = window.store((s) => s.permutationsSearched)
  const permutationsResults = window.store((s) => s.permutationsResults)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ReadableParts' })
  return (
    <Flex vertical gap={props.isFullSize ? 10 : 5} style={{ minWidth: 211 }}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Permutations')/* Permutations */}</HeaderText>
        <TooltipImage type={Hint.optimizationDetails()}/>
      </Flex>

      {props.isFullSize && (
        <Flex vertical>
          <PermutationDisplay left={tCommon('Head')} right={permutationDetails.Head} total={permutationDetails.HeadTotal}/>
          <PermutationDisplay left={tCommon('Hands')} right={permutationDetails.Hands} total={permutationDetails.HandsTotal}/>
          <PermutationDisplay left={tCommon('Body')} right={permutationDetails.Body} total={permutationDetails.BodyTotal}/>
          <PermutationDisplay left={tCommon('Feet')} right={permutationDetails.Feet} total={permutationDetails.FeetTotal}/>
          <PermutationDisplay left={tCommon('PlanarSphere')} right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal}/>
          <PermutationDisplay left={tCommon('LinkRope')} right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal}/>
        </Flex>
      )}

      <Flex vertical>
        <PermutationDisplay left={t('Perms')/* Perms */} right={permutations}/>
        <PermutationDisplay left={t('Searched')/* Searched */} right={permutationsSearched}/>
        <PermutationDisplay left={t('Results')/* Results */} right={permutationsResults}/>
      </Flex>

      {props.isFullSize && (
        <ProgressDisplay/>
      )}
    </Flex>
  )
}

function ProgressDisplay() {
  const permutations = window.store((s) => s.permutations)
  const permutationsSearched = window.store((s) => s.permutationsSearched)
  const optimizerStartTime = window.store((s) => s.optimizerStartTime)
  const optimizerEndTime = window.store((s) => s.optimizerEndTime)
  const optimizerRunningEngine = window.store((s) => s.optimizerRunningEngine)
  const optimizationInProgress = window.store((s) => s.optimizationInProgress)
  const { token } = useToken()

  return (
    <Flex vertical>
      <HeaderText>
        {calculateProgressText(optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine)}
      </HeaderText>
      <Progress
        strokeColor={token.colorPrimary}
        steps={17}
        size={[8, 5]}
        percent={Math.floor(permutationsSearched / permutations * 100)}
      />
    </Flex>
  )
}

function ResultsGroup(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.ResultsGroup' })
  return (
    <Flex vertical gap={5}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header')/* Results */}</HeaderText>
        <TooltipImage type={Hint.actions()}/>
      </Flex>
      <Flex gap={props.isFullSize ? defaultGap : 8} justify='space-around'>
        <Button type='primary' onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
          {t('Equip')/* Equip */}
        </Button>
        <Button onClick={filterClicked} style={{ width: '100px' }}>
          {t('Filter')/* Filter */}
        </Button>
      </Flex>
      <Flex gap={props.isFullSize ? defaultGap : 8} justify='space-around'>
        <Button style={{ width: '100px' }} onClick={addToPinned}>
          {t('Pin')/* Pin build */}
        </Button>
        <Button style={{ width: '100px' }} onClick={clearPinned}>
          {t('Clear')/* Clear pins */}
        </Button>
      </Flex>
    </Flex>
  )
}

function OptimizerControlsGroup(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const { t: tCommon } = useTranslation('common')

  const permutations = window.store((s) => s.permutations)
  const optimizationInProgress = window.store((s) => s.optimizationInProgress)
  const setOptimizationInProgress = window.store((s) => s.setOptimizationInProgress)
  const computeEngine = window.store((s) => s.savedSession[SavedSessionKeys.computeEngine])

  const [manyPermsModalOpen, setManyPermsModalOpen] = useState(false)

  function cancelClicked() {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel(window.store.getState().optimizationId)
  }

  function startOptimizer() {
    window.optimizerStartClicked()
  }

  function startClicked() {
    if (permutations < 1000000000
      || computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL
      || computeEngine == COMPUTE_ENGINE_GPU_STABLE) {
      startOptimizer()
    } else {
      setManyPermsModalOpen(true)
    }
  }

  function resetClicked() {
    console.log('Reset clicked')
    OptimizerTabController.resetFilters()
  }

  return (
    <Flex
      vertical={props.isFullSize}
      gap={props.isFullSize ? 5 : 20}
      style={props.isFullSize ? { display: 'flex', flexDirection: 'column' } : { display: 'flex', flexDirection: 'row-reverse' }}
    >
      <ManyPermsModal startSearch={startOptimizer} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen}/>
      <Flex vertical gap={5}>
        <HeaderText>{t('ControlsGroup.Header')/* Controls */}</HeaderText>
        <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
          <Flex gap={defaultGap}>
            <Button
              icon={<ThunderboltFilled/>}
              type='primary'
              loading={optimizationInProgress}
              onClick={startClicked}
              style={{ flex: 1, minWidth: 211 }}
            >
              {t('ControlsGroup.Start')/* Start optimizer */}
            </Button>
          </Flex>

          {props.isFullSize && (<ComputeEngineSelect/>)}

          <Flex gap={defaultGap}>
            <Button onClick={cancelClicked} style={{ flex: 1 }}>
              {tCommon('Cancel')/* Cancel */}
            </Button>

            <Popconfirm
              title={t('ControlsGroup.ResetConfirm.Title')}// 'Reset all filters?'
              description={t('ControlsGroup.ResetConfirm.Description')}// 'All filters will be reset to their default values'
              onConfirm={resetClicked}
              okText={tCommon('Yes')}// 'Yes'
              cancelText={tCommon('No')}// 'No'
            >
              <Button style={{ flex: 1 }}>
                {tCommon('Reset')/* Reset */}
              </Button>
            </Popconfirm>
          </Flex>
        </Flex>
      </Flex>

      <Flex vertical gap={5} style={{ flex: 1, minWidth: 211 }}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('StatViewGroup.Header')/* Stat and filter view */}</HeaderText>
          <TooltipImage type={Hint.statDisplay()}/>
        </Flex>

        <StatsViewSelect/>

        <MemoViewSelect isFullSize={props.isFullSize}/>
      </Flex>

      {!props.isFullSize
        && (
          <Flex vertical gap={3} style={{ flex: 1, minWidth: 211 }}>
            <HeaderText>{t('ComputeEngine')/* Compute engine */}</HeaderText>
            <ComputeEngineSelect/>
            <ProgressDisplay/>
          </Flex>
        )}
    </Flex>
  )
}

function StatsViewSelect() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const statDisplay = window.store((s) => s.statDisplay)
  const setStatDisplay = window.store((s) => s.setStatDisplay)

  return (
    <Radio.Group
      onChange={(e) => {
        const { target: { value } } = e
        setStatDisplay(value as string)
      }}
      optionType='button'
      buttonStyle='solid'
      value={statDisplay}
      style={{ width: '100%', display: 'flex' }}
    >
      <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='combat'>
        {t('StatViewGroup.CombatStats')/* Combat stats */}
      </Radio>
      <Radio
        style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
        value='base'
        defaultChecked
      >
        {t('StatViewGroup.BasicStats')/* Basic stats */}
      </Radio>
    </Radio.Group>
  )
}

function MemoViewSelect(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.StatViewGroup' })

  const memoDisplay = window.store((s) => s.memoDisplay)
  const setMemoDisplay = window.store((s) => s.setMemoDisplay)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const hasMemo = isRemembrance(optimizerTabFocusCharacter)

  return (
    <Radio.Group
      onChange={(e) => {
        const { target: { value } } = e
        setMemoDisplay(value as string)
      }}
      optionType='button'
      buttonStyle='solid'
      disabled={!hasMemo}
      value={hasMemo ? memoDisplay : 'summoner'}
      style={{ width: '100%', display: hasMemo || !props.isFullSize ? 'flex' : 'none' }}
    >
      <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='summoner'>
        {t('SummonerStats')/* Summoner */}
      </Radio>
      <Radio
        style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
        value='memo'
        defaultChecked
      >
        {t('MemospriteStats')/* Memosprite */}
      </Radio>
    </Radio.Group>
  )
}

export function isRemembrance(characterId?: string) {
  if (!characterId) return false
  return DB.getMetadata().characters[characterId].path == 'Remembrance'
}
