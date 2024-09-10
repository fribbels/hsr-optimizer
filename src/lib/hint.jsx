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
      title: 'Relic Location',
      content: (
        <Flex vertical gap={10}>
          <p>When a relic is selected in the grid, its position in the ingame inventory is displayed here.</p>
          <p>If the set / part filters are active, apply those same filters ingame, then sort by Date Obtained (newest first) to find the relic.</p>

          <Flex vertical>
            <div>⚠️Usage notes⚠️</div>
            <ul>
              <li>This is only supported with Reliquary Archiver import</li>
              <li>If new relics were deleted or obtained since the last import, they must be re-scanned and imported</li>
              <li>Select the appropriate Inventory width setting to get accurate locations. The width depends on the ingame screen and menu width</li>
            </ul>
          </Flex>
        </Flex>
      ),
    }
  },

  locatorParams: () => {
    return {
      title: 'Relic Locator Options',
      content: (
        <Flex vertical gap={8}>
          <p>
            <strong>Inventory Width</strong>
            {' - '}
            Select the number of columns the inventory has ingame so that the relic locator can find your relic accurately
          </p>
          <p>
            <strong>Auto Filter rows</strong>
            {' - '}
            Maximum number of rows before the relic locator applies a part/set filter to try and bring the searched relic closer to the top of your inventory
          </p>
        </Flex>
      ),
    }
  },
}
