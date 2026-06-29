import { Divider, ScrollArea, SegmentedControl, Select, Stack, Text } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import type { ActionChoice, BattleEntity, CharacterBattleState, InterventionTemplate, TargetType } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'

// Icon + color shared with InterventionItem — duplicated here to avoid a circular dependency
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconBolt, IconCircleMinus, IconCirclePlus, IconLayoutGridAdd, IconLayoutGridRemove, IconMinus, IconPlus, IconStar, IconTrendingUp, IconUserPlus, IconX } from '@tabler/icons-react'
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
  summon_companion: { icon: IconUserPlus,      color: 'var(--mantine-color-grape-5)' },
  energy_set_minimum: { icon: IconTrendingUp,  color: 'var(--mantine-color-yellow-7)' },
  clear_buff:   { icon: IconX,                 color: 'var(--mantine-color-gray-5)' },
}

type ActionConfigPanelProps = {
  characterId: string
  actionIndex: number
  characters: BattleEntity[]
  hitCount?: number   // the resolved hitCount of this specific past action, used to detect a matched basicVariants entry
  // This character's own energy/buffs right before this specific action — lets a dynamic (AbilityResolver)
  // ability be actually called (instead of just statically previewed) to show what it would really do at
  // this exact point in the timeline. Undefined if the caller has no snapshot for this action (e.g. no
  // simulation has run yet) — effects then fall back to a "depends on live state" message for those.
  stateSnapshot?: CharacterBattleState
}

