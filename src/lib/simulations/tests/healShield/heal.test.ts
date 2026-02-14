// import { Sets, Stats } from "lib/constants/constants";
// import { Key } from "lib/optimization/computedStatsArray";
// import { SimulationRelicByPart } from "lib/simulations/statSimulationTypes";
// import { generateFullDefaultForm } from "lib/simulations/utils/benchmarkForm";
// import { OptimizerTabController } from "lib/tabs/tabOptimizer/optimizerTabController";
// import { expect, test } from "vitest";
// import { GALLAGHER, MULTIPLICATION } from "../testMetadataConstants";
// import { generateContext } from "lib/optimization/context/calculateContext";
// import { simulateBuild } from "lib/simulations/simulateBuild";
// import { Metadata } from "lib/state/metadata";
// import { StatCalculator } from "lib/relics/statCalculator";

import { test } from 'vitest'
test.skip('Gallagher healing - temporarily disabled', () => {})

// const TIMEOUT = 60000

// test('Gallagher healing', async () => {
//   Metadata.initialize();

//   const relics = {
//     Head: {
//       set: Sets.WarriorGoddessOfSunAndThunder,
//       condensedStats: [
//         [Key.BE, 0.181]
//       ]
//     },
//     Hands: {
//       set: Sets.WarriorGoddessOfSunAndThunder,
//       condensedStats: []
//     },
//     Body: {
//       set: Sets.WarriorGoddessOfSunAndThunder,
//       condensedStats: [
//         [Key.BE, 0.116],
//         [Key.OHB, StatCalculator.getMaxedStatValue(Stats.OHB)],
//       ]
//     },
//     Feet: {
//       set: Sets.WarriorGoddessOfSunAndThunder,
//       condensedStats: [
//         [Key.BE, 0.233],
//         [Key.SPD, 25],
//       ]
//     },
//     PlanarSphere: {
//       set: Sets.GiantTreeOfRaptBrooding,
//       condensedStats: []
//     },
//     LinkRope: {
//       set: Sets.GiantTreeOfRaptBrooding,
//       condensedStats: []
//     },
//   } as SimulationRelicByPart;

//   const request = OptimizerTabController.displayToForm(generateFullDefaultForm(GALLAGHER, MULTIPLICATION, 5, 1));
//   const context = generateContext(request);
//   const { x } = simulateBuild(relics, context, null, null);

//   // 707.2 * (1 + 0.34561 + (0.663 / 2) + 0.12)
//   expect(x.a[Key.HEAL_VALUE]).toBeCloseTo(1270.916192, 3);
// }, TIMEOUT);
