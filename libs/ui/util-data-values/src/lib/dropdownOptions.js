const ID = "id";
const NAME = "name";

export const formatDropdownList = (
  dropdowns = [],
  options = { value: ID, label: NAME },
) => {
  const { value, label } = options;
  return dropdowns.reduce((acc, item) => {
    return [...acc, { value: item[value], label: item[label] }];
  }, []);
};

export const formatList = (data) =>
  data?.map((item) => ({ value: item.name, label: item.name }));

export const getIntegerOptions = (
  lowerLimit,
  upperLimit,
  step,
  labelPrefix = "",
  labelSuffix = "",
) => {
  const dropdowns = [];
  for (let i = upperLimit; i >= lowerLimit; i -= step) {
    dropdowns.push({ value: i, label: `${labelPrefix}${i}${labelSuffix}` });
  }
  return dropdowns;
};

export const getRamOptions = (minSize, maxSize, increment) => {
  const options = [];
  for (let size = minSize; size <= maxSize; size += increment) {
    options.push({ value: `${size}GB`, label: `${size}GB` });
  }
  return options;
};
