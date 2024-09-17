import { Flex } from 'antd'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'

export const Hint = {
  ratingFilters: () => {
    return {
      title: i18next.t('hint:RatingFilter.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:RatingFilter.p1')}</p>
          <p>{i18next.t('hint:RatingFilter.p2')}</p>
          <p>{i18next.t('hint:RatingFilter.p3')}</p>
        </Flex>
      ),
    }
  },

  combatBuffs: () => {
    return {
      title: i18next.t('hint:CombatBuffs.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:CombatBuffs.p1')}</p>
        </Flex>
      ),
    }
  },

  statFilters: () => {
    return {
      title: i18next.t('hint:StatFilters.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:StatFilters.Tp1')}</p>
          <p>{i18next.t('hint:StatFilters.Tp2')}</p>
          <p>{i18next.t('hint:StatFilters.Tp3')}</p>
        </Flex>
      ),
    }
  },

  mainStats: () => {
    return {
      title: i18next.t('hint:Mainstats.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Mainstats.p1')}</p>
        </Flex>
      ),
    }
  },

  sets: () => {
    return {
      title: i18next.t('hint:Sets.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Sets.p1')}</p>
          <p>{i18next.t('hint:Sets.p2')}</p>
        </Flex>
      ),
    }
  },

  character: () => {
    return {
      title: i18next.t('hint:Character.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Character.p1')}</p>
        </Flex>
      ),
    }
  },

  characterPassives: () => {
    return {
      title: i18next.t('hint:CharacterPassives.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:CharacterPassives.p1')}</p>
          <p>{i18next.t('hint:CharacterPassives.p2')}</p>
        </Flex>
      ),
    }
  },

  lightConePassives: () => {
    return {
      title: i18next.t('hint:LightconePassives.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:LightconePassives.p1')}</p>
          <p>{i18next.t('hint:LightconePassives.p2')}</p>
        </Flex>
      ),
    }
  },

  lightCone: () => {
    return {
      title: i18next.t('hint:Lightcone.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Lightcone.p1')}</p>
          <p>{i18next.t('hint:Lightcone.p2')}</p>
        </Flex>
      ),
    }
  },

  actions: () => {
    return {
      title: i18next.t('hint:Actions.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Actions.p1')}</p>
          <p>{i18next.t('hint:Actions.p2')}</p>
          <p>{i18next.t('hint:Actions.p3')}</p>
          <p>{i18next.t('hint:Actions.p4')}</p>
        </Flex>
      ),
    }
  },

  optimizerOptions: () => {
    return {
      title: i18next.t('hint:OptimizerOptions.Title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'OptimizerOptions' })
        return (
          <Flex vertical gap={10}>
            <p>
              <Trans t={t} i18nKey='p1'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p2'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p3'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p4'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p5'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p6'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p7'>
                <strong></strong>
              </Trans>
            </p>
          </Flex>
        )
      })(),
    }
  },

  relics: () => {
    return {
      title: i18next.t('hint:Relics.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Relics.p1')}</p>
          <p>{i18next.t('hint:Relics.p2')}</p>
          <p>{i18next.t('hint:Relics.p3')}</p>
          <p>{i18next.t('hint:Relics.p4')}</p>
          <p>{i18next.t('hint:Relics.p5')}</p>
        </Flex>
      ),
    }
  },

  optimizationDetails: () => {
    return {
      title: i18next.t('hint:OptimizationDetails.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:OptimizationDetails.p1')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p2')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p3')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p4')}</p>
        </Flex>
      ),
    }
  },

  enemyOptions: () => {
    return {
      title: i18next.t('hint:EnemyOptions.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:EnemyOptions.p1')}</p>
          <p>{i18next.t('hint:EnemyOptions.p2')}</p>
          <p>{i18next.t('hint:EnemyOptions.p3')}</p>
          <p>{i18next.t('hint:EnemyOptions.p4')}</p>
          <p>{i18next.t('hint:EnemyOptions.p5')}</p>
          <p>{i18next.t('hint:EnemyOptions.p6')}</p>
        </Flex>
      ),
    }
  },

  substatWeightFilter: () => {
    return {
      title: i18next.t('hint:SubstatWeightFilter.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:SubstatWeightFilter.p1')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p2')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p3')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p4')}</p>
        </Flex>
      ),
    }
  },

  statDisplay: () => {
    return {
      title: i18next.t('hint:StatDisplay.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:StatDisplay.p1')}</p>
          <p>{i18next.t('hint:StatDisplay.p2')}</p>
          <p>{i18next.t('hint:StatDisplay.p3')}</p>
        </Flex>
      ),
    }
  },

  valueColumns: () => {
    return {
      title: i18next.t('hint:ValueColumns.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:ValueColumns.p1')}</p>
          <p><b>{i18next.t('hint:ValueColumns.p2')}</b></p>
          <p>{i18next.t('hint:ValueColumns.p3')}</p>
          <p>{i18next.t('hint:ValueColumns.p4')}</p>
          <p>{i18next.t('hint:ValueColumns.p5')}</p>
          <p><b>{i18next.t('hint:ValueColumns.p6')}</b></p>
          <p>{i18next.t('hint:ValueColumns.p7')}</p>
          <p>{i18next.t('hint:ValueColumns.p8')}</p>
          <p>{i18next.t('hint:ValueColumns.p9')}</p>
          <p>{i18next.t('hint:ValueColumns.p10')}</p>
        </Flex>
      ),
    }
  },

  relicInsight: () => {
    return {
      title: i18next.t('hint:RelicInsights.Title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'RelicInsights' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>
              <Trans t={t} i18nKey='p2'>
                <br/>
                <br/>
              </Trans>
            </p>
            <p>{t('p3')}</p>
          </Flex>
        )
      })(),
    }
  },

  relicLocation: () => {
    return {
      title: i18next.t('hint:RelicLocation.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:RelicLocation.p1')}</p>
          <p>{i18next.t('hint:RelicLocation.p2')}</p>

          <Flex vertical>
            <div>{i18next.t('hint:RelicLocation.p3')}</div>
            <ul>
              <li>{i18next.t('hint:RelicLocation.p4')}</li>
              <li>{i18next.t('hint:RelicLocation.p5')}</li>
              <li>{i18next.t('hint:RelicLocation.p6')}</li>
            </ul>
          </Flex>
        </Flex>
      ),
    }
  },

  locatorParams: () => {
    return {
      title: i18next.t('hint:LocatorParams.Title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'LocatorParams' })
        return (
          <Flex vertical gap={8}>
            <p>
              <Trans t={t} i18nKey='p1'>
                <strong></strong>
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p2'>
                <strong></strong>
              </Trans>
            </p>
          </Flex>
        )
      })(),
    }
  },
}
