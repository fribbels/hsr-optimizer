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
        "Name": "March 7th"
      },
      "1002": {
        "Name": "Dan Heng"
      },
      "1003": {
        "Name": "Himeko"
      },
      "1004": {
        "Name": "Welt"
      },
      "1005": {
        "Name": "Kafka"
      },
      "1006": {
        "Name": "Silver Wolf"
      },
      "1008": {
        "Name": "Arlan"
      },
      "1009": {
        "Name": "Asta"
      },
      "1013": {
        "Name": "Herta"
      },
      "1101": {
        "Name": "Bronya"
      },
      "1102": {
        "Name": "Seele"
      },
      "1103": {
        "Name": "Serval"
      },
      "1104": {
        "Name": "Gepard"
      },
      "1105": {
        "Name": "Natasha"
      },
      "1106": {
        "Name": "Pela"
      },
      "1107": {
        "Name": "Clara"
      },
      "1108": {
        "Name": "Sampo"
      },
      "1109": {
        "Name": "Hook"
      },
      "1110": {
        "Name": "Lynx"
      },
      "1111": {
        "Name": "Luka"
      },
      "1112": {
        "Name": "Topaz & Numby"
      },
      "1201": {
        "Name": "Qingque"
      },
      "1202": {
        "Name": "Tingyun"
      },
      "1203": {
        "Name": "Luocha"
      },
      "1204": {
        "Name": "Jing Yuan"
      },
      "1205": {
        "Name": "Blade"
      },
      "1206": {
        "Name": "Sushang"
      },
      "1207": {
        "Name": "Yukong"
      },
      "1208": {
        "Name": "Fu Xuan"
      },
      "1209": {
        "Name": "Yanqing"
      },
      "1210": {
        "Name": "Guinaifen"
      },
      "1211": {
        "Name": "Bailu"
      },
      "1212": {
        "Name": "Jingliu"
      },
      "1213": {
        "Name": "Imbibitor Lunae"
      },
      "1214": {
        "Name": "Xueyi"
      },
      "1215": {
        "Name": "Hanya"
      },
      "1217": {
        "Name": "Huohuo"
      },
      "1218": {
        "Name": "Jiaoqiu"
      },
      "1220": {
        "Name": "Feixiao"
      },
      "1221": {
        "Name": "Yunli"
      },
      "1222": {
        "Name": "Lingsha"
      },
      "1223": {
        "Name": "Moze"
      },
      "1224": {
        "Name": "March 7th"
      },
      "1225": {
        "Name": "Fugue"
      },
      "1301": {
        "Name": "Gallagher"
      },
      "1302": {
        "Name": "Argenti"
      },
      "1303": {
        "Name": "Ruan Mei"
      },
      "1304": {
        "Name": "Aventurine"
      },
      "1305": {
        "Name": "Dr. Ratio"
      },
      "1306": {
        "Name": "Sparkle"
      },
      "1307": {
        "Name": "Black Swan"
      },
      "1308": {
        "Name": "Acheron"
      },
      "1309": {
        "Name": "Robin"
      },
      "1310": {
        "Name": "Firefly"
      },
      "1312": {
        "Name": "Misha"
      },
      "1313": {
        "Name": "Sunday"
      },
      "1314": {
        "Name": "Jade"
      },
      "1315": {
        "Name": "Boothill"
      },
      "1317": {
        "Name": "Rappa"
      },
      "8001": {
        "Name": "Caelus (Destruction)"
      },
      "8002": {
        "Name": "Stelle (Destruction)"
      },
      "8003": {
        "Name": "Caelus (Preservation)"
      },
      "8004": {
        "Name": "Stelle (Preservation)"
      },
      "8005": {
        "Name": "Caelus (Harmony)"
      },
      "8006": {
        "Name": "Stelle (Harmony)"
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
        "Description2pc": "<span>Increases the wearer's ATK by <span style='whiteSpace: \"nowrap\"'>12%</span>. When entering battle, if at least one teammate follows the same Path as the wearer, then the wearer's CRIT Rate increases by <span style='whiteSpace: \"nowrap\"'>12%</span>.</span>"
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
      "23034": {
        "Name": "A Grounded Ascent",
        "SkillName": "Departing Anew"
      },
      "23035": {
        "Name": "Long Road Leads Home",
        "SkillName": "Rebirth"
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
