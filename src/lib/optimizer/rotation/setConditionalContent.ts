import { Constants, Sets } from 'lib/constants'

export type SelectOptionContent = {
  display: string
  value: number
  label: string
}

export type SetContent = {
  select: boolean
  options: SelectOptionContent[]
}

export function generateSetConditionalContent() {
  const content: { [key: string]: SetContent } = {}

  for (const [setKey, setName] of Object.entries(Constants.Sets)) {
    if (SelectionSets[setName]) {
      content[setName] = SelectionSets[setName]
    } else {
      content[setName] = {
        select: false,
        options: []
      }
    }
  }

  return content
}


export const SelectionSets: { [key: string]: SetContent } = {
  [Sets.ChampionOfStreetwiseBoxing]: SetContentChampionOfStreetwiseBoxing(),
  [Sets.WastelanderOfBanditryDesert]: SetContentWastelanderOfBanditryDesert(),
  [Sets.LongevousDisciple]: SetContentLongevousDisciple(),
  [Sets.TheAshblazingGrandDuke]: SetContentTheAshblazingGrandDuke(),
  [Sets.PrisonerInDeepConfinement]: SetContentPrisonerInDeepConfinement(),
  [Sets.PioneerDiverOfDeadWaters]: SetContentPioneerDiverOfDeadWaters(),
  [Sets.SigoniaTheUnclaimedDesolation]: SetContentSigoniaTheUnclaimedDesolation(),
  [Sets.DuranDynastyOfRunningWolves]: SetContentDuranDynastyOfRunningWolves(),
}

function SetContentChampionOfStreetwiseBoxing() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 5; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${i * 5}% ATK)`,
    })
  }

  return { select: true, options: options }
}

function SetContentWastelanderOfBanditryDesert() {
  return {
    select: true,
    options: [
      {
        display: 'Off',
        value: 0,
        label: 'Off',
      },
      {
        display: 'CR',
        value: 1,
        label: 'Debuffed (+10% CR)',
      },
      {
        display: 'CR+CD',
        value: 2,
        label: 'Imprisoned (+10% CR | +20% CD)',
      },
    ],
  }
}

function SetContentLongevousDisciple() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 2; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${i * 8}% CR)`,
    })
  }

  return { select: true, options: options }
}

function SetContentTheAshblazingGrandDuke() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 8; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${6 * i}% ATK)`,
    })
  }

  return { select: true, options: options }
}

function SetContentPrisonerInDeepConfinement() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 3; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${6 * i}% DEF ignore)`,
    })
  }

  return { select: true, options: options }
}

function SetContentPioneerDiverOfDeadWaters() {
  return {
    select: true,
    options: [
      {
        display: '0x',
        value: -1,
        label: '0 debuffs (+4% base CR)',
      },
      {
        display: '1x',
        value: 0,
        label: '1 debuff (+12% DMG | +4% base CR)',
      },
      {
        display: '2x',
        value: 1,
        label: '2 debuffs (+12% DMG | +4% base CR | +8% CD)',
      },
      {
        display: '3x',
        value: 2,
        label: '3 debuffs (+12% DMG | +4% base CR | +12% CD)',
      },
      {
        display: '2x +',
        value: 3,
        label: '2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)',
      },
      {
        display: '3x +',
        value: 4,
        label: '3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)',
      },
    ]
  }
}

function SetContentSigoniaTheUnclaimedDesolation() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 10; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${4 * i}% CD)`,
    })
  }

  return { select: true, options: options }
}

function SetContentDuranDynastyOfRunningWolves() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 5; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${5 * i}% FUA DMG)`,
    })
  }

  options[5].label = `${5} stacks (+${5 * 5}% FUA DMG + 25% CD)`

  return { select: true, options: options }
}