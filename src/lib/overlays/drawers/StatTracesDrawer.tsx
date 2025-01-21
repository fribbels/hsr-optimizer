import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Drawer, Flex, Tree, TreeProps, Typography } from 'antd'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TraceNode } from 'types/metadata'

const { Text } = Typography

export const StatTracesDrawer = () => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'Stats' })
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TracesDrawer' })
  const statTracesDrawerOpen = window.store((s) => s.statTracesDrawerOpen)
  const setStatTracesDrawerOpen = window.store((s) => s.setStatTracesDrawerOpen)

  const statTraceDrawerFocusCharacter = window.store.getState().statTracesDrawerFocusCharacter

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)

  const treeData = useMemo(() => {
    if (statTraceDrawerFocusCharacter) {
      const scoringMetadata = DB.getScoringMetadata(statTraceDrawerFocusCharacter)
      const tree = DB.getMetadata().characters[statTraceDrawerFocusCharacter].traceTree
      const stack = [...tree]
      const expanded: string[] = []
      while (stack.length) {
        const current = stack.pop()!
        for (const child of current.children) stack.push(child)

        expanded.push(current.id)
      }

      setExpandedKeys(expanded)

      if (scoringMetadata.traces) {
        const deactivated = scoringMetadata.traces.deactivated ?? []

        const active = expanded.filter((x) => !deactivated.includes(x))
        setCheckedKeys(active)
      } else {
        setCheckedKeys(expanded)
      }

      return tree
    }
    return []
  }, [statTraceDrawerFocusCharacter])

  const nodesById: Record<string, TraceNode> = {}
  const stack = [...treeData]
  while (stack.length) {
    const current = stack.pop()!
    for (const child of current.children) stack.push(child)
    nodesById[current.id] = current
  }

  const onCheck: TreeProps['onCheck'] = (checkedKeysValue, info) => {
    let checked = (checkedKeysValue as { checked: React.Key[] }).checked
    const node = nodesById[info.node.key as string]
    if (!node) return

    if (info.checked) {
      // Check ancestors if checked
      let currentId = node.id
      while (currentId) {
        const node = nodesById[currentId]
        if (!node) break

        checked = Array.from(new Set([...checked, node.id]))
        currentId = node.pre
      }

      // Check descendents if checked
      const stack = [node]
      while (stack.length) {
        const node = stack.pop()!
        checked = Array.from(new Set([...checked, node.id]))

        for (const child of node.children) stack.push(child)
      }
    } else {
      // Uncheck descendents if unchecked
      const stack = [node]
      while (stack.length) {
        const node = stack.pop()!
        checked = checked.filter((key) => key !== node.id)

        for (const child of node.children) stack.push(child)
      }
    }

    setCheckedKeys(checked)
  }

  return (
    <Drawer
      title={t('Title')} // 'Custom stat traces'
      placement='right'
      onClose={() => setStatTracesDrawerOpen(false)}
      open={statTracesDrawerOpen}
      width={400}
      forceRender
    >
      <Flex vertical gap={15} style={{ display: statTraceDrawerFocusCharacter ? 'flex' : 'none' }}>
        <HeaderText>
          {t('Header')/* Activated stat traces (all enabled by default) */}
        </HeaderText>

        <Tree
          checkable
          checkStrictly
          showLine
          expandedKeys={expandedKeys}
          selectable={false}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          fieldNames={{ title: 'stat', key: 'id', children: 'children' }}
          defaultExpandParent
          defaultExpandAll
          switcherIcon={<CaretDownOutlined/>}
          // @ts-ignore
          treeData={treeData}
          // @ts-ignore
          titleRender={(traceNode: TraceNode) => (
            <Flex gap={0} align='center'>
              <img src={Assets.getStatIcon(traceNode.stat)} style={{ height: 20, marginLeft: -6, marginRight: 4 }}/>

              <div style={{ whiteSpace: 'pre-wrap' }}>
                {
                  `${Utils.isFlat(traceNode.stat)
                    ? traceNode.value
                    : Utils.precisionRound(traceNode.value * 100) + '%'} - ${tCommon(traceNode.stat)}`
                }
              </div>
            </Flex>
          )}
          style={{ padding: 8 }}
        />

        <Button
          block
          type='primary'
          loading={loading}
          onClick={() => {
            if (!statTraceDrawerFocusCharacter) return
            setLoading(true)

            const allKeys = Object.keys(nodesById)
            const deactivated = allKeys.filter((key) => !checkedKeys.includes(key))

            const scoringMetadata = DB.getScoringMetadata(statTraceDrawerFocusCharacter)
            scoringMetadata.traces = {
              deactivated: deactivated,
            }

            DB.updateCharacterScoreOverrides(statTraceDrawerFocusCharacter, scoringMetadata)

            setTimeout(() => {
              Message.success('Saved')
              setLoading(false)
              SaveState.delayedSave()
              setStatTracesDrawerOpen(false)
            }, 500)
          }}
        >
          {t('ButtonText')/* Save changes */}
        </Button>
      </Flex>
    </Drawer>
  )
}
