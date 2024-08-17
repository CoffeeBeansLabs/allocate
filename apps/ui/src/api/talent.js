import AuthenticatedAPI from "./API";

export const getTalents = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/user/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getTalentById = async (talentId) => {
  try {
    const response = await AuthenticatedAPI.get(`/user/${talentId}/`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateTalent = async (talentId, payload) => {
  try {
    const response = await AuthenticatedAPI.patch(`/user/${talentId}/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const removeTalentLWD = async (talentId) => {
  try {
    const response = await AuthenticatedAPI.patch(`/user/remove_lwd/${talentId}/`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
