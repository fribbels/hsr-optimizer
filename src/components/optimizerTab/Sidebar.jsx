import { Button, Divider, Flex, Grid, Progress, Radio, theme, Typography } from 'antd'
import React from 'react'
import FormCard from 'components/optimizerTab/FormCard'
import { HeaderText } from '../HeaderText'
import { TooltipImage } from '../TooltipImage'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Hint } from 'lib/hint'
import PropTypes from 'prop-types'
import { ThunderboltFilled } from '@ant-design/icons'
import { Optimizer } from 'lib/optimizer/optimizer'
import { defaultPadding } from 'components/optimizerTab/optimizerTabConstants';

const { useToken } = theme
const { useBreakpoint } = Grid

const { Text } = Typography

function PermutationDisplay(props) {
  const rightText = props.total
    ? `${Number(props.right).toLocaleString()} / ${Number(props.total).toLocaleString()} - (${Math.ceil(Number(props.right) / Number(props.total) * 100)}%)`
    : `${Number(props.right).toLocaleString()}`

  return (
    <Flex justify="space-between">
      <Text style={{ lineHeight: '24px' }}>
        {props.left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
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
  const { lg, xl } = useBreakpoint()

  return (!lg || xl
    ? <SidebarContent />
    : <MobileSidebarContent />)
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

  return (
    <Flex vertical style={{ overflow: 'clip' }}>
      <Flex style={{ position: 'sticky', top: '50%', transform: 'translateY(-50%)', paddingLeft: 10 }}>
        <FormCard height={600}>
          <Flex vertical gap={10}>
            <Flex justify="space-between" align="center">
              <HeaderText>Permutations</HeaderText>
              <TooltipImage type={Hint.optimizationDetails()} />
            </Flex>

            <Flex vertical>
              <PermutationDisplay left="Head" right={permutationDetails.Head} total={permutationDetails.HeadTotal} />
              <PermutationDisplay left="Hands" right={permutationDetails.Hands} total={permutationDetails.HandsTotal} />
              <PermutationDisplay left="Body" right={permutationDetails.Body} total={permutationDetails.BodyTotal} />
              <PermutationDisplay left="Feet" right={permutationDetails.Feet} total={permutationDetails.FeetTotal} />
              <PermutationDisplay left="Sphere" right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal} />
              <PermutationDisplay left="Rope" right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal} />
            </Flex>

            <Flex vertical>
              <PermutationDisplay left="Perms" right={permutations} />
              <PermutationDisplay left="Searched" right={permutationsSearched} />
              <PermutationDisplay left="Results" right={permutationsResults} />
            </Flex>

            <Flex vertical>
              <HeaderText>Progress</HeaderText>
              <Progress
                strokeColor={token.colorPrimary}
                steps={17}
                size={[8, 5]}
                percent={Math.floor(Number(permutationsSearched) / Number(permutations) * 100)}
              />
            </Flex>

            <Flex justify="space-between" align="center">
              <HeaderText>Controls</HeaderText>
            </Flex>
            <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
              <Flex gap={defaultGap}>
                <Button icon={<ThunderboltFilled />} type="primary" loading={optimizationInProgress} onClick={window.optimizerStartClicked} style={{ flex: 1 }}>
                  Start optimizer
                </Button>
              </Flex>
              <Flex gap={defaultGap}>
                <Button onClick={cancelClicked} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button onClick={resetClicked} style={{ flex: 1 }}>
                  Reset
                </Button>
              </Flex>
              <Flex gap={defaultGap}>
              </Flex>
            </Flex>

            <Flex justify="space-between" align="center">
              <HeaderText>Stat and filter view</HeaderText>
              <TooltipImage type={Hint.statDisplay()} />
            </Flex>
            <Radio.Group
              onChange={(e) => {
                const { target: { value } } = e
                setStatDisplay(value)
              }}
              optionType="button"
              buttonStyle="solid"
              value={statDisplay}
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="base" defaultChecked>Base stats</Radio>
              <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="combat">Combat stats</Radio>
            </Radio.Group>

            <Flex justify="space-between" align="center">
              <HeaderText>Results</HeaderText>
              <TooltipImage type={Hint.actions()} />
            </Flex>
            <Flex gap={defaultGap} justify="space-around">
              <Button onClick={filterClicked} style={{ width: '100px' }}>
                Filter
              </Button>
              <Button onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
                Equip
              </Button>
            </Flex>
          </Flex>
        </FormCard>
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

  return (
    <Flex
      height={150}
      justify="center"
      style={{
        overflow: 'clip',
        position: 'fixed',
        width: '100%',
        bottom: 0,
        left: 0,
        backgroundColor: token.colorBgContainer,
        boxShadow: shadow,
        borderRadius: 5,
        padding: defaultPadding,
      }}
    >
      <Flex gap={20} justify="space-evenly">
        <Flex vertical gap={defaultGap} align="center" justify="space-between" style={{ minWidth: 211 }}>
          <Flex vertical gap={defaultGap}>
            <Flex vertical>
              <HeaderText>Progress</HeaderText>
              <Progress
                strokeColor={token.colorPrimary}
                steps={17}
                size={[8, 5]}
                percent={Math.floor(Number(permutationsSearched) / Number(permutations) * 100)}
              />
            </Flex>
            <Flex vertical>
              <PermutationDisplay left="Searched" right={permutationsSearched} />
              <PermutationDisplay left="Results" right={permutationsResults} />
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify="space-between" align="center">
            <HeaderText>Stat and filter view</HeaderText>
            <TooltipImage type={Hint.statDisplay()} />
          </Flex>
          <Radio.Group
            onChange={(e) => {
              const { target: { value } } = e
              setStatDisplay(value)
            }}
            optionType="button"
            buttonStyle="solid"
            value={statDisplay}
            style={{ width: '100%', display: 'flex' }}
          >
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="base" defaultChecked>Base stats</Radio>
            <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value="combat">Combat stats</Radio>
          </Radio.Group>
        </Flex>
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify="space-between" align="center">
            <HeaderText>Controls</HeaderText>
          </Flex>
          <Flex vertical gap={defaultGap} style={{ marginBottom: 2 }}>
            <Flex gap={defaultGap}>
              <Button icon={<ThunderboltFilled />} type="primary" loading={optimizationInProgress} onClick={window.optimizerStartClicked} style={{ flex: 1 }}>
                Start optimizer
              </Button>
            </Flex>
            <Flex gap={defaultGap}>
              <Button onClick={cancelClicked} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onClick={resetClicked} style={{ flex: 1 }}>
                Reset
              </Button>
            </Flex>
            <Flex gap={defaultGap}>
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical gap={defaultGap} style={{ minWidth: 211 }}>
          <Flex justify="space-between" align="center">
            <HeaderText>Results</HeaderText>
            <TooltipImage type={Hint.actions()} />
          </Flex>
          <Flex gap={defaultGap} justify="space-around">
            <Button onClick={filterClicked} style={{ width: '100px' }}>
              Filter
            </Button>
            <Button onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }}>
              Equip
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
