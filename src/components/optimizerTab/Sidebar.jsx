import { Button, Divider, Dropdown, Flex, Grid, Modal, Popconfirm, Progress, Radio, theme, Typography } from 'antd'
import React, { useState } from 'react'
import FormCard from 'components/optimizerTab/FormCard'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from '../TooltipImage'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Hint } from 'lib/hint'
import PropTypes from 'prop-types'
import { DownOutlined, ThunderboltFilled } from '@ant-design/icons'
import { Optimizer } from 'lib/optimizer/optimizer.ts'
import { defaultPadding } from 'components/optimizerTab/optimizerTabConstants'
import { SettingOptions } from 'components/SettingsDrawer'
import DB from 'lib/db'
import { Utils } from 'lib/utils'
import { SavedSessionKeys } from 'lib/constantsSession'
import { COMPUTE_ENGINE_CPU, COMPUTE_ENGINE_GPU_EXPERIMENTAL, COMPUTE_ENGINE_GPU_STABLE } from 'lib/constants'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

const { useToken } = theme
const { useBreakpoint } = Grid

const { Text } = Typography

function getGpuOptions(computeEngine) {
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
    // {
    //   label: (
    //     <div style={{ width: '100%' }}>
    //       More information
    //     </div>
    //   ),
    //   key: MORE_INFO,
    // },
  ]
}

function PermutationDisplay(props) {
  const rightText = props.total
    ? `${Number(props.right).toLocaleString()} / ${Number(props.total).toLocaleString()} - (${Math.ceil(Number(props.right) / Number(props.total) * 100)}%)`
    : `${Number(props.right).toLocaleString()}`

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

PermutationDisplay.propTypes = {
  total: PropTypes.number,
  right: PropTypes.number,
  left: PropTypes.string,
}

const defaultGap = 5

export default function Sidebar() {
  const { lg, xl, xxl } = useBreakpoint()

  const breakpointNoShow = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.NoShow
  const breakpointShowXL = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXL
  const breakpointShowXXL = DB.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXXL

  function renderSidebarAtBreakpoint() {
    if (breakpointNoShow) {
      return <SidebarContent/>
    } else if ((lg && breakpointShowXL && !xl) || (lg && breakpointShowXXL && !xxl)) {
      return <MobileSidebarContent/>
    } else {
      return <SidebarContent/>
    }
  }

  return renderSidebarAtBreakpoint()
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
      style={{ width: '100%', flex: 1 }}
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
  const currentPinned = window.optimizerGrid.current.api.getGridOption('pinnedTopRowData')
  const selectedNodes = window.optimizerGrid.current.api.getSelectedNodes()
  if (!selectedNodes || selectedNodes.length == 0) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.NoneSelected')/* 'No row selected' */)
  } else if (selectedNodes[0].data.statSim) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.SimSelected')/* 'Custom simulation rows are not pinnable' */)
  } else if (currentPinned.find((x) => String(x.id) == String(selectedNodes[0].data.id))) {
    Message.warning(i18next.t('optimizerTab:Sidebar.Pinning.Messages.AlreadyPinned')/* 'This build is already pinned' */)
  } else {
    const selectedRow = selectedNodes[0].data
    currentPinned.push(selectedRow)
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: currentPinned })
  }
}

function clearPinned() {
  const currentPinned = window.optimizerGrid.current.api.getGridOption('pinnedTopRowData')
  if (currentPinned?.length) {
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: [currentPinned[0]] })
  }
}

