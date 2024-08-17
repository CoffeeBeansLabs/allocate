import AuthenticatedAPI, { BaseAPI } from "./API";

//Portal Access Form APIs

export const updatePermissions = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(
      "/user/add_user_groups_permission/",
      payload,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAllIndustries = async () => {
  try {
    const response = await AuthenticatedAPI.get("/common/industry/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAllUserIndustries = async () => {
  try {
    const response = await BaseAPI.get("/common/user_industry/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const addIndustry = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/common/industry/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const deleteIndustry = async (industryId) => {
  try {
    const response = await AuthenticatedAPI.delete(`/common/industry/${industryId}`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const addSkill = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/common/skill/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const deleteSkill = async (skillId) => {
  try {
    const response = await AuthenticatedAPI.delete(`/common/skill/${skillId}`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

//Form Authentication APIs

export const formPermission = async (payload) => {
  try {
    const response = await BaseAPI.post("/user/form_permission_auth/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

//User Skill, Industry and Experience APIs

export const getUserSkillsIndustries = async (userId) => {
  try {
    const response = await BaseAPI.get(`/user/skill_industry/${userId}/`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateUserSkillsIndustries = async (userId, payload) => {
  try {
    const response = await BaseAPI.post(`/user/skill_industry/${userId}/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateUserExperience = async (userId, payload) => {
  try {
    const response = await BaseAPI.post(`/user/edit_user_experience/${userId}/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
