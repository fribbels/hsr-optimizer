import { StatSimulationOptions } from "components/optimizerTab/optimizerForm/DamageCalculatorDisplay";
import { Utils } from "lib/utils";

export function saveStatSimulationBuild() {
  const form = window.optimizerForm.getFieldsValue()
  console.debug(form.statSim);

  const simType = window.store.getState().statSimulationDisplay

  // Check for invalid button presses
  if (simType == StatSimulationOptions.Disabled || !form.statSim || !form.statSim[simType]) {
    console.warn('Invalid sim', form, simType)
    return
  }

  const simRequest = form.statSim[simType]
  console.debug(simRequest)
  // TODO: Validate request

  const existingSimulations = form.statSim.simulations || []
  const simulation = {
    name: Math.random(),
    key: Math.random(),
    simType: simType,
    request: simRequest,
  }
  existingSimulations.push(simulation)

  window.store.getState().setStatSimulations(Utils.clone(existingSimulations))
}