export function EffectRow({ template, selfName, resolvedTarget, characters }: {
  template: InterventionTemplate
  selfName: string
  resolvedTarget: string | undefined
  characters: BattleEntity[]
}) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const { icon: Icon, color } = TYPE_VISUAL[template.type]

  // summon_companion has no targets/value/unit of its own — it's a standalone "spawn the companion if
  // not already present" marker, not a numeric effect applied to a resolved target.
  if (template.type === 'summon_companion') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          backgroundColor: `${color}26`, border: `1.5px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={12} color={color} />
        </div>
        <Text size='xs' fw={600}>{tAv('ActionConfig.SummonCompanion')}</Text>
      </div>
    )
  }

  // energy_set_minimum has no unit/duration/stat of its own — a standalone "raise energy to at least X"
  // floor, not a relative +/- effect applied to a resolved target's value.
  if (template.type === 'energy_set_minimum') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          backgroundColor: `${color}26`, border: `1.5px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={12} color={color} />
        </div>
        <Text size='xs' fw={600}>{tAv('ActionConfig.EnergySetMinimum', { value: template.value })}</Text>
      </div>
    )
  }

  // clear_buff has no targets/value/unit of its own — a standalone "remove this buff entirely" marker.
  if (template.type === 'clear_buff') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          backgroundColor: `${color}26`, border: `1.5px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={12} color={color} />
        </div>
        <Text size='xs' fw={600}>{tAv('ActionConfig.ClearBuff', { effectId: template.effectId })}</Text>
      </div>
    )
  }

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
      case 'single_ally':
      case 'single_ally_or_self': return resolvedTarget
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

export function ActionConfigPanel({ characterId, actionIndex, characters, hitCount, stateSnapshot }: ActionConfigPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const actionOverrides = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].actionOverrides)
  const override = actionOverrides.find((o) => o.characterId === characterId && o.actionIndex === actionIndex)

  const config = getBattleConfig(characterId)
  const selfName = characters.find((c) => c.id === characterId)?.name ?? characterId
  const maxEnergy = config?.customMaxEnergy ?? (getGameMetadata().characters?.[characterId as CharacterId]?.max_sp ?? 100)

  // Forces the choice selector to a single option (no free choice at all) given this character's own live
  // state — e.g. Gilgamesh: locked to Basic before Interest Piqued, locked to Skill for good once gained.
  // Distinct from lockedToBasicVariant below (which only ever locks *out* Skill while Basic itself
  // becomes an enhanced variant) — a character with no special Basic variant who simply can't choose one
  // of the two some of the time. Only enforced when stateSnapshot is actually known.
  const lockedChoice = config?.actionLock?.({
    energy: stateSnapshot?.energy ?? 0,
    maxEnergy,
    activeInterventions: stateSnapshot?.activeInterventions ?? [],
  })
  const currentChoice: ActionChoice = lockedChoice ?? override?.choice ?? 'basic'
  const currentTargets = override?.targets ?? []

  // Dynamic (AbilityResolver) abilities depend on live state at cast time (e.g. Saber's skill) — there's
  // no meaningful static preview for those here, so they read as "no statically-known effects" rather
  // than guessing at a context. Static template-array abilities (the common case) display as normal.
  // hasSkill only needs to know whether a skill *exists at all* — a function counts (e.g. Saber), not
  // just a non-empty array — separate from skillTemplates below, which is purely for the static target
  // preview and intentionally stays empty for a dynamic ability.
  const skillAbility = config?.abilities.skill
  const hasSkill = skillAbility !== undefined && (Array.isArray(skillAbility) ? skillAbility.length > 0 : true)
  // While the caster currently holds a basicVariants-gating buff (e.g. Saber's Ult-granted enhanced-basic
  // marker), the kit only allows the enhanced Basic next — Skill isn't selectable at all. Only enforced
  // when stateSnapshot is actually known (no simulation run yet -> don't guess, fall back to the normal
  // two-option control).
  const lockedToBasicVariant = !!config?.basicVariants?.some((v) =>
    stateSnapshot?.activeInterventions?.some((b) => b.effectId === v.requiresEffectId))
  const skillTemplates = Array.isArray(skillAbility) ? skillAbility : []
  const skillTargetIncludesSelf = skillTemplates.some((t) => 'targets' in t && t.targets === 'single_ally_or_self')
  const skillNeedTarget = skillTargetIncludesSelf
    || skillTemplates.some((t) => 'targets' in t && t.targets === 'single_ally')
  const availableTargets = skillTargetIncludesSelf
    ? characters
    : characters.filter((c) => c.id !== characterId)
  // basicVariants (e.g. Trailblazer-Remembrance's 史诗-enhanced basic, Saber's Ult-granted enhanced
  // basic) replace the base basic's effects while the caster actually held the gating buff right before
  // this action. Checked directly against the held buff (not hitCount, see ActionDisplayPanel's own
  // isEnhancedBasic for the same fix) — a variant's hitCount can equal the base one (e.g. Saber: both
  // are 1-hit), in which case comparing hitCount alone can't tell them apart at all.
  const matchedVariant = currentChoice === 'basic'
    ? config?.basicVariants?.find((v) =>
        stateSnapshot?.activeInterventions?.some((b) => b.effectId === v.requiresEffectId))
    : undefined
  const currentChoiceAbility = config?.abilities[currentChoice]
  // A dynamic (AbilityResolver) ability has no fixed effect list — but if we know this character's own
  // energy/buffs right before this specific action (stateSnapshot), we can actually call it and show
  // what it would really do at this exact point, instead of a static (and for Saber's skill, always
  // empty) preview. maxEnergy (computed above, also used by actionLock) mirrors UltCasterPanel's own
  // lookup (customMaxEnergy, falling back to game_data's max_sp).
  const resolved = (typeof currentChoiceAbility === 'function' && stateSnapshot)
    ? currentChoiceAbility({ energy: stateSnapshot.energy, maxEnergy, activeInterventions: stateSnapshot.activeInterventions ?? [] })
    : undefined
  // Dynamic but no snapshot available (e.g. no simulation has run yet) — distinct from "really has no
  // effects", surfaced separately below instead of silently reading as NoEffects.
  const isDynamicWithoutSnapshot = typeof currentChoiceAbility === 'function' && !stateSnapshot
  const effectTemplates: InterventionTemplate[] = matchedVariant?.templates
    ?? resolved?.templates
    ?? (Array.isArray(currentChoiceAbility) ? currentChoiceAbility : [])
  const afterEffectTemplates: InterventionTemplate[] = matchedVariant ? [] : (resolved?.afterEffects ?? [])

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
          {hasSkill && lockedToBasicVariant && (
            <>
              <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.ChoiceLabel')}</Text>
              <Text size='xs' fw={600}>{tAv('ActionNode.BasicEnhanced')}</Text>
              <Divider />
            </>
          )}

          {hasSkill && !lockedToBasicVariant && lockedChoice && (
            <>
              <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.ChoiceLabel')}</Text>
              <Text size='xs' fw={600}>{lockedChoice === 'skill' ? tAv('ActionNode.Skill') : tAv('ActionNode.Basic')}</Text>
              <Divider />
            </>
          )}

          {hasSkill && !lockedToBasicVariant && !lockedChoice && (
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
          {isDynamicWithoutSnapshot ? (
            <Text size='xs' c='dimmed'>{tAv('ActionConfig.DynamicNoSnapshot')}</Text>
          ) : effectTemplates.length === 0 ? (
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

          {afterEffectTemplates.length > 0 && (
            <>
              <Divider />
              <Text size='xs' fw={600} c='dimmed'>{tAv('ActionConfig.AfterEffectsTitle')}</Text>
              {afterEffectTemplates.map((t, i) => (
                <EffectRow
                  key={i}
                  template={t}
                  selfName={selfName}
                  resolvedTarget={currentTargets[0]}
                  characters={characters}
                />
              ))}
            </>
          )}
        </Stack>
      </ScrollArea>
    </div>
  )
}
