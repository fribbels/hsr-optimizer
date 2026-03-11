import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Flex, MultiSelect, SegmentedControl, Select, Switch, Text } from '@mantine/core'

import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useCharacterStore } from 'lib/stores/characterStore'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './OptimizerOptionsDisplay.module.css'

const OptimizerOptionsDisplay = React.memo(function OptimizerOptionsDisplay(): JSX.Element {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'OptimizerOptions' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const characters = useCharacterStore((s) => s.characters)
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const includeEquippedRelics = useOptimizerRequestStore((s) => s.includeEquippedRelics)
  const rankFilter = useOptimizerRequestStore((s) => s.rankFilter)
  const keepCurrentRelics = useOptimizerRequestStore((s) => s.keepCurrentRelics)
  const rank = useOptimizerRequestStore((s) => s.rank)
  const exclude = useOptimizerRequestStore((s) => s.exclude)
  const enhance = useOptimizerRequestStore((s) => s.enhance)
  const grade = useOptimizerRequestStore((s) => s.grade)
  const mainStatUpscaleLevel = useOptimizerRequestStore((s) => s.mainStatUpscaleLevel)
  const deprioritizeBuffs = useOptimizerRequestStore((s) => s.deprioritizeBuffs)

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
              className={classes.characterAvatar}
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
              useOptimizerRequestStore.getState().setRelicFilterField('includeEquippedRelics', event.currentTarget.checked)
              recalculatePermutations()
            }}
            className={classes.switchRow}
          />
          <Text>{t('AllowEquipped') /* Allow equipped relics */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={rankFilter}
            onChange={(event) => {
              useOptimizerRequestStore.getState().setRelicFilterField('rankFilter', event.currentTarget.checked)
              recalculatePermutations()
            }}
            className={classes.switchRow}
          />
          <Text>{t('PriorityFilter') /* Character priority filter */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={keepCurrentRelics}
            onChange={(event) => {
              useOptimizerRequestStore.getState().setRelicFilterField('keepCurrentRelics', event.currentTarget.checked)
              recalculatePermutations()
            }}
            className={classes.switchRow}
          />
          <Text>{t('KeepCurrent') /* Keep current relics */}</Text>
        </Flex>

        <Flex gap={optimizerTabDefaultGap} className={classes.sectionSpacerTop}>
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
                useOptimizerRequestStore.getState().setRelicFilterField('rank', numVal)
                const characterId = useOptimizerRequestStore.getState().characterId
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
                useOptimizerRequestStore.getState().setRelicFilterField('exclude', val as typeof exclude)
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
                useOptimizerRequestStore.getState().setRelicFilterField('enhance', Number(val))
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
                useOptimizerRequestStore.getState().setRelicFilterField('grade', Number(val))
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
                useOptimizerRequestStore.getState().setRelicFilterField('mainStatUpscaleLevel', Number(val))
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

        <Flex align='center' className={classes.dpsModeSection}>
          <Flex direction="column" gap={2} className={classes.dpsModeColumn}>
            <HeaderText>
              {t('DPSMode.Header') /* DPS Mode */}
            </HeaderText>
            <SegmentedControl
              size='xs'
              fullWidth
              value={String(deprioritizeBuffs)}
              onChange={(value) => useOptimizerRequestStore.getState().setDeprioritizeBuffs(value === 'true')}
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
