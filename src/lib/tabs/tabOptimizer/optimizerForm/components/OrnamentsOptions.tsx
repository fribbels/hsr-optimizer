import { Flex } from '@mantine/core'
import {
  Constants,
  UnreleasedSets,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  SetsOrnamentsNames,
  setToId,
} from 'lib/sets/setConfigRegistry'
import classes from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions.module.css'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function useOrnamentsOptions() {
  const { t } = useTranslation('gameData')
  return useMemo(() => {
    return SetsOrnamentsNames
      .filter((x) => !UnreleasedSets[x])
      .map((x) => ({
        value: x,
        label: (
          <Flex gap={5} align='center'>
            <img src={Assets.getSetImage(x, Constants.Parts.PlanarSphere)} className={classes.icon} />
            <div className={classes.label}>{t(`RelicSets.${setToId[x]}.Name`)}</div>
          </Flex>
        ),
      }))
  }, [t])
}
