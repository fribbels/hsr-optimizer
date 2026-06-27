import { ScrollArea, Stack, Text } from '@mantine/core'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { EffectRow } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionConfigPanel'
import type { BattleEntity } from 'lib/tabs/tabAvVisualizer/types'
import { useTranslation } from 'react-i18next'

type UltEffectsPanelProps = {
  casterId: string
  targets?: string[]
  characters: BattleEntity[]
}

export function UltEffectsPanel({ casterId, targets, characters }: UltEffectsPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const config = getBattleConfig(casterId)
  const selfName = characters.find((c) => c.id === casterId)?.name ?? casterId

  if (!config) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text size='xs' c='dimmed'>{tAv('ActionConfig.NoConfig')}</Text>
      </div>
    )
  }

  const ultTemplates = config.abilities.ult

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ScrollArea type='scroll' scrollbarSize={8} scrollbars='y' style={{ flex: 1 }}>
        <Stack gap='sm'>
          <Text size='xs' fw={600} c='dimmed'>{tAv('ActionConfig.EffectsTitle')}</Text>
          {ultTemplates.length === 0 ? (
            <Text size='xs' c='dimmed'>{tAv('ActionConfig.NoEffects')}</Text>
          ) : (
            ultTemplates.map((t, i) => (
              <EffectRow
                key={i}
                template={t}
                selfName={selfName}
                resolvedTarget={targets?.[0]}
                characters={characters}
              />
            ))
          )}
        </Stack>
      </ScrollArea>
    </div>
  )
}
