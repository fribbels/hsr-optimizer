import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Flex, MultiSelect, SegmentedControl, Select, Switch, Text } from '@mantine/core'

import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const OptimizerOptionsDisplay = React.memo(function OptimizerOptionsDisplay(): JSX.Element {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'OptimizerOptions' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const characters = useCharacterTabStore((s) => s.characters)
  const optimizerTabFocusCharacter = useOptimizerUIStore((s) => s.focusCharacterId)

  const includeEquippedRelics = useOptimizerFormStore((s) => s.includeEquippedRelics)
  const rankFilter = useOptimizerFormStore((s) => s.rankFilter)
  const keepCurrentRelics = useOptimizerFormStore((s) => s.keepCurrentRelics)
  const rank = useOptimizerFormStore((s) => s.rank)
  const exclude = useOptimizerFormStore((s) => s.exclude)
  const enhance = useOptimizerFormStore((s) => s.enhance)
  const grade = useOptimizerFormStore((s) => s.grade)
  const mainStatUpscaleLevel = useOptimizerFormStore((s) => s.mainStatUpscaleLevel)
  const deprioritizeBuffs = useOptimizerFormStore((s) => s.deprioritizeBuffs)

  const characterExcludeOptions = useMemo(() =>
    generateCharacterList(
      {
        currentCharacters: characters,
        excludeCharacters: [DB.getCharacterById(optimizerTabFocusCharacter!)!],
        withNobodyOption: false,
        longNameLabel: true,
      },
      tCharacters,
    ), [characters, optimizerTabFocusCharacter, tCharacters])

  const characterPriorityOptions = useMemo(() => {
    return characters.map((x) => {
      return {
        value: x.rank,
        label: (
          <Flex gap={5}>
            <img
              src={Assets.getCharacterAvatarById(x.id)}
              style={{ height: 22, marginRight: 6 }}
            />

            {
              t('Priority.Label', { rank: x.rank + 1, id: x.id })
              // `#${x.rank + 1} - ${characterMetadata[x.id].displayName}`
            }
          </Flex>
        ),
        name: t('Priority.Name', { rank: x.rank + 1 }), // `# ${x.rank + 1}`,
      }
    })
  }, [characters, t])

  return (
    <Flex direction="column">
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Header') /* Optimizer options */}</HeaderText>
          <TooltipImage type={Hint.optimizerOptions()} />
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={includeEquippedRelics}
            onChange={(event) => {
              useOptimizerFormStore.getState().setRelicFilterField('includeEquippedRelics', event.currentTarget.checked)
              recalculatePermutations()
            }}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('AllowEquipped') /* Allow equipped relics */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={rankFilter}
            onChange={(event) => {
              useOptimizerFormStore.getState().setRelicFilterField('rankFilter', event.currentTarget.checked)
              recalculatePermutations()
            }}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('PriorityFilter') /* Character priority filter */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={keepCurrentRelics}
            onChange={(event) => {
              useOptimizerFormStore.getState().setRelicFilterField('keepCurrentRelics', event.currentTarget.checked)
              recalculatePermutations()
            }}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('KeepCurrent') /* Keep current relics */}</Text>
        </Flex>

        <Flex gap={optimizerTabDefaultGap} style={{ marginTop: 10 }}>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('Priority.Header') /* Priority */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              data={characterPriorityOptions.map((opt) => ({ value: String(opt.value), label: opt.name }))}
              value={rank != null ? String(rank) : null}
              onChange={(val) => {
                if (val == null) return
                const numVal = Number(val)
                useOptimizerFormStore.getState().setRelicFilterField('rank', numVal)
                const characterId = useOptimizerFormStore.getState().characterId
                if (characterId && DB.getCharacterById(characterId)) {
                  DB.insertCharacter(characterId, numVal)
                }
                recalculatePermutations()
              }}
              comboboxProps={{ width: 225 }}
              maxDropdownHeight={500}
              placeholder={t('Priority.Header') /* Priority */}
              searchable
            />
          </Flex>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('Exclude') /* Exclude */}
            </HeaderText>
            <MultiSelect
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2, height: 32 }}
              comboboxProps={{ width: 250 }}
              maxDropdownHeight={500}
              clearable
              searchable
              placeholder={t('Exclude') /* Exclude */}
              data={characterExcludeOptions.map((opt) => ({ value: opt.value, label: opt.title }))}
              value={exclude}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('exclude', val as typeof exclude)
                recalculatePermutations()
              }}
            />
          </Flex>
        </Flex>

        <Flex justify='space-between'>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('MinEnhance.Header') /* Min enhance */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={enhance != null ? String(enhance) : null}
              onChange={(val) => {
                if (val == null) return
                useOptimizerFormStore.getState().setRelicFilterField('enhance', Number(val))
                recalculatePermutations()
              }}
              data={[
                { value: '0', label: t('MinEnhance.Label0') }, // '+0'
                { value: '3', label: t('MinEnhance.Label3') }, // '+3'
                { value: '6', label: t('MinEnhance.Label6') }, // '+6'
                { value: '9', label: t('MinEnhance.Label9') }, // '+9'
                { value: '12', label: t('MinEnhance.Label12') }, // '+12'
                { value: '15', label: t('MinEnhance.Label15') }, // '+15'
              ]}
            />
          </Flex>

          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('MinRarity.Header') /* Min rarity */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={grade != null ? String(grade) : null}
              onChange={(val) => {
                if (val == null) return
                useOptimizerFormStore.getState().setRelicFilterField('grade', Number(val))
                recalculatePermutations()
              }}
              data={[
                { value: '2', label: t('MinRarity.Label2') }, // '2 ★ +'
                { value: '3', label: t('MinRarity.Label3') }, // '3 ★ +'
                { value: '4', label: t('MinRarity.Label4') }, // '4 ★ +'
                { value: '5', label: t('MinRarity.Label5') }, // '5 ★'
              ]}
            />
          </Flex>
        </Flex>

        <Flex justify='space-between' align='center'>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('BoostMain.Header') /* Boost main stat */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={mainStatUpscaleLevel != null ? String(mainStatUpscaleLevel) : null}
              onChange={(val) => {
                if (val == null) return
                useOptimizerFormStore.getState().setRelicFilterField('mainStatUpscaleLevel', Number(val))
                recalculatePermutations()
              }}
              data={[
                { value: '0', label: t('BoostMain.Label0') }, // '+0'
                { value: '3', label: t('BoostMain.Label3') }, // '+3'
                { value: '6', label: t('BoostMain.Label6') }, // '+6'
                { value: '9', label: t('BoostMain.Label9') }, // '+9'
                { value: '12', label: t('BoostMain.Label12') }, // '+12'
                { value: '15', label: t('BoostMain.Label15') }, // '+15'
              ]}
            />
          </Flex>
        </Flex>

        <Flex align='center' style={{ marginTop: 15 }}>
          <Flex direction="column" gap={2} style={{ width: '100%' }}>
            <HeaderText>
              {t('DPSMode.Header') /* DPS Mode */}
            </HeaderText>
            <SegmentedControl
              size='xs'
              fullWidth
              value={String(deprioritizeBuffs)}
              onChange={(value) => useOptimizerFormStore.getState().setDeprioritizeBuffs(value === 'true')}
              data={[
                { label: t('DPSMode.Main') /* Main */, value: 'false' },
                { label: t('DPSMode.Sub') /* Sub */, value: 'true' },
              ]}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
})

export default OptimizerOptionsDisplay
