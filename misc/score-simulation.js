// node score-simulation.js

// https://www.reddit.com/r/HonkaiStarRail/comments/15f52to/relics_mainstats_and_substats_probability/

let rollValue = 5.1
let n = 5000

let experiments = [
    {part: 'Base', stat: 'N/A', percent: 100, mainIsSubstat: false},
    {part: 'Base', stat: 'N/A', percent: 100, mainIsSubstat: true},

    {part: 'Body', stat: 'HP_P', percent: 19.11, mainIsSubstat: true},
    {part: 'Body', stat: 'ATK_P', percent: 20.03, mainIsSubstat: true},
    {part: 'Body', stat: 'DEF_P', percent: 19.45, mainIsSubstat: true},
    {part: 'Body', stat: 'CR', percent: 10.84, mainIsSubstat: true},
    {part: 'Body', stat: 'CD', percent: 10.45, mainIsSubstat: true},
    {part: 'Body', stat: 'OHB', percent: 9.72, mainIsSubstat: false},
    {part: 'Body', stat: 'EHR', percent: 10.40, mainIsSubstat: true},

    {part: 'Feet', stat: 'HP_P', percent: 27.84, mainIsSubstat: true},
    {part: 'Feet', stat: 'ATK_P', percent: 30.06, mainIsSubstat: true},
    {part: 'Feet', stat: 'DEF_P', percent: 29.95, mainIsSubstat: true},
    {part: 'Feet', stat: 'SPD', percent: 12.15, mainIsSubstat: true},

    {part: 'PlanarSphere', stat: 'HP_P', percent: 11.79, mainIsSubstat: true},
    {part: 'PlanarSphere', stat: 'ATK_P', percent: 12.67, mainIsSubstat: true},
    {part: 'PlanarSphere', stat: 'DEF_P', percent: 11.68, mainIsSubstat: true},
    {part: 'PlanarSphere', stat: 'ELEM', percent: 9.12, mainIsSubstat: false},

    {part: 'LinkRope', stat: 'HP_P', percent: 27.29, mainIsSubstat: true},
    {part: 'LinkRope', stat: 'ATK_P', percent: 27.73, mainIsSubstat: true},
    {part: 'LinkRope', stat: 'DEF_P', percent: 23.60, mainIsSubstat: true},
    {part: 'LinkRope', stat: 'BE', percent: 15.68, mainIsSubstat: true},
    {part: 'LinkRope', stat: 'ERR', percent: 5.68, mainIsSubstat: false},
]


let baseMainIsSubstat = 0
let baseMainNotSubstat = 0

for (let exp of experiments) {
    let probability = exp.percent / 100
    let sumOfMaximums = 0

    for (let k = 0; k < n; k++) {
        let trialsMaximum = 0
        let inv = 1 / probability

        let trials = Math.floor(inv)
        if (Math.random() < (inv % 1)) {
            trials = Math.ceil(inv)
        }

        for (let j = 0; j < trials; j++) {
            let relicScore = 0
            let rolls = Math.random() < 0.779 ? 8 : 9
            for (let i = 0; i < rolls; i++) {
                if (exp.mainIsSubstat) {
                    // when the main is a substat
                    if (Math.random() > 4/11) continue
                } else {
                    // when the main isnt a substat // heal, elem, err
                    if (Math.random() > 5/12) continue
                }

                let rand = Math.random()
                if (rand <= 0.333333) {
                    relicScore += 1.0
                } else if (rand <= 0.666666) {
                    relicScore += 1.125
                } else {
                    relicScore += 1.25
                }
            }

            relicScore *= rollValue
            if (relicScore > trialsMaximum) trialsMaximum = relicScore
        }
        sumOfMaximums += trialsMaximum
    }

    let averageMaximum = sumOfMaximums / n

    if (exp.part == 'Base' && exp.mainIsSubstat == true) baseMainIsSubstat = averageMaximum
    if (exp.part == 'Base' && exp.mainIsSubstat == false) baseMainNotSubstat = averageMaximum

    let expBase = exp.mainIsSubstat ? baseMainIsSubstat : baseMainNotSubstat

    exp.results = {
        averageMaximum: averageMaximum,
        expBase: expBase,
        additionalScore: averageMaximum - expBase,
        additionalRolls: (averageMaximum - expBase) / rollValue
    }

    console.log(exp)
}
var min1 = Math.min(...experiments.filter(x => x.part != 'Base').map(x => x.results.additionalRolls));
var max1 = Math.max(...experiments.filter(x => x.part != 'Base').map(x => x.results.additionalRolls));

// Clamp to 1 -> 2 additional rolls
var min2 = 1
var max2 = 2
let generatedJson = {
    'Body': {},
    'Feet': {},
    'PlanarSphere': {},
    'LinkRope': {},
}
for (let exp of experiments) {
    let value = exp.results.additionalRolls

    const clampedValue = Math.min(Math.max(value, min1), max1);
    const normalizedValue = (clampedValue - min1) / (max1 - min1);
    const mappedValue = normalizedValue * (max2 - min2) + min2;

    console.log(exp.part, exp.stat, mappedValue.toFixed(3));

    if (exp.part != 'Base') {
        generatedJson[exp.part][exp.stat] = Math.floor(mappedValue * 1000)/1000
    }
}

console.log(JSON.stringify(generatedJson, null, 2))

/*
base-mainNotSubstat 0.000 1.000
base-mainIsSubstat 0.000 1.000
chest hp% 1.417 1.229
chest atk% 1.370 1.206
chest def% 1.406 1.224
chest cr 1.928 1.481
chest cd 1.972 1.503
chest ohb% 2.560 1.793
chest ehr 1.961 1.498
boots hp% 1.033 1.040
boots atk% 0.953 1.000
boots def% 0.960 1.003
boots spd 1.829 1.432
sphere hp% 1.860 1.448
sphere atk% 1.789 1.413
sphere def% 1.872 1.454
sphere elem 2.609 1.817
rope hp% 1.049 1.047
rope atk% 1.034 1.040
rope def% 1.210 1.127
rope be 1.597 1.318
rope err 2.980 2.000
*/