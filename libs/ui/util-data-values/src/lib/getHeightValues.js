export const MAX_UTILIZATION = 100;

export const getHeightValues = (utilization, available = false) => {
  const maxHeight = 12;
  const height = (utilization * maxHeight) / MAX_UTILIZATION;

  let minHeight = 0;
  if (!available && utilization) {
    minHeight = 3;
  } else if (available && utilization) {
    minHeight = Math.min(height, maxHeight);
  } else if (!available && !utilization) {
    minHeight = maxHeight;
  }
  return {
    maxHeight,
    minHeight,
    height,
  };
};
