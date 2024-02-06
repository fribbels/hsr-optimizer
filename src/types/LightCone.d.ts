import { StatsValues } from "lib/constants";
import { AssetRelativeUrl, DataMineId, ExternalPath, InternalPath, Promotions, Rarity } from "./Common";
import { LightConeRanksDescriptions } from "./LightConeConditionals";
import { PreconvertStatKey } from "lib/characterConverter";

export type SuperImpositionLevel = 1 | 2 | 3 | 4 | 5;
export type SuperImposition = {
  [K in StatsValues]: SuperImpositionLevel;
};

export type LightConeRanks = {
  id: DataMineId;
  desc: LightConeRanksDescriptions;
  skill: string;
  params: [number, number, number][];
  properties: [{
    type: PreconvertStatKey;
    value: number;
  }][];
};

export type LightCone = {
  desc: string;
  icon: AssetRelativeUrl;
  id: number;
  name: string;
  path: InternalPath | ExternalPath;
  portrait: AssetRelativeUrl;
  preview: AssetRelativeUrl;
  promotions: Promotions;
  ranks: LightConeRanks;
  rarity: Rarity;
  superimpositions: { [key: number]: SuperImposition };
};