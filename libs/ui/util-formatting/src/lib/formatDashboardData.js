export const removeDups = (arr) => {
  return [...new Set(arr)];
};

export const formatSkillDataset = (responseData) => {
  const labels = [];
  const dataValues = [];
  Object.keys(responseData).forEach((skillValue) => {
    const scoreCountList = Array(5).fill(0);
    Object.keys(responseData[skillValue]).forEach(
      (scoreValue) =>
        scoreValue != 0 &&
        (scoreCountList[scoreValue - 1] = responseData[skillValue][scoreValue]),
    );

    labels.push(skillValue);
    dataValues.push(scoreCountList);
  });
  return { labels, dataValues };
};

export const formatExperienceDataset = (responseData) => {
  const labels = [];
  const dataValues = [];
  Object.keys(responseData).forEach((key) => {
    const expCountList = Array(5).fill(0);
    const expRange = ["0-2", "2-5", "5-8", "8-12", "12+"];
    Object.keys(responseData[key]).forEach((rangeValue) => {
      const rangeIndex = expRange.indexOf(rangeValue);
      expCountList[rangeIndex] = responseData[key][rangeValue];
    });
    labels.push(key === "null" ? "None" : key);
    dataValues.push(expCountList);
  });
  return { labels, dataValues };
};

export const formatCountDataset = (responseData, label, value) => {
  const labels = responseData.map((data) => data[label]);
  const dataValues = responseData.map((data) => [data[value]]);
  return { labels, dataValues };
};

export const formatExperienceCountDataset = (responseData, dataKey) => {
  const labels = responseData.map((data) => data.name);
  const dataValues = responseData.map((data) => {
    const expCountList = Array.from({ length: 5 }, () => []);
    data?.[dataKey].map((position) => {
      const idx = position.positionCount >= 5 ? 4 : position.positionCount - 1;
      expCountList[idx].push({
        x: data.name,
        y: [position.experienceRangeStart, position.experienceRangeEnd],
      });
    });
    expCountList.map((countList, index) => {
      if (!countList.length) expCountList[index] = [{ x: data.name, y: null }];
    });
    return expCountList;
  });

  return { labels, dataValues };
};
