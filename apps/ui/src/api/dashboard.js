import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const getDashboardData = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/dashboard/employees_detail/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getCurrentAllocationData = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/dashboard/current_allocation/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getCafeAndPotentialData = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/dashboard/cafe_and_potential/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getPeopleData = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/dashboard/people/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAnniversaries = async (month, year) => {
  try {
    const response = await AuthenticatedAPI.get(
      `/dashboard/anniversaries/${month}/${year}`,
    );
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getLWDEmployees = async (month, year) => {
  try {
    const response = await AuthenticatedAPI.get(
      `/dashboard/last_working_day/${month}/${year}`,
    );
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getClientAndProjectlData = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/dashboard/client_and_project/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
