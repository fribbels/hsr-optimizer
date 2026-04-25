import {
  Button,
  Checkbox,
  Flex,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { CharacterEidolonFormRadio } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import { TeammatesSection } from 'lib/tabs/tabBenchmarks/TeammateCards'
import {
  handleCharacterSelectChange,
} from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import {
  type BenchmarkForm,
  useBenchmarksTabStore,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import {
  useCallback,
  useRef,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'
import type { ReactElement } from 'types/components'
import type { LightConeId } from 'types/lightCone'
import { AUDITOR_SPD_BREAKPOINTS, getErrRopePermutations } from './setAuditorConstants'
import { runAudit } from './setAuditorEngine'
import { SetAuditorSummaryTable } from './SetAuditorSummaryTable'
import type { AuditorConfig, AuditorResults, AuditorSetType, AuditorStatus } from './setAuditorTypes'

const SPD_OPTIONS = AUDITOR_SPD_BREAKPOINTS.map((v) => ({
  value: String(v),
  label: v === 0 ? 'No min' : `SPD ${v}`,
}))

const SET_TYPE_OPTIONS: { value: AuditorSetType, label: string }[] = [
  { value: 'relic4p', label: '4p Relics' },
  { value: 'relic2p2p', label: '2p+2p Relics' },
  { value: 'ornament', label: 'Ornaments' },
]

const MODE_OPTIONS = [
  { value: 'dps', label: 'DPS' },
  { value: 'subDps', label: 'Sub DPS' },
]

const ERR_OPTIONS = [
  { value: 'noErr', label: 'No ERR' },
  { value: 'err', label: 'ERR Rope' },
]

function getCharacterSweepDefaults(characterId: CharacterId) {
  const charMeta = getGameMetadata().characters[characterId]
  const sim = charMeta?.scoringMetadata?.simulation

  const modes: string[] = sim?.deprioritizeBuffs ? ['subDps'] : ['dps']
  const errRope: string[] = sim ? (getErrRopePermutations(sim).length > 1 ? ['noErr', 'err'] : ['noErr']) : ['noErr']

  return { modes, errRope }
}

function CheckboxGroupField(props: {
  label: string
  options: { value: string, label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  disabled: boolean
}) {
  return (
    <Flex direction='column' gap={4}>
      <span style={{ fontSize: 13, opacity: 0.7 }}>{props.label}</span>
      <Checkbox.Group value={props.value} onChange={props.onChange}>
        <Flex gap={12}>
          {props.options.map((opt) => (
            <Checkbox key={opt.value} value={opt.value} label={opt.label} disabled={props.disabled} />
          ))}
        </Flex>
      </Checkbox.Group>
    </Flex>
  )
}

function hasSimulation(characterId: CharacterId | null): boolean {
  if (!characterId) return false
  return !!getGameMetadata().characters[characterId]?.scoringMetadata?.simulation
}

const defaultFormValues: Partial<BenchmarkForm> = {
  characterId: undefined,
  lightCone: undefined,
  characterEidolon: 0,
  lightConeSuperimposition: 1,
  basicSpd: 0,
  errRope: false,
  subDps: false,
}

export function SetBenchmarkAuditor(): ReactElement {
  const form = useForm<BenchmarkForm>({ initialValues: defaultFormValues as BenchmarkForm })

  const [status, setStatus] = useState<AuditorStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [auditResults, setAuditResults] = useState<AuditorResults | null>(null)
  const [startTime, setStartTime] = useState(0)
  const cancelRef = useRef(false)

  const [selectedSpd, setSelectedSpd] = useState<string[]>(AUDITOR_SPD_BREAKPOINTS.filter((v) => v !== 200).map(String))
  const [selectedSetTypes, setSelectedSetTypes] = useState<string[]>(['relic4p', 'ornament'])
  const [selectedModes, setSelectedModes] = useState<string[]>(['dps'])
  const [selectedErr, setSelectedErr] = useState<string[]>(['noErr'])
  const [selectedBenchmarkTargets, setSelectedBenchmarkTargets] = useState<string[]>(['perfection'])

  const characterId = form.values.characterId
  const noSim = characterId != null && !hasSimulation(characterId)

  const onCharacterChange = useCallback((id: CharacterId | null) => {
    if (id) form.setFieldValue('characterId', id)
    handleCharacterSelectChange(id, form)

    if (id && hasSimulation(id)) {
      const defaults = getCharacterSweepDefaults(id)
      setSelectedModes(defaults.modes)
      setSelectedErr(defaults.errRope)

      const gameSimMetadata = getGameMetadata().characters[id].scoringMetadata.simulation!
      const state = useBenchmarksTabStore.getState()
      for (const idx of [0, 1, 2] as const) {
        const tm = gameSimMetadata.teammates[idx]
        state.updateTeammate(idx, tm ? { ...tm, teamRelicSet: undefined, teamOrnamentSet: undefined } : undefined)
      }

      form.setFieldValue('characterEidolon', 0)
      form.setFieldValue('lightConeSuperimposition', 1)
    }
  }, [form])

  const handleRun = useCallback(async () => {
    const formValues = form.getValues()
    if (!formValues.characterId || !formValues.lightCone) return
    if (selectedSpd.length === 0 || selectedSetTypes.length === 0 || selectedModes.length === 0) return

    const storeState = useBenchmarksTabStore.getState()
    const teammates = [storeState.teammate0, storeState.teammate1, storeState.teammate2].map((tm) => ({
      characterId: tm?.characterId!,
      lightCone: tm?.lightCone!,
      characterEidolon: tm?.characterEidolon ?? 0,
      lightConeSuperimposition: tm?.lightConeSuperimposition ?? 1,
    }))

    const config: AuditorConfig = {
      spdBreakpoints: selectedSpd.map(Number),
      setTypes: selectedSetTypes as AuditorSetType[],
      modes: selectedModes as ('dps' | 'subDps')[],
      errRope: selectedErr as ('noErr' | 'err')[],
      lightCone: formValues.lightCone,
      characterEidolon: formValues.characterEidolon ?? 0,
      lightConeSuperimposition: formValues.lightConeSuperimposition ?? 1,
      teammates,
      scoringModes: selectedBenchmarkTargets as ('benchmark' | 'perfection')[],
    }

    cancelRef.current = false
    setStatus('running')
    setAuditResults(null)
    setProgress(0)
    setStartTime(Date.now())

    try {
      const results = await runAudit(
        formValues.characterId,
        config,
        (completed, totalCount) => {
          setProgress(completed)
          setTotal(totalCount)
        },
        cancelRef,
      )

      if (cancelRef.current) {
        setStatus('cancelled')
      } else {
        setAuditResults(results)
        setStatus('complete')
      }
    } catch (e) {
      console.error('Audit failed:', e)
      setStatus('idle')
    }
  }, [form, selectedSpd, selectedSetTypes, selectedModes, selectedErr, selectedBenchmarkTargets])

  const handleCancel = useCallback(() => {
    cancelRef.current = true
  }, [])

  const elapsed = status === 'running' ? (Date.now() - startTime) / 1000 : 0
  const rate = progress > 0 ? elapsed / progress : 0
  const remaining = rate > 0 ? Math.round((total - progress) * rate) : 0
  const remainingMin = Math.floor(remaining / 60)
  const remainingSec = remaining % 60
  const isRunning = status === 'running'

  const summaries = auditResults?.summaries ?? []

  return (
    <Flex direction='column' gap={16} style={{ padding: 16 }}>
      {/* Character / LC / Teammates — reusing benchmarks tab layout */}
      <Flex gap={24} align='flex-start' wrap='wrap'>
        <Flex direction='column' gap={8} style={{ width: 250 }}>
          <CharacterSelect
            value={form.values.characterId}
            onChange={onCharacterChange}
            showIcon={false}
            clearable={false}
            withSimulation
          />
          <CharacterEidolonFormRadio form={form} />

          <LightConeSelect
            value={form.values.lightCone}
            characterId={characterId}
            onChange={(id: LightConeId | null) => { if (id) form.setFieldValue('lightCone', id) }}
            clearable={false}
          />
          <LightConeSuperimpositionFormRadio form={form} />

          <TeammatesSection />
        </Flex>

        <Flex direction='column' gap={12}>
          <CheckboxGroupField label='Set Types' options={SET_TYPE_OPTIONS} value={selectedSetTypes} onChange={setSelectedSetTypes} disabled={isRunning} />
          <CheckboxGroupField label='SPD Breakpoints' options={SPD_OPTIONS} value={selectedSpd} onChange={setSelectedSpd} disabled={isRunning} />
          <CheckboxGroupField label='Mode' options={MODE_OPTIONS} value={selectedModes} onChange={setSelectedModes} disabled={isRunning} />
          <CheckboxGroupField label='ERR Rope' options={ERR_OPTIONS} value={selectedErr} onChange={setSelectedErr} disabled={isRunning} />
          <CheckboxGroupField
            label='Benchmark target'
            options={[{ value: 'benchmark', label: '100%' }, { value: 'perfection', label: '200%' }]}
            value={selectedBenchmarkTargets}
            onChange={setSelectedBenchmarkTargets}
            disabled={isRunning}
          />

          {noSim && (
            <span style={{ fontSize: 14, color: '#ff6b6b' }}>This character has no DPS score simulation metadata.</span>
          )}

          <Flex gap={12} align='center'>
            {isRunning
              ? <Button color='red' onClick={handleCancel}>Cancel</Button>
              : (
                <Button
                  onClick={handleRun}
                  disabled={!characterId || !form.values.lightCone || noSim || selectedSetTypes.length === 0 || selectedSpd.length === 0 || selectedModes.length === 0 || selectedBenchmarkTargets.length === 0}
                >
                  Run Audit
                </Button>
              )}

            {isRunning && (
              <Flex gap={8} style={{ fontSize: 14, opacity: 0.8 }}>
                <span>Completed {progress.toLocaleString()} / {total.toLocaleString()} benchmarks</span>
                {progress > 0 && (
                  <span>— ~{remainingMin > 0 ? `${remainingMin}m ` : ''}{remainingSec}s remaining</span>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>

      {status === 'cancelled' && (
        <span style={{ fontSize: 14, color: '#ff6b6b' }}>Audit cancelled.</span>
      )}

      {status === 'complete' && summaries.length > 0 && auditResults && (
        <Flex direction='column' gap={8}>
          <Flex gap={16} style={{ fontSize: 14 }}>
            <span>🔴 Red: {summaries.filter((s) => s.flag === 'red').length} sets (≥ matched)</span>
            <span>🟡 Yellow: {summaries.filter((s) => s.flag === 'yellow').length} sets (within 2%)</span>
          </Flex>
          <span style={{ fontSize: 12, opacity: 0.5 }}>
            Note: Relics and ornaments are swept independently. Relic-ornament synergies may not be caught.
          </span>
          <SetAuditorSummaryTable
            summaries={summaries}
            relicReferenceLabel={auditResults.relicReferenceLabel}
            ornamentReferenceLabel={auditResults.ornamentReferenceLabel}
          />
        </Flex>
      )}
    </Flex>
  )
}
