import { InputLocale } from 'lib/i18n/generateTranslations'

export const betaInformation: betaInformation = {
  en_US: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: 'Tribbie',
          LongName: 'Tribbie',
        },
      },
      {
        id: 1404,
        value: {
          Name: 'Mydei',
          LongName: 'Mydei',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: 'If Time Were a Flower',
        },
      },
      {
        id: 23039,
        value: {
          Name: 'Flame of Blood, Blaze My Path',
        },
      },
      {
        id: 24005,
        value: {
          Name: 'The Curtain Never Falls on Memories',
        },
      },
    ],
    RelicSets: [
      {
        id: 319,
        value: {
          Name: "Bone Collection's Serene Demesne",
          Description2pc: "Increases the wearer's Max HP by 12%. When the wearer's Max HP is 5000 or higher, increases the wearer's and their memosprite's CRIT DMG by 25%.",
        },
      },
      {
        id: 320,
        value: {
          Name: 'Giant Tree of Rapt Brooding',
          Description2pc: "Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate is 70% or higher, increases the Additional DMG dealt by 30%.",
        },
      },
    ],
  },
}

type betaInformation = Partial<Record<InputLocale, { Characters: Character[]; Lightcones: LightCone[]; RelicSets?: RelicSet[] }>>
type Character = { id: number; value: { Name: string; LongName: string } }
type LightCone = { id: number; value: { Name: string } }
type RelicSet = { id: number; value: { Name: string; Description2pc: string; Description4pc?: string } }
