import { ConditionalBuff } from './CharacterConditional';
import { DataMineId } from './Common';

export type ConditionalLightConeMap = {
  [key in ConditionalBuff]: number;
};

export type LightConeRanksDescriptions = string;

export type LightConeRawRank = {
  id: DataMineId;
  skill: string;
  desc: string;
  params: number[][];
  properties: { type: string; value: number }[][];
};