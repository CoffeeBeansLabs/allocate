export const blockInvalidNumberInput = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};
