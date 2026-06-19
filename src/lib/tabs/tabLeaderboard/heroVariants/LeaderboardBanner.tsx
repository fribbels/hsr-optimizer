import { Flex } from '@mantine/core'
import { IconRosette } from '@tabler/icons-react'
import chroma from 'chroma-js'
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { DEFAULT_SHOWCASE_COLOR } from 'lib/characterPreview/color/showcaseColorService'
import {
  computeTierColors,
  ROLL_WIDTH_RATIOS,
  type TierColors,
} from 'lib/characterPreview/scoring/substatRollColors'
import {
  type AggregatedStatRolls,
  aggregateSubstatRolls,
} from 'lib/characterPreview/scoring/substatRollsAggregator'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import type { Sets } from 'lib/constants/constants'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { LightConeId } from 'types/lightCone'
import type {
  LeaderboardEntry,
  LeaderboardTeammate,
} from '../leaderboardTabTypes'
import { HeroScoreRuler } from '../rulerVariants/HeroScoreRuler'
import { useLeaderboardTabStore } from '../useLeaderboardTabStore'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardBanner.module.css'

const STRIPE_SCALE = 10
const SEG_W_HIGH = STRIPE_SCALE * ROLL_WIDTH_RATIOS.high
const SEG_W_MID = STRIPE_SCALE * ROLL_WIDTH_RATIOS.mid
const SEG_W_LOW = STRIPE_SCALE * ROLL_WIDTH_RATIOS.low

interface CropConfig {
  cxPct: number
  cyPct: number
  wPct: number
  hPct: number
}

const DEFAULT_RANK_IMAGE = 4

const CROP_BY_RANK: Record<number, CropConfig> = {
  3: { cxPct: 59.11, cyPct: 50.96, wPct: 41.93, hPct: 51.60 },
  4: { cxPct: 51.17, cyPct: 51.12, wPct: 49.48, hPct: 60.90 },
  6: { cxPct: 49.48, cyPct: 52.56, wPct: 42.45, hPct: 52.24 },
}

// 100 * 100 converts "show X% of image" to the CSS percentage needed to size the image
function cropStyle(config: CropConfig): React.CSSProperties {
  return {
    width: `${(100 * 100 / config.wPct).toFixed(1)}%`,
    height: `${(100 * 100 / config.hPct).toFixed(1)}%`,
    left: `${((0.5 - config.cxPct / config.wPct) * 100).toFixed(1)}%`,
    top: `${((0.5 - config.cyPct / config.hPct) * 100).toFixed(1)}%`,
  }
}

type ActiveSet = { set: Sets, count: number }

function useActiveSets(relics: PreviewRelics | null): ActiveSet[] {
  return useMemo(() => {
    if (!relics) return []
    const counts = new Map<Sets, number>()
    for (const relic of Object.values(relics)) {
      if (!relic) continue
      counts.set(relic.set, (counts.get(relic.set) ?? 0) + 1)
    }
    const result: ActiveSet[] = []
    for (const [set, count] of counts) {
      if (count >= 4) result.push({ set, count: 4 })
      else if (count >= 2) result.push({ set, count: 2 })
    }
    return result
  }, [relics])
}

function stripeGradient(entry: AggregatedStatRolls, colors: TierColors): React.CSSProperties | undefined {
  const stops: string[] = []
  let pos = 0

  const addSegments = (count: number, width: number, color: string) => {
    for (let i = 0; i < count; i++) {
      if (pos > 0) {
        stops.push(`transparent ${pos}px ${pos + 1}px`)
        pos += 1
      }
      stops.push(`${color} ${pos}px ${pos + width}px`)
      pos += width
    }
  }

  addSegments(entry.high, SEG_W_HIGH, colors.high)
  addSegments(entry.mid, SEG_W_MID, colors.mid)
  addSegments(entry.low, SEG_W_LOW, colors.low)

  if (stops.length === 0) return undefined

  return {
    backgroundImage: `linear-gradient(to right, ${stops.join(', ')})`,
    backgroundSize: `${pos}px 6px`,
    backgroundRepeat: 'no-repeat',
  }
}

