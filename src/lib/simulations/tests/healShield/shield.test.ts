import { Sets } from "lib/constants/constants";
import { Key } from "lib/optimization/computedStatsArray";
import { SimulationRelicByPart } from "lib/simulations/statSimulationTypes";
import { generateFullDefaultForm } from "lib/simulations/utils/benchmarkForm";
import { OptimizerTabController } from "lib/tabs/tabOptimizer/optimizerTabController";
import { expect, test } from "vitest";
import { MARCH_7TH, MULTIPLICATION } from "../testMetadataConstants";
import { generateContext } from "lib/optimization/context/calculateContext";
import { simulateBuild } from "lib/simulations/simulateBuild";
import { Metadata } from "lib/state/metadata";

const TIMEOUT = 60000

test('March 7th shield', async () => {
  Metadata.initialize();

  const relics = {
	Head: {
	  set: Sets.KnightOfPurityPalace,
	  condensedStats: []
	},
	Hands: {
	  set: Sets.KnightOfPurityPalace,
	  condensedStats: []
	},
	Body: {
	  set: Sets.KnightOfPurityPalace,
	  condensedStats: []
	},
	Feet: {
	  set: Sets.KnightOfPurityPalace,
	  condensedStats: []
	},
	PlanarSphere: {
	  set: Sets.LushakaTheSunkenSeas,
	  condensedStats: []
	},
	LinkRope: {
	  set: Sets.LushakaTheSunkenSeas,
	  condensedStats: []
	},
  } as SimulationRelicByPart;

  const request = OptimizerTabController.displayToForm(generateFullDefaultForm(MARCH_7TH, MULTIPLICATION, 0, 1));
  const context = generateContext(request);
  const x = simulateBuild(relics, context, null, null);

  console.log(x.a[Key.DEF], x.a[Key.SHIELD_SCALING], x.a[Key.SHIELD_FLAT], x.a[Key.SHIELD_BOOST]);

  // (1061.156 * 0.57 + 760) * (1 + 0.20)
  expect(x.a[Key.SHIELD_VALUE]).toBeCloseTo(1637.830704, 3);
}, TIMEOUT);
