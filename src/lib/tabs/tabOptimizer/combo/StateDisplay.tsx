import { Divider, Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { ComboHeader } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { SetDisplays } from 'lib/tabs/tabOptimizer/combo/SetDisplays'
import { SetSelectors } from 'lib/tabs/tabOptimizer/combo/SetSelectors'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useTranslation } from 'react-i18next'

function GroupDivider(props: {
  text: string
}) {
  return (
    <Divider label={props.text} labelPosition='center' />
  )
}

export function StateDisplay(props: {
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const comboCharacter = props.comboState?.comboCharacter
  const comboTeammate0 = props.comboState?.comboTeammate0
  const comboTeammate1 = props.comboState?.comboTeammate1
  const comboTeammate2 = props.comboState?.comboTeammate2
  const actionCount = props.comboState?.comboTurnAbilities?.length || 0
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  return (
    <Flex direction="column" gap={8}>
      <Flex
        style={{
          position: 'sticky',
          backgroundColor: '#2A3C64',
          top: 0,
          zIndex: 10,
          paddingTop: 6,
          paddingBottom: 6,
        }}
        align='center'
      >
        <ComboHeader comboState={props.comboState} onComboStateChange={props.onComboStateChange} />
      </Flex>

      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboCharacter'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboCharacterLightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Sets') /* 'Relic / Ornament set conditionals' */} />
      <SetSelectors comboOrigin={comboCharacter} comboState={props.comboState} onComboStateChange={props.onComboStateChange} />
      <SetDisplays
        comboOrigin={comboCharacter}
        conditionalType='relicSets'
        actionCount={actionCount}
        originKey='comboCharacterRelicSets'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate1') /* 'Teammate 1 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate0'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate2') /* 'Teammate 2 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate1'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate3') /* 'Teammate 3 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate2'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    </Flex>
  )
}
