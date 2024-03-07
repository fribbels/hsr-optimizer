import { Form } from 'antd'
import React, { useEffect } from 'react'
import { Optimizer } from 'lib/optimizer/optimizer'
import { Constants } from 'lib/constants.ts'
import { FormRow, OptimizerMenuIds, TeammateFormRow } from 'components/optimizerTab/FormRow.tsx'
import FormCard from 'components/optimizerTab/FormCard'
import OptimizerOptionsDisplay from 'components/optimizerTab/OptimizerOptionsDisplay.tsx'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { SaveState } from 'lib/saveState'
import { FormSetConditionals } from 'components/optimizerTab/FormSetConditionals'
import DB from 'lib/db'
import { Utils } from 'lib/utils.js'
import { CharacterConditionalDisplay } from 'components/optimizerForm/conditionals/CharacterConditionalDisplay'
import { LightConeConditionalDisplay } from 'components/optimizerForm/conditionals/LightConeConditionalDisplay'
import TeammateCard from 'components/optimizerTab/TeammateCard'
import CharacterSelectorDisplay from 'components/optimizerTab/CharacterSelectorDisplay.tsx'
import EnemyOptionsDisplay from 'components/optimizerTab/EnemyOptionsDisplay'
import RelicMainSetFilters from 'components/optimizerTab/RelicMainSetFilters'
import { SubstatWeightFilters } from 'components/optimizerTab/SubstatWeightFilters'
import { MinMaxRatingFilters, MinMaxStatFilters } from 'components/optimizerTab/ResultFilters'
import { CombatBuffsFilters } from 'components/optimizerTab/CombatBuffsFilters'
import { OptimizerTabCharacterPanel } from 'components/optimizerTab/OptimizerTabCharacterPanel'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import FilterContainer from 'components/optimizerTab/FilterContainer.tsx'

