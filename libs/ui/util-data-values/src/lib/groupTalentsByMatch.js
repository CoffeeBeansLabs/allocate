export const groupTalentsByMatch = (talents = [], initialMatches = {}) => {
  return talents.reduce((acc, item) => {
    return {
      ...acc,
      [item.matchPercent]: acc[item.matchPercent]
        ? !acc[item.matchPercent]?.some((accItem) => accItem.id === item.id)
          ? [...acc[item.matchPercent], item]
          : [...acc[item.matchPercent]]
        : [item],
    };
  }, initialMatches);
};
