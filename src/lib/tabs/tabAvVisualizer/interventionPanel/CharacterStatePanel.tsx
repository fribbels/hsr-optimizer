import { ActionIcon, Divider, Popover, Stack, Text } from '@mantine/core'
import { IconDotsVertical } from '@tabler/icons-react'
import i18next from 'i18next'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { formatAvNumber } from 'lib/tabs/tabAvVisualizer/format'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { EnergyDisplay } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { resolveMaxEnergy } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'
import type { ActiveIntervention, BattleEntity } from 'lib/tabs/tabAvVisualizer/types'
import { isFlat } from 'lib/utils/statUtils'
import { Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

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

// The 6 stats shown inline, between the avatar header and Energy. SPD is already shown in the header,
// but repeating it here keeps this row self-contained and consistently ordered.
const MAIN_STATS = [Stats.HP, Stats.ATK, Stats.DEF, Stats.CR, Stats.CD, Stats.SPD]

// Everything else worth showing in the "more" popover — main stats are repeated here too so the popover
// is a complete reference on its own, not just the leftovers.
const FULL_STATS = [
  Stats.HP, Stats.ATK, Stats.DEF, Stats.SPD, Stats.CR, Stats.CD,
  Stats.BE, Stats.ERR, Stats.EHR, Stats.RES, Stats.OHB,
]

function formatStatValue(stat: string, value: number): string {
  return isFlat(stat) ? formatAvNumber(value) : `${formatAvNumber(value * 100)}%`
}

export function CharacterStatePanel({ characterId, characters, energy, activeInterventions }: CharacterStatePanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ShortStats' })
  const character = characters.find((c) => c.id === characterId)
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore(useShallow((s) => s.relicsById))

  const fullStats = useMemo(() => {
    const fullCharacter = charactersById[characterId as CharacterId]
    if (fullCharacter) {
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, fullCharacter, relicsById, null)
      return getShowcaseStats(fullCharacter, displayRelics, null)
    }

    // No real, independently-buildable character for this id (e.g. a memosprite like Mimi, who has no
    // gear of her own) — derive her stats from her owner's real build instead. Every stat except HP and
    // SPD just mirrors the owner's value directly; only HP needs CharacterBattleConfig.companion's own
    // formula (it isn't simply "owner's HP × ratio" — the owner's % HP bonus has to be re-applied against
    // the companion's own, smaller base, see hpInheritance's doc comment).
    const ownerId = character?.ownerId
    const ownerCharacter = ownerId ? charactersById[ownerId as CharacterId] : undefined
    if (!ownerId || !ownerCharacter) return null

    const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, ownerCharacter, relicsById, null)
    const ownerStats = getShowcaseStats(ownerCharacter, displayRelics, null)
    const hpInheritance = getBattleConfig(ownerId)?.companion?.hpInheritance
    if (!hpInheritance) return { ...ownerStats, [Stats.SPD]: character?.spd ?? ownerStats[Stats.SPD] }

    const ownerWhiteHp = generateContext(normalizeForm(ownerCharacter.form)).baseHP
    const ownerHpPercent = ownerStats[Stats.HP_P] ?? 0
    const ownerFlatHp = (ownerStats[Stats.HP] ?? 0) - ownerWhiteHp * (1 + ownerHpPercent)
    const companionWhiteHp = ownerWhiteHp * hpInheritance.whiteRatio
    const companionHp = companionWhiteHp * (1 + ownerHpPercent) + ownerFlatHp + hpInheritance.flatBonus

    return { ...ownerStats, [Stats.HP]: companionHp, [Stats.SPD]: character?.spd ?? 0 }
  }, [characterId, character, charactersById, relicsById])

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
        <Stack gap={2} style={{ flex: 1 }}>
          <Text size='sm' fw={700} style={{ color: character.color }}>{character.name}</Text>
          <Text size='xs' c='dimmed'>{tAv('CharacterState.SpeedLabel', { value: character.spd.toFixed(1) })}</Text>
        </Stack>
        {fullStats && (
          <Popover width={200} position='left-start' withArrow shadow='md'>
            <Popover.Target>
              <ActionIcon variant='subtle' color='gray' size='sm'>
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap={4}>
                {FULL_STATS.map((stat) => (
                  <div key={stat} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text size='xs' c='dimmed'>{tCommon(stat as never)}</Text>
                    <Text size='xs'>{formatStatValue(stat, fullStats[stat] ?? 0)}</Text>
                  </div>
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>

      {/* Main stats: HP / ATK / DEF / CR / CD / SPD */}
      {fullStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {MAIN_STATS.map((stat) => (
            <div key={stat} style={{ display: 'flex', flexDirection: 'column' }}>
              <Text size='10px' c='dimmed'>{tCommon(stat as never)}</Text>
              <Text size='xs'>{formatStatValue(stat, fullStats[stat] ?? 0)}</Text>
            </div>
          ))}
        </div>
      )}

      <Divider />

      {/* Energy */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Energy</Text>
        <EnergyDisplay
          characterId={characterId}
          eidolon={character?.eidolon}
          energy={energy}
          maxEnergy={resolveMaxEnergy(characterId, character?.eidolon)}
          color={character?.color ?? 'var(--mantine-color-blue-5)'}
          activeInterventions={activeInterventions}
        />
      </Stack>

      <Divider />

      {/* Buffs */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Buffs</Text>
        {(!activeInterventions || activeInterventions.length === 0) ? (
          <Text size='xs' c='dimmed'>{tAv('CharacterState.NoBuffs')}</Text>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 6, rowGap: 2, alignItems: 'center' }}>
            {activeInterventions.map((b) => {
              const hasName = b.effectId && i18next.exists(`avVisualizerTab:BuffNames.${b.effectId}`)
              const name = hasName
                ? tAv(`BuffNames.${b.effectId}` as never)
                : (BUFF_TYPE_KEY[b.type] ? tAv(BUFF_TYPE_KEY[b.type] as never) : b.type)

              // spd_up/spd_down carry no `stat` field (only stat_buff/debuff do) — imply SPD for display
              // so the effect column doesn't just show a bare percentage with no indication of what it is.
              const statKey = b.stat ?? ((b.type === 'spd_up' || b.type === 'spd_down') ? Stats.SPD : null)
              // Some battleConfigs use optimizer-internal "extended" StatKey strings (BOOST etc.) that
              // aren't real Stats enum members and have no common:ShortStats entry — check the AV
              // Visualizer's own EffectStatNames table for those first.
              // Some ShortStats labels (e.g. ATK% → "攻击力%") already carry a trailing '%' baked into the
              // substat name itself — strip it so it doesn't end up sandwiched between the number and the
              // unit suffix. The '%' for percent-unit effects always goes right after the number instead.
              const statLabel = statKey
                ? (i18next.exists(`avVisualizerTab:EffectStatNames.${statKey}`)
                    ? String(tAv(`EffectStatNames.${statKey}` as never))
                    : String(tCommon(statKey as never)).replace(/%$/, ''))
                : null
              const percentSuffix = b.unit === 'percent' ? '%' : ''
              // value === 0 means there's nothing to describe (e.g. Huohuo's Rangming is a pure marker
              // buff) — leave the column blank rather than a placeholder dash.
              const effect = b.value === 0
                ? ''
                : `${b.value > 0 ? '+' : ''}${b.value}${percentSuffix}${statLabel ? ` ${statLabel}` : ''}`

              const auraMarker = b.buffKind === 'aura' ? ' ◈' : ''
              const isPositive = b.type === 'spd_up' || b.type === 'stat_buff'
              // Aura buffs mirrored onto this character from another character's cast (see
              // applyIntervention's aura registration) tick on the *source's* turns, not this
              // character's — their remainingTurns here isn't meaningful, so it's hidden.
              const isMirroredAura = b.buffKind === 'aura' && b.sourceCharacterId !== characterId
              return (
                <Fragment key={b.id}>
                  <Text size='xs' truncate style={{ color: isPositive ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-red-5)' }}>
                    {name}{auraMarker}
                  </Text>
                  <Text size='xs' c='dimmed'>{effect}</Text>
                  <Text size='xs' c='dimmed'>
                    {b.stacks !== undefined
                      ? `x${b.stacks}`
                      : (isMirroredAura || !Number.isFinite(b.remainingTurns)) ? '' : `${b.remainingTurns}T`}
                  </Text>
                </Fragment>
              )
            })}
          </div>
        )}
      </Stack>
    </div>
  )
}
