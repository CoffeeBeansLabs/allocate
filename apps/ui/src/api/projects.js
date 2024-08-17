import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

// Projects APIs

export const getProjects = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/projects/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createProject = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/projects/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const editProject = async (projectId, payload) => {
  try {
    const response = await AuthenticatedAPI.put(`/projects/${projectId}/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getProjectById = async (projectId) => {
  try {
    const response = await AuthenticatedAPI.get(`/projects/${projectId}/`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateProjectStatus = async (projectId, statusPayload) => {
  try {
    const response = await AuthenticatedAPI.patch(
      `/projects/${projectId}/`,
      statusPayload,
    );
    return Promise.resolve(response.response || response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateProject = async (projectId, statusPayload) => {
  try {
    const response = await AuthenticatedAPI.put(`/projects/${projectId}/`, statusPayload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Projects timeline APIs

export const getProjectTimeline = async (projectId, params = {}) => {
  try {
    const response = await AuthenticatedAPI.get(
      `/projects/${projectId}/project-timeline/`,
      {
        params: cleanQueryParams(params),
      },
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Project Positions APIs

export const deleteProjectRole = async (projectRoleId) => {
  try {
    const response = await AuthenticatedAPI.delete(
      `/projects/project-role/${projectRoleId}`,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createRolePosition = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/projects/positions/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateRolePosition = async (positionId, payload) => {
  try {
    const response = await AuthenticatedAPI.patch(
      `/projects/positions/${positionId}/`,
      payload,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const deleteRolePosition = async (positionId) => {
  try {
    const response = await AuthenticatedAPI.delete(`/projects/positions/${positionId}/`);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Project Allocations APIs

export const createAllocation = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(`/projects/allocation/`, payload);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createAllocationRequest = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(
      `/projects/allocation-request/`,
      payload,
    );
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const removeAllocationRequest = async (allocationRequestId) => {
  try {
    const response = await AuthenticatedAPI.delete(
      `/projects/allocation-request/${allocationRequestId}/`,
    );
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateAllocationRequestStatus = async (allocationRequestId, payload) => {
  try {
    const response = await AuthenticatedAPI.patch(
      `/projects/allocation-request/${allocationRequestId}/`,
      payload,
    );
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Project Talents search API

export const talentSearch = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get(`/search/talents/`, {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Project Manage Talent API

export const requestTalentChanges = async (allocationRequestId, payload) => {
  try {
    const response = await AuthenticatedAPI.put(
      `/projects/allocation-request/${allocationRequestId}/`,
      payload,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const makeTalentChanges = async (allocationId, payload) => {
  try {
    const response = await AuthenticatedAPI.put(
      `/projects/allocation/${allocationId}/`,
      payload,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Remove Talent API

export const removeTalent = async (allocationId) => {
  try {
    const response = await AuthenticatedAPI.delete(
      `/projects/allocation/${allocationId}/`,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

// Create Role API

export const createRole = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(`/user/create_role/`, payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
