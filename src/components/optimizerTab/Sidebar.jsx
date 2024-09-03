import { Button, Divider, Dropdown, Flex, Grid, Modal, Popconfirm, Progress, Radio, theme, Typography } from 'antd'
import React, { useState } from 'react'
import FormCard from 'components/optimizerTab/FormCard'
import { HeaderText } from '../HeaderText'
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

const { useToken } = theme
const { useBreakpoint } = Grid

const { Text } = Typography

const computeEngineToDisplay = {
  [COMPUTE_ENGINE_GPU_EXPERIMENTAL]: 'GPU acceleration: Enabled',
  [COMPUTE_ENGINE_GPU_STABLE]: 'GPU acceleration: Enabled',
  [COMPUTE_ENGINE_CPU]: 'GPU acceleration: Disabled',
}

function getGpuOptions(computeEngine) {
  return [
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL ? 'bold' : '' }}>
          GPU acceleration enabled (experimental)
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_EXPERIMENTAL,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_GPU_STABLE ? 'bold' : '' }}>
          GPU acceleration enabled (stable)
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_STABLE,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine == COMPUTE_ENGINE_CPU ? 'bold' : '' }}>
          CPU only
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
  const computeEngine = window.store((s) => s.savedSession[SavedSessionKeys.computeEngine])
  return (
    <Dropdown
      menu={{
        items: getGpuOptions(computeEngine),
        onClick: (e) => {
          if (e.key == COMPUTE_ENGINE_CPU) {
            window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
            Message.success(`Switched compute engine to [${e.key}]`)
          } else {
            verifyWebgpuSupport(true).then((device) => {
              if (device) {
                window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, e.key)
                Message.success(`Switched compute engine to [${e.key}]`)
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
            {computeEngineToDisplay[computeEngine]}
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
    Message.warning('No row selected')
  } else if (selectedNodes[0].data.statSim) {
    Message.warning('Custom simulation rows are not pinnable')
  } else if (currentPinned.find((x) => String(x.id) == String(selectedNodes[0].data.id))) {
    Message.warning('This build is already pinned')
  } else {
    const selectedRow = selectedNodes[0].data
    currentPinned.push(selectedRow)
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: currentPinned })
  }
}

function clearPinned() {
  const currentPinned = window.optimizerGrid.current.api.getGridOption('pinnedTopRowData')
  if (currentPinned.length) {
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: [currentPinned[0]] })
  }
}

function SidebarContent() {
  const { token } = useToken()

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
    <Flex>
      <ManyPermsModal startSearch={startOptimizer} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen}/>
      <Flex vertical style={{ overflow: 'clip' }}>
        <Flex style={{ position: 'sticky', top: '50%', transform: 'translateY(-50%)', paddingLeft: 10 }}>
          <FormCard height={635}>
            <Flex vertical gap={10}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Permutations</HeaderText>
                <TooltipImage type={Hint.optimizationDetails()}/>
              </Flex>

              <Flex vertical>
                <PermutationDisplay left='Head' right={permutationDetails.Head} total={permutationDetails.HeadTotal}/>
                <PermutationDisplay left='Hands' right={permutationDetails.Hands} total={permutationDetails.HandsTotal}/>
                <PermutationDisplay left='Body' right={permutationDetails.Body} total={permutationDetails.BodyTotal}/>
                <PermutationDisplay left='Feet' right={permutationDetails.Feet} total={permutationDetails.FeetTotal}/>
                <PermutationDisplay left='Sphere' right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal}/>
                <PermutationDisplay left='Rope' right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal}/>
              </Flex>

              <Flex vertical>
                <PermutationDisplay left='Perms' right={permutations}/>
                <PermutationDisplay left='Searched' right={permutationsSearched}/>
                <PermutationDisplay left='Results' right={permutationsResults}/>
              </Flex>

              <Flex vertical>
                <HeaderText>
                  {calculateProgressText(optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress)}
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
              <HeaderText>Controls</HeaderText>
              <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
                <Flex gap={defaultGap}>
                  <Button
                    icon={<ThunderboltFilled/>}
                    type='primary'
                    loading={optimizationInProgress}
                    onClick={startClicked} style={{ flex: 1 }}
                  >
                    Start optimizer
                  </Button>
                </Flex>

                <ComputeEngineSelect/>

                <Flex gap={defaultGap}>
                  <Button onClick={cancelClicked} style={{ flex: 1 }}>
                    Cancel
                  </Button>

                  <Popconfirm
                    title='Reset all filters?'
                    description='All filters will be reset to their default values'
                    onConfirm={resetClicked}
                    okText='Yes'
                    cancelText='No'
                  >
                    <Button style={{ flex: 1 }}>
                      Reset
                    </Button>
                  </Popconfirm>
                </Flex>
                <Flex gap={defaultGap}>
                </Flex>
              </Flex>
            </Flex>

            <Flex vertical gap={5}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Stat and filter view</HeaderText>
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
                  Combat stats
                </Radio>
                <Radio
                  style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
                  value='base'
                  defaultChecked
                >
                  Basic stats
                </Radio>
              </Radio.Group>
            </Flex>

            <Flex vertical gap={5}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Results</HeaderText>
                <TooltipImage type={Hint.actions()}/>
              </Flex>
              <Flex gap={defaultGap} justify='space-around'>
                <Button type='primary' onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
                  Equip
                </Button>
                <Button onClick={filterClicked} style={{ width: '100px' }}>
                  Filter
                </Button>
              </Flex>
              <Flex gap={defaultGap} justify='space-around'>
                <Button style={{ width: '100px' }} onClick={addToPinned}>
                  Pin build
                </Button>
                <Button style={{ width: '100px' }} onClick={clearPinned}>
                  Clear pins
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
            <HeaderText>Permutations</HeaderText>
            <TooltipImage type={Hint.optimizationDetails()}/>
          </Flex>
          <Flex vertical>
            <PermutationDisplay left='Perms' right={permutations}/>
            <PermutationDisplay left='Searched' right={permutationsSearched}/>
            <PermutationDisplay left='Results' right={permutationsResults}/>
          </Flex>
        </Flex>
        {/* Stats & Filters View Column */}
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify='space-between' align='center'>
            <HeaderText>Stat and filter view</HeaderText>
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
              Basic stats
            </Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value='combat'>
              Combat stats
            </Radio>
          </Radio.Group>
          <Flex vertical>
            <ComputeEngineSelect/>
          </Flex>
        </Flex>
        {/* Controls Column */}
        <Flex vertical gap={5} style={{ minWidth: 211 }}>
          <HeaderText>Controls</HeaderText>
          <Flex vertical gap={defaultGap} style={{ marginBottom: 2 }}>
            <Flex gap={defaultGap}>
              <Button
                icon={<ThunderboltFilled/>}
                type='primary'
                loading={optimizationInProgress}
                onClick={startClicked}
                style={{ flex: 1 }}
              >
                Start optimizer
              </Button>
            </Flex>

            <Flex gap={defaultGap}>
              <Button onClick={cancelClicked} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Popconfirm
                title='Reset all filters?'
                description='All filters will be reset to their default values'
                onConfirm={resetClicked}
                okText='Yes'
                cancelText='No'
              >
                <Button style={{ flex: 1 }}>
                  Reset
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
            <HeaderText>Results</HeaderText>
            <TooltipImage type={Hint.actions()}/>
          </Flex>
          <Flex gap={defaultGap} justify='space-around'>
            <Button type='primary' onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
              Equip
            </Button>
            <Button onClick={filterClicked} style={{ width: '100px' }}>
              Filter
            </Button>
          </Flex>
          <Flex gap={defaultGap} justify='space-around'>
            <Button style={{ width: '100px' }} onClick={addToPinned}>
              Pin build
            </Button>
            <Button style={{ width: '100px' }} onClick={clearPinned}>
              Clear pins
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

