import { Divider, Flex, Progress, Tooltip, useMantineTheme } from '@mantine/core'
import chroma from 'chroma-js'
import { buffedCharacters } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacters } from 'lib/stores/characterStore'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import classes from 'lib/tabs/tabRelics/RecentRelicCard.module.css'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

interface RelicCardProps {
  relic?: Relic
  scoringCharacter?: CharacterId | null
  setSelectedRelicID?: (relicID: string) => void
  isSelected?: boolean
}

export const RecentRelicCard = memo((props: RelicCardProps) => {
  const { relic, scoringCharacter, setSelectedRelicID, isSelected } = props
  const { excludedRelicPotentialCharacters } = useRelicsTabStore(
    useShallow((s) => ({
      excludedRelicPotentialCharacters: s.excludedRelicPotentialCharacters,
    })),
  )
  const mantineTheme = useMantineTheme()
  const token = {
    colorPrimary: mantineTheme.colors.primary[9],
    colorPrimaryBg: mantineTheme.colors.dark[8] + '40',
    colorBgContainer: mantineTheme.colors.dark[6],
    colorBorderSecondary: mantineTheme.colors.dark[4],
    colorTextSecondary: mantineTheme.colors.dark[2],
    colorText: mantineTheme.colors.dark[0],
  }
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
      <Flex direction="column">
        <RelicPreview relic={undefined} />
      </Flex>
    )
  }

  const avgPotential = Math.floor(potentialScore?.averagePct ?? 0)
  const maxPotential = Math.floor(potentialScore?.bestPct ?? 0)

  return (
    <Flex
      direction="column"
      className={classes.cardContainer}
      style={{
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
      <Flex
        direction="column"
        gap={8}
        className={classes.bottomPanel}
        style={{
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {potentialScore && (
          <Flex direction="column" gap={4}>
            <Flex align='center' justify='space-between'>
              <div
                className={classes.sectionLabel}
                style={{ color: token.colorTextSecondary }}
              >
                {t('Potential') /* POTENTIAL */}
              </div>
            </Flex>

            <Progress.Root size="xs" style={{ lineHeight: 0 }}>
              <Progress.Section value={avgPotential} color={getColorAtPercent(avgPotential)} />
              <Progress.Section value={maxPotential - avgPotential} color={getColorAtPercent(maxPotential)} />
            </Progress.Root>

            <Flex align='center' justify='space-between'>
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
            </Flex>
          </Flex>
        )}

        {/* Top characters potential */}
        {(topCharacters?.length ?? 0) > 0 && (
          <>
            {potentialScore && <Divider style={{ margin: '0' }} />}

            <Flex direction="column" gap={4}>
              <div
                className={classes.sectionLabel}
                style={{ color: token.colorTextSecondary }}
              >
                {t('BestFor') /* BEST FOR */}
              </div>

              <Flex direction="column" gap={5} className={classes.characterList}>
                {topCharacters?.map((char) => {
                  const maxPct = Math.floor(char.score.bestPct)
                  const avgPct = Math.floor(char.score.averagePct)

                  return (
                    <Flex key={char.id} direction="column" style={{ padding: '2px 4px' }} gap={2}>
                      <Flex
                        align='center'
                        justify='space-between'
                        className={classes.characterRow}
                        style={{
                          backgroundColor: char.isSelected ? token.colorPrimaryBg : 'transparent',
                        }}
                        onClick={() => setSelectedRelicID?.(relic.id)}
                      >
                        <Flex align='center' gap={6} miw={0}>
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
                        </Flex>
                        <Flex align='center' gap={4}>
                          <Tooltip label={t('Tooltip') /* Average and maximum potential scores for this character */}>
                            <div className={classes.scoreText}>
                              <span style={{ color: getColorAtPercent(avgPct) }}>{avgPct}%</span>
                              <span style={{ color: token.colorTextSecondary }}>/</span>
                              <span style={{ color: getColorAtPercent(maxPct) }}>{maxPct}%</span>
                            </div>
                          </Tooltip>
                        </Flex>
                      </Flex>

                      <Progress.Root size="xs" style={{ lineHeight: 0 }}>
                        <Progress.Section value={avgPct} color={getColorAtPercent(avgPct)} />
                        <Progress.Section value={maxPct - avgPct} color={getColorAtPercent(maxPct)} />
                      </Progress.Root>
                    </Flex>
                  )
                })}
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
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
