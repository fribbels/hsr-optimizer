import { Flex } from 'antd'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'

export const Hint = {
  ratingFilters: () => {
    return {
      title: i18next.t('hint:ratingfilter.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'ratingfilter' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
          </Flex>
        )
      })(),
    }
  },

  combatBuffs: () => {
    return {
      title: i18next.t('hint:combatbuffs.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'combatbuffs' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
          </Flex>
        )
      })(),
    }
  },

  statFilters: () => {
    return {
      title: i18next.t('hint:statfilters.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'statfilters' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
          </Flex>
        )
      })(),
    }
  },

  mainStats: () => {
    return {
      title: i18next.t('hint:mainstats.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'mainstats' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
          </Flex>
        )
      })(),
    }
  },

  sets: () => {
    return {
      title: i18next.t('hint:sets.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'sets' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
          </Flex>
        )
      })(),
    }
  },

  character: () => {
    return {
      title: i18next.t('hint:character.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'character' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
          </Flex>
        )
      })(),
    }
  },

  characterPassives: () => {
    return {
      title: i18next.t('hint:characterpassives.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'characterpassives' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
          </Flex>
        )
      })(),
    }
  },

  lightConePassives: () => {
    return {
      title: i18next.t('hint:lightconepassives.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'lightconepassives' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
          </Flex>
        )
      })(),
    }
  },

  lightCone: () => {
    return {
      title: i18next.t('hint:lightcone.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'lightcone' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
          </Flex>
        )
      })(),
    }
  },

  actions: () => {
    return {
      title: i18next.t('hint:actions.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'actions' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
          </Flex>
        )
      })(),
    }
  },

  optimizerOptions: () => {
    return {
      title: i18next.t('hint:optimizeroptions.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'optimizeroptions' })
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
      title: i18next.t('hint:relics.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'relics' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
            <p>{t('p5')}</p>
          </Flex>
        )
      })(),
    }
  },

  optimizationDetails: () => {
    return {
      title: i18next.t('hint:optimizationdetails.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'optimizationdetails' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
          </Flex>
        )
      })(),
    }
  },

  enemyOptions: () => {
    return {
      title: i18next.t('hint:enemyoptions.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'enemyoptions' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
            <p>{t('p5')}</p>
            <p>{t('p6')}</p>
          </Flex>
        )
      })(),
    }
  },

  substatWeightFilter: () => {
    return {
      title: i18next.t('hint:substatweightfilter.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'substatweightfilter' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
          </Flex>
        )
      })(),
    }
  },

  statDisplay: () => {
    return {
      title: i18next.t('hint:statdisplay.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'statdisplay' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
            <p>{t('p3')}</p>
          </Flex>
        )
      })(),
    }
  },

  valueColumns: () => {
    return {
      title: i18next.t('hint:valuecolumns.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'valuecolumns' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p><b>{t('p2')}</b></p>
            <p>{t('p3')}</p>
            <p>{t('p4')}</p>
            <p>{t('p5')}</p>
            <p><b>{t('p6')}</b></p>
            <p>{t('p7')}</p>
            <p>{t('p8')}</p>
            <p>{t('p9')}</p>
            <p>{t('p10')}</p>
          </Flex>
        )
      })(),
    }
  },

  relicInsight: () => {
    return {
      title: i18next.t('hint:relicinsights.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'relicinsights' })
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
      title: i18next.t('hint:reliclocation.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'reliclocation' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>

            <Flex vertical>
              <div>{t('p3')}</div>
              <ul>
                <li>{t('p4')}</li>
                <li>{t('p5')}</li>
                <li>{t('p6')}</li>
              </ul>
            </Flex>
          </Flex>
        )
      })(),
    }
  },

  locatorParams: () => {
    return {
      title: i18next.t('hint:locatorparams.title'),
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'locatorparams' })
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
