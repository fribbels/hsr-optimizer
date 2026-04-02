import { Divider, Progress, Tooltip } from '@mantine/core'
import chroma from 'chroma-js'
import { buffedCharacters } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacters } from 'lib/stores/character/characterStore'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import classes from 'lib/tabs/tabRelics/RecentRelicCard.module.css'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

interface RelicCardProps {
  relic?: Relic
  scoringCharacter?: CharacterId | null
  setSelectedRelicID?: (relicID: string) => void
  isSelected?: boolean
}

const token = {
  colorPrimary: 'var(--primary-subtle)',
  colorPrimaryBg: 'color-mix(in srgb, var(--layer-inset) 25%, transparent)',
  colorBgContainer: 'var(--layer-1)',
  colorBorderSecondary: 'var(--border-default)',
  colorTextSecondary: 'var(--text-secondary)',
  colorText: 'var(--text-primary)',
}

export const RecentRelicCard = memo((props: RelicCardProps) => {
  const { relic, scoringCharacter, setSelectedRelicID, isSelected } = props
  const excludedRelicPotentialCharacters = useRelicsTabStore(
    (s) => s.excludedRelicPotentialCharacters,
  )
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RecentlyUpdatedRelics' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })

  // Calculate score for the selected character
  const { score, potentialScore } = useMemo(() => {
    if (!relic || !scoringCharacter) return {}
    const score = RelicScorer.scoreCurrentRelic(relic, scoringCharacter)
    const potentialScore = RelicScorer.scoreRelicPotential(relic, scoringCharacter, true)
    return { score, potentialScore }
  }, [relic, scoringCharacter])

  // Calculate top characters for the relic
  const topCharacters = useMemo(() => {
    const chars = getGameMetadata().characters
    const characterList = getCharacters()

    return relic && (Object.keys(chars) as (keyof typeof chars)[])
      .filter((id) => !excludedRelicPotentialCharacters.includes(id) && !buffedCharacters[id])
      .map((id) => ({
        id,
        rarity: chars[id].rarity,
        name: tCharacters(`${id}.Name`),
        score: RelicScorer.scoreRelicPotential(relic, id, false),
        isSelected: id === scoringCharacter,
        icon: Assets.getCharacterAvatarById(id),
      }))
      .sort((a, b) => {
        // Break ties by score -> rarity -> character priority
        const pctDiff = b.score.bestPct - a.score.bestPct
        if (pctDiff !== 0) {
          return pctDiff
        }

        const rarityDiff = b.rarity - a.rarity
        if (rarityDiff !== 0) {
          return rarityDiff
        }

        const aRank = characterList.findIndex((c) => c.id === a.id)
        const bRank = characterList.findIndex((c) => c.id === b.id)
        return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank)
      })
      .slice(0, 5)
  }, [relic, scoringCharacter, excludedRelicPotentialCharacters, tCharacters])

  // Skip render if no relic
  if (!relic) {
    return (
      <div>
        <RelicPreview relic={undefined} />
      </div>
    )
  }

  const avgPotential = Math.floor(potentialScore?.averagePct ?? 0)
  const maxPotential = Math.floor(potentialScore?.bestPct ?? 0)

  return (
    <div
      className={classes.cardContainer}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: isSelected ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
        backgroundColor: isSelected ? `${token.colorPrimaryBg}` : 'transparent',
      }}
    >
      <RelicPreview
        relic={relic}
        characterId={scoringCharacter}
        score={score}
        scoringType={score ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
        setSelectedRelic={(relic) => setSelectedRelicID?.(relic.id)}
      />
      <div
        className={classes.bottomPanel}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {potentialScore && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                className={classes.sectionLabel}
                style={{ color: token.colorTextSecondary }}
              >
                {t('Potential') /* POTENTIAL */}
              </div>
            </div>

            <Progress.Root size="xs" style={{ lineHeight: 0 }}>
              <Progress.Section value={avgPotential} color={getColorAtPercent(avgPotential)} />
              <Progress.Section value={maxPotential - avgPotential} color={getColorAtPercent(maxPotential)} />
            </Progress.Root>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                className={classes.statText}
                style={{ color: token.colorTextSecondary }}
              >
                {t('Avg') /* AVG */}: <span className={classes.scoreHighlight} style={{ color: getColorAtPercent(avgPotential) }}>{avgPotential}%</span>
              </div>
              <div
                className={classes.statText}
                style={{ color: token.colorTextSecondary }}
              >
                {t('Max') /* MAX */}: <span className={classes.scoreHighlight} style={{ color: getColorAtPercent(maxPotential) }}>{maxPotential}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Top characters potential */}
        {(topCharacters?.length ?? 0) > 0 && (
          <>
            {potentialScore && <Divider style={{ margin: '0' }} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                className={classes.sectionLabel}
                style={{ color: token.colorTextSecondary }}
              >
                {t('BestFor') /* BEST FOR */}
              </div>

              <div className={classes.characterList} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {topCharacters?.map((char) => {
                  const maxPct = Math.floor(char.score.bestPct)
                  const avgPct = Math.floor(char.score.averagePct)

                  return (
                    <div key={char.id} style={{ display: 'flex', flexDirection: 'column', padding: '2px 4px', gap: 2 }}>
                      <div
                        className={classes.characterRow}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: char.isSelected ? token.colorPrimaryBg : 'transparent',
                        }}
                        onClick={() => setSelectedRelicID?.(relic.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          <img
                            src={char.icon}
                            alt={char.name}
                            className={classes.characterAvatar}
                            style={{ border: `1px solid ${token.colorBorderSecondary}` }}
                          />
                          <div
                            className={classes.characterName}
                            style={{
                              color: char.isSelected ? token.colorPrimary : token.colorText,
                              fontWeight: char.isSelected ? 600 : 400,
                            }}
                          >
                            {char.name}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tooltip label={t('Tooltip') /* Average and maximum potential scores for this character */}>
                            <div className={classes.scoreText}>
                              <span style={{ color: getColorAtPercent(avgPct) }}>{avgPct}%</span>
                              <span style={{ color: token.colorTextSecondary }}>/</span>
                              <span style={{ color: getColorAtPercent(maxPct) }}>{maxPct}%</span>
                            </div>
                          </Tooltip>
                        </div>
                      </div>

                      <Progress.Root size="xs" style={{ lineHeight: 0 }}>
                        <Progress.Section value={avgPct} color={getColorAtPercent(avgPct)} />
                        <Progress.Section value={maxPct - avgPct} color={getColorAtPercent(maxPct)} />
                      </Progress.Root>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
})

RecentRelicCard.displayName = 'RecentRelicCard'

// Modified slightly from the est tbp cards
const highRollColor = '#218cff'
const midRollColor = '#63a9ff'
const lowRollColor = '#9aa3ae'

const colorScale = chroma.scale([lowRollColor, midRollColor, highRollColor])
  .domain([20, 50, 80])
  .mode('lab')

function getColorAtPercent(percent: number) {
  percent = Math.max(0, Math.min(80, percent))
  return colorScale(percent).hex()
}
