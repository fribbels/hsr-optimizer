import { InputLocale } from 'lib/i18n/generateTranslations'

export const betaInformation: betaInformation = {
  en: {
    Characters: [
      {
        key: 1225,
        value: {
          Name: 'Fugue',
        },
      },
      {
        key: 1313,
        value: {
          Name: 'Sunday',
        },
      },
    ],
    Lightcones: [
      {
        id: 23034,
        value: {
          Name: 'A Grounded Ascent',
        },
      },
      {
        id: 23035,
        value: {
          Name: 'Long Road Leads Home',
        },
      },
    ],
    RelicSets: [],
  },
}

type betaInformation = Partial<Record<InputLocale, { Characters: Character[];Lightcones: LightCone[];RelicSets: RelicSet[] }>>
type Character = { key: number; value: { Name: string } }
type LightCone = { id: number; value: { Name: string } }
type RelicSet = { id: number; value: { Name: string; Description2pc: string; Description4pc?: string } }
