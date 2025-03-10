import {Relic, RelicGrade} from 'types/relic'
import {MainStats, Parts, SubStats} from "../../constants/constants";

export function scoreTbp(relic: Relic, weights: { [stat: string]: number }): number {
    let scoreToBeat = simpleSubstatScoreOfRelic(relic, weights);

    let pMain = probabilityOfCorrectSet()
        * probabilityOfCorrectSlot(relic.part)
        * probabilityOfCorrectStat(relic.part, relic.main.stat);

    let totalPSub = 0.0;

    for (let spread of substatGeneratorFromRelic(relic)) {
        let score = simpleSubstatScore(spread, weights);
        if (score > scoreToBeat) {
            let pSub = probabilityOfInitialSubstatCount(relic.grade, spread)
                * probabilityOfCorrectInitialSubs(relic.main.stat, spread)
                * probabilityOfExactUpgradePattern(spread);

            totalPSub += pSub;
        }
    }

    console.log(relic.part, scoreToBeat, totalPSub);

    let totalP = pMain * totalPSub;

    let estCount = 1 / totalP;
    let tbpPerRelic = 40 / 2.1;
    let estTbp = estCount * tbpPerRelic;
    let days = estTbp / 240;

    return days;
}

function simpleSubstatScoreOfRelic(relic: Relic, weights: { [stat: string]: number }): number {
    return simpleSubstatScore(relic.substats.flatMap(s => Array((s.addedRolls ?? 0) + 1).fill(s.stat)), weights)
}

function simpleSubstatScore(subs: Array<SubStats>, weights: { [stat: string]: number }): number {
    return subs.map(s => {
        let weight = (s in weights) ? weights[s] : 0;
        if (s == "ATK" || s == "DEF" || s == "HP")
            weight *= 0.4;
        return weight;
    })
        .reduce((a, b) => a + b)
}

export function* substatGeneratorFromRelic(relic: Relic): Generator<Array<SubStats>> {
    // e.g. a 5* relic can start with either 3 or 4 initial substats
    let maxInitialSubs = relic.grade - 1;
    let minInitialSubs = maxInitialSubs - 1;

    for (let initialCount = minInitialSubs; initialCount <= maxInitialSubs; initialCount++) {
        // we assume that all relics are upgraded to have the fourth substat unlocked, so we subtract
        // from the upgrade count and add to the initial count until the initial count is 4
        let upgradeCount = relic.grade - (4 - initialCount)
        yield* substatGenerator(relic.main.stat, 4, upgradeCount);
    }
}

export function* substatGenerator(main: MainStats, initialCount: number, upgradeCount: number): Generator<Array<SubStats>> {
    for (const possibleInitialSubs of combinations(SubStats.filter(sub => sub != main), initialCount)) {
        for (const upgradePattern of combinationsWithReplacement(possibleInitialSubs, upgradeCount)) {
            yield possibleInitialSubs.concat(upgradePattern);
        }
    }
}

export function probabilityOfCorrectStat(part: Parts, stat: MainStats): number {
    switch (part) {
        case "Head":
        case "Hands":
            return 1.0;
        case "Body":
            switch (stat) {
                case "HP%":
                case "ATK%":
                case "DEF%":
                    return 0.2;
                case "CRIT Rate":
                case "CRIT DMG":
                case "Effect Hit Rate":
                case "Outgoing Healing Boost":
                    return 0.1;
                default:
                    return 0;
            }
        case "Feet":
            switch (stat) {
                case "HP%":
                case "ATK%":
                case "DEF%":
                    return 0.3;
                case "SPD":
                    return 0.1;
                default:
                    return 0;
            }
        case "PlanarSphere":
            switch (stat) {
                case "HP%":
                case "ATK%":
                case "DEF%":
                    return 0.12;
                case "Physical DMG Boost":
                case "Fire DMG Boost":
                case "Ice DMG Boost":
                case "Lightning DMG Boost":
                case "Wind DMG Boost":
                case "Quantum DMG Boost":
                case "Imaginary DMG Boost":
                    return 0.65 / 7;
                default:
                    return 0;
            }
        case "LinkRope":
            switch (stat) {
                case "HP%":
                case "ATK%":
                case "DEF%":
                    return 0.8 / 3;
                case "Break Effect":
                    return 0.15;
                case "Energy Regeneration Rate":
                    return 0.05;
                default:
                    return 0;
            }
        default:
            console.error("undefined part")
            return 0;
    }
}

