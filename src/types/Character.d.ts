import { HSRId } from "./Common";


export type Eidolon = 0 | 1 | 2 | 3 | 4 | 5 | 6;


export type Character = {
  id: HSRId;
  name: string;  // "Dan Heng"
  tag: string; // "danheng"
  rarity: number; // 4
  path: string;
  element: string;
  max_sp: number;
  ranks: string[];
  skills: string[];
  skill_trees: string[];
  icon: string;
  preview: string;
  portrait: string;

  equipped: [];
};