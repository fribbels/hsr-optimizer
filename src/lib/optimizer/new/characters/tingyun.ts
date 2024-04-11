import { Modifiers } from '../stats/modifier'
import { PartialModifiableStats } from '../stats/stat'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type TingyunMetadata = {
  benedictionBuff: boolean
  ultSpdBuff: boolean
  ultDmgBuff: boolean
  teammateAtkBuffValue: number
}

const DEFAULT_METADATA = {
  benedictionBuff: true,
  ultSpdBuff: true,
  ultDmgBuff: true,
  teammateAtkBuffValue: 0.55,
}

export class Tingyun extends Character<TingyunMetadata> {
  private unconditional: PartialModifiableStats[]

  constructor(eid: Eidolon, metadata: TingyunMetadata = DEFAULT_METADATA) {
    super(eid, metadata)
    this.unconditional = []

    if (metadata.benedictionBuff) {
      this.unconditional.push(this.skillAtkBuff())
    }

    if (metadata.ultDmgBuff) {
      this.unconditional.push(this.ultimateDmgBuff())
    }

    if (metadata.ultSpdBuff) {
      this.unconditional.push(this.eidolon1SpdBuff())
    }
  }

  asOptiTarget: CharacterSteps[] = []
  presets: CharacterPreset[] = []
  asTeammate: Modifiers = {
    unconditional: [this.skillAtkBuff(), this.ultimateDmgBuff()],
    early: [],
    late: [],
  }

  private skillAtkBuff(): PartialModifiableStats {
    return { basic: { percent: { atk: this.metadata.teammateAtkBuffValue } } }
  }

  private ultimateDmgBuff(): PartialModifiableStats {
    return { dmgBoost: 0.5 }
  }

  private eidolon1SpdBuff(): PartialModifiableStats {
    return { basic: { percent: { speed: 0.2 } } }
  }
}
