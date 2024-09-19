interface Resources {
  changelogTab: {}
  charactersTab: {
    CharacterMenu: {
      ButtonText: 'Character menu'
      Character: {
        Label: 'Character'
        Options: {
          Add: 'Add new character'
          Edit: 'Edit character / light cone'
          Switch: 'Switch relics with'
          Unequip: 'Unequip character'
          Delete: 'Delete character'
        }
      }
      Build: {
        Label: 'Builds'
        Options: {
          Save: 'Save current build'
          View: 'View saved builds'
        }
      }
      Scoring: {
        Label: 'Scoring'
        Options: {
          ScoringModal: 'Scoring algorithm'
        }
      }
      Priority: {
        Label: 'Priority'
        Options: {
          SortByScore: 'Sort all characters by score'
          MoveToTop: 'Move character to top'
        }
      }
    }
    CopyScreenshot: 'Copy screenshot'
    SearchPlaceholder: 'Search character name'
    GridHeaders: {
      Icon: 'Icon'
      Priority: 'Priority'
      Character: 'Character'
    }
    Messages: {
      RemoveSuccess: 'Successfully removed character'
      UnequipSuccess: 'Successfully unequipped character'
      NoSelectedCharacter: 'No selected character'
      SwitchSuccess: 'Successfully switched relics to $t(gameData:Characters.{{charid}}.Name)'
      SortByScoreWarning: 'Are you sure you want to sort all characters? <0/>You will lose any custom rankings you have set.'
      SaveSuccess: 'Successfully saved build: {{name}}'
      UnequipWarning: 'Are you sure you want to unequip $t(gameData:Characters.{{charid}}.Name)?'
      DeleteWarning: 'Are you sure you want to delete $t(gameData:Characters.{{charid}}.Name)?'
    }
    CharacterPreview: {}
  }
  common: {
    Relic_one: '{{relic, capitalize}}'
    Relic_other: '{{relics, capitalize}}'
    RelicWithCount_one: '{{count}} {{relic, capitalize}}'
    RelicWithCount_other: '{{count}} {{relics, capitalize}}'
    Lightcone_one: '{{light cone, capitalize}}'
    Lightcone_other: '{{light cones, capitalize}}'
    LightconeWithCount_one: '{{count}} {{light cone, capitalize}}'
    LightconeWithCount_other: '{{count}} {{light cones, capitalize}}'
    Cancel: '{{cancel, capitalize}}'
    Confirm: '{{confirm, capitalize}}'
    Submit: '{{submit, capitalize}}'
    Ok: '{{ok, capitalize}}'
    Yes: '{{yes, capitalize}}'
    No: '{{no, capitalize}}'
    Save: '{{save, capitalize}}'
    Score: '{{score, capitalize}}'
    Reset: '{{reset, capitalize}}'
    Maximum: '{{maximum, capitalize}}'
    Minimum: '{{minimum, capitalize}}'
    EidolonNShort: 'E{{eidolon}}'
    SuperimpositionNShort: 'S{{superimposition}}'
    CharacterWithCount_one: '{{count}} {{character, capitalize}}'
    CharacterWithCount_other: '{{count}} {{characters, capitalize}}'
    Character_one: '{{character, capitalize}}'
    Character_other: '{{characters, capitalize}}'
    VerifiedRelicHoverText: 'Relic substats verified by relic scorer (speed decimals)'
    Parts: {
      Head: 'Head'
      Hands: 'Hands'
      Body: 'Body'
      Feet: 'Feet'
      PlanarSphere: 'Planar Sphere'
      LinkRope: 'Link Rope'
    }
    ReadableParts: {
      Head: 'Head'
      Hands: 'Hands'
      Body: 'Body'
      Feet: 'Feet'
      PlanarSphere: 'Sphere'
      LinkRope: 'Rope'
    }
    Stats: {
      'HP%': 'HP%'
      'HP': 'HP'
      'ATK%': 'ATK%'
      'ATK': 'ATK'
      'DEF%': 'DEF%'
      'DEF': 'DEF'
      'SPD%': 'SPD%'
      'SPD': 'SPD'
      'CRIT Rate': 'CRIT Rate'
      'CRIT DMG': 'CRIT DMG'
      'Effect Hit Rate': 'Effect Hit Rate'
      'Effect RES': 'Effect RES'
      'Break Effect': 'Break Effect'
      'Energy Regeneration Rate': 'Energy Regeneration Rate'
      'Outgoing Healing Boost': 'Outgoing Healing Boost'
      'Physical DMG Boost': '$t(gameData:Elements.Physical) DMG Boost'
      'Fire DMG Boost': '$t(gameData:Elements.Fire) DMG Boost'
      'Ice DMG Boost': '$t(gameData:Elements.Ice) DMG Boost'
      'Lightning DMG Boost': '$t(gameData:Elements.Thunder) DMG Boost'
      'Wind DMG Boost': '$t(gameData:Elements.Wind) DMG Boost'
      'Quantum DMG Boost': '$t(gameData:Elements.Quantum) DMG Boost'
      'Imaginary DMG Boost': '$t(gameData:Elements.Imaginary) DMG Boost'
    }
    ShortStats: {
      'HP%': 'HP%'
      'HP': 'HP'
      'ATK%': 'ATK%'
      'ATK': 'ATK'
      'DEF%': 'DEF%'
      'DEF': 'DEF'
      'SPD%': 'SPD%'
      'SPD': 'SPD'
      'CRIT Rate': 'CR'
      'CRIT DMG': 'CD'
      'Effect Hit Rate': 'EHR'
      'Effect RES': 'RES'
      'Break Effect': 'BE'
      'Energy Regeneration Rate': 'ERR'
      'Outgoing Healing Boost': 'OHB'
      'Physical DMG Boost': '$t(gameData:Elements.Physical)'
      'Fire DMG Boost': '$t(gameData:Elements.Fire)'
      'Ice DMG Boost': '$t(gameData:Elements.Ice)'
      'Lightning DMG Boost': '$t(gameData:Elements.Thunder)'
      'Wind DMG Boost': '$t(gameData:Elements.Wind)'
      'Quantum DMG Boost': '$t(gameData:Elements.Quantum)'
      'Imaginary DMG Boost': '$t(gameData:Elements.Imaginary)'
    }
    ShortSpacedStats: {
      'HP%': 'HP %'
      'HP': 'HP'
      'ATK%': 'ATK %'
      'ATK': 'ATK'
      'DEF%': 'DEF %'
      'DEF': 'DEF'
      'SPD%': 'SPD %'
      'SPD': 'SPD'
      'CRIT Rate': 'CR'
      'CRIT DMG': 'CD'
      'Effect Hit Rate': 'EHR'
      'Effect RES': 'RES'
      'Break Effect': 'BE'
      'Energy Regeneration Rate': 'ERR'
      'Outgoing Healing Boost': 'OHB'
      'Physical DMG Boost': '$t(gameData:Elements.Physical)'
      'Fire DMG Boost': '$t(gameData:Elements.Fire)'
      'Ice DMG Boost': '$t(gameData:Elements.Ice)'
      'Lightning DMG Boost': '$t(gameData:Elements.Thunder)'
      'Wind DMG Boost': '$t(gameData:Elements.Wind)'
      'Quantum DMG Boost': '$t(gameData:Elements.Quantum)'
      'Imaginary DMG Boost': '$t(gameData:Elements.Imaginary)'
    }
    ReadableStats: {
      'HP%': 'HP %'
      'HP': 'HP'
      'ATK%': 'ATK %'
      'ATK': 'ATK'
      'DEF%': 'DEF %'
      'DEF': 'DEF'
      'SPD%': 'SPD %'
      'SPD': 'SPD'
      'CRIT Rate': 'CRIT Rate'
      'CRIT DMG': 'CRIT DMG'
      'Effect Hit Rate': 'Effect HIT'
      'Effect RES': 'Effect RES'
      'Break Effect': 'Break Effect'
      'Energy Regeneration Rate': 'Energy Regen'
      'Outgoing Healing Boost': 'Healing Boost'
      'Physical DMG Boost': '$t(gameData:Elements.Physical) DMG'
      'Fire DMG Boost': '$t(gameData:Elements.Fire) DMG'
      'Ice DMG Boost': '$t(gameData:Elements.Ice) DMG'
      'Lightning DMG Boost': '$t(gameData:Elements.Thunder) DMG'
      'Wind DMG Boost': '$t(gameData:Elements.Wind) DMG'
      'Quantum DMG Boost': '$t(gameData:Elements.Quantum) DMG'
      'Imaginary DMG Boost': '$t(gameData:Elements.Imaginary) DMG'
    }
    ShortReadableStats: {
      'HP%': 'HP %'
      'HP': 'HP'
      'ATK%': 'ATK %'
      'ATK': 'ATK'
      'DEF%': 'DEF %'
      'DEF': 'DEF'
      'SPD%': 'SPD %'
      'SPD': 'SPD'
      'CRIT Rate': 'CRIT Rate'
      'CRIT DMG': 'CRIT DMG'
      'Effect Hit Rate': 'HIT'
      'Effect RES': 'RES'
      'Break Effect': 'Break'
      'Energy Regeneration Rate': 'Energy'
      'Outgoing Healing Boost': 'Healing'
      'Physical DMG Boost': '$t(gameData:Elements.Physical)'
      'Fire DMG Boost': '$t(gameData:Elements.Fire)'
      'Ice DMG Boost': '$t(gameData:Elements.Ice)'
      'Lightning DMG Boost': '$t(gameData:Elements.Thunder)'
      'Wind DMG Boost': '$t(gameData:Elements.Wind)'
      'Quantum DMG Boost': '$t(gameData:Elements.Quantum)'
      'Imaginary DMG Boost': '$t(gameData:Elements.Imaginary)'
    }
  }
  gameData: {
    Characters: {
      1001: {
        Name: 'March 7th'
        Abilities: {
          100101: {
            Name: 'Frigid Cold Arrow'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100102: {
            Name: 'The Power of Cuteness'
            Desc: 'Applies a Shield on a single ally.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Provides a single ally with a Shield that can absorb DMG equal to 57% of March 7th's DEF plus 760 for 3 turn(s).\\nIf the ally's current HP percentage is 30% or higher, greatly increases the chance of enemies attacking that ally."
            LongDescWithEidolon: "Provides a single ally with a Shield that can absorb DMG equal to 60.8% of March 7th's DEF plus 845.5 for 3 turn(s).\\nIf the ally's current HP percentage is 30% or higher, greatly increases the chance of enemies attacking that ally."
          }
          100103: {
            Name: 'Glacial Cascade'
            Desc: 'Deals Ice DMG to all enemies, with a chance of Freezing them.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 150% of March 7th's ATK to all enemies. Hit enemies have a 50% base chance to be Frozen for 1 turn(s).\\nWhile Frozen, enemies cannot take action and will receive Additional Ice DMG equal to 60% of March 7th's ATK at the beginning of each turn."
            LongDescWithEidolon: "Deals Ice DMG equal to 162% of March 7th's ATK to all enemies. Hit enemies have a 50% base chance to be Frozen for 1 turn(s).\\nWhile Frozen, enemies cannot take action and will receive Additional Ice DMG equal to 66% of March 7th's ATK at the beginning of each turn."
          }
          100104: {
            Name: 'Girl Power'
            Desc: 'After a Shielded ally is attacked by an enemy, March 7th immediately launches a Counter against the attacker, dealing minor Ice DMG.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'After a Shielded ally is attacked by an enemy, March 7th immediately Counters, dealing Ice DMG equal to 100% of her ATK. This effect can be triggered 2 time(s) each turn.'
            LongDescWithEidolon: 'After a Shielded ally is attacked by an enemy, March 7th immediately Counters, dealing Ice DMG equal to 110% of her ATK. This effect can be triggered 2 time(s) each turn.'
          }
          100106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100107: {
            Name: 'Freezing Beauty'
            Desc: 'Attacks the enemy. After entering battle, there is a high chance of inflicting Freeze on a random enemy.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, there is a 100% base chance to Freeze a random enemy for 1 turn(s).\\nWhile Frozen, the enemy cannot take action and will take Additional Ice DMG equal to 50% of March 7th's ATK at the beginning of each turn."
          }
        }
        Eidolons: {
          100101: {
            Name: 'Memory of You'
            Desc: "Every time March 7th's Ultimate Freezes a target, she regenerates 6 Energy."
          }
          100102: {
            Name: 'Memory of It'
            Desc: "Upon entering battle, grants a Shield equal to 24% of March 7th's DEF plus 320 to the ally with the lowest HP percentage, lasting for 3 turn(s)."
          }
          100103: {
            Name: 'Memory of Everything'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100104: {
            Name: 'Never Forfeit Again'
            Desc: "The Talent's Counter effect can be triggered 1 more time in each turn. The DMG dealt by Counter increases by an amount that is equal to 30% of March 7th's DEF."
          }
          100105: {
            Name: 'Never Forget Again'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100106: {
            Name: 'Just Like This, Always...'
            Desc: 'Allies under the protection of the Shield granted by the Skill restore HP equal to 4% of their Max HP plus 106 at the beginning of each turn.'
          }
        }
        Effects: {
          10010011: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 1001
            ID: 10010011
          }
          10010012: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 1001
            ID: 10010012
          }
          10010013: {
            Name: 'Counter'
            Desc: 'Remaining Counter attempt(s).'
            Source: 1001
            ID: 10010013
          }
        }
        Traces: {
          A2: {
            Name: 'Purify'
            Desc: 'When using the Skill, removes 1 debuff from a target ally.'
            Owner: 1001
            ID: 1001101
            Ascension: 2
          }
          A4: {
            Name: 'Reinforce'
            Desc: 'The duration of the Shield generated from Skill is extended for 1 turn(s).'
            Owner: 1001
            ID: 1001102
            Ascension: 4
          }
          A6: {
            Name: 'Ice Spell'
            Desc: "Increases the Ultimate's base chance to Freeze enemies by 15%."
            Owner: 1001
            ID: 1001103
            Ascension: 6
          }
        }
      }
      1002: {
        Name: 'Dan Heng'
        Abilities: {
          100201: {
            Name: 'Cloudlancer Art: North Wind'
            Desc: 'Deals minor Wind DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100202: {
            Name: 'Cloudlancer Art: Torrent'
            Desc: 'Deals Wind DMG to a single enemy. Upon a CRIT Hit, there is a high chance of Slowing the enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 260% of Dan Heng's ATK to a single enemy.\\nWhen DMG dealt by Skill triggers CRIT Hit, there is a 100% base chance to reduce the target's SPD by 12%, lasting for 2 turn(s)."
            LongDescWithEidolon: "Deals Wind DMG equal to 286% of Dan Heng's ATK to a single enemy.\\nWhen DMG dealt by Skill triggers CRIT Hit, there is a 100% base chance to reduce the target's SPD by 12%, lasting for 2 turn(s)."
          }
          100203: {
            Name: 'Ethereal Dream'
            Desc: 'Deals massive Wind DMG to a single enemy. If the enemy is Slowed, DMG multiplier dealt will be increased.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 400% of Dan Heng's ATK to a single target enemy. If the attacked enemy is Slowed, the multiplier for the DMG dealt by Ultimate increases by 120%."
            LongDescWithEidolon: "Deals Wind DMG equal to 432% of Dan Heng's ATK to a single target enemy. If the attacked enemy is Slowed, the multiplier for the DMG dealt by Ultimate increases by 129.6%."
          }
          100204: {
            Name: 'Superiority of Reach'
            Desc: "When this unit becomes the target of an ally's ability, this unit's next attack's Wind RES PEN increases. This effect can be triggered again after 2 turns."
            Type: 'Talent'
            LongDescWithoutEidolon: "When Dan Heng becomes the target of an ally's ability, his next attack's Wind RES PEN increases by 36%. This effect can be triggered again after 2 turn(s)."
            LongDescWithEidolon: "When Dan Heng becomes the target of an ally's ability, his next attack's Wind RES PEN increases by 39.6%. This effect can be triggered again after 2 turn(s)."
          }
          100206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100207: {
            Name: 'Splitting Spearhead'
            Desc: 'After they use their Technique, their ATK is increased at the start of the next battle.'
            Type: 'Technique'
            LongDesc: 'After Dan Heng uses his Technique, his ATK increases by 40% at the start of the next battle for 3 turn(s).'
          }
        }
        Eidolons: {
          100201: {
            Name: 'The Higher You Fly, the Harder You Fall'
            Desc: "When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%."
          }
          100202: {
            Name: "Quell the Venom Octet, Quench the Vice O'Flame"
            Desc: 'Reduces Talent cooldown by 1 turn.'
          }
          100203: {
            Name: 'Seen and Unseen'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100204: {
            Name: 'Roaring Dragon and Soaring Sun'
            Desc: 'When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again.'
          }
          100205: {
            Name: 'A Drop of Rain Feeds a Torrent'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100206: {
            Name: 'The Troubled Soul Lies in Wait'
            Desc: "The Slow state triggered by Skill reduces the enemy's SPD by an extra 8%."
          }
        }
        Effects: {
          10010021: {
            Name: 'Splitting Spearhead'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1002
            ID: 10010021
          }
          10010022: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1002
            ID: 10010022
          }
          10010023: {
            Name: 'Slow'
            Desc: 'SPD -{{parameter0}}%.'
            Effect: 'Slow'
            Source: 1002
            ID: 10010023
          }
          10010024: {
            Name: 'Superiority of Reach'
            Desc: 'Wind RES PEN +{{parameter0}}%.'
            Effect: 'Wind RES PEN'
            Source: 1002
            ID: 10010024
          }
          10010025: {
            Name: 'Superiority of Reach'
            Desc: 'The effect of Talent "Superiority of Reach" cannot be triggered.'
            Source: 1002
            ID: 10010025
          }
          10010026: {
            Name: 'Superiority of Reach'
            Desc: 'The effect of Talent "Superiority of Reach" can now be triggered.'
            Source: 1002
            ID: 10010026
          }
          10010027: {
            Name: 'Hidden Dragon'
            Desc: 'Lowers the chances of being attacked by enemies.'
            Effect: 'Target Probability Reduction'
            Source: 1002
            ID: 10010027
          }
        }
        Traces: {
          A2: {
            Name: 'Hidden Dragon'
            Desc: 'When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.'
            Owner: 1002
            ID: 1002101
            Ascension: 2
          }
          A4: {
            Name: 'Faster Than Light'
            Desc: 'After launching an attack, there is a 50% fixed chance to increase own SPD by 20% for 2 turn(s).'
            Owner: 1002
            ID: 1002102
            Ascension: 4
          }
          A6: {
            Name: 'High Gale'
            Desc: 'Basic ATK deals 40% more DMG to Slowed enemies.'
            Owner: 1002
            ID: 1002103
            Ascension: 6
          }
        }
      }
      1003: {
        Name: 'Himeko'
        Abilities: {
          100301: {
            Name: 'Sawblade Tuning'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100302: {
            Name: 'Molten Detonation'
            Desc: 'Deals Fire DMG to a single enemy and minor Fire DMG to enemies adjacent to it.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 200% of Himeko's ATK to a single enemy and Fire DMG equal to 80% of Himeko's ATK to enemies adjacent to it."
            LongDescWithEidolon: "Deals Fire DMG equal to 220% of Himeko's ATK to a single enemy and Fire DMG equal to 88% of Himeko's ATK to enemies adjacent to it."
          }
          100303: {
            Name: 'Heavenly Flare'
            Desc: 'Deals Fire DMG to all enemies and regenerates Energy if enemies are defeated.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 230% of Himeko's ATK to all enemies. Himeko regenerates 5 extra Energy for each enemy defeated."
            LongDescWithEidolon: "Deals Fire DMG equal to 248.4% of Himeko's ATK to all enemies. Himeko regenerates 5 extra Energy for each enemy defeated."
          }
          100304: {
            Name: 'Victory Rush'
            Desc: "Gains Charge when an enemy's Weakness is Broken.\\nAfter an ally performs an attack, if fully Charged, immediately performs a follow-up attack and deals Fire DMG to all enemies, consuming all Charge points.\\nGains 1 Charge point at the start of each battle."
            Type: 'Talent'
            LongDescWithoutEidolon: 'When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max 3 points).\\nIf Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 follow-up attack and deals Fire DMG equal to 140% of her ATK to all enemies, consuming all Charge points.\\nAt the start of the battle, Himeko gains 1 point of Charge.'
            LongDescWithEidolon: 'When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max 3 points).\\nIf Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 follow-up attack and deals Fire DMG equal to 154% of her ATK to all enemies, consuming all Charge points.\\nAt the start of the battle, Himeko gains 1 point of Charge.'
          }
          100306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100307: {
            Name: 'Incomplete Combustion'
            Desc: 'Creates a Special Dimension. After entering combat with enemies in the dimension, there is a high chance to increase Fire DMG taken by enemies.'
            Type: 'Technique'
            LongDesc: 'After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering battle with enemies in the Special Dimension, there is a 100% base chance to increase Fire DMG taken by enemies by 10% for 2 turn(s). Only 1 dimension created by allies can exist at the same time.'
          }
        }
        Eidolons: {
          100301: {
            Name: 'Childhood'
            Desc: "After \"Victory Rush\" is triggered, Himeko's SPD increases by 20% for 2 turn(s)."
          }
          100302: {
            Name: 'Convergence'
            Desc: 'Deals 15% more DMG to enemies whose HP percentage is 50% or less.'
          }
          100303: {
            Name: 'Poised'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100304: {
            Name: 'Dedication'
            Desc: "When Himeko's Skill inflicts Weakness Break on an enemy, she gains 1 extra point(s) of Charge."
          }
          100305: {
            Name: 'Aspiration'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100306: {
            Name: 'Trailblaze!'
            Desc: 'Ultimate deals DMG 2 extra times, each of which deals Fire DMG equal to 40% of the original DMG to a random enemy.'
          }
        }
        Effects: {
          10010031: {
            Name: 'Victory Rush'
            Desc: 'Talent "Victory Rush" cannot be triggered.'
            Source: 1003
            ID: 10010031
          }
          10010032: {
            Name: 'Fire Vulnerability'
            Desc: 'Fire DMG taken +{{parameter0}}%.'
            Effect: 'Fire Vulnerability'
            Source: 1003
            ID: 10010032
          }
          10010033: {
            Name: 'Charge'
            Desc: 'When fully charged, triggers Talent "Victory Rush."'
            Source: 1003
            ID: 10010033
          }
          10010034: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1003
            ID: 10010034
          }
          10010035: {
            Name: 'Benchmark'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1003
            ID: 10010035
          }
        }
        Traces: {
          A2: {
            Name: 'Starfire'
            Desc: "After using an attack, there is a 50% base chance to inflict Burn on enemies for 2 turn(s).\\nWhen afflicted with Burn, enemies take Fire DoT equal to 30% of Himeko's ATK at the start of each turn."
            Owner: 1003
            ID: 1003101
            Ascension: 2
          }
          A4: {
            Name: 'Magma'
            Desc: 'Skill deals 20% more DMG to enemies currently afflicted with Burn.'
            Owner: 1003
            ID: 1003102
            Ascension: 4
          }
          A6: {
            Name: 'Benchmark'
            Desc: 'When current HP percentage is 80% or higher, CRIT Rate increases by 15%.'
            Owner: 1003
            ID: 1003103
            Ascension: 6
          }
        }
      }
      1004: {
        Name: 'Welt'
        Abilities: {
          100401: {
            Name: 'Gravity Suppression'
            Desc: 'Deals minor Imaginary DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100402: {
            Name: 'Edge of the Void'
            Desc: 'Deals minor Imaginary DMG to a single enemy. This attack can Bounce 3 times, with a chance of Slowing the hit enemies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 72% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to 72% of Welt's ATK to a random enemy. On hit, there is a 75% base chance to reduce the enemy's SPD by 10% for 2 turn(s)."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 79.2% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to 79.2% of Welt's ATK to a random enemy. On hit, there is a 77% base chance to reduce the enemy's SPD by 10% for 2 turn(s)."
          }
          100403: {
            Name: 'Synthetic Black Hole'
            Desc: 'Deals Imaginary DMG to all enemies, with a high chance of Imprisoning them.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 150% of Welt's ATK to all enemies, with a 100% base chance for enemies hit by this ability to be Imprisoned for 1 turn.\\nImprisoned enemies have their actions delayed by 40% and SPD reduced by 10%."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 162% of Welt's ATK to all enemies, with a 100% base chance for enemies hit by this ability to be Imprisoned for 1 turn.\\nImprisoned enemies have their actions delayed by 41.6% and SPD reduced by 10%."
          }
          100404: {
            Name: 'Time Distortion'
            Desc: 'When hitting a Slowed enemy, additionally deals minor Imaginary Additional DMG.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to 60% of his ATK to the enemy.'
            LongDescWithEidolon: 'When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to 66% of his ATK to the enemy.'
          }
          100406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100407: {
            Name: 'Gravitational Imprisonment'
            Desc: 'Creates a Special Dimension. Enemies in this dimension have their movement speed reduced. After entering combat with enemies in the dimension, there is a high chance for the enemies to become Imprisoned.'
            Type: 'Technique'
            LongDesc: "After using Welt's Technique, create a Special Dimension that lasts for 15 second(s). Enemies in this Special Dimension have their movement speed reduced by 50%. After entering battle with enemies in the Special Dimension, there is a 100% base chance to Imprison the enemies for 1 turn.\\nImprisoned enemies have their actions delayed by 20% and SPD reduced by 10%. Only 1 dimension created by allies can exist at the same time."
          }
        }
        Eidolons: {
          100401: {
            Name: 'Legacy of Honor'
            Desc: 'After using Ultimate, Welt gets enhanced. Then, the next 2 time(s) he uses Basic ATK or Skill, deals 1 extra instance of Additional DMG to the target enemy. The Additional DMG dealt when using Basic ATK is equal to 50% of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to 80% of Skill DMG multiplier.'
          }
          100402: {
            Name: 'Conflux of Stars'
            Desc: 'When his Talent is triggered, Welt regenerates 3 Energy.'
          }
          100403: {
            Name: 'Prayer of Peace'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100404: {
            Name: 'Appellation of Justice'
            Desc: 'Base chance for Skill to inflict SPD Reduction increases by 35%.'
          }
          100405: {
            Name: 'Power of Kindness'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100406: {
            Name: 'Prospect of Glory'
            Desc: 'When using Skill, deals DMG for 1 extra time to a random enemy.'
          }
        }
        Effects: {
          10010041: {
            Name: 'Slow'
            Desc: 'SPD -{{parameter0}}%.'
            Effect: 'Slow'
            Source: 1004
            ID: 10010041
          }
          10010042: {
            Name: 'Legacy of Honor'
            Desc: 'Basic ATKs and Skills deal an extra hit.'
            Source: 1004
            ID: 10010042
          }
          10010043: {
            Name: 'Vulnerability'
            Desc: 'Increases DMG taken by {{parameter0}}%.'
            Effect: 'Vulnerability'
            Source: 1004
            ID: 10010043
          }
        }
        Traces: {
          A2: {
            Name: 'Retribution'
            Desc: 'When using Ultimate, there is a 100% base chance to increase the DMG received by the targets by 12% for 2 turn(s).'
            Owner: 1004
            ID: 1004101
            Ascension: 2
          }
          A4: {
            Name: 'Judgment'
            Desc: 'Using Ultimate additionally regenerates 10 Energy.'
            Owner: 1004
            ID: 1004102
            Ascension: 4
          }
          A6: {
            Name: 'Punishment'
            Desc: 'Deals 20% more DMG to enemies inflicted with Weakness Break.'
            Owner: 1004
            ID: 1004103
            Ascension: 6
          }
        }
      }
      1005: {
        Name: 'Kafka'
        Abilities: {
          100501: {
            Name: 'Midnight Tumult'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100502: {
            Name: 'Caressing Moonlight'
            Desc: 'Deals Lightning DMG to a single enemy and minor Lightning DMG to adjacent targets.\\nIf the primary target is currently afflicted with a DoT effect, the DoT deals DMG 1 extra time.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 160% of Kafka's ATK to a target enemy and Lightning DMG equal to 60% of Kafka's ATK to enemies adjacent to it.\\nIf the target enemy is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to 75% of their original DMG."
            LongDescWithEidolon: "Deals Lightning DMG equal to 176% of Kafka's ATK to a target enemy and Lightning DMG equal to 66% of Kafka's ATK to enemies adjacent to it.\\nIf the target enemy is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to 78% of their original DMG."
          }
          100503: {
            Name: 'Twilight Trill'
            Desc: 'Deals minor Lightning DMG to all enemies, with a high chance of Shocking them.\\nIf the enemies are currently Shocked, the Shock status deals DMG 1 extra time.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 80% of Kafka's ATK to all enemies, with a 100% base chance for enemies hit to become Shocked and immediately take DMG from their current Shock state, equal to 100% of its original DMG. Shock lasts for 2 turn(s).\\nWhile Shocked, enemies receive Lightning DoT equal to 290% of Kafka's ATK at the beginning of each turn."
            LongDescWithEidolon: "Deals Lightning DMG equal to 86.4% of Kafka's ATK to all enemies, with a 100% base chance for enemies hit to become Shocked and immediately take DMG from their current Shock state, equal to 104% of its original DMG. Shock lasts for 2 turn(s).\\nWhile Shocked, enemies receive Lightning DoT equal to 318.275% of Kafka's ATK at the beginning of each turn."
          }
          100504: {
            Name: 'Gentle but Cruel'
            Desc: 'After an ally uses Basic ATK on an enemy, Kafka immediately launches a follow-up attack and deals Lightning DMG with a high chance of inflicting Shock to that target. This effect can only be triggered 1 time per turn.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After an ally of Kafka's uses Basic ATK on an enemy target, Kafka immediately launches 1 follow-up attack and deals Lightning DMG equal to 140% of her ATK to that target, with a 100% base chance to inflict Shock equivalent to that applied by her Ultimate to the attacked enemy target, lasting for 2 turns. This effect can only be triggered 1 time per turn."
            LongDescWithEidolon: "After an ally of Kafka's uses Basic ATK on an enemy target, Kafka immediately launches 1 follow-up attack and deals Lightning DMG equal to 159.6% of her ATK to that target, with a 100% base chance to inflict Shock equivalent to that applied by her Ultimate to the attacked enemy target, lasting for 2 turns. This effect can only be triggered 1 time per turn."
          }
          100506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100507: {
            Name: 'Mercy Is Not Forgiveness'
            Desc: 'Attacks all enemies within range. After entering battle, deals minor Lightning DMG to all enemies, with a high chance to Shock them.'
            Type: 'Technique'
            LongDesc: "Immediately attacks all enemies within a set range. After entering battle, deals Lightning DMG equal to 50% of Kafka's ATK to all enemies, with a 100% base chance to inflict Shock equivalent to that applied by her Ultimate on every enemy target for 2 turn(s)."
          }
        }
        Eidolons: {
          100501: {
            Name: 'Da Capo'
            Desc: 'When the Talent triggers a follow-up attack, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turn(s).'
          }
          100502: {
            Name: 'Fortississimo'
            Desc: 'While Kafka is on the field, DoT dealt by all allies increases by 25%.'
          }
          100503: {
            Name: 'Capriccio'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100504: {
            Name: 'Recitativo'
            Desc: 'When an enemy target takes DMG from the Shock status inflicted by Kafka, Kafka additionally regenerates 2 Energy.'
          }
          100505: {
            Name: 'Doloroso'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100506: {
            Name: 'Leggiero'
            Desc: 'The Shock inflicted on the enemy target by the Ultimate, the Technique, or the Talent-triggered follow-up attack has a DMG multiplier increase of 156% and lasts 1 turn(s) longer.'
          }
        }
        Effects: {
          10010051: {
            Name: 'Gentle but Cruel'
            Desc: 'The effect of Talent "Gentle but Cruel" can now be triggered.'
            Source: 1005
            ID: 10010051
          }
          10010052: {
            Name: 'Gentle but Cruel'
            Desc: 'The effect of Talent "Gentle but Cruel" cannot be triggered.'
            Source: 1005
            ID: 10010052
          }
          10010053: {
            Name: 'DoT Vulnerability'
            Desc: 'DoT taken +{{parameter0}}%.'
            Effect: 'DoT Vulnerability'
            Source: 1005
            ID: 10010053
          }
          10010054: {
            Name: 'DoT Vulnerability'
            Desc: 'Each stack increases DoT taken by {{parameter0}}%, up to 2 stacks.'
            Effect: 'DoT Vulnerability'
            Source: 1005
            ID: 10010054
          }
          10010055: {
            Name: 'Fortississimo'
            Desc: 'Increases DoT dealt by {{parameter0}}%.'
            Source: 1005
            ID: 10010055
          }
        }
        Traces: {
          A2: {
            Name: 'Torture'
            Desc: 'When the Ultimate is used, enemy targets will now receive DMG immediately from all currently applied DoT sources instead of just receiving DMG immediately from the currently applied Shock state.'
            Owner: 1005
            ID: 1005101
            Ascension: 2
          }
          A4: {
            Name: 'Plunder'
            Desc: 'If an enemy is defeated while Shocked, Kafka additionally regenerates 5 Energy.'
            Owner: 1005
            ID: 1005102
            Ascension: 4
          }
          A6: {
            Name: 'Thorns'
            Desc: 'The base chance for target enemies to get Shocked by the Ultimate, the Technique, or the Talent-triggered follow-up attack increases by 30%.'
            Owner: 1005
            ID: 1005103
            Ascension: 6
          }
        }
      }
      1006: {
        Name: 'Silver Wolf'
        Abilities: {
          100601: {
            Name: 'System Warning'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100602: {
            Name: 'Allow Changes?'
            Desc: 'There is a high chance to apply additional Type Weaknesses to a single enemy and deals Quantum DMG to this target enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "There is a 85% base chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.\\nEach enemy can only have 1 Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.\\nIn addition, there is a 100% base chance to further reduce the All-Type RES of the enemy by 10% for 2 turn(s).\\nDeals Quantum DMG equal to 196% of Silver Wolf's ATK to this enemy."
            LongDescWithEidolon: "There is a 87% base chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.\\nEach enemy can only have 1 Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.\\nIn addition, there is a 100% base chance to further reduce the All-Type RES of the enemy by 10.5% for 2 turn(s).\\nDeals Quantum DMG equal to 215.6% of Silver Wolf's ATK to this enemy."
          }
          100603: {
            Name: 'User Banned'
            Desc: "There is a high chance of lowering a single enemy's DEF and deals massive Quantum DMG to this target enemy."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "There's a 100% base chance to decrease the target enemy's DEF by 45% for 3 turn(s). And at the same time, deals Quantum DMG equal to 380% of Silver Wolf's ATK to the target enemy."
            LongDescWithEidolon: "There's a 103% base chance to decrease the target enemy's DEF by 46.8% for 3 turn(s). And at the same time, deals Quantum DMG equal to 410.4% of Silver Wolf's ATK to the target enemy."
          }
          100604: {
            Name: 'Awaiting System Response...'
            Desc: 'After this unit attacks, there is a chance of implanting the attacked enemy with 1 random Bug.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'Silver Wolf can create three types of Bugs: Reduce ATK by 10%, reduce DEF by 8%, and reduce SPD by 6%.\\nEvery time Silver Wolf attacks, she has a 72% base chance to implant a random Bug that lasts for 3 turn(s) in an enemy target.'
            LongDescWithEidolon: 'Silver Wolf can create three types of Bugs: Reduce ATK by 11%, reduce DEF by 8.8%, and reduce SPD by 6.6%.\\nEvery time Silver Wolf attacks, she has a 74.4% base chance to implant a random Bug that lasts for 3 turn(s) in an enemy target.'
          }
          100606: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100607: {
            Name: 'Force Quit Program'
            Desc: 'Attacks the enemy. After entering battle, deals minor DMG to all enemies and reduces Toughness of all enemies irrespective of Weakness Types.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals Quantum DMG equal to 80% of Silver Wolf's ATK to all enemies, and ignores Weakness Types and reduces Toughness from all enemies. Enemies with their Weakness Broken in this way will trigger the Quantum Weakness Break effect."
          }
        }
        Eidolons: {
          100601: {
            Name: 'Social Engineering'
            Desc: 'After using her Ultimate to attack enemies, Silver Wolf regenerates 7 Energy for every debuff that the target enemy currently has. This effect can be triggered up to 5 time(s) in each use of her Ultimate.'
          }
          100602: {
            Name: 'Zombie Network'
            Desc: 'When an enemy enters battle, reduces their Effect RES by 20%.'
          }
          100603: {
            Name: 'Payload'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100604: {
            Name: 'Bounce Attack'
            Desc: "After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate."
          }
          100605: {
            Name: 'Brute Force Attack'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100606: {
            Name: 'Overlay Network'
            Desc: 'For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%.'
          }
        }
        Effects: {
          10010061: {
            Name: 'Type-1 Bug'
            Desc: 'ATK -{{parameter0}}%.'
            Effect: 'ATK Reduction'
            Source: 1006
            ID: 10010061
          }
          10010062: {
            Name: 'Type-2 Bug'
            Desc: 'DEF -{{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1006
            ID: 10010062
          }
          10010063: {
            Name: 'Type-3 Bug'
            Desc: 'SPD -{{parameter0}}%.'
            Effect: 'Slow'
            Source: 1006
            ID: 10010063
          }
          10010064: {
            Name: 'Extra Weakness'
            Desc: 'Extra Weakness implanted. Corresponding RES is lowered by {{parameter0}}%.'
            Effect: 'Implant a Weakness'
            Source: 1006
            ID: 10010064
          }
          10010065: {
            Name: 'Extra Weakness'
            Desc: 'Extra Weakness implanted. Corresponding RES is lowered by {{parameter0}}%.'
            Effect: 'Implant a Weakness'
            Source: 1006
            ID: 10010065
          }
          10010066: {
            Name: 'All-Type RES Reduction'
            Desc: 'All-Type DMG RES -{{parameter0}}%.'
            Effect: 'All-Type RES Reduction'
            Source: 1006
            ID: 10010066
          }
          10010067: {
            Name: 'Effect RES Reduction'
            Desc: 'Effect RES -{{parameter0}}%.'
            Effect: 'Effect RES Reduction'
            Source: 1006
            ID: 10010067
          }
          10010068: {
            Name: 'DEF Reduction'
            Desc: 'DEF -{{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1006
            ID: 10010068
          }
          10010069: {
            Name: 'Extra Fire Weakness'
            Desc: 'Extra Fire Weakness implanted. Fire RES -{{parameter0}}%.'
            Source: 1006
            ID: 10010069
          }
        }
        Traces: {
          A2: {
            Name: 'Generate'
            Desc: "Bug's duration is extended for 1 turn(s). Every time an enemy is inflicted with Weakness Break, Silver Wolf has a 65% base chance of implanting a random Bug in the enemy."
            Owner: 1006
            ID: 1006101
            Ascension: 2
          }
          A4: {
            Name: 'Inject'
            Desc: "The duration of the Weakness implanted by Silver Wolf's Skill increases by 1 turn(s)."
            Owner: 1006
            ID: 1006102
            Ascension: 4
          }
          A6: {
            Name: 'Side Note'
            Desc: "If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%."
            Owner: 1006
            ID: 1006103
            Ascension: 6
          }
        }
      }
      1008: {
        Name: 'Arlan'
        Abilities: {
          100801: {
            Name: 'Lightning Rush'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100802: {
            Name: 'Shackle Breaker'
            Desc: 'Consumes a portion of HP to deal Lightning DMG to a single enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Consumes Arlan's HP equal to 15% of his Max HP to deal Lightning DMG equal to 240% of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to 1 after using his Skill."
            LongDescWithEidolon: "Consumes Arlan's HP equal to 15% of his Max HP to deal Lightning DMG equal to 264% of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to 1 after using his Skill."
          }
          100803: {
            Name: 'Frenzied Punishment'
            Desc: 'Deals massive Lightning DMG to a single enemy and Lightning DMG to enemies adjacent to it.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 320% of Arlan's ATK to a single enemy and Lightning DMG equal to 160% of Arlan's ATK to enemies adjacent to it."
            LongDescWithEidolon: "Deals Lightning DMG equal to 345.6% of Arlan's ATK to a single enemy and Lightning DMG equal to 172.8% of Arlan's ATK to enemies adjacent to it."
          }
          100804: {
            Name: 'Pain and Anger'
            Desc: 'Gain DMG bonus based on currently missing HP percentage.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of 72% DMG dealt by Arlan."
            LongDescWithEidolon: "Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of 79.2% DMG dealt by Arlan."
          }
          100806: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100807: {
            Name: 'Swift Harvest'
            Desc: 'Attacks the enemy. After entering battle, deals minor Lightning DMG to all enemies.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 80% of Arlan's ATK to all enemies."
          }
        }
        Eidolons: {
          100801: {
            Name: 'To the Bitter End'
            Desc: 'When HP percentage is lower than or equal to 50% of Max HP, increases DMG dealt by Skill by 10%.'
          }
          100802: {
            Name: 'Breaking Free'
            Desc: 'Using Skill or Ultimate removes 1 debuff from oneself.'
          }
          100803: {
            Name: 'Power Through'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100804: {
            Name: 'Turn the Tables'
            Desc: 'When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to 25% of his Max HP. This effect is automatically removed after it is triggered once or after 2 turn(s) have elapsed.'
          }
          100805: {
            Name: 'Hammer and Tongs'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100806: {
            Name: 'Self-Sacrifice'
            Desc: 'When the current HP percentage drops to 50% or below, Ultimate deals 20% more DMG, and the DMG multiplier for adjacent targets is raised to the same level as that for the primary target.'
          }
        }
        Effects: {
          10010081: {
            Name: 'Pain and Anger'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Source: 1008
            ID: 10010081
          }
          10010082: {
            Name: 'Turn the Tables'
            Desc: 'When struck with a killing blow, instead of becoming downed, the character immediately restores HP equal to {{parameter0}}% of Max HP.'
            Source: 1008
            ID: 10010082
          }
          10010083: {
            Name: 'Repel'
            Desc: 'Nullifies all DMG received except for DoT until after being attacked.'
            Effect: 'Barrier'
            Source: 1008
            ID: 10010083
          }
        }
        Traces: {
          A2: {
            Name: 'Revival'
            Desc: 'If the current HP percentage is 30% or lower when defeating an enemy, immediately restores HP equal to 20% of Max HP.'
            Owner: 1008
            ID: 1008101
            Ascension: 2
          }
          A4: {
            Name: 'Endurance'
            Desc: 'The chance to resist DoT Debuffs increases by 50%.'
            Owner: 1008
            ID: 1008102
            Ascension: 4
          }
          A6: {
            Name: 'Repel'
            Desc: "Upon entering battle, if Arlan's HP percentage is less than or equal to 50%, he can nullify all DMG received except for DoTs until he is attacked."
            Owner: 1008
            ID: 1008103
            Ascension: 6
          }
        }
      }
      1009: {
        Name: 'Asta'
        Abilities: {
          100901: {
            Name: 'Spectrum Beam'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          100902: {
            Name: 'Meteor Storm'
            Desc: 'Deals minor Fire DMG to single enemy targets with 5 Bounces in total.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 50% of Asta's ATK to a single enemy and further deals DMG for 4 extra times, with each time dealing Fire DMG equal to 50% of Asta's ATK to a random enemy."
            LongDescWithEidolon: "Deals Fire DMG equal to 55% of Asta's ATK to a single enemy and further deals DMG for 4 extra times, with each time dealing Fire DMG equal to 55% of Asta's ATK to a random enemy."
          }
          100903: {
            Name: 'Astral Blessing'
            Desc: 'Increases SPD for all allies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: 'Increases SPD of all allies by 50 for 2 turn(s).'
            LongDescWithEidolon: 'Increases SPD of all allies by 52.8 for 2 turn(s).'
          }
          100904: {
            Name: 'Astrometry'
            Desc: 'The character will receive 1 stack of Charging for every different enemy they hit, for a maximum of 5 stacks. Every stack of Charging increases ATK for all allies. At the beginning of their turn, reduce Charging stacks.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Gains 1 stack of Charging for every different enemy hit by Asta plus an extra stack if the enemy hit has Fire Weakness.\\nFor every stack of Charging Asta has, all allies' ATK increases by 14%, up to 5 time(s).\\nStarting from her second turn, Asta's Charging stack count is reduced by 3 at the beginning of every turn."
            LongDescWithEidolon: "Gains 1 stack of Charging for every different enemy hit by Asta plus an extra stack if the enemy hit has Fire Weakness.\\nFor every stack of Charging Asta has, all allies' ATK increases by 15.4%, up to 5 time(s).\\nStarting from her second turn, Asta's Charging stack count is reduced by 3 at the beginning of every turn."
          }
          100906: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          100907: {
            Name: 'Miracle Flash'
            Desc: 'Attacks the enemy. After entering battle, deals minor DMG to all enemies.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals Fire DMG equal to 50% of Asta's ATK to all enemies."
          }
        }
        Eidolons: {
          100901: {
            Name: 'Star Sings Sans Verses or Vocals'
            Desc: 'When using Skill, deals DMG for 1 extra time to a random enemy.'
          }
          100902: {
            Name: 'Moon Speaks in Wax and Wane'
            Desc: "After using her Ultimate, Asta's Charging stacks will not be reduced in the next turn."
          }
          100903: {
            Name: 'Meteor Showers for Wish and Want'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          100904: {
            Name: 'Aurora Basks in Beauty and Bliss'
            Desc: "Asta's Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks."
          }
          100905: {
            Name: 'Nebula Secludes in Runes and Riddles'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          100906: {
            Name: 'Cosmos Dreams in Calm and Comfort'
            Desc: 'Charging stack(s) lost in each turn is reduced by 1.'
          }
        }
        Effects: {
          10010091: {
            Name: 'Charging'
            Desc: 'Each stack increases ATK by {{parameter0}}%, up to 5 stacks.'
            Effect: 'ATK Boost'
            Source: 1009
            ID: 10010091
          }
          10010092: {
            Name: 'Charging'
            Desc: 'Each stack increases ATK by {{parameter0}}%, up to 5 stacks.'
            Effect: 'ATK Boost'
            Source: 1009
            ID: 10010092
          }
          10010093: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}.'
            Effect: 'SPD Boost'
            Source: 1009
            ID: 10010093
          }
          10010094: {
            Name: 'Energy Regeneration Rate Boost'
            Desc: 'Energy Regeneration Rate +{{parameter0}}%.'
            Effect: 'Energy Regeneration Rate Boost'
            Source: 1009
            ID: 10010094
          }
        }
        Traces: {
          A2: {
            Name: 'Sparks'
            Desc: "Asta's Basic ATK has a 80% base chance to Burn an enemy target for 3 turn(s).\\nBurned enemies take Fire DoT equal to 50% of DMG dealt by Asta's Basic ATK at the start of each turn."
            Owner: 1009
            ID: 1009101
            Ascension: 2
          }
          A4: {
            Name: 'Ignite'
            Desc: "When Asta is on the field, all allies' Fire DMG increases by 18%."
            Owner: 1009
            ID: 1009102
            Ascension: 4
          }
          A6: {
            Name: 'Constellation'
            Desc: "Asta's DEF increases by 6% for every current Charging stack she possesses."
            Owner: 1009
            ID: 1009103
            Ascension: 6
          }
        }
      }
      1013: {
        Name: 'Herta'
        Abilities: {
          101301: {
            Name: 'What Are You Looking At?'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          101302: {
            Name: 'One-Time Offer'
            Desc: 'Deals minor Ice DMG to all enemies. Targets with higher HP will receive increased DMG.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 100% of Herta's ATK to all enemies. If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%."
            LongDescWithEidolon: "Deals Ice DMG equal to 110% of Herta's ATK to all enemies. If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%."
          }
          101303: {
            Name: "It's Magic, I Added Some Magic"
            Desc: 'Deals Ice DMG to all enemies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 200% of Herta's ATK to all enemies."
            LongDescWithEidolon: "Deals Ice DMG equal to 216% of Herta's ATK to all enemies."
          }
          101304: {
            Name: "Fine, I'll Do It Myself"
            Desc: "When any ally's attack reduces the Enemy target's current HP percentage to NaN% or lower, Herta immediately launches follow-up attack, dealing minor Ice DMG to all Enemy units."
            Type: 'Talent'
            LongDescWithoutEidolon: "When an ally's attack causes an enemy's HP percentage to fall to 50% or lower, Herta will launch a follow-up attack, dealing Ice DMG equal to 40% of Herta's ATK to all enemies."
            LongDescWithEidolon: "When an ally's attack causes an enemy's HP percentage to fall to 50% or lower, Herta will launch a follow-up attack, dealing Ice DMG equal to 43% of Herta's ATK to all enemies."
          }
          101306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          101307: {
            Name: 'It Can Still Be Optimized'
            Desc: "After using Technique, increases this unit's ATK at the start of the next battle."
            Type: 'Technique'
            LongDesc: "After using her Technique, Herta's ATK increases by 40% for 3 turn(s) at the beginning of the next battle."
          }
        }
        Eidolons: {
          101301: {
            Name: "Kick You When You're Down"
            Desc: "If the enemy's HP percentage is at 50% or less, Herta's Basic ATK deals Additional Ice DMG equal to 40% of Herta's ATK."
          }
          101302: {
            Name: 'Keep the Ball Rolling'
            Desc: "Every time Talent is triggered, this character's CRIT Rate increases by 3%. This effect can stack up to 5 time(s)."
          }
          101303: {
            Name: "That's the Kind of Girl I Am"
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          101304: {
            Name: 'Hit Where It Hurts'
            Desc: 'When Talent is triggered, DMG increases by 10%.'
          }
          101305: {
            Name: 'Cuss Big or Cuss Nothing'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          101306: {
            Name: 'No One Can Betray Me'
            Desc: "After using Ultimate, this character's ATK increases by 25% for 1 turn(s)."
          }
        }
        Effects: {
          10010131: {
            Name: 'It Can Still Be Optimized'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1013
            ID: 10010131
          }
          10010132: {
            Name: 'CRIT Rate Boost'
            Desc: 'Each stack increases CRIT rate by {{parameter0}}%, up to 5 stacks.'
            Effect: 'CRIT Rate Boost'
            Source: 1013
            ID: 10010132
          }
          10010133: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1013
            ID: 10010133
          }
        }
        Traces: {
          A2: {
            Name: 'Efficiency'
            Desc: 'When Skill is used, the DMG Boost effect on target enemies increases by an extra 25%.'
            Owner: 1013
            ID: 1013101
            Ascension: 2
          }
          A4: {
            Name: 'Puppet'
            Desc: 'The chance to resist Crowd Control Debuffs increases by 35%.'
            Owner: 1013
            ID: 1013102
            Ascension: 4
          }
          A6: {
            Name: 'Icing'
            Desc: 'When Ultimate is used, deals 20% more DMG to Frozen enemies.'
            Owner: 1013
            ID: 1013103
            Ascension: 6
          }
        }
      }
      1101: {
        Name: 'Bronya'
        Abilities: {
          110101: {
            Name: 'Windrider Bullet'
            Desc: 'Deals minor Wind DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110102: {
            Name: 'Combat Redeployment'
            Desc: 'Dispels 1 debuff from a single ally, increases the damage they deal, and allows them to immediately take action.'
            Type: 'Skill'
            LongDescWithoutEidolon: 'Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by 66% for 1 turn(s).\\nWhen this Skill is used on Bronya herself, she cannot immediately take action again.'
            LongDescWithEidolon: 'Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by 72.6% for 1 turn(s).\\nWhen this Skill is used on Bronya herself, she cannot immediately take action again.'
          }
          110103: {
            Name: 'The Belobog March'
            Desc: 'Increases ATK and CRIT DMG of all allies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Increases the ATK of all allies by 55%, and increases their CRIT DMG equal to 16% of Bronya's CRIT DMG plus 20% for 2 turn(s)."
            LongDescWithEidolon: "Increases the ATK of all allies by 59.4%, and increases their CRIT DMG equal to 16.8% of Bronya's CRIT DMG plus 21.6% for 2 turn(s)."
          }
          110104: {
            Name: 'Leading the Way'
            Desc: 'After this character uses Basic ATK, their next action will be Advanced Forward.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After using her Basic ATK, Bronya's next action will be Advanced Forward by 30%."
            LongDescWithEidolon: "After using her Basic ATK, Bronya's next action will be Advanced Forward by 33%."
          }
          110106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110107: {
            Name: 'Banner of Command'
            Desc: "After this character uses Technique, increases all allies' ATK at the start of the next battle."
            Type: 'Technique'
            LongDesc: "After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turn(s)."
          }
        }
        Eidolons: {
          110101: {
            Name: 'Hone Your Strength'
            Desc: 'When using Skill, there is a 50% fixed chance of recovering 1 Skill Point. This effect has a 1-turn cooldown.'
          }
          110102: {
            Name: 'Quick March'
            Desc: "When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn."
          }
          110103: {
            Name: 'Bombardment'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110104: {
            Name: 'Take by Surprise'
            Desc: 'After any other allied character uses Basic ATK on an enemy target that has Wind Weakness, Bronya immediately launches 1 instance of follow-up attack, dealing Wind DMG to this target by an amount equal to 80% of Basic ATK DMG. This effect can only trigger once per turn.'
          }
          110105: {
            Name: 'Unstoppable'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110106: {
            Name: 'Piercing Rainbow'
            Desc: 'The duration of the DMG Boost effect placed by the Skill on the target ally increases by 1 turn(s).'
          }
        }
        Effects: {
          10011011: {
            Name: 'The Belobog March'
            Desc: 'ATK +{{parameter0}}% and CRIT DMG +{{parameter1}}%.'
            Effect: 'ATK and CRIT DMG Boost'
            Source: 1101
            ID: 10011011
          }
          10011012: {
            Name: 'DMG Boost'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1101
            ID: 10011012
          }
          10011013: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1101
            ID: 10011013
          }
          10011014: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1101
            ID: 10011014
          }
          10011015: {
            Name: 'Hone Your Strength'
            Desc: 'Hone Your Strength effect cannot be triggered.'
            Source: 1101
            ID: 10011015
          }
          10011016: {
            Name: 'Battlefield'
            Desc: 'DEF increases by {{parameter0}}%'
            Source: 1101
            ID: 10011016
          }
        }
        Traces: {
          A2: {
            Name: 'Command'
            Desc: 'The CRIT Rate for Basic ATK increases to 100%.'
            Owner: 1101
            ID: 1101101
            Ascension: 2
          }
          A4: {
            Name: 'Battlefield'
            Desc: "At the start of the battle, all allies' DEF increases by 20% for 2 turn(s)."
            Owner: 1101
            ID: 1101102
            Ascension: 4
          }
          A6: {
            Name: 'Military Might'
            Desc: 'When Bronya is on the field, all allies deal 10% more DMG.'
            Owner: 1101
            ID: 1101103
            Ascension: 6
          }
        }
      }
      1102: {
        Name: 'Seele'
        Abilities: {
          110201: {
            Name: 'Thwack'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110202: {
            Name: 'Sheathed Blade'
            Desc: 'Deals Quantum DMG to a single enemy and increases SPD.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Increases Seele's SPD by 25% for 2 turn(s) and deals Quantum DMG equal to 220% of Seele's ATK to a single enemy."
            LongDescWithEidolon: "Increases Seele's SPD by 25% for 2 turn(s) and deals Quantum DMG equal to 242% of Seele's ATK to a single enemy."
          }
          110203: {
            Name: 'Butterfly Flurry'
            Desc: 'Enters the Amplification state and deals massive Quantum DMG to a single enemy.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: 'Seele enters the Amplification state and deals Quantum DMG equal to 425% of her ATK to a single enemy.'
            LongDescWithEidolon: 'Seele enters the Amplification state and deals Quantum DMG equal to 459% of her ATK to a single enemy.'
          }
          110204: {
            Name: 'Resurgence'
            Desc: 'When defeating enemy targets with Basic ATK, Skill, or Ultimate, gains an extra turn and enters the Amplification state. While in Amplification, increases the DMG dealt by this unit.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the Amplification state, the DMG of Seele's attacks increases by 80% for 1 turn(s).\\nEnemies defeated in the extra turn provided by \"Resurgence\" will not trigger another \"Resurgence.\""
            LongDescWithEidolon: "Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the Amplification state, the DMG of Seele's attacks increases by 88% for 1 turn(s).\\nEnemies defeated in the extra turn provided by \"Resurgence\" will not trigger another \"Resurgence.\""
          }
          110206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110207: {
            Name: 'Phantom Illusion'
            Desc: 'Enter Stealth mode. After attacking an enemy and entering battle, enters the Amplification state.'
            Type: 'Technique'
            LongDesc: 'After using her Technique, Seele gains Stealth for 20 second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the Amplification state.'
          }
        }
        Eidolons: {
          110201: {
            Name: 'Extirpating Slash'
            Desc: 'When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%.'
          }
          110202: {
            Name: 'Dancing Butterfly'
            Desc: "The SPD Boost effect of Seele's Skill can stack up to 2 time(s)."
          }
          110203: {
            Name: 'Dazzling Tumult'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110204: {
            Name: 'Flitting Phantasm'
            Desc: 'Seele regenerates 15 Energy when she defeats an enemy.'
          }
          110205: {
            Name: 'Piercing Shards'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110206: {
            Name: 'Shattering Shambles'
            Desc: "After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for 1 turn(s). Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to 15% of Seele's Ultimate DMG every time they are attacked. If the target enemy is defeated by the Butterfly Flurry DMG triggered by other allies' attacks, Seele's Talent will not be triggered.\\nWhen Seele is knocked down, the Butterfly Flurry inflicted on the enemies will be removed."
          }
        }
        Effects: {
          10011021: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1102
            ID: 10011021
          }
          10011022: {
            Name: 'Amplification'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1102
            ID: 10011022
          }
          10011023: {
            Name: 'SPD Boost'
            Desc: 'Each stack increases SPD by {{parameter0}}%, up to 2 stacks.'
            Effect: 'SPD Boost'
            Source: 1102
            ID: 10011023
          }
          10011024: {
            Name: 'Butterfly Flurry'
            Desc: 'On a hit, receives an extra Quantum DMG from Seele.'
            Effect: 'Butterfly Flurry'
            Source: 1102
            ID: 10011024
          }
          10011025: {
            Name: 'Resurgence'
            Desc: 'Currently in the extra turn provided by "Resurgence".'
            Source: 1102
            ID: 10011025
          }
          10011026: {
            Name: 'Nightshade'
            Desc: 'Lowers the chances of being attacked by enemies.'
            Effect: 'Target Probability Reduction'
            Source: 1102
            ID: 10011026
          }
        }
        Traces: {
          A2: {
            Name: 'Nightshade'
            Desc: 'When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.'
            Owner: 1102
            ID: 1102101
            Ascension: 2
          }
          A4: {
            Name: 'Lacerate'
            Desc: 'While Seele is in the Amplification state, her Quantum RES PEN increases by 20%.'
            Owner: 1102
            ID: 1102102
            Ascension: 4
          }
          A6: {
            Name: 'Rippling Waves'
            Desc: "After using a Basic ATK, Seele's next action will be Advanced Forward by 20%."
            Owner: 1102
            ID: 1102103
            Ascension: 6
          }
        }
      }
      1103: {
        Name: 'Serval'
        Abilities: {
          110301: {
            Name: 'Roaring Thunderclap'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110302: {
            Name: 'Lightning Flash'
            Desc: 'Deals minor Lightning DMG to a single enemy and any adjacent targets, with a high chance of causing Shock.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 140% of Serval's ATK to a single enemy and Lightning DMG equal to 60% of Serval's ATK to enemies adjacent to it, with a 80% base chance for enemies hit to become Shocked for 2 turn(s).\\nWhile Shocked, enemies take Lightning DoT equal to 104% of Serval's ATK at the beginning of each turn."
            LongDescWithEidolon: "Deals Lightning DMG equal to 154% of Serval's ATK to a single enemy and Lightning DMG equal to 66% of Serval's ATK to enemies adjacent to it, with a 80% base chance for enemies hit to become Shocked for 2 turn(s).\\nWhile Shocked, enemies take Lightning DoT equal to 114.4% of Serval's ATK at the beginning of each turn."
          }
          110303: {
            Name: 'Here Comes the Mechanical Fever'
            Desc: 'Deals Lightning DMG to all enemies and increases the duration of Shock.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 180% of Serval's ATK to all enemies. Enemies already Shocked will extend the duration of their Shock state by 2 turn(s)."
            LongDescWithEidolon: "Deals Lightning DMG equal to 194.4% of Serval's ATK to all enemies. Enemies already Shocked will extend the duration of their Shock state by 2 turn(s)."
          }
          110304: {
            Name: 'Galvanic Chords'
            Desc: 'After attacking, deals a minor amount of Additional DMG to all Shocked enemies.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After Serval attacks, deals Additional Lightning DMG equal to 72% of Serval's ATK to all Shocked enemies."
            LongDescWithEidolon: "After Serval attacks, deals Additional Lightning DMG equal to 79.2% of Serval's ATK to all Shocked enemies."
          }
          110306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110307: {
            Name: 'Good Night, Belobog'
            Desc: 'Attacks the enemy. After entering battle, deals minor Lightning DMG to a random single enemy, with a high chance to Shock all enemy targets.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 50% of Serval's ATK to a random enemy, with a 100% base chance for all enemies to become Shocked for 3 turn(s).\\nWhile Shocked, enemies will take Lightning DoT equal to 50% of Serval's ATK at the beginning of each turn."
          }
        }
        Eidolons: {
          110301: {
            Name: 'Echo Chamber'
            Desc: 'Basic ATK deals Lightning DMG equal to 60% of Basic ATK DMG to a random target adjacent to the target enemy.'
          }
          110302: {
            Name: 'Encore!'
            Desc: "Every time Serval's Talent is triggered to deal Additional DMG, she regenerates 4 Energy."
          }
          110303: {
            Name: 'Listen, the Heartbeat of the Gears'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110304: {
            Name: 'Make Some Noise!'
            Desc: 'Ultimate has a 100% base chance to apply Shock to any enemies not currently Shocked. This Shock has the same effects as the one applied by Skill.'
          }
          110305: {
            Name: "Belobog's Loudest Roar!"
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110306: {
            Name: 'This Song Rocks to Heaven!'
            Desc: 'Serval deals 30% more DMG to Shocked enemies.'
          }
        }
        Effects: {
          10011031: {
            Name: 'DMG Boost'
            Desc: 'Roaring Thunderclap and Lightning Flash deal {{parameter0}}% more DMG.'
            Effect: 'DMG Boost'
            Source: 1103
            ID: 10011031
          }
          10011032: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1103
            ID: 10011032
          }
        }
        Traces: {
          A2: {
            Name: "Rock 'n' Roll"
            Desc: 'Skill has a 20% increased base chance to Shock enemies.'
            Owner: 1103
            ID: 1103101
            Ascension: 2
          }
          A4: {
            Name: 'String Vibration'
            Desc: 'At the start of the battle, immediately regenerates 15 Energy.'
            Owner: 1103
            ID: 1103102
            Ascension: 4
          }
          A6: {
            Name: 'Mania'
            Desc: 'Upon defeating an enemy, ATK is increased by 20% for 2 turn(s).'
            Owner: 1103
            ID: 1103103
            Ascension: 6
          }
        }
      }
      1104: {
        Name: 'Gepard'
        Abilities: {
          110401: {
            Name: 'Fist of Conviction'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110402: {
            Name: 'Daunting Smite'
            Desc: 'Deals Ice DMG to a single enemy, with a chance of Freezing them.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 200% of Gepard's ATK to a single enemy, with a 65% base chance to Freeze the enemy for 1 turn(s).\\nWhile Frozen, the enemy cannot take action and will take Additional Ice DMG equal to 60% of Gepard's ATK at the beginning of each turn."
            LongDescWithEidolon: "Deals Ice DMG equal to 220% of Gepard's ATK to a single enemy, with a 65% base chance to Freeze the enemy for 1 turn(s).\\nWhile Frozen, the enemy cannot take action and will take Additional Ice DMG equal to 66% of Gepard's ATK at the beginning of each turn."
          }
          110403: {
            Name: 'Enduring Bulwark'
            Desc: 'Provides a Shield to all allies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Applies a Shield to all allies, absorbing DMG equal to 45% of Gepard's DEF plus 600 for 3 turn(s)."
            LongDescWithEidolon: "Applies a Shield to all allies, absorbing DMG equal to 48% of Gepard's DEF plus 667.5 for 3 turn(s)."
          }
          110404: {
            Name: 'Unyielding Will'
            Desc: 'When struck by a killing blow, instead of being knocked down, immediately restores HP. This effect can only trigger 1 time per battle.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to 50% of his Max HP. This effect can only trigger once per battle."
            LongDescWithEidolon: "When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to 55% of his Max HP. This effect can only trigger once per battle."
          }
          110406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110407: {
            Name: 'Comradery'
            Desc: 'After this character uses Technique, all allies gain a Shield at the start of the next battle.'
            Type: 'Technique'
            LongDesc: "After Gepard uses his Technique, when the next battle begins, a Shield will be applied to all allies, absorbing DMG equal to 24% of Gepard's DEF plus 150 for 2 turn(s)."
          }
        }
        Eidolons: {
          110401: {
            Name: 'Due Diligence'
            Desc: 'When using Skill, increases the base chance to Freeze target enemy by 35%.'
          }
          110402: {
            Name: 'Lingering Cold'
            Desc: 'After an enemy Frozen by Skill is unfrozen, their SPD is reduced by 20% for 1 turn(s).'
          }
          110403: {
            Name: 'Never Surrender'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110404: {
            Name: 'Faith Moves Mountains'
            Desc: "When Gepard is in battle, all allies' Effect RES increases by 20%."
          }
          110405: {
            Name: 'Cold Iron Fist'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110406: {
            Name: 'Unyielding Resolve'
            Desc: 'When his Talent is triggered, Gepard immediately takes action and restores extra HP equal to 50% of his Max HP.'
          }
        }
        Effects: {
          10011041: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 1104
            ID: 10011041
          }
          10011042: {
            Name: 'Unyielding Will'
            Desc: 'When struck with a killing blow, instead of becoming downed, Gepard immediately restores HP equal to {{parameter0}}% of his Max HP.'
            Source: 1104
            ID: 10011042
          }
          10011043: {
            Name: 'DEF Boost'
            Desc: 'DEF +{{parameter0}}.'
            Effect: 'DEF Boost'
            Source: 1104
            ID: 10011043
          }
          10011044: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 1104
            ID: 10011044
          }
          10011045: {
            Name: 'Slow'
            Desc: 'SPD -{{parameter0}}%.'
            Effect: 'Slow'
            Source: 1104
            ID: 10011045
          }
          10011046: {
            Name: 'Effect RES Boost'
            Desc: 'Effect RES +{{parameter0}}%.'
            Source: 1104
            ID: 10011046
          }
          10011047: {
            Name: 'CRIT Rate Boost'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1104
            ID: 10011047
          }
          10011048: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}.'
            Effect: 'SPD Boost'
            Source: 1104
            ID: 10011048
          }
        }
        Traces: {
          A2: {
            Name: 'Integrity'
            Desc: 'Gepard has a higher chance to be attacked by enemies.'
            Owner: 1104
            ID: 1104101
            Ascension: 2
          }
          A4: {
            Name: 'Commander'
            Desc: "When \"Unyielding Will\" is triggered, Gepard's Energy will be restored to 100%."
            Owner: 1104
            ID: 1104102
            Ascension: 4
          }
          A6: {
            Name: 'Grit'
            Desc: "Gepard's ATK increases by 35% of his current DEF. This effect will refresh at the start of each turn."
            Owner: 1104
            ID: 1104103
            Ascension: 6
          }
        }
      }
      1105: {
        Name: 'Natasha'
        Abilities: {
          110501: {
            Name: 'Behind the Kindness'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110502: {
            Name: 'Love, Heal, and Choose'
            Desc: 'Restores HP for a single ally and provides Healing Over Time to them.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Restores a single ally for 10.5% of Natasha's Max HP plus 280. Restores the ally for another 7.2% of Natasha's Max HP plus 192 at the beginning of each turn for 2 turn(s)."
            LongDescWithEidolon: "Restores a single ally for 11.2% of Natasha's Max HP plus 311.5. Restores the ally for another 7.68% of Natasha's Max HP plus 213.6 at the beginning of each turn for 2 turn(s)."
          }
          110503: {
            Name: 'Gift of Rebirth'
            Desc: 'Restores HP for all allies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Heals all allies for 13.8% of Natasha's Max HP plus 368."
            LongDescWithEidolon: "Heals all allies for 14.72% of Natasha's Max HP plus 409.4."
          }
          110504: {
            Name: 'Innervation'
            Desc: 'When healing allies with low HP percentage, increases Outgoing Healing. This effect also works on continuous healing.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When healing allies with HP percentage at 30% or lower, increases Natasha's Outgoing Healing by 50%. This effect also works on continuous healing."
            LongDescWithEidolon: "When healing allies with HP percentage at 30% or lower, increases Natasha's Outgoing Healing by 55%. This effect also works on continuous healing."
          }
          110506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110507: {
            Name: 'Hypnosis Research'
            Desc: 'Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict Weaken to all enemy targets.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals Physical DMG equal to 80% of Natasha's ATK to a random enemy, with a 100% base chance to Weaken all enemies.\\nWhile Weakened, enemies deal 30% less DMG to allies for 1 turn(s)."
          }
        }
        Eidolons: {
          110501: {
            Name: 'Pharmacology Expertise'
            Desc: 'After being attacked, if the current HP percentage is 30% or lower, heals self for 1 time to restore HP by an amount equal to 15% of Max HP plus 400. This effect can only be triggered 1 time per battle.'
          }
          110502: {
            Name: 'Clinical Research'
            Desc: "When Natasha uses her Ultimate, grant continuous healing for 1 turn(s) to allies whose HP percentage is at 30% or lower. And at the beginning of their turn, their HP is restored by an amount equal to 6% of Natasha's Max HP plus 160."
          }
          110503: {
            Name: 'The Right Cure'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110504: {
            Name: 'Miracle Cure'
            Desc: 'After being attacked, regenerates 5 extra Energy.'
          }
          110505: {
            Name: 'Preventive Treatment'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110506: {
            Name: "Doctor's Grace"
            Desc: "Natasha's Basic ATK additionally deals Physical DMG equal to 40% of her Max HP."
          }
        }
        Effects: {
          10011051: {
            Name: 'Weaken'
            Desc: 'Deals {{parameter0}}% less DMG to your team.'
            Effect: 'Weaken'
            Source: 1105
            ID: 10011051
          }
          10011052: {
            Name: 'DEF Boost'
            Desc: 'DEF increases by {{parameter0}}%'
            Effect: 'DEF Boost'
            Source: 1105
            ID: 10011052
          }
          10011053: {
            Name: 'DMG Boost'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1105
            ID: 10011053
          }
          10011054: {
            Name: 'Healing Over Time'
            Desc: 'Restores a certain amount of HP at the start of each turn.'
            Effect: 'Healing Over Time'
            Source: 1105
            ID: 10011054
          }
          10011055: {
            Name: 'Healing Over Time'
            Desc: 'Restores a certain amount of HP at the start of each turn.'
            Effect: 'Healing Over Time'
            Source: 1105
            ID: 10011055
          }
        }
        Traces: {
          A2: {
            Name: 'Soothe'
            Desc: 'The Skill removes 1 debuff(s) from a target ally.'
            Owner: 1105
            ID: 1105101
            Ascension: 2
          }
          A4: {
            Name: 'Healer'
            Desc: "Natasha's Outgoing Healing increases by 10%."
            Owner: 1105
            ID: 1105102
            Ascension: 4
          }
          A6: {
            Name: 'Recuperation'
            Desc: "Increases the duration of Skill's continuous healing effect for 1 turn(s)."
            Owner: 1105
            ID: 1105103
            Ascension: 6
          }
        }
      }
      1106: {
        Name: 'Pela'
        Abilities: {
          110601: {
            Name: 'Frost Shot'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110602: {
            Name: 'Frostbite'
            Desc: 'Dispels 1 buff from a single enemy target, and deals Ice DMG to the target enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Removes 1 buff(s) and deals Ice DMG equal to 210% of Pela's ATK to a single target enemy."
            LongDescWithEidolon: "Removes 1 buff(s) and deals Ice DMG equal to 231% of Pela's ATK to a single target enemy."
          }
          110603: {
            Name: 'Zone Suppression'
            Desc: "Has a high chance of lowering enemies' DEF and deals minor Ice DMG to all enemies."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 100% of Pela's ATK to all enemies, with a 100% base chance to inflict Exposed on all enemies.\\nWhen Exposed, enemies' DEF is reduced by 40% for 2 turn(s)."
            LongDescWithEidolon: "Deals Ice DMG equal to 108% of Pela's ATK to all enemies, with a 100% base chance to inflict Exposed on all enemies.\\nWhen Exposed, enemies' DEF is reduced by 42% for 2 turn(s)."
          }
          110604: {
            Name: 'Data Collecting'
            Desc: 'After using an attack, if the enemy target is currently inflicted with debuff(s), Pela regenerates Energy.'
            Type: 'Talent'
            LongDescWithoutEidolon: "If the enemy is debuffed after Pela's attack, Pela will restore 10 additional Energy. This effect can only be triggered 1 time per attack."
            LongDescWithEidolon: "If the enemy is debuffed after Pela's attack, Pela will restore 11 additional Energy. This effect can only be triggered 1 time per attack."
          }
          110606: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110607: {
            Name: 'Preemptive Strike'
            Desc: 'Attacks the enemy. After entering battle, deals minor DMG to a random single enemy, with a high chance of lowering the DEF of all enemy targets.'
            Type: 'Technique'
            LongDesc: 'Immediately attacks the enemy. Upon entering battle, Pela deals Ice DMG equal to 80% of her ATK to a random enemy, with a 100% base chance of lowering the DEF of all enemies by 20% for 2 turn(s).'
          }
        }
        Eidolons: {
          110601: {
            Name: 'Victory Report'
            Desc: 'When an enemy is defeated, Pela regenerates 5 Energy.'
          }
          110602: {
            Name: 'Adamant Charge'
            Desc: 'Using Skill to remove buff(s) increases SPD by 10% for 2 turn(s).'
          }
          110603: {
            Name: 'Suppressive Force'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110604: {
            Name: 'Full Analysis'
            Desc: "When Skill is used, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turn(s)."
          }
          110605: {
            Name: 'Absolute Jeopardy'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110606: {
            Name: 'Feeble Pursuit'
            Desc: "When Pela attacks a debuffed enemy, she deals Additional Ice DMG equal to 40% of Pela's ATK to the enemy."
          }
        }
        Effects: {
          10011061: {
            Name: 'Exposed'
            Desc: 'DEF -{{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1106
            ID: 10011061
          }
          10011062: {
            Name: 'Ravage'
            Desc: 'DMG taken on Toughness +{{parameter0}}%.'
            Effect: 'Toughness Vulnerability'
            Source: 1106
            ID: 10011062
          }
          10011063: {
            Name: 'DEF Reduction'
            Desc: 'DEF -{{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1106
            ID: 10011063
          }
          10011064: {
            Name: 'Wipe Out'
            Desc: "Increases the next attack's DMG by {{parameter0}}%."
            Effect: 'DMG Boost'
            Source: 1106
            ID: 10011064
          }
          10011065: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1106
            ID: 10011065
          }
          10011066: {
            Name: 'Ice RES Reduction'
            Desc: 'Ice RES -{{parameter0}}%.'
            Effect: 'Ice RES Reduction'
            Source: 1106
            ID: 10011066
          }
        }
        Traces: {
          A2: {
            Name: 'Bash'
            Desc: 'Deals 20% more DMG to debuffed enemies.'
            Owner: 1106
            ID: 1106101
            Ascension: 2
          }
          A4: {
            Name: 'The Secret Strategy'
            Desc: "When Pela is on the battlefield, all allies' Effect Hit Rate increases by 10%."
            Owner: 1106
            ID: 1106102
            Ascension: 4
          }
          A6: {
            Name: 'Wipe Out'
            Desc: 'Using Skill to remove buff(s) increases the DMG of the next attack by 20%.'
            Owner: 1106
            ID: 1106103
            Ascension: 6
          }
        }
      }
      1107: {
        Name: 'Clara'
        Abilities: {
          110701: {
            Name: 'I Want to Help'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110702: {
            Name: 'Svarog Watches Over You'
            Desc: 'Deals Physical DMG to all enemies. Additionally deals Physical DMG to targets with Marks of Counter.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 120% of Clara's ATK to all enemies, and additionally deals Physical DMG equal to 120% of Clara's ATK to enemies marked by Svarog with a Mark of Counter.\\nAll Marks of Counter will be removed after this Skill is used."
            LongDescWithEidolon: "Deals Physical DMG equal to 132% of Clara's ATK to all enemies, and additionally deals Physical DMG equal to 132% of Clara's ATK to enemies marked by Svarog with a Mark of Counter.\\nAll Marks of Counter will be removed after this Skill is used."
          }
          110703: {
            Name: 'Promise, Not Command'
            Desc: 'Reduces DMG received, increases chance to be attacked by enemies, and enhances Counters.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "After Clara uses Ultimate, DMG dealt to her is reduced by an extra 25%, and she has greatly increased chances of being attacked by enemies for 2 turn(s).\\nIn addition, Svarog's Counter is enhanced. When an ally is attacked, Svarog immediately launches a Counter, and its DMG multiplier against the enemy increases by 160%. Enemies adjacent to it take 50% of the DMG dealt to the primary target enemy. Enhanced Counter(s) can take effect 2 time(s)."
            LongDescWithEidolon: "After Clara uses Ultimate, DMG dealt to her is reduced by an extra 27%, and she has greatly increased chances of being attacked by enemies for 2 turn(s).\\nIn addition, Svarog's Counter is enhanced. When an ally is attacked, Svarog immediately launches a Counter, and its DMG multiplier against the enemy increases by 172.8%. Enemies adjacent to it take 50% of the DMG dealt to the primary target enemy. Enhanced Counter(s) can take effect 2 time(s)."
          }
          110704: {
            Name: "Because We're Family"
            Desc: "DMG received from enemy attacks is reduced. Enemies who attack Clara will be marked with a Mark of Counter and met with Svarog's Counter, dealing Physical DMG."
            Type: 'Talent'
            LongDescWithoutEidolon: "Under the protection of Svarog, DMG taken by Clara when hit by enemy attacks is reduced by 10%. Svarog will mark enemies who attack Clara with his Mark of Counter and retaliate with a Counter, dealing Physical DMG equal to 160% of Clara's ATK."
            LongDescWithEidolon: "Under the protection of Svarog, DMG taken by Clara when hit by enemy attacks is reduced by 10%. Svarog will mark enemies who attack Clara with his Mark of Counter and retaliate with a Counter, dealing Physical DMG equal to 176% of Clara's ATK."
          }
          110706: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110707: {
            Name: 'A Small Price for Victory'
            Desc: "Attacks the enemy. After entering battle, this character's chance of being attacked by enemies increases."
            Type: 'Technique'
            LongDesc: 'Immediately attacks the enemy. Upon entering battle, the chance Clara will be attacked by enemies increases for 2 turn(s).'
          }
        }
        Eidolons: {
          110701: {
            Name: 'A Tall Figure'
            Desc: 'Using Skill will not remove Marks of Counter on the enemy.'
          }
          110702: {
            Name: 'A Tight Embrace'
            Desc: 'After using the Ultimate, ATK increases by 30% for 2 turn(s).'
          }
          110703: {
            Name: 'Cold Steel Armor'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110704: {
            Name: "Family's Warmth"
            Desc: 'After Clara is hit, the DMG taken by Clara is reduced by 30%. This effect lasts until the start of her next turn.'
          }
          110705: {
            Name: 'A Small Promise'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110706: {
            Name: 'Long Company'
            Desc: 'After other allies are hit, Svarog also has a 50% fixed chance to trigger a Counter on the attacker and mark them with a Mark of Counter. When using Ultimate, the number of Enhanced Counters increases by 1.'
          }
        }
        Effects: {
          10011071: {
            Name: 'Promise, Not Command'
            Desc: 'Receives less DMG with a higher chance to be attacked.'
            Effect: 'DMG Mitigation'
            Source: 1107
            ID: 10011071
          }
          10011072: {
            Name: 'Mark of Counter'
            Desc: 'The target is Marked by Svarog.'
            Source: 1107
            ID: 10011072
          }
          10011073: {
            Name: 'Guardian'
            Desc: 'DMG taken -{{parameter0}}%.'
            Source: 1107
            ID: 10011073
          }
          10011074: {
            Name: 'DMG Mitigation'
            Desc: 'DMG taken -{{parameter0}}%.'
            Source: 1107
            ID: 10011074
          }
          10011075: {
            Name: 'A Small Price for Victory'
            Desc: 'Higher chance to be attacked.'
            Source: 1107
            ID: 10011075
          }
          10011076: {
            Name: 'Enhanced Counter'
            Desc: 'Allies being attacked will also trigger Counter, for which the DMG multiplier is also increased.'
            Source: 1107
            ID: 10011076
          }
          10011077: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1107
            ID: 10011077
          }
        }
        Traces: {
          A2: {
            Name: 'Kinship'
            Desc: 'When attacked, this character has a 35% fixed chance to remove a debuff placed on them.'
            Owner: 1107
            ID: 1107101
            Ascension: 2
          }
          A4: {
            Name: 'Under Protection'
            Desc: 'The chance to resist Crowd Control Debuffs increases by 35%.'
            Owner: 1107
            ID: 1107102
            Ascension: 4
          }
          A6: {
            Name: 'Revenge'
            Desc: "Increases Svarog's Counter DMG by 30%."
            Owner: 1107
            ID: 1107103
            Ascension: 6
          }
        }
      }
      1108: {
        Name: 'Sampo'
        Abilities: {
          110801: {
            Name: 'Dazzling Blades'
            Desc: 'Deals minor Wind DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110802: {
            Name: 'Ricochet Love'
            Desc: 'Deals minor Wind DMG to single enemy targets with 5 Bounces in total.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 56% of Sampo's ATK to a single enemy, and further deals DMG for 4 extra time(s), with each time dealing Wind DMG equal to 56% of Sampo's ATK to a random enemy."
            LongDescWithEidolon: "Deals Wind DMG equal to 61.6% of Sampo's ATK to a single enemy, and further deals DMG for 4 extra time(s), with each time dealing Wind DMG equal to 61.6% of Sampo's ATK to a random enemy."
          }
          110803: {
            Name: 'Surprise Present'
            Desc: 'Deals Wind DMG to all enemies, with a high chance to cause increased DoT taken to them.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 160% of Sampo's ATK to all enemies, with a 100% base chance to increase the targets' DoT taken by 30% for 2 turn(s)."
            LongDescWithEidolon: "Deals Wind DMG equal to 172.8% of Sampo's ATK to all enemies, with a 100% base chance to increase the targets' DoT taken by 32% for 2 turn(s)."
          }
          110804: {
            Name: 'Windtorn Dagger'
            Desc: 'After hitting an enemy, there is a chance of inflicting Wind Shear on the target.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Sampo's attacks have a 65% base chance to inflict Wind Shear for 3 turn(s).\\nEnemies inflicted with Wind Shear will take Wind DoT equal to 52% of Sampo's ATK at the beginning of each turn. Wind Shear can stack up to 5 time(s)."
            LongDescWithEidolon: "Sampo's attacks have a 65% base chance to inflict Wind Shear for 3 turn(s).\\nEnemies inflicted with Wind Shear will take Wind DoT equal to 57.2% of Sampo's ATK at the beginning of each turn. Wind Shear can stack up to 5 time(s)."
          }
          110806: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110807: {
            Name: 'Shining Bright'
            Desc: "Enemies in a set area are Blinded. When initiating battle against a Blinded enemy, there is a high chance to delay all enemies' actions."
            Type: 'Technique'
            LongDesc: "After Sampo uses his Technique, enemies in a set area are inflicted with Blind for 10 second(s). Blinded enemies cannot detect your team.\\nWhen initiating combat against a Blinded enemy, there is a 100% fixed chance to delay all enemies' action by 25%."
          }
        }
        Eidolons: {
          110801: {
            Name: 'Rising Love'
            Desc: 'When using Skill, deals DMG for 1 extra time(s) to a random enemy.'
          }
          110802: {
            Name: 'Infectious Enthusiasm'
            Desc: "Defeating an enemy with Wind Shear has a 100% base chance to inflict all enemies with 1 stack(s) of Wind Shear, equivalent to the Talent's Wind Shear."
          }
          110803: {
            Name: 'Big Money!'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110804: {
            Name: 'The Deeper the Love, the Stronger the Hate'
            Desc: 'When Skill hits an enemy with 5 or more stack(s) of Wind Shear, the enemy immediately takes 8% of current Wind Shear DMG.'
          }
          110805: {
            Name: 'Huuuuge Money!'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110806: {
            Name: 'Increased Spending'
            Desc: "Talent's Wind Shear DMG multiplier increases by 15%."
          }
        }
        Effects: {
          10011081: {
            Name: 'DoT Vulnerability'
            Desc: 'DoT taken +{{parameter0}}%.'
            Effect: 'DoT Vulnerability'
            Source: 1108
            ID: 10011081
          }
        }
        Traces: {
          A2: {
            Name: 'Trap'
            Desc: 'Extends the duration of Wind Shear caused by Talent by 1 turn(s).'
            Owner: 1108
            ID: 1108101
            Ascension: 2
          }
          A4: {
            Name: 'Defensive Position'
            Desc: 'Using Ultimate additionally regenerates 10 Energy.'
            Owner: 1108
            ID: 1108102
            Ascension: 4
          }
          A6: {
            Name: 'Spice Up'
            Desc: 'Enemies with Wind Shear effect deal 15% less DMG to Sampo.'
            Owner: 1108
            ID: 1108103
            Ascension: 6
          }
        }
      }
      1109: {
        Name: 'Hook'
        Abilities: {
          110901: {
            Name: "Hehe! Don't Get Burned!"
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          110902: {
            Name: 'Hey! Remember Hook?'
            Desc: 'Deals Fire DMG to a single enemy, with a high chance to inflict Burn on the enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 240% of Hook's ATK to a single enemy. In addition, there is a 100% base chance to inflict Burn for 2 turn(s).\\nWhen afflicted with Burn, enemies will take Fire DoT equal to 65% of Hook's ATK at the beginning of each turn."
            LongDescWithEidolon: "Deals Fire DMG equal to 264% of Hook's ATK to a single enemy. In addition, there is a 100% base chance to inflict Burn for 2 turn(s).\\nWhen afflicted with Burn, enemies will take Fire DoT equal to 71.5% of Hook's ATK at the beginning of each turn."
          }
          110903: {
            Name: 'Boom! Here Comes the Fire!'
            Desc: "Deals massive Fire DMG to a single enemy and Enhances this unit's next Skill."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 400% of Hook's ATK to a single enemy.\\nAfter using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it."
            LongDescWithEidolon: "Deals Fire DMG equal to 432% of Hook's ATK to a single enemy.\\nAfter using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it."
          }
          110904: {
            Name: 'Ha! Oil to the Flames!'
            Desc: 'When attacking a Burned enemy, deals Additional Fire DMG for a moderate amount, and additionally regenerates energy.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When attacking a target afflicted with Burn, deals Additional Fire DMG equal to 100% of Hook's ATK and regenerates 5 extra Energy."
            LongDescWithEidolon: "When attacking a target afflicted with Burn, deals Additional Fire DMG equal to 110% of Hook's ATK and regenerates 5 extra Energy."
          }
          110906: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          110907: {
            Name: 'Ack! Look at This Mess!'
            Desc: 'Attacks the enemy. After entering battle, deals Fire DMG to a random single enemy, with a high chance to inflict Burn on all enemy targets.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. Upon entering battle, Hook deals Fire DMG equal to 50% of her ATK to a random enemy. In addition, there is a 100% base chance to inflict Burn on every enemy for 3 turn(s).\\nWhen afflicted with Burn, enemies will take Fire DoT equal to 50% of Hook's ATK at the beginning of each turn."
          }
        }
        Eidolons: {
          110901: {
            Name: 'Early to Bed, Early to Rise'
            Desc: 'Enhanced Skill deals 20% increased DMG.'
          }
          110902: {
            Name: 'Happy Tummy, Happy Body'
            Desc: 'Extends the duration of Burn caused by Skill by 1 turn(s).'
          }
          110903: {
            Name: "Don't Be Picky, Nothing's Icky"
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          110904: {
            Name: "It's Okay to Not Know"
            Desc: 'When Talent is triggered, there is a 100% base chance to Burn enemies adjacent to the target enemy, equivalent to that of Skill.'
          }
          110905: {
            Name: "Let the Moles' Deeds Be Known"
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          110906: {
            Name: 'Always Ready to Punch and Kick'
            Desc: 'Hook deals 20% more DMG to enemies afflicted with Burn.'
          }
        }
        Effects: {
          10011091: {
            Name: 'Enhanced Skill'
            Desc: 'Enhances the next Skill and changes it to a Blast attack.'
            Effect: 'Enhanced Skill'
            Source: 1109
            ID: 10011091
          }
        }
        Traces: {
          A2: {
            Name: 'Innocence'
            Desc: 'Hook restores HP equal to 5% of her Max HP whenever her Talent is triggered.'
            Owner: 1109
            ID: 1109101
            Ascension: 2
          }
          A4: {
            Name: 'Naivete'
            Desc: 'The chance to resist Crowd Control Debuffs increases by 35%.'
            Owner: 1109
            ID: 1109102
            Ascension: 4
          }
          A6: {
            Name: 'Playing With Fire'
            Desc: 'When using her Ultimate, Hook has her action Advanced Forward by 20% and Hook additionally regenerates 5 Energy.'
            Owner: 1109
            ID: 1109103
            Ascension: 6
          }
        }
      }
      1110: {
        Name: 'Lynx'
        Abilities: {
          111001: {
            Name: 'Ice Crampon Technique'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          111002: {
            Name: 'Salted Camping Cans'
            Desc: 'Applies "Survival Response" to a single ally, increases their Max HP, and restores their HP.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Applies \"Survival Response\" to a single target ally and increases their Max HP by 7.5% of Lynx's Max HP plus 200. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. \"Survival Response\" lasts for 2 turn(s).\\nRestores the target's HP by 12% of Lynx's Max HP plus 320."
            LongDescWithEidolon: "Applies \"Survival Response\" to a single target ally and increases their Max HP by 8% of Lynx's Max HP plus 222.5. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. \"Survival Response\" lasts for 2 turn(s).\\nRestores the target's HP by 12.8% of Lynx's Max HP plus 356."
          }
          111003: {
            Name: 'Snowfield First Aid'
            Desc: 'Dispels 1 debuff from all allies and restores their HP.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Dispels 1 debuff(s) from all allies and immediately restores their respective HP by an amount equal to 13.5% of Lynx's Max HP plus 360."
            LongDescWithEidolon: "Dispels 1 debuff(s) from all allies and immediately restores their respective HP by an amount equal to 14.4% of Lynx's Max HP plus 400.5."
          }
          111004: {
            Name: 'Outdoor Survival Experience'
            Desc: 'When using Skill or Ultimate, applies continuous healing on the target ally. If the target has "Survival Response," the continuous healing effect additionally increases.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for 2 turn(s), restoring the target ally's HP by an amount equal to 3.6% of Lynx's Max HP plus 96 at the start of each turn. If the target has \"Survival Response,\" the continuous healing effect additionally restores HP by an amount equal to 4.5% of Lynx's Max HP plus 120."
            LongDescWithEidolon: "When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for 2 turn(s), restoring the target ally's HP by an amount equal to 3.84% of Lynx's Max HP plus 106.8 at the start of each turn. If the target has \"Survival Response,\" the continuous healing effect additionally restores HP by an amount equal to 4.8% of Lynx's Max HP plus 133.5."
          }
          111006: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          111007: {
            Name: 'Chocolate Energy Bar'
            Desc: 'After this character uses her Technique, at the start of the next battle, all allies are granted a continuous healing effect.'
            Type: 'Technique'
            LongDesc: "After Lynx uses her Technique, at the start of the next battle, all allies are granted her Talent's continuous healing effect, lasting for 2 turn(s)."
          }
        }
        Eidolons: {
          111001: {
            Name: 'Morning of Snow Hike'
            Desc: "When healing allies with HP percentage equal to or lower than 50%, Lynx's Outgoing Healing increases by 20%. This effect also works on continuous healing."
          }
          111002: {
            Name: 'Noon of Portable Furnace'
            Desc: 'A target with "Survival Response" can resist debuff application for 1 time(s).'
          }
          111003: {
            Name: 'Afternoon of Avalanche Beacon'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          111004: {
            Name: 'Dusk of Warm Campfire'
            Desc: "When \"Survival Response\" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s)."
          }
          111005: {
            Name: 'Night of Aurora Tea'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          111006: {
            Name: "Dawn of Explorers' Chart"
            Desc: "Additionally boosts the Max HP increasing effect of \"Survival Response\" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%."
          }
        }
        Effects: {
          10011101: {
            Name: 'Healing Over Time'
            Desc: 'Restores a certain amount of HP at the start of each turn.'
            Effect: 'Healing Over Time'
            Source: 1110
            ID: 10011101
          }
          10011102: {
            Name: 'SPD Boost'
            Desc: 'Increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1110
            ID: 10011102
          }
          10011103: {
            Name: 'ATK Boost'
            Desc: 'Increases ATK by {{parameter0}}.'
            Effect: 'ATK Boost'
            Source: 1110
            ID: 10011103
          }
          10011104: {
            Name: 'Survival Response'
            Desc: 'Increases Max HP by {{parameter0}}.'
            Effect: 'Max HP Boost'
            Source: 1110
            ID: 10011104
          }
          10011105: {
            Name: 'Survival Response'
            Desc: 'Increases Max HP by {{parameter0}} and Effect RES by {{parameter1}}%.'
            Effect: 'Max HP Boost'
            Source: 1110
            ID: 10011105
          }
          10011106: {
            Name: 'Debuff RES'
            Desc: 'Resists 1 debuff.'
            Source: 1110
            ID: 10011106
          }
        }
        Traces: {
          A2: {
            Name: 'Advance Surveying'
            Desc: 'After a target with "Survival Response" is hit, Lynx regenerates 2 Energy immediately.'
            Owner: 1110
            ID: 1110101
            Ascension: 2
          }
          A4: {
            Name: 'Exploration Techniques'
            Desc: 'Increases the chance to resist Crowd Control debuffs by 35%.'
            Owner: 1110
            ID: 1110102
            Ascension: 4
          }
          A6: {
            Name: 'Survival in the Extreme'
            Desc: 'Extends the duration of the continuous healing effect granted by Talent for 1 turn(s).'
            Owner: 1110
            ID: 1110103
            Ascension: 6
          }
        }
      }
      1111: {
        Name: 'Luka'
        Abilities: {
          111101: {
            Name: 'Direct Punch'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          111102: {
            Name: 'Lacerating Fist'
            Desc: 'Deals Physical DMG to a single enemy, with a high chance of causing Bleed.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 120% of Luka's ATK to a single enemy target. In addition, there is a 100% base chance to inflict Bleed on them, lasting for 3 turn(s).\\nWhile Bleeding, the enemy will take 24% of their Max HP as Physical DoT at the start of each turn. This DMG will not exceed more than 338% of Luka's ATK."
            LongDescWithEidolon: "Deals Physical DMG equal to 132% of Luka's ATK to a single enemy target. In addition, there is a 100% base chance to inflict Bleed on them, lasting for 3 turn(s).\\nWhile Bleeding, the enemy will take 24% of their Max HP as Physical DoT at the start of each turn. This DMG will not exceed more than 371.8% of Luka's ATK."
          }
          111103: {
            Name: 'Coup de Grâce'
            Desc: "Receives NaN stack(s) of Fighting Will, with a high chance of increasing the target's DMG received, and deals massive Physical DMG to the target."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Receives 2 stack(s) of Fighting Will, with a 100% base chance to increase a single enemy target's DMG received by 20% for 3 turn(s). Then, deals Physical DMG equal to 330% of Luka's ATK to the target."
            LongDescWithEidolon: "Receives 2 stack(s) of Fighting Will, with a 100% base chance to increase a single enemy target's DMG received by 21.6% for 3 turn(s). Then, deals Physical DMG equal to 356.4% of Luka's ATK to the target."
          }
          111104: {
            Name: 'Flying Sparks'
            Desc: 'After using the Basic ATK "Direct Punch" or the Skill "Lacerating Fist," receives 1 stack of Fighting Will. When 2 or more stacks of Fighting Will are present, Basic ATK becomes Enhanced.\\nIf the enemy is Bleeding, the Enhanced Basic ATK will cause Bleed to deal extra DMG for 1 time.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After Luka uses his Basic ATK \"Direct Punch\" or Skill \"Lacerating Fist,\" he receives 1 stack of Fighting Will, up to 4 stacks. When he has 2 or more stacks of Fighting Will, his Basic ATK \"Direct Punch\" is enhanced to \"Sky-Shatter Fist.\" After his Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG for 1 time equal to 85% of the original DMG to the target. At the start of battle, Luka will possess 1 stack of Fighting Will."
            LongDescWithEidolon: "After Luka uses his Basic ATK \"Direct Punch\" or Skill \"Lacerating Fist,\" he receives 1 stack of Fighting Will, up to 4 stacks. When he has 2 or more stacks of Fighting Will, his Basic ATK \"Direct Punch\" is enhanced to \"Sky-Shatter Fist.\" After his Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG for 1 time equal to 88.4% of the original DMG to the target. At the start of battle, Luka will possess 1 stack of Fighting Will."
          }
          111106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          111107: {
            Name: 'Anticipator'
            Desc: 'Attacks the enemy. After entering battle, deals minor Physical DMG to a random single enemy, with a high chance to inflict Bleed to the target. Then, gains 1 stack of Fighting Will.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. Upon entering battle, Luka deals Physical DMG equal to 50% of his ATK to a random single enemy with a 100% base chance to inflict his Skill's Bleed effect on the target. Then, Luka gains 1 additional stack of Fighting Will."
          }
        }
        Eidolons: {
          111101: {
            Name: 'Fighting Endlessly'
            Desc: 'When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turn(s).'
          }
          111102: {
            Name: 'The Enemy is Weak, I am Strong'
            Desc: 'If the Skill hits an enemy target with Physical Weakness, gain 1 stack(s) of Fighting Will.'
          }
          111103: {
            Name: 'Born for the Ring'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          111104: {
            Name: 'Never Turning Back'
            Desc: 'For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 time(s).'
          }
          111105: {
            Name: 'The Spirit of Wildfire'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          111106: {
            Name: "A Champion's Applause"
            Desc: "After the Enhanced Basic ATK's \"Rising Uppercut\" hits a Bleeding enemy target, the Bleed status will immediately deal DMG 1 time equal to 8% of the original DMG for every hit of Direct Punch already unleashed during the current Enhanced Basic ATK."
          }
        }
        Effects: {
          10011111: {
            Name: 'Fighting Endlessly'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1111
            ID: 10011111
          }
          10011112: {
            Name: 'Never Turning Back'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1111
            ID: 10011112
          }
          10011114: {
            Name: 'Vulnerability'
            Desc: 'Increases DMG taken by {{parameter0}}%.'
            Effect: 'Vulnerability'
            Source: 1111
            ID: 10011114
          }
          10011115: {
            Name: 'Bleed'
            Desc: 'Takes Physical DMG at the start of each turn for a certain number of turns.'
            Effect: 'Bleed'
            Source: 1111
            ID: 10011115
          }
        }
        Traces: {
          A2: {
            Name: 'Kinetic Overload'
            Desc: 'When the Skill is used, immediately dispels 1 buff from the enemy target.'
            Owner: 1111
            ID: 1111101
            Ascension: 2
          }
          A4: {
            Name: 'Cycle Braking'
            Desc: 'For every stack of Fighting Will obtained, additionally regenerates 3 Energy.'
            Owner: 1111
            ID: 1111102
            Ascension: 4
          }
          A6: {
            Name: 'Crush Fighting Will'
            Desc: 'When using Enhanced Basic ATK, every hit Direct Punch deals has a 50% fixed chance for Luka to use 1 additional hit. This effect does not apply to additional hits generated in this way.'
            Owner: 1111
            ID: 1111103
            Ascension: 6
          }
        }
      }
      1112: {
        Name: 'Topaz & Numby'
        Abilities: {
          111201: {
            Name: 'Deficit...'
            Desc: 'Deals minor Fire DMG to an enemy.'
            Type: 'Basic ATK'
          }
          111202: {
            Name: 'Difficulty Paying?'
            Desc: 'Inflicts a single enemy with a Proof of Debt status and causes it to receive increased follow-up attack DMG. Numby deals Fire DMG to the target.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Inflicts a single target enemy with a Proof of Debt status, increasing the follow-up attack DMG it receives by 50%. Proof of Debt only takes effect on the most recent target it is applied to. If there are no enemies inflicted with Proof of Debt on the field when an ally's turn starts or when an ally takes action, Topaz will inflict a random enemy with Proof of Debt.\\nNumby deals Fire DMG equal to 150% of Topaz's ATK to this target. Using this Skill to deal DMG is considered as launching a follow-up attack."
            LongDescWithEidolon: "Inflicts a single target enemy with a Proof of Debt status, increasing the follow-up attack DMG it receives by 55%. Proof of Debt only takes effect on the most recent target it is applied to. If there are no enemies inflicted with Proof of Debt on the field when an ally's turn starts or when an ally takes action, Topaz will inflict a random enemy with Proof of Debt.\\nNumby deals Fire DMG equal to 165% of Topaz's ATK to this target. Using this Skill to deal DMG is considered as launching a follow-up attack."
          }
          111203: {
            Name: 'Turn a Profit!'
            Desc: 'Numby enters the Windfall Bonanza! state and increases its DMG multiplier and CRIT DMG.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Numby enters the Windfall Bonanza! state and its DMG multiplier increases by 150% and CRIT DMG increases by 25%. Also, when enemies with Proof of Debt are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by 50%. Numby exits the Windfall Bonanza! state after using 2 attacks."
            LongDescWithEidolon: "Numby enters the Windfall Bonanza! state and its DMG multiplier increases by 165% and CRIT DMG increases by 27.5%. Also, when enemies with Proof of Debt are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by 50%. Numby exits the Windfall Bonanza! state after using 2 attacks."
          }
          111204: {
            Name: 'Trotter Market!?'
            Desc: "At the start of battle, summons Numby. When Numby takes action, Numby deals follow-up attacks to a single enemy with Proof of Debt. When an enemy with Proof of Debt takes DMG from follow-up attacks, Numby's action is Advanced Forward."
            Type: 'Talent'
            LongDescWithoutEidolon: "Summons Numby at the start of battle. Numby has 80 SPD by default. When taking action, Numby launches follow-up attacks on a single enemy target afflicted with Proof of Debt, dealing Fire DMG equal to 150% of Topaz's ATK.\\nWhen enemies afflicted with Proof of Debt receive an ally's follow-up attacks, Numby's action is Advanced Forward by 50%. The action Advance Forward effect cannot be triggered during Numby's own turn.\\nWhen Topaz is downed, Numby disappears."
            LongDescWithEidolon: "Summons Numby at the start of battle. Numby has 80 SPD by default. When taking action, Numby launches follow-up attacks on a single enemy target afflicted with Proof of Debt, dealing Fire DMG equal to 165% of Topaz's ATK.\\nWhen enemies afflicted with Proof of Debt receive an ally's follow-up attacks, Numby's action is Advanced Forward by 50%. The action Advance Forward effect cannot be triggered during Numby's own turn.\\nWhen Topaz is downed, Numby disappears."
          }
          111206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          111207: {
            Name: 'Explicit Subsidy'
            Desc: "Summons Numby to tag along in a map. Numby will automatically search for Basic Treasures and Trotters nearby. Using Technique will regenerate Energy for Topaz after Numby's first attack in the next battle."
            Type: 'Technique'
            LongDesc: "Summons Numby when Topaz enters the overworld. Numby will automatically search for Basic Treasures and Trotters within a set radius.\\nUsing her Technique will regenerate 60 Energy for Topaz after Numby's first attack in the next battle.\\nIf Topaz is still in the team after using her Technique and defeating overworld enemies, a small bonus amount of credits will be added to the earned credits. A maximum of 10000 bonus credits can be received per calendar day.\\nAfter using her Technique and defeating enemies in Simulated Universe or Divergent Universe, additionally receive a small amount of Cosmic Fragments with a small chance to obtain 1 random Curio."
          }
        }
        Eidolons: {
          111201: {
            Name: 'Future Market'
            Desc: 'When enemies afflicted with Proof of Debt receive follow-up attacks, they will enter the Debtor state. This can take effect only once within a single attack.\\nThe Debtor state increases the CRIT DMG of follow-up attacks inflicted on the target enemies by 25%, stacking up to 2 time(s). When Proof of Debt is removed, the Debtor state is also removed.'
          }
          111202: {
            Name: 'Bona Fide Acquisition'
            Desc: 'After Numby takes action and launches an attack, Topaz regenerates 5 Energy.'
          }
          111203: {
            Name: 'Seize the Big and Free the Small'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          111204: {
            Name: 'Agile Operation'
            Desc: "After Numby's turn begins, Topaz's action is Advanced Forward by 20%."
          }
          111205: {
            Name: 'Inflationary Demand'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          111206: {
            Name: 'Incentive Mechanism'
            Desc: "Numby's attack count during the Windfall Bonanza! state increases by 1, and its Fire RES PEN increases by 10% when it attacks."
          }
        }
        Effects: {
          10011121: {
            Name: 'Windfall Bonanza!'
            Desc: "Numby's DMG multiplier increases by {{parameter0}}%, CRIT DMG increases by {{parameter1}}%. When enemies with Proof of Debt receive attacks from allies' Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by {{parameter2}}%."
            Source: 1112
            ID: 10011121
          }
          10011122: {
            Name: 'Proof of Debt'
            Desc: 'Increases follow-up attack DMG received by {{parameter0}}%. Numby will target this unit as its attack target.'
            Effect: 'Proof of Debt'
            Source: 1112
            ID: 10011122
          }
          10011123: {
            Name: 'Debtor'
            Desc: 'Increases CRIT DMG received from follow-up attacks by {{parameter0}}%, stacking up to {{parameter1}} time(s).'
            Effect: 'Debtor'
            Source: 1112
            ID: 10011123
          }
          10011124: {
            Effect: 'DMG multiplier, CRIT DMG Boost'
            Source: 1112
            ID: 10011124
          }
        }
        Traces: {
          A2: {
            Name: 'Overdraft'
            Desc: 'When Topaz uses Basic ATK to deal DMG, it will be considered as a follow-up attack.'
            Owner: 1112
            ID: 1112101
            Ascension: 2
          }
          A4: {
            Name: 'Financial Turmoil'
            Desc: "Increases Topaz & Numby's DMG dealt to enemy targets with Fire Weakness by 15%."
            Owner: 1112
            ID: 1112102
            Ascension: 4
          }
          A6: {
            Name: 'Stonks Market'
            Desc: 'After Numby uses an attack while in the Windfall Bonanza! state, Topaz additionally regenerates 10 Energy.'
            Owner: 1112
            ID: 1112103
            Ascension: 6
          }
        }
      }
      1201: {
        Name: 'Qingque'
        Abilities: {
          120101: {
            Name: 'Flower Pick'
            Desc: 'Tosses a tile to deal minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120102: {
            Name: 'A Scoop of Moon'
            Desc: 'Draws tiles and increases DMG dealt. This turn does not end after this action.'
            Type: 'Skill'
            LongDescWithoutEidolon: 'Immediately draws 2 jade tile(s) and increases DMG by 28% until the end of the current turn. This effect can stack up to 4 time(s). The turn will not end after this Skill is used.'
            LongDescWithEidolon: 'Immediately draws 2 jade tile(s) and increases DMG by 30.8% until the end of the current turn. This effect can stack up to 4 time(s). The turn will not end after this Skill is used.'
          }
          120103: {
            Name: 'A Quartet? Woo-hoo!'
            Desc: 'Deals Quantum DMG to all enemies, then obtains 4 tiles of the same suit.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Quantum DMG equal to 200% of Qingque's ATK to all enemies, and obtains 4 jade tiles of the same suit."
            LongDescWithEidolon: "Deals Quantum DMG equal to 216% of Qingque's ATK to all enemies, and obtains 4 jade tiles of the same suit."
          }
          120104: {
            Name: 'Celestial Jade'
            Desc: "At the start of any ally's turn, draws a tile. At the start of this character's turn, if this character holds 4 tiles from the same suit, remove all tiles in possession and Enhance this Basic ATK while increasing this character's ATK."
            Type: 'Talent'
            LongDescWithoutEidolon: "When an ally's turn starts, Qingque randomly draws 1 tile from 3 different suits and can hold up to 4 tiles at one time.\\nIf Qingque starts her turn with 4 tiles of the same suit, she consumes all tiles to enter the \"Hidden Hand\" state.\\nWhile in this state, Qingque cannot use her Skill again. At the same time, Qingque's ATK increases by 72%, and her Basic ATK \"Flower Pick\" is enhanced, becoming \"Cherry on Top!\" The \"Hidden Hand\" state ends after using \"Cherry on Top!\"."
            LongDescWithEidolon: "When an ally's turn starts, Qingque randomly draws 1 tile from 3 different suits and can hold up to 4 tiles at one time.\\nIf Qingque starts her turn with 4 tiles of the same suit, she consumes all tiles to enter the \"Hidden Hand\" state.\\nWhile in this state, Qingque cannot use her Skill again. At the same time, Qingque's ATK increases by 79.2%, and her Basic ATK \"Flower Pick\" is enhanced, becoming \"Cherry on Top!\" The \"Hidden Hand\" state ends after using \"Cherry on Top!\"."
          }
          120106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120107: {
            Name: 'Game Solitaire'
            Desc: 'After they use their Technique, draw tile(s) at the start of the next battle.'
            Type: 'Technique'
            LongDesc: 'After using Technique, Qingque draws 2 jade tile(s) when the battle starts.'
          }
        }
        Eidolons: {
          120101: {
            Name: 'Rise Through the Tiles'
            Desc: 'Ultimate deals 10% more DMG.'
          }
          120102: {
            Name: 'Sleep on the Tiles'
            Desc: 'Every time Draw Tile is triggered, Qingque immediately regenerates 1 Energy.'
          }
          120103: {
            Name: 'Read Between the Tiles'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120104: {
            Name: 'Right on the Tiles'
            Desc: 'After using Skill, there is a 24% fixed chance to gain Self-Sufficer, lasting until the end of the current turn. \\nWith Self-Sufficer, using Basic ATK or Enhanced Basic ATK immediately launches 1 follow-up attack on the same target, dealing Quantum DMG equal to 100% of Basic ATK DMG or Enhanced Basic ATK DMG.'
          }
          120105: {
            Name: 'Gambit for the Tiles'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120106: {
            Name: 'Prevail Beyond the Tiles'
            Desc: 'Recovers 1 Skill Point after using Enhanced Basic ATK.'
          }
        }
        Effects: {
          10012011: {
            Name: 'Hidden Hand'
            Desc: 'Basic ATK is Enhanced and increases ATK by {{parameter0}}%.'
            Source: 1201
            ID: 10012011
          }
          10012012: {
            Name: 'DMG Boost'
            Desc: 'Each stack increases DMG by {{parameter0}}%, up to 4 stacks.'
            Source: 1201
            ID: 10012012
          }
          10012013: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1201
            ID: 10012013
          }
          10012014: {
            Name: 'Self-Sufficer'
            Desc: 'Launches 1 follow-up attack immediately after using Basic ATK or Enhanced Basic ATK on an enemy, dealing Quantum DMG equal to 100% of Basic ATK DMG or Enhanced Basic ATK DMG.'
            Source: 1201
            ID: 10012014
          }
        }
        Traces: {
          A2: {
            Name: 'Tile Battle'
            Desc: 'Restores 1 Skill Point when using the Skill. This effect can only be triggered 1 time per battle.'
            Owner: 1201
            ID: 1201101
            Ascension: 2
          }
          A4: {
            Name: 'Bide Time'
            Desc: 'Using the Skill increases DMG Boost effect of attacks by an extra 10%.'
            Owner: 1201
            ID: 1201102
            Ascension: 4
          }
          A6: {
            Name: 'Winning Hand'
            Desc: "Qingque's SPD increases by 10% for 1 turn after using the Enhanced Basic ATK."
            Owner: 1201
            ID: 1201103
            Ascension: 6
          }
        }
      }
      1202: {
        Name: 'Tingyun'
        Abilities: {
          120201: {
            Name: 'Dislodged'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120202: {
            Name: 'Soothing Melody'
            Desc: 'Increases the ATK of a single ally and grants them Benediction. Ally with Benediction additionally deals minor Lightning Additional DMG when attacking.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Grants a single ally with Benediction to increase their ATK by 50%, up to 25% of Tingyun's current ATK.\\nWhen the ally with Benediction attacks, they will deal Additional Lightning DMG equal to 40% of that ally's ATK for 1 time.\\nBenediction lasts for 3 turn(s) and is only effective on the most recent receiver of Tingyun's Skill."
            LongDescWithEidolon: "Grants a single ally with Benediction to increase their ATK by 55%, up to 27% of Tingyun's current ATK.\\nWhen the ally with Benediction attacks, they will deal Additional Lightning DMG equal to 44% of that ally's ATK for 1 time.\\nBenediction lasts for 3 turn(s) and is only effective on the most recent receiver of Tingyun's Skill."
          }
          120203: {
            Name: 'Amidst the Rejoicing Clouds'
            Desc: "Regenerates a target ally's Energy and increases their DMG dealt."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Regenerates 50 Energy for a single ally and increases the target's DMG by 50% for 2 turn(s)."
            LongDescWithEidolon: "Regenerates 50 Energy for a single ally and increases the target's DMG by 56% for 2 turn(s)."
          }
          120204: {
            Name: 'Violet Sparknado'
            Desc: 'When an enemy is attacked by Tingyun, the ally with Benediction immediately deals minor Lightning Additional DMG to the same enemy.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When an enemy is attacked by Tingyun, the ally with Benediction immediately deals Additional Lightning DMG equal to 60% of that ally's ATK to the same enemy."
            LongDescWithEidolon: "When an enemy is attacked by Tingyun, the ally with Benediction immediately deals Additional Lightning DMG equal to 66% of that ally's ATK to the same enemy."
          }
          120206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120207: {
            Name: 'Gentle Breeze'
            Desc: 'After using this Technique, this character immediately regenerates Energy for themselves.'
            Type: 'Technique'
            LongDesc: 'Tingyun immediately regenerates 50 Energy upon using her Technique.'
          }
        }
        Eidolons: {
          120201: {
            Name: 'Windfall of Lucky Springs'
            Desc: 'After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.'
          }
          120202: {
            Name: 'Gainfully Gives, Givingly Gains'
            Desc: 'The ally with Benediction regenerates 5 Energy after defeating an enemy. This effect can only be triggered once per turn.'
          }
          120203: {
            Name: 'Halcyon Bequest'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120204: {
            Name: 'Jovial Versatility'
            Desc: 'The DMG multiplier provided by Benediction increases by 20%.'
          }
          120205: {
            Name: 'Sauntering Coquette'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120206: {
            Name: 'Peace Brings Wealth to All'
            Desc: 'Ultimate regenerates 10 more Energy for the target ally.'
          }
        }
        Effects: {
          10012021: {
            Name: 'Benediction'
            Desc: 'ATK +{{parameter0}}.'
            Effect: 'ATK Boost'
            Source: 1202
            ID: 10012021
          }
          10012022: {
            Name: 'Amidst the Rejoicing Clouds'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1202
            ID: 10012022
          }
          10012023: {
            Name: 'Nourished Joviality'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1202
            ID: 10012023
          }
          10012024: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1202
            ID: 10012024
          }
        }
        Traces: {
          A2: {
            Name: 'Nourished Joviality'
            Desc: "Tingyun's SPD increases by 20% for 1 turn after using Skill."
            Owner: 1202
            ID: 1202101
            Ascension: 2
          }
          A4: {
            Name: 'Knell Subdual'
            Desc: 'DMG dealt by Basic ATK increases by 40%.'
            Owner: 1202
            ID: 1202102
            Ascension: 4
          }
          A6: {
            Name: 'Jubilant Passage'
            Desc: 'Tingyun immediately regenerates 5 Energy at the start of her turn.'
            Owner: 1202
            ID: 1202103
            Ascension: 6
          }
        }
      }
      1203: {
        Name: 'Luocha'
        Abilities: {
          120301: {
            Name: 'Thorns of the Abyss'
            Desc: 'Deals minor Imaginary DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120302: {
            Name: 'Prayer of Abyss Flower'
            Desc: "Restores a single ally's HP and gains 1 stack of Abyss Flower."
            Type: 'Skill'
            LongDescWithoutEidolon: "After using his Skill, Luocha immediately restores the target ally's HP equal to 60% of Luocha's ATK plus 800. Meanwhile, Luocha gains 1 stack of Abyss Flower.\\nWhen any ally's HP percentage drops to 50% or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after 2 turn(s)."
            LongDescWithEidolon: "After using his Skill, Luocha immediately restores the target ally's HP equal to 64% of Luocha's ATK plus 890. Meanwhile, Luocha gains 1 stack of Abyss Flower.\\nWhen any ally's HP percentage drops to 50% or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after 2 turn(s)."
          }
          120303: {
            Name: 'Death Wish'
            Desc: 'Removes 1 buff from all enemies, deals Imaginary DMG to all enemies, and gains 1 stack of Abyss Flower.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Removes 1 buff(s) from all enemies and deals all enemies Imaginary DMG equal to 200% of Luocha's ATK. At the same time, Luocha gains 1 stack of Abyss Flower."
            LongDescWithEidolon: "Removes 1 buff(s) from all enemies and deals all enemies Imaginary DMG equal to 216% of Luocha's ATK. At the same time, Luocha gains 1 stack of Abyss Flower."
          }
          120304: {
            Name: 'Cycle of Life'
            Desc: 'Deploys a Zone when Abyss Flower reaches 2 stacks. While the Zone is active, allies will restore HP after they attack.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When Abyss Flower reaches 2 stacks, Luocha consumes all stacks of Abyss Flower to deploy a Zone against the enemy.\\nWhen any enemy in the Zone is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to 18% of Luocha's ATK plus 240.\\nThe Zone's effect lasts for 2 turns. When Luocha is knocked down, the Zone will be dispelled."
            LongDescWithEidolon: "When Abyss Flower reaches 2 stacks, Luocha consumes all stacks of Abyss Flower to deploy a Zone against the enemy.\\nWhen any enemy in the Zone is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to 19.2% of Luocha's ATK plus 267.\\nThe Zone's effect lasts for 2 turns. When Luocha is knocked down, the Zone will be dispelled."
          }
          120306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120307: {
            Name: 'Mercy of a Fool'
            Desc: 'After the Technique is used, immediately trigger the effect of the Talent at the start of the next battle.'
            Type: 'Technique'
            LongDesc: 'After the Technique is used, the Talent will be immediately triggered at the start of the next battle.'
          }
        }
        Eidolons: {
          120301: {
            Name: 'Ablution of the Quick'
            Desc: 'While the Zone is active, ATK of all allies increases by 20%.'
          }
          120302: {
            Name: 'Bestowal From the Pure'
            Desc: "When his Skill is triggered, if the target ally's HP percentage is lower than 50%, Luocha's Outgoing Healing increases by 30%. If the target ally's HP percentage is at 50% or higher, the ally receives a Shield that can absorb DMG equal to 18% of Luocha's ATK plus 240, lasting for 2 turns."
          }
          120303: {
            Name: 'Surveyal by the Fool'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120304: {
            Name: 'Heavy Lies the Crown'
            Desc: "When Luocha's Zone is active, enemies become Weakened and deal 12% less DMG."
          }
          120305: {
            Name: "Cicatrix 'Neath the Pain"
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120306: {
            Name: 'Reunion With the Dust'
            Desc: "When Ultimate is used, there is a 100% fixed chance to reduce all enemies' All-Type RES by 20% for 2 turn(s)."
          }
        }
        Effects: {
          10012031: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 1203
            ID: 10012031
          }
          10012032: {
            Name: 'Abyss Flower'
            Desc: 'When the Abyss Flower is fully stacked, Luocha can consume all the stacks to deploy a Zone against the enemy.'
            Source: 1203
            ID: 10012032
          }
          10012033: {
            Name: 'Cycle of Life'
            Desc: 'After using an attack on an enemy, restores HP to self.'
            Source: 1203
            ID: 10012033
          }
          10012034: {
            Name: 'Prayer of Abyss Flower'
            Desc: 'Skill effect auto-trigger is on cooldown.'
            Source: 1203
            ID: 10012034
          }
          10012035: {
            Name: 'Weaken'
            Desc: 'Deals {{parameter0}}% less DMG.'
            Effect: 'Weaken'
            Source: 1203
            ID: 10012035
          }
          10012036: {
            Name: 'Ablution of the Quick'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1203
            ID: 10012036
          }
          10012037: {
            Name: 'Reunion With the Dust'
            Desc: 'All-Type DMG RES -{{parameter0}}%.'
            Effect: 'All-Type RES Reduction'
            Source: 1203
            ID: 10012037
          }
          10012038: {
            Name: 'Cycle of Life'
            Desc: 'After using an attack on an enemy, restores HP to self.'
            Source: 1203
            ID: 10012038
          }
        }
        Traces: {
          A2: {
            Name: 'Cleansing Revival'
            Desc: "When the Skill's effect is triggered, removes 1 debuff(s) from a target ally."
            Owner: 1203
            ID: 1203101
            Ascension: 2
          }
          A4: {
            Name: 'Sanctified'
            Desc: "When any enemy in the Zone is attacked by an ally, all allies (except the attacker) restore HP equal to 7% of Luocha's ATK plus 93."
            Owner: 1203
            ID: 1203102
            Ascension: 4
          }
          A6: {
            Name: 'Through the Valley'
            Desc: 'The chance to resist Crowd Control debuffs increases by 70%.'
            Owner: 1203
            ID: 1203103
            Ascension: 6
          }
        }
      }
      1204: {
        Name: 'Jing Yuan'
        Abilities: {
          120401: {
            Name: 'Glistening Light'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120402: {
            Name: 'Rifting Zenith'
            Desc: "Deals minor Lightning DMG to all enemies and increases Lightning-Lord's Hits Per Action."
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 100% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 2 for the next turn."
            LongDescWithEidolon: "Deals Lightning DMG equal to 110% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 2 for the next turn."
          }
          120403: {
            Name: 'Lightbringer'
            Desc: "Deals Lightning DMG to all enemies and increases Lightning-Lord's Hits Per Action."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 200% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 3 for the next turn."
            LongDescWithEidolon: "Deals Lightning DMG equal to 216% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 3 for the next turn."
          }
          120404: {
            Name: 'Prana Extirpated'
            Desc: 'Summons Lightning-Lord at the start of the battle. Lightning-Lord automatically deals minor Lightning DMG to a random enemy and enemies adjacent to it.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Summons Lightning-Lord at the start of the battle. Lightning-Lord has 60 base SPD and 3 base Hits Per Action. When the Lightning-Lord takes action, its hits are considered as follow-up attacks, with each hit dealing Lightning DMG equal to 66% of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive Lightning DMG equal to 25% of the DMG dealt to the primary target enemy.\\nThe Lightning-Lord's Hits Per Action can reach a max of 10. Every time Lightning-Lord's Hits Per Action increases by 1, its SPD increases by 10. After the Lightning-Lord's action ends, its SPD and Hits Per Action return to their base values.\\nWhen Jing Yuan is knocked down, the Lightning-Lord will disappear.\\nWhen Jing Yuan is affected by Crowd Control debuff, the Lightning-Lord is unable to take action."
            LongDescWithEidolon: "Summons Lightning-Lord at the start of the battle. Lightning-Lord has 60 base SPD and 3 base Hits Per Action. When the Lightning-Lord takes action, its hits are considered as follow-up attacks, with each hit dealing Lightning DMG equal to 72.6% of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive Lightning DMG equal to 25% of the DMG dealt to the primary target enemy.\\nThe Lightning-Lord's Hits Per Action can reach a max of 10. Every time Lightning-Lord's Hits Per Action increases by 1, its SPD increases by 10. After the Lightning-Lord's action ends, its SPD and Hits Per Action return to their base values.\\nWhen Jing Yuan is knocked down, the Lightning-Lord will disappear.\\nWhen Jing Yuan is affected by Crowd Control debuff, the Lightning-Lord is unable to take action."
          }
          120406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120407: {
            Name: 'Spiritus Invocation'
            Desc: "After using Technique, for the next battle, increases Lightning-Lord's Hits Per Action."
            Type: 'Technique'
            LongDesc: "After the Technique is used, the Lightning-Lord's Hits Per Action in the first turn increases by 3 at the start of the next battle."
          }
        }
        Eidolons: {
          120401: {
            Name: 'Slash, Seas Split'
            Desc: 'When Lightning-Lord attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to 25% of the DMG multiplier against the primary target enemy.'
          }
          120402: {
            Name: 'Swing, Skies Squashed'
            Desc: "After Lightning-Lord takes action, DMG dealt by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20%, lasting for 2 turn(s)."
          }
          120403: {
            Name: 'Strike, Suns Subdued'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120404: {
            Name: 'Spin, Stars Sieged'
            Desc: 'For each hit performed by the Lightning-Lord when it takes action, Jing Yuan regenerates 2 Energy.'
          }
          120405: {
            Name: 'Stride, Spoils Seized'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120406: {
            Name: 'Sweep, Souls Slain'
            Desc: "Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable.\\nWhile Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s)."
          }
        }
        Effects: {
          10012041: {
            Name: 'Prana Extirpated'
            Desc: "Lightning-Lord's Hits Per Action."
            Source: 1204
            ID: 10012041
          }
          10012042: {
            Name: 'Lightbringer'
            Desc: "Lightning-Lord's Enhanced ATK count."
            Source: 1204
            ID: 10012042
          }
          10012043: {
            Name: 'Dharma Corpora'
            Desc: "Jing Yuan's Basic ATK, Skill, and Ultimate deal {{parameter0}}% increased DMG."
            Source: 1204
            ID: 10012043
          }
          10012044: {
            Name: 'CRIT Rate Boost'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1204
            ID: 10012044
          }
        }
        Traces: {
          A2: {
            Name: 'Battalia Crush'
            Desc: "If the Lightning-Lord's Hits Per Action is greater or equal to 6 in the next turn, its CRIT DMG increases by 25% for the next turn."
            Owner: 1204
            ID: 1204101
            Ascension: 2
          }
          A4: {
            Name: 'Savant Providence'
            Desc: 'At the start of the battle, immediately regenerates 15 Energy.'
            Owner: 1204
            ID: 1204102
            Ascension: 4
          }
          A6: {
            Name: 'War Marshal'
            Desc: 'After the Skill is used, the CRIT Rate increases by 10% for 2 turn(s).'
            Owner: 1204
            ID: 1204103
            Ascension: 6
          }
        }
      }
      1205: {
        Name: 'Blade'
        Abilities: {
          120501: {
            Name: 'Shard Sword'
            Desc: 'Deals minor Wind DMG to an enemy.'
            Type: 'Basic ATK'
          }
          120502: {
            Name: 'Hellscape'
            Desc: 'Consumes HP to Enhance Basic ATK, and this turn does not end after this Skill is used.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Consumes HP equal to 30% of Blade's Max HP to enter the Hellscape state.\\nWhen Hellscape is active, his Skill cannot be used, his DMG dealt increases by 40%, and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turn(s).\\nIf Blade's current HP is insufficient, his HP will be reduced to 1 when he uses his Skill.\\nThis Skill does not regenerate Energy. Using this Skill does not end the current turn."
            LongDescWithEidolon: "Consumes HP equal to 30% of Blade's Max HP to enter the Hellscape state.\\nWhen Hellscape is active, his Skill cannot be used, his DMG dealt increases by 45.6%, and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turn(s).\\nIf Blade's current HP is insufficient, his HP will be reduced to 1 when he uses his Skill.\\nThis Skill does not regenerate Energy. Using this Skill does not end the current turn."
          }
          120503: {
            Name: 'Death Sentence'
            Desc: 'Sets current HP to 50% of Max HP, and deals massive Wind DMG to a single enemy and Wind DMG to adjacent targets.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Sets Blade's current HP to 50% of his Max HP and deals Wind DMG to a single enemy equal to the sum of 40% of his ATK, 100% of his Max HP, and 100% of the tally of Blade's HP loss in the current battle. At the same time, deals Wind DMG to adjacent targets equal to the sum of 16% of his ATK, 40% of his Max HP, and 40% of the tally of his HP loss in the current battle.\\nThe tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used."
            LongDescWithEidolon: "Sets Blade's current HP to 50% of his Max HP and deals Wind DMG to a single enemy equal to the sum of 43.2% of his ATK, 108% of his Max HP, and 108% of the tally of Blade's HP loss in the current battle. At the same time, deals Wind DMG to adjacent targets equal to the sum of 17.28% of his ATK, 43.2% of his Max HP, and 43.2% of the tally of his HP loss in the current battle.\\nThe tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used."
          }
          120504: {
            Name: "Shuhu's Gift"
            Desc: "When Blade's HP is lowered, he gains 1 stack of Charge. When maximum Charge stack is reached, Blade immediately deals Wind DMG to all enemies and restores HP. Then, all Charges are consumed."
            Type: 'Talent'
            LongDescWithoutEidolon: "When Blade sustains DMG or consumes his HP, he gains 1 stack of Charge, stacking up to 5 times. A max of 1 Charge stack can be gained every time he is attacked.\\nWhen Charge stack reaches maximum, immediately launches a follow-up attack on all enemies, dealing Wind DMG equal to 44% of Blade's ATK plus 110% of his Max HP. At the same time, restores Blade's HP by 25% of his Max HP. After the follow-up attack, all Charges are consumed."
            LongDescWithEidolon: "When Blade sustains DMG or consumes his HP, he gains 1 stack of Charge, stacking up to 5 times. A max of 1 Charge stack can be gained every time he is attacked.\\nWhen Charge stack reaches maximum, immediately launches a follow-up attack on all enemies, dealing Wind DMG equal to 48.4% of Blade's ATK plus 121% of his Max HP. At the same time, restores Blade's HP by 25% of his Max HP. After the follow-up attack, all Charges are consumed."
          }
          120506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120507: {
            Name: 'Karma Wind'
            Desc: 'Attacks the enemy. After entering combat, consumes own HP and deals Wind DMG to all enemies.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering combat, consumes 20% of Blade's Max HP while dealing Wind DMG equal to 40% of his Max HP to all enemies.\\nIf Blade's current HP is insufficient, his HP will be reduced to 1 when this Technique is used."
          }
        }
        Eidolons: {
          120501: {
            Name: 'Blade Cuts the Deepest in Hell'
            Desc: "Blade's Ultimate deals additionally increased DMG to a single enemy target, with the increased amount equal to 150% of the tally of Blade's HP loss in the current battle.\\nThe tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. The tally value will be reset and re-accumulated after his Ultimate has been used."
          }
          120502: {
            Name: 'Ten Thousand Sorrows From One Broken Dream'
            Desc: 'When Blade is in the Hellscape state, his CRIT Rate increases by 15%.'
          }
          120503: {
            Name: 'Hardened Blade Bleeds Coldest Shade'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120504: {
            Name: 'Rejected by Death, Infected With Life'
            Desc: "When Blade's current HP percentage drops to 50% or lower of his Max HP, increases his Max HP by 20%. Stacks up to 2 time(s)."
          }
          120505: {
            Name: "Death By Ten Lords' Gaze"
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120506: {
            Name: 'Reborn Into an Empty Husk'
            Desc: "The maximum number of Charge stacks is reduced to 4. The follow-up attack triggered by Talent deals additionally increased DMG, equal to 50% of Blade's Max HP."
          }
        }
        Effects: {
          10012051: {
            Name: 'Hellscape'
            Desc: 'Basic ATK "Shard Sword" is enhanced, becoming "Forest of Swords" and dealing Blast DMG.'
            Effect: 'Enhanced Basic ATK'
            Source: 1205
            ID: 10012051
          }
          10012052: {
            Name: 'Charge'
            Desc: 'At full Charge stacks, expend all stacks and immediately deal a follow-up attack to all enemies.'
            Source: 1205
            ID: 10012052
          }
          10012053: {
            Name: 'DMG Boost'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1205
            ID: 10012053
          }
          10012054: {
            Name: 'Vita Infinita'
            Desc: 'Incoming Healing +{{parameter0}}%.'
            Effect: 'Outgoing Healing Boost'
            Source: 1205
            ID: 10012054
          }
          10012055: {
            Name: 'Heal All Bones'
            Desc: 'Max HP +{{parameter0}}%.'
            Effect: 'Max HP Boost'
            Source: 1205
            ID: 10012055
          }
          10012056: {
            Name: 'Grievous Penitence'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1205
            ID: 10012056
          }
          10012057: {
            Name: 'Furious Resurrection'
            Desc: 'Temporarily unable to return to the battlefield.'
            Effect: 'Furious Resurrection'
            Source: 1205
            ID: 10012057
          }
          10012058: {
            Name: 'Death Sentence'
            Desc: 'HP Lost: {{parameter0}}'
            Source: 1205
            ID: 10012058
          }
        }
        Traces: {
          A2: {
            Name: 'Vita Infinita'
            Desc: "When Blade's current HP percentage is at 50% of Max HP or lower, Incoming Healing increases by 20%."
            Owner: 1205
            ID: 1205101
            Ascension: 2
          }
          A4: {
            Name: 'Neverending Deaths'
            Desc: 'If Blade hits a Weakness Broken enemy after using Forest of Swords, he will restore HP equal to 5% of his Max HP plus 100.'
            Owner: 1205
            ID: 1205102
            Ascension: 4
          }
          A6: {
            Name: 'Cyclone of Destruction'
            Desc: 'Follow-up attack DMG dealt by Talent increases by 20%.'
            Owner: 1205
            ID: 1205103
            Ascension: 6
          }
        }
      }
      1206: {
        Name: 'Sushang'
        Abilities: {
          120601: {
            Name: 'Cloudfencer Art: Starshine'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120602: {
            Name: 'Cloudfencer Art: Mountainfall'
            Desc: 'Deals Physical DMG to a single enemy with a small chance of triggering Sword Stance. If the enemy has Weakness Break, Sword Stance is guaranteed to trigger.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 210% of Sushang's ATK to a single enemy. In addition, there is a 33% chance to trigger Sword Stance on the final hit, dealing Additional Physical DMG equal to 100% of Sushang's ATK to the enemy.\\nIf the enemy is inflicted with Weakness Break, Sword Stance is guaranteed to trigger."
            LongDescWithEidolon: "Deals Physical DMG equal to 231% of Sushang's ATK to a single enemy. In addition, there is a 33% chance to trigger Sword Stance on the final hit, dealing Additional Physical DMG equal to 110% of Sushang's ATK to the enemy.\\nIf the enemy is inflicted with Weakness Break, Sword Stance is guaranteed to trigger."
          }
          120603: {
            Name: 'Shape of Taixu: Dawn Herald'
            Desc: "Deals massive Physical DMG to a single enemy, enhances Sword Stance's effect, and takes action immediately."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 320% of Sushang's ATK to a single enemy target, and she immediately takes action. In addition, Sushang's ATK increases by 30% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s).\\nSword Stance triggered from the extra chances deals 50% of the original DMG."
            LongDescWithEidolon: "Deals Physical DMG equal to 345.6% of Sushang's ATK to a single enemy target, and she immediately takes action. In addition, Sushang's ATK increases by 32.4% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s).\\nSword Stance triggered from the extra chances deals 50% of the original DMG."
          }
          120604: {
            Name: 'Dancing Blade'
            Desc: "When an enemy on the field has its Weakness Broken, this character's SPD increases."
            Type: 'Talent'
            LongDescWithoutEidolon: "When an enemy has their Weakness Broken on the field, Sushang's SPD increases by 20% for 2 turn(s)."
            LongDescWithEidolon: "When an enemy has their Weakness Broken on the field, Sushang's SPD increases by 21% for 2 turn(s)."
          }
          120606: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120607: {
            Name: 'Cloudfencer Art: Warcry'
            Desc: 'Attacks the enemy. After entering battle, deals minor Physical DMG to all enemies.'
            Type: 'Technique'
            LongDesc: 'Immediately attacks the enemy. Upon entering battle, Sushang deals Physical DMG equal to 80% of her ATK to all enemies.'
          }
        }
        Eidolons: {
          120601: {
            Name: 'Cut With Ease'
            Desc: 'After using Skill against a Weakness Broken enemy, regenerates 1 Skill Point.'
          }
          120602: {
            Name: 'Refine in Toil'
            Desc: 'After Sword Stance is triggered, the DMG taken by Sushang is reduced by 20% for 1 turn.'
          }
          120603: {
            Name: 'Rise From Fame'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120604: {
            Name: 'Cleave With Heart'
            Desc: "Sushang's Break Effect increases by 40%."
          }
          120605: {
            Name: 'Prevail via Taixu'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120606: {
            Name: 'Dwell Like Water'
            Desc: "Talent's SPD Boost is stackable and can stack up to 2 times. Additionally, after entering battle, Sushang immediately gains 1 stack of her Talent's SPD Boost."
          }
        }
        Effects: {
          10012061: {
            Name: 'Dawn Herald'
            Desc: 'Increases ATK by {{parameter0}}% and receives 2 extra chances to trigger Sword Stance when using Skill.'
            Effect: 'ATK Boost'
            Source: 1206
            ID: 10012061
          }
          10012062: {
            Name: 'Dancing Blade'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1206
            ID: 10012062
          }
          10012063: {
            Name: 'Refine in Toil'
            Desc: 'DMG taken -{{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 1206
            ID: 10012063
          }
          10012064: {
            Name: 'Riposte'
            Desc: 'Increases Sword Stance DMG by {{parameter0}}% for each stack, up to {{parameter1}} stack(s).'
            Source: 1206
            ID: 10012064
          }
          10012065: {
            Name: 'Dancing Blade'
            Desc: 'Each stack increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1206
            ID: 10012065
          }
          10012066: {
            Name: 'Guileless'
            Desc: 'Lowers the chances of being attacked by enemies.'
            Effect: 'Target Probability Reduction'
            Source: 1206
            ID: 10012066
          }
        }
        Traces: {
          A2: {
            Name: 'Guileless'
            Desc: 'When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.'
            Owner: 1206
            ID: 1206101
            Ascension: 2
          }
          A4: {
            Name: 'Riposte'
            Desc: 'For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 time(s).'
            Owner: 1206
            ID: 1206102
            Ascension: 4
          }
          A6: {
            Name: 'Vanquisher'
            Desc: "After using Basic ATK or Skill, if there are enemies on the field with Weakness Break, Sushang's action is Advanced Forward by 15%."
            Owner: 1206
            ID: 1206103
            Ascension: 6
          }
        }
      }
      1207: {
        Name: 'Yukong'
        Abilities: {
          120701: {
            Name: 'Arrowslinger'
            Desc: 'Deals minor Imaginary DMG to an enemy.'
            Type: 'Basic ATK'
          }
          120702: {
            Name: 'Emboldening Salvo'
            Desc: "Obtains 2 stacks of Roaring Bowstrings. All allies' ATK increases when Roaring Bowstrings is active on this character."
            Type: 'Skill'
            LongDescWithoutEidolon: "Obtains 2 stack(s) of \"Roaring Bowstrings\" (to a maximum of 2 stacks). When \"Roaring Bowstrings\" is active, the ATK of all allies increases by 80%, and every time an ally's turn (including Yukong's) ends, Yukong loses 1 stack of \"Roaring Bowstrings.\"\\nWhen it's the turn where Yukong gains \"Roaring Bowstrings\" by using Skill, \"Roaring Bowstrings\" will not be removed."
            LongDescWithEidolon: "Obtains 2 stack(s) of \"Roaring Bowstrings\" (to a maximum of 2 stacks). When \"Roaring Bowstrings\" is active, the ATK of all allies increases by 88%, and every time an ally's turn (including Yukong's) ends, Yukong loses 1 stack of \"Roaring Bowstrings.\"\\nWhen it's the turn where Yukong gains \"Roaring Bowstrings\" by using Skill, \"Roaring Bowstrings\" will not be removed."
          }
          120703: {
            Name: 'Diving Kestrel'
            Desc: 'When Roaring Bowstrings is active on this character, increases the CRIT Rate and CRIT DMG of all allies and deals massive Imaginary DMG to a single enemy.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "If \"Roaring Bowstrings\" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by 28% and CRIT DMG by 65%. At the same time, deals Imaginary DMG equal to 380% of Yukong's ATK to a single enemy."
            LongDescWithEidolon: "If \"Roaring Bowstrings\" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by 29.4% and CRIT DMG by 70.2%. At the same time, deals Imaginary DMG equal to 410.4% of Yukong's ATK to a single enemy."
          }
          120704: {
            Name: 'Seven Layers, One Arrow'
            Desc: 'Basic Attack additionally deals minor DMG, and the Toughness Reduction of this Basic Attack is increased. This effect can be triggered again after 1 turn has passed.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Basic ATK additionally deals Imaginary DMG equal to 80% of Yukong's ATK, and increases the Toughness Reduction of this attack by 100%. This effect can be triggered again after 1 turn(s)."
            LongDescWithEidolon: "Basic ATK additionally deals Imaginary DMG equal to 88% of Yukong's ATK, and increases the Toughness Reduction of this attack by 100%. This effect can be triggered again after 1 turn(s)."
          }
          120706: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120707: {
            Name: 'Windchaser'
            Desc: "This unit's movement speed increases. After attacking an enemy and entering battle, gains 2 stacks of Roaring Bowstrings."
            Type: 'Technique'
            LongDesc: 'After using her Technique, Yukong enters Sprint mode for 20 seconds. In Sprint mode, her movement speed increases by 35%, and Yukong gains 2 stack(s) of "Roaring Bowstrings" when she enters battle by attacking enemies.'
          }
        }
        Eidolons: {
          120701: {
            Name: 'Aerial Marshal'
            Desc: 'At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).'
          }
          120702: {
            Name: 'Skyward Command'
            Desc: "When any ally's current energy is equal to its energy limit, Yukong regenerates an additional 5 energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong uses her Ultimate."
          }
          120703: {
            Name: 'Torrential Fusillade'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120704: {
            Name: 'Zephyrean Echoes'
            Desc: 'When "Roaring Bowstrings" is active, Yukong deals 30% more DMG to enemies.'
          }
          120705: {
            Name: 'August Deadshot'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120706: {
            Name: 'Bowstring Thunderclap'
            Desc: 'When Yukong uses her Ultimate, she immediately gains 1 stack(s) of "Roaring Bowstrings."'
          }
        }
        Effects: {
          10012071: {
            Name: 'Roaring Bowstrings'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1207
            ID: 10012071
          }
          10012072: {
            Name: 'Roaring Bowstrings'
            Desc: 'Increases ATK by {{parameter0}}%, CRIT Rate by {{parameter1}}%, and CRIT DMG by {{parameter2}}%.'
            Effect: 'ATK, CRIT Rate, and CRIT DMG Boost'
            Source: 1207
            ID: 10012072
          }
          10012073: {
            Name: 'Seven Layers, One Arrow'
            Desc: "Basic ATK deals additional Imaginary DMG equal to {{parameter0}}% of Yukong's ATK, and increases Toughness Reduction by {{parameter1}}%."
            Source: 1207
            ID: 10012073
          }
          10012074: {
            Name: 'Debuff Block'
            Desc: 'Blocks 1 debuff.'
            Source: 1207
            ID: 10012074
          }
          10012075: {
            Name: 'Aerial Marshal'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1207
            ID: 10012075
          }
          10012076: {
            Name: 'Zephyrean Echoes'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1207
            ID: 10012076
          }
        }
        Traces: {
          A2: {
            Name: 'Archerion'
            Desc: 'Yukong can resist 1 debuff application for 1 time. This effect can be triggered again after 2 turn(s).'
            Owner: 1207
            ID: 1207101
            Ascension: 2
          }
          A4: {
            Name: 'Bowmaster'
            Desc: 'When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%.'
            Owner: 1207
            ID: 1207102
            Ascension: 4
          }
          A6: {
            Name: 'Majestas'
            Desc: 'When "Roaring Bowstrings" is active, Yukong regenerates 2 additional Energy every time an ally takes action.'
            Owner: 1207
            ID: 1207103
            Ascension: 6
          }
        }
      }
      1208: {
        Name: 'Fu Xuan'
        Abilities: {
          120801: {
            Name: 'Novaburst'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120802: {
            Name: 'Known by Stars, Shown by Hearts'
            Desc: "Activates Matrix of Prescience. DMG received by Fu Xuan's allies is Distributed to her. Also increases CRIT Rate and Max HP of all allies."
            Type: 'Skill'
            LongDescWithoutEidolon: "Activates Matrix of Prescience, via which other team members will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s).\\nWhile affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by 6% of Fu Xuan's Max HP, and increases CRIT Rate by 12%.\\nWhen Fu Xuan is knocked down, the Matrix of Prescience will be dispelled."
            LongDescWithEidolon: "Activates Matrix of Prescience, via which other team members will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s).\\nWhile affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by 6.6% of Fu Xuan's Max HP, and increases CRIT Rate by 13.2%.\\nWhen Fu Xuan is knocked down, the Matrix of Prescience will be dispelled."
          }
          120803: {
            Name: 'Woes of Many Morphed to One'
            Desc: "Deals Quantum DMG to all enemies and increases Fu Xuan's Talent trigger count."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Quantum DMG equal to 100% of Fu Xuan's Max HP to all enemies and obtains 1 trigger count for the HP Restore effect granted by Fu Xuan's Talent."
            LongDescWithEidolon: "Deals Quantum DMG equal to 108% of Fu Xuan's Max HP to all enemies and obtains 1 trigger count for the HP Restore effect granted by Fu Xuan's Talent."
          }
          120804: {
            Name: 'Bleak Breeds Bliss'
            Desc: 'While Fu Xuan is still active in battle, the DMG taken by all team members is reduced.\\nWhen her HP is low, automatically restores her own HP based on the HP percentage already lost. This effect can have up to 2 trigger counts at any given time.'
            Type: 'Talent'
            LongDescWithoutEidolon: "While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take 18% less DMG.\\nWhen Fu Xuan's current HP percentage falls to 50% of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by 90% of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect has 1 trigger count by default and can hold up to a maximum of 2 trigger counts."
            LongDescWithEidolon: "While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take 19.6% less DMG.\\nWhen Fu Xuan's current HP percentage falls to 50% of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by 92% of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect has 1 trigger count by default and can hold up to a maximum of 2 trigger counts."
          }
          120806: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120807: {
            Name: 'Of Fortune Comes Fate'
            Desc: 'Activates a Barrier. Allies will not enter battle when attacked by enemies. Entering battle will automatically activate Matrix of Prescience.'
            Type: 'Technique'
            LongDesc: 'After the Technique is used, all team members receive a Barrier, lasting for 20 seconds. This Barrier can block all enemy attacks, and the team will not enter battle when attacked. Entering battle while the Barrier is active will have Fu Xuan automatically activate Matrix of Prescience at the start of the battle, lasting for 2 turn(s).'
          }
        }
        Eidolons: {
          120801: {
            Name: 'Dominus Pacis'
            Desc: 'The Knowledge effect increases CRIT DMG by 30%.'
          }
          120802: {
            Name: 'Optimus Felix'
            Desc: 'If any team member is struck by a killing blow while Matrix of Prescience is active, then all allies who were struck by a killing blow during this action will not be knocked down, and 70% of their Max HP is immediately restored. This effect can trigger 1 time per battle.'
          }
          120803: {
            Name: 'Apex Nexus'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120804: {
            Name: 'Fortuna Stellaris'
            Desc: 'When other allies under Matrix of Prescience are attacked, Fu Xuan regenerates 5 Energy.'
          }
          120805: {
            Name: 'Arbiter Primus'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120806: {
            Name: 'Omnia Vita'
            Desc: "Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. The DMG dealt by Fu Xuan's Ultimate will increase by 200% of this tally of HP loss.\\nThis tally is also capped at 120% of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used."
          }
        }
        Effects: {
          10012081: {
            Name: 'Knowledge'
            Desc: 'Max HP +{{parameter0}}, CRIT Rate +{{parameter1}}%.'
            Effect: 'Increases Max HP and CRIT Rate'
            Source: 1208
            ID: 10012081
          }
          10012082: {
            Name: 'Matrix of Prescience'
            Desc: 'Distribute to Fu Xuan {{parameter0}}% of the DMG this unit receives (before this DMG is mitigated by any Shields).'
            Source: 1208
            ID: 10012082
          }
          10012083: {
            Name: 'Misfortune Avoidance'
            Desc: 'Reduces DMG taken by {{parameter0}}%.'
            Source: 1208
            ID: 10012083
          }
          10012084: {
            Name: 'Matrix of Prescience'
            Desc: 'Receive DMG distributed by other allies.'
            Source: 1208
            ID: 10012084
          }
          10012085: {
            Name: 'Optimus Felix'
            Desc: 'When struck with a killing blow, instead of becoming downed, the character immediately restores HP equal to {{parameter0}}% of Max HP.'
            Effect: 'Optimus Felix'
            Source: 1208
            ID: 10012085
          }
          10012086: {
            Name: 'Total HP lost'
            Desc: 'Allies have lost {{parameter0}} HP in total.'
            Source: 1208
            ID: 10012086
          }
          10012087: {
            Name: 'Knowledge'
            Desc: 'Increases Max HP by {{parameter0}}, CRIT Rate by {{parameter1}}%, and CRIT DMG by {{parameter2}}%.'
            Effect: 'Increases Max HP, CRIT Rate, and CRIT DMG'
            Source: 1208
            ID: 10012087
          }
          10012088: {
            Name: 'Liuren, the Sexagenary'
            Desc: 'This status can be consumed to resist Crowd Control debuffs.'
            Effect: 'Resist Crowd Control debuffs'
            Source: 1208
            ID: 10012088
          }
        }
        Traces: {
          A2: {
            Name: 'Taiyi, the Macrocosmic'
            Desc: 'When Matrix of Prescience is active, Fu Xuan will regenerate 20 extra Energy when she uses her Skill.'
            Owner: 1208
            ID: 1208101
            Ascension: 2
          }
          A4: {
            Name: 'Dunjia, the Metamystic'
            Desc: "When Fu Xuan's Ultimate is used, heals all other allies by an amount equal to 5% of Fu Xuan's Max HP plus 133."
            Owner: 1208
            ID: 1208102
            Ascension: 4
          }
          A6: {
            Name: 'Liuren, the Sexagenary'
            Desc: 'If a target enemy applies Crowd Control debuffs to allies while the Matrix of Prescience is active, all allies will resist all Crowd Control debuffs applied by the enemy target during the current action. This effect can only be triggered once. When Matrix of Prescience is activated again, the number of times this effect can be triggered will reset.'
            Owner: 1208
            ID: 1208103
            Ascension: 6
          }
        }
      }
      1209: {
        Name: 'Yanqing'
        Abilities: {
          120901: {
            Name: 'Frost Thorn'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          120902: {
            Name: 'Darting Ironthorn'
            Desc: 'Deals Ice DMG to a single enemy and activates the Soulsteel Sync.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 220% of Yanqing's ATK to a single enemy and activates Soulsteel Sync for 1 turn."
            LongDescWithEidolon: "Deals Ice DMG equal to 242% of Yanqing's ATK to a single enemy and activates Soulsteel Sync for 1 turn."
          }
          120903: {
            Name: 'Amidst the Raining Bliss'
            Desc: "Increases Yanqing's CRIT Rate. Enhances \"Soulsteel Sync\" and deals massive Ice DMG to a single enemy."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra 50%. This buff lasts for one turn. Afterwards, deals Ice DMG equal to 350% of Yanqing's ATK to a single enemy."
            LongDescWithEidolon: "Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra 54%. This buff lasts for one turn. Afterwards, deals Ice DMG equal to 378% of Yanqing's ATK to a single enemy."
          }
          120904: {
            Name: 'One With the Sword'
            Desc: 'During Soulsteel Sync, reduces the chance of this character being attacked and increases their CRIT Rate and CRIT DMG. After attacking an enemy, there is a chance of launching a follow-up attack, dealing Ice DMG with a chance to Freeze the target.\\nSoulsteel Sync will be removed after this character receives damage.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by 20% and his CRIT DMG increases by 30%. After Yanqing attacks an enemy, there is a 60% fixed chance to perform a follow-up attack, dealing Ice DMG equal to 50% of Yanqing's ATK to the enemy, which has a 65% base chance to Freeze the enemy for 1 turn.\\nThe Frozen target cannot take action and receives Additional Ice DMG equal to 50% of Yanqing's ATK at the beginning of each turn.\\nWhen Yanqing receives DMG, the Soulsteel Sync effect will disappear."
            LongDescWithEidolon: "When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by 21% and his CRIT DMG increases by 33%. After Yanqing attacks an enemy, there is a 62% fixed chance to perform a follow-up attack, dealing Ice DMG equal to 55% of Yanqing's ATK to the enemy, which has a 65% base chance to Freeze the enemy for 1 turn.\\nThe Frozen target cannot take action and receives Additional Ice DMG equal to 55% of Yanqing's ATK at the beginning of each turn.\\nWhen Yanqing receives DMG, the Soulsteel Sync effect will disappear."
          }
          120906: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          120907: {
            Name: 'The One True Sword'
            Desc: 'After this character uses Technique, at the start of the next battle, increases the DMG dealt by this character to enemy targets whose HP percentage is 50% or higher.'
            Type: 'Technique'
            LongDesc: 'After using his Technique, at the start of the next battle, Yanqing deals 30% more DMG for 2 turn(s) to enemies whose current HP percentage is 50% or higher.'
          }
        }
        Eidolons: {
          120901: {
            Name: 'Svelte Saber'
            Desc: 'When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to 60% of his ATK.'
          }
          120902: {
            Name: 'Supine Serenade'
            Desc: 'When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%.'
          }
          120903: {
            Name: 'Sword Savant'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          120904: {
            Name: 'Searing Sting'
            Desc: 'When the current HP percentage is 80% or higher, Ice RES PEN increases by 12%.'
          }
          120905: {
            Name: 'Surging Strife'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          120906: {
            Name: 'Swift Swoop'
            Desc: 'If the buffs from Soulsteel Sync or the Ultimate are in effect when an enemy is defeated, the duration of these buffs is extended by 1 turn.'
          }
        }
        Effects: {
          10012091: {
            Name: 'Soulsteel Sync'
            Desc: 'Increases CRIT Rate by {{parameter0}}% and CRIT DMG by {{parameter1}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1209
            ID: 10012091
          }
          10012092: {
            Name: 'Amidst the Raining Bliss'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1209
            ID: 10012092
          }
          10012093: {
            Name: 'Searing Sting'
            Desc: 'Ice RES PEN +{{parameter0}}%.'
            Effect: 'Ice RES PEN'
            Source: 1209
            ID: 10012093
          }
          10012094: {
            Name: 'The One True Sword'
            Desc: 'Increases DMG dealt to enemies whose current HP percentage is higher than or equal to {{parameter0}}% by {{parameter1}}%.'
            Effect: 'DMG Boost'
            Source: 1209
            ID: 10012094
          }
          10012095: {
            Name: 'SPD Boost'
            Desc: 'SPD +{{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1209
            ID: 10012095
          }
        }
        Traces: {
          A2: {
            Name: 'Icing on the Kick'
            Desc: "When Yanqing attacks, deals Additional Ice DMG equal to 30% of Yanqing's ATK to enemies with Ice Weakness."
            Owner: 1209
            ID: 1209101
            Ascension: 2
          }
          A4: {
            Name: 'Frost Favors the Brave'
            Desc: 'When Soulsteel Sync is active, Effect RES increases by 20%.'
            Owner: 1209
            ID: 1209102
            Ascension: 4
          }
          A6: {
            Name: 'Gentle Blade'
            Desc: 'When a CRIT Hit is triggered, increases SPD by 10% for 2 turn(s).'
            Owner: 1209
            ID: 1209103
            Ascension: 6
          }
        }
      }
      1210: {
        Name: 'Guinaifen'
        Abilities: {
          121001: {
            Name: 'Standing Ovation'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121002: {
            Name: 'Blazing Welcome'
            Desc: 'Deals Fire DMG to a single enemy and minor Fire DMG to adjacent enemies, with a high chance of Burning them.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 120% of Guinaifen's ATK to a single enemy and Fire DMG equal to 40% of Guinaifen's ATK to any adjacent enemies, with a 100% base chance to Burn the target and adjacent targets. When Burned, enemies will take a Fire DoT equal to 218.208% of Guinaifen's ATK at the beginning of each turn, lasting for 2 turn(s)."
            LongDescWithEidolon: "Deals Fire DMG equal to 132% of Guinaifen's ATK to a single enemy and Fire DMG equal to 44% of Guinaifen's ATK to any adjacent enemies, with a 100% base chance to Burn the target and adjacent targets. When Burned, enemies will take a Fire DoT equal to 240.0324% of Guinaifen's ATK at the beginning of each turn, lasting for 2 turn(s)."
          }
          121003: {
            Name: 'Watch This Showstopper'
            Desc: 'Deals Fire DMG to all enemies. If the enemies are inflicted with Burn, the Burn status deals DMG 1 extra time.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 120% of Guinaifen's ATK to all enemies. If the target enemy is currently inflicted with Burn, then their Burn status immediately produces DMG equal to 92% of their original DMG."
            LongDescWithEidolon: "Deals Fire DMG equal to 129.6% of Guinaifen's ATK to all enemies. If the target enemy is currently inflicted with Burn, then their Burn status immediately produces DMG equal to 96% of their original DMG."
          }
          121004: {
            Name: 'PatrAeon Benefits'
            Desc: 'After the Burn status causes DMG on the enemy, there is a high chance of applying Firekiss to the enemy.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'When Guinaifen is on the field, there is a 100% base chance to apply Firekiss to an enemy after their Burn status causes DMG. While inflicted with Firekiss, the enemy receives 7% increased DMG, which lasts for 3 turn(s) and can stack up to 3 time(s).'
            LongDescWithEidolon: 'When Guinaifen is on the field, there is a 100% base chance to apply Firekiss to an enemy after their Burn status causes DMG. While inflicted with Firekiss, the enemy receives 7.6% increased DMG, which lasts for 3 turn(s) and can stack up to 3 time(s).'
          }
          121006: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121007: {
            Name: 'Skill Showcase'
            Desc: 'Attacks the enemy. After entering battle, deals minor Fire DMG to a single target while applying Firekiss, with a total of 4 Bounces.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering battle, deals DMG for 4 time(s), dealing Fire DMG equal to 50% of Guinaifen's ATK to a random single enemy target each time, with a 100% base chance of inflicting Firekiss on them."
          }
        }
        Eidolons: {
          121001: {
            Name: 'Slurping Noodles During Handstand'
            Desc: "When Skill is used, there is a 100% base chance to reduce the attacked target enemy's Effect RES by 10% for 2 turn(s)."
          }
          121002: {
            Name: 'Brushing Teeth While Whistling'
            Desc: 'When an enemy target is being Burned, the DMG multiplier of the Burn status applied by her Basic ATK or Skill increases by 40%.'
          }
          121003: {
            Name: 'Smashing Boulder on Chest'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121004: {
            Name: 'Blocking Pike with Neck'
            Desc: 'Every time the Burn status inflicted by Guinaifen causes DMG, Guinaifen regenerates 2 Energy.'
          }
          121005: {
            Name: 'Swallowing Sword to Stomach'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121006: {
            Name: 'Catching Bullet with Hands'
            Desc: 'Increases the stackable Firekiss count by 1.'
          }
        }
        Effects: {
          10012103: {
            Name: 'Firekiss'
            Desc: 'Received DMG increases by {{parameter0}}%.'
            Effect: 'Firekiss'
            Source: 1210
            ID: 10012103
          }
          10012105: {
            Name: 'Slurping Noodles During Handstand'
            Desc: 'Effect RES reduces by {{parameter0}}%.'
            Effect: 'Effect RES Reduction'
            Source: 1210
            ID: 10012105
          }
        }
        Traces: {
          A2: {
            Name: 'High Poles'
            Desc: 'Basic ATK has a 80% base chance of inflicting an enemy with a Burn, equivalent to that of Skill.'
            Owner: 1210
            ID: 1210101
            Ascension: 2
          }
          A4: {
            Name: 'Bladed Hoop'
            Desc: "When the battle begins, Guinaifen's action is advanced forward by 25%."
            Owner: 1210
            ID: 1210102
            Ascension: 4
          }
          A6: {
            Name: 'Walking on Knives'
            Desc: 'Deals 20% more DMG to Burned enemies.'
            Owner: 1210
            ID: 1210103
            Ascension: 6
          }
        }
      }
      1211: {
        Name: 'Bailu'
        Abilities: {
          121101: {
            Name: 'Diagnostic Kick'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121102: {
            Name: 'Singing Among Clouds'
            Desc: 'Restores HP for a single ally, then heals random allies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Heals a single ally for 11.7% of Bailu's Max HP plus 312. Bailu then heals random allies 2 time(s). After each healing, HP restored from the next healing is reduced by 15%."
            LongDescWithEidolon: "Heals a single ally for 12.48% of Bailu's Max HP plus 347.1. Bailu then heals random allies 2 time(s). After each healing, HP restored from the next healing is reduced by 15%."
          }
          121103: {
            Name: 'Felicitous Thunderleap'
            Desc: 'Restores HP for all allies, and grants them Invigoration, or prolongs the duration of their Invigoration.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Heals all allies for 13.5% of Bailu's Max HP plus 360.\\nBailu applies Invigoration to allies that are not already Invigorated. For those already Invigorated, Bailu extends the duration of their Invigoration by 1 turn.\\nThe effect of Invigoration can last for 2 turn(s). This effect cannot stack."
            LongDescWithEidolon: "Heals all allies for 14.4% of Bailu's Max HP plus 400.5.\\nBailu applies Invigoration to allies that are not already Invigorated. For those already Invigorated, Bailu extends the duration of their Invigoration by 1 turn.\\nThe effect of Invigoration can last for 2 turn(s). This effect cannot stack."
          }
          121104: {
            Name: 'Gourdful of Elixir'
            Desc: 'When an ally with Invigoration is attacked, restores HP for the ally.\\nWhen an ally suffers a killing blow, Bailu immediately restores their HP. This effect can only trigger 1 time per battle.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After an ally with Invigoration is hit, restores the ally's HP for 5.4% of Bailu's Max HP plus 144. This effect can trigger 2 time(s).\\nWhen an ally receives a killing blow, they will not be knocked down. Bailu immediately heals the ally for 18% of Bailu's Max HP plus 480 HP. This effect can be triggered 1 time per battle."
            LongDescWithEidolon: "After an ally with Invigoration is hit, restores the ally's HP for 5.76% of Bailu's Max HP plus 160.2. This effect can trigger 2 time(s).\\nWhen an ally receives a killing blow, they will not be knocked down. Bailu immediately heals the ally for 19.2% of Bailu's Max HP plus 534 HP. This effect can be triggered 1 time per battle."
          }
          121106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121107: {
            Name: 'Saunter in the Rain'
            Desc: 'After this character uses Technique, at the start of the next battle, all allies are granted Invigoration.'
            Type: 'Technique'
            LongDesc: 'After Technique is used, at the start of the next battle, all allies are granted Invigoration for 2 turn(s).'
          }
        }
        Eidolons: {
          121101: {
            Name: 'Ambrosial Aqua'
            Desc: "If the target ally's current HP is equal to their Max HP when Invigoration ends, regenerates 8 extra Energy for this target."
          }
          121102: {
            Name: 'Sylphic Slumber'
            Desc: "After using her Ultimate, Bailu's Outgoing Healing increases by an additional 15% for 2 turn(s)."
          }
          121103: {
            Name: 'Omniscient Opulence'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121104: {
            Name: 'Evil Excision'
            Desc: 'Every healing provided by the Skill makes the recipient deal 10% more DMG for 2 turn(s). This effect can stack up to 3 time(s).'
          }
          121105: {
            Name: 'Waning Worries'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121106: {
            Name: 'Drooling Drop of Draconic Divinity'
            Desc: 'Bailu can heal allies who received a killing blow 1 more time(s) in a single battle.'
          }
        }
        Effects: {
          10012111: {
            Name: 'Invigoration'
            Desc: 'Restores HP when attacked.'
            Effect: 'Invigoration'
            Source: 1211
            ID: 10012111
          }
          10012112: {
            Name: 'Qihuang Analects'
            Desc: 'Max HP +{{parameter0}}%.'
            Effect: 'Max HP Boost'
            Source: 1211
            ID: 10012112
          }
          10012113: {
            Name: 'Aquatic Benediction'
            Desc: 'Reduces DMG taken by {{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 1211
            ID: 10012113
          }
          10012114: {
            Name: 'Sylphic Slumber'
            Desc: 'Increases Outgoing Healing by {{parameter0}}%.'
            Effect: 'Outgoing Healing Boost'
            Source: 1211
            ID: 10012114
          }
          10012115: {
            Name: 'Evil Excision'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1211
            ID: 10012115
          }
        }
        Traces: {
          A2: {
            Name: 'Qihuang Analects'
            Desc: "When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by 10% for 2 turns."
            Owner: 1211
            ID: 1211101
            Ascension: 2
          }
          A4: {
            Name: 'Vidyadhara Ichor Lines'
            Desc: 'Invigoration can trigger 1 more time(s).'
            Owner: 1211
            ID: 1211102
            Ascension: 4
          }
          A6: {
            Name: 'Aquatic Benediction'
            Desc: 'Characters with Invigoration receive 10% less DMG.'
            Owner: 1211
            ID: 1211103
            Ascension: 6
          }
        }
      }
      1212: {
        Name: 'Jingliu'
        Abilities: {
          121201: {
            Name: 'Lucent Moonglow'
            Desc: 'Deals minor Ice DMG to a single enemy target.'
            Type: 'Basic ATK'
          }
          121202: {
            Name: 'Transcendent Flash'
            Desc: 'Deals Ice DMG to a target enemy and obtains 1 stack of Syzygy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 200% of Jingliu's ATK to a single enemy and obtains 1 stack(s) of Syzygy."
            LongDescWithEidolon: "Deals Ice DMG equal to 220% of Jingliu's ATK to a single enemy and obtains 1 stack(s) of Syzygy."
          }
          121203: {
            Name: 'Florephemeral Dreamflux'
            Desc: 'Deals massive Ice DMG to a target enemy and deals Ice DMG to adjacent targets. Obtains 1 stack of Syzygy.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Ice DMG equal to 300% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 150% of Jingliu's ATK to any adjacent enemies. Gains 1 stack(s) of Syzygy after attack ends."
            LongDescWithEidolon: "Deals Ice DMG equal to 324% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 162% of Jingliu's ATK to any adjacent enemies. Gains 1 stack(s) of Syzygy after attack ends."
          }
          121204: {
            Name: 'Crescent Transmigration'
            Desc: "When possessing NaN stacks of Syzygy, Jingliu enters the Spectral Transmigration state with her Action Advanced by 100%, her CRIT Rate increased, and her Skill becoming Enhanced. Using an attack in this state consumes HP from all other allies and increases Jingliu's ATK according to the total HP consumed. When Syzygy stacks become 0, exits the Spectral Transmigration state."
            Type: 'Talent'
            LongDescWithoutEidolon: "When Jingliu has 2 stack(s) of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by 100% and her CRIT Rate increases by 50%. Then, Jingliu's Skill \"Transcendent Flash\" is enhanced to \"Moon On Glacial River,\" and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies equal to 4% of their respective Max HP (this cannot reduce allies' HP to lower than 1). Jingliu's ATK increases by 540% of the total HP consumed from all allies in this attack, capped at 180% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state."
            LongDescWithEidolon: "When Jingliu has 2 stack(s) of Syzygy, she enters the Spectral Transmigration state with her Action Advanced by 100% and her CRIT Rate increases by 52%. Then, Jingliu's Skill \"Transcendent Flash\" is enhanced to \"Moon On Glacial River,\" and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from all other allies equal to 4% of their respective Max HP (this cannot reduce allies' HP to lower than 1). Jingliu's ATK increases by 540% of the total HP consumed from all allies in this attack, capped at 198% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state."
          }
          121206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121207: {
            Name: 'Shine of Truth'
            Desc: 'Creates a Special Dimension around the character. Enemies within this dimension will become Frozen. After entering combat with enemies in the dimension, this character regenerates Energy and obtains 1 stack of Syzygy with a high chance to Freeze enemies.'
            Type: 'Technique'
            LongDesc: "After using this Technique, creates a Special Dimension around Jingliu that lasts for 20 seconds, and all enemies in this Special Dimension will become Frozen. After entering combat with enemies in the Special Dimension, Jingliu immediately regenerates 15 Energy and obtains 1 stack(s) of Syzygy, with a 100% base chance of Freezing enemy targets for 1 turn(s). While Frozen, enemy targets cannot take action, and receive Ice Additional DMG equal to 80% of Jingliu's ATK at the start of every turn. Only 1 dimension created by allies can exist at the same time."
          }
        }
        Eidolons: {
          121201: {
            Name: 'Moon Crashes Tianguan Gate'
            Desc: "When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK."
          }
          121202: {
            Name: 'Crescent Shadows Qixing Dipper'
            Desc: 'After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.'
          }
          121203: {
            Name: 'Halfmoon Gapes Mercurial Haze'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121204: {
            Name: 'Lunarlance Shines Skyward Dome'
            Desc: "During the Spectral Transmigration state, the ATK gained from consuming allies' HP is additionally increased by 90% of the total HP consumed from the entire team. The cap for ATK gained this way also increases by 30%."
          }
          121205: {
            Name: 'Night Shades Astral Radiance'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121206: {
            Name: 'Eclipse Hollows Corporeal Husk'
            Desc: 'When Jingliu enters the Spectral Transmigration state, the Syzygy stack limit increases by 1, and Jingliu obtains 1 stack(s) of Syzygy. While she is in the Spectral Transmigration state, her CRIT DMG increases by 50%.'
          }
        }
        Effects: {
          10012121: {
            Name: 'Spectral Transmigration'
            Desc: 'Increases ATK by {{parameter0}}.'
            Effect: 'ATK Boost'
            Source: 1212
            ID: 10012121
          }
          10012122: {
            Name: 'Sword Champion'
            Desc: 'Increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1212
            ID: 10012122
          }
          10012123: {
            Name: 'Frost Wraith'
            Desc: 'Ultimate deals {{parameter0}}% more DMG.'
            Effect: 'DMG Boost'
            Source: 1212
            ID: 10012123
          }
          10012124: {
            Name: 'Deathrealm'
            Desc: 'Increases Effect RES by {{parameter0}}%.'
            Effect: 'Effect RES Boost'
            Source: 1212
            ID: 10012124
          }
          10012125: {
            Name: 'Eclipse Hollows Corporeal Husk'
            Desc: 'CRIT DMG +{{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1212
            ID: 10012125
          }
          10012126: {
            Name: 'Moon Crashes Tianguan Gate'
            Desc: 'CRIT DMG +{{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1212
            ID: 10012126
          }
          10012127: {
            Name: 'Spectral Transmigration'
            Desc: 'CRIT Rate +{{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1212
            ID: 10012127
          }
          10012128: {
            Name: 'Crescent Shadows Qixing Dipper'
            Desc: 'Increases DMG dealt by the next Enhanced Skill by {{parameter0}}%.'
            Source: 1212
            ID: 10012128
          }
        }
        Traces: {
          A2: {
            Name: 'Deathrealm'
            Desc: 'While in the Spectral Transmigration state, increases Effect RES by 35%.'
            Owner: 1212
            ID: 1212101
            Ascension: 2
          }
          A4: {
            Name: 'Sword Champion'
            Desc: 'After using Transcendent Flash, the next action will be Advanced Forward by 10%.'
            Owner: 1212
            ID: 1212102
            Ascension: 4
          }
          A6: {
            Name: 'Frost Wraith'
            Desc: 'While in the Spectral Transmigration state, increases DMG dealt by Ultimate by 20%.'
            Owner: 1212
            ID: 1212103
            Ascension: 6
          }
        }
      }
      1213: {
        Name: 'Dan Heng • Imbibitor Lunae'
        Abilities: {
          121301: {
            Name: 'Beneficent Lotus'
            Desc: 'Deals minor Imaginary DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121302: {
            Name: 'Dracore Libre'
            Desc: 'Enhances the Basic ATK Beneficent Lotus to Transcendence, Divine Spear, or Fulgurant Leap.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Enhances Basic ATK. Enhancements may be applied up to 3 times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.\\nEnhanced once, Beneficent Lotus becomes Transcendence.\\nEnhanced twice, Beneficent Lotus becomes Divine Spear.\\nEnhanced thrice, Beneficent Lotus becomes Fulgurant Leap.\\nWhen using Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by 12%, for a max of 4 stacks. These stacks last until the end of his turn."
            LongDescWithEidolon: "Enhances Basic ATK. Enhancements may be applied up to 3 times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.\\nEnhanced once, Beneficent Lotus becomes Transcendence.\\nEnhanced twice, Beneficent Lotus becomes Divine Spear.\\nEnhanced thrice, Beneficent Lotus becomes Fulgurant Leap.\\nWhen using Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by 13.2%, for a max of 4 stacks. These stacks last until the end of his turn."
          }
          121303: {
            Name: "Azure's Aqua Ablutes All"
            Desc: "Deals massive Imaginary DMG to a single enemy, deals Imaginary DMG to adjacent targets, and gains 2 Squama Sacrosancta, which can offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Uses a 3-hit attack and deals Imaginary DMG equal to 300% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals Imaginary DMG equal to 140% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains 2 Squama Sacrosancta.\\nIt's possible to hold up to 3 Squama Sacrosancta, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points."
            LongDescWithEidolon: "Uses a 3-hit attack and deals Imaginary DMG equal to 324% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals Imaginary DMG equal to 151.2% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains 2 Squama Sacrosancta.\\nIt's possible to hold up to 3 Squama Sacrosancta, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points."
          }
          121304: {
            Name: 'Righteous Heart'
            Desc: "Increases DMG for every hit dealt. This effect is stackable and lasts until the end of this character's turn."
            Type: 'Talent'
            LongDescWithoutEidolon: 'After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by 10%. This effect can stack up to 6 time(s), lasting until the end of his turn.'
            LongDescWithEidolon: 'After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by 11%. This effect can stack up to 6 time(s), lasting until the end of his turn.'
          }
          121306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121307: {
            Name: 'Heaven-Quelling Prismadrakon'
            Desc: 'Enters the Leaping Dragon state. Attacking will cause this character to move forward rapidly for a set distance and attack all enemies touched. After entering combat via attacking enemies, deals Imaginary DMG to all enemies, and gains 1 Squama Sacrosancta.'
            Type: 'Technique'
            LongDesc: 'After using his Technique, Dan Heng • Imbibitor Lunae enters the Leaping Dragon state for 20 seconds. While in the Leaping Dragon state, using his attack enables him to move forward rapidly for a set distance, attacking all enemies he touches and blocking all incoming attacks. After entering combat via attacking enemies in the Leaping Dragon state, Dan Heng • Imbibitor Lunae deals Imaginary DMG equal to 120% of his ATK to all enemies, and gains 1 Squama Sacrosancta.'
          }
        }
        Eidolons: {
          121301: {
            Name: 'Tethered to Sky'
            Desc: 'Increases the stackable Righteous Heart count by 4, and gains 1 extra stack of Righteous Heart for each hit during an attack.'
          }
          121302: {
            Name: 'Imperium On Cloud Nine'
            Desc: "After using his Ultimate, Dan Heng • Imbibitor Lunae's action is Advanced Forward by 100% and gains 1 extra Squama Sacrosancta."
          }
          121303: {
            Name: 'Clothed in Clouds'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121304: {
            Name: "Zephyr's Bliss"
            Desc: "The buff effect granted by Outroar lasts until the end of this character's next turn."
          }
          121305: {
            Name: 'Fall is the Pride'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121306: {
            Name: 'Reign, Returned'
            Desc: "After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next Fulgurant Leap attack increases by 20%. This effect can stack up to 3 time(s)."
          }
        }
        Effects: {
          10012131: {
            Name: 'Outroar'
            Desc: 'Each stack increases CRIT DMG dealt by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Source: 1213
            ID: 10012131
          }
          10012132: {
            Name: 'Squama Sacrosancta'
            Desc: "Can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. A maximum of {{parameter0}} Squama Sacrosancta can be possessed at any given time. Consuming Squama Sacrosancta is considered equivalent to consuming Skill Points."
            Source: 1213
            ID: 10012132
          }
          10012133: {
            Name: 'Righteous Heart'
            Desc: 'Each stack increases DMG dealt by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Source: 1213
            ID: 10012133
          }
          10012134: {
            Name: 'Reign, Returned'
            Desc: "Increase Imaginary RES PEN by {{parameter0}}% for this character's next Fulgurant Leap attack."
            Effect: 'Imaginary RES PEN'
            Source: 1213
            ID: 10012134
          }
          10012135: {
            Name: 'Reign, Returned'
            Desc: 'The "Reign, Returned" effect cannot be triggered yet.'
            Source: 1213
            ID: 10012135
          }
        }
        Traces: {
          A2: {
            Name: 'Star Veil'
            Desc: 'At the start of the battle, immediately regenerates 15 Energy.'
            Owner: 1213
            ID: 1213101
            Ascension: 2
          }
          A4: {
            Name: 'Aqua Reign'
            Desc: 'Increases the chance to resist Crowd Control debuffs by 35%.'
            Owner: 1213
            ID: 1213102
            Ascension: 4
          }
          A6: {
            Name: 'Jolt Anew'
            Desc: 'When dealing DMG to enemy targets with Imaginary Weakness, CRIT DMG increases by 24%.'
            Owner: 1213
            ID: 1213103
            Ascension: 6
          }
        }
      }
      1214: {
        Name: 'Xueyi'
        Abilities: {
          121401: {
            Name: 'Mara-Sunder Awl'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121402: {
            Name: 'Iniquity Obliteration'
            Desc: 'Deals Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Quantum DMG equal to 140% of Xueyi's ATK to a single enemy, and Quantum DMG equal to 70% of Xueyi's ATK to any adjacent enemies."
            LongDescWithEidolon: "Deals Quantum DMG equal to 154% of Xueyi's ATK to a single enemy, and Quantum DMG equal to 77% of Xueyi's ATK to any adjacent enemies."
          }
          121403: {
            Name: 'Divine Castigation'
            Desc: "Deals massive Quantum DMG to a single enemy. This attack ignores Weakness Types and reduces the target's Toughness. The more Toughness is reduced, the higher the DMG will be dealt."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Quantum DMG equal to 250% of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the Quantum Weakness Break effect is triggered.\\nIn this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of 60% increase."
            LongDescWithEidolon: "Deals Quantum DMG equal to 270% of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the Quantum Weakness Break effect is triggered.\\nIn this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of 64.8% increase."
          }
          121404: {
            Name: 'Karmic Perpetuation'
            Desc: 'When Xueyi or her allies reduce enemy Toughness with attacks, she gains stacks of Karma. When Karma reaches the max number of stacks, immediately launches a follow-up attack, dealing minor Quantum DMG to a single enemy target, bouncing for 3 times and consuming all Karma.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When Xueyi reduces enemy Toughness with attacks, Karma will be stacked. The more Toughness is reduced, the more stacks of Karma are added, up to 8 stacks.\\nWhen Xueyi's allies reduce enemy Toughness with attacks, Xueyi gains 1 stack(s) of Karma.\\nWhen Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to 90% of Xueyi's ATK to a single random enemy. This follow-up attack will not add Karma stacks."
            LongDescWithEidolon: "When Xueyi reduces enemy Toughness with attacks, Karma will be stacked. The more Toughness is reduced, the more stacks of Karma are added, up to 8 stacks.\\nWhen Xueyi's allies reduce enemy Toughness with attacks, Xueyi gains 1 stack(s) of Karma.\\nWhen Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to 99% of Xueyi's ATK to a single random enemy. This follow-up attack will not add Karma stacks."
          }
          121406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121407: {
            Name: 'Summary Execution'
            Desc: 'Attacks the enemy. After entering battle, deals minor Quantum DMG to all enemies.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. After entering combat, deals 80% of Xueyi's ATK as Quantum DMG to all enemies."
          }
        }
        Eidolons: {
          121401: {
            Name: 'Dvesha, Inhibited'
            Desc: "Increases the DMG dealt by the Talent's follow-up attack by 40%."
          }
          121402: {
            Name: 'Klesha, Breached'
            Desc: "Talent's follow-up attack reduces enemy Toughness regardless of Weakness types. At the same time, restores Xueyi's HP by an amount equal to 5% of her Max HP. When breaking Weakness, triggers the Quantum Break Effect."
          }
          121403: {
            Name: 'Duḥkha, Ceased'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121404: {
            Name: 'Karma, Severed'
            Desc: 'When using Ultimate, increases Break Effect by 40% for 2 turn(s).'
          }
          121405: {
            Name: 'Deva, Enthralled'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121406: {
            Name: 'Saṃsāra, Mastered'
            Desc: 'The max stack limit for Karma decreases to 6.'
          }
        }
        Effects: {
          10012141: {
            Name: 'Perspicacious Mainframe'
            Desc: '{{parameter0}} overflowing Karma stacks.'
            Source: 1214
            ID: 10012141
          }
          10012142: {
            Name: 'Karma'
            Desc: 'When Karma is fully stacked, consume all Karma stacks and immediately use 1 follow-up attack against enemies.'
            Source: 1214
            ID: 10012142
          }
          10012143: {
            Name: 'Break Effect Boost'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 1214
            ID: 10012143
          }
        }
        Traces: {
          A2: {
            Name: 'Clairvoyant Loom'
            Desc: 'Increases DMG dealt by this unit by an amount equal to 100% of Break Effect, up to a maximum DMG increase of 240%.'
            Owner: 1214
            ID: 1214101
            Ascension: 2
          }
          A4: {
            Name: 'Intrepid Rollerbearings'
            Desc: "If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate."
            Owner: 1214
            ID: 1214102
            Ascension: 4
          }
          A6: {
            Name: 'Perspicacious Mainframe'
            Desc: "Xueyi will keep a tally of the number of Karma stacks that exceed the max stack limit, up to 6 stacks in the tally. After Xueyi's Talent is triggered, she will gain a corresponding number of tallied Karma stacks."
            Owner: 1214
            ID: 1214103
            Ascension: 6
          }
        }
      }
      1215: {
        Name: 'Hanya'
        Abilities: {
          121501: {
            Name: 'Oracle Brush'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121502: {
            Name: 'Samsara, Locked'
            Desc: 'Deals Physical DMG to a single enemy and applies Burden to them. For every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies recover 1 Skill Point.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 240% of Hanya's ATK to a single target enemy, then applies Burden to them.\\nFor every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies will immediately recover 1 Skill Point. Burden is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered 2 times."
            LongDescWithEidolon: "Deals Physical DMG equal to 264% of Hanya's ATK to a single target enemy, then applies Burden to them.\\nFor every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies will immediately recover 1 Skill Point. Burden is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered 2 times."
          }
          121503: {
            Name: "Ten-Lords' Decree, All Shall Obey"
            Desc: "Increases an ally's SPD and ATK."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Increases the SPD of a target ally by 20% of Hanya's SPD and increases the same target ally's ATK by 60%, lasting for 2 turn(s)."
            LongDescWithEidolon: "Increases the SPD of a target ally by 21% of Hanya's SPD and increases the same target ally's ATK by 64.8%, lasting for 2 turn(s)."
          }
          121504: {
            Name: 'Sanction'
            Desc: 'Ally deals more DMG when attacking enemies inflicted with Burden.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by 30%, lasting for 2 turn(s).'
            LongDescWithEidolon: 'When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by 33%, lasting for 2 turn(s).'
          }
          121506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121507: {
            Name: 'Netherworld Judgment'
            Desc: 'Attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.'
            Type: 'Technique'
            LongDesc: 'Immediately attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.'
          }
        }
        Eidolons: {
          121501: {
            Name: 'One Heart'
            Desc: "When an ally with Hanya's Ultimate's effect defeats an enemy, Hanya's action is Advanced Forward by 15%. This effect can only be triggered 1 time(s) per turn."
          }
          121502: {
            Name: 'Two Views'
            Desc: "After using the Skill, this character's SPD increases by 20% for 1 turn(s)."
          }
          121503: {
            Name: 'Three Temptations'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121504: {
            Name: 'Four Truths'
            Desc: "The Ultimate's duration is additionally extended for 1 turn(s)."
          }
          121505: {
            Name: 'Five Skandhas'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121506: {
            Name: 'Six Reverences'
            Desc: 'Increase the DMG Boost effect of the Talent by an additional 10%.'
          }
        }
        Effects: {
          10012151: {
            Name: 'Edict'
            Desc: 'Increases ATK by {{parameter0}}% and SPD by {{parameter1}} points.'
            Effect: 'ATK & SPD Boost'
            Source: 1215
            ID: 10012151
          }
          10012152: {
            Name: 'Burden'
            Desc: 'For every 2 Basic Attacks, Skills, or Ultimates allies use on an enemy with Burden, recover 1 Skill Point.'
            Effect: 'Burden'
            Source: 1215
            ID: 10012152
          }
          10012153: {
            Name: 'Six Reverences'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1215
            ID: 10012153
          }
          10012154: {
            Name: 'Scrivener'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1215
            ID: 10012154
          }
          10012155: {
            Name: 'Two Views'
            Desc: 'Increases SPD by {{parameter0}}%.'
            Effect: 'Two Views'
            Source: 1215
            ID: 10012155
          }
          10012156: {
            Name: 'Sanction'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1215
            ID: 10012156
          }
        }
        Traces: {
          A2: {
            Name: 'Scrivener'
            Desc: "Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn(s)."
            Owner: 1215
            ID: 1215101
            Ascension: 2
          }
          A4: {
            Name: 'Netherworld'
            Desc: "If the trigger count for the Burden's Skill Point recovery effect is 1 or lower when an enemy with Burden is defeated, then additionally recovers 1 Skill Point(s)."
            Owner: 1215
            ID: 1215102
            Ascension: 4
          }
          A6: {
            Name: 'Reanimated'
            Desc: "When Burden's Skill Point recovery effect is triggered, this character regenerates 2 Energy."
            Owner: 1215
            ID: 1215103
            Ascension: 6
          }
        }
      }
      1217: {
        Name: 'Huohuo'
        Abilities: {
          121701: {
            Name: 'Banner: Stormcaller'
            Desc: 'Deals minor Wind DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121702: {
            Name: 'Talisman: Protection'
            Desc: 'Dispels 1 debuff from an ally and restore HP to that ally and their adjacent allies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Dispels 1 debuff(s) from a single target ally and immediately restores this ally's HP by an amount equal to 21% of Huohuo's Max HP plus 560. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to 16.8% of Huohuo's Max HP plus 448."
            LongDescWithEidolon: "Dispels 1 debuff(s) from a single target ally and immediately restores this ally's HP by an amount equal to 22.4% of Huohuo's Max HP plus 623. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to 17.92% of Huohuo's Max HP plus 498.4."
          }
          121703: {
            Name: 'Tail: Spiritual Domination'
            Desc: 'Regenerates Energy for all allies (excluding this character) and increases their ATK.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: 'Regenerates Energy for all allies (excluding this character) by an amount equal to 20% of their respective Max Energy. At the same time, increases their ATK by 40% for 2 turn(s).'
            LongDescWithEidolon: 'Regenerates Energy for all allies (excluding this character) by an amount equal to 21% of their respective Max Energy. At the same time, increases their ATK by 43.2% for 2 turn(s).'
          }
          121704: {
            Name: 'Possession: Ethereal Metaflow'
            Desc: "Huohuo gains Divine Provision after using her Skill. If Huohuo possesses Divine Provision when an ally's turn starts or when an ally uses Ultimate, restores the ally's HP. At the same time, every ally with low HP receives healing once. When Divine Provision is triggered to heal an ally, dispel 1 debuff from that ally."
            Type: 'Talent'
            LongDescWithoutEidolon: "After using her Skill, Huohuo gains Divine Provision, lasting for 2 turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. If Huohuo has Divine Provision when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to 4.5% of Huohuo's Max HP plus 120. At the same time, every ally with 50% HP percentage or lower receives healing once.\\nWhen Divine Provision is triggered to heal an ally, dispel 1 debuff(s) from that ally. This effect can be triggered up to 6 time(s). Using the skill again resets the effect's trigger count."
            LongDescWithEidolon: "After using her Skill, Huohuo gains Divine Provision, lasting for 2 turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. If Huohuo has Divine Provision when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to 4.8% of Huohuo's Max HP plus 133.5. At the same time, every ally with 50% HP percentage or lower receives healing once.\\nWhen Divine Provision is triggered to heal an ally, dispel 1 debuff(s) from that ally. This effect can be triggered up to 6 time(s). Using the skill again resets the effect's trigger count."
          }
          121706: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121707: {
            Name: 'Fiend: Impeachment of Evil'
            Desc: 'Causes surrounding enemies to become Horror-Struck. After entering battle with enemies afflicted with Horror-Struck, there is a high chance of reducing the ATK of the enemy targets.'
            Type: 'Technique'
            LongDesc: "Huohuo terrorizes surrounding enemies, afflicting Horror-Struck on them. Enemies in Horror-Struck will flee away from Huohuo for 10 second(s). When entering battle with enemies in Horror-Struck, there is a 100% base chance of reducing every single enemy's ATK by 25% for 2 turn(s)."
          }
        }
        Eidolons: {
          121701: {
            Name: 'Anchored to Vessel, Specters Nestled'
            Desc: "The duration of Divine Provision produced by the Talent is extended by 1 turn(s). When Huohuo possesses Divine Provision, all allies' SPD increases by 12%."
          }
          121702: {
            Name: 'Sealed in Tail, Wraith Subdued'
            Desc: 'If Huohuo possesses Divine Provision when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to 50% of their Max HP. This reduces the duration of Divine Provision by 1 turn. This effect can only be triggered 2 time(s) per battle.'
          }
          121703: {
            Name: 'Cursed by Fate, Moths to Flame'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121704: {
            Name: 'Tied in Life, Bound to Strife'
            Desc: 'When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is 80%.'
          }
          121705: {
            Name: 'Mandated by Edict, Evils Evicted'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121706: {
            Name: 'Woven Together, Cohere Forever'
            Desc: "When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turn(s)."
          }
        }
        Effects: {
          10012172: {
            Name: 'Divine Provision'
            Desc: "When an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to {{parameter0}}% of Huohuo's Max HP plus {{parameter1}}. At the same time, every ally currently at {{parameter2}}% HP percentage or lower receives healing once. When Divine Provision is triggered to provide healing for allies, dispel 1 debuff from the said ally. This effect's remaining trigger count is {{parameter3}}."
            Effect: 'Healing Over Time'
            Source: 1217
            ID: 10012172
          }
          10012173: {
            Name: 'ATK Boost'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1217
            ID: 10012173
          }
          10012174: {
            Name: 'Energy Regeneration Rate Boost'
            Desc: 'Increases Energy Regeneration Rate by {{parameter0}}%.'
            Effect: 'Energy Regeneration Rate Boost'
            Source: 1217
            ID: 10012174
          }
          10012175: {
            Name: 'DMG Boost'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1217
            ID: 10012175
          }
          10012176: {
            Name: 'SPD Boost'
            Desc: 'Increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1217
            ID: 10012176
          }
          10012177: {
            Name: 'Horror-Struck'
            Desc: 'Reduces ATK by {{parameter0}}%.'
            Effect: 'Horror-Struck'
            Source: 1217
            ID: 10012177
          }
          10012178: {
            Name: 'Sealed in Tail, Wraith Subdued'
            Desc: 'If Huohuo possesses Divine Provision when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to {{parameter0}}% of their Max HP. This reduces the duration of Divine Provision by 1 turn. The remaining trigger count is {{parameter1}}.'
            Source: 1217
            ID: 10012178
          }
        }
        Traces: {
          A2: {
            Name: 'Fearful to Act'
            Desc: 'When battle starts, Huohuo gains Divine Provision, lasting for 1 turn(s).'
            Owner: 1217
            ID: 1217101
            Ascension: 2
          }
          A4: {
            Name: 'The Cursed One'
            Desc: 'The chance to resist Crowd Control Debuffs increases by 35%.'
            Owner: 1217
            ID: 1217102
            Ascension: 4
          }
          A6: {
            Name: 'Stress Reaction to Horror'
            Desc: 'When her Talent is triggered to heal allies, Huohuo regenerates 1 Energy.'
            Owner: 1217
            ID: 1217103
            Ascension: 6
          }
        }
      }
      1218: {
        Name: 'Jiaoqiu'
        Abilities: {
          121801: {
            Name: 'Heart Afire'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          121802: {
            Name: 'Scorch Onslaught'
            Desc: 'Deals Fire DMG to a single enemy and minor Fire DMG to adjacent targets, with a high chance to inflict 1 stack of Ashen Roast on the primary target.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 150% of Jiaoqiu's ATK to a single target enemy and Fire DMG equal to 90% of Jiaoqiu's ATK to adjacent targets, with a 100% base chance to inflict 1 stack of Ashen Roast on the primary target."
            LongDescWithEidolon: "Deals Fire DMG equal to 165% of Jiaoqiu's ATK to a single target enemy and Fire DMG equal to 99% of Jiaoqiu's ATK to adjacent targets, with a 100% base chance to inflict 1 stack of Ashen Roast on the primary target."
          }
          121803: {
            Name: 'Pyrograph Arcanum'
            Desc: 'Sets the number of "Ashen Roast" stacks on enemy targets to the highest number of "Ashen Roast" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG to all enemies. While inside the Zone, enemy targets receive increased Ultimate DMG, with a chance of being inflicted with 1 stack of Ashen Roast when taking action.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies.\\nWhile inside the Zone, enemy targets receive 15% increased Ultimate DMG, with a 60% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.\\nThe Zone lasts for 3 turn(s), and its duration decreases by 1 at the start of this unit's every turn. If Jiaoqiu gets knocked down, the Zone will also be dispelled."
            LongDescWithEidolon: "Sets the number of \"Ashen Roast\" stacks on enemy targets to the highest number of \"Ashen Roast\" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to 108% of Jiaoqiu's ATK to all enemies.\\nWhile inside the Zone, enemy targets receive 16.2% increased Ultimate DMG, with a 62% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.\\nThe Zone lasts for 3 turn(s), and its duration decreases by 1 at the start of this unit's every turn. If Jiaoqiu gets knocked down, the Zone will also be dispelled."
          }
          121804: {
            Name: 'Quartet Finesse, Octave Finery'
            Desc: 'After attacking, there is a high chance to inflict 1 stack of Ashen Roast on the target, causing the enemy to take increased DMG and also be considered as Burned at the same time.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by 15%. Then, each subsequent stack increases this by 5%.\\nAshen Roast is capped at 5 stack(s) and lasts for 2 turn(s).\\nWhen an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to 180% of Jiaoqiu's ATK at the start of each turn."
            LongDescWithEidolon: "When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by 16.5%. Then, each subsequent stack increases this by 5.5%.\\nAshen Roast is capped at 5 stack(s) and lasts for 2 turn(s).\\nWhen an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to 198% of Jiaoqiu's ATK at the start of each turn."
          }
          121806: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          121807: {
            Name: 'Fiery Queller'
            Desc: 'Creates a Special Dimension. After entering combat with enemies in this dimension, deals minor Fire DMG to all enemies, with a high chance of applying 1 "Ashen Roast" stack.'
            Type: 'Technique'
            LongDesc: "After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering combat with enemies in this Special Dimension, deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies, with a 100% base chance of applying 1 \"Ashen Roast\" stack. Only 1 dimension created by allies can exist at the same time."
          }
        }
        Eidolons: {
          121801: {
            Name: 'Pentapathic Transference'
            Desc: "Allies deal 40% increased DMG to enemy targets afflicted with Ashen Roast. Whenever inflicting Ashen Roast on an enemy target via triggering the Talent's effect, additionally increases the number of \"Ashen Roast\" stacks applied this time by 1."
          }
          121802: {
            Name: 'From Savor Comes Suffer'
            Desc: 'When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300%.'
          }
          121803: {
            Name: 'Flavored Euphony Reigns Supreme'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          121804: {
            Name: 'Leisure In, Luster Out'
            Desc: "When the Zone exists, reduces enemy target's ATK by 15%."
          }
          121805: {
            Name: 'Duel in Dawn, Dash in Dusk'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          121806: {
            Name: 'Nonamorphic Pyrobind'
            Desc: "When an enemy target gets defeated, their accumulated \"Ashen Roast\" stacks will transfer to the enemy with the lowest number of \"Ashen Roast\" stacks on the battlefield. The maximum stack limit of Ashen Roast increases to 9, and each \"Ashen Roast\" stack reduces the target's All-Type RES by 3%."
          }
        }
        Effects: {
          10012181: {
            Name: 'Pyrograph Arcanum'
            Desc: 'Enemy targets in the Zone take {{parameter0}}% increased Ultimate DMG, with a {{parameter1}}% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to {{parameter2}} time(s). And it can only trigger once per enemy turn. This effect can still trigger for {{parameter3}} more time(s).'
            Effect: 'Vulnerability'
            Source: 1218
            ID: 10012181
          }
          10012182: {
            Name: 'Leisure In, Luster Out'
            Desc: 'ATK decreases by {{parameter0}}%.'
            Effect: 'ATK Reduction'
            Source: 1218
            ID: 10012182
          }
          10012183: {
            Name: 'Pyrograph Arcanum'
            Source: 1218
            ID: 10012183
          }
          10012184: {
            Name: 'Ashen Roast'
            Desc: "Increases DMG received by {{parameter0}}%. At the start of the turn, takes Additional Fire DMG equal to {{parameter1}}% of Jiaoqiu's ATK."
            Effect: 'Ashen Roast'
            Source: 1218
            ID: 10012184
          }
          10012185: {
            Name: 'Pyre Cleanse'
            Desc: "Reduces Effect Hit Rate by {{parameter0}}%. When taking action, receives Additional Fire DMG equal to {{parameter1}}% of Jiaoqiu's ATK."
            Effect: 'Effect Hit Rate Reduction'
            Source: 1218
            ID: 10012185
          }
          10012186: {
            Name: 'Hearth Kindle'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1218
            ID: 10012186
          }
          10012187: {
            Name: 'Nonamorphic Pyrobind'
            Desc: 'Decreases All-Type RES by {{parameter0}}%.'
            Source: 1218
            ID: 10012187
          }
          10012188: {
            Name: 'Pentapathic Transference'
            Desc: 'When an ally attacks an enemy target afflicted with Ashen Roast, increases the DMG dealt by {{parameter0}}%.'
            Source: 1218
            ID: 10012188
          }
          10012189: {
            Name: 'Ashen Roast'
            Desc: 'Increases DMG received by {{parameter0}}%. This unit can be considered as Burned. While Ashen Roast is active, takes Fire DMG at the start of each turn.'
            Effect: 'Ashen Roast'
            Source: 1218
            ID: 10012189
          }
        }
        Traces: {
          A2: {
            Name: 'Pyre Cleanse'
            Desc: 'When battle starts, immediately regenerates 15 Energy.'
            Owner: 1218
            ID: 1218101
            Ascension: 2
          }
          A4: {
            Name: 'Hearth Kindle'
            Desc: "For every 15% of Jiaoqiu's Effect Hit Rate that exceeds 80%, additionally increases ATK by 60%, up to 240%."
            Owner: 1218
            ID: 1218102
            Ascension: 4
          }
          A6: {
            Name: 'Seared Scent'
            Desc: 'While the Zone exists, enemies entering combat will be inflicted with Ashen Roast. The number of stacks applied will match the highest number of "Ashen Roast" stacks possessed by any unit while the Zone is active, with a minimum of 1 stack(s).'
            Owner: 1218
            ID: 1218103
            Ascension: 6
          }
        }
      }
      1220: {
        Name: 'Feixiao'
        Abilities: {
          122001: {
            Name: 'Boltsunder'
            Desc: 'Deals minor Wind DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          122002: {
            Name: 'Waraxe'
            Desc: "Deals Wind DMG to an enemy, and additionally launches Talent's follow-up attack 1 time."
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 200% of Feixiao's ATK to a target enemy. Then, immediately launches 1 instance of Talent's follow-up attack against the target."
            LongDescWithEidolon: "Deals Wind DMG equal to 220% of Feixiao's ATK to a target enemy. Then, immediately launches 1 instance of Talent's follow-up attack against the target."
          }
          122003: {
            Name: 'Terrasplit'
            Desc: "During the Ultimate, can ignore Weakness Type to reduce enemy Toughness. When the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases.\\nLaunches \"Boltsunder Blitz\" or \"Waraxe Skyward\" on a single enemy NaN time(s). Deals Wind DMG at the end."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Wind DMG to a single target enemy, up to 700% of Feixiao's ATK. During this time, can ignore Weakness Type to reduce the target's Toughness. When the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases by 100%.\\nDuring the attack, Feixiao first launches \"Boltsunder Blitz\" or \"Waraxe Skyward\" on the target, for a total of 6 time(s).\\nAt the end, deals Wind DMG equal to 160% of Feixiao's ATK to the target."
            LongDescWithEidolon: "Deals Wind DMG to a single target enemy, up to 759.6% of Feixiao's ATK. During this time, can ignore Weakness Type to reduce the target's Toughness. When the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases by 100%.\\nDuring the attack, Feixiao first launches \"Boltsunder Blitz\" or \"Waraxe Skyward\" on the target, for a total of 6 time(s).\\nAt the end, deals Wind DMG equal to 172.8% of Feixiao's ATK to the target."
          }
          122004: {
            Name: 'Thunderhunt'
            Desc: 'Can activate Ultimate when "Flying Aureus" reaches NaN points, accumulating up to NaN points. For every NaN attacks by ally targets, Feixiao gains "Flying Aureus".\\nAfter teammates attack, Feixiao launches follow-up attack against the primary target, dealing Wind DMG. This effect can only trigger once per turn. When using this attack, increases DMG dealt by this unit.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Can activate Ultimate when \"Flying Aureus\" reaches 6 points, accumulating up to 12 points. Feixiao gains 1 point of \"Flying Aureus\" for every 2 attacks by ally targets. Feixiao's Ultimate attacks do not count towards this number.\\nAfter Feixiao's teammates attack an enemy target, Feixiao immediately launches follow-up attack against the primary target, dealing Wind DMG equal to 110% of Feixiao's ATK. If there is no primary target available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by 60%, lasting for 2 turn(s)."
            LongDescWithEidolon: "Can activate Ultimate when \"Flying Aureus\" reaches 6 points, accumulating up to 12 points. Feixiao gains 1 point of \"Flying Aureus\" for every 2 attacks by ally targets. Feixiao's Ultimate attacks do not count towards this number.\\nAfter Feixiao's teammates attack an enemy target, Feixiao immediately launches follow-up attack against the primary target, dealing Wind DMG equal to 121% of Feixiao's ATK. If there is no primary target available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by 66%, lasting for 2 turn(s)."
          }
          122006: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          122007: {
            Name: 'Stormborn'
            Desc: 'Enters the "Onrush" state. Continuously pulls in enemies and movement speed increases. Gains "Flying Aureus" after entering battle.\\nWhile in "Onrush," can actively attack all pulled enemies. At the start of every wave, deals Wind DMG to all enemies. This DMG is guaranteed to CRIT. The more enemies are pulled in, the higher the DMG multiplier becomes.'
            Type: 'Technique'
            LongDesc: "After using Technique, enters the \"Onrush\" state, lasting for 20 seconds. While in \"Onrush,\" pulls in enemies within a certain range, and increases this unit's movement speed by 50%. After entering battle, gains 1 point(s) of \"Flying Aureus.\"\\nWhile in \"Onrush,\" actively attacking will start battle with all pulled enemies. After entering battle, deals Wind DMG equal to 200% of Feixiao's ATK to all enemies at the start of each wave. This DMG is guaranteed to CRIT. If more than 1 enemy is pulled in, increases the multiplier of this DMG by 100% for each additional enemy pulled in, up to a maximum of 1000%."
          }
        }
        Eidolons: {
          122001: {
            Name: 'Skyward I Quell'
            Desc: 'After launching "Boltsunder Blitz" or "Waraxe Skyward," additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to 10% of the original DMG, stacking up to 5 time(s) and lasting until the end of the Ultimate action.'
          }
          122002: {
            Name: 'Moonward I Wish'
            Desc: "In the Talent's effect, for every 1 instance of follow-up attack launched by ally targets, Feixiao gains 1 point of \"Flying Aureus.\" This effect can trigger up to 6 time(s) per turn."
          }
          122003: {
            Name: 'Starward I Bode'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          122004: {
            Name: 'Stormward I Hear'
            Desc: "The follow-up attack from Talent has its Toughness Reduction increased by 100%, and when it launches, increases this unit's SPD by 8%, lasting for 2 turn(s)."
          }
          122005: {
            Name: 'Heavenward I Leap'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          122006: {
            Name: 'Homeward I Near'
            Desc: "Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by 20%. Talent's follow-up attack DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by 140%."
          }
        }
        Effects: {
          10012201: {
            Name: 'Thunderhunt'
            Desc: "The Talent's follow-up attack can now be triggered."
            Source: 1220
            ID: 10012201
          }
          10012202: {
            Name: 'Thunderhunt'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1220
            ID: 10012202
          }
          10012203: {
            Name: 'Boltcatch'
            Desc: 'ATK increases by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1220
            ID: 10012203
          }
          10012204: {
            Name: 'Stormward I Hear'
            Desc: 'SPD increases by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1220
            ID: 10012204
          }
          10012205: {
            Name: 'Skyward I Quell'
            Desc: 'Each stack additionally increases the multiplier for the Ultimate DMG dealt by an amount equal to {{parameter0}}% of the original DMG multiplier.'
            Source: 1220
            ID: 10012205
          }
          10012206: {
            Name: 'Moonward I Wish'
            Desc: "In the Talent's effect, for every 1 instance of follow-up attack launched by ally targets, Feixiao gains 1 point of \"Flying Aureus.\" This effect can still trigger {{parameter0}} time(s)."
            Source: 1220
            ID: 10012206
          }
        }
        Traces: {
          A2: {
            Name: 'Heavenpath'
            Desc: 'When the battle starts, gains 3 point(s) of "Flying Aureus."\\nAt the start of a turn, if no follow-up attack was launched via Talent in the previous turn, then this counts as 1 toward the number of attacks required to gain "Flying Aureus."'
            Owner: 1220
            ID: 1220101
            Ascension: 2
          }
          A4: {
            Name: 'Formshift'
            Desc: "When using Ultimate to deal DMG to an enemy target, it is considered as a follow-up attack. Follow-up attacks' CRIT DMG increases by 36%."
            Owner: 1220
            ID: 1220102
            Ascension: 4
          }
          A6: {
            Name: 'Boltcatch'
            Desc: 'When using Skill, increases ATK by 48%, lasting for 3 turn(s).'
            Owner: 1220
            ID: 1220103
            Ascension: 6
          }
        }
      }
      1221: {
        Name: 'Yunli'
        Abilities: {
          122101: {
            Name: 'Galespin Summersault'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          122102: {
            Name: 'Bladeborne Quake'
            Desc: "Restores this unit's HP and deals minor Physical DMG to a single enemy and adjacent targets."
            Type: 'Skill'
            LongDescWithoutEidolon: "Restores HP equal to 30% of Yunli's ATK plus 200. Deals Physical DMG equal to 120% of Yunli's ATK to a single target enemy and Physical DMG equal to 60% of Yunli's ATK to adjacent targets."
            LongDescWithEidolon: "Restores HP equal to 32% of Yunli's ATK plus 222.5. Deals Physical DMG equal to 132% of Yunli's ATK to a single target enemy and Physical DMG equal to 66% of Yunli's ATK to adjacent targets."
          }
          122103: {
            Name: 'Earthbind, Etherbreak'
            Desc: 'Enters "Parry" and taunts all enemies. When attacked during this period, triggers powerful Counter and deals Physical DMG to the attacker and adjacent targets. Then, deals minor Physical DMG to a single enemy that bounces 6 times. If no Counter is triggered while Parry is active, deals Physical DMG to a random enemy target and adjacent targets when Parry ends.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Consumes 120 Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next ally's or enemy's turn. Increases the CRIT DMG dealt by Yunli's next Counter by 100%. When triggering the Counter effect from Talent, launches the Counter \"Intuit: Cull\" instead and removes the Parry effect. If no Counter is triggered while Parry is active, Yunli will immediately launch the Counter \"Intuit: Slash\" on a random enemy target.\\n\\n\"Intuit: Slash\": Deals Physical DMG equal to 220% of Yunli's ATK to the target, and deals Physical DMG equal to 110% of Yunli's ATK to adjacent targets.\\n\"Intuit: Cull\": Deals Physical DMG equal to 220% of Yunli's ATK to the target, and deals Physical DMG equal to 110% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to 72% of Yunli's ATK to a random single enemy.\\n\\nWhen Yunli deals DMG via this ability, it's considered as dealing Ultimate DMG."
            LongDescWithEidolon: "Consumes 120 Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next ally's or enemy's turn. Increases the CRIT DMG dealt by Yunli's next Counter by 108%. When triggering the Counter effect from Talent, launches the Counter \"Intuit: Cull\" instead and removes the Parry effect. If no Counter is triggered while Parry is active, Yunli will immediately launch the Counter \"Intuit: Slash\" on a random enemy target.\\n\\n\"Intuit: Slash\": Deals Physical DMG equal to 237.6% of Yunli's ATK to the target, and deals Physical DMG equal to 118.8% of Yunli's ATK to adjacent targets.\\n\"Intuit: Cull\": Deals Physical DMG equal to 237.6% of Yunli's ATK to the target, and deals Physical DMG equal to 118.8% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to 77.76% of Yunli's ATK to a random single enemy.\\n\\nWhen Yunli deals DMG via this ability, it's considered as dealing Ultimate DMG."
          }
          122104: {
            Name: 'Flashforge'
            Desc: 'When Yunli gets attacked by an enemy target, additionally regenerates Energy and immediately launches a Counter against the attacker and adjacent targets.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When Yunli gets attacked by an enemy target, additionally regenerates 15 Energy and immediately launches a Counter on the attacker, dealing Physical DMG equal to 120% of Yunli's ATK to the attacker and Physical DMG equal to 60% of Yunli's ATK to adjacent targets.\\nIf there is no immediate target to Counter, then Counters a random enemy target instead."
            LongDescWithEidolon: "When Yunli gets attacked by an enemy target, additionally regenerates 15 Energy and immediately launches a Counter on the attacker, dealing Physical DMG equal to 132% of Yunli's ATK to the attacker and Physical DMG equal to 66% of Yunli's ATK to adjacent targets.\\nIf there is no immediate target to Counter, then Counters a random enemy target instead."
          }
          122106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          122107: {
            Name: 'Posterior Precedence'
            Desc: 'This unit gains the Ward effect, lasting for 20 seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts "Intuit: Cull" on a random enemy.'
            Type: 'Technique'
            LongDesc: 'This unit gains the Ward effect, lasting for 20 seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts "Intuit: Cull" on a random enemy, and increases the DMG dealt by this attack by 80%.'
          }
        }
        Eidolons: {
          122101: {
            Name: 'Weathered Blade Does Not Sully'
            Desc: 'Increases DMG dealt by "Intuit: Slash" and "Intuit: Cull" by 20%. Increases the number of additional DMG instances for "Intuit: Cull" by 3.'
          }
          122102: {
            Name: 'First Luster Breaks Dawn'
            Desc: "When dealing DMG via Counter, ignores 20% of the target's DEF."
          }
          122103: {
            Name: 'Mastlength Twirls Mountweight'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          122104: {
            Name: "Artisan's Ironsong"
            Desc: "After launching \"Intuit: Slash\" or \"Intuit: Cull,\" increases this unit's Effect RES by 50%, lasting for 1 turn(s)."
          }
          122105: {
            Name: 'Blade of Old Outlasts All'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          122106: {
            Name: 'Walk in Blade, Talk in Zither'
            Desc: 'While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger "Intuit: Cull" and remove the "Parry" effect. When dealing DMG via "Intuit: Slash" or "Intuit: Cull," increases CRIT Rate by 15% and Physical RES PEN by 20%.'
          }
        }
        Effects: {
          10012211: {
            Name: 'Imbalance'
            Desc: 'Increases DMG dealt by Yunli to this unit by {{parameter0}}%.'
            Effect: 'Imbalance'
            Source: 1221
            ID: 10012211
          }
          10012212: {
            Name: 'Parry'
            Desc: "When triggering Talent's Counter effect, launches the Counter \"Intuit: Cull\" instead."
            Effect: 'Parry'
            Source: 1221
            ID: 10012212
          }
          10012213: {
            Name: 'True Sunder'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1221
            ID: 10012213
          }
          10012214: {
            Name: 'Demon Quell'
            Desc: 'Resists Crowd Control debuffs received and reduces DMG received by {{parameter0}}%.'
            Effect: 'Resists Crowd Control debuffs'
            Source: 1221
            ID: 10012214
          }
          10012215: {
            Name: 'First Luster Breaks Dawn'
            Desc: 'Increase CRIT Rate by {{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1221
            ID: 10012215
          }
          10012216: {
            Name: "Artisan's Ironsong"
            Desc: 'Increases Effect RES by {{parameter0}}%.'
            Effect: 'Effect RES Boost'
            Source: 1221
            ID: 10012216
          }
          10012217: {
            Name: 'Earthbind, Etherbreak'
            Desc: 'Increases CRIT DMG dealt by the next Counter by {{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1221
            ID: 10012217
          }
        }
        Traces: {
          A2: {
            Name: 'Fiery Wheel'
            Desc: 'After each use of "Intuit: Slash," the next "Intuit: Slash" will be replaced by "Intuit: Cull."'
            Owner: 1221
            ID: 1221101
            Ascension: 2
          }
          A4: {
            Name: 'Demon Quell'
            Desc: 'While in the Parry state, resists Crowd Control debuffs received and reduces DMG received by 20%.'
            Owner: 1221
            ID: 1221102
            Ascension: 4
          }
          A6: {
            Name: 'True Sunder'
            Desc: "When using a Counter, increases Yunli's ATK by 30%, lasting for 1 turn."
            Owner: 1221
            ID: 1221103
            Ascension: 6
          }
        }
      }
      1222: {
        Name: 'Lingsha'
        Abilities: {
          122201: {
            Name: 'Votive Incense'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          122202: {
            Name: 'Smoke and Splendor'
            Desc: "Deals minor Fire DMG to all enemies and, at the same time, restores HP for all allies. Fuyuan's action advances."
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 80% of Lingsha's ATK to all enemies and at the same time, restores HP equal to 14% of Lingsha's ATK plus 420 for all allies. Fuyuan's action advances by 20%."
            LongDescWithEidolon: "Deals Fire DMG equal to 88% of Lingsha's ATK to all enemies and at the same time, restores HP equal to 14.8% of Lingsha's ATK plus 467.25 for all allies. Fuyuan's action advances by 20%."
          }
          122203: {
            Name: 'Dripping Mistscape'
            Desc: "Increases Break DMG taken by all enemies, deals Fire DMG to all enemies, and at the same time, restores HP for all allies. Fuyuan's action advances."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Inflicts \"Befog\" on all enemies. While in \"Befog,\" targets receive 25% increased Break DMG, lasting for 2 turn(s).\\nDeals Fire DMG equal to 150% of Lingsha's ATK to all enemies, and at the same time restores HP equal to 12% of Lingsha's ATK plus 360 for all allies. Fuyuan's action advances by 100%."
            LongDescWithEidolon: "Inflicts \"Befog\" on all enemies. While in \"Befog,\" targets receive 27% increased Break DMG, lasting for 2 turn(s).\\nDeals Fire DMG equal to 162% of Lingsha's ATK to all enemies, and at the same time restores HP equal to 12.8% of Lingsha's ATK plus 400.5 for all allies. Fuyuan's action advances by 100%."
          }
          122204: {
            Name: 'Mistdance Manifest'
            Desc: "Using Skill summons Fuyuan: When taking action, launches follow-up attack and deals minor Fire DMG to all enemies. Additionally deals minor Fire DMG to a single random enemy, prioritizing targets with both Toughness greater than 0 and Fire Weakness. Dispels 1 debuff from all allies, and restores HP.\\nUsing Skill repeatedly will increase Fuyuan's action count."
            Type: 'Talent'
            LongDescWithoutEidolon: "When using Skill, summons Fuyuan, with an initial SPD of 90 and an initial action count of 3.\\nWhen taking action, Fuyuan launches follow-up attack, dealing Fire DMG equal to 75% of Lingsha's ATK to all enemies. Additionally deals Fire DMG equal to 75% of Lingsha's ATK to a single random enemy, and this DMG prioritizes targets that have both Toughness greater than 0 and Fire Weakness. Dispels 1 debuff(s) from all allies and restores HP equal to 12% of Lingsha's ATK plus 360.\\nFuyuan's action count can accumulate up to 5. When the action count reaches 0 or when Lingsha is knocked down, Fuyuan disappears.\\nWhile Fuyuan is on the field, using Skill can increase Fuyuan's action count by 3."
            LongDescWithEidolon: "When using Skill, summons Fuyuan, with an initial SPD of 90 and an initial action count of 3.\\nWhen taking action, Fuyuan launches follow-up attack, dealing Fire DMG equal to 82.5% of Lingsha's ATK to all enemies. Additionally deals Fire DMG equal to 82.5% of Lingsha's ATK to a single random enemy, and this DMG prioritizes targets that have both Toughness greater than 0 and Fire Weakness. Dispels 1 debuff(s) from all allies and restores HP equal to 12.8% of Lingsha's ATK plus 400.5.\\nFuyuan's action count can accumulate up to 5. When the action count reaches 0 or when Lingsha is knocked down, Fuyuan disappears.\\nWhile Fuyuan is on the field, using Skill can increase Fuyuan's action count by 3."
          }
          122206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          122207: {
            Name: 'Wisps of Aurora'
            Desc: 'After using Technique, immediately summons Fuyuan at the start of the next battle and increases Break DMG taken by all enemies.'
            Type: 'Technique'
            LongDesc: 'After using Technique, immediately summons Fuyuan at the start of the next battle and inflicts "Befog" on all enemies, lasting for 2 turn(s).'
          }
        }
        Eidolons: {
          122201: {
            Name: 'Bloom on Vileward Bouquet'
            Desc: "Lingsha's Weakness Break Efficiency increases by 50%. When an enemy unit's Weakness is Broken, reduces their DEF by 20%."
          }
          122202: {
            Name: 'Leisure in Carmine Smokeveil'
            Desc: "When using Ultimate, increases all allies' Break Effect by 40%, lasting for 3 turn(s)."
          }
          122203: {
            Name: 'Shine of Floral Wick'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          122204: {
            Name: 'Redolence from Canopied Banquet'
            Desc: "When Fuyuan takes action, restores HP equal to 40% of Lingsha's ATK for the ally whose current HP is the lowest."
          }
          122205: {
            Name: 'Poise Atop Twists and Turns'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          122206: {
            Name: 'Arcadia Under Deep Seclusion'
            Desc: "While Fuyuan is on the field, reduces all enemies' All-Type RES by 20%. When Fuyuan attacks, additionally deals 4 instance(s) of DMG, with each instance dealing both Fire DMG equal to 50% of Lingsha's ATK and a Toughness Reduction of 5 to a single random enemy. This prioritizes targets with both Toughness greater than 0 and Fire Weakness."
          }
        }
        Effects: {
          10012221: {
            Name: 'Bloom on Vileward Bouquet'
            Desc: 'DEF decreases by {{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1222
            ID: 10012221
          }
          10012222: {
            Name: 'Befog'
            Desc: 'Break DMG taken increases by {{parameter0}}%.'
            Effect: 'Befog'
            Source: 1222
            ID: 10012222
          }
          10012223: {
            Name: "Ember's Echo"
            Desc: "The Trace \"Ember's Echo\" effect's auto-trigger is still on cooldown."
            Source: 1222
            ID: 10012223
          }
          10012224: {
            Name: 'Leisure in Carmine Smokeveil'
            Desc: 'Break Effect increases by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 1222
            ID: 10012224
          }
          10012225: {
            Name: 'Arcadia Under Deep Seclusion'
            Desc: 'All-Type RES decreases by {{parameter0}}%.'
            Effect: 'All-Type RES Reduction'
            Source: 1222
            ID: 10012225
          }
        }
        Traces: {
          A2: {
            Name: 'Vermilion Waft'
            Desc: "Increases this unit's ATK or Outgoing Healing by an amount equal to 25%/10% of Break Effect, up to a maximum increase of 50%/20% respectively."
            Owner: 1222
            ID: 1222101
            Ascension: 2
          }
          A4: {
            Name: 'Sylvan Smoke'
            Desc: 'When using Basic ATK, additionally regenerates 10 Energy.'
            Owner: 1222
            ID: 1222102
            Ascension: 4
          }
          A6: {
            Name: "Ember's Echo"
            Desc: "When Fuyuan is on the field and any ally character takes DMG or consumes HP, if a character in the team has their current HP percentage lower than or equal to 60%, Fuyuan will immediately launch the Talent's follow-up attack. This does not consume Fuyuan's action count. This effect can trigger again after 2 turn(s)."
            Owner: 1222
            ID: 1222103
            Ascension: 6
          }
        }
      }
      1223: {
        Name: 'Moze'
        Abilities: {
          122301: {
            Name: 'Hurlthorn'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          122302: {
            Name: 'Fleetwinged Raid'
            Desc: 'Marks a single enemy as "Prey" and deals Lightning DMG to it. Gains NaN points of Charge.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Marks a designated single enemy target as \"Prey\" and deals to it Lightning DMG equal to 150% of Moze's ATK, and gains 9 points of Charge.\\nWhen there are no other characters on the field that are capable of combat, Moze cannot use his Skill and dispels the enemy's \"Prey\" state."
            LongDescWithEidolon: "Marks a designated single enemy target as \"Prey\" and deals to it Lightning DMG equal to 165% of Moze's ATK, and gains 9 points of Charge.\\nWhen there are no other characters on the field that are capable of combat, Moze cannot use his Skill and dispels the enemy's \"Prey\" state."
          }
          122303: {
            Name: '<unbreak>Dash In,</unbreak> <unbreak>Gash Out</unbreak>'
            Desc: "Deals Lightning DMG to a single enemy, and launches Talent's follow-up attack."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Lightning DMG equal to 270% of Moze's ATK to a single target enemy, and launches the Talent's follow-up attack against this target. If the target is defeated before this follow-up attack is used, then launches the follow-up attack against a random single enemy instead."
            LongDescWithEidolon: "Deals Lightning DMG equal to 291.6% of Moze's ATK to a single target enemy, and launches the Talent's follow-up attack against this target. If the target is defeated before this follow-up attack is used, then launches the follow-up attack against a random single enemy instead."
          }
          122304: {
            Name: 'Cascading Featherblade'
            Desc: "When \"Prey\" exists on the field, Moze will enter the Departed state.\\nAfter allies attack \"Prey,\" Moze deals Lightning Additional DMG and consumes 1 Charge point. For every NaN point(s) of Charge consumed, Moze launches  follow-up attack on \"Prey,\" dealing Lightning DMG. When Charge is 0, dispels the target's \"Prey\" state."
            Type: 'Talent'
            LongDescWithoutEidolon: "When \"Prey\" exists on the field, Moze will enter the Departed state.\\nAfter allies attack \"Prey,\" Moze will additionally deal 1 instance of Lightning Additional DMG equal to 30% of his ATK and consumes 1 point of Charge. For every 3 point(s) of Charge consumed, Moze launches 1 follow-up attack to \"Prey,\" dealing Lightning DMG equal to 160% of his ATK. When Charge reaches 0, dispels the target's \"Prey\" state and resets the tally of Charge points required to launch follow-up attack. Talent's follow-up attack does not consume Charge."
            LongDescWithEidolon: "When \"Prey\" exists on the field, Moze will enter the Departed state.\\nAfter allies attack \"Prey,\" Moze will additionally deal 1 instance of Lightning Additional DMG equal to 33% of his ATK and consumes 1 point of Charge. For every 3 point(s) of Charge consumed, Moze launches 1 follow-up attack to \"Prey,\" dealing Lightning DMG equal to 176% of his ATK. When Charge reaches 0, dispels the target's \"Prey\" state and resets the tally of Charge points required to launch follow-up attack. Talent's follow-up attack does not consume Charge."
          }
          122306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          122307: {
            Name: 'Bated Wings'
            Desc: 'Enters the Stealth state. Attacking enemies to enter combat while in Stealth increases DMG.'
            Type: 'Technique'
            LongDesc: 'After using Technique, enters the Stealth state for 20 second(s). While in Stealth, Moze is undetectable by enemies. If Moze attacks enemies to enter combat while in Stealth, increases DMG by 30%, lasting for 2 turn(s).'
          }
        }
        Eidolons: {
          122301: {
            Name: 'Oathkeeper'
            Desc: 'After entering battle, Moze regenerates 20 Energy. Each time the Additional DMG from his Talent is triggered, Moze regenerates 2 Energy.'
          }
          122302: {
            Name: 'Wrathbearer'
            Desc: 'When all allies deal DMG to the enemy target marked as "Prey," increases CRIT DMG by 40%.'
          }
          122303: {
            Name: 'Deathchaser'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          122304: {
            Name: 'Heathprowler'
            Desc: 'When using Ultimate, increases the DMG dealt by Moze by 30%, lasting for 2 turn(s).'
          }
          122305: {
            Name: 'Truthbender'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          122306: {
            Name: 'Faithbinder'
            Desc: "Increases the DMG multiplier of the Talent's follow-up attack by 25%."
          }
        }
        Effects: {
          10012231: {
            Name: 'Prey'
            Desc: "This unit is marked as \"Prey.\" After every time it receives an attack, it will receive Lightning Additional DMG equal to {{parameter0}}% of Moze's ATK, and Moze will consume 1 point of Charge."
            Effect: 'Prey'
            Source: 1223
            ID: 10012231
          }
          10012232: {
            Name: 'DEF Reduction'
            Desc: 'DEF decreases by {{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1223
            ID: 10012232
          }
          10012233: {
            Name: 'DMG Boost'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1223
            ID: 10012233
          }
          10012234: {
            Name: 'Bated Wings'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1223
            ID: 10012234
          }
          10012235: {
            Name: 'Heathprowler'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1223
            ID: 10012235
          }
          10012236: {
            Name: 'Additional DMG Multiplier Boost'
            Desc: 'Increases Additional DMG multiplier by {{parameter0}}%.'
            Effect: 'Additional DMG Multiplier Boost'
            Source: 1223
            ID: 10012236
          }
          10012237: {
            Name: 'ATK Boost'
            Desc: 'ATK increases by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1223
            ID: 10012237
          }
          10012238: {
            Name: 'Vengewise'
            Desc: 'Follow-up attack DMG taken increases by {{parameter0}}%.'
            Effect: 'Follow-up Attack DMG Vulnerability'
            Source: 1223
            ID: 10012238
          }
          10012239: {
            Name: 'Nightfeather'
            Desc: "The Trace \"Nightfeather\" effect's auto-trigger is still on cooldown."
            Source: 1223
            ID: 10012239
          }
        }
        Traces: {
          A2: {
            Name: 'Nightfeather'
            Desc: "After using the Talent's follow-up attack, recovers 1 Skill Point(s). This effect can trigger again after 1 turn(s)."
            Owner: 1223
            ID: 1223101
            Ascension: 2
          }
          A4: {
            Name: 'Daggerhold'
            Desc: "When Moze dispels his Departed state, his action advances by 20%. At the start of each wave, Moze's action advances by 30%."
            Owner: 1223
            ID: 1223102
            Ascension: 4
          }
          A6: {
            Name: 'Vengewise'
            Desc: 'When dealing DMG by using Ultimate, it is considered as having launched a follow-up attack. The follow-up attack DMG taken by "Prey" increases by 25%.'
            Owner: 1223
            ID: 1223103
            Ascension: 6
          }
        }
      }
      1224: {
        Name: 'March 7th'
        Abilities: {
          122401: {
            Name: 'My Sword Zaps Demons'
            Desc: 'Deals minor Imaginary DMG to a single enemy and gains NaN point(s) of Charge.'
            Type: 'Basic ATK'
          }
          122402: {
            Name: "Master, It's Tea Time!"
            Desc: "Makes a single ally become Shifu. When using Basic ATK or dealing Enhanced Basic ATK's DMG, triggers the corresponding effect based on the Shifu's Path:\\nErudition, Destruction, The Hunt: Deals Additional DMG based on Shifu's Type.\\nHarmony, Nihility, Preservation, Abundance: Toughness Reduction increases."
            Type: 'Skill'
            LongDescWithoutEidolon: "Designates a single ally (excluding this unit) as Shifu and increases Shifu's SPD by 10%. Only the most recent target of March 7th's Skill is considered as Shifu.\\n\\n\\nWhenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if Shifu with the specified Path is present on the field:\\n\\nErudition, Destruction, The Hunt: Deals Additional DMG (DMG Type based on Shifu's Combat Type) equal to 20% of March 7th's ATK.\\n\\nHarmony, Nihility, Preservation, Abundance: Increases the Toughness Reduction of this instance of DMG by 100%."
            LongDescWithEidolon: "Designates a single ally (excluding this unit) as Shifu and increases Shifu's SPD by 10.8%. Only the most recent target of March 7th's Skill is considered as Shifu.\\n\\n\\nWhenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if Shifu with the specified Path is present on the field:\\n\\nErudition, Destruction, The Hunt: Deals Additional DMG (DMG Type based on Shifu's Combat Type) equal to 22% of March 7th's ATK.\\n\\nHarmony, Nihility, Preservation, Abundance: Increases the Toughness Reduction of this instance of DMG by 100%."
          }
          122403: {
            Name: 'March 7th, the Apex Heroine'
            Desc: 'Deals Imaginary DMG to a single enemy and increases the Hits Per Action and DMG chance of the next Enhanced Basic ATK.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 240% of March 7th's ATK to a single target enemy.\\nIncreases the initial Hits Per Action of the next Enhanced Basic ATK by 2 hits and increase the fixed chance of additionally dealing DMG by 20%."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 259.2% of March 7th's ATK to a single target enemy.\\nIncreases the initial Hits Per Action of the next Enhanced Basic ATK by 2 hits and increase the fixed chance of additionally dealing DMG by 20%."
          }
          122404: {
            Name: "Master, I've Ascended!"
            Desc: 'After Shifu uses an attack or Ultimate, March 7th gains Charge. When reaching NaN points of Charge, March 7th immediately takes action and increases the DMG she deals. Basic ATK gets Enhanced.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.\\nUpon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by 80%. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes 7 point(s) of Charge. Charge is capped at 10 points.'
            LongDescWithEidolon: 'After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.\\nUpon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by 88%. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes 7 point(s) of Charge. Charge is capped at 10 points.'
          }
          122406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          122407: {
            Name: 'Feast in One Go'
            Desc: 'Whenever an ally uses Technique, March 7th gains Charge upon entering the next battle. Using Technique regenerates Energy upon entering the next battle.'
            Type: 'Technique'
            LongDesc: 'If March 7th is on the team, she gains 1 point of Charge at the start of the next battle whenever an ally uses Technique, up to a max of 3 point(s).\\nAfter using Technique, March 7th regenerates 30 Energy when the next battle starts.'
          }
        }
        Eidolons: {
          122401: {
            Name: 'My Sword Stirs Starlight'
            Desc: "When Shifu is on the field, increases March 7th's SPD by 10%."
          }
          122402: {
            Name: "Blade Dances on Waves' Fight"
            Desc: "After Shifu uses Basic ATK or Skill to attack an enemy target, March 7th immediately launches a follow-up attack and deals Imaginary DMG equal to 60% of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on Shifu's Path and then gains 1 point(s) of Charge. If there is no primary target available to attack, then attacks a single random enemy instead. This effect can only trigger once per turn."
          }
          122403: {
            Name: 'Sharp Wit in Martial Might'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          122404: {
            Name: 'Being Fabulous Never Frights'
            Desc: 'At the start of the turn, regenerates 5 Energy.'
          }
          122405: {
            Name: 'Sword Delights, Sugar Blights'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          122406: {
            Name: 'Me, the Best Girl in Sight'
            Desc: 'After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50%.'
          }
        }
        Effects: {
          10012241: {
            Name: 'Shifu'
            Desc: 'After using an attack or Ultimate, %CasterName gains a max of 1 Charge point each time.'
            Effect: 'Become Shifu'
            Source: 1224
            ID: 10012241
          }
          10012242: {
            Name: 'Charge'
            Desc: 'When Charge equals to {{parameter1}} or more, immediately takes action and simultaneously increases DMG dealt by {{parameter0}}%. Additionally, Basic ATK gets Enhanced.'
            Source: 1224
            ID: 10012242
          }
          10012243: {
            Name: "Master, It's Tea Time!"
            Desc: "Increases SPD of %CasterName's Shifu by {{parameter0}}%."
            Source: 1224
            ID: 10012243
          }
          10012244: {
            Name: 'March 7th, the Apex Heroine'
            Desc: "Increases the next Enhanced Basic ATK's initial Hits Per Action by {{parameter0}}. The fixed chance of additionally dealing DMG increases by {{parameter1}}%."
            Effect: 'Enhanced Basic Attack Boost'
            Source: 1224
            ID: 10012244
          }
          10012245: {
            Name: "Blade Dances on Waves' Fight"
            Desc: "The \"Blade Dances on Waves' Fight\" effect cannot be triggered yet."
            Source: 1224
            ID: 10012245
          }
          10012246: {
            Name: 'Tide Tamer'
            Desc: 'Increases CRIT DMG by {{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1224
            ID: 10012246
          }
          10012247: {
            Name: 'Tide Tamer'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 1224
            ID: 10012247
          }
          10012248: {
            Name: 'My Sword Stirs Starlight'
            Desc: 'When Shifu is on the field, increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1224
            ID: 10012248
          }
        }
        Traces: {
          A2: {
            Name: 'Swan Soar'
            Desc: "When the battle starts, March 7th's action is Advanced Forward by 25%."
            Owner: 1224
            ID: 1224101
            Ascension: 2
          }
          A4: {
            Name: 'Filigree'
            Desc: "March 7th can reduce the Toughness of enemies whose Weakness Type is the same as Shifu's Combat Type. When Breaking Weakness, triggers the Imaginary Weakness Break effect."
            Owner: 1224
            ID: 1224102
            Ascension: 4
          }
          A6: {
            Name: 'Tide Tamer'
            Desc: "After using Enhanced Basic ATK, increases Shifu's CRIT DMG by 60% and Break Effect by 36%, lasting for 2 turn(s)."
            Owner: 1224
            ID: 1224103
            Ascension: 6
          }
        }
      }
      1301: {
        Name: 'Gallagher'
        Abilities: {
          130101: {
            Name: 'Corkage Fee'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130102: {
            Name: 'Special Brew'
            Desc: "Immediately restores an ally's HP."
            Type: 'Skill'
            LongDescWithoutEidolon: 'Immediately heals a target ally for 1600 HP.'
            LongDescWithEidolon: 'Immediately heals a target ally for 1768 HP.'
          }
          130103: {
            Name: 'Champagne Etiquette'
            Desc: 'Inflicts Besotted on all enemies and deals Fire DMG to them at the same time. Enhances the next Basic ATK to Nectar Blitz.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Inflicts Besotted on all enemies, lasting for 2 turn(s). At the same time, deals Fire DMG equal to 150% of Gallagher's ATK to all enemies, and enhances his next Basic ATK to Nectar Blitz."
            LongDescWithEidolon: "Inflicts Besotted on all enemies, lasting for 2 turn(s). At the same time, deals Fire DMG equal to 165% of Gallagher's ATK to all enemies, and enhances his next Basic ATK to Nectar Blitz."
          }
          130104: {
            Name: 'Tipsy Tussle'
            Desc: "The Besotted state makes targets receive more Break DMG. Every time the target gets attacked by an ally, the attacker's HP is restored."
            Type: 'Talent'
            LongDescWithoutEidolon: "The Besotted state makes targets receive 12% more Break DMG. Every time a Besotted target gets attacked by an ally, the attacking ally's HP is restored by 640."
            LongDescWithEidolon: "The Besotted state makes targets receive 13.2% more Break DMG. Every time a Besotted target gets attacked by an ally, the attacking ally's HP is restored by 707.2."
          }
          130106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130107: {
            Name: 'Artisan Elixir'
            Desc: 'Attacks the enemy. After entering battle, inflicts Besotted to all enemies and deals minor Fire DMG to all enemies.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. Upon entering battle, inflicts Besotted on all enemies, lasting for 2 turn(s). And deals Fire DMG equal to 50% of Gallagher's ATK to all enemies."
          }
        }
        Eidolons: {
          130101: {
            Name: 'Salty Dog'
            Desc: 'When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%.'
          }
          130102: {
            Name: "Lion's Tail"
            Desc: 'When using the Skill, removes 1 debuff(s) from the target ally. At the same time, increases their Effect RES by 30%, lasting for 2 turn(s).'
          }
          130103: {
            Name: 'Corpse Reviver'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130104: {
            Name: 'Last Word'
            Desc: "Extends the duration of the Besotted state inflicted by Gallagher's Ultimate by 1 turn(s)."
          }
          130105: {
            Name: 'Death in the Afternoon'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130106: {
            Name: 'Blood and Sand'
            Desc: "Increases Gallagher's Break Effect by 20% and Weakness Break Efficiency by 20%."
          }
        }
        Effects: {
          10013011: {
            Name: 'Besotted'
            Desc: 'Increases the received Break DMG by {{parameter0}}%. And every time this unit gets attacked by characters, the attacker will restore {{parameter1}} HP.'
            Effect: 'Besotted'
            Source: 1301
            ID: 10013011
          }
          10013012: {
            Name: 'ATK Reduction'
            Desc: 'ATK decreases by {{parameter0}}%.'
            Effect: 'ATK Reduction'
            Source: 1301
            ID: 10013012
          }
          10013013: {
            Name: 'Effect RES Boost'
            Desc: 'Increases Effect RES by {{parameter0}}%.'
            Effect: 'Effect RES Boost'
            Source: 1301
            ID: 10013013
          }
        }
        Traces: {
          A2: {
            Name: 'Novel Concoction'
            Desc: "Increases this unit's Outgoing Healing by an amount equal to 50% of Break Effect, up to a maximum Outgoing Healing increase of 75%."
            Owner: 1301
            ID: 1301101
            Ascension: 2
          }
          A4: {
            Name: 'Organic Yeast'
            Desc: "After using the Ultimate, immediately Advances Forward this unit's Action by 100%."
            Owner: 1301
            ID: 1301102
            Ascension: 4
          }
          A6: {
            Name: 'Bottoms Up'
            Desc: 'When Gallagher uses Nectar Blitz to attack Besotted enemies, the HP Restore effect of his Talent will also apply to other allies for this time.'
            Owner: 1301
            ID: 1301103
            Ascension: 6
          }
        }
      }
      1302: {
        Name: 'Argenti'
        Abilities: {
          130201: {
            Name: 'Fleeting Fragrance'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130202: {
            Name: 'Justice, Hereby Blooms'
            Desc: 'Deals minor Physical DMG to all enemies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 120% of Argenti's ATK to all enemies."
            LongDescWithEidolon: "Deals Physical DMG equal to 132% of Argenti's ATK to all enemies."
          }
          130203: {
            Name: 'For In This Garden, Supreme Beauty Bestows'
            Desc: 'Consumes NaN Energy and deals Physical DMG to all enemies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Consumes 90 Energy and deals Physical DMG equal to 160% of Argenti's ATK to all enemies."
            LongDescWithEidolon: "Consumes 90 Energy and deals Physical DMG equal to 172.8% of Argenti's ATK to all enemies."
          }
          130204: {
            Name: 'Sublime Object'
            Desc: 'When Argenti uses his Basic ATK, Skill, or Ultimate, he regenerates Energy and increases his CRIT Rate for every enemy target hit.'
            Type: 'Talent'
            LongDescWithoutEidolon: "For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by 3, and grants him a stack of Apotheosis, increasing his CRIT Rate by 2.5%. This effect can stack up to 10 time(s)."
            LongDescWithEidolon: "For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by 3, and grants him a stack of Apotheosis, increasing his CRIT Rate by 2.8%. This effect can stack up to 10 time(s)."
          }
          130206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130207: {
            Name: 'Manifesto of Purest Virtue'
            Desc: 'Inflicts Daze on all enemies within a set area. When attacking a Dazed enemy to enter combat, deals minor Physical DMG to all enemies and regenerates energy for Argenti.'
            Type: 'Technique'
            LongDesc: "After using the Technique, enemies in a set area are inflicted with Daze for 10 second(s). Dazed enemies will not actively attack the team.\\nWhen attacking a Dazed enemy to enter combat, deals Physical DMG to all enemies equal to 80% of Argenti's ATK and regenerates his Energy by 15."
          }
        }
        Eidolons: {
          130201: {
            Name: 'A Lacuna in Kingdom of Aesthetics'
            Desc: 'Each stack of Apotheosis additionally increases CRIT DMG by 4%.'
          }
          130202: {
            Name: "Agate's Humility"
            Desc: 'If the number of enemies on the field equals to 3 or more when the Ultimate is used, ATK increases by 40% for 1 turn(s).'
          }
          130203: {
            Name: "Thorny Road's Glory"
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130204: {
            Name: "Trumpet's Dedication"
            Desc: "At the start of battle, gains 2 stack(s) of Apotheosis and increases the maximum stack limit of the Talent's effect by 2."
          }
          130205: {
            Name: 'Snow, From Somewhere in Cosmos'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130206: {
            Name: '"Your" Resplendence'
            Desc: "When using Ultimate, ignores 30% of enemy targets' DEF."
          }
        }
        Effects: {
          10013021: {
            Name: 'Apotheosis'
            Desc: 'Increases CRIT Rate by {{parameter0}}%.'
            Effect: 'Apotheosis'
            Source: 1302
            ID: 10013021
          }
          10013022: {
            Name: "Agate's Humility"
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1302
            ID: 10013022
          }
        }
        Traces: {
          A2: {
            Name: 'Piety'
            Desc: 'At the start of a turn, immediately gains 1 stack(s) of Apotheosis.'
            Owner: 1302
            ID: 1302101
            Ascension: 2
          }
          A4: {
            Name: 'Generosity'
            Desc: 'When enemy targets enter battle, immediately regenerates 2 Energy for self.'
            Owner: 1302
            ID: 1302102
            Ascension: 4
          }
          A6: {
            Name: 'Courage'
            Desc: 'Deals 15% more DMG to enemies whose HP percentage is 50% or less.'
            Owner: 1302
            ID: 1302103
            Ascension: 6
          }
        }
      }
      1303: {
        Name: 'Ruan Mei'
        Abilities: {
          130301: {
            Name: 'Threading Fragrance'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130302: {
            Name: 'String Sings Slow Swirls'
            Desc: "After using her Skill, Ruan Mei gains Overtone. When Ruan Mei has Overtone, increase all allies' DMG and Weakness Break Efficiency."
            Type: 'Skill'
            LongDescWithoutEidolon: "After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's every turn. When Ruan Mei has Overtone, all allies' DMG increases by 32% and Weakness Break Efficiency increases by 50%."
            LongDescWithEidolon: "After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's every turn. When Ruan Mei has Overtone, all allies' DMG increases by 35.2% and Weakness Break Efficiency increases by 50%."
          }
          130303: {
            Name: 'Petals to Stream, Repose in Dream'
            Desc: 'Increases All-Type RES PEN for all allies, and their attacks apply Thanatoplum Rebloom to enemies hit.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Ruan Mei deploys a Zone that lasts for 2 turns. The Zone's duration decreases by 1 at the start of her turn.\\nWhile inside the Zone, all allies' All-Type RES PEN increases by 25% and their attacks apply Thanatoplum Rebloom to the enemies hit.\\nWhen these enemies attempt to recover from Weakness Break, Thanatoplum Rebloom is triggered, extending the duration of their Weakness Break, delaying their action by an amount equal to 20% of Ruan Mei's Break Effect plus 10%, and dealing Break DMG equal to 50% of Ruan Mei's Ice Break DMG.\\nEnemy targets cannot have Thanatoplum Rebloom re-applied to them until they recover from Weakness Break."
            LongDescWithEidolon: "Ruan Mei deploys a Zone that lasts for 2 turns. The Zone's duration decreases by 1 at the start of her turn.\\nWhile inside the Zone, all allies' All-Type RES PEN increases by 27% and their attacks apply Thanatoplum Rebloom to the enemies hit.\\nWhen these enemies attempt to recover from Weakness Break, Thanatoplum Rebloom is triggered, extending the duration of their Weakness Break, delaying their action by an amount equal to 20% of Ruan Mei's Break Effect plus 10%, and dealing Break DMG equal to 54% of Ruan Mei's Ice Break DMG.\\nEnemy targets cannot have Thanatoplum Rebloom re-applied to them until they recover from Weakness Break."
          }
          130304: {
            Name: 'Somatotypical Helix'
            Desc: "Increases SPD for all allies (excluding this character). Breaking an enemy target's Weakness will additionally deal Ice Break DMG."
            Type: 'Talent'
            LongDescWithoutEidolon: "Increases SPD by 10% for the team (excluding this character). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to 120% of her Ice Break DMG."
            LongDescWithEidolon: "Increases SPD by 10.4% for the team (excluding this character). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to 132% of her Ice Break DMG."
          }
          130306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130307: {
            Name: 'Silken Serenade'
            Desc: 'The next time entering battle, automatically triggers the Skill for NaN time(s). After using the Technique, allies attacking enemies in Simulated Universe or Divergent Universe will always be regarded as attacking their Weakness to enter battle, and their Toughness is reduced regardless of Weakness types. For every Blessing in possession, increases Toughness Reduction and additionally deals Break DMG when breaking Weakness.'
            Type: 'Technique'
            LongDesc: "After using the Technique, gains Silken Serenade. At the start of the next battle, automatically triggers the Skill for 1 time(s) without consuming Skill Points.\\nIn Simulated Universe or Divergent Universe, when Ruan Mei has Silken Serenade, the team actively attacking enemies will always be regarded as attacking their Weakness to enter battle, and this attack can reduce all enemies' Toughness regardless of Weakness types. When breaking Weakness, triggers Weakness Break Effect corresponding to the attacker's Type. For every Blessing in possession (up to a max of 20 Blessings will be taken into account), additionally increases the Toughness Reduction of this attack by 100%. After breaking an enemy target's Weakness, additionally deals to the enemy target Break DMG equal to 100% of Ruan Mei's Ice Break DMG."
          }
        }
        Eidolons: {
          130301: {
            Name: 'Neuronic Embroidery'
            Desc: "While the Ultimate's Zone is deployed, the DMG dealt by all allies ignores 20% of the target's DEF."
          }
          130302: {
            Name: 'Reedside Promenade'
            Desc: 'With Ruan Mei on the field, all allies increase their ATK by 40% when dealing DMG to enemies with Weakness Break.'
          }
          130303: {
            Name: 'Viridescent Pirouette'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130304: {
            Name: 'Chatoyant Éclat'
            Desc: "When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by 100% for 3 turn(s)."
          }
          130305: {
            Name: 'Languid Barrette'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130306: {
            Name: 'Sash Cascade'
            Desc: "Extends the duration of the Ultimate's Zone by 1 turn(s). The Talent's Break DMG multiplier additionally increases by 200%."
          }
        }
        Effects: {
          10013031: {
            Name: 'Overtone'
            Desc: 'DMG dealt increases by {{parameter0}}%. Weakness Break Efficiency increases by {{parameter1}}%.'
            Effect: 'Boost DMG and Weakness Break Efficiency'
            Source: 1303
            ID: 10013031
          }
          10013032: {
            Name: 'Petals to Stream, Repose in Dream'
            Desc: 'All-Type RES PEN increases by {{parameter0}}%.'
            Effect: 'All-Type RES PEN Boost'
            Source: 1303
            ID: 10013032
          }
          10013033: {
            Name: 'Thanatoplum Rebloom'
            Desc: 'When enemy targets attempt to recover from the Weakness Break state, prolong the duration of their Weakness Break state and deal Ice Break DMG to them.'
            Effect: 'Weakness Break Extension'
            Source: 1303
            ID: 10013033
          }
          10013034: {
            Name: 'Silken Serenade'
            Desc: 'Increases ATK.'
            Effect: 'ATK Boost'
            Source: 1303
            ID: 10013034
          }
          10013035: {
            Name: 'Chatoyant Éclat'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 1303
            ID: 10013035
          }
          10013036: {
            Name: 'Days Wane, Thoughts Wax'
            Source: 1303
            ID: 10013036
          }
          10013037: {
            Name: 'Sash Cascade'
            Source: 1303
            ID: 10013037
          }
          10013038: {
            Name: 'Somatotypical Helix'
            Desc: 'Increases SPD by {{parameter0}}%.'
            Source: 1303
            ID: 10013038
          }
          10013039: {
            Name: 'Petals to Stream, Repose in Dream'
            Desc: 'All-Type RES PEN increases by {{parameter0}}%.'
            Effect: 'All-Type RES PEN Boost'
            Source: 1303
            ID: 10013039
          }
        }
        Traces: {
          A2: {
            Name: 'Inert Respiration'
            Desc: 'Increases Break Effect by 20% for all allies.'
            Owner: 1303
            ID: 1303101
            Ascension: 2
          }
          A4: {
            Name: 'Days Wane, Thoughts Wax'
            Desc: 'Ruan Mei regenerates 5 Energy at the start of her turn.'
            Owner: 1303
            ID: 1303102
            Ascension: 4
          }
          A6: {
            Name: 'Candle Lights on Still Waters'
            Desc: "In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%."
            Owner: 1303
            ID: 1303103
            Ascension: 6
          }
        }
      }
      1304: {
        Name: 'Aventurine'
        Abilities: {
          130401: {
            Name: 'Straight Bet'
            Desc: 'Deals minor Imaginary DMG to a single target enemy.'
            Type: 'Basic ATK'
          }
          130402: {
            Name: 'Cornerstone Deluxe'
            Desc: 'Provides all allies with a Fortified Wager shield, whose Shield effect is stackable.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Provides all allies with a Fortified Wager shield that can block DMG equal to 24% of Aventurine's DEF plus 320, lasting for 3 turn(s). When Fortified Wager is gained repeatedly, the Shield effect can stack, up to 200% of the current Shield effect provided by the Skill."
            LongDescWithEidolon: "Provides all allies with a Fortified Wager shield that can block DMG equal to 25.6% of Aventurine's DEF plus 356, lasting for 3 turn(s). When Fortified Wager is gained repeatedly, the Shield effect can stack, up to 200% of the current Shield effect provided by the Skill."
          }
          130403: {
            Name: 'Roulette Shark'
            Desc: 'Gains a random amount of Blind Bet points and inflicts Unnerved on a single enemy, dealing Imaginary DMG. When an ally hits an Unnerved enemy, the CRIT DMG dealt increases.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Randomly gains 1 to 7 points of Blind Bet. Then, inflicts Unnerved on a single target enemy for 3 turn(s) and deals Imaginary DMG equal to 270% of Aventurine's DEF to the single target enemy. When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by 15%."
            LongDescWithEidolon: "Randomly gains 1 to 7 points of Blind Bet. Then, inflicts Unnerved on a single target enemy for 3 turn(s) and deals Imaginary DMG equal to 291.6% of Aventurine's DEF to the single target enemy. When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by 16.2%."
          }
          130404: {
            Name: 'Shot Loaded Right'
            Desc: 'For any single ally with Fortified Wager, their Effect RES increases, and when they get attacked, Aventurine accumulates Blind Bet. When Aventurine has Fortified Wager, he can resist Crowd Control debuffs. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a follow-up attack that deals minor Imaginary DMG to random single enemy targets, bouncing a total of 7 times.'
            Type: 'Talent'
            LongDescWithoutEidolon: "For any single ally with Fortified Wager, their Effect RES increases by 50%, and when they get attacked, Aventurine gains 1 point of Blind Bet. When Aventurine has Fortified Wager, he can resist Crowd Control debuffs. This effect can trigger again after 2 turn(s). Aventurine additionally gains 1 point(s) of Blind Bet after getting attacked. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit follow-up attack, with each hit dealing Imaginary DMG equal to 25% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points."
            LongDescWithEidolon: "For any single ally with Fortified Wager, their Effect RES increases by 55%, and when they get attacked, Aventurine gains 1 point of Blind Bet. When Aventurine has Fortified Wager, he can resist Crowd Control debuffs. This effect can trigger again after 2 turn(s). Aventurine additionally gains 1 point(s) of Blind Bet after getting attacked. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit follow-up attack, with each hit dealing Imaginary DMG equal to 27.5% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points."
          }
          130406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130407: {
            Name: 'The Red or the Black'
            Desc: "Using the Technique randomly grants one out of the three DEF Boost effects with different buff values. After entering the next battle, increases all allies' DEF by the corresponding value."
            Type: 'Technique'
            LongDesc: "After using the Technique, 1 of the following effects will be granted:\\nThere is a chance for DEF to increase by 24%.\\nThere is a high chance for DEF to increase by 36%.\\nThere is a small chance for DEF to increase by 60%.\\n\\nWhen this Technique is used repeatedly, the acquired effect with the highest buff value is retained.\\nWhen the next battle starts, increases all allies' DEF by the corresponding value, lasting for 3 turn(s)."
          }
        }
        Eidolons: {
          130401: {
            Name: "Prisoner's Dilemma"
            Desc: 'Increases CRIT DMG by 20% for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).'
          }
          130402: {
            Name: 'Bounded Rationality'
            Desc: "When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turn(s)."
          }
          130403: {
            Name: 'Droprate Maxing'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130404: {
            Name: 'Unexpected Hanging Paradox'
            Desc: "When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by 3."
          }
          130405: {
            Name: 'Ambiguity Aversion'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130406: {
            Name: 'Stag Hunt Game'
            Desc: 'For every ally that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%.'
          }
        }
        Effects: {
          10013041: {
            Name: 'Unexpected Hanging Paradox'
            Desc: 'DEF increases by {{parameter0}}%'
            Effect: 'DEF Boost'
            Source: 1304
            ID: 10013041
          }
          10013042: {
            Name: 'Shot Loaded Right'
            Desc: "The Talent's Crowd Control debuff resist effect cannot be triggered yet."
            Source: 1304
            ID: 10013042
          }
          10013043: {
            Name: 'Leverage'
            Desc: 'Increases CRIT Rate by {{parameter0}}%.'
            Source: 1304
            ID: 10013043
          }
          10013044: {
            Name: 'Fortified Wager: Spades'
            Desc: "Gains a Shield that absorbs DMG and increases Effect RES by {{parameter0}}%. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 2 points of Blind Bet."
            Effect: 'Shield'
            Source: 1304
            ID: 10013044
          }
          10013045: {
            Name: 'Fortified Wager: Hearts'
            Desc: "Gains a Shield that absorbs DMG and increases Effect RES by {{parameter0}}%. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet."
            Effect: 'Shield'
            Source: 1304
            ID: 10013045
          }
          10013046: {
            Name: 'Fortified Wager: Diamonds'
            Desc: "Gains a Shield that absorbs DMG and increases Effect RES by {{parameter0}}%. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet."
            Effect: 'Shield'
            Source: 1304
            ID: 10013046
          }
          10013047: {
            Name: 'Fortified Wager: Clubs'
            Desc: "Gains a Shield that absorbs DMG and increases Effect RES by {{parameter0}}%. While the Shield persists or before the effect disappears, enemy attacks will not reduce the Shielded characters' HP. After these characters receive DMG, Aventurine receives 1 point of Blind Bet."
            Effect: 'Shield'
            Source: 1304
            ID: 10013047
          }
          10013048: {
            Name: 'Bingo!'
            Desc: 'After an ally with Fortified Wager uses a follow-up attack, Aventurine gains 1 Blind Bet. This effect can be triggered {{parameter0}} more time(s).'
            Source: 1304
            ID: 10013048
          }
          10013049: {
            Name: 'Stag Hunt Game'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Source: 1304
            ID: 10013049
          }
        }
        Traces: {
          A2: {
            Name: 'Leverage'
            Desc: "For every 100 of Aventurine's DEF that exceeds 1600, increases his own CRIT Rate by 2%, up to a maximum increase of 48%."
            Owner: 1304
            ID: 1304101
            Ascension: 2
          }
          A4: {
            Name: 'Hot Hand'
            Desc: 'When battle starts, grants all allies a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).'
            Owner: 1304
            ID: 1304102
            Ascension: 4
          }
          A6: {
            Name: 'Bingo!'
            Desc: "After an ally with Fortified Wager launches a follow-up attack, Aventurine accumulates 1 Blind Bet point. This effect can trigger up to 3 time(s). Its trigger count resets at the start of Aventurine's turn. After Aventurine launches his Talent's follow-up attack, provides all allies with a Fortified Wager that can block DMG equal to 7.2% of Aventurine's DEF plus 96, and additionally grants a Fortified Wager that can block DMG equal to 7.2% of Aventurine's DEF plus 96 to the ally with the lowest Shield effect, lasting for 3 turns."
            Owner: 1304
            ID: 1304103
            Ascension: 6
          }
        }
      }
      1305: {
        Name: 'Dr. Ratio'
        Abilities: {
          130501: {
            Name: 'Mind is Might'
            Desc: 'Deals minor Imaginary DMG to a single target enemy.'
            Type: 'Basic ATK'
          }
          130502: {
            Name: 'Intellectual Midwifery'
            Desc: 'Deals Imaginary DMG to a single enemy.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 150% of Dr. Ratio's ATK to a single target enemy."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 165% of Dr. Ratio's ATK to a single target enemy."
          }
          130503: {
            Name: 'Syllogistic Paradox'
            Desc: "Deals Imaginary DMG to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches 1 follow-up attack on this target."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 240% of Dr. Ratio's ATK to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches his Talent's follow-up attack for 1 time against this target.\\nWiseman's Folly can be triggered for up to 2 times and only affects the most recent target of Dr. Ratio's Ultimate. This trigger count resets after Dr. Ratio's Ultimate is used."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 259.2% of Dr. Ratio's ATK to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's allies attack a target afflicted with Wiseman's Folly, Dr. Ratio launches his Talent's follow-up attack for 1 time against this target.\\nWiseman's Folly can be triggered for up to 2 times and only affects the most recent target of Dr. Ratio's Ultimate. This trigger count resets after Dr. Ratio's Ultimate is used."
          }
          130504: {
            Name: 'Cogito, Ergo Sum'
            Desc: 'When using the Skill, there is a chance of launching a follow-up attack against the target for 1 time.'
            Type: 'Talent'
            LongDescWithoutEidolon: "When using his Skill, Dr. Ratio has a 40% fixed chance of launching a follow-up attack against his target for 1 time, dealing Imaginary DMG equal to 270% of Dr. Ratio's ATK. For each debuff the target enemy has, the fixed chance of launching follow-up attack increases by 20%. If the target enemy is defeated before the follow-up attack triggers, the follow-up attack will be directed at a single random enemy instead."
            LongDescWithEidolon: "When using his Skill, Dr. Ratio has a 40% fixed chance of launching a follow-up attack against his target for 1 time, dealing Imaginary DMG equal to 297% of Dr. Ratio's ATK. For each debuff the target enemy has, the fixed chance of launching follow-up attack increases by 20%. If the target enemy is defeated before the follow-up attack triggers, the follow-up attack will be directed at a single random enemy instead."
          }
          130506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130507: {
            Name: 'Mold of Idolatry'
            Desc: 'Creates a Special Dimension. Enemies within the dimension are Taunted. After entering battle with enemies in this dimension, there is a high chance to reduce SPD of enemy targets.'
            Type: 'Technique'
            LongDesc: "After using Technique, creates a Special Dimension that Taunts nearby enemies, lasting for 10 second(s). After entering battle with enemies in this Special Dimension, there is a 100% base chance to reduce each single enemy target's SPD by 15% for 2 turn(s). Only 1 dimension created by allies can exist at the same time."
          }
        }
        Eidolons: {
          130501: {
            Name: 'Pride Comes Before a Fall'
            Desc: 'The maximum stackable count for the Trace "Summation" increases by 4. When a battle begins, immediately obtains 4 stacks of Summation. Needs to unlock Summation first.'
          }
          130502: {
            Name: 'The Divine Is in the Details'
            Desc: "When his Talent's follow-up attack hits a target, for every debuff the target has, deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 time(s) during each follow-up attack."
          }
          130503: {
            Name: 'Know Thyself'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130504: {
            Name: 'Ignorance Is Blight'
            Desc: 'When triggering the Talent, additionally regenerates 15 Energy for Dr. Ratio.'
          }
          130505: {
            Name: 'Sic Itur Ad Astra'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130506: {
            Name: 'Vincit Omnia Veritas'
            Desc: "Additionally increases the triggerable count for Wiseman's Folly by 1. The DMG dealt by the Talent's follow-up attack increases by 50%."
          }
        }
        Effects: {
          10013051: {
            Name: 'SPD Boost'
            Desc: 'Each stack increases SPD by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1305
            ID: 10013051
          }
          10013052: {
            Name: 'ATK Boost'
            Desc: 'Each stack increases ATK by >{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 1305
            ID: 10013052
          }
          10013053: {
            Name: 'CRIT Rate Boost'
            Desc: 'Each stack increases CRIT Rate by {{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1305
            ID: 10013053
          }
          10013054: {
            Name: 'CRIT DMG Boost'
            Desc: 'Each stack increases CRIT DMG by {{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1305
            ID: 10013054
          }
          10013055: {
            Name: 'Effect RES Reduction'
            Desc: 'Effect RES reduces by {{parameter0}}%.'
            Effect: 'Effect RES Reduction'
            Source: 1305
            ID: 10013055
          }
          10013056: {
            Name: 'SPD Reduction'
            Desc: 'Decreases SPD by {{parameter0}}%.'
            Effect: 'SPD Reduction'
            Source: 1305
            ID: 10013056
          }
          10013057: {
            Name: "Wiseman's Folly"
            Desc: "After a target with Wiseman's Folly is attacked by Dr. Ratio's teammate(s), Dr. Ratio immediately launches a follow-up attack once against this target. This effect can be triggered for a maximum of {{parameter0}} times."
            Effect: "Wiseman's Folly"
            Source: 1305
            ID: 10013057
          }
          10013058: {
            Name: 'Rationalism'
            Desc: 'Increases DMG dealt to enemies with debuffs by {{parameter0}}%.'
            Source: 1305
            ID: 10013058
          }
          10013059: {
            Name: 'Summation'
            Desc: 'Every stack increases CRIT Rate by {{parameter0}}% and CRIT DMG by {{parameter1}}%.'
            Source: 1305
            ID: 10013059
          }
        }
        Traces: {
          A2: {
            Name: 'Summation'
            Desc: 'When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by 2.5% and CRIT DMG by 5%. This effect can stack up to 6 time(s).'
            Owner: 1305
            ID: 1305101
            Ascension: 2
          }
          A4: {
            Name: 'Inference'
            Desc: "When Skill is used to attack an enemy target, there is a 100% base chance to reduce the attacked target's Effect RES by 10% for 2 turn(s)."
            Owner: 1305
            ID: 1305102
            Ascension: 4
          }
          A6: {
            Name: 'Deduction'
            Desc: 'When dealing DMG to a target that has 3 or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by 10%, up to a maximum increase of 50%.'
            Owner: 1305
            ID: 1305103
            Ascension: 6
          }
        }
      }
      1306: {
        Name: 'Sparkle'
        Abilities: {
          130601: {
            Name: 'Monodrama'
            Desc: 'Deals minor Quantum DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130602: {
            Name: 'Dreamdiver'
            Desc: "Increases an ally's CRIT DMG and Advances Forward their action."
            Type: 'Skill'
            LongDescWithoutEidolon: "Increases the CRIT DMG of a single target ally by 24% of Sparkle's CRIT DMG plus 45%, lasting for 1 turn(s). And at the same time, Advances Forward this ally's action by 50%.\\nWhen Sparkle uses this ability on herself, the Action Advance effect will not trigger."
            LongDescWithEidolon: "Increases the CRIT DMG of a single target ally by 26.4% of Sparkle's CRIT DMG plus 48.6%, lasting for 1 turn(s). And at the same time, Advances Forward this ally's action by 50%.\\nWhen Sparkle uses this ability on herself, the Action Advance effect will not trigger."
          }
          130603: {
            Name: 'The Hero with a Thousand Faces'
            Desc: "Recovers Skill Points for the team, and enables the DMG Boost provided by Sparkle's Talent to be additionally enhanced."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Recovers 4 Skill Points for the team and grants all allies Cipher. For allies with Cipher, each stack of the DMG Boost effect provided by Sparkle's Talent additionally increases by 10%, lasting for 2 turns."
            LongDescWithEidolon: "Recovers 4 Skill Points for the team and grants all allies Cipher. For allies with Cipher, each stack of the DMG Boost effect provided by Sparkle's Talent additionally increases by 10.8%, lasting for 2 turns."
          }
          130604: {
            Name: 'Red Herring'
            Desc: "Increases the team's Max Skill Points. Whenever an ally consumes Skill Points, enables all allies to deal more damage."
            Type: 'Talent'
            LongDescWithoutEidolon: "While Sparkle is on the battlefield, additionally increases the max number of Skill Points by 2. Whenever an ally consumes 1 Skill Point, all allies' DMG dealt increases by 6%. This effect lasts for 2 turn(s) and can stack up to 3 time(s)."
            LongDescWithEidolon: "While Sparkle is on the battlefield, additionally increases the max number of Skill Points by 2. Whenever an ally consumes 1 Skill Point, all allies' DMG dealt increases by 6.6%. This effect lasts for 2 turn(s) and can stack up to 3 time(s)."
          }
          130606: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130607: {
            Name: 'Unreliable Narrator'
            Desc: 'Using the Technique grants all allies Misdirect. Characters with Misdirect will not be detected by enemies, and entering battle while in Misdirect recovers Skill Points for allies.'
            Type: 'Technique'
            LongDesc: 'Using the Technique grants all allies Misdirect for 20 seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers 3 Skill Point(s) for the team.'
          }
        }
        Eidolons: {
          130601: {
            Name: 'Suspension of Disbelief'
            Desc: 'The Cipher effect granted by the Ultimate lasts for 1 extra turn. All allies with Cipher have their ATK increased by 40%.'
          }
          130602: {
            Name: 'Purely Fictitious'
            Desc: "Every stack of the Talent's effect allows allies to additionally ignore 8% of the target's DEF when dealing DMG."
          }
          130603: {
            Name: 'Pipedream'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130604: {
            Name: 'Life Is a Gamble'
            Desc: 'The Ultimate recovers 1 more Skill Point. The Talent additionally increases the Max Skill Points by 1.'
          }
          130605: {
            Name: 'Parallax Truth'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130606: {
            Name: 'Narrative Polysemy'
            Desc: "The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to 30% of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all allies with Cipher. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to allies with Cipher."
          }
        }
        Effects: {
          10013061: {
            Name: 'Dreamdiver'
            Desc: 'Increase CRIT DMG by {{parameter0}}%.'
            Source: 1306
            ID: 10013061
          }
          10013062: {
            Name: 'Cipher'
            Desc: "Additionally enhances the DMG Boost effect provided by each stack of Sparkle's talent by #2[f1]%."
            Effect: 'Cipher'
            Source: 1306
            ID: 10013062
          }
          10013063: {
            Name: 'Dreamdiver'
            Desc: 'Increase CRIT DMG by {{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1306
            ID: 10013063
          }
          10013064: {
            Name: 'Red Herring'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1306
            ID: 10013064
          }
          10013065: {
            Name: 'Nocturne'
            Desc: 'Increases ATK by {{parameter0}}%.'
            Effect: 'Nocturne'
            Source: 1306
            ID: 10013065
          }
          10013066: {
            Source: 1306
            ID: 10013066
          }
          10013067: {
            Source: 1306
            ID: 10013067
          }
        }
        Traces: {
          A2: {
            Name: 'Almanac'
            Desc: 'When using Basic ATK, additionally regenerates 10 Energy.'
            Owner: 1306
            ID: 1306101
            Ascension: 2
          }
          A4: {
            Name: 'Artificial Flower'
            Desc: "The CRIT DMG Boost effect provided by the Skill will be extended until the start of the target's next turn."
            Owner: 1306
            ID: 1306102
            Ascension: 4
          }
          A6: {
            Name: 'Nocturne'
            Desc: "Increases all allies' ATK by 15%. When there are 1/2/3 Quantum-Type allies in the team, additionally increases Quantum-Type allies' ATK by 5%/15%/30%."
            Owner: 1306
            ID: 1306103
            Ascension: 6
          }
        }
      }
      1307: {
        Name: 'Black Swan'
        Abilities: {
          130701: {
            Name: 'Percipience, Silent Dawn'
            Desc: 'Deals minor Wind DMG to a single enemy and has a chance of applying Arcana to the target. After attacking a target that suffers Wind Shear, Bleed, Burn, or Shock, there is respectively a chance of additionally applying Arcana.'
            Type: 'Basic ATK'
          }
          130702: {
            Name: 'Decadence, False Twilight'
            Desc: 'Deals minor Wind DMG to a single enemy target and any adjacent targets, with a high chance of inflicting Arcana on the targets and lowering their DEF.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Wind DMG equal to 90% of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a 100% base chance of inflicting 1 stack of Arcana on the target enemy and the adjacent targets. Additionally, there is a 100% base chance of reducing the DEF of the target enemy and the adjacent targets by 20.8%, lasting for 3 turn(s)."
            LongDescWithEidolon: "Deals Wind DMG equal to 99% of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a 100% base chance of inflicting 1 stack of Arcana on the target enemy and the adjacent targets. Additionally, there is a 100% base chance of reducing the DEF of the target enemy and the adjacent targets by 22%, lasting for 3 turn(s)."
          }
          130703: {
            Name: "Bliss of Otherworld's Embrace"
            Desc: 'Inflicts Epiphany on all enemies, increasing the DMG the targets take in their turn. Additionally, having Arcana is regarded as having Wind Shear, Bleed, Burn, and Shock. Furthermore, Arcana will not reset its stacks after causing DMG at the start of the next turn. Deals Wind DMG to all enemies.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Inflicts Epiphany on all enemies for 2 turn(s).\\nWhile afflicted with Epiphany, enemies take 25% increased DMG in their turn. Additionally, if enemies are also inflicted with Arcana, they are considered to be simultaneously afflicted with Wind Shear, Bleed, Burn, and Shock. After Arcana causes DMG at the start of each turn, its stacks are not reset. This non-reset effect of Arcana stacks can be triggered up to 1 time(s) for the duration of Epiphany. And the trigger count resets when Epiphany is applied again.\\nDeals Wind DMG equal to 120% of Black Swan's ATK to all enemies."
            LongDescWithEidolon: "Inflicts Epiphany on all enemies for 2 turn(s).\\nWhile afflicted with Epiphany, enemies take 27% increased DMG in their turn. Additionally, if enemies are also inflicted with Arcana, they are considered to be simultaneously afflicted with Wind Shear, Bleed, Burn, and Shock. After Arcana causes DMG at the start of each turn, its stacks are not reset. This non-reset effect of Arcana stacks can be triggered up to 1 time(s) for the duration of Epiphany. And the trigger count resets when Epiphany is applied again.\\nDeals Wind DMG equal to 129.6% of Black Swan's ATK to all enemies."
          }
          130704: {
            Name: "Loom of Fate's Caprice"
            Desc: 'When an enemy target receives DoT at the start of each turn, there is a chance for it to be inflicted with Arcana. They receive Wind DoT at the start of the turn, and Black Swan triggers additional effects based on the number of Arcana stacks.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Every time an enemy target receives DoT at the start of each turn, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.\\nWhile afflicted with Arcana, enemy targets receive Wind DoT equal to 240% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DMG multiplier by 12%. Then Arcana resets to 1 stack. Arcana can stack up to 50 times.\\nOnly when Arcana causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of Arcana stacks inflicted on the target:\\nWhen there are 3 or more Arcana stacks, deals Wind DoT equal to 180% of Black Swan's ATK to adjacent targets, with a 65% base chance of inflicting 1 stack of Arcana on adjacent targets.\\nWhen there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF."
            LongDescWithEidolon: "Every time an enemy target receives DoT at the start of each turn, there is a 68% base chance for it to be inflicted with 1 stack of Arcana.\\nWhile afflicted with Arcana, enemy targets receive Wind DoT equal to 264% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DMG multiplier by 13.2%. Then Arcana resets to 1 stack. Arcana can stack up to 50 times.\\nOnly when Arcana causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of Arcana stacks inflicted on the target:\\nWhen there are 3 or more Arcana stacks, deals Wind DoT equal to 198% of Black Swan's ATK to adjacent targets, with a 68% base chance of inflicting 1 stack of Arcana on adjacent targets.\\nWhen there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF."
          }
          130706: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130707: {
            Name: 'From Façade to Vérité'
            Desc: 'After this Technique is used, at the start of the next battle, there is a high chance for each enemy to be inflicted with Arcana repeatedly until Arcana fails to be inflicted.'
            Type: 'Technique'
            LongDesc: 'After this Technique is used, there is a 150% base chance for each enemy to be inflicted with 1 stack of Arcana at the start of the next battle. For each successful application of Arcana on a target, inflicts another stack of Arcana on the same target. This process repeats until Arcana fails to be inflicted on this target. For each successive application of Arcana on a target, its base chance of success is equal to 50% of the base chance of the previous successful infliction of Arcana on that target.'
          }
        }
        Eidolons: {
          130701: {
            Name: 'Seven Pillars of Wisdom'
            Desc: 'While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%.'
          }
          130702: {
            Name: 'Weep Not For Me, My Lamb'
            Desc: 'When an enemy target afflicted with Arcana is defeated, there is a 100% base chance of inflicting 6 stack(s) of Arcana on adjacent targets.'
          }
          130703: {
            Name: 'As Above, So Below'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130704: {
            Name: 'In Tears We Gift'
            Desc: "While in the Epiphany state, enemy targets have their Effect RES reduced by 10% and Black Swan regenerates 8 Energy at the start of these targets' turns or when they are defeated. This Energy Regeneration effect can only trigger up to 1 time while Epiphany lasts. The trigger count is reset when Epiphany is applied again."
          }
          130705: {
            Name: 'Linnutee Flyway'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130706: {
            Name: 'Pantheon Merciful, Masses Pitiful'
            Desc: "When an enemy target gets attacked by Black Swan's allies, Black Swan has a 65% base chance of inflicting 1 stack of Arcana on the target.\\nEvery time Black Swan inflicts Arcana on an enemy target, there is a 50% fixed chance to additionally increase the number of Arcana stacked this time by 1."
          }
        }
        Effects: {
          10013071: {
            Name: 'Arcana'
            Desc: 'Takes Wind DMG at the start of each turn. Being afflicted with Arcana will also be considered as suffering from Wind Shear. This state stacks up to {{parameter0}} times.'
            Effect: 'Arcana'
            Source: 1307
            ID: 10013071
          }
          10013072: {
            Name: 'Epiphany'
            Desc: "The DMG received increases by {{parameter0}}% during this unit's turn. While in Arcana state, this unit is also considered to be simultaneously inflicted with Wind Shear, Bleed, Burn, and Shock. Additionally, after Arcana causes DMG at the start of each turn, its stacks do not reset. This effect can trigger #3[i] more time(s)."
            Effect: 'Epiphany'
            Source: 1307
            ID: 10013072
          }
          10013073: {
            Name: 'Decadence, False Twilight'
            Desc: 'DEF -{{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1307
            ID: 10013073
          }
          10013074: {
            Name: 'Seven Pillars of Wisdom'
            Desc: 'Wind RES -{{parameter0}}%.'
            Source: 1307
            ID: 10013074
          }
          10013075: {
            Name: 'Seven Pillars of Wisdom'
            Desc: 'Physical RES -{{parameter0}}%.'
            Source: 1307
            ID: 10013075
          }
          10013076: {
            Name: 'Seven Pillars of Wisdom'
            Desc: 'Fire RES -{{parameter0}}%.'
            Source: 1307
            ID: 10013076
          }
          10013077: {
            Name: 'Seven Pillars of Wisdom'
            Desc: 'Lightning RES -{{parameter0}}%.'
            Source: 1307
            ID: 10013077
          }
        }
        Traces: {
          A2: {
            Name: "Viscera's Disquiet"
            Desc: 'After using the Skill to attack a single target enemy that has Wind Shear, Bleed, Burn, or Shock, each of these debuffs respectively has a 65% base chance of inflicting 1 extra stack of Arcana.'
            Owner: 1307
            ID: 1307101
            Ascension: 2
          }
          A4: {
            Name: "Goblet's Dredges"
            Desc: 'When an enemy target enters battle, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.\\nEvery time an enemy target receives DoT during a single attack by an ally, there is a 65% base chance for the target to be inflicted with 1 stack of Arcana. The maximum number of stacks that can be inflicted during 1 single attack is 3.'
            Owner: 1307
            ID: 1307102
            Ascension: 4
          }
          A6: {
            Name: "Candleflame's Portent"
            Desc: "Increases this unit's DMG by an amount equal to 60% of Effect Hit Rate, up to a maximum DMG increase of 72%."
            Owner: 1307
            ID: 1307103
            Ascension: 6
          }
        }
      }
      1308: {
        Name: 'Acheron'
        Abilities: {
          130801: {
            Name: 'Trilateral Wiltcross'
            Desc: 'Deals minor Lightning DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130802: {
            Name: 'Octobolt Flash'
            Desc: 'Gains NaN point(s) of Slashed Dream. Inflicts NaN stack(s) of Crimson Knot on a single enemy, dealing Lightning DMG to this target, as well as minor Lightning DMG to adjacent targets.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Gains 1 point(s) of Slashed Dream. Inflicts 1 stack(s) of Crimson Knot on a single target enemy, dealing Lightning DMG equal to 160% of Acheron's ATK to this target, as well as Lightning DMG equal to 60% of Acheron's ATK to adjacent targets."
            LongDescWithEidolon: "Gains 1 point(s) of Slashed Dream. Inflicts 1 stack(s) of Crimson Knot on a single target enemy, dealing Lightning DMG equal to 176% of Acheron's ATK to this target, as well as Lightning DMG equal to 66% of Acheron's ATK to adjacent targets."
          }
          130803: {
            Name: 'Slashed Dream Cries in Red'
            Desc: 'Deals 3 hits of minor Lightning DMG to a single enemy. If Crimson Knot is removed from the target, then deals minor Lightning DMG to all enemies. Finally, deals 1 hit of Lightning DMG to all enemies and removes all Crimson Knots.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Sequentially unleash Rainblade 3 times and Stygian Resurge 1 time, dealing Lightning DMG up to 372% of Acheron's ATK to a single target enemy, as well as Lightning DMG up to 300% of Acheron's ATK to other targets.\\n\\nRainblade: Deals Lightning DMG equal to 24% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to 15% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, this DMG Multiplier is additionally increased, up to a maximum of 60%.\\n\\nStygian Resurge: Deals Lightning DMG equal to 120% of Acheron's ATK to all enemies and remove all Crimson Knots.\\n\\nCrimson Knot cannot be applied to enemies during the Ultimate."
            LongDescWithEidolon: "Sequentially unleash Rainblade 3 times and Stygian Resurge 1 time, dealing Lightning DMG up to 401.76% of Acheron's ATK to a single target enemy, as well as Lightning DMG up to 324% of Acheron's ATK to other targets.\\n\\nRainblade: Deals Lightning DMG equal to 25.92% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to 16.2% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, this DMG Multiplier is additionally increased, up to a maximum of 64.8%.\\n\\nStygian Resurge: Deals Lightning DMG equal to 129.6% of Acheron's ATK to all enemies and remove all Crimson Knots.\\n\\nCrimson Knot cannot be applied to enemies during the Ultimate."
          }
          130804: {
            Name: 'Atop Rainleaf Hangs Oneness'
            Desc: "When Slashed Dream reaches its upper limit, the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES.\\nWhen any unit inflicts debuffs on an enemy target while using their ability, Acheron gains Slashed Dream and inflicts Crimson Knot on an enemy target."
            Type: 'Talent'
            LongDescWithoutEidolon: "When Slashed Dream reaches 9 point(s), the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES by 20%, lasting until the end of the Ultimate.\\nWhen any unit inflicts debuffs on an enemy target while using their ability, Acheron gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on a target. If debuffs are inflicted on multiple targets, then the 1 stack of Crimson Knot will be inflicted on the enemy target with the most Crimson Knot stacks. This effect can only trigger once for every ability use.\\nAfter an enemy target exits the field or gets defeated by any unit while Acheron is on the field, their Crimson Knot stacks will be transferred to the enemy target with the most Crimson Knot stacks on the whole field."
            LongDescWithEidolon: "When Slashed Dream reaches 9 point(s), the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES by 22%, lasting until the end of the Ultimate.\\nWhen any unit inflicts debuffs on an enemy target while using their ability, Acheron gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on a target. If debuffs are inflicted on multiple targets, then the 1 stack of Crimson Knot will be inflicted on the enemy target with the most Crimson Knot stacks. This effect can only trigger once for every ability use.\\nAfter an enemy target exits the field or gets defeated by any unit while Acheron is on the field, their Crimson Knot stacks will be transferred to the enemy target with the most Crimson Knot stacks on the whole field."
          }
          130806: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130807: {
            Name: 'Quadrivalent Ascendance'
            Desc: 'Attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG to all enemies and reducing Toughness regardless of Weakness Types.\\nIf attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed.'
            Type: 'Technique'
            LongDesc: "Immediately attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG equal to 200% of Acheron's ATK to all enemies and reducing Toughness of all enemies irrespective of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.\\nQuadrivalent Ascendance: After using the Ultimate, Acheron gains 1 point(s) of Slashed Dream and inflicts 1 stack(s) of Crimson Knot on a single random enemy.\\nIf attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed."
          }
        }
        Eidolons: {
          130801: {
            Name: 'Silenced Sky Spake Sooth'
            Desc: 'When dealing DMG to debuffed enemies, increases the CRIT Rate by 18%.'
          }
          130802: {
            Name: 'Mute Thunder in Still Tempest'
            Desc: "The number of Nihility characters required for the Trace \"The Abyss\" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks."
          }
          130803: {
            Name: 'Frost Bites in Death'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          130804: {
            Name: 'Shrined Fire for Mirrored Soul'
            Desc: 'When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%.'
          }
          130805: {
            Name: 'Strewn Souls on Erased Earths'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130806: {
            Name: 'Apocalypse, the Emancipator'
            Desc: 'Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.'
          }
        }
        Effects: {
          10013081: {
            Name: 'Crimson Knot'
            Desc: "When removed, immediately deals Lightning DMG equal to {{parameter0}}% of Acheron's ATK to all enemies once. For every stack of Crimson Knot removed, this DMG multiplier additionally increases, up to a maximum of {{parameter1}}%."
            Effect: 'Crimson Knot'
            Source: 1308
            ID: 10013081
          }
          10013082: {
            Name: 'All-Type RES Reduction'
            Desc: 'Reduces All-Type RES by {{parameter0}}%, lasting till the end of the Ultimate.'
            Effect: 'All-Type RES Reduction'
            Source: 1308
            ID: 10013082
          }
          10013083: {
            Name: 'Thunder Core'
            Desc: 'Each stack increases DMG dealt by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'DMG Boost'
            Source: 1308
            ID: 10013083
          }
          10013084: {
            Name: 'Ultimate DMG Vulnerability'
            Desc: 'Increases Ultimate DMG received by {{parameter0}}%.'
            Effect: 'Ultimate DMG Vulnerability'
            Source: 1308
            ID: 10013084
          }
          10013085: {
            Name: 'Quadrivalent Ascendance'
            Desc: 'Acheron obtains {{parameter0}} point(s) of Slashed Dream after she uses her Ultimate, and applies {{parameter0}} stack(s) of Crimson Knot on a random enemy.'
            Source: 1308
            ID: 10013085
          }
          10013086: {
            Name: 'Quadrivalent Ascendance'
            Desc: 'After using the Ultimate, gains Slashed Dream by an amount equal to the number of Quadrivalent Ascendance stacks. At the same time, applies a corresponding number of Crimson Knot stacks to a random enemy. This effect stacks up to {{parameter0}} time(s).'
            Source: 1308
            ID: 10013086
          }
        }
        Traces: {
          A2: {
            Name: 'Red Oni'
            Desc: 'When battle starts, immediately gains 5 point(s) of Slashed Dream and applies 5 stack(s) of Crimson Knot to a random enemy. When Slashed Dream reaches its upper limit, for every point of Slashed Dream that exceeds the limit, gains 1 stack of Quadrivalent Ascendance. Enables Quadrivalent Ascendance to stack up to 3 time(s).'
            Owner: 1308
            ID: 1308101
            Ascension: 2
          }
          A4: {
            Name: 'The Abyss'
            Desc: "When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to 115% or 160% of the original DMG respectively."
            Owner: 1308
            ID: 1308102
            Ascension: 4
          }
          A6: {
            Name: 'Thunder Core'
            Desc: "When the Ultimate's Rainblade hits enemy targets that have Crimson Knot, the DMG dealt by Acheron increases by 30%, stacking up to 3 time(s) and lasting for 3 turn(s). And when Stygian Resurge triggers, additionally deals DMG for 6 times. Each time deals Lightning DMG equal to 25% of Acheron's ATK to a single random enemy and is considered as Ultimate DMG."
            Owner: 1308
            ID: 1308103
            Ascension: 6
          }
        }
      }
      1309: {
        Name: 'Robin'
        Abilities: {
          130901: {
            Name: 'Wingflip White Noise'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          130902: {
            Name: "Pinion's Aria"
            Desc: 'Increases DMG dealt by all allies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Increase DMG dealt by all allies by 50%, lasting for 3 turn(s). This duration decreases by 1 at the start of Robin's every turn."
            LongDescWithEidolon: "Increase DMG dealt by all allies by 55%, lasting for 3 turn(s). This duration decreases by 1 at the start of Robin's every turn."
          }
          130903: {
            Name: 'Vox Harmonique, Opus Cosmique'
            Desc: "Enters the Concerto state, increases all allies' ATK, and causes all teammates to immediately take action. After an attack, Robin deals Additional Physical DMG. While Concerto lasts, Robin is immune to Crowd Control debuffs. Before Concerto ends, Robin won't take turn or action, lasting until the end of the countdown."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Robin enters the Concerto state and makes all other allies immediately take action.\\nWhile in the Concerto state, increases all allies' ATK by 22.8% of Robin's ATK plus 200. Moreover, after every attack by allies, Robin deals Additional Physical DMG equal to 120% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%.\\nWhile in the Concerto state, Robin is immune to Crowd Control debuffs and cannot enter her turn or take action until the Concerto state ends.\\nA Concerto countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the Concerto state and immediately takes action. The countdown has its own fixed SPD of 90."
            LongDescWithEidolon: "Robin enters the Concerto state and makes all other allies immediately take action.\\nWhile in the Concerto state, increases all allies' ATK by 24.32% of Robin's ATK plus 230. Moreover, after every attack by allies, Robin deals Additional Physical DMG equal to 129.6% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%.\\nWhile in the Concerto state, Robin is immune to Crowd Control debuffs and cannot enter her turn or take action until the Concerto state ends.\\nA Concerto countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the Concerto state and immediately takes action. The countdown has its own fixed SPD of 90."
          }
          130904: {
            Name: 'Tonal Resonance'
            Desc: "Increase all allies' CRIT DMG, and Robin additionally regenerates Energy after allies attack enemies."
            Type: 'Talent'
            LongDescWithoutEidolon: "Increase all allies' CRIT DMG by 20%. Moreover, after allies attack enemy targets, Robin additionally regenerates 2 Energy for herself."
            LongDescWithEidolon: "Increase all allies' CRIT DMG by 23%. Moreover, after allies attack enemy targets, Robin additionally regenerates 2 Energy for herself."
          }
          130906: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          130907: {
            Name: 'Overture of Inebriation'
            Desc: 'Creates a Special Dimension around the character. Enemies within this dimension will not attack Robin. After entering battle while the dimension is active, Robin additionally regenerates NaN Energy at the start of each wave.'
            Type: 'Technique'
            LongDesc: 'After using Technique, creates a Special Dimension around the character that lasts for 15 seconds. Enemies within this dimension will not attack Robin and will follow Robin while the dimension is active. After entering battle while the dimension is active, Robin regenerates 5 Energy at the start of each wave. Only 1 dimension created by allies can exist at the same time.'
          }
        }
        Eidolons: {
          130901: {
            Name: 'Land of Smiles'
            Desc: "While the Concerto state is active, all allies' All-Type RES PEN increases by 24%."
          }
          130902: {
            Name: 'Afternoon Tea For Two'
            Desc: "While the Concerto state is active, all allies' SPD increases by 16%. The Talent's Energy Regeneration effect additionally increases by 1."
          }
          130903: {
            Name: 'Inverted Tuning'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nUltimate Lv. +2, up to a maximum of Lv. 15.'
          }
          130904: {
            Name: 'Raindrop Key'
            Desc: 'When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by 50%.'
          }
          130905: {
            Name: "Lonestar's Lament"
            Desc: 'Basic ATK Lv. +1, up to a maximum of Lv. 10.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          130906: {
            Name: 'Moonless Midnight'
            Desc: 'While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by 450%. The effect of Moonless Midnight can trigger up to 8 time(s). And the trigger count resets each time the Ultimate is used.'
          }
        }
        Effects: {
          10013091: {
            Name: 'Aria'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1309
            ID: 10013091
          }
          10013092: {
            Name: 'Aria'
            Desc: 'DMG dealt increases by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1309
            ID: 10013092
          }
          10013093: {
            Name: 'Concerto'
            Desc: 'Increases ATK by {{parameter0}} and becomes immune to Crowd Control debuffs.'
            Effect: 'ATK Boost, immune to Crowd Control debuffs'
            Source: 1309
            ID: 10013093
          }
          10013094: {
            Name: 'Concerto'
            Desc: 'Increases ATK by {{parameter0}}. Robin deals Additional DMG after attacking.'
            Effect: 'ATK Boost'
            Source: 1309
            ID: 10013094
          }
          10013095: {
            Name: 'Impromptu Flourish'
            Desc: 'Increases follow-up attack CRIT DMG by {{parameter0}}%.'
            Effect: 'CRIT DMG Boost'
            Source: 1309
            ID: 10013095
          }
          10013096: {
            Name: 'Land of Smiles'
            Desc: 'Increases All-Type RES PEN by {{parameter0}}%.'
            Effect: 'All-Type RES PEN Boost'
            Source: 1309
            ID: 10013096
          }
          10013097: {
            Name: 'Afternoon Tea For Two'
            Desc: 'SPD increases by {{parameter0}}%.'
            Effect: 'SPD Boost'
            Source: 1309
            ID: 10013097
          }
          10013098: {
            Name: 'Tonal Resonance'
            Desc: 'CRIT DMG increases by {{parameter0}}%.'
            Source: 1309
            ID: 10013098
          }
          10013099: {
            Name: 'Raindrop Key'
            Desc: 'Increases Effect RES by {{parameter0}}%.'
            Effect: 'Effect RES Boost'
            Source: 1309
            ID: 10013099
          }
        }
        Traces: {
          A2: {
            Name: 'Coloratura Cadenza'
            Desc: "When the battle begins, this character's action is Advanced Forward by 25%."
            Owner: 1309
            ID: 1309101
            Ascension: 2
          }
          A4: {
            Name: 'Impromptu Flourish'
            Desc: 'While the Concerto state is active, the CRIT DMG dealt when all allies launch follow-up attacks increases by 25%.'
            Owner: 1309
            ID: 1309102
            Ascension: 4
          }
          A6: {
            Name: 'Sequential Passage'
            Desc: 'When using Skill, additionally regenerates 5 Energy.'
            Owner: 1309
            ID: 1309103
            Ascension: 6
          }
        }
      }
      1310: {
        Name: 'Firefly'
        Abilities: {
          131001: {
            Name: 'Order: Flare Propulsion'
            Desc: 'Deals minor Fire DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          131002: {
            Name: 'Order: Aerial Bombardment'
            Desc: "Consumes a portion of this unit's own HP to regenerate Energy. Deals Fire DMG to a single enemy. Advances this unit's next Action."
            Type: 'Skill'
            LongDescWithoutEidolon: "Consumes HP equal to 40% of this unit's Max HP and regenerates a fixed amount of Energy equal to 60% of this unit's Max Energy. Deals Fire DMG equal to 200% of SAM's ATK to a single target enemy. If the current HP is not sufficient, reduces SAM's HP to 1 when using this Skill. Advances this unit's next Action by 25%."
            LongDescWithEidolon: "Consumes HP equal to 40% of this unit's Max HP and regenerates a fixed amount of Energy equal to 62% of this unit's Max Energy. Deals Fire DMG equal to 220% of SAM's ATK to a single target enemy. If the current HP is not sufficient, reduces SAM's HP to 1 when using this Skill. Advances this unit's next Action by 25%."
          }
          131003: {
            Name: 'Fyrefly Type-IV: Complete Combustion'
            Desc: "Enters the Complete Combustion state. Advances this unit's Action by 100%. Gains Enhanced Basic ATK and Enhanced Skill. Increases this unit's SPD, Weakness Break Efficiency, and the Break DMG received by the enemy targets, lasting until the countdown ends."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill. While in Complete Combustion, increases SPD by 60, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by 50% and the Break DMG dealt by SAM to the enemy targets by 20%, lasting until this current attack ends.\\nA countdown timer for the Complete Combustion state appears on the Action Order. When the countdown timer's turn starts, SAM exits the Complete Combustion state. The countdown timer has a fixed SPD of 70.\\nSAM cannot use Ultimate while in Complete Combustion."
            LongDescWithEidolon: "Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill. While in Complete Combustion, increases SPD by 66, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by 50% and the Break DMG dealt by SAM to the enemy targets by 22%, lasting until this current attack ends.\\nA countdown timer for the Complete Combustion state appears on the Action Order. When the countdown timer's turn starts, SAM exits the Complete Combustion state. The countdown timer has a fixed SPD of 70.\\nSAM cannot use Ultimate while in Complete Combustion."
          }
          131004: {
            Name: 'Chrysalid Pyronexus'
            Desc: 'The lower the HP, the less DMG received. During the Complete Combustion state, the DMG Reduction effect remains at its maximum extent and Effect RES is increased. If Energy is lower than NaN% when the battle starts, regenerates Energy to NaN%. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.'
            Type: 'Talent'
            LongDescWithoutEidolon: 'The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to 40%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by 30%.\\nIf Energy is lower than 50% when the battle starts, regenerates Energy to 50%. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.'
            LongDescWithEidolon: 'The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to 44%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by 34%.\\nIf Energy is lower than 50% when the battle starts, regenerates Energy to 50%. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.'
          }
          131006: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          131007: {
            Name: 'Δ Order: Meteoric Incineration'
            Desc: 'Leaps into the air and moves about freely. After a few seconds of movement, plunges and attacks all enemies within range. At the start of each wave, applies a Fire Weakness to all enemies and deals Fire DMG to them.'
            Type: 'Technique'
            LongDesc: "Leaps into the air and moves about freely for 5 seconds, which can be ended early by launching a plunging attack. When the duration ends, plunges and immediately attacks all enemies within a set area. At the start of each wave, applies a Fire Weakness to all enemies, lasting for 2 turn(s). Then, deals Fire DMG equal to 200% of SAM's ATK to all enemies."
          }
        }
        Eidolons: {
          131001: {
            Name: 'In Reddened Chrysalis, I Once Rest'
            Desc: "When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points."
          }
          131002: {
            Name: 'From Shattered Sky, I Free Fall'
            Desc: 'While in Complete Combustion, using the Enhanced Basic ATK or the Enhanced Skill to defeat an enemy target or to break their Weakness allows SAM to immediately gain 1 extra turn. This effect can trigger again after 1 turn(s).'
          }
          131003: {
            Name: 'Amidst Silenced Stars, I Deep Sleep'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          131004: {
            Name: 'Upon Lighted Fyrefly, I Soon Gaze'
            Desc: "While in Complete Combustion, increases SAM's Effect RES by 50%."
          }
          131005: {
            Name: 'From Undreamt Night, I Thence Shine'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          131006: {
            Name: 'In Finalized Morrow, I Full Bloom'
            Desc: "While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break Efficiency by 50%."
          }
        }
        Effects: {
          10013101: {
            Name: 'Fyrefly Type-IV: Complete Combustion'
            Desc: "When using Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by {{parameter0}}% and the Break DMG dealt by SAM to the enemy targets by {{parameter3}}%. Increases SPD by {{parameter1}}, and Effect RES by {{parameter2}}%."
            Effect: 'Fyrefly Type-IV: Complete Combustion'
            Source: 1310
            ID: 10013101
          }
          10013102: {
            Name: 'Chrysalid Pyronexus'
            Desc: 'DMG taken decreases by {{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 1310
            ID: 10013102
          }
          10013103: {
            Name: 'Extra Fire Weakness'
            Desc: 'Implanted with extra Fire Weakness.'
            Effect: 'Implant Weakness: Fire'
            Source: 1310
            ID: 10013103
          }
          10013104: {
            Name: 'From Shattered Sky, I Free Fall'
            Desc: 'The "From Shattered Sky, I Free Fall" effect cannot be triggered yet.'
            Source: 1310
            ID: 10013104
          }
          10013105: {
            Name: 'In Finalized Morrow, I Full Bloom'
            Desc: 'Fire RES PEN increases by {{parameter0}}%.'
            Effect: 'Fire RES PEN Boost'
            Source: 1310
            ID: 10013105
          }
          10013106: {
            Name: 'Module γ: Core Overload'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Source: 1310
            ID: 10013106
          }
        }
        Traces: {
          A2: {
            Name: 'Module α: Antilag Outburst'
            Desc: 'During the Complete Combustion, attacking enemies that have no Fire Weakness can also reduce their Toughness, with the effect being equivalent to 55% of the original Toughness Reduction from abilities.'
            Owner: 1310
            ID: 1310101
            Ascension: 2
          }
          A4: {
            Name: 'Module β: Autoreactive Armor'
            Desc: 'When SAM is in Complete Combustion with a Break Effect that is equal to or greater than 200%/360%, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of 35%/50% Super Break DMG.'
            Owner: 1310
            ID: 1310102
            Ascension: 4
          }
          A6: {
            Name: 'Module γ: Core Overload'
            Desc: "For every 10 point(s) of SAM's ATK that exceeds 1800, increases this unit's Break Effect by 0.8%."
            Owner: 1310
            ID: 1310103
            Ascension: 6
          }
        }
      }
      1312: {
        Name: 'Misha'
        Abilities: {
          131201: {
            Name: 'E—Excuse Me, Please!'
            Desc: 'Deals minor Ice DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          131202: {
            Name: 'R—Room Service!'
            Desc: "Deals Ice DMG to an enemy and minor Ice DMG to enemies adjacent to them. In addition, increases Misha's next Ultimate's Hits Per Action."
            Type: 'Skill'
            LongDescWithoutEidolon: "Increases the Hits Per Action for Misha's next Ultimate by 1 hit(s). Deals Ice DMG equal to 200% of Misha's ATK to a single target enemy, and Ice DMG equal to 80% of Misha's ATK to adjacent targets."
            LongDescWithEidolon: "Increases the Hits Per Action for Misha's next Ultimate by 1 hit(s). Deals Ice DMG equal to 220% of Misha's ATK to a single target enemy, and Ice DMG equal to 88% of Misha's ATK to adjacent targets."
          }
          131203: {
            Name: 'G—Gonna Be Late!'
            Desc: 'Deals minor Ice DMG to single enemies. The attack bounces NaN times by default and up to a maximum of NaN times. Before each hit lands, there is a minor chance to Freeze the target.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Has 3 Hits Per Action by default. First, uses 1 hit to deal Ice DMG equal to 60% of Misha's ATK to a single target enemy. Then, the rest of the hits each deals Ice DMG equal to 60% of Misha's ATK to a single random enemy. Just before each hit lands, there is a 20% base chance to Freeze the target, lasting for 1 turn.\\nWhile Frozen, enemy targets cannot take any actions, and at the start of their turn, they receive Additional Ice DMG equal to 30% of Misha's ATK.\\nThis Ultimate can possess up to 10 Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level."
            LongDescWithEidolon: "Has 3 Hits Per Action by default. First, uses 1 hit to deal Ice DMG equal to 64.8% of Misha's ATK to a single target enemy. Then, the rest of the hits each deals Ice DMG equal to 64.8% of Misha's ATK to a single random enemy. Just before each hit lands, there is a 21.6% base chance to Freeze the target, lasting for 1 turn.\\nWhile Frozen, enemy targets cannot take any actions, and at the start of their turn, they receive Additional Ice DMG equal to 32.4% of Misha's ATK.\\nThis Ultimate can possess up to 10 Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level."
          }
          131204: {
            Name: 'Horological Escapement'
            Desc: "For every 1 Skill Point allies consume, Misha's next Ultimate delivers more Hits Per Action, and Misha regenerates his Energy."
            Type: 'Talent'
            LongDescWithoutEidolon: "For every 1 Skill Point allies consume, Misha's next Ultimate delivers 1 more Hit(s) Per Action, and Misha regenerates 2 Energy."
            LongDescWithEidolon: "For every 1 Skill Point allies consume, Misha's next Ultimate delivers 1 more Hit(s) Per Action, and Misha regenerates 2.2 Energy."
          }
          131206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          131207: {
            Name: 'Wait, You Are So Beautiful!'
            Desc: "Creates a Special Dimension that stops all enemies within. Upon entering battle against enemies within the dimension, Misha's next Ultimate deals more Hits Per Action."
            Type: 'Technique'
            LongDesc: "After using the Technique, creates a Special Dimension that lasts for 15 seconds. Enemies caught in the Special Dimension are inflicted with Dream Prison and stop all their actions. Upon entering battle against enemies afflicted with Dream Prison, increases the Hits Per Action for Misha's next Ultimate by 2 hit(s). Only 1 dimension created by allies can exist at the same time."
          }
        }
        Eidolons: {
          131201: {
            Name: 'Whimsicality of Fancy'
            Desc: 'When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the current Ultimate by 1 hit(s), up to a maximum increase of 5 hit(s).'
          }
          131202: {
            Name: 'Yearning of Youth'
            Desc: "Before each hit of the Ultimate lands, there is a 24% base chance of reducing the target's DEF by 16% for 3 turn(s)."
          }
          131203: {
            Name: 'Vestige of Happiness'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          131204: {
            Name: 'Visage of Kinship'
            Desc: 'Increases the DMG multiplier for each hit of the Ultimate by 6%.'
          }
          131205: {
            Name: 'Genesis of First Love'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          131206: {
            Name: 'Estrangement of Dream'
            Desc: 'When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn. In addition, the next time the Skill is used, recovers 1 Skill Point(s) for the team.'
          }
        }
        Effects: {
          10013121: {
            Name: 'Estrangement of Dream'
            Desc: 'Increases DMG dealt by {{parameter0}}%.'
            Effect: 'DMG Boost'
            Source: 1312
            ID: 10013121
          }
          10013122: {
            Name: 'G—Gonna Be Late!'
            Desc: "The Ultimate's Hits Per Action."
            Source: 1312
            ID: 10013122
          }
          10013123: {
            Name: 'Interlock'
            Desc: 'Increases Effect Hit Rate by {{parameter0}}%.'
            Effect: 'Effect Hit Rate Boost'
            Source: 1312
            ID: 10013123
          }
          10013124: {
            Name: 'Yearning of Youth'
            Desc: 'Reduces DEF by {{parameter0}}%.'
            Effect: 'DEF Reduction'
            Source: 1312
            ID: 10013124
          }
          10013125: {
            Name: 'Estrangement of Dream'
            Desc: 'Allies recover {{parameter0}} Skill Point(s) after the next time they use a Skill.'
            Source: 1312
            ID: 10013125
          }
        }
        Traces: {
          A2: {
            Name: 'Release'
            Desc: "Before the Ultimate's first hit lands, increases the base chance of Freezing the target by 80%."
            Owner: 1312
            ID: 1312101
            Ascension: 2
          }
          A4: {
            Name: 'Interlock'
            Desc: "When using the Ultimate, increases the Effect Hit Rate by 60%, lasting until the end of the current Ultimate's action."
            Owner: 1312
            ID: 1312102
            Ascension: 4
          }
          A6: {
            Name: 'Transmission'
            Desc: 'When dealing DMG to Frozen enemies, increases CRIT DMG by 30%.'
            Owner: 1312
            ID: 1312103
            Ascension: 6
          }
        }
      }
      1314: {
        Name: 'Jade'
        Abilities: {
          131401: {
            Name: 'Lash of Riches'
            Desc: 'Deals minor Quantum DMG to a single enemy and minor Quantum DMG to enemies adjacent to it.'
            Type: 'Basic ATK'
          }
          131402: {
            Name: 'Acquisition Surety'
            Desc: "Makes a single ally become the Debt Collector and increases their SPD. After the Debt Collector attacks, deals minor Additional Quantum DMG to each enemy target hit and consume the Collector's own HP. When Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume her HP."
            Type: 'Skill'
            LongDescWithoutEidolon: "Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s).\\nAfter the Debt Collector attacks, deals 1 instance of Additional Quantum DMG equal to 25% of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to 2% of their Max HP. If the current HP is insufficient, reduces HP to 1.\\nIf Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume HP.\\nWhen the Debt Collector exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration decreases by 1 turn."
            LongDescWithEidolon: "Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s).\\nAfter the Debt Collector attacks, deals 1 instance of Additional Quantum DMG equal to 27% of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to 2% of their Max HP. If the current HP is insufficient, reduces HP to 1.\\nIf Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume HP.\\nWhen the Debt Collector exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration decreases by 1 turn."
          }
          131403: {
            Name: 'Vow of the Deep'
            Desc: "Deals Quantum DMG to all enemies and this unit's follow-up attack DMG multiplier increases."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Quantum DMG equal to 240% of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's follow-up attack, increasing its DMG multiplier by 80%. This enhancement can take effect 2 time(s)."
            LongDescWithEidolon: "Deals Quantum DMG equal to 264% of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's follow-up attack, increasing its DMG multiplier by 88%. This enhancement can take effect 2 time(s)."
          }
          131404: {
            Name: 'Fang of Flare Flaying'
            Desc: 'After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching NaN points of Charge, consumes the NaN points to launch 1 instance of follow-up attack, dealing Quantum DMG to all enemies.\\nWhen Jade launches the follow-up attack, gains Pawned Asset and increases CRIT DMG, stacking up to NaN times.'
            Type: 'Talent'
            LongDescWithoutEidolon: "After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching 8 points of Charge, consumes the 8 points to launch 1 instance of follow-up attack, dealing Quantum DMG equal to 120% of Jade's ATK to all enemies. This follow-up attack does not generate Charge.\\nWhen launching her Talent's follow-up attack, Jade immediately gains 5 stack(s) of Pawned Asset, with each stack increasing CRIT DMG by 2.4%, stacking up to 50 times."
            LongDescWithEidolon: "After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching 8 points of Charge, consumes the 8 points to launch 1 instance of follow-up attack, dealing Quantum DMG equal to 132% of Jade's ATK to all enemies. This follow-up attack does not generate Charge.\\nWhen launching her Talent's follow-up attack, Jade immediately gains 5 stack(s) of Pawned Asset, with each stack increasing CRIT DMG by 2.64%, stacking up to 50 times."
          }
          131406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          131407: {
            Name: 'Visionary Predation'
            Desc: 'Inflicts Blind Fealty on enemies within a set area. Attacking an enemy with Blind Fealty causes all enemies with Blind Fealty to enter combat simultaneously. Upon entering combat, deals minor Quantum DMG to all enemies and immediately gains NaN stack(s) of Pawned Asset.'
            Type: 'Technique'
            LongDesc: "After using the Technique, inflicts enemies within a set area with Blind Fealty for 10 second(s). Enemies inflicted with Blind Fealty will not initiate attacks on allies. When entering battle via actively attacking enemies inflicted with Blind Fealty, all enemies with Blind Fealty will enter combat simultaneously. After entering battle, deals Quantum DMG equal to 50% of Jade's ATK to all enemies, and immediately gains 15 stack(s) of Pawned Asset."
          }
        }
        Eidolons: {
          131401: {
            Name: 'Altruism? Nevertheless Tradable'
            Desc: "The follow-up attack DMG from Jade's Talent increases by 32%. After the Debt Collector character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of Charge respectively."
          }
          131402: {
            Name: 'Morality? Herein Authenticated'
            Desc: "When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%."
          }
          131403: {
            Name: 'Honesty? Soon Mortgaged'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          131404: {
            Name: 'Sincerity? Put Option Only'
            Desc: "When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting for 3 turn(s)."
          }
          131405: {
            Name: 'Hope? Hitherto Forfeited'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          131406: {
            Name: 'Equity? Pending Sponsorship'
            Desc: "When the Debt Collector character exists on the field, Jade's Quantum RES PEN increases by 20%, and Jade gains the Debt Collector state."
          }
        }
        Effects: {
          10013141: {
            Name: 'Pawned Asset'
            Desc: 'Each stack increases CRIT DMG by {{parameter0}}%.'
            Effect: 'Pawned Asset'
            Source: 1314
            ID: 10013141
          }
          10013142: {
            Name: 'Debt Collector'
            Desc: 'Increases SPD by {{parameter0}}. After using an attack, consumes a small amount of HP. For each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.'
            Effect: 'Debt Collector'
            Source: 1314
            ID: 10013142
          }
          10013143: {
            Name: 'Debt Collector'
            Desc: 'After using an attack, for each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.'
            Effect: 'Debt Collector'
            Source: 1314
            ID: 10013143
          }
          10013144: {
            Name: 'Creditor'
            Desc: 'Assigning Debt Collector.'
            Source: 1314
            ID: 10013144
          }
          10013145: {
            Name: 'Follow-Up Attack Boost'
            Desc: "Increases the multiplier for the DMG dealt by Talent's follow-up attack by {{parameter0}}%. This can take effect for up to {{parameter1}} time(s)."
            Effect: 'Follow-Up Attack Boost'
            Source: 1314
            ID: 10013145
          }
          10013146: {
            Name: 'Debt Collector'
            Desc: 'Increases SPD by {{parameter0}}. After using an attack, consumes a small amount of HP. For each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.'
            Effect: 'Debt Collector'
            Source: 1314
            ID: 10013146
          }
          10013147: {
            Name: 'Debt Collector'
            Desc: 'Quantum RES PEN increases by {{parameter0}}%. After attacking, for each enemy target hit, Jade gains 1 point of Charge and deals Additional DMG.'
            Effect: 'Debt Collector'
            Source: 1314
            ID: 10013147
          }
          10013148: {
            Name: 'Sincerity? Put Option Only'
            Desc: "Ignores {{parameter0}}% of enemy targets' DEF."
            Effect: 'Sincerity? Put Option Only'
            Source: 1314
            ID: 10013148
          }
          10013149: {
            Name: 'Morality? Herein Authenticated'
            Desc: 'Increases CRIT Rate by {{parameter0}}%.'
            Effect: 'CRIT Rate Boost'
            Source: 1314
            ID: 10013149
          }
        }
        Traces: {
          A2: {
            Name: 'Reverse Repo'
            Desc: "When an enemy target enters combat, Jade gains 1 stack(s) of Pawned Asset. When the Debt Collector character's turn starts, additionally gains 3 stack(s) of Pawned Asset."
            Owner: 1314
            ID: 1314101
            Ascension: 2
          }
          A4: {
            Name: 'Collateral Ticket'
            Desc: "When the battle starts, Jade's action is advanced forward by 50%."
            Owner: 1314
            ID: 1314102
            Ascension: 4
          }
          A6: {
            Name: 'Asset Forfeiture'
            Desc: "Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%."
            Owner: 1314
            ID: 1314103
            Ascension: 6
          }
        }
      }
      1315: {
        Name: 'Boothill'
        Abilities: {
          131501: {
            Name: 'Skullcrush Spurs'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          131502: {
            Name: "Sizzlin' Tango"
            Desc: 'Initiates Standoff. After the target in the Standoff is defeated or Weakness Broken, Boothill receives Pocket Trickshot and dispels the Standoff. Boothill gains Enhanced Basic ATK and this turn does not end.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for 2 turn(s). This duration decreases by 1 at the start of Boothill's every turn.\\nThe enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by 30%/15%.\\nAfter this target is defeated or becomes Weakness Broken, Boothill gains 1 stack of Pocket Trickshot, then dispels the Standoff.\\nThis Skill cannot regenerate Energy. After using this Skill, the current turn does not end."
            LongDescWithEidolon: "Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for 2 turn(s). This duration decreases by 1 at the start of Boothill's every turn.\\nThe enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by 33%/15%.\\nAfter this target is defeated or becomes Weakness Broken, Boothill gains 1 stack of Pocket Trickshot, then dispels the Standoff.\\nThis Skill cannot regenerate Energy. After using this Skill, the current turn does not end."
          }
          131503: {
            Name: "Dust Devil's Sunset Rodeo"
            Desc: 'Applies Physical Weakness to a single enemy, deals massive Physical DMG to them, and delays their action.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Applies Physical Weakness to a single target enemy, lasting for 2 turn(s).\\nDeals Physical DMG equal to 400% of Boothill's ATK to the target and delays their action by 40%."
            LongDescWithEidolon: "Applies Physical Weakness to a single target enemy, lasting for 2 turn(s).\\nDeals Physical DMG equal to 432% of Boothill's ATK to the target and delays their action by 42%."
          }
          131504: {
            Name: 'Five Peas in a Pod'
            Desc: "Pocket Trickshot increases the Enhanced Basic ATK's Toughness Reduction and additionally deals Physical Break DMG if the target is Weakness Broken. After winning the battle, retains Pocket Trickshot for the next battle."
            Type: 'Talent'
            LongDescWithoutEidolon: "Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by 50%, stacking up to 3 time(s).\\nIf the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals Break DMG to this target equal to 70%/120%/170% of Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed 16 times the base Toughness Reduction of the Basic Attack \"Skullcrush Spurs.\"\\nAfter winning the battle, Boothill can retain Pocket Trickshot for the next battle."
            LongDescWithEidolon: "Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by 50%, stacking up to 3 time(s).\\nIf the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals Break DMG to this target equal to 77%/132%/187% of Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed 16 times the base Toughness Reduction of the Basic Attack \"Skullcrush Spurs.\"\\nAfter winning the battle, Boothill can retain Pocket Trickshot for the next battle."
          }
          131506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          131507: {
            Name: '3-9× Smile'
            Desc: 'After the Technique is used, inflicts Physical Weakness on a single enemy when casting the Skill for the first time in the next battle.'
            Type: 'Technique'
            LongDesc: 'After the Technique is used, when casting the Skill for the first time in the next battle, applies the same Physical Weakness to the target as the one induced by the Ultimate, lasting for 2 turn(s).'
          }
        }
        Eidolons: {
          131501: {
            Name: "Dusty Trail's Lone Star"
            Desc: "When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores 16% of the enemy target's DEF."
          }
          131502: {
            Name: 'Milestonemonger'
            Desc: 'When in Standoff and gaining Pocket Trickshot, recovers 1 Skill Point(s) and increases Break Effect by 30%, lasting for 2 turn(s). Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn.'
          }
          131503: {
            Name: "Marble Orchard's Guard"
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          131504: {
            Name: 'Cold Cuts Chef'
            Desc: 'When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by 12%. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by 12%.'
          }
          131505: {
            Name: 'Stump Speech'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          131506: {
            Name: "Crowbar Hotel's Raccoon"
            Desc: "When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40% of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to 70% of the original DMG multiplier."
          }
        }
        Effects: {
          10013151: {
            Name: 'Pocket Trickshot'
            Desc: 'Every stack increases the Toughness Reduction of the Enhanced Basic Attack by {{parameter1}}%. If the target is Weakness Broken while the Enhanced Basic ATK is being used, deals additional Physical Break DMG based on the number of Pocket Trickshot stacks. This effect can stack up to {{parameter0}} time(s).'
            Effect: 'Pocket Trickshot'
            Source: 1315
            ID: 10013151
          }
          10013152: {
            Name: 'Extra Physical Weakness'
            Desc: 'Implanted with extra Physical Weakness.'
            Effect: 'Implant Weakness: Physical'
            Source: 1315
            ID: 10013152
          }
          10013153: {
            Name: 'Standoff'
            Desc: 'This is considered a Taunt state and only %CasterName can be selected as the attack target. Increases DMG received by {{parameter0}}% when attacked by %CasterName.'
            Effect: 'Standoff'
            Source: 1315
            ID: 10013153
          }
          10013154: {
            Name: 'Standoff'
            Desc: 'When getting attacked by the target in the Standoff, increases the DMG received by {{parameter0}}%. The Basic ATK becomes Enhanced.'
            Effect: 'Standoff'
            Source: 1315
            ID: 10013154
          }
          10013155: {
            Name: 'Milestonemonger'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Source: 1315
            ID: 10013155
          }
          10013156: {
            Name: 'Milestonemonger'
            Desc: "Milestonemonger's effect cannot be triggered yet."
            Source: 1315
            ID: 10013156
          }
          10013157: {
            Name: '3-9× Smile'
            Desc: 'The first time the Skill is used in a battle, applies the same Physical Weakness to a single target enemy as the one induced by the Ultimate, lasting for {{parameter0}} turn(s).'
            Source: 1315
            ID: 10013157
          }
        }
        Traces: {
          A2: {
            Name: 'Ghost Load'
            Desc: "Increase this character's CRIT Rate/CRIT DMG, by an amount equal to 10%/50% of Break Effect, up to a max increase of 30%/150%."
            Owner: 1315
            ID: 1315101
            Ascension: 2
          }
          A4: {
            Name: 'Above Snakes'
            Desc: 'While Boothill is in the Standoff, reduces the DMG he receives from targets that are not in the Standoff by 30%.'
            Owner: 1315
            ID: 1315102
            Ascension: 4
          }
          A6: {
            Name: 'Point Blank'
            Desc: 'When in Standoff and gaining Pocket Trickshot, regenerates 10 Energy. Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit.'
            Owner: 1315
            ID: 1315103
            Ascension: 6
          }
        }
      }
      8001: {
        Name: 'Caelus (Destruction)'
        Abilities: {
          800101: {
            Name: 'Farewell Hit'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          800102: {
            Name: 'RIP Home Run'
            Desc: 'Deals Physical DMG to a single enemy and enemies adjacent to it.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 125% of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
            LongDescWithEidolon: "Deals Physical DMG equal to 137.5% of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
          }
          800103: {
            Name: 'Stardust Ace'
            Desc: 'Uses Single Target ATK or Blast to strike with full force.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to 450% of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to 270% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to 162% of the Trailblazer's ATK to enemies adjacent to it."
            LongDescWithEidolon: "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to 480% of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to 288% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to 172.8% of the Trailblazer's ATK to enemies adjacent to it."
          }
          800104: {
            Name: 'Perfect Pickoff'
            Desc: "Every time this unit breaks an Enemy target's Weakness, ATK increases."
            Type: 'Talent'
            LongDescWithoutEidolon: 'Each time after this character inflicts Weakness Break on an enemy, ATK increases by 20%. This effect stacks up to 2 time(s).'
            LongDescWithEidolon: 'Each time after this character inflicts Weakness Break on an enemy, ATK increases by 22%. This effect stacks up to 2 time(s).'
          }
          800106: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800107: {
            Name: 'Immortal Third Strike'
            Desc: 'After using Technique, immediately restores HP for team.'
            Type: 'Technique'
            LongDesc: 'Immediately heals all allies for 15% of their respective Max HP after using this Technique.'
          }
        }
        Eidolons: {
          800101: {
            Name: 'A Falling Star'
            Desc: "When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates 10 extra Energy. This effect can only be triggered once per attack."
          }
          800102: {
            Name: 'An Unwilling Host'
            Desc: "Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to 5% of the Trailblazer's ATK."
          }
          800103: {
            Name: 'A Leading Whisper'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800104: {
            Name: 'A Destructing Glance'
            Desc: 'When attacking an enemy with Weakness Break, CRIT Rate is increased by 25%.'
          }
          800105: {
            Name: 'A Surviving Hope'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800106: {
            Name: 'A Trailblazing Will'
            Desc: "The Trailblazer's Talent is also triggered when they defeat an enemy."
          }
        }
        Effects: {
          10080012: {
            Name: 'Perfect Pickoff'
            Desc: 'Each stack increases ATK by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'ATK Boost'
            Source: 8001
            ID: 10080012
          }
          10080013: {
            Name: 'Tenacity'
            Desc: 'Each stack increases DEF by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'DEF Boost'
            Source: 8001
            ID: 10080013
          }
        }
        Traces: {
          A2: {
            Name: 'Ready for Battle'
            Desc: 'At the start of the battle, immediately regenerates 15 Energy.'
            Owner: 8001
            ID: 8001101
            Ascension: 2
          }
          A4: {
            Name: 'Tenacity'
            Desc: "Each Talent stack increases the Trailblazer's DEF by 10%."
            Owner: 8001
            ID: 8001102
            Ascension: 4
          }
          A6: {
            Name: 'Fighting Will'
            Desc: 'When using Skill or Ultimate "Blowout: RIP Home Run," DMG dealt to the target enemy is increased by 25%.'
            Owner: 8001
            ID: 8001103
            Ascension: 6
          }
        }
      }
      8002: {
        Name: 'Stelle (Destruction)'
        Abilities: {
          800201: {
            Name: 'Farewell Hit'
            Desc: 'Deals minor Physical DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          800202: {
            Name: 'RIP Home Run'
            Desc: 'Deals Physical DMG to a single enemy and enemies adjacent to it.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Physical DMG equal to 125% of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
            LongDescWithEidolon: "Deals Physical DMG equal to 137.5% of the Trailblazer's ATK to a single enemy and enemies adjacent to it."
          }
          800203: {
            Name: 'Stardust Ace'
            Desc: 'Uses Single Target ATK or Blast to strike with full force.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to 450% of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to 270% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to 162% of the Trailblazer's ATK to enemies adjacent to it."
            LongDescWithEidolon: "Choose between two attack modes to deliver a full strike.\\nBlowout: Farewell Hit deals Physical DMG equal to 480% of the Trailblazer's ATK to a single enemy.\\nBlowout: RIP Home Run deals Physical DMG equal to 288% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to 172.8% of the Trailblazer's ATK to enemies adjacent to it."
          }
          800204: {
            Name: 'Perfect Pickoff'
            Desc: "Every time this unit breaks an Enemy target's Weakness, ATK increases."
            Type: 'Talent'
            LongDescWithoutEidolon: 'Each time after this character inflicts Weakness Break on an enemy, ATK increases by 20%. This effect stacks up to 2 time(s).'
            LongDescWithEidolon: 'Each time after this character inflicts Weakness Break on an enemy, ATK increases by 22%. This effect stacks up to 2 time(s).'
          }
          800206: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800207: {
            Name: 'Immortal Third Strike'
            Desc: 'After using Technique, immediately restores HP for team.'
            Type: 'Technique'
            LongDesc: 'Immediately heals all allies for 15% of their respective Max HP after using this Technique.'
          }
        }
        Eidolons: {
          800201: {
            Name: 'A Falling Star'
            Desc: "When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates 10 extra Energy. This effect can only be triggered once per attack."
          }
          800202: {
            Name: 'An Unwilling Host'
            Desc: "Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to 5% of the Trailblazer's ATK."
          }
          800203: {
            Name: 'A Leading Whisper'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800204: {
            Name: 'A Destructing Glance'
            Desc: 'When attacking an enemy with Weakness Break, CRIT Rate is increased by 25%.'
          }
          800205: {
            Name: 'A Surviving Hope'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800206: {
            Name: 'A Trailblazing Will'
            Desc: "The Trailblazer's Talent is also triggered when they defeat an enemy."
          }
        }
        Effects: {
          10080022: {
            Name: 'Perfect Pickoff'
            Desc: 'Each stack increases ATK by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'ATK Boost'
            Source: 8002
            ID: 10080022
          }
          10080023: {
            Name: 'Tenacity'
            Desc: 'Each stack increases DEF by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'DEF Boost'
            Source: 8002
            ID: 10080023
          }
        }
        Traces: {
          A2: {
            Name: 'Ready for Battle'
            Desc: 'At the start of the battle, immediately regenerates 15 Energy.'
            Owner: 8002
            ID: 8002101
            Ascension: 2
          }
          A4: {
            Name: 'Tenacity'
            Desc: "Each Talent stack increases the Trailblazer's DEF by 10%."
            Owner: 8002
            ID: 8002102
            Ascension: 4
          }
          A6: {
            Name: 'Fighting Will'
            Desc: 'When using Skill or Ultimate "Blowout: RIP Home Run," DMG dealt to the target enemy is increased by 25%.'
            Owner: 8002
            ID: 8002103
            Ascension: 6
          }
        }
      }
      8003: {
        Name: 'Caelus (Preservation)'
        Abilities: {
          800301: {
            Name: 'Ice-Breaking Light'
            Desc: 'Deals minor Fire DMG to a single enemy and gains Magma Will.'
            Type: 'Basic ATK'
          }
          800302: {
            Name: 'Ever-Burning Amber'
            Desc: 'Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Increases the Trailblazer's DMG Reduction by 50% and gains 1 stack of Magma Will, with a 100% base chance to Taunt all enemies for 1 turn(s)."
            LongDescWithEidolon: "Increases the Trailblazer's DMG Reduction by 52% and gains 1 stack of Magma Will, with a 100% base chance to Taunt all enemies for 1 turn(s)."
          }
          800303: {
            Name: 'War-Flaming Lance'
            Desc: "Deals Fire DMG to all enemies and enhances this unit's next Basic ATK."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 100% of the Trailblazer's ATK plus 150% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
            LongDescWithEidolon: "Deals Fire DMG equal to 110% of the Trailblazer's ATK plus 165% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
          }
          800304: {
            Name: 'Treasure of the Architects'
            Desc: 'When attacked, stacks "Magma Will". When "Magma Will" is at no fewer than 4 stacks, Basic ATK gets enhanced. After using Basic ATK, Skill, or Ultimate, provides a Shield for team.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of 8 stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to 6% of the Trailblazer's DEF plus 80. The Shield lasts for 2 turn(s)."
            LongDescWithEidolon: "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of 8 stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to 6.4% of the Trailblazer's DEF plus 89. The Shield lasts for 2 turn(s)."
          }
          800306: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800307: {
            Name: 'Call of the Guardian'
            Desc: 'After using Technique, provides a Shield for this unit at the start of the next battle.'
            Type: 'Technique'
            LongDesc: "After using Technique, at the start of the next battle, gains a Shield that absorbs DMG equal to 30% of the Trailblazer's DEF plus 384 for 1 turn(s)."
          }
        }
        Eidolons: {
          800301: {
            Name: 'Earth-Shaking Resonance'
            Desc: "When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to 25% of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to 50% of the Trailblazer's DEF."
          }
          800302: {
            Name: 'Time-Defying Tenacity'
            Desc: "The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to 2% of the Trailblazer's DEF plus 27."
          }
          800303: {
            Name: 'Trail-Blazing Blueprint'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800304: {
            Name: 'Nation-Building Oath'
            Desc: 'At the start of the battle, immediately gains 4 stack(s) of Magma Will.'
          }
          800305: {
            Name: 'Spirit-Warming Flame'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800306: {
            Name: 'City-Forging Bulwarks'
            Desc: 'After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by 10%. Stacks up to 3 time(s).'
          }
        }
        Effects: {
          10080031: {
            Name: 'Magma Will'
            Desc: 'When there are 4 or more stacks of Magma Will, Enhances Basic ATK.'
            Source: 8003
            ID: 10080031
          }
          10080032: {
            Name: 'War-Flaming Lance'
            Desc: 'The next Basic ATK will become an Enhanced Basic ATK and will not consume Magma Will.'
            Effect: 'Enhanced Basic ATK'
            Source: 8003
            ID: 10080032
          }
          10080033: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 8003
            ID: 10080033
          }
          10080034: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 8003
            ID: 10080034
          }
          10080036: {
            Name: 'DMG Mitigation'
            Desc: 'DMG taken -{{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 8003
            ID: 10080036
          }
          10080037: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 8003
            ID: 10080037
          }
          10080038: {
            Name: 'DEF Boost'
            Desc: 'Each stack increases DEF by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'DEF Boost'
            Source: 8003
            ID: 10080038
          }
          10080039: {
            Name: 'DMG Mitigation'
            Desc: 'DMG taken -{{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 8003
            ID: 10080039
          }
        }
        Traces: {
          A2: {
            Name: 'The Strong Defend the Weak'
            Desc: 'After using the Skill, the DMG taken by all allies reduces by 15% for 1 turn(s).'
            Owner: 8003
            ID: 8003101
            Ascension: 2
          }
          A4: {
            Name: 'Unwavering Gallantry'
            Desc: "Using Enhanced Basic ATK restores the Trailblazer's HP by 5% of their Max HP."
            Owner: 8003
            ID: 8003102
            Ascension: 4
          }
          A6: {
            Name: 'Action Beats Overthinking'
            Desc: 'When the Trailblazer is protected by a Shield at the beginning of the turn, increases their ATK by 15% and regenerates 5 Energy until the action is over.'
            Owner: 8003
            ID: 8003103
            Ascension: 6
          }
        }
      }
      8004: {
        Name: 'Stelle (Preservation)'
        Abilities: {
          800401: {
            Name: 'Ice-Breaking Light'
            Desc: 'Deals minor Fire DMG to a single enemy and gains Magma Will.'
            Type: 'Basic ATK'
          }
          800402: {
            Name: 'Ever-Burning Amber'
            Desc: 'Reduces DMG taken and gains Magma Will, with a high chance to Taunt all enemies.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Increases the Trailblazer's DMG Reduction by 50% and gains 1 stack of Magma Will, with a 100% base chance to Taunt all enemies for 1 turn(s)."
            LongDescWithEidolon: "Increases the Trailblazer's DMG Reduction by 52% and gains 1 stack of Magma Will, with a 100% base chance to Taunt all enemies for 1 turn(s)."
          }
          800403: {
            Name: 'War-Flaming Lance'
            Desc: "Deals Fire DMG to all enemies and enhances this unit's next Basic ATK."
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Deals Fire DMG equal to 100% of the Trailblazer's ATK plus 150% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
            LongDescWithEidolon: "Deals Fire DMG equal to 110% of the Trailblazer's ATK plus 165% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will."
          }
          800404: {
            Name: 'Treasure of the Architects'
            Desc: 'When attacked, stacks "Magma Will". When "Magma Will" is at no fewer than 4 stacks, Basic ATK gets enhanced. After using Basic ATK, Skill, or Ultimate, provides a Shield for team.'
            Type: 'Talent'
            LongDescWithoutEidolon: "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of 8 stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to 6% of the Trailblazer's DEF plus 80. The Shield lasts for 2 turn(s)."
            LongDescWithEidolon: "Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of 8 stack(s).\\nWhen Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.\\nWhen the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to 6.4% of the Trailblazer's DEF plus 89. The Shield lasts for 2 turn(s)."
          }
          800406: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800407: {
            Name: 'Call of the Guardian'
            Desc: 'After using Technique, provides a Shield for this unit at the start of the next battle.'
            Type: 'Technique'
            LongDesc: "After using Technique, at the start of the next battle, gains a Shield that absorbs DMG equal to 30% of the Trailblazer's DEF plus 384 for 1 turn(s)."
          }
        }
        Eidolons: {
          800401: {
            Name: 'Earth-Shaking Resonance'
            Desc: "When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to 25% of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to 50% of the Trailblazer's DEF."
          }
          800402: {
            Name: 'Time-Defying Tenacity'
            Desc: "The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to 2% of the Trailblazer's DEF plus 27."
          }
          800403: {
            Name: 'Trail-Blazing Blueprint'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800404: {
            Name: 'Nation-Building Oath'
            Desc: 'At the start of the battle, immediately gains 4 stack(s) of Magma Will.'
          }
          800405: {
            Name: 'Spirit-Warming Flame'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800406: {
            Name: 'City-Forging Bulwarks'
            Desc: 'After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by 10%. Stacks up to 3 time(s).'
          }
        }
        Effects: {
          10080041: {
            Name: 'Magma Will'
            Desc: 'When there are 4 or more stacks of Magma Will, Enhances Basic ATK.'
            Source: 8004
            ID: 10080041
          }
          10080042: {
            Name: 'War-Flaming Lance'
            Desc: 'The next Basic ATK will become an Enhanced Basic ATK and will not consume Magma Will.'
            Effect: 'Enhanced Basic ATK'
            Source: 8004
            ID: 10080042
          }
          10080043: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 8004
            ID: 10080043
          }
          10080044: {
            Name: 'DMG Mitigation'
            Desc: 'DMG taken -{{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 8004
            ID: 10080044
          }
          10080045: {
            Name: 'Shield'
            Desc: "Gains a Shield that absorbs DMG. While the Shield persists, enemy attacks will not reduce Shielded characters' HP."
            Effect: 'Shield'
            Source: 8004
            ID: 10080045
          }
          10080046: {
            Name: 'DEF Boost'
            Desc: 'Each stack increases DEF by {{parameter0}}%, up to {{parameter1}} stack(s).'
            Effect: 'DEF Boost'
            Source: 8004
            ID: 10080046
          }
          10080047: {
            Name: 'DMG Mitigation'
            Desc: 'DMG taken -{{parameter0}}%.'
            Effect: 'DMG Mitigation'
            Source: 8004
            ID: 10080047
          }
          10080048: {
            Name: 'ATK Boost'
            Desc: 'ATK +{{parameter0}}%.'
            Effect: 'ATK Boost'
            Source: 8004
            ID: 10080048
          }
        }
        Traces: {
          A2: {
            Name: 'The Strong Defend the Weak'
            Desc: 'After using the Skill, the DMG taken by all allies reduces by 15% for 1 turn(s).'
            Owner: 8004
            ID: 8004101
            Ascension: 2
          }
          A4: {
            Name: 'Unwavering Gallantry'
            Desc: "Using Enhanced Basic ATK restores the Trailblazer's HP by 5% of their Max HP."
            Owner: 8004
            ID: 8004102
            Ascension: 4
          }
          A6: {
            Name: 'Action Beats Overthinking'
            Desc: 'When the Trailblazer is protected by a Shield at the beginning of the turn, increases their ATK by 15% and regenerates 5 Energy until the action is over.'
            Owner: 8004
            ID: 8004103
            Ascension: 6
          }
        }
      }
      8005: {
        Name: 'Caelus (Harmony)'
        Abilities: {
          800501: {
            Name: 'Swing Dance Etiquette'
            Desc: 'Deals minor Imaginary DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          800502: {
            Name: 'Halftime to Make It Rain'
            Desc: 'Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 50% of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to 50% of the Trailblazer's ATK to a random enemy."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 55% of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to 55% of the Trailblazer's ATK to a random enemy."
          }
          800503: {
            Name: 'All-Out Footlight Parade'
            Desc: 'Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their Break Effect increased and additionally deal Super Break DMG 1 time when they attack enemy targets that are Weakness Broken.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by 30%. And when they attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG."
            LongDescWithEidolon: "Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by 33%. And when they attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG."
          }
          800504: {
            Name: 'Full-on Aerial Dance'
            Desc: "The Trailblazer regenerates Energy when an enemy target's Weakness is Broken."
            Type: 'Talent'
            LongDescWithoutEidolon: "The Trailblazer immediately regenerates 10 Energy when an enemy target's Weakness is Broken."
            LongDescWithEidolon: "The Trailblazer immediately regenerates 11 Energy when an enemy target's Weakness is Broken."
          }
          800506: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800507: {
            Name: "Now! I'm the Band!"
            Desc: "At the start of the next battle, increases all allies' Break Effect."
            Type: 'Technique'
            LongDesc: "After the Technique is used, at the start of the next battle, all allies' Break Effect increases by 30%, lasting for 2 turn(s)."
          }
        }
        Eidolons: {
          800501: {
            Name: 'Best Seat in the House'
            Desc: 'After using Skill for the first time, immediately recovers 1 Skill Point(s).'
          }
          800502: {
            Name: 'Jailbreaking Rainbowwalk'
            Desc: "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s)."
          }
          800503: {
            Name: 'Sanatorium for Rest Notes'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800504: {
            Name: 'Dove in Tophat'
            Desc: "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect."
          }
          800505: {
            Name: 'Poem Favors Rhythms of Old'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800506: {
            Name: 'Tomorrow, Rest in Spotlight'
            Desc: 'The number of additional DMG applications by the Skill increases by 2.'
          }
        }
        Effects: {
          10080051: {
            Name: 'Dove in Tophat'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Source: 8005
            ID: 10080051
          }
          10080052: {
            Name: 'Backup Dancer'
            Desc: 'Increases Break Effect by {{parameter0}}%. And after attacking enemy targets that are Weakness Broken, converts the Toughness Reduction of the attack into 1 instance of Super Break DMG.'
            Effect: 'Backup Dancer'
            Source: 8005
            ID: 10080052
          }
          10080053: {
            Name: "Now! I'm the Band!"
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 8005
            ID: 10080053
          }
          10080054: {
            Name: 'Jailbreaking Rainbowwalk'
            Desc: 'Increases Energy Regeneration Rate by {{parameter0}}%.'
            Source: 8005
            ID: 10080054
          }
          10080055: {
            Source: 8005
            ID: 10080055
          }
        }
        Traces: {
          A2: {
            Name: 'Dance With the One'
            Desc: 'When the number of enemy targets on the field is 5 (or more)/4/3/2/1, the Super Break DMG triggered by the Backup Dancer effect increases by 20%/30%/40%/50%/60%.'
            Owner: 8005
            ID: 8005101
            Ascension: 2
          }
          A4: {
            Name: 'Shuffle Along'
            Desc: 'When using Skill, additionally increases the Toughness Reduction of the first instance of DMG by 100%.'
            Owner: 8005
            ID: 8005102
            Ascension: 4
          }
          A6: {
            Name: 'Hat of the Theater'
            Desc: "Additionally delays the enemy target's action by 30% when allies Break enemy Weaknesses."
            Owner: 8005
            ID: 8005103
            Ascension: 6
          }
        }
      }
      8006: {
        Name: 'Stelle (Harmony)'
        Abilities: {
          800601: {
            Name: 'Swing Dance Etiquette'
            Desc: 'Deals minor Imaginary DMG to a single enemy.'
            Type: 'Basic ATK'
          }
          800602: {
            Name: 'Halftime to Make It Rain'
            Desc: 'Deals minor Imaginary DMG to single enemy targets with 5 Bounces in total.'
            Type: 'Skill'
            LongDescWithoutEidolon: "Deals Imaginary DMG equal to 50% of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to 50% of the Trailblazer's ATK to a random enemy."
            LongDescWithEidolon: "Deals Imaginary DMG equal to 55% of the Trailblazer's ATK to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG equal to 55% of the Trailblazer's ATK to a random enemy."
          }
          800603: {
            Name: 'All-Out Footlight Parade'
            Desc: 'Grants all allies the Backup Dancer effect. Allies with Backup Dancer have their Break Effect increased and additionally deal Super Break DMG 1 time when they attack enemy targets that are Weakness Broken.'
            Type: 'Ultimate'
            LongDescWithoutEidolon: "Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by 30%. And when they attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG."
            LongDescWithEidolon: "Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration decreases by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by 33%. And when they attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG."
          }
          800604: {
            Name: 'Full-on Aerial Dance'
            Desc: "The Trailblazer regenerates Energy when an enemy target's Weakness is Broken."
            Type: 'Talent'
            LongDescWithoutEidolon: "The Trailblazer immediately regenerates 10 Energy when an enemy target's Weakness is Broken."
            LongDescWithEidolon: "The Trailblazer immediately regenerates 11 Energy when an enemy target's Weakness is Broken."
          }
          800606: {
            Name: 'Attack'
            LongDesc: 'Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.'
          }
          800607: {
            Name: "Now! I'm the Band!"
            Desc: "At the start of the next battle, increases all allies' Break Effect."
            Type: 'Technique'
            LongDesc: "After the Technique is used, at the start of the next battle, all allies' Break Effect increases by 30%, lasting for 2 turn(s)."
          }
        }
        Eidolons: {
          800601: {
            Name: 'Best Seat in the House'
            Desc: 'After using Skill for the first time, immediately recovers 1 Skill Point(s).'
          }
          800602: {
            Name: 'Jailbreaking Rainbowwalk'
            Desc: "When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s)."
          }
          800603: {
            Name: 'Sanatorium for Rest Notes'
            Desc: 'Skill Lv. +2, up to a maximum of Lv. 15.\\nTalent Lv. +2, up to a maximum of Lv. 15.'
          }
          800604: {
            Name: 'Dove in Tophat'
            Desc: "While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect."
          }
          800605: {
            Name: 'Poem Favors Rhythms of Old'
            Desc: 'Ultimate Lv. +2, up to a maximum of Lv. 15.\\nBasic ATK Lv. +1, up to a maximum of Lv. 10.'
          }
          800606: {
            Name: 'Tomorrow, Rest in Spotlight'
            Desc: 'The number of additional DMG applications by the Skill increases by 2.'
          }
        }
        Effects: {
          10080061: {
            Name: 'Dove in Tophat'
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Source: 8006
            ID: 10080061
          }
          10080062: {
            Name: 'Backup Dancer'
            Desc: 'Increases Break Effect by {{parameter0}}%. And after attacking enemy targets that are Weakness Broken, converts the Toughness Reduction of the attack into 1 instance of Super Break DMG.'
            Effect: 'Backup Dancer'
            Source: 8006
            ID: 10080062
          }
          10080063: {
            Name: "Now! I'm the Band!"
            Desc: 'Increases Break Effect by {{parameter0}}%.'
            Effect: 'Break Effect Boost'
            Source: 8006
            ID: 10080063
          }
          10080064: {
            Name: 'Jailbreaking Rainbowwalk'
            Desc: 'Increases Energy Regeneration Rate by {{parameter0}}%.'
            Source: 8006
            ID: 10080064
          }
          10080065: {
            Source: 8006
            ID: 10080065
          }
        }
        Traces: {
          A2: {
            Name: 'Dance With the One'
            Desc: 'When the number of enemy targets on the field is 5 (or more)/4/3/2/1, the Super Break DMG triggered by the Backup Dancer effect increases by 20%/30%/40%/50%/60%.'
            Owner: 8006
            ID: 8006101
            Ascension: 2
          }
          A4: {
            Name: 'Shuffle Along'
            Desc: 'When using Skill, additionally increases the Toughness Reduction of the first instance of DMG by 100%.'
            Owner: 8006
            ID: 8006102
            Ascension: 4
          }
          A6: {
            Name: 'Hat of the Theater'
            Desc: "Additionally delays the enemy target's action by 30% when allies Break enemy Weaknesses."
            Owner: 8006
            ID: 8006103
            Ascension: 6
          }
        }
      }
    }
    RelicSets: {
      101: {
        Name: 'Passerby of Wandering Cloud'
        Description2pc: 'Increases Outgoing Healing by 10%.'
        Description4pc: 'At the start of the battle, immediately regenerates 1 Skill Point.'
      }
      102: {
        Name: 'Musketeer of Wild Wheat'
        Description2pc: 'Increases ATK by 12%.'
        Description4pc: "The wearer's SPD increases by 6% and DMG dealt by Basic ATK increases by 10%."
      }
      103: {
        Name: 'Knight of Purity Palace'
        Description2pc: 'Increases DEF by 15%.'
        Description4pc: 'Increases the max DMG that can be absorbed by the Shield created by the wearer by 20%.'
      }
      104: {
        Name: 'Hunter of Glacial Forest'
        Description2pc: 'Increases Ice DMG by 10%.'
        Description4pc: 'After the wearer uses their Ultimate, their CRIT DMG increases by 25% for 2 turn(s).'
      }
      105: {
        Name: 'Champion of Streetwise Boxing'
        Description2pc: 'Increases Physical DMG by 10%.'
        Description4pc: 'After the wearer attacks or is hit, their ATK increases by 5% for the rest of the battle. This effect can stack up to 5 time(s).'
      }
      106: {
        Name: 'Guard of Wuthering Snow'
        Description2pc: 'Reduces DMG taken by 8%.'
        Description4pc: "At the beginning of the turn, if the wearer's HP percentage is equal to or less than 50%, restores HP equal to 8% of their Max HP and regenerates 5 Energy."
      }
      107: {
        Name: 'Firesmith of Lava-Forging'
        Description2pc: 'Increases Fire DMG by 10%.'
        Description4pc: "Increases DMG by the wearer's Skill by 12%. After unleashing Ultimate, increases the wearer's Fire DMG by 12% for the next attack."
      }
      108: {
        Name: 'Genius of Brilliant Stars'
        Description2pc: 'Increases Quantum DMG by 10%.'
        Description4pc: 'When the wearer deals DMG to the target enemy, ignores 10% DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores 10% DEF.'
      }
      109: {
        Name: 'Band of Sizzling Thunder'
        Description2pc: 'Increases Lightning DMG by 10%.'
        Description4pc: "When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn(s)."
      }
      110: {
        Name: 'Eagle of Twilight Line'
        Description2pc: 'Increases Wind DMG by 10%.'
        Description4pc: 'After the wearer uses their Ultimate, their action is Advanced Forward by 25%.'
      }
      111: {
        Name: 'Thief of Shooting Meteor'
        Description2pc: 'Increases Break Effect by 16%.'
        Description4pc: "Increases the wearer's Break Effect by 16%. After the wearer inflicts Weakness Break on an enemy, regenerates 3 Energy."
      }
      112: {
        Name: 'Wastelander of Banditry Desert'
        Description2pc: 'Increases Imaginary DMG by 10%.'
        Description4pc: "When attacking debuffed enemies, the wearer's CRIT Rate increases by 10%, and their CRIT DMG increases by 20% against Imprisoned enemies."
      }
      113: {
        Name: 'Longevous Disciple'
        Description2pc: 'Increases Max HP by 12%.'
        Description4pc: 'When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by 8% for 2 turn(s) and up to 2 stacks.'
      }
      114: {
        Name: 'Messenger Traversing Hackerspace'
        Description2pc: 'Increases SPD by 6%.'
        Description4pc: 'When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn(s). This effect cannot be stacked.'
      }
      115: {
        Name: 'The Ashblazing Grand Duke'
        Description2pc: 'Increases the DMG dealt by follow-up attack by 20%.'
        Description4pc: "When the wearer uses a follow-up attack, increases the wearer's ATK by 6% for every time the follow-up attack deals DMG. This effect can stack up to 8 time(s) and lasts for 3 turn(s). This effect is removed the next time the wearer uses a follow-up attack."
      }
      116: {
        Name: 'Prisoner in Deep Confinement'
        Description2pc: 'Increases ATK by 12%.'
        Description4pc: 'For every DoT the enemy target is afflicted with, the wearer will ignore 6% of its DEF when dealing DMG to it. This effect is valid for a max of 3 DoTs.'
      }
      117: {
        Name: 'Pioneer Diver of Dead Waters'
        Description2pc: 'Increases DMG dealt to enemies with debuffs by 12%.'
        Description4pc: 'Increases CRIT Rate by 4%. The wearer deals 8%/12% increased CRIT DMG to enemies with at least 2/3 debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by 100%, lasting for 1 turn(s).'
      }
      118: {
        Name: 'Watchmaker, Master of Dream Machinations'
        Description2pc: 'Increases Break Effect by 16%.'
        Description4pc: "When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by 30% for 2 turn(s). This effect cannot be stacked."
      }
      119: {
        Name: 'Iron Cavalry Against the Scourge'
        Description2pc: 'Increases Break Effect by 16%.'
        Description4pc: "If the wearer's Break Effect is 150% or higher, the Break DMG dealt to the enemy target ignores 10% of their DEF. If the wearer's Break Effect is 250% or higher, the Super Break DMG dealt to the enemy target additionally ignores 15% of their DEF."
      }
      120: {
        Name: 'The Wind-Soaring Valorous'
        Description2pc: 'Increases ATK by 12%.'
        Description4pc: "Increases the wearer's CRIT Rate by 6%. After the wearer uses a follow-up attack, increases DMG dealt by Ultimate by 36%, lasting for 1 turn(s)."
      }
      301: {
        Name: 'Space Sealing Station'
        Description2pc: "Increases the wearer's ATK by 12%. When the wearer's SPD reaches 120 or higher, the wearer's ATK increases by an extra 12%."
      }
      302: {
        Name: 'Fleet of the Ageless'
        Description2pc: "Increases the wearer's Max HP by 12%. When the wearer's SPD reaches 120 or higher, all allies' ATK increases by 8%."
      }
      303: {
        Name: 'Pan-Cosmic Commercial Enterprise'
        Description2pc: "Increases the wearer's Effect Hit Rate by 10%. Meanwhile, the wearer's ATK increases by an amount that is equal to 25% of the current Effect Hit Rate, up to a maximum of 25%."
      }
      304: {
        Name: 'Belobog of the Architects'
        Description2pc: "Increases the wearer's DEF by 15%. When the wearer's Effect Hit Rate is 50% or higher, the wearer gains an extra 15% DEF."
      }
      305: {
        Name: 'Celestial Differentiator'
        Description2pc: "Increases the wearer's CRIT DMG by 16%. When the wearer's current CRIT DMG reaches 120% or higher, after entering battle, the wearer's CRIT Rate increases by 60% until the end of their first attack."
      }
      306: {
        Name: 'Inert Salsotto'
        Description2pc: "Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 50% or higher, the DMG dealt by the wearer's Ultimate and follow-up attack increases by 15%."
      }
      307: {
        Name: 'Talia: Kingdom of Banditry'
        Description2pc: "Increases the wearer's Break Effect by 16%. When the wearer's SPD reaches 145 or higher, the wearer's Break Effect increases by an extra 20%."
      }
      308: {
        Name: 'Sprightly Vonwacq'
        Description2pc: "Increases the wearer's Energy Regeneration Rate by 5%. When the wearer's SPD reaches 120 or higher, the wearer's action is Advanced Forward by 40% immediately upon entering battle."
      }
      309: {
        Name: 'Rutilant Arena'
        Description2pc: "Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 70% or higher, DMG dealt by Basic ATK and Skill increases by 20%."
      }
      310: {
        Name: 'Broken Keel'
        Description2pc: "Increases the wearer's Effect RES by 10%. When the wearer's Effect RES is at 30% or higher, all allies' CRIT DMG increases by 10%."
      }
      311: {
        Name: 'Firmament Frontline: Glamoth'
        Description2pc: "Increases the wearer's ATK by 12%. When the wearer's SPD is equal to or higher than 135/160, the wearer deals 12%/18% more DMG."
      }
      312: {
        Name: 'Penacony, Land of the Dreams'
        Description2pc: "Increases wearer's Energy Regeneration Rate by 5%. Increases DMG by 10% for all other allies that are of the same Type as the wearer."
      }
      313: {
        Name: 'Sigonia, the Unclaimed Desolation'
        Description2pc: "Increases the wearer's CRIT Rate by 4%. When an enemy target gets defeated, the wearer's CRIT DMG increases by 4%, stacking up to 10 time(s)."
      }
      314: {
        Name: 'Izumo Gensei and Takama Divine Realm'
        Description2pc: "Increases the wearer's ATK by 12%. When entering battle, if at least one other ally follows the same Path as the wearer, then the wearer's CRIT Rate increases by 12%."
      }
      315: {
        Name: 'Duran, Dynasty of Running Wolves'
        Description2pc: "When an ally uses a follow-up attack, the wearer gains 1 stack of Merit, stacking up to 5 time(s). Each stack of Merit increases the DMG dealt by the wearer's follow-up attacks by 5%. When there are 5 stacks, additionally increases the wearer's CRIT DMG by 25%."
      }
      316: {
        Name: 'Forge of the Kalpagni Lantern'
        Description2pc: "Increases the wearer's SPD by 6%. When the wearer hits an enemy target that has Fire Weakness, the wearer's Break Effect increases by 40%, lasting for 1 turn(s)."
      }
      317: {
        Name: 'Lushaka, the Sunken Seas'
        Description2pc: "Increases the wearer's Energy Regeneration Rate by 5%. If the wearer is not the first character in the team lineup, then increases the ATK of the first character in the team lineup by 12%."
      }
      318: {
        Name: 'The Wondrous BananAmusement Park'
        Description2pc: "Increases the wearer's CRIT DMG by 16%. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by 32%."
      }
    }
    Lightcones: {
      20000: {
        Name: 'Arrows'
      }
      20001: {
        Name: 'Cornucopia'
      }
      20002: {
        Name: 'Collapsing Sky'
      }
      20003: {
        Name: 'Amber'
      }
      20004: {
        Name: 'Void'
      }
      20005: {
        Name: 'Chorus'
      }
      20006: {
        Name: 'Data Bank'
      }
      20007: {
        Name: 'Darting Arrow'
      }
      20008: {
        Name: 'Fine Fruit'
      }
      20009: {
        Name: 'Shattered Home'
      }
      20010: {
        Name: 'Defense'
      }
      20011: {
        Name: 'Loop'
      }
      20012: {
        Name: 'Meshing Cogs'
      }
      20013: {
        Name: 'Passkey'
      }
      20014: {
        Name: 'Adversarial'
      }
      20015: {
        Name: 'Multiplication'
      }
      20016: {
        Name: 'Mutual Demise'
      }
      20017: {
        Name: 'Pioneering'
      }
      20018: {
        Name: 'Hidden Shadow'
      }
      20019: {
        Name: 'Mediation'
      }
      20020: {
        Name: 'Sagacity'
      }
      21000: {
        Name: 'Post-Op Conversation'
      }
      21001: {
        Name: 'Good Night and Sleep Well'
      }
      21002: {
        Name: 'Day One of My New Life'
      }
      21003: {
        Name: 'Only Silence Remains'
      }
      21004: {
        Name: 'Memories of the Past'
      }
      21005: {
        Name: 'The Moles Welcome You'
      }
      21006: {
        Name: 'The Birth of the Self'
      }
      21007: {
        Name: 'Shared Feeling'
      }
      21008: {
        Name: 'Eyes of the Prey'
      }
      21009: {
        Name: "Landau's Choice"
      }
      21010: {
        Name: 'Swordplay'
      }
      21011: {
        Name: 'Planetary Rendezvous'
      }
      21012: {
        Name: 'A Secret Vow'
      }
      21013: {
        Name: 'Make the World Clamor'
      }
      21014: {
        Name: 'Perfect Timing'
      }
      21015: {
        Name: 'Resolution Shines As Pearls of Sweat'
      }
      21016: {
        Name: 'Trend of the Universal Market'
      }
      21017: {
        Name: 'Subscribe for More!'
      }
      21018: {
        Name: 'Dance! Dance! Dance!'
      }
      21019: {
        Name: 'Under the Blue Sky'
      }
      21020: {
        Name: "Geniuses' Repose"
      }
      21021: {
        Name: 'Quid Pro Quo'
      }
      21022: {
        Name: 'Fermata'
      }
      21023: {
        Name: 'We Are Wildfire'
      }
      21024: {
        Name: 'River Flows in Spring'
      }
      21025: {
        Name: 'Past and Future'
      }
      21026: {
        Name: 'Woof! Walk Time!'
      }
      21027: {
        Name: 'The Seriousness of Breakfast'
      }
      21028: {
        Name: 'Warmth Shortens Cold Nights'
      }
      21029: {
        Name: 'We Will Meet Again'
      }
      21030: {
        Name: 'This Is Me!'
      }
      21031: {
        Name: 'Return to Darkness'
      }
      21032: {
        Name: 'Carve the Moon, Weave the Clouds'
      }
      21033: {
        Name: 'Nowhere to Run'
      }
      21034: {
        Name: 'Today Is Another Peaceful Day'
      }
      21035: {
        Name: 'What Is Real?'
      }
      21036: {
        Name: 'Dreamville Adventure'
      }
      21037: {
        Name: 'Final Victor'
      }
      21038: {
        Name: 'Flames Afar'
      }
      21039: {
        Name: "Destiny's Threads Forewoven"
      }
      21040: {
        Name: 'The Day The Cosmos Fell'
      }
      21041: {
        Name: "It's Showtime"
      }
      21042: {
        Name: 'Indelible Promise'
      }
      21043: {
        Name: 'Concert for Two'
      }
      21044: {
        Name: 'Boundless Choreo'
      }
      21045: {
        Name: 'After the Charmony Fall'
      }
      21046: {
        Name: 'Poised to Bloom'
      }
      21047: {
        Name: 'Shadowed by Night'
      }
      22000: {
        Name: 'Before the Tutorial Mission Starts'
      }
      22001: {
        Name: 'Hey, Over Here'
      }
      22002: {
        Name: "For Tomorrow's Journey"
      }
      23000: {
        Name: 'Night on the Milky Way'
      }
      23001: {
        Name: 'In the Night'
      }
      23002: {
        Name: 'Something Irreplaceable'
      }
      23003: {
        Name: "But the Battle Isn't Over"
      }
      23004: {
        Name: 'In the Name of the World'
      }
      23005: {
        Name: 'Moment of Victory'
      }
      23006: {
        Name: 'Patience Is All You Need'
      }
      23007: {
        Name: 'Incessant Rain'
      }
      23008: {
        Name: 'Echoes of the Coffin'
      }
      23009: {
        Name: 'The Unreachable Side'
      }
      23010: {
        Name: 'Before Dawn'
      }
      23011: {
        Name: 'She Already Shut Her Eyes'
      }
      23012: {
        Name: 'Sleep Like the Dead'
      }
      23013: {
        Name: 'Time Waits for No One'
      }
      23014: {
        Name: 'I Shall Be My Own Sword'
      }
      23015: {
        Name: 'Brighter Than the Sun'
      }
      23016: {
        Name: 'Worrisome, Blissful'
      }
      23017: {
        Name: 'Night of Fright'
      }
      23018: {
        Name: 'An Instant Before A Gaze'
      }
      23019: {
        Name: 'Past Self in Mirror'
      }
      23020: {
        Name: 'Baptism of Pure Thought'
      }
      23021: {
        Name: 'Earthly Escapade'
      }
      23022: {
        Name: 'Reforged Remembrance'
      }
      23023: {
        Name: 'Inherently Unjust Destiny'
      }
      23024: {
        Name: 'Along the Passing Shore'
      }
      23025: {
        Name: 'Whereabouts Should Dreams Rest'
      }
      23026: {
        Name: 'Flowing Nightglow'
      }
      23027: {
        Name: 'Sailing Towards a Second Life'
      }
      23028: {
        Name: 'Yet Hope Is Priceless'
      }
      23029: {
        Name: 'Those Many Springs'
      }
      23030: {
        Name: 'Dance at Sunset'
      }
      23031: {
        Name: 'I Venture Forth to Hunt'
      }
      23032: {
        Name: 'Scent Alone Stays True'
      }
      24000: {
        Name: 'On the Fall of an Aeon'
      }
      24001: {
        Name: 'Cruising in the Stellar Sea'
      }
      24002: {
        Name: 'Texture of Memories'
      }
      24003: {
        Name: 'Solitary Healing'
      }
      24004: {
        Name: 'Eternal Calculus'
      }
    }
    Paths: {
      Warrior: 'Destruction'
      Rogue: 'The Hunt'
      Mage: 'Erudition'
      Shaman: 'Harmony'
      Warlock: 'Nihility'
      Knight: 'Preservation'
      Priest: 'Abundance'
      undefined: 'General'
    }
    Elements: {
      Physical: 'Physical'
      Fire: 'Fire'
      Ice: 'Ice'
      Thunder: 'Lightning'
      Wind: 'Wind'
      Quantum: 'Quantum'
      Imaginary: 'Imaginary'
    }
  }
  getStartedTab: {}
  hint: {
    RatingFilter: {
      Title: 'Rating filters'
      p1: 'Weight - Sum of substat weights of all 6 relics, from the Substat weight filter'
      p2: 'Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives'
      p3: 'Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options.'
    }
    CombatBuffs: {
      Title: 'Combat buffs'
      p1: 'Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations.'
    }
    StatFilters: {
      Title: 'Stat filters'
      p1: 'Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges'
      p2: 'Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect'
      p3: "NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can't detect the hidden decimals."
    }
    Mainstats: {
      Title: 'Main stats'
      p1: 'Select main stats to use for optimization search. Multiple values can be selected for more options'
    }
    Sets: {
      Title: 'Sets'
      p1: 'Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options'
      p2: 'Set effects will be accounted for in calculations, use the Conditional set effects menu to customize which effects are active.'
    }
    Character: {
      Title: 'Character'
      p1: 'Select the character and eidolon. Character is assumed to be level 80 with maxed traces in optimization calcs.'
    }
    CharacterPassives: {
      Title: 'Character passives'
      p1: 'Select the conditional effects to apply to the character.'
      p2: 'Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here.'
    }
    LightconePassives: {
      Title: 'Light cone passives'
      p1: 'Select the conditional effects to apply to the light cone.'
      p2: 'Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here.'
    }
    Lightcone: {
      Title: 'Light cone'
      p1: 'Select the light cone and superimposition. Light cone is assumed to be level 80 in optimization calcs.'
      p2: 'Superimposition and passive effects are applied under the Light cone passives panel.'
    }
    Actions: {
      Title: 'Actions'
      p1: 'Equip - Equip the selected relics from the grid onto the character'
      p2: 'Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search'
      p3: 'Pin build - Pin the currently selected row to the top of the grid. Use this to compare multiple builds more easily'
      p4: 'Clear pins - Clear all the builds that you pinned to the top of the grid'
    }
    OptimizerOptions: {
      Title: 'Optimizer options'
      p1: '<0>Character priority filter</0> - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.'
      p2: "<0>Boost main stat</0> - Calculates relic mains stats as if they were this level (or their max if they can't reach this level) if they are currently below it. Substats are not changed accordingly, so builds with lower level relics may be stronger once you level them."
      p3: '<0>Keep current relics</0> - The character must use its currently equipped items, and the optimizer will try to fill in empty slots'
      p4: '<0>Include equipped relics</0> - When enabled, the optimizer will allow using currently equipped by a character for the search. Otherwise equipped relics are excluded'
      p5: "<0>Priority</0> - See: Character priority filter. Changing this setting will change the character's priority"
      p6: "<0>Exclude</0> - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter"
      p7: '<0>Enhance / grade</0> - Select the minimum enhance to search for and minimum stars for relics to include'
    }
    Relics: {
      Title: 'Relics'
      p1: "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats."
      p2: "Selected character: Score - The relic's current weight as defined by the scoring algorithm for the currently selected character"
      p3: "Selected character: Average potential - The relic's potential weight if rolls went into the average weight of the relic's substats"
      p4: "Selected character: Max potential - The relic's maximum potential weight if all future rolls went into the character's desired stats"
      p5: 'All characters: Max potential - The highest possible potential value of the relic, out of all characters in the game.'
    }
    OptimizationDetails: {
      Title: 'Optimization details'
      p1: 'Shows how many relics are being used in the optimization search, after all filters are applied'
      p2: 'Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time'
      p3: 'Searched - Number of permutations already searched'
      p4: 'Results - Number of displayed results that satisfy the stat filters'
    }
    EnemyOptions: {
      Title: 'Enemy options'
      p1: 'Level - Enemy level, affects enemy DEF calculations'
      p2: 'Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.'
      p3: "RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled."
      p4: "Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage."
      p5: "Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0."
      p6: "Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives."
    }
    SubstatWeightFilter: {
      Title: 'Substat weight filter'
      p1: 'This filter is used to reduce the number of permutations the optimizer has to process.'
      p2: 'It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.'
      p3: 'Only relics that have more than the specified number of weighted rolls will be used for the optimization search.'
      p4: 'Note that setting the minimum rolls too low may result in some builds not being displayed, if the filter ends up excludes a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time.'
    }
    StatDisplay: {
      Title: 'Stat and filter view'
      p1: 'This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.'
      p2: "Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied."
      p3: "Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
    }
    ValueColumns: {
      Title: 'Value Columns'
      p1: "You can optionally display a number of columns that assess the relative 'value' of a relic."
      p2: 'Weight'
      p3: 'Weight columns assess the contribution of a particular relic to the overall letter grading of the selected recommendation character (if any).'
      p4: "Weight can show the current value of a relic, the possible best case upgraded weight, or an 'average' weight that you're more likely to see"
      p5: 'Weight is useful to focus on a single character and see which relics might give them a higher letter grading.'
      p6: 'Potential'
      p7: "Potential is a character-specific percentage of how good the relic could be (or 'is', if fully upgraded), compared against the stats on a fully upgraded 'perfect' relic in that slot."
      p8: 'Potential can look at all characters or just owned. It then takes the maximum percentage for any character.'
      p9: "Potential is useful for finding relics that aren't good on any character, or hidden gems that could be great when upgraded."
      p10: 'Note: ordering by potential can be mismatched against weights, due to weight calculations preferring lower weight ideal mainstats.'
    }
    RelicInsights: {
      Title: 'Relic Insight'
      p1: 'When a relic is selected in the table above, you can choose an analysis to view a plot of.'
      p2: "'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<0/>If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<1/>⚠️ Relics with missing substats may have misleadlingly high buckets, as best-case upgrade analysis assumes the best new substat per character."
      p3: "'Top 10' takes the top 10 characters that this relic could be best for, and shows the range of '% perfection' upgrading this relic could result in."
    }
    RelicLocation: {
      Title: 'Relic Location'
      p1: 'When a relic is selected in the grid, its position in the ingame inventory is displayed here.'
      p2: 'If the set / part filters are active, apply those same filters ingame, then sort by Date Obtained (newest first) to find the relic.'
      p3: '⚠️Usage notes⚠️'
      p4: 'This is only supported with Reliquary Archiver import'
      p5: 'If new relics were deleted or obtained since the last import, they must be re-scanned and imported'
      p6: 'Select the appropriate Inventory width setting to get accurate locations. The width depends on the ingame screen and menu width'
    }
    LocatorParams: {
      Title: 'Relic Locator Options'
      p1: '<0>Inventory Width</0> - Select the number of columns the inventory has ingame so that the relic locator can find your relic accurately'
      p2: '<0>Auto Filter rows</0> - Maximum number of rows before the relic locator applies a part/set filter to try and bring the searched relic closer to the top of your inventory'
    }
  }
  importSaveTab: {
    TabLabels: {
      Import: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) scanner importer'
      Load: 'Load optimizer data'
      Save: 'Save optimizer data'
      Clear: 'Clear optimizer data'
    }
    Import: {
      ErrorMsg: {
        Unknown: 'Unknown Error'
        InvalidFile: 'Invalid scanner file'
        InvalidJson: 'Invalid JSON'
        Fragment: 'Error occurred while importing file: '
      }
      Stage1: {
        Header: 'Install and run one of the $t(common:Relic, {"count": 1, "capitalizeLength": 0}) scanner options:'
        ReliquaryDesc: {
          Title: '(Recommended) IceDynamix Reliquary Archiver'
          Link: 'Github'
          OnlineMsg: 'Status: Updated for patch {{version}} — New download required'
          OfflineMsg: '***** Status: Down for maintenance after {{version}} patch *****'
          l1: 'Accurate speed decimals, instant scan'
          l2: 'Imports full inventory and $t(common:Character, {"count": 1, "capitalizeLength": 0}) roster'
        }
        KelzDesc: {
          Title: 'Kel-Z HSR Scanner'
          Link: 'Github'
          l1: 'Inaccurate speed decimals, 5-10 minutes OCR scan'
          l2: 'Imports full inventory and $t(common:Character, {"count": 1, "capitalizeLength": 0}) roster'
        }
        ScorerDesc: {
          Title: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) Scorer Import'
          Link: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) scorer'
          l1: 'Accurate speed decimals, instant scan'
          l2: 'No download needed, but limited to $t(common:Relic, {"count": 48, "capitalizeLength": 0}) from the 8 $t(common:Character, {"count": 26, "capitalizeLength": 0}) on profile showcase'
        }
        HoyolabDesc: {
          Title: 'HoyoLab Import'
          Link: 'Instructions'
          l1: 'Inaccurate speed decimals, instant scan'
          l2: "No download needed, but limited to ingame $t(common:Character, {\"count\": 26, \"capitalizeLength\": 0})' equipped $t(common:Relic, {\"count\": 6, \"capitalizeLength\": 0})"
        }
        ButtonText: 'Upload scanner json file'
        Or: 'or'
        Placeholder: 'Paste json file contents'
      }
      Stage2: {
        Or: 'OR'
        FileInfo: 'File contains $t(common:RelicWithCount, {"count": {{reliccount}} }) and $t(common:CharacterWithCount, {"count": {{charactercount}} }).'
        NoRelics: 'Invalid scanner file, please try a different file'
        RelicsImport: {
          Label: "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) only. Updates the optimizer with the new dataset of $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) and doesn't overwrite builds."
          ButtonText: 'Import $t(common:Relic, {"count": 123, "capitalizeLength": 0})'
        }
        CharactersImport: {
          Label: "Import $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) only. Updates the optimizer with the new dataset of $t(common:Relic, {\"count\": 123, \"capitalizeLength\": 0}) and doesn't overwrite builds."
          ButtonText: 'Import $t(common:Relic, {"count": 123, "capitalizeLength": 0}) & $t(common:Character, {"count": 123, "capitalizeLength": 0})'
          WarningTitle: 'Overwrite optimizer builds'
          WarningDescription: 'Are you sure you want to overwrite your optimizer builds with ingame builds?'
        }
      }
      Stage3: {
        SuccessMessage: 'Done!'
      }
    }
    LoadData: {
      Stage1: {
        Label: 'Load your optimizer data from a file.'
        ButtonText: 'Load save data'
      }
      Stage2: {
        ErrorMsg: 'Invalid save file, please try a different file. Did you mean to use the "$t(tablabels.import)" tab?'
        Label: 'File contains $t(common:RelicWithCount, {"count": {{reliccount}} }) and $t(common:CharacterWithCount, {"count": {{charactercount}} }). Replace your current data with the uploaded data?'
        ButtonText: 'Use uploaded data'
      }
      Stage3: {
        SuccessMessage: 'Done!'
      }
    }
    SaveData: {
      Label: 'Save your optimizer data to a file.'
      ButtonText: 'Save data'
      SuccessMessage: 'Done'
    }
    ClearData: {
      Label: 'Clear all optimizer data.'
      ButtonText: 'Clear data'
      SuccessMessage: 'Cleared data'
      WarningTitle: 'Erase all data'
      WarningDescription: 'Are you sure you want to clear all $t(common:Relic, {"count": 1300, "capitalizeLength": 0}) and $t(common:Character, {"count": 26, "capitalizeLength": 0})?'
    }
    PartialImport: {
      OldRelics: 'Updated stats for {{count}} existing $t(common:Relic, {"count": {{count}}, "capitalizeLength": 0})'
      NewRelics: 'Added {{count}} new $t(common:Relic, {"count": {{count}}, "capitalizeLength": 0})'
    }
  }
  modals: {
    'Scoring': {
      StatWeightsHeader: 'Stat weights'
      MainstatsHeader: 'Optimal mainstats'
      WeightMethodology: {
        Header: 'Substat weight methodology'
        RevealText: 'Click to show details'
        Paragraph1: 'Substat weights are graded on a 0.0 to 1.0 scale in increments of 0.25, based on how valuable each stat is to the character. Weights are evaluated based on the following general ruleset:'
        Paragraph2: "<0><0>Speed weight:</0></0><1>— SPD is given a value of 1.0 for every character. This is due to the importance of speed tuning in team compositions, and the optimizer should be used to maximize each character's stats at a certain speed breakpoint.</1><2/><3><0>CRIT Rate / CRIT Damage weight:</0></3><4>— Crit DPS in general are given the weights 0.75 ATK | 1.0 SPD | 1.0 CR | 1.0 CD, unless they have any other special scaling.</4><5>— ATK is weighted slightly than CR and CD rolls because in general crit substats will provide a higher boost to damage.</5><6/><7><0>HP / DEF weight:</0></7><8>— Defensive supports are given 2.0 weight to distribute between HP and DEF.</8><9>— For each additional (0.75 | 1.0) stat weight that they scale with, deduct 0.5 down to a minimum of 1.0.</9><10>— If 2.0 still remains and one of the stats is worth more than the other (Huohuo and HP% for example), assign a 1.0 / 0.75 split.</10><11>— Offensive supports follow the same ruleset, except they start with 1.5 weight to distribute between HP and DEF.</11><12/><13><0>RES weight:</0></13><14>— Support characters are granted 0.5 RES weight by default, with an additional 0.25 weight if they have synergy with RES or have critical team-saving abilities.</14>"
        Paragraph3: "These weights are the defaults, but each player may have different preferences. Feel free to adjust the weights to fit a certain playstyle. DPS characters should rely on the optimizer and Combat Score to evaluate their performance in combat, since substats scores don't take into account external factors like team buffs or passive effects."
      }
      CalculationMethodology: {
        Header: 'Calculations'
        RevealText: 'Click to show details'
        Paragraph1: 'Relic scores are calculated by <2>Score = substatScore / idealScore * {{percentToScore}}</2>. This allows for characters with fewer desired stats to achieve scores comparable to characters with many desired stats.'
        Paragraph2: 'The idealScore is the substatScore for a theoretical perfect relic. By adjusting the score to the maximum possible relic, this means that when a weighted substat is occupied by the main stat, the score value of the remaining substat weights increases.'
        Paragraph3: 'The substatScore is calculated by <2>SubstatScore = weight * normalization * value</2>. The weight of each stat is defined above, on a scale of 0 to 1. The normalization of each stat is calculated based on the ratio of their main stat values to Crit DMG with max value <5>64.8</5>:'
        Paragraph4: '<0><0><0>$t(common:ShortStats.CRIT DMG) $t(common:ShortStats.Break Effect) = 64.8 / 64.8 == 1.0</0></0><1><0>$t(common:ShortStats.DEF%) = 64.8 / 54.0 == 1.2</0></1><2><0>$t(common:ShortStats.HP%) $t(common:ShortStats.ATK%) $t(common:ShortStats.Effect Hit Rate) $t(common:ShortStats.Effect RES) = 64.8 / 43.2 == 1.5</0></2><3><0>$t(common:ShortStats.CRIT Rate) = 64.8 / 32.4 == 2</0></3></0><1><0><0>$t(common:ShortStats.SPD) = 64.8 / 25.032 == 2.59</0></0><1><0>$t(common:ShortStats.Outgoing Healing Boost) = 64.8 / 34.561 == 1.87</0></1><2><0>$t(common:ShortStats.Energy Regeneration Rate) = 64.8 / 19.439 == 3.33</0></2><3><0>ELEMENTAL DMG = 64.8 / 38.88 == 1.67</0></3></1>'
        Paragraph5: 'Flat ATK/HP/DEF have a separate calculation: Their weights are automatically calculated based on the weights given to their respective % counterparts<3> % stat weight * flat stat low roll / (baseStats[stat] * 2 * % stat low roll)</3>the weight calculation for flat atk for Seele for example would be:<5> 0.75 * 19 / (baseStats.ATK * 2 * 0.03888) = 0.75 * 19 / (640.33 * 2 * 0.03888) = 0.28619</5>.'
        Paragraph6: 'The normalization is calculated based on the normalization for the respective % counterparts:<1><0>64.8 / % main stat value * % stat high roll value / flat stat high roll value</0>. In combination with the adjusted weights, this allows for flat stats to be accurately scored when compared against their % counterparts.</1>'
        Paragraph7: 'A letter grade is assigned based on the number of normalized min rolls of each substat. The score for each min roll is equivalent to <2>{{minRollValue}}</2>\nThe general scale for grade by rolls is<5>F=1, D=2, C=3, B=4, A=5, S=6, SS=7, SSS=8, WTF=9</5> with a <9>+</9> assigned for an additional half roll.'
        Paragraph8: 'Character scores are calculated by <2>Score = sum(relic scores) + sum(main stat scores)</2>. Only the feet/body/sphere/rope relics have main stat scores. The main stat score for a 5 star maxed relic is <5>64.8</5> if the main stat is optimal, otherwise scaled down by the stat weight. Non 5 star relic scores are also scaled down by their maximum enhance. Characters are expected to have 3 full sets, so 3 rolls worth of score is deducted for each missing set.'
        Paragraph9: 'Relics with main stats (body/feet/sphere/rope) are granted extra rolls to compensate for the difficulty of obtaining optimal main stats with desired substats. These numbers were calculated by a simulation of relic rolls accounting for main stat drop rate and expected substat value. These rolls are first multiplied by the min roll value of <2>{{minRollValue}}</2> and then, if the main stat is not optimal, scaled down by the stat weight to obtain the bonus score value.'
        Paragraph10: '<0><0><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusBodyHPP}}</0></0><1><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusBodyATKP}}</0></1><2><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusBodyDEFP}}</0></2><3><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.CRIT Rate): {{mainStatBonusBodyCR}}</0></3><4><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.CRIT DMG): {{mainStatBonusBodyCD}}</0></4></0><1><0><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.Outgoing Healing Boost): {{mainStatBonusBodyOHB}}</0></0><1><0>$t(common:ReadableParts.Body) — $t(common:ShortSpacedStats.Effect Hit Rate): {{mainStatBonusBodyEHR}}</0></1><2><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusFeetHPP}}</0></2><3><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusFeetATKP}}</0></3><4><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusFeetDEFP}}</0></4></1><2><0><0>$t(common:ReadableParts.Feet) — $t(common:ShortSpacedStats.SPD): {{mainStatBonusFeetSPD}}</0></0><1><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusSphereHPP}}</0></1><2><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusSphereATKP}}</0></2><3><0>$t(common:ReadableParts.PlanarSphere) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusSphereDEFP}}</0></3><4><0>$t(common:ReadableParts.PlanarSphere) — Elemental DMG %: {{mainStatBonusSphereElem}}</0></4></2><3><0><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.HP%): {{mainStatBonusRopeHPP}}</0></0><1><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.ATK%): {{mainStatBonusRopeATKP}}</0></1><2><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.DEF%): {{mainStatBonusRopeDEFP}}</0></2><3><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.Break Effect): {{mainStatBonusRopeBE}}</0></3><4><0>$t(common:ReadableParts.LinkRope) — $t(common:ShortSpacedStats.Energy Regeneration Rate): {{mainStatBonusRopeERR}}</0></4></3>'
        Paragraph11: 'This scoring method is still experimental and subject to change, please come by the discord server to share any feedback!'
      }
      Footer: {
        Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
        Reset: '$t(common:Reset, {"capitalizeLength": 1}) to default'
        ResetAll: '$t(common:Reset, {"capitalizeLength": 1}) all $t(common:Character, {"count": 35, "capitalizeLength": 0})'
        Save: '$t(common:Save, {"capitalizeLength": 1}) changes'
      }
      ResetAllConfirm: {
        Title: '$t(common:Reset, {"capitalizeLength": 1}) the scoring algorithm for all characters?'
        Description: 'You will lose any custom scoring settings you have set on any character.'
        Yes: '$t(common:Yes, {"capitalizeLength": 1})'
        No: '$t(common:No, {"capitalizeLength": 1})'
      }
    }
    '0Perms': {
      Title: 'Search generated 0 permutations'
      Description: 'This means your filters are misconfigured or too restrictive, and no possibilities match the filters. Permutations are shown on the sidebar.'
      RootCauses: {
        IMPORT: {
          Description: 'Import relics from your account on the Importer tab'
          ButtonText: 'Navigate to Importer tab'
          SuccessMessage: 'Choose an import method and import your relics and characters'
        }
        Body_MAIN: {
          Description: 'The main stat for the $t(common:Parts.Body) filter might be too restrictive'
          ButtonText: 'Clear $t(common:Parts.Body) main stat filters'
          SuccessMessage: 'Cleared $t(common:Parts.Body) main stat filters'
        }
        Feet_MAIN: {
          Description: 'The main stat for the $t(common:Parts.Feet) filter might be too restrictive'
          ButtonText: 'Clear $t(common:Parts.Feet) main stat filters'
          SuccessMessage: 'Cleared $t(common:Parts.Feet) main stat filters'
        }
        PlanarSphere_MAIN: {
          Description: 'The main stat for the $t(common:Parts.PlanarSphere) filter might be too restrictive'
          ButtonText: 'Clear $t(common:Parts.PlanarSphere) main stat filters'
          SuccessMessage: 'Cleared $t(common:Parts.PlanarSphere) main stat filters'
        }
        LinkRope_MAIN: {
          Description: 'The main stat for the $t(common:Parts.LinkRope) filter might be too restrictive'
          ButtonText: 'Clear $t(common:Parts.LinkRope) main stat filters'
          SuccessMessage: 'Cleared $t(common:Parts.LinkRope) main stat filters'
        }
        RELIC_SETS: {
          Description: 'The selected relic set filters might be too restrictive'
          ButtonText: 'Clear Relic set filters'
          SuccessMessage: 'Cleared relic set filters'
        }
        ORNAMENT_SETS: {
          Description: 'The selected ornament set filters might be too restrictive'
          ButtonText: 'Clear Ornament set filters'
          SuccessMessage: 'Cleared ornament set filters'
        }
        KEEP_CURRENT: {
          Description: 'The "Keep current relics" option is enabled, which forces any currently equipped relics on the character to be unchanged in the search'
          ButtonText: 'Disable "Keep current relics"'
          SuccessMessage: 'Disabled "Keep current relics"'
        }
        PRIORITY: {
          Description: "The character is ranked below other characters on the priority list. When the \"Character priority filter\" is enabled, characters may only take lower priority characters' relics"
          ButtonText: 'Move character to priority #1'
          SuccessMessage: 'Moved character to priority #1'
        }
        EXCLUDE_ENABLED: {
          Description: 'The "Exclude" filter has some selected characters, which means this character cannot take relics from the selected characters'
          ButtonText: 'Clear excluded characters'
          SuccessMessage: 'Cleared excluded characters'
        }
        EQUIPPED_DISABLED: {
          Description: 'The "Include equipped relics" filter is disabled, which means this character cannot take any relics belonging to other characters'
          ButtonText: 'Enable "Include equipped relics"'
          SuccessMessage: 'Enabled "Include equipped relics"'
        }
        MINIMUM_ROLLS: {
          Description: 'The substat weight filter has a minimum roll threshold that might be too high'
          ButtonText: 'Set minimum rolls to 0'
          SuccessMessage: 'Set minimum rolls to 0'
        }
      }
    }
    '0Results': {
      Title: 'Search generated 0 results'
      ResetAll: {
        ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) all filters'
        SuccessMessage: 'Cleared all filters'
        Description: 'This means your stat and/or rating filters are too restrictive.'
      }
      RootCauses: {
        StatView: {
          SuccessMessage: 'Switched to Combat stats view'
          Description: 'Your stat filters are configured for basic stats, which does not include buffs. The Combat stats view will show buffed stats from abilities / teammates / relics / etc.'
          ButtonText: 'Switch to Combat stats view'
        }
        MAX_HP: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.HP) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.HP) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.HP) filter'
        }
        MIN_HP: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.HP) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.HP) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.HP) filter'
        }
        MAX_ATK: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.ATK) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.ATK) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.ATK) filter'
        }
        MIN_ATK: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.ATK) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.ATK) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.ATK) filter'
        }
        MAX_DEF: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.DEF) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.DEF) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.DEF) filter'
        }
        MIN_DEF: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.DEF) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.DEF) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.DEF) filter'
        }
        MAX_SPD: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.SPD) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.SPD) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.SPD) filter'
        }
        MIN_SPD: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.SPD) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.SPD) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.SPD) filter'
        }
        MAX_CR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) filter'
        }
        MIN_CR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT Rate) filter'
        }
        MAX_CD: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) filter'
        }
        MIN_CD: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.CRIT DMG) filter'
        }
        MAX_EHR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) filter'
        }
        MIN_EHR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect Hit Rate) filter'
        }
        MAX_RES: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) filter'
        }
        MIN_RES: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Effect RES) filter'
        }
        MAX_BE: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) filter'
        }
        MIN_BE: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Break Effect) filter'
        }
        MAX_ERR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) filter'
        }
        MIN_ERR: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) $t(common:Stats.Energy Regeneration Rate) filter'
        }
        MAX_WEIGHT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Weight filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) weight may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Weight filter'
        }
        MIN_WEIGHT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Weight filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) weight may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Weight filter'
        }
        MAX_EHP: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) EHP filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) EHP may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) EHP filter'
        }
        MIN_EHP: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) EHP filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) EHP may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) EHP filter'
        }
        MAX_BASIC: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Basic filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) basic attack damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Basic filter'
        }
        MIN_BASIC: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Basic filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) basic attack damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Basic filter'
        }
        MAX_SKILL: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Skill filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) skill damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Skill filter'
        }
        MIN_SKILL: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Skill filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) skill damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Skill filter'
        }
        MAX_ULT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) ULT filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) ultimate damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) ULT filter'
        }
        MIN_ULT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) ULT filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) ultimate damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) ULT filter'
        }
        MAX_FUA: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) FUA filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) follow-up attack damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) FUA filter'
        }
        MIN_FUA: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) FUA filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) follow-up attack damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) FUA filter'
        }
        MAX_DOT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) DOT filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) DOT damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) DOT filter'
        }
        MIN_DOT: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) DOT filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) DOT damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) DOT filter'
        }
        MAX_BREAK: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Break filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) break damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Break filter'
        }
        MIN_BREAK: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Break filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) break damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Break filter'
        }
        MAX_COMBO: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Combo filter'
          Description: '$t(common:Maximum, {"capitalizeLength": 1}) combo damage may be too low'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Maximum, {"capitalizeLength": 1}) Combo filter'
        }
        MIN_COMBO: {
          SuccessMessage: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Combo filter'
          Description: '$t(common:Minimum, {"capitalizeLength": 1}) combo damage may be too high'
          ButtonText: '$t(common:Reset, {"capitalizeLength": 1}) $t(common:Minimum, {"capitalizeLength": 1}) Combo filter'
        }
      }
    }
    'ManyPerms': {
      Title: 'Very large search requested'
      Text: 'This optimization search will take a substantial amount of time to finish. You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats, or use the Substat weight filter to reduce the number of permutations.'
      Cancel: '$t(common:Cancel, {"capitalizeLength": 1}) search'
      Proceed: 'Proceed with search'
    }
    'EditCharacter': {
      EidolonButton: '$t(common:EidolonNShort, {"eidolon":{{eidolon}} })'
      SuperimpositionButton: '$t(common:SuperimpositionNShort, {"superimposition":{{superimposition}} })'
      Character: '$t(common:Character, {"count": 1, "capitalizeLength": 1})'
      Lightcone: '$t(common:Lightcone, {"count": 1, "capitalizeLength": 1})'
      Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
      Save: '$t(common:Save, {"capitalizeLength": 1})'
    }
    'Relic': {
      Part: 'Part'
      Wearer: 'Equipped by'
      Set: 'Set'
      Enhance: 'Enhance / Grade'
      Mainstat: 'Main stat'
      Substat: 'Substats'
      Upgrades: 'Substat upgrades'
      Messages: {
        SubmitFail: 'Submit failed!'
        RelicCompleted: 'Completed $t(common:Relic, {"count": 1, "capitalizeLength": 0})'
        EditSuccess: 'Successfully edited $t(common:Relic, {"count": 1, "capitalizeLength": 0})'
        Error: {
          PartMissing: 'Part field is missing'
          MainstatMissing: 'Main stat is missing'
          SetMissing: 'Set field is missing'
          EnhanceMissing: 'Enhance field is missing'
          GradeMissing: 'Grade field is missing'
          EnhanceInvalid: 'Enhance value is invalid'
          GradeInvalid: 'Grade value is invalid'
          EnhanceTooHigh: 'Enhance value is too high for this grade'
          SetInvalid: 'Set value is invalid'
          SetNotOrnament: 'The selected set is not an ornament set'
          SetNotRelic: 'The selected set is not a $t(common:Relic, {"count": 1, "capitalizeLength": 0}) set'
          SubNInvalid: 'Substat {{number}} is invalid'
          SubsOutOfOrder: 'Substats are out of order'
          DuplicateSubs: 'Duplicate substats, only one of each type is allowed'
          MainAsSub: 'Substat type is the same as the main stat'
          SubTooBig: 'Substat value is too big'
          MainTooBig: 'Main stat value is too big'
          SubTooSmall: 'Substat values should be positive'
          MainTooSmall: 'Main stat values should be positive'
        }
      }
    }
    'EditImage': {
      DefaultTitle: 'Edit image'
      Upload: {
        Title: 'Provide image'
        Radio: {
          Upload: 'Upload image'
          Url: 'Enter image URL'
          Default: 'Use default image'
        }
        Upload: {
          Method: 'Click or drag image file to this area to upload'
          Limit: 'Accepts .jpg .jpeg .png .gif (Max: 20MB)'
        }
        Url: {
          Label: 'Image'
          Rule: 'Please input a valid image URL'
        }
      }
      Edit: {
        Title: 'Crop image'
        Zoom: 'Zoom'
        Drag: 'Drag to move'
        Pinch: 'Pinch or scroll to zoom'
        ArtBy: '(Optional) Art by:'
        CreditPlaceholder: 'Credit the artist if possible'
      }
      Footer: {
        Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
        Change: 'Change image'
        Previous: 'Previous'
        Next: 'Next'
        Submit: '$t(common:Submit, {"capitalizeLength": 1})'
      }
    }
    'SaveBuild': {
      Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
      Save: '$t(common:Save, {"capitalizeLength": 1})'
      Label: 'Build name'
      Rule: 'Please input a name'
    }
    'SwitchRelics': {
      Title: 'Switch relics with character'
      Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
      Save: '$t(common:Save, {"capitalizeLength": 1})'
    }
    'Builds': {
      DeleteAll: 'Delete All'
      Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
      Equip: 'Equip'
      Score: '$t(common:Score, {"capitalizeLength": 1})'
      ConfirmModal: {
        ConfirmButton: '$t(common:Confirm, {"capitalizeLength": 1})'
        CancelButton: '$t(common:Cancel, {"capitalizeLength": 1})'
        Title: '$t(common:Confirm, {"capitalizeLength": 1})'
      }
      ConfirmEquip: {
        Content: 'Equipping this will unequip characters that use the relics in this build'
        SuccessMessage: 'Successfully equipped build: {{buildName}}'
      }
      ConfirmDelete: {
        DeleteAll: 'Are you sure you want to delete all builds?'
        DeleteSingle: 'Are you sure you want to delete {{name}}?'
        SuccessMessageAll: 'Successfully deleted all builds for {{characterName}}'
        SuccessMessageSingle: 'Successfully deleted build: {{name}}'
      }
      NoBuilds: {
        Ok: '$t(common:Ok, {"capitalizeLength": 1})'
        Cancel: '$t(common:Cancel, {"capitalizeLength": 1})'
        NoneSaved: 'No saved builds'
      }
    }
    'ScoreFooter': {
      ModalTitle: 'Combat sim scoring settings'
      ResetButtonText: '$t(common:Reset, {"capitalizeLength": 1}) custom team to default'
      ResetSuccessMsg: '$t(common:Reset, {"capitalizeLength": 1}) to default teams'
      SyncButtonText: 'Sync imported eidolons / light cones'
      SyncSuccessMsg: 'Synced teammates'
      TeamOptions: {
        Default: 'Default'
        Custom: 'Custom'
      }
    }
    'CharacterSelect': {
      MultiSelect: {
        Placeholder: 'Customize $t(common:Character, {"count": 12, "capitalizeLength": 0})'
        MaxTagPlaceholder_other: '{{count}} $t(common:Character, {"count": {{count}}, "capitalizeLength": 0}) excluded'
        MaxTagPlaceholder_zero: 'All $t(common:Character, {"count": 12, "capitalizeLength": 0}) enabled'
        ModalTitle: 'Select $t(common:Character, {"count": 12, "capitalizeLength": 0}) to exclude'
      }
      SingleSelect: {
        Placeholder: '$t(common:Character, {"count": 1, "capitalizeLength": 1})'
        ModalTitle: 'Select a $t(common:Character, {"count": 1, "capitalizeLength": 0})'
      }
      SearchPlaceholder: 'Search $t(common:Character, {"count": 1, "capitalizeLength": 0}) name'
      ExcludeButton: 'Exclude all'
      ClearButton: 'Clear'
    }
    'LightconeSelect': {
      Placeholder: '$t(common:Lightcone, {"count": 1, "capitalizeLength": 1})'
      Title: 'Select a $t(common:Lightcone, {"count": 1, "capitalizeLength": 0})'
    }
  }
  relicScorerTab: {
    Messages: {
      ThrottleWarning: 'Please wait {{seconds}} seconds before retrying'
      InvalidIdWarning: 'Invalid ID'
      IdLoadError: 'Error loading ID'
      SuccessMsg: 'Successfully loaded profile'
      LookupError: 'Error during lookup, please try again in a bit'
      NoCharacterSelected: 'No selected $t(common:Character, {"count": 1, "capitalizeLength": 0})'
      CharacterAlreadyExists: 'Selected $t(common:Character, {"count": 1, "capitalizeLength": 0}) already exists'
    }
    Header: {
      DowntimeWarning: 'The $t(common:Relic, {"count": 1, "capitalizeLength": 0}) scorer may be down for maintenance after the {{game_version}} patch, please try again later'
      WithVersion: 'Enter your account UID to score your profile $t(common:Character, {"count": 1, "capitalizeLength": 0}) at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}} )'
      WithoutVersion: 'Enter your account UID to score your profile $t(common:Character, {"count": 1, "capitalizeLength": 0}) at level 80 & maxed traces. Log out to refresh instantly.'
    }
    SubmissionBar: {
      Placeholder: 'Account UID'
      ButtonText: '$t(common:Submit, {"capitalizeLength": 1})'
      AlgorithmButton: 'Scoring algorithm'
    }
    CopyScreenshot: 'Copy screenshot'
    ImportLabels: {
      Relics: 'Import $t(common:Relic, {"count": 48, "capitalizeLength": 0}) into optimizer'
      SingleCharacter: 'Import selected $t(common:Character, {"count": 1, "capitalizeLength": 0}) & all $t(common:Relic, {"count": 48, "capitalizeLength": 0}) into optimizer'
      AllCharacters: 'Import all $t(common:Character, {"count": 8, "capitalizeLength": 0}) & all $t(common:Relic, {"count": 48, "capitalizeLength": 0}) into optimizer'
    }
    SimulateRelics: 'Simulate $t(common:Relic, {"count": 48, "capitalizeLength": 0}) on another $t(common:Character, {"count": 1, "capitalizeLength": 0})'
    OptimizeOnCharacter: 'Optimize $t(common:Character, {"count": 1, "capitalizeLength": 0}) stats'
  }
  relicsTab: {
    RelicFilterBar: {
      Part: 'Part'
      Enhance: 'Enhance'
      Grade: 'Grade'
      Verified: 'Verified'
      Equipped: 'Equipped'
      Clear: 'Clear'
      ClearButton: 'Clear all filters'
      Set: 'Set'
      Mainstat: 'Main stats'
      Substat: 'Substats'
      ReapplyButton: 'Reapply scores'
      ScoringButton: 'Scoring algorithm'
      RecommendationHeader: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) recommendation character'
      Rating: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) ratings'
      CustomCharsHeader: 'Custom potential $t(common:Character, {"count": 12, "capitalizeLength": 0})'
    }
    Messages: {
      AddRelicSuccess: 'Successfully added $t(common:Relic, {"count": 1, "capitalizeLength": 0})'
      NoRelicSelected: 'No $t(common:Relic, {"count": 1, "capitalizeLength": 0}) selected'
      DeleteRelicSuccess: 'Successfully deleted $t(common:Relic, {"count": 1, "capitalizeLength": 0})'
    }
    RelicGrid: {
      Headers: {
        EquippedBy: 'Owner'
        Set: 'Set'
        Grade: 'Grade'
        Part: 'Part'
        Enhance: 'Enhance'
        Mainstat: 'Main\nStat'
        Mainvalue: 'Main Value'
        hpP: 'HP %'
        atkP: 'ATK %'
        defP: 'DEF %'
        hp: 'HP'
        atk: 'ATK'
        def: 'DEF'
        spd: 'SPD'
        cr: 'Crit\nRate'
        cd: 'Crit\nDMG'
        ehr: 'Effect\nHit Rate'
        res: 'Effect\nRES'
        be: 'Break\nEffect'
        cv: 'Crit\nValue'
      }
      ValueColumns: {
        SelectedCharacter: {
          Label: 'Selected $t(common:Character, {"count": 1, "capitalizeLength": 0})'
          ScoreCol: {
            Label: 'Selected $t(common:Character, {"count": 1, "capitalizeLength": 0}): Score'
            Header: 'Selected Char\nScore'
          }
          AvgPotCol: {
            Llabel: 'Selected $t(common:Character, {"count": 1, "capitalizeLength": 0}): Average potential'
            Header: 'Selected Char\nAvg Potential'
          }
          MaxPotCol: {
            Label: 'Selected $t(common:Character, {"count": 1, "capitalizeLength": 0}): Max potential'
            Header: 'Selected Char\nMax Potential'
          }
        }
        CustomCharacters: {
          Label: 'Custom $t(common:Character, {"count": 10, "capitalizeLength": 0})'
          AvgPotCol: {
            Label: 'Custom $t(common:Character, {"count": 10, "capitalizeLength": 0}): Average potential'
            Header: 'Custom Chars\nAvg Potential'
          }
          MaxPotCol: {
            Label: 'Custom $t(common:Character, {"count": 10, "capitalizeLength": 0}): Max potential'
            Header: 'Custom Chars\nMax Potential'
          }
        }
        AllCharacters: {
          Label: 'All $t(common:Character, {"count": 10, "capitalizeLength": 0})'
          AvgPotCol: {
            Label: 'All $t(common:Character, {"count": 10, "capitalizeLength": 0}): Average potential'
            Header: 'All Chars\nAvg Potential'
          }
          MaxPotCol: {
            Label: 'All $t(common:Character, {"count": 10, "capitalizeLength": 0}): Max potential'
            Header: 'All Chars\nMax Potential'
          }
        }
        ComingSoon: {
          Label: 'Coming soon'
          SetsPotential: {
            Label: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) / Ornament sets potential'
            Header: 'All Chars\nMax Potential + Sets'
          }
        }
      }
    }
    Toolbar: {
      RelicLocator: {
        Width: 'Inventory width'
        Filter: 'Auto filter rows'
        NoneSelected: 'Select a $t(common:Relic, {"count": 1, "capitalizeLength": 0}) to locate'
        Location: 'Location - Row {{rowindex}} / Col {{columnindex}}'
      }
      InsightOptions: {
        Buckets: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) Insight: Buckets'
        Top10: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) Insight: Top 10'
      }
      PlotOptions: {
        PlotAll: 'Show all $t(common:Character, {"count": 12, "capitalizeLength": 0})'
        PlotCustom: 'Show custom $t(common:Character, {"count": 12, "capitalizeLength": 0})'
      }
      EditRelic: 'Edit $t(common:Relic, {"count": 1, "capitalizeLength": 1})'
      DeleteRelic: {
        ButtonText: 'Delete $t(common:Relic, {"count": 1, "capitalizeLength": 1})'
        Warning_one: 'Delete the selected $t(common:Relic, {"count": 1, "capitalizeLength": 0})?'
        Warning_other: 'Delete the selected {{count}} $t(common:Relic, {"count": {{count}}, "capitalizeLength": 0})?'
      }
      AddRelic: 'Add New $t(common:Relic, {"count": 1, "capitalizeLength": 1})'
    }
    RelicInsights: {
      NewStats: 'New stats: '
      UpgradedStats: 'Upgraded stats: '
    }
  }
  settings: {
    Title: 'Settings'
    RelicEquippingBehaviour: {
      Label: 'Equipping relics from another character'
      Replace: 'Default: Replace relics without swapping'
      Swap: 'Swap relics with previous owner'
    }
    PermutationSidebarBehaviour: {
      Label: 'Shrink optimizer sidebar on smaller screens'
      XL: 'Default: Minimize if most of the sidebar is hidden'
      XXL: 'Minimize if any of the sidebar is hidden'
      NoShow: 'Always keep the sidebar on the right'
    }
    RelicPotentialLoadBehaviour: {
      Label: 'Relic potential scoring on load'
      OnStartup: 'Default: Automatically score relics on page load'
      Manual: 'Only score relics when "Reapply scores" is clicked (faster page load)'
    }
  }
  sidebar: {
    Showcase: {
      Title: 'Showcase'
      Scorer: '$t(common:Relic, {"count": 1, "capitalizeLength": 1}) Scorer'
    }
    Optimization: {
      Title: 'Optimization'
      Optimizer: 'Optimizer'
      Relics: '$t(common:Relic, {"count": 2000, "capitalizeLength": 1})'
      Characters: '$t(common:Character, {"count": 23, "capitalizeLength": 1})'
      Import: 'Import / Save'
      Settings: 'Settings'
      Start: 'Get Started'
    }
    Links: {
      Title: 'Links'
      Changelog: 'Changelog'
      Discord: 'Discord'
      Github: 'GitHub'
      Kofi: 'Ko-fi'
      Unleak: 'No leaks'
    }
  }
}

export default Resources
