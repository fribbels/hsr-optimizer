import { Flex, NumberInput, Text } from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { STAT_SIMULATION_STATS_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { StatInput } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/StatInput'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import { useTranslation } from 'react-i18next'

export function SubstatsSection(props: { simType: StatSimTypes; title: string; total?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  return (
    <>
      <Flex direction="column">
        <HeaderText>{props.title}</HeaderText>
        <Flex direction="column" gap={5}>
          <StatInput simType={props.simType} name={Stats.ATK_P} label={t('SubstatSelectorLabel', { stat: Stats.ATK_P })} />
          <StatInput simType={props.simType} name={Stats.ATK} label={t('SubstatSelectorLabel', { stat: Stats.ATK })} />
          <StatInput simType={props.simType} name={Stats.CR} label={t('SubstatSelectorLabel', { stat: Stats.CR })} />
          <StatInput simType={props.simType} name={Stats.CD} label={t('SubstatSelectorLabel', { stat: Stats.CD })} />
          <StatInput simType={props.simType} name={Stats.SPD} label={t('SubstatSelectorLabel', { stat: Stats.SPD })} />
          <StatInput simType={props.simType} name={Stats.BE} label={t('SubstatSelectorLabel', { stat: Stats.BE })} />
          <StatInput simType={props.simType} name={Stats.HP_P} label={t('SubstatSelectorLabel', { stat: Stats.HP_P })} />
          <StatInput simType={props.simType} name={Stats.HP} label={t('SubstatSelectorLabel', { stat: Stats.HP })} />
          <StatInput simType={props.simType} name={Stats.DEF_P} label={t('SubstatSelectorLabel', { stat: Stats.DEF_P })} />
          <StatInput simType={props.simType} name={Stats.DEF} label={t('SubstatSelectorLabel', { stat: Stats.DEF })} />
          <StatInput simType={props.simType} name={Stats.EHR} label={t('SubstatSelectorLabel', { stat: Stats.EHR })} />
          <StatInput simType={props.simType} name={Stats.RES} label={t('SubstatSelectorLabel', { stat: Stats.RES })} />
          {(props.simType == StatSimTypes.SubstatRolls) && (
            <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
              <Text>
                {t('TotalRolls')}
              </Text>
              <NumberInput
                size='sm'
                hideControls
                disabled={true}
                value={Utils.truncate10ths(props.total)}
                variant='unstyled'
                max={54}
                error={props.total! > 54 ? true : undefined}
                style={{ width: 70 }}
                suffix=' / 54'
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}
