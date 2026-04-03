import { Divider, Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { SetDisplayRows } from 'lib/tabs/tabOptimizer/combo/SetDisplays'
import { SetSelectors } from 'lib/tabs/tabOptimizer/combo/SetSelectors'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { DeferCreate, DeferCreateProvider } from 'lib/ui/DeferredRender'
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
    <DeferCreateProvider resetKey={0} batchSize={1}>
      <Flex direction="column" gap={8}>
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
            <DeferCreate>
              <GroupDivider text={t('GroupHeaders.Teammate1')} />
              <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate0' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate0LightCone' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate0RelicSet' />
              <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate0OrnamentSet' />
            </DeferCreate>
          </>
        )}

        {hasTeammate1 && (
          <>
            <DeferCreate>
              <GroupDivider text={t('GroupHeaders.Teammate2')} />
              <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate1' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate1LightCone' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate1RelicSet' />
              <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate1OrnamentSet' />
            </DeferCreate>
          </>
        )}

        {hasTeammate2 && (
          <>
            <DeferCreate>
              <GroupDivider text={t('GroupHeaders.Teammate3')} />
              <ComboConditionalsGroupRow conditionalType='character' actionCount={actionCount} originKey='comboTeammate2' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='lightCone' actionCount={actionCount} originKey='comboTeammate2LightCone' />
            </DeferCreate>
            <DeferCreate>
              <ComboConditionalsGroupRow conditionalType='relicSet' actionCount={actionCount} originKey='comboTeammate2RelicSet' />
              <ComboConditionalsGroupRow conditionalType='ornamentSet' actionCount={actionCount} originKey='comboTeammate2OrnamentSet' />
            </DeferCreate>
          </>
        )}
      </Flex>
    </DeferCreateProvider>
  )
}
