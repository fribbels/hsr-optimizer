import { ActionIcon, Button, Modal, MultiSelect, NumberInput, SegmentedControl, Stack, Text } from '@mantine/core'
import { IconCheck, IconChevronRight, IconPencil, IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { Intervention, InterventionType, InterventionUnit } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// EnrichedSimEvent 的子集（避免循环引用）
type ActionEvent = {
  av: number
  characterId: string
  characterName: string
  color: string
  actionIndex: number
}

type InterventionListPanelProps = {
  opened: boolean
  onClose: () => void
  triggerAv: number
  initialSourceCharId?: string
  characters: Array<{ id: string; name: string; color: string }>
  simEvents: ActionEvent[]
}

export function InterventionListPanel({
  opened,
  onClose,
  triggerAv,
  initialSourceCharId,
  characters,
  simEvents,
}: InterventionListPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [activeAv, setActiveAv] = useState(triggerAv)

  const TYPE_OPTIONS = [
    { label: tAv('Types.SpdUp'), value: 'spd_up' },
    { label: tAv('Types.SpdDown'), value: 'spd_down' },
    { label: tAv('Types.AvAdvance'), value: 'av_advance' },
    { label: tAv('Types.AvDelay'), value: 'av_delay' },
  ]

  const UNIT_OPTIONS = [
    { label: tAv('Units.Flat'), value: 'flat' },
    { label: tAv('Units.Percent'), value: 'percent' },
  ]

  // ---- 标题区 AV 编辑（点击 ✏ 切换为输入框，✓ 确认更新）----
  const [avEditing, setAvEditing] = useState(false)
  const [avEditValue, setAvEditValue] = useState(triggerAv)

  function confirmAvEdit() {
    setActiveAv(avEditValue)
    setAvEditing(false)
    setFormOpened(false)
  }

  const allInterventions = useAVVisualTabStore((s) => s.interventions)
  const currentInterventions = useMemo(
    () => allInterventions.filter((iv) => iv.triggerAv === activeAv),
    [allInterventions, activeAv],
  )

  // 该 AV 处的所有行动，按 (characterId, actionIndex) 排列（不去重）
  const actionsAtAv = useMemo(
    () => simEvents.filter((e) => Math.abs(e.av - activeAv) < 0.005),
    [simEvents, activeAv],
  )

  // 每个 characterId 在该 AV 的总行动次数（用于判断是否显示序号标题）
  const actionCountPerChar = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of actionsAtAv) map.set(e.characterId, (map.get(e.characterId) ?? 0) + 1)
    return map
  }, [actionsAtAv])

  const isStructured = actionsAtAv.length > 0

  // 行动结束瞬间干预：按 (afterCharId, afterActionIndex) 分组
  const afterMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.afterCharId) continue
      const key = `${iv.afterCharId}:${iv.afterActionIndex ?? 0}`
      const list = map.get(key) ?? []
      list.push(iv)
      map.set(key, list)
    }
    return map
  }, [currentInterventions])

  // 行动期间干预：按 (beforeCharId, beforeActionIndex) 分组，与 afterMap 对称
  const beforeMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.beforeCharId) continue
      const key = `${iv.beforeCharId}:${iv.beforeActionIndex ?? 0}`
      const list = map.get(key) ?? []
      list.push(iv)
      map.set(key, list)
    }
    return map
  }, [currentInterventions])

  // ---- 表单状态 ----
  const [formOpened, setFormOpened] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formAfterCharId, setFormAfterCharId] = useState<string | undefined>(undefined)
  const [formAfterActionIndex, setFormAfterActionIndex] = useState<number | undefined>(undefined)
  const [formBeforeCharId, setFormBeforeCharId] = useState<string | undefined>(undefined)
  const [formBeforeActionIndex, setFormBeforeActionIndex] = useState<number | undefined>(undefined)
  const [formType, setFormType] = useState<InterventionType>('spd_up')
  const [formTargets, setFormTargets] = useState<string[]>(
    initialSourceCharId ? [initialSourceCharId] : [],
  )
  const [formValue, setFormValue] = useState(0)
  const [formUnit, setFormUnit] = useState<InterventionUnit>('flat')
  const [formDuration, setFormDuration] = useState(1)

  const isAvType = formType === 'av_advance' || formType === 'av_delay'
  const targetOptions = characters.map((c) => ({ label: c.name, value: c.id }))

  function resetFormFields() {
    setFormType('spd_up')
    setFormTargets(initialSourceCharId ? [initialSourceCharId] : [])
    setFormValue(0)
    setFormUnit('flat')
    setFormDuration(1)
  }

  // 行动期间 + 按钮：beforeCharId=该角色，beforeActionIndex=该次行动的 actionIndex
  function openAddBefore(charId: string, actionIndex: number) {
    setIsEditing(false)
    setEditingId(null)
    setFormAfterCharId(undefined)
    setFormAfterActionIndex(undefined)
    setFormBeforeCharId(charId)
    setFormBeforeActionIndex(actionIndex)
    resetFormFields()
    setFormOpened(true)
  }

  // 行动结束瞬间 + 按钮：afterCharId=该角色，afterActionIndex=该次行动的 actionIndex
  function openAddAfter(charId: string, actionIndex: number) {
    setIsEditing(false)
    setEditingId(null)
    setFormAfterCharId(charId)
    setFormAfterActionIndex(actionIndex)
    setFormBeforeCharId(undefined)
    setFormBeforeActionIndex(undefined)
    resetFormFields()
    setFormOpened(true)
  }

  // 平铺视图（该 AV 处无角色行动）+ 按钮：使用全局行动期间（不绑定角色）
  function openAddFlat() {
    setIsEditing(false)
    setEditingId(null)
    setFormAfterCharId(undefined)
    setFormAfterActionIndex(undefined)
    setFormBeforeCharId(undefined)
    setFormBeforeActionIndex(undefined)
    resetFormFields()
    setFormOpened(true)
  }

  function openEdit(iv: Intervention) {
    setIsEditing(true)
    setEditingId(iv.id)
    setFormAfterCharId(iv.afterCharId)
    setFormAfterActionIndex(iv.afterActionIndex)
    setFormBeforeCharId(iv.beforeCharId)
    setFormBeforeActionIndex(iv.beforeActionIndex)
    setFormType(iv.type)
    setFormTargets([...iv.targets])
    setFormValue(iv.value)
    setFormUnit(iv.unit)
    setFormDuration(iv.durationTurns)
    setFormOpened(true)
  }

  function handleTypeChange(newType: string) {
    setFormType(newType as InterventionType)
    const nowAvType = newType === 'av_advance' || newType === 'av_delay'
    if (nowAvType) setFormDuration(0)
    else if (formDuration === 0) setFormDuration(1)
  }

  function handleSubmit() {
    if (formTargets.length === 0 || formValue <= 0) return
    const durationTurns = isAvType ? 0 : formDuration
    if (isEditing && editingId) {
      AvVisualTabController.updateIntervention(editingId, {
        type: formType, targets: formTargets, value: formValue, unit: formUnit, durationTurns,
      })
    } else {
      AvVisualTabController.addIntervention({
        triggerAv: activeAv,
        afterCharId: formAfterCharId,
        afterActionIndex: formAfterActionIndex,
        beforeCharId: formBeforeCharId,
        beforeActionIndex: formBeforeActionIndex,
        type: formType, targets: formTargets, value: formValue, unit: formUnit, durationTurns,
      })
    }
    setFormOpened(false)
  }

  function getFormTitle(): string {
    if (isEditing) return tAv('Panel.FormTitleEdit')
    if (formAfterCharId) {
      const name = characters.find((c) => c.id === formAfterCharId)?.name ?? formAfterCharId
      const turnSuffix = formAfterActionIndex !== undefined && formAfterActionIndex > 0
        ? tAv('TurnSuffix', { n: formAfterActionIndex + 1 })
        : ''
      return tAv('Panel.FormTitleAfter', { name, turnSuffix })
    }
    if (formBeforeCharId) {
      const name = characters.find((c) => c.id === formBeforeCharId)?.name ?? formBeforeCharId
      const turnSuffix = formBeforeActionIndex !== undefined && formBeforeActionIndex > 0
        ? tAv('TurnSuffix', { n: formBeforeActionIndex + 1 })
        : ''
      return tAv('Panel.FormTitleBefore', { name, turnSuffix })
    }
    return tAv('Panel.FormTitleFlat', { av: activeAv.toFixed(1) })
  }

  function renderItem(iv: Intervention) {
    return (
      <InterventionItem
        key={iv.id}
        intervention={iv}
        characters={characters}
        highlighted={editingId === iv.id}
        onEdit={() => openEdit(iv)}
        onDelete={() => {
          AvVisualTabController.removeIntervention(iv.id)
          if (editingId === iv.id) setFormOpened(false)
        }}
      />
    )
  }

  // 添加按钮：尺寸与一条 InterventionItem 行相当，+ 号居中，而非单薄的小图标
  function renderIconAdd(onClick: () => void) {
    return (
      <Button
        variant='default'
        size='xs'
        onClick={onClick}
        fullWidth
        styles={{ root: { height: 26, paddingInline: 0 } }}
      >
        <IconPlus size={14} />
      </Button>
    )
  }

  // ---- 结构化列表 ----
  function renderList() {
    if (!isStructured) {
      return (
        <Stack gap='sm'>
          {currentInterventions.length > 0 && (
            <Stack gap={2}>{currentInterventions.map(renderItem)}</Stack>
          )}
          {renderIconAdd(openAddFlat)}
        </Stack>
      )
    }

    return (
      <Stack gap='sm'>
        {actionsAtAv.map((ev) => {
          const totalForChar = actionCountPerChar.get(ev.characterId) ?? 1
          const showIndex = totalForChar > 1
          const beforeIvs = beforeMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const afterIvs = afterMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []

          return (
            <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
              {/* 容器：角色标题（含序号）+ 行动期间 —— 每次行动结构完全一致 */}
              <div style={{
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 6, padding: '6px 8px',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: ev.color, flexShrink: 0,
                  }} />
                  <Text size='xs' fw={700} style={{ color: ev.color }}>
                    {ev.characterName}{showIndex ? tAv('TurnSuffix', { n: ev.actionIndex + 1 }) : ''}
                  </Text>
                  <div style={{ flex: 1, height: 1, backgroundColor: ev.color, opacity: 0.35 }} />
                </div>
                {beforeIvs.map(renderItem)}
                {renderIconAdd(() => openAddBefore(ev.characterId, ev.actionIndex))}
              </div>

              {/* 容器外：行动结束瞬间 —— 左右内缩与容器 padding（8px）对齐，条目/按钮宽度保持一致 */}
              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {afterIvs.map(renderItem)}
                {renderIconAdd(() => openAddAfter(ev.characterId, ev.actionIndex))}
              </div>
            </Fragment>
          )
        })}
      </Stack>
    )
  }

  // ---- 右侧表单 ----
  function renderForm() {
    return (
      <Stack gap='sm'>
        <Text size='xs' fw={600} c='dimmed'>{getFormTitle()}</Text>

        <div>
          <Text size='xs' fw={500} mb={4}>{tAv('Panel.EffectType')}</Text>
          <SegmentedControl fullWidth size='xs' data={TYPE_OPTIONS} value={formType} onChange={handleTypeChange} />
        </div>

        <MultiSelect
          label={tAv('Panel.Targets')}
          size='xs'
          data={targetOptions}
          value={formTargets}
          onChange={setFormTargets}
          placeholder={tAv('Panel.TargetsPlaceholder')}
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <NumberInput
            label={tAv('Panel.Value')}
            size='xs'
            value={formValue}
            onChange={(v) => setFormValue(typeof v === 'number' ? v : formValue)}
            min={0}
            style={{ flex: 1 }}
          />
          <SegmentedControl
            size='xs'
            data={UNIT_OPTIONS}
            value={formUnit}
            onChange={(v) => setFormUnit(v as InterventionUnit)}
            style={{ alignSelf: 'flex-end' }}
          />
        </div>

        {!isAvType && (
          <NumberInput
            label={tAv('Panel.Duration')}
            size='xs'
            value={formDuration}
            onChange={(v) => setFormDuration(typeof v === 'number' ? Math.max(1, v) : formDuration)}
            min={1}
          />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant='default' size='xs' onClick={() => setFormOpened(false)}>{tAv('Panel.Cancel')}</Button>
          <Button size='xs' onClick={handleSubmit} disabled={formTargets.length === 0 || formValue <= 0}>
            {isEditing ? tAv('Panel.Save') : tAv('Panel.Add')}
          </Button>
        </div>
      </Stack>
    )
  }

  // ---- Modal 标题：AV {值} + ✏ 编辑按钮；编辑态切换为输入框 + ✓ 确认按钮 ----
  function renderTitle() {
    if (avEditing) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text size='sm' fw={600}>AV</Text>
          <NumberInput
            size='xs'
            value={avEditValue}
            onChange={(v) => setAvEditValue(typeof v === 'number' ? v : avEditValue)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmAvEdit() }}
            min={0}
            decimalScale={2}
            style={{ width: 90 }}
            autoFocus
          />
          <ActionIcon size='sm' variant='filled' color='blue' onClick={confirmAvEdit}>
            <IconCheck size={14} />
          </ActionIcon>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Text size='sm' fw={600}>AV {activeAv.toFixed(1)}</Text>
        <ActionIcon
          size='xs'
          variant='subtle'
          color='gray'
          onClick={() => { setAvEditValue(activeAv); setAvEditing(true) }}
        >
          <IconPencil size={12} />
        </ActionIcon>
      </div>
    )
  }

  return (
    <Modal opened={opened} onClose={onClose} title={renderTitle()} size='lg' centered>
      {/* 行动顺序行：该 AV 处按行动顺序显示头像，同一角色多次行动显示多个头像 */}
      {actionsAtAv.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          {actionsAtAv.map((ev, i) => (
            <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
              {i > 0 && <IconChevronRight size={16} color='var(--mantine-color-dimmed)' />}
              <ActionOrderAvatar characterId={ev.characterId} characterName={ev.characterName} color={ev.color} />
            </Fragment>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', minHeight: 200 }}>
        {/* 左列：列表 */}
        <div style={{ flex: '0 0 260px' }}>
          {renderList()}
        </div>

        {/* 分隔线 */}
        <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'var(--mantine-color-dark-4)', margin: '0 16px' }} />

        {/* 右列：表单 */}
        <div style={{ flex: 1 }}>
          {formOpened && renderForm()}
        </div>
      </div>
    </Modal>
  )
}
