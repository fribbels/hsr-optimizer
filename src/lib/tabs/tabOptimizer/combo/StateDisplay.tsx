import { Divider, Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { ComboHeader } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { SetDisplayRows } from 'lib/tabs/tabOptimizer/combo/SetDisplays'
import { SetSelectors } from 'lib/tabs/tabOptimizer/combo/SetSelectors'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { useTranslation } from 'react-i18next'

function GroupDivider({ text }: { text: string }) {
  return <Divider label={text} labelPosition='center' />
}

export function StateDisplay() {
  const actionCount = useComboDrawerStore((s) => s.comboTurnAbilities.length)
  const hasCharacter = useComboDrawerStore((s) => s.comboCharacter !== null)
  const hasTeammate0 = useComboDrawerStore((s) => s.comboTeammate0 !== null)
  const hasTeammate1 = useComboDrawerStore((s) => s.comboTeammate1 !== null)
  const hasTeammate2 = useComboDrawerStore((s) => s.comboTeammate2 !== null)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  return (
    <Flex direction="column" gap={8}>
      <Flex style={{ position: 'sticky', backgroundColor: 'var(--layer-2)', top: 0, zIndex: 10, paddingTop: 6, paddingBottom: 6 }} align='center'>
        <ComboHeader />
      </Flex>

      {hasCharacter && (
        <>
          <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboCharacter' />
          <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboCharacterLightCone' />
          <GroupDivider text={t('GroupHeaders.Sets')} />
          <SetSelectors />
          <SetDisplayRows actionCount={actionCount} />
        </>
      )}

      {hasTeammate0 && (
        <>
          <GroupDivider text={t('GroupHeaders.Teammate1')} />
          <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate0' />
          <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate0LightCone' />
          <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate0RelicSet' />
          <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate0OrnamentSet' />
        </>
      )}

      {hasTeammate1 && (
        <>
          <GroupDivider text={t('GroupHeaders.Teammate2')} />
          <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate1' />
          <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate1LightCone' />
          <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate1RelicSet' />
          <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate1OrnamentSet' />
        </>
      )}

      {hasTeammate2 && (
        <>
          <GroupDivider text={t('GroupHeaders.Teammate3')} />
          <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate2' />
          <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate2LightCone' />
          <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate2RelicSet' />
          <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate2OrnamentSet' />
        </>
      )}
    </Flex>
  )
}
