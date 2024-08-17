import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const getAllClients = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/clients/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createClient = async (clientPayload) => {
  try {
    const response = await AuthenticatedAPI.post(`/clients/`, clientPayload);
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getClientById = async (clientId) => {
  try {
    const response = await AuthenticatedAPI.get(`/clients/${clientId}/`);
    return Promise.resolve(response.data.client);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateClient = async (clientId, clientPayload) => {
  const url = `/clients/${clientId}/`;
  try {
    const response = await AuthenticatedAPI.put(url, clientPayload);
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
