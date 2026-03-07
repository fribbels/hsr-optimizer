import {
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  Button,
  Flex,
  Popconfirm,
  Radio,
} from 'antd'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import {
  ComboType,
  getDefaultComboTurnAbilities,
} from 'lib/optimization/rotation/comboStateTransform'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
  TurnAbilityName,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { ComboDrawer } from 'lib/tabs/tabOptimizer/combo/ComboDrawer'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import {
  TurnAbilitySelector,
  TurnAbilitySelectorSimple,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterConditionalsController } from 'types/conditionals'

const radioStyle = {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  paddingInline: 0,
}

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const comboType = useOptimizerFormStore((s) => s.comboType)
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
  const comboOptions = useMemo(() => {
    if (characterId == null || characterEidolon == null) return []

    const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get({
      characterId,
      characterEidolon,
    })

    const actions = characterConditionals.actionDeclaration ? characterConditionals.actionDeclaration() : []

    return actions.map((x) => ({
      label: x,
      value: x,
    }))
  }, [t, characterId, characterEidolon])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header') /* Rotation COMBO formula */}</HeaderText>
        <TooltipImage type={Hint.comboFilters()} />
      </Flex>
      <Radio.Group
        size='small'
        buttonStyle='solid'
        style={{ width: '100%' }}
        value={comboType}
        onChange={(e) => useOptimizerFormStore.getState().setComboType(e.target.value)}
      >
        <Flex align='center'>
          <Radio.Button style={radioStyle} value={ComboType.SIMPLE}>
            {t('ModeSelector.Simple')}
          </Radio.Button>
          <Radio.Button style={radioStyle} value={ComboType.ADVANCED}>
            {t('ModeSelector.Advanced')}
          </Radio.Button>
        </Flex>
      </Radio.Group>

      <ComboBasicDefinition comboOptions={comboOptions} />

      <>
        <Flex vertical gap={8} style={{ marginTop: 8 }}>
          <Button
            onClick={() => setOpen(OpenCloseIDs.COMBO_DRAWER)}
            icon={<SettingOutlined />}
            disabled={comboType == ComboType.SIMPLE}
          >
            {t('RotationButton')}
          </Button>
        </Flex>
        <ComboDrawer />
      </>
    </Flex>
  )
}

function add() {
  const store = useOptimizerFormStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = 1; i <= ABILITY_LIMIT + 2; i++) {
    if (abilities[i] == null) {
      abilities[i] = DEFAULT_BASIC
      break
    }
  }

  useOptimizerFormStore.getState().setComboTurnAbilities(abilities)
}

function minus() {
  const store = useOptimizerFormStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = ABILITY_LIMIT + 2; i > 1; i--) {
    if (abilities[i] != null) {
      abilities.length = i
      break
    }
  }

  useOptimizerFormStore.getState().setComboTurnAbilities(abilities)
}

function resetClicked() {
  const characterId = window.store.getState().optimizerTabFocusCharacter!
  const characterMetadata = DB.getMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboTurnAbilities = characterMetadata.scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]
  const defaultComboDot = characterMetadata.scoringMetadata?.simulation?.comboDot ?? 0

  useOptimizerFormStore.getState().setComboTurnAbilities(defaultComboTurnAbilities)
  useOptimizerFormStore.getState().setComboDot(defaultComboDot)
  useOptimizerFormStore.getState().setComboStateJson('{}')
}

