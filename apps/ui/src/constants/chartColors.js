const getColorsFromName = (colorName, alpha = 1) => {
  const root = document.querySelector(":root");
  const rootStyles = getComputedStyle(root);
  const hexColor = rootStyles.getPropertyValue(colorName);
  const hexMatch = hexColor.match(/\w\w/g);
  const [r, g, b] = hexMatch ? hexMatch.map((x) => parseInt(x, 16)) : [];
  return `rgba(${r},${g},${b},${alpha})`;
};

export default {
  genderSplit: [
    getColorsFromName("--color-BrightYellow"),
    getColorsFromName("--color-OceanGreen"),
  ],
  projectAllocation: [
    getColorsFromName("--color-Blueberry"),
    getColorsFromName("--color-SunsetOrange-1"),
  ],
  locationSplitColors: [
    getColorsFromName("--color-BrightYellow"),
    getColorsFromName("--color-Blueberry"),
    getColorsFromName("--color-SunsetOrange-1"),
  ],
};
