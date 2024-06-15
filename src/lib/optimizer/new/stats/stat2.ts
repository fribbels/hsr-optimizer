export interface SourceStat {
  
}

/**
 * The result stat of the stat aggregation process. The game only cares about
 * these stat to calculate damage.
 */
export type FinalStat = {
  atk: number
  def: number
  hp: number
  speed: number
  dmgBonus: number
}
