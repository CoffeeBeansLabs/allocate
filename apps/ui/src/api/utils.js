export const cleanQueryParams = (params = {}) => {
  let cleanedQueryParams = {};
  for (let key in params) {
    if (params[key] || params[key] === false) {
      cleanedQueryParams[key] = params[key];
    }
  }
  return cleanedQueryParams;
};
