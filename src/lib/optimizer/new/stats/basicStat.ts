export type BasicStats = {
  hp: number
  atk: number
  def: number
  speed: number
}

function zero(): BasicStats {
  return {
    atk: 0,
    def: 0,
    hp: 0,
    speed: 0,
  }
}

export class BasicPercentageStats {
  static copy(other: BasicPercentageStats) {
    return new BasicPercentageStats(
      other.lv,
      { ...other.base },
      { ...other.flat },
      { ...other.percent },
    )
  }

  constructor(
    readonly lv: number,
    readonly base: Readonly<BasicStats>,
    public flat: BasicStats = zero(),
    public percent: BasicStats = zero(),
  ) {}

  // I wish we have macros like Cxx
  public get atk(): number {
    return this.base.atk * (1 + this.percent.atk) + this.flat.atk
  }

  public get def(): number {
    return this.base.def * (1 + this.percent.def) + this.flat.def
  }

  public get hp(): number {
    return this.base.hp * (1 + this.percent.hp) + this.flat.hp
  }

  public get speed(): number {
    return this.base.speed * (1 + this.percent.speed) + this.flat.speed
  }
}
