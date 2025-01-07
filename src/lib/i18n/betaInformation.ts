import { InputLocale } from 'lib/i18n/generateTranslations'

export const betaInformation: betaInformation = {
  en_US: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: 'Mydei',
          LongName: 'Mydei',
        },
      },
      {
        id: 1404,
        value: {
          Name: 'Tribbie',
          LongName: 'Tribbie',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: 'Mydei sig?',
        },
      },
      {
        id: 23039,
        value: {
          Name: 'Tribbie sig?',
        },
      },
    ], /*
    RelicSets: [
      {
        id: 123,
        value: {
          Name: 'Hero of Triumphant Song',
          Description2pc: 'Increases ATK by 12%.',
          Description4pc: 'While the wearer\'s memosprite is on the field, increases the wearer\'s SPD by 6%.'
          + ' When the wearer\'s memosprite attacks, increases the wearer and memosprite\'s CRIT DMG by 30% for 2 turn(s).',
        },
      },
      {
        id: 124,
        value: {
          Name: 'Poet of Mourning Collapse',
          Description2pc: 'Increases Quantum DMG dealt by 10%.',
          Description4pc: 'Decreases the wearer\'s SPD by 12%. When entering battle, if the wearer\'s SPD is less than 110/95,'
          + ' increases the wearer\'s CRIT Rate by 20%/40%. This effect also applies to the wearer\'s memosprite.',
        },
      },
    ], */
  },
}

type betaInformation = Partial<Record<InputLocale, { Characters: Character[]; Lightcones: LightCone[]; RelicSets?: RelicSet[] }>>
type Character = { id: number; value: { Name: string; LongName: string } }
type LightCone = { id: number; value: { Name: string } }
type RelicSet = { id: number; value: { Name: string; Description2pc: string; Description4pc?: string } }
