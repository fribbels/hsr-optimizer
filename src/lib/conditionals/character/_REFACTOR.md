# REFACTORING CHARACTER CONDITIONALS

1. fork working branch: from [https://github.com/cnojima/hsr-optimizer/tree/feature/22-improve-passives](https://github.com/cnojima/hsr-optimizer/tree/feature/22-improve-passives)

1. refactor/move 1 character-conditional controller code from `lib/characterConditionals.js` to `lib/conditionals/character/[CharName].tsx` (pls. notice file extension).
    - "character-conditional controller" is a function named for the char, e.g., `function jingliu() {...}`

1. copy import list from sample [`Jingliu.tsx`](https://github.com/cnojima/hsr-optimizer/blob/feature/22-passives-drawer/src/lib/conditionals/character/Jingliu.tsx) to the top of your new TSX file.

``` 
import { Stats } from 'lib/constants';
import {
  basic, skill, talent, ult,
  basicRev, skillRev, talentRev, ultRev,
} from "lib/conditionals/utils";
import { baseComputedStatsObject } from 'lib/conditionals/constants';

import { Eidolon } from 'types/Character';
import { Unknown } from 'types/Common';
import { CharacterConditional, ConditionalMap, ContentItem, Form } from 'types/CharacterConditional';

```

Some common/reused utils & constants live in `lib/conditionals/conditionalUtils.ts` & `lib/conditionals/optimizerTabConstants.ts`. Import from these dependenciese (DRY this out);

4. Refactor the `display()` function and extract the `content` array:

```
...
// create new array inside controller code:
const content: ContentItem[] = [{
  id: 'form_control_name',
  // depends on the control being refactored
  formItem: 'switch' | 'slider',
  title: 'Text shown as title in Popover',
  text: 'Short text shown as form control label',
  content: 'Long form description text that may need token substitution if the value depends on eidolon level, skill level, trace unlock',
  ... // add other values that are passed to the control as needed props
  prop1: function|string|number|boolean,
  prop2: function|string|number|boolean,
}];

// in the returned object, replace display() like below:
{
  ...
  display: () => <DisplayFormControl eidolon={e} content={content} />,
}
```

5. update typing for the functions - the existing types were inferred (badly) and are subject to change. Please refer to `Jingliu.tsx` for quick-reference.

6. add the line `export default [SnakeCaseName];` to the bottom of the new controller.

7. link the new controller to [`lib/characterConditionals.js`](https://github.com/cnojima/hsr-optimizer/blob/feature/22-improve-passives/src/lib/characterConditionals.js).  ***Please alpha-order in import order***:

```
...
import jingliu from 'lib/conditionals/character/Jingliu';
import xueyi from 'lib/conditionals/character/Xueyi';
import [lowercase] from 'lib/conditionals/character/[SnakeCase]';
...
```

8. test changes, confirm that values are expected and change on dependent changes (eid, stack levels, etc.)

9. PR back to source feature branch.

## Gotchas

Some characters Eidolon 3 & 5 have differing +2 levels for their respective Skills.

**The "standard" calcs (Jingliu, Dr. Ratio):**
*Eidolon 3:*

- Ult +2
- Basic +2

*Eidolon 5:*

- Talent +2
- Skill +2

**The Reversed calcs (Topaz, etc.):**
*Eidolon 3:*

- Talent +2
- Skill +2

*Eidolon 5:*

- Ult +2
- Basic +2

## e3/e5 +2 is not consistent char to char

| e3 skill/talent +2 | e3 ult/basic +2 |
|--------------------|-----------------|
| Argenti            | Misha           
| Arlan              |
| Asta               |
| Bailu              | Blade           
| Black Swan         |
| Clara              | Bronya          
| Dan Heng           | Dr. Ratio       
| DHIL               | Gepard          
| Fu Xuan            | Jingliu         |
| Guinaifen          | Jing Yuan       
| Hanya              | Huohuo          
| Herta              | March 7th       
| Himeko             | QQ              
| Hook               | Ruan Mei        
| Kafka              | Sushang         
| Luka               | Tingyun         
| Luocha             
| Lynx               
| Natasha            
| Pela               
| Sampo              
| Seele              
| Serval             
| Silver Wolf        
| Sparkle            
| Topaz              
| TB: Destruction    
| TB: Preservation   