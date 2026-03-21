import { Button, Divider, Flex } from '@mantine/core'
import { IconEraser } from '@tabler/icons-react'
import { OpenCloseIDs, setOpen } from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/appStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { FilterPillBar } from 'lib/tabs/tabRelics/topBar/FilterPillBar'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function TopBar() {
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const setFocusCharacter = useRelicsTabStore((s) => s.setFocusCharacter)
  const resetFilters = useRelicsTabStore((s) => s.resetFilters)
  const { t } = useTranslation('relicsTab')

  const handleScoringClick = useCallback(() => {
    if (focusCharacter) {
      useGlobalStore.getState().setScoringAlgorithmFocusCharacter(focusCharacter)
    }
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }, [focusCharacter])

  const avatarSrc = focusCharacter
    ? Assets.getCharacterAvatarById(focusCharacter)
    : Assets.getBlank()

  return (
    <Flex gap={10} align="stretch">
      {/* Avatar */}
      <Flex align="center" justify="center" style={{ width: 72, minWidth: 72 }}>
        <img
          src={avatarSrc}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '2px solid var(--border-color)',
            background: 'var(--mantine-color-dark-7)',
            objectFit: 'cover',
            cursor: 'pointer',
            opacity: focusCharacter ? 1 : 0.3,
          }}
          onClick={handleScoringClick}
          title={t('RelicFilterBar.ScoringButton')}
        />
      </Flex>

      {/* Character select (top) / Scoring algorithm (bottom) */}
      <Flex direction="column" gap={6} justify="center" style={{ width: 200, minWidth: 200 }}>
        <CharacterSelect
          value={focusCharacter}
          selectStyle={{ width: '100%' }}
          onChange={(id) => setFocusCharacter(id)}
        />
        <Button variant="default" onClick={handleScoringClick} size="xs" fullWidth>
          {t('RelicFilterBar.ScoringButton')}
        </Button>
      </Flex>

      <Divider orientation="vertical" mx={4} />

      {/* Filters (top) / Ratings + Custom characters (bottom) */}
      <FilterPillBar />

      {/* Clear */}
      <Flex align="center" style={{ minWidth: 'fit-content' }}>
        <Button
          variant="subtle"
          size="xs"
          onClick={resetFilters}
          color="dimmed"
          leftSection={<IconEraser size={12} />}
        >
          {t('RelicFilterBar.Clear')}
        </Button>
      </Flex>
    </Flex>
  )
}
