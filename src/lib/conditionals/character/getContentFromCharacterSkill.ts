type SkillLevel = 10 | 12;

export default (skillLevel: SkillLevel, skill: string, skillRank: unknown): string => {
  let ret = '';

  skill.match(/#(\d+)\[\w+\]/g).forEach((token) => {
    // get params value
    token.match(/#(\d+)/).forEach((tokenPieces, i) => {
      if (i > 0) {
        // ["#4[i]", "4"]
        let value = skillRank[parseInt(tokenPieces) - 1];
        // change to percent
        if (value < 1) {
          value = Math.round(value * 100);
        }
        ret = ret.replace(token, value.toString());
      }
    });
  });

  return ret;
};