export function probabilityOfCorrectSet(): number {
    return 1 / 2;
}

export function probabilityOfCorrectSlot(part: Parts): number {
    switch (part) {
        case "Head":
        case "Hands":
        case "Body":
        case "Feet":
            return 1 / 4;
        case "PlanarSphere":
        case "LinkRope":
            return 1 / 2;
        default:
            console.error("unknown part");
            return 0;
    }
}

// source: https://docs.qq.com/sheet/DYkFxSVFNSGp5YlVv?tab=metuhj
export function substatLineWeight(sub: SubStats | MainStats): number {
    switch (sub) {
        case "HP%":
        case "ATK%":
        case "DEF%":
        case "HP":
        case "ATK":
        case "DEF":
            return 10;
        case "SPD":
            return 4;
        case "CRIT Rate":
        case "CRIT DMG":
            return 6;
        case "Effect Hit Rate":
        case "Effect RES":
        case "Break Effect":
            return 8;
        default:
            return 0;
    }
}

export function probabilityOfInitialSubstatCount(grade: RelicGrade, subs: Array<SubStats>): number {
    let max = grade * 2 - 1;
    if (subs.length == max) {
        return 0.2;
    } else {
        return 0.8;
    }
}

export function probabilityOfCorrectInitialSubs(main: MainStats, subs: Array<SubStats>): number {
    let totalP = 0.0;
    for (const perm of permutations(subs.slice(0, Math.min(4, subs.length)))) {
        let remainingWeight = 100.0 - substatLineWeight(main);
        let p = 1.0;

        for (const sub of perm) {
            let weight = substatLineWeight(sub);
            p *= weight / remainingWeight;
            remainingWeight -= weight;
        }

        totalP += p;
    }

    return totalP;
}

export function probabilityOfExactUpgradePattern(subs: Array<SubStats>) {
    let k = Math.max(0, subs.length - 4);
    let n = 4.0;
    return 1.0 / binomialCoefficient(n + k - 1, k);
}

// we only need the factorial up until n=5, so it's fine to use the trivial implementation
export function factorial(n: number): number {
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    return fact;
}

export function binomialCoefficient(n: number, k: number): number {
    return factorial(n) / (factorial(k) * factorial(n - k));
}


// https://gist.github.com/xuab/c96bd47769ec459b60db8da4e796a0ff
export function* permutations<T>(arr: Array<T>): Generator<Array<T>> {
    if (arr.length < 2) return yield arr
    const [first, ...rest] = arr
    for (let ps of permutations(rest))
        for (let i of arr.keys())
            yield [...ps.slice(0, i), first, ...ps.slice(i)]
}

// https://gist.github.com/xuab/c96bd47769ec459b60db8da4e796a0ff
// "kSubSets"
export function* combinations<T>(l: Array<T>, k: number): Generator<Array<T>> {
    if (k < 1) return yield []
    for (let [i, x] of l.entries())
        for (let set of combinations(l.slice(i + 1), k - 1))
            yield [x, ...set]
}

// modified myself from combinations()
export function* combinationsWithReplacement<T>(l: Array<T>, k: number): Generator<Array<T>> {
    if (k < 1) return yield []
    for (let [i, x] of l.entries())
        for (let set of combinationsWithReplacement(l.slice(i), k - 1))
            yield [x, ...set]
}