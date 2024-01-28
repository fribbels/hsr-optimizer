import { StatsValues } from "lib/constants";
import { AssetRelativeUrl, ExternalPath, InternalPath, Promotions, Rarity } from "./Common";

export type SuperImpositionLevel = 1 | 2 | 3 | 4 | 5;
export type SuperImposition = {
  [K in StatsValues]: SuperImpositionLevel;
};

export type LightCone = {
  desc: string;
  icon: AssetRelativeUrl;
  id: number;
  name: string;
  path: InternalPath | ExternalPath;
  portrait: AssetRelativeUrl;
  preview: AssetRelativeUrl;
  promotions: Promotions
  rarity: Rarity;
  superimpositions: { [key: number]: SuperImposition };
};