export default function OptimizerForm() {
  console.log('======================================================================= RENDER OptimizerForm')
  const [optimizerForm] = Form.useForm()
  window.optimizerForm = optimizerForm

  // On first load, display the first character from the roster
  useEffect(() => {
    let characters = DB.getCharacters() || []
    OptimizerTabController.updateCharacter(characters[0]?.id)
  }, [])

  const onValuesChange = (changedValues, allValues, bypass) => {
    if (!changedValues || !allValues || !allValues.characterId) return
    let keys = Object.keys(changedValues)

    if (bypass) {
      // Only allow certain values to refresh permutations.
      // Sliders should only update at the end of the drag
    } else if (keys.length == 1 && (
      keys[0].startsWith('min')
      || keys[0].startsWith('max')
      || keys[0].startsWith('buff')
      || keys[0].startsWith('weights')
      || keys[0].startsWith('statDisplay')
      || keys[0].startsWith('teammate')
      || keys[0] == 'characterConditionals'
      || keys[0] == 'lightConeConditionals')) {
      return
    }

    const request = allValues
    console.log('@onValuesChange', request, changedValues)

    // Add any new characters to the list only if the user changed any value other than the characterId
    if (!DB.getCharacterById(allValues.characterId) && keys[0] != 'characterId') {
      DB.addFromForm(allValues)
    }

    // If the rank changes, re-order the characters priority list
    if (changedValues.rank != null && DB.getCharacterById(allValues.characterId).rank != allValues.rank) {
      DB.insertCharacter(allValues.characterId, allValues.rank)
      DB.refreshCharacters()
    }

    // Update permutation counts
    const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request, allValues.characterId)
    const permutationDetails = {
      Head: relics.Head.length,
      Hands: relics.Hands.length,
      Body: relics.Body.length,
      Feet: relics.Feet.length,
      PlanarSphere: relics.PlanarSphere.length,
      LinkRope: relics.LinkRope.length,
      HeadTotal: preFilteredRelicsByPart[Constants.Parts.Head].length,
      HandsTotal: preFilteredRelicsByPart[Constants.Parts.Hands].length,
      BodyTotal: preFilteredRelicsByPart[Constants.Parts.Body].length,
      FeetTotal: preFilteredRelicsByPart[Constants.Parts.Feet].length,
      PlanarSphereTotal: preFilteredRelicsByPart[Constants.Parts.PlanarSphere].length,
      LinkRopeTotal: preFilteredRelicsByPart[Constants.Parts.LinkRope].length,
    }
    window.store.getState().setPermutationDetails(permutationDetails)
    window.store.getState().setPermutations(relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length)
  }
  window.onOptimizerFormValuesChange = onValuesChange

  function startClicked() {
    console.log('Start clicked')

    // We dont actually want to submit the form as it would kick off a re-render
    // Intercept the event and just call the optimizer directly
    const form = OptimizerTabController.getForm()

    if (!OptimizerTabController.validateForm(form)) {
      return
    }

    document.getElementById('optimizerGridContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    DB.addFromForm(form)
    SaveState.save()

    let optimizationId = Utils.randomId()
    window.store.getState().setOptimizationId(optimizationId)
    form.optimizationId = optimizationId
    form.statDisplay = window.store.getState().statDisplay

    console.log('Form finished', form)

    window.store.getState().setOptimizationInProgress(true)
    Optimizer.optimize(form)
  }
  window.optimizerStartClicked = startClicked

  return (
    <div style={{ position: 'relative' }}>
      <Form
        form={optimizerForm}
        layout="vertical"
        onValuesChange={onValuesChange}
      >
        <FormSetConditionals />

        {/* Row 1 */}

        <FilterContainer>
          <FormRow id={OptimizerMenuIds.characterOptions}>
            <FormCard style={{ overflow: 'hidden' }}>
              <OptimizerTabCharacterPanel />
            </FormCard>

            <FormCard>
              <CharacterSelectorDisplay />
            </FormCard>

            <FormCard>
              <CharacterConditionalDisplayWrapper />
            </FormCard>

            <FormCard justify="space-between">
              <LightConeConditionalDisplayWrapper />

              <EnemyOptionsDisplay />
            </FormCard>

            <FormCard>
              <OptimizerOptionsDisplay />
            </FormCard>
          </FormRow>

          {/* Row 2 */}

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
              <CombatBuffsFilters />
            </FormCard>
          </FormRow>

          {/* Row 3 */}

          <TeammateFormRow id={OptimizerMenuIds.teammates}>
            <TeammateCard index={0} />
            <TeammateCard index={1} />
            <TeammateCard index={2} />
          </TeammateFormRow>
        </FilterContainer>
      </Form>
    </div>
  )
}

// Wrap these and use local state to limit rerenders
function CharacterConditionalDisplayWrapper() {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const optimizerFormCharacterEidolon = window.store((s) => s.optimizerFormCharacterEidolon)

  return (
    <CharacterConditionalDisplay
      id={optimizerTabFocusCharacter}
      eidolon={optimizerFormCharacterEidolon}
    />
  )
}

function LightConeConditionalDisplayWrapper() {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const optimizerFormSelectedLightCone = window.store((s) => s.optimizerFormSelectedLightCone)
  const optimizerFormSelectedLightConeSuperimposition = window.store((s) => s.optimizerFormSelectedLightConeSuperimposition)

  // Hook into light cone changes to set defaults
  useEffect(() => {
    const lcFn = LightConeConditionals.get(window.optimizerForm.getFieldsValue())
    const defaults = lcFn.defaults()
    const lightConeForm = window.optimizerForm.getFieldsValue().lightConeConditionals || {}
    Utils.mergeDefinedValues(defaults, lightConeForm)

    if (optimizerFormSelectedLightCone === '21034') { // Today Is Another Peaceful Day
      defaults.maxEnergyStacks = Math.min(160, DB.getMetadata().characters[optimizerTabFocusCharacter].max_sp)
    }

    console.log('Loaded light cone conditional values', defaults)

    window.optimizerForm.setFieldValue('lightConeConditionals', defaults)
  }, [optimizerTabFocusCharacter, optimizerFormSelectedLightCone, optimizerFormSelectedLightConeSuperimposition])

  return (
    <LightConeConditionalDisplay
      id={optimizerFormSelectedLightCone}
      superImposition={optimizerFormSelectedLightConeSuperimposition}
    />
  )
}
