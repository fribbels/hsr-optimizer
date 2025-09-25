interface Resources {
  "benchmarksTab": {
    "Title": "Benchmark Generator",
    "LeftPanel": {
      "Header": "Benchmark"
    },
    "MiddlePanel": {
      "CharacterHeader": "Character",
      "LCHeader": "Light Cone",
      "TeammatesHeader": "Teammates"
    },
    "RightPanel": {
      "Settings": {
        "Header": "Settings",
        "SPD": "Benchmark basic SPD",
        "ERR": "Energy regen rope",
        "SubDPS": "Sub DPS"
      },
      "SetsHeader": "Benchmark sets",
      "ButtonText": {
        "Generate": "Generate benchmarks",
        "Clear": "Clear"
      }
    },
    "ResultsGrid": {
      "Combo": "Combo DMG",
      "Delta": "Delta",
      "Sets": "Sets"
    },
    "ResultsTabs": {
      "WithSpeed": {
        "100": "100% Benchmark Builds ({{Speed}} SPD)",
        "200": "200% Benchmark Builds ({{Speed}} SPD)"
      },
      "WithoutSpeed": {
        "100": "100% Benchmark Builds",
        "200": "200% Benchmark Builds"
      }
    },
    "ResultsPanel": {
      "BasicStats": "Basic Stats",
      "CombatStats": "Combat Stats",
      "Rolls": "Substat Rolls",
      "Combo": "Combo Rotation",
      "Damage": "Ability Damage"
    },
    "Messages": {
      "Error": {
        "MissingField": "Missing character/lightcone/teammates",
        "UnsupportedCharacter": "DPS benchmarks are not supported for this character",
        "SPDUnselected": "Select the target benchmark basic SPD"
      }
    }
  },
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
    "SearchPlaceholder": "Search",
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
      "DeleteWarning": "Are you sure you want to delete $t(gameData:Characters.{{charId}}.Name)?",
      "BuildAlreadyExists": "Build name {{name}} already exists",
      "ImageUploadFailed": "Image upload failed",
      "InvalidFile": "File is not a valid image file"
    },
    "CharacterPreview": {
      "ScoringSidebar": {
        "Stats": {
          "Header": "Stats",
          "ButtonText": "Traces"
        },
        "SpdPrecision": {
          "Header": "SPD precision",
          "Low": ".0",
          "High": ".000"
        },
        "SpdWeight": {
          "Header": "SPD weight",
          "Max": "100%",
          "Min": "0%"
        },
        "BenchmarkSpd": {
          "Header": "SPD benchmark",
          "BenchmarkOptionsLabel": "Benchmark options",
          "CurrentSpdLabel": "Current SPD - The benchmark will match your basic SPD",
          "BaseSpdLabel": "Base SPD - The benchmark will target a minimal SPD build",
          "CommonBreakpointsLabel": "Common SPD breakpoint presets (SPD buffs considered separately)"
        },
        "BuffPriority": {
          "Header": "DPS mode",
          "High": "Main",
          "Low": "Sub"
        }
      },
      "CustomizationSidebar": {
        "Label": "Customization",
        "Modes": {
          "Auto": "Auto",
          "Custom": "Custom",
          "Standard": "Standard"
        },
        "PaletteLabel": "Portrait color palette",
        "ShowUID": "Show UID"
      },
      "ArtBy": "Art by {{artistName}}",
      "EditCharacter": "Edit character",
      "EditPortrait": "Edit portrait",
      "CharacterScore": "Character Score: {{score}} {{grade}}",
      "Messages": {
        "AddedRelic": "Successfully added relic",
        "SavedPortrait": "Successfully saved portrait",
        "RevertedPortrait": "Successfully reverted portrait",
        "NoSelectedCharacter": "No selected character",
        "NoSelectedLightCone": "No Selected light cone"
      },
      "ScoreHeader": {
        "Title": "Combat Sim",
        "TitleBenchmark": "{{spd}} SPD Benchmark",
        "Score": "DPS Score {{score}}% {{grade}}"
      },
      "AlgorithmSlider": {
        "Title": "Scoring algorithm:",
        "Labels": {
          "CombatScore": "Combat Score",
          "CombatScoreTBD": "Combat (TBD)",
          "StatScore": "Stat Score",
          "NoneScore": "None"
        }
      },
      "DetailsSlider": {
        "Labels": {
          "CombatStats": "Combat Stats",
          "SubDpsCombatStats": "Combat Stats (Sub DPS)"
        }
      },
      "DMGUpgrades": "Damage Upgrades",
      "SubstatUpgradeComparisons": {
        "Header": "Substat upgrade comparisons",
        "MainStatHeader": "Main stat upgrade comparisons",
        "AddedRoll": "+1x roll {{stat}}",
        "MainStatUpgrade": "Main Stat Upgrade",
        "SubStatUpgrade": "Substat Upgrade",
        "DpsScorePercentUpgrade": "DPS Score Δ %",
        "UpgradedDpsScore": "Upgraded DPS Score",
        "ComboDmgPercentUpgrade": "Combo DMG Δ %",
        "ComboDmgUpgrade": "Combo DMG Δ"
      },
      "BuildAnalysis": {
        "ScoringNote": "DPS Score rates build quality by comparing an ability rotation's damage to benchmark builds with the same team / lightcones / eidolons. Scores and Combo DMG are measured relative only to the chosen team setup, and should not be compared across different configurations.",
        "RelicRarityHeader": "Relic rarity upgrade comparisons",
        "RelicRarityNote": "Estimated TBP measures the expected farming time in Days and Trailblaze Power required to upgrade each relic based on the character's stat weights.\nThis is a metric of statistical rarity for farming prioritization, and does not reflect nor have an impact on DPS Score and Combo DMG.",
        "Header": "DPS Score Calculations",
        "SimulationTeammates": "Simulation teammates",
        "SimulatedBenchmarks": "Simulated benchmark builds",
        "SimulationSets": "Simulation sets",
        "Rotation": {
          "Header": "Combo damage rotation",
          "BASIC": "BASIC",
          "SKILL": "SKILL",
          "ULT": "ULT",
          "FUA": "FUA",
          "MEMO_SKILL": "SKILLᴹ",
          "MEMO_TALENT": "TALENTᴹ",
          "DOTS": "DOTS:",
          "BREAKS": "BREAKS:"
        },
        "CombatResults": {
          "Header": "Combat damage results",
          "Primary": "Primary ability:",
          "Character": "Character DMG:",
          "Benchmark": "Benchmark DMG:",
          "Baseline": "Baseline DMG:",
          "Maximum": "Maximum DMG:",
          "Score": "DPS score %:",
          "Abilities": {
            "BASIC": "BASIC DMG",
            "SKILL": "SKILL DMG",
            "ULT": "ULT DMG",
            "FUA": "FUA DMG",
            "DOT": "DOT DMG",
            "BREAK": "BREAK DMG",
            "MEMO_SKILL": "SKILLᴹ DMG",
            "MEMO_TALENT": "TALENTᴹ DMG",
            "COMBO": "COMBO DMG"
          }
        },
        "CombatBuffs": {
          "Header": "Combat buffs",
          "SubDpsHeader": "Combat buffs (Sub DPS)"
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
        }
      },
      "ScoringDetails": {
        "Header": "How is DPS Score calculated?"
      },
      "EST-TBP": {
        "Header": "Stat Score Analysis",
        "RollsCard": {
          "Perfection": "Perfection"
        },
        "MetricsCard": {
          "Days": "Days",
          "Rolls": "Weighted Rolls",
          "TBP": "Estimated TBP",
          "Potential": "Reroll Potential"
        }
      }
    }
  },
  "common": {
    "Relic_one": "relic",
    "Relic_other": "relics",
    "RelicWithCount_one": "{{count}} relic",
    "RelicWithCount_other": "{{count}} relics",
    "ThousandsSuffix": "K",
    "Cancel": "Cancel",
    "Confirm": "Confirm",
    "Submit": "Submit",
    "Ok": "Ok",
    "Yes": "Yes",
    "No": "No",
    "Save": "Save",
    "Saved": "Saved",
    "Score": "Score",
    "Reset": "Reset",
    "EidolonNShort": "E{{eidolon}}",
    "SuperimpositionNShort": "S{{superimposition}}",
    "LevelShort": "Lv{{level}}",
    "CharacterWithCount_one": "{{count}} character",
    "CharacterWithCount_other": "{{count}} characters",
    "Character_one": "character",
    "Character_other": "characters",
    "VerifiedRelicHoverText": "Relic substats verified by relic scorer (speed decimals)",
    "Verified4LinerHoverText": "Relic substats and initial roll count verified by relic scorer (accurate speed decimals + 4 initial substats)",
    "CombatStats": "Combat Stats",
    "MemospriteLabel": "{{label}}ᴹ",
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
    "Damage": "DMG",
    "DamagePercent": "DMG %",
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
    "Elements": {
      "Physical": "$t(gameData:Elements.Physical)",
      "Fire": "$t(gameData:Elements.Fire)",
      "Ice": "$t(gameData:Elements.Ice)",
      "Lightning": "$t(gameData:Elements.Thunder)",
      "Wind": "$t(gameData:Elements.Wind)",
      "Quantum": "$t(gameData:Elements.Quantum)",
      "Imaginary": "$t(gameData:Elements.Imaginary)"
    },
    "DMGTypes": {
      "simScore": "Combo DMG",
      "BASIC": "Basic Damage",
      "SKILL": "Skill Damage",
      "ULT": "Ult Damage",
      "FUA": "Fua Damage",
      "MEMO_SKILL": "Memo Skill Damage",
      "MEMO_TALENT": "Memo Talent Damage",
      "DOT": "Dot Damage",
      "BREAK": "Break Damage",
      "CV": "CV"
    },
    "ShortDMGTypes": {
      "Basic": "Basic DMG",
      "Skill": "Skill DMG",
      "Ult": "Ult DMG",
      "Fua": "Fua DMG",
      "Memo_Skill": "Skillᴹ DMG",
      "Memo_Talent": "Talentᴹ DMG",
      "Dot": "Dot DMG",
      "Break": "Break DMG",
      "CV": "CV"
    },
    "CurrentVersion": "Current version: ({{Version}})"
  },
  "conditionals": {
    "BetaMessage": "Current version: {{Version}} - Calculations are subject to change.",
    "Common": {
      "BuffPriority": {
        "Text": "Buff priority target",
        "Content": "Select the preferred recipient for single target buffs",
        "Self": "Buff priority: Self",
        "Memo": "Buff priority: Memo"
      },
      "HealAbility": {
        "Text": "Healing ability",
        "Content": "Select the ability for heal calculations",
        "Basic": "Healing ability: Basic",
        "Skill": "Healing ability: Skill",
        "Ult": "Healing ability: Ult",
        "Talent": "Healing ability: Talent",
        "Trace": "Healing ability: Trace"
      },
      "ShieldAbility": {
        "Text": "Shielding ability",
        "Content": "Select the ability for shield calculations",
        "Basic": "Shielding ability: Basic",
        "Skill": "Shielding ability: Skill",
        "Ult": "Shielding ability: Ult",
        "Talent": "Shielding ability: Talent",
        "Trace": "Shielding ability: Trace"
      }
    },
    "Lightcones": {
      "AGroundedAscent": {
        "Content": {
          "dmgBuffStacks": {
            "text": "DMG boost stacks",
            "content": "After the wearer uses Skill or Ultimate on one ally character, the ability's target receives 1 stack of \"Hymn\" for 3 turns, stacking up to 3 times. Each stack of \"Hymn\" increases its holder's DMG dealt by {{DmgBuff}}%."
          }
        }
      },
      "AlongThePassingShore": {
        "Content": {
          "emptyBubblesDebuff": {
            "text": "Mirage Fizzle debuff",
            "content": "When the wearer hits an enemy target, inflicts Mirage Fizzle on the enemy, lasting for 1 turn. Each time the wearer attacks, this effect can only trigger 1 time on each target. The wearer deals {{DmgBoost}}% increased DMG to targets afflicted with Mirage Fizzle, and the DMG dealt by the wearer's Ultimate additionally increases by {{UltDmgBoost}}%."
          }
        }
      },
      "AThanklessCoronation": {
        "Content": {
          "ultAtkBoost": {
            "text": "Ult ATK boost",
            "content": "When using their Ultimate, increases the wearer's ATK by {{UltAtkBuff}}%"
          },
          "energyAtkBuff": {
            "text": "Energy ATK buff",
            "content": "When using their ultimate, if the wearer's Max Energy is greater than or equal to 300, regenerates a fixed amount of Energy equal to 10% of the wearer's Max Energy and increases their ATK by {{EnergyAtkBuff}}% for 2 turns."
          }
        }
      },
      "AnInstantBeforeAGaze": {
        "Content": {
          "maxEnergyDmgBoost": {
            "text": "Max energy DMG boost",
            "content": "When the wearer uses Ultimate, increases the wearer's Ultimate DMG based on their Max Energy. Each point of Energy increases the Ultimate DMG by {{DmgStep}}%, up to 180 points of Energy."
          }
        }
      },
      "BaptismOfPureThought": {
        "Content": {
          "debuffCdStacks": {
            "text": "Debuff CD stacks",
            "content": "For every debuff on the enemy target, the wearer's CRIT DMG dealt against this target increases by {{DmgStep}}%, stacking up to 3 times."
          },
          "postUltBuff": {
            "text": "Disputation buffs",
            "content": "When using Ultimate to attack the enemy target, the wearer receives the Disputation effect, which increases DMG dealt by {{DmgStep}}% and enables their follow-up attacks to ignore {{DefIgnore}}% of the target's DEF. This effect lasts for 2 turns."
          }
        }
      },
      "BeforeDawn": {
        "Content": {
          "fuaDmgBoost": {
            "text": "FUA DMG boost",
            "content": "After the wearer uses their Skill or Ultimate, they gain Somnus Corpus. Upon triggering a follow-up attack, Somnus Corpus will be consumed and the follow-up attack DMG increases by {{DmgBuff}}%."
          }
        }
      },
      "BrighterThanTheSun": {
        "Content": {
          "dragonsCallStacks": {
            "text": "Dragon's Call stacks",
            "content": "When the wearer uses their Basic ATK, they will gain 1 stack of Dragon's Call, lasting for 2 turns. Each stack of Dragon's Call increases the wearer's ATK by {{AtkBuff}}% and Energy Regeneration Rate by {{RegenBuff}}%. Dragon's Call can be stacked up to 2 times."
          }
        }
      },
      "ButTheBattleIsntOver": {
        "Content": {
          "postSkillDmgBuff": {
            "text": "Post Skill DMG buff",
            "content": "When the wearer uses their Skill, the next ally taking action (except the wearer) deals {{DmgBuff}}% more DMG for 1 turn."
          }
        }
      },
      "CruisingInTheStellarSea": {
        "Content": {
          "enemyHp50CrBoost": {
            "text": "Enemy HP ≤ 50% CR buff",
            "content": "Increases the wearer's CRIT rate against enemies with HP less than or equal to 50% by an extra {{CritBuff}}%."
          },
          "enemyDefeatedAtkBuff": {
            "text": "Enemy defeated ATK buff",
            "content": "When the wearer defeats an enemy, their ATK is increased by {{AtkBuff}}% for 2 turns."
          }
        }
      },
      "DanceAtSunset": {
        "Content": {
          "fuaDmgStacks": {
            "text": "FUA DMG stacks",
            "content": "After the wearer uses Ultimate, receives 1 stack of Firedance, lasting for 2 turns and stacking up to 2 times. Each stack of Firedance increases the DMG dealt by the wearer's follow-up attack by {{DmgBoost}}%."
          }
        }
      },
      "EarthlyEscapade": {
        "Content": {
          "maskActive": {
            "text": "Mask active",
            "content": "At the start of the battle, the wearer gains Mask, lasting for 3 turns. While the wearer has Mask, the wearer's allies have their CRIT Rate increased by {{CritRateBuff}}% and their CRIT DMG increased by {{CritDmgBuff}}%. For every 1 Skill Point the wearer recovers (including Skill Points that exceed the limit), they gain 1 stack of Radiant Flame. And when the wearer has 4 stacks of Radiant Flame, all the stacks are removed, and they gain Mask for 4 turns."
          }
        }
      },
      "EchoesOfTheCoffin": {
        "Content": {
          "postUltSpdBuff": {
            "text": "Post Ult SPD buff",
            "content": "After the wearer uses an attack, for each different enemy target the wearer hits, regenerates {{EnergyRecovered}} Energy. Each attack can regenerate Energy up to 3 times this way. After the wearer uses their Ultimate, all allies gain {{SpdBuff}} SPD for 1 turn."
          }
        }
      },
      "EpochEtchedInGoldenBlood": {
        "Content": {
          "skillDmgBoost": {
            "text": "Skill DMG boost",
            "content": "When the wearer uses their Skill on one ally character, increases the Skill DMG dealt by the target by {{DmgBuff}}% for 3 turns."
          }
        }
      },
      "EternalCalculus": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "content": "After using an attack, for each enemy target hit, additionally increases ATK by {{AtkBuff}}%. This effect can stack up to 5 times and last until the next attack."
          },
          "spdBuff": {
            "text": "3 targets hit SPD buff",
            "content": "If there are 3 or more enemy targets hit, this unit's SPD increases by {{SpdBuff}}%, lasting for 1 turn."
          }
        }
      },
      "FlameOfBloodBlazeMyPath": {
        "Content": {
          "skillUltDmgBoost": {
            "text": "Skill / Ult DMG boost",
            "content": "When using Skill or Ultimate, increases the DMG dealt by this attack by {{DmgBoost}}%."
          }
        }
      },
      "FlowingNightglow": {
        "Content": {
          "cadenzaActive": {
            "text": "Cadenza active",
            "content": "Every time an ally attacks, the wearer gains 1 stack of Cantillation. Each stack of Cantillation increases the wearer's Energy Regeneration Rate by {{RegenBuff}}%, stacking up to 5 times. When the wearer uses their Ultimate, removes Cantillation and gains Cadenza. Cadenza increases the Wearer's ATK by {{AtkBuff}}% and increases all allies' DMG dealt by {{DmgBuff}}%, lasting for 1 turn."
          },
          "cantillationStacks": {
            "text": "Cantillation stacks",
            "content": "Every time an ally attacks, the wearer gains 1 stack of Cantillation. Each stack of Cantillation increases the wearer's Energy Regeneration Rate by {{RegenBuff}}%, stacking up to 5 times. When the wearer uses their Ultimate, removes Cantillation and gains Cadenza. Cadenza increases the Wearer's ATK by {{AtkBuff}}% and increases all allies' DMG dealt by {{DmgBuff}}%, lasting for 1 turn."
          }
        }
      },
      "IfTimeWereAFlower": {
        "Content": {
          "presage": {
            "text": "Presage active",
            "content": "After the wearer launches a Follow-up ATK, additionally regenerates 12 Energy and gains \"Presage,\" lasting for 2 turns. While the wearer has \"Presage,\" all ally targets' CRIT DMG increases by {{CdBuff}}%. When entering battle, the wearer regenerates 21 Energy and gains \"Presage,\" lasting for 2 turns."
          }
        }
      },
      "IncessantRain": {
        "Content": {
          "enemy3DebuffsCrBoost": {
            "text": "Enemy ≥ 3 debuffs CR boost",
            "content": "When the wearer deals DMG to an enemy that currently has 3 or more debuffs, increases the wearer's CRIT Rate by {{CritBuff}}%."
          },
          "targetCodeDebuff": {
            "text": "Target Aether Code debuff",
            "content": "After the wearer uses their Basic ATK, Skill, or Ultimate, there is a 100% base chance to implant Aether Code on a random hit target that does not yet have it. Targets with Aether Code receive {{DmgIncrease}}% increased DMG for 1 turn."
          }
        }
      },
      "InherentlyUnjustDestiny": {
        "Content": {
          "shieldCdBuff": {
            "text": "Shield CD buff",
            "content": "When the wearer provides a Shield to an ally, the wearer's CRIT DMG increases by {{CritBuff}}%, lasting for 2 turns."
          },
          "targetVulnerability": {
            "text": "Target vulnerability debuff",
            "content": "When the wearer's follow-up attack hits an enemy target, there is a {{baseChance}}% base chance to increase the DMG taken by the attacked enemy target by {{Vulnerability}}%, lasting for 2 turns."
          }
        }
      },
      "InTheNameOfTheWorld": {
        "Content": {
          "enemyDebuffedDmgBoost": {
            "text": "Enemy debuffed DMG boost",
            "content": "Increases the wearer's DMG to debuffed enemies by {{DmgBuff}}%."
          },
          "skillAtkBoost": {
            "text": "Skill ATK boost",
            "content": "When the wearer uses their Skill, the Effect Hit Rate for this attack increases by {{EhrBuff}}%, and ATK increases by {{AtkBuff}}%."
          }
        }
      },
      "InTheNight": {
        "Content": {
          "spdScalingBuffs": {
            "text": "SPD conversion buffs",
            "content": "While the wearer is in battle, for every 10 SPD that exceeds 100, the DMG of the wearer's Basic ATK and Skill is increased by {{DmgBuff}}% and the CRIT DMG of their Ultimate is increased by {{CritBuff}}%. This effect can stack up to 6 times."
          }
        }
      },
      "IntoTheUnreachableVeil": {
        "Content": {
          "skillUltDmgBoost": {
            "text": "Skill / Ult DMG boost",
            "content": "When the wearer uses their Ultimate, increases DMG dealt by the wearer's Skill and Ultimate by {{DmgBuff}}%."
          }
        }
      },
      "IShallBeMyOwnSword": {
        "Content": {
          "eclipseStacks": {
            "text": "Eclipse stacks",
            "content": "When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of 3 stacks. Each stack of Eclipse increases the DMG of the wearer's next attack by {{DmgBuff}}%."
          },
          "maxStackDefPen": {
            "text": "Max stack DEF PEN",
            "content": "When 3 stacks are reached, additionally enables that attack to ignore {{DefIgnore}}% of the enemy's DEF. This effect will be removed after the wearer uses an attack."
          }
        }
      },
      "IVentureForthToHunt": {
        "Content": {
          "luminfluxUltStacks": {
            "text": "Luminflux stacks",
            "content": "When the wearer launches a follow-up attack, gains 1 stack of Luminflux, stacking up to 2 times. Each stack of Luminflux enables the Ultimate DMG dealt by the wearer to ignore {{DefIgnore}}% of the target's DEF. When the wearer's turn ends, removes 1 stack of Luminflux."
          }
        }
      },
      "LiesAflutterInTheWind": {
        "Content": {
          "defPen": {
            "text": "DEF PEN",
            "content": "After the wearer uses an attack, there is a 120% base chance to inflict the \"Bamboozle\" state on every enemy target, reducing their DEF by {{DefShred}}% for 2 turns. ::BR:: If the wearer's SPD is higher than or equal to 170, there is a 120% base chance to inflict the \"Theft\" state on every enemy target, further reducing their def by {{AdditionalDefShred}}% for 2 turns."
          }
        },
        "TeammateContent": {
          "additionalDefPen": {
            "text": "SPD > 170",
            "content": "After the wearer uses an attack, there is a 120% base chance to inflict the \"Bamboozle\" state on every enemy target, reducing their DEF by {{DefShred}}% for 2 turns. ::BR:: If the wearer's SPD is higher than or equal to 170, there is a 120% base chance to inflict the \"Theft\" state on every enemy target, further reducing their def by {{AdditionalDefShred}}% for 2 turns."
          }
        }
      },
      "LifeShouldBeCastToFlames": {
        "Content": {
          "dmgBoost": {
            "text": "DMG boost",
            "content": "If the enemy target has a Weakness implanted by the wearer, increases the wearer's DMG dealt to it by {{DmgBuff}}% ."
          },
          "defPen": {
            "text": "DEF PEN",
            "content": "When enemy targets are attacked by the wearer, the wearer decreases its DEF by {{DefShred}}%, lasting for 2 turns."
          }
        }
      },
      "LongRoadLeadsHome": {
        "Content": {
          "breakVulnerabilityStacks": {
            "text": "Break vulnerability stacks",
            "content": "When an enemy target's Weakness gets broken, there is a 100% base chance to inflict the \"Charring\" state on it, which increases its Break DMG taken by {{breakVulnerability}}%, lasting for 2 turns. This effect can stack 2 times."
          }
        }
      },
      "MakeFarewellsMoreBeautiful": {
        "Content": {
          "deathFlower": {
            "text": "Death Flower DEF PEN",
            "content": "When the wearer or their memosprite loses HP during their own turn, the wearer gains \"Death Flower,\" which allows the wearer and their memosprite to ignore {{DefIgnore}}% of the target's DEF when dealing DMG, lasting for 2 turns."
          }
        }
      },
      "MayRainbowsRemainInTheSky": {
        "Content": {
          "vulnerability": {
            "text": "Vulnerability",
            "content": "When the wearer's memosprite uses Memosprite Skill, increases the DMG taken by all enemies by {{Vulnerability}}% for 2 turns. The same types of effects cannot stack."
          }
        }
      },
      "MemorysCurtainNeverFalls": {
        "Content": {
          "teamDmgBoost": {
            "text": "Team DMG boost",
            "content": "After the wearer uses Skill, increases the DMG dealt by all allies by {{DmgBoost}}%, lasting for 3 turns."
          }
        }
      },
      "MomentOfVictory": {
        "Content": {
          "selfAttackedDefBuff": {
            "text": "Self attacked DEF buff",
            "content": "Increases the chance for the wearer to be attacked by enemies. When the wearer is attacked, increase their DEF by an extra {{DefBuff}}% until the end of the wearer's turn."
          }
        }
      },
      "NightOfFright": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "content": "When the wearer provides healing for an ally, increases the healed ally's ATK by {{AtkBuff}}%. This effect can stack up to 5 times and lasts for 2 turns."
          }
        }
      },
      "NightOnTheMilkyWay": {
        "Content": {
          "enemyCountAtkBuff": {
            "text": "Enemy count ATK buff",
            "content": "For every enemy on the field, increases the wearer's ATK by {{AtkBuff}}%, up to 5 stacks."
          },
          "enemyWeaknessBreakDmgBuff": {
            "text": "Enemy broken DMG buff",
            "content": "When an enemy is inflicted with Weakness Break, the DMG dealt by the wearer increases by {{DmgBuff}}% for 1 turn."
          }
        }
      },
      "OnTheFallOfAnAeon": {
        "Content": {
          "atkBoostStacks": {
            "text": "ATK buff stacks",
            "content": "Whenever the wearer attacks, their ATK is increased by {{AtkBuff}}% in this battle. This effect can stack up to 4 times."
          },
          "weaknessBreakDmgBuff": {
            "text": "Weakness break DMG buff",
            "content": "After a character inflicts Weakness Break on an enemy, the wearer's DMG increases by {{DmgBuff}}% for 2 turns."
          }
        }
      },
      "PastSelfInTheMirror": {
        "Content": {
          "postUltDmgBuff": {
            "text": "Post Ult DMG buff",
            "content": "When the wearer uses their Ultimate, increases all allies' DMG by {{DmgBuff}}%, lasting for 3 turns."
          }
        }
      },
      "PatienceIsAllYouNeed": {
        "Content": {
          "spdStacks": {
            "text": "SPD stacks",
            "content": "After every attack launched by wearer, their SPD increases by {{SpdBuff}}%, stacking up to 3 times."
          },
          "dotEffect": {
            "text": "DoT effect (not implemented)",
            "content": "If the wearer hits an enemy target that is not afflicted by Erode, there is a 100% base chance to inflict Erode to the target. Enemies afflicted with Erode are also considered to be Shocked and will receive Lightning DoT at the start of each turn equal to {{Multiplier}}% of the wearer's ATK, lasting for 1 turn."
          }
        }
      },
      "ReforgedRemembrance": {
        "Content": {
          "prophetStacks": {
            "text": "Prophet stacks",
            "content": "When the wearer deals DMG to an enemy inflicted with Wind Shear, Burn, Shock, or Bleed, each respectively grants 1 stack of Prophet, stacking up to 4 times. In a single battle, only 1 stack of Prophet can be granted for each type of DoT. Every stack of Prophet increases wearer's ATK by {{AtkBuff}}% and enables the DoT dealt to ignore {{DefIgnore}}% of the target's DEF."
          }
        }
      },
      "SailingTowardsASecondLife": {
        "Content": {
          "breakDmgDefShred": {
            "text": "Break DMG DEF shred",
            "content": "The Break DMG dealt by the wearer ignores {{DefIgnore}}% of the target's DEF."
          },
          "spdBuffConditional": {
            "text": "BE ≥ 150 SPD buff",
            "content": "When the wearer's Break Effect in battle is at 150% or greater, increases their SPD by {{SpdBuff}}%."
          }
        }
      },
      "ScentAloneStaysTrue": {
        "Content": {
          "woefreeState": {
            "text": "Woefree vulnerability",
            "content": "After the wearer uses Ultimate to attack enemy targets, inflicts the targets with the Woefree state, lasting for 2 turns. While in Woefree, enemy targets take {{Vulnerability}}% increased DMG. The effect of increasing DMG taken is additionally boosted by {{AdditionalVulnerability}}% if the wearer's current Break Effect is 150% or higher."
          }
        },
        "TeammateContent": {
          "additionalVulnerability": {
            "text": "Additional vulnerability",
            "content": "After the wearer uses Ultimate to attack enemy targets, inflicts the targets with the Woefree state, lasting for 2 turns. While in Woefree, enemy targets take {{Vulnerability}}% increased DMG. The effect of increasing DMG taken is additionally boosted by {{AdditionalVulnerability}}% if the wearer's current Break Effect is 150% or higher."
          }
        }
      },
      "SheAlreadyShutHerEyes": {
        "Content": {
          "hpLostDmgBuff": {
            "text": "HP lost DMG buff",
            "content": "When the wearer's HP is reduced, all allies' DMG dealt increases by {{DmgBuff}}%, lasting for 2 turns."
          }
        }
      },
      "SleepLikeTheDead": {
        "Content": {
          "missedCritCrBuff": {
            "text": "Missed Crit CR buff",
            "content": "When the wearer's Basic ATK or Skill does not result in a CRIT Hit, increases their CRIT Rate by {{CritBuff}}% for 1 turn. This effect can only trigger once every 3 turns."
          }
        }
      },
      "SolitaryHealing": {
        "Content": {
          "postUltDotDmgBuff": {
            "text": "Post Ult DoT DMG buff",
            "content": "When the wearer uses their Ultimate, increases DoT dealt by the wearer by {{DmgBuff}}%, lasting for 2 turns."
          }
        }
      },
      "SomethingIrreplaceable": {
        "Content": {
          "dmgBuff": {
            "text": "Enemy defeated / self hit DMG buff",
            "content": "When the wearer defeats an enemy or is hit, immediately restores HP equal to {{Multiplier}}% of the wearer's ATK. At the same time, the wearer's DMG is increased by {{DmgBuff}}% until the end of their next turn. This effect cannot stack and can only trigger 1 time per turn."
          }
        }
      },
      "TextureOfMemories": {
        "Content": {
          "activeShieldDmgDecrease": {
            "text": "Active shield DMG taken decrease",
            "content": "If the wearer is attacked and has no Shield, they gain a Shield equal to {{ShieldHp}}% of their Max HP for 2 turns. This effect can only be triggered once every 3 turns. If the wearer has a Shield when attacked, the DMG they receive decreases by {{DmgReduction}}%."
          }
        }
      },
      "TheHellWhereIdealsBurn": {
        "Content": {
          "spAtkBuff": {
            "text": "SP ATK buff",
            "content": "When entering battle and if the allies' Skill Points max limit is 6 or higher, increases the wearer's ATK by {{SPAtkBuff}}%."
          },
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "content": "After the wearer uses a Skill, increases their ATK by {{ScalingAtkBuff}}%, stacking up to 4 times."
          }
        }
      },
      "TheUnreachableSide": {
        "Content": {
          "dmgBuff": {
            "text": "HP consumed / attacked DMG buff",
            "content": "When the wearer is attacked or consumes their own HP, their DMG increases by {{DmgBuff}}%. This effect is removed after the wearer uses an attack."
          }
        }
      },
      "ThoseManySprings": {
        "Content": {
          "unarmoredVulnerability": {
            "text": "Unarmored vulnerability",
            "content": "After the wearer uses Basic ATK, Skill, or Ultimate to attack an enemy target, there is a 60% base chance to inflict Unarmored on the target. While in the Unarmored state, the enemy target receives {{UnarmoredVulnerability}}% increased DMG, lasting for 2 turns. If the target is under a DoT state inflicted by the wearer, there is a 60% base chance to upgrade the Unarmored state inflicted by the wearer to the Cornered state, which additionally increases the DMG the enemy target receives by {{CorneredVulnerability}}%, lasting for 2 turns."
          },
          "corneredVulnerability": {
            "text": "Cornered vulnerability",
            "content": "After the wearer uses Basic ATK, Skill, or Ultimate to attack an enemy target, there is a 60% base chance to inflict Unarmored on the target. While in the Unarmored state, the enemy target receives {{UnarmoredVulnerability}}% increased DMG, lasting for 2 turns. If the target is under a DoT state inflicted by the wearer, there is a 60% base chance to upgrade the Unarmored state inflicted by the wearer to the Cornered state, which additionally increases the DMG the enemy target receives by {{CorneredVulnerability}}%, lasting for 2 turns."
          }
        }
      },
      "ThoughWorldsApart": {
        "Content": {
          "dmgBoost": {
            "text": "DMG Boost",
            "content": "When the wearer uses Ultimate, grants \"Redoubt\" to all allies for 3 turns. Targets with \"Redoubt\" deal {{DmgBuff}}% more DMG, which further increases by {{SummonDmgBuff}}% if they have summons."
          }
        }
      },
      "ThusBurnsTheDawn": {
        "Content": {
          "defPen": {
            "text": "DEF PEN",
            "content": "When the wearer deals DMG, ignores {{DefIgnore}}% of the target's DEF."
          },
          "dmgBuff": {
            "text": "DMG buff",
            "content": "While \"Blazing Sun\" is in possession, increases the wearer's DMG dealt by {{DmgBuff}}% ."
          }
        }
      },
      "ToEvernightsStars": {
        "Content": {
          "defPen": {
            "text": "Memo DEF PEN",
            "content": "When the wearer's memosprite uses an ability, the wearer gains \"Noctis.\" While the wearer has \"Noctis,\" all allies' memosprites ignore {{MemoDefPen}}% of the target's DEF when dealing DMG."
          },
          "dmgBoost": {
            "text": "DMG boost",
            "content": "Increases the DMG dealt by the wearer and their memosprite by {{DmgBuff}}%."
          }
        }
      },
      "TimeWaitsForNoOne": {
        "Content": {
          "healingBasedDmgProc": {
            "text": "Healing based DMG proc (Not implemented)",
            "content": "When the wearer heals allies, record the amount of Outgoing Healing. When any ally launches an attack, a random attacked enemy takes Additional DMG equal to {{Multiplier}}% of the recorded Outgoing Healing value. The type of this Additional DMG is of the same Type as the wearer's. This Additional DMG is not affected by other buffs, and can only occur 1 time per turn."
          }
        }
      },
      "TimeWovenIntoGold": {
        "Content": {
          "brocadeStacks": {
            "text": "Brocade stacks",
            "content": "After the wearer and the wearer's memosprite attacks, the wearer gains 1 stack of \"Brocade.\"::BR:: Each stack of \"Brocade\" increases the wearer and their memosprite's CRIT DMG by {{CdBuff}}%, stacking up to 6 times.::BR:: When reaching maximum stacks, each \"Brocade\" stack will additionally increase Basic ATK DMG dealt by {{DmgBuff}}%."
          },
          "maxStacksBasicDmgBoost": {
            "text": "Stacked Basic DMG boost",
            "content": "After the wearer and the wearer's memosprite attacks, the wearer gains 1 stack of \"Brocade.\"::BR:: Each stack of \"Brocade\" increases the wearer and their memosprite's CRIT DMG by {{CdBuff}}%, stacking up to 6 times.::BR:: When reaching maximum stacks, each \"Brocade\" stack will additionally increase Basic ATK DMG dealt by {{DmgBuff}}%."
          }
        }
      },
      "WhereaboutsShouldDreamsRest": {
        "Content": {
          "routedVulnerability": {
            "text": "Routed vulnerability",
            "content": "When the wearer deals Break DMG to an enemy target, inflicts Routed on the enemy, lasting for 2 turns. Targets afflicted with Routed receive {{Vulnerability}}% increased Break DMG from the wearer, and their SPD is lowered by 20%. Effects of the similar type cannot be stacked."
          }
        }
      },
      "WhyDoesTheOceanSing": {
        "Content": {
          "dotVulnStacks": {
            "text": "DOT vulnerability stacks",
            "content": "When an enemy target gets inflicted with a debuff by the wearer, there is a 80% base chance for them to enter \"Enthrallment,\" lasting for 3 turns. While the target is in \"Enthrallment,\" for every 1 debuff applied by the wearer on the target, increases the target's received DoT by {{DotVuln}}%, stacking up to 6 times."
          },
          "spdBuff": {
            "text": "SPD buff",
            "content": "When an enemy target gets inflicted with a debuff by the wearer, there is a 80% base chance for them to enter \"Enthrallment,\" lasting for 3 turns. When the target gets attacked by an ally, increases the attacker's SPD by {{SpdBuff}}% for 3 turns."
          }
        }
      },
      "WorrisomeBlissful": {
        "Content": {
          "targetTameStacks": {
            "text": "Target Tame stacks",
            "content": "After the wearer uses a follow-up attack, apply the Tame state to the target, stacking up to 2 stacks. When allies hit enemy targets under the Tame state, every Tame stack increases the CRIT DMG dealt by {{CritBuff}}%."
          }
        }
      },
      "YetHopeIsPriceless": {
        "Content": {
          "fuaDmgBoost": {
            "text": "CD to FUA DMG boost",
            "content": "While the wearer is in battle, for every 20% CRIT DMG that exceeds 120%, the DMG dealt by follow-up attack increases by {{DmgBuff}}%. This effect can stack up to 4 times."
          },
          "ultFuaDefShred": {
            "text": "Ult / FUA DEF PEN",
            "content": "When the battle starts or after the wearer uses their Basic ATK, enables Ultimate or the DMG dealt by follow-up attack to ignore {{DefShred}}% of the target's DEF, lasting for 2 turns."
          }
        }
      },
      "ADreamScentedInWheat": {
        "Content": {
          "ultFuaDmgBoost": {
            "text": "Ult / Fua DMG boost",
            "content": "The Ultimate DMG and Follow-up ATK DMG dealt by the wearer increase by {{DmgBuff}}%."
          }
        }
      },
      "AfterTheCharmonyFall": {
        "Content": {
          "spdBuff": {
            "text": "SPD buff",
            "content": "After the wearer uses Ultimate, increases SPD by {{SpdBuff}}%, lasting for 2 turns."
          }
        }
      },
      "ASecretVow": {
        "Content": {
          "enemyHpHigherDmgBoost": {
            "text": "Enemy HP% higher DMG boost",
            "content": "The wearer also deals an extra {{DmgBuff}}% of DMG to enemies whose current HP percentage is equal to or higher than the wearer's current HP percentage."
          }
        }
      },
      "ATrailOfBygoneBlood": {
        "Content": {
          "skillUltDmgBoost": {
            "text": "Skill / Ult DMG boost",
            "content": "The Skill DMG and Ultimate DMG dealt by the wearer increase by {{DmgBuff}}%."
          }
        }
      },
      "BoundlessChoreo": {
        "Content": {
          "enemyDefReducedSlowed": {
            "text": "Enemy DEF reduced / slowed",
            "content": "The wearer deals {{CritBuff}}% more CRIT DMG to enemies that are currently Slowed or have reduced DEF."
          }
        }
      },
      "CarveTheMoonWeaveTheClouds": {
        "Content": {
          "atkBuffActive": {
            "text": "ATK buff active",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%.::BR::All allies' CRIT DMG increases by {{CritBuff}}%.::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          },
          "cdBuffActive": {
            "text": "CD buff active",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%.::BR::All allies' CRIT DMG increases by {{CritBuff}}%.::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          },
          "errBuffActive": {
            "text": "ERR buff active",
            "content": "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly:::BR::All allies' ATK increases by {{AtkBuff}}%.::BR::All allies' CRIT DMG increases by {{CritBuff}}%.::BR::All allies' Energy Regeneration Rate increases by {{RegenBuff}}%.::BR::The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the similar type cannot be stacked."
          }
        }
      },
      "ConcertForTwo": {
        "Content": {
          "teammateShieldStacks": {
            "text": "Teammate shield DMG stacks",
            "content": "For every on-field character that has a Shield, the DMG dealt by the wearer increases by {{DmgBuff}}%."
          }
        }
      },
      "DayOneOfMyNewLife": {
        "Content": {
          "dmgResBuff": {
            "text": "DMG RES buff",
            "content": "After entering battle, increases All-Type RES of all allies by {{ResBuff}}%. Effects of the same type cannot stack."
          }
        }
      },
      "DreamvilleAdventure": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG boost",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          },
          "skillDmgBuff": {
            "text": "Skill DMG boost",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          },
          "basicDmgBuff": {
            "text": "Basic DMG boost",
            "content": "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by {{DmgBuff}}%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked."
          }
        }
      },
      "Fermata": {
        "Content": {
          "enemyShockWindShear": {
            "text": "Enemy shocked / wind sheared",
            "content": "Increases the wearer's DMG to enemies afflicted with Shock or Wind Shear by {{DmgBuff}}%. This also applies to DoT."
          }
        }
      },
      "FinalVictor": {
        "Content": {
          "goodFortuneStacks": {
            "text": "Good Fortune stacks",
            "content": "When the wearer lands a CRIT hit on enemies, gains a stack of Good Fortune, stacking up to 4 times. Every stack of Good Fortune the wearer has will increase their CRIT DMG by {{CritBuff}}%. Good Fortune will be removed at the end of the wearer's turn."
          }
        }
      },
      "FlamesAfar": {
        "Content": {
          "dmgBuff": {
            "text": "DMG buff",
            "content": "When the cumulative HP loss of the wearer during a single attack exceeds 25% of their Max HP, or if the amount of their own HP they consume at one time is greater than 25% of their Max HP, immediately heals the wearer for 15% of their Max HP, and at the same time, increases the DMG they deal by {{DmgBuff}}% for 2 turns. This effect can only be triggered once every 3 turns."
          }
        }
      },
      "ForTomorrowsJourney": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult usage DMG buff",
            "content": "After the wearer uses their Ultimate, increases their DMG dealt by {{DmgBuff}}%, lasting for 1 turn."
          }
        }
      },
      "GeniusesGreetings": {
        "Content": {
          "basicDmgBoost": {
            "text": "Basic DMG boost",
            "content": "After the wearer uses their Ultimate, additionally increases the wearer and their memosprite's Basic ATK DMG dealt by {{DmgBuff}}%."
          }
        }
      },
      "GeniusesRepose": {
        "Content": {
          "defeatedEnemyCdBuff": {
            "text": "Defeated enemy CD buff",
            "content": "When the wearer defeats an enemy, the wearer's CRIT DMG increases by {{DmgBuff}}% for 3 turns."
          }
        }
      },
      "GoodNightAndSleepWell": {
        "Content": {
          "debuffStacksDmgIncrease": {
            "text": "Debuff stacks DMG increase",
            "content": "For every debuff the target enemy has, the DMG dealt by the wearer increases by {{DmgBuff}}%, stacking up to 3 times. This effect also applies to DoT."
          }
        }
      },
      "HeyOverHere": {
        "Content": {
          "postSkillHealBuff": {
            "text": "Post Skill heal buff",
            "content": "When the wearer uses their Skill, increases Outgoing Healing by {{HealingBoost}}%, lasting for 2 turns."
          }
        }
      },
      "HolidayThermaeEscapade": {
        "Content": {
          "dmgBoost": {
            "text": "DMG boost",
            "content": "Increases the wearer's DMG dealt by {{DmgBuff}}%."
          },
          "vulnerability": {
            "text": "Vulnerability",
            "content": "After the wearer attacks, there is a 100% base chance that the attacked target is inflicted with Vulnerability, increasing the DMG they receive by {{Vulnerability}}% for 2 turns."
          }
        }
      },
      "InPursuitOfTheWind": {
        "Content": {
          "breakDmgBoost": {
            "text": "Break DMG boost",
            "content": "Increases all allies' Break DMG dealt by {{BreakDmgBuff}}%."
          }
        }
      },
      "IndeliblePromise": {
        "Content": {
          "crBuff": {
            "text": "Ult CR buff",
            "content": "When the wearer uses their Ultimate, increases CRIT Rate by {{CritBuff}}%, lasting for 2 turns."
          }
        }
      },
      "ItsShowtime": {
        "Content": {
          "trickStacks": {
            "text": "Trick stacks",
            "content": "When the wearer inflicts a debuff on an enemy, gains a stack of Trick. Every stack of Trick increases the wearer's DMG dealt by {{DmgBuff}}%, stacking up to 3 times. This effect lasts for 1 turn. When the wearer's Effect Hit Rate is 80% or higher, increases ATK by {{AtkBuff}}%."
          }
        }
      },
      "JourneyForeverPeaceful": {
        "Content": {
          "shieldBoost": {
            "text": "Shield boost",
            "content": "Increases the wearer's provided Shield Effect by {{ShieldBuff}}%."
          },
          "dmgBoost": {
            "text": "Shielded DMG boost",
            "content": "When an ally target has a Shield, their DMG dealt increases by {{DmgBuff}}%."
          }
        }
      },
      "MakeTheWorldClamor": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "content": "The wearer regenerates {{Energy}} Energy immediately upon entering battle, and increases Ultimate DMG by {{DmgBuff}}%."
          }
        }
      },
      "NinjaRecordSoundHunt": {
        "Content": {
          "cdBuff": {
            "text": "CD buff",
            "content": "When losing or restoring this unit's HP, increases CRIT DMG by {{sValuesCd}}%, lasting for 2 turns."
          }
        }
      },
      "OnlySilenceRemains": {
        "Content": {
          "enemies2CrBuff": {
            "text": "≤ 2 enemies CR buff",
            "content": "If there are 2 or fewer enemies on the field, increases wearer's CRIT Rate by {{CritBuff}}%."
          }
        }
      },
      "PastAndFuture": {
        "Content": {
          "postSkillDmgBuff": {
            "text": "Post Skill DMG buff",
            "content": "When the wearer uses their Skill, the next ally taking action (except the wearer) deals {{DmgBuff}}% increased DMG for 1 turn."
          }
        }
      },
      "PerfectTiming": {
        "Content": {
          "resToHealingBoost": {
            "text": "RES to healing boost",
            "content": "Increases the wearer's Outgoing Healing by an amount that is equal to {{Scaling}}% of Effect RES. Outgoing Healing can be increased this way by up to {{Limit}}%."
          }
        }
      },
      "PlanetaryRendezvous": {
        "Content": {
          "alliesSameElement": {
            "text": "Same element ally DMG boost",
            "content": "After entering battle, if an ally deals the same DMG Type as the wearer, DMG dealt increases by {{DmgBuff}}%."
          }
        }
      },
      "PoisedToBloom": {
        "Content": {
          "cdBuff": {
            "text": "Double path CD buff",
            "content": "Upon entering battle, if two or more characters follow the same Path, then these characters' CRIT DMG increases by {{CritBuff}}%."
          }
        }
      },
      "PostOpConversation": {
        "Content": {
          "postUltHealingBoost": {
            "text": "Ult healing boost",
            "content": "Increases the wearer's Outgoing Healing when they use their Ultimate by {{HealingBoost}}%."
          }
        }
      },
      "ResolutionShinesAsPearlsOfSweat": {
        "Content": {
          "targetEnsnared": {
            "text": "Target ensnared",
            "content": "When the wearer hits an enemy and if the hit enemy is not already Ensnared, then there is a {{BaseChance}}% base chance to Ensnare the hit enemy. Ensnared enemies' DEF decreases by {{DefShred}}% for 1 turn."
          }
        }
      },
      "RiverFlowsInSpring": {
        "Content": {
          "spdDmgBuff": {
            "text": "SPD / DMG buff active",
            "content": "After entering battle, increases the wearer's SPD by {{SpdBuff}}% and DMG by {{DmgBuff}}%. When the wearer takes DMG, this effect will disappear. This effect will resume after the end of the wearer's next turn."
          }
        }
      },
      "SeeYouAtTheEnd": {
        "Content": {
          "skillFuaDmgBoost": {
            "text": "Skill / Fua DMG boost",
            "content": "The Skill DMG and Follow-up ATK DMG dealt by the wearer increase by {{DmgBuff}}%."
          }
        }
      },
      "ShadowedByNight": {
        "Content": {
          "spdBuff": {
            "text": "SPD buff",
            "content": "When entering battle or after dealing Break DMG, increases SPD by {{SpdBuff}}%, lasting for 2 turns."
          }
        }
      },
      "SubscribeForMore": {
        "Content": {
          "maxEnergyDmgBoost": {
            "text": "Max energy DMG boost",
            "content": "Increases the DMG of the wearer's Basic ATK and Skill by {{DmgBuff}}%. This effect increases by an extra {{DmgBuff}}% when the wearer's current Energy reaches its max level."
          }
        }
      },
      "SweatNowCryLess": {
        "Content": {
          "dmgBoost": {
            "text": "Summoner / Memosprite DMG boost",
            "content": "When the wearer's memosprite is on the field, increases the wearer and their memosprite's DMG dealt by {{DmgBuff}}%."
          }
        }
      },
      "Swordplay": {
        "Content": {
          "sameTargetHitStacks": {
            "text": "Same target hit stacks",
            "content": "For each time the wearer hits the same target, DMG dealt increases by {{DmgBuff}}%, stacking up to 5 times. This effect will be dispelled when the wearer changes targets."
          }
        }
      },
      "TheBirthOfTheSelf": {
        "Content": {
          "enemyHp50FuaBuff": {
            "text": "Enemy HP ≤ 50% fua buff",
            "content": "If the current HP of the target enemy is below or equal to 50%, increases DMG dealt by follow-up attacks by an extra {{DmgBuff}}%."
          }
        }
      },
      "TheDayTheCosmosFell": {
        "Content": {
          "cdBuffActive": {
            "text": "≥ 2 weakness targets CD buff",
            "content": "When the wearer uses an attack and at least 2 attacked enemies have the corresponding Weakness, the wearer's CRIT DMG increases by {{CritBuff}}% for 2 turns."
          }
        }
      },
      "TheFlowerRemembers": {
        "Content": {
          "memoCdBoost": {
            "text": "Memo CD boost",
            "content": "The CRIT DMG dealt by the wearer's memosprite increases by {{CritDmgBuff}}%"
          }
        }
      },
      "TheForeverVictual": {
        "Content": {
          "atkStacks": {
            "text": "ATK buff stacks",
            "content": "After using their Skill, the wearer's ATK increases by {{AtkBuff}}%, stacking up to 3 times."
          }
        }
      },
      "TheGreatCosmicEnterprise": {
        "Content": {
          "weaknessTypes": {
            "text": "Weakness types",
            "content": "For every different Weakness Type an enemy target has, increases the DMG dealt by the wearer by {{DmgBuff}}%, up to a max of 7 Weakness Types."
          }
        }
      },
      "TheMolesWelcomeYou": {
        "Content": {
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "content": "When the wearer uses Basic ATK, Skill, or Ultimate to attack enemies, the wearer gains one stack of Mischievous. Each stack increases the wearer's ATK by {{AtkBuff}}%."
          }
        }
      },
      "TheSeriousnessOfBreakfast": {
        "Content": {
          "dmgBoost": {
            "text": "DMG boost",
            "content": "Increases the wearer's DMG by {{DmgBuff}}%."
          },
          "defeatedEnemyAtkStacks": {
            "text": "Defeated enemy ATK stacks",
            "content": "For every enemy defeated by the wearer, the wearer's ATK increases by {{AtkBuff}}%, stacking up to 3 times."
          }
        }
      },
      "TheStorysNextPage": {
        "Content": {
          "ohbBuff": {
            "text": "OHB buff",
            "content": "After the wearer's memosprite attacks, the Outgoing Healing of the wearer and their memosprite increases by {{OHBBuff}}% , lasting for 1 turn."
          }
        }
      },
      "ThisIsMe": {
        "Content": {
          "defScalingUltDmg": {
            "text": "DEF scaling Ult DMG (Not implemented)",
            "content": "Increases the DMG of the wearer when they use their Ultimate by {{Multiplier}}% of the wearer's DEF. This effect only applies 1 time per enemy target during each use of the wearer's Ultimate."
          }
        }
      },
      "TodayIsAnotherPeacefulDay": {
        "Content": {
          "maxEnergyDmgBoost": {
            "text": "Max energy",
            "content": "After entering battle, increases the wearer's DMG based on their Max Energy. DMG increases by {{DmgStep}}% per point of Energy, up to 160 Energy."
          }
        }
      },
      "UnderTheBlueSky": {
        "Content": {
          "defeatedEnemyCrBuff": {
            "text": "Defeated enemy CR buff",
            "content": "When the wearer defeats an enemy, the wearer's CRIT Rate increases by {{CritBuff}}% for 3 turns."
          }
        }
      },
      "UntoTomorrowsMorrow": {
        "Content": {
          "hp50DmgBoost": {
            "text": "HP ≥ 50% DMG boost",
            "content": "When an ally target's current HP percentage is greater than or equal to 50%, increases their DMG dealt by {{DmgBuff}}%."
          }
        }
      },
      "VictoryInABlink": {
        "Content": {
          "teamDmgBuff": {
            "text": "Team DMG buff",
            "content": "When the wearer's memosprite uses an ability on any ally target, increases all ally targets' DMG dealt by {{DmgBuff}}%, lasting for 3 turns."
          }
        }
      },
      "WeAreWildfire": {
        "Content": {
          "initialDmgReductionBuff": {
            "text": "Initial DMG reduction buff",
            "content": "At the start of the battle, the DMG dealt to all allies decreases by {{DmgReduction}}% for 5 turns. At the same time, immediately restores HP to all allies equal to {{Healing}}% of the respective HP difference between the characters' Max HP and current HP."
          }
        }
      },
      "WeWillMeetAgain": {
        "Content": {
          "extraDmgProc": {
            "text": "Additional DMG proc",
            "content": "After the wearer uses Basic ATK or Skill, deals Additional DMG equal to {{Multiplier}}% of the wearer's ATK to a random enemy that has been attacked."
          }
        }
      },
      "WoofWalkTime": {
        "Content": {
          "enemyBurnedBleeding": {
            "text": "Enemy burn / bleed DMG boost",
            "content": "Increases the wearer's DMG to enemies afflicted with Burn or Bleed by {{DmgBuff}}%. This also applies to DoT."
          }
        }
      },
      "Adversarial": {
        "Content": {
          "defeatedEnemySpdBuff": {
            "text": "Defeated enemy SPD buff",
            "content": "When the wearer defeats an enemy, increases SPD by {{SpdBuff}}% for 2 turns."
          }
        }
      },
      "Amber": {
        "Content": {
          "hp50DefBuff": {
            "text": "HP < 50% DEF buff",
            "content": "If the wearer's current HP is lower than 50%, increases their DEF by a further {{DefBuff}}%."
          }
        }
      },
      "Arrows": {
        "Content": {
          "critBuff": {
            "text": "Initial CR buff",
            "content": "At the start of the battle, the wearer's CRIT Rate increases by {{CritBuff}}% for 3 turns."
          }
        }
      },
      "Chorus": {
        "Content": {
          "inBattleAtkBuff": {
            "text": "Initial ATK buff",
            "content": "After entering battle, increases the ATK of all allies by {{AtkBuff}}%. Effects of the same type cannot stack."
          }
        }
      },
      "CollapsingSky": {
        "Content": {
          "basicSkillDmgBuff": {
            "text": "Basic / Skill DMG buff",
            "content": "Increases the wearer's Basic ATK and Skill DMG by {{DmgBuff}}%."
          }
        }
      },
      "Cornucopia": {
        "Content": {
          "healingBuff": {
            "text": "Healing buff",
            "content": "When the wearer uses their Skill or Ultimate, their Outgoing Healing increases by {{HealingBuff}}%."
          }
        }
      },
      "DartingArrow": {
        "Content": {
          "defeatedEnemyAtkBuff": {
            "text": "Defeated enemy ATK buff",
            "content": "When the wearer defeats an enemy, increases ATK by {{AtkBuff}}% for 3 turns."
          }
        }
      },
      "DataBank": {
        "Content": {
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "content": "Increases the wearer's Ultimate DMG by {{DmgBuff}}%."
          }
        }
      },
      "HiddenShadow": {
        "Content": {
          "basicAtkBuff": {
            "text": "Basic ATK additional DMG",
            "content": "After using Skill, the wearer's next Basic ATK deals Additional DMG equal to {{MultiplierBonus}}% of ATK to the target enemy."
          }
        }
      },
      "Loop": {
        "Content": {
          "enemySlowedDmgBuff": {
            "text": "Enemy slowed DMG buff",
            "content": "Increases DMG dealt from its wearer to Slowed enemies by {{DmgBuff}}%."
          }
        }
      },
      "Mediation": {
        "Content": {
          "initialSpdBuff": {
            "text": "Initial SPD buff",
            "content": "Upon entering battle, increases SPD of all allies by {{SpdBuff}} points for 1 turn."
          }
        }
      },
      "MutualDemise": {
        "Content": {
          "selfHp80CrBuff": {
            "text": "Self HP < 80% CR buff",
            "content": "If the wearer's current HP is lower than 80%, CRIT Rate increases by {{CritBuff}}%."
          }
        }
      },
      "Reminiscence": {
        "Content": {
          "dmgStacks": {
            "text": "DMG stacks",
            "content": "When memosprite's turn starts, the wearer and the memosprite each gain 1 stack of \"Commemoration.\" Each stack increases DMG dealt by {{DmgBuff}}%, stacking up to 4 times. \"Commemoration\" is removed from the wearer and the memosprite when the memosprite disappears."
          }
        }
      },
      "Sagacity": {
        "Content": {
          "postUltAtkBuff": {
            "text": "Post Ult ATK buff",
            "content": "When the wearer uses their Ultimate, increases ATK by {{AtkBuff}}% for 2 turns."
          }
        }
      },
      "ShatteredHome": {
        "Content": {
          "enemyHp50Buff": {
            "text": "Enemy HP > 50% DMG buff",
            "content": "The wearer deals {{DmgBuff}}% more DMG to enemy targets whose HP percentage is greater than 50%."
          }
        }
      },
      "Void": {
        "Content": {
          "initialEhrBuff": {
            "text": "Initial EHR buff",
            "content": "At the start of the battle, the wearer's Effect Hit Rate increases by {{EhrBuff}}% for 3 turns."
          }
        }
      }
    },
    "Characters": {
      "Acheron": {
        "Content": {
          "crimsonKnotStacks": {
            "text": "Crimson Knot stacks",
            "content": "Rainblade: Deals Lightning DMG equal to {{RainbladeScaling}}% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to {{CrimsonKnotScaling}}% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, the DMG Multiplier for this is additionally increased.::BR::When the Rainblade from Acheron's Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 times."
          },
          "nihilityTeammatesBuff": {
            "text": "Nihility teammates buff",
            "content": "When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to 115% or 160% of the original DMG respectively.::BR::E2: The number of Nihility characters required for the Trace The Abyss to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks."
          },
          "thunderCoreStacks": {
            "text": "Thunder Core stacks",
            "content": "When the Rainblade from Acheron's Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 times and lasting for 3 turns."
          },
          "stygianResurgeHitsOnTarget": {
            "text": "Stygian Resurge hits",
            "content": "When Stygian Resurge triggers, additionally deals DMG for 6 times. Each time deals Lightning DMG equal to 25% of Acheron's ATK to a single random enemy and is viewed as part of the Ultimate DMG."
          },
          "e1EnemyDebuffed": {
            "text": "E1 CR boost",
            "content": "When dealing DMG to debuffed enemies, increases the CRIT Rate by 18%."
          },
          "e4UltVulnerability": {
            "text": "E4 Ult vulnerability",
            "content": "When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%."
          },
          "e6UltBuffs": {
            "text": "E6 Ult buffs",
            "content": "Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect."
          }
        }
      },
      "Aglaea": {
        "Content": {
          "supremeStanceState": {
            "text": "Supreme Stance state",
            "content": "While in the \"Supreme Stance\" state, Aglaea gains the SPD Boost stacks from Garmentmaker's Memosprite Talent, with each stack increasing her SPD by {{SpdBuff}}%. Enhances Basic ATK to \"Slash by a Thousandfold Kiss,\" and cannot use Skill."
          },
          "seamStitch": {
            "text": "Seam Stitch",
            "content": "While Garmentmaker is on the field, Aglaea's attacks inflict the target with the \"Seam Stitch\" state. After attacking enemies in the \"Seam Stitch\" state, further deals Lightning Additional DMG equal to {{Scaling}}% of Aglaea's ATK. \"Seam Stitch\" only takes effect on the most recently inflicted target."
          },
          "memoSpdStacks": {
            "text": "Memo SPD stacks",
            "content": "After attacking an enemy afflicted with \"Seam Stitch,\" increases this unit's SPD by {{SpdBuff}}, stacking up to {{StackLimit}} times."
          },
          "e1Vulnerability": {
            "text": "E1 vulnerability",
            "content": "Enemies afflicted with \"Seam Stitch\" take 15% increased DMG."
          },
          "e2DefShredStacks": {
            "text": "E2 DEF PEN stacks",
            "content": "When Aglaea or Garmentmaker takes action, the DMG dealt by Aglaea and Garmentmaker ignores 14% of the target's DEF. This effect stacks up to 3 times and lasts until any unit, other than Aglaea or Garmentmaker, actively uses an ability."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "While Aglaea is in \"Supreme Stance,\" increases her and Garmentmaker's Lightning RES PEN by 20%. When Aglaea or Garmentmaker's SPD is greater than 160/240/320, the DMG dealt by Joint ATK increases by 10%/30%/60%."
          }
        }
      },
      "Anaxa": {
        "Content": {
          "skillHits": {
            "text": "Skill additional hits",
            "content": "Number of times the skill hits the main target"
          },
          "exposedNature": {
            "text": "Qualitative Disclosure",
            "content": "While Anaxa is on the battlefield, inflicts the \"Qualitative Disclosure\" state to enemy targets with at least 5 different Weaknesses. Anaxa deals {{DmgBuff}}% more DMG to targets in \"Qualitative Disclosure\" state."
          },
          "eruditionTeammateBuffs": {
            "text": "Erudition teammate buffs",
            "content": "Trigger any 1 effect in the current battle based on the number of characters on the Path of Erudition in the team: ::BR:: 1: Increases Anaxa's CRIT DMG by 140%. ::BR:: At least 2: Increases DMG dealt by all allies by 50%."
          },
          "enemyWeaknessTypes": {
            "text": "Enemy weaknesses",
            "content": "For every different Weakness Type an enemy target has, the DMG that Anaxa deals to that target ignores 4% of DEF, up to a max of 7 Weakness Types."
          },
          "e1DefPen": {
            "text": "E1 DEF PEN",
            "content": "When any enemy targets are hit by this Anaxa's Skill, decreases the targets' DEF by 16% for 2 turns."
          },
          "e2ResPen": {
            "text": "E2 RES PEN",
            "content": "When enemy targets enter the battle, triggers the Talent's Weakness Implant effect 1 time, and reduces their All-Type RES by 20%."
          },
          "e4AtkBuffStacks": {
            "text": "E4 ATK buff stacks",
            "content": "When using Skill, increases ATK by 30% for 2 turns. This effect can stack up to 2 times."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "The DMG dealt by Anaxa is 130% of the original DMG. The 2 effects of the Trace \"Imperative Hiatus\" will be triggered directly and will no longer depend on the number of Erudition characters on the team."
          }
        }
      },
      "Archer": {
        "Content": {
          "cdBuff": {
            "text": "CD buff",
            "content": "After allies gain a Skill Point, if there are 4 Skill Points or more, increases Archer's CRIT DMG by 120% for 1 turns."
          },
          "skillEnhances": {
            "text": "Skill enhances",
            "content": "When Archer uses his Skill, the current turn does not end, and the DMG dealt by Archer's Skill increases by {{SkillDmgBuff}}%."
          },
          "e2QuantumResPen": {
            "text": "E2 Quantum RES PEN",
            "content": "When using Ultimate, reduces the enemy target's Quantum RES by 20%, and induces Quantum Weakness for it, lasting for 2 turns."
          },
          "e4UltDmg": {
            "text": "E4 Ult DMG",
            "content": "Increases Ultimate DMG dealt by 150%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "The number of maximum stacks for the DMG boost effect provided by his Skill increases by 1. His Skill DMG dealt ignores 20% of DEF."
          }
        }
      },
      "Argenti": {
        "Content": {
          "ultEnhanced": {
            "text": "Enhanced Ult",
            "content": "Consumes 180 Energy and deals Physical DMG equal to {{ultEnhancedScaling}}% of Argenti's ATK to all enemies, and further deals DMG for 6 extra times, with each time dealing Physical DMG equal to {{ultEnhancedExtraHitScaling}}% of Argenti's ATK to a random enemy."
          },
          "enemyHp50": {
            "text": "Enemy HP ≤ 50% DMG boost",
            "content": "Deals 15% more DMG to enemies whose HP percentage is 50% or less."
          },
          "talentStacks": {
            "text": "Apotheosis stacks",
            "content": "Increases CR by {{talentCrStackValue}}% per stack, max of {{talentMaxStacks}} stacks."
          },
          "ultEnhancedExtraHits": {
            "text": "Enhanced Ult extra hits on target",
            "content": "Enhanced Ult hits a random enemy for {{ultEnhancedExtraHitScaling}}% ATK per hit."
          },
          "e2UltAtkBuff": {
            "text": "E2 Ult ATK buff",
            "content": "If the number of enemies on the field equals to 3 or more, increases ATK by 40% for 1 turn."
          }
        }
      },
      "Arlan": {
        "Content": {
          "selfCurrentHpPercent": {
            "text": "Self current HP%",
            "content": "Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of {{talentMissingHpDmgBoostMax}}% DMG dealt by Arlan."
          }
        }
      },
      "Asta": {
        "Content": {
          "skillExtraDmgHits": {
            "text": "Skill extra hits",
            "content": "Deals Fire DMG equal to {{skillScaling}}% of Asta's ATK to a single enemy and further deals DMG for {{skillExtraDmgHitsMax}} extra times, with each time dealing Fire DMG equal to {{skillScaling}}% of Asta's ATK to a random enemy.::BR::E1: When using Skill, deals DMG for 1 extra time to a random enemy."
          },
          "talentBuffStacks": {
            "text": "Talent ATK buff stacks",
            "content": "Increases allies' ATK by {{talentStacksAtkBuff}}% for every stack.::BR::E4: Asta's Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks."
          },
          "ultSpdBuff": {
            "text": "Ult SPD buff active",
            "content": "Increases SPD of all allies by {{ultSpdBuffValue}} for 2 turns."
          },
          "fireDmgBoost": {
            "text": "Fire DMG buff",
            "content": "When Asta is on the field, all allies' Fire DMG increases by 18%."
          }
        }
      },
      "Aventurine": {
        "Content": {
          "defToCrBoost": {
            "text": "DEF to CR buff",
            "content": "For every 100 of Aventurine's DEF that exceeds 1600, increases his own CRIT Rate by 2%, up to a maximum increase of 48%."
          },
          "fortifiedWagerBuff": {
            "text": "Fortified Wager buff",
            "content": "For any single ally with Fortified Wager, their Effect RES increases by {{talentResScaling}}%, and when they get attacked, Aventurine gains 1 point of Blind Bet.::BR::E1: Increases CRIT DMG by 20% for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turns."
          },
          "enemyUnnervedDebuff": {
            "text": "Enemy Unnerved",
            "content": "When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by {{ultCdBoost}}%."
          },
          "fuaHitsOnTarget": {
            "text": "FUA hits on target",
            "content": "Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit follow-up attack, with each hit dealing Imaginary DMG equal to {{talentDmgScaling}}% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points.::BR::E4: When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turns, and additionally increases the Hits Per Action for his talent's follow-up attack by 3."
          },
          "e2ResShred": {
            "text": "E2 RES shred",
            "content": "When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turns."
          },
          "e4DefBuff": {
            "text": "E4 DEF buff",
            "content": "When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turns."
          },
          "e6ShieldStacks": {
            "text": "E6 shield stacks",
            "content": "For every ally that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%."
          }
        }
      },
      "Bailu": {
        "Content": {
          "healingMaxHpBuff": {
            "text": "Healing max HP buff",
            "content": "When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by 10% for 2 turns."
          },
          "talentDmgReductionBuff": {
            "text": "Ult DMG reduction",
            "content": "Characters with Invigoration take 10% less DMG."
          },
          "e2UltHealingBuff": {
            "text": "E2 Ult healing buff",
            "content": "Increases healing by 15% after Ultimate."
          },
          "e4SkillHealingDmgBuffStacks": {
            "text": "E4 Skill DMG boost stacks",
            "content": "Every healing provided by Bailu's Skill makes the recipient deal 10% more DMG for 2 turns. This effect can stack up to 3 times."
          }
        }
      },
      "BlackSwan": {
        "Content": {
          "ehrToDmgBoost": {
            "text": "EHR to DMG boost",
            "content": "Increases this unit's DMG by an amount equal to 60% of Effect Hit Rate, up to a maximum DMG increase of 72%."
          },
          "epiphanyDebuff": {
            "text": "Epiphany debuff",
            "content": "Enemies affected by Epiphany take {{epiphanyDmgTakenBoost}}% more DMG in their turn."
          },
          "defDecreaseDebuff": {
            "text": "DEF shred debuff",
            "content": "Enemies DEF is decreased by {{defShredValue}}%."
          },
          "arcanaStacks": {
            "text": "Arcana stacks",
            "content": "While afflicted with Arcana, enemy targets receive Wind DoT equal to {{dotScaling}}% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DoT DMG multiplier by {{arcanaStackMultiplier}}%. Arcana can stack up to 50 times.::BR::When there are 3 or more Arcana stacks, deals Wind DoT to adjacent targets. When there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF."
          },
          "e1ResReduction": {
            "text": "E1 RES shred",
            "content": "While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%."
          },
          "e4EffResPen": {
            "text": "E4 Effect RES shred",
            "content": "While in the Epiphany state, enemy targets have their Effect RES reduced by 10%."
          }
        }
      },
      "Blade": {
        "Content": {
          "enhancedStateActive": {
            "text": "Hellscape state",
            "content": "Increases DMG by {{enhancedStateDmgBoost}}% and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turns.::BR::E2: Increases CRIT Rate by 15%."
          },
          "hpPercentLostTotal": {
            "text": "HP% lost total",
            "content": "Ultimate DMG scales off of the tally of Blade's HP loss in the current battle. The tally of Blade's HP loss in the current battle is capped at {{hpPercentLostTotalMax}}% of his Max HP."
          },
          "e4MaxHpIncreaseStacks": {
            "text": "E4 max HP stacks",
            "content": "Increases HP by 20%, stacks up to 2 times."
          }
        }
      },
      "BladeB1": {
        "Content": {
          "enhancedStateActive": {
            "text": "Hellscape state",
            "content": "When using his skill, Blade consumes HP equal to 30% of his Max HP to enter the \"Hellscape\" state. While under the \"Hellscape\" state, his Skill cannot be used, his DMG dealt increases by {{DmgBuff}}%, the chance of receiving attacks from enemy targets greatly increases, and his Basic ATK \"Shard Sword\" is enhanced to \"Forest of Swords\" for 3 turns."
          },
          "hpPercentLostTotal": {
            "text": "HP% lost total",
            "content": "When using ultimate, deals Wind DMG to one designated enemy equal to the sum of {{UltHpScaling}}% of his Max HP and {{HpTallyUltScaling}}% of the tally of Blade's HP loss in the current battle. ::BR:: E1: Blade's Enhanced Basic ATK and Ultimate deals additionally increased DMG to one designated enemy, with the increased amount equal to 150% of the tally of Blade's HP loss from his Ultimate."
          },
          "e1BasicUltMultiBoost": {
            "text": "E1 Ult / Basic boost",
            "content": "Blade's Enhanced Basic ATK and Ultimate deals additionally increased DMG to one designated enemy, with the increased amount equal to 150% of the tally of Blade's HP loss from his Ultimate."
          },
          "e2CrBuff": {
            "text": "E2 CR buff",
            "content": "When Blade is in the \"Hellscape\" state, his CRIT Rate increases by 15%."
          },
          "e4MaxHpIncreaseStacks": {
            "text": "E4 max HP stacks",
            "content": "When Blade's current HP percentage drops from above 50% to 50% of his Max HP or lower, increases his Max HP by 20%. Stacks up to 2 times."
          }
        }
      },
      "Boothill": {
        "Content": {
          "standoffActive": {
            "text": "Standoff Active",
            "content": "Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for 2 turns. This duration reduces by 1 at the start of Boothill's every turn. The enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by {{standoffVulnerabilityBoost}}%/15%."
          },
          "pocketTrickshotStacks": {
            "text": "Pocket Trickshots",
            "content": "Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by 50%, stacking up to 3 times."
          },
          "beToCritBoost": {
            "text": "BE to CR / CD buff",
            "content": "Increase this character's CRIT Rate/CRIT DMG, by an amount equal to 10%/50% of Break Effect, up to a max increase of 30%/150%."
          },
          "talentBreakDmgScaling": {
            "text": "Talent Break DMG (force weakness break)",
            "content": "If the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals Break DMG to this target based on Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed 16 times the base Toughness Reduction of the Basic Attack Skullcrush Spurs."
          },
          "e1DefShred": {
            "text": "E1 DEF PEN",
            "content": "When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores 16% of the enemy target's DEF."
          },
          "e2BeBuff": {
            "text": "E2 BE buff",
            "content": "When in Standoff and gaining Pocket Trickshot, recovers 1 Skill Point and increases Break Effect by 30%, lasting for 2 turns. Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn."
          },
          "e4TargetStandoffVulnerability": {
            "text": "E4 Skill vulnerability",
            "content": "When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by 12%. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by 12%."
          },
          "e6AdditionalBreakDmg": {
            "text": "E6 Break DMG boost",
            "content": "When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40% of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to 70% of the original DMG multiplier."
          }
        }
      },
      "Bronya": {
        "Content": {
          "teamDmgBuff": {
            "text": "Team DMG buff",
            "content": "When Bronya is on the field, all allies deal 10% more DMG."
          },
          "skillBuff": {
            "text": "Skill DMG buff",
            "content": "Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by {{skillDmgBoostValue}}% for 1 turn."
          },
          "ultBuff": {
            "text": "Ult ATK / CD buffs",
            "content": "Increases the ATK of all allies by {{ultAtkBoostValue}}% and CRIT DMG by {{ultCdBoostValue}}% of Bronya's CRIT DMG plus {{ultCdBoostBaseValue}}% for 2 turns."
          },
          "battleStartDefBuff": {
            "text": "Initial DEF buff",
            "content": "At the start of the battle, all allies' DEF increases by 20% for 2 turns."
          },
          "techniqueBuff": {
            "text": "Technique ATK buff",
            "content": "After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turns."
          },
          "e2SkillSpdBuff": {
            "text": "E2 Skill SPD buff",
            "content": "When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateCDValue": {
            "text": "Bronya's Combat CD",
            "content": "Increases the ATK of all allies by {{ultAtkBoostValue}}% and CRIT DMG by {{ultCdBoostValue}}% of Bronya's CRIT DMG plus {{ultCdBoostBaseValue}}% for 2 turns."
          }
        }
      },
      "Castorice": {
        "Content": {
          "memospriteActive": {
            "text": "Memosprite active",
            "content": "While Netherwing is on the field, the Territory \"Lost Netherland\" is active, decreasing all enemies' All-Type RES by {{ResDown}}%."
          },
          "spdBuff": {
            "text": "SPD buff",
            "content": "When Castorice's current HP is greater or equal to 50% of this unit's Max HP, her SPD increases by 40%."
          },
          "talentDmgStacks": {
            "text": "Talent DMG stacks",
            "content": "When allies lose HP, Castorice's and Netherwing's DMG dealt increase by {{DmgBuff}}%. This effect can stack up to 3 times, lasting for 3 turns."
          },
          "memoSkillEnhances": {
            "text": "Memo Skill enhances",
            "content": "In one attack, \"Breath Scorches the Shadow\" can be activated repeatedly, with the DMG multiplier increasing respectively to {{Multiplier1Enhance}}% / {{Multiplier2Enhance}}%, until {{Multiplier2Enhance}}%. The DMG Multiplier Boost effect will not be reduced before Netherwing disappears."
          },
          "memoTalentHits": {
            "text": "Memo Talent hits",
            "content": "When Netherwing disappears, deals {{BounceCount}} instances of DMG, with every instance dealing Quantum DMG equal to {{Scaling}}% of Castorice's Max HP to one random enemy units."
          },
          "teamDmgBoost": {
            "text": "Team DMG boost",
            "content": "When Netherwing is summoned, increases DMG dealt by all allies by 10% for 3 turns."
          },
          "memoDmgStacks": {
            "text": "Memo DMG stacks",
            "content": "Each time Netherwing uses \"Breath Scorches the Shadow,\" increases its DMG dealt by 30%. This effect stacks up to 6 and lasts until the end of this turn."
          },
          "e1EnemyHp50": {
            "text": "E1 Enemy HP ≤ 50%",
            "content": "When the enemy target's current HP is 50% or lower than this unit's Max HP, the DMG dealt with \"Boneclaw, Doomdrake's Embrace,\" \"Claw Splits the Veil,\" \"Breath Scorches the Shadow,\" and \"Wings Sweep the Ruins\" is 140% of the original DMG."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "When Castorice or Netherwing deals DMG, increases Quantum RES PEN by 20%. ::BR:: Increases the Bounce count for Netherwing's Talent \"Wings Sweep the Ruins\" by 3 times."
          }
        }
      },
      "Cerydra": {
        "Content": {
          "spdBuff": {
            "text": "SPD buff",
            "content": "When using Skill, increases SPD by 20 for this unit and the teammate with \"Military Merit,\" lasting for 3 turns."
          },
          "crBuff": {
            "text": "CR buff",
            "content": "Increases Cerydra's CRIT Rate by 100%."
          },
          "atkToCd": {
            "text": "ATK to CD",
            "content": "For every 100 of Cerydra's ATK that exceeds 2000, increases her CRIT DMG by 18%, up to a max increase of 360%."
          },
          "e2DmgBoost": {
            "text": "E2 DMG boost",
            "content": "The character with \"Military Merit\" deals 40% increased DMG. While a teammate on the field has \"Military Merit,\" Cerydra's DMG dealt increases by 160%."
          },
          "e4UltDmg": {
            "text": "E4 Ult DMG",
            "content": "Increases Ultimate's DMG multiplier by 240%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "The character with \"Military Merit\" increases their All-Type RES PEN by 20%, and the multiplier for the Additional DMG triggered via \"Military Merit\" increases by 300%. While a teammate on the field has \"Military Merit,\" Cerydra's All-Type RES PEN increases by 20%."
          }
        },
        "TeammateContent": {
          "militaryMerit": {
            "text": "Military Merit",
            "content": "When using Skill, increases SPD by 20 for this unit and the teammate with \"Military Merit,\" lasting for 3 turns. ::BR:: The character with \"Military Merit\" increases ATK by an amount equal to {{TalentAtkConversion}}% of Cerydra's ATK. ::BR:: E1: The character with \"Military Merit\" ignores 16% of the targets' DEF when dealing DMG."
          },
          "peerage": {
            "text": "Peerage",
            "content": "The character with \"Peerage\" increases the CRIT DMG for their dealt Skill DMG by {{SkillCdBuff}}%, increases their All-Type RES PEN by {{SkillResPenBuff}}% ::BR:: E1: If \"Military Merit\" has been upgraded to \"Peerage,\" then the character additionally ignores 20% of the targets' DEF when dealing Skill DMG."
          },
          "teammateATKValue": {
            "text": "Cerydra's combat ATK",
            "content": "The character with \"Military Merit\" increases ATK by an amount equal to {{TalentAtkConversion}}% of Cerydra's ATK. ::BR:: Set this to the Cerydra's self ATK stat that she uses to buff teammates."
          },
          "e1DefPen": {
            "text": "E1 DEF PEN",
            "content": "The character with \"Military Merit\" ignores 16% of the targets' DEF when dealing DMG. If \"Military Merit\" has been upgraded to \"Peerage,\" then the character additionally ignores 20% of the targets' DEF when dealing Skill DMG."
          }
        }
      },
      "Cipher": {
        "Content": {
          "vulnerability": {
            "text": "Team Vulnerability",
            "content": "When Cipher is on the battlefield, DMG received by all enemy targets increases by 40%."
          },
          "skillAtkBuff": {
            "text": "Skill ATK buff",
            "content": "When using skill, there is a 120% base chance to Weaken one designated enemy and adjacent targets, decreasing their DMG dealt by 10% and increasing Cipher's ATK by 30%, lasting for 2 turns."
          },
          "fuaCdBoost": {
            "text": "FUA CD boost",
            "content": "Increases the CRIT DMG dealt by the Talent's Follow-up ATK by 100%."
          },
          "spdBasedBuffs": {
            "text": "SPD based buffs",
            "content": "When Cipher's SPD is greater or equal to 140/170, increases CRIT Rate by 25%/50%."
          },
          "e1AtkBuff": {
            "text": "E1 ATK buff",
            "content": "When using a Follow-up ATK caused by her Talent, increases Cipher's ATK by 80% for 2 turns."
          },
          "e2Vulnerability": {
            "text": "E2 vulnerability",
            "content": "When Cipher hits an enemy target, there is a 120% base chance of causing them to receive 30% more DMG, lasting 2 turns."
          },
          "e4AdditionalDmg": {
            "text": "E4 Additional DMG",
            "content": "After \"Patron\" is attacked by an ally target, Cipher deals Quantum Additional DMG equal to 50% of Cipher's ATK to it."
          },
          "e6FuaDmg": {
            "text": "E6 FUA DMG",
            "content": "Increases DMG dealt by Follow-up ATKs caused by Cipher's Talent by 350%."
          }
        }
      },
      "Clara": {
        "Content": {
          "ultBuff": {
            "text": "Ult buffs",
            "content": "Increases Svarog Counter DMG by {{ultFuaExtraScaling}}% during Ultimate. DMG dealt to Clara is reduced by an extra {{ultDmgReductionValue}}% for 2 turns."
          },
          "talentEnemyMarked": {
            "text": "Enemy Marked",
            "content": "Additionally deals Physical DMG equal to {{skillScaling}}% of Clara's ATK to enemies marked by Svarog with a Mark of Counter."
          },
          "e2UltAtkBuff": {
            "text": "E2 Ult ATK buff",
            "content": "After using Ultimate, increases ATK by 30% for 2 turns."
          },
          "e4DmgReductionBuff": {
            "text": "E4 DMG reduction buff",
            "content": "Decreases DMG taken by 30%."
          }
        }
      },
      "DanHeng": {
        "Content": {
          "talentPenBuff": {
            "text": "Talent RES PEN buff",
            "content": "When Dan Heng is the target of an ally's Ability, his next attack's Wind RES PEN increases by {{extraPenValue}}%."
          },
          "enemySlowed": {
            "text": "Enemy slowed",
            "content": "Basic ATK deals 40% more damage to Slowed enemies."
          },
          "spdBuff": {
            "text": "SPD buff",
            "content": "After launching an attack, there is a 50% fixed chance to increase this unit's SPD by 20% for 2 turns."
          },
          "e1EnemyHp50": {
            "text": "E1 enemy HP ≥ 50% CR boost",
            "content": "When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%."
          }
        }
      },
      "DrRatio": {
        "Content": {
          "summationStacks": {
            "text": "Summation stacks",
            "content": "When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by 2.5% and CRIT DMG by 5%. This effect can stack up to {{summationStacksMax}} times."
          },
          "enemyDebuffStacks": {
            "text": "Enemy debuff stacks",
            "content": "When using his Skill, Dr. Ratio has a 40% fixed chance of launching a follow-up attack against his target for 1 time, dealing Imaginary DMG equal to {{FuaScaling}}% of Dr. Ratio's ATK. For each debuff the target enemy has, the fixed chance of launching follow-up attack increases by 20%. If the target enemy is defeated before the follow-up attack triggers, the follow-up attack will be directed at a single random enemy instead.::BR::When dealing DMG to a target that has 3 or more debuffs, for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by 10%, up to a maximum increase of 50%.::BR::E2: When his Talent's follow-up attack hits a target, for every debuff the target has, additionally deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 times during each follow-up attack."
          }
        }
      },
      "Evernight": {
        "Content": {
          "memoTalentDmgBuff": {
            "text": "Memo Talent DMG Buff",
            "content": "While Evernight is on the field, increases DMG dealt by Evernight and Evey by {{MemoTalentDmgBuff}}%."
          },
          "crBuff": {
            "text": "CR buff",
            "content": "Increases Evernight and the memosprite Evey's CRIT Rate by 35%."
          },
          "skillMemoCdBuff": {
            "text": "Skill Memo CD buff",
            "content": "Consumes 10% of Evernight's current HP to summon memosprite Evey and increases CRIT DMG of all ally memosprites by an amount equal to {{SkillMemoCdBuff}}% of Evernight's CRIT DMG for 2 turns."
          },
          "talentMemoCdBuff": {
            "text": "Talent Memo CD buff",
            "content": "Each time Evernight or memosprite Evey loses HP, increases CRIT DMG for both this unit and memosprite Evey by {{TalentCdScaling}}% for 2 turns."
          },
          "traceCdBuff": {
            "text": "Trace CD buff",
            "content": "When using abilities, consumes 5% of this unit's current HP to increase both their CRIT DMG by 15% for 2 turns."
          },
          "memoriaStacks": {
            "text": "Memoria stacks",
            "content": "This ability automatically selects a target, prioritizing the enemy target that Evernight last attacked. Deals Ice DMG equal to {{MemoSkillScaling}}% of Evey's Max HP to one enemy. For every 4 points of \"Memoria\" Evernight currently has, further deals Ice DMG equal to {{MemoSkillAdditionalScaling}}% of Evey's Max HP. ::BR:: When Evernight's \"Memoria\" is greater than or equal to 16 points, and Evernight is not under a Crowd Control state, \"Dream, Dissolving, as Dew\" will instead be used. For each point of \"Memoria\" currently in possession, deals Ice DMG equal to {{MemoSkillEnhancedScaling}}% of Evey's Max HP to the primary target"
          },
          "enhancedState": {
            "text": "Enhanced state",
            "content": "Casting her ultimate causes Evernight to enter the \"Darkest Riddle\" state. During this state, the DMG received by all enemies increases by {{UltVulnScaling}}%, the DMG dealt by Evernight and memosprite Evey increases by {{UltDmgBoostScaling}}%."
          },
          "e1FinalDmg": {
            "text": "E1 Final DMG",
            "content": "When Evernight is on the field and when there are 4 or more/3/2/1 enemy targets on the field, ally memosprites deal 120%/125%/130%/150% of their original DMG respectively."
          },
          "e2CdBuff": {
            "text": "E2 CD buff",
            "content": "Increases Evernight's and memosprite Evey's CRIT DMG by 40%."
          },
          "e4Buffs": {
            "text": "E4 buffs",
            "content": "While Evernight is on the field, ally memosprites' Weakness Break Efficiency increases by 25%, and memosprite Evey gains an additional 25% Weakness Break Efficiency."
          },
          "e6ResPen": {
            "text": "E6 RES PEN",
            "content": "While Evernight is on the field, all allies' All-Type RES PEN increases by 20%. After memosprite Evey uses \"Dream, Dissolving, as Dew,\" Evernight gains 30% of the consumed \"Memoria\" in this attack."
          }
        },
        "TeammateContent": {
          "skillMemoCdBuff": {
            "text": "Skill Memo CD buff",
            "content": "When using Skill, increases CRIT DMG of all ally memosprites by an amount equal to {{SkillCdScaling}}% of Evernight's CRIT DMG for 2 turns."
          },
          "evernightCombatCD": {
            "text": "Evernight's combat CD",
            "content": "When using Skill, increases CRIT DMG of all ally memosprites by an amount equal to {{SkillCdScaling}}% of Evernight's CRIT DMG for 2 turns. ::BR:: Set this to the Evernight's self CD stat that she uses to buff teammates."
          }
        }
      },
      "Feixiao": {
        "Content": {
          "weaknessBrokenUlt": {
            "text": "Weakness broken ult (force weakness break)",
            "content": "Overrides weakness break to be enabled."
          },
          "talentDmgBuff": {
            "text": "Talent DMG buff",
            "content": "After Feixiao's teammates attack enemy targets, Feixiao immediately launches follow-up attack against the primary target, dealing Wind DMG equal to {{FuaMultiplier}}% of Feixiao's ATK. If there is no primary target available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by {{DmgBuff}}%, lasting for 2 turns."
          },
          "skillAtkBuff": {
            "text": "Skill ATK buff",
            "content": "When using Skill, increases ATK by 48%, lasting for 3 turns."
          },
          "e1OriginalDmgBoost": {
            "text": "E1 original DMG boost",
            "content": "After launching Boltsunder Blitz or Waraxe Skyward, additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to 10% of the original DMG, stacking up to 5 times and lasting until the end of the Ultimate action."
          },
          "e4Buffs": {
            "text": "E4 buffs",
            "content": "The Toughness Reduction from the Talent's Follow-up ATK increases by 100% and, when launched, increases this unit's SPD by 8%, lasting for 2 turns."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by 20%. Talent's follow-up attack DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by 140%."
          }
        }
      },
      "Firefly": {
        "Content": {
          "enhancedStateActive": {
            "text": "Enhanced state",
            "content": "Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill."
          },
          "enhancedStateSpdBuff": {
            "text": "Enhanced SPD buff",
            "content": "While in Complete Combustion, increases SPD by {{ultSpdBuff}}."
          },
          "superBreakDmg": {
            "text": "Super Break enabled (force weakness break)",
            "content": "When SAM is in Complete Combustion with a Break Effect that is equal to or greater than 200%/360%, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of 35%/50% Super Break DMG."
          },
          "atkToBeConversion": {
            "text": "ATK to BE buff",
            "content": "For every 10 points of SAM's ATK that exceeds 1800, increases this unit's Break Effect by 0.8%."
          },
          "talentDmgReductionBuff": {
            "text": "Max EHP buff",
            "content": "The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to {{talentDmgReductionBuff}}%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by {{talentResBuff}}%."
          },
          "e1DefShred": {
            "text": "E1 DEF PEN",
            "content": "When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points."
          },
          "e4ResBuff": {
            "text": "E4 RES buff",
            "content": "While in Complete Combustion, increases SAM's Effect RES by 50%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break efficiency by 50%."
          }
        }
      },
      "Fugue": {
        "Content": {
          "torridScorch": {
            "text": "Torrid Scorch state",
            "content": "While in the \"Torrid Scorch\" state, Fugue's Basic ATK will be enhanced."
          },
          "foxianPrayer": {
            "text": "Foxian Prayer BE buff",
            "content": "The ally target with \"Foxian Prayer\" increases their Break Effect by {{BreakBuff}}% and can deal Toughness Reduction by attacking enemies without corresponding Weakness Type, with the effect being equal to 50% of the original Toughness Reduction. This effect cannot be stacked with other Weakness-ignoring Toughness Reduction effects."
          },
          "defReduction": {
            "text": "Skill DEF shred",
            "content": "When an ally target with \"Foxian Prayer\" attacks, Fugue has a 100% base chance to reduce the attacked enemy target's DEF by {{DefShred}}%, lasting for 2 turns."
          },
          "superBreakDmg": {
            "text": "Super Break DMG (force weakness break)",
            "content": "While Fugue is on the field and after allies attack Weakness Broken enemy targets, converts the Toughness Reduction of this attack into 1 instance of {{SuperBreakMultiplier}}% Super Break DMG."
          },
          "e4BreakDmg": {
            "text": "E4 Break DMG boost",
            "content": "Ally target with \"Foxian Prayer\" increases their Break DMG by 20%."
          },
          "e6BreakEfficiency": {
            "text": "E6 break efficiency boost",
            "content": "Increases Fugue's Weakness Break Efficiency by 50%. When Fugue is in the \"Torrid Scorch\" state, \"Foxian Prayer\" will take effect on all allies."
          }
        },
        "TeammateContent": {
          "be220Buff": {
            "text": "BE ≥ 220%",
            "content": "When an enemy target's Weakness gets broken, Break Effect of teammates increases by 6%. If Fugue's Break Effect is 220% or more, the Break Effect Boost effect additionally increases by 12%, lasting for 2 turns. This effect can stack up to 2 times."
          },
          "weaknessBreakBeStacks": {
            "text": "Enemy broken BE stacks",
            "content": "When an enemy target's Weakness gets broken, Break Effect of teammates increases by 6%. If Fugue's Break Effect is 220% or more, the Break Effect Boost effect additionally increases by 12%, lasting for 2 turns. This effect can stack up to 2 times."
          }
        }
      },
      "FuXuan": {
        "Content": {
          "talentActive": {
            "text": "Team DMG reduction",
            "content": "While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take {{talentDmgReductionValue}}% less DMG."
          },
          "skillActive": {
            "text": "Skill active",
            "content": "Activates Matrix of Prescience, via which other team members will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turns. While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by {{skillHpBuffValue}}% of Fu Xuan's Max HP, and increases CRIT Rate by {{skillCrBuffValue}}%."
          },
          "e6TeamHpLostPercent": {
            "text": "E6 team HP lost",
            "content": "Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. Fu Xuan's Ultimate DMG will increase by 200% of this tally of HP loss. This tally is also capped at 120% of Fu Xuan's Max HP."
          }
        },
        "TeammateContent": {
          "teammateHPValue": {
            "text": "Fu Xuan's Combat HP",
            "content": "While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by {{skillHpBuffValue}}% of Fu Xuan's Max HP."
          }
        }
      },
      "Gallagher": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "content": "Ultimate enhances his next Basic ATK to Nectar Blitz."
          },
          "breakEffectToOhbBoost": {
            "text": "BE to OHB buff",
            "content": "Increases this unit's Outgoing Healing by an amount equal to 50% of Break Effect, up to a maximum Outgoing Healing increase of 75%."
          },
          "targetBesotted": {
            "text": "Target Besotted",
            "content": "The Besotted state makes targets receive {{talentBesottedScaling}}% more Break DMG."
          },
          "e1ResBuff": {
            "text": "E1 RES buff",
            "content": "When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%."
          },
          "e2ResBuff": {
            "text": "E2 RES buff",
            "content": "When using the Skill, removes 1 debuff from the target ally. At the same time, increases their Effect RES by 30%, lasting for 2 turns."
          },
          "e6BeBuff": {
            "text": "E6 BE buff",
            "content": "Increases Gallagher's Break Effect by 20% and Weakness Break Efficiency by 20%."
          }
        }
      },
      "Gepard": {
        "Content": {
          "e4TeamResBuff": {
            "text": "E4 team RES buff",
            "content": "When Gepard is in battle, all allies' Effect RES increases by 20%."
          }
        }
      },
      "Guinaifen": {
        "Content": {
          "talentDebuffStacks": {
            "text": "Firekiss stacks",
            "content": "While inflicted with Firekiss, the enemy receives {{talentDebuffDmgIncreaseValue}}% increased DMG, which lasts for 3 turns and can stack up to {{talentDebuffMax}} times."
          },
          "enemyBurned": {
            "text": "Enemy burned",
            "content": "Increases DMG by 20% against enemies affected by Burn."
          },
          "skillDot": {
            "text": "Use Skill DoT chance",
            "content": "When enabled, uses the Skill's 100% DoT chance instead of the Basic's 80% DoT chance."
          },
          "e1EffectResShred": {
            "text": "E1 Effect RES shred",
            "content": "When Skill is used, there is a 100% base chance to reduce the attacked target enemy's Effect RES by 10% for 2 turns."
          },
          "e2BurnMultiBoost": {
            "text": "E2 burn multi boost",
            "content": "When an enemy target is Burned, Guinaifen's Basic ATK and Skill can increase the DMG multiplier of their Burn status by 40%."
          }
        }
      },
      "Hanya": {
        "Content": {
          "ultBuff": {
            "text": "Ult SPD / ATK buff",
            "content": "Increases the SPD of a target ally by {{ultSpdBuffValue}}% of Hanya's SPD and increases the same target ally's ATK by {{ultAtkBuffValue}}%."
          },
          "targetBurdenActive": {
            "text": "Target Burden debuff",
            "content": "When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by {{talentDmgBoostValue}}% for 2 turns."
          },
          "burdenAtkBuff": {
            "text": "Burden ATK buff",
            "content": "Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn."
          },
          "e2SkillSpdBuff": {
            "text": "E2 Skill SPD buff",
            "content": "After Skill, increases SPD by 20% for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateSPDValue": {
            "text": "Hanya's SPD",
            "content": "Increases the SPD of a target ally by {{ultSpdBuffValue}}% of Hanya's SPD and increases the same target ally's ATK by {{ultAtkBuffValue}}%."
          }
        }
      },
      "Herta": {
        "Content": {
          "fuaStacks": {
            "text": "Followup attack hits",
            "content": "When an ally's attack causes an enemy's HP percentage to fall to 50% or lower, Herta will launch a follow-up attack, dealing Ice DMG."
          },
          "targetFrozen": {
            "text": "Target frozen",
            "content": "When Ultimate is used, deals 20% more DMG to Frozen enemies."
          },
          "enemyHpGte50": {
            "text": "Skill DMG boost",
            "content": "If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%."
          },
          "techniqueBuff": {
            "text": "Technique ATK buff",
            "content": "Increases ATK by 40% for 3 turns."
          },
          "enemyHpLte50": {
            "text": "E1 Basic scaling boost",
            "content": "If the enemy's HP percentage is at 50% or less, Herta's Basic ATK deals Additional Ice DMG equal to 40% of Herta's ATK."
          },
          "e2TalentCritStacks": {
            "text": "E2 Talent CR stacks",
            "content": "Increases CRIT Rate by 3% per stack. Stacks up to 5 times."
          },
          "e6UltAtkBuff": {
            "text": "E6 Ult ATK buff",
            "content": "After Ult, increases ATK by 25% for 1 turn."
          }
        }
      },
      "Himeko": {
        "Content": {
          "targetBurned": {
            "text": "Target burned",
            "content": "Skill deals 20% more DMG to enemies currently afflicted with Burn."
          },
          "selfCurrentHp80Percent": {
            "text": "Self HP ≥ 80% CR buff",
            "content": "When current HP percentage is 80% or higher, CRIT Rate increases by 15%."
          },
          "e1TalentSpdBuff": {
            "text": "E1 SPD buff",
            "content": "After Victory Rush is triggered, Himeko's SPD increases by 20% for 2 turns."
          },
          "e2EnemyHp50DmgBoost": {
            "text": "E2 enemy HP ≤ 50% DMG boost",
            "content": "Deals 15% more DMG to enemies whose HP percentage is 50% or less."
          },
          "e6UltExtraHits": {
            "text": "E6 Ult extra hits",
            "content": "Ultimate deals DMG 2 extra times. Extra hits deals 40% of the original DMG per hit."
          }
        }
      },
      "Hook": {
        "Content": {
          "enhancedSkill": {
            "text": "Enhanced Skill",
            "content": "After using Ultimate, the next Skill to be used is Enhanced. Enhanced Skill deals Fire DMG equal to {{skillEnhancedScaling}}% of Hook's ATK to a single enemy and reduced DMG to adjacent enemies."
          },
          "targetBurned": {
            "text": "Target burned",
            "content": "When attacking a target afflicted with Burn, deals Additional Fire DMG equal to {{targetBurnedExtraScaling}}% of Hook's ATK.::BR::E6: Hook deals 20% more DMG to enemies afflicted with Burn."
          }
        }
      },
      "Huohuo": {
        "Content": {
          "ultBuff": {
            "text": "Ult ATK buff",
            "content": "Increases all allies' ATK by {{ultBuffValue}}% for 2 turns after using Ultimate."
          },
          "skillBuff": {
            "text": "E1 SPD buff",
            "content": "When Huohuo possesses Divine Provision, all allies' SPD increases by 12%."
          },
          "e6DmgBuff": {
            "text": "E6 DMG buff",
            "content": "When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turns."
          }
        }
      },
      "Hyacine": {
        "Content": {
          "healTargetHp50": {
            "text": "Heal target ≤ 50% HP",
            "content": "When providing healing to an ally target with less than or equal to 50% this unit's Max HP, increases Hyacine and Little Ica's Outgoing Healing by 25%."
          },
          "resBuff": {
            "text": "Effect RES buff",
            "content": "Increases Hyacine's Effect RES by 50%."
          },
          "spd200HpBuff": {
            "text": "SPD ≥ 200 HP buff",
            "content": "When Hyacine's SPD exceeds 200, increases her and Little Ica's Max HP by 20%. Then, for every 1 excess SPD, increases Hyacine's and Little Ica's Outgoing Healing by 1%. Up to a max of 200 excess SPD can be taken into account for this effect."
          },
          "clearSkies": {
            "text": "After Rain state",
            "content": "After using her ultimate, Hyacine enters the \"After Rain\" state for 3 turns. Reduces the state's duration by 1 turn each time Hyacine's turn begins. When in \"After Rain\" state, increases Max HP for all allies by {{UltHpBuffScaling}}% plus {{UltHpBuffFlat}}."
          },
          "healingDmgStacks": {
            "text": "Healing DMG stacks",
            "content": "When Hyacine or Little Ica provides healing, increases Little Ica's DMG dealt by {{TalentDmgBuff}}% for 2 turns. Stacks up to 3 times."
          },
          "e1HpBuff": {
            "text": "E1 HP buff",
            "content": "When Hyacine is in the \"After Rain\" state, additionally increases the Max HP of all ally targets by 50%."
          },
          "e2SpdBuff": {
            "text": "E2 SPD buff",
            "content": "When any ally target's HP decreases, this unit's SPD increases by 30% for 2 turns."
          },
          "e4CdBuff": {
            "text": "E4 CD buff",
            "content": "The \"Tempestuous Halt\" Trace is enhanced. For every 1 of SPD exceeded, additionally increases Hyacine and Little Ica's CRIT DMG by 2%."
          },
          "e6ResPen": {
            "text": "E6 RES PEN",
            "content": "When Little Ica is on the field, increases all ally targets' All-Type RES PEN by 20%."
          }
        }
      },
      "Hysilens": {
        "Content": {
          "skillVulnerability": {
            "text": "Skill Vulnerability",
            "content": "Hysilens' skill has a 100% base chance to increase the DMG taken by all enemies by {{SkillVuln}}%, lasting for 3 turns."
          },
          "ultZone": {
            "text": "Ult Zone active",
            "content": "When casting her ultimate, Hysilens deploys a Zone that reduces enemy targets' ATK by 15% and DEF by {{ZoneDefShred}}%."
          },
          "ultDotStacks": {
            "text": "Ult DOT trigger stacks",
            "content": "When Hysilens uses Ultimate, if the enemy target is currently afflicted with DoTs, all DoTs currently applied on the target will immediately produce DMG equal to 150% of their original DMG."
          },
          "ehrToDmg": {
            "text": "EHR to DMG boost",
            "content": "For every 10% of Hysilens's Effect Hit Rate that exceeds 60%, increases her DMG dealt by 15%, up to a max increase of 90%."
          },
          "dotDetonation": {
            "text": "DOT detonation (Automatic activation)",
            "content": "When Hysilens uses Ultimate, if the enemy target is currently afflicted with DoTs, all DoTs currently applied on the target will immediately produce DMG equal to 150% of their original DMG."
          },
          "e1Buffs": {
            "text": "E1 buffs",
            "content": "While Hysilens is on the field, ally targets deal DoT equal to 116% of the original DMG. ::BR:: When Hysilens inflicts Wind Shear/Bleed/Burn/Shock on enemies through her Talent, there is a 100% base chance to additionally inflict the target with 1 instance of Wind Shear/Bleed/Burn/Shock state that is identical to and can coexist with that of the original Talent effect."
          },
          "e4ResPen": {
            "text": "E4 RES PEN",
            "content": "While the Zone is active, reduces All-Type RES of all enemies by 20%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "While the Zone is active, at the start of each turn or after one attack by an ally target, increases the maximum trigger count for Hysilens's Physical DoT effect to 12, and increases the multiplier of the DMG dealt by 20%."
          }
        },
        "TeammateContent": {
          "e2TeammateEhr": {
            "text": "E2 Hysilens' combat EHR",
            "content": "While the Zone is active, the DMG Boost effect from Trace \"The Fiddle of Pearls\" applies to all allies. ::BR:: The Fiddle of Pearls: For every 10% of Hysilens's Effect Hit Rate that exceeds 60%, increases her DMG dealt by 15%, up to a max increase of 90%."
          }
        }
      },
      "ImbibitorLunae": {
        "Content": {
          "basicEnhanced": {
            "text": "Basic enhancements",
            "content": "0 stacks: Uses a 2-hit attack and deals Imaginary DMG equal to {{basicScaling}}% ATK to a single enemy target.::BR::1 stack: Uses a 3-hit attack and deals Imaginary DMG equal to {{basicEnhanced1Scaling}}% ATK to a single enemy target.::BR::2 stacks: Uses a 5-hit attack and deals Imaginary DMG equal to {{basicEnhanced2Scaling}}% ATK to a single enemy target and reduced DMG to adjacent targets.::BR::3 stacks: Uses a 7-hit attack and deals Imaginary DMG equal to {{basicEnhanced3Scaling}}% ATK to a single enemy target and reduced DMG to adjacent targets."
          },
          "skillOutroarStacks": {
            "text": "Outroar stacks",
            "content": "Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by {{outroarStackCdValue}}%, for a max of 4 stacks. (applied to all hits)"
          },
          "talentRighteousHeartStacks": {
            "text": "Righteous Heart stacks",
            "content": "After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by {{righteousHeartDmgValue}}%. (applied to all hits)"
          },
          "e6ResPenStacks": {
            "text": "E6 RES PEN stacks",
            "content": "After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next Fulgurant Leap attack increases by 20%, up to 3 stacks."
          }
        }
      },
      "Jade": {
        "Content": {
          "enhancedFollowUp": {
            "text": "Enhanced FUA",
            "content": "Jade enhances her Talent's follow-up attack, increasing its DMG multiplier by {{ultFuaScalingBuff}}%."
          },
          "pawnedAssetStacks": {
            "text": "Pawned Asset stacks",
            "content": "When launching her Talent's follow-up attack, Jade immediately gains 5 stacks of Pawned Asset, with each stack increasing CRIT DMG by {{pawnedAssetCdScaling}}%, stacking up to 50 times. Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%."
          },
          "e1FuaDmgBoost": {
            "text": "E1 FUA DMG boost",
            "content": "The follow-up attack DMG from Jade's Talent increases by 32%. After the Debt Collector character attacks and the number of the enemy targets hit is either 2 or 1, Jade additionally gains 1 or 2 points of Charge respectively."
          },
          "e2CrBuff": {
            "text": "E2 CR buff",
            "content": "When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%."
          },
          "e4DefShredBuff": {
            "text": "E4 DEF shred buff",
            "content": "When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting for 3 turns."
          },
          "e6ResShredBuff": {
            "text": "E6 RES PEN buff",
            "content": "When the Debt Collector character exists on the field, Jade's Quantum RES PEN increases by 20%, and Jade gains the Debt Collector state."
          }
        },
        "TeammateContent": {
          "debtCollectorSpdBuff": {
            "text": "Debt Collector SPD buff",
            "content": "Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turns."
          }
        }
      },
      "Jiaoqiu": {
        "Content": {
          "ashenRoastStacks": {
            "text": "Ashen Roast stacks",
            "content": "When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by {{AshenRoastInitialVulnerability}}%. Then, each subsequent stack increases this by {{AshenRoastAdditionalVulnerability}}%.::BR::Ashen Roast is capped at 5 stacks and lasts for 2 turns.::BR::When an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to {{AshenRoastDotMultiplier}}% of Jiaoqiu's ATK at the start of each turn."
          },
          "ultFieldActive": {
            "text": "Ult field active",
            "content": "Sets the number of Ashen Roast stacks on enemy targets to the highest number of Ashen Roast stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to {{UltScaling}}% of Jiaoqiu's ATK to all enemies.::BR::While inside the Zone, enemy targets receive {{UltVulnerability}}% increased Ultimate DMG, with a {{ZoneDebuffChance}}% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 times. And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate."
          },
          "ehrToAtkBoost": {
            "text": "EHR to ATK buff",
            "content": "For every 15% of Jiaoqiu's Effect Hit Rate that exceeds 80%, additionally increases ATK by 60%, up to 240%."
          },
          "e1DmgBoost": {
            "text": "E1 DMG boost",
            "content": "Allies deal 40% increased DMG to enemy targets afflicted with Ashen Roast."
          },
          "e2Dot": {
            "text": "E2 DoT scaling",
            "content": "When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300%."
          },
          "e6ResShred": {
            "text": "E6 RES shred",
            "content": "The maximum stack limit of Ashen Roast increases to 9, and each Ashen Roast stack reduces the target's All-Type RES by 3%."
          }
        }
      },
      "Jingliu": {
        "Content": {
          "talentEnhancedState": {
            "text": "Enhanced state",
            "content": "When Jingliu has 2 stacks of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by 100% and her CRIT Rate increases by {{talentCrBuff}}%. Then, Jingliu's Skill Transcendent Flash becomes enhanced and turns into Moon On Glacial River, and becomes the only ability she can use in battle."
          },
          "talentHpDrainAtkBuff": {
            "text": "HP drain ATK buff",
            "content": "When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies and Jingliu's ATK increases based on the total HP consumed from all allies in this attack, capped at {{talentHpDrainAtkBuffMax}}% of her base ATK, lasting until the current attack ends."
          },
          "e1CdBuff": {
            "text": "E1 Ult active",
            "content": "When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn. If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK."
          },
          "e2SkillDmgBuff": {
            "text": "E2 Skill buff",
            "content": "After using Ultimate, increases the DMG of the next Enhanced Skill by 80%."
          }
        }
      },
      "JingliuB1": {
        "Content": {
          "talentEnhancedState": {
            "text": "Enhanced state",
            "content": "When Jingliu has 2 stacks of \"Syzygy,\" she enters the \"Spectral Transmigration\" state and her CRIT Rate increases by {{UltCRBuff}}%. ::BR:: While in the \"Spectral Transmigration\" state, Effect RES increases by 35%, and Ultimate DMG dealt increases by 20%."
          },
          "maxSyzygyDefPen": {
            "text": "Max Syzygy DEF PEN",
            "content": "When obtaining \"Syzygy\" at max stacks, Jingliu's next attack ignores 25% of the target's DEF."
          },
          "moonlightStacks": {
            "text": "Moonlight stacks",
            "content": "When in the \"Spectral Transmigration\" state, Jingliu gains 1 stack of \"Moonlight\" whenever ally targets receive DMG or consume HP. Each stack of \"Moonlight\" increases Jingliu's CRIT DMG by {{MoonlightCDBuff}}%, up to 5 stacks."
          },
          "e1Buffs": {
            "text": "E1 buffs",
            "content": "When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 36% for 1 turns. Moreover, additionally deals 1 instance of Ice DMG equal to 80% of Jingliu's Max HP to the primary target."
          },
          "e2SkillDmgBuff": {
            "text": "E2 Skill buff",
            "content": "After using Ultimate, increases the DMG of the next Enhanced Skill by 80%."
          },
          "e4MoonlightCdBuff": {
            "text": "E4 Moonlight CD",
            "content": "While in the \"Spectral Transmigration\" state, each stack of \"Moonlight\" additionally increases CRIT DMG by 20%."
          },
          "e6ResPen": {
            "text": "E6 RES PEN",
            "content": "While Jingliu is in the \"Spectral Transmigration\" state, her Ice RES PEN increases by 30%."
          }
        }
      },
      "JingYuan": {
        "Content": {
          "skillCritBuff": {
            "text": "Skill CR buff",
            "content": "After using Skill, CRIT Rate increases by 10% for 2 turns."
          },
          "talentHitsPerAction": {
            "text": "Lightning Lord stacks",
            "content": "Lightning Lord hits-per-action stack up to 10 times."
          },
          "talentAttacks": {
            "text": "Lightning Lord hits on target",
            "content": "Count of hits on target. Should usually be set to the same value as Lightning Lord Stacks."
          },
          "e2DmgBuff": {
            "text": "E2 DMG boost",
            "content": "After Lightning-Lord takes action, DMG caused by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20% for 2 turns."
          },
          "e6FuaVulnerabilityStacks": {
            "text": "E6 Vulnerable stacks",
            "content": "Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable. While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 times. (applies to all hits)"
          }
        }
      },
      "Kafka": {
        "Content": {
          "e1DotDmgReceivedDebuff": {
            "text": "E1 DoT vulnerability",
            "content": "When the Talent triggers a follow-up attack, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turns."
          },
          "e2TeamDotBoost": {
            "text": "E2 Team DoT DMG boost",
            "content": "While Kafka is on the field, DoT dealt by all allies increases by 25%."
          }
        }
      },
      "KafkaB1": {
        "Content": {
          "ehrBasedBuff": {
            "text": "EHR to ATK buff",
            "content": "When an ally target's Effect Hit Rate is 75% or more, Kafka increases their ATK by 100%."
          },
          "e1DotDmgReceivedDebuff": {
            "text": "E1 DoT Vulnerability",
            "content": "When using an attack, there is a 100% base chance to cause the target to take 30% more DoT for 2 turns."
          },
          "e2TeamDotDmg": {
            "text": "E2 DoT DMG",
            "content": "While Kafka is on the field, DoT dealt by all allies increases by 33%."
          }
        }
      },
      "Lingsha": {
        "Content": {
          "beConversion": {
            "text": "BE to ATK / OHB buff",
            "content": "Increases this unit's ATK or Outgoing Healing by an amount equal to 25%/10% of Break Effect, up to a maximum increase of 50%/20% respectively."
          },
          "befogState": {
            "text": "Befog state",
            "content": "While in Befog, targets receive {{BefogVulnerability}}% increased Break DMG."
          },
          "e1DefShred": {
            "text": "E1 weakness break buffs",
            "content": "Lingsha's Weakness Break Efficiency increases by 50%. When an enemy unit's Weakness is Broken, reduces their DEF by 20%."
          },
          "e2BeBuff": {
            "text": "E2 BE buff",
            "content": "When using Ultimate, increases all allies' Break Effect by 40%."
          },
          "e6ResShred": {
            "text": "E6 RES shred",
            "content": "While Fuyuan is on the field, reduces all Enemy units' All-Type RES by 20%."
          }
        }
      },
      "Luka": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "content": "Enhances Basic ATK to deal additional damage, and has a chance to trigger extra hits."
          },
          "targetUltDebuffed": {
            "text": "Ult vulnerability debuff",
            "content": "Increase the target's DMG received by {{targetUltDebuffDmgTakenValue}}% for 3 turns."
          },
          "basicEnhancedExtraHits": {
            "text": "Enhanced basic extra hits",
            "content": "Increases the number of hits of Basic Enhanced."
          },
          "e1TargetBleeding": {
            "text": "E1 target bleeding",
            "content": "When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turns."
          },
          "e4TalentStacks": {
            "text": "E4 Talent stacks",
            "content": "For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 times."
          }
        }
      },
      "Luocha": {
        "Content": {
          "fieldActive": {
            "text": "Field active",
            "content": "While the Field is active, ATK of all allies increases by 20%."
          },
          "e6ResReduction": {
            "text": "E6 RES shred",
            "content": "When Ultimate is used, reduces all enemies' All-Type RES by 20% for 2 turns."
          }
        }
      },
      "Lynx": {
        "Content": {
          "skillBuff": {
            "text": "Skill max HP buff",
            "content": "Applies Survival Response to a single target ally and increases their Max HP by {{skillHpPercentBuff}}% of Lynx's Max HP plus {{skillHpFlatBuff}}.::BR::E4: When Survival Response is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn.::BR::E6: Additionally boosts the Max HP increasing effect of Survival Response by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%."
          }
        },
        "TeammateContent": {
          "teammateHPValue": {
            "text": "Lynx's HP",
            "content": "Applies Survival Response to a single target ally and increases their Max HP by {{skillHpPercentBuff}}% of Lynx's Max HP plus {{skillHpFlatBuff}}.::BR::E4: When Survival Response is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn.::BR::E6: Additionally boosts the Max HP increasing effect of Survival Response by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%."
          }
        }
      },
      "March7thImaginary": {
        "Content": {
          "enhancedBasic": {
            "text": "Enhanced Basic",
            "content": "Initially, deals 3 hits, each causing Imaginary DMG equal to {{BasicEnhancedScaling}}% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hits."
          },
          "basicAttackHits": {
            "text": "Enhanced Basic hits",
            "content": "Initially, deals 3 hits, each causing Imaginary DMG equal to {{BasicEnhancedScaling}}% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hits."
          },
          "masterAdditionalDmgBuff": {
            "text": "DPS Shifu buff",
            "content": "Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, deals Additional DMG equal to {{ShifuDmgBuff}}% of March 7th's ATK."
          },
          "masterToughnessRedBuff": {
            "text": "Support Shifu buff",
            "content": "Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, increases the Toughness Reduction of this instance of DMG by 100%."
          },
          "talentDmgBuff": {
            "text": "Talent Basic DMG buff",
            "content": "After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.::BR::Upon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by {{TalentDmgBuff}}%."
          },
          "selfSpdBuff": {
            "text": "E1 SPD buff",
            "content": "When Shifu is on the field, increases March 7th's SPD by 10%."
          },
          "e6CdBuff": {
            "text": "E6 Basic CD boost",
            "content": "After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50%."
          }
        },
        "TeammateContent": {
          "masterBuff": {
            "text": "Shifu buff",
            "content": "Designates a single ally (excluding this unit) as Shifu and increases Shifu's SPD by {{ShifuSpeedBuff}}%."
          },
          "masterCdBeBuffs": {
            "text": "Shifu CD / BE buffs",
            "content": "After using Enhanced Basic ATK, increases Shifu's CRIT DMG by 60% and Break Effect by 36%, lasting for 2 turns."
          }
        }
      },
      "Misha": {
        "Content": {
          "ultHitsOnTarget": {
            "text": "Ult hits on target",
            "content": "Number of Ultimate hits on the primary target, dealing DMG equal to {{ultStackScaling}}% ATK per hit."
          },
          "enemyFrozen": {
            "text": "Enemy frozen",
            "content": "When dealing DMG to Frozen enemies, increases CRIT DMG by 30%."
          },
          "e2DefReduction": {
            "text": "E2 DEF shred",
            "content": "Reduces the target's DEF by 16% for 3 turns."
          },
          "e6UltDmgBoost": {
            "text": "E6 Ult DMG boost",
            "content": "When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn."
          }
        }
      },
      "Moze": {
        "Content": {
          "preyMark": {
            "text": "Prey marked",
            "content": "When Prey exists on the field, Moze will enter the Departed state.::BR::After allies attack Prey, Moze will additionally deal 1 instance of Lightning Additional DMG equal to {{PreyAdditionalMultiplier}}% of his ATK and consumes 1 point of Charge. For every 3 points of Charge consumed, Moze launches 1 follow-up attack to Prey, dealing Lightning DMG equal to {{FuaScaling}}% of his ATK. When Charge reaches 0, dispels the target's Prey state and resets the tally of Charge points required to launch follow-up attack."
          },
          "e2CdBoost": {
            "text": "E2 CD boost",
            "content": "When all allies deal DMG to the enemy target marked as Prey, increases CRIT DMG by 40%."
          },
          "e4DmgBuff": {
            "text": "E4 DMG buff",
            "content": "When using Ultimate, increases the DMG dealt by Moze by 30%, lasting for 2 turns."
          },
          "e6MultiplierIncrease": {
            "text": "E6 FUA multiplier buff",
            "content": "Increases the DMG multiplier of the Talent's follow-up attack by 25%."
          }
        }
      },
      "Mydei": {
        "Content": {
          "skillEnhances": {
            "text": "Skill Enhances",
            "content": "Select the level of enhancement of Mydei's skill. ::BR:: Deaths are Legion, Regrets are None (enhancement 0): Consumes HP by an amount equal to 50% of Mydei's current HP. Deals Imaginary DMG equal to {{SkillPrimaryScaling}}% of Mydei's Max HP to one designated enemy and Imaginary DMG equal to {{SkillAdjacentScaling}}% of Mydei's Max HP to adjacent targets. ::BR:: Kingslayer Be King (enhancement 1): Consumes HP by an amount equal to 35% of Mydei's current HP. Deals Imaginary DMG equal to {{EnhancedSkillPrimaryScaling}}% of Mydei's Max HP to one enemy and Imaginary DMG equal to {{EnhancedSkillAdjacentScaling}}% of Mydei's Max HP to adjacent targets. ::BR:: Godslayer be God (enhancement 2): Consumes 150 points of Charge. Deals Imaginary DMG equal to {{EnhancedSkill2PrimaryScaling}}% of Mydei's Max HP to one enemy and Imaginary DMG equal to {{EnhancedSkill2AdjacentScaling}}% of Mydei's Max HP to adjacent targets."
          },
          "vendettaState": {
            "text": "Vendetta state",
            "content": "For each 1% of HP lost, accumulates 1 point of Charge (up to 200 points). When Charge reaches 100, consumes 100 points of Charge to enter the \"Vendetta\" state, restores HP equal to {{HpRestoration}}% of Mydei's Max HP, and advances action by 100%. ::BR:: While the \"Vendetta\" state is active, Max HP increases by 50% of the current Max HP and DEF remains at 0. At the start of this unit's turn, automatically uses \"Kingslayer Be King.\" When Charge reaches 150 points during the \"Vendetta\" state, Mydei immediately gains 1 extra turn and automatically uses \"Godslayer Be God.\""
          },
          "hpToCrConversion": {
            "text": "HP to CR conversion",
            "content": "When battle starts, if Mydei's Max HP exceeds 4000, for every 100 excess HP, Mydei's CRIT Rate increases by 1.2%, his Charge ratio from enemy targets' DMG increases by 2.5%, and his Incoming Healing increases by 0.75%. Up to 4000 excess HP can be taken into account for this effect."
          },
          "e1EnhancedSkillBuff": {
            "text": "E1 Enhanced Skill boost",
            "content": "The DMG multiplier dealt by \"Godslayer Be God\" to the primary target increases by 30%. And \"Godslayer Be God\" becomes Imaginary DMG dealt to all enemies equal to the DMG multiplier applied to the primary target."
          },
          "e2DefPen": {
            "text": "E2 DEF PEN",
            "content": "During \"Vendetta,\" the DMG dealt by Mydei ignores 15% of enemy targets' DEF. And when receiving healing, converts 40% of the healed amount to Charge. The tally of the converted Charge cannot exceed 40 points. Resets this tally of Charge after any unit takes action."
          },
          "e4CdBuff": {
            "text": "E4 CD buff",
            "content": "While in \"Vendetta,\" increases CRIT DMG by 30% and restores HP by 10% of this unit's Max HP after receiving attacks from enemy targets."
          }
        }
      },
      "Pela": {
        "Content": {
          "teamEhrBuff": {
            "text": "Team EHR buff",
            "content": "When Pela is on the battlefield, all allies' Effect Hit Rate increases by 10%."
          },
          "enemyDebuffed": {
            "text": "Enemy debuffed",
            "content": "Deals 20% more DMG to debuffed enemies."
          },
          "skillRemovedBuff": {
            "text": "Enemy buff removed Skill buffs",
            "content": "Using Skill to remove buffs increases the DMG of Pela's next attack by 20%.::BR::E2: Using Skill to remove buffs increases SPD by 10% for 2 turns."
          },
          "ultDefPenDebuff": {
            "text": "Ult DEF shred",
            "content": "When Exposed, enemies' DEF is reduced by {{ultDefPenValue}}% for 2 turns."
          },
          "e4SkillResShred": {
            "text": "E4 Skill Ice RES shred",
            "content": "When using Skill, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turns."
          }
        }
      },
      "PermansorTerrae": {
        "TeammateContent": {
          "bondmate": {
            "text": "Bondmate",
            "content": "When using Skill, increases the ATK of the \"Bondmate\" target by 15% of Dan Heng • Permansor Terrae's ATK. \"Bondmate\" gains posession of the summon \"Souldragon\"."
          },
          "sourceAtk": {
            "text": "Dan Heng's combat ATK",
            "content": "When using Skill, increases the ATK of the \"Bondmate\" target by 15% of Dan Heng • Permansor Terrae's ATK. ::BR:: Set this to the Dan Heng • Permansor Terrae's self ATK stat that he uses to buff teammates."
          },
          "e1ResPen": {
            "text": "E1 RES PEN",
            "content": "When Dan Heng • Permansor Terrae uses his Ultimate, increases the \"Bondmate's\" All-Type RES PEN by 18% for 3 turns."
          },
          "e4DmgReduction": {
            "text": "E4 DMG reduction",
            "content": "Reduces DMG taken by \"Bondmate\" by 20%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "When there is a \"Bondmate\" on the field, increases the DMG received by all enemies by 20%. When the \"Bondmate\" deals DMG, ignores 12% of the enemy targets' DEF."
          }
        }
      },
      "Phainon": {
        "Content": {
          "transformedState": {
            "text": "Transformation active",
            "content": "When using his ultimate, Phainon transforms into Khaslana and deploys his territory. ::BR:: During his Transformation, increases ATK by {{UltAtkBuff}}% and Max HP by {{UltHPBuff}}%. ::BR:: E2: Khaslana's Physical RES PEN increases by 20%. ::BR:: E6: After using \"Foundation: Stardeath Verdict's\" attack, additionally deals True DMG equal to 36% of the total DMG dealt in this attack to the enemy with the highest HP."
          },
          "enhancedSkillType": {
            "text": "Enhanced Skill type",
            "content": "Khaslana can chose between 2 skills. ::BR:: Calamity: Recovers Scourge stacks equal to the number of enemy targets and causes all enemy targets to take action, then unleashes a powerful counter attack. ::BR:: Foundation: Consumes up to 4 stacks of Scourge. For each stack consumed deals dmg 4 times to random enemy targets. If 4 stacks were consumed, additionally deal damage to all enemies. ::BR:: When transforming, Khaslana recovers 4 stacks of Scourge.",
            "options": {
              "Calamity": {
                "display": "Skill: Calamity",
                "label": "Enhanced Skill: Calamity"
              },
              "Foundation": {
                "display": "Skill: Foundation",
                "label": "Enhanced Skill: Foundation"
              }
            }
          },
          "atkBuffStacks": {
            "text": "ATK buff stacks",
            "content": "When entering battle or when transformation ends, increases ATK by 50%. This effect can stack up to 2 times."
          },
          "cdBuff": {
            "text": "CD buff",
            "content": "When Phainon is the target of any target's ability, he gains 1 point of \"Coreflame.\" If the ability's user is Phainon's teammate, additionally increases Phainon's CRIT DMG by {{TalentCdBuff}}% for 3 turns."
          },
          "sustainDmgBuff": {
            "text": "Sustain DMG buff",
            "content": "When receiving healing effects or Shields from a teammate, increases DMG dealt by 45% for 4 turns."
          },
          "spdBuff": {
            "text": "Team SPD buff",
            "content": "When the Transformation ends, increases all allies' SPD by 15%, lasting for 1 turn."
          },
          "e1Buffs": {
            "text": "E1 buffs",
            "content": "The inheritance ratio of Khaslana's extra turn's SPD is increased to 66%. For every enemy target defeated within 1 battle, the inheritance ratio of Khaslana's extra turn's SPD further increases by 1.5%, up to 84%. ::BR:: When using Ultimate, CRIT DMG increases by 50%, lasting for 3 turns."
          },
          "e2ResPen": {
            "text": "E2 RES PEN",
            "content": "Khaslana's Physical RES PEN increases by 20%. When consuming 4 \"Scourge\" to use \"Foundation: Stardeath Verdict,\" gains 1 extra turn."
          },
          "e6TrueDmg": {
            "text": "E6 True DMG",
            "content": "After using \"Foundation: Stardeath Verdict's\" attack, additionally deals True DMG equal to 36% of the total DMG dealt in this attack to the enemy with the highest HP."
          }
        }
      },
      "Qingque": {
        "Content": {
          "basicEnhanced": {
            "text": "Enhanced Basic",
            "content": "Qingque's ATK increases by {{talentAtkBuff}}%, and her Basic ATK \"Flower Pick\" is enhanced, becoming \"Cherry on Top!\"."
          },
          "basicEnhancedSpdBuff": {
            "text": "Enhanced Basic SPD buff",
            "content": "Qingque's SPD increases by 10% for 1 turn after using the Enhanced Basic ATK."
          },
          "skillDmgIncreaseStacks": {
            "text": "Skill DMG boost stacks",
            "content": "Immediately draws 2 jade tiles and increases DMG by {{skillStackDmg}}% until the end of the current turn. This effect can stack up to 4 times."
          }
        }
      },
      "Rappa": {
        "Content": {
          "sealformActive": {
            "text": "Sealform state (force weakness break)",
            "content": "Enters the \"Sealform\" state, immediately gains 1 extra turn, obtains 3 points of \"Chroma Ink,\" and increases Weakness Break Efficiency by 50% and Break Effect by {{ultBeBuff}}%."
          },
          "atkToBreakVulnerability": {
            "text": "ATK to Break vulnerability",
            "content": "When an enemy target becomes Weakness Broken, increases the Break DMG taken by 2%. If Rappa's current ATK is higher than 2400, for every 100 excess ATK, additionally increases this value by 1%, up to a max additional increase of 8%."
          },
          "chargeStacks": {
            "text": "Charge stacks",
            "content": "Each point of Charge increases the Break DMG multiplier by {{talentChargeMultiplier}}% and increases the Toughness Reduction that can ignore Weakness Type by 1."
          },
          "e1DefPen": {
            "text": "E1 DEF PEN",
            "content": "During the \"Sealform\" state entered by using Ultimate, DMG dealt by Rappa ignores 15% of the targets' DEF."
          },
          "e2Buffs": {
            "text": "E2 break buffs",
            "content": "The Enhanced Basic ATK's first 2 hits have their Toughness Reduction against the one designated enemy increased by 50%."
          },
          "e4SpdBuff": {
            "text": "E4 SPD buff",
            "content": "While in the \"Sealform\" state, increases all allies' SPD by 12%."
          }
        },
        "TeammateContent": {
          "teammateBreakVulnerability": {
            "text": "Break vulnerability",
            "content": "When an enemy target becomes Weakness Broken, increases the Break DMG taken by 2%. If Rappa's current ATK is higher than 2400, for every 100 excess ATK, additionally increases this value by 1%, up to a max additional increase of 8%."
          },
          "e4SpdBuff": {
            "text": "E4 SPD buff",
            "content": "While in the \"Sealform\" state, increases all allies' SPD by 12%."
          }
        }
      },
      "Robin": {
        "Content": {
          "concertoActive": {
            "text": "Concerto active",
            "content": "While in the Concerto state, increases all allies' ATK by {{ultAtkBuffScalingValue}}% of Robin's ATK plus {{ultAtkBuffFlatValue}}. Moreover, after every attack by allies, Robin deals Additional Physical DMG equal to {{ultScaling}}% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%."
          },
          "skillDmgBuff": {
            "text": "Skill DMG buff",
            "content": "Increase DMG dealt by all allies by {{skillDmgBuffValue}}%, lasting for 3 turns."
          },
          "talentCdBuff": {
            "text": "Talent CD buff",
            "content": "Increase all allies' CRIT DMG by {{talentCdBuffValue}}%."
          },
          "e1UltResPen": {
            "text": "E1 Ult RES PEN",
            "content": "While the Concerto state is active, all allies' All-Type RES PEN increases by 24%."
          },
          "e4TeamResBuff": {
            "text": "E4 team RES buff",
            "content": "When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by 50%."
          },
          "e6UltCDBoost": {
            "text": "E6 Ult DMG CD boost",
            "content": "While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by 450%. The effect of Moonless Midnight can trigger up to 8 times. And the trigger count resets each time the Ultimate is used."
          }
        },
        "TeammateContent": {
          "teammateATKValue": {
            "text": "Robin's Combat ATK",
            "content": "While in the Concerto state, increases all allies' ATK by {{ultAtkBuffScalingValue}}% of Robin's ATK plus {{ultAtkBuffFlatValue}}. ::BR:: Set this to the Robin's self ATK stat that she uses to buff teammates."
          },
          "traceFuaCdBoost": {
            "text": "FUA CD boost",
            "content": "While the Concerto state is active, the CRIT DMG dealt when all allies launch follow-up attacks increases by 25%."
          },
          "e2UltSpdBuff": {
            "text": "E2 Ult SPD buff",
            "content": "While the Concerto state is active, all allies' SPD increases by 16%."
          }
        }
      },
      "RuanMei": {
        "Content": {
          "skillOvertoneBuff": {
            "text": "Overtone buff",
            "content": "After using her Skill, Ruan Mei gains Overtone, lasting for 3 turns. This duration decreases by 1 at the start of Ruan Mei's turn. When Ruan Mei has Overtone, all allies' DMG increases by {{skillScaling}}% and Weakness Break Efficiency increases by 50%."
          },
          "teamBEBuff": {
            "text": "Team BE buff",
            "content": "Increases Break Effect by 20% for all allies."
          },
          "ultFieldActive": {
            "text": "Ult field active",
            "content": "While inside the field, all allies' All-Type RES PEN increases by {{fieldResPenValue}}%.::BR::E1: While the Ultimate's field is deployed, the DMG dealt by all allies ignores 20% of the target's DEF."
          },
          "e2AtkBoost": {
            "text": "E2 weakness ATK boost",
            "content": "With Ruan Mei on the field, all allies increase their ATK by 40% when dealing DMG to enemies with Weakness Break."
          },
          "e4BeBuff": {
            "text": "E4 BE buff",
            "content": "When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by 100% for 3 turns."
          }
        },
        "TeammateContent": {
          "teamSpdBuff": {
            "text": "Team SPD buff",
            "content": "Increases SPD by {{talentSpdScaling}}% for the team (excluding this character)."
          },
          "teamDmgBuff": {
            "text": "BE to DMG boost",
            "content": "In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%."
          }
        }
      },
      "Saber": {
        "Content": {
          "enhancedBasic": {
            "text": "Enhanced Basic",
            "content": "After using Ultimate, the next Basic ATK switches to \"Release, the Golden Scepter,\" and only \"Release, the Golden Scepter\" can be used."
          },
          "enhancedSkill": {
            "text": "Enhanced Skill",
            "content": "If Saber currently possesses \"Core Resonance\" and her Energy can be regenerated to full by consuming \"Core Resonance\" after this instance of Skill attack, then increase the DMG multiplier for this instance of Skill use by {{CoreResonanceExtraScaling}}% for each stack of \"Core Resonance,\" and consume all \"Core Resonance\" to regenerate Energy for Saber after attacking."
          },
          "talentDmgBuff": {
            "text": "Talent DMG buff",
            "content": "When any ally target uses an Ultimate, increases DMG dealt by Saber by {{TalentDmgBuff}}% for 2 turns"
          },
          "coreResonanceCdBuff": {
            "text": "Core Resonance CD buff",
            "content": "During this battle, for each point of \"Core Resonance\" gained, increases Saber's CRIT DMG by 4%, stacking up to 8 times."
          },
          "coreResonanceStacks": {
            "text": "Core Resonance stacks",
            "content": "If Saber currently possesses \"Core Resonance\" and her Energy can be regenerated to full by consuming \"Core Resonance\" after this instance of Skill attack, then increase the DMG multiplier for this instance of Skill use by {{CoreResonanceExtraScaling}}% for each stack of \"Core Resonance,\" and consume all \"Core Resonance\" to regenerate Energy for Saber after attacking."
          },
          "crBuff": {
            "text": "CR buff",
            "content": "Increases Saber's CRIT Rate by 20%."
          },
          "cdBuff": {
            "text": "CD buff",
            "content": "When using Skill, increases Saber's CRIT DMG by 50% for 2 turns."
          },
          "e1DmgBuff": {
            "text": "E1 DMG buff",
            "content": "Increases Ultimate DMG dealt by Saber by 60%."
          },
          "e2Buffs": {
            "text": "E2 buffs",
            "content": "For each point of \"Core Resonance\" gained in this battle, Saber's DMG dealt ignores 1% of the target's DEF. This effect can stack up to 15 times. When triggering the \"Core Resonance's\" Skill multiplier effect, each point of \"Core Resonance\" additionally increases the DMG multiplier for this instance of Skill by 7%."
          },
          "e4ResPen": {
            "text": "E4 RES PEN",
            "content": "Increases Saber's Wind RES PEN by 8%. After using Ultimate, increases Saber's Wind RES PEN by 4%. This effect can stack up to 3 times."
          },
          "e6ResPen": {
            "text": "E6 RES PEN",
            "content": "Wind RES PEN of Ultimate DMG dealt by Saber increases by 20%, and the Overflow Energy that can be accumulated by the Trace \"Blessing of the Lake\" increases to 200. When using Ultimate for the first time after entering battle, regenerates a fixed 300 Energy for Saber. This effect can be triggered 1 time after every 3 Ultimate uses."
          }
        }
      },
      "Sampo": {
        "Content": {
          "targetDotTakenDebuff": {
            "text": "Ult DoT vulnerability",
            "content": "When debuffed by Sampo's Ultimate, increase the targets' DoT taken by {{dotVulnerabilityValue}}% for 2 turns."
          },
          "skillExtraHits": {
            "text": "Skill extra hits",
            "content": "Number of extra hits from Skill."
          },
          "targetWindShear": {
            "text": "Target wind sheared",
            "content": "Enemies with Wind Shear effect deal 15% less damage to Sampo."
          }
        }
      },
      "Seele": {
        "Content": {
          "buffedState": {
            "text": "Buffed state",
            "content": "Enters the buffed state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the buffed state, the DMG of Seele's attacks increases by {{buffedStateDmgBuff}}% for 1 turn.::BR::While Seele is in the buffed state, her Quantum RES PEN increases by 20%."
          },
          "speedBoostStacks": {
            "text": "Speed buff stacks",
            "content": "After using her skill, Seele's SPD increases by 25% for 2 turns.::BR::E2: The SPD Boost effect of Seele's Skill can stack up to 2 times."
          },
          "e1EnemyHp80CrBoost": {
            "text": "E1 enemy HP ≤ 80% CR boost",
            "content": "When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%."
          },
          "e6UltTargetDebuff": {
            "text": "E6 Butterfly Flurry",
            "content": "After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for 1 turn. Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to 15% of Seele's Ultimate DMG every time they are attacked."
          }
        }
      },
      "Serval": {
        "Content": {
          "targetShocked": {
            "text": "Target shocked",
            "content": "After Serval attacks, deals Additional Lightning DMG equal to {{talentExtraDmgScaling}}% of Serval's ATK to all Shocked enemies."
          },
          "enemyDefeatedBuff": {
            "text": "Enemy defeated buff",
            "content": "Upon defeating an enemy, ATK increases by 20% for 2 turns."
          }
        }
      },
      "SilverWolf": {
        "Content": {
          "skillResShredDebuff": {
            "text": "Skill RES shred",
            "content": "Decreases the target's All-Type RES of the enemy by {{skillResShredValue}}% for 2 turns.::BR::If there are 3 or more debuffs affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%."
          },
          "skillWeaknessResShredDebuff": {
            "text": "Skill weakness implanted RES shred",
            "content": "There is a {{implantChance}}% base chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turns. If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered."
          },
          "talentDefShredDebuff": {
            "text": "Bug DEF shred",
            "content": "Silver Wolf's bug reduces the target's DEF by {{talentDefShredDebuffValue}}% for 3 turns."
          },
          "ultDefShredDebuff": {
            "text": "Ult DEF shred",
            "content": "Decreases the target's DEF by {{ultDefShredValue}}% for 3 turns."
          },
          "targetDebuffs": {
            "text": "Target debuffs",
            "content": "If there are 3 or more debuffs affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.::BR::E4: After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 times during each use of her Ultimate.::BR::E6: For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%."
          }
        }
      },
      "SilverWolfB1": {
        "Content": {
          "ehrToAtkConversion": {
            "text": "EHR to ATK conversion",
            "content": "For every 10% Effect Hit Rate that Silver Wolf has, additionally increases her ATK by 10% to a max of 50%."
          },
          "skillResShredDebuff": {
            "text": "Skill RES shred",
            "content": "When Silver Wolf uses her skill, there is a 100% base chance to further reduce the target's All-Type RES by {{SkillResShred}}% for 2 turns."
          },
          "skillWeaknessResShredDebuff": {
            "text": "Skill weakness implanted RES shred",
            "content": "There is a {{ImplantBaseChance}}% base chance to add 1 Weakness of an on-field ally target's Type to one designated enemy target (prioritizes implanting the Weakness corresponding to the first ally target in the lineup), also reducing the enemy target's RES to that Weakness Type by 20% for 3 turns. If the enemy target already has that Type Weakness, the RES reduction effect to that Type will not be triggered."
          },
          "talentDefShredDebuff": {
            "text": "Bug DEF shred",
            "content": "Silver Wolf can create three types of \"Bugs\": Reduce ATK by {{BugAtkDown}}%, reduce DEF by {{BugDefDown}}%, and reduce SPD by {{BugSpdDown}}%. ::BR:: After every attack launched by Silver Wolf, she has a {{BugBaseChance}}% base chance to implant 1 random \"Bug\" that lasts for 4 turns in the attacked enemy target. ::BR:: Every time an enemy target's Weakness is Broken, Silver Wolf has a 100% base chance of implanting 1 random \"Bug\" in that target. ::BR:: E2: When the enemy target receives an attack from ally targets, Silver Wolf has a 100% base chance of implanting the attacked enemy target with 1 random \"Bug.\""
          },
          "ultDefShredDebuff": {
            "text": "Ult DEF shred",
            "content": "There's a {{UltBaseChance}}% base chance to decrease all enemies' DEF by {{UltDefShred}}% for 3 turns."
          },
          "targetDebuffs": {
            "text": "Target debuffs",
            "content": "After every attack launched by Silver Wolf, she has a {{BugBaseChance}}% base chance to implant 1 random \"Bug\" that lasts for 4 turns in the attacked enemy target. ::BR:: E1: After using her Ultimate to attack any enemy target, Silver Wolf regenerates 7 Energy for every debuff that the target currently has. This effect can be triggered up to 5 times in each use of her Ultimate. ::BR:: E2: When the enemy target receives an attack from ally targets, Silver Wolf has a 100% base chance of implanting the attacked enemy target with 1 random \"Bug.\" ::BR:: E4: After using Silver Wolf's Ultimate to attack any enemy target, deals Quantum Additional DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 times against each target during each use of her Ultimate. ::BR:: E6: For every debuff the enemy target has, the DMG dealt by Silver Wolf to it increases by 20%, up to an increase of 100%."
          },
          "e2Vulnerability": {
            "text": "E2 Vulnerability",
            "content": "When enemy target enters battle, increases DMG received by 20%."
          }
        }
      },
      "Sparkle": {
        "Content": {
          "skillCdBuff": {
            "text": "Skill CD buff",
            "content": "Increases the CRIT DMG of a single ally by {{skillCdBuffScaling}}% of Sparkle's CRIT DMG plus {{skillCdBuffBase}}%, lasting for 1 turn.::BR::E6: The CRIT DMG Boost effect of Sparkle's Skill additionally increases by 30% of Sparkle's CRIT DMG, and when she uses her Skill, the CRIT DMG Boost effect will apply to all allies currently with Cipher. When Sparkle uses her Ultimate, this effect will spread to all allies with Cipher should the allied target have the CRIT DMG increase effect provided by the Skill active on them."
          },
          "cipherBuff": {
            "text": "Cipher buff",
            "content": "When allies with Cipher trigger the DMG Boost effect provided by Sparkle's Talent, each stack additionally increases its effect by {{cipherTalentStackBoost}}%, lasting for 2 turns.::BR::E1: The Cipher effect applied by the Ultimate lasts for 1 extra turn. All allies affected by Cipher have their ATK increased by 40%."
          },
          "talentStacks": {
            "text": "Talent DMG stacks",
            "content": "Whenever an ally consumes 1 Skill Point, all allies' DMG increases by {{talentBaseStackBoost}}%. This effect lasts for 2 turns and can stack up to 3 times.::BR::E2: Each Talent stack allows allies to ignore 8% of the enemy target's DEF when dealing DMG to enemies."
          },
          "quantumAlliesAtkBuff": {
            "text": "Quantum allies ATK buff",
            "content": "When there are 1/2/3 Quantum allies in your team, Quantum-Type allies' ATK are increased by 5%/15%/30%."
          }
        },
        "TeammateContent": {
          "teammateCDValue": {
            "text": "Sparkle's Combat CD",
            "content": "Increases the CRIT DMG of a single ally by {{skillCdBuffScaling}}% of Sparkle's CRIT DMG plus {{skillCdBuffBase}}%, lasting for 1 turn."
          }
        }
      },
      "Sunday": {
        "Content": {
          "skillDmgBuff": {
            "text": "Skill DMG buff",
            "content": "Enables one designated ally character and their summon to immediately take action, and increases their DMG dealt by {{DmgBoost}}%. If the target has a summon, then additionally increases the DMG boost effect by {{SummonDmgBoost}}%."
          },
          "talentCrBuffStacks": {
            "text": "Talent CR buff stacks",
            "content": "When using Skill, increases the target's CRIT Rate by {{CritRateBoost}}%, lasting for 3 turns."
          },
          "techniqueDmgBuff": {
            "text": "Technique DMG buff",
            "content": "The first time Sunday uses an ability on an ally target in the next battle, the target's DMG dealt increases by 50% for 2 turns."
          },
          "e1DefPen": {
            "text": "E1 DEF PEN",
            "content": "When Sunday uses his Skill, allows target character to ignore 16% of enemy target's DEF and their summons to ignore 40% of enemy target's DEF when dealing DMG, lasting for 2 turns."
          },
          "e2DmgBuff": {
            "text": "E2 Beatified DMG buff",
            "content": "The DMG dealt by \"The Beatified\" increases by 30%."
          }
        },
        "TeammateContent": {
          "beatified": {
            "text": "Ult CD buff",
            "content": "The target and their summon have their CRIT DMG increased by an amount equal to {{CritBuffScaling}}% of Sunday's CRIT DMG plus {{CritBuffFlat}}%."
          },
          "teammateCDValue": {
            "text": "Sunday Combat CD",
            "content": "The target and their summon have their CRIT DMG increased by an amount equal to {{CritBuffScaling}}% of Sunday's CRIT DMG plus {{CritBuffFlat}}%."
          },
          "e6CrToCdConversion": {
            "text": "E6 CR to CD conversion",
            "content": "When the Talent's CRIT Rate boost takes effect and the target's CRIT Rate exceeds 100%, every 1% of excess CRIT Rate increases CRIT DMG by 2%."
          }
        }
      },
      "Sushang": {
        "Content": {
          "ultBuffedState": {
            "text": "Ult buffed state",
            "content": "Sushang's ATK increases by {{ultBuffedAtk}}% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turns. Sword Stance triggered from the extra chances deals 50% of the original DMG."
          },
          "skillExtraHits": {
            "text": "Skill extra hits",
            "content": "Increases the number of Sword Stance extra hits of the Skill."
          },
          "skillTriggerStacks": {
            "text": "Skill trigger stacks",
            "content": "For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 times."
          },
          "talentSpdBuffStacks": {
            "text": "Talent SPD buff stacks",
            "content": "When an enemy has their Weakness Broken on the field, Sushang's SPD increases by {{talentSpdBuffValue}}% per stack for 2 turns.::BR::E6: Talent's SPD Boost is stackable and can stack up to 2 times."
          },
          "e2DmgReductionBuff": {
            "text": "E2 DMG reduction buff",
            "content": "After triggering Sword Stance, the DMG taken by Sushang is reduced by 20% for 1 turn."
          }
        }
      },
      "TheHerta": {
        "Content": {
          "enhancedSkill": {
            "text": "Enhanced Skill",
            "content": "After using the Ultimate, The Herta immediately takes action and gains 1 stack of \"Inspiration.\" \"Inspiration\" can stack up to 4 times. While having \"Inspiration,\" enhances Skill to \"Hear Me Out.\""
          },
          "eruditionTeammate": {
            "text": "Erudition teammate",
            "content": "When the Enhanced Skill's primary target has \"Interpretation,\" the multiplier for the DMG dealt increases, with each stack granting an increase of {{PrimaryScalingBonus}}%/{{AdjacentScalingBonus}}% on the primary target/other targets respectively.::BR::If 2 or more characters follow the Path of Erudition in the team, each stack grants an additional increase of {{PrimaryScalingBonus}}%/{{AdjacentScalingBonus}}% on the primary target/other targets respectively.::BR::A4: When entering battle, if the team has 2 or more characters following the Path of Erudition, then increases all allies' CRIT DMG by 80%."
          },
          "ultAtkBuff": {
            "text": "Ult ATK buff",
            "content": "When using Ultimate, increases The Herta's ATK by {{AtkBuff}}%, lasting for 3 turns."
          },
          "interpretationStacks": {
            "text": "Interpretation stacks",
            "content": "When the Enhanced Skill's primary target has \"Interpretation,\" the multiplier for the DMG dealt increases, with each stack granting an increase of {{PrimaryScalingBonus}}%/{{AdjacentScalingBonus}}% on the primary target/other targets respectively.::BR::If 2 or more characters follow the Path of Erudition in the team, each stack grants an additional increase of {{PrimaryScalingBonus}}%/{{AdjacentScalingBonus}}% on the primary target/other targets respectively.::BR::E1: When Enhanced Skill calculates \"Interpretation,\" additionally calculates 50% of the \"Interpretation\" stacks on the 1 target with the highest stacks out of the primary target and adjacent targets."
          },
          "totalInterpretationStacks": {
            "text": "Answer stacks",
            "content": "For every 1 stack of \"Interpretation\" inflicted on enemy targets, The Herta gains 1 stack of \"Answer\", up to 99 stacks. When using the Ultimate, every stack of \"Answer\" increases the Ultimate's DMG multiplier by 1%."
          },
          "e1BonusStacks": {
            "text": "E1 Bonus stacks",
            "content": "When Enhanced Skill calculates \"Interpretation,\" additionally calculates 50% of the \"Interpretation\" stacks on the 1 target with the highest stacks out of the primary target and adjacent targets."
          },
          "e4EruditionSpdBuff": {
            "text": "E4 Erudition SPD buff",
            "content": "The SPD of characters following the Path of Erudition in the team increases by 12%."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "The Herta's Ice RES PEN increases by 20%. When the number of enemy targets on the field is 3 (or more)/2/1, Ultimate's DMG multiplier increases by 140%/250%/400%."
          }
        }
      },
      "Tingyun": {
        "Content": {
          "benedictionBuff": {
            "text": "Benediction buff",
            "content": "Grants a single ally with Benediction to increase their ATK by {{skillAtkBoostScaling}}%, up to {{skillAtkBoostMax}}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to {{skillLightningDmgBoostScaling}}% of that ally's ATK. This effect lasts for 3 turns."
          },
          "skillSpdBuff": {
            "text": "Skill SPD buff",
            "content": "Tingyun's SPD increases by 20% for 1 turn after using Skill."
          },
          "ultDmgBuff": {
            "text": "Ult DMG buff",
            "content": "Regenerates 50 Energy for a single ally and increases the target's DMG by {{ultDmgBoost}}% for 2 turns.::BR::E6: Ultimate regenerates 10 more Energy for the target ally."
          },
          "ultSpdBuff": {
            "text": "E1 Ult SPD buff",
            "content": "After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn."
          }
        },
        "TeammateContent": {
          "teammateAtkBuffValue": {
            "text": "Skill ATK buff value",
            "content": "Grants a single ally with Benediction to increase their ATK by {{skillAtkBoostScaling}}%, up to {{skillAtkBoostMax}}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to {{skillLightningDmgBoostScaling}}% of that ally's ATK. This effect lasts for 3 turns."
          }
        }
      },
      "Topaz": {
        "Content": {
          "enemyProofOfDebtDebuff": {
            "text": "Proof of Debt debuff",
            "content": "Inflicts a single target enemy with a Proof of Debt status, increasing the DMG it takes from follow-up attacks by {{proofOfDebtFuaVulnerability}}%."
          },
          "numbyEnhancedState": {
            "text": "Numby enhanced state",
            "content": "Numby enters the Windfall Bonanza! state and its DMG multiplier increases by {{enhancedStateFuaScalingBoost}}% and CRIT DMG increases by {{enhancedStateFuaCdBoost}}%."
          },
          "e1DebtorStacks": {
            "text": "E1 Debtor stacks",
            "content": "When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single action. The Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by 25%, stacking up to 2 times. When Proof of Debt is removed, the Debtor state is also removed."
          }
        }
      },
      "TrailblazerDestruction": {
        "Content": {
          "enhancedUlt": {
            "text": "AoE Ult",
            "content": "Choose between two attack modes to deliver a full strike.::BR:: Blowout: (ST) Farewell Hit deals Physical DMG equal to {{ultScaling}}% of the Trailblazer's ATK to a single enemy.::BR::Blowout: (Blast) RIP Home Run deals Physical DMG equal to {{ultEnhancedScaling}}% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to {{ultEnhancedScaling2}}% of the Trailblazer's ATK to enemies adjacent to it."
          },
          "talentStacks": {
            "text": "Talent stacks",
            "content": "Each time after this character inflicts Weakness Break on an enemy, ATK increases by {{talentAtkScalingValue}}% and DEF increases by 10%. This effect stacks up to 2 times."
          }
        }
      },
      "TrailblazerHarmony": {
        "Content": {
          "backupDancer": {
            "text": "Backup Dancer BE buff",
            "content": "Grants all allies the Backup Dancer effect, lasting for 3 turns. This duration reduces by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by {{ultBeScaling}}%."
          },
          "superBreakDmg": {
            "text": "Super Break DMG (force weakness break)",
            "content": "When allies with the Backup Dancer effect attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG.::BR::Super Break DMG is added to each of the BASIC / SKILL / ULT / FUA damage columns. For example when enabled, the SKILL column becomes the sum of base Skill damage + Super Break DMG based on the Skill's toughness damage. This option also overrides enemy weakness break to ON."
          },
          "skillHitsOnTarget": {
            "text": "Skill extra hits on target",
            "content": "Deals Imaginary DMG to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG to a random enemy."
          },
          "e2EnergyRegenBuff": {
            "text": "E2 ERR buff",
            "content": "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turns."
          }
        },
        "TeammateContent": {
          "teammateBeValue": {
            "text": "E4 Combat BE",
            "content": "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect."
          }
        }
      },
      "TrailblazerPreservation": {
        "Content": {
          "enhancedBasic": {
            "text": "Enhanced Basic",
            "content": "Enhanced basic ATK deals Fire DMG equal to {{basicEnhancedAtkScaling}}% of the Trailblazer's ATK to a single enemy, and reduced damage to adjacent enemies."
          },
          "skillActive": {
            "text": "Skill DMG reduction",
            "content": "When the Skill is used, reduces DMG taken by {{skillDamageReductionValue}}%. Also reduces DMG taken by all allies by 15% for 1 turn."
          },
          "shieldActive": {
            "text": "Shield active",
            "content": "When the shield is active, increases ATK by 15%."
          },
          "e6DefStacks": {
            "text": "E6 DEF buff stacks",
            "content": "Increases DEF by 10% per stack."
          }
        }
      },
      "TrailblazerRemembrance": {
        "Content": {
          "memoSkillHits": {
            "text": "Memo Skill hits",
            "content": "Deals 4 instances of DMG, with each instance dealing Ice DMG equal to {{SingleScaling}}% of Mem's ATK to one random enemy. Finally, deals Ice DMG equal to {{AoeScaling}}% of Mem's ATK to all enemies."
          },
          "teamCdBuff": {
            "text": "Team CD buff",
            "content": "All allies' CRIT DMG increases by {{ScalingBuff}}% of Mem's CRIT DMG plus {{FlatBuff}}%."
          },
          "memsSupport": {
            "text": "Mem's Support True DMG",
            "content": "Advances the action of one designated ally by 100% and grants them \"Mem's Support,\" lasting for 3 turns. For every 1 instance of DMG dealt by the target that has \"Mem's Support,\" additionally deals 1 instance of True DMG equal to {{TrueDmgScaling}}% of the original DMG.::BR::E1: When an ally target has \"Mem's Support,\" its effect also takes effect on the target's memosprite/memomaster.::BR::E4: When an ally target with 0 Max Energy actively uses an ability, Mem can also gain 3% Charge, and the multiplier of the True DMG dealt by this target via \"Mem's Support\" additionally increases by 6%."
          },
          "energyTrueDmgValue": {
            "text": "Max energy True DMG",
            "content": "When the Max Energy of the ally target that has \"Mem's Support\" exceeds 100, for every 10 excess Energy, additionally increases the multiplier of the True DMG dealt via \"Mem's Support\" by 2%, up to a max increase of 20%."
          },
          "e1CrBuff": {
            "text": "E1 CR buff",
            "content": "Increases the CRIT Rate of the ally target with \"Mem's Support\" by 10%."
          },
          "e4TrueDmgBoost": {
            "text": "E4 True DMG boost",
            "content": "When an ally target with 0 Max Energy actively uses an ability, Mem can also gain 3% Charge, and the multiplier of the True DMG dealt by this target via \"Mem's Support\" additionally increases by 6%."
          },
          "e6UltCrBoost": {
            "text": "E6 Ult CR boost",
            "content": "Ultimate's CRIT Rate is set at 100%."
          }
        },
        "TeammateContent": {
          "memCDValue": {
            "text": "Mem's combat CD",
            "content": "All allies' CRIT DMG increases by {{ScalingBuff}}% of Mem's CRIT DMG plus {{FlatBuff}}%."
          }
        }
      },
      "Tribbie": {
        "Content": {
          "numinosity": {
            "text": "Numinosity",
            "content": "After using Skill, Tribbie gains \"Numinosity,\" lasting for 3 turns. This duration decreases by 1 at the start of this unit's every turn. While Tribbie has \"Numinosity,\" increases all ally targets' All-Type RES PEN by {{ResPen}}%."
          },
          "ultZone": {
            "text": "Ult Zone active",
            "content": "After Tribbie uses her Ultimate, activates a Zone and deals Quantum DMG equal to {{UltScaling}}% of her Max HP to all enemies. While the Zone lasts, increases enemy targets' DMG taken by {{ZoneVulnerability}}%. After an ally target attacks, for every 1 target hit, deals 1 instance of Quantum Additional DMG equal to {{AdditionalDmgScaling}}% of Tribbie's Max HP to the target that has the highest HP among the hit targets. The Zone lasts for 2 turns. This duration decreases by 1 at the start of this unit's every turn."
          },
          "alliesMaxHp": {
            "text": "Allies max HP",
            "content": "While the Zone from her her Ultimate lasts, Tribbie's Max HP increases by an amount equal to 9% of the sum of all ally characters' Max HP."
          },
          "talentFuaStacks": {
            "text": "FUA stacks",
            "content": "After using Talent's Follow-up ATK, increases the DMG dealt by Tribbie by 72%. This effect can stack up to 3 times, lasting for 3 turns."
          },
          "e1TrueDmg": {
            "text": "E1 True DMG",
            "content": "While the Zone from her Ultimate lasts and after ally targets attack enemies, additionally deals True DMG equal to 24% of the total DMG of this attack to targets that have been dealt Additional DMG by the Zone."
          },
          "e2AdditionalDmg": {
            "text": "E2 Additional DMG",
            "content": "The Additional DMG dealt by the Zone increases to 120% of the original DMG. When the Zone deals Additional DMG, further deals 1 instance of Additional DMG."
          },
          "e4DefPen": {
            "text": "E4 DEF PEN",
            "content": "While \"Numinosity\" lasts, the DMG dealt by all allies ignores 18% of the target's DEF."
          },
          "e6FuaScaling": {
            "text": "E6 FUA DMG",
            "content": "After Tribbie uses Ultimate, launches her Talent's Follow-up ATK against all enemies. The DMG dealt by Talent's Follow-up ATK increases by 729%."
          }
        }
      },
      "Welt": {
        "Content": {
          "enemyDmgTakenDebuff": {
            "text": "Ult vulnerability debuff",
            "content": "When using Ultimate, there is a 100% base chance to increase the DMG received by the targets by 12% for 2 turns."
          },
          "enemySlowed": {
            "text": "Enemy slowed",
            "content": "When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to {{talentScaling}}% of his ATK to the enemy."
          },
          "skillExtraHits": {
            "text": "Skill extra hits on target",
            "content": "Deals Imaginary DMG equal to {{skillScaling}}% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to {{skillScaling}}% of Welt's ATK to a random enemy."
          },
          "e1EnhancedState": {
            "text": "E1 enhanced state",
            "content": "After Welt uses his Ultimate, his abilities are enhanced. The next 2 times he uses his Basic ATK or Skill, deals Additional DMG to the target equal to 50% of his Basic ATK's DMG multiplier or 80% of his Skill's DMG multiplier respectively."
          }
        }
      },
      "Xueyi": {
        "Content": {
          "beToDmgBoost": {
            "text": "BE to DMG boost",
            "content": "Increases DMG dealt by this unit by an amount equal to 100% of Break Effect, up to a maximum DMG increase of 240%."
          },
          "enemyToughness50": {
            "text": "Intrepid Rollerbearings",
            "content": "If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate."
          },
          "toughnessReductionDmgBoost": {
            "text": "Ultimate DMG boost",
            "content": "When using Ultimate, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of {{ultBoostMax}}% increase."
          },
          "fuaHits": {
            "text": "FUA hits",
            "content": "When Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to {{fuaScaling}}% of Xueyi's ATK to a single random enemy."
          },
          "e4BeBuff": {
            "text": "E4 BE buff",
            "content": "When using Ultimate, increases Break Effect by 40% for 2 turns."
          }
        }
      },
      "Yanqing": {
        "Content": {
          "ultBuffActive": {
            "text": "Ult buff active",
            "content": "Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra {{ultCdBuffValue}}%."
          },
          "soulsteelBuffActive": {
            "text": "Soulsteel buff active",
            "content": "When Soulsteel Sync is active, Yanqing's CRIT Rate increases by {{talentCrBuffValue}}% and his CRIT DMG increases by {{talentCdBuffValue}}%.::BR::Before using Ultimate, when Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra {{ultCdBuffValue}}%.::BR::When Soulsteel Sync is active, Effect RES increases by 20%.::BR::E2: When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%."
          },
          "critSpdBuff": {
            "text": "SPD buff",
            "content": "When a CRIT Hit is triggered, increases SPD by 10% for 2 turns."
          },
          "e1TargetFrozen": {
            "text": "E1 enemy frozen",
            "content": "When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to 60% of his ATK."
          },
          "e4CurrentHp80": {
            "text": "E4 self HP ≥ 80% RES PEN buff",
            "content": "When the current HP percentage is 80% or higher, Ice RES PEN increases by 12%."
          }
        }
      },
      "Yukong": {
        "Content": {
          "teamImaginaryDmgBoost": {
            "text": "Team Imaginary DMG boost",
            "content": "When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%."
          },
          "roaringBowstringsActive": {
            "text": "Roaring Bowstrings",
            "content": "When Roaring Bowstrings is active, the ATK of all allies increases by {{skillAtkBuffValue}}%.::BR::E4: When Roaring Bowstrings is active, Yukong deals 30% more DMG to enemies."
          },
          "ultBuff": {
            "text": "Ult CR / CD buffs",
            "content": "If Roaring Bowstrings is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by {{ultCrBuffValue}}% and CRIT DMG by {{ultCdBuffValue}}%. At the same time, deals Imaginary DMG equal to {{ultScaling}}% of Yukong's ATK to a single enemy."
          },
          "initialSpeedBuff": {
            "text": "E1 initial SPD buff",
            "content": "At the start of battle, increases the SPD of all allies by 10% for 2 turns."
          }
        }
      },
      "Yunli": {
        "Content": {
          "blockActive": {
            "text": "Parry active",
            "content": "While in the Parry state, resists Crowd Control debuffs received and reduces DMG received by 20%."
          },
          "ultCull": {
            "text": "Intuit: Cull enabled",
            "content": "Intuit: Cull: Deals Physical DMG equal to {{CullScaling}}% of Yunli's ATK to the target, and deals Physical DMG equal to {{CullAdjacentScaling}}% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to {{CullAdditionalScaling}}% of Yunli's ATK to a random single enemy."
          },
          "ultCullHits": {
            "text": "Intuit: Cull hits",
            "content": "Intuit: Cull: Deals Physical DMG equal to {{CullScaling}}% of Yunli's ATK to the target, and deals Physical DMG equal to {{CullAdjacentScaling}}% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to {{CullAdditionalScaling}}% of Yunli's ATK to a random single enemy."
          },
          "counterAtkBuff": {
            "text": "Counter ATK buff",
            "content": "When using a Counter, increases Yunli's ATK by 30%, lasting for 1 turn."
          },
          "e1UltBuff": {
            "text": "E1 Ult buff",
            "content": "Increases DMG dealt by Intuit: Slash and Intuit: Cull by 20%. Increases the number of additional DMG instances for Intuit: Cull by 3."
          },
          "e2DefShred": {
            "text": "E2 FUA DEF PEN",
            "content": "When dealing DMG via Counter, ignores 20% of the target's DEF."
          },
          "e4ResBuff": {
            "text": "E4 RES buff",
            "content": "After launching Intuit: Slash or Intuit: Cull, increases this unit's Effect RES by 50%, lasting for 1 turn."
          },
          "e6Buffs": {
            "text": "E6 buffs",
            "content": "While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger Intuit: Cull and remove the Parry effect. When dealing DMG via Intuit: Slash or Intuit: Cull, increases CRIT Rate by 15% and Physical RES PEN by 20%."
          }
        }
      }
    }
  },
  "gameData": {
    "Characters": {
      "1001": {
        "Name": "March 7th",
        "LongName": "March 7th (Preservation)"
      },
      "1002": {
        "Name": "Dan Heng",
        "LongName": "Dan Heng"
      },
      "1003": {
        "Name": "Himeko",
        "LongName": "Himeko"
      },
      "1004": {
        "Name": "Welt",
        "LongName": "Welt"
      },
      "1005": {
        "Name": "⚰️ Kafka",
        "LongName": "⚰️ Kafka"
      },
      "1006": {
        "Name": "⚰️ Silver Wolf",
        "LongName": "⚰️ Silver Wolf"
      },
      "1008": {
        "Name": "Arlan",
        "LongName": "Arlan"
      },
      "1009": {
        "Name": "Asta",
        "LongName": "Asta"
      },
      "1013": {
        "Name": "Herta",
        "LongName": "Herta"
      },
      "1014": {
        "Name": "Saber",
        "LongName": "Saber"
      },
      "1015": {
        "Name": "Archer",
        "LongName": "Archer"
      },
      "1101": {
        "Name": "Bronya",
        "LongName": "Bronya"
      },
      "1102": {
        "Name": "Seele",
        "LongName": "Seele"
      },
      "1103": {
        "Name": "Serval",
        "LongName": "Serval"
      },
      "1104": {
        "Name": "Gepard",
        "LongName": "Gepard"
      },
      "1105": {
        "Name": "Natasha",
        "LongName": "Natasha"
      },
      "1106": {
        "Name": "Pela",
        "LongName": "Pela"
      },
      "1107": {
        "Name": "Clara",
        "LongName": "Clara"
      },
      "1108": {
        "Name": "Sampo",
        "LongName": "Sampo"
      },
      "1109": {
        "Name": "Hook",
        "LongName": "Hook"
      },
      "1110": {
        "Name": "Lynx",
        "LongName": "Lynx"
      },
      "1111": {
        "Name": "Luka",
        "LongName": "Luka"
      },
      "1112": {
        "Name": "Topaz & Numby",
        "LongName": "Topaz & Numby"
      },
      "1201": {
        "Name": "Qingque",
        "LongName": "Qingque"
      },
      "1202": {
        "Name": "Tingyun",
        "LongName": "Tingyun"
      },
      "1203": {
        "Name": "Luocha",
        "LongName": "Luocha"
      },
      "1204": {
        "Name": "Jing Yuan",
        "LongName": "Jing Yuan"
      },
      "1205": {
        "Name": "⚰️ Blade",
        "LongName": "⚰️ Blade"
      },
      "1206": {
        "Name": "Sushang",
        "LongName": "Sushang"
      },
      "1207": {
        "Name": "Yukong",
        "LongName": "Yukong"
      },
      "1208": {
        "Name": "Fu Xuan",
        "LongName": "Fu Xuan"
      },
      "1209": {
        "Name": "Yanqing",
        "LongName": "Yanqing"
      },
      "1210": {
        "Name": "Guinaifen",
        "LongName": "Guinaifen"
      },
      "1211": {
        "Name": "Bailu",
        "LongName": "Bailu"
      },
      "1212": {
        "Name": "⚰️ Jingliu",
        "LongName": "⚰️ Jingliu"
      },
      "1213": {
        "Name": "Imbibitor Lunae",
        "LongName": "Dan Heng • Imbibitor Lunae"
      },
      "1214": {
        "Name": "Xueyi",
        "LongName": "Xueyi"
      },
      "1215": {
        "Name": "Hanya",
        "LongName": "Hanya"
      },
      "1217": {
        "Name": "Huohuo",
        "LongName": "Huohuo"
      },
      "1218": {
        "Name": "Jiaoqiu",
        "LongName": "Jiaoqiu"
      },
      "1220": {
        "Name": "Feixiao",
        "LongName": "Feixiao"
      },
      "1221": {
        "Name": "Yunli",
        "LongName": "Yunli"
      },
      "1222": {
        "Name": "Lingsha",
        "LongName": "Lingsha"
      },
      "1223": {
        "Name": "Moze",
        "LongName": "Moze"
      },
      "1224": {
        "Name": "March 7th",
        "LongName": "March 7th (The Hunt)"
      },
      "1225": {
        "Name": "Fugue",
        "LongName": "Fugue"
      },
      "1301": {
        "Name": "Gallagher",
        "LongName": "Gallagher"
      },
      "1302": {
        "Name": "Argenti",
        "LongName": "Argenti"
      },
      "1303": {
        "Name": "Ruan Mei",
        "LongName": "Ruan Mei"
      },
      "1304": {
        "Name": "Aventurine",
        "LongName": "Aventurine"
      },
      "1305": {
        "Name": "Dr. Ratio",
        "LongName": "Dr. Ratio"
      },
      "1306": {
        "Name": "Sparkle",
        "LongName": "Sparkle"
      },
      "1307": {
        "Name": "Black Swan",
        "LongName": "Black Swan"
      },
      "1308": {
        "Name": "Acheron",
        "LongName": "Acheron"
      },
      "1309": {
        "Name": "Robin",
        "LongName": "Robin"
      },
      "1310": {
        "Name": "Firefly",
        "LongName": "Firefly"
      },
      "1312": {
        "Name": "Misha",
        "LongName": "Misha"
      },
      "1313": {
        "Name": "Sunday",
        "LongName": "Sunday"
      },
      "1314": {
        "Name": "Jade",
        "LongName": "Jade"
      },
      "1315": {
        "Name": "Boothill",
        "LongName": "Boothill"
      },
      "1317": {
        "Name": "Rappa",
        "LongName": "Rappa"
      },
      "1401": {
        "Name": "The Herta",
        "LongName": "The Herta"
      },
      "1402": {
        "Name": "Aglaea",
        "LongName": "Aglaea"
      },
      "1403": {
        "Name": "Tribbie",
        "LongName": "Tribbie"
      },
      "1404": {
        "Name": "Mydei",
        "LongName": "Mydei"
      },
      "1405": {
        "Name": "Anaxa",
        "LongName": "Anaxa"
      },
      "1406": {
        "Name": "Cipher",
        "LongName": "Cipher"
      },
      "1407": {
        "Name": "Castorice",
        "LongName": "Castorice"
      },
      "1408": {
        "Name": "Phainon",
        "LongName": "Phainon"
      },
      "1409": {
        "Name": "Hyacine",
        "LongName": "Hyacine"
      },
      "1410": {
        "Name": "Hysilens",
        "LongName": "Hysilens"
      },
      "1412": {
        "Name": "Cerydra",
        "LongName": "Cerydra"
      },
      "1413": {
        "Name": "Evernight",
        "LongName": "Evernight"
      },
      "1414": {
        "Name": "Permansor Terrae",
        "LongName": "Dan Heng • Permansor Terrae"
      },
      "1415": {
        "Name": "Cyrene",
        "LongName": "Cyrene"
      },
      "8001": {
        "Name": "Caelus",
        "LongName": "Caelus (Destruction)"
      },
      "8002": {
        "Name": "Stelle",
        "LongName": "Stelle (Destruction)"
      },
      "8003": {
        "Name": "Caelus",
        "LongName": "Caelus (Preservation)"
      },
      "8004": {
        "Name": "Stelle",
        "LongName": "Stelle (Preservation)"
      },
      "8005": {
        "Name": "Caelus",
        "LongName": "Caelus (Harmony)"
      },
      "8006": {
        "Name": "Stelle",
        "LongName": "Stelle (Harmony)"
      },
      "8007": {
        "Name": "Caelus",
        "LongName": "Caelus (Remembrance)"
      },
      "8008": {
        "Name": "Stelle",
        "LongName": "Stelle (Remembrance)"
      },
      "1212b1": {
        "Name": "Jingliu",
        "LongName": "Jingliu"
      },
      "1205b1": {
        "Name": "Blade",
        "LongName": "Blade"
      },
      "1005b1": {
        "Name": "Kafka",
        "LongName": "Kafka"
      },
      "1006b1": {
        "Name": "Silver Wolf",
        "LongName": "Silver Wolf"
      }
    },
    "RelicSets": {
      "101": {
        "Name": "Passerby of Wandering Cloud",
        "Description2pc": "Increases Outgoing Healing by 10%.",
        "Description4pc": "At the start of the battle, immediately regenerates 1 Skill Point."
      },
      "102": {
        "Name": "Musketeer of Wild Wheat",
        "Description2pc": "Increases ATK by 12%.",
        "Description4pc": "The wearer's SPD increases by 6% and DMG dealt by Basic ATK increases by 10%."
      },
      "103": {
        "Name": "Knight of Purity Palace",
        "Description2pc": "Increases DEF by 15%.",
        "Description4pc": "Increases the max DMG that can be absorbed by the Shield created by the wearer by 20%."
      },
      "104": {
        "Name": "Hunter of Glacial Forest",
        "Description2pc": "Increases Ice DMG by 10%.",
        "Description4pc": "After the wearer uses their Ultimate, their CRIT DMG increases by 25% for 2 turns."
      },
      "105": {
        "Name": "Champion of Streetwise Boxing",
        "Description2pc": "Increases Physical DMG by 10%.",
        "Description4pc": "After the wearer attacks or is hit, their ATK increases by 5% for the rest of the battle. This effect can stack up to 5 times."
      },
      "106": {
        "Name": "Guard of Wuthering Snow",
        "Description2pc": "Reduces DMG taken by 8%.",
        "Description4pc": "At the beginning of the turn, if the wearer's HP percentage is equal to or less than 50%, restores HP equal to 8% of their Max HP and regenerates 5 Energy."
      },
      "107": {
        "Name": "Firesmith of Lava-Forging",
        "Description2pc": "Increases Fire DMG by 10%.",
        "Description4pc": "Increases DMG by the wearer's Skill by 12%. After unleashing Ultimate, increases the wearer's Fire DMG by 12% for the next attack."
      },
      "108": {
        "Name": "Genius of Brilliant Stars",
        "Description2pc": "Increases Quantum DMG by 10%.",
        "Description4pc": "When the wearer deals DMG to the target enemy, ignores 10% DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores 10% DEF."
      },
      "109": {
        "Name": "Band of Sizzling Thunder",
        "Description2pc": "Increases Lightning DMG by 10%.",
        "Description4pc": "When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn."
      },
      "110": {
        "Name": "Eagle of Twilight Line",
        "Description2pc": "Increases Wind DMG by 10%.",
        "Description4pc": "After the wearer uses their Ultimate, their action is Advanced Forward by 25%."
      },
      "111": {
        "Name": "Thief of Shooting Meteor",
        "Description2pc": "Increases Break Effect by 16%.",
        "Description4pc": "Increases the wearer's Break Effect by 16%. After the wearer inflicts Weakness Break on an enemy, regenerates 3 Energy."
      },
      "112": {
        "Name": "Wastelander of Banditry Desert",
        "Description2pc": "Increases Imaginary DMG by 10%.",
        "Description4pc": "When dealing DMG to debuffed enemy targets, the wearer has their CRIT Rate increased by 10%. And when they deal DMG to Imprisoned enemy targets, their CRIT DMG increases by 20%."
      },
      "113": {
        "Name": "Longevous Disciple",
        "Description2pc": "Increases Max HP by 12%.",
        "Description4pc": "When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by 8% for 2 turns and up to 2 stacks."
      },
      "114": {
        "Name": "Messenger Traversing Hackerspace",
        "Description2pc": "Increases SPD by 6%.",
        "Description4pc": "When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn. This effect cannot be stacked."
      },
      "115": {
        "Name": "The Ashblazing Grand Duke",
        "Description2pc": "Increases the DMG dealt by Follow-up ATK by 20%.",
        "Description4pc": "When the wearer uses a Follow-up ATK, increases the wearer's ATK by 6% for every time the Follow-up ATK deals DMG. This effect can stack up to 8 times and lasts for 3 turns. This effect is removed the next time the wearer uses a Follow-up ATK."
      },
      "116": {
        "Name": "Prisoner in Deep Confinement",
        "Description2pc": "Increases ATK by 12%.",
        "Description4pc": "For every DoT the enemy target is afflicted with, the wearer will ignore 6% of its DEF when dealing DMG to it. This effect is valid for a max of 3 DoTs."
      },
      "117": {
        "Name": "Pioneer Diver of Dead Waters",
        "Description2pc": "Increases DMG dealt to enemies with debuffs by 12%.",
        "Description4pc": "Increases CRIT Rate by 4%. The wearer deals 8%/12% increased CRIT DMG to enemies with at least 2/3 debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by 100%, lasting for 1 turn."
      },
      "118": {
        "Name": "Watchmaker, Master of Dream Machinations",
        "Description2pc": "Increases Break Effect by 16%.",
        "Description4pc": "When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by 30% for 2 turns. This effect cannot be stacked."
      },
      "119": {
        "Name": "Iron Cavalry Against the Scourge",
        "Description2pc": "Increases Break Effect by 16%.",
        "Description4pc": "If the wearer's Break Effect is 150% or higher, the Break DMG dealt to the enemy target ignores 10% of their DEF. If the wearer's Break Effect is 250% or higher, the Super Break DMG dealt to the enemy target additionally ignores 15% of their DEF."
      },
      "120": {
        "Name": "The Wind-Soaring Valorous",
        "Description2pc": "Increases ATK by 12%.",
        "Description4pc": "Increases the wearer's CRIT Rate by 6%. After the wearer uses a Follow-up ATK, increases DMG dealt by Ultimate by 36%, lasting for 1 turn."
      },
      "121": {
        "Name": "Sacerdos' Relived Ordeal",
        "Description2pc": "Increases SPD by 6%.",
        "Description4pc": "When using Skill or Ultimate on one ally target, increases the ability target's CRIT DMG by 18%, lasting for 2 turns. This effect can stack up to 2 times."
      },
      "122": {
        "Name": "Scholar Lost in Erudition",
        "Description2pc": "Increases CRIT Rate by 8%.",
        "Description4pc": "Increases DMG dealt by Skill and Ultimate by 20%. After using Ultimate, additionally increases the DMG dealt by the next Skill by 25%."
      },
      "123": {
        "Name": "Hero of Triumphant Song",
        "Description2pc": "Increases ATK by 12%.",
        "Description4pc": "While the wearer's memosprite is on the field, increases the wearer's SPD by 6%. When the wearer's memosprite attacks, increases the wearer's and memosprite's CRIT DMG by 30%, lasting for 2 turns."
      },
      "124": {
        "Name": "Poet of Mourning Collapse",
        "Description2pc": "Increases Quantum DMG by 10%.",
        "Description4pc": "Decreases the wearer's SPD by 8%. Before entering battle, if the wearer's SPD is lower than 110/95, increases the wearer's CRIT Rate by 20%/32%. This effect applies to the wearer's memosprite at the same time."
      },
      "125": {
        "Name": "Warrior Goddess of Sun and Thunder",
        "Description2pc": "Increases SPD by 6%.",
        "Description4pc": "When the wearer or their memosprite provides healing to ally targets other than themselves, the wearer gains \"Gentle Rain,\" which lasts for 2 turns and can only trigger once per turn. While the wearer has \"Gentle Rain,\" SPD increases by 6% and all allies' CRIT DMG increases by 15%. This effect cannot stack."
      },
      "126": {
        "Name": "Wavestrider Captain",
        "Description2pc": "Increases CRIT DMG by 16%.",
        "Description4pc": "When the wearer becomes the target of another ally target's ability, gains 1 stack of \"Help,\" stacking up to 2 times. If there are 2 stacks of \"Help\" when the wearer uses their Ultimate, consumes all \"Help\" to increase the wearer's ATK by 48% for 1 turn."
      },
      "127": {
        "Name": "World-Remaking Deliverer",
        "Description2pc": "Increases CRIT Rate by 8%.",
        "Description4pc": "After the wearer uses Basic ATK or Skill, if the wearer's memosprite is on the field, increases Max HP of the wearer and their memosprite by 24%, and increases all allies' dealt DMG by 15%, lasting until after the wearer's next use of Basic ATK or Skill."
      },
      "128": {
        "Name": "Self-Enshrouded Recluse",
        "Description2pc": "The provided Shield Effect increases by 10%.",
        "Description4pc": "Increases the Shield Effect provided by the wearer by 12%. When an ally target holds a Shield provided by the wearer, the ally target's CRIT DMG increases by 15%."
      },
      "301": {
        "Name": "Space Sealing Station",
        "Description2pc": "Increases the wearer's ATK by 12%. When the wearer's SPD reaches 120 or higher, the wearer's ATK increases by an extra 12%."
      },
      "302": {
        "Name": "Fleet of the Ageless",
        "Description2pc": "Increases the wearer's Max HP by 12%. When the wearer's SPD reaches 120 or higher, all allies' ATK increases by 8%."
      },
      "303": {
        "Name": "Pan-Cosmic Commercial Enterprise",
        "Description2pc": "Increases the wearer's Effect Hit Rate by 10%. Meanwhile, the wearer's ATK increases by an amount that is equal to 25% of the current Effect Hit Rate, up to a maximum increase of 25%."
      },
      "304": {
        "Name": "Belobog of the Architects",
        "Description2pc": "Increases the wearer's DEF by 15%. When the wearer's Effect Hit Rate is 50% or higher, the wearer gains an extra 15% DEF."
      },
      "305": {
        "Name": "Celestial Differentiator",
        "Description2pc": "Increases the wearer's CRIT DMG by 16%. When the wearer's current CRIT DMG reaches 120% or higher, after entering battle, the wearer's CRIT Rate increases by 60% until the end of their first attack."
      },
      "306": {
        "Name": "Inert Salsotto",
        "Description2pc": "Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 50% or higher, the DMG dealt by the wearer's Ultimate and Follow-up ATK increases by 15%."
      },
      "307": {
        "Name": "Talia: Kingdom of Banditry",
        "Description2pc": "Increases the wearer's Break Effect by 16%. When the wearer's SPD reaches 145 or higher, the wearer's Break Effect increases by an extra 20%."
      },
      "308": {
        "Name": "Sprightly Vonwacq",
        "Description2pc": "Increases the wearer's Energy Regeneration Rate by 5%. When the wearer's SPD reaches 120 or higher, the wearer's action is Advanced Forward by 40% immediately upon entering battle."
      },
      "309": {
        "Name": "Rutilant Arena",
        "Description2pc": "Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 70% or higher, DMG dealt by Basic ATK and Skill increases by 20%."
      },
      "310": {
        "Name": "Broken Keel",
        "Description2pc": "Increases the wearer's Effect RES by 10%. When the wearer's Effect RES is at 30% or higher, all allies' CRIT DMG increases by 10%."
      },
      "311": {
        "Name": "Firmament Frontline: Glamoth",
        "Description2pc": "Increases the wearer's ATK by 12%. When the wearer's SPD is equal to or higher than 135/160, the wearer deals 12%/18% more DMG."
      },
      "312": {
        "Name": "Penacony, Land of the Dreams",
        "Description2pc": "Increases wearer's Energy Regeneration Rate by 5%. Increases DMG by 10% for all other allies that are of the same Type as the wearer."
      },
      "313": {
        "Name": "Sigonia, the Unclaimed Desolation",
        "Description2pc": "Increases the wearer's CRIT Rate by 4%. When an enemy target gets defeated, the wearer's CRIT DMG increases by 4%, stacking up to 10 times."
      },
      "314": {
        "Name": "Izumo Gensei and Takama Divine Realm",
        "Description2pc": "Increases the wearer's ATK by 12%. When entering battle, if at least one teammate follows the same Path as the wearer, then the wearer's CRIT Rate increases by 12%."
      },
      "315": {
        "Name": "Duran, Dynasty of Running Wolves",
        "Description2pc": "When an ally uses a Follow-up ATK, the wearer gains 1 stack of Merit, stacking up to 5 times. Each stack of Merit increases the DMG dealt by the wearer's Follow-up ATKs by 5%. When there are 5 stacks, additionally increases the wearer's CRIT DMG by 25%."
      },
      "316": {
        "Name": "Forge of the Kalpagni Lantern",
        "Description2pc": "Increases the wearer's SPD by 6%. When the wearer hits an enemy target that has Fire Weakness, the wearer's Break Effect increases by 40%, lasting for 1 turn."
      },
      "317": {
        "Name": "Lushaka, the Sunken Seas",
        "Description2pc": "Increases the wearer's Energy Regeneration Rate by 5%. If the wearer is not the first character in the team lineup, then increases the ATK of the first character in the team lineup by 12%."
      },
      "318": {
        "Name": "The Wondrous BananAmusement Park",
        "Description2pc": "Increases the wearer's CRIT DMG by 16%. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by 32%."
      },
      "319": {
        "Name": "Bone Collection's Serene Demesne",
        "Description2pc": "Increases the wearer's Max HP by 12%. When the wearer's Max HP is 5000 or higher, increases the wearer's and their memosprite's CRIT DMG by 28%."
      },
      "320": {
        "Name": "Giant Tree of Rapt Brooding",
        "Description2pc": "Increases the wearer's SPD by 6%. When the wearer's SPD is 135/180 or higher, the wearer and their memosprite's Outgoing Healing increases by 12%/20%."
      },
      "321": {
        "Name": "Arcadia of Woven Dreams",
        "Description2pc": "When the number of ally targets on the field is not equal to 4, for every 1 additional/missing ally target, increases the DMG dealt by the wearer and their memosprite by 9%/12%, stacking up to 4/3 times."
      },
      "322": {
        "Name": "Revelry by the Sea",
        "Description2pc": "Increases the wearer's ATK by 12%. When the wearer's ATK is higher than or equal to 2400/3600, increases the DoT DMG dealt by 12%/24% respectively."
      },
      "323": {
        "Name": "Amphoreus, The Eternal Land",
        "Description2pc": "Increases the wearer's CRIT Rate by 8%. While the wearer's memosprite is on the field, increases all allies' SPD by 8%. This effect cannot be stacked."
      },
      "324": {
        "Name": "Tengoku @Live Stream",
        "Description2pc": "Increases the wearer's CRIT DMG by 16%. If 3 or more Skill Points are consumed in the same turn, additionally increases the wearer's CRIT DMG by 32% for 3 turns."
      }
    },
    "Lightcones": {
      "20000": {
        "Name": "Arrows"
      },
      "20001": {
        "Name": "Cornucopia"
      },
      "20002": {
        "Name": "Collapsing Sky"
      },
      "20003": {
        "Name": "Amber"
      },
      "20004": {
        "Name": "Void"
      },
      "20005": {
        "Name": "Chorus"
      },
      "20006": {
        "Name": "Data Bank"
      },
      "20007": {
        "Name": "Darting Arrow"
      },
      "20008": {
        "Name": "Fine Fruit"
      },
      "20009": {
        "Name": "Shattered Home"
      },
      "20010": {
        "Name": "Defense"
      },
      "20011": {
        "Name": "Loop"
      },
      "20012": {
        "Name": "Meshing Cogs"
      },
      "20013": {
        "Name": "Passkey"
      },
      "20014": {
        "Name": "Adversarial"
      },
      "20015": {
        "Name": "Multiplication"
      },
      "20016": {
        "Name": "Mutual Demise"
      },
      "20017": {
        "Name": "Pioneering"
      },
      "20018": {
        "Name": "Hidden Shadow"
      },
      "20019": {
        "Name": "Mediation"
      },
      "20020": {
        "Name": "Sagacity"
      },
      "20021": {
        "Name": "Shadowburn"
      },
      "20022": {
        "Name": "Reminiscence"
      },
      "21000": {
        "Name": "Post-Op Conversation"
      },
      "21001": {
        "Name": "Good Night and Sleep Well"
      },
      "21002": {
        "Name": "Day One of My New Life"
      },
      "21003": {
        "Name": "Only Silence Remains"
      },
      "21004": {
        "Name": "Memories of the Past"
      },
      "21005": {
        "Name": "The Moles Welcome You"
      },
      "21006": {
        "Name": "The Birth of the Self"
      },
      "21007": {
        "Name": "Shared Feeling"
      },
      "21008": {
        "Name": "Eyes of the Prey"
      },
      "21009": {
        "Name": "Landau's Choice"
      },
      "21010": {
        "Name": "Swordplay"
      },
      "21011": {
        "Name": "Planetary Rendezvous"
      },
      "21012": {
        "Name": "A Secret Vow"
      },
      "21013": {
        "Name": "Make the World Clamor"
      },
      "21014": {
        "Name": "Perfect Timing"
      },
      "21015": {
        "Name": "Resolution Shines As Pearls of Sweat"
      },
      "21016": {
        "Name": "Trend of the Universal Market"
      },
      "21017": {
        "Name": "Subscribe for More!"
      },
      "21018": {
        "Name": "Dance! Dance! Dance!"
      },
      "21019": {
        "Name": "Under the Blue Sky"
      },
      "21020": {
        "Name": "Geniuses' Repose"
      },
      "21021": {
        "Name": "Quid Pro Quo"
      },
      "21022": {
        "Name": "Fermata"
      },
      "21023": {
        "Name": "We Are Wildfire"
      },
      "21024": {
        "Name": "River Flows in Spring"
      },
      "21025": {
        "Name": "Past and Future"
      },
      "21026": {
        "Name": "Woof! Walk Time!"
      },
      "21027": {
        "Name": "The Seriousness of Breakfast"
      },
      "21028": {
        "Name": "Warmth Shortens Cold Nights"
      },
      "21029": {
        "Name": "We Will Meet Again"
      },
      "21030": {
        "Name": "This Is Me!"
      },
      "21031": {
        "Name": "Return to Darkness"
      },
      "21032": {
        "Name": "Carve the Moon, Weave the Clouds"
      },
      "21033": {
        "Name": "Nowhere to Run"
      },
      "21034": {
        "Name": "Today Is Another Peaceful Day"
      },
      "21035": {
        "Name": "What Is Real?"
      },
      "21036": {
        "Name": "Dreamville Adventure"
      },
      "21037": {
        "Name": "Final Victor"
      },
      "21038": {
        "Name": "Flames Afar"
      },
      "21039": {
        "Name": "Destiny's Threads Forewoven"
      },
      "21040": {
        "Name": "The Day The Cosmos Fell"
      },
      "21041": {
        "Name": "It's Showtime"
      },
      "21042": {
        "Name": "Indelible Promise"
      },
      "21043": {
        "Name": "Concert for Two"
      },
      "21044": {
        "Name": "Boundless Choreo"
      },
      "21045": {
        "Name": "After the Charmony Fall"
      },
      "21046": {
        "Name": "Poised to Bloom"
      },
      "21047": {
        "Name": "Shadowed by Night"
      },
      "21048": {
        "Name": "Dream's Montage"
      },
      "21050": {
        "Name": "Victory In a Blink"
      },
      "21051": {
        "Name": "Geniuses' Greetings"
      },
      "21052": {
        "Name": "Sweat Now, Cry Less"
      },
      "21053": {
        "Name": "Journey, Forever Peaceful"
      },
      "21054": {
        "Name": "The Story's Next Page"
      },
      "21055": {
        "Name": "Unto Tomorrow's Morrow"
      },
      "21056": {
        "Name": "In Pursuit of the Wind"
      },
      "21057": {
        "Name": "The Flower Remembers"
      },
      "21058": {
        "Name": "A Trail of Bygone Blood"
      },
      "21060": {
        "Name": "A Dream Scented in Wheat"
      },
      "21061": {
        "Name": "Holiday Thermae Escapade"
      },
      "21062": {
        "Name": "See You at the End"
      },
      "22000": {
        "Name": "Before the Tutorial Mission Starts"
      },
      "22001": {
        "Name": "Hey, Over Here"
      },
      "22002": {
        "Name": "For Tomorrow's Journey"
      },
      "22003": {
        "Name": "Ninja Record: Sound Hunt"
      },
      "22004": {
        "Name": "The Great Cosmic Enterprise"
      },
      "22005": {
        "Name": "The Forever Victual"
      },
      "22006": {
        "Name": "Take Flight Toward A Pink Tomorrow"
      },
      "23000": {
        "Name": "Night on the Milky Way"
      },
      "23001": {
        "Name": "In the Night"
      },
      "23002": {
        "Name": "Something Irreplaceable"
      },
      "23003": {
        "Name": "But the Battle Isn't Over"
      },
      "23004": {
        "Name": "In the Name of the World"
      },
      "23005": {
        "Name": "Moment of Victory"
      },
      "23006": {
        "Name": "Patience Is All You Need"
      },
      "23007": {
        "Name": "Incessant Rain"
      },
      "23008": {
        "Name": "Echoes of the Coffin"
      },
      "23009": {
        "Name": "The Unreachable Side"
      },
      "23010": {
        "Name": "Before Dawn"
      },
      "23011": {
        "Name": "She Already Shut Her Eyes"
      },
      "23012": {
        "Name": "Sleep Like the Dead"
      },
      "23013": {
        "Name": "Time Waits for No One"
      },
      "23014": {
        "Name": "I Shall Be My Own Sword"
      },
      "23015": {
        "Name": "Brighter Than the Sun"
      },
      "23016": {
        "Name": "Worrisome, Blissful"
      },
      "23017": {
        "Name": "Night of Fright"
      },
      "23018": {
        "Name": "An Instant Before A Gaze"
      },
      "23019": {
        "Name": "Past Self in Mirror"
      },
      "23020": {
        "Name": "Baptism of Pure Thought"
      },
      "23021": {
        "Name": "Earthly Escapade"
      },
      "23022": {
        "Name": "Reforged Remembrance"
      },
      "23023": {
        "Name": "Inherently Unjust Destiny"
      },
      "23024": {
        "Name": "Along the Passing Shore"
      },
      "23025": {
        "Name": "Whereabouts Should Dreams Rest"
      },
      "23026": {
        "Name": "Flowing Nightglow"
      },
      "23027": {
        "Name": "Sailing Towards a Second Life"
      },
      "23028": {
        "Name": "Yet Hope Is Priceless"
      },
      "23029": {
        "Name": "Those Many Springs"
      },
      "23030": {
        "Name": "Dance at Sunset"
      },
      "23031": {
        "Name": "I Venture Forth to Hunt"
      },
      "23032": {
        "Name": "Scent Alone Stays True"
      },
      "23033": {
        "Name": "Ninjutsu Inscription: Dazzling Evilbreaker"
      },
      "23034": {
        "Name": "A Grounded Ascent"
      },
      "23035": {
        "Name": "Long Road Leads Home"
      },
      "23036": {
        "Name": "Time Woven Into Gold"
      },
      "23037": {
        "Name": "Into the Unreachable Veil"
      },
      "23038": {
        "Name": "If Time Were a Flower"
      },
      "23039": {
        "Name": "Flame of Blood, Blaze My Path"
      },
      "23040": {
        "Name": "Make Farewells More Beautiful"
      },
      "23041": {
        "Name": "Life Should Be Cast to Flames"
      },
      "23042": {
        "Name": "Long May Rainbows Adorn the Sky"
      },
      "23043": {
        "Name": "Lies Dance on the Breeze"
      },
      "23044": {
        "Name": "Thus Burns the Dawn"
      },
      "23045": {
        "Name": "A Thankless Coronation"
      },
      "23046": {
        "Name": "The Hell Where Ideals Burn"
      },
      "23047": {
        "Name": "Why Does the Ocean Sing"
      },
      "23048": {
        "Name": "Epoch Etched in Golden Blood"
      },
      "23049": {
        "Name": "To Evernight's Stars"
      },
      "23051": {
        "Name": "Though Worlds Apart"
      },
      "23052": {
        "Name": "This Love, Forever"
      },
      "24000": {
        "Name": "On the Fall of an Aeon"
      },
      "24001": {
        "Name": "Cruising in the Stellar Sea"
      },
      "24002": {
        "Name": "Texture of Memories"
      },
      "24003": {
        "Name": "Solitary Healing"
      },
      "24004": {
        "Name": "Eternal Calculus"
      },
      "24005": {
        "Name": "Memory's Curtain Never Falls"
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
      "Memory": "Remembrance",
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
      "DocumentationTitle": "See full guide",
      "ButtonText": "Try it out!",
      "description": "Load a sample save file?\n⚠️This will replace all your current data!⚠️",
      "SuccessMessage": "Successfully loaded data",
      "Header": "Try it out!"
    }
  },
  "hint": {
    "RatingFilter": {
      "Title": "Rating filters",
      "p1": "Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives",
      "p2": "Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) / Break (Weakness Break) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options.",
      "p3": "Heal / Shield - Other ability calculations, based on the environmental factors in character passives / light cone passives / enemy options."
    },
    "CombatBuffs": {
      "Title": "Combat buffs",
      "p1": "Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations."
    },
    "ComboFilters": {
      "Title": "Combo rotation",
      "p1": "Define the ability rotation to measure Combo DMG. Rotations are defined with [ as the start of a turn, and ] as the end of a turn. See the Advanced Rotation menu and user guide for more details."
    },
    "StatFilters": {
      "Title": "Stat filters",
      "p1": "Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges",
      "p2": "Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect / Energy Regeneration Rate",
      "p3": "NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can't detect the hidden decimals."
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
      "p2": "Passive effects are applied under the Light cone passives panel."
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
      "PriorityFilter": "<0>Character priority filter</0> - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.",
      "BoostMain": "<0>Boost main stat</0> - Calculates relic mains stats as if they were this level (or their max if they can't reach this level) if they are currently below it. Substats are not changed accordingly, so builds with lower level relics may be stronger once you level them.",
      "KeepCurrent": "<0>Keep current relics</0> - The character must use its currently equipped items and the optimizer will try to fill in empty slots",
      "AllowEquipped": "<0>Allow equipped relics</0> - When enabled, the optimizer will allow using relics that are currently equipped by a character for the search. Otherwise equipped relics are excluded",
      "Priority": "<0>Priority</0> - See: Character priority filter. Changing this setting will change the character's priority",
      "Exclude": "<0>Exclude</0> - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter",
      "Enhance": "<0>Enhance / rarity</0> - Select the minimum enhance to search for and minimum stars for relics to include",
      "DPSMode": "<0>DPS mode</0> - Select whether the character should be the primary target for supportive buffs (Main DPS) or not (Sub DPS) for optimizer stat calculations"
    },
    "Relics": {
      "Title": "Relics",
      "p1": "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats.",
      "p2": "Selected character: Score - The relic's current score as defined by the scoring algorithm for the currently selected character",
      "p3": "Selected character: Average potential - The relic's potential at its maximum level, averaged across all the possible rolls it could have on the way to +15",
      "p4": "Selected character: Max potential - The relic's maximum potential if all future rolls went into the character's desired stats",
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
      "p2": "Effect RES - Enemy effect RES. Effect res is used for calculations relating to DOT damage",
      "p3": "Damage RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled.",
      "p4": "Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage.",
      "p5": "Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.",
      "p6": "Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0.",
      "p7": "Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives."
    },
    "SubstatWeightFilter": {
      "Title": "Substat weight filter",
      "p1": "This filter is used to reduce the number of permutations the optimizer has to process.",
      "p2": "It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.",
      "p3": "Only relics that have more than the specified number of weighted rolls will be used for the optimization search.",
      "p4": "Note that setting the minimum rolls too high may result in some builds not being displayed, if the filter ends up excluding a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time."
    },
    "StatDisplay": {
      "Title": "Stat and filter view",
      "p1": "This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.",
      "p2": "Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied.",
      "p3": "Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
    },
    "ValueColumns": {
      "Title": "Value Columns",
      "p1": "You can optionally display a number of columns that assess the relative 'value' of a relic.",
      "p2": "Potential",
      "p3": "Potential is a character-specific percentage of how good the relic could be (or 'is', if fully upgraded), compared against the stats on a fully upgraded 'perfect' relic in that slot.",
      "p4": "Potential can look at all characters or just owned. It then takes the maximum percentage for any character.",
      "p5": "Potential is useful for finding relics that aren't good on any character, or hidden gems that could be great when upgraded.",
      "p6": "Note: ordering by potential can be mismatched against weights, due to weight calculations preferring lower weight ideal mainstats."
    },
    "RelicInsights": {
      "Title": "Relic Insight",
      "p1": "When a relic is selected in the table above, you can choose an analysis to view a plot of.",
      "p2": "'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<1/>If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<3/>⚠️ Relics with missing substats may have misleadingly high buckets, as best-case upgrade analysis assumes the best new substat per character.",
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
  "hometab": {
    "CollapseLabels": {
      "Explore": "Explore the features",
      "Join": "Join the community"
    },
    "CommunityCollapse": "<0> A huge thanks to all our contributors, translators, users, and everyone who provided feedback, for supporting this project and helping to build it together! </0> <1> Come be a part of our Star Rail community! Join the <1 text='Discord'/> server to hang out, or check out the <3 text='GitHub'/> repo if you'd like to contribute. </1>",
    "FeatureCards": {
      "LearnMore": "Learn more",
      "Showcase": {
        "Title": "Character Showcase",
        "Content": "Showcase your character’s stats or prebuild future characters. Simulate their combat damage with DPS score and measure it against the benchmarks."
      },
      "Optimizer": {
        "Title": "Relic Optimizer",
        "Content": "Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats."
      },
      "Calculator": {
        "Title": "Damage Calculator",
        "Content": "Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output."
      },
      "Organizer": {
        "Title": "Relic Organizer",
        "Content": "Organize your relics by scoring and sorting relics based on their potential, and find the top relics to upgrade for each character."
      }
    },
    "Welcome": "Welcome to the<1/>Fribbels Star Rail Optimizer",
    "SearchBar": {
      "Placeholder": "UID",
      "Label": "Enter your UID to view your showcase characters",
      "Api": "Uses Enka.Network",
      "Message": "Invalid input - This should be your 9 digit ingame UUID",
      "Search": "Search"
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
      "ParserError": {
        "BadSource": "Incorrect source string, was '{{jsonSource}}', expected '{{configSource}}'",
        "BadVersion": "Incorrect json version, was '{{jsonVersion}}', expected '{{configVersion}}'",
        "OutdatedVersion": "Your scanner version {{buildVersion}} is out of date and may result in incorrect imports! Please update to the latest version from Github:",
        "BadMainstat": "Could not parse mainstat for relic with mainstat {{mainstat}} and part {{part}}"
      },
      "ParserWarning": {
        "BadRollInfo": "Scanner file is outdated / may contain invalid information. Please update your scanner."
      },
      "LiveImport": {
        "Title": "Live Import Controls",
        "Description": {
          "l1": "When using the Reliquary Archiver, you can enable the \"Live Import\" mode to import your inventory in real time.",
          "l2": "This includes new relics, enhanced relics, warp/gacha results, and more."
        },
        "Connected": "Connected",
        "Disconnected": "Disconnected",
        "DisconnectedHint": "Unable to connect to the scanner. Please check that it is running.",
        "Enable": "Enable Live Import (Recommended)",
        "UpdateCharacters": "Enable updating characters' equipped relics and lightcones",
        "UpdateWarpResources": "Enable importing Warp resources (jades, passes, pity)",
        "AdvancedSettings": {
          "Title": "Advanced Settings",
          "WebsocketUrl": "Websocket URL",
          "WebsocketUrlReset": "Reset to default"
        }
      },
      "Stage1": {
        "Header": "Install and run one of the relic scanner options:",
        "ReliquaryDesc": {
          "Title": "(Recommended) IceDynamix Reliquary Archiver",
          "Link": "Github",
          "OnlineMsg": "Status: Updated for patch {{version}}",
          "OfflineMsg": "***** Status: Down for maintenance after {{version}} patch *****",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "Imports full inventory and character roster",
          "l3": "Supports live importing (new/enhanced relics are imported in real time)"
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
        "FileInfo": "File contains $t(common:RelicWithCount, {\"count\": {{relicCount}}}) and $t(common:CharacterWithCount, {\"count\": {{characterCount}}}).",
        "NoRelics": "Invalid scanner file, please try a different file",
        "RelicsImport": {
          "Label": "Import $t(common:Relic, {\"count\": {{relicCount}}}) only. Updates the optimizer with the new dataset of $t(common:Relic, {\"count\": {{relicCount}}}) and doesn't overwrite builds.",
          "ButtonText": "Import $t(common:Relic, {\"count\": {{relicCount}}})"
        },
        "CharactersImport": {
          "Label": "Import $t(common:Relic, {\"count\": {{relicCount}}}) and $t(common:Character, {\"count\": {{characterCount}}}). Replaces the optimizer builds with ingame builds.",
          "ButtonText": "Import $t(common:Relic, {\"count\": {{relicCount}}}) & $t(common:Character, {\"count\": {{characterCount}}})",
          "WarningTitle": "Overwrite optimizer builds",
          "WarningDescription": "Are you sure you want to overwrite your optimizer builds with ingame builds?",
          "OnlyImportExisting": "Only import existing characters"
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
        "Label": "File contains $t(common:RelicWithCount, {\"count\": {{relicCount}}}) and $t(common:CharacterWithCount, {\"count\": {{characterCount}}}). Replace your current data with the uploaded data?",
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
      "OldRelics": "Updated stats for {{count}} existing $t(common:Relic, {\"count\": {{count}}})",
      "NewRelics": "Added {{count}} new $t(common:Relic, {\"count\": {{count}}})"
    }
  },
  "modals": {
    "Scoring": {
      "StatWeightsHeader": "Stat weights",
      "SetWeightsHeader": "Set weights",
      "MainstatsHeader": "Optimal mainstats",
      "SetWeights": {
        "AddRelicSetPlaceholder": "Add relic set",
        "AddOrnamentSetPlaceholder": "Add ornament set"
      },
      "WeightMethodology": {
        "Header": "How is Stat Score calculated?"
      },
      "Footer": {
        "Reset": "Reset to default",
        "ResetAll": "Reset all characters",
        "Save": "Save changes"
      },
      "ResetAllConfirm": {
        "Title": "Reset the scoring algorithm for all characters?",
        "Description": "You will lose any custom scoring settings you have set on any character."
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
          "SuccessMessage": "Reset Maximum $t(common:Stats.HP) filter",
          "Description": "Maximum $t(common:Stats.HP) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.HP) filter"
        },
        "MIN_HP": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.HP) filter",
          "Description": "Minimum $t(common:Stats.HP) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.HP) filter"
        },
        "MAX_ATK": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.ATK) filter",
          "Description": "Maximum $t(common:Stats.ATK) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.ATK) filter"
        },
        "MIN_ATK": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.ATK) filter",
          "Description": "Minimum $t(common:Stats.ATK) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.ATK) filter"
        },
        "MAX_DEF": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.DEF) filter",
          "Description": "Maximum $t(common:Stats.DEF) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.DEF) filter"
        },
        "MIN_DEF": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.DEF) filter",
          "Description": "Minimum $t(common:Stats.DEF) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.DEF) filter"
        },
        "MAX_SPD": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.SPD) filter",
          "Description": "Maximum $t(common:Stats.SPD) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.SPD) filter"
        },
        "MIN_SPD": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.SPD) filter",
          "Description": "Minimum $t(common:Stats.SPD) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.SPD) filter"
        },
        "MAX_CR": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.CRIT Rate) filter",
          "Description": "Maximum $t(common:Stats.CRIT Rate) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.CRIT Rate) filter"
        },
        "MIN_CR": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.CRIT Rate) filter",
          "Description": "Minimum $t(common:Stats.CRIT Rate) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.CRIT Rate) filter"
        },
        "MAX_CD": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.CRIT DMG) filter",
          "Description": "Maximum $t(common:Stats.CRIT DMG) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.CRIT DMG) filter"
        },
        "MIN_CD": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.CRIT DMG) filter",
          "Description": "Minimum $t(common:Stats.CRIT DMG) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.CRIT DMG) filter"
        },
        "MAX_EHR": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.Effect Hit Rate) filter",
          "Description": "Maximum $t(common:Stats.Effect Hit Rate) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.Effect Hit Rate) filter"
        },
        "MIN_EHR": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.Effect Hit Rate) filter",
          "Description": "Minimum $t(common:Stats.Effect Hit Rate) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.Effect Hit Rate) filter"
        },
        "MAX_RES": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.Effect RES) filter",
          "Description": "Maximum $t(common:Stats.Effect RES) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.Effect RES) filter"
        },
        "MIN_RES": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.Effect RES) filter",
          "Description": "Minimum $t(common:Stats.Effect RES) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.Effect RES) filter"
        },
        "MAX_BE": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.Break Effect) filter",
          "Description": "Maximum $t(common:Stats.Break Effect) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.Break Effect) filter"
        },
        "MIN_BE": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.Break Effect) filter",
          "Description": "Minimum $t(common:Stats.Break Effect) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.Break Effect) filter"
        },
        "MAX_ERR": {
          "SuccessMessage": "Reset Maximum $t(common:Stats.Energy Regeneration Rate) filter",
          "Description": "Maximum $t(common:Stats.Energy Regeneration Rate) may be too low",
          "ButtonText": "Reset Maximum $t(common:Stats.Energy Regeneration Rate) filter"
        },
        "MIN_ERR": {
          "SuccessMessage": "Reset Minimum $t(common:Stats.Energy Regeneration Rate) filter",
          "Description": "Minimum $t(common:Stats.Energy Regeneration Rate) may be too high",
          "ButtonText": "Reset Minimum $t(common:Stats.Energy Regeneration Rate) filter"
        },
        "MAX_EHP": {
          "SuccessMessage": "Reset Maximum EHP filter",
          "Description": "Maximum EHP may be too low",
          "ButtonText": "Reset Maximum EHP filter"
        },
        "MIN_EHP": {
          "SuccessMessage": "Reset Minimum EHP filter",
          "Description": "Minimum EHP may be too high",
          "ButtonText": "Reset Minimum EHP filter"
        },
        "MAX_BASIC": {
          "SuccessMessage": "Reset Maximum Basic filter",
          "Description": "Maximum basic attack damage may be too low",
          "ButtonText": "Reset Maximum Basic filter"
        },
        "MIN_BASIC": {
          "SuccessMessage": "Reset Minimum Basic filter",
          "Description": "Minimum basic attack damage may be too high",
          "ButtonText": "Reset Minimum Basic filter"
        },
        "MAX_SKILL": {
          "SuccessMessage": "Reset Maximum Skill filter",
          "Description": "Maximum skill damage may be too low",
          "ButtonText": "Reset Maximum Skill filter"
        },
        "MIN_SKILL": {
          "SuccessMessage": "Reset Minimum Skill filter",
          "Description": "Minimum skill damage may be too high",
          "ButtonText": "Reset Minimum Skill filter"
        },
        "MAX_ULT": {
          "SuccessMessage": "Reset Maximum ULT filter",
          "Description": "Maximum ultimate damage may be too low",
          "ButtonText": "Reset Maximum ULT filter"
        },
        "MIN_ULT": {
          "SuccessMessage": "Reset Minimum ULT filter",
          "Description": "Minimum ultimate damage may be too high",
          "ButtonText": "Reset Minimum ULT filter"
        },
        "MAX_FUA": {
          "SuccessMessage": "Reset Maximum FUA filter",
          "Description": "Maximum follow-up attack damage may be too low",
          "ButtonText": "Reset Maximum FUA filter"
        },
        "MIN_FUA": {
          "SuccessMessage": "Reset Minimum FUA filter",
          "Description": "Minimum follow-up attack damage may be too high",
          "ButtonText": "Reset Minimum FUA filter"
        },
        "MAX_DOT": {
          "SuccessMessage": "Reset Maximum DOT filter",
          "Description": "Maximum DOT damage may be too low",
          "ButtonText": "Reset Maximum DOT filter"
        },
        "MIN_DOT": {
          "SuccessMessage": "Reset Minimum DOT filter",
          "Description": "Minimum DOT damage may be too high",
          "ButtonText": "Reset Minimum DOT filter"
        },
        "MAX_BREAK": {
          "SuccessMessage": "Reset Maximum Break filter",
          "Description": "Maximum break damage may be too low",
          "ButtonText": "Reset Maximum Break filter"
        },
        "MIN_BREAK": {
          "SuccessMessage": "Reset Minimum Break filter",
          "Description": "Minimum break damage may be too high",
          "ButtonText": "Reset Minimum Break filter"
        },
        "MAX_MEMO_SKILL": {
          "SuccessMessage": "Reset Maximum Memo Skill filter",
          "Description": "Maximum Memo Skill damage may be too low",
          "ButtonText": "Reset Maximum Memo Skill filter"
        },
        "MIN_MEMO_SKILL": {
          "SuccessMessage": "Reset Minimum Memo Skill filter",
          "Description": "Minimum Memo Skill damage may be too high",
          "ButtonText": "Reset Minimum Memo Skill filter"
        },
        "MAX_MEMO_TALENT": {
          "SuccessMessage": "Reset Maximum Memo Talent filter",
          "Description": "Maximum Memo Talent damage may be too low",
          "ButtonText": "Reset Maximum Memo Talent filter"
        },
        "MIN_MEMO_TALENT": {
          "SuccessMessage": "Reset Minimum Memo Talent filter",
          "Description": "Minimum Memo Talent damage may be too high",
          "ButtonText": "Reset Minimum Memo Talent filter"
        },
        "MAX_HEAL": {
          "SuccessMessage": "Reset Maximum HEAL filter",
          "Description": "Maximum HEAL may be too low",
          "ButtonText": "Reset Maximum HEAL filter"
        },
        "MIN_HEAL": {
          "SuccessMessage": "Reset Minimum HEAL filter",
          "Description": "Minimum HEAL may be too high",
          "ButtonText": "Reset Minimum HEAL filter"
        },
        "MAX_SHIELD": {
          "SuccessMessage": "Reset Maximum SHIELD filter",
          "Description": "Maximum SHIELD may be too low",
          "ButtonText": "Reset Maximum SHIELD filter"
        },
        "MIN_SHIELD": {
          "SuccessMessage": "Reset Minimum SHIELD filter",
          "Description": "Minimum SHIELD may be too high",
          "ButtonText": "Reset Minimum SHIELD filter"
        },
        "MAX_COMBO": {
          "SuccessMessage": "Reset Maximum Combo filter",
          "Description": "Maximum combo damage may be too low",
          "ButtonText": "Reset Maximum Combo filter"
        },
        "MIN_COMBO": {
          "SuccessMessage": "Reset Minimum Combo filter",
          "Description": "Minimum combo damage may be too high",
          "ButtonText": "Reset Minimum Combo filter"
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
      "Character": "Character",
      "Lightcone": "Light cone"
    },
    "Relic": {
      "Part": "Part",
      "Wearer": "Equipped by",
      "Set": "Set",
      "Enhance": "Enhance / Grade",
      "Mainstat": "Main stat",
      "Substat": "Substats",
      "SubstatPlaceholder": "Substat",
      "SpdInputWarning": "Note - SPD substats ingame contain hidden decimal values which are inaccurate if input manually. For precise SPD values, use the Showcase tab or Reliquary Archiver import.",
      "LiveImportWarning": "Live import mode is enabled, your changes might be overwritten.",
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
        "Change": "Change image",
        "Previous": "Previous",
        "Next": "Next"
      }
    },
    "SaveBuild": {
      "Label": "Build name",
      "Rule": "Please input a name"
    },
    "SwitchRelics": {
      "Title": "Switch relics with character"
    },
    "Builds": {
      "DeleteAll": "Delete All",
      "Equip": "Equip",
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
        "NoneSaved": "No saved builds"
      }
    },
    "ScoreFooter": {
      "ModalTitle": "Combat sim scoring settings",
      "OkText": "OK",
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
        "Placeholder": "Character",
        "ModalTitle": "Select a character"
      },
      "SearchPlaceholder": "Search character name",
      "ExcludeButton": "Exclude all",
      "ClearButton": "Clear"
    },
    "LightconeSelect": {
      "Placeholder": "Light cone",
      "Title": "Select a light cone"
    },
    "RelicReroll": {
      "Title": "Relic Reroll Detected",
      "OriginalSubstats": "Original Substats",
      "RerolledSubstats": "Rerolled Substats"
    }
  },
  "notifications": {
    "GPU": {
      "Message": "WebGPU is not supported on this browser!",
      "Description": {
        "l1": "Please use one of the following supported environments in order to enable GPU acceleration:",
        "l2": "Windows & Mac — Chrome, Opera, Edge",
        "l3": "Linux — <CustomLink text=\"Behind a flag\"/>",
        "l4": "If you're on one of the supported browsers and it doesn't work, first try updating your browser version, otherwise try another browser, or try switching your browser to use your dedicated graphics card instead of integrated."
      }
    },
    "GPUCrash": {
      "Message": "WebGPU error",
      "Description": {
        "l1": "The GPU acceleration process has crashed - results may be invalid. Please try again or report a bug to the Discord server.",
        "l2": "For troubleshooting steps, check the <CustomLink text=\"documentation page.\"/>"
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
    "ValidationMessages": {
      "Warning": {
        "MissingTeammates": "Select teammates for more accurate optimization results.",
        "PathMismatch": "Character path doesn't match light cone path."
      },
      "Error": {
        "TopPercent": "All substat weights are set to 0. Make sure to set the substat weights for your character or use the Recommended presets button.",
        "MissingTarget": "Missing optimization target fields",
        "MissingCharacter": "Missing character fields",
        "MissingLightCone": "Missing light cone fields",
        "GPUNotAvailable": "GPU acceleration is not available on this browser - only desktop Chrome and Opera are supported. If you are on a supported browser, report a bug to the Discord server"
      }
    },
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
    "RelicSetSelector": {
      "Placeholder": "Relic set",
      "4pcLabel": "4 Piece",
      "2+2pcLabel": "2 + 2 Piece",
      "2pcLabel": "2 + Any"
    },
    "OrnamentSetSelector": {
      "Placeholder": "Ornament set"
    },
    "SortOptions": {
      "DMGLabel": "Damage calculations",
      "StatLabel": "Stats",
      "COMBO": "Sorted by Combo DMG",
      "BASIC": "Sorted by Basic DMG",
      "SKILL": "Sorted by Skill DMG",
      "ULT": "Sorted by Ult DMG",
      "FUA": "Sorted by Follow-up DMG",
      "MEMO_SKILL": "Sorted by Memo Skill DMG",
      "MEMO_TALENT": "Sorted by Memo Talent DMG",
      "DOT": "Sorted by DoT DMG",
      "BREAK": "Sorted by Break DMG",
      "HEAL": "Sorted by Heal",
      "SHIELD": "Sorted by Shield",
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
        "Label0": "+0",
        "Label3": "+3",
        "Label6": "+6",
        "Label9": "+9",
        "Label12": "+12",
        "Label15": "+15"
      },
      "DPSMode": {
        "Header": "DPS mode",
        "Main": "Main",
        "Sub": "Sub"
      }
    },
    "AdvancedOptions": {
      "Header": "Advanced options",
      "EnemyConfigButtonText": "Enemy configurations",
      "CombatBuffsButtonTextNone": "Extra combat buffs",
      "CombatBuffsButtonText": "Extra combat buffs ({{activeCount}})",
      "CustomTracesButtonText": "Custom stat traces"
    },
    "Grid": {
      "To": "to",
      "Of": "of",
      "Page": "Page",
      "PageSelectorLabel": "Page Size:",
      "Loading": "Loading...",
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
          "HEAL": "HEAL",
          "SHIELD": "SHIELD",
          "BASIC": "BASIC\nDMG",
          "SKILL": "SKILL\nDMG",
          "ULT": "ULT\nDMG",
          "FUA": "FUA\nDMG",
          "MEMO_SKILL": "SKILLᴹ\nDMG",
          "MEMO_TALENT": "TALENTᴹ\nDMG",
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
          "HEAL": "HEAL",
          "SHIELD": "SHIELD",
          "BASIC": "BASIC\nDMG",
          "SKILL": "SKILL\nDMG",
          "ULT": "ULT\nDMG",
          "FUA": "FUA\nDMG",
          "MEMO_SKILL": "SKILLᴹ\nDMG",
          "MEMO_TALENT": "TALENTᴹ\nDMG",
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
      "ComputeEngine": "Compute engine",
      "ProgressText": {
        "Progress": "Progress",
        "CalculatingETA": "Progress  (calculating ETA..)",
        "TimeRemaining": "{{rate}} / sec — {{timeRemaining}} left",
        "Finished": "{{rate}} / sec — Finished"
      },
      "ControlsGroup": {
        "Header": "Controls",
        "Start": "Start optimizer",
        "ResetConfirm": {
          "Title": "Reset all filters?",
          "Description": "All filters will be reset to their default values"
        }
      },
      "StatViewGroup": {
        "Header": "Stat and filter view",
        "CombatStats": "Combat stats",
        "BasicStats": "Basic stats",
        "SummonerStats": "Summoner",
        "MemospriteStats": "Memosprite"
      },
      "ResultsGroup": {
        "Header": "Results",
        "Equip": "Equip",
        "EquipSuccessMessage": "Equipped",
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
      "Character custom stats simulation": "Character custom stats simulation",
      "Analysis": "Optimization results analysis"
    },
    "TracesDrawer": {
      "Title": "Custom stat traces",
      "Header": "Activated stat traces (all enabled by default)",
      "ButtonText": "Save changes"
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
        },
        "Arcadia": {
          "Display": "{{allyCount}}x",
          "Label": "{{allyCount}} allies (+{{buffValue}}% DMG)"
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
        "Valorous": "When enabled, the DMG% buff for Ultimate damage is applied to Combat stat calculations.",
        "Sacerdos": "The selected buff is applied to damage calculations. Characters who buff themselves can trigger this effect.",
        "Scholar": "When enabled, the DMG% buff for Skill damage will be enhanced in accordance with the character's COMBO sequence.",
        "Hero": "When enabled, the SPD% and CRIT Damage buffs are applied to combat stat calculations.",
        "Differentiator": "When enabled, the CRIT Rate buff is applied to Combat stat calculations.",
        "Penacony": "When enabled, the DMG% buff will apply to the wearer's memosprite.",
        "Sigonia": "The selected CRIT DMG buff is applied to Combat stat calculations, assuming the character has defeated that number of enemies.",
        "Izumo": "When enabled, if there is an ally with the same path, applies the 12% CRIT Rate buff to Combat stat calculations.",
        "Duran": "The selected buff is applied to damage calculations based on the number of stacks.",
        "Kalpagni": "When enabled, applies the Break Effect buff to combat stat calculations.",
        "Lushaka": "Disabled by default - This set is unable to affect its wearer.",
        "Banana": "When enabled, the additional 32% CRIT DMG is applied to Combat stat calculations.",
        "Arcadia": "The selected buff is applied to Combat stat calculations. Updates automatically when team selection changes."
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
      "MEMOSKILLLabel": "SKILLᴹ",
      "DOTLabel": "DOT",
      "BREAKLabel": "BREAK",
      "HEALLabel": "HEAL",
      "SHIELDLabel": "SHIELD",
      "COMBOLabel": "COMBO"
    },
    "ComboFilter": {
      "Header": "Combo DMG ability rotation",
      "AbilityLabel": "Abilities",
      "ModeSelector": {
        "Simple": "Simple",
        "Advanced": "Advanced"
      },
      "RowControls": {
        "Header": "Controls",
        "Add": "+",
        "Remove": "-",
        "ResetConfirm": {
          "Description": "Reset all Simple / Advanced rotation settings to default?"
        },
        "PresetsHeader": "Presets"
      },
      "CounterLabels": {
        "Dot": "Dots"
      },
      "ComboOptions": {
        "None": "None",
        "Basic": "Basic",
        "Skill": "Skill",
        "Ult": "Ult",
        "Fua": "Fua",
        "Dot": "Dot",
        "Break": "Break",
        "MemoSkill": "Skillᴹ",
        "MemoTalent": "Talentᴹ"
      },
      "RotationButton": "Advanced rotation"
    },
    "ComboDrawer": {
      "NoConditionals": "No conditional passives",
      "Title": "Advanced Rotation User Guide",
      "Placeholders": {
        "Sets": "Relic set conditionals",
        "Ornaments": "Ornament set conditionals"
      },
      "GroupHeaders": {
        "Sets": "Relic / Ornament set conditionals",
        "Teammate1": "Teammate 1 conditionals",
        "Teammate2": "Teammate 2 conditionals",
        "Teammate3": "Teammate 3 conditionals"
      }
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
        "Warrior": {
          "Desc": "$t(gameData:RelicSets.125.Name) (+15% CD)",
          "Set": "$t(gameData:RelicSets.125.Name)",
          "Text": "15% CD"
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
      "SetSelection": {
        "Header": "Sets",
        "RelicPlaceholder": "Relic set",
        "OrnamentPlaceholder": "Ornament set"
      },
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
        "Description": "Are you sure you want to clear all of this character's saved simulations?"
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
    },
    "ExpandedDataPanel": {
      "SubstatUpgrades": {
        "ColumnHeaders": {
          "Substat": "+1x Substat",
          "COMBO_DMG": "Δ Combo DMG",
          "COMBO_DMG_P": "Δ% Combo DMG",
          "EHP": "Δ EHP",
          "EHP_P": "Δ% EHP",
          "HEAL_VALUE": "Δ Heal",
          "HEAL_VALUE_P": "Δ% Heal",
          "SHIELD_VALUE": "Δ Shield",
          "SHIELD_VALUE_P": "Δ% Shield"
        }
      },
      "DamageSplits": {
        "Title": "Damage Type Distribution",
        "Legend": {
          "abilityDmg": "Ability",
          "breakDmg": "Break",
          "superBreakDmg": "Super Break",
          "additionalDmg": "Additional",
          "trueDmg": "True",
          "jointDmg": "Joint",
          "dotDmg": "Dot",
          "memoDmg": "Memo"
        },
        "YAxisLabel": {
          "BASIC_DMG": "Basic",
          "SKILL_DMG": "Skill",
          "ULT_DMG": "Ult",
          "FUA_DMG": "Fua",
          "DOT_DMG": "Dot",
          "BREAK_DMG": "Break",
          "MEMO_SKILL_DMG": "Skillᴹ",
          "MEMO_TALENT_DMG": "Talentᴹ"
        },
        "TooltipText": {
          "abilityDmg": "Ability DMG",
          "breakDmg": "Break DMG",
          "superBreakDmg": "Super Break DMG",
          "additionalDmg": "Additional DMG",
          "trueDmg": "True DMG",
          "jointDmg": "Joint DMG",
          "dotDmg": "Dot DMG",
          "memoDmg": "Memo DMG"
        }
      },
      "BuffsAnalysisDisplay": {
        "Values": {
          "BoolFalse": "No",
          "BoolTrue": "Yes"
        },
        "Sources": {
          "Basic": "Basic",
          "Skill": "Skill",
          "Ult": "Ult",
          "Talent": "Talent",
          "Technique": "Technique",
          "Trace": "Trace",
          "Memo": "Memo",
          "E1": "E1",
          "E2": "E2",
          "E4": "E4",
          "E6": "E6"
        },
        "Stats": {
          "CompositeLabels": {
            "Label": "{{prefix}} {{suffix}}",
            "Prefix": {
              "Basic": "Basic",
              "Skill": "Skill",
              "Ult": "Ult",
              "Fua": "Fua",
              "Dot": "Dot",
              "Break": "Break",
              "Memo Skill": "Memo Skill",
              "Memo Talent": "Memo Talent"
            },
            "Suffix": {
              "ATK scaling": "ATK scaling",
              "DEF scaling": "DEF scaling",
              "HP scaling": "HP scaling",
              "Special scaling": "Special scaling",
              "ATK % boost": "ATK % boost",
              "Crit Rate boost": "Crit Rate boost",
              "Crit DMG boost": "Crit DMG boost",
              "DMG boost": "DMG boost",
              "Vulnerability": "Vulnerability",
              "RES PEN": "RES PEN",
              "DEF PEN": "DEF PEN",
              "Break DEF PEN": "Break DEF PEN",
              "Toughness DMG": "Toughness DMG",
              "Super Break multiplier": "Super Break multiplier",
              "Break Efficiency boost": "Break Efficiency boost",
              "True DMG multiplier": "True DMG multiplier",
              "Final DMG multiplier": "Final DMG multiplier",
              "Break DMG multiplier": "Break DMG multiplier",
              "Additional DMG scaling": "Additional DMG scaling",
              "Additional DMG": "Additional DMG",
              "DMG": "DMG"
            }
          },
          "Misc": {
            "Base HP": "Base HP",
            "Base ATK": "Base ATK",
            "Base DEF": "Base DEF",
            "Base SPD": "Base SPD",
            "Memosprite base HP scaling": "Memosprite base HP scaling",
            "Memosprite base DEF scaling": "Memosprite base DEF scaling",
            "Memosprite base ATK scaling": "Memosprite base ATK scaling",
            "Memosprite base SPD scaling": "Memosprite base SPD scaling",
            "Memosprite base HP flat": "Memosprite base HP flat",
            "Memosprite base DEF flat": "Memosprite base DEF flat",
            "Memosprite base ATK flat": "Memosprite base ATK flat",
            "Memosprite base SPD flat": "Memosprite base SPD flat",
            "Elemental DMG": "Elemental DMG",
            "DMG reduction": "DMG reduction",
            "Effective HP": "Effective HP",
            "Summons": "Summons",
            "Memosprite": "Memosprite",
            "Enemy weakness broken": "Enemy weakness broken",
            "Prioritize memosprite buffs": "Prioritize memosprite buffs",
            "Deprioritize buffs": "Deprioritize buffs",
            "Combo DMG": "Combo DMG",
            "Dot base chance": "Dot base chance",
            "Effect RES PEN": "Effect RES PEN",
            "Dot DMG split": "Dot DMG split",
            "Dot stacks": "Dot stacks",
            "Heal ability type": "Heal ability type",
            "Heal flat": "Heal flat",
            "Heal scaling": "Heal scaling",
            "Heal value": "Heal value",
            "Shield flat": "Shield flat",
            "Shield scaling": "Shield scaling",
            "Shield value": "Shield value",
            "Shield boost": "Shield boost",
            "Skill Outgoing Healing Boost": "Skill Outgoing Healing Boost",
            "Ult Outgoing Healing Boost": "Ult Outgoing Healing Boost",
            "Super Break DEF PEN": "Super Break DEF PEN",
            "Super Break DMG Boost": "Super Break DMG Boost",
            "Super Break Vulnerability": "Super Break Vulnerability",
            "Additional DMG boost": "Additional DMG boost",
            "Ult Additional DMG CR override": "Ult Additional DMG CR override",
            "Ult Additional DMG CD override": "Ult Additional DMG CD override"
          },
          "DmgTypes": {
            "Basic": "Basic DMG type",
            "Skill": "Skill DMG type",
            "Ult": "Ult DMG type",
            "Fua": "Fua DMG type",
            "Dot": "Dot DMG type",
            "Break": "Break DMG type",
            "MemoSkill": "Memo Skill DMG type",
            "MemoTalent": "Memo Talent DMG type",
            "Additional": "Additional DMG type",
            "SuperBreak": "Super Break DMG type"
          },
          "ResPen": "$t(common:Elements.{{element}}) RES PEN",
          "Unconvertible": "Unconvertible  $t(common:Stats.{{stat}})"
        }
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
      "AlgorithmButton": "Scoring algorithm"
    },
    "CopyScreenshot": "Copy screenshot",
    "ImportLabels": {
      "Relics": "Import relics into optimizer",
      "SingleCharacter": "Import selected character & all relics into optimizer",
      "AllCharacters": "Import all characters & all relics into optimizer"
    },
    "SimulateRelics": "Simulate relics on another character",
    "OptimizeOnCharacter": "Optimize character stats",
    "Disclaimer": "Note: Combo DMG is meant to compare different relics relative to the selected team, and should <1>NOT</1> be used to compare different teams / LCs / eidolons!"
  },
  "relicsTab": {
    "RelicFilterBar": {
      "Part": "Part",
      "Enhance": "Enhance",
      "Grade": "Grade",
      "InitialRolls": "Initial Rolls",
      "Verified": "Verified",
      "Equipped": "Equipped",
      "Clear": "Clear",
      "ClearButton": "Clear all filters",
      "Set": "Set",
      "Mainstat": "Main stats",
      "Substat": "Substats",
      "ScoringButton": "Scoring algorithm",
      "RecommendationHeader": "Relic recommendation character",
      "Rating": "Relic ratings",
      "CustomCharsHeader": "Custom potential characters"
    },
    "RecentlyUpdatedRelics": {
      "Header": "Recently updated relics",
      "Potential": "POTENTIAL",
      "Avg": "AVG",
      "Max": "MAX",
      "BestFor": "BEST FOR",
      "Tooltip": "Average and maximum potential scores for this character"
    },
    "Messages": {
      "AddRelicSuccess": "Successfully added relic",
      "NoRelicSelected": "No relic selected",
      "DeleteRelicSuccess": "Successfully deleted relic",
      "UnableToDeleteRelic": "Unable to delete relic"
    },
    "RelicGrid": {
      "To": "to",
      "Of": "of",
      "Headers": {
        "EquippedBy": "Owner",
        "Set": "Set",
        "Part": "Part",
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
          },
          "RerollAvg": {
            "Label": "Selected character: Reroll average potential",
            "Header": "Selected Char\nReroll Avg"
          },
          "RerollAvgDelta": {
            "Label": "Selected character: Reroll average delta potential",
            "Header": "Selected Char\nΔ Reroll Avg"
          },
          "RerollAvgEquippedDelta": {
            "Label": "Selected character: Reroll average delta potential vs equipped",
            "Header": "Selected Char\n∆ Reroll AVG\nVS Equipped"
          }
        },
        "CustomCharacters": {
          "Label": "Custom characters",
          "AvgPotCol": {
            "Label": "Custom characters: Average potential",
            "Header": "Custom Chars\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "Custom characters: Max potential",
            "Header": "Custom Chars\nMax Potential"
          },
          "RerollAvg": {
            "Label": "Custom characters: Average reroll potential",
            "Header": "Custom Chars\nAvg Reroll"
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
          },
          "RerollAvg": {
            "Label": "All characters: Average reroll potential",
            "Header": "All Chars\nAvg Reroll"
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
        "PlotCustom": "Show custom characters",
        "PlotOwned": "Show owned characters"
      },
      "EditRelic": "Edit relic",
      "DeleteRelic": {
        "ButtonText": "Delete relic",
        "Warning_one": "Delete the selected relic?",
        "Warning_other": "Delete the {{count}} selected relics?"
      },
      "AddRelic": "Add New Relic"
    },
    "RelicInsights": {
      "NewStats": "New stats: ",
      "UpgradedStats": "Upgraded stats: ",
      "AvgPotential": "Average potential: "
    }
  },
  "settings": {
    "Title": "Settings",
    "RelicEquippingBehavior": {
      "Label": "Equipping relics from another character",
      "Replace": "Default: Replace relics without swapping",
      "Swap": "Swap relics with previous owner"
    },
    "PermutationsSidebarBehavior": {
      "Label": "Shrink optimizer sidebar on smaller screens",
      "ShowXL": "Default: Minimize if most of the sidebar is hidden",
      "ShowXXL": "Minimize if any of the sidebar is hidden",
      "NoShow": "Always keep the sidebar on the right"
    },
    "ExpandedInfoPanelPosition": {
      "Label": "Optimizer Expanded info panel position",
      "Above": "Show expanded info above relics preview",
      "Below": "Default: Show expanded info below relics preview"
    },
    "ShowLocatorInRelicsModal": {
      "Label": "Relic locator in relic editor",
      "Yes": "Show the relic locator in the relic editor",
      "No": "Default: Do not show the relic locator in the relic editor"
    }
  },
  "sidebar": {
    "Tools": {
      "Title": "Tools",
      "Showcase": "Showcase",
      "WarpPlanner": "Warp Planner",
      "Benchmarks": "Benchmarks"
    },
    "Optimization": {
      "Title": "Optimization",
      "Optimizer": "Optimizer",
      "Relics": "Relics",
      "Characters": "Characters",
      "Import": "Import / Save",
      "Settings": "Settings",
      "Start": "Get Started"
    },
    "Links": {
      "Home": "Home",
      "Title": "Links",
      "Changelog": "Changelog",
      "Discord": "Discord",
      "Github": "GitHub",
      "Kofi": "Ko-fi",
      "Unleak": "No leaks",
      "Leaks": "Beta content"
    }
  },
  "warpCalculatorTab": {
    "StrategyLabels": {
      "S1": "S1 first",
      "E0": "E0 first",
      "E1": "E1 first",
      "E2": "E2 first",
      "E3": "E3 first",
      "E4": "E4 first",
      "E5": "E5 first",
      "E6": "E6 first"
    },
    "RefundLabels": {
      "REFUND_NONE": "None",
      "REFUND_NONE_FULL": "None",
      "REFUND_LOW": "{{Percentage}}% refund",
      "REFUND_LOW_FULL": "{{Percentage}}% refund (Low)",
      "REFUND_AVG": "{{Percentage}}% refund",
      "REFUND_AVG_FULL": "{{Percentage}}% refund (Average)",
      "REFUND_HIGH": "{{Percentage}}% refund",
      "REFUND_HIGH_FULL": "{{Percentage}}% refund (High)"
    },
    "EidolonLevels": {
      "NONE": "None",
      "E0": "E0",
      "E1": "E1",
      "E2": "E2",
      "E3": "E3",
      "E4": "E4",
      "E5": "E5",
      "E6": "E6"
    },
    "SuperimpositionLevels": {
      "NONE": "None",
      "S1": "S1",
      "S2": "S2",
      "S3": "S3",
      "S4": "S4",
      "S5": "S5"
    },
    "IncomeOptions": {
      "Label": "[v{{versionNumber}} ({{phaseNumber}}/2) | {{type}}]: ",
      "Type": {
        "0": "None",
        "1": "F2P",
        "2": "Express",
        "3": "BP & Express"
      }
    },
    "PityCounter": {
      "PityCounter": "Pity counter",
      "CurrentEidolonSuperImp": "Current",
      "Guaranteed": "Guaranteed"
    },
    "TotalAvailable": "Total warps available:",
    "SectionTitles": {
      "Planner": "Warp Planner",
      "Results": "Results",
      "Settings": "Settings",
      "Character": "Character",
      "LightCone": "Light Cone",
      "Passes": "Passes",
      "Jades": "Jades",
      "Strategy": "Strategy",
      "Starlight": "Starlight",
      "Banner": "Banner",
      "New": "New",
      "Rerun": "Rerun",
      "AdditionalResources": "Additional resources",
      "Calculate": "Calculate"
    },
    "ColumnTitles": {
      "Goal": "Goal",
      "Chance": "Success chance with {{ticketCount}} <1/>",
      "Average": "Average # of <1/> required"
    },
    "TargetLabel": "$t(common:EidolonNShort, {\"eidolon\": {{eidolon}}}) $t(common:SuperimpositionNShort, {\"superimposition\": {{superimposition}}})"
  }
}

export default Resources;
