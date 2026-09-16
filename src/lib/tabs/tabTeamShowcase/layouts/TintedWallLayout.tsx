import {
  ActionIcon,
  Button,
  Tooltip,
} from '@mantine/core'
import {
  IconCamera,
  IconDownload,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import type { TeamShowcaseLayoutProps } from 'lib/tabs/tabTeamShowcase/layouts/layoutTypes'
import styles from 'lib/tabs/tabTeamShowcase/layouts/TintedWallLayout.module.css'
import { SavedTeamsPanel } from 'lib/tabs/tabTeamShowcase/SavedTeamsPanel'
import { SlotCellOverlay } from 'lib/tabs/tabTeamShowcase/SlotCellOverlay'
import { SlotPickers } from 'lib/tabs/tabTeamShowcase/SlotPickers'
import { SlotScoringSelect } from 'lib/tabs/tabTeamShowcase/SlotScoringSelect'
import { TeamCardGrid } from 'lib/tabs/tabTeamShowcase/TeamCardGrid'
import {
  DISPLAY_SCALE,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import type { SlotScoring } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type { SlotAppearance } from 'lib/tabs/tabTeamShowcase/useSlotAppearance'
import { useSlotAppearances } from 'lib/tabs/tabTeamShowcase/useSlotAppearance'
import { useSlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Matches the saved-teams rail so the two side columns are symmetric:
 * 196 + 24 (column gap) + 1108 (grid) + 24 (column gap) + 196 = 1548px, the full width budget.
 */
const RAIL_WIDTH = 196
const GRID_SCALE = DISPLAY_SCALE
/** Side columns end exactly at the grid's top and bottom edges: 1776 x 0.5 = 888px */
const COLUMN_HEIGHT = GRID_SIZE.height * GRID_SCALE

/** Matches the Characters panel's menu button and filter bar, which are all 40px tall with a 4px radius */
const HEADER_BUTTON_STYLE = { height: 40, boxShadow: 'unset', borderRadius: 4 }
const HEADER_ICON_SIZE = 16
const SMALL_ICON_SIZE = 14
const EMPTY_TILE_ICON_SIZE = 22

const SCORING_CLASS_NAMES = {
  input: styles.scoringInput,
  section: styles.scoringSection,
}

/** Inline custom properties consumed by TintedWallLayout.module.css */
interface TileSeedStyle extends CSSProperties {
  '--tile-seed': string
}

/** Hands a tile its character's card colour; the module CSS derives every tinted detail from it */
function tileSeedStyle(appearance: SlotAppearance | null): TileSeedStyle | undefined {
  if (appearance == null) return undefined
  return { '--tile-seed': appearance.seedColor }
}

/**
 * Gallery Wall with each character's own colour, used sparingly. Structure, sizes and whitespace match
 * Gallery Wall exactly. Outlines and focus rings all use the global accent; the character's own card seed
 * colour is used only for the faint scrim tint behind each tile's controls and the active saved team's
 * underline.
 */
export function TintedWallLayout({ state }: TeamShowcaseLayoutProps) {
  const { t } = useTranslation('teamShowcaseTab')
  const { t: tGameData } = useTranslation('gameData')
  const {
    slots,
    characters,
    setSlot,
    clearTeam,
    hasTeam,
    slotScoring,
    setSlotScoringType,
    screenshot,
    screenshotLoading,
  } = state

  const interactions = useSlotInteractions()
  const { pickerSlot, setPickerSlot, hoveredSlot, hoverStart, hoverEnd } = interactions
  const appearances = useSlotAppearances(slots)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerActions}>
          <Button
            style={HEADER_BUTTON_STYLE}
            variant='subtle'
            color='gray'
            leftSection={<IconTrash size={HEADER_ICON_SIZE} />}
            disabled={!hasTeam}
            onClick={clearTeam}
          >
            {t('Buttons.Clear')}
          </Button>
          <Button
            style={HEADER_BUTTON_STYLE}
            variant='default'
            leftSection={<IconDownload size={HEADER_ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {t('Buttons.DownloadScreenshot')}
          </Button>
          <Button
            style={HEADER_BUTTON_STYLE}
            leftSection={<IconCamera size={HEADER_ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {t('Buttons.CopyScreenshot')}
          </Button>
        </div>
      </header>

      <div className={styles.columns}>
        <aside className={styles.rail} style={{ width: RAIL_WIDTH, height: COLUMN_HEIGHT }}>
          {slots.map((id, index) => (
            <ArtTile
              key={index}
              appearance={appearances[index] ?? null}
              name={id ? tGameData(`Characters.${id}.Name`) : ''}
              emptyLabel={t('EmptySlot')}
              changeLabel={t('Buttons.Swap')}
              removeLabel={t('Buttons.Remove')}
              scoringLabel={t('Scoring.Label')}
              scoring={slotScoring[index] ?? null}
              active={pickerSlot === index}
              linked={hoveredSlot === index}
              onOpen={() => setPickerSlot(index)}
              onRemove={() => setSlot(index, null)}
              onScoringChange={(scoringType) => setSlotScoringType(index, scoringType)}
              onHoverStart={() => hoverStart(index)}
              onHoverEnd={() => hoverEnd(index)}
            />
          ))}
        </aside>

        <TeamCardGrid
          className={styles.gridColumn}
          characters={characters}
          scale={GRID_SCALE}
          renderSlotOverlay={(index, character) => (
            <SlotCellOverlay index={index} filled={character != null} interactions={interactions} />
          )}
        />

        <SavedTeamsPanel state={state} />
      </div>

      <SlotPickers state={state} interactions={interactions} />
    </div>
  )
}

/**
 * One slot as a full-bleed art tile. The art opens the picker; the translucent scoring select sits in a
 * bottom scrim; remove appears on hover or focus.
 * Empty: a faint dashed tile with no character colour.
 */
function ArtTile({
  appearance,
  name,
  emptyLabel,
  changeLabel,
  removeLabel,
  scoringLabel,
  scoring,
  active,
  linked,
  onOpen,
  onRemove,
  onScoringChange,
  onHoverStart,
  onHoverEnd,
}: {
  appearance: SlotAppearance | null,
  name: string,
  emptyLabel: string,
  changeLabel: string,
  removeLabel: string,
  scoringLabel: string,
  scoring: SlotScoring | null,
  active: boolean,
  linked: boolean,
  onOpen: () => void,
  onRemove: () => void,
  onScoringChange: (scoringType: ScoringType) => void,
  onHoverStart: () => void,
  onHoverEnd: () => void,
}) {
  const empty = appearance == null

  return (
    <div
      className={styles.tile}
      style={tileSeedStyle(appearance)}
      data-empty={empty}
      data-active={active}
      data-linked={linked}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {empty
        ? (
          <button type='button' className={styles.emptyButton} onClick={onOpen}>
            <IconPlus size={EMPTY_TILE_ICON_SIZE} stroke={1.5} />
            <span className={styles.emptyLabel}>{emptyLabel}</span>
          </button>
        )
        : (
          <>
            <button type='button' className={styles.artButton} aria-label={`${changeLabel}: ${name}`} onClick={onOpen}>
              <img
                className={styles.art}
                src={appearance.artUrl}
                style={appearance.artObjectPosition ? { objectPosition: appearance.artObjectPosition } : undefined}
                alt=''
                draggable={false}
                decoding='async'
              />
            </button>

            <div className={styles.scrim}>
              {scoring && (
                <div className={styles.scoringSlot}>
                  <SlotScoringSelect
                    aria-label={scoringLabel}
                    scoring={scoring}
                    onChange={onScoringChange}
                    classNames={SCORING_CLASS_NAMES}
                  />
                </div>
              )}
            </div>

            <Tooltip label={removeLabel}>
              <ActionIcon
                className={styles.removeButton}
                variant='filled'
                color='dark'
                size='sm'
                aria-label={removeLabel}
                onClick={onRemove}
              >
                <IconX size={SMALL_ICON_SIZE} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
    </div>
  )
}
