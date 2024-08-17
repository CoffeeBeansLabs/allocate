import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const quickSearch = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(`/search/quick-search/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const universalSearch = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get(`/search/universal-search/`, {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
