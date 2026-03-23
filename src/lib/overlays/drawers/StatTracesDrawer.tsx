import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { Button, Checkbox, Collapse, Drawer, Flex } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { HeaderText } from 'lib/ui/HeaderText'
import type React from 'react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { type TraceNode } from 'types/metadata'
import classes from './StatTracesDrawer.module.css'
import { isFlat } from 'lib/utils/statUtils'
import { precisionRound } from 'lib/utils/mathUtils'

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
  tCommon: TFunction<'common'>
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
          checked={isChecked}
          onChange={(e) => onToggle(node, e.currentTarget.checked)}
          styles={{ input: { cursor: 'pointer' } }}
        />

        <Flex align="center" className={classes.nodeLabel} onClick={() => onToggle(node, !isChecked)}>
          <img src={Assets.getStatIcon(node.stat)} className={classes.statIcon} />
          <div className={classes.nodeText}>
            {`${
              isFlat(node.stat)
                ? node.value
                : precisionRound(node.value * 100) + '%'
            } - ${tCommon(`Stats.${node.stat}`)}`}
          </div>
        </Flex>
      </Flex>

      {hasChildren && (
        <Collapse expanded={expanded}>
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

function StatTracesDrawerContent({ close }: { close: () => void }) {
  const { t: tCommon } = useTranslation('common')
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TracesDrawer' })

  const statTraceDrawerFocusCharacter = useGlobalStore((s) => s.statTracesDrawerFocusCharacter)
  const scoringMetadata = useScoringMetadata(statTraceDrawerFocusCharacter)

  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)

  const { treeData, allIds } = useMemo(() => {
    if (!statTraceDrawerFocusCharacter) return { treeData: [] as TraceNode[], allIds: [] as string[] }
    const tree = getGameMetadata().characters[statTraceDrawerFocusCharacter].traceTree
    const stack = [...tree]
    const ids: string[] = []
    while (stack.length) {
      const current = stack.pop()!
      for (const child of current.children) stack.push(child)
      ids.push(current.id)
    }
    return { treeData: tree, allIds: ids }
  }, [statTraceDrawerFocusCharacter])

  useEffect(() => {
    if (!allIds.length) return
    if (scoringMetadata?.traces) {
      const deactivated = scoringMetadata.traces.deactivated ?? []
      setCheckedKeys(allIds.filter((x) => !deactivated.includes(x)))
    } else {
      setCheckedKeys(allIds)
    }
  }, [allIds, scoringMetadata])

  const nodesById = useMemo(() => {
    const map: Record<string, TraceNode> = {}
    const stack = [...treeData]
    while (stack.length) {
      const current = stack.pop()!
      for (const child of current.children) stack.push(child)
      map[current.id] = current
    }
    return map
  }, [treeData])

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

  const handleSave = useCallback(() => {
    if (!statTraceDrawerFocusCharacter) return
    setLoading(true)

    const allKeys = Object.keys(nodesById)
    const deactivated = allKeys.filter((key) => !checkedKeys.includes(key))

    useScoringStore.getState().updateCharacterOverrides(statTraceDrawerFocusCharacter, { traces: { deactivated } })
    SaveState.delayedSave()

    setTimeout(() => {
      Message.success(tCommon('Saved'))
      setLoading(false)
      close()
    }, 500)
  }, [statTraceDrawerFocusCharacter, nodesById, checkedKeys, close, tCommon])

  return (
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
        onClick={handleSave}
      >
        {t('ButtonText') /* Save changes */}
      </Button>
    </Flex>
  )
}

export function StatTracesDrawer() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TracesDrawer' })
  const { close: closeTracesDrawer, isOpen: isOpenTracesDrawer } = useOpenClose(OpenCloseIDs.TRACES_DRAWER)

  return (
    <Drawer
      title={t('Title')}
      position="right"
      onClose={closeTracesDrawer}
      opened={isOpenTracesDrawer}
      size={400}
    >
      {isOpenTracesDrawer && <StatTracesDrawerContent close={closeTracesDrawer} />}
    </Drawer>
  )
}