function ModuleStack({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className={classes.moduleStack}>
      <div className={classes.moduleLabelBand}>
        <span className={classes.uplabel}>{label}</span>
      </div>
      <div className={classes.moduleContentBand}>{children}</div>
    </div>
  )
}

function PortraitSection({ portraitSrc, portraitCrop, characterName }: {
  portraitSrc: string,
  portraitCrop: React.CSSProperties,
  characterName: string,
}) {
  return (
    <div className={classes.portraitFrame}>
      <LoadingBlurredImage src={portraitSrc} className={classes.portraitImg} style={portraitCrop} />
      <div className={classes.nameplate}>
        <span className={classes.charName}>{characterName}</span>
      </div>
    </div>
  )
}

function ResultRow({ rank, scorePercent, aeonStyle, totalEntryCount }: {
  rank: number | undefined,
  scorePercent: number | undefined,
  aeonStyle: React.CSSProperties,
  totalEntryCount: number,
}) {
  return (
    <Flex align='center' gap={15} px={6}>
      <span className={classes.rankGroup}>
        <span className={classes.rankHash}>#</span>
        <span className={classes.rankNumber}>{rank ?? '--'}</span>
      </span>
      <div className={classes.resultDivider} />
      <span className={classes.score}>
        {scorePercent != null ? `${scorePercent.toFixed(1)}%` : '--'}
      </span>
      <span className={classes.aeonBadge} style={aeonStyle}>
        <IconRosette size={15} />
        AEON
      </span>
      <span className={classes.entries}>
        of {totalEntryCount.toLocaleString()} entries
      </span>
    </Flex>
  )
}

function ModuleRow({ selectedEntry, eidolon, lcId, lcSuper, lcName, lcIconSrc, teammates, activeSets }: {
  selectedEntry: LeaderboardEntry | null,
  eidolon: number,
  lcId: LightConeId | null,
  lcSuper: number,
  lcName: string,
  lcIconSrc: string | null,
  teammates: LeaderboardTeammate[],
  activeSets: ActiveSet[],
}) {
  if (!selectedEntry) return null

  return (
    <div className={classes.moduleRow}>
      {lcIconSrc && (
        <div className={classes.lcModule}>
          <img src={lcIconSrc} className={classes.lcIcon} />
          <ModuleStack label='Light cone'>
            <div className={classes.lcText}>
              <span className={classes.lcSuper}>E{eidolon} S{lcSuper}</span>
              <span className={classes.lcName}>{lcName}</span>
            </div>
          </ModuleStack>
        </div>
      )}

      {teammates.length > 0 && (
        <>
          <div className={classes.vsep} />
          <ModuleStack label='Team'>
            <Flex align='center'>
              {teammates.map((teammate, index) => (
                <img
                  key={`${teammate.characterId}-${index}`}
                  src={Assets.getCharacterAvatarById(teammate.characterId)}
                  className={classes.partyAvatar}
                />
              ))}
            </Flex>
          </ModuleStack>
        </>
      )}

      {activeSets.length > 0 && (
        <>
          <div className={classes.vsep} />
          <ModuleStack label='Sets'>
            <Flex align='center' gap={11}>
              {activeSets.map((s) => (
                <div key={s.set} className={classes.setBadge}>
                  <img src={Assets.getSetImage(s.set)} className={classes.setIcon} />
                  <span className={classes.setPieces}>{s.count}pc</span>
                </div>
              ))}
            </Flex>
          </ModuleStack>
        </>
      )}
    </div>
  )
}

function SubstatColumn({ rolls, tierColors }: {
  rolls: AggregatedStatRolls[],
  tierColors: TierColors,
}) {
  const { t } = useTranslation('common')

  if (rolls.length === 0) return null

  return (
    <>
      <div className={classes.subDivider} />
      <div className={classes.subColumn}>
        {rolls.map((roll) => (
          <div key={roll.stat} className={classes.subRow}>
            <Flex align='center' gap={5}>
              <img src={Assets.getStatIcon(roll.stat)} className={classes.statIcon} />
              <span className={classes.statName}>{t(`Stats.${roll.stat}`)}</span>
              <span className={classes.statValue}>{roll.effective.toFixed(1)}</span>
            </Flex>
            <div className={classes.stripeBar} style={stripeGradient(roll, tierColors)} />
          </div>
        ))}
      </div>
    </>
  )
}