function ComboBasicDefinition(props: { comboOptions: { value: string; label: string }[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const { t: tCommon } = useTranslation('common')
  const comboType = useOptimizerFormStore((s) => s.comboType)
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
  const comboPreprocessor = useOptimizerFormStore((s) => s.comboPreprocessor)
  const comboDot = useOptimizerFormStore((s) => s.comboDot)
  const comboTurnAbilities = useOptimizerFormStore((s) => s.comboTurnAbilities)

  const {
    comboTurnAbilities: defaultComboTurnAbilities,
    comboDot: defaultComboDot,
  } = getDefaultComboTurnAbilities(characterId!, characterEidolon)

  const disabled = comboType == ComboType.SIMPLE

  return (
    <Flex style={{ height: 275 }}>
      <Flex vertical flex={1} style={{ marginLeft: 2 }} gap={3}>
        <HeaderText>{t('AbilityLabel') /* Abilities */}</HeaderText>

        <Flex vertical flex={1} style={{ marginLeft: 2, display: comboType == ComboType.ADVANCED ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
            <ComboOptionRowSelect
              key={i + 1}
              index={i + 1}
              comboOptions={props.comboOptions}
              disabled={disabled}
            />
          ))}
        </Flex>

        <Flex vertical flex={1} style={{ marginLeft: 2, display: comboType == ComboType.SIMPLE ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => <TurnAbilitySelectorSimple key={i + 1} value={defaultComboTurnAbilities[i + 1]} index={i + 1} />)}
        </Flex>
      </Flex>

      <VerticalDivider width={10} />

      <Flex vertical gap={20} flex={1} align='flex-start'>
        <Flex vertical style={{ width: '100%' }} gap={5}>
          <HeaderText>{t('RowControls.Header') /* Controls */}</HeaderText>
          <Popconfirm
            title={tCommon('Confirm')}
            description={t('RowControls.ResetConfirm.Description')}
            onConfirm={() => resetClicked()}
            okText={tCommon('Yes')}
            cancelText={tCommon('Cancel')}
            placement='bottomRight'
          >
            <Button size='small' variant='outlined' disabled={disabled}>
              {tCommon('Reset')}
            </Button>
          </Popconfirm>
          <Flex gap={5}>
            <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => add()} disabled={disabled}>
              {t('RowControls.Add')}
            </Button>
            <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => minus()} disabled={disabled}>
              {t('RowControls.Remove')}
            </Button>
          </Flex>
        </Flex>

        <Flex vertical style={{ width: '100%' }} gap={5}>
          <HeaderText>{t('RowControls.PresetsHeader') /*Presets*/}</HeaderText>
          <Radio.Group
            buttonStyle='solid'
            block
            size='small'
            disabled={disabled}
            value={comboPreprocessor}
            onChange={(e) => useOptimizerFormStore.getState().setComboPreprocessor(e.target.value)}
          >
            <Radio.Button value={true}>
              <CheckOutlined />
            </Radio.Button>
            <Radio.Button value={false}>
              <CloseOutlined />
            </Radio.Button>
          </Radio.Group>
        </Flex>

        <Flex vertical gap={5}>
          <HeaderText>{t('CounterLabels.Dot')}</HeaderText>
          <NumberXInput disabled={disabled} defaultValue={defaultComboDot} value={comboDot} />
        </Flex>
      </Flex>
    </Flex>
  )
}

function ComboOptionRowSelect(props: { index: number; disabled: boolean; comboOptions: { value: string; label: string }[] }) {
  const comboTurnAbilities = useOptimizerFormStore((s) => s.comboTurnAbilities)
  const shouldRenderSegmented = comboTurnAbilities[props.index] != null || props.index < 2

  return shouldRenderSegmented
    ? <TurnAbilitySelector index={props.index} disabled={props.disabled} />
    : null
}

function NumberXInput(props: {
  disabled: boolean;
  defaultValue?: number;
  value: number;
}) {
  return (
    <InputNumberStyled
      addonBefore='⨯'
      size='small'
      controls={true}
      disabled={props.disabled}
      value={props.disabled ? props.defaultValue : props.value}
      onChange={(val) => {
        if (!props.disabled && val != null) {
          useOptimizerFormStore.getState().setComboDot(val as number)
        }
      }}
      style={{ width: '100%' }}
      rootClassName='comboInputNumber'
    />
  )
}
