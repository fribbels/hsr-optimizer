import { Flex } from '@mantine/core'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { OpenCloseIDs } from 'lib/hooks/useOpenClose'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import { AdvancedOptionsPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/AdvancedOptionsPanel'
import CharacterSelectorDisplay from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay'
import { CombatBuffsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/CombatBuffsDrawer'
import { ComboFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/ComboFilter'
import { EnemyConfigurationsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/EnemyConfigurationsDrawer'
import { FormSetConditionals } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals'
import OptimizerOptionsDisplay from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerOptionsDisplay'
import { OptimizerTabCharacterPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import RelicMainSetFilters from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicMainSetFilters'
import {
  MinMaxRatingFilters,
  MinMaxStatFilters,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/ResultFilters'
import { StatSimulationDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { SubstatWeightFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/SubstatWeightFilters'
import TeammateCard from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard'
import FilterContainer from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  FormRow,
  OptimizerMenuIds,
  TeammateFormRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Utils } from 'lib/utils/utils'
import { useEffect, useMemo } from 'react'
import { DBMetadata } from 'types/metadata'

export default function OptimizerForm() {
  console.log('======================================================================= RENDER OptimizerForm')

  // On first load, load from last session, else display the first character from the roster
  useEffect(() => {
    const characters = DB.getCharacters() || []
    const savedSessionCharacterId = window.store.getState().savedSession[SavedSessionKeys.optimizerCharacterId]
    OptimizerTabController.updateCharacter(savedSessionCharacterId ?? characters[0]?.id)
  }, [])

  const dbMetadata = useMemo(() => DB.getMetadata(), [])

  return (
    <div style={{ position: 'relative' }}>
      <FormSetConditionals id={OpenCloseIDs.OPTIMIZER_SETS_DRAWER} />

      <FilterContainer>
        <FormRow id={OptimizerMenuIds.characterOptions}>
          <FormCard style={{ overflow: 'hidden', padding: 'none' }} size='narrow'>
            <OptimizerTabCharacterPanel />
          </FormCard>

          <FormCard>
            <CharacterSelectorDisplay />
          </FormCard>

          <FormCard>
            <CharacterConditionalDisplayWrapper />
          </FormCard>

          <FormCard justify='space-between'>
            <LightConeConditionalDisplayWrapper metadata={dbMetadata} />
          </FormCard>

          <FormCard>
            <OptimizerOptionsDisplay />
          </FormCard>
        </FormRow>

        <FormRow id={OptimizerMenuIds.relicAndStatFilters}>
          <FormCard>
            <RelicMainSetFilters />
          </FormCard>

          <FormCard>
            <SubstatWeightFilters />
          </FormCard>

          <FormCard>
            <MinMaxStatFilters />
          </FormCard>

          <FormCard>
            <MinMaxRatingFilters />
          </FormCard>

          <FormCard>
            <ComboFilters />
            <CombatBuffsDrawer />
            <EnemyConfigurationsDrawer />
          </FormCard>
        </FormRow>

        <TeammateFormRow id={OptimizerMenuIds.teammates}>
          <TeammateCard index={0} dbMetadata={dbMetadata} />
          <TeammateCard index={1} dbMetadata={dbMetadata} />
          <TeammateCard index={2} dbMetadata={dbMetadata} />
        </TeammateFormRow>

        <FormRow id={OptimizerMenuIds.characterStatsSimulation}>
          <StatSimulationDisplay />
        </FormRow>
      </FilterContainer>
    </div>
  )
}

// Wrap these and use local state to limit rerenders
function CharacterConditionalDisplayWrapper() {
  const charId = useOptimizerFormStore((s) => s.characterId)
  const eidolon = useOptimizerFormStore((s) => s.characterEidolon)

  return (
    <CharacterConditionalsDisplay
      id={charId}
      eidolon={eidolon}
    />
  )
}

function LightConeConditionalDisplayWrapper(props: { metadata: DBMetadata }) {
  const { metadata } = props
  const lcId = useOptimizerFormStore((s) => s.lightCone)
  const superimposition = useOptimizerFormStore((s) => s.lightConeSuperimposition)
  const charId = useOptimizerFormStore((s) => s.characterId)

  // Hook into light cone changes to set defaults
  useEffect(() => {
    const conditionalResolverMetadata = generateConditionalResolverMetadata({
      characterId: charId!,
      characterEidolon: 0, // Assuming eidolon is not needed for light cone metadata
      lightCone: lcId!,
      lightConeSuperimposition: superimposition,
    }, metadata)
    const controller = LightConeConditionalsResolver.get(conditionalResolverMetadata)
    const defaults = controller.defaults()
    const lightConeForm = DB.getCharacterById(charId!)?.form.lightConeConditionals || {}
    Utils.mergeDefinedValues(defaults, lightConeForm)

    useOptimizerFormStore.getState().setLightConeConditionals(defaults)
  }, [lcId, superimposition, charId])

  return (
    <Flex direction="column" justify='space-between' style={{ height: '100%', marginBottom: 8 }}>
      <LightConeConditionalDisplay
        id={lcId}
        superImposition={superimposition}
        dbMetadata={metadata}
      />
      <AdvancedOptionsPanel />
    </Flex>
  )
}
