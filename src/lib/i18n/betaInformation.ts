import { InputLocale } from 'lib/i18n/generateTranslations'

export const betaInformation: betaInformation = {
  zh_CN: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: '缇宝',
          LongName: '缇宝',
        },
      },
      {
        id: 1404,
        value: {
          Name: '万敌',
          LongName: '万敌',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: '如果时间是一朵花',
        },
      },
      {
        id: 23039,
        value: {
          Name: '血火啊，燃烧前路',
        },
      },
      {
        id: 24005,
        value: {
          Name: '记忆永不落幕',
        },
      },
    ],
    RelicSets: [
      {
        id: 319,
        value: {
          Name: '谧宁拾骨地',
          Description2pc: '使装备者的生命上限提高 12% 。当装备者的生命上限大于等于 5000 点时，使装备者及其忆灵的暴击伤害提高 28% 。',
        },
      },
      {
        id: 320,
        value: {
          Name: '渊思寂虑的巨树',
          Description2pc: '使装备者的速度提高 6% 。当装备者的速度大于等于 135 / 180 时，使装备者及其忆灵的治疗量提高 12% / 20% 。',
        },
      },
    ],
  },
  en_US: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: 'Tribbie',
          LongName: 'Tribbie',
        },
      },
      {
        id: 1404,
        value: {
          Name: 'Mydei',
          LongName: 'Mydei',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: 'If Time Were a Flower',
        },
      },
      {
        id: 23039,
        value: {
          Name: 'Flame of Blood, Blaze My Path',
        },
      },
      {
        id: 24005,
        value: {
          Name: "Memory's Curtain Never Falls",
        },
      },
    ],
    RelicSets: [
      {
        id: 319,
        value: {
          Name: "Bone Collection's Serene Demesne",
          Description2pc: "Increases the wearer's Max HP by 12%. When the wearer's Max HP is 5000 or higher, increases the wearer's and their memosprite's CRIT DMG by 25%.",
        },
      },
      {
        id: 320,
        value: {
          Name: 'Giant Tree of Rapt Brooding',
          Description2pc: "The wearer's SPD increases by 6%. When the wearer's SPD is 135/180 or more, the wearer and their memosprite's Outgoing Healing is increased by 12%/20%.",
        },
      },
    ],
  },
  ja_JP: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: 'トリビー',
          LongName: 'トリビー',
        },
      },
      {
        id: 1404,
        value: {
          Name: 'モーディス',
          LongName: 'モーディス',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: 'もしも時が花だったら',
        },
      },
      {
        id: 23039,
        value: {
          Name: '前途燃やす血の如き炎',
        },
      },
      {
        id: 24005,
        value: {
          Name: '尽きぬ追憶',
        },
      },
    ],
    /* RelicSets: [
      {
        id: 319,
        value: {
          Name: '静謐な拾骨地',
          Description2pc: '装備キャラの最大HP+ 12% 。装備キャラの最大HPが 5000 以上の場合、装備キャラおよびその記憶の精霊の会心ダメージ+ 28% 。',
        },
      },
      {
        id: 320,
        value: {
          Name: '深慮に浸る巨樹',
          Description2pc: '装備キャラの会心率+ 6% 。装備キャラの会心率が 13500% 以上の時、付加ダメージ+ 18000% 。',
        },
      },
    ], */
  },
  ko_KR: {
    Characters: [
      {
        id: 1403,
        value: {
          Name: '트리비',
          LongName: '트리비',
        },
      },
      {
        id: 1404,
        value: {
          Name: '마이데이',
          LongName: '마이데이',
        },
      },
    ],
    Lightcones: [
      {
        id: 23038,
        value: {
          Name: '시간이 한 송이 꽃이라면',
        },
      },
      {
        id: 23039,
        value: {
          Name: '피의 불꽃이여, 앞길을 태워라',
        },
      },
      {
        id: 24005,
        value: {
          Name: '기억은 영원히 막을 내리지 않는다',
        },
      },
    ],
    /* RelicSets: [
      {
        id: 319,
        value: {
          Name: '고요한 습골지',
          Description2pc: '장착한 캐릭터의 HP 최대치가 12% 증가한다. 장착한 캐릭터의 HP 최대치가 5000 이상일 경우, 장착한 캐릭터 및 해당 기억 정령의 치명타 피해가 28% 증가한다',
        },
      },
      {
        id: 320,
        value: {
          Name: '사색하는 거목',
          Description2pc: '장착한 캐릭터의 치명타 확률이 6% 증가한다. 장착한 캐릭터의 현재 치명타 확률이 13500% 이상일 경우, 가하는 추가 피해가 18000% 증가한다',
        },
      },
    ], */
  },
}

type betaInformation = Partial<Record<InputLocale, { Characters: Character[]; Lightcones: LightCone[]; RelicSets?: RelicSet[] }>>
type Character = { id: number; value: { Name: string; LongName: string } }
type LightCone = { id: number; value: { Name: string } }
type RelicSet = { id: number; value: { Name: string; Description2pc: string; Description4pc?: string } }
