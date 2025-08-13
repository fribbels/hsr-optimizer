import {
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import {
  Flex,
  Form,
  Radio,
  Select,
  Switch,
  Typography,
} from 'antd'

import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { Utils } from 'lib/utils/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const OptimizerOptionsDisplay = (): JSX.Element => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'OptimizerOptions' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const characters = useCharacterTabStore((s) => s.characters)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

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
    <Flex vertical>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Header') /* Optimizer options */}</HeaderText>
          <TooltipImage type={Hint.optimizerOptions()} />
        </Flex>

        <Flex align='center'>
          <Form.Item name='includeEquippedRelics' valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>{t('AllowEquipped') /* Allow equipped relics */}</Text>
        </Flex>

        <Flex align='center'>
          <Form.Item name='rankFilter' valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>{t('PriorityFilter') /* Character priority filter */}</Text>
        </Flex>

        <Flex align='center'>
          <Form.Item name='keepCurrentRelics' valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>{t('KeepCurrent') /* Keep current relics */}</Text>
        </Flex>

        <Flex gap={optimizerTabDefaultGap} style={{ marginTop: 10 }}>
          <Flex vertical gap={2}>
            <HeaderText>
              {t('Priority.Header') /* Priority */}
            </HeaderText>
            <Form.Item name='rank'>
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={characterPriorityOptions}
                popupMatchSelectWidth={225}
                listHeight={500}
                optionLabelProp='name'
                placeholder={t('Priority.Header') /* Priority */}
                showSearch
                filterOption={Utils.nameFilterOption}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap={2}>
            <HeaderText>
              {t('Exclude') /* Exclude */}
            </HeaderText>
            <Form.Item name='exclude'>
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                mode='multiple'
                maxTagCount='responsive'
                popupMatchSelectWidth={250}
                listHeight={500}
                allowClear
                showSearch
                optionLabelProp='title'
                placeholder={t('Exclude') /* Exclude */}
                options={characterExcludeOptions}
                filterOption={Utils.titleFilterOption}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify='space-between'>
          <Flex vertical gap={2}>
            <HeaderText>
              {t('MinEnhance.Header') /* Min enhance */}
            </HeaderText>
            <Form.Item name='enhance'>
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={[
                  { value: 0, label: t('MinEnhance.Label0') }, // '+0'
                  { value: 3, label: t('MinEnhance.Label3') }, // '+3'
                  { value: 6, label: t('MinEnhance.Label6') }, // '+6'
                  { value: 9, label: t('MinEnhance.Label9') }, // '+9'
                  { value: 12, label: t('MinEnhance.Label12') }, // '+12'
                  { value: 15, label: t('MinEnhance.Label15') }, // '+15'
                ]}
              />
            </Form.Item>
          </Flex>

          <Flex vertical gap={2}>
            <HeaderText>
              {t('MinRarity.Header') /* Min rarity */}
            </HeaderText>
            <Form.Item name='grade'>
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={[
                  { value: 2, label: t('MinRarity.Label2') }, // '2 ★ +'
                  { value: 3, label: t('MinRarity.Label3') }, // '3 ★ +'
                  { value: 4, label: t('MinRarity.Label4') }, // '4 ★ +'
                  { value: 5, label: t('MinRarity.Label5') }, // '5 ★'
                ]}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify='space-between' align='center'>
          <Flex vertical gap={2}>
            <HeaderText>
              {t('BoostMain.Header') /* Boost main stat */}
            </HeaderText>
            <Form.Item name='mainStatUpscaleLevel'>
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={[
                  { value: 0, label: t('BoostMain.Label0') }, // '+0'
                  { value: 3, label: t('BoostMain.Label3') }, // '+3'
                  { value: 6, label: t('BoostMain.Label6') }, // '+6'
                  { value: 9, label: t('BoostMain.Label9') }, // '+9'
                  { value: 12, label: t('BoostMain.Label12') }, // '+12'
                  { value: 15, label: t('BoostMain.Label15') }, // '+15'
                ]}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex align='center' style={{ marginTop: 15 }}>
          <Flex vertical gap={2} style={{ width: '100%' }}>
            <HeaderText>
              {t('DPSMode.Header') /* DPS Mode */}
            </HeaderText>
            <Form.Item name='deprioritizeBuffs'>
              <Radio.Group
                size='small'
                optionType='button'
                buttonStyle='solid'
                style={{ width: '100%', display: 'flex' }}
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
            </Form.Item>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default OptimizerOptionsDisplay
