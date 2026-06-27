import { Divider, Stack, Text } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import type { ActiveIntervention, BattleEntity } from 'lib/tabs/tabAvVisualizer/types'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'

type CharacterStatePanelProps = {
  characterId: string
  characters: BattleEntity[]
  energy?: number   // undefined = no BattleEvent at or before playhead for this character
  activeInterventions?: ActiveIntervention[]
}

const BUFF_TYPE_KEY: Partial<Record<string, string>> = {
  spd_up:      'Types.SpdUp',
  spd_down:    'Types.SpdDown',
  stat_buff:   'Types.StatBuff',
  stat_debuff: 'Types.StatDebuff',
}

export function CharacterStatePanel({ characterId, characters, energy, activeInterventions }: CharacterStatePanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const character = characters.find((c) => c.id === characterId)

  if (!character) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text size='xs' c='dimmed'>—</Text>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      {/* Header: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ActionOrderAvatar
          characterId={character.id}
          characterName={character.name}
          color={character.color}
          size={40}
        />
        <Stack gap={2}>
          <Text size='sm' fw={700} style={{ color: character.color }}>{character.name}</Text>
          <Text size='xs' c='dimmed'>{tAv('CharacterState.SpeedLabel', { value: character.spd.toFixed(1) })}</Text>
        </Stack>
      </div>

      <Divider />

      {/* Energy */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Energy</Text>
        {energy !== undefined ? (() => {
          const maxEnergy = getGameMetadata().characters?.[characterId as CharacterId]?.max_sp ?? 100
          return <Text size='xs'>{energy.toFixed(0)} / {maxEnergy}</Text>
        })() : (
          <Text size='xs' c='dimmed'>—</Text>
        )}
      </Stack>

      <Divider />

      {/* Buffs */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Buffs</Text>
        {(!activeInterventions || activeInterventions.length === 0) ? (
          <Text size='xs' c='dimmed'>{tAv('CharacterState.NoBuffs')}</Text>
        ) : (
          <Stack gap={2}>
            {activeInterventions.map((b) => {
              const typeLabel = BUFF_TYPE_KEY[b.type] ? tAv(BUFF_TYPE_KEY[b.type] as never) : b.type
              const auraMarker = b.buffKind === 'aura' ? ' ◈' : ''
              const isPositive = b.type === 'spd_up' || b.type === 'stat_buff'
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text size='xs' style={{ color: isPositive ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-red-5)' }}>
                    {typeLabel}{auraMarker}
                  </Text>
                  <Text size='xs' c='dimmed'>{b.remainingTurns}T</Text>
                </div>
              )
            })}
          </Stack>
        )}
      </Stack>
    </div>
  )
}
