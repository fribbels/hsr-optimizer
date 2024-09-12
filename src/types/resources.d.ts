interface Resources {
  "changelogTab": {},
  "charactersTab": {
    "characteractions": {
      "buttontext": "Character actions",
      "character": {
        "label": "Character",
        "options": {
          "add": "Add new character",
          "edit": "Edit character",
          "switch": "Switch relics with",
          "unequip": "Unequip character",
          "delete": "Delete character"
        }
      },
      "build": {
        "label": "Builds",
        "options": {
          "save": "Save build",
          "view": "View saved builds"
        }
      },
      "scoring": {
        "label": "Scoring",
        "options": {
          "scoringmodal": "Scoring algorithm"
        }
      },
      "priority": {
        "label": "Priority",
        "options": {
          "sortbyscore": "Sort all characters by score",
          "movetotop": "Move character to top"
        }
      }
    },
    "copyscreenshot": "Copy screenshot",
    "searchplaceholder": "Search character name",
    "gridheaders": {
      "icon": "Icon",
      "priority": "Priority",
      "character": "Character"
    },
    "messages": {
      "removesuccess": "Successfully removed character",
      "unequipsuccess": "Successfully unequipped character",
      "noselectedcharacter": "No selected character",
      "switchsuccess": "Successfully switched relics to $t(gameData:characters.{{charid}}.name)",
      "sortbyscorewarning": "Are you sure you want to sort all characters? <0/>You will lose any custom rankings you have set.",
      "savesuccess": "Successfully saved build: {{name}}",
      "unequipwarning": "Are you sure you want to unequip $t(gameData:characters.{{charid}}.name)?",
      "deletewarning": "Are you sure you want to delete $t(gameData:characters.{{charid}}.name)?"
    },
    "characterpreview": {}
  },
  "common": {
    "relic_one": "{{relic, capitalize}}",
    "relic_other": "{{relics, capitalize}}",
    "relicWithCount_one": "{{count}} {{relic, capitalize}}",
    "relicWithCount_other": "{{count}} {{relics, capitalize}}",
    "lightcone_one": "{{light cone, capitalize}}",
    "lightcone_other": "{{light cones, capitalize}}",
    "lightconeWithCount_one": "{{count}} {{light cone, capitalize}}",
    "lightconeWithCount_other": "{{count}} {{light cones, capitalize}}",
    "cancel": "{{cancel, capitalize}}",
    "confirm": "{{confirm, capitalize}}",
    "submit": "{{submit, capitalize}}",
    "yes": "{{yes, capitalize}}",
    "characterWithCount_one": "{{count}} {{character, capitalize}}",
    "characterWithCount_other": "{{count}} {{characters, capitalize}}",
    "character_one": "{{character, capitalize}}",
    "character_other": "{{characters, capitalize}}",
    "statnames": {
      "HP": "HP",
      "ATK": "ATK",
      "DEF": "DEF",
      "HP%": "HP %",
      "ATK%": "ATK %",
      "DEF%": "DEF %",
      "SPD": "SPD",
      "CRIT Rate": "CRIT Rate",
      "CRIT DMG": "CRIT DMG",
      "Effect Hit Rate": "Effect Hit Rate",
      "Effect RES": "Effect RES",
      "Break Effect": "Break Effect",
      "Energy Regen": "Energy Regen",
      "Healing Boost": "Healing Boost",
      "Element_DMG": "$t(gameData:elements.{{element}} ) DMG",
      "Element": "$t(gameData:elements.{{element}})",
      "HP %": "HP %",
      "ATK %": "ATK %",
      "DEF %": "DEF %",
      "SPD %": "SPD %",
      "HIT": "HIT",
      "RES": "RES",
      "Break": "Break",
      "Energy": "Energy",
      "Healing": "Test1"
    }
  },
  "gameData": {
    "characters": {
      "1001": {
        "name": "March 7th",
        "abilities": {
          "100101": "Frigid Cold Arrow",
          "100102": "The Power of Cuteness",
          "100103": "Glacial Cascade",
          "100104": "Girl Power",
          "100106": "Attack",
          "100107": "Freezing Beauty"
        }
      },
      "1002": {
        "name": "Dan Heng",
        "abilities": {
          "100201": "Cloudlancer Art: North Wind",
          "100202": "Cloudlancer Art: Torrent",
          "100203": "Ethereal Dream",
          "100204": "Superiority of Reach",
          "100206": "Attack",
          "100207": "Splitting Spearhead"
        }
      },
      "1003": {
        "name": "Himeko",
        "abilities": {
          "100301": "Sawblade Tuning",
          "100302": "Molten Detonation",
          "100303": "Heavenly Flare",
          "100304": "Victory Rush",
          "100306": "Attack",
          "100307": "Incomplete Combustion"
        }
      },
      "1004": {
        "name": "Welt",
        "abilities": {
          "100401": "Gravity Suppression",
          "100402": "Edge of the Void",
          "100403": "Synthetic Black Hole",
          "100404": "Time Distortion",
          "100406": "Attack",
          "100407": "Gravitational Imprisonment"
        }
      },
      "1005": {
        "name": "Kafka",
        "abilities": {
          "100501": "Midnight Tumult",
          "100502": "Caressing Moonlight",
          "100503": "Twilight Trill",
          "100504": "Gentle but Cruel",
          "100506": "Attack",
          "100507": "Mercy Is Not Forgiveness"
        }
      },
      "1006": {
        "name": "Silver Wolf",
        "abilities": {
          "100601": "System Warning",
          "100602": "Allow Changes?",
          "100603": "User Banned",
          "100604": "Awaiting System Response...",
          "100606": "Attack",
          "100607": "Force Quit Program"
        }
      },
      "1008": {
        "name": "Arlan",
        "abilities": {
          "100801": "Lightning Rush",
          "100802": "Shackle Breaker",
          "100803": "Frenzied Punishment",
          "100804": "Pain and Anger",
          "100806": "Attack",
          "100807": "Swift Harvest"
        }
      },
      "1009": {
        "name": "Asta",
        "abilities": {
          "100901": "Spectrum Beam",
          "100902": "Meteor Storm",
          "100903": "Astral Blessing",
          "100904": "Astrometry",
          "100906": "Attack",
          "100907": "Miracle Flash"
        }
      },
      "1013": {
        "name": "Herta",
        "abilities": {
          "101301": "What Are You Looking At?",
          "101302": "One-Time Offer",
          "101303": "It's Magic, I Added Some Magic",
          "101304": "Fine, I'll Do It Myself",
          "101306": "Attack",
          "101307": "It Can Still Be Optimized"
        }
      },
      "1101": {
        "name": "Bronya",
        "abilities": {
          "110101": "Windrider Bullet",
          "110102": "Combat Redeployment",
          "110103": "The Belobog March",
          "110104": "Leading the Way",
          "110106": "Attack",
          "110107": "Banner of Command"
        }
      },
      "1102": {
        "name": "Seele",
        "abilities": {
          "110201": "Thwack",
          "110202": "Sheathed Blade",
          "110203": "Butterfly Flurry",
          "110204": "Resurgence",
          "110206": "Attack",
          "110207": "Phantom Illusion"
        }
      },
      "1103": {
        "name": "Serval",
        "abilities": {
          "110301": "Roaring Thunderclap",
          "110302": "Lightning Flash",
          "110303": "Here Comes the Mechanical Fever",
          "110304": "Galvanic Chords",
          "110306": "Attack",
          "110307": "Good Night, Belobog"
        }
      },
      "1104": {
        "name": "Gepard",
        "abilities": {
          "110401": "Fist of Conviction",
          "110402": "Daunting Smite",
          "110403": "Enduring Bulwark",
          "110404": "Unyielding Will",
          "110406": "Attack",
          "110407": "Comradery"
        }
      },
      "1105": {
        "name": "Natasha",
        "abilities": {
          "110501": "Behind the Kindness",
          "110502": "Love, Heal, and Choose",
          "110503": "Gift of Rebirth",
          "110504": "Innervation",
          "110506": "Attack",
          "110507": "Hypnosis Research"
        }
      },
      "1106": {
        "name": "Pela",
        "abilities": {
          "110601": "Frost Shot",
          "110602": "Frostbite",
          "110603": "Zone Suppression",
          "110604": "Data Collecting",
          "110606": "Attack",
          "110607": "Preemptive Strike"
        }
      },
      "1107": {
        "name": "Clara",
        "abilities": {
          "110701": "I Want to Help",
          "110702": "Svarog Watches Over You",
          "110703": "Promise, Not Command",
          "110704": "Because We're Family",
          "110706": "Attack",
          "110707": "A Small Price for Victory"
        }
      },
      "1108": {
        "name": "Sampo",
        "abilities": {
          "110801": "Dazzling Blades",
          "110802": "Ricochet Love",
          "110803": "Surprise Present",
          "110804": "Windtorn Dagger",
          "110806": "Attack",
          "110807": "Shining Bright"
        }
      },
      "1109": {
        "name": "Hook",
        "abilities": {
          "110901": "Hehe! Don't Get Burned!",
          "110902": "Hey! Remember Hook?",
          "110903": "Boom! Here Comes the Fire!",
          "110904": "Ha! Oil to the Flames!",
          "110906": "Attack",
          "110907": "Ack! Look at This Mess!"
        }
      },
      "1110": {
        "name": "Lynx",
        "abilities": {
          "111001": "Ice Crampon Technique",
          "111002": "Salted Camping Cans",
          "111003": "Snowfield First Aid",
          "111004": "Outdoor Survival Experience",
          "111006": "Attack",
          "111007": "Chocolate Energy Bar"
        }
      },
      "1111": {
        "name": "Luka",
        "abilities": {
          "111101": "Direct Punch",
          "111102": "Lacerating Fist",
          "111103": "Coup de Grâce",
          "111104": "Flying Sparks",
          "111106": "Attack",
          "111107": "Anticipator"
        }
      },
      "1112": {
        "name": "Topaz & Numby",
        "abilities": {
          "111201": "Deficit...",
          "111202": "Difficulty Paying?",
          "111203": "Turn a Profit!",
          "111204": "Trotter Market!?",
          "111206": "Attack",
          "111207": "Explicit Subsidy"
        }
      },
      "1201": {
        "name": "Qingque",
        "abilities": {
          "120101": "Flower Pick",
          "120102": "A Scoop of Moon",
          "120103": "A Quartet? Woo-hoo!",
          "120104": "Celestial Jade",
          "120106": "Attack",
          "120107": "Game Solitaire"
        }
      },
      "1202": {
        "name": "Tingyun",
        "abilities": {
          "120201": "Dislodged",
          "120202": "Soothing Melody",
          "120203": "Amidst the Rejoicing Clouds",
          "120204": "Violet Sparknado",
          "120206": "Attack",
          "120207": "Gentle Breeze"
        }
      },
      "1203": {
        "name": "Luocha",
        "abilities": {
          "120301": "Thorns of the Abyss",
          "120302": "Prayer of Abyss Flower",
          "120303": "Death Wish",
          "120304": "Cycle of Life",
          "120306": "Attack",
          "120307": "Mercy of a Fool"
        }
      },
      "1204": {
        "name": "Jing Yuan",
        "abilities": {
          "120401": "Glistening Light",
          "120402": "Rifting Zenith",
          "120403": "Lightbringer",
          "120404": "Prana Extirpated",
          "120406": "Attack",
          "120407": "Spiritus Invocation"
        }
      },
      "1205": {
        "name": "Blade",
        "abilities": {
          "120501": "Shard Sword",
          "120502": "Hellscape",
          "120503": "Death Sentence",
          "120504": "Shuhu's Gift",
          "120506": "Attack",
          "120507": "Karma Wind"
        }
      },
      "1206": {
        "name": "Sushang",
        "abilities": {
          "120601": "Cloudfencer Art: Starshine",
          "120602": "Cloudfencer Art: Mountainfall",
          "120603": "Shape of Taixu: Dawn Herald",
          "120604": "Dancing Blade",
          "120606": "Attack",
          "120607": "Cloudfencer Art: Warcry"
        }
      },
      "1207": {
        "name": "Yukong",
        "abilities": {
          "120701": "Arrowslinger",
          "120702": "Emboldening Salvo",
          "120703": "Diving Kestrel",
          "120704": "Seven Layers, One Arrow",
          "120706": "Attack",
          "120707": "Windchaser"
        }
      },
      "1208": {
        "name": "Fu Xuan",
        "abilities": {
          "120801": "Novaburst",
          "120802": "Known by Stars, Shown by Hearts",
          "120803": "Woes of Many Morphed to One",
          "120804": "Bleak Breeds Bliss",
          "120806": "Attack",
          "120807": "Of Fortune Comes Fate"
        }
      },
      "1209": {
        "name": "Yanqing",
        "abilities": {
          "120901": "Frost Thorn",
          "120902": "Darting Ironthorn",
          "120903": "Amidst the Raining Bliss",
          "120904": "One With the Sword",
          "120906": "Attack",
          "120907": "The One True Sword"
        }
      },
      "1210": {
        "name": "Guinaifen",
        "abilities": {
          "121001": "Standing Ovation",
          "121002": "Blazing Welcome",
          "121003": "Watch This Showstopper",
          "121004": "PatrAeon Benefits",
          "121006": "Attack",
          "121007": "Skill Showcase"
        }
      },
      "1211": {
        "name": "Bailu",
        "abilities": {
          "121101": "Diagnostic Kick",
          "121102": "Singing Among Clouds",
          "121103": "Felicitous Thunderleap",
          "121104": "Gourdful of Elixir",
          "121106": "Attack",
          "121107": "Saunter in the Rain"
        }
      },
      "1212": {
        "name": "Jingliu",
        "abilities": {
          "121201": "Lucent Moonglow",
          "121202": "Transcendent Flash",
          "121203": "Florephemeral Dreamflux",
          "121204": "Crescent Transmigration",
          "121206": "Attack",
          "121207": "Shine of Truth"
        }
      },
      "1213": {
        "name": "Dan Heng • Imbibitor Lunae",
        "abilities": {
          "121301": "Beneficent Lotus",
          "121302": "Dracore Libre",
          "121303": "Azure's Aqua Ablutes All",
          "121304": "Righteous Heart",
          "121306": "Attack",
          "121307": "Heaven-Quelling Prismadrakon"
        }
      },
      "1214": {
        "name": "Xueyi",
        "abilities": {
          "121401": "Mara-Sunder Awl",
          "121402": "Iniquity Obliteration",
          "121403": "Divine Castigation",
          "121404": "Karmic Perpetuation",
          "121406": "Attack",
          "121407": "Summary Execution"
        }
      },
      "1215": {
        "name": "Hanya",
        "abilities": {
          "121501": "Oracle Brush",
          "121502": "Samsara, Locked",
          "121503": "Ten-Lords' Decree, All Shall Obey",
          "121504": "Sanction",
          "121506": "Attack",
          "121507": "Netherworld Judgment"
        }
      },
      "1217": {
        "name": "Huohuo",
        "abilities": {
          "121701": "Banner: Stormcaller",
          "121702": "Talisman: Protection",
          "121703": "Tail: Spiritual Domination",
          "121704": "Possession: Ethereal Metaflow",
          "121706": "Attack",
          "121707": "Fiend: Impeachment of Evil"
        }
      },
      "1218": {
        "name": "Jiaoqiu",
        "abilities": {
          "121801": "Heart Afire",
          "121802": "Scorch Onslaught",
          "121803": "Pyrograph Arcanum",
          "121804": "Quartet Finesse, Octave Finery",
          "121806": "Attack",
          "121807": "Fiery Queller"
        }
      },
      "1220": {
        "name": "Feixiao",
        "abilities": {}
      },
      "1221": {
        "name": "Yunli",
        "abilities": {
          "122101": "Galespin Summersault",
          "122102": "Bladeborne Quake",
          "122103": "Earthbind, Etherbreak",
          "122104": "Flashforge",
          "122106": "Attack",
          "122107": "Posterior Precedence"
        }
      },
      "1222": {
        "name": "Lingsha",
        "abilities": {}
      },
      "1223": {
        "name": "Moze",
        "abilities": {}
      },
      "1224": {
        "name": "March 7th",
        "abilities": {
          "122401": "My Sword Zaps Demons",
          "122402": "Master, It's Tea Time!",
          "122403": "March 7th, the Apex Heroine",
          "122404": "Master, I've Ascended!",
          "122406": "Attack",
          "122407": "Feast in One Go"
        }
      },
      "1301": {
        "name": "Gallagher",
        "abilities": {
          "130101": "Corkage Fee",
          "130102": "Special Brew",
          "130103": "Champagne Etiquette",
          "130104": "Tipsy Tussle",
          "130106": "Attack",
          "130107": "Artisan Elixir"
        }
      },
      "1302": {
        "name": "Argenti",
        "abilities": {
          "130201": "Fleeting Fragrance",
          "130202": "Justice, Hereby Blooms",
          "130203": "For In This Garden, Supreme Beauty Bestows",
          "130204": "Sublime Object",
          "130206": "Attack",
          "130207": "Manifesto of Purest Virtue"
        }
      },
      "1303": {
        "name": "Ruan Mei",
        "abilities": {
          "130301": "Threading Fragrance",
          "130302": "String Sings Slow Swirls",
          "130303": "Petals to Stream, Repose in Dream",
          "130304": "Somatotypical Helix",
          "130306": "Attack",
          "130307": "Silken Serenade"
        }
      },
      "1304": {
        "name": "Aventurine",
        "abilities": {
          "130401": "Straight Bet",
          "130402": "Cornerstone Deluxe",
          "130403": "Roulette Shark",
          "130404": "Shot Loaded Right",
          "130406": "Attack",
          "130407": "The Red or the Black"
        }
      },
      "1305": {
        "name": "Dr. Ratio",
        "abilities": {
          "130501": "Mind is Might",
          "130502": "Intellectual Midwifery",
          "130503": "Syllogistic Paradox",
          "130504": "Cogito, Ergo Sum",
          "130506": "Attack",
          "130507": "Mold of Idolatry"
        }
      },
      "1306": {
        "name": "Sparkle",
        "abilities": {
          "130601": "Monodrama",
          "130602": "Dreamdiver",
          "130603": "The Hero with a Thousand Faces",
          "130604": "Red Herring",
          "130606": "Attack",
          "130607": "Unreliable Narrator"
        }
      },
      "1307": {
        "name": "Black Swan",
        "abilities": {
          "130701": "Percipience, Silent Dawn",
          "130702": "Decadence, False Twilight",
          "130703": "Bliss of Otherworld's Embrace",
          "130704": "Loom of Fate's Caprice",
          "130706": "Attack",
          "130707": "From Façade to Vérité"
        }
      },
      "1308": {
        "name": "Acheron",
        "abilities": {
          "130801": "Trilateral Wiltcross",
          "130802": "Octobolt Flash",
          "130803": "Slashed Dream Cries in Red",
          "130804": "Atop Rainleaf Hangs Oneness",
          "130806": "Attack",
          "130807": "Quadrivalent Ascendance"
        }
      },
      "1309": {
        "name": "Robin",
        "abilities": {
          "130901": "Wingflip White Noise",
          "130902": "Pinion's Aria",
          "130903": "Vox Harmonique, Opus Cosmique",
          "130904": "Tonal Resonance",
          "130906": "Attack",
          "130907": "Overture of Inebriation"
        }
      },
      "1310": {
        "name": "Firefly",
        "abilities": {
          "131001": "Order: Flare Propulsion",
          "131002": "Order: Aerial Bombardment",
          "131003": "Fyrefly Type-IV: Complete Combustion",
          "131004": "Chrysalid Pyronexus",
          "131006": "Attack",
          "131007": "Δ Order: Meteoric Incineration"
        }
      },
      "1312": {
        "name": "Misha",
        "abilities": {
          "131201": "E—Excuse Me, Please!",
          "131202": "R—Room Service!",
          "131203": "G—Gonna Be Late!",
          "131204": "Horological Escapement",
          "131206": "Attack",
          "131207": "Wait, You Are So Beautiful!"
        }
      },
      "1314": {
        "name": "Jade",
        "abilities": {
          "131401": "Lash of Riches",
          "131402": "Acquisition Surety",
          "131403": "Vow of the Deep",
          "131404": "Fang of Flare Flaying",
          "131406": "Attack",
          "131407": "Visionary Predation"
        }
      },
      "1315": {
        "name": "Boothill",
        "abilities": {
          "131501": "Skullcrush Spurs",
          "131502": "Sizzlin' Tango",
          "131503": "Dust Devil's Sunset Rodeo",
          "131504": "Five Peas in a Pod",
          "131506": "Attack",
          "131507": "3-9× Smile"
        }
      },
      "8001": {
        "name": "Caelus (Destruction)",
        "abilities": {
          "800101": "Farewell Hit",
          "800102": "RIP Home Run",
          "800103": "Stardust Ace",
          "800104": "Perfect Pickoff",
          "800106": "Attack",
          "800107": "Immortal Third Strike"
        }
      },
      "8002": {
        "name": "Stelle (Destruction)",
        "abilities": {
          "800201": "Farewell Hit",
          "800202": "RIP Home Run",
          "800203": "Stardust Ace",
          "800204": "Perfect Pickoff",
          "800206": "Attack",
          "800207": "Immortal Third Strike"
        }
      },
      "8003": {
        "name": "Caelus (Preservation)",
        "abilities": {
          "800301": "Ice-Breaking Light",
          "800302": "Ever-Burning Amber",
          "800303": "War-Flaming Lance",
          "800304": "Treasure of the Architects",
          "800306": "Attack",
          "800307": "Call of the Guardian"
        }
      },
      "8004": {
        "name": "Stelle (Preservation)",
        "abilities": {
          "800401": "Ice-Breaking Light",
          "800402": "Ever-Burning Amber",
          "800403": "War-Flaming Lance",
          "800404": "Treasure of the Architects",
          "800406": "Attack",
          "800407": "Call of the Guardian"
        }
      },
      "8005": {
        "name": "Caelus (Harmony)",
        "abilities": {
          "800501": "Swing Dance Etiquette",
          "800502": "Halftime to Make It Rain",
          "800503": "All-Out Footlight Parade",
          "800504": "Full-on Aerial Dance",
          "800506": "Attack",
          "800507": "Now! I'm the Band!"
        }
      },
      "8006": {
        "name": "Stelle (Harmony)",
        "abilities": {
          "800601": "Swing Dance Etiquette",
          "800602": "Halftime to Make It Rain",
          "800603": "All-Out Footlight Parade",
          "800604": "Full-on Aerial Dance",
          "800606": "Attack",
          "800607": "Now! I'm the Band!"
        }
      }
    },
    "relicsets": {
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
    "lightcones": {
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
    "paths": {
      "Warrior": "Destruction",
      "Rogue": "The Hunt",
      "Mage": "Erudition",
      "Shaman": "Harmony",
      "Warlock": "Nihility",
      "Knight": "Preservation",
      "Priest": "Abundance",
      "undefined": "General"
    },
    "elements": {
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
    "ratingfilter": {
      "title": "Rating filters",
      "p1": "Weight - Sum of substat weights of all 6 relics, from the Substat weight filter",
      "p2": "Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives",
      "p3": "Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options."
    },
    "combatbuffs": {
      "title": "Combat buffs",
      "p1": "Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations."
    },
    "statfilters": {
      "title": "Stat filters",
      "p1": "Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges",
      "p2": "Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect",
      "p3": "NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can't detect the hidden decimals."
    },
    "mainstats": {
      "title": "Main stats",
      "p1": "Select main stats to use for optimization search. Multiple values can be selected for more options"
    },
    "sets": {
      "title": "Sets",
      "p1": "Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options",
      "p2": "Set effects will be accounted for in calculations, use the Conditional set effects menu to customize which effects are active."
    },
    "character": {
      "title": "Character",
      "p1": "Select the character and eidolon. Character is assumed to be level 80 with maxed traces in optimization calcs."
    },
    "characterpassives": {
      "title": "Character passives",
      "p1": "Select the conditional effects to apply to the character.",
      "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
    },
    "lightconepassives": {
      "title": "Light cone passives",
      "p1": "Select the conditional effects to apply to the light cone.",
      "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
    },
    "lightcone": {
      "title": "Light cone",
      "p1": "Select the light cone and superimposition. Light cone is assumed to be level 80 in optimization calcs.",
      "p2": "Superimposition and passive effects are applied under the Light cone passives panel."
    },
    "actions": {
      "title": "Actions",
      "p1": "Equip - Equip the selected relics from the grid onto the character",
      "p2": "Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search",
      "p3": "Pin build - Pin the currently selected row to the top of the grid. Use this to compare multiple builds more easily",
      "p4": "Clear pins - Clear all the builds that you pinned to the top of the grid"
    },
    "optimizeroptions": {
      "title": "Optimizer options",
      "p1": "<0>Character priority filter</0> - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.",
      "p2": "<0>Boost main stat</0> - Calculates relic mains stats as if they were this level (or their max if they can't reach this level) if they are currently below it. Substats are not changed accordingly, so builds with lower level relics may be stronger once you level them.",
      "p3": "<0>Keep current relics</0> - The character must use its currently equipped items, and the optimizer will try to fill in empty slots",
      "p4": "<0>Include equipped relics</0> - When enabled, the optimizer will allow using currently equipped by a character for the search. Otherwise equipped relics are excluded",
      "p5": "<0>Priority</0> - See: Character priority filter. Changing this setting will change the character's priority",
      "p6": "<0>Exclude</0> - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter",
      "p7": "<0>Enhance / grade</0> - Select the minimum enhance to search for and minimum stars for relics to include"
    },
    "relics": {
      "title": "Relics",
      "p1": "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats.",
      "p2": "Selected character: Score - The relic's current weight as defined by the scoring algorithm for the currently selected character",
      "p3": "Selected character: Average potential - The relic's potential weight if rolls went into the average weight of the relic's substats",
      "p4": "Selected character: Max potential - The relic's maximum potential weight if all future rolls went into the character's desired stats",
      "p5": "All characters: Max potential - The highest possible potential value of the relic, out of all characters in the game."
    },
    "optimizationdetails": {
      "title": "Optimization details",
      "p1": "Shows how many relics are being used in the optimization search, after all filters are applied",
      "p2": "Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time",
      "p3": "Searched - Number of permutations already searched",
      "p4": "Results - Number of displayed results that satisfy the stat filters"
    },
    "enemyoptions": {
      "title": "Enemy options",
      "p1": "Level - Enemy level, affects enemy DEF calculations",
      "p2": "Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.",
      "p3": "RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled.",
      "p4": "Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage.",
      "p5": "Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0.",
      "p6": "Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives."
    },
    "substatweightfilter": {
      "title": "Substat weight filter",
      "p1": "This filter is used to reduce the number of permutations the optimizer has to process.",
      "p2": "It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.",
      "p3": "Only relics that have more than the specified number of weighted rolls will be used for the optimization search.",
      "p4": "Note that setting the minimum rolls too low may result in some builds not being displayed, if the filter ends up excludes a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time."
    },
    "statdisplay": {
      "title": "Stat and filter view",
      "p1": "This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.",
      "p2": "Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied.",
      "p3": "Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
    },
    "valuecolumns": {
      "title": "Value Columns",
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
    "relicinsights": {
      "title": "Relic Insight",
      "p1": "When a relic is selected in the table above, you can choose an analysis to view a plot of.",
      "p2": "'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<0/>If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<1/>⚠️ Relics with missing substats may have misleadlingly high buckets, as best-case upgrade analysis assumes the best new substat per character.",
      "p3": "'Top 10' takes the top 10 characters that this relic could be best for, and shows the range of '% perfection' upgrading this relic could result in."
    },
    "reliclocation": {
      "title": "Relic Location",
      "p1": "When a relic is selected in the grid, its position in the ingame inventory is displayed here.",
      "p2": "If the set / part filters are active, apply those same filters ingame, then sort by Date Obtained (newest first) to find the relic.",
      "p3": "⚠️Usage notes⚠️",
      "p4": "This is only supported with Reliquary Archiver import",
      "p5": "If new relics were deleted or obtained since the last import, they must be re-scanned and imported",
      "p6": "Select the appropriate Inventory width setting to get accurate locations. The width depends on the ingame screen and menu width"
    },
    "locatorparams": {
      "title": "Relic Locator Options",
      "p1": "<0>Inventory Width</0> - Select the number of columns the inventory has ingame so that the relic locator can find your relic accurately",
      "p2": "<0>Auto Filter rows</0> - Maximum number of rows before the relic locator applies a part/set filter to try and bring the searched relic closer to the top of your inventory"
    }
  },
  "importSaveTab": {
    "tablabels": {
      "import": "$t(common:relic, {\"count\": 1, \"length\": 1}) scanner importer",
      "load": "Load optimizer data",
      "save": "Save optimizer data",
      "clear": "Clear optimizer data"
    },
    "import": {
      "errormsg": {
        "unknown": "Unknown Error",
        "invalidfile": "Invalid scanner file",
        "invalidjson": "Invalid JSON",
        "fragment": "Error occurred while importing file: "
      },
      "stage1": {
        "header": "Install and run one of the $t(common:relic, {\"count\": 1, \"length\": 0}) scanner options:",
        "reliquarydesc": {
          "title": "(Recommended) IceDynamix Reliquary Archiver",
          "link": "Github",
          "onlinemsg": "Status: Updated for patch {{version}} — New download required",
          "offlinemsg": "***** Status: Down for maintenance after {{version}} patch *****",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "Imports full inventory and $t(common:character, {\"count\": 1, \"length\": 0}) roster"
        },
        "kelzdesc": {
          "title": "Kel-Z HSR Scanner",
          "link": "Github",
          "l1": "Inaccurate speed decimals, 5-10 minutes OCR scan",
          "l2": "Imports full inventory and $t(common:character, {\"count\": 1, \"length\": 0}) roster"
        },
        "scorerdesc": {
          "title": "$t(common:relic, {\"count\": 1, \"length\": 1}) Scorer Import",
          "link": "$t(common:relic, {\"count\": 1, \"length\": 1}) scorer",
          "l1": "Accurate speed decimals, instant scan",
          "l2": "No download needed, but limited to $t(common:relic, {\"count\": 48, \"length\": 0}) from the 8 $t(common:character, {\"count\": 26, \"length\": 0}) on profile showcase"
        },
        "hoyolabdesc": {
          "title": "HoyoLab Import",
          "link": "Instructions",
          "l1": "Inaccurate speed decimals, instant scan",
          "l2": "No download needed, but limited to ingame $t(common:character, {\"count\": 26, \"length\": 0})' equipped $t(common:relic, {\"count\": 6, \"length\": 0})"
        },
        "buttontext": "Upload scanner json file",
        "or": "or",
        "placeholder": "Paste json file contents"
      },
      "stage2": {
        "or": "OR",
        "fileinfo": "File contains $t(common:relicWithCount, {\"count\": {{reliccount}} }) and $t(common:characterWithCount, {\"count\": {{charactercount}} }).",
        "norelics": "Invalid scanner file, please try a different file",
        "relicsimport": {
          "label": "Import $t(common:relic, {\"count\": 123, \"length\": 0}) only. Updates the optimizer with the new dataset of $t(common:relic, {\"count\": 123, \"length\": 0}) and doesn't overwrite builds.",
          "buttontext": "Import $t(common:relic, {\"count\": 123, \"length\": 0})"
        },
        "charactersimport": {
          "label": "Import $t(common:relic, {\"count\": 123, \"length\": 0}) only. Updates the optimizer with the new dataset of $t(common:relic, {\"count\": 123, \"length\": 0}) and doesn't overwrite builds.",
          "buttontext": "Import $t(common:relic, {\"count\": 123, \"length\": 0}) & $t(common:character, {\"count\": 123, \"length\": 0})",
          "warningtitle": "Overwrite optimizer builds",
          "warningdescription": "Are you sure you want to overwrite your optimizer builds with ingame builds?"
        }
      },
      "stage3": {
        "successmessage": "Done!"
      }
    },
    "loaddata": {
      "stage1": {
        "label": "Load your optimizer data from a file.",
        "buttontext": "Load save data"
      },
      "stage2": {
        "errormsg": "Invalid save file, please try a different file. Did you mean to use the \"$t(tablabels.import)\" tab?",
        "label": "File contains $t(common:relicWithCount, {\"count\": {{reliccount}} }) and $t(common:characterWithCount, {\"count\": {{charactercount}} }). Replace your current data with the uploaded data?",
        "buttontext": "Use uploaded data"
      },
      "stage3": {
        "successmessage": "Done!"
      }
    },
    "savedata": {
      "label": "Save your optimizer data to a file.",
      "buttontext": "Save data",
      "successmessage": "Done"
    },
    "cleardata": {
      "label": "Clear all optimizer data.",
      "buttontext": "Clear data",
      "successmessage": "Cleared data",
      "warningtitle": "Erase all data",
      "warningdescription": "Are you sure you want to clear all $t(common:relic, {\"count\": 1300, \"length\": 0}) and $t(common:character, {\"count\": 26, \"length\": 0})?"
    },
    "partialimport": {
      "oldrelics": "Updated stats for {{count}} existing $t(common:relic, {\"count\": {{count}}, \"length\": 0})",
      "newrelics": "Added {{count}} new $t(common:relic, {\"count\": {{count}}, \"length\": 0})"
    }
  },
  "modals": {
    "scoring": {},
    "0perms": {},
    "manyperms": {},
    "0results": {},
    "editcharacter": {},
    "relic": {},
    "editimage": {},
    "savebuild": {},
    "switchrelics": {},
    "builds": {},
    "scorefooter": {},
    "characterselect": {
      "multiselect": {
        "placeholder": "Customize characters",
        "maxtagplaceholder_zero": "{{count}} characters excluded",
        "maxtagplaceholder_other": "All characters enabled",
        "modaltitle": "Select characters to exclude"
      },
      "singleselect": {
        "placeholder": "Character",
        "modaltitle": "Select a character"
      },
      "searchplaceholder": "Search character name",
      "excludebutton": "Exclude all",
      "clearbutton": "Clear"
    }
  },
  "relicScorerTab": {
    "messages": {
      "throttlewarning": "Please wait {{seconds}} seconds before retrying",
      "invalididwarning": "Invalid ID",
      "idloaderror": "Error loading ID",
      "successmsg": "Successfully loaded profile",
      "lookuperror": "Error during lookup, please try again in a bit",
      "nocharacterselected": "No selected $t(common:character, {\"count\": 1, \"length\": 0})",
      "characteralreadyexists": "Selected $t(common:character, {\"count\": 1, \"length\": 0}) already exists"
    },
    "header": {
      "downtimewarning": "The $t(common:relic, {\"count\": 1, \"length\": 0}) scorer may be down for maintenance after the {{game_version}} patch, please try again later",
      "withversion": "Enter your account UID to score your profile $t(common:character, {\"count\": 1, \"length\": 0}) at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}} )",
      "withoutversion": "Enter your account UID to score your profile $t(common:character, {\"count\": 1, \"length\": 0}) at level 80 & maxed traces. Log out to refresh instantly."
    },
    "submissionbar": {
      "placeholder": "Account UID",
      "buttontext": "$t(common:submit, {\"length\": 1})",
      "algorithmbutton": "Scoring algorithm"
    },
    "copyscreenshot": "Copy screenshot",
    "importlabels": {
      "relics": "Import $t(common:relic, {\"count\": 48, \"length\": 0}) into optimizer",
      "singlecharacter": "Import selected $t(common:character, {\"count\": 1, \"length\": 0}) & all $t(common:relic, {\"count\": 48, \"length\": 0}) into optimizer",
      "allcharacters": "Import all $t(common:character, {\"count\": 8, \"length\": 0}) & all $t(common:relic, {\"count\": 48, \"length\": 0}) into optimizer"
    },
    "simulaterelics": "Simulate $t(common:relic, {\"count\": 48, \"length\": 0}) on another $t(common:character, {\"count\": 1, \"length\": 0})",
    "optimizeoncharacter": "Optimize $t(common:character, {\"count\": 1, \"length\": 0}) stats"
  },
  "relicsTab": {
    "relicFilterBar": {
      "part": "Part",
      "enhance": "Enhance",
      "grade": "Grade",
      "verified": "Verified",
      "equipped": "Equipped",
      "clear": "Clear",
      "clearbutton": "Clear all filters",
      "set": "Set",
      "mainstat": "Main stats",
      "substat": "Substats",
      "reapplybutton": "Reapply scores",
      "scoringbutton": "Scoring algorithm",
      "recommendationheader": "$t(common:relic, {\"count\": 1, \"length\": 1}) recommendation character",
      "rating": "$t(common:relic, {\"count\": 1, \"length\": 1}) ratings",
      "customcharsheader": "Custom potential $t(common:character, {\"count\": 12, \"length\": 0})"
    },
    "messages": {
      "addrelicsuccess": "Successfully added $t(common:relic, {\"count\": 1, \"length\": 0})",
      "norelicselected": "No $t(common:relic, {\"count\": 1, \"length\": 0}) selected",
      "deleterelicsuccess": "Successfully deleted $t(common:relic, {\"count\": 1, \"length\": 0})"
    },
    "relicGrid": {
      "valueformatters": {
        "part": {},
        "stat": {
          "element": "$t(common:.statnames.Element, {\"element\": {{element}})",
          "other": "$t(common:.statnames.{{stat}})"
        }
      },
      "headers": {
        "equippedby": "Owner",
        "set": "Set",
        "grade": "Grade",
        "part": "Part",
        "enhance": "Enhance",
        "mainstat": "Main\nStat",
        "mainvalue": "Main Value",
        "hpp": "HP %",
        "atkp": "ATK %",
        "defp": "DEF %",
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
      "valuecolumns": {
        "selectedcharacter": {
          "label": "Selected $t(common:character, {\"count\": 1, \"length\": 0})",
          "scorecol": {
            "label": "Selected $t(common:character, {\"count\": 1, \"length\": 0}): Score",
            "header": "Selected Char\nScore"
          },
          "avgpotcol": {
            "label": "Selected $t(common:character, {\"count\": 1, \"length\": 0}): Average potential",
            "header": "Selected Char\nAvg Potential"
          },
          "maxpotcol": {
            "label": "Selected $t(common:character, {\"count\": 1, \"length\": 0}): Max potential",
            "header": "Selected Char\nMax Potential"
          }
        },
        "customcharacters": {
          "label": "Custom $t(common:character, {\"count\": 10, \"length\": 0})",
          "avgpotcol": {
            "label": "Custom $t(common:character, {\"count\": 10, \"length\": 0}): Average potential",
            "header": "Custom Chars\nAvg Potential"
          },
          "maxpotcol": {
            "label": "Custom $t(common:character, {\"count\": 10, \"length\": 0}): Max potential",
            "header": "Custom Chars\nMax Potential"
          }
        },
        "allcharacters": {
          "label": "All $t(common:character, {\"count\": 10, \"length\": 0})",
          "avgpotcol": {
            "label": "All $t(common:character, {\"count\": 10, \"length\": 0}): Average potential",
            "header": "All Chars\nAvg Potential"
          },
          "maxpotcol": {
            "label": "All $t(common:character, {\"count\": 10, \"length\": 0}): Max potential",
            "header": "All Chars\nMax Potential"
          }
        },
        "comingsoon": {
          "label": "Coming soon",
          "setspotential": {
            "label": "$t(common:relic, {\"count\": 1, \"length\": 1}) / Ornament sets potential",
            "header": "All Chars\nMax Potential + Sets"
          }
        }
      }
    },
    "toolbar": {
      "reliclocator": {
        "width": "Inventory width",
        "filter": "Auto filter rows",
        "noneselected": "Select a $t(common:relic, {\"count\": 1, \"length\": 0}) to locate",
        "location": "Location - Row {{rowindex}} / Col {{columnindex}}"
      },
      "insightoptions": {
        "buckets": "$t(common:relic, {\"count\": 1, \"length\": 1}) Insight: Buckets",
        "top10": "$t(common:relic, {\"count\": 1, \"length\": 1}) Insight: Top 10"
      },
      "plotoptions": {
        "plotall": "Show all $t(common:character, {\"count\": 12, \"length\": 0})",
        "plotcustom": "Show custom $t(common:character, {\"count\": 12, \"length\": 0})"
      },
      "editrelic": "Edit $t(common:relic, {\"count\": 1, \"length\": 1})",
      "deleterelic": {
        "buttontext": "Delete $t(common:relic, {\"count\": 1, \"length\": 1})",
        "warning_one": "Delete the selected $t(common:relic, {\"count\": 1, \"length\": 0})?",
        "warning_other": "Delete the selected {{count}} $t(common:relic, {\"count\": {{count}}, \"length\": 0})?"
      },
      "addrelic": "Add New $t(common:relic, {\"count\": 1, \"length\": 1})"
    },
    "relicinsights": {
      "newstats": "New stats: ",
      "upgradedstats": "Upgraded stats: "
    }
  },
  "renderer": {
    "rendergrade": "Relic substats verified by relic scorer (speed decimals)",
    "parts": {
      "Head": "Head",
      "Hands": "Hands",
      "Body": "Body",
      "Feet": "Feet",
      "Sphere": "Sphere",
      "Rope": "Rope"
    }
  },
  "settings": {
    "title": "Settings",
    "relicequippingbehaviour": {
      "label": "Equipping relics from another character",
      "replace": "Default: Replace relics without swapping",
      "swap": "Swap relics with previous owner"
    },
    "permutationsidebarbehaviour": {
      "label": "Shrink optimizer sidebar on smaller screens",
      "XL": "Default: Minimize if most of the sidebar is hidden",
      "XXL": "Minimize if any of the sidebar is hidden",
      "noshow": "Always keep the sidebar on the right"
    },
    "relicpotentialloadbehaviour": {
      "label": "Relic potential scoring on load",
      "onstartup": "Default: Automatically score relics on page load",
      "manual": "Only score relics when \"Reapply scores\" is clicked (faster page load)"
    }
  },
  "sidebar": {
    "showcase": {
      "title": "Showcase",
      "scorer": "$t(common:relic, {\"count\": 1, \"length\": 1}) Scorer"
    },
    "optimization": {
      "title": "Optimization",
      "optimizer": "Optimizer",
      "characters": "$t(common:character, {\"count\": 23, \"length\": 1})",
      "import": "Import / Save",
      "settings": "Settings",
      "start": "Get Started"
    },
    "links": {
      "title": "Links",
      "changelog": "Changelog",
      "discord": "Discord",
      "github": "GitHub",
      "kofi": "Ko-fi",
      "unleak": "No Leaks"
    }
  }
}

export default Resources;
