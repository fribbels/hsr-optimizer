import { IconSettings } from '@tabler/icons-react'
import { Button, Flex, MultiSelect } from '@mantine/core'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { MainStatPart } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOrnamentsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { RelicSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetTagRenderer'
import {
  decodeRelicSetValue,
  encodeRelicSetValue,
  GenerateSetsGroupedOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useOverflowPills } from 'lib/hooks/useOverflowPills'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './RelicMainSetFilters.module.css'

function handleMainStatChange(field: MainStatPart, val: string[]) {
  useOptimizerRequestStore.getState().setMainStats(field, val)
  recalculatePermutations()
}

export function RelicMainSetFilters() {
  const { t } = useTranslation(['optimizerTab', 'common'])

  const mainBody = useOptimizerRequestStore((s) => s.mainBody)
  const mainFeet = useOptimizerRequestStore((s) => s.mainFeet)
  const mainPlanarSphere = useOptimizerRequestStore((s) => s.mainPlanarSphere)
  const mainLinkRope = useOptimizerRequestStore((s) => s.mainLinkRope)
  const relicSets = useOptimizerRequestStore((s) => s.relicSets)
  const ornamentSets = useOptimizerRequestStore((s) => s.ornamentSets)

  // Convert relicSets (array of tuples) to encoded string values for MultiSelect
  const relicSetsValue = useMemo(
    () => (relicSets ?? []).map((tuple) => encodeRelicSetValue(tuple)),
    [relicSets],
  )

  const renderBodyPills = useOverflowPills(mainBody, 3)
  const renderFeetPills = useOverflowPills(mainFeet, 3)
  const renderSpherePills = useOverflowPills(mainPlanarSphere, 3)
  const renderRopePills = useOverflowPills(mainLinkRope, 3)
  const renderRelicSetPills = useOverflowPills(relicSetsValue, 1)
  const renderOrnamentPills = useOverflowPills(ornamentSets, 1)

  const setsGroupedOptions = useMemo(() => GenerateSetsGroupedOptions(), [t])
  const ornamentOptions = useOrnamentsOptions()

  return (
    <Flex direction="column" gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('MainStats') /* Main stats */}</HeaderText>
        <TooltipImage type={Hint.mainStats()} />
      </Flex>
      <Flex direction="column" gap={7}>
        <MultiSelect
          clearable
          style={{
            width: panelWidth,
          }}
          placeholder={t('common:Parts.Body')}
          rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.Body)} />}
          value={mainBody}
          onChange={(val) => handleMainStatChange('mainBody', val)}
          renderPill={renderBodyPills}
          data={[
            { value: Constants.Stats.HP_P, label: t('common:ShortStats.HP%') },
            { value: Constants.Stats.ATK_P, label: t('common:ShortStats.ATK%') },
            { value: Constants.Stats.DEF_P, label: t('common:ShortStats.DEF%') },
            { value: Constants.Stats.CR, label: t('common:ShortStats.CRIT Rate') },
            { value: Constants.Stats.CD, label: t('common:ShortStats.CRIT DMG') },
            { value: Constants.Stats.EHR, label: t('common:ShortStats.Effect Hit Rate') },
            { value: Constants.Stats.OHB, label: t('common:ShortStats.Outgoing Healing Boost') },
          ]}
        />

        <MultiSelect
          clearable
          style={{
            width: panelWidth,
          }}
          placeholder={t('common:Parts.Feet')}
          rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.Feet)} />}
          value={mainFeet}
          onChange={(val) => handleMainStatChange('mainFeet', val)}
          renderPill={renderFeetPills}
          data={[
            { value: Constants.Stats.HP_P, label: t('common:ShortStats.HP%') },
            { value: Constants.Stats.ATK_P, label: t('common:ShortStats.ATK%') },
            { value: Constants.Stats.DEF_P, label: t('common:ShortStats.DEF%') },
            { value: Constants.Stats.SPD, label: t('common:ShortStats.SPD') },
          ]}
        />

        <MultiSelect
          clearable
          style={{
            width: panelWidth,
          }}
          placeholder={t('common:Parts.PlanarSphere')}
          maxDropdownHeight={400}
          rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.PlanarSphere)} />}
          value={mainPlanarSphere}
          onChange={(val) => handleMainStatChange('mainPlanarSphere', val)}
          renderPill={renderSpherePills}
          data={[
            { value: Constants.Stats.HP_P, label: t('common:ShortStats.HP%') },
            { value: Constants.Stats.ATK_P, label: t('common:ShortStats.ATK%') },
            { value: Constants.Stats.DEF_P, label: t('common:ShortStats.DEF%') },
            { value: Constants.Stats.Physical_DMG, label: t('common:ShortStats.Physical DMG Boost') },
            { value: Constants.Stats.Fire_DMG, label: t('common:ShortStats.Fire DMG Boost') },
            { value: Constants.Stats.Ice_DMG, label: t('common:ShortStats.Ice DMG Boost') },
            { value: Constants.Stats.Lightning_DMG, label: t('common:ShortStats.Lightning DMG Boost') },
            { value: Constants.Stats.Wind_DMG, label: t('common:ShortStats.Wind DMG Boost') },
            { value: Constants.Stats.Quantum_DMG, label: t('common:ShortStats.Quantum DMG Boost') },
            { value: Constants.Stats.Imaginary_DMG, label: t('common:ShortStats.Imaginary DMG Boost') },
          ]}
        />

        <MultiSelect
          clearable
          style={{
            width: panelWidth,
          }}
          placeholder={t('common:Parts.LinkRope')}
          rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.LinkRope)} />}
          value={mainLinkRope}
          onChange={(val) => handleMainStatChange('mainLinkRope', val)}
          renderPill={renderRopePills}
          data={[
            { value: Constants.Stats.HP_P, label: t('common:ShortStats.HP%') },
            { value: Constants.Stats.ATK_P, label: t('common:ShortStats.ATK%') },
            { value: Constants.Stats.DEF_P, label: t('common:ShortStats.DEF%') },
            { value: Constants.Stats.BE, label: t('common:ShortStats.Break Effect') },
            { value: Constants.Stats.ERR, label: t('common:ShortStats.Energy Regeneration Rate') },
          ]}
        />
      </Flex>

      <Flex justify='space-between' align='center' className={classes.setsHeader}>
        <HeaderText>{t('Sets') /* Sets */}</HeaderText>
        <TooltipImage type={Hint.sets()} />
      </Flex>

      <Flex direction="column" gap={7}>
        <MultiSelect
          placeholder={t('RelicSetSelector.Placeholder')}
          data={setsGroupedOptions}
          maxDropdownHeight={400}
          searchable
          clearable
          value={relicSetsValue}
          onChange={(val) => {
            // Convert encoded string values back to tuples for the store
            const decoded = val.map((v) => decodeRelicSetValue(v)) as typeof relicSets
            useOptimizerRequestStore.getState().setRelicSets(decoded)
            recalculatePermutations()
          }}
          renderPill={renderRelicSetPills}
          renderOption={({ option }) => RelicSetTagRenderer(option.value)}
        />

        <MultiSelect
          comboboxProps={{ styles: { dropdown: { width: 250 } } }}
          maxDropdownHeight={800}
          clearable
          style={{
            width: panelWidth,
          }}
          data={ornamentOptions.map((opt) => ({ value: opt.value, label: opt.value }))}
          placeholder={t('OrnamentSetSelector.Placeholder')}
          value={ornamentSets}
          onChange={(val) => {
            useOptimizerRequestStore.getState().setOrnamentSets(val as typeof ornamentSets)
            recalculatePermutations()
          }}
          renderPill={renderOrnamentPills}
        />
        <Button
          variant="default"
          onClick={() => setOpen(OpenCloseIDs.OPTIMIZER_SETS_DRAWER)}
          leftSection={<IconSettings size={16} />}
        >
          {t('SetConditionals.Title') /* Conditional set effects */}
        </Button>
      </Flex>
    </Flex>
  )
}
