interface Resources {
  "changelogTab": {},
  "charactersTab": {
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
      "SwitchSuccess": "Successfully switched relics to $t(gameData:Characters.{{charid}}.Name)",
      "SortByScoreWarning": "Are you sure you want to sort all characters? <0/>You will lose any custom rankings you have set.",
      "SaveSuccess": "Successfully saved build: {{name}}",
      "UnequipWarning": "Are you sure you want to unequip $t(gameData:Characters.{{charid}}.Name)?",
      "DeleteWarning": "Are you sure you want to delete $t(gameData:Characters.{{charid}}.Name)?"
    },
    "CharacterPreview": {}
  },
  "common": {
    "Relic_one": "{{relic, capitalize}}",
    "Relic_other": "{{relics, capitalize}}",
    "RelicWithCount_one": "{{count}} {{relic, capitalize}}",
    "RelicWithCount_other": "{{count}} {{relics, capitalize}}",
    "Lightcone_one": "{{light cone, capitalize}}",
    "Lightcone_other": "{{light cones, capitalize}}",
    "LightconeWithCount_one": "{{count}} {{light cone, capitalize}}",
    "LightconeWithCount_other": "{{count}} {{light cones, capitalize}}",
    "Cancel": "{{cancel, capitalize}}",
    "Confirm": "{{confirm, capitalize}}",
    "Submit": "{{submit, capitalize}}",
    "Ok": "{{ok, capitalize}}",
    "Yes": "{{yes, capitalize}}",
    "No": "{{no, capitalize}}",
    "Save": "{{save, capitalize}}",
    "Score": "{{score, capitalize}}",
    "EidolonNShort": "E{{eidolon}}",
    "SuperimpositionNShort": "S{{superimposition}}",
    "CharacterWithCount_one": "{{count}} {{character, capitalize}}",
    "CharacterWithCount_other": "{{count}} {{characters, capitalize}}",
    "Character_one": "{{character, capitalize}}",
    "Character_other": "{{characters, capitalize}}",
    "VerifiedRelicHoverText": "Relic substats verified by relic scorer (speed decimals)",
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
    }
  },
  "gameData": {
    "Characters": {
      "1001": {
        "Name": "March 7th",
        "Abilities": {
          "100101": {
            "name": "Frigid Cold Arrow",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of March 7th's ATK to a single enemy."
          },
          "100102": {
            "name": "The Power of Cuteness",
            "desc": "<color=#f29e38ff>Applies a Shield</color> on a single ally.",
            "longdesc": "Provides a single ally with a Shield that can absorb DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of March 7th's DEF plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s).\\nIf the ally's current HP percentage is <unbreak>#3[i]%</unbreak> or higher, greatly increases the chance of enemies attacking that ally."
          },
          "100103": {
            "name": "Glacial Cascade",
            "desc": "Deals Ice DMG to <color=#f29e38ff>all enemies</color>, with <color=#f29e38ff>a chance of Freezing them</color>.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of March 7th's ATK to all enemies. Hit enemies have a <unbreak>#2[i]%</unbreak> <u>base chance</u> to be Frozen for <unbreak>#3[i]</unbreak> turn(s).\\nWhile Frozen, enemies cannot take action and will receive <u>Additional</u> Ice DMG equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of March 7th's ATK at the beginning of each turn."
          },
          "100104": {
            "name": "Girl Power",
            "desc": "After a Shielded ally is attacked by an enemy, March 7th <color=#f29e38ff>immediately launches a <u>Counter</u></color> against the attacker, dealing minor Ice DMG.",
            "longdesc": "After a Shielded ally is attacked by an enemy, March 7th immediately <u>Counters</u>, dealing Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of her ATK. This effect can be triggered <unbreak>#2[i]</unbreak> time(s) each turn."
          },
          "100106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100107": {
            "name": "Freezing Beauty",
            "desc": "Attacks the enemy. After entering battle, there is a high chance of inflicting Freeze on a random enemy.",
            "longdesc": "Immediately attacks the enemy. After entering battle, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to Freeze a random enemy for <unbreak>#2[i]</unbreak> turn(s).\\nWhile Frozen, the enemy cannot take action and will take <u>Additional</u> Ice DMG equal to <unbreak>#3[i]%</unbreak> of March 7th's ATK at the beginning of each turn."
          }
        },
        "Eidolons": {
          "100101": {
            "name": "Memory of You",
            "desc": "Every time March 7th's Ultimate Freezes a target, she regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "100102": {
            "name": "Memory of It",
            "desc": "Upon entering battle, grants a Shield equal to <unbreak>#1[i]%</unbreak> of March 7th's DEF plus <unbreak>#3[i]</unbreak> to the ally with the lowest HP percentage, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "100103": {
            "name": "Memory of Everything",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100104": {
            "name": "Never Forfeit Again",
            "desc": "The Talent's Counter effect can be triggered 1 more time in each turn. The DMG dealt by Counter increases by an amount that is equal to <unbreak>#1[i]%</unbreak> of March 7th's DEF."
          },
          "100105": {
            "name": "Never Forget Again",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100106": {
            "name": "Just Like This, Always...",
            "desc": "Allies under the protection of the Shield granted by the Skill restore HP equal to <unbreak>#1[i]%</unbreak> of their Max HP plus <unbreak>#2[i]</unbreak> at the beginning of each turn."
          }
        },
        "Effects": {
          "10010011": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 1001,
            "ID": 10010011
          },
          "10010012": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 1001,
            "ID": 10010012
          },
          "10010013": {
            "name": "Counter",
            "desc": "Remaining Counter attempt(s).",
            "source": 1001,
            "ID": 10010013
          }
        },
        "Traces": {
          "A2": {
            "name": "Purify",
            "desc": "When using the Skill, removes 1 debuff from a target ally.",
            "owner": 1001,
            "ID": 1001101,
            "Ascension": 2
          },
          "A4": {
            "name": "Reinforce",
            "desc": "The duration of the Shield generated from Skill is extended for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1001,
            "ID": 1001102,
            "Ascension": 4
          },
          "A6": {
            "name": "Ice Spell",
            "desc": "Increases the Ultimate's base chance to Freeze enemies by <unbreak>#1[i]%</unbreak>.",
            "owner": 1001,
            "ID": 1001103,
            "Ascension": 6
          }
        }
      },
      "1002": {
        "Name": "Dan Heng",
        "Abilities": {
          "100201": {
            "name": "Cloudlancer Art: North Wind",
            "desc": "Deals minor Wind DMG to a single enemy.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dan Heng's ATK to a single enemy."
          },
          "100202": {
            "name": "Cloudlancer Art: Torrent",
            "desc": "Deals Wind DMG to a single enemy. Upon a CRIT Hit, there is a high chance of Slowing the enemy.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dan Heng's ATK to a single enemy.\\nWhen DMG dealt by Skill triggers CRIT Hit, there is a <unbreak>#4[i]%</unbreak> <u>base chance</u> to reduce the target's SPD by <unbreak>#2[i]%</unbreak>, lasting for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "100203": {
            "name": "Ethereal Dream",
            "desc": "Deals massive Wind DMG to a single enemy. If the enemy is Slowed, DMG multiplier dealt will be increased.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dan Heng's ATK to a single target enemy. If the attacked enemy is Slowed, the multiplier for the DMG dealt by Ultimate increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>."
          },
          "100204": {
            "name": "Superiority of Reach",
            "desc": "When this unit becomes the target of an ally's ability, this unit's next attack's <color=#f29e38ff>Wind <u>RES PEN</u> increases</color>. This effect can be triggered again after 2 turns.",
            "longdesc": "When Dan Heng becomes the target of an ally's ability, his next attack's Wind <u>RES PEN</u> increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. This effect can be triggered again after <unbreak>#2[i]</unbreak> turn(s)."
          },
          "100206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100207": {
            "name": "Splitting Spearhead",
            "desc": "After they use their Technique, their ATK is increased at the start of the next battle.",
            "longdesc": "After Dan Heng uses his Technique, his ATK increases by <unbreak>#1[i]%</unbreak> at the start of the next battle for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "100201": {
            "name": "The Higher You Fly, the Harder You Fall",
            "desc": "When the target enemy's current HP percentage is greater than or equal to <unbreak>#1[i]%</unbreak>, CRIT Rate increases by <unbreak>#2[i]%</unbreak>."
          },
          "100202": {
            "name": "Quell the Venom Octet, Quench the Vice O'Flame",
            "desc": "Reduces Talent cooldown by 1 turn."
          },
          "100203": {
            "name": "Seen and Unseen",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100204": {
            "name": "Roaring Dragon and Soaring Sun",
            "desc": "When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again."
          },
          "100205": {
            "name": "A Drop of Rain Feeds a Torrent",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100206": {
            "name": "The Troubled Soul Lies in Wait",
            "desc": "The Slow state triggered by Skill reduces the enemy's SPD by an extra <unbreak>#1[i]%</unbreak>."
          }
        },
        "Effects": {
          "10010021": {
            "name": "Splitting Spearhead",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1002,
            "ID": 10010021
          },
          "10010022": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1002,
            "ID": 10010022
          },
          "10010023": {
            "name": "Slow",
            "desc": "SPD -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Slow",
            "source": 1002,
            "ID": 10010023
          },
          "10010024": {
            "name": "Superiority of Reach",
            "desc": "Wind RES PEN +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Wind RES PEN",
            "source": 1002,
            "ID": 10010024
          },
          "10010025": {
            "name": "Superiority of Reach",
            "desc": "The effect of Talent \"Superiority of Reach\" cannot be triggered.",
            "source": 1002,
            "ID": 10010025
          },
          "10010026": {
            "name": "Superiority of Reach",
            "desc": "The effect of Talent \"Superiority of Reach\" can now be triggered.",
            "source": 1002,
            "ID": 10010026
          },
          "10010027": {
            "name": "Hidden Dragon",
            "desc": "Lowers the chances of being attacked by enemies.",
            "effect": "Target Probability Reduction",
            "source": 1002,
            "ID": 10010027
          }
        },
        "Traces": {
          "A2": {
            "name": "Hidden Dragon",
            "desc": "When current HP percentage is <unbreak>#1[i]%</unbreak> or lower, reduces the chance of being attacked by enemies.",
            "owner": 1002,
            "ID": 1002101,
            "Ascension": 2
          },
          "A4": {
            "name": "Faster Than Light",
            "desc": "After launching an attack, there is a <unbreak>#1[i]%</unbreak> fixed chance to increase own SPD by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 1002,
            "ID": 1002102,
            "Ascension": 4
          },
          "A6": {
            "name": "High Gale",
            "desc": "Basic ATK deals <unbreak>#1[i]%</unbreak> more DMG to Slowed enemies.",
            "owner": 1002,
            "ID": 1002103,
            "Ascension": 6
          }
        }
      },
      "1003": {
        "Name": "Himeko",
        "Abilities": {
          "100301": {
            "name": "Sawblade Tuning",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Himeko's ATK to a single enemy."
          },
          "100302": {
            "name": "Molten Detonation",
            "desc": "Deals Fire DMG to a single enemy and minor Fire DMG to enemies adjacent to it.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Himeko's ATK to a single enemy and Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Himeko's ATK to enemies adjacent to it."
          },
          "100303": {
            "name": "Heavenly Flare",
            "desc": "Deals Fire DMG to all enemies and regenerates Energy if enemies are defeated.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Himeko's ATK to all enemies. Himeko regenerates <unbreak>#2[i]</unbreak> extra Energy for each enemy defeated."
          },
          "100304": {
            "name": "Victory Rush",
            "desc": "Gains Charge when an enemy's Weakness is Broken.\\nAfter an ally performs an attack, if fully Charged, <color=#f29e38ff>immediately performs a <u>follow-up attack</u></color> and deals Fire DMG to <color=#f29e38ff>all enemies</color>, consuming all Charge points.\\nGains 1 Charge point at the start of each battle.",
            "longdesc": "When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max <unbreak>#2[i]</unbreak> points).\\nIf Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 <u>follow-up attack</u> and deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of her ATK to all enemies, consuming all Charge points.\\nAt the start of the battle, Himeko gains 1 point of Charge."
          },
          "100306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100307": {
            "name": "Incomplete Combustion",
            "desc": "Creates a Special Dimension. After entering combat with enemies in the dimension, there is a high chance to <color=#f29e38ff>increase Fire DMG taken by enemies</color>.",
            "longdesc": "After using Technique, creates a Special Dimension that lasts for <unbreak>#4[i]</unbreak> second(s). After entering battle with enemies in the Special Dimension, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to increase Fire DMG taken by enemies by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s). Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "100301": {
            "name": "Childhood",
            "desc": "After \"Victory Rush\" is triggered, Himeko's SPD increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "100302": {
            "name": "Convergence",
            "desc": "Deals <unbreak>#2[i]%</unbreak> more DMG to enemies whose HP percentage is <unbreak>#1[i]%</unbreak> or less."
          },
          "100303": {
            "name": "Poised",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100304": {
            "name": "Dedication",
            "desc": "When Himeko's Skill inflicts Weakness Break on an enemy, she gains <unbreak>#1[i]</unbreak> extra point(s) of Charge."
          },
          "100305": {
            "name": "Aspiration",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100306": {
            "name": "Trailblaze!",
            "desc": "Ultimate deals DMG 2 extra times, each of which deals Fire DMG equal to <unbreak>#1[i]%</unbreak> of the original DMG to a random enemy."
          }
        },
        "Effects": {
          "10010031": {
            "name": "Victory Rush",
            "desc": "Talent \"Victory Rush\" cannot be triggered.",
            "source": 1003,
            "ID": 10010031
          },
          "10010032": {
            "name": "Fire Vulnerability",
            "desc": "Fire DMG taken +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Fire Vulnerability",
            "source": 1003,
            "ID": 10010032
          },
          "10010033": {
            "name": "Charge",
            "desc": "When fully charged, triggers Talent \"Victory Rush.\"",
            "source": 1003,
            "ID": 10010033
          },
          "10010034": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1003,
            "ID": 10010034
          },
          "10010035": {
            "name": "Benchmark",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1003,
            "ID": 10010035
          }
        },
        "Traces": {
          "A2": {
            "name": "Starfire",
            "desc": "After using an attack, there is a <unbreak>#1[i]%</unbreak> base chance to inflict Burn on enemies for <unbreak>#2[i]</unbreak> turn(s).\\nWhen afflicted with Burn, enemies take Fire DoT equal to <unbreak>#3[i]%</unbreak> of Himeko's ATK at the start of each turn.",
            "owner": 1003,
            "ID": 1003101,
            "Ascension": 2
          },
          "A4": {
            "name": "Magma",
            "desc": "Skill deals <unbreak>#1[i]%</unbreak> more DMG to enemies currently afflicted with Burn.",
            "owner": 1003,
            "ID": 1003102,
            "Ascension": 4
          },
          "A6": {
            "name": "Benchmark",
            "desc": "When current HP percentage is <unbreak>#1[i]%</unbreak> or higher, CRIT Rate increases by <unbreak>#2[i]%</unbreak>.",
            "owner": 1003,
            "ID": 1003103,
            "Ascension": 6
          }
        }
      },
      "1004": {
        "Name": "Welt",
        "Abilities": {
          "100401": {
            "name": "Gravity Suppression",
            "desc": "Deals minor Imaginary DMG to a single enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Welt's ATK to a single enemy."
          },
          "100402": {
            "name": "Edge of the Void",
            "desc": "Deals minor Imaginary DMG to a single enemy. This attack can Bounce 3 times, with a chance of <color=#f29e38ff>Slowing</color> the hit enemies.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Welt's ATK to a random enemy. On hit, there is a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> to reduce the enemy's SPD by <unbreak>#3[i]%</unbreak> for <unbreak>#4[i]</unbreak> turn(s)."
          },
          "100403": {
            "name": "Synthetic Black Hole",
            "desc": "Deals Imaginary DMG to all enemies, with <color=#f29e38ff>a high chance of Imprisoning them</color>.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Welt's ATK to all enemies, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> for enemies hit by this ability to be Imprisoned for 1 turn.\\nImprisoned enemies have their <u>actions delayed</u> by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> and SPD reduced by <unbreak>#4[i]%</unbreak>."
          },
          "100404": {
            "name": "Time Distortion",
            "desc": "When hitting a Slowed enemy, <color=#f29e38ff>additionally deals minor Imaginary <u>Additional DMG</u></color>.",
            "longdesc": "When hitting an enemy that is already Slowed, Welt deals <u>Additional</u> Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of his ATK to the enemy."
          },
          "100406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100407": {
            "name": "Gravitational Imprisonment",
            "desc": "Creates a Special Dimension. Enemies in this dimension have their movement speed reduced. After entering combat with enemies in the dimension, there is a <color=#f29e38ff>high chance for the enemies to become Imprisoned</color>.",
            "longdesc": "After using Welt's Technique, create a Special Dimension that lasts for <unbreak>#4[i]</unbreak> second(s). Enemies in this Special Dimension have their movement speed reduced by <unbreak>#5[i]%</unbreak>. After entering battle with enemies in the Special Dimension, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to Imprison the enemies for 1 turn.\\nImprisoned enemies have their <u>actions delayed</u> by <unbreak>#2[i]%</unbreak> and SPD reduced by <unbreak>#3[i]%</unbreak>. Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "100401": {
            "name": "Legacy of Honor",
            "desc": "After using Ultimate, Welt gets enhanced. Then, the next <unbreak>#3[i]</unbreak> time(s) he uses Basic ATK or Skill, deals 1 extra instance of Additional DMG to the target enemy. The Additional DMG dealt when using Basic ATK is equal to <unbreak>#1[i]%</unbreak> of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to <unbreak>#2[i]%</unbreak> of Skill DMG multiplier."
          },
          "100402": {
            "name": "Conflux of Stars",
            "desc": "When his Talent is triggered, Welt regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "100403": {
            "name": "Prayer of Peace",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100404": {
            "name": "Appellation of Justice",
            "desc": "Base chance for Skill to inflict SPD Reduction increases by <unbreak>#1[i]%</unbreak>."
          },
          "100405": {
            "name": "Power of Kindness",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100406": {
            "name": "Prospect of Glory",
            "desc": "When using Skill, deals DMG for 1 extra time to a random enemy."
          }
        },
        "Effects": {
          "10010041": {
            "name": "Slow",
            "desc": "SPD -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Slow",
            "source": 1004,
            "ID": 10010041
          },
          "10010042": {
            "name": "Legacy of Honor",
            "desc": "Basic ATKs and Skills deal an extra hit.",
            "source": 1004,
            "ID": 10010042
          },
          "10010043": {
            "name": "Vulnerability",
            "desc": "Increases DMG taken by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Vulnerability",
            "source": 1004,
            "ID": 10010043
          }
        },
        "Traces": {
          "A2": {
            "name": "Retribution",
            "desc": "When using Ultimate, there is a <unbreak>#1[i]%</unbreak> base chance to increase the DMG received by the targets by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 1004,
            "ID": 1004101,
            "Ascension": 2
          },
          "A4": {
            "name": "Judgment",
            "desc": "Using Ultimate additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1004,
            "ID": 1004102,
            "Ascension": 4
          },
          "A6": {
            "name": "Punishment",
            "desc": "Deals <unbreak>#1[i]%</unbreak> more DMG to enemies inflicted with Weakness Break.",
            "owner": 1004,
            "ID": 1004103,
            "Ascension": 6
          }
        }
      },
      "1005": {
        "Name": "Kafka",
        "Abilities": {
          "100501": {
            "name": "Midnight Tumult",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Kafka's ATK to a single enemy."
          },
          "100502": {
            "name": "Caressing Moonlight",
            "desc": "Deals Lightning DMG to a single enemy and minor Lightning DMG to adjacent targets.\\nIf the primary target is currently afflicted with a DoT effect, the DoT <color=#f29e38ff>deals DMG 1 extra time</color>.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Kafka's ATK to a target enemy and Lightning DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Kafka's ATK to enemies adjacent to it.\\nIf the target enemy is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of their original DMG."
          },
          "100503": {
            "name": "Twilight Trill",
            "desc": "Deals minor Lightning DMG to all enemies, with a high chance of <color=#f29e38ff>Shocking them</color>.\\nIf the enemies are currently Shocked, the Shock status <color=#f29e38ff>deals DMG 1 extra time</color>.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Kafka's ATK to all enemies, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> for enemies hit to become Shocked and immediately take DMG from their current Shock state, equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of its original DMG. Shock lasts for <unbreak>#3[i]</unbreak> turn(s).\\nWhile Shocked, enemies receive Lightning DoT equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Kafka's ATK at the beginning of each turn."
          },
          "100504": {
            "name": "Gentle but Cruel",
            "desc": "After an ally uses Basic ATK on an enemy, Kafka immediately launches a <u>follow-up attack</u> and deals Lightning DMG with a high chance of <color=#f29e38ff>inflicting Shock</color> to that target. This effect can only be triggered 1 time per turn.",
            "longdesc": "After an ally of Kafka's uses Basic ATK on an enemy target, Kafka immediately launches 1 <u>follow-up attack</u> and deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of her ATK to that target, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to inflict Shock equivalent to that applied by her Ultimate to the attacked enemy target, lasting for <unbreak>#3[i]</unbreak> turns. This effect can only be triggered 1 time per turn."
          },
          "100506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100507": {
            "name": "Mercy Is Not Forgiveness",
            "desc": "Attacks all enemies within range. After entering battle, deals minor Lightning DMG to all enemies, with a high chance to <color=#f29e38ff>Shock</color> them.",
            "longdesc": "Immediately attacks all enemies within a set range. After entering battle, deals Lightning DMG equal to <unbreak>#3[i]%</unbreak> of Kafka's ATK to all enemies, with a <unbreak>#1[i]%</unbreak> <u>base chance</u> to inflict Shock equivalent to that applied by her Ultimate on every enemy target for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "100501": {
            "name": "Da Capo",
            "desc": "When the Talent triggers a follow-up attack, there is a <unbreak>#1[i]%</unbreak> base chance to increase the DoT received by the target by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "100502": {
            "name": "Fortississimo",
            "desc": "While Kafka is on the field, DoT dealt by all allies increases by <unbreak>#1[i]%</unbreak>."
          },
          "100503": {
            "name": "Capriccio",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100504": {
            "name": "Recitativo",
            "desc": "When an enemy target takes DMG from the Shock status inflicted by Kafka, Kafka additionally regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "100505": {
            "name": "Doloroso",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100506": {
            "name": "Leggiero",
            "desc": "The Shock inflicted on the enemy target by the Ultimate, the Technique, or the Talent-triggered follow-up attack has a DMG multiplier increase of <unbreak>#1[i]%</unbreak> and lasts <unbreak>#2[i]</unbreak> turn(s) longer."
          }
        },
        "Effects": {
          "10010051": {
            "name": "Gentle but Cruel",
            "desc": "The effect of Talent \"Gentle but Cruel\" can now be triggered.",
            "source": 1005,
            "ID": 10010051
          },
          "10010052": {
            "name": "Gentle but Cruel",
            "desc": "The effect of Talent \"Gentle but Cruel\" cannot be triggered.",
            "source": 1005,
            "ID": 10010052
          },
          "10010053": {
            "name": "DoT Vulnerability",
            "desc": "DoT taken +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DoT Vulnerability",
            "source": 1005,
            "ID": 10010053
          },
          "10010054": {
            "name": "DoT Vulnerability",
            "desc": "Each stack increases DoT taken by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to 2 stacks.",
            "effect": "DoT Vulnerability",
            "source": 1005,
            "ID": 10010054
          },
          "10010055": {
            "name": "Fortississimo",
            "desc": "Increases DoT dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1005,
            "ID": 10010055
          }
        },
        "Traces": {
          "A2": {
            "name": "Torture",
            "desc": "When the Ultimate is used, enemy targets will now receive DMG immediately from all currently applied DoT sources instead of just receiving DMG immediately from the currently applied Shock state.",
            "owner": 1005,
            "ID": 1005101,
            "Ascension": 2
          },
          "A4": {
            "name": "Plunder",
            "desc": "If an enemy is defeated while Shocked, Kafka additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1005,
            "ID": 1005102,
            "Ascension": 4
          },
          "A6": {
            "name": "Thorns",
            "desc": "The base chance for target enemies to get Shocked by the Ultimate, the Technique, or the Talent-triggered follow-up attack increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1005,
            "ID": 1005103,
            "Ascension": 6
          }
        }
      },
      "1006": {
        "Name": "Silver Wolf",
        "Abilities": {
          "100601": {
            "name": "System Warning",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Silver Wolf's ATK to a single enemy."
          },
          "100602": {
            "name": "Allow Changes?",
            "desc": "There is a high chance to <color=#f29e38ff>apply additional Type Weaknesses</color> to a single enemy and deals Quantum DMG to this target enemy.",
            "longdesc": "There is a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by <unbreak>#4[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.\\nEach enemy can only have 1 Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.\\nIn addition, there is a <unbreak>#5[i]%</unbreak> <u>base chance</u> to further reduce the All-Type RES of the enemy by <color=#f29e38ff><unbreak>#6[f1]%</unbreak></color> for <unbreak>#7[i]</unbreak> turn(s).\\nDeals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Silver Wolf's ATK to this enemy."
          },
          "100603": {
            "name": "User Banned",
            "desc": "There is a high chance of <color=#f29e38ff>lowering a single enemy's DEF</color> and deals massive Quantum DMG to this target enemy.",
            "longdesc": "There's a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> to decrease the target enemy's DEF by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> for <unbreak>#4[i]</unbreak> turn(s). And at the same time, deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Silver Wolf's ATK to the target enemy."
          },
          "100604": {
            "name": "Awaiting System Response...",
            "desc": "After this unit attacks, there is a chance of implanting the attacked enemy with 1 random <color=#f29e38ff>Bug</color>.",
            "longdesc": "Silver Wolf can create three types of Bugs: Reduce ATK by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, reduce DEF by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>, and reduce SPD by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color>.\\nEvery time Silver Wolf attacks, she has a <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> <u>base chance</u> to implant a random Bug that lasts for <unbreak>#5[i]</unbreak> turn(s) in an enemy target."
          },
          "100606": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100607": {
            "name": "Force Quit Program",
            "desc": "Attacks the enemy. After entering battle, deals minor DMG to all enemies and reduces Toughness of all enemies irrespective of Weakness Types.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals Quantum DMG equal to <unbreak>#1[i]%</unbreak> of Silver Wolf's ATK to all enemies, and ignores Weakness Types and reduces Toughness from all enemies. Enemies with their Weakness Broken in this way will trigger the Quantum Weakness Break effect."
          }
        },
        "Eidolons": {
          "100601": {
            "name": "Social Engineering",
            "desc": "After using her Ultimate to attack enemies, Silver Wolf regenerates <unbreak>#1[i]</unbreak> Energy for every debuff that the target enemy currently has. This effect can be triggered up to <unbreak>#2[i]</unbreak> time(s) in each use of her Ultimate."
          },
          "100602": {
            "name": "Zombie Network",
            "desc": "When an enemy enters battle, reduces their Effect RES by <unbreak>#1[i]%</unbreak>."
          },
          "100603": {
            "name": "Payload",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100604": {
            "name": "Bounce Attack",
            "desc": "After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to <unbreak>#1[i]%</unbreak> of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of <unbreak>#2[i]</unbreak> time(s) during each use of her Ultimate."
          },
          "100605": {
            "name": "Brute Force Attack",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100606": {
            "name": "Overlay Network",
            "desc": "For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by <unbreak>#1[i]%</unbreak>, up to a limit of <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10010061": {
            "name": "Type-1 Bug",
            "desc": "ATK -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "ATK Reduction",
            "source": 1006,
            "ID": 10010061
          },
          "10010062": {
            "name": "Type-2 Bug",
            "desc": "DEF -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1006,
            "ID": 10010062
          },
          "10010063": {
            "name": "Type-3 Bug",
            "desc": "SPD -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "Slow",
            "source": 1006,
            "ID": 10010063
          },
          "10010064": {
            "name": "Extra Weakness",
            "desc": "Extra Weakness implanted. Corresponding RES is lowered by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Implant a Weakness",
            "source": 1006,
            "ID": 10010064
          },
          "10010065": {
            "name": "Extra Weakness",
            "desc": "Extra Weakness implanted. Corresponding RES is lowered by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Implant a Weakness",
            "source": 1006,
            "ID": 10010065
          },
          "10010066": {
            "name": "All-Type RES Reduction",
            "desc": "All-Type DMG RES -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "All-Type RES Reduction",
            "source": 1006,
            "ID": 10010066
          },
          "10010067": {
            "name": "Effect RES Reduction",
            "desc": "Effect RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Reduction",
            "source": 1006,
            "ID": 10010067
          },
          "10010068": {
            "name": "DEF Reduction",
            "desc": "DEF -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1006,
            "ID": 10010068
          },
          "10010069": {
            "name": "Extra Fire Weakness",
            "desc": "Extra Fire Weakness implanted. Fire RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1006,
            "ID": 10010069
          }
        },
        "Traces": {
          "A2": {
            "name": "Generate",
            "desc": "Bug's duration is extended for <unbreak>#1[i]</unbreak> turn(s). Every time an enemy is inflicted with Weakness Break, Silver Wolf has a <unbreak>#2[i]%</unbreak> base chance of implanting a random Bug in the enemy.",
            "owner": 1006,
            "ID": 1006101,
            "Ascension": 2
          },
          "A4": {
            "name": "Inject",
            "desc": "The duration of the Weakness implanted by Silver Wolf's Skill increases by <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1006,
            "ID": 1006102,
            "Ascension": 4
          },
          "A6": {
            "name": "Side Note",
            "desc": "If there are <unbreak>#1[i]</unbreak> or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional <unbreak>#2[i]%</unbreak>.",
            "owner": 1006,
            "ID": 1006103,
            "Ascension": 6
          }
        }
      },
      "1008": {
        "Name": "Arlan",
        "Abilities": {
          "100801": {
            "name": "Lightning Rush",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Arlan's ATK to a single enemy."
          },
          "100802": {
            "name": "Shackle Breaker",
            "desc": "Consumes a portion of HP to deal Lightning DMG to a single enemy.",
            "longdesc": "Consumes Arlan's HP equal to <unbreak>#1[i]%</unbreak> of his Max HP to deal Lightning DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to 1 after using his Skill."
          },
          "100803": {
            "name": "Frenzied Punishment",
            "desc": "Deals massive Lightning DMG to a single enemy and Lightning DMG to enemies adjacent to it.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Arlan's ATK to a single enemy and Lightning DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Arlan's ATK to enemies adjacent to it."
          },
          "100804": {
            "name": "Pain and Anger",
            "desc": "Gain DMG bonus <color=#f29e38ff>based on</color> <color=#f29e38ff>currently missing HP percentage</color>.",
            "longdesc": "Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> DMG dealt by Arlan."
          },
          "100806": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100807": {
            "name": "Swift Harvest",
            "desc": "Attacks the enemy. After entering battle, deals minor Lightning DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to <unbreak>#1[i]%</unbreak> of Arlan's ATK to all enemies."
          }
        },
        "Eidolons": {
          "100801": {
            "name": "To the Bitter End",
            "desc": "When HP percentage is lower than or equal to <unbreak>50%</unbreak> of Max HP, increases DMG dealt by Skill by <unbreak>#1[i]%</unbreak>."
          },
          "100802": {
            "name": "Breaking Free",
            "desc": "Using Skill or Ultimate removes 1 debuff from oneself."
          },
          "100803": {
            "name": "Power Through",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100804": {
            "name": "Turn the Tables",
            "desc": "When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to <unbreak>#1[i]%</unbreak> of his Max HP. This effect is automatically removed after it is triggered once or after <unbreak>#2[i]</unbreak> turn(s) have elapsed."
          },
          "100805": {
            "name": "Hammer and Tongs",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100806": {
            "name": "Self-Sacrifice",
            "desc": "When the current HP percentage drops to <unbreak>50%</unbreak> or below, Ultimate deals <unbreak>#1[i]%</unbreak> more DMG, and the DMG multiplier for adjacent targets is raised to the same level as that for the primary target."
          }
        },
        "Effects": {
          "10010081": {
            "name": "Pain and Anger",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1008,
            "ID": 10010081
          },
          "10010082": {
            "name": "Turn the Tables",
            "desc": "When struck with a killing blow, instead of becoming downed, the character immediately restores HP equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Max HP.",
            "source": 1008,
            "ID": 10010082
          },
          "10010083": {
            "name": "Repel",
            "desc": "Nullifies all DMG received except for DoT until after being attacked.",
            "effect": "Barrier",
            "source": 1008,
            "ID": 10010083
          }
        },
        "Traces": {
          "A2": {
            "name": "Revival",
            "desc": "If the current HP percentage is <unbreak>#1[i]%</unbreak> or lower when defeating an enemy, immediately restores HP equal to <unbreak>#2[i]%</unbreak> of Max HP.",
            "owner": 1008,
            "ID": 1008101,
            "Ascension": 2
          },
          "A4": {
            "name": "Endurance",
            "desc": "The chance to resist DoT Debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1008,
            "ID": 1008102,
            "Ascension": 4
          },
          "A6": {
            "name": "Repel",
            "desc": "Upon entering battle, if Arlan's HP percentage is less than or equal to <unbreak>#1[i]%</unbreak>, he can nullify all DMG received except for DoTs until he is attacked.",
            "owner": 1008,
            "ID": 1008103,
            "Ascension": 6
          }
        }
      },
      "1009": {
        "Name": "Asta",
        "Abilities": {
          "100901": {
            "name": "Spectrum Beam",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Asta's ATK to a single enemy."
          },
          "100902": {
            "name": "Meteor Storm",
            "desc": "Deals minor Fire DMG to single enemy targets with 5 Bounces in total.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Asta's ATK to a single enemy and further deals DMG for 4 extra times, with each time dealing Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Asta's ATK to a random enemy."
          },
          "100903": {
            "name": "Astral Blessing",
            "desc": "<color=#f29e38ff>Increases SPD</color> for all allies.",
            "longdesc": "Increases SPD of all allies by <color=#f29e38ff><unbreak>#1[i]</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "100904": {
            "name": "Astrometry",
            "desc": "The character will receive 1 stack of Charging for every different enemy they hit, for a maximum of 5 stacks. Every stack of Charging increases ATK for all allies. At the beginning of their turn, reduce Charging stacks.",
            "longdesc": "Gains 1 stack of Charging for every different enemy hit by Asta plus an extra stack if the enemy hit has Fire Weakness.\\nFor every stack of Charging Asta has, all allies' ATK increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to <unbreak>#2[i]</unbreak> time(s).\\nStarting from her second turn, Asta's Charging stack count is reduced by <unbreak>#3[i]</unbreak> at the beginning of every turn."
          },
          "100906": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "100907": {
            "name": "Miracle Flash",
            "desc": "Attacks the enemy. After entering battle, deals minor DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals Fire DMG equal to <unbreak>#1[i]%</unbreak> of Asta's ATK to all enemies."
          }
        },
        "Eidolons": {
          "100901": {
            "name": "Star Sings Sans Verses or Vocals",
            "desc": "When using Skill, deals DMG for 1 extra time to a random enemy."
          },
          "100902": {
            "name": "Moon Speaks in Wax and Wane",
            "desc": "After using her Ultimate, Asta's Charging stacks will not be reduced in the next turn."
          },
          "100903": {
            "name": "Meteor Showers for Wish and Want",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "100904": {
            "name": "Aurora Basks in Beauty and Bliss",
            "desc": "Asta's Energy Regeneration Rate increases by <unbreak>#2[i]%</unbreak> when she has <unbreak>#1[i]</unbreak> or more Charging stacks."
          },
          "100905": {
            "name": "Nebula Secludes in Runes and Riddles",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "100906": {
            "name": "Cosmos Dreams in Calm and Comfort",
            "desc": "Charging stack(s) lost in each turn is reduced by <unbreak>#1[i]</unbreak>."
          }
        },
        "Effects": {
          "10010091": {
            "name": "Charging",
            "desc": "Each stack increases ATK by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to 5 stacks.",
            "effect": "ATK Boost",
            "source": 1009,
            "ID": 10010091
          },
          "10010092": {
            "name": "Charging",
            "desc": "Each stack increases ATK by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to 5 stacks.",
            "effect": "ATK Boost",
            "source": 1009,
            "ID": 10010092
          },
          "10010093": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1009,
            "ID": 10010093
          },
          "10010094": {
            "name": "Energy Regeneration Rate Boost",
            "desc": "Energy Regeneration Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Energy Regeneration Rate Boost",
            "source": 1009,
            "ID": 10010094
          }
        },
        "Traces": {
          "A2": {
            "name": "Sparks",
            "desc": "Asta's Basic ATK has a <unbreak>#1[i]%</unbreak> base chance to Burn an enemy target for <unbreak>#2[i]</unbreak> turn(s).\\nBurned enemies take Fire DoT equal to <unbreak>#3[i]%</unbreak> of DMG dealt by Asta's Basic ATK at the start of each turn.",
            "owner": 1009,
            "ID": 1009101,
            "Ascension": 2
          },
          "A4": {
            "name": "Ignite",
            "desc": "When Asta is on the field, all allies' Fire DMG increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1009,
            "ID": 1009102,
            "Ascension": 4
          },
          "A6": {
            "name": "Constellation",
            "desc": "Asta's DEF increases by <unbreak>#1[i]%</unbreak> for every current Charging stack she possesses.",
            "owner": 1009,
            "ID": 1009103,
            "Ascension": 6
          }
        }
      },
      "1013": {
        "Name": "Herta",
        "Abilities": {
          "101301": {
            "name": "What Are You Looking At?",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Herta's ATK to a single enemy."
          },
          "101302": {
            "name": "One-Time Offer",
            "desc": "Deals minor Ice DMG to all enemies. Targets with higher HP will receive increased DMG.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Herta's ATK to all enemies. If the enemy's HP percentage is <unbreak>#2[i]%</unbreak> or higher, DMG dealt to this target increases by <unbreak>#3[i]%</unbreak>."
          },
          "101303": {
            "name": "It's Magic, I Added Some Magic",
            "desc": "Deals Ice DMG to all enemies.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Herta's ATK to all enemies."
          },
          "101304": {
            "name": "Fine, I'll Do It Myself",
            "longdesc": "When an ally's attack causes an enemy's HP percentage to fall to <unbreak>#1[i]%</unbreak> or lower, Herta will launch a <u>follow-up attack</u>, dealing Ice DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Herta's ATK to all enemies."
          },
          "101306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "101307": {
            "name": "It Can Still Be Optimized",
            "longdesc": "After using her Technique, Herta's ATK increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s) at the beginning of the next battle."
          }
        },
        "Eidolons": {
          "101301": {
            "name": "Kick You When You're Down",
            "desc": "If the enemy's HP percentage is at <unbreak>#1[i]%</unbreak> or less, Herta's Basic ATK deals Additional Ice DMG equal to <unbreak>#2[i]%</unbreak> of Herta's ATK."
          },
          "101302": {
            "name": "Keep the Ball Rolling",
            "desc": "Every time Talent is triggered, this character's CRIT Rate increases by <unbreak>#1[i]%</unbreak>. This effect can stack up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "101303": {
            "name": "That's the Kind of Girl I Am",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "101304": {
            "name": "Hit Where It Hurts",
            "desc": "When Talent is triggered, DMG increases by <unbreak>#1[i]%</unbreak>."
          },
          "101305": {
            "name": "Cuss Big or Cuss Nothing",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "101306": {
            "name": "No One Can Betray Me",
            "desc": "After using Ultimate, this character's ATK increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Effects": {
          "10010131": {
            "name": "It Can Still Be Optimized",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1013,
            "ID": 10010131
          },
          "10010132": {
            "name": "CRIT Rate Boost",
            "desc": "Each stack increases CRIT rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to 5 stacks.",
            "effect": "CRIT Rate Boost",
            "source": 1013,
            "ID": 10010132
          },
          "10010133": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1013,
            "ID": 10010133
          }
        },
        "Traces": {
          "A2": {
            "name": "Efficiency",
            "desc": "When Skill is used, the DMG Boost effect on target enemies increases by an extra <unbreak>#1[i]%</unbreak>.",
            "owner": 1013,
            "ID": 1013101,
            "Ascension": 2
          },
          "A4": {
            "name": "Puppet",
            "desc": "The chance to resist Crowd Control Debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1013,
            "ID": 1013102,
            "Ascension": 4
          },
          "A6": {
            "name": "Icing",
            "desc": "When Ultimate is used, deals <unbreak>#1[i]%</unbreak> more DMG to Frozen enemies.",
            "owner": 1013,
            "ID": 1013103,
            "Ascension": 6
          }
        }
      },
      "1101": {
        "Name": "Bronya",
        "Abilities": {
          "110101": {
            "name": "Windrider Bullet",
            "desc": "Deals minor Wind DMG to a single enemy.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Bronya's ATK to a single enemy."
          },
          "110102": {
            "name": "Combat Redeployment",
            "desc": "<color=#f29e38ff>Dispels</color> 1 <color=#f29e38ff><u>debuff</u></color> from a single ally, <color=#f29e38ff>increases the damage they deal</color>, and allows them to <color=#f29e38ff>immediately take action</color>.",
            "longdesc": "Dispels a <u>debuff</u> from a single ally, allows them to immediately take action, and increases their DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> for <unbreak>#3[i]</unbreak> turn(s).\\nWhen this Skill is used on Bronya herself, she cannot immediately take action again."
          },
          "110103": {
            "name": "The Belobog March",
            "desc": "Increases <color=#f29e38ff>ATK</color> and <color=#f29e38ff>CRIT DMG</color> of all allies.",
            "longdesc": "Increases the ATK of all allies by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, and increases their CRIT DMG equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Bronya's CRIT DMG plus <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> for <unbreak>#4[i]</unbreak> turn(s)."
          },
          "110104": {
            "name": "Leading the Way",
            "desc": "After this character uses Basic ATK, their next action will be <u>Advanced Forward</u>.",
            "longdesc": "After using her Basic ATK, Bronya's next action will be <u>Advanced Forward</u> by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>."
          },
          "110106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110107": {
            "name": "Banner of Command",
            "desc": "After this character uses Technique, increases all allies' ATK at the start of the next battle.",
            "longdesc": "After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "110101": {
            "name": "Hone Your Strength",
            "desc": "When using Skill, there is a <unbreak>#1[i]%</unbreak> fixed chance of recovering 1 Skill Point. This effect has a 1-turn cooldown."
          },
          "110102": {
            "name": "Quick March",
            "desc": "When using Skill, the target ally's SPD increases by <unbreak>#1[i]%</unbreak> after taking action, lasting for 1 turn."
          },
          "110103": {
            "name": "Bombardment",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110104": {
            "name": "Take by Surprise",
            "desc": "After any other allied character uses Basic ATK on an enemy target that has Wind Weakness, Bronya immediately launches 1 instance of follow-up attack, dealing Wind DMG to this target by an amount equal to <unbreak>#1[i]%</unbreak> of Basic ATK DMG. This effect can only trigger once per turn."
          },
          "110105": {
            "name": "Unstoppable",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110106": {
            "name": "Piercing Rainbow",
            "desc": "The duration of the DMG Boost effect placed by the Skill on the target ally increases by <unbreak>#1[i]</unbreak> turn(s)."
          }
        },
        "Effects": {
          "10011011": {
            "name": "The Belobog March",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and CRIT DMG +<color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "ATK and CRIT DMG Boost",
            "source": 1101,
            "ID": 10011011
          },
          "10011012": {
            "name": "DMG Boost",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1101,
            "ID": 10011012
          },
          "10011013": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1101,
            "ID": 10011013
          },
          "10011014": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1101,
            "ID": 10011014
          },
          "10011015": {
            "name": "Hone Your Strength",
            "desc": "Hone Your Strength effect cannot be triggered.",
            "source": 1101,
            "ID": 10011015
          },
          "10011016": {
            "name": "Battlefield",
            "desc": "DEF increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>",
            "source": 1101,
            "ID": 10011016
          }
        },
        "Traces": {
          "A2": {
            "name": "Command",
            "desc": "The CRIT Rate for Basic ATK increases to <unbreak>100%</unbreak>.",
            "owner": 1101,
            "ID": 1101101,
            "Ascension": 2
          },
          "A4": {
            "name": "Battlefield",
            "desc": "At the start of the battle, all allies' DEF increases by <unbreak>#2[i]%</unbreak> for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1101,
            "ID": 1101102,
            "Ascension": 4
          },
          "A6": {
            "name": "Military Might",
            "desc": "When Bronya is on the field, all allies deal <unbreak>#1[i]%</unbreak> more DMG.",
            "owner": 1101,
            "ID": 1101103,
            "Ascension": 6
          }
        }
      },
      "1102": {
        "Name": "Seele",
        "Abilities": {
          "110201": {
            "name": "Thwack",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Seele's ATK to a single enemy."
          },
          "110202": {
            "name": "Sheathed Blade",
            "desc": "Deals Quantum DMG to a single enemy and increases SPD.",
            "longdesc": "Increases Seele's SPD by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s) and deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Seele's ATK to a single enemy."
          },
          "110203": {
            "name": "Butterfly Flurry",
            "desc": "Enters the <color=#f29e38ff>Amplification state</color> and deals massive Quantum DMG to a single enemy.",
            "longdesc": "Seele enters the Amplification state and deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of her ATK to a single enemy."
          },
          "110204": {
            "name": "Resurgence",
            "desc": "When <color=#f29e38ff>defeating enemy targets</color> with Basic ATK, Skill, or Ultimate, gains an <color=#f29e38ff><u>extra turn</u> and enters the Amplification state</color>. While in Amplification, increases the DMG dealt by this unit.",
            "longdesc": "Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an <u>extra turn</u>. While in the Amplification state, the DMG of Seele's attacks increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s).\\nEnemies defeated in the <u>extra turn</u> provided by \"Resurgence\" will not trigger another \"Resurgence.\""
          },
          "110206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110207": {
            "name": "Phantom Illusion",
            "desc": "Enter <color=#f29e38ff>Stealth</color> mode. After attacking an enemy and entering battle, enters the <color=#f29e38ff>Amplification state</color>.",
            "longdesc": "After using her Technique, Seele gains Stealth for <unbreak>#1[i]</unbreak> second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the Amplification state."
          }
        },
        "Eidolons": {
          "110201": {
            "name": "Extirpating Slash",
            "desc": "When dealing DMG to an enemy whose HP percentage is <unbreak>#1[i]%</unbreak> or lower, CRIT Rate increases by <unbreak>#2[i]%</unbreak>."
          },
          "110202": {
            "name": "Dancing Butterfly",
            "desc": "The SPD Boost effect of Seele's Skill can stack up to <unbreak>#1[i]</unbreak> time(s)."
          },
          "110203": {
            "name": "Dazzling Tumult",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110204": {
            "name": "Flitting Phantasm",
            "desc": "Seele regenerates <unbreak>#1[i]</unbreak> Energy when she defeats an enemy."
          },
          "110205": {
            "name": "Piercing Shards",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110206": {
            "name": "Shattering Shambles",
            "desc": "After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for <unbreak>#2[i]</unbreak> turn(s). Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to <unbreak>#1[i]%</unbreak> of Seele's Ultimate DMG every time they are attacked. If the target enemy is defeated by the Butterfly Flurry DMG triggered by other allies' attacks, Seele's Talent will not be triggered.\\nWhen Seele is knocked down, the Butterfly Flurry inflicted on the enemies will be removed."
          }
        },
        "Effects": {
          "10011021": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1102,
            "ID": 10011021
          },
          "10011022": {
            "name": "Amplification",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1102,
            "ID": 10011022
          },
          "10011023": {
            "name": "SPD Boost",
            "desc": "Each stack increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to 2 stacks.",
            "effect": "SPD Boost",
            "source": 1102,
            "ID": 10011023
          },
          "10011024": {
            "name": "Butterfly Flurry",
            "desc": "On a hit, receives an extra Quantum DMG from Seele.",
            "effect": "Butterfly Flurry",
            "source": 1102,
            "ID": 10011024
          },
          "10011025": {
            "name": "Resurgence",
            "desc": "Currently in the extra turn provided by \"Resurgence\".",
            "source": 1102,
            "ID": 10011025
          },
          "10011026": {
            "name": "Nightshade",
            "desc": "Lowers the chances of being attacked by enemies.",
            "effect": "Target Probability Reduction",
            "source": 1102,
            "ID": 10011026
          }
        },
        "Traces": {
          "A2": {
            "name": "Nightshade",
            "desc": "When current HP percentage is <unbreak>#1[i]%</unbreak> or lower, reduces the chance of being attacked by enemies.",
            "owner": 1102,
            "ID": 1102101,
            "Ascension": 2
          },
          "A4": {
            "name": "Lacerate",
            "desc": "While Seele is in the Amplification state, her Quantum RES PEN increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1102,
            "ID": 1102102,
            "Ascension": 4
          },
          "A6": {
            "name": "Rippling Waves",
            "desc": "After using a Basic ATK, Seele's next action will be Advanced Forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1102,
            "ID": 1102103,
            "Ascension": 6
          }
        }
      },
      "1103": {
        "Name": "Serval",
        "Abilities": {
          "110301": {
            "name": "Roaring Thunderclap",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Serval's ATK to a single enemy."
          },
          "110302": {
            "name": "Lightning Flash",
            "desc": "Deals minor Lightning DMG to a single enemy and any adjacent targets, with a high chance of causing <color=#f29e38ff>Shock</color>.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Serval's ATK to a single enemy and Lightning DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Serval's ATK to enemies adjacent to it, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> for enemies hit to become Shocked for <unbreak>#4[i]</unbreak> turn(s).\\nWhile Shocked, enemies take Lightning DoT equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of Serval's ATK at the beginning of each turn."
          },
          "110303": {
            "name": "Here Comes the Mechanical Fever",
            "desc": "Deals Lightning DMG to all enemies and increases the duration of Shock.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Serval's ATK to all enemies. Enemies already Shocked will extend the duration of their Shock state by <unbreak>#2[i]</unbreak> turn(s)."
          },
          "110304": {
            "name": "Galvanic Chords",
            "desc": "After attacking, deals <color=#f29e38ff>a minor amount of <u>Additional DMG</u></color> to all Shocked enemies.",
            "longdesc": "After Serval attacks, deals <u>Additional</u> Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Serval's ATK to all Shocked enemies."
          },
          "110306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110307": {
            "name": "Good Night, Belobog",
            "desc": "Attacks the enemy. After entering battle, deals minor Lightning DMG to a random single enemy, with a high chance to <color=#f29e38ff>Shock</color> all enemy targets.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to <unbreak>#4[i]%</unbreak> of Serval's ATK to a random enemy, with a <unbreak>#1[i]%</unbreak> <u>base chance</u> for all enemies to become Shocked for <unbreak>#3[i]</unbreak> turn(s).\\nWhile Shocked, enemies will take Lightning DoT equal to <unbreak>#2[i]%</unbreak> of Serval's ATK at the beginning of each turn."
          }
        },
        "Eidolons": {
          "110301": {
            "name": "Echo Chamber",
            "desc": "Basic ATK deals Lightning DMG equal to <unbreak>#1[i]%</unbreak> of Basic ATK DMG to a random target adjacent to the target enemy."
          },
          "110302": {
            "name": "Encore!",
            "desc": "Every time Serval's Talent is triggered to deal Additional DMG, she regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "110303": {
            "name": "Listen, the Heartbeat of the Gears",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110304": {
            "name": "Make Some Noise!",
            "desc": "Ultimate has a <unbreak>#1[i]%</unbreak> base chance to apply Shock to any enemies not currently Shocked. This Shock has the same effects as the one applied by Skill."
          },
          "110305": {
            "name": "Belobog's Loudest Roar!",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110306": {
            "name": "This Song Rocks to Heaven!",
            "desc": "Serval deals <unbreak>#1[i]%</unbreak> more DMG to Shocked enemies."
          }
        },
        "Effects": {
          "10011031": {
            "name": "DMG Boost",
            "desc": "Roaring Thunderclap and Lightning Flash deal <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> more DMG.",
            "effect": "DMG Boost",
            "source": 1103,
            "ID": 10011031
          },
          "10011032": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1103,
            "ID": 10011032
          }
        },
        "Traces": {
          "A2": {
            "name": "Rock 'n' Roll",
            "desc": "Skill has a <unbreak>#1[i]%</unbreak> increased base chance to Shock enemies.",
            "owner": 1103,
            "ID": 1103101,
            "Ascension": 2
          },
          "A4": {
            "name": "String Vibration",
            "desc": "At the start of the battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1103,
            "ID": 1103102,
            "Ascension": 4
          },
          "A6": {
            "name": "Mania",
            "desc": "Upon defeating an enemy, ATK is increased by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1103,
            "ID": 1103103,
            "Ascension": 6
          }
        }
      },
      "1104": {
        "Name": "Gepard",
        "Abilities": {
          "110401": {
            "name": "Fist of Conviction",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Gepard's ATK to a single enemy."
          },
          "110402": {
            "name": "Daunting Smite",
            "desc": "Deals Ice DMG to a single enemy, <color=#f29e38ff>with a chance of Freezing them</color>.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Gepard's ATK to a single enemy, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to Freeze the enemy for <unbreak>#3[i]</unbreak> turn(s).\\nWhile Frozen, the enemy cannot take action and will take <u>Additional</u> Ice DMG equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Gepard's ATK at the beginning of each turn."
          },
          "110403": {
            "name": "Enduring Bulwark",
            "desc": "<color=#f29e38ff>Provides a Shield</color> to all allies.",
            "longdesc": "Applies a Shield to all allies, absorbing DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Gepard's DEF plus <color=#f29e38ff><unbreak>#3[i]</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "110404": {
            "name": "Unyielding Will",
            "desc": "When struck by a killing blow, <color=#f29e38ff>instead of being <u>knocked down</u></color>, immediately restores HP. This effect can only trigger 1 time per battle.",
            "longdesc": "When struck with a killing blow, instead of becoming <u>knocked down</u>, Gepard's HP immediately restores to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of his Max HP. This effect can only trigger once per battle."
          },
          "110406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110407": {
            "name": "Comradery",
            "desc": "After this character uses Technique, all allies gain a Shield at the start of the next battle.",
            "longdesc": "After Gepard uses his Technique, when the next battle begins, a Shield will be applied to all allies, absorbing DMG equal to <unbreak>#1[i]%</unbreak> of Gepard's DEF plus <unbreak>#3[i]</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "110401": {
            "name": "Due Diligence",
            "desc": "When using Skill, increases the base chance to Freeze target enemy by <unbreak>#1[i]%</unbreak>."
          },
          "110402": {
            "name": "Lingering Cold",
            "desc": "After an enemy Frozen by Skill is unfrozen, their SPD is reduced by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "110403": {
            "name": "Never Surrender",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110404": {
            "name": "Faith Moves Mountains",
            "desc": "When Gepard is in battle, all allies' Effect RES increases by <unbreak>#1[i]%</unbreak>."
          },
          "110405": {
            "name": "Cold Iron Fist",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110406": {
            "name": "Unyielding Resolve",
            "desc": "When his Talent is triggered, Gepard immediately takes action and restores extra HP equal to <unbreak>#1[i]%</unbreak> of his Max HP."
          }
        },
        "Effects": {
          "10011041": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 1104,
            "ID": 10011041
          },
          "10011042": {
            "name": "Unyielding Will",
            "desc": "When struck with a killing blow, instead of becoming downed, Gepard immediately restores HP equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of his Max HP.",
            "source": 1104,
            "ID": 10011042
          },
          "10011043": {
            "name": "DEF Boost",
            "desc": "DEF +<color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "DEF Boost",
            "source": 1104,
            "ID": 10011043
          },
          "10011044": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 1104,
            "ID": 10011044
          },
          "10011045": {
            "name": "Slow",
            "desc": "SPD -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Slow",
            "source": 1104,
            "ID": 10011045
          },
          "10011046": {
            "name": "Effect RES Boost",
            "desc": "Effect RES +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1104,
            "ID": 10011046
          },
          "10011047": {
            "name": "CRIT Rate Boost",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1104,
            "ID": 10011047
          },
          "10011048": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1104,
            "ID": 10011048
          }
        },
        "Traces": {
          "A2": {
            "name": "Integrity",
            "desc": "Gepard has a higher chance to be attacked by enemies.",
            "owner": 1104,
            "ID": 1104101,
            "Ascension": 2
          },
          "A4": {
            "name": "Commander",
            "desc": "When \"Unyielding Will\" is triggered, Gepard's Energy will be restored to <unbreak>100%</unbreak>.",
            "owner": 1104,
            "ID": 1104102,
            "Ascension": 4
          },
          "A6": {
            "name": "Grit",
            "desc": "Gepard's ATK increases by <unbreak>#1[i]%</unbreak> of his current DEF. This effect will refresh at the start of each turn.",
            "owner": 1104,
            "ID": 1104103,
            "Ascension": 6
          }
        }
      },
      "1105": {
        "Name": "Natasha",
        "Abilities": {
          "110501": {
            "name": "Behind the Kindness",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Natasha's ATK to a single enemy."
          },
          "110502": {
            "name": "Love, Heal, and Choose",
            "desc": "<color=#f29e38ff>Restores HP</color> for a single ally and provides <color=#f29e38ff>Healing Over Time</color> to them.",
            "longdesc": "Restores a single ally for <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Natasha's Max HP plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>. Restores the ally for another <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Natasha's Max HP plus <color=#f29e38ff><unbreak>#5[i]</unbreak></color> at the beginning of each turn for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "110503": {
            "name": "Gift of Rebirth",
            "desc": "<color=#f29e38ff>Restores HP</color> for all allies.",
            "longdesc": "Heals all allies for <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Natasha's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>."
          },
          "110504": {
            "name": "Innervation",
            "desc": "When healing allies with low HP percentage, increases Outgoing Healing. This effect also works on continuous healing.",
            "longdesc": "When healing allies with HP percentage at <unbreak>#1[i]%</unbreak> or lower, increases Natasha's Outgoing Healing by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. This effect also works on continuous healing."
          },
          "110506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110507": {
            "name": "Hypnosis Research",
            "desc": "Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict Weaken to all enemy targets.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals Physical DMG equal to <unbreak>#4[i]%</unbreak> of Natasha's ATK to a random enemy, with a <unbreak>#1[i]%</unbreak> <u>base chance</u> to Weaken all enemies.\\nWhile Weakened, enemies deal <unbreak>#2[i]%</unbreak> less DMG to allies for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "110501": {
            "name": "Pharmacology Expertise",
            "desc": "After being attacked, if the current HP percentage is <unbreak>#1[i]%</unbreak> or lower, heals self for 1 time to restore HP by an amount equal to <unbreak>#2[i]%</unbreak> of Max HP plus <unbreak>#3[i]</unbreak>. This effect can only be triggered 1 time per battle."
          },
          "110502": {
            "name": "Clinical Research",
            "desc": "When Natasha uses her Ultimate, grant continuous healing for <unbreak>#2[i]</unbreak> turn(s) to allies whose HP percentage is at <unbreak>#1[i]%</unbreak> or lower. And at the beginning of their turn, their HP is restored by an amount equal to <unbreak>#3[i]%</unbreak> of Natasha's Max HP plus <unbreak>#4[i]</unbreak>."
          },
          "110503": {
            "name": "The Right Cure",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110504": {
            "name": "Miracle Cure",
            "desc": "After being attacked, regenerates <unbreak>#1[i]</unbreak> extra Energy."
          },
          "110505": {
            "name": "Preventive Treatment",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110506": {
            "name": "Doctor's Grace",
            "desc": "Natasha's Basic ATK additionally deals Physical DMG equal to <unbreak>#1[i]%</unbreak> of her Max HP."
          }
        },
        "Effects": {
          "10011051": {
            "name": "Weaken",
            "desc": "Deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> less DMG to your team.",
            "effect": "Weaken",
            "source": 1105,
            "ID": 10011051
          },
          "10011052": {
            "name": "DEF Boost",
            "desc": "DEF increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>",
            "effect": "DEF Boost",
            "source": 1105,
            "ID": 10011052
          },
          "10011053": {
            "name": "DMG Boost",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1105,
            "ID": 10011053
          },
          "10011054": {
            "name": "Healing Over Time",
            "desc": "Restores a certain amount of HP at the start of each turn.",
            "effect": "Healing Over Time",
            "source": 1105,
            "ID": 10011054
          },
          "10011055": {
            "name": "Healing Over Time",
            "desc": "Restores a certain amount of HP at the start of each turn.",
            "effect": "Healing Over Time",
            "source": 1105,
            "ID": 10011055
          }
        },
        "Traces": {
          "A2": {
            "name": "Soothe",
            "desc": "The Skill removes <unbreak>#1[i]</unbreak> debuff(s) from a target ally.",
            "owner": 1105,
            "ID": 1105101,
            "Ascension": 2
          },
          "A4": {
            "name": "Healer",
            "desc": "Natasha's Outgoing Healing increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1105,
            "ID": 1105102,
            "Ascension": 4
          },
          "A6": {
            "name": "Recuperation",
            "desc": "Increases the duration of Skill's continuous healing effect for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1105,
            "ID": 1105103,
            "Ascension": 6
          }
        }
      },
      "1106": {
        "Name": "Pela",
        "Abilities": {
          "110601": {
            "name": "Frost Shot",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Pela's ATK to a single target enemy."
          },
          "110602": {
            "name": "Frostbite",
            "desc": "<color=#f29e38ff>Dispels</color> 1 <color=#f29e38ff><u>buff</u></color> from a single enemy target, and deals Ice DMG to the target enemy.",
            "longdesc": "Removes <unbreak>#2[i]</unbreak> <u>buff(s)</u> and deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Pela's ATK to a single target enemy."
          },
          "110603": {
            "name": "Zone Suppression",
            "desc": "Has a high chance of <color=#f29e38ff>lowering enemies' DEF</color> and deals minor Ice DMG to all enemies.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Pela's ATK to all enemies, with a <unbreak>#1[i]%</unbreak> <u>base chance</u> to inflict Exposed on all enemies.\\nWhen Exposed, enemies' DEF is reduced by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "110604": {
            "name": "Data Collecting",
            "desc": "After using an attack, if the enemy target is currently inflicted with <u>debuff(s)</u>, Pela regenerates Energy.",
            "longdesc": "If the enemy is <u>debuffed</u> after Pela's attack, Pela will restore <color=#f29e38ff><unbreak>#1[f1]</unbreak></color> additional Energy. This effect can only be triggered 1 time per attack."
          },
          "110606": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110607": {
            "name": "Preemptive Strike",
            "desc": "Attacks the enemy. After entering battle, deals minor DMG to a random single enemy, with a high chance of lowering the DEF of all enemy targets.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, Pela deals Ice DMG equal to <unbreak>#4[i]%</unbreak> of her ATK to a random enemy, with a <unbreak>#1[i]%</unbreak> <u>base chance</u> of lowering the DEF of all enemies by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "110601": {
            "name": "Victory Report",
            "desc": "When an enemy is defeated, Pela regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "110602": {
            "name": "Adamant Charge",
            "desc": "Using Skill to remove buff(s) increases SPD by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "110603": {
            "name": "Suppressive Force",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110604": {
            "name": "Full Analysis",
            "desc": "When Skill is used, there is a <unbreak>#1[i]%</unbreak> base chance to reduce the target enemy's Ice RES by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "110605": {
            "name": "Absolute Jeopardy",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110606": {
            "name": "Feeble Pursuit",
            "desc": "When Pela attacks a debuffed enemy, she deals Additional Ice DMG equal to <unbreak>#1[i]%</unbreak> of Pela's ATK to the enemy."
          }
        },
        "Effects": {
          "10011061": {
            "name": "Exposed",
            "desc": "DEF -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1106,
            "ID": 10011061
          },
          "10011062": {
            "name": "Ravage",
            "desc": "DMG taken on Toughness +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Toughness Vulnerability",
            "source": 1106,
            "ID": 10011062
          },
          "10011063": {
            "name": "DEF Reduction",
            "desc": "DEF -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1106,
            "ID": 10011063
          },
          "10011064": {
            "name": "Wipe Out",
            "desc": "Increases the next attack's DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1106,
            "ID": 10011064
          },
          "10011065": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1106,
            "ID": 10011065
          },
          "10011066": {
            "name": "Ice RES Reduction",
            "desc": "Ice RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Ice RES Reduction",
            "source": 1106,
            "ID": 10011066
          }
        },
        "Traces": {
          "A2": {
            "name": "Bash",
            "desc": "Deals <unbreak>#1[i]%</unbreak> more DMG to debuffed enemies.",
            "owner": 1106,
            "ID": 1106101,
            "Ascension": 2
          },
          "A4": {
            "name": "The Secret Strategy",
            "desc": "When Pela is on the battlefield, all allies' Effect Hit Rate increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1106,
            "ID": 1106102,
            "Ascension": 4
          },
          "A6": {
            "name": "Wipe Out",
            "desc": "Using Skill to remove buff(s) increases the DMG of the next attack by <unbreak>#1[i]%</unbreak>.",
            "owner": 1106,
            "ID": 1106103,
            "Ascension": 6
          }
        }
      },
      "1107": {
        "Name": "Clara",
        "Abilities": {
          "110701": {
            "name": "I Want to Help",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Clara's ATK to a single enemy."
          },
          "110702": {
            "name": "Svarog Watches Over You",
            "desc": "Deals Physical DMG to all enemies. <color=#f29e38ff>Additionally deals Physical DMG</color> to targets with Marks of Counter.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Clara's ATK to all enemies, and additionally deals Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Clara's ATK to enemies marked by Svarog with a Mark of Counter.\\nAll Marks of Counter will be removed after this Skill is used."
          },
          "110703": {
            "name": "Promise, Not Command",
            "desc": "<color=#f29e38ff>Reduces DMG received</color>, increases chance to be attacked by enemies, and enhances <u>Counters</u>.",
            "longdesc": "After Clara uses Ultimate, DMG dealt to her is reduced by an extra <color=#f29e38ff><unbreak>#4[i]%</unbreak></color>, and she has greatly increased chances of being attacked by enemies for <unbreak>#3[i]</unbreak> turn(s).\\nIn addition, Svarog's <u>Counter</u> is enhanced. When an ally is attacked, Svarog immediately launches a <u>Counter</u>, and its DMG multiplier against the enemy increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. Enemies adjacent to it take <unbreak>50%</unbreak> of the DMG dealt to the primary target enemy. Enhanced <u>Counter(s)</u> can take effect <unbreak>#5[i]</unbreak> time(s)."
          },
          "110704": {
            "name": "Because We're Family",
            "desc": "<color=#f29e38ff>DMG received from enemy attacks is reduced</color>. Enemies who attack Clara will be marked with a Mark of Counter and <color=#f29e38ff>met with Svarog's <u>Counter</u></color>, dealing Physical DMG.",
            "longdesc": "Under the protection of Svarog, DMG taken by Clara when hit by enemy attacks is reduced by <unbreak>#3[i]%</unbreak>. Svarog will mark enemies who attack Clara with his Mark of Counter and retaliate with a <u>Counter</u>, dealing Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Clara's ATK."
          },
          "110706": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110707": {
            "name": "A Small Price for Victory",
            "desc": "Attacks the enemy. After entering battle, this character's chance of being attacked by enemies increases.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, the chance Clara will be attacked by enemies increases for <unbreak>#1[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "110701": {
            "name": "A Tall Figure",
            "desc": "Using Skill will not remove Marks of Counter on the enemy."
          },
          "110702": {
            "name": "A Tight Embrace",
            "desc": "After using the Ultimate, ATK increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "110703": {
            "name": "Cold Steel Armor",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110704": {
            "name": "Family's Warmth",
            "desc": "After Clara is hit, the DMG taken by Clara is reduced by <unbreak>#1[i]%</unbreak>. This effect lasts until the start of her next turn."
          },
          "110705": {
            "name": "A Small Promise",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110706": {
            "name": "Long Company",
            "desc": "After other allies are hit, Svarog also has a <unbreak>#1[i]%</unbreak> fixed chance to trigger a Counter on the attacker and mark them with a Mark of Counter. When using Ultimate, the number of Enhanced Counters increases by <unbreak>#2[i]</unbreak>."
          }
        },
        "Effects": {
          "10011071": {
            "name": "Promise, Not Command",
            "desc": "Receives less DMG with a higher chance to be attacked.",
            "effect": "DMG Mitigation",
            "source": 1107,
            "ID": 10011071
          },
          "10011072": {
            "name": "Mark of Counter",
            "desc": "The target is Marked by Svarog.",
            "source": 1107,
            "ID": 10011072
          },
          "10011073": {
            "name": "Guardian",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1107,
            "ID": 10011073
          },
          "10011074": {
            "name": "DMG Mitigation",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1107,
            "ID": 10011074
          },
          "10011075": {
            "name": "A Small Price for Victory",
            "desc": "Higher chance to be attacked.",
            "source": 1107,
            "ID": 10011075
          },
          "10011076": {
            "name": "Enhanced Counter",
            "desc": "Allies being attacked will also trigger Counter, for which the DMG multiplier is also increased.",
            "source": 1107,
            "ID": 10011076
          },
          "10011077": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1107,
            "ID": 10011077
          }
        },
        "Traces": {
          "A2": {
            "name": "Kinship",
            "desc": "When attacked, this character has a <unbreak>#1[i]%</unbreak> fixed chance to remove a debuff placed on them.",
            "owner": 1107,
            "ID": 1107101,
            "Ascension": 2
          },
          "A4": {
            "name": "Under Protection",
            "desc": "The chance to resist Crowd Control Debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1107,
            "ID": 1107102,
            "Ascension": 4
          },
          "A6": {
            "name": "Revenge",
            "desc": "Increases Svarog's Counter DMG by <unbreak>#1[i]%</unbreak>.",
            "owner": 1107,
            "ID": 1107103,
            "Ascension": 6
          }
        }
      },
      "1108": {
        "Name": "Sampo",
        "Abilities": {
          "110801": {
            "name": "Dazzling Blades",
            "desc": "Deals minor Wind DMG to a single enemy.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sampo's ATK to a single enemy."
          },
          "110802": {
            "name": "Ricochet Love",
            "desc": "Deals minor Wind DMG to single enemy targets with 5 Bounces in total.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Sampo's ATK to a single enemy, and further deals DMG for <unbreak>#1[i]</unbreak> extra time(s), with each time dealing Wind DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Sampo's ATK to a random enemy."
          },
          "110803": {
            "name": "Surprise Present",
            "desc": "Deals Wind DMG to all enemies, with a high chance to cause <color=#f29e38ff>increased DoT taken</color> to them.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sampo's ATK to all enemies, with a <unbreak>#4[i]%</unbreak> <u>base chance</u> to increase the targets' DoT taken by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "110804": {
            "name": "Windtorn Dagger",
            "desc": "After hitting an enemy, there is a chance of inflicting <color=#f29e38ff>Wind Shear</color> on the target.",
            "longdesc": "Sampo's attacks have a <unbreak>#1[i]%</unbreak> <u>base chance</u> to inflict Wind Shear for <unbreak>#3[i]</unbreak> turn(s).\\nEnemies inflicted with Wind Shear will take Wind DoT equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Sampo's ATK at the beginning of each turn. Wind Shear can stack up to <unbreak>#4[i]</unbreak> time(s)."
          },
          "110806": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110807": {
            "name": "Shining Bright",
            "desc": "Enemies in a set area are Blinded. When initiating battle against a Blinded enemy, there is a high chance to <u>delay</u> all enemies' actions.",
            "longdesc": "After Sampo uses his Technique, enemies in a set area are inflicted with Blind for <unbreak>#1[i]</unbreak> second(s). Blinded enemies cannot detect your team.\\nWhen initiating combat against a Blinded enemy, there is a <unbreak>#2[i]%</unbreak> <u>fixed chance</u> to delay all enemies' action by <unbreak>#3[i]%</unbreak>."
          }
        },
        "Eidolons": {
          "110801": {
            "name": "Rising Love",
            "desc": "When using Skill, deals DMG for <unbreak>#1[i]</unbreak> extra time(s) to a random enemy."
          },
          "110802": {
            "name": "Infectious Enthusiasm",
            "desc": "Defeating an enemy with Wind Shear has a <unbreak>#1[i]%</unbreak> base chance to inflict all enemies with <unbreak>#2[i]</unbreak> stack(s) of Wind Shear, equivalent to the Talent's Wind Shear."
          },
          "110803": {
            "name": "Big Money!",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110804": {
            "name": "The Deeper the Love, the Stronger the Hate",
            "desc": "When Skill hits an enemy with <unbreak>#1[i]</unbreak> or more stack(s) of Wind Shear, the enemy immediately takes <unbreak>#2[i]%</unbreak> of current Wind Shear DMG."
          },
          "110805": {
            "name": "Huuuuge Money!",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110806": {
            "name": "Increased Spending",
            "desc": "Talent's Wind Shear DMG multiplier increases by <unbreak>#1[i]%</unbreak>."
          }
        },
        "Effects": {
          "10011081": {
            "name": "DoT Vulnerability",
            "desc": "DoT taken +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DoT Vulnerability",
            "source": 1108,
            "ID": 10011081
          }
        },
        "Traces": {
          "A2": {
            "name": "Trap",
            "desc": "Extends the duration of Wind Shear caused by Talent by <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1108,
            "ID": 1108101,
            "Ascension": 2
          },
          "A4": {
            "name": "Defensive Position",
            "desc": "Using Ultimate additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1108,
            "ID": 1108102,
            "Ascension": 4
          },
          "A6": {
            "name": "Spice Up",
            "desc": "Enemies with Wind Shear effect deal <unbreak>#1[i]%</unbreak> less DMG to Sampo.",
            "owner": 1108,
            "ID": 1108103,
            "Ascension": 6
          }
        }
      },
      "1109": {
        "Name": "Hook",
        "Abilities": {
          "110901": {
            "name": "Hehe! Don't Get Burned!",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hook's ATK to a single enemy."
          },
          "110902": {
            "name": "Hey! Remember Hook?",
            "desc": "Deals Fire DMG to a single enemy, with a high chance to inflict Burn on the enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hook's ATK to a single enemy. In addition, there is a <unbreak>#2[i]%</unbreak> <u>base chance</u> to inflict Burn for <unbreak>#3[i]</unbreak> turn(s).\\nWhen afflicted with Burn, enemies will take Fire DoT equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Hook's ATK at the beginning of each turn."
          },
          "110903": {
            "name": "Boom! Here Comes the Fire!",
            "desc": "Deals massive Fire DMG to a single enemy and <color=#f29e38ff>Enhances this unit's next Skill</color>.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hook's ATK to a single enemy.\\nAfter using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it."
          },
          "110904": {
            "name": "Ha! Oil to the Flames!",
            "desc": "When attacking a Burned enemy, <color=#f29e38ff>deals <u>Additional</u> Fire DMG for a moderate amount</color>, and additionally regenerates energy.",
            "longdesc": "When attacking a target afflicted with Burn, deals <u>Additional</u> Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hook's ATK and regenerates <unbreak>#2[i]</unbreak> extra Energy."
          },
          "110906": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "110907": {
            "name": "Ack! Look at This Mess!",
            "desc": "Attacks the enemy. After entering battle, deals Fire DMG to a random single enemy, with a high chance to inflict Burn on all enemy targets.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, Hook deals Fire DMG equal to <unbreak>#4[i]%</unbreak> of her ATK to a random enemy. In addition, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to inflict Burn on every enemy for <unbreak>#3[i]</unbreak> turn(s).\\nWhen afflicted with Burn, enemies will take Fire DoT equal to <unbreak>#2[i]%</unbreak> of Hook's ATK at the beginning of each turn."
          }
        },
        "Eidolons": {
          "110901": {
            "name": "Early to Bed, Early to Rise",
            "desc": "Enhanced Skill deals <unbreak>#1[i]%</unbreak> increased DMG."
          },
          "110902": {
            "name": "Happy Tummy, Happy Body",
            "desc": "Extends the duration of Burn caused by Skill by <unbreak>#1[i]</unbreak> turn(s)."
          },
          "110903": {
            "name": "Don't Be Picky, Nothing's Icky",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "110904": {
            "name": "It's Okay to Not Know",
            "desc": "When Talent is triggered, there is a <unbreak>#1[i]%</unbreak> base chance to Burn enemies adjacent to the target enemy, equivalent to that of Skill."
          },
          "110905": {
            "name": "Let the Moles' Deeds Be Known",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "110906": {
            "name": "Always Ready to Punch and Kick",
            "desc": "Hook deals <unbreak>#1[i]%</unbreak> more DMG to enemies afflicted with Burn."
          }
        },
        "Effects": {
          "10011091": {
            "name": "Enhanced Skill",
            "desc": "Enhances the next Skill and changes it to a Blast attack.",
            "effect": "Enhanced Skill",
            "source": 1109,
            "ID": 10011091
          }
        },
        "Traces": {
          "A2": {
            "name": "Innocence",
            "desc": "Hook restores HP equal to <unbreak>#1[i]%</unbreak> of her Max HP whenever her Talent is triggered.",
            "owner": 1109,
            "ID": 1109101,
            "Ascension": 2
          },
          "A4": {
            "name": "Naivete",
            "desc": "The chance to resist Crowd Control Debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1109,
            "ID": 1109102,
            "Ascension": 4
          },
          "A6": {
            "name": "Playing With Fire",
            "desc": "When using her Ultimate, Hook has her action Advanced Forward by <unbreak>#2[i]%</unbreak> and Hook additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1109,
            "ID": 1109103,
            "Ascension": 6
          }
        }
      },
      "1110": {
        "Name": "Lynx",
        "Abilities": {
          "111001": {
            "name": "Ice Crampon Technique",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of this character's Max HP to a single enemy."
          },
          "111002": {
            "name": "Salted Camping Cans",
            "desc": "Applies \"Survival Response\" to a single ally, <color=#f29e38ff>increases their Max HP</color>, and restores their HP.",
            "longdesc": "Applies \"Survival Response\" to a single target ally and increases their Max HP by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Lynx's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. \"Survival Response\" lasts for <unbreak>#3[i]</unbreak> turn(s).\\nRestores the target's HP by <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color> of Lynx's Max HP plus <color=#f29e38ff><unbreak>#5[i]</unbreak></color>."
          },
          "111003": {
            "name": "Snowfield First Aid",
            "desc": "Dispels <color=#f29e38ff>1 <u>debuff</u> from all allies</color> and restores their HP.",
            "longdesc": "Dispels <unbreak>#1[i]</unbreak> <u>debuff(s)</u> from all allies and immediately restores their respective HP by an amount equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Lynx's Max HP plus <color=#f29e38ff><unbreak>#3[i]</unbreak></color>."
          },
          "111004": {
            "name": "Outdoor Survival Experience",
            "desc": "When using Skill or Ultimate, applies <color=#f29e38ff>continuous healing</color> on the target ally. If the target has \"Survival Response,\" the continuous healing effect additionally increases.",
            "longdesc": "When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for <unbreak>#1[i]</unbreak> turn(s), restoring the target ally's HP by an amount equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Lynx's Max HP plus <color=#f29e38ff><unbreak>#3[i]</unbreak></color> at the start of each turn. If the target has \"Survival Response,\" the continuous healing effect additionally restores HP by an amount equal to <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color> of Lynx's Max HP plus <color=#f29e38ff><unbreak>#5[i]</unbreak></color>."
          },
          "111006": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "111007": {
            "name": "Chocolate Energy Bar",
            "desc": "After this character uses her Technique, at the start of the next battle, all allies are granted a continuous healing effect.",
            "longdesc": "After Lynx uses her Technique, at the start of the next battle, all allies are granted her Talent's continuous healing effect, lasting for <unbreak>#1[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "111001": {
            "name": "Morning of Snow Hike",
            "desc": "When healing allies with HP percentage equal to or lower than <unbreak>#1[i]%</unbreak>, Lynx's Outgoing Healing increases by <unbreak>#2[i]%</unbreak>. This effect also works on continuous healing."
          },
          "111002": {
            "name": "Noon of Portable Furnace",
            "desc": "A target with \"Survival Response\" can resist debuff application for <unbreak>#1[i]</unbreak> time(s)."
          },
          "111003": {
            "name": "Afternoon of Avalanche Beacon",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "111004": {
            "name": "Dusk of Warm Campfire",
            "desc": "When \"Survival Response\" is gained, increases the target's ATK by an amount equal to <unbreak>#1[f1]%</unbreak> of Lynx's Max HP for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "111005": {
            "name": "Night of Aurora Tea",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "111006": {
            "name": "Dawn of Explorers' Chart",
            "desc": "Additionally boosts the Max HP increasing effect of \"Survival Response\" by an amount equal to <unbreak>#1[f1]%</unbreak> of Lynx's Max HP and increases Effect RES by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10011101": {
            "name": "Healing Over Time",
            "desc": "Restores a certain amount of HP at the start of each turn.",
            "effect": "Healing Over Time",
            "source": 1110,
            "ID": 10011101
          },
          "10011102": {
            "name": "SPD Boost",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1110,
            "ID": 10011102
          },
          "10011103": {
            "name": "ATK Boost",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1110,
            "ID": 10011103
          },
          "10011104": {
            "name": "Survival Response",
            "desc": "Increases Max HP by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "Max HP Boost",
            "source": 1110,
            "ID": 10011104
          },
          "10011105": {
            "name": "Survival Response",
            "desc": "Increases Max HP by <color=#f29e38ff><unbreak>#1[i]</unbreak></color> and Effect RES by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "Max HP Boost",
            "source": 1110,
            "ID": 10011105
          },
          "10011106": {
            "name": "Debuff RES",
            "desc": "Resists 1 debuff.",
            "source": 1110,
            "ID": 10011106
          }
        },
        "Traces": {
          "A2": {
            "name": "Advance Surveying",
            "desc": "After a target with \"Survival Response\" is hit, Lynx regenerates <unbreak>#1[i]</unbreak> Energy immediately.",
            "owner": 1110,
            "ID": 1110101,
            "Ascension": 2
          },
          "A4": {
            "name": "Exploration Techniques",
            "desc": "Increases the chance to resist Crowd Control debuffs by <unbreak>#1[i]%</unbreak>.",
            "owner": 1110,
            "ID": 1110102,
            "Ascension": 4
          },
          "A6": {
            "name": "Survival in the Extreme",
            "desc": "Extends the duration of the continuous healing effect granted by Talent for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1110,
            "ID": 1110103,
            "Ascension": 6
          }
        }
      },
      "1111": {
        "Name": "Luka",
        "Abilities": {
          "111101": {
            "name": "Direct Punch",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luka's ATK to a single enemy."
          },
          "111102": {
            "name": "Lacerating Fist",
            "desc": "Deals Physical DMG to a single enemy, with a high chance of causing <color=#f29e38ff>Bleed</color>.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luka's ATK to a single enemy target. In addition, there is a <unbreak>#2[i]%</unbreak> <u>base chance</u> to inflict Bleed on them, lasting for <unbreak>#5[i]</unbreak> turn(s).\\nWhile Bleeding, the enemy will take <unbreak>#3[f1]%</unbreak> of their Max HP as Physical DoT at the start of each turn. This DMG will not exceed more than <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Luka's ATK."
          },
          "111103": {
            "name": "Coup de Grâce",
            "desc": "Receives <color=#f29e38ff><unbreak>#5[i]</unbreak></color> stack(s) of Fighting Will, with a high chance of increasing the target's DMG received, and deals massive Physical DMG to the target.",
            "longdesc": "Receives <unbreak>#5[i]</unbreak> stack(s) of Fighting Will, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to increase a single enemy target's DMG received by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> for <unbreak>#4[i]</unbreak> turn(s). Then, deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luka's ATK to the target."
          },
          "111104": {
            "name": "Flying Sparks",
            "desc": "After using the Basic ATK \"Direct Punch\" or the Skill \"Lacerating Fist,\" receives 1 stack of Fighting Will. When 2 or more stacks of Fighting Will are present, <color=#f29e38ff>Basic ATK becomes Enhanced</color>.\\nIf the enemy is Bleeding, the Enhanced Basic ATK will <color=#f29e38ff>cause Bleed to deal extra DMG for 1 time</color>.",
            "longdesc": "After Luka uses his Basic ATK \"Direct Punch\" or Skill \"Lacerating Fist,\" he receives <unbreak>#1[i]</unbreak> stack of Fighting Will, up to 4 stacks. When he has 2 or more stacks of Fighting Will, his Basic ATK \"Direct Punch\" is enhanced to \"Sky-Shatter Fist.\" After his Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG for 1 time equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of the original DMG to the target. At the start of battle, Luka will possess 1 stack of Fighting Will."
          },
          "111106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "111107": {
            "name": "Anticipator",
            "desc": "Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict <color=#f29e38ff>Bleed</color> to the target. Then, gains 1 stack of Fighting Will.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, Luka deals Physical DMG equal to <unbreak>#1[i]%</unbreak> of his ATK to a random single enemy with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to inflict his Skill's Bleed effect on the target. Then, Luka gains 1 additional stack of Fighting Will."
          }
        },
        "Eidolons": {
          "111101": {
            "name": "Fighting Endlessly",
            "desc": "When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "111102": {
            "name": "The Enemy is Weak, I am Strong",
            "desc": "If the Skill hits an enemy target with Physical Weakness, gain <unbreak>#1[i]</unbreak> stack(s) of Fighting Will."
          },
          "111103": {
            "name": "Born for the Ring",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "111104": {
            "name": "Never Turning Back",
            "desc": "For every stack of Fighting Will obtained, increases ATK by <unbreak>#1[i]%</unbreak>, stacking up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "111105": {
            "name": "The Spirit of Wildfire",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "111106": {
            "name": "A Champion's Applause",
            "desc": "After the Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG 1 time equal to <unbreak>#1[i]%</unbreak> of the original DMG for every hit of Direct Punch already unleashed during the current Enhanced Basic ATK."
          }
        },
        "Effects": {
          "10011111": {
            "name": "Fighting Endlessly",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1111,
            "ID": 10011111
          },
          "10011112": {
            "name": "Never Turning Back",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1111,
            "ID": 10011112
          },
          "10011114": {
            "name": "Vulnerability",
            "desc": "Increases DMG taken by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "Vulnerability",
            "source": 1111,
            "ID": 10011114
          },
          "10011115": {
            "name": "Bleed",
            "desc": "Takes Physical DMG at the start of each turn for a certain number of turns.",
            "effect": "Bleed",
            "source": 1111,
            "ID": 10011115
          }
        },
        "Traces": {
          "A2": {
            "name": "Kinetic Overload",
            "desc": "When the Skill is used, immediately dispels <unbreak>#1[i]</unbreak> buff from the enemy target.",
            "owner": 1111,
            "ID": 1111101,
            "Ascension": 2
          },
          "A4": {
            "name": "Cycle Braking",
            "desc": "For every stack of Fighting Will obtained, additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1111,
            "ID": 1111102,
            "Ascension": 4
          },
          "A6": {
            "name": "Crush Fighting Will",
            "desc": "When using Enhanced Basic ATK, every hit Direct Punch deals has a <unbreak>#1[i]%</unbreak> fixed chance for Luka to use 1 additional hit. This effect does not apply to additional hits generated in this way.",
            "owner": 1111,
            "ID": 1111103,
            "Ascension": 6
          }
        }
      },
      "1112": {
        "Name": "Topaz & Numby",
        "Abilities": {
          "111201": {
            "name": "Deficit...",
            "desc": "Deals minor Fire DMG to an enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Topaz's ATK to a single enemy."
          },
          "111202": {
            "name": "Difficulty Paying?",
            "desc": "Inflicts a single enemy with a Proof of Debt status and causes it to <color=#f29e38ff>receive increased follow-up attack DMG</color>. Numby deals Fire DMG to the target.",
            "longdesc": "Inflicts a single target enemy with a Proof of Debt status, increasing the <u>follow-up attack</u> DMG it receives by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. Proof of Debt only takes effect on the most recent target it is applied to. If there are no enemies inflicted with Proof of Debt on the field when an ally's turn starts or when an ally takes action, Topaz will inflict a random enemy with Proof of Debt.\\nNumby deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Topaz's ATK to this target. Using this Skill to deal DMG is considered as launching a <u>follow-up attack</u>."
          },
          "111203": {
            "name": "Turn a Profit!",
            "desc": "Numby enters the Windfall Bonanza! state and <color=#f29e38ff>increases its DMG multiplier and CRIT DMG</color>.",
            "longdesc": "Numby enters the Windfall Bonanza! state and its DMG multiplier increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and CRIT DMG increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. Also, when enemies with Proof of Debt are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by <unbreak>#3[i]%</unbreak>. Numby exits the Windfall Bonanza! state after using <unbreak>#4[i]</unbreak> attacks."
          },
          "111204": {
            "name": "Trotter Market!?",
            "desc": "At the start of battle, summons <color=#f29e38ff>Numby</color>. When Numby takes action, <color=#f29e38ff>Numby deals follow-up attacks to a single enemy with Proof of Debt</color>. When an enemy with Proof of Debt takes DMG from follow-up attacks, Numby's <color=#f29e38ff>action is Advanced Forward</color>.",
            "longdesc": "Summons Numby at the start of battle. Numby has <unbreak>#1[i]</unbreak> SPD by default. When taking action, Numby launches <u>follow-up attacks</u> on a single enemy target afflicted with Proof of Debt, dealing Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Topaz's ATK.\\nWhen enemies afflicted with Proof of Debt receive an ally's follow-up attacks, Numby's action is Advanced Forward by <unbreak>#3[i]%</unbreak>. The action Advance Forward effect cannot be triggered during Numby's own turn.\\nWhen Topaz is <u>downed</u>, Numby disappears."
          },
          "111206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "111207": {
            "name": "Explicit Subsidy",
            "desc": "<color=#f29e38ff>Summons Numby to tag along</color> in a map. Numby will automatically <color=#f29e38ff>search for Basic Treasures and Trotters nearby</color>. Using Technique will regenerate Energy for Topaz after Numby's first attack in the next battle.",
            "longdesc": "Summons Numby when Topaz enters the overworld. Numby will automatically search for Basic Treasures and Trotters within a set radius.\\nUsing her Technique will regenerate <unbreak>#1[i]</unbreak> Energy for Topaz after Numby's first attack in the next battle.\\nIf Topaz is still in the team after using her Technique and defeating overworld enemies, a small bonus amount of credits will be added to the earned credits. A maximum of <unbreak>#2[i]</unbreak> bonus credits can be received per calendar day.\\nAfter using her Technique and defeating enemies in Simulated Universe or Divergent Universe, additionally receive a small amount of Cosmic Fragments with a small chance to obtain 1 random Curio."
          }
        },
        "Eidolons": {
          "111201": {
            "name": "Future Market",
            "desc": "When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single attack.\\nThe Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by <unbreak>#1[i]%</unbreak>, stacking up to <unbreak>#2[i]</unbreak> time(s). When Proof of Debt is removed, the Debtor state is also removed."
          },
          "111202": {
            "name": "Bona Fide Acquisition",
            "desc": "After Numby takes action and launches an attack, Topaz regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "111203": {
            "name": "Seize the Big and Free the Small",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "111204": {
            "name": "Agile Operation",
            "desc": "After Numby's turn begins, Topaz's action is Advanced Forward by <unbreak>#1[i]%</unbreak>."
          },
          "111205": {
            "name": "Inflationary Demand",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "111206": {
            "name": "Incentive Mechanism",
            "desc": "Numby's attack count during the Windfall Bonanza! state increases by <unbreak>#1[i]</unbreak>, and its Fire RES PEN increases by <unbreak>#2[i]%</unbreak> when it attacks."
          }
        },
        "Effects": {
          "10011121": {
            "name": "Windfall Bonanza!",
            "desc": "Numby's DMG multiplier increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, CRIT DMG increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. When enemies with Proof of Debt receive attacks from allies' Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>.",
            "source": 1112,
            "ID": 10011121
          },
          "10011122": {
            "name": "Proof of Debt",
            "desc": "Increases follow-up attack DMG received by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. Numby will target this unit as its attack target.",
            "effect": "Proof of Debt",
            "source": 1112,
            "ID": 10011122
          },
          "10011123": {
            "name": "Debtor",
            "desc": "Increases CRIT DMG received from follow-up attacks by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, stacking up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> time(s).",
            "effect": "Debtor",
            "source": 1112,
            "ID": 10011123
          },
          "10011124": {
            "effect": "DMG multiplier, CRIT DMG Boost",
            "source": 1112,
            "ID": 10011124
          }
        },
        "Traces": {
          "A2": {
            "name": "Overdraft",
            "desc": "When Topaz uses Basic ATK to deal DMG, it will be considered as a follow-up attack.",
            "owner": 1112,
            "ID": 1112101,
            "Ascension": 2
          },
          "A4": {
            "name": "Financial Turmoil",
            "desc": "Increases Topaz & Numby's DMG dealt to enemy targets with Fire Weakness by <unbreak>#1[i]%</unbreak>.",
            "owner": 1112,
            "ID": 1112102,
            "Ascension": 4
          },
          "A6": {
            "name": "Stonks Market",
            "desc": "After Numby uses an attack while in the Windfall Bonanza! state, Topaz additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1112,
            "ID": 1112103,
            "Ascension": 6
          }
        }
      },
      "1201": {
        "Name": "Qingque",
        "Abilities": {
          "120101": {
            "name": "Flower Pick",
            "desc": "Tosses a tile to deal minor Quantum DMG to a single enemy.",
            "longdesc": "Tosses 1 jade tile from the suit with the fewest tiles in hand to deal Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Qingque's ATK to a single enemy."
          },
          "120102": {
            "name": "A Scoop of Moon",
            "desc": "<color=#f29e38ff>Draws tiles</color> and increases DMG dealt. <color=#f29e38ff>This turn does not end</color> after this action.",
            "longdesc": "Immediately draws <unbreak>#1[i]</unbreak> jade tile(s) and increases DMG by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> until the end of the current turn. This effect can stack up to <unbreak>#3[i]</unbreak> time(s). The turn will not end after this Skill is used."
          },
          "120103": {
            "name": "A Quartet? Woo-hoo!",
            "desc": "Deals Quantum DMG to all enemies, then obtains 4 tiles of the same suit.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Qingque's ATK to all enemies, and obtains 4 jade tiles of the same suit."
          },
          "120104": {
            "name": "Celestial Jade",
            "desc": "At the start of any ally's turn, draws a tile. At the start of this character's turn, if this character holds 4 tiles from the same suit, remove all tiles in possession and <color=#f29e38ff>Enhance this Basic ATK</color> while increasing this character's ATK.",
            "longdesc": "When an ally's turn starts, Qingque randomly draws 1 tile from 3 different suits and can hold up to 4 tiles at one time.\\nIf Qingque starts her turn with 4 tiles of the same suit, she consumes all tiles to enter the \"Hidden Hand\" state.\\nWhile in this state, Qingque cannot use her Skill again. At the same time, Qingque's ATK increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, and her Basic ATK \"Flower Pick\" is enhanced, becoming \"Cherry on Top!\" The \"Hidden Hand\" state ends after using \"Cherry on Top!\"."
          },
          "120106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120107": {
            "name": "Game Solitaire",
            "desc": "After they use their Technique, draw tile(s) at the start of the next battle.",
            "longdesc": "After using Technique, Qingque draws <unbreak>#1[i]</unbreak> jade tile(s) when the battle starts."
          }
        },
        "Eidolons": {
          "120101": {
            "name": "Rise Through the Tiles",
            "desc": "Ultimate deals <unbreak>#1[i]%</unbreak> more DMG."
          },
          "120102": {
            "name": "Sleep on the Tiles",
            "desc": "Every time Draw Tile is triggered, Qingque immediately regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "120103": {
            "name": "Read Between the Tiles",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120104": {
            "name": "Right on the Tiles",
            "desc": "After using Skill, there is a <unbreak>#1[i]%</unbreak> fixed chance to gain Self-Sufficer, lasting until the end of the current turn. \\nWith Self-Sufficer, using Basic ATK or Enhanced Basic ATK immediately launches 1 follow-up attack on the same target, dealing Quantum DMG equal to <unbreak>100%</unbreak> of Basic ATK DMG or Enhanced Basic ATK DMG."
          },
          "120105": {
            "name": "Gambit for the Tiles",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120106": {
            "name": "Prevail Beyond the Tiles",
            "desc": "Recovers 1 Skill Point after using Enhanced Basic ATK."
          }
        },
        "Effects": {
          "10012011": {
            "name": "Hidden Hand",
            "desc": "Basic ATK is Enhanced and increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1201,
            "ID": 10012011
          },
          "10012012": {
            "name": "DMG Boost",
            "desc": "Each stack increases DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to 4 stacks.",
            "source": 1201,
            "ID": 10012012
          },
          "10012013": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1201,
            "ID": 10012013
          },
          "10012014": {
            "name": "Self-Sufficer",
            "desc": "Launches 1 follow-up attack immediately after using Basic ATK or Enhanced Basic ATK on an enemy, dealing Quantum DMG equal to <unbreak>100%</unbreak> of Basic ATK DMG or Enhanced Basic ATK DMG.",
            "source": 1201,
            "ID": 10012014
          }
        },
        "Traces": {
          "A2": {
            "name": "Tile Battle",
            "desc": "Restores 1 Skill Point when using the Skill. This effect can only be triggered 1 time per battle.",
            "owner": 1201,
            "ID": 1201101,
            "Ascension": 2
          },
          "A4": {
            "name": "Bide Time",
            "desc": "Using the Skill increases DMG Boost effect of attacks by an extra <unbreak>#1[i]%</unbreak>.",
            "owner": 1201,
            "ID": 1201102,
            "Ascension": 4
          },
          "A6": {
            "name": "Winning Hand",
            "desc": "Qingque's SPD increases by <unbreak>#1[i]%</unbreak> for 1 turn after using the Enhanced Basic ATK.",
            "owner": 1201,
            "ID": 1201103,
            "Ascension": 6
          }
        }
      },
      "1202": {
        "Name": "Tingyun",
        "Abilities": {
          "120201": {
            "name": "Dislodged",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Tingyun deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of her ATK to a single enemy."
          },
          "120202": {
            "name": "Soothing Melody",
            "desc": "<color=#f29e38ff>Increases the ATK</color> of a single ally and grants them Benediction. Ally with Benediction additionally deals minor <color=#f29e38ff>Lightning <u>Additional DMG</u></color> when attacking.",
            "longdesc": "Grants a single ally with Benediction to increase their ATK by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Tingyun's current ATK.\\nWhen the ally with Benediction attacks, they will deal <u>Additional</u> Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of that ally's ATK for 1 time.\\nBenediction lasts for <unbreak>#3[i]</unbreak> turn(s) and is only effective on the most recent receiver of Tingyun's Skill."
          },
          "120203": {
            "name": "Amidst the Rejoicing Clouds",
            "desc": "Regenerates a target ally's <color=#f29e38ff>Energy</color> and <color=#f29e38ff>increases their DMG dealt</color>.",
            "longdesc": "Regenerates <unbreak>#1[i]</unbreak> Energy for a single ally and increases the target's DMG by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "120204": {
            "name": "Violet Sparknado",
            "desc": "When an enemy is attacked by Tingyun, the ally with Benediction immediately deals minor Lightning <u>Additional DMG</u> to the same enemy.",
            "longdesc": "When an enemy is attacked by Tingyun, the ally with Benediction immediately deals <u>Additional</u> Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of that ally's ATK to the same enemy."
          },
          "120206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120207": {
            "name": "Gentle Breeze",
            "desc": "After using this Technique, this character immediately regenerates Energy for themselves.",
            "longdesc": "Tingyun immediately regenerates <unbreak>#1[i]</unbreak> Energy upon using her Technique."
          }
        },
        "Eidolons": {
          "120201": {
            "name": "Windfall of Lucky Springs",
            "desc": "After using their Ultimate, the ally with Benediction gains a <unbreak>#1[i]%</unbreak> increase in SPD for 1 turn."
          },
          "120202": {
            "name": "Gainfully Gives, Givingly Gains",
            "desc": "The ally with Benediction regenerates <unbreak>#1[i]</unbreak> Energy after defeating an enemy. This effect can only be triggered once per turn."
          },
          "120203": {
            "name": "Halcyon Bequest",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120204": {
            "name": "Jovial Versatility",
            "desc": "The DMG multiplier provided by Benediction increases by <unbreak>#1[i]%</unbreak>."
          },
          "120205": {
            "name": "Sauntering Coquette",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120206": {
            "name": "Peace Brings Wealth to All",
            "desc": "Ultimate regenerates <unbreak>#1[i]</unbreak> more Energy for the target ally."
          }
        },
        "Effects": {
          "10012021": {
            "name": "Benediction",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1202,
            "ID": 10012021
          },
          "10012022": {
            "name": "Amidst the Rejoicing Clouds",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1202,
            "ID": 10012022
          },
          "10012023": {
            "name": "Nourished Joviality",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1202,
            "ID": 10012023
          },
          "10012024": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1202,
            "ID": 10012024
          }
        },
        "Traces": {
          "A2": {
            "name": "Nourished Joviality",
            "desc": "Tingyun's SPD increases by <unbreak>#1[i]%</unbreak> for 1 turn after using Skill.",
            "owner": 1202,
            "ID": 1202101,
            "Ascension": 2
          },
          "A4": {
            "name": "Knell Subdual",
            "desc": "DMG dealt by Basic ATK increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1202,
            "ID": 1202102,
            "Ascension": 4
          },
          "A6": {
            "name": "Jubilant Passage",
            "desc": "Tingyun immediately regenerates <unbreak>#1[i]</unbreak> Energy at the start of her turn.",
            "owner": 1202,
            "ID": 1202103,
            "Ascension": 6
          }
        }
      },
      "1203": {
        "Name": "Luocha",
        "Abilities": {
          "120301": {
            "name": "Thorns of the Abyss",
            "desc": "Deals minor Imaginary DMG to a single enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luocha's ATK to a single enemy."
          },
          "120302": {
            "name": "Prayer of Abyss Flower",
            "desc": "<color=#f29e38ff>Restores</color> a single ally's HP and gains 1 stack of Abyss Flower.",
            "longdesc": "After using his Skill, Luocha immediately restores the target ally's HP equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luocha's ATK plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. Meanwhile, Luocha gains 1 stack of Abyss Flower.\\nWhen any ally's HP percentage drops to <unbreak>#3[i]%</unbreak> or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after <unbreak>#4[i]</unbreak> turn(s)."
          },
          "120303": {
            "name": "Death Wish",
            "desc": "<color=#f29e38ff>Removes</color> 1 <color=#f29e38ff><u>buff</u></color> from all enemies, deals Imaginary DMG to all enemies, and gains 1 stack of Abyss Flower.",
            "longdesc": "Removes <unbreak>#2[i]</unbreak> <u>buff(s)</u> from all enemies and deals all enemies Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Luocha's ATK. At the same time, Luocha gains 1 stack of Abyss Flower."
          },
          "120304": {
            "name": "Cycle of Life",
            "desc": "Deploys a <color=#f29e38ff>Zone</color> when Abyss Flower reaches 2 stacks. While the Zone is active, allies will <color=#f29e38ff>restore HP after they attack</color>.",
            "longdesc": "When Abyss Flower reaches <unbreak>#1[i]</unbreak> stacks, Luocha consumes all stacks of Abyss Flower to deploy a Zone against the enemy.\\nWhen any enemy in the Zone is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Luocha's ATK plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>.\\nThe Zone's effect lasts for <unbreak>#3[i]</unbreak> turns. When Luocha is <u>knocked down</u>, the Zone will be dispelled."
          },
          "120306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120307": {
            "name": "Mercy of a Fool",
            "desc": "After the Technique is used, immediately trigger the effect of the Talent at the start of the next battle.",
            "longdesc": "After the Technique is used, the Talent will be immediately triggered at the start of the next battle."
          }
        },
        "Eidolons": {
          "120301": {
            "name": "Ablution of the Quick",
            "desc": "While the Zone is active, ATK of all allies increases by <unbreak>#1[i]%</unbreak>."
          },
          "120302": {
            "name": "Bestowal From the Pure",
            "desc": "When his Skill is triggered, if the target ally's HP percentage is lower than <unbreak>50%</unbreak>, Luocha's Outgoing Healing increases by <unbreak>#1[i]%</unbreak>. If the target ally's HP percentage is at <unbreak>50%</unbreak> or higher, the ally receives a Shield that can absorb DMG equal to <unbreak>#2[i]%</unbreak> of Luocha's ATK plus <unbreak>#3[i]</unbreak>, lasting for <unbreak>#4[i]</unbreak> turns."
          },
          "120303": {
            "name": "Surveyal by the Fool",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120304": {
            "name": "Heavy Lies the Crown",
            "desc": "When Luocha's Zone is active, enemies become Weakened and deal <unbreak>#1[i]%</unbreak> less DMG."
          },
          "120305": {
            "name": "Cicatrix 'Neath the Pain",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120306": {
            "name": "Reunion With the Dust",
            "desc": "When Ultimate is used, there is a <unbreak>#1[i]%</unbreak> fixed chance to reduce all enemies' All-Type RES by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Effects": {
          "10012031": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 1203,
            "ID": 10012031
          },
          "10012032": {
            "name": "Abyss Flower",
            "desc": "When the Abyss Flower is fully stacked, Luocha can consume all the stacks to deploy a Zone against the enemy.",
            "source": 1203,
            "ID": 10012032
          },
          "10012033": {
            "name": "Cycle of Life",
            "desc": "After using an attack on an enemy, restores HP to self.",
            "source": 1203,
            "ID": 10012033
          },
          "10012034": {
            "name": "Prayer of Abyss Flower",
            "desc": "Skill effect auto-trigger is on cooldown.",
            "source": 1203,
            "ID": 10012034
          },
          "10012035": {
            "name": "Weaken",
            "desc": "Deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> less DMG.",
            "effect": "Weaken",
            "source": 1203,
            "ID": 10012035
          },
          "10012036": {
            "name": "Ablution of the Quick",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1203,
            "ID": 10012036
          },
          "10012037": {
            "name": "Reunion With the Dust",
            "desc": "All-Type DMG RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "All-Type RES Reduction",
            "source": 1203,
            "ID": 10012037
          },
          "10012038": {
            "name": "Cycle of Life",
            "desc": "After using an attack on an enemy, restores HP to self.",
            "source": 1203,
            "ID": 10012038
          }
        },
        "Traces": {
          "A2": {
            "name": "Cleansing Revival",
            "desc": "When the Skill's effect is triggered, removes <unbreak>#1[i]</unbreak> debuff(s) from a target ally.",
            "owner": 1203,
            "ID": 1203101,
            "Ascension": 2
          },
          "A4": {
            "name": "Sanctified",
            "desc": "When any enemy in the Zone is attacked by an ally, all allies (except the attacker) restore HP equal to <unbreak>#1[f1]%</unbreak> of Luocha's ATK plus <unbreak>#2[i]</unbreak>.",
            "owner": 1203,
            "ID": 1203102,
            "Ascension": 4
          },
          "A6": {
            "name": "Through the Valley",
            "desc": "The chance to resist Crowd Control debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1203,
            "ID": 1203103,
            "Ascension": 6
          }
        }
      },
      "1204": {
        "Name": "Jing Yuan",
        "Abilities": {
          "120401": {
            "name": "Glistening Light",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Jing Yuan deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of his ATK to a single enemy."
          },
          "120402": {
            "name": "Rifting Zenith",
            "desc": "Deals minor Lightning DMG to all enemies and <color=#f29e38ff>increases Lightning-Lord's Hits Per Action</color>.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by <unbreak>#2[i]</unbreak> for the next turn."
          },
          "120403": {
            "name": "Lightbringer",
            "desc": "Deals Lightning DMG to all enemies and <color=#f29e38ff>increases Lightning-Lord's Hits Per Action</color>.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by <unbreak>#2[i]</unbreak> for the next turn."
          },
          "120404": {
            "name": "Prana Extirpated",
            "desc": "Summons Lightning-Lord at the start of the battle. Lightning-Lord <color=#f29e38ff>automatically</color> <color=#f29e38ff>deals minor Lightning DMG</color> to a random enemy and enemies adjacent to it.",
            "longdesc": "Summons Lightning-Lord at the start of the battle. Lightning-Lord has <unbreak>#1[i]</unbreak> base SPD and <unbreak>#4[i]</unbreak> base Hits Per Action. When the Lightning-Lord takes action, its hits are considered as <u>follow-up attacks</u>, with each hit dealing Lightning DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive Lightning DMG equal to <unbreak>#5[i]%</unbreak> of the DMG dealt to the primary target enemy.\\nThe Lightning-Lord's Hits Per Action can reach a max of <unbreak>#6[i]</unbreak>. Every time Lightning-Lord's Hits Per Action increases by 1, its SPD increases by <unbreak>#3[i]</unbreak>. After the Lightning-Lord's action ends, its SPD and Hits Per Action return to their base values.\\nWhen Jing Yuan is <u>knocked down</u>, the Lightning-Lord will disappear.\\nWhen Jing Yuan is affected by <u>Crowd Control debuff</u>, the Lightning-Lord is unable to take action."
          },
          "120406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120407": {
            "name": "Spiritus Invocation",
            "desc": "After using Technique, for the next battle, <color=#f29e38ff>increases Lightning-Lord's Hits Per Action</color>.",
            "longdesc": "After the Technique is used, the Lightning-Lord's Hits Per Action in the first turn increases by <unbreak>#1[i]</unbreak> at the start of the next battle."
          }
        },
        "Eidolons": {
          "120401": {
            "name": "Slash, Seas Split",
            "desc": "When Lightning-Lord attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to <unbreak>#1[i]%</unbreak> of the DMG multiplier against the primary target enemy."
          },
          "120402": {
            "name": "Swing, Skies Squashed",
            "desc": "After Lightning-Lord takes action, DMG dealt by Jing Yuan's Basic ATK, Skill, and Ultimate increases by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "120403": {
            "name": "Strike, Suns Subdued",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120404": {
            "name": "Spin, Stars Sieged",
            "desc": "For each hit performed by the Lightning-Lord when it takes action, Jing Yuan regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "120405": {
            "name": "Stride, Spoils Seized",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120406": {
            "name": "Sweep, Souls Slain",
            "desc": "Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable.\\nWhile Vulnerable, enemies receive <unbreak>#1[i]%</unbreak> more DMG until the end of the Lightning-Lord's current turn, stacking up to <unbreak>#2[i]</unbreak> time(s)."
          }
        },
        "Effects": {
          "10012041": {
            "name": "Prana Extirpated",
            "desc": "Lightning-Lord's Hits Per Action.",
            "source": 1204,
            "ID": 10012041
          },
          "10012042": {
            "name": "Lightbringer",
            "desc": "Lightning-Lord's Enhanced ATK count.",
            "source": 1204,
            "ID": 10012042
          },
          "10012043": {
            "name": "Dharma Corpora",
            "desc": "Jing Yuan's Basic ATK, Skill, and Ultimate deal <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> increased DMG.",
            "source": 1204,
            "ID": 10012043
          },
          "10012044": {
            "name": "CRIT Rate Boost",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1204,
            "ID": 10012044
          }
        },
        "Traces": {
          "A2": {
            "name": "Battalia Crush",
            "desc": "If the Lightning-Lord's Hits Per Action is greater or equal to <unbreak>#1[i]</unbreak> in the next turn, its CRIT DMG increases by <unbreak>#2[i]%</unbreak> for the next turn.",
            "owner": 1204,
            "ID": 1204101,
            "Ascension": 2
          },
          "A4": {
            "name": "Savant Providence",
            "desc": "At the start of the battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1204,
            "ID": 1204102,
            "Ascension": 4
          },
          "A6": {
            "name": "War Marshal",
            "desc": "After the Skill is used, the CRIT Rate increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1204,
            "ID": 1204103,
            "Ascension": 6
          }
        }
      },
      "1205": {
        "Name": "Blade",
        "Abilities": {
          "120501": {
            "name": "Shard Sword",
            "desc": "Deals minor Wind DMG to an enemy.",
            "longdesc": "Deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Blade's ATK as Wind DMG to a target enemy."
          },
          "120502": {
            "name": "Hellscape",
            "desc": "Consumes HP to <color=#f29e38ff>Enhance Basic ATK</color>, and this turn does not end after this Skill is used.",
            "longdesc": "Consumes HP equal to <unbreak>#1[i]%</unbreak> of Blade's Max HP to enter the Hellscape state.\\nWhen Hellscape is active, his Skill cannot be used, his DMG dealt increases by <color=#f29e38ff><unbreak>#4[i]%</unbreak></color>, and his Basic ATK Shard Sword is enhanced to Forest of Swords for <unbreak>#2[i]</unbreak> turn(s).\\nIf Blade's current HP is insufficient, his HP will be reduced to 1 when he uses his Skill.\\nThis Skill does not regenerate Energy. Using this Skill does not end the current turn."
          },
          "120503": {
            "name": "Death Sentence",
            "desc": "Sets current HP to <unbreak>50%</unbreak> of Max HP, and deals massive Wind DMG to a single enemy and Wind DMG to adjacent targets.",
            "longdesc": "Sets Blade's current HP to <unbreak>50%</unbreak> of his Max HP and deals Wind DMG to a single enemy equal to the sum of <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of his ATK, <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of his Max HP, and <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of the tally of Blade's HP loss in the current battle. At the same time, deals Wind DMG to adjacent targets equal to the sum of <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of his ATK, <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of his Max HP, and <color=#f29e38ff><unbreak>#6[i]%</unbreak></color> of the tally of his HP loss in the current battle.\\nThe tally of Blade's HP loss in the current battle is capped at <unbreak>#7[i]%</unbreak> of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used."
          },
          "120504": {
            "name": "Shuhu's Gift",
            "desc": "When Blade's HP is lowered, he gains 1 stack of Charge. When maximum Charge stack is reached, Blade <color=#f29e38ff>immediately deals Wind DMG to all enemies</color> and restores HP. Then, all Charges are consumed.",
            "longdesc": "When Blade sustains DMG or consumes his HP, he gains 1 stack of Charge, stacking up to 5 times. A max of 1 Charge stack can be gained every time he is attacked.\\nWhen Charge stack reaches maximum, immediately launches a <u>follow-up attack</u> on all enemies, dealing Wind DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Blade's ATK plus <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of his Max HP. At the same time, restores Blade's HP by <unbreak>#3[i]%</unbreak> of his Max HP. After the follow-up attack, all Charges are consumed."
          },
          "120506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120507": {
            "name": "Karma Wind",
            "desc": "Attacks the enemy. After entering combat, consumes own HP and deals Wind DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. After entering combat, consumes <unbreak>#2[i]%</unbreak> of Blade's Max HP while dealing Wind DMG equal to <unbreak>#1[i]%</unbreak> of his Max HP to all enemies.\\nIf Blade's current HP is insufficient, his HP will be reduced to 1 when this Technique is used."
          }
        },
        "Eidolons": {
          "120501": {
            "name": "Blade Cuts the Deepest in Hell",
            "desc": "Blade's Ultimate deals additionally increased DMG to a single enemy target, with the increased amount equal to <unbreak>#1[i]%</unbreak> of the tally of Blade's HP loss in the current battle.\\nThe tally of Blade's HP loss in the current battle is capped at <unbreak>#2[i]%</unbreak> of his Max HP. The tally value will be reset and re-accumulated after his Ultimate has been used."
          },
          "120502": {
            "name": "Ten Thousand Sorrows From One Broken Dream",
            "desc": "When Blade is in the Hellscape state, his CRIT Rate increases by <unbreak>#1[i]%</unbreak>."
          },
          "120503": {
            "name": "Hardened Blade Bleeds Coldest Shade",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120504": {
            "name": "Rejected by Death, Infected With Life",
            "desc": "When Blade's current HP percentage drops to <unbreak>50%</unbreak> or lower of his Max HP, increases his Max HP by <unbreak>#1[i]%</unbreak>. Stacks up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "120505": {
            "name": "Death By Ten Lords' Gaze",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120506": {
            "name": "Reborn Into an Empty Husk",
            "desc": "The maximum number of Charge stacks is reduced to 4. The follow-up attack triggered by Talent deals additionally increased DMG, equal to <unbreak>#1[i]%</unbreak> of Blade's Max HP."
          }
        },
        "Effects": {
          "10012051": {
            "name": "Hellscape",
            "desc": "Basic ATK \"Shard Sword\" is enhanced, becoming \"Forest of Swords\" and dealing Blast DMG.",
            "effect": "Enhanced Basic ATK",
            "source": 1205,
            "ID": 10012051
          },
          "10012052": {
            "name": "Charge",
            "desc": "At full Charge stacks, expend all stacks and immediately deal a follow-up attack to all enemies.",
            "source": 1205,
            "ID": 10012052
          },
          "10012053": {
            "name": "DMG Boost",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1205,
            "ID": 10012053
          },
          "10012054": {
            "name": "Vita Infinita",
            "desc": "Incoming Healing +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Outgoing Healing Boost",
            "source": 1205,
            "ID": 10012054
          },
          "10012055": {
            "name": "Heal All Bones",
            "desc": "Max HP +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Max HP Boost",
            "source": 1205,
            "ID": 10012055
          },
          "10012056": {
            "name": "Grievous Penitence",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1205,
            "ID": 10012056
          },
          "10012057": {
            "name": "Furious Resurrection",
            "desc": "Temporarily unable to return to the battlefield.",
            "effect": "Furious Resurrection",
            "source": 1205,
            "ID": 10012057
          },
          "10012058": {
            "name": "Death Sentence",
            "desc": "HP Lost: <color=#f29e38ff><unbreak>#1[i]</unbreak></color>",
            "source": 1205,
            "ID": 10012058
          }
        },
        "Traces": {
          "A2": {
            "name": "Vita Infinita",
            "desc": "When Blade's current HP percentage is at <unbreak>50%</unbreak> of Max HP or lower, Incoming Healing increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1205,
            "ID": 1205101,
            "Ascension": 2
          },
          "A4": {
            "name": "Neverending Deaths",
            "desc": "If Blade hits a Weakness Broken enemy after using Forest of Swords, he will restore HP equal to <unbreak>#1[i]%</unbreak> of his Max HP plus <unbreak>#2[i]</unbreak>.",
            "owner": 1205,
            "ID": 1205102,
            "Ascension": 4
          },
          "A6": {
            "name": "Cyclone of Destruction",
            "desc": "Follow-up attack DMG dealt by Talent increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1205,
            "ID": 1205103,
            "Ascension": 6
          }
        }
      },
      "1206": {
        "Name": "Sushang",
        "Abilities": {
          "120601": {
            "name": "Cloudfencer Art: Starshine",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sushang's ATK to a single enemy."
          },
          "120602": {
            "name": "Cloudfencer Art: Mountainfall",
            "desc": "Deals Physical DMG to a single enemy with <color=#f29e38ff>a small chance of triggering Sword Stance</color>. If the enemy has <u>Weakness Break</u>, <color=#f29e38ff>Sword Stance is guaranteed to trigger</color>.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sushang's ATK to a single enemy. In addition, there is a <unbreak>#3[i]%</unbreak> chance to trigger Sword Stance on the final hit, dealing <u>Additional</u> Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Sushang's ATK to the enemy.\\nIf the enemy is inflicted with <u>Weakness Break</u>, Sword Stance is guaranteed to trigger."
          },
          "120603": {
            "name": "Shape of Taixu: Dawn Herald",
            "desc": "Deals massive Physical DMG to a single enemy, enhances Sword Stance's effect, and <color=#f29e38ff>takes action immediately</color>.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sushang's ATK to a single enemy target, and she immediately takes action. In addition, Sushang's ATK increases by <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> and using her Skill has 2 extra chances to trigger Sword Stance for <unbreak>#2[i]</unbreak> turn(s).\\nSword Stance triggered from the extra chances deals <unbreak>#3[i]%</unbreak> of the original DMG."
          },
          "120604": {
            "name": "Dancing Blade",
            "desc": "When an enemy on the field has its Weakness Broken, this character's SPD increases.",
            "longdesc": "When an enemy has their Weakness Broken on the field, Sushang's SPD increases by <color=#f29e38ff><unbreak>#1[f2]%</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "120606": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120607": {
            "name": "Cloudfencer Art: Warcry",
            "desc": "Attacks the enemy. After entering battle, deals minor Physical DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, Sushang deals Physical DMG equal to <unbreak>#1[i]%</unbreak> of her ATK to all enemies."
          }
        },
        "Eidolons": {
          "120601": {
            "name": "Cut With Ease",
            "desc": "After using Skill against a Weakness Broken enemy, regenerates 1 Skill Point."
          },
          "120602": {
            "name": "Refine in Toil",
            "desc": "After Sword Stance is triggered, the DMG taken by Sushang is reduced by <unbreak>#1[i]%</unbreak> for 1 turn."
          },
          "120603": {
            "name": "Rise From Fame",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120604": {
            "name": "Cleave With Heart",
            "desc": "Sushang's Break Effect increases by <unbreak>#1[i]%</unbreak>."
          },
          "120605": {
            "name": "Prevail via Taixu",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120606": {
            "name": "Dwell Like Water",
            "desc": "Talent's SPD Boost is stackable and can stack up to 2 times. Additionally, after entering battle, Sushang immediately gains 1 stack of her Talent's SPD Boost."
          }
        },
        "Effects": {
          "10012061": {
            "name": "Dawn Herald",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and receives 2 extra chances to trigger Sword Stance when using Skill.",
            "effect": "ATK Boost",
            "source": 1206,
            "ID": 10012061
          },
          "10012062": {
            "name": "Dancing Blade",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1206,
            "ID": 10012062
          },
          "10012063": {
            "name": "Refine in Toil",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 1206,
            "ID": 10012063
          },
          "10012064": {
            "name": "Riposte",
            "desc": "Increases Sword Stance DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> for each stack, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "source": 1206,
            "ID": 10012064
          },
          "10012065": {
            "name": "Dancing Blade",
            "desc": "Each stack increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1206,
            "ID": 10012065
          },
          "10012066": {
            "name": "Guileless",
            "desc": "Lowers the chances of being attacked by enemies.",
            "effect": "Target Probability Reduction",
            "source": 1206,
            "ID": 10012066
          }
        },
        "Traces": {
          "A2": {
            "name": "Guileless",
            "desc": "When current HP percentage is <unbreak>#1[i]%</unbreak> or lower, reduces the chance of being attacked by enemies.",
            "owner": 1206,
            "ID": 1206101,
            "Ascension": 2
          },
          "A4": {
            "name": "Riposte",
            "desc": "For every Sword Stance triggered, the DMG dealt by Sword Stance increases by <unbreak>#1[i]%</unbreak>. Stacks up to <unbreak>#2[i]</unbreak> time(s).",
            "owner": 1206,
            "ID": 1206102,
            "Ascension": 4
          },
          "A6": {
            "name": "Vanquisher",
            "desc": "After using Basic ATK or Skill, if there are enemies on the field with Weakness Break, Sushang's action is Advanced Forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1206,
            "ID": 1206103,
            "Ascension": 6
          }
        }
      },
      "1207": {
        "Name": "Yukong",
        "Abilities": {
          "120701": {
            "name": "Arrowslinger",
            "desc": "Deals minor Imaginary DMG to an enemy.",
            "longdesc": "Deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yukong's ATK as Imaginary DMG to a target enemy."
          },
          "120702": {
            "name": "Emboldening Salvo",
            "desc": "Obtains 2 stacks of Roaring Bowstrings. All allies' <color=#f29e38ff>ATK increases</color> when Roaring Bowstrings is active on this character.",
            "longdesc": "Obtains <unbreak>#1[i]</unbreak> stack(s) of \"Roaring Bowstrings\" (to a maximum of 2 stacks). When \"Roaring Bowstrings\" is active, the ATK of all allies increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>, and every time an ally's turn (including Yukong's) ends, Yukong loses 1 stack of \"Roaring Bowstrings.\"\\nWhen it's the turn where Yukong gains \"Roaring Bowstrings\" by using Skill, \"Roaring Bowstrings\" will not be removed."
          },
          "120703": {
            "name": "Diving Kestrel",
            "desc": "When Roaring Bowstrings is active on this character, <color=#f29e38ff>increases the CRIT Rate and CRIT DMG</color> of all allies and deals massive Imaginary DMG to a single enemy.",
            "longdesc": "If \"Roaring Bowstrings\" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> and CRIT DMG by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>. At the same time, deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yukong's ATK to a single enemy."
          },
          "120704": {
            "name": "Seven Layers, One Arrow",
            "desc": "Basic Attack additionally deals minor DMG, and the Toughness Reduction of this Basic Attack is increased. This effect can be triggered again after 1 turn has passed.",
            "longdesc": "Basic ATK additionally deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yukong's ATK, and increases the Toughness Reduction of this attack by <unbreak>#2[i]%</unbreak>. This effect can be triggered again after <unbreak>#3[i]</unbreak> turn(s)."
          },
          "120706": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120707": {
            "name": "Windchaser",
            "desc": "This unit's <color=#f29e38ff>movement speed increases</color>. After attacking an enemy and entering battle, gains 2 stacks of Roaring Bowstrings.",
            "longdesc": "After using her Technique, Yukong enters Sprint mode for <unbreak>#1[i]</unbreak> seconds. In Sprint mode, her movement speed increases by <unbreak>#2[i]%</unbreak>, and Yukong gains <unbreak>#3[i]</unbreak> stack(s) of \"Roaring Bowstrings\" when she enters battle by attacking enemies."
          }
        },
        "Eidolons": {
          "120701": {
            "name": "Aerial Marshal",
            "desc": "At the start of battle, increases the SPD of all allies by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "120702": {
            "name": "Skyward Command",
            "desc": "When any ally's current energy is equal to its energy limit, Yukong regenerates an additional <unbreak>#1[i]</unbreak> energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong uses her Ultimate."
          },
          "120703": {
            "name": "Torrential Fusillade",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120704": {
            "name": "Zephyrean Echoes",
            "desc": "When \"Roaring Bowstrings\" is active, Yukong deals <unbreak>#1[i]%</unbreak> more DMG to enemies."
          },
          "120705": {
            "name": "August Deadshot",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120706": {
            "name": "Bowstring Thunderclap",
            "desc": "When Yukong uses her Ultimate, she immediately gains <unbreak>#1[i]</unbreak> stack(s) of \"Roaring Bowstrings.\""
          }
        },
        "Effects": {
          "10012071": {
            "name": "Roaring Bowstrings",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1207,
            "ID": 10012071
          },
          "10012072": {
            "name": "Roaring Bowstrings",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, CRIT Rate by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>, and CRIT DMG by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>.",
            "effect": "ATK, CRIT Rate, and CRIT DMG Boost",
            "source": 1207,
            "ID": 10012072
          },
          "10012073": {
            "name": "Seven Layers, One Arrow",
            "desc": "Basic ATK deals additional Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yukong's ATK, and increases Toughness Reduction by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "source": 1207,
            "ID": 10012073
          },
          "10012074": {
            "name": "Debuff Block",
            "desc": "Blocks 1 debuff.",
            "source": 1207,
            "ID": 10012074
          },
          "10012075": {
            "name": "Aerial Marshal",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1207,
            "ID": 10012075
          },
          "10012076": {
            "name": "Zephyrean Echoes",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1207,
            "ID": 10012076
          }
        },
        "Traces": {
          "A2": {
            "name": "Archerion",
            "desc": "Yukong can resist 1 debuff application for 1 time. This effect can be triggered again after <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1207,
            "ID": 1207101,
            "Ascension": 2
          },
          "A4": {
            "name": "Bowmaster",
            "desc": "When Yukong is on the field, Imaginary DMG dealt by all allies increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1207,
            "ID": 1207102,
            "Ascension": 4
          },
          "A6": {
            "name": "Majestas",
            "desc": "When \"Roaring Bowstrings\" is active, Yukong regenerates <unbreak>#1[i]</unbreak> additional Energy every time an ally takes action.",
            "owner": 1207,
            "ID": 1207103,
            "Ascension": 6
          }
        }
      },
      "1208": {
        "Name": "Fu Xuan",
        "Abilities": {
          "120801": {
            "name": "Novaburst",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Fu Xuan's Max HP to a single enemy."
          },
          "120802": {
            "name": "Known by Stars, Shown by Hearts",
            "desc": "Activates Matrix of Prescience. <color=#f29e38ff>DMG received by Fu Xuan's allies is <u>Distributed</u></color> to her. Also <color=#f29e38ff>increases CRIT Rate</color> and Max HP of all allies.",
            "longdesc": "Activates Matrix of Prescience, via which other team members will <u>Distribute</u> <unbreak>#1[i]%</unbreak> of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for <unbreak>#3[i]</unbreak> turn(s).\\nWhile affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color> of Fu Xuan's Max HP, and increases CRIT Rate by <color=#f29e38ff><unbreak>#5[f1]%</unbreak></color>.\\nWhen Fu Xuan is <u>knocked down</u>, the Matrix of Prescience will be dispelled."
          },
          "120803": {
            "name": "Woes of Many Morphed to One",
            "desc": "Deals Quantum DMG to all enemies and increases Fu Xuan's Talent trigger count.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Fu Xuan's Max HP to all enemies and obtains 1 trigger count for the HP Restore effect granted by Fu Xuan's Talent."
          },
          "120804": {
            "name": "Bleak Breeds Bliss",
            "desc": "While Fu Xuan is still active in battle, the DMG taken by all team members is reduced.\\nWhen her HP is low, <color=#f29e38ff>automatically</color> <color=#f29e38ff>restores her own HP</color> based on the HP percentage already lost. This effect can have up to 2 trigger counts at any given time.",
            "longdesc": "While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> less DMG.\\nWhen Fu Xuan's current HP percentage falls to <unbreak>#2[i]%</unbreak> of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect has 1 trigger count by default and can hold up to a maximum of 2 trigger counts."
          },
          "120806": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120807": {
            "name": "Of Fortune Comes Fate",
            "desc": "Activates a Barrier. Allies will not enter battle when attacked by enemies. Entering battle will automatically activate Matrix of Prescience.",
            "longdesc": "After the Technique is used, all team members receive a Barrier, lasting for <unbreak>#1[i]</unbreak> seconds. This Barrier can block all enemy attacks, and the team will not enter battle when attacked. Entering battle while the Barrier is active will have Fu Xuan automatically activate Matrix of Prescience at the start of the battle, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "120801": {
            "name": "Dominus Pacis",
            "desc": "The Knowledge effect increases CRIT DMG by <unbreak>#1[i]%</unbreak>."
          },
          "120802": {
            "name": "Optimus Felix",
            "desc": "If any team member is struck by a killing blow while Matrix of Prescience is active, then all allies who were struck by a killing blow during this action will not be knocked down, and <unbreak>#1[i]%</unbreak> of their Max HP is immediately restored. This effect can trigger 1 time per battle."
          },
          "120803": {
            "name": "Apex Nexus",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120804": {
            "name": "Fortuna Stellaris",
            "desc": "When other allies under Matrix of Prescience are attacked, Fu Xuan regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "120805": {
            "name": "Arbiter Primus",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120806": {
            "name": "Omnia Vita",
            "desc": "Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. The DMG dealt by Fu Xuan's Ultimate will increase by <unbreak>#1[i]%</unbreak> of this tally of HP loss.\\nThis tally is also capped at <unbreak>#2[i]%</unbreak> of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used."
          }
        },
        "Effects": {
          "10012081": {
            "name": "Knowledge",
            "desc": "Max HP +<color=#f29e38ff><unbreak>#1[i]</unbreak></color>, CRIT Rate +<color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>.",
            "effect": "Increases Max HP and CRIT Rate",
            "source": 1208,
            "ID": 10012081
          },
          "10012082": {
            "name": "Matrix of Prescience",
            "desc": "Distribute to Fu Xuan <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the DMG this unit receives (before this DMG is mitigated by any Shields).",
            "source": 1208,
            "ID": 10012082
          },
          "10012083": {
            "name": "Misfortune Avoidance",
            "desc": "Reduces DMG taken by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1208,
            "ID": 10012083
          },
          "10012084": {
            "name": "Matrix of Prescience",
            "desc": "Receive DMG distributed by other allies.",
            "source": 1208,
            "ID": 10012084
          },
          "10012085": {
            "name": "Optimus Felix",
            "desc": "When struck with a killing blow, instead of becoming downed, the character immediately restores HP equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Max HP.",
            "effect": "Optimus Felix",
            "source": 1208,
            "ID": 10012085
          },
          "10012086": {
            "name": "Total HP lost",
            "desc": "Allies have lost <color=#f29e38ff><unbreak>#1[i]</unbreak></color> HP in total.",
            "source": 1208,
            "ID": 10012086
          },
          "10012087": {
            "name": "Knowledge",
            "desc": "Increases Max HP by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>, CRIT Rate by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>, and CRIT DMG by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>.",
            "effect": "Increases Max HP, CRIT Rate, and CRIT DMG",
            "source": 1208,
            "ID": 10012087
          },
          "10012088": {
            "name": "Liuren, the Sexagenary",
            "desc": "This status can be consumed to resist Crowd Control debuffs.",
            "effect": "Resist Crowd Control debuffs",
            "source": 1208,
            "ID": 10012088
          }
        },
        "Traces": {
          "A2": {
            "name": "Taiyi, the Macrocosmic",
            "desc": "When Matrix of Prescience is active, Fu Xuan will regenerate <unbreak>#1[i]</unbreak> extra Energy when she uses her Skill.",
            "owner": 1208,
            "ID": 1208101,
            "Ascension": 2
          },
          "A4": {
            "name": "Dunjia, the Metamystic",
            "desc": "When Fu Xuan's Ultimate is used, heals all other allies by an amount equal to <unbreak>#1[i]%</unbreak> of Fu Xuan's Max HP plus <unbreak>#2[i]</unbreak>.",
            "owner": 1208,
            "ID": 1208102,
            "Ascension": 4
          },
          "A6": {
            "name": "Liuren, the Sexagenary",
            "desc": "If a target enemy applies Crowd Control debuffs to allies while the Matrix of Prescience is active, all allies will resist all Crowd Control debuffs applied by the enemy target during the current action. This effect can only be triggered once. When Matrix of Prescience is activated again, the number of times this effect can be triggered will reset.",
            "owner": 1208,
            "ID": 1208103,
            "Ascension": 6
          }
        }
      },
      "1209": {
        "Name": "Yanqing",
        "Abilities": {
          "120901": {
            "name": "Frost Thorn",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yanqing's ATK to a single enemy."
          },
          "120902": {
            "name": "Darting Ironthorn",
            "desc": "Deals Ice DMG to a single enemy and activates the Soulsteel Sync.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yanqing's ATK to a single enemy and activates Soulsteel Sync for 1 turn."
          },
          "120903": {
            "name": "Amidst the Raining Bliss",
            "desc": "Increases Yanqing's CRIT Rate. Enhances \"Soulsteel Sync\" and deals massive Ice DMG to a single enemy.",
            "longdesc": "Increases Yanqing's CRIT Rate by <unbreak>#1[i]%</unbreak>. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. This <u>buff</u> lasts for one turn. Afterwards, deals Ice DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Yanqing's ATK to a single enemy."
          },
          "120904": {
            "name": "One With the Sword",
            "desc": "<color=#f29e38ff>During Soulsteel Sync</color>, reduces the chance of this character being attacked and <color=#f29e38ff>increases their CRIT Rate and CRIT DMG</color>. <color=#f29e38ff>After attacking an enemy</color>, there is a chance of launching a <u>follow-up attack</u>, dealing Ice DMG with a chance to Freeze the target.\\nSoulsteel Sync will be removed after this character receives damage.",
            "longdesc": "When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> and his CRIT DMG increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. After Yanqing attacks an enemy, there is a <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> <u>fixed chance</u> to perform a <u>follow-up attack</u>, dealing Ice DMG equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Yanqing's ATK to the enemy, which has a <unbreak>#6[i]%</unbreak> <u>base chance</u> to Freeze the enemy for 1 turn.\\nThe Frozen target cannot take action and receives <u>Additional</u> Ice DMG equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of Yanqing's ATK at the beginning of each turn.\\nWhen Yanqing receives DMG, the Soulsteel Sync effect will disappear."
          },
          "120906": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "120907": {
            "name": "The One True Sword",
            "desc": "After this character uses Technique, at the start of the next battle, increases the DMG dealt by this character to enemy targets whose HP percentage is <unbreak>50%</unbreak> or higher.",
            "longdesc": "After using his Technique, at the start of the next battle, Yanqing deals <unbreak>#2[i]%</unbreak> more DMG for <unbreak>#3[i]</unbreak> turn(s) to enemies whose current HP percentage is <unbreak>#1[i]%</unbreak> or higher."
          }
        },
        "Eidolons": {
          "120901": {
            "name": "Svelte Saber",
            "desc": "When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to <unbreak>#1[i]%</unbreak> of his ATK."
          },
          "120902": {
            "name": "Supine Serenade",
            "desc": "When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra <unbreak>#1[i]%</unbreak>."
          },
          "120903": {
            "name": "Sword Savant",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "120904": {
            "name": "Searing Sting",
            "desc": "When the current HP percentage is <unbreak>#1[i]%</unbreak> or higher, Ice RES PEN increases by <unbreak>#2[i]%</unbreak>."
          },
          "120905": {
            "name": "Surging Strife",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "120906": {
            "name": "Swift Swoop",
            "desc": "If the buffs from Soulsteel Sync or the Ultimate are in effect when an enemy is defeated, the duration of these buffs is extended by 1 turn."
          }
        },
        "Effects": {
          "10012091": {
            "name": "Soulsteel Sync",
            "desc": "Increases CRIT Rate by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> and CRIT DMG by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1209,
            "ID": 10012091
          },
          "10012092": {
            "name": "Amidst the Raining Bliss",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1209,
            "ID": 10012092
          },
          "10012093": {
            "name": "Searing Sting",
            "desc": "Ice RES PEN +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Ice RES PEN",
            "source": 1209,
            "ID": 10012093
          },
          "10012094": {
            "name": "The One True Sword",
            "desc": "Increases DMG dealt to enemies whose current HP percentage is higher than or equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1209,
            "ID": 10012094
          },
          "10012095": {
            "name": "SPD Boost",
            "desc": "SPD +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1209,
            "ID": 10012095
          }
        },
        "Traces": {
          "A2": {
            "name": "Icing on the Kick",
            "desc": "When Yanqing attacks, deals Additional Ice DMG equal to <unbreak>#1[i]%</unbreak> of Yanqing's ATK to enemies with Ice Weakness.",
            "owner": 1209,
            "ID": 1209101,
            "Ascension": 2
          },
          "A4": {
            "name": "Frost Favors the Brave",
            "desc": "When Soulsteel Sync is active, Effect RES increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1209,
            "ID": 1209102,
            "Ascension": 4
          },
          "A6": {
            "name": "Gentle Blade",
            "desc": "When a CRIT Hit is triggered, increases SPD by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1209,
            "ID": 1209103,
            "Ascension": 6
          }
        }
      },
      "1210": {
        "Name": "Guinaifen",
        "Abilities": {
          "121001": {
            "name": "Standing Ovation",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Guinaifen's ATK to a single enemy."
          },
          "121002": {
            "name": "Blazing Welcome",
            "desc": "Deals Fire DMG to a single enemy and minor Fire DMG to adjacent enemies, with a high chance of <color=#f29e38ff>Burning</color> them.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Guinaifen's ATK to a single enemy and Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Guinaifen's ATK to any adjacent enemies, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> to Burn the target and adjacent targets. When Burned, enemies will take a Fire DoT equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Guinaifen's ATK at the beginning of each turn, lasting for <unbreak>#5[i]</unbreak> turn(s)."
          },
          "121003": {
            "name": "Watch This Showstopper",
            "desc": "Deals Fire DMG to all enemies. If the enemies are inflicted with Burn, the Burn status deals DMG 1 extra time.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Guinaifen's ATK to all enemies. If the target enemy is currently inflicted with Burn, then their Burn status immediately produces DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of their original DMG."
          },
          "121004": {
            "name": "PatrAeon Benefits",
            "desc": "After the <color=#f29e38ff>Burn status causes DMG</color> on the enemy, there is a high chance of applying <color=#f29e38ff>Firekiss</color> to the enemy.",
            "longdesc": "When Guinaifen is on the field, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to apply Firekiss to an enemy after their Burn status causes DMG. While inflicted with Firekiss, the enemy receives <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color> increased DMG, which lasts for <unbreak>#5[i]</unbreak> turn(s) and can stack up to <unbreak>#6[i]</unbreak> time(s)."
          },
          "121006": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121007": {
            "name": "Skill Showcase",
            "desc": "Attacks the enemy. After entering battle, deals minor Fire DMG to a single target while applying <color=#f29e38ff>Firekiss</color>, with a total of 4 Bounces.",
            "longdesc": "Immediately attacks the enemy. After entering battle, deals DMG for <unbreak>#2[i]</unbreak> time(s), dealing Fire DMG equal to <unbreak>#1[i]%</unbreak> of Guinaifen's ATK to a random single enemy target each time, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> of inflicting Firekiss on them."
          }
        },
        "Eidolons": {
          "121001": {
            "name": "Slurping Noodles During Handstand",
            "desc": "When Skill is used, there is a <unbreak>#1[i]%</unbreak> base chance to reduce the attacked target enemy's Effect RES by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "121002": {
            "name": "Brushing Teeth While Whistling",
            "desc": "When an enemy target is being Burned, the DMG multiplier of the Burn status applied by her Basic ATK or Skill increases by <unbreak>#1[i]%</unbreak>."
          },
          "121003": {
            "name": "Smashing Boulder on Chest",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121004": {
            "name": "Blocking Pike with Neck",
            "desc": "Every time the Burn status inflicted by Guinaifen causes DMG, Guinaifen regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "121005": {
            "name": "Swallowing Sword to Stomach",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121006": {
            "name": "Catching Bullet with Hands",
            "desc": "Increases the stackable Firekiss count by <unbreak>#1[i]</unbreak>."
          }
        },
        "Effects": {
          "10012103": {
            "name": "Firekiss",
            "desc": "Received DMG increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "Firekiss",
            "source": 1210,
            "ID": 10012103
          },
          "10012105": {
            "name": "Slurping Noodles During Handstand",
            "desc": "Effect RES reduces by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Reduction",
            "source": 1210,
            "ID": 10012105
          }
        },
        "Traces": {
          "A2": {
            "name": "High Poles",
            "desc": "Basic ATK has a <unbreak>#1[i]%</unbreak> base chance of inflicting an enemy with a Burn, equivalent to that of Skill.",
            "owner": 1210,
            "ID": 1210101,
            "Ascension": 2
          },
          "A4": {
            "name": "Bladed Hoop",
            "desc": "When the battle begins, Guinaifen's action is advanced forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1210,
            "ID": 1210102,
            "Ascension": 4
          },
          "A6": {
            "name": "Walking on Knives",
            "desc": "Deals <unbreak>#1[i]%</unbreak> more DMG to Burned enemies.",
            "owner": 1210,
            "ID": 1210103,
            "Ascension": 6
          }
        }
      },
      "1211": {
        "Name": "Bailu",
        "Abilities": {
          "121101": {
            "name": "Diagnostic Kick",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Bailu's ATK to a single enemy."
          },
          "121102": {
            "name": "Singing Among Clouds",
            "desc": "Restores HP for a single ally, then heals random allies.",
            "longdesc": "Heals a single ally for <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Bailu's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. Bailu then heals random allies <unbreak>#4[i]</unbreak> time(s). After each healing, HP restored from the next healing is reduced by <unbreak>#3[i]%</unbreak>."
          },
          "121103": {
            "name": "Felicitous Thunderleap",
            "desc": "Restores HP for all allies, and grants them Invigoration, or prolongs the duration of their Invigoration.",
            "longdesc": "Heals all allies for <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Bailu's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>.\\nBailu applies Invigoration to allies that are not already Invigorated. For those already Invigorated, Bailu extends the duration of their Invigoration by 1 turn.\\nThe effect of Invigoration can last for <unbreak>#3[i]</unbreak> turn(s). This effect cannot stack."
          },
          "121104": {
            "name": "Gourdful of Elixir",
            "desc": "When an ally with <color=#f29e38ff>Invigoration</color> is attacked, <color=#f29e38ff>restores HP</color> for the ally.\\nWhen an ally suffers a <color=#f29e38ff>killing blow</color>, Bailu <color=#f29e38ff>immediately restores their HP</color>. This effect can only trigger 1 time per battle.",
            "longdesc": "After an ally with Invigoration is hit, restores the ally's HP for <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Bailu's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. This effect can trigger <unbreak>#5[i]</unbreak> time(s).\\nWhen an ally receives a killing blow, they will not be <u>knocked down</u>. Bailu immediately heals the ally for <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of Bailu's Max HP plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color> HP. This effect can be triggered 1 time per battle."
          },
          "121106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121107": {
            "name": "Saunter in the Rain",
            "desc": "After this character uses Technique, at the start of the next battle, all allies are granted Invigoration.",
            "longdesc": "After Technique is used, at the start of the next battle, all allies are granted Invigoration for <unbreak>#1[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "121101": {
            "name": "Ambrosial Aqua",
            "desc": "If the target ally's current HP is equal to their Max HP when Invigoration ends, regenerates <unbreak>#1[i]</unbreak> extra Energy for this target."
          },
          "121102": {
            "name": "Sylphic Slumber",
            "desc": "After using her Ultimate, Bailu's Outgoing Healing increases by an additional <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "121103": {
            "name": "Omniscient Opulence",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121104": {
            "name": "Evil Excision",
            "desc": "Every healing provided by the Skill makes the recipient deal <unbreak>#1[i]%</unbreak> more DMG for <unbreak>#3[i]</unbreak> turn(s). This effect can stack up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "121105": {
            "name": "Waning Worries",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121106": {
            "name": "Drooling Drop of Draconic Divinity",
            "desc": "Bailu can heal allies who received a killing blow <unbreak>#1[i]</unbreak> more time(s) in a single battle."
          }
        },
        "Effects": {
          "10012111": {
            "name": "Invigoration",
            "desc": "Restores HP when attacked.",
            "effect": "Invigoration",
            "source": 1211,
            "ID": 10012111
          },
          "10012112": {
            "name": "Qihuang Analects",
            "desc": "Max HP +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Max HP Boost",
            "source": 1211,
            "ID": 10012112
          },
          "10012113": {
            "name": "Aquatic Benediction",
            "desc": "Reduces DMG taken by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 1211,
            "ID": 10012113
          },
          "10012114": {
            "name": "Sylphic Slumber",
            "desc": "Increases Outgoing Healing by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Outgoing Healing Boost",
            "source": 1211,
            "ID": 10012114
          },
          "10012115": {
            "name": "Evil Excision",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1211,
            "ID": 10012115
          }
        },
        "Traces": {
          "A2": {
            "name": "Qihuang Analects",
            "desc": "When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turns.",
            "owner": 1211,
            "ID": 1211101,
            "Ascension": 2
          },
          "A4": {
            "name": "Vidyadhara Ichor Lines",
            "desc": "Invigoration can trigger <unbreak>#1[i]</unbreak> more time(s).",
            "owner": 1211,
            "ID": 1211102,
            "Ascension": 4
          },
          "A6": {
            "name": "Aquatic Benediction",
            "desc": "Characters with Invigoration receive <unbreak>#1[i]%</unbreak> less DMG.",
            "owner": 1211,
            "ID": 1211103,
            "Ascension": 6
          }
        }
      },
      "1212": {
        "Name": "Jingliu",
        "Abilities": {
          "121201": {
            "name": "Lucent Moonglow",
            "desc": "Deals minor Ice DMG to a single enemy target.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jingliu's ATK to a single enemy."
          },
          "121202": {
            "name": "Transcendent Flash",
            "desc": "Deals Ice DMG to a target enemy and obtains <color=#f29e38ff>1 stack of Syzygy</color>.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jingliu's ATK to a single enemy and obtains <unbreak>#2[i]</unbreak> stack(s) of Syzygy."
          },
          "121203": {
            "name": "Florephemeral Dreamflux",
            "desc": "Deals massive Ice DMG to a target enemy and deals Ice DMG to adjacent targets. Obtains <color=#f29e38ff>1 stack of Syzygy</color>.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jingliu's ATK to a single enemy, and deals Ice DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Jingliu's ATK to any adjacent enemies. Gains <unbreak>#2[i]</unbreak> stack(s) of Syzygy after attack ends."
          },
          "121204": {
            "name": "Crescent Transmigration",
            "desc": "When possessing <color=#f29e38ff><unbreak>#5[i]</unbreak></color> stacks of Syzygy, Jingliu enters the Spectral Transmigration state with her <color=#f29e38ff>Action Advanced by <unbreak>100%</unbreak></color>, her CRIT Rate increased, and her <color=#f29e38ff>Skill becoming Enhanced</color>. Using an attack in this state consumes HP from all other allies and <color=#f29e38ff>increases Jingliu's ATK</color> according to the total HP consumed. When Syzygy stacks become 0, exits the Spectral Transmigration state.",
            "longdesc": "When Jingliu has <unbreak>#5[i]</unbreak> stack(s) of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by <unbreak>#6[i]%</unbreak> and her CRIT Rate increases by <color=#f29e38ff><unbreak>#7[i]%</unbreak></color>. Then, Jingliu's Skill \"Transcendent Flash\" is enhanced to \"Moon On Glacial River,\" and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies equal to <unbreak>#2[i]%</unbreak> of their respective Max HP (this cannot reduce allies' HP to lower than 1). Jingliu's ATK increases by <unbreak>#3[i]%</unbreak> of the total HP consumed from all allies in this attack, capped at <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state."
          },
          "121206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121207": {
            "name": "Shine of Truth",
            "desc": "Creates a Special Dimension around the character. Enemies within this dimension will become <color=#f29e38ff>Frozen</color>. After entering combat with enemies in the dimension, this character regenerates Energy and obtains 1 stack of Syzygy with a high chance to <color=#f29e38ff>Freeze</color> enemies.",
            "longdesc": "After using this Technique, creates a Special Dimension around Jingliu that lasts for <unbreak>#3[i]</unbreak> seconds, and all enemies in this Special Dimension will become Frozen. After entering combat with enemies in the Special Dimension, Jingliu immediately regenerates <unbreak>#6[i]</unbreak> Energy and obtains <unbreak>#1[i]</unbreak> stack(s) of Syzygy, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> of Freezing enemy targets for <unbreak>#4[i]</unbreak> turn(s). While Frozen, enemy targets cannot take action, and receive Ice <u>Additional DMG</u> equal to <unbreak>#5[i]%</unbreak> of Jingliu's ATK at the start of every turn. Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "121201": {
            "name": "Moon Crashes Tianguan Gate",
            "desc": "When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by <unbreak>#1[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to <unbreak>#2[i]%</unbreak> of Jingliu's ATK."
          },
          "121202": {
            "name": "Crescent Shadows Qixing Dipper",
            "desc": "After using Ultimate, increases the DMG of the next Enhanced Skill by <unbreak>#1[i]%</unbreak>."
          },
          "121203": {
            "name": "Halfmoon Gapes Mercurial Haze",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121204": {
            "name": "Lunarlance Shines Skyward Dome",
            "desc": "During the Spectral Transmigration state, the ATK gained from consuming allies' HP is additionally increased by <unbreak>#1[i]%</unbreak> of the total HP consumed from the entire team. The cap for ATK gained this way also increases by <unbreak>#2[i]%</unbreak>."
          },
          "121205": {
            "name": "Night Shades Astral Radiance",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121206": {
            "name": "Eclipse Hollows Corporeal Husk",
            "desc": "When Jingliu enters the Spectral Transmigration state, the Syzygy stack limit increases by 1, and Jingliu obtains <unbreak>#1[i]</unbreak> stack(s) of Syzygy. While she is in the Spectral Transmigration state, her CRIT DMG increases by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012121": {
            "name": "Spectral Transmigration",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1212,
            "ID": 10012121
          },
          "10012122": {
            "name": "Sword Champion",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1212,
            "ID": 10012122
          },
          "10012123": {
            "name": "Frost Wraith",
            "desc": "Ultimate deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> more DMG.",
            "effect": "DMG Boost",
            "source": 1212,
            "ID": 10012123
          },
          "10012124": {
            "name": "Deathrealm",
            "desc": "Increases Effect RES by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Boost",
            "source": 1212,
            "ID": 10012124
          },
          "10012125": {
            "name": "Eclipse Hollows Corporeal Husk",
            "desc": "CRIT DMG +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1212,
            "ID": 10012125
          },
          "10012126": {
            "name": "Moon Crashes Tianguan Gate",
            "desc": "CRIT DMG +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1212,
            "ID": 10012126
          },
          "10012127": {
            "name": "Spectral Transmigration",
            "desc": "CRIT Rate +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1212,
            "ID": 10012127
          },
          "10012128": {
            "name": "Crescent Shadows Qixing Dipper",
            "desc": "Increases DMG dealt by the next Enhanced Skill by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1212,
            "ID": 10012128
          }
        },
        "Traces": {
          "A2": {
            "name": "Deathrealm",
            "desc": "While in the Spectral Transmigration state, increases Effect RES by <unbreak>#1[i]%</unbreak>.",
            "owner": 1212,
            "ID": 1212101,
            "Ascension": 2
          },
          "A4": {
            "name": "Sword Champion",
            "desc": "After using Transcendent Flash, the next action will be Advanced Forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1212,
            "ID": 1212102,
            "Ascension": 4
          },
          "A6": {
            "name": "Frost Wraith",
            "desc": "While in the Spectral Transmigration state, increases DMG dealt by Ultimate by <unbreak>#1[i]%</unbreak>.",
            "owner": 1212,
            "ID": 1212103,
            "Ascension": 6
          }
        }
      },
      "1213": {
        "Name": "Dan Heng • Imbibitor Lunae",
        "Abilities": {
          "121301": {
            "name": "Beneficent Lotus",
            "desc": "Deals minor Imaginary DMG to a single enemy.",
            "longdesc": "Uses a 2-hit attack and deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dan Heng • Imbibitor Lunae's ATK to a single enemy target."
          },
          "121302": {
            "name": "Dracore Libre",
            "desc": "Enhances the Basic ATK Beneficent Lotus to <color=#f29e38ff>Transcendence</color>, <color=#f29e38ff>Divine Spear</color>, or <color=#f29e38ff>Fulgurant Leap</color>.",
            "longdesc": "Enhances Basic ATK. Enhancements may be applied up to 3 times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.\\nEnhanced once, Beneficent Lotus becomes Transcendence.\\nEnhanced twice, Beneficent Lotus becomes Divine Spear.\\nEnhanced thrice, Beneficent Lotus becomes Fulgurant Leap.\\nWhen using Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, for a max of <unbreak>#2[i]</unbreak> stacks. These stacks last until the end of his turn."
          },
          "121303": {
            "name": "Azure's Aqua Ablutes All",
            "desc": "Deals massive Imaginary DMG to a single enemy, deals Imaginary DMG to adjacent targets, and gains 2 Squama Sacrosancta, which can <color=#f29e38ff>offset</color> Dan Heng • Imbibitor Lunae's <color=#f29e38ff>consumption of skill points</color>. Consuming Squama Sacrosancta is considered equivalent to consuming skill points.",
            "longdesc": "Uses a 3-hit attack and deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains <unbreak>#3[i]</unbreak> Squama Sacrosancta.\\nIt's possible to hold up to <unbreak>#4[i]</unbreak> Squama Sacrosancta, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points."
          },
          "121304": {
            "name": "Righteous Heart",
            "desc": "Increases DMG for every hit dealt. This effect is stackable and lasts until the end of this character's turn.",
            "longdesc": "After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. This effect can stack up to <unbreak>#2[i]</unbreak> time(s), lasting until the end of his turn."
          },
          "121306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121307": {
            "name": "Heaven-Quelling Prismadrakon",
            "desc": "Enters the Leaping Dragon state. Attacking will cause this character to move forward rapidly for a set distance and attack all enemies touched. After entering combat via attacking enemies, deals Imaginary DMG to all enemies, and gains 1 Squama Sacrosancta.",
            "longdesc": "After using his Technique, Dan Heng • Imbibitor Lunae enters the Leaping Dragon state for <unbreak>#2[i]</unbreak> seconds. While in the Leaping Dragon state, using his attack enables him to move forward rapidly for a set distance, attacking all enemies he touches and blocking all incoming attacks. After entering combat via attacking enemies in the Leaping Dragon state, Dan Heng • Imbibitor Lunae deals Imaginary DMG equal to <unbreak>#3[i]%</unbreak> of his ATK to all enemies, and gains <unbreak>#1[i]</unbreak> Squama Sacrosancta."
          }
        },
        "Eidolons": {
          "121301": {
            "name": "Tethered to Sky",
            "desc": "Increases the stackable Righteous Heart count by <unbreak>#1[i]</unbreak>, and gains 1 extra stack of Righteous Heart for each hit during an attack."
          },
          "121302": {
            "name": "Imperium On Cloud Nine",
            "desc": "After using his Ultimate, Dan Heng • Imbibitor Lunae's action is Advanced Forward by <unbreak>100%</unbreak> and gains 1 extra Squama Sacrosancta."
          },
          "121303": {
            "name": "Clothed in Clouds",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121304": {
            "name": "Zephyr's Bliss",
            "desc": "The buff effect granted by Outroar lasts until the end of this character's next turn."
          },
          "121305": {
            "name": "Fall is the Pride",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121306": {
            "name": "Reign, Returned",
            "desc": "After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next Fulgurant Leap attack increases by <unbreak>#1[i]%</unbreak>. This effect can stack up to <unbreak>#2[i]</unbreak> time(s)."
          }
        },
        "Effects": {
          "10012131": {
            "name": "Outroar",
            "desc": "Each stack increases CRIT DMG dealt by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "source": 1213,
            "ID": 10012131
          },
          "10012132": {
            "name": "Squama Sacrosancta",
            "desc": "Can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. A maximum of <color=#f29e38ff><unbreak>#1[i]</unbreak></color> Squama Sacrosancta can be possessed at any given time. Consuming Squama Sacrosancta is considered equivalent to consuming Skill Points.",
            "source": 1213,
            "ID": 10012132
          },
          "10012133": {
            "name": "Righteous Heart",
            "desc": "Each stack increases DMG dealt by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "source": 1213,
            "ID": 10012133
          },
          "10012134": {
            "name": "Reign, Returned",
            "desc": "Increase Imaginary RES PEN by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> for this character's next Fulgurant Leap attack.",
            "effect": "Imaginary RES PEN",
            "source": 1213,
            "ID": 10012134
          },
          "10012135": {
            "name": "Reign, Returned",
            "desc": "The \"Reign, Returned\" effect cannot be triggered yet.",
            "source": 1213,
            "ID": 10012135
          }
        },
        "Traces": {
          "A2": {
            "name": "Star Veil",
            "desc": "At the start of the battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1213,
            "ID": 1213101,
            "Ascension": 2
          },
          "A4": {
            "name": "Aqua Reign",
            "desc": "Increases the chance to resist Crowd Control debuffs by <unbreak>#1[i]%</unbreak>.",
            "owner": 1213,
            "ID": 1213102,
            "Ascension": 4
          },
          "A6": {
            "name": "Jolt Anew",
            "desc": "When dealing DMG to enemy targets with Imaginary Weakness, CRIT DMG increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1213,
            "ID": 1213103,
            "Ascension": 6
          }
        }
      },
      "1214": {
        "Name": "Xueyi",
        "Abilities": {
          "121401": {
            "name": "Mara-Sunder Awl",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Xueyi's ATK as Quantum DMG to a single target enemy."
          },
          "121402": {
            "name": "Iniquity Obliteration",
            "desc": "Deals Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Xueyi's ATK to a single enemy, and Quantum DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Xueyi's ATK to any adjacent enemies."
          },
          "121403": {
            "name": "Divine Castigation",
            "desc": "Deals massive Quantum DMG to a single enemy. This attack <color=#f29e38ff>ignores Weakness Types</color> and reduces the target's Toughness. The more Toughness is reduced, the higher the DMG will be dealt.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the Quantum Weakness Break effect is triggered.\\nIn this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> increase."
          },
          "121404": {
            "name": "Karmic Perpetuation",
            "desc": "When Xueyi or her allies reduce enemy Toughness with attacks, she gains stacks of Karma. When Karma reaches the max number of stacks, <color=#f29e38ff>immediately launches a <u>follow-up attack</u></color>, dealing minor Quantum DMG to a single enemy target, bouncing for 3 times and consuming all Karma.",
            "longdesc": "When Xueyi reduces enemy Toughness with attacks, Karma will be stacked. The more Toughness is reduced, the more stacks of Karma are added, up to <unbreak>#1[i]</unbreak> stacks.\\nWhen Xueyi's allies reduce enemy Toughness with attacks, Xueyi gains <unbreak>#3[i]</unbreak> stack(s) of Karma.\\nWhen Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a <u>follow-up attack</u> against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Xueyi's ATK to a single random enemy. This follow-up attack will not add Karma stacks."
          },
          "121406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121407": {
            "name": "Summary Execution",
            "desc": "Attacks the enemy. After entering battle, deals minor Quantum DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. After entering combat, deals <unbreak>#1[i]%</unbreak> of Xueyi's ATK as Quantum DMG to all enemies."
          }
        },
        "Eidolons": {
          "121401": {
            "name": "Dvesha, Inhibited",
            "desc": "Increases the DMG dealt by the Talent's follow-up attack by <unbreak>#1[i]%</unbreak>."
          },
          "121402": {
            "name": "Klesha, Breached",
            "desc": "Talent's follow-up attack reduces enemy Toughness regardless of Weakness types. At the same time, restores Xueyi's HP by an amount equal to <unbreak>#1[i]%</unbreak> of her Max HP. When breaking Weakness, triggers the Quantum Break Effect."
          },
          "121403": {
            "name": "Duḥkha, Ceased",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121404": {
            "name": "Karma, Severed",
            "desc": "When using Ultimate, increases Break Effect by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "121405": {
            "name": "Deva, Enthralled",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121406": {
            "name": "Saṃsāra, Mastered",
            "desc": "The max stack limit for Karma decreases to <unbreak>#1[i]</unbreak>."
          }
        },
        "Effects": {
          "10012141": {
            "name": "Perspicacious Mainframe",
            "desc": "<color=#f29e38ff><unbreak>#1[i]</unbreak></color> overflowing Karma stacks.",
            "source": 1214,
            "ID": 10012141
          },
          "10012142": {
            "name": "Karma",
            "desc": "When Karma is fully stacked, consume all Karma stacks and immediately use 1 follow-up attack against enemies.",
            "source": 1214,
            "ID": 10012142
          },
          "10012143": {
            "name": "Break Effect Boost",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 1214,
            "ID": 10012143
          }
        },
        "Traces": {
          "A2": {
            "name": "Clairvoyant Loom",
            "desc": "Increases DMG dealt by this unit by an amount equal to <unbreak>#1[i]%</unbreak> of Break Effect, up to a maximum DMG increase of <unbreak>#2[i]%</unbreak>.",
            "owner": 1214,
            "ID": 1214101,
            "Ascension": 2
          },
          "A4": {
            "name": "Intrepid Rollerbearings",
            "desc": "If the enemy target's Toughness is equal to or higher than <unbreak>#1[i]%</unbreak> of their Max Toughness, deals <unbreak>#2[i]%</unbreak> more DMG when using Ultimate.",
            "owner": 1214,
            "ID": 1214102,
            "Ascension": 4
          },
          "A6": {
            "name": "Perspicacious Mainframe",
            "desc": "Xueyi will keep a tally of the number of Karma stacks that exceed the max stack limit, up to <unbreak>#1[i]</unbreak> stacks in the tally. After Xueyi's Talent is triggered, she will gain a corresponding number of tallied Karma stacks.",
            "owner": 1214,
            "ID": 1214103,
            "Ascension": 6
          }
        }
      },
      "1215": {
        "Name": "Hanya",
        "Abilities": {
          "121501": {
            "name": "Oracle Brush",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hanya's ATK to a single enemy."
          },
          "121502": {
            "name": "Samsara, Locked",
            "desc": "Deals Physical DMG to a single enemy and applies Burden to them. For every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies <color=#f29e38ff>recover 1 Skill Point</color>.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Hanya's ATK to a single target enemy, then applies Burden to them.\\nFor every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies will immediately recover 1 Skill Point. Burden is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered <unbreak>#2[i]</unbreak> times."
          },
          "121503": {
            "name": "Ten-Lords' Decree, All Shall Obey",
            "desc": "Increases an ally's <color=#f29e38ff>SPD and ATK</color>.",
            "longdesc": "Increases the SPD of a target ally by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of Hanya's SPD and increases the same target ally's ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "121504": {
            "name": "Sanction",
            "desc": "Ally deals more DMG when attacking enemies inflicted with Burden.",
            "longdesc": "When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "121506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121507": {
            "name": "Netherworld Judgment",
            "desc": "Attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.",
            "longdesc": "Immediately attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy."
          }
        },
        "Eidolons": {
          "121501": {
            "name": "One Heart",
            "desc": "When an ally with Hanya's Ultimate's effect defeats an enemy, Hanya's action is Advanced Forward by <unbreak>#1[i]%</unbreak>. This effect can only be triggered <unbreak>#2[i]</unbreak> time(s) per turn."
          },
          "121502": {
            "name": "Two Views",
            "desc": "After using the Skill, this character's SPD increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "121503": {
            "name": "Three Temptations",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121504": {
            "name": "Four Truths",
            "desc": "The Ultimate's duration is additionally extended for <unbreak>#1[i]</unbreak> turn(s)."
          },
          "121505": {
            "name": "Five Skandhas",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121506": {
            "name": "Six Reverences",
            "desc": "Increase the DMG Boost effect of the Talent by an additional <unbreak>#1[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012151": {
            "name": "Edict",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and SPD by <color=#f29e38ff><unbreak>#2[i]</unbreak></color> points.",
            "effect": "ATK & SPD Boost",
            "source": 1215,
            "ID": 10012151
          },
          "10012152": {
            "name": "Burden",
            "desc": "For every 2 Basic Attacks, Skills, or Ultimates allies use on an enemy with Burden, recover 1 Skill Point.",
            "effect": "Burden",
            "source": 1215,
            "ID": 10012152
          },
          "10012153": {
            "name": "Six Reverences",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1215,
            "ID": 10012153
          },
          "10012154": {
            "name": "Scrivener",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1215,
            "ID": 10012154
          },
          "10012155": {
            "name": "Two Views",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Two Views",
            "source": 1215,
            "ID": 10012155
          },
          "10012156": {
            "name": "Sanction",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1215,
            "ID": 10012156
          }
        },
        "Traces": {
          "A2": {
            "name": "Scrivener",
            "desc": "Allies triggering Burden's Skill Point recovery effect have their ATK increased by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1215,
            "ID": 1215101,
            "Ascension": 2
          },
          "A4": {
            "name": "Netherworld",
            "desc": "If the trigger count for the Burden's Skill Point recovery effect is <unbreak>#1[i]</unbreak> or lower when an enemy with Burden is defeated, then additionally recovers <unbreak>#2[i]</unbreak> Skill Point(s).",
            "owner": 1215,
            "ID": 1215102,
            "Ascension": 4
          },
          "A6": {
            "name": "Reanimated",
            "desc": "When Burden's Skill Point recovery effect is triggered, this character regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1215,
            "ID": 1215103,
            "Ascension": 6
          }
        }
      },
      "1217": {
        "Name": "Huohuo",
        "Abilities": {
          "121701": {
            "name": "Banner: Stormcaller",
            "desc": "Deals minor Wind DMG to a single enemy.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Huohuo's Max HP to a target enemy."
          },
          "121702": {
            "name": "Talisman: Protection",
            "desc": "Dispels 1 <u>debuff</u> from an ally and <color=#f29e38ff>restore HP</color> to that ally and their adjacent allies.",
            "longdesc": "Dispels <unbreak>#5[i]</unbreak> <u>debuff(s)</u> from a single target ally and immediately restores this ally's HP by an amount equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Huohuo's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of Huohuo's Max HP plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>."
          },
          "121703": {
            "name": "Tail: Spiritual Domination",
            "desc": "<color=#f29e38ff>Regenerates Energy</color> for all allies (excluding this character) and <color=#f29e38ff>increases their ATK</color>.",
            "longdesc": "Regenerates Energy for all allies (excluding this character) by an amount equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of their respective Max Energy. At the same time, increases their ATK by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "121704": {
            "name": "Possession: Ethereal Metaflow",
            "desc": "Huohuo gains Divine Provision after using her Skill. If Huohuo possesses Divine Provision when an ally's turn starts or when an ally uses Ultimate, <color=#f29e38ff>restores the ally's HP</color>. At the same time, <color=#f29e38ff>every ally</color> with low HP <color=#f29e38ff>receives healing once</color>. When Divine Provision is triggered to heal an ally, <color=#f29e38ff>dispel 1 <u>debuff</u> from that ally</color>.",
            "longdesc": "After using her Skill, Huohuo gains Divine Provision, lasting for <unbreak>#1[i]</unbreak> turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. If Huohuo has Divine Provision when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of Huohuo's Max HP plus <color=#f29e38ff><unbreak>#5[i]</unbreak></color>. At the same time, every ally with <unbreak>#6[i]%</unbreak> HP percentage or lower receives healing once.\\nWhen Divine Provision is triggered to heal an ally, dispel <unbreak>#2[i]</unbreak> <u>debuff(s)</u> from that ally. This effect can be triggered up to <unbreak>#7[i]</unbreak> time(s). Using the skill again resets the effect's trigger count."
          },
          "121706": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121707": {
            "name": "Fiend: Impeachment of Evil",
            "desc": "Causes surrounding enemies to become Horror-Struck. After entering battle with enemies afflicted with Horror-Struck, there is a high chance of <color=#f29e38ff>reducing the ATK</color> of the enemy targets.",
            "longdesc": "Huohuo terrorizes surrounding enemies, afflicting Horror-Struck on them. Enemies in Horror-Struck will flee away from Huohuo for <unbreak>#4[i]</unbreak> second(s). When entering battle with enemies in Horror-Struck, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> of reducing every single enemy's ATK by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "121701": {
            "name": "Anchored to Vessel, Specters Nestled",
            "desc": "The duration of Divine Provision produced by the Talent is extended by <unbreak>#2[i]</unbreak> turn(s). When Huohuo possesses Divine Provision, all allies' SPD increases by <unbreak>#1[i]%</unbreak>."
          },
          "121702": {
            "name": "Sealed in Tail, Wraith Subdued",
            "desc": "If Huohuo possesses Divine Provision when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to <unbreak>#1[i]%</unbreak> of their Max HP. This reduces the duration of Divine Provision by 1 turn. This effect can only be triggered <unbreak>#2[i]</unbreak> time(s) per battle."
          },
          "121703": {
            "name": "Cursed by Fate, Moths to Flame",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121704": {
            "name": "Tied in Life, Bound to Strife",
            "desc": "When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is <unbreak>#1[i]%</unbreak>."
          },
          "121705": {
            "name": "Mandated by Edict, Evils Evicted",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121706": {
            "name": "Woven Together, Cohere Forever",
            "desc": "When healing a target ally, increases the target ally's DMG dealt by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Effects": {
          "10012172": {
            "name": "Divine Provision",
            "desc": "When an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Huohuo's Max HP plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>. At the same time, every ally currently at <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> HP percentage or lower receives healing once. When Divine Provision is triggered to provide healing for allies, dispel 1 debuff from the said ally. This effect's remaining trigger count is <color=#f29e38ff><unbreak>#4[i]</unbreak></color>.",
            "effect": "Healing Over Time",
            "source": 1217,
            "ID": 10012172
          },
          "10012173": {
            "name": "ATK Boost",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1217,
            "ID": 10012173
          },
          "10012174": {
            "name": "Energy Regeneration Rate Boost",
            "desc": "Increases Energy Regeneration Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Energy Regeneration Rate Boost",
            "source": 1217,
            "ID": 10012174
          },
          "10012175": {
            "name": "DMG Boost",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1217,
            "ID": 10012175
          },
          "10012176": {
            "name": "SPD Boost",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1217,
            "ID": 10012176
          },
          "10012177": {
            "name": "Horror-Struck",
            "desc": "Reduces ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Horror-Struck",
            "source": 1217,
            "ID": 10012177
          },
          "10012178": {
            "name": "Sealed in Tail, Wraith Subdued",
            "desc": "If Huohuo possesses Divine Provision when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of their Max HP. This reduces the duration of Divine Provision by 1 turn. The remaining trigger count is <color=#f29e38ff><unbreak>#2[i]</unbreak></color>.",
            "source": 1217,
            "ID": 10012178
          }
        },
        "Traces": {
          "A2": {
            "name": "Fearful to Act",
            "desc": "When battle starts, Huohuo gains Divine Provision, lasting for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1217,
            "ID": 1217101,
            "Ascension": 2
          },
          "A4": {
            "name": "The Cursed One",
            "desc": "The chance to resist Crowd Control Debuffs increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1217,
            "ID": 1217102,
            "Ascension": 4
          },
          "A6": {
            "name": "Stress Reaction to Horror",
            "desc": "When her Talent is triggered to heal allies, Huohuo regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1217,
            "ID": 1217103,
            "Ascension": 6
          }
        }
      },
      "1218": {
        "Name": "Jiaoqiu",
        "Abilities": {
          "121801": {
            "name": "Heart Afire",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jiaoqiu's ATK to a single target enemy."
          },
          "121802": {
            "name": "Scorch Onslaught",
            "desc": "Deals Fire DMG to a single enemy and minor Fire DMG to adjacent targets, with a high chance to inflict 1 stack of Ashen Roast on the primary target.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jiaoqiu's ATK to a single target enemy and Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Jiaoqiu's ATK to adjacent targets, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> to inflict 1 stack of Ashen Roast on the primary target."
          },
          "121803": {
            "name": "Pyrograph Arcanum",
            "desc": "Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG to all enemies. While inside the Zone, enemy targets <color=#f29e38ff>receive increased Ultimate DMG</color>, with a chance of being inflicted with 1 stack of Ashen Roast when taking action.",
            "longdesc": "Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jiaoqiu's ATK to all enemies.\\nWhile inside the Zone, enemy targets receive <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> increased Ultimate DMG, with a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to <unbreak>#5[i]</unbreak> time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.\\nThe Zone lasts for <unbreak>#4[i]</unbreak> turn(s), and its duration decreases by 1 at the start of this unit's every turn. If Jiaoqiu gets <u>knocked down</u>, the Zone will also be dispelled."
          },
          "121804": {
            "name": "Quartet Finesse, Octave Finery",
            "desc": "After attacking, there is a high chance to inflict 1 stack of Ashen Roast on the target, causing the enemy to take increased DMG and also be considered as Burned at the same time.",
            "longdesc": "When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>. Then, each subsequent stack increases this by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color>.\\nAshen Roast is capped at <unbreak>#4[i]</unbreak> stack(s) and lasts for <unbreak>#5[i]</unbreak> turn(s).\\nWhen an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to <color=#f29e38ff><unbreak>#6[i]%</unbreak></color> of Jiaoqiu's ATK at the start of each turn."
          },
          "121806": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "121807": {
            "name": "Fiery Queller",
            "desc": "Creates a Special Dimension. After entering combat with enemies in this dimension, deals minor Fire DMG to all enemies, with a high chance of applying 1 \"Ashen Roast\" stack.",
            "longdesc": "After using Technique, creates a Special Dimension that lasts for <unbreak>#2[i]</unbreak> second(s). After entering combat with enemies in this Special Dimension, deals Fire DMG equal to <unbreak>#1[i]%</unbreak> of Jiaoqiu's ATK to all enemies, with a <unbreak>#3[i]%</unbreak> <u>base chance</u> of applying 1 \"Ashen Roast\" stack. Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "121801": {
            "name": "Pentapathic Transference",
            "desc": "Allies deal <unbreak>#1[i]%</unbreak> increased DMG to enemy targets afflicted with Ashen Roast. Whenever inflicting Ashen Roast on an enemy target via triggering the Talent's effect, additionally increases the number of \"Ashen Roast\" stacks applied this time by <unbreak>#2[i]</unbreak>."
          },
          "121802": {
            "name": "From Savor Comes Suffer",
            "desc": "When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by <unbreak>#1[i]%</unbreak>."
          },
          "121803": {
            "name": "Flavored Euphony Reigns Supreme",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "121804": {
            "name": "Leisure In, Luster Out",
            "desc": "When the Zone exists, reduces enemy target's ATK by <unbreak>#1[i]%</unbreak>."
          },
          "121805": {
            "name": "Duel in Dawn, Dash in Dusk",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "121806": {
            "name": "Nonamorphic Pyrobind",
            "desc": "When an enemy target gets defeated, their accumulated \"Ashen Roast\" stacks will transfer to the enemy with the lowest number of \"Ashen Roast\" stacks on the battlefield. The maximum stack limit of Ashen Roast increases to <unbreak>#2[i]</unbreak>, and each \"Ashen Roast\" stack reduces the target's All-Type RES by <unbreak>#3[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012181": {
            "name": "Pyrograph Arcanum",
            "desc": "Enemy targets in the Zone take <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> increased Ultimate DMG, with a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to <color=#f29e38ff><unbreak>#3[i]</unbreak></color> time(s). And it can only trigger once per enemy turn. This effect can still trigger for <color=#f29e38ff><unbreak>#4[i]</unbreak></color> more time(s).",
            "effect": "Vulnerability",
            "source": 1218,
            "ID": 10012181
          },
          "10012182": {
            "name": "Leisure In, Luster Out",
            "desc": "ATK decreases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Reduction",
            "source": 1218,
            "ID": 10012182
          },
          "10012183": {
            "name": "Pyrograph Arcanum",
            "source": 1218,
            "ID": 10012183
          },
          "10012184": {
            "name": "Ashen Roast",
            "desc": "Increases DMG received by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. At the start of the turn, takes Additional Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Jiaoqiu's ATK.",
            "effect": "Ashen Roast",
            "source": 1218,
            "ID": 10012184
          },
          "10012185": {
            "name": "Pyre Cleanse",
            "desc": "Reduces Effect Hit Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. When taking action, receives Additional Fire DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Jiaoqiu's ATK.",
            "effect": "Effect Hit Rate Reduction",
            "source": 1218,
            "ID": 10012185
          },
          "10012186": {
            "name": "Hearth Kindle",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1218,
            "ID": 10012186
          },
          "10012187": {
            "name": "Nonamorphic Pyrobind",
            "desc": "Decreases All-Type RES by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1218,
            "ID": 10012187
          },
          "10012188": {
            "name": "Pentapathic Transference",
            "desc": "When an ally attacks an enemy target afflicted with Ashen Roast, increases the DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1218,
            "ID": 10012188
          },
          "10012189": {
            "name": "Ashen Roast",
            "desc": "Increases DMG received by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. This unit can be considered as Burned. While Ashen Roast is active, takes Fire DMG at the start of each turn.",
            "effect": "Ashen Roast",
            "source": 1218,
            "ID": 10012189
          }
        },
        "Traces": {
          "A2": {
            "name": "Pyre Cleanse",
            "desc": "When battle starts, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1218,
            "ID": 1218101,
            "Ascension": 2
          },
          "A4": {
            "name": "Hearth Kindle",
            "desc": "For every <unbreak>#2[i]%</unbreak> of Jiaoqiu's Effect Hit Rate that exceeds <unbreak>#1[i]%</unbreak>, additionally increases ATK by <unbreak>#3[i]%</unbreak>, up to <unbreak>#4[i]%</unbreak>.",
            "owner": 1218,
            "ID": 1218102,
            "Ascension": 4
          },
          "A6": {
            "name": "Seared Scent",
            "desc": "While the Zone exists, enemies entering combat will be inflicted with Ashen Roast. The number of stacks applied will match the highest number of \"Ashen Roast\" stacks possessed by any unit while the Zone is active, with a minimum of <unbreak>#1[i]</unbreak> stack(s).",
            "owner": 1218,
            "ID": 1218103,
            "Ascension": 6
          }
        }
      },
      "1220": {
        "Name": "Feixiao",
        "Abilities": {},
        "Eidolons": {
          "122001": {
            "name": "Skyward I Quell",
            "desc": "After launching \"Boltsunder Blitz\" or \"Waraxe Skyward,\" additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to <unbreak>#1[i]%</unbreak> of the original DMG, stacking up to <unbreak>#2[i]</unbreak> time(s) and lasting until the end of the Ultimate action."
          },
          "122002": {
            "name": "Moonward I Wish",
            "desc": "In the Talent's effect, for every 1 instance of follow-up attack launched by ally targets, Feixiao gains 1 point of \"Flying Aureus.\" This effect can trigger up to <unbreak>#1[i]</unbreak> time(s) per turn."
          },
          "122003": {
            "name": "Starward I Bode",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "122004": {
            "name": "Stormward I Hear",
            "desc": "The follow-up attack from Talent has its Toughness Reduction increased by <unbreak>#1[i]%</unbreak>, and when it launches, increases this unit's SPD by <unbreak>#2[i]%</unbreak>, lasting for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "122005": {
            "name": "Heavenward I Leap",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "122006": {
            "name": "Homeward I Near",
            "desc": "Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by <unbreak>#1[i]%</unbreak>. Talent's follow-up attack DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012201": {
            "name": "Thunderhunt",
            "desc": "The Talent's follow-up attack can now be triggered.",
            "source": 1220,
            "ID": 10012201
          },
          "10012202": {
            "name": "Thunderhunt",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1220,
            "ID": 10012202
          },
          "10012203": {
            "name": "Boltcatch",
            "desc": "ATK increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1220,
            "ID": 10012203
          },
          "10012204": {
            "name": "Stormward I Hear",
            "desc": "SPD increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1220,
            "ID": 10012204
          },
          "10012205": {
            "name": "Skyward I Quell",
            "desc": "Each stack additionally increases the multiplier for the Ultimate DMG dealt by an amount equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the original DMG multiplier.",
            "source": 1220,
            "ID": 10012205
          },
          "10012206": {
            "name": "Moonward I Wish",
            "desc": "In the Talent's effect, for every 1 instance of follow-up attack launched by ally targets, Feixiao gains 1 point of \"Flying Aureus.\" This effect can still trigger <color=#f29e38ff><unbreak>#1[i]</unbreak></color> time(s).",
            "source": 1220,
            "ID": 10012206
          }
        },
        "Traces": {
          "A2": {
            "name": "Heavenpath",
            "desc": "When the battle starts, gains <unbreak>#1[i]</unbreak> point(s) of \"Flying Aureus.\"\\nAt the start of a turn, if no follow-up attack was launched via Talent in the previous turn, then this counts as 1 toward the number of attacks required to gain \"Flying Aureus.\"",
            "owner": 1220,
            "ID": 1220101,
            "Ascension": 2
          },
          "A4": {
            "name": "Formshift",
            "desc": "When using Ultimate to deal DMG to an enemy target, it is considered as a follow-up attack. Follow-up attacks' CRIT DMG increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1220,
            "ID": 1220102,
            "Ascension": 4
          },
          "A6": {
            "name": "Boltcatch",
            "desc": "When using Skill, increases ATK by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1220,
            "ID": 1220103,
            "Ascension": 6
          }
        }
      },
      "1221": {
        "Name": "Yunli",
        "Abilities": {
          "122101": {
            "name": "Galespin Summersault",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yunli's ATK to a single target enemy."
          },
          "122102": {
            "name": "Bladeborne Quake",
            "desc": "Restores this unit's HP and deals minor Physical DMG to a single enemy and adjacent targets.",
            "longdesc": "Restores HP equal to <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> of Yunli's ATK plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>. Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yunli's ATK to a single target enemy and Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Yunli's ATK to adjacent targets."
          },
          "122103": {
            "name": "Earthbind, Etherbreak",
            "desc": "Enters \"Parry\" and taunts all enemies. When attacked during this period, triggers <color=#f29e38ff>powerful <u>Counter</u></color> and <color=#f29e38ff>deals Physical DMG</color> to the attacker and adjacent targets. Then, deals minor Physical DMG to a single enemy that bounces 6 times. If no Counter is triggered while Parry is active, deals Physical DMG to a random enemy target and adjacent targets when Parry ends.",
            "longdesc": "Consumes <unbreak>#8[i]</unbreak> Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next ally's or enemy's turn. Increases the CRIT DMG dealt by Yunli's next Counter by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. When triggering the Counter effect from Talent, launches the <u>Counter</u> \"Intuit: Cull\" instead and removes the Parry effect. If no Counter is triggered while Parry is active, Yunli will immediately launch the <u>Counter</u> \"Intuit: Slash\" on a random enemy target.\\n\\n\"Intuit: Slash\": Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yunli's ATK to the target, and deals Physical DMG equal to <color=#f29e38ff><unbreak>#6[i]%</unbreak></color> of Yunli's ATK to adjacent targets.\\n\"Intuit: Cull\": Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yunli's ATK to the target, and deals Physical DMG equal to <color=#f29e38ff><unbreak>#6[i]%</unbreak></color> of Yunli's ATK to adjacent targets. Then, additionally deals <unbreak>#4[i]</unbreak> instances of DMG, each dealing Physical DMG equal to <color=#f29e38ff><unbreak>#7[i]%</unbreak></color> of Yunli's ATK to a random single enemy.\\n\\nWhen Yunli deals DMG via this ability, it's considered as dealing Ultimate DMG."
          },
          "122104": {
            "name": "Flashforge",
            "desc": "When Yunli gets attacked by an enemy target, additionally regenerates Energy and immediately launches a <u>Counter</u> against the attacker and adjacent targets.",
            "longdesc": "When Yunli gets attacked by an enemy target, additionally regenerates <unbreak>#3[i]</unbreak> Energy and immediately launches a <u>Counter</u> on the attacker, dealing Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Yunli's ATK to the attacker and Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Yunli's ATK to adjacent targets.\\nIf there is no immediate target to Counter, then Counters a random enemy target instead."
          },
          "122106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "122107": {
            "name": "Posterior Precedence",
            "desc": "This unit gains the Ward effect, lasting for <unbreak>20</unbreak> seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts \"Intuit: Cull\" on a random enemy.",
            "longdesc": "This unit gains the Ward effect, lasting for <unbreak>#2[i]</unbreak> seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts \"Intuit: Cull\" on a random enemy, and increases the DMG dealt by this attack by <unbreak>#1[i]%</unbreak>."
          }
        },
        "Eidolons": {
          "122101": {
            "name": "Weathered Blade Does Not Sully",
            "desc": "Increases DMG dealt by \"Intuit: Slash\" and \"Intuit: Cull\" by <unbreak>#1[i]%</unbreak>. Increases the number of additional DMG instances for \"Intuit: Cull\" by <unbreak>#2[i]</unbreak>."
          },
          "122102": {
            "name": "First Luster Breaks Dawn",
            "desc": "When dealing DMG via Counter, ignores <unbreak>#1[i]%</unbreak> of the target's DEF."
          },
          "122103": {
            "name": "Mastlength Twirls Mountweight",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "122104": {
            "name": "Artisan's Ironsong",
            "desc": "After launching \"Intuit: Slash\" or \"Intuit: Cull,\" increases this unit's Effect RES by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "122105": {
            "name": "Blade of Old Outlasts All",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "122106": {
            "name": "Walk in Blade, Talk in Zither",
            "desc": "While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger \"Intuit: Cull\" and remove the \"Parry\" effect. When dealing DMG via \"Intuit: Slash\" or \"Intuit: Cull,\" increases CRIT Rate by <unbreak>#1[i]%</unbreak> and Physical RES PEN by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012211": {
            "name": "Imbalance",
            "desc": "Increases DMG dealt by Yunli to this unit by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Imbalance",
            "source": 1221,
            "ID": 10012211
          },
          "10012212": {
            "name": "Parry",
            "desc": "When triggering Talent's Counter effect, launches the Counter \"Intuit: Cull\" instead.",
            "effect": "Parry",
            "source": 1221,
            "ID": 10012212
          },
          "10012213": {
            "name": "True Sunder",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1221,
            "ID": 10012213
          },
          "10012214": {
            "name": "Demon Quell",
            "desc": "Resists Crowd Control debuffs received and reduces DMG received by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Resists Crowd Control debuffs",
            "source": 1221,
            "ID": 10012214
          },
          "10012215": {
            "name": "First Luster Breaks Dawn",
            "desc": "Increase CRIT Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1221,
            "ID": 10012215
          },
          "10012216": {
            "name": "Artisan's Ironsong",
            "desc": "Increases Effect RES by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Boost",
            "source": 1221,
            "ID": 10012216
          },
          "10012217": {
            "name": "Earthbind, Etherbreak",
            "desc": "Increases CRIT DMG dealt by the next Counter by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1221,
            "ID": 10012217
          }
        },
        "Traces": {
          "A2": {
            "name": "Fiery Wheel",
            "desc": "After each use of \"Intuit: Slash,\" the next \"Intuit: Slash\" will be replaced by \"Intuit: Cull.\"",
            "owner": 1221,
            "ID": 1221101,
            "Ascension": 2
          },
          "A4": {
            "name": "Demon Quell",
            "desc": "While in the Parry state, resists Crowd Control debuffs received and reduces DMG received by <unbreak>#1[i]%</unbreak>.",
            "owner": 1221,
            "ID": 1221102,
            "Ascension": 4
          },
          "A6": {
            "name": "True Sunder",
            "desc": "When using a Counter, increases Yunli's ATK by <unbreak>#1[i]%</unbreak>, lasting for 1 turn.",
            "owner": 1221,
            "ID": 1221103,
            "Ascension": 6
          }
        }
      },
      "1222": {
        "Name": "Lingsha",
        "Abilities": {},
        "Eidolons": {
          "122201": {
            "name": "Bloom on Vileward Bouquet",
            "desc": "Lingsha's Weakness Break Efficiency increases by <unbreak>#2[i]%</unbreak>. When an enemy unit's Weakness is Broken, reduces their DEF by <unbreak>#1[i]%</unbreak>."
          },
          "122202": {
            "name": "Leisure in Carmine Smokeveil",
            "desc": "When using Ultimate, increases all allies' Break Effect by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "122203": {
            "name": "Shine of Floral Wick",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "122204": {
            "name": "Redolence from Canopied Banquet",
            "desc": "When Fuyuan takes action, restores HP equal to <unbreak>#1[i]%</unbreak> of Lingsha's ATK for the ally whose current HP is the lowest."
          },
          "122205": {
            "name": "Poise Atop Twists and Turns",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "122206": {
            "name": "Arcadia Under Deep Seclusion",
            "desc": "While Fuyuan is on the field, reduces all enemies' All-Type RES by <unbreak>#1[i]%</unbreak>. When Fuyuan attacks, additionally deals <unbreak>#2[i]</unbreak> instance(s) of DMG, with each instance dealing both Fire DMG equal to <unbreak>#3[i]%</unbreak> of Lingsha's ATK and a Toughness Reduction of <unbreak>#4[i]</unbreak> to a single random enemy. This prioritizes targets with both Toughness greater than 0 and Fire Weakness."
          }
        },
        "Effects": {
          "10012221": {
            "name": "Bloom on Vileward Bouquet",
            "desc": "DEF decreases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1222,
            "ID": 10012221
          },
          "10012222": {
            "name": "Befog",
            "desc": "Break DMG taken increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Befog",
            "source": 1222,
            "ID": 10012222
          },
          "10012223": {
            "name": "Ember's Echo",
            "desc": "The Trace \"Ember's Echo\" effect's auto-trigger is still on cooldown.",
            "source": 1222,
            "ID": 10012223
          },
          "10012224": {
            "name": "Leisure in Carmine Smokeveil",
            "desc": "Break Effect increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 1222,
            "ID": 10012224
          },
          "10012225": {
            "name": "Arcadia Under Deep Seclusion",
            "desc": "All-Type RES decreases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "All-Type RES Reduction",
            "source": 1222,
            "ID": 10012225
          }
        },
        "Traces": {
          "A2": {
            "name": "Vermilion Waft",
            "desc": "Increases this unit's ATK or Outgoing Healing by an amount equal to <unbreak>#1[i]%</unbreak>/<unbreak>#2[i]%</unbreak> of Break Effect, up to a maximum increase of <unbreak>#3[i]%</unbreak>/<unbreak>#4[i]%</unbreak> respectively.",
            "owner": 1222,
            "ID": 1222101,
            "Ascension": 2
          },
          "A4": {
            "name": "Sylvan Smoke",
            "desc": "When using Basic ATK, additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1222,
            "ID": 1222102,
            "Ascension": 4
          },
          "A6": {
            "name": "Ember's Echo",
            "desc": "When Fuyuan is on the field and any ally character takes DMG or consumes HP, if a character in the team has their current HP percentage lower than or equal to <unbreak>#1[i]%</unbreak>, Fuyuan will immediately launch the Talent's follow-up attack. This does not consume Fuyuan's action count. This effect can trigger again after <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1222,
            "ID": 1222103,
            "Ascension": 6
          }
        }
      },
      "1223": {
        "Name": "Moze",
        "Abilities": {},
        "Eidolons": {
          "122301": {
            "name": "Oathkeeper",
            "desc": "After entering battle, Moze regenerates <unbreak>#2[i]</unbreak> Energy. Each time the Additional DMG from his Talent is triggered, Moze regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "122302": {
            "name": "Wrathbearer",
            "desc": "When all allies deal DMG to the enemy target marked as \"Prey,\" increases CRIT DMG by <unbreak>#1[i]%</unbreak>."
          },
          "122303": {
            "name": "Deathchaser",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "122304": {
            "name": "Heathprowler",
            "desc": "When using Ultimate, increases the DMG dealt by Moze by <unbreak>#1[f1]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "122305": {
            "name": "Truthbender",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "122306": {
            "name": "Faithbinder",
            "desc": "Increases the DMG multiplier of the Talent's follow-up attack by <unbreak>#1[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012231": {
            "name": "Prey",
            "desc": "This unit is marked as \"Prey.\" After every time it receives an attack, it will receive Lightning Additional DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Moze's ATK, and Moze will consume 1 point of Charge.",
            "effect": "Prey",
            "source": 1223,
            "ID": 10012231
          },
          "10012232": {
            "name": "DEF Reduction",
            "desc": "DEF decreases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1223,
            "ID": 10012232
          },
          "10012233": {
            "name": "DMG Boost",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1223,
            "ID": 10012233
          },
          "10012234": {
            "name": "Bated Wings",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1223,
            "ID": 10012234
          },
          "10012235": {
            "name": "Heathprowler",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1223,
            "ID": 10012235
          },
          "10012236": {
            "name": "Additional DMG Multiplier Boost",
            "desc": "Increases Additional DMG multiplier by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Additional DMG Multiplier Boost",
            "source": 1223,
            "ID": 10012236
          },
          "10012237": {
            "name": "ATK Boost",
            "desc": "ATK increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1223,
            "ID": 10012237
          },
          "10012238": {
            "name": "Vengewise",
            "desc": "Follow-up attack DMG taken increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Follow-up Attack DMG Vulnerability",
            "source": 1223,
            "ID": 10012238
          },
          "10012239": {
            "name": "Nightfeather",
            "desc": "The Trace \"Nightfeather\" effect's auto-trigger is still on cooldown.",
            "source": 1223,
            "ID": 10012239
          }
        },
        "Traces": {
          "A2": {
            "name": "Nightfeather",
            "desc": "After using the Talent's follow-up attack, recovers <unbreak>#1[i]</unbreak> Skill Point(s). This effect can trigger again after <unbreak>#2[i]</unbreak> turn(s).",
            "owner": 1223,
            "ID": 1223101,
            "Ascension": 2
          },
          "A4": {
            "name": "Daggerhold",
            "desc": "When Moze dispels his Departed state, his action advances by <unbreak>#1[i]%</unbreak>. At the start of each wave, Moze's action advances by <unbreak>#2[i]%</unbreak>.",
            "owner": 1223,
            "ID": 1223102,
            "Ascension": 4
          },
          "A6": {
            "name": "Vengewise",
            "desc": "When dealing DMG by using Ultimate, it is considered as having launched a follow-up attack. The follow-up attack DMG taken by \"Prey\" increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1223,
            "ID": 1223103,
            "Ascension": 6
          }
        }
      },
      "1224": {
        "Name": "March 7th",
        "Abilities": {
          "122401": {
            "name": "My Sword Zaps Demons",
            "desc": "Deals minor Imaginary DMG to a single enemy and gains <color=#f29e38ff><unbreak>#2[i]</unbreak></color> point(s) of Charge.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of March 7th's ATK to a single target enemy and gains <unbreak>#2[i]</unbreak> point(s) of Charge."
          },
          "122402": {
            "name": "Master, It's Tea Time!",
            "desc": "Makes a single ally become Shifu. When using Basic ATK or dealing Enhanced Basic ATK's DMG, triggers the corresponding effect based on <color=#f29e38ff>the Shifu's Path</color>:\\nErudition, Destruction, The Hunt: Deals <color=#f29e38ff><u>Additional DMG</u></color> based on Shifu's Type.\\nHarmony, Nihility, Preservation, Abundance: <color=#f29e38ff>Toughness Reduction</color> increases.",
            "longdesc": "Designates a single ally (excluding this unit) as Shifu and increases Shifu's SPD by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. Only the most recent target of March 7th's Skill is considered as Shifu.\\n\\n\\nWhenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if Shifu with the specified Path is present on the field:\\n\\nErudition, Destruction, The Hunt: Deals <u>Additional DMG</u> (DMG Type based on Shifu's Combat Type) equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of March 7th's ATK.\\n\\nHarmony, Nihility, Preservation, Abundance: Increases the Toughness Reduction of this instance of DMG by <unbreak>#3[i]%</unbreak>."
          },
          "122403": {
            "name": "March 7th, the Apex Heroine",
            "desc": "Deals Imaginary DMG to a single enemy and <color=#f29e38ff>increases</color> the Hits Per Action and DMG chance of <color=#f29e38ff>the next Enhanced Basic ATK</color>.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of March 7th's ATK to a single target enemy.\\nIncreases the initial Hits Per Action of the next Enhanced Basic ATK by <unbreak>#2[i]</unbreak> hits and increase the <u>fixed chance </u>of additionally dealing DMG by <unbreak>#3[i]%</unbreak>."
          },
          "122404": {
            "name": "Master, I've Ascended!",
            "desc": "After <color=#f29e38ff>Shifu uses an attack or Ultimate</color>, March 7th gains Charge. When reaching <color=#f29e38ff><unbreak>#1[i]</unbreak></color> points of Charge, March 7th immediately takes action and increases the DMG she deals. <color=#f29e38ff>Basic ATK gets Enhanced</color>.",
            "longdesc": "After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.\\nUpon reaching <unbreak>#1[i]</unbreak> or more points of Charge, March 7th immediately takes action and increases the DMG she deals by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes <unbreak>#1[i]</unbreak> point(s) of Charge. Charge is capped at <unbreak>#3[i]</unbreak> points."
          },
          "122406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "122407": {
            "name": "Feast in One Go",
            "desc": "Whenever an ally uses Technique, March 7th gains Charge upon entering the next battle. Using Technique regenerates Energy upon entering the next battle.",
            "longdesc": "If March 7th is on the team, she gains 1 point of Charge at the start of the next battle whenever an ally uses Technique, up to a max of <unbreak>#1[i]</unbreak> point(s).\\nAfter using Technique, March 7th regenerates <unbreak>#2[i]</unbreak> Energy when the next battle starts."
          }
        },
        "Eidolons": {
          "122401": {
            "name": "My Sword Stirs Starlight",
            "desc": "When Shifu is on the field, increases March 7th's SPD by <unbreak>#1[i]%</unbreak>."
          },
          "122402": {
            "name": "Blade Dances on Waves' Fight",
            "desc": "After Shifu uses Basic ATK or Skill to attack an enemy target, March 7th immediately launches a follow-up attack and deals Imaginary DMG equal to <unbreak>#1[i]%</unbreak> of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on Shifu's Path and then gains <unbreak>#3[i]</unbreak> point(s) of Charge. If there is no primary target available to attack, then attacks a single random enemy instead. This effect can only trigger once per turn."
          },
          "122403": {
            "name": "Sharp Wit in Martial Might",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "122404": {
            "name": "Being Fabulous Never Frights",
            "desc": "At the start of the turn, regenerates <unbreak>#1[i]</unbreak> Energy."
          },
          "122405": {
            "name": "Sword Delights, Sugar Blights",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "122406": {
            "name": "Me, the Best Girl in Sight",
            "desc": "After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by <unbreak>#1[i]%</unbreak>."
          }
        },
        "Effects": {
          "10012241": {
            "name": "Shifu",
            "desc": "After using an attack or Ultimate, <color=#f29e38ff>%CasterName</color> gains a max of 1 Charge point each time.",
            "effect": "Become Shifu",
            "source": 1224,
            "ID": 10012241
          },
          "10012242": {
            "name": "Charge",
            "desc": "When Charge equals to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> or more, immediately takes action and simultaneously increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. Additionally, Basic ATK gets Enhanced.",
            "source": 1224,
            "ID": 10012242
          },
          "10012243": {
            "name": "Master, It's Tea Time!",
            "desc": "Increases SPD of <color=#f29e38ff>%CasterName</color>'s Shifu by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1224,
            "ID": 10012243
          },
          "10012244": {
            "name": "March 7th, the Apex Heroine",
            "desc": "Increases the next Enhanced Basic ATK's initial Hits Per Action by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>. The fixed chance of additionally dealing DMG increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "Enhanced Basic Attack Boost",
            "source": 1224,
            "ID": 10012244
          },
          "10012245": {
            "name": "Blade Dances on Waves' Fight",
            "desc": "The \"Blade Dances on Waves' Fight\" effect cannot be triggered yet.",
            "source": 1224,
            "ID": 10012245
          },
          "10012246": {
            "name": "Tide Tamer",
            "desc": "Increases CRIT DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1224,
            "ID": 10012246
          },
          "10012247": {
            "name": "Tide Tamer",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 1224,
            "ID": 10012247
          },
          "10012248": {
            "name": "My Sword Stirs Starlight",
            "desc": "When Shifu is on the field, increases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1224,
            "ID": 10012248
          }
        },
        "Traces": {
          "A2": {
            "name": "Swan Soar",
            "desc": "When the battle starts, March 7th's action is Advanced Forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1224,
            "ID": 1224101,
            "Ascension": 2
          },
          "A4": {
            "name": "Filigree",
            "desc": "March 7th can reduce the Toughness of enemies whose Weakness Type is the same as Shifu's Combat Type. When Breaking Weakness, triggers the Imaginary Weakness Break effect.",
            "owner": 1224,
            "ID": 1224102,
            "Ascension": 4
          },
          "A6": {
            "name": "Tide Tamer",
            "desc": "After using Enhanced Basic ATK, increases Shifu's CRIT DMG by <unbreak>#1[i]%</unbreak> and Break Effect by <unbreak>#2[i]%</unbreak>, lasting for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 1224,
            "ID": 1224103,
            "Ascension": 6
          }
        }
      },
      "1301": {
        "Name": "Gallagher",
        "Abilities": {
          "130101": {
            "name": "Corkage Fee",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Gallagher's ATK to a single target enemy."
          },
          "130102": {
            "name": "Special Brew",
            "desc": "Immediately restores an ally's HP.",
            "longdesc": "Immediately heals a target ally for <color=#f29e38ff><unbreak>#1[i]</unbreak></color> HP."
          },
          "130103": {
            "name": "Champagne Etiquette",
            "desc": "<color=#f29e38ff>Inflicts Besotted</color> on all enemies and deals Fire DMG to them at the same time. Enhances the next Basic ATK to Nectar Blitz.",
            "longdesc": "Inflicts Besotted on all enemies, lasting for <unbreak>#2[i]</unbreak> turn(s). At the same time, deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Gallagher's ATK to all enemies, and enhances his next Basic ATK to Nectar Blitz."
          },
          "130104": {
            "name": "Tipsy Tussle",
            "desc": "The Besotted state <color=#f29e38ff>makes targets receive more Break DMG</color>. Every time the target gets attacked by an ally, <color=#f29e38ff>the attacker's HP is restored</color>.",
            "longdesc": "The Besotted state makes targets receive <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> more <u>Break DMG</u>. Every time a Besotted target gets attacked by an ally, the attacking ally's HP is restored by <color=#f29e38ff><unbreak>#2[i]</unbreak></color>."
          },
          "130106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130107": {
            "name": "Artisan Elixir",
            "desc": "Attacks the enemy. After entering battle, <color=#f29e38ff>inflicts Besotted</color> to all enemies and deals minor Fire DMG to all enemies.",
            "longdesc": "Immediately attacks the enemy. Upon entering battle, inflicts Besotted on all enemies, lasting for <unbreak>#1[i]</unbreak> turn(s). And deals Fire DMG equal to <unbreak>#2[i]%</unbreak> of Gallagher's ATK to all enemies."
          }
        },
        "Eidolons": {
          "130101": {
            "name": "Salty Dog",
            "desc": "When entering the battle, Gallagher regenerates <unbreak>#1[i]</unbreak> Energy and increases Effect RES by <unbreak>#2[i]%</unbreak>."
          },
          "130102": {
            "name": "Lion's Tail",
            "desc": "When using the Skill, removes <unbreak>#1[i]</unbreak> debuff(s) from the target ally. At the same time, increases their Effect RES by <unbreak>#2[i]%</unbreak>, lasting for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "130103": {
            "name": "Corpse Reviver",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130104": {
            "name": "Last Word",
            "desc": "Extends the duration of the Besotted state inflicted by Gallagher's Ultimate by <unbreak>#1[i]</unbreak> turn(s)."
          },
          "130105": {
            "name": "Death in the Afternoon",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130106": {
            "name": "Blood and Sand",
            "desc": "Increases Gallagher's Break Effect by <unbreak>#1[i]%</unbreak> and Weakness Break Efficiency by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10013011": {
            "name": "Besotted",
            "desc": "Increases the received Break DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. And every time this unit gets attacked by characters, the attacker will restore <color=#f29e38ff><unbreak>#2[i]</unbreak></color> HP.",
            "effect": "Besotted",
            "source": 1301,
            "ID": 10013011
          },
          "10013012": {
            "name": "ATK Reduction",
            "desc": "ATK decreases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "ATK Reduction",
            "source": 1301,
            "ID": 10013012
          },
          "10013013": {
            "name": "Effect RES Boost",
            "desc": "Increases Effect RES by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Boost",
            "source": 1301,
            "ID": 10013013
          }
        },
        "Traces": {
          "A2": {
            "name": "Novel Concoction",
            "desc": "Increases this unit's Outgoing Healing by an amount equal to <unbreak>#1[i]%</unbreak> of Break Effect, up to a maximum Outgoing Healing increase of <unbreak>#2[i]%</unbreak>.",
            "owner": 1301,
            "ID": 1301101,
            "Ascension": 2
          },
          "A4": {
            "name": "Organic Yeast",
            "desc": "After using the Ultimate, immediately Advances Forward this unit's Action by <unbreak>100%</unbreak>.",
            "owner": 1301,
            "ID": 1301102,
            "Ascension": 4
          },
          "A6": {
            "name": "Bottoms Up",
            "desc": "When Gallagher uses Nectar Blitz to attack Besotted enemies, the HP Restore effect of his Talent will also apply to other allies for this time.",
            "owner": 1301,
            "ID": 1301103,
            "Ascension": 6
          }
        }
      },
      "1302": {
        "Name": "Argenti",
        "Abilities": {
          "130201": {
            "name": "Fleeting Fragrance",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Argenti's ATK to a single target enemy."
          },
          "130202": {
            "name": "Justice, Hereby Blooms",
            "desc": "Deals minor Physical DMG to all enemies.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Argenti's ATK to all enemies."
          },
          "130203": {
            "name": "For In This Garden, Supreme Beauty Bestows",
            "desc": "Consumes <color=#f29e38ff><unbreak>#2[i]</unbreak></color> Energy and deals Physical DMG to all enemies.",
            "longdesc": "Consumes <unbreak>#2[i]</unbreak> Energy and deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Argenti's ATK to all enemies."
          },
          "130204": {
            "name": "Sublime Object",
            "desc": "When Argenti uses his Basic ATK, Skill, or Ultimate, he <color=#f29e38ff>regenerates Energy</color> and increases his <color=#f29e38ff>CRIT Rate</color> for every enemy target hit.",
            "longdesc": "For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by <unbreak>#1[i]</unbreak>, and grants him a stack of Apotheosis, increasing his CRIT Rate by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>. This effect can stack up to <unbreak>#3[i]</unbreak> time(s)."
          },
          "130206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130207": {
            "name": "Manifesto of Purest Virtue",
            "desc": "Inflicts Daze on all enemies within a set area. When attacking a Dazed enemy to enter combat, deals minor Physical DMG to all enemies and regenerates energy for Argenti.",
            "longdesc": "After using the Technique, enemies in a set area are inflicted with Daze for <unbreak>#1[i]</unbreak> second(s). Dazed enemies will not actively attack the team.\\nWhen attacking a Dazed enemy to enter combat, deals Physical DMG to all enemies equal to <unbreak>#2[i]%</unbreak> of Argenti's ATK and regenerates his Energy by <unbreak>#3[i]</unbreak>."
          }
        },
        "Eidolons": {
          "130201": {
            "name": "A Lacuna in Kingdom of Aesthetics",
            "desc": "Each stack of Apotheosis additionally increases CRIT DMG by <unbreak>#1[i]%</unbreak>."
          },
          "130202": {
            "name": "Agate's Humility",
            "desc": "If the number of enemies on the field equals to <unbreak>#1[i]</unbreak> or more when the Ultimate is used, ATK increases by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "130203": {
            "name": "Thorny Road's Glory",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130204": {
            "name": "Trumpet's Dedication",
            "desc": "At the start of battle, gains <unbreak>#1[i]</unbreak> stack(s) of Apotheosis and increases the maximum stack limit of the Talent's effect by <unbreak>#2[i]</unbreak>."
          },
          "130205": {
            "name": "Snow, From Somewhere in Cosmos",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130206": {
            "name": "\"Your\" Resplendence",
            "desc": "When using Ultimate, ignores <unbreak>#1[i]%</unbreak> of enemy targets' DEF."
          }
        },
        "Effects": {
          "10013021": {
            "name": "Apotheosis",
            "desc": "Increases CRIT Rate by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "Apotheosis",
            "source": 1302,
            "ID": 10013021
          },
          "10013022": {
            "name": "Agate's Humility",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1302,
            "ID": 10013022
          }
        },
        "Traces": {
          "A2": {
            "name": "Piety",
            "desc": "At the start of a turn, immediately gains <unbreak>#1[i]</unbreak> stack(s) of Apotheosis.",
            "owner": 1302,
            "ID": 1302101,
            "Ascension": 2
          },
          "A4": {
            "name": "Generosity",
            "desc": "When enemy targets enter battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy for self.",
            "owner": 1302,
            "ID": 1302102,
            "Ascension": 4
          },
          "A6": {
            "name": "Courage",
            "desc": "Deals <unbreak>#2[i]%</unbreak> more DMG to enemies whose HP percentage is <unbreak>#1[i]%</unbreak> or less.",
            "owner": 1302,
            "ID": 1302103,
            "Ascension": 6
          }
        }
      },
      "1303": {
        "Name": "Ruan Mei",
        "Abilities": {
          "130301": {
            "name": "Threading Fragrance",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Ruan Mei's ATK to a single target enemy."
          },
          "130302": {
            "name": "String Sings Slow Swirls",
            "desc": "After using her Skill, Ruan Mei gains Overtone. When Ruan Mei has Overtone, increase all allies' <color=#f29e38ff>DMG</color> and <color=#f29e38ff>Weakness Break Efficiency</color>.",
            "longdesc": "After using her Skill, Ruan Mei gains Overtone, lasting for <unbreak>#3[i]</unbreak> turn(s). This duration decreases by 1 at the start of Ruan Mei's every turn. When Ruan Mei has Overtone, all allies' DMG increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> and Weakness Break Efficiency increases by <unbreak>#2[i]%</unbreak>."
          },
          "130303": {
            "name": "Petals to Stream, Repose in Dream",
            "desc": "Increases <color=#f29e38ff>All-Type RES PEN</color> for all allies, and their attacks apply Thanatoplum Rebloom to enemies hit.",
            "longdesc": "Ruan Mei deploys a Zone that lasts for <unbreak>#2[i]</unbreak> turns. The Zone's duration decreases by 1 at the start of her turn.\\nWhile inside the Zone, all allies' All-Type RES PEN increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> and their attacks apply Thanatoplum Rebloom to the enemies hit.\\nWhen these enemies attempt to recover from <u>Weakness Break</u>, Thanatoplum Rebloom is triggered, extending the duration of their <u>Weakness Break</u>, <u>delaying their action</u> by an amount equal to <unbreak>#3[i]%</unbreak> of Ruan Mei's Break Effect plus <unbreak>#4[i]%</unbreak>, and dealing Break DMG equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of Ruan Mei's Ice <u>Break DMG</u>.\\nEnemy targets cannot have Thanatoplum Rebloom re-applied to them until they recover from <u>Weakness Break</u>."
          },
          "130304": {
            "name": "Somatotypical Helix",
            "desc": "Increases <color=#f29e38ff>SPD</color> for all allies (excluding this character). Breaking an enemy target's Weakness will <color=#f29e38ff>additionally deal Ice Break DMG</color>.",
            "longdesc": "Increases SPD by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> for the team (excluding this character). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of her Ice <u>Break DMG</u>."
          },
          "130306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130307": {
            "name": "Silken Serenade",
            "desc": "The next time entering battle, automatically triggers the Skill for <color=#f29e38ff><unbreak>#1[i]</unbreak></color> time(s). After using the Technique, allies attacking enemies in Simulated Universe or Divergent Universe will always be regarded as attacking their Weakness to enter battle, and their Toughness is reduced <color=#f29e38ff>regardless of Weakness types</color>. For every Blessing in possession, increases Toughness Reduction and additionally deals Break DMG when breaking Weakness.",
            "longdesc": "After using the Technique, gains Silken Serenade. At the start of the next battle, automatically triggers the Skill for <unbreak>#1[i]</unbreak> time(s) without consuming Skill Points.\\nIn Simulated Universe or Divergent Universe, when Ruan Mei has Silken Serenade, the team actively attacking enemies will always be regarded as attacking their Weakness to enter battle, and this attack can reduce all enemies' Toughness regardless of Weakness types. When breaking Weakness, triggers Weakness Break Effect corresponding to the attacker's Type. For every Blessing in possession (up to a max of <unbreak>#4[i]</unbreak> Blessings will be taken into account), additionally increases the Toughness Reduction of this attack by <unbreak>#2[i]%</unbreak>. After breaking an enemy target's Weakness, additionally deals to the enemy target Break DMG equal to <unbreak>#3[i]%</unbreak> of Ruan Mei's Ice Break DMG."
          }
        },
        "Eidolons": {
          "130301": {
            "name": "Neuronic Embroidery",
            "desc": "While the Ultimate's Zone is deployed, the DMG dealt by all allies ignores <unbreak>#1[i]%</unbreak> of the target's DEF."
          },
          "130302": {
            "name": "Reedside Promenade",
            "desc": "With Ruan Mei on the field, all allies increase their ATK by <unbreak>#1[i]%</unbreak> when dealing DMG to enemies with Weakness Break."
          },
          "130303": {
            "name": "Viridescent Pirouette",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130304": {
            "name": "Chatoyant Éclat",
            "desc": "When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "130305": {
            "name": "Languid Barrette",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130306": {
            "name": "Sash Cascade",
            "desc": "Extends the duration of the Ultimate's Zone by <unbreak>#1[i]</unbreak> turn(s). The Talent's Break DMG multiplier additionally increases by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10013031": {
            "name": "Overtone",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. Weakness Break Efficiency increases by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "effect": "Boost DMG and Weakness Break Efficiency",
            "source": 1303,
            "ID": 10013031
          },
          "10013032": {
            "name": "Petals to Stream, Repose in Dream",
            "desc": "All-Type RES PEN increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "All-Type RES PEN Boost",
            "source": 1303,
            "ID": 10013032
          },
          "10013033": {
            "name": "Thanatoplum Rebloom",
            "desc": "When enemy targets attempt to recover from the Weakness Break state, prolong the duration of their Weakness Break state and deal Ice Break DMG to them.",
            "effect": "Weakness Break Extension",
            "source": 1303,
            "ID": 10013033
          },
          "10013034": {
            "name": "Silken Serenade",
            "desc": "Increases ATK.",
            "effect": "ATK Boost",
            "source": 1303,
            "ID": 10013034
          },
          "10013035": {
            "name": "Chatoyant Éclat",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 1303,
            "ID": 10013035
          },
          "10013036": {
            "name": "Days Wane, Thoughts Wax",
            "source": 1303,
            "ID": 10013036
          },
          "10013037": {
            "name": "Sash Cascade",
            "source": 1303,
            "ID": 10013037
          },
          "10013038": {
            "name": "Somatotypical Helix",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1303,
            "ID": 10013038
          },
          "10013039": {
            "name": "Petals to Stream, Repose in Dream",
            "desc": "All-Type RES PEN increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "All-Type RES PEN Boost",
            "source": 1303,
            "ID": 10013039
          }
        },
        "Traces": {
          "A2": {
            "name": "Inert Respiration",
            "desc": "Increases Break Effect by <unbreak>#1[i]%</unbreak> for all allies.",
            "owner": 1303,
            "ID": 1303101,
            "Ascension": 2
          },
          "A4": {
            "name": "Days Wane, Thoughts Wax",
            "desc": "Ruan Mei regenerates <unbreak>#1[i]</unbreak> Energy at the start of her turn.",
            "owner": 1303,
            "ID": 1303102,
            "Ascension": 4
          },
          "A6": {
            "name": "Candle Lights on Still Waters",
            "desc": "In battle, for every <unbreak>#2[i]%</unbreak> of Ruan Mei's Break Effect that exceeds <unbreak>#1[i]%</unbreak>, her Skill additionally increases allies' DMG by <unbreak>#3[i]%</unbreak>, up to a maximum of <unbreak>#4[i]%</unbreak>.",
            "owner": 1303,
            "ID": 1303103,
            "Ascension": 6
          }
        }
      },
      "1304": {
        "Name": "Aventurine",
        "Abilities": {
          "130401": {
            "name": "Straight Bet",
            "desc": "Deals minor Imaginary DMG to a single target enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Aventurine's DEF to a single target enemy."
          },
          "130402": {
            "name": "Cornerstone Deluxe",
            "desc": "Provides all allies with a Fortified Wager shield, <color=#f29e38ff>whose Shield effect is stackable</color>.",
            "longdesc": "Provides all allies with a Fortified Wager shield that can block DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Aventurine's DEF plus <color=#f29e38ff><unbreak>#2[i]</unbreak></color>, lasting for <unbreak>#3[i]</unbreak> turn(s). When Fortified Wager is gained repeatedly, the Shield effect can stack, up to <unbreak>#4[i]%</unbreak> of the current Shield effect provided by the Skill."
          },
          "130403": {
            "name": "Roulette Shark",
            "desc": "Gains a random amount of Blind Bet points and inflicts Unnerved on a single enemy, dealing Imaginary DMG. When an ally hits an Unnerved enemy, <color=#f29e38ff>the CRIT DMG dealt increases</color>.",
            "longdesc": "Randomly gains 1 to <unbreak>#1[i]</unbreak> points of Blind Bet. Then, inflicts Unnerved on a single target enemy for <unbreak>#4[i]</unbreak> turn(s) and deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Aventurine's DEF to the single target enemy. When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color>."
          },
          "130404": {
            "name": "Shot Loaded Right",
            "desc": "For any single ally with Fortified Wager, their Effect RES increases, and when they get attacked, Aventurine accumulates Blind Bet. When Aventurine has Fortified Wager, he can resist <u>Crowd Control debuffs</u>. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a <color=#f29e38ff><u>follow-up attack</u></color> that deals minor Imaginary DMG to random single enemy targets, bouncing a total of 7 times.",
            "longdesc": "For any single ally with Fortified Wager, their Effect RES increases by <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color>, and when they get attacked, Aventurine gains 1 point of Blind Bet. When Aventurine has Fortified Wager, he can resist <u>Crowd Control debuffs</u>. This effect can trigger again after <unbreak>#5[i]</unbreak> turn(s). Aventurine additionally gains <unbreak>#1[i]</unbreak> point(s) of Blind Bet after getting attacked. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a <unbreak>#2[i]</unbreak>-hit <u>follow-up attack</u>, with each hit dealing Imaginary DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Aventurine's DEF to a single random enemy. Blind Bet is capped at <unbreak>10</unbreak> points."
          },
          "130406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130407": {
            "name": "The Red or the Black",
            "desc": "Using the Technique randomly grants one out of the three DEF Boost effects with different buff values. After entering the next battle, increases all allies' DEF by the corresponding value.",
            "longdesc": "After using the Technique, 1 of the following effects will be granted:\\nThere is a chance for DEF to increase by <unbreak>#1[i]%</unbreak>.\\nThere is a high chance for DEF to increase by <unbreak>#2[i]%</unbreak>.\\nThere is a small chance for DEF to increase by <unbreak>#3[i]%</unbreak>.\\n\\nWhen this Technique is used repeatedly, the acquired effect with the highest buff value is retained.\\nWhen the next battle starts, increases all allies' DEF by the corresponding value, lasting for <unbreak>#4[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "130401": {
            "name": "Prisoner's Dilemma",
            "desc": "Increases CRIT DMG by <unbreak>#1[i]%</unbreak> for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to <unbreak>#2[i]%</unbreak> of the one provided by the Skill, lasting for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "130402": {
            "name": "Bounded Rationality",
            "desc": "When using the Basic ATK, reduces the target's All-Type RES by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "130403": {
            "name": "Droprate Maxing",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130404": {
            "name": "Unexpected Hanging Paradox",
            "desc": "When triggering his Talent's follow-up attack, first increases Aventurine's DEF by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by <unbreak>#3[i]</unbreak>."
          },
          "130405": {
            "name": "Ambiguity Aversion",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130406": {
            "name": "Stag Hunt Game",
            "desc": "For every ally that holds a Shield, the DMG dealt by Aventurine increases by <unbreak>#1[i]%</unbreak>, up to a maximum of <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10013041": {
            "name": "Unexpected Hanging Paradox",
            "desc": "DEF increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>",
            "effect": "DEF Boost",
            "source": 1304,
            "ID": 10013041
          },
          "10013042": {
            "name": "Shot Loaded Right",
            "desc": "The Talent's Crowd Control debuff resist effect cannot be triggered yet.",
            "source": 1304,
            "ID": 10013042
          },
          "10013043": {
            "name": "Leverage",
            "desc": "Increases CRIT Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1304,
            "ID": 10013043
          },
          "10013044": {
            "name": "Fortified Wager: Spades",
            "desc": "Gains a Shield that absorbs DMG and increases Effect RES by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 2 points of Blind Bet.",
            "effect": "Shield",
            "source": 1304,
            "ID": 10013044
          },
          "10013045": {
            "name": "Fortified Wager: Hearts",
            "desc": "Gains a Shield that absorbs DMG and increases Effect RES by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet.",
            "effect": "Shield",
            "source": 1304,
            "ID": 10013045
          },
          "10013046": {
            "name": "Fortified Wager: Diamonds",
            "desc": "Gains a Shield that absorbs DMG and increases Effect RES by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet.",
            "effect": "Shield",
            "source": 1304,
            "ID": 10013046
          },
          "10013047": {
            "name": "Fortified Wager: Clubs",
            "desc": "Gains a Shield that absorbs DMG and increases Effect RES by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet.",
            "effect": "Shield",
            "source": 1304,
            "ID": 10013047
          },
          "10013048": {
            "name": "Bingo!",
            "desc": "After an ally with Fortified Wager uses a follow-up attack, Aventurine gains 1 Blind Bet. This effect can be triggered <color=#f29e38ff><unbreak>#1[i]</unbreak></color> more time(s).",
            "source": 1304,
            "ID": 10013048
          },
          "10013049": {
            "name": "Stag Hunt Game",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1304,
            "ID": 10013049
          }
        },
        "Traces": {
          "A2": {
            "name": "Leverage",
            "desc": "For every <unbreak>100</unbreak> of Aventurine's DEF that exceeds <unbreak>#3[i]</unbreak>, increases his own CRIT Rate by <unbreak>#1[i]%</unbreak>, up to a maximum increase of <unbreak>#2[i]%</unbreak>.",
            "owner": 1304,
            "ID": 1304101,
            "Ascension": 2
          },
          "A4": {
            "name": "Hot Hand",
            "desc": "When battle starts, grants all allies a Fortified Wager shield, whose Shield effect is equal to <unbreak>#2[i]%</unbreak> of the one provided by the Skill, lasting for <unbreak>#1[i]</unbreak> turn(s).",
            "owner": 1304,
            "ID": 1304102,
            "Ascension": 4
          },
          "A6": {
            "name": "Bingo!",
            "desc": "After an ally with Fortified Wager launches a follow-up attack, Aventurine accumulates 1 Blind Bet point. This effect can trigger up to <unbreak>#3[i]</unbreak> time(s). Its trigger count resets at the start of Aventurine's turn. After Aventurine launches his Talent's follow-up attack, provides all allies with a Fortified Wager that can block DMG equal to <unbreak>#1[i]%</unbreak> of Aventurine's DEF plus <unbreak>#2[i]</unbreak>, and additionally grants a Fortified Wager that can block DMG equal to <unbreak>#4[i]%</unbreak> of Aventurine's DEF plus <unbreak>#5[i]</unbreak> to the ally with the lowest Shield effect, lasting for 3 turns.",
            "owner": 1304,
            "ID": 1304103,
            "Ascension": 6
          }
        }
      },
      "1305": {
        "Name": "Dr. Ratio",
        "Abilities": {
          "130501": {
            "name": "Mind is Might",
            "desc": "Deals minor Imaginary DMG to a single target enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dr. Ratio's ATK to a single target enemy."
          },
          "130502": {
            "name": "Intellectual Midwifery",
            "desc": "Deals Imaginary DMG to a single enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dr. Ratio's ATK to a single target enemy."
          },
          "130503": {
            "name": "Syllogistic Paradox",
            "desc": "Deals Imaginary DMG to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches 1 <color=#f29e38ff><u>follow-up attack</u></color> on this target.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dr. Ratio's ATK to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches his Talent's <u>follow-up attack</u> for 1 time against this target.\\nWiseman's Folly can be triggered for up to <unbreak>#2[i]</unbreak> times and only affects the most recent target of Dr. Ratio's Ultimate. This trigger count resets after Dr. Ratio's Ultimate is used."
          },
          "130504": {
            "name": "Cogito, Ergo Sum",
            "desc": "When using the Skill, there is a chance of launching a <color=#f29e38ff><u>follow-up attack</u></color> against the target for 1 time.",
            "longdesc": "When using his Skill, Dr. Ratio has a <unbreak>#2[i]%</unbreak> <u>fixed chance</u> of launching a <u>follow-up attack</u> against his target for 1 time, dealing Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Dr. Ratio's ATK. For each debuff the target enemy has, the <u>fixed chance</u> of launching <u>follow-up attack</u> increases by <unbreak>#3[i]%</unbreak>. If the target enemy is defeated before the <u>follow-up attack</u> triggers, the <u>follow-up attack</u> will be directed at a single random enemy instead."
          },
          "130506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130507": {
            "name": "Mold of Idolatry",
            "desc": "Creates a Special Dimension. Enemies within the dimension are Taunted. After entering battle with enemies in this dimension, there is a high chance to <color=#f29e38ff>reduce SPD</color> of enemy targets.",
            "longdesc": "After using Technique, creates a Special Dimension that Taunts nearby enemies, lasting for <unbreak>#1[i]</unbreak> second(s). After entering battle with enemies in this Special Dimension, there is a <unbreak>#2[i]%</unbreak> <u>base chance</u> to reduce each single enemy target's SPD by <unbreak>#3[i]%</unbreak> for <unbreak>#4[i]</unbreak> turn(s). Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "130501": {
            "name": "Pride Comes Before a Fall",
            "desc": "The maximum stackable count for the Trace \"Summation\" increases by <unbreak>#1[i]</unbreak>. When a battle begins, immediately obtains <unbreak>#2[i]</unbreak> stacks of Summation. Needs to unlock Summation first."
          },
          "130502": {
            "name": "The Divine Is in the Details",
            "desc": "When his Talent's follow-up attack hits a target, for every debuff the target has, deals Imaginary Additional DMG equal to <unbreak>#1[i]%</unbreak> of Dr. Ratio's ATK. This effect can be triggered for a maximum of <unbreak>#2[i]</unbreak> time(s) during each follow-up attack."
          },
          "130503": {
            "name": "Know Thyself",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130504": {
            "name": "Ignorance Is Blight",
            "desc": "When triggering the Talent, additionally regenerates <unbreak>#1[i]</unbreak> Energy for Dr. Ratio."
          },
          "130505": {
            "name": "Sic Itur Ad Astra",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130506": {
            "name": "Vincit Omnia Veritas",
            "desc": "Additionally increases the triggerable count for Wiseman's Folly by <unbreak>#1[i]</unbreak>. The DMG dealt by the Talent's follow-up attack increases by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10013051": {
            "name": "SPD Boost",
            "desc": "Each stack increases SPD by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1305,
            "ID": 10013051
          },
          "10013052": {
            "name": "ATK Boost",
            "desc": "Each stack increases ATK by <color=#f29e38ff>><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 1305,
            "ID": 10013052
          },
          "10013053": {
            "name": "CRIT Rate Boost",
            "desc": "Each stack increases CRIT Rate by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1305,
            "ID": 10013053
          },
          "10013054": {
            "name": "CRIT DMG Boost",
            "desc": "Each stack increases CRIT DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1305,
            "ID": 10013054
          },
          "10013055": {
            "name": "Effect RES Reduction",
            "desc": "Effect RES reduces by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Reduction",
            "source": 1305,
            "ID": 10013055
          },
          "10013056": {
            "name": "SPD Reduction",
            "desc": "Decreases SPD by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Reduction",
            "source": 1305,
            "ID": 10013056
          },
          "10013057": {
            "name": "Wiseman's Folly",
            "desc": "After a target with Wiseman's Folly is attacked by Dr. Ratio's teammate(s), Dr. Ratio immediately launches a follow-up attack once against this target. This effect can be triggered for a maximum of <color=#f29e38ff><unbreak>#1[i]</unbreak></color> times.",
            "effect": "Wiseman's Folly",
            "source": 1305,
            "ID": 10013057
          },
          "10013058": {
            "name": "Rationalism",
            "desc": "Increases DMG dealt to enemies with debuffs by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1305,
            "ID": 10013058
          },
          "10013059": {
            "name": "Summation",
            "desc": "Every stack increases CRIT Rate by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> and CRIT DMG by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>.",
            "source": 1305,
            "ID": 10013059
          }
        },
        "Traces": {
          "A2": {
            "name": "Summation",
            "desc": "When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by <unbreak>#1[f1]%</unbreak> and CRIT DMG by <unbreak>#2[i]%</unbreak>. This effect can stack up to <unbreak>#3[i]</unbreak> time(s).",
            "owner": 1305,
            "ID": 1305101,
            "Ascension": 2
          },
          "A4": {
            "name": "Inference",
            "desc": "When Skill is used to attack an enemy target, there is a <unbreak>#1[i]%</unbreak> base chance to reduce the attacked target's Effect RES by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 1305,
            "ID": 1305102,
            "Ascension": 4
          },
          "A6": {
            "name": "Deduction",
            "desc": "When dealing DMG to a target that has <unbreak>#1[i]</unbreak> or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by <unbreak>#2[i]%</unbreak>, up to a maximum increase of <unbreak>#3[i]%</unbreak>.",
            "owner": 1305,
            "ID": 1305103,
            "Ascension": 6
          }
        }
      },
      "1306": {
        "Name": "Sparkle",
        "Abilities": {
          "130601": {
            "name": "Monodrama",
            "desc": "Deals minor Quantum DMG to a single enemy.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Sparkle's ATK to a single target enemy."
          },
          "130602": {
            "name": "Dreamdiver",
            "desc": "Increases an ally's <color=#f29e38ff>CRIT DMG</color> and Advances Forward their action.",
            "longdesc": "Increases the CRIT DMG of a single target ally by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Sparkle's CRIT DMG plus <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>, lasting for <unbreak>#3[i]</unbreak> turn(s). And at the same time, Advances Forward this ally's action by <unbreak>#4[i]%</unbreak>.\\nWhen Sparkle uses this ability on herself, the Action Advance effect will not trigger."
          },
          "130603": {
            "name": "The Hero with a Thousand Faces",
            "desc": "Recovers <color=#f29e38ff>Skill Points</color> for the team, and enables the DMG Boost provided by Sparkle's Talent to be additionally enhanced.",
            "longdesc": "Recovers <unbreak>#2[i]</unbreak> Skill Points for the team and grants all allies Cipher. For allies with Cipher, each stack of the DMG Boost effect provided by Sparkle's Talent additionally increases by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color>, lasting for <unbreak>#4[i]</unbreak> turns."
          },
          "130604": {
            "name": "Red Herring",
            "desc": "Increases the team's <color=#f29e38ff>Max Skill Points</color>. Whenever an ally consumes Skill Points, enables all allies to <color=#f29e38ff>deal more damage</color>.",
            "longdesc": "While Sparkle is on the battlefield, additionally increases the max number of Skill Points by <unbreak>#3[i]</unbreak>. Whenever an ally consumes 1 Skill Point, all allies' DMG dealt increases by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>. This effect lasts for <unbreak>#1[i]</unbreak> turn(s) and can stack up to <unbreak>#4[i]</unbreak> time(s)."
          },
          "130606": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130607": {
            "name": "Unreliable Narrator",
            "desc": "Using the Technique grants all allies Misdirect. Characters with Misdirect will not be detected by enemies, and entering battle while in Misdirect recovers <color=#f29e38ff>Skill Points</color> for allies.",
            "longdesc": "Using the Technique grants all allies Misdirect for <unbreak>#2[i]</unbreak> seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers <unbreak>#1[i]</unbreak> Skill Point(s) for the team."
          }
        },
        "Eidolons": {
          "130601": {
            "name": "Suspension of Disbelief",
            "desc": "The Cipher effect granted by the Ultimate lasts for 1 extra turn. All allies with Cipher have their ATK increased by <unbreak>#1[i]%</unbreak>."
          },
          "130602": {
            "name": "Purely Fictitious",
            "desc": "Every stack of the Talent's effect allows allies to additionally ignore <unbreak>#1[i]%</unbreak> of the target's DEF when dealing DMG."
          },
          "130603": {
            "name": "Pipedream",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130604": {
            "name": "Life Is a Gamble",
            "desc": "The Ultimate recovers 1 more Skill Point. The Talent additionally increases the Max Skill Points by 1."
          },
          "130605": {
            "name": "Parallax Truth",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130606": {
            "name": "Narrative Polysemy",
            "desc": "The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to <unbreak>#1[i]%</unbreak> of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all allies with Cipher. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to allies with Cipher."
          }
        },
        "Effects": {
          "10013061": {
            "name": "Dreamdiver",
            "desc": "Increase CRIT DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1306,
            "ID": 10013061
          },
          "10013062": {
            "name": "Cipher",
            "desc": "Additionally enhances the DMG Boost effect provided by each stack of Sparkle's talent by <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>.",
            "effect": "Cipher",
            "source": 1306,
            "ID": 10013062
          },
          "10013063": {
            "name": "Dreamdiver",
            "desc": "Increase CRIT DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1306,
            "ID": 10013063
          },
          "10013064": {
            "name": "Red Herring",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1306,
            "ID": 10013064
          },
          "10013065": {
            "name": "Nocturne",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Nocturne",
            "source": 1306,
            "ID": 10013065
          },
          "10013066": {
            "source": 1306,
            "ID": 10013066
          },
          "10013067": {
            "source": 1306,
            "ID": 10013067
          }
        },
        "Traces": {
          "A2": {
            "name": "Almanac",
            "desc": "When using Basic ATK, additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1306,
            "ID": 1306101,
            "Ascension": 2
          },
          "A4": {
            "name": "Artificial Flower",
            "desc": "The CRIT DMG Boost effect provided by the Skill will be extended until the start of the target's next turn.",
            "owner": 1306,
            "ID": 1306102,
            "Ascension": 4
          },
          "A6": {
            "name": "Nocturne",
            "desc": "Increases all allies' ATK by <unbreak>#4[i]%</unbreak>. When there are 1/2/3 Quantum-Type allies in the team, additionally increases Quantum-Type allies' ATK by <unbreak>#1[i]%</unbreak>/<unbreak>#2[i]%</unbreak>/<unbreak>#3[i]%</unbreak>.",
            "owner": 1306,
            "ID": 1306103,
            "Ascension": 6
          }
        }
      },
      "1307": {
        "Name": "Black Swan",
        "Abilities": {
          "130701": {
            "name": "Percipience, Silent Dawn",
            "desc": "Deals minor Wind DMG to a single enemy and has a chance of applying <u>Arcana</u> to the target. After attacking a target that suffers <color=#f29e38ff>Wind Shear, Bleed, Burn, or Shock</color>, there is respectively a chance of <color=#f29e38ff>additionally applying <u>Arcana</u></color>.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Black Swan's ATK to a single target enemy, with a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> of inflicting 1 stack of <u>Arcana</u> on the target. Additionally, when attacking a target that suffers Wind Shear, Bleed, Burn, or Shock, there is respectively a <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> <u>base chance</u> of inflicting 1 extra stack of <u>Arcana</u> on the target."
          },
          "130702": {
            "name": "Decadence, False Twilight",
            "desc": "Deals minor Wind DMG to a single enemy target and any adjacent targets, with a high chance of <color=#f29e38ff>inflicting <u>Arcana</u></color> on the targets and lowering their DEF.",
            "longdesc": "Deals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a <unbreak>#2[i]%</unbreak> <u>base chance</u> of inflicting 1 stack of <u>Arcana</u> on the target enemy and the adjacent targets. Additionally, there is a <unbreak>#3[i]%</unbreak> <u>base chance</u> of reducing the DEF of the target enemy and the adjacent targets by <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color>, lasting for <unbreak>#5[i]</unbreak> turn(s)."
          },
          "130703": {
            "name": "Bliss of Otherworld's Embrace",
            "desc": "Inflicts Epiphany on all enemies, increasing the DMG the targets take in their turn. Additionally, <color=#f29e38ff>having <u>Arcana</u> is regarded as having Wind Shear, Bleed, Burn, and Shock</color>. Furthermore, <u>Arcana</u> will not reset its stacks after causing DMG at the start of the next turn. Deals Wind DMG to all enemies.",
            "longdesc": "Inflicts Epiphany on all enemies for <unbreak>#2[i]</unbreak> turn(s).\\nWhile afflicted with Epiphany, enemies take <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> increased DMG in their turn. Additionally, if enemies are also inflicted with <u>Arcana</u>, they are considered to be simultaneously afflicted with Wind Shear, Bleed, Burn, and Shock. After <u>Arcana</u> causes DMG at the start of each turn, its stacks are not reset. This non-reset effect of <u>Arcana</u> stacks can be triggered up to <unbreak>#4[i]</unbreak> time(s) for the duration of Epiphany. And the trigger count resets when Epiphany is applied again.\\nDeals Wind DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Black Swan's ATK to all enemies."
          },
          "130704": {
            "name": "Loom of Fate's Caprice",
            "desc": "When an enemy target receives DoT at the start of each turn, there is a chance for it to be inflicted with <u>Arcana</u>. They receive <color=#f29e38ff>Wind DoT</color> at the start of the turn, and Black Swan triggers <color=#f29e38ff>additional effects</color> based on the number of <u>Arcana</u> stacks.",
            "longdesc": "Every time an enemy target receives DoT at the start of each turn, there is a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> for it to be inflicted with 1 stack of <u>Arcana</u>.\\nWhile afflicted with <u>Arcana</u>, enemy targets receive Wind DoT equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Black Swan's ATK at the start of each turn. Each stack of <u>Arcana</u> increases this DMG multiplier by <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color>. Then <u>Arcana</u> resets to 1 stack. <u>Arcana</u> can stack up to <unbreak>#8[i]</unbreak> times.\\nOnly when <u>Arcana</u> causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of <u>Arcana</u> stacks inflicted on the target:\\nWhen there are <unbreak>#4[i]</unbreak> or more <u>Arcana</u> stacks, deals Wind DoT equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of Black Swan's ATK to adjacent targets, with a <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> <u>base chance</u> of inflicting 1 stack of <u>Arcana</u> on adjacent targets.\\nWhen there are <unbreak>#6[i]</unbreak> or more <u>Arcana</u> stacks, enables the current DoT dealt this time to ignore <unbreak>#7[i]%</unbreak> of the target's and adjacent targets' DEF."
          },
          "130706": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130707": {
            "name": "From Façade to Vérité",
            "desc": "After this Technique is used, at the start of the next battle, there is a high chance for each enemy to be <color=#f29e38ff>inflicted with Arcana repeatedly until <u>Arcana</u> fails to be inflicted</color>.",
            "longdesc": "After this Technique is used, there is a <unbreak>#1[i]%</unbreak> <u>base chance</u> for each enemy to be inflicted with 1 stack of <u>Arcana</u> at the start of the next battle. For each successful application of <u>Arcana</u> on a target, inflicts another stack of <u>Arcana</u> on the same target. This process repeats until <u>Arcana</u> fails to be inflicted on this target. For each successive application of <u>Arcana</u> on a target, its <u>base chance</u> of success is equal to <unbreak>#2[i]%</unbreak> of the <u>base chance</u> of the previous successful infliction of <u>Arcana</u> on that target."
          }
        },
        "Eidolons": {
          "130701": {
            "name": "Seven Pillars of Wisdom",
            "desc": "While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by <unbreak>#1[i]%</unbreak>."
          },
          "130702": {
            "name": "Weep Not For Me, My Lamb",
            "desc": "When an enemy target afflicted with Arcana is defeated, there is a <unbreak>#1[i]%</unbreak> base chance of inflicting <unbreak>#2[i]</unbreak> stack(s) of Arcana on adjacent targets."
          },
          "130703": {
            "name": "As Above, So Below",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130704": {
            "name": "In Tears We Gift",
            "desc": "While in the Epiphany state, enemy targets have their Effect RES reduced by <unbreak>#1[i]%</unbreak> and Black Swan regenerates <unbreak>#2[i]</unbreak> Energy at the start of these targets' turns or when they are defeated. This Energy Regeneration effect can only trigger up to 1 time while Epiphany lasts. The trigger count is reset when Epiphany is applied again."
          },
          "130705": {
            "name": "Linnutee Flyway",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130706": {
            "name": "Pantheon Merciful, Masses Pitiful",
            "desc": "When an enemy target gets attacked by Black Swan's allies, Black Swan has a <unbreak>#2[i]%</unbreak> base chance of inflicting 1 stack of Arcana on the target.\\nEvery time Black Swan inflicts Arcana on an enemy target, there is a <unbreak>#1[i]%</unbreak> fixed chance to additionally increase the number of Arcana stacked this time by <unbreak>#3[i]</unbreak>."
          }
        },
        "Effects": {
          "10013071": {
            "name": "Arcana",
            "desc": "Takes Wind DMG at the start of each turn. Being afflicted with Arcana will also be considered as suffering from Wind Shear. This state stacks up to <color=#f29e38ff><unbreak>#1[i]</unbreak></color> times.",
            "effect": "Arcana",
            "source": 1307,
            "ID": 10013071
          },
          "10013072": {
            "name": "Epiphany",
            "desc": "The DMG received increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> during this unit's turn. While in Arcana state, this unit is also considered to be simultaneously inflicted with Wind Shear, Bleed, Burn, and Shock. Additionally, after Arcana causes DMG at the start of each turn, its stacks do not reset. This effect can trigger <color=#f29e38ff><unbreak>#3[i]</unbreak></color> more time(s).",
            "effect": "Epiphany",
            "source": 1307,
            "ID": 10013072
          },
          "10013073": {
            "name": "Decadence, False Twilight",
            "desc": "DEF -<color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1307,
            "ID": 10013073
          },
          "10013074": {
            "name": "Seven Pillars of Wisdom",
            "desc": "Wind RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1307,
            "ID": 10013074
          },
          "10013075": {
            "name": "Seven Pillars of Wisdom",
            "desc": "Physical RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1307,
            "ID": 10013075
          },
          "10013076": {
            "name": "Seven Pillars of Wisdom",
            "desc": "Fire RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1307,
            "ID": 10013076
          },
          "10013077": {
            "name": "Seven Pillars of Wisdom",
            "desc": "Lightning RES -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1307,
            "ID": 10013077
          }
        },
        "Traces": {
          "A2": {
            "name": "Viscera's Disquiet",
            "desc": "After using the Skill to attack a single target enemy that has Wind Shear, Bleed, Burn, or Shock, each of these debuffs respectively has a <unbreak>#1[i]%</unbreak> base chance of inflicting 1 extra stack of Arcana.",
            "owner": 1307,
            "ID": 1307101,
            "Ascension": 2
          },
          "A4": {
            "name": "Goblet's Dredges",
            "desc": "When an enemy target enters battle, there is a <unbreak>#1[i]%</unbreak> base chance for it to be inflicted with 1 stack of Arcana.\\nEvery time an enemy target receives DoT during a single attack by an ally, there is a <unbreak>#1[i]%</unbreak> base chance for the target to be inflicted with 1 stack of Arcana. The maximum number of stacks that can be inflicted during 1 single attack is <unbreak>#2[i]</unbreak>.",
            "owner": 1307,
            "ID": 1307102,
            "Ascension": 4
          },
          "A6": {
            "name": "Candleflame's Portent",
            "desc": "Increases this unit's DMG by an amount equal to <unbreak>#1[i]%</unbreak> of Effect Hit Rate, up to a maximum DMG increase of <unbreak>#2[i]%</unbreak>.",
            "owner": 1307,
            "ID": 1307103,
            "Ascension": 6
          }
        }
      },
      "1308": {
        "Name": "Acheron",
        "Abilities": {
          "130801": {
            "name": "Trilateral Wiltcross",
            "desc": "Deals minor Lightning DMG to a single enemy.",
            "longdesc": "Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Acheron's ATK to a single target enemy."
          },
          "130802": {
            "name": "Octobolt Flash",
            "desc": "Gains <color=#f29e38ff><unbreak>#3[i]</unbreak></color> point(s) of Slashed Dream. Inflicts <color=#f29e38ff><unbreak>#3[i]</unbreak></color> stack(s) of Crimson Knot on a single enemy, dealing Lightning DMG to this target, as well as minor Lightning DMG to adjacent targets.",
            "longdesc": "Gains <unbreak>#3[i]</unbreak> point(s) of Slashed Dream. Inflicts <unbreak>#3[i]</unbreak> stack(s) of Crimson Knot on a single target enemy, dealing Lightning DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Acheron's ATK to this target, as well as Lightning DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Acheron's ATK to adjacent targets."
          },
          "130803": {
            "name": "Slashed Dream Cries in Red",
            "desc": "Deals 3 hits of minor Lightning DMG to a single enemy. If Crimson Knot is removed from the target, then deals minor Lightning DMG to all enemies. Finally, deals 1 hit of Lightning DMG to all enemies and removes all Crimson Knots.",
            "longdesc": "Sequentially unleash Rainblade 3 times and Stygian Resurge 1 time, dealing Lightning DMG up to <color=#f29e38ff><unbreak>#6[i]%</unbreak></color> of Acheron's ATK to a single target enemy, as well as Lightning DMG up to <color=#f29e38ff><unbreak>#7[i]%</unbreak></color> of Acheron's ATK to other targets.\\n\\nRainblade: Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color> of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, this DMG Multiplier is additionally increased, up to a maximum of <color=#f29e38ff><unbreak>#5[f1]%</unbreak></color>.\\n\\nStygian Resurge: Deals Lightning DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Acheron's ATK to all enemies and remove all Crimson Knots.\\n\\nCrimson Knot cannot be applied to enemies during the Ultimate."
          },
          "130804": {
            "name": "Atop Rainleaf Hangs Oneness",
            "desc": "When Slashed Dream reaches its upper limit, the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness <color=#f29e38ff>regardless of Weakness Types</color> and reduces all enemies' <color=#f29e38ff>All-Type RES</color>.\\nWhen any unit inflicts debuffs on an enemy target while using their ability, Acheron gains Slashed Dream and inflicts Crimson Knot on an enemy target.",
            "longdesc": "When Slashed Dream reaches <unbreak>#1[i]</unbreak> point(s), the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>, lasting until the end of the Ultimate.\\nWhen any unit inflicts debuffs on an enemy target while using their ability, Acheron gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on a target. If debuffs are inflicted on multiple targets, then the 1 stack of Crimson Knot will be inflicted on the enemy target with the most Crimson Knot stacks. This effect can only trigger once for every ability use.\\nAfter an enemy target exits the field or gets defeated by any unit while Acheron is on the field, their Crimson Knot stacks will be transferred to the enemy target with the most Crimson Knot stacks on the whole field."
          },
          "130806": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130807": {
            "name": "Quadrivalent Ascendance",
            "desc": "Attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG to all enemies and reducing Toughness <color=#f29e38ff>regardless of Weakness Types</color>.\\nIf attacking a normal enemy, <color=#f29e38ff>immediately defeats them</color> without entering combat. When not hitting enemies, no Technique Points are consumed.",
            "longdesc": "Immediately attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG equal to <unbreak>#1[i]%</unbreak> of Acheron's ATK to all enemies and reducing Toughness of all enemies irrespective of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.\\nQuadrivalent Ascendance: After using the Ultimate, Acheron gains <unbreak>#2[i]</unbreak> point(s) of Slashed Dream and inflicts <unbreak>#2[i]</unbreak> stack(s) of Crimson Knot on a single random enemy.\\nIf attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed."
          }
        },
        "Eidolons": {
          "130801": {
            "name": "Silenced Sky Spake Sooth",
            "desc": "When dealing DMG to debuffed enemies, increases the CRIT Rate by <unbreak>#1[i]%</unbreak>."
          },
          "130802": {
            "name": "Mute Thunder in Still Tempest",
            "desc": "The number of Nihility characters required for the Trace \"The Abyss\" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks."
          },
          "130803": {
            "name": "Frost Bites in Death",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "130804": {
            "name": "Shrined Fire for Mirrored Soul",
            "desc": "When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by <unbreak>#1[i]%</unbreak>."
          },
          "130805": {
            "name": "Strewn Souls on Erased Earths",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130806": {
            "name": "Apocalypse, the Emancipator",
            "desc": "Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by <unbreak>#1[i]%</unbreak>. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect."
          }
        },
        "Effects": {
          "10013081": {
            "name": "Crimson Knot",
            "desc": "When removed, immediately deals Lightning DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Acheron's ATK to all enemies once. For every stack of Crimson Knot removed, this DMG multiplier additionally increases, up to a maximum of <color=#f29e38ff><unbreak>#2[f1]%</unbreak></color>.",
            "effect": "Crimson Knot",
            "source": 1308,
            "ID": 10013081
          },
          "10013082": {
            "name": "All-Type RES Reduction",
            "desc": "Reduces All-Type RES by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, lasting till the end of the Ultimate.",
            "effect": "All-Type RES Reduction",
            "source": 1308,
            "ID": 10013082
          },
          "10013083": {
            "name": "Thunder Core",
            "desc": "Each stack increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "DMG Boost",
            "source": 1308,
            "ID": 10013083
          },
          "10013084": {
            "name": "Ultimate DMG Vulnerability",
            "desc": "Increases Ultimate DMG received by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Ultimate DMG Vulnerability",
            "source": 1308,
            "ID": 10013084
          },
          "10013085": {
            "name": "Quadrivalent Ascendance",
            "desc": "Acheron obtains <color=#f29e38ff><unbreak>#1[i]</unbreak></color> point(s) of Slashed Dream after she uses her Ultimate, and applies <color=#f29e38ff><unbreak>#1[i]</unbreak></color> stack(s) of Crimson Knot on a random enemy.",
            "source": 1308,
            "ID": 10013085
          },
          "10013086": {
            "name": "Quadrivalent Ascendance",
            "desc": "After using the Ultimate, gains Slashed Dream by an amount equal to the number of Quadrivalent Ascendance stacks. At the same time, applies a corresponding number of Crimson Knot stacks to a random enemy. This effect stacks up to <color=#f29e38ff><unbreak>#1[i]</unbreak></color> time(s).",
            "source": 1308,
            "ID": 10013086
          }
        },
        "Traces": {
          "A2": {
            "name": "Red Oni",
            "desc": "When battle starts, immediately gains <unbreak>#1[i]</unbreak> point(s) of Slashed Dream and applies <unbreak>#1[i]</unbreak> stack(s) of Crimson Knot to a random enemy. When Slashed Dream reaches its upper limit, for every point of Slashed Dream that exceeds the limit, gains 1 stack of Quadrivalent Ascendance. Enables Quadrivalent Ascendance to stack up to <unbreak>#2[i]</unbreak> time(s).",
            "owner": 1308,
            "ID": 1308101,
            "Ascension": 2
          },
          "A4": {
            "name": "The Abyss",
            "desc": "When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to <unbreak>#1[i]%</unbreak> or <unbreak>#2[i]%</unbreak> of the original DMG respectively.",
            "owner": 1308,
            "ID": 1308102,
            "Ascension": 4
          },
          "A6": {
            "name": "Thunder Core",
            "desc": "When the Ultimate's Rainblade hits enemy targets that have Crimson Knot, the DMG dealt by Acheron increases by <unbreak>#1[i]%</unbreak>, stacking up to <unbreak>#2[i]</unbreak> time(s) and lasting for <unbreak>#3[i]</unbreak> turn(s). And when Stygian Resurge triggers, additionally deals DMG for <unbreak>#4[i]</unbreak> times. Each time deals Lightning DMG equal to <unbreak>#5[i]%</unbreak> of Acheron's ATK to a single random enemy and is considered as Ultimate DMG.",
            "owner": 1308,
            "ID": 1308103,
            "Ascension": 6
          }
        }
      },
      "1309": {
        "Name": "Robin",
        "Abilities": {
          "130901": {
            "name": "Wingflip White Noise",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Robin's ATK to a single target enemy."
          },
          "130902": {
            "name": "Pinion's Aria",
            "desc": "<color=#f29e38ff>Increases DMG dealt</color> by all allies.",
            "longdesc": "Increase DMG dealt by all allies by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, lasting for <unbreak>#2[i]</unbreak> turn(s). This duration decreases by 1 at the start of Robin's every turn."
          },
          "130903": {
            "name": "Vox Harmonique, Opus Cosmique",
            "desc": "Enters the Concerto state, <color=#f29e38ff>increases all allies' ATK</color>, and causes all teammates to immediately take action. After an attack, Robin deals <color=#f29e38ff><u>Additional Physical DMG</u></color>. While Concerto lasts, Robin is immune to <u>Crowd Control debuffs</u>. Before Concerto ends, Robin won't take turn or action, lasting until the end of the countdown.",
            "longdesc": "Robin enters the Concerto state and makes all other allies immediately take action.\\nWhile in the Concerto state, increases all allies' ATK by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of Robin's ATK plus <color=#f29e38ff><unbreak>#3[i]</unbreak></color>. Moreover, after every attack by allies, Robin deals <u>Additional Physical DMG</u> equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of her ATK for 1 time, with a fixed CRIT Rate for this damage set at <unbreak>#5[i]%</unbreak> and fixed CRIT DMG set at <unbreak>#6[i]%</unbreak>.\\nWhile in the Concerto state, Robin is immune to <u>Crowd Control debuffs</u> and cannot enter her turn or take action until the Concerto state ends.\\nA Concerto countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the Concerto state and immediately takes action. The countdown has its own fixed SPD of <unbreak>#2[i]</unbreak>."
          },
          "130904": {
            "name": "Tonal Resonance",
            "desc": "Increase all allies' <color=#f29e38ff>CRIT DMG</color>, and Robin additionally regenerates Energy after allies attack enemies.",
            "longdesc": "Increase all allies' CRIT DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>. Moreover, after allies attack enemy targets, Robin additionally regenerates <unbreak>#2[i]</unbreak> Energy for herself."
          },
          "130906": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "130907": {
            "name": "Overture of Inebriation",
            "desc": "Creates a Special Dimension around the character. Enemies within this dimension will not attack Robin. After entering battle while the dimension is active, Robin additionally regenerates <color=#f29e38ff><unbreak>#2[i]</unbreak></color> Energy at the start of each wave.",
            "longdesc": "After using Technique, creates a Special Dimension around the character that lasts for <unbreak>#1[i]</unbreak> seconds. Enemies within this dimension will not attack Robin and will follow Robin while the dimension is active. After entering battle while the dimension is active, Robin regenerates <unbreak>#2[i]</unbreak> Energy at the start of each wave. Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "130901": {
            "name": "Land of Smiles",
            "desc": "While the Concerto state is active, all allies' All-Type RES PEN increases by <unbreak>#1[i]%</unbreak>."
          },
          "130902": {
            "name": "Afternoon Tea For Two",
            "desc": "While the Concerto state is active, all allies' SPD increases by <unbreak>#1[i]%</unbreak>. The Talent's Energy Regeneration effect additionally increases by <unbreak>#2[i]</unbreak>."
          },
          "130903": {
            "name": "Inverted Tuning",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nUltimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130904": {
            "name": "Raindrop Key",
            "desc": "When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by <unbreak>#1[i]%</unbreak>."
          },
          "130905": {
            "name": "Lonestar's Lament",
            "desc": "Basic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "130906": {
            "name": "Moonless Midnight",
            "desc": "While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by <unbreak>#2[i]%</unbreak>. The effect of Moonless Midnight can trigger up to <unbreak>#1[i]</unbreak> time(s). And the trigger count resets each time the Ultimate is used."
          }
        },
        "Effects": {
          "10013091": {
            "name": "Aria",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1309,
            "ID": 10013091
          },
          "10013092": {
            "name": "Aria",
            "desc": "DMG dealt increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1309,
            "ID": 10013092
          },
          "10013093": {
            "name": "Concerto",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]</unbreak></color> and becomes immune to Crowd Control debuffs.",
            "effect": "ATK Boost, immune to Crowd Control debuffs",
            "source": 1309,
            "ID": 10013093
          },
          "10013094": {
            "name": "Concerto",
            "desc": "Increases ATK by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>. Robin deals Additional DMG after attacking.",
            "effect": "ATK Boost",
            "source": 1309,
            "ID": 10013094
          },
          "10013095": {
            "name": "Impromptu Flourish",
            "desc": "Increases follow-up attack CRIT DMG by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT DMG Boost",
            "source": 1309,
            "ID": 10013095
          },
          "10013096": {
            "name": "Land of Smiles",
            "desc": "Increases All-Type RES PEN by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "All-Type RES PEN Boost",
            "source": 1309,
            "ID": 10013096
          },
          "10013097": {
            "name": "Afternoon Tea For Two",
            "desc": "SPD increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "SPD Boost",
            "source": 1309,
            "ID": 10013097
          },
          "10013098": {
            "name": "Tonal Resonance",
            "desc": "CRIT DMG increases by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1309,
            "ID": 10013098
          },
          "10013099": {
            "name": "Raindrop Key",
            "desc": "Increases Effect RES by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect RES Boost",
            "source": 1309,
            "ID": 10013099
          }
        },
        "Traces": {
          "A2": {
            "name": "Coloratura Cadenza",
            "desc": "When the battle begins, this character's action is Advanced Forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1309,
            "ID": 1309101,
            "Ascension": 2
          },
          "A4": {
            "name": "Impromptu Flourish",
            "desc": "While the Concerto state is active, the CRIT DMG dealt when all allies launch follow-up attacks increases by <unbreak>#1[i]%</unbreak>.",
            "owner": 1309,
            "ID": 1309102,
            "Ascension": 4
          },
          "A6": {
            "name": "Sequential Passage",
            "desc": "When using Skill, additionally regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 1309,
            "ID": 1309103,
            "Ascension": 6
          }
        }
      },
      "1310": {
        "Name": "Firefly",
        "Abilities": {
          "131001": {
            "name": "Order: Flare Propulsion",
            "desc": "Deals minor Fire DMG to a single enemy.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of SAM's ATK to a single target enemy."
          },
          "131002": {
            "name": "Order: Aerial Bombardment",
            "desc": "Consumes a portion of this unit's own HP to regenerate Energy. Deals Fire DMG to a single enemy. <u>Advances</u> this unit's next Action.",
            "longdesc": "Consumes HP equal to <unbreak>#2[i]%</unbreak> of this unit's Max HP and regenerates a fixed amount of Energy equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of this unit's Max Energy. Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of SAM's ATK to a single target enemy. If the current HP is not sufficient, reduces SAM's HP to 1 when using this Skill. <u>Advances</u> this unit's next Action by <unbreak>#4[i]%</unbreak>."
          },
          "131003": {
            "name": "Fyrefly Type-IV: Complete Combustion",
            "desc": "Enters the Complete Combustion state. <color=#f29e38ff>Advances this unit's Action by <unbreak>100%</unbreak></color>. Gains <color=#f29e38ff>Enhanced Basic ATK</color> and <color=#f29e38ff>Enhanced Skill</color>. Increases this unit's <color=#f29e38ff>SPD, Weakness Break Efficiency, and the Break DMG received by the enemy targets</color>, lasting until the countdown ends.",
            "longdesc": "Enters the Complete Combustion state, advances this unit's Action by <unbreak>100%</unbreak>, and gains Enhanced Basic ATK and Enhanced Skill. While in Complete Combustion, increases SPD by <color=#f29e38ff><unbreak>#3[i]</unbreak></color>, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by <unbreak>#2[i]%</unbreak> and the Break DMG dealt by SAM to the enemy targets by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, lasting until this current attack ends.\\nA countdown timer for the Complete Combustion state appears on the Action Order. When the countdown timer's turn starts, SAM exits the Complete Combustion state. The countdown timer has a fixed SPD of <unbreak>#4[i]</unbreak>.\\nSAM cannot use Ultimate while in Complete Combustion."
          },
          "131004": {
            "name": "Chrysalid Pyronexus",
            "desc": "The lower the HP, the less DMG received. During the Complete Combustion state, the DMG Reduction effect remains at its maximum extent and Effect RES is increased. If Energy is lower than <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> when the battle starts, regenerates Energy to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. Once Energy is regenerated to its maximum, dispels all <u>debuffs</u> on this unit.",
            "longdesc": "The lower the HP, the less DMG received. When HP is <unbreak>#3[i]%</unbreak> or lower, the DMG Reduction reaches its maximum effect, reducing up to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by <color=#f29e38ff><unbreak>#4[i]%</unbreak></color>.\\nIf Energy is lower than <unbreak>#2[i]%</unbreak> when the battle starts, regenerates Energy to <unbreak>#2[i]%</unbreak>. Once Energy is regenerated to its maximum, dispels all <u>debuffs</u> on this unit."
          },
          "131006": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "131007": {
            "name": "Δ Order: Meteoric Incineration",
            "desc": "Leaps into the air and moves about freely. After a few seconds of movement, plunges and attacks all enemies within range. At the start of <color=#f29e38ff>each wave</color>, <color=#f29e38ff>applies a Fire Weakness</color> to all enemies and deals Fire DMG to them.",
            "longdesc": "Leaps into the air and moves about freely for <unbreak>#1[i]</unbreak> seconds, which can be ended early by launching a plunging attack. When the duration ends, plunges and immediately attacks all enemies within a set area. At the start of each wave, applies a Fire Weakness to all enemies, lasting for <unbreak>#3[i]</unbreak> turn(s). Then, deals Fire DMG equal to <unbreak>#2[i]%</unbreak> of SAM's ATK to all enemies."
          }
        },
        "Eidolons": {
          "131001": {
            "name": "In Reddened Chrysalis, I Once Rest",
            "desc": "When using the Enhanced Skill, ignores <unbreak>#1[i]%</unbreak> of the target's DEF. The Enhanced Skill does not consume Skill Points."
          },
          "131002": {
            "name": "From Shattered Sky, I Free Fall",
            "desc": "While in Complete Combustion, using the Enhanced Basic ATK or the Enhanced Skill to defeat an enemy target or to break their Weakness allows SAM to immediately gain 1 extra turn. This effect can trigger again after <unbreak>#2[i]</unbreak> turn(s)."
          },
          "131003": {
            "name": "Amidst Silenced Stars, I Deep Sleep",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "131004": {
            "name": "Upon Lighted Fyrefly, I Soon Gaze",
            "desc": "While in Complete Combustion, increases SAM's Effect RES by <unbreak>#1[i]%</unbreak>."
          },
          "131005": {
            "name": "From Undreamt Night, I Thence Shine",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "131006": {
            "name": "In Finalized Morrow, I Full Bloom",
            "desc": "While in Complete Combustion, increases SAM's Fire RES PEN by <unbreak>#1[i]%</unbreak>. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break Efficiency by <unbreak>#2[i]%</unbreak>."
          }
        },
        "Effects": {
          "10013101": {
            "name": "Fyrefly Type-IV: Complete Combustion",
            "desc": "When using Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and the Break DMG dealt by SAM to the enemy targets by <color=#f29e38ff><unbreak>#4[f1]%</unbreak></color>. Increases SPD by <color=#f29e38ff><unbreak>#2[i]</unbreak></color>, and Effect RES by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>.",
            "effect": "Fyrefly Type-IV: Complete Combustion",
            "source": 1310,
            "ID": 10013101
          },
          "10013102": {
            "name": "Chrysalid Pyronexus",
            "desc": "DMG taken decreases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 1310,
            "ID": 10013102
          },
          "10013103": {
            "name": "Extra Fire Weakness",
            "desc": "Implanted with extra Fire Weakness.",
            "effect": "Implant Weakness: Fire",
            "source": 1310,
            "ID": 10013103
          },
          "10013104": {
            "name": "From Shattered Sky, I Free Fall",
            "desc": "The \"From Shattered Sky, I Free Fall\" effect cannot be triggered yet.",
            "source": 1310,
            "ID": 10013104
          },
          "10013105": {
            "name": "In Finalized Morrow, I Full Bloom",
            "desc": "Fire RES PEN increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Fire RES PEN Boost",
            "source": 1310,
            "ID": 10013105
          },
          "10013106": {
            "name": "Module γ: Core Overload",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 1310,
            "ID": 10013106
          }
        },
        "Traces": {
          "A2": {
            "name": "Module α: Antilag Outburst",
            "desc": "During the Complete Combustion, attacking enemies that have no Fire Weakness can also reduce their Toughness, with the effect being equivalent to <unbreak>#1[i]%</unbreak> of the original Toughness Reduction from abilities.",
            "owner": 1310,
            "ID": 1310101,
            "Ascension": 2
          },
          "A4": {
            "name": "Module β: Autoreactive Armor",
            "desc": "When SAM is in Complete Combustion with a Break Effect that is equal to or greater than <unbreak>#1[i]%</unbreak>/<unbreak>#2[i]%</unbreak>, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of <unbreak>#3[i]%</unbreak>/<unbreak>#4[i]%</unbreak> Super Break DMG.",
            "owner": 1310,
            "ID": 1310102,
            "Ascension": 4
          },
          "A6": {
            "name": "Module γ: Core Overload",
            "desc": "For every <unbreak>#2[i]</unbreak> point(s) of SAM's ATK that exceeds <unbreak>#1[i]</unbreak>, increases this unit's Break Effect by <unbreak>#3[f1]%</unbreak>.",
            "owner": 1310,
            "ID": 1310103,
            "Ascension": 6
          }
        }
      },
      "1312": {
        "Name": "Misha",
        "Abilities": {
          "131201": {
            "name": "E—Excuse Me, Please!",
            "desc": "Deals minor Ice DMG to a single enemy.",
            "longdesc": "Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Misha's ATK to a single target enemy."
          },
          "131202": {
            "name": "R—Room Service!",
            "desc": "Deals Ice DMG to an enemy and minor Ice DMG to enemies adjacent to them. In addition, increases Misha's next <color=#f29e38ff>Ultimate's Hits Per Action</color>.",
            "longdesc": "Increases the Hits Per Action for Misha's next Ultimate by <unbreak>#3[i]</unbreak> hit(s). Deals Ice DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Misha's ATK to a single target enemy, and Ice DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Misha's ATK to adjacent targets."
          },
          "131203": {
            "name": "G—Gonna Be Late!",
            "desc": "Deals minor Ice DMG to single enemies. The attack bounces <color=#f29e38ff><unbreak>#1[i]</unbreak></color> times by default and up to a maximum of <color=#f29e38ff><unbreak>#5[i]</unbreak></color> times. Before each hit lands, there is a minor chance to <color=#f29e38ff>Freeze</color> the target.",
            "longdesc": "Has <unbreak>#1[i]</unbreak> Hits Per Action by default. First, uses 1 hit to deal Ice DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Misha's ATK to a single target enemy. Then, the rest of the hits each deals Ice DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Misha's ATK to a single random enemy. Just before each hit lands, there is a <color=#f29e38ff><unbreak>#3[f1]%</unbreak></color> <u>base chance</u> to Freeze the target, lasting for 1 turn.\\nWhile Frozen, enemy targets cannot take any actions, and at the start of their turn, they receive <u>Additional Ice DMG</u> equal to <color=#f29e38ff><unbreak>#4[i]%</unbreak></color> of Misha's ATK.\\nThis Ultimate can possess up to <unbreak>#5[i]</unbreak> Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level."
          },
          "131204": {
            "name": "Horological Escapement",
            "desc": "For <color=#f29e38ff>every 1 Skill Point allies consume</color>, Misha's next Ultimate <color=#f29e38ff>delivers more Hits Per Action</color>, and Misha regenerates his Energy.",
            "longdesc": "For every 1 Skill Point allies consume, Misha's next Ultimate delivers <unbreak>#2[i]</unbreak> more Hit(s) Per Action, and Misha regenerates <color=#f29e38ff><unbreak>#1[f1]</unbreak></color> Energy."
          },
          "131206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "131207": {
            "name": "Wait, You Are So Beautiful!",
            "desc": "Creates a Special Dimension that stops all enemies within. Upon entering battle against enemies within the dimension, Misha's <color=#f29e38ff>next Ultimate deals more Hits Per Action</color>.",
            "longdesc": "After using the Technique, creates a Special Dimension that lasts for <unbreak>#1[i]</unbreak> seconds. Enemies caught in the Special Dimension are inflicted with Dream Prison and stop all their actions. Upon entering battle against enemies afflicted with Dream Prison, increases the Hits Per Action for Misha's next Ultimate by <unbreak>#2[i]</unbreak> hit(s). Only 1 dimension created by allies can exist at the same time."
          }
        },
        "Eidolons": {
          "131201": {
            "name": "Whimsicality of Fancy",
            "desc": "When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the current Ultimate by <unbreak>#1[i]</unbreak> hit(s), up to a maximum increase of <unbreak>#2[i]</unbreak> hit(s)."
          },
          "131202": {
            "name": "Yearning of Youth",
            "desc": "Before each hit of the Ultimate lands, there is a <unbreak>#3[i]%</unbreak> base chance of reducing the target's DEF by <unbreak>#1[i]%</unbreak> for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "131203": {
            "name": "Vestige of Happiness",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "131204": {
            "name": "Visage of Kinship",
            "desc": "Increases the DMG multiplier for each hit of the Ultimate by <unbreak>#1[i]%</unbreak>."
          },
          "131205": {
            "name": "Genesis of First Love",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "131206": {
            "name": "Estrangement of Dream",
            "desc": "When using the Ultimate, increases own DMG by <unbreak>#2[i]%</unbreak>, lasting until the end of the turn. In addition, the next time the Skill is used, recovers <unbreak>#1[i]</unbreak> Skill Point(s) for the team."
          }
        },
        "Effects": {
          "10013121": {
            "name": "Estrangement of Dream",
            "desc": "Increases DMG dealt by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Boost",
            "source": 1312,
            "ID": 10013121
          },
          "10013122": {
            "name": "G—Gonna Be Late!",
            "desc": "The Ultimate's Hits Per Action.",
            "source": 1312,
            "ID": 10013122
          },
          "10013123": {
            "name": "Interlock",
            "desc": "Increases Effect Hit Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Effect Hit Rate Boost",
            "source": 1312,
            "ID": 10013123
          },
          "10013124": {
            "name": "Yearning of Youth",
            "desc": "Reduces DEF by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DEF Reduction",
            "source": 1312,
            "ID": 10013124
          },
          "10013125": {
            "name": "Estrangement of Dream",
            "desc": "Allies recover <color=#f29e38ff><unbreak>#1[i]</unbreak></color> Skill Point(s) after the next time they use a Skill.",
            "source": 1312,
            "ID": 10013125
          }
        },
        "Traces": {
          "A2": {
            "name": "Release",
            "desc": "Before the Ultimate's first hit lands, increases the base chance of Freezing the target by <unbreak>#1[i]%</unbreak>.",
            "owner": 1312,
            "ID": 1312101,
            "Ascension": 2
          },
          "A4": {
            "name": "Interlock",
            "desc": "When using the Ultimate, increases the Effect Hit Rate by <unbreak>#1[i]%</unbreak>, lasting until the end of the current Ultimate's action.",
            "owner": 1312,
            "ID": 1312102,
            "Ascension": 4
          },
          "A6": {
            "name": "Transmission",
            "desc": "When dealing DMG to Frozen enemies, increases CRIT DMG by <unbreak>#1[i]%</unbreak>.",
            "owner": 1312,
            "ID": 1312103,
            "Ascension": 6
          }
        }
      },
      "1314": {
        "Name": "Jade",
        "Abilities": {
          "131401": {
            "name": "Lash of Riches",
            "desc": "Deals minor Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Jade's ATK to a single target enemy, and Quantum DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of Jade's ATK to adjacent enemies."
          },
          "131402": {
            "name": "Acquisition Surety",
            "desc": "Makes a single ally become the <color=#f29e38ff>Debt Collector</color> and increases their SPD. After the <color=#f29e38ff>Debt Collector</color> attacks, deals minor <u>Additional</u> Quantum DMG to each enemy target hit and consume the Collector's own HP. When Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume her HP.",
            "longdesc": "Makes a single target ally become the Debt Collector and increases their SPD by <unbreak>#1[i]</unbreak>, lasting for <unbreak>#4[i]</unbreak> turn(s).\\nAfter the Debt Collector attacks, deals 1 instance of <u>Additional</u> Quantum DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to <unbreak>#2[i]%</unbreak> of their Max HP. If the current HP is insufficient, reduces HP to 1.\\nIf Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume HP.\\nWhen the Debt Collector exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration decreases by 1 turn."
          },
          "131403": {
            "name": "Vow of the Deep",
            "desc": "Deals Quantum DMG to all enemies and this unit's <color=#f29e38ff><u>follow-up attack</u></color> DMG multiplier increases.",
            "longdesc": "Deals Quantum DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's <u>follow-up attack</u>, increasing its DMG multiplier by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. This enhancement can take effect <unbreak>#2[i]</unbreak> time(s)."
          },
          "131404": {
            "name": "Fang of Flare Flaying",
            "desc": "After Jade or the <color=#f29e38ff>Debt Collector</color> unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching <color=#f29e38ff><unbreak>#3[i]</unbreak></color> points of Charge, consumes the <color=#f29e38ff><unbreak>#3[i]</unbreak></color> points to launch 1 instance of <color=#f29e38ff><u>follow-up attack</u></color>, dealing Quantum DMG to all enemies.\\nWhen Jade launches the <color=#f29e38ff><u>follow-up attack</u></color>, gains Pawned Asset and increases CRIT DMG, stacking up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> times.",
            "longdesc": "After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching <unbreak>#3[i]</unbreak> points of Charge, consumes the <unbreak>#3[i]</unbreak> points to launch 1 instance of <u>follow-up attack</u>, dealing Quantum DMG equal to <color=#f29e38ff><unbreak>#5[i]%</unbreak></color> of Jade's ATK to all enemies. This <u>follow-up attack</u> does not generate Charge.\\nWhen launching her Talent's <u>follow-up attack</u>, Jade immediately gains <unbreak>#4[i]</unbreak> stack(s) of Pawned Asset, with each stack increasing CRIT DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>, stacking up to <unbreak>#2[i]</unbreak> times."
          },
          "131406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "131407": {
            "name": "Visionary Predation",
            "desc": "Inflicts Blind Fealty on enemies within a set area. Attacking an enemy with Blind Fealty causes all enemies with Blind Fealty to enter combat simultaneously. Upon entering combat, deals minor Quantum DMG to all enemies and immediately gains <color=#f29e38ff><unbreak>#3[i]</unbreak></color> stack(s) of Pawned Asset.",
            "longdesc": "After using the Technique, inflicts enemies within a set area with Blind Fealty for <unbreak>#1[i]</unbreak> second(s). Enemies inflicted with Blind Fealty will not initiate attacks on allies. When entering battle via actively attacking enemies inflicted with Blind Fealty, all enemies with Blind Fealty will enter combat simultaneously. After entering battle, deals Quantum DMG equal to <unbreak>#2[i]%</unbreak> of Jade's ATK to all enemies, and immediately gains <unbreak>#3[i]</unbreak> stack(s) of Pawned Asset."
          }
        },
        "Eidolons": {
          "131401": {
            "name": "Altruism? Nevertheless Tradable",
            "desc": "The follow-up attack DMG from Jade's Talent increases by <unbreak>#1[i]%</unbreak>. After the Debt Collector character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains <unbreak>#2[i]</unbreak> or <unbreak>#3[i]</unbreak> point(s) of Charge respectively."
          },
          "131402": {
            "name": "Morality? Herein Authenticated",
            "desc": "When there are <unbreak>#1[i]</unbreak> stacks of Pawned Asset, Jade's CRIT Rate increases by <unbreak>#2[i]%</unbreak>."
          },
          "131403": {
            "name": "Honesty? Soon Mortgaged",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "131404": {
            "name": "Sincerity? Put Option Only",
            "desc": "When using Ultimate, enables the DMG dealt by Jade to ignore <unbreak>#1[i]%</unbreak> of enemy targets' DEF, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "131405": {
            "name": "Hope? Hitherto Forfeited",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "131406": {
            "name": "Equity? Pending Sponsorship",
            "desc": "When the Debt Collector character exists on the field, Jade's Quantum RES PEN increases by <unbreak>#1[i]%</unbreak>, and Jade gains the Debt Collector state."
          }
        },
        "Effects": {
          "10013141": {
            "name": "Pawned Asset",
            "desc": "Each stack increases CRIT DMG by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "effect": "Pawned Asset",
            "source": 1314,
            "ID": 10013141
          },
          "10013142": {
            "name": "Debt Collector",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>. After using an attack, consumes a small amount of HP. For each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.",
            "effect": "Debt Collector",
            "source": 1314,
            "ID": 10013142
          },
          "10013143": {
            "name": "Debt Collector",
            "desc": "After using an attack, for each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.",
            "effect": "Debt Collector",
            "source": 1314,
            "ID": 10013143
          },
          "10013144": {
            "name": "Creditor",
            "desc": "Assigning Debt Collector.",
            "source": 1314,
            "ID": 10013144
          },
          "10013145": {
            "name": "Follow-Up Attack Boost",
            "desc": "Increases the multiplier for the DMG dealt by Talent's follow-up attack by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. This can take effect for up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> time(s).",
            "effect": "Follow-Up Attack Boost",
            "source": 1314,
            "ID": 10013145
          },
          "10013146": {
            "name": "Debt Collector",
            "desc": "Increases SPD by <color=#f29e38ff><unbreak>#1[i]</unbreak></color>. After using an attack, consumes a small amount of HP. For each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.",
            "effect": "Debt Collector",
            "source": 1314,
            "ID": 10013146
          },
          "10013147": {
            "name": "Debt Collector",
            "desc": "Quantum RES PEN increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. After attacking, for each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.",
            "effect": "Debt Collector",
            "source": 1314,
            "ID": 10013147
          },
          "10013148": {
            "name": "Sincerity? Put Option Only",
            "desc": "Ignores <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of enemy targets' DEF.",
            "effect": "Sincerity? Put Option Only",
            "source": 1314,
            "ID": 10013148
          },
          "10013149": {
            "name": "Morality? Herein Authenticated",
            "desc": "Increases CRIT Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "CRIT Rate Boost",
            "source": 1314,
            "ID": 10013149
          }
        },
        "Traces": {
          "A2": {
            "name": "Reverse Repo",
            "desc": "When an enemy target enters combat, Jade gains <unbreak>#2[i]</unbreak> stack(s) of Pawned Asset. When the Debt Collector character's turn starts, additionally gains <unbreak>#1[i]</unbreak> stack(s) of Pawned Asset.",
            "owner": 1314,
            "ID": 1314101,
            "Ascension": 2
          },
          "A4": {
            "name": "Collateral Ticket",
            "desc": "When the battle starts, Jade's action is advanced forward by <unbreak>#1[i]%</unbreak>.",
            "owner": 1314,
            "ID": 1314102,
            "Ascension": 4
          },
          "A6": {
            "name": "Asset Forfeiture",
            "desc": "Each Pawned Asset stack from the Talent additionally increases Jade's ATK by <unbreak>#1[f1]%</unbreak>.",
            "owner": 1314,
            "ID": 1314103,
            "Ascension": 6
          }
        }
      },
      "1315": {
        "Name": "Boothill",
        "Abilities": {
          "131501": {
            "name": "Skullcrush Spurs",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Boothill's ATK to a single target enemy."
          },
          "131502": {
            "name": "Sizzlin' Tango",
            "desc": "Initiates <color=#f29e38ff>Standoff</color>. After the target in the Standoff is <color=#f29e38ff>defeated or Weakness Broken</color>, Boothill receives Pocket Trickshot and dispels the Standoff. Boothill <color=#f29e38ff>gains Enhanced Basic ATK</color> and this turn does not end.",
            "longdesc": "Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for <unbreak>#3[i]</unbreak> turn(s). This duration decreases by 1 at the start of Boothill's every turn.\\nThe enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>/<unbreak>#2[i]%</unbreak>.\\nAfter this target is defeated or becomes Weakness Broken, Boothill gains 1 stack of Pocket Trickshot, then dispels the Standoff.\\nThis Skill cannot regenerate Energy. After using this Skill, the current turn does not end."
          },
          "131503": {
            "name": "Dust Devil's Sunset Rodeo",
            "desc": "<color=#f29e38ff>Applies Physical Weakness</color> to a single enemy, deals massive Physical DMG to them, and delays their action.",
            "longdesc": "Applies Physical Weakness to a single target enemy, lasting for <unbreak>#3[i]</unbreak> turn(s).\\nDeals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of Boothill's ATK to the target and <u>delays their action</u> by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>."
          },
          "131504": {
            "name": "Five Peas in a Pod",
            "desc": "Pocket Trickshot increases the Enhanced Basic ATK's Toughness Reduction and additionally deals Physical <color=#f29e38ff>Break DMG</color> <color=#f29e38ff>if the target is Weakness Broken</color>. After winning the battle, retains Pocket Trickshot for the next battle.",
            "longdesc": "Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by <unbreak>#4[i]%</unbreak>, stacking up to <unbreak>#5[i]</unbreak> time(s).\\nIf the target is <u>Weakness Broken</u> while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals <u>Break DMG</u> to this target equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>/<color=#f29e38ff><unbreak>#2[i]%</unbreak></color>/<color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed <unbreak>#6[i]</unbreak> times the base Toughness Reduction of the Basic Attack \"Skullcrush Spurs.\"\\nAfter winning the battle, Boothill can retain Pocket Trickshot for the next battle."
          },
          "131506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "131507": {
            "name": "3-9× Smile",
            "desc": "After the Technique is used, <color=#f29e38ff>inflicts Physical Weakness</color> on a single enemy when casting the Skill for the first time in the next battle.",
            "longdesc": "After the Technique is used, when casting the Skill for the first time in the next battle, applies the same Physical Weakness to the target as the one induced by the Ultimate, lasting for <unbreak>#1[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "131501": {
            "name": "Dusty Trail's Lone Star",
            "desc": "When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores <unbreak>#1[i]%</unbreak> of the enemy target's DEF."
          },
          "131502": {
            "name": "Milestonemonger",
            "desc": "When in Standoff and gaining Pocket Trickshot, recovers <unbreak>#1[i]</unbreak> Skill Point(s) and increases Break Effect by <unbreak>#2[i]%</unbreak>, lasting for <unbreak>#3[i]</unbreak> turn(s). Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn."
          },
          "131503": {
            "name": "Marble Orchard's Guard",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "131504": {
            "name": "Cold Cuts Chef",
            "desc": "When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by <unbreak>#1[i]%</unbreak>. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by <unbreak>#2[i]%</unbreak>."
          },
          "131505": {
            "name": "Stump Speech",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "131506": {
            "name": "Crowbar Hotel's Raccoon",
            "desc": "When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to <unbreak>#1[i]%</unbreak> of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to <unbreak>#2[i]%</unbreak> of the original DMG multiplier."
          }
        },
        "Effects": {
          "10013151": {
            "name": "Pocket Trickshot",
            "desc": "Every stack increases the Toughness Reduction of the Enhanced Basic Attack by <color=#f29e38ff><unbreak>#2[i]%</unbreak></color>. If the target is Weakness Broken while the Enhanced Basic ATK is being used, deals additional Physical Break DMG based on the number of Pocket Trickshot stacks. This effect can stack up to <color=#f29e38ff><unbreak>#1[i]</unbreak></color> time(s).",
            "effect": "Pocket Trickshot",
            "source": 1315,
            "ID": 10013151
          },
          "10013152": {
            "name": "Extra Physical Weakness",
            "desc": "Implanted with extra Physical Weakness.",
            "effect": "Implant Weakness: Physical",
            "source": 1315,
            "ID": 10013152
          },
          "10013153": {
            "name": "Standoff",
            "desc": "This is considered a Taunt state and only <color=#f29e38ff>%CasterName</color> can be selected as the attack target. Increases DMG received by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> when attacked by <color=#f29e38ff>%CasterName</color>.",
            "effect": "Standoff",
            "source": 1315,
            "ID": 10013153
          },
          "10013154": {
            "name": "Standoff",
            "desc": "When getting attacked by the target in the Standoff, increases the DMG received by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. The Basic ATK becomes Enhanced.",
            "effect": "Standoff",
            "source": 1315,
            "ID": 10013154
          },
          "10013155": {
            "name": "Milestonemonger",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 1315,
            "ID": 10013155
          },
          "10013156": {
            "name": "Milestonemonger",
            "desc": "Milestonemonger's effect cannot be triggered yet.",
            "source": 1315,
            "ID": 10013156
          },
          "10013157": {
            "name": "3-9× Smile",
            "desc": "The first time the Skill is used in a battle, applies the same Physical Weakness to a single target enemy as the one induced by the Ultimate, lasting for <color=#f29e38ff><unbreak>#1[i]</unbreak></color> turn(s).",
            "source": 1315,
            "ID": 10013157
          }
        },
        "Traces": {
          "A2": {
            "name": "Ghost Load",
            "desc": "Increase this character's CRIT Rate/CRIT DMG, by an amount equal to <unbreak>#1[i]%</unbreak>/<unbreak>#3[i]%</unbreak> of Break Effect, up to a max increase of <unbreak>#2[i]%</unbreak>/<unbreak>#4[i]%</unbreak>.",
            "owner": 1315,
            "ID": 1315101,
            "Ascension": 2
          },
          "A4": {
            "name": "Above Snakes",
            "desc": "While Boothill is in the Standoff, reduces the DMG he receives from targets that are not in the Standoff by <unbreak>#1[i]%</unbreak>.",
            "owner": 1315,
            "ID": 1315102,
            "Ascension": 4
          },
          "A6": {
            "name": "Point Blank",
            "desc": "When in Standoff and gaining Pocket Trickshot, regenerates <unbreak>#1[i]</unbreak> Energy. Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit.",
            "owner": 1315,
            "ID": 1315103,
            "Ascension": 6
          }
        }
      },
      "8001": {
        "Name": "Caelus (Destruction)",
        "Abilities": {
          "800101": {
            "name": "Farewell Hit",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy."
          },
          "800102": {
            "name": "RIP Home Run",
            "desc": "Deals Physical DMG to a single enemy and enemies adjacent to it.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
          },
          "800103": {
            "name": "Stardust Ace",
            "desc": "Uses Single Target ATK or Blast to strike with full force.",
            "longdesc": "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy, and Physical DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of the Trailblazer's ATK to enemies adjacent to it."
          },
          "800104": {
            "name": "Perfect Pickoff",
            "longdesc": "Each time after this character inflicts Weakness Break on an enemy, ATK increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. This effect stacks up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "800106": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800107": {
            "name": "Immortal Third Strike",
            "longdesc": "Immediately heals all allies for <unbreak>#1[i]%</unbreak> of their respective Max HP after using this Technique."
          }
        },
        "Eidolons": {
          "800101": {
            "name": "A Falling Star",
            "desc": "When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates <unbreak>#1[i]</unbreak> extra Energy. This effect can only be triggered once per attack."
          },
          "800102": {
            "name": "An Unwilling Host",
            "desc": "Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's ATK."
          },
          "800103": {
            "name": "A Leading Whisper",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800104": {
            "name": "A Destructing Glance",
            "desc": "When attacking an enemy with Weakness Break, CRIT Rate is increased by <unbreak>#1[i]%</unbreak>."
          },
          "800105": {
            "name": "A Surviving Hope",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800106": {
            "name": "A Trailblazing Will",
            "desc": "The Trailblazer's Talent is also triggered when they defeat an enemy."
          }
        },
        "Effects": {
          "10080012": {
            "name": "Perfect Pickoff",
            "desc": "Each stack increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "ATK Boost",
            "source": 8001,
            "ID": 10080012
          },
          "10080013": {
            "name": "Tenacity",
            "desc": "Each stack increases DEF by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "DEF Boost",
            "source": 8001,
            "ID": 10080013
          }
        },
        "Traces": {
          "A2": {
            "name": "Ready for Battle",
            "desc": "At the start of the battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 8001,
            "ID": 8001101,
            "Ascension": 2
          },
          "A4": {
            "name": "Tenacity",
            "desc": "Each Talent stack increases the Trailblazer's DEF by <unbreak>#1[i]%</unbreak>.",
            "owner": 8001,
            "ID": 8001102,
            "Ascension": 4
          },
          "A6": {
            "name": "Fighting Will",
            "desc": "When using Skill or Ultimate \"Blowout: RIP Home Run,\" DMG dealt to the target enemy is increased by <unbreak>#1[i]%</unbreak>.",
            "owner": 8001,
            "ID": 8001103,
            "Ascension": 6
          }
        }
      },
      "8002": {
        "Name": "Stelle (Destruction)",
        "Abilities": {
          "800201": {
            "name": "Farewell Hit",
            "desc": "Deals minor Physical DMG to a single enemy.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy."
          },
          "800202": {
            "name": "RIP Home Run",
            "desc": "Deals Physical DMG to a single enemy and enemies adjacent to it.",
            "longdesc": "Deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
          },
          "800203": {
            "name": "Stardust Ace",
            "desc": "Uses Single Target ATK or Blast to strike with full force.",
            "longdesc": "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy, and Physical DMG equal to <color=#f29e38ff><unbreak>#3[i]%</unbreak></color> of the Trailblazer's ATK to enemies adjacent to it."
          },
          "800204": {
            "name": "Perfect Pickoff",
            "longdesc": "Each time after this character inflicts Weakness Break on an enemy, ATK increases by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. This effect stacks up to <unbreak>#2[i]</unbreak> time(s)."
          },
          "800206": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800207": {
            "name": "Immortal Third Strike",
            "longdesc": "Immediately heals all allies for <unbreak>#1[i]%</unbreak> of their respective Max HP after using this Technique."
          }
        },
        "Eidolons": {
          "800201": {
            "name": "A Falling Star",
            "desc": "When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates <unbreak>#1[i]</unbreak> extra Energy. This effect can only be triggered once per attack."
          },
          "800202": {
            "name": "An Unwilling Host",
            "desc": "Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's ATK."
          },
          "800203": {
            "name": "A Leading Whisper",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800204": {
            "name": "A Destructing Glance",
            "desc": "When attacking an enemy with Weakness Break, CRIT Rate is increased by <unbreak>#1[i]%</unbreak>."
          },
          "800205": {
            "name": "A Surviving Hope",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800206": {
            "name": "A Trailblazing Will",
            "desc": "The Trailblazer's Talent is also triggered when they defeat an enemy."
          }
        },
        "Effects": {
          "10080022": {
            "name": "Perfect Pickoff",
            "desc": "Each stack increases ATK by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "ATK Boost",
            "source": 8002,
            "ID": 10080022
          },
          "10080023": {
            "name": "Tenacity",
            "desc": "Each stack increases DEF by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "DEF Boost",
            "source": 8002,
            "ID": 10080023
          }
        },
        "Traces": {
          "A2": {
            "name": "Ready for Battle",
            "desc": "At the start of the battle, immediately regenerates <unbreak>#1[i]</unbreak> Energy.",
            "owner": 8002,
            "ID": 8002101,
            "Ascension": 2
          },
          "A4": {
            "name": "Tenacity",
            "desc": "Each Talent stack increases the Trailblazer's DEF by <unbreak>#1[i]%</unbreak>.",
            "owner": 8002,
            "ID": 8002102,
            "Ascension": 4
          },
          "A6": {
            "name": "Fighting Will",
            "desc": "When using Skill or Ultimate \"Blowout: RIP Home Run,\" DMG dealt to the target enemy is increased by <unbreak>#1[i]%</unbreak>.",
            "owner": 8002,
            "ID": 8002103,
            "Ascension": 6
          }
        }
      },
      "8003": {
        "Name": "Caelus (Preservation)",
        "Abilities": {
          "800301": {
            "name": "Ice-Breaking Light",
            "desc": "Deals minor Fire DMG to a single enemy and gains Magma Will.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy and gains 1 stack of Magma Will."
          },
          "800302": {
            "name": "Ever-Burning Amber",
            "desc": "Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.",
            "longdesc": "Increases the Trailblazer's DMG Reduction by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and gains 1 stack of Magma Will, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to Taunt all enemies for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "800303": {
            "name": "War-Flaming Lance",
            "desc": "Deals Fire DMG to all enemies and enhances this unit's next Basic ATK.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK plus <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
          },
          "800304": {
            "name": "Treasure of the Architects",
            "longdesc": "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of <unbreak>#3[i]</unbreak> stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of the Trailblazer's DEF plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>. The Shield lasts for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "800306": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800307": {
            "name": "Call of the Guardian",
            "longdesc": "After using Technique, at the start of the next battle, gains a Shield that absorbs DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF plus <unbreak>#2[i]</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "800301": {
            "name": "Earth-Shaking Resonance",
            "desc": "When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to <unbreak>#2[i]%</unbreak> of the Trailblazer's DEF."
          },
          "800302": {
            "name": "Time-Defying Tenacity",
            "desc": "The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF plus <unbreak>#2[i]</unbreak>."
          },
          "800303": {
            "name": "Trail-Blazing Blueprint",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800304": {
            "name": "Nation-Building Oath",
            "desc": "At the start of the battle, immediately gains <unbreak>#1[i]</unbreak> stack(s) of Magma Will."
          },
          "800305": {
            "name": "Spirit-Warming Flame",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800306": {
            "name": "City-Forging Bulwarks",
            "desc": "After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by <unbreak>#1[i]%</unbreak>. Stacks up to <unbreak>#2[i]</unbreak> time(s)."
          }
        },
        "Effects": {
          "10080031": {
            "name": "Magma Will",
            "desc": "When there are 4 or more stacks of Magma Will, Enhances Basic ATK.",
            "source": 8003,
            "ID": 10080031
          },
          "10080032": {
            "name": "War-Flaming Lance",
            "desc": "The next Basic ATK will become an Enhanced Basic ATK and will not consume Magma Will.",
            "effect": "Enhanced Basic ATK",
            "source": 8003,
            "ID": 10080032
          },
          "10080033": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 8003,
            "ID": 10080033
          },
          "10080034": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 8003,
            "ID": 10080034
          },
          "10080036": {
            "name": "DMG Mitigation",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 8003,
            "ID": 10080036
          },
          "10080037": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 8003,
            "ID": 10080037
          },
          "10080038": {
            "name": "DEF Boost",
            "desc": "Each stack increases DEF by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "DEF Boost",
            "source": 8003,
            "ID": 10080038
          },
          "10080039": {
            "name": "DMG Mitigation",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 8003,
            "ID": 10080039
          }
        },
        "Traces": {
          "A2": {
            "name": "The Strong Defend the Weak",
            "desc": "After using the Skill, the DMG taken by all allies reduces by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 8003,
            "ID": 8003101,
            "Ascension": 2
          },
          "A4": {
            "name": "Unwavering Gallantry",
            "desc": "Using Enhanced Basic ATK restores the Trailblazer's HP by <unbreak>#1[i]%</unbreak> of their Max HP.",
            "owner": 8003,
            "ID": 8003102,
            "Ascension": 4
          },
          "A6": {
            "name": "Action Beats Overthinking",
            "desc": "When the Trailblazer is protected by a Shield at the beginning of the turn, increases their ATK by <unbreak>#2[i]%</unbreak> and regenerates <unbreak>#1[i]</unbreak> Energy until the action is over.",
            "owner": 8003,
            "ID": 8003103,
            "Ascension": 6
          }
        }
      },
      "8004": {
        "Name": "Stelle (Preservation)",
        "Abilities": {
          "800401": {
            "name": "Ice-Breaking Light",
            "desc": "Deals minor Fire DMG to a single enemy and gains Magma Will.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy and gains 1 stack of Magma Will."
          },
          "800402": {
            "name": "Ever-Burning Amber",
            "desc": "Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.",
            "longdesc": "Increases the Trailblazer's DMG Reduction by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> and gains 1 stack of Magma Will, with a <unbreak>#2[i]%</unbreak> <u>base chance</u> to Taunt all enemies for <unbreak>#3[i]</unbreak> turn(s)."
          },
          "800403": {
            "name": "War-Flaming Lance",
            "desc": "Deals Fire DMG to all enemies and enhances this unit's next Basic ATK.",
            "longdesc": "Deals Fire DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK plus <color=#f29e38ff><unbreak>#2[i]%</unbreak></color> of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
          },
          "800404": {
            "name": "Treasure of the Architects",
            "longdesc": "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of <unbreak>#3[i]</unbreak> stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color> of the Trailblazer's DEF plus <color=#f29e38ff><unbreak>#4[i]</unbreak></color>. The Shield lasts for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "800406": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800407": {
            "name": "Call of the Guardian",
            "longdesc": "After using Technique, at the start of the next battle, gains a Shield that absorbs DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF plus <unbreak>#2[i]</unbreak> for <unbreak>#3[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "800401": {
            "name": "Earth-Shaking Resonance",
            "desc": "When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to <unbreak>#2[i]%</unbreak> of the Trailblazer's DEF."
          },
          "800402": {
            "name": "Time-Defying Tenacity",
            "desc": "The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's DEF plus <unbreak>#2[i]</unbreak>."
          },
          "800403": {
            "name": "Trail-Blazing Blueprint",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800404": {
            "name": "Nation-Building Oath",
            "desc": "At the start of the battle, immediately gains <unbreak>#1[i]</unbreak> stack(s) of Magma Will."
          },
          "800405": {
            "name": "Spirit-Warming Flame",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800406": {
            "name": "City-Forging Bulwarks",
            "desc": "After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by <unbreak>#1[i]%</unbreak>. Stacks up to <unbreak>#2[i]</unbreak> time(s)."
          }
        },
        "Effects": {
          "10080041": {
            "name": "Magma Will",
            "desc": "When there are 4 or more stacks of Magma Will, Enhances Basic ATK.",
            "source": 8004,
            "ID": 10080041
          },
          "10080042": {
            "name": "War-Flaming Lance",
            "desc": "The next Basic ATK will become an Enhanced Basic ATK and will not consume Magma Will.",
            "effect": "Enhanced Basic ATK",
            "source": 8004,
            "ID": 10080042
          },
          "10080043": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 8004,
            "ID": 10080043
          },
          "10080044": {
            "name": "DMG Mitigation",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 8004,
            "ID": 10080044
          },
          "10080045": {
            "name": "Shield",
            "desc": "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP.",
            "effect": "Shield",
            "source": 8004,
            "ID": 10080045
          },
          "10080046": {
            "name": "DEF Boost",
            "desc": "Each stack increases DEF by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>, up to <color=#f29e38ff><unbreak>#2[i]</unbreak></color> stack(s).",
            "effect": "DEF Boost",
            "source": 8004,
            "ID": 10080046
          },
          "10080047": {
            "name": "DMG Mitigation",
            "desc": "DMG taken -<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "DMG Mitigation",
            "source": 8004,
            "ID": 10080047
          },
          "10080048": {
            "name": "ATK Boost",
            "desc": "ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "ATK Boost",
            "source": 8004,
            "ID": 10080048
          }
        },
        "Traces": {
          "A2": {
            "name": "The Strong Defend the Weak",
            "desc": "After using the Skill, the DMG taken by all allies reduces by <unbreak>#2[i]%</unbreak> for <unbreak>#3[i]</unbreak> turn(s).",
            "owner": 8004,
            "ID": 8004101,
            "Ascension": 2
          },
          "A4": {
            "name": "Unwavering Gallantry",
            "desc": "Using Enhanced Basic ATK restores the Trailblazer's HP by <unbreak>#1[i]%</unbreak> of their Max HP.",
            "owner": 8004,
            "ID": 8004102,
            "Ascension": 4
          },
          "A6": {
            "name": "Action Beats Overthinking",
            "desc": "When the Trailblazer is protected by a Shield at the beginning of the turn, increases their ATK by <unbreak>#2[i]%</unbreak> and regenerates <unbreak>#1[i]</unbreak> Energy until the action is over.",
            "owner": 8004,
            "ID": 8004103,
            "Ascension": 6
          }
        }
      },
      "8005": {
        "Name": "Caelus (Harmony)",
        "Abilities": {
          "800501": {
            "name": "Swing Dance Etiquette",
            "desc": "Deals minor Imaginary DMG to a single enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single target enemy."
          },
          "800502": {
            "name": "Halftime to Make It Rain",
            "desc": "Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a random enemy."
          },
          "800503": {
            "name": "All-Out Footlight Parade",
            "desc": "Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their <color=#f29e38ff>Break Effect increased</color> and additionally deal <color=#f29e38ff><u>Super Break DMG</u></color> 1 time when they attack enemy targets that are <u>Weakness Broken</u>.",
            "longdesc": "Grants all allies the Backup Dancer effect, lasting for <unbreak>#1[i]</unbreak> turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>. And when they attack enemy targets that are in the <u>Weakness Broken state</u>, the Toughness Reduction of the attack will be converted into 1 instance of <u>Super Break DMG</u>."
          },
          "800504": {
            "name": "Full-on Aerial Dance",
            "desc": "The Trailblazer regenerates Energy when an enemy target's Weakness is Broken.",
            "longdesc": "The Trailblazer immediately regenerates <color=#f29e38ff><unbreak>#1[f1]</unbreak></color> Energy when an enemy target's Weakness is Broken."
          },
          "800506": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800507": {
            "name": "Now! I'm the Band!",
            "desc": "At the start of the next battle, increases all allies' Break Effect.",
            "longdesc": "After the Technique is used, at the start of the next battle, all allies' Break Effect increases by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "800501": {
            "name": "Best Seat in the House",
            "desc": "After using Skill for the first time, immediately recovers <unbreak>#1[i]</unbreak> Skill Point(s)."
          },
          "800502": {
            "name": "Jailbreaking Rainbowwalk",
            "desc": "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "800503": {
            "name": "Sanatorium for Rest Notes",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800504": {
            "name": "Dove in Tophat",
            "desc": "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's Break Effect."
          },
          "800505": {
            "name": "Poem Favors Rhythms of Old",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800506": {
            "name": "Tomorrow, Rest in Spotlight",
            "desc": "The number of additional DMG applications by the Skill increases by <unbreak>#1[i]</unbreak>."
          }
        },
        "Effects": {
          "10080051": {
            "name": "Dove in Tophat",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 8005,
            "ID": 10080051
          },
          "10080052": {
            "name": "Backup Dancer",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. And after attacking enemy targets that are Weakness Broken, converts the Toughness Reduction of the attack into 1 instance of Super Break DMG.",
            "effect": "Backup Dancer",
            "source": 8005,
            "ID": 10080052
          },
          "10080053": {
            "name": "Now! I'm the Band!",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 8005,
            "ID": 10080053
          },
          "10080054": {
            "name": "Jailbreaking Rainbowwalk",
            "desc": "Increases Energy Regeneration Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 8005,
            "ID": 10080054
          },
          "10080055": {
            "source": 8005,
            "ID": 10080055
          }
        },
        "Traces": {
          "A2": {
            "name": "Dance With the One",
            "desc": "When the number of enemy targets on the field is 5 (or more)/4/3/2/1, the Super Break DMG triggered by the Backup Dancer effect increases by <unbreak>#1[i]%</unbreak>/<unbreak>#2[i]%</unbreak>/<unbreak>#3[i]%</unbreak>/<unbreak>#4[i]%</unbreak>/<unbreak>#5[i]%</unbreak>.",
            "owner": 8005,
            "ID": 8005101,
            "Ascension": 2
          },
          "A4": {
            "name": "Shuffle Along",
            "desc": "When using Skill, additionally increases the Toughness Reduction of the first instance of DMG by <unbreak>#1[i]%</unbreak>.",
            "owner": 8005,
            "ID": 8005102,
            "Ascension": 4
          },
          "A6": {
            "name": "Hat of the Theater",
            "desc": "Additionally delays the enemy target's action by <unbreak>#1[i]%</unbreak> when allies Break enemy Weaknesses.",
            "owner": 8005,
            "ID": 8005103,
            "Ascension": 6
          }
        }
      },
      "8006": {
        "Name": "Stelle (Harmony)",
        "Abilities": {
          "800601": {
            "name": "Swing Dance Etiquette",
            "desc": "Deals minor Imaginary DMG to a single enemy.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single enemy."
          },
          "800602": {
            "name": "Halftime to Make It Rain",
            "desc": "Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.",
            "longdesc": "Deals Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to <color=#f29e38ff><unbreak>#1[i]%</unbreak></color> of the Trailblazer's ATK to a random enemy."
          },
          "800603": {
            "name": "All-Out Footlight Parade",
            "desc": "Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their <color=#f29e38ff>Break Effect increased</color> and additionally deal <color=#f29e38ff><u>Super Break DMG</u></color> 1 time when they attack enemy targets that are <u>Weakness Broken</u>.",
            "longdesc": "Grants all allies the Backup Dancer effect, lasting for <unbreak>#1[i]</unbreak> turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by <color=#f29e38ff><unbreak>#3[i]%</unbreak></color>. And when they attack enemy targets that are in the <u>Weakness Broken state</u>, the Toughness Reduction of the attack will be converted into 1 instance of <u>Super Break DMG</u>."
          },
          "800604": {
            "name": "Full-on Aerial Dance",
            "desc": "The Trailblazer regenerates Energy when an enemy target's Weakness is Broken.",
            "longdesc": "The Trailblazer immediately regenerates <color=#f29e38ff><unbreak>#1[f1]</unbreak></color> Energy when an enemy target's Weakness is Broken."
          },
          "800606": {
            "name": "Attack",
            "longdesc": "Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type."
          },
          "800607": {
            "name": "Now! I'm the Band!",
            "desc": "At the start of the next battle, increases all allies' Break Effect.",
            "longdesc": "After the Technique is used, at the start of the next battle, all allies' Break Effect increases by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          }
        },
        "Eidolons": {
          "800601": {
            "name": "Best Seat in the House",
            "desc": "After using Skill for the first time, immediately recovers <unbreak>#1[i]</unbreak> Skill Point(s)."
          },
          "800602": {
            "name": "Jailbreaking Rainbowwalk",
            "desc": "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by <unbreak>#1[i]%</unbreak>, lasting for <unbreak>#2[i]</unbreak> turn(s)."
          },
          "800603": {
            "name": "Sanatorium for Rest Notes",
            "desc": "Skill Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nTalent Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>."
          },
          "800604": {
            "name": "Dove in Tophat",
            "desc": "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to <unbreak>#1[i]%</unbreak> of the Trailblazer's Break Effect."
          },
          "800605": {
            "name": "Poem Favors Rhythms of Old",
            "desc": "Ultimate Lv. +2, up to a maximum of Lv. <unbreak>15</unbreak>.\\nBasic ATK Lv. +1, up to a maximum of Lv. <unbreak>10</unbreak>."
          },
          "800606": {
            "name": "Tomorrow, Rest in Spotlight",
            "desc": "The number of additional DMG applications by the Skill increases by <unbreak>#1[i]</unbreak>."
          }
        },
        "Effects": {
          "10080061": {
            "name": "Dove in Tophat",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[f1]%</unbreak></color>.",
            "source": 8006,
            "ID": 10080061
          },
          "10080062": {
            "name": "Backup Dancer",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>. And after attacking enemy targets that are Weakness Broken, converts the Toughness Reduction of the attack into 1 instance of Super Break DMG.",
            "effect": "Backup Dancer",
            "source": 8006,
            "ID": 10080062
          },
          "10080063": {
            "name": "Now! I'm the Band!",
            "desc": "Increases Break Effect by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "effect": "Break Effect Boost",
            "source": 8006,
            "ID": 10080063
          },
          "10080064": {
            "name": "Jailbreaking Rainbowwalk",
            "desc": "Increases Energy Regeneration Rate by <color=#f29e38ff><unbreak>#1[i]%</unbreak></color>.",
            "source": 8006,
            "ID": 10080064
          },
          "10080065": {
            "source": 8006,
            "ID": 10080065
          }
        },
        "Traces": {
          "A2": {
            "name": "Dance With the One",
            "desc": "When the number of enemy targets on the field is 5 (or more)/4/3/2/1, the Super Break DMG triggered by the Backup Dancer effect increases by <unbreak>#1[i]%</unbreak>/<unbreak>#2[i]%</unbreak>/<unbreak>#3[i]%</unbreak>/<unbreak>#4[i]%</unbreak>/<unbreak>#5[i]%</unbreak>.",
            "owner": 8006,
            "ID": 8006101,
            "Ascension": 2
          },
          "A4": {
            "name": "Shuffle Along",
            "desc": "When using Skill, additionally increases the Toughness Reduction of the first instance of DMG by <unbreak>#1[i]%</unbreak>.",
            "owner": 8006,
            "ID": 8006102,
            "Ascension": 4
          },
          "A6": {
            "name": "Hat of the Theater",
            "desc": "Additionally delays the enemy target's action by <unbreak>#1[i]%</unbreak> when allies Break enemy Weaknesses.",
            "owner": 8006,
            "ID": 8006103,
            "Ascension": 6
          }
        }
      }
    },
    "RelicSets": {
      "101": "Passerby of Wandering Cloud",
      "102": "Musketeer of Wild Wheat",
      "103": "Knight of Purity Palace",
      "104": "Hunter of Glacial Forest",
      "105": "Champion of Streetwise Boxing",
      "106": "Guard of Wuthering Snow",
      "107": "Firesmith of Lava-Forging",
      "108": "Genius of Brilliant Stars",
      "109": "Band of Sizzling Thunder",
      "110": "Eagle of Twilight Line",
      "111": "Thief of Shooting Meteor",
      "112": "Wastelander of Banditry Desert",
      "113": "Longevous Disciple",
      "114": "Messenger Traversing Hackerspace",
      "115": "The Ashblazing Grand Duke",
      "116": "Prisoner in Deep Confinement",
      "117": "Pioneer Diver of Dead Waters",
      "118": "Watchmaker, Master of Dream Machinations",
      "119": "Iron Cavalry Against the Scourge",
      "120": "The Wind-Soaring Valorous",
      "301": "Space Sealing Station",
      "302": "Fleet of the Ageless",
      "303": "Pan-Cosmic Commercial Enterprise",
      "304": "Belobog of the Architects",
      "305": "Celestial Differentiator",
      "306": "Inert Salsotto",
      "307": "Talia: Kingdom of Banditry",
      "308": "Sprightly Vonwacq",
      "309": "Rutilant Arena",
      "310": "Broken Keel",
      "311": "Firmament Frontline: Glamoth",
      "312": "Penacony, Land of the Dreams",
      "313": "Sigonia, the Unclaimed Desolation",
      "314": "Izumo Gensei and Takama Divine Realm",
      "315": "Duran, Dynasty of Running Wolves",
      "316": "Forge of the Kalpagni Lantern",
      "317": "Lushaka, the Sunken Seas",
      "318": "The Wondrous BananAmusement Park"
    },
    "Lightcones": {
      "20000": "Arrows",
      "20001": "Cornucopia",
      "20002": "Collapsing Sky",
      "20003": "Amber",
      "20004": "Void",
      "20005": "Chorus",
      "20006": "Data Bank",
      "20007": "Darting Arrow",
      "20008": "Fine Fruit",
      "20009": "Shattered Home",
      "20010": "Defense",
      "20011": "Loop",
      "20012": "Meshing Cogs",
      "20013": "Passkey",
      "20014": "Adversarial",
      "20015": "Multiplication",
      "20016": "Mutual Demise",
      "20017": "Pioneering",
      "20018": "Hidden Shadow",
      "20019": "Mediation",
      "20020": "Sagacity",
      "21000": "Post-Op Conversation",
      "21001": "Good Night and Sleep Well",
      "21002": "Day One of My New Life",
      "21003": "Only Silence Remains",
      "21004": "Memories of the Past",
      "21005": "The Moles Welcome You",
      "21006": "The Birth of the Self",
      "21007": "Shared Feeling",
      "21008": "Eyes of the Prey",
      "21009": "Landau's Choice",
      "21010": "Swordplay",
      "21011": "Planetary Rendezvous",
      "21012": "A Secret Vow",
      "21013": "Make the World Clamor",
      "21014": "Perfect Timing",
      "21015": "Resolution Shines As Pearls of Sweat",
      "21016": "Trend of the Universal Market",
      "21017": "Subscribe for More!",
      "21018": "Dance! Dance! Dance!",
      "21019": "Under the Blue Sky",
      "21020": "Geniuses' Repose",
      "21021": "Quid Pro Quo",
      "21022": "Fermata",
      "21023": "We Are Wildfire",
      "21024": "River Flows in Spring",
      "21025": "Past and Future",
      "21026": "Woof! Walk Time!",
      "21027": "The Seriousness of Breakfast",
      "21028": "Warmth Shortens Cold Nights",
      "21029": "We Will Meet Again",
      "21030": "This Is Me!",
      "21031": "Return to Darkness",
      "21032": "Carve the Moon, Weave the Clouds",
      "21033": "Nowhere to Run",
      "21034": "Today Is Another Peaceful Day",
      "21035": "What Is Real?",
      "21036": "Dreamville Adventure",
      "21037": "Final Victor",
      "21038": "Flames Afar",
      "21039": "Destiny's Threads Forewoven",
      "21040": "The Day The Cosmos Fell",
      "21041": "It's Showtime",
      "21042": "Indelible Promise",
      "21043": "Concert for Two",
      "21044": "Boundless Choreo",
      "21045": "After the Charmony Fall",
      "21046": "Poised to Bloom",
      "21047": "Shadowed by Night",
      "22000": "Before the Tutorial Mission Starts",
      "22001": "Hey, Over Here",
      "22002": "For Tomorrow's Journey",
      "23000": "Night on the Milky Way",
      "23001": "In the Night",
      "23002": "Something Irreplaceable",
      "23003": "But the Battle Isn't Over",
      "23004": "In the Name of the World",
      "23005": "Moment of Victory",
      "23006": "Patience Is All You Need",
      "23007": "Incessant Rain",
      "23008": "Echoes of the Coffin",
      "23009": "The Unreachable Side",
      "23010": "Before Dawn",
      "23011": "She Already Shut Her Eyes",
      "23012": "Sleep Like the Dead",
      "23013": "Time Waits for No One",
      "23014": "I Shall Be My Own Sword",
      "23015": "Brighter Than the Sun",
      "23016": "Worrisome, Blissful",
      "23017": "Night of Fright",
      "23018": "An Instant Before A Gaze",
      "23019": "Past Self in Mirror",
      "23020": "Baptism of Pure Thought",
      "23021": "Earthly Escapade",
      "23022": "Reforged Remembrance",
      "23023": "Inherently Unjust Destiny",
      "23024": "Along the Passing Shore",
      "23025": "Whereabouts Should Dreams Rest",
      "23026": "Flowing Nightglow",
      "23027": "Sailing Towards a Second Life",
      "23028": "Yet Hope Is Priceless",
      "23029": "Those Many Springs",
      "23030": "Dance at Sunset",
      "23031": "I Venture Forth to Hunt",
      "23032": "Scent Alone Stays True",
      "24000": "On the Fall of an Aeon",
      "24001": "Cruising in the Stellar Sea",
      "24002": "Texture of Memories",
      "24003": "Solitary Healing",
      "24004": "Eternal Calculus"
    },
    "Paths": {
      "Warrior": "Destruction",
      "Rogue": "The Hunt",
      "Mage": "Erudition",
      "Shaman": "Harmony",
      "Warlock": "Nihility",
      "Knight": "Preservation",
      "Priest": "Abundance",
      "undefined": "General"
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
  "getStartedTab": {},
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
      "p5": "<0>Priority</0> - See: Character priority filter. Changing this setting will change the character's priority",
      "p6": "<0>Exclude</0> - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter",
      "p7": "<0>Enhance / grade</0> - Select the minimum enhance to search for and minimum stars for relics to include"
    },
    "Relics": {
      "Title": "Relics",
      "p1": "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats.",
      "p2": "Selected character: Score - The relic's current weight as defined by the scoring algorithm for the currently selected character",
      "p3": "Selected character: Average potential - The relic's potential weight if rolls went into the average weight of the relic's substats",
      "p4": "Selected character: Max potential - The relic's maximum potential weight if all future rolls went into the character's desired stats",
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
      "p3": "Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
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
      "p2": "'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<0/>If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<1/>⚠️ Relics with missing substats may have misleadlingly high buckets, as best-case upgrade analysis assumes the best new substat per character.",
      "p3": "'Top 10' takes the top 10 characters that this relic could be best for, and shows the range of '% perfection' upgrading this relic could result in."
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
      "Import": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) scanner importer",
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
        "Header": "Install and run one of the $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0}) scanner options:",
        "ReliquaryDesc": {
          "Title": "(Recommended) IceDynamix Reliquary Archiver",
          "Link": "Github",
          "OnlineMsg": "Status: Updated for patch {{version}} — New download required",
          "OfflineMsg": "***** Status: Down for maintenance after {{version}} patch *****",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "Imports full inventory and $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) roster"
        },
        "KelzDesc": {
          "Title": "Kel-Z HSR Scanner",
          "Link": "Github",
          "l1": "Inaccurate speed decimals, 5-10 minutes OCR scan",
          "l2": "Imports full inventory and $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) roster"
        },
        "ScorerDesc": {
          "Title": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) Scorer Import",
          "Link": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) scorer",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "No download needed, but limited to $t(common:Relic, {\"count\": 48, \"capitalizeLength\": 0}) from the 8 $t(common:Character, {\"count\": 26, \"capitalizeLength\": 0}) on profile showcase"
        },
        "HoyolabDesc": {
          "Title": "HoyoLab Import",
          "Link": "Instructions",
          "l1": "Inaccurate speed decimals, instant scan",
          "l2": "No download needed, but limited to ingame $t(common:Character, {\"count\": 26, \"capitalizeLength\": 0})' equipped $t(common:Relic, {\"count\": 6, \"capitalizeLength\": 0})"
        },
        "ButtonText": "Upload scanner json file",
        "Or": "or",
        "Placeholder": "Paste json file contents"
      },
      "Stage2": {
        "Or": "OR",
        "FileInfo": "File contains $t(common:RelicWithCount, {\"count\": {{reliccount}} }) and $t(common:CharacterWithCount, {\"count\": {{charactercount}} }).",
        "NoRelics": "Invalid scanner file, please try a different file",
        "RelicsImport": {
          "Label": "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) only. Updates the optimizer with the new dataset of $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) and doesn't overwrite builds.",
          "ButtonText": "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0})"
        },
        "CharactersImport": {
          "Label": "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) only. Updates the optimizer with the new dataset of $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) and doesn't overwrite builds.",
          "ButtonText": "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) & $t(common:Character, {\"count\": 123, \"capitalizeLength\": 0})",
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
        "ErrorMsg": "Invalid save file, please try a different file. Did you mean to use the \"$t(tablabels.import)\" tab?",
        "Label": "File contains $t(common:RelicWithCount, {\"count\": {{reliccount}} }) and $t(common:CharacterWithCount, {\"count\": {{charactercount}} }). Replace your current data with the uploaded data?",
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
      "WarningDescription": "Are you sure you want to clear all $t(common:Relic, {\"count\": 1300, \"capitalizeLength\": 0}) and $t(common:Character, {\"count\": 26, \"capitalizeLength\": 0})?"
    },
    "PartialImport": {
      "OldRelics": "Updated stats for {{count}} existing $t(common:Relic, {\"count\": {{count}}, \"capitalizeLength\": 0})",
      "NewRelics": "Added {{count}} new $t(common:Relic, {\"count\": {{count}}, \"capitalizeLength\": 0})"
    }
  },
  "modals": {
    "Scoring": {
      "StatWeightsHeader": "Stat weights",
      "MainstatsHeader": "Optimal mainstats",
      "WeightMethodology": {
        "Header": "Substat weight methodology",
        "RevealText": "Click to show details",
        "Paragraph1": "Substat weights are graded on a 0.0 to 1.0 scale in increments of 0.25, based on how valuable each stat is to the character. Weights are evaluated based on the following general ruleset:",
        "Paragraph2": "<0><0>Speed weight:</0></0><1>— SPD is given a value of 1.0 for every character. This is due to the importance of speed tuning in team compositions, and the optimizer should be used to maximize each character's stats at a certain speed breakpoint.</1><2/><3><0>CRIT Rate / CRIT Damage weight:</0></3><4>— Crit DPS in general are given the weights 0.75 ATK | 1.0 SPD | 1.0 CR | 1.0 CD, unless they have any other special scaling.</4><5>— ATK is weighted slightly than CR and CD rolls because in general crit substats will provide a higher boost to damage.</5><6/><7><0>HP / DEF weight:</0></7><8>— Defensive supports are given 2.0 weight to distribute between HP and DEF.</8><9>— For each additional (0.75 | 1.0) stat weight that they scale with, deduct 0.5 down to a minimum of 1.0.</9><10>— If 2.0 still remains and one of the stats is worth more than the other (Huohuo and HP% for example), assign a 1.0 / 0.75 split.</10><11>— Offensive supports follow the same ruleset, except they start with 1.5 weight to distribute between HP and DEF.</11><12/><13><0>RES weight:</0></13><14>— Support characters are granted 0.5 RES weight by default, with an additional 0.25 weight if they have synergy with RES or have critical team-saving abilities.</14>",
        "Paragraph3": "These weights are the defaults, but each player may have different preferences. Feel free to adjust the weights to fit a certain playstyle. DPS characters should rely on the optimizer and Combat Score to evaluate their performance in combat, since substats scores don't take into account external factors like team buffs or passive effects."
      },
      "CalculationMethodology": {
        "Header": "Calculations",
        "RevealText": "Click to show details",
        "Paragraph1": "Relic scores are calculated by <2>Score = substatScore / idealScore * {{percentToScore}}</2>. This allows for characters with fewer desired stats to achieve scores comparable to characters with many desired stats.",
        "Paragraph2": "The idealScore is the substatScore for a theoretical perfect relic. By adjusting the score to the maximum possible relic, this means that when a weighted substat is occupied by the main stat, the score value of the remaining substat weights increases.",
        "Paragraph3": "The substatScore is calculated by <2>SubstatScore = weight * normalization * value</2>. The weight of each stat is defined above, on a scale of 0 to 1. The normalization of each stat is calculated based on the ratio of their main stat values to Crit DMG with max value <5>64.8</5>:",
        "Paragraph4": "<0><0><0>$t(common:ShortStats.CRIT DMG) $t(common:ShortStats.Break Effect) = 64.8 / 64.8 == 1.0</0></0><1><0>$t(common:ShortStats.DEF%) = 64.8 / 54.0 == 1.2</0></1><2><0>$t(common:ShortStats.HP%) $t(common:ShortStats.ATK%) $t(common:ShortStats.Effect Hit Rate) $t(common:ShortStats.Effect RES) = 64.8 / 43.2 == 1.5</0></2><3><0>$t(common:ShortStats.CRIT Rate) = 64.8 / 32.4 == 2</0></3></0><1><0><0>$t(common:ShortStats.SPD) = 64.8 / 25.032 == 2.59</0></0><1><0>$t(common:ShortStats.Outgoing Healing Boost) = 64.8 / 34.561 == 1.87</0></1><2><0>$t(common:ShortStats.Energy Regeneration Rate) = 64.8 / 19.439 == 3.33</0></2><3><0>ELEMENTAL DMG = 64.8 / 38.88 == 1.67</0></3></1>",
        "Paragraph5": "Flat ATK/HP/DEF have a separate calculation: Their weights are automatically calculated based on the weights given to their respective % counterparts<3> % stat weight * flat stat low roll / (baseStats[stat] * 2 * % stat low roll)</3>the weight calculation for flat atk for Seele for example would be:<5> 0.75 * 19 / (baseStats.ATK * 2 * 0.03888) = 0.75 * 19 / (640.33 * 2 * 0.03888) = 0.28619</5>.",
        "Paragraph6": "The normalization is calculated based on the normalization for the respective % counterparts:<1><0>64.8 / % main stat value * % stat high roll value / flat stat high roll value</0>. In combination with the adjusted weights, this allows for flat stats to be accurately scored when compared against their % counterparts.</1>",
        "Paragraph7": "A letter grade is assigned based on the number of normalized min rolls of each substat. The score for each min roll is equivalent to <2>{{minRollValue}}</2>\nThe general scale for grade by rolls is<5>F=1, D=2, C=3, B=4, A=5, S=6, SS=7, SSS=8, WTF=9</5> with a <9>+</9> assigned for an additional half roll.",
        "Paragraph8": "Character scores are calculated by <2>Score = sum(relic scores) + sum(main stat scores)</2>. Only the feet/body/sphere/rope relics have main stat scores. The main stat score for a 5 star maxed relic is <5>64.8</5> if the main stat is optimal, otherwise scaled down by the stat weight. Non 5 star relic scores are also scaled down by their maximum enhance. Characters are expected to have 3 full sets, so 3 rolls worth of score is deducted for each missing set.",
        "Paragraph9": "Relics with main stats (body/feet/sphere/rope) are granted extra rolls to compensate for the difficulty of obtaining optimal main stats with desired substats. These numbers were calculated by a simulation of relic rolls accounting for main stat drop rate and expected substat value. These rolls are first multiplied by the min roll value of <2>{{minRollValue}}</2> and then, if the main stat is not optimal, scaled down by the stat weight to obtain the bonus score value.",
        "Paragraph10": "<0><0><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusBodyHPP}}</0></0><1><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusBodyATKP}}</0></1><2><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusBodyDEFP}}</0></2><3><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.CRIT Rate): {{mainStatBonusBodyCR}}</0></3><4><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.CRIT DMG): {{mainStatBonusBodyCD}}</0></4></0><1><0><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.Outgoing Healing Boost): {{mainStatBonusBodyOHB}}</0></0><1><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.Effect Hit Rate): {{mainStatBonusBodyEHR}}</0></1><2><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusFeetHPP}}</0></2><3><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusFeetATKP}}</0></3><4><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusFeetDEFP}}</0></4></1><2><0><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.SPD): {{mainStatBonusFeetSPD}}</0></0><1><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusSphereHPP}}</0></1><2><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusSphereATKP}}</0></2><3><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusSphereDEFP}}</0></3><4><0>$t(common:ReadableParts.PlanarSphere) — Elemental DMG %: {{mainStatBonusSphereElem}}</0></4></2><3><0><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusRopeHPP}}</0></0><1><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusRopeATKP}}</0></1><2><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusRopeDEFP}}</0></2><3><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.Break Effect): {{mainStatBonusRopeBE}}</0></3><4><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.Energy Regeneration Rate): {{mainStatBonusRopeERR}}</0></4></3>",
        "Paragraph11": "This scoring method is still experimental and subject to change, please come by the discord server to share any feedback!"
      },
      "Footer": {
        "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1})",
        "Reset": "Reset to default",
        "ResetAll": "Reset all $t(common:Character, {\"count\": 35, \"capitalizeLength\": 0})",
        "Save": "$t(common:Save, {\"capitalizeLength\": 1}) changes"
      },
      "ResetAllConfirm": {
        "Title": "Reset the scoring algorithm for all characters?",
        "Description": "You will lose any custom scoring settings you have set on any character.",
        "Yes": "$t(common:Yes, {\"capitalizeLength\": 1})",
        "No": "$t(common:No, {\"capitalizeLength\": 1})"
      }
    },
    "0Perms": {},
    "ManyPerms": {
      "Title": "Very large search requested",
      "Text": "This optimization search will take a substantial amount of time to finish. You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats, or use the Substat weight filter to reduce the number of permutations.",
      "Cancel": "$t(common:Cancel, {\"capitalizeLength\": 1}) search",
      "Proceed": "Proceed with search"
    },
    "0Results": {},
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
        "RelicCompleted": "Completed $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0})",
        "EditSuccess": "Successfully edited $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0})",
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
          "SetNotRelic": "The selected set is not a $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0}) set",
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
        "Placeholder": "Customize $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0})",
        "MaxTagPlaceholder_other": "{{count}} $t(common:Character, {\"count\": {{count}}, \"capitalizeLength\": 0}) excluded",
        "MaxTagPlaceholder_zero": "All $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0}) enabled",
        "ModalTitle": "Select $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0}) to exclude"
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
  "relicScorerTab": {
    "Messages": {
      "ThrottleWarning": "Please wait {{seconds}} seconds before retrying",
      "InvalidIdWarning": "Invalid ID",
      "IdLoadError": "Error loading ID",
      "SuccessMsg": "Successfully loaded profile",
      "LookupError": "Error during lookup, please try again in a bit",
      "NoCharacterSelected": "No selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0})",
      "CharacterAlreadyExists": "Selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) already exists"
    },
    "Header": {
      "DowntimeWarning": "The $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0}) scorer may be down for maintenance after the {{game_version}} patch, please try again later",
      "WithVersion": "Enter your account UID to score your profile $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}} )",
      "WithoutVersion": "Enter your account UID to score your profile $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) at level 80 & maxed traces. Log out to refresh instantly."
    },
    "SubmissionBar": {
      "Placeholder": "Account UID",
      "ButtonText": "$t(common:Submit, {\"capitalizeLength\": 1})",
      "AlgorithmButton": "Scoring algorithm"
    },
    "CopyScreenshot": "Copy screenshot",
    "ImportLabels": {
      "Relics": "Import $t(common:Relic, {\"count\": 48, \"capitalizeLength\": 0}) into optimizer",
      "SingleCharacter": "Import selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) & all $t(common:Relic, {\"count\": 48, \"capitalizeLength\": 0}) into optimizer",
      "AllCharacters": "Import all $t(common:Character, {\"count\": 8, \"capitalizeLength\": 0}) & all $t(common:Relic, {\"count\": 48, \"capitalizeLength\": 0}) into optimizer"
    },
    "SimulateRelics": "Simulate $t(common:Relic, {\"count\": 48, \"capitalizeLength\": 0}) on another $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0})",
    "OptimizeOnCharacter": "Optimize $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}) stats"
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
      "RecommendationHeader": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) recommendation character",
      "Rating": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) ratings",
      "CustomCharsHeader": "Custom potential $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0})"
    },
    "Messages": {
      "AddRelicSuccess": "Successfully added $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0})",
      "NoRelicSelected": "No $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0}) selected",
      "DeleteRelicSuccess": "Successfully deleted $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0})"
    },
    "RelicGrid": {
      "Headers": {
        "EquippedBy": "Owner",
        "Set": "Set",
        "Grade": "Grade",
        "Part": "Part",
        "Enhance": "Enhance",
        "Mainstat": "Main\nStat",
        "Mainvalue": "Main Value",
        "hpP": "HP %",
        "atkP": "ATK %",
        "defP": "DEF %",
        "hp": "HP",
        "atk": "ATK",
        "def": "DEF",
        "spd": "SPD",
        "cr": "Crit\nRate",
        "cd": "Crit\nDMG",
        "ehr": "Effect\nHit Rate",
        "res": "Effect\nRES",
        "be": "Break\nEffect",
        "cv": "Crit\nValue"
      },
      "ValueColumns": {
        "SelectedCharacter": {
          "Label": "Selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0})",
          "ScoreCol": {
            "Label": "Selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}): Score",
            "Header": "Selected Char\nScore"
          },
          "AvgPotCol": {
            "Llabel": "Selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}): Average potential",
            "Header": "Selected Char\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "Selected $t(common:Character, {\"count\": 1, \"capitalizeLength\": 0}): Max potential",
            "Header": "Selected Char\nMax Potential"
          }
        },
        "CustomCharacters": {
          "Label": "Custom $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0})",
          "AvgPotCol": {
            "Label": "Custom $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0}): Average potential",
            "Header": "Custom Chars\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "Custom $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0}): Max potential",
            "Header": "Custom Chars\nMax Potential"
          }
        },
        "AllCharacters": {
          "Label": "All $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0})",
          "AvgPotCol": {
            "Label": "All $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0}): Average potential",
            "Header": "All Chars\nAvg Potential"
          },
          "MaxPotCol": {
            "Label": "All $t(common:Character, {\"count\": 10, \"capitalizeLength\": 0}): Max potential",
            "Header": "All Chars\nMax Potential"
          }
        },
        "ComingSoon": {
          "Label": "Coming soon",
          "SetsPotential": {
            "Label": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) / Ornament sets potential",
            "Header": "All Chars\nMax Potential + Sets"
          }
        }
      }
    },
    "Toolbar": {
      "RelicLocator": {
        "Width": "Inventory width",
        "Filter": "Auto filter rows",
        "NoneSelected": "Select a $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0}) to locate",
        "Location": "Location - Row {{rowindex}} / Col {{columnindex}}"
      },
      "InsightOptions": {
        "Buckets": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) Insight: Buckets",
        "Top10": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) Insight: Top 10"
      },
      "PlotOptions": {
        "PlotAll": "Show all $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0})",
        "PlotCustom": "Show custom $t(common:Character, {\"count\": 12, \"capitalizeLength\": 0})"
      },
      "EditRelic": "Edit $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1})",
      "DeleteRelic": {
        "ButtonText": "Delete $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1})",
        "Warning_one": "Delete the selected $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 0})?",
        "Warning_other": "Delete the selected {{count}} $t(common:Relic, {\"count\": {{count}}, \"capitalizeLength\": 0})?"
      },
      "AddRelic": "Add New $t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1})"
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
      "Scorer": "$t(common:Relic, {\"count\": 1, \"capitalizeLength\": 1}) Scorer"
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