export function LeaderboardBanner() {
  const selectedEntry = useLeaderboardTabStore((s) => s.selectedEntry)
  const selectedCharacterId = useLeaderboardTabStore((s) => s.selectedCharacterId)
  const previewRelics = useLeaderboardTabStore((s) => s.expandedPreviewRelics)
  const totalEntries = useLeaderboardTabStore((s) => s.totalEntries)

  const { t: tGame } = useTranslation('gameData')

  const characterId = selectedCharacterId
  const totalEntryCount = characterId ? totalEntries[characterId] ?? 0 : 0
  const nameKey = characterId?.startsWith('80') ? 'LongName' : 'Name'
  const characterName = characterId ? tGame(`Characters.${characterId}.${nameKey}`) : ''
  const scoringMetadata = useScoringMetadata(characterId)

  const rankImage = scoringMetadata?.eidolonImage ?? DEFAULT_RANK_IMAGE
  const portraitSrc = characterId ? Assets.getCharacterRankImageById(characterId, rankImage) : ''
  const portraitCrop = cropStyle(CROP_BY_RANK[rankImage] ?? CROP_BY_RANK[DEFAULT_RANK_IMAGE])
  const activeSets = useActiveSets(previewRelics)

  const scoringStats = scoringMetadata?.stats
  const rolls = useMemo(
    () => previewRelics && scoringStats ? aggregateSubstatRolls(previewRelics, scoringStats) : [],
    [previewRelics, scoringStats],
  )

  const { tierColors, aeonStyle } = useMemo(() => {
    const seedColor = characterId ? getCharacterConfig(characterId)?.display.showcaseColor ?? DEFAULT_SHOWCASE_COLOR : DEFAULT_SHOWCASE_COLOR
    const colors = computeTierColors(seedColor)
    return {
      tierColors: colors,
      aeonStyle: {
        '--aeon-color': colors.mid,
        '--aeon-color-border': chroma(colors.mid).alpha(0.42).css(),
        '--aeon-color-bg': chroma(colors.mid).alpha(0.10).css(),
      } as React.CSSProperties,
    }
  }, [characterId])

  if (!selectedEntry) {
    return <div className={classes.root} />
  }

  const rank = selectedEntry?.rank
  const scorePercent = selectedEntry ? selectedEntry.score * 100 : undefined
  const eidolon = selectedEntry?.characterEidolon ?? 0
  const teammates = selectedEntry?.team ?? []

  const lcId = selectedEntry?.minifiedCharacter.q?.t ? String(selectedEntry.minifiedCharacter.q.t) as LightConeId : null
  const lcSuper = selectedEntry?.minifiedCharacter.q?.r ?? 1
  const lcIconSrc = lcId ? Assets.getLightConeIconById(lcId) : null
  const lcName = lcId ? tGame(`Lightcones.${lcId}.Name`) : ''

  return (
    <div className={classes.root}>
      <div className={classes.bgImage} style={{ backgroundImage: `url("${Assets.getLeaderboardCardBg()}")` }} />

      <div className={classes.row}>
        <PortraitSection portraitSrc={portraitSrc} portraitCrop={portraitCrop} characterName={characterName} />

        <div className={classes.rowDivider} />

        <div className={classes.glassSheet}>
          <div className={classes.stack}>
            <ResultRow rank={rank} scorePercent={scorePercent} aeonStyle={aeonStyle} totalEntryCount={totalEntryCount} />

            <ModuleRow
              selectedEntry={selectedEntry}
              eidolon={eidolon}
              lcId={lcId}
              lcSuper={lcSuper}
              lcName={lcName}
              lcIconSrc={lcIconSrc}
              teammates={teammates}
              activeSets={activeSets}
            />

            <div className={classes.rulerRow}>
              <HeroScoreRuler score={scorePercent} tierColors={tierColors} />
            </div>
          </div>

          <SubstatColumn rolls={rolls} tierColors={tierColors} />
        </div>
      </div>
    </div>
  )
}