function calculateProgressText(startTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress) {
  if (!startTime) {
    return 'Progress'
  }

  let endTime = Date.now()
  if (optimizerEndTime) {
    endTime = optimizerEndTime
  }

  const msDiff = endTime - startTime
  if (!optimizerEndTime && msDiff < 5_000 && permutationsSearched < 5_000_000 || !permutationsSearched) {
    return 'Progress  (calculating ETA..)'
  }

  const msRemaining = msDiff / permutationsSearched * (permutations - permutationsSearched)
  const persecond = permutationsSearched / (msDiff / 1000)
  return optimizationInProgress
    ? `${Math.floor(persecond).toLocaleString()} / sec — ${Utils.msToReadable(msRemaining)} left`
    : `${Math.floor(persecond).toLocaleString()} / sec — Finished`
}

function ManyPermsModal(props) {
  return (
    <Modal
      title='Very large search requested'
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
          This optimization search will take a substantial amount of time to finish. You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats,
          or use the Substat weight filter to reduce the number of permutations.
        </Text>
        <Button
          onClick={() => props.setManyPermsModalOpen(false)}
          style={{ width: 250 }}
          type='primary'
        >
          Cancel search
        </Button>
        <Button
          onClick={() => {
            props.setManyPermsModalOpen(false)
            props.startSearch()
          }}
          style={{ width: 250 }}
          type='primary'
        >
          Proceed with search
        </Button>
      </Flex>
    </Modal>
  )
}
