import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { Button, Checkbox, Collapse, Drawer, Flex } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import DB, { useGlobalStore } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { TraceNode } from 'types/metadata'
import classes from './StatTracesDrawer.module.css'

const TraceTreeNode = ({
  node,
  checkedKeys,
  onToggle,
  tCommon,
  level,
}: {
  node: TraceNode
  checkedKeys: React.Key[]
  onToggle: (node: TraceNode, checked: boolean) => void
  tCommon: (key: string) => string
  level: number
}) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isChecked = checkedKeys.includes(node.id)

  return (
    <div style={{ paddingLeft: level > 0 ? 20 : 0 }}>
      <Flex gap={4} align="center" className={classes.nodeRow}>
        {hasChildren
          ? (
            <div
              onClick={() => setExpanded(!expanded)}
              className={classes.expandToggle}
            >
              {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </div>
            )
          : <div className={classes.expandSpacer} />}

        <Checkbox
          size="xs"
          checked={isChecked}
          onChange={(e) => onToggle(node, e.currentTarget.checked)}
          styles={{ input: { cursor: 'pointer' } }}
        />

        <Flex gap={0} align="center" className={classes.nodeLabel} onClick={() => onToggle(node, !isChecked)}>
          <img src={Assets.getStatIcon(node.stat)} className={classes.statIcon} />
          <div className={classes.nodeText}>
            {`${
              Utils.isFlat(node.stat)
                ? node.value
                : Utils.precisionRound(node.value * 100) + '%'
            } - ${tCommon(`Stats.${node.stat}`)}`}
          </div>
        </Flex>
      </Flex>

      {hasChildren && (
        <Collapse in={expanded}>
          {node.children.map((child) => (
            <TraceTreeNode
              key={child.id}
              node={child}
              checkedKeys={checkedKeys}
              onToggle={onToggle}
              tCommon={tCommon}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </div>
  )
}

export const StatTracesDrawer = () => {
  const { t: tCommon } = useTranslation('common')
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TracesDrawer' })
  const { close: closeTracesDrawer, isOpen: isOpenTracesDrawer } = useOpenClose(OpenCloseIDs.TRACES_DRAWER)

  const statTraceDrawerFocusCharacter = useGlobalStore.getState().statTracesDrawerFocusCharacter
  const scoringMetadata = useScoringMetadata(statTraceDrawerFocusCharacter)

  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)

  const treeData = useMemo(() => {
    if (statTraceDrawerFocusCharacter) {
      const tree = DB.getMetadata().characters[statTraceDrawerFocusCharacter].traceTree
      const stack = [...tree]
      const allIds: string[] = []
      while (stack.length) {
        const current = stack.pop()!
        for (const child of current.children) stack.push(child)
        allIds.push(current.id)
      }

      if (scoringMetadata?.traces) {
        const deactivated = scoringMetadata.traces.deactivated ?? []
        const active = allIds.filter((x) => !deactivated.includes(x))
        setCheckedKeys(active)
      } else {
        setCheckedKeys(allIds)
      }

      return tree
    }
    return []
  }, [statTraceDrawerFocusCharacter, scoringMetadata])

  const nodesById: Record<string, TraceNode> = {}
  const stack = [...treeData]
  while (stack.length) {
    const current = stack.pop()!
    for (const child of current.children) stack.push(child)
    nodesById[current.id] = current
  }

  const onToggle = useCallback((node: TraceNode, checked: boolean) => {
    setCheckedKeys((prev) => {
      let updated = [...prev]

      if (checked) {
        // Check the node, its ancestors, and its descendants
        let currentId = node.id
        while (currentId) {
          const n = nodesById[currentId]
          if (!n) break
          if (!updated.includes(n.id)) updated.push(n.id)
          currentId = n.pre
        }

        const descStack = [node]
        while (descStack.length) {
          const n = descStack.pop()!
          if (!updated.includes(n.id)) updated.push(n.id)
          for (const child of n.children) descStack.push(child)
        }
      } else {
        // Uncheck the node and its descendants
        const descStack = [node]
        while (descStack.length) {
          const n = descStack.pop()!
          updated = updated.filter((key) => key !== n.id)
          for (const child of n.children) descStack.push(child)
        }
      }

      return updated
    })
  }, [nodesById])

  return (
    <Drawer
      title={t('Title')} // 'Custom stat traces'
      position="right"
      onClose={closeTracesDrawer}
      opened={isOpenTracesDrawer}
      size={400}
    >
      <Flex direction="column" gap={15} style={{ display: statTraceDrawerFocusCharacter ? 'flex' : 'none' }}>
        <HeaderText>
          {t('Header') /* Activated stat traces (all enabled by default) */}
        </HeaderText>

        <div className={classes.treeContainer}>
          {treeData.map((node) => (
            <TraceTreeNode
              key={node.id}
              node={node}
              checkedKeys={checkedKeys}
              onToggle={onToggle}
              tCommon={tCommon}
              level={0}
            />
          ))}
        </div>

        <Button
          fullWidth
          loading={loading}
          onClick={() => {
            if (!statTraceDrawerFocusCharacter) return
            setLoading(true)

            const allKeys = Object.keys(nodesById)
            const deactivated = allKeys.filter((key) => !checkedKeys.includes(key))

            const update = { traces: { deactivated } }

            DB.updateCharacterScoreOverrides(statTraceDrawerFocusCharacter, update)

            setTimeout(() => {
              Message.success(tCommon('Saved'))
              setLoading(false)
              SaveState.delayedSave()
              closeTracesDrawer()
            }, 500)
          }}
        >
          {t('ButtonText') /* Save changes */}
        </Button>
      </Flex>
    </Drawer>
  )
}
