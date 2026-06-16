import { ActionIcon, Button, Modal, MultiSelect, NumberInput, SegmentedControl, Stack, Text } from '@mantine/core'
import { IconCheck, IconChevronRight, IconPencil, IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { Intervention, InterventionType, InterventionUnit } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// A subset of EnrichedSimEvent (avoids a circular import)
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

  // ---- Title-bar AV editing (click ✏ to switch to an input box, ✓ confirms the update) ----
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

  // All actions at this AV, ordered by (characterId, actionIndex) (not deduplicated)
  const actionsAtAv = useMemo(
    () => simEvents.filter((e) => Math.abs(e.av - activeAv) < 0.005),
    [simEvents, activeAv],
  )

  // Total number of actions per characterId at this AV (used to decide whether to show a turn-number suffix)
  const actionCountPerChar = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of actionsAtAv) map.set(e.characterId, (map.get(e.characterId) ?? 0) + 1)
    return map
  }, [actionsAtAv])

  const isStructured = actionsAtAv.length > 0

  // End-of-action interventions: grouped by (afterCharId, afterActionIndex)
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

  // During-action interventions: grouped by (beforeCharId, beforeActionIndex), symmetric to afterMap
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

  // ---- Form state ----
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

  // "During action" + button: beforeCharId = this character, beforeActionIndex = this action's actionIndex
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

  // "End-of-action instant" + button: afterCharId = this character, afterActionIndex = this action's actionIndex
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

  // Flat view (no character acts at this AV) + button: uses the global "during action" timing (not bound to a character)
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

  // Add button: sized to match an InterventionItem row, with the + centered rather than a thin little icon
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

  // ---- Structured list ----
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
              {/* Container: character header (with turn number) + during-action zone — identical structure for every action */}
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

              {/* Outside the container: end-of-action-instant zone — left/right inset matches the container's
              8px padding so item/button widths line up */}
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

  // ---- Right-hand form ----
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

  // ---- Modal title: AV {value} + ✏ edit button; editing mode switches to an input box + ✓ confirm button ----
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
      {/* Action-order row: shows avatars at this AV in action order; the same character acting multiple times shows multiple avatars */}
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
        {/* Left column: list */}
        <div style={{ flex: '0 0 260px' }}>
          {renderList()}
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'var(--mantine-color-dark-4)', margin: '0 16px' }} />

        {/* Right column: form */}
        <div style={{ flex: 1 }}>
          {formOpened && renderForm()}
        </div>
      </div>
    </Modal>
  )
}
