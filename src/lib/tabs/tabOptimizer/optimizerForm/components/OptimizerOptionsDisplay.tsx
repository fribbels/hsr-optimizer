import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Flex, Switch, Text } from '@mantine/core'
import {
  Radio,
  Select,
} from 'antd'

import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
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
import { Utils } from 'lib/utils/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const OptimizerOptionsDisplay = (): JSX.Element => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'OptimizerOptions' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const characters = useCharacterTabStore((s) => s.characters)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

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
              options={characterPriorityOptions}
              value={rank}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('rank', val)
                const characterId = useOptimizerFormStore.getState().characterId
                if (characterId && DB.getCharacterById(characterId)) {
                  DB.insertCharacter(characterId, val)
                }
                recalculatePermutations()
              }}
              popupMatchSelectWidth={225}
              listHeight={500}
              optionLabelProp='name'
              placeholder={t('Priority.Header') /* Priority */}
              showSearch
              filterOption={Utils.nameFilterOption}
            />
          </Flex>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('Exclude') /* Exclude */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2, height: 32 }}
              mode='multiple'
              maxTagCount='responsive'
              popupMatchSelectWidth={250}
              listHeight={500}
              allowClear
              showSearch
              optionLabelProp='title'
              placeholder={t('Exclude') /* Exclude */}
              options={characterExcludeOptions}
              value={exclude}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('exclude', val)
                recalculatePermutations()
              }}
              filterOption={Utils.titleFilterOption}
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
              value={enhance}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('enhance', val)
                recalculatePermutations()
              }}
              options={[
                { value: 0, label: t('MinEnhance.Label0') }, // '+0'
                { value: 3, label: t('MinEnhance.Label3') }, // '+3'
                { value: 6, label: t('MinEnhance.Label6') }, // '+6'
                { value: 9, label: t('MinEnhance.Label9') }, // '+9'
                { value: 12, label: t('MinEnhance.Label12') }, // '+12'
                { value: 15, label: t('MinEnhance.Label15') }, // '+15'
              ]}
            />
          </Flex>

          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('MinRarity.Header') /* Min rarity */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={grade}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('grade', val)
                recalculatePermutations()
              }}
              options={[
                { value: 2, label: t('MinRarity.Label2') }, // '2 ★ +'
                { value: 3, label: t('MinRarity.Label3') }, // '3 ★ +'
                { value: 4, label: t('MinRarity.Label4') }, // '4 ★ +'
                { value: 5, label: t('MinRarity.Label5') }, // '5 ★'
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
              value={mainStatUpscaleLevel}
              onChange={(val) => {
                useOptimizerFormStore.getState().setRelicFilterField('mainStatUpscaleLevel', val)
                recalculatePermutations()
              }}
              options={[
                { value: 0, label: t('BoostMain.Label0') }, // '+0'
                { value: 3, label: t('BoostMain.Label3') }, // '+3'
                { value: 6, label: t('BoostMain.Label6') }, // '+6'
                { value: 9, label: t('BoostMain.Label9') }, // '+9'
                { value: 12, label: t('BoostMain.Label12') }, // '+12'
                { value: 15, label: t('BoostMain.Label15') }, // '+15'
              ]}
            />
          </Flex>
        </Flex>

        <Flex align='center' style={{ marginTop: 15 }}>
          <Flex direction="column" gap={2} style={{ width: '100%' }}>
            <HeaderText>
              {t('DPSMode.Header') /* DPS Mode */}
            </HeaderText>
            <Radio.Group
              size='small'
              optionType='button'
              buttonStyle='solid'
              style={{ width: '100%', display: 'flex' }}
              value={deprioritizeBuffs}
              onChange={(e) => useOptimizerFormStore.getState().setDeprioritizeBuffs(e.target.value)}
            >
              <Radio
                style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
                value={false}
              >
                {t('DPSMode.Main') /* Main */}
              </Radio>
              <Radio
                style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }}
                value={true}
                defaultChecked
              >
                {t('DPSMode.Sub') /* Sub */}
              </Radio>
            </Radio.Group>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default OptimizerOptionsDisplay