function SidebarContent() {
  const { token } = useToken()

  const { t } = useTranslation(['optimizerTab', 'common'])

  const statDisplay = window.store((s) => s.statDisplay)
  const setStatDisplay = window.store((s) => s.setStatDisplay)

  const permutationDetails = window.store((s) => s.permutationDetails)
  const permutations = window.store((s) => s.permutations)
  const permutationsSearched = window.store((s) => s.permutationsSearched)
  const permutationsResults = window.store((s) => s.permutationsResults)

  const optimizationInProgress = window.store((s) => s.optimizationInProgress)
  const setOptimizationInProgress = window.store((s) => s.setOptimizationInProgress)

  const optimizerStartTime = window.store((s) => s.optimizerStartTime)
  const optimizerEndTime = window.store((s) => s.optimizerEndTime)

  const computeEngine = window.store((s) => s.savedSession[SavedSessionKeys.computeEngine])
  const optimizerRunningEngine = window.store((s) => s.optimizerRunningEngine)

  const [startTime, setStartTime] = useState(undefined)

  const [manyPermsModalOpen, setManyPermsModalOpen] = useState(false)

  function cancelClicked() {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel(window.store.getState().optimizationId)
  }

  window.optimizerCancelClicked = cancelClicked

  function resetClicked() {
    console.log('Reset clicked')
    OptimizerTabController.resetFilters()
  }

  function filterClicked() {
    console.log('Filter clicked')
    OptimizerTabController.applyRowFilters()
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

  function startOptimizer() {
    setStartTime(Date.now())
    window.optimizerStartClicked()
  }

  return (
    <Flex>
      <ManyPermsModal startSearch={startOptimizer} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen}/>
      <Flex vertical style={{ overflow: 'clip' }}>
        <Flex style={{ position: 'sticky', top: '50%', transform: 'translateY(-50%)', paddingLeft: 10 }}>
          <FormCard height={635}>
            <Flex vertical gap={10}>
              <Flex justify='space-between' align='center'>
                <HeaderText>{t('Sidebar.Permutations')/* Permutations */}</HeaderText>
                <TooltipImage type={Hint.optimizationDetails()}/>
              </Flex>

              <Flex vertical>
                <PermutationDisplay left={t('common:ReadableParts.Head')} right={permutationDetails.Head} total={permutationDetails.HeadTotal}/>
                <PermutationDisplay left={t('common:ReadableParts.Hands')} right={permutationDetails.Hands} total={permutationDetails.HandsTotal}/>
                <PermutationDisplay left={t('common:ReadableParts.Body')} right={permutationDetails.Body} total={permutationDetails.BodyTotal}/>
                <PermutationDisplay left={t('common:ReadableParts.Feet')} right={permutationDetails.Feet} total={permutationDetails.FeetTotal}/>
                <PermutationDisplay left={t('common:ReadableParts.PlanarSphere')} right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal}/>
                <PermutationDisplay left={t('common:ReadableParts.LinkRope')} right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal}/>
              </Flex>

              <Flex vertical>
                <PermutationDisplay left={t('Sidebar.Perms')/* Perms */} right={permutations}/>
                <PermutationDisplay left={t('Sidebar.Searched')/* Searched */} right={permutationsSearched}/>
                <PermutationDisplay left={t('Sidebar.Results')/* Results */} right={permutationsResults}/>
              </Flex>

              <Flex vertical>
                <HeaderText>
                  {calculateProgressText(optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine)}
                </HeaderText>
                <Progress
                  strokeColor={token.colorPrimary}
                  steps={17}
                  size={[8, 5]}
                  percent={Math.floor(Number(permutationsSearched) / Number(permutations) * 100)}
                />
              </Flex>
            </Flex>

            <Flex vertical gap={5}>
              <HeaderText>{t('Sidebar.ControlsGroup.Header')/* Controls */}</HeaderText>
              <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
                <Flex gap={defaultGap}>
                  <Button
                    icon={<ThunderboltFilled/>}
                    type='primary'
                    loading={optimizationInProgress}
                    onClick={startClicked} style={{ flex: 1 }}
                  >
                    {t('Sidebar.ControlsGroup.Start')/* Start optimizer */}
                  </Button>
                </Flex>

                <ComputeEngineSelect/>

                <Flex gap={defaultGap}>
                  <Button onClick={cancelClicked} style={{ flex: 1 }}>
                    {t('Sidebar.ControlsGroup.Cancel')/* Cancel */}
                  </Button>

                  <Popconfirm
                    title={t('Sidebar.ControlsGroup.ResetConfirm.Title')}// 'Reset all filters?'
                    description={t('Sidebar.ControlsGroup.ResetConfirm.Description')}// 'All filters will be reset to their default values'
                    onConfirm={resetClicked}
                    okText={t('Sidebar.ControlsGroup.ResetConfirm.Yes')}// 'Yes'
                    cancelText={t('Sidebar.ControlsGroup.ResetConfirm.No')}// 'No'
                  >
                    <Button style={{ flex: 1 }}>
                      {t('Sidebar.ControlsGroup.Reset')/* Reset */}
                    </Button>
                  </Popconfirm>
                </Flex>
                <Flex gap={defaultGap}>
                </Flex>
              </Flex>
            </Flex>

            <Flex vertical gap={5}>
              <Flex justify='space-between' align='center'>
                <HeaderText>{t('Sidebar.StatViewGroup.Header')/* Stat and filter view */}</HeaderText>
                <TooltipImage type={Hint.statDisplay()}/>
              </Flex>
              <Radio.Group
                onChange={(e) => {
                  const { target: { value } } = e
                  setStatDisplay(value)
                }}
                optionType='button'
                buttonStyle='solid'
                value={statDisplay}
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='combat'>
                  {t('Sidebar.StatViewGroup.CombatStats')/* Combat stats */}
                </Radio>
                <Radio
                  style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
                  value='base'
                  defaultChecked
                >
                  {t('Sidebar.StatViewGroup.BasicStats')/* Basic stats */}
                </Radio>
              </Radio.Group>
            </Flex>

            <Flex vertical gap={5}>
              <Flex justify='space-between' align='center'>
                <HeaderText>{t('Sidebar.ResultsGroup.Header')/* Results */}</HeaderText>
                <TooltipImage type={Hint.actions()}/>
              </Flex>
              <Flex gap={defaultGap} justify='space-around'>
                <Button type='primary' onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
                  {t('Sidebar.ResultsGroup.Equip')/* Equip */}
                </Button>
                <Button onClick={filterClicked} style={{ width: '100px' }}>
                  {t('Sidebar.ResultsGroup.Filter')/* Filter */}
                </Button>
              </Flex>
              <Flex gap={defaultGap} justify='space-around'>
                <Button style={{ width: '100px' }} onClick={addToPinned}>
                  {t('Sidebar.ResultsGroup.Pin')/* Pin build */}
                </Button>
                <Button style={{ width: '100px' }} onClick={clearPinned}>
                  {t('Sidebar.ResultsGroup.Clear')/* Clear pins */}
                </Button>
              </Flex>
            </Flex>
          </FormCard>
        </Flex>
      </Flex>
    </Flex>
  )
}

