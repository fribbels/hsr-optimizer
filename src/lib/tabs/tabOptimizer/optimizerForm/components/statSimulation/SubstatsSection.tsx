import { Flex } from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import type { StatSimType } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { STAT_SIMULATION_STATS_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { StatInput } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/StatInput'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { HeaderText } from 'lib/ui/HeaderText'
import { useTranslation } from 'react-i18next'
import { truncate10ths } from 'lib/utils/mathUtils'

export function SubstatsSection({ simType, title, total }: { simType: StatSimType; title: string; total?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  return (
    <Flex direction="column">
      <HeaderText>{title}</HeaderText>
      <Flex direction="column" gap={5}>
        <StatInput simType={simType} name={Stats.ATK_P} label={t('SubstatSelectorLabel', { stat: Stats.ATK_P })} />
        <StatInput simType={simType} name={Stats.ATK} label={t('SubstatSelectorLabel', { stat: Stats.ATK })} />
        <StatInput simType={simType} name={Stats.CR} label={t('SubstatSelectorLabel', { stat: Stats.CR })} />
        <StatInput simType={simType} name={Stats.CD} label={t('SubstatSelectorLabel', { stat: Stats.CD })} />
        <StatInput simType={simType} name={Stats.SPD} label={t('SubstatSelectorLabel', { stat: Stats.SPD })} />
        <StatInput simType={simType} name={Stats.BE} label={t('SubstatSelectorLabel', { stat: Stats.BE })} />
        <StatInput simType={simType} name={Stats.HP_P} label={t('SubstatSelectorLabel', { stat: Stats.HP_P })} />
        <StatInput simType={simType} name={Stats.HP} label={t('SubstatSelectorLabel', { stat: Stats.HP })} />
        <StatInput simType={simType} name={Stats.DEF_P} label={t('SubstatSelectorLabel', { stat: Stats.DEF_P })} />
        <StatInput simType={simType} name={Stats.DEF} label={t('SubstatSelectorLabel', { stat: Stats.DEF })} />
        <StatInput simType={simType} name={Stats.EHR} label={t('SubstatSelectorLabel', { stat: Stats.EHR })} />
        <StatInput simType={simType} name={Stats.RES} label={t('SubstatSelectorLabel', { stat: Stats.RES })} />
        {(simType === 'substatRolls') && (
          <Flex justify='space-between' align='center' w={STAT_SIMULATION_STATS_WIDTH}>
            <div>
              {t('TotalRolls')}
            </div>
            <InputNumberStyled
              hideControls
              disabled={true}
              value={truncate10ths(total ?? 0)}
              variant='unstyled'
              max={54}
              error={(total ?? 0) > 54 ? true : undefined}
              style={{ width: 70 }}
              suffix=' / 54'
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
