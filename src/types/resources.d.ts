interface Resources {
  "charactersTab": {
    "ScreenshotMessages": {
      "ScreenshotSuccess": "Copied screenshot to clipboard",
      "ScreenshotFailed": "Unable to save screenshot to clipboard, try the download button to the right",
      "DownloadSuccess": "Downloaded screenshot"
    },
    "CharacterMenu": {
      "ButtonText": "Character menu",
      "Character": {
        "Label": "Character",
        "Options": {
          "Add": "Add new character",
          "Edit": "Edit character / light cone",
          "Switch": "Switch relics with",
          "Unequip": "Unequip character",
          "Delete": "Delete character"
        }
      },
      "Build": {
        "Label": "Builds",
        "Options": {
          "Save": "Save current build",
          "View": "View saved builds"
        }
      },
      "Scoring": {
        "Label": "Scoring",
        "Options": {
          "ScoringModal": "Scoring algorithm"
        }
      },
      "Priority": {
        "Label": "Priority",
        "Options": {
          "SortByScore": "Sort all characters by score",
          "MoveToTop": "Move character to top"
        }
      }
    },
    "Confirm": "$t(common:Confirm, {\"capitalizeLength\": 1})",
    "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
    "CopyScreenshot": "Copy screenshot",
    "SearchPlaceholder": "Search character name",
    "GridHeaders": {
      "Icon": "Icon",
      "Priority": "Priority",
      "Character": "Character"
    },
    "Messages": {
      "RemoveSuccess": "Successfully removed character",
      "UnequipSuccess": "Successfully unequipped character",
      "NoSelectedCharacter": "No selected character",
      "SwitchSuccess": "Successfully switched relics with $t(gameData:Characters.{{charId}}.Name)",
      "SortByScoreWarning": "Are you sure you want to sort all characters? You will lose any custom rankings you have set.",
      "SaveSuccess": "Successfully saved build: {{name}}",
      "UnequipWarning": "Are you sure you want to unequip $t(gameData:Characters.{{charId}}.Name)?",
      "DeleteWarning": "Are you sure you want to delete $t(gameData:Characters.{{charId}}.Name)?"
    },
    "CharacterPreview": {
      "ArtBy": "Art by {{artistName}}",
      "EditCharacter": "Edit character",
      "EditPortrait": "Edit portrait",
      "CharacterScore": "Character Score: {{score}} {{grade}}",
      "Messages": {
        "AddedRelic": "Successfully added relic",
        "SavedPortrait": "Successfully saved portrait",
        "RevertedPortrait": "Successfully reverted portrait",
        "NoSelectedCharacter": "No selected character"
      },
      "ScoreHeader": {
        "Title": "Combat Sim",
        "Score": "DPS Score {{score}}% {{grade}}"
      },
      "AlgorithmSlider": {
        "Title": "Scoring algorithm:",
        "Labels": {
          "CombatScore": "Combat Score",
          "CombatScoreTBD": "Combat Score (TBD)",
          "StatScore": "Stat Score"
        }
      },
      "DetailsSlider": {
        "Title": "Combat score details:",
        "Labels": {
          "CombatStats": "Combat Stats",
          "DMGUpgrades": "Damage Upgrades"
        }
      },
      "DMGUpgrades": "Damage Upgrades",
      "SubstatUpgradeComparisons": {
        "Header": "Substat upgrade comparisons",
        "Roll": "roll",
        "Score": "Score",
        "Damage": "Damage"
      },
      "BuildAnalysis": {
        "Header": "Character build analysis",
        "SimulationTeammates": "Simulation teammates",
        "SimulationSets": "Simulation sets",
        "Rotation": {
          "Header": "Combo damage rotation",
          "BASIC": "BASIC",
          "SKILL": "SKILL",
          "ULT": "ULT",
          "FUA": "FUA",
          "DOT": "DOT",
          "BREAK": "BREAK"
        },
        "CombatResults": {
          "Header": "Combat damage results",
          "Primary": "Primary ability:     ",
          "Character": "Character DMG:       ",
          "Benchmark": "Benchmark DMG:       ",
          "Baseline": "Baseline DMG:        ",
          "Maximum": "Maximum DMG:         ",
          "Score": "DPS score %:         ",
          "Abilities": {
            "BASIC": "BASIC DMG",
            "SKILL": "SKILL DMG",
            "ULT": "ULT DMG",
            "FUA": "FUA DMG",
            "DOT": "DOT DMG",
            "BREAK": "BREAK DMG",
            "COMBO": "COMBO DMG"
          }
        }
      },
      "ScoringColumn": {
        "Character": {
          "Header": "Character build ({{score}}%)",
          "BasicStats": "Character basic stats",
          "CombatStats": "Character <1>combat stats</1>",
          "Substats": "Character subs (min rolls)",
          "Mainstats": "Character main stats",
          "Abilities": "Character ability damage"
        },
        "Benchmark": {
          "Header": "Benchmark build ({{score}}%)",
          "BasicStats": "100% benchmark basic stats",
          "CombatStats": "100% benchmark <1>combat stats</1>",
          "Substats": "100% benchmark subs (min rolls)",
          "Mainstats": "100% benchmark main stats",
          "Abilities": "100% benchmark ability damage"
        },
        "Perfect": {
          "Header": "Perfect build ({{score}}%)",
          "BasicStats": "200% perfect basic stats",
          "CombatStats": "200% perfect <1>combat stats</1>",
          "Substats": "200% perfect subs (max rolls)",
          "Mainstats": "200% perfect main stats",
          "Abilities": "200% perfect ability damage"
        },
        "PaddedStatLabels": {
          "ATKP": "ATK%: ",
          "ATK": "ATK:  ",
          "HPP": "HP%:  ",
          "HP": "HP:   ",
          "DEFP": "DEF%: ",
          "DEF": "DEF:  ",
          "SPD": "SPD:  ",
          "CR": "CR:   ",
          "CD": "CD:   ",
          "EHR": "EHR:  ",
          "RES": "RES:  ",
          "BE": "BE:   "
        },
        "PaddedDMGLabels": {
          "Basic": "Basic DMG:           ",
          "Skill": "Skill DMG:           ",
          "Ult": "Ult DMG:             ",
          "Fua": "Fua DMG:             ",
          "Dot": "Dot DMG:             ",
          "Break": "Break DMG:           "
        }
      },
      "ScoringDetails": {
        "Header": "How is DPS Score calculated?"
      }
    }
  },
  "common": {
    "CapitalizeString": "{{string, capitalize}}",
    "Relic_one": "$t(CapitalizeString, {\"string\": \"relic\"})",
    "Relic_other": "$t(CapitalizeString, {\"string\": \"relics\"})",
    "RelicWithCount_one": "{{count}} $t(CapitalizeString, {\"string\": \"relic\"})",
    "RelicWithCount_other": "{{count}} $t(CapitalizeString, {\"string\": \"relics\"})",
    "Lightcone_one": "$t(CapitalizeString, {\"string\": \"light cone\"})",
    "Lightcone_other": "$t(CapitalizeString, {\"string\": \"light cones\"})",
    "LightconeWithCount_one": "{{count}} $t(CapitalizeString, {\"string\": \"light cone\"})",
    "LightconeWithCount_other": "{{count}} $t(CapitalizeString, {\"string\": \"light cones\"})",
    "ThousandsSuffix": "K",
    "DecimalSeparator": ".",
    "ThousandsSeparator": ",",
    "I18nNumber": "{{value, number}}",
    "Cancel": "$t(CapitalizeString, {\"string\": \"cancel\"})",
    "Confirm": "$t(CapitalizeString, {\"string\": \"confirm\"})",
    "Submit": "$t(CapitalizeString, {\"string\": \"submit\"})",
    "Ok": "$t(CapitalizeString, {\"string\": \"ok\"})",
    "Yes": "$t(CapitalizeString, {\"string\": \"yes\"})",
    "No": "$t(CapitalizeString, {\"string\": \"no\"})",
    "Save": "$t(CapitalizeString, {\"string\": \"save\"})",
    "Score": "$t(CapitalizeString, {\"string\": \"score\"})",
    "Reset": "$t(CapitalizeString, {\"string\": \"reset\"})",
    "Maximum": "$t(CapitalizeString, {\"string\": \"maximum\"})",
    "Minimum": "$t(CapitalizeString, {\"string\": \"minimum\"})",
    "EidolonNShort": "E{{eidolon}}",
    "SuperimpositionNShort": "S{{superimposition}}",
    "LevelShort": "Lv{{level}}",
    "CharacterWithCount_one": "{{count}} $t(CapitalizeString, {\"string\": \"character\"})",
    "CharacterWithCount_other": "{{count}} $t(CapitalizeString, {\"string\": \"characters\"})",
    "Character_one": "$t(CapitalizeString, {\"string\": \"character\"})",
    "Character_other": "$t(CapitalizeString, {\"string\": \"characters\"})",
    "VerifiedRelicHoverText": "Relic substats verified by relic scorer (speed decimals)",
    "CombatStats": "Combat Stats",
    "Parts": {
      "Head": "Head",
      "Hands": "Hands",
      "Body": "Body",
      "Feet": "Feet",
      "PlanarSphere": "Planar Sphere",
      "LinkRope": "Link Rope"
    },
    "ReadableParts": {
      "Head": "Head",
      "Hands": "Hands",
      "Body": "Body",
      "Feet": "Feet",
      "PlanarSphere": "Sphere",
      "LinkRope": "Rope"
    },
    "Stats": {
      "HP%": "HP%",
      "HP": "HP",
      "ATK%": "ATK%",
      "ATK": "ATK",
      "DEF%": "DEF%",
      "DEF": "DEF",
      "SPD%": "SPD%",
      "SPD": "SPD",
      "CRIT Rate": "CRIT Rate",
      "CRIT DMG": "CRIT DMG",
      "Effect Hit Rate": "Effect Hit Rate",
      "Effect RES": "Effect RES",
      "Break Effect": "Break Effect",
      "Energy Regeneration Rate": "Energy Regeneration Rate",
      "Outgoing Healing Boost": "Outgoing Healing Boost",
      "Physical DMG Boost": "$t(gameData:Elements.Physical) DMG Boost",
      "Fire DMG Boost": "$t(gameData:Elements.Fire) DMG Boost",
      "Ice DMG Boost": "$t(gameData:Elements.Ice) DMG Boost",
      "Lightning DMG Boost": "$t(gameData:Elements.Thunder) DMG Boost",
      "Wind DMG Boost": "$t(gameData:Elements.Wind) DMG Boost",
      "Quantum DMG Boost": "$t(gameData:Elements.Quantum) DMG Boost",
      "Imaginary DMG Boost": "$t(gameData:Elements.Imaginary) DMG Boost"
    },
    "ShortStats": {
      "HP%": "HP%",
      "HP": "HP",
      "ATK%": "ATK%",
      "ATK": "ATK",
      "DEF%": "DEF%",
      "DEF": "DEF",
      "SPD%": "SPD%",
      "SPD": "SPD",
      "CRIT Rate": "CR",
      "CRIT DMG": "CD",
      "Effect Hit Rate": "EHR",
      "Effect RES": "RES",
      "Break Effect": "BE",
      "Energy Regeneration Rate": "ERR",
      "Outgoing Healing Boost": "OHB",
      "Physical DMG Boost": "$t(gameData:Elements.Physical)",
      "Fire DMG Boost": "$t(gameData:Elements.Fire)",
      "Ice DMG Boost": "$t(gameData:Elements.Ice)",
      "Lightning DMG Boost": "$t(gameData:Elements.Thunder)",
      "Wind DMG Boost": "$t(gameData:Elements.Wind)",
      "Quantum DMG Boost": "$t(gameData:Elements.Quantum)",
      "Imaginary DMG Boost": "$t(gameData:Elements.Imaginary)"
    },
    "ShortSpacedStats": {
      "HP%": "HP %",
      "HP": "HP",
      "ATK%": "ATK %",
      "ATK": "ATK",
      "DEF%": "DEF %",
      "DEF": "DEF",
      "SPD%": "SPD %",
      "SPD": "SPD",
      "CRIT Rate": "CR",
      "CRIT DMG": "CD",
      "Effect Hit Rate": "EHR",
      "Effect RES": "RES",
      "Break Effect": "BE",
      "Energy Regeneration Rate": "ERR",
      "Outgoing Healing Boost": "OHB",
      "Physical DMG Boost": "$t(gameData:Elements.Physical)",
      "Fire DMG Boost": "$t(gameData:Elements.Fire)",
      "Ice DMG Boost": "$t(gameData:Elements.Ice)",
      "Lightning DMG Boost": "$t(gameData:Elements.Thunder)",
      "Wind DMG Boost": "$t(gameData:Elements.Wind)",
      "Quantum DMG Boost": "$t(gameData:Elements.Quantum)",
      "Imaginary DMG Boost": "$t(gameData:Elements.Imaginary)"
    },
    "ReadableStats": {
      "HP%": "HP %",
      "HP": "HP",
      "ATK%": "ATK %",
      "ATK": "ATK",
      "DEF%": "DEF %",
      "DEF": "DEF",
      "SPD%": "SPD %",
      "SPD": "SPD",
      "CRIT Rate": "CRIT Rate",
      "CRIT DMG": "CRIT DMG",
      "Effect Hit Rate": "Effect HIT",
      "Effect RES": "Effect RES",
      "Break Effect": "Break Effect",
      "Energy Regeneration Rate": "Energy Regen",
      "Outgoing Healing Boost": "Healing Boost",
      "Physical DMG Boost": "$t(gameData:Elements.Physical) DMG",
      "Fire DMG Boost": "$t(gameData:Elements.Fire) DMG",
      "Ice DMG Boost": "$t(gameData:Elements.Ice) DMG",
      "Lightning DMG Boost": "$t(gameData:Elements.Thunder) DMG",
      "Wind DMG Boost": "$t(gameData:Elements.Wind) DMG",
      "Quantum DMG Boost": "$t(gameData:Elements.Quantum) DMG",
      "Imaginary DMG Boost": "$t(gameData:Elements.Imaginary) DMG"
    },
    "ShortReadableStats": {
      "HP%": "HP %",
      "HP": "HP",
      "ATK%": "ATK %",
      "ATK": "ATK",
      "DEF%": "DEF %",
      "DEF": "DEF",
      "SPD%": "SPD %",
      "SPD": "SPD",
      "CRIT Rate": "CRIT Rate",
      "CRIT DMG": "CRIT DMG",
      "Effect Hit Rate": "HIT",
      "Effect RES": "RES",
      "Break Effect": "Break",
      "Energy Regeneration Rate": "Energy",
      "Outgoing Healing Boost": "Healing",
      "Physical DMG Boost": "$t(gameData:Elements.Physical)",
      "Fire DMG Boost": "$t(gameData:Elements.Fire)",
      "Ice DMG Boost": "$t(gameData:Elements.Ice)",
      "Lightning DMG Boost": "$t(gameData:Elements.Thunder)",
      "Wind DMG Boost": "$t(gameData:Elements.Wind)",
      "Quantum DMG Boost": "$t(gameData:Elements.Quantum)",
      "Imaginary DMG Boost": "$t(gameData:Elements.Imaginary)"
    },
    "DMGTypes": {
      "simScore": "Combo DMG",
      "BASIC": "Basic Damage",
      "ULT": "Ult Damage",
      "SKILL": "Skill Damage",
      "FUA": "FUA Damage",
      "DOT": "DoT Damage",
      "CV": "CV"
    }
  },
  "conditionals": {
    "BetaMessage": "Current version: {{Version}} - Calculations are subject to change.",
    "Lightcones": {
      "AlongThePassingShore": {
        "Content": {
          "emptyBubblesDebuff": {
            "text": "Mirage Fizzle debuff",
            "title": "Steerer",
            "content": "When the wearer hits an enemy target, inflicts Mirage Fizzle on the enemy, lasting for 1 turn. Each time the wearer attacks, this effect can only trigger 1 time on each target. The wearer deals {{DmgBoost}}% increased DMG to targets afflicted with Mirage Fizzle, and the DMG dealt by the wearer's Ultimate additionally increases by {{UltDmgBoost}}%."
          }
        }
      },
      "AnInstantBeforeAGaze": {
        "Content": {
          "maxEnergyUltDmgStacks": {
            "text": "Max energy",
            "title": "A Knight's Pilgrimage",
            "content": "When the wearer uses Ultimate, increases the wearer's Ultimate DMG based on their Max Energy. Each point of Energy increases the Ultimate DMG by {{DmgStep}}%, up to 180 points of Energy."
          }
        }
      },
      "BaptismOfPureThought": {
        "Content": {
          "debuffCdStacks": {
            "text": "Debuff CD stacks",
            "title": "Mental Training",
            "content": "For every debuff on the enemy target, the wearer's CRIT DMG dealt against this target increases by {{DmgStep}}%, stacking up to 3 times."
          },
          "postUltBuff": {
            "text": "Disputation buffs",
            "title": "Mental Training",
            "content": "When using Ultimate to attack the enemy target, the wearer receives the Disputation effect, which increases DMG dealt by {{DmgStep}}% and enables their follow-up attacks to ignore {{DefIgnore}}% of the target's DEF. This effect lasts for 2 turns."
          }
        }
      },
      "BeforeDawn": {
        "Content": {
          "fuaDmgBoost": {
            "text": "FUA DMG boost",
            "title": "Long Night",
            "content": "After the wearer uses their Skill or Ultimate, they gain Somnus Corpus. Upon triggering a follow-up attack, Somnus Corpus will be consumed and the follow-up attack DMG increases by {{DmgBuff}}%"
          }
        }
      },
      "BrighterThanTheSun": {
        "Content": {
          "dragonsCallStacks": {
            "text": "Dragon's Call stacks",
            "title": "Defiant Till Death",
            "content": "When the wearer uses their Basic ATK, they will gain 1 stack of Dragon's Call, lasting for 2 turns. Each stack of Dragon's Call increases the wearer's ATK by {{AtkBuff}}% and Energy Regeneration Rate by {{RegenBuff}}%. Dragon's Call can be stacked up to 2 times."
          }
        }
      },
      "ButTheBattleIsntOver": {
        "Content": {
          "postSkillDmgBuff": {
            "text": "Post Skill DMG buff",
            "title": "Heir",
            "content": "When the wearer uses their Skill, the next ally taking action (except the wearer) deals {{DmgBuff}}% more DMG for 1 turn(s)."
          }
        }
      },
      "CruisingInTheStellarSea": {
        "Content": {
          "enemyHp50CrBoost": {
            "text": "Enemy HP ≤ 50% CR buff",
            "title": "Chase",
            "content": "Increases the wearer's CRIT rate against enemies with HP less than or equal to 50% by an extra {{CritBuff}}%."
          },
          "enemyDefeatedAtkBuff": {
            "text": "Enemy defeated ATK buff",
            "title": "Chase",
            "content": "When the wearer defeats an enemy, their ATK is increased by {{AtkBuff}}% for 2 turn(s)."
          }
        }
      },
      "DanceAtSunset": {
        "Content": {
          "fuaDmgStacks": {
            "text": "FUA DMG stacks",
            "title": "Deeply Engrossed",
            "content": "After the wearer uses Ultimate, receives 1 stack of Firedance, lasting for 2 turns and stacking up to 2.0 time(s). Each stack of Firedance increases the DMG dealt by the wearer's follow-up attack by {{DmgBoost}}% ."
          }
        }
      },
      "EarthlyEscapade": {
        "Content": {
          "maskActive": {
            "text": "Mask active",
            "title": "Capriciousness",
            "content": "At the start of the battle, the wearer gains Mask, lasting for 3 turn(s). While the wearer has Mask, the wearer's allies have their CRIT Rate increased by {{CritRateBuff}}% and their CRIT DMG increased by {{CritDmgBuff}}%. For every 1 Skill Point the wearer recovers (including Skill Points that exceed the limit), they gain 1 stack of Radiant Flame. And when the wearer has 4 stacks of Radiant Flame, all the stacks are removed, and they gain Mask for 4 turn(s)."
          }
        }
      },
      "EchoesOfTheCoffin": {
        "Content": {
          "postUltSpdBuff": {
            "text": "Post Ult SPD buff",
            "title": "Thorns",
            "content": "After the wearer uses an attack, for each different enemy target the wearer hits, regenerates {{EnergyRecovered}} Energy. Each attack can regenerate Energy up to 3 time(s) this way. After the wearer uses their Ultimate, all allies gain {{SpdBuff}} SPD for 1 turn."
          }
        }
      },
      "EternalCalculus": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "title": "Boundless Thought",
            "content": "After using an attack, for each enemy target hit, additionally increases ATK by {{AtkBuff}}%. This effect can stack up to 5 times and last until the next attack."
          },
          "spdBuff": {
            "text": "3 targets hit SPD buff",
            "title": "Boundless Thought",
            "content": "If there are 3 or more enemy targets hit, this unit's SPD increases by {{SpdBuff}}%, lasting for 1 turn(s)."
          }
        }
      },
      "FlowingNightglow": {
        "Content": {
          "cadenzaActive": {
            "text": "Cadenza active",
            "title": "Pacify",
            "content": "Every time an ally attacks, the wearer gains 1 stack of Cantillation. Each stack of Cantillation increases the wearer's Energy Regeneration Rate by {{RegenBuff}}%, stacking up to 5 time(s). When the wearer uses their Ultimate, removes Cantillation and gains Cadenza. Cadenza increases the Wearer's ATK by {{AtkBuff}}% and increases all allies' DMG dealt by {{DmgBuff}}%, lasting for 1 turn(s)."
          },
          "cantillationStacks": {
            "text": "Cantillation stacks",
            "title": "Pacify",
            "content": "Every time an ally attacks, the wearer gains 1 stack of Cantillation. Each stack of Cantillation increases the wearer's Energy Regeneration Rate by {{RegenBuff}}%, stacking up to 5 time(s). When the wearer uses their Ultimate, removes Cantillation and gains Cadenza. Cadenza increases the Wearer's ATK by {{AtkBuff}}% and increases all allies' DMG dealt by {{DmgBuff}}%, lasting for 1 turn(s)."
          }
        }
      },
      "IncessantRain": {
        "Content": {
          "enemy3DebuffsCrBoost": {
            "text": "Enemy ≤ 3 debuffs CR boost",
            "title": "Mirage of Reality",
            "content": "When the wearer deals DMG to an enemy that currently has 3 or more debuffs, increases the wearer's CRIT Rate by {{CritBuff}}%."
          },
          "targetCodeDebuff": {
            "text": "Target Aether Code debuff",
            "title": "Mirage of Reality",
            "content": "After the wearer uses their Basic ATK, Skill, or Ultimate, there is a chance to implant Aether Code on a random hit target that does not yet have it. Targets with Aether Code receive {{DmgIncrease}}% increased DMG for 1 turn."
          }
        }
      },
      "InherentlyUnjustDestiny": {
        "Content": {
          "shieldCdBuff": {
            "text": "Shield CD buff",
            "title": "All-In",
            "content": "When the wearer provides a Shield to an ally, the wearer's CRIT DMG increases by {{CritBuff}}%, lasting for 2 turn(s)."
          },
          "targetVulnerability": {
            "text": "Target vulnerability debuff",
            "title": "All-In",
            "content": "When the wearer's follow-up attack hits an enemy target, there is a 100% base chance to increase the DMG taken by the attacked enemy target by {{Vulnerability}}%, lasting for 2 turn(s)."
          }
        }
      },
      "InTheNameOfTheWorld": {
        "Content": {
          "enemyDebuffedDmgBoost": {
            "text": "Enemy debuffed DMG boost",
            "title": "Inheritor",
            "content": "Increases the wearer's DMG to debuffed enemies by {{DmgBuff}}%."
          },
          "skillAtkBoost": {
            "text": "Skill ATK boost (not implemented)",
            "title": "Inheritor",
            "content": "When the wearer uses their Skill, the Effect Hit Rate for this attack increases by {{EhrBuff}}%, and ATK increases by {{AtkBuff}}%."
          }
        }
      },
      "InTheNight": {
        "Content": {
          "spdScalingBuffs": {
            "text": "SPD conversion buffs",
            "title": "Flowers and Butterflies",
            "content": "While the wearer is in battle, for every 10 SPD that exceeds 100, the DMG of the wearer's Basic ATK and Skill is increased by {{DmgBuff}}% and the CRIT DMG of their Ultimate is increased by {{CritBuff}}%. This effect can stack up to 6 time(s)."
          }
        }
      },
      "IShallBeMyOwnSword": {
        "Content": {
          "eclipseStacks": {
            "text": "Eclipse stacks",
            "title": "With This Evening Jade",
            "content": "When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of 3 stack(s). Each stack of Eclipse increases the DMG of the wearer's next attack by {{DmgBuff}}%."
          },
          "maxStackDefPen": {
            "text": "Max stack DEF PEN",
            "title": "With This Evening Jade",
            "content": "When 3 stack(s) are reached, additionally enables that attack to ignore {{DefIgnore}}% of the enemy's DEF. This effect will be removed after the wearer uses an attack."
          }
        }
      },
      "IVentureForthToHunt": {
        "Content": {
          "luminfluxUltStacks": {
            "text": "Luminflux stacks",
            "title": "Intimidation",
            "content": "When the wearer launches a follow-up attack, gains 1 stack of \"Luminflux,\" stacking up to 2.0 time(s). Each stack of \"Luminflux\" enables the Ultimate DMG dealt by the wearer to ignore {{DefIgnore}}% of the target's DEF. When the wearer's turn ends, removes 1 stack of \"Luminflux."
          }
        }
      },
      "MomentOfVictory": {
        "Content": {
          "selfAttackedDefBuff": {
            "text": "Self attacked DEF buff",
            "title": "Verdict",
            "content": "Increases the chance for the wearer to be attacked by enemies. When the wearer is attacked, increase their DEF by an extra {{DefBuff}}% until the end of the wearer's turn."
          }
        }
      },
      "NightOfFright": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "title": "Deep, Deep Breaths",
            "content": "When the wearer provides healing for an ally, increases the healed ally's ATK by {{AtkBuff}}%. This effect can stack up to 5 times and lasts for 2 turn(s)."
          }
        }
      },
      "NightOnTheMilkyWay": {
        "Content": {
          "enemyCountAtkBuff": {
            "text": "Enemy count ATK buff",
            "title": "Meteor Swarm",
            "content": "For every enemy on the field, increases the wearer's ATK by {{AtkBuff}}%, up to 5 stacks."
          },
          "enemyWeaknessBreakDmgBuff": {
            "text": "Enemy broken DMG buff",
            "title": "Meteor Swarm",
            "content": "When an enemy is inflicted with Weakness Break, the DMG dealt by the wearer increases by {{DmgBuff}}% for 1 turn."
          }
        }
      },
      "OnTheFallOfAnAeon": {
        "Content": {
          "atkBoostStacks": {
            "text": "ATK buff stacks",
            "title": "Moth to Flames",
            "content": "Whenever the wearer attacks, their ATK is increased by {{AtkBuff}}% in this battle. This effect can stack up to 4 time(s)."
          },
          "weaknessBreakDmgBuff": {
            "text": "Weakness break DMG buff",
            "title": "Moth to Flames",
            "content": "After a character inflicts Weakness Break on an enemy, the wearer's DMG increases by {{DmgBuff}}% for 2 turn(s)."
          }
        }
      },
      "PastSelfInTheMirror": {
        "Content": {
          "postUltDmgBuff": {
            "text": "Post Ult DMG buff",
            "title": "The Plum Fragrance In My Bones",
            "content": "When the wearer uses their Ultimate, increases all allies' DMG by {{DmgBuff}}%, lasting for 3 turn(s)."
          }
        }
      },
      "PatienceIsAllYouNeed": {
        "Content": {
          "spdStacks": {
            "text": "SPD stacks",
            "title": "Spider Web",
            "content": "After every attack launched by wearer, their SPD increases by {{SpdBuff}}%, stacking up to 3 times."
          },
          "dotEffect": {
            "text": "DoT effect (not implemented)",
            "title": "Spider Web",
            "content": "If the wearer hits an enemy target that is not afflicted by Erode, there is a 100% base chance to inflict Erode to the target. Enemies afflicted with Erode are also considered to be Shocked and will receive Lightning DoT at the start of each turn equal to {{Multiplier}}% of the wearer's ATK, lasting for 1 turn(s)."
          }
        }
      },
      "ReforgedRemembrance": {
        "Content": {
          "prophetStacks": {
            "text": "Prophet stacks",
            "title": "Crystallize",
            "content": "When the wearer deals DMG to an enemy inflicted with Wind Shear, Burn, Shock, or Bleed, each respectively grants 1 stack of Prophet, stacking up to 4 time(s). In a single battle, only 1 stack of Prophet can be granted for each type of DoT. Every stack of Prophet increases wearer's ATK by {{AtkBuff}}% and enables the DoT dealt to ignore {{DefIgnore}}% of the target's DEF."
          }
        }
      },
      "SailingTowardsASecondLife": {
        "Content": {
          "breakDmgDefShred": {
            "text": "Break DMG DEF shred",
            "title": "Rough Water",
            "content": "The Break DMG dealt by the wearer ignores {{DefIgnore}}% of the target's DEF."
          },
          "spdBuffConditional": {
            "text": "BE ≥ 150 SPD buff",
            "title": "Rough Water",
            "content": "When the wearer's Break Effect in battle is at 150% or greater, increases their SPD by {{SpdBuff}}%."
          }
        }
      },
      "ScentAloneStaysTrue": {
        "Content": {
          "woefreeState": {
            "text": "Woefree vulnerability",
            "title": "Contentment",
            "content": "After the wearer uses Ultimate to attack enemy targets, inflicts the targets with the \"Woefree\" state, lasting for 2.0 turn(s). While in \"Woefree,\" enemy targets take {{Vulnerability}}% increased DMG. The effect of increasing DMG taken is additionally boosted by {{AdditionalVulnerability}}% if the wearer's current Break Effect is 150.0% or higher."
          }
        },
        "TeammateContent": {
          "additionalVulnerability": {
            "text": "Additional vulnerability",
            "title": "Contentment",
            "content": "After the wearer uses Ultimate to attack enemy targets, inflicts the targets with the \"Woefree\" state, lasting for 2.0 turn(s). While in \"Woefree,\" enemy targets take {{Vulnerability}}% increased DMG. The effect of increasing DMG taken is additionally boosted by {{AdditionalVulnerability}}% if the wearer's current Break Effect is 150.0% or higher."
          }
        }
      },
      "SheAlreadyShutHerEyes": {
        "Content": {
          "hpLostDmgBuff": {
            "text": "HP lost DMG buff",
            "title": "Visioscape",
            "content": "When the wearer's HP is reduced, all allies' DMG dealt increases by {{DmgBuff}}%, lasting for 2 turn(s)."
          }
        }
      },
      "SleepLikeTheDead": {
        "Content": {
          "missedCritCrBuff": {
            "text": "Missed Crit CR buff",
            "title": "Sweet Dreams",
            "content": "When the wearer's Basic ATK or Skill does not result in a CRIT Hit, increases their CRIT Rate by {{CritBuff}}% for 1 turn(s). This effect can only trigger once every 3 turn(s)."
          }
        }
      },
      "SolitaryHealing": {
        "Content": {
          "postUltDotDmgBuff": {
            "text": "Post Ult DoT DMG buff",
            "title": "Chaos Elixir",
            "content": "When the wearer uses their Ultimate, increases DoT dealt by the wearer by {{DmgBuff}}%, lasting for 2 turn(s)."
          }
        }
      },
      "SomethingIrreplaceable": {
        "Content": {
          "dmgBuff": {
            "text": "Enemy defeated / self hit DMG buff",
            "title": "Kinship",
            "content": "When the wearer defeats an enemy or is hit, immediately restores HP equal to {{Multiplier}}% of the wearer's ATK. At the same time, the wearer's DMG is increased by {{DmgBuff}}% until the end of their next turn. This effect cannot stack and can only trigger 1 time per turn."
          }
        }
      },
      "TextureOfMemories": {
        "Content": {
          "activeShieldDmgDecrease": {
            "text": "Active shield DMG taken decrease",
            "title": "Treasure",
            "content": "If the wearer is attacked and has no Shield, they gain a Shield equal to {{ShieldHp}}% of their Max HP for 2 turn(s). This effect can only be triggered once every 3 turn(s). If the wearer has a Shield when attacked, the DMG they receive decreases by {{DmgReduction}}%."
          }
        }
      },
      "TheUnreachableSide": {
        "Content": {
          "dmgBuff": {
            "text": "HP consumed / attacked DMG buff",
            "title": "Unfulfilled Yearning",
            "content": "When the wearer is attacked or consumes their own HP, their DMG increases by {{DmgBuff}}%. This effect is removed after the wearer uses an attack."
          }
        }
      },
      "ThoseManySprings": {
        "Content": {
          "unarmoredVulnerability": {
            "text": "Unarmored vulnerability",
            "title": "Worldly Affairs Leave No Mark",
            "content": "After the wearer uses Basic ATK, Skill, or Ultimate to attack an enemy target, there is a 60.0% base chance to inflict \"Unarmored\" on the target. While in the Unarmored state, the enemy target receives {{UnarmoredVulnerability}}% increased DMG, lasting for 2.0 turn(s). If the target is under a DoT state inflicted by the wearer, there is a 60.0% base chance to upgrade the \"Unarmored\" state inflicted by the wearer to the \"Cornered\" state, which additionally increases the DMG the enemy target receives by {{CorneredVulnerability}}% , lasting for 2.0 turn(s)."
          },
          "corneredVulnerability": {
            "text": "Cornered vulnerability",
            "title": "Worldly Affairs Leave No Mark",
            "content": "After the wearer uses Basic ATK, Skill, or Ultimate to attack an enemy target, there is a 60.0% base chance to inflict \"Unarmored\" on the target. While in the Unarmored state, the enemy target receives {{UnarmoredVulnerability}}% increased DMG, lasting for 2.0 turn(s). If the target is under a DoT state inflicted by the wearer, there is a 60.0% base chance to upgrade the \"Unarmored\" state inflicted by the wearer to the \"Cornered\" state, which additionally increases the DMG the enemy target receives by {{CorneredVulnerability}}% , lasting for 2.0 turn(s)."
          }
        }
      },
      "TimeWaitsForNoOne": {
        "Content": {
          "healingBasedDmgProc": {
            "text": "Healing based DMG proc (Not implemented)",
            "title": "Morn, Noon, Dusk, and Night",
            "content": "When the wearer heals allies, record the amount of Outgoing Healing. When any ally launches an attack, a random attacked enemy takes Additional DMG equal to {{Multiplier}}% of the recorded Outgoing Healing value. The type of this Additional DMG is of the same Type as the wearer's. This Additional DMG is not affected by other buffs, and can only occur 1 time per turn."
          }
        }
      },
      "WhereaboutsShouldDreamsRest": {
        "Content": {
          "routedVulnerability": {
            "text": "Routed vulnerability",
            "title": "Metamorphosis",
            "content": "When the wearer deals Break DMG to an enemy target, inflicts Routed on the enemy, lasting for 2 turn(s). Targets afflicted with Routed receive {{Vulnerability}}% increased Break DMG from the wearer, and their SPD is lowered by 20%. Effects of the similar type cannot be stacked."
          }
        }
      },
      "WorrisomeBlissful": {
        "Content": {
          "targetTameStacks": {
            "text": "Target Tame stacks",
            "title": "One At A Time",
            "content": "After the wearer uses a follow-up attack, apply the Tame state to the target, stacking up to 2 stacks. When allies hit enemy targets under the Tame state, every Tame stack increases the CRIT DMG dealt by {{CritBuff}}%."
          }
        }
      },
      "YetHopeIsPriceless": {
        "Content": {
          "fuaDmgBoost": {
            "text": "CD to FUA DMG boost",
            "title": "Promise",
            "content": "While the wearer is in battle, for every 20% CRIT DMG that exceeds 120%, the DMG dealt by follow-up attack increases by {{DmgBuff}}%. This effect can stack up to 4 time(s)."
          },
          "ultFuaDefShred": {
            "text": "Ult / FUA DEF PEN",
            "title": "Promise",
            "content": "When the battle starts or after the wearer uses their Basic ATK, enables Ultimate or the DMG dealt by follow-up attack to ignore {{DefShred}}% of the target's DEF, lasting for 2 turn(s)."
          }
        }
      },
      "AfterTheCharmonyFall": {
        "Content": {
          "spdBuff": {
            "text": "SPD buff",
            "title": "Quiescence",
            "content": "After the wearer uses Ultimate, increases SPD by {{SpdBuff}}%, lasting for 2 turn(s)."
          }
        }
      },
      "ASecretVow": {
        "Content": {
          "enemyHpHigherDmgBoost": {
            "text": "Enemy HP% higher DMG boost",
            "title": "Spare No Effort",
            "content": "The wearer also deals an extra {{DmgBuff}}% of DMG to enemies whose current HP percentage is equal to or higher than the wearer's current HP percentage."
          }
        }
      },
      "BoundlessChoreo": {
        "Content": {
          "enemyDefReducedSlowed": {
            "text": "Enemy DEF reduced / slowed",
            "title": "Scrutinize",
            "content": "The wearer deals {{CritBuff}}% more CRIT DMG to enemies that are currently Slowed or have reduced DEF."
          }
        }
      },
      "CarveTheMoonWeaveTheClouds": {
        "Content": {
          "atkBuffActive": {
            "text": "ATK buff active",
            "title": "Secret",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%::BR::All allies' CRIT DMG increases by {{CritBuff}}%::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          },
          "cdBuffActive": {
            "text": "CD buff active",
            "title": "Secret",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%::BR::All allies' CRIT DMG increases by {{CritBuff}}%::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          },
          "errBuffActive": {
            "text": "ERR buff active",
            "title": "Secret",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%::BR::All allies' CRIT DMG increases by {{CritBuff}}%::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          }
        }
      },
      "ConcertForTwo": {
        "Content": {
          "teammateShieldStacks": {
            "text": "Teammate shield DMG stacks",
            "title": "Inspire",
            "content": "For every on-field character that has a Shield, the DMG dealt by the wearer increases by {{DmgBuff}}%."
          }
        }
      },
      "DayOneOfMyNewLife": {
        "Content": {
          "dmgResBuff": {
            "text": "DMG RES buff",
            "title": "At This Very Moment",
            "content": "After entering battle, increases All-Type RES of all allies by {{ResBuff}}%. Effects of the same type cannot stack."
          }
        }
      },
      "DreamvilleAdventure": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG boost'",
            "title": "Solidarity",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          },
          "skillDmgBuff": {
            "text": "Skill DMG boost",
            "title": "Solidarity",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          },
          "basicDmgBuff": {
            "text": "Basic DMG boost",
            "title": "Solidarity",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          }
        }
      },
      "Fermata": {
        "Content": {
          "enemyShockWindShear": {
            "text": "Enemy shocked / wind sheared",
            "title": "Semibreve Rest",
            "content": "Increases the wearer's DMG to enemies afflicted with Shock or Wind Shear by {{DmgBuff}}%. This also applies to DoT."
          }
        }
      },
      "FinalVictor": {
        "Content": {
          "goodFortuneStacks": {
            "text": "Good Fortune stacks",
            "title": "All In",
            "content": "When the wearer lands a CRIT hit on enemies, gains a stack of Good Fortune, stacking up to 4 time(s). Every stack of Good Fortune the wearer has will increase their CRIT DMG by {{CritBuff}}%. Good Fortune will be removed at the end of the wearer's turn."
          }
        }
      },
      "FlamesAfar": {
        "Content": {
          "dmgBuff": {
            "text": "DMG buff",
            "title": "Deflagration",
            "content": "When the cumulative HP loss of the wearer during a single attack exceeds 25% of their Max HP, or if the amount of their own HP they consume at one time is greater than 25% of their Max HP, immediately heals the wearer for 15% of their Max HP, and at the same time, increases the DMG they deal by {{DmgBuff}}% for 2 turn(s). This effect can only be triggered once every 3 turn(s)."
          }
        }
      },
      "ForTomorrowsJourney": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult usage DMG buff",
            "title": "Bonds",
            "content": "After the wearer uses their Ultimate, increases their DMG dealt by {{DmgBuff}}%, lasting for 1 turn(s)."
          }
        }
      },
      "GeniusesRepose": {
        "Content": {
          "defeatedEnemyCdBuff": {
            "text": "Defeated enemy CD buff",
            "title": "Each Now Has a Role to Play",
            "content": "When the wearer defeats an enemy, the wearer's CRIT DMG increases by {{DmgBuff}}% for 3 turn(s)."
          }
        }
      },
      "GoodNightAndSleepWell": {
        "Content": {
          "debuffStacksDmgIncrease": {
            "text": "Debuff stacks DMG increase",
            "title": "Toiler",
            "content": "For every debuff the target enemy has, the DMG dealt by the wearer increases by {{DmgBuff}}%, stacking up to 3 time(s). This effect also applies to DoT."
          }
        }
      },
      "HeyOverHere": {
        "Content": {
          "postSkillHealBuff": {
            "text": "Post Skill heal buff",
            "title": "I'm Not Afraid!",
            "content": "When the wearer uses their Skill, increases Outgoing Healing by {{HealingBoost}}%, lasting for 2 turn(s)."
          }
        }
      },
      "IndeliblePromise": {
        "Content": {
          "crBuff": {
            "text": "Ult CR buff",
            "title": "Inheritance",
            "content": "Increases the wearer's Break Effect by {{BreakBuff}}%. When the wearer uses their Ultimate, increases CRIT Rate by {{CritBuff}}%, lasting for 2 turn(s)."
          }
        }
      },
      "ItsShowtime": {
        "Content": {
          "trickStacks": {
            "text": "Trick stacks",
            "title": "Self-Amusement",
            "content": "When the wearer inflicts a debuff on an enemy, gains a stack of Trick. Every stack of Trick increases the wearer's DMG dealt by {{DmgBuff}}%, stacking up to 3 time(s). This effect lasts for 1 turn(s). When the wearer's Effect Hit Rate is 80% or higher, increases ATK by {{AtkBuff}}%."
          }
        }
      },
      "MakeTheWorldClamor": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "title": "The Power of Sound",
            "content": "The wearer regenerates {{Energy}} Energy immediately upon entering battle, and increases Ultimate DMG by {{DmgBuff}}%."
          }
        }
      },
      "NinjaRecordSoundHunt": {
        "Content": {
          "cdBuff": {
            "text": "CD buff",
            "title": "Curtains Up!",
            "content": null
          }
        }
      },
      "OnlySilenceRemains": {
        "Content": {
          "enemies2CrBuff": {
            "text": "≤ 2 enemies CR buff",
            "title": "Record",
            "content": "If there are 2 or fewer enemies on the field, increases wearer's CRIT Rate by {{CritBuff}}%."
          }
        }
      },
      "PastAndFuture": {
        "Content": {
          "postSkillDmgBuff": {
            "text": "Post Skill DMG buff",
            "title": "Kites From the Past",
            "content": "When the wearer uses their Skill, the next ally taking action (except the wearer) deals {{DmgBuff}}% increased DMG for 1 turn(s)."
          }
        }
      },
      "PerfectTiming": {
        "Content": {
          "resToHealingBoost": {
            "text": "RES to healing boost",
            "title": "Refraction of Sightline",
            "content": "Increases the wearer's Outgoing Healing by an amount that is equal to {{Scaling}}% of Effect RES. Outgoing Healing can be increased this way by up to {{Limit}}%."
          }
        }
      },
      "PlanetaryRendezvous": {
        "Content": {
          "alliesSameElement": {
            "text": "Same element ally DMG boost",
            "title": "Departure",
            "content": "After entering battle, if an ally deals the same DMG Type as the wearer, DMG dealt increases by {{DmgBuff}}%."
          }
        }
      },
      "PoisedToBloom": {
        "Content": {
          "cdBuff": {
            "text": "Double path CD buff",
            "title": "Lose Not, Forget Not",
            "content": "Upon entering battle, if two or more characters follow the same Path, then these characters\" CRIT DMG increases by {{CritBuff}}% . "
          }
        }
      },
      "PostOpConversation": {
        "Content": {
          "postUltHealingBoost": {
            "text": "Ult healing boost",
            "title": "Mutual Healing",
            "content": "Increases the wearer's Outgoing Healing when they use their Ultimate by {{HealingBoost}}%."
          }
        }
      },
      "ResolutionShinesAsPearlsOfSweat": {
        "Content": {
          "targetEnsnared": {
            "text": "Target ensnared",
            "title": "Glance Back",
            "content": "When the wearer hits an enemy and if the hit enemy is not already Ensnared, then there is a chance to Ensnare the hit enemy. Ensnared enemies' DEF decreases by {{DefShred}}% for 1 turn(s)."
          }
        }
      },
      "RiverFlowsInSpring": {
        "Content": {
          "spdDmgBuff": {
            "text": "SPD / DMG buff active",
            "title": "Stave Off the Lingering Cold",
            "content": "After entering battle, increases the wearer's SPD by {{SpdBuff}}% and DMG by {{DmgBuff}}%. When the wearer takes DMG, this effect will disappear. This effect will resume after the end of the wearer's next turn."
          }
        }
      },
      "ShadowedByNight": {
        "Content": {
          "spdBuff": {
            "text": "SPD buff",
            "title": "Concealment",
            "content": "When entering battle or after dealing Break DMG, increases SPD by {{SpdBuff}}% , lasting for 2.0 turn(s)."
          }
        }
      },
      "SubscribeForMore": {
        "Content": {
          "maxEnergyDmgBoost": {
            "text": "Max energy DMG boost",
            "title": "Like Before You Leave!",
            "content": "Increases the DMG of the wearer's Basic ATK and Skill by {{DmgBuff}}%. This effect increases by an extra {{DmgBuff}}% when the wearer's current Energy reaches its max level."
          }
        }
      },
      "Swordplay": {
        "Content": {
          "sameTargetHitStacks": {
            "text": "Same target hit stacks",
            "title": "Answers of Their Own",
            "content": "For each time the wearer hits the same target, DMG dealt increases by {{DmgBuff}}%, stacking up to 5 time(s). This effect will be dispelled when the wearer changes targets."
          }
        }
      },
      "TheBirthOfTheSelf": {
        "Content": {
          "enemyHp50FuaBuff": {
            "text": "Enemy HP < 50% fua buff",
            "title": "The Maiden in the Painting",
            "content": "If the current HP of the target enemy is below or equal to 50%, increases DMG dealt by follow-up attacks by an extra {{DmgBuff}}%."
          }
        }
      },
      "TheDayTheCosmosFell": {
        "Content": {
          "cdBuffActive": {
            "text": "≥ 2 weakness targets CD buff",
            "title": "Stratagem",
            "content": "When the wearer uses an attack and at least 2 attacked enemies have the corresponding Weakness, the wearer's CRIT DMG increases by {{CritBuff}}% for 2 turn(s)."
          }
        }
      },
      "TheMolesWelcomeYou": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "title": "Fantastic Adventure",
            "content": "When the wearer uses Basic ATK, Skill, or Ultimate to attack enemies, the wearer gains one stack of Mischievous. Each stack increases the wearer's ATK by {{AtkBuff}}%."
          }
        }
      },
      "TheSeriousnessOfBreakfast": {
        "Content": {
          "dmgBoost": {
            "text": "DMG boost",
            "title": "Get Ready",
            "content": "Increases the wearer's DMG by {{DmgBuff}}%."
          },
          "defeatedEnemyAtkStacks": {
            "text": "Defeated enemy ATK stacks",
            "title": "Get Ready",
            "content": "For every enemy defeated by the wearer, the wearer's ATK increases by {{AtkBuff}}%, stacking up to 3 time(s)."
          }
        }
      },
      "ThisIsMe": {
        "Content": {
          "defScalingUltDmg": {
            "text": "DEF scaling Ult DMG (Not implemented)",
            "title": "New Chapter",
            "content": "Increases the DMG of the wearer when they use their Ultimate by {{Multiplier}}% of the wearer's DEF. This effect only applies 1 time per enemy target during each use of the wearer's Ultimate."
          }
        }
      },
      "TodayIsAnotherPeacefulDay": {
        "Content": {
          "maxEnergyStacks": {
            "text": "Max energy",
            "title": "A Storm Is Coming",
            "content": "After entering battle, increases the wearer's DMG based on their Max Energy. DMG increases by {{DmgStep}}% per point of Energy, up to 160 Energy."
          }
        }
      },
      "UnderTheBlueSky": {
        "Content": {
          "defeatedEnemyCrBuff": {
            "text": "Defeated enemy CR buff",
            "title": "Rye Under the Sun",
            "content": "When the wearer defeats an enemy, the wearer's CRIT Rate increases by {{CritBuff}}% for 3 turn(s)."
          }
        }
      },
      "WeAreWildfire": {
        "Content": {
          "initialDmgReductionBuff": {
            "text": "Initial DMG reduction buff",
            "title": "Teary-Eyed",
            "content": "At the start of the battle, the DMG dealt to all allies decreases by {{DmgReduction}}% for 5 turn(s). At the same time, immediately restores HP to all allies equal to {{Healing}}% of the respective HP difference between the characters' Max HP and current HP."
          }
        }
      },
      "WeWillMeetAgain": {
        "Content": {
          "extraDmgProc": {
            "text": "Additional DMG proc",
            "title": "A Discourse in Arms",
            "content": "After the wearer uses Basic ATK or Skill, deals Additional DMG equal to {{Multiplier}}% of the wearer's ATK to a random enemy that has been attacked."
          }
        }
      },
      "WoofWalkTime": {
        "Content": {
          "atkBoost": {
            "text": "Enemy burn / bleed DMG boost",
            "title": "Run!",
            "content": "Increases the wearer's DMG to enemies afflicted with Burn or Bleed by {{DmgBuff}}%. This also applies to DoT."
          }
        }
      },
      "Adversarial": {
        "Content": {
          "defeatedEnemySpdBuff": {
            "text": "Defeated enemy SPD buff",
            "title": "Alliance",
            "content": "When the wearer defeats an enemy, increases SPD by {{SpdBuff}}% for 2 turn(s)."
          }
        }
      },
      "Amber": {
        "Content": {
          "hp50DefBuff": {
            "text": "HP < 50% DEF buff",
            "title": "Stasis",
            "content": "If the wearer's current HP is lower than 50%, increases their DEF by a further {{DefBuff}}%."
          }
        }
      },
      "Arrows": {
        "Content": {
          "critBuff": {
            "text": "Initial CR buff",
            "title": "Crisis",
            "content": "At the start of the battle, the wearer's CRIT Rate increases by {{CritBuff}}% for 3 turn(s)."
          }
        }
      },
      "Chorus": {
        "Content": {
          "inBattleAtkBuff": {
            "text": "Initial ATK buff",
            "title": "Concerted",
            "content": "After entering battle, increases the ATK of all allies by {{AtkBuff}}%. Effects of the same type cannot stack."
          }
        }
      },
      "CollapsingSky": {
        "Content": {
          "basicSkillDmgBuff": {
            "text": "Basic / Skill DMG buff",
            "title": "Havoc",
            "content": "Increases the wearer's Basic ATK and Skill DMG by {{DmgBuff}}%."
          }
        }
      },
      "Cornucopia": {
        "Content": {
          "healingBuff": {
            "text": "Healing buff",
            "title": "Prosperity",
            "content": "When the wearer uses their Skill or Ultimate, their Outgoing Healing increases by {{HealingBuff}}%."
          }
        }
      },
      "DartingArrow": {
        "Content": {
          "defeatedEnemyAtkBuff": {
            "text": "Defeated enemy ATK buff",
            "title": "War Cry",
            "content": "When the wearer defeats an enemy, increases ATK by {{AtkBuff}}% for 3 turn(s)."
          }
        }
      },
      "DataBank": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "title": "Learned",
            "content": "Increases the wearer's Ultimate DMG by {{DmgBuff}}%."
          }
        }
      },
      "HiddenShadow": {
        "Content": {
          "basicAtkBuff": {
            "text": "Basic ATK additional DMG",
            "title": "Mechanism",
            "content": "After using Skill, the wearer's next Basic ATK deals Additional DMG equal to {{MultiplierBonus}}% of ATK to the target enemy."
          }
        }
      },
      "Loop": {
        "Content": {
          "enemySlowedDmgBuff": {
            "text": "Enemy slowed DMG buff",
            "title": "Pursuit",
            "content": "Increases DMG dealt from its wearer to Slowed enemies by {{DmgBuff}}%."
          }
        }
      },
      "Mediation": {
        "Content": {
          "initialSpdBuff": {
            "text": "Initial SPD buff",
            "title": "Family",
            "content": "Upon entering battle, increases SPD of all allies by {{SpdBuff}} points for 1 turn(s)."
          }
        }
      },
      "MutualDemise": {
        "Content": {
          "selfHp80CrBuff": {
            "text": "Self HP < 80% CR buff",
            "title": "Legion",
            "content": "If the wearer's current HP is lower than 80%, CRIT Rate increases by {{CritBuff}}%."
          }
        }
      },
      "Sagacity": {
        "Content": {
          "postUltAtkBuff": {
            "text": "Post Ult ATK buff",
            "title": "Genius",
            "content": "When the wearer uses their Ultimate, increases ATK by {{AtkBuff}}% for 2 turn(s)."
          }
        }
      },
      "ShatteredHome": {
        "Content": {
          "enemyHp50Buff": {
            "text": "Enemy HP > 50% DMG buff",
            "title": "Eradication",
            "content": "The wearer deals {{DmgBuff}}% more DMG to enemy targets whose HP percentage is greater than 50%."
          }
        }
      },
      "Void": {
        "Content": {
          "initialEhrBuff": {
            "text": "Initial EHR buff",
            "title": "Fallen",
            "content": "At the start of the battle, the wearer's Effect Hit Rate increases by {{EhrBuff}}% for 3 turn(s)."
          }
        }
      }
    },
    "Characters": {
      "Acheron": {
        "Content": {
          "crimsonKnotStacks": {
            "text": "Crimson Knot stacks",
            "title": "Slashed Dream Cries in Red",
            "content": "Rainblade: Deals Lightning DMG equal to {{RainbladeScaling}}% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to {{CrimsonKnotScaling}}% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, the DMG Multiplier for this is additionally increased.::BR::When the Rainblade from Acheron's Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 time(s)."
          },
          "nihilityTeammates": {
            "text": "Nihility teammates",
            "title": "The Abyss",
            "content": "When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to 115% or 160% of the original DMG respectively.::BR::E2: The number of Nihility characters required for the Trace \"The Abyss\" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks."
          },
          "thunderCoreStacks": {
            "text": "Thunder Core stacks",
            "title": "Thunder Core",
            "content": "When the Rainblade from Acheron's Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 time(s) and lasting for 3 turn(s)."
          },
          "stygianResurgeHitsOnTarget": {
            "text": "Stygian Resurge hits",
            "title": "Thunder Core",
            "content": "When Stygian Resurge triggers, additionally deals DMG for 6 times. Each time deals Lightning DMG equal to 25% of Acheron's ATK to a single random enemy and is viewed as part of the Ultimate DMG."
          },
          "e1EnemyDebuffed": {
            "text": "E1 CR boost",
            "title": "E1: Silenced Sky Spake Sooth",
            "content": "When dealing DMG to debuffed enemies, increases the CRIT Rate by 18%."
          },
          "e4UltVulnerability": {
            "text": "E4 Ult vulnerability",
            "title": "E4: Shrined Fire for Mirrored Soul",
            "content": "When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%."
          },
          "e6UltBuffs": {
            "text": "E6 Ult buffs",
            "title": "E6: Apocalypse, the Emancipator",
            "content": "Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect."
          }
        }
      },
      "Argenti": {
        "Content": {
          "ultEnhanced": {
            "text": "Enhanced Ult",
            "title": "Merit Bestowed in \"My\" Garden",
            "content": "Consumes 180 Energy and deals Physical DMG equal to {{ultEnhancedScaling}}% of Argenti's ATK to all enemies, and further deals DMG for 6 extra time(s), with each time dealing Physical DMG equal to {{ultEnhancedExtraHitScaling}}% of Argenti's ATK to a random enemy."
          },
          "enemyHp50": {
            "text": "Enemy HP ≤ 50% DMG boost",
            "title": "Courage",
            "content": "Deals 15% more DMG to enemies whose HP percentage is 50% or less."
          },
          "talentStacks": {
            "text": "Apotheosis stacks",
            "title": "Sublime Object",
            "content": "Increases CR by {{talentCrStackValue}}% per stack, max of {{talentMaxStacks}} stacks."
          },
          "ultEnhancedExtraHits": {
            "text": "Enhanced Ult extra hits on target",
            "title": "Merit Bestowed in \"My\" Garden",
            "content": "Enhanced Ult hits a random enemy for {{ultEnhancedExtraHitScaling}}% ATK per hit."
          },
          "e2UltAtkBuff": {
            "text": "E2 Ult ATK buff",
            "title": "Agate's Humility",
            "content": "E2: If the number of enemies on the field equals to 3 or more, increases ATK by 40% for 1 turn."
          }
        }
      },
      "Arlan": {
        "Content": {
          "selfCurrentHpPercent": {
            "text": "Self current HP%",
            "title": "Pain and Anger",
            "content": "Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of {{talentMissingHpDmgBoostMax}}% DMG dealt by Arlan."
          }
        }
      },
      "Asta": {
        "Content": {
          "skillExtraDmgHits": {
            "text": "Skill extra hits",
            "title": "Meteor Storm",
            "content": "Deals 50% ATK DMG equal to a single enemy. Deals DMG for {{skillExtraDmgHitsMax}} extra times to a random enemy.::BR::E1: When using Skill, deals DMG for 1 extra time to a random enemy."
          },
          "talentBuffStacks": {
            "text": "Talent ATK buff stacks",
            "title": "Astrometry",
            "content": "Increases allies\" ATK by {{talentStacksAtkBuff}}% for every stack.::BR::E4: Asta\"s Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks."
          },
          "ultSpdBuff": {
            "text": "Ult SPD buff active",
            "title": "Astral Blessing",
            "content": "Increases SPD of all allies by {{ultSpdBuffValue}} for 2 turn(s)."
          },
          "fireDmgBoost": {
            "text": "Fire DMG buff",
            "title": "Ignite",
            "content": "When Asta is on the field, all allies' Fire DMG increases by 18%."
          }
        }
      },
      "Aventurine": {
        "Content": {
          "defToCrBoost": {
            "text": "DEF to CR buff",
            "title": "Leverage",
            "content": "For every 100 of Aventurine's DEF that exceeds 1600, increases his own CRIT Rate by 2%, up to a maximum increase of 48%."
          },
          "fortifiedWagerBuff": {
            "text": "Fortified Wager buff",
            "title": "Cornerstone Deluxe",
            "content": "For any single ally with Fortified Wager, their Effect RES increases by {{talentResScaling}}%, and when they get attacked, Aventurine gains 1 point of Blind Bet.::BR::E1: Increases CRIT DMG by 20% for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s)."
          },
          "enemyUnnervedDebuff": {
            "text": "Enemy Unnerved",
            "title": "Roulette Shark",
            "content": "When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by {{ultCdBoost}}%."
          },
          "fuaHitsOnTarget": {
            "text": "FUA hits on target",
            "title": "Bingo!",
            "content": "Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit follow-up attack, with each hit dealing Imaginary DMG equal to {{talentDmgScaling}}% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points.::BR::E4: When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by 3."
          },
          "e2ResShred": {
            "text": "E2 RES shred",
            "title": "Bounded Rationality",
            "content": "When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turn(s)."
          },
          "e4DefBuff": {
            "text": "E4 DEF buff",
            "title": "Unexpected Hanging Paradox",
            "content": "E4: When triggering his Talent\"s follow-up attack, first increases Aventurine\"s DEF by 40% for 2 turn(s)"
          },
          "e6ShieldStacks": {
            "text": "E6 shield stacks",
            "title": "Stag Hunt Game",
            "content": "E6: For every ally that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%."
          }
        }
      },
      "Bailu": {
        "Content": {
          "healingMaxHpBuff": {
            "text": "Healing max HP buff",
            "title": "Qihuang Analects",
            "content": "When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by 10% for 2 turns."
          },
          "talentDmgReductionBuff": {
            "text": "Invigoration DMG reduction",
            "title": "Aquatic Benediction",
            "content": "Characters with Invigoration take 10% less DMG."
          },
          "e2UltHealingBuff": {
            "text": "E2 Ult healing buff",
            "title": "Sylphic Slumber",
            "content": "E2: Increases healing by 15% after Ultimate."
          },
          "e4SkillHealingDmgBuffStacks": {
            "text": "E4 Skill DMG boost stacks",
            "title": "Evil Excision",
            "content": "E4: Every healing provided by Bailu\"s Skill makes the recipient deal 10% more DMG for 2 turns. This effect can stack up to 3 times."
          }
        }
      },
      "BlackSwan": {
        "Content": {
          "ehrToDmgBoost": {
            "text": "EHR to DMG boost",
            "title": "Candleflame's Portent",
            "content": "Increases this unit's DMG by an amount equal to 60% of Effect Hit Rate, up to a maximum DMG increase of 72%."
          },
          "epiphanyDebuff": {
            "text": "Epiphany debuff",
            "title": "Bliss of Otherworld's Embrace",
            "content": "Enemies affected by Epiphany take {{epiphanyDmgTakenBoost}}% more DMG in their turn."
          },
          "defDecreaseDebuff": {
            "text": "DEF shred debuff",
            "title": "Decadence, False Twilight",
            "content": "Enemies DEF is decreased by {{defShredValue}}"
          },
          "arcanaStacks": {
            "text": "Arcana stacks",
            "title": "Loom of Fate's Caprice",
            "content": "While afflicted with Arcana, enemy targets receive Wind DoT equal to {{dotScaling}}% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DoT DMG multiplier by {{arcanaStackMultiplier}}%. Arcana can stack up to 50 times.::BR::When there are 3 or more Arcana stacks, deals Wind DoT to adjacent targets. When there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF."
          },
          "e1ResReduction": {
            "text": "E1 RES shred",
            "title": "Seven Pillars of Wisdom",
            "content": "E1: While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%."
          }
        }
      },
      "Blade": {
        "Content": {
          "enhancedStateActive": {
            "text": "Hellscape state",
            "title": "Hellscape",
            "content": "Increases DMG by {{enhancedStateDmgBoost}}% and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turn(s).::BR::E2: Increases CRIT Rate by 15%."
          },
          "hpPercentLostTotal": {
            "text": "HP% lost total",
            "title": "Death Sentence",
            "content": "Ultimate DMG scales off of the tally of Blade's HP loss in the current battle. The tally of Blade's HP loss in the current battle is capped at {{hpPercentLostTotalMax}}% of his Max HP."
          },
          "e4MaxHpIncreaseStacks": {
            "text": "E4 max HP stacks",
            "title": "Rejected by Death, Infected With Life",
            "content": "E4: Increases HP by 20%, stacks up to 2 times."
          }
        }
      },
      "Boothill": {
        "Content": {
          "standoffActive": {
            "text": "Standoff Active",
            "title": "Sizzlin' Tango",
            "content": "Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for 2 turn(s). This duration reduces by 1 at the start of Boothill's every turn. The enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by {{standoffVulnerabilityBoost}}%/15%."
          },
          "pocketTrickshotStacks": {
            "text": "Pocket Trickshots",
            "title": "Five Peas in a Pod",
            "content": "Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by 50%, stacking up to 3 time(s)."
          },
          "beToCritBoost": {
            "text": "BE to CR / CD buff",
            "title": "Ghost Load",
            "content": "Increase this character's CRIT Rate/CRIT DMG, by an amount equal to 10%/50% of Break Effect, up to a max increase of 30%/150%."
          },
          "talentBreakDmgScaling": {
            "text": "Talent Break DMG (force weakness break)",
            "title": "Five Peas in a Pod",
            "content": "If the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals Break DMG to this target based on Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed 16 times the base Toughness Reduction of the Basic Attack \"Skullcrush Spurs.\""
          },
          "e1DefShred": {
            "text": "E1 DEF PEN",
            "title": "Dusty Trail's Lone Star",
            "content": "When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores 16% of the enemy target's DEF."
          },
          "e2BeBuff": {
            "text": "E2 BE buff",
            "title": "Milestonemonger",
            "content": "When in Standoff and gaining Pocket Trickshot, recovers 1 Skill Point(s) and increases Break Effect by 30%, lasting for 2 turn(s). Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn."
          },
          "e4TargetStandoffVulnerability": {
            "text": "E4 Skill vulnerability",
            "title": "Cold Cuts Chef",
            "content": "When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by 12%. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by 12%."
          },
          "e6AdditionalBreakDmg": {
            "text": "E6 Break DMG boost",
            "title": "Crowbar Hotel's Raccoon",
            "content": "When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40% of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to 70% of the original DMG multiplier."
          }
        }
      },
      "Bronya": {
        "Content": {
          "teamDmgBuff": {
            "text": "Team DMG buff",
            "title": "Military Might",
            "content": "When Bronya is on the field, all allies deal 10% more DMG."
          },
          "skillBuff": {
            "text": "Skill DMG buff",
            "title": "Combat Redeployment",
            "content": "Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by {{skillDmgBoostValue}}% for 1 turn(s)."
          },
          "ultBuff": {
            "text": "Ult ATK / CD buffs",
            "title": "The Belobog March",
            "content": "Increases the ATK of all allies by {{ultAtkBoostValue}}% and CRIT DMG by {{ultCdBoostValue}}% of Bronya's CRIT DMG plus {{ultCdBoostBaseValue}}% for 2 turns."
          },
          "battleStartDefBuff": {
            "text": "Initial DEF buff",
            "title": "Battlefield",
            "content": "At the start of the battle, all allies' DEF increases by 20% for 2 turn(s)."
          },
          "techniqueBuff": {
            "text": "Technique ATK buff",
            "title": "Banner of Command",
            "content": "After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turn(s)."
          },
          "e2SkillSpdBuff": {
            "text": "E2 Skill SPD buff",
            "title": "Quick March",
            "content": "When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateCDValue": {
            "text": "Bronya's Combat CD",
            "title": "The Belobog March",
            "content": "Increases the ATK of all allies by {{ultAtkBoostValue}}% and CRIT DMG by {{ultCdBoostValue}}% of Bronya's CRIT DMG plus {{ultCdBoostBaseValue}}% for 2 turns."
          }
        }
      },
      "Clara": {
        "Content": {
          "ultBuff": {
            "text": "Ult buffs",
            "title": "Promise, Not Command",
            "content": "Increases Svarog Counter DMG by {{ultFuaExtraScaling}}% during Ultimate. DMG dealt to Clara is reduced by an extra {ultDmgReductionValue}}% for 2 turns"
          },
          "talentEnemyMarked": {
            "text": "Enemy Marked",
            "title": "Svarog Watches Over You",
            "content": "Additionally deals Physical DMG equal to {{skillScaling}}% of Clara's ATK to enemies marked by Svarog with a Mark of Counter."
          },
          "e2UltAtkBuff": {
            "text": "E2 Ult ATK buff",
            "title": "A Tight Embrace",
            "content": "E2: After using Ultimate, increases ATK by 30% for 2 turns."
          },
          "e4DmgReductionBuff": {
            "text": "E4 DMG reduction buff",
            "title": "Family's Warmth",
            "content": "E4: Decreases DMG taken by 30%."
          }
        }
      },
      "DanHeng": {
        "Content": {
          "talentPenBuff": {
            "text": "Talent RES PEN buff",
            "title": "Superiority of Reach",
            "content": "When Dan Heng is the target of an ally's Ability, his next attack's Wind RES PEN increases by {{extraPenValue}}%."
          },
          "enemySlowed": {
            "text": "Enemy slowed",
            "title": "High Gale",
            "content": "Basic ATK deals 40% more damage to Slowed enemies."
          },
          "e1EnemyHp50": {
            "text": "E1 enemy HP ≥ 50% CR boost",
            "title": "The Higher You Fly, the Harder You Fall",
            "content": "E1: When the target enemy\"s current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%."
          }
        }
      },
      "DrRatio": {
        "Content": {
          "summationStacks": {
            "text": "Summation stacks",
            "title": "Summation",
            "content": "When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by 2.5% and CRIT DMG by 5%. This effect can stack up to {{summationStacksMax}} time(s)."
          },
          "enemyDebuffStacks": {
            "text": "Enemy debuff stacks",
            "title": "Cogito, Ergo Sum",
            "content": "When using his Skill, Dr. Ratio has a 40% fixed chance of launching a follow-up attack against his target for 1 time, dealing Imaginary DMG equal to {{FuaScaling}}% of Dr. Ratio's ATK. For each debuff the target enemy has, the fixed chance of launching follow-up attack increases by 20%. If the target enemy is defeated before the follow-up attack triggers, the follow-up attack will be directed at a single random enemy instead.::BR::When dealing DMG to a target that has 3 or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by 10%, up to a maximum increase of 50%.::BR::E2: When his Talent's follow-up attack hits a target, for every debuff the target has, additionally deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 times during each follow-up attack."
          }
        }
      },
      "Feixiao": {
        "Content": {
          "weaknessBrokenUlt": {
            "text": "Weakness broken ult (force weakness break)",
            "title": "Weakness broken ult (force weakness break)",
            "content": "Overrides weakness break to be enabled."
          },
          "talentDmgBuff": {
            "text": "Talent DMG buff",
            "title": "Thunderhunt",
            "content": "After Feixiao's teammates attack enemy targets, Feixiao immediately launches follow-up attack against the primary target, dealing Wind DMG equal to {{FuaMultiplier}}% of Feixiao's ATK. If there is no primary target available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by {{DmgBuff}}%, lasting for 2 turn(s)."
          },
          "skillAtkBuff": {
            "text": "Skill ATK buff",
            "title": "Boltcatch",
            "content": "When using Skill, increases ATK by 48.0%, lasting for 3.0 turn(s)."
          },
          "e1OriginalDmgBoost": {
            "text": "E1 original DMG boost",
            "title": "Skyward I Quell",
            "content": "E1: After launching \"Boltsunder Blitz\" or \"Waraxe Skyward,\" additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to 10.0% of the original DMG, stacking up to 5.0 time(s) and lasting until the end of the Ultimate action."
          },
          "e4Buffs": {
            "text": "E4 buffs",
            "title": "Stormward I Hear",
            "content": "The Toughness Reduction from the Talent's Follow-up ATK increases by 100.0% and, when launched, increases this unit's SPD by 8.0%, lasting for 2.0 turn(s)."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "title": "Homeward I Near",
            "content": "Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by 20.0%. Talent's follow-up attack DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by 140.0%."
          }
        }
      },
      "Firefly": {
        "Content": {
          "enhancedStateActive": {
            "text": "Enhanced state",
            "title": "Fyrefly Type-IV: Complete Combustion",
            "content": "Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill."
          },
          "enhancedStateSpdBuff": {
            "text": "Enhanced SPD buff",
            "title": "Fyrefly Type-IV: Complete Combustion",
            "content": "While in Complete Combustion, increases SPD by {{ultSpdBuff}}."
          },
          "superBreakDmg": {
            "text": "Super Break enabled (force weakness break)",
            "title": "Module β: Autoreactive Armor",
            "content": "When SAM is in Complete Combustion with a Break Effect that is equal to or greater than 200%/360%, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of 35%/50% Super Break DMG."
          },
          "atkToBeConversion": {
            "text": "ATK to BE buff",
            "title": "Module γ: Core Overload",
            "content": "For every 10 point(s) of SAM's ATK that exceeds 1800, increases this unit's Break Effect by 0.8%."
          },
          "talentDmgReductionBuff": {
            "text": "Max EHP buff",
            "title": "Chrysalid Pyronexus",
            "content": "The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to {{talentDmgReductionBuff}}%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by {{talentResBuff}}%."
          },
          "e1DefShred": {
            "text": "E1 DEF PEN",
            "title": "In Reddened Chrysalis, I Once Rest",
            "content": "When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points."
          },
          "e4ResBuff": {
            "text": "E4 RES buff",
            "title": "Upon Lighted Fyrefly, I Soon Gaze",
            "content": "While in Complete Combustion, increases SAM's Effect RES by 50%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "title": "In Finalized Morrow, I Full Bloom",
            "content": "While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break efficiency by 50%."
          }
        }
      },
      "FuXuan": {
        "Content": {
          "talentActive": {
            "text": "Team DMG reduction",
            "title": "Bleak Breeds Bliss",
            "content": "While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take {{talentDmgReductionValue}}% less DMG."
          },
          "skillActive": {
            "text": "Skill active",
            "title": "Known by Stars, Shown by Hearts",
            "content": "Activates Matrix of Prescience, via which other team members will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s). While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by {{skillHpBuffValue}}% of Fu Xuan's Max HP, and increases CRIT Rate by {{skillCrBuffValue}}%."
          },
          "e6TeamHpLostPercent": {
            "text": "E6 team HP lost",
            "title": "Omnia Vita",
            "content": "E6: Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. Fu Xuan's Ultimate DMG will increase by 200% of this tally of HP loss. This tally is also capped at 120% of Fu Xuan's Max HP."
          }
        },
        "TeammateContent": {
          "teammateHPValue": {
            "text": "Fu Xuan's Combat HP",
            "title": "Known by Stars, Shown by Hearts",
            "content": "While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by {{skillHpBuffValue}}% of Fu Xuan's Max HP"
          }
        }
      },
      "Gallagher": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "title": "Nectar Blitz",
            "content": "Ultimate enhances his next Basic ATK to Nectar Blitz."
          },
          "breakEffectToOhbBoost": {
            "text": "BE to OHB buff",
            "title": "Novel Concoction",
            "content": "Increases this unit's Outgoing Healing by an amount equal to 50% of Break Effect, up to a maximum Outgoing Healing increase of 75%."
          },
          "targetBesotted": {
            "text": "Target Besotted",
            "title": "Tipsy Tussle",
            "content": "The Besotted state makes targets receive {{talentBesottedScaling}}% more Break DMG."
          },
          "e1ResBuff": {
            "text": "E1 RES buff",
            "title": "Salty Dog",
            "content": "E1: When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%."
          },
          "e2ResBuff": {
            "text": "E2 RES buff",
            "title": "Lion's Tail",
            "content": "E2: When using the Skill, removes 1 debuff(s) from the target ally. At the same time, increases their Effect RES by 30%, lasting for 2 turn(s)."
          },
          "e6BeBuff": {
            "text": "E6 BE buff",
            "title": "Blood and Sand",
            "content": "E6: Increases Gallagher\"s Break Effect by 20% and Weakness Break Efficiency by 20%."
          }
        }
      },
      "Gepard": {
        "Content": {
          "e4TeamResBuff": {
            "text": "E4 team RES buff",
            "title": "Faith Moves Mountains",
            "content": "E4: When Gepard is in battle, all allies\" Effect RES increases by 20%."
          }
        }
      },
      "Guinaifen": {
        "Content": {
          "talentDebuffStacks": {
            "text": "Firekiss stacks",
            "title": "PatrAeon Benefits",
            "content": "While inflicted with Firekiss, the enemy receives {{talentDebuffDmgIncreaseValue}}% increased DMG, which lasts for 3 turns and can stack up to {{talentDebuffMax}} times."
          },
          "enemyBurned": {
            "text": "Enemy burned",
            "title": "Walking on Knives",
            "content": "Increases DMG by 20% against enemies affected by Burn."
          },
          "skillDot": {
            "text": "Use Skill DoT chance",
            "title": "Use Skill DoT chance",
            "content": "When enabled, uses the Skill's 100% DoT chance instead of the Basic's 80% DoT chance."
          },
          "e1EffectResShred": {
            "text": "E1 Effect RES shred",
            "title": "Slurping Noodles During Handstand",
            "content": "E1: When Skill is used, there is a 100% base chance to reduce the attacked target enemy\"s Effect RES by 10% for 2 turn(s)."
          },
          "e2BurnMultiBoost": {
            "text": "E2 burn multi boost",
            "title": "Brushing Teeth While Whistling",
            "content": "E2: When an enemy target is Burned, Guinaifen\"s Basic ATK and Skill can increase the DMG multiplier of their Burn status by 40%."
          }
        }
      },
      "Hanya": {
        "Content": {
          "ultBuff": {
            "text": "Ult SPD / ATK buff",
            "title": "Ten-Lords' Decree, All Shall Obey",
            "content": "Increases the SPD of a target ally by {{ultSpdBuffValue}}% of Hanya's SPD and increases the same target ally's ATK by {{ultAtkBuffValue}}%."
          },
          "targetBurdenActive": {
            "text": "Target Burden debuff",
            "title": "Sanction",
            "content": "When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by {{talentDmgBoostValue}}% for 2 turn(s)."
          },
          "burdenAtkBuff": {
            "text": "Burden ATK buff",
            "title": "Scrivener",
            "content": "Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn(s)."
          },
          "e2SkillSpdBuff": {
            "text": "E2 Skill SPD buff",
            "title": "Two Views",
            "content": "E2: After Skill, increases SPD by 20% for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateSPDValue": {
            "text": "Hanya's SPD",
            "title": "Ten-Lords' Decree, All Shall Obey",
            "content": "Increases the SPD of a target ally by {{ultSpdBuffValue}}% of Hanya's SPD and increases the same target ally's ATK by {{ultAtkBuffValue}}%."
          }
        }
      },
      "Herta": {
        "Content": {
          "fuaStacks": {
            "text": "Followup attack hits",
            "title": "Fine, I'll Do It Myself",
            "content": "When an ally's attack causes an enemy's HP percentage to fall to 50% or lower, Herta will launch a follow-up attack, dealing Ice DMG."
          },
          "targetFrozen": {
            "text": "Target frozen",
            "title": "Icing",
            "content": "When Ultimate is used, deals 20% more DMG to Frozen enemies."
          },
          "enemyHpGte50": {
            "text": "Skill DMG boost",
            "title": "One-Time Offer",
            "content": "If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%."
          },
          "techniqueBuff": {
            "text": "Technique ATK buff",
            "title": "It Can Still Be Optimized",
            "content": "Increases ATK by 40% for 3 turns."
          },
          "enemyHpLte50": {
            "text": "E1 Basic scaling boost",
            "title": "Kick You When You're Down",
            "content": "E1: If the enemy\"s HP percentage is at 50% or less, Herta\"s Basic ATK deals Additional Ice DMG equal to 40% of Herta\"s ATK."
          },
          "e2TalentCritStacks": {
            "text": "E2 Talent CR stacks",
            "title": "Keep the Ball Rolling",
            "content": "E2: Increases CRIT Rate by 3% per stack. Stacks up to 5 times."
          },
          "e6UltAtkBuff": {
            "text": "E6 Ult ATK buff",
            "title": "No One Can Betray Me",
            "content": "E6: After Ult, increases ATK by 25% for 1 turn."
          }
        }
      },
      "Himeko": {
        "Content": {
          "targetBurned": {
            "text": "Target burned",
            "title": "Magma",
            "content": "Skill deals 20% more DMG to enemies currently afflicted with Burn."
          },
          "selfCurrentHp80Percent": {
            "text": "Self HP ≥ 80% CR buff",
            "title": "Benchmark",
            "content": "When current HP percentage is 80% or higher, CRIT Rate increases by 15%."
          },
          "e1TalentSpdBuff": {
            "text": "E1 SPD buff",
            "title": "Childhood",
            "content": "E1: After Victory Rush is triggered, Himeko\"s SPD increases by 20% for 2 turns."
          },
          "e2EnemyHp50DmgBoost": {
            "text": "E2 enemy HP ≤ 50% DMG boost",
            "title": "Convergence",
            "content": "E2: Deals 15% more DMG to enemies whose HP percentage is 50% or less."
          },
          "e6UltExtraHits": {
            "text": "E6 Ult extra hits",
            "title": "Trailblaze!",
            "content": "Ultimate deals DMG 2 extra times. Extra hits deals 40% of the original DMG per hit."
          }
        }
      },
      "Hook": {
        "Content": {
          "enhancedSkill": {
            "text": "Enhanced Skill",
            "title": "Hey! Remember Hook?",
            "content": "After using Ultimate, the next Skill to be used is Enhanced. Enhanced Skill deals Fire DMG equal to {{skillEnhancedScaling}}% of Hook's ATK to a single enemy and reduced DMG to adjacent enemies."
          },
          "targetBurned": {
            "text": "Target burned",
            "title": "Ha! Oil to the Flames!",
            "content": "When attacking a target afflicted with Burn, deals Additional Fire DMG equal to {{targetBurnedExtraScaling}}% of Hook's ATK.::BR::E6: Hook deals 20.0% more DMG to enemies afflicted with Burn."
          }
        }
      },
      "Huohuo": {
        "Content": {
          "ultBuff": {
            "text": "Ult ATK buff",
            "title": "Tail: Spiritual Domination",
            "content": "Increases all allies' ATK by {{ultBuffValue}}% for 2 turns after using Ultimate."
          },
          "skillBuff": {
            "text": "E1 SPD buff",
            "title": "Anchored to Vessel, Specters Nestled",
            "content": "E1: When Huohuo possesses Divine Provision, all allies\" SPD increases by 12%."
          },
          "e6DmgBuff": {
            "text": "E6 DMG buff",
            "title": "Woven Together, Cohere Forever",
            "content": "E6: When healing a target ally, increases the target ally\"s DMG dealt by 50% for 2 turns."
          }
        }
      },
      "ImbibitorLunae": {
        "Content": {
          "basicEnhanced": {
            "text": "Basic enhancements",
            "title": "Dracore Libre",
            "content": "0 stack(s): Uses a 2-hit attack and deals Imaginary DMG equal to {{basicScaling}}% ATK to a single enemy target.::BR::1 stack(s): Uses a 3-hit attack and deals Imaginary DMG equal to {{basicEnhanced1Scaling}}% ATK to a single enemy target.::BR::2 stack(s): Uses a 5-hit attack and deals Imaginary DMG equal to {{basicEnhanced2Scaling}}% ATK to a single enemy target and reduced DMG to adjacent targets.::BR::3 stack(s): Uses a 7-hit attack and deals Imaginary DMG equal to {{basicEnhanced3Scaling}}% ATK to a single enemy target and reduced DMG to adjacent targets."
          },
          "skillOutroarStacks": {
            "text": "Outroar stacks",
            "title": "Dracore Libre",
            "content": "Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by {{outroarStackCdValue}}%, for a max of 4 stacks. (applied to all hits)"
          },
          "talentRighteousHeartStacks": {
            "text": "Righteous Heart stacks",
            "title": "Righteous Heart",
            "content": "After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by {{righteousHeartDmgValue}}%. (applied to all hits)"
          },
          "e6ResPenStacks": {
            "text": "E6 RES PEN stacks",
            "title": "Reign, Returned",
            "content": "E6: After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae\"s next Fulgurant Leap attack increases by 20%, up to 3 stacks."
          }
        }
      },
      "Jade": {
        "Content": {
          "enhancedFollowUp": {
            "text": "Enhanced FuA",
            "title": "Vow of the Deep",
            "content": "Jade enhances her Talent's follow-up attack, increasing its DMG multiplier by {{ultFuaScalingBuff}}%."
          },
          "pawnedAssetStacks": {
            "text": "Pawned Asset stacks",
            "title": "Fang of Flare Flaying",
            "content": "When launching her Talent's follow-up attack, Jade immediately gains 5 stack(s) of Pawned Asset, with each stack increasing CRIT DMG by {{pawnedAssetCdScaling}}%, stacking up to 50 times. Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%."
          },
          "e1FuaDmgBoost": {
            "text": "E1 FUA DMG boost",
            "title": "Altruism? Nevertheless Tradable",
            "content": "E1: The follow-up attack DMG from Jade's Talent increases by 32%. After the Debt Collector character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of Charge respectively."
          },
          "e2CrBuff": {
            "text": "E2 CR buff",
            "title": "Morality? Herein Authenticated",
            "content": "E2: When there are 15 stacks of Pawned Asset, Jade\"s CRIT Rate increases by 18%."
          },
          "e4DefShredBuff": {
            "text": "E4 DEF shred buff",
            "title": "Sincerity? Put Option Only",
            "content": "E4: When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets\" DEF, lasting for 3 turn(s)."
          },
          "e6ResShredBuff": {
            "text": "E6 RES PEN buff",
            "title": "Equity? Pending Sponsorship",
            "content": "E6: When the Debt Collector character exists on the field, Jade\"s Quantum RES PEN increases by 20%, and Jade gains the Debt Collector state."
          }
        },
        "TeammateContent": {
          "debtCollectorSpdBuff": {
            "text": "Debt Collector SPD buff",
            "title": "Acquisition Surety",
            "content": "Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s)."
          }
        }
      },
      "Jiaoqiu": {
        "Content": {
          "ashenRoastStacks": {
            "text": "Ashen Roast stacks",
            "title": "Quartet Finesse, Octave Finery",
            "content": "When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by {{AshenRoastInitialVulnerability}}%. Then, each subsequent stack increases this by {{AshenRoastAdditionalVulnerability}}%.::BR::Ashen Roast is capped at 5 stack(s) and lasts for 2 turn(s).::BR::When an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to {{AshenRoastDotMultiplier}}% of Jiaoqiu's ATK at the start of each turn."
          },
          "ultFieldActive": {
            "text": "Ult field active",
            "title": "Pyrograph Arcanum",
            "content": "Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to {{UltScaling}}% of Jiaoqiu's ATK to all enemies.::BR::While inside the Zone, enemy targets receive {{UltVulnerability}}% increased Ultimate DMG, with a {{ZoneDebuffChance}}% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate."
          },
          "ehrToAtkBoost": {
            "text": "EHR to ATK buff",
            "title": "Hearth Kindle",
            "content": "For every 15.0% of Jiaoqiu's Effect Hit Rate that exceeds 80.0%, additionally increases ATK by 60.0%, up to 240.0%."
          },
          "e1DmgBoost": {
            "text": "E1 DMG boost",
            "title": "Pentapathic Transference",
            "content": "E1: Allies deal 40.0% increased DMG to enemy targets afflicted with Ashen Roast."
          },
          "e2Dot": {
            "text": "E2 DoT scaling",
            "title": "From Savor Comes Suffer",
            "content": "E2: When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300.0%."
          },
          "e6ResShred": {
            "text": "E6 RES shred",
            "title": "Nonamorphic Pyrobind",
            "content": "E6: The maximum stack limit of Ashen Roast increases to 9.0, and each \"Ashen Roast\" stack reduces the target\"s All-Type RES by 3.0%."
          }
        }
      },
      "Jingliu": {
        "Content": {
          "talentEnhancedState": {
            "text": "Enhanced state",
            "title": "Crescent Transmigration",
            "content": "When Jingliu has 2 stacks of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by 100% and her CRIT Rate increases by {{talentCrBuff}}%. Then, Jingliu's Skill \"Transcendent Flash\" becomes enhanced and turns into \"Moon On Glacial River,\" and becomes the only ability she can use in battle."
          },
          "talentHpDrainAtkBuff": {
            "text": "HP drain ATK buff",
            "title": "Crescent Transmigration",
            "content": "When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies and Jingliu's ATK increases based on the total HP consumed from all allies in this attack, capped at {{talentHpDrainAtkBuffMax}}% of her base ATK, lasting until the current attack ends."
          },
          "e1CdBuff": {
            "text": "E1 Ult active",
            "title": "Moon Crashes Tianguan Gate",
            "content": "E1: When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn. If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK."
          },
          "e2SkillDmgBuff": {
            "text": "E2 Skill buff",
            "title": "Crescent Shadows Qixing Dipper",
            "content": "E2: After using Ultimate, increases the DMG of the next Enhanced Skill by 80%."
          }
        }
      },
      "JingYuan": {
        "Content": {
          "skillCritBuff": {
            "text": "Skill CR buff",
            "title": "War Marshal",
            "content": "After using Skill, CRIT Rate increases by 10% for 2 turns."
          },
          "talentHitsPerAction": {
            "text": "Lightning Lord stacks",
            "title": "Prana Extirpated",
            "content": "Lightning Lord hits-per-action stack up to 10 times."
          },
          "talentAttacks": {
            "text": "Lightning Lord hits on target",
            "title": "Prana Extirpated",
            "content": "Count of hits on target. Should usually be set to the same value as Lightning Lord Stacks."
          },
          "e2DmgBuff": {
            "text": "E2 DMG boost",
            "title": "Swing, Skies Squashed",
            "content": "E2: After Lightning-Lord takes action, DMG caused by Jing Yuan\"s Basic ATK, Skill, and Ultimate increases by 20% for 2 turns."
          },
          "e6FuaVulnerabilityStacks": {
            "text": "E6 Vulnerable stacks",
            "title": "Sweep, Souls Slain",
            "content": "E6: Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable. While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s). (applies to all hits)"
          }
        }
      },
      "Kafka": {
        "Content": {
          "e1DotDmgReceivedDebuff": {
            "text": "E1 DoT vulnerability",
            "title": "Da Capo",
            "content": "E1: When the Talent triggers a follow-up attack, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turn(s)."
          },
          "e2TeamDotBoost": {
            "text": "E2 Team DoT DMG boost",
            "title": "Fortississimo",
            "content": "E2: While Kafka is on the field, DoT dealt by all allies increases by 25%."
          }
        }
      },
      "Lingsha": {
        "Content": {
          "beConversion": {
            "text": "BE to ATK / OHB buff",
            "title": "Vermilion Waft",
            "content": "Increases this unit's ATK or Outgoing Healing by an amount equal to 25.0%/10.0% of Break Effect, up to a maximum increase of 50.0%/20.0% respectively."
          },
          "befogState": {
            "text": "Befog state",
            "title": "Dripping Mistscape",
            "content": "While in \"Befog,\" targets receive {{BefogVulnerability}}% increased Break DMG."
          },
          "e1DefShred": {
            "text": "E1 weakness break buffs",
            "title": "Bloom on Vileward Bouquet",
            "content": "E1: Lingsha\"s Weakness Break Efficiency increases by 50%. When an enemy unit\"s Weakness is Broken, reduces their DEF by 20%."
          },
          "e2BeBuff": {
            "text": "E2 BE buff",
            "title": "Leisure in Carmine Smokeveil",
            "content": "E2: When using Ultimate, increases all allies\" Break Effect by 40.0%."
          },
          "e6ResShred": {
            "text": "E6 RES shred",
            "title": "Arcadia Under Deep Seclusion",
            "content": "E6: While \"Fuyuan\" is on the field, reduces all Enemy units\" All-Type RES by 20.0%."
          }
        }
      },
      "Luka": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "title": "Sky-Shatter Fist",
            "content": "Enhances Basic ATK to deal additional damage, and has a chance to trigger extra hits."
          },
          "targetUltDebuffed": {
            "text": "Ult vulnerability debuff",
            "title": "Coup de Grâce",
            "content": "Increase the target's DMG received by {{targetUltDebuffDmgTakenValue}}% for 3 turn(s)."
          },
          "basicEnhancedExtraHits": {
            "text": "Enhanced basic extra hits",
            "title": "Sky-Shatter Fist",
            "content": "Increases the number of hits of Basic Enhanced."
          },
          "e1TargetBleeding": {
            "text": "E1 target bleeding",
            "title": "Fighting Endlessly",
            "content": "E1: When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turn(s)."
          },
          "e4TalentStacks": {
            "text": "E4 Talent stacks",
            "title": "Never Turning Back",
            "content": "E4: For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 time(s)."
          }
        }
      },
      "Luocha": {
        "Content": {
          "fieldActive": {
            "text": "Field active",
            "title": "Ablution of the Quick",
            "content": "E1: While the Field is active, ATK of all allies increases by 20%."
          },
          "e6ResReduction": {
            "text": "E6 RES shred",
            "title": "Reunion With the Dust",
            "content": "E6: When Ultimate is used, reduces all enemies\" All-Type RES by 20% for 2 turn(s)."
          }
        }
      },
      "Lynx": {
        "Content": {
          "skillBuff": {
            "text": "Skill max HP buff",
            "title": "Salted Camping Cans",
            "content": "Applies \"Survival Response\" to a single target ally and increases their Max HP by {{skillHpPercentBuff}}% of Lynx's Max HP plus {{skillHpFlatBuff}}.::BR::E4: When \"Survival Response\" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).::BR::E6: Additionally boosts the Max HP increasing effect of \"Survival Response\" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%."
          }
        },
        "TeammateContent": {
          "teammateHPValue": {
            "text": "Lynx's HP",
            "title": "Salted Camping Cans",
            "content": "Applies \"Survival Response\" to a single target ally and increases their Max HP by {{skillHpPercentBuff}}% of Lynx's Max HP plus {{skillHpFlatBuff}}.::BR::E4: When \"Survival Response\" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).::BR::E6: Additionally boosts the Max HP increasing effect of \"Survival Response\" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%."
          }
        }
      },
      "March7thImaginary": {
        "Content": {
          "enhancedBasic": {
            "text": "Enhanced Basic",
            "title": "Brows Be Smitten, Heart Be Bitten",
            "content": "Initially, deals 3 hits, each causing Imaginary DMG equal to {{BasicEnhancedScaling}}% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hit(s)."
          },
          "basicAttackHits": {
            "text": "Enhanced Basic hits",
            "title": "Brows Be Smitten, Heart Be Bitten",
            "content": "Initially, deals 3 hits, each causing Imaginary DMG equal to {{BasicEnhancedScaling}}% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hit(s)."
          },
          "masterAdditionalDmgBuff": {
            "text": "DPS Shifu buff",
            "title": "Master, It's Tea Time!",
            "content": "Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, deals Additional DMG equal to {{ShifuDmgBuff}}% of March 7th's ATK."
          },
          "masterToughnessRedBuff": {
            "text": "Support Shifu buff",
            "title": "Master, It's Tea Time!",
            "content": "Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, increases the Toughness Reduction of this instance of DMG by 100%."
          },
          "talentDmgBuff": {
            "text": "Talent Basic DMG buff",
            "title": "Master, I've Ascended!",
            "content": "After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.::BR::Upon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by {{TalentDmgBuff}}%."
          },
          "selfSpdBuff": {
            "text": "E1 SPD buff",
            "title": "My Sword Stirs Starlight",
            "content": "E1: When Shifu is on the field, increases March 7th\"s SPD by 10.0%."
          },
          "e6CdBuff": {
            "text": "E6 Basic CD boost",
            "title": "Me, the Best Girl in Sight",
            "content": "E6: After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50.0%."
          }
        },
        "TeammateContent": {
          "masterBuff": {
            "text": "Shifu buff",
            "title": "Master, It's Tea Time!",
            "content": "Designates a single ally (excluding this unit) as Shifu and increases Shifu's SPD by {{ShifuSpeedBuff}}%."
          },
          "masterCdBeBuffs": {
            "text": "Shifu CD / BE buffs",
            "title": "Tide Tamer",
            "content": "After using Enhanced Basic ATK, increases Shifu's CRIT DMG by 60.0% and Break Effect by 36.0%, lasting for 2.0 turn(s)."
          }
        }
      },
      "Misha": {
        "Content": {
          "ultHitsOnTarget": {
            "text": "Ult hits on target",
            "title": "G—Gonna Be Late!",
            "content": "Number of Ultimate hits on the primary target, dealing DMG equal to {{ultStackScaling}}% ATK per hit."
          },
          "enemyFrozen": {
            "text": "Enemy frozen",
            "title": "Transmission",
            "content": "When dealing DMG to Frozen enemies, increases CRIT DMG by 30%."
          },
          "e2DefReduction": {
            "text": "E2 DEF shred",
            "title": "Yearning of Youth",
            "content": "E2: Reduces the target\"s DEF by 16% for 3 turn(s)."
          },
          "e6UltDmgBoost": {
            "text": "E6 Ult DMG boost",
            "title": "Estrangement of Dream",
            "content": "E6: When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn."
          }
        }
      },
      "Moze": {
        "Content": {
          "preyMark": {
            "text": "Prey marked",
            "title": "Cascading Featherblade",
            "content": "When \"Prey\" exists on the field, Moze will enter the Departed state.::BR::After allies attack \"Prey,\" Moze will additionally deal 1 instance of Lightning Additional DMG equal to {{PreyAdditionalMultiplier}}% of his ATK and consumes 1 point of Charge. For every 3 point(s) of Charge consumed, Moze launches 1 follow-up attack to \"Prey,\" dealing Lightning DMG equal to {{FuaScaling}}% of his ATK. When Charge reaches 0, dispels the target's \"Prey\" state and resets the tally of Charge points required to launch follow-up attack."
          },
          "e2CdBoost": {
            "text": "E2 CD boost",
            "title": "Wrathbearer",
            "content": "E2: When all allies deal DMG to the enemy target marked as \"Prey,\" increases CRIT DMG by 40.0%."
          },
          "e4DmgBuff": {
            "text": "E4 DMG buff",
            "title": "Heathprowler",
            "content": "When using Ultimate, increases the DMG dealt by Moze by 30.0%, lasting for 2.0 turn(s)."
          },
          "e6MultiplierIncrease": {
            "text": "E6 FUA multiplier buff",
            "title": "Faithbinder",
            "content": "Increases the DMG multiplier of the Talent's follow-up attack by 25.0%."
          }
        }
      },
      "Pela": {
        "Content": {
          "teamEhrBuff": {
            "text": "Team EHR buff",
            "title": "The Secret Strategy",
            "content": "When Pela is on the battlefield, all allies' Effect Hit Rate increases by 10%."
          },
          "enemyDebuffed": {
            "text": "Enemy debuffed",
            "title": "Bash",
            "content": "Deals 20% more DMG to debuffed enemies."
          },
          "skillRemovedBuff": {
            "text": "Enemy buff removed Skill buffs",
            "title": "Wipe Out",
            "content": "Using Skill to remove buff(s) increases the DMG of Pela\"s next attack by 20%.::BR::E2: Using Skill to remove buff(s) increases SPD by 10% for 2 turn(s)."
          },
          "ultDefPenDebuff": {
            "text": "Ult DEF shred",
            "title": "Zone Suppression",
            "content": "When Exposed, enemies' DEF is reduced by {{ultDefPenValue}}% for 2 turn(s)."
          },
          "e4SkillResShred": {
            "text": "E4 Skill Ice RES shred",
            "title": "Full Analysis",
            "content": "E4: When using Skill, there is a 100% base chance to reduce the target enemy\"s Ice RES by 12% for 2 turn(s)."
          }
        }
      },
      "Qingque": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "title": "Celestial Jade",
            "content": "Qingque's ATK increases by {{talentAtkBuff}}%, and her Basic ATK \"Flower Pick\" is enhanced, becoming \"Cherry on Top!\""
          },
          "basicEnhancedSpdBuff": {
            "text": "Enhanced Basic SPD buff",
            "title": "Winning Hand",
            "content": "Qingque's SPD increases by 10% for 1 turn after using the Enhanced Basic ATK."
          },
          "skillDmgIncreaseStacks": {
            "text": "Skill DMG boost stacks",
            "title": "A Scoop of Moon",
            "content": "Immediately draws 2 jade tile(s) and increases DMG by {{skillStackDmg}}% until the end of the current turn. This effect can stack up to 4 time(s)."
          }
        }
      },
      "Rappa": {
        "Content": {
          "sealformActive": {
            "text": "Sealform state (force weakness break)",
            "title": null,
            "content": null
          },
          "atkToBreakVulnerability": {
            "text": "ATK to Break vulnerability",
            "title": null,
            "content": null
          },
          "chargeStacks": {
            "text": "Charge stacks",
            "title": "Charge stacks",
            "content": null
          },
          "e1DefPen": {
            "text": "E1 DEF PEN",
            "title": null,
            "content": null
          },
          "e2Buffs": {
            "text": "E2 break buffs",
            "title": null,
            "content": null
          },
          "e4SpdBuff": {
            "text": "E4 SPD buff",
            "title": null,
            "content": null
          }
        },
        "TeammateContent": {
          "teammateBreakVulnerability": {
            "text": "Break vulnerability",
            "title": null,
            "content": null
          },
          "e4SpdBuff": {
            "text": "E4 SPD buff",
            "title": null,
            "content": null
          }
        }
      },
      "Robin": {
        "Content": {
          "concertoActive": {
            "text": "Concerto active",
            "title": "Vox Harmonique, Opus Cosmique",
            "content": "While in the Concerto state, increases all allies' ATK by {{ultAtkBuffScalingValue}}% of Robin's ATK plus {{ultAtkBuffFlatValue}}. Moreover, after every attack by allies, Robin deals Additional Physical DMG equal to {{ultScaling}}% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%."
          },
          "skillDmgBuff": {
            "text": "Skill DMG buff",
            "title": "Pinion's Aria",
            "content": "Increase DMG dealt by all allies by {{skillDmgBuffValue}}%, lasting for 3 turn(s)."
          },
          "talentCdBuff": {
            "text": "Talent CD buff",
            "title": "Tonal Resonance",
            "content": "Increase all allies' CRIT DMG by {{talentCdBuffValue}}%."
          },
          "e1UltResPen": {
            "text": "E1 Ult RES PEN",
            "title": "Land of Smiles",
            "content": "While the Concerto state is active, all allies' All-Type RES PEN increases by 24%."
          },
          "e4TeamResBuff": {
            "text": "E4 team RES buff",
            "title": "Raindrop Key",
            "content": "When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by 50%."
          },
          "e6UltCDBoost": {
            "text": "E6 Ult DMG CD boost",
            "title": "Moonless Midnight",
            "content": "While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by 450%. The effect of Moonless Midnight can trigger up to 8 time(s). And the trigger count resets each time the Ultimate is used."
          }
        },
        "TeammateContent": {
          "teammateATKValue": {
            "text": "Robin's Combat ATK",
            "title": "Vox Harmonique, Opus Cosmique",
            "content": "While in the Concerto state, increases all allies' ATK by {{ultAtkBuffScalingValue}}% of Robin's ATK plus {{ultAtkBuffFlatValue}}::BR::Set this to the Robin's self ATK stat that she uses to buff teammates."
          },
          "traceFuaCdBoost": {
            "text": "FUA CD boost",
            "title": "Impromptu Flourish",
            "content": "While the Concerto state is active, the CRIT DMG dealt when all allies launch follow-up attacks increases by 25%."
          },
          "e2UltSpdBuff": {
            "text": "E2 Ult SPD buff",
            "title": "Afternoon Tea For Two",
            "content": "While the Concerto state is active, all allies' SPD increases by 16%."
          }
        }
      },
      "RuanMei": {
        "Content": {
          "skillOvertoneBuff": {
            "text": "Overtone buff",
            "title": "String Sings Slow Swirls",
            "content": "After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's turn. When Ruan Mei has Overtone, all allies' DMG increases by {{skillScaling}}% and Weakness Break Efficiency increases by 50%"
          },
          "teamBEBuff": {
            "text": "Team BE buff",
            "title": "Inert Respiration",
            "content": "Increases Break Effect by 20% for all allies."
          },
          "ultFieldActive": {
            "text": "Ult field active",
            "title": "Petals to Stream, Repose in Dream",
            "content": "While inside the field, all allies' All-Type RES PEN increases by {{fieldResPenValue}}%.::BR::E1: While the Ultimate's field is deployed, the DMG dealt by all allies ignores 20% of the target's DEF."
          },
          "e2AtkBoost": {
            "text": "E2 weakness ATK boost",
            "title": "Reedside Promenade",
            "content": "E2: With Ruan Mei on the field, all allies increase their ATK by 40% when dealing DMG to enemies with Weakness Break."
          },
          "e4BeBuff": {
            "text": "E4 BE buff",
            "title": "Chatoyant Éclat",
            "content": "E4: When an enemy target\"s Weakness is Broken, Ruan Mei\"s Break Effect increases by 100% for 3 turn(s)."
          }
        },
        "TeammateContent": {
          "teamSpdBuff": {
            "text": "Team SPD buff",
            "title": "Somatotypical Helix",
            "content": "Increases SPD by {{talentSpdScaling}}% for the team (excluding this character)."
          },
          "teamDmgBuff": {
            "text": "BE to DMG boost",
            "title": "Candle Lights on Still Waters",
            "content": "In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%."
          }
        }
      },
      "Sampo": {
        "Content": {
          "targetDotTakenDebuff": {
            "text": "Ult DoT vulnerability",
            "title": "Surprise Present",
            "content": "When debuffed by Sampo's Ultimate, increase the targets' DoT taken by {{dotVulnerabilityValue}}% for 2 turn(s)."
          },
          "skillExtraHits": {
            "text": "Skill extra hits",
            "title": "Ricochet Love",
            "content": "Number of extra hits from Skill."
          },
          "targetWindShear": {
            "text": "Target wind sheared",
            "title": "Spice Up",
            "content": "Enemies with Wind Shear effect deal 15% less damage to Sampo."
          }
        }
      },
      "Seele": {
        "Content": {
          "buffedState": {
            "text": "Buffed state",
            "title": "Resurgence",
            "content": "Enters the buffed state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the buffed state, the DMG of Seele's attacks increases by {{buffedStateDmgBuff}}% for 1 turn(s).::BR::While Seele is in the buffed state, her Quantum RES PEN increases by 20%."
          },
          "speedBoostStacks": {
            "text": "Speed buff stacks",
            "title": "Sheathed Blade",
            "content": "Increases SPD by 25% per stack. Stacks up to {{speedBoostStacksMax}} time(s)."
          },
          "e1EnemyHp80CrBoost": {
            "text": "E1 enemy HP ≤ 80% CR boost",
            "title": "Extirpating Slash",
            "content": "E1: When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%."
          },
          "e6UltTargetDebuff": {
            "text": "E6 Butterfly Flurry",
            "title": "Shattering Shambles",
            "content": "E6: After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for 1 turn(s). Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to 15% of Seele's Ultimate DMG every time they are attacked."
          }
        }
      },
      "Serval": {
        "Content": {
          "targetShocked": {
            "text": "Target shocked",
            "title": "Galvanic Chords",
            "content": "After Serval attacks, deals Additional Lightning DMG equal to {{talentExtraDmgScaling}}% of Serval's ATK to all Shocked enemies."
          },
          "enemyDefeatedBuff": {
            "text": "Enemy defeated buff",
            "title": "Mania",
            "content": "Upon defeating an enemy, ATK increases by 20% for 2 turn(s)."
          }
        }
      },
      "SilverWolf": {
        "Content": {
          "skillResShredDebuff": {
            "text": "Skill RES shred",
            "title": "Allow Changes?",
            "content": "Decreases the target's All-Type RES of the enemy by {{skillResShredValue}}% for 2 turn(s).::BR::If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%."
          },
          "skillWeaknessResShredDebuff": {
            "text": "Skill weakness implanted RES shred",
            "title": "Allow Changes?",
            "content": "There is a chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered."
          },
          "talentDefShredDebuff": {
            "text": "Bug DEF shred",
            "title": "Awaiting System Response...",
            "content": "Silver Wolf's bug reduces the target's DEF by {{talentDefShredDebuffValue}}% for 3 turn(s)."
          },
          "ultDefShredDebuff": {
            "text": "Ult DEF shred",
            "title": "User Banned",
            "content": "Decreases the target's DEF by {{ultDefShredValue}}% for 3 turn(s)."
          },
          "targetDebuffs": {
            "text": "Target debuffs",
            "title": "Side Note",
            "content": "If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.::BR::E4: After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate.::BR::E6: For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%."
          }
        }
      },
      "Sparkle": {
        "Content": {
          "skillCdBuff": {
            "text": "Skill CD buff",
            "title": "Dreamdiver",
            "content": "Increases the CRIT DMG of a single ally by {{skillCdBuffScaling}}% of Sparkle's CRIT DMG plus {{skillCdBuffBase}}%, lasting for 1 turn(s).::BR::E6: The CRIT DMG Boost effect of Sparkle's Skill additionally increases by 30% of Sparkle's CRIT DMG, and when she uses her Skill, the CRIT DMG Boost effect will apply to all allies currently with Cipher. When Sparkle uses her Ultimate, this effect will spread to all allies with Cipher should the allied target have the CRIT DMG increase effect provided by the Skill active on them."
          },
          "cipherBuff": {
            "text": "Cipher buff",
            "title": "The Hero with a Thousand Faces",
            "content": "When allies with Cipher trigger the DMG Boost effect provided by Sparkle's Talent, each stack additionally increases its effect by {{cipherTalentStackBoost}}%, lasting for 2 turns.::BR::E1: The Cipher effect applied by the Ultimate lasts for 1 extra turn. All allies affected by Cipher have their ATK increased by 40%."
          },
          "talentStacks": {
            "text": "Talent DMG stacks",
            "title": "Red Herring",
            "content": "Whenever an ally consumes 1 Skill Point, all allies' DMG increases by {talentBaseStackBoost}}%. This effect lasts for 2 turn(s) and can stack up to 3 time(s).::BR::E2: Each Talent stack allows allies to ignore 8% of the enemy target's DEF when dealing DMG to enemies."
          },
          "quantumAllies": {
            "text": "Quantum allies",
            "title": "Nocturne",
            "content": "When there are 1/2/3 Quantum allies in your team, Quantum-Type allies' ATK are increased by 5%/15%/30%."
          }
        },
        "TeammateContent": {
          "teammateCDValue": {
            "text": "Sparkle's Combat CD",
            "title": "Skill: Dreamdiver",
            "content": "Increases the CRIT DMG of a single ally by {{skillCdBuffScaling}}% of Sparkle's CRIT DMG plus {{skillCdBuffBase}}%, lasting for 1 turn(s)."
          }
        }
      },
      "Sushang": {
        "Content": {
          "ultBuffedState": {
            "text": "Ult buffed state",
            "title": "Shape of Taixu: Dawn Herald",
            "content": "Sushang's ATK increases by {{ultBuffedAtk}}% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s). Sword Stance triggered from the extra chances deals 50% of the original DMG."
          },
          "skillExtraHits": {
            "text": "Skill extra hits",
            "title": "Cloudfencer Art: Mountainfall",
            "content": "Increases the number of Sword Stance extra hits of the Skill."
          },
          "skillTriggerStacks": {
            "text": "Skill trigger stacks",
            "title": "Riposte",
            "content": "For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 time(s)."
          },
          "talentSpdBuffStacks": {
            "text": "Talent SPD buff stacks",
            "title": "Dancing Blade",
            "content": "When an enemy has their Weakness Broken on the field, Sushang's SPD increases by {{talentSpdBuffValue}}% per stack for 2 turn(s).::BR::E6: Talent's SPD Boost is stackable and can stack up to 2 times."
          },
          "e2DmgReductionBuff": {
            "text": "E2 DMG reduction buff",
            "title": "Refine in Toil",
            "content": "E2: After triggering Sword Stance, the DMG taken by Sushang is reduced by 20% for 1 turn."
          }
        }
      },
      "Tingyun": {
        "Content": {
          "benedictionBuff": {
            "text": "Benediction buff",
            "title": "Soothing Melody",
            "content": "Grants a single ally with Benediction to increase their ATK by {{skillAtkBoostScaling}}%, up to {{skillAtkBoostMax}}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to {{skillLightningDmgBoostScaling}}% of that ally's ATK. This effect lasts for 3 turns."
          },
          "skillSpdBuff": {
            "text": "Skill SPD buff",
            "title": "Nourished Joviality",
            "content": "Tingyun's SPD increases by 20% for 1 turn after using Skill."
          },
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "title": "Amidst the Rejoicing Clouds",
            "content": "Regenerates 50 Energy for a single ally and increases the target's DMG by {{ultDmgBoost}}% for 2 turn(s)."
          },
          "ultSpdBuff": {
            "text": "E1 Ult SPD buff",
            "title": "Windfall of Lucky Springs",
            "content": "E1: After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateAtkBuffValue": {
            "text": "Skill ATK buff value",
            "title": "Soothing Melody",
            "content": "Grants a single ally with Benediction to increase their ATK by {{skillAtkBoostScaling}}%, up to {{skillAtkBoostMax}}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to {{skillLightningDmgBoostScaling}}% of that ally's ATK. This effect lasts for 3 turns."
          }
        }
      },
      "Topaz": {
        "Content": {
          "enemyProofOfDebtDebuff": {
            "text": "Proof of Debt debuff",
            "title": "Difficulty Paying?",
            "content": "Inflicts a single target enemy with a Proof of Debt status, increasing the DMG it takes from follow-up attacks by {{proofOfDebtFuaVulnerability}}%."
          },
          "numbyEnhancedState": {
            "text": "Numby enhanced state",
            "title": "Turn a Profit!",
            "content": "Numby enters the Windfall Bonanza! state and its DMG multiplier increases by {{enhancedStateFuaScalingBoost}}% and CRIT DMG increases by {{enhancedStateFuaCdBoost}}%."
          },
          "e1DebtorStacks": {
            "text": "E1 Debtor stacks",
            "title": "Future Market",
            "content": "E1: When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single action. The Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by 25%, stacking up to 2 time(s). When Proof of Debt is removed, the Debtor state is also removed."
          }
        }
      },
      "TrailblazerDestruction": {
        "Content": {
          "enhancedUlt": {
            "text": "AoE Ult",
            "title": "Stardust Ace",
            "content": "Choose between two attack modes to deliver a full strike. ::BR:: Blowout: (ST) Farewell Hit deals Physical DMG equal to {{ultScaling}}% of the Trailblazer's ATK to a single enemy.::BR::Blowout: (Blast) RIP Home Run deals Physical DMG equal to {{ultEnhancedScaling}}% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to {{ultEnhancedScaling2}}% of the Trailblazer's ATK to enemies adjacent to it."
          },
          "talentStacks": {
            "text": "Talent stacks",
            "title": "Perfect Pickoff",
            "content": "Each time after this character inflicts Weakness Break on an enemy, ATK increases by {{talentAtkScalingValue}}% and DEF increases by 10%. This effect stacks up to 2 times."
          }
        }
      },
      "TrailblazerHarmony": {
        "Content": {
          "backupDancer": {
            "text": "Backup Dancer BE buff",
            "title": "All-Out Footlight Parade",
            "content": "Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration reduces by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by {{ultBeScaling}}%."
          },
          "superBreakDmg": {
            "text": "Super Break DMG (force weakness break)",
            "title": "All-Out Footlight Parade",
            "content": "When allies with the Backup Dancer effect attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG.::BR::Super Break DMG is added to each of the BASIC / SKILL / ULT / FUA damage columns. For example when enabled, the SKILL column becomes the sum of base Skill damage + Super Break DMG based on the Skill's toughness damage. This option also overrides enemy weakness break to ON."
          },
          "skillHitsOnTarget": {
            "text": "Skill extra hits on target",
            "title": "Halftime to Make It Rain",
            "content": "Deals Imaginary DMG to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG to a random enemy."
          },
          "e2EnergyRegenBuff": {
            "text": "E2 ERR buff",
            "title": "Jailbreaking Rainbowwalk",
            "content": "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s)."
          }
        },
        "TeammateContent": {
          "teammateBeValue": {
            "text": "E4 Combat BE",
            "title": "Dove in Tophat",
            "content": "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect."
          }
        }
      },
      "TrailblazerPreservation": {
        "Content": {
          "enhancedBasic": {
            "text": "Enhanced Basic",
            "title": "Ice-Breaking Light",
            "content": "Enhanced basic ATK deals Fire DMG equal to {{basicEnhancedAtkScaling}}% of the Trailblazer's ATK to a single enemy, and reduced damage to adjacent enemies."
          },
          "skillActive": {
            "text": "Skill DMG reduction",
            "title": "Ever-Burning Amber",
            "content": "When the Skill is used, reduces DMG taken by {{skillDamageReductionValue}}%. Also reduces DMG taken by all allies by 15% for 1 turn."
          },
          "shieldActive": {
            "text": "Shield active",
            "title": "Action Beats Overthinking",
            "content": "When the shield is active, increases ATK by 15%."
          },
          "e6DefStacks": {
            "text": "E6 DEF buff stacks",
            "title": "City-Forging Bulwarks",
            "content": "E6: Increases DEF by 10% per stack."
          }
        }
      },
      "Welt": {
        "Content": {
          "enemyDmgTakenDebuff": {
            "text": "Ult vulnerability debuff",
            "title": "Retribution",
            "content": "When using Ultimate, there is a 100% base chance to increase the DMG received by the targets by 12% for 2 turn(s)."
          },
          "enemySlowed": {
            "text": "Enemy slowed",
            "title": "Time Distortion",
            "content": "When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to {{talentScaling}}% of his ATK to the enemy."
          },
          "skillExtraHits": {
            "text": "Skill extra hits on target",
            "title": "Edge of the Void",
            "content": "Deals Imaginary DMG equal to {{skillScaling}}% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to {{skillScaling}}% of Welt's ATK to a random enemy."
          },
          "e1EnhancedState": {
            "text": "E1 enhanced state",
            "title": "Legacy of Honor",
            "content": "E1: After Welt uses his Ultimate, his abilities are enhanced. The next 2 time(s) he uses his Basic ATK or Skill, deals Additional DMG to the target equal to 50% of his Basic ATK's DMG multiplier or 80% of his Skill's DMG multiplier respectively."
          }
        }
      },
      "Xueyi": {
        "Content": {
          "beToDmgBoost": {
            "text": "BE to DMG boost",
            "title": "Clairvoyant Loom",
            "content": "Increases DMG dealt by this unit by an amount equal to 100% of Break Effect, up to a maximum DMG increase of 240%."
          },
          "enemyToughness50": {
            "text": "Intrepid Rollerbearings",
            "title": "Intrepid Rollerbearings",
            "content": "If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate."
          },
          "toughnessReductionDmgBoost": {
            "text": "Ultimate DMG boost",
            "title": "Divine Castigation",
            "content": "When using Ultimate, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of {{ultBoostMax}}% increase."
          },
          "fuaHits": {
            "text": "FUA hits",
            "title": "Karmic Perpetuation",
            "content": "When Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to {{fuaScaling}}% of Xueyi's ATK to a single random enemy."
          },
          "e4BeBuff": {
            "text": "E4 BE buff",
            "title": "Karma, Severed",
            "content": "E4: When using Ultimate, increases Break Effect by 40% for 2 turn(s)."
          }
        }
      },
      "Yanqing": {
        "Content": {
          "ultBuffActive": {
            "text": "Ult buff active",
            "title": "Amidst the Raining Bliss",
            "content": "Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra {{ultCdBuffValue}}%."
          },
          "soulsteelBuffActive": {
            "text": "Soulsteel buff active",
            "title": "One With the Sword",
            "content": "When Soulsteel Sync is active, Yanqing's CRIT Rate increases by {{talentCrBuffValue}}% and his CRIT DMG increases by {{talentCdBuffValue}}%.::BR::Before using Ultimate, when Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra {{ultCdBuffValue}}%.::BR::When Soulsteel Sync is active, Effect RES increases by 20%.::BR::E2: When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%."
          },
          "critSpdBuff": {
            "text": "SPD buff",
            "title": "Gentle Blade",
            "content": "When a CRIT Hit is triggered, increases SPD by 10% for 2 turn(s)."
          },
          "e1TargetFrozen": {
            "text": "E1 enemy frozen",
            "title": "Svelte Saber",
            "content": "E1: When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to 60% of his ATK."
          },
          "e4CurrentHp80": {
            "text": "E4 self HP ≥ 80% RES PEN buff",
            "title": "Searing Sting",
            "content": "E4: When the current HP percentage is 80% or higher, Ice RES PEN increases by 12%."
          }
        }
      },
      "Yukong": {
        "Content": {
          "teamImaginaryDmgBoost": {
            "text": "Team Imaginary DMG boost",
            "title": "Bowmaster",
            "content": "When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%."
          },
          "roaringBowstringsActive": {
            "text": "Roaring Bowstrings",
            "title": "Emboldening Salvo",
            "content": "When \"Roaring Bowstrings\" is active, the ATK of all allies increases by {{skillAtkBuffValue}}%.::BR::E4: When \"Roaring Bowstrings\" is active, Yukong deals 30% more DMG to enemies."
          },
          "ultBuff": {
            "text": "Ult CR / CD buffs",
            "title": "Diving Kestrel",
            "content": "If \"Roaring Bowstrings\" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by {{ultCrBuffValue}}% and CRIT DMG by {{ultCdBuffValue}}%. At the same time, deals Imaginary DMG equal to {{ultScaling}}% of Yukong's ATK to a single enemy."
          },
          "initialSpeedBuff": {
            "text": "E1 initial SPD buff",
            "title": "Aerial Marshal",
            "content": "E1: At the start of battle, increases the SPD of all allies by 10% for 2 turn(s)."
          }
        }
      },
      "Yunli": {
        "Content": {
          "blockActive": {
            "text": "Parry active",
            "title": "Demon Quell",
            "content": "While in the Parry state, resists Crowd Control debuffs received and reduces DMG received by 20.0%."
          },
          "ultCull": {
            "text": "Intuit: Cull enabled",
            "title": "Earthbind, Etherbreak",
            "content": "\"Intuit: Cull\": Deals Physical DMG equal to {{CullScaling}}% of Yunli's ATK to the target, and deals Physical DMG equal to {{CullAdjacentScaling}}% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to {{CullAdditionalScaling}}% of Yunli's ATK to a random single enemy."
          },
          "ultCullHits": {
            "text": "Intuit: Cull hits",
            "title": "Earthbind, Etherbreak",
            "content": "\"Intuit: Cull\": Deals Physical DMG equal to {{CullScaling}}% of Yunli's ATK to the target, and deals Physical DMG equal to {{CullAdjacentScaling}}% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to {{CullAdditionalScaling}}% of Yunli's ATK to a random single enemy."
          },
          "counterAtkBuff": {
            "text": "Counter ATK buff",
            "title": "True Sunder",
            "content": "When using a Counter, increases Yunli's ATK by 30.0%, lasting for 1 turn."
          },
          "e1UltBuff": {
            "text": "E1 Ult buff",
            "title": "Weathered Blade Does Not Sully",
            "content": "E1: Increases DMG dealt by \"Intuit: Slash\" and \"Intuit: Cull\" by 20.0%. Increases the number of additional DMG instances for \"Intuit: Cull\" by 3.0."
          },
          "e2DefShred": {
            "text": "E2 FUA DEF PEN",
            "title": "First Luster Breaks Dawn",
            "content": "When dealing DMG via Counter, ignores 20.0% of the target's DEF."
          },
          "e4ResBuff": {
            "text": "E4 RES buff",
            "title": "Artisan's Ironsong",
            "content": "After launching \"Intuit: Slash\" or \"Intuit: Cull,\" increases this unit\"s Effect RES by 50.0%, lasting for 1.0 turn(s)."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "title": "Walk in Blade, Talk in Zither",
            "content": "While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger \"Intuit: Cull\" and remove the \"Parry\" effect. When dealing DMG via \"Intuit: Slash\" or \"Intuit: Cull,\" increases CRIT Rate by 15.0% and Physical RES PEN by 20.0%."
          }
        }
      }
    }
  },
  "gameData": {
    "Characters": {
      "1001": {
        "Name": "March 7th",
        "Abilities": {
          "100101": {
            "Name": "Frigid Cold Arrow",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100102": {
            "Name": "The Power of Cuteness",
            "Desc": "<span></span><span style='color:#f29e38ff'>Applies a Shield</span><span> on a single ally.</span>",
            "Type": "Skill"
          },
          "100103": {
            "Name": "Glacial Cascade",
            "Desc": "<span>Deals Ice DMG to </span><span style='color:#f29e38ff'>all enemies</span><span>, with </span><span style='color:#f29e38ff'>a chance of Freezing them</span><span>.</span>",
            "Type": "Ultimate"
          },
          "100104": {
            "Name": "Girl Power",
            "Desc": "<span>After a Shielded ally is attacked by an enemy, March 7th </span><span style='color:#f29e38ff'>immediately launches a <u>Counter</u></span><span> against the attacker, dealing minor Ice DMG.</span>",
            "Type": "Talent"
          },
          "100106": {
            "Name": "Attack",
            "Desc": ""
          },
          "100107": {
            "Name": "Freezing Beauty",
            "Desc": "<span>Attacks the enemy. After entering battle, there is a high chance of inflicting Freeze on a random enemy.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100101": {
            "Name": "Memory of You",
            "Desc": "<span>Every time March 7th's Ultimate Freezes a target, she regenerates 6 Energy.</span>"
          },
          "100102": {
            "Name": "Memory of It",
            "Desc": "<span>Upon entering battle, grants a Shield equal to 24% of March 7th's DEF plus 320 to the ally with the lowest HP percentage, lasting for 3 turn(s).</span>"
          },
          "100103": {
            "Name": "Memory of Everything",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100104": {
            "Name": "Never Forfeit Again",
            "Desc": "<span>The Talent's Counter effect can be triggered 1 more time in each turn. The DMG dealt by Counter increases by an amount that is equal to 30% of March 7th's DEF.</span>"
          },
          "100105": {
            "Name": "Never Forget Again",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100106": {
            "Name": "Just Like This, Always...",
            "Desc": "<span>Allies under the protection of the Shield granted by the Skill restore HP equal to 4% of their Max HP plus 106 at the beginning of each turn.</span>"
          }
        }
      },
      "1002": {
        "Name": "Dan Heng",
        "Abilities": {
          "100201": {
            "Name": "Cloudlancer Art: North Wind",
            "Desc": "<span>Deals minor Wind DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100202": {
            "Name": "Cloudlancer Art: Torrent",
            "Desc": "<span>Deals Wind DMG to a single enemy. Upon a CRIT Hit, there is a high chance of Slowing the enemy.</span>",
            "Type": "Skill"
          },
          "100203": {
            "Name": "Ethereal Dream",
            "Desc": "<span>Deals massive Wind DMG to a single enemy. If the enemy is Slowed, DMG multiplier dealt will be increased.</span>",
            "Type": "Ultimate"
          },
          "100204": {
            "Name": "Superiority of Reach",
            "Desc": "<span>When this unit becomes the target of an ally's ability, this unit's next attack's </span><span style='color:#f29e38ff'>Wind <u>RES PEN</u> increases</span><span>. This effect can be triggered again after 2 turns.</span>",
            "Type": "Talent"
          },
          "100206": {
            "Name": "Attack",
            "Desc": ""
          },
          "100207": {
            "Name": "Splitting Spearhead",
            "Desc": "<span>After they use their Technique, their ATK is increased at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100201": {
            "Name": "The Higher You Fly, the Harder You Fall",
            "Desc": "<span>When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%.</span>"
          },
          "100202": {
            "Name": "Quell the Venom Octet, Quench the Vice O'Flame",
            "Desc": "<span>Reduces Talent cooldown by 1 turn.</span>"
          },
          "100203": {
            "Name": "Seen and Unseen",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100204": {
            "Name": "Roaring Dragon and Soaring Sun",
            "Desc": "<span>When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again.</span>"
          },
          "100205": {
            "Name": "A Drop of Rain Feeds a Torrent",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100206": {
            "Name": "The Troubled Soul Lies in Wait",
            "Desc": "<span>The Slow state triggered by Skill reduces the enemy's SPD by an extra 8%.</span>"
          }
        }
      },
      "1003": {
        "Name": "Himeko",
        "Abilities": {
          "100301": {
            "Name": "Sawblade Tuning",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100302": {
            "Name": "Molten Detonation",
            "Desc": "<span>Deals Fire DMG to a single enemy and minor Fire DMG to enemies adjacent to it.</span>",
            "Type": "Skill"
          },
          "100303": {
            "Name": "Heavenly Flare",
            "Desc": "<span>Deals Fire DMG to all enemies and regenerates Energy if enemies are defeated.</span>",
            "Type": "Ultimate"
          },
          "100304": {
            "Name": "Victory Rush",
            "Desc": "<span>Gains Charge when an enemy's Weakness is Broken.<br>After an ally performs an attack, if fully Charged, </span><span style='color:#f29e38ff'>immediately performs a <u>follow-up attack</u></span><span> and deals Fire DMG to </span><span style='color:#f29e38ff'>all enemies</span><span>, consuming all Charge points.<br>Gains 1 Charge point at the start of each battle.</span>",
            "Type": "Talent"
          },
          "100306": {
            "Name": "Attack",
            "Desc": ""
          },
          "100307": {
            "Name": "Incomplete Combustion",
            "Desc": "<span>Creates a Special Dimension. After entering combat with enemies in the dimension, there is a high chance to </span><span style='color:#f29e38ff'>increase Fire DMG taken by enemies</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100301": {
            "Name": "Childhood",
            "Desc": "<span>After \"Victory Rush\" is triggered, Himeko's SPD increases by 20% for 2 turn(s).</span>"
          },
          "100302": {
            "Name": "Convergence",
            "Desc": "<span>Deals 15% more DMG to enemies whose HP percentage is 50% or less.</span>"
          },
          "100303": {
            "Name": "Poised",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100304": {
            "Name": "Dedication",
            "Desc": "<span>When Himeko's Skill inflicts Weakness Break on an enemy, she gains 1 extra point(s) of Charge.</span>"
          },
          "100305": {
            "Name": "Aspiration",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100306": {
            "Name": "Trailblaze!",
            "Desc": "<span>Ultimate deals DMG 2 extra times, each of which deals Fire DMG equal to 40% of the original DMG to a random enemy.</span>"
          }
        }
      },
      "1004": {
        "Name": "Welt",
        "Abilities": {
          "100401": {
            "Name": "Gravity Suppression",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100402": {
            "Name": "Edge of the Void",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy. This attack can Bounce 3 times, with a chance of </span><span style='color:#f29e38ff'>Slowing</span><span> the hit enemies.</span>",
            "Type": "Skill"
          },
          "100403": {
            "Name": "Synthetic Black Hole",
            "Desc": "<span>Deals Imaginary DMG to all enemies, with </span><span style='color:#f29e38ff'>a high chance of Imprisoning them</span><span>.</span>",
            "Type": "Ultimate"
          },
          "100404": {
            "Name": "Time Distortion",
            "Desc": "<span>When hitting a Slowed enemy, </span><span style='color:#f29e38ff'>additionally deals minor Imaginary <u>Additional DMG</u></span><span>.</span>",
            "Type": "Talent"
          },
          "100406": {
            "Name": "Attack",
            "Desc": ""
          },
          "100407": {
            "Name": "Gravitational Imprisonment",
            "Desc": "<span>Creates a Special Dimension. Enemies in this dimension have their movement speed reduced. After entering combat with enemies in the dimension, there is a </span><span style='color:#f29e38ff'>high chance for the enemies to become Imprisoned</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100401": {
            "Name": "Legacy of Honor",
            "Desc": "<span>After using Ultimate, Welt gets enhanced. Then, the next 2 time(s) he uses Basic ATK or Skill, deals 1 extra instance of Additional DMG to the target enemy. The Additional DMG dealt when using Basic ATK is equal to 50% of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to 80% of Skill DMG multiplier.</span>"
          },
          "100402": {
            "Name": "Conflux of Stars",
            "Desc": "<span>When his Talent is triggered, Welt regenerates 3 Energy.</span>"
          },
          "100403": {
            "Name": "Prayer of Peace",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100404": {
            "Name": "Appellation of Justice",
            "Desc": "<span>Base chance for Skill to inflict SPD Reduction increases by 35%.</span>"
          },
          "100405": {
            "Name": "Power of Kindness",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100406": {
            "Name": "Prospect of Glory",
            "Desc": "<span>When using Skill, deals DMG for 1 extra time to a random enemy.</span>"
          }
        }
      },
      "1005": {
        "Name": "Kafka",
        "Abilities": {
          "100501": {
            "Name": "Midnight Tumult",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100502": {
            "Name": "Caressing Moonlight",
            "Desc": "<span>Deals Lightning DMG to a single enemy and minor Lightning DMG to adjacent targets.<br>If the primary target is currently afflicted with a DoT effect, the DoT </span><span style='color:#f29e38ff'>deals DMG 1 extra time</span><span>.</span>",
            "Type": "Skill"
          },
          "100503": {
            "Name": "Twilight Trill",
            "Desc": "<span>Deals minor Lightning DMG to all enemies, with a high chance of </span><span style='color:#f29e38ff'>Shocking them</span><span>.<br>If the enemies are currently Shocked, the Shock status </span><span style='color:#f29e38ff'>deals DMG 1 extra time</span><span>.</span>",
            "Type": "Ultimate"
          },
          "100504": {
            "Name": "Gentle but Cruel",
            "Desc": "<span>After an ally uses Basic ATK on an enemy, Kafka immediately launches a <u>follow-up attack</u> and deals Lightning DMG with a high chance of </span><span style='color:#f29e38ff'>inflicting Shock</span><span> to that target. This effect can only be triggered 1 time per turn.</span>",
            "Type": "Talent"
          },
          "100506": {
            "Name": "Attack",
            "Desc": ""
          },
          "100507": {
            "Name": "Mercy Is Not Forgiveness",
            "Desc": "<span>Attacks all enemies within range. After entering battle, deals minor Lightning DMG to all enemies, with a high chance to </span><span style='color:#f29e38ff'>Shock</span><span> them.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100501": {
            "Name": "Da Capo",
            "Desc": "<span>When the Talent triggers a follow-up attack, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turn(s).</span>"
          },
          "100502": {
            "Name": "Fortississimo",
            "Desc": "<span>While Kafka is on the field, DoT dealt by all allies increases by 25%.</span>"
          },
          "100503": {
            "Name": "Capriccio",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100504": {
            "Name": "Recitativo",
            "Desc": "<span>When an enemy target takes DMG from the Shock status inflicted by Kafka, Kafka additionally regenerates 2 Energy.</span>"
          },
          "100505": {
            "Name": "Doloroso",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100506": {
            "Name": "Leggiero",
            "Desc": "<span>The Shock inflicted on the enemy target by the Ultimate, the Technique, or the Talent-triggered follow-up attack has a DMG multiplier increase of 156% and lasts 1 turn(s) longer.</span>"
          }
        }
      },
      "1006": {
        "Name": "Silver Wolf",
        "Abilities": {
          "100601": {
            "Name": "System Warning",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100602": {
            "Name": "Allow Changes?",
            "Desc": "<span>There is a high chance to </span><span style='color:#f29e38ff'>apply additional Type Weaknesses</span><span> to a single enemy and deals Quantum DMG to this target enemy.</span>",
            "Type": "Skill"
          },
          "100603": {
            "Name": "User Banned",
            "Desc": "<span>There is a high chance of </span><span style='color:#f29e38ff'>lowering a single enemy's DEF</span><span> and deals massive Quantum DMG to this target enemy.</span>",
            "Type": "Ultimate"
          },
          "100604": {
            "Name": "Awaiting System Response...",
            "Desc": "<span>After this unit attacks, there is a chance of implanting the attacked enemy with 1 random </span><span style='color:#f29e38ff'>Bug</span><span>.</span>",
            "Type": "Talent"
          },
          "100606": {
            "Name": "Attack",
            "Desc": ""
          },
          "100607": {
            "Name": "Force Quit Program",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor DMG to all enemies and reduces Toughness of all enemies irrespective of Weakness Types.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100601": {
            "Name": "Social Engineering",
            "Desc": "<span>After using her Ultimate to attack enemies, Silver Wolf regenerates 7 Energy for every debuff that the target enemy currently has. This effect can be triggered up to 5 time(s) in each use of her Ultimate.</span>"
          },
          "100602": {
            "Name": "Zombie Network",
            "Desc": "<span>When an enemy enters battle, reduces their Effect RES by 20%.</span>"
          },
          "100603": {
            "Name": "Payload",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100604": {
            "Name": "Bounce Attack",
            "Desc": "<span>After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate.</span>"
          },
          "100605": {
            "Name": "Brute Force Attack",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100606": {
            "Name": "Overlay Network",
            "Desc": "<span>For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%.</span>"
          }
        }
      },
      "1008": {
        "Name": "Arlan",
        "Abilities": {
          "100801": {
            "Name": "Lightning Rush",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100802": {
            "Name": "Shackle Breaker",
            "Desc": "<span>Consumes a portion of HP to deal Lightning DMG to a single enemy.</span>",
            "Type": "Skill"
          },
          "100803": {
            "Name": "Frenzied Punishment",
            "Desc": "<span>Deals massive Lightning DMG to a single enemy and Lightning DMG to enemies adjacent to it.</span>",
            "Type": "Ultimate"
          },
          "100804": {
            "Name": "Pain and Anger",
            "Desc": "<span>Gain DMG bonus </span><span style='color:#f29e38ff'>based on</span><span> </span><span style='color:#f29e38ff'>currently missing HP percentage</span><span>.</span>",
            "Type": "Talent"
          },
          "100806": {
            "Name": "Attack",
            "Desc": ""
          },
          "100807": {
            "Name": "Swift Harvest",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Lightning DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100801": {
            "Name": "To the Bitter End",
            "Desc": "<span>When HP percentage is lower than or equal to 50% of Max HP, increases DMG dealt by Skill by 10%.</span>"
          },
          "100802": {
            "Name": "Breaking Free",
            "Desc": "<span>Using Skill or Ultimate removes 1 debuff from oneself.</span>"
          },
          "100803": {
            "Name": "Power Through",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100804": {
            "Name": "Turn the Tables",
            "Desc": "<span>When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to 25% of his Max HP. This effect is automatically removed after it is triggered once or after 2 turn(s) have elapsed.</span>"
          },
          "100805": {
            "Name": "Hammer and Tongs",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100806": {
            "Name": "Self-Sacrifice",
            "Desc": "<span>When the current HP percentage drops to 50% or below, Ultimate deals 20% more DMG, and the DMG multiplier for adjacent targets is raised to the same level as that for the primary target.</span>"
          }
        }
      },
      "1009": {
        "Name": "Asta",
        "Abilities": {
          "100901": {
            "Name": "Spectrum Beam",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "100902": {
            "Name": "Meteor Storm",
            "Desc": "<span>Deals minor Fire DMG to single enemy targets with 5 Bounces in total.</span>",
            "Type": "Skill"
          },
          "100903": {
            "Name": "Astral Blessing",
            "Desc": "<span></span><span style='color:#f29e38ff'>Increases SPD</span><span> for all allies.</span>",
            "Type": "Ultimate"
          },
          "100904": {
            "Name": "Astrometry",
            "Desc": "<span>The character will receive 1 stack of Charging for every different enemy they hit, for a maximum of 5 stacks. Every stack of Charging increases ATK for all allies. At the beginning of their turn, reduce Charging stacks.</span>",
            "Type": "Talent"
          },
          "100906": {
            "Name": "Attack",
            "Desc": ""
          },
          "100907": {
            "Name": "Miracle Flash",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "100901": {
            "Name": "Star Sings Sans Verses or Vocals",
            "Desc": "<span>When using Skill, deals DMG for 1 extra time to a random enemy.</span>"
          },
          "100902": {
            "Name": "Moon Speaks in Wax and Wane",
            "Desc": "<span>After using her Ultimate, Asta's Charging stacks will not be reduced in the next turn.</span>"
          },
          "100903": {
            "Name": "Meteor Showers for Wish and Want",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "100904": {
            "Name": "Aurora Basks in Beauty and Bliss",
            "Desc": "<span>Asta's Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks.</span>"
          },
          "100905": {
            "Name": "Nebula Secludes in Runes and Riddles",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "100906": {
            "Name": "Cosmos Dreams in Calm and Comfort",
            "Desc": "<span>Charging stack(s) lost in each turn is reduced by 1.</span>"
          }
        }
      },
      "1013": {
        "Name": "Herta",
        "Abilities": {
          "101301": {
            "Name": "What Are You Looking At?",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "101302": {
            "Name": "One-Time Offer",
            "Desc": "<span>Deals minor Ice DMG to all enemies. Targets with higher HP will receive increased DMG.</span>",
            "Type": "Skill"
          },
          "101303": {
            "Name": "It's Magic, I Added Some Magic",
            "Desc": "<span>Deals Ice DMG to all enemies.</span>",
            "Type": "Ultimate"
          },
          "101304": {
            "Name": "Fine, I'll Do It Myself",
            "Desc": "<span>When any ally's attack reduces the Enemy target's current HP percentage to </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>50%</span></span><span> or lower, Herta immediately launches </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span>, dealing minor Ice DMG to all Enemy units.</span>",
            "Type": "Talent"
          },
          "101306": {
            "Name": "Attack",
            "Desc": ""
          },
          "101307": {
            "Name": "It Can Still Be Optimized",
            "Desc": "<span>After using Technique, increases this unit's ATK at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "101301": {
            "Name": "Kick You When You're Down",
            "Desc": "<span>If the enemy's HP percentage is at 50% or less, Herta's Basic ATK deals Additional Ice DMG equal to 40% of Herta's ATK.</span>"
          },
          "101302": {
            "Name": "Keep the Ball Rolling",
            "Desc": "<span>Every time Talent is triggered, this character's CRIT Rate increases by 3%. This effect can stack up to 5 time(s).</span>"
          },
          "101303": {
            "Name": "That's the Kind of Girl I Am",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "101304": {
            "Name": "Hit Where It Hurts",
            "Desc": "<span>When Talent is triggered, DMG increases by 10%.</span>"
          },
          "101305": {
            "Name": "Cuss Big or Cuss Nothing",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "101306": {
            "Name": "No One Can Betray Me",
            "Desc": "<span>After using Ultimate, this character's ATK increases by 25% for 1 turn(s).</span>"
          }
        }
      },
      "1101": {
        "Name": "Bronya",
        "Abilities": {
          "110101": {
            "Name": "Windrider Bullet",
            "Desc": "<span>Deals minor Wind DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110102": {
            "Name": "Combat Redeployment",
            "Desc": "<span></span><span style='color:#f29e38ff'>Dispels</span><span> 1 </span><span style='color:#f29e38ff'><u>debuff</u></span><span> from a single ally, </span><span style='color:#f29e38ff'>increases the damage they deal</span><span>, and allows them to </span><span style='color:#f29e38ff'>immediately take action</span><span>.</span>",
            "Type": "Skill"
          },
          "110103": {
            "Name": "The Belobog March",
            "Desc": "<span>Increases </span><span style='color:#f29e38ff'>ATK</span><span> and </span><span style='color:#f29e38ff'>CRIT DMG</span><span> of all allies.</span>",
            "Type": "Ultimate"
          },
          "110104": {
            "Name": "Leading the Way",
            "Desc": "<span>After this character uses Basic ATK, their next action will be <u>Advanced Forward</u>.</span>",
            "Type": "Talent"
          },
          "110106": {
            "Name": "Attack",
            "Desc": ""
          },
          "110107": {
            "Name": "Banner of Command",
            "Desc": "<span>After this character uses Technique, increases all allies' ATK at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110101": {
            "Name": "Hone Your Strength",
            "Desc": "<span>When using Skill, there is a 50% fixed chance of recovering 1 Skill Point. This effect has a 1-turn cooldown.</span>"
          },
          "110102": {
            "Name": "Quick March",
            "Desc": "<span>When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn.</span>"
          },
          "110103": {
            "Name": "Bombardment",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110104": {
            "Name": "Take by Surprise",
            "Desc": "<span>After any other allied character uses Basic ATK on an enemy target that has Wind Weakness, Bronya immediately launches 1 instance of follow-up attack, dealing Wind DMG to this target by an amount equal to 80% of Basic ATK DMG. This effect can only trigger once per turn.</span>"
          },
          "110105": {
            "Name": "Unstoppable",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110106": {
            "Name": "Piercing Rainbow",
            "Desc": "<span>The duration of the DMG Boost effect placed by the Skill on the target ally increases by 1 turn(s).</span>"
          }
        }
      },
      "1102": {
        "Name": "Seele",
        "Abilities": {
          "110201": {
            "Name": "Thwack",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110202": {
            "Name": "Sheathed Blade",
            "Desc": "<span>Deals Quantum DMG to a single enemy and increases SPD.</span>",
            "Type": "Skill"
          },
          "110203": {
            "Name": "Butterfly Flurry",
            "Desc": "<span>Enters the </span><span style='color:#f29e38ff'>Amplification state</span><span> and deals massive Quantum DMG to a single enemy.</span>",
            "Type": "Ultimate"
          },
          "110204": {
            "Name": "Resurgence",
            "Desc": "<span>When </span><span style='color:#f29e38ff'>defeating enemy targets</span><span> with Basic ATK, Skill, or Ultimate, gains an </span><span style='color:#f29e38ff'><u>extra turn</u> and enters the Amplification state</span><span>. While in Amplification, increases the DMG dealt by this unit.</span>",
            "Type": "Talent"
          },
          "110206": {
            "Name": "Attack",
            "Desc": ""
          },
          "110207": {
            "Name": "Phantom Illusion",
            "Desc": "<span>Enter </span><span style='color:#f29e38ff'>Stealth</span><span> mode. After attacking an enemy and entering battle, enters the </span><span style='color:#f29e38ff'>Amplification state</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110201": {
            "Name": "Extirpating Slash",
            "Desc": "<span>When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%.</span>"
          },
          "110202": {
            "Name": "Dancing Butterfly",
            "Desc": "<span>The SPD Boost effect of Seele's Skill can stack up to 2 time(s).</span>"
          },
          "110203": {
            "Name": "Dazzling Tumult",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110204": {
            "Name": "Flitting Phantasm",
            "Desc": "<span>Seele regenerates 15 Energy when she defeats an enemy.</span>"
          },
          "110205": {
            "Name": "Piercing Shards",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110206": {
            "Name": "Shattering Shambles",
            "Desc": "<span>After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for 1 turn(s). Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to 15% of Seele's Ultimate DMG every time they are attacked. If the target enemy is defeated by the Butterfly Flurry DMG triggered by other allies' attacks, Seele's Talent will not be triggered.<br>When Seele is knocked down, the Butterfly Flurry inflicted on the enemies will be removed.</span>"
          }
        }
      },
      "1103": {
        "Name": "Serval",
        "Abilities": {
          "110301": {
            "Name": "Roaring Thunderclap",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110302": {
            "Name": "Lightning Flash",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy and any adjacent targets, with a high chance of causing </span><span style='color:#f29e38ff'>Shock</span><span>.</span>",
            "Type": "Skill"
          },
          "110303": {
            "Name": "Here Comes the Mechanical Fever",
            "Desc": "<span>Deals Lightning DMG to all enemies and increases the duration of Shock.</span>",
            "Type": "Ultimate"
          },
          "110304": {
            "Name": "Galvanic Chords",
            "Desc": "<span>After attacking, deals </span><span style='color:#f29e38ff'>a minor amount of <u>Additional DMG</u></span><span> to all Shocked enemies.</span>",
            "Type": "Talent"
          },
          "110306": {
            "Name": "Attack",
            "Desc": ""
          },
          "110307": {
            "Name": "Good Night, Belobog",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Lightning DMG to a random single enemy, with a high chance to </span><span style='color:#f29e38ff'>Shock</span><span> all enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110301": {
            "Name": "Echo Chamber",
            "Desc": "<span>Basic ATK deals Lightning DMG equal to 60% of Basic ATK DMG to a random target adjacent to the target enemy.</span>"
          },
          "110302": {
            "Name": "Encore!",
            "Desc": "<span>Every time Serval's Talent is triggered to deal Additional DMG, she regenerates 4 Energy.</span>"
          },
          "110303": {
            "Name": "Listen, the Heartbeat of the Gears",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110304": {
            "Name": "Make Some Noise!",
            "Desc": "<span>Ultimate has a 100% base chance to apply Shock to any enemies not currently Shocked. This Shock has the same effects as the one applied by Skill.</span>"
          },
          "110305": {
            "Name": "Belobog's Loudest Roar!",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110306": {
            "Name": "This Song Rocks to Heaven!",
            "Desc": "<span>Serval deals 30% more DMG to Shocked enemies.</span>"
          }
        }
      },
      "1104": {
        "Name": "Gepard",
        "Abilities": {
          "110401": {
            "Name": "Fist of Conviction",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110402": {
            "Name": "Daunting Smite",
            "Desc": "<span>Deals Ice DMG to a single enemy, </span><span style='color:#f29e38ff'>with a chance of Freezing them</span><span>.</span>",
            "Type": "Skill"
          },
          "110403": {
            "Name": "Enduring Bulwark",
            "Desc": "<span></span><span style='color:#f29e38ff'>Provides a Shield</span><span> to all allies.</span>",
            "Type": "Ultimate"
          },
          "110404": {
            "Name": "Unyielding Will",
            "Desc": "<span>When struck by a killing blow, </span><span style='color:#f29e38ff'>instead of being <u>knocked down</u></span><span>, immediately restores HP. This effect can only trigger 1 time per battle.</span>",
            "Type": "Talent"
          },
          "110406": {
            "Name": "Attack",
            "Desc": ""
          },
          "110407": {
            "Name": "Comradery",
            "Desc": "<span>After this character uses Technique, all allies gain a Shield at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110401": {
            "Name": "Due Diligence",
            "Desc": "<span>When using Skill, increases the base chance to Freeze target enemy by 35%.</span>"
          },
          "110402": {
            "Name": "Lingering Cold",
            "Desc": "<span>After an enemy Frozen by Skill is unfrozen, their SPD is reduced by 20% for 1 turn(s).</span>"
          },
          "110403": {
            "Name": "Never Surrender",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110404": {
            "Name": "Faith Moves Mountains",
            "Desc": "<span>When Gepard is in battle, all allies' Effect RES increases by 20%.</span>"
          },
          "110405": {
            "Name": "Cold Iron Fist",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110406": {
            "Name": "Unyielding Resolve",
            "Desc": "<span>When his Talent is triggered, Gepard immediately takes action and restores extra HP equal to 50% of his Max HP.</span>"
          }
        }
      },
      "1105": {
        "Name": "Natasha",
        "Abilities": {
          "110501": {
            "Name": "Behind the Kindness",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110502": {
            "Name": "Love, Heal, and Choose",
            "Desc": "<span></span><span style='color:#f29e38ff'>Restores HP</span><span> for a single ally and provides </span><span style='color:#f29e38ff'>Healing Over Time</span><span> to them.</span>",
            "Type": "Skill"
          },
          "110503": {
            "Name": "Gift of Rebirth",
            "Desc": "<span></span><span style='color:#f29e38ff'>Restores HP</span><span> for all allies.</span>",
            "Type": "Ultimate"
          },
          "110504": {
            "Name": "Innervation",
            "Desc": "<span>When healing allies with low HP percentage, increases Outgoing Healing. This effect also works on continuous healing.</span>",
            "Type": "Talent"
          },
          "110506": {
            "Name": "Attack",
            "Desc": ""
          },
          "110507": {
            "Name": "Hypnosis Research",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict Weaken to all enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110501": {
            "Name": "Pharmacology Expertise",
            "Desc": "<span>After being attacked, if the current HP percentage is 30% or lower, heals self for 1 time to restore HP by an amount equal to 15% of Max HP plus 400. This effect can only be triggered 1 time per battle.</span>"
          },
          "110502": {
            "Name": "Clinical Research",
            "Desc": "<span>When Natasha uses her Ultimate, grant continuous healing for 1 turn(s) to allies whose HP percentage is at 30% or lower. And at the beginning of their turn, their HP is restored by an amount equal to 6% of Natasha's Max HP plus 160.</span>"
          },
          "110503": {
            "Name": "The Right Cure",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110504": {
            "Name": "Miracle Cure",
            "Desc": "<span>After being attacked, regenerates 5 extra Energy.</span>"
          },
          "110505": {
            "Name": "Preventive Treatment",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110506": {
            "Name": "Doctor's Grace",
            "Desc": "<span>Natasha's Basic ATK additionally deals Physical DMG equal to 40% of her Max HP.</span>"
          }
        }
      },
      "1106": {
        "Name": "Pela",
        "Abilities": {
          "110601": {
            "Name": "Frost Shot",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110602": {
            "Name": "Frostbite",
            "Desc": "<span></span><span style='color:#f29e38ff'>Dispels</span><span> 1 </span><span style='color:#f29e38ff'><u>buff</u></span><span> from a single enemy target, and deals Ice DMG to the target enemy.</span>",
            "Type": "Skill"
          },
          "110603": {
            "Name": "Zone Suppression",
            "Desc": "<span>Has a high chance of </span><span style='color:#f29e38ff'>lowering enemies' DEF</span><span> and deals minor Ice DMG to all enemies.</span>",
            "Type": "Ultimate"
          },
          "110604": {
            "Name": "Data Collecting",
            "Desc": "<span>After using an attack, if the enemy target is currently inflicted with <u>debuff(s)</u>, Pela regenerates Energy.</span>",
            "Type": "Talent"
          },
          "110606": {
            "Name": "Attack",
            "Desc": ""
          },
          "110607": {
            "Name": "Preemptive Strike",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor DMG to a random single enemy, with a high chance of lowering the DEF of all enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110601": {
            "Name": "Victory Report",
            "Desc": "<span>When an enemy is defeated, Pela regenerates 5 Energy.</span>"
          },
          "110602": {
            "Name": "Adamant Charge",
            "Desc": "<span>Using Skill to remove buff(s) increases SPD by 10% for 2 turn(s).</span>"
          },
          "110603": {
            "Name": "Suppressive Force",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110604": {
            "Name": "Full Analysis",
            "Desc": "<span>When Skill is used, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turn(s).</span>"
          },
          "110605": {
            "Name": "Absolute Jeopardy",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110606": {
            "Name": "Feeble Pursuit",
            "Desc": "<span>When Pela attacks a debuffed enemy, she deals Additional Ice DMG equal to 40% of Pela's ATK to the enemy.</span>"
          }
        }
      },
      "1107": {
        "Name": "Clara",
        "Abilities": {
          "110701": {
            "Name": "I Want to Help",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110702": {
            "Name": "Svarog Watches Over You",
            "Desc": "<span>Deals Physical DMG to all enemies. </span><span style='color:#f29e38ff'>Additionally deals Physical DMG</span><span> to targets with Marks of Counter.</span>",
            "Type": "Skill"
          },
          "110703": {
            "Name": "Promise, Not Command",
            "Desc": "<span></span><span style='color:#f29e38ff'>Reduces DMG received</span><span>, increases chance to be attacked by enemies, and enhances <u>Counters</u>.</span>",
            "Type": "Ultimate"
          },
          "110704": {
            "Name": "Because We're Family",
            "Desc": "<span></span><span style='color:#f29e38ff'>DMG received from enemy attacks is reduced</span><span>. Enemies who attack Clara will be marked with a Mark of Counter and </span><span style='color:#f29e38ff'>met with Svarog's <u>Counter</u></span><span>, dealing Physical DMG.</span>",
            "Type": "Talent"
          },
          "110706": {
            "Name": "Attack",
            "Desc": ""
          },
          "110707": {
            "Name": "A Small Price for Victory",
            "Desc": "<span>Attacks the enemy. After entering battle, this character's chance of being attacked by enemies increases.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110701": {
            "Name": "A Tall Figure",
            "Desc": "<span>Using Skill will not remove Marks of Counter on the enemy.</span>"
          },
          "110702": {
            "Name": "A Tight Embrace",
            "Desc": "<span>After using the Ultimate, ATK increases by 30% for 2 turn(s).</span>"
          },
          "110703": {
            "Name": "Cold Steel Armor",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110704": {
            "Name": "Family's Warmth",
            "Desc": "<span>After Clara is hit, the DMG taken by Clara is reduced by 30%. This effect lasts until the start of her next turn.</span>"
          },
          "110705": {
            "Name": "A Small Promise",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110706": {
            "Name": "Long Company",
            "Desc": "<span>After other allies are hit, Svarog also has a 50% fixed chance to trigger a Counter on the attacker and mark them with a Mark of Counter. When using Ultimate, the number of Enhanced Counters increases by 1.</span>"
          }
        }
      },
      "1108": {
        "Name": "Sampo",
        "Abilities": {
          "110801": {
            "Name": "Dazzling Blades",
            "Desc": "<span>Deals minor Wind DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110802": {
            "Name": "Ricochet Love",
            "Desc": "<span>Deals minor Wind DMG to single enemy targets with 5 Bounces in total.</span>",
            "Type": "Skill"
          },
          "110803": {
            "Name": "Surprise Present",
            "Desc": "<span>Deals Wind DMG to all enemies, with a high chance to cause </span><span style='color:#f29e38ff'>increased DoT taken</span><span> to them.</span>",
            "Type": "Ultimate"
          },
          "110804": {
            "Name": "Windtorn Dagger",
            "Desc": "<span>After hitting an enemy, there is a chance of inflicting </span><span style='color:#f29e38ff'>Wind Shear</span><span> on the target.</span>",
            "Type": "Talent"
          },
          "110806": {
            "Name": "Attack",
            "Desc": ""
          },
          "110807": {
            "Name": "Shining Bright",
            "Desc": "<span>Enemies in a set area are Blinded. When initiating battle against a Blinded enemy, there is a high chance to <u>delay</u> all enemies' actions.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110801": {
            "Name": "Rising Love",
            "Desc": "<span>When using Skill, deals DMG for 1 extra time(s) to a random enemy.</span>"
          },
          "110802": {
            "Name": "Infectious Enthusiasm",
            "Desc": "<span>Defeating an enemy with Wind Shear has a 100% base chance to inflict all enemies with 1 stack(s) of Wind Shear, equivalent to the Talent's Wind Shear.</span>"
          },
          "110803": {
            "Name": "Big Money!",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110804": {
            "Name": "The Deeper the Love, the Stronger the Hate",
            "Desc": "<span>When Skill hits an enemy with 5 or more stack(s) of Wind Shear, the enemy immediately takes 8% of current Wind Shear DMG.</span>"
          },
          "110805": {
            "Name": "Huuuuge Money!",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110806": {
            "Name": "Increased Spending",
            "Desc": "<span>Talent's Wind Shear DMG multiplier increases by 15%.</span>"
          }
        }
      },
      "1109": {
        "Name": "Hook",
        "Abilities": {
          "110901": {
            "Name": "Hehe! Don't Get Burned!",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "110902": {
            "Name": "Hey! Remember Hook?",
            "Desc": "<span>Deals Fire DMG to a single enemy, with a high chance to inflict Burn on the enemy.</span>",
            "Type": "Skill"
          },
          "110903": {
            "Name": "Boom! Here Comes the Fire!",
            "Desc": "<span>Deals massive Fire DMG to a single enemy and </span><span style='color:#f29e38ff'>Enhances this unit's next Skill</span><span>.</span>",
            "Type": "Ultimate"
          },
          "110904": {
            "Name": "Ha! Oil to the Flames!",
            "Desc": "<span>When attacking a Burned enemy, </span><span style='color:#f29e38ff'>deals <u>Additional</u> Fire DMG for a moderate amount</span><span>, and additionally regenerates energy.</span>",
            "Type": "Talent"
          },
          "110906": {
            "Name": "Attack",
            "Desc": ""
          },
          "110907": {
            "Name": "Ack! Look at This Mess!",
            "Desc": "<span>Attacks the enemy. After entering battle, deals Fire DMG to a random single enemy, with a high chance to inflict Burn on all enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "110901": {
            "Name": "Early to Bed, Early to Rise",
            "Desc": "<span>Enhanced Skill deals 20% increased DMG.</span>"
          },
          "110902": {
            "Name": "Happy Tummy, Happy Body",
            "Desc": "<span>Extends the duration of Burn caused by Skill by 1 turn(s).</span>"
          },
          "110903": {
            "Name": "Don't Be Picky, Nothing's Icky",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "110904": {
            "Name": "It's Okay to Not Know",
            "Desc": "<span>When Talent is triggered, there is a 100% base chance to Burn enemies adjacent to the target enemy, equivalent to that of Skill.</span>"
          },
          "110905": {
            "Name": "Let the Moles' Deeds Be Known",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "110906": {
            "Name": "Always Ready to Punch and Kick",
            "Desc": "<span>Hook deals 20% more DMG to enemies afflicted with Burn.</span>"
          }
        }
      },
      "1110": {
        "Name": "Lynx",
        "Abilities": {
          "111001": {
            "Name": "Ice Crampon Technique",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "111002": {
            "Name": "Salted Camping Cans",
            "Desc": "<span>Applies \"Survival Response\" to a single ally, </span><span style='color:#f29e38ff'>increases their Max HP</span><span>, and restores their HP.</span>",
            "Type": "Skill"
          },
          "111003": {
            "Name": "Snowfield First Aid",
            "Desc": "<span>Dispels </span><span style='color:#f29e38ff'>1 <u>debuff</u> from all allies</span><span> and restores their HP.</span>",
            "Type": "Ultimate"
          },
          "111004": {
            "Name": "Outdoor Survival Experience",
            "Desc": "<span>When using Skill or Ultimate, applies </span><span style='color:#f29e38ff'>continuous healing</span><span> on the target ally. If the target has \"Survival Response,\" the continuous healing effect additionally increases.</span>",
            "Type": "Talent"
          },
          "111006": {
            "Name": "Attack",
            "Desc": ""
          },
          "111007": {
            "Name": "Chocolate Energy Bar",
            "Desc": "<span>After this character uses her Technique, at the start of the next battle, all allies are granted a continuous healing effect.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "111001": {
            "Name": "Morning of Snow Hike",
            "Desc": "<span>When healing allies with HP percentage equal to or lower than 50%, Lynx's Outgoing Healing increases by 20%. This effect also works on continuous healing.</span>"
          },
          "111002": {
            "Name": "Noon of Portable Furnace",
            "Desc": "<span>A target with \"Survival Response\" can resist debuff application for 1 time(s).</span>"
          },
          "111003": {
            "Name": "Afternoon of Avalanche Beacon",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "111004": {
            "Name": "Dusk of Warm Campfire",
            "Desc": "<span>When \"Survival Response\" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).</span>"
          },
          "111005": {
            "Name": "Night of Aurora Tea",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "111006": {
            "Name": "Dawn of Explorers' Chart",
            "Desc": "<span>Additionally boosts the Max HP increasing effect of \"Survival Response\" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%.</span>"
          }
        }
      },
      "1111": {
        "Name": "Luka",
        "Abilities": {
          "111101": {
            "Name": "Direct Punch",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "111102": {
            "Name": "Lacerating Fist",
            "Desc": "<span>Deals Physical DMG to a single enemy, with a high chance of causing </span><span style='color:#f29e38ff'>Bleed</span><span>.</span>",
            "Type": "Skill"
          },
          "111103": {
            "Name": "Coup de Grâce",
            "Desc": "<span>Receives </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>2</span></span><span> stack(s) of Fighting Will, with a high chance of increasing the target's DMG received, and deals massive Physical DMG to the target.</span>",
            "Type": "Ultimate"
          },
          "111104": {
            "Name": "Flying Sparks",
            "Desc": "<span>After using the Basic ATK \"Direct Punch\" or the Skill \"Lacerating Fist,\" receives 1 stack of Fighting Will. When 2 or more stacks of Fighting Will are present, </span><span style='color:#f29e38ff'>Basic ATK becomes Enhanced</span><span>.<br>If the enemy is Bleeding, the Enhanced Basic ATK will </span><span style='color:#f29e38ff'>cause Bleed to deal extra DMG for 1 time</span><span>.</span>",
            "Type": "Talent"
          },
          "111106": {
            "Name": "Attack",
            "Desc": ""
          },
          "111107": {
            "Name": "Anticipator",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict </span><span style='color:#f29e38ff'>Bleed</span><span> to the target. Then, gains 1 stack of Fighting Will.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "111101": {
            "Name": "Fighting Endlessly",
            "Desc": "<span>When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turn(s).</span>"
          },
          "111102": {
            "Name": "The Enemy is Weak, I am Strong",
            "Desc": "<span>If the Skill hits an enemy target with Physical Weakness, gain 1 stack(s) of Fighting Will.</span>"
          },
          "111103": {
            "Name": "Born for the Ring",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "111104": {
            "Name": "Never Turning Back",
            "Desc": "<span>For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 time(s).</span>"
          },
          "111105": {
            "Name": "The Spirit of Wildfire",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "111106": {
            "Name": "A Champion's Applause",
            "Desc": "<span>After the Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG 1 time equal to 8% of the original DMG for every hit of Direct Punch already unleashed during the current Enhanced Basic ATK.</span>"
          }
        }
      },
      "1112": {
        "Name": "Topaz & Numby",
        "Abilities": {
          "111201": {
            "Name": "Deficit...",
            "Desc": "<span>Deals minor Fire DMG to an enemy.</span>",
            "Type": "Basic ATK"
          },
          "111202": {
            "Name": "Difficulty Paying?",
            "Desc": "<span>Inflicts a single enemy with a Proof of Debt status and causes it to </span><span style='color:#f29e38ff'>receive increased follow-up attack DMG</span><span>. Numby deals Fire DMG to the target.</span>",
            "Type": "Skill"
          },
          "111203": {
            "Name": "Turn a Profit!",
            "Desc": "<span>Numby enters the Windfall Bonanza! state and </span><span style='color:#f29e38ff'>increases its DMG multiplier and CRIT DMG</span><span>.</span>",
            "Type": "Ultimate"
          },
          "111204": {
            "Name": "Trotter Market!?",
            "Desc": "<span>At the start of battle, summons </span><span style='color:#f29e38ff'>Numby</span><span>. When Numby takes action, </span><span style='color:#f29e38ff'>Numby deals follow-up attacks to a single enemy with Proof of Debt</span><span>. When an enemy with Proof of Debt takes DMG from follow-up attacks, Numby's </span><span style='color:#f29e38ff'>action is Advanced Forward</span><span>.</span>",
            "Type": "Talent"
          },
          "111206": {
            "Name": "Attack",
            "Desc": ""
          },
          "111207": {
            "Name": "Explicit Subsidy",
            "Desc": "<span></span><span style='color:#f29e38ff'>Summons Numby to tag along</span><span> in a map. Numby will automatically </span><span style='color:#f29e38ff'>search for Basic Treasures and Trotters nearby</span><span>. Using Technique will regenerate Energy for Topaz after Numby's first attack in the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "111201": {
            "Name": "Future Market",
            "Desc": "<span>When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single attack.<br>The Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by 25%, stacking up to 2 time(s). When Proof of Debt is removed, the Debtor state is also removed.</span>"
          },
          "111202": {
            "Name": "Bona Fide Acquisition",
            "Desc": "<span>After Numby takes action and launches an attack, Topaz regenerates 5 Energy.</span>"
          },
          "111203": {
            "Name": "Seize the Big and Free the Small",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "111204": {
            "Name": "Agile Operation",
            "Desc": "<span>After Numby's turn begins, Topaz's action is Advanced Forward by 20%.</span>"
          },
          "111205": {
            "Name": "Inflationary Demand",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "111206": {
            "Name": "Incentive Mechanism",
            "Desc": "<span>Numby's attack count during the Windfall Bonanza! state increases by 1, and its Fire RES PEN increases by 10% when it attacks.</span>"
          }
        }
      },
      "1201": {
        "Name": "Qingque",
        "Abilities": {
          "120101": {
            "Name": "Flower Pick",
            "Desc": "<span>Tosses a tile to deal minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120102": {
            "Name": "A Scoop of Moon",
            "Desc": "<span></span><span style='color:#f29e38ff'>Draws tiles</span><span> and increases DMG dealt. </span><span style='color:#f29e38ff'>This turn does not end</span><span> after this action.</span>",
            "Type": "Skill"
          },
          "120103": {
            "Name": "A Quartet? Woo-hoo!",
            "Desc": "<span>Deals Quantum DMG to all enemies, then obtains 4 tiles of the same suit.</span>",
            "Type": "Ultimate"
          },
          "120104": {
            "Name": "Celestial Jade",
            "Desc": "<span>At the start of any ally's turn, draws a tile. At the start of this character's turn, if this character holds 4 tiles from the same suit, remove all tiles in possession and </span><span style='color:#f29e38ff'>Enhance this Basic ATK</span><span> while increasing this character's ATK.</span>",
            "Type": "Talent"
          },
          "120106": {
            "Name": "Attack",
            "Desc": ""
          },
          "120107": {
            "Name": "Game Solitaire",
            "Desc": "<span>After they use their Technique, draw tile(s) at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120101": {
            "Name": "Rise Through the Tiles",
            "Desc": "<span>Ultimate deals 10% more DMG.</span>"
          },
          "120102": {
            "Name": "Sleep on the Tiles",
            "Desc": "<span>Every time Draw Tile is triggered, Qingque immediately regenerates 1 Energy.</span>"
          },
          "120103": {
            "Name": "Read Between the Tiles",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120104": {
            "Name": "Right on the Tiles",
            "Desc": "<span>After using Skill, there is a 24% fixed chance to gain Self-Sufficer, lasting until the end of the current turn. <br>With Self-Sufficer, using Basic ATK or Enhanced Basic ATK immediately launches 1 follow-up attack on the same target, dealing Quantum DMG equal to 100% of Basic ATK DMG or Enhanced Basic ATK DMG.</span>"
          },
          "120105": {
            "Name": "Gambit for the Tiles",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120106": {
            "Name": "Prevail Beyond the Tiles",
            "Desc": "<span>Recovers 1 Skill Point after using Enhanced Basic ATK.</span>"
          }
        }
      },
      "1202": {
        "Name": "Tingyun",
        "Abilities": {
          "120201": {
            "Name": "Dislodged",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120202": {
            "Name": "Soothing Melody",
            "Desc": "<span></span><span style='color:#f29e38ff'>Increases the ATK</span><span> of a single ally and grants them Benediction. Ally with Benediction additionally deals minor </span><span style='color:#f29e38ff'>Lightning <u>Additional DMG</u></span><span> when attacking.</span>",
            "Type": "Skill"
          },
          "120203": {
            "Name": "Amidst the Rejoicing Clouds",
            "Desc": "<span>Regenerates a target ally's </span><span style='color:#f29e38ff'>Energy</span><span> and </span><span style='color:#f29e38ff'>increases their DMG dealt</span><span>.</span>",
            "Type": "Ultimate"
          },
          "120204": {
            "Name": "Violet Sparknado",
            "Desc": "<span>When an enemy is attacked by Tingyun, the ally with Benediction immediately deals minor Lightning <u>Additional DMG</u> to the same enemy.</span>",
            "Type": "Talent"
          },
          "120206": {
            "Name": "Attack",
            "Desc": ""
          },
          "120207": {
            "Name": "Gentle Breeze",
            "Desc": "<span>After using this Technique, this character immediately regenerates Energy for themselves.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120201": {
            "Name": "Windfall of Lucky Springs",
            "Desc": "<span>After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.</span>"
          },
          "120202": {
            "Name": "Gainfully Gives, Givingly Gains",
            "Desc": "<span>The ally with Benediction regenerates 5 Energy after defeating an enemy. This effect can only be triggered once per turn.</span>"
          },
          "120203": {
            "Name": "Halcyon Bequest",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120204": {
            "Name": "Jovial Versatility",
            "Desc": "<span>The DMG multiplier provided by Benediction increases by 20%.</span>"
          },
          "120205": {
            "Name": "Sauntering Coquette",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120206": {
            "Name": "Peace Brings Wealth to All",
            "Desc": "<span>Ultimate regenerates 10 more Energy for the target ally.</span>"
          }
        }
      },
      "1203": {
        "Name": "Luocha",
        "Abilities": {
          "120301": {
            "Name": "Thorns of the Abyss",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120302": {
            "Name": "Prayer of Abyss Flower",
            "Desc": "<span></span><span style='color:#f29e38ff'>Restores</span><span> a single ally's HP and gains 1 stack of Abyss Flower.</span>",
            "Type": "Skill"
          },
          "120303": {
            "Name": "Death Wish",
            "Desc": "<span></span><span style='color:#f29e38ff'>Removes</span><span> 1 </span><span style='color:#f29e38ff'><u>buff</u></span><span> from all enemies, deals Imaginary DMG to all enemies, and gains 1 stack of Abyss Flower.</span>",
            "Type": "Ultimate"
          },
          "120304": {
            "Name": "Cycle of Life",
            "Desc": "<span>Deploys a </span><span style='color:#f29e38ff'>Zone</span><span> when Abyss Flower reaches 2 stacks. While the Zone is active, allies will </span><span style='color:#f29e38ff'>restore HP after they attack</span><span>.</span>",
            "Type": "Talent"
          },
          "120306": {
            "Name": "Attack",
            "Desc": ""
          },
          "120307": {
            "Name": "Mercy of a Fool",
            "Desc": "<span>After the Technique is used, immediately trigger the effect of the Talent at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120301": {
            "Name": "Ablution of the Quick",
            "Desc": "<span>While the Zone is active, ATK of all allies increases by 20%.</span>"
          },
          "120302": {
            "Name": "Bestowal From the Pure",
            "Desc": "<span>When his Skill is triggered, if the target ally's HP percentage is lower than 50%, Luocha's Outgoing Healing increases by 30%. If the target ally's HP percentage is at 50% or higher, the ally receives a Shield that can absorb DMG equal to 18% of Luocha's ATK plus 240, lasting for 2 turns.</span>"
          },
          "120303": {
            "Name": "Surveyal by the Fool",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120304": {
            "Name": "Heavy Lies the Crown",
            "Desc": "<span>When Luocha's Zone is active, enemies become Weakened and deal 12% less DMG.</span>"
          },
          "120305": {
            "Name": "Cicatrix 'Neath the Pain",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120306": {
            "Name": "Reunion With the Dust",
            "Desc": "<span>When Ultimate is used, there is a 100% fixed chance to reduce all enemies' All-Type RES by 20% for 2 turn(s).</span>"
          }
        }
      },
      "1204": {
        "Name": "Jing Yuan",
        "Abilities": {
          "120401": {
            "Name": "Glistening Light",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120402": {
            "Name": "Rifting Zenith",
            "Desc": "<span>Deals minor Lightning DMG to all enemies and </span><span style='color:#f29e38ff'>increases Lightning-Lord's Hits Per Action</span><span>.</span>",
            "Type": "Skill"
          },
          "120403": {
            "Name": "Lightbringer",
            "Desc": "<span>Deals Lightning DMG to all enemies and </span><span style='color:#f29e38ff'>increases Lightning-Lord's Hits Per Action</span><span>.</span>",
            "Type": "Ultimate"
          },
          "120404": {
            "Name": "Prana Extirpated",
            "Desc": "<span>Summons Lightning-Lord at the start of the battle. Lightning-Lord </span><span style='color:#f29e38ff'>automatically</span><span> </span><span style='color:#f29e38ff'>deals minor Lightning DMG</span><span> to a random enemy and enemies adjacent to it.</span>",
            "Type": "Talent"
          },
          "120406": {
            "Name": "Attack",
            "Desc": ""
          },
          "120407": {
            "Name": "Spiritus Invocation",
            "Desc": "<span>After using Technique, for the next battle, </span><span style='color:#f29e38ff'>increases Lightning-Lord's Hits Per Action</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120401": {
            "Name": "Slash, Seas Split",
            "Desc": "<span>When Lightning-Lord attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to 25% of the DMG multiplier against the primary target enemy.</span>"
          },
          "120402": {
            "Name": "Swing, Skies Squashed",
            "Desc": "<span>After Lightning-Lord takes action, DMG dealt by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20%, lasting for 2 turn(s).</span>"
          },
          "120403": {
            "Name": "Strike, Suns Subdued",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120404": {
            "Name": "Spin, Stars Sieged",
            "Desc": "<span>For each hit performed by the Lightning-Lord when it takes action, Jing Yuan regenerates 2 Energy.</span>"
          },
          "120405": {
            "Name": "Stride, Spoils Seized",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120406": {
            "Name": "Sweep, Souls Slain",
            "Desc": "<span>Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable.<br>While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s).</span>"
          }
        }
      },
      "1205": {
        "Name": "Blade",
        "Abilities": {
          "120501": {
            "Name": "Shard Sword",
            "Desc": "<span>Deals minor Wind DMG to an enemy.</span>",
            "Type": "Basic ATK"
          },
          "120502": {
            "Name": "Hellscape",
            "Desc": "<span>Consumes HP to </span><span style='color:#f29e38ff'>Enhance Basic ATK</span><span>, and this turn does not end after this Skill is used.</span>",
            "Type": "Skill"
          },
          "120503": {
            "Name": "Death Sentence",
            "Desc": "<span>Sets current HP to <span style='whiteSpace: \"nowrap\"'>50%</span> of Max HP, and deals massive Wind DMG to a single enemy and Wind DMG to adjacent targets.</span>",
            "Type": "Ultimate"
          },
          "120504": {
            "Name": "Shuhu's Gift",
            "Desc": "<span>When Blade's HP is lowered, he gains 1 stack of Charge. When maximum Charge stack is reached, Blade </span><span style='color:#f29e38ff'>immediately deals Wind DMG to all enemies</span><span> and restores HP. Then, all Charges are consumed.</span>",
            "Type": "Talent"
          },
          "120506": {
            "Name": "Attack",
            "Desc": ""
          },
          "120507": {
            "Name": "Karma Wind",
            "Desc": "<span>Attacks the enemy. After entering combat, consumes own HP and deals Wind DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120501": {
            "Name": "Blade Cuts the Deepest in Hell",
            "Desc": "<span>Blade's Ultimate deals additionally increased DMG to a single enemy target, with the increased amount equal to 150% of the tally of Blade's HP loss in the current battle.<br>The tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. The tally value will be reset and re-accumulated after his Ultimate has been used.</span>"
          },
          "120502": {
            "Name": "Ten Thousand Sorrows From One Broken Dream",
            "Desc": "<span>When Blade is in the Hellscape state, his CRIT Rate increases by 15%.</span>"
          },
          "120503": {
            "Name": "Hardened Blade Bleeds Coldest Shade",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120504": {
            "Name": "Rejected by Death, Infected With Life",
            "Desc": "<span>When Blade's current HP percentage drops to 50% or lower of his Max HP, increases his Max HP by 20%. Stacks up to 2 time(s).</span>"
          },
          "120505": {
            "Name": "Death By Ten Lords' Gaze",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120506": {
            "Name": "Reborn Into an Empty Husk",
            "Desc": "<span>The maximum number of Charge stacks is reduced to 4. The follow-up attack triggered by Talent deals additionally increased DMG, equal to 50% of Blade's Max HP.</span>"
          }
        }
      },
      "1206": {
        "Name": "Sushang",
        "Abilities": {
          "120601": {
            "Name": "Cloudfencer Art: Starshine",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120602": {
            "Name": "Cloudfencer Art: Mountainfall",
            "Desc": "<span>Deals Physical DMG to a single enemy with </span><span style='color:#f29e38ff'>a small chance of triggering Sword Stance</span><span>. If the enemy has <u>Weakness Break</u>, </span><span style='color:#f29e38ff'>Sword Stance is guaranteed to trigger</span><span>.</span>",
            "Type": "Skill"
          },
          "120603": {
            "Name": "Shape of Taixu: Dawn Herald",
            "Desc": "<span>Deals massive Physical DMG to a single enemy, enhances Sword Stance's effect, and </span><span style='color:#f29e38ff'>takes action immediately</span><span>.</span>",
            "Type": "Ultimate"
          },
          "120604": {
            "Name": "Dancing Blade",
            "Desc": "<span>When an enemy on the field has its Weakness Broken, this character's SPD increases.</span>",
            "Type": "Talent"
          },
          "120606": {
            "Name": "Attack",
            "Desc": ""
          },
          "120607": {
            "Name": "Cloudfencer Art: Warcry",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Physical DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120601": {
            "Name": "Cut With Ease",
            "Desc": "<span>After using Skill against a Weakness Broken enemy, regenerates 1 Skill Point.</span>"
          },
          "120602": {
            "Name": "Refine in Toil",
            "Desc": "<span>After Sword Stance is triggered, the DMG taken by Sushang is reduced by 20% for 1 turn.</span>"
          },
          "120603": {
            "Name": "Rise From Fame",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120604": {
            "Name": "Cleave With Heart",
            "Desc": "<span>Sushang's Break Effect increases by 40%.</span>"
          },
          "120605": {
            "Name": "Prevail via Taixu",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120606": {
            "Name": "Dwell Like Water",
            "Desc": "<span>Talent's SPD Boost is stackable and can stack up to 2 times. Additionally, after entering battle, Sushang immediately gains 1 stack of her Talent's SPD Boost.</span>"
          }
        }
      },
      "1207": {
        "Name": "Yukong",
        "Abilities": {
          "120701": {
            "Name": "Arrowslinger",
            "Desc": "<span>Deals minor Imaginary DMG to an enemy.</span>",
            "Type": "Basic ATK"
          },
          "120702": {
            "Name": "Emboldening Salvo",
            "Desc": "<span>Obtains 2 stacks of Roaring Bowstrings. All allies' </span><span style='color:#f29e38ff'>ATK increases</span><span> when Roaring Bowstrings is active on this character.</span>",
            "Type": "Skill"
          },
          "120703": {
            "Name": "Diving Kestrel",
            "Desc": "<span>When Roaring Bowstrings is active on this character, </span><span style='color:#f29e38ff'>increases the CRIT Rate and CRIT DMG</span><span> of all allies and deals massive Imaginary DMG to a single enemy.</span>",
            "Type": "Ultimate"
          },
          "120704": {
            "Name": "Seven Layers, One Arrow",
            "Desc": "<span>Basic Attack additionally deals minor DMG, and the Toughness Reduction of this Basic Attack is increased. This effect can be triggered again after 1 turn has passed.</span>",
            "Type": "Talent"
          },
          "120706": {
            "Name": "Attack",
            "Desc": ""
          },
          "120707": {
            "Name": "Windchaser",
            "Desc": "<span>This unit's </span><span style='color:#f29e38ff'>movement speed increases</span><span>. After attacking an enemy and entering battle, gains 2 stacks of Roaring Bowstrings.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120701": {
            "Name": "Aerial Marshal",
            "Desc": "<span>At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).</span>"
          },
          "120702": {
            "Name": "Skyward Command",
            "Desc": "<span>When any ally's current energy is equal to its energy limit, Yukong regenerates an additional 5 energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong uses her Ultimate.</span>"
          },
          "120703": {
            "Name": "Torrential Fusillade",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120704": {
            "Name": "Zephyrean Echoes",
            "Desc": "<span>When \"Roaring Bowstrings\" is active, Yukong deals 30% more DMG to enemies.</span>"
          },
          "120705": {
            "Name": "August Deadshot",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120706": {
            "Name": "Bowstring Thunderclap",
            "Desc": "<span>When Yukong uses her Ultimate, she immediately gains 1 stack(s) of \"Roaring Bowstrings.\"</span>"
          }
        }
      },
      "1208": {
        "Name": "Fu Xuan",
        "Abilities": {
          "120801": {
            "Name": "Novaburst",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120802": {
            "Name": "Known by Stars, Shown by Hearts",
            "Desc": "<span>Activates Matrix of Prescience. </span><span style='color:#f29e38ff'>DMG received by Fu Xuan's allies is <u>Distributed</u></span><span> to her. Also </span><span style='color:#f29e38ff'>increases CRIT Rate</span><span> and Max HP of all allies.</span>",
            "Type": "Skill"
          },
          "120803": {
            "Name": "Woes of Many Morphed to One",
            "Desc": "<span>Deals Quantum DMG to all enemies and increases Fu Xuan's Talent trigger count.</span>",
            "Type": "Ultimate"
          },
          "120804": {
            "Name": "Bleak Breeds Bliss",
            "Desc": "<span>While Fu Xuan is still active in battle, the DMG taken by all team members is reduced.<br>When her HP is low, </span><span style='color:#f29e38ff'>automatically</span><span> </span><span style='color:#f29e38ff'>restores her own HP</span><span> based on the HP percentage already lost. This effect can have up to 2 trigger counts at any given time.</span>",
            "Type": "Talent"
          },
          "120806": {
            "Name": "Attack",
            "Desc": ""
          },
          "120807": {
            "Name": "Of Fortune Comes Fate",
            "Desc": "<span>Activates a Barrier. Allies will not enter battle when attacked by enemies. Entering battle will automatically activate Matrix of Prescience.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120801": {
            "Name": "Dominus Pacis",
            "Desc": "<span>The Knowledge effect increases CRIT DMG by 30%.</span>"
          },
          "120802": {
            "Name": "Optimus Felix",
            "Desc": "<span>If any team member is struck by a killing blow while Matrix of Prescience is active, then all allies who were struck by a killing blow during this action will not be knocked down, and 70% of their Max HP is immediately restored. This effect can trigger 1 time per battle.</span>"
          },
          "120803": {
            "Name": "Apex Nexus",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120804": {
            "Name": "Fortuna Stellaris",
            "Desc": "<span>When other allies under Matrix of Prescience are attacked, Fu Xuan regenerates 5 Energy.</span>"
          },
          "120805": {
            "Name": "Arbiter Primus",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120806": {
            "Name": "Omnia Vita",
            "Desc": "<span>Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. The DMG dealt by Fu Xuan's Ultimate will increase by 200% of this tally of HP loss.<br>This tally is also capped at 120% of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used.</span>"
          }
        }
      },
      "1209": {
        "Name": "Yanqing",
        "Abilities": {
          "120901": {
            "Name": "Frost Thorn",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "120902": {
            "Name": "Darting Ironthorn",
            "Desc": "<span>Deals Ice DMG to a single enemy and activates the Soulsteel Sync.</span>",
            "Type": "Skill"
          },
          "120903": {
            "Name": "Amidst the Raining Bliss",
            "Desc": "<span>Increases Yanqing's CRIT Rate. Enhances \"Soulsteel Sync\" and deals massive Ice DMG to a single enemy.</span>",
            "Type": "Ultimate"
          },
          "120904": {
            "Name": "One With the Sword",
            "Desc": "<span></span><span style='color:#f29e38ff'>During Soulsteel Sync</span><span>, reduces the chance of this character being attacked and </span><span style='color:#f29e38ff'>increases their CRIT Rate and CRIT DMG</span><span>. </span><span style='color:#f29e38ff'>After attacking an enemy</span><span>, there is a chance of launching a <u>follow-up attack</u>, dealing Ice DMG with a chance to Freeze the target.<br>Soulsteel Sync will be removed after this character receives damage.</span>",
            "Type": "Talent"
          },
          "120906": {
            "Name": "Attack",
            "Desc": ""
          },
          "120907": {
            "Name": "The One True Sword",
            "Desc": "<span>After this character uses Technique, at the start of the next battle, increases the DMG dealt by this character to enemy targets whose HP percentage is <span style='whiteSpace: \"nowrap\"'>50%</span> or higher.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "120901": {
            "Name": "Svelte Saber",
            "Desc": "<span>When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to 60% of his ATK.</span>"
          },
          "120902": {
            "Name": "Supine Serenade",
            "Desc": "<span>When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%.</span>"
          },
          "120903": {
            "Name": "Sword Savant",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "120904": {
            "Name": "Searing Sting",
            "Desc": "<span>When the current HP percentage is 80% or higher, Ice RES PEN increases by 12%.</span>"
          },
          "120905": {
            "Name": "Surging Strife",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "120906": {
            "Name": "Swift Swoop",
            "Desc": "<span>If the buffs from Soulsteel Sync or the Ultimate are in effect when an enemy is defeated, the duration of these buffs is extended by 1 turn.</span>"
          }
        }
      },
      "1210": {
        "Name": "Guinaifen",
        "Abilities": {
          "121001": {
            "Name": "Standing Ovation",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121002": {
            "Name": "Blazing Welcome",
            "Desc": "<span>Deals Fire DMG to a single enemy and minor Fire DMG to adjacent enemies, with a high chance of </span><span style='color:#f29e38ff'>Burning</span><span> them.</span>",
            "Type": "Skill"
          },
          "121003": {
            "Name": "Watch This Showstopper",
            "Desc": "<span>Deals Fire DMG to all enemies. If the enemies are inflicted with Burn, the Burn status deals DMG 1 extra time.</span>",
            "Type": "Ultimate"
          },
          "121004": {
            "Name": "PatrAeon Benefits",
            "Desc": "<span>After the </span><span style='color:#f29e38ff'>Burn status causes DMG</span><span> on the enemy, there is a high chance of applying </span><span style='color:#f29e38ff'>Firekiss</span><span> to the enemy.</span>",
            "Type": "Talent"
          },
          "121006": {
            "Name": "Attack",
            "Desc": ""
          },
          "121007": {
            "Name": "Skill Showcase",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Fire DMG to a single target while applying </span><span style='color:#f29e38ff'>Firekiss</span><span>, with a total of 4 Bounces.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121001": {
            "Name": "Slurping Noodles During Handstand",
            "Desc": "<span>When Skill is used, there is a 100% base chance to reduce the attacked target enemy's Effect RES by 10% for 2 turn(s).</span>"
          },
          "121002": {
            "Name": "Brushing Teeth While Whistling",
            "Desc": "<span>When an enemy target is being Burned, the DMG multiplier of the Burn status applied by her Basic ATK or Skill increases by 40%.</span>"
          },
          "121003": {
            "Name": "Smashing Boulder on Chest",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121004": {
            "Name": "Blocking Pike with Neck",
            "Desc": "<span>Every time the Burn status inflicted by Guinaifen causes DMG, Guinaifen regenerates 2 Energy.</span>"
          },
          "121005": {
            "Name": "Swallowing Sword to Stomach",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121006": {
            "Name": "Catching Bullet with Hands",
            "Desc": "<span>Increases the stackable Firekiss count by 1.</span>"
          }
        }
      },
      "1211": {
        "Name": "Bailu",
        "Abilities": {
          "121101": {
            "Name": "Diagnostic Kick",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121102": {
            "Name": "Singing Among Clouds",
            "Desc": "<span>Restores HP for a single ally, then heals random allies.</span>",
            "Type": "Skill"
          },
          "121103": {
            "Name": "Felicitous Thunderleap",
            "Desc": "<span>Restores HP for all allies, and grants them Invigoration, or prolongs the duration of their Invigoration.</span>",
            "Type": "Ultimate"
          },
          "121104": {
            "Name": "Gourdful of Elixir",
            "Desc": "<span>When an ally with </span><span style='color:#f29e38ff'>Invigoration</span><span> is attacked, </span><span style='color:#f29e38ff'>restores HP</span><span> for the ally.<br>When an ally suffers a </span><span style='color:#f29e38ff'>killing blow</span><span>, Bailu </span><span style='color:#f29e38ff'>immediately restores their HP</span><span>. This effect can only trigger 1 time per battle.</span>",
            "Type": "Talent"
          },
          "121106": {
            "Name": "Attack",
            "Desc": ""
          },
          "121107": {
            "Name": "Saunter in the Rain",
            "Desc": "<span>After this character uses Technique, at the start of the next battle, all allies are granted Invigoration.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121101": {
            "Name": "Ambrosial Aqua",
            "Desc": "<span>If the target ally's current HP is equal to their Max HP when Invigoration ends, regenerates 8 extra Energy for this target.</span>"
          },
          "121102": {
            "Name": "Sylphic Slumber",
            "Desc": "<span>After using her Ultimate, Bailu's Outgoing Healing increases by an additional 15% for 2 turn(s).</span>"
          },
          "121103": {
            "Name": "Omniscient Opulence",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121104": {
            "Name": "Evil Excision",
            "Desc": "<span>Every healing provided by the Skill makes the recipient deal 10% more DMG for 2 turn(s). This effect can stack up to 3 time(s).</span>"
          },
          "121105": {
            "Name": "Waning Worries",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121106": {
            "Name": "Drooling Drop of Draconic Divinity",
            "Desc": "<span>Bailu can heal allies who received a killing blow 1 more time(s) in a single battle.</span>"
          }
        }
      },
      "1212": {
        "Name": "Jingliu",
        "Abilities": {
          "121201": {
            "Name": "Lucent Moonglow",
            "Desc": "<span>Deals minor Ice DMG to a single enemy target.</span>",
            "Type": "Basic ATK"
          },
          "121202": {
            "Name": "Transcendent Flash",
            "Desc": "<span>Deals Ice DMG to a target enemy and obtains </span><span style='color:#f29e38ff'>1 stack of Syzygy</span><span>.</span>",
            "Type": "Skill"
          },
          "121203": {
            "Name": "Florephemeral Dreamflux",
            "Desc": "<span>Deals massive Ice DMG to a target enemy and deals Ice DMG to adjacent targets. Obtains </span><span style='color:#f29e38ff'>1 stack of Syzygy</span><span>.</span>",
            "Type": "Ultimate"
          },
          "121204": {
            "Name": "Crescent Transmigration",
            "Desc": "<span>When possessing </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>2</span></span><span> stacks of Syzygy, Jingliu enters the Spectral Transmigration state with her </span><span style='color:#f29e38ff'>Action Advanced by <span style='whiteSpace: \"nowrap\"'>100%</span></span><span>, her CRIT Rate increased, and her </span><span style='color:#f29e38ff'>Skill becoming Enhanced</span><span>. Using an attack in this state consumes HP from all other allies and </span><span style='color:#f29e38ff'>increases Jingliu's ATK</span><span> according to the total HP consumed. When Syzygy stacks become 0, exits the Spectral Transmigration state.</span>",
            "Type": "Talent"
          },
          "121206": {
            "Name": "Attack",
            "Desc": ""
          },
          "121207": {
            "Name": "Shine of Truth",
            "Desc": "<span>Creates a Special Dimension around the character. Enemies within this dimension will become </span><span style='color:#f29e38ff'>Frozen</span><span>. After entering combat with enemies in the dimension, this character regenerates Energy and obtains 1 stack of Syzygy with a high chance to </span><span style='color:#f29e38ff'>Freeze</span><span> enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121201": {
            "Name": "Moon Crashes Tianguan Gate",
            "Desc": "<span>When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK.</span>"
          },
          "121202": {
            "Name": "Crescent Shadows Qixing Dipper",
            "Desc": "<span>After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.</span>"
          },
          "121203": {
            "Name": "Halfmoon Gapes Mercurial Haze",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121204": {
            "Name": "Lunarlance Shines Skyward Dome",
            "Desc": "<span>During the Spectral Transmigration state, the ATK gained from consuming allies' HP is additionally increased by 90% of the total HP consumed from the entire team. The cap for ATK gained this way also increases by 30%.</span>"
          },
          "121205": {
            "Name": "Night Shades Astral Radiance",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121206": {
            "Name": "Eclipse Hollows Corporeal Husk",
            "Desc": "<span>When Jingliu enters the Spectral Transmigration state, the Syzygy stack limit increases by 1, and Jingliu obtains 1 stack(s) of Syzygy. While she is in the Spectral Transmigration state, her CRIT DMG increases by 50%.</span>"
          }
        }
      },
      "1213": {
        "Name": "Imbibitor Lunae",
        "Abilities": {
          "121301": {
            "Name": "Beneficent Lotus",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121302": {
            "Name": "Dracore Libre",
            "Desc": "<span>Enhances the Basic ATK Beneficent Lotus to </span><span style='color:#f29e38ff'>Transcendence</span><span>, </span><span style='color:#f29e38ff'>Divine Spear</span><span>, or </span><span style='color:#f29e38ff'>Fulgurant Leap</span><span>.</span>",
            "Type": "Skill"
          },
          "121303": {
            "Name": "Azure's Aqua Ablutes All",
            "Desc": "<span>Deals massive Imaginary DMG to a single enemy, deals Imaginary DMG to adjacent targets, and gains 2 Squama Sacrosancta, which can </span><span style='color:#f29e38ff'>offset</span><span> Dan Heng • Imbibitor Lunae's </span><span style='color:#f29e38ff'>consumption of skill points</span><span>. Consuming Squama Sacrosancta is considered equivalent to consuming skill points.</span>",
            "Type": "Ultimate"
          },
          "121304": {
            "Name": "Righteous Heart",
            "Desc": "<span>Increases DMG for every hit dealt. This effect is stackable and lasts until the end of this character's turn.</span>",
            "Type": "Talent"
          },
          "121306": {
            "Name": "Attack",
            "Desc": ""
          },
          "121307": {
            "Name": "Heaven-Quelling Prismadrakon",
            "Desc": "<span>Enters the Leaping Dragon state. Attacking will cause this character to move forward rapidly for a set distance and attack all enemies touched. After entering combat via attacking enemies, deals Imaginary DMG to all enemies, and gains 1 Squama Sacrosancta.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121301": {
            "Name": "Tethered to Sky",
            "Desc": "<span>Increases the stackable Righteous Heart count by 4, and gains 1 extra stack of Righteous Heart for each hit during an attack.</span>"
          },
          "121302": {
            "Name": "Imperium On Cloud Nine",
            "Desc": "<span>After using his Ultimate, Dan Heng • Imbibitor Lunae's action is Advanced Forward by 100% and gains 1 extra Squama Sacrosancta.</span>"
          },
          "121303": {
            "Name": "Clothed in Clouds",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121304": {
            "Name": "Zephyr's Bliss",
            "Desc": "<span>The buff effect granted by Outroar lasts until the end of this character's next turn.</span>"
          },
          "121305": {
            "Name": "Fall is the Pride",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121306": {
            "Name": "Reign, Returned",
            "Desc": "<span>After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next Fulgurant Leap attack increases by 20%. This effect can stack up to 3 time(s).</span>"
          }
        }
      },
      "1214": {
        "Name": "Xueyi",
        "Abilities": {
          "121401": {
            "Name": "Mara-Sunder Awl",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121402": {
            "Name": "Iniquity Obliteration",
            "Desc": "<span>Deals Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.</span>",
            "Type": "Skill"
          },
          "121403": {
            "Name": "Divine Castigation",
            "Desc": "<span>Deals massive Quantum DMG to a single enemy. This attack </span><span style='color:#f29e38ff'>ignores Weakness Types</span><span> and reduces the target's Toughness. The more Toughness is reduced, the higher the DMG will be dealt.</span>",
            "Type": "Ultimate"
          },
          "121404": {
            "Name": "Karmic Perpetuation",
            "Desc": "<span>When Xueyi or her allies reduce enemy Toughness with attacks, she gains stacks of Karma. When Karma reaches the max number of stacks, </span><span style='color:#f29e38ff'>immediately launches a <u>follow-up attack</u></span><span>, dealing minor Quantum DMG to a single enemy target, bouncing for 3 times and consuming all Karma.</span>",
            "Type": "Talent"
          },
          "121406": {
            "Name": "Attack",
            "Desc": ""
          },
          "121407": {
            "Name": "Summary Execution",
            "Desc": "<span>Attacks the enemy. After entering battle, deals minor Quantum DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121401": {
            "Name": "Dvesha, Inhibited",
            "Desc": "<span>Increases the DMG dealt by the Talent's follow-up attack by 40%.</span>"
          },
          "121402": {
            "Name": "Klesha, Breached",
            "Desc": "<span>Talent's follow-up attack reduces enemy Toughness regardless of Weakness types. At the same time, restores Xueyi's HP by an amount equal to 5% of her Max HP. When breaking Weakness, triggers the Quantum Break Effect.</span>"
          },
          "121403": {
            "Name": "Duḥkha, Ceased",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121404": {
            "Name": "Karma, Severed",
            "Desc": "<span>When using Ultimate, increases Break Effect by 40% for 2 turn(s).</span>"
          },
          "121405": {
            "Name": "Deva, Enthralled",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121406": {
            "Name": "Saṃsāra, Mastered",
            "Desc": "<span>The max stack limit for Karma decreases to 6.</span>"
          }
        }
      },
      "1215": {
        "Name": "Hanya",
        "Abilities": {
          "121501": {
            "Name": "Oracle Brush",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121502": {
            "Name": "Samsara, Locked",
            "Desc": "<span>Deals Physical DMG to a single enemy and applies Burden to them. For every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies </span><span style='color:#f29e38ff'>recover 1 Skill Point</span><span>.</span>",
            "Type": "Skill"
          },
          "121503": {
            "Name": "Ten-Lords' Decree, All Shall Obey",
            "Desc": "<span>Increases an ally's </span><span style='color:#f29e38ff'>SPD and ATK</span><span>.</span>",
            "Type": "Ultimate"
          },
          "121504": {
            "Name": "Sanction",
            "Desc": "<span>Ally deals more DMG when attacking enemies inflicted with Burden.</span>",
            "Type": "Talent"
          },
          "121506": {
            "Name": "Attack",
            "Desc": ""
          },
          "121507": {
            "Name": "Netherworld Judgment",
            "Desc": "<span>Attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121501": {
            "Name": "One Heart",
            "Desc": "<span>When an ally with Hanya's Ultimate's effect defeats an enemy, Hanya's action is Advanced Forward by 15%. This effect can only be triggered 1 time(s) per turn.</span>"
          },
          "121502": {
            "Name": "Two Views",
            "Desc": "<span>After using the Skill, this character's SPD increases by 20% for 1 turn(s).</span>"
          },
          "121503": {
            "Name": "Three Temptations",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121504": {
            "Name": "Four Truths",
            "Desc": "<span>The Ultimate's duration is additionally extended for 1 turn(s).</span>"
          },
          "121505": {
            "Name": "Five Skandhas",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121506": {
            "Name": "Six Reverences",
            "Desc": "<span>Increase the DMG Boost effect of the Talent by an additional 10%.</span>"
          }
        }
      },
      "1217": {
        "Name": "Huohuo",
        "Abilities": {
          "121701": {
            "Name": "Banner: Stormcaller",
            "Desc": "<span>Deals minor Wind DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121702": {
            "Name": "Talisman: Protection",
            "Desc": "<span>Dispels 1 <u>debuff</u> from an ally and </span><span style='color:#f29e38ff'>restore HP</span><span> to that ally and their adjacent allies.</span>",
            "Type": "Skill"
          },
          "121703": {
            "Name": "Tail: Spiritual Domination",
            "Desc": "<span></span><span style='color:#f29e38ff'>Regenerates Energy</span><span> for all allies (excluding this character) and </span><span style='color:#f29e38ff'>increases their ATK</span><span>.</span>",
            "Type": "Ultimate"
          },
          "121704": {
            "Name": "Possession: Ethereal Metaflow",
            "Desc": "<span>Huohuo gains Divine Provision after using her Skill. If Huohuo possesses Divine Provision when an ally's turn starts or when an ally uses Ultimate, </span><span style='color:#f29e38ff'>restores the ally's HP</span><span>. At the same time, </span><span style='color:#f29e38ff'>every ally</span><span> with low HP </span><span style='color:#f29e38ff'>receives healing once</span><span>. When Divine Provision is triggered to heal an ally, </span><span style='color:#f29e38ff'>dispel 1 <u>debuff</u> from that ally</span><span>.</span>",
            "Type": "Talent"
          },
          "121706": {
            "Name": "Attack",
            "Desc": ""
          },
          "121707": {
            "Name": "Fiend: Impeachment of Evil",
            "Desc": "<span>Causes surrounding enemies to become Horror-Struck. After entering battle with enemies afflicted with Horror-Struck, there is a high chance of </span><span style='color:#f29e38ff'>reducing the ATK</span><span> of the enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121701": {
            "Name": "Anchored to Vessel, Specters Nestled",
            "Desc": "<span>The duration of Divine Provision produced by the Talent is extended by 1 turn(s). When Huohuo possesses Divine Provision, all allies' SPD increases by 12%.</span>"
          },
          "121702": {
            "Name": "Sealed in Tail, Wraith Subdued",
            "Desc": "<span>If Huohuo possesses Divine Provision when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to 50% of their Max HP. This reduces the duration of Divine Provision by 1 turn. This effect can only be triggered 2 time(s) per battle.</span>"
          },
          "121703": {
            "Name": "Cursed by Fate, Moths to Flame",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121704": {
            "Name": "Tied in Life, Bound to Strife",
            "Desc": "<span>When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is 80%.</span>"
          },
          "121705": {
            "Name": "Mandated by Edict, Evils Evicted",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121706": {
            "Name": "Woven Together, Cohere Forever",
            "Desc": "<span>When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turn(s).</span>"
          }
        }
      },
      "1218": {
        "Name": "Jiaoqiu",
        "Abilities": {
          "121801": {
            "Name": "Heart Afire",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "121802": {
            "Name": "Scorch Onslaught",
            "Desc": "<span>Deals Fire DMG to a single enemy and minor Fire DMG to adjacent targets, with a high chance to inflict 1 stack of Ashen Roast on the primary target.</span>",
            "Type": "Skill"
          },
          "121803": {
            "Name": "Pyrograph Arcanum",
            "Desc": "<span>Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG to all enemies. While inside the Zone, enemy targets </span><span style='color:#f29e38ff'>receive increased Ultimate DMG</span><span>, with a chance of being inflicted with 1 stack of Ashen Roast when taking action.</span>",
            "Type": "Ultimate"
          },
          "121804": {
            "Name": "Quartet Finesse, Octave Finery",
            "Desc": "<span>After attacking, there is a high chance to inflict 1 stack of Ashen Roast on the target, causing the enemy to take increased DMG and also be considered as Burned at the same time.</span>",
            "Type": "Talent"
          },
          "121806": {
            "Name": "Attack",
            "Desc": ""
          },
          "121807": {
            "Name": "Fiery Queller",
            "Desc": "<span>Creates a Special Dimension. After entering combat with enemies in this dimension, deals minor Fire DMG to all enemies, with a high chance of applying 1 \"Ashen Roast\" stack.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "121801": {
            "Name": "Pentapathic Transference",
            "Desc": "<span>Allies deal 40% increased DMG to enemy targets afflicted with Ashen Roast. Whenever inflicting Ashen Roast on an enemy target via triggering the Talent's effect, additionally increases the number of \"Ashen Roast\" stacks applied this time by 1.</span>"
          },
          "121802": {
            "Name": "From Savor Comes Suffer",
            "Desc": "<span>When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300%.</span>"
          },
          "121803": {
            "Name": "Flavored Euphony Reigns Supreme",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "121804": {
            "Name": "Leisure In, Luster Out",
            "Desc": "<span>When the Zone exists, reduces enemy target's ATK by 15%.</span>"
          },
          "121805": {
            "Name": "Duel in Dawn, Dash in Dusk",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "121806": {
            "Name": "Nonamorphic Pyrobind",
            "Desc": "<span>When an enemy target gets defeated, their accumulated \"Ashen Roast\" stacks will transfer to the enemy with the lowest number of \"Ashen Roast\" stacks on the battlefield. The maximum stack limit of Ashen Roast increases to 9, and each \"Ashen Roast\" stack reduces the target's All-Type RES by 3%.</span>"
          }
        }
      },
      "1220": {
        "Name": "Feixiao",
        "Abilities": {
          "122001": {
            "Name": "Boltsunder",
            "Desc": "<span>Deals minor Wind DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "122002": {
            "Name": "Waraxe",
            "Desc": "<span>Deals Wind DMG to an enemy, and additionally launches Talent's <u>follow-up attack</u> 1 time.</span>",
            "Type": "Skill"
          },
          "122003": {
            "Name": "Terrasplit",
            "Desc": "<span>During the Ultimate, can </span><span style='color:#f29e38ff'>ignore Weakness Type</span><span> to reduce enemy Toughness. When the target is not Weakness Broken, Feixiao's </span><span style='color:#f29e38ff'>Weakness Break Efficiency increases</span><span>.<br>Launches \"Boltsunder Blitz\" or \"Waraxe Skyward\" on a single enemy </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>6</span></span><span> time(s). Deals Wind DMG at the end.</span>",
            "Type": "Ultimate"
          },
          "122004": {
            "Name": "Thunderhunt",
            "Desc": "<span>Can activate Ultimate when \"Flying Aureus\" reaches </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>6</span></span><span> points, accumulating up to </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>12</span></span><span> points. For every </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>2</span></span><span> attacks by ally targets, Feixiao gains </span><span style='color:#f29e38ff'>\"Flying Aureus\"</span><span>.<br>After teammates attack, Feixiao launches </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> against the primary target, dealing Wind DMG. This effect can only trigger once per turn. When using this attack, increases </span><span style='color:#f29e38ff'>DMG dealt by this unit</span><span>.</span>",
            "Type": "Talent"
          },
          "122006": {
            "Name": "Attack",
            "Desc": ""
          },
          "122007": {
            "Name": "Stormborn",
            "Desc": "<span>Enters the \"Onrush\" state. Continuously pulls in enemies and movement speed increases. Gains \"Flying Aureus\" after entering battle.<br>While in \"Onrush,\" can actively attack all pulled enemies. At the start of every wave, deals Wind DMG to all enemies. This DMG is guaranteed to CRIT. </span><span style='color:#f29e38ff'>The more enemies are pulled in, the higher the DMG multiplier becomes</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "122001": {
            "Name": "Skyward I Quell",
            "Desc": "<span>After launching \"Boltsunder Blitz\" or \"Waraxe Skyward,\" additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to 10% of the original DMG, stacking up to 5 time(s) and lasting until the end of the Ultimate action.</span>"
          },
          "122002": {
            "Name": "Moonward I Wish",
            "Desc": "<span>In the Talent's effect, for every 1 instance of follow-up attack launched by ally targets, Feixiao gains 1 point of \"Flying Aureus.\" This effect can trigger up to 6 time(s) per turn.</span>"
          },
          "122003": {
            "Name": "Starward I Bode",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "122004": {
            "Name": "Stormward I Hear",
            "Desc": "<span>The follow-up attack from Talent has its Toughness Reduction increased by 100%, and when it launches, increases this unit's SPD by 8%, lasting for 2 turn(s).</span>"
          },
          "122005": {
            "Name": "Heavenward I Leap",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "122006": {
            "Name": "Homeward I Near",
            "Desc": "<span>Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by 20%. Talent's follow-up attack DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by 140%.</span>"
          }
        }
      },
      "1221": {
        "Name": "Yunli",
        "Abilities": {
          "122101": {
            "Name": "Galespin Summersault",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "122102": {
            "Name": "Bladeborne Quake",
            "Desc": "<span>Restores this unit's HP and deals minor Physical DMG to a single enemy and adjacent targets.</span>",
            "Type": "Skill"
          },
          "122103": {
            "Name": "Earthbind, Etherbreak",
            "Desc": "<span>Enters \"Parry\" and taunts all enemies. When attacked during this period, triggers </span><span style='color:#f29e38ff'>powerful <u>Counter</u></span><span> and </span><span style='color:#f29e38ff'>deals Physical DMG</span><span> to the attacker and adjacent targets. Then, deals minor Physical DMG to a single enemy that bounces 6 times. If no Counter is triggered while Parry is active, deals Physical DMG to a random enemy target and adjacent targets when Parry ends.</span>",
            "Type": "Ultimate"
          },
          "122104": {
            "Name": "Flashforge",
            "Desc": "<span>When Yunli gets attacked by an enemy target, additionally regenerates Energy and immediately launches a <u>Counter</u> against the attacker and adjacent targets.</span>",
            "Type": "Talent"
          },
          "122106": {
            "Name": "Attack",
            "Desc": ""
          },
          "122107": {
            "Name": "Posterior Precedence",
            "Desc": "<span>This unit gains the Ward effect, lasting for <span style='whiteSpace: \"nowrap\"'>20</span> seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts \"Intuit: Cull\" on a random enemy.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "122101": {
            "Name": "Weathered Blade Does Not Sully",
            "Desc": "<span>Increases DMG dealt by \"Intuit: Slash\" and \"Intuit: Cull\" by 20%. Increases the number of additional DMG instances for \"Intuit: Cull\" by 3.</span>"
          },
          "122102": {
            "Name": "First Luster Breaks Dawn",
            "Desc": "<span>When dealing DMG via Counter, ignores 20% of the target's DEF.</span>"
          },
          "122103": {
            "Name": "Mastlength Twirls Mountweight",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "122104": {
            "Name": "Artisan's Ironsong",
            "Desc": "<span>After launching \"Intuit: Slash\" or \"Intuit: Cull,\" increases this unit's Effect RES by 50%, lasting for 1 turn(s).</span>"
          },
          "122105": {
            "Name": "Blade of Old Outlasts All",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "122106": {
            "Name": "Walk in Blade, Talk in Zither",
            "Desc": "<span>While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger \"Intuit: Cull\" and remove the \"Parry\" effect. When dealing DMG via \"Intuit: Slash\" or \"Intuit: Cull,\" increases CRIT Rate by 15% and Physical RES PEN by 20%.</span>"
          }
        }
      },
      "1222": {
        "Name": "Lingsha",
        "Abilities": {
          "122201": {
            "Name": "Votive Incense",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "122202": {
            "Name": "Smoke and Splendor",
            "Desc": "<span>Deals minor Fire DMG to all enemies and, at the same time, </span><span style='color:#f29e38ff'>restores HP</span><span> for all allies. Fuyuan's <u>action advances</u>.</span>",
            "Type": "Skill"
          },
          "122203": {
            "Name": "Dripping Mistscape",
            "Desc": "<span>Increases </span><span style='color:#f29e38ff'>Break DMG taken</span><span> by all enemies, deals Fire DMG to all enemies, and at the same time, </span><span style='color:#f29e38ff'>restores HP</span><span> for all allies. Fuyuan's <u>action advances</u>.</span>",
            "Type": "Ultimate"
          },
          "122204": {
            "Name": "Mistdance Manifest",
            "Desc": "<span>Using Skill summons Fuyuan: When taking action, launches </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> and deals minor Fire DMG to all enemies. Additionally deals minor Fire DMG to a single random enemy, prioritizing targets with both Toughness greater than 0 and Fire Weakness. Dispels 1 <u>debuff</u> from all allies, and </span><span style='color:#f29e38ff'>restores HP</span><span>.<br>Using Skill repeatedly will increase Fuyuan's action count.</span>",
            "Type": "Talent"
          },
          "122206": {
            "Name": "Attack",
            "Desc": ""
          },
          "122207": {
            "Name": "Wisps of Aurora",
            "Desc": "<span>After using Technique, immediately summons Fuyuan at the start of the next battle and increases </span><span style='color:#f29e38ff'>Break DMG taken</span><span> by all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "122201": {
            "Name": "Bloom on Vileward Bouquet",
            "Desc": "<span>Lingsha's Weakness Break Efficiency increases by 50%. When an enemy unit's Weakness is Broken, reduces their DEF by 20%.</span>"
          },
          "122202": {
            "Name": "Leisure in Carmine Smokeveil",
            "Desc": "<span>When using Ultimate, increases all allies' Break Effect by 40%, lasting for 3 turn(s).</span>"
          },
          "122203": {
            "Name": "Shine of Floral Wick",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "122204": {
            "Name": "Redolence from Canopied Banquet",
            "Desc": "<span>When Fuyuan takes action, restores HP equal to 40% of Lingsha's ATK for the ally whose current HP is the lowest.</span>"
          },
          "122205": {
            "Name": "Poise Atop Twists and Turns",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "122206": {
            "Name": "Arcadia Under Deep Seclusion",
            "Desc": "<span>While Fuyuan is on the field, reduces all enemies' All-Type RES by 20%. When Fuyuan attacks, additionally deals 4 instance(s) of DMG, with each instance dealing both Fire DMG equal to 50% of Lingsha's ATK and a Toughness Reduction of 5 to a single random enemy. This prioritizes targets with both Toughness greater than 0 and Fire Weakness.</span>"
          }
        }
      },
      "1223": {
        "Name": "Moze",
        "Abilities": {
          "122301": {
            "Name": "Hurlthorn",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "122302": {
            "Name": "Fleetwinged Raid",
            "Desc": "<span></span><span style='color:#f29e38ff'>Marks a single enemy as \"Prey\"</span><span> and deals Lightning DMG to it. Gains </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>9</span></span><span> points of Charge.</span>",
            "Type": "Skill"
          },
          "122303": {
            "Name": "<unbreak>Dash In,</unbreak> <unbreak>Gash Out</unbreak>",
            "Desc": "<span>Deals Lightning DMG to a single enemy, and launches Talent's </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span>.</span>",
            "Type": "Ultimate"
          },
          "122304": {
            "Name": "Cascading Featherblade",
            "Desc": "<span>When \"Prey\" exists on the field, Moze will enter the </span><span style='color:#f29e38ff'><u>Departed</u></span><span> state.<br>After allies attack \"Prey,\" Moze deals Lightning </span><span style='color:#f29e38ff'><u>Additional DMG</u></span><span> and consumes 1 Charge point. For every </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>3</span></span><span> point(s) of Charge consumed, Moze launches </span><span style='color:#f29e38ff'><u> follow-up attack</u></span><span> on \"Prey,\" dealing Lightning DMG. When Charge is 0, dispels the target's \"Prey\" state.</span>",
            "Type": "Talent"
          },
          "122306": {
            "Name": "Attack",
            "Desc": ""
          },
          "122307": {
            "Name": "Bated Wings",
            "Desc": "<span>Enters the Stealth state. Attacking enemies to enter combat while in Stealth increases DMG.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "122301": {
            "Name": "Oathkeeper",
            "Desc": "<span>After entering battle, Moze regenerates 20 Energy. Each time the Additional DMG from his Talent is triggered, Moze regenerates 2 Energy.</span>"
          },
          "122302": {
            "Name": "Wrathbearer",
            "Desc": "<span>When all allies deal DMG to the enemy target marked as \"Prey,\" increases CRIT DMG by 40%.</span>"
          },
          "122303": {
            "Name": "Deathchaser",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "122304": {
            "Name": "Heathprowler",
            "Desc": "<span>When using Ultimate, increases the DMG dealt by Moze by 30%, lasting for 2 turn(s).</span>"
          },
          "122305": {
            "Name": "Truthbender",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "122306": {
            "Name": "Faithbinder",
            "Desc": "<span>Increases the DMG multiplier of the Talent's follow-up attack by 25%.</span>"
          }
        }
      },
      "1224": {
        "Name": "March 7th",
        "Abilities": {
          "122401": {
            "Name": "My Sword Zaps Demons",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy and gains </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>1</span></span><span> point(s) of Charge.</span>",
            "Type": "Basic ATK"
          },
          "122402": {
            "Name": "Master, It's Tea Time!",
            "Desc": "<span>Makes a single ally become Shifu. When using Basic ATK or dealing Enhanced Basic ATK's DMG, triggers the corresponding effect based on </span><span style='color:#f29e38ff'>the Shifu's Path</span><span>:<br>Erudition, Destruction, The Hunt: Deals </span><span style='color:#f29e38ff'><u>Additional DMG</u></span><span> based on Shifu's Type.<br>Harmony, Nihility, Preservation, Abundance: </span><span style='color:#f29e38ff'>Toughness Reduction</span><span> increases.</span>",
            "Type": "Skill"
          },
          "122403": {
            "Name": "March 7th, the Apex Heroine",
            "Desc": "<span>Deals Imaginary DMG to a single enemy and </span><span style='color:#f29e38ff'>increases</span><span> the Hits Per Action and DMG chance of </span><span style='color:#f29e38ff'>the next Enhanced Basic ATK</span><span>.</span>",
            "Type": "Ultimate"
          },
          "122404": {
            "Name": "Master, I've Ascended!",
            "Desc": "<span>After </span><span style='color:#f29e38ff'>Shifu uses an attack or Ultimate</span><span>, March 7th gains Charge. When reaching </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>7</span></span><span> points of Charge, March 7th immediately takes action and increases the DMG she deals. </span><span style='color:#f29e38ff'>Basic ATK gets Enhanced</span><span>.</span>",
            "Type": "Talent"
          },
          "122406": {
            "Name": "Attack",
            "Desc": ""
          },
          "122407": {
            "Name": "Feast in One Go",
            "Desc": "<span>Whenever an ally uses Technique, March 7th gains Charge upon entering the next battle. Using Technique regenerates Energy upon entering the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "122401": {
            "Name": "My Sword Stirs Starlight",
            "Desc": "<span>When Shifu is on the field, increases March 7th's SPD by 10%.</span>"
          },
          "122402": {
            "Name": "Blade Dances on Waves' Fight",
            "Desc": "<span>After Shifu uses Basic ATK or Skill to attack an enemy target, March 7th immediately launches a follow-up attack and deals Imaginary DMG equal to 60% of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on Shifu's Path and then gains 1 point(s) of Charge. If there is no primary target available to attack, then attacks a single random enemy instead. This effect can only trigger once per turn.</span>"
          },
          "122403": {
            "Name": "Sharp Wit in Martial Might",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "122404": {
            "Name": "Being Fabulous Never Frights",
            "Desc": "<span>At the start of the turn, regenerates 5 Energy.</span>"
          },
          "122405": {
            "Name": "Sword Delights, Sugar Blights",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "122406": {
            "Name": "Me, the Best Girl in Sight",
            "Desc": "<span>After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50%.</span>"
          }
        }
      },
      "1301": {
        "Name": "Gallagher",
        "Abilities": {
          "130101": {
            "Name": "Corkage Fee",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130102": {
            "Name": "Special Brew",
            "Desc": "<span>Immediately restores an ally's HP.</span>",
            "Type": "Skill"
          },
          "130103": {
            "Name": "Champagne Etiquette",
            "Desc": "<span></span><span style='color:#f29e38ff'>Inflicts Besotted</span><span> on all enemies and deals Fire DMG to them at the same time. Enhances the next Basic ATK to Nectar Blitz.</span>",
            "Type": "Ultimate"
          },
          "130104": {
            "Name": "Tipsy Tussle",
            "Desc": "<span>The Besotted state </span><span style='color:#f29e38ff'>makes targets receive more Break DMG</span><span>. Every time the target gets attacked by an ally, </span><span style='color:#f29e38ff'>the attacker's HP is restored</span><span>.</span>",
            "Type": "Talent"
          },
          "130106": {
            "Name": "Attack",
            "Desc": ""
          },
          "130107": {
            "Name": "Artisan Elixir",
            "Desc": "<span>Attacks the enemy. After entering battle, </span><span style='color:#f29e38ff'>inflicts Besotted</span><span> to all enemies and deals minor Fire DMG to all enemies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130101": {
            "Name": "Salty Dog",
            "Desc": "<span>When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%.</span>"
          },
          "130102": {
            "Name": "Lion's Tail",
            "Desc": "<span>When using the Skill, removes 1 debuff(s) from the target ally. At the same time, increases their Effect RES by 30%, lasting for 2 turn(s).</span>"
          },
          "130103": {
            "Name": "Corpse Reviver",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130104": {
            "Name": "Last Word",
            "Desc": "<span>Extends the duration of the Besotted state inflicted by Gallagher's Ultimate by 1 turn(s).</span>"
          },
          "130105": {
            "Name": "Death in the Afternoon",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130106": {
            "Name": "Blood and Sand",
            "Desc": "<span>Increases Gallagher's Break Effect by 20% and Weakness Break Efficiency by 20%.</span>"
          }
        }
      },
      "1302": {
        "Name": "Argenti",
        "Abilities": {
          "130201": {
            "Name": "Fleeting Fragrance",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130202": {
            "Name": "Justice, Hereby Blooms",
            "Desc": "<span>Deals minor Physical DMG to all enemies.</span>",
            "Type": "Skill"
          },
          "130203": {
            "Name": "For In This Garden, Supreme Beauty Bestows",
            "Desc": "<span>Consumes </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>90</span></span><span> Energy and deals Physical DMG to all enemies.</span>",
            "Type": "Ultimate"
          },
          "130204": {
            "Name": "Sublime Object",
            "Desc": "<span>When Argenti uses his Basic ATK, Skill, or Ultimate, he </span><span style='color:#f29e38ff'>regenerates Energy</span><span> and increases his </span><span style='color:#f29e38ff'>CRIT Rate</span><span> for every enemy target hit.</span>",
            "Type": "Talent"
          },
          "130206": {
            "Name": "Attack",
            "Desc": ""
          },
          "130207": {
            "Name": "Manifesto of Purest Virtue",
            "Desc": "<span>Inflicts Daze on all enemies within a set area. When attacking a Dazed enemy to enter combat, deals minor Physical DMG to all enemies and regenerates energy for Argenti.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130201": {
            "Name": "A Lacuna in Kingdom of Aesthetics",
            "Desc": "<span>Each stack of Apotheosis additionally increases CRIT DMG by 4%.</span>"
          },
          "130202": {
            "Name": "Agate's Humility",
            "Desc": "<span>If the number of enemies on the field equals to 3 or more when the Ultimate is used, ATK increases by 40% for 1 turn(s).</span>"
          },
          "130203": {
            "Name": "Thorny Road's Glory",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130204": {
            "Name": "Trumpet's Dedication",
            "Desc": "<span>At the start of battle, gains 2 stack(s) of Apotheosis and increases the maximum stack limit of the Talent's effect by 2.</span>"
          },
          "130205": {
            "Name": "Snow, From Somewhere in Cosmos",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130206": {
            "Name": "\"Your\" Resplendence",
            "Desc": "<span>When using Ultimate, ignores 30% of enemy targets' DEF.</span>"
          }
        }
      },
      "1303": {
        "Name": "Ruan Mei",
        "Abilities": {
          "130301": {
            "Name": "Threading Fragrance",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130302": {
            "Name": "String Sings Slow Swirls",
            "Desc": "<span>After using her Skill, Ruan Mei gains Overtone. When Ruan Mei has Overtone, increase all allies' </span><span style='color:#f29e38ff'>DMG</span><span> and </span><span style='color:#f29e38ff'>Weakness Break Efficiency</span><span>.</span>",
            "Type": "Skill"
          },
          "130303": {
            "Name": "Petals to Stream, Repose in Dream",
            "Desc": "<span>Increases </span><span style='color:#f29e38ff'>All-Type RES PEN</span><span> for all allies, and their attacks apply Thanatoplum Rebloom to enemies hit.</span>",
            "Type": "Ultimate"
          },
          "130304": {
            "Name": "Somatotypical Helix",
            "Desc": "<span>Increases </span><span style='color:#f29e38ff'>SPD</span><span> for all allies (excluding this character). Breaking an enemy target's Weakness will </span><span style='color:#f29e38ff'>additionally deal Ice Break DMG</span><span>.</span>",
            "Type": "Talent"
          },
          "130306": {
            "Name": "Attack",
            "Desc": ""
          },
          "130307": {
            "Name": "Silken Serenade",
            "Desc": "<span>The next time entering battle, automatically triggers the Skill for </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>1</span></span><span> time(s). After using the Technique, allies attacking enemies in Simulated Universe or Divergent Universe will always be regarded as attacking their Weakness to enter battle, and their Toughness is reduced </span><span style='color:#f29e38ff'>regardless of Weakness types</span><span>. For every Blessing in possession, increases Toughness Reduction and additionally deals Break DMG when breaking Weakness.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130301": {
            "Name": "Neuronic Embroidery",
            "Desc": "<span>While the Ultimate's Zone is deployed, the DMG dealt by all allies ignores 20% of the target's DEF.</span>"
          },
          "130302": {
            "Name": "Reedside Promenade",
            "Desc": "<span>With Ruan Mei on the field, all allies increase their ATK by 40% when dealing DMG to enemies with Weakness Break.</span>"
          },
          "130303": {
            "Name": "Viridescent Pirouette",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130304": {
            "Name": "Chatoyant Éclat",
            "Desc": "<span>When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by 100% for 3 turn(s).</span>"
          },
          "130305": {
            "Name": "Languid Barrette",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130306": {
            "Name": "Sash Cascade",
            "Desc": "<span>Extends the duration of the Ultimate's Zone by 1 turn(s). The Talent's Break DMG multiplier additionally increases by 200%.</span>"
          }
        }
      },
      "1304": {
        "Name": "Aventurine",
        "Abilities": {
          "130401": {
            "Name": "Straight Bet",
            "Desc": "<span>Deals minor Imaginary DMG to a single target enemy.</span>",
            "Type": "Basic ATK"
          },
          "130402": {
            "Name": "Cornerstone Deluxe",
            "Desc": "<span>Provides all allies with a Fortified Wager shield, </span><span style='color:#f29e38ff'>whose Shield effect is stackable</span><span>.</span>",
            "Type": "Skill"
          },
          "130403": {
            "Name": "Roulette Shark",
            "Desc": "<span>Gains a random amount of Blind Bet points and inflicts Unnerved on a single enemy, dealing Imaginary DMG. When an ally hits an Unnerved enemy, </span><span style='color:#f29e38ff'>the CRIT DMG dealt increases</span><span>.</span>",
            "Type": "Ultimate"
          },
          "130404": {
            "Name": "Shot Loaded Right",
            "Desc": "<span>For any single ally with Fortified Wager, their Effect RES increases, and when they get attacked, Aventurine accumulates Blind Bet. When Aventurine has Fortified Wager, he can resist <u>Crowd Control debuffs</u>. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> that deals minor Imaginary DMG to random single enemy targets, bouncing a total of 7 times.</span>",
            "Type": "Talent"
          },
          "130406": {
            "Name": "Attack",
            "Desc": ""
          },
          "130407": {
            "Name": "The Red or the Black",
            "Desc": "<span>Using the Technique randomly grants one out of the three DEF Boost effects with different buff values. After entering the next battle, increases all allies' DEF by the corresponding value.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130401": {
            "Name": "Prisoner's Dilemma",
            "Desc": "<span>Increases CRIT DMG by 20% for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).</span>"
          },
          "130402": {
            "Name": "Bounded Rationality",
            "Desc": "<span>When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turn(s).</span>"
          },
          "130403": {
            "Name": "Droprate Maxing",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130404": {
            "Name": "Unexpected Hanging Paradox",
            "Desc": "<span>When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by 3.</span>"
          },
          "130405": {
            "Name": "Ambiguity Aversion",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130406": {
            "Name": "Stag Hunt Game",
            "Desc": "<span>For every ally that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%.</span>"
          }
        }
      },
      "1305": {
        "Name": "Dr. Ratio",
        "Abilities": {
          "130501": {
            "Name": "Mind is Might",
            "Desc": "<span>Deals minor Imaginary DMG to a single target enemy.</span>",
            "Type": "Basic ATK"
          },
          "130502": {
            "Name": "Intellectual Midwifery",
            "Desc": "<span>Deals Imaginary DMG to a single enemy.</span>",
            "Type": "Skill"
          },
          "130503": {
            "Name": "Syllogistic Paradox",
            "Desc": "<span>Deals Imaginary DMG to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches 1 </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> on this target.</span>",
            "Type": "Ultimate"
          },
          "130504": {
            "Name": "Cogito, Ergo Sum",
            "Desc": "<span>When using the Skill, there is a chance of launching a </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> against the target for 1 time.</span>",
            "Type": "Talent"
          },
          "130506": {
            "Name": "Attack",
            "Desc": ""
          },
          "130507": {
            "Name": "Mold of Idolatry",
            "Desc": "<span>Creates a Special Dimension. Enemies within the dimension are Taunted. After entering battle with enemies in this dimension, there is a high chance to </span><span style='color:#f29e38ff'>reduce SPD</span><span> of enemy targets.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130501": {
            "Name": "Pride Comes Before a Fall",
            "Desc": "<span>The maximum stackable count for the Trace \"Summation\" increases by 4. When a battle begins, immediately obtains 4 stacks of Summation. Needs to unlock Summation first.</span>"
          },
          "130502": {
            "Name": "The Divine Is in the Details",
            "Desc": "<span>When his Talent's follow-up attack hits a target, for every debuff the target has, deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 time(s) during each follow-up attack.</span>"
          },
          "130503": {
            "Name": "Know Thyself",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130504": {
            "Name": "Ignorance Is Blight",
            "Desc": "<span>When triggering the Talent, additionally regenerates 15 Energy for Dr. Ratio.</span>"
          },
          "130505": {
            "Name": "Sic Itur Ad Astra",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130506": {
            "Name": "Vincit Omnia Veritas",
            "Desc": "<span>Additionally increases the triggerable count for Wiseman's Folly by 1. The DMG dealt by the Talent's follow-up attack increases by 50%.</span>"
          }
        }
      },
      "1306": {
        "Name": "Sparkle",
        "Abilities": {
          "130601": {
            "Name": "Monodrama",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130602": {
            "Name": "Dreamdiver",
            "Desc": "<span>Increases an ally's </span><span style='color:#f29e38ff'>CRIT DMG</span><span> and Advances Forward their action.</span>",
            "Type": "Skill"
          },
          "130603": {
            "Name": "The Hero with a Thousand Faces",
            "Desc": "<span>Recovers </span><span style='color:#f29e38ff'>Skill Points</span><span> for the team, and enables the DMG Boost provided by Sparkle's Talent to be additionally enhanced.</span>",
            "Type": "Ultimate"
          },
          "130604": {
            "Name": "Red Herring",
            "Desc": "<span>Increases the team's </span><span style='color:#f29e38ff'>Max Skill Points</span><span>. Whenever an ally consumes Skill Points, enables all allies to </span><span style='color:#f29e38ff'>deal more damage</span><span>.</span>",
            "Type": "Talent"
          },
          "130606": {
            "Name": "Attack",
            "Desc": ""
          },
          "130607": {
            "Name": "Unreliable Narrator",
            "Desc": "<span>Using the Technique grants all allies Misdirect. Characters with Misdirect will not be detected by enemies, and entering battle while in Misdirect recovers </span><span style='color:#f29e38ff'>Skill Points</span><span> for allies.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130601": {
            "Name": "Suspension of Disbelief",
            "Desc": "<span>The Cipher effect granted by the Ultimate lasts for 1 extra turn. All allies with Cipher have their ATK increased by 40%.</span>"
          },
          "130602": {
            "Name": "Purely Fictitious",
            "Desc": "<span>Every stack of the Talent's effect allows allies to additionally ignore 8% of the target's DEF when dealing DMG.</span>"
          },
          "130603": {
            "Name": "Pipedream",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130604": {
            "Name": "Life Is a Gamble",
            "Desc": "<span>The Ultimate recovers 1 more Skill Point. The Talent additionally increases the Max Skill Points by 1.</span>"
          },
          "130605": {
            "Name": "Parallax Truth",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130606": {
            "Name": "Narrative Polysemy",
            "Desc": "<span>The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to 30% of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all allies with Cipher. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to allies with Cipher.</span>"
          }
        }
      },
      "1307": {
        "Name": "Black Swan",
        "Abilities": {
          "130701": {
            "Name": "Percipience, Silent Dawn",
            "Desc": "<span>Deals minor Wind DMG to a single enemy and has a chance of applying <u>Arcana</u> to the target. After attacking a target that suffers </span><span style='color:#f29e38ff'>Wind Shear, Bleed, Burn, or Shock</span><span>, there is respectively a chance of </span><span style='color:#f29e38ff'>additionally applying <u>Arcana</u></span><span>.</span>",
            "Type": "Basic ATK"
          },
          "130702": {
            "Name": "Decadence, False Twilight",
            "Desc": "<span>Deals minor Wind DMG to a single enemy target and any adjacent targets, with a high chance of </span><span style='color:#f29e38ff'>inflicting <u>Arcana</u></span><span> on the targets and lowering their DEF.</span>",
            "Type": "Skill"
          },
          "130703": {
            "Name": "Bliss of Otherworld's Embrace",
            "Desc": "<span>Inflicts Epiphany on all enemies, increasing the DMG the targets take in their turn. Additionally, </span><span style='color:#f29e38ff'>having <u>Arcana</u> is regarded as having Wind Shear, Bleed, Burn, and Shock</span><span>. Furthermore, <u>Arcana</u> will not reset its stacks after causing DMG at the start of the next turn. Deals Wind DMG to all enemies.</span>",
            "Type": "Ultimate"
          },
          "130704": {
            "Name": "Loom of Fate's Caprice",
            "Desc": "<span>When an enemy target receives DoT at the start of each turn, there is a chance for it to be inflicted with <u>Arcana</u>. They receive </span><span style='color:#f29e38ff'>Wind DoT</span><span> at the start of the turn, and Black Swan triggers </span><span style='color:#f29e38ff'>additional effects</span><span> based on the number of <u>Arcana</u> stacks.</span>",
            "Type": "Talent"
          },
          "130706": {
            "Name": "Attack",
            "Desc": ""
          },
          "130707": {
            "Name": "From Façade to Vérité",
            "Desc": "<span>After this Technique is used, at the start of the next battle, there is a high chance for each enemy to be </span><span style='color:#f29e38ff'>inflicted with Arcana repeatedly until <u>Arcana</u> fails to be inflicted</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130701": {
            "Name": "Seven Pillars of Wisdom",
            "Desc": "<span>While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%.</span>"
          },
          "130702": {
            "Name": "Weep Not For Me, My Lamb",
            "Desc": "<span>When an enemy target afflicted with Arcana is defeated, there is a 100% base chance of inflicting 6 stack(s) of Arcana on adjacent targets.</span>"
          },
          "130703": {
            "Name": "As Above, So Below",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130704": {
            "Name": "In Tears We Gift",
            "Desc": "<span>While in the Epiphany state, enemy targets have their Effect RES reduced by 10% and Black Swan regenerates 8 Energy at the start of these targets' turns or when they are defeated. This Energy Regeneration effect can only trigger up to 1 time while Epiphany lasts. The trigger count is reset when Epiphany is applied again.</span>"
          },
          "130705": {
            "Name": "Linnutee Flyway",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130706": {
            "Name": "Pantheon Merciful, Masses Pitiful",
            "Desc": "<span>When an enemy target gets attacked by Black Swan's allies, Black Swan has a 65% base chance of inflicting 1 stack of Arcana on the target.<br>Every time Black Swan inflicts Arcana on an enemy target, there is a 50% fixed chance to additionally increase the number of Arcana stacked this time by 1.</span>"
          }
        }
      },
      "1308": {
        "Name": "Acheron",
        "Abilities": {
          "130801": {
            "Name": "Trilateral Wiltcross",
            "Desc": "<span>Deals minor Lightning DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130802": {
            "Name": "Octobolt Flash",
            "Desc": "<span>Gains </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>1</span></span><span> point(s) of Slashed Dream. Inflicts </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>1</span></span><span> stack(s) of Crimson Knot on a single enemy, dealing Lightning DMG to this target, as well as minor Lightning DMG to adjacent targets.</span>",
            "Type": "Skill"
          },
          "130803": {
            "Name": "Slashed Dream Cries in Red",
            "Desc": "<span>Deals 3 hits of minor Lightning DMG to a single enemy. If Crimson Knot is removed from the target, then deals minor Lightning DMG to all enemies. Finally, deals 1 hit of Lightning DMG to all enemies and removes all Crimson Knots.</span>",
            "Type": "Ultimate"
          },
          "130804": {
            "Name": "Atop Rainleaf Hangs Oneness",
            "Desc": "<span>When Slashed Dream reaches its upper limit, the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness </span><span style='color:#f29e38ff'>regardless of Weakness Types</span><span> and reduces all enemies' </span><span style='color:#f29e38ff'>All-Type RES</span><span>.<br>When any unit inflicts debuffs on an enemy target while using their ability, Acheron gains Slashed Dream and inflicts Crimson Knot on an enemy target.</span>",
            "Type": "Talent"
          },
          "130806": {
            "Name": "Attack",
            "Desc": ""
          },
          "130807": {
            "Name": "Quadrivalent Ascendance",
            "Desc": "<span>Attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG to all enemies and reducing Toughness </span><span style='color:#f29e38ff'>regardless of Weakness Types</span><span>.<br>If attacking a normal enemy, </span><span style='color:#f29e38ff'>immediately defeats them</span><span> without entering combat. When not hitting enemies, no Technique Points are consumed.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130801": {
            "Name": "Silenced Sky Spake Sooth",
            "Desc": "<span>When dealing DMG to debuffed enemies, increases the CRIT Rate by 18%.</span>"
          },
          "130802": {
            "Name": "Mute Thunder in Still Tempest",
            "Desc": "<span>The number of Nihility characters required for the Trace \"The Abyss\" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks.</span>"
          },
          "130803": {
            "Name": "Frost Bites in Death",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "130804": {
            "Name": "Shrined Fire for Mirrored Soul",
            "Desc": "<span>When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%.</span>"
          },
          "130805": {
            "Name": "Strewn Souls on Erased Earths",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130806": {
            "Name": "Apocalypse, the Emancipator",
            "Desc": "<span>Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.</span>"
          }
        }
      },
      "1309": {
        "Name": "Robin",
        "Abilities": {
          "130901": {
            "Name": "Wingflip White Noise",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "130902": {
            "Name": "Pinion's Aria",
            "Desc": "<span></span><span style='color:#f29e38ff'>Increases DMG dealt</span><span> by all allies.</span>",
            "Type": "Skill"
          },
          "130903": {
            "Name": "Vox Harmonique, Opus Cosmique",
            "Desc": "<span>Enters the Concerto state, </span><span style='color:#f29e38ff'>increases all allies' ATK</span><span>, and causes all teammates to immediately take action. After an attack, Robin deals </span><span style='color:#f29e38ff'><u>Additional Physical DMG</u></span><span>. While Concerto lasts, Robin is immune to <u>Crowd Control debuffs</u>. Before Concerto ends, Robin won't take turn or action, lasting until the end of the countdown.</span>",
            "Type": "Ultimate"
          },
          "130904": {
            "Name": "Tonal Resonance",
            "Desc": "<span>Increase all allies' </span><span style='color:#f29e38ff'>CRIT DMG</span><span>, and Robin additionally regenerates Energy after allies attack enemies.</span>",
            "Type": "Talent"
          },
          "130906": {
            "Name": "Attack",
            "Desc": ""
          },
          "130907": {
            "Name": "Overture of Inebriation",
            "Desc": "<span>Creates a Special Dimension around the character. Enemies within this dimension will not attack Robin. After entering battle while the dimension is active, Robin additionally regenerates </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>5</span></span><span> Energy at the start of each wave.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "130901": {
            "Name": "Land of Smiles",
            "Desc": "<span>While the Concerto state is active, all allies' All-Type RES PEN increases by 24%.</span>"
          },
          "130902": {
            "Name": "Afternoon Tea For Two",
            "Desc": "<span>While the Concerto state is active, all allies' SPD increases by 16%. The Talent's Energy Regeneration effect additionally increases by 1.</span>"
          },
          "130903": {
            "Name": "Inverted Tuning",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Ultimate Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130904": {
            "Name": "Raindrop Key",
            "Desc": "<span>When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by 50%.</span>"
          },
          "130905": {
            "Name": "Lonestar's Lament",
            "Desc": "<span>Basic ATK Lv. +1, up to a maximum of Lv. 10.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "130906": {
            "Name": "Moonless Midnight",
            "Desc": "<span>While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by 450%. The effect of Moonless Midnight can trigger up to 8 time(s). And the trigger count resets each time the Ultimate is used.</span>"
          }
        }
      },
      "1310": {
        "Name": "Firefly",
        "Abilities": {
          "131001": {
            "Name": "Order: Flare Propulsion",
            "Desc": "<span>Deals minor Fire DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "131002": {
            "Name": "Order: Aerial Bombardment",
            "Desc": "<span>Consumes a portion of this unit's own HP to regenerate Energy. Deals Fire DMG to a single enemy. <u>Advances</u> this unit's next Action.</span>",
            "Type": "Skill"
          },
          "131003": {
            "Name": "Fyrefly Type-IV: Complete Combustion",
            "Desc": "<span>Enters the Complete Combustion state. </span><span style='color:#f29e38ff'>Advances this unit's Action by <span style='whiteSpace: \"nowrap\"'>100%</span></span><span>. Gains </span><span style='color:#f29e38ff'>Enhanced Basic ATK</span><span> and </span><span style='color:#f29e38ff'>Enhanced Skill</span><span>. Increases this unit's </span><span style='color:#f29e38ff'>SPD, Weakness Break Efficiency, and the Break DMG received by the enemy targets</span><span>, lasting until the countdown ends.</span>",
            "Type": "Ultimate"
          },
          "131004": {
            "Name": "Chrysalid Pyronexus",
            "Desc": "<span>The lower the HP, the less DMG received. During the Complete Combustion state, the DMG Reduction effect remains at its maximum extent and Effect RES is increased. If Energy is lower than </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>50%</span></span><span> when the battle starts, regenerates Energy to </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>50%</span></span><span>. Once Energy is regenerated to its maximum, dispels all <u>debuffs</u> on this unit.</span>",
            "Type": "Talent"
          },
          "131006": {
            "Name": "Attack",
            "Desc": ""
          },
          "131007": {
            "Name": "Δ Order: Meteoric Incineration",
            "Desc": "<span>Leaps into the air and moves about freely. After a few seconds of movement, plunges and attacks all enemies within range. At the start of </span><span style='color:#f29e38ff'>each wave</span><span>, </span><span style='color:#f29e38ff'>applies a Fire Weakness</span><span> to all enemies and deals Fire DMG to them.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "131001": {
            "Name": "In Reddened Chrysalis, I Once Rest",
            "Desc": "<span>When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points.</span>"
          },
          "131002": {
            "Name": "From Shattered Sky, I Free Fall",
            "Desc": "<span>While in Complete Combustion, using the Enhanced Basic ATK or the Enhanced Skill to defeat an enemy target or to break their Weakness allows SAM to immediately gain 1 extra turn. This effect can trigger again after 1 turn(s).</span>"
          },
          "131003": {
            "Name": "Amidst Silenced Stars, I Deep Sleep",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "131004": {
            "Name": "Upon Lighted Fyrefly, I Soon Gaze",
            "Desc": "<span>While in Complete Combustion, increases SAM's Effect RES by 50%.</span>"
          },
          "131005": {
            "Name": "From Undreamt Night, I Thence Shine",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "131006": {
            "Name": "In Finalized Morrow, I Full Bloom",
            "Desc": "<span>While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break Efficiency by 50%.</span>"
          }
        }
      },
      "1312": {
        "Name": "Misha",
        "Abilities": {
          "131201": {
            "Name": "E—Excuse Me, Please!",
            "Desc": "<span>Deals minor Ice DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "131202": {
            "Name": "R—Room Service!",
            "Desc": "<span>Deals Ice DMG to an enemy and minor Ice DMG to enemies adjacent to them. In addition, increases Misha's next </span><span style='color:#f29e38ff'>Ultimate's Hits Per Action</span><span>.</span>",
            "Type": "Skill"
          },
          "131203": {
            "Name": "G—Gonna Be Late!",
            "Desc": "<span>Deals minor Ice DMG to single enemies. The attack bounces </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>3</span></span><span> times by default and up to a maximum of </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>10</span></span><span> times. Before each hit lands, there is a minor chance to </span><span style='color:#f29e38ff'>Freeze</span><span> the target.</span>",
            "Type": "Ultimate"
          },
          "131204": {
            "Name": "Horological Escapement",
            "Desc": "<span>For </span><span style='color:#f29e38ff'>every 1 Skill Point allies consume</span><span>, Misha's next Ultimate </span><span style='color:#f29e38ff'>delivers more Hits Per Action</span><span>, and Misha regenerates his Energy.</span>",
            "Type": "Talent"
          },
          "131206": {
            "Name": "Attack",
            "Desc": ""
          },
          "131207": {
            "Name": "Wait, You Are So Beautiful!",
            "Desc": "<span>Creates a Special Dimension that stops all enemies within. Upon entering battle against enemies within the dimension, Misha's </span><span style='color:#f29e38ff'>next Ultimate deals more Hits Per Action</span><span>.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "131201": {
            "Name": "Whimsicality of Fancy",
            "Desc": "<span>When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the current Ultimate by 1 hit(s), up to a maximum increase of 5 hit(s).</span>"
          },
          "131202": {
            "Name": "Yearning of Youth",
            "Desc": "<span>Before each hit of the Ultimate lands, there is a 24% base chance of reducing the target's DEF by 16% for 3 turn(s).</span>"
          },
          "131203": {
            "Name": "Vestige of Happiness",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "131204": {
            "Name": "Visage of Kinship",
            "Desc": "<span>Increases the DMG multiplier for each hit of the Ultimate by 6%.</span>"
          },
          "131205": {
            "Name": "Genesis of First Love",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "131206": {
            "Name": "Estrangement of Dream",
            "Desc": "<span>When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn. In addition, the next time the Skill is used, recovers 1 Skill Point(s) for the team.</span>"
          }
        }
      },
      "1314": {
        "Name": "Jade",
        "Abilities": {
          "131401": {
            "Name": "Lash of Riches",
            "Desc": "<span>Deals minor Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.</span>",
            "Type": "Basic ATK"
          },
          "131402": {
            "Name": "Acquisition Surety",
            "Desc": "<span>Makes a single ally become the </span><span style='color:#f29e38ff'>Debt Collector</span><span> and increases their SPD. After the </span><span style='color:#f29e38ff'>Debt Collector</span><span> attacks, deals minor <u>Additional</u> Quantum DMG to each enemy target hit and consume the Collector's own HP. When Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume her HP.</span>",
            "Type": "Skill"
          },
          "131403": {
            "Name": "Vow of the Deep",
            "Desc": "<span>Deals Quantum DMG to all enemies and this unit's </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span> DMG multiplier increases.</span>",
            "Type": "Ultimate"
          },
          "131404": {
            "Name": "Fang of Flare Flaying",
            "Desc": "<span>After Jade or the </span><span style='color:#f29e38ff'>Debt Collector</span><span> unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>8</span></span><span> points of Charge, consumes the </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>8</span></span><span> points to launch 1 instance of </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span>, dealing Quantum DMG to all enemies.<br>When Jade launches the </span><span style='color:#f29e38ff'><u>follow-up attack</u></span><span>, gains Pawned Asset and increases CRIT DMG, stacking up to </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>50</span></span><span> times.</span>",
            "Type": "Talent"
          },
          "131406": {
            "Name": "Attack",
            "Desc": ""
          },
          "131407": {
            "Name": "Visionary Predation",
            "Desc": "<span>Inflicts Blind Fealty on enemies within a set area. Attacking an enemy with Blind Fealty causes all enemies with Blind Fealty to enter combat simultaneously. Upon entering combat, deals minor Quantum DMG to all enemies and immediately gains </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>15</span></span><span> stack(s) of Pawned Asset.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "131401": {
            "Name": "Altruism? Nevertheless Tradable",
            "Desc": "<span>The follow-up attack DMG from Jade's Talent increases by 32%. After the Debt Collector character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of Charge respectively.</span>"
          },
          "131402": {
            "Name": "Morality? Herein Authenticated",
            "Desc": "<span>When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%.</span>"
          },
          "131403": {
            "Name": "Honesty? Soon Mortgaged",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "131404": {
            "Name": "Sincerity? Put Option Only",
            "Desc": "<span>When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting for 3 turn(s).</span>"
          },
          "131405": {
            "Name": "Hope? Hitherto Forfeited",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "131406": {
            "Name": "Equity? Pending Sponsorship",
            "Desc": "<span>When the Debt Collector character exists on the field, Jade's Quantum RES PEN increases by 20%, and Jade gains the Debt Collector state.</span>"
          }
        }
      },
      "1315": {
        "Name": "Boothill",
        "Abilities": {
          "131501": {
            "Name": "Skullcrush Spurs",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "131502": {
            "Name": "Sizzlin' Tango",
            "Desc": "<span>Initiates </span><span style='color:#f29e38ff'>Standoff</span><span>. After the target in the Standoff is </span><span style='color:#f29e38ff'>defeated or Weakness Broken</span><span>, Boothill receives Pocket Trickshot and dispels the Standoff. Boothill </span><span style='color:#f29e38ff'>gains Enhanced Basic ATK</span><span> and this turn does not end.</span>",
            "Type": "Skill"
          },
          "131503": {
            "Name": "Dust Devil's Sunset Rodeo",
            "Desc": "<span></span><span style='color:#f29e38ff'>Applies Physical Weakness</span><span> to a single enemy, deals massive Physical DMG to them, and delays their action.</span>",
            "Type": "Ultimate"
          },
          "131504": {
            "Name": "Five Peas in a Pod",
            "Desc": "<span>Pocket Trickshot increases the Enhanced Basic ATK's Toughness Reduction and additionally deals Physical </span><span style='color:#f29e38ff'>Break DMG</span><span> </span><span style='color:#f29e38ff'>if the target is Weakness Broken</span><span>. After winning the battle, retains Pocket Trickshot for the next battle.</span>",
            "Type": "Talent"
          },
          "131506": {
            "Name": "Attack",
            "Desc": ""
          },
          "131507": {
            "Name": "3-9× Smile",
            "Desc": "<span>After the Technique is used, </span><span style='color:#f29e38ff'>inflicts Physical Weakness</span><span> on a single enemy when casting the Skill for the first time in the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "131501": {
            "Name": "Dusty Trail's Lone Star",
            "Desc": "<span>When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores 16% of the enemy target's DEF.</span>"
          },
          "131502": {
            "Name": "Milestonemonger",
            "Desc": "<span>When in Standoff and gaining Pocket Trickshot, recovers 1 Skill Point(s) and increases Break Effect by 30%, lasting for 2 turn(s). Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn.</span>"
          },
          "131503": {
            "Name": "Marble Orchard's Guard",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "131504": {
            "Name": "Cold Cuts Chef",
            "Desc": "<span>When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by 12%. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by 12%.</span>"
          },
          "131505": {
            "Name": "Stump Speech",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "131506": {
            "Name": "Crowbar Hotel's Raccoon",
            "Desc": "<span>When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40% of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to 70% of the original DMG multiplier.</span>"
          }
        }
      },
      "1317": {
        "Name": "Rappa",
        "Abilities": {
          "131701": {
            "Name": "Ninjutsu: Rise Above Tumbles",
            "Desc": "<span>Deals minor Imaginary DMG to one designated enemy.</span>",
            "Type": "Basic ATK"
          },
          "131702": {
            "Name": "Ninja Strike: Rooted Resolute",
            "Desc": "<span>Deals Imaginary DMG to all enemies.</span>",
            "Type": "Skill"
          },
          "131703": {
            "Name": "Nindō Supreme: Aishiteru",
            "Desc": "<span>Enters the \"Sealform\" state, gains an </span><span style='color:#f29e38ff'><u>extra turn</u></span><span>, obtains 3 points of \"Chroma Ink,\" and </span><span style='color:#f29e38ff'>increases Weakness Break Efficiency and Break Effect</span><span>.<br>While in the \"Sealform\" state, </span><span style='color:#f29e38ff'>gains Enhanced Basic ATK</span><span>. After using Enhanced Basic ATK, consumes 1 point of \"Chroma Ink.\" When \"Chroma Ink\" is depleted, exit the \"Sealform\" state.</span>",
            "Type": "Ultimate"
          },
          "131704": {
            "Name": "Ninja Tech: Endurance Gauge",
            "Desc": "<span>When enemy targets' Weakness are Broken, Rappa deals Imaginary Break DMG to them that additionally Bounces </span><span style='color:#f29e38ff'><span style='whiteSpace: \"nowrap\"'>2</span></span><span> time(s). Each instance of DMG deals minor Imaginary Break DMG and </span><span style='color:#f29e38ff'>Toughness Reduction regardless of Weakness Type</span><span> to random enemy units. The Toughness Reduction effect only takes effect against enemy targets with Toughness greater than 0. The added instances of DMG will prioritize targets with Toughness greater than 0.<br>When inflicting Weakness Break, triggers the Imaginary Weakness Break effect.</span>",
            "Type": "Talent"
          },
          "131706": {
            "Name": "Attack",
            "Desc": ""
          },
          "131707": {
            "Name": "Ninja Dash: By Leaps and Bounds",
            "Desc": "<span>Enters the \"Graffiti\" state. Move forward rapidly for a set distance and attack any enemies touched. After entering combat via attacking enemies, deals </span><span style='color:#f29e38ff'>Toughness Reduction regardless of Weakness Type</span><span> to each enemy target and deals Imaginary Break DMG to them as well as their adjacent targets. At the same time, this unit regenerates Energy.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "131701": {
            "Name": "Returned Is the Revenant With No Ferry Toll",
            "Desc": "<span>When using Ultimate to enter the \"Sealform\" state, DMG dealt by Rappa ignores 15% of the targets' DEF, and Rappa regenerates 20 Energy when she leaves the \"Sealform\" state.</span>"
          },
          "131702": {
            "Name": "Free Is the Mind Enlightened by Haikus",
            "Desc": "<span>The Toughness Reduction of the first 2 hits of the Enhanced Basic ATK against the one designated enemy increases by 50%.</span>"
          },
          "131703": {
            "Name": "Many Are the Shrines That Repel No Hell",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "131704": {
            "Name": "Lost Is the Nindō Devoured by Time",
            "Desc": "<span>While in the \"Sealform\" state, increases all allies' SPD by 12%.</span>"
          },
          "131705": {
            "Name": "Steady Is The Ranger With Unerring Arrows",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "131706": {
            "Name": "Righteous Is the Wrath That Spares No Evil",
            "Desc": "<span>The Break DMG multiplier of the Talent's effect increases by 500% on the enemy target that triggered it, and the number of additional instances of DMG increases by 5.</span>"
          }
        }
      },
      "8001": {
        "Name": "Caelus (Destruction)",
        "Abilities": {
          "800101": {
            "Name": "Farewell Hit",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "800102": {
            "Name": "RIP Home Run",
            "Desc": "<span>Deals Physical DMG to a single enemy and enemies adjacent to it.</span>",
            "Type": "Skill"
          },
          "800103": {
            "Name": "Stardust Ace",
            "Desc": "<span>Uses Single Target ATK or Blast to strike with full force.</span>",
            "Type": "Ultimate"
          },
          "800104": {
            "Name": "Perfect Pickoff",
            "Desc": "<span>Every time this unit breaks an Enemy target's Weakness, ATK increases.</span>",
            "Type": "Talent"
          },
          "800106": {
            "Name": "Attack",
            "Desc": ""
          },
          "800107": {
            "Name": "Immortal Third Strike",
            "Desc": "<span>After using Technique, immediately </span><span style='color:#f29e38ff'>restores HP</span><span> for team.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800101": {
            "Name": "A Falling Star",
            "Desc": "<span>When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates 10 extra Energy. This effect can only be triggered once per attack.</span>"
          },
          "800102": {
            "Name": "An Unwilling Host",
            "Desc": "<span>Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to 5% of the Trailblazer's ATK.</span>"
          },
          "800103": {
            "Name": "A Leading Whisper",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800104": {
            "Name": "A Destructing Glance",
            "Desc": "<span>When attacking an enemy with Weakness Break, CRIT Rate is increased by 25%.</span>"
          },
          "800105": {
            "Name": "A Surviving Hope",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800106": {
            "Name": "A Trailblazing Will",
            "Desc": "<span>The Trailblazer's Talent is also triggered when they defeat an enemy.</span>"
          }
        }
      },
      "8002": {
        "Name": "Stelle (Destruction)",
        "Abilities": {
          "800201": {
            "Name": "Farewell Hit",
            "Desc": "<span>Deals minor Physical DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "800202": {
            "Name": "RIP Home Run",
            "Desc": "<span>Deals Physical DMG to a single enemy and enemies adjacent to it.</span>",
            "Type": "Skill"
          },
          "800203": {
            "Name": "Stardust Ace",
            "Desc": "<span>Uses Single Target ATK or Blast to strike with full force.</span>",
            "Type": "Ultimate"
          },
          "800204": {
            "Name": "Perfect Pickoff",
            "Desc": "<span>Every time this unit breaks an Enemy target's Weakness, ATK increases.</span>",
            "Type": "Talent"
          },
          "800206": {
            "Name": "Attack",
            "Desc": ""
          },
          "800207": {
            "Name": "Immortal Third Strike",
            "Desc": "<span>After using Technique, immediately </span><span style='color:#f29e38ff'>restores HP</span><span> for team.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800201": {
            "Name": "A Falling Star",
            "Desc": "<span>When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates 10 extra Energy. This effect can only be triggered once per attack.</span>"
          },
          "800202": {
            "Name": "An Unwilling Host",
            "Desc": "<span>Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to 5% of the Trailblazer's ATK.</span>"
          },
          "800203": {
            "Name": "A Leading Whisper",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800204": {
            "Name": "A Destructing Glance",
            "Desc": "<span>When attacking an enemy with Weakness Break, CRIT Rate is increased by 25%.</span>"
          },
          "800205": {
            "Name": "A Surviving Hope",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800206": {
            "Name": "A Trailblazing Will",
            "Desc": "<span>The Trailblazer's Talent is also triggered when they defeat an enemy.</span>"
          }
        }
      },
      "8003": {
        "Name": "Caelus (Preservation)",
        "Abilities": {
          "800301": {
            "Name": "Ice-Breaking Light",
            "Desc": "<span>Deals minor Fire DMG to a single enemy and gains Magma Will.</span>",
            "Type": "Basic ATK"
          },
          "800302": {
            "Name": "Ever-Burning Amber",
            "Desc": "<span>Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.</span>",
            "Type": "Skill"
          },
          "800303": {
            "Name": "War-Flaming Lance",
            "Desc": "<span>Deals Fire DMG to all enemies and enhances this unit's next Basic ATK.</span>",
            "Type": "Ultimate"
          },
          "800304": {
            "Name": "Treasure of the Architects",
            "Desc": "<span>When attacked, stacks \"Magma Will\". When \"Magma Will\" is at no fewer than 4 stacks, Basic ATK gets </span><span style='color:#f29e38ff'>enhanced</span><span>. After using Basic ATK, Skill, or Ultimate, provides a Shield for team.</span>",
            "Type": "Talent"
          },
          "800306": {
            "Name": "Attack",
            "Desc": ""
          },
          "800307": {
            "Name": "Call of the Guardian",
            "Desc": "<span>After using Technique, provides a Shield for this unit at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800301": {
            "Name": "Earth-Shaking Resonance",
            "Desc": "<span>When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to 25% of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to 50% of the Trailblazer's DEF.</span>"
          },
          "800302": {
            "Name": "Time-Defying Tenacity",
            "Desc": "<span>The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to 2% of the Trailblazer's DEF plus 27.</span>"
          },
          "800303": {
            "Name": "Trail-Blazing Blueprint",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800304": {
            "Name": "Nation-Building Oath",
            "Desc": "<span>At the start of the battle, immediately gains 4 stack(s) of Magma Will.</span>"
          },
          "800305": {
            "Name": "Spirit-Warming Flame",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800306": {
            "Name": "City-Forging Bulwarks",
            "Desc": "<span>After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by 10%. Stacks up to 3 time(s).</span>"
          }
        }
      },
      "8004": {
        "Name": "Stelle (Preservation)",
        "Abilities": {
          "800401": {
            "Name": "Ice-Breaking Light",
            "Desc": "<span>Deals minor Fire DMG to a single enemy and gains Magma Will.</span>",
            "Type": "Basic ATK"
          },
          "800402": {
            "Name": "Ever-Burning Amber",
            "Desc": "<span>Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.</span>",
            "Type": "Skill"
          },
          "800403": {
            "Name": "War-Flaming Lance",
            "Desc": "<span>Deals Fire DMG to all enemies and enhances this unit's next Basic ATK.</span>",
            "Type": "Ultimate"
          },
          "800404": {
            "Name": "Treasure of the Architects",
            "Desc": "<span>When attacked, stacks \"Magma Will\". When \"Magma Will\" is at no fewer than 4 stacks, Basic ATK gets </span><span style='color:#f29e38ff'>enhanced</span><span>. After using Basic ATK, Skill, or Ultimate, provides a Shield for team.</span>",
            "Type": "Talent"
          },
          "800406": {
            "Name": "Attack",
            "Desc": ""
          },
          "800407": {
            "Name": "Call of the Guardian",
            "Desc": "<span>After using Technique, provides a Shield for this unit at the start of the next battle.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800401": {
            "Name": "Earth-Shaking Resonance",
            "Desc": "<span>When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to 25% of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to 50% of the Trailblazer's DEF.</span>"
          },
          "800402": {
            "Name": "Time-Defying Tenacity",
            "Desc": "<span>The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to 2% of the Trailblazer's DEF plus 27.</span>"
          },
          "800403": {
            "Name": "Trail-Blazing Blueprint",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800404": {
            "Name": "Nation-Building Oath",
            "Desc": "<span>At the start of the battle, immediately gains 4 stack(s) of Magma Will.</span>"
          },
          "800405": {
            "Name": "Spirit-Warming Flame",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800406": {
            "Name": "City-Forging Bulwarks",
            "Desc": "<span>After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by 10%. Stacks up to 3 time(s).</span>"
          }
        }
      },
      "8005": {
        "Name": "Caelus (Harmony)",
        "Abilities": {
          "800501": {
            "Name": "Swing Dance Etiquette",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "800502": {
            "Name": "Halftime to Make It Rain",
            "Desc": "<span>Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.</span>",
            "Type": "Skill"
          },
          "800503": {
            "Name": "All-Out Footlight Parade",
            "Desc": "<span>Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their </span><span style='color:#f29e38ff'>Break Effect increased</span><span> and additionally deal </span><span style='color:#f29e38ff'><u>Super Break DMG</u></span><span> 1 time when they attack enemy targets that are <u>Weakness Broken</u>.</span>",
            "Type": "Ultimate"
          },
          "800504": {
            "Name": "Full-on Aerial Dance",
            "Desc": "<span>The Trailblazer regenerates Energy when an enemy target's Weakness is Broken.</span>",
            "Type": "Talent"
          },
          "800506": {
            "Name": "Attack",
            "Desc": ""
          },
          "800507": {
            "Name": "Now! I'm the Band!",
            "Desc": "<span>At the start of the next battle, increases all allies' Break Effect.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800501": {
            "Name": "Best Seat in the House",
            "Desc": "<span>After using Skill for the first time, immediately recovers 1 Skill Point(s).</span>"
          },
          "800502": {
            "Name": "Jailbreaking Rainbowwalk",
            "Desc": "<span>When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s).</span>"
          },
          "800503": {
            "Name": "Sanatorium for Rest Notes",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800504": {
            "Name": "Dove in Tophat",
            "Desc": "<span>While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect.</span>"
          },
          "800505": {
            "Name": "Poem Favors Rhythms of Old",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800506": {
            "Name": "Tomorrow, Rest in Spotlight",
            "Desc": "<span>The number of additional DMG applications by the Skill increases by 2.</span>"
          }
        }
      },
      "8006": {
        "Name": "Stelle (Harmony)",
        "Abilities": {
          "800601": {
            "Name": "Swing Dance Etiquette",
            "Desc": "<span>Deals minor Imaginary DMG to a single enemy.</span>",
            "Type": "Basic ATK"
          },
          "800602": {
            "Name": "Halftime to Make It Rain",
            "Desc": "<span>Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.</span>",
            "Type": "Skill"
          },
          "800603": {
            "Name": "All-Out Footlight Parade",
            "Desc": "<span>Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their </span><span style='color:#f29e38ff'>Break Effect increased</span><span> and additionally deal </span><span style='color:#f29e38ff'><u>Super Break DMG</u></span><span> 1 time when they attack enemy targets that are <u>Weakness Broken</u>.</span>",
            "Type": "Ultimate"
          },
          "800604": {
            "Name": "Full-on Aerial Dance",
            "Desc": "<span>The Trailblazer regenerates Energy when an enemy target's Weakness is Broken.</span>",
            "Type": "Talent"
          },
          "800606": {
            "Name": "Attack",
            "Desc": ""
          },
          "800607": {
            "Name": "Now! I'm the Band!",
            "Desc": "<span>At the start of the next battle, increases all allies' Break Effect.</span>",
            "Type": "Technique"
          }
        },
        "Eidolons": {
          "800601": {
            "Name": "Best Seat in the House",
            "Desc": "<span>After using Skill for the first time, immediately recovers 1 Skill Point(s).</span>"
          },
          "800602": {
            "Name": "Jailbreaking Rainbowwalk",
            "Desc": "<span>When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s).</span>"
          },
          "800603": {
            "Name": "Sanatorium for Rest Notes",
            "Desc": "<span>Skill Lv. +2, up to a maximum of Lv. 15.<br>Talent Lv. +2, up to a maximum of Lv. 15.</span>"
          },
          "800604": {
            "Name": "Dove in Tophat",
            "Desc": "<span>While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect.</span>"
          },
          "800605": {
            "Name": "Poem Favors Rhythms of Old",
            "Desc": "<span>Ultimate Lv. +2, up to a maximum of Lv. 15.<br>Basic ATK Lv. +1, up to a maximum of Lv. 10.</span>"
          },
          "800606": {
            "Name": "Tomorrow, Rest in Spotlight",
            "Desc": "<span>The number of additional DMG applications by the Skill increases by 2.</span>"
          }
        }
      }
    },
    "RelicSets": {
      "101": {
        "Name": "Passerby of Wandering Cloud",
        "Description2pc": "<span>Increases Outgoing Healing by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>At the start of the battle, immediately regenerates 1 Skill Point.</span>"
      },
      "102": {
        "Name": "Musketeer of Wild Wheat",
        "Description2pc": "<span>Increases ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>",
        "Description4pc": "<span>The wearer's SPD increases by <span style='whiteSpace: \"nowrap\"'>6%</span> and DMG dealt by Basic ATK increases by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>"
      },
      "103": {
        "Name": "Knight of Purity Palace",
        "Description2pc": "<span>Increases DEF by <span style='whiteSpace: \"nowrap\"'>15%</span>.</span>",
        "Description4pc": "<span>Increases the max DMG that can be absorbed by the Shield created by the wearer by <span style='whiteSpace: \"nowrap\"'>20%</span>.</span>"
      },
      "104": {
        "Name": "Hunter of Glacial Forest",
        "Description2pc": "<span>Increases Ice DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>After the wearer uses their Ultimate, their CRIT DMG increases by <span style='whiteSpace: \"nowrap\"'>25%</span> for <span style='whiteSpace: \"nowrap\"'>2</span> turn(s).</span>"
      },
      "105": {
        "Name": "Champion of Streetwise Boxing",
        "Description2pc": "<span>Increases Physical DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>After the wearer attacks or is hit, their ATK increases by <span style='whiteSpace: \"nowrap\"'>5%</span> for the rest of the battle. This effect can stack up to <span style='whiteSpace: \"nowrap\"'>5</span> time(s).</span>"
      },
      "106": {
        "Name": "Guard of Wuthering Snow",
        "Description2pc": "<span>Reduces DMG taken by <span style='whiteSpace: \"nowrap\"'>8%</span>.</span>",
        "Description4pc": "<span>At the beginning of the turn, if the wearer's HP percentage is equal to or less than <span style='whiteSpace: \"nowrap\"'>50%</span>, restores HP equal to <span style='whiteSpace: \"nowrap\"'>8%</span> of their Max HP and regenerates <span style='whiteSpace: \"nowrap\"'>5</span> Energy.</span>"
      },
      "107": {
        "Name": "Firesmith of Lava-Forging",
        "Description2pc": "<span>Increases Fire DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>Increases DMG by the wearer's Skill by <span style='whiteSpace: \"nowrap\"'>12%</span>. After unleashing Ultimate, increases the wearer's Fire DMG by <span style='whiteSpace: \"nowrap\"'>12%</span> for the next attack.</span>"
      },
      "108": {
        "Name": "Genius of Brilliant Stars",
        "Description2pc": "<span>Increases Quantum DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>When the wearer deals DMG to the target enemy, ignores <span style='whiteSpace: \"nowrap\"'>10%</span> DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores <span style='whiteSpace: \"nowrap\"'>10%</span> DEF.</span>"
      },
      "109": {
        "Name": "Band of Sizzling Thunder",
        "Description2pc": "<span>Increases Lightning DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>When the wearer uses their Skill, increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>20%</span> for <span style='whiteSpace: \"nowrap\"'>1</span> turn(s).</span>"
      },
      "110": {
        "Name": "Eagle of Twilight Line",
        "Description2pc": "<span>Increases Wind DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>After the wearer uses their Ultimate, their action is Advanced Forward by <span style='whiteSpace: \"nowrap\"'>25%</span>.</span>"
      },
      "111": {
        "Name": "Thief of Shooting Meteor",
        "Description2pc": "<span>Increases Break Effect by <span style='whiteSpace: \"nowrap\"'>16%</span>.</span>",
        "Description4pc": "<span>Increases the wearer's Break Effect by <span style='whiteSpace: \"nowrap\"'>16%</span>. After the wearer inflicts Weakness Break on an enemy, regenerates <span style='whiteSpace: \"nowrap\"'>3</span> Energy.</span>"
      },
      "112": {
        "Name": "Wastelander of Banditry Desert",
        "Description2pc": "<span>Increases Imaginary DMG by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>",
        "Description4pc": "<span>When attacking debuffed enemies, the wearer's CRIT Rate increases by <span style='whiteSpace: \"nowrap\"'>10%</span>, and their CRIT DMG increases by <span style='whiteSpace: \"nowrap\"'>20%</span> against Imprisoned enemies.</span>"
      },
      "113": {
        "Name": "Longevous Disciple",
        "Description2pc": "<span>Increases Max HP by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>",
        "Description4pc": "<span>When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by <span style='whiteSpace: \"nowrap\"'>8%</span> for <span style='whiteSpace: \"nowrap\"'>2</span> turn(s) and up to <span style='whiteSpace: \"nowrap\"'>2</span> stacks.</span>"
      },
      "114": {
        "Name": "Messenger Traversing Hackerspace",
        "Description2pc": "<span>Increases SPD by <span style='whiteSpace: \"nowrap\"'>6%</span>.</span>",
        "Description4pc": "<span>When the wearer uses their Ultimate on an ally, SPD for all allies increases by <span style='whiteSpace: \"nowrap\"'>12%</span> for <span style='whiteSpace: \"nowrap\"'>1</span> turn(s). This effect cannot be stacked.</span>"
      },
      "115": {
        "Name": "The Ashblazing Grand Duke",
        "Description2pc": "<span>Increases the DMG dealt by follow-up attack by <span style='whiteSpace: \"nowrap\"'>20%</span>.</span>",
        "Description4pc": "<span>When the wearer uses a follow-up attack, increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>6%</span> for every time the follow-up attack deals DMG. This effect can stack up to <span style='whiteSpace: \"nowrap\"'>8</span> time(s) and lasts for <span style='whiteSpace: \"nowrap\"'>3</span> turn(s). This effect is removed the next time the wearer uses a follow-up attack.</span>"
      },
      "116": {
        "Name": "Prisoner in Deep Confinement",
        "Description2pc": "<span>Increases ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>",
        "Description4pc": "<span>For every DoT the enemy target is afflicted with, the wearer will ignore <span style='whiteSpace: \"nowrap\"'>6%</span> of its DEF when dealing DMG to it. This effect is valid for a max of <span style='whiteSpace: \"nowrap\"'>3</span> DoTs.</span>"
      },
      "117": {
        "Name": "Pioneer Diver of Dead Waters",
        "Description2pc": "<span>Increases DMG dealt to enemies with debuffs by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>",
        "Description4pc": "<span>Increases CRIT Rate by <span style='whiteSpace: \"nowrap\"'>4%</span>. The wearer deals <span style='whiteSpace: \"nowrap\"'>8%</span>/<span style='whiteSpace: \"nowrap\"'>12%</span> increased CRIT DMG to enemies with at least <span style='whiteSpace: \"nowrap\"'>2</span>/<span style='whiteSpace: \"nowrap\"'>3</span> debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by <span style='whiteSpace: \"nowrap\"'>100%</span>, lasting for <span style='whiteSpace: \"nowrap\"'>1</span> turn(s).</span>"
      },
      "118": {
        "Name": "Watchmaker, Master of Dream Machinations",
        "Description2pc": "<span>Increases Break Effect by <span style='whiteSpace: \"nowrap\"'>16%</span>.</span>",
        "Description4pc": "<span>When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by <span style='whiteSpace: \"nowrap\"'>30%</span> for <span style='whiteSpace: \"nowrap\"'>2</span> turn(s). This effect cannot be stacked.</span>"
      },
      "119": {
        "Name": "Iron Cavalry Against the Scourge",
        "Description2pc": "<span>Increases Break Effect by <span style='whiteSpace: \"nowrap\"'>16%</span>.</span>",
        "Description4pc": "<span>If the wearer's Break Effect is <span style='whiteSpace: \"nowrap\"'>150%</span> or higher, the Break DMG dealt to the enemy target ignores <span style='whiteSpace: \"nowrap\"'>10%</span> of their DEF. If the wearer's Break Effect is <span style='whiteSpace: \"nowrap\"'>250%</span> or higher, the Super Break DMG dealt to the enemy target additionally ignores <span style='whiteSpace: \"nowrap\"'>15%</span> of their DEF.</span>"
      },
      "120": {
        "Name": "The Wind-Soaring Valorous",
        "Description2pc": "<span>Increases ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>",
        "Description4pc": "<span>Increases the wearer's CRIT Rate by <span style='whiteSpace: \"nowrap\"'>6%</span>. After the wearer uses a follow-up attack, increases DMG dealt by Ultimate by <span style='whiteSpace: \"nowrap\"'>36%</span>, lasting for <span style='whiteSpace: \"nowrap\"'>1</span> turn(s).</span>"
      },
      "121": {
        "Name": "Sacerdos' Relived Ordeal",
        "Description2pc": "<span>Increases SPD by <span style='whiteSpace: \"nowrap\"'>6%</span>.</span>",
        "Description4pc": "<span>When using Skill or Ultimate on one ally target, increases the ability target's CRIT DMG by <span style='whiteSpace: \"nowrap\"'>18%</span>, lasting for <span style='whiteSpace: \"nowrap\"'>2</span> turn(s). This effect can stack up to <span style='whiteSpace: \"nowrap\"'>2</span> time(s).</span>"
      },
      "122": {
        "Name": "Scholar Lost in Erudition",
        "Description2pc": "<span>Increases CRIT Rate by <span style='whiteSpace: \"nowrap\"'>8%</span>.</span>",
        "Description4pc": "<span>Increases DMG dealt by Skill and Ultimate by <span style='whiteSpace: \"nowrap\"'>20%</span>. After using Ultimate, additionally increases the DMG dealt by the next Skill by <span style='whiteSpace: \"nowrap\"'>25%</span>.</span>"
      },
      "301": {
        "Name": "Space Sealing Station",
        "Description2pc": "<span>Increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>. When the wearer's SPD reaches <span style='whiteSpace: \"nowrap\"'>120</span> or higher, the wearer's ATK increases by an extra <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>"
      },
      "302": {
        "Name": "Fleet of the Ageless",
        "Description2pc": "<span>Increases the wearer's Max HP by <span style='whiteSpace: \"nowrap\"'>12%</span>. When the wearer's SPD reaches <span style='whiteSpace: \"nowrap\"'>120</span> or higher, all allies' ATK increases by <span style='whiteSpace: \"nowrap\"'>8%</span>.</span>"
      },
      "303": {
        "Name": "Pan-Cosmic Commercial Enterprise",
        "Description2pc": "<span>Increases the wearer's Effect Hit Rate by <span style='whiteSpace: \"nowrap\"'>10%</span>. Meanwhile, the wearer's ATK increases by an amount that is equal to <span style='whiteSpace: \"nowrap\"'>25%</span> of the current Effect Hit Rate, up to a maximum of <span style='whiteSpace: \"nowrap\"'>25%</span>.</span>"
      },
      "304": {
        "Name": "Belobog of the Architects",
        "Description2pc": "<span>Increases the wearer's DEF by <span style='whiteSpace: \"nowrap\"'>15%</span>. When the wearer's Effect Hit Rate is <span style='whiteSpace: \"nowrap\"'>50%</span> or higher, the wearer gains an extra <span style='whiteSpace: \"nowrap\"'>15%</span> DEF.</span>"
      },
      "305": {
        "Name": "Celestial Differentiator",
        "Description2pc": "<span>Increases the wearer's CRIT DMG by <span style='whiteSpace: \"nowrap\"'>16%</span>. When the wearer's current CRIT DMG reaches <span style='whiteSpace: \"nowrap\"'>120%</span> or higher, after entering battle, the wearer's CRIT Rate increases by <span style='whiteSpace: \"nowrap\"'>60%</span> until the end of their first attack.</span>"
      },
      "306": {
        "Name": "Inert Salsotto",
        "Description2pc": "<span>Increases the wearer's CRIT Rate by <span style='whiteSpace: \"nowrap\"'>8%</span>. When the wearer's current CRIT Rate reaches <span style='whiteSpace: \"nowrap\"'>50%</span> or higher, the DMG dealt by the wearer's Ultimate and follow-up attack increases by <span style='whiteSpace: \"nowrap\"'>15%</span>.</span>"
      },
      "307": {
        "Name": "Talia: Kingdom of Banditry",
        "Description2pc": "<span>Increases the wearer's Break Effect by <span style='whiteSpace: \"nowrap\"'>16%</span>. When the wearer's SPD reaches <span style='whiteSpace: \"nowrap\"'>145</span> or higher, the wearer's Break Effect increases by an extra <span style='whiteSpace: \"nowrap\"'>20%</span>.</span>"
      },
      "308": {
        "Name": "Sprightly Vonwacq",
        "Description2pc": "<span>Increases the wearer's Energy Regeneration Rate by <span style='whiteSpace: \"nowrap\"'>5%</span>. When the wearer's SPD reaches <span style='whiteSpace: \"nowrap\"'>120</span> or higher, the wearer's action is Advanced Forward by <span style='whiteSpace: \"nowrap\"'>40%</span> immediately upon entering battle.</span>"
      },
      "309": {
        "Name": "Rutilant Arena",
        "Description2pc": "<span>Increases the wearer's CRIT Rate by <span style='whiteSpace: \"nowrap\"'>8%</span>. When the wearer's current CRIT Rate reaches <span style='whiteSpace: \"nowrap\"'>70%</span> or higher, DMG dealt by Basic ATK and Skill increases by <span style='whiteSpace: \"nowrap\"'>20%</span>.</span>"
      },
      "310": {
        "Name": "Broken Keel",
        "Description2pc": "<span>Increases the wearer's Effect RES by <span style='whiteSpace: \"nowrap\"'>10%</span>. When the wearer's Effect RES is at <span style='whiteSpace: \"nowrap\"'>30%</span> or higher, all allies' CRIT DMG increases by <span style='whiteSpace: \"nowrap\"'>10%</span>.</span>"
      },
      "311": {
        "Name": "Firmament Frontline: Glamoth",
        "Description2pc": "<span>Increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>. When the wearer's SPD is equal to or higher than <span style='whiteSpace: \"nowrap\"'>135</span>/<span style='whiteSpace: \"nowrap\"'>160</span>, the wearer deals <span style='whiteSpace: \"nowrap\"'>12%</span>/<span style='whiteSpace: \"nowrap\"'>18%</span> more DMG.</span>"
      },
      "312": {
        "Name": "Penacony, Land of the Dreams",
        "Description2pc": "<span>Increases wearer's Energy Regeneration Rate by <span style='whiteSpace: \"nowrap\"'>5%</span>. Increases DMG by <span style='whiteSpace: \"nowrap\"'>10%</span> for all other allies that are of the same Type as the wearer.</span>"
      },
      "313": {
        "Name": "Sigonia, the Unclaimed Desolation",
        "Description2pc": "<span>Increases the wearer's CRIT Rate by <span style='whiteSpace: \"nowrap\"'>4%</span>. When an enemy target gets defeated, the wearer's CRIT DMG increases by <span style='whiteSpace: \"nowrap\"'>4%</span>, stacking up to <span style='whiteSpace: \"nowrap\"'>10</span> time(s).</span>"
      },
      "314": {
        "Name": "Izumo Gensei and Takama Divine Realm",
        "Description2pc": "<span>Increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>. When entering battle, if at least one other ally follows the same Path as the wearer, then the wearer's CRIT Rate increases by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>"
      },
      "315": {
        "Name": "Duran, Dynasty of Running Wolves",
        "Description2pc": "<span>When an ally uses a follow-up attack, the wearer gains 1 stack of Merit, stacking up to <span style='whiteSpace: \"nowrap\"'>5</span> time(s). Each stack of Merit increases the DMG dealt by the wearer's follow-up attacks by <span style='whiteSpace: \"nowrap\"'>5%</span>. When there are <span style='whiteSpace: \"nowrap\"'>5</span> stacks, additionally increases the wearer's CRIT DMG by <span style='whiteSpace: \"nowrap\"'>25%</span>.</span>"
      },
      "316": {
        "Name": "Forge of the Kalpagni Lantern",
        "Description2pc": "<span>Increases the wearer's SPD by <span style='whiteSpace: \"nowrap\"'>6%</span>. When the wearer hits an enemy target that has Fire Weakness, the wearer's Break Effect increases by <span style='whiteSpace: \"nowrap\"'>40%</span>, lasting for <span style='whiteSpace: \"nowrap\"'>1</span> turn(s).</span>"
      },
      "317": {
        "Name": "Lushaka, the Sunken Seas",
        "Description2pc": "<span>Increases the wearer's Energy Regeneration Rate by <span style='whiteSpace: \"nowrap\"'>5%</span>. If the wearer is not the first character in the team lineup, then increases the ATK of the first character in the team lineup by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>"
      },
      "318": {
        "Name": "The Wondrous BananAmusement Park",
        "Description2pc": "<span>Increases the wearer's CRIT DMG by <span style='whiteSpace: \"nowrap\"'>16%</span>. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by <span style='whiteSpace: \"nowrap\"'>32%</span>.</span>"
      }
    },
    "Lightcones": {
      "20000": {
        "Name": "Arrows",
        "SkillName": "Crisis"
      },
      "20001": {
        "Name": "Cornucopia",
        "SkillName": "Prosperity"
      },
      "20002": {
        "Name": "Collapsing Sky",
        "SkillName": "Havoc"
      },
      "20003": {
        "Name": "Amber",
        "SkillName": "Stasis"
      },
      "20004": {
        "Name": "Void",
        "SkillName": "Fallen"
      },
      "20005": {
        "Name": "Chorus",
        "SkillName": "Concerted"
      },
      "20006": {
        "Name": "Data Bank",
        "SkillName": "Learned"
      },
      "20007": {
        "Name": "Darting Arrow",
        "SkillName": "War Cry"
      },
      "20008": {
        "Name": "Fine Fruit",
        "SkillName": "Savor"
      },
      "20009": {
        "Name": "Shattered Home",
        "SkillName": "Eradication"
      },
      "20010": {
        "Name": "Defense",
        "SkillName": "Revitalization"
      },
      "20011": {
        "Name": "Loop",
        "SkillName": "Pursuit"
      },
      "20012": {
        "Name": "Meshing Cogs",
        "SkillName": "Fleet Triumph"
      },
      "20013": {
        "Name": "Passkey",
        "SkillName": "Epiphany"
      },
      "20014": {
        "Name": "Adversarial",
        "SkillName": "Alliance"
      },
      "20015": {
        "Name": "Multiplication",
        "SkillName": "Denizens of Abundance"
      },
      "20016": {
        "Name": "Mutual Demise",
        "SkillName": "Legion"
      },
      "20017": {
        "Name": "Pioneering",
        "SkillName": "IPC"
      },
      "20018": {
        "Name": "Hidden Shadow",
        "SkillName": "Mechanism"
      },
      "20019": {
        "Name": "Mediation",
        "SkillName": "Family"
      },
      "20020": {
        "Name": "Sagacity",
        "SkillName": "Genius"
      },
      "21000": {
        "Name": "Post-Op Conversation",
        "SkillName": "Mutual Healing"
      },
      "21001": {
        "Name": "Good Night and Sleep Well",
        "SkillName": "Toiler"
      },
      "21002": {
        "Name": "Day One of My New Life",
        "SkillName": "At This Very Moment"
      },
      "21003": {
        "Name": "Only Silence Remains",
        "SkillName": "Record"
      },
      "21004": {
        "Name": "Memories of the Past",
        "SkillName": "Old Photo"
      },
      "21005": {
        "Name": "The Moles Welcome You",
        "SkillName": "Fantastic Adventure"
      },
      "21006": {
        "Name": "The Birth of the Self",
        "SkillName": "The Maiden in the Painting"
      },
      "21007": {
        "Name": "Shared Feeling",
        "SkillName": "Cure and Repair"
      },
      "21008": {
        "Name": "Eyes of the Prey",
        "SkillName": "Self-Confidence"
      },
      "21009": {
        "Name": "Landau's Choice",
        "SkillName": "Time Fleets Away"
      },
      "21010": {
        "Name": "Swordplay",
        "SkillName": "Answers of Their Own"
      },
      "21011": {
        "Name": "Planetary Rendezvous",
        "SkillName": "Departure"
      },
      "21012": {
        "Name": "A Secret Vow",
        "SkillName": "Spare No Effort"
      },
      "21013": {
        "Name": "Make the World Clamor",
        "SkillName": "The Power of Sound"
      },
      "21014": {
        "Name": "Perfect Timing",
        "SkillName": "Refraction of Sightline"
      },
      "21015": {
        "Name": "Resolution Shines As Pearls of Sweat",
        "SkillName": "Glance Back"
      },
      "21016": {
        "Name": "Trend of the Universal Market",
        "SkillName": "A New Round of Shuffling"
      },
      "21017": {
        "Name": "Subscribe for More!",
        "SkillName": "Like Before You Leave!"
      },
      "21018": {
        "Name": "Dance! Dance! Dance!",
        "SkillName": "Cannot Stop It!"
      },
      "21019": {
        "Name": "Under the Blue Sky",
        "SkillName": "Rye Under the Sun"
      },
      "21020": {
        "Name": "Geniuses' Repose",
        "SkillName": "Each Now Has a Role to Play"
      },
      "21021": {
        "Name": "Quid Pro Quo",
        "SkillName": "Enjoy With Rapture"
      },
      "21022": {
        "Name": "Fermata",
        "SkillName": "Semibreve Rest"
      },
      "21023": {
        "Name": "We Are Wildfire",
        "SkillName": "Teary-Eyed"
      },
      "21024": {
        "Name": "River Flows in Spring",
        "SkillName": "Stave Off the Lingering Cold"
      },
      "21025": {
        "Name": "Past and Future",
        "SkillName": "Kites From the Past"
      },
      "21026": {
        "Name": "Woof! Walk Time!",
        "SkillName": "Run!"
      },
      "21027": {
        "Name": "The Seriousness of Breakfast",
        "SkillName": "Get Ready"
      },
      "21028": {
        "Name": "Warmth Shortens Cold Nights",
        "SkillName": "Tiny Light"
      },
      "21029": {
        "Name": "We Will Meet Again",
        "SkillName": "A Discourse in Arms"
      },
      "21030": {
        "Name": "This Is Me!",
        "SkillName": "New Chapter"
      },
      "21031": {
        "Name": "Return to Darkness",
        "SkillName": "Raging Waves"
      },
      "21032": {
        "Name": "Carve the Moon, Weave the Clouds",
        "SkillName": "Secret"
      },
      "21033": {
        "Name": "Nowhere to Run",
        "SkillName": "Desperate Times"
      },
      "21034": {
        "Name": "Today Is Another Peaceful Day",
        "SkillName": "A Storm Is Coming"
      },
      "21035": {
        "Name": "What Is Real?",
        "SkillName": "Hypothesis"
      },
      "21036": {
        "Name": "Dreamville Adventure",
        "SkillName": "Solidarity"
      },
      "21037": {
        "Name": "Final Victor",
        "SkillName": "Wager"
      },
      "21038": {
        "Name": "Flames Afar",
        "SkillName": "Deflagration"
      },
      "21039": {
        "Name": "Destiny's Threads Forewoven",
        "SkillName": "Insight"
      },
      "21040": {
        "Name": "The Day The Cosmos Fell",
        "SkillName": "Stratagem"
      },
      "21041": {
        "Name": "It's Showtime",
        "SkillName": "Self-Amusement"
      },
      "21042": {
        "Name": "Indelible Promise",
        "SkillName": "Inheritance"
      },
      "21043": {
        "Name": "Concert for Two",
        "SkillName": "Inspire"
      },
      "21044": {
        "Name": "Boundless Choreo",
        "SkillName": "Scrutinize"
      },
      "21045": {
        "Name": "After the Charmony Fall",
        "SkillName": "Quiescence"
      },
      "21046": {
        "Name": "Poised to Bloom",
        "SkillName": "Lose Not, Forget Not"
      },
      "21047": {
        "Name": "Shadowed by Night",
        "SkillName": "Concealment"
      },
      "21048": {
        "Name": "Dream's Montage",
        "SkillName": "Academy-Style Edit"
      },
      "22000": {
        "Name": "Before the Tutorial Mission Starts",
        "SkillName": "Quick on the Draw"
      },
      "22001": {
        "Name": "Hey, Over Here",
        "SkillName": "I'm Not Afraid!"
      },
      "22002": {
        "Name": "For Tomorrow's Journey",
        "SkillName": "Bonds"
      },
      "22003": {
        "Name": "Ninja Record: Sound Hunt",
        "SkillName": "Curtains Up!"
      },
      "23000": {
        "Name": "Night on the Milky Way",
        "SkillName": "Meteor Swarm"
      },
      "23001": {
        "Name": "In the Night",
        "SkillName": "Flowers and Butterflies"
      },
      "23002": {
        "Name": "Something Irreplaceable",
        "SkillName": "Kinship"
      },
      "23003": {
        "Name": "But the Battle Isn't Over",
        "SkillName": "Heir"
      },
      "23004": {
        "Name": "In the Name of the World",
        "SkillName": "Inheritor"
      },
      "23005": {
        "Name": "Moment of Victory",
        "SkillName": "Verdict"
      },
      "23006": {
        "Name": "Patience Is All You Need",
        "SkillName": "Spider Web"
      },
      "23007": {
        "Name": "Incessant Rain",
        "SkillName": "Mirage of Reality"
      },
      "23008": {
        "Name": "Echoes of the Coffin",
        "SkillName": "Thorns"
      },
      "23009": {
        "Name": "The Unreachable Side",
        "SkillName": "Unfulfilled Yearning"
      },
      "23010": {
        "Name": "Before Dawn",
        "SkillName": "Long Night"
      },
      "23011": {
        "Name": "She Already Shut Her Eyes",
        "SkillName": "Visioscape"
      },
      "23012": {
        "Name": "Sleep Like the Dead",
        "SkillName": "Sweet Dreams"
      },
      "23013": {
        "Name": "Time Waits for No One",
        "SkillName": "Morn, Noon, Dusk, and Night"
      },
      "23014": {
        "Name": "I Shall Be My Own Sword",
        "SkillName": "With This Evening Jade"
      },
      "23015": {
        "Name": "Brighter Than the Sun",
        "SkillName": "Defiant Till Death"
      },
      "23016": {
        "Name": "Worrisome, Blissful",
        "SkillName": "One At A Time"
      },
      "23017": {
        "Name": "Night of Fright",
        "SkillName": "Deep, Deep Breaths"
      },
      "23018": {
        "Name": "An Instant Before A Gaze",
        "SkillName": "A Knight's Pilgrimage"
      },
      "23019": {
        "Name": "Past Self in Mirror",
        "SkillName": "The Plum Fragrance In My Bones"
      },
      "23020": {
        "Name": "Baptism of Pure Thought",
        "SkillName": "Mental Training"
      },
      "23021": {
        "Name": "Earthly Escapade",
        "SkillName": "Capriciousness"
      },
      "23022": {
        "Name": "Reforged Remembrance",
        "SkillName": "Crystallize"
      },
      "23023": {
        "Name": "Inherently Unjust Destiny",
        "SkillName": "All-In"
      },
      "23024": {
        "Name": "Along the Passing Shore",
        "SkillName": "Steerer"
      },
      "23025": {
        "Name": "Whereabouts Should Dreams Rest",
        "SkillName": "Metamorphosis"
      },
      "23026": {
        "Name": "Flowing Nightglow",
        "SkillName": "Pacify"
      },
      "23027": {
        "Name": "Sailing Towards a Second Life",
        "SkillName": "Rough Water"
      },
      "23028": {
        "Name": "Yet Hope Is Priceless",
        "SkillName": "Promise"
      },
      "23029": {
        "Name": "Those Many Springs",
        "SkillName": "Worldly Affairs Leave No Mark"
      },
      "23030": {
        "Name": "Dance at Sunset",
        "SkillName": "Deeply Engrossed"
      },
      "23031": {
        "Name": "I Venture Forth to Hunt",
        "SkillName": "Intimidation"
      },
      "23032": {
        "Name": "Scent Alone Stays True",
        "SkillName": "Contentment"
      },
      "23033": {
        "Name": "Ninjutsu Inscription: Dazzling Evilbreaker",
        "SkillName": "Exorcism"
      },
      "24000": {
        "Name": "On the Fall of an Aeon",
        "SkillName": "Moth to Flames"
      },
      "24001": {
        "Name": "Cruising in the Stellar Sea",
        "SkillName": "Chase"
      },
      "24002": {
        "Name": "Texture of Memories",
        "SkillName": "Treasure"
      },
      "24003": {
        "Name": "Solitary Healing",
        "SkillName": "Chaos Elixir"
      },
      "24004": {
        "Name": "Eternal Calculus",
        "SkillName": "Boundless Thought"
      }
    },
    "Paths": {
      "Warrior": "Destruction",
      "Rogue": "The Hunt",
      "Mage": "Erudition",
      "Shaman": "Harmony",
      "Warlock": "Nihility",
      "Knight": "Preservation",
      "Priest": "Abundance",
      "Unknown": "General"
    },
    "Elements": {
      "Physical": "Physical",
      "Fire": "Fire",
      "Ice": "Ice",
      "Thunder": "Lightning",
      "Wind": "Wind",
      "Quantum": "Quantum",
      "Imaginary": "Imaginary"
    }
  },
  "getStartedTab": {
    "TryOut": {
      "ButtonText": "Try it out!",
      "title": "Confirm",
      "description": "Load a sample save file?",
      "okText": "Yes",
      "cancelText": "Cancel",
      "SuccessMessage": "Successfully loaded data",
      "Header": "Try it out!",
      "Option 1": "<0>Option 1: Load a sample save</0><1>If you would like to give the optimizer a try before doing any relic importing, use this to load a sample save file and check out the features.</1>",
      "Option 2": "<0>Option 2: One-click-optimize from the Relic Scorer</0><1/><2>From the <1><0 text=\"Relic scorer\"></0></1> tab, clicking on the Optimize Character Stats button will automatically import and run the optimizer on your selected character. This option will only be able to use the relics from your profile's showcase characters, so it is still recommended to use a scanner to import your full inventory of relics, but this allows for a quick calculation of character stats in combat.</2>"
    },
    "HowTo": {
      "Header": "How do I use the optimizer?",
      "Step 1": "<0>Step 1: Import relics</0><1>The optimizer needs a database of relics to run against. Install and run one of the relic scanner options:</1><2><0></0><1>Kel-Z HSR Scanner (<1 text=\"Github\"></1>)<3><0>OCR scanner</0><1>Supports all 16:9 screen resolutions</1></3></1><2>Relic Scorer Import (<1><0 text=\"Relic scorer\"></0></1>)<3><0>No download needed, but limited to relics from the 8 characters on profile showcase</0><1>Imports accurate speed decimals</1></3></2></2>",
      "Step 2": "<0>Step 2: Select a character</0><1/><2>Select a character and light cone from the Character Options menu. Next, use the Recommended Presets button to select a preset speed target to optimize for. For most characters, the 133 speed breakpoint is recommended, and this will set a minimum speed for your optimization results. This preset will also automatically fill out the ideal main stats and relic set conditionals for the optimizer.</2><3>Once a character is chosen, their ability passives and light cone passives can be customized. These selectors will affect the final combat stats and damage calculations for the character. For the first run these can be left as default.</3><4>Most of the Enemy Options and Optimizer Options can be left as default to get started. One important option is the Character Priority filter setting, which defines which relics the character may steal from other characters. Characters can only take relics from lower priority characters, so for the first run set this priority to #1, but later on your characters list should be ordered by which characters have the highest priority for taking gear.</4>",
      "Step 3": "<0>Step 3: Apply filters</0><1/><2>Main Stats</2><3>The main stat filters limits optimizer to using preferred body, feet, planar sphere, and link rope main stats. Multiple options can be chosen for each slot. The Recommended Presets button will fill these out with each character's ideal stats, but these can be customized for other builds.</3><4>Set filters</4><5/><6>The relic set filter allows for a combination of 2-piece sets, 4-piece sets, or can be left empty. When multiple options are chosen, the search results will only show builds with least one of the selected filters active. Conditional set effects can be customized from the menu.</6><7>Stat min / max filters</7><8>This section defines the minimum / maximum stats to filter the results by. Left side is minimum and right side is maximum, both inclusive. In this above example, only results with &ge; 134 speed AND &ge; 35% Crit Rate are shown. Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect.</8><9>Important note: relics typed in manually or imported with the OCR tool may be affected by hidden decimal points for speed that aren't shown by ingame stats. For example, 5 star relics can have speed substats of values between 2.0 - 2.6, which would all show ingame as 2. This means that speed results should be treated as minimum values, as the real value may be slightly higher ingame. This also means that maximum filters on speed should be used carefully since they may be too restrictive.</9>",
      "Step 4": "<0>Step 4: Select teammates</0><1/><2>In this menu, select the 3 teammates that you're using with the main character. These teammates will apply their buffs and passive effects to the calculations. The relic/ornament sets and conditionals can be customized to fit the combat scenario.</2>",
      "Step 5": "<0>Step 5: Save results</0><1/><2>Result rows</2><3>This section displays all the results found that match the filters. Every row represents one build that was found. The pinned top row shows the character's currently equipped build. Clicking on each row will show the relics used in the selected build. There may be multiple pages of results, so clicking a column header to sort the results by a stat or rating can make it easier to find desired builds.</3><4>Permutations</4><5>This section shows the number of permutations the optimizer has to search and details on the number of matching relics per slot. If any of the numbers are zero, that indicates that no relics were found that would satisfy the constraints.</5><6><0>Perms - Number of permutations that need to be searched. Stricter filters will reduce permutations and search time</0><1>Searched - Number of permutations completed in an in-progress search</1><2>Results - Number of displayed results that satisfy the stat filters</2></6><7>Selected build</7><8>This section displays the selected build from the grid, and which relics are used & who they are currently equipped on. Pressing the 'Equip' button will assign the relics to the selected character in the optimizer, though the ingame character build is not affected.</8>"
    },
    "CharacterTab": "<0>Character tab</0><1/><2>Character priority</2><3>This section displays all the optimized characters and their priority order. Characters are added to this list from the Optimizer tab, when their filters are applied and 'Start' is pressed.</3><4>The ranking is important when used with the 'Priority filter' on the Optimizer tab. When enabled, characters may only take relics from lower priority characters. For example, the priority #2 character may take relics from priority #3, but cannot take from priority #2. Priority #1 can take from any other character. Rows can be dragged to re-order characters.</4><5>The colored highlight on the right of the grid shows the equipped item status of the character. In the above example, Jingliu's green indicator means she has all 6 relics equipped, Bronya's yellow indicator means she is missing at least one relic from her build, and Natasha's red indicator means she has no relics equipped.</5><6>Stats summary</6><7>This section displays the character's stats with their base stats / light cone / maxed traces / and relics equipped in the optimizer. Note that similar to the optimizer results, the actual values ingame may be slightly higher than displayed here due to hidden decimal values on relic stats.</7>",
    "RelicsTab": "<0>Relics tab</0><1/><2>Relics table</2><3>This section displays all the relics that were added / imported into the optimizer. Relics should be updated occasionally with the importer to add in newly acquired relics. Clicking columns will sort the relics table.</3>"
  },
  "hint": {
    "RatingFilter": {
      "Title": "Rating filters",
      "p1": "Weight - Sum of substat weights of all 6 relics, from the Substat weight filter",
      "p2": "Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives",
      "p3": "Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options."
    },
    "CombatBuffs": {
      "Title": "Combat buffs",
      "p1": "Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations."
    },
    "StatFilters": {
      "Title": "Stat filters",
      "p1": "Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges",
      "p2": "Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect",
      "p3": "NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can\"t detect the hidden decimals."
    },
    "Mainstats": {
      "Title": "Main stats",
      "p1": "Select main stats to use for optimization search. Multiple values can be selected for more options"
    },
    "Sets": {
      "Title": "Sets",
      "p1": "Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options",
      "p2": "Set effects will be accounted for in calculations, use the Conditional set effects menu to customize which effects are active."
    },
    "Character": {
      "Title": "Character",
      "p1": "Select the character and eidolon. Character is assumed to be level 80 with maxed traces in optimization calcs."
    },
    "CharacterPassives": {
      "Title": "Character passives",
      "p1": "Select the conditional effects to apply to the character.",
      "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
    },
    "LightconePassives": {
      "Title": "Light cone passives",
      "p1": "Select the conditional effects to apply to the light cone.",
      "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
    },
    "Lightcone": {
      "Title": "Light cone",
      "p1": "Select the light cone and superimposition. Light cone is assumed to be level 80 in optimization calcs.",
      "p2": "Superimposition and passive effects are applied under the Light cone passives panel."
    },
    "Actions": {
      "Title": "Actions",
      "p1": "Equip - Equip the selected relics from the grid onto the character",
      "p2": "Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search",
      "p3": "Pin build - Pin the currently selected row to the top of the grid. Use this to compare multiple builds more easily",
      "p4": "Clear pins - Clear all the builds that you pinned to the top of the grid"
    },
    "OptimizerOptions": {
      "Title": "Optimizer options",
      "p1": "<0>Character priority filter</0> - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.",
      "p2": "<0>Boost main stat</0> - Calculates relic mains stats as if they were this level (or their max if they can't reach this level) if they are currently below it. Substats are not changed accordingly, so builds with lower level relics may be stronger once you level them.",
      "p3": "<0>Keep current relics</0> - The character must use its currently equipped items, and the optimizer will try to fill in empty slots",
      "p4": "<0>Include equipped relics</0> - When enabled, the optimizer will allow using currently equipped by a character for the search. Otherwise equipped relics are excluded",
      "p5": "<0>Priority</0> - See: Character priority filter. Changing this setting will change the character\"s priority",
      "p6": "<0>Exclude</0> - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter",
      "p7": "<0>Enhance / grade</0> - Select the minimum enhance to search for and minimum stars for relics to include"
    },
    "Relics": {
      "Title": "Relics",
      "p1": "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats.",
      "p2": "Selected character: Score - The relic\"s current weight as defined by the scoring algorithm for the currently selected character",
      "p3": "Selected character: Average potential - The relic\"s potential weight if rolls went into the average weight of the relic\"s substats",
      "p4": "Selected character: Max potential - The relic\"s maximum potential weight if all future rolls went into the character\"s desired stats",
      "p5": "All characters: Max potential - The highest possible potential value of the relic, out of all characters in the game."
    },
    "OptimizationDetails": {
      "Title": "Optimization details",
      "p1": "Shows how many relics are being used in the optimization search, after all filters are applied",
      "p2": "Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time",
      "p3": "Searched - Number of permutations already searched",
      "p4": "Results - Number of displayed results that satisfy the stat filters"
    },
    "EnemyOptions": {
      "Title": "Enemy options",
      "p1": "Level - Enemy level, affects enemy DEF calculations",
      "p2": "Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.",
      "p3": "RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled.",
      "p4": "Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage.",
      "p5": "Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0.",
      "p6": "Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives."
    },
    "SubstatWeightFilter": {
      "Title": "Substat weight filter",
      "p1": "This filter is used to reduce the number of permutations the optimizer has to process.",
      "p2": "It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.",
      "p3": "Only relics that have more than the specified number of weighted rolls will be used for the optimization search.",
      "p4": "Note that setting the minimum rolls too low may result in some builds not being displayed, if the filter ends up excludes a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time."
    },
    "StatDisplay": {
      "Title": "Stat and filter view",
      "p1": "This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.",
      "p2": "Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied.",
      "p3": "Combat stats - The character\"s stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
    },
    "ValueColumns": {
      "Title": "Value Columns",
      "p1": "You can optionally display a number of columns that assess the relative 'value' of a relic.",
      "p2": "Weight",
      "p3": "Weight columns assess the contribution of a particular relic to the overall letter grading of the selected recommendation character (if any).",
      "p4": "Weight can show the current value of a relic, the possible best case upgraded weight, or an 'average' weight that you're more likely to see",
      "p5": "Weight is useful to focus on a single character and see which relics might give them a higher letter grading.",
      "p6": "Potential",
      "p7": "Potential is a character-specific percentage of how good the relic could be (or 'is', if fully upgraded), compared against the stats on a fully upgraded 'perfect' relic in that slot.",
      "p8": "Potential can look at all characters or just owned. It then takes the maximum percentage for any character.",
      "p9": "Potential is useful for finding relics that aren't good on any character, or hidden gems that could be great when upgraded.",
      "p10": "Note: ordering by potential can be mismatched against weights, due to weight calculations preferring lower weight ideal mainstats."
    },
    "RelicInsights": {
      "Title": "Relic Insight",
      "p1": "When a relic is selected in the table above, you can choose an analysis to view a plot of.",
      "p2": "'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<0/>If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<1/>⚠️ Relics with missing substats may have misleadingly high buckets, as best-case upgrade analysis assumes the best new substat per character.",
      "p3": "Top 10 takes the top 10 characters that this relic could be best for, and shows the range of \"% perfection\" upgrading this relic could result in."
    },
    "RelicLocation": {
      "Title": "Relic Location",
      "p1": "When a relic is selected in the grid, its position in the ingame inventory is displayed here.",
      "p2": "If the set / part filters are active, apply those same filters ingame, then sort by Date Obtained (newest first) to find the relic.",
      "p3": "⚠️Usage notes⚠️",
      "p4": "This is only supported with Reliquary Archiver import",
      "p5": "If new relics were deleted or obtained since the last import, they must be re-scanned and imported",
      "p6": "Select the appropriate Inventory width setting to get accurate locations. The width depends on the ingame screen and menu width"
    },
    "LocatorParams": {
      "Title": "Relic Locator Options",
      "p1": "<0>Inventory Width</0> - Select the number of columns the inventory has ingame so that the relic locator can find your relic accurately",
      "p2": "<0>Auto Filter rows</0> - Maximum number of rows before the relic locator applies a part/set filter to try and bring the searched relic closer to the top of your inventory"
    }
  },
  "importSaveTab": {
    "TabLabels": {
      "Import": "Relic scanner importer",
      "Load": "Load optimizer data",
      "Save": "Save optimizer data",
      "Clear": "Clear optimizer data"
    },
    "Import": {
      "ErrorMsg": {
        "Unknown": "Unknown Error",
        "InvalidFile": "Invalid scanner file",
        "InvalidJson": "Invalid JSON",
        "Fragment": "Error occurred while importing file: "
      },
      "Stage1": {
        "Header": "Install and run one of the relic scanner options:",
        "ReliquaryDesc": {
          "Title": "(Recommended) IceDynamix Reliquary Archiver",
          "Link": "Github",
          "OnlineMsg": "Status: Updated for patch {{version}} — New download required",
          "OfflineMsg": "***** Status: Down for maintenance after {{version}} patch *****",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "Imports full inventory and character roster"
        },
        "KelzDesc": {
          "Title": "Kel-Z HSR Scanner",
          "Link": "Github",
          "l1": "Inaccurate speed decimals, 5-10 minutes OCR scan",
          "l2": "Imports full inventory and character roster"
        },
        "ScorerDesc": {
          "Title": "Relic Scorer Import",
          "Link": "Relic scorer",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "No download needed, but limited to relics from the 8 characters on the profile showcase"
        },
        "HoyolabDesc": {
          "Title": "HoyoLab Import",
          "Link": "Instructions",
          "l1": "Inaccurate speed decimals, instant scan",
          "l2": "No download needed, but limited to ingame characters equipped relics"
        },
        "ButtonText": "Upload scanner json file",
        "Or": "or",
        "Placeholder": "Paste json file contents"
      },
      "Stage2": {
        "Or": "OR",
        "FileInfo": "File contains {{relicCount}} relics and {{characterCount}} characters.",
        "NoRelics": "Invalid scanner file, please try a different file",
        "RelicsImport": {
          "Label": "Import relics only. Updates the optimizer with the new dataset of relics and doesn't overwrite builds.",
          "ButtonText": "Import relics"
        },
        "CharactersImport": {
          "Label": "Import relics and characters. Replaces the optimizer builds with ingame builds.",
          "ButtonText": "Import relics & characters",
          "WarningTitle": "Overwrite optimizer builds",
          "WarningDescription": "Are you sure you want to overwrite your optimizer builds with ingame builds?"
        }
      },
      "Stage3": {
        "SuccessMessage": "Done!"
      }
    },
    "LoadData": {
      "Stage1": {
        "Label": "Load your optimizer data from a file.",
        "ButtonText": "Load save data"
      },
      "Stage2": {
        "ErrorMsg": "Invalid save file, please try a different file. Did you mean to use the Relic scanner import tab?",
        "Label": "File contains {{relicCount}} relics and {{characterCount}} characters. Replace your current data with the uploaded data?",
        "ButtonText": "Use uploaded data"
      },
      "Stage3": {
        "SuccessMessage": "Done!"
      }
    },
    "SaveData": {
      "Label": "Save your optimizer data to a file.",
      "ButtonText": "Save data",
      "SuccessMessage": "Done"
    },
    "ClearData": {
      "Label": "Clear all optimizer data.",
      "ButtonText": "Clear data",
      "SuccessMessage": "Cleared data",
      "WarningTitle": "Erase all data",
      "WarningDescription": "Are you sure you want to clear all relics and characters?"
    },
    "PartialImport": {
      "OldRelics": "Updated stats for {{count}} existing relics",
      "NewRelics": "Added {{count}} new relics"
    }
  },
  "modals": {
    "Scoring": {
      "StatWeightsHeader": "Stat weights",
      "MainstatsHeader": "Optimal mainstats",
      "WeightMethodology": {
        "Header": "How is Stat Score calculated?"
      },
      "Footer": {
        "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "Reset": "Reset to default",
        "ResetAll": "Reset all characters",
        "Save": "Save changes"
      },
      "ResetAllConfirm": {
        "Title": "Reset the scoring algorithm for all characters?",
        "Description": "You will lose any custom scoring settings you have set on any character.",
        "Yes": "$t(common:Yes, {\"capitalizeLength\": 1})",
        "No": "$t(common:No, {\"capitalizeLength\": 1})"
      }
    },
    "0Perms": {
      "Title": "Search generated 0 permutations",
      "Description": "This means your filters are misconfigured or too restrictive, and no possibilities match the filters. Permutations are shown on the sidebar.",
      "RootCauses": {
        "IMPORT": {
          "Description": "Import relics from your account on the Importer tab",
          "ButtonText": "Navigate to Importer tab",
          "SuccessMessage": "Choose an import method and import your relics and characters"
        },
        "Body_MAIN": {
          "Description": "The main stat for the $t(common:Parts.Body) filter might be too restrictive",
          "ButtonText": "Clear $t(common:Parts.Body) main stat filters",
          "SuccessMessage": "Cleared $t(common:Parts.Body) main stat filters"
        },
        "Feet_MAIN": {
          "Description": "The main stat for the $t(common:Parts.Feet) filter might be too restrictive",
          "ButtonText": "Clear $t(common:Parts.Feet) main stat filters",
          "SuccessMessage": "Cleared $t(common:Parts.Feet) main stat filters"
        },
        "PlanarSphere_MAIN": {
          "Description": "The main stat for the $t(common:Parts.PlanarSphere) filter might be too restrictive",
          "ButtonText": "Clear $t(common:Parts.PlanarSphere) main stat filters",
          "SuccessMessage": "Cleared $t(common:Parts.PlanarSphere) main stat filters"
        },
        "LinkRope_MAIN": {
          "Description": "The main stat for the $t(common:Parts.LinkRope) filter might be too restrictive",
          "ButtonText": "Clear $t(common:Parts.LinkRope) main stat filters",
          "SuccessMessage": "Cleared $t(common:Parts.LinkRope) main stat filters"
        },
        "RELIC_SETS": {
          "Description": "The selected relic set filters might be too restrictive",
          "ButtonText": "Clear Relic set filters",
          "SuccessMessage": "Cleared relic set filters"
        },
        "ORNAMENT_SETS": {
          "Description": "The selected ornament set filters might be too restrictive",
          "ButtonText": "Clear Ornament set filters",
          "SuccessMessage": "Cleared ornament set filters"
        },
        "KEEP_CURRENT": {
          "Description": "The \"Keep current relics\" option is enabled, which forces any currently equipped relics on the character to be unchanged in the search",
          "ButtonText": "Disable \"Keep current relics\"",
          "SuccessMessage": "Disabled \"Keep current relics\""
        },
        "PRIORITY": {
          "Description": "The character is ranked below other characters on the priority list. When the \"Character priority filter\" is enabled, characters may only take lower priority characters' relics",
          "ButtonText": "Move character to priority #1",
          "SuccessMessage": "Moved character to priority #1"
        },
        "EXCLUDE_ENABLED": {
          "Description": "The \"Exclude\" filter has some selected characters, which means this character cannot take relics from the selected characters",
          "ButtonText": "Clear excluded characters",
          "SuccessMessage": "Cleared excluded characters"
        },
        "EQUIPPED_DISABLED": {
          "Description": "The \"Include equipped relics\" filter is disabled, which means this character cannot take any relics belonging to other characters",
          "ButtonText": "Enable \"Include equipped relics\"",
          "SuccessMessage": "Enabled \"Include equipped relics\""
        },
        "MINIMUM_ROLLS": {
          "Description": "The substat weight filter has a minimum roll threshold that might be too high",
          "ButtonText": "Set minimum rolls to 0",
          "SuccessMessage": "Set minimum rolls to 0"
        }
      }
    },
    "0Results": {
      "Title": "Search generated 0 results",
      "ResetAll": {
        "ButtonText": "Reset all filters",
        "SuccessMessage": "Cleared all filters",
        "Description": "This means your stat and/or rating filters are too restrictive."
      },
      "RootCauses": {
        "StatView": {
          "SuccessMessage": "Switched to Combat stats view",
          "Description": "Your stat filters are configured for basic stats, which does not include buffs. The Combat stats view will show buffed stats from abilities / teammates / relics / etc.",
          "ButtonText": "Switch to Combat stats view"
        },
        "MAX_HP": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) filter"
        },
        "MIN_HP": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.HP) filter"
        },
        "MAX_ATK": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) filter"
        },
        "MIN_ATK": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.ATK) filter"
        },
        "MAX_DEF": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) filter"
        },
        "MIN_DEF": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.DEF) filter"
        },
        "MAX_SPD": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) filter"
        },
        "MIN_SPD": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.SPD) filter"
        },
        "MAX_CR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) filter"
        },
        "MIN_CR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT Rate) filter"
        },
        "MAX_CD": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) filter"
        },
        "MIN_CD": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.CRIT DMG) filter"
        },
        "MAX_EHR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) filter"
        },
        "MIN_EHR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect Hit Rate) filter"
        },
        "MAX_RES": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) filter"
        },
        "MIN_RES": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Effect RES) filter"
        },
        "MAX_BE": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) filter"
        },
        "MIN_BE": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Break Effect) filter"
        },
        "MAX_ERR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) filter"
        },
        "MIN_ERR": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) $t(common:Stats.Energy Regeneration Rate) filter"
        },
        "MAX_EHP": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) EHP filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) EHP may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) EHP filter"
        },
        "MIN_EHP": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) EHP filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) EHP may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) EHP filter"
        },
        "MAX_BASIC": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Basic filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) basic attack damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Basic filter"
        },
        "MIN_BASIC": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Basic filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) basic attack damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Basic filter"
        },
        "MAX_SKILL": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Skill filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) skill damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Skill filter"
        },
        "MIN_SKILL": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Skill filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) skill damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Skill filter"
        },
        "MAX_ULT": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) ULT filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) ultimate damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) ULT filter"
        },
        "MIN_ULT": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) ULT filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) ultimate damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) ULT filter"
        },
        "MAX_FUA": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) FUA filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) follow-up attack damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) FUA filter"
        },
        "MIN_FUA": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) FUA filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) follow-up attack damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) FUA filter"
        },
        "MAX_DOT": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) DOT filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) DOT damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) DOT filter"
        },
        "MIN_DOT": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) DOT filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) DOT damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) DOT filter"
        },
        "MAX_BREAK": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Break filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) break damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Break filter"
        },
        "MIN_BREAK": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Break filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) break damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Break filter"
        },
        "MAX_COMBO": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Combo filter",
          "Description": "$t(common:Maximum, {\"capitalizeLength\": 1}) combo damage may be too low",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Maximum, {\"capitalizeLength\": 1}) Combo filter"
        },
        "MIN_COMBO": {
          "SuccessMessage": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Combo filter",
          "Description": "$t(common:Minimum, {\"capitalizeLength\": 1}) combo damage may be too high",
          "ButtonText": "$t(common:Reset, {\"capitalizeLength\": 1}) $t(common:Minimum, {\"capitalizeLength\": 1}) Combo filter"
        }
      }
    },
    "ManyPerms": {
      "Title": "Very large search requested",
      "Text": "This optimization search will take a substantial amount of time to finish. You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats, or use the Substat weight filter to reduce the number of permutations.",
      "Cancel": "Cancel search",
      "Proceed": "Proceed with search"
    },
    "EditCharacter": {
      "EidolonButton": "$t(common:EidolonNShort, {\"eidolon\":{{eidolon}} })",
      "SuperimpositionButton": "$t(common:SuperimpositionNShort, {\"superimposition\":{{superimposition}} })",
      "Character": "$t(common:Character, {\"count\": 1, \"capitalizeLength\": 1})",
      "Lightcone": "$t(common:Lightcone, {\"count\": 1, \"capitalizeLength\": 1})",
      "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
      "Save": "$t(common:Save, {\"capitalizeLength\": 1})"
    },
    "Relic": {
      "Part": "Part",
      "Wearer": "Equipped by",
      "Set": "Set",
      "Enhance": "Enhance / Grade",
      "Mainstat": "Main stat",
      "Substat": "Substats",
      "Upgrades": "Substat upgrades",
      "Messages": {
        "SubmitFail": "Submit failed!",
        "EditSuccess": "Successfully edited relic",
        "Error": {
          "PartMissing": "Part field is missing",
          "MainstatMissing": "Main stat is missing",
          "SetMissing": "Set field is missing",
          "EnhanceMissing": "Enhance field is missing",
          "GradeMissing": "Grade field is missing",
          "EnhanceInvalid": "Enhance value is invalid",
          "GradeInvalid": "Grade value is invalid",
          "EnhanceTooHigh": "Enhance value is too high for this grade",
          "SetInvalid": "Set value is invalid",
          "SetNotOrnament": "The selected set is not an ornament set",
          "SetNotRelic": "The selected set is not a relic set",
          "SubNInvalid": "Substat {{number}} is invalid",
          "SubsOutOfOrder": "Substats are out of order",
          "DuplicateSubs": "Duplicate substats, only one of each type is allowed",
          "MainAsSub": "Substat type is the same as the main stat",
          "SubTooBig": "Substat value is too big",
          "MainTooBig": "Main stat value is too big",
          "SubTooSmall": "Substat values should be positive",
          "MainTooSmall": "Main stat values should be positive"
        }
      }
    },
    "EditImage": {
      "DefaultTitle": "Edit image",
      "Upload": {
        "Title": "Provide image",
        "Radio": {
          "Upload": "Upload image",
          "Url": "Enter image URL",
          "Default": "Use default image"
        },
        "Upload": {
          "Method": "Click or drag image file to this area to upload",
          "Limit": "Accepts .jpg .jpeg .png .gif (Max: 20MB)"
        },
        "Url": {
          "Label": "Image",
          "Rule": "Please input a valid image URL"
        }
      },
      "Edit": {
        "Title": "Crop image",
        "Zoom": "Zoom",
        "Drag": "Drag to move",
        "Pinch": "Pinch or scroll to zoom",
        "ArtBy": "(Optional) Art by:",
        "CreditPlaceholder": "Credit the artist if possible"
      },
      "Footer": {
        "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "Change": "Change image",
        "Previous": "Previous",
        "Next": "Next",
        "Submit": "$t(common:Submit, {\"capitalizeLength\": 1})"
      }
    },
    "SaveBuild": {
      "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
      "Save": "$t(common:Save, {\"capitalizeLength\": 1})",
      "Label": "Build name",
      "Rule": "Please input a name"
    },
    "SwitchRelics": {
      "Title": "Switch relics with character",
      "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
      "Save": "$t(common:Save, {\"capitalizeLength\": 1})"
    },
    "Builds": {
      "DeleteAll": "Delete All",
      "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
      "Equip": "Equip",
      "Score": "$t(common:Score, {\"capitalizeLength\": 1})",
      "ConfirmModal": {
        "ConfirmButton": "$t(common:Confirm, {\"capitalizeLength\": 1})",
        "CancelButton": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "Title": "$t(common:Confirm, {\"capitalizeLength\": 1})"
      },
      "ConfirmEquip": {
        "Content": "Equipping this will unequip characters that use the relics in this build",
        "SuccessMessage": "Successfully equipped build: {{buildName}}"
      },
      "ConfirmDelete": {
        "DeleteAll": "Are you sure you want to delete all builds?",
        "DeleteSingle": "Are you sure you want to delete {{name}}?",
        "SuccessMessageAll": "Successfully deleted all builds for {{characterName}}",
        "SuccessMessageSingle": "Successfully deleted build: {{name}}"
      },
      "NoBuilds": {
        "Ok": "$t(common:Ok, {\"capitalizeLength\": 1})",
        "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "NoneSaved": "No saved builds"
      }
    },
    "ScoreFooter": {
      "ModalTitle": "Combat sim scoring settings",
      "ResetButtonText": "Reset custom team to default",
      "ResetSuccessMsg": "Reset to default teams",
      "SyncButtonText": "Sync imported eidolons / light cones",
      "SyncSuccessMsg": "Synced teammates",
      "TeamOptions": {
        "Default": "Default",
        "Custom": "Custom"
      }
    },
    "CharacterSelect": {
      "MultiSelect": {
        "Placeholder": "Customize characters",
        "MaxTagPlaceholderSome": "{{count}} characters excluded",
        "MaxTagPlaceholderNone": "All characters enabled",
        "ModalTitle": "Select characters to exclude"
      },
      "SingleSelect": {
        "Placeholder": "$t(common:Character, {\"count\": 1, \"capitalizeLength\": 1})",
        "ModalTitle": "Select a $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0})"
      },
      "SearchPlaceholder": "Search $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) name",
      "ExcludeButton": "Exclude all",
      "ClearButton": "Clear"
    },
    "LightconeSelect": {
      "Placeholder": "$t(common:Lightcone, {\"count\": 1, \"capitalizeLength\": 1})",
      "Title": "Select a $t(common:Lightcone, {\"count\": 1, \"capitalizeLength\": 0})"
    }
  },
  "notifications": {
    "GPU": {
      "Message": "WebGPU is not supported on this browser!",
      "Description": {
        "l1": "Please use one of the following supported environments in order to enable GPU acceleration:",
        "l2": "Windows & Mac — Chrome, Opera, Edge",
        "l3": "Linux — <CustomLink text=\"Behind a flag\"/>",
        "l4": "If you're on one of the supported browsers and it doesn't work, try another browser, or try switching your browser to use your dedicated graphics card instead of integrated."
      }
    },
    "Changelog": {
      "View": "View changelog",
      "Dismiss": "Dismiss",
      "Message": "New updates!",
      "Description": "Check out the changelog for the latest optimizer updates."
    }
  },
  "optimizerTab": {
    "CharacterSelector": {
      "Character": "Character",
      "Lightcone": "Light cone",
      "Presets": "Presets",
      "Target": "Optimization target",
      "ResultsPlaceholder": "Find top results",
      "TargetPlaceholder": "Sorted by",
      "EidolonPlaceholder": "E",
      "SuperimpositionPlaceholder": "S"
    },
    "LightconePassives": "Light cone passives",
    "CharacterPassives": "Character passives",
    "NoConditionals": "No conditional passives",
    "NoTeamConditionals": "No conditional team passives",
    "ResultLimitN": "Find top {{limit}} results",
    "MainStats": "Main stats",
    "Sets": "Sets",
    "SortOptions": {
      "DMGLabel": "Damage calculations",
      "StatLabel": "Stats",
      "COMBO": "Sorted by Combo DMG",
      "BASIC": "Sorted by Basic DMG",
      "SKILL": "Sorted by Skill DMG",
      "ULT": "Sorted by Ult DMG",
      "FUA": "Sorted by Follow-up DMG",
      "DOT": "Sorted by DoT DMG",
      "BREAK": "Sorted by Break DMG",
      "HP": "Sorted by $t(common:ReadableStats.HP)",
      "ATK": "Sorted by $t(common:ReadableStats.ATK)",
      "DEF": "Sorted by $t(common:ReadableStats.DEF)",
      "SPD": "Sorted by $t(common:ReadableStats.SPD)",
      "CR": "Sorted by $t(common:ReadableStats.CRIT Rate)",
      "CD": "Sorted by $t(common:ReadableStats.CRIT DMG)",
      "EHR": "Sorted by $t(common:ReadableStats.Effect Hit Rate)",
      "RES": "Sorted by $t(common:ReadableStats.Effect RES)",
      "BE": "Sorted by $t(common:ReadableStats.Break Effect)",
      "OHB": "Sorted by $t(common:ReadableStats.Outgoing Healing Boost)",
      "ERR": "Sorted by $t(common:ReadableStats.Energy Regeneration Rate)",
      "DMG": "Sorted by Elemental DMG",
      "EHP": "Sorted by Effective HP"
    },
    "OptimizerOptions": {
      "Header": "Optimizer options",
      "PriorityFilter": "Character priority filter",
      "Priority": {
        "Header": "Priority",
        "Label": "# {{rank}} - $t(common:Characters.{{id}}.Name)",
        "Name": "# {{rank}}"
      },
      "AllowEquipped": "Allow equipped relics",
      "KeepCurrent": "Keep current relics",
      "Exclude": "Exclude",
      "MinEnhance": {
        "Header": "Min enhance",
        "Label0": "+0",
        "Label3": "+3",
        "Label6": "+6",
        "Label9": "+9",
        "Label12": "+12",
        "Label15": "+15"
      },
      "MinRarity": {
        "Header": "Min rarity",
        "Label2": "2 ★ +",
        "Label3": "3 ★ +",
        "Label4": "4 ★ +",
        "Label5": "5 ★"
      },
      "BoostMain": {
        "Header": "Boost main stat",
        "Label3": "+3",
        "Label6": "+6",
        "Label9": "+9",
        "Label12": "+12",
        "Label15": "+15"
      }
    },
    "AdvancedOptions": {
      "Header": "Advanced options",
      "EnemyConfigButtonText": "Enemy configurations",
      "CombatBuffsButtonTextNone": "Extra combat buffs ",
      "CombatBuffsButtonText": "Extra combat buffs ({{activeCount}})"
    },
    "Grid": {
      "To": "to",
      "Of": "of",
      "Page": "Page",
      "PageSelectorLabel": "Page Size:",
      "Headers": {
        "Basic": {
          "Set": "Set",
          "ATK": "ATK",
          "DEF": "DEF",
          "HP": "HP",
          "SPD": "SPD",
          "CR": "CR",
          "CD": "CD",
          "EHR": "EHR",
          "RES": "RES",
          "BE": "BE",
          "OHB": "OHB",
          "ERR": "ERR",
          "DMG": "DMG",
          "EHP": "EHP",
          "WEIGHT": "STAT WEIGHT",
          "BASIC": "BASIC\nDMG",
          "SKILL": "SKILL\nDMG",
          "ULT": "ULT\nDMG",
          "FUA": "FUA\nDMG",
          "DOT": "DOT\nDMG",
          "BREAK": "BREAK\nDMG",
          "COMBO": "COMBO\nDMG"
        },
        "Combat": {
          "Set": "Set",
          "ATK": "Σ ATK",
          "DEF": "Σ DEF",
          "HP": "Σ HP",
          "SPD": "Σ SPD",
          "CR": "Σ CR",
          "CD": "Σ CD",
          "EHR": "Σ EHR",
          "RES": "Σ RES",
          "BE": "Σ BE",
          "OHB": "Σ OHB",
          "ERR": "Σ ERR",
          "DMG": "Σ DMG",
          "EHP": "EHP",
          "WEIGHT": "STAT WEIGHT",
          "BASIC": "BASIC\nDMG",
          "SKILL": "SKILL\nDMG",
          "ULT": "ULT\nDMG",
          "FUA": "FUA\nDMG",
          "DOT": "DOT\nDMG",
          "BREAK": "BREAK\nDMG",
          "COMBO": "COMBO\nDMG"
        }
      }
    },
    "Sidebar": {
      "GPUOptions": {
        "Experimental": "GPU acceleration enabled (experimental)",
        "Stable": "GPU acceleration enabled (stable)",
        "CPU": "CPU only",
        "EngineSwitchSuccessMsg": {
          "CPU": "Switched compute engine to CPU",
          "Stable": "Switched compute engine to GPU (Stable)",
          "Experimental": "Switched compute engine to GPU (Experimental)"
        },
        "Display": {
          "GPU Experimental": "GPU acceleration: Enabled",
          "GPU Stable": "GPU acceleration: Enabled",
          "CPU": "GPU acceleration: Disabled"
        }
      },
      "Pinning": {
        "Messages": {
          "NoneSelected": "No row selected",
          "SimSelected": "Custom simulation rows are not pinnable",
          "AlreadyPinned": "This build is already pinned"
        }
      },
      "Permutations": "Permutations",
      "Perms": "Perms",
      "Searched": "Searched",
      "Results": "Results",
      "ProgressText": {
        "Progress": "Progress",
        "CalculatingETA": "Progress  (calculating ETA..)",
        "TimeRemaining": "{{rate}} / sec — {{timeRemaining}} left",
        "Finished": "{{rate}} / sec — Finished"
      },
      "ControlsGroup": {
        "Header": "Controls",
        "Start": "Start optimizer",
        "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "Reset": "$t(common:Reset, {\"capitalizeLength\": 1})",
        "ResetConfirm": {
          "Title": "Reset all filters?",
          "Description": "All filters will be reset to their default values",
          "Yes": "$t(common:Yes, {\"capitalizeLength\": 1})",
          "No": "$t(common:No, {\"capitalizeLength\": 1})"
        }
      },
      "StatViewGroup": {
        "Header": "Stat and filter view",
        "CombatStats": "Combat stats",
        "BasicStats": "Basic stats"
      },
      "ResultsGroup": {
        "Header": "Results",
        "Equip": "Equip",
        "Filter": "Filter",
        "Pin": "Pin builds",
        "Clear": "Clear pins"
      }
    },
    "TeammateRow": {
      "Header": "Teammates {{teammateCount}}"
    },
    "FormRowLabels": {
      "Character options": "Character options",
      "Relic & stat filters": "Relic & stat filters",
      "Teammates": "Teammates",
      "Character custom stats simulation": "Character custom stats simulation"
    },
    "SetConditionals": {
      "Title": "Conditional set effects",
      "DescriptionHeader": "Set description",
      "EffectHeader": "Enabled effect",
      "SetName": "$t(gameData:RelicSets.{{id}}.Name)",
      "RelicDescription": "$t(gameData:RelicSets.{{id}}.Description4pc)",
      "PlanarDescription": "$t(gameData:RelicSets.{{id}}.Description2pc)",
      "SelectOptions": {
        "Streetwise": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% ATK)"
        },
        "Wastelander": {
          "Off": {
            "Display": "Off",
            "Label": "Off"
          },
          "Debuffed": {
            "Display": "CR",
            "Label": "Debuffed (+10% CR)"
          },
          "Imprisoned": {
            "Display": "CR + CD",
            "Label": "Imprisoned (+10% CR | +20% CD)"
          }
        },
        "Longevous": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% CR)"
        },
        "Ashblazing": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% ATK)"
        },
        "Prisoner": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% DEF ignore)"
        },
        "Diver": {
          "Off": {
            "Display": "0x",
            "Label": "0 debuffs (+4% base CR)"
          },
          "1Debuff": {
            "Display": "1x",
            "Label": "1 debuff (+12% DMG | +4% base CR)"
          },
          "2Debuff": {
            "Display": "2x",
            "Label": "2 debuffs (+12% DMG | +4% base CR | +8% CD)"
          },
          "3Debuff": {
            "Display": "3x",
            "Label": "3 debuffs (+12% DMG | +4% base CR | +12% CD)"
          },
          "2+Debuff": {
            "Display": "2x+",
            "Label": "2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)"
          },
          "3+Debuff": {
            "Display": "3x+",
            "Label": "3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)"
          }
        },
        "Sigonia": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% CD)"
        },
        "Duran": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% FUA DMG)",
          "Label5": "5 stacks (+25% FUA DMG +25% CD)"
        },
        "Sacerdos": {
          "Display": "{{stackCount}}x",
          "Label": "{{stackCount}} stacks (+{{buffValue}}% CD)"
        }
      },
      "Conditionals": {
        "DefaultMessage": "Enabled by default - effects will apply to combat calculations.",
        "Hunter": "When enabled, CRIT DMG buff is applied to Combat stat calculations.",
        "Streetwise": "The selected ATK% buff is applied to Combat stat calculations based on the number of stacks.",
        "Firesmith": "The Skill DMG increase is always active by default. When enabled, the Fire DMG buff is applied to Combat stat calculations.",
        "Genius": "The 10% DEF pen increase is always active by default. When enabled, treats the enemy as having Quantum Weakness and penetrates 10% more DEF.",
        "Thunder": "When enabled, ATK% buff is applied to Combat stat calculations.",
        "Wastelander": "Applies the selected buffs to Combat stat calculations.",
        "Longevous": "The selected CR buff is applied to Combat stat calculations based on the number of stacks.",
        "Messenger": "When enabled, SPD% buff is applied to Combat stat calculations.",
        "Ashblazing": "The selected ATK% buff is applied to all calculations except for Follow-up attacks. Follow-up attack calculations instead will start at 0% ATK buff and stack up based on the number of hits performed by the attack. Hits will increase based on the enemy count and assumes the target is positioned in the center for blast / aoe attacks.",
        "Prisoner": "The selected DEF% pen buff is applied to damage calculations based on the number of stacks.",
        "Diver": "The 2 piece effect can be disabled by selecting the 0x option. For 4 piece, different CRIT buffs are applied to Combat stat calculations depending on the selected option.",
        "Watchmaker": "When enabled, the Break Effect buff is applied to Combat stat calculations.",
        "Valorous": "The CRIT Rate buff is always on by default. The selected buff is applied to damage calculations based on the number of stacks.",
        "Differentiator": "When enabled, the CRIT Rate buff is applied to Combat stat calculations.",
        "Sigonia": "The selected CRIT DMG buff is applied to Combat stat calculations, assuming the character has defeated that number of enemies.",
        "Izumo": "When enabled, assumes there is another ally with the same path, and applies the 12% CRIT Rate buff to Combat stat calculations.",
        "Duran": "The selected buff is applied to damage calculations based on the number of stacks.",
        "Kalpagni": "When enabled, applies the Break Effect buff to combat stat calculations.",
        "Lushaka": "The selected buff is applied to damage calculations.",
        "Banana": "The selected buff is applied to damage calculations.",
        "Sacerdos": "The selected buff is applied to damage calculations. Characters who buff themselves can trigger this effect."
      }
    },
    "Presets": {
      "SpdValues": {
        "SPD0": "No minimum speed",
        "SPD111": "111.112 SPD - 5 actions in first four cycles",
        "SPD114": "114.286 SPD - 4 actions in first three cycles",
        "SPD120": "120.000 SPD - 3 actions in first two cycles",
        "SPD133": "133.334 SPD - 2 actions in first cycle, 6 actions in first four cycles",
        "SPD142": "142.858 SPD - 5 actions in first three cycles",
        "SPD155": "155.556 SPD - 7 actions in first four cycles",
        "SPD160": "160.000 SPD - 4 actions in first two cycles",
        "SPD171": "171.429 SPD - 6 actions in first three cycles",
        "SPD177": "177.778 SPD - 8 actions in first four cycles",
        "SPD200": "200.000 SPD - 3 actions in first cycle"
      },
      "StandardLabel": "Standard $t(gameData:Characters.{{id}}.Name)",
      "RecommendedPresets": "Recommended presets",
      "PresetNotAvailable": "Preset not available, please select another option"
    },
    "CombatBuffs": {
      "ATK": "ATK",
      "ATK_P": "ATK %",
      "HP": "HP",
      "HP_P": "HP %",
      "DEF": "DEF",
      "DEF_P": "DEF %",
      "CR": "Crit Rate %",
      "CD": "Crit Dmg %",
      "SPD": "SPD",
      "SPD_P": "SPD %",
      "BE": "BE %",
      "DMG_BOOST": "Dmg Boost %",
      "DEF_PEN": "Def Pen %",
      "RES_PEN": "Dmg RES PEN %",
      "EFFECT_RES_PEN": "Effect RES PEN %",
      "VULNERABILITY": "Vulnerability %",
      "BREAK_EFFICIENCY": "Break Efficiency %",
      "Title": "Extra combat buffs"
    },
    "Target_one": "target",
    "Target_other": "targets",
    "EnemyConfiguration": {
      "LevelOptionLabel": "Lv. {{level}} - {{defense}} DEF",
      "CountOptionLabel": "{{targetCount}} $t(optimizerTab:Target, {\"count\": {{targetCount}}})",
      "EffResOptionLabel": "{{resistance}}% Effect RES",
      "DmgResOptionLabel": "{{resistance}}% Damage RES",
      "ToughnessOptionLabel": "{{toughness}} max toughness",
      "Title": "Enemy configurations",
      "StatHeader": "Enemy stat options",
      "WeaknessLabel": "Elemental weakness",
      "BrokenLabel": "Weakness broken"
    },
    "WeightFilter": {
      "WeightFilterHeader": "Substat weight filter",
      "RollFilterHeader": "Weighted rolls per relic",
      "HPFilterText": "HP",
      "ATKFilterText": "ATK",
      "DEFFilterText": "DEF",
      "SPDFilterText": "SPD",
      "CRFilterText": "CR",
      "CDFilterText": "CD",
      "EHRFilterText": "EHR",
      "RESFilterText": "RES",
      "BEFilterText": "BE"
    },
    "MinMaxFilters": {
      "StatHeader": "Stat min / max filters",
      "RatingHeader": "Rating min / max filters",
      "HPLabel": "HP",
      "ATKLabel": "ATK",
      "DEFLabel": "DEF",
      "SPDLabel": "SPD",
      "CRLabel": "CR",
      "CDLabel": "CD",
      "EHRLabel": "EHR",
      "RESLabel": "RES",
      "BELabel": "BE",
      "ERRLabel": "ERR",
      "WEIGHTLabel": "WEIGHT",
      "EHPLabel": "EHP",
      "BASICLabel": "BASIC",
      "SKILLLabel": "SKILL",
      "ULTLabel": "ULT",
      "FUALabel": "FUA",
      "DOTLabel": "DOT",
      "BREAKLabel": "BREAK",
      "COMBOLabel": "COMBO"
    },
    "ComboFilter": {
      "Header": "Combo DMG calculation",
      "BASIC": "Basic DMG",
      "SKILL": "Skill DMG",
      "ULT": "Ult DMG",
      "FUA": "Fua DMG",
      "DOT": "Dot DMG",
      "BREAK": "Break DMG"
    },
    "TeammateCard": {
      "EidolonN": "$t(common:EidolonNShort, {\"eidolon\": {{eidolon}}})",
      "SuperimpositionN": "$t(common:SuperimpositionNShort, {\"superimposition\": {{superimposition}}})",
      "EidolonPlaceholder": "Eidolon",
      "SuperimpositionPlaceholder": "Superimposition",
      "RelicsPlaceholder": "Relics",
      "OrnamentsPlaceholder": "Ornaments",
      "TeammateSyncSuccessMessage": "Synced teammate info",
      "TeammateSets": {
        "Messenger": {
          "Desc": "4 Piece: $t(gameData:RelicSets.114.Name) (+12% SPD)",
          "Set": "$t(gameData:RelicSets.114.Name)",
          "Text": "12% SPD"
        },
        "Watchmaker": {
          "Desc": "4 Piece: $t(gameData:RelicSets.118.Name) (+30% BE)",
          "Set": "$t(gameData:RelicSets.118.Name)",
          "Text": "30% BE"
        },
        "Sacerdos1Stack": {
          "Desc": "4 Piece: $t(gameData:RelicSets.121.Name) (+18% CD)",
          "Set": "$t(gameData:RelicSets.121.Name)",
          "Text": "18% CD"
        },
        "Sacerdos2Stack": {
          "Desc": "4 Piece: $t(gameData:RelicSets.121.Name) (+36% CD)",
          "Set": "$t(gameData:RelicSets.121.Name)",
          "Text": "36% CD"
        },
        "Keel": {
          "Desc": "$t(gameData:RelicSets.310.Name) (+10% CD)",
          "Set": "$t(gameData:RelicSets.310.Name)",
          "Text": "10% CD"
        },
        "Ageless": {
          "Desc": "$t(gameData:RelicSets.302.Name) (+8% ATK)",
          "Set": "$t(gameData:RelicSets.302.Name)",
          "Text": "8% ATK"
        },
        "Penacony": {
          "Desc": "$t(gameData:RelicSets.312.Name) (+10% DMG for same element)",
          "Set": "$t(gameData:RelicSets.312.Name)",
          "Text": "10% DMG"
        },
        "Lushaka": {
          "Desc": "$t(gameData:RelicSets.317.Name) (+12% ATK)",
          "Set": "$t(gameData:RelicSets.317.Name)",
          "Text": "12% ATK"
        }
      }
    },
    "StatSimulation": {
      "DuplicateSimMessage": "Identical stat simulation already exists",
      "MissingMainstatsMessage": "Missing simulation main stats",
      "BuildAlreadyImported": "The selected optimizer build is already a simulation",
      "NothingToImport": "Run the optimizer first, then select a row from the optimizer results to import",
      "NoStatSimulations": "No custom stat simulations selected",
      "RelicSetPlaceholder": "Relic set",
      "OrnamentSetPlaceholder": "Ornament set",
      "TotalRolls": "Total rolls",
      "SubstatSelectorLabel": "$t(common:Stats.{{stat}})",
      "ModeSelector": {
        "Off": "Off",
        "RollCount": "Simulate custom substat rolls",
        "Totals": "Simulate custom substat totals"
      },
      "FooterLabels": {
        "Simulate": "Simulate builds",
        "Import": "Import optimizer build",
        "Conditionals": "Conditional set effects"
      },
      "DeletePopup": {
        "Title": "Erase stat simulations",
        "Description": "Are you sure you want to clear all of this character's saved simulations?",
        "OkText": "Yes",
        "CancelText": "Cancel"
      },
      "SimulationNamePlaceholder": "Simulation name (Optional)",
      "OptionsHeader": "Options",
      "RollsHeader": "Substat max rolls",
      "TotalsHeader": "Substat value totals",
      "MainStatsSelection": {
        "Header": "Main stats",
        "BodyPlaceholder": "Body",
        "FeetPlaceholder": "Feet",
        "SpherePlaceholder": "Sphere",
        "RopePlaceholder": "Rope",
        "ShortStat": "$t(common:ShortReadableStats.{{stat}})",
        "LabelStat": "$t(common:ReadableStats.{{stat}})"
      }
    }
  },
  "relicScorerTab": {
    "Messages": {
      "ThrottleWarning": "Please wait {{seconds}} seconds before retrying",
      "InvalidIdWarning": "Invalid ID",
      "IdLoadError": "Error loading ID",
      "SuccessMsg": "Successfully loaded profile",
      "LookupError": "Error during lookup, please try again in a bit",
      "NoCharacterSelected": "No selected character",
      "CharacterAlreadyExists": "Selected character already exists",
      "UnknownButtonClicked": "Unknown button clicked"
    },
    "Header": {
      "DowntimeWarning": "The relic scorer may be down for maintenance after the {{game_version}} patch, please try again later",
      "WithVersion": "Enter your account UID to score your profile characters at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}})",
      "WithoutVersion": "Enter your account UID to score your profile characters at level 80 & maxed traces. Log out to refresh instantly."
    },
    "SubmissionBar": {
      "Placeholder": "Account UID",
      "ButtonText": "$t(common:Submit, {\"capitalizeLength\": 1})",
      "AlgorithmButton": "Scoring algorithm"
    },
    "CopyScreenshot": "Copy screenshot",
    "ImportLabels": {
      "Relics": "Import relics into optimizer",
      "SingleCharacter": "Import selected character & all relics into optimizer",
      "AllCharacters": "Import all characters & all relics into optimizer"
    },
    "SimulateRelics": "Simulate relics on another character",
    "OptimizeOnCharacter": "Optimize character stats"
  },
  "relicsTab": {
    "RelicFilterBar": {
      "Part": "Part",
      "Enhance": "Enhance",
      "Grade": "Grade",
      "Verified": "Verified",
      "Equipped": "Equipped",
      "Clear": "Clear",
      "ClearButton": "Clear all filters",
      "Set": "Set",
      "Mainstat": "Main stats",
      "Substat": "Substats",
      "ReapplyButton": "Reapply scores",
      "ScoringButton": "Scoring algorithm",
      "RecommendationHeader": "Relic recommendation character",
      "Rating": "Relic ratings",
      "CustomCharsHeader": "Custom potential characters"
    },
    "Messages": {
      "AddRelicSuccess": "Successfully added relic",
      "NoRelicSelected": "No relic selected",
      "DeleteRelicSuccess": "Successfully deleted relic"
    },
    "RelicGrid": {
      "To": "to",
      "Of": "of",
      "Headers": {
        "EquippedBy": "Owner",
        "Set": "Set",
        "Grade": "Grade",
        "Part": "Part",
        "Enhance": "Enhance",
        "MainStat": "Main\nStat",
        "MainValue": "Main\nValue",
        "HPP": "HP %",
        "ATKP": "ATK %",
        "DEFP": "DEF %",
        "HP": "HP",
        "ATK": "ATK",
        "DEF": "DEF",
        "SPD": "SPD",
        "CR": "Crit\nRate",
        "CD": "Crit\nDMG",
        "EHR": "Effect\nHit Rate",
        "RES": "Effect\nRES",
        "BE": "Break\nEffect",
        "CV": "Crit\nValue"
      },
      "ValueColumns": {
        "SelectedCharacter": {
          "Label": "Selected character",
          "ScoreCol": {
            "Label": "Selected character: Score",
            "Header": "Selected Char\nScore"
          },
          "AvgPotCol": {
            "Label": "Selected character: Average potential",
            "Header": "Selected Char\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "Selected character: Max potential",
            "Header": "Selected Char\nMax Potential"
          }
        },
        "CustomCharacters": {
          "Label": "Custom characters",
          "AvgPotCol": {
            "Label": "Custom characters: Average potential",
            "Header": "Custom Chars\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "Custom$characters: Max potential",
            "Header": "Custom Chars\nMax Potential"
          }
        },
        "AllCharacters": {
          "Label": "All characters",
          "AvgPotCol": {
            "Label": "All characters: Average potential",
            "Header": "All Chars\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "All characters: Max potential",
            "Header": "All Chars\nMax Potential"
          }
        },
        "ComingSoon": {
          "Label": "Coming soon",
          "SetsPotential": {
            "Label": "$Relic / Ornament sets potential",
            "Header": "All Chars\nMax Potential + Sets"
          }
        }
      }
    },
    "Toolbar": {
      "RelicLocator": {
        "Width": "Inventory width",
        "Filter": "Auto filter rows",
        "NoneSelected": "Select a relic to locate",
        "Location": "Location - Row {{rowIndex}} / Col {{columnIndex}}"
      },
      "InsightOptions": {
        "Buckets": "Relic Insight: Buckets",
        "Top10": "Relic Insight: Top 10"
      },
      "PlotOptions": {
        "PlotAll": "Show all characters",
        "PlotCustom": "Show custom characters"
      },
      "EditRelic": "Edit relic",
      "DeleteRelic": {
        "ButtonText": "Delete relic",
        "Warning_one": "Delete the selected relic?",
        "Warning_other": "Delete the selected {{count}} relics?"
      },
      "AddRelic": "Add New Relic"
    },
    "RelicInsights": {
      "NewStats": "New stats: ",
      "UpgradedStats": "Upgraded stats: "
    }
  },
  "settings": {
    "Title": "Settings",
    "RelicEquippingBehaviour": {
      "Label": "Equipping relics from another character",
      "Replace": "Default: Replace relics without swapping",
      "Swap": "Swap relics with previous owner"
    },
    "PermutationSidebarBehaviour": {
      "Label": "Shrink optimizer sidebar on smaller screens",
      "XL": "Default: Minimize if most of the sidebar is hidden",
      "XXL": "Minimize if any of the sidebar is hidden",
      "NoShow": "Always keep the sidebar on the right"
    },
    "RelicPotentialLoadBehaviour": {
      "Label": "Relic potential scoring on load",
      "OnStartup": "Default: Automatically score relics on page load",
      "Manual": "Only score relics when \"Reapply scores\" is clicked (faster page load)"
    }
  },
  "sidebar": {
    "Showcase": {
      "Title": "Showcase",
      "Scorer": "Relic Scorer"
    },
    "Optimization": {
      "Title": "Optimization",
      "Optimizer": "Optimizer",
      "Relics": "$t(common:Relic, {\"count\": 2000, \"capitalizeLength\": 1})",
      "Characters": "$t(common:Character, {\"count\": 23, \"capitalizeLength\": 1})",
      "Import": "Import / Save",
      "Settings": "Settings",
      "Start": "Get Started"
    },
    "Links": {
      "Title": "Links",
      "Changelog": "Changelog",
      "Discord": "Discord",
      "Github": "GitHub",
      "Kofi": "Ko-fi",
      "Unleak": "No leaks"
    }
  }
}

export default Resources;
