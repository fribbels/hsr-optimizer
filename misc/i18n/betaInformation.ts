export const betaInformation: betaInformation = {
  en: {
    Characters: [
      {
        key: 1317,
        value: {
          Name: "Rappa",
          Abilities: {
            131701: {
              Name: "Ninjutsu: Rise Above Tumbles",
              Desc: "<span>Deals minor Imaginary DMG to one designated enemy.</span>",
              Type: "Basic ATK"
            },
            131702: {
              Name: "Ninja Strike: Rooted Resolute",
              Desc: "<span>Deals Imaginary DMG to all enemies.</span>",
              Type: "Skill"
            },
            131703: {
              Name: "Nindō Supreme: Aishiteru",
              Desc: "<span>Enters the \"Sealform\" state, gains an </span><span style='color:#f29e38ff'><u>extra turn</u></span><span>, obtains 3 points of \"Chroma Ink,\" and </span><span style='color:#f29e38ff'>increases Weakness Break Efficiency and Break Effect</span><span>.<br>While in the \"Sealform\" state, </span><span style='color:#f29e38ff'>gains Enhanced Basic ATK</span><span>. After using Enhanced Basic ATK, consumes 1 point of \"Chroma Ink.\" When \"Chroma Ink\" is depleted, exit the \"Sealform\" state.</span>",
              Type: "Ultimate"
            },
            131704: {
              Name: "Ninja Tech: Endurance Gauge",
              Desc: "<span>When enemy targets' Weakness are Broken, Rappa deals Imaginary Break DMG to them that additionally Bounces </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>2</span></span><span> time(s). Each instance of DMG deals minor Imaginary Break DMG and </span><span style='color:#f29e38ff'>Toughness Reduction regardless of Weakness Type</span><span> to random enemy units. The Toughness Reduction effect only takes effect against enemy targets with Toughness greater than 0. The added instances of DMG will prioritize targets with Toughness greater than 0.<br>When inflicting Weakness Break, triggers the Imaginary Weakness Break effect.</span>",
              Type: "Talent"
            },
            131706: {
              Name: "Attack",
              Desc: ""
            },
            131707: {
              Name: "Ninja Dash: By Leaps and Bounds",
              Desc: "<span>Enters the \"Graffiti\" state. Move forward rapidly for a set distance and attack any enemies touched. After entering combat via attacking enemies, deals </span><span style='color:#f29e38ff'>Toughness Reduction regardless of Weakness Type</span><span> to each enemy target and deals Imaginary Break DMG to them as well as their adjacent targets. At the same time, this unit regenerates Energy.</span>",
              Type: "Technique"
            }
          },
          Eidolons: {
            131701: {
              Name: "Returned Is the Revenant With No Ferry Toll",
              Desc: "<span>When using Ultimate to enter the \"Sealform\" state, DMG dealt by Rappa ignores 15% of the targets' DEF, and Rappa regenerates 20 Energy when she leaves the \"Sealform\" state.</span>"
            },
            131702: {
              Name: "Free Is the Mind Enlightened by Haikus",
              Desc: "<span>The Toughness Reduction of the first 2 hits of the Enhanced Basic ATK against the one designated enemy increases by 50%.</span>"
            },
            131703: {
              Name: "Many Are the Shrines That Repel No Hell",
              Desc: "<span>Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.</span>"
            },
            131704: {
              Name: "Lost Is the Nindō Devoured by Time",
              Desc: "<span>While in the \"Sealform\" state, increases all allies' SPD by 12%.</span>"
            },
            131705: {
              Name: "Steady Is The Ranger With Unerring Arrows",
              Desc: "<span>Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
            },
            131706: {
              Name: "Righteous Is the Wrath That Spares No Evil",
              Desc: "<span>The Break DMG multiplier of the Talent's effect increases by 500% on the enemy target that triggered it, and the number of additional instances of DMG increases by 5.</span>"
            }
          }
        }
      }
    ],
    Lightcones: [
      {
        id: 22003,
        value: {
          Name: "Ninja Record: Sound Hunt",
          SkillName: "Curtains Up!"
        }
      },
      {
        id: 21048,
        value: {
          Name: "Dream's Montage",
          SkillName: "Academy-Style Edit"
        }
      },
      {
        id: 23033,
        value: {
          Name: "Ninjutsu Inscription: Dazzling Evilbreaker",
          SkillName: "Exorcism"
        }
      }
    ],
    RelicSets: [
      {
        id: 121,
        value: {
          Name: "Sacerdos' Relived Ordeal",
          Description2pc: "<span>Increases SPD by <span style='whiteSpace: \"nowrap\"'>6%</span>.</span>",
          Description4pc: "<span>When using Skill or Ultimate on one ally target, increases the ability target's CRIT DMG by <span style='whiteSpace: \"nowrap\"'>18%</span>, lasting for <span style='whiteSpace: \"nowrap\"'>2</span> turn(s). This effect can stack up to <span style='whiteSpace: \"nowrap\"'>2</span> time(s).</span>"
        }
      },
      {
        id: 122,
        value: {
          Name: "Scholar Lost in Erudition",
          Description2pc: "<span>Increases CRIT Rate by <span style='whiteSpace: \"nowrap\"'>8%</span>.</span>",
          Description4pc: "<span>Increases DMG dealt by Skill and Ultimate by <span style='whiteSpace: \"nowrap\"'>20%</span>. After using Ultimate, additionally increases the DMG dealt by the next Skill by <span style='whiteSpace: \"nowrap\"'>25%</span>.</span>"
        }
      }
    ],
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