import { formatDuration } from "date-fns";

export const getKeyValuePair = (object = {}) => {
  /*
  Given a object, {firstName: 'John', lastName: 'Doe' }
  getKeyValuePair function returns,
    [
      {key: firstName, value: 'John'},
      {key: 'lastName', value: 'Doe'}
    ]
  */
  return Object.keys(object).map((entry) => ({
    key: entry,
    name: object[entry],
  }));
};

export const getObjectFromArray = (array = []) => {
  /*
    Given an array of objects, [
      {key: firstName, value: 'John'},
      {key: 'lastName', value: 'Doe'}
    ],
    getObjectFromArray returns {firstName: 'John', lastName: 'Doe' }
  */

  return array.reduce(
    (result, entry) => ({
      ...result,
      [entry.key]: entry.name,
    }),
    {},
  );
};

export const sortArrayOfObjects = (inputArray = [], options = {}) => {
  const { key, asc } = options;
  if (!inputArray || !key || !inputArray.length) return [];

  // if order is ascending.
  if (asc) return inputArray.sort((a, b) => a[key] - b[key]);

  // if order is descending.
  return [...inputArray].sort((a, b) => b[key] - a[key]);
};

export const formatMonths = (inputMonths) => {
  const years = parseInt(inputMonths / 12);
  const months = inputMonths % 12;

  return formatDuration({ years, months });
};

export const debounce = (func, delay = 500) => {
  let debounceTimer;

  return function () {
    const context = this;
    const args = arguments;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

export const debouncedPromise = (func, delay = 500) => {
  let debounceTimer;

  return function () {
    const context = this;
    const args = arguments;
    return new Promise((resolve, reject) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        (async () => {
          try {
            const response = await func.apply(context, args)();
            resolve(response);
          } catch (error) {
            reject(error);
          }
        })();
      }, delay);
    });
  };
};

function combineClassnames() {
  const input = arguments[0];
  const inputType = input.constructor.name;

  let output = null;
  const _this = this;
  switch (inputType) {
    case "String":
      output = input;
      break;
    case "Array":
      output = input.reduce(
        (acc, entry) => `${acc} ${combineClassnames.call(_this, entry)} `,
        "",
      );
      break;
    case "Object":
      output = Object.keys(input).reduce(
        (acc, entry) => `${acc} ${input[entry] ? _this[entry] || entry : ""}`,
        "",
      );
      break;
    default:
      break;
  }
  return output?.trim();
}

export { combineClassnames as cx };

export const isMobile = window.screen.width >= 320 && window.screen.width <= 768;

export const getIntegerValueFromString = (str) => {
  return parseInt(str.match(/\d+/)[0], 10);
};

export const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
