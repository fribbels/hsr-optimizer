import { Stack, Text } from '@mantine/core'
import { EnergyDisplay } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { resolveMaxEnergy } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'
import type { ActiveIntervention, BattleEntity, RightPanelContext } from 'lib/tabs/tabAvVisualizer/types'
import { useTranslation } from 'react-i18next'

type EnergyOverviewPanelProps = {
  characters: BattleEntity[]
  energyAtPlayhead: Map<string, number>
  activeInterventionsAtPlayhead: Map<string, ActiveIntervention[]>
  onContextChange: (ctx: RightPanelContext) => void
}

// Idle-state default for the right panel: a quick read of every slotted character's energy at the
// current Playhead position, instead of leaving the panel empty until the user clicks something.
export function EnergyOverviewPanel({ characters, energyAtPlayhead, activeInterventionsAtPlayhead, onContextChange }: EnergyOverviewPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')

  if (characters.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16 }}>
        <Text size='xs' c='dimmed'>{tAv('Panel.EmptyHint' as never)}</Text>
      </div>
    )
  }

  return (
    <Stack gap={10} style={{ height: '100%', padding: 4 }}>
      {characters.map((character) => {
        const energy = energyAtPlayhead.get(character.id)
        const maxEnergy = resolveMaxEnergy(character.id, character.eidolon)

        return (
          <div key={character.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => onContextChange({ kind: 'character-state', characterId: character.id })}
              style={{ cursor: 'pointer' }}
            >
              <ActionOrderAvatar characterId={character.id} characterName={character.name} color={character.color} size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <EnergyDisplay
                characterId={character.id}
                eidolon={character.eidolon}
                name={character.name}
                energy={energy}
                maxEnergy={maxEnergy}
                color={character.color}
                activeInterventions={activeInterventionsAtPlayhead.get(character.id)}
              />
            </div>
          </div>
        )
      })}
    </Stack>
  )
}
