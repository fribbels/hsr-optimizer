import { Button, Select, Text } from '@mantine/core'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { EnergyDisplay } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { resolveMaxEnergy } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'
import type { ActiveIntervention, BattleEntity, UltTiming } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type UltCasterPanelProps = {
  timing: UltTiming
  insertAfterId?: string
  insertBeforeUltId?: string
  afterItemId?: string
  characters: BattleEntity[]
  energyAtPlayhead: Map<string, number>
  activeInterventionsAtPlayhead: Map<string, ActiveIntervention[]>
  onDone: () => void
}

export function UltCasterPanel({ timing, insertAfterId, insertBeforeUltId, afterItemId, characters, energyAtPlayhead, activeInterventionsAtPlayhead, onDone }: UltCasterPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [selectedCasterId, setSelectedCasterId] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  // Mimi (and any other companion without an ultimate of her own) has no abilities.ult — her energy
  // only ever drives her own skill logic, so she can't be picked as an ult caster here. Dynamic
  // (AbilityResolver) ults aren't expected currently, but Array.isArray guards against treating one's
  // function arity as a template count if that ever changes.
  const casterInfo = characters
    .filter((char) => {
      const ult = getBattleConfig(char.id, char.eidolon)?.abilities.ult
      return Array.isArray(ult) && ult.length > 0
    })
    .map((char) => {
      const config     = getBattleConfig(char.id, char.eidolon)
      const maxSp      = resolveMaxEnergy(char.id, char.eidolon)
      const threshold  = config?.ultThreshold ?? maxSp
      // Mirrors simulateBattle's own initial-energy baseline: 50% of what's needed to cast Ult, not 50%
      // of maxSp itself (those differ for an overflow-style cap like Saber's).
      const energy     = energyAtPlayhead.get(char.id) ?? threshold * 0.5
      const canCast    = energy >= threshold
      const ultTemplates = Array.isArray(config?.abilities.ult) ? config.abilities.ult : []
      const needTarget = ultTemplates.some((t) => 'targets' in t && t.targets === 'single_ally')
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
      afterItemId,
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
              <div style={{ width: '100%' }}>
                <EnergyDisplay
                  characterId={char.id}
                  eidolon={char.eidolon}
                  energy={energy}
                  maxEnergy={threshold}
                  color={char.color}
                  activeInterventions={activeInterventionsAtPlayhead.get(char.id)}
                />
              </div>
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
