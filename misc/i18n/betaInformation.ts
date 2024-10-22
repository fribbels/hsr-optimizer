export const betaInformation: betaInformation = {
  en: {
    Characters: [
      {
        key: 1225,
        value: {
          Name: 'Fugue'
        },
      },
      {
        key: 1313,
        value: {
          Name: 'Sunday'
        }
      }
    ],
    Lightcones: [
      {
        id: 23034,
        value: {
          Name: "A Grounded Ascent",
          SkillName: "Departing Anew"
        }
      },
      {
        id: 23035,
        value: {
          Name: "Long Road Leads Home",
          SkillName: "Rebirth"
        }
      }
    ],
    RelicSets: [],
  }
}

type betaInformation = {
  [key: string]: {
    Characters: {
      key: number
      value: {
        Name: string
        Abilities?: {
          [key: number]: {
            Name: string
            Desc: string
            Type?: string
          }
        }
        Eidolons?: {
          [key: number]: {
            Name: string
            Desc: string
          }
        }
      }
    }[]
    Lightcones: {
      id: number
      value: {
        Name: string
        SkillName?: string
      }
    }[]
    RelicSets: {
      id: number
      value: {
        Name: string
        Description2pc?: string
        Description4pc?: string
      }
    }[]
  }
}