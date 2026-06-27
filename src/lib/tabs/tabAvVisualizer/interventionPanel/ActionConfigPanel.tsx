import { Divider, ScrollArea, SegmentedControl, Select, Stack, Text } from '@mantine/core'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import type { ActionChoice, BattleEntity, InterventionTemplate, TargetType } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useTranslation } from 'react-i18next'

// Icon + color shared with InterventionItem — duplicated here to avoid a circular dependency
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconBolt, IconCircleMinus, IconCirclePlus, IconLayoutGridAdd, IconLayoutGridRemove, IconMinus, IconPlus, IconStar } from '@tabler/icons-react'
import type { InterventionType } from 'lib/tabs/tabAvVisualizer/types'
import type { ComponentType } from 'react'

const TYPE_VISUAL: Record<InterventionType, { icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  spd_up:       { icon: IconArrowUp,          color: 'var(--mantine-color-teal-5)' },
  spd_down:     { icon: IconArrowDown,         color: 'var(--mantine-color-red-5)' },
  av_advance:   { icon: IconArrowLeft,         color: 'var(--mantine-color-blue-5)' },
  av_delay:     { icon: IconArrowRight,        color: 'var(--mantine-color-orange-5)' },
  energy_gain:  { icon: IconPlus,              color: 'var(--mantine-color-yellow-5)' },
  energy_loss:  { icon: IconMinus,             color: 'var(--mantine-color-orange-7)' },
  sp_gain:      { icon: IconCirclePlus,        color: 'var(--mantine-color-cyan-5)' },
  sp_loss:      { icon: IconCircleMinus,       color: 'var(--mantine-color-red-4)' },
  sp_cap_up:    { icon: IconLayoutGridAdd,     color: 'var(--mantine-color-indigo-4)' },
  sp_cap_down:  { icon: IconLayoutGridRemove,  color: 'var(--mantine-color-orange-6)' },
  stat_buff:    { icon: IconStar,              color: 'var(--mantine-color-violet-5)' },
  stat_debuff:  { icon: IconBolt,              color: 'var(--mantine-color-pink-5)' },
}

type ActionConfigPanelProps = {
  characterId: string
  actionIndex: number
  characters: BattleEntity[]
}

export function EffectRow({ template, selfName, resolvedTarget, characters }: {
  template: InterventionTemplate
  selfName: string
  resolvedTarget: string | undefined
  characters: BattleEntity[]
}) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const { icon: Icon, color } = TYPE_VISUAL[template.type]
  const unitStr = template.unit === 'percent' ? '%' : ''
  const durationStr = 'durationTurns' in template && template.durationTurns > 0
    ? ` ×${template.durationTurns}`
    : ''
  const statStr = 'stat' in template ? ` [${template.stat}]` : ''

  function resolveTargetLabel(targetType: TargetType): string {
    switch (targetType) {
      case 'self':        return selfName
      case 'all_allies':  return tAv('TargetType.AllAllies')
      case 'team':        return tAv('TargetType.Team')
      case 'single_ally': return resolvedTarget
        ? (characters.find((c) => c.id === resolvedTarget)?.name ?? resolvedTarget)
        : tAv('TargetType.SingleAlly')
      default:            return targetType
    }
  }

  const label = resolveTargetLabel(template.targets)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        backgroundColor: `${color}26`, border: `1.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={12} color={color} />
      </div>
      <Text size='xs' fw={600} style={{ flexShrink: 0 }}>
        {template.value}{unitStr}{statStr}{durationStr}
      </Text>
      <Text size='xs' c='dimmed' truncate style={{ flex: 1 }}>
        → {label}
      </Text>
    </div>
  )
}

export function ActionConfigPanel({ characterId, actionIndex, characters }: ActionConfigPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const actionOverrides = useAVVisualTabStore((s) => s.savedSession.actionOverrides)
  const override = actionOverrides.find((o) => o.characterId === characterId && o.actionIndex === actionIndex)
  const currentChoice: ActionChoice = override?.choice ?? 'basic'
  const currentTargets = override?.targets ?? []

  const config = getBattleConfig(characterId)
  const selfName = characters.find((c) => c.id === characterId)?.name ?? characterId
  const availableTargets = characters.filter((c) => c.id !== characterId)

  const hasSkill = (config?.abilities.skill.length ?? 0) > 0
  const skillNeedTarget = config?.abilities.skill.some((t) => t.targets === 'single_ally') ?? false
  const effectTemplates: InterventionTemplate[] = config?.abilities[currentChoice] ?? []

  if (!config) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text size='xs' c='dimmed'>{tAv('ActionConfig.NoConfig')}</Text>
      </div>
    )
  }

  function handleChoiceChange(v: string) {
    const choice = v as ActionChoice
    if (choice === 'basic') {
      AvVisualTabController.removeActionOverride(characterId, actionIndex)
    } else {
      AvVisualTabController.setActionOverride({ characterId, actionIndex, choice, targets: currentTargets })
    }
  }

  function handleTargetChange(v: string | null) {
    AvVisualTabController.setActionOverride({
      characterId, actionIndex, choice: 'skill',
      targets: v ? [v] : [],
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ScrollArea type='scroll' scrollbarSize={8} scrollbars='y' style={{ flex: 1 }}>
        <Stack gap='sm'>
          {hasSkill && (
            <>
              <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.ChoiceLabel')}</Text>
              <SegmentedControl
                size='xs'
                value={currentChoice}
                data={[
                  { label: tAv('ActionNode.Basic'), value: 'basic' },
                  { label: tAv('ActionNode.Skill'), value: 'skill' },
                ]}
                onChange={handleChoiceChange}
              />

              {currentChoice === 'skill' && skillNeedTarget && (
                <>
                  <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.Target')}</Text>
                  <Select
                    size='xs'
                    placeholder='—'
                    clearable
                    value={currentTargets[0] ?? null}
                    data={availableTargets.map((t) => ({ value: t.id, label: t.name }))}
                    onChange={handleTargetChange}
                  />
                </>
              )}

              <Divider />
            </>
          )}

          <Text size='xs' fw={600} c='dimmed'>{tAv('ActionConfig.EffectsTitle')}</Text>
          {effectTemplates.length === 0 ? (
            <Text size='xs' c='dimmed'>{tAv('ActionConfig.NoEffects')}</Text>
          ) : (
            effectTemplates.map((t, i) => (
              <EffectRow
                key={i}
                template={t}
                selfName={selfName}
                resolvedTarget={currentTargets[0]}
                characters={characters}
              />
            ))
          )}
        </Stack>
      </ScrollArea>
    </div>
  )
}
