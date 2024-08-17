import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const getCafeReport = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/report/cafe/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getPotentialCafeReport = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/report/potential_cafe/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getLWDReport = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/report/last_working_day/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAnniversaryReport = async () => {
  try {
    const response = await AuthenticatedAPI.get("/report/anniversary/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getClientAllocationReport = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/report/client/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getLocationReport = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/report/location/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
