import { Button, MultiSelect, NumberInput, ScrollArea, SegmentedControl, Stack, Text } from '@mantine/core'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import type { EditRequest, InterventionType, InterventionUnit } from 'lib/tabs/tabAvVisualizer/types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type EditPanelProps = {
  request: EditRequest | null
  playheadAv: number
  characters: Array<{ id: string; name: string; color: string }>
  onDone: () => void   // Called after submit or cancel, so the parent can clear the request
}

// Always-mounted panel that shows the add/edit form when a request comes in from ActionDisplayPanel, and goes
// back to an idle/empty state once submitted or cancelled. Replaces the right half of the old
// InterventionListPanel modal.
export function EditPanel({ request, playheadAv, characters, onDone }: EditPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')

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

  const [formType, setFormType] = useState<InterventionType>('spd_up')
  const [formTargets, setFormTargets] = useState<string[]>([])
  const [formValue, setFormValue] = useState(0)
  const [formUnit, setFormUnit] = useState<InterventionUnit>('flat')
  const [formDuration, setFormDuration] = useState(1)

  // (Re)initialize the form fields whenever a new request comes in
  useEffect(() => {
    if (!request) return
    if (request.mode === 'edit') {
      const iv = request.intervention
      setFormType(iv.type)
      setFormTargets([...iv.targets])
      setFormValue(iv.value)
      setFormUnit(iv.unit)
      setFormDuration(iv.durationTurns)
    } else {
      setFormType('spd_up')
      setFormTargets([])
      setFormValue(0)
      setFormUnit('flat')
      setFormDuration(1)
    }
  }, [request])

  if (!request) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 16,
      }}>
        <Text size='xs' c='dimmed'>{tAv('Panel.EmptyHint')}</Text>
      </div>
    )
  }

  const isAvType = formType === 'av_advance' || formType === 'av_delay'
  const targetOptions = characters.map((c) => ({ label: c.name, value: c.id }))

  function handleTypeChange(newType: string) {
    setFormType(newType as InterventionType)
    const nowAvType = newType === 'av_advance' || newType === 'av_delay'
    if (nowAvType) setFormDuration(0)
    else if (formDuration === 0) setFormDuration(1)
  }

  // Re-bind into a fresh const so TS narrows out `null` inside the nested functions below (narrowing on the
  // destructured prop itself doesn't propagate into closures defined after the early-return guard)
  const req = request

  function handleSubmit() {
    if (formTargets.length === 0 || formValue <= 0) return
    const durationTurns = isAvType ? 0 : formDuration
    if (req.mode === 'edit') {
      AvVisualTabController.updateIntervention(req.intervention.id, {
        type: formType, targets: formTargets, value: formValue, unit: formUnit, durationTurns,
      })
    } else {
      AvVisualTabController.addIntervention({
        triggerAv: playheadAv,
        afterCharId: req.afterCharId,
        afterActionIndex: req.afterActionIndex,
        beforeCharId: req.beforeCharId,
        beforeActionIndex: req.beforeActionIndex,
        type: formType, targets: formTargets, value: formValue, unit: formUnit, durationTurns,
      })
    }
    onDone()
  }

  function getFormTitle(): string {
    if (req.mode === 'edit') return tAv('Panel.FormTitleEdit')
    if (req.afterCharId) {
      const name = characters.find((c) => c.id === req.afterCharId)?.name ?? req.afterCharId
      const turnSuffix = req.afterActionIndex !== undefined && req.afterActionIndex > 0
        ? tAv('TurnSuffix', { n: req.afterActionIndex + 1 })
        : ''
      return tAv('Panel.FormTitleAfter', { name, turnSuffix })
    }
    if (req.beforeCharId) {
      const name = characters.find((c) => c.id === req.beforeCharId)?.name ?? req.beforeCharId
      const turnSuffix = req.beforeActionIndex !== undefined && req.beforeActionIndex > 0
        ? tAv('TurnSuffix', { n: req.beforeActionIndex + 1 })
        : ''
      return tAv('Panel.FormTitleBefore', { name, turnSuffix })
    }
    return tAv('Panel.FormTitleFlat', { av: playheadAv.toFixed(1) })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Fields scroll; the Cancel/Save row below stays fixed so it's always reachable without scrolling */}
      <ScrollArea type='scroll' scrollbarSize={8} scrollbars='y' style={{ flex: 1 }}>
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
        </Stack>
      </ScrollArea>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <Button variant='default' size='xs' onClick={onDone}>{tAv('Panel.Cancel')}</Button>
        <Button size='xs' onClick={handleSubmit} disabled={formTargets.length === 0 || formValue <= 0}>
          {request.mode === 'edit' ? tAv('Panel.Save') : tAv('Panel.Add')}
        </Button>
      </div>
    </div>
  )
}
