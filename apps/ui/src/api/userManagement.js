import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const getUserManagementList = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/user/user-management-view/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateUserGroup = async (payload) => {
  try {
    const response = await AuthenticatedAPI.put(`/user/edit-user-group/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getUserGroups = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/user/get-user-groups/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
