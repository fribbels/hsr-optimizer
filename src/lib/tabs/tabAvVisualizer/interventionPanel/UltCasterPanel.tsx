import { Button, Select, Text } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import type { BattleEntity, UltTiming } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'

type UltCasterPanelProps = {
  timing: UltTiming
  insertAfterId?: string
  insertBeforeUltId?: string
  characters: BattleEntity[]
  energyAtPlayhead: Map<string, number>
  onDone: () => void
}

export function UltCasterPanel({ timing, insertAfterId, insertBeforeUltId, characters, energyAtPlayhead, onDone }: UltCasterPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [selectedCasterId, setSelectedCasterId] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  const casterInfo = characters.map((char) => {
    const maxSp      = getGameMetadata().characters?.[char.id as CharacterId]?.max_sp ?? 100
    const config     = getBattleConfig(char.id)
    const threshold  = config?.ultThreshold ?? maxSp
    const energy     = energyAtPlayhead.get(char.id) ?? maxSp * 0.5
    const canCast    = energy >= threshold
    const needTarget = config?.abilities.ult.some((t) => t.targets === 'single_ally') ?? false
    return { char, maxSp, threshold, energy, canCast, needTarget }
  })

  const selected = casterInfo.find((c) => c.char.id === selectedCasterId)
  const availableTargets = selected
    ? characters.filter((c) => c.id !== selectedCasterId)
    : []

  function handleInsert() {
    if (!selectedCasterId) return
    AvVisualTabController.addUltInsertion({
      casterId: selectedCasterId,
      timing,
      targets: selected?.needTarget && selectedTarget ? [selectedTarget] : undefined,
    }, insertAfterId, insertBeforeUltId)
    onDone()
  }

  const insertDisabled = !selectedCasterId
    || !!(selected?.needTarget && !selectedTarget)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      <Text size='xs' fw={600} c='dimmed'>{tAv('UltCaster.Title')}</Text>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {casterInfo.map(({ char, energy, threshold, canCast }) => {
          const isSelected = selectedCasterId === char.id
          return (
            <div
              key={char.id}
              onClick={() => { if (canCast) setSelectedCasterId(char.id) }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                borderRadius: 6,
                cursor: canCast ? 'pointer' : 'default',
                opacity: canCast ? 1 : 0.4,
                border: `1.5px solid ${isSelected ? char.color : 'var(--mantine-color-dark-4)'}`,
                background: isSelected ? `${char.color}1a` : 'transparent',
              }}
            >
              <ActionOrderAvatar characterId={char.id} characterName={char.name} color={char.color} size={32} />
              <Text size='xs' fw={600} style={{ color: char.color }}>{char.name}</Text>
              <Text size='xs' c={canCast ? 'dimmed' : 'red'}>
                {canCast
                  ? tAv('UltCaster.EnergyStatus', { energy: energy.toFixed(0), threshold })
                  : tAv('UltCaster.EnergyInsufficient')}
              </Text>
            </div>
          )
        })}
      </div>

      {selected?.needTarget && (
        <Select
          label={tAv('UltCaster.NeedTarget')}
          size='xs'
          placeholder='—'
          clearable
          value={selectedTarget}
          data={availableTargets.map((c) => ({ value: c.id, label: c.name }))}
          onChange={setSelectedTarget}
        />
      )}

      <div style={{ marginTop: 'auto' }}>
        <Button size='xs' fullWidth disabled={insertDisabled} onClick={handleInsert}>
          {tAv('UltCaster.Confirm')}
        </Button>
      </div>
    </div>
  )
}
