import {
  Button,
  Divider,
} from '@mantine/core'
import {
  IconEraser,
  IconPlus,
} from '@tabler/icons-react'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { FilterPillBar } from 'lib/tabs/tabRelics/topBar/FilterPillBar'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import {
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export function TopBar() {
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const setFocusCharacter = useRelicsTabStore((s) => s.setFocusCharacter)
  const resetFilters = useRelicsTabStore((s) => s.resetFilters)
  const { t } = useTranslation('relicsTab')
  const [charSelectOpen, setCharSelectOpen] = useState(false)

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
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
      {/* Avatar — click opens character select */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, minWidth: 72 }}>
        {focusCharacter
          ? (
            <img
              src={avatarSrc}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '2px solid var(--border-default)',
                background: 'var(--layer-1)',
                objectFit: 'cover',
                cursor: 'pointer',
              }}
              onClick={() => setCharSelectOpen(true)}
            />
          )
          : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '2px dashed rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
              onClick={() => setCharSelectOpen(true)}
            >
              <IconPlus size={24} />
            </div>
          )}
      </div>

      {/* Character select (top) / Scoring algorithm (bottom) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center', width: 200, minWidth: 200 }}>
        <CharacterSelect
          value={focusCharacter}
          selectStyle={{ width: '100%' }}
          onChange={(id) => setFocusCharacter(id)}
          opened={charSelectOpen}
          onOpenChange={setCharSelectOpen}
          showIcon={false}
        />
        <Button variant='default' onClick={handleScoringClick} size='xs' fullWidth>
          {t('RelicFilterBar.ScoringButton')}
        </Button>
      </div>

      <Divider orientation='vertical' mx={0} />

      {/* Filters (top) / Ratings + Custom characters (bottom) */}
      <FilterPillBar />

      {/* Clear */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 'fit-content' }}>
        <Button
          variant='subtle'
          size='xs'
          onClick={resetFilters}
          color='dimmed'
          leftSection={<IconEraser size={12} />}
          h='100%'
          style={{ border: 'var(--border-subtle)' }}
        >
          {t('RelicFilterBar.Clear')}
        </Button>
      </div>
    </div>
  )
}