function MobileSidebarContent() {
  const { t } = useTranslation(['optimizerTab', 'common'])
  const { token } = useToken()
  const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

  const statDisplay = window.store((s) => s.statDisplay)
  const setStatDisplay = window.store((s) => s.setStatDisplay)

  const permutations = window.store((s) => s.permutations)
  const permutationsSearched = window.store((s) => s.permutationsSearched)
  const permutationsResults = window.store((s) => s.permutationsResults)

  const optimizationInProgress = window.store((s) => s.optimizationInProgress)
  const setOptimizationInProgress = window.store((s) => s.setOptimizationInProgress)

  const [startTime, setStartTime] = useState(undefined)

  const optimizerStartTime = window.store((s) => s.optimizerStartTime)
  const optimizerEndTime = window.store((s) => s.optimizerEndTime)

  const [manyPermsModalOpen, setManyPermsModalOpen] = useState(false)

  function cancelClicked() {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel(window.store.getState().optimizationId)
  }

  window.optimizerCancelClicked = cancelClicked

  function resetClicked() {
    console.log('Reset clicked')
    OptimizerTabController.resetFilters()
  }

  function filterClicked() {
    console.log('Filter clicked')
    OptimizerTabController.applyRowFilters()
  }

  function startClicked() {
    const computeEngine = window.store.getState().savedSession[SavedSessionKeys.computeEngine]
    if (permutations < 1000000000
      || computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL
      || computeEngine == COMPUTE_ENGINE_GPU_STABLE) {
      startOptimizer()
    } else {
      setManyPermsModalOpen(true)
    }
  }

  function startOptimizer() {
    setStartTime(Date.now())
    window.optimizerStartClicked()
  }

  return (
    <Flex
      height={150}
      justify='center'
      style={{
        overflow: 'clip',
        position: 'fixed',
        width: '100%',
        bottom: 0,
        left: 0,
        backgroundColor: 'rgb(29 42 71)',
        boxShadow: shadow,
        borderRadius: 5,
        padding: defaultPadding,
        zIndex: 3, // prevent overlap with optimizer grid - ag-grid pinned top row has z-index 2
      }}
    >
      <ManyPermsModal startSearch={startOptimizer} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen}/>
      <Flex gap={20} justify='space-evenly'>
        {/* Permutations Column */}
        <Flex vertical gap={defaultGap}>
          <Flex justify='space-between' align='center' style={{ minWidth: 211 }}>
            <HeaderText>{t('Sidebar.Permutations')/* Permutations */}</HeaderText>
            <TooltipImage type={Hint.optimizationDetails()}/>
          </Flex>
          <Flex vertical>
            <PermutationDisplay left={t('Sidebar.Perms')/* Perms */} right={permutations}/>
            <PermutationDisplay left={t('Sidebar.Searched')/* Searched */} right={permutationsSearched}/>
            <PermutationDisplay left={t('Sidebar.Results')/* Results */} right={permutationsResults}/>
          </Flex>
        </Flex>
        {/* Stats & Filters View Column */}
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify='space-between' align='center'>
            <HeaderText>{t('Sidebar.StatViewGroup.Header')/* Stat and filter view */}</HeaderText>
            <TooltipImage type={Hint.statDisplay()}/>
          </Flex>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatDisplay(value)
            }}
            optionType='button'
            buttonStyle='solid'
            value={statDisplay}
            style={{ width: '100%', display: 'flex' }}
          >
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='base' defaultChecked>
              {t('Sidebar.StatViewGroup.BasicStats')/* Basic stats */}
            </Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='combat'>
              {t('Sidebar.StatViewGroup.CombatStats')/* Combat stats */}
            </Radio>
          </Radio.Group>
          <Flex vertical>
            <ComputeEngineSelect/>
          </Flex>
        </Flex>
        {/* Controls Column */}
        <Flex vertical gap={5} style={{ minWidth: 211 }}>
          <HeaderText>{t('Sidebar.ControlsGroup.Header')/* Controls */}</HeaderText>
          <Flex vertical gap={defaultGap} style={{ marginBottom: 2 }}>
            <Flex gap={defaultGap}>
              <Button
                icon={<ThunderboltFilled/>}
                type='primary'
                loading={optimizationInProgress}
                onClick={startClicked}
                style={{ flex: 1 }}
              >
                {t('Sidebar.ControlsGroup.Start')/* Start optimizer */}
              </Button>
            </Flex>

            <Flex gap={defaultGap}>
              <Button onClick={cancelClicked} style={{ flex: 1 }}>
                {t('Sidebar.ControlsGroup.Cancel')/* Cancel */}
              </Button>
              <Popconfirm
                title={t('Sidebar.ControlsGroup.ResetConfirm.Title')}// 'Reset all filters?'
                description={t('Sidebar.ControlsGroup.ResetConfirm.Description')}// 'All filters will be reset to their default values'
                onConfirm={resetClicked}
                okText={t('Sidebar.ControlsGroup.ResetConfirm.Yes')}// 'Yes'
                cancelText={t('Sidebar.ControlsGroup.ResetConfirm.No')}// 'No'
              >
                <Button style={{ flex: 1 }}>
                  {t('Sidebar.ControlsGroup.Reset')/* Reset */}
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        </Flex>
        {/* Progress & Results Column */}
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
        </Flex>
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify='space-between' align='center'>
            <HeaderText>{t('Sidebar.ResultsGroup.Header')/* Results */}</HeaderText>
            <TooltipImage type={Hint.actions()}/>
          </Flex>
          <Flex gap={defaultGap} justify='space-around'>
            <Button type='primary' onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
              {t('Sidebar.ResultsGroup.Equip')/* Equip */}
            </Button>
            <Button onClick={filterClicked} style={{ width: '100px' }}>
              {t('Sidebar.ResultsGroup.Filter')/* Filter */}
            </Button>
          </Flex>
          <Flex gap={defaultGap} justify='space-around'>
            <Button style={{ width: '100px' }} onClick={addToPinned}>
              {t('Sidebar.ResultsGroup.Pin')/* Pin build */}
            </Button>
            <Button style={{ width: '100px' }} onClick={clearPinned}>
              {t('Sidebar.ResultsGroup.Clear')/* Clear pins */}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

function calculateProgressText(startTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine) {
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
    ? i18next.t('optimizerTab:Sidebar.ProgressText.TimeRemaining', { rate: Math.floor(perSecond).toLocaleString(), timeRemaining: Utils.msToReadable(msRemaining) })
    : i18next.t('optimizerTab:Sidebar.ProgressText.Finished', { rate: Math.floor(perSecond).toLocaleString() })
  // {{rate}} / sec — ${{timeRemaining}} left
  // {{rate}} / sec — Finished
}

function ManyPermsModal(props) {
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
